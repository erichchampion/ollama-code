/**
 * Tool Registry
 *
 * Manages registration, discovery, and retrieval of tools in the system.
 */
import { BaseTool, ToolMetadata, ToolRegistry as IToolRegistry } from './types.js';
export declare class ToolRegistry implements IToolRegistry {
    private tools;
    register(tool: BaseTool): void;
    unregister(name: string): void;
    get(name: string): BaseTool | undefined;
    list(): ToolMetadata[];
    getByCategory(category: string): BaseTool[];
    search(query: string): BaseTool[];
    private validateToolMetadata;
    private calculateSearchScore;
}
export declare const toolRegistry: ToolRegistry;
