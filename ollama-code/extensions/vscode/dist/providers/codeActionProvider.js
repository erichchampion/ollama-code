"use strict";
/**
 * AI-Powered Code Action Provider
 *
 * Provides intelligent quick fixes and refactoring suggestions using AI with
 * context-aware analysis, diagnostic-driven fixes, and code improvement recommendations.
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
const codeAnalysisUtils_1 = require("../utils/codeAnalysisUtils");
const analysisConstants_1 = require("../config/analysisConstants");
class CodeActionProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
        this.actionCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
        // Define supported code action patterns
        this.quickFixPatterns = [
            {
                pattern: /eval\s*\(/gi,
                title: '🔒 Replace eval() with safer alternative',
                kind: vscode.CodeActionKind.QuickFix,
                diagnostic: 'security'
            },
            {
                pattern: /innerHTML\s*=/gi,
                title: '🔒 Replace innerHTML with textContent',
                kind: vscode.CodeActionKind.QuickFix,
                diagnostic: 'security'
            },
            {
                pattern: /var\s+/gi,
                title: '🎨 Convert var to let/const',
                kind: vscode.CodeActionKind.QuickFix,
                diagnostic: 'style'
            },
            {
                pattern: /==\s*(?!null)/gi,
                title: '🎯 Use strict equality (===)',
                kind: vscode.CodeActionKind.QuickFix,
                diagnostic: 'style'
            }
        ];
    }
    async provideCodeActions(document, range, context, token) {
        try {
            if (!this.client.getConnectionStatus().connected) {
                return [];
            }
            if (!codeAnalysisUtils_1.CodeAnalysisUtils.isSupportedLanguage(document.languageId)) {
                return [];
            }
            const selectedCode = document.getText(range);
            if (!selectedCode.trim() && context.diagnostics.length === 0) {
                return [];
            }
            // Check cache first
            const cacheKey = this.createCacheKey(document, range, context);
            const cached = this.actionCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.actions;
            }
            const actions = [];
            const actionContext = this.analyzeContext(document, range, context);
            // Add diagnostic-driven quick fixes
            const quickFixes = await this.createQuickFixes(document, range, actionContext, token);
            actions.push(...quickFixes);
            // Add AI-powered refactoring suggestions
            const refactorActions = await this.createRefactorActions(document, range, actionContext, token);
            actions.push(...refactorActions);
            // Add code improvement suggestions
            const improvementActions = await this.createImprovementActions(document, range, actionContext, token);
            actions.push(...improvementActions);
            // Add general AI actions for any selection
            if (selectedCode.trim()) {
                const generalActions = this.createGeneralActions(document, range, actionContext);
                actions.push(...generalActions);
            }
            // Cache the results
            this.actionCache.set(cacheKey, {
                actions,
                timestamp: Date.now()
            });
            return actions;
        }
        catch (error) {
            this.logger.error('Code actions failed:', error);
            return [];
        }
    }
    /**
     * Analyze the context around the code action request
     */
    analyzeContext(document, range, context) {
        const selectedCode = document.getText(range);
        // Get surrounding context (10 lines before and after)
        const startLine = Math.max(0, range.start.line - 10);
        const endLine = Math.min(document.lineCount - 1, range.end.line + 10);
        const surroundingCode = document.getText(new vscode.Range(startLine, 0, endLine, 0));
        // Try to determine function and class context
        let functionContext;
        let className;
        for (let i = range.start.line; i >= Math.max(0, range.start.line - 20); i--) {
            const line = document.lineAt(i).text;
            // Check for function declaration
            const funcMatch = line.match(/(?:function|def|func|fn)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (funcMatch && !functionContext) {
                functionContext = funcMatch[1];
            }
            // Check for class declaration
            const classMatch = line.match(/(?:class|struct)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (classMatch && !className) {
                className = classMatch[1];
            }
        }
        return {
            diagnostics: [...context.diagnostics],
            selectedCode,
            surroundingCode,
            functionContext,
            className,
            languageId: document.languageId
        };
    }
    /**
     * Create quick fixes based on diagnostics and patterns
     */
    async createQuickFixes(document, range, context, token) {
        const actions = [];
        // Handle diagnostic-specific fixes
        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source === 'ollama-code-static') {
                const quickFix = await this.createDiagnosticQuickFix(document, range, diagnostic, context, token);
                if (quickFix) {
                    actions.push(quickFix);
                }
            }
        }
        // Handle pattern-based fixes
        for (const pattern of this.quickFixPatterns) {
            if (pattern.pattern.test(context.selectedCode)) {
                const quickFix = await this.createPatternQuickFix(document, range, pattern, context, token);
                if (quickFix) {
                    actions.push(quickFix);
                }
            }
        }
        return actions;
    }
    /**
     * Create quick fix for a specific diagnostic
     */
    async createDiagnosticQuickFix(document, range, diagnostic, context, token) {
        try {
            const action = new vscode.CodeAction(`🔧 Fix: ${diagnostic.message}`, vscode.CodeActionKind.QuickFix);
            action.diagnostics = [diagnostic];
            action.isPreferred = true;
            // Create AI-powered fix
            const prompt = this.createDiagnosticFixPrompt(diagnostic, context);
            const result = await Promise.race([
                this.client.sendAIRequest({
                    prompt,
                    type: 'fix',
                    language: document.languageId
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Quick fix timeout')), 3000))
            ]);
            if (token.isCancellationRequested || !result?.result) {
                return null;
            }
            const fixedCode = this.processAIResponse(result.result, context.selectedCode);
            if (fixedCode && fixedCode !== context.selectedCode) {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, diagnostic.range, fixedCode);
                action.edit = edit;
                return action;
            }
        }
        catch (error) {
            this.logger.debug('Failed to create diagnostic quick fix:', error instanceof Error ? error.message : String(error));
        }
        return null;
    }
    /**
     * Create quick fix based on code patterns
     */
    async createPatternQuickFix(document, range, pattern, context, token) {
        try {
            const action = new vscode.CodeAction(pattern.title, pattern.kind);
            action.isPreferred = true;
            // Create simple pattern-based replacements
            let fixedCode = context.selectedCode;
            switch (pattern.diagnostic) {
                case 'security':
                    if (pattern.pattern.source.includes('eval')) {
                        fixedCode = context.selectedCode.replace(/eval\s*\([^)]+\)/g, 'JSON.parse($1)');
                    }
                    else if (pattern.pattern.source.includes('innerHTML')) {
                        fixedCode = context.selectedCode.replace(/innerHTML\s*=/g, 'textContent =');
                    }
                    break;
                case 'style':
                    if (pattern.pattern.source.includes('var')) {
                        fixedCode = context.selectedCode.replace(/\bvar\b/g, 'const');
                    }
                    else if (pattern.pattern.source.includes('==')) {
                        fixedCode = context.selectedCode.replace(/(?<!!)==(?!=)/g, '===');
                    }
                    break;
            }
            if (fixedCode !== context.selectedCode) {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, range, fixedCode);
                action.edit = edit;
                return action;
            }
        }
        catch (error) {
            this.logger.debug('Failed to create pattern quick fix:', error instanceof Error ? error.message : String(error));
        }
        return null;
    }
    /**
     * Create AI-powered refactoring actions
     */
    async createRefactorActions(document, range, context, token) {
        const actions = [];
        if (!context.selectedCode.trim()) {
            return actions;
        }
        // Check if the selected code is a function that needs refactoring
        const functionPattern = /(?:function|def|func|fn)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
        if (functionPattern.test(context.selectedCode)) {
            const complexity = codeAnalysisUtils_1.CodeAnalysisUtils.calculateComplexity(context.selectedCode);
            if (complexity > analysisConstants_1.CODE_METRICS_THRESHOLDS.HIGH_COMPLEXITY) {
                actions.push(this.createRefactorAction('🔧 Refactor complex function', 'This function has high complexity. Let AI break it down into smaller functions.', document, range, context, 'refactor-complexity'));
            }
            if (context.selectedCode.split('\n').length > analysisConstants_1.CODE_METRICS_THRESHOLDS.LONG_FUNCTION_LINES) {
                actions.push(this.createRefactorAction('✂️ Split long function', 'This function is too long. Let AI split it into logical parts.', document, range, context, 'refactor-length'));
            }
        }
        // General refactoring actions
        actions.push(this.createRefactorAction('🚀 Optimize code performance', 'Let AI suggest performance optimizations for this code.', document, range, context, 'refactor-performance'));
        actions.push(this.createRefactorAction('📚 Improve code readability', 'Let AI improve the readability and maintainability of this code.', document, range, context, 'refactor-readability'));
        return actions;
    }
    /**
     * Create improvement actions
     */
    async createImprovementActions(document, range, context, token) {
        const actions = [];
        if (!context.selectedCode.trim()) {
            return actions;
        }
        // Add documentation
        if (context.functionContext) {
            actions.push(this.createImprovementAction('📝 Add documentation', 'Generate comprehensive documentation for this function.', document, range, context, 'add-docs'));
        }
        // Add error handling
        if (!context.selectedCode.includes('try') && !context.selectedCode.includes('catch')) {
            actions.push(this.createImprovementAction('🛡️ Add error handling', 'Add appropriate error handling to this code.', document, range, context, 'add-error-handling'));
        }
        // Add type annotations (for TypeScript/JavaScript)
        if (context.languageId === 'typescript' || context.languageId === 'javascript') {
            const functionPattern = /(?:function|def|func|fn)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/;
            if (!context.selectedCode.includes(': ') && functionPattern.test(context.selectedCode)) {
                actions.push(this.createImprovementAction('🏷️ Add type annotations', 'Add TypeScript type annotations to improve code safety.', document, range, context, 'add-types'));
            }
        }
        return actions;
    }
    /**
     * Create general AI actions
     */
    createGeneralActions(document, range, context) {
        const actions = [];
        // Explain code
        const explainAction = new vscode.CodeAction('💡 Explain this code', vscode.CodeActionKind.Empty);
        explainAction.command = {
            command: 'ollama-code.explain',
            title: 'Explain code',
            arguments: [document.uri, range]
        };
        actions.push(explainAction);
        // Generate tests
        const testAction = new vscode.CodeAction('🧪 Generate tests', vscode.CodeActionKind.Empty);
        testAction.command = {
            command: 'ollama-code.generateTests',
            title: 'Generate tests',
            arguments: [document.uri, range]
        };
        actions.push(testAction);
        // Security analysis
        const securityAction = new vscode.CodeAction('🔒 Analyze security', vscode.CodeActionKind.Empty);
        securityAction.command = {
            command: 'ollama-code.securityAnalysis',
            title: 'Analyze security',
            arguments: [document.uri, range]
        };
        actions.push(securityAction);
        return actions;
    }
    /**
     * Create a refactor action
     */
    createRefactorAction(title, tooltip, document, range, context, actionType) {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.Refactor);
        action.command = {
            command: 'ollama-code.refactorCode',
            title: title,
            tooltip: tooltip,
            arguments: [document.uri, range, actionType, context]
        };
        return action;
    }
    /**
     * Create an improvement action
     */
    createImprovementAction(title, tooltip, document, range, context, actionType) {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.RefactorRewrite);
        action.command = {
            command: 'ollama-code.improveCode',
            title: title,
            tooltip: tooltip,
            arguments: [document.uri, range, actionType, context]
        };
        return action;
    }
    /**
     * Create diagnostic fix prompt for AI
     */
    createDiagnosticFixPrompt(diagnostic, context) {
        let prompt = `Fix this ${context.languageId} code issue:\n\n`;
        prompt += `**Issue:** ${diagnostic.message}\n\n`;
        prompt += `**Code:**\n\`\`\`${context.languageId}\n${context.selectedCode}\n\`\`\`\n\n`;
        if (context.surroundingCode) {
            const surroundingLines = context.surroundingCode.split('\n').slice(-10, -1);
            prompt += `**Context:**\n\`\`\`${context.languageId}\n${surroundingLines.join('\n')}\n\`\`\`\n\n`;
        }
        prompt += `Please provide the corrected code that fixes the issue. Return only the corrected code without explanations.`;
        return prompt;
    }
    /**
     * Process AI response and clean it up
     */
    processAIResponse(aiResponse, originalCode) {
        let cleaned = aiResponse.trim();
        // Remove code block markers if present
        cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        // If the response is empty or unchanged, return original
        if (!cleaned || cleaned === originalCode) {
            return originalCode;
        }
        return cleaned;
    }
    /**
     * Create cache key for actions
     */
    createCacheKey(document, range, context) {
        const selectedCode = document.getText(range);
        const diagnosticCodes = context.diagnostics.map(d => d.code).join(',');
        const contentHash = this.simpleHash(selectedCode);
        return `${document.languageId}:${contentHash}:${diagnosticCodes}`;
    }
    /**
     * Simple hash function for cache keys
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.actionCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.actionCache.delete(key);
            }
        }
    }
}
exports.CodeActionProvider = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map