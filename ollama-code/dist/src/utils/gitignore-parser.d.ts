/**
 * GitIgnore Parser Utility
 *
 * Parses .gitignore files and provides functionality to check if files/directories
 * should be ignored based on gitignore patterns.
 */
export interface GitIgnoreRule {
    pattern: string;
    isNegation: boolean;
    isDirectory: boolean;
    regex: RegExp;
}
export declare class GitIgnoreParser {
    private rules;
    private projectRoot;
    constructor(projectRoot: string);
    /**
     * Load and parse all .gitignore files in the project hierarchy
     */
    private loadGitIgnoreFiles;
    /**
     * Load global .gitignore file
     */
    private loadGlobalGitIgnore;
    /**
     * Parse .gitignore content into rules
     */
    private parseGitIgnoreContent;
    /**
     * Convert gitignore pattern to regular expression
     */
    private createRegexFromPattern;
    /**
     * Check if a file or directory should be ignored
     */
    isIgnored(filePath: string): boolean;
    /**
     * Get all ignore patterns as strings (for compatibility with existing systems)
     */
    getIgnorePatterns(): string[];
    /**
     * Check if a directory should be ignored
     */
    isDirectoryIgnored(dirPath: string): boolean;
    /**
     * Filter an array of file paths, removing ignored ones
     */
    filterIgnored(filePaths: string[]): string[];
    /**
     * Get debug information about loaded rules
     */
    getDebugInfo(): {
        ruleCount: number;
        rules: GitIgnoreRule[];
    };
    /**
     * Reload .gitignore files (useful if they change during execution)
     */
    reload(): void;
}
/**
 * Get or create a GitIgnoreParser for a project root
 */
export declare function getGitIgnoreParser(projectRoot: string): GitIgnoreParser;
/**
 * Clear the parser cache (useful for testing)
 */
export declare function clearParserCache(): void;
