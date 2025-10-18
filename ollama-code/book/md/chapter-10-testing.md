# Chapter 10: Testing AI Systems

> *"Testing leads to failure, and failure leads to understanding." — Burt Rutan*

---

## Table of Contents

- [10.1 Testing Challenges for AI Systems](#101-testing-challenges-for-ai-systems)
- [10.2 Unit Testing Strategy](#102-unit-testing-strategy)
- [10.3 Mock AI Providers](#103-mock-ai-providers)
- [10.4 Integration Testing](#104-integration-testing)
- [10.5 Synthetic Test Generation](#105-synthetic-test-generation)
- [10.6 Performance Testing](#106-performance-testing)
- [10.7 Quality-Based Assertions](#107-quality-based-assertions)
- [10.8 Regression Detection](#108-regression-detection)
- [Exercises](#exercises)
- [Summary](#summary)

---

## 10.1 Testing Challenges for AI Systems

Testing AI systems is fundamentally different from testing traditional software. AI outputs are non-deterministic, models change over time, and correctness is often subjective.

### Traditional vs AI Testing

```typescript
// Traditional: Deterministic
function add(a: number, b: number): number {
  return a + b;
}

test('add function', () => {
  expect(add(2, 2)).toBe(4); // ✓ Always passes
  expect(add(0, 0)).toBe(0); // ✓ Always passes
  expect(add(-1, 1)).toBe(0); // ✓ Always passes
});

// AI: Non-deterministic
async function generateCode(prompt: string): Promise<string> {
  return ai.complete(prompt);
}

test('generate code', async () => {
  const code = await generateCode('Write a function to add numbers');

  // ❌ This fails - output varies every time
  expect(code).toBe('function add(a, b) { return a + b; }');

  // ❓ How do you test this?
});
```

### Key Challenges

```typescript
/**
 * Challenges in testing AI systems
 */
export enum AITestingChallenge {
  /** Outputs vary between runs */
  NON_DETERMINISTIC = 'non_deterministic',

  /** No single "correct" answer */
  SUBJECTIVE_QUALITY = 'subjective_quality',

  /** Models update, behavior changes */
  MODEL_DRIFT = 'model_drift',

  /** Slow, expensive API calls */
  SLOW_EXPENSIVE = 'slow_expensive',

  /** Hard to test edge cases */
  EDGE_CASE_COVERAGE = 'edge_case_coverage',

  /** Difficult to isolate failures */
  DEBUGGING = 'debugging'
}

/**
 * Solutions to AI testing challenges
 */
export const AI_TESTING_SOLUTIONS = {
  [AITestingChallenge.NON_DETERMINISTIC]: [
    'Use quality-based assertions instead of exact matching',
    'Test properties and patterns, not exact output',
    'Use semantic similarity for comparison'
  ],

  [AITestingChallenge.SUBJECTIVE_QUALITY]: [
    'Define measurable quality criteria',
    'Use automated quality checks (linting, parsing)',
    'Create rubrics for evaluation'
  ],

  [AITestingChallenge.MODEL_DRIFT]: [
    'Version lock models in tests',
    'Monitor quality metrics over time',
    'Use regression test suites'
  ],

  [AITestingChallenge.SLOW_EXPENSIVE]: [
    'Mock AI providers for unit tests',
    'Cache responses for deterministic tests',
    'Use smaller/faster models for testing'
  ],

  [AITestingChallenge.EDGE_CASE_COVERAGE]: [
    'Generate synthetic test cases',
    'Use property-based testing',
    'Collect real failure cases'
  ],

  [AITestingChallenge.DEBUGGING]: [
    'Log full context (prompt, response, metadata)',
    'Capture intermediate steps',
    'Use replay testing'
  ]
};
```

### Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Testing Pyramid for AI                     │
└─────────────────────────────────────────────────────────────┘

                    ▲
                   ╱ ╲
                  ╱   ╲  E2E Tests (Few)
                 ╱     ╲  - Real AI providers
                ╱       ╲ - End-to-end workflows
               ╱─────────╲ - Slow but comprehensive
              ╱           ╲
             ╱             ╲
            ╱               ╲ Integration Tests (Some)
           ╱                 ╲ - Mock AI providers
          ╱                   ╲ - Component integration
         ╱                     ╲ - Fast, deterministic
        ╱───────────────────────╲
       ╱                         ╲
      ╱                           ╲
     ╱                             ╲ Unit Tests (Many)
    ╱                               ╲ - Pure functions
   ╱                                 ╲ - No AI calls
  ╱                                   ╲ - Very fast
 ╱─────────────────────────────────────╲
```

---

## 10.2 Unit Testing Strategy

Unit tests should be fast, deterministic, and test individual components without AI dependencies.

### Testing Pure Functions

```typescript
import { describe, test, expect } from 'vitest';

/**
 * Test pure functions without AI dependencies
 */

// Example: Token counting
describe('TokenCounter', () => {
  test('counts tokens accurately', () => {
    const counter = new TokenCounter();

    expect(counter.count('hello world')).toBe(2);
    expect(counter.count('The quick brown fox')).toBe(4);
    expect(counter.count('')).toBe(0);
  });

  test('handles special characters', () => {
    const counter = new TokenCounter();

    expect(counter.count('hello, world!')).toBe(3);
    expect(counter.count('foo-bar_baz')).toBe(3);
  });
});

// Example: Message formatting
describe('MessageFormatter', () => {
  test('formats user message', () => {
    const formatter = new MessageFormatter();

    const formatted = formatter.format({
      role: MessageRole.USER,
      content: 'Hello, AI!'
    });

    expect(formatted).toHaveProperty('role', 'user');
    expect(formatted).toHaveProperty('content', 'Hello, AI!');
  });

  test('formats system message', () => {
    const formatter = new MessageFormatter();

    const formatted = formatter.format({
      role: MessageRole.SYSTEM,
      content: 'You are a helpful assistant'
    });

    expect(formatted).toHaveProperty('role', 'system');
    expect(formatted.content).toContain('helpful assistant');
  });
});

// Example: Context window management
describe('ContextWindowManager', () => {
  test('selects recent messages within limit', () => {
    const manager = new ContextWindowManager({
      maxTokens: 100,
      strategy: ContextWindowStrategy.RECENT
    });

    const messages = [
      { role: MessageRole.USER, content: 'Message 1', tokens: 30 },
      { role: MessageRole.ASSISTANT, content: 'Response 1', tokens: 40 },
      { role: MessageRole.USER, content: 'Message 2', tokens: 35 },
      { role: MessageRole.ASSISTANT, content: 'Response 2', tokens: 45 }
    ];

    const selected = manager.selectMessages(messages);

    // Should select most recent that fit
    expect(selected.length).toBe(2);
    expect(selected[0].content).toBe('Message 2');
    expect(selected[1].content).toBe('Response 2');
  });

  test('always includes system messages', () => {
    const manager = new ContextWindowManager({
      maxTokens: 50,
      strategy: ContextWindowStrategy.RECENT
    });

    const messages = [
      { role: MessageRole.SYSTEM, content: 'System prompt', tokens: 20 },
      { role: MessageRole.USER, content: 'User message', tokens: 40 }
    ];

    const selected = manager.selectMessages(messages);

    expect(selected.length).toBe(2);
    expect(selected[0].role).toBe(MessageRole.SYSTEM);
  });
});
```

### Testing Tools (Without Execution)

```typescript
describe('FileTool', () => {
  test('validates parameters', () => {
    const tool = new FileTool();

    const valid = tool.validateParameters({
      path: 'src/index.ts',
      operation: 'read'
    });

    expect(valid.valid).toBe(true);
  });

  test('rejects invalid paths', () => {
    const tool = new FileTool();

    const invalid = tool.validateParameters({
      path: '../../../etc/passwd',
      operation: 'read'
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.errors[0].message).toContain('Invalid path');
  });

  test('requires path parameter', () => {
    const tool = new FileTool();

    const invalid = tool.validateParameters({
      operation: 'read'
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContainEqual(
      expect.objectContaining({ parameter: 'path' })
    );
  });
});

describe('DependencyGraph', () => {
  test('detects cycles', () => {
    const graph = new DependencyGraph();

    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A'); // Cycle!

    const cycle = graph.detectCycle();

    expect(cycle).not.toBeNull();
    expect(cycle).toContain('A');
    expect(cycle).toContain('B');
    expect(cycle).toContain('C');
  });

  test('topological sort', () => {
    const graph = new DependencyGraph();

    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B'); // A depends on B
    graph.addEdge('B', 'C'); // B depends on C

    const sorted = graph.topologicalSort();

    // C should come before B, B before A
    expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('B'));
    expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('A'));
  });
});
```

### Testing Configuration and Validation

```typescript
describe('SandboxConfig', () => {
  test('validates allowed paths', () => {
    const validator = new SandboxValidator({
      allowedPaths: ['src/**/*', 'test/**/*'],
      blockedPaths: ['**/*.env']
    });

    expect(validator.isPathAllowed('src/index.ts').allowed).toBe(true);
    expect(validator.isPathAllowed('test/unit.test.ts').allowed).toBe(true);
    expect(validator.isPathAllowed('secrets.env').allowed).toBe(false);
    expect(validator.isPathAllowed('../etc/passwd').allowed).toBe(false);
  });

  test('blocked paths take precedence', () => {
    const validator = new SandboxValidator({
      allowedPaths: ['**/*'],
      blockedPaths: ['**/*.key']
    });

    expect(validator.isPathAllowed('src/index.ts').allowed).toBe(true);
    expect(validator.isPathAllowed('src/private.key').allowed).toBe(false);
  });
});

describe('InputValidator', () => {
  test('detects API keys', () => {
    const validator = new InputValidator(logger);

    const result = validator.validate('My key is sk-ant-api03-xyz123');

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ type: 'sensitive_data' })
    );
  });

  test('detects injection attempts', () => {
    const validator = new InputValidator(logger);

    const result = validator.validate('Run: rm -rf /');

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ type: 'injection_attempt' })
    );
  });
});
```

---

## 10.3 Mock AI Providers

Mock AI providers enable fast, deterministic testing without real API calls.

### Mock Provider Implementation

```typescript
/**
 * Mock AI provider for testing
 */
export class MockAIProvider implements AIProvider {
  private responses: Map<string, string> = new Map();
  private callCount = 0;
  private calls: CompletionRequest[] = [];

  /**
   * Set canned response for specific prompt
   */
  setResponse(promptPattern: string | RegExp, response: string): void {
    const key = promptPattern instanceof RegExp
      ? promptPattern.source
      : promptPattern;

    this.responses.set(key, response);
  }

  /**
   * Set default response for all prompts
   */
  setDefaultResponse(response: string): void {
    this.responses.set('*', response);
  }

  /**
   * Complete with mocked response
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    this.callCount++;
    this.calls.push(request);

    // Get last user message
    const userMessage = request.messages
      .filter(m => m.role === MessageRole.USER)
      .pop();

    if (!userMessage) {
      throw new Error('No user message in request');
    }

    // Find matching response
    const response = this.findResponse(userMessage.content);

    if (!response) {
      throw new Error(`No mocked response for: ${userMessage.content}`);
    }

    return {
      content: response,
      role: MessageRole.ASSISTANT,
      model: 'mock-model',
      usage: {
        inputTokens: this.estimateTokens(request.messages),
        outputTokens: this.estimateTokens([{ role: MessageRole.ASSISTANT, content: response }]),
        totalTokens: 0
      },
      metadata: {
        provider: 'mock',
        latency: 10
      }
    };
  }

  /**
   * Find response matching prompt
   */
  private findResponse(prompt: string): string | null {
    // Try exact match
    if (this.responses.has(prompt)) {
      return this.responses.get(prompt)!;
    }

    // Try regex patterns
    for (const [pattern, response] of this.responses.entries()) {
      if (pattern === '*') continue; // Skip default

      const regex = new RegExp(pattern);
      if (regex.test(prompt)) {
        return response;
      }
    }

    // Use default
    return this.responses.get('*') || null;
  }

  /**
   * Get number of times complete() was called
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Get all completion requests
   */
  getCalls(): CompletionRequest[] {
    return this.calls;
  }

  /**
   * Reset mock state
   */
  reset(): void {
    this.responses.clear();
    this.callCount = 0;
    this.calls = [];
  }

  /**
   * Estimate tokens (simple word count)
   */
  private estimateTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => {
      return total + msg.content.split(/\s+/).length;
    }, 0);
  }

  // Implement other AIProvider methods
  async stream(request: CompletionRequest): Promise<AsyncIterableIterator<StreamEvent>> {
    throw new Error('Stream not implemented in mock');
  }

  async healthCheck(): Promise<HealthStatus> {
    return { healthy: true, latency: 1 };
  }

  getMetrics(): ProviderMetrics {
    return {
      requestCount: this.callCount,
      errorCount: 0,
      totalCost: 0,
      totalTokens: 0
    };
  }
}
```

### Using Mock Providers in Tests

```typescript
describe('CommitMessageGenerator', () => {
  let mockAI: MockAIProvider;
  let generator: CommitMessageGenerator;

  beforeEach(() => {
    mockAI = new MockAIProvider();
    generator = new CommitMessageGenerator(mockAI);
  });

  afterEach(() => {
    mockAI.reset();
  });

  test('generates conventional commit message', async () => {
    // Mock AI response
    mockAI.setDefaultResponse(
      'fix(auth): resolve token refresh race condition\n\n' +
      'Add mutex lock to prevent concurrent token refreshes'
    );

    const diff: GitDiff = {
      files: [
        {
          path: 'src/auth/token.ts',
          additions: 10,
          deletions: 2,
          changes: 12
        }
      ],
      additions: 10,
      deletions: 2
    };

    const message = await generator.generate(diff);

    expect(message.message).toMatch(/^fix\(auth\):/);
    expect(message.message).toContain('token refresh');
    expect(mockAI.getCallCount()).toBe(1);
  });

  test('uses scope from context', async () => {
    mockAI.setDefaultResponse('feat(api): add user endpoint');

    const diff: GitDiff = {
      files: [{ path: 'src/api/users.ts', additions: 50, deletions: 0, changes: 50 }],
      additions: 50,
      deletions: 0
    };

    const message = await generator.generate(diff, {
      scope: 'api'
    });

    expect(message.message).toMatch(/^feat\(api\):/);

    // Verify AI was called with scope in prompt
    const calls = mockAI.getCalls();
    expect(calls[0].messages[1].content).toContain('scope: api');
  });
});

describe('NaturalLanguageRouter', () => {
  let mockAI: MockAIProvider;
  let router: NaturalLanguageRouter;

  beforeEach(() => {
    mockAI = new MockAIProvider();
    router = new NaturalLanguageRouter(mockAI, commandRegistry, logger);
  });

  test('routes commit intent', async () => {
    // Mock intent classification response
    mockAI.setResponse(
      /classify/i,
      JSON.stringify([{
        intent: 'COMMIT',
        confidence: 0.95,
        extractedParams: {},
        missingParams: []
      }])
    );

    const result = await router.route('commit my changes', context);

    expect(result.success).toBe(true);
    expect(result.commands).toHaveLength(1);
    expect(result.commands![0].command.name).toBe('commit');
  });

  test('handles unknown intent', async () => {
    mockAI.setResponse(/classify/i, JSON.stringify([]));

    const result = await router.route('do something weird', context);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not understand intent');
  });
});
```

### Advanced Mock Patterns

```typescript
/**
 * Mock provider with simulated latency
 */
export class RealisticMockProvider extends MockAIProvider {
  constructor(private latencyMs: number = 100) {
    super();
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, this.latencyMs));

    return super.complete(request);
  }
}

/**
 * Mock provider with failure simulation
 */
export class FlakeyMockProvider extends MockAIProvider {
  constructor(private failureRate: number = 0.1) {
    super();
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Randomly fail
    if (Math.random() < this.failureRate) {
      throw new Error('Simulated API failure');
    }

    return super.complete(request);
  }
}

/**
 * Mock provider with quota simulation
 */
export class QuotaMockProvider extends MockAIProvider {
  private requestsRemaining: number;

  constructor(private quota: number) {
    super();
    this.requestsRemaining = quota;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    if (this.requestsRemaining <= 0) {
      throw new Error('Rate limit exceeded');
    }

    this.requestsRemaining--;

    return super.complete(request);
  }

  resetQuota(): void {
    this.requestsRemaining = this.quota;
  }
}
```

### Testing with Advanced Mocks

```typescript
describe('ProviderRouter with failures', () => {
  test('falls back on provider failure', async () => {
    const primary = new FlakeyMockProvider(1.0); // Always fails
    const fallback = new MockAIProvider();

    primary.setDefaultResponse('Response from primary');
    fallback.setDefaultResponse('Response from fallback');

    const router = new ProviderRouter({
      providers: [primary, fallback],
      strategy: RoutingStrategy.FALLBACK
    });

    const response = await router.complete(request);

    expect(response.content).toBe('Response from fallback');
    expect(response.metadata.provider).toBe('mock');
  });
});

describe('RateLimiter', () => {
  test('blocks when quota exceeded', async () => {
    const provider = new QuotaMockProvider(5);
    provider.setDefaultResponse('Response');

    // Make 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      await provider.complete(request);
    }

    // 6th request should fail
    await expect(provider.complete(request)).rejects.toThrow('Rate limit exceeded');
  });
});
```

---

## 10.4 Integration Testing

Integration tests verify that components work together correctly, still using mocked AI but testing real integration.

### Testing Tool Orchestration

```typescript
describe('ToolOrchestrator Integration', () => {
  let mockAI: MockAIProvider;
  let orchestrator: ToolOrchestrator;
  let fileSystem: InMemoryFileSystem; // Test file system

  beforeEach(() => {
    mockAI = new MockAIProvider();
    fileSystem = new InMemoryFileSystem();
    orchestrator = new ToolOrchestrator(mockAI, {
      fileSystem,
      logger
    });

    // Register tools
    orchestrator.registerTool(new ReadFileTool(fileSystem));
    orchestrator.registerTool(new WriteFileTool(fileSystem));
    orchestrator.registerTool(new SearchTool(fileSystem));
  });

  test('executes tools in dependency order', async () => {
    // Setup test files
    fileSystem.writeFile('/project/src/index.ts', 'export const foo = 1;');

    // Mock AI to request tool calls
    mockAI.setDefaultResponse(JSON.stringify({
      toolCalls: [
        {
          tool: 'read_file',
          parameters: { path: '/project/src/index.ts' }
        },
        {
          tool: 'search_code',
          parameters: { pattern: 'foo', path: '/project/src' },
          dependencies: ['read_file'] // Depends on read_file
        }
      ]
    }));

    const result = await orchestrator.execute('Read and search code');

    expect(result.success).toBe(true);
    expect(result.toolResults).toHaveLength(2);

    // Verify execution order
    expect(result.toolResults[0].tool).toBe('read_file');
    expect(result.toolResults[1].tool).toBe('search_code');
  });

  test('handles tool errors gracefully', async () => {
    mockAI.setDefaultResponse(JSON.stringify({
      toolCalls: [
        {
          tool: 'read_file',
          parameters: { path: '/nonexistent.ts' }
        }
      ]
    }));

    const result = await orchestrator.execute('Read nonexistent file');

    expect(result.success).toBe(false);
    expect(result.error).toContain('File not found');
  });

  test('uses result caching', async () => {
    fileSystem.writeFile('/project/test.ts', 'test content');

    mockAI.setDefaultResponse(JSON.stringify({
      toolCalls: [
        {
          tool: 'read_file',
          parameters: { path: '/project/test.ts' }
        }
      ]
    }));

    // First execution
    const result1 = await orchestrator.execute('Read file');
    expect(result1.fromCache).toBe(false);

    // Second execution (should use cache)
    const result2 = await orchestrator.execute('Read file');
    expect(result2.fromCache).toBe(true);
    expect(result2.toolResults[0].result).toBe(result1.toolResults[0].result);
  });
});
```

### Testing Conversation Flow

```typescript
describe('ConversationManager Integration', () => {
  let mockAI: MockAIProvider;
  let conversationManager: ConversationManager;

  beforeEach(() => {
    mockAI = new MockAIProvider();
    conversationManager = new ConversationManager(mockAI, {
      maxTokens: 1000,
      strategy: ContextWindowStrategy.RECENT
    });
  });

  test('maintains conversation context', async () => {
    // User asks question
    mockAI.setResponse(
      /What.*JavaScript/i,
      'JavaScript is a programming language for the web.'
    );

    const response1 = await conversationManager.sendMessage(
      'What is JavaScript?'
    );

    expect(response1).toContain('programming language');

    // Follow-up question (requires context)
    mockAI.setResponse(
      /invented/i,
      'It was created by Brendan Eich in 1995.'
    );

    const response2 = await conversationManager.sendMessage(
      'Who invented it?'
    );

    expect(response2).toContain('Brendan Eich');

    // Verify conversation history was sent
    const calls = mockAI.getCalls();
    expect(calls[1].messages).toContainEqual(
      expect.objectContaining({ content: 'What is JavaScript?' })
    );
  });

  test('respects token limits', async () => {
    conversationManager = new ConversationManager(mockAI, {
      maxTokens: 100, // Very small limit
      strategy: ContextWindowStrategy.RECENT
    });

    // Add many messages
    for (let i = 0; i < 10; i++) {
      mockAI.setDefaultResponse('Response');
      await conversationManager.sendMessage(`Message ${i}`);
    }

    // Get messages for AI
    const messages = conversationManager.getMessagesForAI();

    // Should only include recent messages that fit
    const totalTokens = messages.reduce((sum, msg) => sum + msg.tokens, 0);
    expect(totalTokens).toBeLessThanOrEqual(100);
  });
});
```

### Testing VCS Intelligence

```typescript
describe('CommitWorkflow Integration', () => {
  let mockAI: MockAIProvider;
  let mockGit: MockGitService;
  let workflow: CommitWorkflow;

  beforeEach(() => {
    mockAI = new MockAIProvider();
    mockGit = new MockGitService();
    workflow = new CommitWorkflow(mockAI, mockGit);
  });

  test('complete commit workflow', async () => {
    // Setup git state
    mockGit.setStatus({
      branch: 'feature/auth',
      files: [
        { path: 'src/auth/login.ts', status: 'modified', staged: false },
        { path: 'src/auth/token.ts', status: 'modified', staged: false }
      ]
    });

    mockGit.setDiff({
      files: [
        { path: 'src/auth/login.ts', additions: 10, deletions: 2, changes: 12 },
        { path: 'src/auth/token.ts', additions: 5, deletions: 1, changes: 6 }
      ],
      additions: 15,
      deletions: 3
    });

    // Mock AI to generate commit message
    mockAI.setDefaultResponse(
      'feat(auth): implement token-based authentication\n\n' +
      'Add JWT token generation and validation'
    );

    // Execute workflow
    const result = await workflow.execute({
      scope: 'auth',
      autoStage: true
    });

    expect(result.success).toBe(true);
    expect(result.commitHash).toBeDefined();

    // Verify git operations
    expect(mockGit.wasCalledWith('add', ['src/auth/login.ts', 'src/auth/token.ts'])).toBe(true);
    expect(mockGit.wasCalledWith('commit')).toBe(true);
  });
});
```

---

## 10.5 Synthetic Test Generation

Generate test cases automatically to improve coverage and find edge cases.

### Synthetic Test Generator

```typescript
/**
 * Generates synthetic test cases for AI systems
 */
