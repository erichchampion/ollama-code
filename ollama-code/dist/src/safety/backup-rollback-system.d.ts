/**
 * Backup and Rollback System
 *
 * Phase 2.3: Comprehensive backup and rollback capabilities for file operations
 */
import { RollbackPlan, BackupInfo, RiskLevel, FileOperationDescription, SafetyConfiguration } from './safety-types.js';
export declare class BackupRollbackSystem {
    private backupDir;
    private maxBackups;
    private retentionDays;
    constructor(backupDir?: string, config?: Partial<SafetyConfiguration['backupSettings']>);
    /**
     * Create comprehensive backup before operation
     */
    createBackup(operationId: string, filePaths: string[], operation: FileOperationDescription): Promise<BackupInfo[]>;
    /**
     * Create backup for a single file
     */
    private createFileBackup;
    /**
     * Create intent backup for file creation operations
     */
    private createIntentBackup;
    /**
     * Create comprehensive rollback plan
     */
    createRollbackPlan(operationId: string, operation: FileOperationDescription, backups: BackupInfo[], riskLevel: RiskLevel): Promise<RollbackPlan>;
    /**
     * Execute rollback plan
     */
    executeRollback(plan: RollbackPlan): Promise<{
        success: boolean;
        errors: string[];
    }>;
    /**
     * Execute a single rollback step
     */
    private executeRollbackStep;
    /**
     * Restore file from backup
     */
    private restoreFile;
    /**
     * Delete file safely
     */
    private deleteFile;
    /**
     * Revert changes to a file
     */
    private revertChanges;
    /**
     * Rebuild dependency
     */
    private rebuildDependency;
    /**
     * Validate rollback step
     */
    private validateStep;
    /**
     * Helper methods
     */
    private ensureBackupDirectory;
    private fileExists;
    private generateBackupId;
    private calculateChecksum;
    private writeBackupMetadata;
    private determineRollbackStrategy;
    private generateRollbackSteps;
    private estimateRollbackTime;
    private canAutoRollback;
    private analyzeDependencies;
    private cleanupOldBackups;
}
