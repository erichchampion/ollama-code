/**
 * Project Context Management
 *
 * Manages project-wide context including file dependencies, structure analysis,
 * conversation history, and context window optimization for AI interactions.
 */
import { watch } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { toolRegistry } from '../tools/index.js';
import { MAX_FILES_FOR_ANALYSIS, MAX_FILES_LIMIT, MAX_CONVERSATION_HISTORY, MAX_FILE_WATCHERS } from '../constants.js';
export class ProjectContext {
    projectRoot;
    structure;
    conversationHistory = [];
    contextWindow;
    fileWatchers = new Map();
    constructor(projectRoot, maxTokens = 32000) {
        this.projectRoot = path.resolve(projectRoot);
        this.structure = {
            root: this.projectRoot,
            files: new Map(),
            directories: [],
            dependencies: new Map(),
            entryPoints: [],
            configFiles: [],
            testFiles: [],
            documentationFiles: []
        };
        this.contextWindow = {
            maxTokens,
            currentTokens: 0,
            files: [],
            conversation: [],
            priorityContent: [],
            lastOptimized: new Date()
        };
    }
    /**
     * Initialize project context by analyzing project structure
     */
    async initialize() {
        logger.info(`Initializing project context for: ${this.projectRoot}`);
        try {
            await this.analyzeProjectStructure();
            await this.detectDependencies();
            this.setupFileWatchers();
            logger.info('Project context initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize project context:', error);
            throw error;
        }
    }
    /**
     * Analyze project structure and categorize files
     */
    async analyzeProjectStructure() {
        const filesystem = toolRegistry.get('filesystem');
        if (!filesystem) {
            throw new Error('Filesystem tool not available');
        }
        // Get all files recursively
        const result = await filesystem.execute({
            operation: 'list',
            path: this.projectRoot,
            recursive: true
        }, {
            projectRoot: this.projectRoot,
            workingDirectory: this.projectRoot,
            environment: process.env,
            timeout: 30000
        });
        if (!result.success) {
            throw new Error(`Failed to analyze project structure: ${result.error}`);
        }
        // Process files and categorize them
        for (const item of result.data) {
            const fullPath = path.join(this.projectRoot, item.path);
            const fileInfo = {
                path: fullPath,
                relativePath: item.path,
                size: item.size || 0,
                modified: new Date(item.modified || Date.now()),
                type: item.isDirectory ? 'directory' : 'file'
            };
            if (item.isDirectory) {
                this.structure.directories.push(item.path);
            }
            else {
                // Determine file type and language
                const ext = path.extname(item.name).toLowerCase();
                fileInfo.language = this.detectLanguage(ext);
                // Categorize special files
                this.categorizeFile(item.path, item.name);
                this.structure.files.set(item.path, fileInfo);
            }
        }
        logger.debug(`Analyzed ${this.structure.files.size} files in project structure`);
    }
    /**
     * Detect programming language from file extension
     */
    detectLanguage(extension) {
        const langMap = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.kt': 'kotlin',
            '.scala': 'scala',
            '.swift': 'swift',
            '.dart': 'dart',
            '.vue': 'vue',
            '.svelte': 'svelte',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.less': 'less',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.toml': 'toml',
            '.md': 'markdown',
            '.sh': 'bash',
            '.ps1': 'powershell',
            '.sql': 'sql'
        };
        return langMap[extension];
    }
    /**
     * Categorize files into special groups
     */
    categorizeFile(relativePath, filename) {
        const lowerName = filename.toLowerCase();
        const isConfig = [
            'package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.js',
            '.env', '.gitignore', 'dockerfile', 'docker-compose.yml',
            'jest.config.js', '.eslintrc', '.prettierrc'
        ].some(pattern => lowerName.includes(pattern.toLowerCase()));
        const isTest = [
            '.test.', '.spec.', '__tests__', '__test__'
        ].some(pattern => lowerName.includes(pattern));
        const isDoc = [
            'readme', 'changelog', 'license', 'contributing', 'docs/'
        ].some(pattern => lowerName.includes(pattern.toLowerCase()) || relativePath.toLowerCase().includes(pattern));
        const isEntry = [
            'index.', 'main.', 'app.', 'server.', 'client.'
        ].some(pattern => lowerName.startsWith(pattern));
        if (isConfig)
            this.structure.configFiles.push(relativePath);
        if (isTest)
            this.structure.testFiles.push(relativePath);
        if (isDoc)
            this.structure.documentationFiles.push(relativePath);
        if (isEntry)
            this.structure.entryPoints.push(relativePath);
    }
    /**
     * Detect file dependencies by analyzing imports/requires
     */
    async detectDependencies() {
        const filesystem = toolRegistry.get('filesystem');
        if (!filesystem)
            return;
        // Analyze key files for dependencies
        const filesToAnalyze = Array.from(this.structure.files.keys())
            .filter(file => {
            const fileInfo = this.structure.files.get(file);
            return fileInfo?.language && ['typescript', 'javascript', 'python'].includes(fileInfo.language);
        })
            .slice(0, MAX_FILES_FOR_ANALYSIS); // Limit analysis to avoid overwhelming
        for (const filePath of filesToAnalyze) {
            try {
                const result = await filesystem.execute({
                    operation: 'read',
                    path: filePath
                }, {
                    projectRoot: this.projectRoot,
                    workingDirectory: this.projectRoot,
                    environment: process.env,
                    timeout: 10000
                });
                if (result.success) {
                    const fileInfo = this.structure.files.get(filePath);
                    if (fileInfo) {
                        const dependencies = this.extractDependencies(result.data.content, fileInfo.language);
                        fileInfo.imports = dependencies.imports;
                        fileInfo.exports = dependencies.exports;
                        fileInfo.dependencies = dependencies.dependencies;
                        this.structure.dependencies.set(filePath, dependencies.dependencies);
                    }
                }
            }
            catch (error) {
                logger.debug(`Failed to analyze dependencies for ${filePath}:`, error);
            }
        }
    }
    /**
     * Extract imports, exports, and dependencies from file content
     */
    extractDependencies(content, language) {
        const imports = [];
        const exports = [];
        const dependencies = [];
        if (!language)
            return { imports, exports, dependencies };
        try {
            if (language === 'typescript' || language === 'javascript') {
                // Extract ES6 imports
                const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    imports.push(match[1]);
                    if (!match[1].startsWith('.')) {
                        dependencies.push(match[1]);
                    }
                }
                // Extract CommonJS requires
                const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
                while ((match = requireRegex.exec(content)) !== null) {
                    imports.push(match[1]);
                    if (!match[1].startsWith('.')) {
                        dependencies.push(match[1]);
                    }
                }
                // Extract exports
                const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
                while ((match = exportRegex.exec(content)) !== null) {
                    exports.push(match[1]);
                }
            }
            else if (language === 'python') {
                // Extract Python imports
                const importRegex = /(?:^|\n)\s*(?:from\s+(\S+)\s+)?import\s+([^\n;]+)/g;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    const module = match[1] || match[2].split(',')[0].trim();
                    imports.push(module);
                    if (!module.startsWith('.')) {
                        dependencies.push(module);
                    }
                }
            }
        }
        catch (error) {
            logger.debug('Error extracting dependencies:', error);
        }
        return { imports, exports, dependencies };
    }
    /**
     * Setup file watchers for real-time updates
     */
    setupFileWatchers() {
        try {
            // Watch key configuration files for changes
            const watchFiles = [
                ...this.structure.configFiles,
                ...this.structure.entryPoints
            ].slice(0, MAX_FILE_WATCHERS); // Limit number of watchers
            for (const file of watchFiles) {
                try {
                    const fullPath = path.join(this.projectRoot, file);
                    const watcher = watch(fullPath, (eventType) => {
                        if (eventType === 'change') {
                            this.handleFileChange(file);
                        }
                    });
                    this.fileWatchers.set(file, watcher);
                }
                catch (error) {
                    logger.debug(`Failed to watch file ${file}:`, error);
                }
            }
        }
        catch (error) {
            logger.error('Error setting up file watchers:', error);
            // Cleanup any partial watchers that were created
            this.cleanup();
            throw error;
        }
        logger.debug(`Setup ${this.fileWatchers.size} file watchers`);
    }
    /**
     * Handle file change events
     */
    handleFileChange(filePath) {
        logger.debug(`File changed: ${filePath}`);
        // Invalidate context for this file
        this.invalidateFileContext(filePath);
    }
    /**
     * Add conversation turn to history
     */
    addConversationTurn(turn) {
        this.conversationHistory.push(turn);
        this.contextWindow.conversation.push(turn);
        this.optimizeContextWindow();
    }
    /**
     * Get relevant context for a given query
     */
    async getRelevantContext(query, maxTokens) {
        const targetTokens = maxTokens || this.contextWindow.maxTokens * 0.8;
        // Find relevant files based on query
        const relevantFiles = this.findRelevantFiles(query);
        // Get recent conversation context
        const recentConversation = this.conversationHistory.slice(-MAX_CONVERSATION_HISTORY);
        // Calculate token usage (simplified)
        const totalTokens = this.estimateTokens(relevantFiles, recentConversation);
        return {
            files: relevantFiles.slice(0, MAX_FILES_LIMIT), // Limit files
            conversation: recentConversation,
            structure: this.structure,
            totalTokens
        };
    }
    /**
     * Find files relevant to the query
     */
    findRelevantFiles(query) {
        const queryLower = query.toLowerCase();
        const relevantFiles = [];
        for (const [filePath, fileInfo] of this.structure.files) {
            let score = 0;
            // Check if file path matches query
            if (fileInfo.relativePath.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            // Check if it's a key file type
            if (this.structure.entryPoints.includes(fileInfo.relativePath)) {
                score += 3;
            }
            // Recently modified files get higher score
            const daysSinceModified = (Date.now() - fileInfo.modified.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceModified < 1)
                score += 2;
            else if (daysSinceModified < 7)
                score += 1;
            if (score > 0) {
                relevantFiles.push({ file: fileInfo, score });
            }
        }
        // Sort by relevance score
        relevantFiles.sort((a, b) => b.score - a.score);
        return relevantFiles.map(item => item.file);
    }
    /**
     * Estimate token count (simplified)
     */
    estimateTokens(files, conversation) {
        let tokens = 0;
        // Estimate file tokens (rough: 1 token per 4 characters)
        for (const file of files) {
            tokens += Math.ceil(file.size / 4);
        }
        // Estimate conversation tokens
        for (const turn of conversation) {
            tokens += Math.ceil((turn.userMessage.length + turn.assistantResponse.length) / 4);
        }
        return tokens;
    }
    /**
     * Optimize context window to fit within token limits
     */
    optimizeContextWindow() {
        // Remove old conversation turns if needed
        while (this.contextWindow.conversation.length > 10) {
            this.contextWindow.conversation.shift();
        }
        // Update optimization timestamp
        this.contextWindow.lastOptimized = new Date();
    }
    /**
     * Invalidate context for a specific file
     */
    invalidateFileContext(filePath) {
        // Remove file from context window
        this.contextWindow.files = this.contextWindow.files.filter(file => file.relativePath !== filePath);
        // Re-analyze file if it exists
        const fileInfo = this.structure.files.get(filePath);
        if (fileInfo) {
            // Mark for re-analysis
            fileInfo.modified = new Date();
        }
    }
    /**
     * Get project summary
     */
    getProjectSummary() {
        const languages = Array.from(new Set(Array.from(this.structure.files.values())
            .map(file => file.language)
            .filter(Boolean)));
        const recentFiles = Array.from(this.structure.files.values())
            .filter(file => Date.now() - file.modified.getTime() < 24 * 60 * 60 * 1000)
            .map(file => file.relativePath);
        return {
            fileCount: this.structure.files.size,
            languages: languages,
            structure: this.generateStructureOverview(),
            entryPoints: this.structure.entryPoints,
            recentActivity: recentFiles
        };
    }
    /**
     * Generate a text overview of project structure
     */
    generateStructureOverview() {
        const dirs = this.structure.directories.slice(0, MAX_FILES_LIMIT);
        const files = this.structure.configFiles.concat(this.structure.entryPoints).slice(0, MAX_FILES_LIMIT);
        return `
Directories: ${dirs.join(', ')}
Key Files: ${files.join(', ')}
Total Files: ${this.structure.files.size}
`.trim();
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        // Close file watchers
        for (const watcher of this.fileWatchers.values()) {
            watcher.close();
        }
        this.fileWatchers.clear();
        logger.debug('Project context cleanup completed');
    }
    // Getter methods for accessing private properties
    get root() {
        return this.projectRoot;
    }
    get allFiles() {
        return Array.from(this.structure.files.values());
    }
    get projectLanguages() {
        const files = Array.from(this.structure.files.values());
        return [...new Set(files.map(f => f.language).filter(Boolean))];
    }
}
//# sourceMappingURL=context.js.map