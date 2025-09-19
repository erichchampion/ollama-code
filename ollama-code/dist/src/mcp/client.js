/**
 * Model Context Protocol (MCP) Client
 *
 * Connects to external MCP servers to use their tools and resources
 * as part of the ollama-code workflow
 */
import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';
export class MCPClient {
    connections = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize all configured MCP connections
     */
    async initialize() {
        if (!this.config.enabled) {
            logger.debug('MCP client is disabled');
            return;
        }
        logger.info('Initializing MCP client connections...');
        const connectionPromises = this.config.connections
            .filter(conn => conn.enabled)
            .map(conn => this.connectToServer(conn));
        const results = await Promise.allSettled(connectionPromises);
        let successCount = 0;
        let failureCount = 0;
        results.forEach((result, index) => {
            const connectionConfig = this.config.connections[index];
            if (result.status === 'fulfilled') {
                successCount++;
                logger.info(`Successfully connected to MCP server: ${connectionConfig.name}`);
            }
            else {
                failureCount++;
                logger.error(`Failed to connect to MCP server ${connectionConfig.name}:`, result.reason);
            }
        });
        logger.info(`MCP client initialized: ${successCount} successful, ${failureCount} failed connections`);
    }
    /**
     * Connect to a single MCP server
     */
    async connectToServer(config) {
        try {
            const connection = new MCPClientConnection(config, this.config);
            await connection.connect();
            this.connections.set(config.name, connection);
        }
        catch (error) {
            logger.error(`Failed to connect to MCP server ${config.name}:`, error);
            throw error;
        }
    }
    /**
     * Get all available tools from all connections
     */
    getAvailableTools() {
        const tools = [];
        for (const connection of this.connections.values()) {
            tools.push(...connection.getTools());
        }
        return tools;
    }
    /**
     * Get all available resources from all connections
     */
    getAvailableResources() {
        const resources = [];
        for (const connection of this.connections.values()) {
            resources.push(...connection.getResources());
        }
        return resources;
    }
    /**
     * Call a tool on the appropriate MCP server
     */
    async callTool(toolName, args) {
        for (const connection of this.connections.values()) {
            const tools = connection.getTools();
            if (tools.some(tool => tool.name === toolName)) {
                return await connection.callTool(toolName, args);
            }
        }
        throw new Error(`Tool '${toolName}' not found in any connected MCP server`);
    }
    /**
     * Get a resource from the appropriate MCP server
     */
    async getResource(uri) {
        for (const connection of this.connections.values()) {
            const resources = connection.getResources();
            if (resources.some(resource => resource.uri === uri)) {
                return await connection.getResource(uri);
            }
        }
        throw new Error(`Resource '${uri}' not found in any connected MCP server`);
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return Array.from(this.connections.entries()).map(([name, connection]) => ({
            name,
            connected: connection.isConnected(),
            toolCount: connection.getTools().length,
            resourceCount: connection.getResources().length
        }));
    }
    /**
     * Reconnect to a specific server
     */
    async reconnect(serverName) {
        const connection = this.connections.get(serverName);
        if (!connection) {
            throw new Error(`Connection '${serverName}' not found`);
        }
        await connection.reconnect();
    }
    /**
     * Disconnect from all servers
     */
    async disconnect() {
        const disconnectPromises = Array.from(this.connections.values()).map(conn => conn.disconnect());
        await Promise.allSettled(disconnectPromises);
        this.connections.clear();
        logger.info('MCP client disconnected from all servers');
    }
    /**
     * Dispose of the client and clean up resources
     */
    async dispose() {
        await this.disconnect();
    }
}
/**
 * Individual MCP server connection
 */
