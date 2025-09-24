/**
 * Timeout Constants
 *
 * Centralized timeout values to replace hardcoded values throughout the application
 */
/**
 * WebSocket and IDE Integration timeouts
 */
export declare const IDE_TIMEOUTS: {
    /** Client connection timeout (1 minute) */
    readonly CLIENT_TIMEOUT: 60000;
    /** Heartbeat check interval (30 seconds) */
    readonly HEARTBEAT_INTERVAL: 30000;
    /** VS Code connection timeout (10 seconds) */
    readonly VSCODE_CONNECTION_TIMEOUT: 10000;
    /** Request timeout (30 seconds) */
    readonly REQUEST_TIMEOUT: 30000;
};
/**
 * General application timeouts
 */
export declare const APP_TIMEOUTS: {
    /** Short operations (5 seconds) */
    readonly SHORT: 5000;
    /** Medium operations (30 seconds) */
    readonly MEDIUM: 30000;
    /** Long operations (2 minutes) */
    readonly LONG: 120000;
    /** Very long operations (5 minutes) */
    readonly VERY_LONG: 300000;
};
/**
 * Cache and memory management timeouts
 */
export declare const CACHE_TIMEOUTS: {
    /** Default cache TTL (5 minutes) */
    readonly DEFAULT_TTL: 300000;
    /** File cache TTL (10 minutes) */
    readonly FILE_CACHE_TTL: 600000;
    /** AI response cache TTL (1 hour) */
    readonly AI_CACHE_TTL: 3600000;
    /** Memory warning cooldown (5 minutes) */
    readonly WARNING_COOLDOWN: 300000;
    /** Memory cleanup interval (1 minute) */
    readonly CLEANUP_INTERVAL: 60000;
};
/**
 * Tool and execution timeouts
 */
export declare const EXECUTION_TIMEOUTS: {
    /** Default command execution (30 seconds) */
    readonly DEFAULT_COMMAND: 30000;
    /** Git operations (1 minute) */
    readonly GIT_OPERATION: 60000;
    /** Test execution (2 minutes) */
    readonly TEST_EXECUTION: 120000;
    /** Build operations (5 minutes) */
    readonly BUILD_OPERATION: 300000;
};
/**
 * Performance monitoring timeouts
 */
export declare const MONITORING_TIMEOUTS: {
    /** Performance check interval (1 minute) */
    readonly PERFORMANCE_CHECK: 60000;
    /** Metrics collection interval (30 seconds) */
    readonly METRICS_INTERVAL: 30000;
    /** Health check timeout (10 seconds) */
    readonly HEALTH_CHECK: 10000;
};
/**
 * Get timeout value safely with fallback
 */
export declare function getTimeout(timeouts: Record<string, number>, key: string, fallback?: number): number;
