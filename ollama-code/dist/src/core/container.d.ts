/**
 * Dependency Injection Container
 *
 * Replaces singleton pattern with a proper dependency injection system.
 * Provides better testability, modularity, and lifecycle management.
 */
export interface ServiceDefinition<T = any> {
    name: string;
    factory: (container: Container) => T | Promise<T>;
    singleton?: boolean;
    dependencies?: string[];
}
export interface ContainerConfig {
    enableLogging?: boolean;
    enableCircularDetection?: boolean;
}
export declare class Container {
    private services;
    private instances;
    private loading;
    private config;
    private resolveStack;
    constructor(config?: ContainerConfig);
    /**
     * Register a service with the container
     */
    register<T>(definition: ServiceDefinition<T>): void;
    /**
     * Register a singleton service
     */
    singleton<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void;
    /**
     * Register a transient service (new instance each time)
     */
    transient<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void;
    /**
     * Register a service instance directly
     */
    instance<T>(name: string, instance: T): void;
    /**
     * Resolve a service by name
     */
    resolve<T>(name: string): Promise<T>;
    /**
     * Resolve multiple services at once
     */
    resolveAll<T extends Record<string, any>>(names: (keyof T)[]): Promise<T>;
    /**
     * Check if a service is registered
     */
    has(name: string): boolean;
    /**
     * Get all registered service names
     */
    getServiceNames(): string[];
    /**
     * Clear all instances (useful for testing)
     */
    clear(): void;
    /**
     * Dispose of all resources
     */
    dispose(): Promise<void>;
    /**
     * Create service instance
     */
    private createInstance;
    /**
     * Create a child container with inherited services
     */
    createChild(config?: ContainerConfig): Container;
}
/**
 * Service registry for type-safe service resolution
 */
export interface ServiceRegistry {
    commandRegistry: any;
    toolRegistry: any;
    logger: any;
    aiClient: any;
    enhancedClient: any;
    memoryManager: any;
    aiCacheManager: any;
    progressManager: any;
    errorRecoveryManager: any;
    configValidator: any;
    lazyLoader: any;
    mcpServer: any;
    mcpClient: any;
    terminal: any;
    projectContext: any;
}
/**
 * Type-safe container wrapper
 */
export declare class TypedContainer {
    private container;
    constructor(container: Container);
    resolve<K extends keyof ServiceRegistry>(name: K): Promise<ServiceRegistry[K]>;
    resolveAll<T extends Record<string, any>>(names: string[]): Promise<T>;
    register<T>(definition: ServiceDefinition<T>): void;
    singleton<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void;
    transient<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void;
    instance<T>(name: string, instance: T): void;
    has(name: string): boolean;
    clear(): void;
    dispose(): Promise<void>;
    createChild(config?: ContainerConfig): TypedContainer;
}
export declare const globalContainer: TypedContainer;
