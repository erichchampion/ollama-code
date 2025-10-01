/**
 * Command Helper Utilities
 *
 * Provides reusable utility functions for command validation, error handling,
 * and common patterns to eliminate code duplication across command implementations.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { createSpinner } from './spinner.js';
import { formatErrorForDisplay } from '../errors/formatter.js';
import { fileExists } from '../fs/operations.js';
/**
 * Validates that a value is a non-empty string
 */
export function validateNonEmptyString(value, fieldName) {
    if (typeof value !== 'string' || value.trim() === '') {
        console.error(`Please provide a ${fieldName}.`);
        return false;
    }
    return true;
}
/**
 * Validates that a file exists at the given path and prevents directory traversal attacks
 */
export async function validateFileExists(filePath) {
    if (!validateNonEmptyString(filePath, 'file path')) {
        return false;
    }
    // Security: Prevent directory traversal attacks
    if (!isSecureFilePath(filePath)) {
        console.error(`Access denied: Path outside working directory not allowed: ${filePath}`);
        throw new Error(`Security: Directory traversal attack blocked: ${filePath}`);
    }
    if (!await fileExists(filePath)) {
        console.error(`File not found: ${filePath}`);
        return false;
    }
    return true;
}
/**
 * Security function to prevent directory traversal attacks
 * Only allows access to files within the current working directory and its subdirectories
 */
function isSecureFilePath(filePath) {
    try {
        // Get the current working directory
        const cwd = process.cwd();
        // Resolve the file path to an absolute path
        const resolvedPath = path.resolve(filePath);
        // Check if the resolved path is within the current working directory
        // This prevents access to parent directories using ../
        const isWithinCwd = resolvedPath.startsWith(cwd + path.sep) || resolvedPath === cwd;
        if (!isWithinCwd) {
            logger.warn(`Directory traversal attempt blocked: ${filePath} -> ${resolvedPath}`);
            return false;
        }
        // Additional security: Block access to sensitive system files
        const forbiddenPaths = [
            '/etc/',
            '/var/',
            '/usr/',
            '/opt/',
            '/root/',
            '/proc/',
            '/sys/',
            'C:\\Windows\\',
            'C:\\Program Files\\',
            'C:\\Program Files (x86)\\',
            'C:\\Users\\',
            process.env.HOME || '',
            path.join(process.env.HOME || '', '.ssh'),
            path.join(process.env.HOME || '', '.aws'),
            path.join(process.env.HOME || '', '.config')
        ];
        for (const forbiddenPath of forbiddenPaths) {
            if (forbiddenPath && resolvedPath.startsWith(forbiddenPath)) {
                logger.warn(`Access to sensitive system path blocked: ${resolvedPath}`);
                return false;
            }
        }
        return true;
    }
    catch (error) {
        logger.error(`Path validation error: ${error}`);
        return false;
    }
}
/**
 * Validates that a directory exists at the given path
 */
export async function validateDirectoryExists(dirPath) {
    if (!validateNonEmptyString(dirPath, 'directory path')) {
        return false;
    }
    try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
            console.error(`Path is not a directory: ${dirPath}`);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error(`Directory not found: ${dirPath}`);
        return false;
    }
}
/**
 * Executes a function with a spinner animation
 * Handles spinner cleanup and error formatting consistently
 */
export async function executeWithSpinner(spinnerText, fn, successMessage, errorMessage) {
    const spinner = createSpinner(spinnerText);
    spinner.start();
    try {
        const result = await fn();
        if (successMessage) {
            spinner.succeed(successMessage);
        }
        else {
            spinner.stop();
        }
        return result;
    }
    catch (error) {
        if (errorMessage) {
            spinner.fail(errorMessage);
        }
        else {
            spinner.fail();
        }
        throw error;
    }
}
/**
 * Handles command errors consistently across all commands
 */
export function handleCommandError(error, spinner, customMessage) {
    // Stop spinner if provided
    if (spinner) {
        if (customMessage) {
            spinner.fail(customMessage);
        }
        else {
            spinner.fail();
        }
    }
    // Format and display error
    const formattedError = formatErrorForDisplay(error);
    console.error(formattedError);
    // Log detailed error for debugging
    logger.error('Command execution failed:', error);
}
/**
 * Safely executes a command with proper error handling and cleanup
 */
export async function executeCommand(commandName, operation, options = {}) {
    const { spinnerText, successMessage, errorMessage, validateInputs } = options;
    try {
        // Run input validation if provided
        if (validateInputs) {
            const isValid = await validateInputs();
            if (!isValid) {
                return undefined;
            }
        }
        // Execute with or without spinner
        if (spinnerText) {
            return await executeWithSpinner(spinnerText, operation, successMessage, errorMessage);
        }
        else {
            return await operation();
        }
    }
    catch (error) {
        handleCommandError(error, undefined, errorMessage);
        return undefined;
    }
}
/**
 * Creates a cancellable operation with SIGINT handling
 */
