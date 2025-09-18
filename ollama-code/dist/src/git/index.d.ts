/**
 * Git Integration Module
 *
 * Provides intelligent git operations with AI-powered features including:
 * - Smart commit message generation
 * - Automated PR descriptions
 * - Branch analysis and suggestions
 * - Conflict resolution assistance
 * - Code review preparation
 */
export interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    staged: string[];
    unstaged: string[];
    untracked: string[];
    conflicted: string[];
}
export interface GitCommit {
    hash: string;
    author: string;
    date: Date;
    message: string;
    files: string[];
}
export interface GitBranch {
    name: string;
    current: boolean;
    remote?: string;
    upstream?: string;
    lastCommit: string;
}
export interface CommitSuggestion {
    type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
    scope?: string;
    description: string;
    body?: string;
    breaking?: string;
    confidence: number;
}
export declare class GitManager {
    private workingDir;
    constructor(workingDir?: string);
    /**
     * Check if current directory is a git repository
     */
    isGitRepo(): Promise<boolean>;
    /**
     * Initialize git repository if not exists
     */
    initRepo(): Promise<void>;
    /**
     * Get detailed git status
     */
    getStatus(): Promise<GitStatus>;
    /**
     * Get recent commits
     */
    getRecentCommits(count?: number): Promise<GitCommit[]>;
    /**
     * Get all branches
     */
    getBranches(): Promise<GitBranch[]>;
    /**
     * Generate intelligent commit message suggestions
     */
    generateCommitMessage(): Promise<CommitSuggestion[]>;
    /**
     * Fallback commit message generation using patterns
     */
    private generateFallbackCommitSuggestions;
    /**
     * Create commit with AI-generated message
     */
    smartCommit(message?: string): Promise<void>;
    /**
     * Format commit suggestion as conventional commit message
     */
    private formatCommitMessage;
    /**
     * Generate pull request description
     */
    generatePRDescription(targetBranch?: string): Promise<string>;
    /**
     * Analyze conflicts and suggest resolutions
     */
    analyzeConflicts(): Promise<string[]>;
    /**
     * Extract conflict sections from file content
     */
    private extractConflictSections;
}
/**
 * Default git manager instance
 */
export declare const gitManager: GitManager;
