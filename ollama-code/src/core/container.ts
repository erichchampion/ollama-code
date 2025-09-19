/**
 * Dependency Injection Container
 *
 * Replaces singleton pattern with a proper dependency injection system.
 * Provides better testability, modularity, and lifecycle management.
 */

import { logger } from '../utils/logger.js';

export interface ServiceDefinition<T = any> {
  name: string;
  factory: (container: Container) => T | Promise<T>;
  singleton?: boolean;
  dependencies?: string[];
}

export interface ContainerConfig {
  enableLogging?: boolean;
  enableCircularDetection?: boolean;
}

export class Container {
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();
  private loading = new Map<string, Promise<any>>();
  private config: ContainerConfig;
  private resolveStack: string[] = [];

  constructor(config: ContainerConfig = {}) {
    this.config = {
      enableLogging: false,
      enableCircularDetection: true,
      ...config
    };
  }

  /**
   * Register a service with the container
   */
  register<T>(definition: ServiceDefinition<T>): void {
    if (this.config.enableLogging) {
      logger.debug(`Registering service: ${definition.name}`);
    }

    this.services.set(definition.name, definition);
  }

  /**
   * Register a singleton service
   */
  singleton<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies: string[] = []): void {
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
  transient<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies: string[] = []): void {
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
  instance<T>(name: string, instance: T): void {
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
  async resolve<T>(name: string): Promise<T> {
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
    } finally {
      if (this.config.enableCircularDetection) {
        this.resolveStack.pop();
      }
    }
  }

  /**
   * Resolve multiple services at once
   */
  async resolveAll<T extends Record<string, any>>(names: (keyof T)[]): Promise<T> {
    const promises = names.map(async name => {
      const instance = await this.resolve(name as string);
      return [name, instance] as const;
    });

    const results = await Promise.all(promises);
    return Object.fromEntries(results) as T;
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all instances (useful for testing)
   */
  clear(): void {
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
  async dispose(): Promise<void> {
    // Call dispose method on instances that have it
    for (const [name, instance] of this.instances) {
      if (instance && typeof instance.dispose === 'function') {
        try {
          await instance.dispose();
          if (this.config.enableLogging) {
            logger.debug(`Disposed service: ${name}`);
          }
        } catch (error) {
          logger.error(`Error disposing service ${name}:`, error);
        }
      }
    }

    this.clear();
  }

  /**
   * Create service instance
   */
  private async createInstance<T>(service: ServiceDefinition<T>): Promise<T> {
    try {
      const result = service.factory(this);
      return result instanceof Promise ? await result : result;
    } catch (error) {
      logger.error(`Error creating service '${service.name}':`, error);
      throw error;
    }
  }

  /**
   * Create a child container with inherited services
   */
  createChild(config?: ContainerConfig): Container {
    const child = new Container({ ...this.config, ...config });

    // Copy service definitions (not instances)
    for (const [name, service] of this.services) {
      child.services.set(name, service);
    }

    return child;
  }
}

/**
 * Service registry for type-safe service resolution
 */
export interface ServiceRegistry {
  // Core services
  commandRegistry: any;
  toolRegistry: any;
  logger: any;

  // AI services
  aiClient: any;
  enhancedClient: any;

  // Optimization services
  memoryManager: any;
  aiCacheManager: any;
  progressManager: any;
  errorRecoveryManager: any;
  configValidator: any;
  lazyLoader: any;

  // MCP services
  mcpServer: any;
  mcpClient: any;

  // Other services
  terminal: any;
  projectContext: any;
}

/**
 * Type-safe container wrapper
 */
export class TypedContainer {
  constructor(private container: Container) {}

  async resolve<K extends keyof ServiceRegistry>(name: K): Promise<ServiceRegistry[K]> {
    return this.container.resolve(name as string);
  }

  async resolveAll<T extends Record<string, any>>(names: string[]): Promise<T> {
    return this.container.resolveAll(names);
  }

  register<T>(definition: ServiceDefinition<T>): void {
    this.container.register(definition);
  }

  singleton<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void {
    this.container.singleton(name, factory, dependencies);
  }

  transient<T>(name: string, factory: (container: Container) => T | Promise<T>, dependencies?: string[]): void {
    this.container.transient(name, factory, dependencies);
  }

  instance<T>(name: string, instance: T): void {
    this.container.instance(name, instance);
  }

  has(name: string): boolean {
    return this.container.has(name);
  }

  clear(): void {
    this.container.clear();
  }

  async dispose(): Promise<void> {
    await this.container.dispose();
  }

  createChild(config?: ContainerConfig): TypedContainer {
    return new TypedContainer(this.container.createChild(config));
  }
}

// Global container instance
export const globalContainer = new TypedContainer(new Container({
  enableLogging: process.env.NODE_ENV === 'development',
  enableCircularDetection: true
}));