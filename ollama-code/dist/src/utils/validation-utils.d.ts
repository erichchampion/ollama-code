/**
 * Centralized Validation Utility
 *
 * Provides common validation patterns used across the codebase to eliminate duplication
 * and ensure consistent validation behavior.
 */
import { Result, ErrorDetails } from '../types/result.js';
export interface ValidationCriteria {
    compileCheck: boolean;
    testCoverage?: number;
    codeQualityScore?: number;
    performanceThresholds?: PerformanceThreshold[];
    securityChecks?: string[];
}
export interface PerformanceThreshold {
    metric: string;
    threshold: number;
    unit: string;
}
export interface ValidationResult {
    criterion: string;
    passed: boolean;
    score?: number;
    details: string;
    context?: Record<string, any>;
}
export interface ValidationContext {
    filePath?: string;
    taskId?: string;
    phaseId?: string;
    artifacts?: string[];
    metadata?: Record<string, any>;
}
/**
 * Validate compilation status
 */
export declare function validateCompilation(artifacts: string[], context?: ValidationContext): Promise<ValidationResult>;
/**
 * Validate test coverage
 */
export declare function validateTestCoverage(requiredCoverage: number, artifacts: string[], context?: ValidationContext): Promise<ValidationResult>;
/**
 * Validate code quality score
 */
export declare function validateCodeQuality(requiredScore: number, artifacts: string[], context?: ValidationContext): Promise<ValidationResult>;
/**
 * Validate performance thresholds
 */
export declare function validatePerformanceThresholds(thresholds: PerformanceThreshold[], artifacts: string[], context?: ValidationContext): Promise<ValidationResult>;
/**
 * Validate security checks
 */
export declare function validateSecurityChecks(checks: string[], artifacts: string[], context?: ValidationContext): Promise<ValidationResult>;
/**
 * Run comprehensive validation based on criteria
 */
export declare function validateTaskCriteria(criteria: ValidationCriteria, artifacts: string[], context?: ValidationContext): Promise<ValidationResult[]>;
/**
 * Check if all validation results passed
 */
export declare function allValidationsPassed(results: ValidationResult[]): boolean;
/**
 * Get validation summary
 */
export declare function getValidationSummary(results: ValidationResult[]): {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    successRate: number;
    failedCriteria: string[];
};
/**
 * Validate configuration object structure
 */
export declare function validateConfiguration<T>(config: any, requiredFields: (keyof T)[], optionalFields?: (keyof T)[]): Result<T, ErrorDetails>;
/**
 * Create default validation criteria based on configuration
 */
export declare function createDefaultValidationCriteria(includeTestCoverage?: boolean, includeCodeQuality?: boolean, includeCompileCheck?: boolean): ValidationCriteria;
