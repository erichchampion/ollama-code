/**
 * Command System
 *
 * Provides a framework for registering, managing, and executing
 * CLI commands. Handles argument parsing, validation, and help text.
 */
import { CommandArgDef } from './types.js';
export { ArgType } from './types.js';
export type { CommandArgDef } from './types.js';
/**
 * Command definition
 */
export interface CommandDef {
    /**
     * Command name
     */
    name: string;
    /**
     * Command description
     */
    description: string;
    /**
     * Command usage examples
     */
    examples?: string[];
    /**
     * Command arguments
     */
    args?: CommandArgDef[];
    /**
     * Command handler function
     */
    handler: (args: Record<string, any>) => Promise<any>;
    /**
     * Command aliases
     */
    aliases?: string[];
    /**
     * Command category for grouping in help
     */
    category?: string;
    /**
     * Whether the command can be used in interactive mode
     */
    interactive?: boolean;
    /**
     * Whether to hide from help
     */
    hidden?: boolean;
}
/**
 * Command registry
 */
declare class CommandRegistry {
    private commands;
    private aliases;
    private initialized;
    /**
     * Register a command
     */
    register(command: CommandDef): void;
    /**
     * Get a command by name or alias
     */
    get(nameOrAlias: string): CommandDef | undefined;
    /**
     * List all commands
     */
    list(options?: {
        includeHidden?: boolean;
    }): CommandDef[];
    /**
     * Check if a command exists
     */
    exists(nameOrAlias: string): boolean;
    /**
     * Get command categories
     */
    getCategories(): string[];
    /**
     * Get commands by category
     */
    getByCategory(category: string, options?: {
        includeHidden?: boolean;
    }): CommandDef[];
    /**
     * Check if registry is initialized
     */
    isInitialized(): boolean;
    /**
     * Mark registry as initialized
     */
    markInitialized(): void;
    /**
     * Reset registry (for testing)
     */
    reset(): void;
}
export declare const commandRegistry: CommandRegistry;
/**
 * Parse command-line arguments
 */
export declare function parseArgs(args: string[], command: CommandDef): Record<string, any>;
/**
 * Generate help text for a command
 */
export declare function generateCommandHelp(command: CommandDef): string;
/**
 * Execute a command
 */
export declare function executeCommand(commandName: string, args: string[]): Promise<any>;
/**
 * Initialize the command processor
 *
 * @param config Configuration options
 * @param dependencies Application dependencies needed by commands
 */
export declare function initCommandProcessor(config: any, dependencies: {
    terminal: any;
    ai: any;
    codebase: any;
    fileOps: any;
    execution: any;
    errors: any;
}): Promise<any>;
declare const _default: {
    commandRegistry: CommandRegistry;
    parseArgs: typeof parseArgs;
    executeCommand: typeof executeCommand;
    generateCommandHelp: typeof generateCommandHelp;
};
export default _default;
