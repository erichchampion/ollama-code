# Chapter 14: IDE Integration and Developer Experience

> *"The best tools are invisible. They don't get in your way; they amplify your capabilities."*

---

## Chapter Overview

In Chapter 13, you built a plugin system that enables ecosystem growth. Now, we'll integrate your AI coding assistant directly into IDEs to create a seamless, invisible developer experience.

**What you'll learn:**
- VS Code extension architecture
- Language Server Protocol (LSP) integration
- IntelliSense and autocomplete integration
- Quick Fixes and code actions
- Debugging integration
- IDE-agnostic patterns for IntelliJ, Vim, etc.

**Why this matters:**
- **Context switching kills productivity** - Developers lose flow switching between IDE and CLI
- **Native experience expected** - Modern developers expect AI assistance inline, not in separate tools
- **10x productivity boost** - Inline AI suggestions reduce friction from minutes to seconds

---

## 14.1: The Context Switching Problem

### Before IDE Integration

```
Developer workflow WITHOUT IDE integration:

1. Write code in VS Code
2. Encounter error
3. Copy error message
4. Switch to terminal
5. Run: ollama-code "explain this error: [paste]"
6. Read output in terminal
7. Switch back to VS Code
8. Apply fix manually
9. Repeat...

Time per iteration: 2-5 minutes
Context switches: 4+ per iteration
Flow state: Destroyed
```

### After IDE Integration

```
Developer workflow WITH IDE integration:

1. Write code in VS Code
2. Encounter error
3. Click Quick Fix (Cmd+.)
4. AI suggests fix inline
5. Apply with one click
6. Continue coding

Time per iteration: 10-30 seconds
Context switches: 0
Flow state: Preserved
```

**Impact:**
- ⬇️ 80% reduction in time to fix
- ⬇️ 100% reduction in context switches
- ⬆️ Developer satisfaction and productivity

---

## 14.2: VS Code Extension Architecture

### Extension Structure

VS Code extensions are TypeScript/JavaScript packages with a specific structure:

```
my-ai-extension/
├── package.json              # Extension manifest
├── src/
│   ├── extension.ts         # Entry point
│   ├── commands/            # Command handlers
│   ├── providers/           # IntelliSense, Quick Fixes, etc.
│   ├── client.ts            # AI client integration
│   └── utils/
├── syntaxes/                # Language grammars (optional)
├── snippets/                # Code snippets (optional)
└── README.md
```

### package.json - Extension Manifest

```json
{
  "name": "ollama-code-vscode",
  "displayName": "Ollama Code AI Assistant",
  "description": "AI coding assistant powered by Ollama",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Programming Languages", "Machine Learning"],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "ollamaCode.explainCode",
        "title": "Explain Code",
        "category": "Ollama Code"
      },
      {
        "command": "ollamaCode.fixError",
        "title": "Fix Error",
        "category": "Ollama Code"
      },
      {
        "command": "ollamaCode.generateTests",
        "title": "Generate Tests",
        "category": "Ollama Code"
      },
      {
        "command": "ollamaCode.refactor",
        "title": "Refactor Code",
        "category": "Ollama Code"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "when": "editorHasSelection",
          "command": "ollamaCode.explainCode",
          "group": "ollamaCode@1"
        },
        {
          "when": "editorHasSelection",
          "command": "ollamaCode.refactor",
          "group": "ollamaCode@2"
        }
      ]
    },
    "keybindings": [
      {
        "command": "ollamaCode.explainCode",
        "key": "ctrl+shift+e",
        "mac": "cmd+shift+e",
        "when": "editorTextFocus"
      },
      {
        "command": "ollamaCode.fixError",
        "key": "ctrl+shift+f",
        "mac": "cmd+shift+f",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "Ollama Code",
      "properties": {
        "ollamaCode.model": {
          "type": "string",
          "default": "codellama:7b",
          "description": "Default AI model to use"
        },
        "ollamaCode.apiUrl": {
          "type": "string",
          "default": "http://localhost:11434",
          "description": "Ollama API URL"
        },
        "ollamaCode.maxTokens": {
          "type": "number",
          "default": 2048,
          "description": "Maximum tokens for completions"
        },
        "ollamaCode.enableInlineCompletions": {
          "type": "boolean",
          "default": true,
          "description": "Enable inline AI completions"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "yarn run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "yarn run compile",
    "test": "node ./out/test/runTest.js"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "axios": "^1.4.0"
  }
}
```

### Extension Entry Point

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { ExplainCodeCommand } from './commands/explainCode';
import { FixErrorCommand } from './commands/fixError';
import { GenerateTestsCommand } from './commands/generateTests';
import { RefactorCommand } from './commands/refactor';
import { InlineCompletionProvider } from './providers/inlineCompletions';
import { CodeActionProvider } from './providers/codeActions';
import { AIClient } from './client';

let aiClient: AIClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('Ollama Code extension is now active');

  // Initialize AI client
  const config = vscode.workspace.getConfiguration('ollamaCode');
  aiClient = new AIClient({
    apiUrl: config.get('apiUrl') || 'http://localhost:11434',
    model: config.get('model') || 'codellama:7b',
    maxTokens: config.get('maxTokens') || 2048
  });

  // Register commands
  registerCommands(context);

  // Register providers
  registerProviders(context);

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('ollamaCode')) {
        const newConfig = vscode.workspace.getConfiguration('ollamaCode');
        aiClient.updateConfig({
          apiUrl: newConfig.get('apiUrl') || 'http://localhost:11434',
          model: newConfig.get('model') || 'codellama:7b',
          maxTokens: newConfig.get('maxTokens') || 2048
        });
      }
    })
  );

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(robot) Ollama Code';
  statusBarItem.tooltip = 'Ollama Code AI Assistant is active';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

