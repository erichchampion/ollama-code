/**
 * Model Context Protocol (MCP) Client
 *
 * Connects to external MCP servers to use their tools and resources
 * as part of the ollama-code workflow
 */
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface MCPResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface MCPConnection {
    name: string;
    tools: MCPTool[];
    resources: MCPResource[];
    capabilities: {
        tools?: {
            listChanged?: boolean;
        };
        resources?: {
            subscribe?: boolean;
            listChanged?: boolean;
        };
        prompts?: {
            listChanged?: boolean;
        };
        logging?: {};
    };
}
export interface MCPToolCallResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        resource?: string;
    }>;
    isError?: boolean;
}
export interface MCPResourceResult {
    contents: Array<{
        uri: string;
        mimeType?: string;
        text?: string;
    }>;
}
export declare class MCPClient {
    private connections;
    private config;
    constructor(config: any);
    /**
     * Initialize all configured MCP connections
     */
    initialize(): Promise<void>;
    /**
     * Connect to a single MCP server
     */
    private connectToServer;
    /**
     * Get all available tools from all connections
     */
    getAvailableTools(): MCPTool[];
    /**
     * Get all available resources from all connections
     */
    getAvailableResources(): MCPResource[];
    /**
     * Call a tool on the appropriate MCP server
     */
    callTool(toolName: string, args: Record<string, any>): Promise<MCPToolCallResult>;
    /**
     * Get a resource from the appropriate MCP server
     */
    getResource(uri: string): Promise<MCPResourceResult>;
    /**
     * Get connection status
     */
    getConnectionStatus(): Array<{
        name: string;
        connected: boolean;
        toolCount: number;
        resourceCount: number;
    }>;
    /**
     * Reconnect to a specific server
     */
    reconnect(serverName: string): Promise<void>;
    /**
     * Disconnect from all servers
     */
    disconnect(): Promise<void>;
    /**
     * Dispose of the client and clean up resources
     */
    dispose(): Promise<void>;
}
/**
 * Create MCP client from configuration
 */
export declare function createMCPClient(config: any): MCPClient;