export function createCancellableOperation(operation) {
    const abortController = new AbortController();
    // Handle Ctrl+C gracefully
    const handleInterrupt = () => {
        abortController.abort();
        console.log('\n\nOperation cancelled by user.');
    };
    process.on('SIGINT', handleInterrupt);
    return operation(abortController.signal).finally(() => {
        // Always clean up the interrupt handler
        process.off('SIGINT', handleInterrupt);
    });
}
/**
 * Validates file extension matches expected types
 */
export function validateFileExtension(filePath, allowedExtensions) {
    const ext = filePath.toLowerCase().split('.').pop() || '';
    if (!allowedExtensions.includes(ext)) {
        console.error(`Unsupported file type: .${ext}. ` +
            `Supported types: ${allowedExtensions.map(e => `.${e}`).join(', ')}`);
        return false;
    }
    return true;
}
/**
 * Safely parses JSON with error handling
 */
export function parseJSONSafely(jsonString) {
    try {
        return JSON.parse(jsonString);
    }
    catch (error) {
        logger.error('Failed to parse JSON:', error);
        return null;
    }
}
/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - 3) + '...';
}
/**
 * Validates that required command arguments are provided
 */
export function validateRequiredArgs(args, requiredCount, commandName, usage) {
    if (args.length < requiredCount) {
        console.error(`Insufficient arguments for ${commandName} command.`);
        console.error(`Usage: ${usage}`);
        return false;
    }
    return true;
}
/**
 * Security function to sanitize search terms and prevent command injection
 * Removes dangerous shell metacharacters that could be used for injection attacks
 */
export function sanitizeSearchTerm(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    // Remove or escape dangerous shell metacharacters
    // Keep only alphanumeric, spaces, basic punctuation, and safe regex characters
    const sanitized = input
        .replace(/[;&|`$(){}[\]\\<>]/g, '') // Remove shell metacharacters
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/'/g, "\\'") // Escape single quotes
        .trim();
    // Additional validation: prevent extremely long inputs
    if (sanitized.length > 1000) {
        logger.warn(`Search term truncated from ${input.length} to 1000 characters`);
        return sanitized.substring(0, 1000);
    }
    // Log security warning if dangerous characters were removed
    if (sanitized !== input) {
        logger.warn(`Search term sanitized: "${input}" -> "${sanitized}"`);
    }
    return sanitized;
}
/**
 * Security function to validate and sanitize shell commands to prevent injection attacks
 * Returns null if the command is deemed unsafe
 */
export function validateAndSanitizeCommand(input) {
    if (!input || typeof input !== 'string') {
        logger.warn('Command validation failed: empty or invalid input');
        return null;
    }
    const command = input.trim();
    // Prevent extremely long commands
    if (command.length > 500) {
        logger.warn(`Command rejected: too long (${command.length} characters)`);
        return null;
    }
    // Define allowed safe commands for code development
    const allowedCommands = [
        'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find', 'wc',
        'git status', 'git log', 'git diff', 'git branch', 'git show',
        'npm --version', 'node --version', 'yarn --version', 'tsc --version',
        'npm list', 'yarn list', 'npm audit', 'yarn audit'
    ];
    // Check if command starts with any allowed pattern
    const isAllowed = allowedCommands.some(allowed => command.toLowerCase().startsWith(allowed.toLowerCase()));
    if (!isAllowed) {
        logger.warn(`Command rejected: not in allowlist: ${command}`);
        return null;
    }
    // Additional security checks: dangerous patterns
    const dangerousPatterns = [
        /rm\s+(-rf|\-r|\-f)/i, // rm -rf, rm -r, rm -f
        />/, // Output redirection
        /\|/, // Pipes
        /;/, // Command chaining
        /&&/, // Command chaining
        /\|\|/, // Command chaining
        /`/, // Command substitution
        /\$\(/, // Command substitution
        /\.\./, // Directory traversal
        /(curl|wget)\s+/i, // Network requests
        /(nc|netcat)\s+/i, // Network connections
        /sh\s+/i, // Shell execution
        /bash\s+/i, // Bash execution
        /eval\s+/i, // Code evaluation
        /exec\s+/i // Process execution
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(command)) {
            logger.warn(`Command rejected: dangerous pattern detected: ${command}`);
            return null;
        }
    }
    logger.debug(`Command validated and approved: ${command}`);
    return command;
}
//# sourceMappingURL=command-helpers.js.map