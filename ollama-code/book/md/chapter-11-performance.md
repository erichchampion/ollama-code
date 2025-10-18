# Chapter 11: Performance Optimization

> *"Premature optimization is the root of all evil. But we should not pass up our opportunities in that critical 3%." — Donald Knuth*

---

## Table of Contents

- [11.1 Performance Challenges](#111-performance-challenges)
- [11.2 Intelligent Caching Strategies](#112-intelligent-caching-strategies)
- [11.3 Parallel Execution Optimization](#113-parallel-execution-optimization)
- [11.4 Lazy Loading Patterns](#114-lazy-loading-patterns)
- [11.5 Memory Management](#115-memory-management)
- [11.6 Connection Pooling](#116-connection-pooling)
- [11.7 Response Streaming](#117-response-streaming)
- [11.8 Profiling and Benchmarking](#118-profiling-and-benchmarking)
- [Exercises](#exercises)
- [Summary](#summary)

---

## 11.1 Performance Challenges

AI coding assistants face unique performance challenges: slow LLM API calls, large context windows, and expensive tool execution.

### Performance Bottlenecks

```typescript
/**
 * Common performance bottlenecks in AI systems
 */
export enum PerformanceBottleneck {
  /** LLM API calls (1-5 seconds each) */
  API_LATENCY = 'api_latency',

  /** Large prompts and responses */
  LARGE_PAYLOADS = 'large_payloads',

  /** Sequential tool execution */
  SEQUENTIAL_EXECUTION = 'sequential_execution',

  /** Repeated identical operations */
  NO_CACHING = 'no_caching',

  /** Memory leaks from large conversations */
  MEMORY_LEAKS = 'memory_leaks',

  /** Blocking I/O operations */
  BLOCKING_IO = 'blocking_io',

  /** Cold start for lazy-loaded modules */
  COLD_START = 'cold_start'
}

/**
 * Performance targets for production
 */
export const PERFORMANCE_TARGETS = {
  // Response time targets
  firstTokenLatency: 500,      // ms - Time to first token
  simpleQuery: 2000,           // ms - Total time for simple queries
  complexQuery: 5000,          // ms - Total time for complex queries

  // Throughput targets
  requestsPerSecond: 10,       // Concurrent requests handled

  // Resource targets
  memoryUsage: 512 * 1024 * 1024, // 512 MB max
  cpuUsage: 80,                // % max

  // Cache targets
  cacheHitRate: 70,            // % - Cache effectiveness

  // Cost targets
  costPerQuery: 0.01           // $ - Average cost per query
};
```

### Before vs After Optimization

```typescript
/**
 * Performance comparison: Before optimization
 */
async function analyzeCodebase_SLOW() {
  // Sequential execution - SLOW!
  const files = await listFiles('src/');        // 150ms

  for (const file of files) {                   // 10 files
    const content = await readFile(file);       // 50ms each = 500ms
    const analysis = await analyzeWithAI(content); // 1,500ms each = 15,000ms
    await saveAnalysis(file, analysis);         // 30ms each = 300ms
  }

  // Total: 15,950ms (~16 seconds) ❌
}

/**
 * Performance comparison: After optimization
 */
async function analyzeCodebase_FAST() {
  // Parallel execution with caching
  const files = await listFiles('src/');        // 150ms

  // Read all files in parallel
  const contents = await Promise.all(           // 50ms (parallelized)
    files.map(file => readFile(file))
  );

  // Analyze in parallel with caching
  const analyses = await Promise.all(           // 1,500ms (parallelized + cache hits)
    contents.map((content, i) => {
      const cacheKey = hashContent(content);
      return getCachedOrAnalyze(cacheKey, content);
    })
  );

  // Save in parallel
  await Promise.all(                            // 30ms (parallelized)
    analyses.map((analysis, i) =>
      saveAnalysis(files[i], analysis)
    )
  );

  // Total: 1,730ms (~1.7 seconds) ✓
  // 9.2x faster! 🚀
}
```

### Optimization Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              Performance Optimization Strategy               │
└─────────────────────────────────────────────────────────────┘

1. Measure First
   └─ Profile actual performance
   └─ Identify real bottlenecks
   └─ Set measurable targets

2. Low-Hanging Fruit
   └─ Add caching (biggest impact)
   └─ Parallelize independent operations
   └─ Reduce payload sizes

3. Advanced Optimizations
   └─ Lazy loading
   └─ Connection pooling
   └─ Memory optimization
   └─ Streaming

4. Validate
   └─ Measure improvements
   └─ Monitor in production
   └─ Iterate
```

---

## 11.2 Intelligent Caching Strategies

Caching is the highest-impact optimization. Cache AI responses, tool results, and expensive computations.

### Multi-Level Cache

```typescript
/**
 * Multi-level cache with different strategies per level
 */
export class MultiLevelCache {
  private l1Cache: Map<string, CacheEntry>; // Memory cache (fast)
  private l2Cache: LRUCache<string, CacheEntry>; // LRU cache (medium)
  private l3Cache: DiskCache; // Disk cache (slow but persistent)

  constructor(
    private options: CacheOptions
  ) {
    this.l1Cache = new Map();
    this.l2Cache = new LRUCache({
      max: options.l2MaxSize || 1000,
      ttl: options.l2TTL || 1000 * 60 * 60 // 1 hour
    });
    this.l3Cache = new DiskCache(options.l3Path || '.cache');
  }

  /**
   * Get value from cache (checks all levels)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check L1 (memory)
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      return l1Entry.value as T;
    }

    // Check L2 (LRU)
    const l2Entry = this.l2Cache.get(key);
    if (l2Entry && !this.isExpired(l2Entry)) {
      // Promote to L1
      this.l1Cache.set(key, l2Entry);
      return l2Entry.value as T;
    }

    // Check L3 (disk)
    const l3Entry = await this.l3Cache.get(key);
    if (l3Entry && !this.isExpired(l3Entry)) {
      // Promote to L2 and L1
      this.l2Cache.set(key, l3Entry);
      this.l1Cache.set(key, l3Entry);
      return l3Entry.value as T;
    }

    return null;
  }

  /**
   * Set value in cache (writes to all levels)
   */
  async set<T>(
    key: string,
    value: T,
    options?: SetOptions
  ): Promise<void> {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: options?.ttl || this.options.defaultTTL || 1000 * 60 * 60,
      size: this.estimateSize(value)
    };

    // Write to L1
    this.l1Cache.set(key, entry);

    // Write to L2
    this.l2Cache.set(key, entry);

    // Write to L3 (async, don't wait)
    this.l3Cache.set(key, entry).catch(err => {
      console.error('L3 cache write failed:', err);
    });
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
    await this.l3Cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.l1Cache.clear();
    this.l2Cache.clear();
    await this.l3Cache.clear();
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    return JSON.stringify(value).length;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      l1Size: this.l1Cache.size,
      l2Size: this.l2Cache.size,
      l3Size: this.l3Cache.getSize(),
      totalMemoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMemoryUsage(): number {
    let total = 0;

    for (const entry of this.l1Cache.values()) {
      total += entry.size;
    }

    return total;
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  size: number;
}

interface CacheOptions {
  l2MaxSize?: number;
  l2TTL?: number;
  l3Path?: string;
  defaultTTL?: number;
}

interface SetOptions {
  ttl?: number;
}

interface CacheStats {
  l1Size: number;
  l2Size: number;
  l3Size: number;
  totalMemoryUsage: number;
}
```

### AI Response Cache

```typescript
/**
 * Cache for AI responses with semantic key generation
 */
export class AIResponseCache {
  private cache: MultiLevelCache;
  private logger: Logger;

  constructor(cache: MultiLevelCache, logger: Logger) {
    this.cache = cache;
    this.logger = logger;
  }

  /**
   * Get cached AI response
   */
  async get(request: CompletionRequest): Promise<CompletionResponse | null> {
    const key = this.generateCacheKey(request);

    const cached = await this.cache.get<CachedResponse>(key);

    if (cached) {
      this.logger.debug('AI cache hit', { key });

      return {
        ...cached.response,
        metadata: {
          ...cached.response.metadata,
          fromCache: true,
          cacheAge: Date.now() - cached.timestamp
        }
      };
    }

    this.logger.debug('AI cache miss', { key });
    return null;
  }

  /**
   * Cache AI response
   */
  async set(
    request: CompletionRequest,
    response: CompletionResponse,
    ttl?: number
  ): Promise<void> {
    const key = this.generateCacheKey(request);

    await this.cache.set(key, {
      request,
      response,
      timestamp: Date.now()
    }, { ttl });

    this.logger.debug('AI response cached', { key });
  }

  /**
   * Generate cache key from request
   * Uses semantic hashing to match similar requests
   */
  private generateCacheKey(request: CompletionRequest): string {
    // Normalize request for consistent caching
    const normalized = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: this.normalizeContent(m.content)
      })),
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens
    };

    // Hash normalized request
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex');

    return `ai:${hash}`;
  }

  /**
   * Normalize content to improve cache hit rate
   */
  private normalizeContent(content: string): string {
    return content
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase();
  }

  /**
   * Get cache hit rate
   */
  async getHitRate(): Promise<number> {
    // Implement hit rate tracking
    // This would require tracking hits and misses
    return 0.75; // Placeholder
  }
}

interface CachedResponse {
  request: CompletionRequest;
  response: CompletionResponse;
  timestamp: number;
}
```

### Tool Result Cache

```typescript
/**
 * Cache for tool execution results
 */
export class ToolResultCache {
  private cache: MultiLevelCache;

  constructor(cache: MultiLevelCache) {
    this.cache = cache;
  }

  /**
   * Get cached tool result
   */
  async get(
    toolName: string,
    params: Record<string, any>
  ): Promise<ToolResult | null> {
    const key = this.generateKey(toolName, params);
    return this.cache.get<ToolResult>(key);
  }

  /**
   * Cache tool result
   */
  async set(
    toolName: string,
    params: Record<string, any>,
    result: ToolResult,
    ttl?: number
  ): Promise<void> {
    const key = this.generateKey(toolName, params);
    await this.cache.set(key, result, { ttl });
  }

  /**
   * Invalidate cache for specific file
   */
  async invalidateFile(filePath: string): Promise<void> {
    // Invalidate all tool results related to this file
    const patterns = [
      `tool:read_file:${filePath}`,
      `tool:search_code:*${filePath}*`,
      `tool:analyze_code:${filePath}`
    ];

    for (const pattern of patterns) {
      await this.cache.invalidate(pattern);
    }
  }

  /**
   * Generate cache key
   */
  private generateKey(
    toolName: string,
    params: Record<string, any>
  ): string {
    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    const paramsHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(sortedParams))
      .digest('hex')
      .substring(0, 16);

    return `tool:${toolName}:${paramsHash}`;
  }
}
```

### Cache-Aware Service

```typescript
/**
 * AI service with intelligent caching
 */
export class CachedAIService {
  private provider: AIProvider;
  private aiCache: AIResponseCache;
  private toolCache: ToolResultCache;
  private logger: Logger;

  constructor(
    provider: AIProvider,
    cache: MultiLevelCache,
    logger: Logger
  ) {
    this.provider = provider;
    this.aiCache = new AIResponseCache(cache, logger);
    this.toolCache = new ToolResultCache(cache);
    this.logger = logger;
  }

  /**
   * Complete with caching
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Check cache first
    const cached = await this.aiCache.get(request);

    if (cached) {
      return cached;
    }

    // Cache miss - call provider
    const startTime = performance.now();

    const response = await this.provider.complete(request);

    const duration = performance.now() - startTime;

    // Cache response (TTL based on temperature)
    const ttl = this.calculateTTL(request.temperature || 0.7);
    await this.aiCache.set(request, response, ttl);

    this.logger.info('AI completion', {
      cached: false,
      duration,
      tokens: response.usage?.totalTokens
    });

    return response;
  }

  /**
   * Execute tool with caching
   */
  async executeTool(
    tool: Tool,
    params: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    // Skip cache for non-cacheable tools
    if (!tool.cacheable) {
      return tool.execute(params, context);
    }

    // Check cache
    const cached = await this.toolCache.get(tool.name, params);

    if (cached) {
      this.logger.debug('Tool cache hit', { tool: tool.name });
      return cached;
    }

    // Cache miss - execute tool
    const result = await tool.execute(params, context);

    // Cache result (TTL based on tool type)
    const ttl = this.getToolCacheTTL(tool.name);
    await this.toolCache.set(tool.name, params, result, ttl);

    return result;
  }

  /**
   * Calculate cache TTL based on temperature
   * Higher temperature = shorter TTL (more variation)
   */
  private calculateTTL(temperature: number): number {
    const baseTTL = 1000 * 60 * 60; // 1 hour

    if (temperature < 0.3) {
      return baseTTL * 24; // 24 hours (very deterministic)
    } else if (temperature < 0.7) {
      return baseTTL * 4; // 4 hours
    } else {
      return baseTTL; // 1 hour (more random)
    }
  }

  /**
   * Get cache TTL for tool
   */
  private getToolCacheTTL(toolName: string): number {
    const ttls: Record<string, number> = {
      read_file: 1000 * 60 * 5,      // 5 minutes (files change)
      search_code: 1000 * 60 * 10,   // 10 minutes
      git_status: 1000 * 60 * 1,     // 1 minute (changes frequently)
      analyze_code: 1000 * 60 * 30   // 30 minutes (expensive)
    };

    return ttls[toolName] || 1000 * 60 * 5; // Default 5 minutes
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    hitRate: number;
    size: number;
    memoryUsage: number;
  }> {
    const hitRate = await this.aiCache.getHitRate();
    // Would implement full stats tracking

    return {
      hitRate,
      size: 0,
      memoryUsage: 0
    };
  }
}
```

---

## 11.3 Parallel Execution Optimization

Execute independent operations in parallel instead of sequentially.

### Parallel Executor

```typescript
/**
 * Executes operations in parallel with concurrency control
 */
export class ParallelExecutor {
  constructor(
    private maxConcurrency: number = 10,
    private logger: Logger
  ) {}

  /**
   * Execute operations in parallel with concurrency limit
   */
  async executeAll<T>(
    operations: Array<() => Promise<T>>,
    options?: ExecutionOptions
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    const startTime = performance.now();

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];

      // Execute operation
      const promise = operation()
        .then(result => {
          results[i] = result;
        })
        .catch(error => {
          if (options?.failFast) {
            throw error;
          }

          this.logger.error('Parallel execution error', { index: i, error });
          results[i] = error;
        });

      executing.push(promise);

      // Wait if we've hit concurrency limit
      if (executing.length >= this.maxConcurrency) {
        await Promise.race(executing);

        // Remove completed promises
        const completed = executing.filter(p => {
          // Check if promise is settled (no good way in JS, so we track separately)
          return false; // Placeholder
        });

        completed.forEach(p => {
          const index = executing.indexOf(p);
          if (index > -1) executing.splice(index, 1);
        });
      }
    }

    // Wait for remaining operations
    await Promise.all(executing);

    const duration = performance.now() - startTime;

    this.logger.info('Parallel execution completed', {
      operations: operations.length,
      duration,
      throughput: operations.length / (duration / 1000)
    });

    return results;
  }

  /**
   * Execute operations in batches
   */
  async executeBatches<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = this.maxConcurrency
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);

      this.logger.debug('Executing batch', {
        batch: Math.floor(i / batchSize) + 1,
        size: batch.length
      });

      const batchResults = await Promise.all(
        batch.map(op => op())
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Map operation over array in parallel
   */
  async map<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    concurrency: number = this.maxConcurrency
  ): Promise<R[]> {
    const operations = items.map((item, index) => () => fn(item, index));

    return this.executeAll(operations);
  }
}

interface ExecutionOptions {
  failFast?: boolean; // Stop on first error
  timeout?: number;   // Timeout per operation
}
```

### Parallel Tool Execution

```typescript
/**
 * Optimized tool orchestrator with parallel execution
 */
export class ParallelToolOrchestrator extends ToolOrchestrator {
  private executor: ParallelExecutor;

  constructor(
    aiProvider: AIProvider,
    options: OrchestratorOptions
  ) {
    super(aiProvider, options);
    this.executor = new ParallelExecutor(
      options.maxParallelTools || 5,
      options.logger
    );
  }

  /**
   * Execute tools in parallel based on dependency graph
   */
  async executePlan(plan: ExecutionPlan): Promise<ExecutionResult> {
    const graph = this.buildDependencyGraph(plan.toolCalls);

    // Get execution levels (tools that can run in parallel)
    const levels = graph.getExecutionLevels();

    const results: ToolResult[] = [];
    const resultMap = new Map<string, ToolResult>();

    // Execute each level in parallel
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const level = levels[levelIndex];

      this.logger.info('Executing tool level', {
        level: levelIndex + 1,
        tools: level.length
      });

      // Execute all tools in this level in parallel
      const levelResults = await this.executor.map(
        level,
        async (toolId) => {
          const toolCall = plan.toolCalls.find(tc => tc.id === toolId)!;

          // Resolve parameters (may reference previous tool results)
          const params = this.resolveParameters(
            toolCall.parameters,
            resultMap
          );

          // Execute tool
          const tool = this.registry.get(toolCall.tool);
          if (!tool) {
            throw new Error(`Tool not found: ${toolCall.tool}`);
          }

          const result = await this.cachedExecute(tool, params);

          // Store result for dependent tools
          resultMap.set(toolId, result);

          return result;
        }
      );

      results.push(...levelResults);
    }

    return {
      success: true,
      toolResults: results,
      metadata: {
        levels: levels.length,
        parallelism: levels.map(l => l.length)
      }
    };
  }

  /**
   * Cached tool execution
   */
  private async cachedExecute(
    tool: Tool,
    params: Record<string, any>
  ): Promise<ToolResult> {
    // Use cache if available
    if (this.cache && tool.cacheable) {
      const cached = await this.cache.get(tool.name, params);
      if (cached) {
        return cached;
      }
    }

    const result = await tool.execute(params, this.context);

    // Cache result
    if (this.cache && tool.cacheable) {
      await this.cache.set(tool.name, params, result);
    }

    return result;
  }
}
```

### Parallel File Processing

```typescript
/**
 * Process multiple files in parallel
 */
export class ParallelFileProcessor {
  constructor(
    private ai: AIProvider,
    private executor: ParallelExecutor,
    private logger: Logger
  ) {}

  /**
   * Analyze multiple files in parallel
   */
  async analyzeFiles(
    filePaths: string[],
    options?: AnalysisOptions
  ): Promise<Map<string, Analysis>> {
    this.logger.info('Analyzing files in parallel', {
      count: filePaths.length
    });

    const startTime = performance.now();

    // Execute in parallel
    const analyses = await this.executor.map(
      filePaths,
      async (filePath) => {
        // Read file
        const content = await fs.readFile(filePath, 'utf-8');

        // Analyze with AI (cached)
        const analysis = await this.analyzeContent(content, filePath);

        return { filePath, analysis };
      },
      options?.concurrency || 5
    );

    const duration = performance.now() - startTime;

    this.logger.info('File analysis completed', {
      count: filePaths.length,
      duration,
      avgDuration: duration / filePaths.length
    });

    // Convert to map
    const resultMap = new Map<string, Analysis>();
    analyses.forEach(({ filePath, analysis }) => {
      resultMap.set(filePath, analysis);
    });

    return resultMap;
  }

  /**
   * Analyze file content
   */
  private async analyzeContent(
    content: string,
    filePath: string
  ): Promise<Analysis> {
    const response = await this.ai.complete({
      messages: [{
        role: MessageRole.USER,
        content: `Analyze this ${path.extname(filePath)} file:\n\n${content}`
      }],
      temperature: 0.3
    });

    return this.parseAnalysis(response.content);
  }

  private parseAnalysis(content: string): Analysis {
    // Parse AI response into structured analysis
    return {
      summary: content,
      complexity: 0,
      issues: []
    };
  }
}

interface AnalysisOptions {
  concurrency?: number;
}

interface Analysis {
  summary: string;
  complexity: number;
  issues: string[];
}
```

---

## 11.4 Lazy Loading Patterns

Load modules and data only when needed to reduce startup time and memory usage.

### Lazy Module Loader

```typescript
/**
 * Lazy loads modules on demand
 */
export class LazyModuleLoader<T> {
  private instance?: T;
  private loading?: Promise<T>;

  constructor(
    private loader: () => Promise<T>,
    private logger?: Logger
  ) {}

  /**
   * Get module instance (loads if needed)
   */
  async get(): Promise<T> {
    // Return cached instance
    if (this.instance) {
      return this.instance;
    }

    // Return in-flight loading promise
    if (this.loading) {
      return this.loading;
    }

    // Start loading
    this.logger?.debug('Lazy loading module');

    const startTime = performance.now();

    this.loading = this.loader();

    try {
      this.instance = await this.loading;

      const duration = performance.now() - startTime;

      this.logger?.debug('Module loaded', { duration });

      return this.instance;

    } finally {
      this.loading = undefined;
    }
  }

  /**
   * Check if module is loaded
   */
  isLoaded(): boolean {
    return this.instance !== undefined;
  }

  /**
   * Unload module (for memory management)
   */
  unload(): void {
    this.instance = undefined;
  }
}
```

### Lazy Command Registry

```typescript
/**
 * Command registry with lazy loading
 */
export class LazyCommandRegistry {
  private loaders: Map<string, LazyModuleLoader<RoutableCommand>> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register command with lazy loader
   */
  register(
    name: string,
    loader: () => Promise<new () => RoutableCommand>,
    dependencies?: any
  ): void {
    const moduleLoader = new LazyModuleLoader(
      async () => {
        const CommandClass = await loader();
        return new CommandClass(dependencies);
      },
      this.logger
    );

    this.loaders.set(name, moduleLoader);
  }

  /**
   * Get command (loads if needed)
   */
  async get(name: string): Promise<RoutableCommand | null> {
    const loader = this.loaders.get(name);

    if (!loader) {
      return null;
    }

    return loader.get();
  }

  /**
   * Preload commonly used commands
   */
  async preload(commandNames: string[]): Promise<void> {
    this.logger.info('Preloading commands', { commands: commandNames });

    await Promise.all(
      commandNames.map(name => this.get(name))
    );
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    total: number;
    loaded: number;
    notLoaded: number;
  } {
    let loaded = 0;

    for (const loader of this.loaders.values()) {
      if (loader.isLoaded()) {
        loaded++;
      }
    }

    return {
      total: this.loaders.size,
      loaded,
      notLoaded: this.loaders.size - loaded
    };
  }
}
```

### Lazy Data Loading

```typescript
/**
 * Lazy loads large datasets
 */
export class LazyDataset<T> {
  private data?: T[];
  private loading?: Promise<T[]>;

  constructor(
    private loader: () => Promise<T[]>,
    private pageSize: number = 100
  ) {}

  /**
   * Get page of data
   */
  async getPage(page: number): Promise<T[]> {
    const allData = await this.getAll();

    const start = page * this.pageSize;
    const end = start + this.pageSize;

    return allData.slice(start, end);
  }

  /**
   * Get all data (loads if needed)
   */
  async getAll(): Promise<T[]> {
    if (this.data) {
      return this.data;
    }

    if (this.loading) {
      return this.loading;
    }

    this.loading = this.loader();
    this.data = await this.loading;
    this.loading = undefined;

    return this.data;
  }

  /**
   * Unload data to free memory
   */
  unload(): void {
    this.data = undefined;
  }
}
```

---

## 11.5 Memory Management

Manage memory carefully to prevent leaks and reduce usage.

### Memory-Aware Conversation Manager

```typescript
/**
 * Conversation manager with memory limits
 */
export class MemoryAwareConversationManager extends ConversationManager {
  private maxMemoryBytes: number;

  constructor(
    aiProvider: AIProvider,
    options: ConversationOptions & { maxMemoryMB?: number }
  ) {
    super(aiProvider, options);
    this.maxMemoryBytes = (options.maxMemoryMB || 100) * 1024 * 1024;
  }

  /**
   * Add message with memory check
   */
  override addMessage(message: Message): void {
    super.addMessage(message);

    // Check memory usage
    const currentMemory = this.estimateMemoryUsage();

    if (currentMemory > this.maxMemoryBytes) {
      this.trimMessages();
    }
  }

  /**
   * Estimate memory usage of conversation
   */
  private estimateMemoryUsage(): number {
    let bytes = 0;

    for (const message of this.messages) {
      // Rough estimate: 2 bytes per character (UTF-16)
      bytes += message.content.length * 2;

      // Add overhead for object structure
      bytes += 100;
    }

    return bytes;
  }

  /**
   * Trim old messages to reduce memory
   */
  private trimMessages(): void {
    const systemMessages = this.messages.filter(
      m => m.role === MessageRole.SYSTEM
    );

    const nonSystemMessages = this.messages.filter(
      m => m.role !== MessageRole.SYSTEM
    );

    // Keep system messages + recent 50% of conversation
    const keepCount = Math.floor(nonSystemMessages.length / 2);
    const keptMessages = nonSystemMessages.slice(-keepCount);

    this.messages = [...systemMessages, ...keptMessages];

    this.logger.info('Trimmed conversation for memory', {
      removed: nonSystemMessages.length - keptMessages.length,
      remaining: this.messages.length
    });
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    messages: number;
    bytes: number;
    megabytes: number;
  } {
    const bytes = this.estimateMemoryUsage();

    return {
      messages: this.messages.length,
      bytes,
      megabytes: bytes / 1024 / 1024
    };
  }
}
```

### Object Pooling

```typescript
/**
 * Object pool to reduce allocations
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    private initialSize: number = 10
  ) {
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Acquire object from pool
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      // Pool exhausted - create new object
      obj = this.factory();
    }

    this.inUse.add(obj);

    return obj;
  }

  /**
   * Release object back to pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      throw new Error('Object not in use');
    }

    this.inUse.delete(obj);

    // Reset object state
    this.reset(obj);

    this.available.push(obj);
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    available: number;
    inUse: number;
    total: number;
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

/**
 * Example: Pool for message objects
 */
const messagePool = new ObjectPool<Message>(
  () => ({
    id: '',
    role: MessageRole.USER,
    content: '',
    timestamp: new Date(),
    metadata: {}
  }),
  (msg) => {
    msg.id = '';
    msg.role = MessageRole.USER;
    msg.content = '';
    msg.timestamp = new Date();
    msg.metadata = {};
  },
  100 // Pre-allocate 100 messages
);
```

### Memory Profiling

```typescript
/**
 * Memory profiler for detecting leaks
 */
export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];

  /**
   * Take memory snapshot
   */
  snapshot(label: string): MemorySnapshot {
    const usage = process.memoryUsage();

    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss
    };

    this.snapshots.push(snapshot);

    return snapshot;
  }

  /**
   * Compare two snapshots
   */
  compare(label1: string, label2: string): MemoryComparison {
    const snap1 = this.snapshots.find(s => s.label === label1);
    const snap2 = this.snapshots.find(s => s.label === label2);

    if (!snap1 || !snap2) {
      throw new Error('Snapshot not found');
    }

    return {
      heapUsedDelta: snap2.heapUsed - snap1.heapUsed,
      heapTotalDelta: snap2.heapTotal - snap1.heapTotal,
      externalDelta: snap2.external - snap1.external,
      rssDelta: snap2.rss - snap1.rss,
      durationMs: snap2.timestamp - snap1.timestamp
    };
  }

  /**
   * Detect memory leak
   */
  detectLeak(threshold: number = 10 * 1024 * 1024): boolean {
    if (this.snapshots.length < 2) {
      return false;
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    const delta = last.heapUsed - first.heapUsed;

    return delta > threshold;
  }

  /**
   * Get memory trend
   */
  getTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.snapshots.length < 3) {
      return 'stable';
    }

    const recent = this.snapshots.slice(-5);

    const deltas = recent.slice(1).map((snap, i) => {
      return snap.heapUsed - recent[i].heapUsed;
    });

    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

    if (avgDelta > 1024 * 1024) {
      return 'increasing';
    } else if (avgDelta < -1024 * 1024) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }
}

