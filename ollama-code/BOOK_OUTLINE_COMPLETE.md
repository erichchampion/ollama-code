# Building AI Coding Assistants: A Comprehensive Guide

## A Deep Dive into ollama-code Architecture and Design

**Target Audience:** Software engineers, AI/ML engineers, and technical architects interested in building production-ready AI coding assistants

**Prerequisites:** JavaScript/TypeScript, Node.js, basic understanding of AI/LLMs, Git, and software architecture patterns

**Learning Approach:** Concept → Design → Implementation → Extension

---

## Table of Contents

### Part I: Foundations
- [Chapter 1: Introduction to AI Coding Assistants](#chapter-1)
- [Chapter 2: Multi-Provider AI Integration](#chapter-2)
- [Chapter 3: Dependency Injection for AI Systems](#chapter-3)

### Part II: Core Architecture
- [Chapter 4: Tool Orchestration and Execution](#chapter-4)
- [Chapter 5: Streaming Architecture and Real-Time Responses](#chapter-5)
- [Chapter 6: Conversation Management and Context](#chapter-6)

### Part III: Advanced Features
- [Chapter 7: VCS Intelligence and Git Integration](#chapter-7)
- [Chapter 8: Interactive Modes and Natural Language Routing](#chapter-8)
- [Chapter 9: Security, Privacy, and Sandboxing](#chapter-9)

### Part IV: Production Readiness
- [Chapter 10: Testing AI Systems](#chapter-10)
- [Chapter 11: Performance Optimization](#chapter-11)
- [Chapter 12: Monitoring, Observability, and Reliability](#chapter-12)

### Part V: Extensibility and Platform Building
- [Chapter 13: Plugin Architecture and Extension Points](#chapter-13)
- [Chapter 14: IDE Integration and Developer Experience](#chapter-14)
- [Chapter 15: Building Your Own AI Coding Assistant](#chapter-15)

### Appendices
- [Appendix A: API Reference](#appendix-a)
- [Appendix B: Configuration Guide](#appendix-b)
- [Appendix C: Troubleshooting and Common Issues](#appendix-c)
- [Appendix D: Performance Benchmarks](#appendix-d)
- [Appendix E: Security Checklist](#appendix-e)

---

# Part I: Foundations

## Chapter 1: Introduction to AI Coding Assistants {#chapter-1}

### 1.1 What is an AI Coding Assistant?
- Definition and scope
- Evolution from code completion to full coding agents
- Use cases and applications
  - Code generation and refactoring
  - Bug fixing and debugging
  - Documentation generation
  - Code review automation
  - Test generation

### 1.2 Architecture Overview
- High-level system design
- Key components and their interactions
- Data flow and control flow
- Example: ollama-code architecture diagram

**Code Example:**
```typescript
// src/index.ts - Main entry point structure
export interface AppInstance {
  config: AppConfig;
  terminal: TerminalInterface;
  ai: AIClient;
  codebase: CodebaseAnalysis;
  commands: CommandProcessor;
  fileOps: FileOperations;
  execution: ExecutionEnvironment;
  errors: ErrorHandler;
  telemetry: Telemetry | null;
}
```

### 1.3 Design Principles
- Modularity and separation of concerns
- Extensibility and plugin architecture
- Type safety and error handling
- Performance and scalability
- Security and privacy considerations

### 1.4 Technology Stack
- Why TypeScript + Node.js?
- Core dependencies analysis
  - AI SDKs (Ollama, OpenAI, Anthropic, Google)
  - CLI frameworks (Commander, Inquirer, Ora)
  - Testing tools (Vitest, Playwright)
  - Build tools (TypeScript, ESBuild)

### 1.5 Project Structure
- Directory organization
- Module boundaries
- Build and development workflow

**Exercise:**
Set up a minimal AI coding assistant project structure with TypeScript and implement a basic "hello world" AI interaction.

---

## Chapter 2: Multi-Provider AI Integration {#chapter-2}

### 2.1 Why Multi-Provider Support?
- Flexibility and vendor independence
- Cost optimization strategies
- Quality and performance tradeoffs
- Fallback and reliability
- Feature availability across providers

### 2.2 Provider Abstraction Pattern

**Design Pattern:**
```typescript
// src/ai/providers/base-provider.ts
export abstract class BaseAIProvider extends EventEmitter {
  protected config: ProviderConfig;
  protected health: ProviderHealth;
  protected metrics: ProviderMetrics;

  abstract getName(): string;
  abstract initialize(): Promise<void>;
  abstract complete(prompt: string, options: CompletionOptions): Promise<AICompletionResponse>;
  abstract completeStream(prompt: string, options: CompletionOptions, onEvent: StreamCallback): Promise<void>;
  abstract listModels(): Promise<AIModel[]>;
  abstract calculateCost(promptTokens: number, completionTokens: number): number;

  // Shared functionality
  async performHealthCheck(): Promise<void> { /* ... */ }
  protected updateMetrics(success: boolean, responseTime: number, tokensUsed: number, cost: number): void { /* ... */ }
}
```

### 2.3 Provider Implementations

**Case Study: Ollama Provider** (`src/ai/providers/ollama-provider.ts`)
- Local LLM integration
- Streaming implementation
- Model management
- Connection handling

**Case Study: OpenAI Provider** (`src/ai/providers/openai-provider.ts`)
- API authentication and rate limiting
- Token counting and cost calculation
- Error handling and retries
- Tool calling integration

**Case Study: Anthropic Provider** (`src/ai/providers/anthropic-provider.ts`)
- Claude-specific features
- System prompts and thinking tokens
- Streaming with tool use
- Cost optimization

**Case Study: Google Provider** (`src/ai/providers/google-provider.ts`)
- Gemini integration
- Multi-modal support
- Safety settings
- Grounding with Google Search

### 2.4 Provider Manager

**Architecture Deep Dive:**
```typescript
// src/ai/providers/provider-manager.ts
export class ProviderManager extends EventEmitter {
  private providers = new Map<string, BaseAIProvider>();
  private configurations = new Map<string, ProviderConfig>();
  private credentials = new Map<string, ProviderCredentials>();
  private usageStats = new Map<string, ProviderUsageStats>();
  private performanceMetrics = new Map<string, ProviderPerformanceMetrics>();
  private budgets = new Map<string, ProviderBudget>();

  async registerProvider(id: string, type: string, config: ProviderConfig): Promise<void>
  async unregisterProvider(id: string): Promise<void>
  async storeCredentials(id: string, credentials: ProviderCredentials): Promise<void>
  getProvider(id: string): BaseAIProvider | undefined
  trackUsage(id: string, success: boolean, tokensUsed: number, responseTime: number, cost?: number): void
}
```

**Key Features:**
- Credential encryption (AES-256-GCM)
- Usage tracking and cost monitoring
- Performance metrics collection
- Budget enforcement
- Health monitoring
- Configuration persistence

**Security Considerations:**
- Encrypting API keys at rest
- Secure credential storage
- Key derivation best practices
- File permissions (0o600 for credentials)

### 2.5 Intelligent Router

**Routing Strategies:**

```typescript
// src/ai/providers/intelligent-router.ts
export interface RoutingStrategy {
  name: string;
  selectProvider(
    providers: BaseAIProvider[],
    request: AIRequest,
    constraints: RoutingConstraints
  ): BaseAIProvider | null;
}

export class CostOptimizedStrategy implements RoutingStrategy {
  selectProvider(providers, request, constraints) {
    // Select cheapest provider that meets capability requirements
    return providers
      .filter(p => this.meetsRequirements(p, request, constraints))
      .sort((a, b) => this.estimateCost(a, request) - this.estimateCost(b, request))[0];
  }
}

export class QualityOptimizedStrategy implements RoutingStrategy {
  selectProvider(providers, request, constraints) {
    // Select highest quality provider within budget
    return providers
      .filter(p => this.withinBudget(p, request, constraints))
      .sort((a, b) => this.qualityScore(b) - this.qualityScore(a))[0];
  }
}

export class PerformanceOptimizedStrategy implements RoutingStrategy {
  selectProvider(providers, request, constraints) {
    // Select fastest provider that meets requirements
    return providers
      .filter(p => this.meetsRequirements(p, request, constraints))
      .sort((a, b) => a.metrics.averageResponseTime - b.metrics.averageResponseTime)[0];
  }
}
```

**Circuit Breaker Pattern:**
```typescript
class ProviderCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

**Fallback Chains:**
```typescript
const fallbackChain = [
  'anthropic-claude-3.5',
  'openai-gpt-4',
  'ollama-qwen2.5-coder'
];

async function executeWithFallback(prompt: string): Promise<AIResponse> {
  for (const providerId of fallbackChain) {
    try {
      return await router.route(prompt, { providerId });
    } catch (error) {
      logger.warn(`Provider ${providerId} failed, trying next in chain`);
      if (providerId === fallbackChain[fallbackChain.length - 1]) {
        throw error; // Last provider failed
      }
    }
  }
}
```

### 2.6 Response Fusion

**Consensus Building:**

```typescript
// src/ai/providers/response-fusion.ts
export class ResponseFusionEngine {
  async fusedComplete(
    prompt: string,
    options: CompletionOptions,
    fusionConfig: FusionConfig
  ): Promise<FusionResult> {
    // Execute requests in parallel
    const responses = await Promise.all(
      fusionConfig.providers.map(id =>
        this.executeProvider(id, prompt, options)
      )
    );

    // Apply fusion strategy
    switch (fusionConfig.strategy) {
      case 'consensus_voting':
        return this.consensusVoting(responses, fusionConfig);
      case 'quality_ranking':
        return this.qualityRanking(responses, fusionConfig);
      case 'response_merging':
        return this.responseMerging(responses, fusionConfig);
      case 'llm_synthesis':
        return this.llmSynthesis(responses, fusionConfig);
    }
  }

  private consensusVoting(responses: AIResponse[], config: FusionConfig): FusionResult {
    // Find common elements across responses
    const commonElements = this.extractCommonElements(responses);
    const confidence = commonElements.length / responses.length;

    return {
      fusedResponse: {
        content: this.synthesizeFromCommon(commonElements),
        confidence,
        consensus: confidence >= config.consensusThreshold
      },
      individualResponses: responses,
      fusionMetadata: {
        strategy: 'consensus_voting',
        agreementScore: confidence,
        conflictingElements: this.findConflicts(responses)
      }
    };
  }
}
```

**Use Cases for Response Fusion:**
- Critical code reviews (get multiple opinions)
- Security analysis (validate across models)
- Complex problem solving (synthesize diverse approaches)
- Quality assurance (confidence scoring)

### 2.7 Health Monitoring and Metrics

**Health Check System:**
```typescript
interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  consecutiveFailures: number;
  responseTime: number;
  errorRate: number;
}

class ProviderManager {
  private async performHealthChecks(): Promise<void> {
    for (const [id, provider] of this.providers) {
      try {
        const startTime = Date.now();
        const isHealthy = await provider.testConnection();
        const responseTime = Date.now() - startTime;

        this.updateProviderHealth(id, {
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastCheck: new Date(),
          responseTime,
          consecutiveFailures: isHealthy ? 0 : health.consecutiveFailures + 1
        });
      } catch (error) {
        this.handleHealthCheckFailure(id, error);
      }
    }
  }
}
```

### 2.8 Cost Tracking and Budget Enforcement

**Usage Tracking:**
```typescript
interface ProviderUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  dailyUsage: Map<string, number>;  // date -> request count
  monthlyUsage: Map<string, number>; // month -> request count
  lastUsed: Date;
}

interface ProviderBudget {
  providerId: string;
  dailyLimit: number;
  monthlyLimit: number;
  alertThresholds: {
    percentage: number; // Alert at 80%, 90%, 100%
    cost: number;       // Alert at specific cost
  };
}

private checkBudgetLimits(id: string): void {
  const budget = this.budgets.get(id);
  const stats = this.usageStats.get(id);

  if (!budget || !stats) return;

  const today = new Date().toISOString().split('T')[0];
  const dailyCost = this.calculateDailyCost(stats, today);

  if (dailyCost >= budget.dailyLimit) {
    this.emit('budget_exceeded', { id, type: 'daily', cost: dailyCost, limit: budget.dailyLimit });
    throw new Error(`Daily budget exceeded for provider ${id}`);
  }
}
```

### 2.9 Best Practices and Patterns

**Configuration Management:**
- Environment-based configuration
- Secure credential handling
- Provider-specific settings
- Default values and validation

**Error Handling:**
- Provider-specific error types
- Retry strategies with exponential backoff
- Circuit breakers for failing providers
- Graceful degradation

**Testing Strategies:**
- Mock providers for testing
- Provider adapter testing
- Integration tests with real APIs
- Cost control in tests

### Exercises

1. **Implement a Custom Provider:**
   Create a provider for a new AI service (e.g., Cohere, AI21)

2. **Build a Routing Strategy:**
   Implement a custom routing strategy that balances cost, quality, and latency

3. **Create a Fusion Algorithm:**
   Develop a new response fusion strategy for specific use cases

4. **Add Provider Metrics:**
   Extend the metrics system to track custom provider-specific metrics

**Projects:**
- Multi-provider cost comparison tool
- Provider health dashboard
- Response quality analyzer
- Budget forecasting system

---

## Chapter 3: Dependency Injection for AI Systems {#chapter-3}

### 3.1 Why Dependency Injection?
- Problems with singletons
- Testability and mocking
- Loose coupling and modularity
- Lifecycle management
- Circular dependency detection

### 3.2 Container Architecture

**Core Implementation:**
```typescript
// src/core/container.ts
export interface ServiceDefinition<T = unknown> {
  name: string;
  factory: (container: Container) => T | Promise<T>;
  singleton?: boolean;
  dependencies?: string[];
}

export class Container {
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, unknown>();
  private loading = new Map<string, Promise<unknown>>();
  private resolveStack: string[] = [];

  // Register a service
  register<T>(definition: ServiceDefinition<T>): void {
    this.services.set(definition.name, definition);
  }

  // Resolve a service with circular dependency detection
  async resolve<T>(name: string): Promise<T> {
    if (this.resolveStack.includes(name)) {
      throw new Error(
        `Circular dependency detected: ${this.resolveStack.join(' -> ')} -> ${name}`
      );
    }

    this.resolveStack.push(name);
    try {
      const service = this.services.get(name);
      if (!service) throw new Error(`Service '${name}' not registered`);

      // Return cached singleton
      if (service.singleton && this.instances.has(name)) {
        return this.instances.get(name) as T;
      }

      // Resolve dependencies first
      await Promise.all(
        (service.dependencies || []).map(dep => this.resolve(dep))
      );

      // Create instance
      const instance = await service.factory(this);

      if (service.singleton) {
        this.instances.set(name, instance);
      }

      return instance;
    } finally {
      this.resolveStack.pop();
    }
  }
}
```

### 3.3 Service Registry Pattern

**Type-Safe Service Resolution:**
```typescript
export interface ServiceRegistry {
  // Core services
  commandRegistry: CommandProcessor;
  toolRegistry: ToolRegistry;
  logger: Logger;

  // AI services
  aiClient: AIClient;
  enhancedClient: AIClient;

  // Infrastructure
  terminal: TerminalInterface;
  projectContext: ProjectContext;
}

export class TypedContainer {
  constructor(private container: Container) {}

  async resolve<K extends keyof ServiceRegistry>(
    name: K
  ): Promise<ServiceRegistry[K]> {
    return this.container.resolve(name as string);
  }
}
```

### 3.4 IDisposable Pattern

**Resource Management:**
```typescript
export interface IDisposable {
  dispose(): Promise<void> | void;
}

class Container {
  async dispose(): Promise<void> {
    // Dispose in reverse order of registration
    const instances = Array.from(this.instances.entries()).reverse();

    for (const [name, instance] of instances) {
      if (this.isDisposable(instance)) {
        try {
          await instance.dispose();
          logger.debug(`Disposed service: ${name}`);
        } catch (error) {
          logger.error(`Error disposing service ${name}:`, error);
        }
      }
    }

    this.clear();
  }

  private isDisposable(instance: unknown): instance is IDisposable {
    return (
      instance !== null &&
      typeof instance === 'object' &&
      'dispose' in instance &&
      typeof (instance as IDisposable).dispose === 'function'
    );
  }
}
```

### 3.5 Service Initialization

**Lazy vs Eager Initialization:**
```typescript
// src/core/services.ts
export async function initializeServices(level: 'minimal' | 'standard' | 'full' = 'standard'): Promise<void> {
  switch (level) {
    case 'minimal':
      // Only essential services
      await Promise.all([
        globalContainer.resolve('logger'),
        globalContainer.resolve('terminal')
      ]);
      break;

    case 'standard':
      // Common services
      await Promise.all([
        globalContainer.resolve('commandRegistry'),
        globalContainer.resolve('toolRegistry'),
        globalContainer.resolve('aiClient')
      ]);
      break;

    case 'full':
      // All services
      await Promise.all([
        globalContainer.resolve('commandRegistry'),
        globalContainer.resolve('toolRegistry'),
        globalContainer.resolve('aiClient'),
        globalContainer.resolve('enhancedClient'),
        globalContainer.resolve('mcpServer'),
        globalContainer.resolve('mcpClient')
      ]);
      break;
  }
}
```

### 3.6 Testing with DI

**Mock Services:**
```typescript
describe('AIClient with DI', () => {
  let container: Container;
  let mockProvider: MockAIProvider;

  beforeEach(() => {
    container = new Container();
    mockProvider = new MockAIProvider();

    // Register mock provider
    container.instance('aiProvider', mockProvider);

    // Register client that depends on provider
    container.singleton('aiClient', async (c) => {
      const provider = await c.resolve('aiProvider');
      return new AIClient(provider);
    }, ['aiProvider']);
  });

  it('should use injected provider', async () => {
    const client = await container.resolve<AIClient>('aiClient');
    mockProvider.setResponse('test response');

    const result = await client.complete('test prompt');
    expect(result.content).toBe('test response');
  });
});
```

### 3.7 Best Practices

**Service Design:**
- Single responsibility principle
- Clear dependencies
- Async initialization handling
- Proper disposal
- Event emission for cross-cutting concerns

**Container Configuration:**
- Centralized service registration
- Environment-based configuration
- Feature flags for optional services
- Circular dependency avoidance

### Exercises

1. **Create a Service:**
   Build a custom service with dependencies and register it in the container

2. **Implement Circular Detection:**
   Test the circular dependency detection with intentional circular references

3. **Add Service Metrics:**
   Create a service that tracks initialization times and dependencies

**Projects:**
- Service dependency visualizer
- Container performance profiler
- Service health monitor

---

# Part II: Core Architecture

## Chapter 4: Tool Orchestration and Execution {#chapter-4}

### 4.1 Tool System Overview
- What are tools in AI coding assistants?
- Tool categories and responsibilities
- Tool interface design
- Tool discovery and registration

### 4.2 Tool Interface Design

**Base Tool Interface:**
```typescript
// src/tools/types.ts
export interface ToolMetadata {
  name: string;
  description: string;
  category: 'filesystem' | 'execution' | 'git' | 'search' | 'analysis' | 'testing';
  version: string;
  parameters: ToolParameter[];
  examples: ToolExample[];
  requiresApproval?: boolean;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
}

export abstract class BaseTool {
  abstract metadata: ToolMetadata;

  abstract execute(
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult>;

  validateParameters(parameters: Record<string, any>): boolean {
    // Validate against metadata.parameters
  }

  getParameterDefaults(): Record<string, any> {
    // Return default values
  }
}
```

### 4.3 Tool Implementations

**Case Study: Filesystem Tool**
```typescript
// src/tools/filesystem.ts
export class FileSystemTool extends BaseTool {
  metadata: ToolMetadata = {
    name: 'filesystem',
    description: 'Read, write, and manipulate files and directories',
    category: 'filesystem',
    version: '1.0.0',
    parameters: [
      {
        name: 'operation',
        type: 'string',
        description: 'Operation to perform',
        required: true,
        enum: ['read', 'write', 'delete', 'list', 'mkdir']
      },
      {
        name: 'path',
        type: 'string',
        description: 'File or directory path',
        required: true
      },
      {
        name: 'content',
        type: 'string',
        description: 'Content for write operations',
        required: false
      }
    ]
  };

  async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> {
    const { operation, path, content } = parameters;

    // Validate path is within project
    if (!this.isPathSafe(path, context.projectRoot)) {
      return {
        success: false,
        error: 'Path outside project root'
      };
    }

    switch (operation) {
      case 'read':
        return this.readFile(path);
      case 'write':
        return this.writeFile(path, content);
      case 'delete':
        return this.deleteFile(path);
      case 'list':
        return this.listDirectory(path);
      case 'mkdir':
        return this.createDirectory(path);
      default:
        return { success: false, error: 'Unknown operation' };
    }
  }
}
```

**Case Study: Git Tool**
```typescript
// src/tools/advanced-git-tool.ts
export class AdvancedGitTool extends BaseTool {
  metadata: ToolMetadata = {
    name: 'git',
    description: 'Advanced Git operations',
    category: 'git',
    version: '1.0.0',
    parameters: [/* ... */]
  };

  async execute(parameters: any, context: ToolExecutionContext): Promise<ToolResult> {
    const { operation, ...options } = parameters;

    switch (operation) {
      case 'diff':
        return this.getDiff(options);
      case 'log':
        return this.getLog(options);
      case 'status':
        return this.getStatus(options);
      case 'blame':
        return this.getBlame(options);
      case 'commit':
        return this.commit(options);
      default:
        return { success: false, error: 'Unknown operation' };
    }
  }

  private async getDiff(options: any): Promise<ToolResult> {
    const { path, staged, commitRange } = options;
    // Execute git diff with appropriate flags
  }
}
```

**Case Study: Code Analysis Tool**
```typescript
// src/tools/advanced-code-analysis-tool.ts
export class AdvancedCodeAnalysisTool extends BaseTool {
  async analyzeComplexity(code: string): Promise<ComplexityMetrics> {
    // Parse AST
    const ast = this.parseCode(code);

    // Calculate cyclomatic complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);

    // Calculate cognitive complexity
    const cognitiveComplexity = this.calculateCognitiveComplexity(ast);

    // Identify code smells
    const codeSmells = this.detectCodeSmells(ast);

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      codeSmells,
      maintainabilityIndex: this.calculateMaintainabilityIndex(ast)
    };
  }
}
```

### 4.4 Tool Registry

**Registration and Discovery:**
```typescript
// src/tools/registry.ts
export class ToolRegistry {
  private tools = new Map<string, BaseTool>();

  register(tool: BaseTool): void {
    this.validateToolMetadata(tool.metadata);
    this.tools.set(tool.metadata.name, tool);
  }

  get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  list(): ToolMetadata[] {
    return Array.from(this.tools.values()).map(t => t.metadata);
  }

  getByCategory(category: string): BaseTool[] {
    return Array.from(this.tools.values())
      .filter(t => t.metadata.category === category);
  }

  search(query: string): BaseTool[] {
    const searchTerms = query.toLowerCase().split(/\s+/);
    return Array.from(this.tools.values())
      .filter(tool => this.matchesSearch(tool, searchTerms));
  }
}
```

### 4.5 Dependency Resolution

**Building the Dependency Graph:**
```typescript
// src/tools/orchestrator.ts
interface ExecutionNode {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

class ToolOrchestrator {
  private buildDependencyGraph(executions: ToolExecution[]): Map<string, ExecutionNode> {
    const graph = new Map<string, ExecutionNode>();

    for (const execution of executions) {
      graph.set(execution.id, {
        id: execution.id,
        toolName: execution.toolName,
        parameters: execution.parameters,
        dependencies: execution.dependencies || [],
        status: 'pending'
      });
    }

    return graph;
  }

  private detectCircularDependencies(graph: Map<string, ExecutionNode>): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Cycle detected
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = graph.get(nodeId)!;
      for (const depId of node.dependencies) {
        if (hasCycle(depId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    // Check each node for cycles
    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId) && hasCycle(nodeId)) {
        return path; // Return circular path
      }
    }

    return [];
  }
}
```

### 4.6 Parallel Execution

**Orchestration Algorithm:**
```typescript
async executeOrchestration(
  plan: OrchestrationPlan,
  context: ToolExecutionContext
): Promise<Map<string, ToolResult>> {
  const results = new Map<string, ToolResult>();
  const queue = [...plan.executions];
  const inProgress = new Set<string>();

  while (queue.length > 0 || inProgress.size > 0) {
    // Find tools ready to execute (dependencies met)
    const toStart = queue.filter(execution =>
      execution.dependencies.every(depId => results.has(depId))
    );

    // Start executing ready tools (up to max concurrent)
    const slotsAvailable = this.config.maxConcurrentTools - inProgress.size;
    const toExecute = toStart.slice(0, slotsAvailable);

    const executionPromises = toExecute.map(async execution => {
      queue.splice(queue.indexOf(execution), 1);
      inProgress.add(execution.id);

      try {
        const result = await this.executeTool(
          execution.toolName,
          execution.parameters,
          context
        );
        results.set(execution.id, result);
      } finally {
        inProgress.delete(execution.id);
      }
    });

    // Wait for at least one to complete
    if (executionPromises.length > 0) {
      await Promise.race(executionPromises);
    } else if (inProgress.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      // Deadlock check
      if (queue.length > 0) {
        const circular = this.detectCircularDependencies(queue);
        throw new Error(`Circular dependency: ${circular.join(' -> ')}`);
      }
    }
  }

  return results;
}
```

### 4.7 Result Caching

**LRU Cache Implementation:**
```typescript
class ToolOrchestrator {
  private executionCache = new Map<string, ToolResult>();
  private cacheTimers = new Map<string, NodeJS.Timeout>();

  private generateCacheKey(toolName: string, parameters: Record<string, any>): string {
    const paramString = JSON.stringify(parameters);
    return `${toolName}:${Buffer.from(paramString).toString('base64')}`;
  }

  private async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    // Check cache
    const cacheKey = this.generateCacheKey(toolName, parameters);
    if (this.config.enableCaching && this.executionCache.has(cacheKey)) {
      logger.debug(`Using cached result for ${toolName}`);
      return this.executionCache.get(cacheKey)!;
    }

    // Execute tool
    const tool = toolRegistry.get(toolName);
    const result = await tool.execute(parameters, context);

    // Cache successful results
    if (this.config.enableCaching && result.success) {
      this.addToCache(cacheKey, result);
    }

    return result;
  }

  private addToCache(key: string, result: ToolResult): void {
    // LRU eviction if cache full
    while (this.executionCache.size >= MAX_CACHE_SIZE) {
      const lruKey = this.findLeastRecentlyUsed();
      this.executionCache.delete(lruKey);
      const timer = this.cacheTimers.get(lruKey);
      if (timer) clearTimeout(timer);
      this.cacheTimers.delete(lruKey);
    }

    // Add to cache with TTL
    this.executionCache.set(key, result);
    const timer = setTimeout(() => {
      this.executionCache.delete(key);
      this.cacheTimers.delete(key);
    }, this.config.cacheTTL);
    this.cacheTimers.set(key, timer);
  }
}
```

### 4.8 Streaming Tool Orchestrator

**Real-Time Tool Execution:**
```typescript
// src/tools/streaming-orchestrator.ts
export class StreamingToolOrchestrator {
  async streamWithTools(
    conversationHistory: ConversationTurn[],
    context: ToolExecutionContext,
    callbacks: StreamingCallbacks
  ): Promise<StreamingResult> {
    const tools = this.prepareTools();
    const turnToolCalls: OllamaToolCall[] = [];
    let fullContent = '';

    // Start streaming response
    await this.ollamaClient.completeStreamWithTools(
      conversationHistory,
      tools,
      { temperature: 0.7 },
      {
        onContent: (chunk) => {
          fullContent += chunk;
          callbacks.onContent?.(chunk);
        },
        onToolCall: async (toolCall) => {
          // Execute tool immediately
          const result = await this.executeToolWithApproval(
            toolCall,
            context
          );

          turnToolCalls.push(toolCall);
          this.toolResults.set(toolCall.id, {
            result,
            timestamp: Date.now()
          });

          callbacks.onToolCall?.(toolCall, result);
        },
        onComplete: (response) => {
          callbacks.onComplete?.(response);
        }
      }
    );

    return {
      content: fullContent,
      toolCalls: turnToolCalls,
      toolResults: this.getToolResults()
    };
  }
}
```

**Tool Call Parsing:**
```typescript
private parseToolCallsFromContent(content: string): OllamaToolCall[] {
  const toolCalls: OllamaToolCall[] = [];

  // Pattern 1: JSON tool call format
  const jsonPattern = /\{[^}]*"name"\s*:\s*"([^"]+)"[^}]*"arguments"\s*:\s*\{[^}]*\}/g;

  // Pattern 2: Function call format
  const funcPattern = /(\w+)\(([^)]*)\)/g;

  let match;
  while ((match = jsonPattern.exec(content)) !== null) {
    try {
      const toolCall = JSON.parse(match[0]);
      toolCalls.push({
        id: `${toolCall.name}-${Date.now()}`,
        function: {
          name: toolCall.name,
          arguments: toolCall.arguments
        }
      });
    } catch (error) {
      logger.warn('Failed to parse tool call', error);
    }
  }

  return toolCalls;
}
```

### 4.9 Interactive Approval System

**Approval Flow:**
```typescript
private async executeToolWithApproval(
  toolCall: OllamaToolCall,
  context: ToolExecutionContext
): Promise<ToolResult> {
  const tool = toolRegistry.get(toolCall.function.name);
  const parameters = this.parseArguments(toolCall.function.arguments);

  // Check if approval required
  if (this.requiresApproval(tool.metadata.category)) {
    // Check cache first
    const cachedApproval = this.approvalCache.isApproved(
      tool.metadata.name,
      tool.metadata.category
    );

    if (cachedApproval === false) {
      return { success: false, error: 'User denied execution' };
    }

    if (cachedApproval !== true) {
      // Prompt user with timeout
      const TIMEOUT = 60000;
      let timeoutId: NodeJS.Timeout;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Approval timeout')),
          TIMEOUT
        );
      });

      const approvalPromise = promptForApproval({
        toolName: tool.metadata.name,
        category: tool.metadata.category,
        description: tool.metadata.description,
        parameters
      });

      try {
        const result = await Promise.race([approvalPromise, timeoutPromise]);
        clearTimeout(timeoutId!);

        // Cache decision
        this.approvalCache.setApproval(
          tool.metadata.name,
          tool.metadata.category,
          result.approved
        );

        if (!result.approved) {
          return { success: false, error: 'User denied execution' };
        }
      } finally {
        if (timeoutId!) clearTimeout(timeoutId);
      }
    }
  }

  // Execute tool
  return tool.execute(parameters, context);
}
```

### 4.10 Error Handling and Recovery

**Graceful Degradation:**
```typescript
private async executeToolSafely(
  toolName: string,
  parameters: Record<string, any>,
  context: ToolExecutionContext
): Promise<ToolResult> {
  try {
    const tool = toolRegistry.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`
      };
    }

    // Validate parameters
    if (!tool.validateParameters(parameters)) {
      return {
        success: false,
        error: 'Invalid parameters'
      };
    }

    // Execute with timeout
    const timeout = this.config.toolTimeout;
    const result = await Promise.race([
      tool.execute(parameters, context),
      this.timeoutPromise(timeout, `Tool '${toolName}' timed out`)
    ]);

    return result;
  } catch (error) {
    logger.error(`Tool execution failed: ${toolName}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
```

### Exercises

1. **Create a Custom Tool:**
   Build a tool for database queries or API calls

2. **Implement Tool Composition:**
   Create a higher-order tool that combines multiple tools

3. **Build Approval UI:**
   Create a custom approval interface with rich information display

4. **Optimize Cache Strategy:**
   Implement cache warming and predictive caching

**Projects:**
- Tool marketplace/registry
- Visual tool orchestration builder
- Tool performance profiler
- Approval audit log

---

## Chapter 5: Streaming Architecture and Real-Time Responses {#chapter-5}

### 5.1 Why Streaming?
- User experience benefits
- Perceived performance
- Progressive disclosure
- Long-running operations
- Token-by-token generation

### 5.2 Streaming Protocol Design

**SSE vs WebSockets vs HTTP Chunked:**
```typescript
// Ollama uses HTTP chunked transfer encoding
async completeStream(
  prompt: string,
  options: CompletionOptions,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const response = await fetch(this.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...options, stream: true })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        const event = JSON.parse(line);
        onEvent(event);
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    onEvent(JSON.parse(buffer));
  }
}
```

### 5.3 Buffer Management

**Preventing Memory Leaks:**
```typescript
// src/ai/ollama-client.ts
async streamResponse(
  request: StreamRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Prevent unbounded growth
    if (buffer.length > 1024 * 1024) { // 1MB limit
      logger.warn('Stream buffer too large, truncating');

      // Truncate at newline boundaries (JSON object boundaries)
      const lines = buffer.split('\n');
      const midPoint = Math.floor(lines.length / 2);
      buffer = lines.slice(midPoint).join('\n');

      logger.debug('Buffer truncated', {
        linesRemoved: midPoint,
        newSize: buffer.length
      });
    }

    // Process complete events
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const event = JSON.parse(line);
          this.handleStreamEvent(event, onChunk);
        } catch (error) {
          logger.error('Failed to parse stream event', { line, error });
        }
      }
    }
  }
}
```

### 5.4 Progress Reporting

**Real-Time Status Updates:**
```typescript
// src/optimization/progress-manager.ts
export class ProgressManager extends EventEmitter {
  private activeProgress = new Map<string, ProgressInfo>();

  startProgress(id: string, config: ProgressConfig): void {
    const progress: ProgressInfo = {
      id,
      message: config.message,
      current: 0,
      total: config.total,
      percentage: 0,
      startTime: Date.now(),
      status: 'running'
    };

    this.activeProgress.set(id, progress);
    this.emit('progress:start', progress);
  }

  updateProgress(id: string, current: number, message?: string): void {
    const progress = this.activeProgress.get(id);
    if (!progress) return;

    progress.current = current;
    progress.percentage = (current / progress.total) * 100;
    if (message) progress.message = message;

    this.emit('progress:update', progress);

    // Terminal update
    if (this.terminal) {
      this.terminal.updateProgressBar(id, progress);
    }
  }

  completeProgress(id: string, message?: string): void {
    const progress = this.activeProgress.get(id);
    if (!progress) return;

    progress.status = 'completed';
    progress.endTime = Date.now();
    if (message) progress.message = message;

    this.emit('progress:complete', progress);
    this.activeProgress.delete(id);
  }
}
```

### 5.5 Backpressure Handling

**Flow Control:**
```typescript
class StreamingClient {
  private processingQueue: ChunkProcessor[] = [];
  private isProcessing = false;

  async handleChunk(chunk: string): Promise<void> {
    // Add to queue
    this.processingQueue.push({ chunk, timestamp: Date.now() });

    // Apply backpressure if queue too large
    if (this.processingQueue.length > 100) {
      logger.warn('Processing queue backing up, applying backpressure');
      await this.drain();
    }

    // Start processing if not already
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const processor = this.processingQueue.shift()!;

      try {
        await this.processChunk(processor.chunk);
      } catch (error) {
        logger.error('Error processing chunk', error);
      }

      // Yield to event loop
      await new Promise(resolve => setImmediate(resolve));
    }

    this.isProcessing = false;
  }

  private async drain(): Promise<void> {
    // Wait for queue to drain to acceptable size
    while (this.processingQueue.length > 50) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}
```

### 5.6 Error Recovery in Streams

**Retry and Reconnect:**
```typescript
async streamWithRetry(
  request: StreamRequest,
  maxRetries: number = 3
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await this.stream(request);
      return; // Success
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      logger.warn(`Stream error, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, error);

      await new Promise(resolve => setTimeout(resolve, delay));

      // Resume from last known position if possible
      if (request.resumeToken) {
        request.startFrom = request.resumeToken;
      }
    }
  }
}
```

### 5.7 Terminal Output Streaming

**Real-Time Display:**
```typescript
// src/terminal/index.ts
class Terminal implements TerminalInterface {
  private streamBuffer = '';
  private lastUpdate = Date.now();
  private updateInterval = 16; // ~60fps

  streamWrite(text: string): void {
    this.streamBuffer += text;

    // Throttle updates
    const now = Date.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      this.flush();
      this.lastUpdate = now;
    }
  }

  flush(): void {
    if (this.streamBuffer.length === 0) return;

    // Apply syntax highlighting if configured
    const formatted = this.config.codeHighlighting
      ? this.highlightCode(this.streamBuffer)
      : this.streamBuffer;

    process.stdout.write(formatted);
    this.streamBuffer = '';
  }

  private highlightCode(text: string): string {
    // Detect code blocks and apply syntax highlighting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    return text.replace(codeBlockRegex, (match, lang, code) => {
      if (lang && this.highlighter.hasLanguage(lang)) {
        return '```' + lang + '\n' +
               this.highlighter.highlight(code, lang) +
               '```';
      }
      return match;
    });
  }
}
```

### 5.8 Multi-Turn Streaming Conversations

**Context Management:**
```typescript
async streamConversation(
  conversationHistory: ConversationTurn[],
  userInput: string,
  callbacks: ConversationCallbacks
): Promise<ConversationResult> {
  // Add user message to history
  conversationHistory.push({
    role: 'user',
    content: userInput
  });

  let assistantResponse = '';
  const toolCalls: ToolCall[] = [];

  // Stream initial response
  await this.streamWithTools(
    conversationHistory,
    {
      onContent: (chunk) => {
        assistantResponse += chunk;
        callbacks.onContent(chunk);
      },
      onToolCall: async (toolCall) => {
        toolCalls.push(toolCall);

        // Execute tool
        const result = await this.executeTool(toolCall);

        callbacks.onToolResult(toolCall, result);
      }
    }
  );

  // Add assistant response to history
  conversationHistory.push({
    role: 'assistant',
    content: assistantResponse,
    tool_calls: toolCalls
  });

  // Add tool results to history
  for (const toolCall of toolCalls) {
    const result = await this.getToolResult(toolCall.id);
    conversationHistory.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    });
  }

  // Continue streaming if there were tool calls
  if (toolCalls.length > 0) {
    return this.streamConversation(
      conversationHistory,
      '', // Empty user input for continuation
      callbacks
    );
  }

  return {
    conversationHistory,
    finalResponse: assistantResponse,
    toolsUsed: toolCalls.length
  };
}
```

### Exercises

1. **Implement Streaming Parser:**
   Build a robust JSON streaming parser with error recovery

2. **Create Progress Visualizer:**
   Develop an animated progress indicator for long-running streams

3. **Build Stream Recorder:**
   Create a tool to record and replay streaming sessions

**Projects:**
- Stream performance analyzer
- Multi-stream aggregator
- Real-time collaboration system

---

## Chapter 6: Conversation Management and Context {#chapter-6}

### 6.1 Conversation Architecture
- Turn-based conversation model
- Context window management
- History persistence
- Memory optimization

### 6.2 Conversation Manager Implementation

**Core Structure:**
```typescript
// src/ai/conversation-manager.ts
export interface ConversationTurn {
  id: string;
  timestamp: Date;
  userInput: string;
  intent: UserIntent;
  response: string;
  actions: ActionTaken[];
  outcome: 'pending' | 'success' | 'failure' | 'partial';
  contextSnapshot: ContextSnapshot;
  feedback?: UserFeedback;
}

export interface ConversationContext {
  sessionId: string;
  startTime: Date;
  turnCount: number;
  currentTopics: string[];
  activeTask?: ActiveTask;
  projectInfo?: ProjectInfo;
  userPreferences: UserPreferences;
}

export class ConversationManager {
  private conversationHistory: ConversationTurn[] = [];
  private context: ConversationContext;
  private persistencePath: string;
  private maxHistorySize = 1000;
  private contextWindow = 10;

  async addTurn(
    userInput: string,
    intent: UserIntent,
    response: string,
    actions: ActionTaken[] = []
  ): Promise<ConversationTurn> {
    const turn: ConversationTurn = {
      id: this.generateTurnId(),
      timestamp: new Date(),
      userInput,
      intent,
      response,
      actions,
      outcome: 'pending',
      contextSnapshot: await this.captureContextSnapshot()
    };

    this.conversationHistory.push(turn);
    this.updateContext(turn);
    this.trimHistory(); // Sliding window

    await this.persistConversation();

    return turn;
  }
}
```

### 6.3 Context Window Management

**Sliding Window Implementation:**
```typescript
private trimHistory(): void {
  const currentSize = this.conversationHistory.length;

  if (currentSize > this.maxHistorySize) {
    const removedCount = currentSize - this.maxHistorySize;

    // Keep most recent messages (sliding window)
    this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);

    logger.debug('Trimmed conversation history', {
      previousSize: currentSize,
      newSize: this.conversationHistory.length,
      removedCount,
      maxSize: this.maxHistorySize
    });
  }
}

getRecentHistory(maxTurns: number = this.contextWindow): ConversationTurn[] {
  return this.conversationHistory.slice(-maxTurns);
}

getRelevantHistory(currentIntent: UserIntent, maxTurns: number = 5): ConversationTurn[] {
  const relevantTurns: ConversationTurn[] = [];
  const recentTurns = this.getRecentHistory(maxTurns * 2);

  for (const turn of recentTurns.reverse()) {
    if (relevantTurns.length >= maxTurns) break;

    // Include if intent is related
    if (this.isIntentRelevant(turn.intent, currentIntent)) {
      relevantTurns.unshift(turn);
    }
  }

  return relevantTurns;
}
```

### 6.4 Conversation Persistence

**Reliable Storage:**
```typescript
private async ensurePersistenceDirectory(): Promise<void> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await fs.mkdir(this.persistencePath, { recursive: true });
      logger.debug('Persistence directory created', {
        path: this.persistencePath,
        attempt
      });
      return;
    } catch (error) {
      logger.warn(`Failed to create directory (attempt ${attempt}/${MAX_RETRIES})`, error);

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        throw new Error(`Could not create persistence directory: ${error}`);
      }
    }
  }
}

