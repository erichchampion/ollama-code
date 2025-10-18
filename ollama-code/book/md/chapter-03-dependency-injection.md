# Chapter 3: Dependency Injection for AI Systems

> *"Make it work, make it right, make it fast." — Kent Beck*

---

## Introduction

In the previous chapters, we built a sophisticated multi-provider AI system with providers, routers, fusion strategies, and managers. But there's a critical question we haven't addressed: **How do all these components find each other?**

Consider this scenario:

```typescript
// The Router needs the ProviderManager
const router = new IntelligentRouter(providerManager, logger);

// But the ProviderManager needs the Router for some operations
const providerManager = new ProviderManager(router, logger);

// Circular dependency! 🔄
```

Or this one:

```typescript
// ConversationManager needs AI completion
const conversationManager = new ConversationManager(router);

// ToolOrchestrator also needs AI completion
const toolOrchestrator = new ToolOrchestrator(router);

// VCSIntelligence needs both
const vcsIntelligence = new VCSIntelligence(conversationManager, toolOrchestrator);

// Who creates what? In what order? 🤔
```

These are the challenges **Dependency Injection (DI)** solves. In this chapter, we'll explore:

1. Why traditional patterns fail for complex AI systems
2. How to design a DI container for TypeScript
3. Service lifecycle management
4. Circular dependency resolution
5. Testing with DI
6. Production deployment patterns

By the end, you'll have a complete, production-ready DI system powering the entire **ollama-code** architecture.

---

## 3.1 Why Dependency Injection?

### The Problem: Manual Dependency Management

Without DI, creating the full system looks like this:

```typescript
// Bad: Manual dependency management nightmare
async function bootstrap() {
  // Create logger first
  const logger = new Logger({ level: 'info' });

  // Create provider manager
  const providerManager = new ProviderManager(logger);

  // Register providers
  const ollama = new OllamaProvider({ baseUrl: 'http://localhost:11434' });
  await ollama.initialize();
  await providerManager.registerProvider('ollama-local', ollama);

  const openai = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
  await openai.initialize();
  await providerManager.registerProvider('openai-main', openai);

  // Create router
  const router = new IntelligentRouter(providerManager, logger);

  // Create fusion
  const fusion = new MajorityVotingFusion(router, logger);

  // Create conversation manager
  const conversationManager = new ConversationManager(router, logger);

  // Create tool orchestrator (needs router AND conversation manager)
  const toolOrchestrator = new ToolOrchestrator(router, conversationManager, logger);

  // Create VCS intelligence (needs multiple dependencies)
  const vcsIntelligence = new VCSIntelligence(
    router,
    conversationManager,
    toolOrchestrator,
    logger
  );

  // Create terminal interface
  const terminal = new TerminalInterface(logger);

  // Create main app (needs EVERYTHING)
  const app = new OllamaCodeApp(
    router,
    fusion,
    conversationManager,
    toolOrchestrator,
    vcsIntelligence,
    terminal,
    logger
  );

  return app;
}
```

**Problems:**

1. ❌ **Order matters**: Create dependencies before dependents
2. ❌ **Duplicated logic**: Initialization scattered everywhere
3. ❌ **Hard to test**: Can't easily mock dependencies
4. ❌ **Brittle**: Adding a dependency requires changing multiple files
5. ❌ **No lifecycle management**: When do we dispose resources?
6. ❌ **Circular dependencies**: Can't be expressed

### The Solution: Dependency Injection

With DI, it looks like this:

```typescript
// Good: DI container manages everything
async function bootstrap() {
  const container = new DIContainer();

  // Register services
  container.register('logger', Logger, { singleton: true });
  container.register('providerManager', ProviderManager, { singleton: true });
  container.register('router', IntelligentRouter, { singleton: true });
  container.register('fusion', MajorityVotingFusion, { singleton: true });
  container.register('conversationManager', ConversationManager, { singleton: true });
  container.register('toolOrchestrator', ToolOrchestrator, { singleton: true });
  container.register('vcsIntelligence', VCSIntelligence, { singleton: true });
  container.register('terminal', TerminalInterface, { singleton: true });
  container.register('app', OllamaCodeApp, { singleton: true });

  // Container resolves all dependencies automatically
  const app = await container.resolve<OllamaCodeApp>('app');

  return app;
}
```

**Benefits:**

1. ✅ **Automatic resolution**: Container figures out the order
2. ✅ **Centralized configuration**: All registrations in one place
3. ✅ **Easy testing**: Swap implementations with mocks
4. ✅ **Flexible**: Change implementations without touching code
5. ✅ **Lifecycle management**: Container handles disposal
6. ✅ **Circular dependency detection**: Container catches and reports issues

### Real-World Benefits in ollama-code

#### Before DI: Tight Coupling

```typescript
// ConversationManager directly creates dependencies
export class ConversationManager {
  private router: IntelligentRouter;

  constructor() {
    // Hard-coded dependency creation
    const providerManager = new ProviderManager(new Logger());
    this.router = new IntelligentRouter(providerManager, new Logger());
  }

  async analyze(prompt: string): Promise<Analysis> {
    return await this.router.route({ prompt, complexity: 'medium' });
  }
}

// Problems:
// - Can't test with mock router
// - Always uses real ProviderManager
// - Creates new Logger instead of sharing
```

#### After DI: Loose Coupling

```typescript
// ConversationManager receives dependencies
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  async analyze(prompt: string): Promise<Analysis> {
    return await this.router.route({ prompt, complexity: 'medium' });
  }
}

// Benefits:
// - Easy to test with mock router
// - Container decides which implementations to use
// - Shared logger instance across all services
```

### Testing Comparison

#### Without DI: Hard to Test

```typescript
// Test is forced to use real dependencies
describe('ConversationManager', () => {
  it('should analyze prompt', async () => {
    // Must create all real dependencies
    const manager = new ConversationManager();

    // Calls real AI providers! Slow, expensive, unreliable
    const result = await manager.analyze('test prompt');

    expect(result).toBeDefined();
  });
});
```

#### With DI: Easy to Test

```typescript
// Test injects mock dependencies
describe('ConversationManager', () => {
  it('should analyze prompt', async () => {
    // Create mock router
    const mockRouter = {
      route: vi.fn().mockResolvedValue({
        providerId: 'test',
        model: 'test-model',
        reasoning: 'test',
        estimatedCost: 0,
        fallbacks: [],
        confidence: 1.0
      })
    };

    const mockLogger = { info: vi.fn(), error: vi.fn() };

    // Inject mocks
    const manager = new ConversationManager(mockRouter as any, mockLogger as any);

    const result = await manager.analyze('test prompt');

    expect(mockRouter.route).toHaveBeenCalledWith({
      prompt: 'test prompt',
      complexity: 'medium'
    });
    expect(result).toBeDefined();
  });
});
```

### Summary: When to Use DI

Use Dependency Injection when:

✅ **Your system has 5+ components** that depend on each other
✅ **You need to test** components in isolation
✅ **You have multiple implementations** of the same interface
✅ **Component lifecycle matters** (initialization, disposal)
✅ **Configuration changes** between environments (dev, test, prod)

Don't overcomplicate simple systems:

❌ **Simple scripts** with 1-2 files don't need DI
❌ **Stateless functions** don't need DI
❌ **Configuration-only** (no behavior) doesn't need DI

For **ollama-code**, with 15+ components, multiple providers, and complex testing needs, DI is essential.

---

## 3.2 Container Architecture

Let's design a production-ready DI container for TypeScript. We'll build it step by step, starting with core concepts.

### Core Concepts

#### 1. Service Registration

A **service** is any class or factory function that provides functionality. Services are **registered** with a unique key:

```typescript
container.register('logger', Logger);
container.register('router', IntelligentRouter);
```

#### 2. Service Resolution

**Resolution** is the process of creating an instance of a service, including all its dependencies:

```typescript
const logger = await container.resolve<Logger>('logger');
const router = await container.resolve<IntelligentRouter>('router');
```

#### 3. Service Lifetime

Services have different **lifetimes**:

- **Transient**: New instance every time
- **Singleton**: Single instance shared across entire application
- **Scoped**: Single instance within a scope (e.g., per request)

```typescript
// Singleton: shared logger
container.register('logger', Logger, { singleton: true });

// Transient: new instance each time
container.register('tempAnalyzer', Analyzer, { singleton: false });
```

#### 4. Dependency Graph

The container builds a **dependency graph** to determine creation order:

```
App
 ├─ Router
 │   ├─ ProviderManager
 │   │   └─ Logger
 │   └─ Logger (shared)
 └─ ConversationManager
     ├─ Router (shared)
     └─ Logger (shared)
```

### Container Interface

