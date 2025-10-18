# Appendix A: API Reference

> *Complete API documentation for ollama-code components*

---

## Overview

This appendix provides a comprehensive API reference for all major interfaces, classes, and types used throughout the book. Use this as a quick lookup guide when implementing your own AI coding assistant.

**Organization:**
- AI Provider APIs
- Tool APIs
- Conversation APIs
- Plugin APIs
- Configuration APIs
- Utility APIs

---

## AI Provider APIs

### AIProvider Interface

Base interface for all AI providers.

```typescript
interface AIProvider {
  readonly name: string;
  readonly supportedModels: string[];

  // Core methods
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  streamComplete(request: CompletionRequest): AsyncGenerator<string>;

  // Model management
  listModels(): Promise<ModelInfo[]>;
  getModelInfo(modelId: string): Promise<ModelInfo>;

  // Health and metrics
  healthCheck(): Promise<HealthStatus>;
  getUsageStats(): UsageStats;

  // Lifecycle
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}
```

### CompletionRequest

```typescript
interface CompletionRequest {
  // Messages
  messages: Message[];

  // Model configuration
  model?: string;
  temperature?: number;        // 0.0 - 2.0, default: 0.7
  maxTokens?: number;          // Max output tokens
  topP?: number;               // Nucleus sampling, 0.0 - 1.0
  topK?: number;               // Top-K sampling

  // Stop sequences
  stopSequences?: string[];

  // Tools
  tools?: Tool[];
  toolChoice?: 'auto' | 'required' | 'none';

  // Streaming
  stream?: boolean;
}
```

### CompletionResponse

```typescript
interface CompletionResponse {
  // Response content
  content: string;
  role: MessageRole;

  // Model info
  model: string;

  // Token usage
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };

  // Tool calls (if applicable)
  toolCalls?: ToolCall[];

  // Metadata
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  metadata?: Record<string, any>;
}
```

### OllamaProvider

```typescript
class OllamaProvider implements AIProvider {
  constructor(config: OllamaConfig);

  // Configuration
  configure(config: Partial<OllamaConfig>): void;

  // Model pulling
  pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<void>;

  // Additional methods
  generateEmbeddings(text: string): Promise<number[]>;
}

interface OllamaConfig {
  baseUrl: string;             // Default: 'http://localhost:11434'
  model: string;               // e.g., 'codellama:7b'
  timeout?: number;            // Request timeout in ms
  keepAlive?: string;          // Keep model loaded, e.g., '5m'
}
```

### OpenAIProvider

```typescript
class OpenAIProvider implements AIProvider {
  constructor(config: OpenAIConfig);

  // Configuration
  configure(config: Partial<OpenAIConfig>): void;

  // Fine-tuning
  createFineTune(params: FineTuneParams): Promise<FineTuneJob>;

  // Embeddings
  createEmbeddings(input: string | string[]): Promise<number[][]>;
}

interface OpenAIConfig {
  apiKey: string;
  model: string;               // e.g., 'gpt-4-turbo'
  organization?: string;
  baseUrl?: string;            // For Azure OpenAI
  timeout?: number;
}
```

### AnthropicProvider

```typescript
class AnthropicProvider implements AIProvider {
  constructor(config: AnthropicConfig);

  // Configuration
  configure(config: Partial<AnthropicConfig>): void;
}

interface AnthropicConfig {
  apiKey: string;
  model: string;               // e.g., 'claude-3-opus-20240229'
  maxTokens?: number;
  timeout?: number;
}
```

---

## Tool APIs

### Tool Interface

```typescript
interface Tool {
  readonly metadata: ToolMetadata;

  // Execution
  execute(params: Record<string, any>): Promise<ToolResult>;

  // Validation
  validateParams(params: Record<string, any>): ValidationResult;

  // Lifecycle
  initialize?(): Promise<void>;
  dispose?(): Promise<void>;
}
```

### ToolMetadata

```typescript
interface ToolMetadata {
  name: string;
  description: string;
  category?: ToolCategory;

  // Parameter schema (JSON Schema)
  parameters: {
    type: 'object';
    properties: Record<string, ParameterSchema>;
    required?: string[];
  };

  // Dependencies
  dependencies?: string[];      // Other tool names

  // Execution hints
  async?: boolean;              // Can run asynchronously
  cacheable?: boolean;          // Results can be cached
  dangerous?: boolean;          // Requires approval

  // Examples
  examples?: ToolExample[];
}

type ToolCategory =
  | 'filesystem'
  | 'git'
  | 'code-analysis'
  | 'network'
  | 'database'
  | 'custom';

interface ToolExample {
  description: string;
  params: Record<string, any>;
  expectedResult?: any;
}
```

