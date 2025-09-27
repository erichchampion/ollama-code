"use strict";
/**
 * Workspace Analyzer Service
 *
 * Provides workspace-level analysis and context for AI-powered features
 * including project structure, dependencies, and contextual intelligence.
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
exports.WorkspaceAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const codeAnalysisUtils_1 = require("../utils/codeAnalysisUtils");
const cacheUtils_1 = require("../utils/cacheUtils");
const serviceConstants_1 = require("../config/serviceConstants");
const errorUtils_1 = require("../utils/errorUtils");
class WorkspaceAnalyzer {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.contextCache = new cacheUtils_1.ProviderCache(serviceConstants_1.WORKSPACE_ANALYSIS.CACHE_TTL);
        this.dependencyCache = new cacheUtils_1.ProviderCache(serviceConstants_1.WORKSPACE_ANALYSIS.CACHE_TTL);
    }
    /**
     * Analyze workspace for contextual AI responses
     */
    async analyzeWorkspace() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }
        const cacheKey = workspaceFolder.uri.fsPath;
        const cached = this.contextCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const context = await this.performWorkspaceAnalysis(workspaceFolder);
            this.contextCache.set(cacheKey, context);
            return context;
        }
        catch (error) {
            this.log(`Workspace analysis failed: ${(0, errorUtils_1.formatError)(error)}`);
            return null;
        }
    }
    /**
     * Analyze project dependencies for better suggestions
     */
    async analyzeDependencies() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }
        const cacheKey = `deps_${workspaceFolder.uri.fsPath}`;
        const cached = this.dependencyCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const dependencies = await this.extractDependencies(workspaceFolder);
            this.dependencyCache.set(cacheKey, dependencies);
            return dependencies;
        }
        catch (error) {
            this.log(`Dependency analysis failed: ${(0, errorUtils_1.formatError)(error)}`);
            return [];
        }
    }
    /**
     * Get git history integration for change-aware intelligence
     */
    async getGitContext() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }
        try {
            return await this.analyzeGitRepository(workspaceFolder);
        }
        catch (error) {
            this.log(`Git analysis failed: ${(0, errorUtils_1.formatError)(error)}`);
            return null;
        }
    }
    /**
     * Analyze cursor position and selection context
     */
    getCursorContext(document, position) {
        const text = document.getText();
        const lines = text.split('\n');
        const currentLine = lines[position.line] || '';
        // Get surrounding context
        const startLine = Math.max(0, position.line - serviceConstants_1.WORKSPACE_ANALYSIS.CONTEXT_LINES);
        const endLine = Math.min(lines.length - 1, position.line + serviceConstants_1.WORKSPACE_ANALYSIS.CONTEXT_LINES);
        const surroundingCode = lines.slice(startLine, endLine + 1).join('\n');
        // Detect if cursor is in comment or string
        const lineUpToCursor = currentLine.substring(0, position.character);
        const isInComment = this.isPositionInComment(lineUpToCursor, document.languageId);
        const isInString = this.isPositionInString(lineUpToCursor);
        // Calculate indentation level
        const indentMatch = currentLine.match(/^(\s*)/);
        const indentLevel = indentMatch ? indentMatch[1].length : 0;
        // Extract function and class context
        const { functionName, className, namespace } = this.extractSymbolContext(lines, position.line, document.languageId);
        return {
            functionName,
            className,
            namespace,
            isInComment,
            isInString,
            surroundingCode,
            indentLevel
        };
    }
    /**
     * Get multi-file context understanding for comprehensive assistance
     */
    async getMultiFileContext(currentDocument) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return { relatedFiles: [], imports: [], exports: [], usageExamples: [] };
        }
        try {
            const imports = await this.extractImports(currentDocument);
            const exports = await this.extractExports(currentDocument);
            const relatedFiles = await this.findRelatedFiles(currentDocument, workspaceFolder);
            const usageExamples = await this.findUsageExamples(currentDocument, workspaceFolder);
            return { relatedFiles, imports, exports, usageExamples };
        }
        catch (error) {
            this.log(`Multi-file context analysis failed: ${(0, errorUtils_1.formatError)(error)}`);
            return { relatedFiles: [], imports: [], exports: [], usageExamples: [] };
        }
    }
    /**
     * Create intelligent caching for frequently accessed contexts
     */
    optimizeContextCaching() {
        // The ProviderCache already handles this with automatic cleanup
        // Additional optimization could include context pre-loading for commonly accessed files
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            // Pre-cache context for current document
            this.getCursorContext(document, activeEditor.selection.active);
        }
    }
    /**
     * Perform comprehensive workspace analysis
     */
    async performWorkspaceAnalysis(workspaceFolder) {
        const rootPath = workspaceFolder.uri.fsPath;
        // Analyze project configuration files
        const packageJsonPath = path.join(rootPath, 'package.json');
        const tsConfigPath = path.join(rootPath, 'tsconfig.json');
        const pyProjectPath = path.join(rootPath, 'pyproject.toml');
        const cargoPath = path.join(rootPath, 'Cargo.toml');
        let projectType = 'unknown';
        let language = 'unknown';
        let framework;
        let dependencies = [];
        let devDependencies = [];
        // Detect project type and extract dependencies
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            projectType = 'node';
            language = fs.existsSync(tsConfigPath) ? 'typescript' : 'javascript';
            dependencies = Object.keys(packageJson.dependencies || {});
            devDependencies = Object.keys(packageJson.devDependencies || {});
            // Detect framework
            for (const [frameworkName, patterns] of Object.entries(serviceConstants_1.FRAMEWORK_PATTERNS)) {
                if (patterns.some(pattern => dependencies.includes(pattern) || devDependencies.includes(pattern))) {
                    framework = frameworkName;
                    break;
                }
            }
        }
        else if (fs.existsSync(pyProjectPath) || fs.existsSync(path.join(rootPath, 'requirements.txt'))) {
            projectType = 'python';
            language = 'python';
            // Could parse pyproject.toml or requirements.txt for dependencies
        }
        else if (fs.existsSync(cargoPath)) {
            projectType = 'rust';
            language = 'rust';
            // Could parse Cargo.toml for dependencies
        }
        // Analyze file structure
        const fileStructure = await this.analyzeFileStructure(rootPath);
        // Get git information
        const gitInfo = await this.analyzeGitRepository(workspaceFolder);
        return {
            projectType,
            language,
            framework,
            dependencies,
            devDependencies,
            fileStructure,
            gitInfo: gitInfo || undefined
        };
    }
    /**
     * Extract project dependencies with detailed information
     */
    async extractDependencies(workspaceFolder) {
        const rootPath = workspaceFolder.uri.fsPath;
        const packageJsonPath = path.join(rootPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return [];
        }
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = [];
        // Process production dependencies
        if (packageJson.dependencies) {
            for (const [name, version] of Object.entries(packageJson.dependencies)) {
                dependencies.push({
                    name,
                    version: version,
                    type: 'production'
                });
            }
        }
        // Process development dependencies
        if (packageJson.devDependencies) {
            for (const [name, version] of Object.entries(packageJson.devDependencies)) {
                dependencies.push({
                    name,
                    version: version,
                    type: 'development'
                });
            }
        }
        return dependencies;
    }
    /**
     * Analyze git repository information
     */
    async analyzeGitRepository(workspaceFolder) {
        const rootPath = workspaceFolder.uri.fsPath;
        const gitPath = path.join(rootPath, '.git');
        if (!fs.existsSync(gitPath)) {
            return { isGitRepo: false, modifiedFiles: [] };
        }
        try {
            // This is a simplified version - in a real implementation,
            // you would use a git library like simple-git or isomorphic-git
            return {
                isGitRepo: true,
                currentBranch: 'main', // Would be detected from git
                modifiedFiles: [] // Would be detected from git status
            };
        }
        catch (error) {
            return { isGitRepo: true, modifiedFiles: [] };
        }
    }
    /**
     * Analyze file structure
     */
    async analyzeFileStructure(rootPath) {
        const sourceDirectories = [];
        const testDirectories = [];
        const configFiles = [];
        const fileTypes = {};
        let totalFiles = 0;
        const MAX_DEPTH = serviceConstants_1.WORKSPACE_ANALYSIS.MAX_DIRECTORY_DEPTH;
        const walkDir = (dirPath, depth = 0) => {
            if (depth > MAX_DEPTH) {
                return; // Prevent excessive recursion
            }
            try {
                const items = fs.readdirSync(dirPath);
                for (const item of items) {
                    if (item.startsWith('.') || serviceConstants_1.FILE_PATTERNS.IGNORE_PATTERNS.includes(item))
                        continue;
                    const fullPath = path.join(dirPath, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        const relativePath = path.relative(rootPath, fullPath);
                        if (serviceConstants_1.FILE_PATTERNS.TEST_DIRECTORIES.some(testDir => item.includes(testDir))) {
                            testDirectories.push(relativePath);
                        }
                        else if (serviceConstants_1.FILE_PATTERNS.SOURCE_DIRECTORIES.includes(item)) {
                            sourceDirectories.push(relativePath);
                        }
                        walkDir(fullPath, depth + 1);
                    }
                    else {
                        totalFiles++;
                        const ext = path.extname(item);
                        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
                        if (serviceConstants_1.FILE_PATTERNS.CONFIG_FILES.includes(item) || this.isConfigFile(item)) {
                            configFiles.push(path.relative(rootPath, fullPath));
                        }
                    }
                }
            }
            catch (error) {
                // Skip directories we can't read
            }
        };
        walkDir(rootPath);
        return {
            sourceDirectories,
            testDirectories,
            configFiles,
            totalFiles,
            fileTypes
        };
    }
    /**
     * Extract imports from a document
     */
    async extractImports(document) {
        const text = document.getText();
        const imports = [];
        // Simple regex patterns for common import statements
        const importPatterns = [
            /import\s+.*\s+from\s+['"]([^'"]+)['"]/g, // ES6 imports
            /import\s+['"]([^'"]+)['"]/g, // Side-effect imports
            /require\(['"]([^'"]+)['"]\)/g, // CommonJS requires
            /from\s+(['"][^'"]+['"])/g, // Python imports
        ];
        for (const pattern of importPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                imports.push(match[1]);
            }
        }
        return [...new Set(imports)]; // Remove duplicates
    }
    /**
     * Extract exports from a document
     */
    async extractExports(document) {
        const text = document.getText();
        const exports = [];
        const exportPatterns = [
            /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
            /export\s*\{\s*([^}]+)\s*\}/g,
        ];
        for (const pattern of exportPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[1].includes(',')) {
                    // Handle export { a, b, c }
                    exports.push(...match[1].split(',').map(s => s.trim()));
                }
                else {
                    exports.push(match[1]);
                }
            }
        }
        return [...new Set(exports)];
    }
    /**
     * Find related files
     */
    async findRelatedFiles(document, workspaceFolder) {
        const currentPath = document.uri.fsPath;
        const currentName = path.basename(currentPath, path.extname(currentPath));
        const currentDir = path.dirname(currentPath);
        const relatedFiles = [];
        // Look for test files
        const testPatterns = [
            `${currentName}.test.*`,
            `${currentName}.spec.*`,
            `${currentName}Test.*`,
            `${currentName}Spec.*`
        ];
        for (const pattern of testPatterns) {
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
            relatedFiles.push(...files.map(f => f.fsPath));
        }
        // Look for files with similar names
        const similarFiles = await vscode.workspace.findFiles(`**/${currentName}*.*`, '**/node_modules/**');
        relatedFiles.push(...similarFiles.map(f => f.fsPath).filter(f => f !== currentPath));
        return relatedFiles.slice(0, 10); // Limit to 10 related files
    }
    /**
     * Find usage examples
     */
    async findUsageExamples(document, workspaceFolder) {
        // This would search for usage patterns of exported functions/classes
        // For now, return empty array as this requires more complex analysis
        return [];
    }
    /**
     * Extract symbol context (function, class, namespace)
     */
    extractSymbolContext(lines, currentLine, languageId) {
        const functionPatterns = codeAnalysisUtils_1.CodeAnalysisUtils.getFunctionPatterns(languageId);
        const classPatterns = [
            /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
            /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
            /type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
        ];
        let functionName;
        let className;
        // Search backwards from current line to find containing symbols
        for (let i = currentLine; i >= Math.max(0, currentLine - serviceConstants_1.WORKSPACE_ANALYSIS.MAX_SYMBOL_SEARCH_DEPTH); i--) {
            const line = lines[i];
            // Check for function
            if (!functionName) {
                for (const pattern of functionPatterns) {
                    const match = line.match(pattern);
                    if (match) {
                        functionName = match[1];
                        break;
                    }
                }
            }
            // Check for class
            if (!className) {
                for (const pattern of classPatterns) {
                    const match = line.match(pattern);
                    if (match) {
                        className = match[1];
                        break;
                    }
                }
            }
            if (functionName && className)
                break;
        }
        return { functionName, className };
    }
    /**
     * Check if position is in a comment
     */
    isPositionInComment(lineUpToCursor, languageId) {
        if (languageId === 'python' || languageId === 'ruby') {
            return lineUpToCursor.includes('#');
        }
        else {
            return lineUpToCursor.includes('//') ||
                (lineUpToCursor.includes('/*') && !lineUpToCursor.includes('*/'));
        }
    }
    /**
     * Check if position is in a string
     */
    isPositionInString(lineUpToCursor) {
        const singleQuotes = (lineUpToCursor.match(/'/g) || []).length;
        const doubleQuotes = (lineUpToCursor.match(/"/g) || []).length;
        const backQuotes = (lineUpToCursor.match(/`/g) || []).length;
        return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1) || (backQuotes % 2 === 1);
    }
    /**
     * Check if file is a configuration file
     */
    isConfigFile(filename) {
        return filename.startsWith('.') ||
            filename.includes('config') ||
            filename.endsWith('.config.js') ||
            filename.endsWith('.config.ts');
    }
    /**
     * Log message to output channel
     */
    log(message) {
        if (this.outputChannel) {
            this.outputChannel.appendLine(`[WorkspaceAnalyzer] ${message}`);
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.contextCache.dispose();
        this.dependencyCache.dispose();
    }
}
exports.WorkspaceAnalyzer = WorkspaceAnalyzer;
//# sourceMappingURL=workspaceAnalyzer.js.map