```typescript
/**
 * Service registration options
 */
export interface ServiceOptions {
  /** If true, create singleton (default: true) */
  singleton?: boolean;

  /** Factory function to create instance */
  factory?: (container: DIContainer) => any | Promise<any>;

  /** Dependencies to inject (auto-detected if not specified) */
  dependencies?: string[];

  /** Lifecycle hooks */
  lifecycle?: {
    onInit?: (instance: any) => Promise<void> | void;
    onDispose?: (instance: any) => Promise<void> | void;
  };
}

/**
 * Service definition
 */
interface ServiceDefinition {
  key: string;
  constructor?: new (...args: any[]) => any;
  factory?: (container: DIContainer) => any | Promise<any>;
  options: ServiceOptions;
  instance?: any;
  dependencies: string[];
}

/**
 * Dependency Injection Container
 */
export class DIContainer {
  private services = new Map<string, ServiceDefinition>();
  private resolving = new Set<string>();
  private initialized = new Set<string>();

  /**
   * Register a service
   */
  register<T>(
    key: string,
    constructor: new (...args: any[]) => T,
    options: ServiceOptions = {}
  ): void {
    // Implementation coming next
  }

  /**
   * Resolve a service (create or return cached instance)
   */
  async resolve<T>(key: string): Promise<T> {
    // Implementation coming next
  }

  /**
   * Check if service is registered
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Dispose all services
   */
  async dispose(): Promise<void> {
    // Implementation coming next
  }
}
```

### Registration Implementation

```typescript
export class DIContainer {
  private services = new Map<string, ServiceDefinition>();
  private resolving = new Set<string>();
  private initialized = new Set<string>();

  /**
   * Register a service with the container
   */
  register<T>(
    key: string,
    constructor: new (...args: any[]) => T,
    options: ServiceOptions = {}
  ): void {
    if (this.services.has(key)) {
      throw new Error(`Service '${key}' is already registered`);
    }

    // Default to singleton
    const opts: ServiceOptions = {
      singleton: true,
      ...options
    };

    // Extract dependencies from constructor
    const dependencies = opts.dependencies || this.extractDependencies(constructor);

    const definition: ServiceDefinition = {
      key,
      constructor,
      factory: opts.factory,
      options: opts,
      dependencies
    };

    this.services.set(key, definition);
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(
    key: string,
    factory: (container: DIContainer) => T | Promise<T>,
    options: ServiceOptions = {}
  ): void {
    if (this.services.has(key)) {
      throw new Error(`Service '${key}' is already registered`);
    }

    const opts: ServiceOptions = {
      singleton: true,
      ...options
    };

    const definition: ServiceDefinition = {
      key,
      factory,
      options: opts,
      dependencies: opts.dependencies || []
    };

    this.services.set(key, definition);
  }

  /**
   * Register an existing instance
   */
  registerInstance<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service '${key}' is already registered`);
    }

    const definition: ServiceDefinition = {
      key,
      options: { singleton: true },
      instance,
      dependencies: []
    };

    this.services.set(key, definition);
    this.initialized.add(key);
  }

  /**
   * Extract dependencies from constructor parameters
   * This is simplified - in production, use reflect-metadata
   */
  private extractDependencies(constructor: new (...args: any[]) => any): string[] {
    // Get parameter names from function signature
    const funcStr = constructor.toString();
    const match = funcStr.match(/constructor\s*\(([^)]*)\)/);

    if (!match || !match[1].trim()) {
      return [];
    }

    // Parse parameter list
    const params = match[1]
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    // Extract parameter names (simplified - doesn't handle all cases)
    return params.map(param => {
      // Handle: "private router: IntelligentRouter"
      const parts = param.split(':');
      if (parts.length > 1) {
        const name = parts[0].trim().split(' ').pop()!;
        return name;
      }

      // Handle: "router"
      return param.split(' ').pop()!;
    });
  }
}
```

### Resolution Implementation

```typescript
export class DIContainer {
  // ... previous code ...

  /**
   * Resolve a service (create instance or return cached)
   */
  async resolve<T>(key: string): Promise<T> {
    const definition = this.services.get(key);

    if (!definition) {
      throw new Error(`Service '${key}' is not registered`);
    }

    // Return cached singleton instance
    if (definition.options.singleton && definition.instance) {
      return definition.instance;
    }

    // Detect circular dependencies
    if (this.resolving.has(key)) {
      const chain = Array.from(this.resolving).join(' -> ') + ' -> ' + key;
      throw new Error(`Circular dependency detected: ${chain}`);
    }

    try {
      // Mark as resolving
      this.resolving.add(key);

      // Create instance
      const instance = await this.createInstance(definition);

      // Cache singleton
      if (definition.options.singleton) {
        definition.instance = instance;
      }

      // Run lifecycle hook
      if (definition.options.lifecycle?.onInit && !this.initialized.has(key)) {
        await definition.options.lifecycle.onInit(instance);
        this.initialized.add(key);
      }

      return instance;
    } finally {
      // Done resolving
      this.resolving.delete(key);
    }
  }

  /**
   * Create an instance of a service
   */
  private async createInstance(definition: ServiceDefinition): Promise<any> {
    // Use factory if provided
    if (definition.factory) {
      return await definition.factory(this);
    }

    // Use constructor
    if (!definition.constructor) {
      throw new Error(`Service '${definition.key}' has no constructor or factory`);
    }

    // Resolve dependencies
    const dependencies = await Promise.all(
      definition.dependencies.map(dep => this.resolve(dep))
    );

    // Create instance with dependencies
    return new definition.constructor(...dependencies);
  }

  /**
   * Resolve multiple services
   */
  async resolveMany<T>(keys: string[]): Promise<T[]> {
    return await Promise.all(keys.map(key => this.resolve<T>(key)));
  }

  /**
   * Check if service exists
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Get all registered service keys
   */
  keys(): string[] {
    return Array.from(this.services.keys());
  }
}
```

### Disposal Implementation

```typescript
export class DIContainer {
  // ... previous code ...

  /**
   * Dispose all singleton instances
   */
  async dispose(): Promise<void> {
    const instances: Array<{ key: string; instance: any; onDispose?: Function }> = [];

    // Collect all singleton instances
    for (const [key, definition] of this.services) {
      if (definition.instance) {
        instances.push({
          key,
          instance: definition.instance,
          onDispose: definition.options.lifecycle?.onDispose
        });
      }
    }

    // Dispose in reverse order of initialization
    // (dependents before dependencies)
    instances.reverse();

    for (const { key, instance, onDispose } of instances) {
      try {
        // Call lifecycle hook
        if (onDispose) {
          await onDispose(instance);
        }

        // Call IDisposable.dispose() if exists
        if (typeof instance.dispose === 'function') {
          await instance.dispose();
        }
      } catch (error) {
        console.error(`Error disposing service '${key}':`, error);
      }
    }

    // Clear state
    this.services.clear();
    this.resolving.clear();
    this.initialized.clear();
  }

  /**
   * Create a child container (for scoping)
   */
  createScope(): DIContainer {
    const scope = new DIContainer();

    // Copy service definitions (but not instances)
    for (const [key, definition] of this.services) {
      scope.services.set(key, {
        ...definition,
        instance: undefined // New scope gets new instances
      });
    }

    return scope;
  }
}
```

### Usage Example

```typescript
// Create container
const container = new DIContainer();

// Register services
container.register('logger', Logger, {
  singleton: true,
  lifecycle: {
    onInit: async (logger) => {
      await logger.initialize();
    },
    onDispose: async (logger) => {
      await logger.flush();
    }
  }
});

container.register('providerManager', ProviderManager, {
  singleton: true,
  dependencies: ['logger']
});

container.register('router', IntelligentRouter, {
  singleton: true,
  dependencies: ['providerManager', 'logger']
});

container.register('app', OllamaCodeApp, {
  singleton: true,
  dependencies: ['router', 'logger']
});

// Resolve (automatically resolves dependencies)
const app = await container.resolve<OllamaCodeApp>('app');

// Use app
await app.run();

// Clean up
await container.dispose();
```

---

## 3.3 Service Registry Pattern

The **Service Registry** pattern centralizes service registration, making it easy to configure the entire application in one place.

### Registry Implementation

```typescript
/**
 * Service registry for centralized configuration
 */
export class ServiceRegistry {
  /**
   * Register all core services
   */
  static registerCoreServices(container: DIContainer): void {
    // Logger - foundational service
    container.register('logger', Logger, {
      singleton: true,
      factory: () => new Logger({
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'pretty'
      }),
      lifecycle: {
        onInit: async (logger) => {
          logger.info('Logger initialized');
        },
        onDispose: async (logger) => {
          logger.info('Logger disposing');
          await logger.flush();
        }
      }
    });

    // Provider Manager
    container.register('providerManager', ProviderManager, {
      singleton: true,
      dependencies: ['logger']
    });

    // Intelligent Router
    container.register('router', IntelligentRouter, {
      singleton: true,
      dependencies: ['providerManager', 'logger']
    });

    // Response Fusion
    container.register('fusion', MajorityVotingFusion, {
      singleton: true,
      dependencies: ['router', 'logger']
    });
  }

  /**
   * Register AI providers
   */
  static async registerProviders(container: DIContainer): Promise<void> {
    const providerManager = await container.resolve<ProviderManager>('providerManager');
    const logger = await container.resolve<Logger>('logger');

    // Ollama (local)
    if (process.env.OLLAMA_BASE_URL || true) {
      const ollama = new OllamaProvider({
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        defaultModel: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b'
      });

      await ollama.initialize();
      await providerManager.registerProvider('ollama-local', ollama);
      logger.info('Registered Ollama provider');
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG,
        defaultModel: process.env.OPENAI_MODEL || 'gpt-4-turbo'
      });

