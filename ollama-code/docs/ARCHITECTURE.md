# Architecture Documentation

This document provides a comprehensive overview of the Ollama Code CLI architecture, including system components, data flow, and design patterns.

## Table of Contents

- [System Overview](#system-overview)
- [Core Architecture](#core-architecture)
- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Dependencies](#dependencies)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)

## System Overview

The Ollama Code CLI is built as a modular, event-driven application with the following key characteristics:

- **Modular Design**: Clear separation of concerns across specialized modules
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Async/Await**: Modern asynchronous programming patterns throughout
- **Dependency Injection**: Loose coupling between modules
- **Error Handling**: Comprehensive error classification and recovery
- **Local Processing**: All AI processing happens locally via Ollama

## Core Architecture

### Application Lifecycle

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bootstrap     │───▶│  Initialize     │───▶│     Run         │
│                 │    │   Subsystems    │    │   Main Loop     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Load Config    │    │  Setup Error    │    │  Command        │
│  Parse Args     │    │  Handling       │    │  Processing     │
│  Setup Logging  │    │  Initialize AI  │    │  User Input     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Entry Points

1. **`simple-cli.ts`**: Basic CLI with core commands
2. **`cli.ts`**: Full-featured CLI with complete command set
3. **`index.ts`**: Main application initialization and lifecycle management

## Module Structure

### Core Modules

#### AI Module (`src/ai/`)
**Purpose**: AI integration and Ollama client functionality

**Key Components**:
- `OllamaClient`: Core AI interface
- `initAI()`: AI subsystem initialization
- `getAIClient()`: Client instance access

**Interfaces**:
```typescript
interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaCompletionOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}
```

#### Authentication Module (`src/auth/`)
**Purpose**: Authentication and connection management

**Key Components**:
- `OllamaAuthManager`: Connection management
- `initialize()`: Auth subsystem initialization
- `isAuthenticated()`: Authentication status

**Interfaces**:
```typescript
interface OllamaAuthState {
  isConnected: boolean;
  serverUrl: string;
  lastError?: string;
}
```

#### Commands Module (`src/commands/`)
**Purpose**: Command system and registration

**Key Components**:
- `CommandRegistry`: Command registration and lookup
- `executeCommand()`: Command execution
- `registerCommands()`: Command registration

**Interfaces**:
```typescript
interface CommandDef {
  name: string;
  description: string;
  category: string;
  handler: CommandHandler;
  args: CommandArgDef[];
  examples: string[];
  requiresAuth: boolean;
}
```

#### Configuration Module (`src/config/`)
**Purpose**: Configuration management and validation

**Key Components**:
- `loadConfig()`: Configuration loading
- `configSchema`: Zod validation schema
- `defaults.ts`: Default configuration values

**Interfaces**:
```typescript
interface ConfigType {
  workspace?: string;
  logLevel: LogLevel;
  ai: AiConfig;
  ollama: OllamaConfig;
  terminal: TerminalConfig;
  // ... other config sections
}
```

#### Error Handling Module (`src/errors/`)
**Purpose**: Error handling and user-friendly messaging

**Key Components**:
- `formatErrorForDisplay()`: Error formatting
- `UserError`: User-correctable errors
- `SystemError`: Technical errors

**Error Types**:
```typescript
class UserError extends Error {
  constructor(message: string, suggestion?: string);
}

class SystemError extends Error {
  constructor(message: string, code?: string);
}
```

#### Terminal Module (`src/terminal/`)
**Purpose**: Terminal interface and formatting

**Key Components**:
- `Terminal`: Terminal interface implementation
- `formatting.ts`: Output formatting utilities
- `prompt.ts`: Interactive prompts

**Interfaces**:
```typescript
interface TerminalInterface {
  displayWelcome(): void;
  clear(): void;
  detectCapabilities(): Promise<void>;
}
```

#### Utilities Module (`src/utils/`)
**Purpose**: Shared utilities and helper functions

**Key Components**:
- `logger.ts`: Logging system
- `ollama-server.ts`: Ollama server management
- `async.ts`: Async utilities
- `validation.ts`: Input validation

## Data Flow

### Command Execution Flow

```
User Input → CLI Parser → Command Registry → Command Handler → AI Client → Ollama Server
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
Arguments    Command Lookup    Validation    Processing    Response
```

### Configuration Flow

```
Default Config → File Config → Env Variables → Runtime Updates → Validation
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
   Built-in      ollama-code    OLLAMA_CODE_   config command   Zod Schema
   Defaults      .config.json   Variables      Updates         Validation
```

### Error Handling Flow

```
Error Occurrence → Error Classification → Error Formatting → User Display
        │                    │                    │              │
        ▼                    ▼                    ▼              ▼
   Exception           UserError/           formatErrorFor    Console
   Thrown             SystemError           Display()        Output
```

## Design Patterns

### Singleton Pattern
Used for core services that need global access:
- `OllamaClient`: AI client instance
- `AuthManager`: Authentication state
- `Logger`: Logging system

### Dependency Injection
Services are injected rather than tightly coupled:
```typescript
const commands = await initCommandProcessor(config, {
  terminal,
  auth,
  ai,
  codebase,
  fileOps,
  execution,
  errors
});
```

### Command Pattern
Commands are encapsulated as objects with consistent interfaces:
```typescript
interface CommandHandler {
  (args: string[], context: CommandContext): Promise<void>;
}
```

### Factory Pattern
Used for creating instances of services:
```typescript
export async function initAI(config: any = {}): Promise<OllamaClient> {
  // Factory method for AI client
}
```

### Observer Pattern
Used for event handling and notifications:
```typescript
// Error handling with observers
errors.on('error', (error) => {
  // Handle error
});
```

## Dependencies

### Core Dependencies
- **inquirer**: Interactive prompts and user input
- **node-fetch**: HTTP client for Ollama API
- **ora**: Terminal spinners and progress indicators
- **zod**: Schema validation and type safety
- **uuid**: Unique identifier generation

### Development Dependencies
- **TypeScript**: Type safety and modern JavaScript features
- **ESLint**: Code linting and quality enforcement
- **Jest**: Testing framework
- **Babel**: JavaScript transpilation for testing

### External Services
- **Ollama Server**: Local AI model server
- **Git**: Version control integration
- **File System**: Local file operations

## Error Handling

### Error Classification
1. **UserError**: User-correctable errors with clear resolution steps
2. **SystemError**: Technical errors requiring system-level fixes
3. **NetworkError**: Network-related errors with retry suggestions
4. **ValidationError**: Input validation errors with correction guidance

### Error Recovery
- **Automatic Retry**: Built-in retry logic for transient failures
- **Graceful Degradation**: Continued operation when non-critical features fail
- **User Guidance**: Clear error messages with suggested actions
- **Fallback Options**: Alternative approaches when primary solutions fail

### Error Flow
```
Exception → Error Classification → Error Formatting → User Display → Recovery Action
```

## Performance Considerations

### Async/Await Pattern
All I/O operations use async/await for non-blocking execution:
```typescript
async function processFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, 'utf8');
  return await processContent(content);
}
```

### Memory Management
- **Streaming**: Large responses are streamed to avoid memory issues
- **Caching**: Intelligent caching of frequently accessed data
- **Cleanup**: Proper cleanup of resources and event listeners

### Optimization Strategies
- **Lazy Loading**: Modules are loaded only when needed
- **Connection Pooling**: Reuse of HTTP connections
- **Batch Processing**: Multiple operations batched together
- **Parallel Processing**: Concurrent execution where possible

## Security Considerations

### Input Validation
- **Zod Schemas**: All inputs validated using Zod schemas
- **Path Traversal Protection**: Prevention of unauthorized file access
- **Command Sanitization**: Validation of commands before execution

### Data Privacy
- **Local Processing**: All AI processing happens locally
- **No Data Transmission**: No code or data sent to external services
- **Local Storage**: All data stored locally on user's machine

### Security Best Practices
- **Principle of Least Privilege**: Minimal required permissions
- **Input Sanitization**: All inputs validated and sanitized
- **Error Handling**: Secure error messages without sensitive information

## Testing Strategy

### Test Categories
1. **Unit Tests**: Individual function and module testing
2. **Integration Tests**: Cross-module functionality testing
3. **Documentation Tests**: Documentation validation and consistency
4. **End-to-End Tests**: Complete workflow testing

### Test Structure
```
tests/
├── unit/           # Unit tests for individual modules
├── integration/    # Integration tests for module interactions
├── docs/          # Documentation validation tests
└── e2e/           # End-to-end workflow tests
```

## Future Enhancements

### Planned Architecture Improvements
- **Plugin System**: Extensible plugin architecture
- **Microservices**: Break down into smaller, independent services
- **Event Bus**: Centralized event handling system
- **Caching Layer**: Advanced caching for improved performance

### Scalability Considerations
- **Horizontal Scaling**: Support for multiple Ollama instances
- **Load Balancing**: Distribution of AI requests across multiple models
- **Resource Management**: Better resource allocation and monitoring

This architecture documentation provides a comprehensive understanding of the Ollama Code CLI system, enabling developers to contribute effectively and maintain the codebase.
