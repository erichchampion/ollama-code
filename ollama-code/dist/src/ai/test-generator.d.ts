/**
 * Test Generator
 *
 * Automated test generation system that creates comprehensive test suites
 * based on code analysis, coverage gaps, and testing best practices.
 */
export interface TestTemplate {
    id: string;
    name: string;
    description: string;
    framework: 'jest' | 'mocha' | 'vitest' | 'jasmine' | 'generic';
    category: 'unit' | 'integration' | 'e2e' | 'property' | 'performance' | 'security';
    pattern: RegExp | ((code: string) => boolean);
    generator: (context: TestContext) => TestCase[];
    priority: number;
}
export interface TestContext {
    sourceCode: string;
    filePath: string;
    className?: string;
    methodName?: string;
    parameters?: Parameter[];
    returnType?: string;
    dependencies?: string[];
    imports?: string[];
    framework?: string;
    existingTests?: string[];
    coverageGaps?: CoverageGap[];
}
export interface Parameter {
    name: string;
    type: string;
    isOptional: boolean;
    defaultValue?: any;
    constraints?: string[];
}
export interface CoverageGap {
    type: 'branch' | 'statement' | 'function' | 'line';
    location: {
        startLine: number;
        endLine: number;
        condition?: string;
    };
    description: string;
    priority: 'high' | 'medium' | 'low';
}
export interface TestCase {
    id: string;
    name: string;
    description: string;
    category: string;
    code: string;
    setup?: string;
    teardown?: string;
    assertions: TestAssertion[];
    mockRequirements?: MockRequirement[];
    dataProviders?: DataProvider[];
    tags: string[];
    estimatedRuntime: number;
    dependencies: string[];
}
export interface TestAssertion {
    type: 'equality' | 'truthiness' | 'exception' | 'type_check' | 'range' | 'regex' | 'custom';
    expected: any;
    actual: string;
    message?: string;
    negated?: boolean;
}
export interface MockRequirement {
    target: string;
    type: 'function' | 'class' | 'module' | 'api';
    behavior: 'return_value' | 'throw_error' | 'call_through' | 'spy';
    configuration: Record<string, any>;
}
export interface DataProvider {
    name: string;
    description: string;
    cases: TestDataCase[];
}
export interface TestDataCase {
    name: string;
    inputs: Record<string, any>;
    expectedOutput: any;
    shouldThrow?: boolean;
    tags?: string[];
}
export interface TestSuite {
    id: string;
    name: string;
    description: string;
    framework: string;
    targetFile: string;
    testCases: TestCase[];
    setup: {
        imports: string[];
        globalSetup?: string;
        beforeEach?: string;
        afterEach?: string;
        globalTeardown?: string;
    };
    configuration: {
        timeout: number;
        retries: number;
        parallel: boolean;
        environment: Record<string, any>;
    };
    metadata: {
        generatedAt: Date;
        coverageTarget: number;
        estimatedDuration: number;
        confidence: number;
    };
}
export interface TestGenerationReport {
    summary: {
        totalTests: number;
        coverageImprovement: number;
        criticalPaths: number;
        edgeCases: number;
        performance: number;
        security: number;
    };
    suites: TestSuite[];
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        category: string;
        description: string;
        impact: string;
    }[];
    gaps: {
        uncoveredCode: CoverageGap[];
        missingTestTypes: string[];
        riskAreas: string[];
    };
    quality: {
        score: number;
        maintainability: number;
        reliability: number;
        comprehensiveness: number;
    };
}
export declare class TestGenerator {
    private templates;
    constructor();
    /**
     * Generate comprehensive test suite for given code
     */
    generateTestSuite(sourceFiles: {
        path: string;
        content: string;
    }[], options?: {
        framework?: 'jest' | 'mocha' | 'vitest' | 'jasmine';
        testTypes?: ('unit' | 'integration' | 'e2e' | 'property' | 'performance' | 'security')[];
        coverageTarget?: number;
        includeEdgeCases?: boolean;
        generateMocks?: boolean;
        propertyTesting?: boolean;
    }): Promise<TestGenerationReport>;
    /**
     * Generate tests for specific coverage gaps
     */
    generateCoverageTests(sourceCode: string, filePath: string, gaps: CoverageGap[], framework?: string): Promise<TestCase[]>;
    /**
     * Analyze source file to extract testing context
     */
    private analyzeSourceFile;
    /**
     * Find applicable test templates for context
     */
    private findApplicableTemplates;
    /**
     * Create test suite from test cases
     */
    private createTestSuite;
    /**
     * Initialize test templates
     */
    private initializeTemplates;
    /**
     * Generate basic test code
     */
    private generateBasicTest;
    /**
     * Generate property-based test code
     */
    private generatePropertyTest;
    /**
     * Generate integration test code
     */
    private generateIntegrationTest;
    /**
     * Generate security test code
     */
    private generateSecurityTest;
    /**
     * Generate performance test code
     */
    private generatePerformanceTest;
    /**
     * Extract imports from source code
     */
    private extractImports;
    /**
     * Extract dependencies from source code
     */
    private extractDependencies;
    /**
     * Extract methods from source code
     */
    private extractMethods;
    /**
     * Parse parameter string into Parameter objects
     */
    private parseParameters;
    /**
     * Detect test framework from existing code
     */
    private detectTestFramework;
    /**
     * Generate appropriate imports for test cases
     */
    private generateImports;
    /**
     * Generate setup code for test suite
     */
    private generateSetup;
    /**
     * Generate tests for specific coverage gaps
     */
    private generateGapSpecificTests;
    /**
     * Generate branch coverage test
     */
    private generateBranchCoverageTest;
    /**
     * Generate statement coverage test
     */
    private generateStatementCoverageTest;
    /**
     * Analyze coverage gaps in source files
     */
    private analyzeCoverageGaps;
    /**
     * Calculate test quality metrics
     */
    private calculateTestQuality;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Estimate coverage improvement from generated tests
     */
    private estimateCoverageImprovement;
    /**
     * Identify missing test types
     */
    private identifyMissingTestTypes;
    /**
     * Identify risk areas in code
     */
    private identifyRiskAreas;
}
export declare function createTestGenerator(): TestGenerator;
