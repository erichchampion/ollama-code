/**
 * Ollama AI Client
 *
 * Handles interaction with Ollama API for local model inference,
 * including text completion, chat, and model management features.
 */
export interface OllamaMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface OllamaCompletionOptions {
    model?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    repeatPenalty?: number;
    stopSequences?: string[];
    stream?: boolean;
    system?: string;
    context?: number[];
    format?: string;
}
export interface OllamaCompletionRequest {
    model: string;
    messages: OllamaMessage[];
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    stop?: string[];
    stream?: boolean;
    system?: string;
    context?: number[];
    format?: string;
}
export interface OllamaCompletionResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
    context?: number[];
}
export interface OllamaStreamEvent {
    model: string;
    created_at: string;
    message?: {
        role: string;
        content: string;
    };
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
    context?: number[];
}
export interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details?: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}
export interface OllamaModelListResponse {
    models: OllamaModel[];
}
interface OllamaClientConfig {
    apiBaseUrl: string;
    timeout: number;
    retryOptions: {
        maxRetries: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };
    defaultModel: string;
    defaultTemperature: number;
    defaultTopP: number;
    defaultTopK: number;
}
/**
 * Ollama AI client for interacting with local Ollama server
 */
export declare class OllamaClient {
    private config;
    private baseUrl;
    /**
     * Create a new Ollama client
     */
    constructor(config?: Partial<OllamaClientConfig>);
    /**
     * Format API request headers
     */
    private getHeaders;
    /**
     * Send a completion request to Ollama
     */
    complete(prompt: string | OllamaMessage[], options?: OllamaCompletionOptions): Promise<OllamaCompletionResponse>;
    /**
     * Send a streaming completion request to Ollama
     */
    completeStream(prompt: string | OllamaMessage[], options: OllamaCompletionOptions | undefined, onEvent: (event: OllamaStreamEvent) => void, abortSignal?: AbortSignal): Promise<void>;
    /**
     * List available models
     */
    listModels(): Promise<OllamaModel[]>;
    /**
     * Pull/download a model
     */
    pullModel(modelName: string): Promise<void>;
    /**
     * Test the connection to the Ollama server
     */
    testConnection(): Promise<boolean>;
    /**
     * Send a request to the Ollama API
     */
    private sendRequest;
    /**
     * Send a streaming request to the Ollama API
     */
    private sendStreamRequest;
    /**
     * Handle error responses from the API
     */
    private handleErrorResponse;
}
export {};
