/**
 * Backup Manager
 *
 * Comprehensive backup and version control system for autonomous code modifications.
 * Provides checkpoint management, git integration, and safe rollback capabilities.
 */
export interface Checkpoint {
    id: string;
    timestamp: Date;
    description: string;
    files: CheckpointFile[];
    gitCommit?: string;
    parentCheckpoint?: string;
    metadata: CheckpointMetadata;
}
export interface CheckpointFile {
    path: string;
    originalHash: string;
    backupPath: string;
    size: number;
    lastModified: Date;
}
export interface CheckpointMetadata {
    phase: string;
    operation: string;
    riskLevel: 'low' | 'medium' | 'high';
    affectedComponents: string[];
    estimatedImpact: 'minimal' | 'moderate' | 'significant';
}
export interface BackupResult {
    success: boolean;
    checkpointId?: string;
    error?: string;
    filesBackedUp?: number;
    backupSize?: number;
}
export interface RestoreResult {
    success: boolean;
    filesRestored?: number;
    error?: string;
    conflicts?: RestoreConflict[];
}
export interface RestoreConflict {
    filePath: string;
    reason: string;
    currentHash: string;
    backupHash: string;
    resolution?: 'overwrite' | 'skip' | 'merge';
}
export declare class BackupManager {
    private checkpoints;
    private backupDir;
    private maxCheckpoints;
    private compressionEnabled;
    constructor(backupDir?: string, maxCheckpoints?: number, compressionEnabled?: boolean);
    /**
     * Initialize the backup manager
     */
    initialize(): Promise<void>;
    /**
     * Create a new checkpoint
     */
    createCheckpoint(description: string, filePaths: string[], metadata: CheckpointMetadata): Promise<BackupResult>;
    /**
     * Restore from a checkpoint
     */
    restoreCheckpoint(checkpointId: string, options?: {
        forceOverwrite?: boolean;
        dryRun?: boolean;
        specificFiles?: string[];
    }): Promise<RestoreResult>;
    /**
     * List all available checkpoints
     */
    getCheckpoints(): Checkpoint[];
    /**
     * Get checkpoint by ID
     */
    getCheckpoint(checkpointId: string): Checkpoint | undefined;
    /**
     * Delete a checkpoint
     */
    deleteCheckpoint(checkpointId: string): Promise<boolean>;
    /**
     * Calculate file hash
     */
    private calculateHash;
    /**
     * Create backup of a single file
     */
    private createFileBackup;
    /**
     * Create git checkpoint
     */
    private createGitCheckpoint;
    /**
     * Restore git state
     */
    private restoreGitState;
    /**
     * Atomic write operation
     */
    private atomicWrite;
    /**
     * Save checkpoint metadata
     */
    private saveCheckpoint;
    /**
     * Load existing checkpoints
     */
    private loadCheckpoints;
    /**
     * Cleanup old checkpoints
     */
    private cleanupOldCheckpoints;
}
