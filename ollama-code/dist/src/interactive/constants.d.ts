/**
 * Constants for Interactive Mode
 *
 * Centralizes magic numbers and commonly used values to improve
 * code maintainability and readability.
 */
export declare const CONSTANTS: {
    readonly MAX_FILE_COUNT_ESTIMATE: 1000;
    readonly MAX_FILES_TO_ANALYZE: 5000;
    readonly MAX_FILE_SIZE_BYTES: number;
    readonly DEPENDENCY_CHECK_INTERVAL_MS: 100;
    readonly HEALTH_CHECK_INTERVAL_MS: 30000;
    readonly MONITORING_INTERVAL_MS: 5000;
    readonly CLEANUP_DELAY_MS: 500;
    readonly SLOW_COMPONENT_THRESHOLD_MS: 5000;
    readonly FAST_INITIALIZATION_THRESHOLD_MS: 3000;
    readonly ACCEPTABLE_STARTUP_TIME_MS: 10000;
    readonly MAX_RETRY_ATTEMPTS: 5;
    readonly RETRY_BASE_DELAY_MS: 1000;
    readonly RETRY_MAX_DELAY_MS: 5000;
    readonly EXPONENTIAL_BACKOFF_FACTOR: 2;
    readonly MEMORY_WARNING_THRESHOLD_MB: 512;
    readonly MEMORY_CRITICAL_THRESHOLD_MB: 1024;
    readonly MAX_CONCURRENT_OPERATIONS: 10;
    readonly MAX_LOG_MESSAGE_LENGTH: 1000;
    readonly MAX_ERROR_CONTEXT_LINES: 5;
    readonly DEFAULT_CONSOLE_WIDTH: 80;
    readonly DEFAULT_PORT: 3000;
    readonly MAX_REQUEST_SIZE_MB: 10;
    readonly CONNECTION_TIMEOUT_MS: 30000;
    readonly SUPPORTED_CODE_EXTENSIONS: readonly [".ts", ".js", ".tsx", ".jsx", ".json", ".md"];
    readonly IGNORED_DIRECTORIES: readonly ["node_modules", ".git", "dist", "build", ".next"];
    readonly MS_TO_SECONDS: 1000;
    readonly BYTES_TO_MB: number;
    readonly MINUTES_TO_MS: number;
    readonly DEFAULT_BUFFER_SIZE: number;
    readonly MAX_CONTEXT_SIZE: 100000;
    readonly MAX_CONVERSATION_HISTORY: 50;
    readonly PROGRESS_UPDATE_INTERVAL_MS: 250;
    readonly STATUS_REFRESH_INTERVAL_MS: 1000;
    readonly SPINNER_UPDATE_INTERVAL_MS: 100;
    readonly MIN_TIMEOUT_MS: 100;
    readonly MAX_TIMEOUT_MS: 300000;
    readonly MIN_RETRY_COUNT: 0;
    readonly MAX_RETRY_COUNT: 10;
};
/**
 * HTTP Status Codes
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
/**
 * Exit Codes
 */
export declare const EXIT_CODES: {
    readonly SUCCESS: 0;
    readonly GENERAL_ERROR: 1;
    readonly MISUSE: 2;
    readonly CANNOT_EXECUTE: 126;
    readonly COMMAND_NOT_FOUND: 127;
    readonly INVALID_EXIT_ARGUMENT: 128;
    readonly SIGINT: 130;
};
/**
 * Log Levels
 */
export declare const LOG_LEVELS: {
    readonly ERROR: 0;
    readonly WARN: 1;
    readonly INFO: 2;
    readonly DEBUG: 3;
    readonly TRACE: 4;
};
/**
 * Component priorities for initialization order
 */
export declare const COMPONENT_PRIORITIES: {
    readonly CRITICAL: 0;
    readonly HIGH: 1;
    readonly MEDIUM: 2;
    readonly LOW: 3;
    readonly BACKGROUND: 4;
};
/**
 * Memory usage categories
 */
export declare const MEMORY_CATEGORIES: {
    readonly MINIMAL: "minimal";
    readonly LIGHT: "light";
    readonly MODERATE: "moderate";
    readonly HEAVY: "heavy";
    readonly EXCESSIVE: "excessive";
};
/**
 * Performance categories
 */
export declare const PERFORMANCE_CATEGORIES: {
    readonly EXCELLENT: "excellent";
    readonly GOOD: "good";
    readonly ACCEPTABLE: "acceptable";
    readonly SLOW: "slow";
    readonly UNACCEPTABLE: "unacceptable";
};
/**
 * Service name prefixes
 */
export declare const SERVICE_PREFIXES: {
    readonly COMPONENT: "component:";
    readonly SHARED: "shared:";
    readonly SINGLETON: "singleton:";
    readonly FACTORY: "factory:";
};
/**
 * Service names for shared services
 */
export declare const SHARED_SERVICES: {
    readonly PROJECT_CONTEXT: "shared:projectContext";
    readonly AI_CLIENT: "shared:aiClient";
    readonly ENHANCED_CLIENT: "shared:enhancedClient";
};
/**
 * Get memory category based on usage
 */
export declare function getMemoryCategory(memoryMB: number): string;
/**
 * Get performance category based on duration
 */
export declare function getPerformanceCategory(durationMs: number): string;
/**
 * Validate timeout value
 */
export declare function validateTimeout(timeoutMs: number): number;
/**
 * Validate retry count
 */
export declare function validateRetryCount(retries: number): number;
/**
 * Convert bytes to human readable format
 */
export declare function formatBytes(bytes: number): string;
/**
 * Convert milliseconds to human readable format
 */
export declare function formatDuration(ms: number): string;
