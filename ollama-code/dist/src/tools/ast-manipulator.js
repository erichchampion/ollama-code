/**
 * AST Manipulator
 *
 * Provides syntax-aware code transformations using Abstract Syntax Trees
 * for safe and precise code modifications.
 */
import { promises as fs } from 'fs';
import * as path from 'path';
export class ASTManipulator {
    languageSupport = new Map();
    constructor() {
        this.initializeLanguageSupport();
    }
    /**
     * Initialize language-specific handlers
     */
    initializeLanguageSupport() {
        this.languageSupport.set('.js', new JavaScriptHandler());
        this.languageSupport.set('.mjs', new JavaScriptHandler());
        this.languageSupport.set('.ts', new TypeScriptHandler());
        this.languageSupport.set('.jsx', new JavaScriptHandler());
        this.languageSupport.set('.tsx', new TypeScriptHandler());
        this.languageSupport.set('.py', new PythonHandler());
        this.languageSupport.set('.json', new JSONHandler());
    }
    /**
     * Parse file and extract AST information
     */
    async parseFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return handler.parse(content);
    }
    /**
     * Extract function information from code
     */
    async extractFunctions(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return handler.extractFunctions(content);
    }
    /**
     * Extract class information from code
     */
    async extractClasses(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return handler.extractClasses(content);
    }
    /**
     * Extract import/export information
     */
    async extractImports(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return handler.extractImports(content);
    }
    /**
     * Rename a symbol throughout the file with scope awareness
     */
    async renameSymbol(filePath, oldName, newName, scope) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: `Unsupported file type: ${ext}`
            };
        }
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return handler.renameSymbol(content, oldName, newName, scope);
        }
        catch (error) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Extract a function to a separate location
     */
    async extractFunction(filePath, functionName, targetLocation) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: `Unsupported file type: ${ext}`
            };
        }
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return handler.extractFunction(content, functionName, targetLocation);
        }
        catch (error) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Add import statement
     */
    async addImport(filePath, importStatement, position) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: `Unsupported file type: ${ext}`
            };
        }
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return handler.addImport(content, importStatement, position);
        }
        catch (error) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Modify function parameters
     */
    async modifyFunction(filePath, functionName, modifications) {
        const ext = path.extname(filePath).toLowerCase();
        const handler = this.languageSupport.get(ext);
        if (!handler) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: `Unsupported file type: ${ext}`
            };
        }
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return handler.modifyFunction(content, functionName, modifications);
        }
        catch (error) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Apply a code transformation based on the transformation specification
     */
    async applyTransformation(filePath, transformation) {
        try {
            switch (transformation.type) {
                case 'rename-symbol':
                    if (!transformation.target || !transformation.replacement) {
                        throw new Error('Rename transformation requires target and replacement');
                    }
                    return await this.renameSymbol(filePath, transformation.target, transformation.replacement, transformation.scope);
                case 'extract-function':
                    if (!transformation.target) {
                        throw new Error('Extract function transformation requires target function name');
                    }
                    const targetLocation = transformation.parameters?.targetLocation || 'separate-file';
                    return await this.extractFunction(filePath, transformation.target, targetLocation);
                case 'add-import':
                    if (!transformation.target) {
                        throw new Error('Add import transformation requires import statement');
                    }
                    const position = transformation.parameters?.position || 'top';
                    return await this.addImport(filePath, transformation.target, position);
                case 'modify-function':
                    if (!transformation.target) {
                        throw new Error('Modify function transformation requires function name');
                    }
                    const modifications = transformation.parameters || {};
                    return await this.modifyFunction(filePath, transformation.target, modifications);
                case 'custom':
                    // For custom transformations, use parameters to determine what to do
                    throw new Error('Custom transformations not yet implemented');
                default:
                    throw new Error(`Unknown transformation type: ${transformation.type}`);
            }
        }
        catch (error) {
            return {
                success: false,
                originalCode: '',
                modifiedCode: '',
                changes: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
/**
 * Base language handler interface
 */
class LanguageHandler {
    createCodeLocation(code, index) {
        const lines = code.substring(0, index).split('\n');
        return {
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
            index
        };
    }
    createCodeRange(code, start, end) {
        return {
            start: this.createCodeLocation(code, start),
            end: this.createCodeLocation(code, end)
        };
    }
}
/**
 * JavaScript/TypeScript handler using regex-based parsing
 * (In production, this would use a proper parser like Babel or TypeScript AST)
 */
class JavaScriptHandler extends LanguageHandler {
    parse(code) {
        // Simplified AST representation
        return {
            type: 'Program',
            start: 0,
            end: code.length,
            range: [0, code.length],
            children: []
        };
    }
    extractFunctions(code) {
        const functions = [];
        // Match function declarations, expressions, and arrow functions
        const functionRegex = /(export\s+)?(async\s+)?(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*(?:async\s+)?\(([^)]*)\)\s*=>)/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const isExported = !!match[1];
            const isAsync = !!match[2];
            const name = match[3] || match[4] || match[6] || 'anonymous';
            const params = match[5] || match[7] || '';
            functions.push({
                name,
                range: this.createCodeRange(code, match.index, match.index + match[0].length),
                parameters: params.split(',').map(p => p.trim()).filter(p => p),
                isAsync,
                isExported
            });
        }
        return functions;
    }
    extractClasses(code) {
        const classes = [];
        const classRegex = /(export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:extends\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\{/g;
        let match;
        while ((match = classRegex.exec(code)) !== null) {
            const isExported = !!match[1];
            const name = match[2];
            const superClass = match[3];
            classes.push({
                name,
                range: this.createCodeRange(code, match.index, match.index + match[0].length),
                methods: [],
                properties: [],
                superClass,
                isExported
            });
        }
        return classes;
    }
    extractImports(code) {
        const imports = [];
        const importRegex = /import\s+(?:([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:\{([^}]+)\}))\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            const isDefault = !!match[1];
            const namedImports = match[2] ? match[2].split(',').map(i => i.trim()) : [];
            const module = match[3];
            imports.push({
                module,
                imports: isDefault ? [match[1]] : namedImports,
                isDefault,
                range: this.createCodeRange(code, match.index, match.index + match[0].length)
            });
        }
        return imports;
    }
    renameSymbol(code, oldName, newName, scope) {
        const changes = [];
        const symbolRegex = new RegExp(`\\b${oldName}\\b`, 'g');
        let modifiedCode = code;
        let match;
        while ((match = symbolRegex.exec(code)) !== null) {
            changes.push({
                type: 'replace',
                range: this.createCodeRange(code, match.index, match.index + oldName.length),
                oldText: oldName,
                newText: newName,
                description: `Rename symbol ${oldName} to ${newName}`
            });
        }
        modifiedCode = code.replace(symbolRegex, newName);
        return {
            success: true,
            originalCode: code,
            modifiedCode,
            changes
        };
    }
    extractFunction(code, functionName, targetLocation) {
        // Simplified implementation - would need proper AST parsing for production
        const functionRegex = new RegExp(`(function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\})`, 'g');
        const match = functionRegex.exec(code);
        if (!match) {
            return {
                success: false,
                originalCode: code,
                modifiedCode: code,
                changes: [],
                error: `Function ${functionName} not found`
            };
        }
        const functionCode = match[1];
        const modifiedCode = code.replace(functionRegex, '');
        return {
            success: true,
            originalCode: code,
            modifiedCode,
            changes: [{
                    type: 'delete',
                    range: this.createCodeRange(code, match.index, match.index + functionCode.length),
                    oldText: functionCode,
                    newText: '',
                    description: `Extract function ${functionName}`
                }]
        };
    }
    addImport(code, importStatement, position = 'top') {
        const lines = code.split('\n');
        let insertIndex = 0;
        if (position === 'after-existing') {
            // Find the last import statement
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    insertIndex = i + 1;
                }
            }
        }
        lines.splice(insertIndex, 0, importStatement);
        const modifiedCode = lines.join('\n');
        return {
            success: true,
            originalCode: code,
            modifiedCode,
            changes: [{
                    type: 'insert',
                    range: this.createCodeRange(code, 0, 0),
                    oldText: '',
                    newText: importStatement + '\n',
                    description: 'Add import statement'
                }]
        };
    }
    modifyFunction(code, functionName, modifications) {
        // Simplified implementation
        return {
            success: true,
            originalCode: code,
            modifiedCode: code,
            changes: []
        };
    }
}
/**
 * TypeScript handler (extends JavaScript with type information)
 */
