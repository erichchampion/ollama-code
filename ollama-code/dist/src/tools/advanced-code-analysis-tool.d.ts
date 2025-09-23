import { BaseTool, ToolResult, ToolExecutionContext, ToolMetadata } from './types.js';
export interface CodeAnalysisOptions {
    language?: 'typescript' | 'javascript' | 'python' | 'auto';
    includeMetrics?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
    includeArchitectural?: boolean;
    includeRefactoring?: boolean;
    includeTesting?: boolean;
    depth?: 'shallow' | 'deep';
    scope?: 'file' | 'directory' | 'project';
    format?: 'json' | 'text' | 'detailed';
    frameworkPreference?: 'jest' | 'mocha' | 'vitest' | 'auto';
    coverageTarget?: number;
}
export declare class AdvancedCodeAnalysisTool extends BaseTool {
    private config;
    metadata: ToolMetadata;
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    private analyzeCode;
    private getCodeOverview;
    private analyzeDirectory;
    private analyzeFile;
    private getCodeMetrics;
    private calculateComplexity;
    private analyzeFileComplexity;
    private calculateCyclomaticComplexity;
    private categorizeComplexity;
    private rateComplexity;
    private calculateMaintainability;
    private analyzeMaintainability;
    private assessTestability;
    private assessDocumentation;
    private rateDocumentation;
    private analyzeQuality;
    private analyzeStructure;
    private analyzeStyle;
    private analyzePatterns;
    private checkBestPractices;
    private analyzeSecurity;
    private scanFileForVulnerabilities;
    private getSecurityRecommendation;
    private categorizeSecurityRisk;
    private legacySecurityCheck;
    private analyzePerformance;
    private analyzeFilePerformance;
    private suggestRefactoring;
    private analyzeRefactoringOpportunities;
    private findDuplicateLines;
    private generateRecommendations;
    private getAllFiles;
    private getCodeFiles;
    private getTestFiles;
    private detectLanguage;
    private detectTestingFramework;
    private findCorrespondingTestFile;
    private createSuccessResult;
    /**
     * Comprehensive architectural analysis including patterns, code smells, and dependency analysis
     */
    private analyzeArchitecture;
    private analyzeArchitecturalPatterns;
    private calculateArchitecturalMetrics;
    private calculateArchitecturalQuality;
    private getLocationFromMatch;
    private calculatePatternConfidence;
    private getRecommendedPatterns;
    private generateArchitecturalRecommendations;
    /**
     * Advanced test generation with comprehensive coverage analysis
     */
    private generateTests;
    private generateTestSuiteForFile;
    private extractClassName;
    private extractMethods;
    private extractDependencies;
    private generateBasicTest;
    private generateErrorTest;
    private generateIntegrationTest;
    private estimateCoverageImprovement;
    private generateTestingRecommendations;
    private createErrorResult;
}
