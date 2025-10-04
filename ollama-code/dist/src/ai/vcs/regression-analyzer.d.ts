/**
 * Regression Analyzer
 *
 * AI-powered regression analysis system that identifies high-risk changes
 * that could potentially introduce bugs, performance issues, or breaking
 * changes. Uses machine learning and historical data to predict risk.
 */
import { GitCommitInfo, GitFileChange } from '../git-change-tracker.js';
export interface RegressionConfig {
    repositoryPath: string;
    analysisDepth: number;
    riskThresholds: RiskThresholds;
    enablePredictiveAnalysis: boolean;
    enableHistoricalLearning: boolean;
    criticalPaths: string[];
    testPatterns: string[];
    buildPatterns: string[];
}
export interface RiskThresholds {
    fileSize: number;
    linesChanged: number;
    filesChanged: number;
    complexity: number;
    hotspotFrequency: number;
    authorExperience: number;
}
export interface RegressionAnalysis {
    analysisId: string;
    timestamp: Date;
    changeSet: ChangeSet;
    riskAssessment: RiskAssessment;
    predictions: RegressionPrediction[];
    recommendations: RegressionRecommendation[];
    historicalContext: HistoricalContext;
    metrics: RegressionMetrics;
}
export interface ChangeSet {
    commits: GitCommitInfo[];
    files: FileChangeAnalysis[];
    scope: ChangeScope;
    impact: ChangeImpact;
    timeline: ChangeTimeline;
}
export interface FileChangeAnalysis {
    path: string;
    changes: GitFileChange;
    riskFactors: RiskFactor[];
    historicalPattern: FileHistoricalPattern;
    complexity: FileComplexity;
    criticality: FileCriticality;
}
export interface ChangeScope {
    type: 'isolated' | 'module' | 'cross-cutting' | 'architectural';
    affectedModules: string[];
    dependencyImpact: DependencyImpact[];
    apiChanges: APIChange[];
}
export interface ChangeImpact {
    level: 'low' | 'medium' | 'high' | 'critical';
    areas: ImpactArea[];
    breakingChanges: BreakingChange[];
    performance: PerformanceImpact;
    security: SecurityImpact;
}
export interface ChangeTimeline {
    developmentTime: number;
    reviewTime: number;
    testingTime: number;
    deploymentRisk: 'low' | 'medium' | 'high';
}
export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    confidenceLevel: number;
    riskFactors: RiskFactor[];
    mitigationStrategies: MitigationStrategy[];
}
export interface RiskFactor {
    type: 'size' | 'complexity' | 'hotspot' | 'author' | 'testing' | 'timing' | 'dependency' | 'critical_path';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    likelihood: number;
    weight: number;
    evidence: string[];
}
export interface RegressionPrediction {
    type: 'bug' | 'performance' | 'security' | 'compatibility' | 'usability';
    probability: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedAreas: string[];
    confidence: number;
    basedOn: string[];
}
export interface RegressionRecommendation {
    type: 'testing' | 'review' | 'monitoring' | 'deployment' | 'rollback';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    action: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
}
export interface HistoricalContext {
    similarChanges: SimilarChange[];
    authorHistory: AuthorHistory;
    fileHistory: FileHistory[];
    patterns: HistoricalPattern[];
}
export interface RegressionMetrics {
    filesAnalyzed: number;
    commitsAnalyzed: number;
    linesChanged: number;
    complexityScore: number;
    testCoverage: number;
    reviewCoverage: number;
    historicalAccuracy: number;
}
export interface SimilarChange {
    commitHash: string;
    similarity: number;
    outcome: 'success' | 'bug' | 'rollback' | 'performance_issue';
    description: string;
    lessons: string[];
}
export interface AuthorHistory {
    author: string;
    experience: number;
    successRate: number;
    specialties: string[];
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    recentPerformance: AuthorPerformance[];
}
export interface AuthorPerformance {
    period: string;
    commits: number;
    bugIntroductionRate: number;
    reviewQuality: number;
}
export interface FileHistory {
    path: string;
    changeFrequency: number;
    bugHistory: BugHistory[];
    performanceHistory: PerformanceHistory[];
    complexityTrend: ComplexityTrend;
}
export interface FileHistoricalPattern {
    changeFrequency: number;
    averageChangeSize: number;
    bugProneness: number;
    lastBugDate?: Date;
    stabilityScore: number;
}
export interface FileComplexity {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    linesOfCode: number;
    dependencies: number;
    maintainabilityIndex: number;
}
export interface FileCriticality {
    level: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
    dependents: number;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
}
export interface DependencyImpact {
    module: string;
    type: 'internal' | 'external';
    impact: 'none' | 'minor' | 'major' | 'breaking';
    affectedFiles: string[];
}
export interface APIChange {
    type: 'addition' | 'modification' | 'removal' | 'deprecation';
    endpoint?: string;
    function?: string;
    impact: 'none' | 'minor' | 'major' | 'breaking';
    backwardCompatible: boolean;
}
export interface ImpactArea {
    area: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers: number;
}
export interface BreakingChange {
    type: 'api' | 'config' | 'behavior' | 'dependency';
    description: string;
    severity: 'minor' | 'major' | 'critical';
    migrationEffort: 'low' | 'medium' | 'high';
}
export interface PerformanceImpact {
    risk: 'low' | 'medium' | 'high' | 'critical';
    areas: string[];
    estimatedDegradation: number;
    affectedOperations: string[];
}
export interface SecurityImpact {
    risk: 'low' | 'medium' | 'high' | 'critical';
    vulnerabilities: string[];
    attackSurface: 'unchanged' | 'reduced' | 'increased';
    complianceImpact: string[];
}
export interface MitigationStrategy {
    type: 'prevention' | 'detection' | 'response' | 'recovery';
    strategy: string;
    effort: 'low' | 'medium' | 'high';
    effectiveness: number;
    timeframe: string;
}
export interface BugHistory {
    date: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    fixCommit?: string;
    timeToFix: number;
}
export interface PerformanceHistory {
    date: Date;
    metric: string;
    degradation: number;
    duration: number;
}
export interface ComplexityTrend {
    trend: 'decreasing' | 'stable' | 'increasing';
    rate: number;
    current: number;
}
export interface HistoricalPattern {
    pattern: string;
    frequency: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    examples: string[];
}
/**
 * AI-powered regression analyzer for identifying high-risk changes
 */
