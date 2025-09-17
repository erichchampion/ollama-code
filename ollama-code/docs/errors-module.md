# Errors Module Documentation

This document provides comprehensive documentation for the `src/errors/` module, which handles error types, error handling, error reporting, and custom error classes for the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Error Types](#error-types)
- [Error Handling](#error-handling)
- [Error Reporting](#error-reporting)
- [Custom Errors](#custom-errors)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The errors module (`src/errors/`) provides a comprehensive error handling system for the Ollama Code CLI, including error classification, handling, reporting, and custom error types.

### Purpose

- **Error Classification**: Categorize errors by type and severity
- **Error Handling**: Centralized error handling and processing
- **Error Reporting**: Report errors to monitoring systems
- **Custom Errors**: Define custom error types for specific use cases
- **Error Recovery**: Provide error recovery mechanisms

### Key Features

- **Error Categories**: Comprehensive error categorization system
- **Error Levels**: Hierarchical error severity levels
- **Custom Error Types**: UserError and other custom error classes
- **Error Formatting**: Consistent error message formatting
- **Error Tracking**: Track and count errors by category
- **Error Reporting**: Integration with monitoring systems

## Architecture

### Module Structure

```
src/errors/
├── index.ts           # Main error handling system and initialization
├── types.ts          # Error type definitions and interfaces
├── formatter.ts      # Error formatting utilities
├── console.ts        # Console error handling
└── sentry.ts         # Sentry error reporting (minimal implementation)
```

### Dependencies

- **Internal**: `../utils/logger`, `../utils/formatting`
- **External**: None (pure TypeScript implementation)
- **Runtime**: Node.js built-in modules

### Design Patterns

- **Strategy Pattern**: Different error handling strategies
- **Observer Pattern**: Error event handling
- **Factory Pattern**: Error creation and formatting
- **Singleton Pattern**: Single error manager instance

## Error Types

### Error Categories

The module defines comprehensive error categories for classification:

#### Application Errors
```typescript
APPLICATION = 0        // General application errors
AUTHENTICATION = 1     // Authentication-related errors
NETWORK = 2           // Network connectivity errors
FILE_SYSTEM = 3       // File system operation errors
COMMAND_EXECUTION = 4  // Command execution errors
AI_SERVICE = 5        // AI service errors
CONFIGURATION = 6     // Configuration errors
RESOURCE = 7          // Resource-related errors
UNKNOWN = 8           // Unknown errors
INTERNAL = 9          // Internal system errors
VALIDATION = 10       // Input validation errors
INITIALIZATION = 11   // Initialization errors
SERVER = 12           // Server errors
API = 13              // API errors
TIMEOUT = 14          // Timeout errors
RATE_LIMIT = 15       // Rate limit errors
CONNECTION = 16       // Connection errors
AUTHORIZATION = 17    // Authorization errors
FILE_NOT_FOUND = 18   // File not found errors
FILE_ACCESS = 19      // File access errors
FILE_READ = 20        // File read errors
FILE_WRITE = 21       // File write errors
COMMAND = 22          // Command errors
COMMAND_NOT_FOUND = 23 // Command not found errors
```

#### Error Levels

```typescript
DEBUG = 0      // Debug information
INFO = 1       // Informational messages
WARNING = 2    // Warning messages
ERROR = 3      // Error messages
CRITICAL = 4   // Critical errors
FATAL = 5      // Fatal errors
```

### Error Options

```typescript
interface ErrorOptions {
  level?: ErrorLevel;                    // Error severity level
  category?: ErrorCategory;              // Error category
  context?: Record<string, any>;         // Additional context
  report?: boolean;                      // Whether to report the error
  userMessage?: string;                  // User-friendly message
  resolution?: string | string[];        // Resolution steps
}
```

## Error Handling

### Error Manager Interface

The main error handling interface:

```typescript
interface ErrorManager {
  handleError(error: unknown, options?: ErrorOptions): void;
  handleFatalError(error: unknown): never;
  formatError(error: unknown, options?: ErrorOptions): string;
  getErrorCount(category?: ErrorCategory): number;
  clearErrorCount(category?: ErrorCategory): void;
}
```

### Error Handling Methods

#### `handleError(error, options)`
Handle a general error with specified options.

```typescript
errorManager.handleError(new Error('Something went wrong'), {
  level: ErrorLevel.ERROR,
  category: ErrorCategory.APPLICATION,
  context: { userId: '123' },
  userMessage: 'An unexpected error occurred',
  resolution: 'Please try again or contact support'
});
```

#### `handleFatalError(error)`
Handle a fatal error that should terminate the application.

```typescript
errorManager.handleFatalError(new Error('Critical system failure'));
// This will terminate the application
```

#### `formatError(error, options)`
Format an error for consistent display.

```typescript
const formatted = errorManager.formatError(error, {
  level: ErrorLevel.ERROR,
  category: ErrorCategory.NETWORK
});
```

### Error Tracking

#### Error Counting
```typescript
// Get total error count
const totalErrors = errorManager.getErrorCount();

// Get error count for specific category
const networkErrors = errorManager.getErrorCount(ErrorCategory.NETWORK);

// Clear error counts
errorManager.clearErrorCount(); // Clear all
errorManager.clearErrorCount(ErrorCategory.NETWORK); // Clear specific category
```

## Error Reporting

### Console Error Handling

The module automatically intercepts console errors:

```typescript
// Console errors are automatically tracked
console.error('Something went wrong');
console.warn('This is a warning');
```

### Sentry Integration

The module provides a foundation for Sentry integration:

```typescript
// Set up Sentry reporting
setupSentryReporting(errorManager, {
  enabled: true,
  dsn: 'your-sentry-dsn',
  environment: 'production',
  release: '1.0.0'
});
```

### Custom Error Reporting

```typescript
// Report error to external system
reportErrorToSentry(error, {
  level: 'error',
  tags: { component: 'ai-service' },
  extra: { userId: '123' },
  user: { id: '123', username: 'user' }
});
```

## Custom Errors

### UserError Class

A custom error class for user-facing errors:

```typescript
class UserError extends Error {
  cause?: unknown;                    // Original error
  category: ErrorCategory;            // Error category
  level: ErrorLevel;                  // Error level
  resolution?: string | string[];     // Resolution steps
  details: Record<string, unknown>;   // Additional details
  code?: string;                      // Error code
}
```

#### Creating UserError

```typescript
import { UserError, ErrorCategory, ErrorLevel } from './errors/types.js';

// Basic UserError
const error = new UserError('File not found', {
  category: ErrorCategory.FILE_NOT_FOUND,
  level: ErrorLevel.ERROR,
  resolution: 'Check the file path and try again'
});

// UserError with details
const error = new UserError('Invalid configuration', {
  category: ErrorCategory.CONFIGURATION,
  level: ErrorLevel.ERROR,
  resolution: 'Check your configuration file',
  details: { configFile: 'config.json', line: 15 },
  code: 'INVALID_CONFIG'
});
```

### Error Creation Utilities

#### `createUserError(message, options)`
Create a UserError with automatic logging:

```typescript
import { createUserError } from './errors/formatter.js';

const error = createUserError('Connection failed', {
  category: ErrorCategory.CONNECTION,
  level: ErrorLevel.ERROR,
  resolution: 'Check your internet connection'
});
```

#### `ensureUserError(error, defaultMessage, options)`
Convert any error to a UserError:

```typescript
import { ensureUserError } from './errors/formatter.js';

try {
  // Some operation that might fail
} catch (error) {
  const userError = ensureUserError(error, 'Operation failed', {
    category: ErrorCategory.APPLICATION,
    level: ErrorLevel.ERROR
  });
  throw userError;
}
```

## Core Components

### ErrorHandlerImpl Class

The main error handling implementation:

#### Constructor
```typescript
constructor()
```

#### Key Methods

##### `handleError(error, options)`
Handle a general error.

##### `handleFatalError(error)`
Handle a fatal error.

##### `formatError(error, options)`
Format an error for display.

##### `getErrorCount(category?)`
Get error count for category or total.

##### `clearErrorCount(category?)`
Clear error counts.

### Error Formatting

#### `formatErrorForDisplay(error)`
Format any error for user display:

```typescript
import { formatErrorForDisplay } from './errors/formatter.js';

const formatted = formatErrorForDisplay(error);
console.log(formatted);
```

#### `getErrorCategoryName(category)`
Get human-readable category name:

```typescript
import { getErrorCategoryName } from './errors/formatter.js';

const name = getErrorCategoryName(ErrorCategory.NETWORK);
console.log(name); // "NETWORK"
```

#### `getErrorLevelName(level)`
Get human-readable level name:

```typescript
import { getErrorLevelName } from './errors/formatter.js';

const name = getErrorLevelName(ErrorLevel.ERROR);
console.log(name); // "ERROR"
```

### Console Error Handling

#### `setupConsoleErrorHandling(errorManager)`
Set up automatic console error handling:

```typescript
import { setupConsoleErrorHandling } from './errors/console.js';

setupConsoleErrorHandling(errorManager);
```

## Usage Examples

### Basic Error Handling

```typescript
import { initErrorHandling } from './errors/index.js';

// Initialize error handling
const errorManager = initErrorHandling();

// Handle an error
errorManager.handleError(new Error('Something went wrong'), {
  level: ErrorLevel.ERROR,
  category: ErrorCategory.APPLICATION
});
```

### Custom Error Creation

```typescript
import { UserError, ErrorCategory, ErrorLevel } from './errors/types.js';

// Create a custom error
const error = new UserError('Invalid input provided', {
  category: ErrorCategory.VALIDATION,
  level: ErrorLevel.ERROR,
  resolution: 'Please provide valid input',
  details: { field: 'email', value: 'invalid-email' },
  code: 'INVALID_EMAIL'
});

// Handle the error
errorManager.handleError(error);
```

### Error Recovery

```typescript
import { ensureUserError } from './errors/formatter.js';

async function performOperation() {
  try {
    // Some operation that might fail
    await riskyOperation();
  } catch (error) {
    // Convert to UserError with recovery steps
    const userError = ensureUserError(error, 'Operation failed', {
      category: ErrorCategory.APPLICATION,
      level: ErrorLevel.ERROR,
      resolution: [
        'Check your internet connection',
        'Verify your configuration',
        'Try again in a few minutes'
      ]
    });
    
    // Log and handle the error
    errorManager.handleError(userError);
    
    // Attempt recovery
    return await attemptRecovery();
  }
}
```

### Error Tracking

```typescript
// Track errors by category
errorManager.handleError(error, {
  category: ErrorCategory.NETWORK,
  level: ErrorLevel.WARNING
});

// Check error counts
const networkErrors = errorManager.getErrorCount(ErrorCategory.NETWORK);
const totalErrors = errorManager.getErrorCount();

console.log(`Network errors: ${networkErrors}`);
console.log(`Total errors: ${totalErrors}`);

// Clear error counts
errorManager.clearErrorCount(ErrorCategory.NETWORK);
```

### Error Reporting

```typescript
import { setupSentryReporting } from './errors/sentry.js';

// Set up error reporting
setupSentryReporting(errorManager, {
  enabled: process.env.NODE_ENV === 'production',
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION
});

// Errors will be automatically reported
errorManager.handleError(error, {
  level: ErrorLevel.ERROR,
  category: ErrorCategory.APPLICATION,
  report: true
});
```

### Error Formatting

```typescript
import { formatErrorForDisplay } from './errors/formatter.js';

// Format error for display
const error = new UserError('File not found', {
  category: ErrorCategory.FILE_NOT_FOUND,
  level: ErrorLevel.ERROR,
  resolution: 'Check the file path and try again',
  details: { filePath: '/path/to/file.txt' }
});

const formatted = formatErrorForDisplay(error);
console.log(formatted);
```

### Error Categories and Levels

```typescript
// Different error categories
errorManager.handleError(error, {
  category: ErrorCategory.NETWORK,
  level: ErrorLevel.WARNING
});

errorManager.handleError(error, {
  category: ErrorCategory.CONFIGURATION,
  level: ErrorLevel.ERROR
});

errorManager.handleError(error, {
  category: ErrorCategory.AI_SERVICE,
  level: ErrorLevel.CRITICAL
});
```

## Best Practices

### Error Classification

1. **Use Appropriate Categories**: Choose the most specific category
2. **Set Correct Levels**: Use appropriate severity levels
3. **Provide Context**: Include relevant context information
4. **Add Resolution Steps**: Provide actionable resolution steps
5. **Use Error Codes**: Include error codes for programmatic handling

### Error Handling

1. **Handle Errors Early**: Catch and handle errors as close to the source as possible
2. **Provide User-Friendly Messages**: Use clear, non-technical language
3. **Include Recovery Steps**: Suggest specific actions to resolve errors
4. **Log Errors Appropriately**: Use appropriate log levels
5. **Don't Swallow Errors**: Always handle or re-throw errors

### Error Recovery

1. **Implement Retry Logic**: Retry transient errors
2. **Provide Fallbacks**: Use fallback options when possible
3. **Graceful Degradation**: Continue operation with reduced functionality
4. **User Notification**: Inform users of errors and recovery actions
5. **Error Boundaries**: Implement error boundaries for critical sections

### Error Reporting

1. **Report Critical Errors**: Always report critical and fatal errors
2. **Include Context**: Include relevant context in error reports
3. **Anonymize Data**: Remove sensitive information from error reports
4. **Rate Limiting**: Implement rate limiting for error reporting
5. **Error Aggregation**: Group similar errors to avoid spam

### Code Organization

1. **Centralized Handling**: Use centralized error handling
2. **Consistent Formatting**: Use consistent error message formatting
3. **Type Safety**: Use TypeScript for type safety
4. **Error Boundaries**: Implement error boundaries for different modules
5. **Testing**: Test error handling scenarios

This documentation provides comprehensive guidance for using the errors module effectively. The module is designed to be robust, flexible, and easy to use while providing powerful error handling capabilities for the Ollama Code CLI.