function registerCommands(context: vscode.ExtensionContext) {
  const commands = [
    new ExplainCodeCommand(aiClient),
    new FixErrorCommand(aiClient),
    new GenerateTestsCommand(aiClient),
    new RefactorCommand(aiClient)
  ];

  for (const cmd of commands) {
    const disposable = vscode.commands.registerCommand(
      cmd.id,
      cmd.execute.bind(cmd)
    );
    context.subscriptions.push(disposable);
  }
}

function registerProviders(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('ollamaCode');

  // Inline completions (like GitHub Copilot)
  if (config.get('enableInlineCompletions')) {
    const inlineProvider = new InlineCompletionProvider(aiClient);
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        inlineProvider
      )
    );
  }

  // Code actions (Quick Fixes)
  const codeActionProvider = new CodeActionProvider(aiClient);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { pattern: '**' },
      codeActionProvider,
      {
        providedCodeActionKinds: [
          vscode.CodeActionKind.QuickFix,
          vscode.CodeActionKind.Refactor
        ]
      }
    )
  );
}

export function deactivate() {
  if (aiClient) {
    aiClient.dispose();
  }
}
```

---

## 14.3: AI Client Integration

### Connecting to Ollama Code Backend

```typescript
// src/client.ts
import axios, { AxiosInstance } from 'axios';

export interface AIClientConfig {
  apiUrl: string;
  model: string;
  maxTokens: number;
  timeout?: number;
}

export interface CompletionRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

export interface CompletionResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export class AIClient {
  private config: AIClientConfig;
  private httpClient: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: AIClientConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateConfig(config: Partial<AIClientConfig>): void {
    this.config = { ...this.config, ...config };
    this.httpClient.defaults.baseURL = this.config.apiUrl;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const requestId = this.generateRequestId();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await this.httpClient.post(
        '/api/generate',
        {
          model: this.config.model,
          prompt: this.buildPrompt(request),
          options: {
            num_predict: request.maxTokens || this.config.maxTokens,
            temperature: request.temperature || 0.7,
            stop: request.stopSequences
          },
          stream: false
        },
        {
          signal: abortController.signal
        }
      );

      return {
        content: response.data.response,
        usage: {
          inputTokens: response.data.prompt_eval_count || 0,
          outputTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) +
                      (response.data.eval_count || 0)
        }
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request was cancelled');
      }
      throw new Error(`AI completion failed: ${error.message}`);
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  async *streamComplete(
    request: CompletionRequest
  ): AsyncGenerator<string, void, unknown> {
    const requestId = this.generateRequestId();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      const response = await this.httpClient.post(
        '/api/generate',
        {
          model: this.config.model,
          prompt: this.buildPrompt(request),
          options: {
            num_predict: request.maxTokens || this.config.maxTokens,
            temperature: request.temperature || 0.7
          },
          stream: true
        },
        {
          signal: abortController.signal,
          responseType: 'stream'
        }
      );

      const stream = response.data;
      let buffer = '';

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  cancel(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAll(): void {
    for (const [id, controller] of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  dispose(): void {
    this.cancelAll();
  }

  private buildPrompt(request: CompletionRequest): string {
    let prompt = '';

    if (request.context) {
      prompt += `Context:\n${request.context}\n\n`;
    }

    prompt += request.prompt;

    return prompt;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 14.4: Command Implementations

### Explain Code Command

```typescript
// src/commands/explainCode.ts
import * as vscode from 'vscode';
import { AIClient } from '../client';

export class ExplainCodeCommand {
  readonly id = 'ollamaCode.explainCode';

  constructor(private aiClient: AIClient) {}

  async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showErrorMessage('No code selected');
      return;
    }

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Explaining code...',
        cancellable: true
      },
      async (progress, token) => {
        try {
          // Get language context
          const languageId = editor.document.languageId;
          const fileName = editor.document.fileName;

          const response = await this.aiClient.complete({
            prompt: `Explain the following ${languageId} code:\n\n${selectedText}`,
            context: `File: ${fileName}\nLanguage: ${languageId}`,
            temperature: 0.3
          });

          // Show explanation in a webview panel
          this.showExplanation(selectedText, response.content, languageId);
        } catch (error) {
          if (token.isCancellationRequested) {
            return;
          }
          vscode.window.showErrorMessage(
            `Failed to explain code: ${error.message}`
          );
        }
      }
    );
  }

  private showExplanation(
    code: string,
    explanation: string,
    language: string
  ): void {
    const panel = vscode.window.createWebviewPanel(
      'codeExplanation',
      'Code Explanation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    panel.webview.html = this.getExplanationHtml(code, explanation, language);
  }

  private getExplanationHtml(
    code: string,
    explanation: string,
    language: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Explanation</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        h2 {
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        pre {
            background-color: var(--vscode-textBlockQuote-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        .explanation {
            margin-top: 20px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h2>Selected Code</h2>
    <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>

    <h2>Explanation</h2>
    <div class="explanation">${this.escapeHtml(explanation)}</div>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
```

### Fix Error Command

```typescript
// src/commands/fixError.ts
import * as vscode from 'vscode';
import { AIClient } from '../client';

export class FixErrorCommand {
  readonly id = 'ollamaCode.fixError';

  constructor(private aiClient: AIClient) {}

  async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Get diagnostics (errors, warnings) at current position
    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const position = editor.selection.active;

    // Find diagnostic at cursor position
    const diagnostic = diagnostics.find((d) =>
      d.range.contains(position)
    );

    if (!diagnostic) {
      vscode.window.showInformationMessage(
        'No error found at cursor position'
      );
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating fix...',
        cancellable: true
      },
      async (progress, token) => {
        try {
          const errorRange = diagnostic.range;
          const errorCode = editor.document.getText(errorRange);
          const errorMessage = diagnostic.message;

          // Get surrounding context (5 lines before and after)
          const contextRange = new vscode.Range(
            Math.max(0, errorRange.start.line - 5),
            0,
            Math.min(
              editor.document.lineCount - 1,
              errorRange.end.line + 5
            ),
            Number.MAX_SAFE_INTEGER
          );
          const context = editor.document.getText(contextRange);

          const response = await this.aiClient.complete({
            prompt: `Fix this error:
Error: ${errorMessage}
Code with error: ${errorCode}

Return ONLY the fixed code, without explanation.`,
            context: `Surrounding context:\n${context}`,
            temperature: 0.2
          });

          // Apply fix
          await this.applyFix(editor, errorRange, response.content);
        } catch (error) {
          if (token.isCancellationRequested) {
            return;
          }
          vscode.window.showErrorMessage(
            `Failed to generate fix: ${error.message}`
          );
        }
      }
    );
  }

  private async applyFix(
    editor: vscode.TextEditor,
    range: vscode.Range,
    fixedCode: string
  ): Promise<void> {
    // Clean up the AI response (remove markdown code blocks if present)
    let cleanedCode = fixedCode.trim();
    if (cleanedCode.startsWith('```')) {
      const lines = cleanedCode.split('\n');
      lines.shift(); // Remove opening ```
      if (lines[lines.length - 1].trim() === '```') {
        lines.pop(); // Remove closing ```
      }
      cleanedCode = lines.join('\n');
    }

    const success = await editor.edit((editBuilder) => {
      editBuilder.replace(range, cleanedCode);
    });

    if (success) {
      vscode.window.showInformationMessage('Fix applied successfully');
    } else {
      vscode.window.showErrorMessage('Failed to apply fix');
    }
  }
}
```

### Generate Tests Command

```typescript
// src/commands/generateTests.ts
import * as vscode from 'vscode';
import * as path from 'path';
import { AIClient } from '../client';

export class GenerateTestsCommand {
  readonly id = 'ollamaCode.generateTests';

  constructor(private aiClient: AIClient) {}

  async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showErrorMessage('No code selected');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating tests...',
        cancellable: true
      },
      async (progress, token) => {
        try {
          const languageId = editor.document.languageId;
          const fileName = path.basename(editor.document.fileName);

          const response = await this.aiClient.complete({
            prompt: `Generate comprehensive unit tests for the following ${languageId} code.
Include edge cases, error cases, and happy path tests.

Code to test:
${selectedText}

Generate tests using a popular testing framework for ${languageId}.`,
            context: `File: ${fileName}`,
            temperature: 0.4,
            maxTokens: 4096
          });

          // Create test file
          await this.createTestFile(
            editor.document.uri,
            response.content,
            languageId
          );
        } catch (error) {
          if (token.isCancellationRequested) {
            return;
          }
          vscode.window.showErrorMessage(
            `Failed to generate tests: ${error.message}`
          );
        }
      }
    );
  }

