/**
 * Change Preview Engine
 *
 * Phase 2.3: Visual diff and change preview system for file operations
 */
import { ChangePreview, FileOperationDescription } from './safety-types.js';
interface PreviewContent {
    originalContent?: string;
    newContent: string;
    filePath: string;
    operation: 'create' | 'modify' | 'delete';
}
export declare class ChangePreviewEngine {
    private maxPreviewLines;
    private contextLines;
    /**
     * Generate comprehensive change preview
     */
    generatePreview(operation: FileOperationDescription, changes: PreviewContent[]): Promise<ChangePreview>;
    /**
     * Generate file diffs for all changes
     */
    private generateFileDiffs;
    /**
     * Generate diff for a single file
     */
    private generateSingleFileDiff;
    /**
     * Generate diff for file creation
     */
    private generateCreateDiff;
    /**
     * Generate diff for file modification
     */
    private generateModifyDiff;
    /**
     * Generate diff for file deletion
     */
    private generateDeleteDiff;
    /**
     * Compute unified diff between two sets of lines
     */
    private computeUnifiedDiff;
    /**
     * Find a chunk of changed lines
     */
    private findChangedChunk;
    /**
     * Format unified diff
     */
    private formatUnifiedDiff;
    /**
     * Create preview text
     */
    private createPreview;
    /**
     * Create preview for modifications
     */
    private createModificationPreview;
    /**
     * Create change summary
     */
    private createChangeSummary;
    /**
     * Create visual diff representation
     */
    private createVisualDiff;
    /**
     * Analyze affected dependencies
     */
    private analyzeAffectedDependencies;
    /**
     * Identify potential issues with the changes
     */
    private identifyPotentialIssues;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Helper methods
     */
    private operationToChangeType;
    private isBinaryFile;
    private isCodeFile;
    private isConfigFile;
    private isDependencyFile;
    private extractImportedDependencies;
    private checkSyntaxIssues;
    private checkBreakingChanges;
    private checkSecurityConcerns;
    private extractExports;
    private createPlaceholderDiff;
}
export {};
