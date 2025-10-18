# Chapter 5: Streaming Architecture and Real-Time Responses

> *"The best interface is no interface." — Golden Krishna*

---

## Introduction

In Chapter 4, we built a powerful tool orchestration system that enables AI to execute actions. But there's a critical UX problem: **users are left waiting in the dark**.

Imagine asking an AI assistant to "analyze this codebase and create a refactoring plan." Without streaming:

```
User: "Analyze this codebase and create a refactoring plan"
[30 seconds of silence - user sees nothing]
[Suddenly, entire response appears at once]
AI: "Here's my analysis..." [5000 words]
```

This creates several problems:

1. **Poor UX** - Users don't know if the system is working or frozen
2. **Lost Context** - Users can't start reading until everything is done
3. **Wasted Time** - Users wait for the entire response before seeing anything
4. **No Feedback** - Tool execution happens invisibly
5. **No Control** - Users can't cancel if they see the response going wrong

**Streaming architecture** solves these problems by providing real-time feedback:

```
User: "Analyze this codebase and create a refactoring plan"
[Immediately] "Analyzing codebase structure..."
[1s] "Found 47 TypeScript files in src/"
[2s] "Detecting patterns..."
[3s] "Identified 3 architectural concerns:"
[4s] "1. Circular dependencies in..."
[User can start reading while AI continues generating]
```

In this chapter, we'll build a complete streaming architecture that provides:

- **Token-by-token streaming** - Show AI responses as they're generated
- **Progress reporting** - Real-time updates on tool execution
- **Backpressure handling** - Prevent memory overflow
- **Cancellation support** - Allow users to stop operations
- **Error recovery** - Graceful handling of stream failures

---

## What You'll Learn

By the end of this chapter, you'll understand:

1. **Streaming Protocols** - Server-sent events, chunked encoding, WebSockets
2. **Stream Processing** - Async iterators, transform streams, buffers
3. **Progress Tracking** - Real-time status updates for long operations
4. **Backpressure** - Handling fast producers and slow consumers
5. **Cancellation** - Aborting operations gracefully
6. **Error Recovery** - Handling stream failures
7. **Multi-Turn Streaming** - Conversation context with streaming
8. **Terminal Rendering** - Beautiful output in CLI applications

---

## 5.1 Why Streaming?

### The Problem with Non-Streaming Responses

Let's compare non-streaming vs streaming for a typical AI coding task:

**Non-Streaming (Traditional Approach):**

```typescript
async function generateCode(prompt: string): Promise<string> {
  const response = await aiProvider.chat({
    messages: [{ role: 'user', content: prompt }]
  });

  // User waits for entire response
  return response.content;
}

// Usage
console.log('Generating code...');
const code = await generateCode('Create a REST API for users');
console.log(code); // All at once after 10 seconds
```

**Timeline:**
```
0s:  User sends request
     [10 seconds of silence]
10s: Entire response appears
```

**Problems:**
- ❌ No progress indication
- ❌ No partial results
- ❌ Poor perceived performance
- ❌ Cannot cancel
- ❌ High memory usage (buffer entire response)

**Streaming Approach:**

```typescript
async function* generateCodeStreaming(prompt: string): AsyncGenerator<string> {
  const stream = await aiProvider.streamChat({
    messages: [{ role: 'user', content: prompt }]
  });

  for await (const chunk of stream) {
    yield chunk.content;
  }
}

// Usage
console.log('Generating code...');
for await (const chunk of generateCodeStreaming('Create a REST API')) {
  process.stdout.write(chunk); // Show tokens as they arrive
}
```

**Timeline:**
```
0s:   User sends request
0.1s: First tokens appear: "Here's a REST API..."
0.2s: More tokens: "for user management..."
0.5s: Continues streaming...
10s:  Final tokens complete
```

**Benefits:**
- ✅ Immediate feedback (perceived as 10x faster)
- ✅ Partial results available immediately
- ✅ Better perceived performance
- ✅ Can cancel mid-stream
- ✅ Lower memory usage (process chunks incrementally)

### Performance Impact

Let's quantify the UX improvement:

```typescript
// Benchmark: Time until user sees first content

// Non-streaming
console.time('First content (non-streaming)');
const response = await generateCode(prompt);
console.log(response[0]); // First character
console.timeEnd('First content (non-streaming)');
// Output: First content (non-streaming): 8743ms

// Streaming
console.time('First content (streaming)');
const stream = generateCodeStreaming(prompt);
const firstChunk = await stream.next();
console.log(firstChunk.value);
console.timeEnd('First content (streaming)');
// Output: First content (streaming): 142ms

// Improvement: 8743ms → 142ms (61x faster first content!)
```

### Real-World Use Cases

Streaming is essential for:

1. **Long-Form Content Generation**
   - Documentation writing
   - Code explanations
   - Refactoring plans

2. **Multi-Step Workflows**
   - Tool execution progress
   - Build/test output
   - File processing status

3. **Interactive Conversations**
   - Back-and-forth dialogue
   - Clarification questions
   - Iterative refinement

4. **Large Codebase Analysis**
   - Search results
   - Dependency analysis
   - Code metrics

---

## 5.2 Streaming Protocol Design

### Core Streaming Concepts

A streaming protocol needs to handle:

1. **Chunks** - Individual pieces of data
2. **Events** - Different types of stream events
3. **Completion** - Signal when stream ends
4. **Errors** - Handle failures gracefully
5. **Cancellation** - Allow aborting

