/**
 * Reusable Error Handling Utilities
 *
 * Centralized error handling patterns to reduce duplication and improve
 * consistency across the application.
 */
export interface ErrorContext {
    operation: string;
    component?: string;
    metadata?: Record<string, any>;
}
export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors?: (error: unknown) => boolean;
}
/**
 * Safe async operation wrapper with fallback value
 */
export declare function safeAsync<T>(operation: () => Promise<T>, fallback: T, context: ErrorContext): Promise<T>;
/**
 * Safe sync operation wrapper with fallback value
 */
export declare function safeSync<T>(operation: () => T, fallback: T, context: ErrorContext): T;
/**
 * Async operation with retry logic
 */
export declare function withRetry<T>(operation: () => Promise<T>, config: RetryConfig, context: ErrorContext): Promise<T>;
/**
 * Graceful degradation wrapper
 */
export declare function withGracefulDegradation<T, F>(primaryOperation: () => Promise<T>, fallbackOperation: () => Promise<F>, context: ErrorContext): Promise<T | F>;
/**
 * Resource cleanup wrapper
 */
export declare function withCleanup<T>(operation: () => Promise<T>, cleanup: () => Promise<void> | void, context: ErrorContext): Promise<T>;
/**
 * Error boundary for critical operations
 */
export declare function criticalOperation<T>(operation: () => Promise<T>, context: ErrorContext, onError?: (error: unknown) => void): Promise<T>;
/**
 * Validation error helper
 */
export declare function createValidationError(field: string, value: unknown, expectedType?: string): Error;
/**
 * Network error helper
 */
export declare function createNetworkError(operation: string, originalError: unknown, url?: string): Error;
/**
 * File operation error helper
 */
export declare function createFileError(operation: string, filePath: string, originalError: unknown): Error;
/**
 * Default retry configurations
 */
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
export declare const NETWORK_RETRY_CONFIG: RetryConfig;
export declare const FILE_RETRY_CONFIG: RetryConfig;
