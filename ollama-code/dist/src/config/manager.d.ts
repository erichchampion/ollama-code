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
export interface UserConfig {
    ai: {
        defaultModel: string;
        temperature: number;
        maxTokens: number;
        timeout: number;
        enableProjectContext: boolean;
        enableToolUse: boolean;
    };
    ui: {
        theme: 'dark' | 'light' | 'auto';
        showSpinners: boolean;
        enableAnimations: boolean;
        compactMode: boolean;
        maxHistoryItems: number;
        autoSaveHistory: boolean;
    };
    git: {
        enableSmartCommits: boolean;
        defaultCommitFormat: 'conventional' | 'simple';
        autoDetectFramework: boolean;
        enableConflictAssistance: boolean;
    };
    testing: {
        preferredFramework: string;
        includeEdgeCases: boolean;
        generateMocks: boolean;
        coverageThreshold: number;
        autoRunTests: boolean;
    };
    refactoring: {
        enableCodeSmellDetection: boolean;
        aggressiveOptimization: boolean;
        preserveComments: boolean;
        autoBackupFiles: boolean;
    };
    performance: {
        enableCaching: boolean;
        maxCacheSize: number;
        concurrentOperations: number;
        memoryLimit: number;
    };
    development: {
        enableDebugMode: boolean;
        logLevel: 'error' | 'warn' | 'info' | 'debug';
        enableTelemetry: boolean;
        checkForUpdates: boolean;
    };
}
export interface ProjectConfig {
    ai: {
        model?: string;
        customPrompts?: Record<string, string>;
        excludePatterns?: string[];
    };
    tools: {
        testFramework?: string;
        linter?: string;
        formatter?: string;
        buildCommand?: string;
        testCommand?: string;
    };
    git: {
        commitFormat?: 'conventional' | 'simple';
        branchStrategy?: string;
        reviewTemplate?: string;
    };
}
export interface ConfigPaths {
    userConfig: string;
    userDataDir: string;
    projectConfig: string;
    cacheDir: string;
    logsDir: string;
}
export declare class ConfigManager {
    private userConfig;
    private projectConfig;
    private configPaths;
    private configLoaded;
    constructor();
    /**
     * Initialize configuration paths
     */
    private initializePaths;
    /**
     * Load all configurations
     */
    loadConfig(): Promise<void>;
    /**
     * Save user configuration
     */
    saveUserConfig(): Promise<void>;
    /**
     * Save project configuration
     */
    saveProjectConfig(config: ProjectConfig): Promise<void>;
    /**
     * Get user configuration
     */
    getUserConfig(): UserConfig;
    /**
     * Get project configuration
     */
    getProjectConfig(): ProjectConfig | null;
    /**
     * Update user configuration
     */
    updateUserConfig(updates: Partial<UserConfig>): Promise<void>;
    /**
     * Update project configuration
     */
    updateProjectConfig(updates: Partial<ProjectConfig>): Promise<void>;
    /**
     * Get configuration value with fallback
     */
    get<T>(key: string, defaultValue?: T): T;
    /**
     * Set configuration value
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Reset to default configuration
     */
    resetConfig(): Promise<void>;
    /**
     * Export configuration
     */
    exportConfig(filePath: string): Promise<void>;
    /**
     * Import configuration
     */
    importConfig(filePath: string): Promise<void>;
    /**
     * Get configuration summary
     */
    getConfigSummary(): any;
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Load user configuration from file
     */
    private loadUserConfig;
    /**
     * Load project configuration from file
     */
    private loadProjectConfig;
    /**
     * Ensure required directories exist
     */
    private ensureDirectories;
    /**
     * Get default user configuration
     */
    private getDefaultUserConfig;
    /**
     * Deep merge objects
     */
    private deepMerge;
    /**
     * Get configuration paths
     */
    getConfigPaths(): ConfigPaths;
}
/**
 * Default configuration manager instance
 */
export declare const configManager: ConfigManager;