      await openai.initialize();
      await providerManager.registerProvider('openai-main', openai);

      // Set budget
      providerManager.setBudget({
        providerId: 'openai-main',
        dailyLimit: parseFloat(process.env.OPENAI_DAILY_LIMIT || '10'),
        monthlyLimit: parseFloat(process.env.OPENAI_MONTHLY_LIMIT || '200'),
        alertThresholds: [0.5, 0.75, 0.9]
      });

      logger.info('Registered OpenAI provider');
    }

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new AnthropicProvider({
        apiKey: process.env.ANTHROPIC_API_KEY,
        defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
      });

      await anthropic.initialize();
      await providerManager.registerProvider('anthropic-main', anthropic);

      providerManager.setBudget({
        providerId: 'anthropic-main',
        dailyLimit: parseFloat(process.env.ANTHROPIC_DAILY_LIMIT || '15'),
        monthlyLimit: parseFloat(process.env.ANTHROPIC_MONTHLY_LIMIT || '300'),
        alertThresholds: [0.5, 0.75, 0.9]
      });

      logger.info('Registered Anthropic provider');
    }

    // Google
    if (process.env.GOOGLE_API_KEY) {
      const google = new GoogleProvider({
        apiKey: process.env.GOOGLE_API_KEY,
        defaultModel: process.env.GOOGLE_MODEL || 'gemini-1.5-pro'
      });

      await google.initialize();
      await providerManager.registerProvider('google-main', google);

      providerManager.setBudget({
        providerId: 'google-main',
        dailyLimit: parseFloat(process.env.GOOGLE_DAILY_LIMIT || '10'),
        monthlyLimit: parseFloat(process.env.GOOGLE_MONTHLY_LIMIT || '200'),
        alertThresholds: [0.5, 0.75, 0.9]
      });

      logger.info('Registered Google provider');
    }
  }

  /**
   * Register conversation services
   */
  static registerConversationServices(container: DIContainer): void {
    container.register('conversationManager', ConversationManager, {
      singleton: true,
      dependencies: ['router', 'logger']
    });

    container.register('intentAnalyzer', IntentAnalyzer, {
      singleton: true,
      dependencies: ['router', 'logger']
    });

    container.register('contextEnricher', ContextEnricher, {
      singleton: true,
      dependencies: ['logger']
    });
  }

  /**
   * Register tool services
   */
  static registerToolServices(container: DIContainer): void {
    // Tool registry
    container.register('toolRegistry', ToolRegistry, {
      singleton: true,
      dependencies: ['logger']
    });

    // Tool orchestrator
    container.register('toolOrchestrator', ToolOrchestrator, {
      singleton: true,
      dependencies: ['toolRegistry', 'router', 'logger']
    });

    // Streaming orchestrator
    container.register('streamingOrchestrator', StreamingToolOrchestrator, {
      singleton: true,
      dependencies: ['toolOrchestrator', 'router', 'logger']
    });
  }

  /**
   * Register VCS services
   */
  static registerVCSServices(container: DIContainer): void {
    container.register('vcsIntelligence', VCSIntelligence, {
      singleton: true,
      dependencies: ['router', 'toolOrchestrator', 'logger']
    });

    container.register('commitMessageGenerator', CommitMessageGenerator, {
      singleton: true,
      dependencies: ['router', 'logger']
    });
  }

  /**
   * Register all services
   */
  static async registerAll(container: DIContainer): Promise<void> {
    // Core services
    this.registerCoreServices(container);

    // Conversation services
    this.registerConversationServices(container);

    // Tool services
    this.registerToolServices(container);

    // VCS services
    this.registerVCSServices(container);

    // Register providers (async)
    await this.registerProviders(container);
  }
}
```

### Bootstrap Function

```typescript
/**
 * Bootstrap the application with DI
 */
export async function bootstrap(): Promise<OllamaCodeApp> {
  // Create container
  const container = new DIContainer();

  // Register all services
  await ServiceRegistry.registerAll(container);

  // Register main app
  container.register('app', OllamaCodeApp, {
    singleton: true,
    dependencies: [
      'router',
      'fusion',
      'conversationManager',
      'toolOrchestrator',
      'streamingOrchestrator',
      'vcsIntelligence',
      'logger'
    ]
  });

  // Resolve and return app
  return await container.resolve<OllamaCodeApp>('app');
}

/**
 * Main entry point
 */
async function main() {
  let app: OllamaCodeApp | null = null;

  try {
    // Bootstrap
    app = await bootstrap();

    // Run
    await app.run(process.argv.slice(2));
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  } finally {
    // Clean up
    if (app) {
      await app.dispose();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
```

---

## 3.4 IDisposable Pattern

Managing resource cleanup is critical for long-running AI systems. The **IDisposable** pattern provides a standard way to release resources when they're no longer needed.

### Why Resource Disposal Matters

AI systems often hold resources that must be explicitly released:

- **Network connections** to AI provider APIs
- **File handles** for logs, credentials, cached data
- **Timers and intervals** for health monitoring
- **Database connections** for conversation history
- **Memory buffers** for streaming responses

Without proper disposal:

```typescript
// Bad: Resources leak
class ProviderManager {
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    // Start health monitoring
    this.healthCheckInterval = setInterval(() => {
      this.checkProviderHealth();
    }, 60000);
  }

  // No dispose method - interval keeps running forever!
}

// Application exits but interval still runs
// Memory leak!
```

### IDisposable Interface

```typescript
/**
 * Interface for disposable resources
 */
export interface IDisposable {
  /**
   * Release all resources held by this object
   */
  dispose(): Promise<void> | void;
}

/**
 * Check if an object is disposable
 */
export function isDisposable(obj: any): obj is IDisposable {
  return obj && typeof obj.dispose === 'function';
}
```

### Implementing IDisposable

#### Example 1: Logger with File Handles

```typescript
export class Logger implements IDisposable {
  private fileHandle: FileHandle | null = null;
  private buffer: string[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  async initialize(logFilePath: string): Promise<void> {
    // Open log file
    this.fileHandle = await fs.open(logFilePath, 'a');

    // Flush buffer periodically
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000);
  }

  info(message: string): void {
    this.buffer.push(`[INFO] ${new Date().toISOString()} ${message}\n`);
  }

  error(message: string, error?: any): void {
    const errorMsg = error ? ` ${error.stack || error.message}` : '';
    this.buffer.push(`[ERROR] ${new Date().toISOString()} ${message}${errorMsg}\n`);
  }

  async flush(): Promise<void> {
    if (!this.fileHandle || this.buffer.length === 0) return;

    const content = this.buffer.join('');
    this.buffer = [];

    await this.fileHandle.write(content);
  }

  /**
   * Dispose: flush buffer, close file, clear interval
   */
  async dispose(): Promise<void> {
    // Stop flush interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Final flush
    await this.flush();

    // Close file handle
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
  }
}
```

#### Example 2: Provider Manager with Cleanup

```typescript
export class ProviderManager implements IDisposable {
  private providers = new Map<string, BaseAIProvider>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private usageStats = new Map<string, ProviderUsageStats>();

  constructor(private logger: Logger) {
    // Start health monitoring
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllProviderHealth();
    }, 60000);
  }

  async registerProvider(id: string, provider: BaseAIProvider): Promise<void> {
    this.providers.set(id, provider);
    await provider.initialize();
  }

  private async checkAllProviderHealth(): Promise<void> {
    for (const [id, provider] of this.providers) {
      try {
        await provider.performHealthCheck();
      } catch (error) {
        this.logger.error(`Health check failed for ${id}`, error);
      }
    }
  }

  /**
   * Dispose: stop health checks, dispose all providers, save stats
   */
  async dispose(): Promise<void> {
    this.logger.info('ProviderManager disposing...');

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Save usage statistics
    await this.saveUsageStats();

    // Dispose all providers
    for (const [id, provider] of this.providers) {
      try {
        if (isDisposable(provider)) {
          await provider.dispose();
        }
      } catch (error) {
        this.logger.error(`Error disposing provider ${id}`, error);
      }
    }

    this.providers.clear();
    this.usageStats.clear();

    this.logger.info('ProviderManager disposed');
  }

  private async saveUsageStats(): Promise<void> {
    const stats = Object.fromEntries(this.usageStats);
    const statsFile = path.join(os.homedir(), '.ollama-code', 'usage-stats.json');
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
  }
}
```

#### Example 3: Base AI Provider

```typescript
export abstract class BaseAIProvider extends EventEmitter implements IDisposable {
  protected config: ProviderConfig;
  protected health: ProviderHealth;
  protected metrics: ProviderMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: ProviderConfig) {
    super();
    this.config = config;
    this.health = { status: 'unknown', lastCheck: Date.now() };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0
    };

    // Auto health check
    if (config.healthCheckInterval) {
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, config.healthCheckInterval);
    }
  }

  abstract getName(): string;
  abstract initialize(): Promise<void>;
  abstract complete(prompt: string, options?: CompletionOptions): Promise<AICompletionResponse>;

  /**
   * Dispose provider resources
   */
  async dispose(): Promise<void> {
    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Remove all event listeners
    this.removeAllListeners();

    // Subclasses can override for additional cleanup
  }
}
```

### Composite Disposal

When an object contains multiple disposable children:

```typescript
export class OllamaCodeApp implements IDisposable {
  constructor(
    private router: IntelligentRouter,
    private fusion: MajorityVotingFusion,
    private conversationManager: ConversationManager,
    private toolOrchestrator: ToolOrchestrator,
    private vcsIntelligence: VCSIntelligence,
    private terminal: TerminalInterface,
    private logger: Logger
  ) {}