async persistConversation(): Promise<void> {
  try {
    const conversationFile = join(
      this.persistencePath,
      `${this.context.sessionId}.json`
    );

    const dataToSave = {
      context: this.context,
      history: this.conversationHistory
    };

    await fs.writeFile(
      conversationFile,
      JSON.stringify(dataToSave, null, 2)
    );

    logger.debug('Persisted conversation', {
      sessionId: this.context.sessionId,
      turnCount: this.conversationHistory.length
    });
  } catch (error) {
    logger.error('Failed to persist conversation', error);
  }
}
```

### 6.5 Intent Analysis

**Understanding User Intent:**
```typescript
// src/ai/intent-analyzer.ts
export interface UserIntent {
  type: 'query' | 'command' | 'task_request' | 'clarification' | 'feedback';
  action: string;
  entities: Entity[];
  confidence: number;
  multiStep: boolean;
  requiresContext: boolean;
  suggestedClarifications: string[];
}

export class IntentAnalyzer {
  async analyzeIntent(userInput: string, context: ConversationContext): Promise<UserIntent> {
    // Use AI to analyze intent
    const prompt = this.buildIntentAnalysisPrompt(userInput, context);
    const response = await this.aiClient.complete(prompt, {
      temperature: 0.3, // Low temperature for consistent classification
      maxTokens: 500
    });

    return this.parseIntentFromResponse(response.content);
  }