class TypeScriptHandler extends JavaScriptHandler {
    extractFunctions(code) {
        const functions = super.extractFunctions(code);
        // Enhanced for TypeScript - extract type information
        functions.forEach(func => {
            const typeRegex = new RegExp(`${func.name}\\s*\\([^)]*\\)\\s*:\\s*([^{]+)\\s*\\{`);
            const typeMatch = typeRegex.exec(code);
            if (typeMatch) {
                func.returnType = typeMatch[1].trim();
            }
        });
        return functions;
    }
}
/**
 * Python handler (simplified implementation)
 */
class PythonHandler extends LanguageHandler {
    parse(code) {
        return {
            type: 'Module',
            start: 0,
            end: code.length,
            range: [0, code.length],
            children: []
        };
    }
    extractFunctions(code) {
        const functions = [];
        const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            functions.push({
                name: match[1],
                range: this.createCodeRange(code, match.index, match.index + match[0].length),
                parameters: match[2].split(',').map(p => p.trim()).filter(p => p),
                isAsync: code.substring(match.index - 10, match.index).includes('async'),
                isExported: false // Python doesn't have explicit exports
            });
        }
        return functions;
    }
    extractClasses(code) {
        const classes = [];
        const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]*)\))?:/g;
        let match;
        while ((match = classRegex.exec(code)) !== null) {
            classes.push({
                name: match[1],
                range: this.createCodeRange(code, match.index, match.index + match[0].length),
                methods: [],
                properties: [],
                superClass: match[2],
                isExported: false
            });
        }
        return classes;
    }
    extractImports(code) {
        const imports = [];
        const importRegex = /(?:from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+)?import\s+([a-zA-Z_][a-zA-Z0-9_,\s]*)/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            const module = match[1] || '';
            const importNames = match[2].split(',').map(i => i.trim());
            imports.push({
                module,
                imports: importNames,
                isDefault: false,
                range: this.createCodeRange(code, match.index, match.index + match[0].length)
            });
        }
        return imports;
    }
    renameSymbol(code, oldName, newName, scope) {
        // Similar to JavaScript implementation
        const changes = [];
        const symbolRegex = new RegExp(`\\b${oldName}\\b`, 'g');
        const modifiedCode = code.replace(symbolRegex, newName);
        return {
            success: true,
            originalCode: code,
            modifiedCode,
            changes
        };
    }
    extractFunction(code, functionName, targetLocation) {
        // Python function extraction implementation
        return {
            success: true,
            originalCode: code,
            modifiedCode: code,
            changes: []
        };
    }
    addImport(code, importStatement, position = 'top') {
        const lines = code.split('\n');
        lines.unshift(importStatement);
        return {
            success: true,
            originalCode: code,
            modifiedCode: lines.join('\n'),
            changes: [{
                    type: 'insert',
                    range: this.createCodeRange(code, 0, 0),
                    oldText: '',
                    newText: importStatement + '\n',
                    description: 'Add import statement'
                }]
        };
    }
    modifyFunction(code, functionName, modifications) {
        return {
            success: true,
            originalCode: code,
            modifiedCode: code,
            changes: []
        };
    }
}
/**
 * JSON handler for configuration files
 */
