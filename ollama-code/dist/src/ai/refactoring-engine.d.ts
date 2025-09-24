/**
 * Refactoring Engine
 *
 * Provides automated code refactoring capabilities with safety checks.
 * Implements safe refactoring operations with rollback support.
 */
export interface RefactoringOperation {
    id: string;
    type: RefactoringType;
    description: string;
    target: {
        file: string;
        startLine: number;
        endLine: number;
        originalCode: string;
    };
    transformation: {
        newCode: string;
        additionalFiles?: Array<{
            path: string;
            content: string;
        }>;
    };
    impact: RefactoringImpact;
    safety: SafetyAssessment;
    estimatedEffort: 'low' | 'medium' | 'high';
}
export type RefactoringType = 'extract-method' | 'extract-class' | 'rename-variable' | 'rename-method' | 'move-method' | 'inline-method' | 'remove-duplicate' | 'simplify-conditional' | 'replace-magic-number' | 'introduce-parameter-object' | 'remove-dead-code' | 'optimize-imports';
export interface RefactoringImpact {
    filesAffected: string[];
    dependenciesChanged: boolean;
    testingRequired: boolean;
    breakingChange: boolean;
    performanceImprovement: number;
    maintainabilityImprovement: number;
}
export interface SafetyAssessment {
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    potentialIssues: string[];
    prerequisites: string[];
    rollbackSupported: boolean;
}
export interface RefactoringResult {
    success: boolean;
    operationsApplied: RefactoringOperation[];
    backupCreated: string;
    filesModified: string[];
    testResults?: {
        passed: boolean;
        details: string;
    };
    rollbackInstructions?: string;
    error?: string;
}
export declare class RefactoringEngine {
    private config;
    private backupDirectory;
    constructor(backupDir?: string);
    /**
     * Analyze code and suggest refactoring opportunities
     */
    suggestRefactorings(files: Array<{
        path: string;
        content: string;
        type: string;
    }>, context?: any): Promise<RefactoringOperation[]>;
    /**
     * Apply refactoring operations safely
     */
    applyRefactorings(operations: RefactoringOperation[], options?: {
        dryRun?: boolean;
        runTests?: boolean;
        createBackup?: boolean;
    }): Promise<RefactoringResult>;
    /**
     * Analyze individual file for refactoring opportunities
     */
    private analyzeFileForRefactoring;
    /**
     * Detect extract method opportunities
     */
    private detectExtractMethodOpportunities;
    /**
     * Detect magic numbers
     */
    private detectMagicNumbers;
    /**
     * Detect other refactoring opportunities (simplified implementations)
     */
    private detectDuplicateCode;
    private detectComplexConditionals;
    private detectDeadCode;
    private detectImportOptimizations;
    /**
     * Helper methods
     */
    private calculateRefactoringScore;
    private generateExtractMethodRefactoring;
    private validateOperations;
    private createBackup;
    private applyOperation;
    private rollbackOperations;
    private runTests;
}