export class SyntheticTestGenerator {
  constructor(private aiProvider: AIProvider) {}

  /**
   * Generate test cases for a function
   */
  async generateTests(
    functionCode: string,
    options: GenerateTestsOptions = {}
  ): Promise<GeneratedTest[]> {
    const prompt = this.buildGenerationPrompt(functionCode, options);

    const response = await this.aiProvider.complete({
      messages: [
        {
          role: MessageRole.SYSTEM,
          content: 'You generate comprehensive test cases for code.'
        },
        {
          role: MessageRole.USER,
          content: prompt
        }
      ],
      temperature: 0.7 // Higher temperature for diverse tests
    });

    return this.parseGeneratedTests(response.content);
  }

  /**
   * Build prompt for test generation
   */
  private buildGenerationPrompt(
    functionCode: string,
    options: GenerateTestsOptions
  ): string {
    return `
Generate comprehensive test cases for the following function:

\`\`\`typescript
${functionCode}
\`\`\`

Requirements:
- Test happy path scenarios
- Test edge cases (empty input, null, undefined, boundary values)
- Test error cases
- Test integration scenarios${options.includePerformance ? '\n- Test performance characteristics' : ''}

Generate ${options.count || 10} test cases covering different scenarios.

Output format (JSON):
\`\`\`json
[
  {
    "description": "Test description",
    "input": {...},
    "expectedOutput": {...},
    "expectedError": null | "error message",
    "category": "happy_path" | "edge_case" | "error_case" | "integration"
  }
]
\`\`\`
    `.trim();
  }

