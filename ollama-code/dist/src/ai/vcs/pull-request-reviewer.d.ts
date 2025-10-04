/**
 * Pull Request Reviewer
 *
 * AI-powered automated code review system for pull requests.
 * Provides comprehensive analysis, feedback, and recommendations
 * for code changes in pull requests across different platforms.
 */
export interface PRReviewConfig {
    repositoryPath: string;
    platform: 'github' | 'gitlab' | 'bitbucket' | 'azure' | 'generic';
    reviewDepth: 'surface' | 'moderate' | 'deep' | 'comprehensive';
    enableSecurityAnalysis: boolean;
    enablePerformanceAnalysis: boolean;
    enableArchitectureAnalysis: boolean;
    autoAssignReviewers: boolean;
    requiredChecks: string[];
    reviewCriteria: ReviewCriteria;
}
export interface ReviewCriteria {
    maxFileSize: number;
    maxLinesChanged: number;
    minTestCoverage: number;
    requiresDocumentation: boolean;
    blockingIssueThreshold: 'low' | 'medium' | 'high' | 'critical';
    autoApproveThreshold: number;
}
export interface PullRequestInfo {
    id: string;
    title: string;
    description: string;
    author: string;
    sourceBranch: string;
    targetBranch: string;
    status: 'open' | 'closed' | 'merged' | 'draft';
    createdAt: Date;
    updatedAt: Date;
    url: string;
    labels: string[];
    reviewers: string[];
    commits: PRCommit[];
    files: PRFile[];
}
export interface PRCommit {
    sha: string;
    message: string;
    author: string;
    date: Date;
}
export interface PRFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
    oldPath?: string;
    patch?: string;
}
export interface PRReviewResult {
    reviewId: string;
    pullRequestId: string;
    status: 'approved' | 'changes_requested' | 'commented' | 'pending';
    overallScore: number;
    recommendation: 'approve' | 'request_changes' | 'comment' | 'block';
    summary: string;
    findings: ReviewFinding[];
    metrics: ReviewMetrics;
    suggestions: string[];
    reviewTime: number;
}
export interface ReviewFinding {
    id: string;
    type: 'security' | 'performance' | 'quality' | 'style' | 'architecture' | 'testing' | 'documentation';
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    description: string;
    file: string;
    line?: number;
    column?: number;
    suggestion?: string;
    rule?: string;
    confidence: number;
    autoFixable: boolean;
}
export interface ReviewMetrics {
    filesReviewed: number;
    linesReviewed: number;
    issuesFound: number;
    securityIssues: number;
    performanceIssues: number;
    qualityScore: number;
    testCoverage: number;
    complexity: number;
    maintainability: number;
}
export interface ReviewerAssignment {
    reviewer: string;
    reason: string;
    expertise: string[];
    confidence: number;
}
/**
 * AI-powered pull request reviewer
 */
export declare class PullRequestReviewer {
    private config;
    private codeReviewer;
    private securityAnalyzer;
    private performanceAnalyzer;
    private aiClient;
    constructor(config: PRReviewConfig, aiClient?: any);
    /**
     * Review a pull request
     */
    reviewPullRequest(prInfo: PullRequestInfo): Promise<PRReviewResult>;
    /**
     * Review a specific diff
     */
    reviewDiff(diffText: string, metadata: {
        sourceBranch: string;
        targetBranch: string;
        author: string;
    }): Promise<PRReviewResult>;
    /**
     * Validate if PR is eligible for review
     */
    private validatePRForReview;
    /**
     * Perform code quality review
     */
    private performCodeReview;
    /**
     * Perform security analysis
     */
    private performSecurityReview;
    /**
     * Perform performance analysis
     */
    private performPerformanceReview;
    /**
     * Perform architecture analysis
     */
    private performArchitectureReview;
    /**
     * Perform test coverage analysis
     */
    private performTestReview;
    /**
     * Calculate review metrics
     */
    private calculateMetrics;
    /**
     * Generate review recommendation
     */
    private generateRecommendation;
    /**
     * Generate review summary
     */
    private generateSummary;
    /**
     * Generate suggestions for improvement
     */
    private generateSuggestions;
    /**
     * Suggest reviewers based on file changes and expertise
     */
    suggestReviewers(prInfo: PullRequestInfo): Promise<ReviewerAssignment[]>;
    /**
     * Identify changed areas from PR files
     */
    private identifyChangedAreas;
    private mapReviewDepth;
    private mapSeverity;
    private generateReviewId;
    private generateFindingId;
    private parseDiffToFiles;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<PRReviewConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): PRReviewConfig;
}
