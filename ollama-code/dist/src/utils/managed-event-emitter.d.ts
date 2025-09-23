/**
 * Managed EventEmitter Base Class
 *
 * Provides automatic cleanup tracking and memory leak prevention for EventEmitter usage.
 * All AI system classes should extend this instead of EventEmitter directly.
 */
import { EventEmitter } from 'events';
export interface EventEmitterMetrics {
    totalListeners: number;
    eventTypes: string[];
    listenersByEvent: Record<string, number>;
    maxListeners: number;
    memoryLeakWarnings: number;
}
export interface ManagedEventEmitterOptions {
    maxListeners?: number;
    enableCleanupTracking?: boolean;
    enableMemoryLeakWarning?: boolean;
    memoryLeakThreshold?: number;
    autoCleanupOnDestroy?: boolean;
}
/**
 * Enhanced EventEmitter with automatic cleanup and monitoring
 */
export declare class ManagedEventEmitter extends EventEmitter {
    private static readonly instances;
    private static totalInstances;
    private readonly options;
    private readonly listenerRegistry;
    private readonly timerRegistry;
    private readonly intervalRegistry;
    private destroyed;
    private metrics;
    constructor(options?: ManagedEventEmitterOptions);
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(eventName?: string | symbol): this;
    /**
     * Safe timer creation with automatic cleanup
     */
    createTimeout(callback: () => void, delay: number): NodeJS.Timeout;
    /**
     * Safe interval creation with automatic cleanup
     */
    createInterval(callback: () => void, interval: number): NodeJS.Timeout;
    /**
     * Clear a specific timeout
     */
    clearManagedTimeout(timer: NodeJS.Timeout): void;
    /**
     * Clear a specific interval
     */
    clearManagedInterval(timer: NodeJS.Timeout): void;
    /**
     * Get current metrics
     */
    getMetrics(): EventEmitterMetrics;
    /**
     * Clean shutdown with automatic resource cleanup
     */
    destroy(): void;
    /**
     * Check if the emitter has been destroyed
     */
    isDestroyed(): boolean;
    private trackListener;
    private untrackListener;
    private clearEventListeners;
    private clearAllListeners;
    private updateMetrics;
    private setupCleanupTracking;
    private setupMemoryLeakDetection;
    /**
     * Global cleanup utility for all managed event emitters
     */
    static cleanupAll(): void;
    /**
     * Get global statistics
     */
    static getGlobalStats(): {
        totalInstances: number;
    };
}
/**
 * Utility function to create managed event emitters
 */
export declare function createManagedEmitter(options?: ManagedEventEmitterOptions): ManagedEventEmitter;
/**
 * Decorator to automatically destroy event emitters
 */
export declare function autoDestroy(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
