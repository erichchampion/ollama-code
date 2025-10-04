/**
 * Index Optimization System
 *
 * Phase 5: Cache and Index Preloading
 * Optimizes file system and module indexes for faster lookup and loading
 */
/**
 * Index entry for optimized lookups
 */
export interface IndexEntry {
    path: string;
    type: 'file' | 'directory' | 'module';
    lastModified: number;
    size?: number;
    dependencies?: string[];
    priority: 'critical' | 'high' | 'normal' | 'lazy';
}
/**
 * Index optimization configuration
 */
export interface IndexOptimizationConfig {
    maxCacheSize: number;
    enablePredictiveIndexing: boolean;
    indexUpdateInterval: number;
    memoryBudget: number;
}
/**
 * Index optimizer for file system and module lookups
 */
export declare class IndexOptimizer {
    private fileIndex;
    private moduleIndex;
    private accessPatterns;
    private config;
    private indexUpdateTimer?;
    constructor(config?: Partial<IndexOptimizationConfig>);
    /**
     * Initialize the index optimizer
     */
    initialize(): Promise<void>;
    /**
     * Build file system index for common paths
     */
    private buildFileSystemIndex;
    /**
     * Build module dependency index
     */
    private buildModuleIndex;
    /**
     * Get optimized file lookup
     */
    getOptimizedPath(path: string): Promise<string | null>;
    /**
     * Get optimized module resolution
     */
    getOptimizedModule(modulePath: string): Promise<IndexEntry | null>;
    /**
     * Preload indexes based on access patterns
     */
    preloadIndexes(): Promise<void>;
    /**
     * Clear old index entries to manage memory
     */
    pruneIndexes(): void;
    /**
     * Get index statistics
     */
    getStats(): {
        files: number;
        modules: number;
        memory: number;
    };
    /**
     * Cleanup resources
     */
    dispose(): void;
    private getPathStats;
    private analyzeDependencies;
    private getPathPriority;
    private getModulePriority;
    private recordAccess;
    private startPeriodicUpdates;
}
export declare const indexOptimizer: IndexOptimizer;
