"use strict";
/**
 * Configuration Helper Utilities
 *
 * Shared utilities for accessing and managing VS Code configuration
 * to eliminate duplicate configuration access patterns.
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
exports.ConfigurationHelper = void 0;
const vscode = __importStar(require("vscode"));
const serviceConstants_1 = require("../config/serviceConstants");
class ConfigurationHelper {
    /**
     * Get configuration value with type safety and defaults
     */
    static get(key) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        const defaultValue = serviceConstants_1.DEFAULT_CONFIGURATION[key];
        return config.get(key, defaultValue);
    }
    /**
     * Get configuration value with custom default
     */
    static getWithDefault(key, defaultValue) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get(key, defaultValue);
    }
    /**
     * Set configuration value
     */
    static async set(key, value, target = vscode.ConfigurationTarget.Workspace) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, target);
    }
    /**
     * Get all configuration values as a typed object
     */
    static getAll() {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return {
            serverPort: config.get('serverPort', serviceConstants_1.DEFAULT_CONFIGURATION.serverPort),
            autoStart: config.get('autoStart', serviceConstants_1.DEFAULT_CONFIGURATION.autoStart),
            showChatView: config.get('showChatView', serviceConstants_1.DEFAULT_CONFIGURATION.showChatView),
            inlineCompletions: config.get('inlineCompletions', serviceConstants_1.DEFAULT_CONFIGURATION.inlineCompletions),
            codeActions: config.get('codeActions', serviceConstants_1.DEFAULT_CONFIGURATION.codeActions),
            diagnostics: config.get('diagnostics', serviceConstants_1.DEFAULT_CONFIGURATION.diagnostics),
            contextLines: config.get('contextLines', serviceConstants_1.DEFAULT_CONFIGURATION.contextLines),
            connectionTimeout: config.get('connectionTimeout', serviceConstants_1.DEFAULT_CONFIGURATION.connectionTimeout),
            logLevel: config.get('logLevel', serviceConstants_1.DEFAULT_CONFIGURATION.logLevel),
            showStatusBar: config.get('showStatusBar', serviceConstants_1.DEFAULT_CONFIGURATION.showStatusBar),
            notificationLevel: config.get('notificationLevel', serviceConstants_1.DEFAULT_CONFIGURATION.notificationLevel),
            compactMode: config.get('compactMode', serviceConstants_1.DEFAULT_CONFIGURATION.compactMode),
            cacheSize: config.get('cacheSize', serviceConstants_1.DEFAULT_CONFIGURATION.cacheSize),
            maxConcurrentRequests: config.get('maxConcurrentRequests', serviceConstants_1.DEFAULT_CONFIGURATION.maxConcurrentRequests),
            throttleDelay: config.get('throttleDelay', serviceConstants_1.DEFAULT_CONFIGURATION.throttleDelay),
            enableTelemetry: config.get('enableTelemetry', serviceConstants_1.DEFAULT_CONFIGURATION.enableTelemetry),
            debugMode: config.get('debugMode', serviceConstants_1.DEFAULT_CONFIGURATION.debugMode),
            retryAttempts: config.get('retryAttempts', serviceConstants_1.DEFAULT_CONFIGURATION.retryAttempts),
        };
    }
    /**
     * Reset configuration to defaults
     */
    static async resetToDefaults(target = vscode.ConfigurationTarget.Workspace) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        for (const [key, value] of Object.entries(serviceConstants_1.DEFAULT_CONFIGURATION)) {
            await config.update(key, value, target);
        }
    }
    /**
     * Check if configuration value exists
     */
    static has(key) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        const inspect = config.inspect(key);
        return inspect !== undefined &&
            (inspect.workspaceValue !== undefined ||
                inspect.globalValue !== undefined ||
                inspect.defaultValue !== undefined);
    }
    /**
     * Get configuration inspection details
     */
    static inspect(key) {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.inspect(key);
    }
    /**
     * Watch for configuration changes
     */
    static onDidChangeConfiguration(listener, thisArg, disposables) {
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(this.CONFIG_SECTION)) {
                listener(event);
            }
        }, thisArg);
        if (disposables) {
            disposables.push(disposable);
        }
        return disposable;
    }
    /**
     * Validate configuration values
     */
    static validateConfiguration() {
        const errors = [];
        const config = this.getAll();
        // Validate server port
        if (config.serverPort < 1024 || config.serverPort > 65535) {
            errors.push(`Invalid serverPort: ${config.serverPort}. Must be between 1024 and 65535.`);
        }
        // Validate connection timeout
        if (config.connectionTimeout < 1000 || config.connectionTimeout > 60000) {
            errors.push(`Invalid connectionTimeout: ${config.connectionTimeout}. Must be between 1000 and 60000.`);
        }
        // Validate context lines
        if (config.contextLines < 5 || config.contextLines > 100) {
            errors.push(`Invalid contextLines: ${config.contextLines}. Must be between 5 and 100.`);
        }
        // Validate cache size
        if (config.cacheSize < 10 || config.cacheSize > 500) {
            errors.push(`Invalid cacheSize: ${config.cacheSize}. Must be between 10 and 500.`);
        }
        // Validate concurrent requests
        if (config.maxConcurrentRequests < 1 || config.maxConcurrentRequests > 10) {
            errors.push(`Invalid maxConcurrentRequests: ${config.maxConcurrentRequests}. Must be between 1 and 10.`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.ConfigurationHelper = ConfigurationHelper;
ConfigurationHelper.CONFIG_SECTION = 'ollama-code';
//# sourceMappingURL=configurationHelper.js.map