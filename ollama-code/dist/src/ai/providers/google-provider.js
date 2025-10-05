/**
 * Google Gemini AI Provider
 *
 * Implements the BaseAIProvider interface for Google's Gemini models
 * with multimodal capabilities, function calling, and streaming support.
 */
import { BaseAIProvider, AICapability } from './base-provider.js';
import { logger } from '../../utils/logger.js';
import { normalizeError } from '../../utils/error-utils.js';
import { TIMEOUT_CONSTANTS } from '../../config/constants.js';
export class GoogleProvider extends BaseAIProvider {
    baseURL;
    constructor(config) {
        super(config);
        this.baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
        if (!config.apiKey) {
            throw new Error('Google API key is required');
        }
    }
    getName() {
        return 'google';
    }
    getDisplayName() {
        return 'Google Gemini';
    }
    getCapabilities() {
        return {
            maxContextWindow: 2000000, // Gemini Pro 1.5 has 2M token context
            supportedCapabilities: [
                AICapability.TEXT_COMPLETION,
                AICapability.CHAT,
                AICapability.CODE_GENERATION,
                AICapability.CODE_ANALYSIS,
                AICapability.FUNCTION_CALLING,
                AICapability.STREAMING,
                AICapability.IMAGE_ANALYSIS,
                AICapability.DOCUMENT_ANALYSIS,
                AICapability.REASONING,
                AICapability.MATH
            ],
            rateLimits: {
                requestsPerMinute: 60,
                tokensPerMinute: 32000
            },
            features: {
                streaming: true,
                functionCalling: true,
                imageInput: true,
                documentInput: true,
                customInstructions: true
            }
        };
    }
    getDefaultModel() {
        return this.config.model || 'gemini-1.5-pro-latest';
    }
    async initialize() {
        // Test connection during initialization
        await this.testConnection();
        this.isInitialized = true;
    }
    async testConnection() {
        try {
            const health = await this.checkHealth();
            return health.status === 'healthy';
        }
        catch (error) {
            logger.error('Google provider connection test failed:', error);
            return false;
        }
    }
    async checkHealth() {
        const startTime = Date.now();
        try {
            // Test with a simple generation request
            const testRequest = {
                contents: [{
                        role: 'user',
                        parts: [{ text: 'Hello' }]
                    }],
                generationConfig: {
                    maxOutputTokens: 10,
                    temperature: 0
                }
            };
            const response = await this.makeRequest('generateContent', testRequest);
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
                lastCheck: new Date(),
                errorRate: 0,
                availability: 1.0,
                details: {
                    endpoint: this.baseURL,
                    consecutiveFailures: 0,
                    lastSuccessfulRequest: new Date()
                }
            };
        }
        catch (error) {
            logger.error('Google provider health check failed:', error);
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                lastCheck: new Date(),
                errorRate: 1,
                availability: 0.0,
                details: {
                    endpoint: this.baseURL,
                    lastError: normalizeError(error).message,
                    consecutiveFailures: 1
                }
            };
        }
    }
    async complete(messages, options = {}) {
        const startTime = Date.now();
        const requestId = `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        try {
            const model = options.model || this.getDefaultModel();
            const request = this.buildRequest(messages, options);
            logger.debug(`Google API request to ${model}:`, { requestId, messageCount: messages.length });
            const response = await this.makeRequest('generateContent', request, model);
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error('No candidates returned from Google API');
            }
            const candidate = response.candidates[0];
            const content = this.extractContentFromCandidate(candidate);
            const finishReason = this.mapFinishReason(candidate.finishReason);
            const result = {
                content,
                model,
                finishReason,
                usage: {
                    promptTokens: response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0
                },
                metadata: {
                    requestId,
                    processingTime: Date.now() - startTime,
                    provider: this.getName(),
                    cached: false
                }
            };
            logger.debug(`Google API response:`, {
                requestId,
                finishReason: result.finishReason,
                tokenUsage: result.usage
            });
            return result;
        }
        catch (error) {
            logger.error(`Google API error:`, { requestId, error });
            throw this.handleError(error);
        }
    }
    async completeStream(prompt, options = {}, onEvent, abortSignal) {
        const messages = typeof prompt === 'string'
            ? [{ role: 'user', content: prompt }]
            : prompt;
        for await (const event of this.stream(messages, options)) {
            if (abortSignal?.aborted) {
                throw new Error('Request aborted');
            }
            onEvent(event);
        }
    }
    async listModels() {
        const models = Object.entries(GOOGLE_MODELS).map(([id, model]) => ({
            id,
            name: model.name,
            provider: this.getName(),
            capabilities: model.capabilities.map(cap => {
                switch (cap) {
                    case 'text': return AICapability.TEXT_COMPLETION;
                    case 'code': return AICapability.CODE_GENERATION;
                    case 'vision': return AICapability.IMAGE_ANALYSIS;
                    case 'function_calling': return AICapability.FUNCTION_CALLING;
                    default: return AICapability.TEXT_COMPLETION;
                }
            }),
            contextWindow: model.contextLength,
            costPerToken: {
                input: 0.0025 / 1000, // Rough estimate
                output: 0.0025 / 1000
            },
            averageResponseTime: 2000,
            qualityScore: 0.85,
            lastUpdated: new Date()
        }));
        return models;
    }
    async getModel(modelId) {
        const models = await this.listModels();
        return models.find(model => model.id === modelId) || null;
    }
    calculateCost(promptTokens, completionTokens, model) {
        // Google Gemini pricing (approximate)
        const inputCost = 0.0025 / 1000; // $0.0025 per 1K tokens
        const outputCost = 0.0025 / 1000;
        return (promptTokens * inputCost) + (completionTokens * outputCost);
    }
    async *stream(messages, options = {}) {
        const model = options.model || this.getDefaultModel();
        const request = this.buildRequest(messages, options);
        try {
            const url = `${this.baseURL}/models/${model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }
            const decoder = new TextDecoder();
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    // Process complete events
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                yield { content: '', done: true };
                                return;
                            }
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.candidates && parsed.candidates[0]) {
                                    const candidate = parsed.candidates[0];
                                    const content = this.extractContentFromCandidate(candidate);
                                    if (content) {
                                        yield { content, done: false };
                                    }
                                }
                            }
                            catch (parseError) {
                                logger.warn('Failed to parse streaming response:', parseError);
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
            yield { content: '', done: true };
        }
        catch (error) {
            logger.error('Google streaming error:', error);
            throw this.handleError(error);
        }
    }
    buildRequest(messages, options) {
        const contents = [];
        let systemInstruction;
        for (const message of messages) {
            if (message.role === 'system') {
                // Gemini handles system messages as system instruction
                systemInstruction = {
                    parts: [{ text: message.content }]
                };
            }
            else {
                contents.push({
                    role: message.role === 'user' ? 'user' : 'model',
                    parts: [{ text: message.content }]
                });
            }
        }
        // Add system message from options if provided
        if (options.system && !systemInstruction) {
            systemInstruction = {
                parts: [{ text: options.system }]
            };
        }
        const generationConfig = {};
        if (options.temperature !== undefined) {
            generationConfig.temperature = Math.max(0, Math.min(2, options.temperature));
        }
        if (options.topP !== undefined) {
            generationConfig.topP = Math.max(0, Math.min(1, options.topP));
        }
        if (options.topK !== undefined) {
            generationConfig.topK = Math.max(1, Math.floor(options.topK));
        }
        if (options.maxTokens !== undefined) {
            generationConfig.maxOutputTokens = options.maxTokens;
        }
        if (options.stopSequences && options.stopSequences.length > 0) {
            generationConfig.stopSequences = options.stopSequences.slice(0, 5); // Gemini supports up to 5
        }
        // Default safety settings (allow most content for development use)
        const safetySettings = [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ];
        const request = {
            contents,
            generationConfig,
            safetySettings
        };
        if (systemInstruction) {
            request.systemInstruction = systemInstruction;
        }
        return request;
    }
    async makeRequest(endpoint, data, model) {
        const targetModel = model || this.getDefaultModel();
        const url = `${this.baseURL}/models/${targetModel}:${endpoint}?key=${this.config.apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_CONSTANTS.GIT_OPERATION); // 60 second timeout
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'ollama-code/1.0'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorBody);
                    if (errorData.error) {
                        errorMessage = errorData.error.message || errorMessage;
                    }
                }
                catch {
                    // Keep default error message if parsing fails
                }
                throw new Error(errorMessage);
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    extractContentFromCandidate(candidate) {
        if (!candidate.content || !candidate.content.parts) {
            return '';
        }
        return candidate.content.parts
            .filter((part) => part.text)
            .map((part) => part.text)
            .join('');
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'STOP':
                return 'stop';
            case 'MAX_TOKENS':
                return 'length';
            case 'SAFETY':
            case 'RECITATION':
                return 'content_filter';
            default:
                return 'stop';
        }
    }
    handleError(error) {
        if (error instanceof Error) {
            // Add provider context to the error
            const message = `Google Gemini error: ${error.message}`;
            const newError = new Error(message);
            newError.stack = error.stack;
            return newError;
        }
        return new Error(`Google Gemini error: ${String(error)}`);
    }
}
// Factory function for easy instantiation
export function createGoogleProvider(config) {
    return new GoogleProvider(config);
}
// Default models available
export const GOOGLE_MODELS = {
    'gemini-1.5-pro-latest': {
        name: 'Gemini 1.5 Pro (Latest)',
        contextLength: 2000000,
        capabilities: ['text', 'code', 'vision', 'function_calling']
    },
    'gemini-1.5-flash-latest': {
        name: 'Gemini 1.5 Flash (Latest)',
        contextLength: 1000000,
        capabilities: ['text', 'code', 'vision']
    },
    'gemini-pro': {
        name: 'Gemini Pro',
        contextLength: 32000,
        capabilities: ['text', 'code']
    },
    'gemini-pro-vision': {
        name: 'Gemini Pro Vision',
        contextLength: 16000,
        capabilities: ['text', 'code', 'vision']
    }
};
//# sourceMappingURL=google-provider.js.map