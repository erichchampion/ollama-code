/**
 * Safety Orchestrator
 *
 * Phase 2.3: Main orchestrator for the comprehensive safety system
 */
import { OperationApproval, FileOperationDescription, ApprovalType, SafetyConfiguration, SafetyEvent, RiskLevel } from './safety-types.js';
import { FileTarget } from '../routing/file-operation-types.js';
interface OperationContext {
    operationId: string;
    description: FileOperationDescription;
    targets: FileTarget[];
    content?: {
        filePath: string;
        newContent: string;
        originalContent?: string;
    }[];
    userPreferences?: {
        autoApprove: boolean;
        riskTolerance: RiskLevel;
        requireConfirmation: boolean;
    };
}
export declare class SafetyOrchestrator {
    private riskEngine;
    private previewEngine;
    private backupSystem;
    private approvals;
    private events;
    private config;
    constructor(config?: Partial<SafetyConfiguration>);
    /**
     * Comprehensive safety assessment for file operation
     */
    assessOperation(context: OperationContext): Promise<OperationApproval>;
    /**
     * Request user approval for operation
     */
    requestApproval(operationId: string, approvalType?: ApprovalType): Promise<{
        approved: boolean;
        reason?: string;
    }>;
    /**
     * Execute approved operation with safety measures
     */
    executeOperation(operationId: string, executeCallback: () => Promise<void>): Promise<{
        success: boolean;
        rollbackAvailable: boolean;
    }>;
    /**
     * Rollback operation using created plan
     */
    rollbackOperation(operationId: string): Promise<{
        success: boolean;
        errors: string[];
    }>;
    /**
     * Get operation status
     */
    getOperationStatus(operationId: string): OperationApproval | null;
    /**
     * List all operations with their statuses
     */
    listOperations(): OperationApproval[];
    /**
     * Get safety events
     */
    getSafetyEvents(operationId?: string): SafetyEvent[];
    /**
     * Private helper methods
     */
    private determineRequiredApprovals;
    private createRollbackPlan;
    private canAutoApprove;
    private calculateExpiration;
    private allApprovalsGranted;
    private shouldAutoRollback;
    private formatOperationPresentation;
    private getUserApprovalResponse;
    private emitEvent;
    private getEventSeverity;
    private mergeConfig;
}
export {};
