/**
 * Autonomous Code Modifier
 *
 * High-level orchestrator for safe autonomous code modifications.
 * Integrates code editing, AST manipulation, and backup management.
 */
import { CodeEditor } from '../tools/code-editor.js';
import { ASTManipulator } from '../tools/ast-manipulator.js';
import { BackupManager } from './backup-manager.js';
import { logger } from '../utils/logger.js';
import * as path from 'path';
export class AutonomousModifier {
    codeEditor;
    astManipulator;
    backupManager;
    activePlans = new Map();
    constructor(codeEditor, astManipulator, backupManager) {
        this.codeEditor = codeEditor || new CodeEditor();
        this.astManipulator = astManipulator || new ASTManipulator();
        this.backupManager = backupManager || new BackupManager();
    }
    /**
     * Initialize the autonomous modifier
     */
    async initialize() {
        try {
            await Promise.all([
                this.codeEditor.initialize(),
                this.astManipulator.initialize(),
                this.backupManager.initialize()
            ]);
            logger.info('Autonomous modifier initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize autonomous modifier:', error);
            throw error;
        }
    }
    /**
     * Execute a modification plan
     */
    async executeModificationPlan(plan) {
        const planId = plan.id;
        this.activePlans.set(planId, plan);
        try {
            logger.info('Starting modification plan execution', {
                planId,
                description: plan.description,
                operationCount: plan.operations.length,
                riskLevel: plan.riskLevel
            });
            // Create checkpoint before modifications
            const checkpointResult = await this.createCheckpoint(plan);
            if (!checkpointResult.success) {
                throw new Error(`Failed to create checkpoint: ${checkpointResult.error}`);
            }
            const checkpointId = checkpointResult.checkpointId;
            let completedOperations = 0;
            const errors = [];
            // Sort operations by priority
            const sortedOperations = plan.operations.sort((a, b) => a.priority - b.priority);
            // Execute operations in order
            for (const operation of sortedOperations) {
                try {
                    await this.executeOperation(operation);
                    completedOperations++;
                    logger.debug('Operation completed successfully', {
                        planId,
                        operation: operation.description,
                        filePath: operation.filePath
                    });
                }
                catch (error) {
                    const modError = {
                        operation,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        recoverable: this.isRecoverableError(error)
                    };
                    errors.push(modError);
                    logger.error('Operation failed', {
                        planId,
                        operation: operation.description,
                        error: modError.error,
                        recoverable: modError.recoverable
                    });
                    // If it's a non-recoverable error and risk is high, stop and rollback
                    if (!modError.recoverable && plan.riskLevel === 'high') {
                        logger.warn('Non-recoverable error in high-risk plan, initiating rollback');
                        const rollbackResult = await this.rollbackToCheckpoint(checkpointId);
                        return {
                            success: false,
                            planId,
                            checkpointId,
                            completedOperations,
                            failedOperations: plan.operations.length - completedOperations,
                            errors,
                            rollbackPerformed: rollbackResult.success
                        };
                    }
                }
            }
            const success = errors.length === 0 || errors.every(e => e.recoverable);
            logger.info('Modification plan execution completed', {
                planId,
                success,
                completedOperations,
                errors: errors.length
            });
            return {
                success,
                planId,
                checkpointId,
                completedOperations,
                failedOperations: errors.length,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            logger.error('Modification plan execution failed:', error);
            return {
                success: false,
                planId,
                completedOperations: 0,
                failedOperations: plan.operations.length,
                errors: [{
                        operation: plan.operations[0],
                        error: error instanceof Error ? error.message : 'Unknown error',
                        recoverable: false
                    }]
            };
        }
        finally {
            this.activePlans.delete(planId);
        }
    }
    /**
     * Create a checkpoint before modifications
     */
    async createCheckpoint(plan) {
        const filePaths = plan.operations.map(op => op.filePath);
        return await this.backupManager.createCheckpoint(`Pre-modification checkpoint: ${plan.description}`, filePaths, {
            phase: plan.phase,
            operation: 'modification_plan',
            riskLevel: plan.riskLevel,
            affectedComponents: this.extractAffectedComponents(plan),
            estimatedImpact: plan.estimatedImpact
        });
    }
    /**
     * Execute a single modification operation
     */
    async executeOperation(operation) {
        switch (operation.type) {
            case 'create':
                await this.executeCreateOperation(operation);
                break;
            case 'edit':
                await this.executeEditOperation(operation);
                break;
            case 'delete':
                await this.executeDeleteOperation(operation);
                break;
            case 'transform':
                await this.executeTransformOperation(operation);
                break;
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }
    /**
     * Execute create operation
     */
    async executeCreateOperation(operation) {
        if (!operation.newContent) {
            throw new Error('Create operation requires newContent');
        }
        const editResult = await this.codeEditor.createEdit(operation.filePath, operation.newContent, operation.description);
        if (!editResult.success) {
            throw new Error(`Failed to create edit: ${editResult.error}`);
        }
        const applyResult = await this.codeEditor.applyEdit(editResult.editId);
        if (!applyResult.success) {
            throw new Error(`Failed to apply edit: ${applyResult.error}`);
        }
    }
    /**
     * Execute edit operation
     */
    async executeEditOperation(operation) {
        if (!operation.newContent) {
            throw new Error('Edit operation requires newContent');
        }
        const editResult = await this.codeEditor.createEdit(operation.filePath, operation.newContent, operation.description);
        if (!editResult.success) {
            throw new Error(`Failed to create edit: ${editResult.error}`);
        }
        const applyResult = await this.codeEditor.applyEdit(editResult.editId);
        if (!applyResult.success) {
            throw new Error(`Failed to apply edit: ${applyResult.error}`);
        }
    }
    /**
     * Execute delete operation
     */
    async executeDeleteOperation(operation) {
        // For delete operations, we create an edit with empty content
        const editResult = await this.codeEditor.createEdit(operation.filePath, '', operation.description);
        if (!editResult.success) {
            throw new Error(`Failed to create delete edit: ${editResult.error}`);
        }
        const applyResult = await this.codeEditor.applyEdit(editResult.editId);
        if (!applyResult.success) {
            throw new Error(`Failed to apply delete edit: ${applyResult.error}`);
        }
    }
    /**
     * Execute transform operation
     */
    async executeTransformOperation(operation) {
        if (!operation.transformation) {
            throw new Error('Transform operation requires transformation');
        }
        const result = await this.astManipulator.applyTransformation(operation.filePath, operation.transformation);
        if (!result.success) {
            throw new Error(`Failed to apply transformation: ${result.error}`);
        }
    }
    /**
     * Rollback to a checkpoint
     */
    async rollbackToCheckpoint(checkpointId) {
        logger.info('Initiating rollback to checkpoint', { checkpointId });
        return await this.backupManager.restoreCheckpoint(checkpointId, {
            forceOverwrite: true
        });
    }
    /**
     * Check if an error is recoverable
     */
    isRecoverableError(error) {
        if (error instanceof Error) {
            // Validation errors are typically recoverable
            if (error.message.includes('validation') || error.message.includes('syntax')) {
                return true;
            }
            // File system errors might be recoverable
            if (error.message.includes('ENOENT') || error.message.includes('EACCES')) {
                return true;
            }
            // AST parsing errors are usually recoverable
            if (error.message.includes('parse') || error.message.includes('AST')) {
                return true;
            }
        }
        return false;
    }
    /**
     * Extract affected components from plan
     */
    extractAffectedComponents(plan) {
        const components = new Set();
        for (const operation of plan.operations) {
            const dir = path.dirname(operation.filePath);
            const component = path.basename(dir);
            components.add(component);
        }
        return Array.from(components);
    }
    /**
     * Get active modification plans
     */
    getActivePlans() {
        return Array.from(this.activePlans.values());
    }
    /**
     * Cancel an active plan
     */
    async cancelPlan(planId) {
        const plan = this.activePlans.get(planId);
        if (!plan) {
            return false;
        }
        // Note: In a real implementation, this would need to handle
        // interrupting in-progress operations gracefully
        this.activePlans.delete(planId);
        logger.info('Cancelled modification plan', { planId });
        return true;
    }
    /**
     * Get backup manager for direct access
     */
    getBackupManager() {
        return this.backupManager;
    }
    /**
     * Get code editor for direct access
     */
    getCodeEditor() {
        return this.codeEditor;
    }
    /**
     * Get AST manipulator for direct access
     */
    getASTManipulator() {
        return this.astManipulator;
    }
}
//# sourceMappingURL=autonomous-modifier.js.map