/**
 * Anthropic Provider Implementation
 *
 * Implements the BaseAIProvider interface for Anthropic's Claude models,
 * providing high-quality reasoning, analysis, and long-context capabilities.
 */

import { logger } from '../../utils/logger.js';
import { withTimeout, withRetry } from '../../utils/async.js';
import {
  BaseAIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamEvent,
  AIModel,
  AICapability,
  ProviderCapabilities,
  ProviderConfig,
  ProviderError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderConnectionError
} from './base-provider.js';

// Anthropic-specific types
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicCompletionRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string;
}

interface AnthropicCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicModel {
  id: string;
  display_name: string;
  created_at: string;
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider extends BaseAIProvider {
  private baseUrl: string;
  private apiKey: string;
  private defaultMaxTokens: number = 4096;

  constructor(config: ProviderConfig) {
    const defaultConfig = {
      name: config.name || 'anthropic',
      baseUrl: 'https://api.anthropic.com',
      timeout: 120000, // Claude can take longer for complex reasoning
      retryOptions: {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 300,
        tokensPerMinute: 100000
      },
      caching: {
        enabled: true,
        ttlMs: 600000 // 10 minutes
      }
    };

    super({ ...defaultConfig, ...config });

    this.baseUrl = this.config.baseUrl!;
    this.apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY || '';

    if (!this.apiKey) {
      throw new ProviderError('Anthropic API key is required', 'anthropic', 'MISSING_API_KEY');
    }
  }

  getName(): string {
    return 'Anthropic';
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxContextWindow: 200000, // Claude 3 has very large context window
      supportedCapabilities: [
        AICapability.TEXT_COMPLETION,
        AICapability.CHAT,
        AICapability.CODE_GENERATION,
        AICapability.CODE_ANALYSIS,
        AICapability.STREAMING,
        AICapability.REASONING,
        AICapability.MATH,
        AICapability.TRANSLATION,
        AICapability.DOCUMENT_ANALYSIS
      ],
      rateLimits: {
        requestsPerMinute: 300,
        tokensPerMinute: 100000
      },
      features: {
        streaming: true,
        functionCalling: false, // Claude doesn't have built-in function calling
        imageInput: true, // Claude 3 supports images
        documentInput: true, // Excellent at long document analysis
        customInstructions: true
      }
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Anthropic provider');

    try {
      // Test connection by making a simple request
      const connectionSuccess = await this.testConnection();

      if (!connectionSuccess) {
        throw new ProviderConnectionError('anthropic', new Error('Failed to connect to Anthropic API'));
      }

      this.isInitialized = true;
      this.health.status = 'healthy';

      logger.info('Anthropic provider initialized successfully');
      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize Anthropic provider:', error);
      this.isInitialized = false;
      this.health.status = 'unhealthy';
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    logger.debug('Testing connection to Anthropic API');

    try {
      // Test with a simple completion request
      await this.complete('Hello', { maxTokens: 10 });

      logger.debug('Anthropic connection test successful');
      return true;
    } catch (error) {
      logger.error('Anthropic connection test failed:', error);
      return false;
    }
  }

  async complete(
    prompt: string | AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const requestId = `anthropic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.debug('Sending completion request to Anthropic', {
      model: options.model || 'claude-3-sonnet-20240229',
      requestId
    });

    try {
      // Format the request
      const messages: AnthropicMessage[] = Array.isArray(prompt)
        ? prompt
            .filter(msg => msg.role !== 'system') // System messages handled separately
            .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
        : [{ role: 'user', content: prompt }];

      // Extract system message
      const systemMessage = Array.isArray(prompt)
        ? prompt.find(msg => msg.role === 'system')?.content
        : undefined;

      const request: AnthropicCompletionRequest = {
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        messages,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 1.0,
        top_k: options.topK ?? 5,
        stream: false
      };

      // Add optional parameters
      if (options.stopSequences) request.stop_sequences = options.stopSequences;
      if (options.system || systemMessage) request.system = options.system || systemMessage;

      // Make the API request with timeout and retry
      const sendRequest = async () => {
        return this.sendRequest('/v1/messages', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(request)
        });
      };

      const timeoutFn = withTimeout(sendRequest, options.timeout || this.config.timeout || 120000);

      const retryFn = withRetry(timeoutFn, {
        maxRetries: this.config.retryOptions?.maxRetries || 3,
        initialDelayMs: this.config.retryOptions?.initialDelayMs || 1000,
        maxDelayMs: this.config.retryOptions?.maxDelayMs || 10000
      });

      const response: AnthropicCompletionResponse = await retryFn();

      const processingTime = Date.now() - startTime;

      // Calculate token usage and cost
      const promptTokens = response.usage.input_tokens;
      const completionTokens = response.usage.output_tokens;
      const totalTokens = promptTokens + completionTokens;
      const cost = this.calculateCost(promptTokens, completionTokens, request.model);

      // Update metrics
      this.updateMetrics(true, processingTime, totalTokens, cost);

      const result: AICompletionResponse = {
        content: response.content[0]?.text || '',
        model: response.model,
        finishReason: this.mapStopReason(response.stop_reason),
        usage: {
          promptTokens,
          completionTokens,
          totalTokens
        },
        metadata: {
          requestId,
          processingTime,
          provider: 'anthropic',
          cached: false
        }
      };

      logger.debug('Anthropic completion request successful', {
        requestId,
        processingTime,
        totalTokens,
        cost
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(false, processingTime);

      logger.error('Anthropic completion request failed', { requestId, error });

      throw new ProviderError(
        `Anthropic completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic',
        'COMPLETION_ERROR',
        true
      );
    }
  }

