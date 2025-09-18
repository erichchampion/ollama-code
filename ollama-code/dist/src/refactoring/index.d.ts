/**
 * Code Refactoring Module
 *
 * Provides intelligent code refactoring capabilities including:
 * - Extract function/variable/component
 * - Rename symbols with scope awareness
 * - Code structure optimization
 * - Design pattern application
 * - Performance optimizations
 * - Dependency injection
 */
export interface RefactoringOperation {
    type: 'extract-function' | 'extract-variable' | 'extract-component' | 'rename' | 'optimize' | 'pattern' | 'split-file' | 'merge-files';
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    files: string[];
    preview?: string;
}
export interface RefactoringOptions {
    preserveComments: boolean;
    updateTests: boolean;
    updateImports: boolean;
    generateDocumentation: boolean;
    performanceOptimize: boolean;
}
export interface CodeSmell {
    type: 'long-method' | 'large-class' | 'duplicate-code' | 'complex-conditional' | 'primitive-obsession' | 'feature-envy' | 'god-class' | 'dead-code';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: {
        file: string;
        line: number;
        column?: number;
    };
    description: string;
    suggestion: string;
}
export interface ExtractOptions {
    newName: string;
    targetFile?: string;
    includeImports: boolean;
    generateTests: boolean;
}
export declare class RefactoringManager {
    private workingDir;
    constructor(workingDir?: string);
    /**
     * Analyze code for refactoring opportunities
     */
    analyzeCode(filePath: string): Promise<RefactoringOperation[]>;
    /**
     * Detect code smells
     */
    detectCodeSmells(filePath: string): Promise<CodeSmell[]>;
    /**
     * Extract function from selected code
     */
    extractFunction(filePath: string, startLine: number, endLine: number, options: ExtractOptions): Promise<string>;
    /**
     * Extract variable from expression
     */
    extractVariable(filePath: string, line: number, expression: string, variableName: string): Promise<string>;
    /**
     * Rename symbol throughout codebase
     */
    renameSymbol(symbol: string, newName: string, filePaths: string[]): Promise<void>;
    /**
     * Optimize code performance
     */
    optimizePerformance(filePath: string): Promise<string>;
    /**
     * Apply design pattern
     */
    applyDesignPattern(filePath: string, pattern: string, options?: any): Promise<string>;
    /**
     * Pattern-based analysis fallback
     */
    private patternBasedAnalysis;
    /**
     * Extract function information from code
     */
    private extractFunctions;
    /**
     * Calculate conditional complexity
     */
    private calculateConditionalComplexity;
    /**
     * Find duplicate code blocks
     */
    private findDuplicateCode;
    /**
     * Find complex expressions
     */
    private findComplexExpressions;
    /**
     * AI-based code smell detection
     */
    private aiBasedSmellDetection;
}
/**
 * Default refactoring manager instance
 */
export declare const refactoringManager: RefactoringManager;
