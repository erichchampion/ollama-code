import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { getPerformanceConfig } from '../config/performance.js';
export var CachePriority;
(function (CachePriority) {
    CachePriority[CachePriority["LOW"] = 1] = "LOW";
    CachePriority[CachePriority["NORMAL"] = 2] = "NORMAL";
    CachePriority[CachePriority["HIGH"] = 3] = "HIGH";
    CachePriority[CachePriority["CRITICAL"] = 4] = "CRITICAL";
})(CachePriority || (CachePriority = {}));
/**
 * Multi-tier intelligent cache system
 */
export class IntelligentCache extends EventEmitter {
    memoryCache = new Map();
    diskCacheIndex = new Map();
    usagePatterns = new Map();
    config;
    diskCacheDir;
    memoryUsage = 0;
    hitCount = 0;
    missCount = 0;
    evictionCount = 0;
    constructor(config = {}) {
        super();
        const defaultConfig = getPerformanceConfig().cache;
        this.config = {
            ...defaultConfig,
            ...config
        };
        this.diskCacheDir = this.config.diskCacheDir || path.join(process.cwd(), '.cache', 'memory-optimizer');
        this.initializeDiskCache();
        this.startMemoryMonitoring();
    }
    async initializeDiskCache() {
        try {
            await fs.mkdir(this.diskCacheDir, { recursive: true });
            await this.loadDiskCacheIndex();
        }
        catch (error) {
            logger.warn('Failed to initialize disk cache:', error);
        }
    }
    async loadDiskCacheIndex() {
        try {
            const indexPath = path.join(this.diskCacheDir, 'index.json');
            const indexData = await fs.readFile(indexPath, 'utf-8');
            const index = JSON.parse(indexData);
            for (const [key, filePath] of Object.entries(index)) {
                this.diskCacheIndex.set(key, filePath);
            }
        }
        catch (error) {
            // Index doesn't exist yet, will be created
        }
    }
    async saveDiskCacheIndex() {
        try {
            const indexPath = path.join(this.diskCacheDir, 'index.json');
            const index = Object.fromEntries(this.diskCacheIndex);
            await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
        }
        catch (error) {
            logger.warn('Failed to save disk cache index:', error);
        }
    }
    /**
     * Get value from cache with intelligent fallback
     */
    async get(key) {
        // Try memory cache first
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && !this.isExpired(memoryEntry)) {
            this.updateAccessStats(memoryEntry);
            this.hitCount++;
            this.emit('hit', { key, tier: 'memory' });
            return memoryEntry.value;
        }
        // Try disk cache
        const diskValue = await this.getDiskCache(key);
        if (diskValue !== undefined) {
            // Promote to memory cache if frequently accessed
            this.promoteToMemory(key, diskValue);
            this.hitCount++;
            this.emit('hit', { key, tier: 'disk' });
            return diskValue;
        }
        this.missCount++;
        this.emit('miss', { key });
        return undefined;
    }
    /**
     * Set value in cache with intelligent placement
     */
    async set(key, value, options = {}) {
        const size = options.size || this.estimateSize(value);
        const priority = options.priority || CachePriority.NORMAL;
        const ttl = options.ttl || this.config.defaultTTLMs;
        const entry = {
            key,
            value,
            size,
            accessCount: 1,
            lastAccessed: Date.now(),
            created: Date.now(),
            ttl,
            priority
        };
        // Decide placement based on size and priority
        if (this.shouldUseMemoryCache(entry)) {
            await this.setMemoryCache(key, entry);
        }
        else {
            await this.setDiskCache(key, entry);
        }
        this.emit('set', { key, tier: entry.priority >= CachePriority.HIGH ? 'memory' : 'disk' });
    }
    shouldUseMemoryCache(entry) {
        const memoryLimit = this.config.maxMemoryMB * 1024 * 1024;
        const projectedUsage = this.memoryUsage + entry.size;
        return (entry.priority >= CachePriority.HIGH ||
            entry.size < this.config.compressionThresholdBytes ||
            projectedUsage < memoryLimit * this.config.memoryPressureThreshold);
    }
    async setMemoryCache(key, entry) {
        // Check if eviction is needed
        const memoryLimit = this.config.maxMemoryMB * 1024 * 1024;
        if (this.memoryUsage + entry.size > memoryLimit) {
            await this.evictMemoryEntries(entry.size);
        }
        this.memoryCache.set(key, entry);
        this.memoryUsage += entry.size;
        this.updateUsagePattern(key);
    }
    async setDiskCache(key, entry) {
        try {
            const filePath = path.join(this.diskCacheDir, `${this.hashKey(key)}.cache`);
            let data = JSON.stringify({
                metadata: {
                    key: entry.key,
                    size: entry.size,
                    created: entry.created,
                    ttl: entry.ttl,
                    priority: entry.priority
                },
                value: entry.value
            });
            // Compress if above threshold
            if (entry.size > this.config.compressionThresholdBytes) {
                data = await this.compressData(data);
                entry.compressed = true;
            }
            await fs.writeFile(filePath, data);
            this.diskCacheIndex.set(key, filePath);
            await this.saveDiskCacheIndex();
        }
        catch (error) {
            logger.warn('Failed to write disk cache:', error);
        }
    }
    async getDiskCache(key) {
        try {
            const filePath = this.diskCacheIndex.get(key);
            if (!filePath)
                return undefined;
            let data = await fs.readFile(filePath, 'utf-8');
            // Check if compressed
            if (data.startsWith('\x1f\x8b')) {
                data = await this.decompressData(data);
            }
            const parsed = JSON.parse(data);
            // Check expiration
            if (parsed.metadata.ttl && Date.now() - parsed.metadata.created > parsed.metadata.ttl) {
                await this.deleteDiskCache(key);
                return undefined;
            }
            return parsed.value;
        }
        catch (error) {
            logger.warn('Failed to read disk cache:', error);
            return undefined;
        }
    }
    async deleteDiskCache(key) {
        try {
            const filePath = this.diskCacheIndex.get(key);
            if (filePath) {
                await fs.unlink(filePath);
                this.diskCacheIndex.delete(key);
                await this.saveDiskCacheIndex();
            }
        }
        catch (error) {
            logger.warn('Failed to delete disk cache:', error);
        }
    }
    async evictMemoryEntries(spaceNeeded) {
        const entries = Array.from(this.memoryCache.entries());
        // Sort by priority and access patterns for intelligent eviction
        entries.sort((a, b) => {
            const [, entryA] = a;
            const [, entryB] = b;
            // Priority first
            if (entryA.priority !== entryB.priority) {
                return entryA.priority - entryB.priority;
            }
            // Then by access frequency
            const freqA = entryA.accessCount / ((Date.now() - entryA.created) / 3600000);
            const freqB = entryB.accessCount / ((Date.now() - entryB.created) / 3600000);
            return freqA - freqB;
        });
        let freedSpace = 0;
        const targetSpace = Math.max(spaceNeeded, this.memoryUsage * this.config.evictionRatio);
        for (const [key, entry] of entries) {
            if (freedSpace >= targetSpace)
                break;
            if (entry.priority === CachePriority.CRITICAL)
                continue;
            // Move to disk cache before evicting from memory
            await this.setDiskCache(key, entry);
            this.memoryCache.delete(key);
            this.memoryUsage -= entry.size;
            freedSpace += entry.size;
            this.evictionCount++;
        }
        this.emit('eviction', { freedSpace, evictedCount: freedSpace > 0 ? entries.length : 0 });
    }
    promoteToMemory(key, value) {
        const usagePattern = this.usagePatterns.get(key);
        if (!usagePattern)
            return;
        // Promote if accessed frequently
        const recentAccesses = usagePattern.filter(time => Date.now() - time < 3600000).length;
        if (recentAccesses >= 3) {
            this.set(key, value, { priority: CachePriority.HIGH });
        }
    }
    updateAccessStats(entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.updateUsagePattern(entry.key);
    }
    updateUsagePattern(key) {
        const pattern = this.usagePatterns.get(key) || [];
        pattern.push(Date.now());
        // Keep only recent access times (last 24 hours)
        const recent = pattern.filter(time => Date.now() - time < 86400000);
        this.usagePatterns.set(key, recent);
    }
    isExpired(entry) {
        if (!entry.ttl)
            return false;
        return Date.now() - entry.created > entry.ttl;
    }
    estimateSize(value) {
        return JSON.stringify(value).length * 2; // Rough estimate
    }
    hashKey(key) {
        return createHash('md5').update(key).digest('hex');
    }
    async compressData(data) {
        // Simplified compression - in real implementation use zlib
        return data;
    }
    async decompressData(data) {
        // Simplified decompression - in real implementation use zlib
        return data;
    }
    startMemoryMonitoring() {
        setInterval(() => {
            const memoryLimit = this.config.maxMemoryMB * 1024 * 1024;
            const usage = this.memoryUsage / memoryLimit;
            if (usage > 0.9) {
                this.emit('memoryPressure', { usage, level: 'critical' });
                this.evictMemoryEntries(memoryLimit * 0.3);
            }
            else if (usage > 0.7) {
                this.emit('memoryPressure', { usage, level: 'high' });
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Get comprehensive memory statistics
     */
    getStats() {
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
        return {
            totalMemoryUsage: this.memoryUsage,
            cacheMemoryUsage: this.memoryUsage,
            hitRate,
            evictionCount: this.evictionCount,
            compressionRatio: 0.7, // Estimated
            diskCacheSize: this.diskCacheIndex.size,
            activeCaches: this.memoryCache.size
        };
    }
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        const stats = this.getStats();
        if (stats.hitRate < 0.6) {
            recommendations.push({
                type: 'cache',
                severity: 'high',
                message: 'Low cache hit rate detected',
                action: 'Consider increasing cache size or TTL values',
                potentialSavings: 1024 * 1024 * 50 // 50MB estimated
            });
        }
        if (stats.totalMemoryUsage > this.config.maxMemoryMB * 1024 * 1024 * 0.8) {
            recommendations.push({
                type: 'memory',
                severity: 'medium',
                message: 'High memory usage detected',
                action: 'Consider more aggressive eviction or compression',
                potentialSavings: 1024 * 1024 * 100 // 100MB estimated
            });
        }
        if (stats.evictionCount > 100) {
            recommendations.push({
                type: 'eviction',
                severity: 'medium',
                message: 'High eviction rate detected',
                action: 'Increase memory allocation or improve access patterns',
                potentialSavings: 1024 * 1024 * 75 // 75MB estimated
            });
        }
        return recommendations;
    }
    /**
     * Warm up cache with predicted entries
     */
    async warmupCache(keys, fetcher) {
        if (!this.config.warmupEnabled)
            return;
        const warmupPromises = keys.map(async (key) => {
            const existing = await this.get(key);
            if (!existing) {
                try {
                    const value = await fetcher(key);
                    await this.set(key, value, { priority: CachePriority.NORMAL });
                }
                catch (error) {
                    logger.warn(`Failed to warm up cache for key ${key}:`, error);
                }
            }
        });
        await Promise.all(warmupPromises);
        this.emit('warmupComplete', { count: keys.length });
    }
    /**
     * Clear all caches
     */
    async clear() {
        this.memoryCache.clear();
        this.memoryUsage = 0;
        // Clear disk cache
        try {
            const files = await fs.readdir(this.diskCacheDir);
            await Promise.all(files.map(file => fs.unlink(path.join(this.diskCacheDir, file))));
            this.diskCacheIndex.clear();
        }
        catch (error) {
            logger.warn('Failed to clear disk cache:', error);
        }
        this.emit('cleared');
    }
    /**
     * Cleanup expired entries
     */
    async cleanup() {
        // Cleanup memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (this.isExpired(entry)) {
                this.memoryCache.delete(key);
                this.memoryUsage -= entry.size;
            }
        }
        // Cleanup disk cache
        for (const key of this.diskCacheIndex.keys()) {
            const value = await this.getDiskCache(key);
            if (value === undefined) {
                // Entry was expired and removed
                continue;
            }
        }
        this.emit('cleanup');
    }
}
/**
 * Advanced cache manager that integrates with existing MemoryManager
 */
