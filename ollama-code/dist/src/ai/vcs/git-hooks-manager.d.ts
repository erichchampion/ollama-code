/**
 * Git Hooks Manager
 *
 * Automated installation and management of git hooks for AI-powered
 * code analysis, commit enhancement, and quality tracking.
 */
export interface GitHooksConfig {
    repositoryPath: string;
    enablePreCommit: boolean;
    enableCommitMsg: boolean;
    enablePrePush: boolean;
    enablePostMerge: boolean;
    enableQualityGates: boolean;
    bypassEnabled: boolean;
    analysisTimeout: number;
    failOnAnalysisError: boolean;
    backupExistingHooks: boolean;
    customHookPaths?: {
        preCommit?: string;
        commitMsg?: string;
        prePush?: string;
        postMerge?: string;
    };
}
export interface HookExecutionContext {
    hookType: GitHookType;
    repositoryPath: string;
    bypassRequested: boolean;
    environment: Record<string, string>;
    arguments: string[];
}
export interface HookExecutionResult {
    success: boolean;
    exitCode: number;
    output: string;
    error?: string;
    executionTime: number;
    analysisResults?: any;
}
export type GitHookType = 'pre-commit' | 'commit-msg' | 'pre-push' | 'post-merge';
export declare class GitHooksManager {
    private config;
    private vcsIntelligence;
    private commitGenerator;
    private regressionAnalyzer;
    private qualityTracker;
    private hooksPath;
    constructor(config: GitHooksConfig);
    /**
     * Install all configured git hooks
     */
    installHooks(): Promise<void>;
    /**
     * Uninstall all ollama-code git hooks
     */
    uninstallHooks(): Promise<void>;
    /**
     * Execute pre-commit hook analysis
     */
    executePreCommitHook(context: HookExecutionContext): Promise<HookExecutionResult>;
    /**
     * Execute commit message enhancement
     */
    executeCommitMsgHook(context: HookExecutionContext): Promise<HookExecutionResult>;
    /**
     * Execute pre-push regression analysis
     */
    executePrePushHook(context: HookExecutionContext): Promise<HookExecutionResult>;
    /**
     * Execute post-merge quality tracking
     */
    executePostMergeHook(context: HookExecutionContext): Promise<HookExecutionResult>;
    /**
     * Install pre-commit hook
     */
    private installPreCommitHook;
    /**
     * Install commit-msg hook
     */
    private installCommitMsgHook;
    /**
     * Install pre-push hook
     */
    private installPrePushHook;
    /**
     * Install post-merge hook
     */
    private installPostMergeHook;
    /**
     * Generate pre-commit hook script
     */
    private generatePreCommitScript;
    /**
     * Generate commit-msg hook script
     */
    private generateCommitMsgScript;
    /**
     * Generate pre-push hook script
     */
    private generatePrePushScript;
    /**
     * Generate post-merge hook script
     */
    private generatePostMergeScript;
    /**
     * Ensure hooks directory exists
     */
    private ensureHooksDirectory;
    /**
     * Backup existing hooks
     */
    private backupExistingHooks;
    /**
     * Restore backed up hooks
     */
    private restoreBackedUpHooks;
    /**
     * Find critical issues in analysis results
     */
    private findCriticalIssues;
    /**
     * Check if commit message enhancement should be skipped
     */
    private shouldSkipCommitEnhancement;
}
/**
 * Default git hooks configuration
 */
export declare const DEFAULT_GIT_HOOKS_CONFIG: Partial<GitHooksConfig>;
