# index.ts Module

**Path:** `src/codebase/index.ts`

**Description:** Module functionality

## API Reference

### Functions

#### `analyzeProject()`

* Codebase Analysis Module
 * 
 * This module provides utilities for analyzing and understanding code structure,
 * dependencies, and metrics about a codebase.

```typescript
/**
 * Codebase Analysis Module
 * 
 * This module provides utilities for analyzing and understanding code structure,
 * dependencies, and metrics about a codebase.
 */

import {
  analyzeCodebase,
  FileInfo,
  DependencyInfo,
  ProjectStructure,
  analyzeProjectDependencies,
  findFilesByContent
} from './analyzer.js';

export {
  analyzeCodebase,
  FileInfo,
  DependencyInfo,
  ProjectStructure,
  analyzeProjectDependencies,
  findFilesByContent
};

/**
 * Analyze a codebase and return a summary of its structure
 * 
 * @param directoryPath - Path to the directory to analyze
 * @param options - Analysis options
 * @returns Promise resolving to the project structure
 */
export async function analyzeProject
```

#### `initCodebaseAnalysis()`

* Background analysis state

```typescript
/**
 * Background analysis state
 */
interface BackgroundAnalysisState {
  running: boolean;
  interval: NodeJS.Timeout | null;
  lastResults: ProjectStructure | null;
  workingDirectory: string | null;
}

// Background analysis state
const backgroundAnalysis: BackgroundAnalysisState = {
  running: false,
  interval: null,
  lastResults: null,
  workingDirectory: null
};

/**
 * Initialize the codebase analysis subsystem
 * 
 * @param config Configuration options for the codebase analysis
 * @returns The initialized codebase analysis system
 */
export function initCodebaseAnalysis
```

## Usage Examples

```typescript
import { /* exports */ } from './index.ts';
```

