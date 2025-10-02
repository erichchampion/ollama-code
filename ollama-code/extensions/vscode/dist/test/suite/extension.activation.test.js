"use strict";
/**
 * Extension Activation Tests
 * Tests for VS Code extension activation, command registration, and initialization
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
const extensionTestHelper_1 = require("../helpers/extensionTestHelper");
const test_constants_1 = require("../helpers/test-constants");
suite('Extension Activation Tests', () => {
    const EXTENSION_ID = test_constants_1.EXTENSION_TEST_CONSTANTS.EXTENSION_ID;
    suiteSetup(async function () {
        this.timeout(30000); // Allow extra time for activation
        await (0, extensionTestHelper_1.waitForExtensionActivation)(EXTENSION_ID, 20000);
    });
    suiteTeardown(async () => {
        await (0, extensionTestHelper_1.resetConfig)();
    });
    test('Extension should be present', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        assert.ok(extension, 'Extension should be found in VS Code');
    });
    test('Extension should activate', async function () {
        this.timeout(20000);
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        assert.ok(extension, 'Extension should be present');
        // Wait for activation if not already active
        if (!extension.isActive) {
            await extension.activate();
        }
        assert.strictEqual(extension.isActive, true, 'Extension should be active after activation');
    });
    test('Extension should have correct ID', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        assert.strictEqual(extension?.id, EXTENSION_ID, 'Extension ID should match expected ID');
    });
    test('Extension should have package.json metadata', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const packageJSON = extension?.packageJSON;
        assert.ok(packageJSON, 'Package.json should be available');
        assert.strictEqual(packageJSON.name, 'ollama-code-vscode', 'Package name should match');
        assert.strictEqual(packageJSON.displayName, 'Ollama Code', 'Display name should match');
        assert.ok(packageJSON.version, 'Version should be defined');
        assert.ok(packageJSON.description, 'Description should be defined');
    });
    test('Extension should register all expected commands', async () => {
        const commands = await (0, extensionTestHelper_1.getRegisteredCommands)();
        for (const expectedCommand of test_constants_1.EXPECTED_COMMANDS) {
            const isRegistered = commands.includes(expectedCommand);
            assert.ok(isRegistered, `Command '${expectedCommand}' should be registered`);
        }
    });
    test('Extension should register commands individually', async () => {
        // Test a subset of critical commands
        const criticalCommands = [
            'ollama-code.ask',
            'ollama-code.explain',
            'ollama-code.refactor',
            'ollama-code.analyze'
        ];
        for (const command of criticalCommands) {
            const registered = await (0, extensionTestHelper_1.isCommandRegistered)(command);
            assert.ok(registered, `Critical command '${command}' should be registered`);
        }
    });
    test('Extension configuration should have default values', () => {
        const serverPort = (0, extensionTestHelper_1.getConfig)('serverPort');
        const autoStart = (0, extensionTestHelper_1.getConfig)('autoStart');
        const showChatView = (0, extensionTestHelper_1.getConfig)('showChatView');
        const inlineCompletions = (0, extensionTestHelper_1.getConfig)('inlineCompletions');
        assert.strictEqual(typeof serverPort, 'number', 'serverPort should be a number');
        assert.strictEqual(typeof autoStart, 'boolean', 'autoStart should be a boolean');
        assert.strictEqual(typeof showChatView, 'boolean', 'showChatView should be a boolean');
        assert.strictEqual(typeof inlineCompletions, 'boolean', 'inlineCompletions should be a boolean');
    });
    test('Extension should have expected configuration schema', () => {
        const expectedConfigKeys = [
            'serverPort',
            'autoStart',
            'showChatView',
            'inlineCompletions',
            'codeActions',
            'diagnostics',
            'contextLines',
            'connectionTimeout',
            'logLevel'
        ];
        for (const key of expectedConfigKeys) {
            const value = (0, extensionTestHelper_1.getConfig)(key);
            assert.notStrictEqual(value, undefined, `Configuration key '${key}' should have a default value`);
        }
    });
    test('Extension should expose activation/deactivation functions', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        // Check that the extension module exports the expected functions
        // Note: These are verified by successful activation/deactivation
        assert.ok(extension?.isActive, 'Extension should be active, indicating successful activation');
    });
    test('Extension should register in correct categories', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const categories = extension?.packageJSON.categories;
        assert.ok(Array.isArray(categories), 'Categories should be an array');
        assert.ok(categories?.includes('AI'), 'Should include AI category');
        assert.ok(categories?.includes('Programming Languages'), 'Should include Programming Languages category');
    });
    test('Extension should have correct activation events', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const activationEvents = extension?.packageJSON.activationEvents;
        assert.ok(Array.isArray(activationEvents), 'Activation events should be an array');
        assert.ok(activationEvents?.includes('onStartupFinished'), 'Should activate on startup finished');
    });
    test('Extension should have main entry point', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const main = extension?.packageJSON.main;
        assert.ok(main, 'Main entry point should be defined');
        assert.ok(main.includes('extension.js'), 'Main entry should point to extension.js');
    });
    test('Extension activation should not throw errors', async function () {
        this.timeout(15000);
        // Re-activate to ensure no errors
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        try {
            if (!extension?.isActive) {
                await extension?.activate();
            }
            assert.ok(true, 'Extension activation should not throw errors');
        }
        catch (error) {
            assert.fail(`Extension activation threw an error: ${error}`);
        }
    });
    test('Extension should be ready for use after activation', () => {
        const isActive = (0, extensionTestHelper_1.isExtensionActive)(EXTENSION_ID);
        assert.ok(isActive, 'Extension should be active and ready for use');
    });
    test('Extension should have keybindings configured', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const keybindings = extension?.packageJSON.contributes?.keybindings;
        assert.ok(Array.isArray(keybindings), 'Keybindings should be defined');
        assert.ok(keybindings && keybindings.length > 0, 'Should have at least one keybinding');
        // Check for critical keybindings
        const hasAskKeybinding = keybindings?.some((kb) => kb.command === 'ollama-code.ask');
        const hasExplainKeybinding = keybindings?.some((kb) => kb.command === 'ollama-code.explain');
        assert.ok(hasAskKeybinding, 'Should have keybinding for ask command');
        assert.ok(hasExplainKeybinding, 'Should have keybinding for explain command');
    });
    test('Extension should have views configured', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const views = extension?.packageJSON.contributes?.views;
        assert.ok(views, 'Views should be defined');
        assert.ok(views?.explorer, 'Should have explorer views');
        assert.ok(Array.isArray(views?.explorer), 'Explorer views should be an array');
        const chatView = views?.explorer?.find((v) => v.id === 'ollama-code-chat');
        assert.ok(chatView, 'Should have AI Chat view configured');
    });
    test('Extension should have menus configured', () => {
        const extension = (0, extensionTestHelper_1.getExtension)(EXTENSION_ID);
        const menus = extension?.packageJSON.contributes?.menus;
        assert.ok(menus, 'Menus should be defined');
        assert.ok(menus?.['editor/context'], 'Should have editor context menu');
        assert.ok(menus?.commandPalette, 'Should have command palette menu');
    });
});
//# sourceMappingURL=extension.activation.test.js.map