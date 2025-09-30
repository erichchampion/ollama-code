/**
 * File Operation Helpers
 *
 * Utility functions to eliminate DRY violations in file operation commands
 */
import { EnhancedCodeEditor } from '../tools/enhanced-code-editor.js';
import { getAIClient } from '../ai/index.js';
import { logger } from '../utils/logger.js';
import { formatErrorForDisplay } from '../errors/formatter.js';
import { FILE_OPERATION_CONSTANTS } from '../constants/file-operations.js';
import path from 'path';
/**
 * Initialize file operation context (eliminates repeated initialization)
 */
export function initializeFileOperationContext() {
    return {
        editor: new EnhancedCodeEditor(),
        aiClient: getAIClient()
    };
}
/**
 * Create a standardized file edit request
 */
export function createFileEditRequest(type, files) {
    return {
        type,
        files
    };
}
/**
 * Execute file operation with standardized error handling
 */
export async function executeFileOperation(operation, operationName) {
    try {
        logger.info(`Starting file operation: ${operationName}`);
        return await operation();
    }
    catch (error) {
        logger.error(`File operation failed: ${operationName}`, error);
        console.error(formatErrorForDisplay(error));
        throw error;
    }
}
/**
 * Generate safe output path for test files
 */
export function generateTestFilePath(sourcePath, outputPath) {
    if (outputPath) {
        return outputPath;
    }
    const ext = path.extname(sourcePath);
    const validExtensions = ['.ts', '.js', '.py'];
    if (!validExtensions.includes(ext)) {
        // Fallback for unsupported extensions
        return sourcePath.replace(/\.[^.]+$/, '.test.js');
    }
    return sourcePath.replace(/\.(ts|js|py)$/, '.test.$1');
}
/**
 * Build AI prompt with consistent formatting
 */
export function buildAIPrompt(template, context) {
    let prompt = template;
    for (const [key, value] of Object.entries(context)) {
        prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return prompt;
}
/**
 * Create file with standardized handling
 */
export async function createFileWithContent(context, options) {
    const request = createFileEditRequest('create', [{
            path: options.path,
            action: {
                type: 'create-file',
                parameters: {}
            },
            content: options.content || '',
            description: options.description || `Created file: ${path.basename(options.path)}`
        }]);
    const results = await context.editor.executeEditRequest(request);
    if (results[0].success) {
        console.log(`✅ Successfully created: ${options.path}`);
        if (options.description) {
            console.log(`   ${options.description}`);
        }
        return true;
    }
    else {
        console.error(`❌ Failed to create file: ${results[0].error}`);
        return false;
    }
}
/**
 * Modify file with standardized handling
 */
export async function modifyFileWithContent(context, filePath, newContent, description) {
    const request = createFileEditRequest('modify', [{
            path: filePath,
            action: {
                type: 'modify-content',
                parameters: {}
            },
            content: newContent,
            description
        }]);
    const results = await context.editor.executeEditRequest(request);
    if (results[0].success) {
        console.log(`✅ Successfully modified: ${filePath}`);
        console.log(`   Applied: "${description}"`);
        return true;
    }
    else {
        console.error(`❌ Failed to modify file: ${results[0].error}`);
        return false;
    }
}
/**
 * Generate code using AI with consistent prompt structure
 */
export async function generateCodeWithAI(context, description, options = {}) {
    const contextParts = [];
    if (options.language) {
        contextParts.push(`Language: ${options.language}`);
    }
    if (options.framework) {
        contextParts.push(`Framework: ${options.framework}`);
    }
    const requirements = [];
    if (options.includeErrorHandling !== false) {
        requirements.push('- Include proper error handling');
    }
    if (options.includeComments !== false) {
        requirements.push('- Add appropriate comments');
    }
    requirements.push('- Follow best practices', '- Make it complete and functional');
    const prompt = buildAIPrompt(`Generate production-ready code for: {description}
{context}

Requirements:
{requirements}

Provide only the code:`, {
        description,
        context: contextParts.length > 0 ? '\n' + contextParts.join('\n') : '',
        requirements: requirements.join('\n')
    });
    const response = await context.aiClient.complete(prompt);
    return response.message?.content || '';
}
/**
 * Validate file path and ensure directory exists
 */
export function validateAndPreparePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        return { isValid: false, error: 'File path must be a non-empty string' };
    }
    const normalizedPath = path.normalize(filePath);
    // Check for potentially dangerous paths
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
        return {
            isValid: false,
            error: 'Path contains potentially unsafe components'
        };
    }
    return { isValid: true };
}
/**
 * Detect file language from extension using constants
 */
export function detectFileLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return FILE_OPERATION_CONSTANTS.LANGUAGE_EXTENSIONS[ext];
}
/**
 * Check if technology string is a programming language
 */
export function isProgrammingLanguage(tech) {
    return FILE_OPERATION_CONSTANTS.PROGRAMMING_LANGUAGES
        .includes(tech.toLowerCase());
}
/**
 * Check if technology string is a framework
 */
export function isFramework(tech) {
    return FILE_OPERATION_CONSTANTS.FRAMEWORKS
        .includes(tech.toLowerCase());
}
//# sourceMappingURL=file-operation-helpers.js.map