/**
 * Working Directory Provider
 *
 * Provides centralized working directory management with dependency injection
 * to eliminate hardcoded process.cwd() references throughout the codebase.
 */
export interface WorkingDirectoryConfig {
    defaultDirectory?: string;
    allowOverride?: boolean;
}
export declare class WorkingDirectoryProvider {
    private static instance;
    private currentDirectory;
    private readonly config;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(config?: WorkingDirectoryConfig): WorkingDirectoryProvider;
    /**
     * Get the current working directory
     */
    getCurrentDirectory(): string;
    /**
     * Set the working directory (if allowed)
     */
    setCurrentDirectory(directory: string): void;
    /**
     * Temporarily use a different directory for a specific operation
     */
    withDirectory<T>(directory: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Get project-relative path
     */
    getProjectPath(...segments: string[]): string;
    /**
     * Check if directory exists and is accessible
     */
    validateDirectory(directory?: string): Promise<boolean>;
    /**
     * Reset to default directory
     */
    resetToDefault(): void;
    /**
     * Get configuration
     */
    getConfig(): Readonly<Required<WorkingDirectoryConfig>>;
    /**
     * Create a scoped provider for a specific directory
     */
    createScoped(directory: string): ScopedWorkingDirectoryProvider;
}
/**
 * Scoped working directory provider for component-specific directories
 */
export declare class ScopedWorkingDirectoryProvider {
    private readonly scopedDirectory;
    private readonly parentProvider;
    constructor(scopedDirectory: string, parentProvider: WorkingDirectoryProvider);
    getCurrentDirectory(): string;
    getProjectPath(...segments: string[]): string;
    validateDirectory(): Promise<boolean>;
    getParentProvider(): WorkingDirectoryProvider;
}
/**
 * Get the global working directory provider
 */
export declare function getWorkingDirectoryProvider(config?: WorkingDirectoryConfig): WorkingDirectoryProvider;
/**
 * Reset the global provider (useful for testing)
 */
export declare function resetWorkingDirectoryProvider(): void;
/**
 * Convenience function to get current working directory
 */
export declare function getCurrentWorkingDirectory(): string;
/**
 * Convenience function to get project path
 */
export declare function getProjectPath(...segments: string[]): string;
/**
 * Convenience function for directory-scoped operations
 */
export declare function withWorkingDirectory<T>(directory: string, operation: () => Promise<T>): Promise<T>;