  private async createTestFile(
    sourceUri: vscode.Uri,
    testCode: string,
    languageId: string
  ): Promise<void> {
    // Determine test file name based on language conventions
    const sourcePath = sourceUri.fsPath;
    const ext = path.extname(sourcePath);
    const baseName = path.basename(sourcePath, ext);
    const dirName = path.dirname(sourcePath);

    let testFileName: string;
    if (languageId === 'typescript' || languageId === 'javascript') {
      testFileName = `${baseName}.test${ext}`;
    } else if (languageId === 'python') {
      testFileName = `test_${baseName}${ext}`;
    } else if (languageId === 'go') {
      testFileName = `${baseName}_test.go`;
    } else {
      testFileName = `${baseName}.test${ext}`;
    }

    const testFilePath = path.join(dirName, testFileName);
    const testFileUri = vscode.Uri.file(testFilePath);

    // Create and open test file
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(testFileUri, { overwrite: false, ignoreIfExists: false });
    edit.insert(testFileUri, new vscode.Position(0, 0), testCode);

    const success = await vscode.workspace.applyEdit(edit);

    if (success) {
      const doc = await vscode.workspace.openTextDocument(testFileUri);
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      vscode.window.showInformationMessage(
        `Test file created: ${testFileName}`
      );
    } else {
      vscode.window.showErrorMessage('Failed to create test file');
    }
  }
}
```

### Refactor Command

```typescript
// src/commands/refactor.ts
import * as vscode from 'vscode';
import { AIClient } from '../client';

export class RefactorCommand {
  readonly id = 'ollamaCode.refactor';

  constructor(private aiClient: AIClient) {}

