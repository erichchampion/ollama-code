/**
 * A/B Testing Framework for AI Providers
 *
 * Enables controlled testing of different AI providers with statistical
 * analysis and automatic winner selection based on performance metrics.
 */
import { EventEmitter } from 'events';
import { ProviderManager } from './provider-manager.js';
export interface ABTestConfig {
    name: string;
    description: string;
    controlProvider: string;
    testProvider: string;
    trafficSplit: number;
    startDate: Date;
    endDate: Date;
    minSampleSize: number;
    confidenceLevel: number;
    primaryMetric: 'success_rate' | 'response_time' | 'cost' | 'user_satisfaction';
    secondaryMetrics: string[];
    enabled: boolean;
}
export interface ABTestResult {
    testId: string;
    status: 'running' | 'completed' | 'cancelled' | 'inconclusive';
    winner: 'control' | 'test' | 'no_significant_difference' | null;
    confidence: number;
    significance: number;
    controlMetrics: {
        sampleSize: number;
        mean: number;
        standardDeviation: number;
        confidenceInterval: [number, number];
    };
    testMetrics: {
        sampleSize: number;
        mean: number;
        standardDeviation: number;
        confidenceInterval: [number, number];
    };
    effectSize: number;
    powerAnalysis: {
        power: number;
        recommendedSampleSize: number;
    };
    endedAt?: Date;
    reason?: string;
}
export interface ABTestAssignment {
    userId: string;
    testId: string;
    variant: 'control' | 'test';
    assignedAt: Date;
    providerId: string;
}
export interface ABTestMetrics {
    testId: string;
    variant: 'control' | 'test';
    providerId: string;
    userId: string;
    timestamp: Date;
    metrics: {
        responseTime: number;
        success: boolean;
        cost: number;
        userSatisfaction?: number;
        errorType?: string;
    };
}
export declare class ABTestingFramework extends EventEmitter {
    private providerManager;
    private tests;
    private assignments;
    private metrics;
    private results;
    private usageTrackedHandler?;
    constructor(providerManager: ProviderManager);
    /**
     * Set up usage tracking from provider manager
     */
    private setupUsageTracking;
    /**
     * Create a new A/B test
     */
    createTest(config: ABTestConfig): string;
    /**
     * Validate test configuration
     */
    private validateTestConfig;
    /**
     * Generate test ID
     */
    private generateTestId;
    /**
     * Assign user to test variant
     */
    assignUser(userId: string, testId: string): ABTestAssignment | null;
    /**
     * Hash user ID for consistent assignment
     */
    private hashUserId;
    /**
     * Record metrics for A/B test
     */
    recordMetrics(data: any): void;
    /**
     * Update test results with statistical analysis
     */
    private updateTestResults;
    /**
     * Extract metric value based on type
     */
    private extractMetricValue;
    /**
     * Calculate basic statistics
     */
    private calculateStatistics;
    /**
     * Perform t-test using Welch's t-test for unequal variances
     */
    private performTTest;
    /**
     * T-distribution cumulative distribution function approximation
     */
    private tDistributionCDF;
    /**
     * Normal cumulative distribution function (approximation)
     */
    private normalCDF;
    /**
     * Simplified incomplete beta function approximation
     */
    private incompleteBeta;
    /**
     * Beta series expansion
     */
    private betaSeriesExpansion;
    /**
     * Log gamma function approximation
     */
    private logGamma;
    /**
     * Gamma function approximation for small values
     */
    private gamma;
    /**
     * Calculate Cohen's d effect size
     */
    private calculateCohenD;
    /**
     * Check if test should be completed
     */
    private checkTestCompletion;
    /**
     * Complete a test
     */
    completeTest(testId: string, reason: string): void;
    /**
     * Get test result
     */
    getTestResult(testId: string): ABTestResult | undefined;
    /**
     * Get active tests
     */
    getActiveTests(): ABTestConfig[];
    /**
     * Cancel a test
     */
    cancelTest(testId: string, reason: string): void;
    /**
     * Export test data
     */
    exportTestData(testId: string): {
        config: ABTestConfig;
        result: ABTestResult;
        assignments: ABTestAssignment[];
        metrics: ABTestMetrics[];
    } | null;
    /**
     * Dispose of A/B testing resources
     */
    dispose(): void;
}
