/**
 * AI Response Caching System
 *
 * Implements intelligent caching for AI responses to improve performance:
 * - Semantic similarity matching
 * - Context-aware caching
 * - Persistent cache storage
 * - Cache warming strategies
 */
interface CacheStats {
    totalEntries: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    cacheSize: number;
    averageResponseTime: number;
}
export declare class AICacheManager {
    private cache;
    private cacheDir;
    private cacheFile;
    private stats;
    private memoryManager;
    constructor(memoryManager?: any);
    /**
     * Check cache for similar queries
     */
    getCachedResponse(query: string, context?: Record<string, any>, model?: string): Promise<string | null>;
    /**
     * Store AI response in cache
     */
    cacheResponse(query: string, response: string, context?: Record<string, any>, model?: string): Promise<void>;
    /**
     * Warm cache with common queries
     */
    warmCache(commonQueries: Array<{
        query: string;
        context?: Record<string, any>;
        model?: string;
    }>): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats;
    /**
     * Clear cache
     */
    clearCache(): Promise<void>;
    /**
     * Optimize cache by removing old entries
     */
    optimizeCache(): void;
    /**
     * Initialize cache from disk
     */
    private initializeCache;
    /**
     * Persist cache to disk
     */
    private persistCache;
    /**
     * Generate hash for query + context + model
     */
    private generateQueryHash;
    /**
     * Find similar queries using simple text similarity
     */
    private findSimilarQuery;
    /**
     * Calculate text similarity using simple word overlap
     */
    private calculateTextSimilarity;
    /**
     * Calculate context similarity
     */
    private calculateContextSimilarity;
    /**
     * Dispose of the AI cache manager and clean up resources
     */
    dispose(): Promise<void>;
}
export {};