  async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showErrorMessage('No code selected');
      return;
    }

    // Ask user for refactoring goal
    const goal = await vscode.window.showInputBox({
      prompt: 'What would you like to refactor?',
      placeHolder: 'e.g., Extract function, simplify logic, improve performance'
    });

    if (!goal) {
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Refactoring code...',
        cancellable: true
      },
      async (progress, token) => {
        try {
          const languageId = editor.document.languageId;

          const response = await this.aiClient.complete({
            prompt: `Refactor the following ${languageId} code to: ${goal}

Original code:
${selectedText}

Return ONLY the refactored code, maintaining the same functionality.`,
            temperature: 0.3,
            maxTokens: 4096
          });

          // Show diff and ask for confirmation
          await this.showRefactoringDiff(
            editor,
            selection,
            selectedText,
            response.content
          );
        } catch (error) {
          if (token.isCancellationRequested) {
            return;
          }
          vscode.window.showErrorMessage(
            `Failed to refactor: ${error.message}`
          );
        }
      }
    );
  }

  private async showRefactoringDiff(
    editor: vscode.TextEditor,
    range: vscode.Range,
    originalCode: string,
    refactoredCode: string
  ): Promise<void> {
    // Clean up AI response
    let cleanedCode = refactoredCode.trim();
    if (cleanedCode.startsWith('```')) {
      const lines = cleanedCode.split('\n');
      lines.shift();
      if (lines[lines.length - 1].trim() === '```') {
        lines.pop();
      }
      cleanedCode = lines.join('\n');
    }

    // Create temporary documents for diff
    const originalUri = vscode.Uri.parse(
      `untitled:Original ${path.basename(editor.document.fileName)}`
    );
    const refactoredUri = vscode.Uri.parse(
      `untitled:Refactored ${path.basename(editor.document.fileName)}`
    );

    await vscode.workspace.fs.writeFile(
      originalUri,
      Buffer.from(originalCode)
    );
    await vscode.workspace.fs.writeFile(
      refactoredUri,
      Buffer.from(cleanedCode)
    );

    // Show diff
    await vscode.commands.executeCommand(
      'vscode.diff',
      originalUri,
      refactoredUri,
      'Original ↔ Refactored'
    );

    // Ask for confirmation
    const choice = await vscode.window.showInformationMessage(
      'Apply refactoring?',
      'Apply',
      'Cancel'
    );

    if (choice === 'Apply') {
      const success = await editor.edit((editBuilder) => {
        editBuilder.replace(range, cleanedCode);
      });

      if (success) {
        vscode.window.showInformationMessage('Refactoring applied');
      }
    }

    // Clean up temporary files
    await vscode.workspace.fs.delete(originalUri);
    await vscode.workspace.fs.delete(refactoredUri);
  }
}
```

---

## 14.5: IntelliSense and Inline Completions

### Inline Completion Provider (Copilot-style)

```typescript
// src/providers/inlineCompletions.ts
import * as vscode from 'vscode';
import { AIClient } from '../client';

export class InlineCompletionProvider
  implements vscode.InlineCompletionItemProvider
{
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 300;
  private lastCompletionRequest: string | null = null;

  constructor(private aiClient: AIClient) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
    // Don't provide completions if user is deleting or in specific contexts
    if (
      context.triggerKind ===
        vscode.InlineCompletionTriggerKind.Automatic &&
      !this.shouldProvideCompletion(document, position)
    ) {
      return [];
    }

    // Debounce to avoid excessive API calls
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(async () => {
        try {
          const completion = await this.generateCompletion(
            document,
            position,
            token
          );

          if (completion) {
            resolve([
              new vscode.InlineCompletionItem(
                completion,
                new vscode.Range(position, position)
              )
            ]);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Inline completion error:', error);
          resolve([]);
        }
      }, this.DEBOUNCE_MS);
    });
  }

  private shouldProvideCompletion(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    // Don't complete in strings or comments (simplified check)
    const lineText = document.lineAt(position.line).text;
    const textBeforeCursor = lineText.substring(0, position.character);

    // Skip if in string literal
    const stringMatches = textBeforeCursor.match(/["'`]/g);
    if (stringMatches && stringMatches.length % 2 !== 0) {
      return false;
    }

    // Skip if in comment
    if (textBeforeCursor.trim().startsWith('//')) {
      return false;
    }

    return true;
  }

  private async generateCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<string | null> {
    // Get context before cursor
    const prefixRange = new vscode.Range(
      new vscode.Position(Math.max(0, position.line - 20), 0),
      position
    );
    const prefix = document.getText(prefixRange);

    // Get context after cursor (for fill-in-the-middle models)
    const suffixRange = new vscode.Range(
      position,
      new vscode.Position(
        Math.min(document.lineCount - 1, position.line + 5),
        Number.MAX_SAFE_INTEGER
      )
    );
    const suffix = document.getText(suffixRange);

    // Avoid duplicate requests
    const requestKey = `${prefix}|||${suffix}`;
    if (requestKey === this.lastCompletionRequest) {
      return null;
    }
    this.lastCompletionRequest = requestKey;

    const languageId = document.languageId;

    try {
      // Use streaming for faster perceived performance
      let completion = '';
      let firstChunk = true;

      for await (const chunk of this.aiClient.streamComplete({
        prompt: `Complete the following ${languageId} code:

${prefix}<CURSOR>${suffix}

Continue from <CURSOR>. Return ONLY the code completion, no explanation.`,
        temperature: 0.4,
        maxTokens: 256,
        stopSequences: ['\n\n', '```', '<CURSOR>']
      })) {
        if (token.isCancellationRequested) {
          return null;
        }

        completion += chunk;

        // Return first chunk immediately for faster UX
        if (firstChunk) {
          firstChunk = false;
          return completion;
        }
      }

      return completion.trim();
    } catch (error) {
      console.error('Completion generation error:', error);
      return null;
    }
  }
}
```

---

## 14.6: Code Actions and Quick Fixes

### Code Action Provider

```typescript
// src/providers/codeActions.ts
import * as vscode from 'vscode';
import { AIClient } from '../client';

export class CodeActionProvider implements vscode.CodeActionProvider {
  constructor(private aiClient: AIClient) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // Quick Fix: Fix errors/warnings with AI
    if (context.diagnostics.length > 0) {
      const fixAction = new vscode.CodeAction(
        '✨ Fix with AI',
        vscode.CodeActionKind.QuickFix
      );
      fixAction.command = {
        command: 'ollamaCode.fixError',
        title: 'Fix with AI'
      };
      fixAction.isPreferred = true;
      actions.push(fixAction);
    }

    // Refactor: Only show if there's selected code
    if (!range.isEmpty) {
      // Refactor: Extract function
      const extractFunctionAction = new vscode.CodeAction(
        '✨ Extract Function',
        vscode.CodeActionKind.Refactor
      );
      extractFunctionAction.command = {
        command: 'ollamaCode.refactorExtractFunction',
        title: 'Extract Function',
        arguments: [document, range]
      };
      actions.push(extractFunctionAction);

      // Refactor: Simplify
      const simplifyAction = new vscode.CodeAction(
        '✨ Simplify Code',
        vscode.CodeActionKind.Refactor
      );
      simplifyAction.command = {
        command: 'ollamaCode.refactorSimplify',
        title: 'Simplify Code',
        arguments: [document, range]
      };
      actions.push(simplifyAction);

      // Refactor: Add error handling
      const addErrorHandlingAction = new vscode.CodeAction(
        '✨ Add Error Handling',
        vscode.CodeActionKind.Refactor
      );
      addErrorHandlingAction.command = {
        command: 'ollamaCode.addErrorHandling',
        title: 'Add Error Handling',
        arguments: [document, range]
      };
      actions.push(addErrorHandlingAction);

      // Refactor: Optimize performance
      const optimizeAction = new vscode.CodeAction(
        '✨ Optimize Performance',
        vscode.CodeActionKind.Refactor
      );
      optimizeAction.command = {
        command: 'ollamaCode.optimizePerformance',
        title: 'Optimize Performance',
        arguments: [document, range]
      };
      actions.push(optimizeAction);
    }

    return actions;
  }
}

