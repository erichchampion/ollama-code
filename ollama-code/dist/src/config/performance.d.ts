/**
 * Performance Optimization Configuration
 *
 * Centralizes all performance-related configuration options for Phase 6 components.
 * Provides environment-specific defaults and validation.
 */
export interface DistributedAnalysisConfig {
    maxWorkers: number;
    chunkSizeTarget: number;
    memoryLimitPerWorkerMB: number;
    timeoutPerChunkSeconds: number;
    retryAttempts: number;
    enableAdaptiveChunking: boolean;
    loadBalancingStrategy: 'round_robin' | 'priority' | 'adaptive';
    dependencyLimit: number;
    complexityThresholds: {
        high: number;
        medium: number;
    };
    simulationDelayMs: number;
}
export interface CacheConfig {
    maxMemoryMB: number;
    maxDiskMB: number;
    defaultTTLMs: number;
    compressionThresholdBytes: number;
    evictionRatio: number;
    warmupEnabled: boolean;
    memoryPressureThreshold: number;
    diskCacheDir?: string;
}
export interface FileComplexityConfig {
    typeMultipliers: Record<string, number>;
    baseSizeWeight: number;
    priorityPatterns: {
        high: string[];
        medium: string[];
    };
}
export interface IndexingConfig {
    btreeOrder: number;
    fullTextSearchDefaultLimit: number;
    spatialIndexMaxEntries: number;
}
export interface StorageConfig {
    cacheMaxSizeBytes: number;
    partitionMaxSizeBytes: number;
    compressionThresholdBytes: number;
    memoryMapThresholdBytes: number;
    cleanupIntervalMs: number;
    compressionLevel: number;
}
export interface MonitoringConfig {
    metricsCollectionIntervalMs: number;
    trendAnalysisIntervalMs: number;
    alertCheckIntervalMs: number;
    recommendationIntervalMs: number;
    dataRetentionDays: number;
}
export interface PerformanceThresholds {
    responseTime: {
        warning: number;
        critical: number;
    };
    memoryUsage: {
        warning: number;
        critical: number;
    };
    cpuUsage: {
        warning: number;
        critical: number;
    };
    startupTime: {
        warning: number;
        critical: number;
    };
    cacheHitRate: {
        warning: number;
        critical: number;
    };
}
export interface FilePatterns {
    excludePatterns: string[];
    includePatterns: string[];
    highPriorityPatterns: string[];
    mediumPriorityPatterns: string[];
}
export interface PerformanceConfig {
    distributedAnalysis: DistributedAnalysisConfig;
    cache: CacheConfig;
    fileComplexity: FileComplexityConfig;
    indexing: IndexingConfig;
    storage: StorageConfig;
    monitoring: MonitoringConfig;
    thresholds: PerformanceThresholds;
    filePatterns: FilePatterns;
}
/**
 * Get performance configuration based on environment
 */
export declare function getPerformanceConfig(): PerformanceConfig;
/**
 * Validate configuration values
 */
export declare function validatePerformanceConfig(config: PerformanceConfig): string[];
