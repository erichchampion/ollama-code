/**
 * Enhanced Fast-Path Router
 *
 * High-performance router that bypasses AI analysis for obvious commands.
 * Implements comprehensive pattern matching, fuzzy matching, and confidence scoring.
 */
export interface FastPathResult {
    commandName: string;
    args: string[];
    confidence: number;
    method: 'exact' | 'pattern' | 'fuzzy' | 'alias';
}
export interface FastPathConfig {
    enableFuzzyMatching: boolean;
    fuzzyThreshold: number;
    enableAliases: boolean;
    enablePatternExpansion: boolean;
    maxProcessingTime: number;
}
export interface PatternRule {
    patterns: string[];
    command: string;
    confidence: number;
    extractArgs?: (input: string) => string[];
}
/**
 * Enhanced fast-path router with multiple matching strategies
 */
export declare class EnhancedFastPathRouter {
    private readonly config;
    private readonly patternRules;
    private readonly aliasMap;
    private readonly commandCache;
    constructor(config?: Partial<FastPathConfig>);
    /**
     * Check if input can be handled by fast-path routing
     */
    checkFastPath(input: string): Promise<FastPathResult | null>;
    /**
     * Exact command name matching
     */
    private exactMatch;
    /**
     * Alias-based matching
     */
    private aliasMatch;
    /**
     * Pattern-based matching with confidence scoring
     */
    private patternMatch;
    /**
     * Fuzzy matching for typos and variations
     */
    private fuzzyMatch;
    /**
     * Initialize comprehensive pattern rules
     */
    private initializePatternRules;
    /**
     * Initialize command aliases
     */
    private initializeAliases;
    /**
     * Calculate pattern matching score
     */
    private calculatePatternScore;
    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    private calculateFuzzyScore;
    /**
     * Levenshtein distance calculation
     */
    private levenshteinDistance;
    /**
     * Normalize input for consistent processing
     */
    private normalizeInput;
    /**
     * Clear cache (useful for testing)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
}
