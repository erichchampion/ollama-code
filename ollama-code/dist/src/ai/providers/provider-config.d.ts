/**
 * Centralized Provider Configuration
 *
 * Centralizes all hardcoded values from the provider system into a single
 * configurable location, following the DRY principle.
 */
export interface ProviderConfig {
    cache: {
        defaultTtl: number;
        maxSize: number;
        cleanupInterval: number;
        compressionThreshold: number;
        retentionPeriod: number;
    };
    budget: {
        defaultLimit: number;
        alertThresholds: {
            warning: number;
            critical: number;
        };
        refreshInterval: number;
        gracePeriod: number;
    };
    abTesting: {
        defaultConfidenceLevel: number;
        minSampleSize: number;
        maxTestDuration: number;
        effectSizeThreshold: number;
        hashNormalizationFactor: number;
    };
    performance: {
        metricsRetention: number;
        aggregationInterval: number;
        alertLatencyThreshold: number;
        alertErrorRateThreshold: number;
    };
    security: {
        encryptionAlgorithm: string;
        keyRotationInterval: number;
        sessionTimeout: number;
        maxRetryAttempts: number;
    };
    responseProcessing: {
        maxResponseSize: number;
        timeoutMs: number;
        retryDelayMs: number;
        maxRetries: number;
    };
    providers: {
        maxConcurrent: number;
        healthCheckInterval: number;
        failureThreshold: number;
        recoveryTime: number;
    };
}
export declare const DEFAULT_PROVIDER_CONFIG: ProviderConfig;
/**
 * Configuration Manager
 */
export declare class ProviderConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ProviderConfigManager;
    getConfig(): ProviderConfig;
    updateConfig(updates: Partial<ProviderConfig>): void;
    getCacheConfig(): {
        defaultTtl: number;
        maxSize: number;
        cleanupInterval: number;
        compressionThreshold: number;
        retentionPeriod: number;
    };
    getBudgetConfig(): {
        defaultLimit: number;
        alertThresholds: {
            warning: number;
            critical: number;
        };
        refreshInterval: number;
        gracePeriod: number;
    };
    getABTestingConfig(): {
        defaultConfidenceLevel: number;
        minSampleSize: number;
        maxTestDuration: number;
        effectSizeThreshold: number;
        hashNormalizationFactor: number;
    };
    getPerformanceConfig(): {
        metricsRetention: number;
        aggregationInterval: number;
        alertLatencyThreshold: number;
        alertErrorRateThreshold: number;
    };
    getSecurityConfig(): {
        encryptionAlgorithm: string;
        keyRotationInterval: number;
        sessionTimeout: number;
        maxRetryAttempts: number;
    };
    getResponseProcessingConfig(): {
        maxResponseSize: number;
        timeoutMs: number;
        retryDelayMs: number;
        maxRetries: number;
    };
    getProviderConfig(): {
        maxConcurrent: number;
        healthCheckInterval: number;
        failureThreshold: number;
        recoveryTime: number;
    };
    private mergeConfig;
}
export declare const providerConfig: ProviderConfigManager;
