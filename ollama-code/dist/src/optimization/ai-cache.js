/**
 * AI Response Caching System
 *
 * Implements intelligent caching for AI responses to improve performance:
 * - Semantic similarity matching
 * - Context-aware caching
 * - Persistent cache storage
 * - Cache warming strategies
 */
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
export class AICacheManager {
    cache = new Map();
    cacheDir;
    cacheFile;
    stats = {
        hits: 0,
        misses: 0,
        totalQueries: 0,
        averageResponseTime: 0
    };
    memoryManager;
    constructor(memoryManager) {
        this.memoryManager = memoryManager;
        this.cacheDir = path.join(process.env.HOME || '~', '.ollama-code', 'cache');
        this.cacheFile = path.join(this.cacheDir, 'ai-responses.json');
        this.initializeCache();
    }
    /**
     * Check cache for similar queries
     */
    async getCachedResponse(query, context = {}, model = 'default') {
        const startTime = performance.now();
        this.stats.totalQueries++;
        const queryHash = this.generateQueryHash(query, context, model);
        // Exact match first
        let entry = this.cache.get(queryHash);
        if (!entry) {
            // Try semantic similarity matching
            const similarEntry = await this.findSimilarQuery(query, context, model);
            entry = similarEntry || undefined;
        }
        if (entry) {
            entry.hits++;
            this.stats.hits++;
            this.stats.averageResponseTime = (this.stats.averageResponseTime + (performance.now() - startTime)) / 2;
            logger.debug(`Cache hit for query: ${query.substring(0, 50)}...`);
            return entry.response;
        }
        this.stats.misses++;
        logger.debug(`Cache miss for query: ${query.substring(0, 50)}...`);
        return null;
    }
    /**
     * Store AI response in cache
     */
    async cacheResponse(query, response, context = {}, model = 'default') {
        const queryHash = this.generateQueryHash(query, context, model);
        const entry = {
            query,
            context,
            response,
            timestamp: Date.now(),
            hits: 0,
            model,
            hash: queryHash
        };
        this.cache.set(queryHash, entry);
        // Store in memory manager for better memory handling
        if (this.memoryManager) {
            this.memoryManager.set(`ai-cache:${queryHash}`, entry, 3600000); // 1 hour TTL
        }
        logger.debug(`Cached AI response for: ${query.substring(0, 50)}...`);
        // Periodically persist to disk
        if (this.cache.size % 10 === 0) {
            await this.persistCache();
        }
    }
    /**
     * Warm cache with common queries
     */
    async warmCache(commonQueries) {
        logger.info('Warming AI response cache...');
        for (const { query, context = {}, model = 'default' } of commonQueries) {
            const cached = await this.getCachedResponse(query, context, model);
            if (!cached) {
                // This would trigger a real AI request in production
                logger.debug(`Cache warming needed for: ${query.substring(0, 50)}...`);
            }
        }
        logger.info('Cache warming completed');
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const hitRate = this.stats.totalQueries > 0
            ? (this.stats.hits / this.stats.totalQueries) * 100
            : 0;
        return {
            totalEntries: this.cache.size,
            hitRate,
            totalHits: this.stats.hits,
            totalMisses: this.stats.misses,
            cacheSize: this.cache.size * 1024, // Rough estimate
            averageResponseTime: this.stats.averageResponseTime
        };
    }
    /**
     * Clear cache
     */
    async clearCache() {
        this.cache.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            totalQueries: 0,
            averageResponseTime: 0
        };
        try {
            await fs.unlink(this.cacheFile);
            logger.info('AI cache cleared');
        }
        catch (error) {
            // File might not exist, that's okay
        }
    }
    /**
     * Optimize cache by removing old entries
     */
    optimizeCache() {
        const maxEntries = 1000;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = Date.now();
        if (this.cache.size <= maxEntries) {
            return;
        }
        // Convert to array and sort by usage and age
        const entries = Array.from(this.cache.entries())
            .map(([hashKey, entry]) => ({ hashKey, ...entry }))
            .filter(entry => now - entry.timestamp < maxAge)
            .sort((a, b) => {
            // Sort by hits (descending) then by timestamp (descending)
            if (a.hits !== b.hits) {
                return b.hits - a.hits;
            }
            return b.timestamp - a.timestamp;
        });
        // Keep only top entries
        this.cache.clear();
        for (let i = 0; i < Math.min(entries.length, maxEntries); i++) {
            const entry = entries[i];
            this.cache.set(entry.hashKey, {
                query: entry.query,
                context: entry.context,
                response: entry.response,
                timestamp: entry.timestamp,
                hits: entry.hits,
                model: entry.model,
                hash: entry.hash
            });
        }
        logger.info(`Cache optimized: kept ${this.cache.size} out of ${entries.length} entries`);
    }
    /**
     * Initialize cache from disk
     */
    async initializeCache() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            const data = await fs.readFile(this.cacheFile, 'utf-8');
            const entries = JSON.parse(data);
            for (const entry of entries) {
                this.cache.set(entry.hash, entry);
            }
            logger.debug(`Loaded ${entries.length} cached AI responses`);
        }
        catch (error) {
            // Cache file doesn't exist or is corrupted, start fresh
            logger.debug('Starting with empty AI cache');
        }
    }
    /**
     * Persist cache to disk
     */
    async persistCache() {
        try {
            const entries = Array.from(this.cache.values());
            await fs.writeFile(this.cacheFile, JSON.stringify(entries, null, 2));
            logger.debug(`Persisted ${entries.length} cache entries to disk`);
        }
        catch (error) {
            logger.error('Failed to persist AI cache:', error);
        }
    }
    /**
     * Generate hash for query + context + model
     */
    generateQueryHash(query, context, model) {
        const combined = JSON.stringify({ query: query.toLowerCase().trim(), context, model });
        return crypto.createHash('sha256').update(combined).digest('hex');
    }
    /**
     * Find similar queries using simple text similarity
     */
    async findSimilarQuery(query, context, model) {
        const normalizedQuery = query.toLowerCase().trim();
        const contextKeys = Object.keys(context).sort();
        let bestMatch = null;
        let bestScore = 0;
        for (const entry of this.cache.values()) {
            // Must be same model
            if (entry.model !== model)
                continue;
            // Check context similarity
            const entryContextKeys = Object.keys(entry.context).sort();
            const contextSimilarity = this.calculateContextSimilarity(contextKeys, entryContextKeys);
            if (contextSimilarity < 0.8)
                continue; // Context must be quite similar
            // Check query similarity
            const querySimilarity = this.calculateTextSimilarity(normalizedQuery, entry.query.toLowerCase().trim());
            const totalScore = (querySimilarity * 0.7) + (contextSimilarity * 0.3);
            if (totalScore > 0.85 && totalScore > bestScore) {
                bestScore = totalScore;
                bestMatch = entry;
            }
        }
        if (bestMatch) {
            logger.debug(`Found similar query with score ${bestScore.toFixed(2)}`);
        }
        return bestMatch;
    }
    /**
     * Calculate text similarity using simple word overlap
     */
    calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * Calculate context similarity
     */
    calculateContextSimilarity(keys1, keys2) {
        if (keys1.length === 0 && keys2.length === 0)
            return 1.0;
        if (keys1.length === 0 || keys2.length === 0)
            return 0.0;
        const set1 = new Set(keys1);
        const set2 = new Set(keys2);
        const intersection = new Set([...set1].filter(key => set2.has(key)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
    /**
     * Dispose of the AI cache manager and clean up resources
     */
    async dispose() {
        await this.persistCache();
        this.cache.clear();
        logger.debug('AI cache manager disposed');
    }
}
// Legacy export - use dependency injection instead
// export const aiCacheManager = AICacheManager.getInstance();
//# sourceMappingURL=ai-cache.js.map