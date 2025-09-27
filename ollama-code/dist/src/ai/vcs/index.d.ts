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
export { VCSIntelligence } from './vcs-intelligence.js';
export { CommitMessageGenerator } from './commit-message-generator.js';
export { PullRequestReviewer } from './pull-request-reviewer.js';
export { RegressionAnalyzer } from './regression-analyzer.js';
export { CodeQualityTracker } from './code-quality-tracker.js';
export type { VCSConfig, QualityThresholds, RepositoryAnalysis, RepositoryInfo, ActivitySummary, QualityMetrics, RiskAnalysis, GitHookType } from './vcs-intelligence.js';
export type { CommitMessageConfig, CommitAnalysis, GeneratedCommitMessage, CommitType, ChangeType, ChangedFile } from './commit-message-generator.js';
export type { PRReviewConfig, ReviewCriteria, PullRequestInfo, PRReviewResult, ReviewFinding, ReviewMetrics, ReviewerAssignment } from './pull-request-reviewer.js';
export type { RegressionConfig, RiskThresholds, RegressionAnalysis, ChangeSet, RiskAssessment, RegressionPrediction, RegressionRecommendation, HistoricalContext } from './regression-analyzer.js';
export type { QualityTrackerConfig, QualitySnapshot, QualityMetrics as QualityTrackerMetrics, QualityReport, QualitySummary, QualityTrends, TrendDirection } from './code-quality-tracker.js';
/**
 * VCS Integration Factory
 *
 * Convenience factory for creating and configuring VCS intelligence components
 */
export declare class VCSIntegrationFactory {
    /**
     * Create a comprehensive VCS intelligence suite
     */
    static createVCSIntelligence(config: {
        repositoryPath: string;
        defaultBranch?: string;
        enableAutoAnalysis?: boolean;
        analysisDepth?: number;
        enableGitHooks?: boolean;
    }): VCSIntelligence;
    /**
     * Create a commit message generator with default configuration
     */
    static createCommitMessageGenerator(config: {
        repositoryPath: string;
        style?: 'conventional' | 'descriptive' | 'minimal';
        maxLength?: number;
        includeScope?: boolean;
    }, aiClient?: any): CommitMessageGenerator;
    /**
     * Create a pull request reviewer with default configuration
     */
    static createPullRequestReviewer(config: {
        repositoryPath: string;
        platform?: 'github' | 'gitlab' | 'bitbucket';
        reviewDepth?: 'surface' | 'moderate' | 'deep';
        enableSecurityAnalysis?: boolean;
        enablePerformanceAnalysis?: boolean;
    }, aiClient?: any): PullRequestReviewer;
    /**
     * Create a regression analyzer with default configuration
     */
    static createRegressionAnalyzer(config: {
        repositoryPath: string;
        analysisDepth?: number;
        enablePredictiveAnalysis?: boolean;
        criticalPaths?: string[];
    }, aiClient?: any): RegressionAnalyzer;
    /**
     * Create a code quality tracker with default configuration
     */
    static createCodeQualityTracker(config: {
        repositoryPath: string;
        trackingInterval?: 'commit' | 'daily' | 'weekly';
        retentionPeriod?: number;
        enableTrendAnalysis?: boolean;
        enableAlerts?: boolean;
    }): CodeQualityTracker;
    /**
     * Create a complete VCS intelligence suite with all components
     */
    static createCompleteSuite(config: {
        repositoryPath: string;
        platform?: 'github' | 'gitlab' | 'bitbucket';
        commitStyle?: 'conventional' | 'descriptive' | 'minimal';
        enableAllFeatures?: boolean;
    }, aiClient?: any): {
        vcsIntelligence: VCSIntelligence;
        commitGenerator: CommitMessageGenerator;
        pullRequestReviewer: PullRequestReviewer;
        regressionAnalyzer: RegressionAnalyzer;
        qualityTracker: CodeQualityTracker;
    };
}
/**
 * Default export for convenience
 */
export default VCSIntegrationFactory;
