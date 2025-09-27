/**
 * Secure Git Command Executor
 *
 * Provides safe execution of git commands with input sanitization
 * and protection against command injection vulnerabilities.
 */
export interface GitExecOptions {
    cwd: string;
    timeout?: number;
    maxBuffer?: number;
}
export interface GitCommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export declare class GitCommandExecutor {
    private static readonly ALLOWED_GIT_COMMANDS;
    private static readonly SAFE_FLAGS;
    /**
     * Execute a git command safely with input sanitization
     */
    static execute(command: string, args: string[] | undefined, options: GitExecOptions): Promise<GitCommandResult>;
    /**
     * Convenience method for git log with file path
     */
    static getFileHistory(filePath: string, options: GitExecOptions, extraArgs?: string[]): Promise<GitCommandResult>;
    /**
     * Convenience method for git show with commit hash
     */
    static showCommit(commitHash: string, options: GitExecOptions, extraArgs?: string[]): Promise<GitCommandResult>;
    /**
     * Convenience method for git status
     */
    static getStatus(options: GitExecOptions): Promise<GitCommandResult>;
    /**
     * Convenience method for git diff
     */
    static getDiff(options: GitExecOptions, cached?: boolean, extraArgs?: string[]): Promise<GitCommandResult>;
    /**
     * Sanitize command arguments to prevent injection
     */
    private static sanitizeArguments;
    /**
     * Sanitize file path to prevent directory traversal
     */
    private static sanitizeFilePath;
    /**
     * Sanitize commit hash
     */
    private static sanitizeCommitHash;
    /**
     * Sanitize repository path
     */
    private static sanitizeRepositoryPath;
    /**
     * Check if a path is a valid git repository
     */
    static isGitRepository(repoPath: string): Promise<boolean>;
    /**
     * Get repository information safely
     */
    static getRepositoryInfo(repoPath: string): Promise<{
        remoteUrl: string;
        currentBranch: string;
    }>;
}
