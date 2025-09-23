/**
 * Google Gemini AI Provider
 *
 * Implements the BaseAIProvider interface for Google's Gemini models
 * with multimodal capabilities, function calling, and streaming support.
 */
import { BaseAIProvider, AICompletionOptions, AICompletionResponse, AIStreamEvent, AIMessage, ProviderCapabilities, ProviderHealth, ProviderConfig, AIModel } from './base-provider.js';
export interface GoogleConfig extends ProviderConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
    projectId?: string;
    location?: string;
}
export interface GeminiGenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    candidateCount?: number;
}
export interface GeminiContent {
    role: 'user' | 'model';
    parts: Array<{
        text?: string;
        inline_data?: {
            mime_type: string;
            data: string;
        };
        function_call?: {
            name: string;
            args: Record<string, any>;
        };
        function_response?: {
            name: string;
            response: Record<string, any>;
        };
    }>;
}
export interface GeminiSafetySettings {
    category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
    threshold: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE';
}
export interface GeminiGenerateContentRequest {
    contents: GeminiContent[];
    generationConfig?: GeminiGenerationConfig;
    safetySettings?: GeminiSafetySettings[];
    tools?: Array<{
        functionDeclarations: Array<{
            name: string;
            description: string;
            parameters: Record<string, any>;
        }>;
    }>;
    systemInstruction?: {
        parts: Array<{
            text: string;
        }>;
    };
}
export interface GeminiGenerateContentResponse {
    candidates: Array<{
        content: GeminiContent;
        finishReason: 'FINISH_REASON_UNSPECIFIED' | 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
        index: number;
        safetyRatings?: Array<{
            category: string;
            probability: string;
        }>;
    }>;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}
export declare class GoogleProvider extends BaseAIProvider {
    private baseURL;
    constructor(config: GoogleConfig);
    getName(): string;
    getDisplayName(): string;
    getCapabilities(): ProviderCapabilities;
    getDefaultModel(): string;
    initialize(): Promise<void>;
    testConnection(): Promise<boolean>;
    checkHealth(): Promise<ProviderHealth>;
    complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
    completeStream(prompt: string | AIMessage[], options: AICompletionOptions | undefined, onEvent: (event: AIStreamEvent) => void, abortSignal?: AbortSignal): Promise<void>;
    listModels(): Promise<AIModel[]>;
    getModel(modelId: string): Promise<AIModel | null>;
    calculateCost(promptTokens: number, completionTokens: number, model?: string): number;
    stream(messages: AIMessage[], options?: AICompletionOptions): AsyncGenerator<AIStreamEvent, void, unknown>;
    private buildRequest;
    private makeRequest;
    private extractContentFromCandidate;
    private mapFinishReason;
    private handleError;
}
export declare function createGoogleProvider(config: GoogleConfig): GoogleProvider;
export declare const GOOGLE_MODELS: {
    readonly 'gemini-1.5-pro-latest': {
        readonly name: "Gemini 1.5 Pro (Latest)";
        readonly contextLength: 2000000;
        readonly capabilities: readonly ["text", "code", "vision", "function_calling"];
    };
    readonly 'gemini-1.5-flash-latest': {
        readonly name: "Gemini 1.5 Flash (Latest)";
        readonly contextLength: 1000000;
        readonly capabilities: readonly ["text", "code", "vision"];
    };
    readonly 'gemini-pro': {
        readonly name: "Gemini Pro";
        readonly contextLength: 32000;
        readonly capabilities: readonly ["text", "code"];
    };
    readonly 'gemini-pro-vision': {
        readonly name: "Gemini Pro Vision";
        readonly contextLength: 16000;
        readonly capabilities: readonly ["text", "code", "vision"];
    };
};
