# index.ts Module

**Path:** `src/config/index.ts`

**Description:** Module functionality

## API Reference

### Functions

#### `loadConfigFromFile()`

* Configuration Module
 * 
 * Handles loading, validating, and providing access to application configuration.
 * Supports multiple sources like environment variables, config files, and CLI arguments.

```typescript
/**
 * Configuration Module
 * 
 * Handles loading, validating, and providing access to application configuration.
 * Supports multiple sources like environment variables, config files, and CLI arguments.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  // API configuration
  api: {
    baseUrl: 'http://localhost:11434',
    version: 'v1',
    timeout: 60000
  },
  
  // AI configuration
  ai: {
    model: 'qwen2.5-coder:latest',
    temperature: 0.5,
    maxTokens: 4096,
    maxHistoryLength: 20
  },
  
  // Authentication configuration
  auth: {
    autoRefresh: true,
    tokenRefreshThreshold: 300, // 5 minutes
    maxRetryAttempts: 3
  },
  
  // Terminal configuration
  terminal: {
    theme: 'system',
    useColors: true,
    showProgressIndicators: true,
    codeHighlighting: true
  },
  
  // Telemetry configuration
  telemetry: {
    enabled: true,
    submissionInterval: 30 * 60 * 1000, // 30 minutes
    maxQueueSize: 100,
    autoSubmit: true
  },
  
  // File operation configuration
  fileOps: {
    maxReadSizeBytes: 10 * 1024 * 1024 // 10MB
  },
  
  // Execution configuration
  execution: {
    shell: process.env.SHELL || 'bash'
  },
  
  // Logger configuration
  logger: {
    level: 'info',
    timestamps: true,
    colors: true
  },
  
  // App information
  version: '0.2.29'
};

/**
 * Configuration file paths to check
 */
const CONFIG_PATHS = [
  // Current directory
  path.join(process.cwd(), '.ollama-code.json'),
  path.join(process.cwd(), '.ollama-code.js'),
  
  // User home directory
  path.join(os.homedir(), '.ollama-code', 'config.json'),
  path.join(os.homedir(), '.ollama-code.json'),
  
  // XDG config directory (Linux/macOS)
  process.env.XDG_CONFIG_HOME 
    ? path.join(process.env.XDG_CONFIG_HOME, 'ollama-code', 'config.json')
    : path.join(os.homedir(), '.config', 'ollama-code', 'config.json'),
  
  // AppData directory (Windows)
  process.env.APPDATA
    ? path.join(process.env.APPDATA, 'ollama-code', 'config.json')
    : null
].filter(Boolean) as string[];

/**
 * Load configuration from a file
 */
function loadConfigFromFile
```

#### `loadConfigFromEnv()`

* Load configuration from environment variables

```typescript
/**
 * Load configuration from environment variables
 */
function loadConfigFromEnv
```

#### `mergeConfigs()`

* Merge configuration objects

```typescript
/**
 * Merge configuration objects
 */
function mergeConfigs
```

#### `validateConfig()`

* Validate critical configuration

```typescript
/**
 * Validate critical configuration
 */
function validateConfig
```

#### `loadConfig()`

* Load configuration

```typescript
/**
 * Load configuration
 */
export async function loadConfig
```

## Usage Examples

```typescript
import { /* exports */ } from './index.ts';
```

