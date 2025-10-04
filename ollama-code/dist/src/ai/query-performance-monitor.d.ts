/**
 * Query Performance Monitor
 *
 * Comprehensive performance monitoring and benchmarking system for knowledge graph queries.
 * Provides real-time metrics, trend analysis, and optimization recommendations.
 *
 * Features:
 * - Real-time query performance tracking
 * - Historical performance trend analysis
 * - Query optimization recommendations
 * - Memory usage monitoring and alerts
 * - Bottleneck identification and reporting
 * - Performance regression detection
 */
export interface QueryMetrics {
    queryId: string;
    queryType: 'search' | 'pattern' | 'relationship' | 'statistics' | 'architectural';
    queryText: string;
    executionTime: number;
    memoryUsed: number;
    cpuTime: number;
    ioOperations: number;
    cacheHitRate: number;
    resultsCount: number;
    complexity: 'low' | 'medium' | 'high' | 'extreme';
    timestamp: Date;
    success: boolean;
    errorType?: string;
    optimizationOpportunities: OptimizationOpportunity[];
}
export interface OptimizationOpportunity {
    type: 'indexing' | 'caching' | 'query_rewrite' | 'partitioning' | 'memory';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    recommendation: string;
}
export interface PerformanceTrend {
    metric: keyof QueryMetrics;
    timeWindow: '1h' | '24h' | '7d' | '30d';
    trend: 'improving' | 'stable' | 'degrading';
    changePercent: number;
    significance: 'low' | 'medium' | 'high';
}
export interface PerformanceAlert {
    type: 'slow_query' | 'memory_spike' | 'cache_miss' | 'error_rate' | 'regression';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    queryId?: string;
    metric: string;
    threshold: number;
    actualValue: number;
    timestamp: Date;
    recommendations: string[];
}
export interface PerformanceBenchmark {
    queryType: string;
    p50ExecutionTime: number;
    p95ExecutionTime: number;
    p99ExecutionTime: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
    errorRate: number;
    sampleSize: number;
    lastUpdated: Date;
}
export interface SystemResource {
    cpuUsage: number;
    memoryUsage: number;
    memoryTotal: number;
    diskUsage: number;
    networkIO: number;
    timestamp: Date;
}
/**
 * Query Performance Monitor
 */
export declare class QueryPerformanceMonitor {
    private metrics;
    private benchmarks;
    private alerts;
    private resourceHistory;
    private isMonitoring;
    private resourceMonitorInterval?;
    private config;
    constructor();
    /**
     * Record a query execution
     */
    recordQuery(metrics: Omit<QueryMetrics, 'queryId' | 'timestamp' | 'optimizationOpportunities'>): string;
    /**
     * Get performance statistics
     */
    getPerformanceStats(timeWindow?: '1h' | '24h' | '7d' | '30d'): {
        totalQueries: number;
        averageExecutionTime: number;
        medianExecutionTime: number;
        p95ExecutionTime: number;
        successRate: number;
        averageMemoryUsage: number;
        cacheMissRate: number;
        queryTypeDistribution: Record<string, number>;
        slowestQueries: QueryMetrics[];
        mostCommonErrors: Record<string, number>;
    };
    /**
     * Get performance trends
     */
    getPerformanceTrends(): PerformanceTrend[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): PerformanceAlert[];
    /**
     * Get benchmarks for specific query types
     */
    getBenchmarks(): PerformanceBenchmark[];
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): OptimizationOpportunity[];
    /**
     * Get current system resource usage
     */
    getCurrentSystemResources(): SystemResource;
    /**
     * Start monitoring system resources
     */
    private startResourceMonitoring;
    /**
     * Stop monitoring
     */
    stop(): void;
    private generateQueryId;
    private analyzeOptimizationOpportunities;
    private checkForAlerts;
    private checkResourceAlerts;
    private updateBenchmarks;
    private getMetricsInTimeWindow;
    private getTimeWindowOffset;
    private calculateTrends;
    private average;
    private percentile;
}
