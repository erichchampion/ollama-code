import { BaseTool } from './base-tool';
import * as fs from 'fs';
import * as path from 'path';
export class TestingTool extends BaseTool {
    name = 'testing';
    description = 'Automated test generation and testing strategy recommendations';
    async execute(operation, context, options = {}) {
        try {
            switch (operation.toLowerCase()) {
                case 'generate':
                    return await this.generateTests(context, options);
                case 'analyze':
                    return await this.analyzeTestability(context, options);
                case 'strategy':
                    return await this.recommendTestStrategy(context, options);
                case 'coverage':
                    return await this.analyzeCoverage(context, options);
                case 'mocks':
                    return await this.generateMocks(context, options);
                case 'scaffold':
                    return await this.scaffoldTestSuite(context, options);
                default:
                    return this.createErrorResult(`Unknown testing operation: ${operation}`);
            }
        }
        catch (error) {
            return this.createErrorResult(`Testing tool error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async generateTests(context, options) {
        const { filePath, targetFunction, targetClass } = context;
        if (!filePath || !fs.existsSync(filePath)) {
            return this.createErrorResult('Invalid file path for test generation');
        }
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const framework = options.framework || this.detectTestingFramework(context.workingDir);
        const language = options.language || this.detectLanguage(filePath);
        const analysisResult = await this.analyzeSourceForTesting(sourceCode, filePath, language);
        const testCases = this.generateTestCases(analysisResult, options);
        const testCode = this.generateTestCode(testCases, framework, language);
        const testFilePath = this.getTestFilePath(filePath, options.outputPath);
        const result = {
            testFile: testFilePath,
            testCases,
            recommendations: this.generateTestRecommendations(analysisResult, options),
            coverage: this.calculateExpectedCoverage(analysisResult, testCases)
        };
        if (options.mockStrategy !== 'none') {
            result.mockFiles = this.generateMockFiles(analysisResult, options);
        }
        return this.createSuccessResult('Tests generated successfully', {
            summary: `Generated ${testCases.length} test cases for ${path.basename(filePath)}`,
            details: result,
            generatedCode: testCode,
            filePath: testFilePath
        });
    }
    async analyzeTestability(context, options) {
        const { filePath } = context;
        if (!filePath || !fs.existsSync(filePath)) {
            return this.createErrorResult('Invalid file path for testability analysis');
        }
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const language = this.detectLanguage(filePath);
        const analysis = await this.analyzeSourceForTesting(sourceCode, filePath, language);
        const testabilityScore = this.calculateTestabilityScore(analysis);
        const improvements = this.suggestTestabilityImprovements(analysis);
        return this.createSuccessResult('Testability analysis completed', {
            score: testabilityScore,
            analysis: {
                complexity: analysis.complexity,
                dependencies: analysis.dependencies.length,
                publicMethods: analysis.functions.filter(f => f.visibility === 'public').length,
                privateMethods: analysis.functions.filter(f => f.visibility === 'private').length,
                cyclomaticComplexity: analysis.cyclomaticComplexity,
                testableUnits: analysis.functions.length + analysis.classes.length
            },
            improvements,
            recommendations: [
                'Reduce function complexity for easier testing',
                'Consider dependency injection for better mockability',
                'Extract pure functions where possible',
                'Add more granular public interfaces'
            ]
        });
    }
    async recommendTestStrategy(context, options) {
        const projectStructure = await this.analyzeProjectStructure(context.workingDir);
        const existingTests = await this.analyzeExistingTests(context.workingDir);
        const framework = this.detectTestingFramework(context.workingDir);
        const strategy = {
            recommended_framework: framework || 'jest',
            test_structure: this.recommendTestStructure(projectStructure),
            coverage_targets: this.recommendCoverageTargets(projectStructure),
            testing_priorities: this.prioritizeTestingEfforts(projectStructure),
            automation_strategy: this.recommendAutomationStrategy(projectStructure),
            performance_testing: this.recommendPerformanceTestStrategy(projectStructure)
        };
        return this.createSuccessResult('Testing strategy recommended', {
            strategy,
            current_state: {
                existing_tests: existingTests.testFiles.length,
                coverage: existingTests.estimatedCoverage,
                framework: framework || 'none detected'
            },
            next_steps: [
                'Set up testing framework if not present',
                'Create test structure following recommended patterns',
                'Implement unit tests for core business logic',
                'Add integration tests for critical workflows',
                'Set up continuous integration testing'
            ]
        });
    }
    async analyzeCoverage(context, options) {
        const { workingDir } = context;
        const coverageData = await this.collectCoverageData(workingDir);
        const gaps = this.identifyCoverageGaps(coverageData);
        const recommendations = this.generateCoverageRecommendations(gaps);
        return this.createSuccessResult('Coverage analysis completed', {
            overall_coverage: coverageData.overall,
            by_type: coverageData.byType,
            critical_gaps: gaps.critical,
            recommended_targets: recommendations.targets,
            improvement_plan: recommendations.plan
        });
    }
    async generateMocks(context, options) {
        const { filePath } = context;
        if (!filePath || !fs.existsSync(filePath)) {
            return this.createErrorResult('Invalid file path for mock generation');
        }
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const analysis = await this.analyzeSourceForTesting(sourceCode, filePath, options.language || 'typescript');
        const mocks = this.generateMockDefinitions(analysis, options);
        const mockCode = this.generateMockImplementations(mocks, options.framework || 'jest');
        return this.createSuccessResult('Mocks generated successfully', {
            mocks,
            mockCode,
            usage_examples: this.generateMockUsageExamples(mocks)
        });
    }
    async scaffoldTestSuite(context, options) {
        const { workingDir } = context;
        const projectStructure = await this.analyzeProjectStructure(workingDir);
        const framework = options.framework || this.detectTestingFramework(workingDir) || 'jest';
        const scaffolding = {
            structure: this.createTestDirectoryStructure(projectStructure),
            config_files: this.generateTestConfigFiles(framework, options),
            helper_files: this.generateTestHelpers(framework),
            example_tests: this.generateExampleTests(framework, projectStructure)
        };
        return this.createSuccessResult('Test suite scaffolded', {
            framework,
            structure: scaffolding.structure,
            files_created: Object.keys(scaffolding.config_files).length + Object.keys(scaffolding.helper_files).length,
            next_steps: [
                'Review generated test configuration',
                'Customize test helpers for your needs',
                'Run example tests to verify setup',
                'Begin implementing actual test cases'
            ]
        });
    }
    async analyzeSourceForTesting(sourceCode, filePath, language) {
        const ast = this.parseSourceCode(sourceCode, language);
        return {
            functions: this.extractFunctions(ast),
            classes: this.extractClasses(ast),
            dependencies: this.extractDependencies(ast),
            complexity: this.calculateComplexity(ast),
            cyclomaticComplexity: this.calculateCyclomaticComplexity(ast),
            publicApi: this.extractPublicApi(ast),
            sideEffects: this.identifySideEffects(ast),
            asyncOperations: this.identifyAsyncOperations(ast)
        };
    }
    parseSourceCode(sourceCode, language) {
        try {
            if (language === 'typescript' || language === 'javascript') {
                return this.parseJavaScriptTypeScript(sourceCode);
            }
            return { type: 'unknown', body: [] };
        }
        catch (error) {
            return { type: 'error', body: [], error: error instanceof Error ? error.message : String(error) };
        }
    }
    parseJavaScriptTypeScript(sourceCode) {
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g;
        const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g;
        const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        const functions = [];
        const classes = [];
        const imports = [];
        let match;
        while ((match = functionRegex.exec(sourceCode)) !== null) {
            functions.push({
                name: match[1],
                type: 'function',
                visibility: sourceCode.includes(`export`) ? 'public' : 'private'
            });
        }
        while ((match = classRegex.exec(sourceCode)) !== null) {
            classes.push({
                name: match[1],
                type: 'class',
                visibility: sourceCode.includes(`export`) ? 'public' : 'private'
            });
        }
        while ((match = importRegex.exec(sourceCode)) !== null) {
            imports.push(match[1]);
        }
        return {
            type: 'javascript/typescript',
            functions,
            classes,
            imports,
            body: sourceCode.split('\n')
        };
    }
    extractFunctions(ast) {
        return ast.functions || [];
    }
    extractClasses(ast) {
        return ast.classes || [];
    }
    extractDependencies(ast) {
        return ast.imports || [];
    }
    calculateComplexity(ast) {
        const lines = ast.body?.length || 0;
        const functions = ast.functions?.length || 0;
        const classes = ast.classes?.length || 0;
        return Math.min(10, Math.max(1, Math.floor((lines + functions * 2 + classes * 3) / 50)));
    }
    calculateCyclomaticComplexity(ast) {
        const sourceCode = ast.body?.join('\n') || '';
        const conditionals = (sourceCode.match(/\b(if|while|for|case|catch)\b/g) || []).length;
        const logicalOperators = (sourceCode.match(/(\|\||&&)/g) || []).length;
        return conditionals + logicalOperators + 1;
    }
    extractPublicApi(ast) {
        const functions = ast.functions?.filter((f) => f.visibility === 'public') || [];
        const classes = ast.classes?.filter((c) => c.visibility === 'public') || [];
        return [...functions, ...classes];
    }
    identifySideEffects(ast) {
        const sourceCode = ast.body?.join('\n') || '';
        const sideEffects = [];
        if (sourceCode.includes('console.'))
            sideEffects.push('console output');
        if (sourceCode.includes('fs.') || sourceCode.includes('readFile') || sourceCode.includes('writeFile'))
            sideEffects.push('file system');
        if (sourceCode.includes('fetch') || sourceCode.includes('axios') || sourceCode.includes('http'))
            sideEffects.push('network requests');
        if (sourceCode.includes('localStorage') || sourceCode.includes('sessionStorage'))
            sideEffects.push('browser storage');
        if (sourceCode.includes('Math.random') || sourceCode.includes('Date.now'))
            sideEffects.push('non-deterministic values');
        return sideEffects;
    }
    identifyAsyncOperations(ast) {
        const sourceCode = ast.body?.join('\n') || '';
        const asyncOps = [];
        if (sourceCode.includes('async') || sourceCode.includes('await'))
            asyncOps.push('async/await');
        if (sourceCode.includes('Promise'))
            asyncOps.push('promises');
        if (sourceCode.includes('setTimeout') || sourceCode.includes('setInterval'))
            asyncOps.push('timers');
        if (sourceCode.includes('fetch') || sourceCode.includes('axios'))
            asyncOps.push('network requests');
        return asyncOps;
    }
    generateTestCases(analysis, options) {
        const testCases = [];
        analysis.functions.forEach((func) => {
            testCases.push({
                description: `should test ${func.name} with valid inputs`,
                type: 'unit',
                code: this.generateUnitTestCode(func, 'valid'),
                dependencies: analysis.dependencies,
                mocks: this.generateMocksForFunction(func, analysis.dependencies)
            });
            testCases.push({
                description: `should test ${func.name} with invalid inputs`,
                type: 'unit',
                code: this.generateUnitTestCode(func, 'invalid'),
                dependencies: analysis.dependencies,
                mocks: this.generateMocksForFunction(func, analysis.dependencies)
            });
        });
        analysis.classes.forEach((cls) => {
            testCases.push({
                description: `should instantiate ${cls.name} correctly`,
                type: 'unit',
                code: this.generateClassTestCode(cls, 'instantiation'),
                dependencies: analysis.dependencies,
                mocks: this.generateMocksForClass(cls, analysis.dependencies)
            });
        });
        if (options.testType === 'integration' || options.testType === 'all') {
            testCases.push({
                description: 'should test component integration',
                type: 'integration',
                code: this.generateIntegrationTestCode(analysis),
                dependencies: analysis.dependencies,
                mocks: []
            });
        }
        return testCases;
    }
    generateUnitTestCode(func, scenario) {
        const testName = `${func.name} - ${scenario} scenario`;
        return `
describe('${func.name}', () => {
  it('${testName}', () => {
    // Arrange
    const input = ${scenario === 'valid' ? '/* valid input */' : '/* invalid input */'};

    // Act
    const result = ${func.name}(input);

    // Assert
    expect(result).${scenario === 'valid' ? 'toBeDefined()' : 'toThrow()'};
  });
});`;
    }
    generateClassTestCode(cls, scenario) {
        return `
describe('${cls.name}', () => {
  it('should ${scenario}', () => {
    // Arrange & Act
    const instance = new ${cls.name}();

    // Assert
    expect(instance).toBeInstanceOf(${cls.name});
  });
});`;
    }
    generateIntegrationTestCode(analysis) {
        return `
describe('Integration Tests', () => {
  it('should integrate components correctly', async () => {
    // Arrange
    const testData = {};

    // Act
    const result = await integrationTestFunction(testData);

    // Assert
    expect(result).toBeDefined();
  });
});`;
    }
    generateMocksForFunction(func, dependencies) {
        return dependencies.map(dep => ({
            target: dep,
            type: 'module',
            implementation: `jest.mock('${dep}');`
        }));
    }
    generateMocksForClass(cls, dependencies) {
        return dependencies.map(dep => ({
            target: dep,
            type: 'class',
            implementation: `jest.mock('${dep}');`
        }));
    }
    generateTestCode(testCases, framework, language) {
        const imports = this.generateTestImports(framework, language);
        const testCode = testCases.map(tc => tc.code).join('\n\n');
        return `${imports}\n\n${testCode}`;
    }
    generateTestImports(framework, language) {
        if (framework === 'jest') {
            return language === 'typescript'
                ? "import { describe, it, expect, jest } from '@jest/globals';"
                : "const { describe, it, expect, jest } = require('@jest/globals');";
        }
        return '';
    }
    calculateTestabilityScore(analysis) {
        let score = 100;
        if (analysis.complexity > 7)
            score -= 20;
        if (analysis.cyclomaticComplexity > 10)
            score -= 15;
        if (analysis.dependencies.length > 5)
            score -= 10;
        if (analysis.sideEffects.length > 2)
            score -= 15;
        if (analysis.publicApi.length === 0)
            score -= 20;
        return Math.max(0, score);
    }
    suggestTestabilityImprovements(analysis) {
        const improvements = [];
        if (analysis.complexity > 7) {
            improvements.push('Reduce function complexity by breaking down large functions');
        }
        if (analysis.cyclomaticComplexity > 10) {
            improvements.push('Simplify conditional logic and reduce branching');
        }
        if (analysis.dependencies.length > 5) {
            improvements.push('Consider dependency injection to reduce coupling');
        }
        if (analysis.sideEffects.length > 2) {
            improvements.push('Extract side effects to make functions more pure');
        }
        if (analysis.publicApi.length === 0) {
            improvements.push('Expose testable public interfaces');
        }
        return improvements;
    }
    detectTestingFramework(workingDir) {
        const packageJsonPath = path.join(workingDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (deps.jest)
                return 'jest';
            if (deps.mocha)
                return 'mocha';
            if (deps.vitest)
                return 'vitest';
        }
        return null;
    }
    detectLanguage(filePath) {
        const ext = path.extname(filePath);
        if (ext === '.ts' || ext === '.tsx')
            return 'typescript';
        if (ext === '.js' || ext === '.jsx')
            return 'javascript';
        return 'javascript';
    }
    getTestFilePath(sourcePath, outputPath) {
        const dir = outputPath || path.dirname(sourcePath);
        const name = path.basename(sourcePath, path.extname(sourcePath));
        const ext = this.detectLanguage(sourcePath) === 'typescript' ? '.test.ts' : '.test.js';
        return path.join(dir, `${name}${ext}`);
    }
    generateTestRecommendations(analysis, options) {
        const recommendations = [];
        if (analysis.asyncOperations.length > 0) {
            recommendations.push('Consider using async/await testing patterns for asynchronous code');
        }
        if (analysis.sideEffects.includes('network requests')) {
            recommendations.push('Mock external API calls to ensure test reliability');
        }
        if (analysis.sideEffects.includes('file system')) {
            recommendations.push('Use temporary files or mock file system operations');
        }
        if (analysis.complexity > 5) {
            recommendations.push('Focus on testing critical paths and edge cases');
        }
        return recommendations;
    }
    calculateExpectedCoverage(analysis, testCases) {
        const functionCoverage = testCases.filter(tc => tc.type === 'unit').length / analysis.functions.length;
        const expectedCoverage = Math.min(95, Math.max(60, functionCoverage * 100));
        return {
            expectedCoverage,
            criticalPaths: analysis.functions.filter((f) => f.visibility === 'public').map((f) => f.name),
            edgeCases: ['null inputs', 'empty arrays', 'boundary values', 'error conditions']
        };
    }
    async analyzeProjectStructure(workingDir) {
        const structure = {
            sourceFiles: [],
            testFiles: [],
            configFiles: [],
            packageManager: 'npm'
        };
        try {
            const files = this.getAllFiles(workingDir);
            files.forEach(file => {
                if (file.endsWith('.test.js') || file.endsWith('.test.ts') || file.endsWith('.spec.js') || file.endsWith('.spec.ts')) {
                    structure.testFiles.push(file);
                }
                else if (file.endsWith('.js') || file.endsWith('.ts')) {
                    structure.sourceFiles.push(file);
                }
                else if (file.includes('config') || file.includes('.json')) {
                    structure.configFiles.push(file);
                }
            });
            if (fs.existsSync(path.join(workingDir, 'yarn.lock'))) {
                structure.packageManager = 'yarn';
            }
            else if (fs.existsSync(path.join(workingDir, 'pnpm-lock.yaml'))) {
                structure.packageManager = 'pnpm';
            }
        }
        catch (error) {
            // Handle errors silently
        }
        return structure;
    }
    getAllFiles(dir, files = []) {
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                if (item.startsWith('.') || item === 'node_modules')
                    continue;
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    this.getAllFiles(fullPath, files);
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            // Handle errors silently
        }
        return files;
    }
    async analyzeExistingTests(workingDir) {
        const structure = await this.analyzeProjectStructure(workingDir);
        return {
            testFiles: structure.testFiles,
            estimatedCoverage: structure.testFiles.length > 0 ? Math.min(80, structure.testFiles.length * 10) : 0,
            framework: this.detectTestingFramework(workingDir)
        };
    }
    recommendTestStructure(projectStructure) {
        return {
            pattern: 'co-located',
            directories: ['__tests__', 'test', 'tests'],
            naming: '*.test.{js,ts}',
            organization: 'by-feature'
        };
    }
    recommendCoverageTargets(projectStructure) {
        return {
            unit: 80,
            integration: 60,
            e2e: 40,
            overall: 75
        };
    }
    prioritizeTestingEfforts(projectStructure) {
        return [
            'Core business logic functions',
            'Public API endpoints',
            'Data transformation utilities',
            'Error handling paths',
            'Integration points'
        ];
    }
    recommendAutomationStrategy(projectStructure) {
        return {
            ci_integration: true,
            pre_commit_hooks: true,
            coverage_reporting: true,
            automated_test_generation: false
        };
    }
    recommendPerformanceTestStrategy(projectStructure) {
        return {
            load_testing: projectStructure.sourceFiles.some((f) => f.includes('server') || f.includes('api')),
            benchmarking: true,
            memory_profiling: false
        };
    }
    async collectCoverageData(workingDir) {
        return {
            overall: 0,
            byType: {
                unit: 0,
                integration: 0,
                e2e: 0
            }
        };
    }
    identifyCoverageGaps(coverageData) {
        return {
            critical: [],
            medium: [],
            low: []
        };
    }
    generateCoverageRecommendations(gaps) {
        return {
            targets: {
                unit: 80,
                integration: 60,
                overall: 75
            },
            plan: [
                'Focus on unit testing core business logic',
                'Add integration tests for critical workflows',
                'Implement end-to-end tests for user journeys'
            ]
        };
    }
    generateMockDefinitions(analysis, options) {
        const mocks = [];
        analysis.dependencies.forEach((dep) => {
            mocks.push({
                target: dep,
                type: 'module',
                implementation: `jest.mock('${dep}');`
            });
        });
        return mocks;
    }
    generateMockImplementations(mocks, framework) {
        return mocks.map(mock => mock.implementation).join('\n');
    }
    generateMockUsageExamples(mocks) {
        return mocks.map(mock => `// Mock ${mock.target}\n${mock.implementation}`);
    }
    createTestDirectoryStructure(projectStructure) {
        return {
            'tests/unit': 'Unit test files',
            'tests/integration': 'Integration test files',
            'tests/e2e': 'End-to-end test files',
            'tests/fixtures': 'Test data and fixtures',
            'tests/helpers': 'Test utility functions'
        };
    }
    generateTestConfigFiles(framework, options) {
        const configs = {};
        if (framework === 'jest') {
            configs['jest.config.js'] = `module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ]
};`;
        }
        return configs;
    }
    generateTestHelpers(framework) {
        const helpers = {};
        helpers['tests/helpers/test-utils.js'] = `
export const createMockData = (overrides = {}) => ({
  id: 1,
  name: 'Test Item',
  ...overrides
});

export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockConsole = () => {
  const originalConsole = console;
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();

  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  };
};
`;
        return helpers;
    }
    generateExampleTests(framework, projectStructure) {
        const examples = {};
        examples['tests/examples/example.test.js'] = `
describe('Example Test Suite', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should demonstrate basic testing patterns', () => {
    // Arrange
    const input = 'test data';

    // Act
    const result = processInput(input);

    // Assert
    expect(result).toBeDefined();
  });

  it('should test async operations', async () => {
    // Arrange
    const asyncData = Promise.resolve('async result');

    // Act
    const result = await asyncData;

    // Assert
    expect(result).toBe('async result');
  });
});
`;
        return examples;
    }
}
//# sourceMappingURL=testing-tool.js.map