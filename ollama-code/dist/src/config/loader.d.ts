/**
 * Configuration Loader
 *
 * Simple loader interface for configuration management
 */
/**
 * Load configuration from file or defaults
 */
export declare function loadConfig(options?: any): Promise<any>;
/**
 * Save configuration to file
 */
export declare function saveConfig(config: any, configPath?: string): Promise<void>;
