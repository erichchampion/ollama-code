"use strict";
/**
 * Ollama Code VS Code Extension
 *
 * Main extension entry point that provides AI-powered development assistance
 * through integration with the Ollama Code CLI backend.
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollamaCodeClient_1 = require("./client/ollamaCodeClient");
const commandHandler_1 = require("./commands/commandHandler");
const inlineCompletionProvider_1 = require("./providers/inlineCompletionProvider");
const codeActionProvider_1 = require("./providers/codeActionProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const diagnosticProvider_1 = require("./providers/diagnosticProvider");
const codeLensProvider_1 = require("./providers/codeLensProvider");
const documentSymbolProvider_1 = require("./providers/documentSymbolProvider");
const chatViewProvider_1 = require("./views/chatViewProvider");
const logger_1 = require("./utils/logger");
let client;
let logger;
let diagnosticProvider;
/**
 * Extension activation function
 */
async function activate(context) {
    logger = new logger_1.Logger('Ollama Code');
    logger.info('Activating Ollama Code extension...');
    try {
        // Initialize the client
        const config = vscode.workspace.getConfiguration('ollama-code');
        client = new ollamaCodeClient_1.OllamaCodeClient({
            port: config.get('serverPort', 3002), // IDE_SERVER_DEFAULTS.PORT
            autoStart: config.get('autoStart', true),
            connectionTimeout: config.get('connectionTimeout', 10000),
            logLevel: config.get('logLevel', 'info')
        });
        // Initialize providers
        await initializeProviders(context);
        // Register commands
        registerCommands(context);
        // Set up event listeners
        setupEventListeners(context);
        // Attempt connection if auto-start is enabled
        if (config.get('autoStart', true)) {
            await client.connect();
            vscode.commands.executeCommand('setContext', 'ollama-code.connected', true);
        }
        logger.info('Ollama Code extension activated successfully');
        vscode.window.showInformationMessage('Ollama Code extension activated');
    }
    catch (error) {
        logger.error('Failed to activate extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Ollama Code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}
/**
 * Extension deactivation function
 */
async function deactivate() {
    logger?.info('Deactivating Ollama Code extension...');
    try {
        // Disconnect client
        if (client) {
            await client.disconnect();
        }
        // Dispose diagnostic provider
        if (diagnosticProvider) {
            diagnosticProvider.dispose();
        }
        logger?.info('Ollama Code extension deactivated');
    }
    catch (error) {
        logger?.error('Error during deactivation:', error);
    }
}
/**
 * Initialize language feature providers
 */
async function initializeProviders(context) {
    const config = vscode.workspace.getConfiguration('ollama-code');
    // Register inline completion provider
    if (config.get('inlineCompletions', true)) {
        const inlineProvider = new inlineCompletionProvider_1.InlineCompletionProvider(client, logger);
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file' }, inlineProvider));
        logger.info('Inline completion provider registered');
    }
    // Register code action provider
    if (config.get('codeActions', true)) {
        const codeActionProvider = new codeActionProvider_1.CodeActionProvider(client, logger);
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file' }, codeActionProvider, {
            providedCodeActionKinds: [
                vscode.CodeActionKind.QuickFix,
                vscode.CodeActionKind.Refactor,
                vscode.CodeActionKind.RefactorExtract,
                vscode.CodeActionKind.RefactorInline,
                vscode.CodeActionKind.RefactorRewrite
            ]
        }));
        logger.info('Code action provider registered');
    }
    // Register hover provider
    const hoverProvider = new hoverProvider_1.HoverProvider(client, logger);
    context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: 'file' }, hoverProvider));
    logger.info('Hover provider registered');
    // Register diagnostic provider
    if (config.get('diagnostics', true)) {
        diagnosticProvider = new diagnosticProvider_1.DiagnosticProvider(client, logger);
        context.subscriptions.push(diagnosticProvider);
        logger.info('Diagnostic provider registered');
    }
    // Register code lens provider
    const codeLensProvider = new codeLensProvider_1.CodeLensProvider(client, logger);
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider));
    logger.info('Code lens provider registered');
    // Register document symbol provider
    const documentSymbolProvider = new documentSymbolProvider_1.DocumentSymbolProvider(client, logger);
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: 'file' }, documentSymbolProvider));
    logger.info('Document symbol provider registered');
    // Register chat view provider
    if (config.get('showChatView', true)) {
        const chatProvider = new chatViewProvider_1.ChatViewProvider(context, client, logger);
        context.subscriptions.push(vscode.window.registerWebviewViewProvider('ollama-code-chat', chatProvider, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }));
        logger.info('Chat view provider registered');
    }
}
/**
 * Register extension commands
 */
