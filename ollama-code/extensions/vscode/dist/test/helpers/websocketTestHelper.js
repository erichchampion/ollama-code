"use strict";
/**
 * WebSocket Test Helpers
 * Utilities for testing WebSocket server functionality
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestWebSocketClient = createTestWebSocketClient;
exports.createMockMCPServer = createMockMCPServer;
exports.waitForConnection = waitForConnection;
exports.assertConnected = assertConnected;
exports.assertDisconnected = assertDisconnected;
exports.sendAndWaitForResponse = sendAndWaitForResponse;
exports.testHeartbeat = testHeartbeat;
const ws_1 = __importDefault(require("ws"));
const test_constants_js_1 = require("./test-constants.js");
const test_utils_js_1 = require("./test-utils.js");
/**
 * Create a test WebSocket client
 */
function createTestWebSocketClient(url, options = {}) {
    const messages = [];
    const errors = [];
    let ws;
    return {
        get ws() {
            return ws;
        },
        get isConnected() {
            return ws && ws.readyState === ws_1.default.OPEN;
        },
        messages,
        errors,
        async connect() {
            return new Promise((resolve, reject) => {
                const headers = { ...options.headers };
                // Add authentication token if provided
                if (options.authToken) {
                    headers['Authorization'] = `Bearer ${options.authToken}`;
                }
                ws = new ws_1.default(url, { headers });
                const timeout = options.timeout || test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.CONNECTION_TIMEOUT;
                const timer = setTimeout(() => {
                    if (ws.readyState !== ws_1.default.OPEN) {
                        ws.terminate();
                        reject(new Error('Connection timeout'));
                    }
                }, timeout);
                ws.on('open', () => {
                    clearTimeout(timer);
                    resolve();
                });
                ws.on('message', (data) => {
                    try {
                        const parsed = JSON.parse(data.toString());
                        messages.push(parsed);
                    }
                    catch (error) {
                        messages.push(data.toString());
                    }
                });
                ws.on('error', (error) => {
                    errors.push(error);
                    // Only reject if connection hasn't been established yet
                    if (ws.readyState !== ws_1.default.OPEN) {
                        clearTimeout(timer);
                        reject(error);
                    }
                });
            });
        },
        async disconnect() {
            return new Promise((resolve) => {
                if (ws && ws.readyState === ws_1.default.OPEN) {
                    ws.once('close', () => {
                        resolve();
                    });
                    ws.close();
                }
                else {
                    resolve();
                }
            });
        },
        async send(data) {
            return new Promise((resolve, reject) => {
                if (!ws || ws.readyState !== ws_1.default.OPEN) {
                    reject(new Error('WebSocket is not connected'));
                    return;
                }
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                ws.send(message, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        },
        async waitForMessage(timeout = test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.MESSAGE_TIMEOUT) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                if (messages.length > 0) {
                    return messages.shift();
                }
                await (0, test_utils_js_1.sleep)(test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.MESSAGE_POLL_INTERVAL);
            }
            throw new Error('Timeout waiting for WebSocket message');
        },
        clearMessages() {
            messages.length = 0;
            errors.length = 0;
        }
    };
}
function createMockMCPServer() {
    let wss = null;
    const clients = new Set();
    const receivedMessages = [];
    let rejectedConnections = 0;
    let serverOptions = {};
    const heartbeatTimers = new Map();
    const registeredTools = [];
    let initialized = false;
    let currentPort = 0;
    /**
     * Handle MCP protocol messages
     */
    async function handleMCPMessage(ws, parsed, options) {
        if (parsed.method === 'initialize') {
            // Simulate MCP initialization
            if (options.mcpInitDelay) {
                await (0, test_utils_js_1.sleep)(options.mcpInitDelay);
            }
            initialized = true;
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id: parsed.id,
                result: {
                    protocolVersion: test_constants_js_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {
                        tools: {},
                        prompts: {}
                    },
                    serverInfo: {
                        name: test_constants_js_1.MCP_TEST_CONSTANTS.SERVER_NAME,
                        version: test_constants_js_1.MCP_TEST_CONSTANTS.SERVER_VERSION
                    }
                }
            }));
        }
        else if (parsed.method === 'tools/list') {
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id: parsed.id,
                result: {
                    tools: registeredTools.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    }))
                }
            }));
        }
        else if (parsed.method === 'tools/call') {
            const toolName = parsed.params?.name;
            const tool = registeredTools.find(t => t.name === toolName);
            if (tool && tool.handler) {
                try {
                    const result = await tool.handler(parsed.params?.arguments);
                    ws.send(JSON.stringify({
                        jsonrpc: '2.0',
                        id: parsed.id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: typeof result === 'string' ? result : JSON.stringify(result)
                                }
                            ]
                        }
                    }));
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    ws.send(JSON.stringify({
                        jsonrpc: '2.0',
                        id: parsed.id,
                        error: {
                            code: test_constants_js_1.JSONRPC_ERROR_CODES.INTERNAL_ERROR,
                            message: errorMessage
                        }
                    }));
                }
            }
            else {
                ws.send(JSON.stringify({
                    jsonrpc: '2.0',
                    id: parsed.id,
                    error: {
                        code: test_constants_js_1.JSONRPC_ERROR_CODES.METHOD_NOT_FOUND,
                        message: `Tool not found: ${toolName}`
                    }
                }));
            }
        }
    }
    return {
        async start(port, options = {}) {
            serverOptions = options;
            currentPort = port;
            return new Promise((resolve, reject) => {
                try {
                    wss = new ws_1.default.Server({
                        port,
                        verifyClient: (info, callback) => {
                            // Check authentication if required
                            if (options.requireAuth) {
                                const authHeader = info.req.headers['authorization'];
                                const expectedToken = `Bearer ${options.validAuthToken || test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.AUTH.VALID_TOKEN}`;
                                if (authHeader !== expectedToken) {
                                    rejectedConnections++;
                                    callback(false, 401, 'Unauthorized');
                                    return;
                                }
                            }
                            // Check connection limit
                            if (options.maxConnections && clients.size >= options.maxConnections) {
                                rejectedConnections++;
                                callback(false, 503, 'Connection limit reached');
                                return;
                            }
                            callback(true);
                        }
                    });
                    wss.on('connection', (ws) => {
                        clients.add(ws);
                        // Start heartbeat if enabled
                        if (options.enableHeartbeat) {
                            const interval = options.heartbeatInterval ||
                                test_constants_js_1.MCP_TEST_CONSTANTS.DEFAULT_HEARTBEAT_INTERVAL;
                            const timer = setInterval(() => {
                                if (ws.readyState === ws_1.default.OPEN) {
                                    ws.ping();
                                }
                            }, interval);
                            heartbeatTimers.set(ws, timer);
                            ws.on('pong', () => {
                                // Client is alive
                            });
                        }
                        ws.on('message', async (data) => {
                            // Try to parse as JSON
                            let parsed;
                            try {
                                parsed = JSON.parse(data.toString());
                                receivedMessages.push(parsed);
                            }
                            catch (parseError) {
                                // Not JSON - store as string
                                receivedMessages.push(data.toString());
                                return;
                            }
                            // Auto-respond to ping messages
                            if (parsed.type === 'ping') {
                                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                            }
                            // Handle MCP protocol messages if enabled
                            if (options.enableMCP && parsed.method) {
                                try {
                                    await handleMCPMessage(ws, parsed, options);
                                }
                                catch (mcpError) {
                                    // Log MCP handling errors but don't crash
                                    console.error('[Mock MCP Server] Handler error:', mcpError);
                                }
                            }
                        });
                        ws.on('close', () => {
                            clients.delete(ws);
                            const timer = heartbeatTimers.get(ws);
                            if (timer) {
                                clearInterval(timer);
                                heartbeatTimers.delete(ws);
                            }
                        });
                        ws.on('error', (error) => {
                            console.error('WebSocket client error:', error);
                        });
                    });
                    wss.on('listening', () => {
                        resolve();
                    });
                    wss.on('error', (error) => {
                        reject(error);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        },
        async stop() {
            return new Promise((resolve) => {
                if (wss) {
                    // Clear all heartbeat timers
                    heartbeatTimers.forEach(timer => clearInterval(timer));
                    heartbeatTimers.clear();
                    // Close all client connections
                    clients.forEach(client => {
                        if (client.readyState === ws_1.default.OPEN) {
                            client.close();
                        }
                    });
                    wss.close(() => {
                        wss = null;
                        clients.clear();
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        },
        getConnectedClients() {
            return clients.size;
        },
        broadcastMessage(data) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            clients.forEach(client => {
                if (client.readyState === ws_1.default.OPEN) {
                    client.send(message);
                }
            });
        },
        getReceivedMessages() {
            return [...receivedMessages];
        },
        getRejectedConnections() {
            return rejectedConnections;
        },
        clearMessages() {
            receivedMessages.length = 0;
            rejectedConnections = 0;
        },
        registerTool(tool) {
            // Validate required fields
            if (!tool.name || !tool.description || !tool.inputSchema) {
                throw new Error('Tool missing required fields (name, description, inputSchema)');
            }
            // Validate name is not empty string
            if (tool.name.trim().length === 0) {
                throw new Error('Tool name cannot be empty');
            }
            // Check for duplicate tool names
            if (registeredTools.some(t => t.name === tool.name)) {
                throw new Error(`Tool '${tool.name}' is already registered`);
            }
            registeredTools.push(tool);
        },
        getRegisteredTools() {
            return [...registeredTools];
        },
        isInitialized() {
            return initialized;
        },
        async simulateRestart() {
            // Simulate server restart
            initialized = false;
            await (0, test_utils_js_1.sleep)(100);
            // Re-initialize if clients are connected
            if (clients.size > 0 && serverOptions.enableMCP) {
                await (0, test_utils_js_1.sleep)(serverOptions.mcpInitDelay || 0);
                initialized = true;
            }
        }
    };
}
/**
 * Wait for WebSocket connection
 */
async function waitForConnection(ws, timeout = test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.CONNECTION_TIMEOUT) {
    return new Promise((resolve, reject) => {
        if (ws.readyState === ws_1.default.OPEN) {
            resolve();
            return;
        }
        const timer = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
        }, timeout);
        ws.once('open', () => {
            clearTimeout(timer);
            resolve();
        });
        ws.once('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
// sleep is now imported from shared utilities
/**
 * Assert WebSocket is connected
 */
function assertConnected(ws) {
    if (!ws || ws.readyState !== ws_1.default.OPEN) {
        throw new Error('WebSocket is not connected');
    }
}
/**
 * Assert WebSocket is disconnected
 */
function assertDisconnected(ws) {
    if (ws && ws.readyState === ws_1.default.OPEN) {
        throw new Error('WebSocket is still connected');
    }
}
/**
 * Send and wait for response
 */
async function sendAndWaitForResponse(client, request, timeout = test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.MESSAGE_TIMEOUT) {
    client.clearMessages();
    await client.send(request);
    return await client.waitForMessage(timeout);
}
/**
 * Test connection heartbeat
 */
async function testHeartbeat(client, interval = test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.HEARTBEAT_INTERVAL, count = test_constants_js_1.WEBSOCKET_TEST_CONSTANTS.HEARTBEAT_COUNT) {
    for (let i = 0; i < count; i++) {
        await client.send({ type: 'ping' });
        await (0, test_utils_js_1.sleep)(interval);
    }
    return client.errors.length === 0;
}
//# sourceMappingURL=websocketTestHelper.js.map