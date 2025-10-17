/**
 * Streaming Tool Orchestrator
 *
 * Coordinates streaming responses with real-time tool execution
 */

import { OllamaClient, OllamaToolCall, OllamaTool } from '../ai/ollama-client.js';
import { ToolRegistry, ToolExecutionContext, ToolResult } from './types.js';
import { OllamaToolAdapter } from './ollama-adapter.js';
import { logger } from '../utils/logger.js';
import { normalizeError } from '../utils/error-utils.js';
import { TOOL_ORCHESTRATION_DEFAULTS, TOOL_LIMITS, CODE_ANALYSIS_CONSTANTS, STREAMING_CONSTANTS } from '../constants/tool-orchestration.js';
import { promptForApproval, ApprovalCache } from '../utils/approval-prompt.js';
import { truncateForLog, truncateForContext } from '../utils/text-utils.js';
import { safeParse } from '../utils/safe-json.js';

export interface Terminal {
  write(text: string): void;
  info(text: string): void;
  success(text: string): void;
  warn(text: string): void;
  error(text: string): void;
}

export interface StreamingToolOrchestratorConfig {
  enableToolCalling: boolean;
  maxToolsPerRequest: number;
  toolTimeout: number;
  requireApprovalForCategories?: string[];
  skipUnapprovedTools?: boolean;
}

interface CachedToolResult {
  result: ToolResult;
  timestamp: number;
}

export class StreamingToolOrchestrator {
  private config: StreamingToolOrchestratorConfig;
  private toolResults: Map<string, CachedToolResult> = new Map();
  private approvalCache: ApprovalCache = new ApprovalCache();
  private failedToolCalls: Map<string, number> = new Map(); // Track repeated failures
  private recentToolCalls: Map<string, number> = new Map(); // Track recent tool calls with timestamp
  private static readonly MAX_TOOL_RESULTS = TOOL_LIMITS.MAX_TOOL_RESULTS_CACHE;
  private static readonly MAX_FAILURE_COUNT = 2; // Max times to allow same failure
  private static readonly TOOL_CALL_DEDUP_TTL = 60000; // 60 seconds - don't retry same call within this time

  /**
   * Safely write to terminal with fallback
   */
  private safeTerminalWrite(text: string): void {
    try {
      if (this.terminal && typeof this.terminal.write === 'function') {
        this.terminal.write(text);
      } else {
        process.stdout.write(text);
      }
    } catch (error) {
      process.stdout.write(text);
    }
  }

  /**
   * Safely call terminal method with fallback
   */
  private safeTerminalCall(
    method: 'info' | 'success' | 'warn' | 'error',
    text: string
  ): void {
    try {
      if (this.terminal && typeof this.terminal[method] === 'function') {
        this.terminal[method](text);
      } else {
        const consoleMethods = {
          info: console.log,
          success: console.log,
          warn: console.warn,
          error: console.error
        };
        consoleMethods[method](text);
      }
    } catch (error) {
      console.log(text);
    }
  }

  constructor(
    private ollamaClient: OllamaClient,
    private toolRegistry: ToolRegistry,
    private terminal: Terminal,
    config?: Partial<StreamingToolOrchestratorConfig>
  ) {
    this.config = {
      enableToolCalling: TOOL_ORCHESTRATION_DEFAULTS.ENABLE_TOOL_CALLING,
      maxToolsPerRequest: TOOL_ORCHESTRATION_DEFAULTS.MAX_TOOLS_PER_REQUEST,
      toolTimeout: TOOL_ORCHESTRATION_DEFAULTS.TOOL_TIMEOUT,
      requireApprovalForCategories: [...TOOL_ORCHESTRATION_DEFAULTS.APPROVAL_REQUIRED_CATEGORIES],
      skipUnapprovedTools: TOOL_ORCHESTRATION_DEFAULTS.SKIP_UNAPPROVED_TOOLS,
      ...config
    };
  }

