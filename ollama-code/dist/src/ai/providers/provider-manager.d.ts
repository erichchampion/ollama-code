/**
 * Provider Manager
 *
 * Manages AI provider configuration, credentials, lifecycle, usage tracking,
 * and performance monitoring across all provider implementations.
 */
import { EventEmitter } from 'events';
import { BaseAIProvider, ProviderConfig } from './base-provider.js';
export interface ProviderCredentials {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    organizationId?: string;
    region?: string;
    endpoint?: string;
    encryptedData?: string;
    createdAt: Date;
    lastUpdated: Date;
    expiresAt?: Date;
}
export interface ProviderUsageStats {
    providerId: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokensUsed: number;
    totalCost: number;
    averageResponseTime: number;
    lastUsed: Date;
    dailyUsage: Map<string, number>;
    monthlyUsage: Map<string, number>;
}
export interface ProviderPerformanceMetrics {
    providerId: string;
    responseTime: {
        min: number;
        max: number;
        avg: number;
        p95: number;
        p99: number;
    };
    successRate: number;
    errorRate: number;
    throughput: number;
    availability: number;
    lastHealthCheck: Date;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}
export interface ProviderBudget {
    providerId: string;
    dailyLimit: number;
    monthlyLimit: number;
    requestLimit: number;
    tokenLimit: number;
    alertThresholds: {
        cost: number;
        requests: number;
        tokens: number;
    };
}
export interface ProviderManagerConfig {
    credentialsPath?: string;
    encryptionEnabled?: boolean;
    usageTrackingEnabled?: boolean;
    performanceMonitoringEnabled?: boolean;
    healthCheckInterval?: number;
    budgetEnforcementEnabled?: boolean;
    defaultProvider?: string;
    fallbackChain?: string[];
}
export declare class ProviderManager extends EventEmitter {
    private providers;
    private configurations;
    private credentials;
    private usageStats;
    private performanceMetrics;
    private budgets;
    private config;
    private credentialsPath;
    private encryptionKey?;
    private healthCheckInterval?;
    constructor(config?: ProviderManagerConfig);
    /**
     * Initialize encryption system
     */
    private initializeEncryption;
    /**
     * Load or create encryption key
     */
    private loadOrCreateEncryptionKey;
    /**
     * Encrypt sensitive data using AES-256-GCM for authenticated encryption
     */
    private encrypt;
    /**
     * Decrypt sensitive data using AES-256-GCM with authentication verification
     */
    private decrypt;
    /**
     * Register a new provider
     */
    registerProvider(id: string, type: string, config: ProviderConfig, credentials?: ProviderCredentials): Promise<void>;
    /**
     * Unregister a provider
     */
    unregisterProvider(id: string): Promise<void>;
    /**
     * Get provider instance
     */
    getProvider(id: string): BaseAIProvider | undefined;
    /**
     * Get all registered provider IDs
     */
    getProviderIds(): string[];
    /**
     * Get provider configuration
     */
    getProviderConfig(id: string): ProviderConfig | undefined;
    /**
     * Store credentials securely
     */
    storeCredentials(id: string, credentials: ProviderCredentials): Promise<void>;
    /**
     * Get credentials for provider
     */
    getCredentials(id: string): ProviderCredentials | undefined;
    /**
     * Track usage for a provider
     */
    trackUsage(id: string, success: boolean, tokensUsed: number, responseTime: number, cost?: number): void;
    /**
     * Get usage statistics for a provider
     */
    getUsageStats(id: string): ProviderUsageStats | undefined;
    /**
     * Set budget for a provider
     */
    setBudget(id: string, budget: Omit<ProviderBudget, 'providerId'>): void;
    /**
     * Check budget limits
     */
    private checkBudgetLimits;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Perform health checks on all providers
     */
    private performHealthChecks;
    /**
     * Get performance metrics for a provider
     */
    getPerformanceMetrics(id: string): ProviderPerformanceMetrics | undefined;
    /**
     * Save configuration to disk
     */
    private saveConfiguration;
    /**
     * Save credentials to disk
     */
    private saveCredentials;
    /**
     * Load configuration from disk
     */
    loadConfiguration(): Promise<void>;
    /**
     * Load credentials from disk
     */
    loadCredentials(): Promise<void>;
    /**
     * Initialize the provider manager
     */
    initialize(): Promise<void>;
    /**
     * Dispose of the provider manager
     */
    dispose(): Promise<void>;
}