  private buildIntentAnalysisPrompt(input: string, context: ConversationContext): string {
    return `Analyze the following user input and determine their intent.

User Input: "${input}"

Context:
- Current Topics: ${context.currentTopics.join(', ')}
- Active Task: ${context.activeTask?.description || 'None'}
- Turn Count: ${context.turnCount}

Classify the intent into one of:
- query: User is asking a question
- command: User wants to execute a specific action
- task_request: User wants help with a multi-step task
- clarification: User is responding to a previous question
- feedback: User is providing feedback on a previous response

Provide your analysis in JSON format:
{
  "type": "...",
  "action": "...",
  "entities": [...],
  "confidence": 0.0-1.0,
  "multiStep": true/false,
  "requiresContext": true/false,
  "suggestedClarifications": [...]
}`;
  }
}
```

### 6.6 Context Enrichment

**Project Context:**
```typescript
// src/codebase/project-context.ts
export class ProjectContext {
  async analyzeProject(projectRoot: string): Promise<ProjectInfo> {
    return {
      root: projectRoot,
      language: await this.detectLanguage(projectRoot),
      framework: await this.detectFramework(projectRoot),
      dependencies: await this.analyzeDependencies(projectRoot),
      structure: await this.analyzeStructure(projectRoot),
      buildSystem: await this.detectBuildSystem(projectRoot),
      testFramework: await this.detectTestFramework(projectRoot)
    };
  }

