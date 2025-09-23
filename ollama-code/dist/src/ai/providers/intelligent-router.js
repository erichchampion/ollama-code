/**
 * Intelligent AI Router
 *
 * Routes AI requests to the optimal provider based on capabilities, cost,
 * performance, and current provider health. Implements fallback chains
 * and circuit breaker patterns for reliability.
 */
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';
import { AICapability, ProviderError } from './base-provider.js';
export const ROUTING_STRATEGIES = {
    PERFORMANCE: { name: 'performance', priority: 1, description: 'Route to fastest provider' },
    COST: { name: 'cost', priority: 2, description: 'Route to most cost-effective provider' },
    QUALITY: { name: 'quality', priority: 3, description: 'Route to highest quality provider' },
    CAPABILITY: { name: 'capability', priority: 4, description: 'Route based on required capabilities' },
    ROUND_ROBIN: { name: 'round_robin', priority: 5, description: 'Distribute load evenly' },
    STICKY: { name: 'sticky', priority: 6, description: 'Prefer same provider for session' }
};
/**
 * Intelligent AI Router
 */
export class IntelligentAIRouter extends EventEmitter {
    providers = new Map();
    config;
    metrics;
    lastUsedProvider = new Map(); // sessionId -> providerId
    roundRobinIndex = 0;
    circuitBreakers = new Map();
    performanceHistory = new Map();
    healthCheckInterval;
    constructor(config = {}) {
        super();
        this.config = {
            defaultStrategy: 'capability',
            fallbackEnabled: true,
            circuitBreakerThreshold: 5,
            healthCheckInterval: 30000, // 30 seconds
            performanceWindowMs: 300000, // 5 minutes
            costOptimizationEnabled: true,
            qualityThreshold: 70,
            loadBalancingEnabled: true,
            ...config
        };
        this.metrics = this.initializeMetrics();
        this.startHealthChecking();
    }
    /**
     * Register a provider with the router
     */
    async registerProvider(provider) {
        const providerName = provider.getName().toLowerCase();
        logger.info(`Registering AI provider: ${providerName}`);
        // Initialize provider if not already done
        if (!provider.isReady()) {
            await provider.initialize();
        }
        this.providers.set(providerName, provider);
        this.circuitBreakers.set(providerName, new CircuitBreakerState());
        this.performanceHistory.set(providerName, []);
        // Set up provider event listeners
        provider.on('healthUpdated', (health) => {
            this.updateCircuitBreaker(providerName, health.status === 'healthy');
        });
        provider.on('metricsUpdated', (metrics) => {
            this.updatePerformanceHistory(providerName, metrics);
        });
        this.emit('providerRegistered', { provider: providerName, capabilities: provider.getCapabilities() });
        logger.info(`AI provider registered successfully: ${providerName}`);
    }
    /**
     * Unregister a provider
     */
    async unregisterProvider(providerName) {
        const provider = this.providers.get(providerName.toLowerCase());
        if (!provider)
            return;
        logger.info(`Unregistering AI provider: ${providerName}`);
        await provider.cleanup();
        this.providers.delete(providerName.toLowerCase());
        this.circuitBreakers.delete(providerName.toLowerCase());
        this.performanceHistory.delete(providerName.toLowerCase());
        this.emit('providerUnregistered', { provider: providerName });
        logger.info(`AI provider unregistered: ${providerName}`);
    }
    /**
     * Route a completion request to the optimal provider
     */
    async route(prompt, options = {}, context = {}) {
        const startTime = Date.now();
        try {
            // Make routing decision
            const decision = await this.makeRoutingDecision(context, options);
            logger.debug('Routing decision made', {
                provider: decision.provider.getName(),
                reasoning: decision.reasoning,
                confidence: decision.confidence
            });
            // Attempt request with primary provider
            try {
                const response = await decision.provider.complete(prompt, options);
                // Update metrics
                this.updateSuccessMetrics(startTime, decision.provider.getName());
                return response;
            }
            catch (error) {
                // Handle provider-specific errors and attempt fallback
                if (this.config.fallbackEnabled && decision.fallbackProviders.length > 0) {
                    logger.warn(`Primary provider failed, attempting fallback`, {
                        primary: decision.provider.getName(),
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                    return await this.attemptFallback(decision.fallbackProviders, prompt, options, startTime);
                }
                throw error;
            }
        }
        catch (error) {
            this.updateFailureMetrics(startTime);
            logger.error('AI routing failed:', error);
            throw error;
        }
    }
    /**
     * Route a streaming completion request
     */
    async routeStream(prompt, options, onEvent, context = {}, abortSignal) {
        const startTime = Date.now();
        try {
            // Make routing decision (prefer streaming-capable providers)
            const streamingContext = {
                ...context,
                requiredCapabilities: [...(context.requiredCapabilities || []), AICapability.STREAMING],
                requestType: 'streaming'
            };
            const decision = await this.makeRoutingDecision(streamingContext, options);
            logger.debug('Streaming routing decision made', {
                provider: decision.provider.getName(),
                reasoning: decision.reasoning
            });
            // Attempt streaming request
            try {
                await decision.provider.completeStream(prompt, options, onEvent, abortSignal);
                this.updateSuccessMetrics(startTime, decision.provider.getName());
            }
            catch (error) {
                // For streaming, fallback is more complex, so we'll just fail for now
                // In a production system, you might implement stream resumption
                this.updateFailureMetrics(startTime);
                throw error;
            }
        }
        catch (error) {
            logger.error('AI streaming routing failed:', error);
            throw error;
        }
    }
    /**
     * Get the best provider for specific capabilities
     */
    async getBestProvider(context = {}) {
        try {
            const decision = await this.makeRoutingDecision(context);
            return decision.provider;
        }
        catch {
            return null;
        }
    }
    /**
     * List all available models across all providers
     */
    async getAllModels() {
        const allModels = [];
        for (const [providerName, provider] of this.providers) {
            try {
                const models = await provider.listModels();
                allModels.push(...models);
            }
            catch (error) {
                logger.warn(`Failed to get models from provider ${providerName}:`, error);
            }
        }
        return allModels;
    }
    /**
     * Get router metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get provider status summary
     */
    getProviderStatus() {
        const status = {};
        for (const [name, provider] of this.providers) {
            const health = provider.getHealth();
            const metrics = provider.getMetrics();
            const circuitBreaker = this.circuitBreakers.get(name);
            status[name] = {
                health: health.status,
                isReady: provider.isReady(),
                circuitBreaker: circuitBreaker?.state || 'unknown',
                responseTime: health.responseTime,
                successRate: metrics.totalRequests > 0
                    ? (metrics.successfulRequests / metrics.totalRequests) * 100
                    : 0,
                totalRequests: metrics.totalRequests,
                capabilities: provider.getCapabilities().supportedCapabilities
            };
        }
        return status;
    }
    /**
     * Cleanup router resources
     */
    async cleanup() {
        logger.info('Cleaning up AI router');
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        // Cleanup all providers
        for (const provider of this.providers.values()) {
            await provider.cleanup();
        }
        this.providers.clear();
        this.circuitBreakers.clear();
        this.performanceHistory.clear();
        this.removeAllListeners();
        logger.info('AI router cleanup completed');
    }
    /**
     * Make routing decision based on context and strategy
     */
    async makeRoutingDecision(context = {}, options = {}) {
        const startTime = Date.now();
        // Get available providers (healthy and not circuit-broken)
        const availableProviders = this.getAvailableProviders(context.requiredCapabilities || []);
        if (availableProviders.length === 0) {
            throw new ProviderError('No available providers found', 'router', 'NO_PROVIDERS');
        }
        // Apply routing strategy
        const strategy = this.config.defaultStrategy;
        let selectedProvider;
        let reasoning;
        let confidence;
        switch (strategy) {
            case 'performance':
                ({ provider: selectedProvider, reasoning, confidence } = this.selectByPerformance(availableProviders));
                break;
            case 'cost':
                ({ provider: selectedProvider, reasoning, confidence } = this.selectByCost(availableProviders, options));
                break;
            case 'quality':
                ({ provider: selectedProvider, reasoning, confidence } = this.selectByQuality(availableProviders));
                break;
            case 'round_robin':
                ({ provider: selectedProvider, reasoning, confidence } = this.selectRoundRobin(availableProviders));
                break;
            case 'sticky':
                ({ provider: selectedProvider, reasoning, confidence } = this.selectSticky(availableProviders, context.sessionId));
                break;
            default: // capability
                ({ provider: selectedProvider, reasoning, confidence } = this.selectByCapability(availableProviders, context));
        }
        // Prepare fallback providers
        const fallbackProviders = availableProviders.filter(p => p !== selectedProvider);
        // Estimate cost and response time
        const estimatedCost = selectedProvider.calculateCost(1000, 500, options.model); // Rough estimate
        const estimatedResponseTime = selectedProvider.getHealth().responseTime || 0;
        const decisionTime = Date.now() - startTime;
        this.updateDecisionMetrics(decisionTime);
        return {
            provider: selectedProvider,
            reasoning,
            confidence,
            fallbackProviders,
            estimatedCost,
            estimatedResponseTime
        };
    }
    /**
     * Get providers that are available and support required capabilities
     */
    getAvailableProviders(requiredCapabilities) {
        const available = [];
        for (const [name, provider] of this.providers) {
            // Check if provider is healthy and ready
            if (!provider.isReady())
                continue;
            // Check circuit breaker
            const circuitBreaker = this.circuitBreakers.get(name);
            if (circuitBreaker?.state === 'open')
                continue;
            // Check capabilities
            const capabilities = provider.getCapabilities();
            const hasRequiredCapabilities = requiredCapabilities.every(cap => capabilities.supportedCapabilities.includes(cap));
            if (hasRequiredCapabilities) {
                available.push(provider);
            }
        }
        return available;
    }
    /**
     * Select provider by performance (fastest response time)
     */
    selectByPerformance(providers) {
        let bestProvider = providers[0];
        let bestResponseTime = bestProvider.getHealth().responseTime;
        for (const provider of providers.slice(1)) {
            const responseTime = provider.getHealth().responseTime;
            if (responseTime < bestResponseTime) {
                bestProvider = provider;
                bestResponseTime = responseTime;
            }
        }
        return {
            provider: bestProvider,
            reasoning: `Selected ${bestProvider.getName()} for best performance (${bestResponseTime}ms response time)`,
            confidence: 0.8
        };
    }
    /**
     * Select provider by cost (lowest cost per token)
     */
    selectByCost(providers, options) {
        let bestProvider = providers[0];
        let bestCost = bestProvider.calculateCost(1000, 500, options.model);
        for (const provider of providers.slice(1)) {
            const cost = provider.calculateCost(1000, 500, options.model);
            if (cost < bestCost) {
                bestProvider = provider;
                bestCost = cost;
            }
        }
        return {
            provider: bestProvider,
            reasoning: `Selected ${bestProvider.getName()} for lowest cost ($${bestCost.toFixed(4)} per 1500 tokens)`,
            confidence: 0.9
        };
    }
    /**
     * Select provider by quality (highest quality score)
     */
    selectByQuality(providers) {
        // For now, use a simple heuristic based on provider name
        // In production, this would use actual quality metrics
        const qualityScores = new Map([
            ['ollama', 85],
            ['openai', 95],
            ['anthropic', 92],
            ['google', 88]
        ]);
        let bestProvider = providers[0];
        let bestScore = qualityScores.get(bestProvider.getName().toLowerCase()) || 70;
        for (const provider of providers.slice(1)) {
            const score = qualityScores.get(provider.getName().toLowerCase()) || 70;
            if (score > bestScore) {
                bestProvider = provider;
                bestScore = score;
            }
        }
        return {
            provider: bestProvider,
            reasoning: `Selected ${bestProvider.getName()} for highest quality (score: ${bestScore}/100)`,
            confidence: 0.7
        };
    }
    /**
     * Select provider using round-robin distribution
     */
    selectRoundRobin(providers) {
        const selectedProvider = providers[this.roundRobinIndex % providers.length];
        this.roundRobinIndex++;
        return {
            provider: selectedProvider,
            reasoning: `Selected ${selectedProvider.getName()} using round-robin load balancing`,
            confidence: 0.6
        };
    }
    /**
     * Select provider with session stickiness
     */
    selectSticky(providers, sessionId) {
        if (sessionId) {
            const lastUsed = this.lastUsedProvider.get(sessionId);
            const stickyProvider = providers.find(p => p.getName().toLowerCase() === lastUsed);
            if (stickyProvider) {
                return {
                    provider: stickyProvider,
                    reasoning: `Selected ${stickyProvider.getName()} for session stickiness`,
                    confidence: 0.9
                };
            }
        }
        // Fallback to first available provider
        const selectedProvider = providers[0];
        if (sessionId) {
            this.lastUsedProvider.set(sessionId, selectedProvider.getName().toLowerCase());
        }
        return {
            provider: selectedProvider,
            reasoning: `Selected ${selectedProvider.getName()} as session default`,
            confidence: 0.7
        };
    }
    /**
     * Select provider by capability matching
     */
    selectByCapability(providers, context) {
        // For now, just return the first provider that matches capabilities
        // In production, this would do more sophisticated capability scoring
        const selectedProvider = providers[0];
        return {
            provider: selectedProvider,
            reasoning: `Selected ${selectedProvider.getName()} based on capability matching`,
            confidence: 0.8
        };
    }
    /**
     * Attempt fallback to alternative providers
     */
    async attemptFallback(fallbackProviders, prompt, options, startTime) {
        for (const fallbackProvider of fallbackProviders) {
            try {
                logger.info(`Attempting fallback to ${fallbackProvider.getName()}`);
                const response = await fallbackProvider.complete(prompt, options);
                this.updateFallbackMetrics(startTime, fallbackProvider.getName());
                return response;
            }
            catch (error) {
                logger.warn(`Fallback provider ${fallbackProvider.getName()} also failed:`, error);
                continue;
            }
        }
        throw new ProviderError('All providers failed, no more fallbacks available', 'router', 'ALL_PROVIDERS_FAILED');
    }
    /**
     * Update circuit breaker state
     */
    updateCircuitBreaker(providerName, success) {
        const circuitBreaker = this.circuitBreakers.get(providerName);
        if (!circuitBreaker)
            return;
        if (success) {
            circuitBreaker.successCount++;
            if (circuitBreaker.state === 'half_open' && circuitBreaker.successCount >= 3) {
                circuitBreaker.state = 'closed';
                circuitBreaker.failureCount = 0;
                logger.info(`Circuit breaker closed for provider ${providerName}`);
            }
        }
        else {
            circuitBreaker.failureCount++;
            if (circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
                circuitBreaker.state = 'open';
                circuitBreaker.openedAt = Date.now();
                logger.warn(`Circuit breaker opened for provider ${providerName}`);
            }
        }
    }
    /**
     * Update performance history
     */
    updatePerformanceHistory(providerName, metrics) {
        const history = this.performanceHistory.get(providerName);
        if (!history)
            return;
        const dataPoint = {
            timestamp: Date.now(),
            responseTime: metrics.averageResponseTime,
            successRate: metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 0,
            requestCount: metrics.totalRequests
        };
        history.push(dataPoint);
        // Keep only recent data points (within performance window)
        const cutoffTime = Date.now() - this.config.performanceWindowMs;
        const filteredHistory = history.filter(point => point.timestamp > cutoffTime);
        this.performanceHistory.set(providerName, filteredHistory);
    }
    /**
     * Start health checking for circuit breakers
     */
    startHealthChecking() {
        this.healthCheckInterval = setInterval(() => {
            for (const [name, circuitBreaker] of this.circuitBreakers) {
                if (circuitBreaker.state === 'open') {
                    // Try to move to half-open after timeout
                    if (Date.now() - circuitBreaker.openedAt > 60000) { // 1 minute timeout
                        circuitBreaker.state = 'half_open';
                        circuitBreaker.successCount = 0;
                        logger.info(`Circuit breaker moved to half-open for provider ${name}`);
                    }
                }
            }
        }, this.config.healthCheckInterval);
    }
    /**
     * Update metrics for successful requests
     */
    updateSuccessMetrics(startTime, providerName) {
        this.metrics.totalRequests++;
        this.metrics.successfulRoutings++;
        const decisionTime = Date.now() - startTime;
        this.updateAverageDecisionTime(decisionTime);
    }
    /**
     * Update metrics for failed requests
     */
    updateFailureMetrics(startTime) {
        this.metrics.totalRequests++;
        const decisionTime = Date.now() - startTime;
        this.updateAverageDecisionTime(decisionTime);
    }
    /**
     * Update metrics for fallback usage
     */
    updateFallbackMetrics(startTime, providerName) {
        this.metrics.totalRequests++;
        this.metrics.successfulRoutings++;
        this.metrics.fallbacksUsed++;
        const decisionTime = Date.now() - startTime;
        this.updateAverageDecisionTime(decisionTime);
    }
    /**
     * Update decision time metrics
     */
    updateDecisionMetrics(decisionTime) {
        this.updateAverageDecisionTime(decisionTime);
    }
    /**
     * Update average decision time using exponential moving average
     */
    updateAverageDecisionTime(decisionTime) {
        if (this.metrics.totalRequests === 1) {
            this.metrics.averageDecisionTime = decisionTime;
        }
        else {
            const alpha = 0.1; // Smoothing factor
            this.metrics.averageDecisionTime = alpha * decisionTime + (1 - alpha) * this.metrics.averageDecisionTime;
        }
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        return {
            totalRequests: 0,
            successfulRoutings: 0,
            fallbacksUsed: 0,
            providerSwitches: 0,
            averageDecisionTime: 0,
            costSavings: 0,
            performanceGains: 0
        };
    }
}
/**
 * Circuit breaker state for providers
 */
class CircuitBreakerState {
    state = 'closed';
    failureCount = 0;
    successCount = 0;
    openedAt = 0;
}
//# sourceMappingURL=intelligent-router.js.map