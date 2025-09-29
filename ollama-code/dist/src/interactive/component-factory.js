/**
 * Component Factory for Lazy Initialization
 *
 * Manages lazy loading and dependency injection for interactive mode components
 * to improve startup performance and reliability.
 */
import { logger } from '../utils/logger.js';
import { EnhancedIntentAnalyzer } from '../ai/enhanced-intent-analyzer.js';
import { TaskPlanner } from '../ai/task-planner.js';
import { AdvancedContextManager } from '../ai/advanced-context-manager.js';
import { QueryDecompositionEngine } from '../ai/query-decomposition-engine.js';
import { CodeKnowledgeGraph } from '../ai/code-knowledge-graph.js';
import { MultiStepQueryProcessor } from '../ai/multi-step-query-processor.js';
import { ConversationManager } from '../ai/conversation-manager.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';
import { getAIClient, getEnhancedClient } from '../ai/index.js';
import { LazyProjectContext } from './lazy-project-context.js';
import { BaseComponentFactory } from './component-factory-interface.js';
export class ComponentFactory extends BaseComponentFactory {
    components = new Map();
    initPromises = new Map();
    loadProgress = new Map();
    /**
     * Get a component, lazy loading if necessary
     */
    async getComponent(type, config = {}) {
        // Return existing component if available
        if (this.components.has(type)) {
            return this.components.get(type);
        }
        // Return existing promise if component is being loaded
        if (this.initPromises.has(type)) {
            return this.initPromises.get(type);
        }
        // Start loading the component
        const initPromise = this.createComponent(type, config);
        this.initPromises.set(type, initPromise);
        try {
            const component = await initPromise;
            this.components.set(type, component);
            this.initPromises.delete(type);
            this.updateProgress(type, 'ready');
            return component;
        }
        catch (error) {
            this.initPromises.delete(type);
            this.updateProgress(type, 'failed', error instanceof Error ? error : new Error(String(error)));
            // Try fallback if available
            if (config.fallback) {
                logger.warn(`Component ${type} failed, using fallback`);
                const fallbackComponent = config.fallback();
                this.components.set(type, fallbackComponent);
                return fallbackComponent;
            }
            throw error;
        }
    }
    /**
     * Check if a component is ready (loaded)
     */
    isReady(type) {
        return this.components.has(type);
    }
    /**
     * Get component load status
     */
    getStatus(type) {
        if (this.components.has(type))
            return 'ready';
        if (this.initPromises.has(type))
            return 'loading';
        const progress = this.loadProgress.get(type);
        if (progress?.status === 'failed')
            return 'failed';
        return 'not-loaded';
    }
    /**
     * Get all load progress information
     */
    getAllProgress() {
        return Array.from(this.loadProgress.values());
    }
    /**
     * Pre-load components in background
     */
    preloadComponents(types) {
        types.forEach(type => {
            if (!this.components.has(type) && !this.initPromises.has(type)) {
                this.getComponent(type).catch(error => {
                    logger.debug(`Background preload failed for ${type}:`, error);
                });
            }
        });
    }
    /**
     * Clear all cached components
     */
    clear() {
        this.components.clear();
        this.initPromises.clear();
        this.loadProgress.clear();
    }
    /**
     * Create a component instance
     */
    async createComponent(type, config) {
        this.updateProgress(type, 'loading');
        const startTime = Date.now();
        logger.debug(`Loading component: ${type}`);
        try {
            // Add timeout protection
            const timeout = config.timeout || 10000; // 10 second default
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Component ${type} loading timeout after ${timeout}ms`)), timeout);
            });
            const componentPromise = this.createComponentInternal(type);
            const component = await Promise.race([componentPromise, timeoutPromise]);
            const loadTime = Date.now() - startTime;
            logger.debug(`Component ${type} loaded in ${loadTime}ms`);
            return component;
        }
        catch (error) {
            const loadTime = Date.now() - startTime;
            logger.error(`Component ${type} failed to load after ${loadTime}ms:`, error);
            throw error;
        }
    }
    /**
     * Internal component creation logic
     */
    async createComponentInternal(type) {
        switch (type) {
            case 'aiClient':
                return getAIClient();
            case 'enhancedClient':
                return getEnhancedClient();
            case 'projectContext': {
                const lazyContext = new LazyProjectContext(process.cwd());
                // Don't initialize immediately - let it be lazy
                return lazyContext;
            }
            case 'intentAnalyzer': {
                const aiClient = getAIClient();
                return new EnhancedIntentAnalyzer(aiClient);
            }
            case 'conversationManager':
                return new ConversationManager();
            case 'taskPlanner': {
                const enhancedClient = this.components.get('enhancedClient') || getEnhancedClient();
                const projectContext = new LazyProjectContext(process.cwd());
                return new TaskPlanner(enhancedClient, projectContext);
            }
            case 'advancedContextManager': {
                const aiClient = this.components.get('aiClient') || getAIClient();
                const projectContext = new LazyProjectContext(process.cwd());
                const manager = new AdvancedContextManager(aiClient, projectContext);
                await manager.initialize();
                return manager;
            }
            case 'queryDecompositionEngine': {
                const aiClient = this.components.get('aiClient') || getAIClient();
                const projectContext = new LazyProjectContext(process.cwd());
                const engine = new QueryDecompositionEngine(aiClient, projectContext);
                await engine.initialize();
                return engine;
            }
            case 'codeKnowledgeGraph': {
                const aiClient = this.components.get('aiClient') || getAIClient();
                const projectContext = new LazyProjectContext(process.cwd());
                const graph = new CodeKnowledgeGraph(aiClient, projectContext);
                await graph.initialize();
                return graph;
            }
            case 'multiStepQueryProcessor': {
                const aiClient = this.components.get('aiClient') || getAIClient();
                const projectContext = new LazyProjectContext(process.cwd());
                return new MultiStepQueryProcessor(aiClient, projectContext);
            }
            case 'naturalLanguageRouter': {
                const aiClient = this.components.get('aiClient') || getAIClient();
                const intentAnalyzer = new EnhancedIntentAnalyzer(aiClient);
                const enhancedClient = this.components.get('enhancedClient') || getEnhancedClient();
                const projectContext = new LazyProjectContext(process.cwd());
                const taskPlanner = new TaskPlanner(enhancedClient, projectContext);
                return new NaturalLanguageRouter(intentAnalyzer, taskPlanner);
            }
            default:
                throw new Error(`Unknown component type: ${type}`);
        }
    }
    /**
     * Update component loading progress
     */
    updateProgress(component, status, error) {
        const progress = {
            component,
            status,
            startTime: this.loadProgress.get(component)?.startTime || Date.now(),
            endTime: status !== 'loading' ? Date.now() : undefined,
            error
        };
        this.loadProgress.set(component, progress);
        // Re-enabled with async event queuing to prevent circular dependency
        this.notifyProgress(progress);
    }
    /**
     * Get factory capabilities
     */
    getCapabilities() {
        return [
            'Component lazy loading',
            'Progress tracking',
            'Component caching',
            'Basic dependency injection'
        ];
    }
    /**
     * Get factory type identifier
     */
    getFactoryType() {
        return 'basic';
    }
}
/**
 * Singleton factory instance
 */
let globalFactory = null;
export function getComponentFactory() {
    if (!globalFactory) {
        globalFactory = new ComponentFactory();
    }
    return globalFactory;
}
export function resetComponentFactory() {
    if (globalFactory) {
        globalFactory.clear();
    }
    globalFactory = null;
}
//# sourceMappingURL=component-factory.js.map