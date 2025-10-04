/**
 * Performance Analyzer
 *
 * Advanced performance analysis system for detecting bottlenecks, inefficiencies,
 * and optimization opportunities in codebases with algorithm complexity analysis.
 */
export interface PerformanceIssue {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: 'algorithm' | 'memory' | 'io' | 'network' | 'database' | 'concurrency' | 'rendering' | 'bundle';
    file: string;
    line: number;
    column?: number;
    code: string;
    recommendation: string;
    estimatedImpact: string;
    complexity?: string;
    confidence: 'high' | 'medium' | 'low';
    metrics?: {
        timeComplexity?: string;
        spaceComplexity?: string;
        estimatedExecution?: string;
        memoryUsage?: string;
    };
}
export interface PerformanceRule {
    id: string;
    name: string;
    description: string;
    severity: PerformanceIssue['severity'];
    category: PerformanceIssue['category'];
    pattern: RegExp;
    filePatterns: string[];
    confidence: PerformanceIssue['confidence'];
    recommendation: string;
    estimatedImpact: string;
    validator?: (match: RegExpMatchArray, code: string, filePath: string) => boolean;
    complexityAnalyzer?: (match: RegExpMatchArray, code: string) => PerformanceIssue['metrics'];
}
export interface BundleAnalysis {
    totalSize: number;
    largeFiles: Array<{
        file: string;
        size: number;
        type: string;
    }>;
    duplicateDependencies: Array<{
        dependency: string;
        versions: string[];
        totalSize: number;
    }>;
    unusedDependencies: string[];
    recommendations: string[];
}
export interface PerformanceAnalysisOptions {
    includePatterns?: string[];
    excludePatterns?: string[];
    respectGitIgnore?: boolean;
    analyzeComplexity?: boolean;
    analyzeBundleSize?: boolean;
    checkMemoryLeaks?: boolean;
    severityThreshold?: PerformanceIssue['severity'];
    maxFileSize?: number;
    projectRoot?: string;
}
export interface PerformanceAnalysisResult {
    summary: {
        totalFiles: number;
        issues: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        infoCount: number;
        averageComplexity: string;
        totalLinesAnalyzed: number;
    };
    issues: PerformanceIssue[];
    bundleAnalysis?: BundleAnalysis;
    complexityMetrics: {
        averageTimeComplexity: string;
        averageSpaceComplexity: string;
        highComplexityFiles: Array<{
            file: string;
            complexity: string;
            linesOfCode: number;
        }>;
    };
    executionTime: number;
    timestamp: Date;
    projectPath: string;
}
export declare class PerformanceAnalyzer {
    private rules;
    constructor();
    /**
     * Analyze a project for performance issues
     */
    analyzeProject(projectPath: string, options?: PerformanceAnalysisOptions): Promise<PerformanceAnalysisResult>;
    /**
     * Analyze a single file for performance issues
     */
    analyzeFile(filePath: string, options: {
        severityThreshold: PerformanceIssue['severity'];
        analyzeComplexity: boolean;
        checkMemoryLeaks: boolean;
    }): Promise<{
        issues: PerformanceIssue[];
        linesOfCode: number;
        complexity?: number;
    }>;
    /**
     * Load default performance rules
     */
    private loadDefaultRules;
    /**
     * Calculate cyclomatic complexity of code
     */
    private calculateCyclomaticComplexity;
    /**
     * Analyze bundle size and dependencies
     */
    private analyzeBundleSize;
    /**
     * Get files to analyze based on patterns and filters
     */
    private getFilesToAnalyze;
    /**
     * Check if a pattern matches a file path
     */
    private matchesPattern;
    /**
     * Get applicable rules for a file type
     */
    private getApplicableRules;
    /**
     * Check if severity meets threshold
     */
    private meetsSeverityThreshold;
    /**
     * Sort issues by severity and impact
     */
    private sortIssues;
    /**
     * Calculate complexity metrics
     */
    private calculateComplexityMetrics;
    /**
     * Get complexity category from numeric value
     */
    private getComplexityCategory;
    /**
     * Create summary statistics
     */
    private createSummary;
    /**
     * Generate performance report
     */
    generateReport(result: PerformanceAnalysisResult): string;
}
export declare function createPerformanceAnalyzer(): PerformanceAnalyzer;