export declare class RegressionAnalyzer {
    private config;
    private gitChangeTracker;
    private historicalData;
    private aiClient;
    constructor(config: RegressionConfig, aiClient?: any);
    /**
     * Analyze potential regressions in current changes
     */
    analyzeRegressions(commits?: GitCommitInfo[]): Promise<RegressionAnalysis>;
    /**
     * Analyze a specific change set for regression risk
     */
    analyzeSpecificChanges(filePaths: string[], changeType: 'staged' | 'committed' | 'branch'): Promise<RegressionAnalysis>;
    /**
     * Get recent commits for analysis
     */
    private getRecentCommits;
    /**
     * Get commits for staged changes
     */
    private getCommitsForStagedChanges;
    /**
     * Get commits for current branch
     */
    private getCommitsForBranch;
    /**
     * Get files changed in a specific commit
     */
    private getFilesForCommit;
    /**
     * Analyze change set for risk factors
     */
    private analyzeChangeSet;
    /**
     * Analyze individual file change
     */
    private analyzeFileChange;
    /**
     * Identify risk factors for a file change
     */
    private identifyFileRiskFactors;
    /**
     * Get historical pattern for a file
     */
    private getFileHistoricalPattern;
    /**
     * Analyze file complexity
     */
    private analyzeFileComplexity;
    /**
     * Estimate cyclomatic complexity
     */
    private estimateCyclomaticComplexity;
    /**
     * Count dependencies in file
     */
    private countDependencies;
    /**
     * Determine file criticality
     */
    private determineFileCriticality;
    /**
     * Analyze change scope
     */
    private analyzeChangeScope;
    /**
     * Analyze change impact
     */
    private analyzeChangeImpact;
    /**
     * Estimate change timeline
     */
    private estimateChangeTimeline;
    /**
     * Perform comprehensive risk assessment
     */
    private performRiskAssessment;
    /**
     * Generate regression predictions
     */
    private generatePredictions;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Build historical context
     */
    private buildHistoricalContext;
    /**
     * Calculate regression metrics
     */
    private calculateMetrics;
    private getSeverityScore;
    private calculateConfidenceLevel;
    private calculateBugProbability;
    private calculatePerformanceProbability;
    private generateMitigationStrategies;
    private mapGitStatus;
    private generateAnalysisId;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<RegressionConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): RegressionConfig;
}
