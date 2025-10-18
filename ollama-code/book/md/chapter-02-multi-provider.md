# Chapter 2: Multi-Provider AI Integration

> *"Don't put all your eggs in one basket." — Proverb*

---

## Introduction

In Chapter 1, we established the foundation of AI coding assistants. Now we tackle one of the most critical architectural decisions: **how to integrate with multiple AI providers**.

Relying on a single AI provider creates significant risks: vendor lock-in, cost unpredictability, service outages, and limited access to best-in-class capabilities. The solution is a multi-provider architecture that abstracts away provider-specific details while enabling intelligent routing, cost optimization, and graceful fallback.

This chapter explores **ollama-code**'s multi-provider system through real code examples, demonstrating how to build a flexible, production-ready AI integration layer.

### What You'll Learn

- Why multi-provider support is essential for production systems
- How to design provider abstractions that work across different APIs
- Implementing concrete providers (Ollama, OpenAI, Anthropic, Google)
- Building intelligent routing strategies for cost, quality, and performance
- Response fusion for critical decisions requiring consensus
- Security best practices for credential management
- Cost tracking and budget enforcement

### Prerequisites

- Completed Chapter 1
- Understanding of async/await and Promises
- Familiarity with TypeScript interfaces and classes
- Basic knowledge of HTTP APIs

---

## 2.1 Why Multi-Provider Support?

### The Single Provider Problem

Consider a typical single-provider integration:

```typescript
// ❌ Locked into a single provider
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCode(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  return completion.choices[0].message.content;
}
```

**Problems with this approach:**

1. **Vendor Lock-in**: Switching providers requires rewriting all code
2. **Cost Unpredictability**: No ability to optimize for cost
3. **Single Point of Failure**: Service outage = complete downtime
4. **Limited Capabilities**: Can't use best model for each task
5. **No Fallback**: If API fails, the entire system fails
6. **Budget Risk**: No control over spending

### The Multi-Provider Solution

```typescript
// ✅ Provider abstraction with intelligent routing
export async function generateCode(prompt: string): Promise<string> {
  // Intelligent router selects best provider
  const provider = await router.selectProvider({
    task: 'code_generation',
    constraints: {
      maxCost: 0.01,        // Budget constraint
      maxLatency: 5000,     // Performance constraint
      minQuality: 0.8       // Quality threshold
    }
  });

  const response = await provider.complete(prompt);
  return response.content;
}
```

**Benefits:**

1. ✅ **Flexibility**: Switch providers without code changes
2. ✅ **Cost Optimization**: Use cheaper models when appropriate
3. ✅ **Reliability**: Automatic fallback on failures
4. ✅ **Best-of-Breed**: Use optimal model for each task
5. ✅ **Risk Management**: Distributed across multiple vendors
6. ✅ **Budget Control**: Enforce spending limits per provider

### Real-World Scenarios

#### Scenario 1: Cost Optimization

```typescript
// Different tasks have different quality requirements
const scenarios = [
  {
    task: 'Generate commit message',
    requirements: { quality: 0.6, maxCost: 0.001 },
    optimalProvider: 'ollama-qwen2.5-coder'  // Local, free
  },
  {
    task: 'Refactor complex algorithm',
    requirements: { quality: 0.9, maxCost: 0.05 },
    optimalProvider: 'anthropic-claude-3.5'  // Best quality
  },
  {
    task: 'Explain simple code',
    requirements: { quality: 0.7, maxCost: 0.005 },
    optimalProvider: 'openai-gpt-3.5-turbo'  // Good balance
  }
];

// Router automatically selects based on requirements
for (const scenario of scenarios) {
  const provider = await router.selectProvider(scenario.requirements);
  console.log(`${scenario.task} → ${provider.getName()}`);
}
```

**Cost Savings:**

| Task | Single Provider (GPT-4) | Multi-Provider | Savings |
|------|------------------------|----------------|---------|
| Commit messages (100/day) | $3.00 | $0.00 (Ollama) | 100% |
| Code explanations (50/day) | $1.50 | $0.25 (GPT-3.5) | 83% |
| Complex refactoring (10/day) | $0.60 | $0.50 (Claude) | 17% |
| **Monthly Total** | **$153** | **$22.50** | **85%** |

#### Scenario 2: Reliability and Fallback

```typescript
// Primary provider fails, automatic fallback
const fallbackChain = [
  { provider: 'anthropic-claude-3.5', priority: 1 },
  { provider: 'openai-gpt-4', priority: 2 },
  { provider: 'ollama-qwen2.5-coder', priority: 3 }
];

async function reliableComplete(prompt: string): Promise<string> {
  for (const { provider } of fallbackChain) {
    try {
      const result = await providers.get(provider).complete(prompt);
      logger.info(`Success with ${provider}`);
      return result.content;
    } catch (error) {
      logger.warn(`${provider} failed, trying next...`);
      // Automatic fallback to next provider
    }
  }

  throw new Error('All providers failed');
}
```

**Uptime Improvement:**

- Single Provider: 99.9% uptime = 43 minutes downtime/month
- Multi-Provider (3 providers): 99.9999% uptime = 2.6 seconds downtime/month
- **Improvement: 1000x reduction in downtime**

#### Scenario 3: Task-Specific Optimization

```typescript
// Use the best model for each specific task
const taskProviderMap = {
  'code_generation': {
    provider: 'anthropic-claude-3.5',
    reason: 'Excellent at generating clean, idiomatic code'
  },
  'code_review': {
    provider: 'openai-gpt-4',
    reason: 'Strong analytical capabilities'
  },
  'documentation': {
    provider: 'google-gemini-pro',
    reason: 'Good at clear, concise writing'
  },
  'quick_questions': {
    provider: 'ollama-qwen2.5-coder',
    reason: 'Fast, local, free for simple queries'
  }
};

async function taskSpecificComplete(
  task: string,
  prompt: string
): Promise<string> {
  const config = taskProviderMap[task];
  const provider = providers.get(config.provider);

  logger.info(`Using ${config.provider}: ${config.reason}`);

  const response = await provider.complete(prompt);
  return response.content;
}
```

### Feature Availability Matrix

Different providers offer different capabilities:

| Feature | Ollama | OpenAI | Anthropic | Google |
|---------|--------|--------|-----------|--------|
| Local execution | ✅ | ❌ | ❌ | ❌ |
| Tool calling | ✅ | ✅ | ✅ | ✅ |
| Vision/Multi-modal | ⚠️ | ✅ | ✅ | ✅ |
| Large context (200K+) | ❌ | ⚠️ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ | ✅ |
| JSON mode | ✅ | ✅ | ⚠️ | ✅ |
| Cost | Free | $$$ | $$$$ | $$ |
| Privacy | 🔒 | ⚠️ | ⚠️ | ⚠️ |

**Multi-provider architecture lets you use the right tool for each job.**

---

## 2.2 Provider Abstraction Pattern

To support multiple providers, we need a clean abstraction that:
1. Defines a common interface all providers must implement
2. Handles provider-specific quirks internally
3. Provides shared functionality (health checks, metrics)
4. Remains extensible for new providers

### Base Provider Interface

```typescript
// src/ai/providers/base-provider.ts
import { EventEmitter } from 'events';

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  customHeaders?: Record<string, string>;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  consecutiveFailures: number;
  responseTime: number;
  errorRate: number;
  message?: string;
}

export interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  lastRequestTime?: Date;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  metadata?: Record<string, any>;
}

export type StreamCallback = (event: AIStreamEvent) => void;

export interface AIStreamEvent {
  type: 'content' | 'tool_call' | 'done' | 'error';
  content?: string;
  toolCall?: ToolCall;
  error?: Error;
  metadata?: Record<string, any>;
}

/**
 * Abstract base class for AI providers
 *
 * All providers must extend this class and implement the abstract methods.
 * Provides common functionality like health checks and metrics tracking.
 */
export abstract class BaseAIProvider extends EventEmitter {
  protected config: ProviderConfig;
  protected health: ProviderHealth;
  protected metrics: ProviderMetrics;

  constructor(config: ProviderConfig) {
    super();
    this.config = config;

    // Initialize health status
    this.health = {
      status: 'healthy',
      lastCheck: new Date(),
      consecutiveFailures: 0,
      responseTime: 0,
      errorRate: 0
    };

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0
    };
  }

  // ============================================================
  // Abstract Methods - Must be implemented by all providers
  // ============================================================

  /**
   * Get the provider's unique name
   */
  abstract getName(): string;

  /**
   * Initialize the provider (setup API clients, validate config, etc.)
   */
  abstract initialize(): Promise<void>;

  /**
   * Complete a prompt (non-streaming)
   */
  abstract complete(
    prompt: string,
    options?: CompletionOptions
  ): Promise<AICompletionResponse>;

  /**
   * Complete a prompt with streaming responses
   */
  abstract completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void>;

  /**
   * List available models for this provider
   */
  abstract listModels(): Promise<AIModel[]>;

  /**
   * Calculate cost for a request based on token usage
   */
  abstract calculateCost(
    promptTokens: number,
    completionTokens: number,
    model?: string
  ): number;

  /**
   * Test connection to the provider
   */
  abstract testConnection(): Promise<boolean>;

  // ============================================================
  // Shared Functionality - Available to all providers
  // ============================================================

  /**
   * Perform a health check on the provider
   */
  async performHealthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      const isHealthy = await this.testConnection();
      const responseTime = Date.now() - startTime;

      this.health = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        consecutiveFailures: isHealthy ? 0 : this.health.consecutiveFailures + 1,
        responseTime,
        errorRate: this.calculateErrorRate()
      };

      // Emit health status change
      this.emit('health_check', this.health);

      return this.health;
    } catch (error) {
      this.health = {
        status: 'unhealthy',
        lastCheck: new Date(),
        consecutiveFailures: this.health.consecutiveFailures + 1,
        responseTime: Date.now() - startTime,
        errorRate: this.calculateErrorRate(),
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      this.emit('health_check_failed', this.health);

      return this.health;
    }
  }

  /**
   * Get current health status
   */
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  /**
   * Get current metrics
   */
  getMetrics(): ProviderMetrics {
    return { ...this.metrics };
  }

  /**
   * Update metrics after a request
   */
  protected updateMetrics(
    success: boolean,
    responseTime: number,
    tokensUsed: number,
    cost: number
  ): void {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time (running average)
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
      this.metrics.totalRequests;

    this.metrics.totalTokensUsed += tokensUsed;
    this.metrics.totalCost += cost;
    this.metrics.lastRequestTime = new Date();

    // Emit metrics update
    this.emit('metrics_updated', this.metrics);
  }

  /**
   * Calculate current error rate
   */
  private calculateErrorRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.failedRequests / this.metrics.totalRequests;
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0
    };

    this.emit('metrics_reset');
  }

  /**
   * Get provider configuration (without sensitive data)
   */
  getConfig(): Omit<ProviderConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}
```

### Key Design Decisions

#### 1. **Extends EventEmitter**

```typescript
export abstract class BaseAIProvider extends EventEmitter {
  // ...
}

// Providers can emit events for monitoring
provider.on('health_check', (health) => {
  console.log(`Provider health: ${health.status}`);
});

provider.on('metrics_updated', (metrics) => {
  console.log(`Total requests: ${metrics.totalRequests}`);
});
```

**Why?** Events enable loose coupling between providers and monitoring systems.

#### 2. **Abstract Methods for Provider-Specific Logic**

```typescript
abstract complete(
  prompt: string,
  options?: CompletionOptions
): Promise<AICompletionResponse>;
```

**Why?** Each provider has different APIs, but the interface remains consistent.

#### 3. **Shared Functionality in Base Class**

```typescript
async performHealthCheck(): Promise<ProviderHealth> {
  // All providers get this for free
}
```

**Why?** Avoid duplicating health checks, metrics tracking across providers.

#### 4. **Protected Helper Methods**

```typescript
protected updateMetrics(
  success: boolean,
  responseTime: number,
  tokensUsed: number,
  cost: number
): void {
  // Providers call this after each request
}
```

**Why?** Enforces consistent metrics tracking across all providers.

---

## 2.3 Provider Implementations

Now let's see how real providers implement this abstraction.

### Case Study 1: Ollama Provider

Ollama is unique because it runs locally, requiring no API keys and offering complete privacy.

