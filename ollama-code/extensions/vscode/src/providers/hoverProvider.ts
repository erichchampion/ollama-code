/**
 * Hover Provider - provides AI-generated documentation on hover
 */

import * as vscode from 'vscode';
import { OllamaCodeClient } from '../client/ollamaCodeClient';
import { Logger } from '../utils/logger';

export class HoverProvider implements vscode.HoverProvider {
  constructor(
    private client: OllamaCodeClient,
    private logger: Logger
  ) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    try {
      if (!this.client.getConnectionStatus().connected) {
        return null;
      }

      // Get word at position
      const range = document.getWordRangeAtPosition(position);
      if (!range) return null;

      const word = document.getText(range);
      if (word.length < 2) return null;

      // Get surrounding context
      const line = document.lineAt(position);
      const contextRange = new vscode.Range(
        Math.max(0, position.line - 2),
        0,
        Math.min(document.lineCount - 1, position.line + 2),
        0
      );
      const context = document.getText(contextRange);

      const result = await this.client.sendAIRequest({
        prompt: `Explain "${word}" in this context: ${context}`,
        type: 'explanation',
        language: document.languageId
      });

      if (result?.result) {
        return new vscode.Hover(
          new vscode.MarkdownString(result.result),
          range
        );
      }

    } catch (error) {
      this.logger.error('Hover provider failed:', error);
    }

    return null;
  }
}