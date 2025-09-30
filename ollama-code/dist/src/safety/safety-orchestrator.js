/**
 * Safety Orchestrator
 *
 * Phase 2.3: Main orchestrator for the comprehensive safety system
 */
import { logger } from '../utils/logger.js';
import { RiskAssessmentEngine } from './risk-assessment-engine.js';
import { ChangePreviewEngine } from './change-preview-engine.js';
import { BackupRollbackSystem } from './backup-rollback-system.js';
export class SafetyOrchestrator {
    riskEngine;
    previewEngine;
    backupSystem;
    approvals = new Map();
    events = [];
    config;
    constructor(config) {
        this.riskEngine = new RiskAssessmentEngine();
        this.previewEngine = new ChangePreviewEngine();
        this.backupSystem = new BackupRollbackSystem();
        this.config = this.mergeConfig(config);
    }
    /**
     * Comprehensive safety assessment for file operation
     */
    async assessOperation(context) {
        const { operationId, description, targets, content } = context;
        logger.info(`Starting safety assessment for operation ${operationId}`);
        this.emitEvent('operation_started', operationId, { description, targetCount: targets.length });
        try {
            // Step 1: Risk Assessment
            const riskAssessment = await this.riskEngine.assessRisk(description, targets);
            logger.debug(`Risk assessment completed: ${riskAssessment.level} risk`);
            // Step 2: Change Preview (if content provided)
            let changePreview;
            if (content && content.length > 0) {
                changePreview = await this.previewEngine.generatePreview(description, content.map(c => ({
                    filePath: c.filePath,
                    newContent: c.newContent,
                    originalContent: c.originalContent,
                    operation: description.type === 'create' ? 'create' :
                        description.type === 'delete' ? 'delete' : 'modify'
                })));
                logger.debug(`Change preview generated with ${changePreview.diffs.length} diffs`);
            }
            // Step 3: Determine required approvals
            const requiredApprovals = this.determineRequiredApprovals(riskAssessment, context);
            // Step 4: Create rollback plan
            const rollbackPlan = await this.createRollbackPlan(operationId, description, targets, riskAssessment.level);
            // Step 5: Create operation approval
            const approval = {
                operationId,
                operation: description,
                riskAssessment,
                requiredApprovals,
                approvals: [],
                status: requiredApprovals.length === 0 ? 'approved' : 'pending',
                timestamp: new Date(),
                expiresAt: this.calculateExpiration(),
                changePreview,
                rollbackPlan
            };
            // Step 6: Check for automatic approval
            if (this.canAutoApprove(approval, context)) {
                approval.status = 'approved';
                approval.approvals.push({
                    type: 'automated',
                    approver: 'system',
                    status: 'approved',
                    timestamp: new Date(),
                    reason: 'Automatic approval based on low risk assessment'
                });
                this.emitEvent('approval_granted', operationId, { type: 'automated' });
            }
            else {
                this.emitEvent('approval_requested', operationId, { requiredApprovals });
            }
            this.approvals.set(operationId, approval);
            logger.info(`Safety assessment completed for operation ${operationId}: ${approval.status}`);
            return approval;
        }
        catch (error) {
            logger.error(`Safety assessment failed for operation ${operationId}:`, error);
            this.emitEvent('operation_failed', operationId, { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
    /**
     * Request user approval for operation
     */
    async requestApproval(operationId, approvalType = 'user') {
        const approval = this.approvals.get(operationId);
        if (!approval) {
            throw new Error(`Operation ${operationId} not found`);
        }
        if (approval.status === 'expired') {
            throw new Error(`Operation ${operationId} has expired`);
        }
        logger.info(`Requesting ${approvalType} approval for operation ${operationId}`);
        // Present operation details to user
        const presentation = this.formatOperationPresentation(approval);
        console.log(presentation);
        // Simulate user input (in real implementation, this would be interactive)
        const userResponse = await this.getUserApprovalResponse(approval);
        const approvalRecord = {
            type: approvalType,
            approver: 'user', // In real implementation, get actual user ID
            status: userResponse.approved ? 'approved' : 'rejected',
            timestamp: new Date(),
            reason: userResponse.reason
        };
        approval.approvals.push(approvalRecord);
        // Update overall status
        if (userResponse.approved && this.allApprovalsGranted(approval)) {
            approval.status = 'approved';
            this.emitEvent('approval_granted', operationId, { type: approvalType });
        }
        else if (!userResponse.approved) {
            approval.status = 'rejected';
            this.emitEvent('approval_denied', operationId, { type: approvalType, reason: userResponse.reason });
        }
        return userResponse;
    }
    /**
     * Execute approved operation with safety measures
     */
    async executeOperation(operationId, executeCallback) {
        const approval = this.approvals.get(operationId);
        if (!approval) {
            throw new Error(`Operation ${operationId} not found`);
        }
        if (approval.status !== 'approved') {
            throw new Error(`Operation ${operationId} is not approved (status: ${approval.status})`);
        }
        logger.info(`Executing approved operation ${operationId}`);
        try {
            // Step 1: Create backups
            const targetPaths = approval.operation.targets;
            const backups = await this.backupSystem.createBackup(operationId, targetPaths, approval.operation);
            // Update rollback plan with actual backups
            if (approval.rollbackPlan) {
                approval.rollbackPlan.backups = backups;
            }
            logger.info(`Created ${backups.length} backups for operation ${operationId}`);
            // Step 2: Execute the operation
            await executeCallback();
            logger.info(`Operation ${operationId} executed successfully`);
            this.emitEvent('operation_completed', operationId, { success: true });
            return { success: true, rollbackAvailable: backups.length > 0 };
        }
        catch (error) {
            logger.error(`Operation ${operationId} failed:`, error);
            this.emitEvent('operation_failed', operationId, { error: error instanceof Error ? error.message : String(error) });
            // Determine if automatic rollback should be triggered
            if (this.shouldAutoRollback(approval)) {
                logger.info(`Triggering automatic rollback for operation ${operationId}`);
                await this.rollbackOperation(operationId);
            }
            throw error;
        }
    }
    /**
     * Rollback operation using created plan
     */
    async rollbackOperation(operationId) {
        const approval = this.approvals.get(operationId);
        if (!approval || !approval.rollbackPlan) {
            throw new Error(`No rollback plan available for operation ${operationId}`);
        }
        logger.info(`Starting rollback for operation ${operationId}`);
        this.emitEvent('rollback_initiated', operationId, {});
        try {
            const result = await this.backupSystem.executeRollback(approval.rollbackPlan);
            if (result.success) {
                logger.info(`Rollback completed successfully for operation ${operationId}`);
                this.emitEvent('rollback_completed', operationId, { success: true });
            }
            else {
                logger.error(`Rollback failed for operation ${operationId}: ${result.errors.join(', ')}`);
                this.emitEvent('rollback_completed', operationId, { success: false, errors: result.errors });
            }
            return result;
        }
        catch (error) {
            logger.error(`Rollback execution failed for operation ${operationId}:`, error);
            this.emitEvent('rollback_completed', operationId, { success: false, error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
    /**
     * Get operation status
     */
    getOperationStatus(operationId) {
        return this.approvals.get(operationId) || null;
    }
    /**
     * List all operations with their statuses
     */
    listOperations() {
        return Array.from(this.approvals.values());
    }
    /**
     * Get safety events
     */
    getSafetyEvents(operationId) {
        if (operationId) {
            return this.events.filter(e => e.operationId === operationId);
        }
        return this.events;
    }
    /**
     * Private helper methods
     */
    determineRequiredApprovals(riskAssessment, context) {
        const approvals = [];
        // User preferences override
        if (context.userPreferences?.requireConfirmation) {
            approvals.push('user');
        }
        // Risk-based approvals
        switch (riskAssessment.level) {
            case 'critical':
                approvals.push('admin', 'peer_review');
                break;
            case 'high':
                approvals.push('user', 'peer_review');
                break;
            case 'medium':
                approvals.push('user');
                break;
            case 'low':
            case 'minimal':
                // May not require approval based on config
                if (this.config.approvalSettings.requireExplicitApproval) {
                    approvals.push('user');
                }
                break;
        }
        return approvals;
    }
    async createRollbackPlan(operationId, description, targets, riskLevel) {
        // Create empty backup list - will be populated during execution
        const emptyBackups = [];
        return await this.backupSystem.createRollbackPlan(operationId, description, emptyBackups, riskLevel);
    }
    canAutoApprove(approval, context) {
        // Check user preferences
        if (context.userPreferences?.autoApprove === false) {
            return false;
        }
        // Check configuration
        if (!this.config.approvalSettings.allowAutoApproval) {
            return false;
        }
        // Check risk assessment
        if (!approval.riskAssessment.automaticApproval) {
            return false;
        }
        // Check required approvals
        if (approval.requiredApprovals.length > 0) {
            return false;
        }
        return true;
    }
    calculateExpiration() {
        const timeout = this.config.approvalSettings.defaultTimeout;
        return new Date(Date.now() + timeout);
    }
    allApprovalsGranted(approval) {
        for (const requiredType of approval.requiredApprovals) {
            const hasApproval = approval.approvals.some(a => a.type === requiredType && a.status === 'approved');
            if (!hasApproval) {
                return false;
            }
        }
        return true;
    }
    shouldAutoRollback(approval) {
        if (!this.config.rollbackSettings.autoRollbackEnabled) {
            return false;
        }
        if (!approval.rollbackPlan?.canAutoRollback) {
            return false;
        }
        const riskThreshold = this.config.rollbackSettings.autoRollbackThreshold;
        const riskLevels = ['minimal', 'low', 'medium', 'high', 'critical'];
        const currentLevel = approval.riskAssessment.level;
        return riskLevels.indexOf(currentLevel) <= riskLevels.indexOf(riskThreshold);
    }
    formatOperationPresentation(approval) {
        const { operation, riskAssessment, changePreview } = approval;
        const sections = [];
        sections.push('🔒 OPERATION APPROVAL REQUIRED');
        sections.push('═'.repeat(50));
        sections.push(`Operation: ${operation.type.toUpperCase()}`);
        sections.push(`Description: ${operation.description}`);
        sections.push(`Targets: ${operation.targets.length} file(s)`);
        sections.push('');
        sections.push('📊 RISK ASSESSMENT');
        sections.push(`Risk Level: ${riskAssessment.level.toUpperCase()}`);
        sections.push(`Safety Level: ${riskAssessment.safetyLevel}`);
        sections.push(`Impact Level: ${riskAssessment.impactLevel}`);
        sections.push(`Confidence: ${(riskAssessment.confidence * 100).toFixed(1)}%`);
        sections.push(`Reasoning: ${riskAssessment.reasoning}`);
        sections.push('');
        if (riskAssessment.riskFactors.length > 0) {
            sections.push('⚠️  RISK FACTORS');
            riskAssessment.riskFactors.forEach(factor => {
                sections.push(`• ${factor.description} (${factor.severity})`);
            });
            sections.push('');
        }
        if (changePreview) {
            sections.push('🔍 CHANGE PREVIEW');
            sections.push(`Files: ${changePreview.summary.totalFiles}`);
            sections.push(`Lines: +${changePreview.summary.addedLines} -${changePreview.summary.removedLines}`);
            if (changePreview.visualDiff) {
                sections.push(changePreview.visualDiff);
            }
            sections.push('');
        }
        if (riskAssessment.mitigationStrategies.length > 0) {
            sections.push('🛡️  MITIGATION STRATEGIES');
            riskAssessment.mitigationStrategies.forEach(strategy => {
                sections.push(`• ${strategy}`);
            });
            sections.push('');
        }
        sections.push('Please review and confirm if you want to proceed.');
        return sections.join('\n');
    }
    async getUserApprovalResponse(approval) {
        // In a real implementation, this would present an interactive UI
        // For now, simulate based on risk level
        const riskLevel = approval.riskAssessment.level;
        if (riskLevel === 'critical') {
            return { approved: false, reason: 'Critical risk level requires manual review' };
        }
        if (riskLevel === 'high') {
            return { approved: false, reason: 'High risk requires careful consideration' };
        }
        // Simulate approval for lower risk operations
        return { approved: true, reason: 'Acceptable risk level' };
    }
    emitEvent(type, operationId, data) {
        const event = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            operationId,
            timestamp: new Date(),
            data,
            severity: this.getEventSeverity(type),
            handled: false
        };
        this.events.push(event);
        // Keep only last 1000 events
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
        logger.debug(`Safety event emitted: ${type} for operation ${operationId}`);
    }
    getEventSeverity(type) {
        switch (type) {
            case 'operation_failed':
            case 'rollback_initiated':
                return 'error';
            case 'approval_denied':
            case 'risk_threshold_exceeded':
                return 'warning';
            case 'manual_intervention_required':
                return 'critical';
            default:
                return 'info';
        }
    }
    mergeConfig(config) {
        const defaultConfig = {
            riskThresholds: {
                autoApprove: 'low',
                requireConfirmation: 'medium',
                requireAdminApproval: 'high',
                blockOperation: 'critical'
            },
            backupSettings: {
                enabled: true,
                retentionDays: 30,
                maxBackups: 50,
                compressBackups: false,
                backupTypes: ['full_file']
            },
            approvalSettings: {
                defaultTimeout: 300000, // 5 minutes
                requireExplicitApproval: false,
                allowAutoApproval: true,
                escalationEnabled: true
            },
            rollbackSettings: {
                autoRollbackEnabled: true,
                autoRollbackThreshold: 'medium',
                maxRollbackSteps: 20,
                rollbackTimeout: 60000 // 1 minute
            }
        };
        return { ...defaultConfig, ...config };
    }
}
//# sourceMappingURL=safety-orchestrator.js.map