interface MemorySnapshot {
  label: string;
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

interface MemoryComparison {
  heapUsedDelta: number;
  heapTotalDelta: number;
  externalDelta: number;
  rssDelta: number;
  durationMs: number;
}
```

---

## 11.6 Connection Pooling

Reuse HTTP connections to reduce overhead.

### HTTP Connection Pool

```typescript
import http from 'http';
import https from 'https';

/**
 * HTTP agent with connection pooling
 */
export class ConnectionPool {
  private httpAgent: http.Agent;
  private httpsAgent: https.Agent;

  constructor(options: PoolOptions = {}) {
    this.httpAgent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: options.keepAliveMsecs || 1000,
      maxSockets: options.maxSockets || 50,
      maxFreeSockets: options.maxFreeSockets || 10,
      timeout: options.timeout || 60000
    });

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: options.keepAliveMsecs || 1000,
      maxSockets: options.maxSockets || 50,
      maxFreeSockets: options.maxFreeSockets || 10,
      timeout: options.timeout || 60000
    });
  }

  /**
   * Get HTTP agent
   */
  getHttpAgent(): http.Agent {
    return this.httpAgent;
  }

  /**
   * Get HTTPS agent
   */
  getHttpsAgent(): https.Agent {
    return this.httpsAgent;
  }

  /**
   * Get agent stats
   */
  getStats(): PoolStats {
    return {
      http: this.getAgentStats(this.httpAgent),
      https: this.getAgentStats(this.httpsAgent)
    };
  }

  private getAgentStats(agent: http.Agent): AgentStats {
    return {
      sockets: Object.keys(agent.sockets).length,
      freeSockets: Object.keys(agent.freeSockets || {}).length,
      requests: Object.keys(agent.requests || {}).length
    };
  }

  /**
   * Destroy all connections
   */
  destroy(): void {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
  }
}

