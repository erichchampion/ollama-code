/**
 * Safe Code Editor
 *
 * Provides safe, atomic code editing capabilities with backup, validation,
 * and rollback functionality for autonomous code modifications.
 */
export interface CodeEdit {
    id: string;
    filePath: string;
    originalContent: string;
    newContent: string;
    backup?: string;
    applied: boolean;
    timestamp: Date;
    validationPassed: boolean;
    description?: string;
}
export interface EditResult {
    success: boolean;
    editId: string;
    backupPath?: string;
    validationErrors?: string[];
    error?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare enum ValidationLevel {
    SYNTAX = "syntax",
    SEMANTIC = "semantic",
    FULL = "full",
    AI_ENHANCED = "ai-enhanced"
}
export declare class CodeEditor {
    private pendingEdits;
    private appliedEdits;
    private backupDir;
    constructor(backupDir?: string);
    /**
     * Initialize the code editor
     */
    initialize(): Promise<void>;
    /**
     * Create a safe file edit operation
     */
    createEdit(filePath: string, newContent: string, description?: string): Promise<EditResult>;
    /**
     * Apply a pending edit with backup
     */
    applyEdit(editId: string): Promise<EditResult>;
    /**
     * Apply multiple edits in a transaction
     */
    applyEdits(editIds: string[]): Promise<EditResult[]>;
    /**
     * Rollback an applied edit
     */
    rollbackEdit(editId: string): Promise<EditResult>;
    /**
     * Validate code content with specified validation level
     */
    validateContent(filePath: string, content: string, level?: ValidationLevel): Promise<ValidationResult>;
    /**
     * Validate JavaScript content
     */
    private validateJavaScript;
    /**
     * Validate TypeScript content
     */
    private validateTypeScript;
    /**
     * Validate JSON content
     */
    private validateJSON;
    /**
     * Validate Markdown content
     */
    private validateMarkdown;
    /**
     * Generic validation for unknown file types
     */
    private validateGeneric;
    /**
     * Create a backup of the original content
     */
    private createBackup;
    /**
     * Atomic write operation
     */
    private atomicWrite;
    /**
     * Get all pending edits
     */
    getPendingEdits(): CodeEdit[];
    /**
     * Get all applied edits
     */
    getAppliedEdits(): CodeEdit[];
    /**
     * Get edit by ID
     */
    getEdit(editId: string): CodeEdit | undefined;
    /**
     * Cancel a pending edit
     */
    cancelEdit(editId: string): boolean;
    /**
     * Clean up old backups
     */
    cleanupBackups(maxAge?: number): Promise<void>;
}
