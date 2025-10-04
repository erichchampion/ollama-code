/**
 * CI/CD Pipeline Integration
 *
 * Automated pipeline integration with AI insights and quality gates
 * for comprehensive analysis in CI/CD environments.
 */
export interface CIPipelineConfig {
    repositoryPath: string;
    platform: 'github' | 'gitlab' | 'azure' | 'bitbucket' | 'circleci' | 'jenkins';
    enableSecurityAnalysis: boolean;
    enablePerformanceAnalysis: boolean;
    enableArchitecturalAnalysis: boolean;
    enableRegressionAnalysis: boolean;
    enableQualityGates: boolean;
    analysisTimeout: number;
    reportFormat: 'json' | 'junit' | 'sarif' | 'markdown' | 'html';
    outputPath: string;
    qualityGates: QualityGateConfig;
    notifications: NotificationConfig;
}
export interface QualityGateConfig {
    minQualityScore: number;
    maxCriticalIssues: number;
    maxSecurityIssues: number;
    maxPerformanceIssues: number;
    minTestCoverage: number;
    maxComplexityIncrease: number;
    maxTechnicalDebtIncrease: number;
    regressionThreshold: 'low' | 'medium' | 'high';
    blockOnFailure: boolean;
}
export interface NotificationConfig {
    enableSlack: boolean;
    enableEmail: boolean;
    enableGitHubComments: boolean;
    enableMergeRequestComments: boolean;
    webhookUrls: string[];
    emailRecipients: string[];
}
export interface PipelineAnalysisResult {
    success: boolean;
    qualityGatePassed: boolean;
    overallScore: number;
    executionTime: number;
    timestamp: Date;
    results: {
        security?: SecurityAnalysisResult;
        performance?: PerformanceAnalysisResult;
        architecture?: ArchitecturalAnalysisResult;
        regression?: RegressionAnalysisResult;
        quality?: QualityAnalysisResult;
    };
    qualityGateResults: QualityGateResult[];
    recommendations: string[];
    reportUrls: string[];
}
export interface SecurityAnalysisResult {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    newVulnerabilities: number;
    fixedVulnerabilities: number;
    vulnerabilityTrend: 'improving' | 'stable' | 'degrading';
}
export interface PerformanceAnalysisResult {
    totalIssues: number;
    criticalIssues: number;
    complexityScore: number;
    complexityIncrease: number;
    memoryLeaks: number;
    performanceRegressions: number;
    optimizationOpportunities: string[];
}
export interface ArchitecturalAnalysisResult {
    designPatterns: string[];
    codeSmells: number;
    architecturalViolations: number;
    maintainabilityScore: number;
    technicalDebtHours: number;
    refactoringRecommendations: string[];
}
export interface RegressionAnalysisResult {
    overallRisk: 'low' | 'medium' | 'high';
    bugRisk: number;
    performanceRisk: number;
    securityRisk: number;
    riskFactors: string[];
    mitigation: string[];
}
export interface QualityAnalysisResult {
    overallScore: number;
    codeQuality: number;
    testCoverage: number;
    documentation: number;
    maintainability: number;
    qualityTrend: 'improving' | 'stable' | 'degrading';
}
export interface QualityGateResult {
    name: string;
    status: 'passed' | 'failed' | 'warning';
    actualValue: number;
    expectedValue: number;
    message: string;
}
export declare class CIPipelineIntegrator {
    private config;
    private vcsIntelligence;
    private securityAnalyzer;
    private performanceAnalyzer;
    private architecturalAnalyzer;
    private qualityTracker;
    private regressionAnalyzer;
    constructor(config: CIPipelineConfig);
    /**
     * Execute comprehensive CI/CD analysis
     */
    executeAnalysis(): Promise<PipelineAnalysisResult>;
    /**
     * Run security analysis
     */
    private runSecurityAnalysis;
    /**
     * Run performance analysis
     */
    private runPerformanceAnalysis;
    /**
     * Run architectural analysis
     */
    private runArchitecturalAnalysis;
    /**
     * Run regression analysis
     */
    private runRegressionAnalysis;
    /**
     * Run quality analysis
     */
    private runQualityAnalysis;
    /**
     * Calculate overall score from all analysis results
     */
    private calculateOverallScore;
    /**
     * Evaluate quality gates
     */
    private evaluateQualityGates;
    /**
     * Generate recommendations based on analysis results
     */
    private generateRecommendations;
    /**
     * Generate and save analysis reports
     */
    private generateReports;
    /**
     * Generate markdown report
     */
    private generateMarkdownReport;
    /**
     * Generate JUnit XML report
     */
    private generateJUnitReport;
    /**
     * Send notifications about analysis results
     */
    private sendNotifications;
    /**
     * Generate notification message
     */
    private generateNotificationMessage;
    /**
     * Get source files for analysis
     */
    private getSourceFiles;
}
/**
 * Default CI pipeline configuration
 */
export declare const DEFAULT_CI_PIPELINE_CONFIG: Partial<CIPipelineConfig>;
