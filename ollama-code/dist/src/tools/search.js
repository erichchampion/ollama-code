/**
 * Search Tool
 *
 * Provides advanced search capabilities for text content, file names,
 * and project-wide searches with relevance ranking.
 */
import { promises as fs } from 'fs';
import { normalizeError } from '../utils/error-utils.js';
import path from 'path';
import { BaseTool } from './types.js';
import { logger } from '../utils/logger.js';
import { getGitIgnoreParser } from '../utils/gitignore-parser.js';
import { getDefaultExcludePatterns, globToRegex } from '../config/file-patterns.js';
export class SearchTool extends BaseTool {
    metadata = {
        name: 'search',
        description: 'Advanced search capabilities for text content and file names',
        category: 'core',
        version: '1.0.0',
        parameters: [
            {
                name: 'query',
                type: 'string',
                description: 'The search query',
                required: true
            },
            {
                name: 'path',
                type: 'string',
                description: 'The path to search in (default: current directory)',
                required: false,
                default: '.'
            },
            {
                name: 'type',
                type: 'string',
                description: 'Search type: content, filename, or both',
                required: false,
                default: 'content',
                validation: (value) => ['content', 'filename', 'both'].includes(value)
            },
            {
                name: 'filePattern',
                type: 'string',
                description: 'File pattern to filter search (e.g., *.ts, *.js)',
                required: false
            },
            {
                name: 'caseSensitive',
                type: 'boolean',
                description: 'Whether search should be case sensitive',
                required: false,
                default: false
            },
            {
                name: 'useRegex',
                type: 'boolean',
                description: 'Whether to treat query as regex pattern',
                required: false,
                default: false
            },
            {
                name: 'contextLines',
                type: 'number',
                description: 'Number of context lines to include around matches',
                required: false,
                default: 2
            },
            {
                name: 'maxResults',
                type: 'number',
                description: 'Maximum number of results to return',
                required: false,
                default: 100
            },
            {
                name: 'excludePatterns',
                type: 'array',
                description: 'Patterns to exclude from search (e.g., node_modules, .git)',
                required: false,
                default: 'getDefaultExcludePatterns()'
            },
            {
                name: 'respectGitIgnore',
                type: 'boolean',
                description: 'Whether to respect .gitignore files when searching (default: true)',
                required: false,
                default: true
            }
        ],
        examples: [
            {
                description: 'Search for function definitions in TypeScript files',
                parameters: {
                    query: 'function\\s+\\w+',
                    filePattern: '*.ts',
                    useRegex: true
                }
            },
            {
                description: 'Find all console.log statements',
                parameters: {
                    query: 'console.log',
                    type: 'content',
                    contextLines: 1
                }
            },
            {
                description: 'Search for files containing "test" in name',
                parameters: {
                    query: 'test',
                    type: 'filename'
                }
            }
        ]
    };
    async execute(parameters, context) {
        const startTime = Date.now();
        try {
            if (!this.validateParameters(parameters)) {
                return {
                    success: false,
                    error: 'Invalid parameters provided'
                };
            }
            const { query, path: searchPath = '.', type = 'content', filePattern, caseSensitive = false, useRegex = false, contextLines = 2, maxResults = 100, excludePatterns = getDefaultExcludePatterns(), respectGitIgnore = true } = parameters;
            const resolvedPath = path.resolve(context.workingDirectory, searchPath);
            // Security check
            if (!this.isPathSafe(resolvedPath, context.projectRoot)) {
                return {
                    success: false,
                    error: 'Search path is outside project boundaries'
                };
            }
            let searchRegex;
            try {
                if (useRegex) {
                    searchRegex = new RegExp(query, caseSensitive ? 'g' : 'gi');
                }
                else {
                    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    searchRegex = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
                }
            }
            catch (error) {
                return {
                    success: false,
                    error: `Invalid regex pattern: ${error}`
                };
            }
            const result = await this.performSearch(resolvedPath, {
                query,
                searchRegex,
                type,
                filePattern,
                contextLines,
                maxResults,
                excludePatterns,
                respectGitIgnore,
                projectRoot: context.projectRoot
            });
            return {
                success: true,
                data: result,
                metadata: {
                    executionTime: Date.now() - startTime,
                    resourcesUsed: {
                        filesSearched: result.filesSearched,
                        totalMatches: result.totalMatches
                    }
                }
            };
        }
        catch (error) {
            logger.error(`Search tool error: ${error}`);
            return {
                success: false,
                error: normalizeError(error).message,
                metadata: {
                    executionTime: Date.now() - startTime
                }
            };
        }
    }
    async performSearch(searchPath, options) {
        const matches = [];
        let filesSearched = 0;
        const startTime = Date.now();
        const filePatternRegex = options.filePattern
            ? new RegExp(options.filePattern.replace(/\*/g, '.*'))
            : null;
        // Set up gitignore parser if enabled
        let gitIgnoreParser = null;
        if (options.respectGitIgnore && options.projectRoot) {
            try {
                gitIgnoreParser = getGitIgnoreParser(options.projectRoot);
            }
            catch (error) {
                logger.warn('Failed to load .gitignore parser for searching', error);
            }
        }
        const excludeRegexes = options.excludePatterns.map(pattern => globToRegex(pattern));
        const shouldExclude = (filePath) => {
            // Check gitignore first (if enabled)
            if (gitIgnoreParser && gitIgnoreParser.isIgnored(filePath)) {
                return true;
            }
            // Check hardcoded patterns
            return excludeRegexes.some(regex => regex.test(filePath));
        };
        const searchDirectory = async (dirPath) => {
            if (matches.length >= options.maxResults)
                return;
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (matches.length >= options.maxResults)
                    break;
                const fullPath = path.join(dirPath, entry.name);
                const relativePath = path.relative(searchPath, fullPath);
                if (shouldExclude(relativePath))
                    continue;
                if (entry.isDirectory()) {
                    await searchDirectory(fullPath);
                }
                else if (entry.isFile()) {
                    // Check filename match if requested
                    if (options.type === 'filename' || options.type === 'both') {
                        if (options.searchRegex.test(entry.name)) {
                            matches.push({
                                file: relativePath,
                                line: 0,
                                column: 0,
                                content: entry.name,
                                context: { before: [], after: [] }
                            });
                        }
                    }
                    // Check file pattern
                    if (filePatternRegex && !filePatternRegex.test(entry.name)) {
                        continue;
                    }
                    // Search file content if requested
                    if (options.type === 'content' || options.type === 'both') {
                        await this.searchFileContent(fullPath, relativePath, options, matches);
                        filesSearched++;
                    }
                }
            }
        };
        await searchDirectory(searchPath);
        return {
            query: options.query,
            matches,
            totalMatches: matches.length,
            filesSearched,
            executionTime: Date.now() - startTime
        };
    }
    async searchFileContent(filePath, relativePath, options, matches) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (matches.length >= options.maxResults)
                    break;
                const line = lines[i];
                const match = options.searchRegex.exec(line);
                if (match) {
                    const contextBefore = lines.slice(Math.max(0, i - options.contextLines), i);
                    const contextAfter = lines.slice(i + 1, Math.min(lines.length, i + 1 + options.contextLines));
                    matches.push({
                        file: relativePath,
                        line: i + 1,
                        column: match.index + 1,
                        content: line,
                        context: {
                            before: contextBefore,
                            after: contextAfter
                        }
                    });
                }
                // Reset regex lastIndex to avoid issues with global regex
                options.searchRegex.lastIndex = 0;
            }
        }
        catch (error) {
            // Skip files that can't be read (binary files, permission issues, etc.)
            logger.debug(`Skipping file ${filePath}: ${error}`);
        }
    }
    isPathSafe(targetPath, projectRoot) {
        const resolved = path.resolve(targetPath);
        const root = path.resolve(projectRoot);
        return resolved.startsWith(root);
    }
}
//# sourceMappingURL=search.js.map