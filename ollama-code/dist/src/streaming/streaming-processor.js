/**
 * Streaming Response Processor
 *
 * Provides real-time feedback to users during command processing
 * to improve perceived performance and user experience.
 */
import { EventEmitter } from 'events';
import { normalizeError } from '../utils/error-utils.js';
import { logger } from '../utils/logger.js';
import { delay } from '../utils/async.js';
import { generateOperationId } from '../utils/id-generator.js';
import { STREAMING_DEFAULTS, STREAMING_CONFIG_DEFAULTS } from '../constants/streaming.js';
import { PROGRESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';
/**
 * Streaming processor for real-time user feedback
 */
export class StreamingProcessor extends EventEmitter {
    config;
    activeStreams = new Map();
    updateThrottle = new Map();
    constructor(config = {}) {
        super();
        this.config = {
            ...STREAMING_CONFIG_DEFAULTS,
            ...config
        };
    }
    /**
     * Start streaming for a processing operation
     */
    async *processWithStreaming(operation, operationId = generateOperationId()) {
        if (!this.config.enableStreaming) {
            // If streaming is disabled, just execute and return final result
            try {
                const result = await operation();
                yield {
                    type: 'completed',
                    message: PROGRESS_MESSAGES.COMPLETED_GENERIC,
                    data: result,
                    timestamp: Date.now()
                };
            }
            catch (error) {
                yield {
                    type: 'error',
                    message: normalizeError(error).message,
                    timestamp: Date.now()
                };
            }
            return;
        }
        const streamState = {
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
                message: PROGRESS_MESSAGES.STARTED,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.STARTED,
                timestamp: Date.now()
            };
            // Start progress simulation
            const progressInterval = this.startProgressSimulation(operationId);
            // Execute the operation with progress updates
            let result;
            try {
                result = await this.executeWithProgress(operation, operationId);
            }
            finally {
                clearInterval(progressInterval);
            }
            // Emit progress updates that were queued during execution
            for await (const update of this.getQueuedUpdates(operationId)) {
                yield update;
            }
            // Final completion update
            streamState.phase = 'completed';
            streamState.progress = STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.COMPLETED;
            yield {
                type: 'completed',
                message: PROGRESS_MESSAGES.COMPLETED_SUCCESS,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.COMPLETED,
                data: result,
                timestamp: Date.now()
            };
        }
        catch (error) {
            logger.error('Streaming operation failed:', error);
            yield {
                type: 'error',
                message: `❌ ${normalizeError(error).message}`,
                timestamp: Date.now()
            };
        }
        finally {
            this.activeStreams.delete(operationId);
            this.updateThrottle.delete(operationId);
        }
    }
    /**
     * Process command with real-time feedback
     */
    async *processCommand(commandName, args, executor) {
        const operationId = generateOperationId();
        yield {
            type: 'started',
            message: `${PROGRESS_MESSAGES.COMMAND_STARTED}: ${commandName}`,
            progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.STARTED,
            timestamp: Date.now()
        };
        // Simulate preparation phase
        await delay(STREAMING_DEFAULTS.COMMAND_PREP_DELAY);
        yield {
            type: 'progress',
            message: PROGRESS_MESSAGES.COMMAND_PREPARING,
            progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.PREPARATION,
            timestamp: Date.now()
        };
        try {
            // Execute command with progress tracking
            yield {
                type: 'executing',
                message: PROGRESS_MESSAGES.COMMAND_RUNNING,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.EXECUTION,
                timestamp: Date.now()
            };
            const result = await executor(commandName, args);
            yield {
                type: 'progress',
                message: PROGRESS_MESSAGES.COMMAND_PROCESSING,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.PROCESSING,
                timestamp: Date.now()
            };
            await delay(STREAMING_DEFAULTS.BRIEF_PAUSE_DELAY); // Brief pause for user experience
            yield {
                type: 'completed',
                message: PROGRESS_MESSAGES.COMMAND_COMPLETED,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.COMPLETED,
                data: result,
                timestamp: Date.now()
            };
        }
        catch (error) {
            yield {
                type: 'error',
                message: `${PROGRESS_MESSAGES.COMMAND_FAILED}: ${normalizeError(error).message}`,
                timestamp: Date.now()
            };
        }
    }
    /**
     * Process AI analysis with thinking steps
     */
    async *processAIAnalysis(message, analyzer) {
        yield {
            type: 'started',
            message: PROGRESS_MESSAGES.AI_ANALYZING,
            progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.STARTED,
            timestamp: Date.now()
        };
        if (this.config.includeThinkingSteps) {
            // Simulate thinking process with realistic steps
            const thinkingSteps = [
                PROGRESS_MESSAGES.THINKING_UNDERSTANDING,
                PROGRESS_MESSAGES.THINKING_PROCESSING,
                PROGRESS_MESSAGES.THINKING_KNOWLEDGE,
                PROGRESS_MESSAGES.THINKING_GENERATING
            ];
            for (let i = 0; i < thinkingSteps.length; i++) {
                await delay(STREAMING_DEFAULTS.THINKING_STEP_BASE_DELAY + Math.random() * STREAMING_DEFAULTS.THINKING_STEP_MAX_DELAY);
                yield {
                    type: 'thinking',
                    message: thinkingSteps[i],
                    progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.PREPARATION + (i * STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.PREPARATION),
                    timestamp: Date.now()
                };
            }
        }
        try {
            yield {
                type: 'executing',
                message: PROGRESS_MESSAGES.AI_FINALIZING,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.PROCESSING,
                timestamp: Date.now()
            };
            const result = await analyzer(message);
            yield {
                type: 'completed',
                message: PROGRESS_MESSAGES.AI_COMPLETED,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.COMPLETED,
                data: result,
                timestamp: Date.now()
            };
        }
        catch (error) {
            yield {
                type: 'error',
                message: `${PROGRESS_MESSAGES.AI_FAILED}: ${normalizeError(error).message}`,
                timestamp: Date.now()
            };
        }
    }
    /**
     * Execute operation with progress tracking
     */
    async executeWithProgress(operation, operationId) {
        const streamState = this.activeStreams.get(operationId);
        if (!streamState) {
            throw new Error(ERROR_MESSAGES.STREAM_STATE_NOT_FOUND);
        }
        // Update progress periodically during execution
        streamState.phase = 'executing';
        return await operation();
    }
    /**
     * Start progress simulation for long-running operations
     * FIXED: Properly clear interval to prevent memory leaks
     */
    startProgressSimulation(operationId) {
        const intervalId = setInterval(() => {
            const streamState = this.activeStreams.get(operationId);
            if (!streamState || streamState.phase === 'completed') {
                clearInterval(intervalId); // FIX: Clear interval to prevent memory leak
                this.updateThrottle.delete(operationId); // FIX: Clean up throttle map
                return;
            }
            // Simulate gradual progress
            const elapsed = Date.now() - streamState.startTime;
            const estimatedDuration = STREAMING_DEFAULTS.ESTIMATED_DURATION;
            const naturalProgress = Math.min(STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.FINALIZATION, (elapsed / estimatedDuration) * 100);
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
        return intervalId;
    }
    /**
     * Get queued updates for an operation
     */
    async *getQueuedUpdates(operationId) {
        // This would emit any updates that were queued during execution
        // For now, we'll just yield if there were any important intermediate steps
        const streamState = this.activeStreams.get(operationId);
        if (streamState && streamState.progress < STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.COMPLETED) {
            yield {
                type: 'progress',
                message: PROGRESS_MESSAGES.FINALIZING,
                progress: STREAMING_DEFAULTS.PROGRESS_THRESHOLDS.FINALIZATION,
                timestamp: Date.now()
            };
        }
    }
    /**
     * Get progress message based on completion percentage
     */
    getProgressMessage(progress) {
        if (progress < STREAMING_DEFAULTS.PROGRESS_BOUNDARIES.GETTING_STARTED)
            return PROGRESS_MESSAGES.GETTING_STARTED;
        if (progress < STREAMING_DEFAULTS.PROGRESS_BOUNDARIES.PROCESSING)
            return PROGRESS_MESSAGES.PROCESSING;
        if (progress < STREAMING_DEFAULTS.PROGRESS_BOUNDARIES.MAKING_PROGRESS)
            return PROGRESS_MESSAGES.MAKING_PROGRESS;
        if (progress < STREAMING_DEFAULTS.PROGRESS_BOUNDARIES.ALMOST_DONE)
            return PROGRESS_MESSAGES.ALMOST_DONE;
        return PROGRESS_MESSAGES.FINISHING_UP;
    }
    // NOTE: generateId() and delay() functions removed - using shared utilities instead
    /**
     * Get active stream count
     */
    getActiveStreamCount() {
        return this.activeStreams.size;
    }
    /**
     * Get stream statistics
     */
    getStreamStats() {
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
//# sourceMappingURL=streaming-processor.js.map