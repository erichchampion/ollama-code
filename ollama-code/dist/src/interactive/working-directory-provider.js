/**
 * Working Directory Provider
 *
 * Provides centralized working directory management with dependency injection
 * to eliminate hardcoded process.cwd() references throughout the codebase.
 */
import { logger } from '../utils/logger.js';
export class WorkingDirectoryProvider {
    static instance;
    currentDirectory;
    config;
    constructor(config = {}) {
        this.config = {
            defaultDirectory: process.cwd(),
            allowOverride: true,
            ...config
        };
        this.currentDirectory = this.config.defaultDirectory;
        logger.debug(`WorkingDirectoryProvider initialized with: ${this.currentDirectory}`);
    }
    /**
     * Get the singleton instance
     */
    static getInstance(config) {
        if (!WorkingDirectoryProvider.instance) {
            WorkingDirectoryProvider.instance = new WorkingDirectoryProvider(config);
        }
        return WorkingDirectoryProvider.instance;
    }
    /**
     * Get the current working directory
     */
    getCurrentDirectory() {
        return this.currentDirectory;
    }
    /**
     * Set the working directory (if allowed)
     */
    setCurrentDirectory(directory) {
        if (!this.config.allowOverride) {
            throw new Error('Working directory override is not allowed');
        }
        const previousDirectory = this.currentDirectory;
        this.currentDirectory = directory;
        logger.debug(`Working directory changed from ${previousDirectory} to ${directory}`);
    }
    /**
     * Temporarily use a different directory for a specific operation
     */
    async withDirectory(directory, operation) {
        const originalDirectory = this.currentDirectory;
        try {
            this.setCurrentDirectory(directory);
            return await operation();
        }
        finally {
            this.setCurrentDirectory(originalDirectory);
        }
    }
    /**
     * Get project-relative path
     */
    getProjectPath(...segments) {
        return require('path').join(this.currentDirectory, ...segments);
    }
    /**
     * Check if directory exists and is accessible
     */
    async validateDirectory(directory) {
        const targetDir = directory || this.currentDirectory;
        try {
            const fs = await import('fs/promises');
            const stat = await fs.stat(targetDir);
            return stat.isDirectory();
        }
        catch (error) {
            logger.warn(`Directory validation failed for ${targetDir}:`, error);
            return false;
        }
    }
    /**
     * Reset to default directory
     */
    resetToDefault() {
        this.currentDirectory = this.config.defaultDirectory;
        logger.debug(`Reset to default directory: ${this.currentDirectory}`);
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Create a scoped provider for a specific directory
     */
    createScoped(directory) {
        return new ScopedWorkingDirectoryProvider(directory, this);
    }
}
/**
 * Scoped working directory provider for component-specific directories
 */
export class ScopedWorkingDirectoryProvider {
    scopedDirectory;
    parentProvider;
    constructor(scopedDirectory, parentProvider) {
        this.scopedDirectory = scopedDirectory;
        this.parentProvider = parentProvider;
    }
    getCurrentDirectory() {
        return this.scopedDirectory;
    }
    getProjectPath(...segments) {
        return require('path').join(this.scopedDirectory, ...segments);
    }
    async validateDirectory() {
        return this.parentProvider.validateDirectory(this.scopedDirectory);
    }
    getParentProvider() {
        return this.parentProvider;
    }
}
/**
 * Global working directory provider instance
 */
let globalProvider = null;
/**
 * Get the global working directory provider
 */
export function getWorkingDirectoryProvider(config) {
    if (!globalProvider) {
        globalProvider = WorkingDirectoryProvider.getInstance(config);
    }
    return globalProvider;
}
/**
 * Reset the global provider (useful for testing)
 */
export function resetWorkingDirectoryProvider() {
    globalProvider = null;
}
/**
 * Convenience function to get current working directory
 */
export function getCurrentWorkingDirectory() {
    return getWorkingDirectoryProvider().getCurrentDirectory();
}
/**
 * Convenience function to get project path
 */
export function getProjectPath(...segments) {
    return getWorkingDirectoryProvider().getProjectPath(...segments);
}
/**
 * Convenience function for directory-scoped operations
 */
export async function withWorkingDirectory(directory, operation) {
    return getWorkingDirectoryProvider().withDirectory(directory, operation);
}
//# sourceMappingURL=working-directory-provider.js.map