/**
 * Application Constants
 *
 * Centralized location for all hardcoded values used throughout the application.
 * This helps maintain consistency and makes configuration changes easier.
 */

// =============================================================================
// NETWORK & API CONSTANTS
// =============================================================================

/** Default Ollama server base URL */
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

/** Default Ollama server port */
export const DEFAULT_OLLAMA_PORT = 11434;

/** Default API version */
export const DEFAULT_API_VERSION = 'v1';

/** User agent string for HTTP requests */
export const USER_AGENT = 'ollama-code-cli';

// =============================================================================
// AI MODEL CONSTANTS
// =============================================================================

/** Default AI model for code generation and assistance */
export const DEFAULT_MODEL = 'qwen2.5-coder:latest';

/** Default temperature for AI responses (0.0 - 1.0) */
export const DEFAULT_TEMPERATURE = 0.7;

/** Default top-p value for AI responses */
export const DEFAULT_TOP_P = 0.9;

/** Default top-k value for AI responses */
export const DEFAULT_TOP_K = 40;

/** Default repeat penalty for AI responses */
export const DEFAULT_REPEAT_PENALTY = 1.1;

// =============================================================================
// TIMEOUT CONSTANTS
// =============================================================================

/** Default timeout for AI completion requests (2 minutes) */
export const AI_COMPLETION_TIMEOUT = 120000;

/** Default timeout for API requests (1 minute) */
export const API_REQUEST_TIMEOUT = 60000;

/** Default timeout for code analysis operations (30 seconds) */
export const CODE_ANALYSIS_TIMEOUT = 30000;

/** Default timeout for file operations (10 seconds) */
export const FILE_OPERATION_TIMEOUT = 10000;

// =============================================================================
// RETRY CONFIGURATION
// =============================================================================

/** Default maximum number of retries for failed requests */
export const DEFAULT_MAX_RETRIES = 3;

/** Default initial delay between retries (1 second) */
export const DEFAULT_INITIAL_RETRY_DELAY = 1000;

/** Default maximum delay between retries (5 seconds) */
export const DEFAULT_MAX_RETRY_DELAY = 5000;

// =============================================================================
// FILE SIZE LIMITS
// =============================================================================

/** Maximum file size for reading operations (10MB) */
export const MAX_FILE_READ_SIZE = 10 * 1024 * 1024;

/** Maximum file size for code analysis (1MB) */
export const MAX_CODE_ANALYSIS_FILE_SIZE = 1024 * 1024;

/** Maximum file size for text processing (5MB) */
export const MAX_TEXT_PROCESSING_SIZE = 5 * 1024 * 1024;

// =============================================================================
// TELEMETRY CONSTANTS
// =============================================================================

/** Default telemetry submission interval (30 minutes) */
export const TELEMETRY_SUBMISSION_INTERVAL = 30 * 60 * 1000;

/** Default maximum telemetry queue size */
export const TELEMETRY_MAX_QUEUE_SIZE = 100;

// =============================================================================
// TERMINAL/CLI CONSTANTS
// =============================================================================

/** Default help output width */
export const HELP_OUTPUT_WIDTH = 100;

/** Default tab width for code formatting */
export const DEFAULT_TAB_WIDTH = 2;

/** Default index depth for code analysis */
export const DEFAULT_INDEX_DEPTH = 3;

/** Maximum history length for chat/conversation */
export const MAX_HISTORY_LENGTH = 20;

/** Maximum tokens for AI responses */
export const MAX_AI_TOKENS = 4096;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

/** Common help command suggestion */
export const HELP_COMMAND_SUGGESTION = 'Use "ollama-code help" to see available commands.';

/** Interactive mode help text */
export const INTERACTIVE_MODE_HELP = 'Type "help" for available commands, "exit" to quit.';

/** Welcome message for interactive terminal */
export const TERMINAL_WELCOME_MESSAGE = 'Welcome! Type /help to see available commands.';

// =============================================================================
// FILE PATTERNS
// =============================================================================

/** Default file patterns to exclude from code analysis */
export const DEFAULT_EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '**/*.min.js',
  '**/*.bundle.js',
  '**/vendor/**',
  '.DS_Store',
  '**/*.log',
  '**/*.lock',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '.env*',
  '**/*.map'
] as const;

/** Default file patterns to include in code analysis */
export const DEFAULT_INCLUDE_PATTERNS = ['**/*'] as const;

// =============================================================================
// CONFIGURATION PATHS
// =============================================================================

/** Configuration file names to search for */
export const CONFIG_FILE_NAMES = [
  '.ollama-code.json',
  '.ollama-code.js',
  'config.json'
] as const;

// =============================================================================
// LOG LEVELS
// =============================================================================

/** Available log levels */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

// =============================================================================
// EXIT COMMANDS
// =============================================================================

/** Commands that exit interactive mode */
export const EXIT_COMMANDS = ['exit', 'quit', 'q', '.exit'] as const;

// =============================================================================
// APPLICATION INFO
// =============================================================================

/** Application name */
export const APP_NAME = 'ollama-code';

/** CLI command name */
export const CLI_COMMAND = 'ollama-code';

/** Default shell for command execution */
export const DEFAULT_SHELL = process.env.SHELL || 'bash';