/**
 * Provider Performance Benchmarking System
 *
 * Comprehensive benchmarking system for comparing AI provider performance,
 * response quality, cost efficiency, and reliability across different scenarios.
 */
import { BaseAIProvider, AIMessage, AICompletionOptions } from './base-provider.js';
export interface BenchmarkTestCase {
    id: string;
    name: string;
    description: string;
    category: 'code_generation' | 'code_analysis' | 'debugging' | 'explanation' | 'refactoring' | 'general';
    difficulty: 'simple' | 'medium' | 'complex';
    messages: AIMessage[];
    options?: AICompletionOptions;
    expectedKeywords?: string[];
    maxResponseTime?: number;
    evaluationCriteria: {
        accuracy?: number;
        relevance?: number;
        completeness?: number;
        codeQuality?: number;
    };
}
export interface BenchmarkResult {
    testCaseId: string;
    providerId: string;
    providerName: string;
    timestamp: Date;
    responseTime: number;
    tokenUsage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    response: string;
    finishReason: string;
    qualityScores: {
        accuracy: number;
        relevance: number;
        completeness: number;
        codeQuality?: number;
        overall: number;
    };
    error?: string;
    success: boolean;
    estimatedCost?: number;
}
export interface BenchmarkSummary {
    providerId: string;
    providerName: string;
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    successRate: number;
    averageResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    averageQualityScores: {
        accuracy: number;
        relevance: number;
        completeness: number;
        codeQuality: number;
        overall: number;
    };
    totalTokens: number;
    averageTokensPerRequest: number;
    totalEstimatedCost: number;
    averageCostPerRequest: number;
    costPerToken: number;
    categoryPerformance: Map<string, {
        tests: number;
        successRate: number;
        averageQuality: number;
        averageResponseTime: number;
    }>;
}
export interface BenchmarkConfig {
    timeoutMs: number;
    retryAttempts: number;
    parallelism: number;
    includeStreaming?: boolean;
    includeCostAnalysis?: boolean;
    customEvaluator?: (testCase: BenchmarkTestCase, response: string) => Promise<BenchmarkResult['qualityScores']>;
}
export declare class ProviderBenchmarker {
    private providers;
    private testCases;
    private results;
    private config;
    constructor(config?: Partial<BenchmarkConfig>);
    /**
     * Register a provider for benchmarking
     */
    registerProvider(id: string, provider: BaseAIProvider): void;
    /**
     * Add a test case to the benchmark suite
     */
    addTestCase(testCase: BenchmarkTestCase): void;
    /**
     * Load standard test cases for common scenarios
     */
    loadStandardTestCases(): void;
    /**
     * Run benchmark against all registered providers
     */
    runBenchmark(): Promise<Map<string, BenchmarkSummary>>;
    /**
     * Run benchmark for a specific provider
     */
    private runProviderBenchmark;
    /**
     * Run a single test case against a provider
     */
    private runSingleTest;
    /**
     * Evaluate response quality
     */
    private evaluateResponse;
    /**
     * Estimate cost based on token usage
     */
    private estimateCost;
    /**
     * Create summary statistics for a provider
     */
    private createSummary;
    /**
     * Generate detailed benchmark report
     */
    generateReport(summaries: Map<string, BenchmarkSummary>): string;
    /**
     * Get detailed results for analysis
     */
    getResults(): BenchmarkResult[];
    /**
     * Utility function to chunk array
     */
    private chunkArray;
}
