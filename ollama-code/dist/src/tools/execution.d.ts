/**
 * Execution Tool
 *
 * Provides secure command execution capabilities with timeout handling,
 * output capture, and environment management.
 */
import { BaseTool, ToolMetadata, ToolResult, ToolExecutionContext } from './types.js';
export declare class ExecutionTool extends BaseTool {
    metadata: ToolMetadata;
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    private executeCommand;
    private isCommandSafe;
    private resolvePath;
    private isPathSafe;
}