  private async detectLanguage(projectRoot: string): Promise<string> {
    // Check for package.json (JavaScript/TypeScript)
    if (await this.fileExists(join(projectRoot, 'package.json'))) {
      const tsconfig = await this.fileExists(join(projectRoot, 'tsconfig.json'));
      return tsconfig ? 'TypeScript' : 'JavaScript';
    }

    // Check for requirements.txt (Python)
    if (await this.fileExists(join(projectRoot, 'requirements.txt'))) {
      return 'Python';
    }

    // Check for Cargo.toml (Rust)
    if (await this.fileExists(join(projectRoot, 'Cargo.toml'))) {
      return 'Rust';
    }

    // Check for go.mod (Go)
    if (await this.fileExists(join(projectRoot, 'go.mod'))) {
      return 'Go';
    }

    return 'Unknown';
  }
}
```

### 6.7 Memory Optimization

**Conversation Summarization:**
```typescript
async summarizeConversation(turns: ConversationTurn[]): Promise<ConversationSummary> {
  const prompt = `Summarize the following conversation, preserving key decisions and outcomes.

${turns.map(t => `User: ${t.userInput}\nAssistant: ${t.response}`).join('\n\n')}

Provide a concise summary focusing on:
1. Main topics discussed
2. Actions taken
3. Decisions made
4. Outstanding issues

Summary:`;

  const response = await this.aiClient.complete(prompt, {
    temperature: 0.5,
    maxTokens: 500
  });

  return {
    summary: response.content,
    turnsCovered: turns.length,
    keyTopics: this.extractTopics(turns),
    actionsTaken: turns.flatMap(t => t.actions),
    timestamp: new Date()
  };
}
```

### Exercises

1. **Implement Smart Context Selection:**
   Build an algorithm to select most relevant history turns

2. **Create Conversation Analytics:**
   Track metrics like resolution rate, user satisfaction, etc.

3. **Build Context Visualization:**
   Create a UI to visualize conversation flow and context

**Projects:**
- Conversation replay system
- Context debugger
- Multi-session manager

---

# Part III: Advanced Features

## Chapter 7: VCS Intelligence and Git Integration {#chapter-7}

### 7.1 VCS Intelligence Overview
- Why integrate with version control?
- Git as the primary VCS
- AI-powered commit messages
- Automated code review
- CI/CD generation

### 7.2 Git Hooks Integration

**Hook Installation:**
```typescript
// src/ai/vcs/git-hooks-manager.ts
export class GitHooksManager {
  async installHooks(projectRoot: string, config: HookConfig): Promise<void> {
    const hooksDir = join(projectRoot, '.git', 'hooks');

    // Install pre-commit hook
    if (config.enablePreCommitValidation) {
      await this.installPreCommitHook(hooksDir);
    }

    // Install commit-msg hook
    if (config.enableCommitMessageValidation) {
      await this.installCommitMsgHook(hooksDir);
    }

    // Install pre-push hook
    if (config.enablePrePushValidation) {
      await this.installPrePushHook(hooksDir);
    }

    logger.info('Git hooks installed successfully');
  }

