/**
 * Startup Time Optimization System
 *
 * Implements intelligent startup optimization strategies:
 * - Lazy loading of non-critical modules
 * - Precomputed index caching
 * - Parallel initialization
 * - Critical path prioritization
 * - Background warming
 * - Resource preloading
 */
import { EventEmitter } from 'events';
export interface StartupMetrics {
    totalStartupTime: number;
    coreInitTime: number;
    moduleLoadTime: number;
    indexLoadTime: number;
    cacheWarmupTime: number;
    parallelizationSavings: number;
    memoryUsageAtStart: number;
    criticalModulesLoaded: number;
    totalModulesLoaded: number;
    lazyModulesDeferred: number;
}
export interface ModuleDefinition {
    name: string;
    path: string;
    priority: ModulePriority;
    dependencies: string[];
    loadTime?: number;
    memoryFootprint?: number;
    isLoaded: boolean;
    loadPromise?: Promise<any>;
    module?: any;
}
export declare enum ModulePriority {
    CRITICAL = 1,// Must load before app starts
    HIGH = 2,// Load during startup
    NORMAL = 3,// Load when needed
    LOW = 4,// Load in background
    LAZY = 5
}
export interface StartupPhase {
    name: string;
    priority: number;
    dependencies: string[];
    modules: string[];
    estimatedTime: number;
    actualTime?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    parallel: boolean;
}
export interface OptimizationStrategy {
    enableLazyLoading: boolean;
    enableParallelLoading: boolean;
    enableCachePreloading: boolean;
    enableBackgroundWarming: boolean;
    maxParallelLoads: number;
    startupTimeTarget: number;
    memoryBudget: number;
    criticalPathOnly: boolean;
}
export interface StartupProfile {
    name: string;
    description: string;
    strategy: OptimizationStrategy;
    modules: ModuleDefinition[];
    phases: StartupPhase[];
    customInitializers?: Array<() => Promise<void>>;
}
/**
 * Main startup optimization system
 */
export declare class StartupOptimizer extends EventEmitter {
    private modules;
    private phases;
    private loadedModules;
    private metrics;
    private strategy;
    private startTime;
    private isInitialized;
    private loadQueue;
    private activeLoads;
    constructor(strategy?: Partial<OptimizationStrategy>);
    /**
     * Register a module for managed loading
     */
    registerModule(module: Omit<ModuleDefinition, 'isLoaded'>): void;
    /**
     * Register multiple modules from a configuration
     */
    registerModules(modules: Omit<ModuleDefinition, 'isLoaded'>[]): void;
    /**
     * Register a startup phase
     */
    registerPhase(phase: StartupPhase): void;
    /**
     * Begin optimized startup sequence
     */
    startupOptimized(): Promise<void>;
    /**
     * Load a module on demand (lazy loading)
     */
    loadModuleOnDemand(moduleName: string): Promise<any>;
    /**
     * Get startup metrics
     */
    getMetrics(): StartupMetrics;
    /**
     * Get loaded module
     */
    getModule(moduleName: string): any;
    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName: string): boolean;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): string[];
    private loadCriticalModules;
    private loadHighPriorityModules;
    private loadNormalPriorityModules;
    private loadModulesInParallel;
    private createLoadBatches;
    private loadSingleModule;
    private simulateModuleLoad;
    private initializeCoreSystems;
    private preloadCaches;
    private startBackgroundWarming;
    private loadModulesInBackground;
    private calculateFinalMetrics;
    private initializeDefaultProfile;
}
export declare const globalStartupOptimizer: StartupOptimizer;
