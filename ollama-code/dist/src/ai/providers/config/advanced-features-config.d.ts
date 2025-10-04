/**
 * Advanced AI Provider Features Configuration
 *
 * Centralizes all configuration values for fine-tuning, deployment, and fusion
 * to eliminate hardcoded values and provide environment-specific defaults.
 */
export interface FineTuningDefaultConfig {
    qualityThresholds: {
        lowSampleCount: number;
        mediumSampleCount: number;
    };
    defaultConfig: {
        epochs: number;
        learningRate: number;
        batchSize: number;
        validationSplit: number;
        maxSequenceLength: number;
        temperature: number;
        dropout: number;
        gradientClipping: number;
        weightDecay: number;
        warmupSteps: number;
        saveSteps: number;
        evaluationSteps: number;
        earlyStopping: {
            enabled: boolean;
            patience: number;
            minDelta: number;
        };
        quantization: {
            enabled: boolean;
            type: 'int8' | 'int4' | 'float16';
        };
        lora: {
            enabled: boolean;
            rank: number;
            alpha: number;
            dropout: number;
        };
    };
    simulation: {
        durationMs: number;
        updateIntervalMs: number;
        outputModelSizeMB: number;
        serverStartupDelayMs: number;
    };
    providers: {
        contextWindow: number;
        rateLimits: {
            requestsPerMinute: number;
            tokensPerMinute: number;
        };
        mockResponse: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    };
    processing: {
        contextLines: number;
        chunkSize: number;
        streamingDelayMs: number;
        complexityThresholds: {
            moderateLines: number;
            complexLines: number;
        };
        qualityThresholds: {
            minCommentLength: number;
            maxTopImports: number;
        };
        mockMetrics: {
            baseAccuracy: number;
            accuracyVariance: number;
            basePerplexity: number;
            perplexityVariance: number;
            defaultQualityScore: number;
        };
    };
}
export interface DeploymentDefaultConfig {
    ports: {
        minPort: number;
        maxPort: number;
        defaultRangeSize: number;
    };
    resources: {
        maxMemoryMB: number;
        maxCpuCores: number;
        diskSpaceGB: number;
    };
    scaling: {
        minInstances: number;
        maxInstances: number;
        targetConcurrency: number;
        scaleUpThreshold: number;
        scaleDownThreshold: number;
    };
    networking: {
        host: string;
        ssl: {
            enabled: boolean;
        };
        cors: {
            enabled: boolean;
        };
    };
    health: {
        checkIntervalMs: number;
        timeoutMs: number;
        retries: number;
        warmupTimeMs: number;
    };
    monitoring: {
        metricsEnabled: boolean;
        loggingLevel: 'debug' | 'info' | 'warn' | 'error';
        retentionDays: number;
    };
    simulation: {
        serverStartupDelayMs: number;
        healthCheckStatusCode: number;
    };
}
export interface FusionDefaultConfig {
    timeouts: {
        defaultTimeoutMs: number;
        requestTimeoutMs: number;
    };
    quality: {
        contentLengthMin: number;
        contentLengthMax: number;
        lengthBonusThreshold: number;
        lengthBonusValue: number;
    };
    response: {
        maxResponseLength: number;
    };
    validation: {
        minConfidenceThreshold: number;
        baseQualityScore: number;
        fastResponseThresholdMs: number;
        validConfidenceFloor: number;
        invalidConfidenceScore: number;
        varianceThreshold: number;
    };
    diversity: {
        lengthWeight: number;
        vocabularyWeight: number;
        providerWeight: number;
    };
    caching: {
        enabled: boolean;
        defaultTTLMs: number;
    };
    strategies: {
        consensus_voting: {
            minProviders: number;
            maxProviders: number;
            weightingScheme: 'quality_based';
            validationRequired: boolean;
            synthesisMethod: 'voting';
        };
        expert_ensemble: {
            minProviders: number;
            maxProviders: number;
            weightingScheme: 'expert_based';
            validationRequired: boolean;
            synthesisMethod: 'weighted_average';
        };
        diverse_perspectives: {
            minProviders: number;
            maxProviders: number;
            weightingScheme: 'equal';
            validationRequired: boolean;
            synthesisMethod: 'merging';
        };
        quality_ranking: {
            minProviders: number;
            maxProviders: number;
            weightingScheme: 'quality_based';
            validationRequired: boolean;
            synthesisMethod: 'ranking';
        };
        llm_synthesis: {
            minProviders: number;
            maxProviders: number;
            weightingScheme: 'dynamic';
            validationRequired: boolean;
            synthesisMethod: 'llm_synthesis';
        };
    };
}
/**
 * Default configuration for fine-tuning features
 */
export declare const FINE_TUNING_CONFIG: FineTuningDefaultConfig;
/**
 * Default configuration for deployment features
 */
export declare const DEPLOYMENT_CONFIG: DeploymentDefaultConfig;
/**
 * Default configuration for response fusion features
 */
export declare const FUSION_CONFIG: FusionDefaultConfig;
/**
 * Expert weights for different providers in fusion scenarios
 */
export declare const PROVIDER_EXPERT_WEIGHTS: Record<string, number>;
/**
 * Get environment-specific configuration overrides
 */
export declare function getEnvironmentConfig(): Partial<FineTuningDefaultConfig & DeploymentDefaultConfig & FusionDefaultConfig>;
/**
 * Merge configuration with environment overrides
 */
export declare function getMergedConfig<T>(baseConfig: T): T;
