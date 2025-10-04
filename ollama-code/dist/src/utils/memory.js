/**
 * Memory Utilities
 *
 * Centralized utilities for memory monitoring and calculation
 * to eliminate code duplication and provide consistent memory reporting.
 */
/**
 * Get current memory usage in megabytes
 *
 * This function provides a centralized way to calculate memory usage,
 * eliminating the duplicated pattern of process.memoryUsage().heapUsed / 1024 / 1024
 *
 * @returns Current heap memory usage in megabytes
 */
export function getMemoryUsageMB() {
    return process.memoryUsage().heapUsed / 1024 / 1024;
}
/**
 * Get detailed memory usage information in megabytes
 *
 * @returns Comprehensive memory usage breakdown
 */
export function getDetailedMemoryUsage() {
    const usage = process.memoryUsage();
    return {
        heapUsed: usage.heapUsed / 1024 / 1024,
        heapTotal: usage.heapTotal / 1024 / 1024,
        external: usage.external / 1024 / 1024,
        rss: usage.rss / 1024 / 1024,
        arrayBuffers: usage.arrayBuffers / 1024 / 1024,
    };
}
/**
 * Format memory usage as a human-readable string
 *
 * @param memoryMB Memory usage in megabytes
 * @param precision Number of decimal places (default: 2)
 * @returns Formatted memory string (e.g., "128.45 MB")
 */
export function formatMemoryUsage(memoryMB, precision = 2) {
    return `${memoryMB.toFixed(precision)} MB`;
}
/**
 * Check if memory usage exceeds a threshold
 *
 * @param thresholdMB Memory threshold in megabytes
 * @returns True if current memory usage exceeds threshold
 */
export function isMemoryUsageExceeded(thresholdMB) {
    return getMemoryUsageMB() > thresholdMB;
}
/**
 * Calculate memory usage delta between two measurements
 *
 * @param beforeMB Previous memory measurement in MB
 * @param afterMB Current memory measurement in MB (defaults to current usage)
 * @returns Memory difference in MB (positive = increase, negative = decrease)
 */
export function getMemoryDelta(beforeMB, afterMB) {
    const after = afterMB ?? getMemoryUsageMB();
    return after - beforeMB;
}
/**
 * Memory monitoring utility for tracking usage over time
 */
export class MemoryMonitor {
    measurements = [];
    maxHistory;
    constructor(maxHistory = 100) {
        this.maxHistory = maxHistory;
    }
    /**
     * Record current memory usage
     */
    record() {
        const usage = getMemoryUsageMB();
        const timestamp = Date.now();
        this.measurements.push({ timestamp, usage });
        // Keep only the most recent measurements
        if (this.measurements.length > this.maxHistory) {
            this.measurements.shift();
        }
    }
    /**
     * Get average memory usage over recorded period
     */
    getAverageUsage() {
        if (this.measurements.length === 0)
            return 0;
        const total = this.measurements.reduce((sum, m) => sum + m.usage, 0);
        return total / this.measurements.length;
    }
    /**
     * Get peak memory usage
     */
    getPeakUsage() {
        if (this.measurements.length === 0)
            return 0;
        return Math.max(...this.measurements.map(m => m.usage));
    }
    /**
     * Get memory usage trend (MB per minute)
     */
    getUsageTrend() {
        if (this.measurements.length < 2)
            return 0;
        const first = this.measurements[0];
        const last = this.measurements[this.measurements.length - 1];
        const timeDiff = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
        const usageDiff = last.usage - first.usage;
        return timeDiff > 0 ? usageDiff / timeDiff : 0;
    }
    /**
     * Clear all recorded measurements
     */
    clear() {
        this.measurements = [];
    }
    /**
     * Get summary of memory monitoring data
     */
    getSummary() {
        return {
            measurements: this.measurements.length,
            current: getMemoryUsageMB(),
            average: this.getAverageUsage(),
            peak: this.getPeakUsage(),
            trend: this.getUsageTrend(),
        };
    }
}
//# sourceMappingURL=memory.js.map