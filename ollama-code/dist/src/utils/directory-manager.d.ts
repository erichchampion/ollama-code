/**
 * Directory Management Utility
 *
 * Provides centralized directory creation and management functionality
 * to eliminate duplicate directory initialization logic across providers.
 */
export interface DirectoryStructure {
    [key: string]: string | DirectoryStructure;
}
export declare class DirectoryManager {
    /**
     * Ensure multiple directories exist, creating them if necessary
     */
    static ensureDirectories(...paths: string[]): Promise<void>;
    /**
     * Create a directory structure from a nested object definition
     */
    static createStructure(basePath: string, structure: DirectoryStructure): Promise<void>;
    /**
     * Ensure workspace directories for AI providers
     */
    static ensureWorkspace(workspaceDir: string, subdirs: string[]): Promise<void>;
    /**
     * Clean up empty directories in a path
     */
    static cleanupEmptyDirectories(basePath: string): Promise<void>;
    /**
     * Check if directory exists and is writable
     */
    static isDirectoryAccessible(dirPath: string): Promise<boolean>;
    /**
     * Get directory size in bytes
     */
    static getDirectorySize(dirPath: string): Promise<number>;
}
