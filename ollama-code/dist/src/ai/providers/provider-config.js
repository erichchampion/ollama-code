/**
 * Centralized Provider Configuration
 *
 * Centralizes all hardcoded values from the provider system into a single
 * configurable location, following the DRY principle.
 */
import { RETRY_CONSTANTS, TIMEOUT_CONSTANTS } from '../../config/constants.js';
// Default configuration values
export const DEFAULT_PROVIDER_CONFIG = {
    cache: {
        defaultTtl: 300000, // 5 minutes
        maxSize: 1000,
        cleanupInterval: 60000, // 1 minute
        compressionThreshold: 1024, // 1KB
        retentionPeriod: 86400000, // 24 hours
    },
    budget: {
        defaultLimit: 100.0, // $100
        alertThresholds: {
            warning: 0.8, // 80%
            critical: 0.95, // 95%
        },
        refreshInterval: 3600000, // 1 hour
        gracePeriod: 600000, // 10 minutes
    },
    abTesting: {
        defaultConfidenceLevel: 0.95, // 95%
        minSampleSize: 30,
        maxTestDuration: 30, // 30 days
        effectSizeThreshold: 0.2,
        hashNormalizationFactor: 4294967296, // 2^32
    },
    performance: {
        metricsRetention: 30, // 30 days
        aggregationInterval: 60, // 1 minute
        alertLatencyThreshold: 5000, // 5 seconds
        alertErrorRateThreshold: 5, // 5%
    },
    security: {
        encryptionAlgorithm: 'aes-256-gcm',
        keyRotationInterval: 90, // 90 days
        sessionTimeout: 30, // 30 minutes
        maxRetryAttempts: 3,
    },
    responseProcessing: {
        maxResponseSize: 10485760, // 10MB
        timeoutMs: TIMEOUT_CONSTANTS.MEDIUM,
        retryDelayMs: RETRY_CONSTANTS.BASE_RETRY_DELAY,
        maxRetries: RETRY_CONSTANTS.DEFAULT_MAX_RETRIES,
    },
    providers: {
        maxConcurrent: 10,
        healthCheckInterval: 30, // 30 seconds
        failureThreshold: 5,
        recoveryTime: 300, // 5 minutes
    },
};
/**
 * Configuration Manager
 */
export class ProviderConfigManager {
    static instance;
    config;
    constructor() {
        this.config = { ...DEFAULT_PROVIDER_CONFIG };
    }
    static getInstance() {
        if (!ProviderConfigManager.instance) {
            ProviderConfigManager.instance = new ProviderConfigManager();
        }
        return ProviderConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    updateConfig(updates) {
        this.config = this.mergeConfig(this.config, updates);
    }
    getCacheConfig() {
        return this.config.cache;
    }
    getBudgetConfig() {
        return this.config.budget;
    }
    getABTestingConfig() {
        return this.config.abTesting;
    }
    getPerformanceConfig() {
        return this.config.performance;
    }
    getSecurityConfig() {
        return this.config.security;
    }
    getResponseProcessingConfig() {
        return this.config.responseProcessing;
    }
    getProviderConfig() {
        return this.config.providers;
    }
    mergeConfig(current, updates) {
        const merged = { ...current };
        for (const [key, value] of Object.entries(updates)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                merged[key] = {
                    ...merged[key],
                    ...value
                };
            }
            else {
                merged[key] = value;
            }
        }
        return merged;
    }
}
// Export singleton instance
export const providerConfig = ProviderConfigManager.getInstance();
//# sourceMappingURL=provider-config.js.map