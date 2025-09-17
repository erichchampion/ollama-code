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
 * Start Ollama server in the background
 */
export declare function startOllamaServer(): Promise<void>;
/**
 * Ensure Ollama server is running, start it if necessary
 */
export declare function ensureOllamaServerRunning(baseUrl?: string): Promise<void>;