  async run(args: string[]): Promise<void> {
    // Application logic
  }

  /**
   * Dispose all components in reverse order of dependency
   */
  async dispose(): Promise<void> {
    this.logger.info('Application shutting down...');

    const components = [
      { name: 'VCS Intelligence', obj: this.vcsIntelligence },
      { name: 'Tool Orchestrator', obj: this.toolOrchestrator },
      { name: 'Conversation Manager', obj: this.conversationManager },
      { name: 'Response Fusion', obj: this.fusion },
      { name: 'Router', obj: this.router },
      { name: 'Terminal', obj: this.terminal },
      { name: 'Logger', obj: this.logger }
    ];

    for (const { name, obj } of components) {
      try {
        if (isDisposable(obj)) {
          this.logger.info(`Disposing ${name}...`);
          await obj.dispose();
        }
      } catch (error) {
        this.logger.error(`Error disposing ${name}`, error);
      }
    }

    this.logger.info('Application shut down complete');
  }
}
```

### Disposal Helper Utilities

```typescript
/**
 * Dispose multiple objects
 */
export async function disposeAll(objects: any[]): Promise<void> {
  const errors: Error[] = [];

  for (const obj of objects) {
    try {
      if (isDisposable(obj)) {
        await obj.dispose();
      }
    } catch (error) {
      errors.push(error as Error);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'One or more disposals failed');
  }
}

/**
 * Using statement (C# style)
 */
export async function using<T extends IDisposable, R>(
  resource: T,
  fn: (resource: T) => Promise<R>
): Promise<R> {
  try {
    return await fn(resource);
  } finally {
    await resource.dispose();
  }
}

// Usage
await using(new Logger({ file: 'app.log' }), async (logger) => {
  logger.info('Processing...');
  // Logger automatically disposed after this block
});

/**
 * Disposable scope
 */
export class DisposableScope implements IDisposable {
  private disposables: IDisposable[] = [];

  /**
   * Add a disposable to this scope
   */
  add<T extends IDisposable>(disposable: T): T {
    this.disposables.push(disposable);
    return disposable;
  }

