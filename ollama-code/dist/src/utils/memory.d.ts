/**
 * Memory Utilities
 *
 * Centralized utilities for memory monitoring and calculation
 * to eliminate code duplication and provide consistent memory reporting.
 */
/**
 * Memory usage information in megabytes
 */
export interface MemoryUsage {
    /** Heap memory currently used (MB) */
    heapUsed: number;
    /** Total heap memory allocated (MB) */
    heapTotal: number;
    /** External memory used by C++ objects (MB) */
    external: number;
    /** Resident set size - total memory allocated for the process (MB) */
    rss: number;
    /** Array buffers memory (MB) */
    arrayBuffers: number;
}
/**
 * Get current memory usage in megabytes
 *
 * This function provides a centralized way to calculate memory usage,
 * eliminating the duplicated pattern of process.memoryUsage().heapUsed / 1024 / 1024
 *
 * @returns Current heap memory usage in megabytes
 */
export declare function getMemoryUsageMB(): number;
/**
 * Get detailed memory usage information in megabytes
 *
 * @returns Comprehensive memory usage breakdown
 */
export declare function getDetailedMemoryUsage(): MemoryUsage;
/**
 * Format memory usage as a human-readable string
 *
 * @param memoryMB Memory usage in megabytes
 * @param precision Number of decimal places (default: 2)
 * @returns Formatted memory string (e.g., "128.45 MB")
 */
export declare function formatMemoryUsage(memoryMB: number, precision?: number): string;
/**
 * Check if memory usage exceeds a threshold
 *
 * @param thresholdMB Memory threshold in megabytes
 * @returns True if current memory usage exceeds threshold
 */
export declare function isMemoryUsageExceeded(thresholdMB: number): boolean;
/**
 * Calculate memory usage delta between two measurements
 *
 * @param beforeMB Previous memory measurement in MB
 * @param afterMB Current memory measurement in MB (defaults to current usage)
 * @returns Memory difference in MB (positive = increase, negative = decrease)
 */
export declare function getMemoryDelta(beforeMB: number, afterMB?: number): number;
/**
 * Memory monitoring utility for tracking usage over time
 */
export declare class MemoryMonitor {
    private measurements;
    private maxHistory;
    constructor(maxHistory?: number);
    /**
     * Record current memory usage
     */
    record(): void;
    /**
     * Get average memory usage over recorded period
     */
    getAverageUsage(): number;
    /**
     * Get peak memory usage
     */
    getPeakUsage(): number;
    /**
     * Get memory usage trend (MB per minute)
     */
    getUsageTrend(): number;
    /**
     * Clear all recorded measurements
     */
    clear(): void;
    /**
     * Get summary of memory monitoring data
     */
    getSummary(): {
        measurements: number;
        current: number;
        average: number;
        peak: number;
        trend: number;
    };
}
