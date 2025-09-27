/**
 * VCS Integration Module
 *
 * Comprehensive version control system integration with AI-powered
 * intelligence for git repositories. Provides automated analysis,
 * commit message generation, code review, and quality tracking.
 */
import { VCSIntelligence } from './vcs-intelligence.js';
import { CommitMessageGenerator } from './commit-message-generator.js';
import { PullRequestReviewer } from './pull-request-reviewer.js';
import { RegressionAnalyzer } from './regression-analyzer.js';
import { CodeQualityTracker } from './code-quality-tracker.js';
import { GitHooksManager } from './git-hooks-manager.js';
import { CIPipelineIntegrator } from './ci-pipeline-integrator.js';
export { VCSIntelligence } from './vcs-intelligence.js';
export { CommitMessageGenerator } from './commit-message-generator.js';
export { PullRequestReviewer } from './pull-request-reviewer.js';
export { RegressionAnalyzer } from './regression-analyzer.js';
export { CodeQualityTracker } from './code-quality-tracker.js';
export { GitHooksManager } from './git-hooks-manager.js';
export { CIPipelineIntegrator } from './ci-pipeline-integrator.js';
/**
 * VCS Integration Factory
 *
 * Convenience factory for creating and configuring VCS intelligence components
 */
export class VCSIntegrationFactory {
    /**
     * Create a comprehensive VCS intelligence suite
     */
    static createVCSIntelligence(config) {
        const vcsConfig = {
            repositoryPath: config.repositoryPath,
            defaultBranch: config.defaultBranch || 'main',
            enableAutoAnalysis: config.enableAutoAnalysis ?? true,
            analysisDepth: config.analysisDepth || 30,
            enableGitHooks: config.enableGitHooks ?? false,
            hookTypes: ['pre-commit', 'commit-msg', 'pre-push'],
            qualityThresholds: {
                maxComplexity: 10,
                minTestCoverage: 80,
                maxFileSize: 500,
                maxLinesChanged: 500,
                criticalFilePatterns: ['src/core/**', 'src/security/**', 'src/auth/**']
            }
        };
        return new VCSIntelligence(vcsConfig);
    }
    /**
     * Create a commit message generator with default configuration
     */
    static createCommitMessageGenerator(config, aiClient) {
        const commitConfig = {
            repositoryPath: config.repositoryPath,
            style: config.style || 'conventional',
            maxLength: config.maxLength || 72,
            includeScope: config.includeScope ?? true,
            includeBody: true,
            includeFooter: false,
            aiProvider: 'ollama'
        };
        return new CommitMessageGenerator(commitConfig, aiClient);
    }
    /**
     * Create a pull request reviewer with default configuration
     */
    static createPullRequestReviewer(config, aiClient) {
        const prConfig = {
            repositoryPath: config.repositoryPath,
            platform: config.platform || 'github',
            reviewDepth: config.reviewDepth || 'moderate',
            enableSecurityAnalysis: config.enableSecurityAnalysis ?? true,
            enablePerformanceAnalysis: config.enablePerformanceAnalysis ?? true,
            enableArchitectureAnalysis: true,
            autoAssignReviewers: false,
            requiredChecks: ['tests', 'lint', 'security'],
            reviewCriteria: {
                maxFileSize: 500,
                maxLinesChanged: 500,
                minTestCoverage: 80,
                requiresDocumentation: true,
                blockingIssueThreshold: 'high',
                autoApproveThreshold: 85
            }
        };
        return new PullRequestReviewer(prConfig, aiClient);
    }
    /**
     * Create a regression analyzer with default configuration
     */
    static createRegressionAnalyzer(config, aiClient) {
        const regressionConfig = {
            repositoryPath: config.repositoryPath,
            analysisDepth: config.analysisDepth || 50,
            riskThresholds: {
                fileSize: 500,
                linesChanged: 300,
                filesChanged: 10,
                complexity: 15,
                hotspotFrequency: 5,
                authorExperience: 6
            },
            enablePredictiveAnalysis: config.enablePredictiveAnalysis ?? true,
            enableHistoricalLearning: true,
            criticalPaths: config.criticalPaths || ['src/core/**', 'src/security/**'],
            testPatterns: ['**/*.test.*', '**/*.spec.*', '**/tests/**'],
            buildPatterns: ['**/package.json', '**/Dockerfile', '**/*.yml']
        };
        return new RegressionAnalyzer(regressionConfig, aiClient);
    }
    /**
     * Create a code quality tracker with default configuration
     */
    static createCodeQualityTracker(config) {
        const qualityConfig = {
            repositoryPath: config.repositoryPath,
            trackingInterval: config.trackingInterval || 'commit',
            retentionPeriod: config.retentionPeriod || 90,
            qualityThresholds: {
                minOverallScore: 80,
                maxCriticalIssues: 0,
                maxSecurityIssues: 5,
                minTestCoverage: 80,
                maxTechnicalDebt: 40,
                maxComplexity: 10,
                minMaintainability: 70
            },
            enableTrendAnalysis: config.enableTrendAnalysis ?? true,
            enablePredictiveAnalysis: true,
            enableAlerts: config.enableAlerts ?? true,
            alertThresholds: {
                qualityDegradation: 10,
                securityIssueIncrease: 3,
                complexityIncrease: 20,
                testCoverageDecrease: 10,
                technicalDebtIncrease: 8
            },
            storageBackend: 'file',
            storagePath: config.repositoryPath + '/.ollama-code/quality-tracking'
        };
        return new CodeQualityTracker(qualityConfig);
    }
    /**
     * Create a git hooks manager with default configuration
     */
    static createGitHooksManager(config) {
        const hooksConfig = {
            repositoryPath: config.repositoryPath,
            enablePreCommit: config.enableAllHooks ?? true,
            enableCommitMsg: config.enableAllHooks ?? true,
            enablePrePush: config.enableAllHooks ?? true,
            enablePostMerge: config.enableAllHooks ?? true,
            enableQualityGates: config.enableQualityGates ?? true,
            bypassEnabled: true,
            analysisTimeout: config.analysisTimeout || 30000,
            failOnAnalysisError: false,
            backupExistingHooks: true
        };
        return new GitHooksManager(hooksConfig);
    }
    /**
     * Create a CI/CD pipeline integrator with default configuration
     */
    static createCIPipelineIntegrator(config) {
        const pipelineConfig = {
            repositoryPath: config.repositoryPath,
            platform: config.platform || 'github',
            enableSecurityAnalysis: config.enableAllAnalysis ?? true,
            enablePerformanceAnalysis: config.enableAllAnalysis ?? true,
            enableArchitecturalAnalysis: config.enableAllAnalysis ?? true,
            enableRegressionAnalysis: config.enableAllAnalysis ?? true,
            enableQualityGates: true,
            analysisTimeout: 300000, // 5 minutes
            reportFormat: 'json',
            outputPath: './reports',
            qualityGates: {
                minQualityScore: config.qualityGateThresholds?.minQualityScore || 80,
                maxCriticalIssues: config.qualityGateThresholds?.maxCriticalIssues || 0,
                maxSecurityIssues: config.qualityGateThresholds?.maxSecurityIssues || 5,
                maxPerformanceIssues: 3,
                minTestCoverage: config.qualityGateThresholds?.minTestCoverage || 80,
                maxComplexityIncrease: 20,
                maxTechnicalDebtIncrease: 10,
                regressionThreshold: 'medium',
                blockOnFailure: true
            },
            notifications: {
                enableSlack: false,
                enableEmail: false,
                enableGitHubComments: config.platform === 'github',
                enableMergeRequestComments: config.platform === 'gitlab',
                webhookUrls: [],
                emailRecipients: []
            }
        };
        return new CIPipelineIntegrator(pipelineConfig);
    }
    /**
     * Create a complete VCS intelligence suite with all components
     */
    static createCompleteSuite(config, aiClient) {
        const suite = {
            vcsIntelligence: this.createVCSIntelligence(config),
            commitGenerator: this.createCommitMessageGenerator(config, aiClient),
            pullRequestReviewer: this.createPullRequestReviewer(config, aiClient),
            regressionAnalyzer: this.createRegressionAnalyzer(config, aiClient),
            qualityTracker: this.createCodeQualityTracker(config),
            ...(config.enableGitHooks && {
                gitHooksManager: this.createGitHooksManager(config)
            }),
            ...(config.enableCIPipeline && {
                ciPipelineIntegrator: this.createCIPipelineIntegrator(config)
            })
        };
        return suite;
    }
}
/**
 * Default export for convenience
 */
export default VCSIntegrationFactory;
//# sourceMappingURL=index.js.map