### Stream Event Types

```typescript
/**
 * Types of events in a streaming response
 */
export enum StreamEventType {
  // Content chunk from AI
  CONTENT = 'content',

  // Tool execution started
  TOOL_START = 'tool_start',

  // Tool execution progress
  TOOL_PROGRESS = 'tool_progress',

  // Tool execution completed
  TOOL_COMPLETE = 'tool_complete',

  // Tool execution failed
  TOOL_ERROR = 'tool_error',

  // Stream completed successfully
  DONE = 'done',

  // Stream error
  ERROR = 'error',

  // Metadata (model info, usage stats, etc.)
  METADATA = 'metadata'
}

/**
 * Base stream event
 */
export interface StreamEvent {
  type: StreamEventType;
  timestamp: Date;
}

/**
 * Content event - AI generated text
 */
export interface ContentEvent extends StreamEvent {
  type: StreamEventType.CONTENT;
  content: string;
  delta?: string; // Incremental change (for efficiency)
}

/**
 * Tool start event
 */
export interface ToolStartEvent extends StreamEvent {
  type: StreamEventType.TOOL_START;
  toolName: string;
  toolId: string;
  parameters: any;
}

/**
 * Tool progress event
 */
export interface ToolProgressEvent extends StreamEvent {
  type: StreamEventType.TOOL_PROGRESS;
  toolId: string;
  progress: number; // 0-100
  message?: string;
}

/**
 * Tool complete event
 */
export interface ToolCompleteEvent extends StreamEvent {
  type: StreamEventType.TOOL_COMPLETE;
  toolId: string;
  result: any;
  durationMs: number;
}

/**
 * Tool error event
 */
export interface ToolErrorEvent extends StreamEvent {
  type: StreamEventType.TOOL_ERROR;
  toolId: string;
  error: {
    message: string;
    code?: string;
  };
}

/**
 * Done event - stream completed
 */
export interface DoneEvent extends StreamEvent {
  type: StreamEventType.DONE;
  metadata?: {
    tokensGenerated?: number;
    durationMs?: number;
    model?: string;
  };
}

/**
 * Error event - stream failed
 */
export interface ErrorEvent extends StreamEvent {
  type: StreamEventType.ERROR;
  error: {
    message: string;
    code?: string;
    recoverable: boolean;
  };
}

/**
 * Metadata event
 */
export interface MetadataEvent extends StreamEvent {
  type: StreamEventType.METADATA;
  metadata: {
    model?: string;
    provider?: string;
    [key: string]: any;
  };
}

/**
 * Union type of all stream events
 */
export type AnyStreamEvent =
  | ContentEvent
  | ToolStartEvent
  | ToolProgressEvent
  | ToolCompleteEvent
  | ToolErrorEvent
  | DoneEvent
  | ErrorEvent
  | MetadataEvent;
```

### Stream Producer Interface

```typescript
/**
 * Stream producer - generates events
 */
export interface StreamProducer {
  /**
   * Start producing events
   */
  start(): AsyncGenerator<AnyStreamEvent, void, unknown>;

  /**
   * Cancel the stream
   */
  cancel(): Promise<void>;

  /**
   * Check if stream is active
   */
  isActive(): boolean;
}

/**
 * Stream consumer - processes events
 */
export interface StreamConsumer {
  /**
   * Handle a stream event
   */
  onEvent(event: AnyStreamEvent): Promise<void> | void;

  /**
   * Stream completed successfully
   */
  onComplete?(metadata?: any): Promise<void> | void;

  /**
   * Stream failed with error
   */
  onError?(error: Error): Promise<void> | void;
}
```

### Basic Stream Implementation

```typescript
/**
 * Basic stream implementation
 */
export class StreamProcessor {
  private producer: StreamProducer;
  private consumers: StreamConsumer[] = [];
  private active = false;
  private abortController: AbortController;

  constructor(producer: StreamProducer) {
    this.producer = producer;
    this.abortController = new AbortController();
  }

  /**
   * Add a consumer
   */
  addConsumer(consumer: StreamConsumer): void {
    this.consumers.push(consumer);
  }

  /**
   * Start streaming
   */
  async start(): Promise<void> {
    if (this.active) {
      throw new Error('Stream already active');
    }

    this.active = true;

    try {
      // Get event stream from producer
      const stream = this.producer.start();

      // Process events
      for await (const event of stream) {
        // Check if cancelled
        if (this.abortController.signal.aborted) {
          break;
        }

        // Send to all consumers
        await this.broadcast(event);

        // Handle stream completion
        if (event.type === StreamEventType.DONE) {
          await this.complete(event.metadata);
          break;
        }

        // Handle stream error
        if (event.type === StreamEventType.ERROR) {
          throw new Error(event.error.message);
        }
      }
    } catch (error: any) {
      await this.handleError(error);
    } finally {
      this.active = false;
    }
  }

  /**
   * Cancel the stream
   */
  async cancel(): Promise<void> {
    this.abortController.abort();
    await this.producer.cancel();
    this.active = false;
  }

  /**
   * Broadcast event to all consumers
   */
  private async broadcast(event: AnyStreamEvent): Promise<void> {
    const promises = this.consumers.map(consumer =>
      consumer.onEvent(event)
    );
    await Promise.all(promises);
  }

  /**
   * Handle stream completion
   */
  private async complete(metadata?: any): Promise<void> {
    const promises = this.consumers
      .filter(c => c.onComplete)
      .map(c => c.onComplete!(metadata));

    await Promise.all(promises);
  }

  /**
   * Handle stream error
   */
  private async handleError(error: Error): Promise<void> {
    const promises = this.consumers
      .filter(c => c.onError)
      .map(c => c.onError!(error));

    await Promise.all(promises);
  }

  /**
   * Check if stream is active
   */
  isActive(): boolean {
    return this.active;
  }
}
```

