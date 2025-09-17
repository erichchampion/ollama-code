/**
 * Ollama Server Manager
 *
 * Handles automatic startup and management of the Ollama server.
 */
import { spawn, exec } from 'child_process';
import { logger } from './logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
/**
 * Check if Ollama server is running
 */
export async function isOllamaServerRunning(baseUrl = 'http://localhost:11434') {
    try {
        const response = await fetch(`${baseUrl}/api/tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return response.ok;
    }
    catch (error) {
        logger.debug('Ollama server check failed', { error: error instanceof Error ? error.message : String(error) });
        return false;
    }
}
/**
 * Check if Ollama is installed
 */
export async function isOllamaInstalled() {
    return new Promise((resolve) => {
        exec('ollama --version', (error) => {
            resolve(!error);
        });
    });
}
/**
 * Start Ollama server in the background
 */
export async function startOllamaServer() {
    logger.info('Starting Ollama server in the background...');
    return new Promise((resolve, reject) => {
        const ollamaProcess = spawn('ollama', ['serve'], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let serverStarted = false;
        let startupTimeout;
        // Set up timeout for server startup
        startupTimeout = setTimeout(() => {
            if (!serverStarted) {
                ollamaProcess.kill();
                reject(createUserError('Ollama server failed to start within 30 seconds', {
                    category: ErrorCategory.SERVER,
                    resolution: 'Please start Ollama manually with "ollama serve" and try again.'
                }));
            }
        }, 30000); // 30 second timeout
        // Monitor server output for startup confirmation
        ollamaProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            logger.debug('Ollama server output:', output);
            // Look for server startup indicators
            if (output.includes('Listening on') || output.includes('server started')) {
                serverStarted = true;
                clearTimeout(startupTimeout);
                logger.info('Ollama server started successfully');
                resolve();
            }
        });
        ollamaProcess.stderr?.on('data', (data) => {
            const error = data.toString();
            logger.debug('Ollama server error:', error);
            // Some errors are not fatal (like port already in use)
            if (error.includes('address already in use') || error.includes('port 11434')) {
                serverStarted = true;
                clearTimeout(startupTimeout);
                logger.info('Ollama server already running');
                resolve();
            }
        });
        ollamaProcess.on('error', (error) => {
            clearTimeout(startupTimeout);
            reject(createUserError(`Failed to start Ollama server: ${error.message}`, {
                cause: error,
                category: ErrorCategory.SERVER,
                resolution: 'Make sure Ollama is installed and try running "ollama serve" manually.'
            }));
        });
        ollamaProcess.on('exit', (code) => {
            clearTimeout(startupTimeout);
            if (!serverStarted) {
                reject(createUserError(`Ollama server exited with code ${code}`, {
                    category: ErrorCategory.SERVER,
                    resolution: 'Check Ollama installation and try running "ollama serve" manually.'
                }));
            }
        });
        // Detach the process so it continues running after this process exits
        ollamaProcess.unref();
    });
}
/**
 * Ensure Ollama server is running, start it if necessary
 */
export async function ensureOllamaServerRunning(baseUrl = 'http://localhost:11434') {
    logger.debug('Checking if Ollama server is running...');
    // First check if server is already running
    const isRunning = await isOllamaServerRunning(baseUrl);
    if (isRunning) {
        logger.debug('Ollama server is already running');
        return;
    }
    logger.info('Ollama server is not running, attempting to start it...');
    // Check if Ollama is installed
    const isInstalled = await isOllamaInstalled();
    if (!isInstalled) {
        throw createUserError('Ollama is not installed', {
            category: ErrorCategory.SERVER,
            resolution: 'Please install Ollama from https://ollama.ai and try again.'
        });
    }
    // Start the server
    await startOllamaServer();
    // Wait a moment for the server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Verify the server is now running
    const isNowRunning = await isOllamaServerRunning(baseUrl);
    if (!isNowRunning) {
        throw createUserError('Failed to start Ollama server', {
            category: ErrorCategory.SERVER,
            resolution: 'Please start Ollama manually with "ollama serve" and try again.'
        });
    }
    logger.info('Ollama server is now running and ready');
}
//# sourceMappingURL=ollama-server.js.map