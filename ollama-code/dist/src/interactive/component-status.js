/**
 * Component Status Tracking System
 *
 * Provides real-time monitoring, health checks, and diagnostics for
 * all interactive mode components with performance metrics.
 */
import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';
import { COMPONENT_STATUSES, COMPONENT_STATUS_CONFIG, DEFAULT_COMPONENT_MEMORY, DEFAULT_FALLBACK_MEMORY } from '../constants/component-status.js';
/**
 * Real-time component status tracking and health monitoring
 */
export class ComponentStatusTracker extends EventEmitter {
    componentHealth = new Map();
    startTime = Date.now();
    criticalComponents = new Set(['aiClient', 'intentAnalyzer', 'conversationManager']);
    healthCheckInterval;
    HEALTH_CHECK_INTERVAL = COMPONENT_STATUS_CONFIG.HEALTH_CHECK_INTERVAL;
    constructor() {
        super();
        this.initializeHealthChecks();
    }
    /**
     * Update component status from load progress
     */
    updateFromProgress(progress) {
        const component = progress.component;
        const existing = this.componentHealth.get(component) || this.createEmptyHealth(component);
        // Update status
        switch (progress.status) {
            case COMPONENT_STATUSES.LOADING:
                existing.status = COMPONENT_STATUSES.LOADING;
                break;
            case COMPONENT_STATUSES.READY:
                existing.status = COMPONENT_STATUSES.READY;
                existing.metrics.initTime = progress.endTime - progress.startTime;
                existing.metrics.successfulOperations++;
                break;
            case COMPONENT_STATUSES.FAILED:
                existing.status = COMPONENT_STATUSES.FAILED;
                existing.errorCount++;
                existing.lastError = progress.error;
                existing.metrics.failedOperations++;
                break;
        }
        existing.lastCheck = new Date();
        existing.responseTime = progress.endTime ? progress.endTime - progress.startTime : 0;
        existing.metrics.lastOperationTime = new Date();
        this.componentHealth.set(component, existing);
        this.emit('statusChanged', component, existing);
        logger.debug(`Component ${component} status updated: ${existing.status}`);
    }
    /**
     * Mark component as degraded (partially functional)
     */
    markDegraded(component, reason) {
        const health = this.getOrCreateHealth(component);
        health.status = COMPONENT_STATUSES.DEGRADED;
        health.lastCheck = new Date();
        health.lastError = new Error(`Degraded: ${reason}`);
        this.componentHealth.set(component, health);
        this.emit('statusChanged', component, health);
        logger.warn(`Component ${component} marked as degraded: ${reason}`);
    }
    /**
     * Record successful operation for a component
     */
    recordSuccess(component, responseTime) {
        const health = this.getOrCreateHealth(component);
        health.metrics.successfulOperations++;
        health.metrics.lastOperationTime = new Date();
        health.responseTime = responseTime;
        // Update average response time
        const total = health.metrics.successfulOperations + health.metrics.failedOperations;
        health.metrics.averageResponseTime =
            (health.metrics.averageResponseTime * (total - 1) + responseTime) / total;
        this.componentHealth.set(component, health);
    }
    /**
     * Record failed operation for a component
     */
    recordFailure(component, error) {
        const health = this.getOrCreateHealth(component);
        health.metrics.failedOperations++;
        health.errorCount++;
        health.lastError = error;
        health.metrics.lastOperationTime = new Date();
        // Consider component degraded after multiple failures
        if (health.errorCount >= COMPONENT_STATUS_CONFIG.DEGRADATION_THRESHOLD && health.status === COMPONENT_STATUSES.READY) {
            health.status = COMPONENT_STATUSES.DEGRADED;
            this.emit('componentDegraded', component, health);
        }
        this.componentHealth.set(component, health);
        this.emit('operationFailed', component, error);
    }
    /**
     * Get health status for a specific component
     */
    getComponentHealth(component) {
        return this.componentHealth.get(component);
    }
    /**
     * Get overall system health
     */
    getSystemHealth() {
        const components = Array.from(this.componentHealth.values());
        const readyComponents = components.filter(c => c.status === COMPONENT_STATUSES.READY).length;
        const totalComponents = components.length;
        const criticalReady = Array.from(this.criticalComponents).every(component => {
            const health = this.componentHealth.get(component);
            return health && (health.status === COMPONENT_STATUSES.READY || health.status === COMPONENT_STATUSES.DEGRADED);
        });
        const totalMemory = components.reduce((sum, c) => sum + c.metrics.memoryUsage, 0);
        let overallStatus;
        if (!criticalReady) {
            overallStatus = 'critical';
        }
        else if (readyComponents < totalComponents * COMPONENT_STATUS_CONFIG.SYSTEM_HEALTH_THRESHOLD) {
            overallStatus = 'degraded';
        }
        else {
            overallStatus = 'healthy';
        }
        return {
            overallStatus,
            readyComponents,
            totalComponents,
            criticalComponentsReady: criticalReady,
            totalMemoryUsage: totalMemory,
            uptime: Date.now() - this.startTime,
            lastUpdate: new Date()
        };
    }
    /**
     * Get status display string
     */
    getStatusDisplay(options = { format: 'summary', showMetrics: false, showDependencies: false }) {
        const components = Array.from(this.componentHealth.values());
        // Filter components if specified
        let filteredComponents = components;
        if (options.filterStatus) {
            filteredComponents = components.filter(c => options.filterStatus.includes(c.status));
        }
        // Sort components
        if (options.sortBy) {
            filteredComponents.sort((a, b) => {
                switch (options.sortBy) {
                    case 'name':
                        return a.component.localeCompare(b.component);
                    case 'status':
                        return a.status.localeCompare(b.status);
                    case 'responseTime':
                        return b.responseTime - a.responseTime;
                    case 'memoryUsage':
                        return b.metrics.memoryUsage - a.metrics.memoryUsage;
                    default:
                        return 0;
                }
            });
        }
        switch (options.format) {
            case 'json':
                return JSON.stringify({
                    systemHealth: this.getSystemHealth(),
                    components: filteredComponents
                }, null, 2);
            case 'table':
                return this.formatAsTable(filteredComponents, options);
            case 'list':
                return this.formatAsList(filteredComponents, options);
            case 'summary':
            default:
                return this.formatAsSummary();
        }
    }
    /**
     * Check if critical components are ready
     */
    areCriticalComponentsReady() {
        return Array.from(this.criticalComponents).every(component => {
            const health = this.componentHealth.get(component);
            return health && health.status === COMPONENT_STATUSES.READY;
        });
    }
    /**
     * Get components by status
     */
    getComponentsByStatus(status) {
        return Array.from(this.componentHealth.entries())
            .filter(([, health]) => health.status === status)
            .map(([component]) => component);
    }
    /**
     * Add a component dependency relationship
     */
    addDependency(component, dependency) {
        const health = this.getOrCreateHealth(component);
        if (!health.dependencies.includes(dependency)) {
            health.dependencies.push(dependency);
            this.componentHealth.set(component, health);
        }
    }
    /**
     * Check component dependencies are ready
     */
    areDependenciesReady(component) {
        const health = this.componentHealth.get(component);
        if (!health || health.dependencies.length === 0) {
            return true;
        }
        return health.dependencies.every(dep => {
            const depHealth = this.componentHealth.get(dep);
            return depHealth && (depHealth.status === COMPONENT_STATUSES.READY || depHealth.status === COMPONENT_STATUSES.DEGRADED);
        });
    }
    /**
     * Start background health checks
     */
    startHealthChecks() {
        if (this.healthCheckInterval) {
            return; // Already running
        }
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.HEALTH_CHECK_INTERVAL);
        logger.debug('Component health checks started');
    }
    /**
     * Stop background health checks
     */
    stopHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
            logger.debug('Component health checks stopped');
        }
    }
    /**
     * Dispose of the status tracker
     */
    dispose() {
        this.stopHealthChecks();
        this.componentHealth.clear();
        this.removeAllListeners();
    }
    // Private methods
    initializeHealthChecks() {
        // Start health checks after a short delay
        setTimeout(() => {
            this.startHealthChecks();
        }, COMPONENT_STATUS_CONFIG.HEALTH_CHECK_DELAY);
    }
    performHealthCheck() {
        for (const [component, health] of this.componentHealth) {
            if (health.status === COMPONENT_STATUSES.READY || health.status === COMPONENT_STATUSES.DEGRADED) {
                // Update memory usage (simplified estimation)
                health.metrics.memoryUsage = this.estimateComponentMemoryUsage(component);
                health.lastCheck = new Date();
            }
        }
        this.emit('healthCheckCompleted', this.getSystemHealth());
    }
    estimateComponentMemoryUsage(component) {
        // Use configurable memory estimates
        return DEFAULT_COMPONENT_MEMORY[component] || DEFAULT_FALLBACK_MEMORY;
    }
    createEmptyHealth(component) {
        return {
            component,
            status: COMPONENT_STATUSES.NOT_LOADED,
            lastCheck: new Date(),
            responseTime: 0,
            errorCount: 0,
            metrics: {
                initTime: 0,
                memoryUsage: 0,
                successfulOperations: 0,
                failedOperations: 0,
                averageResponseTime: 0,
                lastOperationTime: new Date()
            },
            dependencies: [],
            capabilities: []
        };
    }
    getOrCreateHealth(component) {
        let health = this.componentHealth.get(component);
        if (!health) {
            health = this.createEmptyHealth(component);
            this.componentHealth.set(component, health);
        }
        return health;
    }
    formatAsSummary() {
        const systemHealth = this.getSystemHealth();
        const statusIcon = {
            healthy: '✅',
            degraded: '⚠️',
            critical: '❌'
        }[systemHealth.overallStatus];
        const uptimeSeconds = Math.floor(systemHealth.uptime / 1000);
        const uptimeDisplay = uptimeSeconds > 60
            ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
            : `${uptimeSeconds}s`;
        return [
            `${statusIcon} System Status: ${systemHealth.overallStatus.toUpperCase()}`,
            `📊 Components: ${systemHealth.readyComponents}/${systemHealth.totalComponents} ready`,
            `⏱️  Uptime: ${uptimeDisplay}`,
            `💾 Memory: ${systemHealth.totalMemoryUsage.toFixed(1)}MB`,
            `🔧 Critical: ${systemHealth.criticalComponentsReady ? 'Ready' : 'Not Ready'}`
        ].join('\\n');
    }
    formatAsTable(components, options) {
        const headers = ['Component', 'Status'];
        if (options.showMetrics) {
            headers.push('Response Time', 'Memory', 'Success/Fail');
        }
        if (options.showDependencies) {
            headers.push('Dependencies');
        }
        const rows = components.map(health => {
            const row = [
                health.component,
                this.getStatusIcon(health.status) + ' ' + health.status
            ];
            if (options.showMetrics) {
                row.push(`${health.responseTime}ms`, `${health.metrics.memoryUsage.toFixed(1)}MB`, `${health.metrics.successfulOperations}/${health.metrics.failedOperations}`);
            }
            if (options.showDependencies) {
                row.push(health.dependencies.join(', ') || 'None');
            }
            return row;
        });
        return this.formatTable([headers, ...rows]);
    }
    formatAsList(components, options) {
        return components.map(health => {
            const icon = this.getStatusIcon(health.status);
            let line = `${icon} ${health.component}: ${health.status}`;
            if (options.showMetrics) {
                line += ` (${health.responseTime}ms, ${health.metrics.memoryUsage.toFixed(1)}MB)`;
            }
            if (options.showDependencies && health.dependencies.length > 0) {
                line += ` [deps: ${health.dependencies.join(', ')}]`;
            }
            return line;
        }).join('\\n');
    }
    getStatusIcon(status) {
        const icons = {
            'not-loaded': '⚪',
            'loading': '🔄',
            'ready': '✅',
            'failed': '❌',
            'degraded': '⚠️'
        };
        return icons[status];
    }
    formatTable(rows) {
        if (rows.length === 0)
            return '';
        // Calculate column widths
        const colWidths = rows[0].map((_, colIndex) => Math.max(...rows.map(row => (row[colIndex] || '').length)));
        // Format rows
        return rows.map(row => row.map((cell, index) => (cell || '').padEnd(colWidths[index])).join(' | ')).join('\\n');
    }
}
/**
 * Global status tracker instance
 */
let globalStatusTracker = null;
export function getStatusTracker() {
    if (!globalStatusTracker) {
        globalStatusTracker = new ComponentStatusTracker();
    }
    return globalStatusTracker;
}
export function resetStatusTracker() {
    if (globalStatusTracker) {
        globalStatusTracker.dispose();
    }
    globalStatusTracker = null;
}
//# sourceMappingURL=component-status.js.map