### Usage Example

```typescript
// Define a producer
class AIResponseProducer implements StreamProducer {
  private cancelled = false;

  async* start(): AsyncGenerator<AnyStreamEvent> {
    yield {
      type: StreamEventType.METADATA,
      timestamp: new Date(),
      metadata: { model: 'claude-3-5-sonnet', provider: 'anthropic' }
    };

    // Simulate streaming content
    const words = ['Hello', ' world', '!', ' How', ' can', ' I', ' help?'];
    for (const word of words) {
      if (this.cancelled) break;

      yield {
        type: StreamEventType.CONTENT,
        timestamp: new Date(),
        content: word,
        delta: word
      };

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    yield {
      type: StreamEventType.DONE,
      timestamp: new Date(),
      metadata: { tokensGenerated: 7, durationMs: 700 }
    };
  }

  async cancel(): Promise<void> {
    this.cancelled = true;
  }

  isActive(): boolean {
    return !this.cancelled;
  }
}

// Define a consumer
class TerminalConsumer implements StreamConsumer {
  private buffer = '';

  onEvent(event: AnyStreamEvent): void {
    switch (event.type) {
      case StreamEventType.CONTENT:
        this.buffer += event.content;
        process.stdout.write(event.content);
        break;

      case StreamEventType.METADATA:
        console.log(`[Using ${event.metadata.model}]`);
        break;

      case StreamEventType.DONE:
        console.log(`\n[Done in ${event.metadata?.durationMs}ms]`);
        break;
    }
  }

  onComplete(): void {
    console.log('\nStream completed successfully');
  }

  onError(error: Error): void {
    console.error(`\nStream error: ${error.message}`);
  }
}

// Use the stream
const producer = new AIResponseProducer();
const processor = new StreamProcessor(producer);
processor.addConsumer(new TerminalConsumer());

await processor.start();

// Output:
// [Using claude-3-5-sonnet]
// Hello world! How can I help?
// [Done in 700ms]
// Stream completed successfully
```

---

## 5.3 Buffer Management

Streaming involves managing buffers to handle data flow efficiently. Improper buffer management leads to memory leaks or performance issues.

### Buffer Strategies

```typescript
/**
 * Buffer strategy for stream processing
 */
export enum BufferStrategy {
  // No buffering - process immediately
  NONE = 'none',

  // Fixed size buffer
  FIXED = 'fixed',

  // Dynamic buffer that grows as needed
  DYNAMIC = 'dynamic',

  // Sliding window - keep only recent data
  SLIDING = 'sliding'
}

/**
 * Stream buffer for managing chunks
 */
export class StreamBuffer {
  private buffer: string[] = [];
  private maxSize: number;
  private strategy: BufferStrategy;
  private bytesBuffered = 0;
  private maxBytes: number;

  constructor(
    strategy: BufferStrategy = BufferStrategy.DYNAMIC,
    options: BufferOptions = {}
  ) {
    this.strategy = strategy;
    this.maxSize = options.maxSize || 1000;
    this.maxBytes = options.maxBytes || 1024 * 1024; // 1MB default
  }

  /**
   * Add chunk to buffer
   */
  add(chunk: string): void {
    const chunkBytes = Buffer.byteLength(chunk, 'utf8');

    // Check byte limit
    if (this.bytesBuffered + chunkBytes > this.maxBytes) {
      this.evict(chunkBytes);
    }

    this.buffer.push(chunk);
    this.bytesBuffered += chunkBytes;

    // Apply strategy
    this.applyStrategy();
  }

  /**
   * Get buffered content
   */
  get(): string {
    return this.buffer.join('');
  }

  /**
   * Get last N chunks
   */
  getLast(n: number): string {
    return this.buffer.slice(-n).join('');
  }

  /**
   * Clear buffer
   */
  clear(): void {
    this.buffer = [];
    this.bytesBuffered = 0;
  }

  /**
   * Get buffer size
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * Get bytes buffered
   */
  bytes(): number {
    return this.bytesBuffered;
  }

  /**
   * Apply buffer strategy
   */
  private applyStrategy(): void {
    switch (this.strategy) {
      case BufferStrategy.NONE:
        // Keep only last chunk
        if (this.buffer.length > 1) {
          const removed = this.buffer.shift()!;
          this.bytesBuffered -= Buffer.byteLength(removed, 'utf8');
        }
        break;

      case BufferStrategy.FIXED:
        // Keep fixed number of chunks
        while (this.buffer.length > this.maxSize) {
          const removed = this.buffer.shift()!;
          this.bytesBuffered -= Buffer.byteLength(removed, 'utf8');
        }
        break;

      case BufferStrategy.SLIDING:
        // Keep only recent chunks (half of max size)
        const target = Math.floor(this.maxSize / 2);
        while (this.buffer.length > target) {
          const removed = this.buffer.shift()!;
          this.bytesBuffered -= Buffer.byteLength(removed, 'utf8');
        }
        break;

      case BufferStrategy.DYNAMIC:
        // No limit, but respect maxBytes
        break;
    }
  }

  /**
   * Evict old chunks to make room
   */
  private evict(requiredBytes: number): void {
    while (this.bytesBuffered + requiredBytes > this.maxBytes && this.buffer.length > 0) {
      const removed = this.buffer.shift()!;
      this.bytesBuffered -= Buffer.byteLength(removed, 'utf8');
    }
  }
}

interface BufferOptions {
  maxSize?: number;
  maxBytes?: number;
}
```

