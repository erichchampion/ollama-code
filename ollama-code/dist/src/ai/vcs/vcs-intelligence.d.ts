/**
 * VCS Intelligence
 *
 * Comprehensive version control system integration with AI-powered insights
 * and automation for git repositories. Provides intelligent commit analysis,
 * change tracking, and integration with ollama-code's AI capabilities.
 */
import { GitCommitInfo } from '../git-change-tracker.js';
export interface VCSConfig {
    repositoryPath: string;
    defaultBranch?: string;
    enableAutoAnalysis: boolean;
    analysisDepth: number;
    enableGitHooks: boolean;
    hookTypes: GitHookType[];
    qualityThresholds: QualityThresholds;
}
export interface QualityThresholds {
    maxComplexity: number;
    minTestCoverage: number;
    maxFileSize: number;
    maxLinesChanged: number;
    criticalFilePatterns: string[];
}
export interface RepositoryAnalysis {
    repository: RepositoryInfo;
    recentActivity: ActivitySummary;
    codeQuality: QualityMetrics;
    riskAssessment: RiskAnalysis;
    recommendations: string[];
}
export interface RepositoryInfo {
    path: string;
    name: string;
    defaultBranch: string;
    currentBranch: string;
    isClean: boolean;
    unstagedChanges: number;
    stagedChanges: number;
    unpushedCommits: number;
    lastCommit: GitCommitInfo | null;
    remotes: RemoteInfo[];
}
export interface RemoteInfo {
    name: string;
    url: string;
    type: 'github' | 'gitlab' | 'bitbucket' | 'azure' | 'other';
}
export interface ActivitySummary {
    commitsLastWeek: number;
    commitsLastMonth: number;
    uniqueAuthors: number;
    filesModified: number;
    linesAdded: number;
    linesDeleted: number;
    hotspots: FileHotspot[];
}
export interface FileHotspot {
    path: string;
    changeFrequency: number;
    authors: string[];
    riskScore: number;
    lastModified: Date;
}
export interface QualityMetrics {
    overallScore: number;
    testCoverage: number;
    codeComplexity: number;
    duplication: number;
    maintainabilityIndex: number;
    technicalDebt: TechnicalDebtItem[];
}
export interface TechnicalDebtItem {
    type: 'code_smell' | 'bug' | 'vulnerability' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    file: string;
    line?: number;
    description: string;
    estimatedHours: number;
}
export interface RiskAnalysis {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    factors: RiskFactor[];
    suggestions: string[];
}
export interface RiskFactor {
    type: 'complexity' | 'size' | 'frequency' | 'testing' | 'security';
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
}
export type GitHookType = 'pre-commit' | 'commit-msg' | 'pre-push' | 'post-merge' | 'post-commit';
/**
 * VCS Intelligence class for comprehensive git repository analysis and automation
 */
export declare class VCSIntelligence {
    private config;
    private gitChangeTracker;
    private repositoryCache;
    private cacheExpiry;
    constructor(config: VCSConfig);
    /**
     * Initialize VCS intelligence for the repository
     */
    initialize(): Promise<void>;
    /**
     * Perform comprehensive repository analysis
     */
    analyzeRepository(): Promise<RepositoryAnalysis>;
    /**
     * Get basic repository information
     */
    private getRepositoryInfo;
    /**
     * Analyze recent repository activity
     */
    private getActivitySummary;
    /**
     * Analyze code quality metrics
     */
    private analyzeCodeQuality;
    /**
     * Perform risk analysis on the repository
     */
    private performRiskAnalysis;
    /**
     * Identify file hotspots based on change frequency
     */
    private identifyFileHotspots;
    /**
     * Calculate risk score for a file based on change frequency and author count
     */
    private calculateFileRiskScore;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Generate risk-specific suggestions
     */
    private generateRiskSuggestions;
    private verifyGitRepository;
    private getRepositoryName;
    private getDefaultBranch;
    private getCurrentBranch;
    private getRepositoryStatus;
    private getLastCommit;
    private getRemotes;
    private detectRemoteType;
    private installGitHooks;
    private isCacheValid;
    /**
     * Clear the analysis cache
     */
    clearCache(): void;
    /**
     * Get current configuration
     */
    getConfig(): VCSConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<VCSConfig>): void;
}
