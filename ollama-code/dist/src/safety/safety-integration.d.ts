/**
 * Safety System Integration
 *
 * Phase 2.3: Integration layer to connect safety system with file operations
 */
import { OperationApproval, SafetyConfiguration } from './safety-types.js';
interface SafeFileOperationContext {
    operationId: string;
    description: string;
    targets: string[];
    operationType: 'create' | 'modify' | 'delete' | 'move' | 'copy';
    content?: string;
    preview?: boolean;
    userPreferences?: {
        autoApprove?: boolean;
        riskTolerance?: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
        requireConfirmation?: boolean;
    };
}
interface SafeOperationResult {
    success: boolean;
    operationId: string;
    approval?: OperationApproval;
    rollbackAvailable: boolean;
    message: string;
    warnings?: string[];
    errors?: string[];
}
export declare class SafetyIntegration {
    private orchestrator;
    private pendingOperations;
    constructor(config?: Partial<SafetyConfiguration>);
    /**
     * Execute file operation with comprehensive safety measures
     */
    executeFileOperationSafely(context: SafeFileOperationContext, operationCallback: () => Promise<void>): Promise<SafeOperationResult>;
    /**
     * Request approval for pending operation
     */
    requestOperationApproval(operationId: string): Promise<SafeOperationResult>;
    /**
     * Rollback operation
     */
    rollbackOperation(operationId: string): Promise<SafeOperationResult>;
    /**
     * Get operation status and details
     */
    getOperationDetails(operationId: string): {
        status: string;
        details?: OperationApproval;
        formattedSummary?: string;
    };
    /**
     * List all operations
     */
    listOperations(): Array<{
        operationId: string;
        status: string;
        type: string;
        description: string;
        riskLevel: string;
        timestamp: Date;
    }>;
    /**
     * Get safety events for operation
     */
    getOperationEvents(operationId: string): import("./safety-types.js").SafetyEvent[];
    /**
     * Private helper methods
     */
    private analyzeTargets;
    private createOperationDescription;
    private prepareContentForPreview;
    private handlePreviewMode;
    private handlePendingApproval;
    private handleRejectedOperation;
    private extractWarnings;
    private formatOperationSummary;
}
export declare function getSafetyIntegration(config?: Partial<SafetyConfiguration>): SafetyIntegration;
export declare function resetSafetyIntegration(): void;
export {};