  /**
   * Parse generated test cases
   */
  private parseGeneratedTests(response: string): GeneratedTest[] {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const json = jsonMatch ? jsonMatch[1] : response;

    return JSON.parse(json);
  }

  /**
   * Generate edge cases for input type
   */
  async generateEdgeCases(inputType: string): Promise<any[]> {
    const edgeCases: Record<string, any[]> = {
      string: ['', ' ', '\n', 'a'.repeat(10000), '🚀', 'null', 'undefined'],
      number: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, NaN, Infinity, -Infinity],
      boolean: [true, false],
      array: [[], [1], Array(1000).fill(0)],
      object: [{}, { key: 'value' }, null]
    };

    return edgeCases[inputType] || [];
  }
}

export interface GenerateTestsOptions {
  count?: number;
  includePerformance?: boolean;
  includeIntegration?: boolean;
}

export interface GeneratedTest {
  description: string;
  input: any;
  expectedOutput?: any;
  expectedError?: string;
  category: 'happy_path' | 'edge_case' | 'error_case' | 'integration';
}
```

### Using Synthetic Tests

```typescript
describe('Synthetic Tests', () => {
  let generator: SyntheticTestGenerator;

  beforeAll(async () => {
    // Use real AI for generation (run once, cache results)
    const ai = new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! });
    generator = new SyntheticTestGenerator(ai);
  });

  test('run generated tests for TokenCounter', async () => {
    const functionCode = `
    export class TokenCounter {
      count(text: string): number {
        return text.split(/\\s+/).filter(word => word.length > 0).length;
      }
    }
    `;

    // Generate tests (do this once, save results)
    const generatedTests = await generator.generateTests(functionCode, {
      count: 20
    });

    // Save to file for later use
    fs.writeFileSync(
      './tests/generated/token-counter.json',
      JSON.stringify(generatedTests, null, 2)
    );

    // Run generated tests
    const counter = new TokenCounter();

    for (const test of generatedTests) {
      if (test.expectedError) {
        expect(() => counter.count(test.input.text)).toThrow(test.expectedError);
      } else {
        const result = counter.count(test.input.text);
        expect(result).toBe(test.expectedOutput);
      }
    }
  });
});
```

### Property-Based Testing

```typescript
import { fc, test as fcTest } from 'fast-check';

