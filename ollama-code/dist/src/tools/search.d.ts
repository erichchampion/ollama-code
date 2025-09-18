/**
 * Search Tool
 *
 * Provides advanced search capabilities for text content, file names,
 * and project-wide searches with relevance ranking.
 */
import { BaseTool, ToolMetadata, ToolResult, ToolExecutionContext } from './types.js';
export declare class SearchTool extends BaseTool {
    metadata: ToolMetadata;
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    private performSearch;
    private searchFileContent;
    private isPathSafe;
}