  /**
   * Execute with streaming and maintain conversation history
   * Used by interactive mode to maintain multi-turn conversations
   * FIXED: Now includes multi-turn loop to allow AI to recover from tool errors
   */
  async executeWithStreamingAndHistory(
    conversationHistory: any[],
    context: ToolExecutionContext,
    options?: {
      specificTools?: string[];
      categories?: string[];
      model?: string;
    }
  ): Promise<void> {
    if (!this.config.enableToolCalling) {
      this.safeTerminalCall('warn', 'Tool calling is disabled');
      return;
    }

    // Get available tools
    let tools: OllamaTool[];

    if (options?.specificTools) {
      tools = OllamaToolAdapter.getSpecificTools(this.toolRegistry, options.specificTools);
    } else if (options?.categories) {
      tools = [];
      for (const category of options.categories) {
        tools.push(...OllamaToolAdapter.getToolsByCategory(this.toolRegistry, category));
      }
    } else {
      tools = OllamaToolAdapter.getAllTools(this.toolRegistry);
    }

    logger.info('Starting streaming tool execution with history', {
      historyLength: conversationHistory.length,
      toolCount: tools.length,
      model: options?.model
    });

    // DEBUG: Log tools being sent
    logger.debug('Tools being sent to model:', {
      toolNames: tools.map(t => t.function.name),
      firstToolSample: tools[0] ? truncateForContext(JSON.stringify(tools[0])) : 'none'
    });

    // DEBUG: Log conversation history being sent
    logger.debug('Conversation history being sent:', {
      messageCount: conversationHistory.length,
      messages: conversationHistory.map(m => ({
        role: m.role,
        contentPreview: truncateForLog(m.content || ''),
        hasToolCalls: !!m.tool_calls
      }))
    });

    try {
      const { generateToolCallingSystemPrompt } = await import('../ai/prompts.js');
      const systemPrompt = generateToolCallingSystemPrompt();

      // FIXED: Add multi-turn loop to allow AI to recover from tool errors
      let conversationComplete = false;
      let totalToolCalls = 0;
      const maxTurns = STREAMING_CONSTANTS.MAX_CONVERSATION_TURNS;
      let turnCount = 0;
      let consecutiveFailures = 0; // Track consecutive tool failures
      const maxConsecutiveFailures = 3; // Stop if too many failures in a row

      while (!conversationComplete && turnCount < maxTurns) {
        turnCount++;
        logger.debug(`Conversation turn ${turnCount}`);

        // Process single turn with conversation history
        const turnToolCalls: OllamaToolCall[] = [];
        let assistantMessage: any = { role: 'assistant', content: '' };

        // Track synthetic tool calls to prevent duplicates
        const processedSyntheticCalls = new Set<string>();
        const syntheticToolCallPromises: Promise<any>[] = [];
        let lastProcessedPosition = 0; // Track where we've parsed up to
        let parseAttempts = 0; // Track parse attempts to prevent infinite loops
        const maxParseAttempts = STREAMING_CONSTANTS.MAX_STREAMING_PARSE_ATTEMPTS;

        await this.ollamaClient.completeStreamWithTools(
          conversationHistory,
          tools,
          {
            model: options?.model,
            system: systemPrompt
          },
          {
            onContent: (chunk: string) => {
              // Detect if this chunk is part of a JSON tool call
              // Only show JSON if LOG_LEVEL=debug
              const isDebugMode = process.env.LOG_LEVEL === 'debug';
              const looksLikeJson = chunk.trim().match(/^[{\s]*"?(name|arguments)"?[\s:]/);

              // Hide JSON tool calls in normal mode
              if (!isDebugMode && looksLikeJson) {
                // Suppress JSON output, will show as formatted tool execution instead
                assistantMessage.content += chunk;
                return;
              }

              this.safeTerminalWrite(chunk);
              assistantMessage.content += chunk;

              // WORKAROUND: Some models output tool calls as JSON in content
              // Try to detect and parse them
              // Check if we have both fields anywhere in the accumulated content
              const hasName = assistantMessage.content.includes('"name"');
              const hasArguments = assistantMessage.content.includes('"arguments"');

              if (hasName && hasArguments) {
                try {
                  // Try to extract JSON objects from the accumulated content
                  // We need to find all complete JSON objects, not just the first one
                  const content = assistantMessage.content;

                  // Start searching from where we left off
                  let searchFrom = lastProcessedPosition;

                  // Find the next { starting from our last position
                  const startIndex = content.indexOf('{', searchFrom);
                  if (startIndex === -1) {
                    return; // No JSON object found
                  }

                  // Try to parse from this position
                  const jsonCandidate = content.substring(startIndex);

                  const toolCallData = safeParse<{ name?: string; arguments?: any }>(jsonCandidate);

                  if (toolCallData && toolCallData.name && toolCallData.arguments) {
                    // Reset parse attempts on successful parse
                    parseAttempts = 0;
                      // Create a unique key to prevent duplicate processing
                      const callKey = `${toolCallData.name}-${JSON.stringify(toolCallData.arguments)}`;

                      if (!processedSyntheticCalls.has(callKey)) {
                        processedSyntheticCalls.add(callKey);
                        totalToolCalls++;

                        logger.debug('Detected tool call in content, converting to tool call', toolCallData);

                        // Update our position to skip past this JSON object
                        // Find the actual end position by counting braces in the original content
                        let braceCount = 0;
                        let endPos = startIndex;
                        let inString = false;
                        let escaped = false;

                        for (let i = startIndex; i < content.length; i++) {
                          const char = content[i];

                          if (escaped) {
                            escaped = false;
                            continue;
                          }

                          if (char === '\\') {
                            escaped = true;
                            continue;
                          }

                          if (char === '"') {
                            inString = !inString;
                            continue;
                          }

                          if (!inString) {
                            if (char === '{') braceCount++;
                            if (char === '}') {
                              braceCount--;
                              if (braceCount === 0) {
                                endPos = i + 1;
                                break;
                              }
                            }
                          }
                        }

                        lastProcessedPosition = endPos;

                        // Create a synthetic tool call
                        const syntheticToolCall: any = {
                          id: `${toolCallData.name}-${Date.now()}-${totalToolCalls}`,
                          function: {
                            name: toolCallData.name,
                            arguments: toolCallData.arguments
                          }
                        };

                        // Add to turn tool calls
                        turnToolCalls.push(syntheticToolCall);

                        // Execute it and track the promise
                        const executePromise = this.executeToolCall(syntheticToolCall, context)
                          .then(result => {
                            logger.debug('Synthetic tool call executed', {
                              name: toolCallData.name,
                              success: result.success
                            });
                            return result;
                          })
                          .catch(err => {
                            logger.error('Synthetic tool call failed', err);
                            return { success: false, error: err.message };
                          });

                        syntheticToolCallPromises.push(executePromise);
                      }
                  }
                } catch (e) {
                  // Not valid JSON yet, this is expected during streaming
                  // Increment parse attempts only on failure
                  parseAttempts++;
                  if (parseAttempts > maxParseAttempts) {
                    logger.warn('Exceeded maximum JSON parse attempts in streaming content', {
                      attempts: parseAttempts,
                      contentLength: assistantMessage.content.length,
                      error: e instanceof Error ? e.message : String(e)
                    });
                    // Don't return - just stop trying to parse for this turn
                    parseAttempts = 0; // Reset for next turn
                  }
                  // Silent ignore - will retry on next chunk
                }
              }
            },

            onToolCall: async (toolCall: OllamaToolCall) => {
              totalToolCalls++;

              logger.debug('onToolCall callback invoked', {
                toolName: toolCall.function.name,
                count: totalToolCalls
              });

              if (totalToolCalls > this.config.maxToolsPerRequest) {
                const errorMsg = `Exceeded maximum tool calls (${this.config.maxToolsPerRequest})`;
                this.safeTerminalCall('error', errorMsg);
                throw new Error(errorMsg);
              }

              if (!toolCall.id) {
                toolCall.id = `${toolCall.function.name}-${Date.now()}-${totalToolCalls}`;
              }

              turnToolCalls.push(toolCall);

              const result = await this.executeToolCall(toolCall, context);
              return result;
            },

            onComplete: () => {
              logger.debug('Turn completed');
            },

            onError: (error: Error) => {
              logger.error('Streaming tool execution error', error);
              this.safeTerminalCall('error', `Error: ${error.message}`);
            }
          }
        );

        // Wait for all synthetic tool calls to complete
        if (syntheticToolCallPromises.length > 0) {
          logger.debug(`Waiting for ${syntheticToolCallPromises.length} synthetic tool calls to complete`);
          await Promise.all(syntheticToolCallPromises);
          logger.debug('All synthetic tool calls completed');
        }

        // If there were tool calls, add assistant message and tool results to conversation
        if (turnToolCalls.length > 0) {
          // Update conversation history with assistant's response
          assistantMessage.tool_calls = turnToolCalls;
          conversationHistory.push(assistantMessage);

          // Add tool results as separate messages with recovery suggestions
          for (const toolCall of turnToolCalls) {
            const callId = toolCall.id || `${toolCall.function.name}-${Date.now()}`;
            const cached = this.toolResults.get(callId);
            const result = cached?.result;

            // Format result in a clear, readable way for the model
            let resultContent: string;
            if (result && result.success) {
              // Success case - provide clear, unambiguous confirmation
              const toolName = toolCall.function.name;

              // Clear failure count on success
              const failureKey = `${toolName}:${JSON.stringify(toolCall.function.arguments)}`;
              this.failedToolCalls.delete(failureKey);

              if (toolName === 'filesystem' && result.data && result.data.path) {
                // Filesystem operations - be very explicit
                const operation = (toolCall.function.arguments as any)?.operation || 'operation';
                resultContent = `Tool execution successful. The ${operation} operation completed successfully. File: ${result.data.path}, Size: ${result.data.size} bytes.`;
              } else if (result.data) {
                resultContent = `Tool execution successful. Result: ${JSON.stringify(result.data)}`;
              } else {
                resultContent = 'Tool execution successful. Operation completed.';
              }
            } else if (result && result.error) {
              // Error case - provide clear error message with recovery suggestion
              const toolName = toolCall.function.name;

              // Track repeated failures
              const failureKey = `${toolName}:${JSON.stringify(toolCall.function.arguments)}`;
              const failCount = (this.failedToolCalls.get(failureKey) || 0) + 1;
              this.failedToolCalls.set(failureKey, failCount);

              // Add specific recovery suggestions for common errors
              let recoverySuggestion = '';
              if (toolName === 'advanced-code-analysis' && result.error.includes('does not exist')) {
                recoverySuggestion = ' To create the file or directory first, call the filesystem tool with operation "write" (for files with content) or "create" (for directories).';
              }

              // Warn about repeated failures
              if (failCount >= StreamingToolOrchestrator.MAX_FAILURE_COUNT) {
                recoverySuggestion += ` WARNING: This same tool call has failed ${failCount} times. Try a different approach instead of retrying the same operation.`;
              }

              resultContent = `Tool execution failed. Error: ${result.error}${recoverySuggestion}`;
            } else {
              // Unknown case
              resultContent = result ? JSON.stringify(result) : 'Tool execution failed with unknown error';
            }

            conversationHistory.push({
              role: 'tool',
              content: resultContent
            });

            logger.debug('Added tool result to conversation', {
              toolName: toolCall.function.name,
              success: result?.success,
              resultPreview: truncateForLog(resultContent)
            });

            // Track consecutive failures
            if (result && !result.success) {
              consecutiveFailures++;
            } else if (result && result.success) {
              consecutiveFailures = 0; // Reset on success
            }
          }

          // Check for too many consecutive failures
          if (consecutiveFailures >= maxConsecutiveFailures) {
            logger.warn(`Too many consecutive tool failures (${consecutiveFailures}), ending conversation`);
            this.safeTerminalCall('warn', `⚠️  Multiple consecutive tool failures detected. Ending conversation to prevent loops.`);
            conversationComplete = true;
          } else {
            // Continue the conversation - AI will get a chance to see the tool results and respond
            conversationComplete = false;
          }
        } else {
          // No tool calls means conversation is complete
          conversationComplete = true;
        }
      }

      if (turnCount >= maxTurns) {
        logger.warn('Conversation reached maximum turn limit');
        this.safeTerminalCall('warn', 'Reached maximum conversation turns');
      }

      logger.info('Streaming tool execution completed', {
        totalToolCalls,
        resultsCount: this.toolResults.size,
        turns: turnCount
      });

    } catch (error) {
      const normalizedError = normalizeError(error);
      logger.error('executeWithStreamingAndHistory failed', normalizedError);
      this.safeTerminalCall('error', `Failed to execute: ${normalizedError.message}`);
      throw error;
    }
  }

  /**
   * Execute a user prompt with streaming tool calling
   * Implements multi-turn conversation to handle tool results
   */
  async executeWithStreaming(
    userPrompt: string,
    context: ToolExecutionContext,
    options?: {
      specificTools?: string[];
      categories?: string[];
      model?: string;
    }
  ): Promise<void> {
    if (!this.config.enableToolCalling) {
      // Fallback to regular streaming without tools
      this.safeTerminalCall('warn', 'Tool calling is disabled');
      return;
    }

    // Get available tools
    let tools: OllamaTool[];

    if (options?.specificTools) {
      tools = OllamaToolAdapter.getSpecificTools(
        this.toolRegistry,
        options.specificTools
      );
    } else if (options?.categories) {
      tools = [];
      for (const category of options.categories) {
        tools.push(...OllamaToolAdapter.getToolsByCategory(this.toolRegistry, category));
      }
    } else {
      // Get all available tools
      tools = OllamaToolAdapter.getAllTools(this.toolRegistry);
    }

    logger.info('Starting streaming tool execution', {
      prompt: truncateForLog(userPrompt),
      toolCount: tools.length,
      model: options?.model
    });

    // Reset tool results
    this.toolResults.clear();

    try {
      // Import the tool-calling system prompt
      const { generateToolCallingSystemPrompt } = await import('../ai/prompts.js');
      const systemPrompt = generateToolCallingSystemPrompt();

      // Debug logging
      logger.debug('System prompt being sent:', {
        promptLength: systemPrompt.length,
        preview: truncateForLog(systemPrompt)
      });
      logger.debug('Tools being sent:', {
        toolNames: tools.map(t => t.function.name),
        toolCount: tools.length
      });

      // Initialize conversation with few-shot examples and user message
      const messages: any[] = [
        // Few-shot example 1: Demonstrate CORRECT file creation with filesystem tool
        {
          role: 'user',
          content: 'Create a file called hello.txt with content "Hello World"'
        },
        {
          role: 'assistant',
          content: '',
          tool_calls: [{
            function: {
              name: 'filesystem',
              arguments: {
                operation: 'write',
                path: 'hello.txt',
                content: 'Hello World'
              }
            }
          }]
        },
        {
          role: 'tool',
          content: 'Tool execution successful. The write operation completed successfully. File: hello.txt, Size: 11 bytes.'
        },
        {
          role: 'assistant',
          content: 'I created hello.txt with the content "Hello World".'
        },
        // Few-shot example 2: Demonstrate creating a code file (CORRECT way)
        {
          role: 'user',
          content: 'Create a server.js file with Express code'
        },
        {
          role: 'assistant',
          content: '',
          tool_calls: [{
            function: {
              name: 'filesystem',
              arguments: {
                operation: 'write',
                path: 'server.js',
                content: 'const express = require("express");\nconst app = express();\nconst port = 3000;\n\napp.listen(port, () => console.log(`Server running on port ${port}`));'
              }
            }
          }]
        },
        {
          role: 'tool',
          content: 'Tool execution successful. The write operation completed successfully. File: server.js, Size: 150 bytes.'
        },
        {
          role: 'assistant',
          content: 'I created server.js with the Express server code.'
        },
        // Now the actual user request
        { role: 'user', content: userPrompt }
      ];

      // Multi-turn conversation loop for tool calling
      let conversationComplete = false;
      let toolCallCount = 0;
      const maxTurns = STREAMING_CONSTANTS.MAX_CONVERSATION_TURNS;
      let turnCount = 0;
      let consecutiveFailures = 0; // Track consecutive tool failures
      const maxConsecutiveFailures = 3; // Stop if too many failures in a row

      while (!conversationComplete && turnCount < maxTurns) {
        turnCount++;
        logger.debug(`Conversation turn ${turnCount}`);

        // Collect tool calls and content from this turn
        const turnToolCalls: OllamaToolCall[] = [];
        let assistantMessage: any = { role: 'assistant', content: '' };

        // Make API request (system prompt in options, not messages)
        await this.ollamaClient.completeStreamWithTools(
          messages,
          tools,
          {
            model: options?.model,
            system: systemPrompt
          },
          {
            onContent: (chunk: string) => {
              // Stream AI response to terminal
              this.safeTerminalWrite(chunk);
              assistantMessage.content += chunk;
            },

            onToolCall: async (toolCall: OllamaToolCall) => {
              // Check tool call limit
              toolCallCount++;
              if (toolCallCount > this.config.maxToolsPerRequest) {
                const errorMsg = `Exceeded maximum tool calls (${this.config.maxToolsPerRequest})`;
                this.safeTerminalCall('error', errorMsg);
                throw new Error(errorMsg);
              }

              // Generate a consistent ID for this tool call
              if (!toolCall.id) {
                toolCall.id = `${toolCall.function.name}-${Date.now()}-${toolCallCount}`;
              }

              // Store tool call for this turn
              turnToolCalls.push(toolCall);

              // Execute the tool
              const result = await this.executeToolCall(toolCall, context);
              return result;
            },

            onComplete: () => {
              logger.debug('Turn completed');
            },

            onError: (error: Error) => {
              logger.error('Streaming tool execution error', error);
              this.safeTerminalCall('error', `Error: ${error.message}`);
            }
          }
        );

        // If there were tool calls, add assistant message and tool results to conversation
        if (turnToolCalls.length > 0) {
          // Add assistant's message with tool calls
          assistantMessage.tool_calls = turnToolCalls;
          messages.push(assistantMessage);

          // Add tool results as separate messages
          for (const toolCall of turnToolCalls) {
            const callId = toolCall.id || `${toolCall.function.name}-${Date.now()}`;
            const cached = this.toolResults.get(callId);
            const result = cached?.result;

            // Format result in a clear, readable way for the model
            let resultContent: string;
            if (result && result.success) {
              // Success case - provide clear, unambiguous confirmation
              const toolName = toolCall.function.name;

              // Clear failure count on success
              const failureKey = `${toolName}:${JSON.stringify(toolCall.function.arguments)}`;
              this.failedToolCalls.delete(failureKey);

              if (toolName === 'filesystem' && result.data && result.data.path) {
                // Filesystem operations - be very explicit
                const operation = (toolCall.function.arguments as any)?.operation || 'operation';
                resultContent = `Tool execution successful. The ${operation} operation completed successfully. File: ${result.data.path}, Size: ${result.data.size} bytes.`;
              } else if (result.data) {
                resultContent = `Tool execution successful. Result: ${JSON.stringify(result.data)}`;
              } else {
                resultContent = 'Tool execution successful. Operation completed.';
              }
            } else if (result && result.error) {
              // Error case - provide clear error message with recovery suggestion
              const toolName = toolCall.function.name;

              // Track repeated failures
              const failureKey = `${toolName}:${JSON.stringify(toolCall.function.arguments)}`;
              const failCount = (this.failedToolCalls.get(failureKey) || 0) + 1;
              this.failedToolCalls.set(failureKey, failCount);

              // Add specific recovery suggestions for common errors
              let recoverySuggestion = '';
              if (toolName === 'advanced-code-analysis' && result.error.includes('does not exist')) {
                recoverySuggestion = ' To create the file or directory first, call the filesystem tool with operation "write" (for files with content) or "create" (for directories).';
              }

              // Warn about repeated failures
              if (failCount >= StreamingToolOrchestrator.MAX_FAILURE_COUNT) {
                recoverySuggestion += ` WARNING: This same tool call has failed ${failCount} times. Try a different approach instead of retrying the same operation.`;
              }

              resultContent = `Tool execution failed. Error: ${result.error}${recoverySuggestion}`;
            } else {
              // Unknown case
              resultContent = result ? JSON.stringify(result) : 'Tool execution failed with unknown error';
            }

            const toolResultMessage = {
              role: 'tool',
              content: resultContent
            };

            messages.push(toolResultMessage);
            logger.debug('Added tool result to conversation', {
              toolName: toolCall.function.name,
              success: result?.success,
              resultPreview: truncateForLog(resultContent)
            });

            // Track consecutive failures
            if (result && !result.success) {
              consecutiveFailures++;
            } else if (result && result.success) {
              consecutiveFailures = 0; // Reset on success
            }
          }

          // Check for too many consecutive failures
          if (consecutiveFailures >= maxConsecutiveFailures) {
            logger.warn(`Too many consecutive tool failures (${consecutiveFailures}), ending conversation`);
            this.safeTerminalCall('warn', `⚠️  Multiple consecutive tool failures detected. Ending conversation to prevent loops.`);
            conversationComplete = true;
          } else {
            // Continue the conversation with tool results
            conversationComplete = false;
          }
        } else {
          // No tool calls means conversation is complete
          conversationComplete = true;
          logger.info('Streaming tool execution completed', {
            toolCallCount,
            resultsCount: this.toolResults.size,
            turns: turnCount
          });
        }
      }

      if (turnCount >= maxTurns) {
        logger.warn('Conversation reached maximum turn limit');
        this.safeTerminalCall('warn', 'Reached maximum conversation turns');
      }

    } catch (error) {
      const normalizedError = normalizeError(error);
      logger.error('executeWithStreaming failed', normalizedError);
      this.safeTerminalCall('error', `Failed to execute: ${normalizedError.message}`);
      throw error;
    }
  }

  /**
   * Execute a single tool call
   */
  private async executeToolCall(
    toolCall: OllamaToolCall,
    context: ToolExecutionContext
  ): Promise<any> {
    const toolName = toolCall.function.name;
    const tool = this.toolRegistry.get(toolName);

    if (!tool) {
      const errorMsg = `Tool not found: ${toolName}`;
      this.safeTerminalCall('error', `✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Parse arguments first (needed for approval prompt and deduplication)
    let parameters: Record<string, any> = {};
    try {
      // Handle both string and object arguments
      if (typeof toolCall.function.arguments === 'string') {
        const parsed = safeParse<Record<string, any>>(toolCall.function.arguments, {});
        parameters = parsed || {};
      } else if (typeof toolCall.function.arguments === 'object') {
        parameters = toolCall.function.arguments;
      }

      logger.debug('Parsed tool parameters:', {
        toolName,
        parameters
      });
    } catch (parseError) {
      logger.error('Failed to parse tool arguments', {
        toolName,
        arguments: toolCall.function.arguments,
        error: parseError
      });

      // Return error instead of continuing with empty parameters
      this.safeTerminalCall('error', `Failed to parse arguments for ${toolName}`);
      return {
        success: false,
        error: `Failed to parse tool arguments: ${parseError}`
      };
    }

    // Check for duplicate tool calls (same tool with same parameters within TTL)
    const callSignature = `${toolName}:${JSON.stringify(parameters)}`;
    const now = Date.now();
    const lastCallTime = this.recentToolCalls.get(callSignature);

    if (lastCallTime && (now - lastCallTime) < StreamingToolOrchestrator.TOOL_CALL_DEDUP_TTL) {
      const timeSinceLastCall = Math.round((now - lastCallTime) / 1000);
      this.safeTerminalCall('warn', `⚠️  Skipping duplicate tool call: ${toolName} (same call made ${timeSinceLastCall}s ago)`);
      logger.warn('Duplicate tool call detected', {
        toolName,
        parameters,
        timeSinceLastCall
      });
      return {
        success: false,
        error: `This exact tool call was already attempted ${timeSinceLastCall} seconds ago. Try a different approach instead of retrying the same operation.`
      };
    }

    // Record this tool call
    this.recentToolCalls.set(callSignature, now);

    // Cleanup old entries (simple TTL-based cleanup)
    for (const [sig, timestamp] of this.recentToolCalls.entries()) {
      if (now - timestamp > StreamingToolOrchestrator.TOOL_CALL_DEDUP_TTL) {
        this.recentToolCalls.delete(sig);
      }
    }

    // Check if approval is required
    if (this.requiresApproval(tool.metadata.category)) {
      // Check approval cache first
      const cachedApproval = this.approvalCache.isApproved(toolName, tool.metadata.category);

      if (cachedApproval === false) {
        this.safeTerminalCall('info', `  Skipping ${toolName} - previously denied`);
        return { approved: false, skipped: true };
      }

      if (cachedApproval !== true) {
        // Not cached, need to prompt user
        if (this.config.skipUnapprovedTools) {
          this.safeTerminalCall('info', `  Skipping ${toolName} - approval required but auto-skip enabled`);
          return { approved: false, skipped: true };
        }

        // Prompt for approval with timeout to prevent hanging
        try {
          const APPROVAL_TIMEOUT = 60000; // 60 seconds
          let timeoutId: NodeJS.Timeout | undefined;

          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Approval prompt timed out after ${APPROVAL_TIMEOUT / 1000} seconds`));
            }, APPROVAL_TIMEOUT);
          });

          const approvalPromise = promptForApproval({
            toolName,
            category: tool.metadata.category,
            description: tool.metadata.description,
            parameters,
            defaultResponse: 'no'
          });

          let result;
          try {
            result = await Promise.race([approvalPromise, timeoutPromise]);

            // Clear timeout after successful approval
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          } finally {
            // Ensure timeout is always cleared
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          }

          // Cache the decision
          this.approvalCache.setApproval(toolName, tool.metadata.category, result.approved);

          if (!result.approved) {
            this.safeTerminalCall('info', `  User denied execution of ${toolName}`);
            return { approved: false, skipped: true };
          }

          this.safeTerminalCall('success', `  User approved execution of ${toolName}`);
        } catch (promptError) {
          const errorMsg = promptError instanceof Error ? promptError.message : String(promptError);
          logger.error('Approval prompt failed', promptError);
          this.safeTerminalCall('error', `  Failed to get approval for ${toolName}: ${errorMsg}`);
          return { approved: false, skipped: true };
        }
      } else {
        this.safeTerminalCall('info', `  Using cached approval for ${toolName}`);
      }
    }

    // Show execution start - format differently for debug vs normal mode
    const isDebugMode = process.env.LOG_LEVEL === 'debug';
    if (isDebugMode) {
      // Debug mode: show tool name and parameters
      this.safeTerminalCall('info', `🔧 Tool Call: ${toolName}`);
      this.safeTerminalCall('info', JSON.stringify(parameters, null, 2));
      this.safeTerminalCall('info', `🔧 Executing: ${toolName}`);
    } else {
      // Normal mode: show clean, readable execution message
      if (toolName === 'execution' && parameters.command) {
        this.safeTerminalCall('info', `🔧 Running: ${parameters.command}`);
      } else if (toolName === 'filesystem' && parameters.operation && parameters.path) {
        const operation = parameters.operation;
        const path = parameters.path;
        if (operation === 'write') {
          this.safeTerminalCall('info', `🔧 Creating file: ${path}`);
        } else if (operation === 'read') {
          this.safeTerminalCall('info', `🔧 Reading file: ${path}`);
        } else if (operation === 'create') {
          this.safeTerminalCall('info', `🔧 Creating directory: ${path}`);
        } else {
          this.safeTerminalCall('info', `🔧 ${operation}: ${path}`);
        }
      } else {
        this.safeTerminalCall('info', `🔧 Executing: ${toolName}`);
      }
    }

    try {

      // Validate parameters
      if (!tool.validateParameters(parameters)) {
        throw new Error(`Invalid parameters for tool: ${toolName}`);
      }

      // Execute with timeout and measure execution time
      const startTime = Date.now();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Tool execution timeout (${this.config.toolTimeout}ms)`)),
          this.config.toolTimeout
        )
      );

      const result: ToolResult = await Promise.race([
        tool.execute(parameters, context),
        timeoutPromise
      ]);

      const executionTime = Math.round((Date.now() - startTime) / 1000);

      // Store result with bounds checking
      const callId = toolCall.id || `${toolName}-${Date.now()}`;
      this.addToolResult(callId, result);

      // Show result with execution time
      if (result.success) {
        if (isDebugMode) {
          this.safeTerminalCall('success', `✓ ${toolName} completed`);
        } else {
          // Show execution time for long-running commands
          if (executionTime > 5) {
            this.safeTerminalCall('success', `✓ completed (${executionTime}s)`);
          } else {
            this.safeTerminalCall('success', `✓ completed`);
          }
        }

        // Show command output if tool has displayOutput flag
        if (tool.metadata.displayOutput && result.data) {
          if (result.data.stdout) {
            this.safeTerminalCall('info', `\n${result.data.stdout}`);
          }
          if (result.data.stderr) {
            this.safeTerminalCall('warn', `stderr: ${result.data.stderr}`);
          }
        }

        if (result.metadata?.warnings && result.metadata.warnings.length > 0) {
          for (const warning of result.metadata.warnings) {
            this.safeTerminalCall('warn', `  ⚠️  ${warning}`);
          }
        }
      } else {
        this.safeTerminalCall('error', `✗ ${toolName} failed: ${result.error}`);
      }

      return result;

    } catch (error) {
      const normalizedError = normalizeError(error);
      logger.error(`Tool execution failed: ${toolName}`, normalizedError);
      this.safeTerminalCall('error', `✗ ${toolName} failed: ${normalizedError.message}`);

      const failureResult: ToolResult = {
        success: false,
        error: normalizedError.message
      };

      // Store the failure result
      const callId = `${toolName}-${Date.now()}-failed`;
      this.addToolResult(callId, failureResult);

      return failureResult;
    }
  }

  /**
   * Add tool result with bounds checking to prevent memory leaks
   */
  /**
   * Clean up old tool results based on TTL
   */
  private cleanupOldResults(): void {
    const now = Date.now();
    const ttl = CODE_ANALYSIS_CONSTANTS.TOOL_RESULT_TTL;

    for (const [callId, cached] of this.toolResults.entries()) {
      if (now - cached.timestamp > ttl) {
        this.toolResults.delete(callId);
        logger.debug('Evicted expired tool result', { callId, age: now - cached.timestamp });
      }
    }
  }

  private addToolResult(callId: string, result: ToolResult): void {
    // Hard limit check first - evict using LRU strategy instead of FIFO
    while (this.toolResults.size >= StreamingToolOrchestrator.MAX_TOOL_RESULTS) {
      // Find least recently used entry (oldest timestamp)
      let lruKey: string | null = null;
      let oldestTime = Date.now();

      for (const [key, cached] of this.toolResults.entries()) {
        if (cached.timestamp < oldestTime) {
          oldestTime = cached.timestamp;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.toolResults.delete(lruKey);
        logger.debug('Evicted tool result using LRU strategy', {
          callId: lruKey,
          age: Date.now() - oldestTime
        });
      } else {
        break; // Safety break if no key found
      }
    }

    // Then cleanup expired entries
    this.cleanupOldResults();

    this.toolResults.set(callId, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a tool category requires approval
   */
  private requiresApproval(category: string): boolean {
    return this.config.requireApprovalForCategories?.includes(category) || false;
  }

  /**
   * Get all tool results from the last execution
   */
  getToolResults(): Map<string, ToolResult> {
    const results = new Map<string, ToolResult>();
    for (const [callId, cached] of this.toolResults.entries()) {
      results.set(callId, cached.result);
    }
    return results;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StreamingToolOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get approval cache statistics
   */
  getApprovalStats(): { totalApprovals: number; categoryApprovals: number } {
    return this.approvalCache.getStats();
  }

  /**
   * Clear all cached approvals
   */
  clearApprovals(): void {
    this.approvalCache.clear();
    logger.info('Cleared all cached tool approvals');
  }

  /**
   * Pre-approve a specific tool for this session
   */
  preApprove(toolName: string, category: string): void {
    this.approvalCache.setApproval(toolName, category, true);
    logger.info(`Pre-approved tool: ${toolName} (${category})`);
  }

  /**
   * Pre-approve all tools in a category for this session
   */
  preApproveCategory(category: string): void {
    this.approvalCache.setCategoryApproval(category, true);
    logger.info(`Pre-approved category: ${category}`);
  }
}
