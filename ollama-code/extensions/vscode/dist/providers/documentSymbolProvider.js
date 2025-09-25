"use strict";
/**
 * Document Symbol Provider with AI-Enhanced Navigation
 *
 * Provides enhanced document outline and symbol navigation with AI-powered
 * insights, intelligent categorization, and contextual information.
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
exports.DocumentSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const codeAnalysisUtils_1 = require("../utils/codeAnalysisUtils");
const analysisConstants_1 = require("../config/analysisConstants");
class DocumentSymbolProvider {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    async provideDocumentSymbols(document, token) {
        try {
            if (token.isCancellationRequested) {
                return [];
            }
            const symbols = await this.parseDocumentSymbols(document);
            // Enhance symbols with AI insights if connected
            if (this.client.getConnectionStatus().connected) {
                await this.enhanceSymbolsWithAI(symbols, document, token);
            }
            return this.convertToVSCodeSymbols(symbols);
        }
        catch (error) {
            this.logger.error('Error providing document symbols:', error);
            return [];
        }
    }
    /**
     * Parse document symbols based on language
     */
    async parseDocumentSymbols(document) {
        const languageId = document.languageId;
        const text = document.getText();
        const lines = text.split('\n');
        switch (languageId) {
            case 'typescript':
            case 'javascript':
                return this.parseTypeScriptSymbols(lines, document);
            case 'python':
                return this.parsePythonSymbols(lines, document);
            case 'java':
                return this.parseJavaSymbols(lines, document);
            case 'csharp':
                return this.parseCSharpSymbols(lines, document);
            case 'cpp':
            case 'c':
                return this.parseCppSymbols(lines, document);
            case 'go':
                return this.parseGoSymbols(lines, document);
            case 'rust':
                return this.parseRustSymbols(lines, document);
            default:
                return this.parseGenericSymbols(lines, document);
        }
    }
    /**
     * Parse TypeScript/JavaScript symbols
     */
    parseTypeScriptSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Classes
        const classPatterns = analysisConstants_1.LANGUAGE_PATTERNS.TYPESCRIPT.CLASSES;
        for (const pattern of classPatterns) {
            pattern.lastIndex = 0; // Reset regex state
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
                symbols.push({
                    name: match[1],
                    kind: vscode.SymbolKind.Class,
                    range,
                    selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                    isExported: match[0].includes('export'),
                    children: []
                });
            }
        }
        // Interfaces
        const interfaceRegex = /(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((match = interfaceRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Interface,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                isExported: match[0].includes('export'),
                children: []
            });
        }
        // Functions
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((match = functionRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Function,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                isExported: match[0].includes('export'),
                isAsync: match[0].includes('async'),
                isTest: match[1].toLowerCase().includes('test') || match[1].toLowerCase().includes('spec'),
                children: []
            });
        }
        // Arrow functions and methods
        const arrowFuncRegex = /(?:export\s+)?(?:const\s+|let\s+|var\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*(?:\([^)]*\)\s*=>|[^=]*=>\s*{)/g;
        while ((match = arrowFuncRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Function,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                isExported: match[0].includes('export'),
                children: []
            });
        }
        // Enums
        const enumRegex = /(?:export\s+)?enum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((match = enumRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Enum,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                isExported: match[0].includes('export'),
                children: []
            });
        }
        // Constants and variables
        const variableRegex = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        while ((match = variableRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            symbols.push({
                name: match[1],
                kind: match[0].includes('const') ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable,
                range: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                isExported: match[0].includes('export'),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Parse Python symbols
     */
    parsePythonSymbols(lines, document) {
        const symbols = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Classes
            const classMatch = line.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (classMatch) {
                const range = codeAnalysisUtils_1.CodeAnalysisUtils.findPythonBlockRange(lines, i);
                symbols.push({
                    name: classMatch[1],
                    kind: vscode.SymbolKind.Class,
                    range,
                    selectionRange: new vscode.Range(i, 0, i, lines[i].length),
                    children: []
                });
            }
            // Functions
            const funcMatch = line.match(/^(?:async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (funcMatch) {
                const range = codeAnalysisUtils_1.CodeAnalysisUtils.findPythonBlockRange(lines, i);
                symbols.push({
                    name: funcMatch[1],
                    kind: vscode.SymbolKind.Function,
                    range,
                    selectionRange: new vscode.Range(i, 0, i, lines[i].length),
                    isAsync: line.includes('async'),
                    isTest: funcMatch[1].startsWith('test_'),
                    children: []
                });
            }
        }
        return symbols;
    }
    /**
     * Parse Java symbols (simplified)
     */
    parseJavaSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Classes
        const classRegex = /(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = classRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Class,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        // Methods
        const methodRegex = /(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:\w+\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/g;
        while ((match = methodRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Method,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Parse C# symbols with proper C# syntax support
     */
    parseCSharpSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Classes with C# specific patterns
        const classPatterns = analysisConstants_1.LANGUAGE_PATTERNS.CSHARP.CLASSES;
        for (const pattern of classPatterns) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
                symbols.push({
                    name: match[1],
                    kind: vscode.SymbolKind.Class,
                    range,
                    selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                    children: []
                });
            }
        }
        // Methods with C# specific patterns
        const methodPatterns = analysisConstants_1.LANGUAGE_PATTERNS.CSHARP.METHODS;
        for (const pattern of methodPatterns) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
                symbols.push({
                    name: match[1],
                    kind: vscode.SymbolKind.Method,
                    range,
                    selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                    children: []
                });
            }
        }
        return symbols;
    }
    /**
     * Parse C/C++ symbols (simplified)
     */
    parseCppSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Functions
        const functionRegex = /(?:\w+\s+)*([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/g;
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Function,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Parse Go symbols (simplified)
     */
    parseGoSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Functions
        const functionRegex = /func\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Function,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Parse Rust symbols (simplified)
     */
    parseRustSymbols(lines, document) {
        const symbols = [];
        const text = lines.join('\n');
        // Functions
        const functionRegex = /fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = codeAnalysisUtils_1.CodeAnalysisUtils.findBlockRange(lines, position.line);
            symbols.push({
                name: match[1],
                kind: vscode.SymbolKind.Function,
                range,
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Generic symbol parser for unsupported languages
     */
    parseGenericSymbols(lines, document) {
        const symbols = [];
        // Look for function-like patterns
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        const text = lines.join('\n');
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            const name = match[1] || match[2];
            const position = document.positionAt(match.index);
            symbols.push({
                name,
                kind: vscode.SymbolKind.Function,
                range: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                selectionRange: new vscode.Range(position.line, 0, position.line, lines[position.line].length),
                children: []
            });
        }
        return symbols;
    }
    /**
     * Enhance symbols with AI insights
     */
    async enhanceSymbolsWithAI(symbols, document, token) {
        // This would typically make AI requests to analyze each symbol
        // For now, we'll add some basic enhancements based on patterns
        for (const symbol of symbols) {
            if (token.isCancellationRequested)
                break;
            // Detect deprecated symbols using shared utility
            const symbolText = document.getText(symbol.range);
            symbol.isDeprecated = codeAnalysisUtils_1.CodeAnalysisUtils.isDeprecated(symbolText);
            // Calculate complexity for functions using shared utility
            if (symbol.kind === vscode.SymbolKind.Function || symbol.kind === vscode.SymbolKind.Method) {
                symbol.complexity = codeAnalysisUtils_1.CodeAnalysisUtils.calculateComplexity(symbolText);
            }
            // Add detail based on symbol type
            if (symbol.isAsync)
                symbol.detail = 'async function';
            if (symbol.isTest)
                symbol.detail = 'test function';
            if (symbol.isExported)
                symbol.detail = (symbol.detail || '') + ' (exported)';
        }
    }
    /**
     * Convert enhanced symbols to VS Code symbols
     */
    convertToVSCodeSymbols(symbols) {
        return symbols.map(symbol => {
            const documentSymbol = new vscode.DocumentSymbol(symbol.name, symbol.detail || '', symbol.kind, symbol.range, symbol.selectionRange);
            // Add child symbols
            if (symbol.children.length > 0) {
                documentSymbol.children = this.convertToVSCodeSymbols(symbol.children);
            }
            return documentSymbol;
        });
    }
}
exports.DocumentSymbolProvider = DocumentSymbolProvider;
//# sourceMappingURL=documentSymbolProvider.js.map