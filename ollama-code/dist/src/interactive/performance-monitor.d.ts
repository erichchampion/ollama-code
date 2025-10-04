/**
 * Performance Monitoring System
 *
 * Tracks initialization timing, memory usage, component load times,
 * and overall system performance for interactive mode optimization.
 */
import { ComponentType } from './component-factory.js';
export interface PerformanceMetrics {
    initializationTime: number;
    memoryUsage: MemoryUsage;
    componentTimes: Map<ComponentType, ComponentTiming>;
    systemMetrics: SystemMetrics;
    benchmarks: BenchmarkResults;
}
export interface MemoryUsage {
    totalHeapUsed: number;
    totalHeapSize: number;
    externalMemory: number;
    rss: number;
    timestamp: Date;
}
export interface ComponentTiming {
    component: ComponentType;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'loading' | 'completed' | 'failed';
    memoryBefore: number;
    memoryAfter?: number;
    memoryDelta?: number;
}
export interface SystemMetrics {
    startupTime: number;
    readyTime: number;
    backgroundLoadTime: number;
    totalComponents: number;
    successfulComponents: number;
    failedComponents: number;
    averageComponentTime: number;
    peakMemoryUsage: number;
    cpuUsagePercent: number;
}
export interface BenchmarkResults {
    targets: PerformanceTargets;
    actual: ActualPerformance;
    scores: PerformanceScores;
    recommendations: string[];
}
export interface PerformanceTargets {
    maxStartupTime: number;
    maxMemoryUsage: number;
    maxComponentTime: number;
    minSuccessRate: number;
}
export interface ActualPerformance {
    startupTime: number;
    memoryUsage: number;
    maxComponentTime: number;
    successRate: number;
}
export interface PerformanceScores {
    startup: number;
    memory: number;
    reliability: number;
    overall: number;
}
/**
 * Comprehensive performance monitoring for interactive mode
 */
export declare class PerformanceMonitor {
    private startTime;
    private componentTimings;
    private memorySnapshots;
    private isMonitoring;
    private monitoringInterval?;
    private peakMemory;
    private readonly targets;
    constructor();
    /**
     * Start monitoring a component load
     */
    startComponentTiming(component: ComponentType): void;
    /**
     * End monitoring a component load
     */
    endComponentTiming(component: ComponentType, success: boolean): void;
    /**
     * Start continuous performance monitoring
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop continuous monitoring
     */
    stopMonitoring(): void;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get formatted performance report
     */
    getPerformanceReport(format?: 'summary' | 'detailed' | 'json'): string;
    /**
     * Check if performance targets are met
     */
    checkPerformanceTargets(): {
        allTargetsMet: boolean;
        results: Array<{
            target: string;
            met: boolean;
            actual: number;
            expected: number;
        }>;
    };
    /**
     * Get performance optimization recommendations
     */
    getRecommendations(): string[];
    /**
     * Export metrics for external analysis
     */
    exportMetrics(): string;
    /**
     * Reset all performance data
     */
    reset(): void;
    /**
     * Dispose of the performance monitor
     */
    dispose(): void;
    private getCurrentMemoryUsage;
    private takeMemorySnapshot;
    private updatePeakMemory;
    private calculateSystemMetrics;
    private calculateBenchmarks;
    private formatSummaryReport;
    private formatDetailedReport;
    private mapReplacer;
}
export declare function getPerformanceMonitor(): PerformanceMonitor;
export declare function resetPerformanceMonitor(): void;