### Backpressure Handling

Backpressure occurs when the producer generates data faster than the consumer can process it.

```typescript
/**
 * Backpressure controller
 */
export class BackpressureController {
  private bufferSize = 0;
  private maxBufferSize: number;
  private paused = false;
  private pauseCallback?: () => void;
  private resumeCallback?: () => void;

  constructor(maxBufferSize: number = 100) {
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Add item to buffer
   */
  async add(): Promise<void> {
    this.bufferSize++;

    // Check if we need to pause producer
    if (this.bufferSize >= this.maxBufferSize && !this.paused) {
      this.paused = true;
      if (this.pauseCallback) {
        this.pauseCallback();
      }

      // Wait until consumer catches up
      await this.waitForResume();
    }
  }

  /**
   * Remove item from buffer
   */
  remove(): void {
    this.bufferSize--;

    // Check if we can resume producer
    if (this.bufferSize < this.maxBufferSize / 2 && this.paused) {
      this.paused = false;
      if (this.resumeCallback) {
        this.resumeCallback();
      }
    }
  }

  /**
   * Set callbacks
   */
  onPause(callback: () => void): void {
    this.pauseCallback = callback;
  }

  onResume(callback: () => void): void {
    this.resumeCallback = callback;
  }

  /**
   * Wait for resume signal
   */
  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.paused) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10);
    });
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.bufferSize;
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.paused;
  }
}
```

### Stream with Backpressure

```typescript
/**
 * Enhanced stream processor with backpressure
 */
export class BackpressureStreamProcessor extends StreamProcessor {
  private backpressure: BackpressureController;
  private buffer: StreamBuffer;

  constructor(
    producer: StreamProducer,
    options: BackpressureOptions = {}
  ) {
    super(producer);
    this.backpressure = new BackpressureController(options.maxBufferSize);
    this.buffer = new StreamBuffer(options.bufferStrategy, options.buffer);

    // Setup backpressure callbacks
    this.backpressure.onPause(() => {
      console.warn('⚠️  Backpressure: pausing producer (buffer full)');
    });

    this.backpressure.onResume(() => {
      console.log('✓ Backpressure: resuming producer');
    });
  }

  /**
   * Broadcast event with backpressure control
   */
  protected async broadcast(event: AnyStreamEvent): Promise<void> {
    // Add to backpressure controller
    await this.backpressure.add();

    try {
      // Buffer content events
      if (event.type === StreamEventType.CONTENT) {
        this.buffer.add(event.content);
      }

      // Send to consumers
      await super.broadcast(event);
    } finally {
      // Remove from backpressure controller
      this.backpressure.remove();
    }
  }

  /**
   * Get buffered content
   */
  getBuffered(): string {
    return this.buffer.get();
  }

  /**
   * Get backpressure stats
   */
  getStats(): BackpressureStats {
    return {
      bufferSize: this.backpressure.getBufferSize(),
      isPaused: this.backpressure.isPaused(),
      bytesBuffered: this.buffer.bytes(),
      chunksBuffered: this.buffer.size()
    };
  }
}

interface BackpressureOptions {
  maxBufferSize?: number;
  bufferStrategy?: BufferStrategy;
  buffer?: BufferOptions;
}

interface BackpressureStats {
  bufferSize: number;
  isPaused: boolean;
  bytesBuffered: number;
  chunksBuffered: number;
}
```

---

## 5.4 Progress Reporting

For long-running operations, users need to know what's happening. Progress reporting provides real-time status updates.

### Progress Tracker

```typescript
/**
 * Progress tracker for operations
 */
export class ProgressTracker {
  private current = 0;
  private total: number;
  private message = '';
  private startTime: Date;
  private stages: ProgressStage[] = [];
  private currentStageIndex = 0;

  constructor(total: number, stages?: ProgressStage[]) {
    this.total = total;
    this.startTime = new Date();
    this.stages = stages || [];
  }

  /**
   * Update progress
   */
  update(current: number, message?: string): ProgressUpdate {
    this.current = Math.min(current, this.total);
    if (message) {
      this.message = message;
    }

    return this.getProgress();
  }

  /**
   * Increment progress
   */
  increment(amount: number = 1, message?: string): ProgressUpdate {
    return this.update(this.current + amount, message);
  }

  /**
   * Start next stage
   */
  nextStage(): ProgressUpdate {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.message = this.stages[this.currentStageIndex].name;
    }
    return this.getProgress();
  }

  /**
   * Get current progress
   */
  getProgress(): ProgressUpdate {
    const elapsed = Date.now() - this.startTime.getTime();
    const percentage = (this.current / this.total) * 100;

    // Estimate remaining time
    let estimatedRemaining: number | undefined;
    if (this.current > 0) {
      const rate = this.current / elapsed; // items per ms
      const remaining = this.total - this.current;
      estimatedRemaining = remaining / rate;
    }

    return {
      current: this.current,
      total: this.total,
      percentage: Math.min(percentage, 100),
      message: this.message,
      elapsed,
      estimatedRemaining,
      stage: this.stages[this.currentStageIndex]
    };
  }

  /**
   * Mark as complete
   */
  complete(message?: string): ProgressUpdate {
    this.current = this.total;
    if (message) {
      this.message = message;
    }
    return this.getProgress();
  }

  /**
   * Check if complete
   */
  isComplete(): boolean {
    return this.current >= this.total;
  }
}

interface ProgressStage {
  name: string;
  weight: number; // Relative weight (for multi-stage progress)
}

interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  message: string;
  elapsed: number;
  estimatedRemaining?: number;
  stage?: ProgressStage;
}
```

