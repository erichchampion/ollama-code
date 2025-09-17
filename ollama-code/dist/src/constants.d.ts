/**
 * Application Constants
 *
 * Centralized location for all hardcoded values used throughout the application.
 * This helps maintain consistency and makes configuration changes easier.
 */
/** Default Ollama server base URL */
export declare const DEFAULT_OLLAMA_URL = "http://localhost:11434";
/** Default Ollama server port */
export declare const DEFAULT_OLLAMA_PORT = 11434;
/** Default API version */
export declare const DEFAULT_API_VERSION = "v1";
/** User agent string for HTTP requests */
export declare const USER_AGENT = "ollama-code-cli";
/** Default AI model for code generation and assistance */
export declare const DEFAULT_MODEL = "qwen2.5-coder:latest";
/** Default temperature for AI responses (0.0 - 1.0) */
export declare const DEFAULT_TEMPERATURE = 0.7;
/** Default top-p value for AI responses */
export declare const DEFAULT_TOP_P = 0.9;
/** Default top-k value for AI responses */
export declare const DEFAULT_TOP_K = 40;
/** Default repeat penalty for AI responses */
export declare const DEFAULT_REPEAT_PENALTY = 1.1;
/** Default timeout for AI completion requests (2 minutes) */
export declare const AI_COMPLETION_TIMEOUT = 120000;
/** Default timeout for API requests (1 minute) */
export declare const API_REQUEST_TIMEOUT = 60000;
/** Default timeout for code analysis operations (30 seconds) */
export declare const CODE_ANALYSIS_TIMEOUT = 30000;
/** Default timeout for file operations (10 seconds) */
export declare const FILE_OPERATION_TIMEOUT = 10000;
/** Default maximum number of retries for failed requests */
export declare const DEFAULT_MAX_RETRIES = 3;
/** Default initial delay between retries (1 second) */
export declare const DEFAULT_INITIAL_RETRY_DELAY = 1000;
/** Default maximum delay between retries (5 seconds) */
export declare const DEFAULT_MAX_RETRY_DELAY = 5000;
/** Maximum file size for reading operations (10MB) */
export declare const MAX_FILE_READ_SIZE: number;
/** Maximum file size for code analysis (1MB) */
export declare const MAX_CODE_ANALYSIS_FILE_SIZE: number;
/** Maximum file size for text processing (5MB) */
export declare const MAX_TEXT_PROCESSING_SIZE: number;
/** Default telemetry submission interval (30 minutes) */
export declare const TELEMETRY_SUBMISSION_INTERVAL: number;
/** Default maximum telemetry queue size */
export declare const TELEMETRY_MAX_QUEUE_SIZE = 100;
/** Default help output width */
export declare const HELP_OUTPUT_WIDTH = 100;
/** Default tab width for code formatting */
export declare const DEFAULT_TAB_WIDTH = 2;
/** Default index depth for code analysis */
export declare const DEFAULT_INDEX_DEPTH = 3;
/** Maximum history length for chat/conversation */
export declare const MAX_HISTORY_LENGTH = 20;
/** Maximum tokens for AI responses */
export declare const MAX_AI_TOKENS = 4096;
/** Common help command suggestion */
export declare const HELP_COMMAND_SUGGESTION = "Use \"ollama-code help\" to see available commands.";
/** Interactive mode help text */
export declare const INTERACTIVE_MODE_HELP = "Type \"help\" for available commands, \"exit\" to quit.";
/** Welcome message for interactive terminal */
export declare const TERMINAL_WELCOME_MESSAGE = "Welcome! Type /help to see available commands.";
/** Default file patterns to exclude from code analysis */
export declare const DEFAULT_EXCLUDE_PATTERNS: readonly ["node_modules/**", ".git/**", "dist/**", "build/**", "**/*.min.js", "**/*.bundle.js", "**/vendor/**", ".DS_Store", "**/*.log", "**/*.lock", "**/package-lock.json", "**/yarn.lock", "**/pnpm-lock.yaml", ".env*", "**/*.map"];
/** Default file patterns to include in code analysis */
export declare const DEFAULT_INCLUDE_PATTERNS: readonly ["**/*"];
/** Configuration file names to search for */
export declare const CONFIG_FILE_NAMES: readonly [".ollama-code.json", ".ollama-code.js", "config.json"];
/** Available log levels */
export declare const LOG_LEVELS: {
    readonly ERROR: "error";
    readonly WARN: "warn";
    readonly INFO: "info";
    readonly DEBUG: "debug";
};
/** Commands that exit interactive mode */
export declare const EXIT_COMMANDS: readonly ["exit", "quit", "q", ".exit"];
/** Application name */
export declare const APP_NAME = "ollama-code";
/** CLI command name */
export declare const CLI_COMMAND = "ollama-code";
/** Default shell for command execution */
export declare const DEFAULT_SHELL: string;
