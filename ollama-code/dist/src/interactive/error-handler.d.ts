/**
 * Standardized Error Handling for Interactive Components
 *
 * Provides consistent error normalization, logging, and context management
 * across all interactive mode components.
 */
/**
 * Standard error context information
 */
export interface ErrorContext {
    component: string;
    operation: string;
    metadata?: Record<string, any>;
}
/**
 * Standard error types for interactive components
 */
export declare class ComponentError extends Error {
    readonly context: ErrorContext;
    readonly originalError?: Error;
    readonly timestamp: Date;
    constructor(message: string, context: ErrorContext, originalError?: unknown);
    /**
     * Get a formatted error message with context
     */
    getFormattedMessage(): string;
    /**
     * Get diagnostic information
     */
    getDiagnostics(): string;
}
/**
 * Normalize any error to a proper Error instance
 */
export declare function normalizeError(error: unknown): Error;
/**
 * Extract error message safely
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Enhanced error handler for interactive components
 */
export declare class InteractiveErrorHandler {
    /**
     * Handle error with standardized logging and context
     */
    static handleError(error: unknown, context: ErrorContext, options?: {
        logLevel?: 'error' | 'warn' | 'debug';
        includeStack?: boolean;
        rethrow?: boolean;
    }): ComponentError;
    /**
     * Wrap an async operation with standardized error handling
     */
    static wrapOperation<T>(operation: () => Promise<T>, context: ErrorContext, options?: {
        logLevel?: 'error' | 'warn' | 'debug';
        fallback?: () => T | Promise<T>;
        retries?: number;
        retryDelay?: number;
    }): Promise<T>;
    /**
     * Create a timeout error with context
     */
    static createTimeoutError(operation: string, timeoutMs: number, context: ErrorContext): ComponentError;
    /**
     * Create a dependency error with context
     */
    static createDependencyError(dependency: string, context: ErrorContext): ComponentError;
    /**
     * Create a validation error with context
     */
    static createValidationError(field: string, value: any, context: ErrorContext): ComponentError;
}
/**
 * Convenience function for handling errors in interactive components
 */
export declare function handleComponentError(error: unknown, component: string, operation: string, metadata?: Record<string, any>): never;
/**
 * Convenience function for wrapping operations
 */
export declare function wrapComponentOperation<T>(operation: () => Promise<T>, component: string, operationName: string, options?: {
    fallback?: () => T | Promise<T>;
    retries?: number;
    metadata?: Record<string, any>;
}): Promise<T>;
