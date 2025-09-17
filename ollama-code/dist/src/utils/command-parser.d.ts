/**
 * Command Input Parser
 *
 * Provides utilities for parsing command-line input, handling quoted strings
 * and argument separation properly.
 */
/**
 * Parse command input string, respecting quoted arguments
 *
 * @param input - Raw command input string
 * @returns Array of parsed arguments
 *
 * @example
 * parseCommandInput('ask "How do I implement a binary search?"')
 * // Returns: ['ask', 'How do I implement a binary search?']
 *
 * parseCommandInput("generate 'a REST API' --output server.js")
 * // Returns: ['generate', 'a REST API', '--output', 'server.js']
 */
export declare function parseCommandInput(input: string): string[];
/**
 * Escape a string for safe command-line usage
 *
 * @param input - String to escape
 * @returns Escaped string with quotes if needed
 */
export declare function escapeCommandArgument(input: string): string;
/**
 * Join command arguments back into a command string
 *
 * @param args - Array of command arguments
 * @returns Properly escaped command string
 */
export declare function joinCommandArguments(args: string[]): string;
