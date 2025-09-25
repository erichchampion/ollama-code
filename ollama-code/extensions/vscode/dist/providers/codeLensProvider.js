"use strict";
/**
 * Code Lens Provider for AI Insights and Metrics
 *
 * Provides contextual information and actions directly inline with code,
 * including complexity metrics, performance insights, and AI-powered suggestions.
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
exports.CodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
const codeAnalysisUtils_1 = require("../utils/codeAnalysisUtils");
const analysisConstants_1 = require("../config/analysisConstants");
class CodeLensProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    }
    async provideCodeLenses(document, token) {
        try {
            if (!this.client.getConnectionStatus().connected) {
                return [];
            }
            const codeLenses = [];
            // Only analyze supported file types
            if (!codeAnalysisUtils_1.CodeAnalysisUtils.isSupportedLanguage(document.languageId)) {
                return [];
            }
            // Find functions and classes for analysis
            const functions = await codeAnalysisUtils_1.CodeAnalysisUtils.extractFunctions(document, token);
            for (const func of functions) {
                if (token.isCancellationRequested) {
                    break;
                }
                // Add complexity lens
                if (func.complexity > analysisConstants_1.CODE_METRICS_THRESHOLDS.HIGH_COMPLEXITY) {
                    codeLenses.push(new vscode.CodeLens(func.range, {
                        title: `⚠️ Complexity: ${func.complexity} (Consider refactoring)`,
                        command: 'ollama-code.refactor',
                        arguments: [document.uri, func.range]
                    }));
                }
                else if (func.complexity > analysisConstants_1.CODE_METRICS_THRESHOLDS.MEDIUM_COMPLEXITY) {
                    codeLenses.push(new vscode.CodeLens(func.range, {
                        title: `📊 Complexity: ${func.complexity}`,
                        command: 'ollama-code.analyze',
                        arguments: [document.uri, func.range]
                    }));
                }
                // Add line count lens for large functions
                if (func.lineCount > analysisConstants_1.CODE_METRICS_THRESHOLDS.LONG_FUNCTION_LINES) {
                    codeLenses.push(new vscode.CodeLens(func.range, {
                        title: `📏 Lines: ${func.lineCount} (Consider breaking down)`,
                        command: 'ollama-code.refactor',
                        arguments: [document.uri, func.range]
                    }));
                }
                // Add parameter count lens
                if (func.parameterCount > analysisConstants_1.CODE_METRICS_THRESHOLDS.TOO_MANY_PARAMS) {
                    codeLenses.push(new vscode.CodeLens(func.range, {
                        title: `📝 Parameters: ${func.parameterCount} (Too many parameters)`,
                        command: 'ollama-code.refactor',
                        arguments: [document.uri, func.range]
                    }));
                }
                // Add AI insights lens
                codeLenses.push(new vscode.CodeLens(func.range, {
                    title: `🤖 Get AI insights for ${func.name}`,
                    command: 'ollama-code.analyzeFunction',
                    arguments: [document.uri, func.range, func.name]
                }));
            }
            // Add file-level metrics
            if (functions.length > 0) {
                const fileComplexity = functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length;
                const firstLine = new vscode.Range(0, 0, 0, 0);
                if (fileComplexity > analysisConstants_1.CODE_METRICS_THRESHOLDS.FILE_COMPLEXITY_WARNING) {
                    codeLenses.unshift(new vscode.CodeLens(firstLine, {
                        title: `📊 File Complexity: ${fileComplexity.toFixed(1)} (Consider refactoring)`,
                        command: 'ollama-code.analyzeFile',
                        arguments: [document.uri]
                    }));
                }
                // Add test coverage lens (if available)
                codeLenses.unshift(new vscode.CodeLens(firstLine, {
                    title: `🧪 Generate tests for this file`,
                    command: 'ollama-code.generateTests',
                    arguments: [document.uri]
                }));
                // Add security analysis lens
                codeLenses.unshift(new vscode.CodeLens(firstLine, {
                    title: `🔒 Run security analysis`,
                    command: 'ollama-code.securityAnalysis',
                    arguments: [document.uri]
                }));
            }
            return codeLenses;
        }
        catch (error) {
            this.logger.error('Error providing code lenses:', error);
            return [];
        }
    }
    resolveCodeLens(codeLens, token) {
        // Code lenses are already resolved in provideCodeLenses
        return codeLens;
    }
    /**
     * Refresh code lenses
     */
    refresh() {
        this._onDidChangeCodeLenses.fire();
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this._onDidChangeCodeLenses.dispose();
    }
}
exports.CodeLensProvider = CodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map