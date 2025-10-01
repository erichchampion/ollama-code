/**
 * VS Code Extension Test Constants
 * Centralized configuration values for extension testing
 */

/**
 * Extension identification constants
 */
export const EXTENSION_TEST_CONSTANTS = {
  /** Default extension ID */
  EXTENSION_ID: 'ollama-code.ollama-code-vscode',
  /** Default timeout for extension activation */
  ACTIVATION_TIMEOUT: 10000,
  /** Default timeout for command execution */
  COMMAND_TIMEOUT: 5000,
  /** Default polling interval for async checks */
  POLLING_INTERVAL: 100,
} as const;

/**
 * WebSocket test constants
 */
export const WEBSOCKET_TEST_CONSTANTS = {
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
} as const;

/**
 * Expected command IDs registered by the extension
 */
export const EXPECTED_COMMANDS = [
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
] as const;

/**
 * Expected configuration keys
 */
export const EXPECTED_CONFIG_KEYS = [
  'serverPort',
  'autoStart',
  'modelName',
  'maxTokens',
  'temperature',
  'timeout',
  'logLevel',
  'enableTelemetry',
] as const;
