/**
 * Inline Completion Provider
 */

import * as vscode from 'vscode';
import { OllamaCodeClient } from '../client/ollamaCodeClient';
import { Logger } from '../utils/logger';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  constructor(
    private client: OllamaCodeClient,
    private logger: Logger
  ) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
    try {
      if (!this.client.getConnectionStatus().connected) {
        return [];
      }

      // Get context around cursor
      const line = document.lineAt(position);
      const prefix = line.text.substring(0, position.character);

      if (prefix.trim().length < 2) {
        return []; // Don't suggest for very short input
      }

      const result = await this.client.sendAIRequest({
        prompt: prefix,
        type: 'completion',
        language: document.languageId
      });

      if (result?.result) {
        return [
          new vscode.InlineCompletionItem(
            result.result,
            new vscode.Range(position, position)
          )
        ];
      }

      return [];

    } catch (error) {
      this.logger.error('Inline completion failed:', error);
      return [];
    }
  }
}