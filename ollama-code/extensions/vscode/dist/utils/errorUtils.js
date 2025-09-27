"use strict";
/**
 * Error Utilities
 *
 * Shared error handling utilities to eliminate duplicate error handling patterns
 * and provide consistent error formatting across the extension.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = formatError;
exports.createError = createError;
exports.withErrorHandling = withErrorHandling;
exports.safePromise = safePromise;
exports.validateRequired = validateRequired;
exports.createTimeoutError = createTimeoutError;
exports.handleVSCodeError = handleVSCodeError;
const serviceConstants_1 = require("../config/serviceConstants");
/**
 * Format any error type into a user-friendly string message
 */
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
/**
 * Create a standardized error object with context
 */
function createError(message, context) {
    const error = new Error(message);
    if (context) {
        error.context = context;
    }
    return error;
}
/**
 * Wrap async functions with standardized error handling
 */
function withErrorHandling(fn, errorMessage) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            const formattedError = errorMessage || formatError(error);
            console.error(`Error in ${fn.name || 'anonymous function'}:`, formattedError);
            return null;
        }
    };
}
/**
 * Handle promise rejections with optional fallback value
 */
async function safePromise(promise, fallback) {
    try {
        return await promise;
    }
    catch (error) {
        console.error('Promise rejected:', formatError(error));
        return fallback;
    }
}
/**
 * Validate required parameters and throw descriptive errors
 */
function validateRequired(value, paramName) {
    if (value === null || value === undefined) {
        throw createError(`Required parameter '${paramName}' is missing`);
    }
}
/**
 * Create timeout error with context
 */
function createTimeoutError(operation, timeout) {
    return createError(serviceConstants_1.ERROR_MESSAGES.TIMEOUT_EXCEEDED, {
        operation,
        timeout,
    });
}
/**
 * Handle VS Code API errors with user-friendly messages
 */
function handleVSCodeError(error, operation) {
    const errorMessage = formatError(error);
    // Common VS Code error patterns
    if (errorMessage.includes('ENOENT')) {
        return `File not found during ${operation}`;
    }
    if (errorMessage.includes('EACCES') || errorMessage.includes('EPERM')) {
        return `Permission denied during ${operation}`;
    }
    if (errorMessage.includes('ETIMEDOUT')) {
        return `Timeout during ${operation}`;
    }
    if (errorMessage.includes('cancelled')) {
        return `${operation} was cancelled`;
    }
    return `Error during ${operation}: ${errorMessage}`;
}
//# sourceMappingURL=errorUtils.js.map