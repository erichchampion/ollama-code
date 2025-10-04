/**
 * Centralized Component Factory Registry
 *
 * Eliminates duplicate component creation logic by providing a single
 * registry of factory functions for all component types.
 */
import { ComponentType } from './component-factory.js';
import { LazyProjectContext } from './lazy-project-context.js';
import { OllamaClient } from '../ai/ollama-client.js';
import { EnhancedClient } from '../ai/enhanced-client.js';
import { ProjectContext } from '../ai/context.js';
export interface ComponentDependencies {
    aiClient?: OllamaClient;
    enhancedClient?: EnhancedClient;
    projectContext?: ProjectContext | LazyProjectContext;
    workingDirectory?: string;
}
export type ComponentFactory<T = any> = (deps: ComponentDependencies) => Promise<T>;
/**
 * Registry of component factory functions
 */
export declare class ComponentFactoryRegistry {
    private static factories;
    /**
     * Create a standardized dependency error
     */
    private static createDependencyError;
    /**
     * Register all component factory functions
     */
    private static registerFactories;
    /**
     * Create a component using its registered factory
     */
    static createComponent<T>(type: ComponentType, dependencies?: ComponentDependencies): Promise<T>;
    /**
     * Get the dependency requirements for a component
     */
    static getComponentDependencies(type: ComponentType): (keyof ComponentDependencies)[];
    /**
     * Check if a component type is registered
     */
    static hasComponent(type: ComponentType): boolean;
    /**
     * Get all registered component types
     */
    static getRegisteredTypes(): ComponentType[];
    /**
     * Validate that all required dependencies are provided
     */
    static validateDependencies(type: ComponentType, dependencies: ComponentDependencies): void;
}
/**
 * Convenience function to create a component
 */
export declare function createComponent<T>(type: ComponentType, dependencies?: ComponentDependencies): Promise<T>;
/**
 * Resolve dependencies automatically for a component
 */
export declare function createComponentWithAutoResolve<T>(type: ComponentType, baseDirectory?: string): Promise<T>;
