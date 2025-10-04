/**
 * Lazy Project Context
 *
 * A ProjectContext implementation that defers expensive operations
 * until they are actually needed, improving startup performance.
 */
import { ProjectContext, FileInfo, ProjectStructure } from '../ai/context.js';
export declare class LazyProjectContext extends ProjectContext {
    private initialized;
    private initPromise?;
    private lightweightCache;
    private structureCache?;
    constructor(projectRoot: string, maxTokens?: number);
    /**
     * Override: Lazy initialization only when needed
     */
    initialize(): Promise<void>;
    /**
     * Get files with lightweight pattern matching when possible
     */
    getFiles(pattern?: string): Promise<FileInfo[]>;
    /**
     * Get project structure with lazy loading
     */
    getStructure(): Promise<ProjectStructure>;
    /**
     * Fast file lookup by extension
     */
    findFilesByExtension(extensions: string[]): Promise<FileInfo[]>;
    /**
     * Quick project info without full analysis
     */
    getQuickInfo(): Promise<{
        root: string;
        hasPackageJson: boolean;
        hasGit: boolean;
        estimatedFileCount: number;
        primaryLanguage?: string;
    }>;
    /**
     * Ensure full initialization when needed
     */
    private ensureInitialized;
    /**
     * Perform the actual full initialization
     */
    private performInitialization;
    /**
     * Lightweight file search using glob
     */
    private getFilesLight;
    /**
     * Build minimal project structure
     */
    private buildMinimalStructure;
    /**
     * Check if a file exists quickly
     */
    private fileExists;
    /**
     * Estimate total file count without full scan
     */
    private estimateFileCount;
    /**
     * Detect primary programming language
     */
    private detectPrimaryLanguage;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        lightweightEntries: number;
        hasStructureCache: boolean;
        initialized: boolean;
    };
}
