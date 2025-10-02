"use strict";
/**
 * Extension Test Helpers
 * Utilities for testing VS Code extension functionality
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
exports.sleep = void 0;
exports.waitForExtensionActivation = waitForExtensionActivation;
exports.getExtension = getExtension;
exports.isExtensionActive = isExtensionActive;
exports.getRegisteredCommands = getRegisteredCommands;
exports.isCommandRegistered = isCommandRegistered;
exports.executeCommand = executeCommand;
exports.createTestWorkspace = createTestWorkspace;
exports.cleanupTestWorkspace = cleanupTestWorkspace;
exports.createTestFile = createTestFile;
exports.openDocument = openDocument;
exports.openAndShowDocument = openAndShowDocument;
exports.getConfig = getConfig;
exports.updateConfig = updateConfig;
exports.resetConfig = resetConfig;
exports.waitFor = waitFor;
exports.getActiveEditor = getActiveEditor;
exports.getVisibleEditors = getVisibleEditors;
exports.closeAllEditors = closeAllEditors;
exports.showMessage = showMessage;
exports.getWorkspaceFolders = getWorkspaceFolders;
exports.getDiagnostics = getDiagnostics;
exports.createMockWorkspace = createMockWorkspace;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const test_constants_js_1 = require("./test-constants.js");
const test_utils_js_1 = require("./test-utils.js");
/**
 * Wait for extension to activate
 */
async function waitForExtensionActivation(extensionId = test_constants_js_1.EXTENSION_TEST_CONSTANTS.EXTENSION_ID, timeout = test_constants_js_1.EXTENSION_TEST_CONSTANTS.ACTIVATION_TIMEOUT) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const extension = vscode.extensions.getExtension(extensionId);
        if (extension?.isActive) {
            return extension;
        }
        await (0, test_utils_js_1.sleep)(test_constants_js_1.EXTENSION_TEST_CONSTANTS.POLLING_INTERVAL);
    }
    throw new Error(`Extension ${extensionId} did not activate within ${timeout}ms`);
}
/**
 * Get activated extension
 */
function getExtension(extensionId = test_constants_js_1.EXTENSION_TEST_CONSTANTS.EXTENSION_ID) {
    return vscode.extensions.getExtension(extensionId);
}
/**
 * Check if extension is active
 */
function isExtensionActive(extensionId = test_constants_js_1.EXTENSION_TEST_CONSTANTS.EXTENSION_ID) {
    const extension = vscode.extensions.getExtension(extensionId);
    return extension?.isActive ?? false;
}
/**
 * Get all registered commands
 */
async function getRegisteredCommands() {
    return await vscode.commands.getCommands(true);
}
/**
 * Check if command is registered
 */
async function isCommandRegistered(commandId) {
    const commands = await getRegisteredCommands();
    return commands.includes(commandId);
}
/**
 * Execute command and capture result
 */
async function executeCommand(commandId, ...args) {
    return await vscode.commands.executeCommand(commandId, ...args);
}
/**
 * Create temporary test workspace
 */
async function createTestWorkspace(name = 'test-workspace') {
    const tmpDir = path.join(__dirname, '../../../.test-workspaces', name);
    await (0, test_utils_js_1.ensureDir)(tmpDir);
    return tmpDir;
}
/**
 * Clean up test workspace
 */
async function cleanupTestWorkspace(workspacePath) {
    await (0, test_utils_js_1.remove)(workspacePath, true);
}
/**
 * Create test file in workspace
 */
async function createTestFile(workspacePath, filename, content) {
    const filePath = path.join(workspacePath, filename);
    const dir = path.dirname(filePath);
    await (0, test_utils_js_1.ensureDir)(dir);
    await (0, test_utils_js_1.writeFile)(filePath, content);
    return filePath;
}
/**
 * Open document in editor
 */
async function openDocument(filePath) {
    const uri = vscode.Uri.file(filePath);
    return await vscode.workspace.openTextDocument(uri);
}
/**
 * Open document and show in editor
 */
async function openAndShowDocument(filePath) {
    const document = await openDocument(filePath);
    return await vscode.window.showTextDocument(document);
}
/**
 * Get configuration value
 */
function getConfig(key, defaultValue) {
    const config = vscode.workspace.getConfiguration('ollama-code');
    if (defaultValue !== undefined) {
        return config.get(key, defaultValue);
    }
    return config.get(key);
}
/**
 * Update configuration value
 */
async function updateConfig(key, value, configurationTarget = vscode.ConfigurationTarget.Global) {
    await vscode.workspace.getConfiguration('ollama-code').update(key, value, configurationTarget);
}
/**
 * Reset configuration to defaults
 */
async function resetConfig() {
    const config = vscode.workspace.getConfiguration('ollama-code');
    const keys = [
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
    for (const key of keys) {
        await config.update(key, undefined, vscode.ConfigurationTarget.Global);
    }
}
// Re-export sleep from shared utilities
var test_utils_js_2 = require("./test-utils.js");
Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return test_utils_js_2.sleep; } });
/**
 * Wait for condition to be true (wrapper for shared utility with default values)
 */
async function waitFor(condition, timeout = test_constants_js_1.EXTENSION_TEST_CONSTANTS.COMMAND_TIMEOUT, interval = test_constants_js_1.EXTENSION_TEST_CONSTANTS.POLLING_INTERVAL) {
    await (0, test_utils_js_1.waitFor)(condition, timeout, interval);
}
/**
 * Get active text editor
 */
function getActiveEditor() {
    return vscode.window.activeTextEditor;
}
/**
 * Get all visible text editors
 */
function getVisibleEditors() {
    return vscode.window.visibleTextEditors;
}
/**
 * Close all editors
 */
async function closeAllEditors() {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}
/**
 * Show information message and wait for user action
 */
async function showMessage(message) {
    await vscode.window.showInformationMessage(message);
}
/**
 * Get workspace folders
 */
function getWorkspaceFolders() {
    return vscode.workspace.workspaceFolders;
}
/**
 * Capture diagnostic messages
 */
function getDiagnostics(uri) {
    if (uri) {
        return vscode.languages.getDiagnostics(uri);
    }
    const allDiagnostics = [];
    vscode.languages.getDiagnostics().forEach(([_, diagnostics]) => {
        allDiagnostics.push(...diagnostics);
    });
    return allDiagnostics;
}
async function createMockWorkspace(options) {
    const workspacePath = await createTestWorkspace(options.name);
    for (const file of options.files) {
        await createTestFile(workspacePath, file.path, file.content);
    }
    return workspacePath;
}
//# sourceMappingURL=extensionTestHelper.js.map