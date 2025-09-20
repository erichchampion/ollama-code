/**
 * Console Capture Utility
 *
 * Provides thread-safe console output capturing for command execution
 * and other scenarios where console output needs to be intercepted.
 */
import { logger } from './logger.js';
/**
 * Thread-safe console output capture utility
 */
export class ConsoleCapture {
    originalLog;
    originalError;
    originalWarn;
    originalInfo;
    output = '';
    errorOutput = '';
    isCapturing = false;
    options;
    startTime = 0;
    constructor(options = {}) {
        this.options = {
            includeStderr: false,
            maxOutputSize: 1024 * 1024, // 1MB default
            timeout: 30000, // 30 seconds default
            ...options
        };
        // Store original console methods
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;
        this.originalInfo = console.info;
    }
    /**
     * Start capturing console output
     */
    start() {
        if (this.isCapturing) {
            logger.warn('Console capture already active');
            return;
        }
        this.isCapturing = true;
        this.output = '';
        this.errorOutput = '';
        this.startTime = Date.now();
        // Override console methods
        console.log = (...args) => {
            this.appendOutput(args.join(' ') + '\n');
        };
        console.info = (...args) => {
            this.appendOutput('[INFO] ' + args.join(' ') + '\n');
        };
        if (this.options.includeStderr) {
            console.error = (...args) => {
                this.appendErrorOutput('[ERROR] ' + args.join(' ') + '\n');
            };
            console.warn = (...args) => {
                this.appendErrorOutput('[WARN] ' + args.join(' ') + '\n');
            };
        }
    }
    /**
     * Stop capturing and return captured output
     */
    stop() {
        if (!this.isCapturing) {
            logger.warn('Console capture not active');
            return { output: '', errorOutput: '', duration: 0 };
        }
        // Restore original console methods
        console.log = this.originalLog;
        console.error = this.originalError;
        console.warn = this.originalWarn;
        console.info = this.originalInfo;
        this.isCapturing = false;
        const duration = Date.now() - this.startTime;
        return {
            output: this.output,
            errorOutput: this.errorOutput,
            duration
        };
    }
    /**
     * Get current captured output without stopping capture
     */
    getCurrentOutput() {
        return {
            output: this.output,
            errorOutput: this.errorOutput
        };
    }
    /**
     * Check if capture is active
     */
    isActive() {
        return this.isCapturing;
    }
    /**
     * Clear captured output without stopping capture
     */
    clear() {
        this.output = '';
        this.errorOutput = '';
    }
    /**
     * Safely append to output with size limits
     */
    appendOutput(text) {
        if (!this.isCapturing)
            return;
        // Check timeout
        if (this.options.timeout && (Date.now() - this.startTime) > this.options.timeout) {
            this.appendOutput('\n[TIMEOUT] Console capture timed out\n');
            this.stop();
            return;
        }
        // Check size limits
        if (this.options.maxOutputSize && this.output.length + text.length > this.options.maxOutputSize) {
            const truncateMsg = '\n[TRUNCATED] Output too large, truncating...\n';
            this.output = this.output.substring(0, this.options.maxOutputSize - truncateMsg.length) + truncateMsg;
            return;
        }
        this.output += text;
    }
    /**
     * Safely append to error output with size limits
     */
    appendErrorOutput(text) {
        if (!this.isCapturing)
            return;
        // Check size limits
        if (this.options.maxOutputSize && this.errorOutput.length + text.length > this.options.maxOutputSize) {
            const truncateMsg = '\n[TRUNCATED] Error output too large, truncating...\n';
            this.errorOutput = this.errorOutput.substring(0, this.options.maxOutputSize - truncateMsg.length) + truncateMsg;
            return;
        }
        this.errorOutput += text;
    }
}
/**
 * Convenience function to capture console output during async operation
 */
export async function captureConsoleOutput(operation, options = {}) {
    const capture = new ConsoleCapture(options);
    capture.start();
    try {
        const result = await operation();
        const { output, errorOutput, duration } = capture.stop();
        return { result, output, errorOutput, duration };
    }
    catch (error) {
        const { output, errorOutput, duration } = capture.stop();
        throw { error, output, errorOutput, duration };
    }
}
/**
 * Convenience function to capture console output during sync operation
 */
export function captureConsoleOutputSync(operation, options = {}) {
    const capture = new ConsoleCapture(options);
    capture.start();
    try {
        const result = operation();
        const { output, errorOutput, duration } = capture.stop();
        return { result, output, errorOutput, duration };
    }
    catch (error) {
        const { output, errorOutput, duration } = capture.stop();
        throw { error, output, errorOutput, duration };
    }
}
//# sourceMappingURL=console-capture.js.map