### Progress Stream Events

```typescript
/**
 * Emit progress events during streaming
 */
export class ProgressStreamProducer implements StreamProducer {
  private cancelled = false;
  private tracker: ProgressTracker;

  constructor(private operation: () => Promise<void>) {
    this.tracker = new ProgressTracker(100, [
      { name: 'Initializing', weight: 10 },
      { name: 'Processing', weight: 70 },
      { name: 'Finalizing', weight: 20 }
    ]);
  }

  async* start(): AsyncGenerator<AnyStreamEvent> {
    try {
      // Stage 1: Initialize
      yield this.createProgressEvent(this.tracker.update(0, 'Initializing...'));
      await this.sleep(500);

      // Stage 2: Process
      yield this.createProgressEvent(this.tracker.nextStage());

      for (let i = 10; i <= 80; i += 10) {
        if (this.cancelled) break;

        yield this.createProgressEvent(
          this.tracker.update(i, `Processing ${i}%...`)
        );

        await this.sleep(200);
      }

      // Stage 3: Finalize
      yield this.createProgressEvent(this.tracker.nextStage());
      await this.sleep(300);

      // Complete
      yield this.createProgressEvent(
        this.tracker.complete('Operation complete')
      );

      yield {
        type: StreamEventType.DONE,
        timestamp: new Date(),
        metadata: { durationMs: this.tracker.getProgress().elapsed }
      };
    } catch (error: any) {
      yield {
        type: StreamEventType.ERROR,
        timestamp: new Date(),
        error: {
          message: error.message,
          recoverable: false
        }
      };
    }
  }

  async cancel(): Promise<void> {
    this.cancelled = true;
  }

  isActive(): boolean {
    return !this.cancelled;
  }

  private createProgressEvent(update: ProgressUpdate): ToolProgressEvent {
    return {
      type: StreamEventType.TOOL_PROGRESS,
      timestamp: new Date(),
      toolId: 'operation',
      progress: update.percentage,
      message: update.message
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Progress Bar Renderer

```typescript
/**
 * Terminal progress bar
 */
export class ProgressBar {
  private width: number;
  private lastRendered = '';

  constructor(width: number = 40) {
    this.width = width;
  }

  /**
   * Render progress bar
   */
  render(progress: ProgressUpdate): string {
    const percentage = Math.min(progress.percentage, 100);
    const filled = Math.floor((percentage / 100) * this.width);
    const empty = this.width - filled;

    // Build bar
    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    // Build line
    const line = [
      `[${bar}]`,
      `${percentage.toFixed(1)}%`,
      progress.message
    ];

    // Add time estimates
    if (progress.estimatedRemaining) {
      const seconds = Math.ceil(progress.estimatedRemaining / 1000);
      line.push(`~${seconds}s remaining`);
    }

    const rendered = line.join(' ');

    // Clear previous line and render new one
    if (this.lastRendered) {
      process.stdout.write('\r' + ' '.repeat(this.lastRendered.length) + '\r');
    }

    process.stdout.write(rendered);
    this.lastRendered = rendered;

    return rendered;
  }

  /**
   * Clear progress bar
   */
  clear(): void {
    if (this.lastRendered) {
      process.stdout.write('\r' + ' '.repeat(this.lastRendered.length) + '\r');
      this.lastRendered = '';
    }
  }

  /**
   * Complete and show final state
   */
  complete(message?: string): void {
    this.render({
      current: 100,
      total: 100,
      percentage: 100,
      message: message || 'Complete',
      elapsed: 0
    });
    process.stdout.write('\n');
    this.lastRendered = '';
  }
}
```

### Usage Example

```typescript
// Progress consumer
class ProgressConsumer implements StreamConsumer {
  private progressBar = new ProgressBar(40);

  onEvent(event: AnyStreamEvent): void {
    if (event.type === StreamEventType.TOOL_PROGRESS) {
      this.progressBar.render({
        current: event.progress,
        total: 100,
        percentage: event.progress,
        message: event.message || '',
        elapsed: 0
      });
    } else if (event.type === StreamEventType.DONE) {
      this.progressBar.complete('✓ Done!');
    }
  }
}

// Use it
const producer = new ProgressStreamProducer(async () => {
  // Your long operation
});

const processor = new StreamProcessor(producer);
processor.addConsumer(new ProgressConsumer());

await processor.start();

// Output (animated):
// [████████████████████░░░░░░░░░░░░░░░░░░░░] 50.0% Processing 50%... ~3s remaining
// [████████████████████████████████████████] 100.0% ✓ Done!
```

---

## 5.5 Cancellation Support

Users should be able to cancel long-running operations. Let's implement robust cancellation.

### Cancellation Token

```typescript
/**
 * Cancellation token for aborting operations
 */
