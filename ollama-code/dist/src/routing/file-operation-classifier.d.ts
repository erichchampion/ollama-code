/**
 * File Operation Classifier
 *
 * Phase 2.2: Enhanced Natural Language Router
 * Classifies user intent for file operations and targets specific files
 */
import { UserIntent } from '../ai/intent-analyzer.js';
import { FileOperationIntent, FileOperationContext, FileClassificationResult } from './file-operation-types.js';
export declare class FileOperationClassifier {
    private workingDirectory;
    private projectFiles;
    private fileStats;
    constructor(workingDirectory: string);
    /**
     * Initialize classifier with project context
     */
    initialize(): Promise<void>;
    /**
     * Classify user intent for file operations
     */
    classifyFileOperation(intent: UserIntent, context: FileOperationContext): Promise<FileOperationIntent | null>;
    /**
     * Check if intent represents a file operation
     */
    private isFileOperationIntent;
    /**
     * Extract operation type from intent
     */
    private extractOperationType;
    /**
     * Classify and target specific files based on intent
     */
    classifyFileTargets(intent: UserIntent, context: FileOperationContext): Promise<FileClassificationResult>;
    /**
     * Find files based on context when not explicitly mentioned
     */
    private findContextualTargets;
    /**
     * Extract file patterns from intent
     */
    private extractFilePatterns;
    /**
     * Find files matching a pattern
     */
    private findFilesByPattern;
    /**
     * Check if file matches pattern
     */
    private matchesPattern;
    /**
     * Create a file target object
     */
    private createFileTarget;
    /**
     * Assess safety level of operation
     */
    private assessSafetyLevel;
    /**
     * Check if file is a system file
     */
    private isSystemFile;
    /**
     * Check if file is a configuration file
     */
    private isConfigFile;
    /**
     * Compare safety levels (returns 1 if a > b, -1 if a < b, 0 if equal)
     */
    private compareSafetyLevels;
    /**
     * Assess impact level of operation
     */
    private assessImpact;
    /**
     * Determine if operation requires approval
     */
    private shouldRequireApproval;
    /**
     * Determine if backup is required
     */
    private shouldCreateBackup;
    /**
     * Find file dependencies
     */
    private findDependencies;
    /**
     * Extract content specification from intent
     */
    private extractContentSpec;
    /**
     * Scan project files for context
     */
    private scanProjectFiles;
    /**
     * Recursively get all files in directory
     */
    private getAllFiles;
}
