# Building AI Coding Assistants: Architecture and Implementation

## A Comprehensive Guide Based on the ollama-code Project

**Target Audience:** Software engineers, architects, and AI practitioners building coding assistants

**Prerequisites:**
- TypeScript/JavaScript proficiency
- Understanding of async/await patterns
- Basic familiarity with AI/LLM concepts
- Node.js development experience

**Learning Outcomes:**
- Design and implement multi-provider AI systems
- Build robust tool orchestration frameworks
- Handle streaming responses and real-time interactions
- Implement security and privacy best practices
- Create production-ready AI coding assistants

---

# Table of Contents

## Part I: Foundations (Chapters 1-3)

### Chapter 1: Introduction to AI Coding Assistants

**Learning Objectives:**
- Understand the landscape of AI coding assistants
- Identify key use cases and value propositions
- Learn fundamental architecture patterns

**Topics:**

1.1 **What is an AI Coding Assistant?**
- Definition and scope
- Evolution from code completion to full assistants
- Comparison: Copilot, Cursor, ollama-code
- Local vs. cloud-based approaches

1.2 **Use Cases and Value Proposition**
- Code generation and completion
- Bug detection and fixing
- Refactoring and optimization
- Documentation generation
- Test creation
- Code review automation
- Natural language to code translation

1.3 **Architecture Overview**
```
User Interface
    ↓
Command Processor / NL Router
    ↓
AI Provider Manager ←→ Multiple AI Providers
    ↓
Tool Orchestrator ←→ Tool Registry
    ↓
Execution Layer (File System, Git, etc.)
```

1.4 **Design Goals**
- **Extensibility**: Easy to add providers and tools
- **Reliability**: Graceful degradation and error recovery
- **Performance**: Streaming, caching, parallel execution
- **Security**: Safe execution, credential management
- **Developer Experience**: Clear APIs, good defaults

1.5 **Constraints and Trade-offs**
- Local vs. cloud processing
- Memory vs. context window size
- Speed vs. accuracy
- Cost vs. capability
- Privacy vs. features

**Case Study:** ollama-code architecture walkthrough

**Exercises:**
1. Design a simple AI coding assistant for a specific use case
2. Identify requirements and constraints for your domain
3. Compare different architectural approaches

---

### Chapter 2: Multi-Provider AI Integration

**Learning Objectives:**
- Implement provider abstraction patterns
- Manage multiple AI providers effectively
- Handle provider-specific quirks gracefully

**Topics:**

2.1 **Why Multiple Providers?**
- Cost optimization
- Capability diversity
- Redundancy and reliability
- Regulatory compliance
- Avoiding vendor lock-in

2.2 **Provider Abstraction Pattern**

**Core Concept: Abstract Base Class**
```typescript
abstract class BaseAIProvider {
  // Required methods
  abstract complete(prompt: string): Promise<Response>;
  abstract streamComplete(prompt: string): AsyncIterator<Chunk>;
  abstract testConnection(): Promise<boolean>;

  // Common functionality
  performHealthCheck(): Promise<void> { ... }
  updateMetrics(response): void { ... }
  enforceRateLimit(): Promise<void> { ... }
}
```

**Benefits:**
- Polymorphic provider usage
- Shared infrastructure (health, metrics, cost tracking)
- Easy testing with mocks
- Uniform error handling

**Implementation Details:**
- Health monitoring with heartbeats
- Automatic fallback on failures
- Metrics collection (response time, success rate)
- Cost tracking per provider

2.3 **Provider Implementations**

**Ollama Provider (Local)**
```typescript
class OllamaProvider extends BaseAIProvider {
  async complete(prompt: string): Promise<Response> {
    // Local HTTP API call
    // No authentication required
    // Fast, free, but limited models
  }
}
```

**OpenAI Provider (Cloud)**
```typescript
class OpenAIProvider extends BaseAIProvider {
  async complete(prompt: string): Promise<Response> {
    // REST API with authentication
    // Rate limiting and cost tracking
    // Access to GPT-4 and other models
  }
}
```

