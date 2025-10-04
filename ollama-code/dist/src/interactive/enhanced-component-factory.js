/**
 * Enhanced Component Factory with Dependency Injection
 *
 * Eliminates circular dependencies by using ServiceRegistry and LazyInitializers.
 * Provides robust component initialization with timeout protection and fallbacks.
 */
import { logger } from '../utils/logger.js';
import { getServiceRegistry } from './service-registry.js';
import { LazyInitializers } from './lazy-initializers.js';
import { InitializationStateMachine, InitState } from './initialization-state-machine.js';
import { LazyProjectContext } from './lazy-project-context.js';
import { TIMEOUT_CONFIG, getComponentTimeout } from './timeout-config.js';
import { ComponentFactoryRegistry } from './component-factory-registry.js';
import { getCurrentWorkingDirectory } from './working-directory-provider.js';
import { CONSTANTS, SERVICE_PREFIXES, SHARED_SERVICES } from './constants.js';
import { normalizeError, handleComponentError } from './error-handler.js';
import { BaseComponentFactory } from './component-factory-interface.js';
export class EnhancedComponentFactory extends BaseComponentFactory {
    registry;
    stateMachine;
    // Legacy compatibility properties
    components = new Map();
    initPromises = new Map();
    loadProgress = new Map();
    /**
     * Generate service name for a component type
     */
    getServiceName(type) {
        return `${SERVICE_PREFIXES.COMPONENT}${type}`;
    }
    constructor() {
        super();
        this.registry = getServiceRegistry();
        this.stateMachine = new InitializationStateMachine();
        // Add state machine listeners to track progress
        this.stateMachine.addGlobalStateListener((component, state) => {
            this.updateProgress(component, this.mapStateToProgress(state));
        });
        logger.debug('EnhancedComponentFactory initialized');
    }
    /**
     * Get a component with enhanced dependency management
     */
    async getComponent(type, config = {}) {
        const serviceName = this.getServiceName(type);
        const options = {
            timeout: config.timeout || getComponentTimeout(type),
            retries: TIMEOUT_CONFIG.DEFAULT_RETRIES,
            description: `Component: ${type}`
        };
        try {
            // Check if we can start initialization
            if (!this.stateMachine.startInitialization(type)) {
                // Dependencies not ready, wait for them
                await this.waitForDependencies(type, config.timeout || getComponentTimeout(type));
            }
            const component = await this.registry.getService(serviceName, () => this.createComponentSafe(type, config), options);
            // Update legacy compatibility maps
            this.components.set(type, component);
            if (this.initPromises.has(type)) {
                this.initPromises.delete(type);
            }
            this.stateMachine.completeInitialization(type);
            return component;
        }
        catch (error) {
            const normalizedErr = normalizeError(error);
            this.stateMachine.failInitialization(type, normalizedErr);
            // Try fallback if available
            if (config.fallback) {
                logger.warn(`Component ${type} failed, using fallback`);
                try {
                    const fallbackComponent = config.fallback();
                    this.stateMachine.degradeComponent(type);
                    return fallbackComponent;
                }
                catch (fallbackError) {
                    handleComponentError(fallbackError, 'EnhancedComponentFactory', `fallback-${type}`, { componentType: type });
                }
            }
            handleComponentError(error, 'EnhancedComponentFactory', `create-${type}`, { componentType: type });
        }
    }
    /**
     * Wait for component dependencies to be ready
     */
    async waitForDependencies(component, timeout) {
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (this.stateMachine.canInitialize(component)) {
                    resolve();
                    return;
                }
                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Dependency timeout for ${component} after ${timeout}ms`));
                    return;
                }
                // Check again after the standard interval
                setTimeout(checkDependencies, CONSTANTS.DEPENDENCY_CHECK_INTERVAL_MS);
            };
            checkDependencies();
        });
    }
    /**
     * Safe component creation with proper error handling
     */
    async createComponentSafe(type, config) {
        logger.debug(`Creating component: ${type}`);
        try {
            // Build dependencies for the component
            const dependencies = {
                workingDirectory: config.workingDirectory || getCurrentWorkingDirectory()
            };
            // Get required dependencies from the registry
            const requiredDeps = ComponentFactoryRegistry.getComponentDependencies(type);
            // For base components, create them directly to avoid circular dependencies
            if (['aiClient', 'enhancedClient', 'projectContext'].includes(type)) {
                // These components should be created directly without dependency resolution
                // to avoid infinite recursion in the service registry
                const component = await ComponentFactoryRegistry.createComponent(type, dependencies);
                return component;
            }
            // Special handling for naturalLanguageRouter to resolve its dependencies properly
            if (type === 'naturalLanguageRouter') {
                // Manually resolve required dependencies for naturalLanguageRouter
                if (!dependencies.aiClient) {
                    dependencies.aiClient = await this.registry.getService(this.getServiceName('aiClient'), async () => await ComponentFactoryRegistry.createComponent('aiClient'));
                }
                if (!dependencies.enhancedClient) {
                    dependencies.enhancedClient = await this.registry.getService(this.getServiceName('enhancedClient'), async () => await ComponentFactoryRegistry.createComponent('enhancedClient'));
                }
                if (!dependencies.projectContext) {
                    dependencies.projectContext = await this.registry.getService(SHARED_SERVICES.PROJECT_CONTEXT, async () => new LazyProjectContext(dependencies.workingDirectory));
                }
                // Now create naturalLanguageRouter directly with all dependencies resolved
                const component = await ComponentFactoryRegistry.createComponent(type, dependencies);
                return component;
            }
            // Resolve dependencies that need to come from other components
            for (const dep of requiredDeps) {
                switch (dep) {
                    case 'aiClient':
                        if (!dependencies.aiClient) {
                            // For aiClient, use the registry directly to avoid circular dependency
                            dependencies.aiClient = await this.registry.getService(this.getServiceName('aiClient'), async () => await ComponentFactoryRegistry.createComponent('aiClient'));
                        }
                        break;
                    case 'enhancedClient':
                        if (!dependencies.enhancedClient) {
                            // For enhancedClient, use the registry directly to avoid circular dependency
                            dependencies.enhancedClient = await this.registry.getService(this.getServiceName('enhancedClient'), async () => await ComponentFactoryRegistry.createComponent('enhancedClient'));
                        }
                        break;
                    case 'projectContext':
                        if (!dependencies.projectContext) {
                            // Use shared project context from registry for consistency
                            dependencies.projectContext = await this.registry.getService(SHARED_SERVICES.PROJECT_CONTEXT, async () => new LazyProjectContext(dependencies.workingDirectory));
                        }
                        break;
                }
            }
            // Create component using centralized factory
            const component = await ComponentFactoryRegistry.createComponent(type, dependencies);
            return component;
        }
        catch (error) {
            handleComponentError(error, 'EnhancedComponentFactory', `createSafe-${type}`, { componentType: type });
        }
    }
    /**
     * Check if component is available (ready)
     */
    hasComponent(type) {
        const serviceName = this.getServiceName(type);
        return this.registry.hasService(serviceName) &&
            this.stateMachine.getState(type) === InitState.READY;
    }
    /**
     * Get component state
     */
    getComponentState(type) {
        return this.stateMachine.getState(type);
    }
    /**
     * Get all component states
     */
    getAllComponentStates() {
        const states = new Map();
        const allComponents = [
            'aiClient', 'enhancedClient', 'projectContext', 'intentAnalyzer',
            'conversationManager', 'taskPlanner', 'advancedContextManager',
            'queryDecompositionEngine', 'codeKnowledgeGraph', 'multiStepQueryProcessor',
            'naturalLanguageRouter'
        ];
        allComponents.forEach(component => {
            states.set(component, this.stateMachine.getState(component));
        });
        return states;
    }
    /**
     * Get components ready for initialization
     */
    getReadyToInitialize() {
        return this.stateMachine.getReadyToInitialize();
    }
    /**
     * Get initialization summary
     */
    getInitializationSummary() {
        return this.stateMachine.getSummary();
    }
    /**
     * Clear a component (useful for testing)
     */
    async clearComponent(type) {
        const serviceName = this.getServiceName(type);
        await this.registry.clearService(serviceName);
        this.stateMachine.setState(type, InitState.NOT_STARTED);
    }
    /**
     * Clear all components
     */
    async clearAllComponents() {
        await this.registry.clearAll();
        this.stateMachine.reset();
    }
    /**
     * Get diagnostic information
     */
    async getDiagnostics() {
        const aiSystem = await LazyInitializers.getHealthReport().catch(() => 'Health check failed');
        return {
            registry: this.registry.getDiagnosticReport(),
            stateMachine: this.stateMachine.getDiagnosticReport(),
            aiSystem
        };
    }
    /**
     * Generate comprehensive diagnostic report
     */
    async getComprehensiveDiagnostics() {
        let report = '🔧 Enhanced Component Factory Diagnostics\n\n';
        // Initialization summary
        const summary = this.getInitializationSummary();
        report += '📊 Initialization Summary:\n';
        report += `  Total Components: ${summary.total}\n`;
        report += `  Ready: ${summary.ready}\n`;
        report += `  Failed: ${summary.failed}\n`;
        report += `  Initializing: ${summary.initializing}\n`;
        report += `  Success Rate: ${(summary.successRate * 100).toFixed(1)}%\n\n`;
        // Component states
        const states = this.getAllComponentStates();
        report += '🏗️  Component States:\n';
        for (const [component, state] of states) {
            const icon = {
                [InitState.NOT_STARTED]: '⚪',
                [InitState.PENDING_DEPENDENCIES]: '🔶',
                [InitState.INITIALIZING]: '🔄',
                [InitState.READY]: '✅',
                [InitState.FAILED]: '❌',
                [InitState.DEGRADED]: '⚠️'
            }[state];
            report += `  ${icon} ${component}: ${state}\n`;
        }
        // Service registry info
        report += '\n' + this.registry.getDiagnosticReport();
        // State machine info
        report += '\n' + this.stateMachine.getDiagnosticReport();
        // AI system health
        try {
            const aiHealth = await LazyInitializers.getHealthReport();
            report += '\n' + aiHealth;
        }
        catch (error) {
            report += '\n❌ AI System Health Check Failed\n';
        }
        return report;
    }
    /**
     * Map state machine states to progress states
     */
    mapStateToProgress(state) {
        switch (state) {
            case InitState.INITIALIZING:
            case InitState.PENDING_DEPENDENCIES:
                return 'loading';
            case InitState.READY:
            case InitState.DEGRADED:
                return 'ready';
            case InitState.FAILED:
                return 'failed';
            default:
                return 'loading';
        }
    }
    /**
     * Update progress tracking
     */
    updateProgress(component, status, error) {
        const componentInfo = this.stateMachine.getComponentInfo(component);
        if (!componentInfo)
            return;
        const progress = {
            component,
            status,
            startTime: componentInfo.startTime || Date.now(),
            endTime: componentInfo.endTime,
            error
        };
        // Re-enabled with async event queuing to prevent circular dependency
        this.notifyProgress(progress);
    }
    /**
     * Check if component is ready (legacy compatibility)
     */
    isReady(type) {
        return this.hasComponent(type);
    }
    /**
     * Clear components (legacy compatibility)
     */
    async clear() {
        await this.clearAllComponents();
    }
    /**
     * Get component without initializing (legacy compatibility)
     */
    getComponentSync(type) {
        const serviceName = this.getServiceName(type);
        if (this.registry.hasService(serviceName)) {
            // This is a bit of a hack, but needed for legacy compatibility
            return this.components.get(type);
        }
        return undefined;
    }
    /**
     * Check if component has failed (legacy compatibility)
     */
    hasFailed(type) {
        return this.getComponentState(type) === InitState.FAILED;
    }
    /**
     * Get component error (legacy compatibility)
     */
    getComponentError(type) {
        const info = this.stateMachine.getComponentInfo(type);
        return info?.error;
    }
    /**
     * Get status of all components (legacy compatibility)
     */
    getStatus() {
        const status = {};
        const states = this.getAllComponentStates();
        for (const [component, state] of states) {
            status[component] = this.mapStateToProgress(state);
        }
        return status;
    }
    /**
     * Get all progress information (legacy compatibility)
     */
    getAllProgress() {
        const progress = [];
        const states = this.getAllComponentStates();
        for (const [component, state] of states) {
            const info = this.stateMachine.getComponentInfo(component);
            progress.push({
                component,
                status: this.mapStateToProgress(state),
                startTime: info?.startTime || Date.now(),
                endTime: info?.endTime,
                error: info?.error
            });
        }
        return progress;
    }
    /**
     * Preload components (legacy compatibility)
     */
    async preloadComponents(types) {
        await Promise.all(types.map(type => this.getComponent(type)));
    }
    /**
     * Create component (legacy compatibility - delegates to getComponent)
     */
    async createComponent(type, config = {}) {
        return this.getComponent(type, config);
    }
    /**
     * Create component internal (legacy compatibility - delegates to createComponentSafe)
     */
    async createComponentInternal(type, config = {}) {
        return this.createComponentSafe(type, config);
    }
    /**
     * Dispose of the factory
     */
    async dispose() {
        await this.registry.dispose();
        this.stateMachine.dispose();
        logger.debug('EnhancedComponentFactory disposed');
    }
    /**
     * Get factory capabilities
     */
    getCapabilities() {
        return [
            'Enhanced component lazy loading',
            'State machine-based initialization',
            'Dependency injection with timeout protection',
            'Advanced progress tracking',
            'Component lifecycle management',
            'Diagnostic and monitoring support',
            'Fallback and degradation handling'
        ];
    }
    /**
     * Get factory type identifier
     */
    getFactoryType() {
        return 'enhanced';
    }
}
/**
 * Global enhanced component factory instance
 */
let globalEnhancedFactory = null;
export function getEnhancedComponentFactory() {
    if (!globalEnhancedFactory) {
        globalEnhancedFactory = new EnhancedComponentFactory();
    }
    return globalEnhancedFactory;
}
export async function resetEnhancedComponentFactory() {
    if (globalEnhancedFactory) {
        await globalEnhancedFactory.dispose();
    }
    globalEnhancedFactory = null;
}
//# sourceMappingURL=enhanced-component-factory.js.map