  private async installPreCommitHook(hooksDir: string): Promise<void> {
    const hookPath = join(hooksDir, 'pre-commit');
    const hookContent = `#!/bin/sh
# AI-powered pre-commit validation

ollama-code git validate-commit

if [ $? -ne 0 ]; then
  echo "Pre-commit validation failed. Commit blocked."
  echo "Run 'ollama-code git suggest-improvements' for suggestions."
  exit 1
fi

exit 0
`;

    await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
  }
}
```

**Pre-Commit Validation:**
```typescript
async validateCommit(): Promise<ValidationResult> {
  // Get staged changes
  const stagedDiff = await this.git.diff(['--cached']);

  // Analyze changes with AI
  const analysis = await this.analyzeChanges(stagedDiff);

  // Check quality thresholds
  const issues: ValidationIssue[] = [];

  if (analysis.qualityScore < this.config.minimumQualityScore) {
    issues.push({
      severity: 'error',
      message: `Code quality score ${analysis.qualityScore} below minimum ${this.config.minimumQualityScore}`,
      suggestions: analysis.suggestions
    });
  }

  if (analysis.securityIssues.length > 0) {
    issues.push({
      severity: 'error',
      message: `Security issues detected: ${analysis.securityIssues.length}`,
      details: analysis.securityIssues
    });
  }

  if (analysis.testCoverage < this.config.minimumTestCoverage) {
    issues.push({
      severity: 'warning',
      message: `Test coverage ${analysis.testCoverage}% below minimum ${this.config.minimumTestCoverage}%`
    });
  }

  return {
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    analysis
  };
}
```

### 7.3 AI-Powered Commit Message Generation

**Conventional Commits:**
```typescript
// src/ai/vcs/commit-message-generator.ts
export class CommitMessageGenerator {
  async generateCommitMessage(stagedChanges: string): Promise<CommitMessage> {
    const prompt = `Analyze the following git diff and generate a conventional commit message.

Diff:
${stagedChanges}

Generate a commit message following the Conventional Commits specification:
<type>(<scope>): <subject>

<body>

<footer>

Types: feat, fix, docs, style, refactor, perf, test, chore
Make the message concise but informative. Include "why" not just "what".

Commit Message:`;

    const response = await this.aiClient.complete(prompt, {
      temperature: 0.5,
      maxTokens: 300
    });

    return this.parseCommitMessage(response.content);
  }

