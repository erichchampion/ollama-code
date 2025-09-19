/**
 * Memory Management System
 *
 * Optimizes memory usage for large projects by implementing:
 * - Smart caching with size limits
 * - Selective file loading
 * - Memory pressure monitoring
 * - Automatic garbage collection
 */
interface MemoryStats {
    used: number;
    total: number;
    available: number;
    cacheSize: number;
    cacheEntries: number;
}
export declare class MemoryManager {
    private cache;
    private maxCacheSize;
    private maxMemoryUsage;
    private gcInterval;
    constructor();
    /**
     * Store data in memory-optimized cache
     */
    set<T>(key: string, data: T, ttl?: number): void;
    /**
     * Retrieve data from cache
     */
    get<T>(key: string): T | null;
    /**
     * Smart file loading with memory optimization
     */
    loadFileOptimized(filePath: string, maxSize?: number): Promise<string | null>;
    /**
     * Process directory with memory-aware batching
     */
    processDirectoryBatched(dirPath: string, processor: (files: string[]) => Promise<void>, batchSize?: number): Promise<void>;
    /**
     * Get current memory statistics
     */
    getMemoryStats(): MemoryStats;
    /**
     * Force garbage collection and cache cleanup
     */
    forceGarbageCollection(): Promise<void>;
    /**
     * Configure memory limits
     */
    configure(options: {
        maxCacheSize?: number;
        maxMemoryUsage?: number;
    }): void;
    /**
     * Start memory monitoring
     */
    private startMemoryMonitoring;
    /**
     * Stop memory monitoring
     */
    stopMonitoring(): void;
    /**
     * Estimate object size in bytes
     */
    private estimateSize;
    /**
     * Check if memory pressure is high
     */
    private isMemoryPressureHigh;
    /**
     * Get total cache size
     */
    private getCacheSize;
    /**
     * Ensure memory is available for new allocation
     */
    private ensureMemoryAvailable;
    /**
     * Evict least used entries to free memory
     */
    private evictLeastUsed;
    /**
     * Clean up expired cache entries
     */
    private cleanupCache;
    /**
     * Format bytes to human readable string
     */
    private formatBytes;
    /**
     * Dispose of the memory manager and clean up resources
     */
    dispose(): Promise<void>;
}
export {};
