/**
 * AI Providers Module
 *
 * Exports all AI provider implementations and the intelligent router
 * for multi-provider AI integration with intelligent routing capabilities.
 */
// Base provider interface and types
export * from './base-provider.js';
// Provider implementations
export { OllamaProvider } from './ollama-provider.js';
export { OpenAIProvider } from './openai-provider.js';
export { AnthropicProvider } from './anthropic-provider.js';
// Intelligent router
export { IntelligentAIRouter } from './intelligent-router.js';
import { OllamaProvider } from './ollama-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';
/**
 * Factory function to create providers based on configuration
 */
export function createProvider(type, config) {
    switch (type.toLowerCase()) {
        case 'ollama':
            return new OllamaProvider(config);
        case 'openai':
            return new OpenAIProvider(config);
        case 'anthropic':
            return new AnthropicProvider(config);
        default:
            throw new Error(`Unknown provider type: ${type}`);
    }
}
/**
 * Get list of available provider types
 */
export function getAvailableProviderTypes() {
    return ['ollama', 'openai', 'anthropic'];
}
/**
 * Validate provider configuration
 */
export function validateProviderConfig(type, config) {
    // Basic validation - in production this would be more comprehensive
    if (!config.name)
        return false;
    switch (type.toLowerCase()) {
        case 'ollama':
            // Ollama requires baseUrl
            return !!config.baseUrl;
        case 'openai':
            // OpenAI requires API key
            return !!(config.apiKey || process.env.OPENAI_API_KEY);
        case 'anthropic':
            // Anthropic requires API key
            return !!(config.apiKey || process.env.ANTHROPIC_API_KEY);
        default:
            return false;
    }
}
//# sourceMappingURL=index.js.map