/**
 * Feature Flags System for Gradual Rollout
 *
 * Provides a centralized system for managing feature flags to enable/disable
 * performance optimizations and new features for gradual rollout.
 */
export interface FeatureFlag {
    name: string;
    description: string;
    enabled: boolean;
    category: 'performance' | 'experimental' | 'beta' | 'stable';
    rolloutPercentage?: number;
    enabledForUsers?: string[];
    metadata?: Record<string, any>;
}
export interface FeatureFlagsConfig {
    flags: Map<string, FeatureFlag>;
    globalOverride?: boolean;
    userOverrides?: Map<string, Map<string, boolean>>;
}
/**
 * Feature Flags Manager
 */
export declare class FeatureFlagsManager {
    private static instance;
    private config;
    private configPath;
    private userId?;
    private constructor();
    static getInstance(): FeatureFlagsManager;
    private getConfigPath;
    private loadConfiguration;
    private saveConfiguration;
    private initializeDefaultFlags;
    /**
     * Register a new feature flag
     */
    registerFlag(flag: FeatureFlag): void;
    /**
     * Check if a feature flag is enabled
     */
    isEnabled(flagName: string): boolean;
    /**
     * Enable a feature flag
     */
    enableFlag(flagName: string, rolloutPercentage?: number): void;
    /**
     * Disable a feature flag
     */
    disableFlag(flagName: string): void;
    /**
     * Set user ID for user-specific feature flags
     */
    setUserId(userId: string): void;
    /**
     * Get all feature flags
     */
    getAllFlags(): FeatureFlag[];
    /**
     * Get enabled feature flags
     */
    getEnabledFlags(): string[];
    /**
     * Set rollout percentage for gradual rollout
     */
    setRolloutPercentage(flagName: string, percentage: number): void;
    /**
     * Enable flag for specific users
     */
    enableForUsers(flagName: string, userIds: string[]): void;
    /**
     * Set user-specific override
     */
    setUserOverride(userId: string, flagName: string, enabled: boolean): void;
    /**
     * Get feature flag status report
     */
    getStatusReport(): string;
    /**
     * Reset all flags to defaults
     */
    resetToDefaults(): void;
    private hashUserId;
}
export declare const featureFlags: FeatureFlagsManager;
export declare function isFeatureEnabled(flagName: string): boolean;
export declare function FeatureFlagged(flagName: string, fallback?: Function): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
