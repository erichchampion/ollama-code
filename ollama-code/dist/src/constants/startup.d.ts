/**
 * Startup Optimization Constants
 *
 * Centralized constants for startup optimization configuration
 * to eliminate hardcoded values and ensure consistency across the system.
 */
/** Default startup time target in milliseconds */
export declare const DEFAULT_STARTUP_TIME_TARGET = 1500;
/** Default memory budget in megabytes */
export declare const DEFAULT_MEMORY_BUDGET = 256;
/** Default maximum parallel module loads */
export declare const DEFAULT_MAX_PARALLEL_LOADS = 4;
/** Default cache preloading enabled */
export declare const DEFAULT_CACHE_PRELOADING = true;
/** Default background warming enabled */
export declare const DEFAULT_BACKGROUND_WARMING = true;
/** Default lazy loading enabled */
export declare const DEFAULT_LAZY_LOADING = true;
/** Default parallel loading enabled */
export declare const DEFAULT_PARALLEL_LOADING = true;
/** Default critical path only mode */
export declare const DEFAULT_CRITICAL_PATH_ONLY = false;
/** Memory footprint for core system modules */
export declare const CORE_MODULE_MEMORY: {
    /** Logger utility - lightweight logging system */
    readonly LOGGER: 5;
    /** Core services - dependency injection container */
    readonly CORE_SERVICES: 15;
    /** Configuration manager - settings and preferences */
    readonly CONFIG_MANAGER: 10;
    /** Index optimizer - file and module index caching */
    readonly INDEX_OPTIMIZER: 20;
};
/** Memory footprint for high priority modules */
export declare const HIGH_PRIORITY_MODULE_MEMORY: {
    /** Command registry - CLI command definitions */
    readonly COMMAND_REGISTRY: 25;
    /** AI client - basic LLM communication */
    readonly AI_CLIENT: 40;
    /** Component status tracker - real-time monitoring */
    readonly COMPONENT_STATUS_TRACKER: 20;
};
/** Memory footprint for normal priority modules */
export declare const NORMAL_PRIORITY_MODULE_MEMORY: {
    /** Tool system - development tools integration */
    readonly TOOL_SYSTEM: 35;
    /** Component factory - dynamic component creation */
    readonly COMPONENT_FACTORY: 30;
    /** Enhanced client - advanced AI features */
    readonly ENHANCED_CLIENT: 45;
    /** Cache preloader - intelligent cache warming system */
    readonly CACHE_PRELOADER: 25;
};
/** Memory footprint for lazy-loaded modules */
export declare const LAZY_MODULE_MEMORY: {
    /** Knowledge graph - code understanding system */
    readonly KNOWLEDGE_GRAPH: 80;
    /** Advanced analysis - deep code analysis tools */
    readonly ADVANCED_ANALYSIS: 60;
    /** Realtime engine - live update processing */
    readonly REALTIME_ENGINE: 70;
    /** Refactoring engine - code transformation */
    readonly REFACTORING_ENGINE: 55;
};
/** Background preload delay in milliseconds */
export declare const BACKGROUND_PRELOAD_DELAY = 100;
/** Module loading timeout in milliseconds */
export declare const MODULE_LOADING_TIMEOUT = 5000;
/** Component initialization timeout in milliseconds */
export declare const COMPONENT_INIT_TIMEOUT = 3000;
/** Default cache size limit in number of entries */
export declare const DEFAULT_CACHE_SIZE = 1000;
/** Default index cache size in number of entries */
export declare const DEFAULT_INDEX_CACHE_SIZE = 500;
/** Cache cleanup interval in milliseconds */
export declare const CACHE_CLEANUP_INTERVAL = 300000;
/** Index optimization timeout in milliseconds */
export declare const INDEX_OPTIMIZATION_TIMEOUT = 2000;
/** Default maximum event listeners for managed event emitters */
export declare const DEFAULT_MAX_LISTENERS = 100;
/** Default maximum preload time in milliseconds */
export declare const DEFAULT_MAX_PRELOAD_TIME = 5000;
/** Default parallel preloads */
export declare const DEFAULT_PARALLEL_PRELOADS = 4;
/** Cache loading simulation delays in milliseconds */
export declare const CACHE_LOAD_DELAY = 10;
/** Index loading simulation delays in milliseconds */
export declare const INDEX_LOAD_DELAY = 20;
/** Fast startup strategy - minimal memory, aggressive lazy loading */
export declare const FAST_STARTUP_STRATEGY: {
    readonly enableLazyLoading: true;
    readonly enableParallelLoading: true;
    readonly enableCachePreloading: false;
    readonly enableBackgroundWarming: false;
    readonly maxParallelLoads: 2;
    readonly startupTimeTarget: 1000;
    readonly memoryBudget: 128;
    readonly criticalPathOnly: true;
};
/** Balanced startup strategy - default recommended settings */
export declare const BALANCED_STARTUP_STRATEGY: {
    readonly enableLazyLoading: true;
    readonly enableParallelLoading: true;
    readonly enableCachePreloading: true;
    readonly enableBackgroundWarming: true;
    readonly maxParallelLoads: 4;
    readonly startupTimeTarget: 1500;
    readonly memoryBudget: 256;
    readonly criticalPathOnly: false;
};
/** Performance startup strategy - higher memory usage for better performance */
export declare const PERFORMANCE_STARTUP_STRATEGY: {
    readonly enableLazyLoading: false;
    readonly enableParallelLoading: true;
    readonly enableCachePreloading: true;
    readonly enableBackgroundWarming: true;
    readonly maxParallelLoads: 8;
    readonly startupTimeTarget: 2000;
    readonly memoryBudget: 512;
    readonly criticalPathOnly: false;
};
