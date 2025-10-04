/**
 * Multi-Step Query Processor
 *
 * Enables context-aware multi-step query processing with intelligent follow-up
 * detection, query chaining, and progressive disclosure capabilities.
 */
import { ProjectContext } from './context.js';
import { UserIntent } from './intent-analyzer.js';
import { ConversationManager } from './conversation-manager.js';
export interface QuerySession {
    id: string;
    initialQuery: string;
    context: QuerySessionContext;
    queries: QueryInfo[];
    results: QueryResult[];
    currentStep: number;
    isComplete: boolean;
    startTime: Date;
    endTime?: Date;
    metadata: {
        totalQueries: number;
        followUpQueries: number;
        chainedQueries: number;
        averageConfidence: number;
    };
}
export interface QueryInfo {
    id: string;
    text: string;
    timestamp: Date;
    type: 'initial' | 'followup' | 'chained' | 'refined';
    isFollowUp: boolean;
    context: QueryContext;
    intent?: UserIntent;
    confidence?: number;
}
export interface QueryResult {
    queryId: string;
    content: string;
    suggestions: string[];
    needsFollowUp: boolean;
    confidence: number;
    processingTime: number;
    metadata: {
        tokensUsed?: number;
        complexityLevel: 'simple' | 'moderate' | 'complex';
        requiresRefinement: boolean;
    };
}
export interface QuerySessionContext {
    projectContext?: ProjectContext;
    conversationManager?: ConversationManager;
    userPreferences: {
        verbosity: 'minimal' | 'standard' | 'detailed';
        autoSuggest: boolean;
        maxSuggestions: number;
    };
    workingDirectory: string;
}
export interface QueryContext {
    previousQueries: string[];
    previousResults: string[];
    projectContext?: ProjectContext;
    conversationHistory: any[];
    semanticContext: {
        topics: string[];
        entities: string[];
        relationships: string[];
    };
}
export interface QueryChainOptions {
    maxChainLength?: number;
    confidenceThreshold?: number;
    timeoutMs?: number;
}
export interface SuggestionConfig {
    maxSuggestions: number;
    includeExamples: boolean;
    contextAware: boolean;
    prioritizeRecent: boolean;
}
export declare class MultiStepQueryProcessor {
    private aiClient;
    private projectContext?;
    private intentAnalyzer?;
    private conversationManager?;
    private querySession;
    private suggestionConfig;
    private readonly followUpPatterns;
    private readonly refinementPatterns;
    constructor(aiClient: any, projectContext?: ProjectContext, conversationManager?: ConversationManager);
    /**
     * Start a new multi-step query session
     */
    startQuerySession(initialQuery: string, context?: Partial<QuerySessionContext>): Promise<QuerySession>;
    /**
     * Process a query within the current session
     */
    processQuery(query: string, options?: {
        type?: QueryInfo['type'];
    }): Promise<QueryResult>;
    /**
     * Chain a query with a refinement
     */
    chainQuery(baseQuery: string, refinement: string): Promise<QueryResult>;
    /**
     * Refine a previous query with additional context
     */
    refineQuery(originalQuery: string, refinement: string): Promise<QueryResult>;
    /**
     * Detect if a query is a follow-up to previous queries
     */
    isFollowUpQuery(query: string): boolean;
    /**
     * Build context for query processing
     */
    private buildQueryContext;
    /**
     * Extract semantic context from query and history
     */
    private extractSemanticContext;
    /**
     * Process query with AI
     */
    private processWithAI;
    /**
     * Build AI processing prompt with context
     */
    private buildProcessingPrompt;
    /**
     * Generate contextual suggestions for follow-up queries
     */
    private generateSuggestions;
    /**
     * Detect if the query/result combination needs follow-up
     */
    private detectFollowUpNeeds;
    /**
     * Assess query complexity
     */
    private assessComplexity;
    /**
     * Check if result requires refinement
     */
    private requiresRefinement;
    /**
     * Update session metadata
     */
    private updateSessionMetadata;
    /**
     * Get current query session
     */
    getQuerySession(): QuerySession | null;
    /**
     * End current query session
     */
    endQuerySession(): QuerySession | null;
    /**
     * Update suggestion configuration
     */
    updateSuggestionConfig(config: Partial<SuggestionConfig>): void;
}
