/**
 * Command Helper Utilities
 *
 * Provides reusable utility functions for command validation, error handling,
 * and common patterns to eliminate code duplication across command implementations.
 */
import { promises as fs } from 'fs';
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
 * Validates that a file exists at the given path
 */
export async function validateFileExists(filePath) {
    if (!validateNonEmptyString(filePath, 'file path')) {
        return false;
    }
    if (!await fileExists(filePath)) {
        console.error(`File not found: ${filePath}`);
        return false;
    }
    return true;
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
//# sourceMappingURL=command-helpers.js.map