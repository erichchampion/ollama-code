/**
 * Component Factory for Lazy Initialization
 *
 * Manages lazy loading and dependency injection for interactive mode components
 * to improve startup performance and reliability.
 */

import { logger } from '../utils/logger.js';
import { ProjectContext } from '../ai/context.js';
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
import { BaseComponentFactory, IComponentFactory } from './component-factory-interface.js';

export type ComponentType =
  | 'aiClient'
  | 'enhancedClient'
  | 'projectContext'
  | 'intentAnalyzer'
  | 'taskPlanner'
  | 'conversationManager'
  | 'advancedContextManager'
  | 'queryDecompositionEngine'
  | 'codeKnowledgeGraph'
  | 'multiStepQueryProcessor'
  | 'naturalLanguageRouter';

export interface ComponentConfig {
  timeout?: number;
  essential?: boolean;
  fallback?: () => any;
  workingDirectory?: string;
}

export interface LoadProgress {
  component: ComponentType;
  status: 'loading' | 'ready' | 'failed';
  startTime: number;
  endTime?: number;
  error?: Error;
}

export class ComponentFactory extends BaseComponentFactory {
  private components = new Map<ComponentType, any>();
  private initPromises = new Map<ComponentType, Promise<any>>();
  private loadProgress = new Map<ComponentType, LoadProgress>();

  /**
   * Get a component, lazy loading if necessary
   */
  async getComponent<T>(
    type: ComponentType,
    config: ComponentConfig = {}
  ): Promise<T> {
    // Return existing component if available
    if (this.components.has(type)) {
      return this.components.get(type);
    }

    // Return existing promise if component is being loaded
    if (this.initPromises.has(type)) {
      return this.initPromises.get(type);
    }

    // Start loading the component
    const initPromise = this.createComponent<T>(type, config);
    this.initPromises.set(type, initPromise);

    try {
      const component = await initPromise;
      this.components.set(type, component);
      this.initPromises.delete(type);

      this.updateProgress(type, 'ready');
      return component;
    } catch (error) {
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
  isReady(type: ComponentType): boolean {
    return this.components.has(type);
  }

  /**
   * Get component load status
   */
  getStatus(type: ComponentType): 'not-loaded' | 'loading' | 'ready' | 'failed' {
    if (this.components.has(type)) return 'ready';
    if (this.initPromises.has(type)) return 'loading';

    const progress = this.loadProgress.get(type);
    if (progress?.status === 'failed') return 'failed';

    return 'not-loaded';
  }

  /**
   * Get all load progress information
   */
  getAllProgress(): LoadProgress[] {
    return Array.from(this.loadProgress.values());
  }

  /**
   * Pre-load components in background
   */
  preloadComponents(types: ComponentType[]): void {
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
  clear(): void {
    this.components.clear();
    this.initPromises.clear();
    this.loadProgress.clear();
  }

  /**
   * Create a component instance
   */
  private async createComponent<T>(
    type: ComponentType,
    config: ComponentConfig
  ): Promise<T> {
    this.updateProgress(type, 'loading');

    const startTime = Date.now();
    logger.debug(`Loading component: ${type}`);

    try {
      // Add timeout protection
      const timeout = config.timeout || 10000; // 10 second default
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Component ${type} loading timeout after ${timeout}ms`)), timeout);
      });

      const componentPromise = this.createComponentInternal<T>(type);
      const component = await Promise.race([componentPromise, timeoutPromise]) as T;

      const loadTime = Date.now() - startTime;
      logger.debug(`Component ${type} loaded in ${loadTime}ms`);

      return component;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      logger.error(`Component ${type} failed to load after ${loadTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Internal component creation logic
   */
  private async createComponentInternal<T>(type: ComponentType): Promise<T> {
    switch (type) {
      case 'aiClient':
        return getAIClient() as T;

      case 'enhancedClient':
        return getEnhancedClient() as T;

      case 'projectContext': {
        const lazyContext = new LazyProjectContext(process.cwd());
        // Don't initialize immediately - let it be lazy
        return lazyContext as T;
      }

      case 'intentAnalyzer': {
        const aiClient = getAIClient();
        return new EnhancedIntentAnalyzer(aiClient) as T;
      }

      case 'conversationManager':
        return new ConversationManager() as T;

      case 'taskPlanner': {
        const enhancedClient = this.components.get('enhancedClient') || getEnhancedClient();
        const projectContext = new LazyProjectContext(process.cwd());
        return new TaskPlanner(enhancedClient, projectContext) as T;
      }

      case 'advancedContextManager': {
        const aiClient = this.components.get('aiClient') || getAIClient();
        const projectContext = new LazyProjectContext(process.cwd());
        const manager = new AdvancedContextManager(aiClient, projectContext);
        await manager.initialize();
        return manager as T;
      }

      case 'queryDecompositionEngine': {
        const aiClient = this.components.get('aiClient') || getAIClient();
        const projectContext = new LazyProjectContext(process.cwd());
        const engine = new QueryDecompositionEngine(aiClient, projectContext);
        await engine.initialize();
        return engine as T;
      }

      case 'codeKnowledgeGraph': {
        const aiClient = this.components.get('aiClient') || getAIClient();
        const projectContext = new LazyProjectContext(process.cwd());
        const graph = new CodeKnowledgeGraph(aiClient, projectContext);
        await graph.initialize();
        return graph as T;
      }

      case 'multiStepQueryProcessor': {
        const aiClient = this.components.get('aiClient') || getAIClient();
        const projectContext = new LazyProjectContext(process.cwd());
        return new MultiStepQueryProcessor(aiClient, projectContext) as T;
      }

      case 'naturalLanguageRouter': {
        const aiClient = this.components.get('aiClient') || getAIClient();
        const intentAnalyzer = new EnhancedIntentAnalyzer(aiClient);
        const enhancedClient = this.components.get('enhancedClient') || getEnhancedClient();
        const projectContext = new LazyProjectContext(process.cwd());
        const taskPlanner = new TaskPlanner(enhancedClient, projectContext);
        return new NaturalLanguageRouter(intentAnalyzer, taskPlanner) as T;
      }

      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }

  /**
   * Update component loading progress
   */
  private updateProgress(
    component: ComponentType,
    status: 'loading' | 'ready' | 'failed',
    error?: Error
  ): void {
    const progress: LoadProgress = {
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
  getCapabilities(): string[] {
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
  getFactoryType(): 'basic' | 'enhanced' {
    return 'basic';
  }
}

/**
 * Singleton factory instance
 */
let globalFactory: ComponentFactory | null = null;

export function getComponentFactory(): ComponentFactory {
  if (!globalFactory) {
    globalFactory = new ComponentFactory();
  }
  return globalFactory;
}

export function resetComponentFactory(): void {
  if (globalFactory) {
    globalFactory.clear();
  }
  globalFactory = null;
}