/**
 * Initialization State Machine
 *
 * Manages component initialization states and dependency validation
 * to prevent circular dependencies and ensure proper initialization order.
 */
import { ComponentType } from './component-factory.js';
export declare enum InitState {
    NOT_STARTED = "not_started",
    PENDING_DEPENDENCIES = "pending_dependencies",
    INITIALIZING = "initializing",
    READY = "ready",
    FAILED = "failed",
    DEGRADED = "degraded"
}
export interface ComponentStateInfo {
    component: ComponentType;
    state: InitState;
    dependencies: ComponentType[];
    dependents: ComponentType[];
    error?: Error;
    startTime?: number;
    endTime?: number;
    retryCount: number;
    lastStateChange: Date;
}
export type DependencyGraph = {
    [key in ComponentType]?: ComponentType[];
};
export declare class InitializationStateMachine {
    private componentStates;
    private stateChangeListeners;
    private globalStateListeners;
    private initializationOrder;
    private readonly dependencies;
    constructor();
    /**
     * Initialize component states
     */
    private initializeComponentStates;
    /**
     * Find components that depend on the given component
     */
    private findDependents;
    /**
     * Get current state of a component
     */
    getState(component: ComponentType): InitState;
    /**
     * Get component state information
     */
    getComponentInfo(component: ComponentType): ComponentStateInfo | undefined;
    /**
     * Set component state
     */
    setState(component: ComponentType, state: InitState, error?: Error): void;
    /**
     * Check if component can be initialized (all dependencies ready)
     */
    canInitialize(component: ComponentType): boolean;
    /**
     * Get components ready for initialization
     */
    getReadyToInitialize(): ComponentType[];
    /**
     * Get components by state
     */
    getComponentsByState(state: InitState): ComponentType[];
    /**
     * Start initialization for a component
     */
    startInitialization(component: ComponentType): boolean;
    /**
     * Mark component as completed successfully
     */
    completeInitialization(component: ComponentType): void;
    /**
     * Mark component as failed
     */
    failInitialization(component: ComponentType, error: Error): void;
    /**
     * Mark component as degraded (partially working)
     */
    degradeComponent(component: ComponentType, error?: Error): void;
    /**
     * Update dependent component states when a dependency changes
     */
    private updateDependentStates;
    /**
     * Add state change listener for a specific component
     */
    addStateListener(component: ComponentType, listener: (state: InitState) => void): void;
    /**
     * Add global state change listener
     */
    addGlobalStateListener(listener: (component: ComponentType, state: InitState) => void): void;
    /**
     * Notify state change listeners
     */
    private notifyStateChange;
    /**
     * Get initialization summary
     */
    getSummary(): {
        total: number;
        ready: number;
        failed: number;
        initializing: number;
        notStarted: number;
        degraded: number;
        successRate: number;
    };
    /**
     * Get initialization order
     */
    getInitializationOrder(): ComponentType[];
    /**
     * Get dependency graph
     */
    getDependencyGraph(): DependencyGraph;
    /**
     * Validate dependency graph for cycles
     */
    validateDependencyGraph(): {
        valid: boolean;
        cycles: ComponentType[][];
    };
    /**
     * Generate diagnostic report
     */
    getDiagnosticReport(): string;
    /**
     * Reset all component states (useful for testing)
     */
    reset(): void;
    /**
     * Dispose of the state machine
     */
    dispose(): void;
}
