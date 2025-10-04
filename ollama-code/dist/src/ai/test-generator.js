/**
 * Test Generator
 *
 * Provides automated test generation capabilities for various testing frameworks.
 * Generates unit tests, integration tests, and test strategies.
 */
import { logger } from '../utils/logger.js';
import { getPerformanceConfig } from '../config/performance.js';
import * as path from 'path';
export class TestGenerator {
    config = getPerformanceConfig();
    /**
     * Generate comprehensive test suite for codebase
     */
    async generateTestSuite(files, options = {}) {
        try {
            logger.info('Generating test suite', { fileCount: files.length, options });
            const framework = options.framework || this.detectOptimalFramework(files);
            const testTypes = options.testTypes || ['unit', 'integration'];
            const coverage = options.coverage || 'comprehensive';
            const strategy = await this.generateTestStrategy(files, framework);
            const tests = [];
            for (const file of files) {
                if (this.shouldGenerateTestsFor(file)) {
                    const fileTests = await this.generateTestsForFile(file, {
                        framework,
                        testTypes,
                        coverage
                    });
                    tests.push(...fileTests);
                }
            }
            const setupFiles = await this.generateSetupFiles(framework, tests);
            const configFiles = await this.generateConfigFiles(framework, tests);
            const totalCoverage = this.calculateExpectedCoverage(tests);
            return {
                name: `Test Suite (${framework})`,
                tests,
                strategy,
                setupFiles,
                configFiles,
                totalCoverage,
                estimatedRuntime: this.estimateRuntime(tests)
            };
        }
        catch (error) {
            logger.error('Test suite generation failed:', error);
            throw error;
        }
    }
    /**
     * Generate tests for a specific file
     */
    async generateTestsForFile(file, options) {
        const tests = [];
        const analysis = this.analyzeFileForTesting(file);
        for (const testType of options.testTypes) {
            if (testType === 'unit') {
                tests.push(...await this.generateUnitTests(file, analysis, options));
            }
            else if (testType === 'integration') {
                tests.push(...await this.generateIntegrationTests(file, analysis, options));
            }
            else if (testType === 'e2e' && this.isE2ECandidate(file)) {
                tests.push(...await this.generateE2ETests(file, analysis, options));
            }
        }
        return tests;
    }
    /**
     * Generate unit tests
     */
    async generateUnitTests(file, analysis, options) {
        const tests = [];
        for (const func of analysis.functions) {
            const testContent = this.generateUnitTestContent(func, options.framework, file);
            tests.push({
                testFile: this.getTestFilePath(file.path, 'unit', options.framework),
                content: testContent,
                framework: options.framework,
                testType: 'unit',
                coverage: {
                    functions: [func.name],
                    branches: func.branches,
                    statements: func.statements,
                    expectedCoverage: this.config.codeAnalysis.testing.coverageTarget || 85
                },
                dependencies: this.extractDependencies(file),
                setupRequired: ['Mock external dependencies', 'Setup test environment'],
                description: `Unit tests for ${func.name} function`
            });
        }
        for (const cls of analysis.classes) {
            const testContent = this.generateClassTestContent(cls, options.framework, file);
            tests.push({
                testFile: this.getTestFilePath(file.path, 'unit', options.framework),
                content: testContent,
                framework: options.framework,
                testType: 'unit',
                coverage: {
                    functions: cls.methods,
                    branches: cls.branches,
                    statements: cls.statements,
                    expectedCoverage: this.config.codeAnalysis.testing.coverageTarget
                },
                dependencies: this.extractDependencies(file),
                setupRequired: ['Mock dependencies', 'Setup class instances'],
                description: `Unit tests for ${cls.name} class`
            });
        }
        return tests;
    }
    /**
     * Generate unit test content for a function
     */
    generateUnitTestContent(func, framework, file) {
        const testName = `${func.name}.test.${this.getFileExtension(framework)}`;
        const modulePath = this.getRelativeImportPath(file.path);
        if (framework === 'jest') {
            return this.generateJestTest(func, modulePath);
        }
        else if (framework === 'mocha') {
            return this.generateMochaTest(func, modulePath);
        }
        else if (framework === 'vitest') {
            return this.generateVitestTest(func, modulePath);
        }
        else {
            return this.generateGenericTest(func, modulePath);
        }
    }
    /**
     * Framework-specific test generators
     */
    generateJestTest(func, modulePath) {
        const imports = `import { ${func.name} } from '${modulePath}';`;
        const mocks = func.dependencies.map(dep => `jest.mock('${dep}');`).join('\n');
        return `${imports}
${mocks}

describe('${func.name}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle normal case', () => {
    // Arrange
    const input = ${this.generateSampleInput(func)};
    const expected = ${this.generateExpectedOutput(func)};

    // Act
    const result = ${func.name}(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should handle edge cases', () => {
    // Test edge cases
    ${this.generateEdgeCaseTests(func)}
  });

  ${func.isAsync ? this.generateAsyncTests(func) : ''}

  ${func.canThrow ? this.generateErrorTests(func) : ''}
});
`;
    }
    generateMochaTest(func, modulePath) {
        return `const { expect } = require('chai');
const { ${func.name} } = require('${modulePath}');

describe('${func.name}', () => {
  it('should handle normal case', () => {
    const input = ${this.generateSampleInput(func)};
    const expected = ${this.generateExpectedOutput(func)};

    const result = ${func.name}(input);

    expect(result).to.equal(expected);
  });

  it('should handle edge cases', () => {
    ${this.generateEdgeCaseTests(func)}
  });
});
`;
    }
    generateVitestTest(func, modulePath) {
        return `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${func.name} } from '${modulePath}';

describe('${func.name}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle normal case', () => {
    const input = ${this.generateSampleInput(func)};
    const expected = ${this.generateExpectedOutput(func)};

    const result = ${func.name}(input);

    expect(result).toEqual(expected);
  });
});
`;
    }
    generateGenericTest(func, modulePath) {
        return `// Generic test template for ${func.name}
// TODO: Adapt for your testing framework

function test_${func.name}() {
  const input = ${this.generateSampleInput(func)};
  const expected = ${this.generateExpectedOutput(func)};

  const result = ${func.name}(input);

  assert(result === expected, 'Function should return expected value');
}
`;
    }
    /**
     * Generate integration tests
     */
    async generateIntegrationTests(file, analysis, options) {
        const tests = [];
        if (analysis.hasExternalDependencies) {
            const testContent = this.generateIntegrationTestContent(file, analysis, options.framework);
            tests.push({
                testFile: this.getTestFilePath(file.path, 'integration', options.framework),
                content: testContent,
                framework: options.framework,
                testType: 'integration',
                coverage: {
                    functions: analysis.functions.map(f => f.name),
                    branches: [],
                    statements: 0,
                    expectedCoverage: this.config.codeAnalysis.testing.coverageTarget * 0.875
                },
                dependencies: analysis.externalDependencies,
                setupRequired: ['Database setup', 'API mocking', 'Environment configuration'],
                description: `Integration tests for ${path.basename(file.path)}`
            });
        }
        return tests;
    }
    generateIntegrationTestContent(file, analysis, framework) {
        return `// Integration tests for ${path.basename(file.path)}
// Tests interaction between components and external dependencies

describe('${path.basename(file.path)} Integration', () => {
  beforeAll(async () => {
    // Setup test environment
    // Initialize database connections
    // Start mock servers
  });

  afterAll(async () => {
    // Cleanup test environment
    // Close database connections
    // Stop mock servers
  });

  it('should integrate with external services', async () => {
    // Test external API calls
    // Test database operations
    // Test file system operations
  });

  it('should handle service failures gracefully', async () => {
    // Test error scenarios
    // Test fallback mechanisms
    // Test retry logic
  });
});
`;
    }
    /**
     * Generate E2E tests
     */
    async generateE2ETests(file, analysis, options) {
        if (!this.isE2ECandidate(file)) {
            return [];
        }
        const framework = this.detectE2EFramework(options.framework);
        const testContent = this.generateE2ETestContent(file, framework);
        return [{
                testFile: this.getTestFilePath(file.path, 'e2e', framework),
                content: testContent,
                framework: framework,
                testType: 'e2e',
                coverage: {
                    functions: [],
                    branches: [],
                    statements: 0,
                    expectedCoverage: this.config.codeAnalysis.testing.coverageTarget * 0.75
                },
                dependencies: ['browser', 'test-server'],
                setupRequired: ['Start application', 'Setup test data', 'Configure browser'],
                description: `End-to-end tests for ${path.basename(file.path)}`
            }];
    }
    generateE2ETestContent(file, framework) {
        if (framework === 'cypress') {
            return this.generateCypressTest(file);
        }
        else if (framework === 'playwright') {
            return this.generatePlaywrightTest(file);
        }
        return '';
    }
    generateCypressTest(file) {
        return `describe('${path.basename(file.path)} E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete user workflow', () => {
    // User interaction tests
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/success');
  });

  it('should handle error scenarios', () => {
    // Error handling tests
    cy.get('[data-testid="error-trigger"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
`;
    }
    generatePlaywrightTest(file) {
        return `import { test, expect } from '@playwright/test';

test.describe('${path.basename(file.path)} E2E', () => {
  test('should complete user workflow', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="submit"]');
    await expect(page).toHaveURL(/.*success/);
  });

  test('should handle error scenarios', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="error-trigger"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
`;
    }
    /**
     * Generate test strategy
     */
    async generateTestStrategy(files, framework) {
        const analysis = this.analyzeCodebaseForTesting(files);
        return {
            recommendedFramework: framework,
            testPyramid: {
                unit: 70,
                integration: 20,
                e2e: 10
            },
            coverage: {
                target: this.config.codeAnalysis.testing.coverageTarget,
                critical: analysis.criticalFiles,
                optional: analysis.optionalFiles
            },
            priority: this.prioritizeFiles(files),
            setupInstructions: this.generateSetupInstructions(framework),
            recommendations: this.generateTestingRecommendations(analysis)
        };
    }
    /**
     * Helper methods
     */
    analyzeFileForTesting(file) {
        const functions = this.extractFunctions(file.content);
        const classes = this.extractClasses(file.content);
        const dependencies = this.extractDependencies(file);
        return {
            functions,
            classes,
            dependencies,
            externalDependencies: dependencies.filter(dep => !dep.startsWith('.')),
            hasExternalDependencies: dependencies.some(dep => !dep.startsWith('.')),
            complexity: this.calculateComplexity(file.content),
            testability: this.assessTestability(file.content)
        };
    }
    extractFunctions(content) {
        const functions = [];
        const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
        const arrowFunctionPattern = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
        let match;
        while ((match = functionPattern.exec(content)) !== null) {
            functions.push(this.analyzeFunctionSignature(match[1], match[2], content));
        }
        while ((match = arrowFunctionPattern.exec(content)) !== null) {
            functions.push(this.analyzeFunctionSignature(match[1], match[2], content));
        }
        return functions;
    }
    analyzeFunctionSignature(name, params, content) {
        return {
            name,
            parameters: params.split(',').map(p => p.trim()).filter(p => p),
            returnType: 'unknown',
            isAsync: content.includes(`async function ${name}`) || content.includes(`${name} = async`),
            canThrow: content.includes('throw') || content.includes('error'),
            dependencies: [],
            branches: [],
            statements: 10, // Simplified
            complexity: 5 // Simplified
        };
    }
    extractClasses(content) {
        const classes = [];
        const classPattern = /class\s+(\w+)/g;
        let match;
        while ((match = classPattern.exec(content)) !== null) {
            classes.push({
                name: match[1],
                methods: [],
                properties: [],
                branches: [],
                statements: 20,
                complexity: 8
            });
        }
        return classes;
    }
    extractDependencies(file) {
        const importPattern = /import.*from\s+['"]([^'"]+)['"]/g;
        const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        const dependencies = [];
        let match;
        while ((match = importPattern.exec(file.content)) !== null) {
            dependencies.push(match[1]);
        }
        while ((match = requirePattern.exec(file.content)) !== null) {
            dependencies.push(match[1]);
        }
        return [...new Set(dependencies)];
    }
    analyzeCodebaseForTesting(files) {
        return {
            criticalFiles: files.filter(f => this.isCriticalFile(f)).map(f => f.path),
            optionalFiles: files.filter(f => !this.isCriticalFile(f)).map(f => f.path),
            complexity: 'medium',
            testingChallenges: ['External dependencies', 'Async operations', 'Complex business logic']
        };
    }
    isCriticalFile(file) {
        return file.path.includes('core') ||
            file.path.includes('main') ||
            file.path.includes('index') ||
            file.content.includes('export default');
    }
    shouldGenerateTestsFor(file) {
        return !file.path.includes('test') &&
            !file.path.includes('spec') &&
            (file.type === 'typescript' || file.type === 'javascript');
    }
    detectOptimalFramework(files) {
        // Check for existing test framework usage
        for (const file of files) {
            if (file.content.includes('jest'))
                return 'jest';
            if (file.content.includes('vitest'))
                return 'vitest';
            if (file.content.includes('mocha'))
                return 'mocha';
        }
        // Default recommendation based on project type
        const hasTypeScript = files.some(f => f.path.endsWith('.ts'));
        return hasTypeScript ? 'vitest' : 'jest';
    }
    isE2ECandidate(file) {
        return file.path.includes('page') ||
            file.path.includes('component') ||
            file.content.includes('render') ||
            file.content.includes('router');
    }
    detectE2EFramework(framework) {
        return framework === 'cypress' || framework === 'playwright' ? framework : 'playwright';
    }
    // Additional helper methods with simplified implementations
    generateSampleInput(func) {
        return func.parameters.length > 0 ? `{ /* sample input */ }` : '';
    }
    generateExpectedOutput(func) {
        return '/* expected output */';
    }
    generateEdgeCaseTests(func) {
        return '// TODO: Add edge case tests';
    }
    generateAsyncTests(func) {
        return `
  it('should handle async operations', async () => {
    const result = await ${func.name}();
    expect(result).toBeDefined();
  });`;
    }
    generateErrorTests(func) {
        return `
  it('should handle errors appropriately', () => {
    expect(() => ${func.name}(invalidInput)).toThrow();
  });`;
    }
    generateClassTestContent(cls, framework, file) {
        return `// Class tests for ${cls.name}`;
    }
    getTestFilePath(filePath, testType, framework) {
        const dir = path.dirname(filePath);
        const name = path.basename(filePath, path.extname(filePath));
        const ext = this.getFileExtension(framework);
        return path.join(dir, '__tests__', `${name}.${testType}.${ext}`);
    }
    getFileExtension(framework) {
        return framework === 'vitest' ? 'test.ts' : 'test.js';
    }
    getRelativeImportPath(filePath) {
        return '../' + path.basename(filePath, path.extname(filePath));
    }
    calculateComplexity(content) {
        return Math.min(content.split('\n').length / 10, 10);
    }
    assessTestability(content) {
        const hasExternalDeps = content.includes('import') && content.includes('from');
        const hasComplexLogic = content.includes('if') && content.includes('for');
        if (hasExternalDeps && hasComplexLogic)
            return 'low';
        if (hasExternalDeps || hasComplexLogic)
            return 'medium';
        return 'high';
    }
    prioritizeFiles(files) {
        return files.map(file => ({
            file: file.path,
            priority: this.isCriticalFile(file) ? 'high' : 'medium',
            reason: this.isCriticalFile(file) ? 'Critical business logic' : 'Supporting functionality'
        }));
    }
    generateSetupInstructions(framework) {
        const instructions = [`Install ${framework} testing framework`];
        if (framework === 'jest') {
            instructions.push('Configure jest.config.js', 'Setup test environment');
        }
        else if (framework === 'vitest') {
            instructions.push('Configure vitest.config.ts', 'Setup test utilities');
        }
        return instructions;
    }
    generateTestingRecommendations(analysis) {
        return [
            'Implement test-driven development (TDD) for new features',
            'Focus on high-coverage unit tests for critical business logic',
            'Use integration tests for external API interactions',
            'Implement automated test runs in CI/CD pipeline'
        ];
    }
    async generateSetupFiles(framework, tests) {
        return [{
                path: `tests/setup.${framework === 'vitest' ? 'ts' : 'js'}`,
                content: this.generateSetupFileContent(framework),
                description: 'Test environment setup and global configuration'
            }];
    }
    generateSetupFileContent(framework) {
        if (framework === 'jest') {
            return `// Jest setup file
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
`;
        }
        return '// Test setup file\n';
    }
    async generateConfigFiles(framework, tests) {
        return [{
                path: this.getConfigFileName(framework),
                content: this.generateConfigFileContent(framework),
                description: `${framework} configuration file`
            }];
    }
    getConfigFileName(framework) {
        if (framework === 'jest')
            return 'jest.config.js';
        if (framework === 'vitest')
            return 'vitest.config.ts';
        return `${framework}.config.js`;
    }
    generateConfigFileContent(framework) {
        if (framework === 'jest') {
            return `module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
`;
        }
        if (framework === 'vitest') {
            return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
`;
        }
        return '// Configuration file\n';
    }
    calculateExpectedCoverage(tests) {
        if (tests.length === 0)
            return 0;
        return tests.reduce((sum, test) => sum + test.coverage.expectedCoverage, 0) / tests.length;
    }
    estimateRuntime(tests) {
        const unitTests = tests.filter(t => t.testType === 'unit').length;
        const integrationTests = tests.filter(t => t.testType === 'integration').length;
        const e2eTests = tests.filter(t => t.testType === 'e2e').length;
        const totalMinutes = (unitTests * 0.1) + (integrationTests * 0.5) + (e2eTests * 2);
        if (totalMinutes < 1)
            return '< 1 minute';
        if (totalMinutes < 60)
            return `~${Math.ceil(totalMinutes)} minutes`;
        return `~${Math.ceil(totalMinutes / 60)} hours`;
    }
}
//# sourceMappingURL=test-generator.js.map