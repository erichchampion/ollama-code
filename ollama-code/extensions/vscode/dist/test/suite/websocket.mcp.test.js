"use strict";
/**
 * WebSocket MCP Server Integration Tests
 * Tests for Model Context Protocol (MCP) server integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const websocketTestHelper_1 = require("../helpers/websocketTestHelper");
const test_constants_1 = require("../helpers/test-constants");
const test_utils_1 = require("../helpers/test-utils");
suite('WebSocket MCP Server Integration Tests', () => {
    const TEST_PORT = test_constants_1.WEBSOCKET_TEST_CONSTANTS.PORTS.MCP_TESTS;
    const WS_URL = `ws://localhost:${TEST_PORT}`;
    let mockServer;
    let testClient;
    setup(async function () {
        this.timeout(10000);
        mockServer = (0, websocketTestHelper_1.createMockMCPServer)();
    });
    teardown(async function () {
        this.timeout(5000);
        if (testClient) {
            await testClient.disconnect();
        }
        if (mockServer) {
            await mockServer.stop();
        }
    });
    suite('MCP Server Initialization', () => {
        test('Should initialize MCP server successfully', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Send MCP initialize request
            const initRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: {
                        name: 'test-client',
                        version: '1.0.0'
                    }
                }
            };
            testClient.clearMessages();
            await testClient.send(initRequest);
            // Wait for init response
            const response = await testClient.waitForMessage(2000);
            assert.strictEqual(response.jsonrpc, '2.0', 'Should use JSON-RPC 2.0');
            assert.strictEqual(response.id, 1, 'Should match request ID');
            assert.ok(response.result, 'Should have result object');
            assert.strictEqual(response.result.protocolVersion, '2024-11-05', 'Should report protocol version');
            assert.ok(response.result.capabilities, 'Should report server capabilities');
            assert.strictEqual(response.result.serverInfo.name, 'mock-mcp-server', 'Should report server name');
            assert.strictEqual(mockServer.isInitialized(), true, 'Server should be initialized');
        });
        test('Should handle initialization with delay', async function () {
            this.timeout(8000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true,
                mcpInitDelay: 1000 // 1 second delay
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            const initRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test-client', version: '1.0.0' }
                }
            };
            const startTime = Date.now();
            testClient.clearMessages();
            await testClient.send(initRequest);
            const response = await testClient.waitForMessage(3000);
            const elapsed = Date.now() - startTime;
            assert.ok(elapsed >= 1000, `Init should take at least 1 second (actual: ${elapsed}ms)`);
            assert.ok(response.result, 'Should receive initialization result');
        });
    });
    suite('Tool Registration', () => {
        test('Should register tools with MCP server', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            // Register tools before connecting client
            mockServer.registerTool({
                name: 'analyze_code',
                description: 'Analyzes code for issues',
                inputSchema: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        language: { type: 'string' }
                    },
                    required: ['code']
                }
            });
            mockServer.registerTool({
                name: 'refactor_code',
                description: 'Refactors code to improve quality',
                inputSchema: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        target: { type: 'string' }
                    },
                    required: ['code']
                }
            });
            const tools = mockServer.getRegisteredTools();
            assert.strictEqual(tools.length, 2, 'Should have 2 registered tools');
            assert.strictEqual(tools[0].name, 'analyze_code', 'First tool should be analyze_code');
            assert.strictEqual(tools[1].name, 'refactor_code', 'Second tool should be refactor_code');
        });
        test('Should list registered tools via MCP protocol', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            mockServer.registerTool({
                name: 'test_tool',
                description: 'A test tool',
                inputSchema: {
                    type: 'object',
                    properties: {
                        input: { type: 'string' }
                    }
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize first
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // List tools
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list'
            });
            const response = await testClient.waitForMessage(1000);
            assert.strictEqual(response.id, 2, 'Should match request ID');
            assert.ok(response.result, 'Should have result');
            assert.ok(response.result.tools, 'Result should have tools array');
            assert.strictEqual(response.result.tools.length, 1, 'Should list 1 tool');
            assert.strictEqual(response.result.tools[0].name, 'test_tool', 'Tool name should match');
        });
    });
    suite('Tool Execution', () => {
        test('Should execute tool through MCP protocol', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            // Register tool with handler
            mockServer.registerTool({
                name: 'echo',
                description: 'Echoes input',
                inputSchema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    },
                    required: ['message']
                },
                handler: async (input) => {
                    return `Echo: ${input.message}`;
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Call tool
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 3,
                method: 'tools/call',
                params: {
                    name: 'echo',
                    arguments: {
                        message: 'Hello MCP!'
                    }
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.strictEqual(response.id, 3, 'Should match request ID');
            assert.ok(response.result, 'Should have result');
            assert.ok(response.result.content, 'Result should have content');
            assert.strictEqual(response.result.content[0].type, 'text');
            assert.strictEqual(response.result.content[0].text, 'Echo: Hello MCP!');
        });
        test('Should handle tool execution with complex input', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            mockServer.registerTool({
                name: 'calculator',
                description: 'Performs calculations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        operation: { type: 'string' },
                        numbers: { type: 'array' }
                    }
                },
                handler: async (input) => {
                    const { operation, numbers } = input;
                    if (operation === 'sum') {
                        return { result: numbers.reduce((a, b) => a + b, 0) };
                    }
                    return { result: 0 };
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Call calculator tool
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 4,
                method: 'tools/call',
                params: {
                    name: 'calculator',
                    arguments: {
                        operation: 'sum',
                        numbers: [1, 2, 3, 4, 5]
                    }
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.ok(response.result, 'Should have result');
            const resultContent = JSON.parse(response.result.content[0].text);
            assert.strictEqual(resultContent.result, 15, 'Should calculate sum correctly');
        });
        test('Should handle tool not found error', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Call non-existent tool
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 5,
                method: 'tools/call',
                params: {
                    name: 'nonexistent_tool',
                    arguments: {}
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.ok(response.error, 'Should have error object');
            assert.strictEqual(response.error.code, test_constants_1.JSONRPC_ERROR_CODES.METHOD_NOT_FOUND, 'Should be method not found error');
            assert.ok(response.error.message.includes('not found'), 'Error message should mention tool not found');
        });
    });
    suite('Error Propagation', () => {
        test('Should propagate tool execution errors', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            mockServer.registerTool({
                name: 'failing_tool',
                description: 'A tool that always fails',
                inputSchema: {
                    type: 'object',
                    properties: {}
                },
                handler: async () => {
                    throw new Error('Tool execution failed');
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Call failing tool
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 6,
                method: 'tools/call',
                params: {
                    name: 'failing_tool',
                    arguments: {}
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.ok(response.error, 'Should have error object');
            assert.strictEqual(response.error.code, test_constants_1.JSONRPC_ERROR_CODES.INTERNAL_ERROR, 'Should be internal error');
            assert.strictEqual(response.error.message, 'Tool execution failed', 'Should propagate error message');
        });
    });
    suite('Server Restart and Recovery', () => {
        test('Should handle MCP server restart gracefully', async function () {
            this.timeout(8000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            mockServer.registerTool({
                name: 'persistent_tool',
                description: 'Tool that persists across restart',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            assert.strictEqual(mockServer.isInitialized(), true, 'Server should be initialized');
            // Simulate server restart
            await mockServer.simulateRestart();
            // Server should re-initialize
            await (0, test_utils_1.sleep)(test_constants_1.TEST_DELAYS.STABILITY_INTERVAL);
            // Tools should still be registered
            const tools = mockServer.getRegisteredTools();
            assert.strictEqual(tools.length, 1, 'Tools should persist after restart');
            assert.strictEqual(tools[0].name, 'persistent_tool');
        });
        test('Should recover after temporary disconnection', async function () {
            this.timeout(8000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Disconnect
            await testClient.disconnect();
            await (0, test_utils_1.sleep)(test_constants_1.TEST_DELAYS.DISCONNECTION);
            // Reconnect
            await testClient.connect();
            // Re-initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 2,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.ok(response.result, 'Should re-initialize successfully');
            assert.strictEqual(mockServer.isInitialized(), true, 'Server should be initialized after reconnection');
        });
    });
    suite('Tool Result Formatting', () => {
        test('Should format tool results correctly for VS Code', async function () {
            this.timeout(5000);
            await mockServer.start(TEST_PORT, {
                enableMCP: true
            });
            mockServer.registerTool({
                name: 'formatter',
                description: 'Formats data for VS Code',
                inputSchema: {
                    type: 'object',
                    properties: {
                        data: { type: 'object' }
                    }
                },
                handler: async (input) => {
                    return {
                        formatted: true,
                        data: input.data,
                        timestamp: Date.now()
                    };
                }
            });
            testClient = (0, websocketTestHelper_1.createTestWebSocketClient)(WS_URL);
            await testClient.connect();
            // Initialize
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: test_constants_1.MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
                    capabilities: {},
                    clientInfo: { name: 'test', version: '1.0.0' }
                }
            });
            await testClient.waitForMessage(1000);
            // Call formatter tool
            testClient.clearMessages();
            await testClient.send({
                jsonrpc: '2.0',
                id: 7,
                method: 'tools/call',
                params: {
                    name: 'formatter',
                    arguments: {
                        data: {
                            file: 'test.ts',
                            line: 42,
                            column: 10
                        }
                    }
                }
            });
            const response = await testClient.waitForMessage(2000);
            assert.ok(response.result, 'Should have result');
            assert.strictEqual(response.result.content[0].type, 'text', 'Content should be text type');
            const parsedResult = JSON.parse(response.result.content[0].text);
            assert.strictEqual(parsedResult.formatted, true, 'Result should be formatted');
            assert.deepStrictEqual(parsedResult.data, { file: 'test.ts', line: 42, column: 10 }, 'Data should be preserved');
        });
    });
});
//# sourceMappingURL=websocket.mcp.test.js.map