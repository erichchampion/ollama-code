/**
 * Component Factory Interface
 *
 * Defines the common interface that all component factories must implement.
 * This eliminates the need for type casting between different factory implementations.
 */
import { ComponentType, LoadProgress, ComponentConfig } from './component-factory.js';
/**
 * Base interface for all component factories
 */
export interface IComponentFactory {
    /**
     * Get or create a component
     */
    getComponent<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    /**
     * Set callback for progress updates
     */
    onProgress(callback: (progress: LoadProgress) => void): void;
    /**
     * Check if a component is ready
     */
    isReady(type: ComponentType): boolean;
    /**
     * Clear components
     */
    clear(): Promise<void> | void;
    /**
     * Preload components (optional - not all factories may support this)
     */
    preloadComponents?(types: ComponentType[]): Promise<void> | void;
}
/**
 * Enhanced component factory interface with additional capabilities
 */
export interface IEnhancedComponentFactory extends IComponentFactory {
    /**
     * Get component state
     */
    getComponentState(type: ComponentType): string;
    /**
     * Get all component states
     */
    getAllComponentStates(): Map<ComponentType, string>;
    /**
     * Clear a specific component
     */
    clearComponent(type: ComponentType): Promise<void> | void;
    /**
     * Get diagnostic information
     */
    getDiagnostics(): Promise<{
        registry: string;
        stateMachine: string;
        aiSystem: string;
    }>;
    /**
     * Dispose of the factory
     */
    dispose(): Promise<void> | void;
}
/**
 * Factory creation options
 */
export interface ComponentFactoryOptions {
    /**
     * Enable enhanced features
     */
    enhanced?: boolean;
    /**
     * Working directory for context
     */
    workingDirectory?: string;
    /**
     * Enable performance monitoring
     */
    monitoring?: boolean;
    /**
     * Fallback mode for degraded operation
     */
    fallbackMode?: boolean;
}
/**
 * Factory creation result
 */
export interface ComponentFactoryResult {
    factory: IComponentFactory;
    type: 'basic' | 'enhanced';
    capabilities: string[];
}
/**
 * Abstract base class for component factories
 */
export declare abstract class BaseComponentFactory implements IComponentFactory {
    protected onProgressCallback?: (progress: LoadProgress) => void;
    abstract getComponent<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    abstract isReady(type: ComponentType): boolean;
    abstract clear(): Promise<void> | void;
    onProgress(callback: (progress: LoadProgress) => void): void;
    protected notifyProgress(progress: LoadProgress): void;
    /**
     * Get factory capabilities
     */
    abstract getCapabilities(): string[];
    /**
     * Get factory type identifier
     */
    abstract getFactoryType(): 'basic' | 'enhanced';
}
/**
 * Type guard to check if factory is enhanced
 */
export declare function isEnhancedFactory(factory: IComponentFactory): factory is IEnhancedComponentFactory;
/**
 * Type guard to check if factory supports preloading
 */
export declare function supportsPreloading(factory: IComponentFactory): factory is IComponentFactory & {
    preloadComponents: (types: ComponentType[]) => Promise<void> | void;
};
/**
 * Create a component factory based on options
 */
export declare function createComponentFactory(options?: ComponentFactoryOptions): Promise<ComponentFactoryResult>;