  /**
   * Dispose all in reverse order
   */
  async dispose(): Promise<void> {
    const errors: Error[] = [];

    // Dispose in reverse order (LIFO)
    for (let i = this.disposables.length - 1; i >= 0; i--) {
      try {
        await this.disposables[i].dispose();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    this.disposables = [];

    if (errors.length > 0) {
      throw new AggregateError(errors, 'One or more disposals failed');
    }
  }
}

// Usage
const scope = new DisposableScope();

const logger = scope.add(new Logger({ file: 'app.log' }));
const manager = scope.add(new ProviderManager(logger));
const router = scope.add(new IntelligentRouter(manager, logger));

// Use resources...

// Dispose all in reverse order
await scope.dispose();
```

### Integration with DI Container

The DI container automatically calls `dispose()` on singletons:

```typescript
export class DIContainer implements IDisposable {
  // ... previous implementation ...

  /**
   * Dispose all singleton instances
   */
  async dispose(): Promise<void> {
    const instances: Array<{ key: string; instance: any; onDispose?: Function }> = [];

    // Collect all singleton instances
    for (const [key, definition] of this.services) {
      if (definition.instance) {
        instances.push({
          key,
          instance: definition.instance,
          onDispose: definition.options.lifecycle?.onDispose
        });
      }
    }

    // Dispose in reverse order of initialization
    instances.reverse();

    const errors: Error[] = [];

    for (const { key, instance, onDispose } of instances) {
      try {
        // Call lifecycle hook
        if (onDispose) {
          await onDispose(instance);
        }

        // Call IDisposable.dispose() if exists
        if (isDisposable(instance)) {
          await instance.dispose();
        }
      } catch (error) {
        console.error(`Error disposing service '${key}':`, error);
        errors.push(error as Error);
      }
    }

    // Clear state
    this.services.clear();
    this.resolving.clear();
    this.initialized.clear();

    if (errors.length > 0) {
      throw new AggregateError(errors, 'One or more service disposals failed');
    }
  }
}
```

### Best Practices

#### 1. Always Implement IDisposable for Resources

```typescript
// Good: Explicitly implements IDisposable
export class DatabaseConnection implements IDisposable {
  private connection: Connection | null = null;

  async connect(): Promise<void> {
    this.connection = await createConnection(/*...*/);
  }

  async dispose(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
```

#### 2. Dispose in Reverse Order

Dependencies should be disposed before dependents:

```typescript
// Good: Reverse order disposal
async function shutdown() {
  await app.dispose();          // Depends on router
  await router.dispose();       // Depends on providerManager
  await providerManager.dispose(); // Depends on logger
  await logger.dispose();       // No dependencies
}
```

#### 3. Idempotent Disposal

`dispose()` should be safe to call multiple times:

```typescript
// Good: Idempotent disposal
async dispose(): Promise<void> {
  if (this.disposed) return;
  this.disposed = true;

  // Clean up resources
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = null;
  }

  if (this.connection) {
    await this.connection.close();
    this.connection = null;
  }
}
```

#### 4. Handle Disposal Errors

```typescript
// Good: Error handling in disposal
async dispose(): Promise<void> {
  const errors: Error[] = [];

  try {
    await this.flushLogs();
  } catch (error) {
    errors.push(error as Error);
  }

  try {
    await this.closeConnections();
  } catch (error) {
    errors.push(error as Error);
  }

  // Continue cleanup even if some steps fail
  this.cleanup();

  if (errors.length > 0) {
    throw new AggregateError(errors, 'Disposal encountered errors');
  }
}
```

---

## 3.5 Circular Dependency Resolution

Circular dependencies occur when two or more services depend on each other, either directly or indirectly.

### Types of Circular Dependencies

#### 1. Direct Circular Dependency

```typescript
// A depends on B
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

// B depends on A (circular!)
class ServiceB {
  constructor(private serviceA: ServiceA) {}
}

// Cannot be created:
// To create A, we need B
// To create B, we need A
// Infinite loop!
```

#### 2. Indirect Circular Dependency

```typescript
// A → B → C → A (circular chain)
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

class ServiceB {
  constructor(private serviceC: ServiceC) {}
}

class ServiceC {
  constructor(private serviceA: ServiceA) {}
}
```

### Detection in DI Container

Our container detects circular dependencies:

```typescript
export class DIContainer {
  private resolving = new Set<string>();

  async resolve<T>(key: string): Promise<T> {
    // Detect circular dependency
    if (this.resolving.has(key)) {
      const chain = Array.from(this.resolving).join(' -> ') + ' -> ' + key;
      throw new Error(`Circular dependency detected: ${chain}`);
    }

    try {
      this.resolving.add(key);
      // ... resolution logic ...
    } finally {
      this.resolving.delete(key);
    }
  }
}
```

### Breaking Circular Dependencies

#### Strategy 1: Dependency Inversion

Introduce an interface to break the cycle:

```typescript
// Before: Circular dependency
class ConversationManager {
  constructor(private toolOrchestrator: ToolOrchestrator) {}
}

class ToolOrchestrator {
  constructor(private conversationManager: ConversationManager) {}
}

// After: Dependency inversion with interface
interface IConversationContext {
  getCurrentConversation(): Conversation;
  addMessage(message: Message): void;
}

class ConversationManager implements IConversationContext {
  constructor(private toolOrchestrator: ToolOrchestrator) {}

  getCurrentConversation(): Conversation {
    return this.currentConversation;
  }

  addMessage(message: Message): void {
    this.currentConversation.messages.push(message);
  }
}

// ToolOrchestrator depends on interface, not concrete class
class ToolOrchestrator {
  constructor(private context: IConversationContext) {}
}

// No circular dependency!
```

#### Strategy 2: Lazy Injection

Inject a factory function instead of the actual dependency:

```typescript
// Before: Circular dependency
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

class ServiceB {
  constructor(private serviceA: ServiceA) {}
}

// After: Lazy injection with factory
class ServiceA {
  private _serviceB: ServiceB | null = null;

  constructor(private serviceBFactory: () => ServiceB) {}

  private get serviceB(): ServiceB {
    if (!this._serviceB) {
      this._serviceB = this.serviceBFactory();
    }
    return this._serviceB;
  }

  doSomething(): void {
    // serviceB is resolved lazily
    this.serviceB.execute();
  }
}

class ServiceB {
  constructor(private serviceA: ServiceA) {}
}

// Register with container
container.registerFactory('serviceA', (c) => {
  return new ServiceA(() => c.resolve('serviceB'));
});

container.register('serviceB', ServiceB, {
  dependencies: ['serviceA']
});
```

#### Strategy 3: Event-Based Decoupling

Use events instead of direct dependencies:

```typescript
// Before: Circular dependency
class ConversationManager {
  constructor(private toolOrchestrator: ToolOrchestrator) {}

  async handleMessage(message: string): Promise<void> {
    const result = await this.toolOrchestrator.execute(message);
    // Process result
  }
}

class ToolOrchestrator {
  constructor(private conversationManager: ConversationManager) {}

  async execute(message: string): Promise<void> {
    // Need to update conversation
    await this.conversationManager.addMessage(message);
  }
}

// After: Event-based decoupling
class ConversationManager extends EventEmitter {
  constructor() {
    super();
  }

  async handleMessage(message: string): Promise<void> {
    this.emit('message', message);
  }
}

class ToolOrchestrator {
  constructor(private eventBus: EventEmitter) {
    // Listen to events instead of direct dependency
    this.eventBus.on('message', (message) => {
      this.execute(message);
    });
  }

  async execute(message: string): Promise<void> {
    // Emit event instead of calling conversationManager
    this.eventBus.emit('tool_result', result);
  }
}

// No circular dependency - both depend on EventEmitter
```

#### Strategy 4: Split Responsibilities

Sometimes circular dependencies indicate poor separation of concerns:

```typescript
// Before: ConversationManager and ToolOrchestrator are too coupled
class ConversationManager {
  constructor(private toolOrchestrator: ToolOrchestrator) {}
}

class ToolOrchestrator {
  constructor(private conversationManager: ConversationManager) {}
}

// After: Extract shared logic into a third service
class MessageBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  emit(event: string, data: any): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

class ConversationManager {
  constructor(private messageBus: MessageBus) {
    this.messageBus.on('tool_result', (result) => {
      this.handleToolResult(result);
    });
  }

  async handleMessage(message: string): Promise<void> {
    this.messageBus.emit('message', message);
  }
}

class ToolOrchestrator {
  constructor(private messageBus: MessageBus) {
    this.messageBus.on('message', (message) => {
      this.execute(message);
    });
  }

  async execute(message: string): Promise<void> {
    const result = await this.runTools(message);
    this.messageBus.emit('tool_result', result);
  }
}

// Both depend on MessageBus, no circular dependency
```

### Real-World Example: ollama-code

In ollama-code, we broke a circular dependency between `StreamingOrchestrator` and `ConversationManager`:

```typescript
// Problem: StreamingOrchestrator needs ConversationManager to add messages
// ConversationManager needs StreamingOrchestrator to execute tools

// Solution: Dependency inversion with interface
interface IConversationContext {
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void;
  getMessages(): Message[];
  getCurrentModel(): string;
}

class ConversationManager implements IConversationContext {
  private messages: Message[] = [];

  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.messages.push({ role, content, timestamp: Date.now() });
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }
}

class StreamingOrchestrator {
  constructor(
    private context: IConversationContext, // Interface, not concrete class
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  async stream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    // Use context interface
    this.context.addMessage('user', prompt);

    // Stream response
    const messages = this.context.getMessages();
    // ... streaming logic ...
  }
}

// Register with container
container.register('conversationManager', ConversationManager, {
  singleton: true,
  dependencies: ['router', 'logger']
});

container.register('streamingOrchestrator', StreamingOrchestrator, {
  singleton: true,
  dependencies: ['conversationManager', 'router', 'logger']
  // conversationManager satisfies IConversationContext interface
});
```

### Prevention Strategies

#### 1. Design for Dependency Flow

```typescript
// Good: Clear dependency hierarchy
// Layer 1 (Foundation)
Logger

// Layer 2 (Infrastructure)
ProviderManager → Logger

// Layer 3 (Core Services)
Router → ProviderManager, Logger
Fusion → Router, Logger

// Layer 4 (Application Services)
ConversationManager → Router, Logger
ToolOrchestrator → Router, Logger

// Layer 5 (Orchestration)
App → ConversationManager, ToolOrchestrator, Router, Logger

// Dependencies only flow downward (higher layers depend on lower layers)
```

#### 2. Use Mediator Pattern

```typescript
// Mediator coordinates between components without creating cycles
class ApplicationMediator {
  constructor(
    private logger: Logger
  ) {}

  async handleUserMessage(message: string): Promise<void> {
    // Coordinate between services
    const conversation = await this.conversationManager.analyze(message);
    const tools = await this.toolOrchestrator.findTools(conversation.intent);
    const result = await this.router.execute(conversation, tools);

    return result;
  }

  setConversationManager(manager: ConversationManager): void {
    this.conversationManager = manager;
  }

  setToolOrchestrator(orchestrator: ToolOrchestrator): void {
    this.toolOrchestrator = orchestrator;
  }

  setRouter(router: IntelligentRouter): void {
    this.router = router;
  }
}

// Services depend on mediator, not each other
class ConversationManager {
  constructor(private mediator: ApplicationMediator) {}
}

class ToolOrchestrator {
  constructor(private mediator: ApplicationMediator) {}
}
```

---

## 3.6 Testing with Dependency Injection

One of the biggest benefits of DI is **testability**. Let's explore how to write comprehensive tests for a DI-based system.

### Testing Individual Services

#### Without DI: Hard to Test

```typescript
// Hard to test - creates real dependencies
export class ConversationManager {
  private router: IntelligentRouter;
  private logger: Logger;

  constructor() {
    // Hard-coded dependencies
    const providerManager = new ProviderManager();
    this.router = new IntelligentRouter(providerManager);
    this.logger = new Logger({ file: 'app.log' });
  }

  async analyze(prompt: string): Promise<Analysis> {
    this.logger.info(`Analyzing: ${prompt}`);
    const decision = await this.router.route({
      prompt,
      complexity: 'medium',
      priority: 'balanced'
    });

    return { decision, confidence: 0.9 };
  }
}

// Test is forced to use real router and logger
describe('ConversationManager', () => {
  it('should analyze prompt', async () => {
    const manager = new ConversationManager();

    // This calls real AI providers! 💸
    // Slow, expensive, unreliable
    const result = await manager.analyze('test prompt');

    expect(result).toBeDefined();
  });
});
```

#### With DI: Easy to Test

```typescript
// Easy to test - receives dependencies
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  async analyze(prompt: string): Promise<Analysis> {
    this.logger.info(`Analyzing: ${prompt}`);
    const decision = await this.router.route({
      prompt,
      complexity: 'medium',
      priority: 'balanced'
    });

    return { decision, confidence: 0.9 };
  }
}

// Test injects mocks
describe('ConversationManager', () => {
  it('should analyze prompt', async () => {
    // Create mocks
    const mockRouter = {
      route: vi.fn().mockResolvedValue({
        providerId: 'test',
        model: 'test-model',
        reasoning: 'test',
        estimatedCost: 0,
        fallbacks: [],
        confidence: 1.0
      })
    };

    const mockLogger = {
      info: vi.fn(),
      error: vi.fn()
    };

    // Inject mocks
    const manager = new ConversationManager(
      mockRouter as any,
      mockLogger as any
    );

    // Test
    const result = await manager.analyze('test prompt');

    // Verify
    expect(mockLogger.info).toHaveBeenCalledWith('Analyzing: test prompt');
    expect(mockRouter.route).toHaveBeenCalledWith({
      prompt: 'test prompt',
      complexity: 'medium',
      priority: 'balanced'
    });
    expect(result.confidence).toBe(0.9);
  });
});
```

### Testing with Test Container

Create a test-specific container with mocked services:

```typescript
/**
 * Create a test container with mocked services
 */
export function createTestContainer(): DIContainer {
  const container = new DIContainer();

  // Mock logger
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    dispose: vi.fn()
  };
  container.registerInstance('logger', mockLogger);

  // Mock provider manager
  const mockProviderManager = {
    registerProvider: vi.fn(),
    getProvider: vi.fn(),
    getAllProviders: vi.fn().mockReturnValue(new Map()),
    setBudget: vi.fn(),
    trackUsage: vi.fn(),
    dispose: vi.fn()
  };
  container.registerInstance('providerManager', mockProviderManager);

  // Mock router
  const mockRouter = {
    route: vi.fn().mockResolvedValue({
      providerId: 'test',
      model: 'test-model',
      reasoning: 'test',
      estimatedCost: 0,
      fallbacks: [],
      confidence: 1.0
    }),
    executeWithFallback: vi.fn(),
    dispose: vi.fn()
  };
  container.registerInstance('router', mockRouter);

  return container;
}