### ToolResult

```typescript
interface ToolResult {
  success: boolean;
  data?: any;
  error?: ToolError;
  metadata?: {
    executionTime?: number;
    cached?: boolean;
    fromCache?: boolean;
  };
}

interface ToolError {
  code: string;
  message: string;
  details?: any;
  recoverable?: boolean;
}
```

### ToolOrchestrator

```typescript
class ToolOrchestrator {
  constructor(config?: OrchestratorConfig);

  // Tool registration
  registerTool(tool: Tool): void;
  unregisterTool(toolName: string): void;
  getTool(toolName: string): Tool | undefined;
  getAvailableTools(): ToolMetadata[];

  // Execution
  executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]>;
  executeToolSequence(sequence: ToolCall[]): Promise<ToolResult[]>;
  executeToolsParallel(toolCalls: ToolCall[]): Promise<ToolResult[]>;

  // Dependency resolution
  resolveDependencies(toolNames: string[]): string[];

  // Approval system
  setApprovalHandler(handler: ApprovalHandler): void;

  // Cache management
  clearCache(): void;
  getCacheStats(): CacheStats;
}

interface OrchestratorConfig {
  maxConcurrency?: number;      // Max parallel tools
  cacheEnabled?: boolean;
  cacheTTL?: number;            // Cache time-to-live in ms
  approvalRequired?: boolean;
  timeout?: number;             // Per-tool timeout
}
```

---

## Conversation APIs

### ConversationManager

```typescript
class ConversationManager {
  constructor(config?: ConversationConfig);

  // Message management
  addMessage(message: Message): void;
  getMessages(): Message[];
  clearMessages(): void;

  // Context management
  getContext(maxTokens?: number): Message[];
  estimateTokens(messages: Message[]): number;

  // Persistence
  save(conversationId: string): Promise<void>;
  load(conversationId: string): Promise<void>;
  list(): Promise<ConversationInfo[]>;
  delete(conversationId: string): Promise<void>;

  // Search
  search(query: string): Promise<Message[]>;
}

interface ConversationConfig {
  maxTokens?: number;           // Max context window
  strategy?: ContextStrategy;   // Context retention strategy
  persistPath?: string;         // Where to save conversations
  autoSave?: boolean;
}

type ContextStrategy =
  | 'recent'                    // Keep recent messages
  | 'important'                 // Keep important messages
  | 'sliding-summary'           // Summarize old messages
  | 'relevant';                 // Keep relevant to current topic
```

### Message

```typescript
interface Message {
  role: MessageRole;
  content: string;

  // Optional fields
  name?: string;               // Function/tool name for tool messages
  toolCalls?: ToolCall[];      // For assistant messages with tool calls
  toolCallId?: string;         // For tool response messages

  // Metadata
  timestamp?: number;
  tokens?: number;
  importance?: number;         // 0-1, for importance-based retention
  metadata?: Record<string, any>;
}

type MessageRole =
  | 'system'
  | 'user'
  | 'assistant'
  | 'tool';
```

### ToolCall

```typescript
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;         // JSON string
  };
}
```

---

## Plugin APIs

### Plugin Interface

```typescript
interface Plugin {
  readonly metadata: PluginMetadata;

  // Lifecycle
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;

  // Optional hooks
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onUpdate?(oldVersion: string, newVersion: string): Promise<void>;
}
```

### PluginMetadata

```typescript
interface PluginMetadata {
  id: string;                  // Unique identifier
  name: string;
  version: string;             // SemVer
  description: string;
  author: string;

  // Dependencies
  dependencies?: {
    platform?: string;         // Platform version (SemVer range)
    plugins?: Record<string, string>; // Plugin dependencies
    node?: string;             // Node.js version
  };

  // Capabilities
  capabilities?: string[];

  // Repository
  repository?: {
    type: 'git' | 'npm';
    url: string;
  };

  // License
  license?: string;

  // Homepage
  homepage?: string;
}
```

### PluginContext

```typescript
interface PluginContext {
  // Extension points
  extensions: ExtensionRegistry;

  // Configuration
  config: PluginConfiguration;

  // Storage
  storage: PluginStorage;

  // Logging
  logger: Logger;

  // Events
  events: EventEmitter;
}

interface ExtensionRegistry {
  get<T>(extensionPoint: string): ExtensionPoint<T>;
}

interface ExtensionPoint<T> {
  register(extension: T): void;
  unregister(extension: T): void;
  getExtensions(): T[];
}
```

### PluginManager

