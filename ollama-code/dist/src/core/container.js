/**
 * Dependency Injection Container
 *
 * Replaces singleton pattern with a proper dependency injection system.
 * Provides better testability, modularity, and lifecycle management.
 */
import { logger } from '../utils/logger.js';
export class Container {
    services = new Map();
    instances = new Map();
    loading = new Map();
    config;
    resolveStack = [];
    constructor(config = {}) {
        this.config = {
            enableLogging: false,
            enableCircularDetection: true,
            ...config
        };
    }
    /**
     * Register a service with the container
     */
    register(definition) {
        if (this.config.enableLogging) {
            logger.debug(`Registering service: ${definition.name}`);
        }
        this.services.set(definition.name, definition);
    }
    /**
     * Register a singleton service
     */
    singleton(name, factory, dependencies = []) {
        this.register({
            name,
            factory,
            singleton: true,
            dependencies
        });
    }
    /**
     * Register a transient service (new instance each time)
     */
    transient(name, factory, dependencies = []) {
        this.register({
            name,
            factory,
            singleton: false,
            dependencies
        });
    }
    /**
     * Register a service instance directly
     */
    instance(name, instance) {
        this.instances.set(name, instance);
        this.services.set(name, {
            name,
            factory: () => instance,
            singleton: true
        });
    }
    /**
     * Resolve a service by name
     */
    async resolve(name) {
        if (this.config.enableCircularDetection) {
            if (this.resolveStack.includes(name)) {
                throw new Error(`Circular dependency detected: ${this.resolveStack.join(' -> ')} -> ${name}`);
            }
            this.resolveStack.push(name);
        }
        try {
            const service = this.services.get(name);
            if (!service) {
                throw new Error(`Service '${name}' not registered`);
            }
            // Return cached instance for singletons
            if (service.singleton && this.instances.has(name)) {
                return this.instances.get(name);
            }
            // Return loading promise if already in progress
            if (this.loading.has(name)) {
                return await this.loading.get(name);
            }
            // Resolve dependencies first
            const dependencyPromises = (service.dependencies || []).map(dep => this.resolve(dep));
            await Promise.all(dependencyPromises);
            // Create the service instance
            const loadingPromise = this.createInstance(service);
            this.loading.set(name, loadingPromise);
            const instance = await loadingPromise;
            // Cache singleton instances
            if (service.singleton) {
                this.instances.set(name, instance);
            }
            this.loading.delete(name);
            if (this.config.enableLogging) {
                logger.debug(`Resolved service: ${name}`);
            }
            return instance;
        }
        finally {
            if (this.config.enableCircularDetection) {
                this.resolveStack.pop();
            }
        }
    }
    /**
     * Resolve multiple services at once
     */
    async resolveAll(names) {
        const promises = names.map(async (name) => {
            const instance = await this.resolve(name);
            return [name, instance];
        });
        const results = await Promise.all(promises);
        return Object.fromEntries(results);
    }
    /**
     * Check if a service is registered
     */
    has(name) {
        return this.services.has(name);
    }
    /**
     * Get all registered service names
     */
    getServiceNames() {
        return Array.from(this.services.keys());
    }
    /**
     * Clear all instances (useful for testing)
     */
    clear() {
        this.instances.clear();
        this.loading.clear();
        this.resolveStack = [];
        if (this.config.enableLogging) {
            logger.debug('Container cleared');
        }
    }
    /**
     * Dispose of all resources
     */
    async dispose() {
        // Call dispose method on instances that have it
        for (const [name, instance] of this.instances) {
            if (instance && typeof instance.dispose === 'function') {
                try {
                    await instance.dispose();
                    if (this.config.enableLogging) {
                        logger.debug(`Disposed service: ${name}`);
                    }
                }
                catch (error) {
                    logger.error(`Error disposing service ${name}:`, error);
                }
            }
        }
        this.clear();
    }
    /**
     * Create service instance
     */
    async createInstance(service) {
        try {
            const result = service.factory(this);
            return result instanceof Promise ? await result : result;
        }
        catch (error) {
            logger.error(`Error creating service '${service.name}':`, error);
            throw error;
        }
    }
    /**
     * Create a child container with inherited services
     */
    createChild(config) {
        const child = new Container({ ...this.config, ...config });
        // Copy service definitions (not instances)
        for (const [name, service] of this.services) {
            child.services.set(name, service);
        }
        return child;
    }
}
/**
 * Type-safe container wrapper
 */
export class TypedContainer {
    container;
    constructor(container) {
        this.container = container;
    }
    async resolve(name) {
        return this.container.resolve(name);
    }
    async resolveAll(names) {
        return this.container.resolveAll(names);
    }
    register(definition) {
        this.container.register(definition);
    }
    singleton(name, factory, dependencies) {
        this.container.singleton(name, factory, dependencies);
    }
    transient(name, factory, dependencies) {
        this.container.transient(name, factory, dependencies);
    }
    instance(name, instance) {
        this.container.instance(name, instance);
    }
    has(name) {
        return this.container.has(name);
    }
    clear() {
        this.container.clear();
    }
    async dispose() {
        await this.container.dispose();
    }
    createChild(config) {
        return new TypedContainer(this.container.createChild(config));
    }
}
// Global container instance
export const globalContainer = new TypedContainer(new Container({
    enableLogging: process.env.NODE_ENV === 'development',
    enableCircularDetection: true
}));
//# sourceMappingURL=container.js.map