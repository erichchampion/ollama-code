/**
 * Ollama AI Client
 *
 * Handles interaction with Ollama API for local model inference,
 * including text completion, chat, and model management features.
 */
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { withTimeout, withRetry } from '../utils/async.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { DEFAULT_OLLAMA_URL, AI_COMPLETION_TIMEOUT, DEFAULT_MAX_RETRIES, DEFAULT_INITIAL_RETRY_DELAY, DEFAULT_MAX_RETRY_DELAY, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_TOP_P, DEFAULT_TOP_K, USER_AGENT } from '../constants.js';
// Default Ollama configuration
const DEFAULT_CONFIG = {
    apiBaseUrl: DEFAULT_OLLAMA_URL,
    timeout: AI_COMPLETION_TIMEOUT,
    retryOptions: {
        maxRetries: DEFAULT_MAX_RETRIES,
        initialDelayMs: DEFAULT_INITIAL_RETRY_DELAY,
        maxDelayMs: DEFAULT_MAX_RETRY_DELAY
    },
    defaultModel: DEFAULT_MODEL,
    defaultTemperature: DEFAULT_TEMPERATURE,
    defaultTopP: DEFAULT_TOP_P,
    defaultTopK: DEFAULT_TOP_K
};
/**
 * Ollama AI client for interacting with local Ollama server
 */
