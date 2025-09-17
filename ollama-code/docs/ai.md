# index.ts Module

**Path:** `src/ai/index.ts`

**Description:** Module functionality

## API Reference

### Functions

#### `initAI()`

* AI Module
 * 
 * Provides AI capabilities using Ollama, local large language model inference.
 * This module handles initialization, configuration, and access to AI services.

```typescript
/**
 * AI Module
 * 
 * Provides AI capabilities using Ollama, local large language model inference.
 * This module handles initialization, configuration, and access to AI services.
 */

import { OllamaClient } from './ollama-client.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';

// Singleton AI client instance
let aiClient: OllamaClient | null = null;

/**
 * Initialize the AI module
 */
export async function initAI
```

#### `getAIClient()`

* Get the AI client instance

```typescript
/**
 * Get the AI client instance
 */
export function getAIClient
```

#### `isAIInitialized()`

* Check if AI module is initialized

```typescript
/**
 * Check if AI module is initialized
 */
export function isAIInitialized
```

## Usage Examples

```typescript
import { /* exports */ } from './index.ts';
```

