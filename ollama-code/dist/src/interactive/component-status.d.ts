/**
 * Component Status Tracking System
 *
 * Provides real-time monitoring, health checks, and diagnostics for
 * all interactive mode components with performance metrics.
 */
import { ComponentType, LoadProgress } from './component-factory.js';
import { EventEmitter } from 'events';
export type ComponentStatus = 'not-loaded' | 'loading' | 'ready' | 'failed' | 'degraded';
export interface ComponentHealth {
    component: ComponentType;
    status: ComponentStatus;
    lastCheck: Date;
    responseTime: number;
    errorCount: number;
    lastError?: Error;
    metrics: ComponentMetrics;
    dependencies: ComponentType[];
    capabilities: string[];
}
export interface ComponentMetrics {
    initTime: number;
    memoryUsage: number;
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
    lastOperationTime: Date;
}
export interface SystemHealth {
    overallStatus: 'healthy' | 'degraded' | 'critical';
    readyComponents: number;
    totalComponents: number;
    criticalComponentsReady: boolean;
    totalMemoryUsage: number;
    uptime: number;
    lastUpdate: Date;
}
export interface StatusDisplayOptions {
    format: 'table' | 'list' | 'summary' | 'json';
    showMetrics: boolean;
    showDependencies: boolean;
    filterStatus?: ComponentStatus[];
    sortBy?: 'name' | 'status' | 'responseTime' | 'memoryUsage';
}
/**
 * Real-time component status tracking and health monitoring
 */
export declare class ComponentStatusTracker extends EventEmitter {
    private componentHealth;
    private startTime;
    private criticalComponents;
    private healthCheckInterval?;
    private readonly HEALTH_CHECK_INTERVAL;
    constructor();
    /**
     * Update component status from load progress
     */
    updateFromProgress(progress: LoadProgress): void;
    /**
     * Mark component as degraded (partially functional)
     */
    markDegraded(component: ComponentType, reason: string): void;
    /**
     * Record successful operation for a component
     */
    recordSuccess(component: ComponentType, responseTime: number): void;
    /**
     * Record failed operation for a component
     */
    recordFailure(component: ComponentType, error: Error): void;
    /**
     * Get health status for a specific component
     */
    getComponentHealth(component: ComponentType): ComponentHealth | undefined;
    /**
     * Get overall system health
     */
    getSystemHealth(): SystemHealth;
    /**
     * Get status display string
     */
    getStatusDisplay(options?: StatusDisplayOptions): string;
    /**
     * Check if critical components are ready
     */
    areCriticalComponentsReady(): boolean;
    /**
     * Get components by status
     */
    getComponentsByStatus(status: ComponentStatus): ComponentType[];
    /**
     * Add a component dependency relationship
     */
    addDependency(component: ComponentType, dependency: ComponentType): void;
    /**
     * Check component dependencies are ready
     */
    areDependenciesReady(component: ComponentType): boolean;
    /**
     * Start background health checks
     */
    startHealthChecks(): void;
    /**
     * Stop background health checks
     */
    stopHealthChecks(): void;
    /**
     * Dispose of the status tracker
     */
    dispose(): void;
    private initializeHealthChecks;
    private performHealthCheck;
    private estimateComponentMemoryUsage;
    private createEmptyHealth;
    private getOrCreateHealth;
    private formatAsSummary;
    private formatAsTable;
    private formatAsList;
    private getStatusIcon;
    private formatTable;
}
export declare function getStatusTracker(): ComponentStatusTracker;
export declare function resetStatusTracker(): void;
