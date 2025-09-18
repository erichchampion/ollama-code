/**
 * File System Tool
 *
 * Provides comprehensive file system operations with enhanced capabilities
 * for reading, writing, searching, and managing files and directories.
 */
import { BaseTool, ToolMetadata, ToolResult, ToolExecutionContext } from './types.js';
export declare class FileSystemTool extends BaseTool {
    metadata: ToolMetadata;
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    private readFile;
    private writeFile;
    private listDirectory;
    private createPath;
    private deletePath;
    private searchFiles;
    private pathExists;
    private isPathSafe;
}
