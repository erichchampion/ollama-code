/**
 * Code Quality Tracker
 *
 * Comprehensive code quality tracking system that monitors quality trends
 * over time, tracks metrics across commits, and provides insights into
 * code health evolution. Integrates with VCS to provide historical analysis.
 */
export interface QualityTrackerConfig {
    repositoryPath: string;
    trackingInterval: 'commit' | 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
    qualityThresholds: QualityThresholds;
    enableTrendAnalysis: boolean;
    enablePredictiveAnalysis: boolean;
    enableAlerts: boolean;
    alertThresholds: AlertThresholds;
    storageBackend: 'file' | 'database' | 'memory';
    storagePath?: string;
}
export interface QualityThresholds {
    minOverallScore: number;
    maxCriticalIssues: number;
    maxSecurityIssues: number;
    minTestCoverage: number;
    maxTechnicalDebt: number;
    maxComplexity: number;
    minMaintainability: number;
}
export interface AlertThresholds {
    qualityDegradation: number;
    securityIssueIncrease: number;
    complexityIncrease: number;
    testCoverageDecrease: number;
    technicalDebtIncrease: number;
}
export interface QualitySnapshot {
    id: string;
    timestamp: Date;
    commitHash: string;
    author: string;
    message: string;
    metrics: QualityMetrics;
    trends: QualityTrends;
    issues: QualityIssue[];
    recommendations: QualityRecommendation[];
    alerts: QualityAlert[];
}
export interface QualityMetrics {
    overallScore: number;
    codeQuality: CodeQualityMetrics;
    security: SecurityMetrics;
    performance: PerformanceMetrics;
    testing: TestingMetrics;
    maintainability: MaintainabilityMetrics;
    technical_debt: TechnicalDebtMetrics;
}
export interface CodeQualityMetrics {
    score: number;
    linesOfCode: number;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    duplicationPercentage: number;
    codeSmells: number;
    bugs: number;
    vulnerabilities: number;
}
export interface SecurityMetrics {
    score: number;
    vulnerabilities: VulnerabilityBreakdown;
    securityHotspots: number;
    securityRating: 'A' | 'B' | 'C' | 'D' | 'E';
    complianceScore: number;
}
export interface VulnerabilityBreakdown {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
}
export interface PerformanceMetrics {
    score: number;
    performanceIssues: number;
    memoryLeaks: number;
    inefficientAlgorithms: number;
    databaseIssues: number;
    networkIssues: number;
}
export interface TestingMetrics {
    coverage: TestCoverage;
    testQuality: TestQuality;
    testMaintainability: number;
}
export interface TestCoverage {
    overall: number;
    lines: number;
    branches: number;
    functions: number;
    statements: number;
}
export interface TestQuality {
    score: number;
    testCount: number;
    testDensity: number;
    testComplexity: number;
    mockUsage: number;
    assertionDensity: number;
}
export interface MaintainabilityMetrics {
    index: number;
    technicalDebtRatio: number;
    codeReadability: number;
    documentation: number;
    structuralQuality: number;
}
export interface TechnicalDebtMetrics {
    totalHours: number;
    newDebt: number;
    resolvedDebt: number;
    debtByCategory: DebtByCategory;
    debtTrend: 'improving' | 'stable' | 'degrading';
}
export interface DebtByCategory {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    coverage: number;
    duplication: number;
    design: number;
}
export interface QualityTrends {
    period: 'week' | 'month' | 'quarter' | 'year';
    overallTrend: TrendDirection;
    categoryTrends: CategoryTrends;
    predictions: QualityPrediction[];
}
export interface CategoryTrends {
    codeQuality: TrendData;
    security: TrendData;
    performance: TrendData;
    testing: TrendData;
    maintainability: TrendData;
    technicalDebt: TrendData;
}
export interface TrendData {
    direction: TrendDirection;
    change: number;
    velocity: number;
    confidence: number;
    dataPoints: TrendDataPoint[];
}
export interface TrendDataPoint {
    timestamp: Date;
    value: number;
    context?: string;
}
export type TrendDirection = 'improving' | 'stable' | 'degrading' | 'unknown';
export interface QualityPrediction {
    metric: string;
    timeframe: 'week' | 'month' | 'quarter';
    predictedValue: number;
    confidence: number;
    factors: string[];
}
export interface QualityIssue {
    id: string;
    type: 'bug' | 'vulnerability' | 'code_smell' | 'security_hotspot' | 'coverage' | 'duplication';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    file: string;
    line?: number;
    rule: string;
    effort: number;
    debt: number;
    firstSeen: Date;
    status: 'open' | 'resolved' | 'wont_fix' | 'false_positive';
}
export interface QualityRecommendation {
    id: string;
    category: 'immediate' | 'planned' | 'strategic';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeframe: string;
    expectedImprovement: number;
}
export interface QualityAlert {
    id: string;
    type: 'threshold_breach' | 'trend_degradation' | 'security_risk' | 'performance_issue';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    metric: string;
    currentValue: number;
    thresholdValue: number;
    timestamp: Date;
    resolved: boolean;
}
export interface QualityReport {
    period: {
        start: Date;
        end: Date;
    };
    summary: QualitySummary;
    trends: QualityTrends;
    topIssues: QualityIssue[];
    improvements: QualityImprovement[];
    recommendations: QualityRecommendation[];
    metrics: QualityMetrics[];
}
export interface QualitySummary {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    qualityScore: number;
    changeFromPrevious: number;
    keyHighlights: string[];
    majorConcerns: string[];
}
export interface QualityImprovement {
    area: string;
    improvement: number;
    description: string;
    contributor: string;
}
/**
 * Comprehensive code quality tracking and analysis system
 */