**Anthropic Provider (Cloud)**
```typescript
class AnthropicProvider extends BaseAIProvider {
  async complete(prompt: string): Promise<Response> {
    // Claude models
    // Different token limits
    // Unique capabilities (artifacts, thinking)
  }
}
```

2.4 **Provider Manager**

**Responsibilities:**
- Provider registration and discovery
- Credential management
- Configuration persistence
- Health monitoring orchestration
- Usage statistics aggregation

**Key Design Decisions:**
- **Security**: Encrypt credentials at rest
- **Persistence**: JSON config files with permissions
- **Health**: Periodic background checks
- **Metrics**: Aggregate across all providers

**Example Implementation:**
```typescript
class ProviderManager {
  private providers = new Map<string, BaseAIProvider>();
  private credentials = new Map<string, Credentials>();
  private healthCheckInterval: NodeJS.Timer;

  async registerProvider(id: string, provider: BaseAIProvider): Promise<void>
  async unregisterProvider(id: string): Promise<void>
  getProvider(id: string): BaseAIProvider | undefined
  async performHealthChecks(): Promise<Map<string, HealthStatus>>
  getAggregatedMetrics(): ProviderMetrics
}
```

2.5 **Intelligent Routing**

**Problem:** Given a request, which provider should handle it?

**Routing Strategies:**
1. **Cost-Based:** Choose cheapest capable provider
2. **Performance-Based:** Choose fastest provider
3. **Capability-Based:** Choose based on required features
4. **Load-Balanced:** Distribute evenly
5. **Failover:** Try primary, fallback to secondary

**Implementation:**
```typescript
class IntelligentRouter {
  async route(
    request: Request,
    context: RoutingContext
  ): Promise<RoutingDecision> {
    const candidates = this.getCandidateProviders(request);

    // Score each candidate
    const scored = candidates.map(provider => ({
      provider,
      score: this.calculateScore(provider, request, context)
    }));

    // Select best
    const best = scored.reduce((a, b) => a.score > b.score ? a : b);

    return {
      provider: best.provider,
      confidence: best.score,
      alternatives: scored.filter(s => s !== best)
    };
  }

  private calculateScore(
    provider: BaseAIProvider,
    request: Request,
    context: RoutingContext
  ): number {
    let score = 0;

    // Cost (lower is better)
    score += (1 - provider.getCostPerToken()) * context.weights.cost;

    // Speed (faster is better)
    score += provider.metrics.avgResponseTime * context.weights.speed;

    // Reliability (higher is better)
    score += provider.metrics.successRate * context.weights.reliability;

    // Capability match
    if (provider.supports(request.requiredCapabilities)) {
      score += context.weights.capability;
    }

    return score;
  }
}
```

2.6 **Response Fusion**

**Problem:** How to combine responses from multiple providers?

**Use Cases:**
- Consensus building for important decisions
- Quality improvement through voting
- Confidence calibration

**Strategies:**
1. **Voting:** Most common response wins
2. **Weighted:** Score by provider reliability
3. **Synthesis:** AI combines multiple responses

**Example:**
```typescript
async fusionGenerate(prompt: string): Promise<FusionResult> {
  // Get responses from multiple providers in parallel
  const responses = await Promise.all(
    this.selectedProviders.map(p => p.complete(prompt))
  );

  // Compare and synthesize
  const synthesis = await this.synthesize(responses);

  return {
    result: synthesis.best,
    confidence: synthesis.confidence,
    sources: responses,
    reasoning: synthesis.explanation
  };
}
```

2.7 **Health Monitoring**

**Metrics to Track:**
- Availability (% uptime)
- Response time (min, max, avg, p95, p99)
- Success rate (% successful requests)
- Error rate and types
- Cost per request

**Health Status:**
- `healthy`: All checks passing
- `degraded`: Some failures, still usable
- `unhealthy`: Failing, should not use
- `unknown`: No recent data

