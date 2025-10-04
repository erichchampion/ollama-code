/**
 * Autonomous Development Constants
 *
 * Centralized configuration constants for autonomous development features
 * to eliminate hardcoded values and provide consistent defaults.
 */
export declare const AUTONOMOUS_DEVELOPMENT_DEFAULTS: {
    readonly MAX_CODEBASE_FILES: 50;
    readonly MAX_FILE_SIZE_BYTES: number;
    readonly MAX_PROCESSING_TIME_MS: 30000;
    readonly TEST_COVERAGE: {
        readonly MINIMUM: 70;
        readonly RECOMMENDED: 80;
        readonly EXCELLENT: 90;
        readonly COMPREHENSIVE: 95;
    };
    readonly CODE_QUALITY: {
        readonly MINIMUM_SCORE: 0.6;
        readonly RECOMMENDED_SCORE: 0.8;
        readonly EXCELLENT_SCORE: 0.9;
    };
    readonly COMPLEXITY: {
        readonly SIMPLE_MAX: 0.3;
        readonly MODERATE_MAX: 0.7;
        readonly COMPLEX_MIN: 0.7;
    };
    readonly TIME_MULTIPLIERS: {
        readonly SIMPLE: 1;
        readonly MODERATE: 1.5;
        readonly COMPLEX: 2.5;
        readonly INTEGRATION_FACTOR: 1.2;
        readonly TESTING_FACTOR: 1.4;
    };
    readonly RESOURCE_CALCULATION: {
        readonly BASE_HOURS_PER_REQUIREMENT: 2;
        readonly MEMORY_MB_PER_TASK: 50;
        readonly DISK_MB_PER_TASK: 10;
    };
    readonly RISK_ASSESSMENT: {
        readonly LOW_THRESHOLD: 0.3;
        readonly MEDIUM_THRESHOLD: 0.7;
        readonly HIGH_PROBABILITY_COMPLEX: 0.7;
        readonly INTEGRATION_RISK_PROBABILITY: 0.6;
        readonly DEFAULT_MITIGATION_COST: 0.2;
        readonly DEFAULT_MITIGATION_EFFECTIVENESS: 0.8;
    };
    readonly VALIDATION: {
        readonly MIN_COMPLETION_RATE_SUCCESS: 1;
        readonly MIN_COMPLETION_RATE_PARTIAL: 0.5;
        readonly DEFAULT_COMPILE_CHECK: true;
        readonly DEFAULT_TEST_REQUIRED: true;
    };
    readonly METRICS: {
        readonly DEFAULT_CODE_QUALITY: 0.85;
        readonly DEFAULT_TEST_COVERAGE: 82;
        readonly DEFAULT_PERFORMANCE_SCORE: 0.78;
        readonly MIN_SUCCESS_RATE_RECOMMENDATION: 0.8;
        readonly MIN_TEST_COVERAGE_RECOMMENDATION: 80;
        readonly HIGH_SEVERITY_ISSUE_THRESHOLD: 1;
    };
    readonly PHASES: {
        readonly ANALYSIS: {
            readonly REQUIREMENTS_ANALYSIS_HOURS: 2;
            readonly ARCHITECTURE_DESIGN_HOURS: 3;
            readonly RISK_LEVEL: "low";
        };
        readonly INTEGRATION: {
            readonly SYSTEM_INTEGRATION_HOURS: 3;
            readonly COMPREHENSIVE_TESTING_HOURS: 4;
            readonly RISK_LEVEL: "medium";
        };
    };
    readonly KEY_ARCHITECTURAL_FILES: readonly ["src/index.ts", "src/app.ts", "src/main.ts", "package.json", "tsconfig.json"];
    readonly DEFAULT_DEVELOPMENT_TOOLS: readonly ["typescript", "jest", "eslint"];
};
export type AutonomousDevelopmentConfig = typeof AUTONOMOUS_DEVELOPMENT_DEFAULTS;
/**
 * Get test coverage threshold by quality level
 */
export declare function getTestCoverageThreshold(level: 'minimum' | 'recommended' | 'excellent' | 'comprehensive'): number;
/**
 * Get complexity multiplier by complexity level
 */
export declare function getComplexityMultiplier(complexity: 'simple' | 'moderate' | 'complex'): number;
/**
 * Calculate estimated hours with configuration
 */
export declare function calculateEstimatedHours(requirementsCount: number, complexity: 'simple' | 'moderate' | 'complex', includeIntegration?: boolean, includeTesting?: boolean): number;
/**
 * Get risk level based on probability
 */
export declare function getRiskLevel(probability: number): 'low' | 'medium' | 'high';
/**
 * Calculate resource requirements
 */
export declare function calculateResourceRequirements(taskCount: number): {
    memoryRequirements: number;
    diskSpace: number;
};