```typescript
// src/ai/providers/ollama-provider.ts
import { Ollama } from 'ollama';
import { BaseAIProvider, ProviderConfig, CompletionOptions, AICompletionResponse } from './base-provider';

export interface OllamaProviderConfig extends ProviderConfig {
  host: string;  // e.g., 'http://localhost:11434'
  defaultModel?: string;
}

export class OllamaProvider extends BaseAIProvider {
  private client: Ollama;
  private defaultModel: string;

  constructor(config: OllamaProviderConfig) {
    super(config);
    this.defaultModel = config.defaultModel || 'qwen2.5-coder:latest';
    this.client = new Ollama({ host: config.host });
  }

  getName(): string {
    return 'ollama';
  }

  async initialize(): Promise<void> {
    // Verify Ollama is running and accessible
    try {
      await this.client.list();
      logger.info('Ollama provider initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Ollama provider: ${error}`);
    }
  }

  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const model = options.model || this.defaultModel;

    try {
      const response = await this.client.chat({
        model,
        messages: [{ role: 'user', content: prompt }],
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
          top_p: options.topP,
          stop: options.stopSequences
        }
      });

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.eval_count || 0;
      const cost = this.calculateCost(0, tokensUsed, model);  // Ollama is free

      this.updateMetrics(true, responseTime, tokensUsed, cost);

      return {
        content: response.message.content,
        model: response.model,
        tokensUsed: {
          prompt: response.prompt_eval_count || 0,
          completion: response.eval_count || 0,
          total: (response.prompt_eval_count || 0) + (response.eval_count || 0)
        },
        finishReason: 'stop',
        metadata: {
          totalDuration: response.total_duration,
          loadDuration: response.load_duration
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime, 0, 0);
      throw error;
    }
  }

  async completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void> {
    const model = options.model || this.defaultModel;

    try {
      const stream = await this.client.chat({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
          top_p: options.topP,
          stop: options.stopSequences
        }
      });

      for await (const chunk of stream) {
        if (chunk.message.content) {
          onEvent({
            type: 'content',
            content: chunk.message.content
          });
        }

        if (chunk.done) {
          onEvent({
            type: 'done',
            metadata: {
              totalDuration: chunk.total_duration,
              evalCount: chunk.eval_count
            }
          });
        }
      }
    } catch (error) {
      onEvent({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  async listModels(): Promise<AIModel[]> {
    const response = await this.client.list();

    return response.models.map(model => ({
      id: model.name,
      name: model.name,
      provider: 'ollama',
      contextWindow: 8192,  // Default, varies by model
      capabilities: {
        completion: true,
        streaming: true,
        toolCalling: true,
        vision: model.name.includes('vision')
      }
    }));
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    model?: string
  ): number {
    // Ollama is free!
    return 0;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

**Ollama-Specific Considerations:**

1. **No API Key Required**: Simplified authentication
2. **Local Execution**: Must check if Ollama server is running
3. **Free Usage**: Cost calculation always returns 0
4. **Different Response Format**: Must adapt Ollama's response to common interface

---

### Case Study 2: OpenAI Provider

OpenAI requires API authentication, token tracking, and cost calculation.

```typescript
// src/ai/providers/openai-provider.ts
import OpenAI from 'openai';
import { BaseAIProvider, ProviderConfig, CompletionOptions, AICompletionResponse } from './base-provider';

export interface OpenAIProviderConfig extends ProviderConfig {
  apiKey: string;
  organization?: string;
  defaultModel?: string;
}

// Pricing as of 2025 (per 1M tokens)
const PRICING = {
  'gpt-4': { prompt: 30.00, completion: 60.00 },
  'gpt-4-turbo': { prompt: 10.00, completion: 30.00 },
  'gpt-3.5-turbo': { prompt: 0.50, completion: 1.50 }
};

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(config: OpenAIProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.defaultModel = config.defaultModel || 'gpt-4-turbo';
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      timeout: config.timeout || 60000,
      maxRetries: config.retryAttempts || 2
    });
  }

  getName(): string {
    return 'openai';
  }

  async initialize(): Promise<void> {
    // Verify API key by listing models
    try {
      await this.client.models.list();
      logger.info('OpenAI provider initialized successfully');
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }
      throw new Error(`Failed to initialize OpenAI provider: ${error}`);
    }
  }

  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const model = options.model || this.defaultModel;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        stop: options.stopSequences
      });

      const choice = response.choices[0];
      const usage = response.usage!;

      const responseTime = Date.now() - startTime;
      const tokensUsed = usage.total_tokens;
      const cost = this.calculateCost(
        usage.prompt_tokens,
        usage.completion_tokens,
        model
      );

      this.updateMetrics(true, responseTime, tokensUsed, cost);

      return {
        content: choice.message.content || '',
        model: response.model,
        tokensUsed: {
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens
        },
        finishReason: choice.finish_reason as any,
        metadata: {
          id: response.id,
          created: response.created,
          systemFingerprint: response.system_fingerprint
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime, 0, 0);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.status === 500) {
        throw new Error('OpenAI service error');
      }

      throw error;
    }
  }

  async completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void> {
    const model = options.model || this.defaultModel;

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        stop: options.stopSequences,
        stream: true
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          onEvent({
            type: 'content',
            content: delta.content
          });
        }

        if (chunk.choices[0]?.finish_reason) {
          onEvent({
            type: 'done',
            metadata: {
              finishReason: chunk.choices[0].finish_reason
            }
          });
        }
      }
    } catch (error) {
      onEvent({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  async listModels(): Promise<AIModel[]> {
    const response = await this.client.models.list();

    return response.data
      .filter(model => model.id.startsWith('gpt'))
      .map(model => ({
        id: model.id,
        name: model.id,
        provider: 'openai',
        contextWindow: this.getContextWindow(model.id),
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: true,
          vision: model.id.includes('vision')
        }
      }));
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    model: string = this.defaultModel
  ): number {
    const pricing = PRICING[model] || PRICING['gpt-4-turbo'];

    const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
    const completionCost = (completionTokens / 1_000_000) * pricing.completion;

    return promptCost + completionCost;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  private getContextWindow(model: string): number {
    if (model.includes('gpt-4-turbo')) return 128000;
    if (model.includes('gpt-4')) return 8192;
    if (model.includes('gpt-3.5-turbo')) return 16385;
    return 4096;
  }
}
```

**OpenAI-Specific Considerations:**

1. **API Key Required**: Must validate before use
2. **Cost Tracking**: Accurate pricing based on model and token usage
3. **Rate Limiting**: Handle 429 errors gracefully
4. **Error Handling**: Different error codes require different responses

---

### Case Study 3: Anthropic Provider

Anthropic's Claude models are particularly strong for coding tasks and feature large context windows.

```typescript
// src/ai/providers/anthropic-provider.ts
import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, ProviderConfig, CompletionOptions, AICompletionResponse } from './base-provider';

export interface AnthropicProviderConfig extends ProviderConfig {
  apiKey: string;
  defaultModel?: string;
}

// Pricing as of 2025 (per 1M tokens)
const ANTHROPIC_PRICING = {
  'claude-3-5-sonnet-20241022': { prompt: 3.00, completion: 15.00 },
  'claude-3-opus-20240229': { prompt: 15.00, completion: 75.00 },
  'claude-3-sonnet-20240229': { prompt: 3.00, completion: 15.00 },
  'claude-3-haiku-20240307': { prompt: 0.25, completion: 1.25 }
};

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;
  private defaultModel: string;

  constructor(config: AnthropicProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.defaultModel = config.defaultModel || 'claude-3-5-sonnet-20241022';
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeout || 60000,
      maxRetries: config.retryAttempts || 2
    });
  }

  getName(): string {
    return 'anthropic';
  }

  async initialize(): Promise<void> {
    // Anthropic doesn't have a "list models" endpoint, so we test with a minimal request
    try {
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }]
      });
      logger.info('Anthropic provider initialized successfully');
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key');
      }
      throw new Error(`Failed to initialize Anthropic provider: ${error}`);
    }
  }

  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const model = options.model || this.defaultModel;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        top_p: options.topP,
        stop_sequences: options.stopSequences
      });

      const content = response.content[0];
      const textContent = content.type === 'text' ? content.text : '';

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateCost(
        response.usage.input_tokens,
        response.usage.output_tokens,
        model
      );

      this.updateMetrics(true, responseTime, tokensUsed, cost);

      return {
        content: textContent,
        model: response.model,
        tokensUsed: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
          total: tokensUsed
        },
        finishReason: response.stop_reason as any,
        metadata: {
          id: response.id,
          type: response.type
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime, 0, 0);

      // Handle Anthropic-specific errors
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.status === 529) {
        throw new Error('Anthropic service overloaded');
      }

      throw error;
    }
  }

  async completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void> {
    const model = options.model || this.defaultModel;

    try {
      const stream = await this.client.messages.stream({
        model,
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        top_p: options.topP,
        stop_sequences: options.stopSequences
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            onEvent({
              type: 'content',
              content: event.delta.text
            });
          }
        } else if (event.type === 'message_stop') {
          onEvent({
            type: 'done',
            metadata: {
              stopReason: stream.finalMessage?.stop_reason
            }
          });
        }
      }
    } catch (error) {
      onEvent({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  async listModels(): Promise<AIModel[]> {
    // Anthropic doesn't provide a models API, return known models
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        contextWindow: 200000,
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: true,
          vision: true
        }
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        contextWindow: 200000,
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: true,
          vision: true
        }
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        contextWindow: 200000,
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: true,
          vision: true
        }
      }
    ];
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    model: string = this.defaultModel
  ): number {
    const pricing = ANTHROPIC_PRICING[model] || ANTHROPIC_PRICING['claude-3-5-sonnet-20241022'];

    const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
    const completionCost = (completionTokens / 1_000_000) * pricing.completion;

    return promptCost + completionCost;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

**Anthropic-Specific Considerations:**

1. **Large Context Windows**: 200K tokens enable processing entire codebases
2. **No Model List API**: Must hardcode known models
3. **Different Streaming Format**: Uses event-based streaming
4. **System Prompts**: Supports separate system parameter (not shown for brevity)
5. **Tool Use**: Advanced tool calling capabilities (covered in Chapter 4)

---

### Case Study 4: Google Provider

Google's Gemini offers multi-modal capabilities and generous free tier.

```typescript
// src/ai/providers/google-provider.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { BaseAIProvider, ProviderConfig, CompletionOptions, AICompletionResponse } from './base-provider';

export interface GoogleProviderConfig extends ProviderConfig {
  apiKey: string;
  defaultModel?: string;
}

// Pricing as of 2025 (per 1M tokens)
const GOOGLE_PRICING = {
  'gemini-pro': { prompt: 0.50, completion: 1.50 },
  'gemini-pro-vision': { prompt: 0.50, completion: 1.50 },
  'gemini-ultra': { prompt: 2.00, completion: 6.00 }
};

export class GoogleProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(config: GoogleProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Google API key is required');
    }

    this.defaultModel = config.defaultModel || 'gemini-pro';
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  getName(): string {
    return 'google';
  }

  async initialize(): Promise<void> {
    try {
      const model = this.client.getGenerativeModel({ model: this.defaultModel });
      await model.generateContent('test');
      logger.info('Google provider initialized successfully');
    } catch (error) {
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Google API key');
      }
      throw new Error(`Failed to initialize Google provider: ${error}`);
    }
  }

  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<AICompletionResponse> {
    const startTime = Date.now();
    const modelName = options.model || this.defaultModel;

    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
          topP: options.topP,
          stopSequences: options.stopSequences
        }
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const responseTime = Date.now() - startTime;

      // Google doesn't always provide token counts
      const promptTokens = response.usageMetadata?.promptTokenCount || 0;
      const completionTokens = response.usageMetadata?.candidatesTokenCount || 0;
      const tokensUsed = promptTokens + completionTokens;

      const cost = this.calculateCost(promptTokens, completionTokens, modelName);

      this.updateMetrics(true, responseTime, tokensUsed, cost);

      return {
        content: text,
        model: modelName,
        tokensUsed: {
          prompt: promptTokens,
          completion: completionTokens,
          total: tokensUsed
        },
        finishReason: 'stop',
        metadata: {
          safetyRatings: response.candidates?.[0]?.safetyRatings
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime, 0, 0);
      throw error;
    }
  }

  async completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void> {
    const modelName = options.model || this.defaultModel;

    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
          topP: options.topP,
          stopSequences: options.stopSequences
        }
      });

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          onEvent({
            type: 'content',
            content: text
          });
        }
      }

      onEvent({ type: 'done' });
    } catch (error) {
      onEvent({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  async listModels(): Promise<AIModel[]> {
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        contextWindow: 32768,
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: true,
          vision: false
        }
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        provider: 'google',
        contextWindow: 16384,
        capabilities: {
          completion: true,
          streaming: true,
          toolCalling: false,
          vision: true
        }
      }
    ];
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    model: string = this.defaultModel
  ): number {
    const pricing = GOOGLE_PRICING[model] || GOOGLE_PRICING['gemini-pro'];

    const promptCost = (promptTokens / 1_000_000) * pricing.prompt;
    const completionCost = (completionTokens / 1_000_000) * pricing.completion;

    return promptCost + completionCost;
  }

  async testConnection(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.defaultModel });
      await model.generateContent('test');
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

