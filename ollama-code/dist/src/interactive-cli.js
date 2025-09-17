#!/usr/bin/env node
/**
 * Interactive Ollama Code CLI
 *
 * Provides an interactive command-line interface with advanced features
 * including command history, context awareness, and rich terminal UI.
 */
import { initCommandProcessor, executeCommand } from './commands/index.js';
import { initTerminal } from './terminal/index.js';
import { initErrorHandling } from './errors/index.js';
import { initAI } from './ai/index.js';
import { authManager } from './auth/index.js';
import { ensureOllamaServerRunning } from './utils/ollama-server.js';
import { logger } from './utils/logger.js';
import { loadConfig } from './config/index.js';
import pkg from '../package.json' with { type: 'json' };
/**
 * Main application class
 */
class OllamaCodeCLI {
    terminal;
    commandProcessor;
    errorHandler;
    isRunning = false;
    config;
    constructor() {
        this.terminal = initTerminal();
        this.commandProcessor = null; // Will be initialized later
        this.errorHandler = initErrorHandling();
    }
    /**
     * Initialize the CLI application
     */
    async initialize() {
        try {
            logger.info('Initializing Interactive Ollama Code CLI...');
            // Load configuration
            this.config = await loadConfig();
            // Initialize terminal
            await this.terminal.initialize();
            // Initialize authentication
            await authManager.initialize();
            // Ensure Ollama server is running
            logger.info('Ensuring Ollama server is running...');
            await ensureOllamaServerRunning();
            // Initialize AI
            await initAI();
            // Initialize command processor
            this.commandProcessor = await initCommandProcessor(this.config, {
                terminal: this.terminal,
                auth: authManager,
                ai: null, // Will be handled by individual commands
                codebase: null,
                fileOps: null,
                execution: null,
                errors: this.errorHandler
            });
            logger.info('Interactive CLI initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize interactive CLI:', error);
            throw error;
        }
    }
    /**
     * Start the interactive CLI
     */
    async start() {
        if (this.isRunning) {
            logger.warn('CLI is already running');
            return;
        }
        this.isRunning = true;
        try {
            await this.initialize();
            await this.displayWelcome();
            await this.runInteractiveLoop();
        }
        catch (error) {
            this.errorHandler.handleError(error);
            process.exit(1);
        }
    }
    /**
     * Display welcome message
     */
    async displayWelcome() {
        const version = pkg.version;
        this.terminal.clear();
        this.terminal.display(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                          Ollama Code CLI v${version}                          ║
║                     Interactive AI Coding Assistant                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

Welcome to the interactive Ollama Code CLI! This interface provides:

🔧 Advanced AI-powered code assistance
📝 Code generation, refactoring, and explanation
🔍 Intelligent code search and analysis
⚙️  Configuration and model management
📊 Rich terminal UI with syntax highlighting

Type 'help' for available commands or 'exit' to quit.
`);
        // Display connection status
        if (authManager.isConnected()) {
            this.terminal.success('✅ Connected to Ollama server');
        }
        else {
            this.terminal.warn('⚠️  Not connected to Ollama server');
            this.terminal.info('Run "login" to connect or "help" for more information');
        }
        this.terminal.display(''); // Empty line
    }
    /**
     * Run the main interactive loop
     */
    async runInteractiveLoop() {
        while (this.isRunning) {
            try {
                // Get user input with prompt
                const input = await this.terminal.prompt({
                    type: 'input',
                    name: 'command',
                    message: 'ollama-code>'
                });
                if (!input.command || input.command.trim() === '') {
                    continue;
                }
                // Handle special commands
                if (input.command.toLowerCase() === 'exit' || input.command.toLowerCase() === 'quit') {
                    await this.stop();
                    break;
                }
                if (input.command.toLowerCase() === 'clear') {
                    this.terminal.clear();
                    continue;
                }
                // Process the command
                await this.processCommand(input.command.trim());
            }
            catch (error) {
                this.errorHandler.handleError(error);
                this.terminal.error('An error occurred. Type "help" for assistance or "exit" to quit.');
            }
        }
    }
    /**
     * Process a command input
     */
    async processCommand(input) {
        try {
            // Parse the input to extract command and arguments
            const parts = this.parseInput(input);
            const command = parts[0];
            const args = parts.slice(1);
            // Handle built-in commands first
            if (await this.handleBuiltInCommands(command, args)) {
                return;
            }
            // Process through command registry
            await executeCommand(command, args);
        }
        catch (error) {
            this.errorHandler.handleError(error);
        }
    }
    /**
     * Parse input string into command and arguments
     */
    parseInput(input) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            }
            else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            }
            else if (char === ' ' && !inQuotes) {
                if (current.trim()) {
                    parts.push(current.trim());
                    current = '';
                }
            }
            else {
                current += char;
            }
        }
        if (current.trim()) {
            parts.push(current.trim());
        }
        return parts;
    }
    /**
     * Handle built-in commands that don't go through the command registry
     */
    async handleBuiltInCommands(command, args) {
        switch (command.toLowerCase()) {
            case 'help':
                await this.displayHelp(args[0]);
                return true;
            case 'status':
                await this.displayStatus();
                return true;
            case 'version':
                this.terminal.info(`Ollama Code CLI v${pkg.version}`);
                return true;
            case 'history':
                await this.displayHistory();
                return true;
            default:
                return false;
        }
    }
    /**
     * Display help information
     */
    async displayHelp(commandName) {
        if (commandName) {
            // Display help for specific command
            this.terminal.info(`Help for command: ${commandName}`);
            // This would integrate with the command registry's help system
            this.terminal.display('Use the command registry to get detailed help for specific commands.');
        }
        else {
            // Display general help
            this.terminal.display(`
Available Commands:

🔧 Core Commands:
  ask <question>           Ask Ollama a question about code or programming
  explain <file>           Explain a code file or snippet
  refactor <file>          Refactor code for better readability or performance
  fix <file>               Fix bugs or issues in code
  generate <prompt>        Generate code based on a description

📦 Model Management:
  list-models              List available Ollama models
  pull-model <name>        Download a new model
  set-model <name>         Set the default model for this session

⚙️  System Commands:
  config                   View or edit configuration settings
  login                    Connect to Ollama server
  logout                   Disconnect from Ollama server
  search <term>            Search the codebase for a term
  run <command>            Execute a terminal command
  edit <file>              Edit a file with your default editor

🎨 Interface Commands:
  theme <name>             Change the UI theme (dark, light, system)
  verbosity <level>        Set output verbosity level
  clear                    Clear the screen
  history                  View command history

📊 Information Commands:
  status                   Show current status and connection info
  version                  Show version information
  help [command]           Show this help or help for a specific command
  commands                 List all available commands

💬 Feedback:
  bug <description>        Report a bug or issue
  feedback <content>       Provide general feedback

Session Commands:
  exit, quit               Exit the application
  reset                    Reset conversation context

Examples:
  ask "How do I implement a binary search tree in TypeScript?"
  explain src/utils.ts
  refactor src/main.js --focus performance
  generate "a REST API server with Express" --language TypeScript
  list-models
  pull-model llama3.2

For detailed help on any command, use: help <command>
`);
        }
    }
    /**
     * Display current status
     */
    async displayStatus() {
        this.terminal.display('📊 Ollama Code CLI Status');
        this.terminal.display('========================');
        // Connection status
        if (authManager.isConnected()) {
            this.terminal.success('✅ Connected to Ollama server');
            this.terminal.info(`   Server: ${authManager.getServerUrl()}`);
        }
        else {
            this.terminal.warn('❌ Not connected to Ollama server');
        }
        // AI status
        try {
            const aiClient = await import('./ai/index.js');
            if (aiClient.isAIInitialized()) {
                this.terminal.success('✅ AI client initialized');
            }
            else {
                this.terminal.warn('⚠️  AI client not initialized');
            }
        }
        catch (error) {
            this.terminal.warn('⚠️  AI client status unknown');
        }
        // Configuration
        this.terminal.info(`📁 Working directory: ${process.cwd()}`);
        this.terminal.info(`🔧 Config loaded: ${this.config ? 'Yes' : 'No'}`);
        this.terminal.display('');
    }
    /**
     * Display command history
     */
    async displayHistory() {
        this.terminal.info('Command history is not yet implemented.');
        this.terminal.info('This feature will be available in a future update.');
    }
    /**
     * Stop the CLI
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        try {
            this.terminal.display('\n👋 Goodbye! Thanks for using Ollama Code CLI.');
            // Terminal cleanup is handled by the terminal implementation
        }
        catch (error) {
            logger.error('Error during cleanup:', error);
        }
    }
}
// Create and start the CLI if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new OllamaCodeCLI();
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\nReceived SIGINT, shutting down gracefully...');
        await cli.stop();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\n\nReceived SIGTERM, shutting down gracefully...');
        await cli.stop();
        process.exit(0);
    });
    // Start the CLI
    cli.start().catch((error) => {
        console.error('Failed to start interactive CLI:', error);
        process.exit(1);
    });
}
export default OllamaCodeCLI;
//# sourceMappingURL=interactive-cli.js.map