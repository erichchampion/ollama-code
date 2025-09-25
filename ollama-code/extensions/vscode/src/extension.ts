/**
 * Ollama Code VS Code Extension
 *
 * Main extension entry point that provides AI-powered development assistance
 * through integration with the Ollama Code CLI backend.
 */

import * as vscode from 'vscode';
import { OllamaCodeClient } from './client/ollamaCodeClient';
import { CommandHandler } from './commands/commandHandler';
import { InlineCompletionProvider } from './providers/inlineCompletionProvider';
import { CodeActionProvider } from './providers/codeActionProvider';
import { HoverProvider } from './providers/hoverProvider';
import { DiagnosticProvider } from './providers/diagnosticProvider';
import { CodeLensProvider } from './providers/codeLensProvider';
import { DocumentSymbolProvider } from './providers/documentSymbolProvider';
import { ChatViewProvider } from './views/chatViewProvider';
import { Logger } from './utils/logger';

let client: OllamaCodeClient;
let logger: Logger;
let diagnosticProvider: DiagnosticProvider;

/**
 * Extension activation function
 */
export async function activate(context: vscode.ExtensionContext) {
  logger = new Logger('Ollama Code');
  logger.info('Activating Ollama Code extension...');

  try {
    // Initialize the client
    const config = vscode.workspace.getConfiguration('ollama-code');
    client = new OllamaCodeClient({
      port: config.get<number>('serverPort', 3002), // IDE_SERVER_DEFAULTS.PORT
      autoStart: config.get<boolean>('autoStart', true),
      connectionTimeout: config.get<number>('connectionTimeout', 10000),
      logLevel: config.get<string>('logLevel', 'info')
    });

    // Initialize providers
    await initializeProviders(context);

    // Register commands
    registerCommands(context);

    // Set up event listeners
    setupEventListeners(context);

    // Attempt connection if auto-start is enabled
    if (config.get<boolean>('autoStart', true)) {
      await client.connect();
      vscode.commands.executeCommand('setContext', 'ollama-code.connected', true);
    }

    logger.info('Ollama Code extension activated successfully');
    vscode.window.showInformationMessage('Ollama Code extension activated');

  } catch (error) {
    logger.error('Failed to activate extension:', error);
    vscode.window.showErrorMessage(`Failed to activate Ollama Code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Extension deactivation function
 */
export async function deactivate() {
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

  } catch (error) {
    logger?.error('Error during deactivation:', error);
  }
}

/**
 * Initialize language feature providers
 */
async function initializeProviders(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('ollama-code');

  // Register inline completion provider
  if (config.get<boolean>('inlineCompletions', true)) {
    const inlineProvider = new InlineCompletionProvider(client, logger);
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file' },
        inlineProvider
      )
    );
    logger.info('Inline completion provider registered');
  }

  // Register code action provider
  if (config.get<boolean>('codeActions', true)) {
    const codeActionProvider = new CodeActionProvider(client, logger);
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        { scheme: 'file' },
        codeActionProvider,
        {
          providedCodeActionKinds: [
            vscode.CodeActionKind.QuickFix,
            vscode.CodeActionKind.Refactor,
            vscode.CodeActionKind.RefactorExtract,
            vscode.CodeActionKind.RefactorInline,
            vscode.CodeActionKind.RefactorRewrite
          ]
        }
      )
    );
    logger.info('Code action provider registered');
  }

  // Register hover provider
  const hoverProvider = new HoverProvider(client, logger);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: 'file' },
      hoverProvider
    )
  );
  logger.info('Hover provider registered');

  // Register diagnostic provider
  if (config.get<boolean>('diagnostics', true)) {
    diagnosticProvider = new DiagnosticProvider(client, logger);
    context.subscriptions.push(diagnosticProvider);
    logger.info('Diagnostic provider registered');
  }

  // Register code lens provider
  const codeLensProvider = new CodeLensProvider(client, logger);
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      codeLensProvider
    )
  );
  logger.info('Code lens provider registered');

  // Register document symbol provider
  const documentSymbolProvider = new DocumentSymbolProvider(client, logger);
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { scheme: 'file' },
      documentSymbolProvider
    )
  );
  logger.info('Document symbol provider registered');

  // Register chat view provider
  if (config.get<boolean>('showChatView', true)) {
    const chatProvider = new ChatViewProvider(context, client, logger);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        'ollama-code-chat',
        chatProvider,
        {
          webviewOptions: {
            retainContextWhenHidden: true
          }
        }
      )
    );
    logger.info('Chat view provider registered');
  }
}

/**
 * Register extension commands
 */
function registerCommands(context: vscode.ExtensionContext) {
  const commandHandler = new CommandHandler(client, logger);

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
    context.subscriptions.push(
      vscode.commands.registerCommand(name, handler)
    );
  }

  logger.info(`Registered ${commands.length} commands`);
}

/**
 * Set up event listeners
 */
function setupEventListeners(context: vscode.ExtensionContext) {
  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration('ollama-code')) {
        logger.info('Configuration changed, updating client...');

        const config = vscode.workspace.getConfiguration('ollama-code');
        await client.updateConfig({
          port: config.get<number>('serverPort', 3002), // IDE_SERVER_DEFAULTS.PORT
          autoStart: config.get<boolean>('autoStart', true),
          connectionTimeout: config.get<number>('connectionTimeout', 10000),
          logLevel: config.get<string>('logLevel', 'info')
        });
      }
    })
  );

  // Listen for file system changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      // Update context for the changed document
      client.updateContext({
        activeFile: event.document.uri.fsPath,
        language: event.document.languageId
      });
    })
  );

  // Listen for editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
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
    })
  );

  // Listen for selection changes
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
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
    })
  );

  // Listen for workspace folder changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        client.updateContext({
          rootPath: vscode.workspace.workspaceFolders[0].uri.fsPath
        });
      }
    })
  );

  logger.info('Event listeners set up');
}