import { BaseTool, ToolResult, ToolExecutionContext } from './base-tool';
export interface TestingToolOptions {
    framework?: 'jest' | 'mocha' | 'vitest' | 'auto';
    testType?: 'unit' | 'integration' | 'e2e' | 'all';
    coverage?: boolean;
    mockStrategy?: 'full' | 'minimal' | 'none';
    language?: 'typescript' | 'javascript' | 'auto';
    outputPath?: string;
}
export interface TestGenerationResult {
    testFile: string;
    testCases: TestCase[];
    mockFiles?: string[];
    coverage?: CoverageInfo;
    recommendations: string[];
}
export interface TestCase {
    description: string;
    type: 'unit' | 'integration' | 'e2e';
    code: string;
    dependencies: string[];
    mocks: MockDefinition[];
}
export interface MockDefinition {
    target: string;
    type: 'function' | 'class' | 'module';
    implementation?: string;
}
export interface CoverageInfo {
    expectedCoverage: number;
    criticalPaths: string[];
    edgeCases: string[];
}
export declare class TestingTool extends BaseTool {
    name: string;
    description: string;
    execute(operation: string, context: ToolExecutionContext, options?: TestingToolOptions): Promise<ToolResult>;
    private generateTests;
    private analyzeTestability;
    private recommendTestStrategy;
    private analyzeCoverage;
    private generateMocks;
    private scaffoldTestSuite;
    private analyzeSourceForTesting;
    private parseSourceCode;
    private parseJavaScriptTypeScript;
    private extractFunctions;
    private extractClasses;
    private extractDependencies;
    private calculateComplexity;
    private calculateCyclomaticComplexity;
    private extractPublicApi;
    private identifySideEffects;
    private identifyAsyncOperations;
    private generateTestCases;
    private generateUnitTestCode;
    private generateClassTestCode;
    private generateIntegrationTestCode;
    private generateMocksForFunction;
    private generateMocksForClass;
    private generateTestCode;
    private generateTestImports;
    private calculateTestabilityScore;
    private suggestTestabilityImprovements;
    private detectTestingFramework;
    private detectLanguage;
    private getTestFilePath;
    private generateTestRecommendations;
    private calculateExpectedCoverage;
    private analyzeProjectStructure;
    private getAllFiles;
    private analyzeExistingTests;
    private recommendTestStructure;
    private recommendCoverageTargets;
    private prioritizeTestingEfforts;
    private recommendAutomationStrategy;
    private recommendPerformanceTestStrategy;
    private collectCoverageData;
    private identifyCoverageGaps;
    private generateCoverageRecommendations;
    private generateMockDefinitions;
    private generateMockImplementations;
    private generateMockUsageExamples;
    private createTestDirectoryStructure;
    private generateTestConfigFiles;
    private generateTestHelpers;
    private generateExampleTests;
}
