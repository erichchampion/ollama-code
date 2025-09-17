# AI Module Documentation

This document provides comprehensive documentation for the `src/ai/` module, which handles all AI-related functionality using the Ollama local inference engine.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Interfaces and Types](#interfaces-and-types)
- [Key Functions](#key-functions)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)

## Module Overview

The AI module (`src/ai/`) provides a comprehensive interface for interacting with local AI models through the Ollama server. It handles text completion, chat functionality, model management, and streaming responses.

### Purpose

- **Local AI Processing**: Enable AI-powered code assistance using local models
- **Model Management**: Handle model downloading, listing, and selection
- **Text Generation**: Provide text completion and chat capabilities
- **Streaming Support**: Enable real-time streaming of AI responses
- **Error Handling**: Robust error handling and user-friendly error messages

### Key Features

- **Ollama Integration**: Native integration with Ollama local inference server
- **Multiple Models**: Support for various AI models (llama2, codellama, etc.)
- **Streaming Responses**: Real-time streaming of AI-generated content
- **Retry Logic**: Automatic retry with exponential backoff
- **Connection Management**: Automatic server detection and startup
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Architecture

### Module Structure

```
src/ai/
├── index.ts           # Main module exports and initialization
├── ollama-client.ts   # Core Ollama client implementation
├── types.ts          # TypeScript type definitions
└── prompts.ts        # Predefined prompts and templates
```

### Dependencies

- **Internal**: `../utils/logger`, `../errors/formatter`, `../utils/async`
- **External**: `node-fetch` for HTTP requests
- **Runtime**: Node.js built-in modules

### Design Patterns

- **Singleton Pattern**: Single AI client instance across the application
- **Factory Pattern**: Client creation and initialization
- **Strategy Pattern**: Different completion strategies (streaming vs non-streaming)
- **Observer Pattern**: Event handling for streaming responses

## Core Components

### OllamaClient Class

The main class for interacting with the Ollama API.

#### Constructor
```typescript
constructor(config: Partial<typeof DEFAULT_CONFIG> = {})
```

**Parameters:**
- `config`: Optional configuration object to override defaults

**Default Configuration:**
```typescript
const DEFAULT_CONFIG = {
  apiBaseUrl: 'http://localhost:11434',
  timeout: 120000, // 2 minutes
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000
  },
  defaultModel: 'qwen2.5-coder:latest',
  defaultTemperature: 0.7,
  defaultTopP: 0.9,
  defaultTopK: 40
};
```

#### Key Methods

##### `complete(prompt, options)`
Generate a text completion using the specified model.

**Parameters:**
- `prompt`: String or array of messages to complete
- `options`: Optional completion parameters

**Returns:** `Promise<OllamaCompletionResponse>`

**Example:**
```typescript
const response = await client.complete('What is TypeScript?', {
  model: 'llama2',
  temperature: 0.8
});
console.log(response.message.content);
```

##### `completeStream(prompt, options, onEvent)`
Generate a streaming text completion.

**Parameters:**
- `prompt`: String or array of messages
- `options`: Optional completion parameters
- `onEvent`: Callback function for stream events

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.completeStream('Explain JavaScript', {}, (event) => {
  if (event.message?.content) {
    process.stdout.write(event.message.content);
  }
});
```

##### `listModels()`
List all available models on the Ollama server.

**Returns:** `Promise<OllamaModel[]>`

**Example:**
```typescript
const models = await client.listModels();
console.log(models.map(m => m.name));
```

##### `pullModel(modelName)`
Download a new model from the Ollama registry.

**Parameters:**
- `modelName`: Name of the model to download

**Returns:** `Promise<void>`

**Example:**
```typescript
await client.pullModel('llama2');
```

##### `testConnection()`
Test the connection to the Ollama server.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const isConnected = await client.testConnection();
if (!isConnected) {
  console.log('Ollama server is not running');
}
```

### Module Initialization

#### `initAI(config)`
Initialize the AI module and create a client instance.

**Parameters:**
- `config`: Optional configuration object

**Returns:** `Promise<OllamaClient>`

**Example:**
```typescript
import { initAI } from './ai/index.js';

const client = await initAI({
  apiBaseUrl: 'http://localhost:11434',
  defaultModel: 'llama2'
});
```

#### `getAIClient()`
Get the current AI client instance.

**Returns:** `OllamaClient`

**Throws:** Error if AI module not initialized

**Example:**
```typescript
import { getAIClient } from './ai/index.js';

const client = getAIClient();
const response = await client.complete('Hello world');
```

#### `isAIInitialized()`
Check if the AI module is initialized.

**Returns:** `boolean`

**Example:**
```typescript
import { isAIInitialized } from './ai/index.js';

if (isAIInitialized()) {
  console.log('AI module is ready');
}
```

## Interfaces and Types

### Core Types

#### `OllamaMessage`
Represents a message in a conversation.

```typescript
interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

#### `OllamaCompletionOptions`
Options for text completion requests.

```typescript
interface OllamaCompletionOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
  system?: string;
  context?: number[];
  format?: string;
}
```

#### `OllamaCompletionResponse`
Response from a completion request.

```typescript
interface OllamaCompletionResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  context?: number[];
}
```

#### `OllamaModel`
Information about an available model.

```typescript
interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}
```

### Request/Response Types

#### `OllamaCompletionRequest`
Internal request format for the Ollama API.

```typescript
interface OllamaCompletionRequest {
  model: string;
  messages: OllamaMessage[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repeat_penalty?: number;
  stop?: string[];
  stream?: boolean;
  system?: string;
  context?: number[];
  format?: string;
}
```

#### `OllamaStreamEvent`
Event data for streaming responses.

```typescript
interface OllamaStreamEvent {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  context?: number[];
}
```

## Key Functions

### Text Completion

#### Basic Completion
```typescript
// Simple text completion
const response = await client.complete('What is JavaScript?');
console.log(response.message.content);
```

#### Completion with Options
```typescript
// Completion with custom parameters
const response = await client.complete('Write a function', {
  model: 'codellama',
  temperature: 0.8,
  topP: 0.9,
  maxTokens: 1000
});
```

#### Conversation Completion
```typescript
// Multi-turn conversation
const messages = [
  { role: 'system', content: 'You are a helpful coding assistant.' },
  { role: 'user', content: 'What is TypeScript?' },
  { role: 'assistant', content: 'TypeScript is a programming language...' },
  { role: 'user', content: 'How do I use it?' }
];

const response = await client.complete(messages);
```

### Streaming Responses

#### Basic Streaming
```typescript
// Stream response in real-time
await client.completeStream('Explain React', {}, (event) => {
  if (event.message?.content) {
    process.stdout.write(event.message.content);
  }
  if (event.done) {
    console.log('\nStream complete');
  }
});
```

#### Streaming with Error Handling
```typescript
// Stream with error handling
try {
  await client.completeStream('Generate code', {}, (event) => {
    if (event.message?.content) {
      process.stdout.write(event.message.content);
    }
  });
} catch (error) {
  console.error('Streaming failed:', error.message);
}
```

### Model Management

#### List Available Models
```typescript
// Get all available models
const models = await client.listModels();
console.log('Available models:');
models.forEach(model => {
  console.log(`- ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);
});
```

#### Download New Model
```typescript
// Download a new model
try {
  console.log('Downloading llama2...');
  await client.pullModel('llama2');
  console.log('Download complete!');
} catch (error) {
  console.error('Download failed:', error.message);
}
```

#### Test Connection
```typescript
// Test if Ollama server is running
const isConnected = await client.testConnection();
if (isConnected) {
  console.log('Ollama server is running');
} else {
  console.log('Ollama server is not available');
}
```

## Usage Examples

### Basic Setup

```typescript
import { initAI, getAIClient } from './ai/index.js';

// Initialize AI module
const client = await initAI({
  apiBaseUrl: 'http://localhost:11434',
  defaultModel: 'llama2'
});

// Use the client
const response = await client.complete('Hello, world!');
console.log(response.message.content);
```

### Code Generation

```typescript
// Generate a simple function
const prompt = 'Write a function that calculates the factorial of a number';
const response = await client.complete(prompt, {
  model: 'codellama',
  temperature: 0.7
});

console.log(response.message.content);
```

### Code Explanation

```typescript
// Explain existing code
const code = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

const response = await client.complete(`Explain this code:\n\`\`\`\n${code}\n\`\`\``);
console.log(response.message.content);
```

### Interactive Chat

```typescript
// Multi-turn conversation
const conversation = [
  { role: 'system', content: 'You are a helpful programming assistant.' },
  { role: 'user', content: 'I need help with async/await in JavaScript' },
  { role: 'assistant', content: 'Async/await is a way to handle asynchronous operations...' },
  { role: 'user', content: 'Can you show me an example?' }
];

const response = await client.complete(conversation);
console.log(response.message.content);
```

### Streaming Chat

```typescript
// Real-time streaming chat
const messages = [
  { role: 'user', content: 'Write a React component for a todo list' }
];

await client.completeStream(messages, {}, (event) => {
  if (event.message?.content) {
    process.stdout.write(event.message.content);
  }
  if (event.done) {
    console.log('\n\nGeneration complete!');
  }
});
```

## Configuration

### Environment Variables

```bash
# Ollama server URL
OLLAMA_HOST=http://localhost:11434

# Default model
OLLAMA_MODEL=llama2

# Request timeout
OLLAMA_TIMEOUT=120000
```

### Configuration Object

```typescript
const config = {
  apiBaseUrl: 'http://localhost:11434',
  timeout: 120000,
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000
  },
  defaultModel: 'llama2',
  defaultTemperature: 0.7,
  defaultTopP: 0.9,
  defaultTopK: 40
};

const client = await initAI(config);
```

### Model-Specific Configuration

```typescript
// Different models for different tasks
const codeResponse = await client.complete('Write a function', {
  model: 'codellama',
  temperature: 0.3
});

const creativeResponse = await client.complete('Write a story', {
  model: 'llama2',
  temperature: 0.9
});
```

## Error Handling

### Common Error Types

#### Connection Errors
```typescript
try {
  await client.complete('Hello');
} catch (error) {
  if (error.category === ErrorCategory.CONNECTION) {
    console.log('Ollama server is not running');
    console.log('Run: ollama serve');
  }
}
```

#### Model Errors
```typescript
try {
  await client.complete('Hello', { model: 'nonexistent-model' });
} catch (error) {
  if (error.category === ErrorCategory.AI_SERVICE) {
    console.log('Model not found');
    console.log('Available models:', await client.listModels());
  }
}
```

#### Timeout Errors
```typescript
try {
  await client.complete('Very long prompt...');
} catch (error) {
  if (error.category === ErrorCategory.TIMEOUT) {
    console.log('Request timed out');
    console.log('Try increasing the timeout or using a shorter prompt');
  }
}
```

### Error Recovery

#### Automatic Retry
```typescript
// The client automatically retries failed requests
const response = await client.complete('Hello', {
  // Retry configuration is handled internally
});
```

#### Manual Retry
```typescript
let retries = 0;
const maxRetries = 3;

while (retries < maxRetries) {
  try {
    const response = await client.complete('Hello');
    break;
  } catch (error) {
    retries++;
    if (retries === maxRetries) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
  }
}
```

## Performance Considerations

### Memory Usage

- **Model Loading**: Models are loaded into memory by Ollama
- **Context Management**: Large contexts consume more memory
- **Streaming**: Streaming reduces memory usage for long responses

### Response Time

- **Model Size**: Larger models take longer to respond
- **Context Length**: Longer contexts increase processing time
- **Hardware**: GPU acceleration significantly improves performance

### Optimization Tips

#### Use Appropriate Models
```typescript
// Use smaller models for simple tasks
const simpleResponse = await client.complete('Hello', {
  model: 'llama2:7b'
});

// Use specialized models for specific tasks
const codeResponse = await client.complete('Write code', {
  model: 'codellama'
});
```

#### Optimize Prompts
```typescript
// Be specific and concise
const goodPrompt = 'Write a function that sorts an array of numbers in ascending order';

// Avoid overly long prompts
const badPrompt = 'Write a function that... [very long description]';
```

#### Use Streaming for Long Responses
```typescript
// Stream long responses to improve perceived performance
await client.completeStream('Write a long article', {}, (event) => {
  if (event.message?.content) {
    process.stdout.write(event.message.content);
  }
});
```

## Best Practices

### Error Handling

1. **Always handle errors**: Wrap AI calls in try-catch blocks
2. **Provide user-friendly messages**: Use error categories for appropriate responses
3. **Implement retry logic**: Use the built-in retry mechanism
4. **Log errors**: Use the logger for debugging

### Performance

1. **Choose appropriate models**: Use smaller models for simple tasks
2. **Optimize prompts**: Be specific and concise
3. **Use streaming**: For long responses, use streaming
4. **Monitor memory usage**: Be aware of model memory requirements

### Security

1. **Validate inputs**: Sanitize user inputs before sending to AI
2. **Limit context size**: Prevent excessive memory usage
3. **Handle sensitive data**: Be careful with sensitive information in prompts
4. **Monitor usage**: Track API usage and costs

### Code Organization

1. **Use the singleton pattern**: Access the client through `getAIClient()`
2. **Initialize early**: Call `initAI()` during application startup
3. **Handle initialization errors**: Check if AI is initialized before use
4. **Use TypeScript**: Leverage type safety for better development experience

This documentation provides comprehensive guidance for using the AI module effectively. The module is designed to be robust, performant, and easy to use while providing powerful AI capabilities for the Ollama Code CLI.