describe('Property-Based Tests', () => {
  fcTest.prop([fc.string()])('TokenCounter count is non-negative', (text) => {
    const counter = new TokenCounter();
    const count = counter.count(text);

    expect(count).toBeGreaterThanOrEqual(0);
  });

  fcTest.prop([fc.array(fc.string())])('Joining and counting matches array length', (words) => {
    const counter = new TokenCounter();
    const text = words.join(' ');
    const count = counter.count(text);

    // Count should match number of non-empty words
    const nonEmptyWords = words.filter(w => w.trim().length > 0);
    expect(count).toBe(nonEmptyWords.length);
  });

  fcTest.prop([fc.string(), fc.string()])('Count is additive', (text1, text2) => {
    const counter = new TokenCounter();

    const count1 = counter.count(text1);
    const count2 = counter.count(text2);
    const combinedCount = counter.count(text1 + ' ' + text2);

    // Combined count should equal sum (plus separator handling)
    expect(combinedCount).toBeGreaterThanOrEqual(count1 + count2);
  });
});
```

---

## 10.6 Performance Testing

Test performance characteristics and ensure they meet requirements.

### Performance Test Framework

```typescript
/**
 * Performance test utilities
 */
export class PerformanceTest {
  /**
   * Measure execution time
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();

    const result = await fn();

    const duration = performance.now() - start;

    console.log(`${name}: ${duration.toFixed(2)}ms`);

    return { result, duration };
  }

  /**
   * Run benchmark with multiple iterations
   */
  static async benchmark(
    name: string,
    fn: () => Promise<void>,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      durations.push(performance.now() - start);
    }

