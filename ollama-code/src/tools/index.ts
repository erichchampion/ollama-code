/**
 * Tools Module
 *
 * Main entry point for the tool system that provides sophisticated
 * multi-tool orchestration capabilities for coding tasks.
 */

export * from './types.js';
export { ToolRegistry, toolRegistry } from './registry.js';
export * from './orchestrator.js';

// Tool implementations
export * from './filesystem.js';
export * from './search.js';
export * from './execution.js';

import { toolRegistry } from './registry.js';
import { FileSystemTool } from './filesystem.js';
import { SearchTool } from './search.js';
import { ExecutionTool } from './execution.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize the tool system by registering all available tools
 */
export function initializeToolSystem(): void {
  try {
    // Register core tools
    toolRegistry.register(new FileSystemTool());
    toolRegistry.register(new SearchTool());
    toolRegistry.register(new ExecutionTool());

    logger.info('Tool system initialized successfully');
    logger.debug(`Registered ${toolRegistry.list().length} tools`);

  } catch (error) {
    logger.error(`Failed to initialize tool system: ${error}`);
    throw error;
  }
}

/**
 * Get information about all available tools
 */
export function getAvailableTools() {
  return toolRegistry.list().map(metadata => ({
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    version: metadata.version,
    parametersCount: metadata.parameters.length,
    hasExamples: metadata.examples.length > 0
  }));
}

/**
 * Create a default tool execution context
 */
export function createDefaultContext(options: {
  projectRoot?: string;
  workingDirectory?: string;
  timeout?: number;
} = {}): import('./types.js').ToolExecutionContext {
  return {
    projectRoot: options.projectRoot || process.cwd(),
    workingDirectory: options.workingDirectory || process.cwd(),
    environment: process.env as Record<string, string>,
    timeout: options.timeout || 30000
  };
}