```typescript
class PluginManager {
  // Loading
  load(plugin: Plugin): Promise<void>;
  unload(pluginId: string): Promise<void>;
  reload(pluginId: string): Promise<void>;

  // Discovery
  discover(source: PluginSource): Promise<Plugin[]>;

  // State
  getLoaded(): LoadedPlugin[];
  getPlugin(pluginId: string): LoadedPlugin | undefined;

  // Events
  on(event: PluginEvent, handler: EventHandler): void;
}

type PluginSource =
  | 'npm'
  | 'filesystem'
  | 'registry';

type PluginEvent =
  | 'loaded'
  | 'unloaded'
  | 'error';

interface LoadedPlugin {
  plugin: Plugin;
  context: PluginContext;
  state: PluginState;
}

type PluginState =
  | 'active'
  | 'inactive'
  | 'error';
```

---

## Configuration APIs

### Configuration

```typescript
interface Configuration {
  // AI Provider settings
  providers: {
    ollama?: OllamaConfig;
    openai?: OpenAIConfig;
    anthropic?: AnthropicConfig;
    google?: GoogleConfig;
  };

  // Default provider
  defaultProvider: string;

  // Tool settings
  tools: {
    maxConcurrency?: number;
    timeout?: number;
    approvalRequired?: boolean;
  };

  // Conversation settings
  conversation: {
    maxTokens?: number;
    strategy?: ContextStrategy;
    autoSave?: boolean;
  };

  // Plugin settings
  plugins: {
    enabled: string[];
    config: Record<string, any>;
  };

  // Security settings
  security: {
    sandboxEnabled?: boolean;
    allowedCommands?: string[];
    allowedPaths?: string[];
    maxFileSize?: number;
  };

  // Logging settings
  logging: {
    level?: LogLevel;
    format?: 'json' | 'text';
    destination?: 'console' | 'file';
    filePath?: string;
  };

  // Performance settings
  performance: {
    cacheEnabled?: boolean;
    cacheTTL?: number;
    maxCacheSize?: number;
  };
}

type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';
```

### ConfigurationManager

```typescript
class ConfigurationManager {
  // Loading
  load(path?: string): Promise<Configuration>;
  loadFromEnv(): Configuration;

  // Saving
  save(config: Configuration, path?: string): Promise<void>;

  // Access
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;

  // Validation
  validate(config: Configuration): ValidationResult;

  // Watching
  watch(callback: (config: Configuration) => void): void;
  unwatch(): void;
}
```

---

## Utility APIs

### Logger

```typescript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;

  // Structured logging
  log(level: LogLevel, message: string, metadata?: Record<string, any>): void;

  // Child loggers
  child(context: Record<string, any>): Logger;
}
```

### EventEmitter

```typescript
class EventEmitter {
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  once(event: string, handler: EventHandler): void;
  emit(event: string, ...args: any[]): void;
  removeAllListeners(event?: string): void;
}

type EventHandler = (...args: any[]) => void;
```

### Cache

```typescript
interface Cache<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;

  // Statistics
  getStats(): CacheStats;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}
```

### Disposable

```typescript
interface IDisposable {
  dispose(): void | Promise<void>;
}

class DisposableStore {
  add(disposable: IDisposable): void;
  dispose(): Promise<void>;
}
```

---

## Type Definitions

### Common Types

```typescript
// Health status
interface HealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: number;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
}

// Usage statistics
interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;

  // Breakdown
  requestsByModel: Record<string, number>;
  tokensByModel: Record<string, number>;
  costByModel: Record<string, number>;

  // Time range
  startTime: number;
  endTime: number;
}

// Model information
interface ModelInfo {
  id: string;
  name: string;
  provider: string;

  // Capabilities
  capabilities: {
    completion: boolean;
    streaming: boolean;
    tools: boolean;
    vision: boolean;
  };

  // Context
  contextWindow: number;
  maxOutputTokens: number;

  // Pricing
  pricing?: {
    input: number;            // Per 1M tokens
    output: number;           // Per 1M tokens
  };
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
}

// Conversation info
interface ConversationInfo {
  id: string;
  title?: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  preview?: string;
}
```

---

## Error Types

### AIProviderError

```typescript
class AIProviderError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public provider: string,
    public details?: any
  );
}

type AIErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INVALID_REQUEST'
  | 'MODEL_NOT_FOUND'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'CONTENT_FILTER'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';
```

### ToolError

```typescript
class ToolError extends Error {
  constructor(
    message: string,
    public code: ToolErrorCode,
    public toolName: string,
    public recoverable: boolean = false
  );
}

type ToolErrorCode =
  | 'VALIDATION_ERROR'
  | 'EXECUTION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'TIMEOUT'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND';
```

### PluginError

