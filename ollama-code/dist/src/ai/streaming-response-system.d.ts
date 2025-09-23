/**
 * Streaming Response System for Real-time AI Feedback
 *
 * Provides real-time progress updates and streaming responses for AI operations:
 * - Progress tracking with detailed status updates
 * - Token-by-token streaming for generation tasks
 * - Cancellable operations with cleanup
 * - Performance metrics and monitoring
 * - User experience optimization
 */
import { EventEmitter } from 'events';
export interface StreamProgress {
    id: string;
    type: ProgressType;
    stage: string;
    progress: number;
    message: string;
    timestamp: Date;
    metadata: ProgressMetadata;
    estimatedTimeRemaining?: number;
}
export declare enum ProgressType {
    ANALYSIS = "analysis",
    GENERATION = "generation",
    PROCESSING = "processing",
    INDEXING = "indexing",
    SEARCH = "search",
    COMPLETION = "completion"
}
export interface ProgressMetadata {
    totalSteps?: number;
    currentStep?: number;
    operation: string;
    context?: Record<string, any>;
    performance?: {
        tokensPerSecond?: number;
        memoryUsage?: number;
        cpuUsage?: number;
    };
}
export interface StreamToken {
    token: string;
    position: number;
    confidence?: number;
    type: 'text' | 'code' | 'markdown' | 'json';
    metadata?: {
        isComplete?: boolean;
        partialState?: string;
    };
}
export interface StreamOperation {
    id: string;
    type: ProgressType;
    startTime: Date;
    status: 'pending' | 'running' | 'completed' | 'cancelled' | 'error';
    totalTokens?: number;
    streamedTokens: number;
    progress: StreamProgress[];
    onProgress?: (progress: StreamProgress) => void;
    onToken?: (token: StreamToken) => void;
    onComplete?: (result: any) => void;
    onError?: (error: Error) => void;
    cancel?: () => void;
}
export interface StreamingConfig {
    enableProgressTracking: boolean;
    enableTokenStreaming: boolean;
    progressUpdateIntervalMs: number;
    tokenBufferSize: number;
    maxConcurrentStreams: number;
    timeoutMs: number;
    retryAttempts: number;
}
/**
 * Main streaming response system
 */
export declare class StreamingResponseSystem extends EventEmitter {
    private activeStreams;
    private completedStreams;
    private progressBuffer;
    private tokenBuffer;
    private config;
    private performanceMetrics;
    constructor(config?: Partial<StreamingConfig>);
    /**
     * Create a new streaming operation
     */
    createStream(type: ProgressType, operation: string, options?: {
        onProgress?: (progress: StreamProgress) => void;
        onToken?: (token: StreamToken) => void;
        onComplete?: (result: any) => void;
        onError?: (error: Error) => void;
        totalSteps?: number;
        context?: Record<string, any>;
    }): StreamOperation;
    /**
     * Update progress for a stream
     */
    updateProgress(streamId: string, stage: string, progress: number, message: string, metadata?: Partial<ProgressMetadata>): void;
    /**
     * Stream a token for real-time text generation
     */
    streamToken(streamId: string, token: string, type?: 'text' | 'code' | 'markdown' | 'json', options?: {
        confidence?: number;
        metadata?: Partial<StreamToken['metadata']>;
    }): void;
    /**
     * Complete a stream operation
     */
    completeStream(streamId: string, result: any): void;
    /**
     * Handle stream error
     */
    errorStream(streamId: string, error: Error): void;
    /**
     * Cancel a stream operation
     */
    cancelStream(streamId: string): void;
    /**
     * Get all active streams
     */
    getActiveStreams(): StreamOperation[];
    /**
     * Get stream by ID
     */
    getStream(streamId: string): StreamOperation | undefined;
    /**
     * Get stream progress history
     */
    getStreamProgress(streamId: string): StreamProgress[];
    /**
     * Get stream token history
     */
    getStreamTokens(streamId: string): StreamToken[];
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        activeStreams: number;
        completedStreams: number;
        uptime: number;
        totalStreams: number;
        cancelledStreams: number;
        errorStreams: number;
        averageCompletionTime: number;
        totalTokensStreamed: number;
        averageTokensPerSecond: number;
    };
    /**
     * Cleanup completed streams older than specified time
     */
    cleanupOldStreams(maxAgeMs?: number): void;
    private generateStreamId;
    private generateProgressId;
    private estimateTimeRemaining;
    private gatherPerformanceMetrics;
    private handleStreamTimeout;
    private updateAverageCompletionTime;
    private updateAverageTokensPerSecond;
    private startPerformanceMonitoring;
}
export declare const globalStreamingSystem: StreamingResponseSystem;
