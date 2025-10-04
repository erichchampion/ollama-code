/**
 * System Configuration Management
 *
 * Centralizes all configuration values to eliminate hardcoded constants
 * throughout the system and provide consistent configuration management.
 */
export interface AIConfiguration {
    commandConfidenceThreshold: number;
    taskConfidenceThreshold: number;
    healthCheckInterval: number;
    temperature: number;
    maxTokens: number;
    requestTimeout: number;
}
export interface VCSConfiguration {
    cacheExpiry: number;
    analysisDepth: number;
    riskThresholds: {
        taskCountHigh: number;
        taskCountMedium: number;
        durationHigh: number;
        durationMedium: number;
        changeCountCritical: number;
        changeCountHigh: number;
        authorCountMultiple: number;
        riskMultiplierSingle: number;
        riskMultiplierMultiple: number;
        riskMultiplierHigh: number;
    };
    qualityThresholds: {
        testCoverageGood: number;
        duplicationHigh: number;
        fileSizeThresholds: {
            large: number;
            medium: number;
            small: number;
        };
        lineChangeThresholds: {
            small: number;
            large: number;
        };
        complexityPenalties: {
            high: number;
            medium: number;
            low: number;
        };
    };
    patternAnalysis: {
        monthsForEstimate: number;
        changeFrequencyMultiplier: number;
        bugPronenessMultiplier: number;
        stabilityMultiplier: number;
    };
    timeConstants: {
        dayInMs: number;
        weekInMs: number;
        monthInMs: number;
        trendAnalysisDays: number;
    };
}
export interface IntentAnalysisConfiguration {
    complexityThresholds: {
        shortMessageLength: number;
        longMessageLength: number;
    };
    entityCountThresholds: {
        fileCountHigh: number;
        functionCountHigh: number;
        conceptCountHigh: number;
    };
    durationEstimates: {
        simple: number;
        moderate: number;
        complex: number;
        expert: number;
    };
    confidenceThresholds: {
        highConfidence: number;
        mediumConfidence: number;
    };
    contextLimits: {
        maxProjectFiles: number;
        maxConversationHistory: number;
        maxRecentFiles: number;
    };
}
export interface SessionConfiguration {
    maxConversationHistory: number;
    autoSaveConversations: boolean;
    cacheExpiry: number;
    maxFileSize: number;
    maxOutputSize: number;
}
export interface TaskPlanConfiguration {
    executionThresholds: {
        lowRiskTaskCount: number;
        lowRiskDuration: number;
        highRiskTaskCount: number;
        highRiskDuration: number;
    };
    fileDiscoveryLimits: {
        maxFiles: number;
        maxFileSize: number;
    };
    promptLimits: {
        maxPromptFiles: number;
        maxContextFiles: number;
    };
}
export interface PerformanceConfiguration {
    timeouts: {
        aiAnalysis: number;
        commandExecution: number;
        fileOperation: number;
    };
    cacheTTL: {
        analysis: number;
        diagnostics: number;
        metrics: number;
    };
    limits: {
        maxFileAnalysisSize: number;
        maxConcurrentOperations: number;
        maxMemoryUsage: number;
    };
}
export interface SystemConfiguration {
    ai: AIConfiguration;
    vcs: VCSConfiguration;
    intentAnalysis: IntentAnalysisConfiguration;
    session: SessionConfiguration;
    taskPlan: TaskPlanConfiguration;
    performance: PerformanceConfiguration;
}
/**
 * Default system configuration
 */
export declare const DEFAULT_SYSTEM_CONFIG: SystemConfiguration;
/**
 * Configuration Manager
 */
export declare class SystemConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): SystemConfigManager;
    /**
     * Get the complete configuration
     */
    getConfig(): SystemConfiguration;
    /**
     * Get AI configuration
     */
    getAIConfig(): AIConfiguration;
    /**
     * Get VCS configuration
     */
    getVCSConfig(): VCSConfiguration;
    /**
     * Get intent analysis configuration
     */
    getIntentAnalysisConfig(): IntentAnalysisConfiguration;
    /**
     * Get session configuration
     */
    getSessionConfig(): SessionConfiguration;
    /**
     * Get task plan configuration
     */
    getTaskPlanConfig(): TaskPlanConfiguration;
    /**
     * Get performance configuration
     */
    getPerformanceConfig(): PerformanceConfiguration;
    /**
     * Update configuration section
     */
    updateConfig<K extends keyof SystemConfiguration>(section: K, updates: Partial<SystemConfiguration[K]>): void;
    /**
     * Reset to default configuration
     */
    resetToDefaults(): void;
    /**
     * Load configuration from environment variables
     */
    loadFromEnvironment(): void;
    /**
     * Validate configuration
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Convenience function to get configuration manager instance
 */
export declare function getSystemConfig(): SystemConfigManager;
