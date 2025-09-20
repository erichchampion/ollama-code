/**
 * Streaming Response Processor
 *
 * Provides real-time feedback to users during command processing
 * to improve perceived performance and user experience.
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export interface ProcessingUpdate {
  type: 'started' | 'progress' | 'thinking' | 'executing' | 'completed' | 'error';
  message: string;
  progress?: number; // 0-100
  data?: any;
  timestamp: number;
}

export interface StreamingConfig {
  enableStreaming: boolean;
  progressInterval: number;
  maxUpdatesPerSecond: number;
  includeThinkingSteps: boolean;
}

/**
 * Streaming processor for real-time user feedback
 */
export class StreamingProcessor extends EventEmitter {
  private readonly config: StreamingConfig;
  private readonly activeStreams = new Map<string, StreamState>();
  private updateThrottle = new Map<string, number>();

  constructor(config: Partial<StreamingConfig> = {}) {
    super();
    this.config = {
      enableStreaming: true,
      progressInterval: 500, // Update every 500ms
      maxUpdatesPerSecond: 4, // Max 4 updates per second
      includeThinkingSteps: true,
      ...config
    };
  }

  /**
   * Start streaming for a processing operation
   */
  async *processWithStreaming<T>(
    operation: () => Promise<T>,
    operationId: string = this.generateId()
  ): AsyncIterableIterator<ProcessingUpdate> {
    if (!this.config.enableStreaming) {
      // If streaming is disabled, just execute and return final result
      try {
        const result = await operation();
        yield {
          type: 'completed',
          message: 'Operation completed',
          data: result,
          timestamp: Date.now()
        };
      } catch (error) {
        yield {
          type: 'error',
          message: error instanceof Error ? error.message : 'Operation failed',
          timestamp: Date.now()
        };
      }
      return;
    }

    const streamState: StreamState = {
      id: operationId,
      startTime: Date.now(),
      phase: 'starting',
      progress: 0
    };

    this.activeStreams.set(operationId, streamState);

    try {
      // Initial update
      yield {
        type: 'started',
        message: '🔍 Starting operation...',
        progress: 0,
        timestamp: Date.now()
      };

      // Start progress simulation
      const progressInterval = this.startProgressSimulation(operationId);

      // Execute the operation with progress updates
      let result: T;
      try {
        result = await this.executeWithProgress(operation, operationId);
      } finally {
        clearInterval(progressInterval);
      }

      // Emit progress updates that were queued during execution
      for await (const update of this.getQueuedUpdates(operationId)) {
        yield update;
      }

      // Final completion update
      streamState.phase = 'completed';
      streamState.progress = 100;

      yield {
        type: 'completed',
        message: '✅ Operation completed successfully',
        progress: 100,
        data: result,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error('Streaming operation failed:', error);

      yield {
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Operation failed'}`,
        timestamp: Date.now()
      };
    } finally {
      this.activeStreams.delete(operationId);
      this.updateThrottle.delete(operationId);
    }
  }

  /**
   * Process command with real-time feedback
   */
  async *processCommand(
    commandName: string,
    args: string[],
    executor: (cmd: string, args: string[]) => Promise<string>
  ): AsyncIterableIterator<ProcessingUpdate> {
    const operationId = this.generateId();

    yield {
      type: 'started',
      message: `🚀 Executing command: ${commandName}`,
      progress: 0,
      timestamp: Date.now()
    };

    // Simulate preparation phase
    await this.delay(100);
    yield {
      type: 'progress',
      message: '⚙️ Preparing command execution...',
      progress: 20,
      timestamp: Date.now()
    };

    try {
      // Execute command with progress tracking
      yield {
        type: 'executing',
        message: '⚡ Running command...',
        progress: 50,
        timestamp: Date.now()
      };

      const result = await executor(commandName, args);

      yield {
        type: 'progress',
        message: '✨ Processing results...',
        progress: 90,
        timestamp: Date.now()
      };

      await this.delay(50); // Brief pause for user experience

      yield {
        type: 'completed',
        message: '✅ Command completed',
        progress: 100,
        data: result,
        timestamp: Date.now()
      };

    } catch (error) {
      yield {
        type: 'error',
        message: `❌ Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Process AI analysis with thinking steps
   */
  async *processAIAnalysis(
    message: string,
    analyzer: (msg: string) => Promise<any>
  ): AsyncIterableIterator<ProcessingUpdate> {
    yield {
      type: 'started',
      message: '🤔 Analyzing your request...',
      progress: 0,
      timestamp: Date.now()
    };

    if (this.config.includeThinkingSteps) {
      // Simulate thinking process with realistic steps
      const thinkingSteps = [
        '🔍 Understanding the context...',
        '🧠 Processing natural language...',
        '📚 Accessing knowledge base...',
        '⚡ Generating response...'
      ];

      for (let i = 0; i < thinkingSteps.length; i++) {
        await this.delay(200 + Math.random() * 300); // Variable delay for realism

        yield {
          type: 'thinking',
          message: thinkingSteps[i],
          progress: 20 + (i * 20),
          timestamp: Date.now()
        };
      }
    }

    try {
      yield {
        type: 'executing',
        message: '🎯 Finalizing analysis...',
        progress: 90,
        timestamp: Date.now()
      };

      const result = await analyzer(message);

      yield {
        type: 'completed',
        message: '✅ Analysis complete',
        progress: 100,
        data: result,
        timestamp: Date.now()
      };

    } catch (error) {
      yield {
        type: 'error',
        message: `❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Execute operation with progress tracking
   */
  private async executeWithProgress<T>(
    operation: () => Promise<T>,
    operationId: string
  ): Promise<T> {
    const streamState = this.activeStreams.get(operationId);
    if (!streamState) {
      throw new Error('Stream state not found');
    }

    // Update progress periodically during execution
    streamState.phase = 'executing';

    return await operation();
  }

  /**
   * Start progress simulation for long-running operations
   */
  private startProgressSimulation(operationId: string): NodeJS.Timeout {
    return setInterval(() => {
      const streamState = this.activeStreams.get(operationId);
      if (!streamState || streamState.phase === 'completed') {
        return;
      }

      // Simulate gradual progress
      const elapsed = Date.now() - streamState.startTime;
      const estimatedDuration = 5000; // 5 seconds estimated
      const naturalProgress = Math.min(95, (elapsed / estimatedDuration) * 100);

      // Add some randomness for realistic feel
      const jitter = (Math.random() - 0.5) * 5;
      streamState.progress = Math.max(streamState.progress, naturalProgress + jitter);

      // Emit progress update if enough time has passed (throttling)
      const lastUpdate = this.updateThrottle.get(operationId) || 0;
      const minInterval = 1000 / this.config.maxUpdatesPerSecond;

      if (Date.now() - lastUpdate >= minInterval) {
        this.updateThrottle.set(operationId, Date.now());

        this.emit('progress', {
          type: 'progress',
          message: this.getProgressMessage(streamState.progress),
          progress: Math.round(streamState.progress),
          timestamp: Date.now()
        });
      }
    }, this.config.progressInterval);
  }

  /**
   * Get queued updates for an operation
   */
  private async *getQueuedUpdates(operationId: string): AsyncIterableIterator<ProcessingUpdate> {
    // This would emit any updates that were queued during execution
    // For now, we'll just yield if there were any important intermediate steps
    const streamState = this.activeStreams.get(operationId);
    if (streamState && streamState.progress < 100) {
      yield {
        type: 'progress',
        message: '🔄 Finalizing...',
        progress: 95,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get progress message based on completion percentage
   */
  private getProgressMessage(progress: number): string {
    if (progress < 25) return '🚀 Getting started...';
    if (progress < 50) return '⚙️ Processing...';
    if (progress < 75) return '🔄 Making progress...';
    if (progress < 95) return '✨ Almost done...';
    return '🎯 Finishing up...';
  }

  /**
   * Generate unique operation ID
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get active stream count
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get stream statistics
   */
  getStreamStats(): StreamStats {
    const activeStreams = Array.from(this.activeStreams.values());

    return {
      activeCount: activeStreams.length,
      averageProgress: activeStreams.length > 0
        ? activeStreams.reduce((sum, s) => sum + s.progress, 0) / activeStreams.length
        : 0,
      oldestStreamAge: activeStreams.length > 0
        ? Math.max(...activeStreams.map(s => Date.now() - s.startTime))
        : 0
    };
  }
}

interface StreamState {
  id: string;
  startTime: number;
  phase: 'starting' | 'executing' | 'completed';
  progress: number;
}

interface StreamStats {
  activeCount: number;
  averageProgress: number;
  oldestStreamAge: number;
}