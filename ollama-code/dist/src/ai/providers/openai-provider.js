/**
 * OpenAI Provider Implementation
 *
 * Implements the BaseAIProvider interface for OpenAI's GPT models,
 * providing high-quality text generation, code completion, and reasoning capabilities.
 */
import { logger } from '../../utils/logger.js';
import { withTimeout, withRetry } from '../../utils/async.js';
import { normalizeError } from '../../utils/error-utils.js';
import { TIMEOUT_CONSTANTS, RETRY_CONSTANTS } from '../../config/constants.js';
import { BaseAIProvider, AICapability, ProviderError, ProviderRateLimitError, ProviderAuthenticationError, ProviderConnectionError } from './base-provider.js';
/**
 * OpenAI Provider
 */
export class OpenAIProvider extends BaseAIProvider {
    baseUrl;
    apiKey;
    constructor(config) {
        const defaultConfig = {
            name: config.name || 'openai',
            baseUrl: 'https://api.openai.com/v1',
            // OpenAI supports complex reasoning, use extended timeout
            timeout: TIMEOUT_CONSTANTS.LONG,
            retryOptions: {
                maxRetries: RETRY_CONSTANTS.DEFAULT_MAX_RETRIES,
                initialDelayMs: RETRY_CONSTANTS.BASE_RETRY_DELAY,
                maxDelayMs: RETRY_CONSTANTS.MAX_BACKOFF_DELAY
            },
            rateLimiting: {
                enabled: true,
                requestsPerMinute: 500,
                tokensPerMinute: 150000
            },
            caching: {
                enabled: true,
                ttlMs: 600000 // 10 minutes
            }
        };
        super({ ...defaultConfig, ...config });
        this.baseUrl = this.config.baseUrl;
        this.apiKey = this.config.apiKey || process.env.OPENAI_API_KEY || '';
        if (!this.apiKey) {
            throw new ProviderError('OpenAI API key is required', 'openai', 'MISSING_API_KEY');
        }
    }
    getName() {
        return 'OpenAI';
    }
    getCapabilities() {
        return {
            maxContextWindow: 128000, // GPT-4 Turbo
            supportedCapabilities: [
                AICapability.TEXT_COMPLETION,
                AICapability.CHAT,
                AICapability.CODE_GENERATION,
                AICapability.CODE_ANALYSIS,
                AICapability.FUNCTION_CALLING,
                AICapability.STREAMING,
                AICapability.REASONING,
                AICapability.MATH,
                AICapability.TRANSLATION,
                AICapability.IMAGE_ANALYSIS // For GPT-4V
            ],
            rateLimits: {
                requestsPerMinute: 500,
                tokensPerMinute: 150000
            },
            features: {
                streaming: true,
                functionCalling: true,
                imageInput: true, // GPT-4V
                documentInput: false,
                customInstructions: true
            }
        };
    }
    async initialize() {
        logger.info('Initializing OpenAI provider');
        try {
            // Test connection by listing models
            const connectionSuccess = await this.testConnection();
            if (!connectionSuccess) {
                throw new ProviderConnectionError('openai', new Error('Failed to connect to OpenAI API'));
            }
            this.isInitialized = true;
            this.health.status = 'healthy';
            logger.info('OpenAI provider initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            logger.error('Failed to initialize OpenAI provider:', error);
            this.isInitialized = false;
            this.health.status = 'unhealthy';
            throw error;
        }
    }
    async testConnection() {
        logger.debug('Testing connection to OpenAI API');
        try {
            // Try to list models as a connection test
            await this.listModels();
            logger.debug('OpenAI connection test successful');
            return true;
        }
        catch (error) {
            logger.error('OpenAI connection test failed:', error);
            return false;
        }
    }
    async complete(prompt, options = {}) {
        const startTime = Date.now();
        const requestId = `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.debug('Sending completion request to OpenAI', {
            model: options.model || 'gpt-4-turbo-preview',
            requestId
        });
        try {
            // Format the request
            const messages = Array.isArray(prompt)
                ? prompt.map(msg => ({ role: msg.role, content: msg.content }))
                : [{ role: 'user', content: prompt }];
            const request = {
                model: options.model || 'gpt-4-turbo-preview',
                messages,
                temperature: options.temperature ?? 0.7,
                top_p: options.topP ?? 1.0,
                stream: false
            };
            // Add optional parameters
            if (options.maxTokens)
                request.max_tokens = options.maxTokens;
            if (options.stopSequences)
                request.stop = options.stopSequences;
            // Add system message if provided
            if (options.system) {
                request.messages.unshift({ role: 'system', content: options.system });
            }
            // Make the API request with timeout and retry
            const sendRequest = async () => {
                return this.sendRequest('/chat/completions', {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(request)
                });
            };
            const timeoutFn = withTimeout(sendRequest, options.timeout || this.config.timeout || 60000);
            const retryFn = withRetry(timeoutFn, {
                maxRetries: this.config.retryOptions?.maxRetries || 3,
                initialDelayMs: this.config.retryOptions?.initialDelayMs || 1000,
                maxDelayMs: this.config.retryOptions?.maxDelayMs || 8000
            });
            const response = await retryFn();
            const processingTime = Date.now() - startTime;
            // Calculate token usage and cost
            const promptTokens = response.usage.prompt_tokens;
            const completionTokens = response.usage.completion_tokens;
            const totalTokens = response.usage.total_tokens;
            const cost = this.calculateCost(promptTokens, completionTokens, request.model);
            // Update metrics
            this.updateMetrics(true, processingTime, totalTokens, cost);
            const result = {
                content: response.choices[0].message.content,
                model: response.model,
                finishReason: this.mapFinishReason(response.choices[0].finish_reason),
                usage: {
                    promptTokens,
                    completionTokens,
                    totalTokens
                },
                metadata: {
                    requestId,
                    processingTime,
                    provider: 'openai',
                    cached: false
                }
            };
            logger.debug('OpenAI completion request successful', {
                requestId,
                processingTime,
                totalTokens,
                cost
            });
            return result;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.updateMetrics(false, processingTime);
            logger.error('OpenAI completion request failed', { requestId, error });
            throw new ProviderError(`OpenAI completion failed: ${normalizeError(error).message}`, 'openai', 'COMPLETION_ERROR', true);
        }
    }
    async completeStream(prompt, options, onEvent, abortSignal) {
        const requestId = `openai_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.debug('Sending streaming completion request to OpenAI', {
            model: options.model || 'gpt-4-turbo-preview',
            requestId
        });
        try {
            // Format the request
            const messages = Array.isArray(prompt)
                ? prompt.map(msg => ({ role: msg.role, content: msg.content }))
                : [{ role: 'user', content: prompt }];
            const request = {
                model: options.model || 'gpt-4-turbo-preview',
                messages,
                temperature: options.temperature ?? 0.7,
                top_p: options.topP ?? 1.0,
                stream: true
            };
            // Add optional parameters
            if (options.maxTokens)
                request.max_tokens = options.maxTokens;
            if (options.stopSequences)
                request.stop = options.stopSequences;
            // Add system message if provided
            if (options.system) {
                request.messages.unshift({ role: 'system', content: options.system });
            }
            // Make the streaming API request
            await this.sendStreamRequest('/chat/completions', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(request),
                signal: abortSignal
            }, (openaiEvent) => {
                // Parse OpenAI Server-Sent Events format
                if (openaiEvent.startsWith('data: ')) {
                    const data = openaiEvent.slice(6);
                    if (data.trim() === '[DONE]') {
                        onEvent({
                            content: '',
                            done: true,
                            delta: '',
                            metadata: { requestId, provider: 'openai' }
                        });
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content || '';
                        onEvent({
                            content: delta,
                            done: false,
                            delta,
                            metadata: { requestId, provider: 'openai' }
                        });
                    }
                    catch (error) {
                        logger.error('Failed to parse OpenAI stream event', { data, error });
                    }
                }
            }, abortSignal);
        }
        catch (error) {
            logger.error('OpenAI streaming completion request failed', { requestId, error });
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ProviderError('OpenAI streaming request was cancelled', 'openai', 'CANCELLED', false);
            }
            throw new ProviderError(`OpenAI streaming completion failed: ${normalizeError(error).message}`, 'openai', 'STREAMING_ERROR', true);
        }
    }
    async listModels() {
        logger.debug('Listing available OpenAI models');
        try {
            const response = await this.sendRequest('/models', {
                method: 'GET',
                headers: this.getHeaders()
            });
            const models = (response.data || [])
                .filter((model) => model.id.includes('gpt')) // Filter to GPT models only
                .map((model) => ({
                id: model.id,
                name: model.id,
                provider: 'openai',
                capabilities: this.getModelCapabilities(model.id),
                contextWindow: this.getModelContextWindow(model.id),
                costPerToken: this.getModelCostPerToken(model.id),
                averageResponseTime: 0, // Would need to track this over time
                qualityScore: this.getModelQualityScore(model.id),
                lastUpdated: new Date(model.created * 1000)
            }));
            return models;
        }
        catch (error) {
            logger.error('Failed to list OpenAI models', error);
            throw new ProviderError(`Failed to list OpenAI models: ${normalizeError(error).message}`, 'openai', 'LIST_MODELS_ERROR', true);
        }
    }
    async getModel(modelId) {
        const models = await this.listModels();
        return models.find(model => model.id === modelId) || null;
    }
    calculateCost(promptTokens, completionTokens, model) {
        const pricing = this.getModelCostPerToken(model || 'gpt-4-turbo-preview');
        return (promptTokens * pricing.input) + (completionTokens * pricing.output);
    }
    /**
     * Get request headers
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'ollama-code/1.0'
        };
    }
    /**
     * Send a request to the OpenAI API
     */
    async sendRequest(path, options) {
        const url = `${this.baseUrl}${path}`;
        logger.debug(`Sending request to OpenAI: ${url}`);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                await this.handleErrorResponse(response);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ProviderError('Request timed out', 'openai', 'TIMEOUT', true);
            }
            throw error;
        }
    }
    /**
     * Send a streaming request to the OpenAI API
     */
    async sendStreamRequest(path, options, onEvent, abortSignal) {
        const url = `${this.baseUrl}${path}`;
        logger.debug(`Sending streaming request to OpenAI: ${url}`);
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
                    if (done)
                        break;
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
            }
            finally {
                try {
                    reader.releaseLock();
                }
                catch (error) {
                    logger.debug('Error releasing OpenAI reader lock', error);
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new ProviderError('OpenAI streaming request timed out', 'openai', 'TIMEOUT', true);
            }
            throw error;
        }
    }
    /**
     * Handle error responses from the OpenAI API
     */
    async handleErrorResponse(response) {
        let errorData = {};
        let errorMessage = `OpenAI API request failed with status ${response.status}`;
        try {
            errorData = await response.json();
            if (errorData.error?.message) {
                errorMessage = errorData.error.message;
            }
        }
        catch {
            errorMessage = `OpenAI API request failed: ${response.statusText || response.status}`;
        }
        logger.error('OpenAI API error response', { status: response.status, errorData });
        // Handle specific error codes
        switch (response.status) {
            case 401:
                throw new ProviderAuthenticationError('openai');
            case 429:
                throw new ProviderRateLimitError('openai');
            case 500:
            case 502:
            case 503:
                throw new ProviderError('OpenAI server encountered an error', 'openai', 'SERVER_ERROR', true);
            default:
                throw new ProviderError(errorMessage, 'openai', 'API_ERROR', true);
        }
    }
    /**
     * Map OpenAI finish reason to standard format
     */
    mapFinishReason(finishReason) {
        switch (finishReason) {
            case 'stop': return 'stop';
            case 'length': return 'length';
            case 'content_filter': return 'content_filter';
            case 'function_call': return 'function_call';
            default: return 'error';
        }
    }
    /**
     * Get capabilities for a specific model
     */
    getModelCapabilities(modelId) {
        const baseCapabilities = [
            AICapability.TEXT_COMPLETION,
            AICapability.CHAT,
            AICapability.STREAMING,
            AICapability.REASONING,
            AICapability.TRANSLATION
        ];
        // Add model-specific capabilities
        if (modelId.includes('gpt-4')) {
            baseCapabilities.push(AICapability.CODE_GENERATION, AICapability.CODE_ANALYSIS, AICapability.FUNCTION_CALLING, AICapability.MATH);
        }
        if (modelId.includes('vision') || modelId.includes('gpt-4-turbo')) {
            baseCapabilities.push(AICapability.IMAGE_ANALYSIS);
        }
        return baseCapabilities;
    }
    /**
     * Get context window size for a specific model
     */
    getModelContextWindow(modelId) {
        if (modelId.includes('gpt-4-turbo'))
            return 128000;
        if (modelId.includes('gpt-4'))
            return 8192;
        if (modelId.includes('gpt-3.5-turbo'))
            return 16385;
        return 4096; // Default fallback
    }
    /**
     * Get cost per token for a specific model
     */
    getModelCostPerToken(modelId) {
        // Prices in USD per 1K tokens (as of 2024)
        const pricing = {
            'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-4-32k': { input: 0.06, output: 0.12 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 }
        };
        // Find the best match
        for (const [model, price] of Object.entries(pricing)) {
            if (modelId.includes(model)) {
                return { input: price.input / 1000, output: price.output / 1000 }; // Convert to per-token
            }
        }
        // Default fallback (GPT-4 pricing)
        return { input: 0.00003, output: 0.00006 };
    }
    /**
     * Get quality score for a specific model (subjective, based on benchmarks)
     */
    getModelQualityScore(modelId) {
        // Simplified scoring system (0-100)
        if (modelId.includes('gpt-4-turbo'))
            return 95;
        if (modelId.includes('gpt-4'))
            return 90;
        if (modelId.includes('gpt-3.5-turbo'))
            return 80;
        return 75; // Default score
    }
}
//# sourceMappingURL=openai-provider.js.map