// Additional refactoring command handlers
export function registerRefactoringCommands(
  context: vscode.ExtensionContext,
  aiClient: AIClient
): void {
  // Extract Function
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ollamaCode.refactorExtractFunction',
      async (document: vscode.TextDocument, range: vscode.Range) => {
        await refactorWithGoal(aiClient, document, range, 'extract a reusable function');
      }
    )
  );

  // Simplify
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ollamaCode.refactorSimplify',
      async (document: vscode.TextDocument, range: vscode.Range) => {
        await refactorWithGoal(aiClient, document, range, 'simplify the logic');
      }
    )
  );

  // Add Error Handling
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ollamaCode.addErrorHandling',
      async (document: vscode.TextDocument, range: vscode.Range) => {
        await refactorWithGoal(
          aiClient,
          document,
          range,
          'add comprehensive error handling'
        );
      }
    )
  );

  // Optimize Performance
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'ollamaCode.optimizePerformance',
      async (document: vscode.TextDocument, range: vscode.Range) => {
        await refactorWithGoal(
          aiClient,
          document,
          range,
          'optimize for better performance'
        );
      }
    )
  );
}

async function refactorWithGoal(
  aiClient: AIClient,
  document: vscode.TextDocument,
  range: vscode.Range,
  goal: string
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const selectedText = document.getText(range);
  const languageId = document.languageId;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Refactoring: ${goal}...`,
      cancellable: true
    },
    async (progress, token) => {
      try {
        const response = await aiClient.complete({
          prompt: `Refactor the following ${languageId} code to ${goal}:

${selectedText}

Return ONLY the refactored code, maintaining functionality.`,
          temperature: 0.3
        });

        // Clean and apply
        let cleanedCode = response.content.trim();
        if (cleanedCode.startsWith('```')) {
          const lines = cleanedCode.split('\n');
          lines.shift();
          if (lines[lines.length - 1].trim() === '```') {
            lines.pop();
          }
          cleanedCode = lines.join('\n');
        }

        const success = await editor.edit((editBuilder) => {
          editBuilder.replace(range, cleanedCode);
        });

        if (success) {
          vscode.window.showInformationMessage('Refactoring applied');
        }
      } catch (error) {
        if (!token.isCancellationRequested) {
          vscode.window.showErrorMessage(`Refactoring failed: ${error.message}`);
        }
      }
    }
  );
}
```

---

## 14.7: Language Server Protocol (LSP) Integration

For more advanced integrations, you can build a Language Server that communicates via LSP.

### Why LSP?

- **IDE agnostic** - Works with VS Code, IntelliJ, Vim, Emacs, etc.
- **Standardized protocol** - One implementation, many editors
- **Advanced features** - Hover, go-to-definition, find references, etc.

### Language Server Architecture

```
┌─────────────────────────────────────────┐
│         IDE/Editor                      │
│  ┌────────────────────────────────┐    │
│  │  Language Client Extension     │    │
│  │  (VS Code, IntelliJ, etc.)     │    │
│  └────────────┬───────────────────┘    │
└───────────────┼────────────────────────┘
                │ JSON-RPC over stdio/socket
                │
┌───────────────▼────────────────────────┐
│      Language Server (Node.js)         │
│  ┌────────────────────────────────┐   │
│  │  LSP Handler                   │   │
│  │  - textDocument/completion     │   │
│  │  - textDocument/hover          │   │
│  │  - textDocument/codeAction     │   │
│  └────────────┬───────────────────┘   │
│               │                        │
│  ┌────────────▼───────────────────┐   │
│  │  AI Client                     │   │
│  │  (connects to Ollama)          │   │
│  └────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### Language Server Implementation

