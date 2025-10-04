/**
 * Timeout Promise Utilities
 *
 * Centralized timeout management for promises to replace duplicated
 * timeout patterns throughout the application.
 */
export interface TimeoutConfig {
    /** Timeout duration in milliseconds */
    timeoutMs: number;
    /** Custom timeout error message */
    message?: string;
    /** Custom error class to throw */
    errorClass?: new (message: string) => Error;
    /** Cleanup function to call on timeout */
    onTimeout?: () => void | Promise<void>;
}
export interface CancellablePromise<T> {
    promise: Promise<T>;
    cancel: () => void;
    isResolved: () => boolean;
    isCancelled: () => boolean;
}
/**
 * Add timeout to any promise
 */
export declare function withTimeout<T>(promise: Promise<T>, config: TimeoutConfig | number): Promise<T>;
/**
 * Create a cancellable promise with timeout
 */
export declare function cancellablePromise<T>(executor: (resolve: (value: T) => void, reject: (error: Error) => void, signal: AbortSignal) => void, config?: TimeoutConfig): CancellablePromise<T>;
/**
 * Promise with retry and timeout
 */
export declare function withRetryAndTimeout<T>(operation: () => Promise<T>, maxAttempts: number, timeoutMs: number, retryDelayMs?: number): Promise<T>;
/**
 * Simple delay utility
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Debounce function calls
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number): T & {
    cancel: () => void;
};
/**
 * Throttle function calls
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, intervalMs: number): T & {
    cancel: () => void;
};
/**
 * Race multiple promises with timeout
 */
export declare function raceWithTimeout<T>(promises: Promise<T>[], timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * All promises with timeout
 */
export declare function allWithTimeout<T>(promises: Promise<T>[], timeoutMs: number, timeoutMessage?: string): Promise<T[]>;
/**
 * Promise pool with concurrency limit and timeout
 */
export declare function promisePool<T, R>(items: T[], processor: (item: T) => Promise<R>, concurrency?: number, itemTimeoutMs?: number): Promise<R[]>;
/**
 * Common timeout configurations
 */
export declare const TIMEOUT_CONFIGS: {
    /** Short operations (file I/O, local operations) */
    readonly SHORT: {
        readonly timeoutMs: 5000;
    };
    /** Medium operations (network requests, API calls) */
    readonly MEDIUM: {
        readonly timeoutMs: 30000;
    };
    /** Long operations (analysis, large file processing) */
    readonly LONG: {
        readonly timeoutMs: 120000;
    };
    /** Very long operations (compilation, heavy analysis) */
    readonly VERY_LONG: {
        readonly timeoutMs: 300000;
    };
};
