/**
 * Intelligent Debugger
 *
 * Provides intelligent debugging capabilities that can resolve 60% of common issues
 * through automated analysis, root cause identification, and fix suggestions.
 */
export interface DebuggingRequest {
    error?: ErrorContext;
    symptoms?: Symptom[];
    context?: DebuggingContext;
    files?: DebugFile[];
    options?: DebuggingOptions;
}
export interface ErrorContext {
    message: string;
    stack?: string;
    code?: string;
    type: 'runtime' | 'compile' | 'logic' | 'performance' | 'memory' | 'network' | 'security';
    severity: 'low' | 'medium' | 'high' | 'critical';
    frequency?: 'once' | 'occasional' | 'frequent' | 'always';
    environment?: 'development' | 'staging' | 'production';
    timestamp?: Date;
}
export interface Symptom {
    description: string;
    category: 'performance' | 'ui' | 'data' | 'network' | 'security' | 'logic';
    severity: 'minor' | 'moderate' | 'severe';
    reproducible: boolean;
    steps?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
}
export interface DebuggingContext {
    codebase?: {
        language: string;
        framework?: string;
        version?: string;
        dependencies?: string[];
    };
    environment?: {
        os: string;
        nodeVersion?: string;
        memoryUsage?: number;
        cpuUsage?: number;
    };
    recentChanges?: {
        files: string[];
        commits?: string[];
        deployments?: Date[];
    };
    userActions?: string[];
    dataState?: any;
}
export interface DebugFile {
    path: string;
    content: string;
    language: string;
    relevance: 'high' | 'medium' | 'low';
    modified?: Date;
}
export interface DebuggingOptions {
    analysisDepth?: 'shallow' | 'deep' | 'comprehensive';
    includeFixSuggestions?: boolean;
    includePreventionTips?: boolean;
    generateTests?: boolean;
    performanceAnalysis?: boolean;
    securityAnalysis?: boolean;
    maxSuggestedFixes?: number;
    confidenceThreshold?: number;
}
export interface DebuggingResult {
    analysis: RootCauseAnalysis;
    diagnosis: Diagnosis;
    fixes: FixSuggestion[];
    prevention: PreventionStrategy[];
    tests: TestSuggestion[];
    monitoring: MonitoringRecommendation[];
    confidence: number;
    estimatedResolutionTime: string;
    difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
}
export interface RootCauseAnalysis {
    primaryCause: Cause;
    contributingFactors: Cause[];
    analysis: string;
    evidenceChain: Evidence[];
    likelihood: number;
}
export interface Cause {
    type: 'code-logic' | 'data-issue' | 'configuration' | 'dependency' | 'environment' | 'race-condition' | 'memory-leak' | 'security';
    description: string;
    location?: CodeLocation;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
}
export interface Evidence {
    type: 'code-pattern' | 'error-correlation' | 'performance-metric' | 'log-pattern' | 'state-analysis';
    description: string;
    location?: CodeLocation;
    strength: 'weak' | 'moderate' | 'strong' | 'definitive';
    data?: any;
}
export interface CodeLocation {
    file: string;
    line?: number;
    column?: number;
    function?: string;
    class?: string;
}
export interface Diagnosis {
    category: 'bug' | 'performance' | 'security' | 'configuration' | 'logic-error' | 'integration-issue';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    scope: 'local' | 'module' | 'system' | 'global';
    businessImpact: string;
    technicalImpact: string;
}
export interface FixSuggestion {
    id: string;
    title: string;
    description: string;
    type: 'code-change' | 'configuration' | 'dependency-update' | 'architectural' | 'process';
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'minimal' | 'low' | 'medium' | 'high';
    risks: Risk[];
    benefits: string[];
    implementation: ImplementationStep[];
    codeChanges?: CodeChange[];
    confidence: number;
    testable: boolean;
    rollbackPlan?: string;
}
export interface Risk {
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
}
export interface ImplementationStep {
    order: number;
    description: string;
    command?: string;
    files?: string[];
    validation: string;
    estimatedTime: string;
}
export interface CodeChange {
    file: string;
    type: 'modify' | 'add' | 'delete' | 'move';
    location?: CodeLocation;
    oldCode?: string;
    newCode?: string;
    explanation: string;
}
export interface PreventionStrategy {
    category: 'code-review' | 'testing' | 'monitoring' | 'documentation' | 'training';
    title: string;
    description: string;
    implementation: string[];
    tools?: string[];
    effort: 'low' | 'medium' | 'high';
    effectiveness: number;
}
export interface TestSuggestion {
    type: 'unit' | 'integration' | 'end-to-end' | 'performance' | 'security';
    title: string;
    description: string;
    file: string;
    priority: 'low' | 'medium' | 'high';
    framework?: string;
    estimatedTime: string;
}
export interface MonitoringRecommendation {
    type: 'logging' | 'metrics' | 'alerting' | 'tracing';
    title: string;
    description: string;
    implementation: string;
    tools?: string[];
    priority: 'low' | 'medium' | 'high';
}
export declare class IntelligentDebugger {
    private config;
    private architecturalAnalyzer;
    private codeReviewer;
    constructor();
    /**
     * Perform intelligent debugging analysis
     */
    debug(request: DebuggingRequest): Promise<DebuggingResult>;
    private enrichDebuggingContext;
    private performRootCauseAnalysis;
    private analyzeError;
    private analyzeStackTrace;
    private analyzeErrorMessage;
    private analyzeCodeLine;
    private analyzeSymptoms;
    private analyzeCodePatterns;
    private analyzeRecentChanges;
    private rankCauses;
    private generateAnalysisText;
    private generateDiagnosis;
    private generateDiagnosisTitle;
    private assessIssueScope;
    private assessBusinessImpact;
    private assessTechnicalImpact;
    private generateFixSuggestions;
    private generateCodeLogicFixes;
    private generateDataIssueFixes;
    private generateConfigurationFixes;
    private generateDependencyFixes;
    private generateMemoryLeakFixes;
    private generateSecurityFixes;
    private generatePreventionStrategies;
    private generateTestSuggestions;
    private generateMonitoringRecommendations;
    private calculateOverallConfidence;
    private estimateResolutionTime;
    private assessDifficulty;
    private detectFramework;
    private extractDependencies;
    private mapReviewCategoryToCauseType;
}