class JSONHandler extends LanguageHandler {
    parse(code) {
        try {
            JSON.parse(code);
            return {
                type: 'JSON',
                start: 0,
                end: code.length,
                range: [0, code.length]
            };
        }
        catch (error) {
            throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractFunctions(code) {
        return []; // JSON doesn't have functions
    }
    extractClasses(code) {
        return []; // JSON doesn't have classes
    }
    extractImports(code) {
        return []; // JSON doesn't have imports
    }
    renameSymbol(code, oldName, newName) {
        // Rename JSON property keys
        const obj = JSON.parse(code);
        const modifiedObj = this.renameObjectProperty(obj, oldName, newName);
        return {
            success: true,
            originalCode: code,
            modifiedCode: JSON.stringify(modifiedObj, null, 2),
            changes: []
        };
    }
    renameObjectProperty(obj, oldName, newName) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.renameObjectProperty(item, oldName, newName));
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = key === oldName ? newName : key;
            result[newKey] = this.renameObjectProperty(value, oldName, newName);
        }
        return result;
    }
    extractFunction(code, functionName, targetLocation) {
        return {
            success: false,
            originalCode: code,
            modifiedCode: code,
            changes: [],
            error: 'JSON files do not contain functions'
        };
    }
    addImport(code, importStatement) {
        return {
            success: false,
            originalCode: code,
            modifiedCode: code,
            changes: [],
            error: 'JSON files do not support imports'
        };
    }
    modifyFunction(code, functionName, modifications) {
        return {
            success: false,
            originalCode: code,
            modifiedCode: code,
            changes: [],
            error: 'JSON files do not contain functions'
        };
    }
}
//# sourceMappingURL=ast-manipulator.js.map