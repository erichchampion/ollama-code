/**
 * Intent Analyzer
 *
 * Analyzes user input to determine intent, extract entities, and assess complexity
 * for autonomous task planning and execution.
 */
import { OllamaClient } from './ollama-client.js';
import { ProjectContext } from './context.js';
export interface UserIntent {
    type: 'task_request' | 'question' | 'command' | 'clarification' | 'conversation' | 'task_execution';
    action: string;
    entities: {
        files: string[];
        directories: string[];
        functions: string[];
        classes: string[];
        technologies: string[];
        concepts: string[];
        variables: string[];
    };
    confidence: number;
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    multiStep: boolean;
    requiresClarification: boolean;
    suggestedClarifications: string[];
    estimatedDuration: number;
    riskLevel: 'low' | 'medium' | 'high';
    context: {
        projectAware: boolean;
        fileSpecific: boolean;
        followUp: boolean;
        references: string[];
    };
}
export interface AnalysisContext {
    conversationHistory: string[];
    projectContext?: ProjectContext;
    workingDirectory: string;
    recentFiles: string[];
    lastIntent?: UserIntent;
}
export interface EntityExtractionResult {
    entities: UserIntent['entities'];
    confidence: number;
    ambiguousReferences: string[];
}
export declare class IntentAnalyzer {
    private aiClient;
    private entityPatterns;
    private intentKeywords;
    private complexityIndicators;
    constructor(aiClient: OllamaClient);
    /**
     * Analyze user input to determine intent and extract entities
     */
    analyze(input: string, context: AnalysisContext): Promise<UserIntent>;
    /**
     * Extract entities from user input using pattern matching and AI
     */
    private extractEntities;
    /**
     * Extract entities using pattern matching
     */
    private extractEntitiesWithPatterns;
    /**
     * Enhanced entity extraction using AI for complex cases
     */
    private extractEntitiesWithAI;
    /**
     * Classify the type of user intent
     */
    private classifyIntent;
    /**
     * Quick intent classification using keywords
     */
    private quickClassifyIntent;
    /**
     * AI-based intent classification
     */
    private aiClassifyIntent;
    /**
     * Extract the main action from the input
     */
    private extractAction;
    /**
     * Assess the complexity of the request
     */
    private assessComplexity;
    /**
     * Determine if this is a multi-step request
     */
    private isMultiStep;
    /**
     * Assess if clarification is needed
     */
    private assessClarificationNeeds;
    /**
     * Estimate duration for the task
     */
    private estimateDuration;
    /**
     * Assess risk level of the operation
     */
    private assessRiskLevel;
    /**
     * Build intent context information
     */
    private buildIntentContext;
    /**
     * Calculate overall confidence score
     */
    private calculateConfidence;
    /**
     * Initialize pattern matching rules
     */
    private initializePatterns;
    /**
     * Utility methods
     */
    private normalizeInput;
    private applyPatterns;
    private extractConcepts;
    private cleanEntities;
    private findAmbiguousReferences;
    private calculateEntityConfidence;
    private parseAIEntityResponse;
    private mergeEntities;
    private createFallbackIntent;
}
