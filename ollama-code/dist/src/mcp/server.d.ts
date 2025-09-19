/**
 * Model Context Protocol (MCP) Server Integration
 *
 * Implements MCP server functionality to expose ollama-code capabilities
 * as tools and resources that can be used by other MCP clients:
 * - Tool exposure for code generation, analysis, and refactoring
 * - Resource exposure for project files and documentation
 * - Real-time notifications for file changes
 * - Secure authentication and permission management
 */
interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
interface MCPResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
interface MCPToolCall {
    name: string;
    arguments: Record<string, any>;
}
interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        resource?: string;
    }>;
    isError?: boolean;
}
interface MCPNotification {
    method: string;
    params?: any;
}
export declare class MCPServer {
    private tools;
    private resources;
    private clients;
    private isRunning;
    private resourceMonitoringInterval;
    private serverInfo;
    constructor();
    /**
     * Start the MCP server
     */
    start(port?: number): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    /**
     * Handle tool call request
     */
    handleToolCall(toolCall: MCPToolCall): Promise<MCPToolResult>;
    /**
     * Handle resource request
     */
    handleResourceRequest(uri: string): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text?: string;
        }>;
    }>;
    /**
     * List available tools
     */
    listTools(): {
        tools: MCPTool[];
    };
    /**
     * List available resources
     */
    listResources(): {
        resources: MCPResource[];
    };
    /**
     * Get server capabilities
     */
    getCapabilities(): {
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
    /**
     * Send notification to all clients
     */
    sendNotification(notification: MCPNotification): Promise<void>;
    /**
     * Register a new MCP client
     */
    registerClient(client: MCPClient): void;
    /**
     * Unregister MCP client
     */
    unregisterClient(client: MCPClient): void;
    /**
     * Execute a tool by name
     */
    private executeTool;
    /**
     * Get resource content by URI
     */
    private getResourceContent;
    /**
     * Register core tools
     */
    private registerCoreTools;
    /**
     * Register core resources
     */
    private registerCoreResources;
    /**
     * Start monitoring resources for changes
     */
    private startResourceMonitoring;
    private analyzeCode;
    private generateCode;
    private refactorCode;
    private explainCode;
    private fixCode;
    private searchCodebase;
    private getGitStatus;
    private runTests;
    private getProjectInfo;
    private getConfigInfo;
    /**
     * Dispose of the MCP server and clean up resources
     */
    dispose(): Promise<void>;
}
/**
 * MCP Client interface
 */
export interface MCPClient {
    id: string;
    notify(notification: MCPNotification): Promise<void>;
}
/**
 * Create and configure MCP server
 */
export declare function createMCPServer(): MCPServer;
export {};
