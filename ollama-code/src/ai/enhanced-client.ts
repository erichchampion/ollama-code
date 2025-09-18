/**
 * Enhanced AI Client
 *
 * Provides advanced AI capabilities including multi-turn conversations,
 * context-aware prompting, tool use planning, and response quality validation.
 */

import { OllamaClient, OllamaMessage, OllamaCompletionOptions } from './ollama-client.js';
import { ProjectContext, ConversationTurn, ProjectState } from './context.js';
import { ToolOrchestrator, OrchestrationPlan } from '../tools/orchestrator.js';
import { toolRegistry } from '../tools/index.js';
import { logger } from '../utils/logger.js';
import { generateSystemPrompt, generateToolPlanningPrompt } from './prompts.js';
import {
  MAX_RELEVANT_FILES,
  MAX_AI_CONVERSATION_HISTORY
} from '../constants.js';

export interface ToolResult {
  toolName: string;
  result: any;
  data?: any; // For backward compatibility with existing tool system
  executionTime: number;
  success: boolean;
  error?: string;
}

export interface EnhancedCompletionOptions extends OllamaCompletionOptions {
  useProjectContext?: boolean;
  enableToolUse?: boolean;
  conversationId?: string;
  maxContextTokens?: number;
  responseQuality?: 'fast' | 'balanced' | 'high';
}

export interface AIResponse {
  content: string;
  confidence: number;
  toolsUsed: string[];
  filesReferenced: string[];
  metadata: {
    tokensUsed: number;
    executionTime: number;
    contextSize: number;
    qualityScore: number;
  };
  followUpSuggestions: string[];
}

export interface ToolUsePlan {
  tools: Array<{
    name: string;
    parameters: Record<string, any>;
    rationale: string;
    dependencies: string[];
  }>;
  executionOrder: string[];
  estimatedTime: number;
  confidence: number;
}

export interface ResponseValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
}

export class EnhancedAIClient {
  private baseClient: OllamaClient;
  private projectContext: ProjectContext | null = null;
  private toolOrchestrator: ToolOrchestrator;
  private conversations = new Map<string, ConversationTurn[]>();
  private defaultOptions: EnhancedCompletionOptions;

  constructor(baseClient: OllamaClient, projectContext?: ProjectContext, options: Partial<EnhancedCompletionOptions> = {}) {
    this.baseClient = baseClient;
    this.projectContext = projectContext || null;
    this.toolOrchestrator = new ToolOrchestrator();
    this.defaultOptions = {
      useProjectContext: true,
      enableToolUse: true,
      maxContextTokens: 32000,
      responseQuality: 'balanced',
      ...options
    };
  }

  /**
   * Initialize with project context
   */
  async initializeWithProject(projectRoot: string): Promise<void> {
    this.projectContext = new ProjectContext(projectRoot);
    await this.projectContext.initialize();
    logger.info('Enhanced AI client initialized with project context');
  }

  /**
   * Enhanced completion with context awareness and tool use
   */
  async complete(
    prompt: string,
    options: EnhancedCompletionOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };
    const conversationId = mergedOptions.conversationId || 'default';