    const sorted = durations.sort((a, b) => a - b);

    const result = {
      name,
      iterations,
      mean: durations.reduce((a, b) => a + b) / iterations,
      median: sorted[Math.floor(iterations / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(iterations * 0.95)],
      p99: sorted[Math.floor(iterations * 0.99)]
    };

    console.table(result);

    return result;
  }

  /**
   * Assert performance requirement
   */
  static assertPerformance(
    duration: number,
    maxMs: number,
    operation: string
  ): void {
    if (duration > maxMs) {
      throw new Error(
        `Performance requirement failed: ${operation} took ${duration.toFixed(2)}ms (max: ${maxMs}ms)`
      );
    }
  }
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}
```

### Performance Tests

```typescript
describe('Performance Tests', () => {
  test('ConversationManager.getMessagesForAI completes within 50ms', async () => {
    const manager = new ConversationManager(mockAI, {
      maxTokens: 10000,
      strategy: ContextWindowStrategy.RECENT
    });

    // Add 100 messages
    for (let i = 0; i < 100; i++) {
      manager.addMessage({
        role: i % 2 === 0 ? MessageRole.USER : MessageRole.ASSISTANT,
        content: `Message ${i}`,
        tokens: 10
      });
    }

    const { duration } = await PerformanceTest.measure(
      'getMessagesForAI',
      async () => manager.getMessagesForAI()
    );

    PerformanceTest.assertPerformance(duration, 50, 'getMessagesForAI');
  });

  test('DependencyGraph.topologicalSort scales linearly', async () => {
    const sizes = [10, 100, 1000];
    const results: BenchmarkResult[] = [];

    for (const size of sizes) {
      const graph = new DependencyGraph();

      // Create chain: 0 -> 1 -> 2 -> ... -> size
      for (let i = 0; i < size; i++) {
        graph.addNode(`node_${i}`);
        if (i > 0) {
          graph.addEdge(`node_${i}`, `node_${i - 1}`);
        }
      }

      const result = await PerformanceTest.benchmark(
        `topologicalSort (n=${size})`,
        async () => { graph.topologicalSort(); },
        100
      );

      results.push(result);
    }

    // Verify linear scaling (mean should scale linearly with size)
    const ratio1 = results[1].mean / results[0].mean;
    const ratio2 = results[2].mean / results[1].mean;

    // Ratios should be approximately equal for linear scaling
    expect(Math.abs(ratio1 - ratio2)).toBeLessThan(5);
  });

  test('Cache hit vs miss performance', async () => {
    const cache = new ResultCache({ maxSize: 1000, ttl: 60000 });

    const value = { data: 'test'.repeat(100) };

    // Benchmark cache miss
    const miss = await PerformanceTest.benchmark(
      'cache miss',
      async () => {
        cache.get('nonexistent');
      },
      10000
    );

    // Benchmark cache hit
    cache.set('key', value);

    const hit = await PerformanceTest.benchmark(
      'cache hit',
      async () => {
        cache.get('key');
      },
      10000
    );

    // Cache hit should be faster
    expect(hit.mean).toBeLessThan(miss.mean);

    // Both should be very fast (<1ms)
    expect(hit.mean).toBeLessThan(1);
    expect(miss.mean).toBeLessThan(1);
  });
});
```

### Load Testing

```typescript
describe('Load Tests', () => {
  test('handles concurrent requests', async () => {
    const mockAI = new MockAIProvider();
    mockAI.setDefaultResponse('Response');

    const manager = new ConversationManager(mockAI);

    // Send 100 concurrent requests
    const promises = Array.from({ length: 100 }, (_, i) =>
      manager.sendMessage(`Message ${i}`)
    );

    const start = performance.now();
    await Promise.all(promises);
    const duration = performance.now() - start;

    console.log(`100 concurrent requests: ${duration.toFixed(2)}ms`);

    // Should handle all requests
    expect(mockAI.getCallCount()).toBe(100);

    // Should complete reasonably fast
    PerformanceTest.assertPerformance(duration, 5000, '100 concurrent requests');
  });

  test('memory usage remains stable under load', async () => {
    const manager = new ConversationManager(mockAI);

    const initialMemory = process.memoryUsage().heapUsed;

    // Add 10,000 messages
    for (let i = 0; i < 10000; i++) {
      manager.addMessage({
        role: i % 2 === 0 ? MessageRole.USER : MessageRole.ASSISTANT,
        content: `Message ${i}`,
        tokens: 10
      });
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

    console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);

    // Memory increase should be reasonable
    expect(memoryIncreaseMB).toBeLessThan(100);
  });
});
```

---

## 10.7 Quality-Based Assertions

Since AI outputs are non-deterministic, use quality-based assertions instead of exact matching.

### Quality Assertion Library

```typescript
/**
 * Quality-based assertions for AI outputs
 */
