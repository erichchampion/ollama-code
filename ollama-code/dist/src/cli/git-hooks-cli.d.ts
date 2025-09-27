/**
 * Git Hooks CLI Integration
 *
 * Command-line interface for managing git hooks and executing
 * hook operations from git hook scripts.
 */
import { Command } from 'commander';
export declare class GitHooksCLI {
    private program;
    constructor();
    /**
     * Setup CLI commands for git hooks management
     */
    private setupCommands;
    /**
     * Install git hooks
     */
    private installHooks;
    /**
     * Uninstall git hooks
     */
    private uninstallHooks;
    /**
     * Show git hooks installation status
     */
    private showHooksStatus;
    /**
     * Execute a specific git hook
     */
    private executeHook;
    /**
     * Parse CLI arguments and execute commands
     */
    parse(argv: string[]): Promise<void>;
    /**
     * Get the commander program instance
     */
    getProgram(): Command;
}
/**
 * Create and configure git hooks CLI
 */
export declare function createGitHooksCLI(): GitHooksCLI;
/**
 * Execute git hooks CLI with provided arguments
 */
export declare function executeGitHooksCLI(argv: string[]): Promise<void>;
