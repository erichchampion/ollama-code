/**
 * Git Integration for Change Tracking
 *
 * Provides git-based change detection for the incremental knowledge graph.
 * Integrates with git history to identify modified files, track commits,
 * and provide intelligent change analysis based on git diffs.
 */
import { FileChange } from './incremental-knowledge-graph.js';
export interface GitCommitInfo {
    hash: string;
    author: string;
    email: string;
    date: Date;
    message: string;
    files: GitFileChange[];
}
export interface GitFileChange {
    path: string;
    status: 'A' | 'M' | 'D' | 'R' | 'C';
    insertions: number;
    deletions: number;
    oldPath?: string;
}
export interface GitTrackingConfig {
    repositoryPath: string;
    trackingMode: 'since_commit' | 'since_date' | 'working_directory';
    sinceCommit?: string;
    sinceDate?: Date;
    includeUntracked: boolean;
    excludePatterns: string[];
    maxCommits?: number;
}
/**
 * Git-based change tracking for incremental knowledge graph updates
 */
export declare class GitChangeTracker {
    private config;
    private lastProcessedCommit;
    constructor(config?: Partial<GitTrackingConfig>);
    /**
     * Initialize git tracking and verify repository
     */
    initialize(): Promise<void>;
    /**
     * Get all changes since last processed state
     */
    getChangesSinceLastUpdate(): Promise<FileChange[]>;
    /**
     * Get changes in working directory (staged + unstaged + untracked)
     */
    private getWorkingDirectoryChanges;
    /**
     * Get changes since specific commit
     */
    private getChangesSinceCommit;
    /**
     * Get changes since specific date
     */
    private getChangesSinceDate;
    /**
     * Get commit information for analysis
     */
    getCommitInfo(commitHash?: string): Promise<GitCommitInfo | null>;
    /**
     * Get recent commits for analysis
     */
    getRecentCommits(limit?: number): Promise<GitCommitInfo[]>;
    /**
     * Mark commit as processed
     */
    markCommitProcessed(commitHash: string): Promise<void>;
    /**
     * Check if repository is a git repository
     */
    private verifyGitRepository;
    /**
     * Load last processed commit from storage
     */
    private loadLastProcessedCommit;
    /**
     * Get untracked files
     */
    private getUntrackedFiles;
    /**
     * Create FileChange from git status
     */
    private createFileChangeFromStatus;
    /**
     * Create FileChange from git diff status
     */
    private createFileChangeFromGitStatus;
    /**
     * Create FileChange object from file path
     */
    private createFileChangeFromPath;
    /**
     * Check if file should be included based on patterns
     */
    private shouldIncludeFile;
    /**
     * Simple pattern matching (supports * wildcards)
     */
    private matchesPattern;
}
