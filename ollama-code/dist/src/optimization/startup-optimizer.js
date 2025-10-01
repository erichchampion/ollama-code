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
import { logger } from '../utils/logger.js';
import { getCommandRequirements } from './lazy-loader.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { StartupOptimizer, ModulePriority } from '../ai/startup-optimizer.js';
import { getStatusTracker } from '../interactive/component-status.js';
import { BALANCED_STARTUP_STRATEGY, BACKGROUND_PRELOAD_DELAY, CORE_MODULE_MEMORY, HIGH_PRIORITY_MODULE_MEMORY, NORMAL_PRIORITY_MODULE_MEMORY, LAZY_MODULE_MEMORY } from '../constants/startup.js';
import { getMemoryUsageMB } from '../utils/memory.js';
/**
 * Initialize lazy loading registrations
 */
export async function initializeLazyLoading() {
    const { getLazyLoader } = await import('../core/services.js');
    const lazyLoader = await getLazyLoader();
    // Register AI system
    lazyLoader.register('ai', async () => {
        logger.debug('Initializing AI system...');
        const { initAI } = await import('../ai/index.js');
        await initAI();
        return true;
    });
    // Register tool system
    lazyLoader.register('tools', async () => {
        logger.debug('Initializing tool system...');
        const { initializeToolSystem } = await import('../tools/index.js');
        initializeToolSystem();
        return true;
    });
    // Register command registry
    lazyLoader.register('commands', async () => {
        logger.debug('Registering commands...');
        const { registerCommands } = await import('../commands/register.js');
        registerCommands();
        return true;
    });
    // Register project context
    lazyLoader.register('project', async () => {
        logger.debug('Initializing project context...');
        const { ProjectContext } = await import('../ai/context.js');
        const context = new ProjectContext(process.cwd());
        await context.initialize();
        return context;
    });
    // Register terminal for interactive features
    lazyLoader.register('terminal', async () => {
        logger.debug('Initializing terminal interface...');
        // Terminal initialization would go here
        return { initialized: true };
    });
    // Register analytics
    lazyLoader.register('analytics', async () => {
        logger.debug('Initializing analytics...');
        // Analytics initialization would go here
        return { initialized: true };
    });
    // Register configuration
    lazyLoader.register('config', async () => {
        logger.debug('Loading configuration...');
        // Configuration loading would go here
        return { initialized: true };
    });
}
/**
 * Optimized command execution with selective initialization
 */
