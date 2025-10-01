/**
 * Startup Optimization Constants
 *
 * Centralized constants for startup optimization configuration
 * to eliminate hardcoded values and ensure consistency across the system.
 */
// =============================================================================
// STARTUP OPTIMIZATION DEFAULTS
// =============================================================================
/** Default startup time target in milliseconds */
export const DEFAULT_STARTUP_TIME_TARGET = 1500; // 1.5 seconds
/** Default memory budget in megabytes */
export const DEFAULT_MEMORY_BUDGET = 256; // 256 MB
/** Default maximum parallel module loads */
export const DEFAULT_MAX_PARALLEL_LOADS = 4;
/** Default cache preloading enabled */
export const DEFAULT_CACHE_PRELOADING = true;
/** Default background warming enabled */
export const DEFAULT_BACKGROUND_WARMING = true;
/** Default lazy loading enabled */
export const DEFAULT_LAZY_LOADING = true;
/** Default parallel loading enabled */
export const DEFAULT_PARALLEL_LOADING = true;
/** Default critical path only mode */
export const DEFAULT_CRITICAL_PATH_ONLY = false;
// =============================================================================
// MODULE MEMORY FOOTPRINTS (in MB)
// =============================================================================
/** Memory footprint for core system modules */
export const CORE_MODULE_MEMORY = {
    /** Logger utility - lightweight logging system */
    LOGGER: 5,
    /** Core services - dependency injection container */
    CORE_SERVICES: 15,
    /** Configuration manager - settings and preferences */
    CONFIG_MANAGER: 10,
};
/** Memory footprint for high priority modules */
export const HIGH_PRIORITY_MODULE_MEMORY = {
    /** Command registry - CLI command definitions */
    COMMAND_REGISTRY: 25,
    /** AI client - basic LLM communication */
    AI_CLIENT: 40,
    /** Component status tracker - real-time monitoring */
    COMPONENT_STATUS_TRACKER: 20,
};
/** Memory footprint for normal priority modules */
export const NORMAL_PRIORITY_MODULE_MEMORY = {
    /** Tool system - development tools integration */
    TOOL_SYSTEM: 35,
    /** Component factory - dynamic component creation */
    COMPONENT_FACTORY: 30,
    /** Enhanced client - advanced AI features */
    ENHANCED_CLIENT: 45,
};
/** Memory footprint for lazy-loaded modules */
export const LAZY_MODULE_MEMORY = {
    /** Knowledge graph - code understanding system */
    KNOWLEDGE_GRAPH: 80,
    /** Advanced analysis - deep code analysis tools */
    ADVANCED_ANALYSIS: 60,
    /** Realtime engine - live update processing */
    REALTIME_ENGINE: 70,
    /** Refactoring engine - code transformation */
    REFACTORING_ENGINE: 55,
};
// =============================================================================
// TIMING CONSTANTS
// =============================================================================
/** Background preload delay in milliseconds */
export const BACKGROUND_PRELOAD_DELAY = 100;
/** Module loading timeout in milliseconds */
export const MODULE_LOADING_TIMEOUT = 5000;
/** Component initialization timeout in milliseconds */
export const COMPONENT_INIT_TIMEOUT = 3000;
// =============================================================================
// OPTIMIZATION STRATEGY PRESETS
// =============================================================================
/** Fast startup strategy - minimal memory, aggressive lazy loading */
export const FAST_STARTUP_STRATEGY = {
    enableLazyLoading: true,
    enableParallelLoading: true,
    enableCachePreloading: false,
    enableBackgroundWarming: false,
    maxParallelLoads: 2,
    startupTimeTarget: 1000, // 1 second
    memoryBudget: 128, // 128 MB
    criticalPathOnly: true,
};
/** Balanced startup strategy - default recommended settings */
export const BALANCED_STARTUP_STRATEGY = {
    enableLazyLoading: DEFAULT_LAZY_LOADING,
    enableParallelLoading: DEFAULT_PARALLEL_LOADING,
    enableCachePreloading: DEFAULT_CACHE_PRELOADING,
    enableBackgroundWarming: DEFAULT_BACKGROUND_WARMING,
    maxParallelLoads: DEFAULT_MAX_PARALLEL_LOADS,
    startupTimeTarget: DEFAULT_STARTUP_TIME_TARGET,
    memoryBudget: DEFAULT_MEMORY_BUDGET,
    criticalPathOnly: DEFAULT_CRITICAL_PATH_ONLY,
};
/** Performance startup strategy - higher memory usage for better performance */
export const PERFORMANCE_STARTUP_STRATEGY = {
    enableLazyLoading: false,
    enableParallelLoading: true,
    enableCachePreloading: true,
    enableBackgroundWarming: true,
    maxParallelLoads: 8,
    startupTimeTarget: 2000, // 2 seconds
    memoryBudget: 512, // 512 MB
    criticalPathOnly: false,
};
//# sourceMappingURL=startup.js.map