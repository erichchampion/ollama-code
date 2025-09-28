/**
 * Response Fusion System
 *
 * Combines responses from multiple AI providers to generate enhanced,
 * more accurate, and comprehensive answers through intelligent aggregation,
 * validation, and synthesis.
 */
import { EventEmitter } from 'events';
import { BaseAIProvider, AICompletionResponse, AICompletionOptions, AIMessage } from './base-provider.js';
export interface FusionStrategy {
    name: string;
    description: string;
    minProviders: number;
    maxProviders: number;
    weightingScheme: 'equal' | 'quality_based' | 'consensus' | 'expert_based' | 'dynamic';
    validationRequired: boolean;
    synthesisMethod: 'voting' | 'merging' | 'ranking' | 'weighted_average' | 'llm_synthesis';
}
export interface ProviderResponse {
    providerId: string;
    providerName: string;
    response: AICompletionResponse;
    weight: number;
    confidence: number;
    qualityScore: number;
    latency: number;
    error?: Error;
}
export interface FusionRequest {
    id: string;
    prompt: string | AIMessage[];
    options: AICompletionOptions;
    strategy: FusionStrategy;
    providers: string[];
    timeout: number;
    requireMinimum: number;
    createdAt: Date;
}
export interface FusionResult {
    requestId: string;
    prompt: string | AIMessage[];
    strategy: FusionStrategy;
    providerResponses: ProviderResponse[];
    fusedResponse: {
        content: string;
        confidence: number;
        qualityScore: number;
        consensus: number;
        diversity: number;
        reliability: number;
    };
    metadata: {
        totalProviders: number;
        successfulProviders: number;
        failedProviders: number;
        averageLatency: number;
        fusionTime: number;
        cacheable: boolean;
    };
    analysis: {
        agreementLevel: number;
        conflictPoints: string[];
        strengthsByProvider: Record<string, string[]>;
        recommendedFollowups: string[];
    };
    completedAt: Date;
}
export interface ValidationResult {
    isValid: boolean;
    confidence: number;
    issues: Array<{
        type: 'factual' | 'logical' | 'consistency' | 'completeness' | 'relevance';
        severity: 'low' | 'medium' | 'high';
        description: string;
        affectedProviders: string[];
    }>;
    suggestions: string[];
}
export interface SynthesisConfig {
    preserveMultiplePerspectives: boolean;
    prioritizeAccuracy: boolean;
    includeUncertainty: boolean;
    maxResponseLength: number;
    includeSourceAttribution: boolean;
    conflictResolutionStrategy: 'majority_vote' | 'expert_preference' | 'highest_confidence' | 'human_review';
}
export declare class ResponseFusionEngine extends EventEmitter {
    private providers;
    private strategies;
    private activeRequests;
    private responseCache;
    private validationEngine;
    private synthesisEngine;
    constructor();
    /**
     * Register an AI provider for fusion
     */
    registerProvider(provider: BaseAIProvider): void;
    /**
     * Unregister a provider
     */
    unregisterProvider(providerId: string): void;
    /**
     * Execute fusion request with multiple providers
     */
    fusedComplete(prompt: string | AIMessage[], options?: AICompletionOptions, fusionOptions?: {
        strategy?: string;
        providers?: string[];
        timeout?: number;
        requireMinimum?: number;
        synthesisConfig?: Partial<SynthesisConfig>;
    }): Promise<FusionResult>;
    /**
     * Get available fusion strategies
     */
    getStrategies(): FusionStrategy[];
    /**
     * Get registered providers
     */
    getProviders(): string[];
    /**
     * Get active requests
     */
    getActiveRequests(): FusionRequest[];
    /**
     * Cancel an active request
     */
    cancelRequest(requestId: string): boolean;
    /**
     * Clear response cache
     */
    clearCache(): void;
    /**
     * Private methods
     */
    private initializeStrategies;
    private executeParallelRequests;
    private validateResponses;
    private filterAndWeightResponses;
    private analyzeResponses;
    private generateCacheKey;
    private createTimeoutPromise;
    private createErrorResponse;
    private calculateQualityScore;
    private calculateConfidence;
    private getExpertWeight;
    private calculateConsensusWeight;
    private calculateDynamicWeight;
    private calculateAverageLatency;
    private isCacheable;
    private calculateAgreementLevel;
    private identifyConflictPoints;
    private identifyProviderStrengths;
    private generateFollowupSuggestions;
    private areStatementsConflicting;
    private calculateNumericalVariance;
    private extractMainTopic;
    private isStopWord;
}