class MCPClientConnection {
    config;
    globalConfig;
    process = null;
    connected = false;
    tools = [];
    resources = [];
    capabilities = {};
    messageId = 0;
    pendingRequests = new Map();
    constructor(config, globalConfig) {
        this.config = config;
        this.globalConfig = globalConfig;
    }
    /**
     * Connect to the MCP server
     */
    async connect() {
        if (this.connected) {
            return;
        }
        try {
            // Spawn the MCP server process
            this.process = spawn(this.config.command, this.config.args, {
                cwd: this.config.cwd || process.cwd(),
                env: { ...process.env, ...this.config.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });
            // Setup process event handlers
            this.setupProcessHandlers();
            // Wait for connection to be established
            await this.waitForConnection();
            // Initialize the connection
            await this.initialize();
            this.connected = true;
            logger.debug(`Connected to MCP server: ${this.config.name}`);
        }
        catch (error) {
            await this.cleanup();
            throw error;
        }
    }
    /**
     * Setup process event handlers
     */
    setupProcessHandlers() {
        if (!this.process)
            return;
        this.process.on('error', (error) => {
            logger.error(`MCP server process error (${this.config.name}):`, error);
            this.connected = false;
        });
        this.process.on('exit', (code, signal) => {
            logger.warn(`MCP server process exited (${this.config.name}): code=${code}, signal=${signal}`);
            this.connected = false;
        });
        this.process.stdout?.on('data', (data) => {
            this.handleMessage(data.toString());
        });
        this.process.stderr?.on('data', (data) => {
            if (this.globalConfig.logging.enabled) {
                logger.debug(`MCP server stderr (${this.config.name}):`, data.toString());
            }
        });
    }
    /**
     * Handle incoming messages from the MCP server
     */
    handleMessage(data) {
        try {
            const lines = data.trim().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    const message = JSON.parse(line);
                    this.processMessage(message);
                }
            }
        }
        catch (error) {
            logger.error(`Error parsing MCP message from ${this.config.name}:`, error);
        }
    }
    /**
     * Process a parsed message
     */
    processMessage(message) {
        if (message.id && this.pendingRequests.has(message.id)) {
            const request = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            if (message.error) {
                request.reject(new Error(message.error.message || 'MCP request failed'));
            }
            else {
                request.resolve(message.result);
            }
        }
    }
    /**
     * Send a request to the MCP server
     */
    async sendRequest(method, params) {
        if (!this.process || !this.connected) {
            throw new Error(`Not connected to MCP server: ${this.config.name}`);
        }
        const id = ++this.messageId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request timeout for ${method} on ${this.config.name}`));
            }, this.config.timeout);
            this.pendingRequests.set(id, {
                resolve: (value) => {
                    clearTimeout(timeout);
                    resolve(value);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
            this.process.stdin.write(JSON.stringify(request) + '\n');
        });
    }
    /**
     * Wait for connection to be established
     */
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Connection timeout for MCP server: ${this.config.name}`));
            }, this.config.timeout);
            const checkConnection = () => {
                if (this.process && this.process.stdout?.readable) {
                    clearTimeout(timeout);
                    resolve();
                }
                else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }
    /**
     * Initialize the MCP connection
     */
    async initialize() {
        try {
            // Get server capabilities
            const capabilities = await this.sendRequest('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                    resources: {}
                },
                clientInfo: {
                    name: 'ollama-code',
                    version: '1.0.0'
                }
            });
            this.capabilities = capabilities.capabilities || {};
            // List available tools
            if (this.capabilities.tools) {
                const toolsResult = await this.sendRequest('tools/list');
                this.tools = toolsResult.tools || [];
            }
            // List available resources
            if (this.capabilities.resources) {
                const resourcesResult = await this.sendRequest('resources/list');
                this.resources = resourcesResult.resources || [];
            }
        }
        catch (error) {
            logger.error(`Failed to initialize MCP connection ${this.config.name}:`, error);
            throw error;
        }
    }
    /**
     * Call a tool on this MCP server
     */
    async callTool(name, arguments_) {
        const result = await this.sendRequest('tools/call', {
            name,
            arguments: arguments_
        });
        return result;
    }
    /**
     * Get a resource from this MCP server
     */
    async getResource(uri) {
        const result = await this.sendRequest('resources/read', {
            uri
        });
        return result;
    }
    /**
     * Get available tools
     */
    getTools() {
        return [...this.tools];
    }
    /**
     * Get available resources
     */
    getResources() {
        return [...this.resources];
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.process !== null && !this.process.killed;
    }
    /**
     * Reconnect to the server
     */
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }
    /**
     * Disconnect from the server
     */
    async disconnect() {
        this.connected = false;
        await this.cleanup();
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.process) {
            if (!this.process.killed) {
                this.process.kill();
            }
            this.process = null;
        }
        // Reject all pending requests
        for (const request of this.pendingRequests.values()) {
            request.reject(new Error('Connection closed'));
        }
        this.pendingRequests.clear();
        this.tools = [];
        this.resources = [];
        this.capabilities = {};
    }
}
/**
 * Create MCP client from configuration
 */
export function createMCPClient(config) {
    return new MCPClient(config);
}
//# sourceMappingURL=client.js.map