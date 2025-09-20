/**
 * Streaming Response Processor
 *
 * Provides real-time feedback to users during command processing
 * to improve perceived performance and user experience.
 */
import { EventEmitter } from 'events';
export interface ProcessingUpdate {
    type: 'started' | 'progress' | 'thinking' | 'executing' | 'completed' | 'error';
    message: string;
    progress?: number;
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
export declare class StreamingProcessor extends EventEmitter {
    private readonly config;
    private readonly activeStreams;
    private updateThrottle;
    constructor(config?: Partial<StreamingConfig>);
    /**
     * Start streaming for a processing operation
     */
    processWithStreaming<T>(operation: () => Promise<T>, operationId?: string): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Process command with real-time feedback
     */
    processCommand(commandName: string, args: string[], executor: (cmd: string, args: string[]) => Promise<string>): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Process AI analysis with thinking steps
     */
    processAIAnalysis(message: string, analyzer: (msg: string) => Promise<any>): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Execute operation with progress tracking
     */
    private executeWithProgress;
    /**
     * Start progress simulation for long-running operations
     */
    private startProgressSimulation;
    /**
     * Get queued updates for an operation
     */
    private getQueuedUpdates;
    /**
     * Get progress message based on completion percentage
     */
    private getProgressMessage;
    /**
     * Generate unique operation ID
     */
    private generateId;
    /**
     * Utility delay function
     */
    private delay;
    /**
     * Get active stream count
     */
    getActiveStreamCount(): number;
    /**
     * Get stream statistics
     */
    getStreamStats(): StreamStats;
}
interface StreamStats {
    activeCount: number;
    averageProgress: number;
    oldestStreamAge: number;
}
export {};