**Google-Specific Considerations:**

1. **Multi-Modal Support**: Vision models can process images
2. **Safety Ratings**: Responses include content safety assessments
3. **Generous Free Tier**: Good for development and testing
4. **Token Count Limitations**: Not always available in responses
5. **Different API Structure**: Uses GenerativeModel pattern

---

### Provider Comparison Summary

| Feature | Ollama | OpenAI | Anthropic | Google |
|---------|--------|--------|-----------|--------|
| **Cost** | Free | $$$ | $$$$ | $$ |
| **Privacy** | 🔒 Full | ⚠️ Cloud | ⚠️ Cloud | ⚠️ Cloud |
| **Context Window** | 8K-128K | 128K | 200K | 32K |
| **Setup Complexity** | Medium | Easy | Easy | Easy |
| **Best For** | Local dev, privacy | General purpose | Complex coding | Multi-modal |
| **Offline Support** | ✅ | ❌ | ❌ | ❌ |
| **API Maturity** | Good | Excellent | Excellent | Good |

---

## 2.4 Provider Manager

Now that we have multiple provider implementations, we need a **ProviderManager** to:
- Register and configure providers
- Store credentials securely
- Track usage and costs
- Monitor health
- Enforce budgets

### Architecture

```typescript
// src/ai/providers/provider-manager.ts
import { EventEmitter } from 'events';
import { BaseAIProvider } from './base-provider';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ProviderCredentials {
  apiKey?: string;
  apiSecret?: string;
  organization?: string;
  customHeaders?: Record<string, string>;
}

export interface ProviderUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  dailyUsage: Map<string, number>;
  monthlyUsage: Map<string, number>;
  lastUsed?: Date;
}

export interface ProviderBudget {
  providerId: string;
  dailyLimit: number;
  monthlyLimit: number;
  alertThresholds: {
    percentage: number;
    cost: number;
  }[];
}

export class ProviderManager extends EventEmitter {
  private providers = new Map<string, BaseAIProvider>();
  private configurations = new Map<string, ProviderConfig>();
  private credentials = new Map<string, ProviderCredentials>();
  private usageStats = new Map<string, ProviderUsageStats>();
  private budgets = new Map<string, ProviderBudget>();

  private credentialsPath: string;
  private encryptionKey: Buffer;

  constructor(credentialsPath: string, encryptionPassword: string) {
    super();
    this.credentialsPath = credentialsPath;

    // Derive encryption key from password
    this.encryptionKey = scryptSync(encryptionPassword, 'salt', 32);
  }

  /**
   * Register a provider with the manager
   */
  async registerProvider(
    id: string,
    provider: BaseAIProvider,
    config: ProviderConfig
  ): Promise<void> {
    // Initialize provider
    await provider.initialize();

    // Store provider and config
    this.providers.set(id, provider);
    this.configurations.set(id, config);

    // Initialize usage stats
    this.usageStats.set(id, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      dailyUsage: new Map(),
      monthlyUsage: new Map()
    });

    // Listen to provider metrics
    provider.on('metrics_updated', (metrics) => {
      this.updateUsageStats(id, metrics);
    });

    logger.info(`Provider registered: ${id} (${provider.getName()})`);
    this.emit('provider_registered', { id, name: provider.getName() });
  }

  /**
   * Unregister a provider
   */
  async unregisterProvider(id: string): Promise<void> {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider not found: ${id}`);
    }

    this.providers.delete(id);
    this.configurations.delete(id);
    this.credentials.delete(id);
    this.usageStats.delete(id);
    this.budgets.delete(id);

    logger.info(`Provider unregistered: ${id}`);
    this.emit('provider_unregistered', { id });
  }

  /**
   * Store credentials securely (encrypted)
   */
  async storeCredentials(
    id: string,
    credentials: ProviderCredentials
  ): Promise<void> {
    // Encrypt credentials
    const encrypted = this.encryptCredentials(credentials);

    // Store in memory
    this.credentials.set(id, credentials);

    // Persist to disk (encrypted)
    await this.persistCredentials(id, encrypted);

    this.emit('credentials_stored', { id });
  }

  /**
   * Get a provider by ID
   */
  getProvider(id: string): BaseAIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * List all registered providers
   */
  listProviders(): Array<{ id: string; name: string; health: ProviderHealth }> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.getName(),
      health: provider.getHealth()
    }));
  }

  /**
   * Get usage statistics for a provider
   */
  getUsageStats(id: string): ProviderUsageStats | undefined {
    return this.usageStats.get(id);
  }

  /**
   * Set budget limits for a provider
   */
  setBudget(budget: ProviderBudget): void {
    this.budgets.set(budget.providerId, budget);
    this.emit('budget_set', budget);
  }

  /**
   * Check if a request would exceed budget
   */
  checkBudget(id: string, estimatedCost: number): boolean {
    const budget = this.budgets.get(id);
    const stats = this.usageStats.get(id);

    if (!budget || !stats) return true; // No budget set, allow

    const today = new Date().toISOString().split('T')[0];
    const dailyCost = stats.dailyUsage.get(today) || 0;

    // Check daily limit
    if (dailyCost + estimatedCost > budget.dailyLimit) {
      this.emit('budget_exceeded', {
        id,
        type: 'daily',
        current: dailyCost,
        limit: budget.dailyLimit
      });
      return false;
    }

    // Check monthly limit
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlyCost = stats.monthlyUsage.get(month) || 0;

    if (monthlyCost + estimatedCost > budget.monthlyLimit) {
      this.emit('budget_exceeded', {
        id,
        type: 'monthly',
        current: monthlyCost,
        limit: budget.monthlyLimit
      });
      return false;
    }

    // Check alert thresholds
    for (const threshold of budget.alertThresholds) {
      if (dailyCost >= budget.dailyLimit * (threshold.percentage / 100)) {
        this.emit('budget_alert', {
          id,
          type: 'daily',
          percentage: threshold.percentage,
          current: dailyCost,
          limit: budget.dailyLimit
        });
      }
    }

    return true;
  }

  /**
   * Track usage for a provider
   */
  trackUsage(
    id: string,
    success: boolean,
    tokensUsed: number,
    responseTime: number,
    cost: number
  ): void {
    const stats = this.usageStats.get(id);
    if (!stats) return;

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    stats.totalTokensUsed += tokensUsed;
    stats.totalCost += cost;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.totalRequests - 1) + responseTime) /
      stats.totalRequests;

    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    const dailyCost = stats.dailyUsage.get(today) || 0;
    stats.dailyUsage.set(today, dailyCost + cost);

    // Update monthly usage
    const month = new Date().toISOString().substring(0, 7);
    const monthlyCost = stats.monthlyUsage.get(month) || 0;
    stats.monthlyUsage.set(month, monthlyCost + cost);

    stats.lastUsed = new Date();

    this.emit('usage_tracked', { id, stats });
  }

  // ============================================================
  // Private Helper Methods
  // ============================================================

  private updateUsageStats(id: string, metrics: ProviderMetrics): void {
    const stats = this.usageStats.get(id);
    if (!stats) return;

    // Update from provider metrics
    stats.totalRequests = metrics.totalRequests;
    stats.successfulRequests = metrics.successfulRequests;
    stats.failedRequests = metrics.failedRequests;
    stats.totalTokensUsed = metrics.totalTokensUsed;
    stats.totalCost = metrics.totalCost;
    stats.averageResponseTime = metrics.averageResponseTime;
  }

  /**
   * Encrypt credentials using AES-256-GCM
   */
  private encryptCredentials(credentials: ProviderCredentials): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const plaintext = JSON.stringify(credentials);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt credentials
   */
  private decryptCredentials(encrypted: string): ProviderCredentials {
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Persist encrypted credentials to disk
   */
  private async persistCredentials(id: string, encrypted: string): Promise<void> {
    const filePath = join(this.credentialsPath, `${id}.enc`);

    await fs.mkdir(this.credentialsPath, { recursive: true });
    await fs.writeFile(filePath, encrypted, { mode: 0o600 }); // Read/write owner only

    logger.debug(`Credentials persisted: ${id}`);
  }

  /**
   * Load encrypted credentials from disk
   */
  private async loadCredentials(id: string): Promise<ProviderCredentials | null> {
    const filePath = join(this.credentialsPath, `${id}.enc`);

    try {
      const encrypted = await fs.readFile(filePath, 'utf8');
      return this.decryptCredentials(encrypted);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }
}
```

### Key Features

#### 1. **Secure Credential Storage**

```typescript
// Credentials are encrypted using AES-256-GCM
await providerManager.storeCredentials('openai-main', {
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-123'
});

// Stored on disk with restricted permissions (0o600)
// File: ~/.ollama-code/credentials/openai-main.enc
// Format: iv:authTag:encryptedData
```

#### 2. **Usage Tracking**

```typescript
// Automatic tracking on every request
provider.on('metrics_updated', (metrics) => {
  providerManager.trackUsage(
    'openai-main',
    true,  // success
    1250,  // tokens used
    450,   // response time (ms)
    0.025  // cost ($)
  );
});

// Get usage stats
const stats = providerManager.getUsageStats('openai-main');
console.log(`Total cost this month: $${stats.totalCost.toFixed(2)}`);
```

#### 3. **Budget Enforcement**

```typescript
// Set budget limits
providerManager.setBudget({
  providerId: 'openai-main',
  dailyLimit: 10.00,    // $10/day
  monthlyLimit: 200.00, // $200/month
  alertThresholds: [
    { percentage: 80, cost: 8.00 },   // Alert at 80% of daily
    { percentage: 90, cost: 9.00 }    // Alert at 90% of daily
  ]
});

// Check before making request
if (!providerManager.checkBudget('openai-main', estimatedCost)) {
  throw new Error('Budget exceeded');
}

// Listen for budget events
providerManager.on('budget_alert', ({ id, percentage }) => {
  console.warn(`${id} reached ${percentage}% of daily budget`);
});

providerManager.on('budget_exceeded', ({ id, type, limit }) => {
  console.error(`${id} exceeded ${type} budget of $${limit}`);
});
```

---

## 2.5 Intelligent Router

Now that we have provider abstractions and management, we need a **router** to intelligently select which provider to use for each request. The router is the brain of the multi-provider system, making real-time decisions based on cost, quality, performance, and reliability.

### Why Intelligent Routing?

Not all AI tasks are created equal. Consider these scenarios:

1. **Simple commit messages**: Don't need GPT-4's power — use Ollama locally
2. **Complex code refactoring**: Quality matters — use Claude 3.5 Sonnet
3. **Quick answers**: Speed matters — use GPT-3.5 Turbo
4. **Critical decisions**: Accuracy matters — use response fusion with multiple providers

The router handles these decisions automatically based on configurable strategies.

### Router Architecture

```typescript
/**
 * Request context for routing decisions
 */
export interface RoutingContext {
  /** The user's prompt */
  prompt: string;

  /** Task complexity (estimated) */
  complexity: 'simple' | 'medium' | 'complex';

  /** Priority: cost, quality, or performance */
  priority: 'cost' | 'quality' | 'performance' | 'balanced';

  /** Maximum acceptable cost for this request */
  maxCost?: number;

  /** Maximum acceptable latency (ms) */
  maxLatency?: number;

  /** Required capabilities */
  requiredCapabilities?: string[];

  /** Conversation history (for context) */
  conversationHistory?: Message[];
}

/**
 * Routing decision result
 */
export interface RoutingDecision {
  /** Selected provider ID */
  providerId: string;

  /** Selected model */
  model: string;

  /** Reasoning for this choice */
  reasoning: string;

  /** Estimated cost */
  estimatedCost: number;

  /** Fallback providers (in order) */
  fallbacks: string[];

  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Routing strategy interface
 */
export interface RoutingStrategy {
  /**
   * Select the best provider for this context
   */
  selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision>;

  /**
   * Get strategy name
   */
  getName(): string;
}
```

### Routing Strategies

#### 1. Cost-Optimized Strategy

**Goal**: Minimize cost while meeting quality requirements

```typescript
export class CostOptimizedStrategy implements RoutingStrategy {
  getName(): string {
    return 'cost-optimized';
  }

  async selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision> {
    const startTime = Date.now();

    // Filter providers by health and capabilities
    const healthyProviders = Array.from(availableProviders.entries())
      .filter(([id, provider]) => {
        const health = provider.getHealth();
        return health.status === 'healthy';
      });

    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    // Estimate tokens for cost calculation
    const estimatedPromptTokens = this.estimateTokens(context.prompt);
    const estimatedCompletionTokens = this.estimateCompletionTokens(context.complexity);

    // Calculate cost for each provider
    const providerCosts = healthyProviders.map(([id, provider]) => {
      const models = this.getModelsForComplexity(provider.getName(), context.complexity);
      const modelCosts = models.map(model => ({
        id,
        model,
        cost: provider.calculateCost(estimatedPromptTokens, estimatedCompletionTokens, model),
        provider
      }));

      // Return cheapest model for this provider
      return modelCosts.sort((a, b) => a.cost - b.cost)[0];
    });

    // Sort by cost (cheapest first)
    providerCosts.sort((a, b) => a.cost - b.cost);

    // Select cheapest option
    const selected = providerCosts[0];

    // Build fallback list
    const fallbacks = providerCosts
      .slice(1, 4)  // Top 3 alternatives
      .map(p => p.id);

    return {
      providerId: selected.id,
      model: selected.model,
      reasoning: `Lowest cost option at $${selected.cost.toFixed(4)} (estimated)`,
      estimatedCost: selected.cost,
      fallbacks,
      confidence: 0.95
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private estimateCompletionTokens(complexity: string): number {
    switch (complexity) {
      case 'simple': return 100;
      case 'medium': return 500;
      case 'complex': return 2000;
      default: return 500;
    }
  }

  private getModelsForComplexity(providerName: string, complexity: string): string[] {
    // Map complexity to appropriate models
    if (providerName === 'ollama') {
      return ['qwen2.5-coder:7b', 'qwen2.5-coder:14b'];
    } else if (providerName === 'openai') {
      switch (complexity) {
        case 'simple': return ['gpt-3.5-turbo'];
        case 'medium': return ['gpt-4-turbo', 'gpt-3.5-turbo'];
        case 'complex': return ['gpt-4', 'gpt-4-turbo'];
      }
    } else if (providerName === 'anthropic') {
      switch (complexity) {
        case 'simple': return ['claude-3-haiku-20240307'];
        case 'medium': return ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];
        case 'complex': return ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'];
      }
    } else if (providerName === 'google') {
      switch (complexity) {
        case 'simple': return ['gemini-1.5-flash'];
        case 'medium': return ['gemini-1.5-flash', 'gemini-1.5-pro'];
        case 'complex': return ['gemini-1.5-pro'];
      }
    }

    return [];
  }
}
```

#### 2. Quality-Optimized Strategy

**Goal**: Maximize output quality, cost is secondary

```typescript
export class QualityOptimizedStrategy implements RoutingStrategy {
  // Quality rankings (higher = better)
  private qualityScores: Record<string, Record<string, number>> = {
    'ollama': {
      'qwen2.5-coder:7b': 6,
      'qwen2.5-coder:14b': 7,
      'qwen2.5-coder:32b': 8
    },
    'openai': {
      'gpt-3.5-turbo': 7,
      'gpt-4-turbo': 9,
      'gpt-4': 10
    },
    'anthropic': {
      'claude-3-haiku-20240307': 7,
      'claude-3-5-sonnet-20241022': 10,
      'claude-3-opus-20240229': 9
    },
    'google': {
      'gemini-1.5-flash': 6,
      'gemini-1.5-pro': 8
    }
  };

  getName(): string {
    return 'quality-optimized';
  }

  async selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision> {
    const healthyProviders = Array.from(availableProviders.entries())
      .filter(([id, provider]) => provider.getHealth().status === 'healthy');

    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    // Find highest quality model for each provider
    const providerOptions = healthyProviders.map(([id, provider]) => {
      const providerName = provider.getName();
      const scores = this.qualityScores[providerName] || {};

      // Get all models and their quality scores
      const modelScores = Object.entries(scores)
        .filter(([model]) => {
          // Filter by complexity if needed
          if (context.complexity === 'simple') {
            return true;  // All models acceptable
          } else if (context.complexity === 'medium') {
            return scores[model] >= 7;
          } else {  // complex
            return scores[model] >= 8;
          }
        })
        .map(([model, score]) => ({ id, model, score, provider }));

      // Return highest quality model
      modelScores.sort((a, b) => b.score - a.score);
      return modelScores[0];
    }).filter(Boolean);

    // Sort by quality (highest first)
    providerOptions.sort((a, b) => b.score - a.score);

    const selected = providerOptions[0];

    // Estimate cost for selected option
    const estimatedPromptTokens = Math.ceil(context.prompt.length / 4);
    const estimatedCompletionTokens = context.complexity === 'complex' ? 2000 : 500;
    const estimatedCost = selected.provider.calculateCost(
      estimatedPromptTokens,
      estimatedCompletionTokens,
      selected.model
    );

    return {
      providerId: selected.id,
      model: selected.model,
      reasoning: `Highest quality model (score: ${selected.score}/10)`,
      estimatedCost,
      fallbacks: providerOptions.slice(1, 4).map(p => p.id),
      confidence: 0.90
    };
  }
}
```

#### 3. Performance-Optimized Strategy

**Goal**: Minimize latency, prioritize speed

```typescript
export class PerformanceOptimizedStrategy implements RoutingStrategy {
  getName(): string {
    return 'performance-optimized';
  }

  async selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision> {
    const healthyProviders = Array.from(availableProviders.entries())
      .filter(([id, provider]) => provider.getHealth().status === 'healthy');

    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    // Sort by average response time (fastest first)
    const providersBySpeed = healthyProviders
      .map(([id, provider]) => {
        const metrics = provider.getMetrics();
        return {
          id,
          provider,
          avgResponseTime: metrics.averageResponseTime,
          // Prefer local providers (lower latency)
          isLocal: provider.getName() === 'ollama'
        };
      })
      .sort((a, b) => {
        // Prioritize local providers
        if (a.isLocal && !b.isLocal) return -1;
        if (!a.isLocal && b.isLocal) return 1;

        // Then sort by response time
        return a.avgResponseTime - b.avgResponseTime;
      });

    const selected = providersBySpeed[0];

    // Select fastest model for complexity
    const model = this.getFastestModel(selected.provider.getName(), context.complexity);

    const estimatedPromptTokens = Math.ceil(context.prompt.length / 4);
    const estimatedCompletionTokens = context.complexity === 'complex' ? 2000 : 500;
    const estimatedCost = selected.provider.calculateCost(
      estimatedPromptTokens,
      estimatedCompletionTokens,
      model
    );

    return {
      providerId: selected.id,
      model,
      reasoning: `Fastest provider (avg: ${selected.avgResponseTime.toFixed(0)}ms, local: ${selected.isLocal})`,
      estimatedCost,
      fallbacks: providersBySpeed.slice(1, 4).map(p => p.id),
      confidence: 0.85
    };
  }

  private getFastestModel(providerName: string, complexity: string): string {
    // Smaller models = faster inference
    if (providerName === 'ollama') {
      return 'qwen2.5-coder:7b';  // Smallest model
    } else if (providerName === 'openai') {
      return 'gpt-3.5-turbo';  // Fastest OpenAI model
    } else if (providerName === 'anthropic') {
      return 'claude-3-haiku-20240307';  // Fastest Claude model
    } else if (providerName === 'google') {
      return 'gemini-1.5-flash';  // Flash = fast
    }

    return '';
  }
}
```

#### 4. Balanced Strategy

**Goal**: Balance cost, quality, and performance

```typescript
export class BalancedStrategy implements RoutingStrategy {
  // Weights for scoring (total = 1.0)
  private weights = {
    cost: 0.35,
    quality: 0.40,
    performance: 0.25
  };

  private qualityOptimized = new QualityOptimizedStrategy();
  private costOptimized = new CostOptimizedStrategy();
  private performanceOptimized = new PerformanceOptimizedStrategy();

  getName(): string {
    return 'balanced';
  }

  async selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision> {
    const healthyProviders = Array.from(availableProviders.entries())
      .filter(([id, provider]) => provider.getHealth().status === 'healthy');

    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    // Get decisions from each strategy
    const [qualityDecision, costDecision, performanceDecision] = await Promise.all([
      this.qualityOptimized.selectProvider(context, availableProviders),
      this.costOptimized.selectProvider(context, availableProviders),
      this.performanceOptimized.selectProvider(context, availableProviders)
    ]);

    // Score each provider based on all criteria
    const scores = new Map<string, number>();

    for (const [id, provider] of healthyProviders) {
      const metrics = provider.getMetrics();

      // Normalize scores (0-1)
      const costScore = this.normalizeCost(costDecision.estimatedCost);
      const qualityScore = this.normalizeQuality(provider.getName(), qualityDecision.model);
      const performanceScore = this.normalizePerformance(metrics.averageResponseTime);

      // Weighted sum
      const totalScore =
        (costScore * this.weights.cost) +
        (qualityScore * this.weights.quality) +
        (performanceScore * this.weights.performance);

      scores.set(id, totalScore);
    }

    // Select highest scoring provider
    const selectedId = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    const selectedProvider = availableProviders.get(selectedId)!;

    // Choose model based on complexity
    const model = this.selectModel(selectedProvider.getName(), context.complexity);

    const estimatedPromptTokens = Math.ceil(context.prompt.length / 4);
    const estimatedCompletionTokens = context.complexity === 'complex' ? 2000 : 500;
    const estimatedCost = selectedProvider.calculateCost(
      estimatedPromptTokens,
      estimatedCompletionTokens,
      model
    );

    return {
      providerId: selectedId,
      model,
      reasoning: `Balanced choice (score: ${scores.get(selectedId)!.toFixed(2)})`,
      estimatedCost,
      fallbacks: Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(1, 4)
        .map(([id]) => id),
      confidence: 0.88
    };
  }

  private normalizeCost(cost: number): number {
    // Lower cost = higher score
    // $0.00 = 1.0, $0.10+ = 0.0
    return Math.max(0, 1 - (cost / 0.10));
  }

  private normalizeQuality(provider: string, model: string): number {
    const qualityScores: Record<string, Record<string, number>> = {
      'ollama': { 'qwen2.5-coder:7b': 0.6, 'qwen2.5-coder:14b': 0.7, 'qwen2.5-coder:32b': 0.8 },
      'openai': { 'gpt-3.5-turbo': 0.7, 'gpt-4-turbo': 0.9, 'gpt-4': 1.0 },
      'anthropic': { 'claude-3-haiku-20240307': 0.7, 'claude-3-5-sonnet-20241022': 1.0, 'claude-3-opus-20240229': 0.9 },
      'google': { 'gemini-1.5-flash': 0.6, 'gemini-1.5-pro': 0.8 }
    };

    return qualityScores[provider]?.[model] || 0.5;
  }

  private normalizePerformance(avgResponseTime: number): number {
    // Lower response time = higher score
    // 0ms = 1.0, 5000ms+ = 0.0
    return Math.max(0, 1 - (avgResponseTime / 5000));
  }

  private selectModel(provider: string, complexity: string): string {
    // Balanced model selection
    const models: Record<string, Record<string, string>> = {
      'ollama': { 'simple': 'qwen2.5-coder:7b', 'medium': 'qwen2.5-coder:14b', 'complex': 'qwen2.5-coder:14b' },
      'openai': { 'simple': 'gpt-3.5-turbo', 'medium': 'gpt-4-turbo', 'complex': 'gpt-4-turbo' },
      'anthropic': { 'simple': 'claude-3-haiku-20240307', 'medium': 'claude-3-5-sonnet-20241022', 'complex': 'claude-3-5-sonnet-20241022' },
      'google': { 'simple': 'gemini-1.5-flash', 'medium': 'gemini-1.5-pro', 'complex': 'gemini-1.5-pro' }
    };

    return models[provider]?.[complexity] || '';
  }
}
```

### Intelligent Router Implementation

```typescript
export class IntelligentRouter extends EventEmitter {
  private strategies: Map<string, RoutingStrategy> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private defaultStrategy: string = 'balanced';

  constructor(
    private providerManager: ProviderManager,
    private logger: Logger
  ) {
    super();

    // Register built-in strategies
    this.registerStrategy(new CostOptimizedStrategy());
    this.registerStrategy(new QualityOptimizedStrategy());
    this.registerStrategy(new PerformanceOptimizedStrategy());
    this.registerStrategy(new BalancedStrategy());

    // Initialize circuit breakers for each provider
    this.initializeCircuitBreakers();
  }

  /**
   * Register a routing strategy
   */
  registerStrategy(strategy: RoutingStrategy): void {
    this.strategies.set(strategy.getName(), strategy);
    this.logger.debug(`Registered routing strategy: ${strategy.getName()}`);
  }

  /**
   * Route a request to the best provider
   */
  async route(context: RoutingContext): Promise<RoutingDecision> {
    const strategyName = this.getStrategyForContext(context);
    const strategy = this.strategies.get(strategyName);

    if (!strategy) {
      throw new Error(`Unknown routing strategy: ${strategyName}`);
    }

    // Get available providers (excluding those with open circuit breakers)
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.size === 0) {
      throw new Error('No available providers (all circuit breakers open)');
    }

    try {
      const decision = await strategy.selectProvider(context, availableProviders);

      this.logger.info(`Routing decision: ${decision.providerId} (${decision.model})`, {
        strategy: strategyName,
        reasoning: decision.reasoning,
        estimatedCost: decision.estimatedCost
      });

      this.emit('routing_decision', { context, decision, strategy: strategyName });

      return decision;
    } catch (error) {
      this.logger.error('Routing failed', error);
      throw error;
    }
  }

  /**
   * Execute a request with automatic fallback
   */
  async executeWithFallback(
    context: RoutingContext,
    executeFn: (providerId: string, model: string) => Promise<any>
  ): Promise<any> {
    const decision = await this.route(context);
    const attemptOrder = [decision.providerId, ...decision.fallbacks];

    for (const providerId of attemptOrder) {
      const circuitBreaker = this.circuitBreakers.get(providerId);

      if (circuitBreaker && !circuitBreaker.canAttempt()) {
        this.logger.warn(`Circuit breaker open for ${providerId}, skipping`);
        continue;
      }

      try {
        this.logger.debug(`Attempting request with ${providerId}`);
        const result = await executeFn(providerId, decision.model);

        // Success - record it
        circuitBreaker?.recordSuccess();

        this.emit('request_success', { providerId, context });

        return result;
      } catch (error) {
        this.logger.warn(`Request failed with ${providerId}`, error);

        // Record failure
        circuitBreaker?.recordFailure();

        this.emit('request_failure', { providerId, context, error });

        // Continue to next fallback
        continue;
      }
    }

    // All providers failed
    throw new Error('All providers failed (including fallbacks)');
  }

  /**
   * Get strategy name for context
   */
  private getStrategyForContext(context: RoutingContext): string {
    // Use context priority if specified
    if (context.priority) {
      switch (context.priority) {
        case 'cost': return 'cost-optimized';
        case 'quality': return 'quality-optimized';
        case 'performance': return 'performance-optimized';
        case 'balanced': return 'balanced';
      }
    }

    // Use default strategy
    return this.defaultStrategy;
  }

  /**
   * Get available providers (healthy + circuit breaker closed)
   */
  private getAvailableProviders(): Map<string, BaseAIProvider> {
    const allProviders = this.providerManager.getAllProviders();
    const available = new Map<string, BaseAIProvider>();

    for (const [id, provider] of allProviders) {
      const health = provider.getHealth();
      const circuitBreaker = this.circuitBreakers.get(id);

      if (health.status === 'healthy' && (!circuitBreaker || circuitBreaker.canAttempt())) {
        available.set(id, provider);
      }
    }

    return available;
  }

  /**
   * Initialize circuit breakers for all providers
   */
  private initializeCircuitBreakers(): void {
    const providers = this.providerManager.getAllProviders();

    for (const [id] of providers) {
      this.circuitBreakers.set(id, new CircuitBreaker({
        failureThreshold: 5,     // Open after 5 failures
        resetTimeout: 60000,     // Try again after 60s
        halfOpenRequests: 1      // Test with 1 request
      }));
    }
  }
}
```

### Circuit Breaker Pattern

The circuit breaker prevents cascading failures when a provider is experiencing issues:

```typescript
type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerConfig {
  /** Number of failures before opening */
  failureThreshold: number;

  /** Time to wait before trying again (ms) */
  resetTimeout: number;

  /** Number of test requests in half-open state */
  halfOpenRequests: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenAttempts: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Check if we can attempt a request
   */
  canAttempt(): boolean {
    if (this.state === 'closed') {
      return true;
    }

    if (this.state === 'open') {
      // Check if reset timeout has passed
      const now = Date.now();
      if (now - this.lastFailureTime >= this.config.resetTimeout) {
        // Transition to half-open
        this.state = 'half-open';
        this.halfOpenAttempts = 0;
        return true;
      }

      return false;  // Still open
    }

    if (this.state === 'half-open') {
      // Allow limited test requests
      return this.halfOpenAttempts < this.config.halfOpenRequests;
    }

    return false;
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    if (this.state === 'half-open') {
      // Test succeeded - close the circuit
      this.state = 'closed';
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    } else if (this.state === 'closed') {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      // Test failed - reopen circuit
      this.state = 'open';
      this.halfOpenAttempts = 0;
    } else if (this.state === 'closed') {
      // Check if we should open
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'open';
      }
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure statistics
   */
  getStats(): { state: CircuitState; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenAttempts = 0;
  }
}
```

### Usage Example

```typescript
// Initialize router
const router = new IntelligentRouter(providerManager, logger);

// Simple cost-optimized request
const costContext: RoutingContext = {
  prompt: 'Generate a commit message for these changes',
  complexity: 'simple',
  priority: 'cost'
};

const decision1 = await router.route(costContext);
// Result: Ollama (free local inference)

// Complex quality-focused request
const qualityContext: RoutingContext = {
  prompt: 'Refactor this legacy codebase to use modern patterns',
  complexity: 'complex',
  priority: 'quality'
};

const decision2 = await router.route(qualityContext);
// Result: Claude 3.5 Sonnet (highest quality)

// Execute with automatic fallback
const result = await router.executeWithFallback(
  qualityContext,
  async (providerId, model) => {
    const provider = providerManager.getProvider(providerId);
    return await provider.complete(qualityContext.prompt, { model });
  }
);
```

### Key Benefits

1. **Automatic Provider Selection**: No manual configuration per request
2. **Intelligent Fallbacks**: Graceful degradation if primary provider fails
3. **Circuit Breaking**: Prevents wasted requests to failing providers
4. **Cost Control**: Can enforce cost constraints while maintaining quality
5. **Performance Optimization**: Routes to fastest providers when latency matters
6. **Extensible**: Easy to add custom routing strategies

---

## 2.6 Response Fusion

For critical decisions, relying on a single AI provider isn't enough. **Response fusion** combines outputs from multiple providers to achieve higher accuracy and reliability.

### When to Use Response Fusion

Response fusion is valuable for:

1. **Critical Code Changes**: Refactoring production code
2. **Security Decisions**: Identifying vulnerabilities
3. **Architecture Decisions**: High-impact design choices
4. **Consensus Building**: When you need high confidence

The tradeoff: **higher cost and latency** in exchange for **increased accuracy**.

### Fusion Strategies

#### 1. Majority Voting

Ask multiple providers the same question, use the most common answer:

```typescript
export interface FusionResponse {
  /** The fused/consensus result */
  result: string;

  /** Individual provider responses */
  individualResponses: Array<{
    providerId: string;
    response: string;
    confidence: number;
  }>;

  /** Fusion method used */
  fusionMethod: string;

  /** Overall confidence in result (0-1) */
  confidence: number;

  /** Total cost of fusion */
  totalCost: number;
}

export class MajorityVotingFusion {
  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  /**
   * Get consensus from multiple providers using majority voting
   */
  async fuse(
    prompt: string,
    options: {
      providerIds?: string[];  // Specific providers (default: top 3)
      minAgreement?: number;    // Minimum agreement % (default: 0.66)
      complexity?: 'simple' | 'medium' | 'complex';
    } = {}
  ): Promise<FusionResponse> {
    const { providerIds, minAgreement = 0.66, complexity = 'medium' } = options;

    // Determine providers to query
    const providers = providerIds || await this.selectProvidersForFusion(complexity);

    if (providers.length < 2) {
      throw new Error('Fusion requires at least 2 providers');
    }

    this.logger.info(`Starting majority voting fusion with ${providers.length} providers`);

    // Query all providers in parallel
    const responses = await Promise.allSettled(
      providers.map(async (providerId) => {
        const provider = await this.router['providerManager'].getProvider(providerId);
        const response = await provider.complete(prompt, { temperature: 0.3 });

        return {
          providerId,
          response: response.content,
          confidence: this.calculateConfidence(response),
          cost: response.metadata?.cost || 0
        };
      })
    );

    // Extract successful responses
    const successfulResponses = responses
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successfulResponses.length < 2) {
      throw new Error('Fusion requires at least 2 successful responses');
    }

    // Group similar responses
    const groups = this.groupSimilarResponses(successfulResponses);

    // Find majority group
    const majorityGroup = groups.sort((a, b) => b.length - a.length)[0];
    const agreementRatio = majorityGroup.length / successfulResponses.length;

    if (agreementRatio < minAgreement) {
      this.logger.warn(`Low agreement in fusion: ${(agreementRatio * 100).toFixed(1)}%`);
    }

    // Calculate total cost
    const totalCost = successfulResponses.reduce((sum, r) => sum + r.cost, 0);

    // Use the highest-confidence response from majority group
    const bestResponse = majorityGroup
      .sort((a, b) => b.confidence - a.confidence)[0];

    return {
      result: bestResponse.response,
      individualResponses: successfulResponses,
      fusionMethod: 'majority-voting',
      confidence: agreementRatio,
      totalCost
    };
  }

  /**
   * Group similar responses together
   */
  private groupSimilarResponses(responses: any[]): any[][] {
    const groups: any[][] = [];

    for (const response of responses) {
      let foundGroup = false;

      for (const group of groups) {
        // Check similarity to first member of group
        const similarity = this.calculateSimilarity(response.response, group[0].response);

        if (similarity > 0.80) {  // 80% similarity threshold
          group.push(response);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([response]);
      }
    }

    return groups;
  }

  /**
   * Calculate similarity between two strings (0-1)
   */
  private calculateSimilarity(a: string, b: string): number {
    // Simple normalized Levenshtein distance
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance implementation
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Select best providers for fusion
   */
  private async selectProvidersForFusion(complexity: string): Promise<string[]> {
    // Use quality-optimized strategy to select top 3 providers
    const context: RoutingContext = {
      prompt: '',
      complexity: complexity as any,
      priority: 'quality'
    };

    const decision = await this.router.route(context);

    // Return primary + top 2 fallbacks
    return [decision.providerId, ...decision.fallbacks.slice(0, 2)];
  }

  /**
   * Calculate confidence score for response
   */
  private calculateConfidence(response: any): number {
    // Factors: finish reason, content length, metadata
    let confidence = 0.5;  // Base confidence

    if (response.finishReason === 'stop') {
      confidence += 0.3;  // Complete response
    }

    if (response.content.length > 100) {
      confidence += 0.1;  // Substantial content
    }

    if (response.metadata?.confidence) {
      confidence = (confidence + response.metadata.confidence) / 2;
    }

    return Math.min(1.0, confidence);
  }
}
```

#### 2. Weighted Consensus

Weight responses by provider quality scores:

```typescript
export class WeightedConsensusFusion {
  // Provider quality weights (sum = 1.0)
  private providerWeights: Record<string, number> = {
    'openai-main': 0.30,
    'anthropic-main': 0.35,
    'google-main': 0.20,
    'ollama-local': 0.15
  };

  constructor(
    private router: IntelligentRouter,
    private logger: Logger
  ) {}

  /**
   * Fuse responses using weighted consensus
   */
  async fuse(
    prompt: string,
    options: {
      providerIds?: string[];
      complexity?: 'simple' | 'medium' | 'complex';
    } = {}
  ): Promise<FusionResponse> {
    const { providerIds, complexity = 'medium' } = options;

    const providers = providerIds || Object.keys(this.providerWeights);

    this.logger.info(`Starting weighted consensus fusion with ${providers.length} providers`);

    // Query all providers
    const responses = await Promise.allSettled(
      providers.map(async (providerId) => {
        const provider = await this.router['providerManager'].getProvider(providerId);
        const response = await provider.complete(prompt, { temperature: 0.3 });

        return {
          providerId,
          response: response.content,
          confidence: this.calculateConfidence(response),
          weight: this.providerWeights[providerId] || 0.10,
          cost: response.metadata?.cost || 0
        };
      })
    );

    const successfulResponses = responses
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    if (successfulResponses.length === 0) {
      throw new Error('All fusion providers failed');
    }

    // Group similar responses
    const groups = this.groupSimilarResponses(successfulResponses);

    // Calculate weighted score for each group
    const groupScores = groups.map(group => {
      const totalWeight = group.reduce((sum, r) => sum + r.weight, 0);
      const avgConfidence = group.reduce((sum, r) => sum + r.confidence, 0) / group.length;

      return {
        group,
        score: totalWeight * avgConfidence,
        totalWeight
      };
    });

    // Select highest scoring group
    const winningGroup = groupScores.sort((a, b) => b.score - a.score)[0];

    // Use highest confidence response from winning group
    const bestResponse = winningGroup.group
      .sort((a, b) => b.confidence - a.confidence)[0];

    const totalCost = successfulResponses.reduce((sum, r) => sum + r.cost, 0);

    return {
      result: bestResponse.response,
      individualResponses: successfulResponses,
      fusionMethod: 'weighted-consensus',
      confidence: winningGroup.score,
      totalCost
    };
  }

  private groupSimilarResponses(responses: any[]): any[][] {
    // Same implementation as MajorityVotingFusion
    const groups: any[][] = [];

    for (const response of responses) {
      let foundGroup = false;

      for (const group of groups) {
        const similarity = this.calculateSimilarity(response.response, group[0].response);

        if (similarity > 0.80) {
          group.push(response);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([response]);
      }
    }

    return groups;
  }

  private calculateSimilarity(a: string, b: string): number {
    // Same implementation as MajorityVotingFusion
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(a: string, b: string): number {
    // Same implementation as MajorityVotingFusion
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private calculateConfidence(response: any): number {
    // Same implementation as MajorityVotingFusion
    let confidence = 0.5;

    if (response.finishReason === 'stop') confidence += 0.3;
    if (response.content.length > 100) confidence += 0.1;
    if (response.metadata?.confidence) {
      confidence = (confidence + response.metadata.confidence) / 2;
    }

    return Math.min(1.0, confidence);
  }
}
```

### Usage Example

```typescript
const fusion = new MajorityVotingFusion(router, logger);

// Critical refactoring decision
const prompt = `
Analyze this legacy authentication code and recommend the best approach:
1. Refactor in place with minimal changes
2. Complete rewrite using modern OAuth2 patterns
3. Migrate to third-party auth service (Auth0, Clerk)

Consider: security, maintainability, migration risk, cost
`;

const result = await fusion.fuse(prompt, {
  providerIds: ['openai-main', 'anthropic-main', 'google-main'],
  minAgreement: 0.70,  // Need 70% agreement
  complexity: 'complex'
});

console.log(`Consensus: ${result.result}`);
console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
console.log(`Total cost: $${result.totalCost.toFixed(4)}`);
console.log(`Individual responses:`);
result.individualResponses.forEach(r => {
  console.log(`  - ${r.providerId}: ${r.response.substring(0, 100)}...`);
});
```

### Response Fusion Metrics

Track fusion effectiveness:

```typescript
interface FusionMetrics {
  totalFusions: number;
  averageAgreement: number;
  averageCost: number;
  agreementDistribution: {
    high: number;    // >80% agreement
    medium: number;  // 60-80%
    low: number;     // <60%
  };
}
```

---

## 2.7 Best Practices

Now that we've covered the complete multi-provider architecture, let's discuss best practices for production deployments.

### 1. Provider Selection Strategy

**❌ Don't**: Use a single provider for everything

```typescript
// Bad: Always using GPT-4
const response = await openai.complete(prompt, { model: 'gpt-4' });
```

**✅ Do**: Use the router with appropriate priorities

```typescript
// Good: Let the router decide
const decision = await router.route({
  prompt,
  complexity: analyzeComplexity(prompt),
  priority: 'balanced'
});

const provider = providerManager.getProvider(decision.providerId);
const response = await provider.complete(prompt, { model: decision.model });
```

### 2. Cost Management

**❌ Don't**: Let costs run unchecked

```typescript
// Bad: No budget limits
providerManager.registerProvider('openai-main', openaiProvider);
```

**✅ Do**: Always set budget limits with alerts

```typescript
// Good: Set reasonable budgets
providerManager.setBudget({
  providerId: 'openai-main',
  dailyLimit: 10.00,
  monthlyLimit: 200.00,
  alertThresholds: [0.50, 0.75, 0.90]
});

providerManager.on('budget_warning', ({ id, percentage }) => {
  logger.warn(`Provider ${id} at ${percentage}% of budget`);
  // Consider switching to cheaper provider
});
```

### 3. Credential Security

**❌ Don't**: Store credentials in plaintext

```typescript
// Bad: Environment variables exposed in logs
const apiKey = process.env.OPENAI_API_KEY;
console.log(`Using API key: ${apiKey}`); // NEVER!
```

**✅ Do**: Use encrypted storage and never log credentials

```typescript
// Good: Encrypted credential storage
await providerManager.storeCredentials('openai-main', {
  apiKey: process.env.OPENAI_API_KEY
});

// Credentials encrypted with AES-256-GCM
// Stored with restricted permissions (0o600)
// Never logged or exposed
```

### 4. Error Handling and Fallbacks

**❌ Don't**: Fail immediately on errors

```typescript
// Bad: No retry or fallback
try {
  return await provider.complete(prompt);
} catch (error) {
  throw error; // User sees error
}
```

**✅ Do**: Use automatic fallbacks with circuit breakers

```typescript
// Good: Automatic fallback to healthy providers
const result = await router.executeWithFallback(
  context,
  async (providerId, model) => {
    const provider = providerManager.getProvider(providerId);
    return await provider.complete(context.prompt, { model });
  }
);
// Tries primary provider, falls back to alternatives
// Circuit breaker prevents cascading failures
```

### 5. Health Monitoring

**❌ Don't**: Assume providers are always healthy

```typescript
// Bad: No health checks
const provider = providerManager.getProvider('openai-main');
await provider.complete(prompt); // Might fail
```

**✅ Do**: Monitor health continuously

```typescript
// Good: Regular health monitoring
setInterval(async () => {
  const providers = providerManager.getAllProviders();

  for (const [id, provider] of providers) {
    const health = await provider.performHealthCheck();

    if (health.status === 'unhealthy') {
      logger.error(`Provider ${id} unhealthy: ${health.lastError}`);
      // Alert team, switch to fallback
    }
  }
}, 60000); // Check every minute

// Listen for health events
provider.on('health_changed', ({ status, provider }) => {
  if (status === 'unhealthy') {
    // Trigger alerts, update monitoring dashboard
  }
});
```

### 6. Performance Optimization

**❌ Don't**: Make sequential requests when parallel is possible

```typescript
// Bad: Sequential requests (slow)
const result1 = await provider1.complete(prompt);
const result2 = await provider2.complete(prompt);
const result3 = await provider3.complete(prompt);
```

**✅ Do**: Use parallel requests with Promise.all

```typescript
// Good: Parallel fusion requests (fast)
const results = await Promise.allSettled([
  provider1.complete(prompt),
  provider2.complete(prompt),
  provider3.complete(prompt)
]);

// 3x faster for fusion
```

### 7. Usage Tracking

**❌ Don't**: Ignore usage metrics

```typescript
// Bad: No tracking
await provider.complete(prompt);
// No idea what it cost or how long it took
```

**✅ Do**: Track all requests for analysis

```typescript
// Good: Automatic usage tracking
provider.on('metrics_updated', (metrics) => {
  providerManager.trackUsage(
    'openai-main',
    true,
    metrics.tokensUsed,
    metrics.responseTime,
    metrics.cost
  );
});

// Analyze usage patterns
const stats = providerManager.getUsageStats('openai-main');
logger.info(`Monthly cost: $${stats.totalCost.toFixed(2)}`);
logger.info(`Avg response time: ${stats.averageResponseTime.toFixed(0)}ms`);
logger.info(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
```

### 8. Model Selection

**❌ Don't**: Always use the latest/biggest model

```typescript
// Bad: Using GPT-4 for simple tasks
const commitMsg = await openai.complete(diff, {
  model: 'gpt-4' // Expensive overkill
});
```

**✅ Do**: Match model to task complexity

```typescript
// Good: Appropriate model selection
const complexity = analyzeComplexity(task);

let model;
if (complexity === 'simple') {
  model = 'gpt-3.5-turbo'; // Fast, cheap
} else if (complexity === 'medium') {
  model = 'gpt-4-turbo'; // Balanced
} else {
  model = 'gpt-4'; // Quality for complex tasks
}
```

### 9. Response Fusion Usage

**❌ Don't**: Use fusion for every request

```typescript
// Bad: Fusion for simple tasks (expensive, slow)
const commitMsg = await fusion.fuse('Generate commit message', {
  providerIds: ['openai', 'anthropic', 'google']
});
// Costs 3x, takes 3x longer
```

**✅ Do**: Reserve fusion for critical decisions

```typescript
// Good: Fusion only for high-stakes decisions
const isCritical = task.type === 'refactoring' || task.type === 'security';

if (isCritical) {
  // Use fusion for accuracy
  const result = await fusion.fuse(prompt, {
    minAgreement: 0.70,
    complexity: 'complex'
  });

  if (result.confidence < 0.70) {
    logger.warn('Low confidence, requesting human review');
    await requestHumanReview(result);
  }
} else {
  // Single provider is fine
  const result = await router.executeWithFallback(context, executeFn);
}
```

### 10. Configuration Management

**❌ Don't**: Hardcode configuration

```typescript
// Bad: Hardcoded values
const dailyLimit = 10.00;
const failureThreshold = 5;
```

**✅ Do**: Use environment-based configuration

```typescript
// Good: Environment-aware configuration
interface MultiProviderConfig {
  defaultStrategy: 'cost' | 'quality' | 'performance' | 'balanced';
  budgets: Record<string, { daily: number; monthly: number }>;
  circuitBreaker: {
    failureThreshold: number;
    resetTimeout: number;
  };
  fusion: {
    minAgreement: number;
    maxProviders: number;
  };
}

const config: MultiProviderConfig = {
  defaultStrategy: process.env.ROUTING_STRATEGY as any || 'balanced',
  budgets: {
    'openai-main': {
      daily: parseFloat(process.env.OPENAI_DAILY_LIMIT || '10'),
      monthly: parseFloat(process.env.OPENAI_MONTHLY_LIMIT || '200')
    },
    'anthropic-main': {
      daily: parseFloat(process.env.ANTHROPIC_DAILY_LIMIT || '15'),
      monthly: parseFloat(process.env.ANTHROPIC_MONTHLY_LIMIT || '300')
    }
  },
  circuitBreaker: {
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000')
  },
  fusion: {
    minAgreement: parseFloat(process.env.FUSION_MIN_AGREEMENT || '0.66'),
    maxProviders: parseInt(process.env.FUSION_MAX_PROVIDERS || '3')
  }
};
```

---

## 2.8 Real-World Integration Example

Let's put it all together with a complete, production-ready integration:

```typescript
import { ProviderManager } from './provider-manager';
import { IntelligentRouter } from './intelligent-router';
import { MajorityVotingFusion } from './response-fusion';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { Logger } from './logger';

/**
 * Multi-Provider AI Service
 * Production-ready integration of all components
 */
export class MultiProviderAIService {
  private providerManager: ProviderManager;
  private router: IntelligentRouter;
  private fusion: MajorityVotingFusion;
  private logger: Logger;

  constructor(config: MultiProviderConfig) {
    this.logger = new Logger('MultiProviderAI');
    this.providerManager = new ProviderManager(this.logger);
    this.router = new IntelligentRouter(this.providerManager, this.logger);
    this.fusion = new MajorityVotingFusion(this.router, this.logger);

    this.initialize(config);
  }

  /**
   * Initialize all providers and budgets
   */
  private async initialize(config: MultiProviderConfig): Promise<void> {
    try {
      // Initialize Ollama (local)
      const ollama = new OllamaProvider({
        baseUrl: config.ollama.baseUrl || 'http://localhost:11434',
        defaultModel: config.ollama.defaultModel || 'qwen2.5-coder:7b'
      });
      await ollama.initialize();
      await this.providerManager.registerProvider('ollama-local', ollama);

      // Initialize OpenAI
      if (config.openai?.apiKey) {
        const openai = new OpenAIProvider({
          apiKey: config.openai.apiKey,
          organization: config.openai.organization,
          defaultModel: config.openai.defaultModel || 'gpt-4-turbo'
        });
        await openai.initialize();
        await this.providerManager.registerProvider('openai-main', openai);

        // Set budget
        this.providerManager.setBudget({
          providerId: 'openai-main',
          dailyLimit: config.budgets['openai-main'].daily,
          monthlyLimit: config.budgets['openai-main'].monthly,
          alertThresholds: [0.50, 0.75, 0.90]
        });

        // Store encrypted credentials
        await this.providerManager.storeCredentials('openai-main', {
          apiKey: config.openai.apiKey,
          organization: config.openai.organization
        });
      }

      // Initialize Anthropic
      if (config.anthropic?.apiKey) {
        const anthropic = new AnthropicProvider({
          apiKey: config.anthropic.apiKey,
          defaultModel: config.anthropic.defaultModel || 'claude-3-5-sonnet-20241022'
        });
        await anthropic.initialize();
        await this.providerManager.registerProvider('anthropic-main', anthropic);

        this.providerManager.setBudget({
          providerId: 'anthropic-main',
          dailyLimit: config.budgets['anthropic-main'].daily,
          monthlyLimit: config.budgets['anthropic-main'].monthly,
          alertThresholds: [0.50, 0.75, 0.90]
        });

        await this.providerManager.storeCredentials('anthropic-main', {
          apiKey: config.anthropic.apiKey
        });
      }

      // Initialize Google
      if (config.google?.apiKey) {
        const google = new GoogleProvider({
          apiKey: config.google.apiKey,
          defaultModel: config.google.defaultModel || 'gemini-1.5-pro'
        });
        await google.initialize();
        await this.providerManager.registerProvider('google-main', google);

        this.providerManager.setBudget({
          providerId: 'google-main',
          dailyLimit: config.budgets['google-main']?.daily || 10,
          monthlyLimit: config.budgets['google-main']?.monthly || 200,
          alertThresholds: [0.50, 0.75, 0.90]
        });

        await this.providerManager.storeCredentials('google-main', {
          apiKey: config.google.apiKey
        });
      }

      // Set up event listeners
      this.setupEventListeners();

      // Start health monitoring
      this.startHealthMonitoring();

      this.logger.info('Multi-provider AI service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize multi-provider service', error);
      throw error;
    }
  }

  /**
   * Complete a prompt using intelligent routing
   */
  async complete(
    prompt: string,
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      priority?: 'cost' | 'quality' | 'performance' | 'balanced';
      maxCost?: number;
      requireFusion?: boolean;
      minFusionAgreement?: number;
    } = {}
  ): Promise<AICompletionResponse> {
    const {
      complexity = 'medium',
      priority = 'balanced',
      maxCost,
      requireFusion = false,
      minFusionAgreement = 0.66
    } = options;

    // Use fusion for critical requests
    if (requireFusion) {
      const fusionResult = await this.fusion.fuse(prompt, {
        complexity,
        minAgreement: minFusionAgreement
      });

      this.logger.info('Fusion completed', {
        confidence: fusionResult.confidence,
        cost: fusionResult.totalCost,
        providers: fusionResult.individualResponses.length
      });

      return {
        content: fusionResult.result,
        metadata: {
          fusion: true,
          confidence: fusionResult.confidence,
          cost: fusionResult.totalCost
        }
      } as any;
    }

    // Normal routing
    const context: RoutingContext = {
      prompt,
      complexity,
      priority,
      maxCost
    };

    const result = await this.router.executeWithFallback(
      context,
      async (providerId, model) => {
        const provider = this.providerManager.getProvider(providerId);
        return await provider.complete(prompt, { model });
      }
    );

    return result;
  }

  /**
   * Stream a completion
   */
  async completeStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      priority?: 'cost' | 'quality' | 'performance' | 'balanced';
    } = {}
  ): Promise<void> {
    const { complexity = 'medium', priority = 'balanced' } = options;

    const context: RoutingContext = {
      prompt,
      complexity,
      priority
    };

    const decision = await this.router.route(context);
    const provider = this.providerManager.getProvider(decision.providerId);

    await provider.completeStream(
      prompt,
      { model: decision.model },
      (event) => {
        if (event.type === 'content') {
          onChunk(event.content);
        }
      }
    );
  }

  /**
   * Get usage statistics across all providers
   */
  getUsageStats(): Record<string, ProviderUsageStats> {
    const stats: Record<string, ProviderUsageStats> = {};
    const providers = this.providerManager.getAllProviders();

    for (const [id] of providers) {
      stats[id] = this.providerManager.getUsageStats(id);
    }

    return stats;
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus(): Record<string, ProviderHealth> {
    const health: Record<string, ProviderHealth> = {};
    const providers = this.providerManager.getAllProviders();

    for (const [id, provider] of providers) {
      health[id] = provider.getHealth();
    }

    return health;
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupEventListeners(): void {
    // Budget warnings
    this.providerManager.on('budget_warning', ({ id, type, percentage }) => {
      this.logger.warn(`Budget warning: ${id} at ${(percentage * 100).toFixed(1)}% of ${type} limit`);
    });

    // Budget exceeded
    this.providerManager.on('budget_exceeded', ({ id, type, current, limit }) => {
      this.logger.error(`Budget exceeded: ${id} spent $${current.toFixed(2)} of $${limit} ${type} limit`);
    });

    // Health changes
    const providers = this.providerManager.getAllProviders();
    for (const [id, provider] of providers) {
      provider.on('health_changed', ({ status, lastError }) => {
        if (status === 'unhealthy') {
          this.logger.error(`Provider ${id} unhealthy: ${lastError}`);
        } else {
          this.logger.info(`Provider ${id} recovered`);
        }
      });
    }

    // Routing decisions
    this.router.on('routing_decision', ({ decision, strategy }) => {
      this.logger.debug(`Routing: ${decision.providerId} (${decision.model}) via ${strategy}`);
    });

    // Request failures
    this.router.on('request_failure', ({ providerId, error }) => {
      this.logger.warn(`Request failed with ${providerId}:`, error);
    });
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      const providers = this.providerManager.getAllProviders();

      for (const [id, provider] of providers) {
        try {
          await provider.performHealthCheck();
        } catch (error) {
          this.logger.error(`Health check failed for ${id}`, error);
        }
      }
    }, 60000); // Every minute
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.logger.info('Shutting down multi-provider AI service');
    // Clean up resources, close connections, etc.
  }
}
```

### Usage Example

```typescript
// Initialize service
const service = new MultiProviderAIService({
  ollama: {
    baseUrl: 'http://localhost:11434',
    defaultModel: 'qwen2.5-coder:7b'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    defaultModel: 'gpt-4-turbo'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    defaultModel: 'claude-3-5-sonnet-20241022'
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY!,
    defaultModel: 'gemini-1.5-pro'
  },
  budgets: {
    'openai-main': { daily: 10, monthly: 200 },
    'anthropic-main': { daily: 15, monthly: 300 },
    'google-main': { daily: 8, monthly: 150 }
  },
  defaultStrategy: 'balanced'
});

// Simple request (cost-optimized)
const commitMsg = await service.complete(
  'Generate commit message for user authentication refactor',
  { complexity: 'simple', priority: 'cost' }
);
// Likely uses Ollama (free)

// Complex request (quality-optimized)
const refactorPlan = await service.complete(
  'Analyze this legacy auth system and propose refactoring strategy',
  { complexity: 'complex', priority: 'quality' }
);
// Likely uses Claude 3.5 Sonnet

// Critical request (fusion for accuracy)
const securityAnalysis = await service.complete(
  'Identify security vulnerabilities in this authentication code',
  {
    complexity: 'complex',
    requireFusion: true,
    minFusionAgreement: 0.75
  }
);
// Uses 3 providers, requires 75% agreement

// Streaming request
await service.completeStream(
  'Explain this codebase architecture',
  (chunk) => process.stdout.write(chunk),
  { complexity: 'medium', priority: 'performance' }
);

// Get statistics
const stats = service.getUsageStats();
console.log('Monthly costs:');
for (const [id, stat] of Object.entries(stats)) {
  console.log(`  ${id}: $${stat.totalCost.toFixed(2)}`);
}

// Get health status
const health = service.getHealthStatus();
console.log('Provider health:');
for (const [id, h] of Object.entries(health)) {
  console.log(`  ${id}: ${h.status}`);
}
```

---

## 2.9 Summary and Key Takeaways

In this chapter, we've built a comprehensive multi-provider AI integration system. Let's recap the key concepts:

### Architecture Components

1. **BaseAIProvider** - Abstract base class providing:
   - Consistent interface across all providers
   - Automatic health monitoring
   - Metrics collection and cost tracking
   - Event-driven architecture

2. **Provider Implementations** - Concrete providers for:
   - **Ollama**: Free local inference, best for privacy and simple tasks
   - **OpenAI**: Industry standard, balanced quality/cost
   - **Anthropic**: Best quality for complex coding tasks
   - **Google**: Multi-modal support, competitive pricing

3. **ProviderManager** - Centralized management:
   - Secure credential storage (AES-256-GCM)
   - Usage tracking with daily/monthly aggregation
   - Budget enforcement with configurable alerts
   - Provider lifecycle management

4. **IntelligentRouter** - Smart routing with:
   - 4 built-in strategies (cost, quality, performance, balanced)
   - Automatic fallback chains
   - Circuit breaker pattern for reliability
   - Extensible strategy system

5. **ResponseFusion** - Consensus building:
   - Majority voting for agreement
   - Weighted consensus for quality-weighted decisions
   - Levenshtein distance for similarity
   - Confidence scoring

### Key Benefits

✅ **Cost Optimization**: 85% cost reduction using intelligent routing
✅ **Reliability**: Circuit breakers and automatic fallbacks
✅ **Quality**: Response fusion for critical decisions
✅ **Security**: Encrypted credential storage
✅ **Observability**: Comprehensive metrics and health monitoring
✅ **Extensibility**: Easy to add new providers and strategies

### Design Patterns Used

- **Abstract Factory**: BaseAIProvider for provider creation
- **Strategy Pattern**: Pluggable routing strategies
- **Circuit Breaker**: Prevent cascading failures
- **Observer Pattern**: Event-driven monitoring
- **Template Method**: Shared provider functionality

### When to Use What

| Scenario | Approach | Why |
|----------|----------|-----|
| Simple commit messages | Cost strategy → Ollama | Free, fast, good enough |
| Code explanation | Balanced strategy | Good quality, reasonable cost |
| Complex refactoring | Quality strategy → Claude | Best quality for coding |
| Quick answers | Performance strategy → Local | Lowest latency |
| Security analysis | Response fusion (3 providers) | High confidence needed |
| Batch processing | Cost strategy with limits | Keep costs under control |

### Common Pitfalls to Avoid

⚠️ **Don't**: Use GPT-4 for everything (expensive)
⚠️ **Don't**: Ignore health monitoring (silent failures)
⚠️ **Don't**: Store credentials in plaintext (security risk)
⚠️ **Don't**: Skip budget limits (cost overruns)
⚠️ **Don't**: Use fusion for simple tasks (3x cost)

### Production Checklist

Before deploying to production:

- [ ] All provider credentials encrypted and stored securely
- [ ] Budget limits configured for each provider
- [ ] Health monitoring active with alerts
- [ ] Circuit breakers configured appropriately
- [ ] Routing strategy matches use case
- [ ] Event listeners set up for observability
- [ ] Cost tracking enabled and analyzed
- [ ] Fallback chains tested
- [ ] Error handling comprehensive
- [ ] Logging sanitized (no credential leaks)

---

## Exercises

Now it's time to apply what you've learned with hands-on exercises.

### Exercise 1: Implement a Custom Provider (60 minutes)

**Goal**: Create a provider for a new AI service

**Task**: Implement a provider for Mistral AI (https://mistral.ai)

**Requirements**:
1. Extend `BaseAIProvider`
2. Implement all abstract methods
3. Add proper error handling
4. Include cost calculation
5. Support streaming

**Starter Code**:

```typescript
import { BaseAIProvider, ProviderConfig, AICompletionResponse } from '../base-provider';
import Mistral from '@mistralai/mistralai';

export class MistralProvider extends BaseAIProvider {
  private client: Mistral;
  private defaultModel: string;

  constructor(config: ProviderConfig & { defaultModel?: string }) {
    super(config);
    // TODO: Initialize Mistral client
  }

  getName(): string {
    return 'mistral';
  }

  async initialize(): Promise<void> {
    // TODO: Initialize and test connection
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<AICompletionResponse> {
    // TODO: Implement completion
  }

  async completeStream(
    prompt: string,
    options: CompletionOptions,
    onEvent: StreamCallback
  ): Promise<void> {
    // TODO: Implement streaming
  }

  async listModels(): Promise<AIModel[]> {
    // TODO: List available models
  }

  calculateCost(promptTokens: number, completionTokens: number, model?: string): number {
    // TODO: Calculate cost based on Mistral pricing
    // Mistral pricing: https://mistral.ai/technology/#pricing
    const PRICING = {
      'mistral-small-latest': { prompt: 1.00, completion: 3.00 },
      'mistral-medium-latest': { prompt: 2.70, completion: 8.10 },
      'mistral-large-latest': { prompt: 8.00, completion: 24.00 }
    };

    // TODO: Implement calculation
    return 0;
  }

  async testConnection(): Promise<boolean> {
    // TODO: Test connection
    return false;
  }
}
```

**Solution**: See `book/exercises/chapter-02/exercise-01-solution.ts`

---

### Exercise 2: Custom Routing Strategy (90 minutes)

**Goal**: Implement a routing strategy that optimizes for carbon emissions

**Background**: Different providers have different carbon footprints:
- Local (Ollama): Minimal emissions
- Cloud providers: Vary by data center location

**Task**: Create a `CarbonOptimizedStrategy` that:
1. Prioritizes local providers
2. Considers data center locations for cloud providers
3. Balances emissions with quality requirements

**Starter Code**:

```typescript
import { RoutingStrategy, RoutingContext, RoutingDecision, BaseAIProvider } from '../router';

export class CarbonOptimizedStrategy implements RoutingStrategy {
  // Carbon intensity by provider/region (gCO2e per kWh)
  private carbonIntensity: Record<string, number> = {
    'ollama-local': 0,      // Local = minimal
    'openai-main': 350,     // US average
    'anthropic-main': 350,  // US average
    'google-main': 200      // Google uses more renewables
  };

  getName(): string {
    return 'carbon-optimized';
  }

  async selectProvider(
    context: RoutingContext,
    availableProviders: Map<string, BaseAIProvider>
  ): Promise<RoutingDecision> {
    // TODO: Implement carbon-aware routing
    // Hints:
    // 1. Filter healthy providers
    // 2. Estimate energy consumption based on model size
    // 3. Calculate carbon emissions = energy * carbon intensity
    // 4. Balance emissions with quality requirements
    // 5. Return lowest-carbon option that meets quality needs

    throw new Error('Not implemented');
  }

  private estimateEnergyConsumption(
    provider: BaseAIProvider,
    model: string,
    tokens: number
  ): number {
    // TODO: Estimate energy in kWh
    // Factors: model size, token count, provider efficiency
    return 0;
  }
}
```

**Bonus**: Track and log carbon savings compared to always using cloud providers

**Solution**: See `book/exercises/chapter-02/exercise-02-solution.ts`

---

### Exercise 3: Response Fusion with Confidence Scoring (120 minutes)

**Goal**: Enhance response fusion with semantic similarity

**Background**: Current fusion uses Levenshtein distance (character-level). For better accuracy, use semantic similarity with embeddings.

**Task**: Implement `SemanticFusion` that:
1. Gets embeddings for each response
2. Groups responses by semantic similarity
3. Uses cosine similarity instead of Levenshtein
4. Weights by both similarity and provider quality

**Starter Code**:

```typescript
import { FusionResponse } from '../response-fusion';

export class SemanticFusion {
  constructor(
    private router: IntelligentRouter,
    private embeddingProvider: BaseAIProvider, // Provider with embedding support
    private logger: Logger
  ) {}

  async fuse(
    prompt: string,
    options: {
      providerIds?: string[];
      minAgreement?: number;
    } = {}
  ): Promise<FusionResponse> {
    // TODO: Implement semantic fusion
    // Steps:
    // 1. Get responses from all providers
    // 2. Generate embeddings for each response
    // 3. Calculate cosine similarity matrix
    // 4. Cluster responses by similarity
    // 5. Find majority cluster
    // 6. Return highest quality response from majority cluster

    throw new Error('Not implemented');
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // TODO: Get embedding vector for text
    // Use OpenAI embeddings API or similar
    return [];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    // TODO: Calculate cosine similarity between two vectors
    // Formula: dot(a, b) / (norm(a) * norm(b))
    return 0;
  }

  private clusterBySimilarity(
    responses: Array<{ response: string; embedding: number[] }>,
    threshold: number = 0.85
  ): Array<Array<any>> {
    // TODO: Cluster responses by semantic similarity
    return [];
  }
}
```

**Solution**: See `book/exercises/chapter-02/exercise-03-solution.ts`

---

### Exercise 4: Budget Optimizer (90 minutes)

**Goal**: Implement automatic budget reallocation

**Scenario**: You have a monthly budget of $500 across all providers. The budget optimizer should:
1. Monitor usage patterns
2. Identify underutilized providers
3. Reallocate budget to overutilized providers
4. Maintain minimum reserves for each provider

**Task**: Create `BudgetOptimizer` class

**Requirements**:
- Analyze usage trends (daily, weekly, monthly)
- Predict future usage
- Suggest budget reallocations
- Auto-adjust if enabled
- Respect minimum budgets per provider

**Starter Code**:

```typescript
export class BudgetOptimizer {
  constructor(
    private providerManager: ProviderManager,
    private logger: Logger
  ) {}

  /**
   * Analyze current budget allocation efficiency
   */
  analyzeBudgetEfficiency(): BudgetAnalysis {
    // TODO: Analyze usage vs allocated budget
    // Return: efficiency score, recommendations
    throw new Error('Not implemented');
  }

  /**
   * Suggest budget reallocation
   */
  suggestReallocation(
    totalBudget: number,
    constraints: {
      minPerProvider: number;
      maxPerProvider: number;
    }
  ): Record<string, { daily: number; monthly: number }> {
    // TODO: Suggest optimal budget distribution
    // Based on: usage patterns, cost per provider, success rates
    throw new Error('Not implemented');
  }

  /**
   * Auto-adjust budgets (if enabled)
   */
  async autoAdjust(enabled: boolean = false): Promise<void> {
    // TODO: Automatically adjust budgets based on usage
    if (!enabled) {
      this.logger.info('Auto-adjust disabled, skipping');
      return;
    }

    // TODO: Implement auto-adjustment logic
  }

  private predictUsage(providerId: string, days: number): number {
    // TODO: Predict future usage based on historical data
    // Use simple moving average or linear regression
    return 0;
  }
}

interface BudgetAnalysis {
  efficiency: number; // 0-1 score
  underutilized: string[];
  overutilized: string[];
  recommendations: string[];
  projectedSpend: Record<string, number>;
}
```

**Solution**: See `book/exercises/chapter-02/exercise-04-solution.ts`

---

### Exercise 5: Multi-Provider Performance Testing (120 minutes)

**Goal**: Build a comprehensive performance testing framework

**Task**: Create a test suite that benchmarks:
1. Response time by provider
2. Cost per task type
3. Quality (subjective, requires test cases)
4. Reliability (error rates, retries)

**Requirements**:
- Test across multiple task types (simple, medium, complex)
- Run each test 10+ times for statistical significance
- Generate comparison reports
- Identify optimal provider for each task type

**Starter Code**:

```typescript
export class ProviderBenchmark {
  constructor(private service: MultiProviderAIService) {}

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmark(): Promise<BenchmarkReport> {
    const results: BenchmarkResult[] = [];

    // Test cases
    const testCases = [
      {
        type: 'simple',
        prompt: 'Generate a commit message for bug fix',
        expectedTokens: 50
      },
      {
        type: 'medium',
        prompt: 'Explain this authentication flow',
        expectedTokens: 500
      },
      {
        type: 'complex',
        prompt: 'Refactor this legacy system to use microservices',
        expectedTokens: 2000
      }
    ];

    // TODO: For each test case:
    // 1. Run with each provider (10 times)
    // 2. Measure: response time, cost, tokens
    // 3. Calculate: avg, min, max, stddev
    // 4. Compare results

    return {
      results,
      summary: this.generateSummary(results),
      recommendations: this.generateRecommendations(results)
    };
  }

  private async runSingleTest(
    testCase: TestCase,
    providerId: string,
    iterations: number = 10
  ): Promise<TestResult> {
    // TODO: Run test multiple times
    // Return aggregated results
    throw new Error('Not implemented');
  }

  private generateSummary(results: BenchmarkResult[]): BenchmarkSummary {
    // TODO: Generate summary statistics
    throw new Error('Not implemented');
  }

  private generateRecommendations(results: BenchmarkResult[]): string[] {
    // TODO: Analyze results and provide recommendations
    // e.g., "Use Ollama for simple tasks (3x faster, free)"
    return [];
  }
}

interface BenchmarkReport {
  results: BenchmarkResult[];
  summary: BenchmarkSummary;
  recommendations: string[];
}
```

**Bonus**: Visualize results with charts (response time vs cost, quality vs cost, etc.)

**Solution**: See `book/exercises/chapter-02/exercise-05-solution.ts`

---

## Chapter 2 Complete!

Congratulations! You now have a comprehensive understanding of multi-provider AI integration, including:

✅ Provider abstraction patterns
✅ Four production-ready provider implementations
✅ Secure credential management
✅ Intelligent routing strategies
✅ Response fusion for critical decisions
✅ Cost tracking and budget enforcement
✅ Circuit breakers and health monitoring
✅ Production deployment best practices

### What's Next?

In **[Chapter 3: Dependency Injection for AI Systems →](chapter-03-dependency-injection.md)**, we'll explore how to manage the lifecycle of all these components using dependency injection, making the system testable, maintainable, and extensible.

**Key topics**:
- Container architecture
- Service registry patterns
- Circular dependency resolution
- Resource disposal (IDisposable)
- Testing with DI

---

**Chapter 2 Progress**: Complete ✅
- 2.1 Why Multi-Provider Support? ✅
- 2.2 Provider Abstraction Pattern ✅
- 2.3 Provider Implementations ✅
- 2.4 Provider Manager ✅
- 2.5 Intelligent Router ✅
- 2.6 Response Fusion ✅
- 2.7 Best Practices ✅
- 2.8 Real-World Integration ✅
- 2.9 Summary ✅
- Exercises (5) ✅

**Total**: ~4,700 lines | ~100-110 pages

---

*Continue to [Chapter 3: Dependency Injection for AI Systems →](chapter-03-dependency-injection.md)*
