"use strict";
/**
 * AI-Powered Diagnostic Provider
 *
 * Provides intelligent code analysis and diagnostics using AI with
 * context-aware issue detection, security analysis, and performance insights.
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
exports.DiagnosticProvider = void 0;
const vscode = __importStar(require("vscode"));
const codeAnalysisUtils_1 = require("../utils/codeAnalysisUtils");
const analysisConstants_1 = require("../config/analysisConstants");
class DiagnosticProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
        this.analysisCache = new Map();
        this.CACHE_TTL = 30 * 60 * 1000; // 30 minutes
        this.codeIssues = [
            // Security Issues
            {
                pattern: /eval\s*\(/gi,
                message: 'Use of eval() can lead to code injection vulnerabilities',
                severity: vscode.DiagnosticSeverity.Warning,
                type: 'security',
                languages: ['javascript', 'typescript']
            },
            {
                pattern: /innerHTML\s*=/gi,
                message: 'Direct innerHTML assignment may lead to XSS vulnerabilities',
                severity: vscode.DiagnosticSeverity.Warning,
                type: 'security',
                languages: ['javascript', 'typescript']
            },
            {
                pattern: /document\.write\s*\(/gi,
                message: 'document.write() can be dangerous and is generally discouraged',
                severity: vscode.DiagnosticSeverity.Warning,
                type: 'security',
                languages: ['javascript', 'typescript']
            },
            // Performance Issues
            {
                pattern: /console\.log\s*\(/gi,
                message: 'Console statements left in production code',
                severity: vscode.DiagnosticSeverity.Information,
                type: 'performance',
                languages: ['javascript', 'typescript']
            },
            {
                pattern: /for\s*\(\s*var\s+\w+\s*=\s*0.*\.length/gi,
                message: 'Consider caching array length for performance in loops',
                severity: vscode.DiagnosticSeverity.Hint,
                type: 'performance'
            },
            // Style Issues
            {
                pattern: /var\s+/gi,
                message: 'Consider using let or const instead of var',
                severity: vscode.DiagnosticSeverity.Hint,
                type: 'style',
                languages: ['javascript', 'typescript']
            },
            {
                pattern: /==\s*(?!null)/gi,
                message: 'Consider using strict equality (===) instead of ==',
                severity: vscode.DiagnosticSeverity.Hint,
                type: 'style',
                languages: ['javascript', 'typescript']
            },
            // Logic Issues
            {
                pattern: /if\s*\(\s*true\s*\)/gi,
                message: 'Condition is always true - consider removing or fixing logic',
                severity: vscode.DiagnosticSeverity.Warning,
                type: 'logic'
            },
            {
                pattern: /if\s*\(\s*false\s*\)/gi,
                message: 'Condition is always false - dead code detected',
                severity: vscode.DiagnosticSeverity.Error,
                type: 'logic'
            }
        ];
        this.diagnostics = vscode.languages.createDiagnosticCollection('ollama-code');
        // Register document change listener for real-time analysis
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (this.shouldAnalyzeDocument(event.document)) {
                await this.analyzeDiagnostics(event.document);
            }
        });
        // Register document open listener
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (this.shouldAnalyzeDocument(document)) {
                await this.analyzeDiagnostics(document);
            }
        });
    }
    dispose() {
        this.diagnostics.dispose();
    }
    /**
     * Main diagnostic analysis method
     */
    async analyzeDiagnostics(document) {
        try {
            if (!this.client.getConnectionStatus().connected) {
                return;
            }
            // Check if document should be analyzed
            if (!this.shouldAnalyzeDocument(document)) {
                return;
            }
            // Check cache first
            const cacheKey = this.createCacheKey(document);
            const cached = this.analysisCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                this.diagnostics.set(document.uri, cached.diagnostics);
                return;
            }
            const diagnostics = [];
            const text = document.getText();
            // Perform different types of analysis
            const staticAnalysis = await this.performStaticAnalysis(document, text);
            const complexityAnalysis = await this.performComplexityAnalysis(document);
            const aiAnalysis = await this.performAIAnalysis(document, text);
            diagnostics.push(...staticAnalysis, ...complexityAnalysis, ...aiAnalysis);
            // Cache the results
            this.analysisCache.set(cacheKey, {
                diagnostics,
                timestamp: Date.now()
            });
            // Set diagnostics for this document
            this.diagnostics.set(document.uri, diagnostics);
        }
        catch (error) {
            this.logger.error('Diagnostic analysis failed:', error);
        }
    }
    /**
     * Perform static code analysis
     */
    async performStaticAnalysis(document, text) {
        const diagnostics = [];
        const lines = text.split('\n');
        for (const issue of this.codeIssues) {
            // Skip if language-specific and doesn't match
            if (issue.languages && !issue.languages.includes(document.languageId)) {
                continue;
            }
            issue.pattern.lastIndex = 0; // Reset regex
            let match;
            while ((match = issue.pattern.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);
                const diagnostic = new vscode.Diagnostic(range, issue.message, issue.severity);
                diagnostic.code = issue.type;
                diagnostic.source = 'ollama-code-static';
                diagnostics.push(diagnostic);
            }
        }
        return diagnostics;
    }
    /**
     * Perform complexity-based analysis
     */
    async performComplexityAnalysis(document) {
        const diagnostics = [];
        try {
            const functions = await codeAnalysisUtils_1.CodeAnalysisUtils.extractFunctions(document);
            for (const func of functions) {
                // High complexity warning
                if (func.complexity > analysisConstants_1.CODE_METRICS_THRESHOLDS.HIGH_COMPLEXITY) {
                    const diagnostic = new vscode.Diagnostic(func.range, `Function '${func.name}' has high cyclomatic complexity (${func.complexity}). Consider refactoring.`, vscode.DiagnosticSeverity.Warning);
                    diagnostic.code = 'high-complexity';
                    diagnostic.source = 'ollama-code-complexity';
                    diagnostics.push(diagnostic);
                }
                // Long function warning
                if (func.lineCount > analysisConstants_1.CODE_METRICS_THRESHOLDS.LONG_FUNCTION_LINES) {
                    const diagnostic = new vscode.Diagnostic(func.range, `Function '${func.name}' is too long (${func.lineCount} lines). Consider breaking it down.`, vscode.DiagnosticSeverity.Hint);
                    diagnostic.code = 'long-function';
                    diagnostic.source = 'ollama-code-complexity';
                    diagnostics.push(diagnostic);
                }
                // Too many parameters warning
                if (func.parameterCount > analysisConstants_1.CODE_METRICS_THRESHOLDS.TOO_MANY_PARAMS) {
                    const diagnostic = new vscode.Diagnostic(func.range, `Function '${func.name}' has too many parameters (${func.parameterCount}). Consider using an options object.`, vscode.DiagnosticSeverity.Hint);
                    diagnostic.code = 'too-many-params';
                    diagnostic.source = 'ollama-code-complexity';
                    diagnostics.push(diagnostic);
                }
            }
        }
        catch (error) {
            this.logger.error('Complexity analysis failed:', error);
        }
        return diagnostics;
    }
    /**
     * Perform AI-powered analysis
     */
    async performAIAnalysis(document, text) {
        const diagnostics = [];
        try {
            // Only perform AI analysis for smaller files to avoid timeouts
            const fileSizeKB = text.length / 1024;
            if (fileSizeKB > analysisConstants_1.CODE_METRICS_THRESHOLDS.MAX_FILE_SIZE_KB / 2) {
                return diagnostics; // Skip AI analysis for large files
            }
            // Create analysis prompt
            const prompt = this.createAIAnalysisPrompt(document, text);
            const result = await Promise.race([
                this.client.sendAIRequest({
                    prompt,
                    type: 'completion',
                    language: document.languageId
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('AI analysis timeout')), 10000))
            ]);
            if (result?.result) {
                const aiDiagnostics = this.parseAIAnalysisResult(document, result.result);
                diagnostics.push(...aiDiagnostics);
            }
        }
        catch (error) {
            this.logger.debug('AI analysis skipped or failed:', error instanceof Error ? error.message : String(error));
            // Don't propagate AI analysis errors - it's supplementary
        }
        return diagnostics;
    }
    /**
     * Create AI analysis prompt
     */
    createAIAnalysisPrompt(document, text) {
        const lines = text.split('\n');
        const sampleSize = Math.min(50, lines.length); // Analyze first 50 lines
        const sampleText = lines.slice(0, sampleSize).join('\n');
        let prompt = `Analyze this ${document.languageId} code for potential issues:\n\n`;
        prompt += `\`\`\`${document.languageId}\n${sampleText}\n\`\`\`\n\n`;
        prompt += `Focus on:\n`;
        prompt += `1. Logic errors or bugs\n`;
        prompt += `2. Performance issues\n`;
        prompt += `3. Security vulnerabilities\n`;
        prompt += `4. Code smell or maintainability issues\n`;
        prompt += `5. Best practice violations\n\n`;
        prompt += `Provide specific line-based feedback in the format:\n`;
        prompt += `LINE X: [SEVERITY] Issue description\n`;
        prompt += `Where SEVERITY is ERROR, WARNING, or INFO`;
        return prompt;
    }
    /**
     * Parse AI analysis results into diagnostics
     */
    parseAIAnalysisResult(document, aiResult) {
        const diagnostics = [];
        try {
            // Parse AI response for line-specific issues
            const lines = aiResult.split('\n');
            const linePattern = /LINE\s+(\d+):\s*\[(\w+)\]\s*(.+)/i;
            for (const line of lines) {
                const match = line.match(linePattern);
                if (match) {
                    const lineNum = parseInt(match[1]) - 1; // Convert to 0-based
                    const severityStr = match[2].toUpperCase();
                    const message = match[3].trim();
                    // Skip if line number is out of bounds
                    if (lineNum < 0 || lineNum >= document.lineCount) {
                        continue;
                    }
                    let severity;
                    switch (severityStr) {
                        case 'ERROR':
                            severity = vscode.DiagnosticSeverity.Error;
                            break;
                        case 'WARNING':
                            severity = vscode.DiagnosticSeverity.Warning;
                            break;
                        case 'INFO':
                        default:
                            severity = vscode.DiagnosticSeverity.Information;
                            break;
                    }
                    const range = document.lineAt(lineNum).range;
                    const diagnostic = new vscode.Diagnostic(range, `AI Analysis: ${message}`, severity);
                    diagnostic.code = 'ai-analysis';
                    diagnostic.source = 'ollama-code-ai';
                    diagnostics.push(diagnostic);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to parse AI analysis result:', error);
        }
        return diagnostics;
    }
    /**
     * Check if document should be analyzed
     */
    shouldAnalyzeDocument(document) {
        // Skip unsupported languages
        if (!codeAnalysisUtils_1.CodeAnalysisUtils.isSupportedLanguage(document.languageId)) {
            return false;
        }
        // Skip very large files
        const fileSizeKB = document.getText().length / 1024;
        if (fileSizeKB > analysisConstants_1.CODE_METRICS_THRESHOLDS.MAX_FILE_SIZE_KB) {
            return false;
        }
        // Skip certain file types
        const skipPatterns = [
            /\.min\./,
            /node_modules/,
            /\.git/,
            /dist/,
            /build/,
            /coverage/
        ];
        return !skipPatterns.some(pattern => pattern.test(document.uri.fsPath));
    }
    /**
     * Create cache key for analysis results
     */
    createCacheKey(document) {
        const content = document.getText();
        const contentHash = this.simpleHash(content);
        return `${document.languageId}:${document.uri.fsPath}:${contentHash}`;
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
     * Clear diagnostics for a document
     */
    clearDiagnostics(uri) {
        this.diagnostics.set(uri, []);
        this.analysisCache.delete(this.createCacheKey(vscode.workspace.textDocuments.find(doc => doc.uri === uri)));
    }
    /**
     * Clear all diagnostics
     */
    clearAllDiagnostics() {
        this.diagnostics.clear();
        this.analysisCache.clear();
    }
    /**
     * Get current diagnostics for a document
     */
    getDiagnostics(uri) {
        return this.diagnostics.get(uri) || [];
    }
    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.analysisCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.analysisCache.delete(key);
            }
        }
    }
}
exports.DiagnosticProvider = DiagnosticProvider;
//# sourceMappingURL=diagnosticProvider.js.map