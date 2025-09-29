/**
 * Initialization State Machine
 *
 * Manages component initialization states and dependency validation
 * to prevent circular dependencies and ensure proper initialization order.
 */
import { logger } from '../utils/logger.js';
export var InitState;
(function (InitState) {
    InitState["NOT_STARTED"] = "not_started";
    InitState["PENDING_DEPENDENCIES"] = "pending_dependencies";
    InitState["INITIALIZING"] = "initializing";
    InitState["READY"] = "ready";
    InitState["FAILED"] = "failed";
    InitState["DEGRADED"] = "degraded";
})(InitState || (InitState = {}));
export class InitializationStateMachine {
    componentStates = new Map();
    stateChangeListeners = new Map();
    globalStateListeners = [];
    initializationOrder = [];
    // Define component dependencies
    dependencies = {
        aiClient: [], // No dependencies
        enhancedClient: [], // No dependencies (handled by LazyInitializers)
        projectContext: [], // No dependencies (lazy)
        intentAnalyzer: ['aiClient'],
        conversationManager: [], // No dependencies
        taskPlanner: ['enhancedClient', 'projectContext'],
        advancedContextManager: ['aiClient', 'projectContext'],
        queryDecompositionEngine: ['aiClient', 'projectContext'],
        codeKnowledgeGraph: ['aiClient', 'projectContext'],
        multiStepQueryProcessor: ['aiClient', 'projectContext'],
        naturalLanguageRouter: ['intentAnalyzer', 'taskPlanner']
    };
    constructor() {
        this.initializeComponentStates();
        logger.debug('InitializationStateMachine created');
    }
    /**
     * Initialize component states
     */
    initializeComponentStates() {
        const allComponents = [
            'aiClient',
            'enhancedClient',
            'projectContext',
            'intentAnalyzer',
            'conversationManager',
            'taskPlanner',
            'advancedContextManager',
            'queryDecompositionEngine',
            'codeKnowledgeGraph',
            'multiStepQueryProcessor',
            'naturalLanguageRouter'
        ];
        allComponents.forEach(component => {
            const dependencies = this.dependencies[component] || [];
            const dependents = this.findDependents(component);
            this.componentStates.set(component, {
                component,
                state: InitState.NOT_STARTED,
                dependencies,
                dependents,
                retryCount: 0,
                lastStateChange: new Date()
            });
        });
    }
    /**
     * Find components that depend on the given component
     */
    findDependents(component) {
        const dependents = [];
        for (const [comp, deps] of Object.entries(this.dependencies)) {
            if (deps?.includes(component)) {
                dependents.push(comp);
            }
        }
        return dependents;
    }
    /**
     * Get current state of a component
     */
    getState(component) {
        const info = this.componentStates.get(component);
        return info?.state || InitState.NOT_STARTED;
    }
    /**
     * Get component state information
     */
    getComponentInfo(component) {
        return this.componentStates.get(component);
    }
    /**
     * Set component state
     */
    setState(component, state, error) {
        const info = this.componentStates.get(component);
        if (!info) {
            logger.warn(`Attempted to set state for unknown component: ${component}`);
            return;
        }
        const previousState = info.state;
        info.state = state;
        info.lastStateChange = new Date();
        if (error) {
            info.error = error;
        }
        if (state === InitState.INITIALIZING && !info.startTime) {
            info.startTime = Date.now();
        }
        if ((state === InitState.READY || state === InitState.FAILED) && info.startTime && !info.endTime) {
            info.endTime = Date.now();
        }
        if (state === InitState.READY) {
            this.initializationOrder.push(component);
        }
        logger.debug(`Component ${component}: ${previousState} → ${state}`);
        // Notify listeners
        this.notifyStateChange(component, state);
        // Update dependent components
        this.updateDependentStates(component);
    }
    /**
     * Check if component can be initialized (all dependencies ready)
     */
    canInitialize(component) {
        const info = this.componentStates.get(component);
        if (!info)
            return false;
        // Already initialized or failed
        if (info.state === InitState.READY || info.state === InitState.FAILED) {
            return false;
        }
        // Check dependencies
        return info.dependencies.every(dep => {
            const depState = this.getState(dep);
            return depState === InitState.READY || depState === InitState.DEGRADED;
        });
    }
    /**
     * Get components ready for initialization
     */
    getReadyToInitialize() {
        const ready = [];
        for (const [component, info] of this.componentStates) {
            if (info.state === InitState.NOT_STARTED && this.canInitialize(component)) {
                ready.push(component);
            }
        }
        return ready;
    }
    /**
     * Get components by state
     */
    getComponentsByState(state) {
        const components = [];
        for (const [component, info] of this.componentStates) {
            if (info.state === state) {
                components.push(component);
            }
        }
        return components;
    }
    /**
     * Start initialization for a component
     */
    startInitialization(component) {
        if (!this.canInitialize(component)) {
            logger.debug(`Component ${component} cannot be initialized - dependencies not ready`);
            return false;
        }
        this.setState(component, InitState.INITIALIZING);
        return true;
    }
    /**
     * Mark component as completed successfully
     */
    completeInitialization(component) {
        this.setState(component, InitState.READY);
    }
    /**
     * Mark component as failed
     */
    failInitialization(component, error) {
        const info = this.componentStates.get(component);
        if (info) {
            info.retryCount++;
        }
        this.setState(component, InitState.FAILED, error);
    }
    /**
     * Mark component as degraded (partially working)
     */
    degradeComponent(component, error) {
        this.setState(component, InitState.DEGRADED, error);
    }
    /**
     * Update dependent component states when a dependency changes
     */
    updateDependentStates(component) {
        const info = this.componentStates.get(component);
        if (!info)
            return;
        info.dependents.forEach(dependent => {
            const depInfo = this.componentStates.get(dependent);
            if (!depInfo)
                return;
            // If dependency failed, mark dependents as pending
            if (info.state === InitState.FAILED && depInfo.state === InitState.PENDING_DEPENDENCIES) {
                // Keep them in pending state
            }
            // If dependency became ready, check if dependent can now initialize
            if (info.state === InitState.READY && depInfo.state === InitState.NOT_STARTED) {
                if (this.canInitialize(dependent)) {
                    this.setState(dependent, InitState.PENDING_DEPENDENCIES);
                }
            }
        });
    }
    /**
     * Add state change listener for a specific component
     */
    addStateListener(component, listener) {
        if (!this.stateChangeListeners.has(component)) {
            this.stateChangeListeners.set(component, []);
        }
        this.stateChangeListeners.get(component).push(listener);
    }
    /**
     * Add global state change listener
     */
    addGlobalStateListener(listener) {
        this.globalStateListeners.push(listener);
    }
    /**
     * Notify state change listeners
     */
    notifyStateChange(component, state) {
        // Component-specific listeners
        const componentListeners = this.stateChangeListeners.get(component) || [];
        componentListeners.forEach(listener => {
            try {
                listener(state);
            }
            catch (error) {
                logger.error(`State listener error for ${component}:`, error);
            }
        });
        // Global listeners
        this.globalStateListeners.forEach(listener => {
            try {
                listener(component, state);
            }
            catch (error) {
                logger.error(`Global state listener error:`, error);
            }
        });
    }
    /**
     * Get initialization summary
     */
    getSummary() {
        const total = this.componentStates.size;
        const ready = this.getComponentsByState(InitState.READY).length;
        const failed = this.getComponentsByState(InitState.FAILED).length;
        const initializing = this.getComponentsByState(InitState.INITIALIZING).length;
        const notStarted = this.getComponentsByState(InitState.NOT_STARTED).length;
        const degraded = this.getComponentsByState(InitState.DEGRADED).length;
        return {
            total,
            ready,
            failed,
            initializing,
            notStarted,
            degraded,
            successRate: total > 0 ? (ready + degraded) / total : 0
        };
    }
    /**
     * Get initialization order
     */
    getInitializationOrder() {
        return [...this.initializationOrder];
    }
    /**
     * Get dependency graph
     */
    getDependencyGraph() {
        return { ...this.dependencies };
    }
    /**
     * Validate dependency graph for cycles
     */
    validateDependencyGraph() {
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const detectCycle = (component, path) => {
            if (recursionStack.has(component)) {
                // Found cycle
                const cycleStart = path.indexOf(component);
                cycles.push(path.slice(cycleStart).concat(component));
                return true;
            }
            if (visited.has(component)) {
                return false;
            }
            visited.add(component);
            recursionStack.add(component);
            const dependencies = this.dependencies[component] || [];
            for (const dep of dependencies) {
                if (detectCycle(dep, [...path, component])) {
                    return true;
                }
            }
            recursionStack.delete(component);
            return false;
        };
        // Check each component
        for (const component of this.componentStates.keys()) {
            if (!visited.has(component)) {
                detectCycle(component, []);
            }
        }
        return {
            valid: cycles.length === 0,
            cycles
        };
    }
    /**
     * Generate diagnostic report
     */
    getDiagnosticReport() {
        const summary = this.getSummary();
        const validation = this.validateDependencyGraph();
        let report = '🔧 Initialization State Machine Report\n\n';
        // Summary
        report += '📊 Summary:\n';
        report += `  Total Components: ${summary.total}\n`;
        report += `  Ready: ${summary.ready}\n`;
        report += `  Failed: ${summary.failed}\n`;
        report += `  Initializing: ${summary.initializing}\n`;
        report += `  Not Started: ${summary.notStarted}\n`;
        report += `  Degraded: ${summary.degraded}\n`;
        report += `  Success Rate: ${(summary.successRate * 100).toFixed(1)}%\n\n`;
        // Dependency validation
        report += '🔍 Dependency Graph Validation:\n';
        if (validation.valid) {
            report += '  ✅ No circular dependencies detected\n';
        }
        else {
            report += '  ❌ Circular dependencies found:\n';
            validation.cycles.forEach((cycle, index) => {
                report += `    ${index + 1}. ${cycle.join(' → ')}\n`;
            });
        }
        report += '\n';
        // Initialization order
        if (this.initializationOrder.length > 0) {
            report += '⚡ Initialization Order:\n';
            this.initializationOrder.forEach((component, index) => {
                report += `  ${index + 1}. ${component}\n`;
            });
            report += '\n';
        }
        // Component states
        report += '📋 Component States:\n';
        for (const [component, info] of this.componentStates) {
            const icon = {
                [InitState.NOT_STARTED]: '⚪',
                [InitState.PENDING_DEPENDENCIES]: '🔶',
                [InitState.INITIALIZING]: '🔄',
                [InitState.READY]: '✅',
                [InitState.FAILED]: '❌',
                [InitState.DEGRADED]: '⚠️'
            }[info.state];
            report += `  ${icon} ${component}: ${info.state}\n`;
            if (info.dependencies.length > 0) {
                report += `     Dependencies: ${info.dependencies.join(', ')}\n`;
            }
            if (info.startTime && info.endTime) {
                const duration = info.endTime - info.startTime;
                report += `     Duration: ${duration}ms\n`;
            }
            if (info.retryCount > 0) {
                report += `     Retries: ${info.retryCount}\n`;
            }
            if (info.error) {
                report += `     Error: ${info.error.message}\n`;
            }
        }
        return report;
    }
    /**
     * Reset all component states (useful for testing)
     */
    reset() {
        this.componentStates.clear();
        this.stateChangeListeners.clear();
        this.globalStateListeners = [];
        this.initializationOrder = [];
        this.initializeComponentStates();
        logger.debug('InitializationStateMachine reset');
    }
    /**
     * Dispose of the state machine
     */
    dispose() {
        this.reset();
        logger.debug('InitializationStateMachine disposed');
    }
}
//# sourceMappingURL=initialization-state-machine.js.map