export async function executeCommandOptimized(commandName, args) {
    const startTime = performance.now();
    try {
        const { getLazyLoader } = await import('../core/services.js');
        const lazyLoader = await getLazyLoader();
        // Always load commands first (lightweight)
        await lazyLoader.get('commands');
        // Get command requirements
        const requirements = getCommandRequirements(commandName);
        logger.debug(`Command requirements for ${commandName}:`, requirements);
        // Initialize only what's needed
        const initPromises = [];
        if (requirements.needsTools) {
            initPromises.push(lazyLoader.get('tools'));
        }
        if (requirements.needsAI || requirements.needsProject) {
            // Ensure Ollama is running before AI initialization
            initPromises.push(ensureOllamaServerRunning());
        }
        if (requirements.needsAI) {
            initPromises.push(lazyLoader.get('ai'));
        }
        if (requirements.needsProject) {
            initPromises.push(lazyLoader.get('project'));
        }
        // Wait for required components
        await Promise.all(initPromises);
        // Execute the command
        const { executeCommand } = await import('../commands/index.js');
        await executeCommand(commandName, args);
        const duration = performance.now() - startTime;
        logger.debug(`Command ${commandName} completed in ${duration.toFixed(2)}ms`);
    }
    catch (error) {
        const duration = performance.now() - startTime;
        logger.error(`Command ${commandName} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
    }
}
/**
 * Preload common components in background
 */
export async function preloadCommonComponents() {
    // Run in background without blocking
    setTimeout(async () => {
        const startTime = Date.now();
        try {
            // Phase 5: Initialize cache and index preloading
            logger.info('Starting Phase 5: Cache and Index Preloading');
            // Initialize cache preloader
            const { initializeCachePreloader } = await import('./cache-preloader.js');
            const cachePreloader = await initializeCachePreloader();
            // Initialize index optimizer
            const { indexOptimizer } = await import('./index-optimizer.js');
            await indexOptimizer.initialize();
            // Start background cache warming
            await cachePreloader.startPreloading();
            // Start predictive index preloading
            await indexOptimizer.preloadIndexes();
            // Phase 6: Initialize Performance Dashboard and Analytics
            logger.info('Starting Phase 6: Performance Dashboard integration');
            const { globalPerformanceDashboard } = await import('../ai/performance-dashboard.js');
            // Start performance monitoring
            globalPerformanceDashboard.startMonitoring();
            // Record cache preloading metrics
            globalPerformanceDashboard.recordEvent('cache', 'preloader_initialized', 0);
            // Record index optimization metrics
            globalPerformanceDashboard.recordEvent('performance', 'index_optimizer_ready', 0);
            // Record startup optimization completion
            globalPerformanceDashboard.recordEvent('startup', 'phase_5_completed', Date.now() - startTime);
            // Original lazy loader preloading
            const { getLazyLoader } = await import('../core/services.js');
            const lazyLoader = await getLazyLoader();
            await lazyLoader.preload(['config', 'analytics']);
            logger.info('Phase 5 background preload completed');
        }
        catch (error) {
            logger.error('Phase 5 background preload failed:', error);
        }
    }, BACKGROUND_PRELOAD_DELAY);
}
/**
 * Get startup performance metrics
 */
export async function getStartupMetrics() {
    const { getLazyLoader } = await import('../core/services.js');
    const lazyLoader = await getLazyLoader();
    const status = lazyLoader.getStatus();
    return {
        loadedComponents: status.loaded,
        totalComponents: status.available,
        loadTime: performance.now()
    };
}
// ===== Phase 4 Enhanced Startup Optimization Features =====
/**
 * Global enhanced startup optimizer instance
 */
let enhancedStartupOptimizer = null;
/**
 * Initialize enhanced startup optimization system
 */
export async function initializeEnhancedStartupOptimizer() {
    if (enhancedStartupOptimizer) {
        return enhancedStartupOptimizer;
    }
    const optimizationStrategy = BALANCED_STARTUP_STRATEGY;
    enhancedStartupOptimizer = new StartupOptimizer(optimizationStrategy);
    // Register comprehensive module definitions based on actual CLI architecture
    registerEnhancedModules(enhancedStartupOptimizer);
    // Setup integration with component status tracking
    setupStatusTrackerIntegration(enhancedStartupOptimizer);
    logger.info('Enhanced startup optimizer initialized', {
        strategy: optimizationStrategy,
        modules: enhancedStartupOptimizer.getMetrics().totalModulesLoaded
    });
    return enhancedStartupOptimizer;
}
/**
 * Register enhanced module definitions for comprehensive optimization
 */
function registerEnhancedModules(optimizer) {
    // Critical modules - must load immediately
    const criticalModules = [
        {
            name: 'logger',
            path: './utils/logger',
            priority: ModulePriority.CRITICAL,
            dependencies: [],
            memoryFootprint: CORE_MODULE_MEMORY.LOGGER
        },
        {
            name: 'core-services',
            path: './core/services',
            priority: ModulePriority.CRITICAL,
            dependencies: ['logger'],
            memoryFootprint: CORE_MODULE_MEMORY.CORE_SERVICES
        },
        {
            name: 'config-manager',
            path: './config/manager',
            priority: ModulePriority.CRITICAL,
            dependencies: ['logger'],
            memoryFootprint: CORE_MODULE_MEMORY.CONFIG_MANAGER
        },
        {
            name: 'index-optimizer',
            path: './optimization/index-optimizer',
            priority: ModulePriority.CRITICAL,
            dependencies: ['logger'],
            memoryFootprint: CORE_MODULE_MEMORY.INDEX_OPTIMIZER
        }
    ];
    // High priority modules - load during startup
    const highPriorityModules = [
        {
            name: 'command-registry',
            path: './commands/register',
            priority: ModulePriority.HIGH,
            dependencies: ['core-services', 'logger'],
            memoryFootprint: HIGH_PRIORITY_MODULE_MEMORY.COMMAND_REGISTRY
        },
        {
            name: 'ai-client',
            path: './ai/ollama-client',
            priority: ModulePriority.HIGH,
            dependencies: ['config-manager', 'logger'],
            memoryFootprint: HIGH_PRIORITY_MODULE_MEMORY.AI_CLIENT
        },
        {
            name: 'component-status-tracker',
            path: './interactive/component-status',
            priority: ModulePriority.HIGH,
            dependencies: ['core-services'],
            memoryFootprint: HIGH_PRIORITY_MODULE_MEMORY.COMPONENT_STATUS_TRACKER
        }
    ];
    // Normal priority modules - load when needed
    const normalPriorityModules = [
        {
            name: 'tool-system',
            path: './tools/index',
            priority: ModulePriority.NORMAL,
            dependencies: ['ai-client', 'logger'],
            memoryFootprint: NORMAL_PRIORITY_MODULE_MEMORY.TOOL_SYSTEM
        },
        {
            name: 'component-factory',
            path: './interactive/component-factory',
            priority: ModulePriority.NORMAL,
            dependencies: ['component-status-tracker', 'config-manager'],
            memoryFootprint: NORMAL_PRIORITY_MODULE_MEMORY.COMPONENT_FACTORY
        },
        {
            name: 'enhanced-client',
            path: './ai/enhanced-client',
            priority: ModulePriority.NORMAL,
            dependencies: ['ai-client', 'component-status-tracker'],
            memoryFootprint: NORMAL_PRIORITY_MODULE_MEMORY.ENHANCED_CLIENT
        },
        {
            name: 'cache-preloader',
            path: './optimization/cache-preloader',
            priority: ModulePriority.NORMAL,
            dependencies: ['index-optimizer', 'config-manager'],
            memoryFootprint: NORMAL_PRIORITY_MODULE_MEMORY.CACHE_PRELOADER
        }
    ];
    // Lazy modules - load on demand only
    const lazyModules = [
        {
            name: 'knowledge-graph',
            path: './ai/incremental-knowledge-graph',
            priority: ModulePriority.LAZY,
            dependencies: ['enhanced-client', 'tool-system'],
            memoryFootprint: LAZY_MODULE_MEMORY.KNOWLEDGE_GRAPH
        },
        {
            name: 'advanced-analysis',
            path: './tools/advanced-code-analysis-tool',
            priority: ModulePriority.LAZY,
            dependencies: ['tool-system', 'knowledge-graph'],
            memoryFootprint: LAZY_MODULE_MEMORY.ADVANCED_ANALYSIS
        },
        {
            name: 'realtime-engine',
            path: './ai/realtime-update-engine',
            priority: ModulePriority.LAZY,
            dependencies: ['knowledge-graph', 'component-factory'],
            memoryFootprint: LAZY_MODULE_MEMORY.REALTIME_ENGINE
        },
        {
            name: 'refactoring-engine',
            path: './ai/refactoring-engine',
            priority: ModulePriority.LAZY,
            dependencies: ['advanced-analysis', 'enhanced-client'],
            memoryFootprint: LAZY_MODULE_MEMORY.REFACTORING_ENGINE
        }
    ];
    // Register all modules
    optimizer.registerModules([
        ...criticalModules,
        ...highPriorityModules,
        ...normalPriorityModules,
        ...lazyModules
    ]);
    logger.debug('Enhanced modules registered', {
        critical: criticalModules.length,
        high: highPriorityModules.length,
        normal: normalPriorityModules.length,
        lazy: lazyModules.length
    });
}
/**
 * Setup integration with component status tracker
 */
function setupStatusTrackerIntegration(optimizer) {
    const statusTracker = getStatusTracker();
    // Listen to module loading events and update status tracker
    optimizer.on('module:loaded', (event) => {
        statusTracker.updateFromProgress({
            component: event.name,
            status: 'ready',
            startTime: Date.now() - (event.loadTime || 0),
            endTime: Date.now()
        });
        logger.debug('Module status updated', {
            module: event.name,
            loadTime: event.loadTime,
            priority: event.priority
        });
    });
    optimizer.on('module:loaded:lazy', (event) => {
        statusTracker.updateFromProgress({
            component: event.moduleName,
            status: 'ready',
            startTime: Date.now(),
            endTime: Date.now()
        });
        logger.debug('Lazy module status updated', { module: event.moduleName });
    });
    optimizer.on('startup:complete', (event) => {
        logger.info('Enhanced startup optimization completed', {
            metrics: event.metrics,
            recommendations: optimizer.getOptimizationRecommendations()
        });
    });
    optimizer.on('startup:error', (event) => {
        logger.error('Enhanced startup optimization failed', {
            error: event.error,
            metrics: event.metrics
        });
    });
}
/**
 * Execute optimized startup with enhanced features
 */
export async function executeEnhancedStartup() {
    const optimizer = await initializeEnhancedStartupOptimizer();
    await optimizer.startupOptimized();
    return optimizer.getMetrics();
}
/**
 * Get enhanced startup metrics for status command integration
 */
export async function getEnhancedStartupMetrics() {
    const basicMetrics = await getStartupMetrics();
    if (!enhancedStartupOptimizer) {
        return {
            basic: basicMetrics,
            enhanced: {
                totalStartupTime: 0,
                coreInitTime: 0,
                moduleLoadTime: 0,
                indexLoadTime: 0,
                cacheWarmupTime: 0,
                parallelizationSavings: 0,
                memoryUsageAtStart: getMemoryUsageMB(),
                criticalModulesLoaded: 0,
                totalModulesLoaded: 0,
                lazyModulesDeferred: 0
            },
            recommendations: ['Initialize enhanced startup optimizer to get detailed metrics']
        };
    }
    return {
        basic: basicMetrics,
        enhanced: enhancedStartupOptimizer.getMetrics(),
        recommendations: enhancedStartupOptimizer.getOptimizationRecommendations()
    };
}
/**
 * Load module on demand with enhanced tracking
 */
export async function loadModuleOnDemand(moduleName) {
    if (!enhancedStartupOptimizer) {
        logger.warn('Enhanced startup optimizer not initialized, falling back to basic loading');
        const { getLazyLoader } = await import('../core/services.js');
        const lazyLoader = await getLazyLoader();
        return await lazyLoader.get(moduleName);
    }
    return await enhancedStartupOptimizer.loadModuleOnDemand(moduleName);
}
/**
 * Check if enhanced module is loaded
 */
export function isEnhancedModuleLoaded(moduleName) {
    if (!enhancedStartupOptimizer) {
        return false;
    }
    return enhancedStartupOptimizer.isModuleLoaded(moduleName);
}
/**
 * Get startup optimization recommendations for system health
 */
export async function getStartupOptimizationRecommendations() {
    if (!enhancedStartupOptimizer) {
        return {
            performance: ['Initialize enhanced startup optimizer for detailed performance recommendations'],
            memory: [],
            loading: [],
            general: ['Consider enabling enhanced startup optimization for better performance']
        };
    }
    const recommendations = enhancedStartupOptimizer.getOptimizationRecommendations();
    const metrics = enhancedStartupOptimizer.getMetrics();
    return {
        performance: recommendations.filter(r => r.includes('startup time') || r.includes('performance') || r.includes('parallel')),
        memory: recommendations.filter(r => r.includes('memory') || r.includes('deferring') || r.includes('large modules')),
        loading: recommendations.filter(r => r.includes('loading') || r.includes('dependencies') || r.includes('lazy')),
        general: [
            ...recommendations.filter(r => !r.includes('startup time') && !r.includes('memory') && !r.includes('loading')),
            `Startup completed in ${metrics.totalStartupTime.toFixed(2)}ms`,
            `${metrics.criticalModulesLoaded} critical modules loaded`,
            `${metrics.lazyModulesDeferred} modules deferred for lazy loading`,
            `Parallelization saved ${metrics.parallelizationSavings.toFixed(2)}ms`
        ]
    };
}
//# sourceMappingURL=startup-optimizer.js.map