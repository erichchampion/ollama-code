/**
 * Managed EventEmitter Base Class
 *
 * Provides automatic cleanup tracking and memory leak prevention for EventEmitter usage.
 * All AI system classes should extend this instead of EventEmitter directly.
 */
import { EventEmitter } from 'events';
/**
 * Enhanced EventEmitter with automatic cleanup and monitoring
 */
export class ManagedEventEmitter extends EventEmitter {
    static instances = new WeakSet();
    static totalInstances = 0;
    options;
    listenerRegistry = new Map();
    timerRegistry = new Set();
    intervalRegistry = new Set();
    destroyed = false;
    metrics;
    constructor(options = {}) {
        super();
        this.options = {
            maxListeners: options.maxListeners || 100,
            enableCleanupTracking: options.enableCleanupTracking !== false,
            enableMemoryLeakWarning: options.enableMemoryLeakWarning !== false,
            memoryLeakThreshold: options.memoryLeakThreshold || 50,
            autoCleanupOnDestroy: options.autoCleanupOnDestroy !== false
        };
        this.metrics = {
            totalListeners: 0,
            eventTypes: [],
            listenersByEvent: {},
            maxListeners: this.options.maxListeners,
            memoryLeakWarnings: 0
        };
        this.setMaxListeners(this.options.maxListeners);
        // Register this instance for global cleanup tracking
        ManagedEventEmitter.instances.add(this);
        ManagedEventEmitter.totalInstances++;
        // Set up automatic cleanup detection
        if (this.options.enableCleanupTracking) {
            this.setupCleanupTracking();
        }
        // Monitor for memory leaks
        if (this.options.enableMemoryLeakWarning) {
            this.setupMemoryLeakDetection();
        }
    }
    // Override EventEmitter methods to track listeners
    on(eventName, listener) {
        this.trackListener(eventName.toString(), listener);
        return super.on(eventName, listener);
    }
    once(eventName, listener) {
        this.trackListener(eventName.toString(), listener);
        return super.once(eventName, listener);
    }
    addListener(eventName, listener) {
        this.trackListener(eventName.toString(), listener);
        return super.addListener(eventName, listener);
    }
    removeListener(eventName, listener) {
        this.untrackListener(eventName.toString(), listener);
        return super.removeListener(eventName, listener);
    }
    off(eventName, listener) {
        this.untrackListener(eventName.toString(), listener);
        return super.off(eventName, listener);
    }
    removeAllListeners(eventName) {
        if (eventName) {
            this.clearEventListeners(eventName.toString());
        }
        else {
            this.clearAllListeners();
        }
        return super.removeAllListeners(eventName);
    }
    /**
     * Safe timer creation with automatic cleanup
     */
    createTimeout(callback, delay) {
        if (this.destroyed) {
            throw new Error('Cannot create timeout on destroyed EventEmitter');
        }
        const timer = setTimeout(() => {
            this.timerRegistry.delete(timer);
            callback();
        }, delay);
        this.timerRegistry.add(timer);
        return timer;
    }
    /**
     * Safe interval creation with automatic cleanup
     */
    createInterval(callback, interval) {
        if (this.destroyed) {
            throw new Error('Cannot create interval on destroyed EventEmitter');
        }
        const timer = setInterval(callback, interval);
        this.intervalRegistry.add(timer);
        return timer;
    }
    /**
     * Clear a specific timeout
     */
    clearManagedTimeout(timer) {
        clearTimeout(timer);
        this.timerRegistry.delete(timer);
    }
    /**
     * Clear a specific interval
     */
    clearManagedInterval(timer) {
        clearInterval(timer);
        this.intervalRegistry.delete(timer);
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    /**
     * Clean shutdown with automatic resource cleanup
     */
    destroy() {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        // Clean up all timers
        for (const timer of this.timerRegistry) {
            clearTimeout(timer);
        }
        this.timerRegistry.clear();
        for (const timer of this.intervalRegistry) {
            clearInterval(timer);
        }
        this.intervalRegistry.clear();
        // Remove all listeners if auto-cleanup is enabled
        if (this.options.autoCleanupOnDestroy) {
            this.removeAllListeners();
        }
        // Clear tracking
        this.listenerRegistry.clear();
        // Emit destruction event
        this.emit('destroyed');
        // Remove from global tracking
        ManagedEventEmitter.totalInstances--;
    }
    /**
     * Check if the emitter has been destroyed
     */
    isDestroyed() {
        return this.destroyed;
    }
    trackListener(eventName, listener) {
        if (!this.listenerRegistry.has(eventName)) {
            this.listenerRegistry.set(eventName, new Set());
        }
        this.listenerRegistry.get(eventName).add(listener);
        this.updateMetrics();
        // Check for potential memory leaks
        if (this.options.enableMemoryLeakWarning) {
            const count = this.listenerRegistry.get(eventName).size;
            if (count > this.options.memoryLeakThreshold) {
                this.metrics.memoryLeakWarnings++;
                this.emit('memoryLeakWarning', eventName, count);
                console.warn(`[ManagedEventEmitter] Potential memory leak detected: ${count} listeners for event '${eventName}'`);
            }
        }
    }
    untrackListener(eventName, listener) {
        const listeners = this.listenerRegistry.get(eventName);
        if (listeners) {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.listenerRegistry.delete(eventName);
            }
        }
        this.updateMetrics();
    }
    clearEventListeners(eventName) {
        this.listenerRegistry.delete(eventName);
        this.updateMetrics();
    }
    clearAllListeners() {
        this.listenerRegistry.clear();
        this.updateMetrics();
    }
    updateMetrics() {
        let totalListeners = 0;
        const listenersByEvent = {};
        const eventTypes = [];
        for (const [eventName, listeners] of this.listenerRegistry) {
            const count = listeners.size;
            totalListeners += count;
            listenersByEvent[eventName] = count;
            eventTypes.push(eventName);
        }
        this.metrics = {
            totalListeners,
            eventTypes,
            listenersByEvent,
            maxListeners: this.options.maxListeners,
            memoryLeakWarnings: this.metrics.memoryLeakWarnings
        };
    }
    setupCleanupTracking() {
        // Track process exit to warn about uncleaned resources
        process.once('exit', () => {
            if (!this.destroyed && this.metrics.totalListeners > 0) {
                console.warn(`[ManagedEventEmitter] EventEmitter not properly destroyed before exit: ${this.metrics.totalListeners} listeners still attached`);
            }
        });
    }
    setupMemoryLeakDetection() {
        // Periodic memory leak check
        const checkInterval = this.createInterval(() => {
            if (this.metrics.totalListeners > this.options.memoryLeakThreshold * 2) {
                this.emit('criticalMemoryLeak', this.metrics.totalListeners);
                console.error(`[ManagedEventEmitter] Critical memory leak detected: ${this.metrics.totalListeners} total listeners`);
            }
        }, 30000); // Check every 30 seconds
        // Clean up the check when destroyed
        this.once('destroyed', () => {
            this.clearManagedInterval(checkInterval);
        });
    }
    /**
     * Global cleanup utility for all managed event emitters
     */
    static cleanupAll() {
        // Force garbage collection to identify orphaned emitters
        if (global.gc) {
            global.gc();
        }
        console.log(`[ManagedEventEmitter] Total instances tracked: ${ManagedEventEmitter.totalInstances}`);
    }
    /**
     * Get global statistics
     */
    static getGlobalStats() {
        return {
            totalInstances: ManagedEventEmitter.totalInstances
        };
    }
}
/**
 * Utility function to create managed event emitters
 */
export function createManagedEmitter(options) {
    return new ManagedEventEmitter(options);
}
/**
 * Decorator to automatically destroy event emitters
 */
export function autoDestroy(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        try {
            return originalMethod.apply(this, args);
        }
        finally {
            // If this instance has a destroy method and is a ManagedEventEmitter, call it
            if (this instanceof ManagedEventEmitter && !this.isDestroyed()) {
                this.destroy();
            }
        }
    };
    return descriptor;
}
//# sourceMappingURL=managed-event-emitter.js.map