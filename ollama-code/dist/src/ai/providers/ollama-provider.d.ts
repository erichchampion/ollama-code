/**
 * Ollama Provider Implementation
 *
 * Implements the BaseAIProvider interface for Ollama local models,
 * serving as the reference implementation and maintaining backward compatibility.
 */
import { BaseAIProvider, AIMessage, AICompletionOptions, AICompletionResponse, AIStreamEvent, AIModel, ProviderCapabilities, ProviderConfig } from './base-provider.js';
/**
 * Ollama AI Provider
 */
export declare class OllamaProvider extends BaseAIProvider {
    private baseUrl;
    private userAgent;
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
     * Send a request to the Ollama API
     */
    private sendRequest;
    /**
     * Send a streaming request to the Ollama API
     */
    private sendStreamRequest;
    /**
     * Handle error responses from the Ollama API
     */
    private handleErrorResponse;
    /**
     * Get capabilities for a specific model
     */
    private getModelCapabilities;
    /**
     * Get context window size for a specific model
     */
    private getModelContextWindow;
    /**
     * Get quality score for a specific model (subjective, based on benchmarks)
     */
    private getModelQualityScore;
}
