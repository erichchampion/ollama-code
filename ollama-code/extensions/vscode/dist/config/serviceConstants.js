"use strict";
/**
 * Service Constants
 *
 * Centralized constants to eliminate hardcoded values across services
 * and provide consistent configuration throughout the extension.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRAMEWORK_PATTERNS = exports.LANGUAGE_EXTENSIONS = exports.FILE_PATTERNS = exports.ERROR_MESSAGES = exports.DEFAULT_CONFIGURATION = exports.CONFIGURATION_PROFILES = exports.UI_TIMEOUTS = exports.STATUS_BAR_CONFIG = exports.PROGRESS_INTERVALS = exports.VALIDATION_LIMITS = exports.CONNECTION_DEFAULTS = exports.WORKSPACE_ANALYSIS = void 0;
// Workspace Analysis Constants
exports.WORKSPACE_ANALYSIS = {
    MAX_DIRECTORY_DEPTH: 10,
    CONTEXT_LINES: 10,
    MAX_SYMBOL_SEARCH_DEPTH: 50,
    CACHE_TTL: 300000, // 5 minutes
};
// Connection Configuration
exports.CONNECTION_DEFAULTS = {
    DEFAULT_PORT: 3002,
    RECONNECT_ATTEMPTS: 3,
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
};
// Validation Limits
exports.VALIDATION_LIMITS = {
    PORT_MIN: 1024,
    PORT_MAX: 65535,
    TIMEOUT_MIN: 1000,
    TIMEOUT_MAX: 60000,
    CONTEXT_LINES_MIN: 5,
    CONTEXT_LINES_MAX: 100,
    CACHE_SIZE_MIN: 10,
    CACHE_SIZE_MAX: 500,
    CONCURRENT_REQUESTS_MIN: 1,
    CONCURRENT_REQUESTS_MAX: 10,
};
// Progress & Notification Intervals
exports.PROGRESS_INTERVALS = {
    UPDATE_INTERVAL: 500, // 500ms
    INDEXING_SIMULATION: 50, // 50ms
    COMPLETION_CHECK: 100, // 100ms
};
// Status Bar Configuration
exports.STATUS_BAR_CONFIG = {
    CONNECTION_PRIORITY: 100,
    OPERATION_PRIORITY: 99,
    QUICK_ACTIONS_PRIORITY: 98,
    PROGRESS_PRIORITY: 95,
    AUTO_HIDE_DELAY: 10000, // 10 seconds
    SUCCESS_MESSAGE_DELAY: 3000, // 3 seconds
    ERROR_MESSAGE_DELAY: 5000, // 5 seconds
    MONITORING_INTERVAL: 5000, // 5 seconds
};
// UI Timeouts & Delays
exports.UI_TIMEOUTS = {
    NOTIFICATION_DEFAULT: 5000, // 5 seconds
    NOTIFICATION_INFO: 3000, // 3 seconds
    NOTIFICATION_ERROR: 8000, // 8 seconds
    WEBVIEW_LOAD_TIMEOUT: 10000, // 10 seconds
    CONFIGURATION_SAVE_DELAY: 500, // 500ms debounce
};
// Configuration Profiles
exports.CONFIGURATION_PROFILES = {
    MINIMAL: {
        contextLines: 10,
        analysisDepth: 'surface',
        cacheSize: 25,
        maxConcurrentRequests: 1,
        notificationLevel: 'minimal',
    },
    BALANCED: {
        contextLines: 20,
        analysisDepth: 'moderate',
        cacheSize: 50,
        maxConcurrentRequests: 3,
        notificationLevel: 'standard',
    },
    FULL_FEATURED: {
        contextLines: 50,
        analysisDepth: 'deep',
        cacheSize: 100,
        maxConcurrentRequests: 5,
        notificationLevel: 'verbose',
    },
};
// Default Extension Settings
exports.DEFAULT_CONFIGURATION = {
    serverPort: exports.CONNECTION_DEFAULTS.DEFAULT_PORT,
    autoStart: true,
    showChatView: true,
    inlineCompletions: true,
    codeActions: true,
    diagnostics: true,
    contextLines: exports.CONFIGURATION_PROFILES.BALANCED.contextLines,
    connectionTimeout: 10000,
    logLevel: 'info',
    showStatusBar: true,
    notificationLevel: 'standard',
    compactMode: false,
    cacheSize: exports.CONFIGURATION_PROFILES.BALANCED.cacheSize,
    maxConcurrentRequests: exports.CONFIGURATION_PROFILES.BALANCED.maxConcurrentRequests,
    throttleDelay: 300,
    enableTelemetry: false,
    debugMode: false,
    retryAttempts: exports.CONNECTION_DEFAULTS.RECONNECT_ATTEMPTS,
};
// Error Messages
exports.ERROR_MESSAGES = {
    WORKSPACE_NOT_FOUND: 'No workspace folder found',
    CONNECTION_FAILED: 'Failed to connect to Ollama Code server',
    CONFIGURATION_INVALID: 'Invalid configuration provided',
    FILE_READ_ERROR: 'Unable to read file',
    PERMISSION_DENIED: 'Permission denied',
    TIMEOUT_EXCEEDED: 'Operation timed out',
    INVALID_JSON: 'Invalid JSON format',
    TASK_ALREADY_RUNNING: 'Task is already running',
};
// File Patterns
exports.FILE_PATTERNS = {
    IGNORE_PATTERNS: ['.git', 'node_modules', 'dist', 'build', '.vscode', '.idea'],
    CONFIG_FILES: ['package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.ts'],
    TEST_DIRECTORIES: ['test', 'tests', 'spec', '__tests__', 'cypress'],
    SOURCE_DIRECTORIES: ['src', 'lib', 'source', 'app'],
};
// Language Detection
exports.LANGUAGE_EXTENSIONS = {
    typescript: ['.ts', '.tsx'],
    javascript: ['.js', '.jsx', '.mjs'],
    python: ['.py', '.pyw'],
    java: ['.java'],
    csharp: ['.cs'],
    cpp: ['.cpp', '.cxx', '.cc', '.c++'],
    c: ['.c', '.h'],
    rust: ['.rs'],
    go: ['.go'],
    php: ['.php'],
    ruby: ['.rb'],
    kotlin: ['.kt', '.kts'],
};
// Framework Detection Patterns
exports.FRAMEWORK_PATTERNS = {
    react: ['react', 'react-dom', '@types/react'],
    vue: ['vue', '@vue/core', 'nuxt'],
    angular: ['@angular/core', '@angular/cli'],
    express: ['express', 'fastify', 'koa'],
    django: ['django', 'Django'],
    flask: ['flask', 'Flask'],
    spring: ['spring-boot', 'springframework'],
    laravel: ['laravel/framework'],
    rails: ['rails', 'actionpack'],
};
//# sourceMappingURL=serviceConstants.js.map