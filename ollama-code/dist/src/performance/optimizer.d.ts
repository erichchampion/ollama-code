/**
 * Performance Optimization System
 *
 * Provides performance monitoring and optimization including:
 * - Memory usage tracking and optimization
 * - Response time monitoring
 * - Cache management and optimization
 * - Resource cleanup and garbage collection
 * - Performance analytics and reporting
 */
export interface PerformanceMetrics {
    memory: {
        used: number;
        total: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    timing: {
        startup: number;
        lastCommand: number;
        averageResponse: number;
    };
    cache: {
        hitRate: number;
        size: number;
        maxSize: number;
    };
    commands: {
        total: number;
        successful: number;
        failed: number;
    };
}
export interface OptimizationReport {
    overall: 'excellent' | 'good' | 'moderate' | 'poor';
    recommendations: string[];
    metrics: PerformanceMetrics;
    issues: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        solution: string;
    }>;
}
export interface CacheEntry {
    key: string;
    value: any;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    ttl?: number;
}
export declare class PerformanceOptimizer {
    private startTime;
    private commandMetrics;
    private cache;
    private maxCacheSize;
    private cleanupInterval;
    constructor(maxCacheSize?: number);
    /**
     * Initialize performance optimizations
     */
    private initializeOptimizations;
    /**
     * Track command execution metrics
     */
    trackCommand(commandName: string, executionTime: number, success: boolean): void;
    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Analyze performance and generate optimization report
     */
    analyzePerformance(): Promise<OptimizationReport>;
    /**
     * Cache management
     */
    setCache(key: string, value: any, ttl?: number): void;
    getCache(key: string): any;
    clearCache(): void;
    /**
     * Force garbage collection if available
     */
    forceGarbageCollection(): boolean;
    /**
     * Optimize memory usage
     */
    optimizeMemory(): Promise<void>;
    /**
     * Get resource usage summary
     */
    getResourceSummary(): any;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Periodic cleanup operations
     */
    private performCleanup;
    /**
     * Clear expired cache entries
     */
    private clearExpiredCache;
    /**
     * Cleanup old command metrics
     */
    private cleanupCommandMetrics;
    /**
     * Evict oldest cache entries
     */
    private evictOldestEntries;
    /**
     * Get last command execution time
     */
    private getLastCommandTime;
    /**
     * Setup memory monitoring
     */
    private setupMemoryMonitoring;
    /**
     * Format uptime for display
     */
    private formatUptime;
}
/**
 * Default performance optimizer instance
 */
export declare const performanceOptimizer: PerformanceOptimizer;
