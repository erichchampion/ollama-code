/**
 * Metrics Calculation Utility
 *
 * Provides centralized metrics calculation functionality to eliminate
 * duplicate mathematical and statistical logic across providers.
 */
export class MetricsCalculator {
    /**
     * Calculate exponential moving average
     */
    static calculateMovingAverage(currentAverage, newValue, alpha = 0.1, isFirstValue = false) {
        if (isFirstValue) {
            return newValue;
        }
        return alpha * newValue + (1 - alpha) * currentAverage;
    }
    /**
     * Update moving average state
     */
    static updateMovingAverage(state, newValue) {
        const isFirst = state.count === 0;
        const alpha = state.alpha || 0.1;
        return {
            count: state.count + 1,
            average: this.calculateMovingAverage(state.average, newValue, alpha, isFirst),
            alpha
        };
    }
    /**
     * Calculate weighted average
     */
    static calculateWeightedAverage(items, valueExtractor) {
        if (items.length === 0)
            return 0;
        let totalWeightedValue = 0;
        let totalWeight = 0;
        for (const item of items) {
            const value = valueExtractor(item.value);
            const weight = item.weight;
            totalWeightedValue += value * weight;
            totalWeight += weight;
        }
        return totalWeight > 0 ? totalWeightedValue / totalWeight : 0;
    }
    /**
     * Calculate simple weighted average from arrays
     */
    static calculateSimpleWeightedAverage(values, weights) {
        if (values.length !== weights.length || values.length === 0) {
            throw new Error('Values and weights arrays must have the same non-zero length');
        }
        const items = values.map((value, index) => ({
            value,
            weight: weights[index]
        }));
        return this.calculateWeightedAverage(items, item => item);
    }
    /**
     * Calculate statistical summary for an array of numbers
     */
    static calculateStatistics(values) {
        if (values.length === 0) {
            return {
                mean: 0,
                median: 0,
                standardDeviation: 0,
                min: 0,
                max: 0,
                count: 0
            };
        }
        const sortedValues = [...values].sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        // Calculate median
        const mid = Math.floor(sortedValues.length / 2);
        const median = sortedValues.length % 2 === 0
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
            : sortedValues[mid];
        // Calculate standard deviation
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        return {
            mean,
            median,
            standardDeviation,
            min: sortedValues[0],
            max: sortedValues[sortedValues.length - 1],
            count: values.length
        };
    }
    /**
     * Calculate percentile for a value in a dataset
     */
    static calculatePercentile(values, targetValue) {
        if (values.length === 0)
            return 0;
        const sortedValues = [...values].sort((a, b) => a - b);
        let countBelow = 0;
        for (const value of sortedValues) {
            if (value < targetValue) {
                countBelow++;
            }
            else {
                break;
            }
        }
        return (countBelow / values.length) * 100;
    }
    /**
     * Calculate rate (requests per second, etc.)
     */
    static calculateRate(count, timeWindowMs) {
        if (timeWindowMs <= 0)
            return 0;
        return (count / timeWindowMs) * 1000; // Convert to per-second
    }
    /**
     * Calculate throughput metrics
     */
    static calculateThroughput(totalRequests, totalTimeMs, windowSizeMs = 60000 // Default 1 minute window
    ) {
        const requestsPerSecond = this.calculateRate(totalRequests, Math.min(totalTimeMs, windowSizeMs));
        const requestsPerMinute = requestsPerSecond * 60;
        const averageRequestTime = totalRequests > 0 ? totalTimeMs / totalRequests : 0;
        return {
            requestsPerSecond,
            requestsPerMinute,
            averageRequestTime
        };
    }
    /**
     * Calculate success rate percentage
     */
    static calculateSuccessRate(successCount, totalCount) {
        if (totalCount === 0)
            return 0;
        return (successCount / totalCount) * 100;
    }
    /**
     * Calculate error rate percentage
     */
    static calculateErrorRate(errorCount, totalCount) {
        return 100 - this.calculateSuccessRate(totalCount - errorCount, totalCount);
    }
    /**
     * Calculate exponential decay factor for time-based weighting
     */
    static calculateTimeDecay(ageMs, halfLifeMs = 300000 // 5 minutes default
    ) {
        return Math.pow(0.5, ageMs / halfLifeMs);
    }
    /**
     * Calculate moving window average
     */
    static calculateWindowAverage(values, windowSizeMs, currentTime = Date.now()) {
        const cutoffTime = currentTime - windowSizeMs;
        const recentValues = values
            .filter(item => item.timestamp >= cutoffTime)
            .map(item => item.value);
        if (recentValues.length === 0)
            return 0;
        return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    }
    /**
     * Calculate correlation coefficient between two datasets
     */
    static calculateCorrelation(dataX, dataY) {
        if (dataX.length !== dataY.length || dataX.length === 0) {
            return 0;
        }
        const n = dataX.length;
        const meanX = dataX.reduce((sum, val) => sum + val, 0) / n;
        const meanY = dataY.reduce((sum, val) => sum + val, 0) / n;
        let numerator = 0;
        let sumSquareX = 0;
        let sumSquareY = 0;
        for (let i = 0; i < n; i++) {
            const deviationX = dataX[i] - meanX;
            const deviationY = dataY[i] - meanY;
            numerator += deviationX * deviationY;
            sumSquareX += deviationX * deviationX;
            sumSquareY += deviationY * deviationY;
        }
        const denominator = Math.sqrt(sumSquareX * sumSquareY);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    /**
     * Normalize value to 0-1 range based on min/max bounds
     */
    static normalize(value, min, max) {
        if (max === min)
            return 0;
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }
    /**
     * Calculate rolling variance
     */
    static calculateRollingVariance(values, windowSize) {
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = values.slice(start, i + 1);
            if (window.length === 1) {
                result.push(0);
            }
            else {
                const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
                const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
                result.push(variance);
            }
        }
        return result;
    }
}
//# sourceMappingURL=metrics-calculator.js.map