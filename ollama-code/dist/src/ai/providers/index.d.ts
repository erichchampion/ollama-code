/**
 * AI Providers Module
 *
 * Exports all AI provider implementations and the intelligent router
 * for multi-provider AI integration with intelligent routing capabilities.
 */
export * from './base-provider.js';
export { OllamaProvider } from './ollama-provider.js';
export { OpenAIProvider } from './openai-provider.js';
export { AnthropicProvider } from './anthropic-provider.js';
export { IntelligentAIRouter } from './intelligent-router.js';
export type { RoutingStrategy, RoutingContext, RoutingDecision, RouterConfig, RouterMetrics } from './intelligent-router.js';
import { BaseAIProvider, ProviderConfig } from './base-provider.js';
/**
 * Factory function to create providers based on configuration
 */
export declare function createProvider(type: string, config: ProviderConfig): BaseAIProvider;
/**
 * Get list of available provider types
 */
export declare function getAvailableProviderTypes(): string[];
/**
 * Validate provider configuration
 */
export declare function validateProviderConfig(type: string, config: ProviderConfig): boolean;
