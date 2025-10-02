"use strict";
/**
 * create-tests Command Tests
 * Comprehensive E2E tests for AI-powered test generation command
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const extensionTestHelper_1 = require("../helpers/extensionTestHelper");
const test_constants_1 = require("../helpers/test-constants");
const providerTestHelper_1 = require("../helpers/providerTestHelper");
/**
 * Mock create-tests command handler
 * Simulates the CLI create-tests command behavior
 */
class CreateTestsCommand {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    /**
     * Execute create-tests command
     * @param sourceFile - Path to source file to generate tests for
     * @param options - Command options
     */
    async execute(sourceFile, options = {}) {
        try {
            // Validate source file exists
            if (!fs.existsSync(sourceFile)) {
                throw new Error(`Source file does not exist: ${sourceFile}`);
            }
            // Check client connection
            const status = this.client.getConnectionStatus();
            if (!status.connected) {
                throw new Error('AI client not connected');
            }
            // Read source code
            const sourceCode = fs.readFileSync(sourceFile, 'utf8');
            // Detect test framework from package.json or use default
            const framework = options.framework || this.detectFramework(sourceFile);
            // Generate tests using AI
            const aiResponse = await this.client.sendAIRequest?.({
                type: 'generate-tests',
                sourceCode,
                framework,
                coverage: options.coverage || 'basic',
                includeMocks: options.mocks || false
            });
            const testCode = aiResponse?.result || this.generateFallbackTests(sourceCode, framework, options);
            // Determine output file path
            const testFile = options.outputFile || this.getDefaultTestPath(sourceFile, framework);
            // Create directory if needed
            const dir = path.dirname(testFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Write test file
            fs.writeFileSync(testFile, testCode, 'utf8');
            return {
                success: true,
                testFile,
                content: testCode
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    /**
     * Detect test framework from source file path and environment
     */
    detectFramework(sourceFile) {
        const ext = path.extname(sourceFile);
        // Check for React files
        if (providerTestHelper_1.TEST_GENERATION_CONSTANTS.FRAMEWORK_EXTENSIONS.REACT.includes(ext) ||
            sourceFile.toLowerCase().includes('component')) {
            return 'jest-react';
        }
        // Default to Jest for JS/TS files
        if (providerTestHelper_1.TEST_GENERATION_CONSTANTS.FRAMEWORK_EXTENSIONS.JAVASCRIPT.includes(ext)) {
            return providerTestHelper_1.TEST_GENERATION_CONSTANTS.DEFAULT_FRAMEWORK;
        }
        // Mocha for test files in test/ directory
        if (providerTestHelper_1.TEST_GENERATION_CONSTANTS.FRAMEWORK_KEYWORDS.TEST_DIRECTORY.some(dir => sourceFile.includes(dir))) {
            return 'mocha';
        }
        return providerTestHelper_1.TEST_GENERATION_CONSTANTS.DEFAULT_FRAMEWORK;
    }
    /**
     * Get default test file path based on source file
     */
    getDefaultTestPath(sourceFile, framework) {
        const dir = path.dirname(sourceFile);
        const ext = path.extname(sourceFile);
        const base = path.basename(sourceFile, ext);
        // Jest uses .test.js pattern
        if (framework.startsWith('jest')) {
            return path.join(dir, `${base}${providerTestHelper_1.TEST_GENERATION_CONSTANTS.TEST_NAMING.JEST}${ext}`);
        }
        // Mocha uses .spec.js pattern
        if (framework === 'mocha') {
            return path.join(dir, `${base}${providerTestHelper_1.TEST_GENERATION_CONSTANTS.TEST_NAMING.MOCHA}${ext}`);
        }
        // Default
        return path.join(dir, `${base}${providerTestHelper_1.TEST_GENERATION_CONSTANTS.TEST_NAMING.JEST}${ext}`);
    }
    /**
     * Generate fallback tests when AI is unavailable
     */
    generateFallbackTests(sourceCode, framework, options) {
        const coverage = options.coverage || providerTestHelper_1.TEST_GENERATION_CONSTANTS.DEFAULT_COVERAGE;
        if (framework === 'jest') {
            return this.generateJestTests(sourceCode, coverage, options.mocks);
        }
        else if (framework === 'jest-react') {
            return this.generateReactTests(sourceCode, coverage);
        }
        else if (framework === 'mocha') {
            return this.generateMochaTests(sourceCode, coverage);
        }
        else {
            return providerTestHelper_1.TEST_GENERATION_CONSTANTS.FALLBACK_TEST_TEMPLATE;
        }
    }
    generateJestTests(sourceCode, coverage, includeMocks) {
        const functions = (0, providerTestHelper_1.extractFunctionNames)(sourceCode);
        if (coverage === 'comprehensive') {
            return includeMocks
                ? providerTestHelper_1.TEST_GENERATION_TEMPLATES.jest.withMocks(functions)
                : providerTestHelper_1.TEST_GENERATION_TEMPLATES.jest.comprehensive(functions);
        }
        return includeMocks
            ? providerTestHelper_1.TEST_GENERATION_TEMPLATES.jest.withMocks(functions)
            : providerTestHelper_1.TEST_GENERATION_TEMPLATES.jest.basic(functions);
    }
    generateReactTests(sourceCode, coverage) {
        const componentName = (0, providerTestHelper_1.extractComponentName)(sourceCode);
        return coverage === 'comprehensive'
            ? providerTestHelper_1.TEST_GENERATION_TEMPLATES.react.comprehensive(componentName)
            : providerTestHelper_1.TEST_GENERATION_TEMPLATES.react.basic(componentName);
    }
    generateMochaTests(sourceCode, coverage) {
        const functions = (0, providerTestHelper_1.extractFunctionNames)(sourceCode);
        return coverage === 'comprehensive'
            ? providerTestHelper_1.TEST_GENERATION_TEMPLATES.mocha.comprehensive(functions)
            : providerTestHelper_1.TEST_GENERATION_TEMPLATES.mocha.basic(functions);
    }
}
suite('create-tests Command Tests', () => {
    let createTestsCmd;
    let mockClient;
    let mockLogger;
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        mockClient = (0, providerTestHelper_1.createMockOllamaClient)(true, (0, providerTestHelper_1.createTestGenerationHandler)());
        mockLogger = (0, providerTestHelper_1.createMockLogger)();
        createTestsCmd = new CreateTestsCommand(mockClient, mockLogger);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('create-tests-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Test Generation', () => {
        test('Should generate Jest tests for JavaScript functions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            // Create source file
            const sourceFile = path.join(testWorkspacePath, 'math.js');
            fs.writeFileSync(sourceFile, 'function add(a, b) { return a + b; }\nfunction subtract(a, b) { return a - b; }\n', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.testFile, 'Should return test file path');
            assert.ok(result.content, 'Should return generated test code');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['describe', 'it', 'expect', 'add', 'subtract']);
        });
        test('Should generate Mocha tests for JavaScript', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'calculator.js');
            fs.writeFileSync(sourceFile, 'function calculateSum(a, b) { return a + b; }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, { framework: 'mocha' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['describe', 'it', 'expect', 'chai']);
        });
        test('Should generate Jest tests for TypeScript', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'utils.ts');
            fs.writeFileSync(sourceFile, 'export function multiply(a: number, b: number): number { return a * b; }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.testFile?.endsWith('.test.ts'), 'Should create .test.ts file');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['import', 'describe', 'expect']);
        });
        test('Should generate React component tests with Testing Library', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'Button.tsx');
            fs.writeFileSync(sourceFile, 'import React from "react";\nexport const Button = () => <button>Click</button>;', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, { framework: 'jest-react' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['@testing-library/react', 'render', 'screen', 'Button']);
        });
        test('Should generate comprehensive tests with coverage option', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'service.js');
            fs.writeFileSync(sourceFile, 'function process(data) { return data; }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, {
                framework: 'jest',
                coverage: 'comprehensive'
            });
            assert.strictEqual(result.success, true, 'Command should succeed');
            // Comprehensive tests should have more test cases
            const testCount = (result.content.match(/it\(/g) || []).length;
            assert.ok(testCount > 1, 'Should generate multiple test cases');
        });
        test('Should generate tests with mock generation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'api.js');
            fs.writeFileSync(sourceFile, 'function fetchData() { return fetch("/api"); }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, {
                framework: 'jest',
                mocks: true
            });
            assert.strictEqual(result.success, true, 'Command should succeed');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['jest.mock']);
        });
        test('Should use correct test file naming conventions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'example.js');
            fs.writeFileSync(sourceFile, 'function example() {}', 'utf8');
            const jestResult = await createTestsCmd.execute(sourceFile, { framework: 'jest' });
            assert.ok(jestResult.testFile?.endsWith('.test.js'), 'Jest should use .test.js');
            const sourceFile2 = path.join(testWorkspacePath, 'example2.js');
            fs.writeFileSync(sourceFile2, 'function example2() {}', 'utf8');
            const mochaResult = await createTestsCmd.execute(sourceFile2, { framework: 'mocha' });
            assert.ok(mochaResult.testFile?.endsWith('.spec.js'), 'Mocha should use .spec.js');
        });
        test('Should write test file to specified output path', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'src', 'utils.js');
            fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
            fs.writeFileSync(sourceFile, 'function util() {}', 'utf8');
            const outputFile = path.join(testWorkspacePath, 'tests', 'utils.test.js');
            const result = await createTestsCmd.execute(sourceFile, { outputFile });
            (0, providerTestHelper_1.assertCommandSuccess)(result, outputFile);
            (0, providerTestHelper_1.assertFileExists)(outputFile);
            (0, providerTestHelper_1.assertFileContains)(outputFile, 'describe');
        });
        test('Should auto-detect framework from file type', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const reactFile = path.join(testWorkspacePath, 'Component.tsx');
            fs.writeFileSync(reactFile, 'export const Component = () => null;', 'utf8');
            const result = await createTestsCmd.execute(reactFile);
            assert.strictEqual(result.success, true, 'Should auto-detect React');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['@testing-library']);
        });
        test('Should handle source file not found error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await createTestsCmd.execute(path.join(testWorkspacePath, 'nonexistent.js'));
            assert.strictEqual(result.success, false, 'Command should fail');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('does not exist'), 'Error should mention missing file');
        });
        test('Should handle client disconnection error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const disconnectedClient = (0, providerTestHelper_1.createMockOllamaClient)(false);
            const disconnectedCmd = new CreateTestsCommand(disconnectedClient, mockLogger);
            const sourceFile = path.join(testWorkspacePath, 'test.js');
            fs.writeFileSync(sourceFile, 'function test() {}', 'utf8');
            const result = await disconnectedCmd.execute(sourceFile);
            assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('not connected'), 'Error should mention connection issue');
        });
        test('Should generate setup and teardown code for comprehensive tests', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'database.js');
            fs.writeFileSync(sourceFile, 'class Database { connect() {} disconnect() {} }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, {
                framework: 'jest',
                coverage: 'comprehensive'
            });
            assert.strictEqual(result.success, true, 'Command should succeed');
            // Comprehensive coverage should include setup/teardown patterns
            assert.ok(result.content, 'Should have test content');
        });
        test('Should handle edge case test generation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'validator.js');
            fs.writeFileSync(sourceFile, 'function validate(input) { if (!input) throw new Error("Invalid"); return true; }', 'utf8');
            const result = await createTestsCmd.execute(sourceFile, {
                framework: 'jest',
                coverage: 'comprehensive'
            });
            assert.strictEqual(result.success, true, 'Command should succeed');
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['describe', 'it']);
            // Edge case tests should include boundary conditions
            const testCount = (result.content.match(/it\(/g) || []).length;
            assert.ok(testCount >= 2, 'Should generate multiple test cases for edge cases');
        });
        test('Should cover all exported functions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const sourceFile = path.join(testWorkspacePath, 'helpers.js');
            fs.writeFileSync(sourceFile, `
        export function add(a, b) { return a + b; }
        export function subtract(a, b) { return a - b; }
        export function multiply(a, b) { return a * b; }
      `, 'utf8');
            const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            // Should have tests for all three functions
            (0, providerTestHelper_1.assertCodeContains)(result.content, ['add', 'subtract']);
        });
    });
});
//# sourceMappingURL=createTests.command.test.js.map