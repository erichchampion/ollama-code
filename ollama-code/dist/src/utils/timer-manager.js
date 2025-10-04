/**
 * Timer Management Utilities
 *
 * Provides centralized timer management to prevent memory leaks and ensure
 * proper cleanup of setTimeout/setInterval operations.
 */
/**
 * Timer Manager for centralized timer lifecycle management
 */
export class TimerManager {
    timers = new Map();
    nextId = 1;
    /**
     * Create a managed timeout
     */
    setTimeout(callback, delay, config = {}) {
        const id = config.id || this.generateId();
        const timerId = setTimeout(() => {
            callback();
            if (config.autoCleanup !== false) {
                this.clearTimer(id);
            }
        }, delay);
        this.timers.set(id, {
            id,
            type: 'timeout',
            timerId,
            createdAt: new Date(),
            config
        });
        return id;
    }
    /**
     * Create a managed interval
     */
    setInterval(callback, interval, config = {}) {
        const id = config.id || this.generateId();
        const timerId = setInterval(callback, interval);
        this.timers.set(id, {
            id,
            type: 'interval',
            timerId,
            createdAt: new Date(),
            config
        });
        return id;
    }
    /**
     * Clear a specific timer
     */
    clearTimer(id) {
        const timer = this.timers.get(id);
        if (!timer)
            return false;
        if (timer.type === 'timeout') {
            clearTimeout(timer.timerId);
        }
        else {
            clearInterval(timer.timerId);
        }
        timer.config.onCancel?.();
        this.timers.delete(id);
        return true;
    }
    /**
     * Clear all timers
     */
    clearAll() {
        for (const [id] of this.timers) {
            this.clearTimer(id);
        }
    }
    /**
     * Get active timer count
     */
    getActiveCount() {
        return this.timers.size;
    }
    /**
     * Get timer information for debugging
     */
    getTimerInfo() {
        const now = Date.now();
        return Array.from(this.timers.values()).map(timer => ({
            id: timer.id,
            type: timer.type,
            age: now - timer.createdAt.getTime(),
            hasConfig: Object.keys(timer.config).length > 0
        }));
    }
    /**
     * Cleanup old timers (for debugging memory leaks)
     */
    cleanupOldTimers(maxAgeMs = 5 * 60 * 1000) {
        const cutoff = Date.now() - maxAgeMs;
        for (const [id, timer] of this.timers) {
            if (timer.createdAt.getTime() < cutoff) {
                console.warn(`Cleaning up old timer: ${id} (${timer.type})`);
                this.clearTimer(id);
            }
        }
    }
    generateId() {
        return `timer_${this.nextId++}_${Date.now()}`;
    }
}
/**
 * Global timer manager instance
 */
export const globalTimerManager = new TimerManager();
/**
 * Convenience functions using global timer manager
 */
export const managedSetTimeout = (callback, delay, config) => globalTimerManager.setTimeout(callback, delay, config);
export const managedSetInterval = (callback, interval, config) => globalTimerManager.setInterval(callback, interval, config);
export const clearManagedTimer = (id) => globalTimerManager.clearTimer(id);
/**
 * Promise-based timeout with automatic cleanup
 */
export function delay(ms) {
    return new Promise((resolve) => {
        managedSetTimeout(resolve, ms, { autoCleanup: true });
    });
}
/**
 * Cancellable timeout using AbortController
 */
export function cancellableTimeout(callback, delay, abortController) {
    const timerId = managedSetTimeout(callback, delay, {
        onCancel: () => {
            abortController?.abort();
        }
    });
    // Cancel timer if abort signal is triggered
    abortController?.signal.addEventListener('abort', () => {
        clearManagedTimer(timerId);
    });
    return timerId;
}
export class DisposableBase {
    timerManager = new TimerManager();
    setTimeout(callback, delay, config) {
        return this.timerManager.setTimeout(callback, delay, config);
    }
    setInterval(callback, interval, config) {
        return this.timerManager.setInterval(callback, interval, config);
    }
    clearTimer(id) {
        return this.timerManager.clearTimer(id);
    }
    dispose() {
        this.timerManager.clearAll();
    }
}
//# sourceMappingURL=timer-manager.js.map