**Recovery Mechanisms:**
- Automatic retry with exponential backoff
- Circuit breaker pattern
- Graceful degradation
- Alert on sustained failures

2.8 **Cost Tracking**

**Why Track Costs?**
- Budget enforcement
- Cost attribution (per user, per feature)
- Optimization opportunities
- ROI calculation

**Implementation:**
```typescript
interface CostTracker {
  recordUsage(provider: string, tokens: number, cost: number): void
  getCurrentUsage(provider: string, period: 'day' | 'month'): Usage
  checkBudget(provider: string): BudgetStatus
  predictMonthlyBuzz(provider: string): number
}
```

**Case Study:** ollama-code provider system deep dive

**Exercises:**
1. Implement a simple provider abstraction for 2 providers
2. Design a routing algorithm for your use case
3. Add health monitoring to a provider
4. Implement cost tracking and budget alerts

---

### Chapter 3: Dependency Injection for AI Systems

**Learning Objectives:**
- Understand why DI is crucial for AI applications
- Implement a type-safe DI container
- Manage complex service dependencies
- Test components in isolation

**Topics:**

3.1 **Why DI Matters for AI Applications**

**Problems with Direct Dependencies:**
```typescript
// ❌ Tightly coupled - hard to test, hard to swap implementations
class AIService {
  private ollamaClient = new OllamaClient();  // Direct dependency

  async generate(prompt: string) {
    return this.ollamaClient.complete(prompt);
  }
}
```

**With Dependency Injection:**
```typescript
// ✅ Loosely coupled - easy to test, easy to swap
class AIService {
  constructor(private aiProvider: BaseAIProvider) {}  // Injected dependency

  async generate(prompt: string) {
    return this.aiProvider.complete(prompt);
  }
}

// Easy to test
const mockProvider = createMockProvider();
const service = new AIService(mockProvider);

// Easy to swap implementations
const realService = new AIService(new OllamaProvider());
const cloudService = new AIService(new OpenAIProvider());
```

**Benefits for AI Systems:**
- **Testing**: Mock expensive AI calls
- **Configuration**: Switch providers easily
- **Development**: Use cheap/fast providers in dev
- **Production**: Use powerful providers in prod
- **Hybrid**: Mix local and cloud providers

3.2 **Container Design**

**Core Concepts:**
- **Service**: Any object managed by the container
- **Registration**: Telling the container how to create services
- **Resolution**: Getting a service instance from the container
- **Lifecycle**: When services are created and destroyed

**Lifecycle Options:**
1. **Singleton**: One instance for entire application
2. **Transient**: New instance every time
3. **Scoped**: One instance per scope (e.g., per request)

**Example Container API:**
```typescript
class Container {
  // Register a singleton service
  registerSingleton<T>(
    name: string,
    factory: () => T
  ): void

  // Register a transient service
  registerTransient<T>(
    name: string,
    factory: (container: Container) => T
  ): void

  // Resolve a service
  resolve<T>(name: string): T

  // Create a child scope
  createScope(): Container

  // Clean up resources
  async dispose(): Promise<void>
}
```

3.3 **Type-Safe Registration**

**Problem:** Lose type safety with string-based registration

**Solution:** Typed service registry
```typescript
// Define service types
interface ServiceRegistry {
  aiProvider: BaseAIProvider;
  toolRegistry: ToolRegistry;
  configManager: ConfigManager;
  logger: Logger;
}

// Type-safe container
class TypedContainer {
  private services: Partial<ServiceRegistry> = {};

  register<K extends keyof ServiceRegistry>(
    key: K,
    factory: () => ServiceRegistry[K]
  ): void {
    // Type-safe registration
  }

  resolve<K extends keyof ServiceRegistry>(
    key: K
  ): ServiceRegistry[K] {
    // Type-safe resolution with autocomplete
    return this.services[key]!;
  }
}

// Usage with full type safety
container.register('aiProvider', () => new OllamaProvider());
const provider = container.resolve('aiProvider');  // Type: BaseAIProvider
```