  private parseCommitMessage(content: string): CommitMessage {
    const lines = content.trim().split('\n');
    const subject = lines[0];

    // Parse type and scope
    const match = subject.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);

    if (!match) {
      throw new Error('Invalid commit message format');
    }

    const [, type, scope, shortDescription] = match;

    // Extract body and footer
    const body = lines.slice(2, -2).join('\n').trim();
    const footer = lines.slice(-2).join('\n').trim();

    return {
      type,
      scope: scope || null,
      subject: shortDescription,
      body: body || null,
      footer: footer || null,
      fullMessage: content
    };
  }
}
```

### 7.4 Pull Request Review

**Automated Review System:**
```typescript
// src/ai/vcs/pull-request-reviewer.ts
export class PullRequestReviewer {
  async reviewPullRequest(pr: PullRequestInfo): Promise<ReviewResult> {
    // Get PR diff
    const diff = await this.fetchPRDiff(pr);

    // Analyze each file
    const fileReviews = await Promise.all(
      diff.files.map(file => this.reviewFile(file))
    );

    // Aggregate results
    const allIssues = fileReviews.flatMap(r => r.issues);
    const securityIssues = allIssues.filter(i => i.category === 'security');
    const bugRisks = allIssues.filter(i => i.category === 'bug');
    const performanceIssues = allIssues.filter(i => i.category === 'performance');

    // Calculate overall score
    const overallScore = this.calculateQualityScore(fileReviews);

    return {
      pullRequestNumber: pr.number,
      overallScore,
      recommendation: overallScore >= 0.7 ? 'approve' : 'request_changes',
      fileReviews,
      summary: {
        totalIssues: allIssues.length,
        securityIssues: securityIssues.length,
        bugRisks: bugRisks.length,
        performanceIssues: performanceIssues.length
      },
      suggestions: this.generateSuggestions(allIssues)
    };
  }

