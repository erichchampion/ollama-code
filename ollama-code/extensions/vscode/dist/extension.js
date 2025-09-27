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
const statusBarProvider_1 = require("./views/statusBarProvider");
const workspaceAnalyzer_1 = require("./services/workspaceAnalyzer");
const notificationService_1 = require("./services/notificationService");
const configurationUIService_1 = require("./services/configurationUIService");
const progressIndicatorService_1 = require("./services/progressIndicatorService");
const logger_1 = require("./utils/logger");
const errorUtils_1 = require("./utils/errorUtils");
const configurationHelper_1 = require("./utils/configurationHelper");
let client;
let logger;
let diagnosticProvider;
let statusBarProvider;
let workspaceAnalyzer;
let notificationService;
let configurationUIService;
let progressIndicatorService;
/**
 * Extension activation function
 */
async function activate(context) {
    logger = new logger_1.Logger('Ollama Code');
    logger.info('Activating Ollama Code extension...');
    try {
        // Initialize the client using ConfigurationHelper
        client = new ollamaCodeClient_1.OllamaCodeClient({
            port: configurationHelper_1.ConfigurationHelper.get('serverPort'),
            autoStart: configurationHelper_1.ConfigurationHelper.get('autoStart'),
            connectionTimeout: configurationHelper_1.ConfigurationHelper.get('connectionTimeout'),
            logLevel: configurationHelper_1.ConfigurationHelper.get('logLevel')
        });
        // Initialize services
        await initializeServices(context);
        // Initialize providers
        await initializeProviders(context);
        // Register commands
        registerCommands(context);
        // Set up event listeners
        setupEventListeners(context);
        // Attempt connection if auto-start is enabled
        if (configurationHelper_1.ConfigurationHelper.get('autoStart')) {
            await client.connect();
            vscode.commands.executeCommand('setContext', 'ollama-code.connected', true);
        }
        logger.info('Ollama Code extension activated successfully');
        vscode.window.showInformationMessage('Ollama Code extension activated');
    }
    catch (error) {
        logger.error('Failed to activate extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Ollama Code: ${(0, errorUtils_1.formatError)(error)}`);
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
        // Dispose providers
        if (diagnosticProvider) {
            diagnosticProvider.dispose();
        }
        // Dispose services
        if (statusBarProvider) {
            statusBarProvider.dispose();
        }
        if (workspaceAnalyzer) {
            workspaceAnalyzer.dispose();
        }
        if (notificationService) {
            notificationService.dispose();
        }
        if (configurationUIService) {
            configurationUIService.dispose();
        }
        if (progressIndicatorService) {
            progressIndicatorService.dispose();
        }
        logger?.info('Ollama Code extension deactivated');
    }
    catch (error) {
        logger?.error('Error during deactivation:', error);
    }
}
/**
 * Initialize core services
 */
async function initializeServices(context) {
    // Initialize workspace analyzer
    workspaceAnalyzer = new workspaceAnalyzer_1.WorkspaceAnalyzer();
    context.subscriptions.push(workspaceAnalyzer);
    logger.info('Workspace analyzer initialized');
    // Initialize notification service
    notificationService = new notificationService_1.NotificationService();
    context.subscriptions.push(notificationService);
    logger.info('Notification service initialized');
    // Initialize progress indicator service
    progressIndicatorService = new progressIndicatorService_1.ProgressIndicatorService(notificationService);
    context.subscriptions.push(progressIndicatorService);
    logger.info('Progress indicator service initialized');
    // Initialize configuration UI service
    configurationUIService = new configurationUIService_1.ConfigurationUIService(context, workspaceAnalyzer, notificationService);
    context.subscriptions.push(configurationUIService);
    logger.info('Configuration UI service initialized');
    // Initialize status bar provider
    statusBarProvider = new statusBarProvider_1.StatusBarProvider(client, logger);
    context.subscriptions.push(statusBarProvider);
    statusBarProvider.setupContextTracking();
    logger.info('Status bar provider initialized');
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
        { name: 'ollama-code.showOutput', handler: commandHandler.handleShowOutput.bind(commandHandler) },
        // Configuration commands
        { name: 'ollama-code.showConfiguration', handler: async () => {
                await configurationUIService.showConfigurationUI();
            } },
        { name: 'ollama-code.resetConfiguration', handler: async () => {
                const result = await vscode.window.showWarningMessage('Are you sure you want to reset all Ollama Code settings to default values?', 'Reset', 'Cancel');
                if (result === 'Reset') {
                    const config = vscode.workspace.getConfiguration('ollama-code');
                    const defaultSettings = {
                        'serverPort': 3002,
                        'autoStart': true,
                        'showChatView': true,
                        'inlineCompletions': true,
                        'codeActions': true,
                        'diagnostics': true,
                        'contextLines': 20,
                        'connectionTimeout': 10000,
                        'logLevel': 'info'
                    };
                    for (const [key, value] of Object.entries(defaultSettings)) {
                        await config.update(`ollama-code.${key}`, value, vscode.ConfigurationTarget.Workspace);
                    }
                    vscode.window.showInformationMessage('Configuration reset to default values');
                }
            } },
        // Status bar commands
        { name: 'ollama-code.toggleConnection', handler: async () => {
                const status = client.getConnectionStatus();
                if (status.connected) {
                    await client.disconnect();
                    vscode.window.showInformationMessage('Disconnected from Ollama Code server');
                }
                else {
                    try {
                        await client.connect();
                        vscode.window.showInformationMessage('Connected to Ollama Code server');
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            } },
        { name: 'ollama-code.showQuickActions', handler: async () => {
                const items = [
                    { label: 'Ask AI', description: 'Ask a general AI question', command: 'ollama-code.ask' },
                    { label: 'Explain Code', description: 'Explain selected code', command: 'ollama-code.explain' },
                    { label: 'Refactor Code', description: 'Refactor selected code', command: 'ollama-code.refactor' },
                    { label: 'Fix Code', description: 'Fix issues in selected code', command: 'ollama-code.fix' },
                    { label: 'Generate Code', description: 'Generate new code', command: 'ollama-code.generate' },
                    { label: 'Analyze File', description: 'Analyze current file', command: 'ollama-code.analyze' },
                    { label: 'Configuration', description: 'Open configuration', command: 'ollama-code.showConfiguration' }
                ];
                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select an AI action'
                });
                if (selected) {
                    vscode.commands.executeCommand(selected.command);
                }
            } },
        { name: 'ollama-code.showProgress', handler: async () => {
                const activeTasks = progressIndicatorService.getActiveProgressTasks();
                if (activeTasks.size === 0) {
                    vscode.window.showInformationMessage('No active operations');
                    return;
                }
                const items = Array.from(activeTasks.entries()).map(([id, task]) => ({
                    label: task.task.title,
                    description: `${Math.round(task.currentProgress)}% complete`,
                    detail: task.task.description,
                    id
                }));
                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Active AI operations'
                });
                if (selected) {
                    // Show detailed progress for selected task
                    vscode.window.showInformationMessage(`${selected.label}: ${selected.description}`);
                }
            } }
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