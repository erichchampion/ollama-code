/**
 * Phase 5: Cache and Index Preloading System
 *
 * Optimizes startup performance by preloading frequently used caches and indexes
 * during the startup phase, reducing initial response latency.
 *
 * Features:
 * - Intelligent cache warming based on usage patterns
 * - Predictive preloading of commonly accessed data
 * - Index optimization for faster searches
 * - Memory-aware preloading strategies
 * - Integration with startup optimizer
 */
import { ManagedEventEmitter } from '../utils/managed-event-emitter.js';
/**
 * Cache entry metadata
 */
export interface CacheEntry {
    key: string;
    value: any;
    size: number;
    accessCount: number;
    lastAccessed: Date;
    preloaded: boolean;
    priority: 'critical' | 'high' | 'normal' | 'low';
}
/**
 * Index metadata for optimized searches
 */
export interface IndexMetadata {
    name: string;
    type: 'fulltext' | 'keyword' | 'numeric' | 'composite';
    size: number;
    entries: number;
    lastOptimized: Date;
    preloaded: boolean;
}
/**
 * Preloading strategy configuration
 */
export interface PreloadStrategy {
    enableCachePreloading: boolean;
    enableIndexPreloading: boolean;
    memoryBudget: number;
    preloadPriority: Array<'critical' | 'high' | 'normal' | 'low'>;
    maxPreloadTime: number;
    parallelPreloads: number;
    predictiveLoading: boolean;
}
/**
 * Cache preloading statistics
 */
export interface PreloadStatistics {
    cacheEntriesPreloaded: number;
    indexesPreloaded: number;
    totalPreloadTime: number;
    memoryUsed: number;
    hitRateImprovement: number;
    errors: number;
}
/**
 * Cache and Index Preloader
 */
export declare class CachePreloader extends ManagedEventEmitter {
    private strategy;
    private memoryMonitor;
    private statistics;
    private cacheRegistry;
    private indexRegistry;
    private usagePatterns;
    private preloadPromises;
    private isPreloading;
    private startTime;
    constructor(strategy?: Partial<PreloadStrategy>);
    /**
     * Start the preloading process
     */
    startPreloading(): Promise<void>;
    /**
     * Load usage patterns from disk or memory
     */
    private loadUsagePatterns;
    /**
     * Preload cache entries based on priority and usage patterns
     */
    private preloadCaches;
    /**
     * Preload a single cache entry
     */
    private preloadCache;
    /**
     * Load cache data (implementation-specific)
     */
    private loadCacheData;
    /**
     * Preload indexes for optimized searches
     */
    private preloadIndexes;
    /**
     * Preload a single index
     */
    private preloadIndex;
    /**
     * Load index data (implementation-specific)
     */
    private loadIndexData;
    /**
     * Predictive preloading based on usage patterns
     */
    private predictivePreload;
    /**
     * Register a cache for preloading
     */
    registerCache(entry: Omit<CacheEntry, 'preloaded'>): void;
    /**
     * Register an index for preloading
     */
    registerIndex(index: Omit<IndexMetadata, 'preloaded'>): void;
    /**
     * Update usage pattern for predictive loading
     */
    updateUsagePattern(key: string, accessTime: number): void;
    /**
     * Save usage patterns to disk
     */
    saveUsagePatterns(): Promise<void>;
    /**
     * Get preloading statistics
     */
    getStatistics(): PreloadStatistics;
    /**
     * Get cache hit rate improvement
     */
    calculateHitRateImprovement(): number;
    /**
     * Clear all preloaded data
     */
    clear(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
}
/**
 * Initialize global cache preloader
 */
export declare function initializeCachePreloader(strategy?: Partial<PreloadStrategy>): Promise<CachePreloader>;
/**
 * Get global cache preloader instance
 */
export declare function getCachePreloader(): CachePreloader | null;
/**
 * Start background cache preloading
 */
export declare function startBackgroundPreloading(): Promise<void>;