// Use in tests
describe('ConversationManager', () => {
  let container: DIContainer;
  let manager: ConversationManager;

  beforeEach(async () => {
    container = createTestContainer();

    // Register the service under test
    container.register('conversationManager', ConversationManager, {
      dependencies: ['router', 'logger']
    });

    manager = await container.resolve('conversationManager');
  });

  afterEach(async () => {
    await container.dispose();
  });

  it('should analyze prompt', async () => {
    const result = await manager.analyze('test prompt');

    expect(result).toBeDefined();
    expect(result.confidence).toBe(0.9);
  });
});
```

### Testing Service Registration

Test that services are registered correctly:

```typescript
describe('ServiceRegistry', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  it('should register core services', () => {
    ServiceRegistry.registerCoreServices(container);

    expect(container.has('logger')).toBe(true);
    expect(container.has('providerManager')).toBe(true);
    expect(container.has('router')).toBe(true);
    expect(container.has('fusion')).toBe(true);
  });

  it('should resolve logger', async () => {
    ServiceRegistry.registerCoreServices(container);

    const logger = await container.resolve<Logger>('logger');

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should resolve router with dependencies', async () => {
    ServiceRegistry.registerCoreServices(container);

    const router = await container.resolve<IntelligentRouter>('router');

    expect(router).toBeDefined();
    // Router should have providerManager and logger injected
  });

  it('should create singletons', async () => {
    ServiceRegistry.registerCoreServices(container);

    const logger1 = await container.resolve<Logger>('logger');
    const logger2 = await container.resolve<Logger>('logger');

    // Same instance
    expect(logger1).toBe(logger2);
  });
});
```

### Integration Testing

Test multiple services working together:

```typescript
describe('Integration: Conversation + Router', () => {
  let container: DIContainer;

  beforeEach(async () => {
    container = new DIContainer();

    // Register real services (but with mocked providers)
    ServiceRegistry.registerCoreServices(container);

    // Mock AI providers to avoid real API calls
    const mockProvider = {
      getName: () => 'mock',
      initialize: vi.fn(),
      complete: vi.fn().mockResolvedValue({
        content: 'Mocked response',
        tokensUsed: { prompt: 10, completion: 20, total: 30 }
      }),
      completeStream: vi.fn(),
      listModels: vi.fn(),
      calculateCost: () => 0,
      testConnection: vi.fn().mockResolvedValue(true),
      performHealthCheck: vi.fn(),
      getHealth: () => ({ status: 'healthy', lastCheck: Date.now() }),
      getMetrics: () => ({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokensUsed: 0,
        totalCost: 0,
        averageResponseTime: 0
      }),
      dispose: vi.fn()
    };

    const providerManager = await container.resolve<ProviderManager>('providerManager');
    await providerManager.registerProvider('mock', mockProvider as any);

    // Register conversation manager
    container.register('conversationManager', ConversationManager, {
      dependencies: ['router', 'logger']
    });
  });

  afterEach(async () => {
    await container.dispose();
  });

  it('should analyze prompt using router', async () => {
    const manager = await container.resolve<ConversationManager>('conversationManager');

    const result = await manager.analyze('test prompt');

    expect(result).toBeDefined();
    expect(result.decision).toBeDefined();
    expect(result.decision.providerId).toBe('mock');
  });
});
```

### Testing Lifecycle Hooks

```typescript
describe('Service Lifecycle', () => {
  it('should call onInit hook', async () => {
    const container = new DIContainer();
    const initSpy = vi.fn();

    container.register('test', Logger, {
      lifecycle: {
        onInit: initSpy
      }
    });

    await container.resolve('test');

    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('should call onDispose hook', async () => {
    const container = new DIContainer();
    const disposeSpy = vi.fn();

    container.register('test', Logger, {
      lifecycle: {
        onDispose: disposeSpy
      }
    });

    await container.resolve('test');
    await container.dispose();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('should dispose in reverse order', async () => {
    const container = new DIContainer();
    const order: string[] = [];

    container.register('logger', Logger, {
      lifecycle: {
        onDispose: () => order.push('logger')
      }
    });

    container.register('manager', ProviderManager, {
      dependencies: ['logger'],
      lifecycle: {
        onDispose: () => order.push('manager')
      }
    });

    container.register('router', IntelligentRouter, {
      dependencies: ['manager', 'logger'],
      lifecycle: {
        onDispose: () => order.push('router')
      }
    });

    await container.resolve('router');
    await container.dispose();

    // Should dispose in reverse order
    expect(order).toEqual(['router', 'manager', 'logger']);
  });
});
```

### Testing Error Scenarios

```typescript
describe('DI Container Error Handling', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  it('should throw on unregistered service', async () => {
    await expect(
      container.resolve('nonexistent')
    ).rejects.toThrow("Service 'nonexistent' is not registered");
  });

  it('should detect circular dependencies', async () => {
    // Register circular dependency
    container.registerFactory('serviceA', async (c) => {
      const b = await c.resolve('serviceB');
      return { b };
    });

    container.registerFactory('serviceB', async (c) => {
      const a = await c.resolve('serviceA');
      return { a };
    });

    await expect(
      container.resolve('serviceA')
    ).rejects.toThrow(/Circular dependency detected/);
  });

  it('should handle initialization errors', async () => {
    container.registerFactory('failing', () => {
      throw new Error('Initialization failed');
    });

    await expect(
      container.resolve('failing')
    ).rejects.toThrow('Initialization failed');
  });

  it('should continue disposal on error', async () => {
    const successSpy = vi.fn();

    container.registerInstance('failing', {
      dispose: () => { throw new Error('Dispose failed'); }
    });

    container.registerInstance('success', {
      dispose: successSpy
    });

    await container.resolve('failing');
    await container.resolve('success');

    // Should not throw, but collect errors
    await expect(container.dispose()).rejects.toThrow(AggregateError);

    // Success should still be disposed
    expect(successSpy).toHaveBeenCalled();
  });
});
```

### Mock Factories

Create reusable mock factories:

```typescript
/**
 * Mock factory utilities
 */
export class MockFactory {
  /**
   * Create mock logger
   */
  static createLogger(): Logger {
    return {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      flush: vi.fn(),
      dispose: vi.fn()
    } as any;
  }

  /**
   * Create mock router
   */
  static createRouter(overrides: Partial<IntelligentRouter> = {}): IntelligentRouter {
    return {
      route: vi.fn().mockResolvedValue({
        providerId: 'test',
        model: 'test-model',
        reasoning: 'test',
        estimatedCost: 0,
        fallbacks: [],
        confidence: 1.0
      }),
      executeWithFallback: vi.fn(),
      registerStrategy: vi.fn(),
      dispose: vi.fn(),
      ...overrides
    } as any;
  }

  /**
   * Create mock provider
   */
  static createProvider(
    name: string = 'test',
    overrides: Partial<BaseAIProvider> = {}
  ): BaseAIProvider {
    return {
      getName: () => name,
      initialize: vi.fn(),
      complete: vi.fn().mockResolvedValue({
        content: 'Test response',
        tokensUsed: { prompt: 10, completion: 20, total: 30 }
      }),
      completeStream: vi.fn(),
      listModels: vi.fn().mockResolvedValue([
        { id: 'test-model', name: 'Test Model', contextWindow: 4096 }
      ]),
      calculateCost: () => 0,
      testConnection: vi.fn().mockResolvedValue(true),
      performHealthCheck: vi.fn(),
      getHealth: () => ({ status: 'healthy', lastCheck: Date.now() }),
      getMetrics: () => ({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokensUsed: 0,
        totalCost: 0,
        averageResponseTime: 0
      }),
      dispose: vi.fn(),
      ...overrides
    } as any;
  }

  /**
   * Create mock provider manager
   */
  static createProviderManager(): ProviderManager {
    const providers = new Map<string, BaseAIProvider>();

    return {
      registerProvider: vi.fn((id, provider) => {
        providers.set(id, provider);
      }),
      getProvider: vi.fn((id) => providers.get(id)),
      getAllProviders: vi.fn(() => providers),
      removeProvider: vi.fn((id) => providers.delete(id)),
      setBudget: vi.fn(),
      getBudget: vi.fn(),
      trackUsage: vi.fn(),
      getUsageStats: vi.fn(() => ({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokensUsed: 0,
        totalCost: 0,
        averageResponseTime: 0,
        dailyUsage: new Map(),
        monthlyUsage: new Map()
      })),
      dispose: vi.fn()
    } as any;
  }
}

// Usage in tests
describe('ConversationManager', () => {
  it('should use mocked router', async () => {
    const router = MockFactory.createRouter();
    const logger = MockFactory.createLogger();

    const manager = new ConversationManager(router, logger);

    await manager.analyze('test');

    expect(router.route).toHaveBeenCalled();
  });
});
```

### Test Coverage Best Practices

```typescript
describe('ConversationManager - Comprehensive Coverage', () => {
  let router: IntelligentRouter;
  let logger: Logger;
  let manager: ConversationManager;

  beforeEach(() => {
    router = MockFactory.createRouter();
    logger = MockFactory.createLogger();
    manager = new ConversationManager(router, logger);
  });

  describe('analyze()', () => {
    it('should analyze simple prompts', async () => {
      const result = await manager.analyze('simple test');

      expect(result).toBeDefined();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should handle complex prompts', async () => {
      const longPrompt = 'a'.repeat(5000);

      const result = await manager.analyze(longPrompt);

      expect(result).toBeDefined();
    });

    it('should handle router errors', async () => {
      (router.route as any).mockRejectedValue(new Error('Router failed'));

      await expect(
        manager.analyze('test')
      ).rejects.toThrow('Router failed');

      expect(logger.error).toHaveBeenCalled();
    });

    it('should log analysis', async () => {
      await manager.analyze('test prompt');

      expect(logger.info).toHaveBeenCalledWith('Analyzing: test prompt');
    });

    it('should return correct confidence', async () => {
      const result = await manager.analyze('test');

      expect(result.confidence).toBe(0.9);
    });
  });

  describe('edge cases', () => {
    it('should handle empty prompts', async () => {
      await expect(
        manager.analyze('')
      ).rejects.toThrow('Prompt cannot be empty');
    });

    it('should handle null prompts', async () => {
      await expect(
        manager.analyze(null as any)
      ).rejects.toThrow('Prompt is required');
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(100000);

      await expect(
        manager.analyze(longPrompt)
      ).rejects.toThrow('Prompt exceeds maximum length');
    });
  });
});
```

---

## 3.7 Best Practices

Let's consolidate the best practices for using Dependency Injection in production AI systems.

### 1. Service Registration

**✅ Do: Register services at application startup**

```typescript
async function bootstrap() {
  const container = new DIContainer();

  // Register all services before resolving
  await ServiceRegistry.registerAll(container);

  // Now resolve
  const app = await container.resolve<OllamaCodeApp>('app');

  return app;
}
```

**❌ Don't: Register services on-demand**

```typescript
// Bad: Scattered registration
async function someFunction() {
  if (!container.has('logger')) {
    container.register('logger', Logger);
  }
  // Hard to track what's registered when
}
```

### 2. Dependency Declaration

**✅ Do: Declare dependencies explicitly in constructor**

```typescript
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger,
    private config: Config
  ) {
    // Dependencies clearly visible
  }
}
```

**❌ Don't: Use service locator pattern**

```typescript
// Bad: Hidden dependencies
export class ConversationManager {
  constructor(private container: DIContainer) {}

  async analyze(prompt: string) {
    // Dependencies hidden in implementation
    const router = await this.container.resolve('router');
    const logger = await this.container.resolve('logger');
    // ...
  }
}
```

### 3. Service Lifetime

**✅ Do: Use singletons for stateful services**

```typescript
// Singleton: shared state across application
container.register('logger', Logger, { singleton: true });
container.register('providerManager', ProviderManager, { singleton: true });
container.register('router', IntelligentRouter, { singleton: true });
```

**✅ Do: Use transient for stateless services**

```typescript
// Transient: new instance each time
container.register('requestAnalyzer', RequestAnalyzer, { singleton: false });
container.register('tempProcessor', TempProcessor, { singleton: false });
```

**❌ Don't: Make everything a singleton**

```typescript
// Bad: Singleton for stateless service
container.register('requestAnalyzer', RequestAnalyzer, { singleton: true });
// Can cause concurrency issues if service has mutable state
```

### 4. Testing

**✅ Do: Inject dependencies in constructor**

```typescript
// Easy to test
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

// Test with mock
const mock = { /* ... */ };
const service = new ServiceA(mock);
```

**✅ Do: Create test-specific containers**

```typescript
function createTestContainer(): DIContainer {
  const container = new DIContainer();
  // Register mocks
  container.registerInstance('logger', mockLogger);
  container.registerInstance('router', mockRouter);
  return container;
}
```

**❌ Don't: Use real services in unit tests**

```typescript
// Bad: Uses real AI providers in tests
describe('ConversationManager', () => {
  it('should analyze', async () => {
    const container = new DIContainer();
    await ServiceRegistry.registerAll(container); // Real providers!

    const manager = await container.resolve('conversationManager');
    await manager.analyze('test'); // Calls real APIs! 💸
  });
});
```

### 5. Resource Disposal

**✅ Do: Implement IDisposable for resources**

```typescript
export class ProviderManager implements IDisposable {
  async dispose(): Promise<void> {
    // Clean up resources
    await this.saveStats();
    await this.closeConnections();
  }
}
```

**✅ Do: Dispose container on shutdown**

```typescript
async function main() {
  const container = new DIContainer();
  let app;

  try {
    app = await bootstrap();
    await app.run();
  } finally {
    await container.dispose(); // Clean up all singletons
  }
}
```

**❌ Don't: Forget to dispose**

```typescript
// Bad: Resources leak
async function main() {
  const app = await bootstrap();
  await app.run();
  // Container never disposed - leaks!
}
```

### 6. Circular Dependencies

**✅ Do: Design for dependency flow**

```typescript
// Good: Clear hierarchy
// Logger (foundation)
// → ProviderManager (infrastructure)
//   → Router (core service)
//     → ConversationManager (application service)
//       → App (orchestration)
```

**✅ Do: Use interfaces to break cycles**

```typescript
interface IConversationContext {
  addMessage(message: Message): void;
  getMessages(): Message[];
}

class ConversationManager implements IConversationContext {
  constructor(private toolOrchestrator: ToolOrchestrator) {}
}

class ToolOrchestrator {
  constructor(private context: IConversationContext) {}
  // Depends on interface, not concrete class
}
```

**❌ Don't: Create circular dependencies**

```typescript
// Bad: A depends on B, B depends on A
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

class ServiceB {
  constructor(private serviceA: ServiceA) {}
}
```

### 7. Configuration

**✅ Do: Use environment-based configuration**

```typescript
container.registerFactory('logger', () => {
  return new Logger({
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  });
});
```

**✅ Do: Validate configuration at startup**

```typescript
async function bootstrap() {
  // Validate required configuration
  if (!process.env.OPENAI_API_KEY && !process.env.OLLAMA_BASE_URL) {
    throw new Error('At least one AI provider must be configured');
  }

  const container = new DIContainer();
  await ServiceRegistry.registerAll(container);

  return container;
}
```

**❌ Don't: Hardcode configuration**

```typescript
// Bad: Hardcoded values
container.registerFactory('logger', () => {
  return new Logger({
    level: 'debug', // Should be configurable
    file: '/var/log/app.log' // Won't work on all systems
  });
});
```

### 8. Error Handling

**✅ Do: Handle initialization errors gracefully**

```typescript
async function bootstrap() {
  const container = new DIContainer();

  try {
    await ServiceRegistry.registerAll(container);
  } catch (error) {
    console.error('Service registration failed:', error);
    await container.dispose(); // Clean up partial initialization
    throw error;
  }

  return container;
}
```

**✅ Do: Provide helpful error messages**

```typescript
export class DIContainer {
  async resolve<T>(key: string): Promise<T> {
    if (!this.services.has(key)) {
      const available = Array.from(this.services.keys()).join(', ');
      throw new Error(
        `Service '${key}' is not registered. ` +
        `Available services: ${available}`
      );
    }
    // ...
  }
}
```

**❌ Don't: Swallow errors**

```typescript
// Bad: Silent failure
async function bootstrap() {
  const container = new DIContainer();

  try {
    await ServiceRegistry.registerAll(container);
  } catch (error) {
    // Error ignored!
  }

  return container; // Partially initialized
}
```

### 9. Scoping

**✅ Do: Use child containers for scoped lifetimes**

```typescript
// Request-scoped container
async function handleRequest(req: Request) {
  const requestScope = container.createScope();

  // Register request-specific services
  requestScope.registerInstance('request', req);
  requestScope.registerInstance('user', req.user);

  try {
    const handler = await requestScope.resolve('requestHandler');
    return await handler.handle();
  } finally {
    await requestScope.dispose(); // Clean up request scope
  }
}
```

**❌ Don't: Use singletons for request-scoped data**

```typescript
// Bad: Shared mutable state across requests
container.register('requestContext', RequestContext, { singleton: true });
// Multiple requests will overwrite each other's data!
```

### 10. Documentation

**✅ Do: Document service dependencies**

```typescript
/**
 * Manages AI provider conversations
 *
 * @param router - Intelligent router for provider selection
 * @param logger - Application logger
 * @param config - Application configuration
 */
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger,
    private config: Config
  ) {}
}
```

**✅ Do: Document service lifetime**

```typescript
// Register logger as singleton - shared across application
container.register('logger', Logger, { singleton: true });

