import { EventEmitter } from 'events';
/**
 * Memory Optimization System for Large Codebase Analysis
 *
 * Implements intelligent caching strategies:
 * - Multi-tier caching (memory → disk → network)
 * - LRU eviction with usage patterns
 * - Memory pressure monitoring
 * - Cache warming and predictive loading
 * - Compression for disk storage
 */
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    size: number;
    accessCount: number;
    lastAccessed: number;
    created: number;
    ttl?: number;
    compressed?: boolean;
    priority: CachePriority;
}
export declare enum CachePriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}
export interface MemoryStats {
    totalMemoryUsage: number;
    cacheMemoryUsage: number;
    hitRate: number;
    evictionCount: number;
    compressionRatio: number;
    diskCacheSize: number;
    activeCaches: number;
}
export interface CacheConfig {
    maxMemoryMB: number;
    maxDiskMB: number;
    defaultTTL: number;
    compressionThreshold: number;
    evictionRatio: number;
    warmupEnabled: boolean;
    diskCacheDir?: string;
}
export interface OptimizationRecommendation {
    type: 'memory' | 'cache' | 'compression' | 'eviction';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    action: string;
    potentialSavings: number;
}
/**
 * Multi-tier intelligent cache system
 */
export declare class IntelligentCache<T = any> extends EventEmitter {
    private memoryCache;
    private diskCacheIndex;
    private usagePatterns;
    private config;
    private diskCacheDir;
    private memoryUsage;
    private hitCount;
    private missCount;
    private evictionCount;
    constructor(config?: Partial<CacheConfig>);
    private initializeDiskCache;
    private loadDiskCacheIndex;
    private saveDiskCacheIndex;
    /**
     * Get value from cache with intelligent fallback
     */
    get(key: string): Promise<T | undefined>;
    /**
     * Set value in cache with intelligent placement
     */
    set(key: string, value: T, options?: {
        ttl?: number;
        priority?: CachePriority;
        size?: number;
    }): Promise<void>;
    private shouldUseMemoryCache;
    private setMemoryCache;
    private setDiskCache;
    private getDiskCache;
    private deleteDiskCache;
    private evictMemoryEntries;
    private promoteToMemory;
    private updateAccessStats;
    private updateUsagePattern;
    private isExpired;
    private estimateSize;
    private hashKey;
    private compressData;
    private decompressData;
    private startMemoryMonitoring;
    /**
     * Get comprehensive memory statistics
     */
    getStats(): MemoryStats;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): OptimizationRecommendation[];
    /**
     * Warm up cache with predicted entries
     */
    warmupCache(keys: string[], fetcher: (key: string) => Promise<T>): Promise<void>;
    /**
     * Clear all caches
     */
    clear(): Promise<void>;
    /**
     * Cleanup expired entries
     */
    cleanup(): Promise<void>;
}
/**
 * Global memory optimizer singleton
 */
export declare class MemoryOptimizer {
    private static instance;
    private caches;
    private globalStats;
    static getInstance(): MemoryOptimizer;
    /**
     * Get or create named cache
     */
    getCache<T>(name: string, config?: Partial<CacheConfig>): IntelligentCache<T>;
    /**
     * Get global memory statistics
     */
    getGlobalStats(): MemoryStats & {
        totalCaches: number;
    };
    /**
     * Global optimization recommendations
     */
    getGlobalOptimizationRecommendations(): OptimizationRecommendation[];
    /**
     * Cleanup all caches
     */
    globalCleanup(): Promise<void>;
}
