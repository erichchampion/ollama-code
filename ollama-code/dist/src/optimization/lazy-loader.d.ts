/**
 * Lazy Loading System
 *
 * Optimizes startup time by deferring expensive initialization
 * until actually needed by specific commands
 */
export declare class LazyLoader {
    private initializers;
    private initialized;
    /**
     * Register a lazy initializer
     */
    register<T>(key: string, initializer: () => Promise<T>): void;
    /**
     * Get or initialize a component
     */
    get<T>(key: string): Promise<T>;
    /**
     * Check if a component is loaded
     */
    isLoaded(key: string): boolean;
    /**
     * Preload specific components
     */
    preload(keys: string[]): Promise<void>;
    /**
     * Get loading status
     */
    getStatus(): {
        loaded: string[];
        available: string[];
    };
    /**
     * Dispose of the lazy loader and clean up resources
     */
    dispose(): Promise<void>;
}
/**
 * Command categorization for startup optimization
 */
export declare const CommandRequirements: {
    BASIC: string[];
    AI_ONLY: string[];
    PROJECT_AWARE: string[];
    FULL_INIT: string[];
};
/**
 * Determine what needs to be initialized for a command
 */
export declare function getCommandRequirements(commandName: string): {
    needsAI: boolean;
    needsProject: boolean;
    needsTools: boolean;
};
