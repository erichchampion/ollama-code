# Telemetry Module Documentation

This document provides comprehensive documentation for the `src/telemetry/` module, which handles data collection, anonymization, and reporting for the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Telemetry Events](#telemetry-events)
- [Configuration](#configuration)
- [Data Collection](#data-collection)
- [Privacy and Security](#privacy-and-security)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The telemetry module (`src/telemetry/`) provides a comprehensive telemetry system that collects anonymous usage data and error reports to help improve the Ollama Code CLI tool. It respects user privacy and can be disabled.

### Purpose

- **Usage Analytics**: Collect anonymous usage data to understand how the tool is used
- **Error Reporting**: Track errors and issues to improve stability
- **Performance Monitoring**: Monitor performance metrics and bottlenecks
- **Feature Usage**: Track which features are most/least used
- **Privacy Protection**: Ensure user privacy through data anonymization

### Key Features

- **Anonymous Data Collection**: No personally identifiable information is collected
- **Configurable**: Can be enabled/disabled by users
- **Batch Processing**: Efficiently sends data in batches
- **Error Handling**: Robust error handling and retry logic
- **Privacy-First**: Built with privacy as a core principle
- **Non-Blocking**: Telemetry operations don't block the main application

## Architecture

### Module Structure

```
src/telemetry/
└── index.ts    # Telemetry system implementation
```

### Dependencies

- **Internal**: 
  - `../errors/types` (for error categories)
  - `../utils/logger` (for logging)
- **External**: 
  - `os` (Node.js operating system utilities)
  - `uuid` (for generating anonymous client IDs)
  - `fetch` (for sending telemetry data)

### Design Patterns

- **Singleton Pattern**: Single telemetry manager instance
- **Observer Pattern**: Event tracking and notification
- **Queue Pattern**: Batch processing of telemetry events
- **Strategy Pattern**: Different data collection strategies

## Telemetry Events

### Event Types

The telemetry system tracks the following event types:

```typescript
enum TelemetryEventType {
  CLI_START = 'cli_start',           // CLI application started
  CLI_EXIT = 'cli_exit',             // CLI application exited
  COMMAND_EXECUTE = 'command_execute', // Command execution started
  COMMAND_SUCCESS = 'command_success', // Command executed successfully
  COMMAND_ERROR = 'command_error',   // Command execution failed
  AI_REQUEST = 'ai_request',         // AI request made
  AI_RESPONSE = 'ai_response',       // AI response received
  AI_ERROR = 'ai_error',             // AI request failed
  AUTH_SUCCESS = 'auth_success',     // Authentication successful
  AUTH_ERROR = 'auth_error'          // Authentication failed
}
```

### Event Structure

Each telemetry event has the following structure:

```typescript
interface TelemetryEvent {
  type: TelemetryEventType;          // Event type
  timestamp: string;                 // ISO timestamp
  properties: Record<string, any>;   // Event-specific properties
  client: {                         // Client information
    version: string;                // CLI version
    id: string;                     // Anonymous client ID
    nodeVersion: string;            // Node.js version
    os: string;                     // Operating system
    osVersion: string;              // OS version
  };
}
```

### Event Examples

#### CLI Start Event

```typescript
{
  type: 'cli_start',
  timestamp: '2024-01-15T10:30:45.123Z',
  properties: {},
  client: {
    version: '0.1.0',
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nodeVersion: 'v18.17.0',
    os: 'darwin',
    osVersion: '23.0.0'
  }
}
```

#### Command Success Event

```typescript
{
  type: 'command_success',
  timestamp: '2024-01-15T10:30:50.456Z',
  properties: {
    command: 'generate',
    args: {
      type: 'component',
      name: 'Button',
      framework: 'react'
    }
  },
  client: {
    version: '0.1.0',
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nodeVersion: 'v18.17.0',
    os: 'darwin',
    osVersion: '23.0.0'
  }
}
```

#### Error Event

```typescript
{
  type: 'command_error',
  timestamp: '2024-01-15T10:31:00.789Z',
  properties: {
    command: 'generate',
    error: {
      name: 'ValidationError',
      message: 'Invalid component name',
      category: 'VALIDATION'
    }
  },
  client: {
    version: '0.1.0',
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nodeVersion: 'v18.17.0',
    os: 'darwin',
    osVersion: '23.0.0'
  }
}
```

## Configuration

### Telemetry Configuration

```typescript
interface TelemetryConfig {
  enabled: boolean;                  // Whether telemetry is enabled
  clientId: string;                 // Anonymous client ID
  endpoint?: string;                // Telemetry endpoint URL
  additionalData?: Record<string, any>; // Additional data to include
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  clientId: '',
  endpoint: 'https://telemetry.ollama.ai/ollama-code/events'
};
```

### Environment Variables

The telemetry system respects the following environment variables:

- `OLLAMA_CODE_TELEMETRY`: Set to `'false'` to disable telemetry
- `OLLAMA_CODE_TELEMETRY_ENDPOINT`: Custom telemetry endpoint URL

### User Preferences

Users can disable telemetry through:

1. **Environment Variable**: `OLLAMA_CODE_TELEMETRY=false`
2. **Configuration File**: `telemetry: false` in config
3. **Command Line**: `--no-telemetry` flag (if implemented)

## Data Collection

### Event Tracking

#### Basic Event Tracking

```typescript
import { telemetry, TelemetryEventType } from './telemetry/index.js';

// Track a simple event
telemetry.trackEvent(TelemetryEventType.CLI_START);

// Track an event with properties
telemetry.trackEvent(TelemetryEventType.COMMAND_EXECUTE, {
  command: 'generate',
  args: { type: 'component' }
});
```

#### Command Tracking

```typescript
import { telemetry } from './telemetry/index.js';

// Track command execution
telemetry.trackCommand('generate', {
  type: 'component',
  name: 'Button',
  framework: 'react'
}, true); // successful = true

// Track command error
telemetry.trackCommand('generate', {
  type: 'component',
  name: 'InvalidName'
}, false); // successful = false
```

#### Error Tracking

```typescript
import { telemetry } from './telemetry/index.js';

try {
  // Some operation
  await riskyOperation();
} catch (error) {
  // Track the error
  telemetry.trackError(error, {
    operation: 'riskyOperation',
    context: 'userCommand'
  });
}
```

### Data Sanitization

The telemetry system automatically sanitizes data to protect user privacy:

#### Sensitive Data Removal

```typescript
// Sensitive fields are automatically removed
const sanitizedArgs = {
  // These fields are removed:
  // - key, token, password, secret
  // - Any field containing these words
};

// Only safe data types are included:
// - strings (truncated to 100 chars)
// - numbers, booleans
// - null, undefined
// - arrays (shown as "Array(length)")
// - objects (shown as "Object")
```

#### Example Sanitization

```typescript
// Input
const args = {
  name: 'Button',
  apiKey: 'secret-key-123',        // Removed
  password: 'user-pass',           // Removed
  count: 5,                        // Kept
  enabled: true,                   // Kept
  files: ['a.txt', 'b.txt'],      // Kept as "Array(2)"
  config: { theme: 'dark' }        // Kept as "Object"
};

// Output after sanitization
const sanitizedArgs = {
  name: 'Button',
  count: 5,
  enabled: true,
  files: 'Array(2)',
  config: 'Object'
};
```

## Privacy and Security

### Privacy Protection

1. **No PII Collection**: No personally identifiable information is collected
2. **Anonymous Client IDs**: Uses UUIDs for client identification
3. **Data Sanitization**: Automatically removes sensitive information
4. **Opt-in by Default**: Users can easily disable telemetry
5. **Transparent Data**: Clear documentation of what data is collected

### Security Measures

1. **HTTPS Only**: All telemetry data is sent over HTTPS
2. **No Sensitive Data**: Sensitive information is never collected
3. **Error Handling**: Robust error handling prevents data leaks
4. **Rate Limiting**: Built-in rate limiting for telemetry requests

### Data Retention

- **Client ID**: Generated once and stored locally
- **Event Data**: Sent immediately and not stored locally
- **Error Data**: Only error types and messages, no stack traces
- **Usage Data**: Only feature usage patterns, not content

## Usage Examples

### Basic Initialization

```typescript
import { initTelemetry } from './telemetry/index.js';

// Initialize telemetry
const telemetry = await initTelemetry({
  version: '0.1.0',
  telemetry: {
    enabled: true,
    endpoint: 'https://telemetry.ollama.ai/ollama-code/events'
  }
});

// Use telemetry
telemetry.trackEvent('command_execute', { command: 'generate' });
```

### Command Integration

```typescript
import { telemetry } from './telemetry/index.js';

async function executeCommand(commandName: string, args: any) {
  try {
    // Track command start
    telemetry.trackEvent('command_execute', {
      command: commandName,
      args: args
    });
    
    // Execute command
    const result = await actualCommandExecution(commandName, args);
    
    // Track success
    telemetry.trackCommand(commandName, args, true);
    
    return result;
  } catch (error) {
    // Track error
    telemetry.trackError(error, {
      command: commandName,
      args: args
    });
    
    throw error;
  }
}
```

### Error Handling Integration

```typescript
import { telemetry } from './telemetry/index.js';

// Global error handler
process.on('uncaughtException', (error) => {
  telemetry.trackError(error, { fatal: true });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  telemetry.trackError(reason, { 
    type: 'unhandledRejection',
    promise: promise.toString()
  });
});
```

### AI Integration

```typescript
import { telemetry } from './telemetry/index.js';

async function makeAIRequest(prompt: string, options: any) {
  try {
    // Track AI request
    telemetry.trackEvent('ai_request', {
      promptLength: prompt.length,
      model: options.model,
      temperature: options.temperature
    });
    
    // Make request
    const response = await aiClient.complete(prompt, options);
    
    // Track success
    telemetry.trackEvent('ai_response', {
      responseLength: response.length,
      model: options.model,
      tokensUsed: response.tokensUsed
    });
    
    return response;
  } catch (error) {
    // Track error
    telemetry.trackError(error, {
      operation: 'ai_request',
      model: options.model
    });
    
    throw error;
  }
}
```

### Configuration Management

```typescript
import { telemetry } from './telemetry/index.js';

// Check if telemetry is enabled
if (telemetry.isEnabled()) {
  console.log('Telemetry is enabled');
} else {
  console.log('Telemetry is disabled');
}

// Enable/disable telemetry
telemetry.enable();
telemetry.disable();

// Flush pending events
await telemetry.flush();
```

## Best Practices

### Data Collection

1. **Minimal Data**: Only collect necessary data
2. **Sanitize Input**: Always sanitize user input
3. **Error Context**: Include relevant context with errors
4. **Performance**: Don't impact application performance
5. **Privacy**: Respect user privacy preferences

### Error Handling

1. **Graceful Degradation**: Telemetry failures shouldn't break the app
2. **Retry Logic**: Implement retry logic for failed requests
3. **Fallback**: Provide fallback behavior when telemetry is disabled
4. **Logging**: Log telemetry errors for debugging
5. **User Feedback**: Inform users about telemetry status

### Performance

1. **Async Operations**: Use async operations for telemetry
2. **Batch Processing**: Send data in batches
3. **Non-Blocking**: Don't block the main application
4. **Rate Limiting**: Implement rate limiting
5. **Memory Management**: Don't accumulate too much data

### Privacy

1. **Transparency**: Be transparent about data collection
2. **User Control**: Give users control over telemetry
3. **Data Minimization**: Collect only necessary data
4. **Anonymization**: Anonymize data before sending
5. **Security**: Use secure transmission methods

This documentation provides comprehensive guidance for using the telemetry module effectively. The module is designed to be privacy-first, performant, and easy to integrate into the Ollama Code CLI.
