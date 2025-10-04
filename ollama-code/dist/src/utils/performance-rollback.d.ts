/**
 * Performance Rollback System
 *
 * Monitors performance metrics and automatically rolls back optimizations
 * if performance regressions are detected.
 */
import { EventEmitter } from 'events';
export interface PerformanceBaseline {
    timestamp: number;
    metrics: {
        averageResponseTime: number;
        memoryUsage: number;
        cpuUsage: number;
        cacheHitRate: number;
        errorRate: number;
        throughput: number;
    };
    featureFlags: string[];
}
export interface PerformanceRegression {
    metric: string;
    baseline: number;
    current: number;
    degradation: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface RollbackConfig {
    enabled: boolean;
    autoRollback: boolean;
    regressionThresholds: {
        responseTime: number;
        memoryUsage: number;
        errorRate: number;
        throughput: number;
    };
    monitoringInterval: number;
    baselineWindow: number;
    cooldownPeriod: number;
}
/**
 * Performance Rollback Manager
 */
export declare class PerformanceRollbackManager extends EventEmitter {
    private static instance;
    private baselines;
    private currentMetrics;
    private config;
    private monitoringInterval?;
    private rollbackHistory;
    private cooldownFlags;
    private constructor();
    static getInstance(): PerformanceRollbackManager;
    private createEmptyMetrics;
    /**
     * Start monitoring for performance regressions
     */
    startMonitoring(): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Capture a performance baseline
     */
    captureBaseline(name: string): void;
    /**
     * Update current metrics
     */
    updateMetrics(metrics: Partial<PerformanceBaseline['metrics']>): void;
    /**
     * Check for performance regressions
     */
    private checkForRegressions;
    /**
     * Detect regressions between baseline and current metrics
     */
    private detectRegressions;
    /**
     * Calculate regression severity
     */
    private calculateSeverity;
    /**
     * Handle detected regressions
     */
    private handleRegressions;
    /**
     * Perform automatic rollback
     */
    private performRollback;
    /**
     * Identify which feature flags are likely causing regressions
     */
    private identifyProblematicFlags;
    /**
     * Get recently enabled feature flags
     */
    private getRecentlyEnabledFlags;
    /**
     * Check and re-enable flags after cooldown
     */
    private checkCooldowns;
    /**
     * Get rollback history
     */
    getRollbackHistory(): typeof this.rollbackHistory;
    /**
     * Clear rollback history
     */
    clearHistory(): void;
    /**
     * Manual rollback of specific flags
     */
    manualRollback(flags: string[]): void;
    /**
     * Configure rollback settings
     */
    configure(config: Partial<RollbackConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): RollbackConfig;
    /**
     * Get status report
     */
    getStatusReport(): string;
}
export declare const rollbackManager: PerformanceRollbackManager;