3.4 **Circular Dependency Detection**

**Problem:**
```
ServiceA depends on ServiceB
ServiceB depends on ServiceC
ServiceC depends on ServiceA  ← Circular!
```

**Detection Algorithm:**
```typescript
class Container {
  private resolutionStack: string[] = [];

  resolve<T>(name: string): T {
    // Check for circular dependency
    if (this.resolutionStack.includes(name)) {
      const cycle = [...this.resolutionStack, name].join(' → ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    this.resolutionStack.push(name);
    try {
      const instance = this.createInstance(name);
      return instance;
    } finally {
      this.resolutionStack.pop();
    }
  }
}
```

3.5 **Lazy Initialization**

**Problem:** Creating all services upfront is slow and wasteful

**Solution:** Create services on first use
```typescript
class Container {
  private instances = new Map<string, any>();
  private factories = new Map<string, Factory>();

  resolve<T>(name: string): T {
    // Check cache first
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Create on first use
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`No factory registered for: ${name}`);
    }

    const instance = factory(this);
    this.instances.set(name, instance);
    return instance;
  }
}
```

3.6 **Resource Cleanup**

**Problem:** Services hold resources (connections, timers, file handles)

**Solution:** Implement IDisposable pattern
```typescript
interface IDisposable {
  dispose(): Promise<void> | void;
}

class Container {
  async dispose(): Promise<void> {
    // Dispose all services in reverse order of creation
    for (const [name, instance] of Array.from(this.instances).reverse()) {
      if (instance && typeof instance.dispose === 'function') {
        try {
          await instance.dispose();
          console.log(`Disposed: ${name}`);
        } catch (error) {
          console.error(`Failed to dispose ${name}:`, error);
        }
      }
    }

    this.instances.clear();
  }
}

// Usage
const container = new Container();
// ... use services ...
await container.dispose();  // Clean shutdown
```

3.7 **Testing with DI**

**Unit Testing:**
```typescript
describe('AIService', () => {
  it('should generate code using AI provider', async () => {
    // Arrange: Create mock provider
    const mockProvider = {
      complete: jest.fn().mockResolvedValue({
        content: 'function hello() { return "world"; }'
      })
    };

    const service = new AIService(mockProvider);

    // Act
    const result = await service.generate('Create a hello function');

    // Assert
    expect(mockProvider.complete).toHaveBeenCalledWith(
      expect.stringContaining('hello function')
    );
    expect(result.content).toContain('function hello');
  });
});
```

**Integration Testing:**
```typescript
describe('Full AI Pipeline', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    // Register test implementations
    container.register('aiProvider', () => new MockAIProvider());
    container.register('toolRegistry', () => new ToolRegistry());
    container.register('orchestrator', (c) => new Orchestrator(
      c.resolve('aiProvider'),
      c.resolve('toolRegistry')
    ));
  });

  afterEach(async () => {
    await container.dispose();
  });

  it('should orchestrate multi-tool workflow', async () => {
    const orchestrator = container.resolve('orchestrator');
    const result = await orchestrator.execute(complexPlan);

    expect(result.success).toBe(true);
  });
});
```

3.8 **Common Pitfalls**

1. **Service Locator Anti-Pattern**
```typescript
// ❌ Don't pass container to services
class BadService {
  constructor(private container: Container) {}

  doSomething() {
    const tool = this.container.resolve('tool');  // Service locator
  }
}

// ✅ Inject specific dependencies
class GoodService {
  constructor(private tool: Tool) {}  // Direct injection

  doSomething() {
    this.tool.execute();
  }
}
```

2. **Mixing DI with Singletons**
```typescript
// ❌ Conflicts between patterns
export const globalLogger = new Logger();  // Global singleton

container.register('logger', () => globalLogger);  // Also in DI?
```

**Choose one:**
- Either use DI container for everything
- Or use module-level singletons consistently
- Don't mix both