export class OllamaClient {
    config;
    baseUrl;
    /**
     * Create a new Ollama client
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.baseUrl = this.config.apiBaseUrl;
        logger.debug('Ollama client created with config', {
            baseUrl: this.baseUrl,
            defaultModel: this.config.defaultModel
        });
    }
    /**
     * Format API request headers
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'User-Agent': USER_AGENT
        };
    }
    /**
     * Send a completion request to Ollama
     */
    async complete(prompt, options = {}) {
        logger.debug('Sending completion request', { model: options.model || this.config.defaultModel });
        // Format the request
        const messages = Array.isArray(prompt)
            ? prompt
            : [{ role: 'user', content: prompt }];
        const request = {
            model: options.model || this.config.defaultModel,
            messages,
            temperature: options.temperature ?? this.config.defaultTemperature,
            top_p: options.topP ?? this.config.defaultTopP,
            top_k: options.topK ?? this.config.defaultTopK,
            stream: false
        };
        // Add optional parameters
        if (options.repeatPenalty !== undefined)
            request.repeat_penalty = options.repeatPenalty;
        if (options.stopSequences)
            request.stop = options.stopSequences;
        if (options.system)
            request.system = options.system;
        if (options.context)
            request.context = options.context;
        if (options.format)
            request.format = options.format;
        // Make the API request with timeout and retry
        try {
            const sendRequestWithPath = async (path, requestOptions) => {
                return this.sendRequest(path, requestOptions);
            };
            const timeoutFn = withTimeout(sendRequestWithPath, this.config.timeout);
            const retryFn = withRetry(timeoutFn, {
                maxRetries: this.config.retryOptions.maxRetries,
                initialDelayMs: this.config.retryOptions.initialDelayMs,
                maxDelayMs: this.config.retryOptions.maxDelayMs
            });
            const response = await retryFn('/api/chat', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(request)
            });
            return response;
        }
        catch (error) {
            logger.error('Completion request failed', error);
            throw createUserError('Failed to get response from Ollama', {
                cause: error,
                category: ErrorCategory.AI_SERVICE,
                resolution: 'Check that Ollama is running and the model is available. Try running "ollama serve" to start the server.'
            });
        }
    }
    /**
     * Send a streaming completion request to Ollama
     */
    async completeStream(prompt, options = {}, onEvent, abortSignal) {
        logger.debug('Sending streaming completion request', { model: options.model || this.config.defaultModel });
        // Format the request
        const messages = Array.isArray(prompt)
            ? prompt
            : [{ role: 'user', content: prompt }];
        const request = {
            model: options.model || this.config.defaultModel,
            messages,
            temperature: options.temperature ?? this.config.defaultTemperature,
            top_p: options.topP ?? this.config.defaultTopP,
            top_k: options.topK ?? this.config.defaultTopK,
            stream: true
        };
        // Add optional parameters
        if (options.repeatPenalty !== undefined)
            request.repeat_penalty = options.repeatPenalty;
        if (options.stopSequences)
            request.stop = options.stopSequences;
        if (options.system)
            request.system = options.system;
        if (options.context)
            request.context = options.context;
        if (options.format)
            request.format = options.format;
        // Make the API request
        try {
            await this.sendStreamRequest('/api/chat', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(request),
                signal: abortSignal
            }, onEvent, abortSignal);
        }
        catch (error) {
            logger.error('Streaming completion request failed', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw createUserError('Streaming request was cancelled', {
                    category: ErrorCategory.TIMEOUT,
                    resolution: 'Request was aborted by user or system.'
                });
            }
            throw createUserError('Failed to get streaming response from Ollama', {
                cause: error,
                category: ErrorCategory.AI_SERVICE,
                resolution: 'Check that Ollama is running and the model is available. Try running "ollama serve" to start the server.'
            });
        }
    }
    /**
     * List available models
     */
    async listModels() {
        logger.debug('Listing available models');
        try {
            const response = await this.sendRequest('/api/tags', {
                method: 'GET',
                headers: this.getHeaders()
            });
            return response.models || [];
        }
        catch (error) {
            logger.error('Failed to list models', error);
            throw createUserError('Failed to list available models', {
                cause: error,
                category: ErrorCategory.AI_SERVICE,
                resolution: 'Check that Ollama is running. Try running "ollama serve" to start the server.'
            });
        }
    }
    /**
     * Pull/download a model
     */
    async pullModel(modelName) {
        logger.debug(`Pulling model: ${modelName}`);
        try {
            await this.sendRequest('/api/pull', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name: modelName })
            });
            logger.info(`Successfully pulled model: ${modelName}`);
        }
        catch (error) {
            logger.error(`Failed to pull model: ${modelName}`, error);
            throw createUserError(`Failed to pull model: ${modelName}`, {
                cause: error,
                category: ErrorCategory.AI_SERVICE,
                resolution: 'Check your internet connection and that the model name is correct.'
            });
        }
    }
    /**
     * Test the connection to the Ollama server
     */
    async testConnection() {
        logger.debug('Testing connection to Ollama server');
        try {
            // Try to list models as a connection test
            await this.listModels();
            logger.debug('Connection test successful');
            return true;
        }
        catch (error) {
            logger.debug('Connection test failed, attempting to start Ollama server', error);
            try {
                // Try to start the server automatically
                await ensureOllamaServerRunning(this.baseUrl);
                // Test connection again after starting server
                await this.listModels();
                logger.info('Ollama server started and connection test successful');
                return true;
            }
            catch (startupError) {
                logger.error('Failed to start Ollama server or connect', startupError);
                return false;
            }
        }
    }
    /**
     * Send a request to the Ollama API
     */
    async sendRequest(path, options) {
        const url = `${this.baseUrl}${path}`;
        logger.debug(`Sending request to ${url}`);
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
                throw createUserError('Request timed out', {
                    category: ErrorCategory.TIMEOUT,
                    resolution: 'Try again or increase the timeout setting.'
                });
            }
            throw error;
        }
    }
    /**
     * Send a streaming request to the Ollama API
     */
    async sendStreamRequest(path, options, onEvent, abortSignal) {
        const url = `${this.baseUrl}${path}`;
        logger.debug(`Sending streaming request to ${url}`);
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
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    // Check for abort signal
                    if (abortSignal?.aborted) {
                        throw new Error('Stream aborted');
                    }
                    // Decode the chunk and add to buffer
                    buffer += decoder.decode(value, { stream: true });
                    // Prevent buffer from growing too large (memory leak protection)
                    if (buffer.length > 1024 * 1024) { // 1MB limit
                        logger.warn('Stream buffer too large, truncating');
                        buffer = buffer.slice(-512 * 1024); // Keep last 512KB
                    }
                    // Process any complete events in the buffer
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) {
                            continue;
                        }
                        try {
                            const eventData = JSON.parse(trimmedLine);
                            onEvent(eventData);
                            // Break early if stream indicates completion
                            if (eventData.done) {
                                return;
                            }
                        }
                        catch (error) {
                            logger.error('Failed to parse stream event', { line: trimmedLine, error });
                        }
                    }
                }
            }
            finally {
                // Ensure reader is always released
                try {
                    reader.releaseLock();
                }
                catch (error) {
                    logger.debug('Error releasing reader lock', error);
                }
            }
            // Process any remaining data
            if (buffer.trim()) {
                try {
                    const eventData = JSON.parse(buffer.trim());
                    onEvent(eventData);
                }
                catch (error) {
                    logger.error('Failed to parse final stream event', { buffer, error });
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw createUserError('Streaming request timed out', {
                    category: ErrorCategory.TIMEOUT,
                    resolution: 'Try again or increase the timeout setting.'
                });
            }
            throw error;
        }
    }
    /**
     * Handle error responses from the API
     */
    async handleErrorResponse(response) {
        let errorData = {};
        let errorMessage = `API request failed with status ${response.status}`;
        try {
            // Try to parse the error response
            errorData = await response.json();
            if (errorData.error) {
                errorMessage = errorData.error;
            }
        }
        catch {
            // If we can't parse the response, use the status text
            errorMessage = `API request failed: ${response.statusText || response.status}`;
        }
        logger.error('API error response', { status: response.status, errorData });
        // Handle specific error codes
        switch (response.status) {
            case 404:
                throw createUserError('Ollama server not found. Make sure Ollama is running.', {
                    category: ErrorCategory.CONNECTION,
                    resolution: 'Run "ollama serve" to start the Ollama server.'
                });
            case 500:
                throw createUserError('Ollama server encountered an error.', {
                    category: ErrorCategory.SERVER,
                    resolution: 'Check the Ollama server logs and try again.'
                });
            default:
                throw createUserError(errorMessage, {
                    category: ErrorCategory.API,
                    resolution: 'Check that Ollama is running and try again.'
                });
        }
    }
}
//# sourceMappingURL=ollama-client.js.map