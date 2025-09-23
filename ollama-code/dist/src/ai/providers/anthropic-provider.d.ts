/**
 * Anthropic Provider Implementation
 *
 * Implements the BaseAIProvider interface for Anthropic's Claude models,
 * providing high-quality reasoning, analysis, and long-context capabilities.
 */
import { BaseAIProvider, AIMessage, AICompletionOptions, AICompletionResponse, AIStreamEvent, AIModel, ProviderCapabilities, ProviderConfig } from './base-provider.js';
/**
 * Anthropic Provider
 */
export declare class AnthropicProvider extends BaseAIProvider {
    private baseUrl;
    private apiKey;
    private defaultMaxTokens;
    constructor(config: ProviderConfig);
    getName(): string;
    getCapabilities(): ProviderCapabilities;
    initialize(): Promise<void>;
    testConnection(): Promise<boolean>;
    complete(prompt: string | AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
    completeStream(prompt: string | AIMessage[], options: AICompletionOptions, onEvent: (event: AIStreamEvent) => void, abortSignal?: AbortSignal): Promise<void>;
    listModels(): Promise<AIModel[]>;
    getModel(modelId: string): Promise<AIModel | null>;
    calculateCost(promptTokens: number, completionTokens: number, model?: string): number;
    /**
     * Get request headers
     */
    private getHeaders;
    /**
     * Send a request to the Anthropic API
     */
    private sendRequest;
    /**
     * Send a streaming request to the Anthropic API
     */
    private sendStreamRequest;
    /**
     * Handle error responses from the Anthropic API
     */
    private handleErrorResponse;
    /**
     * Map Anthropic stop reason to standard format
     */
    private mapStopReason;
    /**
     * Get capabilities for a specific model
     */
    private getModelCapabilities;
    /**
     * Get cost per token for a specific model
     */
    private getModelCostPerToken;
}
