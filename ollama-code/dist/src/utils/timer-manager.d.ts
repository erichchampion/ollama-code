/**
 * Timer Management Utilities
 *
 * Provides centralized timer management to prevent memory leaks and ensure
 * proper cleanup of setTimeout/setInterval operations.
 */
export interface TimerConfig {
    id?: string;
    autoCleanup?: boolean;
    onCancel?: () => void;
}
export interface ManagedTimer {
    id: string;
    type: 'timeout' | 'interval';
    timerId: NodeJS.Timeout;
    createdAt: Date;
    config: TimerConfig;
}
/**
 * Timer Manager for centralized timer lifecycle management
 */
export declare class TimerManager {
    private timers;
    private nextId;
    /**
     * Create a managed timeout
     */
    setTimeout(callback: () => void, delay: number, config?: TimerConfig): string;
    /**
     * Create a managed interval
     */
    setInterval(callback: () => void, interval: number, config?: TimerConfig): string;
    /**
     * Clear a specific timer
     */
    clearTimer(id: string): boolean;
    /**
     * Clear all timers
     */
    clearAll(): void;
    /**
     * Get active timer count
     */
    getActiveCount(): number;
    /**
     * Get timer information for debugging
     */
    getTimerInfo(): Array<{
        id: string;
        type: string;
        age: number;
        hasConfig: boolean;
    }>;
    /**
     * Cleanup old timers (for debugging memory leaks)
     */
    cleanupOldTimers(maxAgeMs?: number): void;
    private generateId;
}
/**
 * Global timer manager instance
 */
export declare const globalTimerManager: TimerManager;
/**
 * Convenience functions using global timer manager
 */
export declare const managedSetTimeout: (callback: () => void, delay: number, config?: TimerConfig) => string;
export declare const managedSetInterval: (callback: () => void, interval: number, config?: TimerConfig) => string;
export declare const clearManagedTimer: (id: string) => boolean;
/**
 * Promise-based timeout with automatic cleanup
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Cancellable timeout using AbortController
 */
export declare function cancellableTimeout(callback: () => void, delay: number, abortController?: AbortController): string;
/**
 * Resource cleanup mixin for classes
 */
export interface Disposable {
    dispose(): void;
}
export declare class DisposableBase implements Disposable {
    private timerManager;
    protected setTimeout(callback: () => void, delay: number, config?: TimerConfig): string;
    protected setInterval(callback: () => void, interval: number, config?: TimerConfig): string;
    protected clearTimer(id: string): boolean;
    dispose(): void;
}
