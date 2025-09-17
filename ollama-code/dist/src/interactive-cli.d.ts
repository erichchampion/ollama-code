#!/usr/bin/env node
/**
 * Interactive Ollama Code CLI
 *
 * Provides an interactive command-line interface with advanced features
 * including command history, context awareness, and rich terminal UI.
 */
/**
 * Main application class
 */
declare class OllamaCodeCLI {
    private terminal;
    private commandProcessor;
    private errorHandler;
    private isRunning;
    private config;
    constructor();
    /**
     * Initialize the CLI application
     */
    initialize(): Promise<void>;
    /**
     * Start the interactive CLI
     */
    start(): Promise<void>;
    /**
     * Display welcome message
     */
    private displayWelcome;
    /**
     * Run the main interactive loop
     */
    private runInteractiveLoop;
    /**
     * Process a command input
     */
    private processCommand;
    /**
     * Parse input string into command and arguments
     */
    private parseInput;
    /**
     * Handle built-in commands that don't go through the command registry
     */
    private handleBuiltInCommands;
    /**
     * Display help information
     */
    private displayHelp;
    /**
     * Display current status
     */
    private displayStatus;
    /**
     * Display command history
     */
    private displayHistory;
    /**
     * Stop the CLI
     */
    stop(): Promise<void>;
}
export default OllamaCodeCLI;