// Register analyzer as transient - new instance per use
container.register('analyzer', Analyzer, { singleton: false });
```

---

## Summary and Key Takeaways

In this chapter, we've built a comprehensive Dependency Injection system for AI applications. Let's recap:

### Core Concepts

1. **Dependency Injection** - Pass dependencies to objects instead of creating them internally
2. **DI Container** - Centralized registry that manages service creation and lifetime
3. **Service Lifetime** - Singleton (shared), Transient (new instance), Scoped (per request)
4. **IDisposable Pattern** - Standard way to release resources
5. **Circular Dependencies** - When services depend on each other (should be avoided)

### Architecture Components

1. **DIContainer** - Core container implementation
   - Service registration
   - Dependency resolution
   - Lifecycle management
   - Circular dependency detection

2. **ServiceRegistry** - Centralized service configuration
   - registerCoreServices()
   - registerProviders()
   - registerConversationServices()
   - registerToolServices()
   - registerVCSServices()

3. **IDisposable** - Resource cleanup interface
   - dispose() method
   - Integration with container
   - Reverse-order disposal

### Benefits of DI

✅ **Testability** - Easy to mock dependencies
✅ **Flexibility** - Swap implementations without changing code
✅ **Maintainability** - Clear dependency relationships
✅ **Lifecycle Management** - Automatic resource cleanup
✅ **Reduced Coupling** - Components don't create dependencies

### Common Pitfalls to Avoid

⚠️ **Don't**: Use service locator pattern (hides dependencies)
⚠️ **Don't**: Create circular dependencies
⚠️ **Don't**: Forget to dispose resources
⚠️ **Don't**: Make everything a singleton
⚠️ **Don't**: Use real services in unit tests

### Production Checklist

Before deploying:

- [ ] All services registered at startup
- [ ] Dependencies declared explicitly in constructors
- [ ] Appropriate service lifetimes (singleton vs transient)
- [ ] IDisposable implemented for all resources
- [ ] Container disposed on shutdown
- [ ] No circular dependencies
- [ ] Configuration externalized
- [ ] Comprehensive tests with mocks
- [ ] Error handling in initialization
- [ ] Helpful error messages

---

## Exercises

Now apply what you've learned with hands-on exercises.

### Exercise 1: Implement a Custom Service (60 minutes)

**Goal**: Create a caching service with DI

**Requirements**:
1. Implement `CacheService` with IDisposable
2. Register with DI container
3. Inject into existing services
4. Write comprehensive tests

**Starter Code**:

```typescript
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService implements IDisposable {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private logger: Logger,
    private ttlMs: number = 300000 // 5 minutes default
  ) {
    // TODO: Start cleanup interval
  }

  get<T>(key: string): T | null {
    // TODO: Implement get with expiration check
    return null;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    // TODO: Implement set with TTL
  }

  delete(key: string): boolean {
    // TODO: Implement delete
    return false;
  }

  clear(): void {
    // TODO: Implement clear
  }

  private cleanup(): void {
    // TODO: Remove expired entries
  }

  async dispose(): Promise<void> {
    // TODO: Stop cleanup interval, clear cache
  }
}

