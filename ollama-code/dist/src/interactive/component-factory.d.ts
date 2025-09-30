/**
 * Component Factory for Lazy Initialization
 *
 * Manages lazy loading and dependency injection for interactive mode components
 * to improve startup performance and reliability.
 */
import { BaseComponentFactory } from './component-factory-interface.js';
export type ComponentType = 'aiClient' | 'enhancedClient' | 'projectContext' | 'intentAnalyzer' | 'taskPlanner' | 'conversationManager' | 'advancedContextManager' | 'queryDecompositionEngine' | 'codeKnowledgeGraph' | 'multiStepQueryProcessor' | 'naturalLanguageRouter';
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
export declare class ComponentFactory extends BaseComponentFactory {
    private components;
    private initPromises;
    private loadProgress;
    private creationStack;
    /**
     * Get a component, lazy loading if necessary
     */
    getComponent<T>(type: ComponentType, config?: ComponentConfig): Promise<T>;
    /**
     * Check if a component is ready (loaded)
     */
    isReady(type: ComponentType): boolean;
    /**
     * Get component load status
     */
    getStatus(type: ComponentType): 'not-loaded' | 'loading' | 'ready' | 'failed';
    /**
     * Get all load progress information
     */
    getAllProgress(): LoadProgress[];
    /**
     * Pre-load components in background
     */
    preloadComponents(types: ComponentType[]): void;
    /**
     * Clear all cached components
     */
    clear(): void;
    /**
     * Helper method to get or create a component with caching
     * Eliminates DRY violation of repeated "components.get() || await getComponent()" pattern
     */
    private getOrCreateComponent;
    /**
     * Create a component instance
     */
    private createComponent;
    /**
     * Internal component creation logic
     */
    private createComponentInternal;
    /**
     * Internal component creation logic (without circular dependency protection)
     */
    private createComponentInternalUnsafe;
    /**
     * Update component loading progress
     */
    private updateProgress;
    /**
     * Get factory capabilities
     */
    getCapabilities(): string[];
    /**
     * Get factory type identifier
     */
    getFactoryType(): 'basic' | 'enhanced';
    /**
     * Create fallback component when circular dependency detected
     */
    private createFallbackComponent;
}
export declare function getComponentFactory(): ComponentFactory;
export declare function resetComponentFactory(): void;
