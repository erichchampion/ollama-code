"use strict";
/**
 * VS Code Extension Test Constants
 * Centralized configuration values for extension testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GIT_HOOK_TYPES = exports.GIT_HOOKS_FILE_PERMISSIONS = exports.GIT_HOOKS_TEST_CONSTANTS = exports.PROVIDER_TEST_TIMEOUTS = exports.EXPECTED_CONFIG_KEYS = exports.EXPECTED_COMMANDS = exports.TEST_DELAYS = exports.JSONRPC_ERROR_CODES = exports.MCP_TEST_CONSTANTS = exports.WEBSOCKET_TEST_CONSTANTS = exports.EXTENSION_TEST_CONSTANTS = void 0;
/**
 * Extension identification constants
 */
exports.EXTENSION_TEST_CONSTANTS = {
    /** Default extension ID */
    EXTENSION_ID: 'ollama-code.ollama-code-vscode',
    /** Default timeout for extension activation */
    ACTIVATION_TIMEOUT: 10000,
    /** Default timeout for command execution */
    COMMAND_TIMEOUT: 5000,
    /** Default polling interval for async checks */
    POLLING_INTERVAL: 100,
};
/**
 * WebSocket test constants
 */
exports.WEBSOCKET_TEST_CONSTANTS = {
    /** Default WebSocket connection timeout */
    CONNECTION_TIMEOUT: 5000,
    /** Default message wait timeout */
    MESSAGE_TIMEOUT: 5000,
    /** Default polling interval for message checks */
    MESSAGE_POLL_INTERVAL: 50,
    /** Default test port for mock WebSocket server */
    DEFAULT_TEST_PORT: 9876,
    /** Heartbeat test interval */
    HEARTBEAT_INTERVAL: 1000,
    /** Number of heartbeat iterations */
    HEARTBEAT_COUNT: 3,
    /** Port assignments for different test suites */
    PORTS: {
        /** Integration tests port */
        INTEGRATION_TESTS: 9876,
        /** Connection management tests port */
        CONNECTION_TESTS: 9877,
        /** Message processing tests port */
        MESSAGE_TESTS: 9878,
        /** MCP integration tests port */
        MCP_TESTS: 9879,
    },
    /** Authentication test tokens */
    AUTH: {
        /** Valid authentication token for tests */
        VALID_TOKEN: 'test-auth-token-12345',
        /** Invalid authentication token for tests */
        INVALID_TOKEN: 'invalid-token',
    },
};
/**
 * MCP (Model Context Protocol) test constants
 */
exports.MCP_TEST_CONSTANTS = {
    /** MCP protocol version */
    PROTOCOL_VERSION: '2024-11-05',
    /** Mock server name */
    SERVER_NAME: 'mock-mcp-server',
    /** Mock server version */
    SERVER_VERSION: '1.0.0',
    /** Default heartbeat interval for MCP server */
    DEFAULT_HEARTBEAT_INTERVAL: 30000,
};
/**
 * JSON-RPC 2.0 error codes
 */
exports.JSONRPC_ERROR_CODES = {
    /** Parse error - Invalid JSON */
    PARSE_ERROR: -32700,
    /** Invalid request - Not a valid JSON-RPC request */
    INVALID_REQUEST: -32600,
    /** Method not found */
    METHOD_NOT_FOUND: -32601,
    /** Invalid method parameters */
    INVALID_PARAMS: -32602,
    /** Internal JSON-RPC error */
    INTERNAL_ERROR: -32603,
    /** Server error (reserved range -32000 to -32099) */
    SERVER_ERROR: -32000,
};
/**
 * Test delay constants (in milliseconds)
 */
exports.TEST_DELAYS = {
    /** Short cleanup wait */
    CLEANUP: 100,
    /** Disconnection detection wait */
    DISCONNECTION: 200,
    /** Server restart wait */
    SERVER_RESTART: 100,
    /** Stability test interval */
    STABILITY_INTERVAL: 500,
    /** Message processing wait */
    MESSAGE_PROCESSING: 100,
};
/**
 * Expected command IDs registered by the extension
 */
exports.EXPECTED_COMMANDS = [
    'ollama-code.ask',
    'ollama-code.explain',
    'ollama-code.refactor',
    'ollama-code.review',
    'ollama-code.test',
    'ollama-code.document',
    'ollama-code.fix',
    'ollama-code.optimize',
    'ollama-code.security',
    'ollama-code.analyze',
    'ollama-code.chat',
    'ollama-code.codeAction',
    'ollama-code.inlineCompletion',
    'ollama-code.selectModel',
    'ollama-code.startServer',
    'ollama-code.stopServer',
    'ollama-code.restartServer',
    'ollama-code.showStatus',
    'ollama-code.clearCache',
    'ollama-code.openSettings',
    'ollama-code.showLogs',
    'ollama-code.showHelp',
];
/**
 * Expected configuration keys
 */
exports.EXPECTED_CONFIG_KEYS = [
    'serverPort',
    'autoStart',
    'modelName',
    'maxTokens',
    'temperature',
    'timeout',
    'logLevel',
    'enableTelemetry',
];
/**
 * Provider test timeout constants (in milliseconds)
 * Centralized timeout values for VS Code provider tests
 */
exports.PROVIDER_TEST_TIMEOUTS = {
    /** Setup/teardown timeout */
    SETUP: 10000,
    /** Standard test timeout */
    STANDARD_TEST: 5000,
    /** Timeout-specific test timeout */
    TIMEOUT_TEST: 8000,
    /** AI request test timeout */
    AI_REQUEST: 3000,
    /** Simulated slow AI response (triggers timeout) */
    SIMULATED_SLOW_AI: 10000,
    /** Simulated slow hover response (triggers timeout) */
    SIMULATED_SLOW_HOVER: 5000,
};
/**
 * Git Hooks test constants
 * Centralized configuration values for Git hooks management testing
 */
exports.GIT_HOOKS_TEST_CONSTANTS = {
    /** Default analysis timeout for hooks */
    DEFAULT_ANALYSIS_TIMEOUT: 30000,
    /** Maximum hook execution time for performance tests */
    MAX_HOOK_EXECUTION_TIME: 5000,
    /** Test Git repositories base directory */
    TEST_REPOS_DIR: '.test-git-repos',
    /** Test workspaces base directory */
    TEST_WORKSPACES_DIR: '.test-workspaces',
    /** Hook marker comment */
    HOOK_MARKER: '# ollama-code generated hook',
    /** Backup file extension */
    BACKUP_EXTENSION: '.backup',
    /** Test Git user email */
    TEST_GIT_EMAIL: 'test@example.com',
    /** Test Git user name */
    TEST_GIT_NAME: 'Test User',
};
/**
 * Git Hooks file permission constants
 */
exports.GIT_HOOKS_FILE_PERMISSIONS = {
    /** Executable permission (rwxr-xr-x) */
    EXECUTABLE: 0o755,
    /** Execute bit mask for checking executability */
    EXECUTE_BIT: 0o111,
};
/**
 * Git hook types
 */
exports.GIT_HOOK_TYPES = ['pre-commit', 'commit-msg', 'pre-push', 'post-merge'];
//# sourceMappingURL=test-constants.js.map