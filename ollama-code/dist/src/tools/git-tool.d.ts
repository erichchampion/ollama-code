/**
 * GitTool - Advanced Git Repository Analysis and Operations
 *
 * Provides comprehensive Git repository analysis including:
 * - Repository structure and history analysis
 * - Branch management and comparison
 * - Commit analysis and semantic understanding
 * - Diff analysis with intelligent suggestions
 * - Merge conflict detection and resolution assistance
 * - Code evolution tracking and insights
 */
import { BaseTool, ToolResult, ToolExecutionContext } from './base-tool.js';
export interface GitCommit {
    hash: string;
    shortHash: string;
    author: string;
    email: string;
    date: Date;
    message: string;
    files: string[];
    insertions: number;
    deletions: number;
}
export interface GitBranch {
    name: string;
    current: boolean;
    remote?: string;
    lastCommit: GitCommit;
    aheadBy?: number;
    behindBy?: number;
}
export interface GitDiff {
    file: string;
    oldPath?: string;
    newPath?: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
    insertions: number;
    deletions: number;
    chunks: GitDiffChunk[];
}
export interface GitDiffChunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: GitDiffLine[];
}
export interface GitDiffLine {
    type: 'added' | 'removed' | 'context';
    content: string;
    lineNumber: number;
}
export interface GitRepositoryAnalysis {
    isGitRepo: boolean;
    rootPath: string;
    currentBranch: string;
    branches: GitBranch[];
    recentCommits: GitCommit[];
    status: {
        staged: string[];
        unstaged: string[];
        untracked: string[];
        conflicts: string[];
    };
    statistics: {
        totalCommits: number;
        contributors: number;
        totalFiles: number;
        linesOfCode: number;
        oldestCommit: Date;
        newestCommit: Date;
    };
}
export interface GitToolOptions {
    maxCommits?: number;
    maxBranches?: number;
    includeDiffs?: boolean;
    analyzeContributors?: boolean;
    deepAnalysis?: boolean;
}
/**
 * Advanced Git repository analysis and operations tool
 */
export declare class GitTool extends BaseTool {
    name: string;
    description: string;
    private repositoryCache;
    private commandTimeout;
    execute(operation: string, context: ToolExecutionContext, options?: GitToolOptions): Promise<ToolResult>;
    /**
     * Check if directory is a Git repository
     */
    private isGitRepository;
    /**
     * Comprehensive repository analysis
     */
    private analyzeRepository;
    /**
     * Get repository commit history with analysis
     */
    private getRepositoryHistory;
    /**
     * Analyze repository branches
     */
    private analyzeBranches;
    /**
     * Analyze current changes and diffs
     */
    private analyzeDiff;
    /**
     * Analyze repository contributors
     */
    private analyzeContributors;
    /**
     * Detect and analyze merge conflicts
     */
    private detectConflicts;
    /**
     * Generate repository insights and recommendations
     */
    private generateInsights;
    private executeGitCommand;
    private getRepositoryStatus;
    private getRecentCommits;
    private getBranches;
    private getRepositoryStatistics;
    private getDiffs;
    private analyzeCommitPatterns;
    private extractCommitMessagePatterns;
    private calculatePeakCommitHours;
    private calculateAuthorDistribution;
    private analyzeDiffChanges;
    private calculateActiveDays;
    private parseConflictMarkers;
    private generateConflictResolutionSuggestions;
    private calculateRepositoryHealthScore;
    private generateRecommendations;
}
