/**
 * Memory Management System
 *
 * Optimizes memory usage for large projects by implementing:
 * - Smart caching with size limits
 * - Selective file loading
 * - Memory pressure monitoring
 * - Automatic garbage collection
 */
import { logger } from '../utils/logger.js';
export class MemoryManager {
    cache = new Map();
    maxCacheSize = 100 * 1024 * 1024; // 100MB default
    maxMemoryUsage = 0.8; // 80% of available memory
    gcInterval = null;
    constructor() {
        this.startMemoryMonitoring();
    }
    /**
     * Store data in memory-optimized cache
     */
    set(key, data, ttl = 300000) {
        const size = this.estimateSize(data);
        // Check if we need to free memory first
        this.ensureMemoryAvailable(size);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            accessCount: 0,
            size
        });
        logger.debug(`Cached ${key}: ${this.formatBytes(size)}`);
    }
    /**
     * Retrieve data from cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check TTL
        if (Date.now() - entry.timestamp > 300000) { // 5 min default
            this.cache.delete(key);
            return null;
        }
        entry.accessCount++;
        return entry.data;
    }
    /**
     * Smart file loading with memory optimization
     */
    async loadFileOptimized(filePath, maxSize = 1024 * 1024) {
        const cacheKey = `file:${filePath}`;
        // Check cache first
        const cached = this.get(cacheKey);
        if (cached !== null) {
            return cached;
        }
        try {
            const { promises: fs } = await import('fs');
            const stats = await fs.stat(filePath);
            // Skip very large files to prevent memory issues
            if (stats.size > maxSize) {
                logger.warn(`Skipping large file ${filePath}: ${this.formatBytes(stats.size)}`);
                return null;
            }
            const content = await fs.readFile(filePath, 'utf-8');
            // Cache with shorter TTL for files
            this.set(cacheKey, content, 600000); // 10 min for files
            return content;
        }
        catch (error) {
            logger.debug(`Failed to load file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Process directory with memory-aware batching
     */
    async processDirectoryBatched(dirPath, processor, batchSize = 50) {
        const { promises: fs } = await import('fs');
        const path = await import('path');
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const files = [];
            for (const entry of entries) {
                if (entry.isFile()) {
                    files.push(path.join(dirPath, entry.name));
                }
            }
            // Process in batches to avoid memory spikes
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                // Check memory before processing batch
                if (this.isMemoryPressureHigh()) {
                    logger.warn('High memory pressure, triggering cleanup');
                    await this.forceGarbageCollection();
                }
                await processor(batch);
                // Small delay to allow GC
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        catch (error) {
            logger.error(`Failed to process directory ${dirPath}:`, error);
        }
    }
    /**
     * Get current memory statistics
     */
    getMemoryStats() {
        const memUsage = process.memoryUsage();
        const cacheSize = this.getCacheSize();
        const cacheEntries = this.cache.size;
        return {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            available: memUsage.heapTotal - memUsage.heapUsed,
            cacheSize,
            cacheEntries
        };
    }
    /**
     * Force garbage collection and cache cleanup
     */
    async forceGarbageCollection() {
        // Clear old cache entries
        this.cleanupCache();
        // Force Node.js garbage collection if available
        if (global.gc) {
            global.gc();
            logger.debug('Forced garbage collection');
        }
        // Small delay to allow cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    /**
     * Configure memory limits
     */
    configure(options) {
        if (options.maxCacheSize) {
            this.maxCacheSize = options.maxCacheSize;
        }
        if (options.maxMemoryUsage) {
            this.maxMemoryUsage = options.maxMemoryUsage;
        }
        logger.debug('Memory manager configured:', {
            maxCacheSize: this.formatBytes(this.maxCacheSize),
            maxMemoryUsage: `${(this.maxMemoryUsage * 100).toFixed(1)}%`
        });
    }
    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        this.gcInterval = setInterval(() => {
            this.cleanupCache();
            if (this.isMemoryPressureHigh()) {
                logger.warn('High memory pressure detected, cleaning up');
                this.forceGarbageCollection();
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Stop memory monitoring
     */
    stopMonitoring() {
        if (this.gcInterval) {
            clearInterval(this.gcInterval);
            this.gcInterval = null;
        }
    }
    /**
     * Estimate object size in bytes
     */
    estimateSize(obj) {
        if (typeof obj === 'string') {
            return obj.length * 2; // UTF-16
        }
        if (typeof obj === 'object' && obj !== null) {
            return JSON.stringify(obj).length * 2;
        }
        return 8; // Basic estimate for primitives
    }
    /**
     * Check if memory pressure is high
     */
    isMemoryPressureHigh() {
        const stats = this.getMemoryStats();
        const usageRatio = stats.used / stats.total;
        return usageRatio > this.maxMemoryUsage;
    }
    /**
     * Get total cache size
     */
    getCacheSize() {
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.size;
        }
        return total;
    }
    /**
     * Ensure memory is available for new allocation
     */
    ensureMemoryAvailable(requiredSize) {
        const currentCacheSize = this.getCacheSize();
        if (currentCacheSize + requiredSize > this.maxCacheSize) {
            this.evictLeastUsed(requiredSize);
        }
    }
    /**
     * Evict least used entries to free memory
     */
    evictLeastUsed(requiredSize) {
        const entries = Array.from(this.cache.entries())
            .map(([key, entry]) => ({ key, ...entry }))
            .sort((a, b) => {
            // Sort by access count (ascending) then by age (descending)
            if (a.accessCount !== b.accessCount) {
                return a.accessCount - b.accessCount;
            }
            return b.timestamp - a.timestamp;
        });
        let freedSize = 0;
        let evicted = 0;
        for (const entry of entries) {
            if (freedSize >= requiredSize)
                break;
            this.cache.delete(entry.key);
            freedSize += entry.size;
            evicted++;
        }
        logger.debug(`Evicted ${evicted} cache entries, freed ${this.formatBytes(freedSize)}`);
    }
    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > 300000) { // 5 min default TTL
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger.debug(`Cleaned up ${cleaned} expired cache entries`);
        }
    }
    /**
     * Format bytes to human readable string
     */
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    /**
     * Dispose of the memory manager and clean up resources
     */
    async dispose() {
        if (this.gcInterval) {
            clearInterval(this.gcInterval);
            this.gcInterval = null;
        }
        this.cache.clear();
        logger.debug('Memory manager disposed');
    }
}
// Global memory manager instance
// Legacy export - use dependency injection instead
// export const memoryManager = MemoryManager.getInstance();
//# sourceMappingURL=memory-manager.js.map