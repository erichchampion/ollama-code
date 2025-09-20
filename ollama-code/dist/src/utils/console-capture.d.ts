/**
 * Console Capture Utility
 *
 * Provides thread-safe console output capturing for command execution
 * and other scenarios where console output needs to be intercepted.
 */
export interface ConsoleCaptureOptions {
    includeStderr?: boolean;
    maxOutputSize?: number;
    timeout?: number;
}
/**
 * Thread-safe console output capture utility
 */
export declare class ConsoleCapture {
    private originalLog;
    private originalError;
    private originalWarn;
    private originalInfo;
    private output;
    private errorOutput;
    private isCapturing;
    private options;
    private startTime;
    constructor(options?: ConsoleCaptureOptions);
    /**
     * Start capturing console output
     */
    start(): void;
    /**
     * Stop capturing and return captured output
     */
    stop(): {
        output: string;
        errorOutput: string;
        duration: number;
    };
    /**
     * Get current captured output without stopping capture
     */
    getCurrentOutput(): {
        output: string;
        errorOutput: string;
    };
    /**
     * Check if capture is active
     */
    isActive(): boolean;
    /**
     * Clear captured output without stopping capture
     */
    clear(): void;
    /**
     * Safely append to output with size limits
     */
    private appendOutput;
    /**
     * Safely append to error output with size limits
     */
    private appendErrorOutput;
}
/**
 * Convenience function to capture console output during async operation
 */
export declare function captureConsoleOutput<T>(operation: () => Promise<T>, options?: ConsoleCaptureOptions): Promise<{
    result: T;
    output: string;
    errorOutput: string;
    duration: number;
}>;
/**
 * Convenience function to capture console output during sync operation
 */
export declare function captureConsoleOutputSync<T>(operation: () => T, options?: ConsoleCaptureOptions): {
    result: T;
    output: string;
    errorOutput: string;
    duration: number;
};
