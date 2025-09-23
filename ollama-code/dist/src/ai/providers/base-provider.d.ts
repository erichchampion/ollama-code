/**
 * Base AI Provider Interface
 *
 * Defines the unified interface for all AI providers (Ollama, OpenAI, Anthropic, Google)
 * with standardized capabilities, error handling, and performance monitoring.
 */
import { EventEmitter } from 'events';
export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
}
export interface AICompletionOptions {
    model?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    stopSequences?: string[];
    stream?: boolean;
    system?: string;
    context?: any;
    format?: string;
    timeout?: number;
}
export interface AICompletionResponse {
    content: string;
    model: string;
    finishReason: 'stop' | 'length' | 'content_filter' | 'function_call' | 'error';
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata: {
        requestId: string;
        processingTime: number;
        provider: string;
        cached?: boolean;
        retryCount?: number;
    };
}
export interface AIStreamEvent {
    content: string;
    done: boolean;
    delta?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata?: Record<string, any>;
}
export interface AIModel {
    id: string;
    name: string;
    provider: string;
    capabilities: AICapability[];
    contextWindow: number;
    costPerToken: {
        input: number;
        output: number;
    };
    averageResponseTime: number;
    qualityScore: number;
    lastUpdated: Date;
}
export declare enum AICapability {
    TEXT_COMPLETION = "text_completion",
    CHAT = "chat",
    CODE_GENERATION = "code_generation",
    CODE_ANALYSIS = "code_analysis",
    FUNCTION_CALLING = "function_calling",
    STREAMING = "streaming",
    EMBEDDINGS = "embeddings",
    IMAGE_ANALYSIS = "image_analysis",
    DOCUMENT_ANALYSIS = "document_analysis",
    REASONING = "reasoning",
    MATH = "math",
    TRANSLATION = "translation"
}
export interface ProviderCapabilities {
    maxContextWindow: number;
    supportedCapabilities: AICapability[];
    rateLimits: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
    features: {
        streaming: boolean;
        functionCalling: boolean;
        imageInput: boolean;
        documentInput: boolean;
        customInstructions: boolean;
    };
}
export interface ProviderConfig {
    name: string;
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    retryOptions?: {
        maxRetries: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };
    rateLimiting?: {
        enabled: boolean;
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
    caching?: {
        enabled: boolean;
        ttlMs: number;
    };
}
export interface ProviderHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    responseTime: number;
    errorRate: number;
    availability: number;
    details: {
        endpoint: string;
        lastError?: string;
        consecutiveFailures: number;
        lastSuccessfulRequest?: Date;
    };
}
export interface ProviderMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    totalCost: number;
    cacheHitRate: number;
    lastRequestTime?: Date;
    uptime: number;
}
/**
 * Abstract base class for all AI providers
 */
export declare abstract class BaseAIProvider extends EventEmitter {
    protected config: ProviderConfig;
    protected health: ProviderHealth;
    protected metrics: ProviderMetrics;
    protected isInitialized: boolean;
    constructor(config: ProviderConfig);
    /**
     * Get provider name
     */
    abstract getName(): string;
    /**
     * Get provider display name
     */
    getDisplayName(): string;
    /**
     * Get provider capabilities
     */
    abstract getCapabilities(): ProviderCapabilities;
    /**
     * Initialize the provider
     */
    abstract initialize(): Promise<void>;
    /**
     * Test connection to the provider
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Complete text/chat request
     */
    abstract complete(prompt: string | AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
    /**
     * Stream completion request
     */
    abstract completeStream(prompt: string | AIMessage[], options: AICompletionOptions, onEvent: (event: AIStreamEvent) => void, abortSignal?: AbortSignal): Promise<void>;
    /**
     * List available models
     */
    abstract listModels(): Promise<AIModel[]>;
    /**
     * Get specific model information
     */
    abstract getModel(modelId: string): Promise<AIModel | null>;
    /**
     * Calculate cost for a request
     */
    abstract calculateCost(promptTokens: number, completionTokens: number, model?: string): number;
    /**
     * Get provider health status
     */
    getHealth(): ProviderHealth;
    /**
     * Get provider metrics
     */
    getMetrics(): ProviderMetrics;
    /**
     * Check if provider supports a capability
     */
    supportsCapability(capability: AICapability): boolean;
    /**
     * Get provider configuration
     */
    getConfig(): ProviderConfig;
    /**
     * Update provider configuration
     */
    updateConfig(config: Partial<ProviderConfig>): void;
    /**
     * Cleanup provider resources
     */
    cleanup(): Promise<void>;
    /**
     * Check if provider is initialized
     */
    isReady(): boolean;
    /**
     * Perform health check
     */
    performHealthCheck(): Promise<void>;
    /**
     * Update metrics after a request
     */
    protected updateMetrics(success: boolean, responseTime: number, tokensUsed?: number, cost?: number): void;
    /**
     * Initialize health status
     */
    private initializeHealth;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
}
/**
 * Provider error types
 */
export declare class ProviderError extends Error {
    provider: string;
    code?: string | undefined;
    retryable: boolean;
    constructor(message: string, provider: string, code?: string | undefined, retryable?: boolean);
}
export declare class ProviderRateLimitError extends ProviderError {
    constructor(provider: string, retryAfter?: number);
}
export declare class ProviderConnectionError extends ProviderError {
    constructor(provider: string, cause?: Error);
}
export declare class ProviderAuthenticationError extends ProviderError {
    constructor(provider: string);
}