// Register with container
container.register('cache', CacheService, {
  singleton: true,
  dependencies: ['logger'],
  lifecycle: {
    onDispose: async (cache) => {
      await cache.dispose();
    }
  }
});

// Use in ConversationManager
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger,
    private cache: CacheService // Injected dependency
  ) {}

  async analyze(prompt: string): Promise<Analysis> {
    // Check cache first
    const cached = this.cache.get<Analysis>(`analysis:${prompt}`);
    if (cached) {
      this.logger.info('Cache hit');
      return cached;
    }

    // Compute and cache
    const result = await this.computeAnalysis(prompt);
    this.cache.set(`analysis:${prompt}`, result);

    return result;
  }
}
```

**Solution**: See `book/exercises/chapter-03/exercise-01-solution.ts`

---

### Exercise 2: Fix Circular Dependencies (90 minutes)

**Goal**: Refactor code with circular dependencies

**Scenario**: You have this circular dependency:

```typescript
class EmailService {
  constructor(private notificationService: NotificationService) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.send(to, subject, body);
    await this.notificationService.recordSent('email', to);
  }
}

class NotificationService {
  constructor(private emailService: EmailService) {}

  async notify(user: User, message: string): Promise<void> {
    await this.emailService.sendEmail(user.email, 'Notification', message);
    this.recordSent('notification', user.id);
  }

  recordSent(type: string, recipient: string): void {
    // Record in database
  }
}
```

**Task**: Break the circular dependency using one of these strategies:
1. Dependency Inversion (interfaces)
2. Event-based decoupling
3. Extract shared service

**Solution**: See `book/exercises/chapter-03/exercise-02-solution.ts`

---

### Exercise 3: Build a Test Container Factory (60 minutes)

**Goal**: Create comprehensive test utilities

**Requirements**:
1. Create `TestContainerFactory` class
2. Support different test scenarios (unit, integration, e2e)
3. Provide mock factories for all core services
4. Include snapshot/restore functionality

**Starter Code**:

```typescript
export class TestContainerFactory {
  /**
   * Create container for unit tests (all mocks)
   */
  static createUnit(): DIContainer {
    // TODO: Register all mocked services
    return container;
  }

  /**
   * Create container for integration tests (some real services)
   */
  static createIntegration(): DIContainer {
    // TODO: Mix of real and mocked services
    return container;
  }

  /**
   * Create container for E2E tests (all real services)
   */
  static async createE2E(): Promise<DIContainer> {
    // TODO: Register real services with test configuration
    return container;
  }

  /**
   * Create snapshot of container state
   */
  static snapshot(container: DIContainer): ContainerSnapshot {
    // TODO: Capture current state
    return snapshot;
  }

  /**
   * Restore container from snapshot
   */
  static restore(container: DIContainer, snapshot: ContainerSnapshot): void {
    // TODO: Restore state
  }
}
```

**Solution**: See `book/exercises/chapter-03/exercise-03-solution.ts`

---

### Exercise 4: Implement Service Decorators (120 minutes)

**Goal**: Add cross-cutting concerns with decorators

**Task**: Implement decorators for:
1. Logging (log method entry/exit)
2. Timing (measure execution time)
3. Caching (cache method results)
4. Retry (retry failed operations)

**Starter Code**:

```typescript
/**
 * Log method calls
 */
export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const logger = this.logger || console;
    logger.info(`Calling ${propertyKey}`, { args });

    try {
      const result = await originalMethod.apply(this, args);
      logger.info(`${propertyKey} succeeded`, { result });
      return result;
    } catch (error) {
      logger.error(`${propertyKey} failed`, error);
      throw error;
    }
  };

  return descriptor;
}

/**
 * Measure execution time
 */
export function Timed(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // TODO: Implement timing decorator
  return descriptor;
}

/**
 * Cache method results
 */
export function Cached(ttlMs: number = 300000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // TODO: Implement caching decorator
    return descriptor;
  };
}

/**
 * Retry failed operations
 */
export function Retry(maxAttempts: number = 3, delayMs: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // TODO: Implement retry decorator
    return descriptor;
  };
}

// Usage
export class ConversationManager {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  @Log
  @Timed
  @Cached(60000) // Cache for 1 minute
  async analyze(prompt: string): Promise<Analysis> {
    return await this.computeAnalysis(prompt);
  }

  @Retry(3, 2000)
  async computeAnalysis(prompt: string): Promise<Analysis> {
    // May fail, will be retried
  }
}
```

**Solution**: See `book/exercises/chapter-03/exercise-04-solution.ts`

---

### Exercise 5: Performance Benchmarking (90 minutes)

**Goal**: Measure DI container overhead

**Task**: Create benchmarks to measure:
1. Registration time
2. Resolution time (first vs cached)
3. Disposal time
4. Memory usage

**Starter Code**:

```typescript
export class DIBenchmark {
  async benchmarkRegistration(serviceCount: number): Promise<BenchmarkResult> {
    const container = new DIContainer();

    const start = performance.now();

    for (let i = 0; i < serviceCount; i++) {
      container.register(`service${i}`, Logger);
    }

    const duration = performance.now() - start;

    return {
      operation: 'registration',
      count: serviceCount,
      duration,
      opsPerSecond: serviceCount / (duration / 1000)
    };
  }

  async benchmarkResolution(serviceCount: number): Promise<BenchmarkResult> {
    // TODO: Benchmark resolution time
    return result;
  }

  async benchmarkCachedResolution(iterations: number): Promise<BenchmarkResult> {
    // TODO: Benchmark cached singleton resolution
    return result;
  }

  async benchmarkDisposal(serviceCount: number): Promise<BenchmarkResult> {
    // TODO: Benchmark disposal time
    return result;
  }

  async benchmarkMemory(): Promise<MemoryBenchmark> {
    // TODO: Measure memory usage
    return result;
  }

  generateReport(results: BenchmarkResult[]): string {
    // TODO: Generate markdown report
    return report;
  }
}
```

**Bonus**: Compare DI overhead vs manual dependency management

**Solution**: See `book/exercises/chapter-03/exercise-05-solution.ts`

---

## Chapter 3 Complete!

Congratulations! You now have a deep understanding of Dependency Injection for AI systems, including:

✅ Why DI matters and when to use it
✅ Building a production-ready DI container
✅ Service registry patterns
✅ IDisposable for resource cleanup
✅ Circular dependency resolution strategies
✅ Comprehensive testing with DI
✅ Best practices for production deployment

### What's Next?

In **[Chapter 4: Tool Orchestration and Execution →](chapter-04-tool-orchestration.md)**, we'll explore how AI agents execute tools, manage dependencies, handle parallel execution, and implement interactive approval systems.

**Key topics**:
- Tool interface design
- Dependency resolution between tools
- Parallel execution engine
- Result caching
- Interactive approval workflow
- Error handling and recovery

---

**Chapter 3 Progress**: Complete ✅
- 3.1 Why Dependency Injection? ✅
- 3.2 Container Architecture ✅
- 3.3 Service Registry Pattern ✅
- 3.4 IDisposable Pattern ✅
- 3.5 Circular Dependency Resolution ✅
- 3.6 Testing with DI ✅
- 3.7 Best Practices ✅
- Exercises (5) ✅

**Total**: ~3,850 lines | ~85-90 pages

---

*Continue to [Chapter 4: Tool Orchestration and Execution →](chapter-04-tool-orchestration.md)*