```typescript
// src/server/server.ts
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  Hover,
  CodeAction,
  CodeActionKind,
  CodeActionParams
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { AIClient } from '../client';

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);

// Create document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Initialize AI client
let aiClient: AIClient;

connection.onInitialize((params: InitializeParams) => {
  aiClient = new AIClient({
    apiUrl: params.initializationOptions?.apiUrl || 'http://localhost:11434',
    model: params.initializationOptions?.model || 'codellama:7b',
    maxTokens: 2048
  });

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', '(', '<', '"', "'"]
      },
      hoverProvider: true,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix, CodeActionKind.Refactor]
      }
    }
  };
});

// Completion handler
connection.onCompletion(
  async (params: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }

    const position = params.position;
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Get context before cursor
    const prefix = text.substring(Math.max(0, offset - 1000), offset);

    try {
      const response = await aiClient.complete({
        prompt: `Complete the following code:\n${prefix}`,
        temperature: 0.4,
        maxTokens: 128
      });

      return [
        {
          label: response.content,
          kind: CompletionItemKind.Snippet,
          insertText: response.content,
          documentation: 'AI-generated completion'
        }
      ];
    } catch (error) {
      connection.console.error(`Completion error: ${error.message}`);
      return [];
    }
  }
);

// Hover handler (show AI explanation on hover)
connection.onHover(
  async (params: TextDocumentPositionParams): Promise<Hover | null> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const position = params.position;
    const wordRange = getWordRangeAtPosition(document, position);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);

    try {
      const response = await aiClient.complete({
        prompt: `Explain what "${word}" does in this code context.`,
        temperature: 0.3,
        maxTokens: 256
      });

      return {
        contents: {
          kind: 'markdown',
          value: response.content
        },
        range: wordRange
      };
    } catch (error) {
      return null;
    }
  }
);

// Code Action handler
connection.onCodeAction(
  async (params: CodeActionParams): Promise<CodeAction[]> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }

    const actions: CodeAction[] = [];

    // If there are diagnostics, offer AI fix
    if (params.context.diagnostics.length > 0) {
      actions.push({
        title: '✨ Fix with AI',
        kind: CodeActionKind.QuickFix,
        command: {
          command: 'ollamaCode.fixError',
          title: 'Fix with AI'
        }
      });
    }

    return actions;
  }
);

// Helper function to get word range at position
function getWordRangeAtPosition(
  document: TextDocument,
  position: { line: number; character: number }
): { start: { line: number; character: number }; end: { line: number; character: number } } | null {
  const lineText = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line + 1, character: 0 }
  });

  const wordPattern = /\b\w+\b/g;
  let match: RegExpExecArray | null;

  while ((match = wordPattern.exec(lineText)) !== null) {
    const startChar = match.index;
    const endChar = startChar + match[0].length;

    if (startChar <= position.character && position.character <= endChar) {
      return {
        start: { line: position.line, character: startChar },
        end: { line: position.line, character: endChar }
      };
    }
  }

  return null;
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Start listening
connection.listen();
```

### Language Client (VS Code Extension)

```typescript
// src/client/extension.ts
import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Path to language server module
  const serverModule = context.asAbsolutePath(
    path.join('dist', 'server', 'server.js')
  );

  // Server options
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] }
    }
  };

  // Client options
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'python' },
      { scheme: 'file', language: 'go' },
      { scheme: 'file', language: 'rust' }
    ],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    },
    initializationOptions: {
      apiUrl: workspace.getConfiguration('ollamaCode').get('apiUrl'),
      model: workspace.getConfiguration('ollamaCode').get('model')
    }
  };

  // Create and start client
  client = new LanguageClient(
    'ollamaCodeLanguageServer',
    'Ollama Code Language Server',
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
```

---

## 14.8: Testing Your Extension

### Extension Tests

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { AIClient } from '../../client';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start extension tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('your-publisher.ollama-code-vscode'));
  });

  test('Extension should activate', async () => {
    const ext = vscode.extensions.getExtension('your-publisher.ollama-code-vscode');
    await ext?.activate();
    assert.strictEqual(ext?.isActive, true);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('ollamaCode.explainCode'));
    assert.ok(commands.includes('ollamaCode.fixError'));
    assert.ok(commands.includes('ollamaCode.generateTests'));
    assert.ok(commands.includes('ollamaCode.refactor'));
  });
});

suite('AIClient Test Suite', () => {
  let aiClient: AIClient;
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
    aiClient = new AIClient({
      apiUrl: 'http://localhost:11434',
      model: 'codellama:7b',
      maxTokens: 2048
    });
  });

  teardown(() => {
    sandbox.restore();
  });

  test('Should complete code', async () => {
    // Mock HTTP response
    sandbox.stub(aiClient as any, 'httpClient').value({
      post: async () => ({
        data: {
          response: 'console.log("Hello, World!");',
          prompt_eval_count: 10,
          eval_count: 15
        }
      })
    });

    const response = await aiClient.complete({
      prompt: 'Write a hello world program in JavaScript'
    });

    assert.ok(response.content);
    assert.ok(response.usage.inputTokens > 0);
    assert.ok(response.usage.outputTokens > 0);
  });

  test('Should handle errors gracefully', async () => {
    sandbox.stub(aiClient as any, 'httpClient').value({
      post: async () => {
        throw new Error('Network error');
      }
    });

    await assert.rejects(
      async () => {
        await aiClient.complete({ prompt: 'test' });
      },
      /AI completion failed/
    );
  });
});
```

### Integration Tests

```typescript
// src/test/suite/integration.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Integration Test Suite', () => {
  test('Explain Code command should work', async () => {
    // Create test document
    const content = `
function add(a: number, b: number): number {
  return a + b;
}
`;

    const doc = await vscode.workspace.openTextDocument({
      language: 'typescript',
      content
    });

    const editor = await vscode.window.showTextDocument(doc);

    // Select the function
    editor.selection = new vscode.Selection(
      new vscode.Position(1, 0),
      new vscode.Position(3, 1)
    );

    // Execute command
    await vscode.commands.executeCommand('ollamaCode.explainCode');

    // Verify webview panel was created
    // (In real tests, you'd mock the webview and verify content)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  test('Fix Error command should work', async () => {
    const content = `
const x: number = "not a number"; // Type error
`;

    const doc = await vscode.workspace.openTextDocument({
      language: 'typescript',
      content
    });

    const editor = await vscode.window.showTextDocument(doc);

    // Position cursor on error
    editor.selection = new vscode.Selection(
      new vscode.Position(1, 6),
      new vscode.Position(1, 6)
    );

    // Execute command
    await vscode.commands.executeCommand('ollamaCode.fixError');

    // Verify fix was applied
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const fixedContent = editor.document.getText();

    // Should have fixed the type error
    assert.ok(!fixedContent.includes('"not a number"'));
  });
});
```

---

## 14.9: Publishing Your Extension

### Prepare for Publishing

1. **Update package.json**

```json
{
  "name": "ollama-code-vscode",
  "displayName": "Ollama Code AI Assistant",
  "description": "AI coding assistant powered by Ollama Code",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "icon": "images/icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/ollama-code-vscode"
  },
  "homepage": "https://github.com/your-username/ollama-code-vscode#readme",
  "bugs": {
    "url": "https://github.com/your-username/ollama-code-vscode/issues"
  },
  "license": "MIT",
  "keywords": [
    "ai",
    "code-assistant",
    "ollama",
    "copilot",
    "autocomplete"
  ]
}
```

2. **Add README.md**

```markdown
# Ollama Code AI Assistant

