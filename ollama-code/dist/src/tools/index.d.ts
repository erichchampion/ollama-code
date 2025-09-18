/**
 * Tools Module
 *
 * Main entry point for the tool system that provides sophisticated
 * multi-tool orchestration capabilities for coding tasks.
 */
export * from './types.js';
export { ToolRegistry, toolRegistry } from './registry.js';
export * from './orchestrator.js';
export * from './filesystem.js';
export * from './search.js';
export * from './execution.js';
/**
 * Initialize the tool system by registering all available tools
 */
export declare function initializeToolSystem(): void;
/**
 * Get information about all available tools
 */
export declare function getAvailableTools(): {
    name: string;
    description: string;
    category: string;
    version: string;
    parametersCount: number;
    hasExamples: boolean;
}[];
/**
 * Create a default tool execution context
 */
export declare function createDefaultContext(options?: {
    projectRoot?: string;
    workingDirectory?: string;
    timeout?: number;
}): import('./types.js').ToolExecutionContext;