export declare class CodeQualityTracker {
    private config;
    private gitChangeTracker;
    private codeReviewer;
    private securityAnalyzer;
    private performanceAnalyzer;
    private snapshots;
    private trends;
    constructor(config: QualityTrackerConfig);
    /**
     * Initialize quality tracking
     */
    initialize(): Promise<void>;
    /**
     * Take a quality snapshot of current repository state
     */
    takeSnapshot(commitHash?: string): Promise<QualitySnapshot>;
    /**
     * Track quality changes over a period
     */
    trackPeriod(startDate: Date, endDate: Date): Promise<QualitySnapshot[]>;
    /**
     * Generate comprehensive quality report
     */
    generateReport(period: {
        start: Date;
        end: Date;
    }): Promise<QualityReport>;
    /**
     * Analyze current code quality metrics
     */
    private analyzeQualityMetrics;
    /**
     * Analyze code quality metrics
     */
    private analyzeCodeQuality;
    /**
     * Analyze security metrics
     */
    private analyzeSecurityMetrics;
    /**
     * Analyze performance metrics
     */
    private analyzePerformanceMetrics;
    /**
     * Analyze testing metrics
     */
    private analyzeTestingMetrics;
    /**
     * Analyze maintainability metrics
     */
    private analyzeMaintainabilityMetrics;
    /**
     * Analyze technical debt
     */
    private analyzeTechnicalDebt;
    /**
     * Calculate overall quality score
     */
    private calculateOverallScore;
    /**
     * Calculate quality trends
     */
    private calculateTrends;
    /**
     * Calculate category trends
     */
    private calculateCategoryTrends;
    /**
     * Get metric value for trend calculation
     */
    private getMetricValue;
    /**
     * Calculate trend data from data points
     */
    private calculateTrendData;
    private getSourceFiles;
    private getTestFiles;
    private calculateFileComplexity;
    private getTotalLinesOfCode;
    private loadHistoricalData;
    private storeSnapshot;
    private getLatestSnapshot;
    private getRecentSnapshots;
    private getSnapshotsInPeriod;
    private generateSnapshotId;
    private getCommitInfo;
    private getCurrentCommit;
    private identifyQualityIssues;
    private generateRecommendations;
    private checkAlerts;
    private updateTrends;
    private calculateOverallTrend;
    private generateQualityPredictions;
    private getEmptyCategoryTrends;
    private generateQualitySummary;
    private getTopIssues;
    private identifyImprovements;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<QualityTrackerConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): QualityTrackerConfig;
}