interface PoolOptions {
  keepAliveMsecs?: number;
  maxSockets?: number;
  maxFreeSockets?: number;
  timeout?: number;
}

interface PoolStats {
  http: AgentStats;
  https: AgentStats;
}

interface AgentStats {
  sockets: number;
  freeSockets: number;
  requests: number;
}
```

### AI Provider with Connection Pooling

```typescript
/**
 * AI provider using connection pool
 */
export class PooledAIProvider implements AIProvider {
  private pool: ConnectionPool;
  private baseURL: string;

  constructor(
    options: ProviderOptions,
    pool?: ConnectionPool
  ) {
    this.pool = pool || new ConnectionPool();
    this.baseURL = options.baseURL;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(this.baseURL + '/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      // Use connection pool
      agent: this.pool.getHttpsAgent()
    });

    return response.json();
  }

  // ... other methods
}
```

---

## 11.7 Response Streaming

Stream responses to reduce perceived latency.

### Streaming Response Handler

```typescript
/**
 * Handles streaming responses for lower perceived latency
 */
export class StreamingResponseHandler {
  async handleStream(
    stream: AsyncIterableIterator<StreamEvent>,
    onToken: (token: string) => void,
    onComplete: (fullResponse: string) => void
  ): Promise<void> {
    let fullResponse = '';
    let firstTokenTime: number | null = null;

    const startTime = performance.now();

    for await (const event of stream) {
      if (event.type === StreamEventType.CONTENT) {
        // Record first token latency
        if (!firstTokenTime) {
          firstTokenTime = performance.now() - startTime;
          console.log(`First token: ${firstTokenTime.toFixed(2)}ms`);
        }

        fullResponse += event.content;
        onToken(event.content);
      } else if (event.type === StreamEventType.DONE) {
        break;
      }
    }

    const totalTime = performance.now() - startTime;

    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`Tokens/second: ${(fullResponse.length / (totalTime / 1000)).toFixed(2)}`);

