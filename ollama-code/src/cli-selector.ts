#!/usr/bin/env node
/**
 * CLI Selector
 * 
 * Allows users to choose between different CLI modes:
 * - simple: Basic commands (ask, list-models, pull-model)
 * - advanced: Full command registry with all features
 * - interactive: Interactive mode with command loop
 */

import { commandRegistry, executeCommand, generateCommandHelp } from './commands/index.js';
import { logger } from './utils/logger.js';
import { formatErrorForDisplay } from './errors/formatter.js';
import { initAI } from './ai/index.js';
import { registerCommands } from './commands/register.js';
import { UserError } from './errors/types.js';
import { ensureOllamaServerRunning } from './utils/ollama-server.js';
import { initTerminal } from './terminal/index.js';
import { parseCommandInput } from './utils/command-parser.js';
import {
  HELP_OUTPUT_WIDTH,
  INTERACTIVE_MODE_HELP,
  HELP_COMMAND_SUGGESTION,
  EXIT_COMMANDS
} from './constants.js';
import pkg from '../package.json' with { type: 'json' };

// Get version from package.json
const version = pkg.version;



/**
 * Display help information
 */
function displayHelp(commandName?: string): void {
  // Register commands first so we can show them
  registerCommands();
  
  if (commandName && commandName !== 'help') {
    // Display help for a specific command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.error('Use "ollama-code help" to see available commands.');
      process.exit(1);
    }
    
    console.log(generateCommandHelp(command));
    return;
  }
  
  // Display general help
  console.log(`
Ollama Code CLI v${version}

A command-line interface for interacting with Ollama AI for local code assistance,
generation, refactoring, and more.

Usage:
  ollama-code                                               (starts interactive mode)
  ollama-code <command> [arguments] [options]              (runs command in interactive mode)
  ollama-code --mode <mode> [command] [arguments] [options]

Modes:
  --mode simple      Simple mode - Basic commands only
  --mode advanced    Advanced mode - Full command registry
  --mode interactive Interactive mode (default) - Command loop interface

Available Commands:`);
  
  // Group commands by category
  const categories = commandRegistry.getCategories();
  
  // Commands without a category
  const uncategorizedCommands = commandRegistry.list()
    .filter(cmd => !cmd.category && !cmd.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  if (uncategorizedCommands.length > 0) {
    for (const command of uncategorizedCommands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    console.log('');
  }
  
  // Commands with categories
  for (const category of categories) {
    console.log(`${category}:`);
    
    const commands = commandRegistry.getByCategory(category)
      .filter(cmd => !cmd.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    for (const command of commands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    
    console.log('');
  }
  
  console.log(`For more information on a specific command, use:
  ollama-code help <command>

Examples:
  $ ollama-code ask "How do I implement a binary search tree in TypeScript?"
  $ ollama-code --mode advanced explain path/to/file.js
  $ ollama-code --mode interactive
  $ ollama-code list-models
  $ ollama-code pull-model llama3.2
`);
}

/**
 * Display version information
 */
function displayVersion(): void {
  console.log(`Ollama Code CLI v${version}`);
}

/**
 * Parse command-line arguments
 */
function parseCommandLineArgs(): { 
  mode: 'simple' | 'advanced' | 'interactive';
  commandName: string; 
  args: string[] 
} {
  // Get arguments, excluding node and script path
  const args = process.argv.slice(2);
  
  // Handle help and version flags first
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    displayHelp();
    process.exit(0);
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    displayVersion();
    process.exit(0);
  }
  
  // Check for mode flag (default to interactive)
  let mode: 'simple' | 'advanced' | 'interactive' = 'interactive';
  let commandIndex = 0;
  
  if (args[0] === '--mode' && args.length > 1) {
    const modeArg = args[1].toLowerCase();
    if (['simple', 'advanced', 'interactive'].includes(modeArg)) {
      mode = modeArg as 'simple' | 'advanced' | 'interactive';
      commandIndex = 2;
    } else {
      console.error(`Invalid mode: ${modeArg}`);
      console.error('Valid modes: simple, advanced, interactive');
      process.exit(1);
    }
  }
  
  // Handle case where no command is provided after mode
  if (commandIndex >= args.length) {
    if (mode === 'interactive') {
      return { mode, commandName: 'interactive', args: [] };
    } else {
      displayHelp();
      process.exit(0);
    }
  }
  
  // Extract command name
  const commandName = args[commandIndex].toLowerCase();
  
  // Handle help command
  if (commandName === 'help') {
    displayHelp(args[commandIndex + 1]);
    process.exit(0);
  }
  
  // Handle version command
  if (commandName === 'version' || commandName === '--version' || commandName === '-v') {
    displayVersion();
    process.exit(0);
  }
  
  return { 
    mode, 
    commandName, 
    args: args.slice(commandIndex + 1) 
  };
}

/**
 * Run simple mode (basic commands only)
 */
async function runSimpleMode(commandName: string, args: string[]): Promise<void> {
  const { OllamaClient } = await import('./ai/ollama-client.js');
  
  // Ensure Ollama server is running before creating client
  console.log('Ensuring Ollama server is running...');
  await ensureOllamaServerRunning();
  
  const client = new OllamaClient();
  
  switch (commandName) {
    case 'ask':
      if (args.length === 0) {
        console.error('Please provide a question to ask.');
        console.log('Example: ollama-code ask "How do I implement a binary search?"');
        process.exit(1);
      }
      
      const question = args.join(' ');
      console.log('Asking Ollama...\n');

      // Create abort controller for cancellation
      const abortController = new AbortController();

      // Handle Ctrl+C gracefully
      const handleInterrupt = () => {
        abortController.abort();
        console.log('\n\nRequest cancelled by user.');
      };
      process.on('SIGINT', handleInterrupt);

      let responseText = '';
      try {
        await client.completeStream(question, {}, (event) => {
          if (event.message?.content) {
            process.stdout.write(event.message.content);
            responseText += event.message.content;
          }
        }, abortController.signal);
      } finally {
        // Clean up interrupt handler
        process.off('SIGINT', handleInterrupt);
      }

      // Add newline at the end
      if (responseText) {
        console.log('\n');
      } else {
        console.log('No response received');
      }
      break;
      
    case 'list-models':
      console.log('Fetching available models...\n');
      
      const models = await client.listModels();
      
      if (models.length === 0) {
        console.log('No models found. Use "pull-model <name>" to download a model.');
        return;
      }
      
      console.log('Available models:');
      console.log('================');
      
      for (const model of models) {
        const sizeInGB = (model.size / (1024 * 1024 * 1024)).toFixed(2);
        const modifiedDate = new Date(model.modified_at).toLocaleDateString();
        
        console.log(`📦 ${model.name}`);
        console.log(`   Size: ${sizeInGB} GB`);
        console.log(`   Modified: ${modifiedDate}`);
        console.log('');
      }
      
      console.log(`Total: ${models.length} model(s) available`);
      break;
      
    case 'pull-model':
      if (args.length === 0) {
        console.error('Please provide a model name to download.');
        console.log('Example: ollama-code pull-model llama3.2');
        process.exit(1);
      }
      
      const modelName = args[0];
      console.log(`Downloading model: ${modelName}`);
      console.log('This may take several minutes depending on model size...\n');
      
      await client.pullModel(modelName);
      
      console.log(`✅ Successfully downloaded model: ${modelName}`);
      console.log('You can now use this model with the ask command.');
      break;
      
    default:
      console.error(`Unknown command: ${commandName}`);
      console.log('Simple mode supports: ask, list-models, pull-model');
      console.log('Use --mode advanced for more commands.');
      process.exit(1);
  }
}

/**
 * Run advanced mode (full command registry)
 */
async function runAdvancedMode(commandName: string, args: string[]): Promise<void> {
  // Register commands
  registerCommands();
  
  // Get the command
  const command = commandRegistry.get(commandName);
  
  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    console.error(HELP_COMMAND_SUGGESTION);
    process.exit(1);
  }
  
  // Ensure Ollama server is running before initializing AI
  logger.info('Ensuring Ollama server is running...');
  await ensureOllamaServerRunning();
  await initAI();
  
  // Execute the command
  await executeCommand(commandName, args);
}

/**
 * Run interactive mode (command loop)
 */
async function runInteractiveMode(): Promise<void> {
  // Register commands
  registerCommands();
  
  // Initialize terminal
  const terminal = await initTerminal({});
  
  console.log(`Ollama Code CLI v${version} - Interactive Mode`);
  console.log(`${INTERACTIVE_MODE_HELP}\n`);
  
  let running = true;
  
  // Command loop
  while (running) {
    try {
      // Get command input from user
      const input = await terminal.prompt<{ command: string }>({
        type: 'input',
        name: 'command',
        message: 'ollama-code>',
      });
      
      if (!input.command || input.command.trim() === '') {
        continue;
      }
      
      // Handle special exit commands
      if (EXIT_COMMANDS.includes(input.command.toLowerCase() as any)) {
        running = false;
        continue;
      }
      
      // Parse input into command and args, respecting quoted strings
      const parts = parseCommandInput(input.command.trim());
      const commandName = parts[0];
      const commandArgs = parts.slice(1);
      
      // Check if command exists
      if (!commandRegistry.exists(commandName)) {
        terminal.error(`Unknown command: ${commandName}`);
        terminal.info(INTERACTIVE_MODE_HELP);
        continue;
      }
      
      // Get the command
      const command = commandRegistry.get(commandName);
      
      if (!command) {
        terminal.error(`Command not found: ${commandName}`);
        continue;
      }
      
      // Ensure Ollama server is running before initializing AI
      terminal.info('Ensuring Ollama server is running...');
      await ensureOllamaServerRunning();
      await initAI();
      
      // Execute the command
      await executeCommand(commandName, commandArgs);
      
    } catch (error) {
      const formattedError = formatErrorForDisplay(error);
      terminal.error(formattedError);
    }
  }
  
  console.log('Goodbye!');
}

/**
 * Initialize the CLI
 */
async function initCLI(): Promise<void> {
  try {
    // Parse command-line arguments
    const { mode, commandName, args } = parseCommandLineArgs();
    
    // Route to appropriate mode
    switch (mode) {
      case 'simple':
        await runSimpleMode(commandName, args);
        break;
      case 'advanced':
        await runAdvancedMode(commandName, args);
        break;
      case 'interactive':
        await runInteractiveMode();
        break;
      default:
        console.error(`Unknown mode: ${mode}`);
        process.exit(1);
    }
  } catch (error) {
    handleError(error);
  }
}

/**
 * Handle errors
 */
function handleError(error: unknown): void {
  const formattedError = formatErrorForDisplay(error);
  
  console.error(formattedError);
  
  // Exit with error code
  if (error instanceof UserError) {
    process.exit(1);
  } else {
    // Unexpected error, use a different exit code
    process.exit(2);
  }
}

// Run the CLI
initCLI().catch(handleError);
