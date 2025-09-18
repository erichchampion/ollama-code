/**
 * Simple spinner utility for showing progress during long operations
 */
export class Spinner {
    frames = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
    currentFrame = 0;
    interval = null;
    text;
    isSpinning = false;
    constructor(text = 'Processing...') {
        this.text = text;
    }
    /**
     * Start the spinner animation
     */
    start() {
        if (this.isSpinning)
            return;
        this.isSpinning = true;
        this.currentFrame = 0;
        // Only show spinner in interactive terminals
        if (!process.stdout.isTTY) {
            process.stdout.write(`${this.text}\n`);
            return;
        }
        // Hide cursor
        process.stdout.write('\x1B[?25l');
        this.interval = setInterval(() => {
            this.render();
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 100); // Update every 100ms
        // Initial render
        this.render();
    }
    /**
     * Stop the spinner and clean up
     */
    stop() {
        if (!this.isSpinning)
            return;
        this.isSpinning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (process.stdout.isTTY) {
            // Clear the spinner line
            process.stdout.write('\r\x1B[K');
            // Show cursor
            process.stdout.write('\x1B[?25h');
        }
    }
    /**
     * Update the spinner text
     */
    setText(text) {
        this.text = text;
        if (this.isSpinning && process.stdout.isTTY) {
            this.render();
        }
    }
    /**
     * Render the current frame
     */
    render() {
        if (!process.stdout.isTTY)
            return;
        const frame = this.frames[this.currentFrame];
        const output = `\r${frame} ${this.text}`;
        process.stdout.write(output);
    }
    /**
     * Stop and show success message
     */
    succeed(message) {
        this.stop();
        if (message && process.stdout.isTTY) {
            process.stdout.write(`✓ ${message}\n`);
        }
    }
    /**
     * Stop and show error message
     */
    fail(message) {
        this.stop();
        if (message && process.stdout.isTTY) {
            process.stdout.write(`✗ ${message}\n`);
        }
    }
}
/**
 * Create and start a spinner with the given text
 */
export function createSpinner(text = 'Processing...') {
    const spinner = new Spinner(text);
    return spinner;
}
/**
 * Run a function with a spinner
 */
export async function withSpinner(text, fn) {
    const spinner = createSpinner(text);
    spinner.start();
    try {
        const result = await fn();
        spinner.succeed();
        return result;
    }
    catch (error) {
        spinner.fail();
        throw error;
    }
}
//# sourceMappingURL=spinner.js.map