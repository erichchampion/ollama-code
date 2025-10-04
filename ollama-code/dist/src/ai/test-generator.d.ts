/**
 * Test Generator
 *
 * Provides automated test generation capabilities for various testing frameworks.
 * Generates unit tests, integration tests, and test strategies.
 */
export interface TestGenerationRequest {
    target: {
        file: string;
        functions?: string[];
        classes?: string[];
        entireFile?: boolean;
    };
    framework: TestFramework;
    testTypes: TestType[];
    options: TestGenerationOptions;
}
export type TestFramework = 'jest' | 'mocha' | 'vitest' | 'jasmine' | 'cypress' | 'playwright' | 'auto';
export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
export interface TestGenerationOptions {
    coverage: 'basic' | 'comprehensive' | 'extensive';
    mockExternal: boolean;
    includeEdgeCases: boolean;
    generatePropertyTests: boolean;
    asyncSupport: boolean;
    errorHandling: boolean;
    performanceTests: boolean;
}
export interface GeneratedTest {
    testFile: string;
    content: string;
    framework: TestFramework;
    testType: TestType;
    coverage: {
        functions: string[];
        branches: string[];
        statements: number;
        expectedCoverage: number;
    };
    dependencies: string[];
    setupRequired: string[];
    description: string;
}
export interface TestStrategy {
    recommendedFramework: TestFramework;
    testPyramid: {
        unit: number;
        integration: number;
        e2e: number;
    };
    coverage: {
        target: number;
        critical: string[];
        optional: string[];
    };
    priority: Array<{
        file: string;
        priority: 'high' | 'medium' | 'low';
        reason: string;
    }>;
    setupInstructions: string[];
    recommendations: string[];
}
export interface TestSuite {
    name: string;
    tests: GeneratedTest[];
    strategy: TestStrategy;
    setupFiles: Array<{
        path: string;
        content: string;
        description: string;
    }>;
    configFiles: Array<{
        path: string;
        content: string;
        description: string;
    }>;
    totalCoverage: number;
    estimatedRuntime: string;
}
export declare class TestGenerator {
    private config;
    /**
     * Generate comprehensive test suite for codebase
     */
    generateTestSuite(files: Array<{
        path: string;
        content: string;
        type: string;
    }>, options?: {
        framework?: TestFramework;
        testTypes?: TestType[];
        coverage?: 'basic' | 'comprehensive' | 'extensive';
    }): Promise<TestSuite>;
    /**
     * Generate tests for a specific file
     */
    generateTestsForFile(file: {
        path: string;
        content: string;
        type: string;
    }, options: {
        framework: TestFramework;
        testTypes: TestType[];
        coverage: 'basic' | 'comprehensive' | 'extensive';
    }): Promise<GeneratedTest[]>;
    /**
     * Generate unit tests
     */
    private generateUnitTests;
    /**
     * Generate unit test content for a function
     */
    private generateUnitTestContent;
    /**
     * Framework-specific test generators
     */
    private generateJestTest;
    private generateMochaTest;
    private generateVitestTest;
    private generateGenericTest;
    /**
     * Generate integration tests
     */
    private generateIntegrationTests;
    private generateIntegrationTestContent;
    /**
     * Generate E2E tests
     */
    private generateE2ETests;
    private generateE2ETestContent;
    private generateCypressTest;
    private generatePlaywrightTest;
    /**
     * Generate test strategy
     */
    private generateTestStrategy;
    /**
     * Helper methods
     */
    private analyzeFileForTesting;
    private extractFunctions;
    private analyzeFunctionSignature;
    private extractClasses;
    private extractDependencies;
    private analyzeCodebaseForTesting;
    private isCriticalFile;
    private shouldGenerateTestsFor;
    private detectOptimalFramework;
    private isE2ECandidate;
    private detectE2EFramework;
    private generateSampleInput;
    private generateExpectedOutput;
    private generateEdgeCaseTests;
    private generateAsyncTests;
    private generateErrorTests;
    private generateClassTestContent;
    private getTestFilePath;
    private getFileExtension;
    private getRelativeImportPath;
    private calculateComplexity;
    private assessTestability;
    private prioritizeFiles;
    private generateSetupInstructions;
    private generateTestingRecommendations;
    private generateSetupFiles;
    private generateSetupFileContent;
    private generateConfigFiles;
    private getConfigFileName;
    private generateConfigFileContent;
    private calculateExpectedCoverage;
    private estimateRuntime;
}