export class AIAssertions {
  /**
   * Assert response contains code
   */
  static containsCode(response: string): void {
    const codeBlockPattern = /```[\s\S]*?```/;

    if (!codeBlockPattern.test(response)) {
      throw new Error('Response does not contain code block');
    }
  }

  /**
   * Assert code is valid TypeScript
   */
  static async isValidTypeScript(code: string): Promise<void> {
    const ts = await import('typescript');

    const result = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext
      }
    });

    if (result.diagnostics && result.diagnostics.length > 0) {
      const errors = result.diagnostics.map(d => d.messageText).join('\n');
      throw new Error(`TypeScript compilation errors:\n${errors}`);
    }
  }

  /**
   * Assert code passes linting
   */
  static async passesLint(code: string): Promise<void> {
    const { ESLint } = await import('eslint');

    const eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module'
        }
      }
    });

    const results = await eslint.lintText(code);

    const errors = results[0].messages.filter(m => m.severity === 2);

    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join('\n');
      throw new Error(`Linting errors:\n${errorMessages}`);
    }
  }

  /**
   * Assert code implements specific functionality
   */
  static implementsFunction(code: string, functionName: string): void {
    const functionPattern = new RegExp(
      `(function\\s+${functionName}|const\\s+${functionName}\\s*=|${functionName}\\s*:\\s*function)`
    );

    if (!functionPattern.test(code)) {
      throw new Error(`Code does not implement function: ${functionName}`);
    }
  }

  /**
   * Assert response has minimum quality score
   */
  static async hasMinimumQuality(
    response: string,
    minScore: number,
    criteria: QualityCriteria
  ): Promise<void> {
    const score = await this.calculateQualityScore(response, criteria);

    if (score < minScore) {
      throw new Error(
        `Quality score ${score.toFixed(2)} below minimum ${minScore}`
      );
    }
  }

  /**
   * Calculate quality score based on criteria
   */
  private static async calculateQualityScore(
    response: string,
    criteria: QualityCriteria
  ): Promise<number> {
    let score = 0;
    let totalWeight = 0;

    if (criteria.hasCode) {
      totalWeight += criteria.hasCode;
      if (/```[\s\S]*?```/.test(response)) {
        score += criteria.hasCode;
      }
    }

    if (criteria.hasExplanation) {
      totalWeight += criteria.hasExplanation;
      // Check for explanation text (not in code blocks)
      const textOutsideCode = response.replace(/```[\s\S]*?```/g, '');
      if (textOutsideCode.trim().length > 50) {
        score += criteria.hasExplanation;
      }
    }

    if (criteria.isValid) {
      totalWeight += criteria.isValid;
      const codeMatch = response.match(/```(?:typescript|javascript)?\n([\s\S]*?)```/);
      if (codeMatch) {
        try {
          await this.isValidTypeScript(codeMatch[1]);
          score += criteria.isValid;
        } catch (error) {
          // Not valid
        }
      }
    }

    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }

  /**
   * Assert semantic similarity to expected output
   */
  static async semanticallySimilar(
    actual: string,
    expected: string,
    minSimilarity: number = 0.7
  ): Promise<void> {
    // Use Levenshtein distance for simple similarity
    const similarity = this.calculateSimilarity(actual, expected);

    if (similarity < minSimilarity) {
      throw new Error(
        `Semantic similarity ${similarity.toFixed(2)} below minimum ${minSimilarity}`
      );
    }
  }

  /**
   * Calculate similarity using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);

    return 1 - (distance / maxLen);
  }
}

export interface QualityCriteria {
  hasCode?: number;        // Weight for containing code
  hasExplanation?: number; // Weight for containing explanation
  isValid?: number;        // Weight for valid syntax
  passesLint?: number;     // Weight for passing linting
}
```

### Using Quality Assertions

```typescript
describe('Code Generation Quality', () => {
  let ai: AIProvider;

  beforeAll(() => {
    ai = new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! });
  });

  test('generates valid code with explanation', async () => {
    const response = await ai.complete({
      messages: [{
        role: MessageRole.USER,
        content: 'Write a TypeScript function to calculate fibonacci numbers'
      }]
    });

    // Quality-based assertions
    AIAssertions.containsCode(response.content);

    const codeMatch = response.content.match(/```typescript\n([\s\S]*?)```/);
    expect(codeMatch).not.toBeNull();

    const code = codeMatch![1];

    // Assert valid TypeScript
    await AIAssertions.isValidTypeScript(code);

    // Assert implements fibonacci
    AIAssertions.implementsFunction(code, 'fibonacci');

    // Assert passes linting
    await AIAssertions.passesLint(code);

    // Assert minimum quality
    await AIAssertions.hasMinimumQuality(response.content, 80, {
      hasCode: 30,
      hasExplanation: 30,
      isValid: 40
    });
  });

  test('generates semantically similar responses', async () => {
    const response1 = await ai.complete({
      messages: [{
        role: MessageRole.USER,
        content: 'Explain dependency injection'
      }],
      temperature: 0.7
    });

    const response2 = await ai.complete({
      messages: [{
        role: MessageRole.USER,
        content: 'Explain dependency injection'
      }],
      temperature: 0.7
    });

    // Responses should be semantically similar even if not identical
    await AIAssertions.semanticallySimilar(
      response1.content,
      response2.content,
      0.6 // 60% similarity threshold
    );
  });
});
```

---

## 10.8 Regression Detection

Detect when changes degrade AI output quality.

### Regression Test Suite

```typescript
/**
 * Regression testing for AI outputs
 */