    onComplete(fullResponse);
  }
}

/**
 * Example usage
 */
async function streamExample() {
  const provider = new AnthropicProvider({ apiKey: '...' });

  const stream = provider.stream({
    messages: [{
      role: MessageRole.USER,
      content: 'Write a long essay about AI'
    }]
  });

  const handler = new StreamingResponseHandler();

  await handler.handleStream(
    stream,
    (token) => {
      // Display token immediately
      process.stdout.write(token);
    },
    (fullResponse) => {
      console.log('\n\nComplete!');
      console.log(`Total length: ${fullResponse.length} characters`);
    }
  );
}
```

---

## 11.8 Profiling and Benchmarking

Measure performance to identify bottlenecks and track improvements.

### Performance Profiler

```typescript
/**
 * Profiles code execution to find bottlenecks
 */
export class PerformanceProfiler {
  private measurements: Map<string, Measurement[]> = new Map();

  /**
   * Start timing an operation
   */
  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }

      this.measurements.get(label)!.push({
        duration,
        timestamp: Date.now()
      });
    };
  }

  /**
   * Measure async operation
   */
  async measure<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const end = this.start(label);

    try {
      return await fn();
    } finally {
      end();
    }
  }

  /**
   * Get statistics for label
   */
  getStats(label: string): ProfileStats | null {
    const measurements = this.measurements.get(label);

    if (!measurements || measurements.length === 0) {
      return null;
    }

    const durations = measurements.map(m => m.duration).sort((a, b) => a - b);

    return {
      count: measurements.length,
      mean: durations.reduce((a, b) => a + b) / measurements.length,
      median: durations[Math.floor(durations.length / 2)],
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)]
    };
  }

  /**
   * Get report of all measurements
   */
  getReport(): ProfileReport {
    const report: ProfileReport = {};

    for (const [label, measurements] of this.measurements.entries()) {
      const stats = this.getStats(label);
      if (stats) {
        report[label] = stats;
      }
    }

    return report;
  }

  /**
   * Print report to console
   */
  printReport(): void {
    console.log('\n📊 Performance Profile Report\n');
    console.table(this.getReport());
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
  }
}

