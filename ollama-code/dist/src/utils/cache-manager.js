/**
 * Centralized Cache Management System
 *
 * Provides shared cache utilities to eliminate duplicate cache implementations
 * across the codebase and ensure consistent cache behavior.
 */
import { EventEmitter } from 'events';
import { getPerformanceConfig } from '../config/performance.js';
/**
 * LRU Cache implementation with metrics and TTL support
 */
export class LRUCache extends EventEmitter {
    cache = new Map();
    accessOrder = new Map();
    accessCounter = 0;
    metrics;
    options;
    constructor(options = {}) {
        super();
        const config = getPerformanceConfig();
        this.options = {
            maxSize: options.maxSize || 1000,
            ttlMs: options.ttlMs || config.cache.defaultTTLMs,
            enableMetrics: options.enableMetrics !== false,
            evictionStrategy: options.evictionStrategy || 'lru'
        };
        this.metrics = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalOperations: 0,
            memoryUsage: 0,
            entryCount: 0,
            evictions: 0
        };
    }
    get(key) {
        this.metrics.totalOperations++;
        const entry = this.cache.get(key);
        if (!entry) {
            this.metrics.misses++;
            this.updateHitRate();
            return undefined;
        }
        // Check TTL
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.metrics.misses++;
            this.updateHitRate();
            this.emit('expired', key, entry.value);
            return undefined;
        }
        // Update access metadata
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.accessOrder.set(key, this.accessCounter++);
        this.metrics.hits++;
        this.updateHitRate();
        if (this.options.enableMetrics) {
            this.emit('hit', key, entry.value);
        }
        return entry.value;
    }
    set(key, value, ttl) {
        // Remove existing entry if it exists
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
        }
        // Evict if at capacity
        if (this.cache.size >= this.options.maxSize) {
            this.evictOne();
        }
        const entry = {
            value,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now(),
            ttl: ttl || this.options.ttlMs,
            size: this.estimateSize(value)
        };
        this.cache.set(key, entry);
        this.accessOrder.set(key, this.accessCounter++);
        this.metrics.entryCount = this.cache.size;
        this.updateMemoryUsage();
        if (this.options.enableMetrics) {
            this.emit('set', key, value);
        }
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        // Check TTL
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.emit('expired', key, entry.value);
            return false;
        }
        return true;
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.accessOrder.delete(key);
            this.metrics.entryCount = this.cache.size;
            this.updateMemoryUsage();
            this.emit('delete', key);
        }
        return deleted;
    }
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessOrder.clear();
        this.accessCounter = 0;
        this.metrics.entryCount = 0;
        this.metrics.memoryUsage = 0;
        this.emit('clear', size);
    }
    size() {
        return this.cache.size;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    evictOne() {
        if (this.cache.size === 0)
            return;
        let keyToEvict;
        switch (this.options.evictionStrategy) {
            case 'lru':
                keyToEvict = this.findLRUKey();
                break;
            case 'lfu':
                keyToEvict = this.findLFUKey();
                break;
            case 'ttl':
                keyToEvict = this.findOldestTTLKey();
                break;
            default:
                keyToEvict = this.findLRUKey();
        }
        if (keyToEvict !== undefined) {
            const entry = this.cache.get(keyToEvict);
            this.cache.delete(keyToEvict);
            this.accessOrder.delete(keyToEvict);
            this.metrics.evictions++;
            this.metrics.entryCount = this.cache.size;
            this.updateMemoryUsage();
            if (entry) {
                this.emit('evict', keyToEvict, entry.value);
            }
        }
    }
    findLRUKey() {
        let oldestAccess = this.accessCounter;
        let lruKey;
        for (const [key, accessTime] of this.accessOrder) {
            if (accessTime < oldestAccess) {
                oldestAccess = accessTime;
                lruKey = key;
            }
        }
        return lruKey;
    }
    findLFUKey() {
        let minAccessCount = Infinity;
        let lfuKey;
        for (const [key, entry] of this.cache) {
            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                lfuKey = key;
            }
        }
        return lfuKey;
    }
    findOldestTTLKey() {
        let oldestTimestamp = Date.now();
        let oldestKey;
        for (const [key, entry] of this.cache) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    updateHitRate() {
        this.metrics.hitRate = this.metrics.totalOperations > 0
            ? this.metrics.hits / this.metrics.totalOperations
            : 0;
    }
    updateMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.cache.values()) {
            totalSize += entry.size || 0;
        }
        this.metrics.memoryUsage = totalSize;
    }
    estimateSize(value) {
        // Simple size estimation - can be enhanced
        if (typeof value === 'string') {
            return value.length * 2; // Unicode characters
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value).length * 2;
        }
        return 8; // Primitive types
    }
}
/**
 * Simple Map-based cache for scenarios where LRU is not needed
 */
export class SimpleCache extends EventEmitter {
    cache = new Map();
    options;
    constructor(options = {}) {
        super();
        this.options = options;
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value) {
        if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
            // Remove first entry (FIFO)
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
                this.emit('evict', firstKey);
            }
        }
        this.cache.set(key, value);
        this.emit('set', key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.emit('delete', key);
        }
        return deleted;
    }
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.emit('clear', size);
    }
    size() {
        return this.cache.size;
    }
    keys() {
        return this.cache.keys();
    }
    values() {
        return this.cache.values();
    }
    entries() {
        return this.cache.entries();
    }
}
/**
 * Cache Manager Factory
 */
export class CacheManager {
    static caches = new Map();
    static createLRUCache(name, options) {
        if (this.caches.has(name)) {
            throw new Error(`Cache with name '${name}' already exists`);
        }
        const cache = new LRUCache(options);
        this.caches.set(name, cache);
        return cache;
    }
    static createSimpleCache(name, options) {
        if (this.caches.has(name)) {
            throw new Error(`Cache with name '${name}' already exists`);
        }
        const cache = new SimpleCache(options);
        this.caches.set(name, cache);
        return cache;
    }
    static getCache(name) {
        return this.caches.get(name);
    }
    static removeCache(name) {
        const cache = this.caches.get(name);
        if (cache) {
            cache.clear();
            return this.caches.delete(name);
        }
        return false;
    }
    static clearAllCaches() {
        for (const cache of this.caches.values()) {
            cache.clear();
        }
        this.caches.clear();
    }
    static getCacheNames() {
        return Array.from(this.caches.keys());
    }
    static getTotalMemoryUsage() {
        let total = 0;
        for (const cache of this.caches.values()) {
            if (cache instanceof LRUCache) {
                total += cache.getMetrics().memoryUsage;
            }
        }
        return total;
    }
}
//# sourceMappingURL=cache-manager.js.map