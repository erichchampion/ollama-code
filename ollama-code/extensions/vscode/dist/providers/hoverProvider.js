"use strict";
/**
 * Hover Provider - provides AI-generated documentation on hover
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
exports.HoverProvider = void 0;
const vscode = __importStar(require("vscode"));
class HoverProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async provideHover(document, position, token) {
        try {
            if (!this.client.getConnectionStatus().connected) {
                return null;
            }
            // Get word at position
            const range = document.getWordRangeAtPosition(position);
            if (!range)
                return null;
            const word = document.getText(range);
            if (word.length < 2)
                return null;
            // Get surrounding context
            const line = document.lineAt(position);
            const contextRange = new vscode.Range(Math.max(0, position.line - 2), 0, Math.min(document.lineCount - 1, position.line + 2), 0);
            const context = document.getText(contextRange);
            const result = await this.client.sendAIRequest({
                prompt: `Explain "${word}" in this context: ${context}`,
                type: 'explanation',
                language: document.languageId
            });
            if (result?.result) {
                return new vscode.Hover(new vscode.MarkdownString(result.result), range);
            }
        }
        catch (error) {
            this.logger.error('Hover provider failed:', error);
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hoverProvider.js.map