/**
 * Centralized Cache Management System
 *
 * Provides shared cache utilities to eliminate duplicate cache implementations
 * across the codebase and ensure consistent cache behavior.
 */
import { EventEmitter } from 'events';
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    ttl?: number;
    size?: number;
}
export interface CacheOptions {
    maxSize?: number;
    ttlMs?: number;
    enableMetrics?: boolean;
    evictionStrategy?: 'lru' | 'lfu' | 'ttl';
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    hitRate: number;
    totalOperations: number;
    memoryUsage: number;
    entryCount: number;
    evictions: number;
}
/**
 * LRU Cache implementation with metrics and TTL support
 */
export declare class LRUCache<K, V> extends EventEmitter {
    private cache;
    private accessOrder;
    private accessCounter;
    private metrics;
    private options;
    constructor(options?: CacheOptions);
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    getMetrics(): CacheMetrics;
    private evictOne;
    private findLRUKey;
    private findLFUKey;
    private findOldestTTLKey;
    private updateHitRate;
    private updateMemoryUsage;
    private estimateSize;
}
/**
 * Simple Map-based cache for scenarios where LRU is not needed
 */
export declare class SimpleCache<K, V> extends EventEmitter {
    private cache;
    private options;
    constructor(options?: CacheOptions);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
}
/**
 * Cache Manager Factory
 */
export declare class CacheManager {
    private static caches;
    static createLRUCache<K, V>(name: string, options?: CacheOptions): LRUCache<K, V>;
    static createSimpleCache<K, V>(name: string, options?: CacheOptions): SimpleCache<K, V>;
    static getCache<K, V>(name: string): LRUCache<K, V> | SimpleCache<K, V> | undefined;
    static removeCache(name: string): boolean;
    static clearAllCaches(): void;
    static getCacheNames(): string[];
    static getTotalMemoryUsage(): number;
}
