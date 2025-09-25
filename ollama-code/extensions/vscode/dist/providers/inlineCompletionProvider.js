"use strict";
/**
 * Inline Completion Provider
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
exports.InlineCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
class InlineCompletionProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async provideInlineCompletionItems(document, position, context, token) {
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
                    new vscode.InlineCompletionItem(result.result, new vscode.Range(position, position))
                ];
            }
            return [];
        }
        catch (error) {
            this.logger.error('Inline completion failed:', error);
            return [];
        }
    }
}
exports.InlineCompletionProvider = InlineCompletionProvider;
//# sourceMappingURL=inlineCompletionProvider.js.map