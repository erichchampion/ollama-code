/**
 * Metrics Calculation Utility
 *
 * Provides centralized metrics calculation functionality to eliminate
 * duplicate mathematical and statistical logic across providers.
 */
export interface WeightedItem<T> {
    value: T;
    weight: number;
}
export interface MovingAverageState {
    count: number;
    average: number;
    alpha?: number;
}
export interface StatisticalSummary {
    mean: number;
    median: number;
    standardDeviation: number;
    min: number;
    max: number;
    count: number;
}
export declare class MetricsCalculator {
    /**
     * Calculate exponential moving average
     */
    static calculateMovingAverage(currentAverage: number, newValue: number, alpha?: number, isFirstValue?: boolean): number;
    /**
     * Update moving average state
     */
    static updateMovingAverage(state: MovingAverageState, newValue: number): MovingAverageState;
    /**
     * Calculate weighted average
     */
    static calculateWeightedAverage<T>(items: WeightedItem<T>[], valueExtractor: (item: T) => number): number;
    /**
     * Calculate simple weighted average from arrays
     */
    static calculateSimpleWeightedAverage(values: number[], weights: number[]): number;
    /**
     * Calculate statistical summary for an array of numbers
     */
    static calculateStatistics(values: number[]): StatisticalSummary;
    /**
     * Calculate percentile for a value in a dataset
     */
    static calculatePercentile(values: number[], targetValue: number): number;
    /**
     * Calculate rate (requests per second, etc.)
     */
    static calculateRate(count: number, timeWindowMs: number): number;
    /**
     * Calculate throughput metrics
     */
    static calculateThroughput(totalRequests: number, totalTimeMs: number, windowSizeMs?: number): {
        requestsPerSecond: number;
        requestsPerMinute: number;
        averageRequestTime: number;
    };
    /**
     * Calculate success rate percentage
     */
    static calculateSuccessRate(successCount: number, totalCount: number): number;
    /**
     * Calculate error rate percentage
     */
    static calculateErrorRate(errorCount: number, totalCount: number): number;
    /**
     * Calculate exponential decay factor for time-based weighting
     */
    static calculateTimeDecay(ageMs: number, halfLifeMs?: number): number;
    /**
     * Calculate moving window average
     */
    static calculateWindowAverage(values: Array<{
        value: number;
        timestamp: number;
    }>, windowSizeMs: number, currentTime?: number): number;
    /**
     * Calculate correlation coefficient between two datasets
     */
    static calculateCorrelation(dataX: number[], dataY: number[]): number;
    /**
     * Normalize value to 0-1 range based on min/max bounds
     */
    static normalize(value: number, min: number, max: number): number;
    /**
     * Calculate rolling variance
     */
    static calculateRollingVariance(values: number[], windowSize: number): number[];
}
