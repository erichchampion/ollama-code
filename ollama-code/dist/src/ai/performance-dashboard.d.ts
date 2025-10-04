/**
 * Performance Monitoring Dashboard
 *
 * Centralized performance monitoring and analytics for Phase 6 optimizations:
 * - Real-time performance metrics collection
 * - Historical trend analysis
 * - Bottleneck identification and alerts
 * - Resource usage monitoring
 * - Optimization recommendations
 * - Integration with all Phase 6 components
 */
import { ManagedEventEmitter } from '../utils/managed-event-emitter.js';
export interface PerformanceMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        userTime: number;
        systemTime: number;
    };
    memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
        maxHeapUsed: number;
    };
    eventLoop: {
        lag: number;
        utilization: number;
    };
    gc: {
        frequency: number;
        averageDuration: number;
        totalPauseTime: number;
    };
    network: {
        requestsPerSecond: number;
        averageResponseTime: number;
        errorRate: number;
    };
    cache: {
        hitRate: number;
        missRate: number;
        size: number;
        evictions: number;
    };
    startup: {
        lastStartupTime: number;
        averageStartupTime: number;
        moduleLoadTime: number;
    };
    streaming: {
        activeStreams: number;
        completedStreams: number;
        averageStreamDuration: number;
        tokensPerSecond: number;
    };
}
export interface PerformanceThresholds {
    cpu: {
        warning: number;
        critical: number;
    };
    memory: {
        warning: number;
        critical: number;
    };
    responseTime: {
        warning: number;
        critical: number;
    };
    cacheHitRate: {
        warning: number;
        critical: number;
    };
    startupTime: {
        warning: number;
        critical: number;
    };
    errorRate: {
        warning: number;
        critical: number;
    };
}
export interface PerformanceAlert {
    id: string;
    type: 'warning' | 'critical';
    category: 'cpu' | 'memory' | 'network' | 'cache' | 'startup' | 'streaming';
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    resolved: boolean;
    resolutionTime?: Date;
}
export interface OptimizationRecommendation {
    id: string;
    category: 'performance' | 'memory' | 'cache' | 'startup' | 'streaming';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    implementation: string;
    estimatedImprovement: number;
    confidence: number;
    timestamp: Date;
}
export interface PerformanceTrend {
    metric: string;
    timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
    direction: 'improving' | 'degrading' | 'stable';
    changePercent: number;
    dataPoints: Array<{
        timestamp: Date;
        value: number;
    }>;
}
export interface DashboardConfig {
    metricsCollectionInterval: number;
    trendAnalysisInterval: number;
    alertCheckInterval: number;
    recommendationInterval: number;
    dataRetentionDays: number;
    enableRealTimeUpdates: boolean;
    enablePredictiveAnalysis: boolean;
    thresholds: PerformanceThresholds;
}
/**
 * Main performance monitoring dashboard
 */
export declare class PerformanceDashboard extends ManagedEventEmitter {
    private config;
    private metricsHistory;
    private alerts;
    private recommendations;
    private trends;
    private isMonitoring;
    private intervalHandles;
    private requestCounter;
    private responseTimeSum;
    private errorCounter;
    private lastMetricsCollection;
    constructor(config?: Partial<DashboardConfig>);
    /**
     * Start performance monitoring
     */
    startMonitoring(): void;
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): void;
    /**
     * Get current performance snapshot
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * Get performance metrics history
     */
    getMetricsHistory(timeRange?: '1h' | '6h' | '24h' | '7d'): PerformanceMetrics[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): PerformanceAlert[];
    /**
     * Get all alerts (including resolved)
     */
    getAllAlerts(): PerformanceAlert[];
    /**
     * Get optimization recommendations
     */
    getRecommendations(priority?: 'low' | 'medium' | 'high' | 'critical'): OptimizationRecommendation[];
    /**
     * Get performance trends
     */
    getTrends(metric?: string): PerformanceTrend[];
    /**
     * Get comprehensive dashboard summary
     */
    getDashboardSummary(): {
        metrics: PerformanceMetrics;
        alerts: PerformanceAlert[];
        recommendations: OptimizationRecommendation[];
        trends: PerformanceTrend[];
        health: {
            overall: 'good' | 'warning' | 'critical';
            scores: Record<string, number>;
        };
    };
    /**
     * Manually trigger recommendation generation
     */
    generateOptimizationReport(): Promise<{
        recommendations: OptimizationRecommendation[];
        trends: PerformanceTrend[];
        summary: string;
    }>;
    /**
     * Record custom performance event
     */
    recordEvent(category: string, metric: string, value: number, metadata?: Record<string, any>): void;
    private initializeMetricsCollection;
    private collectMetrics;
    private calculateCpuPercentage;
    private measureEventLoopLag;
    private getCacheMetrics;
    private getStartupMetrics;
    private getStreamingMetrics;
    private calculateNetworkMetrics;
    private checkAlerts;
    private checkThresholdAlert;
    private checkReverseThresholdAlert;
    private createAlert;
    private resolveAlert;
    private analyzeTrends;
    private analyzeTrendForMetric;
    private getMetricValue;
    private generateRecommendations;
    private generateMetricBasedRecommendations;
    private generateTrendBasedRecommendations;
    private generateAlertBasedRecommendations;
    private addRecommendation;
    private calculateHealthScore;
    private calculateComponentScore;
    private calculateReverseComponentScore;
    private generateReportSummary;
    private cleanupOldMetrics;
}
export declare const globalPerformanceDashboard: PerformanceDashboard;
