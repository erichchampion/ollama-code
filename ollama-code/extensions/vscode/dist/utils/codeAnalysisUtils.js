"use strict";
/**
 * Code Analysis Utilities
 *
 * Shared utilities for code analysis to eliminate DRY violations
 * between CodeLens and DocumentSymbol providers.
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
exports.CodeAnalysisUtils = void 0;
const vscode = __importStar(require("vscode"));
const analysisConstants_1 = require("../config/analysisConstants");
class CodeAnalysisUtils {
    /**
     * Check if the language is supported for code analysis
     */
    static isSupportedLanguage(languageId) {
        return analysisConstants_1.SUPPORTED_LANGUAGES.includes(languageId);
    }
    /**
     * Validate file size for analysis
     */
    static validateFileSize(text, maxSizeKB) {
        const sizeKB = text.length / 1024;
        const maxSize = maxSizeKB || analysisConstants_1.CODE_METRICS_THRESHOLDS.MAX_FILE_SIZE_KB;
        return {
            isValid: sizeKB <= maxSize,
            sizeKB: Math.round(sizeKB * 100) / 100 // Round to 2 decimal places
        };
    }
    /**
     * Check if file is too large for analysis and log warning if needed
     */
    static checkFileSizeForAnalysis(text, fileName, logger) {
        const { isValid, sizeKB } = this.validateFileSize(text);
        if (!isValid && logger) {
            const fileInfo = fileName ? ` ${fileName}` : '';
            logger.warn(`File${fileInfo} is too large (${sizeKB}KB) for analysis`);
        }
        return isValid;
    }
    /**
     * Calculate cyclomatic complexity with improved accuracy
     */
    static calculateComplexity(text) {
        let complexity = 1; // Base complexity
        // Use centralized complexity keywords
        const keywords = analysisConstants_1.COMPLEXITY_KEYWORDS.ALL();
        for (const keyword of keywords) {
            // Handle operators specially to avoid double-escaping issues
            let regex;
            if (keyword === '&&' || keyword === '||') {
                regex = new RegExp(`\\${keyword}`, 'g');
            }
            else if (keyword === '?') {
                regex = new RegExp('\\?', 'g');
            }
            else {
                regex = new RegExp(`\\b${keyword}\\b`, 'g');
            }
            const matches = text.match(regex);
            if (matches) {
                complexity += matches.length;
            }
        }
        return Math.min(complexity, analysisConstants_1.CODE_METRICS_THRESHOLDS.MAX_DISPLAY_COMPLEXITY);
    }
    /**
     * Find the range of a code block using brace counting with improved handling
     */
    static findBlockRange(lines, startLine) {
        if (startLine >= lines.length) {
            return new vscode.Range(startLine, 0, startLine, 0);
        }
        let braceCount = 0;
        let foundStart = false;
        let endLine = startLine;
        let inString = false;
        let inComment = false;
        let stringChar = '';
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                const nextChar = j < line.length - 1 ? line[j + 1] : '';
                const prevChar = j > 0 ? line[j - 1] : '';
                // Handle single-line comments
                if (!inString && char === '/' && nextChar === '/') {
                    break; // Skip rest of line
                }
                // Handle multi-line comments
                if (!inString && char === '/' && nextChar === '*') {
                    inComment = true;
                    j++; // Skip next character
                    continue;
                }
                if (inComment && char === '*' && nextChar === '/') {
                    inComment = false;
                    j++; // Skip next character
                    continue;
                }
                if (inComment)
                    continue;
                // Handle strings
                if (!inString && (char === '"' || char === "'" || char === '`')) {
                    inString = true;
                    stringChar = char;
                    continue;
                }
                if (inString && char === stringChar && prevChar !== '\\') {
                    inString = false;
                    stringChar = '';
                    continue;
                }
                if (inString)
                    continue;
                // Count braces only when not in strings or comments
                if (char === '{') {
                    braceCount++;
                    foundStart = true;
                }
                else if (char === '}') {
                    braceCount--;
                    if (foundStart && braceCount === 0) {
                        endLine = i;
                        break;
                    }
                }
            }
            if (foundStart && braceCount === 0)
                break;
        }
        // Ensure endLine is within bounds
        const finalEndLine = Math.min(endLine, lines.length - 1);
        const endLength = lines[finalEndLine]?.length || 0;
        return new vscode.Range(startLine, 0, finalEndLine, endLength);
    }
    /**
     * Find the range of a Python code block using indentation
     */
    static findPythonBlockRange(lines, startLine) {
        if (startLine >= lines.length) {
            return new vscode.Range(startLine, 0, startLine, 0);
        }
        const startIndent = this.getIndentation(lines[startLine]);
        let endLine = startLine;
        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '')
                continue; // Skip empty lines
            const currentIndent = this.getIndentation(lines[i]);
            if (currentIndent <= startIndent) {
                endLine = i - 1;
                break;
            }
            endLine = i;
        }
        // Ensure endLine is within bounds
        const finalEndLine = Math.min(endLine, lines.length - 1);
        const endLength = lines[finalEndLine]?.length || 0;
        return new vscode.Range(startLine, 0, finalEndLine, endLength);
    }
    /**
     * Get indentation level of a line
     */
    static getIndentation(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }
    /**
     * Count function parameters with improved parsing
     */
    static countParameters(functionSignature) {
        const match = functionSignature.match(/\(([^)]*)\)/);
        if (!match || !match[1])
            return 0;
        const paramString = match[1].trim();
        if (paramString === '')
            return 0;
        // Split by comma, but handle nested parentheses and generics
        const params = [];
        let current = '';
        let depth = 0;
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < paramString.length; i++) {
            const char = paramString[i];
            const prevChar = i > 0 ? paramString[i - 1] : '';
            // Handle strings
            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            }
            else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
                stringChar = '';
            }
            if (!inString) {
                if (char === '(' || char === '<' || char === '[') {
                    depth++;
                }
                else if (char === ')' || char === '>' || char === ']') {
                    depth--;
                }
                else if (char === ',' && depth === 0) {
                    params.push(current.trim());
                    current = '';
                    continue;
                }
            }
            current += char;
        }
        if (current.trim()) {
            params.push(current.trim());
        }
        return params.filter(p => p.length > 0).length;
    }
    /**
     * Get function regex patterns for different languages
     */
    static getFunctionPatterns(languageId) {
        // Handle special cases and convert readonly arrays to mutable arrays
        switch (languageId.toLowerCase()) {
            case 'typescript':
            case 'javascript':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.TYPESCRIPT.FUNCTIONS];
            case 'python':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.PYTHON.FUNCTIONS];
            case 'java':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.JAVA.METHODS];
            case 'csharp':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.CSHARP.METHODS];
            case 'cpp':
            case 'c':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.CPP.FUNCTIONS];
            case 'go':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.GO.FUNCTIONS];
            case 'rust':
                return [...analysisConstants_1.LANGUAGE_PATTERNS.RUST.FUNCTIONS];
            default:
                return [...analysisConstants_1.LANGUAGE_PATTERNS.GENERIC.FUNCTIONS];
        }
    }
    /**
     * Extract function information from document with improved error handling
     */
    static async extractFunctions(document, cancellationToken) {
        const functions = [];
        const text = document.getText();
        // Check file size limit
        const fileSizeKB = text.length / 1024;
        if (fileSizeKB > analysisConstants_1.CODE_METRICS_THRESHOLDS.MAX_FILE_SIZE_KB) {
            console.warn(`File ${document.fileName} is too large (${fileSizeKB.toFixed(1)}KB) for analysis`);
            return functions;
        }
        const lines = text.split('\n');
        const patterns = this.getFunctionPatterns(document.languageId);
        for (const pattern of patterns) {
            // Check for cancellation
            if (cancellationToken?.isCancellationRequested) {
                break;
            }
            // Reset regex lastIndex to avoid issues with global regexes
            pattern.lastIndex = 0;
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (cancellationToken?.isCancellationRequested)
                    break;
                if (match.index === undefined)
                    continue;
                try {
                    const startPos = document.positionAt(match.index);
                    const functionName = match[1] || 'anonymous';
                    const functionStart = startPos.line;
                    // Use improved block range finding
                    const range = document.languageId === 'python'
                        ? this.findPythonBlockRange(lines, functionStart)
                        : this.findBlockRange(lines, functionStart);
                    const lineCount = range.end.line - range.start.line + 1;
                    const functionText = document.getText(range);
                    const complexity = this.calculateComplexity(functionText);
                    const parameterCount = this.countParameters(match[0]);
                    functions.push({
                        name: functionName,
                        range,
                        complexity,
                        lineCount,
                        parameterCount
                    });
                }
                catch (error) {
                    console.error('Error extracting function:', error);
                    // Continue with next function instead of failing entirely
                }
            }
        }
        return functions;
    }
    /**
     * Check if a symbol should be considered deprecated
     */
    static isDeprecated(symbolText) {
        const deprecatedPatterns = [
            /@deprecated/i,
            /\/\/\s*deprecated/i,
            /#\s*deprecated/i,
            /\*\s*@deprecated/i,
            /\[Obsolete\]/i, // C#
            /#\[deprecated\]/i, // Rust
        ];
        return deprecatedPatterns.some(pattern => pattern.test(symbolText));
    }
    /**
     * Detect if a function is a test function
     */
    static isTestFunction(functionName) {
        const testPatterns = [
            /^test/i,
            /test$/i,
            /_test$/i,
            /^it\s/i,
            /^describe\s/i,
            /^should/i,
            /spec$/i
        ];
        return testPatterns.some(pattern => pattern.test(functionName));
    }
}
exports.CodeAnalysisUtils = CodeAnalysisUtils;
//# sourceMappingURL=codeAnalysisUtils.js.map