"use strict";
/**
 * generate-code Command Tests
 * Comprehensive E2E tests for AI-powered code generation command
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
 * Mock generate-code command handler
 * Simulates the CLI generate-code command behavior
 */
class GenerateCodeCommand {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    /**
     * Execute generate-code command
     * @param description - Natural language description of code to generate
     * @param options - Command options
     */
    async execute(description, options = {}) {
        try {
            // Validate description
            if (!description || description.trim() === '') {
                throw new Error('Code description is required');
            }
            // Check client connection
            const status = this.client.getConnectionStatus();
            if (!status.connected) {
                throw new Error('AI client not connected');
            }
            // Generate code using AI
            const aiResponse = await this.client.sendAIRequest?.({
                type: 'generate-code',
                prompt: description,
                context: {
                    framework: options.framework,
                    language: options.language
                }
            });
            const generatedCode = aiResponse?.result || this.generateFallbackCode(description, options);
            // Validate syntax if requested
            if (options.validate) {
                this.validateSyntax(generatedCode, options.language || providerTestHelper_1.CODE_GENERATION_CONSTANTS.DEFAULT_LANGUAGE);
            }
            // Save to file if output path specified
            if (options.outputFile) {
                const dir = path.dirname(options.outputFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(options.outputFile, generatedCode, 'utf8');
                return {
                    success: true,
                    code: generatedCode,
                    filePath: options.outputFile
                };
            }
            // Return to stdout
            return {
                success: true,
                code: generatedCode
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
     * Generate fallback code when AI is unavailable
     */
    generateFallbackCode(description, options) {
        const framework = options.framework?.toLowerCase() || '';
        const language = options.language?.toLowerCase() || providerTestHelper_1.CODE_GENERATION_CONSTANTS.DEFAULT_LANGUAGE;
        if (description.toLowerCase().includes('rest api') || description.toLowerCase().includes('express')) {
            return this.generateExpressAPI();
        }
        else if (framework.includes('react') || description.toLowerCase().includes('react component')) {
            return this.generateReactComponent(description);
        }
        else if (language.includes('python')) {
            return this.generatePythonClass(description);
        }
        else {
            return `// Generated code for: ${description}\n// TODO: Implement functionality\n`;
        }
    }
    generateExpressAPI() {
        return providerTestHelper_1.CODE_GENERATION_TEMPLATES.express.api;
    }
    generateReactComponent(description) {
        const componentName = (0, providerTestHelper_1.extractNameFromDescription)(description);
        return providerTestHelper_1.CODE_GENERATION_TEMPLATES.react.component(componentName, description);
    }
    generatePythonClass(description) {
        return providerTestHelper_1.CODE_GENERATION_TEMPLATES.python.class(description);
    }
    /**
     * Validate generated code syntax
     */
    validateSyntax(code, language) {
        // Basic syntax validation (in real implementation, use parsers)
        if (language === 'javascript' || language === 'typescript') {
            // Check for basic syntax issues
            if (code.includes('function') && !code.includes('(')) {
                throw new Error('Syntax error: Invalid function declaration');
            }
        }
        else if (language === 'python') {
            // Check for indentation issues
            if (code.includes('def ') && !code.includes(':')) {
                throw new Error('Syntax error: Missing colon in function definition');
            }
        }
    }
}
suite('generate-code Command Tests', () => {
    let generateCodeCmd;
    let mockClient;
    let mockLogger;
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        mockClient = (0, providerTestHelper_1.createMockOllamaClient)(true, (0, providerTestHelper_1.createCodeGenerationHandler)());
        mockLogger = (0, providerTestHelper_1.createMockLogger)();
        generateCodeCmd = new GenerateCodeCommand(mockClient, mockLogger);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('generate-code-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Code Generation', () => {
        test('Should generate REST API endpoint with Express', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('REST API endpoint with Express');
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code, 'Should return generated code');
            (0, providerTestHelper_1.assertCodeContains)(result.code, ['express', 'app.get', 'app.listen']);
        });
        test('Should generate React component with TypeScript', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('Button component', { framework: 'react' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code, 'Should return generated code');
            assert.ok(result.code.includes('React'), 'Should include React import');
            assert.ok(result.code.includes('export'), 'Should export component');
        });
        test('Should generate Python class with type hints', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('Calculator class', { language: 'python' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code, 'Should return generated code');
            assert.ok(result.code.includes('class'), 'Should define class');
            assert.ok(result.code.includes('int'), 'Should include type hints');
        });
        test('Should generate with specific framework (Vue)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('Simple component', { framework: 'vue' });
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code, 'Should return generated code');
            assert.ok(result.code.includes('<template>'), 'Should include Vue template');
            assert.ok(result.code.includes('export default'), 'Should export Vue component');
        });
        test('Should generate and save to output file', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const outputFile = path.join(testWorkspacePath, 'generated', 'api.js');
            const result = await generateCodeCmd.execute('REST API', { outputFile });
            (0, providerTestHelper_1.assertCommandSuccess)(result, outputFile);
            (0, providerTestHelper_1.assertFileExists)(outputFile);
            (0, providerTestHelper_1.assertFileContains)(outputFile, 'express');
        });
        test('Should generate with stdout display (no file)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('Simple function');
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code, 'Should return code to stdout');
            assert.ok(!result.filePath, 'Should not save to file');
        });
        test('Should generate with syntax validation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('Simple function', { validate: true });
            assert.strictEqual(result.success, true, 'Command should succeed with valid syntax');
            assert.ok(result.code, 'Should return generated code');
        });
        test('Should generate with best practices (error handling, docs)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('REST API endpoint with Express');
            assert.strictEqual(result.success, true, 'Command should succeed');
            assert.ok(result.code.includes('try'), 'Should include error handling');
            assert.ok(result.code.includes('/**'), 'Should include JSDoc comments');
            assert.ok(result.code.includes('catch'), 'Should have catch blocks');
        });
        test('Should handle empty description error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const result = await generateCodeCmd.execute('');
            assert.strictEqual(result.success, false, 'Command should fail');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('required'), 'Error should mention required description');
        });
        test('Should handle client disconnection error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const disconnectedClient = (0, providerTestHelper_1.createMockOllamaClient)(false);
            const disconnectedCmd = new GenerateCodeCommand(disconnectedClient, mockLogger);
            const result = await disconnectedCmd.execute('Simple function');
            assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('not connected'), 'Error should mention connection issue');
        });
    });
});
//# sourceMappingURL=generateCode.command.test.js.map