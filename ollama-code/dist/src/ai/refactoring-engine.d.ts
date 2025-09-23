/**
 * Refactoring Engine
 *
 * Automated code refactoring system that safely transforms code while preserving
 * functionality, with comprehensive impact analysis and rollback capabilities.
 */
export interface RefactoringRule {
    id: string;
    name: string;
    description: string;
    category: 'extract_method' | 'rename' | 'move_class' | 'inline' | 'replace_conditional' | 'eliminate_duplication' | 'improve_naming';
    applicability: (code: string) => RefactoringOpportunity[];
    transform: (code: string, opportunity: RefactoringOpportunity) => RefactoringResult;
    safetyChecks: ((code: string, result: RefactoringResult) => string[])[];
    priority: number;
}
export interface RefactoringOpportunity {
    ruleId: string;
    location: {
        file: string;
        startLine: number;
        endLine: number;
        startColumn: number;
        endColumn: number;
    };
    description: string;
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    benefits: string[];
    risks: string[];
    estimatedEffort: 'minutes' | 'hours' | 'days';
    prerequisites: string[];
    metadata: Record<string, any>;
}
export interface RefactoringResult {
    success: boolean;
    originalCode: string;
    transformedCode: string;
    changes: CodeChange[];
    warnings: string[];
    errors: string[];
    preservedBehavior: boolean;
    testSuggestions: string[];
    rollbackInstructions: string[];
}
export interface CodeChange {
    type: 'insert' | 'delete' | 'replace' | 'move';
    location: {
        startLine: number;
        endLine: number;
        startColumn: number;
        endColumn: number;
    };
    oldContent: string;
    newContent: string;
    reason: string;
}
export interface RefactoringPlan {
    opportunities: RefactoringOpportunity[];
    dependencies: {
        from: string;
        to: string;
        reason: string;
    }[];
    executionOrder: string[];
    totalImpact: {
        filesAffected: number;
        linesChanged: number;
        estimatedTime: string;
        riskLevel: 'low' | 'medium' | 'high';
    };
    rollbackPlan: string[];
}
export interface RefactoringSession {
    id: string;
    timestamp: Date;
    plan: RefactoringPlan;
    results: Map<string, RefactoringResult>;
    status: 'planned' | 'executing' | 'completed' | 'failed' | 'rolled_back';
    rollbackPoint: {
        files: Map<string, string>;
        timestamp: Date;
    };
}
export declare class RefactoringEngine {
    private rules;
    private activeSessions;
    constructor();
    /**
     * Analyze code for refactoring opportunities
     */
    analyzeRefactoringOpportunities(files: {
        path: string;
        content: string;
    }[]): Promise<RefactoringOpportunity[]>;
    /**
     * Create a refactoring plan from opportunities
     */
    createRefactoringPlan(opportunities: RefactoringOpportunity[]): RefactoringPlan;
    /**
     * Execute a refactoring plan
     */
    executeRefactoringPlan(plan: RefactoringPlan, files: Map<string, string>, options?: {
        dryRun?: boolean;
        stopOnError?: boolean;
        autoRollback?: boolean;
    }): Promise<RefactoringSession>;
    /**
     * Rollback a refactoring session
     */
    rollbackSession(sessionId: string): Promise<boolean>;
    /**
     * Get refactoring session status
     */
    getSessionStatus(sessionId: string): RefactoringSession | null;
    /**
     * Initialize refactoring rules
     */
    private initializeRules;
    /**
     * Run safety checks for a refactoring result
     */
    private runSafetyChecks;
    /**
     * Analyze dependencies between refactoring opportunities
     */
    private analyzeDependencies;
    /**
     * Calculate execution order based on dependencies
     */
    private calculateExecutionOrder;
    /**
     * Calculate total impact of refactoring plan
     */
    private calculateTotalImpact;
    /**
     * Create rollback plan
     */
    private createRollbackPlan;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Check if two locations overlap
     */
    private locationsOverlap;
    /**
     * Get location from string index
     */
    private getLocationFromIndex;
    /**
     * Find duplicate code blocks
     */
    private findDuplicateCode;
    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity;
    /**
     * Calculate Levenshtein distance
     */
    private levenshteinDistance;
    /**
     * Identify extractable blocks within a method
     */
    private identifyExtractableBlocks;
    /**
     * Generate name suggestions for poorly named variables
     */
    private generateNameSuggestions;
}
export declare function createRefactoringEngine(): RefactoringEngine;
