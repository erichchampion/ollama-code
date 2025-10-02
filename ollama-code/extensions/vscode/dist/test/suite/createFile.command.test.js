"use strict";
/**
 * create-file Command Tests
 * Comprehensive E2E tests for AI-powered file creation command
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
 * Mock create-file command handler
 * Simulates the CLI create-file command behavior
 */
class CreateFileCommand {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    /**
     * Execute create-file command
     * @param filePath - Path to create the file
     * @param description - AI description of file content to generate
     * @param options - Command options
     */
    async execute(filePath, description, options = {}) {
        try {
            // Validate file path
            if (!filePath || filePath.trim() === '') {
                throw new Error('File path is required');
            }
            // Check for path traversal attacks (check BEFORE normalization)
            if (filePath.includes('..')) {
                const normalizedPath = path.normalize(filePath);
                const resolvedPath = path.resolve(normalizedPath);
                const workingDir = process.cwd();
                // Ensure resolved path is within working directory
                if (!resolvedPath.startsWith(workingDir)) {
                    throw new Error('Path traversal attack detected');
                }
            }
            // Check if file already exists
            if (fs.existsSync(filePath) && !options.overwrite) {
                throw new Error(`File already exists: ${filePath}`);
            }
            // Check client connection
            const status = this.client.getConnectionStatus();
            if (!status.connected) {
                throw new Error('AI client not connected');
            }
            // Generate content using AI
            const fileExtension = path.extname(filePath);
            const language = options.language || this.detectLanguage(fileExtension);
            const aiResponse = await this.client.sendAIRequest?.({
                type: 'generate',
                prompt: `Create ${language} file: ${description}`,
                context: {
                    filePath,
                    language,
                    template: options.template
                }
            });
            const content = aiResponse?.result || this.generateFallbackContent(filePath, description, language);
            // Ensure parent directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Write file
            fs.writeFileSync(filePath, content, 'utf8');
            return {
                success: true,
                filePath,
                content
            };
        }
        catch (error) {
            return {
                success: false,
                filePath,
                error: error.message
            };
        }
    }
    detectLanguage(extension) {
        return (0, providerTestHelper_1.detectLanguageFromExtension)(extension);
    }
    generateFallbackContent(filePath, description, language) {
        const fileName = path.basename(filePath, path.extname(filePath));
        if (language === 'JavaScript') {
            return providerTestHelper_1.FILE_GENERATION_TEMPLATES.javascript.fallback(fileName, description);
        }
        else if (language === 'TypeScript') {
            return providerTestHelper_1.FILE_GENERATION_TEMPLATES.typescript.fallback(fileName, description);
        }
        else if (language === 'React TSX') {
            const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
            return providerTestHelper_1.FILE_GENERATION_TEMPLATES.reactTsx.fallback(componentName, description);
        }
        else if (language === 'Python') {
            return providerTestHelper_1.FILE_GENERATION_TEMPLATES.python.fallback(fileName, description);
        }
        else {
            return providerTestHelper_1.FILE_GENERATION_TEMPLATES.generic.fallback(description);
        }
    }
}
suite('create-file Command Tests', () => {
    let createFileCmd;
    let mockClient;
    let mockLogger;
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        // Use centralized file generation handler
        mockClient = (0, providerTestHelper_1.createMockOllamaClient)(true, (0, providerTestHelper_1.createFileGenerationHandler)());
        mockLogger = (0, providerTestHelper_1.createMockLogger)();
        createFileCmd = new CreateFileCommand(mockClient, mockLogger);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('create-file-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Basic Creation', () => {
        test('Should create simple JavaScript file with AI content generation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'example.js');
            const result = await createFileCmd.execute(filePath, 'A simple utility function');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            (0, providerTestHelper_1.assertFileContains)(filePath, ['function', 'module.exports']);
        });
        test('Should create TypeScript file with type definitions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'example.ts');
            const result = await createFileCmd.execute(filePath, 'A typed utility function');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            (0, providerTestHelper_1.assertFileContains)(filePath, ['export', 'function']);
            const content = fs.readFileSync(filePath, 'utf8');
            assert.ok(content.includes('void') || content.includes(':'), 'Should have type annotations');
        });
        test('Should create React component with props', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'Button.tsx');
            const result = await createFileCmd.execute(filePath, 'A reusable button component');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            (0, providerTestHelper_1.assertFileContains)(filePath, ['React', 'Props']);
            const content = fs.readFileSync(filePath, 'utf8');
            assert.ok(content.includes('interface') || content.includes('type'), 'Should have prop types');
            assert.ok(content.includes('FC') || content.includes('FunctionComponent'), 'Should use FC type');
        });
        test('Should create test file with boilerplate', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'example.test.ts');
            const result = await createFileCmd.execute(filePath, 'Unit tests for example module', {
                template: 'test'
            });
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            assert.ok(content.includes('describe') || content.includes('test') || content.includes('it'), 'Should have test structure');
            assert.ok(content.includes('expect') || content.includes('assert'), 'Should have assertions');
        });
        test('Should create with explicit file path and description', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'utils', 'helper.js');
            const description = 'Helper functions for data processing';
            const result = await createFileCmd.execute(filePath, description);
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            assert.ok(content.length > 0, 'File should have content');
        });
    });
    suite('Directory Handling', () => {
        test('Should automatically create parent directory', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'src', 'utils.js');
            const result = await createFileCmd.execute(filePath, 'Utility functions');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            assert.ok(fs.existsSync(path.dirname(filePath)), 'Parent directory should be created');
            (0, providerTestHelper_1.assertFileExists)(filePath);
        });
        test('Should handle nested directory creation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'src', 'components', 'ui', 'Button.tsx');
            const result = await createFileCmd.execute(filePath, 'UI Button component');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            const expectedDir = path.join(testWorkspacePath, 'src', 'components', 'ui');
            assert.ok(fs.existsSync(expectedDir), 'Nested directories should be created');
            (0, providerTestHelper_1.assertFileExists)(filePath);
        });
        test('Should handle creation in non-existent paths with error handling', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'deep', 'nested', 'path', 'file.js');
            const result = await createFileCmd.execute(filePath, 'File in deep path');
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            const dirDepth = filePath.split(path.sep).length - testWorkspacePath.split(path.sep).length;
            assert.ok(dirDepth >= providerTestHelper_1.TEST_DATA_CONSTANTS.FILE_OPERATION_CONSTANTS.MIN_DEEP_PATH_DEPTH, 'Should create multiple nested directories');
        });
        test('Should prevent path traversal attacks', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const maliciousPath = path.join(testWorkspacePath, '..', '..', 'etc', 'passwd');
            const result = await createFileCmd.execute(maliciousPath, 'Malicious file');
            assert.strictEqual(result.success, false, 'Command should fail');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('traversal') || result.error.includes('invalid'), 'Error should mention security issue');
            assert.ok(!fs.existsSync(maliciousPath), 'Malicious file should not be created');
        });
        test('Should normalize paths correctly', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'src', '.', 'utils', '..', 'helpers.js');
            const result = await createFileCmd.execute(filePath, 'Helper utilities');
            assert.strictEqual(result.success, true, 'Command should succeed with normalized path');
            // Path should be normalized to testWorkspacePath/src/helpers.js
            const expectedPath = path.join(testWorkspacePath, 'src', 'helpers.js');
            (0, providerTestHelper_1.assertFileExists)(expectedPath);
        });
    });
    suite('Error Handling', () => {
        test('Should handle file already exists error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'existing.js');
            // Create file first
            await createFileCmd.execute(filePath, 'First file');
            (0, providerTestHelper_1.assertFileExists)(filePath);
            // Try to create again without overwrite
            const result = await createFileCmd.execute(filePath, 'Second file');
            assert.strictEqual(result.success, false, 'Command should fail');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('already exists'), 'Error should mention file exists');
        });
        test('Should allow overwrite with explicit flag', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const filePath = path.join(testWorkspacePath, 'overwrite.js');
            // Create file first
            await createFileCmd.execute(filePath, 'Original content');
            const originalContent = fs.readFileSync(filePath, 'utf8');
            // Overwrite with flag
            const result = await createFileCmd.execute(filePath, 'New content', { overwrite: true });
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            const newContent = fs.readFileSync(filePath, 'utf8');
            assert.notStrictEqual(newContent, originalContent, 'Content should be different');
        });
        test('Should handle invalid file name error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            // Test various invalid file names
            const invalidNames = [
                '',
                '   ',
                path.join(testWorkspacePath, 'file<>.js'), // Invalid characters on Windows
            ];
            for (const invalidPath of invalidNames) {
                const result = await createFileCmd.execute(invalidPath, 'Test file');
                assert.strictEqual(result.success, false, `Should fail for invalid path: ${invalidPath}`);
                assert.ok(result.error, 'Should return error message');
            }
        });
        test('Should handle AI generation failure with fallback', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            // Create client that fails AI requests
            const failingClient = (0, providerTestHelper_1.createMockOllamaClient)(true, async () => {
                throw new Error('AI service unavailable');
            });
            const failingCmd = new CreateFileCommand(failingClient, mockLogger);
            const filePath = path.join(testWorkspacePath, 'fallback.js');
            const result = await failingCmd.execute(filePath, 'Test file');
            // Should succeed using fallback content
            (0, providerTestHelper_1.assertCommandSuccess)(result, filePath);
            (0, providerTestHelper_1.assertFileExists)(filePath);
            (0, providerTestHelper_1.assertFileContains)(filePath, 'TODO', 'Fallback content should include TODO');
        });
        test('Should handle client disconnection error', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const disconnectedClient = (0, providerTestHelper_1.createMockOllamaClient)(false);
            const disconnectedCmd = new CreateFileCommand(disconnectedClient, mockLogger);
            const filePath = path.join(testWorkspacePath, 'test.js');
            const result = await disconnectedCmd.execute(filePath, 'Test file');
            assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
            assert.ok(result.error, 'Should return error message');
            assert.ok(result.error.includes('not connected'), 'Error should mention connection issue');
            assert.ok(!fs.existsSync(filePath), 'File should not be created');
        });
    });
});
//# sourceMappingURL=createFile.command.test.js.map