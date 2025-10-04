/**
 * Streaming Initializer
 *
 * Manages progressive initialization of components with real-time feedback
 * and graceful degradation for improved user experience.
 */
import { logger } from '../utils/logger.js';
import { createSpinner } from '../utils/spinner.js';
import { initTerminal } from '../terminal/index.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { initAI } from '../ai/index.js';
import { createCancellableTimeout } from './timeout-config.js';
import { InteractiveErrorHandler, normalizeError } from './error-handler.js';
export class StreamingInitializer {
    terminal;
    componentFactory;
    readyComponents = new Set();
    backgroundComponents = new Set();
    failedComponents = new Map();
    warnings = [];
    backgroundTasks = new Map();
    activeTimeouts = new Map();
    disposed = false;
    constructor(componentFactory) {
        this.componentFactory = componentFactory;
        // Set up component factory progress callback
        this.componentFactory.onProgress((progress) => {
            this.handleComponentProgress(progress);
        });
    }
    /**
     * Initialize with streaming progress feedback
     */
    async initializeStreaming() {
        const startTime = Date.now();
        logger.info('Starting streaming initialization');
        try {
            // Phase 1: Terminal initialization (must succeed)
            await this.initializeTerminal();
            // Phase 2: Essential components (blocking)
            const essentialSteps = this.getEssentialSteps();
            const essentialSuccess = await this.initializeEssentialComponents(essentialSteps);
            if (essentialSuccess) {
                this.terminal.success('🚀 Interactive mode ready (basic features)');
                this.displayCapabilities();
            }
            // Phase 3: Background components (restored with legacy factory)
            const backgroundSteps = this.getBackgroundSteps();
            this.initializeBackgroundComponents(backgroundSteps);
            const totalTime = Date.now() - startTime;
            return {
                essentialComponentsReady: essentialSuccess,
                readyComponents: this.readyComponents,
                backgroundComponents: this.backgroundComponents,
                failedComponents: this.failedComponents,
                totalTime,
                warnings: this.warnings
            };
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            const normalizedError = normalizeError(error);
            logger.error('Streaming initialization failed:', normalizedError);
            return {
                essentialComponentsReady: false,
                readyComponents: this.readyComponents,
                backgroundComponents: this.backgroundComponents,
                failedComponents: this.failedComponents,
                totalTime,
                warnings: [...this.warnings, normalizedError.message]
            };
        }
    }
    /**
     * Check if a component is ready
     */
    isComponentReady(name) {
        return this.readyComponents.has(name);
    }
    /**
     * Get list of ready components
     */
    getReadyComponents() {
        return Array.from(this.readyComponents);
    }
    /**
     * Get background initialization status
     */
    getBackgroundStatus() {
        const active = Array.from(this.backgroundTasks.keys()).filter(name => !this.readyComponents.has(name) && !this.failedComponents.has(name));
        return {
            completed: this.backgroundComponents.size,
            total: this.backgroundTasks.size,
            active
        };
    }
    /**
     * Check if the initializer is disposed (atomic check)
     */
    checkDisposed(operation) {
        if (this.disposed) {
            throw InteractiveErrorHandler.createValidationError('disposed', true, { component: 'StreamingInitializer', operation });
        }
    }
    /**
     * Wait for specific background components
     */
    async waitForComponents(names, timeout = 30000) {
        this.checkDisposed('waitForComponents');
        const waitId = `wait-${Date.now()}`;
        const waitPromises = names.map(name => {
            if (this.readyComponents.has(name)) {
                return Promise.resolve();
            }
            const backgroundTask = this.backgroundTasks.get(name);
            if (backgroundTask) {
                return backgroundTask;
            }
            // Component not found
            return Promise.reject(new Error(`Component ${name} not found`));
        });
        // Create cancellable timeout
        const { promise: timeoutPromise, cancel: cancelTimeout } = createCancellableTimeout(timeout, 'Component wait timeout');
        // Track timeout for cleanup
        this.activeTimeouts.set(waitId, cancelTimeout);
        try {
            await Promise.race([
                Promise.all(waitPromises),
                timeoutPromise
            ]);
            // Cancel timeout since we completed successfully
            cancelTimeout();
            this.activeTimeouts.delete(waitId);
            return true;
        }
        catch (error) {
            // Cancel timeout on error
            cancelTimeout();
            this.activeTimeouts.delete(waitId);
            logger.warn('Component wait failed:', error);
            return false;
        }
    }
    /**
     * Initialize terminal with fallback support
     */
    async initializeTerminal() {
        try {
            this.terminal = await initTerminal({});
        }
        catch (error) {
            // Fallback for non-interactive terminals
            logger.warn('Standard terminal initialization failed, using fallback');
            this.terminal = this.createFallbackTerminal();
        }
    }
    /**
     * Initialize essential components (blocking)
     */
    async initializeEssentialComponents(steps) {
        logger.info('Initializing essential components...');
        for (const step of steps) {
            const spinner = createSpinner(step.description);
            spinner.start();
            try {
                await this.initializeStepWithTimeout(step);
                this.readyComponents.add(step.name);
                spinner.succeed(`✅ ${step.name} ready`);
            }
            catch (error) {
                const errorObj = normalizeError(error);
                this.failedComponents.set(step.name, errorObj);
                spinner.fail(`❌ ${step.name} failed: ${errorObj.message}`);
                if (step.essential) {
                    logger.error(`Essential component ${step.name} failed, cannot continue`);
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Initialize background components (serialized to prevent race conditions)
     */
    initializeBackgroundComponents(steps) {
        logger.info('Starting serialized background component initialization...');
        // Start serialized background initialization (non-blocking)
        this.serializeBackgroundInitialization(steps).catch(error => {
            logger.error('Background initialization sequence failed:', error);
        });
    }
    /**
     * Serialize background initialization to prevent concurrent dependency resolution
     */
    async serializeBackgroundInitialization(steps) {
        logger.debug('Beginning serialized background loading sequence');
        // Pre-resolve all shared dependencies to prevent circular resolution
        const preResolvedDependencies = await this.preResolveDependencies(steps);
        for (const step of steps) {
            try {
                // Check if we've been disposed before starting each step
                this.checkDisposed('serializeBackgroundInitialization');
                logger.debug(`Serialized loading: ${step.name}`);
                // Wait for dependencies to be ready before proceeding
                if (step.dependencies) {
                    await this.waitForDependenciesSerial(step.dependencies);
                }
                // Initialize the step with pre-resolved dependencies and track it
                const backgroundTask = this.initializeBackgroundStepWithDependencies(step, preResolvedDependencies);
                this.backgroundTasks.set(step.name, backgroundTask);
                // Wait for this step to complete before moving to the next
                await backgroundTask;
                logger.debug(`Serialized loading completed: ${step.name}`);
            }
            catch (error) {
                logger.warn(`Serialized background step ${step.name} failed:`, error);
                // Continue with next step even if this one fails
            }
        }
        logger.debug('Serialized background loading sequence completed');
    }
    /**
     * Create a simple dependency container that avoids circular resolution
     */
    async preResolveDependencies(steps) {
        logger.debug('Creating simple dependency container for background components');
        const resolved = new Map();
        // FUNDAMENTAL FIX: Don't pre-resolve anything - let each component handle its own dependencies
        // This eliminates the circular dependency during the pre-resolution phase
        logger.debug('Using minimal dependency resolution to prevent circular dependencies');
        return resolved;
    }
    /**
     * Wait for specific dependencies to be ready (for serialized loading)
     */
    async waitForDependenciesSerial(dependencies) {
        for (const dep of dependencies) {
            if (!this.readyComponents.has(dep)) {
                logger.debug(`Waiting for dependency: ${dep}`);
                await this.waitForComponents([dep], 30000);
            }
        }
    }
    /**
     * Initialize a single background step
     */
    async initializeBackgroundStep(step) {
        return this.initializeBackgroundStepWithDependencies(step, new Map());
    }
    /**
     * Initialize a single background step with pre-resolved dependencies
     */
    async initializeBackgroundStepWithDependencies(step, preResolvedDependencies) {
        try {
            logger.debug(`Background loading: ${step.name}`);
            await this.initializeStepWithTimeoutAndDependencies(step, preResolvedDependencies);
            this.readyComponents.add(step.name);
            this.backgroundComponents.add(step.name);
            if (this.terminal) {
                this.terminal.info(`🔧 ${step.name} now available`);
            }
        }
        catch (error) {
            const errorObj = normalizeError(error);
            this.failedComponents.set(step.name, errorObj);
            logger.debug(`Background component ${step.name} failed:`, error);
        }
    }
    /**
     * Initialize a step with timeout protection
     */
    async initializeStepWithTimeout(step) {
        return this.initializeStepWithTimeoutAndDependencies(step, new Map());
    }
    /**
     * Initialize a step with timeout protection and pre-resolved dependencies
     */
    async initializeStepWithTimeoutAndDependencies(step, preResolvedDependencies) {
        this.checkDisposed('initializeStep');
        const stepId = `step-${step.name}-${Date.now()}`;
        // Create cancellable timeout
        const { promise: timeoutPromise, cancel: cancelTimeout } = createCancellableTimeout(step.timeout, `${step.name} initialization timeout after ${step.timeout}ms`);
        // Track timeout for cleanup
        this.activeTimeouts.set(stepId, cancelTimeout);
        try {
            await Promise.race([
                step.factory(preResolvedDependencies),
                timeoutPromise
            ]);
            // Cancel timeout since step completed successfully
            cancelTimeout();
            this.activeTimeouts.delete(stepId);
        }
        catch (error) {
            // Cancel timeout on error
            cancelTimeout();
            this.activeTimeouts.delete(stepId);
            throw error;
        }
    }
    /**
     * Get essential initialization steps
     */
    getEssentialSteps() {
        return [
            {
                name: 'ollama-server',
                factory: () => ensureOllamaServerRunning(),
                essential: true,
                timeout: 10000,
                description: 'Ensuring Ollama server is running...'
            },
            {
                name: 'ai-system',
                factory: () => initAI(),
                essential: true,
                timeout: 15000,
                description: 'Initializing AI system...'
            },
            {
                name: 'aiClient',
                componentType: 'aiClient',
                factory: () => this.componentFactory.getComponent('aiClient'),
                essential: true,
                timeout: 5000,
                description: 'Setting up AI client...'
            },
            {
                name: 'intentAnalyzer',
                componentType: 'intentAnalyzer',
                factory: () => this.componentFactory.getComponent('intentAnalyzer'),
                essential: true,
                timeout: 3000,
                description: 'Loading intent analyzer...',
                dependencies: ['aiClient']
            },
            {
                name: 'conversationManager',
                componentType: 'conversationManager',
                factory: () => this.componentFactory.getComponent('conversationManager'),
                essential: true,
                timeout: 2000,
                description: 'Setting up conversation manager...'
            }
        ];
    }
    /**
     * Get background initialization steps with circular dependency avoidance
     */
    getBackgroundSteps() {
        return [
            {
                name: 'projectContext',
                componentType: 'projectContext',
                factory: async () => {
                    // FUNDAMENTAL FIX: Create directly without any dependency resolution
                    const { LazyProjectContext } = await import('./lazy-project-context.js');
                    return new LazyProjectContext(process.cwd());
                },
                essential: false,
                timeout: 20000, // Use 20s for project context analysis as it can be slow
                background: true,
                description: 'Analyzing project context...'
            }
            // FUNDAMENTAL FIX: Skip enhancedClient, taskPlanner, advancedContextManager, codeKnowledgeGraph
            // These components have complex dependencies that cause circular dependency issues
            // They will be lazily loaded when first accessed in the main loop
        ];
    }
    /**
     * Handle component loading progress
     */
    handleComponentProgress(progress) {
        if (progress.status === 'loading') {
            logger.debug(`Loading component: ${progress.component}`);
        }
        else if (progress.status === 'ready') {
            const loadTime = progress.endTime - progress.startTime;
            logger.debug(`Component ${progress.component} ready in ${loadTime}ms`);
        }
        else if (progress.status === 'failed') {
            logger.debug(`Component ${progress.component} failed:`, progress.error);
        }
    }
    /**
     * Display current capabilities to user
     */
    displayCapabilities() {
        const capabilities = [
            '💬 Natural language requests',
            '🤖 Basic AI assistance',
            '💭 Conversation management'
        ];
        this.terminal.info('\n🤖 Ollama Code - Enhanced Interactive Mode\n');
        this.terminal.info('Available now:');
        capabilities.forEach(cap => this.terminal.info(`  ${cap}`));
        this.terminal.info('\nLoading in background:');
        this.terminal.info('  📂 Project analysis');
        this.terminal.info('  🧠 Advanced AI features');
        this.terminal.info('  📊 Code intelligence');
        this.terminal.info('\nSpecial commands:');
        this.terminal.info('  /help - Show help');
        this.terminal.info('  /status - Show component status');
        this.terminal.info('  exit, quit - Exit the application\n');
        const readyCount = this.readyComponents.size;
        const totalCount = this.getEssentialSteps().length + this.getBackgroundSteps().length;
        this.terminal.info(`📊 Components ready: ${readyCount}/${totalCount}\n`);
    }
    /**
     * Create fallback terminal for non-interactive environments
     */
    createFallbackTerminal() {
        return {
            success: (msg) => console.log(`✅ ${msg}`),
            error: (msg) => console.error(`❌ ${msg}`),
            warn: (msg) => console.warn(`⚠️ ${msg}`),
            info: (msg) => console.log(`ℹ️ ${msg}`),
            prompt: async (options) => ({ [options.name]: options.default || '' }),
            clear: () => console.clear(),
            write: (msg) => process.stdout.write(msg)
        };
    }
    /**
     * Cancel all ongoing operations and cleanup
     */
    cancel() {
        if (this.disposed) {
            return;
        }
        logger.debug('Cancelling streaming initializer operations');
        this.disposed = true;
        // Cancel all active timeouts
        for (const [timeoutId, cancelFn] of this.activeTimeouts) {
            logger.debug(`Cancelling timeout: ${timeoutId}`);
            try {
                cancelFn();
            }
            catch (error) {
                logger.debug(`Error cancelling timeout ${timeoutId}:`, error);
            }
        }
        this.activeTimeouts.clear();
        logger.debug(`Cancelled ${this.activeTimeouts.size} active timeouts`);
    }
    /**
     * Dispose of the initializer and cleanup resources
     */
    dispose() {
        this.cancel();
        // Clear all collections
        this.readyComponents.clear();
        this.backgroundComponents.clear();
        this.failedComponents.clear();
        this.warnings = [];
        this.backgroundTasks.clear();
        logger.debug('StreamingInitializer disposed');
    }
    /**
     * Get status of cleanup operations
     */
    getCleanupStatus() {
        return {
            disposed: this.disposed,
            activeTimeouts: this.activeTimeouts.size,
            backgroundTasks: this.backgroundTasks.size
        };
    }
}
//# sourceMappingURL=streaming-initializer.js.map