export class RegressionTestSuite {
  private baseline: Map<string, BaselineResponse> = new Map();

  constructor(private baselinePath: string) {}

  /**
   * Load baseline responses
   */
  async loadBaseline(): Promise<void> {
    const data = await fs.readFile(this.baselinePath, 'utf-8');
    const baseline = JSON.parse(data);

    for (const [key, value] of Object.entries(baseline)) {
      this.baseline.set(key, value as BaselineResponse);
    }
  }

  /**
   * Save baseline responses
   */
  async saveBaseline(): Promise<void> {
    const baseline = Object.fromEntries(this.baseline);
    await fs.writeFile(
      this.baselinePath,
      JSON.stringify(baseline, null, 2)
    );
  }

  /**
   * Test against baseline
   */
  async testAgainstBaseline(
    key: string,
    currentResponse: string,
    qualityCriteria: QualityCriteria
  ): Promise<RegressionResult> {
    const baseline = this.baseline.get(key);

    if (!baseline) {
      // No baseline - create one
      this.baseline.set(key, {
        response: currentResponse,
        qualityScore: await AIAssertions['calculateQualityScore'](
          currentResponse,
          qualityCriteria
        ),
        timestamp: new Date().toISOString()
      });

      return {
        status: 'new',
        message: 'New baseline created'
      };
    }

    // Calculate current quality score
    const currentScore = await AIAssertions['calculateQualityScore'](
      currentResponse,
      qualityCriteria
    );

    // Compare with baseline
    const scoreDiff = currentScore - baseline.qualityScore;

    if (scoreDiff < -10) {
      // Significant regression
      return {
        status: 'regression',
        message: `Quality dropped by ${Math.abs(scoreDiff).toFixed(2)} points`,
        baselineScore: baseline.qualityScore,
        currentScore,
        diff: scoreDiff
      };
    } else if (scoreDiff > 10) {
      // Significant improvement - update baseline
      this.baseline.set(key, {
        response: currentResponse,
        qualityScore: currentScore,
        timestamp: new Date().toISOString()
      });

      return {
        status: 'improvement',
        message: `Quality improved by ${scoreDiff.toFixed(2)} points`,
        baselineScore: baseline.qualityScore,
        currentScore,
        diff: scoreDiff
      };
    } else {
      // No significant change
      return {
        status: 'passed',
        message: 'Quality within acceptable range',
        baselineScore: baseline.qualityScore,
        currentScore,
        diff: scoreDiff
      };
    }
  }
}

