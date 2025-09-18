/**
 * Testing and Test Generation Module
 *
 * Provides intelligent testing capabilities including:
 * - Automated test generation from source code
 * - Test framework detection and setup
 * - Test coverage analysis
 * - Performance testing
 * - Unit test suggestions
 */
export interface TestFramework {
    name: string;
    configFile: string;
    testPattern: string;
    runCommand: string;
    dependencies: string[];
}
export interface TestSuite {
    name: string;
    path: string;
    tests: Test[];
    coverage?: number;
    framework: string;
}
export interface Test {
    name: string;
    type: 'unit' | 'integration' | 'e2e';
    status: 'pass' | 'fail' | 'pending' | 'skip';
    duration?: number;
    error?: string;
}
export interface TestGenerationOptions {
    framework?: string;
    testType: 'unit' | 'integration' | 'e2e';
    includeEdgeCases: boolean;
    includeMocks: boolean;
    coverageTarget?: number;
}
export declare class TestManager {
    private workingDir;
    private supportedFrameworks;
    constructor(workingDir?: string);
    /**
     * Detect which testing framework is being used
     */
    detectFramework(): Promise<TestFramework | null>;
    /**
     * Setup testing framework for the project
     */
    setupFramework(frameworkName: string): Promise<void>;
    /**
     * Generate test cases for a source file
     */
    generateTests(filePath: string, options: TestGenerationOptions): Promise<string>;
    /**
     * Run tests and return results
     */
    runTests(pattern?: string): Promise<TestSuite[]>;
    /**
     * Analyze test coverage
     */
    analyzeCoverage(): Promise<any>;
    /**
     * Suggest test improvements
     */
    suggestTestImprovements(testFilePath: string): Promise<string[]>;
    /**
     * Analyze code structure for test generation
     */
    private analyzeCodeStructure;
    /**
     * Generate framework-specific config
     */
    private generateFrameworkConfig;
    /**
     * Update package.json scripts
     */
    private updatePackageJsonScripts;
    /**
     * Create test directory structure
     */
    private createTestDirectories;
    /**
     * Parse test results based on framework
     */
    private parseTestResults;
    /**
     * Parse coverage report
     */
    private parseCoverageReport;
}
/**
 * Default test manager instance
 */
export declare const testManager: TestManager;
