# Commands Module Documentation

This document provides comprehensive documentation for the `src/commands/` module, which implements the command system for the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Command Definition](#command-definition)
- [Command Registry](#command-registry)
- [Argument Parsing](#argument-parsing)
- [Command Execution](#command-execution)
- [Help System](#help-system)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The commands module (`src/commands/`) provides a comprehensive framework for registering, managing, and executing CLI commands. It handles argument parsing, validation, help text generation, and command execution flow.

### Purpose

- **Command Registration**: Register and manage CLI commands
- **Argument Parsing**: Parse and validate command-line arguments
- **Command Execution**: Execute commands with proper error handling
- **Help System**: Generate help text and command documentation
- **Interactive Mode**: Support interactive command execution

### Key Features

- **Type-Safe Commands**: Full TypeScript support for command definitions
- **Flexible Arguments**: Support for positional and flag arguments
- **Argument Validation**: Built-in validation and type conversion
- **Command Aliases**: Support for command aliases and shortcuts
- **Help Generation**: Automatic help text generation
- **Error Handling**: Comprehensive error handling and user feedback

## Architecture

### Module Structure

```
src/commands/
├── index.ts           # Main command system implementation
├── register.ts        # Command registration functions
└── types.ts          # TypeScript type definitions
```

### Dependencies

- **Internal**: `../errors/formatter`, `../utils/logger`, `../utils/validation`
- **External**: None (pure TypeScript implementation)
- **Runtime**: Node.js built-in modules

### Design Patterns

- **Registry Pattern**: Centralized command registration and lookup
- **Command Pattern**: Encapsulate commands as objects
- **Factory Pattern**: Command creation and initialization
- **Strategy Pattern**: Different argument parsing strategies

## Core Components

### CommandDef Interface

The main interface for defining commands.

```typescript
interface CommandDef {
  name: string;                    // Command name
  description: string;             // Command description
  examples?: string[];            // Usage examples
  args?: CommandArgDef[];         // Command arguments
  handler: (args: Record<string, any>) => Promise<any>; // Command handler
  aliases?: string[];             // Command aliases
  category?: string;              // Command category
  requiresAuth?: boolean;         // Requires authentication
  interactive?: boolean;          // Can be used interactively
  hidden?: boolean;               // Hide from help
}
```

### CommandArgDef Interface

Interface for defining command arguments.

```typescript
interface CommandArgDef {
  name: string;                   // Argument name
  description: string;            // Argument description
  type: ArgType;                  // Argument type
  required?: boolean;             // Whether required
  default?: any;                  // Default value
  choices?: string[];             // Valid choices
  position?: number;              // Positional argument position
  shortFlag?: string;             // Short flag (e.g., -v)
  hidden?: boolean;               // Hide from help
}
```

### ArgType Enum

Supported argument types.

```typescript
enum ArgType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array'
}
```

## Command Definition

### Basic Command

```typescript
const basicCommand: CommandDef = {
  name: 'hello',
  description: 'Say hello to the user',
  handler: async (args) => {
    console.log('Hello, World!');
  }
};
```

### Command with Arguments

```typescript
const commandWithArgs: CommandDef = {
  name: 'greet',
  description: 'Greet a specific user',
  args: [
    {
      name: 'name',
      description: 'Name of the person to greet',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'formal',
      description: 'Use formal greeting',
      type: ArgType.BOOLEAN,
      shortFlag: 'f',
      default: false
    }
  ],
  handler: async (args) => {
    const greeting = args.formal ? 'Good day' : 'Hello';
    console.log(`${greeting}, ${args.name}!`);
  }
};
```

### Command with Options

```typescript
const commandWithOptions: CommandDef = {
  name: 'process',
  description: 'Process files with various options',
  args: [
    {
      name: 'input',
      description: 'Input file path',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'output',
      description: 'Output file path',
      type: ArgType.STRING,
      shortFlag: 'o'
    },
    {
      name: 'format',
      description: 'Output format',
      type: ArgType.STRING,
      choices: ['json', 'xml', 'csv'],
      default: 'json'
    },
    {
      name: 'verbose',
      description: 'Enable verbose output',
      type: ArgType.BOOLEAN,
      shortFlag: 'v',
      default: false
    }
  ],
  handler: async (args) => {
    console.log(`Processing ${args.input}...`);
    if (args.output) {
      console.log(`Output to: ${args.output}`);
    }
    console.log(`Format: ${args.format}`);
    if (args.verbose) {
      console.log('Verbose mode enabled');
    }
  }
};
```

## Command Registry

### CommandRegistry Class

The central registry for managing commands.

#### Key Methods

##### `register(command: CommandDef): void`
Register a new command.

```typescript
commandRegistry.register({
  name: 'test',
  description: 'Run tests',
  handler: async (args) => {
    console.log('Running tests...');
  }
});
```

##### `get(nameOrAlias: string): CommandDef | undefined`
Get a command by name or alias.

```typescript
const command = commandRegistry.get('test');
if (command) {
  console.log(`Found command: ${command.name}`);
}
```

##### `list(options?: { includeHidden?: boolean }): CommandDef[]`
List all registered commands.

```typescript
const commands = commandRegistry.list();
console.log(`Registered ${commands.length} commands`);
```

##### `exists(nameOrAlias: string): boolean`
Check if a command exists.

```typescript
if (commandRegistry.exists('test')) {
  console.log('Test command is available');
}
```

##### `getCategories(): string[]`
Get all command categories.

```typescript
const categories = commandRegistry.getCategories();
console.log('Categories:', categories);
```

##### `getByCategory(category: string): CommandDef[]`
Get commands by category.

```typescript
const aiCommands = commandRegistry.getByCategory('AI');
console.log(`Found ${aiCommands.length} AI commands`);
```

### Command Registration

#### Basic Registration

```typescript
import { commandRegistry } from './commands/index.js';

// Register a simple command
commandRegistry.register({
  name: 'version',
  description: 'Show version information',
  handler: async () => {
    console.log('Ollama Code CLI v1.0.0');
  }
});
```

#### Registration with Validation

```typescript
// Register command with validation
commandRegistry.register({
  name: 'config',
  description: 'Manage configuration',
  args: [
    {
      name: 'key',
      description: 'Configuration key',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'value',
      description: 'Configuration value',
      type: ArgType.STRING,
      position: 1
    }
  ],
  handler: async (args) => {
    if (args.value) {
      console.log(`Setting ${args.key} = ${args.value}`);
    } else {
      console.log(`Getting ${args.key}`);
    }
  }
});
```

## Argument Parsing

### parseArgs Function

Parse command-line arguments for a command.

```typescript
function parseArgs(args: string[], command: CommandDef): Record<string, any>
```

#### Basic Usage

```typescript
const command: CommandDef = {
  name: 'example',
  description: 'Example command',
  args: [
    {
      name: 'input',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'output',
      type: ArgType.STRING,
      shortFlag: 'o'
    }
  ],
  handler: async () => {}
};

const args = ['input.txt', '--output', 'output.txt'];
const parsed = parseArgs(args, command);
// Result: { input: 'input.txt', output: 'output.txt' }
```

#### Argument Types

##### String Arguments
```typescript
{
  name: 'filename',
  type: ArgType.STRING,
  position: 0
}
```

##### Number Arguments
```typescript
{
  name: 'count',
  type: ArgType.NUMBER,
  shortFlag: 'c',
  default: 1
}
```

##### Boolean Arguments
```typescript
{
  name: 'verbose',
  type: ArgType.BOOLEAN,
  shortFlag: 'v',
  default: false
}
```

##### Array Arguments
```typescript
{
  name: 'files',
  type: ArgType.ARRAY,
  shortFlag: 'f'
}
// Usage: --files file1.txt,file2.txt,file3.txt
```

#### Positional Arguments

```typescript
const command: CommandDef = {
  name: 'copy',
  description: 'Copy files',
  args: [
    {
      name: 'source',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'destination',
      type: ArgType.STRING,
      position: 1,
      required: true
    }
  ],
  handler: async () => {}
};

// Usage: ollama-code copy source.txt dest.txt
```

#### Flag Arguments

```typescript
const command: CommandDef = {
  name: 'build',
  description: 'Build project',
  args: [
    {
      name: 'output',
      type: ArgType.STRING,
      shortFlag: 'o',
      default: 'dist'
    },
    {
      name: 'watch',
      type: ArgType.BOOLEAN,
      shortFlag: 'w',
      default: false
    }
  ],
  handler: async () => {}
};

// Usage: ollama-code build --output build --watch
// or: ollama-code build -o build -w
```

#### Argument Validation

```typescript
const command: CommandDef = {
  name: 'format',
  description: 'Format code',
  args: [
    {
      name: 'type',
      type: ArgType.STRING,
      choices: ['prettier', 'eslint', 'prettier-eslint'],
      default: 'prettier'
    }
  ],
  handler: async () => {}
};

// Valid: ollama-code format --type prettier
// Invalid: ollama-code format --type invalid (throws error)
```

## Command Execution

### executeCommand Function

Execute a command with parsed arguments.

```typescript
async function executeCommand(commandName: string, args: string[]): Promise<any>
```

#### Basic Execution

```typescript
try {
  const result = await executeCommand('hello', []);
  console.log('Command executed successfully');
} catch (error) {
  console.error('Command failed:', error.message);
}
```

#### Execution with Arguments

```typescript
try {
  const result = await executeCommand('greet', ['John', '--formal']);
  console.log('Greeting sent');
} catch (error) {
  console.error('Greeting failed:', error.message);
}
```

### Command Processor

#### Initialization

```typescript
import { initCommandProcessor } from './commands/index.js';

const processor = await initCommandProcessor(config, {
  terminal: terminalModule,
  auth: authModule,
  ai: aiModule,
  codebase: codebaseModule,
  fileOps: fileOpsModule,
  execution: executionModule,
  errors: errorsModule
});
```

#### Command Execution

```typescript
// Execute a single command
await processor.executeCommand('ask', ['What is TypeScript?']);

// Start interactive mode
await processor.startCommandLoop();
```

#### Command Management

```typescript
// Register a new command
processor.registerCommand({
  name: 'custom',
  description: 'Custom command',
  handler: async (args) => {
    console.log('Custom command executed');
  }
});

// Get command information
const command = processor.getCommand('ask');
if (command) {
  console.log(`Command: ${command.name}`);
  console.log(`Description: ${command.description}`);
}

// List all commands
const commands = processor.listCommands();
console.log(`Available commands: ${commands.length}`);
```

## Help System

### generateCommandHelp Function

Generate help text for a command.

```typescript
function generateCommandHelp(command: CommandDef): string
```

#### Basic Help

```typescript
const command: CommandDef = {
  name: 'hello',
  description: 'Say hello',
  handler: async () => {}
};

const help = generateCommandHelp(command);
console.log(help);
```

Output:
```
hello - Say hello

Usage:
  ollama-code hello
```

#### Help with Arguments

```typescript
const command: CommandDef = {
  name: 'greet',
  description: 'Greet a user',
  args: [
    {
      name: 'name',
      description: 'Name to greet',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'formal',
      description: 'Use formal greeting',
      type: ArgType.BOOLEAN,
      shortFlag: 'f',
      default: false
    }
  ],
  examples: [
    'greet John',
    'greet Jane --formal'
  ],
  handler: async () => {}
};

const help = generateCommandHelp(command);
console.log(help);
```

Output:
```
greet - Greet a user

Usage:
  ollama-code greet <name> [options]

Arguments:
  name                   Name to greet

Options:
  -f, --formal          Use formal greeting (default: false)

Examples:
  $ ollama-code greet John
  $ ollama-code greet Jane --formal
```

### Interactive Help

#### Command Help

```typescript
// In interactive mode
ollama-code> help ask
// Shows help for the 'ask' command
```

#### General Help

```typescript
// In interactive mode
ollama-code> help
// Shows list of all available commands
```

## Usage Examples

### Basic Command Registration

```typescript
import { commandRegistry } from './commands/index.js';

// Register a simple command
commandRegistry.register({
  name: 'status',
  description: 'Show application status',
  handler: async (args) => {
    console.log('Application is running');
    console.log('Version: 1.0.0');
    console.log('Uptime: 2 hours');
  }
});
```

### Command with Complex Arguments

```typescript
commandRegistry.register({
  name: 'process',
  description: 'Process files with various options',
  args: [
    {
      name: 'input',
      description: 'Input file or directory',
      type: ArgType.STRING,
      position: 0,
      required: true
    },
    {
      name: 'output',
      description: 'Output directory',
      type: ArgType.STRING,
      shortFlag: 'o',
      default: './output'
    },
    {
      name: 'format',
      description: 'Output format',
      type: ArgType.STRING,
      choices: ['json', 'xml', 'csv', 'yaml'],
      default: 'json'
    },
    {
      name: 'recursive',
      description: 'Process directories recursively',
      type: ArgType.BOOLEAN,
      shortFlag: 'r',
      default: false
    },
    {
      name: 'verbose',
      description: 'Enable verbose output',
      type: ArgType.BOOLEAN,
      shortFlag: 'v',
      default: false
    }
  ],
  examples: [
    'process input.txt',
    'process data/ --output results/ --format csv',
    'process files/ --recursive --verbose'
  ],
  handler: async (args) => {
    console.log(`Processing: ${args.input}`);
    console.log(`Output: ${args.output}`);
    console.log(`Format: ${args.format}`);
    console.log(`Recursive: ${args.recursive}`);
    console.log(`Verbose: ${args.verbose}`);
  }
});
```

### Command with Authentication

```typescript
commandRegistry.register({
  name: 'deploy',
  description: 'Deploy application to cloud',
  args: [
    {
      name: 'environment',
      description: 'Target environment',
      type: ArgType.STRING,
      choices: ['dev', 'staging', 'prod'],
      position: 0,
      required: true
    },
    {
      name: 'force',
      description: 'Force deployment without confirmation',
      type: ArgType.BOOLEAN,
      shortFlag: 'f',
      default: false
    }
  ],
  requiresAuth: true,
  handler: async (args) => {
    console.log(`Deploying to ${args.environment}...`);
    if (args.force) {
      console.log('Force deployment enabled');
    }
  }
});
```

### Command with Categories

```typescript
// AI Commands
commandRegistry.register({
  name: 'ask',
  description: 'Ask AI a question',
  category: 'AI',
  args: [
    {
      name: 'question',
      description: 'Question to ask',
      type: ArgType.STRING,
      position: 0,
      required: true
    }
  ],
  handler: async (args) => {
    console.log(`Asking: ${args.question}`);
  }
});

// File Commands
commandRegistry.register({
  name: 'list',
  description: 'List files in directory',
  category: 'Files',
  args: [
    {
      name: 'path',
      description: 'Directory path',
      type: ArgType.STRING,
      position: 0,
      default: '.'
    }
  ],
  handler: async (args) => {
    console.log(`Listing files in: ${args.path}`);
  }
});
```

### Interactive Command Loop

```typescript
import { initCommandProcessor } from './commands/index.js';

const processor = await initCommandProcessor(config, dependencies);

// Start interactive mode
await processor.startCommandLoop();
```

## Best Practices

### Command Design

1. **Clear Names**: Use descriptive, intuitive command names
2. **Consistent Arguments**: Use consistent argument patterns across commands
3. **Helpful Descriptions**: Provide clear, concise descriptions
4. **Examples**: Include usage examples for complex commands
5. **Error Handling**: Implement proper error handling in command handlers

### Argument Design

1. **Required vs Optional**: Clearly distinguish required and optional arguments
2. **Default Values**: Provide sensible defaults for optional arguments
3. **Type Safety**: Use appropriate types for arguments
4. **Validation**: Implement validation for argument values
5. **Choices**: Use choices for limited option sets

### Error Handling

1. **User-Friendly Messages**: Provide clear error messages
2. **Resolution Hints**: Include suggestions for resolving errors
3. **Validation Errors**: Handle argument validation errors gracefully
4. **Command Errors**: Handle command execution errors appropriately

### Performance

1. **Lazy Loading**: Load command dependencies only when needed
2. **Efficient Parsing**: Use efficient argument parsing algorithms
3. **Memory Management**: Avoid memory leaks in command handlers
4. **Async Operations**: Use async/await for asynchronous operations

This documentation provides comprehensive guidance for using the commands module effectively. The module is designed to be flexible, type-safe, and easy to use while providing powerful command management capabilities for the Ollama Code CLI.
