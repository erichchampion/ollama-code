/**
 * Advanced Context Manager
 *
 * Provides intelligent context management with semantic code indexing,
 * code relationship mapping, domain knowledge base, and historical context tracking.
 * This enhances AI interactions by providing rich, contextual information.
 */
import { ProjectContext } from './context.js';
export interface SemanticSymbol {
    type: 'class' | 'function' | 'interface' | 'variable' | 'method';
    name: string;
    scope: string;
    filePath?: string;
    lineNumber?: number;
    signature?: string;
}
export interface CodeConcept {
    type: 'domain' | 'pattern' | 'infrastructure' | 'business';
    name: string;
    confidence: number;
    description?: string;
    examples?: string[];
}
export interface CodePattern {
    type: 'oop' | 'functional' | 'async' | 'module' | 'architectural';
    name: string;
    confidence: number;
    description?: string;
}
export interface ComplexityMetrics {
    lines: number;
    conditions: number;
    functions: number;
    cyclomaticComplexity: number;
    maintainabilityIndex?: number;
}
export interface CodeDependency {
    path: string;
    type: 'local' | 'external' | 'builtin';
    version?: string;
    isDevDependency?: boolean;
}
export interface CodeExport {
    name: string;
    type: 'class' | 'function' | 'interface' | 'variable' | 'default';
    signature?: string;
}
export interface SemanticAnalysis {
    filePath: string;
    symbols: SemanticSymbol[];
    concepts: CodeConcept[];
    patterns: CodePattern[];
    complexity: ComplexityMetrics;
    dependencies: CodeDependency[];
    exports: CodeExport[];
    lastAnalyzed: Date;
}
export interface CodeRelationship {
    imports: string[];
    exports: CodeExport[];
    references: string[];
    dependents: string[];
    weight: number;
}
export interface DomainKnowledge {
    name: string;
    concepts: string[];
    patterns: string[];
    technologies: string[];
    bestPractices: string[];
    commonIssues: string[];
}
export interface HistoricalContext {
    timestamp: number;
    query: string;
    result: string;
    filesReferenced: string[];
    contextUsed: {
        semanticMatches: number;
        domainContext: number;
        relatedFiles: number;
    };
    userSatisfaction?: number;
}
export interface EnhancedContext {
    semanticMatches: SemanticMatch[];
    relatedCode: string[];
    domainContext: DomainMatch[];
    historicalContext: HistoricalContext[];
    suggestions: string[];
    confidence: number;
    processingTime: number;
}
export interface SemanticMatch {
    filePath: string;
    score: number;
    analysis: SemanticAnalysis;
    relevanceReason: string;
    matchedConcepts: string[];
    matchedSymbols: string[];
}
export interface DomainMatch {
    domain: string;
    score: number;
    knowledge: DomainKnowledge;
    matchedConcepts: string[];
    applicablePatterns: string[];
}
export interface ContextCacheEntry {
    query: string;
    context: EnhancedContext;
    timestamp: number;
    expiresAt: number;
}
export interface AdvancedContextConfig {
    maxHistoryEntries: number;
    cacheExpirationMs: number;
    maxSemanticMatches: number;
    maxDomainMatches: number;
    maxSuggestions: number;
    analysisTimeout: number;
    enableCaching: boolean;
    enableHistoricalTracking: boolean;
}
/**
 * Advanced Context Manager Implementation
 */
export declare class AdvancedContextManager {
    private aiClient;
    private projectContext;
    private semanticIndex;
    private codeRelationships;
    private domainKnowledge;
    private historicalContext;
    private contextCache;
    private config;
    private initialized;
    constructor(aiClient: any, projectContext: ProjectContext, config?: Partial<AdvancedContextConfig>);
    /**
     * Initialize the advanced context manager
     */
    initialize(): Promise<void>;
    /**
     * Build semantic index from project files
     */
    private buildSemanticIndex;
    /**
     * Check if a file should be analyzed
     */
    private isAnalyzableFile;
    /**
     * Analyze a single file for semantic information
     */
    private analyzeFile;
    /**
     * Create empty analysis for missing or unreadable files
     */
    private createEmptyAnalysis;
    /**
     * Analyze code semantics from source content
     */
    private analyzeCodeSemantics;
    /**
     * Extract symbols (classes, functions, interfaces, etc.) from code
     */
    private extractSymbols;
    /**
     * Get line number for a given character index
     */
    private getLineNumber;
    /**
     * Extract domain concepts from code
     */
    private extractConcepts;
    /**
     * Extract architectural and design patterns from code
     */
    private extractPatterns;
    /**
     * Calculate code complexity metrics
     */
    private calculateComplexity;
    /**
     * Extract dependencies from import statements
     */
    private extractDependencies;
    /**
     * Determine dependency type based on path
     */
    private getDependencyType;
    /**
     * Extract exports from code
     */
    private extractExports;
    /**
     * Determine export type from export statement
     */
    private getExportType;
    /**
     * Build code relationships between files
     */
    private buildCodeRelationships;
    /**
     * Resolve local import path to actual file path
     */
    private resolveLocalPath;
    /**
     * Build reverse relationships (which files depend on each file)
     */
    private buildReverseRelationships;
    /**
     * Calculate relationship weights based on coupling strength
     */
    private calculateRelationshipWeights;
    /**
     * Initialize domain knowledge base
     */
    private initializeDomainKnowledge;
    /**
     * Get enhanced context for a given query
     */
    getEnhancedContext(query: string, options?: Partial<AdvancedContextConfig>): Promise<EnhancedContext>;
    /**
     * Find semantic matches for a query
     */
    private findSemanticMatches;
    /**
     * Explain why a file is relevant to the query
     */
    private explainRelevance;
    /**
     * Find related code through relationships
     */
    private findRelatedCode;
    /**
     * Get domain context for a query
     */
    private getDomainContext;
    /**
     * Get relevant historical context
     */
    private getRelevantHistory;
    /**
     * Check if historical context is relevant to current query
     */
    private isHistoryRelevant;
    /**
     * Generate contextual suggestions based on analysis
     */
    private generateContextualSuggestions;
    /**
     * Calculate overall context confidence
     */
    private calculateContextConfidence;
    /**
     * Add query result to historical context
     */
    addToHistory(query: string, result: string, filesReferenced?: string[]): void;
    /**
     * Get context statistics
     */
    getContextStats(): {
        semanticIndex: {
            filesIndexed: number;
            totalSymbols: number;
            totalConcepts: number;
            totalPatterns: number;
            averageComplexity: number;
        };
        relationships: {
            totalFiles: number;
            totalImports: number;
            totalExports: number;
            averageWeight: number;
        };
        domainKnowledge: {
            domains: number;
            totalConcepts: number;
            totalPatterns: number;
            totalTechnologies: number;
        };
        history: {
            totalEntries: number;
            avgContextUsage: number;
        };
        cache: {
            entries: number;
            hitRate: number;
        };
    };
    /**
     * Cache management methods
     */
    private getCacheKey;
    private getFromCache;
    private addToCache;
    private cleanupCache;
    /**
     * Force refresh of semantic index for specific files
     */
    refreshSemanticIndex(filePaths?: string[]): Promise<void>;
    /**
     * Get detailed analysis for a specific file
     */
    getFileAnalysis(filePath: string): SemanticAnalysis | null;
    /**
     * Get relationships for a specific file
     */
    getFileRelationships(filePath: string): CodeRelationship | null;
    /**
     * Check if the context manager is ready
     */
    isReady(): boolean;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