3. **Over-Injection**
```typescript
// ❌ Too many dependencies - god object
class OverloadedService {
  constructor(
    private dep1: Dep1,
    private dep2: Dep2,
    private dep3: Dep3,
    private dep4: Dep4,
    private dep5: Dep5,
    private dep6: Dep6,
    private dep7: Dep7
  ) {}
}

// ✅ Split into smaller services
class FocusedService1 {
  constructor(private dep1: Dep1, private dep2: Dep2) {}
}

class FocusedService2 {
  constructor(private dep3: Dep3, private dep4: Dep4) {}
}
```

**Case Study:** ollama-code DI container and service initialization

**Exercises:**
1. Implement a simple DI container with type safety
2. Add circular dependency detection
3. Implement lazy initialization
4. Add resource cleanup with IDisposable
5. Write tests using DI

---

## Part II: Core Architecture (Chapters 4-6)

### Chapter 4: Tool Orchestration

**Learning Objectives:**
- Design extensible tool systems
- Implement dependency resolution
- Optimize with parallel execution
- Handle errors gracefully

**Topics:**

4.1 **What are Tools in AI Assistants?**

**Definition:** Tools are capabilities the AI can use to interact with the environment

**Examples:**
- **File System**: Read, write, search files
- **Execution**: Run commands, execute code
- **Search**: Find code, documentation
- **Git**: Commit, branch, merge
- **Analysis**: Lint, test, analyze code
- **Testing**: Generate tests, run tests

**Why Tools?**
- Extend AI capabilities beyond text generation
- Ground AI in real-world actions
- Enable complex workflows
- Provide verifiable results

4.2 **Tool Interface Design**

**Core Interface:**
```typescript
interface Tool {
  metadata: ToolMetadata;
  execute(parameters: ToolParameters, context: ExecutionContext): Promise<ToolResult>;
  validateParameters(parameters: ToolParameters): boolean;
}

interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  parameters: ParameterDefinition[];
  examples: ToolExample[];
  dependencies: string[];  // Other tools this depends on
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    resourcesUsed: ResourceUsage;
  };
}
```

**Example Tool:**
```typescript
class FileSystemTool implements Tool {
  metadata: ToolMetadata = {
    name: 'filesystem',
    description: 'File system operations',
    category: 'core',
    parameters: [
      {
        name: 'operation',
        type: 'string',
        description: 'Operation to perform (read, write, list, delete)',
        required: true,
        enum: ['read', 'write', 'list', 'delete']
      },
      {
        name: 'path',
        type: 'string',
        description: 'File or directory path',
        required: true
      }
    ],
    examples: [
      {
        description: 'Read a file',
        parameters: { operation: 'read', path: 'src/index.ts' }
      }
    ],
    dependencies: []
  };

  async execute(params: ToolParameters, context: ExecutionContext): Promise<ToolResult> {
    const { operation, path } = params;

    try {
      switch (operation) {
        case 'read':
          const content = await fs.readFile(path, 'utf-8');
          return {
            success: true,
            data: { content, size: content.length }
          };

        case 'write':
          await fs.writeFile(path, params.content);
          return { success: true };

        // ... other operations
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateParameters(params: ToolParameters): boolean {
    if (!params.operation || !params.path) return false;
    const validOps = ['read', 'write', 'list', 'delete'];
    return validOps.includes(params.operation);
  }
}
```

4.3 **Tool Registry**

**Purpose:** Central catalog of available tools

**Responsibilities:**
- Register/unregister tools
- Discover tools by name or category
- Validate tool metadata
- Provide tool documentation

**Implementation:**
```typescript
class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    // Validate tool
    if (!tool.metadata.name) {
      throw new Error('Tool must have a name');
    }

    if (this.tools.has(tool.metadata.name)) {
      throw new Error(`Tool already registered: ${tool.metadata.name}`);
    }

    this.tools.set(tool.metadata.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): ToolMetadata[] {
    return Array.from(this.tools.values()).map(t => t.metadata);
  }

  search(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.metadata.name.toLowerCase().includes(lowerQuery) ||
      tool.metadata.description.toLowerCase().includes(lowerQuery)
    );
  }

  getByCategory(category: string): Tool[] {
    return Array.from(this.tools.values()).filter(
      tool => tool.metadata.category === category
    );
  }
}
```

