/**
 * Autonomous Code Modifier
 *
 * High-level orchestrator for safe autonomous code modifications.
 * Integrates code editing, AST manipulation, and backup management.
 */
import { CodeEditor } from '../tools/code-editor.js';
import { ASTManipulator, CodeTransformation } from '../tools/ast-manipulator.js';
import { BackupManager } from './backup-manager.js';
export interface ModificationPlan {
    id: string;
    description: string;
    phase: string;
    operations: ModificationOperation[];
    riskLevel: 'low' | 'medium' | 'high';
    estimatedImpact: 'minimal' | 'moderate' | 'significant';
    rollbackStrategy: 'checkpoint' | 'git' | 'backup';
}
export interface ModificationOperation {
    type: 'create' | 'edit' | 'delete' | 'transform';
    filePath: string;
    description: string;
    priority: number;
    dependencies?: string[];
    transformation?: CodeTransformation;
    newContent?: string;
}
export interface ModificationResult {
    success: boolean;
    planId: string;
    checkpointId?: string;
    completedOperations: number;
    failedOperations: number;
    errors?: ModificationError[];
    rollbackPerformed?: boolean;
}
export interface ModificationError {
    operation: ModificationOperation;
    error: string;
    recoverable: boolean;
}
export declare class AutonomousModifier {
    private codeEditor;
    private astManipulator;
    private backupManager;
    private activePlans;
    constructor(codeEditor?: CodeEditor, astManipulator?: ASTManipulator, backupManager?: BackupManager);
    /**
     * Initialize the autonomous modifier
     */
    initialize(): Promise<void>;
    /**
     * Execute a modification plan
     */
    executeModificationPlan(plan: ModificationPlan): Promise<ModificationResult>;
    /**
     * Create a checkpoint before modifications
     */
    private createCheckpoint;
    /**
     * Execute a single modification operation
     */
    private executeOperation;
    /**
     * Execute create operation
     */
    private executeCreateOperation;
    /**
     * Execute edit operation
     */
    private executeEditOperation;
    /**
     * Execute delete operation
     */
    private executeDeleteOperation;
    /**
     * Execute transform operation
     */
    private executeTransformOperation;
    /**
     * Rollback to a checkpoint
     */
    private rollbackToCheckpoint;
    /**
     * Check if an error is recoverable
     */
    private isRecoverableError;
    /**
     * Extract affected components from plan
     */
    private extractAffectedComponents;
    /**
     * Get active modification plans
     */
    getActivePlans(): ModificationPlan[];
    /**
     * Cancel an active plan
     */
    cancelPlan(planId: string): Promise<boolean>;
    /**
     * Get backup manager for direct access
     */
    getBackupManager(): BackupManager;
    /**
     * Get code editor for direct access
     */
    getCodeEditor(): CodeEditor;
    /**
     * Get AST manipulator for direct access
     */
    getASTManipulator(): ASTManipulator;
}