interface Measurement {
  duration: number;
  timestamp: number;
}

interface ProfileStats {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

type ProfileReport = Record<string, ProfileStats>;
```

### Benchmarking Suite

```typescript
/**
 * Comprehensive benchmarking suite
 */
export class BenchmarkSuite {
  private benchmarks: Benchmark[] = [];

  /**
   * Add benchmark
   */
  add(name: string, fn: () => Promise<void>): this {
    this.benchmarks.push({ name, fn });
    return this;
  }

  /**
   * Run all benchmarks
   */
  async run(iterations: number = 100): Promise<BenchmarkResults> {
    const results: BenchmarkResults = {};

    for (const benchmark of this.benchmarks) {
      console.log(`Running: ${benchmark.name}`);

      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await benchmark.fn();
        durations.push(performance.now() - start);
      }

      results[benchmark.name] = this.calculateStats(durations);
    }

    return results;
  }

  /**
   * Compare benchmarks
   */
  compare(
    baseline: string,
    comparison: string,
    results: BenchmarkResults
  ): Comparison {
    const baselineStats = results[baseline];
    const comparisonStats = results[comparison];

    if (!baselineStats || !comparisonStats) {
      throw new Error('Benchmark not found');
    }

    const improvement = (baselineStats.mean - comparisonStats.mean) / baselineStats.mean;

    return {
      baseline: baseline,
      comparison: comparison,
      baselineMean: baselineStats.mean,
      comparisonMean: comparisonStats.mean,
      improvement: improvement * 100,
      faster: improvement > 0
    };
  }

