/**
 * Provider-Specific Caching Strategies
 *
 * Implements intelligent caching strategies tailored to each AI provider's
 * characteristics, cost models, and performance patterns for optimal
 * response times and cost efficiency.
 */
import { EventEmitter } from 'events';
export interface CacheEntry {
    key: string;
    value: any;
    metadata: CacheMetadata;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    expiresAt?: Date;
}
export interface CacheMetadata {
    providerId: string;
    model: string;
    contextHash: string;
    responseSize: number;
    processingTime: number;
    cost: number;
    quality: number;
    tags: string[];
    capabilities: string[];
}
export interface CacheConfig {
    maxSize: number;
    defaultTTL: number;
    cleanupInterval: number;
    persistToDisk: boolean;
    compressionEnabled: boolean;
    metricsEnabled: boolean;
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
    cacheSize: number;
    memoryUsage: number;
    costSavings: number;
    averageResponseTime: number;
}
export interface CacheStrategy {
    name: string;
    description: string;
    shouldCache(request: any, response: any, metadata: CacheMetadata): boolean;
    getTTL(request: any, response: any, metadata: CacheMetadata): number;
    getEvictionPriority(entry: CacheEntry): number;
    shouldUpdate(existing: CacheEntry, newEntry: CacheEntry): boolean;
}
export declare class ProviderCacheManager extends EventEmitter {
    private caches;
    private strategies;
    private config;
    private metrics;
    private cleanupTimer?;
    constructor(config?: Partial<CacheConfig>);
    /**
     * Initialize caching strategies for different providers
     */
    private initializeStrategies;
    /**
     * Initialize provider-specific caches
     */
    private initializeProviderCaches;
    /**
     * Get cached response if available
     */
    get(providerId: string, request: any): Promise<any | null>;
    /**
     * Store response in cache
     */
    set(providerId: string, request: any, response: any, metadata: CacheMetadata): Promise<void>;
    /**
     * Generate cache key for request
     */
    private generateCacheKey;
    /**
     * Normalize request for consistent cache keys
     */
    private normalizeRequest;
    /**
     * Sort object keys recursively for consistent serialization
     */
    private sortObjectKeys;
    /**
     * Update cache metrics
     */
    private updateMetrics;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Perform cache cleanup
     */
    private performCleanup;
    /**
     * Get cache metrics
     */
    getMetrics(): CacheMetrics;
    /**
     * Get provider-specific cache metrics
     */
    getProviderMetrics(providerId: string): CacheMetrics | null;
    /**
     * Clear cache for specific provider
     */
    clearProvider(providerId: string): Promise<void>;
    /**
     * Clear all caches
     */
    clearAll(): Promise<void>;
    /**
     * Dispose of cache manager
     */
    dispose(): void;
}
