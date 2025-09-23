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
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger.js';
export var ModulePriority;
(function (ModulePriority) {
    ModulePriority[ModulePriority["CRITICAL"] = 1] = "CRITICAL";
    ModulePriority[ModulePriority["HIGH"] = 2] = "HIGH";
    ModulePriority[ModulePriority["NORMAL"] = 3] = "NORMAL";
    ModulePriority[ModulePriority["LOW"] = 4] = "LOW";
    ModulePriority[ModulePriority["LAZY"] = 5] = "LAZY"; // Load on demand only
})(ModulePriority || (ModulePriority = {}));
/**
 * Main startup optimization system
 */
export class StartupOptimizer extends EventEmitter {
    modules = new Map();
    phases = new Map();
    loadedModules = new Map();
    metrics;
    strategy;
    startTime = 0;
    isInitialized = false;
    loadQueue = [];
    activeLoads = new Set();
    constructor(strategy = {}) {
        super();
        this.strategy = {
            enableLazyLoading: true,
            enableParallelLoading: true,
            enableCachePreloading: true,
            enableBackgroundWarming: true,
            maxParallelLoads: 4,
            startupTimeTarget: 2000, // 2 seconds
            memoryBudget: 512, // 512 MB
            criticalPathOnly: false,
            ...strategy
        };
        this.metrics = {
            totalStartupTime: 0,
            coreInitTime: 0,
            moduleLoadTime: 0,
            indexLoadTime: 0,
            cacheWarmupTime: 0,
            parallelizationSavings: 0,
            memoryUsageAtStart: process.memoryUsage().heapUsed / 1024 / 1024,
            criticalModulesLoaded: 0,
            totalModulesLoaded: 0,
            lazyModulesDeferred: 0
        };
        this.initializeDefaultProfile();
    }
    /**
     * Register a module for managed loading
     */
    registerModule(module) {
        const moduleDefinition = {
            ...module,
            isLoaded: false
        };
        this.modules.set(module.name, moduleDefinition);
        logger.debug('Module registered', {
            name: module.name,
            priority: module.priority,
            dependencies: module.dependencies
        });
    }
    /**
     * Register multiple modules from a configuration
     */
    registerModules(modules) {
        modules.forEach(module => this.registerModule(module));
    }
    /**
     * Register a startup phase
     */
    registerPhase(phase) {
        this.phases.set(phase.name, phase);
        logger.debug('Phase registered', {
            name: phase.name,
            priority: phase.priority,
            modules: phase.modules,
            parallel: phase.parallel
        });
    }
    /**
     * Begin optimized startup sequence
     */
    async startupOptimized() {
        if (this.isInitialized) {
            logger.warn('Startup optimizer already initialized');
            return;
        }
        this.startTime = performance.now();
        logger.info('Starting optimized startup sequence', {
            strategy: this.strategy,
            registeredModules: this.modules.size,
            registeredPhases: this.phases.size
        });
        this.emit('startup:begin', { strategy: this.strategy });
        try {
            // Phase 1: Critical modules only
            await this.loadCriticalModules();
            // Phase 2: High priority modules (potentially parallel)
            await this.loadHighPriorityModules();
            // Phase 3: Normal priority modules (parallel if enabled)
            if (!this.strategy.criticalPathOnly) {
                await this.loadNormalPriorityModules();
            }
            // Phase 4: Initialize core systems
            await this.initializeCoreSystems();
            // Phase 5: Preload caches and indexes
            if (this.strategy.enableCachePreloading) {
                await this.preloadCaches();
            }
            // Phase 6: Background warming (non-blocking)
            if (this.strategy.enableBackgroundWarming) {
                this.startBackgroundWarming();
            }
            this.isInitialized = true;
            this.calculateFinalMetrics();
            logger.info('Startup sequence completed', {
                totalTime: this.metrics.totalStartupTime,
                modulesLoaded: this.metrics.totalModulesLoaded,
                target: this.strategy.startupTimeTarget,
                success: this.metrics.totalStartupTime <= this.strategy.startupTimeTarget
            });
            this.emit('startup:complete', { metrics: this.metrics });
        }
        catch (error) {
            this.emit('startup:error', { error, metrics: this.metrics });
            throw error;
        }
    }
    /**
     * Load a module on demand (lazy loading)
     */
    async loadModuleOnDemand(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) {
            throw new Error(`Module not registered: ${moduleName}`);
        }
        if (module.isLoaded) {
            return this.loadedModules.get(moduleName);
        }
        logger.debug('Loading module on demand', { moduleName });
        const loadedModule = await this.loadSingleModule(module);
        this.emit('module:loaded:lazy', { moduleName, module: loadedModule });
        return loadedModule;
    }
    /**
     * Get startup metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get loaded module
     */
    getModule(moduleName) {
        return this.loadedModules.get(moduleName);
    }
    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.modules.get(moduleName)?.isLoaded || false;
    }
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        if (this.metrics.totalStartupTime > this.strategy.startupTimeTarget) {
            recommendations.push('Consider enabling more aggressive lazy loading');
            recommendations.push('Review critical module dependencies');
        }
        if (this.metrics.memoryUsageAtStart > this.strategy.memoryBudget) {
            recommendations.push('Consider deferring large modules to lazy loading');
        }
        if (!this.strategy.enableParallelLoading && this.modules.size > 5) {
            recommendations.push('Enable parallel loading for better performance');
        }
        if (this.metrics.parallelizationSavings < 0.2 * this.metrics.moduleLoadTime) {
            recommendations.push('Review module dependencies to enable more parallelization');
        }
        return recommendations;
    }
    // Private implementation methods
    async loadCriticalModules() {
        const criticalStart = performance.now();
        const criticalModules = Array.from(this.modules.values())
            .filter(m => m.priority === ModulePriority.CRITICAL)
            .sort((a, b) => a.dependencies.length - b.dependencies.length);
        logger.info('Loading critical modules', { count: criticalModules.length });
        // Critical modules must be loaded sequentially to ensure proper initialization
        for (const module of criticalModules) {
            await this.loadSingleModule(module);
            this.metrics.criticalModulesLoaded++;
        }
        this.metrics.coreInitTime = performance.now() - criticalStart;
        this.emit('phase:complete', { phase: 'critical', time: this.metrics.coreInitTime });
    }
    async loadHighPriorityModules() {
        const highPriorityModules = Array.from(this.modules.values())
            .filter(m => m.priority === ModulePriority.HIGH);
        if (highPriorityModules.length === 0)
            return;
        logger.info('Loading high priority modules', { count: highPriorityModules.length });
        if (this.strategy.enableParallelLoading) {
            await this.loadModulesInParallel(highPriorityModules, this.strategy.maxParallelLoads);
        }
        else {
            for (const module of highPriorityModules) {
                await this.loadSingleModule(module);
            }
        }
        this.emit('phase:complete', { phase: 'high-priority', modules: highPriorityModules.length });
    }
    async loadNormalPriorityModules() {
        const normalModules = Array.from(this.modules.values())
            .filter(m => m.priority === ModulePriority.NORMAL);
        if (normalModules.length === 0)
            return;
        logger.info('Loading normal priority modules', { count: normalModules.length });
        if (this.strategy.enableParallelLoading) {
            await this.loadModulesInParallel(normalModules, this.strategy.maxParallelLoads);
        }
        else {
            for (const module of normalModules) {
                await this.loadSingleModule(module);
            }
        }
        this.emit('phase:complete', { phase: 'normal-priority', modules: normalModules.length });
    }
    async loadModulesInParallel(modules, maxParallel) {
        const parallelStart = performance.now();
        const sequentialStart = performance.now();
        // Simulate sequential loading time for comparison
        let estimatedSequentialTime = 0;
        for (const module of modules) {
            estimatedSequentialTime += module.loadTime || 100;
        }
        // Load modules in parallel batches
        const batches = this.createLoadBatches(modules, maxParallel);
        for (const batch of batches) {
            await Promise.all(batch.map(module => this.loadSingleModule(module)));
        }
        const actualParallelTime = performance.now() - parallelStart;
        this.metrics.parallelizationSavings += Math.max(0, estimatedSequentialTime - actualParallelTime);
    }
    createLoadBatches(modules, batchSize) {
        const batches = [];
        const processed = new Set();
        const remaining = [...modules];
        while (remaining.length > 0) {
            const batch = [];
            for (let i = 0; i < remaining.length && batch.length < batchSize; i++) {
                const module = remaining[i];
                // Check if all dependencies are loaded
                const dependenciesMet = module.dependencies.every(dep => processed.has(dep) || !this.modules.has(dep));
                if (dependenciesMet) {
                    batch.push(module);
                    processed.add(module.name);
                    remaining.splice(i, 1);
                    i--; // Adjust index after removal
                }
            }
            if (batch.length === 0) {
                // Circular dependency or unresolvable dependencies
                logger.warn('Circular dependency detected, loading remaining modules sequentially');
                batches.push(remaining);
                break;
            }
            batches.push(batch);
        }
        return batches;
    }
    async loadSingleModule(module) {
        if (module.isLoaded) {
            return this.loadedModules.get(module.name);
        }
        const loadStart = performance.now();
        try {
            logger.debug('Loading module', { name: module.name, priority: module.priority });
            // Simulate module loading (in real implementation, would use dynamic import)
            const loadedModule = await this.simulateModuleLoad(module);
            module.isLoaded = true;
            module.loadTime = performance.now() - loadStart;
            this.loadedModules.set(module.name, loadedModule);
            this.metrics.totalModulesLoaded++;
            this.emit('module:loaded', {
                name: module.name,
                loadTime: module.loadTime,
                priority: module.priority
            });
            return loadedModule;
        }
        catch (error) {
            logger.error('Failed to load module', { name: module.name, error });
            throw error;
        }
    }
    async simulateModuleLoad(module) {
        // Simulate loading time based on module priority and complexity
        const baseLoadTime = {
            [ModulePriority.CRITICAL]: 50,
            [ModulePriority.HIGH]: 100,
            [ModulePriority.NORMAL]: 150,
            [ModulePriority.LOW]: 200,
            [ModulePriority.LAZY]: 250
        }[module.priority];
        const loadTime = baseLoadTime + (module.dependencies.length * 10);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    name: module.name,
                    initialized: true,
                    loadTime,
                    memoryFootprint: module.memoryFootprint || 10
                });
            }, loadTime);
        });
    }
    async initializeCoreSystems() {
        const initStart = performance.now();
        // Initialize core application systems
        logger.info('Initializing core systems');
        // Simulate core system initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        this.metrics.coreInitTime += performance.now() - initStart;
        this.emit('phase:complete', { phase: 'core-init', time: this.metrics.coreInitTime });
    }
    async preloadCaches() {
        const cacheStart = performance.now();
        logger.info('Preloading caches and indexes');
        // Simulate cache preloading
        await new Promise(resolve => setTimeout(resolve, 200));
        this.metrics.cacheWarmupTime = performance.now() - cacheStart;
        this.emit('phase:complete', { phase: 'cache-preload', time: this.metrics.cacheWarmupTime });
    }
    startBackgroundWarming() {
        logger.info('Starting background warming');
        // Load low priority modules in background
        const lowPriorityModules = Array.from(this.modules.values())
            .filter(m => m.priority === ModulePriority.LOW && !m.isLoaded);
        // Defer lazy modules
        const lazyModules = Array.from(this.modules.values())
            .filter(m => m.priority === ModulePriority.LAZY);
        this.metrics.lazyModulesDeferred = lazyModules.length;
        // Start background loading with throttling
        if (lowPriorityModules.length > 0) {
            this.loadModulesInBackground(lowPriorityModules);
        }
        this.emit('background:started', {
            lowPriority: lowPriorityModules.length,
            lazy: lazyModules.length
        });
    }
    async loadModulesInBackground(modules) {
        // Load modules with longer delays to avoid interfering with main thread
        for (const module of modules) {
            if (!module.isLoaded) {
                setTimeout(async () => {
                    try {
                        await this.loadSingleModule(module);
                        this.emit('module:loaded:background', { name: module.name });
                    }
                    catch (error) {
                        logger.warn('Background module load failed', { name: module.name, error });
                    }
                }, Math.random() * 5000); // Random delay up to 5 seconds
            }
        }
    }
    calculateFinalMetrics() {
        this.metrics.totalStartupTime = performance.now() - this.startTime;
        // Calculate module load time (excluding core init and cache warmup)
        this.metrics.moduleLoadTime = this.metrics.totalStartupTime -
            this.metrics.coreInitTime -
            this.metrics.cacheWarmupTime;
        // Update memory usage
        const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
        this.metrics.memoryUsageAtStart = currentMemory;
    }
    initializeDefaultProfile() {
        // Register default critical modules
        this.registerModule({
            name: 'logger',
            path: './utils/logger',
            priority: ModulePriority.CRITICAL,
            dependencies: [],
            memoryFootprint: 5
        });
        this.registerModule({
            name: 'config',
            path: './config',
            priority: ModulePriority.CRITICAL,
            dependencies: ['logger'],
            memoryFootprint: 10
        });
        // Register high priority modules
        this.registerModule({
            name: 'ai-client',
            path: './ai/ai-client',
            priority: ModulePriority.HIGH,
            dependencies: ['config', 'logger'],
            memoryFootprint: 50
        });
        this.registerModule({
            name: 'memory-optimizer',
            path: './ai/memory-optimizer',
            priority: ModulePriority.HIGH,
            dependencies: ['config'],
            memoryFootprint: 30
        });
        // Register normal priority modules
        this.registerModule({
            name: 'predictive-cache',
            path: './ai/predictive-ai-cache',
            priority: ModulePriority.NORMAL,
            dependencies: ['memory-optimizer', 'config'],
            memoryFootprint: 40
        });
        this.registerModule({
            name: 'streaming-system',
            path: './ai/streaming-response-system',
            priority: ModulePriority.NORMAL,
            dependencies: ['logger'],
            memoryFootprint: 25
        });
        // Register lazy modules
        this.registerModule({
            name: 'knowledge-graph',
            path: './ai/code-knowledge-graph',
            priority: ModulePriority.LAZY,
            dependencies: ['ai-client', 'memory-optimizer'],
            memoryFootprint: 100
        });
        this.registerModule({
            name: 'realtime-engine',
            path: './ai/realtime-update-engine',
            priority: ModulePriority.LAZY,
            dependencies: ['knowledge-graph'],
            memoryFootprint: 80
        });
    }
}
// Global startup optimizer instance
export const globalStartupOptimizer = new StartupOptimizer();
//# sourceMappingURL=startup-optimizer.js.map