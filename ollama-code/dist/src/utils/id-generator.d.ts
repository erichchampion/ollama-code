/**
 * ID Generation Utilities
 *
 * Secure and reliable ID generation functions to replace
 * unsafe Math.random() based implementations.
 */
/**
 * Generate a cryptographically secure random ID
 */
export declare function generateSecureId(prefix?: string, length?: number): string;
/**
 * Generate an operation ID for streaming operations
 */
export declare function generateOperationId(): string;
/**
 * Generate a session ID
 */
export declare function generateSessionId(): string;
/**
 * Generate a unique task ID
 */
export declare function generateTaskId(): string;
