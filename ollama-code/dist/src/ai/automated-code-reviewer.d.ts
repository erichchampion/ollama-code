/**
 * Automated Code Reviewer
 *
 * Provides automated code review capabilities matching human reviewer quality
 * with comprehensive analysis, suggestions, and quality assessment.
 */
export interface CodeReviewRequest {
    files: ReviewFile[];
    context?: ReviewContext;
    options?: ReviewOptions;
}
export interface ReviewFile {
    path: string;
    content: string;
    changes?: FileChange[];
    isNew?: boolean;
    language?: string;
}
export interface FileChange {
    type: 'added' | 'modified' | 'deleted';
    line: number;
    content: string;
    oldContent?: string;
}
export interface ReviewContext {
    pullRequestId?: string;
    branch?: string;
    baseBranch?: string;
    author?: string;
    title?: string;
    description?: string;
    relatedIssues?: string[];
}
export interface ReviewOptions {
    severity?: 'all' | 'high' | 'critical';
    categories?: ReviewCategory[];
    includePositiveFeedback?: boolean;
    includeSuggestions?: boolean;
    includeExamples?: boolean;
    maxIssuesPerFile?: number;
    focusAreas?: FocusArea[];
}
export type ReviewCategory = 'code-quality' | 'security' | 'performance' | 'maintainability' | 'testing' | 'documentation' | 'architecture' | 'best-practices';
export type FocusArea = 'new-code' | 'complex-logic' | 'security-sensitive' | 'performance-critical' | 'public-apis' | 'error-handling';
export interface CodeReviewResult {
    summary: ReviewSummary;
    files: FileReview[];
    overallAssessment: OverallAssessment;
    recommendations: Recommendation[];
    metrics: ReviewMetrics;
}
export interface ReviewSummary {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    positivePoints: number;
    overallScore: number;
    reviewStatus: 'approve' | 'request-changes' | 'comment';
}
export interface FileReview {
    filePath: string;
    language: string;
    issues: ReviewIssue[];
    positivePoints: PositivePoint[];
    metrics: FileMetrics;
    suggestions: FileSuggestion[];
}
export interface ReviewIssue {
    id: string;
    category: ReviewCategory;
    severity: 'info' | 'minor' | 'major' | 'critical';
    title: string;
    description: string;
    line?: number;
    column?: number;
    codeSnippet?: string;
    suggestion?: string;
    example?: string;
    references?: string[];
    autoFixable: boolean;
    effort: 'low' | 'medium' | 'high';
}
export interface PositivePoint {
    category: string;
    description: string;
    line?: number;
    impact: 'minor' | 'moderate' | 'significant';
}
export interface FileSuggestion {
    type: 'refactoring' | 'optimization' | 'enhancement';
    title: string;
    description: string;
    benefits: string[];
    effort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high';
}
export interface FileMetrics {
    linesOfCode: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    testCoverage?: number;
    duplicateLines: number;
    codeSmells: number;
    securityIssues: number;
    performanceIssues: number;
}
export interface OverallAssessment {
    readability: number;
    maintainability: number;
    testability: number;
    performance: number;
    security: number;
    documentation: number;
    overallQuality: number;
    recommendedAction: 'approve' | 'minor-changes' | 'major-changes' | 'reject';
    reasoning: string;
}
export interface Recommendation {
    type: 'immediate' | 'follow-up' | 'architectural';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    category: ReviewCategory;
    benefits: string[];
    effort: string;
    timeline: string;
}
export interface ReviewMetrics {
    filesReviewed: number;
    linesReviewed: number;
    issuesFound: number;
    averageQualityScore: number;
    reviewDuration: number;
    coverageAnalysis: CoverageAnalysis;
}
export interface CoverageAnalysis {
    functionsReviewed: number;
    classesReviewed: number;
    branchesAnalyzed: number;
    complexityDistribution: ComplexityDistribution;
}
export interface ComplexityDistribution {
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
}
export declare class AutomatedCodeReviewer {
    private config;
    private architecturalAnalyzer;
    constructor();
    /**
     * Perform comprehensive automated code review
     */
    reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult>;
    private reviewFile;
    private calculateFileMetrics;
    private calculateMaintainabilityIndex;
    private findDuplicateLines;
    private analyzeCodeQuality;
    private analyzeSecurity;
    private analyzePerformance;
    private analyzeMaintainability;
    private analyzeTesting;
    private analyzeDocumentation;
    private analyzeArchitecture;
    private analyzeBestPractices;
    private findPositivePoints;
    private generateFileSuggestions;
    private filterIssuesBySeverity;
    private generateOverallAssessment;
    private createReviewSummary;
    private generateRecommendations;
    private calculateReviewMetrics;
    private detectLanguage;
    private extractMethods;
    private extractClasses;
    private findMagicNumbers;
    private extractImports;
    private extractPublicFunctions;
    private hasJSDoc;
    private hasCorrespondingTests;
    private getLineNumber;
    private getLineContent;
    private findMatchingBrace;
}
