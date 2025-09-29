/**
 * Service Registry for Dependency Injection
 *
 * Provides centralized singleton management for components to prevent
 * circular dependencies and duplicate initialization.
 */
export type ServiceFactory<T> = () => Promise<T>;
export interface ServiceOptions {
    timeout?: number;
    retries?: number;
    description?: string;
}
export interface ServiceMetrics {
    name: string;
    initTime: number;
    retryCount: number;
    lastAccess: Date;
    accessCount: number;
    state: ServiceState;
}
export declare enum ServiceState {
    NOT_INITIALIZED = "not_initialized",
    INITIALIZING = "initializing",
    READY = "ready",
    FAILED = "failed"
}
export declare class ServiceRegistry {
    private static instance;
    private services;
    private initPromises;
    private serviceOptions;
    private metrics;
    private initializationOrder;
    private cleanupLocks;
    private disposed;
    private constructor();
    static getInstance(): ServiceRegistry;
    /**
     * Get or create a service with singleton behavior
     */
    getService<T>(name: string, factory: ServiceFactory<T>, options?: ServiceOptions): Promise<T>;
    /**
     * Initialize service with timeout and retry logic
     */
    private initializeServiceWithRetry;
    /**
     * Check if a service is available (cached)
     */
    hasService(name: string): boolean;
    /**
     * Get service state without initializing
     */
    getServiceState(name: string): ServiceState;
    /**
     * Get service metrics
     */
    getServiceMetrics(name: string): ServiceMetrics | undefined;
    /**
     * Get all service metrics
     */
    getAllMetrics(): ServiceMetrics[];
    /**
     * Get initialization order for debugging
     */
    getInitializationOrder(): string[];
    /**
     * Clear a specific service (useful for testing)
     */
    clearService(name: string): Promise<void>;
    /**
     * Perform the actual service cleanup
     */
    private performServiceCleanup;
    /**
     * Clear all services (useful for testing)
     */
    clearAll(): Promise<void>;
    /**
     * Get summary statistics
     */
    getSummary(): {
        totalServices: number;
        readyServices: number;
        failedServices: number;
        initializingServices: number;
        averageInitTime: number;
        totalInitTime: number;
    };
    /**
     * Generate diagnostic report
     */
    getDiagnosticReport(): string;
    /**
     * Dispose of the registry (cleanup for testing)
     */
    dispose(): Promise<void>;
}
/**
 * Convenience function to get the global service registry
 */
export declare function getServiceRegistry(): ServiceRegistry;
