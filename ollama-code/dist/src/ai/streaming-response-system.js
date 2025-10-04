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
import { logger } from '../utils/logger.js';
export var ProgressType;
(function (ProgressType) {
    ProgressType["ANALYSIS"] = "analysis";
    ProgressType["GENERATION"] = "generation";
    ProgressType["PROCESSING"] = "processing";
    ProgressType["INDEXING"] = "indexing";
    ProgressType["SEARCH"] = "search";
    ProgressType["COMPLETION"] = "completion";
})(ProgressType || (ProgressType = {}));
/**
 * Main streaming response system
 */
export class StreamingResponseSystem extends EventEmitter {
    activeStreams = new Map();
    completedStreams = new Map();
    progressBuffer = new Map();
    tokenBuffer = new Map();
    config;
    performanceMetrics = {
        totalStreams: 0,
        completedStreams: 0,
        cancelledStreams: 0,
        errorStreams: 0,
        averageCompletionTime: 0,
        totalTokensStreamed: 0,
        averageTokensPerSecond: 0
    };
    constructor(config = {}) {
        super();
        this.config = {
            enableProgressTracking: true,
            enableTokenStreaming: true,
            progressUpdateIntervalMs: 250,
            tokenBufferSize: 100,
            maxConcurrentStreams: 10,
            timeoutMs: 300000, // 5 minutes
            retryAttempts: 3,
            ...config
        };
        this.startPerformanceMonitoring();
    }
    /**
     * Create a new streaming operation
     */
    createStream(type, operation, options = {}) {
        const id = this.generateStreamId();
        const stream = {
            id,
            type,
            startTime: new Date(),
            status: 'pending',
            streamedTokens: 0,
            progress: [],
            ...options
        };
        // Add cancellation support
        stream.cancel = () => this.cancelStream(id);
        this.activeStreams.set(id, stream);
        this.progressBuffer.set(id, []);
        if (this.config.enableTokenStreaming) {
            this.tokenBuffer.set(id, []);
        }
        // Start timeout timer
        const timeout = setTimeout(() => {
            this.handleStreamTimeout(id);
        }, this.config.timeoutMs);
        stream.cancel = () => {
            clearTimeout(timeout);
            this.cancelStream(id);
        };
        this.performanceMetrics.totalStreams++;
        logger.info('Stream created', {
            streamId: id,
            type,
            operation,
            concurrent: this.activeStreams.size
        });
        this.emit('stream:created', { stream });
        return stream;
    }
    /**
     * Update progress for a stream
     */
    updateProgress(streamId, stage, progress, message, metadata = {}) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) {
            logger.warn('Progress update for non-existent stream', { streamId });
            return;
        }
        const progressUpdate = {
            id: this.generateProgressId(),
            type: stream.type,
            stage,
            progress: Math.min(100, Math.max(0, progress)),
            message,
            timestamp: new Date(),
            metadata: {
                operation: metadata.operation || stage,
                currentStep: metadata.currentStep,
                totalSteps: metadata.totalSteps,
                context: metadata.context,
                performance: this.gatherPerformanceMetrics()
            },
            estimatedTimeRemaining: this.estimateTimeRemaining(stream, progress)
        };
        stream.progress.push(progressUpdate);
        if (this.config.enableProgressTracking) {
            this.progressBuffer.get(streamId)?.push(progressUpdate);
        }
        // Update stream status
        if (progress >= 100) {
            stream.status = 'completed';
        }
        else if (stream.status === 'pending') {
            stream.status = 'running';
        }
        // Call progress callback
        if (stream.onProgress) {
            try {
                stream.onProgress(progressUpdate);
            }
            catch (error) {
                logger.warn('Progress callback error', { streamId, error });
            }
        }
        logger.debug('Progress updated', {
            streamId,
            stage,
            progress,
            message: message.substring(0, 50)
        });
        this.emit('stream:progress', { streamId, progress: progressUpdate });
    }
    /**
     * Stream a token for real-time text generation
     */
    streamToken(streamId, token, type = 'text', options = {}) {
        const stream = this.activeStreams.get(streamId);
        if (!stream || !this.config.enableTokenStreaming) {
            return;
        }
        const streamToken = {
            token,
            position: stream.streamedTokens,
            type,
            confidence: options.confidence,
            metadata: options.metadata
        };
        stream.streamedTokens++;
        this.performanceMetrics.totalTokensStreamed++;
        // Add to buffer
        const buffer = this.tokenBuffer.get(streamId);
        if (buffer) {
            buffer.push(streamToken);
            // Limit buffer size
            if (buffer.length > this.config.tokenBufferSize) {
                buffer.shift();
            }
        }
        // Call token callback
        if (stream.onToken) {
            try {
                stream.onToken(streamToken);
            }
            catch (error) {
                logger.warn('Token callback error', { streamId, error });
            }
        }
        this.emit('stream:token', { streamId, token: streamToken });
    }
    /**
     * Complete a stream operation
     */
    completeStream(streamId, result) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) {
            logger.warn('Completing non-existent stream', { streamId });
            return;
        }
        stream.status = 'completed';
        const completionTime = Date.now() - stream.startTime.getTime();
        // Update performance metrics
        this.performanceMetrics.completedStreams++;
        this.updateAverageCompletionTime(completionTime);
        this.updateAverageTokensPerSecond(stream.streamedTokens, completionTime);
        // Final progress update
        this.updateProgress(streamId, 'completed', 100, 'Operation completed successfully', { operation: 'completion' });
        // Call completion callback
        if (stream.onComplete) {
            try {
                stream.onComplete(result);
            }
            catch (error) {
                logger.warn('Completion callback error', { streamId, error });
            }
        }
        // Move to completed streams
        this.completedStreams.set(streamId, stream);
        this.activeStreams.delete(streamId);
        logger.info('Stream completed', {
            streamId,
            type: stream.type,
            duration: completionTime,
            tokens: stream.streamedTokens
        });
        this.emit('stream:completed', { streamId, stream, result });
    }
    /**
     * Handle stream error
     */
    errorStream(streamId, error) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) {
            return;
        }
        stream.status = 'error';
        this.performanceMetrics.errorStreams++;
        // Call error callback
        if (stream.onError) {
            try {
                stream.onError(error);
            }
            catch (callbackError) {
                logger.warn('Error callback error', { streamId, callbackError });
            }
        }
        // Move to completed streams for debugging
        this.completedStreams.set(streamId, stream);
        this.activeStreams.delete(streamId);
        logger.error('Stream error', {
            streamId,
            type: stream.type,
            error: error.message,
            duration: Date.now() - stream.startTime.getTime()
        });
        this.emit('stream:error', { streamId, stream, error });
    }
    /**
     * Cancel a stream operation
     */
    cancelStream(streamId) {
        const stream = this.activeStreams.get(streamId);
        if (!stream) {
            return;
        }
        stream.status = 'cancelled';
        this.performanceMetrics.cancelledStreams++;
        // Cleanup buffers
        this.progressBuffer.delete(streamId);
        this.tokenBuffer.delete(streamId);
        // Move to completed streams
        this.completedStreams.set(streamId, stream);
        this.activeStreams.delete(streamId);
        logger.info('Stream cancelled', {
            streamId,
            type: stream.type,
            duration: Date.now() - stream.startTime.getTime()
        });
        this.emit('stream:cancelled', { streamId, stream });
    }
    /**
     * Get all active streams
     */
    getActiveStreams() {
        return Array.from(this.activeStreams.values());
    }
    /**
     * Get stream by ID
     */
    getStream(streamId) {
        return this.activeStreams.get(streamId) || this.completedStreams.get(streamId);
    }
    /**
     * Get stream progress history
     */
    getStreamProgress(streamId) {
        return this.progressBuffer.get(streamId) || [];
    }
    /**
     * Get stream token history
     */
    getStreamTokens(streamId) {
        return this.tokenBuffer.get(streamId) || [];
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            activeStreams: this.activeStreams.size,
            completedStreams: this.completedStreams.size,
            uptime: process.uptime()
        };
    }
    /**
     * Cleanup completed streams older than specified time
     */
    cleanupOldStreams(maxAgeMs = 3600000) {
        const cutoff = Date.now() - maxAgeMs;
        for (const [id, stream] of this.completedStreams.entries()) {
            if (stream.startTime.getTime() < cutoff) {
                this.completedStreams.delete(id);
                this.progressBuffer.delete(id);
                this.tokenBuffer.delete(id);
            }
        }
    }
    // Private helper methods
    generateStreamId() {
        return `stream_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    generateProgressId() {
        return `progress_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }
    estimateTimeRemaining(stream, currentProgress) {
        if (currentProgress <= 0)
            return undefined;
        const elapsed = Date.now() - stream.startTime.getTime();
        const totalEstimated = (elapsed / currentProgress) * 100;
        return Math.max(0, totalEstimated - elapsed);
    }
    gatherPerformanceMetrics() {
        return {
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
            tokensPerSecond: this.performanceMetrics.averageTokensPerSecond
        };
    }
    handleStreamTimeout(streamId) {
        const stream = this.activeStreams.get(streamId);
        if (stream && stream.status === 'running') {
            this.errorStream(streamId, new Error('Stream operation timed out'));
        }
    }
    updateAverageCompletionTime(completionTime) {
        const completed = this.performanceMetrics.completedStreams;
        if (completed === 1) {
            this.performanceMetrics.averageCompletionTime = completionTime;
        }
        else {
            this.performanceMetrics.averageCompletionTime =
                (this.performanceMetrics.averageCompletionTime * (completed - 1) + completionTime) / completed;
        }
    }
    updateAverageTokensPerSecond(tokens, timeMs) {
        const tokensPerSecond = (tokens / timeMs) * 1000;
        const totalStreams = this.performanceMetrics.completedStreams;
        if (totalStreams === 1) {
            this.performanceMetrics.averageTokensPerSecond = tokensPerSecond;
        }
        else {
            this.performanceMetrics.averageTokensPerSecond =
                (this.performanceMetrics.averageTokensPerSecond * (totalStreams - 1) + tokensPerSecond) / totalStreams;
        }
    }
    startPerformanceMonitoring() {
        // Cleanup old streams every 30 minutes
        setInterval(() => {
            this.cleanupOldStreams();
        }, 30 * 60 * 1000);
        // Performance metrics logging every 5 minutes
        setInterval(() => {
            if (this.activeStreams.size > 0 || this.completedStreams.size > 0) {
                logger.info('Streaming performance metrics', this.getPerformanceMetrics());
            }
        }, 5 * 60 * 1000);
    }
}
// Global streaming system instance
export const globalStreamingSystem = new StreamingResponseSystem();
//# sourceMappingURL=streaming-response-system.js.map