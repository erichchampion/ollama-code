/**
 * CI/CD Template Generator
 *
 * Generates platform-specific CI/CD configurations from shared templates
 * to eliminate code duplication and ensure consistency across platforms.
 */
export interface CITemplateConfig {
    platform: 'github' | 'gitlab' | 'azure' | 'bitbucket' | 'circleci' | 'jenkins';
    branches?: string[];
    enableParallel?: boolean;
    enableCaching?: boolean;
    enableArtifacts?: boolean;
    enableSchedule?: boolean;
    customConfig?: Record<string, any>;
}
/**
 * Platform-specific template generators
 */
export declare class CITemplateGenerator {
    private config;
    private baseTemplate;
    constructor(config: CITemplateConfig);
    /**
     * Create base template with shared commands
     */
    private createBaseTemplate;
    /**
     * Generate configuration for specific platform
     */
    generate(): string;
    /**
     * Generate GitHub Actions workflow
     */
    private generateGitHubActions;
    /**
     * Generate GitLab CI configuration
     */
    private generateGitLabCI;
    /**
     * Generate Azure DevOps pipeline
     */
    private generateAzureDevOps;
    /**
     * Generate BitBucket Pipelines configuration
     */
    private generateBitbucketPipelines;
    /**
     * Generate CircleCI configuration
     */
    private generateCircleCI;
    /**
     * Generate Jenkins pipeline
     */
    private generateJenkins;
    /**
     * Get environment variables for CI configuration
     */
    private getEnvironmentVariables;
}
/**
 * Generate CI configuration for a specific platform
 */
export declare function generateCIConfig(platform: CITemplateConfig['platform'], options?: Partial<CITemplateConfig>): string;
export default CITemplateGenerator;
