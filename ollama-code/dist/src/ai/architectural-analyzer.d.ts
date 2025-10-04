/**
 * Architectural Analyzer
 *
 * Provides comprehensive architectural pattern detection and analysis.
 * Identifies design patterns, code smells, and architectural improvements.
 */
export interface ArchitecturalPattern {
    name: string;
    confidence: number;
    location: {
        file: string;
        startLine: number;
        endLine: number;
    };
    description: string;
    benefits: string[];
    suggestions?: string[];
}
export interface CodeSmell {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    location: {
        file: string;
        startLine: number;
        endLine: number;
    };
    description: string;
    impact: string;
    suggestion: string;
    effort: 'low' | 'medium' | 'high';
}
export interface ArchitecturalAnalysis {
    patterns: ArchitecturalPattern[];
    codeSmells: CodeSmell[];
    metrics: {
        maintainabilityIndex: number;
        technicalDebt: number;
        complexity: number;
        coupling: number;
        cohesion: number;
    };
    recommendations: string[];
    summary: string;
}
export declare class ArchitecturalAnalyzer {
    private config;
    /**
     * Analyze codebase for architectural patterns and issues
     */
    analyzeArchitecture(files: Array<{
        path: string;
        content: string;
        type: string;
    }>, context?: any): Promise<ArchitecturalAnalysis>;
    /**
     * Detect design patterns in the codebase
     */
    private detectDesignPatterns;
    /**
     * Detect Singleton pattern
     */
    private detectSingletonPattern;
    /**
     * Detect Factory pattern
     */
    private detectFactoryPattern;
    /**
     * Detect Observer pattern
     */
    private detectObserverPattern;
    /**
     * Detect other patterns (simplified implementations)
     */
    private detectDecoratorPattern;
    private detectMVCPattern;
    private detectRepositoryPattern;
    private detectBuilderPattern;
    private detectStrategyPattern;
    /**
     * Detect code smells
     */
    private detectCodeSmells;
    /**
     * Detect God Class code smell
     */
    private detectGodClass;
    /**
     * Detect Long Method code smell
     */
    private detectLongMethod;
    /**
     * Detect duplicate code blocks
     */
    private detectDuplicateCode;
    private findDuplicateBlocks;
    /**
     * Detect other code smells (simplified)
     */
    private detectLargeClass;
    private detectLongParameterList;
    /**
     * Calculate architectural metrics
     */
    private calculateArchitecturalMetrics;
    /**
     * Calculate cyclomatic complexity using centralized calculator
     */
    private calculateFileCyclomaticComplexity;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Generate analysis summary
     */
    private generateSummary;
}