    try {
      // Build context-aware prompt
      const enhancedPrompt = await this.buildContextAwarePrompt(prompt, mergedOptions);

      // Check if tool use is needed
      let toolResults: ToolResult[] | null = null;
      if (mergedOptions.enableToolUse) {
        const toolPlan = await this.planToolUse(prompt, mergedOptions);
        if (toolPlan.tools.length > 0) {
          toolResults = await this.executeToolPlan(toolPlan);
        }
      }

      // Generate AI response
      const response = await this.generateResponse(enhancedPrompt, toolResults, mergedOptions);

      // Validate response quality
      const qualityScore = this.validateResponseQuality(response.content, prompt);

      // Create conversation turn
      const turn: ConversationTurn = {
        id: `${conversationId}_${Date.now()}`,
        timestamp: new Date(),
        userMessage: prompt,
        assistantResponse: response.content,
        context: {
          filesReferenced: response.filesReferenced,
          toolsUsed: response.toolsUsed,
          projectState: this.createProjectStateFromSummary(this.projectContext?.getProjectSummary())
        },
        metadata: {
          tokensUsed: response.metadata.tokensUsed,
          executionTime: Date.now() - startTime,
          confidence: response.confidence
        }
      };

      // Store conversation turn
      this.addConversationTurn(conversationId, turn);

      // Add to project context if available
      if (this.projectContext) {
        this.projectContext.addConversationTurn(turn);
      }

      return {
        ...response,
        metadata: {
          ...response.metadata,
          executionTime: Date.now() - startTime,
          qualityScore
        }
      };

    } catch (error) {
      logger.error('Enhanced completion failed:', error);
      throw error;
    }
  }

  /**
   * Stream completion with enhanced capabilities
   */
  async completeStream(
    prompt: string,
    options: EnhancedCompletionOptions = {},
    onChunk: (chunk: { content: string; partial: AIResponse }) => void,
    abortSignal?: AbortSignal
  ): Promise<AIResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Build enhanced prompt
    const enhancedPrompt = await this.buildContextAwarePrompt(prompt, mergedOptions);

    let fullContent = '';
    const metadata = {
      tokensUsed: 0,
      executionTime: 0,
      contextSize: 0,
      qualityScore: 0
    };

    // Use base client streaming with enhanced prompt
    const response = await this.baseClient.completeStream(
      enhancedPrompt.content,
      {
        ...mergedOptions,
        system: enhancedPrompt.systemPrompt
      },
      (event) => {
        if (event.message?.content) {
          fullContent += event.message.content;

          const partialResponse: AIResponse = {
            content: fullContent,
            confidence: 0.5, // Partial confidence
            toolsUsed: enhancedPrompt.toolsUsed,
            filesReferenced: enhancedPrompt.filesReferenced,
            metadata,
            followUpSuggestions: []
          };

          onChunk({
            content: event.message.content,
            partial: partialResponse
          });
        }
      },
      abortSignal
    );

    // Build final response
    const finalResponse: AIResponse = {
      content: fullContent,
      confidence: this.calculateConfidence(fullContent, prompt),
      toolsUsed: enhancedPrompt.toolsUsed,
      filesReferenced: enhancedPrompt.filesReferenced,
      metadata: {
        tokensUsed: this.estimateTokens(fullContent),
        executionTime: metadata.executionTime,
        contextSize: enhancedPrompt.contextSize,
        qualityScore: this.validateResponseQuality(fullContent, prompt)
      },
      followUpSuggestions: this.generateFollowUpSuggestions(fullContent, prompt)
    };

    return finalResponse;
  }

  /**
   * Build context-aware prompt with project information
   */
  private async buildContextAwarePrompt(
    userPrompt: string,
    options: EnhancedCompletionOptions
  ): Promise<{
    content: string;
    systemPrompt: string;
    contextSize: number;
    filesReferenced: string[];
    toolsUsed: string[];
  }> {
    let contextInfo = '';
    let filesReferenced: string[] = [];
    let toolsUsed: string[] = [];
    let contextSize = 0;

    // Add project context if available and enabled
    if (options.useProjectContext && this.projectContext) {
      const relevantContext = await this.projectContext.getRelevantContext(
        userPrompt,
        options.maxContextTokens
      );

      // Add file context
      if (relevantContext.files.length > 0) {
        contextInfo += '\n## Relevant Project Files:\n';
        for (const file of relevantContext.files.slice(0, MAX_RELEVANT_FILES)) {
          contextInfo += `- ${file.relativePath} (${file.language || 'unknown'})\n`;
          filesReferenced.push(file.relativePath);
        }
      }

      // Add project structure
      const summary = this.projectContext.getProjectSummary();
      contextInfo += `\n## Project Overview:\n`;
      contextInfo += `Languages: ${summary.languages.join(', ')}\n`;
      contextInfo += `Entry Points: ${summary.entryPoints.join(', ')}\n`;
      contextInfo += `Structure: ${summary.structure}\n`;

      contextSize = relevantContext.totalTokens;
    }

    // Add available tools context
    if (options.enableToolUse) {
      const availableTools = toolRegistry.list();
      contextInfo += '\n## Available Tools:\n';
      for (const tool of availableTools) {
        contextInfo += `- ${tool.name}: ${tool.description}\n`;
        toolsUsed.push(tool.name);
      }
    }

    // Generate system prompt
    const systemPrompt = generateSystemPrompt({
      hasProjectContext: !!this.projectContext,
      hasToolAccess: options.enableToolUse || false,
      responseQuality: options.responseQuality || 'balanced'
    });

    // Combine user prompt with context
    const enhancedPrompt = contextInfo ?
      `${contextInfo}\n\n## User Request:\n${userPrompt}` :
      userPrompt;

    return {
      content: enhancedPrompt,
      systemPrompt,
      contextSize,
      filesReferenced,
      toolsUsed
    };
  }

  /**
   * Plan tool use based on user request
   */
  private async planToolUse(
    prompt: string,
    options: EnhancedCompletionOptions
  ): Promise<ToolUsePlan> {
    const availableTools = toolRegistry.list().map(tool => tool.name);

    // Use AI to plan tool usage
    const planningPrompt = generateToolPlanningPrompt(prompt, availableTools);

    try {
      const response = await this.baseClient.complete([{
        role: 'user',
        content: planningPrompt
      }], {
        ...options,
        temperature: 0.1, // Lower temperature for planning
        format: 'json'
      });

      const planData = JSON.parse(response.message?.content || '{"tools": []}');

      return {
        tools: planData.tools || [],
        executionOrder: planData.executionOrder || [],
        estimatedTime: planData.estimatedTime || 0,
        confidence: planData.confidence || 0.5
      };
    } catch (error) {
      logger.debug('Tool planning failed, proceeding without tools:', error);
      return {
        tools: [],
        executionOrder: [],
        estimatedTime: 0,
        confidence: 0
      };
    }
  }

  /**
   * Execute planned tools
   */
  private async executeToolPlan(plan: ToolUsePlan): Promise<any> {
    if (plan.tools.length === 0) return null;

    try {
      // Convert plan to orchestration format
      const executions = plan.tools.map(tool => ({
        toolName: tool.name,
        parameters: tool.parameters,
        dependencies: tool.dependencies
      }));

      const orchestrationPlan = this.toolOrchestrator.createPlan(executions);

      const context = {
        projectRoot: this.projectContext?.getProjectSummary().structure || process.cwd(),
        workingDirectory: process.cwd(),
        environment: process.env as Record<string, string>,
        timeout: 30000
      };

      const results = await this.toolOrchestrator.executeOrchestration(orchestrationPlan, context);

      return Array.from(results.values());
    } catch (error) {
      logger.error('Tool execution failed:', error);
      return null;
    }
  }

  /**
   * Generate AI response with tool results
   */
  private async generateResponse(
    prompt: { content: string; systemPrompt: string },
    toolResults: ToolResult[] | null,
    options: EnhancedCompletionOptions
  ): Promise<AIResponse> {
    let enhancedPrompt = prompt.content;

    // Add tool results to prompt if available
    if (toolResults && toolResults.length > 0) {
      enhancedPrompt += '\n\n## Tool Execution Results:\n';
      for (let i = 0; i < toolResults.length; i++) {
        const result = toolResults[i];
        enhancedPrompt += `Tool ${i + 1}: ${result.success ? 'Success' : 'Failed'}\n`;
        if (result.data) {
          enhancedPrompt += `Result: ${JSON.stringify(result.data, null, 2)}\n`;
        }
        if (result.error) {
          enhancedPrompt += `Error: ${result.error}\n`;
        }
      }
    }

    const response = await this.baseClient.complete([{
      role: 'user',
      content: enhancedPrompt
    }], {
      ...options,
      system: prompt.systemPrompt
    });

    const content = response.message?.content || '';

    return {
      content,
      confidence: this.calculateConfidence(content, prompt.content),
      toolsUsed: toolResults ? toolResults.map((result: ToolResult) => result.toolName) : [],
      filesReferenced: [], // Will be populated by context
      followUpSuggestions: this.generateFollowUpSuggestions(content, prompt.content),
      metadata: {
        tokensUsed: 0,
        executionTime: 0,
        contextSize: 0,
        qualityScore: 0
      }
    };
  }

  /**
   * Calculate response confidence score
   */
  private calculateConfidence(response: string, prompt: string): number {
    let confidence = 0.5; // Base confidence

    // Length and completeness
    if (response.length > 100) confidence += 0.1;
    if (response.length > 500) confidence += 0.1;

    // Contains code blocks
    if (response.includes('```')) confidence += 0.1;

    // Contains specific answers
    if (response.includes('function') || response.includes('class') || response.includes('const')) {
      confidence += 0.1;
    }

    // Addresses the question directly
    const promptWords = prompt.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase().split(/\s+/);
    const overlap = promptWords.filter(word => responseWords.includes(word)).length;
    confidence += Math.min(0.2, overlap / promptWords.length);

    return Math.min(1.0, confidence);
  }

  /**
   * Validate response quality
   */
  private validateResponseQuality(response: string, prompt: string): number {
    let score = 0.5; // Base score

    // Check for common quality indicators
    if (response.length > 50) score += 0.1;
    if (response.includes('\n')) score += 0.1; // Multi-line responses
    if (/[.!?]/.test(response)) score += 0.1; // Proper punctuation
    if (response.toLowerCase().includes('error') && prompt.toLowerCase().includes('fix')) {
      score += 0.2; // Relevant to fixing
    }

    // Penalize low-quality responses
    if (response.length < 20) score -= 0.3;
    if (response.includes('I cannot') || response.includes("I can't")) score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate follow-up suggestions
   */
  private generateFollowUpSuggestions(response: string, prompt: string): string[] {
    const suggestions: string[] = [];

    // Based on response content
    if (response.includes('function')) {
      suggestions.push('Would you like me to add tests for this function?');
      suggestions.push('Should I add error handling to this code?');
    }

    if (response.includes('class')) {
      suggestions.push('Would you like me to add documentation for this class?');
      suggestions.push('Should I create an interface for this class?');
    }

    if (response.includes('TODO') || response.includes('FIXME')) {
      suggestions.push('Would you like me to help implement the TODO items?');
    }

    // Based on prompt content
    if (prompt.toLowerCase().includes('explain')) {
      suggestions.push('Would you like me to refactor this code?');
      suggestions.push('Should I show you how to test this code?');
    }

    return suggestions.slice(0, 3); // Limit suggestions
  }

  /**
   * Estimate token count (simplified)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Add conversation turn to history
   */
  private addConversationTurn(conversationId: string, turn: ConversationTurn): void {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }

    const conversation = this.conversations.get(conversationId)!;
    conversation.push(turn);

    // Keep only recent turns
    if (conversation.length > MAX_AI_CONVERSATION_HISTORY) {
      conversation.splice(0, conversation.length - MAX_AI_CONVERSATION_HISTORY);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId: string = 'default'): ConversationTurn[] {
    return this.conversations.get(conversationId) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(conversationId?: string): void {
    if (conversationId) {
      this.conversations.delete(conversationId);
    } else {
      this.conversations.clear();
    }
  }

  /**
   * Get project context
   */
  getProjectContext(): ProjectContext | null {
    return this.projectContext;
  }

  /**
   * Convert project summary to ProjectState format
   */
  private createProjectStateFromSummary(summary?: {
    fileCount: number;
    languages: string[];
    structure: string;
    entryPoints: string[];
    recentActivity: string[];
  }): ProjectState {
    if (!summary) {
      return {
        currentFiles: [],
        activeFeatures: [],
        buildStatus: 'unknown',
        testStatus: 'unknown',
        lastModified: new Date(),
        dependencies: {}
      };
    }

    return {
      currentFiles: summary.entryPoints,
      activeFeatures: summary.languages,
      buildStatus: 'unknown', // Would need build system integration
      testStatus: 'unknown',  // Would need test runner integration
      lastModified: new Date(),
      dependencies: {} // Would need to parse package.json or similar
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.projectContext) {
      this.projectContext.cleanup();
    }
    this.conversations.clear();
  }
}