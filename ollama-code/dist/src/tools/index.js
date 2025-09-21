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
export * from './advanced-git-tool.js';
export * from './advanced-code-analysis-tool.js';
export * from './advanced-testing-tool.js';
import { toolRegistry } from './registry.js';
import { FileSystemTool } from './filesystem.js';
import { SearchTool } from './search.js';
import { ExecutionTool } from './execution.js';
import { AdvancedGitTool } from './advanced-git-tool.js';
import { AdvancedCodeAnalysisTool } from './advanced-code-analysis-tool.js';
import { AdvancedTestingTool } from './advanced-testing-tool.js';
import { logger } from '../utils/logger.js';
/**
 * Initialize the tool system by registering all available tools
 */
export function initializeToolSystem() {
    try {
        // Register core tools
        toolRegistry.register(new FileSystemTool());
        toolRegistry.register(new SearchTool());
        toolRegistry.register(new ExecutionTool());
        // Register advanced tools for Phase 7
        toolRegistry.register(new AdvancedGitTool());
        toolRegistry.register(new AdvancedCodeAnalysisTool());
        toolRegistry.register(new AdvancedTestingTool());
        logger.info('Tool system initialized successfully');
        logger.debug(`Registered ${toolRegistry.list().length} tools`);
    }
    catch (error) {
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
export function createDefaultContext(options = {}) {
    return {
        projectRoot: options.projectRoot || process.cwd(),
        workingDirectory: options.workingDirectory || process.cwd(),
        environment: process.env,
        timeout: options.timeout || 30000
    };
}
//# sourceMappingURL=index.js.map