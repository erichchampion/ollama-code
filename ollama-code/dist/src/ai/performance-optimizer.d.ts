/**
 * Performance Optimizer
 *
 * Provides automated performance optimization with measurable improvements
 * through code analysis, bottleneck identification, and optimization suggestions.
 */
export interface PerformanceAnalysisRequest {
    files: PerformanceFile[];
    context?: PerformanceContext;
    options?: AnalysisOptions;
}
export interface PerformanceFile {
    path: string;
    content: string;
    language: string;
    size: number;
    lastModified?: Date;
    executionProfile?: ExecutionProfile;
}
export interface ExecutionProfile {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    ioOperations: number;
    networkCalls: number;
}
export interface PerformanceContext {
    runtime?: {
        platform: string;
        version: string;
        memory: number;
        cpu: string;
    };
    loadPatterns?: LoadPattern[];
    constraints?: PerformanceConstraints;
    existingOptimizations?: string[];
}
export interface LoadPattern {
    scenario: string;
    frequency: 'low' | 'medium' | 'high' | 'peak';
    concurrency: number;
    dataSize: number;
    expectedLatency: number;
}
export interface PerformanceConstraints {
    maxResponseTime: number;
    maxMemoryUsage: number;
    maxCpuUsage: number;
    throughputRequirements: number;
    availabilityRequirements: number;
}
export interface AnalysisOptions {
    depth?: 'shallow' | 'deep' | 'comprehensive';
    focus?: PerformanceFocus[];
    includeProfiler?: boolean;
    generateBenchmarks?: boolean;
    suggestAlternatives?: boolean;
    measurementRequired?: boolean;
}
export type PerformanceFocus = 'cpu-intensive' | 'memory-usage' | 'io-operations' | 'network-latency' | 'database-queries' | 'algorithm-efficiency' | 'caching' | 'bundling';
export interface PerformanceAnalysisResult {
    summary: PerformanceSummary;
    bottlenecks: Bottleneck[];
    optimizations: Optimization[];
    benchmarks: Benchmark[];
    projectedImprovements: ProjectedImprovement[];
    recommendations: PerformanceRecommendation[];
    metrics: AnalysisMetrics;
}
export interface PerformanceSummary {
    overallScore: number;
    criticalIssues: number;
    majorIssues: number;
    potentialSavings: PotentialSavings;
    riskAssessment: RiskAssessment;
}
export interface PotentialSavings {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    estimatedCostSavings: string;
}
export interface RiskAssessment {
    optimizationRisk: 'low' | 'medium' | 'high';
    businessImpact: 'minimal' | 'moderate' | 'significant';
    implementationComplexity: 'simple' | 'moderate' | 'complex';
}
export interface Bottleneck {
    id: string;
    type: 'cpu' | 'memory' | 'io' | 'network' | 'algorithm' | 'database' | 'rendering';
    title: string;
    description: string;
    location: CodeLocation;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    impact: PerformanceImpact;
    evidence: Evidence[];
    frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
    measuredCost: MeasuredCost;
}
export interface CodeLocation {
    file: string;
    line?: number;
    column?: number;
    function?: string;
    class?: string;
    module?: string;
}
export interface PerformanceImpact {
    executionTime: number;
    memoryIncrease: number;
    cpuUsage: number;
    userExperience: 'minimal' | 'noticeable' | 'significant' | 'severe';
    scalabilityImpact: 'none' | 'minor' | 'moderate' | 'major';
}
export interface Evidence {
    type: 'profiling' | 'static-analysis' | 'pattern-matching' | 'benchmark' | 'metrics';
    description: string;
    confidence: number;
    data?: any;
}
export interface MeasuredCost {
    totalTime: number;
    averageTime: number;
    worstCaseTime: number;
    memoryAllocations: number;
    callCount: number;
}
export interface Optimization {
    id: string;
    title: string;
    description: string;
    type: 'algorithmic' | 'caching' | 'lazy-loading' | 'batching' | 'compression' | 'async' | 'structural';
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'minimal' | 'low' | 'medium' | 'high';
    applicability: 'specific' | 'general' | 'architectural';
    implementation: OptimizationImplementation;
    expectedGains: ExpectedGains;
    risks: OptimizationRisk[];
    validationCriteria: ValidationCriteria;
    alternatives: Alternative[];
}
export interface OptimizationImplementation {
    steps: ImplementationStep[];
    codeChanges: CodeChange[];
    dependencies: string[];
    configChanges: ConfigChange[];
    estimatedTime: string;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
export interface ImplementationStep {
    order: number;
    title: string;
    description: string;
    type: 'analysis' | 'refactoring' | 'testing' | 'deployment';
    estimatedDuration: string;
    prerequisites: string[];
    validation: string;
    rollbackPlan?: string;
}
export interface CodeChange {
    file: string;
    type: 'modify' | 'add' | 'delete' | 'refactor';
    location: CodeLocation;
    description: string;
    before?: string;
    after?: string;
    rationale: string;
}
export interface ConfigChange {
    file: string;
    setting: string;
    currentValue: any;
    newValue: any;
    reason: string;
}
export interface ExpectedGains {
    performanceImprovement: number;
    memoryReduction: number;
    latencyReduction: number;
    throughputIncrease: number;
    resourceSavings: string;
    confidence: number;
}
export interface OptimizationRisk {
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    indicators: string[];
}
export interface ValidationCriteria {
    performanceTests: string[];
    functionalTests: string[];
    metrics: PerformanceMetric[];
    successThresholds: SuccessThreshold[];
}
export interface PerformanceMetric {
    name: string;
    unit: string;
    baseline: number;
    target: number;
    measurement: string;
}
export interface SuccessThreshold {
    metric: string;
    operator: '<' | '>' | '<=' | '>=' | '=';
    value: number;
    critical: boolean;
}
export interface Alternative {
    title: string;
    description: string;
    effort: 'minimal' | 'low' | 'medium' | 'high';
    expectedGains: number;
    tradeoffs: string[];
}
export interface Benchmark {
    id: string;
    name: string;
    description: string;
    type: 'micro' | 'component' | 'integration' | 'end-to-end';
    baseline: BenchmarkResult;
    optimized?: BenchmarkResult;
    testData: TestDataSet[];
}
export interface BenchmarkResult {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
    errorRate: number;
    percentiles: Percentiles;
}
export interface Percentiles {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
}
export interface TestDataSet {
    name: string;
    size: string;
    characteristics: string[];
    representativeOf: string;
}
export interface ProjectedImprovement {
    optimization: string;
    metric: string;
    currentValue: number;
    projectedValue: number;
    improvement: number;
    confidence: number;
    timeframe: string;
}
export interface PerformanceRecommendation {
    category: 'immediate' | 'short-term' | 'long-term' | 'architectural';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    benefits: string[];
    implementation: string;
    effort: string;
    roi: string;
    dependencies: string[];
}
export interface AnalysisMetrics {
    analysisTime: number;
    filesAnalyzed: number;
    bottlenecksFound: number;
    optimizationsProposed: number;
    totalLinesAnalyzed: number;
    complexityScore: number;
    performanceScore: number;
}
export declare class PerformanceOptimizer {
    private config;
    private architecturalAnalyzer;
    constructor();
    /**
     * Perform comprehensive performance analysis
     */
    analyzePerformance(request: PerformanceAnalysisRequest): Promise<PerformanceAnalysisResult>;
    private performStaticAnalysis;
    private analyzePerformancePatterns;
    private identifyHotspots;
    private extractDependencies;
    private estimateResourceUsage;
    private calculateMemoryUsageScore;
    private calculateCpuUsageScore;
    private calculateIoScore;
    private identifyBottlenecks;
    private createBottleneckFromPattern;
    private createBottleneckFromHotspot;
    private generateOptimizations;
    private createOptimizationsForBottleneck;
    private createAlgorithmOptimizations;
    private createMemoryOptimizations;
    private createIoOptimizations;
    private createNetworkOptimizations;
    private createDatabaseOptimizations;
    private generateArchitecturalOptimizations;
    private generateBenchmarks;
    private projectImprovements;
    private generateRecommendations;
    private createPerformanceSummary;
    private calculateAnalysisMetrics;
    private mapPatternTypeToBottleneckType;
    private mapHotspotTypeToBottleneckType;
    private getPatternTitle;
    private estimatePatternExecutionImpact;
    private estimatePatternMemoryImpact;
    private estimatePatternCpuImpact;
    private estimateHotspotImpact;
}
