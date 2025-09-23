/**
 * Predictive AI Cache System
 *
 * Implements intelligent caching and prefetching for AI responses based on
 * user behavior patterns, context analysis, and predictive algorithms.
 * Designed to achieve 80% faster cached responses and >80% cache hit rates.
 */
import { EventEmitter } from 'events';
import { CachePriority as MemoryCachePriority } from './memory-optimizer.js';
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: Date;
    accessCount: number;
    lastAccessed: Date;
    ttl: number;
    metadata: CacheMetadata;
    priority: MemoryCachePriority;
    tags: string[];
}
export interface CacheMetadata {
    queryType: 'code_generation' | 'explanation' | 'fix' | 'refactor' | 'analysis';
    complexity: 'simple' | 'medium' | 'complex';
    language?: string;
    fileType?: string;
    contextSize: number;
    responseSize: number;
    computeTime: number;
    userProfile?: string;
    projectContext?: string;
}
export declare const CachePriority: typeof MemoryCachePriority;
export interface UserBehaviorPattern {
    userId: string;
    commonQueries: string[];
    frequentLanguages: string[];
    preferredQueryTypes: string[];
    sessionPatterns: {
        averageSessionLength: number;
        peakUsageHours: number[];
        commonWorkflows: string[];
    };
    contextPatterns: {
        projectTypes: string[];
        filePatterns: string[];
        codebaseSize: 'small' | 'medium' | 'large';
    };
}
export interface PredictionModel {
    type: 'sequence' | 'context' | 'similarity' | 'temporal';
    confidence: number;
    predictions: CachePrediction[];
    lastUpdated: Date;
}
export interface CachePrediction {
    queryHash: string;
    probability: number;
    estimatedAccessTime: Date;
    context: Record<string, any>;
    reasoning: string;
}
export interface CacheAnalytics {
    hitRate: number;
    missRate: number;
    averageResponseTime: number;
    predictiveAccuracy: number;
    totalRequests: number;
    cachedRequests: number;
    prefetchedRequests: number;
    memoryUsage: number;
    topQueries: Array<{
        query: string;
        count: number;
    }>;
}
/**
 * Predictive AI Caching System
 *
 * Provides intelligent caching with context-aware prefetching and
 * machine learning-based prediction of user queries.
 */
export declare class PredictiveAICache extends EventEmitter {
    private config;
    private cache;
    private userPatterns;
    private predictionModels;
    private querySequences;
    private contextSimilarity;
    private analytics;
    private prefetchQueue;
    private isProcessingPrefetch;
    constructor(config?: {
        maxCacheSize: number;
        defaultTTL: number;
        maxPrefetchQueue: number;
        predictionThreshold: number;
        enableBackgroundPrefetch: boolean;
    });
    /**
     * Get cached response or predict and prefetch likely queries
     */
    get<T>(query: string, context?: Record<string, any>, userId?: string): Promise<CacheEntry<T> | null>;
    /**
     * Store response in cache with intelligent metadata
     */
    set<T>(query: string, response: T, context?: Record<string, any>, metadata?: Partial<CacheMetadata>, userId?: string, ttl?: number): Promise<void>;
    /**
     * Predict and prefetch likely queries based on current context
     */
    predictAndPrefetch(userId: string, currentQuery: string, context: Record<string, any>, aiResponseFunction: (query: string, ctx: Record<string, any>) => Promise<any>): Promise<CachePrediction[]>;
    /**
     * Generate predictions based on user patterns and context
     */
    private generatePredictions;
    /**
     * Generate sequence-based predictions using query history
     */
    private generateSequencePredictions;
    /**
     * Generate context-based predictions
     */
    private generateContextPredictions;
    /**
     * Generate similarity-based predictions
     */
    private generateSimilarityPredictions;
    /**
     * Generate temporal predictions based on time patterns
     */
    private generateTemporalPredictions;
    /**
     * Process prefetch queue in background
     */
    private processPrefetchQueue;
    /**
     * Update user behavior patterns
     */
    private updateUserPatterns;
    /**
     * Calculate cache priority based on query characteristics
     */
    private calculatePriority;
    /**
     * Generate cache entry tags for organization and retrieval
     */
    private generateTags;
    /**
     * Generate deterministic hash for query + context
     */
    private generateQueryHash;
    /**
     * Generate context key for similarity mapping
     */
    private generateContextKey;
    /**
     * Get analytics and performance metrics
     */
    getAnalytics(): CacheAnalytics;
    /**
     * Clear cache and reset analytics
     */
    clear(): Promise<void>;
    /**
     * Start background prefetching process
     */
    private startBackgroundPrefetching;
    private findCommonNextQueries;
    private getCommonQueriesForContext;
    private updateContextSimilarity;
    private deduplicatePredictions;
    private decodeQueryHash;
    private updateHitRate;
    private updateMissRate;
    private updateAverageResponseTime;
}
export declare const globalPredictiveCache: PredictiveAICache;
