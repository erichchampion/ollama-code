/**
 * Rollback Manager
 *
 * Provides transaction-like rollback capabilities for autonomous development operations.
 * Tracks changes and can revert them if operations fail.
 */
import { Result, ErrorDetails } from '../types/result.js';
export interface RollbackAction {
    id: string;
    type: 'file_create' | 'file_modify' | 'file_delete' | 'directory_create' | 'directory_delete' | 'custom';
    description: string;
    rollbackData: any;
    timestamp: Date;
    priority: number;
}
export interface FileBackup {
    originalPath: string;
    backupPath: string;
    originalContent?: string;
    existed: boolean;
}
export interface RollbackContext {
    operationId: string;
    operationName: string;
    startTime: Date;
    actions: RollbackAction[];
    backups: Map<string, FileBackup>;
    isActive: boolean;
}
export declare class RollbackManager {
    private contexts;
    private backupDirectory;
    constructor(backupDirectory?: string);
    /**
     * Start a new rollback context
     */
    startContext(operationId: string, operationName: string): Promise<Result<RollbackContext, ErrorDetails>>;
    /**
     * Add a rollback action to the context
     */
    addAction(operationId: string, type: RollbackAction['type'], description: string, rollbackData: any, priority?: number): Result<void, ErrorDetails>;
    /**
     * Backup a file before modifying it
     */
    backupFile(operationId: string, filePath: string): Promise<Result<FileBackup, ErrorDetails>>;
    /**
     * Execute rollback for a context
     */
    executeRollback(operationId: string): Promise<Result<void, ErrorDetails>>;
    /**
     * Execute a single rollback action
     */
    private executeRollbackAction;
    /**
     * Commit a context (no rollback needed)
     */
    commitContext(operationId: string): Promise<Result<void, ErrorDetails>>;
    /**
     * Get context information
     */
    getContext(operationId: string): RollbackContext | null;
    /**
     * List all active contexts
     */
    getActiveContexts(): RollbackContext[];
    /**
     * Emergency cleanup - rollback all active contexts
     */
    emergencyRollbackAll(): Promise<Result<void, ErrorDetails>>;
}
