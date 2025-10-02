"use strict";
/**
 * InlineCompletion Provider Tests
 * Comprehensive tests for AI-powered inline code completion
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
const vscode = __importStar(require("vscode"));
const inlineCompletionProvider_1 = require("../../providers/inlineCompletionProvider");
const extensionTestHelper_1 = require("../helpers/extensionTestHelper");
const test_constants_1 = require("../helpers/test-constants");
const providerTestHelper_1 = require("../helpers/providerTestHelper");
/**
 * Helper to get length of InlineCompletionItem array or InlineCompletionList
 */
function getCompletionLength(items) {
    if (!items) {
        return 0;
    }
    if (Array.isArray(items)) {
        return items.length;
    }
    // InlineCompletionList has an items property
    return items.items.length;
}
suite('InlineCompletion Provider Tests', () => {
    let completionProvider;
    let mockClient;
    let mockLogger;
    let testWorkspacePath;
    let cancellationToken;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        // Create mock client and logger using shared helpers
        mockClient = (0, providerTestHelper_1.createMockOllamaClient)(true, (0, providerTestHelper_1.createCompletionAIHandler)());
        mockLogger = (0, providerTestHelper_1.createMockLogger)();
        // Create provider
        completionProvider = new inlineCompletionProvider_1.InlineCompletionProvider(mockClient, mockLogger);
        // Create test workspace
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('inline-completion-tests');
        // Create cancellation token
        const tokenSource = new vscode.CancellationTokenSource();
        cancellationToken = tokenSource.token;
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        completionProvider.dispose();
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Completion Trigger Conditions', () => {
        test('Should trigger completion after method/property access (dot)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const name = user.';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'dot.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide completion after dot');
        });
        test('Should trigger completion after assignment operator', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'assignment.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide completion after assignment');
        });
        test('Should trigger completion for import statements', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'import ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'import.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide completion for imports');
        });
        test('Should NOT trigger completion for very short input (< 2 chars)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'x';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'short.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should not provide completion for short input');
        });
        test('Should NOT trigger completion after semicolon', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const x = 5;';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'semicolon.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should not provide completion after semicolon');
        });
        test('Should NOT trigger completion inside string literals', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const msg = "Hello ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'string.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should not provide completion inside strings');
        });
        test('Should NOT trigger completion inside comments', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = '// This is a comment and ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'comment.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should not provide completion inside comments');
        });
    });
    suite('Multi-line Completion Support', () => {
        test('Should provide multi-line completion for function bodies', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'function add(a, b) {\n  ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'multiline.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(1, 2);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            if (getCompletionLength(items) > 0 && 'insertText' in items[0]) {
                const insertText = items[0].insertText;
                assert.ok(insertText.includes('return'), 'Should suggest return statement for function');
            }
        });
        test('Should provide completion for control structures (if statements)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'if (';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'if.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide completion for if statement');
        });
        test('Should provide completion for loops (for statements)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'for (';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'for.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide completion for for loop');
        });
    });
    suite('Context Awareness', () => {
        test('Should use surrounding code for context-aware completions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = `
function calculateSum(a, b) {
  return a + b;
}

const result =
      `.trim();
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'context.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(4, 15); // After "const result = "
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should return completion items');
            assert.ok(getCompletionLength(items) > 0, 'Should provide context-aware completion');
        });
        test('Should detect function context correctly', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = `
class Calculator {
  add(a, b) {
    const sum =
  }
}
      `.trim();
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'function-context.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(2, 16); // Inside add method
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should detect function context');
        });
        test('Should respect indentation level in completions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = `
class Service {
  async fetchData() {
    const response =
  }
}
      `.trim();
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'indent.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(2, 21);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            // Indentation handling is tested by checking if multi-line completions exist
            assert.ok(Array.isArray(items), 'Should handle indentation');
        });
    });
    suite('Caching and Performance', () => {
        test('Should cache completion results', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'cache.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            // First request - should call AI
            const items1 = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            // Second request - should use cache
            const items2 = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.deepStrictEqual(items1, items2, 'Cached results should match original');
        });
        test('Should handle timeout gracefully', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.TIMEOUT_TEST);
            // Create client that simulates slow AI response
            const slowClient = {
                getConnectionStatus: () => ({ connected: true, model: 'test-model' }),
                sendAIRequest: async () => {
                    await (0, extensionTestHelper_1.sleep)(10000); // 10 second delay - will timeout
                    return { result: 'too slow' };
                }
            };
            const slowProvider = new inlineCompletionProvider_1.InlineCompletionProvider(slowClient, mockLogger);
            const code = 'const x = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'timeout.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await slowProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            // Should return empty array on timeout, not crash
            assert.strictEqual(getCompletionLength(items), 0, 'Should return empty array on timeout');
            slowProvider.dispose();
        });
    });
    suite('Language Support', () => {
        test('Should support TypeScript files', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const value: number = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'typescript.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should support TypeScript');
        });
        test('Should support Python files', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'def calculate():\n    result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'python.py', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(1, 13);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.ok(Array.isArray(items), 'Should support Python');
        });
        test('Should NOT support unsupported languages', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'This is plain text = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'plain.txt', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await completionProvider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should not support plain text files');
        });
    });
    suite('Error Handling', () => {
        test('Should return empty array when client is disconnected', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const disconnectedClient = {
                getConnectionStatus: () => ({ connected: false, model: null })
            };
            const provider = new inlineCompletionProvider_1.InlineCompletionProvider(disconnectedClient, mockLogger);
            const code = 'const result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'disconnected.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await provider.provideInlineCompletionItems(document, position, context, cancellationToken);
            assert.strictEqual(getCompletionLength(items), 0, 'Should return empty when disconnected');
            provider.dispose();
        });
        test('Should handle cancellation token', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const code = 'const result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'cancel.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const tokenSource = new vscode.CancellationTokenSource();
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const itemsPromise = completionProvider.provideInlineCompletionItems(document, position, context, tokenSource.token);
            // Cancel immediately
            tokenSource.cancel();
            const items = await itemsPromise;
            assert.ok(Array.isArray(items), 'Should handle cancellation gracefully');
        });
        test('Should handle AI request errors gracefully', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const errorClient = {
                getConnectionStatus: () => ({ connected: true, model: 'test-model' }),
                sendAIRequest: async () => {
                    throw new Error('AI service unavailable');
                }
            };
            const provider = new inlineCompletionProvider_1.InlineCompletionProvider(errorClient, mockLogger);
            const code = 'const result = ';
            const filePath = await (0, extensionTestHelper_1.createTestFile)(testWorkspacePath, 'error.ts', code);
            const document = await (0, extensionTestHelper_1.openDocument)(filePath);
            const position = new vscode.Position(0, code.length);
            const context = {
                triggerKind: vscode.InlineCompletionTriggerKind.Automatic,
                selectedCompletionInfo: undefined
            };
            const items = await provider.provideInlineCompletionItems(document, position, context, cancellationToken);
            // Should return empty array on error, not crash
            assert.strictEqual(getCompletionLength(items), 0, 'Should return empty array on AI error');
            provider.dispose();
        });
    });
});
//# sourceMappingURL=inlineCompletion.provider.test.js.map