  async completeStream(
    prompt: string | AIMessage[],
    options: AICompletionOptions,
    onEvent: (event: AIStreamEvent) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const requestId = `anthropic_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.debug('Sending streaming completion request to Anthropic', {
      model: options.model || 'claude-3-sonnet-20240229',
      requestId
    });

    try {
      // Format the request
      const messages: AnthropicMessage[] = Array.isArray(prompt)
        ? prompt
            .filter(msg => msg.role !== 'system')
            .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
        : [{ role: 'user', content: prompt }];

      // Extract system message
      const systemMessage = Array.isArray(prompt)
        ? prompt.find(msg => msg.role === 'system')?.content
        : undefined;

      const request: AnthropicCompletionRequest = {
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        messages,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 1.0,
        top_k: options.topK ?? 5,
        stream: true
      };

      // Add optional parameters
      if (options.stopSequences) request.stop_sequences = options.stopSequences;
      if (options.system || systemMessage) request.system = options.system || systemMessage;

      // Make the streaming API request
      await this.sendStreamRequest('/v1/messages', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
        signal: abortSignal
      }, (anthropicEvent: any) => {
        // Parse Anthropic Server-Sent Events format
        if (anthropicEvent.startsWith('data: ')) {
          const data = anthropicEvent.slice(6);

          if (data.trim() === '[DONE]') {
            onEvent({
              content: '',
              done: true,
              delta: '',
              metadata: { requestId, provider: 'anthropic' }
            });
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content_block_delta') {
              const delta = parsed.delta?.text || '';

              onEvent({
                content: delta,
                done: false,
                delta,
                metadata: { requestId, provider: 'anthropic' }
              });
            } else if (parsed.type === 'message_stop') {
              onEvent({
                content: '',
                done: true,
                delta: '',
                usage: parsed.usage ? {
                  promptTokens: parsed.usage.input_tokens,
                  completionTokens: parsed.usage.output_tokens,
                  totalTokens: parsed.usage.input_tokens + parsed.usage.output_tokens
                } : undefined,
                metadata: { requestId, provider: 'anthropic' }
              });
            }
          } catch (error) {
            logger.error('Failed to parse Anthropic stream event', { data, error });
          }
        }
      }, abortSignal);

    } catch (error) {
      logger.error('Anthropic streaming completion request failed', { requestId, error });

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError('Anthropic streaming request was cancelled', 'anthropic', 'CANCELLED', false);
      }

      throw new ProviderError(
        `Anthropic streaming completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'anthropic',
        'STREAMING_ERROR',
        true
      );
    }
  }

  async listModels(): Promise<AIModel[]> {
    logger.debug('Listing available Anthropic models');

    // Anthropic doesn't provide a models endpoint, so we'll return the known models
    const knownModels: AIModel[] = [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        capabilities: this.getModelCapabilities('claude-3-opus-20240229'),
        contextWindow: 200000,
        costPerToken: this.getModelCostPerToken('claude-3-opus-20240229'),
        averageResponseTime: 0,
        qualityScore: 95,
        lastUpdated: new Date('2024-02-29')
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        capabilities: this.getModelCapabilities('claude-3-sonnet-20240229'),
        contextWindow: 200000,
        costPerToken: this.getModelCostPerToken('claude-3-sonnet-20240229'),
        averageResponseTime: 0,
        qualityScore: 90,
        lastUpdated: new Date('2024-02-29')
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        capabilities: this.getModelCapabilities('claude-3-haiku-20240307'),
        contextWindow: 200000,
        costPerToken: this.getModelCostPerToken('claude-3-haiku-20240307'),
        averageResponseTime: 0,
        qualityScore: 85,
        lastUpdated: new Date('2024-03-07')
      }
    ];

    return knownModels;
  }

  async getModel(modelId: string): Promise<AIModel | null> {
    const models = await this.listModels();
    return models.find(model => model.id === modelId) || null;
  }

  calculateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const pricing = this.getModelCostPerToken(model || 'claude-3-sonnet-20240229');
    return (promptTokens * pricing.input) + (completionTokens * pricing.output);
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'User-Agent': 'ollama-code/1.0'
    };
  }

  /**
   * Send a request to the Anthropic API
   */
  private async sendRequest(path: string, options: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    logger.debug(`Sending request to Anthropic: ${url}`);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError('Request timed out', 'anthropic', 'TIMEOUT', true);
      }

      throw error;
    }
  }

  /**
   * Send a streaming request to the Anthropic API
   */
  private async sendStreamRequest(
    path: string,
    options: RequestInit,
    onEvent: (event: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const url = `${this.baseUrl}${path}`;

    logger.debug(`Sending streaming request to Anthropic: ${url}`);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Check for abort signal
          if (abortSignal?.aborted) {
            throw new Error('Stream aborted');
          }

          // Decode and process chunks
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              onEvent(line);
            }
          }
        }
      } finally {
        try {
          reader.releaseLock();
        } catch (error) {
          logger.debug('Error releasing Anthropic reader lock', error);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError('Anthropic streaming request timed out', 'anthropic', 'TIMEOUT', true);
      }

      throw error;
    }
  }

  /**
   * Handle error responses from the Anthropic API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    let errorMessage = `Anthropic API request failed with status ${response.status}`;

    try {
      errorData = await response.json();
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      errorMessage = `Anthropic API request failed: ${response.statusText || response.status}`;
    }

    logger.error('Anthropic API error response', { status: response.status, errorData });

    // Handle specific error codes
    switch (response.status) {
      case 401:
        throw new ProviderAuthenticationError('anthropic');
      case 429:
        throw new ProviderRateLimitError('anthropic');
      case 500:
      case 502:
      case 503:
        throw new ProviderError('Anthropic server encountered an error', 'anthropic', 'SERVER_ERROR', true);
      default:
        throw new ProviderError(errorMessage, 'anthropic', 'API_ERROR', true);
    }
  }

  /**
   * Map Anthropic stop reason to standard format
   */
  private mapStopReason(stopReason: string): 'stop' | 'length' | 'content_filter' | 'function_call' | 'error' {
    switch (stopReason) {
      case 'end_turn': return 'stop';
      case 'max_tokens': return 'length';
      case 'stop_sequence': return 'stop';
      default: return 'error';
    }
  }

  /**
   * Get capabilities for a specific model
   */
  private getModelCapabilities(modelId: string): AICapability[] {
    const baseCapabilities = [
      AICapability.TEXT_COMPLETION,
      AICapability.CHAT,
      AICapability.STREAMING,
      AICapability.REASONING,
      AICapability.TRANSLATION,
      AICapability.DOCUMENT_ANALYSIS
    ];

    // All Claude 3 models have strong code and analysis capabilities
    if (modelId.includes('claude-3')) {
      baseCapabilities.push(
        AICapability.CODE_GENERATION,
        AICapability.CODE_ANALYSIS,
        AICapability.MATH,
        AICapability.IMAGE_ANALYSIS
      );
    }

    return baseCapabilities;
  }

  /**
   * Get cost per token for a specific model
   */
  private getModelCostPerToken(modelId: string): { input: number; output: number } {
    // Prices in USD per 1K tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    };

    const modelPricing = pricing[modelId];
    if (modelPricing) {
      return { input: modelPricing.input / 1000, output: modelPricing.output / 1000 }; // Convert to per-token
    }

    // Default fallback (Sonnet pricing)
    return { input: 0.000003, output: 0.000015 };
  }
}