4.4 **Dependency Resolution**

**Problem:** Tools may depend on other tools

**Example:**
```
git-commit (depends on) → filesystem (to read changed files)
                        → git-diff (to see changes)
```

**Dependency Graph:**
```
      git-commit
       /        \
  filesystem  git-diff
                 |
             filesystem
```

**Topological Sort Algorithm:**
```typescript
class DependencyResolver {
  resolve(tools: string[], registry: ToolRegistry): string[] {
    const graph = this.buildGraph(tools, registry);
    return this.topologicalSort(graph);
  }

  private buildGraph(tools: string[], registry: ToolRegistry): DependencyGraph {
    const graph = new Map<string, string[]>();

    const visit = (toolName: string) => {
      if (graph.has(toolName)) return;

      const tool = registry.get(toolName);
      if (!tool) throw new Error(`Tool not found: ${toolName}`);

      graph.set(toolName, tool.metadata.dependencies || []);

      // Recursively visit dependencies
      for (const dep of tool.metadata.dependencies || []) {
        visit(dep);
      }
    };

    for (const tool of tools) {
      visit(tool);
    }

    return graph;
  }

  private topologicalSort(graph: DependencyGraph): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (node: string) => {
      if (visited.has(node)) return;

      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected: ${node}`);
      }

      visiting.add(node);

      const deps = graph.get(node) || [];
      for (const dep of deps) {
        visit(dep);
      }

      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of graph.keys()) {
      visit(node);
    }

    return sorted;
  }
}
```

4.5 **Parallel Execution**

**Optimization:** Execute independent tools in parallel

**Example:**
```
Plan: [filesystem, git-diff, git-commit]

Dependencies:
- filesystem: none (can run immediately)
- git-diff: depends on filesystem
- git-commit: depends on filesystem and git-diff

Execution Order:
1. Start filesystem (parallel batch 1)
2. Wait for filesystem
3. Start git-diff (parallel batch 2)
4. Wait for git-diff
5. Start git-commit (parallel batch 3)
```

**Implementation:**
```typescript
class Orchestrator {
  async execute(plan: ExecutionPlan): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();
    const completed = new Set<string>();

    // Build dependency graph
    const graph = this.buildDependencyGraph(plan.tools);

    // Execute in batches
    while (completed.size < plan.tools.length) {
      // Find tools ready to execute (all dependencies completed)
      const ready = plan.tools.filter(tool =>
        !completed.has(tool.name) &&
        tool.metadata.dependencies.every(dep => completed.has(dep))
      );

      if (ready.length === 0 && completed.size < plan.tools.length) {
        throw new Error('Deadlock detected - circular dependencies');
      }

      // Execute ready tools in parallel
      const executions = ready.map(async tool => {
        const result = await tool.execute(plan.parameters[tool.metadata.name]);
        results.set(tool.metadata.name, result);
        completed.add(tool.metadata.name);
        return result;
      });

      await Promise.all(executions);
    }

    return results;
  }
}
```

4.6 **Error Handling and Recovery**

**Strategies:**
1. **Fail Fast**: Stop on first error
2. **Continue on Error**: Execute what's possible
3. **Retry**: Retry failed tools with backoff
4. **Fallback**: Use alternative tools

**Implementation:**
```typescript
interface ExecutionConfig {
  strategy: 'fail-fast' | 'continue' | 'retry';
  maxRetries?: number;
  retryDelay?: number;
}

