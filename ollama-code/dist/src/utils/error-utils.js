/**
 * Error Handling Utilities
 *
 * Centralized error handling functions to replace duplicate error patterns
 */
/**
 * Extract error message safely from unknown error type
 * @param error - The error to extract message from
 * @param includeStack - Whether to include stack trace (default: false)
 * @returns The error message string
 */
export function getErrorMessage(error, includeStack = false) {
    if (error instanceof Error) {
        return includeStack && error.stack ? error.stack : error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object') {
        const errorObj = error;
        if (errorObj.message) {
            return String(errorObj.message);
        }
        // Try to stringify object errors
        try {
            return JSON.stringify(error);
        }
        catch {
            return String(error);
        }
    }
    return 'Unknown error';
}
/**
 * Create a standardized error response
 */
export function createErrorResponse(error, context) {
    const message = getErrorMessage(error);
    return {
        error: context ? `${context}: ${message}` : message,
        ...(context && { context })
    };
}
/**
 * Wrap error with context information
 */
export function wrapError(error, context) {
    const message = getErrorMessage(error);
    const wrappedError = new Error(`${context}: ${message}`);
    // Preserve original stack trace if available
    if (error instanceof Error && error.stack) {
        wrappedError.stack = error.stack;
    }
    return wrappedError;
}
/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error) {
    const message = getErrorMessage(error).toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
}
/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
    const message = getErrorMessage(error).toLowerCase();
    return message.includes('network') ||
        message.includes('connection') ||
        message.includes('econnrefused') ||
        message.includes('enotfound');
}
/**
 * Format error for logging with stack trace
 */
export function formatErrorForLogging(error, context) {
    const message = getErrorMessage(error);
    const contextStr = context ? `[${context}] ` : '';
    if (error instanceof Error && error.stack) {
        return `${contextStr}${message}\nStack: ${error.stack}`;
    }
    return `${contextStr}${message}`;
}
/**
 * Create a safe error object for JSON serialization
 */
export function serializeError(error) {
    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
            stack: error.stack,
            code: error.code
        };
    }
    return {
        message: getErrorMessage(error)
    };
}
/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw wrapError(error, `Failed after ${maxRetries} attempts`);
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Normalize any thrown value to an Error object
 * Consolidates the pattern used throughout the codebase
 */
export function normalizeError(error) {
    if (error instanceof Error) {
        return error;
    }
    if (typeof error === 'string') {
        return new Error(error);
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return new Error(String(error.message));
    }
    return new Error(String(error));
}
//# sourceMappingURL=error-utils.js.map