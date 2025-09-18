/**
 * Enhanced AI Client
 *
 * Provides advanced AI capabilities including multi-turn conversations,
 * context-aware prompting, tool use planning, and response quality validation.
 */
import { OllamaClient, OllamaCompletionOptions } from './ollama-client.js';
import { ProjectContext, ConversationTurn } from './context.js';
export interface ToolResult {
    toolName: string;
    result: any;
    data?: any;
    executionTime: number;
    success: boolean;
    error?: string;
}
export interface EnhancedCompletionOptions extends OllamaCompletionOptions {
    useProjectContext?: boolean;
    enableToolUse?: boolean;
    conversationId?: string;
    maxContextTokens?: number;
    responseQuality?: 'fast' | 'balanced' | 'high';
}
export interface AIResponse {
    content: string;
    confidence: number;
    toolsUsed: string[];
    filesReferenced: string[];
    metadata: {
        tokensUsed: number;
        executionTime: number;
        contextSize: number;
        qualityScore: number;
    };
    followUpSuggestions: string[];
}
export interface ToolUsePlan {
    tools: Array<{
        name: string;
        parameters: Record<string, any>;
        rationale: string;
        dependencies: string[];
    }>;
    executionOrder: string[];
    estimatedTime: number;
    confidence: number;
}
export interface ResponseValidation {
    isValid: boolean;
    confidence: number;
    issues: string[];
}
export declare class EnhancedAIClient {
    private baseClient;
    private projectContext;
    private toolOrchestrator;
    private conversations;
    private defaultOptions;
    constructor(baseClient: OllamaClient, projectContext?: ProjectContext, options?: Partial<EnhancedCompletionOptions>);
    /**
     * Initialize with project context
     */
    initializeWithProject(projectRoot: string): Promise<void>;
    /**
     * Enhanced completion with context awareness and tool use
     */
    complete(prompt: string, options?: EnhancedCompletionOptions): Promise<AIResponse>;
    /**
     * Stream completion with enhanced capabilities
     */
    completeStream(prompt: string, options: EnhancedCompletionOptions | undefined, onChunk: (chunk: {
        content: string;
        partial: AIResponse;
    }) => void, abortSignal?: AbortSignal): Promise<AIResponse>;
    /**
     * Build context-aware prompt with project information
     */
    private buildContextAwarePrompt;
    /**
     * Plan tool use based on user request
     */
    private planToolUse;
    /**
     * Execute planned tools
     */
    private executeToolPlan;
    /**
     * Generate AI response with tool results
     */
    private generateResponse;
    /**
     * Calculate response confidence score
     */
    private calculateConfidence;
    /**
     * Validate response quality
     */
    private validateResponseQuality;
    /**
     * Generate follow-up suggestions
     */
    private generateFollowUpSuggestions;
    /**
     * Estimate token count (simplified)
     */
    private estimateTokens;
    /**
     * Add conversation turn to history
     */
    private addConversationTurn;
    /**
     * Get conversation history
     */
    getConversationHistory(conversationId?: string): ConversationTurn[];
    /**
     * Clear conversation history
     */
    clearConversationHistory(conversationId?: string): void;
    /**
     * Get project context
     */
    getProjectContext(): ProjectContext | null;
    /**
     * Convert project summary to ProjectState format
     */
    private createProjectStateFromSummary;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
