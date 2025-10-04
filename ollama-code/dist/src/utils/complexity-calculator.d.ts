/**
 * Centralized Complexity Calculator
 *
 * Provides standardized cyclomatic complexity calculation to eliminate DRY violations.
 * Uses consistent algorithms and configurable thresholds.
 */
export interface ComplexityResult {
    cyclomaticComplexity: number;
    rating: 'Low' | 'Moderate' | 'High' | 'Very High';
    description: string;
}
export interface ComplexityConfig {
    thresholds: {
        low: number;
        moderate: number;
        high: number;
    };
}
/**
 * Calculate cyclomatic complexity using McCabe's method
 */
export declare function calculateCyclomaticComplexity(content: string, config?: ComplexityConfig): ComplexityResult;
/**
 * Calculate average complexity for multiple files
 */
export declare function calculateAverageComplexity(files: Array<{
    content: string;
    path: string;
}>, config?: ComplexityConfig): {
    averageComplexity: number;
    totalComplexity: number;
    fileCount: number;
    distribution: Record<string, number>;
};
