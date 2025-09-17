# index.ts Module

**Path:** `src/errors/index.ts`

**Description:** Module functionality

## API Reference

### Functions

#### `initErrorHandling()`

* Error Handling Module
 * 
 * Provides centralized error handling, tracking, and reporting.

```typescript
/**
 * Error Handling Module
 * 
 * Provides centralized error handling, tracking, and reporting.
 */

import { logger } from '../utils/logger.js';
import { ErrorLevel, ErrorCategory, ErrorManager, ErrorOptions } from './types.js';
import { formatErrorForDisplay } from './formatter.js';
import { setupSentryReporting } from './sentry.js';
import { setupConsoleErrorHandling } from './console.js';

/**
 * Initialize error handling system
 */
export function initErrorHandling
```

## Usage Examples

```typescript
import { /* exports */ } from './index.ts';
```