```typescript
class PluginError extends Error {
  constructor(
    message: string,
    public code: PluginErrorCode,
    public pluginId: string
  );
}

type PluginErrorCode =
  | 'ACTIVATION_ERROR'
  | 'DEACTIVATION_ERROR'
  | 'DEPENDENCY_ERROR'
  | 'VERSION_MISMATCH'
  | 'INVALID_PLUGIN';
```

---

## Constants

### Token Limits

```typescript
const TOKEN_LIMITS = {
  // Ollama models
  'codellama:7b': 4096,
  'codellama:13b': 4096,
  'codellama:34b': 8192,
  'llama2:7b': 4096,
  'llama2:13b': 4096,
  'mistral:7b': 8192,

  // OpenAI models
  'gpt-3.5-turbo': 16385,
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-turbo': 128000,

  // Anthropic models
  'claude-3-haiku': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-opus': 200000,

  // Google models
  'gemini-1.0-pro': 32760,
  'gemini-1.5-pro': 1000000,
};
```

### Default Values

```typescript
const DEFAULTS = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
  TOP_P: 1.0,
  TOP_K: 40,

  CACHE_TTL: 5 * 60 * 1000,     // 5 minutes
  REQUEST_TIMEOUT: 30 * 1000,    // 30 seconds
  MAX_CONCURRENCY: 5,

  LOG_LEVEL: 'info' as LogLevel,

  CONVERSATION_MAX_TOKENS: 8000,
  CONVERSATION_STRATEGY: 'recent' as ContextStrategy,
};
```

---

## Usage Examples

### Creating an AI Provider

```typescript
import { OllamaProvider, OpenAIProvider } from 'ollama-code';

// Ollama provider
const ollama = new OllamaProvider({
  baseUrl: 'http://localhost:11434',
  model: 'codellama:7b'
});

// OpenAI provider
const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4-turbo'
});

// Use provider
const response = await ollama.complete({
  messages: [
    { role: 'user', content: 'Explain async/await in JavaScript' }
  ],
  temperature: 0.3
});

console.log(response.content);
```

### Creating a Custom Tool

```typescript
import { Tool, ToolMetadata, ToolResult } from 'ollama-code';

class CustomSearchTool implements Tool {
  readonly metadata: ToolMetadata = {
    name: 'custom-search',
    description: 'Search custom documentation',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        }
      },
      required: ['query']
    }
  };

  async execute(params: { query: string }): Promise<ToolResult> {
    // Implementation
    const results = await this.search(params.query);

    return {
      success: true,
      data: results
    };
  }

  validateParams(params: any): ValidationResult {
    if (!params.query || typeof params.query !== 'string') {
      return {
        valid: false,
        errors: [{
          field: 'query',
          message: 'Query must be a string',
          code: 'INVALID_TYPE'
        }],
        warnings: []
      };
    }

    return { valid: true, errors: [], warnings: [] };
  }

  private async search(query: string) {
    // Search implementation
    return [];
  }
}
```

### Creating a Plugin

```typescript
import { Plugin, PluginMetadata, PluginContext } from 'ollama-code';

class MyPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    id: 'my-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    description: 'Custom plugin example',
    author: 'Your Name',
    dependencies: {
      platform: '^1.0.0'
    }
  };

  async activate(context: PluginContext): Promise<void> {
    // Register tools
    const toolExtensions = context.extensions.get('tools');
    toolExtensions.register(new CustomSearchTool());

    // Register commands
    const commandExtensions = context.extensions.get('commands');
    // ...

    // Listen to events
    context.events.on('completion:started', () => {
      context.logger.info('Completion started');
    });
  }

  async deactivate(): Promise<void> {
    // Cleanup
  }
}
```

---

## Migration Guide

### From v0.x to v1.x

**Breaking Changes:**

1. **AIProvider interface** - `complete()` now returns `CompletionResponse` instead of `string`
   ```typescript
   // Before (v0.x)
   const result = await provider.complete(prompt);
   console.log(result);

   // After (v1.x)
   const response = await provider.complete({ messages: [{ role: 'user', content: prompt }] });
   console.log(response.content);
   ```

2. **Tool execution** - Results now wrapped in `ToolResult`
   ```typescript
   // Before (v0.x)
   const data = await tool.execute(params);

   // After (v1.x)
   const result = await tool.execute(params);
   if (result.success) {
     const data = result.data;
   }
   ```

3. **Configuration** - Flat config to nested structure
   ```typescript
   // Before (v0.x)
   {
     ollamaUrl: 'http://localhost:11434',
     ollamaModel: 'codellama:7b'
   }

   // After (v1.x)
   {
     providers: {
       ollama: {
         baseUrl: 'http://localhost:11434',
         model: 'codellama:7b'
       }
     }
   }
   ```

---

*Appendix A | API Reference | 10-15 pages*