  private async reviewFile(file: DiffFile): Promise<FileReview> {
    const prompt = `Review the following code changes for:
- Security vulnerabilities
- Potential bugs
- Performance issues
- Code quality
- Best practices

File: ${file.path}
Changes:
${file.patch}

Provide a detailed review in JSON format:
{
  "issues": [
    {
      "line": number,
      "severity": "critical|high|medium|low",
      "category": "security|bug|performance|style|best-practice",
      "message": "description",
      "suggestion": "how to fix"
    }
  ],
  "positiveAspects": ["..."],
  "qualityScore": 0.0-1.0
}`;

    const response = await this.aiClient.complete(prompt, {
      temperature: 0.3,
      maxTokens: 1000
    });

    return JSON.parse(response.content);
  }
}
```

### 7.5 CI/CD Pipeline Generation

**Universal CI/CD Configuration:**
```typescript
// src/ai/vcs/ci-pipeline-integrator.ts
export class CIPipelineIntegrator {
  async generatePipeline(
    projectInfo: ProjectInfo,
    platform: 'github' | 'gitlab' | 'azure' | 'circleci'
  ): Promise<PipelineConfig> {
    // Analyze project to determine pipeline needs
    const requirements = await this.analyzePipelineRequirements(projectInfo);

    // Generate platform-specific configuration
    switch (platform) {
      case 'github':
        return this.generateGitHubActions(requirements);
      case 'gitlab':
        return this.generateGitLabCI(requirements);
      case 'azure':
        return this.generateAzurePipelines(requirements);
      case 'circleci':
        return this.generateCircleCI(requirements);
    }
  }

