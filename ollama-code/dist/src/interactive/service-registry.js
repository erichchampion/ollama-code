/**
 * Service Registry for Dependency Injection
 *
 * Provides centralized singleton management for components to prevent
 * circular dependencies and duplicate initialization.
 */
import { logger } from '../utils/logger.js';
import { TIMEOUT_CONFIG, getRetryDelay, createCancellableTimeout } from './timeout-config.js';
import { normalizeError, handleComponentError } from './error-handler.js';
export var ServiceState;
(function (ServiceState) {
    ServiceState["NOT_INITIALIZED"] = "not_initialized";
    ServiceState["INITIALIZING"] = "initializing";
    ServiceState["READY"] = "ready";
    ServiceState["FAILED"] = "failed";
})(ServiceState || (ServiceState = {}));
export class ServiceRegistry {
    static instance = null;
    services = new Map();
    initPromises = new Map();
    serviceOptions = new Map();
    metrics = new Map();
    initializationOrder = [];
    cleanupLocks = new Map();
    disposed = false;
    constructor() {
        logger.debug('ServiceRegistry initialized');
    }
    static getInstance() {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }
    /**
     * Get or create a service with singleton behavior
     */
    async getService(name, factory, options = {}) {
        // Check if registry is disposed
        if (this.disposed) {
            throw new Error(`ServiceRegistry has been disposed, cannot get service '${name}'`);
        }
        // Wait for any ongoing cleanup for this service
        if (this.cleanupLocks.has(name)) {
            logger.debug(`Service '${name}' cleanup in progress, waiting...`);
            await this.cleanupLocks.get(name);
        }
        // Initialize metrics if not exists
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                name,
                initTime: 0,
                retryCount: 0,
                lastAccess: new Date(),
                accessCount: 0,
                state: ServiceState.NOT_INITIALIZED
            });
        }
        const metrics = this.metrics.get(name);
        metrics.lastAccess = new Date();
        metrics.accessCount++;
        // Store options for debugging
        this.serviceOptions.set(name, {
            timeout: TIMEOUT_CONFIG.DEFAULT_SERVICE,
            retries: TIMEOUT_CONFIG.DEFAULT_RETRIES,
            description: `Service: ${name}`,
            ...options
        });
        // Return existing service if available
        if (this.services.has(name)) {
            logger.debug(`Service '${name}' returned from cache`);
            return this.services.get(name);
        }
        // Return existing initialization promise if in progress
        if (this.initPromises.has(name)) {
            logger.debug(`Service '${name}' initialization in progress, waiting...`);
            return this.initPromises.get(name);
        }
        // Initialize service with timeout and retry logic
        const initPromise = this.initializeServiceWithRetry(name, factory, options);
        this.initPromises.set(name, initPromise);
        try {
            const service = await initPromise;
            // Check again if we've been disposed during initialization
            if (this.disposed) {
                throw new Error(`ServiceRegistry was disposed during initialization of '${name}'`);
            }
            this.services.set(name, service);
            this.initPromises.delete(name);
            // Update metrics
            metrics.state = ServiceState.READY;
            // Track initialization order for debugging
            this.initializationOrder.push(name);
            logger.debug(`Service '${name}' initialized successfully (${this.initializationOrder.length} total)`);
            return service;
        }
        catch (error) {
            this.initPromises.delete(name);
            if (this.metrics.has(name)) {
                this.metrics.get(name).state = ServiceState.FAILED;
            }
            handleComponentError(error, 'ServiceRegistry', `initialize-${name}`, { serviceName: name });
        }
    }
    /**
     * Initialize service with timeout and retry logic
     */
    async initializeServiceWithRetry(name, factory, options) {
        const { timeout = TIMEOUT_CONFIG.DEFAULT_SERVICE, retries = TIMEOUT_CONFIG.DEFAULT_RETRIES } = options;
        const metrics = this.metrics.get(name);
        let lastError = null;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                metrics.state = ServiceState.INITIALIZING;
                metrics.retryCount = attempt;
                logger.debug(`Initializing service '${name}' (attempt ${attempt + 1}/${retries + 1})`);
                const startTime = Date.now();
                // Create cancellable timeout promise
                const { promise: timeoutPromise, cancel: cancelTimeout } = createCancellableTimeout(timeout, `Service '${name}' initialization timeout after ${timeout}ms`);
                // Race between factory and timeout
                const service = await Promise.race([
                    factory(),
                    timeoutPromise
                ]);
                // Cancel timeout on success
                cancelTimeout();
                metrics.initTime = Date.now() - startTime;
                logger.debug(`Service '${name}' initialized in ${metrics.initTime}ms`);
                return service;
            }
            catch (error) {
                lastError = normalizeError(error);
                logger.warn(`Service '${name}' initialization attempt ${attempt + 1} failed:`, lastError.message);
                // Wait before retry (exponential backoff)
                if (attempt < retries) {
                    const delay = getRetryDelay(attempt);
                    logger.debug(`Retrying service '${name}' in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new Error(`Service '${name}' failed after ${retries + 1} attempts`);
    }
    /**
     * Check if a service is available (cached)
     */
    hasService(name) {
        return this.services.has(name);
    }
    /**
     * Get service state without initializing
     */
    getServiceState(name) {
        const metrics = this.metrics.get(name);
        return metrics?.state || ServiceState.NOT_INITIALIZED;
    }
    /**
     * Get service metrics
     */
    getServiceMetrics(name) {
        return this.metrics.get(name);
    }
    /**
     * Get all service metrics
     */
    getAllMetrics() {
        return Array.from(this.metrics.values());
    }
    /**
     * Get initialization order for debugging
     */
    getInitializationOrder() {
        return [...this.initializationOrder];
    }
    /**
     * Clear a specific service (useful for testing)
     */
    async clearService(name) {
        // Check if there's already a cleanup in progress
        if (this.cleanupLocks.has(name)) {
            await this.cleanupLocks.get(name);
            return;
        }
        // Create cleanup lock to prevent race conditions
        const cleanupPromise = this.performServiceCleanup(name);
        this.cleanupLocks.set(name, cleanupPromise);
        try {
            await cleanupPromise;
        }
        finally {
            this.cleanupLocks.delete(name);
        }
    }
    /**
     * Perform the actual service cleanup
     */
    async performServiceCleanup(name) {
        logger.debug(`Starting cleanup for service '${name}'`);
        // Wait for any ongoing initialization to complete
        if (this.initPromises.has(name)) {
            logger.debug(`Service '${name}' is initializing, waiting for completion before cleanup`);
            try {
                await this.initPromises.get(name);
            }
            catch {
                // Ignore initialization errors during cleanup
                logger.debug(`Service '${name}' initialization failed, proceeding with cleanup`);
            }
        }
        // Now safely clear all references
        this.services.delete(name);
        this.initPromises.delete(name);
        this.serviceOptions.delete(name);
        this.metrics.delete(name);
        const index = this.initializationOrder.indexOf(name);
        if (index > -1) {
            this.initializationOrder.splice(index, 1);
        }
        logger.debug(`Service '${name}' cleared from registry`);
    }
    /**
     * Clear all services (useful for testing)
     */
    async clearAll() {
        logger.debug('Starting clearAll operation');
        // Wait for all ongoing cleanups to complete
        const ongoingCleanups = Array.from(this.cleanupLocks.values());
        if (ongoingCleanups.length > 0) {
            logger.debug(`Waiting for ${ongoingCleanups.length} ongoing cleanups to complete`);
            await Promise.all(ongoingCleanups);
        }
        // Wait for all ongoing initializations to complete
        const ongoingInits = Array.from(this.initPromises.values());
        if (ongoingInits.length > 0) {
            logger.debug(`Waiting for ${ongoingInits.length} ongoing initializations to complete`);
            await Promise.allSettled(ongoingInits); // Use allSettled to not fail if some initializations fail
        }
        // Now safely clear all maps
        this.services.clear();
        this.initPromises.clear();
        this.serviceOptions.clear();
        this.metrics.clear();
        this.cleanupLocks.clear();
        this.initializationOrder = [];
        logger.debug('All services cleared from registry');
    }
    /**
     * Get summary statistics
     */
    getSummary() {
        const metrics = this.getAllMetrics();
        const readyServices = metrics.filter(m => m.state === ServiceState.READY).length;
        const failedServices = metrics.filter(m => m.state === ServiceState.FAILED).length;
        const initializingServices = metrics.filter(m => m.state === ServiceState.INITIALIZING).length;
        const initTimes = metrics.filter(m => m.initTime > 0).map(m => m.initTime);
        return {
            totalServices: metrics.length,
            readyServices,
            failedServices,
            initializingServices,
            averageInitTime: initTimes.length > 0 ? initTimes.reduce((a, b) => a + b, 0) / initTimes.length : 0,
            totalInitTime: initTimes.reduce((a, b) => a + b, 0)
        };
    }
    /**
     * Generate diagnostic report
     */
    getDiagnosticReport() {
        const summary = this.getSummary();
        const metrics = this.getAllMetrics();
        let report = '🔧 Service Registry Diagnostic Report\n\n';
        // Summary
        report += '📊 Summary:\n';
        report += `  Total Services: ${summary.totalServices}\n`;
        report += `  Ready: ${summary.readyServices}\n`;
        report += `  Failed: ${summary.failedServices}\n`;
        report += `  Initializing: ${summary.initializingServices}\n`;
        report += `  Average Init Time: ${summary.averageInitTime.toFixed(1)}ms\n`;
        report += `  Total Init Time: ${summary.totalInitTime}ms\n\n`;
        // Initialization order
        report += '⚡ Initialization Order:\n';
        this.initializationOrder.forEach((name, index) => {
            report += `  ${index + 1}. ${name}\n`;
        });
        report += '\n';
        // Service details
        report += '📋 Service Details:\n';
        metrics.forEach(metric => {
            const icon = {
                [ServiceState.NOT_INITIALIZED]: '⚪',
                [ServiceState.INITIALIZING]: '🔄',
                [ServiceState.READY]: '✅',
                [ServiceState.FAILED]: '❌'
            }[metric.state];
            report += `  ${icon} ${metric.name}: ${metric.state}\n`;
            if (metric.initTime > 0) {
                report += `     Init Time: ${metric.initTime}ms\n`;
            }
            if (metric.retryCount > 0) {
                report += `     Retries: ${metric.retryCount}\n`;
            }
            report += `     Access Count: ${metric.accessCount}\n`;
            report += `     Last Access: ${metric.lastAccess.toISOString()}\n`;
        });
        return report;
    }
    /**
     * Dispose of the registry (cleanup for testing)
     */
    async dispose() {
        if (this.disposed) {
            logger.debug('ServiceRegistry already disposed');
            return;
        }
        logger.debug('Disposing ServiceRegistry');
        this.disposed = true;
        // Clear all services and wait for cleanup to complete
        await this.clearAll();
        // Reset the singleton instance
        ServiceRegistry.instance = null;
        logger.debug('ServiceRegistry disposed');
    }
}
/**
 * Convenience function to get the global service registry
 */
export function getServiceRegistry() {
    return ServiceRegistry.getInstance();
}
//# sourceMappingURL=service-registry.js.map