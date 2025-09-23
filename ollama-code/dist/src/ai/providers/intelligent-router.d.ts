/**
 * Intelligent AI Router
 *
 * Routes AI requests to the optimal provider based on capabilities, cost,
 * performance, and current provider health. Implements fallback chains
 * and circuit breaker patterns for reliability.
 */
import { EventEmitter } from 'events';
import { BaseAIProvider, AIMessage, AICompletionOptions, AICompletionResponse, AIStreamEvent, AIModel, AICapability } from './base-provider.js';
export interface RoutingStrategy {
    name: string;
    priority: number;
    description: string;
}
export declare const ROUTING_STRATEGIES: {
    readonly PERFORMANCE: {
        readonly name: "performance";
        readonly priority: 1;
        readonly description: "Route to fastest provider";
    };
    readonly COST: {
        readonly name: "cost";
        readonly priority: 2;
        readonly description: "Route to most cost-effective provider";
    };
    readonly QUALITY: {
        readonly name: "quality";
        readonly priority: 3;
        readonly description: "Route to highest quality provider";
    };
    readonly CAPABILITY: {
        readonly name: "capability";
        readonly priority: 4;
        readonly description: "Route based on required capabilities";
    };
    readonly ROUND_ROBIN: {
        readonly name: "round_robin";
        readonly priority: 5;
        readonly description: "Distribute load evenly";
    };
    readonly STICKY: {
        readonly name: "sticky";
        readonly priority: 6;
        readonly description: "Prefer same provider for session";
    };
};
export interface RoutingContext {
    requiredCapabilities: AICapability[];
    preferredResponseTime: number;
    maxCostPerToken: number;
    prioritizeQuality: boolean;
    sessionId?: string;
    userId?: string;
    requestType: 'completion' | 'streaming' | 'analysis' | 'generation';
}
export interface RoutingDecision {
    provider: BaseAIProvider;
    reasoning: string;
    confidence: number;
    fallbackProviders: BaseAIProvider[];
    estimatedCost: number;
    estimatedResponseTime: number;
}
export interface RouterConfig {
    defaultStrategy: string;
    fallbackEnabled: boolean;
    circuitBreakerThreshold: number;
    healthCheckInterval: number;
    performanceWindowMs: number;
    costOptimizationEnabled: boolean;
    qualityThreshold: number;
    loadBalancingEnabled: boolean;
}
export interface RouterMetrics {
    totalRequests: number;
    successfulRoutings: number;
    fallbacksUsed: number;
    providerSwitches: number;
    averageDecisionTime: number;
    costSavings: number;
    performanceGains: number;
}
/**
 * Intelligent AI Router
 */
export declare class IntelligentAIRouter extends EventEmitter {
    private providers;
    private config;
    private metrics;
    private lastUsedProvider;
    private roundRobinIndex;
    private circuitBreakers;
    private performanceHistory;
    private healthCheckInterval?;
    constructor(config?: Partial<RouterConfig>);
    /**
     * Register a provider with the router
     */
    registerProvider(provider: BaseAIProvider): Promise<void>;
    /**
     * Unregister a provider
     */
    unregisterProvider(providerName: string): Promise<void>;
    /**
     * Route a completion request to the optimal provider
     */
    route(prompt: string | AIMessage[], options?: AICompletionOptions, context?: Partial<RoutingContext>): Promise<AICompletionResponse>;
    /**
     * Route a streaming completion request
     */
    routeStream(prompt: string | AIMessage[], options: AICompletionOptions, onEvent: (event: AIStreamEvent) => void, context?: Partial<RoutingContext>, abortSignal?: AbortSignal): Promise<void>;
    /**
     * Get the best provider for specific capabilities
     */
    getBestProvider(context?: Partial<RoutingContext>): Promise<BaseAIProvider | null>;
    /**
     * List all available models across all providers
     */
    getAllModels(): Promise<AIModel[]>;
    /**
     * Get router metrics
     */
    getMetrics(): RouterMetrics;
    /**
     * Get provider status summary
     */
    getProviderStatus(): Record<string, any>;
    /**
     * Cleanup router resources
     */
    cleanup(): Promise<void>;
    /**
     * Make routing decision based on context and strategy
     */
    private makeRoutingDecision;
    /**
     * Get providers that are available and support required capabilities
     */
    private getAvailableProviders;
    /**
     * Select provider by performance (fastest response time)
     */
    private selectByPerformance;
    /**
     * Select provider by cost (lowest cost per token)
     */
    private selectByCost;
    /**
     * Select provider by quality (highest quality score)
     */
    private selectByQuality;
    /**
     * Select provider using round-robin distribution
     */
    private selectRoundRobin;
    /**
     * Select provider with session stickiness
     */
    private selectSticky;
    /**
     * Select provider by capability matching
     */
    private selectByCapability;
    /**
     * Attempt fallback to alternative providers
     */
    private attemptFallback;
    /**
     * Update circuit breaker state
     */
    private updateCircuitBreaker;
    /**
     * Update performance history
     */
    private updatePerformanceHistory;
    /**
     * Start health checking for circuit breakers
     */
    private startHealthChecking;
    /**
     * Update metrics for successful requests
     */
    private updateSuccessMetrics;
    /**
     * Update metrics for failed requests
     */
    private updateFailureMetrics;
    /**
     * Update metrics for fallback usage
     */
    private updateFallbackMetrics;
    /**
     * Update decision time metrics
     */
    private updateDecisionMetrics;
    /**
     * Update average decision time using exponential moving average
     */
    private updateAverageDecisionTime;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
}
