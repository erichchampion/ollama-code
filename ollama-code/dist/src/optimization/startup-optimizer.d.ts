/**
 * Startup Optimization System
 *
 * Manages selective initialization based on command requirements
 * to minimize startup time for simple operations
 */
/**
 * Initialize lazy loading registrations
 */
export declare function initializeLazyLoading(): Promise<void>;
/**
 * Optimized command execution with selective initialization
 */
export declare function executeCommandOptimized(commandName: string, args: string[]): Promise<void>;
/**
 * Preload common components in background
 */
export declare function preloadCommonComponents(): Promise<void>;
/**
 * Get startup performance metrics
 */
export declare function getStartupMetrics(): Promise<{
    loadedComponents: string[];
    totalComponents: string[];
    loadTime: number;
}>;
