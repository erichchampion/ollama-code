# Utils Module Documentation

This document provides comprehensive documentation for the `src/utils/` module, which contains common utilities, helper functions, and async patterns used throughout the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Async Utilities](#async-utilities)
- [Formatting Utilities](#formatting-utilities)
- [Logger](#logger)
- [Validation Utilities](#validation-utilities)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The utils module (`src/utils/`) provides a comprehensive collection of utility functions and classes that are used throughout the Ollama Code CLI application. It includes async utilities, formatting functions, logging, validation, and other common helper functions.

### Purpose

- **Common Utilities**: Provide reusable utility functions
- **Async Patterns**: Handle asynchronous operations with timeouts, retries, and concurrency
- **Formatting**: Format text, numbers, dates, and other data types
- **Logging**: Provide consistent logging across the application
- **Validation**: Validate inputs and data structures

### Key Features

- **Async Utilities**: Timeouts, retries, concurrency control, debouncing, throttling
- **Formatting**: Text formatting, number formatting, date formatting, file size formatting
- **Logging**: Structured logging with levels, colors, and timestamps
- **Validation**: Input validation and type checking
- **Text Processing**: String manipulation, truncation, wrapping, padding

## Architecture

### Module Structure

```
src/utils/
├── index.ts           # Main exports and module interface
├── async.ts          # Async utilities and patterns
├── formatting.ts     # Text and data formatting utilities
├── logger.ts         # Logging system
├── validation.ts     # Input validation utilities
├── types.ts          # TypeScript type definitions
└── ollama-server.ts  # Ollama server utilities
```

### Dependencies

- **Internal**: `../errors/types` (for error levels)
- **External**: None (pure TypeScript implementation)
- **Runtime**: Node.js built-in modules

### Design Patterns

- **Utility Pattern**: Collection of stateless utility functions
- **Singleton Pattern**: Single logger instance
- **Factory Pattern**: Function creation and configuration
- **Strategy Pattern**: Different formatting and validation strategies

## Async Utilities

### Timeout and Retry Functions

#### `withTimeout(fn, timeoutMs)`
Wrap a function with a timeout.

```typescript
import { withTimeout } from './utils/async.js';

const timeoutFn = withTimeout(async (url: string) => {
  const response = await fetch(url);
  return response.json();
}, 5000); // 5 second timeout

try {
  const data = await timeoutFn('https://api.example.com/data');
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out');
  }
}
```

#### `withRetry(fn, options)`
Wrap a function with retry logic.

```typescript
import { withRetry } from './utils/async.js';

const retryFn = withRetry(async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}, {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  isRetryable: (error) => error.message.includes('HTTP 5')
});

const data = await retryFn('https://api.example.com/data');
```

#### `delay(ms)`
Sleep for a specified number of milliseconds.

```typescript
import { delay } from './utils/async.js';

// Wait for 1 second
await delay(1000);

// Wait for 500ms
await delay(500);
```

### Concurrency Control

#### `withConcurrency(items, fn, concurrency)`
Process items with a concurrency limit.

```typescript
import { withConcurrency } from './utils/async.js';

const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];

const results = await withConcurrency(
  urls,
  async (url, index) => {
    const response = await fetch(url);
    return response.json();
  },
  2 // Process 2 URLs at a time
);
```

#### `runSequentially(fns)`
Run functions in sequence.

```typescript
import { runSequentially } from './utils/async.js';

const results = await runSequentially([
  () => fetch('https://api.example.com/step1'),
  () => fetch('https://api.example.com/step2'),
  () => fetch('https://api.example.com/step3')
]);
```

### Function Control

#### `debounce(fn, waitMs, options)`
Create a debounced version of a function.

```typescript
import { debounce } from './utils/async.js';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query);
  displayResults(results);
}, 300); // Wait 300ms after last call

// Multiple rapid calls will only execute the last one
debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc'); // Only this will execute
```

#### `throttle(fn, waitMs, options)`
Create a throttled version of a function.

```typescript
import { throttle } from './utils/async.js';

const throttledUpdate = throttle(async (data: any) => {
  await updateAPI(data);
}, 1000); // Execute at most once per second

// Multiple calls will be throttled
throttledUpdate(data1);
throttledUpdate(data2); // Will be throttled
throttledUpdate(data3); // Will be throttled
```

### Promise Utilities

#### `createDeferred<T>()`
Create a deferred promise.

```typescript
import { createDeferred } from './utils/async.js';

const { promise, resolve, reject } = createDeferred<string>();

// Resolve the promise
resolve('Hello, World!');

// Or reject it
reject(new Error('Something went wrong'));

// Use the promise
try {
  const result = await promise;
  console.log(result); // 'Hello, World!'
} catch (error) {
  console.error(error);
}
```

## Formatting Utilities

### Text Formatting

#### `truncate(text, maxLength, suffix)`
Truncate text to a maximum length.

```typescript
import { truncate } from './utils/formatting.js';

const short = truncate('This is a very long text', 10);
console.log(short); // 'This is a...'

const custom = truncate('This is a very long text', 10, '...');
console.log(custom); // 'This is a...'
```

#### `wrapText(text, width)`
Wrap text to a specified width.

```typescript
import { wrapText } from './utils/formatting.js';

const wrapped = wrapText('This is a very long line that should be wrapped', 20);
console.log(wrapped);
// 'This is a very long\nline that should be\nwrapped'
```

#### `indent(text, spaces)`
Indent text with a specified number of spaces.

```typescript
import { indent } from './utils/formatting.js';

const indented = indent('Hello\nWorld', 4);
console.log(indented);
// '    Hello\n    World'
```

### Number and Date Formatting

#### `formatNumber(num)`
Format a number with commas.

```typescript
import { formatNumber } from './utils/formatting.js';

console.log(formatNumber(1234567)); // '1,234,567'
console.log(formatNumber(123.45)); // '123.45'
```

#### `formatDate(date)`
Format a date to ISO string without milliseconds.

```typescript
import { formatDate } from './utils/formatting.js';

const date = new Date('2024-01-15T10:30:45.123Z');
console.log(formatDate(date)); // '2024-01-15T10:30:45Z'
```

#### `formatFileSize(bytes)`
Format file size in bytes to human-readable string.

```typescript
import { formatFileSize } from './utils/formatting.js';

console.log(formatFileSize(1024)); // '1 KB'
console.log(formatFileSize(1048576)); // '1 MB'
console.log(formatFileSize(1073741824)); // '1 GB'
```

#### `formatDuration(ms)`
Format duration in milliseconds to human-readable string.

```typescript
import { formatDuration } from './utils/formatting.js';

console.log(formatDuration(500)); // '500ms'
console.log(formatDuration(1500)); // '1s'
console.log(formatDuration(65000)); // '1m 5s'
console.log(formatDuration(3665000)); // '1h 1m 5s'
```

### String Manipulation

#### `stripAnsi(text)`
Remove ANSI escape codes from text.

```typescript
import { stripAnsi } from './utils/formatting.js';

const colored = '\x1b[31mRed text\x1b[0m';
const plain = stripAnsi(colored);
console.log(plain); // 'Red text'
```

#### `padString(text, width, padChar, padRight)`
Pad a string to a fixed width.

```typescript
import { padString } from './utils/formatting.js';

console.log(padString('Hello', 10)); // 'Hello     '
console.log(padString('Hello', 10, '0', false)); // '00000Hello'
```

#### `centerString(text, width, padChar)`
Center a string within a fixed width.

```typescript
import { centerString } from './utils/formatting.js';

console.log(centerString('Hello', 10)); // '  Hello   '
console.log(centerString('Hello', 11)); // '   Hello   '
```

### Table and Object Formatting

#### `createTextTable(rows, headers)`
Create a simple text table.

```typescript
import { createTextTable } from './utils/formatting.js';

const table = createTextTable(
  [
    ['John', '25', 'Engineer'],
    ['Jane', '30', 'Designer'],
    ['Bob', '35', 'Manager']
  ],
  ['Name', 'Age', 'Role']
);

console.log(table);
// Name | Age | Role
// -----+-----+--------
// John | 25  | Engineer
// Jane | 30  | Designer
// Bob  | 35  | Manager
```

#### `formatKeyValue(obj, options)`
Format a key-value object as a string.

```typescript
import { formatKeyValue } from './utils/formatting.js';

const obj = {
  name: 'John Doe',
  age: 30,
  city: 'New York',
  active: true
};

const formatted = formatKeyValue(obj, {
  indent: 2,
  keyValueSeparator: ': ',
  includeEmpty: false
});

console.log(formatted);
//   name: John Doe
//   age: 30
//   city: New York
//   active: true
```

### Text Processing

#### `camelToTitleCase(text)`
Convert camelCase to Title Case.

```typescript
import { camelToTitleCase } from './utils/formatting.js';

console.log(camelToTitleCase('firstName')); // 'First Name'
console.log(camelToTitleCase('userName')); // 'User Name'
console.log(camelToTitleCase('isActive')); // 'Is Active'
```

#### `formatErrorDetails(error)`
Format error details for display.

```typescript
import { formatErrorDetails } from './utils/formatting.js';

try {
  throw new Error('Something went wrong');
} catch (error) {
  const details = formatErrorDetails(error);
  console.log(details);
  // Error: Something went wrong
  // Stack: at Object.<anonymous> (/path/to/file.js:2:11)
  // ...
}
```

## Logger

### Logger Class

The logger provides structured logging with levels, colors, and timestamps.

#### Basic Usage

```typescript
import { logger } from './utils/logger.js';

// Log messages at different levels
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

#### Configuration

```typescript
import { logger, LogLevel } from './utils/logger.js';

// Configure logger
logger.configure({
  level: LogLevel.DEBUG,
  timestamps: true,
  colors: true,
  verbose: true
});

// Set log level
logger.setLevel(LogLevel.WARN);
```

#### Logging with Context

```typescript
import { logger } from './utils/logger.js';

// Log with context
logger.info('User logged in', {
  userId: '123',
  username: 'john_doe',
  timestamp: new Date().toISOString()
});

// Log error with context
logger.error('Database connection failed', {
  error: error.message,
  host: 'localhost',
  port: 5432,
  retryCount: 3
});
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,    // Debug information
  INFO = 1,     // General information
  WARN = 2,     // Warning messages
  ERROR = 3,    // Error messages
  SILENT = 4    // No logging
}
```

### Environment Configuration

The logger automatically configures itself based on environment variables:

```bash
# Enable debug logging
DEBUG=true

# Enable verbose logging
VERBOSE=true

# Set specific log level
LOG_LEVEL=2
```

## Validation Utilities

### Input Validation

#### `isNonEmptyString(value)`
Check if a value is a non-empty string.

```typescript
import { isNonEmptyString } from './utils/validation.js';

console.log(isNonEmptyString('hello')); // true
console.log(isNonEmptyString('')); // false
console.log(isNonEmptyString(null)); // false
console.log(isNonEmptyString(undefined)); // false
```

### Type Validation

```typescript
// Check if value is a string
function isString(value: any): value is string {
  return typeof value === 'string';
}

// Check if value is a number
function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Check if value is an object
function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
```

## Core Components

### Async Utilities

#### `RetryOptions` Interface

```typescript
interface RetryOptions {
  maxRetries: number;                    // Maximum retry attempts
  initialDelayMs: number;                // Initial delay in milliseconds
  maxDelayMs: number;                    // Maximum delay in milliseconds
  backoff?: boolean;                     // Use exponential backoff
  isRetryable?: (error: Error) => boolean; // Check if error is retryable
  onRetry?: (error: Error, attempt: number) => void; // Retry callback
}
```

### Logger Configuration

#### `LoggerConfig` Interface

```typescript
interface LoggerConfig {
  level: LogLevel;                       // Minimum log level
  timestamps: boolean;                   // Include timestamps
  colors: boolean;                       // Colorize output
  verbose: boolean;                      // Include context
  destination?: (message: string, level: LogLevel) => void; // Custom output
}
```

## Usage Examples

### Async Operations

```typescript
import { withTimeout, withRetry, withConcurrency } from './utils/async.js';

// Timeout example
const timeoutFn = withTimeout(async (url: string) => {
  const response = await fetch(url);
  return response.json();
}, 5000);

// Retry example
const retryFn = withRetry(async (data: any) => {
  const response = await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}, {
  maxRetries: 3,
  initialDelayMs: 1000,
  isRetryable: (error) => error.message.includes('HTTP 5')
});

// Concurrency example
const results = await withConcurrency(
  ['url1', 'url2', 'url3'],
  async (url) => {
    const response = await fetch(url);
    return response.json();
  },
  2 // Process 2 URLs at a time
);
```

### Formatting

```typescript
import { 
  truncate, 
  formatNumber, 
  formatFileSize, 
  createTextTable 
} from './utils/formatting.js';

// Text formatting
const short = truncate('Very long text', 10);
console.log(short); // 'Very long...'

// Number formatting
const formatted = formatNumber(1234567);
console.log(formatted); // '1,234,567'

// File size formatting
const size = formatFileSize(1048576);
console.log(size); // '1 MB'

// Table formatting
const table = createTextTable(
  [
    ['John', '25', 'Engineer'],
    ['Jane', '30', 'Designer']
  ],
  ['Name', 'Age', 'Role']
);
console.log(table);
```

### Logging

```typescript
import { logger, LogLevel } from './utils/logger.js';

// Configure logger
logger.configure({
  level: LogLevel.DEBUG,
  timestamps: true,
  colors: true,
  verbose: true
});

// Log with context
logger.info('Processing started', {
  userId: '123',
  operation: 'data_processing',
  timestamp: new Date().toISOString()
});

// Log error with context
logger.error('Processing failed', {
  error: error.message,
  userId: '123',
  operation: 'data_processing',
  retryCount: 3
});
```

### Validation

```typescript
import { isNonEmptyString } from './utils/validation.js';

function validateUser(user: any): boolean {
  if (!isNonEmptyString(user.name)) {
    logger.error('User name is required');
    return false;
  }
  
  if (!isNonEmptyString(user.email)) {
    logger.error('User email is required');
    return false;
  }
  
  return true;
}
```

## Best Practices

### Async Operations

1. **Use Timeouts**: Always set timeouts for external operations
2. **Implement Retries**: Use retry logic for transient failures
3. **Control Concurrency**: Limit concurrent operations to prevent overload
4. **Handle Errors**: Properly handle and log errors
5. **Use Debouncing**: Debounce user input to avoid excessive API calls

### Formatting

1. **Consistent Formatting**: Use consistent formatting across the application
2. **User-Friendly Output**: Format data for human readability
3. **Handle Edge Cases**: Handle null, undefined, and empty values
4. **Performance**: Use efficient formatting functions
5. **Localization**: Consider localization for user-facing text

### Logging

1. **Appropriate Levels**: Use appropriate log levels
2. **Include Context**: Include relevant context in log messages
3. **Structured Logging**: Use structured logging for better analysis
4. **Performance**: Avoid expensive operations in log messages
5. **Security**: Don't log sensitive information

### Validation

1. **Validate Early**: Validate inputs as early as possible
2. **Clear Messages**: Provide clear validation error messages
3. **Type Safety**: Use TypeScript for type safety
4. **Consistent Validation**: Use consistent validation patterns
5. **Performance**: Use efficient validation functions

This documentation provides comprehensive guidance for using the utils module effectively. The module is designed to be efficient, easy to use, and provide powerful utility functions for the Ollama Code CLI.
