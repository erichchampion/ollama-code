/**
 * Optimized Knowledge Graph
 *
 * High-performance knowledge graph that combines incremental indexing,
 * intelligent partitioning, and advanced query optimization for enterprise-scale
 * codebases. Provides sub-second response times and efficient memory usage.
 *
 * Features:
 * - Incremental indexing with change detection
 * - Intelligent graph partitioning for memory optimization
 * - Advanced query optimization with parallel processing
 * - Predictive caching and prefetching
 * - Performance monitoring and metrics
 * - Automatic scaling and optimization
 */
import { IncrementalKnowledgeGraph, FileChange, IncrementalUpdateResult } from './incremental-knowledge-graph.js';
import { PartitionStrategy, MemoryManager } from './graph-partitioning.js';
import { GraphConfig, GraphQueryResult, GraphQuery } from './code-knowledge-graph.js';
import { ProjectContext } from './context.js';
export interface OptimizedGraphConfig extends GraphConfig {
    enablePartitioning: boolean;
    partitioningStrategy: Partial<PartitionStrategy>;
    memoryManagement: Partial<MemoryManager>;
    queryOptimization: QueryOptimizationConfig;
    performanceMonitoring: PerformanceMonitoringConfig;
}
export interface QueryOptimizationConfig {
    enableParallelQueries: boolean;
    enableQueryPlanOptimization: boolean;
    maxConcurrentQueries: number;
    queryTimeout: number;
    enableSmartIndexing: boolean;
    indexUpdateInterval: number;
}
export interface PerformanceMonitoringConfig {
    enableMetrics: boolean;
    metricsInterval: number;
    enableAlerts: boolean;
    performanceThresholds: PerformanceThresholds;
}
export interface PerformanceThresholds {
    maxQueryTime: number;
    maxMemoryUsage: number;
    maxIndexingTime: number;
    minCacheHitRate: number;
}
export interface OptimizedQueryResult extends GraphQueryResult {
    partitionsAccessed: string[];
    cacheUtilization: number;
    parallelization: {
        enabled: boolean;
        threadsUsed: number;
        speedup: number;
    };
    optimization: {
        indexesUsed: string[];
        queryPlanOptimized: boolean;
        estimatedComplexity: 'low' | 'medium' | 'high';
    };
}
export interface PerformanceMetrics {
    graph: {
        totalNodes: number;
        totalEdges: number;
        totalPartitions: number;
        loadedPartitions: number;
        memoryUsage: number;
        memoryEfficiency: number;
    };
    queries: {
        totalQueries: number;
        avgQueryTime: number;
        cacheHitRate: number;
        parallelQueries: number;
        slowQueries: number;
    };
    indexing: {
        incrementalUpdates: number;
        avgUpdateTime: number;
        fullRebuilds: number;
        avgRebuildTime: number;
        changeDetectionTime: number;
    };
    optimization: {
        autoOptimizations: number;
        lastOptimization: Date;
        performanceGain: number;
        bottlenecks: string[];
    };
}
/**
 * Optimized Knowledge Graph Implementation
 *
 * Enterprise-grade knowledge graph with advanced performance optimizations,
 * intelligent memory management, and real-time monitoring capabilities.
 */
export declare class OptimizedKnowledgeGraph extends IncrementalKnowledgeGraph {
    private partitionManager;
    private queryIndexes;
    private optimizedConfig;
    private performanceMetrics;
    private queryQueue;
    private backgroundOptimizer?;
    constructor(aiClient: any, projectContext: ProjectContext, config?: Partial<OptimizedGraphConfig>);
    /**
     * Initialize the optimized knowledge graph
     */
    initialize(): Promise<void>;
    /**
     * Initialize graph partitioning
     */
    private initializePartitioning;
    /**
     * Build query optimization indexes
     */
    private buildQueryIndexes;
    /**
     * Optimized query execution with parallel processing and smart indexing
     */
    queryGraph(query: string, options?: Partial<GraphQuery>): Promise<OptimizedQueryResult>;
    /**
     * Execute optimized query with all performance enhancements
     */
    private executeOptimizedQuery;
    /**
     * Execute query using smart indexes
     */
    private executeIndexedQuery;
    /**
     * Enhanced incremental indexing with partition awareness
     */
    indexDelta(changes: FileChange[]): Promise<IncrementalUpdateResult>;
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Trigger manual optimization
     */
    optimizePerformance(): Promise<{
        optimizationsApplied: string[];
        performanceGain: number;
        newBottlenecks: string[];
    }>;
    /**
     * Helper methods for optimization
     */
    private buildNodeTypeIndex;
    private buildPropertyIndex;
    private buildCompositeIndex;
    private optimizeQueryPlan;
    private matchesQuery;
    private buildQueryResult;
    private generateQueryId;
    private getAccessedPartitions;
    private getUsedIndexes;
    private estimateQueryComplexity;
    private updatePartitions;
    private updateQueryIndexes;
    private startBackgroundOptimization;
    private startPerformanceMonitoring;
    private updatePerformanceMetrics;
    private checkPerformanceThresholds;
    private updateQueryMetrics;
    private optimizePartitions;
    private rebuildQueryIndexes;
    private optimizeCaches;
    private detectBottlenecks;
    private calculatePerformanceGain;
    private calculateOptimizedQueryConfidence;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
