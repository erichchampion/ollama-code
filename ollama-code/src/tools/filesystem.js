"use strict";
/**
 * File System Tool
 *
 * Provides comprehensive file system operations with enhanced capabilities
 * for reading, writing, searching, and managing files and directories.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemTool = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const types_js_1 = require("./types.js");
const logger_js_1 = require("../utils/logger.js");
const gitignore_parser_js_1 = require("../utils/gitignore-parser.js");
const file_patterns_js_1 = require("../config/file-patterns.js");
class FileSystemTool extends types_js_1.BaseTool {
    constructor() {
        super(...arguments);
        this.metadata = {
            name: 'filesystem',
            description: 'Comprehensive file system operations for reading, writing, and managing files',
            category: 'core',
            version: '1.0.0',
            parameters: [
                {
                    name: 'operation',
                    type: 'string',
                    description: 'The file operation to perform',
                    required: true,
                    validation: (value) => ['read', 'write', 'list', 'create', 'delete', 'search', 'exists'].includes(value)
                },
                {
                    name: 'path',
                    type: 'string',
                    description: 'The file or directory path',
                    required: true
                },
                {
                    name: 'content',
                    type: 'string',
                    description: 'Content to write (for write operations)',
                    required: false
                },
                {
                    name: 'encoding',
                    type: 'string',
                    description: 'File encoding (default: utf8)',
                    required: false,
                    default: 'utf8'
                },
                {
                    name: 'pattern',
                    type: 'string',
                    description: 'Search pattern for file searches',
                    required: false
                },
                {
                    name: 'recursive',
                    type: 'boolean',
                    description: 'Whether to perform recursive operations',
                    required: false,
                    default: false
                },
                {
                    name: 'createBackup',
                    type: 'boolean',
                    description: 'Create backup before writing (default: true)',
                    required: false,
                    default: true
                },
                {
                    name: 'excludePatterns',
                    type: 'array',
                    description: 'Patterns to exclude from listing/searching (e.g., .git, node_modules)',
                    required: false,
                    default: 'getDefaultExcludePatterns()'
                },
                {
                    name: 'respectGitIgnore',
                    type: 'boolean',
                    description: 'Whether to respect .gitignore files when listing/searching (default: true)',
                    required: false,
                    default: true
                }
            ],
            examples: [
                {
                    description: 'Read a file',
                    parameters: { operation: 'read', path: 'src/index.ts' }
                },
                {
                    description: 'Write content to file with backup',
                    parameters: {
                        operation: 'write',
                        path: 'src/new-file.ts',
                        content: 'console.log("Hello");',
                        createBackup: true
                    }
                },
                {
                    description: 'List directory contents recursively',
                    parameters: { operation: 'list', path: 'src', recursive: true }
                },
                {
                    description: 'Search for files matching pattern',
                    parameters: { operation: 'search', path: 'src', pattern: '*.ts', recursive: true }
                }
            ]
        };
    }
    async execute(parameters, context) {
        const startTime = Date.now();
        try {
            if (!this.validateParameters(parameters)) {
                return {
                    success: false,
                    error: 'Invalid parameters provided'
                };
            }
            const { operation, path: filePath } = parameters;
            const resolvedPath = path_1.default.resolve(context.workingDirectory, filePath);
            // Security check: ensure path is within project boundaries
            if (!this.isPathSafe(resolvedPath, context.projectRoot)) {
                return {
                    success: false,
                    error: 'Path is outside project boundaries'
                };
            }
            let result;
            switch (operation) {
                case 'read':
                    result = await this.readFile(resolvedPath, parameters.encoding || 'utf8');
                    break;
                case 'write':
                    result = await this.writeFile(resolvedPath, parameters.content || '', {
                        encoding: parameters.encoding || 'utf8',
                        createBackup: parameters.createBackup !== false
                    });
                    break;
                case 'list':
                    result = await this.listDirectory(resolvedPath, parameters.recursive || false, parameters.excludePatterns || (0, file_patterns_js_1.getDefaultExcludePatterns)(), parameters.respectGitIgnore !== false, context.projectRoot);
                    break;
                case 'create':
                    result = await this.createPath(resolvedPath);
                    break;
                case 'delete':
                    result = await this.deletePath(resolvedPath);
                    break;
                case 'search':
                    result = await this.searchFiles(resolvedPath, parameters.pattern, parameters.recursive || false, parameters.excludePatterns || (0, file_patterns_js_1.getDefaultExcludePatterns)(), parameters.respectGitIgnore !== false, context.projectRoot);
                    break;
                case 'exists':
                    result = await this.pathExists(resolvedPath);
                    break;
                default:
                    return {
                        success: false,
                        error: `Unknown operation: ${operation}`
                    };
            }
            return {
                success: true,
                data: result,
                metadata: {
                    executionTime: Date.now() - startTime,
                    resourcesUsed: { operation, path: resolvedPath }
                }
            };
        }
        catch (error) {
            logger_js_1.logger.error(`FileSystem tool error: ${error}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    executionTime: Date.now() - startTime
                }
            };
        }
    }
    async readFile(filePath, encoding) {
        const stats = await fs_1.promises.stat(filePath);
        const content = await fs_1.promises.readFile(filePath, encoding);
        return {
            content,
            size: stats.size,
            modified: stats.mtime,
            encoding
        };
    }
    async writeFile(filePath, content, options) {
        // Create backup if file exists and backup is requested
        if (options.createBackup && await this.pathExists(filePath)) {
            const backupPath = `${filePath}.backup.${Date.now()}`;
            await fs_1.promises.copyFile(filePath, backupPath);
            logger_js_1.logger.debug(`Created backup: ${backupPath}`);
        }
        // Ensure directory exists
        const dir = path_1.default.dirname(filePath);
        await fs_1.promises.mkdir(dir, { recursive: true });
        // Write file
        await fs_1.promises.writeFile(filePath, content, options.encoding);
        const stats = await fs_1.promises.stat(filePath);
        return {
            path: filePath,
            size: stats.size,
            written: new Date()
        };
    }
    async listDirectory(dirPath, recursive, excludePatterns = [], respectGitIgnore = true, projectRoot) {
        const items = [];
        // Set up gitignore parser if enabled
        let gitIgnoreParser = null;
        if (respectGitIgnore && projectRoot) {
            try {
                gitIgnoreParser = (0, gitignore_parser_js_1.getGitIgnoreParser)(projectRoot);
            }
            catch (error) {
                logger_js_1.logger.warn('Failed to load .gitignore parser for listing', error);
            }
        }
        // Create exclude regexes
        const excludeRegexes = excludePatterns.map(pattern => (0, file_patterns_js_1.globToRegex)(pattern));
        const shouldExclude = (filePath) => {
            // Check gitignore first (if enabled)
            if (gitIgnoreParser && gitIgnoreParser.isIgnored(filePath)) {
                return true;
            }
            // Check hardcoded patterns
            return excludeRegexes.some(regex => regex.test(filePath));
        };
        const processDirectory = async (currentPath) => {
            const entries = await fs_1.promises.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(currentPath, entry.name);
                const relativePath = path_1.default.relative(dirPath, fullPath);
                // Skip excluded paths
                if (shouldExclude(fullPath) || shouldExclude(relativePath) || shouldExclude(entry.name)) {
                    continue;
                }
                if (entry.isDirectory()) {
                    items.push({
                        name: entry.name,
                        path: relativePath,
                        type: 'directory',
                        isDirectory: true,
                        isFile: false
                    });
                    if (recursive) {
                        await processDirectory(fullPath);
                    }
                }
                else {
                    const stats = await fs_1.promises.stat(fullPath);
                    items.push({
                        name: entry.name,
                        path: relativePath,
                        type: 'file',
                        isDirectory: false,
                        isFile: true,
                        size: stats.size,
                        modified: stats.mtime
                    });
                }
            }
        };
        await processDirectory(dirPath);
        return items;
    }
    async createPath(targetPath) {
        await fs_1.promises.mkdir(targetPath, { recursive: true });
        return { created: targetPath };
    }
    async deletePath(targetPath) {
        const stats = await fs_1.promises.stat(targetPath);
        if (stats.isDirectory()) {
            await fs_1.promises.rm(targetPath, { recursive: true, force: true });
        }
        else {
            await fs_1.promises.unlink(targetPath);
        }
        return { deleted: targetPath };
    }
    async searchFiles(dirPath, pattern, recursive = false, excludePatterns = [], respectGitIgnore = true, projectRoot) {
        const matches = [];
        const regex = pattern ? new RegExp(pattern.replace(/\*/g, '.*')) : null;
        // Set up gitignore parser if enabled
        let gitIgnoreParser = null;
        if (respectGitIgnore && projectRoot) {
            try {
                gitIgnoreParser = (0, gitignore_parser_js_1.getGitIgnoreParser)(projectRoot);
            }
            catch (error) {
                logger_js_1.logger.warn('Failed to load .gitignore parser for searching', error);
            }
        }
        // Create exclude regexes
        const excludeRegexes = excludePatterns.map(pattern => (0, file_patterns_js_1.globToRegex)(pattern));
        const shouldExclude = (filePath) => {
            // Check gitignore first (if enabled)
            if (gitIgnoreParser && gitIgnoreParser.isIgnored(filePath)) {
                return true;
            }
            // Check hardcoded patterns
            return excludeRegexes.some(regex => regex.test(filePath));
        };
        const searchDirectory = async (currentPath) => {
            const entries = await fs_1.promises.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(currentPath, entry.name);
                const relativePath = path_1.default.relative(dirPath, fullPath);
                // Skip excluded paths
                if (shouldExclude(fullPath) || shouldExclude(relativePath) || shouldExclude(entry.name)) {
                    continue;
                }
                if (entry.isFile()) {
                    if (!regex || regex.test(entry.name)) {
                        const stats = await fs_1.promises.stat(fullPath);
                        matches.push({
                            name: entry.name,
                            path: relativePath,
                            fullPath,
                            size: stats.size,
                            modified: stats.mtime
                        });
                    }
                }
                else if (entry.isDirectory() && recursive) {
                    await searchDirectory(fullPath);
                }
            }
        };
        await searchDirectory(dirPath);
        return matches;
    }
    async pathExists(targetPath) {
        try {
            await fs_1.promises.access(targetPath);
            return true;
        }
        catch {
            return false;
        }
    }
    isPathSafe(targetPath, projectRoot) {
        const resolved = path_1.default.resolve(targetPath);
        const root = path_1.default.resolve(projectRoot);
        return resolved.startsWith(root);
    }
}
exports.FileSystemTool = FileSystemTool;
//# sourceMappingURL=filesystem.js.map