export class CancellationToken {
  private _cancelled = false;
  private callbacks: Array<() => void> = [];
  private reason?: string;

  /**
   * Check if cancelled
   */
  get isCancelled(): boolean {
    return this._cancelled;
  }

  /**
   * Cancel the operation
   */
  cancel(reason?: string): void {
    if (this._cancelled) return;

    this._cancelled = true;
    this.reason = reason;

    // Notify all callbacks
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('Error in cancellation callback:', error);
      }
    }

    this.callbacks = [];
  }

  /**
   * Register callback for cancellation
   */
  onCancelled(callback: () => void): void {
    if (this._cancelled) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  /**
   * Throw if cancelled
   */
  throwIfCancelled(): void {
    if (this._cancelled) {
      throw new CancellationError(this.reason || 'Operation cancelled');
    }
  }

  /**
   * Get cancellation reason
   */
  getReason(): string | undefined {
    return this.reason;
  }
}

/**
 * Cancellation error
 */
export class CancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CancellationError';
  }
}
```

### Cancellable Stream

```typescript
/**
 * Stream with cancellation support
 */
export class CancellableStreamProcessor extends BackpressureStreamProcessor {
  private cancellationToken: CancellationToken;

  constructor(
    producer: StreamProducer,
    options: BackpressureOptions = {}
  ) {
    super(producer, options);
    this.cancellationToken = new CancellationToken();

    // Register cancellation handler
    this.cancellationToken.onCancelled(() => {
      console.log('🛑 Stream cancelled by user');
      this.producer.cancel();
    });
  }

