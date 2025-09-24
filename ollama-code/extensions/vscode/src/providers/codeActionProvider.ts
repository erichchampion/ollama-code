/**
 * Code Action Provider
 */

import * as vscode from 'vscode';
import { OllamaCodeClient } from '../client/ollamaCodeClient';
import { Logger } from '../utils/logger';

export class CodeActionProvider implements vscode.CodeActionProvider {
  constructor(
    private client: OllamaCodeClient,
    private logger: Logger
  ) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    try {
      if (!this.client.getConnectionStatus().connected) {
        return actions;
      }

      const code = document.getText(range);
      if (!code.trim()) {
        return actions;
      }

      // Add AI-powered code actions
      const refactorAction = new vscode.CodeAction(
        'Refactor with AI',
        vscode.CodeActionKind.Refactor
      );
      refactorAction.command = {
        command: 'ollama-code.refactor',
        title: 'Refactor with AI'
      };
      actions.push(refactorAction);

      const fixAction = new vscode.CodeAction(
        'Fix issues with AI',
        vscode.CodeActionKind.QuickFix
      );
      fixAction.command = {
        command: 'ollama-code.fix',
        title: 'Fix issues with AI'
      };
      actions.push(fixAction);

      const explainAction = new vscode.CodeAction(
        'Explain code',
        vscode.CodeActionKind.Empty
      );
      explainAction.command = {
        command: 'ollama-code.explain',
        title: 'Explain code'
      };
      actions.push(explainAction);

    } catch (error) {
      this.logger.error('Code actions failed:', error);
    }

    return actions;
  }
}