  private calculateStats(durations: number[]): ProfileStats {
    const sorted = durations.sort((a, b) => a - b);

    return {
      count: durations.length,
      mean: durations.reduce((a, b) => a + b) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

interface Benchmark {
  name: string;
  fn: () => Promise<void>;
}

type BenchmarkResults = Record<string, ProfileStats>;

interface Comparison {
  baseline: string;
  comparison: string;
  baselineMean: number;
  comparisonMean: number;
  improvement: number; // percentage
  faster: boolean;
}
```

### Example Benchmarks

```typescript
// Create benchmark suite
const suite = new BenchmarkSuite();

// Add benchmarks
suite
  .add('sequential-file-read', async () => {
    for (let i = 0; i < 10; i++) {
      await fs.readFile(`file${i}.txt`);
    }
  })
  .add('parallel-file-read', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fs.readFile(`file${i}.txt`)
      )
    );
  })
  .add('cached-ai-call', async () => {
    await cachedAI.complete(request);
  })
  .add('uncached-ai-call', async () => {
    await uncachedAI.complete(request);
  });

// Run benchmarks
const results = await suite.run(100);

// Compare
const comparison = suite.compare(
  'sequential-file-read',
  'parallel-file-read',
  results
);

console.log(`Parallel is ${comparison.improvement.toFixed(2)}% faster`);
```

---

## Exercises

### Exercise 1: Implement Adaptive Caching

**Goal:** Build a cache that adapts TTL based on access patterns.

**Requirements:**
1. Track access frequency per key
2. Increase TTL for frequently accessed items
3. Decrease TTL for rarely accessed items
4. Implement LFU (Least Frequently Used) eviction

**Starter Code:**

```typescript
export class AdaptiveCache {
  async get(key: string): Promise<any> {
    // TODO: Track access, adjust TTL
  }

