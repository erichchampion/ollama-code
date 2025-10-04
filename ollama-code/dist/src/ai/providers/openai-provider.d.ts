/**
 * OpenAI Provider Implementation
 *
 * Implements the BaseAIProvider interface for OpenAI's GPT models,
 * providing high-quality text generation, code completion, and reasoning capabilities.
 */
import { BaseAIProvider, AIMessage, AICompletionOptions, AICompletionResponse, AIStreamEvent, AIModel, ProviderCapabilities, ProviderConfig } from './base-provider.js';
/**
 * OpenAI Provider
 */
export declare class OpenAIProvider extends BaseAIProvider {
    private baseUrl;
    private apiKey;
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
     * Send a request to the OpenAI API
     */
    private sendRequest;
    /**
     * Send a streaming request to the OpenAI API
     */
    private sendStreamRequest;
    /**
     * Handle error responses from the OpenAI API
     */
    private handleErrorResponse;
    /**
     * Map OpenAI finish reason to standard format
     */
    private mapFinishReason;
    /**
     * Get capabilities for a specific model
     */
    private getModelCapabilities;
    /**
     * Get context window size for a specific model
     */
    private getModelContextWindow;
    /**
     * Get cost per token for a specific model
     */
    private getModelCostPerToken;
    /**
     * Get quality score for a specific model (subjective, based on benchmarks)
     */
    private getModelQualityScore;
}