export class AdvancedCacheManager {
    static instance;
    caches = new Map();
    globalStats = {
        totalAllocated: 0,
        totalHits: 0,
        totalMisses: 0
    };
    static getInstance() {
        if (!AdvancedCacheManager.instance) {
            AdvancedCacheManager.instance = new AdvancedCacheManager();
        }
        return AdvancedCacheManager.instance;
    }
    /**
     * Get or create named cache
     */
    getCache(name, config) {
        if (!this.caches.has(name)) {
            const cache = new IntelligentCache(config);
            cache.on('hit', () => this.globalStats.totalHits++);
            cache.on('miss', () => this.globalStats.totalMisses++);
            this.caches.set(name, cache);
        }
        return this.caches.get(name);
    }
    /**
     * Get global memory statistics
     */
    getGlobalStats() {
        const cacheStats = Array.from(this.caches.values()).map(cache => cache.getStats());
        return {
            totalMemoryUsage: cacheStats.reduce((sum, stats) => sum + stats.totalMemoryUsage, 0),
            cacheMemoryUsage: cacheStats.reduce((sum, stats) => sum + stats.cacheMemoryUsage, 0),
            hitRate: this.globalStats.totalHits / (this.globalStats.totalHits + this.globalStats.totalMisses),
            evictionCount: cacheStats.reduce((sum, stats) => sum + stats.evictionCount, 0),
            compressionRatio: cacheStats.reduce((sum, stats) => sum + stats.compressionRatio, 0) / cacheStats.length,
            diskCacheSize: cacheStats.reduce((sum, stats) => sum + stats.diskCacheSize, 0),
            activeCaches: cacheStats.reduce((sum, stats) => sum + stats.activeCaches, 0),
            totalCaches: this.caches.size
        };
    }
    /**
     * Global optimization recommendations
     */
    getGlobalOptimizationRecommendations() {
        const recommendations = [];
        for (const [name, cache] of this.caches.entries()) {
            const cacheRecommendations = cache.getOptimizationRecommendations();
            recommendations.push(...cacheRecommendations.map(rec => ({
                ...rec,
                message: `[${name}] ${rec.message}`
            })));
        }
        return recommendations;
    }
    /**
     * Cleanup all caches
     */
    async globalCleanup() {
        const cleanupPromises = Array.from(this.caches.values()).map(cache => cache.cleanup());
        await Promise.all(cleanupPromises);
    }
}
//# sourceMappingURL=memory-optimizer.js.map