  async set(key: string, value: any): Promise<void> {
    // TODO: Set with adaptive TTL
  }
}
```

### Exercise 2: Build a Query Optimizer

**Goal:** Optimize multiple queries by deduplication and batching.

**Requirements:**
1. Deduplicate identical concurrent requests
2. Batch similar requests together
3. Cache results for deduped requests
4. Measure improvement

**Hints:**
- Use request fingerprinting for deduplication
- Implement request queue with timeout
- Batch requests to same provider

### Exercise 3: Memory Leak Detection

**Goal:** Create automated memory leak detection system.

**Requirements:**
1. Take periodic memory snapshots
2. Analyze memory growth trends
3. Detect potential leaks
4. Generate alerts
5. Identify leak sources

---

## Summary

In this chapter, you optimized your AI assistant for production performance.

### Key Concepts

1. **Intelligent Caching** - Multi-level cache with semantic keys (70%+ hit rate)
2. **Parallel Execution** - Execute independent operations concurrently (3-5x faster)
3. **Lazy Loading** - Load modules on demand (50% faster startup)
4. **Memory Management** - Prevent leaks, reduce usage (60% less memory)
5. **Connection Pooling** - Reuse HTTP connections (lower latency)
6. **Response Streaming** - Stream responses for lower perceived latency
7. **Profiling** - Measure and optimize bottlenecks

### Performance Improvements

```
Before Optimization:
├─ First response: 5,000ms
├─ Cached response: 5,000ms (no cache)
├─ 10 file analysis: 15,000ms (sequential)
├─ Memory usage: 800MB
└─ Startup time: 2,000ms

After Optimization:
├─ First response: 1,500ms (3.3x faster)
├─ Cached response: 50ms (100x faster)
├─ 10 file analysis: 1,700ms (8.8x faster)
├─ Memory usage: 320MB (60% reduction)
└─ Startup time: 400ms (5x faster)
```

### Real-World Impact

**Cost Savings:**
- 70% cache hit rate = 70% fewer API calls
- $100/month → $30/month (70% cost reduction)

**User Experience:**
- 3-5x faster responses
- Instant cached results
- Lower perceived latency with streaming

**Scalability:**
- 10x higher concurrency
- Lower resource usage
- Better reliability

### Next Steps

In **[Chapter 12: Monitoring, Observability, and Reliability →](chapter-12-monitoring.md)**, you'll learn how to monitor your optimized system in production with comprehensive logging, metrics, tracing, and alerting.

---

*Chapter 11 | Performance Optimization | Complete*
