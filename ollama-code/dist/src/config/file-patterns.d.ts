/**
 * Centralized File Pattern Management
 *
 * Provides a single source of truth for file patterns used throughout the application,
 * eliminating duplication and ensuring consistency across all tools and analyzers.
 */
/**
 * Get the default exclude patterns from centralized configuration
 * These patterns are used to filter out files and directories during analysis
 */
export declare function getDefaultExcludePatterns(): string[];
/**
 * Convert a glob pattern to a regular expression
 * Centralizes the logic for pattern conversion used across multiple tools
 */
export declare function globToRegex(pattern: string): RegExp;
/**
 * Convert an array of glob patterns to regex patterns
 */
export declare function globPatternsToRegexes(patterns: string[]): RegExp[];
/**
 * Check if a path matches any of the exclude patterns
 */
export declare function isPathExcluded(path: string, patterns: string[]): boolean;
/**
 * Get high priority file patterns (files that should be analyzed first)
 */
export declare function getHighPriorityPatterns(): string[];
/**
 * Get include patterns (file types to include in analysis)
 */
export declare function getIncludePatterns(): string[];
/**
 * Check if a file should be included based on include patterns
 */
export declare function shouldIncludeFile(filePath: string): boolean;
/**
 * Get a compact list of exclude patterns suitable for display or command-line use
 */
export declare function getCompactExcludePatterns(): string[];
