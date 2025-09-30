/**
 * File Operation Helpers
 *
 * Utility functions to eliminate DRY violations in file operation commands
 */
import { EnhancedCodeEditor } from '../tools/enhanced-code-editor.js';
export interface FileOperationContext {
    editor: EnhancedCodeEditor;
    aiClient: any;
}
export interface CreateFileOptions {
    path: string;
    content?: string;
    description?: string;
}
export interface EditRequestFile {
    path: string;
    action: {
        type: 'create-file' | 'modify-content';
        parameters: Record<string, any>;
    };
    content: string;
    description: string;
}
/**
 * Initialize file operation context (eliminates repeated initialization)
 */
export declare function initializeFileOperationContext(): FileOperationContext;
/**
 * Create a standardized file edit request
 */
export declare function createFileEditRequest(type: 'create' | 'modify', files: EditRequestFile[]): {
    type: "create" | "modify";
    files: EditRequestFile[];
};
/**
 * Execute file operation with standardized error handling
 */
export declare function executeFileOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
/**
 * Generate safe output path for test files
 */
export declare function generateTestFilePath(sourcePath: string, outputPath?: string): string;
/**
 * Build AI prompt with consistent formatting
 */
export declare function buildAIPrompt(template: string, context: Record<string, any>): string;
/**
 * Create file with standardized handling
 */
export declare function createFileWithContent(context: FileOperationContext, options: CreateFileOptions): Promise<boolean>;
/**
 * Modify file with standardized handling
 */
export declare function modifyFileWithContent(context: FileOperationContext, filePath: string, newContent: string, description: string): Promise<boolean>;
/**
 * Generate code using AI with consistent prompt structure
 */
export declare function generateCodeWithAI(context: FileOperationContext, description: string, options?: {
    language?: string;
    framework?: string;
    includeComments?: boolean;
    includeErrorHandling?: boolean;
}): Promise<string>;
/**
 * Validate file path and ensure directory exists
 */
export declare function validateAndPreparePath(filePath: string): {
    isValid: boolean;
    error?: string;
};
/**
 * Detect file language from extension using constants
 */
export declare function detectFileLanguage(filePath: string): string | undefined;
/**
 * Check if technology string is a programming language
 */
export declare function isProgrammingLanguage(tech: string): boolean;
/**
 * Check if technology string is a framework
 */
export declare function isFramework(tech: string): boolean;