interface BaselineResponse {
  response: string;
  qualityScore: number;
  timestamp: string;
}

interface RegressionResult {
  status: 'new' | 'passed' | 'regression' | 'improvement';
  message: string;
  baselineScore?: number;
  currentScore?: number;
  diff?: number;
}
```

### Regression Tests

```typescript
describe('Regression Tests', () => {
  let ai: AIProvider;
  let regressionSuite: RegressionTestSuite;

  beforeAll(async () => {
    ai = new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! });
    regressionSuite = new RegressionTestSuite('./tests/baseline.json');
    await regressionSuite.loadBaseline();
  });

  afterAll(async () => {
    await regressionSuite.saveBaseline();
  });

  test('code generation quality', async () => {
    const response = await ai.complete({
      messages: [{
        role: MessageRole.USER,
        content: 'Write a TypeScript function to reverse a string'
      }]
    });

    const result = await regressionSuite.testAgainstBaseline(
      'reverse_string',
      response.content,
      {
        hasCode: 30,
        hasExplanation: 20,
        isValid: 50
      }
    );

    if (result.status === 'regression') {
      throw new Error(result.message);
    }

    expect(result.status).not.toBe('regression');
  });

  test('commit message quality', async () => {
    const generator = new CommitMessageGenerator(ai);

    const diff: GitDiff = {
      files: [
        { path: 'src/auth/login.ts', additions: 15, deletions: 3, changes: 18 }
      ],
      additions: 15,
      deletions: 3
    };

    const message = await generator.generate(diff, { scope: 'auth' });

    const result = await regressionSuite.testAgainstBaseline(
      'commit_message_auth',
      message.message,
      {
        hasExplanation: 100 // Commit messages should be explanatory
      }
    );

    expect(result.status).not.toBe('regression');
  });
});
```

---

## Exercises

### Exercise 1: Build a Test Factory

**Goal:** Create a factory that generates test data for different scenarios.

**Requirements:**
1. Generate realistic conversation histories
2. Generate git diffs with various patterns
3. Generate file structures
4. Support different complexity levels

**Starter Code:**

```typescript
export class TestDataFactory {
  generateConversation(length: number): Message[] {
    // TODO: Generate realistic conversation
  }

  generateGitDiff(fileCount: number, complexity: 'simple' | 'complex'): GitDiff {
    // TODO: Generate git diff
  }

  generateFileStructure(depth: number, filesPerDir: number): FileTree {
    // TODO: Generate file tree
  }
}
```

### Exercise 2: Implement Snapshot Testing

**Goal:** Add snapshot testing for AI outputs to detect unexpected changes.

**Requirements:**
1. Capture AI response snapshots
2. Compare new responses with snapshots
3. Support updating snapshots
4. Show clear diffs

**Hints:**
- Use JSON serialization for snapshots
- Store snapshots in `__snapshots__` directory
- Implement `toMatchSnapshot()` matcher

### Exercise 3: Build a CI/CD Pipeline

**Goal:** Create a GitHub Actions workflow that runs all tests.

**Requirements:**
1. Run unit tests (fast, no AI)
2. Run integration tests with mocks
3. Run regression tests (nightly, with real AI)
4. Publish coverage reports
5. Fail on regression

---

## Summary

In this chapter, you built comprehensive testing strategies for AI systems.

### Key Concepts

1. **Quality-Based Assertions** - Test properties, not exact outputs
2. **Mock AI Providers** - Fast, deterministic unit tests
3. **Integration Testing** - Test components working together
4. **Synthetic Test Generation** - AI-generated test cases
5. **Performance Testing** - Ensure speed and scalability
6. **Regression Detection** - Prevent quality degradation

### Testing Strategy Summary

```
Unit Tests (Fast, Many)
├─ Pure functions
├─ Validation logic
├─ Data transformations
└─ No AI dependencies

Integration Tests (Medium Speed, Some)
├─ Mock AI providers
├─ Component integration
├─ Tool orchestration
└─ Conversation flow

E2E Tests (Slow, Few)
├─ Real AI providers
├─ Full workflows
├─ Regression detection
└─ Quality validation
```

### Real-World Impact

**Before Testing:**
- Manual verification only
- Regressions slip into production
- Slow development (fear of breaking things)
- No confidence in refactoring

**After Testing:**
- 80% code coverage
- Automated regression detection
- Fast CI/CD (< 5 minutes)
- Confident refactoring

### Next Steps

In **[Chapter 11: Performance Optimization →](chapter-11-performance.md)**, you'll learn how to make your AI assistant blazing fast with intelligent caching, parallel execution, and optimization techniques.

---

*Chapter 10 | Testing AI Systems | Complete*
