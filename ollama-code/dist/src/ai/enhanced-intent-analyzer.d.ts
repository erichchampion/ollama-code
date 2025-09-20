/**
 * Enhanced Intent Analyzer
 *
 * Advanced intent analysis with timeout protection, multi-strategy fallback,
 * and robust error handling for complex query processing.
 */
import { UserIntent, AnalysisContext } from './intent-analyzer.js';
export declare class EnhancedIntentAnalyzer {
    private aiClient;
    private responseCache;
    private patternRules;
    constructor(aiClient: any);
    /**
     * Analyze user intent with multi-strategy fallback and timeout protection
     */
    analyze(input: string, context?: AnalysisContext, timeout?: number): Promise<UserIntent>;
    /**
     * Quick pattern matching for common queries
     */
    quickPatternMatch(input: string): Promise<UserIntent>;
    /**
     * AI analysis with timeout protection
     */
    private aiAnalysisWithTimeout;
    /**
     * Template-based analysis for structured queries
     */
    private templateBasedAnalysis;
    /**
     * Minimalist fallback for unrecognized queries
     */
    minimalistFallback(input: string): Promise<UserIntent>;
    /**
     * Validate intent structure
     */
    validateIntent(intent: any): intent is UserIntent;
    /**
     * Get cache size for testing
     */
    getCacheSize(): number;
    /**
     * Initialize pattern matching rules
     */
    private initializePatternRules;
    /**
     * Extract entities from input text
     */
    private extractFiles;
    private extractDirectories;
    private extractFunctions;
    private extractClasses;
    private extractTechnologies;
    private extractConcepts;
    private extractVariables;
    private extractAllEntities;
    /**
     * Utility methods
     */
    private isMultiStep;
    private estimateDuration;
    private assessRiskLevel;
    private generateCacheKey;
    private isCacheEntryValid;
    private createTimeoutPromise;
    private buildAnalysisPrompt;
    private parseAIResponse;
    private createEmergencyFallback;
}