AI-powered coding assistant that runs locally with Ollama.

## Features

- **Explain Code**: Get AI-powered explanations of selected code
- **Fix Errors**: Automatically fix errors with AI suggestions
- **Generate Tests**: Create comprehensive unit tests
- **Refactor Code**: Improve code quality with AI refactoring
- **Inline Completions**: GitHub Copilot-style autocomplete

## Requirements

- [Ollama](https://ollama.ai/) installed and running
- CodeLlama model: `ollama pull codellama:7b`

## Extension Settings

- `ollamaCode.model`: AI model to use (default: `codellama:7b`)
- `ollamaCode.apiUrl`: Ollama API URL (default: `http://localhost:11434`)
- `ollamaCode.maxTokens`: Maximum tokens for completions (default: 2048)
- `ollamaCode.enableInlineCompletions`: Enable inline completions (default: true)

## Usage

### Explain Code
1. Select code
2. Right-click → "Explain Code" (or Cmd+Shift+E)
3. View explanation in side panel

### Fix Errors
1. Position cursor on error
2. Press Cmd+. → "Fix with AI"
3. Apply suggested fix

### Generate Tests
1. Select function/class
2. Command Palette → "Ollama Code: Generate Tests"
3. Test file created automatically

## Privacy

All AI processing happens locally on your machine. No code is sent to external servers.

## License

MIT
```

3. **Add CHANGELOG.md**

```markdown
# Change Log

## [1.0.0] - 2024-01-15

### Added
- Initial release
- Explain Code command
- Fix Error command with Quick Fixes
- Generate Tests command
- Refactor command
- Inline completions provider
- Code actions provider
```

4. **Build and Package**

```bash
# Install vsce (Visual Studio Code Extension tool)
yarn global add @vscode/vsce

# Build extension
yarn run compile

# Package extension
vsce package

# This creates: ollama-code-vscode-1.0.0.vsix
```

5. **Publish to Marketplace**

```bash
# Create publisher account at:
# https://marketplace.visualstudio.com/manage

# Get Personal Access Token from Azure DevOps

# Login
vsce login your-publisher-id

# Publish
vsce publish
```

### Local Installation (for testing)

```bash
# Install .vsix file
code --install-extension ollama-code-vscode-1.0.0.vsix
```

---

## 14.10: IDE-Agnostic Patterns

### Supporting Multiple IDEs

Your Language Server (LSP) implementation can work with multiple editors:

#### IntelliJ IDEA / JetBrains IDEs

```kotlin
// IntelliJ plugin (Kotlin/Java)
import com.intellij.openapi.project.Project
import org.eclipse.lsp4j.launch.LSPLauncher
import java.io.InputStream
import java.io.OutputStream

class OllamaCodeLanguageServer(private val project: Project) {
    fun start() {
        val serverProcess = ProcessBuilder()
            .command("node", "/path/to/language-server.js")
            .start()

        val launcher = LSPLauncher.createClientLauncher(
            this,
            serverProcess.inputStream,
            serverProcess.outputStream
        )

        launcher.startListening()
    }
}
```

#### Vim/Neovim

```lua
-- Neovim config (Lua)
local lspconfig = require('lspconfig')
local configs = require('lspconfig.configs')

-- Define custom LSP
configs.ollama_code = {
  default_config = {
    cmd = {'node', '/path/to/language-server.js', '--stdio'},
    filetypes = {'typescript', 'javascript', 'python', 'go'},
    root_dir = lspconfig.util.root_pattern('.git'),
    settings = {
      ollamaCode = {
        model = 'codellama:7b',
        apiUrl = 'http://localhost:11434'
      }
    }
  }
}

-- Activate
lspconfig.ollama_code.setup{}
```

#### Emacs

```elisp
;; Emacs config (elisp)
(use-package lsp-mode
  :config
  (lsp-register-client
   (make-lsp-client
    :new-connection (lsp-stdio-connection
                     '("node" "/path/to/language-server.js" "--stdio"))
    :major-modes '(typescript-mode javascript-mode python-mode go-mode)
    :server-id 'ollama-code
    :initialization-options
    '((model . "codellama:7b")
      (apiUrl . "http://localhost:11434")))))

(add-hook 'typescript-mode-hook #'lsp)
(add-hook 'javascript-mode-hook #'lsp)
```

### Universal CLI Integration

For editors without LSP support, provide a CLI:

```bash
# Explain code via CLI (works in any editor)
cat file.ts | ollama-code explain

# Fix errors
cat file.ts | ollama-code fix > file.fixed.ts

# Generate tests
ollama-code generate-tests file.ts > file.test.ts
```

Then editors can call these commands:

```vim
" Vim command to explain selection
vnoremap <leader>e :!ollama-code explain<CR>

" Fix current file
nnoremap <leader>f :%!ollama-code fix<CR>
```

---

## 14.11: Performance Optimization for IDE

### Caching Completions

```typescript
// src/cache/completionCache.ts
export class CompletionCache {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: string): void {
    // Evict oldest if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

interface CacheEntry {
  value: string;
  timestamp: number;
}
```

### Request Deduplication

```typescript
// src/utils/requestDedup.ts
export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If request is already pending, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Start new request
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}
```

### Lazy Loading

```typescript
// Lazy load AI client only when needed
let aiClientInstance: AIClient | null = null;

function getAIClient(): AIClient {
  if (!aiClientInstance) {
    const config = vscode.workspace.getConfiguration('ollamaCode');
    aiClientInstance = new AIClient({
      apiUrl: config.get('apiUrl') || 'http://localhost:11434',
      model: config.get('model') || 'codellama:7b',
      maxTokens: 2048
    });
  }
  return aiClientInstance;
}
```

---

## 14.12: Best Practices

### 1. Respect User Settings

```typescript
// Always check if feature is enabled
const config = vscode.workspace.getConfiguration('ollamaCode');
if (config.get('enableInlineCompletions')) {
  // Provide inline completions
}
```

### 2. Handle Errors Gracefully

```typescript
try {
  const completion = await aiClient.complete(request);
  return completion.content;
} catch (error) {
  // Don't show error to user for every failed completion
  // Log silently and return empty
  console.error('Completion failed:', error);
  return null;
}
```

### 3. Provide Feedback

```typescript
// Show progress for long operations
await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: 'Generating tests...',
    cancellable: true
  },
  async (progress, token) => {
    // Long operation
  }
);
```

### 4. Optimize for Performance

```typescript
// Debounce inline completions
private debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### 5. Test Thoroughly

