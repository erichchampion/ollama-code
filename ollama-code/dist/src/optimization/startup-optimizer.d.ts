/**
 * Startup Optimization System - Phase 4 Enhanced Implementation
 *
 * Manages selective initialization based on command requirements
 * to minimize startup time for simple operations.
 *
 * Phase 4 Enhancement Features:
 * - Intelligent module loading based on usage patterns
 * - Comprehensive startup time monitoring
 * - Advanced optimization recommendations
 * - Integration with component status tracking
 */
import { StartupOptimizer, StartupMetrics } from '../ai/startup-optimizer.js';
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
/**
 * Initialize enhanced startup optimization system
 */
export declare function initializeEnhancedStartupOptimizer(): Promise<StartupOptimizer>;
/**
 * Execute optimized startup with enhanced features
 */
export declare function executeEnhancedStartup(): Promise<StartupMetrics>;
/**
 * Get enhanced startup metrics for status command integration
 */
export declare function getEnhancedStartupMetrics(): Promise<{
    basic: {
        loadedComponents: string[];
        totalComponents: string[];
        loadTime: number;
    };
    enhanced: StartupMetrics;
    recommendations: string[];
}>;
/**
 * Load module on demand with enhanced tracking
 */
export declare function loadModuleOnDemand(moduleName: string): Promise<any>;
/**
 * Check if enhanced module is loaded
 */
export declare function isEnhancedModuleLoaded(moduleName: string): boolean;
/**
 * Get startup optimization recommendations for system health
 */
export declare function getStartupOptimizationRecommendations(): Promise<{
    performance: string[];
    memory: string[];
    loading: string[];
    general: string[];
}>;