  /**
   * Start streaming with cancellation support
   */
  async start(): Promise<void> {
    try {
      await super.start();
    } catch (error: any) {
      if (error instanceof CancellationError) {
        // Handle graceful cancellation
        await this.handleCancellation(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Cancel the stream
   */
  async cancel(reason?: string): Promise<void> {
    this.cancellationToken.cancel(reason);
    await super.cancel();
  }

  /**
   * Check cancellation token periodically
   */
  protected async broadcast(event: AnyStreamEvent): Promise<void> {
    // Check if cancelled before processing
    this.cancellationToken.throwIfCancelled();

    await super.broadcast(event);
  }

  /**
   * Handle graceful cancellation
   */
  private async handleCancellation(error: CancellationError): Promise<void> {
    // Notify consumers of cancellation
    const cancellationEvent: ErrorEvent = {
      type: StreamEventType.ERROR,
      timestamp: new Date(),
      error: {
        message: error.message,
        code: 'CANCELLED',
        recoverable: false
      }
    };

    await this.broadcast(cancellationEvent);
  }

  /**
   * Get cancellation token (for external cancellation)
   */
  getCancellationToken(): CancellationToken {
    return this.cancellationToken;
  }
}
```

### Keyboard Cancellation

```typescript
/**
 * Enable Ctrl+C cancellation
 */
export class KeyboardCancellation {
  private cancellationToken: CancellationToken;
  private listener?: NodeJS.SignalsListener;

  constructor(cancellationToken: CancellationToken) {
    this.cancellationToken = cancellationToken;
  }

  /**
   * Enable keyboard cancellation
   */
  enable(): void {
    this.listener = () => {
      console.log('\n\n🛑 Cancelling operation (Ctrl+C pressed)...');
      this.cancellationToken.cancel('User pressed Ctrl+C');

      // Remove listener to allow force quit on second Ctrl+C
      if (this.listener) {
        process.off('SIGINT', this.listener);
      }

      // Set timeout to force quit if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Force quitting (graceful shutdown timed out)');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', this.listener);
  }

  /**
   * Disable keyboard cancellation
   */
  disable(): void {
    if (this.listener) {
      process.off('SIGINT', this.listener);
      this.listener = undefined;
    }
  }
}
```

### Usage Example

```typescript
// Create cancellable stream
const producer = new ProgressStreamProducer(async () => {
  // Long operation
});

const processor = new CancellableStreamProcessor(producer);
const cancellationToken = processor.getCancellationToken();

// Enable Ctrl+C cancellation
const keyboard = new KeyboardCancellation(cancellationToken);
keyboard.enable();

// Start streaming
try {
  await processor.start();
} catch (error) {
  if (error instanceof CancellationError) {
    console.log('✓ Operation cancelled gracefully');
  } else {
    throw error;
  }
} finally {
  keyboard.disable();
}
```

---

## 5.6 Error Recovery in Streams

Streams can fail in various ways. Robust error recovery ensures graceful degradation.

### Error Recovery Strategy

```typescript
/**
 * Error recovery strategy
 */
export enum RecoveryStrategy {
  // Fail immediately
  FAIL_FAST = 'fail_fast',

  // Retry with backoff
  RETRY = 'retry',

  // Skip error and continue
  CONTINUE = 'continue',

  // Use fallback
  FALLBACK = 'fallback'
}

/**
 * Error recovery handler
 */
export class ErrorRecoveryHandler {
  private strategy: RecoveryStrategy;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    strategy: RecoveryStrategy = RecoveryStrategy.RETRY,
    options: RecoveryOptions = {}
  ) {
    this.strategy = strategy;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelayMs || 1000;
  }

  /**
   * Handle stream error
   */
  async handle(
    error: Error,
    context: ErrorContext,
    retryFn: () => Promise<any>
  ): Promise<RecoveryResult> {
    switch (this.strategy) {
      case RecoveryStrategy.FAIL_FAST:
        return { recovered: false, error };

      case RecoveryStrategy.RETRY:
        return await this.retry(error, context, retryFn);

      case RecoveryStrategy.CONTINUE:
        console.warn(`⚠️  Error in stream (continuing): ${error.message}`);
        return { recovered: true };

      case RecoveryStrategy.FALLBACK:
        return await this.fallback(error, context);

      default:
        return { recovered: false, error };
    }
  }

  /**
   * Retry with exponential backoff
   */
  private async retry(
    error: Error,
    context: ErrorContext,
    retryFn: () => Promise<any>
  ): Promise<RecoveryResult> {
    let lastError = error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      console.warn(
        `⚠️  Stream error (attempt ${attempt}/${this.maxRetries}): ${error.message}`
      );

      // Calculate delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await this.sleep(delay);

      try {
        await retryFn();
        console.log(`✓ Recovered after ${attempt} attempts`);
        return { recovered: true, retriesAttempted: attempt };
      } catch (retryError: any) {
        lastError = retryError;
      }
    }

    return {
      recovered: false,
      error: lastError,
      retriesAttempted: this.maxRetries
    };
  }

  /**
   * Use fallback
   */
  private async fallback(
    error: Error,
    context: ErrorContext
  ): Promise<RecoveryResult> {
    console.warn(`⚠️  Using fallback due to error: ${error.message}`);

    // Return partial results if available
    if (context.partialResults) {
      return {
        recovered: true,
        fallbackUsed: true,
        data: context.partialResults
      };
    }

    return {
      recovered: true,
      fallbackUsed: true,
      data: { message: 'Fallback response - original request failed' }
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RecoveryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

interface ErrorContext {
  eventType: StreamEventType;
  partialResults?: any;
  metadata?: any;
}

interface RecoveryResult {
  recovered: boolean;
  error?: Error;
  retriesAttempted?: number;
  fallbackUsed?: boolean;
  data?: any;
}
```

### Resilient Stream Processor

```typescript
/**
 * Stream processor with error recovery
 */
export class ResilientStreamProcessor extends CancellableStreamProcessor {
  private errorHandler: ErrorRecoveryHandler;
  private partialResults: any[] = [];

  constructor(
    producer: StreamProducer,
    options: ResilientStreamOptions = {}
  ) {
    super(producer, options);
    this.errorHandler = new ErrorRecoveryHandler(
      options.recoveryStrategy,
      options.recovery
    );
  }

  /**
   * Start streaming with error recovery
   */
  async start(): Promise<void> {
    try {
      await super.start();
    } catch (error: any) {
      // Attempt recovery
      const result = await this.errorHandler.handle(
        error,
        {
          eventType: StreamEventType.ERROR,
          partialResults: this.partialResults
        },
        async () => {
          // Retry by restarting stream
          await super.start();
        }
      );

      if (!result.recovered) {
        throw result.error || error;
      }

      // Recovery successful
      if (result.fallbackUsed && result.data) {
        // Emit fallback data
        await this.broadcast({
          type: StreamEventType.CONTENT,
          timestamp: new Date(),
          content: JSON.stringify(result.data)
        });
      }
    }
  }

  /**
   * Broadcast event and collect partial results
   */
  protected async broadcast(event: AnyStreamEvent): Promise<void> {
    // Collect partial results for error recovery
    if (event.type === StreamEventType.CONTENT) {
      this.partialResults.push(event.content);
    } else if (event.type === StreamEventType.TOOL_COMPLETE) {
      this.partialResults.push(event.result);
    }

    try {
      await super.broadcast(event);
    } catch (error: any) {
      // Handle consumer errors gracefully
      console.error(`Error in consumer: ${error.message}`);
      // Continue processing other events
    }
  }

  /**
   * Get partial results
   */
  getPartialResults(): any[] {
    return this.partialResults;
  }
}

interface ResilientStreamOptions extends BackpressureOptions {
  recoveryStrategy?: RecoveryStrategy;
  recovery?: RecoveryOptions;
}
```

---

## 5.7 Terminal Output Streaming

Beautiful terminal output makes streaming feel professional. Let's implement rich terminal rendering.

### Terminal Formatter

```typescript
/**
 * Terminal output formatter
 */
export class TerminalFormatter {
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };

  /**
   * Format text with color
   */
  color(text: string, color: keyof typeof this.colors): string {
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  /**
   * Format success message
   */
  success(message: string): string {
    return `${this.colors.green}✓${this.colors.reset} ${message}`;
  }

  /**
   * Format error message
   */
  error(message: string): string {
    return `${this.colors.red}✗${this.colors.reset} ${message}`;
  }

  /**
   * Format warning message
   */
  warning(message: string): string {
    return `${this.colors.yellow}⚠${this.colors.reset} ${message}`;
  }

  /**
   * Format info message
   */
  info(message: string): string {
    return `${this.colors.blue}ℹ${this.colors.reset} ${message}`;
  }

  /**
   * Format section header
   */
  header(text: string): string {
    return `\n${this.colors.bright}${text}${this.colors.reset}\n${'─'.repeat(text.length)}`;
  }

  /**
   * Format code block
   */
  code(text: string, language?: string): string {
    const lines = text.split('\n');
    const formatted = lines.map(line =>
      `${this.colors.gray}│${this.colors.reset} ${line}`
    ).join('\n');

    const lang = language ? ` ${language}` : '';
    return `${this.colors.gray}┌─${lang}\n${formatted}\n└─${this.colors.reset}`;
  }

  /**
   * Format list item
   */
  listItem(text: string, level: number = 0): string {
    const indent = '  '.repeat(level);
    return `${indent}${this.colors.cyan}•${this.colors.reset} ${text}`;
  }

  /**
   * Spinner frames
   */
  private spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private spinnerIndex = 0;

  /**
   * Get next spinner frame
   */
  spinner(): string {
    const frame = this.spinnerFrames[this.spinnerIndex];
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
    return `${this.colors.cyan}${frame}${this.colors.reset}`;
  }

  /**
   * Clear current line
   */
  clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }

  /**
   * Move cursor up
   */
  cursorUp(lines: number = 1): void {
    process.stdout.write(`\x1b[${lines}A`);
  }

  /**
   * Move cursor down
   */
  cursorDown(lines: number = 1): void {
    process.stdout.write(`\x1b[${lines}B`);
  }
}
```

### Rich Terminal Consumer

```typescript
/**
 * Rich terminal output consumer
 */
export class RichTerminalConsumer implements StreamConsumer {
  private formatter = new TerminalFormatter();
  private contentBuffer = '';
  private spinnerInterval?: NodeJS.Timeout;
  private toolsInProgress = new Map<string, string>();

  onEvent(event: AnyStreamEvent): void {
    switch (event.type) {
      case StreamEventType.METADATA:
        console.log(this.formatter.info(
          `Using ${event.metadata.model || 'AI model'}`
        ));
        break;

      case StreamEventType.CONTENT:
        // Stop spinner if active
        this.stopSpinner();

        // Write content
        process.stdout.write(event.content);
        this.contentBuffer += event.content;
        break;

      case StreamEventType.TOOL_START:
        this.startTool(event);
        break;

      case StreamEventType.TOOL_PROGRESS:
        this.updateToolProgress(event);
        break;

      case StreamEventType.TOOL_COMPLETE:
        this.completeTool(event);
        break;

      case StreamEventType.TOOL_ERROR:
        this.errorTool(event);
        break;

      case StreamEventType.DONE:
        console.log('\n');
        console.log(this.formatter.success(
          `Complete in ${event.metadata?.durationMs}ms`
        ));
        break;

      case StreamEventType.ERROR:
        console.log('\n');
        console.log(this.formatter.error(
          `Error: ${event.error.message}`
        ));
        break;
    }
  }

  private startTool(event: ToolStartEvent): void {
    this.stopSpinner();
    console.log('\n');

    const message = `${this.formatter.spinner()} Executing: ${event.toolName}`;
    console.log(message);

    this.toolsInProgress.set(event.toolId, message);

    // Start animated spinner
    this.spinnerInterval = setInterval(() => {
      this.formatter.clearLine();
      const msg = `${this.formatter.spinner()} Executing: ${event.toolName}`;
      process.stdout.write(msg);
    }, 80);
  }

  private updateToolProgress(event: ToolProgressEvent): void {
    this.stopSpinner();
    this.formatter.clearLine();

    const bar = this.renderProgressBar(event.progress);
    const message = event.message ? ` ${event.message}` : '';
    process.stdout.write(`${bar}${message}`);
  }

  private completeTool(event: ToolCompleteEvent): void {
    this.stopSpinner();
    this.formatter.clearLine();

    console.log(this.formatter.success(
      `${event.toolId} (${event.durationMs}ms)`
    ));

    this.toolsInProgress.delete(event.toolId);
  }

  private errorTool(event: ToolErrorEvent): void {
    this.stopSpinner();
    this.formatter.clearLine();

    console.log(this.formatter.error(
      `${event.toolId}: ${event.error.message}`
    ));

    this.toolsInProgress.delete(event.toolId);
  }

  private renderProgressBar(percentage: number): string {
    const width = 30;
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(0)}%`;
  }

  private stopSpinner(): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = undefined;
    }
  }

  onComplete(): void {
    this.stopSpinner();
  }

  onError(error: Error): void {
    this.stopSpinner();
    console.log('\n');
    console.log(this.formatter.error(`Stream failed: ${error.message}`));
  }
}
```

---

## Summary

In this chapter, we built a complete streaming architecture with:

1. **Streaming Protocols** - Event-based streaming with multiple event types
2. **Stream Processing** - Producer/consumer pattern with async generators
3. **Buffer Management** - Strategies for efficient memory usage
4. **Backpressure** - Handling fast producers and slow consumers
5. **Progress Reporting** - Real-time status updates and progress bars
6. **Cancellation** - Graceful shutdown with keyboard support
7. **Error Recovery** - Retry, fallback, and graceful degradation
8. **Terminal Rendering** - Beautiful, professional output

### Key Takeaways

✅ **Streaming improves perceived performance** by 10-60x

✅ **Event-driven architecture** enables flexible stream processing

✅ **Backpressure** prevents memory overflow in high-throughput scenarios

✅ **Progress reporting** keeps users informed during long operations

✅ **Graceful cancellation** respects user control

✅ **Error recovery** ensures robustness in production

✅ **Rich terminal output** creates professional UX

---

**Next Chapter:** [Conversation Management and Context →](chapter-06-conversation.md)

In Chapter 6, we'll explore how to manage multi-turn conversations with context tracking, token budget management, and conversation persistence.

---

*Chapter 5 | Streaming Architecture and Real-Time Responses | Complete*