/**
 * Backup and Rollback System
 *
 * Phase 2.3: Comprehensive backup and rollback capabilities for file operations
 */
import * as fs from 'fs/promises';
import { normalizeError } from '../utils/error-utils.js';
import * as path from 'path';
import * as crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { BACKUP_CONFIG } from './safety-constants.js';
export class BackupRollbackSystem {
    backupDir;
    maxBackups;
    retentionDays;
    constructor(backupDir = `./${BACKUP_CONFIG.BACKUP_DIR_NAME}`, config) {
        this.backupDir = backupDir;
        this.maxBackups = config?.maxBackups || BACKUP_CONFIG.MAX_BACKUPS;
        this.retentionDays = config?.retentionDays || BACKUP_CONFIG.RETENTION_DAYS;
    }
    /**
     * Create comprehensive backup before operation
     */
    async createBackup(operationId, filePaths, operation) {
        logger.info(`Creating backup for operation ${operationId} with ${filePaths.length} files`);
        try {
            await this.ensureBackupDirectory();
            const backups = [];
            for (const filePath of filePaths) {
                try {
                    const backup = await this.createFileBackup(operationId, filePath, operation);
                    if (backup) {
                        backups.push(backup);
                    }
                }
                catch (error) {
                    logger.warn(`Failed to backup ${filePath}:`, error);
                    // Continue with other files
                }
            }
            // Clean up old backups
            await this.cleanupOldBackups();
            logger.info(`Created ${backups.length} backups for operation ${operationId}`);
            return backups;
        }
        catch (error) {
            logger.error(`Backup creation failed for operation ${operationId}:`, error);
            throw new Error(`Failed to create backup: ${normalizeError(error).message}`);
        }
    }
    /**
     * Create backup for a single file
     */
    async createFileBackup(operationId, filePath, operation) {
        try {
            // Check if file exists
            const exists = await this.fileExists(filePath);
            if (!exists && operation.type !== 'create') {
                logger.debug(`File ${filePath} does not exist, skipping backup`);
                return null;
            }
            if (!exists) {
                // For create operations, we just record the intent
                return this.createIntentBackup(operationId, filePath, operation);
            }
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath);
            const checksum = this.calculateChecksum(content);
            const backupId = this.generateBackupId(operationId, filePath);
            const backupPath = path.join(this.backupDir, backupId);
            // Write backup file
            await fs.writeFile(backupPath, content);
            // Create backup info
            const backupInfo = {
                id: backupId,
                type: 'full_file',
                path: backupPath,
                size: stats.size,
                timestamp: new Date(),
                checksum,
                compressed: false,
                retention: new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000),
                metadata: {
                    operationId,
                    originalPath: filePath,
                    operation: operation.type,
                    permissions: stats.mode
                }
            };
            // Write metadata
            await this.writeBackupMetadata(backupInfo);
            return backupInfo;
        }
        catch (error) {
            logger.error(`Failed to backup file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Create intent backup for file creation operations
     */
    createIntentBackup(operationId, filePath, operation) {
        const backupId = this.generateBackupId(operationId, filePath, 'intent');
        return {
            id: backupId,
            type: 'full_file',
            path: '', // No actual file to backup
            size: 0,
            timestamp: new Date(),
            checksum: '',
            compressed: false,
            retention: new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000),
            metadata: {
                operationId,
                originalPath: filePath,
                operation: 'create_intent',
                isIntent: true
            }
        };
    }
    /**
     * Create comprehensive rollback plan
     */
    async createRollbackPlan(operationId, operation, backups, riskLevel) {
        logger.debug(`Creating rollback plan for operation ${operationId}`);
        const strategy = this.determineRollbackStrategy(operation, backups, riskLevel);
        const steps = await this.generateRollbackSteps(operation, backups, strategy);
        const estimatedTime = this.estimateRollbackTime(steps);
        const canAutoRollback = this.canAutoRollback(riskLevel, steps);
        const dependencies = await this.analyzeDependencies(operation);
        return {
            id: `rollback_${operationId}`,
            operationId,
            strategy,
            backups,
            steps,
            estimatedTime,
            riskLevel,
            canAutoRollback,
            dependencies
        };
    }
    /**
     * Execute rollback plan
     */
    async executeRollback(plan) {
        logger.info(`Executing rollback plan ${plan.id} with ${plan.steps.length} steps`);
        const errors = [];
        let success = true;
        try {
            // Sort steps by order
            const sortedSteps = plan.steps.sort((a, b) => a.order - b.order);
            for (const step of sortedSteps) {
                try {
                    await this.executeRollbackStep(step, plan);
                    logger.debug(`Completed rollback step ${step.order}: ${step.description}`);
                }
                catch (error) {
                    const errorMsg = `Step ${step.order} failed: ${normalizeError(error).message}`;
                    logger.error(errorMsg);
                    errors.push(errorMsg);
                    if (!step.fallback || step.fallback.length === 0) {
                        success = false;
                        break;
                    }
                    // Try fallback steps
                    logger.info(`Attempting fallback for step ${step.order}`);
                    let fallbackSuccess = false;
                    for (const fallbackStep of step.fallback) {
                        try {
                            await this.executeRollbackStep(fallbackStep, plan);
                            fallbackSuccess = true;
                            break;
                        }
                        catch (fallbackError) {
                            logger.warn(`Fallback step failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
                        }
                    }
                    if (!fallbackSuccess) {
                        success = false;
                        break;
                    }
                }
            }
            if (success) {
                logger.info(`Rollback plan ${plan.id} completed successfully`);
            }
            else {
                logger.error(`Rollback plan ${plan.id} failed with errors: ${errors.join(', ')}`);
            }
            return { success, errors };
        }
        catch (error) {
            const errorMsg = normalizeError(error).message;
            logger.error(`Rollback execution failed: ${errorMsg}`);
            errors.push(`Rollback execution failed: ${errorMsg}`);
            return { success: false, errors };
        }
    }
    /**
     * Execute a single rollback step
     */
    async executeRollbackStep(step, plan) {
        logger.debug(`Executing rollback step: ${step.action} on ${step.target}`);
        switch (step.action) {
            case 'restore_file':
                await this.restoreFile(step.target, plan.backups);
                break;
            case 'delete_file':
                await this.deleteFile(step.target);
                break;
            case 'revert_changes':
                await this.revertChanges(step.target, plan.backups);
                break;
            case 'rebuild_dependency':
                await this.rebuildDependency(step.target);
                break;
            case 'manual_step':
                logger.warn(`Manual step required: ${step.description}`);
                // Would typically prompt user or require external intervention
                break;
            default:
                throw new Error(`Unknown rollback action: ${step.action}`);
        }
        // Perform validation if specified
        if (step.validation) {
            await this.validateStep(step.validation);
        }
    }
    /**
     * Restore file from backup
     */
    async restoreFile(filePath, backups) {
        const backup = backups.find(b => b.metadata.originalPath === filePath);
        if (!backup) {
            throw new Error(`No backup found for ${filePath}`);
        }
        if (backup.metadata.isIntent) {
            // This was a create operation, so we need to delete the file
            await this.deleteFile(filePath);
            return;
        }
        // Read backup content
        const backupContent = await fs.readFile(backup.path);
        // Verify checksum
        const currentChecksum = this.calculateChecksum(backupContent);
        if (currentChecksum !== backup.checksum) {
            throw new Error(`Backup integrity check failed for ${filePath}`);
        }
        // Restore file
        await fs.writeFile(filePath, backupContent);
        // Restore permissions if available
        if (backup.metadata.permissions) {
            await fs.chmod(filePath, backup.metadata.permissions);
        }
        logger.debug(`Restored ${filePath} from backup ${backup.id}`);
    }
    /**
     * Delete file safely
     */
    async deleteFile(filePath) {
        try {
            const exists = await this.fileExists(filePath);
            if (exists) {
                await fs.unlink(filePath);
                logger.debug(`Deleted file ${filePath}`);
            }
        }
        catch (error) {
            throw new Error(`Failed to delete ${filePath}: ${normalizeError(error).message}`);
        }
    }
    /**
     * Revert changes to a file
     */
    async revertChanges(filePath, backups) {
        // For now, this is the same as restore_file
        await this.restoreFile(filePath, backups);
    }
    /**
     * Rebuild dependency
     */
    async rebuildDependency(target) {
        // This would typically run npm install, pip install, etc.
        logger.info(`Rebuilding dependency: ${target}`);
        // Implementation would depend on the project type
    }
    /**
     * Validate rollback step
     */
    async validateStep(validation) {
        switch (validation.type) {
            case 'file_exists':
                const exists = await this.fileExists(validation.command);
                if (!exists) {
                    throw new Error(`Validation failed: File ${validation.command} does not exist`);
                }
                break;
            case 'syntax_check':
                // Would run syntax checking tools
                logger.debug(`Syntax validation for ${validation.command}`);
                break;
            default:
                logger.warn(`Unknown validation type: ${validation.type}`);
        }
    }
    /**
     * Helper methods
     */
    async ensureBackupDirectory() {
        try {
            await fs.access(this.backupDir);
        }
        catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    generateBackupId(operationId, filePath, suffix = '') {
        const timestamp = Date.now();
        const fileName = path.basename(filePath);
        const hash = crypto.createHash('sha256')
            .update(`${operationId}:${filePath}:${timestamp}`)
            .digest('hex')
            .substring(0, 8);
        return `${operationId}_${fileName}_${timestamp}_${hash}${suffix ? '_' + suffix : ''}`;
    }
    calculateChecksum(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    async writeBackupMetadata(backup) {
        const metadataPath = `${backup.path}.meta`;
        await fs.writeFile(metadataPath, JSON.stringify(backup, null, 2));
    }
    determineRollbackStrategy(operation, backups, riskLevel) {
        if (riskLevel === 'critical' || riskLevel === 'high') {
            return 'backup_restore';
        }
        if (operation.type === 'delete') {
            return 'backup_restore';
        }
        if (backups.length > 10) {
            return 'incremental_undo';
        }
        return 'backup_restore';
    }
    async generateRollbackSteps(operation, backups, strategy) {
        const steps = [];
        let order = 1;
        switch (strategy) {
            case 'backup_restore':
                for (const backup of backups) {
                    const originalPath = backup.metadata.originalPath;
                    if (backup.metadata.isIntent) {
                        // This was a create operation, delete the created file
                        steps.push({
                            order: order++,
                            action: 'delete_file',
                            target: originalPath,
                            description: `Delete created file ${originalPath}`,
                            automated: true,
                            validation: {
                                type: 'file_exists',
                                command: originalPath,
                                timeout: 5000
                            }
                        });
                    }
                    else {
                        // Restore from backup
                        steps.push({
                            order: order++,
                            action: 'restore_file',
                            target: originalPath,
                            description: `Restore ${originalPath} from backup`,
                            automated: true,
                            validation: {
                                type: 'file_exists',
                                command: originalPath,
                                timeout: 5000
                            }
                        });
                    }
                }
                break;
            case 'incremental_undo':
                // Reverse order for incremental undo
                const reversedBackups = [...backups].reverse();
                for (const backup of reversedBackups) {
                    steps.push({
                        order: order++,
                        action: 'revert_changes',
                        target: backup.metadata.originalPath,
                        description: `Revert changes to ${backup.metadata.originalPath}`,
                        automated: true
                    });
                }
                break;
            default:
                throw new Error(`Unsupported rollback strategy: ${strategy}`);
        }
        return steps;
    }
    estimateRollbackTime(steps) {
        // Estimate time in seconds
        const baseTime = 5; // 5 seconds per step
        const manualStepTime = 60; // 1 minute for manual steps
        let totalTime = 0;
        for (const step of steps) {
            totalTime += step.automated ? baseTime : manualStepTime;
        }
        return totalTime;
    }
    canAutoRollback(riskLevel, steps) {
        if (riskLevel === 'critical') {
            return false;
        }
        return steps.every(step => step.automated);
    }
    async analyzeDependencies(operation) {
        const dependencies = [];
        // Analyze based on operation type and targets
        for (const target of operation.targets) {
            if (target.includes('package.json')) {
                dependencies.push('npm');
            }
            if (target.includes('requirements.txt')) {
                dependencies.push('pip');
            }
            if (target.includes('Cargo.toml')) {
                dependencies.push('cargo');
            }
        }
        return dependencies;
    }
    async cleanupOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const metaFiles = files.filter(f => f.endsWith('.meta'));
            if (metaFiles.length <= this.maxBackups) {
                return;
            }
            // Sort by timestamp and remove oldest
            const backupInfos = [];
            for (const metaFile of metaFiles) {
                try {
                    const metaPath = path.join(this.backupDir, metaFile);
                    const content = await fs.readFile(metaPath, 'utf-8');
                    const backup = JSON.parse(content);
                    backupInfos.push({ file: metaFile, backup });
                }
                catch (error) {
                    logger.warn(`Failed to read backup metadata ${metaFile}:`, error);
                }
            }
            // Sort by timestamp (oldest first)
            backupInfos.sort((a, b) => a.backup.timestamp.getTime() - b.backup.timestamp.getTime());
            const toDelete = backupInfos.slice(0, backupInfos.length - this.maxBackups);
            for (const { file, backup } of toDelete) {
                try {
                    // Delete backup file
                    if (backup.path && await this.fileExists(backup.path)) {
                        await fs.unlink(backup.path);
                    }
                    // Delete metadata file
                    const metaPath = path.join(this.backupDir, file);
                    await fs.unlink(metaPath);
                    logger.debug(`Cleaned up old backup: ${backup.id}`);
                }
                catch (error) {
                    logger.warn(`Failed to cleanup backup ${backup.id}:`, normalizeError(error).message);
                }
            }
        }
        catch (error) {
            logger.warn('Failed to cleanup old backups:', error);
        }
    }
}
//# sourceMappingURL=backup-rollback-system.js.map