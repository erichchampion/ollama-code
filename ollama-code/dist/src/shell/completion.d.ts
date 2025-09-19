/**
 * Shell Completion System
 *
 * Provides shell integration and auto-completion for:
 * - Command names and arguments
 * - File paths and project structure
 * - Git branches and commit references
 * - Configuration keys and values
 * - Context-aware suggestions
 */
export interface CompletionItem {
    word: string;
    description?: string;
    type: 'command' | 'argument' | 'file' | 'option' | 'value';
    category?: string;
}
export interface CompletionContext {
    line: string;
    point: number;
    words: string[];
    currentWord: string;
    previousWord: string;
    commandName?: string;
}
export declare class ShellCompletion {
    /**
     * Generate completions for the current context
     */
    getCompletions(context: CompletionContext): Promise<CompletionItem[]>;
    /**
     * Generate bash completion script
     */
    generateBashCompletion(): string;
    /**
     * Generate zsh completion script
     */
    generateZshCompletion(): string;
    /**
     * Generate fish completion script
     */
    generateFishCompletion(): string;
    /**
     * Get command name completions
     */
    private getCommandCompletions;
    /**
     * Get argument completions for current command
     */
    private getArgumentCompletions;
    /**
     * Get option completions (flags)
     */
    private getOptionCompletions;
    /**
     * Get file path completions
     */
    private getFileCompletions;
    /**
     * Get model name completions
     */
    private getModelCompletions;
    /**
     * Get git branch completions
     */
    private getBranchCompletions;
    /**
     * Get contextual completions based on current command and environment
     */
    private getContextualCompletions;
    /**
     * Get git file completions (modified, staged, etc.)
     */
    private getGitFileCompletions;
    /**
     * Check if we're completing a command name
     */
    private isCompletingCommand;
    /**
     * Check if we're completing an argument
     */
    private isCompletingArgument;
    /**
     * Check if we're completing an option/flag
     */
    private isCompletingOption;
    /**
     * Check if we're completing a file path
     */
    private isCompletingFile;
    /**
     * Remove duplicate completions
     */
    private deduplicateCompletions;
    /**
     * Format completions for shell output
     */
    formatForShell(completions: CompletionItem[]): string;
    /**
     * Install shell completion for current shell
     */
    installCompletion(shell: 'bash' | 'zsh' | 'fish'): Promise<string>;
}
/**
 * Default shell completion instance
 */
export declare const shellCompletion: ShellCompletion;
