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
import { logger } from '../utils/logger.js';
import { createSpinner } from '../utils/spinner.js';
export class PerformanceOptimizer {
    startTime;
    commandMetrics;
    cache;
    maxCacheSize;
    cleanupInterval = null;
    constructor(maxCacheSize = 100) {
        this.startTime = Date.now();
        this.commandMetrics = new Map();
        this.cache = new Map();
        this.maxCacheSize = maxCacheSize;
        this.initializeOptimizations();
    }
    /**
     * Initialize performance optimizations
     */
    initializeOptimizations() {
        // Set up periodic cleanup
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 60000); // Every minute
        // Handle process exit
        process.on('beforeExit', () => {
            this.cleanup();
        });
        // Monitor memory usage
        this.setupMemoryMonitoring();
    }
    /**
     * Track command execution metrics
     */
    trackCommand(commandName, executionTime, success) {
        const metrics = this.commandMetrics.get(commandName) || {
            count: 0,
            totalTime: 0,
            errors: 0
        };
        metrics.count++;
        metrics.totalTime += executionTime;
        if (!success) {
            metrics.errors++;
        }
        this.commandMetrics.set(commandName, metrics);
    }
    /**
     * Get performance metrics
     */
    getMetrics() {
        const memUsage = process.memoryUsage();
        const uptime = Date.now() - this.startTime;
        // Calculate command statistics
        let totalCommands = 0;
        let totalTime = 0;
        let totalErrors = 0;
        for (const metrics of this.commandMetrics.values()) {
            totalCommands += metrics.count;
            totalTime += metrics.totalTime;
            totalErrors += metrics.errors;
        }
        const averageResponse = totalCommands > 0 ? totalTime / totalCommands : 0;
        // Calculate cache hit rate
        const cacheEntries = Array.from(this.cache.values());
        const totalAccesses = cacheEntries.reduce((sum, entry) => sum + entry.accessCount, 0);
        const hitRate = totalAccesses > 0 ? (totalAccesses - cacheEntries.length) / totalAccesses : 0;
        return {
            memory: {
                used: memUsage.rss,
                total: memUsage.rss + memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            },
            timing: {
                startup: uptime,
                lastCommand: this.getLastCommandTime(),
                averageResponse
            },
            cache: {
                hitRate: hitRate * 100,
                size: this.cache.size,
                maxSize: this.maxCacheSize
            },
            commands: {
                total: totalCommands,
                successful: totalCommands - totalErrors,
                failed: totalErrors
            }
        };
    }
    /**
     * Analyze performance and generate optimization report
     */
    async analyzePerformance() {
        const spinner = createSpinner('Analyzing performance...');
        spinner.start();
        try {
            const metrics = this.getMetrics();
            const issues = [];
            const recommendations = [];
            // Memory analysis
            const memoryUsageMB = metrics.memory.used / 1024 / 1024;
            if (memoryUsageMB > 500) {
                issues.push({
                    severity: 'high',
                    description: `High memory usage: ${memoryUsageMB.toFixed(1)}MB`,
                    solution: 'Consider restarting the application or clearing cache'
                });
                recommendations.push('Clear cache with: performance-clear-cache');
            }
            else if (memoryUsageMB > 200) {
                issues.push({
                    severity: 'medium',
                    description: `Moderate memory usage: ${memoryUsageMB.toFixed(1)}MB`,
                    solution: 'Monitor memory usage and consider clearing cache if needed'
                });
            }
            // Response time analysis
            if (metrics.timing.averageResponse > 10000) {
                issues.push({
                    severity: 'high',
                    description: `Slow average response time: ${(metrics.timing.averageResponse / 1000).toFixed(1)}s`,
                    solution: 'Check network connectivity and model performance'
                });
                recommendations.push('Consider using a faster AI model');
            }
            else if (metrics.timing.averageResponse > 5000) {
                issues.push({
                    severity: 'medium',
                    description: `Moderate response time: ${(metrics.timing.averageResponse / 1000).toFixed(1)}s`,
                    solution: 'Consider optimizing prompts or using cache'
                });
            }
            // Cache analysis
            if (metrics.cache.hitRate < 30) {
                issues.push({
                    severity: 'medium',
                    description: `Low cache hit rate: ${metrics.cache.hitRate.toFixed(1)}%`,
                    solution: 'Enable caching for frequently used operations'
                });
                recommendations.push('Enable aggressive caching in configuration');
            }
            // Error rate analysis
            const errorRate = metrics.commands.total > 0 ?
                (metrics.commands.failed / metrics.commands.total) * 100 : 0;
            if (errorRate > 20) {
                issues.push({
                    severity: 'high',
                    description: `High error rate: ${errorRate.toFixed(1)}%`,
                    solution: 'Check AI model availability and configuration'
                });
                recommendations.push('Verify Ollama server is running and accessible');
            }
            // Overall assessment
            let overall = 'excellent';
            if (issues.some(i => i.severity === 'critical')) {
                overall = 'poor';
            }
            else if (issues.some(i => i.severity === 'high')) {
                overall = 'moderate';
            }
            else if (issues.some(i => i.severity === 'medium')) {
                overall = 'good';
            }
            // Add general recommendations
            if (recommendations.length === 0) {
                recommendations.push('Performance is optimal - no immediate action needed');
            }
            recommendations.push('Run performance analysis regularly to monitor trends');
            const report = {
                overall,
                recommendations,
                metrics,
                issues
            };
            spinner.succeed('Performance analysis complete');
            return report;
        }
        catch (error) {
            spinner.fail('Performance analysis failed');
            throw error;
        }
    }
    /**
     * Cache management
     */
    setCache(key, value, ttl) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldestEntries(Math.floor(this.maxCacheSize * 0.1)); // Remove 10%
        }
        const entry = {
            key,
            value,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now(),
            ttl
        };
        this.cache.set(key, entry);
    }
    getCache(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check TTL
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        // Update access metrics
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        return entry.value;
    }
    clearCache() {
        this.cache.clear();
        logger.info('Cache cleared');
    }
    /**
     * Force garbage collection if available
     */
    forceGarbageCollection() {
        if (global.gc) {
            global.gc();
            return true;
        }
        return false;
    }
    /**
     * Optimize memory usage
     */
    async optimizeMemory() {
        const spinner = createSpinner('Optimizing memory usage...');
        spinner.start();
        try {
            // Clear expired cache entries
            this.clearExpiredCache();
            // Remove old command metrics
            this.cleanupCommandMetrics();
            // Force garbage collection if available
            const gcSuccess = this.forceGarbageCollection();
            if (gcSuccess) {
                spinner.succeed('Memory optimized with garbage collection');
            }
            else {
                spinner.succeed('Memory optimized (garbage collection not available)');
            }
        }
        catch (error) {
            spinner.fail('Memory optimization failed');
            throw error;
        }
    }
    /**
     * Get resource usage summary
     */
    getResourceSummary() {
        const metrics = this.getMetrics();
        return {
            memory: {
                usedMB: (metrics.memory.used / 1024 / 1024).toFixed(1),
                heapUsedMB: (metrics.memory.heapUsed / 1024 / 1024).toFixed(1),
                efficiency: ((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(1) + '%'
            },
            cache: {
                entries: metrics.cache.size,
                hitRate: metrics.cache.hitRate.toFixed(1) + '%',
                utilizationRate: ((metrics.cache.size / metrics.cache.maxSize) * 100).toFixed(1) + '%'
            },
            uptime: this.formatUptime(metrics.timing.startup),
            commands: {
                total: metrics.commands.total,
                successRate: metrics.commands.total > 0 ?
                    ((metrics.commands.successful / metrics.commands.total) * 100).toFixed(1) + '%' : 'N/A'
            }
        };
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.cache.clear();
        this.commandMetrics.clear();
        logger.debug('Performance optimizer cleaned up');
    }
    /**
     * Periodic cleanup operations
     */
    performCleanup() {
        this.clearExpiredCache();
        this.cleanupCommandMetrics();
        // Log memory usage if it's high
        const memUsage = process.memoryUsage();
        const memUsageMB = memUsage.rss / 1024 / 1024;
        if (memUsageMB > 300) {
            logger.warn(`High memory usage: ${memUsageMB.toFixed(1)}MB`);
        }
    }
    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.ttl && now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            logger.debug(`Removed ${removed} expired cache entries`);
        }
    }
    /**
     * Cleanup old command metrics
     */
    cleanupCommandMetrics() {
        // Keep only recent metrics (limit to prevent memory growth)
        if (this.commandMetrics.size > 100) {
            const sortedEntries = Array.from(this.commandMetrics.entries())
                .sort(([, a], [, b]) => b.count - a.count) // Sort by usage
                .slice(0, 50); // Keep top 50
            this.commandMetrics.clear();
            for (const [key, value] of sortedEntries) {
                this.commandMetrics.set(key, value);
            }
            logger.debug('Cleaned up command metrics');
        }
    }
    /**
     * Evict oldest cache entries
     */
    evictOldestEntries(count) {
        const entries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
            .slice(0, count);
        for (const [key] of entries) {
            this.cache.delete(key);
        }
        logger.debug(`Evicted ${count} cache entries`);
    }
    /**
     * Get last command execution time
     */
    getLastCommandTime() {
        let lastTime = 0;
        for (const metrics of this.commandMetrics.values()) {
            if (metrics.count > 0) {
                lastTime = Math.max(lastTime, metrics.totalTime / metrics.count);
            }
        }
        return lastTime;
    }
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        // Monitor memory every 30 seconds
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const memUsageMB = memUsage.rss / 1024 / 1024;
            // Warn if memory usage is very high
            if (memUsageMB > 1000) {
                logger.warn(`Very high memory usage: ${memUsageMB.toFixed(1)}MB - consider restarting`);
            }
        }, 30000);
    }
    /**
     * Format uptime for display
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
}
/**
 * Default performance optimizer instance
 */
export const performanceOptimizer = new PerformanceOptimizer();
//# sourceMappingURL=optimizer.js.map