/**
 * Universal CI/CD API
 *
 * Provides a unified interface for CI/CD pipeline integration across
 * multiple platforms with intelligent detection and platform-specific
 * optimizations.
 */
export interface UniversalCIConfig {
    repositoryPath: string;
    platform?: CI_PLATFORM;
    autoDetect?: boolean;
    enableSecurityAnalysis?: boolean;
    enablePerformanceAnalysis?: boolean;
    enableArchitecturalAnalysis?: boolean;
    enableRegressionAnalysis?: boolean;
    qualityGates?: {
        minQualityScore?: number;
        maxCriticalIssues?: number;
        maxSecurityIssues?: number;
        maxPerformanceIssues?: number;
        minTestCoverage?: number;
        regressionThreshold?: 'low' | 'medium' | 'high';
    };
    reportFormat?: 'json' | 'markdown' | 'junit' | 'sarif' | 'html';
    outputPath?: string;
    notifications?: {
        enableComments?: boolean;
        enableSlack?: boolean;
        enableEmail?: boolean;
        webhookUrls?: string[];
    };
}
export type CI_PLATFORM = 'github' | 'gitlab' | 'azure' | 'bitbucket' | 'circleci' | 'jenkins' | 'travis' | 'appveyor' | 'custom';
export interface PlatformCapabilities {
    supportsComments: boolean;
    supportsArtifacts: boolean;
    supportsSARIF: boolean;
    supportsQualityGates: boolean;
    supportsParallelExecution: boolean;
    supportsSecrets: boolean;
    supportsEnvironments: boolean;
    maxConcurrentJobs: number;
    timeoutLimits: {
        perJob: number;
        total: number;
    };
}
export interface ConfigurationTemplate {
    filename: string;
    content: string;
    description: string;
    requiredSecrets?: string[];
    optionalSecrets?: string[];
    prerequisites?: string[];
}
export declare class UniversalCIAPI {
    private config;
    private detectedPlatform?;
    private capabilities?;
    constructor(config: UniversalCIConfig);
    /**
     * Initialize the API and detect platform if enabled
     */
    initialize(): Promise<void>;
    /**
     * Auto-detect the CI/CD platform based on environment and files
     */
    detectPlatform(): Promise<CI_PLATFORM>;
    /**
     * Detect platform via configuration files
     */
    private detectPlatformViaFiles;
    /**
     * Detect platform via directory indicators
     */
    private detectPlatformViaIndicators;
    /**
     * Get platform capabilities
     */
    getPlatformCapabilities(): PlatformCapabilities | undefined;
    /**
     * Get detected or configured platform
     */
    getPlatform(): CI_PLATFORM | undefined;
    /**
     * Execute analysis using the appropriate CI pipeline integrator
     */
    executeAnalysis(): Promise<any>;
    /**
     * Generate platform-specific configuration template
     */
    generateConfigurationTemplate(): Promise<ConfigurationTemplate>;
    /**
     * Optimize configuration for the detected platform
     */
    optimizeForPlatform(): UniversalCIConfig;
    /**
     * Validate configuration against platform capabilities
     */
    validateConfiguration(): {
        valid: boolean;
        warnings: string[];
        errors: string[];
    };
    /**
     * Create CI pipeline configuration from universal config
     */
    private createCIPipelineConfig;
    /**
     * Generate GitHub Actions template
     */
    private generateGitHubTemplate;
    /**
     * Generate GitLab CI template
     */
    private generateGitLabTemplate;
    /**
     * Generate Azure DevOps template
     */
    private generateAzureTemplate;
    /**
     * Generate Bitbucket Pipelines template
     */
    private generateBitbucketTemplate;
    /**
     * Generate CircleCI template
     */
    private generateCircleCITemplate;
    /**
     * Generate Jenkins template
     */
    private generateJenkinsTemplate;
    /**
     * Generate custom template
     */
    private generateCustomTemplate;
    /**
     * Get platform-specific documentation
     */
    getPlatformDocumentation(): string;
}
export default UniversalCIAPI;
