/**
 * Error Handling Utilities
 *
 * Centralized error handling functions to replace duplicate error patterns
 */
/**
 * Extract error message safely from unknown error type
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Create a standardized error response
 */
export declare function createErrorResponse(error: unknown, context?: string): {
    error: string;
    context?: string;
};
/**
 * Wrap error with context information
 */
export declare function wrapError(error: unknown, context: string): Error;
/**
 * Check if error is a timeout error
 */
export declare function isTimeoutError(error: unknown): boolean;
/**
 * Check if error is a network error
 */
export declare function isNetworkError(error: unknown): boolean;
/**
 * Format error for logging with stack trace
 */
export declare function formatErrorForLogging(error: unknown, context?: string): string;
/**
 * Create a safe error object for JSON serialization
 */
export declare function serializeError(error: unknown): {
    message: string;
    name?: string;
    stack?: string;
    code?: string | number;
};
/**
 * Retry operation with exponential backoff
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
