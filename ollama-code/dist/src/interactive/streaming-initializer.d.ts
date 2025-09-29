/**
 * Streaming Initializer
 *
 * Manages progressive initialization of components with real-time feedback
 * and graceful degradation for improved user experience.
 */
import { ComponentType } from './component-factory.js';
import { IComponentFactory } from './component-factory-interface.js';
export interface InitStep {
    name: string;
    componentType?: ComponentType;
    factory: (preResolvedDependencies?: Map<string, any>) => Promise<any>;
    essential: boolean;
    timeout: number;
    background?: boolean;
    dependencies?: string[];
    description: string;
}
export interface InitializationResult {
    essentialComponentsReady: boolean;
    readyComponents: Set<string>;
    backgroundComponents: Set<string>;
    failedComponents: Map<string, Error>;
    totalTime: number;
    warnings: string[];
}
export declare class StreamingInitializer {
    private terminal;
    private componentFactory;
    private readyComponents;
    private backgroundComponents;
    private failedComponents;
    private warnings;
    private backgroundTasks;
    private activeTimeouts;
    private disposed;
    constructor(componentFactory: IComponentFactory);
    /**
     * Initialize with streaming progress feedback
     */
    initializeStreaming(): Promise<InitializationResult>;
    /**
     * Check if a component is ready
     */
    isComponentReady(name: string): boolean;
    /**
     * Get list of ready components
     */
    getReadyComponents(): string[];
    /**
     * Get background initialization status
     */
    getBackgroundStatus(): {
        completed: number;
        total: number;
        active: string[];
    };
    /**
     * Check if the initializer is disposed (atomic check)
     */
    private checkDisposed;
    /**
     * Wait for specific background components
     */
    waitForComponents(names: string[], timeout?: number): Promise<boolean>;
    /**
     * Initialize terminal with fallback support
     */
    private initializeTerminal;
    /**
     * Initialize essential components (blocking)
     */
    private initializeEssentialComponents;
    /**
     * Initialize background components (serialized to prevent race conditions)
     */
    private initializeBackgroundComponents;
    /**
     * Serialize background initialization to prevent concurrent dependency resolution
     */
    private serializeBackgroundInitialization;
    /**
     * Create a simple dependency container that avoids circular resolution
     */
    private preResolveDependencies;
    /**
     * Wait for specific dependencies to be ready (for serialized loading)
     */
    private waitForDependenciesSerial;
    /**
     * Initialize a single background step
     */
    private initializeBackgroundStep;
    /**
     * Initialize a single background step with pre-resolved dependencies
     */
    private initializeBackgroundStepWithDependencies;
    /**
     * Initialize a step with timeout protection
     */
    private initializeStepWithTimeout;
    /**
     * Initialize a step with timeout protection and pre-resolved dependencies
     */
    private initializeStepWithTimeoutAndDependencies;
    /**
     * Get essential initialization steps
     */
    private getEssentialSteps;
    /**
     * Get background initialization steps with circular dependency avoidance
     */
    private getBackgroundSteps;
    /**
     * Handle component loading progress
     */
    private handleComponentProgress;
    /**
     * Display current capabilities to user
     */
    private displayCapabilities;
    /**
     * Create fallback terminal for non-interactive environments
     */
    private createFallbackTerminal;
    /**
     * Cancel all ongoing operations and cleanup
     */
    cancel(): void;
    /**
     * Dispose of the initializer and cleanup resources
     */
    dispose(): void;
    /**
     * Get status of cleanup operations
     */
    getCleanupStatus(): {
        disposed: boolean;
        activeTimeouts: number;
        backgroundTasks: number;
    };
}
