/**
 * Test Generator
 *
 * Automated test generation system that creates comprehensive test suites
 * based on code analysis, coverage gaps, and testing best practices.
 */
import { logger } from '../utils/logger.js';
export class TestGenerator {
    templates = [];
    constructor() {
        this.initializeTemplates();
    }
    /**
     * Generate comprehensive test suite for given code
     */
    async generateTestSuite(sourceFiles, options = {}) {
        const startTime = Date.now();
        logger.info('Starting test generation', {
            fileCount: sourceFiles.length,
            framework: options.framework || 'auto-detect'
        });
        const suites = [];
        let totalTests = 0;
        const recommendations = [];
        // Detect framework if not specified
        const framework = options.framework || this.detectTestFramework(sourceFiles);
        // Generate tests for each source file
        for (const file of sourceFiles) {
            const context = await this.analyzeSourceFile(file.path, file.content, framework);
            const applicableTemplates = this.findApplicableTemplates(context, options.testTypes);
            const testCases = [];
            for (const template of applicableTemplates) {
                try {
                    const cases = template.generator(context);
                    testCases.push(...cases);
                }
                catch (error) {
                    logger.warn(`Error generating tests with template ${template.id}:`, error);
                }
            }
            if (testCases.length > 0) {
                const suite = this.createTestSuite(file, testCases, framework, context);
                suites.push(suite);
                totalTests += testCases.length;
            }
        }
        // Analyze coverage gaps
        const coverageGaps = await this.analyzeCoverageGaps(sourceFiles, suites);
        // Generate quality metrics
        const quality = this.calculateTestQuality(suites, coverageGaps);
        // Generate recommendations
        const testRecommendations = this.generateRecommendations(suites, coverageGaps, quality);
        const report = {
            summary: {
                totalTests,
                coverageImprovement: this.estimateCoverageImprovement(suites),
                criticalPaths: suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.tags.includes('critical')).length, 0),
                edgeCases: suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.tags.includes('edge-case')).length, 0),
                performance: suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.category === 'performance').length, 0),
                security: suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.category === 'security').length, 0)
            },
            suites,
            recommendations: testRecommendations,
            gaps: {
                uncoveredCode: coverageGaps,
                missingTestTypes: this.identifyMissingTestTypes(suites, options.testTypes),
                riskAreas: this.identifyRiskAreas(sourceFiles, suites)
            },
            quality
        };
        logger.info('Test generation completed', {
            duration: Date.now() - startTime,
            totalTests,
            suites: suites.length,
            qualityScore: quality.score
        });
        return report;
    }
    /**
     * Generate tests for specific coverage gaps
     */
    async generateCoverageTests(sourceCode, filePath, gaps, framework = 'jest') {
        const testCases = [];
        const context = await this.analyzeSourceFile(filePath, sourceCode, framework);
        context.coverageGaps = gaps;
        for (const gap of gaps) {
            const cases = this.generateGapSpecificTests(context, gap);
            testCases.push(...cases);
        }
        return testCases;
    }
    /**
     * Analyze source file to extract testing context
     */
    async analyzeSourceFile(filePath, content, framework) {
        const context = {
            sourceCode: content,
            filePath,
            framework,
            imports: this.extractImports(content),
            dependencies: this.extractDependencies(content),
            existingTests: []
        };
        // Extract class information
        const classMatch = content.match(/(?:export\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
        if (classMatch) {
            context.className = classMatch[1];
        }
        // Extract methods
        const methods = this.extractMethods(content);
        if (methods.length > 0) {
            // For now, focus on the first method found
            const method = methods[0];
            context.methodName = method.name;
            context.parameters = method.parameters;
            context.returnType = method.returnType;
        }
        return context;
    }
    /**
     * Find applicable test templates for context
     */
    findApplicableTemplates(context, requestedTypes) {
        return this.templates.filter(template => {
            // Filter by requested test types
            if (requestedTypes && !requestedTypes.includes(template.category)) {
                return false;
            }
            // Check template applicability
            if (template.pattern instanceof RegExp) {
                return template.pattern.test(context.sourceCode);
            }
            else if (typeof template.pattern === 'function') {
                return template.pattern(context.sourceCode);
            }
            return false;
        }).sort((a, b) => b.priority - a.priority);
    }
    /**
     * Create test suite from test cases
     */
    createTestSuite(sourceFile, testCases, framework, context) {
        const imports = this.generateImports(testCases, framework, context);
        const setup = this.generateSetup(testCases, framework);
        return {
            id: `suite_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            name: `${context.className || 'Module'} Tests`,
            description: `Comprehensive test suite for ${sourceFile.path}`,
            framework,
            targetFile: sourceFile.path,
            testCases,
            setup: {
                imports,
                beforeEach: setup.beforeEach,
                afterEach: setup.afterEach
            },
            configuration: {
                timeout: 10000,
                retries: 0,
                parallel: true,
                environment: {}
            },
            metadata: {
                generatedAt: new Date(),
                coverageTarget: 80,
                estimatedDuration: testCases.reduce((sum, tc) => sum + tc.estimatedRuntime, 0),
                confidence: 0.8
            }
        };
    }
    /**
     * Initialize test templates
     */
    initializeTemplates() {
        this.templates = [
            // Unit Test Template
            {
                id: 'basic_unit_test',
                name: 'Basic Unit Test',
                description: 'Generate basic unit tests for functions and methods',
                framework: 'generic',
                category: 'unit',
                priority: 9,
                pattern: /(?:function|method|class)/i,
                generator: (context) => {
                    const testCases = [];
                    if (context.methodName) {
                        // Happy path test
                        testCases.push({
                            id: `test_${context.methodName}_happy_path`,
                            name: `should ${context.methodName} successfully with valid input`,
                            description: `Test ${context.methodName} with valid parameters`,
                            category: 'unit',
                            code: this.generateBasicTest(context, 'happy_path'),
                            assertions: [{
                                    type: 'equality',
                                    expected: 'expectedResult',
                                    actual: `result`,
                                    message: `${context.methodName} should return expected result`
                                }],
                            tags: ['happy-path', 'basic'],
                            estimatedRuntime: 10,
                            dependencies: []
                        });
                        // Error handling test
                        testCases.push({
                            id: `test_${context.methodName}_error_handling`,
                            name: `should handle invalid input gracefully`,
                            description: `Test ${context.methodName} error handling`,
                            category: 'unit',
                            code: this.generateBasicTest(context, 'error_handling'),
                            assertions: [{
                                    type: 'exception',
                                    expected: 'Error',
                                    actual: `() => ${context.methodName}(invalidInput)`,
                                    message: 'Should throw error for invalid input'
                                }],
                            tags: ['error-handling', 'edge-case'],
                            estimatedRuntime: 15,
                            dependencies: []
                        });
                    }
                    return testCases;
                }
            },
            // Property-Based Testing Template
            {
                id: 'property_based_test',
                name: 'Property-Based Tests',
                description: 'Generate property-based tests for comprehensive coverage',
                framework: 'jest',
                category: 'property',
                priority: 7,
                pattern: (code) => {
                    return code.includes('function') && code.includes('return');
                },
                generator: (context) => {
                    const testCases = [];
                    if (context.methodName) {
                        testCases.push({
                            id: `property_test_${context.methodName}`,
                            name: `property: ${context.methodName} should maintain invariants`,
                            description: `Property-based test for ${context.methodName}`,
                            category: 'property',
                            code: this.generatePropertyTest(context),
                            assertions: [{
                                    type: 'custom',
                                    expected: 'property holds',
                                    actual: 'propertyCheck(input, output)',
                                    message: 'Property should hold for all generated inputs'
                                }],
                            tags: ['property-based', 'comprehensive'],
                            estimatedRuntime: 100,
                            dependencies: ['fast-check']
                        });
                    }
                    return testCases;
                }
            },
            // Integration Test Template
            {
                id: 'integration_test',
                name: 'Integration Tests',
                description: 'Generate integration tests for component interactions',
                framework: 'jest',
                category: 'integration',
                priority: 6,
                pattern: /(import|require).*from/,
                generator: (context) => {
                    const testCases = [];
                    if (context.dependencies && context.dependencies.length > 0) {
                        testCases.push({
                            id: `integration_test_${context.className || 'module'}`,
                            name: `should integrate correctly with dependencies`,
                            description: `Integration test for ${context.className || 'module'}`,
                            category: 'integration',
                            code: this.generateIntegrationTest(context),
                            assertions: [{
                                    type: 'truthiness',
                                    expected: true,
                                    actual: 'integrationResult.success',
                                    message: 'Integration should succeed'
                                }],
                            mockRequirements: context.dependencies.map(dep => ({
                                target: dep,
                                type: 'module',
                                behavior: 'return_value',
                                configuration: { returnValue: 'mockResult' }
                            })),
                            tags: ['integration', 'dependencies'],
                            estimatedRuntime: 50,
                            dependencies: context.dependencies
                        });
                    }
                    return testCases;
                }
            },
            // Security Test Template
            {
                id: 'security_test',
                name: 'Security Tests',
                description: 'Generate security-focused tests',
                framework: 'jest',
                category: 'security',
                priority: 8,
                pattern: /(password|auth|token|secret|sql|eval|exec)/i,
                generator: (context) => {
                    const testCases = [];
                    // SQL Injection test
                    if (context.sourceCode.includes('sql') || context.sourceCode.includes('query')) {
                        testCases.push({
                            id: `security_sql_injection`,
                            name: `should prevent SQL injection attacks`,
                            description: `Test SQL injection prevention`,
                            category: 'security',
                            code: this.generateSecurityTest(context, 'sql_injection'),
                            assertions: [{
                                    type: 'exception',
                                    expected: 'Error',
                                    actual: `() => ${context.methodName}("'; DROP TABLE users; --")`,
                                    message: 'Should reject malicious SQL input'
                                }],
                            tags: ['security', 'sql-injection'],
                            estimatedRuntime: 25,
                            dependencies: []
                        });
                    }
                    // XSS test
                    if (context.sourceCode.includes('html') || context.sourceCode.includes('innerHTML')) {
                        testCases.push({
                            id: `security_xss`,
                            name: `should prevent XSS attacks`,
                            description: `Test XSS prevention`,
                            category: 'security',
                            code: this.generateSecurityTest(context, 'xss'),
                            assertions: [{
                                    type: 'regex',
                                    expected: /^(?!.*<script>).*$/,
                                    actual: 'sanitizedOutput',
                                    message: 'Output should not contain script tags'
                                }],
                            tags: ['security', 'xss'],
                            estimatedRuntime: 20,
                            dependencies: []
                        });
                    }
                    return testCases;
                }
            },
            // Performance Test Template
            {
                id: 'performance_test',
                name: 'Performance Tests',
                description: 'Generate performance benchmark tests',
                framework: 'jest',
                category: 'performance',
                priority: 5,
                pattern: (code) => {
                    return code.includes('for') || code.includes('while') || code.includes('map') || code.includes('filter');
                },
                generator: (context) => {
                    const testCases = [];
                    testCases.push({
                        id: `performance_test_${context.methodName}`,
                        name: `should complete within performance threshold`,
                        description: `Performance test for ${context.methodName}`,
                        category: 'performance',
                        code: this.generatePerformanceTest(context),
                        assertions: [{
                                type: 'range',
                                expected: { min: 0, max: 100 },
                                actual: 'executionTime',
                                message: 'Execution time should be under 100ms'
                            }],
                        tags: ['performance', 'benchmark'],
                        estimatedRuntime: 200,
                        dependencies: []
                    });
                    return testCases;
                }
            }
        ];
    }
    /**
     * Generate basic test code
     */
    generateBasicTest(context, type) {
        const framework = context.framework || 'jest';
        const className = context.className;
        const methodName = context.methodName;
        if (type === 'happy_path') {
            return framework === 'jest' ? `
describe('${className || 'Module'}', () => {
  test('${methodName} should work with valid input', () => {
    // Arrange
    const input = validTestInput;
    ${className ? `const instance = new ${className}();` : ''}

    // Act
    const result = ${className ? `instance.${methodName}(input)` : `${methodName}(input)`};

    // Assert
    expect(result).toBe(expectedResult);
  });
});` : `
it('${methodName} should work with valid input', () => {
  const input = validTestInput;
  ${className ? `const instance = new ${className}();` : ''}
  const result = ${className ? `instance.${methodName}(input)` : `${methodName}(input)`};
  expect(result).to.equal(expectedResult);
});`;
        }
        else {
            return framework === 'jest' ? `
test('${methodName} should handle invalid input', () => {
  ${className ? `const instance = new ${className}();` : ''}
  expect(() => {
    ${className ? `instance.${methodName}(invalidInput)` : `${methodName}(invalidInput)`};
  }).toThrow();
});` : `
it('${methodName} should handle invalid input', () => {
  ${className ? `const instance = new ${className}();` : ''}
  expect(() => {
    ${className ? `instance.${methodName}(invalidInput)` : `${methodName}(invalidInput)`};
  }).to.throw();
});`;
        }
    }
    /**
     * Generate property-based test code
     */
    generatePropertyTest(context) {
        return `
import fc from 'fast-check';

describe('Property-based tests', () => {
  test('${context.methodName} properties', () => {
    fc.assert(fc.property(
      fc.string(), // Generate random string inputs
      (input) => {
        ${context.className ? `const instance = new ${context.className}();` : ''}
        const result = ${context.className ? `instance.${context.methodName}(input)` : `${context.methodName}(input)`};

        // Property: result should never be null/undefined
        expect(result).toBeDefined();

        // Add more properties based on function semantics
        return true;
      }
    ));
  });
});`;
    }
    /**
     * Generate integration test code
     */
    generateIntegrationTest(context) {
        return `
describe('Integration tests', () => {
  test('should integrate with dependencies', async () => {
    // Setup mocks
    ${context.dependencies?.map(dep => `const mock${dep} = jest.mock('${dep}');`).join('\n    ')}

    ${context.className ? `const instance = new ${context.className}();` : ''}

    // Execute integration scenario
    const result = await ${context.className ? `instance.${context.methodName}()` : `${context.methodName}()`};

    // Verify integration
    expect(result).toBeTruthy();
    ${context.dependencies?.map(dep => `expect(mock${dep}).toHaveBeenCalled();`).join('\n    ')}
  });
});`;
    }
    /**
     * Generate security test code
     */
    generateSecurityTest(context, type) {
        if (type === 'sql_injection') {
            return `
describe('Security tests', () => {
  test('should prevent SQL injection', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    ${context.className ? `const instance = new ${context.className}();` : ''}

    expect(() => {
      ${context.className ? `instance.${context.methodName}(maliciousInput)` : `${context.methodName}(maliciousInput)`};
    }).toThrow('Invalid input');
  });
});`;
        }
        else {
            return `
describe('XSS Prevention tests', () => {
  test('should sanitize HTML input', () => {
    const xssInput = '<script>alert("XSS")</script>';
    ${context.className ? `const instance = new ${context.className}();` : ''}

    const result = ${context.className ? `instance.${context.methodName}(xssInput)` : `${context.methodName}(xssInput)`};

    expect(result).not.toMatch(/<script>/);
  });
});`;
        }
    }
    /**
     * Generate performance test code
     */
    generatePerformanceTest(context) {
        return `
describe('Performance tests', () => {
  test('should complete within time threshold', () => {
    const largeInput = Array(1000).fill('test');
    ${context.className ? `const instance = new ${context.className}();` : ''}

    const startTime = performance.now();
    const result = ${context.className ? `instance.${context.methodName}(largeInput)` : `${context.methodName}(largeInput)`};
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(100); // 100ms threshold
    expect(result).toBeDefined();
  });
});`;
    }
    /**
     * Extract imports from source code
     */
    extractImports(content) {
        const imports = [];
        const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
            imports.push(match[1]);
        }
        return imports;
    }
    /**
     * Extract dependencies from source code
     */
    extractDependencies(content) {
        const deps = new Set();
        // ES6 imports
        const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
            if (!match[1].startsWith('.')) { // External dependencies
                deps.add(match[1]);
            }
        }
        // Require statements
        const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const match of requireMatches) {
            if (!match[1].startsWith('.')) {
                deps.add(match[1]);
            }
        }
        return Array.from(deps);
    }
    /**
     * Extract methods from source code
     */
    extractMethods(content) {
        const methods = [];
        // Function declarations
        const functionMatches = content.matchAll(/(?:function|async\s+function)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)/g);
        for (const match of functionMatches) {
            methods.push({
                name: match[1],
                parameters: this.parseParameters(match[2])
            });
        }
        // Method definitions in classes
        const methodMatches = content.matchAll(/([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)\s*[:{]/g);
        for (const match of methodMatches) {
            if (!['constructor', 'if', 'for', 'while', 'switch'].includes(match[1])) {
                methods.push({
                    name: match[1],
                    parameters: this.parseParameters(match[2])
                });
            }
        }
        return methods;
    }
    /**
     * Parse parameter string into Parameter objects
     */
    parseParameters(paramString) {
        if (!paramString.trim())
            return [];
        return paramString.split(',').map(param => {
            const trimmed = param.trim();
            const [name, type] = trimmed.split(':').map(s => s.trim());
            return {
                name: name.replace(/[?=].*$/, ''), // Remove optional marker and default values
                type: type || 'any',
                isOptional: trimmed.includes('?') || trimmed.includes('='),
                defaultValue: trimmed.includes('=') ? trimmed.split('=')[1].trim() : undefined
            };
        });
    }
    /**
     * Detect test framework from existing code
     */
    detectTestFramework(files) {
        const frameworks = { jest: 0, mocha: 0, vitest: 0, jasmine: 0 };
        for (const file of files) {
            if (file.content.includes('describe') && file.content.includes('expect')) {
                if (file.content.includes('jest'))
                    frameworks.jest++;
                else if (file.content.includes('mocha'))
                    frameworks.mocha++;
                else if (file.content.includes('vitest'))
                    frameworks.vitest++;
                else if (file.content.includes('jasmine'))
                    frameworks.jasmine++;
                else
                    frameworks.jest++; // Default assumption
            }
        }
        const winner = Object.entries(frameworks).reduce((a, b) => a[1] > b[1] ? a : b);
        return winner[1] > 0 ? winner[0] : 'jest';
    }
    /**
     * Generate appropriate imports for test cases
     */
    generateImports(testCases, framework, context) {
        const imports = new Set();
        // Framework imports
        if (framework === 'jest') {
            imports.add(`import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';`);
        }
        else if (framework === 'mocha') {
            imports.add(`import { describe, it, beforeEach, afterEach } from 'mocha';`);
            imports.add(`import { expect } from 'chai';`);
        }
        // Source imports
        if (context.className) {
            imports.add(`import { ${context.className} } from '${context.filePath.replace('.ts', '').replace('.js', '')}';`);
        }
        // Mock libraries
        if (testCases.some(tc => tc.mockRequirements && tc.mockRequirements.length > 0)) {
            imports.add(`import { jest } from '@jest/globals';`);
        }
        // Property testing
        if (testCases.some(tc => tc.dependencies.includes('fast-check'))) {
            imports.add(`import fc from 'fast-check';`);
        }
        return Array.from(imports);
    }
    /**
     * Generate setup code for test suite
     */
    generateSetup(testCases, framework) {
        let beforeEach = '';
        let afterEach = '';
        // Check if mocks are needed
        const needsMocks = testCases.some(tc => tc.mockRequirements && tc.mockRequirements.length > 0);
        if (needsMocks) {
            beforeEach = `
    // Setup mocks
    jest.clearAllMocks();`;
            afterEach = `
    // Cleanup mocks
    jest.restoreAllMocks();`;
        }
        return { beforeEach: beforeEach || undefined, afterEach: afterEach || undefined };
    }
    /**
     * Generate tests for specific coverage gaps
     */
    generateGapSpecificTests(context, gap) {
        const testCases = [];
        switch (gap.type) {
            case 'branch':
                testCases.push({
                    id: `coverage_branch_${gap.location.startLine}`,
                    name: `should cover branch at line ${gap.location.startLine}`,
                    description: `Test to cover uncovered branch: ${gap.description}`,
                    category: 'unit',
                    code: this.generateBranchCoverageTest(context, gap),
                    assertions: [{
                            type: 'truthiness',
                            expected: true,
                            actual: 'branchExecuted',
                            message: `Branch should be executed`
                        }],
                    tags: ['coverage', 'branch'],
                    estimatedRuntime: 15,
                    dependencies: []
                });
                break;
            case 'statement':
                testCases.push({
                    id: `coverage_statement_${gap.location.startLine}`,
                    name: `should execute statement at line ${gap.location.startLine}`,
                    description: `Test to cover uncovered statement: ${gap.description}`,
                    category: 'unit',
                    code: this.generateStatementCoverageTest(context, gap),
                    assertions: [{
                            type: 'truthiness',
                            expected: true,
                            actual: 'statementExecuted',
                            message: `Statement should be executed`
                        }],
                    tags: ['coverage', 'statement'],
                    estimatedRuntime: 10,
                    dependencies: []
                });
                break;
        }
        return testCases;
    }
    /**
     * Generate branch coverage test
     */
    generateBranchCoverageTest(context, gap) {
        return `
test('should cover branch at line ${gap.location.startLine}', () => {
  // Setup conditions to trigger the uncovered branch
  const condition = ${gap.location.condition || 'true'};

  ${context.className ? `const instance = new ${context.className}();` : ''}
  const result = ${context.className ? `instance.${context.methodName}(condition)` : `${context.methodName}(condition)`};

  expect(result).toBeDefined();
});`;
    }
    /**
     * Generate statement coverage test
     */
    generateStatementCoverageTest(context, gap) {
        return `
test('should execute statement at line ${gap.location.startLine}', () => {
  // Setup to trigger statement execution
  ${context.className ? `const instance = new ${context.className}();` : ''}
  const result = ${context.className ? `instance.${context.methodName}()` : `${context.methodName}()`};

  expect(result).toBeDefined();
});`;
    }
    /**
     * Analyze coverage gaps in source files
     */
    async analyzeCoverageGaps(sourceFiles, suites) {
        const gaps = [];
        // Simple gap analysis - in production would use actual coverage data
        for (const file of sourceFiles) {
            const lines = file.content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // Identify potential uncovered branches
                if (line.includes('if') && line.includes('else')) {
                    gaps.push({
                        type: 'branch',
                        location: { startLine: i + 1, endLine: i + 1, condition: line },
                        description: `Conditional branch may not be fully covered`,
                        priority: 'medium'
                    });
                }
                // Identify error handling that might not be covered
                if (line.includes('catch') || line.includes('throw')) {
                    gaps.push({
                        type: 'statement',
                        location: { startLine: i + 1, endLine: i + 1 },
                        description: `Error handling statement may not be covered`,
                        priority: 'high'
                    });
                }
            }
        }
        return gaps;
    }
    /**
     * Calculate test quality metrics
     */
    calculateTestQuality(suites, gaps) {
        const totalTests = suites.reduce((sum, s) => sum + s.testCases.length, 0);
        const criticalTests = suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.tags.includes('critical')).length, 0);
        const maintainability = Math.min(100, (totalTests / Math.max(suites.length, 1)) * 10);
        const reliability = Math.max(0, 100 - (gaps.filter(g => g.priority === 'high').length * 10));
        const comprehensiveness = Math.min(100, (criticalTests / Math.max(totalTests, 1)) * 100);
        const score = Math.round((maintainability + reliability + comprehensiveness) / 3);
        return { score, maintainability, reliability, comprehensiveness };
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(suites, gaps, quality) {
        const recommendations = [];
        if (gaps.filter(g => g.priority === 'high').length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Coverage',
                description: 'Address high-priority coverage gaps',
                impact: 'Improves test reliability and bug detection'
            });
        }
        if (quality.score < 70) {
            recommendations.push({
                priority: 'medium',
                category: 'Quality',
                description: 'Improve overall test quality',
                impact: 'Better maintainability and reliability'
            });
        }
        const securityTests = suites.reduce((sum, s) => sum + s.testCases.filter(tc => tc.category === 'security').length, 0);
        if (securityTests === 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Security',
                description: 'Add security-focused tests',
                impact: 'Prevents security vulnerabilities'
            });
        }
        return recommendations;
    }
    /**
     * Estimate coverage improvement from generated tests
     */
    estimateCoverageImprovement(suites) {
        // Simple estimation based on test count and types
        const totalTests = suites.reduce((sum, s) => sum + s.testCases.length, 0);
        const uniquePaths = suites.reduce((sum, s) => sum + new Set(s.testCases.map(tc => tc.name)).size, 0);
        return Math.min(95, Math.round((uniquePaths / Math.max(totalTests, 1)) * 100));
    }
    /**
     * Identify missing test types
     */
    identifyMissingTestTypes(suites, requestedTypes) {
        const present = new Set(suites.flatMap(s => s.testCases.map(tc => tc.category)));
        const allTypes = ['unit', 'integration', 'e2e', 'property', 'performance', 'security'];
        return allTypes.filter(type => !present.has(type));
    }
    /**
     * Identify risk areas in code
     */
    identifyRiskAreas(sourceFiles, suites) {
        const risks = [];
        for (const file of sourceFiles) {
            // Check for complex functions without tests
            const complexFunctions = (file.content.match(/function[^{]*{[^}]{200,}/g) || []).length;
            const fileHasTests = suites.some(s => s.targetFile === file.path);
            if (complexFunctions > 0 && !fileHasTests) {
                risks.push(`Complex functions in ${file.path} lack test coverage`);
            }
            // Check for error handling without tests
            if (file.content.includes('throw') || file.content.includes('catch')) {
                const hasErrorTests = suites.some(s => s.testCases.some(tc => tc.tags.includes('error-handling')));
                if (!hasErrorTests) {
                    risks.push(`Error handling in ${file.path} needs test coverage`);
                }
            }
        }
        return risks;
    }
}
// Factory function for easy instantiation
export function createTestGenerator() {
    return new TestGenerator();
}
//# sourceMappingURL=test-generator.js.map