```bash
# Run extension tests
yarn test

# Test in development mode
yarn watch  # Terminal 1
F5          # VS Code: Start debugging
```

---

## Summary

In this chapter, you learned how to integrate your AI coding assistant into IDEs:

✅ **VS Code Extension Architecture** - Structure, manifest, commands, providers
✅ **AI Client Integration** - Connecting to Ollama Code backend
✅ **Command Implementations** - Explain, fix, generate tests, refactor
✅ **Inline Completions** - Copilot-style autocomplete
✅ **Code Actions & Quick Fixes** - Context-aware AI suggestions
✅ **Language Server Protocol** - IDE-agnostic LSP implementation
✅ **Testing & Publishing** - Extension tests, marketplace publishing
✅ **Multi-IDE Support** - IntelliJ, Vim, Emacs integration patterns
✅ **Performance Optimization** - Caching, deduplication, lazy loading

**Impact:**
- ⬇️ 80% reduction in context switching
- ⬆️ 10x faster fixes (10-30 seconds vs 2-5 minutes)
- ⬆️ Native IDE experience
- ⬆️ Developer satisfaction and productivity

---

## Exercises

### Exercise 1: Add Hover Provider

**Goal:** Show AI-powered documentation on hover.

**Requirements:**
1. Implement `HoverProvider` interface
2. On hover over a function/variable, get AI explanation
3. Display in hover tooltip
4. Cache results to avoid redundant API calls

**Hints:**
```typescript
class AIHoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    // Get symbol at position
    // Ask AI for explanation
    // Return hover with markdown content
  }
}
```

**Bonus:** Support hovering over:
- Function names → Show function signature + description
- Variables → Show type + usage
- Import statements → Show package documentation

---

### Exercise 2: Add Signature Help

**Goal:** Show AI-powered parameter hints while typing function calls.

**Requirements:**
1. Implement `SignatureHelpProvider`
2. Trigger on `(` and `,`
3. Use AI to generate parameter descriptions
4. Show inline as user types

**Example:**
```typescript
// User types: calculateDiscount(
// Show: calculateDiscount(price: number, discountPercent: number): number
//       Calculates discounted price. price: The original price...
```

**Hints:**
```typescript
class AISignatureHelpProvider implements vscode.SignatureHelpProvider {
  async provideSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.SignatureHelpContext
  ): Promise<vscode.SignatureHelp | null> {
    // Find function being called
    // Get AI to explain parameters
    // Return SignatureHelp
  }
}
```

---

### Exercise 3: Build IntelliJ Plugin

**Goal:** Port your VS Code extension to IntelliJ IDEA.

**Requirements:**
1. Create IntelliJ plugin project (Kotlin/Java)
2. Integrate with your Language Server via LSP4J
3. Add menu actions for Explain, Fix, Generate Tests
4. Add inline completions
5. Publish to JetBrains Marketplace

**Resources:**
- IntelliJ Platform SDK: https://plugins.jetbrains.com/docs/intellij/welcome.html
- LSP4J library: https://github.com/eclipse/lsp4j

**Bonus:** Support multiple JetBrains IDEs (PyCharm, WebStorm, GoLand, etc.)

---

## Next Steps

In **[Chapter 15: Building Your Own AI Coding Assistant →](chapter-15-building-your-own.md)**, you'll put everything together to build specialized AI coding assistants for specific domains:

- DevOps Assistant (Docker, Kubernetes, Terraform)
- Data Science Assistant (Pandas, NumPy, ML)
- Web Development Assistant (React, Next.js, Tailwind)
- Security Assistant (Code scanning, vulnerability detection)

You'll learn:
- How to plan and scope specialized assistants
- Plugin composition strategies
- Deployment and monetization
- Building a community around your assistant

**You've built the platform. Now build the ecosystem!**

---

*Chapter 14 | IDE Integration and Developer Experience | 65-75 pages*
