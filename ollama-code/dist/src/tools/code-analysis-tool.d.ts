/**
 * CodeAnalysisTool - Advanced Code Quality and Analysis
 *
 * Provides comprehensive code analysis including:
 * - AST-based syntax analysis for multiple languages
 * - Code quality metrics and complexity analysis
 * - Refactoring suggestions and best practices
 * - Security vulnerability detection
 * - Performance bottleneck identification
 * - Code style and formatting analysis
 * - Dependency analysis and suggestions
 */
import { BaseTool, ToolResult, ToolExecutionContext } from './base-tool.js';
export interface CodeFile {
    path: string;
    language: string;
    content: string;
    size: number;
    lines: number;
    lastModified: Date;
}
export interface CodeMetrics {
    cyclomaticComplexity: number;
    linesOfCode: number;
    linesOfComments: number;
    linesBlank: number;
    functions: number;
    classes: number;
    methods: number;
    variables: number;
    imports: number;
    exports: number;
    todoComments: number;
    duplicateLines: number;
}
export interface CodeIssue {
    type: 'error' | 'warning' | 'suggestion' | 'info';
    category: 'syntax' | 'style' | 'performance' | 'security' | 'maintainability' | 'complexity';
    message: string;
    file: string;
    line?: number;
    column?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestion?: string;
    autoFixable?: boolean;
}
export interface RefactoringSuggestion {
    type: 'extract_function' | 'extract_variable' | 'inline' | 'rename' | 'move' | 'simplify';
    description: string;
    file: string;
    startLine: number;
    endLine: number;
    impact: 'low' | 'medium' | 'high';
    effort: 'easy' | 'moderate' | 'complex';
    benefits: string[];
}
export interface SecurityVulnerability {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    file: string;
    line?: number;
    cwe?: string;
    mitigation: string;
}
export interface CodeAnalysisResult {
    summary: {
        totalFiles: number;
        totalLines: number;
        analysisTime: number;
        overallScore: number;
        languages: Record<string, number>;
    };
    files: CodeFile[];
    metrics: Record<string, CodeMetrics>;
    issues: CodeIssue[];
    refactoringSuggestions: RefactoringSuggestion[];
    securityVulnerabilities: SecurityVulnerability[];
    duplicateCode: {
        blocks: Array<{
            files: string[];
            lines: number;
            similarity: number;
        }>;
    };
    dependencies: {
        external: string[];
        internal: string[];
        circular: string[][];
        unused: string[];
    };
}
export interface CodeAnalysisOptions {
    includeTests?: boolean;
    includeNodeModules?: boolean;
    maxFileSize?: number;
    languageFilter?: string[];
    analysisDepth?: 'basic' | 'standard' | 'deep';
    includeMetrics?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
    excludePatterns?: string[];
}
/**
 * Advanced code analysis and quality assessment tool
 */
export declare class CodeAnalysisTool extends BaseTool {
    name: string;
    description: string;
    private analysisCache;
    private supportedLanguages;
    execute(operation: string, context: ToolExecutionContext, options?: CodeAnalysisOptions): Promise<ToolResult>;
    /**
     * Perform comprehensive code analysis
     */
    private performFullAnalysis;
    /**
     * Analyze code metrics
     */
    private analyzeMetrics;
    /**
     * Analyze code quality issues
     */
    private analyzeQuality;
    /**
     * Analyze security vulnerabilities
     */
    private analyzeSecurity;
    /**
     * Analyze performance issues
     */
    private analyzePerformance;
    /**
     * Generate refactoring suggestions
     */
    private suggestRefactoring;
    /**
     * Find duplicate code
     */
    private findDuplicateCode;
    /**
     * Analyze dependencies
     */
    private analyzeDependencies;
    /**
     * Analyze single file
     */
    private analyzeFile;
    private getCodeFiles;
    private createCodeFile;
    private detectLanguage;
    private calculateFileMetrics;
    private isCommentLine;
    private countFunctions;
    private countClasses;
    private countMethods;
    private countVariables;
    private countImports;
    private countExports;
    private countMatches;
    private calculateCyclomaticComplexity;
    private countDuplicateLines;
    private findCodeIssues;
    private findSecurityVulnerabilities;
    private findPerformanceIssues;
    private generateRefactoringSuggestions;
    private findDuplicateCodeBlocks;
    private analyzeDependencyStructure;
    private extractDependencies;
    private calculateOverallScore;
    private calculateFileScore;
    private calculateLanguageDistribution;
    private aggregateMetrics;
    private categorizeIssues;
    private categorizeIssuesBySeverity;
}
