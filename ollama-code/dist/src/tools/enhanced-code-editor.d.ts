/**
 * Enhanced Code Editor
 *
 * Provides advanced AI-powered code editing capabilities with AST-aware editing,
 * multi-file operations, template-based generation, and intelligent validation.
 *
 * Built upon the existing CodeEditor foundation with enhanced capabilities.
 */
import { CodeEditor, EditResult } from './code-editor.js';
export interface EditRequest {
    type: 'create' | 'modify' | 'refactor' | 'replace' | 'insert';
    files: FileEditOperation[];
    context?: CodeContext;
    validation?: ValidationLevel;
    preview?: boolean;
    atomic?: boolean;
}
export interface FileEditOperation {
    path: string;
    action: EditAction;
    content?: string;
    searchPattern?: string | RegExp;
    replaceContent?: string;
    insertLocation?: InsertLocation;
    templateData?: Record<string, any>;
    description?: string;
}
export interface EditAction {
    type: 'create-file' | 'modify-content' | 'find-replace' | 'insert-at' | 'delete-lines' | 'refactor-ast';
    parameters: Record<string, any>;
}
export interface InsertLocation {
    type: 'start' | 'end' | 'line-number' | 'after-pattern' | 'before-pattern' | 'ast-node';
    value: number | string | ASTLocation;
}
export interface ASTLocation {
    nodeType: string;
    name?: string;
    position?: 'start' | 'end' | 'after' | 'before';
}
export interface CodeContext {
    projectRoot: string;
    language: string;
    framework?: string;
    dependencies: string[];
    relatedFiles: string[];
    codeStyle?: CodingStyle;
}
export interface CodingStyle {
    indentation: 'spaces' | 'tabs';
    indentSize: number;
    semicolons: boolean;
    quotes: 'single' | 'double';
    trailingComma: boolean;
    lineEnding: 'lf' | 'crlf';
}
export declare enum ValidationLevel {
    SYNTAX_ONLY = "syntax",
    SEMANTIC = "semantic",
    FULL_PROJECT = "full",
    AI_ENHANCED = "ai-enhanced"
}
export interface EnhancedEditResult extends EditResult {
    previewDiff?: string;
    affectedFiles?: string[];
    suggestedTests?: string[];
    codeQualityScore?: number;
    estimatedImpact?: ImpactAssessment;
}
export interface ImpactAssessment {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    affectedComponents: string[];
    requiredTests: string[];
    documentationUpdates: string[];
    breakingChanges: boolean;
}
export interface CodeTemplate {
    id: string;
    name: string;
    description: string;
    language: string;
    framework?: string;
    template: string;
    parameters: TemplateParameter[];
    dependencies?: string[];
}
export interface TemplateParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    default?: any;
    validation?: (value: any) => boolean;
}
export interface ASTNode {
    type: string;
    name?: string;
    start: number;
    end: number;
    children?: ASTNode[];
    properties?: Record<string, any>;
}
export interface ASTEdit {
    nodeType: string;
    operation: 'insert' | 'replace' | 'delete' | 'modify';
    target: ASTNode | string;
    newContent?: string;
    position?: 'before' | 'after' | 'inside';
}
/**
 * Enhanced Code Editor class extending the base CodeEditor
 */
export declare class EnhancedCodeEditor extends CodeEditor {
    private templates;
    private astCache;
    private projectContext?;
    constructor(backupDir?: string);
    /**
     * Initialize the enhanced code editor with project context
     */
    initializeWithContext(context: CodeContext): Promise<void>;
    /**
     * Execute a comprehensive edit request
     */
    executeEditRequest(request: EditRequest): Promise<EnhancedEditResult[]>;
    /**
     * Execute a single file operation
     */
    private executeFileOperation;
    /**
     * Generate file content using templates
     */
    private generateFileContent;
    /**
     * Perform find and replace operation
     */
    private performFindReplace;
    /**
     * Perform insert at specific location
     */
    private performInsertAt;
    /**
     * Perform AST-based refactoring (placeholder for now)
     */
    private performASTRefactor;
    /**
     * Apply a template with given data
     */
    private applyTemplate;
    /**
     * Load default templates for common code patterns
     */
    private loadDefaultTemplates;
    /**
     * Enhance edit result with additional metadata
     */
    private enhanceEditResult;
    /**
     * Validate edit request before execution
     */
    private validateEditRequest;
    /**
     * Generate preview of edit operations without applying them
     */
    private generateEditPreview;
    /**
     * Utility methods
     */
    private findPatternLine;
    private applyCodingStyle;
    private generateDiff;
    private assessCodeQuality;
    private assessImpact;
    private performEnhancedValidation;
    private rollbackOperations;
    /**
     * Public API methods
     */
    /**
     * Add a custom template
     */
    addTemplate(template: CodeTemplate): void;
    /**
     * Get available templates
     */
    getTemplates(): CodeTemplate[];
    /**
     * Get templates by language or framework
     */
    getTemplatesByContext(language?: string, framework?: string): CodeTemplate[];
}
