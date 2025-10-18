# Chapter 12: Monitoring, Observability, and Reliability

> *"You can't improve what you can't measure." — Peter Drucker*

---

## Table of Contents

- [12.1 Observability Overview](#121-observability-overview)
- [12.2 Structured Logging](#122-structured-logging)
- [12.3 Distributed Tracing](#123-distributed-tracing)
- [12.4 Metrics Collection](#124-metrics-collection)
- [12.5 Error Tracking and Alerting](#125-error-tracking-and-alerting)
- [12.6 Health Checks](#126-health-checks)
- [12.7 Reliability Patterns](#127-reliability-patterns)
- [12.8 Dashboards and Visualization](#128-dashboards-and-visualization)
- [Exercises](#exercises)
- [Summary](#summary)

---

## 12.1 Observability Overview

Observability is the ability to understand what's happening inside your system by examining its outputs. For AI systems, this is critical because of non-deterministic behavior and complex failure modes.

### The Three Pillars of Observability

```typescript
/**
 * The three pillars of observability
 */
export enum ObservabilityPillar {
  /** Logs: Discrete events with context */
  LOGS = 'logs',

  /** Metrics: Numerical measurements over time */
  METRICS = 'metrics',

  /** Traces: Request flow through system */
  TRACES = 'traces'
}

/**
 * Observability requirements for AI systems
 */
export const OBSERVABILITY_REQUIREMENTS = {
  logs: {
    structured: true,        // Machine-parseable format
    contextual: true,        // Include request/user context
    searchable: true,        // Full-text search capability
    retention: 30,           // Days to retain
    sampling: false          // No sampling (capture all)
  },

  metrics: {
    granularity: 60,         // Seconds between measurements
    dimensions: [            // Metric dimensions
      'provider',
      'model',
      'operation',
      'status'
    ],
    aggregations: [          // Aggregation types
      'sum',
      'avg',
      'p50',
      'p95',
      'p99'
    ]
  },

  traces: {
    sampleRate: 1.0,         // 100% sampling in production
    includeContext: true,    // Include full request context
    maxSpans: 1000,          // Max spans per trace
    retention: 7             // Days to retain
  }
};
```

### Observability Goals

```typescript
/**
 * What we want to know about our AI system
 */
export interface ObservabilityGoals {
  // Performance
  howFast: {
    firstTokenLatency: number;    // Time to first token
    totalLatency: number;         // Total request time
    cacheHitRate: number;         // Cache effectiveness
  };

  // Reliability
  howReliable: {
    errorRate: number;            // % of requests failing
    availability: number;         // % uptime
    successRate: number;          // % of successful requests
  };

  // Cost
  howExpensive: {
    costPerRequest: number;       // Average cost
    totalCost: number;            // Total spend
    tokenUsage: number;           // Tokens consumed
  };

  // Quality
  howGood: {
    qualityScore: number;         // Output quality (0-100)
    userSatisfaction: number;     // User feedback
    regressionRate: number;       // % quality regressions
  };

  // Usage
  whoAndWhat: {
    activeUsers: number;          // Users in time period
    requestsPerUser: number;      // Usage per user
    topOperations: string[];      // Most common operations
  };
}
```

### Before vs After Observability

```typescript
/**
 * Without observability
 */
function withoutObservability() {
  // User reports issue
  console.log('User: My request failed');

  // You have no visibility
  // - No logs to check
  // - No metrics to analyze
  // - No trace to follow
  // - No error details

  // Result: 60+ minutes debugging
  // - Checking code
  // - Adding console.log
  // - Reproducing locally
  // - Guessing root cause
}

/**
 * With observability
 */
async function withObservability() {
  // User reports issue
  console.log('User: My request failed at 14:32');

  // Check dashboard
  const trace = await tracing.getTrace('req_abc123');

  console.log(`
📊 Request Trace: req_abc123
├─ User: user_456
├─ Timestamp: 2024-01-15 14:32:15
├─ Duration: 3,456ms
├─ Status: FAILED
├─
├─ Spans:
│  ├─ [200ms] Validate Input ✓
│  ├─ [150ms] Check Cache ✓ (miss)
│  ├─ [2,100ms] AI Provider: Anthropic
│  │  ├─ Status: 429 Rate Limit
│  │  └─ Error: Rate limit exceeded
│  ├─ [890ms] Fallback: OpenAI ✓
│  │  └─ Success
│  └─ [116ms] Cache Result ✓
├─
├─ Root Cause: Anthropic rate limit
├─ Resolution: Fallback succeeded
└─ Action Taken: Increased rate limit
  `);

  // Result: 2 minutes to identify and resolve
}
```

---

## 12.2 Structured Logging

Structured logging uses machine-parseable formats (JSON) instead of plain text, enabling powerful querying and analysis.

### Structured Logger

```typescript
import winston from 'winston';

/**
 * Structured logger with context
 */
export class StructuredLogger {
  private logger: winston.Logger;

  constructor(options: LoggerOptions = {}) {
    this.logger = winston.createLogger({
      level: options.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: options.service || 'ollama-code',
        environment: process.env.NODE_ENV || 'development',
        version: options.version || '1.0.0'
      },
      transports: [
        // Console (for development)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),

        // File (for production)
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        })
      ]
    });
  }

  /**
   * Log with context
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.enrichContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.enrichContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, {
      ...this.enrichContext(context),
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.enrichContext(context));
  }

  /**
   * Enrich context with metadata
   */
  private enrichContext(context?: LogContext): Record<string, any> {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      hostname: require('os').hostname()
    };
  }

  /**
   * Create child logger with fixed context
   */
  child(context: LogContext): StructuredLogger {
    const child = new StructuredLogger({
      service: this.logger.defaultMeta?.service,
      level: this.logger.level
    });

    // Add fixed context to all logs
    child.logger.defaultMeta = {
      ...child.logger.defaultMeta,
      ...context
    };

    return child;
  }
}

interface LoggerOptions {
  service?: string;
  level?: string;
  version?: string;
}

interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}
```

### Request Logger

```typescript
/**
 * Logs AI requests with full context
 */
export class RequestLogger {
  constructor(private logger: StructuredLogger) {}

  /**
   * Log AI request start
   */
  logRequestStart(request: CompletionRequest, context: RequestContext): void {
    this.logger.info('AI request started', {
      requestId: context.requestId,
      userId: context.userId,
      provider: request.model?.split('/')[0],
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      operation: context.operation
    });
  }

  /**
   * Log AI request completion
   */
  logRequestComplete(
    request: CompletionRequest,
    response: CompletionResponse,
    context: RequestContext,
    duration: number
  ): void {
    this.logger.info('AI request completed', {
      requestId: context.requestId,
      userId: context.userId,
      provider: response.metadata?.provider,
      model: response.model,
      duration,
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens,
      totalTokens: response.usage?.totalTokens,
      cost: this.calculateCost(response),
      fromCache: response.metadata?.fromCache || false,
      operation: context.operation
    });
  }

  /**
   * Log AI request error
   */
  logRequestError(
    request: CompletionRequest,
    error: Error,
    context: RequestContext,
    duration: number
  ): void {
    this.logger.error('AI request failed', error, {
      requestId: context.requestId,
      userId: context.userId,
      model: request.model,
      duration,
      operation: context.operation,
      errorType: error.name,
      retryable: this.isRetryable(error)
    });
  }

  /**
   * Log tool execution
   */
  logToolExecution(
    tool: string,
    params: Record<string, any>,
    result: ToolResult,
    duration: number,
    context: RequestContext
  ): void {
    this.logger.info('Tool executed', {
      requestId: context.requestId,
      tool,
      params: this.sanitizeParams(params),
      success: result.success,
      duration,
      fromCache: result.fromCache || false,
      operation: context.operation
    });
  }

  /**
   * Calculate request cost
   */
  private calculateCost(response: CompletionResponse): number {
    if (!response.usage) return 0;

    // Approximate costs (would use actual provider pricing)
    const inputCost = response.usage.inputTokens * 0.00001;
    const outputCost = response.usage.outputTokens * 0.00003;

    return inputCost + outputCost;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: Error): boolean {
    const retryableErrors = [
      'RateLimitError',
      'TimeoutError',
      'NetworkError',
      'ServiceUnavailableError'
    ];

    return retryableErrors.includes(error.name);
  }

  /**
   * Sanitize sensitive parameters
   */
  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sanitized = { ...params };

    // Redact sensitive fields
    const sensitiveFields = ['apiKey', 'password', 'token', 'secret'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

interface RequestContext {
  requestId: string;
  userId?: string;
  operation: string;
}
```

### Log Querying

```typescript
/**
 * Query structured logs
 */
export class LogQuery {
  constructor(private logsPath: string) {}

  /**
   * Query logs by criteria
   */
  async query(criteria: QueryCriteria): Promise<LogEntry[]> {
    const logs = await this.readLogs();

    return logs.filter(log => {
      // Filter by time range
      if (criteria.startTime && new Date(log.timestamp) < criteria.startTime) {
        return false;
      }

      if (criteria.endTime && new Date(log.timestamp) > criteria.endTime) {
        return false;
      }

      // Filter by level
      if (criteria.level && log.level !== criteria.level) {
        return false;
      }

      // Filter by service
      if (criteria.service && log.service !== criteria.service) {
        return false;
      }

      // Filter by request ID
      if (criteria.requestId && log.requestId !== criteria.requestId) {
        return false;
      }

      // Filter by user ID
      if (criteria.userId && log.userId !== criteria.userId) {
        return false;
      }

      // Filter by operation
      if (criteria.operation && log.operation !== criteria.operation) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get error rate
   */
  async getErrorRate(timeRange: TimeRange): Promise<number> {
    const logs = await this.query({
      startTime: timeRange.start,
      endTime: timeRange.end
    });

    const errors = logs.filter(log => log.level === 'error').length;
    const total = logs.length;

    return total > 0 ? errors / total : 0;
  }

  /**
   * Get average duration
   */
  async getAverageDuration(
    operation: string,
    timeRange: TimeRange
  ): Promise<number> {
    const logs = await this.query({
      operation,
      startTime: timeRange.start,
      endTime: timeRange.end
    });

    const durations = logs
      .filter(log => log.duration !== undefined)
      .map(log => log.duration!);

    if (durations.length === 0) return 0;

    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  /**
   * Read logs from file
   */
  private async readLogs(): Promise<LogEntry[]> {
    const content = await fs.readFile(this.logsPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    return lines.map(line => JSON.parse(line));
  }
}

interface QueryCriteria {
  startTime?: Date;
  endTime?: Date;
  level?: string;
  service?: string;
  requestId?: string;
  userId?: string;
  operation?: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}
```

---

## 12.3 Distributed Tracing

Distributed tracing tracks requests as they flow through your system, showing the complete call graph.

### Trace Context

```typescript
/**
 * Trace context for distributed tracing
 */
export class TraceContext {
  constructor(
    public readonly traceId: string,
    public readonly spanId: string,
    public readonly parentSpanId?: string
  ) {}

  /**
   * Create root trace context
   */
  static createRoot(): TraceContext {
    return new TraceContext(
      this.generateId(),
      this.generateId()
    );
  }

  /**
   * Create child span
   */
  createChild(): TraceContext {
    return new TraceContext(
      this.traceId,
      TraceContext.generateId(),
      this.spanId
    );
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
```

### Tracer

```typescript
/**
 * Distributed tracer
 */
export class Tracer {
  private spans: Map<string, Span> = new Map();
  private logger: StructuredLogger;

  constructor(logger: StructuredLogger) {
    this.logger = logger;
  }

  /**
   * Start a span
   */
  startSpan(
    name: string,
    context: TraceContext,
    attributes?: Record<string, any>
  ): Span {
    const span: Span = {
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      name,
      startTime: Date.now(),
      attributes: attributes || {},
      events: [],
      status: SpanStatus.UNSET
    };

    this.spans.set(span.spanId, span);

    this.logger.debug('Span started', {
      traceId: span.traceId,
      spanId: span.spanId,
      name: span.name
    });

    return span;
  }

  /**
   * End a span
   */
  endSpan(span: Span, status: SpanStatus = SpanStatus.OK): void {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.logger.info('Span completed', {
      traceId: span.traceId,
      spanId: span.spanId,
      name: span.name,
      duration: span.duration,
      status: span.status
    });

    // Export span to trace collector
    this.exportSpan(span);
  }

  /**
   * Add event to span
   */
  addEvent(span: Span, name: string, attributes?: Record<string, any>): void {
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes: attributes || {}
    });
  }

  /**
   * Set span error
   */
  setError(span: Span, error: Error): void {
    span.status = SpanStatus.ERROR;
    span.attributes.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  /**
   * Get trace
   */
  async getTrace(traceId: string): Promise<Trace> {
    const spans = Array.from(this.spans.values())
      .filter(s => s.traceId === traceId)
      .sort((a, b) => a.startTime - b.startTime);

    return {
      traceId,
      spans,
      duration: this.calculateTraceDuration(spans),
      status: this.calculateTraceStatus(spans)
    };
  }

  /**
   * Export span to trace collector
   */
  private exportSpan(span: Span): void {
    // Would export to OpenTelemetry, Jaeger, etc.
    // For now, just log
    this.logger.debug('Span exported', {
      span: JSON.stringify(span)
    });
  }

  /**
   * Calculate total trace duration
   */
  private calculateTraceDuration(spans: Span[]): number {
    if (spans.length === 0) return 0;

    const start = Math.min(...spans.map(s => s.startTime));
    const end = Math.max(...spans.map(s => s.endTime || s.startTime));

    return end - start;
  }

  /**
   * Calculate trace status
   */
  private calculateTraceStatus(spans: Span[]): SpanStatus {
    if (spans.some(s => s.status === SpanStatus.ERROR)) {
      return SpanStatus.ERROR;
    }

    return SpanStatus.OK;
  }
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  events: SpanEvent[];
  status: SpanStatus;
}

interface SpanEvent {
  name: string;
  timestamp: number;
  attributes: Record<string, any>;
}

enum SpanStatus {
  UNSET = 'unset',
  OK = 'ok',
  ERROR = 'error'
}

interface Trace {
  traceId: string;
  spans: Span[];
  duration: number;
  status: SpanStatus;
}
```

### Traced AI Service

```typescript
/**
 * AI service with distributed tracing
 */
export class TracedAIService {
  constructor(
    private provider: AIProvider,
    private tracer: Tracer,
    private logger: StructuredLogger
  ) {}

  /**
   * Complete with tracing
   */
  async complete(
    request: CompletionRequest,
    context: TraceContext
  ): Promise<CompletionResponse> {
    // Create span for AI request
    const span = this.tracer.startSpan('ai.complete', context, {
      provider: this.provider.constructor.name,
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature
    });

    try {
      // Add event for request start
      this.tracer.addEvent(span, 'request.started', {
        inputTokens: this.estimateTokens(request.messages)
      });

      // Call AI provider
      const response = await this.provider.complete(request);

      // Add event for response
      this.tracer.addEvent(span, 'response.received', {
        outputTokens: response.usage?.outputTokens,
        fromCache: response.metadata?.fromCache
      });

      // Update span attributes
      span.attributes.outputTokens = response.usage?.outputTokens;
      span.attributes.totalTokens = response.usage?.totalTokens;
      span.attributes.cost = this.calculateCost(response);

      // End span successfully
      this.tracer.endSpan(span, SpanStatus.OK);

      return response;

    } catch (error) {
      // Record error in span
      this.tracer.setError(span, error as Error);
      this.tracer.endSpan(span, SpanStatus.ERROR);

      throw error;
    }
  }

  /**
   * Execute tool with tracing
   */
  async executeTool(
    tool: Tool,
    params: Record<string, any>,
    context: TraceContext
  ): Promise<ToolResult> {
    // Create child span for tool
    const childContext = context.createChild();
    const span = this.tracer.startSpan(`tool.${tool.name}`, childContext, {
      tool: tool.name,
      params: this.sanitizeParams(params)
    });

    try {
      const result = await tool.execute(params, {
        traceContext: childContext
      });

      span.attributes.success = result.success;
      span.attributes.fromCache = result.fromCache || false;

      this.tracer.endSpan(span, SpanStatus.OK);

      return result;

    } catch (error) {
      this.tracer.setError(span, error as Error);
      this.tracer.endSpan(span, SpanStatus.ERROR);

      throw error;
    }
  }

  private estimateTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => {
      return total + msg.content.split(/\s+/).length;
    }, 0);
  }

  private calculateCost(response: CompletionResponse): number {
    if (!response.usage) return 0;

    const inputCost = response.usage.inputTokens * 0.00001;
    const outputCost = response.usage.outputTokens * 0.00003;

    return inputCost + outputCost;
  }

  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    // Redact sensitive fields
    const sanitized = { ...params };
    const sensitiveFields = ['apiKey', 'password', 'token'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
```

---

## 12.4 Metrics Collection

Collect numerical metrics over time to track performance, usage, and costs.

### Metrics Collector

```typescript
/**
 * Collects and aggregates metrics
 */
export class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private logger: StructuredLogger;

  constructor(logger: StructuredLogger) {
    this.logger = logger;
  }

  /**
   * Record a counter metric
   */
  incrementCounter(
    name: string,
    value: number = 1,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      value,
      tags: tags || {},
      timestamp: Date.now()
    });
  }

  /**
   * Record a gauge metric
   */
  setGauge(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      value,
      tags: tags || {},
      timestamp: Date.now()
    });
  }

  /**
   * Record a histogram metric
   */
  recordHistogram(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      value,
      tags: tags || {},
      timestamp: Date.now()
    });
  }

  /**
   * Record a timing metric
   */
  recordTiming(
    name: string,
    durationMs: number,
    tags?: Record<string, string>
  ): void {
    this.recordHistogram(name, durationMs, tags);
  }

  /**
   * Store metric
   */
  private recordMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    this.metrics.get(metric.name)!.push(metric);

    // Log metric
    this.logger.debug('Metric recorded', {
      metric: metric.name,
      value: metric.value,
      type: metric.type,
      tags: metric.tags
    });
  }

  /**
   * Get metric statistics
   */
  getStats(
    name: string,
    timeRange: TimeRange
  ): MetricStats | null {
    const metrics = this.metrics.get(name);

    if (!metrics) return null;

    // Filter by time range
    const filtered = metrics.filter(m =>
      m.timestamp >= timeRange.start.getTime() &&
      m.timestamp <= timeRange.end.getTime()
    );

    if (filtered.length === 0) return null;

    const values = filtered.map(m => m.value).sort((a, b) => a - b);

    return {
      count: filtered.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)]
    };
  }

  /**
   * Export metrics to monitoring system
   */
  exportMetrics(): void {
    // Would export to Prometheus, CloudWatch, etc.
    for (const [name, metrics] of this.metrics.entries()) {
      this.logger.info('Exporting metrics', {
        metric: name,
        count: metrics.length
      });
    }
  }
}

enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram'
}

interface Metric {
  name: string;
  type: MetricType;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

interface MetricStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}
```

### Key Metrics for AI Systems

```typescript
/**
 * Tracks key metrics for AI systems
 */
export class AIMetrics {
  constructor(private collector: MetricsCollector) {}

  /**
   * Record request metrics
   */
  recordRequest(
    provider: string,
    duration: number,
    success: boolean,
    cached: boolean
  ): void {
    // Request count
    this.collector.incrementCounter('ai.requests.total', 1, {
      provider,
      status: success ? 'success' : 'error',
      cached: cached.toString()
    });

    // Request duration
    this.collector.recordTiming('ai.requests.duration', duration, {
      provider
    });

    // Cache hit rate
    if (cached) {
      this.collector.incrementCounter('ai.cache.hits', 1, { provider });
    } else {
      this.collector.incrementCounter('ai.cache.misses', 1, { provider });
    }
  }

  /**
   * Record token usage
   */
  recordTokens(
    provider: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    this.collector.incrementCounter('ai.tokens.input', inputTokens, {
      provider
    });

    this.collector.incrementCounter('ai.tokens.output', outputTokens, {
      provider
    });
  }

  /**
   * Record cost
   */
  recordCost(provider: string, cost: number): void {
    this.collector.incrementCounter('ai.cost.total', cost, {
      provider
    });
  }

  /**
   * Record error
   */
  recordError(provider: string, errorType: string): void {
    this.collector.incrementCounter('ai.errors.total', 1, {
      provider,
      errorType
    });
  }

  /**
   * Record tool execution
   */
  recordToolExecution(
    tool: string,
    duration: number,
    success: boolean
  ): void {
    this.collector.incrementCounter('tools.executions.total', 1, {
      tool,
      status: success ? 'success' : 'error'
    });

    this.collector.recordTiming('tools.executions.duration', duration, {
      tool
    });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();

    this.collector.setGauge('system.memory.heap_used', usage.heapUsed);
    this.collector.setGauge('system.memory.heap_total', usage.heapTotal);
    this.collector.setGauge('system.memory.external', usage.external);
    this.collector.setGauge('system.memory.rss', usage.rss);
  }
}
```

---

## 12.5 Error Tracking and Alerting

Track errors and send alerts when issues occur.

### Error Tracker

```typescript
/**
 * Tracks and categorizes errors
 */
export class ErrorTracker {
  private errors: Map<string, ErrorEntry[]> = new Map();
  private logger: StructuredLogger;
  private alerting: AlertingService;

  constructor(
    logger: StructuredLogger,
    alerting: AlertingService
  ) {
    this.logger = logger;
    this.alerting = alerting;
  }

  /**
   * Track error
   */
  async trackError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    const entry: ErrorEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now(),
      fingerprint: this.generateFingerprint(error, context)
    };

    // Store error
    if (!this.errors.has(entry.fingerprint)) {
      this.errors.set(entry.fingerprint, []);
    }

    this.errors.get(entry.fingerprint)!.push(entry);

    // Log error
    this.logger.error('Error tracked', error, {
      fingerprint: entry.fingerprint,
      operation: context.operation,
      requestId: context.requestId
    });

    // Check if alert needed
    await this.checkAlerts(entry.fingerprint);
  }

  /**
   * Generate error fingerprint for grouping
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    // Group errors by name, message pattern, and operation
    const parts = [
      error.name,
      this.normalizeMessage(error.message),
      context.operation
    ];

    return crypto
      .createHash('sha256')
      .update(parts.join(':'))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Normalize error message to group similar errors
   */
  private normalizeMessage(message: string): string {
    return message
      .replace(/\d+/g, 'N')           // Numbers -> N
      .replace(/[a-f0-9-]{36}/g, 'UUID') // UUIDs -> UUID
      .replace(/"[^"]*"/g, 'STR');    // Strings -> STR
  }

  /**
   * Check if alerts should be sent
   */
  private async checkAlerts(fingerprint: string): Promise<void> {
    const errors = this.errors.get(fingerprint) || [];

    // Alert on first occurrence
    if (errors.length === 1) {
      await this.alerting.send({
        severity: AlertSeverity.INFO,
        title: 'New error type detected',
        message: `${errors[0].error.name}: ${errors[0].error.message}`,
        context: errors[0].context
      });
    }

    // Alert on spike (>10 in last 5 minutes)
    const recentErrors = errors.filter(
      e => Date.now() - e.timestamp < 5 * 60 * 1000
    );

    if (recentErrors.length >= 10) {
      await this.alerting.send({
        severity: AlertSeverity.WARNING,
        title: 'Error spike detected',
        message: `${recentErrors.length} occurrences in 5 minutes`,
        context: errors[0].context
      });
    }

    // Alert on sustained high rate (>50 in last hour)
    const lastHourErrors = errors.filter(
      e => Date.now() - e.timestamp < 60 * 60 * 1000
    );

    if (lastHourErrors.length >= 50) {
      await this.alerting.send({
        severity: AlertSeverity.CRITICAL,
        title: 'High error rate',
        message: `${lastHourErrors.length} occurrences in last hour`,
        context: errors[0].context
      });
    }
  }

  /**
   * Get error statistics
   */
  getStats(timeRange: TimeRange): ErrorStats {
    let totalErrors = 0;
    const errorsByType = new Map<string, number>();
    const errorsByOperation = new Map<string, number>();

    for (const [fingerprint, entries] of this.errors.entries()) {
      const filtered = entries.filter(
        e => e.timestamp >= timeRange.start.getTime() &&
             e.timestamp <= timeRange.end.getTime()
      );

      totalErrors += filtered.length;

      for (const entry of filtered) {
        // Count by type
        const type = entry.error.name;
        errorsByType.set(type, (errorsByType.get(type) || 0) + 1);

        // Count by operation
        const op = entry.context.operation;
        errorsByOperation.set(op, (errorsByOperation.get(op) || 0) + 1);
      }
    }

    return {
      totalErrors,
      uniqueErrors: this.errors.size,
      errorsByType: Object.fromEntries(errorsByType),
      errorsByOperation: Object.fromEntries(errorsByOperation)
    };
  }
}

interface ErrorEntry {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorContext;
  timestamp: number;
  fingerprint: string;
}

interface ErrorContext {
  requestId?: string;
  userId?: string;
  operation: string;
  [key: string]: any;
}

interface ErrorStats {
  totalErrors: number;
  uniqueErrors: number;
  errorsByType: Record<string, number>;
  errorsByOperation: Record<string, number>;
}
```

### Alerting Service

```typescript
/**
 * Sends alerts via multiple channels
 */
export class AlertingService {
  private channels: AlertChannel[] = [];
  private logger: StructuredLogger;

  constructor(logger: StructuredLogger) {
    this.logger = logger;
  }

  /**
   * Add alert channel
   */
  addChannel(channel: AlertChannel): void {
    this.channels.push(channel);
  }

  /**
   * Send alert
   */
  async send(alert: Alert): Promise<void> {
    this.logger.info('Sending alert', {
      severity: alert.severity,
      title: alert.title
    });

    // Send to all channels
    await Promise.all(
      this.channels.map(channel => channel.send(alert))
    );
  }
}

interface Alert {
  severity: AlertSeverity;
  title: string;
  message: string;
  context?: Record<string, any>;
}

enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

interface AlertChannel {
  send(alert: Alert): Promise<void>;
}

/**
 * Slack alert channel
 */
export class SlackAlertChannel implements AlertChannel {
  constructor(private webhookUrl: string) {}

  async send(alert: Alert): Promise<void> {
    const color = {
      [AlertSeverity.INFO]: '#36a64f',
      [AlertSeverity.WARNING]: '#ff9900',
      [AlertSeverity.CRITICAL]: '#ff0000'
    }[alert.severity];

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          title: alert.title,
          text: alert.message,
          fields: alert.context ? Object.entries(alert.context).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true
          })) : []
        }]
      })
    });
  }
}

/**
 * Email alert channel
 */
export class EmailAlertChannel implements AlertChannel {
  constructor(private emailService: any) {}

  async send(alert: Alert): Promise<void> {
    await this.emailService.send({
      to: 'ops@example.com',
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      body: alert.message
    });
  }
}
```

---

## 12.6 Health Checks

Health checks verify system components are working correctly.

### Health Check System

```typescript
/**
 * Health check system
 */
export class HealthCheckSystem {
  private checks: Map<string, HealthCheck> = new Map();
  private logger: StructuredLogger;

  constructor(logger: StructuredLogger) {
    this.logger = logger;
  }

  /**
   * Register health check
   */
  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  async runAll(): Promise<HealthReport> {
    const results: Record<string, HealthCheckResult> = {};

    for (const [name, check] of this.checks.entries()) {
      try {
        const startTime = performance.now();

        const result = await Promise.race([
          check.check(),
          this.timeout(5000) // 5 second timeout
        ]);

        const duration = performance.now() - startTime;

        results[name] = {
          status: result ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          duration,
          message: result ? 'OK' : 'Failed'
        };

      } catch (error) {
        results[name] = {
          status: HealthStatus.UNHEALTHY,
          duration: 0,
          message: (error as Error).message
        };
      }
    }

    const overallStatus = Object.values(results).every(
      r => r.status === HealthStatus.HEALTHY
    ) ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    );
  }
}

interface HealthCheck {
  check(): Promise<boolean>;
}

interface HealthCheckResult {
  status: HealthStatus;
  duration: number;
  message: string;
}

enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}

interface HealthReport {
  status: HealthStatus;
  checks: Record<string, HealthCheckResult>;
  timestamp: string;
}
```

### Common Health Checks

```typescript
/**
 * Database health check
 */
export class DatabaseHealthCheck implements HealthCheck {
  constructor(private db: any) {}

  async check(): Promise<boolean> {
    try {
      await this.db.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * AI provider health check
 */
export class AIProviderHealthCheck implements HealthCheck {
  constructor(private provider: AIProvider) {}

  async check(): Promise<boolean> {
    try {
      const health = await this.provider.healthCheck();
      return health.healthy;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Disk space health check
 */
export class DiskSpaceHealthCheck implements HealthCheck {
  constructor(private minFreeGB: number = 1) {}

  async check(): Promise<boolean> {
    const { available } = await import('fs').promises.statfs('/');
    const freeGB = available / 1024 / 1024 / 1024;

    return freeGB >= this.minFreeGB;
  }
}

/**
 * Memory health check
 */
export class MemoryHealthCheck implements HealthCheck {
  constructor(private maxUsagePercent: number = 80) {}

  async check(): Promise<boolean> {
    const usage = process.memoryUsage();
    const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    return usagePercent < this.maxUsagePercent;
  }
}
```

---

## 12.7 Reliability Patterns

Implement patterns that improve system reliability.

### Circuit Breaker

```typescript
/**
 * Circuit breaker prevents cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private options: CircuitBreakerOptions,
    private logger: StructuredLogger
  ) {}

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if we should try again
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.logger.info('Circuit breaker: Entering half-open state');
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Success
      this.onSuccess();

      return result;

    } catch (error) {
      // Failure
      this.onFailure();

      throw error;
    }
  }

  /**
   * Handle success
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold) {
        this.logger.info('Circuit breaker: Closing circuit');
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failure
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.logger.warn('Circuit breaker: Opening circuit', {
        failures: this.failures
      });

      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get circuit state
   */
  getState(): CircuitState {
    return this.state;
  }
}

enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Reject all requests
  HALF_OPEN = 'half_open' // Try limited requests
}

interface CircuitBreakerOptions {
  failureThreshold: number;    // Failures before opening
  successThreshold: number;    // Successes before closing
  resetTimeout: number;        // ms before trying again
}
```

### Retry with Exponential Backoff

```typescript
/**
 * Retry failed operations with exponential backoff
 */
export class RetryPolicy {
  constructor(
    private options: RetryOptions,
    private logger: StructuredLogger
  ) {}

  /**
   * Execute with retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.options.maxAttempts; attempt++) {
      try {
        return await fn();

      } catch (error) {
        lastError = error as Error;

        // Check if retryable
        if (!this.isRetryable(error as Error)) {
          throw error;
        }

        // Last attempt - don't wait
        if (attempt === this.options.maxAttempts - 1) {
          break;
        }

        // Calculate backoff
        const backoffMs = this.calculateBackoff(attempt);

        this.logger.info('Retrying after error', {
          attempt: attempt + 1,
          maxAttempts: this.options.maxAttempts,
          backoffMs,
          error: (error as Error).message
        });

        // Wait before retry
        await this.sleep(backoffMs);
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: Error): boolean {
    const retryableErrors = [
      'RateLimitError',
      'TimeoutError',
      'NetworkError',
      'ServiceUnavailableError'
    ];

    return retryableErrors.includes(error.name);
  }

  /**
   * Calculate exponential backoff
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = this.options.baseDelayMs || 1000;
    const maxDelay = this.options.maxDelayMs || 30000;

    // Exponential: baseDelay * 2^attempt
    let delay = baseDelay * Math.pow(2, attempt);

    // Add jitter to prevent thundering herd
    if (this.options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    // Cap at max delay
    return Math.min(delay, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RetryOptions {
  maxAttempts: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}
```

---

## 12.8 Dashboards and Visualization

Create dashboards to visualize metrics and system health.

### Dashboard Data Provider

```typescript
/**
 * Provides data for dashboards
 */
export class DashboardDataProvider {
  constructor(
    private metrics: MetricsCollector,
    private logs: LogQuery,
    private tracer: Tracer
  ) {}

  /**
   * Get overview metrics
   */
  async getOverview(timeRange: TimeRange): Promise<DashboardOverview> {
    return {
      requests: await this.getRequestMetrics(timeRange),
      errors: await this.getErrorMetrics(timeRange),
      performance: await this.getPerformanceMetrics(timeRange),
      cost: await this.getCostMetrics(timeRange)
    };
  }

  /**
   * Get request metrics
   */
  private async getRequestMetrics(timeRange: TimeRange): Promise<RequestMetrics> {
    const totalRequests = this.metrics.getStats('ai.requests.total', timeRange);
    const successRate = await this.calculateSuccessRate(timeRange);
    const cacheHitRate = await this.calculateCacheHitRate(timeRange);

    return {
      total: totalRequests?.count || 0,
      successRate,
      cacheHitRate
    };
  }

  /**
   * Get error metrics
   */
  private async getErrorMetrics(timeRange: TimeRange): Promise<ErrorMetrics> {
    const errorRate = await this.logs.getErrorRate(timeRange);
    const errorStats = await this.logs.query({
      level: 'error',
      startTime: timeRange.start,
      endTime: timeRange.end
    });

    return {
      rate: errorRate,
      total: errorStats.length
    };
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics> {
    const durationStats = this.metrics.getStats('ai.requests.duration', timeRange);

    return {
      avgLatency: durationStats?.avg || 0,
      p95Latency: durationStats?.p95 || 0,
      p99Latency: durationStats?.p99 || 0
    };
  }

  /**
   * Get cost metrics
   */
  private async getCostMetrics(timeRange: TimeRange): Promise<CostMetrics> {
    const costStats = this.metrics.getStats('ai.cost.total', timeRange);
    const tokenStats = this.metrics.getStats('ai.tokens.input', timeRange);

    return {
      total: costStats?.sum || 0,
      avgPerRequest: costStats?.avg || 0,
      totalTokens: tokenStats?.sum || 0
    };
  }

  private async calculateSuccessRate(timeRange: TimeRange): Promise<number> {
    // Implementation would query actual metrics
    return 0.98; // 98% success rate
  }

  private async calculateCacheHitRate(timeRange: TimeRange): Promise<number> {
    const hits = this.metrics.getStats('ai.cache.hits', timeRange);
    const misses = this.metrics.getStats('ai.cache.misses', timeRange);

    const totalHits = hits?.sum || 0;
    const totalMisses = misses?.sum || 0;
    const total = totalHits + totalMisses;

    return total > 0 ? totalHits / total : 0;
  }
}

interface DashboardOverview {
  requests: RequestMetrics;
  errors: ErrorMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
}

interface RequestMetrics {
  total: number;
  successRate: number;
  cacheHitRate: number;
}

interface ErrorMetrics {
  rate: number;
  total: number;
}

interface PerformanceMetrics {
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
}

interface CostMetrics {
  total: number;
  avgPerRequest: number;
  totalTokens: number;
}
```

---

## Exercises

### Exercise 1: Build a Real-Time Dashboard

**Goal:** Create a real-time dashboard showing system metrics.

**Requirements:**
1. Display key metrics (requests/sec, error rate, latency)
2. Auto-refresh every 10 seconds
3. Show trends (up/down arrows)
4. Highlight anomalies
5. Export to JSON

### Exercise 2: Implement SLO Tracking

**Goal:** Track Service Level Objectives (SLOs) and alert on violations.

**Requirements:**
1. Define SLOs (e.g., 99% requests < 2s)
2. Track error budgets
3. Calculate SLO compliance
4. Alert when SLO at risk
5. Generate SLO reports

### Exercise 3: Create Incident Response System

**Goal:** Automate incident detection and response.

**Requirements:**
1. Detect incidents from metrics/logs
2. Create incident record
3. Send alerts to on-call
4. Track MTTR (Mean Time To Resolution)
5. Generate post-mortems

---

## Summary

In this chapter, you built comprehensive observability for your AI assistant.

### Key Concepts

1. **Structured Logging** - Machine-parseable logs with full context
2. **Distributed Tracing** - Track requests through entire system
3. **Metrics Collection** - Track performance, cost, and usage
4. **Error Tracking** - Categorize and alert on errors
5. **Health Checks** - Verify system components
6. **Reliability Patterns** - Circuit breaker, retry, fallback
7. **Dashboards** - Visualize system health

### Observability Stack

```
Logs (Structured JSON)
├─ What happened
├─ Full context
└─ Searchable

Metrics (Time Series)
├─ How much/how fast
├─ Trends over time
└─ Alerting

Traces (Request Flow)
├─ Where time spent
├─ Bottleneck identification
└─ Error propagation
```

### Real-World Impact

**Before Observability:**
- 60+ minutes to debug issues
- No visibility into performance
- Reactive incident response
- Unknown cost drivers

**After Observability:**
- 2 minutes to identify root cause
- Real-time performance monitoring
- Proactive issue detection
- Complete cost visibility

### Production Readiness Achieved!

With Parts I-IV complete, you now have a production-ready AI coding assistant:

- ✅ **Part I**: Multi-provider AI, DI, services
- ✅ **Part II**: Tools, streaming, conversations
- ✅ **Part III**: VCS, NL routing, security
- ✅ **Part IV**: Testing, performance, observability

### Next Steps

In **Part V: Extensibility**, you'll learn how to extend your system with plugins, IDE integrations, and custom tools.

---

*Chapter 12 | Monitoring, Observability, and Reliability | Complete*
*Part IV | Production Readiness | Complete*
