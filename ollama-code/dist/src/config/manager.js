/**
 * Configuration Management System
 *
 * Provides comprehensive configuration management with:
 * - User preferences and settings
 * - Project-specific configurations
 * - Environment variable integration
 * - Configuration validation and migration
 * - Theme and appearance settings
 * - Performance tuning options
 */
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { createSpinner } from '../utils/spinner.js';
import { fileExists } from '../fs/operations.js';
export class ConfigManager {
    userConfig;
    projectConfig = null;
    configPaths;
    configLoaded = false;
    constructor() {
        this.configPaths = this.initializePaths();
        this.userConfig = this.getDefaultUserConfig();
    }
    /**
     * Initialize configuration paths
     */
    initializePaths() {
        const homeDir = os.homedir();
        const configDir = path.join(homeDir, '.ollama-code');
        const projectConfigFile = path.join(process.cwd(), '.ollama-code.json');
        return {
            userConfig: path.join(configDir, 'config.json'),
            userDataDir: configDir,
            projectConfig: projectConfigFile,
            cacheDir: path.join(configDir, 'cache'),
            logsDir: path.join(configDir, 'logs')
        };
    }
    /**
     * Load all configurations
     */
    async loadConfig() {
        if (this.configLoaded)
            return;
        const spinner = createSpinner('Loading configuration...');
        spinner.start();
        try {
            // Ensure directories exist
            await this.ensureDirectories();
            // Load user config
            await this.loadUserConfig();
            // Load project config
            await this.loadProjectConfig();
            // Validate configuration
            this.validateConfig();
            this.configLoaded = true;
            spinner.succeed('Configuration loaded');
        }
        catch (error) {
            spinner.fail('Failed to load configuration');
            logger.error('Config loading error:', error);
            throw error;
        }
    }
    /**
     * Save user configuration
     */
    async saveUserConfig() {
        const spinner = createSpinner('Saving configuration...');
        spinner.start();
        try {
            await this.ensureDirectories();
            const configData = JSON.stringify(this.userConfig, null, 2);
            await fs.writeFile(this.configPaths.userConfig, configData);
            spinner.succeed('Configuration saved');
            logger.info('User configuration saved');
        }
        catch (error) {
            spinner.fail('Failed to save configuration');
            logger.error('Config save error:', error);
            throw error;
        }
    }
    /**
     * Save project configuration
     */
    async saveProjectConfig(config) {
        const spinner = createSpinner('Saving project configuration...');
        spinner.start();
        try {
            const configData = JSON.stringify(config, null, 2);
            await fs.writeFile(this.configPaths.projectConfig, configData);
            this.projectConfig = config;
            spinner.succeed('Project configuration saved');
            logger.info('Project configuration saved');
        }
        catch (error) {
            spinner.fail('Failed to save project configuration');
            logger.error('Project config save error:', error);
            throw error;
        }
    }
    /**
     * Get user configuration
     */
    getUserConfig() {
        return { ...this.userConfig };
    }
    /**
     * Get project configuration
     */
    getProjectConfig() {
        return this.projectConfig ? { ...this.projectConfig } : null;
    }
    /**
     * Update user configuration
     */
    async updateUserConfig(updates) {
        this.userConfig = this.deepMerge(this.userConfig, updates);
        await this.saveUserConfig();
    }
    /**
     * Update project configuration
     */
    async updateProjectConfig(updates) {
        const currentConfig = this.projectConfig || {};
        const newConfig = this.deepMerge(currentConfig, updates);
        await this.saveProjectConfig(newConfig);
    }
    /**
     * Get configuration value with fallback
     */
    get(key, defaultValue) {
        const keys = key.split('.');
        let value = this.userConfig;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
    /**
     * Set configuration value
     */
    async set(key, value) {
        const keys = key.split('.');
        let target = this.userConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!target[k] || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }
        target[keys[keys.length - 1]] = value;
        await this.saveUserConfig();
    }
    /**
     * Reset to default configuration
     */
    async resetConfig() {
        const spinner = createSpinner('Resetting configuration...');
        spinner.start();
        try {
            this.userConfig = this.getDefaultUserConfig();
            await this.saveUserConfig();
            spinner.succeed('Configuration reset to defaults');
        }
        catch (error) {
            spinner.fail('Failed to reset configuration');
            throw error;
        }
    }
    /**
     * Export configuration
     */
    async exportConfig(filePath) {
        const spinner = createSpinner('Exporting configuration...');
        spinner.start();
        try {
            const exportData = {
                userConfig: this.userConfig,
                projectConfig: this.projectConfig,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            const configData = JSON.stringify(exportData, null, 2);
            await fs.writeFile(filePath, configData);
            spinner.succeed(`Configuration exported to ${filePath}`);
        }
        catch (error) {
            spinner.fail('Failed to export configuration');
            throw error;
        }
    }
    /**
     * Import configuration
     */
    async importConfig(filePath) {
        const spinner = createSpinner('Importing configuration...');
        spinner.start();
        try {
            if (!await fileExists(filePath)) {
                throw new Error(`Configuration file not found: ${filePath}`);
            }
            const configData = await fs.readFile(filePath, 'utf-8');
            const importData = JSON.parse(configData);
            if (importData.userConfig) {
                this.userConfig = importData.userConfig;
                await this.saveUserConfig();
            }
            if (importData.projectConfig) {
                await this.saveProjectConfig(importData.projectConfig);
            }
            spinner.succeed('Configuration imported successfully');
        }
        catch (error) {
            spinner.fail('Failed to import configuration');
            throw error;
        }
    }
    /**
     * Get configuration summary
     */
    getConfigSummary() {
        return {
            userConfigPath: this.configPaths.userConfig,
            projectConfigPath: this.configPaths.projectConfig,
            hasProjectConfig: this.projectConfig !== null,
            settings: {
                defaultModel: this.userConfig.ai.defaultModel,
                theme: this.userConfig.ui.theme,
                enableProjectContext: this.userConfig.ai.enableProjectContext,
                preferredTestFramework: this.userConfig.testing.preferredFramework,
                logLevel: this.userConfig.development.logLevel
            }
        };
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        const errors = [];
        // Validate AI settings
        if (this.userConfig.ai.temperature < 0 || this.userConfig.ai.temperature > 1) {
            errors.push('AI temperature must be between 0 and 1');
        }
        if (this.userConfig.ai.maxTokens < 100 || this.userConfig.ai.maxTokens > 100000) {
            errors.push('AI maxTokens must be between 100 and 100,000');
        }
        // Validate testing settings
        if (this.userConfig.testing.coverageThreshold < 0 || this.userConfig.testing.coverageThreshold > 100) {
            errors.push('Coverage threshold must be between 0 and 100');
        }
        if (errors.length > 0) {
            logger.warn('Configuration validation warnings:', errors);
        }
    }
    /**
     * Load user configuration from file
     */
    async loadUserConfig() {
        if (await fileExists(this.configPaths.userConfig)) {
            try {
                const configData = await fs.readFile(this.configPaths.userConfig, 'utf-8');
                const loadedConfig = JSON.parse(configData);
                // Merge with defaults to handle new settings
                this.userConfig = this.deepMerge(this.getDefaultUserConfig(), loadedConfig);
            }
            catch (error) {
                logger.warn('Failed to load user config, using defaults:', error);
                this.userConfig = this.getDefaultUserConfig();
            }
        }
        else {
            // Create default config file
            await this.saveUserConfig();
        }
    }
    /**
     * Load project configuration from file
     */
    async loadProjectConfig() {
        if (await fileExists(this.configPaths.projectConfig)) {
            try {
                const configData = await fs.readFile(this.configPaths.projectConfig, 'utf-8');
                this.projectConfig = JSON.parse(configData);
            }
            catch (error) {
                logger.warn('Failed to load project config:', error);
                this.projectConfig = null;
            }
        }
    }
    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.configPaths.userDataDir,
            this.configPaths.cacheDir,
            this.configPaths.logsDir
        ];
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            }
            catch (error) {
                // Directory might already exist
            }
        }
    }
    /**
     * Get default user configuration
     */
    getDefaultUserConfig() {
        return {
            ai: {
                defaultModel: 'qwen2.5-coder:latest',
                temperature: 0.7,
                maxTokens: 4096,
                timeout: 120000,
                enableProjectContext: true,
                enableToolUse: true
            },
            ui: {
                theme: 'auto',
                showSpinners: true,
                enableAnimations: true,
                compactMode: false,
                maxHistoryItems: 100,
                autoSaveHistory: true
            },
            git: {
                enableSmartCommits: true,
                defaultCommitFormat: 'conventional',
                autoDetectFramework: true,
                enableConflictAssistance: true
            },
            testing: {
                preferredFramework: 'jest',
                includeEdgeCases: true,
                generateMocks: false,
                coverageThreshold: 80,
                autoRunTests: false
            },
            refactoring: {
                enableCodeSmellDetection: true,
                aggressiveOptimization: false,
                preserveComments: true,
                autoBackupFiles: true
            },
            performance: {
                enableCaching: true,
                maxCacheSize: 100,
                concurrentOperations: 3,
                memoryLimit: 1024
            },
            development: {
                enableDebugMode: false,
                logLevel: 'info',
                enableTelemetry: false,
                checkForUpdates: true
            }
        };
    }
    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    /**
     * Get configuration paths
     */
    getConfigPaths() {
        return { ...this.configPaths };
    }
}
/**
 * Default configuration manager instance
 */
export const configManager = new ConfigManager();
//# sourceMappingURL=manager.js.map