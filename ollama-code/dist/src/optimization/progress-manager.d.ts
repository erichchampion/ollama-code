/**
 * Progress Indicator System
 *
 * Provides comprehensive progress tracking for long-running operations:
 * - Visual progress indicators with ETA
 * - Cancellation support
 * - Background task monitoring
 * - Multi-step operation tracking
 */
interface ProgressStep {
    id: string;
    name: string;
    weight: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: number;
    endTime?: number;
    progress?: number;
}
interface ProgressOptions {
    title: string;
    steps?: ProgressStep[];
    estimatedDuration?: number;
    showPercentage?: boolean;
    showETA?: boolean;
    cancellable?: boolean;
}
interface ProgressUpdateEvent {
    stepId?: string;
    progress?: number;
    message?: string;
    details?: Record<string, any>;
}
export declare class ProgressManager {
    private activeOperations;
    /**
     * Start a new progress operation
     */
    startProgress(id: string, options: ProgressOptions): ProgressOperation;
    /**
     * Get active progress operation
     */
    getProgress(id: string): ProgressOperation | null;
    /**
     * Complete and remove progress operation
     */
    completeProgress(id: string): void;
    /**
     * Cancel progress operation
     */
    cancelProgress(id: string): void;
    /**
     * Get all active operations
     */
    getActiveOperations(): ProgressOperation[];
    /**
     * Cleanup completed operations
     */
    cleanup(): void;
    /**
     * Dispose of the progress manager and clean up resources
     */
    dispose(): Promise<void>;
}
export declare class ProgressOperation {
    private id;
    private options;
    private steps;
    private startTime;
    private currentStep?;
    private cancelled;
    private completed;
    private spinner;
    private abortController?;
    constructor(id: string, options: ProgressOptions);
    /**
     * Update progress
     */
    updateProgress(event: ProgressUpdateEvent): void;
    /**
     * Start a specific step
     */
    startStep(stepId: string): void;
    /**
     * Complete a specific step
     */
    completeStep(stepId: string): void;
    /**
     * Fail a specific step
     */
    failStep(stepId: string, error?: string): void;
    /**
     * Set overall progress message
     */
    setMessage(message: string): void;
    /**
     * Complete the entire operation
     */
    complete(): void;
    /**
     * Cancel the operation
     */
    cancel(): void;
    /**
     * Get abort signal for cancellation
     */
    getAbortSignal(): AbortSignal | undefined;
    /**
     * Check if operation is completed
     */
    isCompleted(): boolean;
    /**
     * Get current progress percentage
     */
    getProgressPercentage(): number;
    /**
     * Get estimated time remaining
     */
    getETA(): number | null;
    /**
     * Get operation summary
     */
    getSummary(): {
        id: string;
        title: string;
        progress: number;
        eta: number | null;
        elapsed: number;
        steps: ProgressStep[];
        status: 'running' | 'completed' | 'cancelled';
    };
    /**
     * Initialize progress display
     */
    private initializeDisplay;
    /**
     * Update progress display
     */
    private updateDisplay;
    /**
     * Finalize progress display
     */
    private finalizeDisplay;
}
/**
 * Utility function to wrap async operations with progress tracking
 */
export declare function withProgress<T>(id: string, options: ProgressOptions, operation: (progress: ProgressOperation) => Promise<T>): Promise<T>;
/**
 * Utility for AI operations with progress tracking
 */
export declare function withAIProgress<T>(operation: string, task: (progress: ProgressOperation) => Promise<T>): Promise<T>;
export {};
