/**
 * Enhanced Component Factory with Dependency Injection
 *
 * Eliminates circular dependencies by using ServiceRegistry and LazyInitializers.
 * Provides robust component initialization with timeout protection and fallbacks.
 */
import { ComponentType, ComponentConfig, LoadProgress } from './component-factory.js';
import { InitState } from './initialization-state-machine.js';
import { BaseComponentFactory, IEnhancedComponentFactory } from './component-factory-interface.js';
export declare class EnhancedComponentFactory extends BaseComponentFactory implements IEnhancedComponentFactory {
    private registry;
    private stateMachine;
    components: Map<ComponentType, any>;
    initPromises: Map<ComponentType, Promise<any>>;
    loadProgress: Map<ComponentType, LoadProgress>;
    /**
     * Generate service name for a component type
     */
    private getServiceName;
    constructor();
    /**
     * Get a component with enhanced dependency management
     */
    getComponent<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    /**
     * Wait for component dependencies to be ready
     */
    private waitForDependencies;
    /**
     * Safe component creation with proper error handling
     */
    private createComponentSafe;
    /**
     * Check if component is available (ready)
     */
    hasComponent(type: ComponentType): boolean;
    /**
     * Get component state
     */
    getComponentState(type: ComponentType): InitState;
    /**
     * Get all component states
     */
    getAllComponentStates(): Map<ComponentType, InitState>;
    /**
     * Get components ready for initialization
     */
    getReadyToInitialize(): ComponentType[];
    /**
     * Get initialization summary
     */
    getInitializationSummary(): {
        total: number;
        ready: number;
        failed: number;
        initializing: number;
        successRate: number;
    };
    /**
     * Clear a component (useful for testing)
     */
    clearComponent(type: ComponentType): Promise<void>;
    /**
     * Clear all components
     */
    clearAllComponents(): Promise<void>;
    /**
     * Get diagnostic information
     */
    getDiagnostics(): Promise<{
        registry: string;
        stateMachine: string;
        aiSystem: string;
    }>;
    /**
     * Generate comprehensive diagnostic report
     */
    getComprehensiveDiagnostics(): Promise<string>;
    /**
     * Map state machine states to progress states
     */
    private mapStateToProgress;
    /**
     * Update progress tracking
     */
    private updateProgress;
    /**
     * Check if component is ready (legacy compatibility)
     */
    isReady(type: ComponentType): boolean;
    /**
     * Clear components (legacy compatibility)
     */
    clear(): Promise<void>;
    /**
     * Get component without initializing (legacy compatibility)
     */
    getComponentSync(type: ComponentType): any;
    /**
     * Check if component has failed (legacy compatibility)
     */
    hasFailed(type: ComponentType): boolean;
    /**
     * Get component error (legacy compatibility)
     */
    getComponentError(type: ComponentType): Error | undefined;
    /**
     * Get status of all components (legacy compatibility)
     */
    getStatus(): {
        [key in ComponentType]?: 'loading' | 'ready' | 'failed';
    };
    /**
     * Get all progress information (legacy compatibility)
     */
    getAllProgress(): LoadProgress[];
    /**
     * Preload components (legacy compatibility)
     */
    preloadComponents(types: ComponentType[]): Promise<void>;
    /**
     * Create component (legacy compatibility - delegates to getComponent)
     */
    createComponent<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    /**
     * Create component internal (legacy compatibility - delegates to createComponentSafe)
     */
    createComponentInternal<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    /**
     * Dispose of the factory
     */
    dispose(): Promise<void>;
    /**
     * Get factory capabilities
     */
    getCapabilities(): string[];
    /**
     * Get factory type identifier
     */
    getFactoryType(): 'basic' | 'enhanced';
}
export declare function getEnhancedComponentFactory(): EnhancedComponentFactory;
export declare function resetEnhancedComponentFactory(): Promise<void>;
