/**
 * Simple spinner utility for showing progress during long operations
 */
export declare class Spinner {
    private frames;
    private currentFrame;
    private interval;
    private text;
    private isSpinning;
    constructor(text?: string);
    /**
     * Start the spinner animation
     */
    start(): void;
    /**
     * Stop the spinner and clean up
     */
    stop(): void;
    /**
     * Update the spinner text
     */
    setText(text: string): void;
    /**
     * Render the current frame
     */
    private render;
    /**
     * Stop and show success message
     */
    succeed(message?: string): void;
    /**
     * Stop and show error message
     */
    fail(message?: string): void;
}
/**
 * Create and start a spinner with the given text
 */
export declare function createSpinner(text?: string): Spinner;
/**
 * Run a function with a spinner
 */
export declare function withSpinner<T>(text: string, fn: () => Promise<T>): Promise<T>;
