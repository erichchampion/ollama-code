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
/**
 * Generate a client ID for WebSocket connections (replaces duplicate implementations)
 */
export declare function generateClientId(): string;
/**
 * Generate a telemetry client ID (anonymous UUID)
 */
export declare function generateTelemetryClientId(): string;
/**
 * Generate a request ID for tracking requests
 */
export declare function generateRequestId(): string;
/**
 * VCS-specific ID generators (replaces deprecated substr() calls)
 */
/**
 * Generate a review ID for pull request reviews
 */
export declare function generateReviewId(): string;
/**
 * Generate a finding ID for review findings
 */
export declare function generateFindingId(): string;
/**
 * Generate a regression analysis ID
 */
export declare function generateRegressionId(): string;
/**
 * Generate a quality snapshot ID
 */
export declare function generateSnapshotId(): string;