class Orchestrator {
  async execute(plan: ExecutionPlan, config: ExecutionConfig): Promise<ExecutionResult> {
    const results = new Map<string, ToolResult>();
    const errors = new Map<string, Error>();

    for (const tool of plan.tools) {
      try {
        const result = await this.executeWithRetry(tool, config);
        results.set(tool.metadata.name, result);

        if (!result.success && config.strategy === 'fail-fast') {
          throw new Error(`Tool ${tool.metadata.name} failed: ${result.error}`);
        }
      } catch (error) {
        errors.set(tool.metadata.name, error);

        if (config.strategy === 'fail-fast') {
          throw error;
        }
      }
    }

    return {
      results,
      errors,
      success: errors.size === 0
    };
  }

  private async executeWithRetry(tool: Tool, config: ExecutionConfig): Promise<ToolResult> {
    const maxAttempts = config.maxRetries || 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await tool.execute();

        if (result.success || attempt === maxAttempts) {
          return result;
        }

        // Wait before retry
        await this.delay(config.retryDelay * Math.pow(2, attempt - 1));
      } catch (error) {
        if (attempt === maxAttempts) throw error;

        await this.delay(config.retryDelay * Math.pow(2, attempt - 1));
      }
    }
  }
}
```

4.7 **Caching Strategies**

**Why Cache?**
- Expensive operations (AI calls, file I/O)
- Idempotent operations (same inputs → same outputs)
- Improve responsiveness

**Cache Key Design:**
```typescript
function generateCacheKey(toolName: string, parameters: ToolParameters): string {
  // Include tool name and parameters
  const paramString = JSON.stringify(parameters, Object.keys(parameters).sort());
  return `${toolName}:${hashString(paramString)}`;
}
```

**Cache with TTL:**
```typescript
class CachingOrchestrator extends Orchestrator {
  private cache = new Map<string, CachedResult>();
  private timers = new Map<string, NodeJS.Timeout>();

  async execute(tool: Tool, params: ToolParameters): Promise<ToolResult> {
    const cacheKey = this.generateCacheKey(tool.metadata.name, params);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.result;
    }

    // Execute and cache
    const result = await tool.execute(params);

    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(cacheKey);
      this.timers.delete(cacheKey);
    }, this.cacheTTL);

    this.timers.set(cacheKey, timer);

    return result;
  }

  dispose() {
    // Clean up timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
  }
}
```

**Case Study:** ollama-code tool orchestrator architecture

**Exercises:**
1. Implement a simple tool system with 3 tools
2. Add dependency resolution and topological sort
3. Implement parallel execution
4. Add caching with TTL
5. Implement retry logic with exponential backoff

---

[Chapters 5-15 would continue with similar detailed structure]

---

## Appendices

### Appendix A: Complete API Reference

[Comprehensive API documentation for all modules]

### Appendix B: Configuration Guide

[Complete configuration options and their effects]

### Appendix C: Troubleshooting Guide

**Common Issues and Solutions:**

1. **Memory Leaks**
   - Symptoms: Growing memory usage
   - Causes: Timers not cleared, event listeners not removed
   - Solutions: Use WeakMap, clear timers, remove listeners

2. **Race Conditions**
   - Symptoms: Intermittent failures, corrupted state
   - Causes: Concurrent access to shared state
   - Solutions: Locks, queues, immutable state

3. **Type Errors**
   - Symptoms: Runtime type mismatches
   - Causes: Using 'any' type, missing validation
   - Solutions: Proper TypeScript types, runtime validation

[More troubleshooting scenarios...]

### Appendix D: Performance Benchmarks

[Benchmark results for various configurations]

### Appendix E: Security Checklist

**Pre-Deployment Security Review:**
- [ ] Credentials encrypted at rest
- [ ] API keys not in code/logs
- [ ] Input validation on all user inputs
- [ ] Tool execution sandboxed
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] HTTPS for all external calls
- [ ] Secrets rotation policy
- [ ] Security headers configured
- [ ] Dependency vulnerability scan

---

## Index

[Comprehensive index of topics, code examples, and case studies]

---

*This book outline provides a complete guide to building production-ready AI coding assistants based on the architecture and lessons learned from the ollama-code project.*
