"use strict";
/**
 * Code Action Provider
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
exports.CodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CodeActionProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async provideCodeActions(document, range, context, token) {
        const actions = [];
        try {
            if (!this.client.getConnectionStatus().connected) {
                return actions;
            }
            const code = document.getText(range);
            if (!code.trim()) {
                return actions;
            }
            // Add AI-powered code actions
            const refactorAction = new vscode.CodeAction('Refactor with AI', vscode.CodeActionKind.Refactor);
            refactorAction.command = {
                command: 'ollama-code.refactor',
                title: 'Refactor with AI'
            };
            actions.push(refactorAction);
            const fixAction = new vscode.CodeAction('Fix issues with AI', vscode.CodeActionKind.QuickFix);
            fixAction.command = {
                command: 'ollama-code.fix',
                title: 'Fix issues with AI'
            };
            actions.push(fixAction);
            const explainAction = new vscode.CodeAction('Explain code', vscode.CodeActionKind.Empty);
            explainAction.command = {
                command: 'ollama-code.explain',
                title: 'Explain code'
            };
            actions.push(explainAction);
        }
        catch (error) {
            this.logger.error('Code actions failed:', error);
        }
        return actions;
    }
}
exports.CodeActionProvider = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map