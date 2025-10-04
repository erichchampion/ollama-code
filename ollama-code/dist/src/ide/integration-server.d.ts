/**
 * IDE Integration Server
 *
 * WebSocket-based server for IDE extensions to communicate with ollama-code CLI.
 * Provides real-time AI assistance, code analysis, and project intelligence.
 */
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
export interface IDERequest {
    id: string;
    type: 'ai_request' | 'command' | 'context_update' | 'workspace_analysis';
    payload: any;
    timestamp: number;
}
export interface IDEResponse {
    id: string;
    type: 'success' | 'error' | 'progress' | 'stream';
    payload: any;
    timestamp: number;
}
export interface WorkspaceContext {
    rootPath: string;
    activeFile?: string;
    selection?: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
    cursorPosition?: {
        line: number;
        character: number;
    };
    openFiles: string[];
    gitBranch?: string;
    projectType?: string;
}
export interface AIRequest {
    prompt: string;
    context?: WorkspaceContext;
    type: 'completion' | 'explanation' | 'refactor' | 'fix' | 'generate';
    language?: string;
    includeDependencies?: boolean;
}
export interface ExtensionClient {
    id: string;
    ws: WebSocket;
    context?: WorkspaceContext;
    lastActivity: number;
    authenticated: boolean;
}
export declare class IDEIntegrationServer extends EventEmitter {
    private server;
    private wss;
    private clients;
    private mcpServer;
    private isRunning;
    private port;
    private heartbeatInterval;
    private startTime;
    constructor(port?: number);
    /**
     * Start the IDE integration server
     */
    start(): Promise<void>;
    /**
     * Stop the IDE integration server
     */
    stop(): Promise<void>;
    /**
     * Setup WebSocket connection handlers
     */
    private setupWebSocketHandlers;
    /**
     * Handle incoming request from IDE extension
     */
    private handleRequest;
    /**
     * Handle AI assistance requests (completions, explanations, etc.)
     */
    private handleAIRequest;
    /**
     * Handle direct command execution requests
     */
    private handleCommandRequest;
    /**
     * Handle workspace context updates from IDE
     */
    private handleContextUpdate;
    /**
     * Handle workspace analysis requests
     */
    private handleWorkspaceAnalysis;
    /**
     * Send response to client
     */
    private sendResponse;
    /**
     * Send error response to client
     */
    private sendError;
    /**
     * Send progress update to client
     */
    private sendProgress;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: IDEResponse): void;
    /**
     * Get server capabilities
     */
    private getServerCapabilities;
    /**
     * Start heartbeat monitoring
     */
    private startHeartbeat;
    /**
     * Get connected clients info
     */
    getConnectedClients(): Array<{
        id: string;
        lastActivity: number;
        authenticated: boolean;
    }>;
    /**
     * Get server status
     */
    getStatus(): {
        isRunning: boolean;
        port: number;
        clientCount: number;
        uptime?: number;
    };
    /**
     * Clean up partially started services
     */
    private cleanup;
    /**
     * Dispose of the server and clean up resources
     */
    dispose(): Promise<void>;
}
/**
 * Get or create IDE integration server instance
 */
export declare function getIDEIntegrationServer(port?: number): IDEIntegrationServer;
/**
 * Start IDE integration server as a service
 */
export declare function startIDEIntegrationService(port?: number): Promise<IDEIntegrationServer>;
/**
 * Stop IDE integration server service
 */
export declare function stopIDEIntegrationService(): Promise<void>;
