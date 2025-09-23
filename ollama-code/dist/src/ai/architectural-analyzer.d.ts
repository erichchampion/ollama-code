/**
 * Architectural Analyzer
 *
 * Advanced architectural pattern detection and analysis system for identifying
 * design patterns, code smells, and architectural improvements in codebases.
 */
export interface ArchitecturalPattern {
    id: string;
    name: string;
    description: string;
    pattern: RegExp | ((code: string) => boolean);
    category: 'design_pattern' | 'architectural_pattern' | 'code_smell' | 'anti_pattern';
    severity: 'info' | 'warning' | 'error';
    recommendation?: string;
    examples?: string[];
}
export interface ArchitecturalFinding {
    patternId: string;
    patternName: string;
    category: string;
    severity: 'info' | 'warning' | 'error';
    location: {
        file: string;
        line: number;
        column: number;
        length: number;
    };
    message: string;
    recommendation?: string;
    context: string;
    confidence: number;
}
export interface ArchitecturalReport {
    timestamp: Date;
    summary: {
        totalFindings: number;
        criticalIssues: number;
        warnings: number;
        suggestions: number;
        qualityScore: number;
    };
    findings: ArchitecturalFinding[];
    patterns: {
        detected: string[];
        missing: string[];
        recommended: string[];
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        category: string;
        description: string;
        impact: string;
        effort: 'low' | 'medium' | 'high';
    }[];
    metrics: {
        codeComplexity: number;
        maintainabilityIndex: number;
        technicalDebt: number;
        testCoverage?: number;
    };
}
export interface DependencyNode {
    name: string;
    type: 'class' | 'function' | 'module' | 'component';
    dependencies: string[];
    dependents: string[];
    coupling: number;
    cohesion: number;
}
export interface ArchitecturalGraph {
    nodes: DependencyNode[];
    edges: {
        from: string;
        to: string;
        type: string;
        weight: number;
    }[];
    layers: {
        name: string;
        components: string[];
    }[];
    violations: {
        type: string;
        description: string;
        components: string[];
    }[];
}
export declare class ArchitecturalAnalyzer {
    private patterns;
    constructor();
    /**
     * Analyze codebase for architectural patterns and issues
     */
    analyzeCodebase(files: {
        path: string;
        content: string;
    }[]): Promise<ArchitecturalReport>;
    /**
     * Analyze a single file for architectural patterns
     */
    private analyzeFile;
    /**
     * Build dependency graph for architectural analysis
     */
    private buildDependencyGraph;
    /**
     * Calculate architectural metrics
     */
    private calculateArchitecturalMetrics;
    /**
     * Initialize architectural patterns for detection
     */
    private initializePatterns;
    /**
     * Calculate pattern confidence based on context
     */
    private calculatePatternConfidence;
    /**
     * Get location information from regex match
     */
    private getLocationFromMatch;
    /**
     * Get context around a finding
     */
    private getContext;
    /**
     * Get extended context for confidence calculation
     */
    private getExtendedContext;
    /**
     * Extract component information from file
     */
    private extractComponent;
    /**
     * Extract dependencies from code
     */
    private extractDependencies;
    /**
     * Calculate cohesion metric for a component
     */
    private calculateCohesion;
    /**
     * Identify architectural layers
     */
    private identifyArchitecturalLayers;
    /**
     * Detect architectural violations
     */
    private detectArchitecturalViolations;
    /**
     * Find circular dependencies in the dependency graph
     */
    private findCircularDependencies;
    /**
     * Calculate overall code complexity
     */
    private calculateCodeComplexity;
    /**
     * Calculate maintainability index
     */
    private calculateMaintainabilityIndex;
    /**
     * Calculate technical debt
     */
    private calculateTechnicalDebt;
    /**
     * Generate architectural recommendations
     */
    private generateRecommendations;
    /**
     * Identify missing beneficial patterns
     */
    private identifyMissingPatterns;
    /**
     * Recommend patterns based on codebase analysis
     */
    private recommendPatterns;
    /**
     * Calculate overall quality score
     */
    private calculateQualityScore;
}
export declare function createArchitecturalAnalyzer(): ArchitecturalAnalyzer;
