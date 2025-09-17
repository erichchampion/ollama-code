/**
 * AI Module
 *
 * Provides AI capabilities using Ollama, local large language model inference.
 * This module handles initialization, configuration, and access to AI services.
 */
import { OllamaClient } from './ollama-client.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
// Singleton AI client instance
let aiClient = null;
/**
 * Initialize the AI module
 */
export async function initAI(config = {}) {
    logger.info('Initializing AI module');
    try {
        // Create Ollama client
        aiClient = new OllamaClient(config);
        // Test connection to Ollama server
        logger.debug('Testing connection to Ollama server');
        const connectionSuccess = await aiClient.testConnection();
        if (!connectionSuccess) {
            throw createUserError('Failed to connect to Ollama server', {
                category: ErrorCategory.CONNECTION,
                resolution: 'Make sure Ollama is running. Try running "ollama serve" to start the server.'
            });
        }
        logger.info('AI module initialized successfully');
        return aiClient;
    }
    catch (error) {
        logger.error('Failed to initialize AI module', error);
        throw createUserError('Failed to initialize AI capabilities', {
            cause: error,
            category: ErrorCategory.INITIALIZATION,
            resolution: 'Make sure Ollama is running and try again.'
        });
    }
}
/**
 * Get the AI client instance
 */
export function getAIClient() {
    if (!aiClient) {
        throw createUserError('AI module not initialized', {
            category: ErrorCategory.INITIALIZATION,
            resolution: 'Make sure to call initAI() before using AI capabilities.'
        });
    }
    return aiClient;
}
/**
 * Check if AI module is initialized
 */
export function isAIInitialized() {
    return !!aiClient;
}
// Re-export types and components
export * from './ollama-client.js';
export * from './prompts.js';
//# sourceMappingURL=index.js.map