function registerCommands(context) {
    const commandHandler = new commandHandler_1.CommandHandler(client, logger);
    const commands = [
        { name: 'ollama-code.ask', handler: commandHandler.handleAsk.bind(commandHandler) },
        { name: 'ollama-code.explain', handler: commandHandler.handleExplain.bind(commandHandler) },
        { name: 'ollama-code.refactor', handler: commandHandler.handleRefactor.bind(commandHandler) },
        { name: 'ollama-code.fix', handler: commandHandler.handleFix.bind(commandHandler) },
        { name: 'ollama-code.generate', handler: commandHandler.handleGenerate.bind(commandHandler) },
        { name: 'ollama-code.analyze', handler: commandHandler.handleAnalyze.bind(commandHandler) },
        { name: 'ollama-code.startServer', handler: commandHandler.handleStartServer.bind(commandHandler) },
        { name: 'ollama-code.stopServer', handler: commandHandler.handleStopServer.bind(commandHandler) },
        { name: 'ollama-code.showOutput', handler: commandHandler.handleShowOutput.bind(commandHandler) }
    ];
    for (const { name, handler } of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(name, handler));
    }
    logger.info(`Registered ${commands.length} commands`);
}
/**
 * Set up event listeners
 */
function setupEventListeners(context) {
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration('ollama-code')) {
            logger.info('Configuration changed, updating client...');
            const config = vscode.workspace.getConfiguration('ollama-code');
            await client.updateConfig({
                port: config.get('serverPort', 3002), // IDE_SERVER_DEFAULTS.PORT
                autoStart: config.get('autoStart', true),
                connectionTimeout: config.get('connectionTimeout', 10000),
                logLevel: config.get('logLevel', 'info')
            });
        }
    }));
    // Listen for file system changes
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        // Update context for the changed document
        client.updateContext({
            activeFile: event.document.uri.fsPath,
            language: event.document.languageId
        });
    }));
    // Listen for editor changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            client.updateContext({
                activeFile: editor.document.uri.fsPath,
                language: editor.document.languageId,
                cursorPosition: {
                    line: editor.selection.active.line,
                    character: editor.selection.active.character
                },
                selection: editor.selection.isEmpty ? undefined : {
                    start: {
                        line: editor.selection.start.line,
                        character: editor.selection.start.character
                    },
                    end: {
                        line: editor.selection.end.line,
                        character: editor.selection.end.character
                    }
                }
            });
        }
    }));
    // Listen for selection changes
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event) => {
        client.updateContext({
            activeFile: event.textEditor.document.uri.fsPath,
            cursorPosition: {
                line: event.selections[0].active.line,
                character: event.selections[0].active.character
            },
            selection: event.selections[0].isEmpty ? undefined : {
                start: {
                    line: event.selections[0].start.line,
                    character: event.selections[0].start.character
                },
                end: {
                    line: event.selections[0].end.line,
                    character: event.selections[0].end.character
                }
            }
        });
    }));
    // Listen for workspace folder changes
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            client.updateContext({
                rootPath: vscode.workspace.workspaceFolders[0].uri.fsPath
            });
        }
    }));
    logger.info('Event listeners set up');
}
//# sourceMappingURL=extension.js.map