/**
 * Provider Performance Dashboard
 *
 * Provides comprehensive performance monitoring, analytics, and reporting
 * for AI provider usage, costs, and performance metrics.
 */
import { EventEmitter } from 'events';
import { ProviderManager, ProviderUsageStats, ProviderPerformanceMetrics, ProviderBudget } from './provider-manager.js';
export interface DashboardConfig {
    refreshInterval?: number;
    retentionDays?: number;
    alertThresholds?: {
        errorRate: number;
        responseTime: number;
        costPercentage: number;
    };
}
export interface DashboardSnapshot {
    timestamp: Date;
    providers: {
        [providerId: string]: {
            usage: ProviderUsageStats;
            performance: ProviderPerformanceMetrics;
            budget?: ProviderBudget;
            healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
            alerts: DashboardAlert[];
        };
    };
    summary: {
        totalRequests: number;
        totalCost: number;
        averageResponseTime: number;
        overallSuccessRate: number;
        activeProviders: number;
        healthyProviders: number;
    };
}
export interface DashboardAlert {
    id: string;
    providerId: string;
    type: 'error_rate' | 'response_time' | 'budget_exceeded' | 'provider_down' | 'quota_exceeded';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
}
export interface ProviderComparison {
    providerId: string;
    successRate: number;
    avgResponseTime: number;
    costPerRequest: number;
    reliability: number;
    score: number;
}
export interface CostAnalysis {
    providerId: string;
    dailyCost: number;
    monthlyCost: number;
    projectedMonthlyCost: number;
    costPerRequest: number;
    costPerToken: number;
    budgetUtilization: number;
    costTrend: 'increasing' | 'decreasing' | 'stable';
}
export declare class ProviderDashboard extends EventEmitter {
    private providerManager;
    private config;
    private alerts;
    private snapshots;
    private refreshTimer?;
    private eventHandlers;
    constructor(providerManager: ProviderManager, config?: DashboardConfig);
    /**
     * Set up event listeners from provider manager
     */
    private setupEventListeners;
    /**
     * Start periodic dashboard refresh
     */
    private startPeriodicRefresh;
    /**
     * Create a new alert
     */
    private createAlert;
    /**
     * Resolve alerts of a specific type for a provider
     */
    private resolveAlerts;
    /**
     * Check for alert conditions
     */
    private checkAlerts;
    /**
     * Get current dashboard snapshot
     */
    getCurrentSnapshot(): DashboardSnapshot;
    /**
     * Refresh dashboard data
     */
    refreshDashboard(): void;
    /**
     * Get provider performance comparison
     */
    getProviderComparison(): ProviderComparison[];
    /**
     * Get cost analysis for all providers
     */
    getCostAnalysis(): CostAnalysis[];
    /**
     * Get historical snapshots
     */
    getHistoricalSnapshots(days?: number): DashboardSnapshot[];
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Get all active alerts
     */
    getActiveAlerts(): DashboardAlert[];
    /**
     * Get alerts for a specific provider
     */
    getProviderAlerts(providerId: string): DashboardAlert[];
    /**
     * Generate dashboard report
     */
    generateReport(): {
        summary: DashboardSnapshot['summary'];
        topPerformers: ProviderComparison[];
        costBreakdown: CostAnalysis[];
        activeAlerts: DashboardAlert[];
        recommendations: string[];
    };
    /**
     * Export dashboard data
     */
    exportData(): {
        snapshots: DashboardSnapshot[];
        alerts: DashboardAlert[];
        config: DashboardConfig;
        exportedAt: Date;
    };
    /**
     * Dispose of dashboard resources
     */
    dispose(): void;
}