  private async generateGitHubActions(requirements: PipelineRequirements): Promise<PipelineConfig> {
    const workflow = {
      name: 'CI/CD Pipeline',
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main'] }
      },
      jobs: {
        test: {
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v3' },
            { uses: 'actions/setup-node@v3', with: { 'node-version': '18' } },
            { run: 'npm ci' },
            { run: 'npm run lint' },
            { run: 'npm test' },
            { run: 'npm run build' }
          ]
        }
      }
    };

    // Add quality gates
    if (requirements.enforceQualityGates) {
      workflow.jobs.quality = this.generateQualityGateJob(requirements);
    }

    // Add security scanning
    if (requirements.securityScanning) {
      workflow.jobs.security = this.generateSecurityScanJob(requirements);
    }

    return {
      platform: 'github',
      filePath: '.github/workflows/ci.yml',
      content: yaml.stringify(workflow)
    };
  }
}
```

### 7.6 Code Quality Tracking

**Quality Metrics Over Time:**
```typescript
// src/ai/vcs/code-quality-tracker.ts
export class CodeQualityTracker {
  async trackQuality(commit: string): Promise<QualityMetrics> {
    const metrics: QualityMetrics = {
      commit,
      timestamp: new Date(),
      complexity: await this.measureComplexity(commit),
      testCoverage: await this.measureTestCoverage(commit),
      duplication: await this.measureDuplication(commit),
      maintainability: await this.calculateMaintainability(commit),
      technicalDebt: await this.estimateTechnicalDebt(commit)
    };

    await this.persistMetrics(metrics);
    await this.checkForRegressions(metrics);

    return metrics;
  }

  private async checkForRegressions(current: QualityMetrics): Promise<void> {
    const previous = await this.getLatestMetrics();

    if (!previous) return;

    const regressions: QualityRegression[] = [];

    // Check complexity increase
    if (current.complexity.average > previous.complexity.average * 1.1) {
      regressions.push({
        metric: 'complexity',
        previous: previous.complexity.average,
        current: current.complexity.average,
        threshold: previous.complexity.average * 1.1,
        severity: 'high'
      });
    }

    // Check test coverage decrease
    if (current.testCoverage.percentage < previous.testCoverage.percentage - 5) {
      regressions.push({
        metric: 'test_coverage',
        previous: previous.testCoverage.percentage,
        current: current.testCoverage.percentage,
        threshold: previous.testCoverage.percentage - 5,
        severity: 'high'
      });
    }

    if (regressions.length > 0) {
      await this.notifyRegressions(regressions);
    }
  }
}
```

### Exercises

1. **Custom Commit Analyzer:**
   Build a specialized analyzer for specific code patterns

2. **Review Summary Generator:**
   Create rich HTML reports for PR reviews

3. **Quality Dashboard:**
   Build a web dashboard showing quality trends

**Projects:**
- Git workflow automator
- Custom CI/CD builder
- Code quality forecaster

---

*[Continuing with remaining chapters...]*

---

## Appendices

### Appendix A: API Reference {#appendix-a}

Complete API documentation for all public interfaces:
- Provider APIs
- Tool APIs
- Configuration APIs
- Hook APIs

### Appendix B: Configuration Guide {#appendix-b}

Comprehensive configuration reference:
- Environment variables
- Configuration files
- Provider-specific settings
- Security configurations

### Appendix C: Troubleshooting {#appendix-c}

Common issues and solutions:
- Connection problems
- Performance issues
- Memory leaks
- Configuration errors

### Appendix D: Performance Benchmarks {#appendix-d}

Performance data and optimization tips:
- Provider comparison
- Caching effectiveness
- Streaming vs non-streaming
- Parallel execution benefits

### Appendix E: Security Checklist {#appendix-e}

Security best practices:
- Credential storage
- API key management
- Sandboxing
- Input validation
- Rate limiting

---

## Book Features

### Throughout the Book

**Code Examples:**
- Every concept illustrated with real code from ollama-code
- Complete, runnable examples
- Before/after comparisons for refactoring

**Exercises:**
- Hands-on exercises at end of each chapter
- Progressive difficulty
- Solution guides included

**Projects:**
- Capstone projects combining multiple concepts
- Real-world scenarios
- Extension ideas

**Diagrams:**
- Architecture diagrams
- Sequence diagrams
- Data flow diagrams
- State machines

**Callout Boxes:**
- ⚠️ Common Pitfalls
- 💡 Pro Tips
- 🔒 Security Considerations
- 🚀 Performance Tips
- 📝 Best Practices

**Case Studies:**
- Real implementations from ollama-code
- Design decision rationales
- Evolution of features
- Lessons learned

---

## Learning Path

### Beginner Path (Chapters 1-3, 10)
Focus on fundamentals and testing

### Intermediate Path (Chapters 4-6, 11-12)
Core architecture and production readiness

### Advanced Path (Chapters 7-9, 13-15)
Advanced features and extensibility

### Platform Builder Path (All chapters + deep dives)
Complete understanding for building platforms

---

## Companion Resources

### Online Resources
- GitHub repository with all code examples
- Video tutorials for complex topics
- Interactive exercises
- Community forum

### Downloadable Materials
- Code templates
- Configuration examples
- Testing frameworks
- CI/CD templates

### Tools
- Debugging tools
- Performance profilers
- Visualization tools
- Testing utilities

---

**Total Estimated Length:** 600-800 pages
**Reading Time:** 40-60 hours
**Coding Exercises:** 100+ hours
**Target Publication:** Technical publisher (O'Reilly, Manning, Pragmatic Bookshelf)
