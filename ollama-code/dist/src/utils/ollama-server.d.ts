/**
 * Ollama Server Manager
 *
 * Handles automatic startup and management of the Ollama server.
 */
/**
 * Check if Ollama server is running
 */
export declare function isOllamaServerRunning(baseUrl?: string): Promise<boolean>;
/**
 * Check if Ollama is installed
 */
export declare function isOllamaInstalled(): Promise<boolean>;
/**
 * Configuration options for Ollama server startup
 */
export interface OllamaServerStartupConfig {
    healthCheckInterval?: number;
    startupTimeout?: number;
    maxHealthCheckRetries?: number;
}
/**
 * Start Ollama server in the background
 */
export declare function startOllamaServer(config?: OllamaServerStartupConfig): Promise<void>;
/**
 * Ensure Ollama server is running, start it if necessary
 */
export declare function ensureOllamaServerRunning(baseUrl?: string): Promise<void>;
