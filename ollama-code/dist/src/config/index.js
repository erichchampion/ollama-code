/**
 * Configuration Module
 *
 * Handles loading, validating, and providing access to application configuration.
 * Supports multiple sources like environment variables, config files, and CLI arguments.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { AI_CONSTANTS, TIMEOUT_CONSTANTS } from './constants.js';
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    // API configuration
    api: {
        baseUrl: 'http://localhost:11434',
        version: 'v1',
        timeout: TIMEOUT_CONSTANTS.GIT_OPERATION
    },
    // AI configuration
    ai: {
        model: 'qwen2.5-coder:latest',
        temperature: AI_CONSTANTS.DEFAULT_TEMPERATURE,
        maxTokens: 4096,
        maxHistoryLength: 20
    },
    // Terminal configuration
    terminal: {
        theme: 'system',
        useColors: true,
        showProgressIndicators: true,
        codeHighlighting: true
    },
    // Telemetry configuration
    telemetry: {
        enabled: true,
        submissionInterval: 30 * 60 * 1000, // 30 minutes
        maxQueueSize: 100,
        autoSubmit: true
    },
    // File operation configuration
    fileOps: {
        maxReadSizeBytes: 10 * 1024 * 1024 // 10MB
    },
    // Execution configuration
    execution: {
        shell: process.env.SHELL || 'bash'
    },
    // Logger configuration
    logger: {
        level: 'info',
        timestamps: true,
        colors: true
    },
    // App information
    version: '0.2.29'
};
/**
 * Configuration file paths to check
 */
const CONFIG_PATHS = [
    // Current directory
    path.join(process.cwd(), '.ollama-code.json'),
    path.join(process.cwd(), '.ollama-code.js'),
    // User home directory
    path.join(os.homedir(), '.ollama-code', 'config.json'),
    path.join(os.homedir(), '.ollama-code.json'),
    // XDG config directory (Linux/macOS)
    process.env.XDG_CONFIG_HOME
        ? path.join(process.env.XDG_CONFIG_HOME, 'ollama-code', 'config.json')
        : path.join(os.homedir(), '.config', 'ollama-code', 'config.json'),
    // AppData directory (Windows)
    process.env.APPDATA
        ? path.join(process.env.APPDATA, 'ollama-code', 'config.json')
        : null
].filter(Boolean);
/**
 * Load configuration from a file (async)
 */
async function loadConfigFromFile(configPath) {
    try {
        // Use async access check instead of existsSync
        try {
            await fs.promises.access(configPath, fs.constants.F_OK);
        }
        catch {
            return null; // File doesn't exist
        }
        logger.debug(`Loading configuration from ${configPath}`);
        if (configPath.endsWith('.js')) {
            // Load JavaScript module using dynamic import
            const configModule = await import(configPath);
            return configModule.default || configModule;
        }
        else {
            // Load JSON file asynchronously
            const configContent = await fs.promises.readFile(configPath, 'utf8');
            return JSON.parse(configContent);
        }
    }
    catch (error) {
        logger.warn(`Error loading configuration from ${configPath}`, error);
        return null;
    }
}
/**
 * Load configuration from environment variables
 */
function loadConfigFromEnv() {
    const envConfig = {};
    // Check for API URL
    if (process.env.OLLAMA_API_URL) {
        envConfig.api = envConfig.api || {};
        envConfig.api.baseUrl = process.env.OLLAMA_API_URL;
    }
    // Check for log level
    if (process.env.OLLAMA_LOG_LEVEL) {
        envConfig.logger = envConfig.logger || {};
        envConfig.logger.level = process.env.OLLAMA_LOG_LEVEL;
    }
    // Check for telemetry opt-out
    if (process.env.OLLAMA_TELEMETRY === '0' || process.env.OLLAMA_TELEMETRY === 'false') {
        envConfig.telemetry = envConfig.telemetry || {};
        envConfig.telemetry.enabled = false;
    }
    // Check for model override
    if (process.env.OLLAMA_MODEL) {
        envConfig.ai = envConfig.ai || {};
        envConfig.ai.model = process.env.OLLAMA_MODEL;
    }
    return envConfig;
}
/**
 * Merge configuration objects
 */
function mergeConfigs(...configs) {
    const result = {};
    for (const config of configs) {
        if (!config)
            continue;
        for (const key of Object.keys(config)) {
            const value = config[key];
            if (value === null || value === undefined) {
                continue;
            }
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                // Recursively merge objects
                result[key] = mergeConfigs(result[key] || {}, value);
            }
            else {
                // Overwrite primitives, arrays, etc.
                result[key] = value;
            }
        }
    }
    return result;
}
/**
 * Validate critical configuration
 */
function validateConfig(config) {
    // Validate API configuration
    if (!config.api.baseUrl) {
        throw createUserError('API base URL is not configured', {
            category: ErrorCategory.CONFIGURATION,
            resolution: 'Provide a valid API base URL in your configuration'
        });
    }
    // Validate AI model
    if (!config.ai.model) {
        throw createUserError('AI model is not configured', {
            category: ErrorCategory.CONFIGURATION,
            resolution: 'Specify a valid Ollama model in your configuration'
        });
    }
}
/**
 * Load configuration
 */
export async function loadConfig(options = {}) {
    logger.debug('Loading configuration', { options });
    // Initialize with defaults
    let config = { ...DEFAULT_CONFIG };
    // Load configuration from files (async)
    for (const configPath of CONFIG_PATHS) {
        const fileConfig = await loadConfigFromFile(configPath);
        if (fileConfig) {
            config = mergeConfigs(config, fileConfig);
            logger.debug(`Loaded configuration from ${configPath}`);
            break; // Stop after first successful load
        }
    }
    // Load configuration from environment variables
    const envConfig = loadConfigFromEnv();
    config = mergeConfigs(config, envConfig);
    // Override with command line options
    if (options) {
        const cliConfig = {};
        // Map CLI flags to configuration
        if (options.verbose) {
            cliConfig.logger = { level: 'debug' };
        }
        if (options.quiet) {
            cliConfig.logger = { level: 'error' };
        }
        if (options.debug) {
            cliConfig.logger = { level: 'debug' };
        }
        if (options.config) {
            // Load from specified config file (async)
            const customConfig = await loadConfigFromFile(options.config);
            if (customConfig) {
                config = mergeConfigs(config, customConfig);
            }
            else {
                throw createUserError(`Could not load configuration from ${options.config}`, {
                    category: ErrorCategory.CONFIGURATION,
                    resolution: 'Check that the file exists and is valid JSON or JavaScript'
                });
            }
        }
        // Merge CLI options
        config = mergeConfigs(config, cliConfig);
    }
    // Validate the configuration
    validateConfig(config);
    // Logger configuration is handled by the logger itself
    return config;
}
export default { loadConfig };
//# sourceMappingURL=index.js.map