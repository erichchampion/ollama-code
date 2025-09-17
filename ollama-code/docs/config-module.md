# Configuration Module Documentation

This document provides comprehensive documentation for the `src/config/` module, which handles configuration loading, validation, and management for the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [Configuration Sources](#configuration-sources)
- [Schema Validation](#schema-validation)
- [Default Values](#default-values)
- [Configuration Loading](#configuration-loading)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The configuration module (`src/config/`) provides a comprehensive system for managing application configuration across multiple sources with validation and type safety.

### Purpose

- **Configuration Management**: Centralized configuration loading and management
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Multiple Sources**: Support for files, environment variables, and CLI arguments
- **Validation**: Runtime validation of configuration values
- **Defaults**: Sensible default values for all configuration options

### Key Features

- **Multi-Source Loading**: Files, environment variables, CLI arguments
- **Schema Validation**: Zod-based validation with detailed error messages
- **Type Safety**: Full TypeScript support with inferred types
- **Hierarchical Merging**: Intelligent merging of configuration sources
- **Path Resolution**: Automatic resolution of configuration file paths
- **Environment Detection**: Platform-specific configuration handling

## Architecture

### Module Structure

```
src/config/
├── index.ts           # Main configuration loading and management
├── schema.ts          # Zod schema definitions and validation
└── defaults.ts        # Default configuration values
```

### Dependencies

- **Internal**: `../utils/logger`, `../errors/formatter`, `../errors/types`
- **External**: `zod` for schema validation
- **Runtime**: Node.js built-in modules (`fs`, `path`, `os`)

### Design Patterns

- **Strategy Pattern**: Different configuration loading strategies
- **Builder Pattern**: Configuration building and merging
- **Validation Pattern**: Schema-based validation
- **Singleton Pattern**: Single configuration instance

## Configuration Sources

### Configuration Files

The module searches for configuration files in the following order:

1. **Current Directory**:
   - `.ollama-code.json`
   - `.ollama-code.js`

2. **User Home Directory**:
   - `~/.ollama-code/config.json`
   - `~/.ollama-code.json`

3. **XDG Config Directory** (Linux/macOS):
   - `$XDG_CONFIG_HOME/ollama-code/config.json`
   - `~/.config/ollama-code/config.json`

4. **AppData Directory** (Windows):
   - `%APPDATA%/ollama-code/config.json`

#### JSON Configuration

```json
{
  "logLevel": "debug",
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "timeout": 120000
  },
  "ai": {
    "defaultModel": "llama2",
    "defaultTemperature": 0.8
  },
  "terminal": {
    "theme": "dark",
    "useColors": true
  }
}
```

#### JavaScript Configuration

```javascript
// .ollama-code.js
module.exports = {
  logLevel: 'debug',
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    timeout: 120000
  },
  ai: {
    defaultModel: 'llama2',
    defaultTemperature: 0.8
  },
  terminal: {
    theme: 'dark',
    useColors: true
  }
};
```

### Environment Variables

The module supports the following environment variables:

#### Basic Configuration
```bash
# Log level
OLLAMA_LOG_LEVEL=debug

# API URL
OLLAMA_API_URL=http://localhost:11434

# Default model
OLLAMA_MODEL=llama2

# Telemetry
OLLAMA_TELEMETRY=false
```

#### Advanced Configuration
```bash
# AI Configuration
OLLAMA_AI_MODEL=llama2
OLLAMA_AI_TEMPERATURE=0.8
OLLAMA_AI_TOP_P=0.9

# Terminal Configuration
OLLAMA_TERMINAL_THEME=dark
OLLAMA_TERMINAL_COLORS=true

# Code Analysis
OLLAMA_CODE_ANALYSIS_MAX_FILE_SIZE=2097152
OLLAMA_CODE_ANALYSIS_SCAN_TIMEOUT=60000
```

### CLI Arguments

Configuration can be overridden via CLI arguments:

```bash
# Verbose logging
ollama-code --verbose ask "Hello"

# Quiet mode
ollama-code --quiet ask "Hello"

# Debug mode
ollama-code --debug ask "Hello"

# Custom config file
ollama-code --config /path/to/config.json ask "Hello"
```

## Schema Validation

### Zod Schema System

The module uses Zod for runtime validation and type safety.

#### Basic Schema

```typescript
import { z } from 'zod';

const LogLevel = z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'trace']);

const ApiConfigSchema = z.object({
  key: z.string().optional(),
  baseUrl: z.string().url().optional(),
  version: z.string().optional(),
  timeout: z.number().positive().optional()
});
```

#### Nested Schemas

```typescript
const OllamaConfigSchema = z.object({
  baseUrl: z.string().url().default('http://localhost:11434'),
  timeout: z.number().positive().default(120000),
  retryOptions: z.object({
    maxRetries: z.number().default(3),
    initialDelayMs: z.number().default(1000),
    maxDelayMs: z.number().default(5000)
  }).default({
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000
  })
});
```

#### Main Configuration Schema

```typescript
export const configSchema = z.object({
  // Basic configuration
  workspace: z.string().optional(),
  logLevel: LogLevel.default('info'),
  
  // Subsystem configurations
  api: ApiConfigSchema.default({}),
  ollama: OllamaConfigSchema.default({...}),
  ai: AiConfigSchema.default({...}),
  telemetry: TelemetryConfigSchema.default({...}),
  terminal: TerminalConfigSchema.default({...}),
  codeAnalysis: CodeAnalysisConfigSchema.default({...}),
  git: GitConfigSchema.default({...}),
  editor: EditorConfigSchema.default({...}),
  
  // Runtime configuration
  paths: PathsConfigSchema.optional(),
  
  // Authentication related
  forceLogin: z.boolean().default(false),
  forceLogout: z.boolean().default(false),
  
  // Persistent data
  lastUpdateCheck: z.number().optional(),
  auth: z.object({
    tokens: z.record(z.string(), z.string()).optional(),
    lastAuth: z.number().optional()
  }).optional(),
  recentWorkspaces: z.array(z.string()).default([])
});
```

### Type Generation

The schema automatically generates TypeScript types:

```typescript
export type ConfigType = z.infer<typeof configSchema>;

// Usage
function processConfig(config: ConfigType) {
  // config is fully typed
  console.log(config.ollama.baseUrl);
  console.log(config.ai.defaultModel);
}
```

### Validation Features

#### Type Validation
```typescript
// Validates types at runtime
const config = configSchema.parse(rawConfig);
```

#### Range Validation
```typescript
// Temperature must be between 0 and 2
defaultTemperature: z.number().min(0).max(2).default(0.7)

// Timeout must be positive
timeout: z.number().positive().default(120000)
```

#### Enum Validation
```typescript
// Theme must be one of the specified values
theme: z.enum(['dark', 'light', 'system']).default('system')
```

#### URL Validation
```typescript
// Base URL must be a valid URL
baseUrl: z.string().url().default('http://localhost:11434')
```

## Default Values

### Default Configuration

The module provides comprehensive default values for all configuration options:

```typescript
export const defaultConfig: Partial<ConfigType> = {
  logLevel: 'info',
  
  ollama: {
    baseUrl: 'http://localhost:11434',
    timeout: 120000,
    retryOptions: {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 5000
    }
  },
  
  ai: {
    defaultModel: 'qwen2.5-coder:latest',
    defaultTemperature: 0.7,
    defaultTopP: 0.9,
    defaultTopK: 40,
    defaultRepeatPenalty: 1.1
  },
  
  telemetry: {
    enabled: true,
    anonymizeData: true,
    errorReporting: true
  },
  
  terminal: {
    theme: 'system',
    showProgressIndicators: true,
    useColors: true,
    codeHighlighting: true
  },
  
  codeAnalysis: {
    indexDepth: 3,
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '**/*.min.js',
      '**/*.bundle.js'
    ],
    includePatterns: ['**/*'],
    maxFileSize: 1024 * 1024, // 1MB
    scanTimeout: 30000 // 30 seconds
  },
  
  git: {
    preferredRemote: 'origin',
    useSsh: false,
    useGpg: false,
    signCommits: false
  },
  
  editor: {
    tabWidth: 2,
    insertSpaces: true,
    formatOnSave: true
  }
};
```

### Configuration Categories

#### API Configuration
- **baseUrl**: API endpoint URL
- **version**: API version
- **timeout**: Request timeout in milliseconds
- **key**: API authentication key

#### Ollama Configuration
- **baseUrl**: Ollama server URL
- **timeout**: Request timeout
- **retryOptions**: Retry configuration

#### AI Configuration
- **defaultModel**: Default AI model
- **defaultTemperature**: Temperature for text generation
- **defaultTopP**: Top-p sampling parameter
- **defaultTopK**: Top-k sampling parameter
- **defaultRepeatPenalty**: Repeat penalty parameter

#### Terminal Configuration
- **theme**: Terminal theme (dark/light/system)
- **useColors**: Enable colored output
- **showProgressIndicators**: Show progress indicators
- **codeHighlighting**: Enable code syntax highlighting

#### Code Analysis Configuration
- **indexDepth**: Maximum directory depth to index
- **excludePatterns**: Patterns to exclude from analysis
- **includePatterns**: Patterns to include in analysis
- **maxFileSize**: Maximum file size to analyze
- **scanTimeout**: Timeout for scanning operations

## Configuration Loading

### loadConfig Function

The main function for loading configuration:

```typescript
export async function loadConfig(options: any = {}): Promise<ConfigType>
```

#### Basic Usage

```typescript
import { loadConfig } from './config/index.js';

// Load configuration with defaults
const config = await loadConfig();
console.log(config.ollama.baseUrl);
```

#### With CLI Options

```typescript
// Load configuration with CLI options
const config = await loadConfig({
  verbose: true,
  config: '/path/to/config.json'
});
```

### Loading Process

The configuration loading process follows this order:

1. **Initialize with defaults**
2. **Load from configuration files** (first found)
3. **Load from environment variables**
4. **Override with CLI options**
5. **Validate final configuration**

#### File Loading

```typescript
function loadConfigFromFile(configPath: string): any {
  try {
    if (!fs.existsSync(configPath)) {
      return null;
    }
    
    if (configPath.endsWith('.js')) {
      // Load JavaScript module
      const configModule = require(configPath);
      return configModule.default || configModule;
    } else {
      // Load JSON file
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    }
  } catch (error) {
    logger.warn(`Error loading configuration from ${configPath}`, error);
    return null;
  }
}
```

#### Environment Variable Loading

```typescript
function loadConfigFromEnv(): any {
  const envConfig: any = {};
  
  if (process.env.OLLAMA_API_URL) {
    envConfig.api = envConfig.api || {};
    envConfig.api.baseUrl = process.env.OLLAMA_API_URL;
  }
  
  if (process.env.OLLAMA_LOG_LEVEL) {
    envConfig.logger = envConfig.logger || {};
    envConfig.logger.level = process.env.OLLAMA_LOG_LEVEL;
  }
  
  return envConfig;
}
```

#### Configuration Merging

```typescript
function mergeConfigs(...configs: any[]): any {
  const result: any = {};
  
  for (const config of configs) {
    if (!config) continue;
    
    for (const key of Object.keys(config)) {
      const value = config[key];
      
      if (value === null || value === undefined) {
        continue;
      }
      
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // Recursively merge objects
        result[key] = mergeConfigs(result[key] || {}, value);
      } else {
        // Overwrite primitives, arrays, etc.
        result[key] = value;
      }
    }
  }
  
  return result;
}
```

### Validation

#### Critical Configuration Validation

```typescript
function validateConfig(config: any): void {
  // Validate API configuration
  if (!config.api.baseUrl) {
    throw createUserError('API base URL is not configured', {
      category: ErrorCategory.CONFIGURATION,
      resolution: 'Provide a valid API base URL in your configuration'
    });
  }
  
  // Validate AI model
  if (!config.ai.model) {
    throw createUserError('AI model is not configured', {
      category: ErrorCategory.CONFIGURATION,
      resolution: 'Specify a valid Ollama model in your configuration'
    });
  }
}
```

## Usage Examples

### Basic Configuration Loading

```typescript
import { loadConfig } from './config/index.js';

// Load configuration
const config = await loadConfig();

// Use configuration
console.log(`Ollama URL: ${config.ollama.baseUrl}`);
console.log(`Default Model: ${config.ai.defaultModel}`);
console.log(`Log Level: ${config.logLevel}`);
```

### Configuration with Validation

```typescript
import { loadConfig, configSchema } from './config/index.js';

try {
  const config = await loadConfig();
  
  // Configuration is already validated
  console.log('Configuration loaded successfully');
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

### Custom Configuration File

```typescript
// Load from specific config file
const config = await loadConfig({
  config: '/path/to/custom-config.json'
});
```

### Environment-Specific Configuration

```typescript
// Load configuration with environment variables
process.env.OLLAMA_API_URL = 'http://localhost:11434';
process.env.OLLAMA_LOG_LEVEL = 'debug';

const config = await loadConfig();
// config.ollama.baseUrl will be 'http://localhost:11434'
// config.logLevel will be 'debug'
```

### Configuration Override

```typescript
// Override specific values
const config = await loadConfig({
  verbose: true, // Sets logLevel to 'debug'
  quiet: false   // Sets logLevel to 'error'
});
```

### Schema Validation

```typescript
import { configSchema } from './config/schema.js';

// Validate raw configuration
const rawConfig = {
  ollama: {
    baseUrl: 'http://localhost:11434',
    timeout: 120000
  },
  ai: {
    defaultModel: 'llama2',
    defaultTemperature: 0.8
  }
};

try {
  const validatedConfig = configSchema.parse(rawConfig);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.errors);
}
```

### Type-Safe Configuration

```typescript
import { ConfigType } from './config/schema.js';

function processConfig(config: ConfigType) {
  // Full type safety
  if (config.ollama.baseUrl) {
    console.log(`Connecting to: ${config.ollama.baseUrl}`);
  }
  
  if (config.ai.defaultModel) {
    console.log(`Using model: ${config.ai.defaultModel}`);
  }
  
  // TypeScript will catch type errors
  // config.ollama.timeout is guaranteed to be a number
  const timeout = config.ollama.timeout * 1000;
}
```

## Best Practices

### Configuration Design

1. **Sensible Defaults**: Provide reasonable default values
2. **Type Safety**: Use TypeScript and Zod for type safety
3. **Validation**: Validate all configuration values
4. **Documentation**: Document all configuration options
5. **Hierarchy**: Use clear configuration hierarchy

### File Organization

1. **Single Source**: Use one configuration file per environment
2. **Environment Variables**: Use for sensitive or environment-specific values
3. **CLI Overrides**: Use for temporary overrides
4. **Validation**: Always validate configuration before use

### Error Handling

1. **Clear Messages**: Provide clear error messages
2. **Resolution Hints**: Include suggestions for fixing errors
3. **Graceful Degradation**: Fall back to defaults when possible
4. **Logging**: Log configuration loading issues

### Performance

1. **Lazy Loading**: Load configuration only when needed
2. **Caching**: Cache loaded configuration
3. **Validation**: Validate once, use many times
4. **Efficient Merging**: Use efficient merging algorithms

This documentation provides comprehensive guidance for using the configuration module effectively. The module is designed to be flexible, type-safe, and easy to use while providing powerful configuration management capabilities for the Ollama Code CLI.
