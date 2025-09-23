/**
 * Base AI Provider Interface
 *
 * Defines the unified interface for all AI providers (Ollama, OpenAI, Anthropic, Google)
 * with standardized capabilities, error handling, and performance monitoring.
 */
import { EventEmitter } from 'events';
export var AICapability;
(function (AICapability) {
    AICapability["TEXT_COMPLETION"] = "text_completion";
    AICapability["CHAT"] = "chat";
    AICapability["CODE_GENERATION"] = "code_generation";
    AICapability["CODE_ANALYSIS"] = "code_analysis";
    AICapability["FUNCTION_CALLING"] = "function_calling";
    AICapability["STREAMING"] = "streaming";
    AICapability["EMBEDDINGS"] = "embeddings";
    AICapability["IMAGE_ANALYSIS"] = "image_analysis";
    AICapability["DOCUMENT_ANALYSIS"] = "document_analysis";
    AICapability["REASONING"] = "reasoning";
    AICapability["MATH"] = "math";
    AICapability["TRANSLATION"] = "translation";
})(AICapability || (AICapability = {}));
/**
 * Abstract base class for all AI providers
 */
export class BaseAIProvider extends EventEmitter {
    config;
    health;
    metrics;
    isInitialized = false;
    constructor(config) {
        super();
        this.config = config;
        this.health = this.initializeHealth();
        this.metrics = this.initializeMetrics();
    }
    /**
     * Get provider health status
     */
    getHealth() {
        return { ...this.health };
    }
    /**
     * Get provider metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Check if provider supports a capability
     */
    supportsCapability(capability) {
        return this.getCapabilities().supportedCapabilities.includes(capability);
    }
    /**
     * Get provider configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update provider configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.emit('configUpdated', this.config);
    }
    /**
     * Cleanup provider resources
     */
    async cleanup() {
        this.removeAllListeners();
        this.isInitialized = false;
    }
    /**
     * Check if provider is initialized
     */
    isReady() {
        return this.isInitialized && this.health.status !== 'unhealthy';
    }
    /**
     * Perform health check
     */
    async performHealthCheck() {
        const startTime = Date.now();
        try {
            const isHealthy = await this.testConnection();
            const responseTime = Date.now() - startTime;
            this.health.status = isHealthy ? 'healthy' : 'unhealthy';
            this.health.lastCheck = new Date();
            this.health.responseTime = responseTime;
            this.health.details.consecutiveFailures = isHealthy ? 0 : this.health.details.consecutiveFailures + 1;
            if (isHealthy) {
                this.health.details.lastSuccessfulRequest = new Date();
            }
            this.emit('healthUpdated', this.health);
        }
        catch (error) {
            this.health.status = 'unhealthy';
            this.health.lastCheck = new Date();
            this.health.details.lastError = error instanceof Error ? error.message : 'Unknown error';
            this.health.details.consecutiveFailures += 1;
            this.emit('healthUpdated', this.health);
            this.emit('error', error);
        }
    }
    /**
     * Update metrics after a request
     */
    updateMetrics(success, responseTime, tokensUsed = 0, cost = 0) {
        this.metrics.totalRequests += 1;
        if (success) {
            this.metrics.successfulRequests += 1;
        }
        else {
            this.metrics.failedRequests += 1;
        }
        // Update average response time using exponential moving average
        if (this.metrics.totalRequests === 1) {
            this.metrics.averageResponseTime = responseTime;
        }
        else {
            const alpha = 0.1; // Smoothing factor
            this.metrics.averageResponseTime = alpha * responseTime + (1 - alpha) * this.metrics.averageResponseTime;
        }
        this.metrics.totalTokensUsed += tokensUsed;
        this.metrics.totalCost += cost;
        this.metrics.lastRequestTime = new Date();
        // Calculate error rate
        this.metrics.uptime = this.metrics.totalRequests > 0
            ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
            : 0;
        this.emit('metricsUpdated', this.metrics);
    }
    /**
     * Initialize health status
     */
    initializeHealth() {
        return {
            status: 'unhealthy',
            lastCheck: new Date(),
            responseTime: 0,
            errorRate: 0,
            availability: 0,
            details: {
                endpoint: this.config.baseUrl || 'unknown',
                consecutiveFailures: 0
            }
        };
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            cacheHitRate: 0,
            uptime: 0
        };
    }
}
/**
 * Provider error types
 */
export class ProviderError extends Error {
    provider;
    code;
    retryable;
    constructor(message, provider, code, retryable = false) {
        super(message);
        this.provider = provider;
        this.code = code;
        this.retryable = retryable;
        this.name = 'ProviderError';
    }
}
export class ProviderRateLimitError extends ProviderError {
    constructor(provider, retryAfter) {
        super(`Rate limit exceeded for provider ${provider}`, provider, 'RATE_LIMIT', true);
        this.name = 'ProviderRateLimitError';
    }
}
export class ProviderConnectionError extends ProviderError {
    constructor(provider, cause) {
        super(`Connection failed for provider ${provider}: ${cause?.message || 'Unknown error'}`, provider, 'CONNECTION_ERROR', true);
        this.name = 'ProviderConnectionError';
    }
}
export class ProviderAuthenticationError extends ProviderError {
    constructor(provider) {
        super(`Authentication failed for provider ${provider}`, provider, 'AUTH_ERROR', false);
        this.name = 'ProviderAuthenticationError';
    }
}
//# sourceMappingURL=base-provider.js.map