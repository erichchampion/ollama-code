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
import { BaseTool } from './base-tool.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Advanced Git repository analysis and operations tool
 */
export class GitTool extends BaseTool {
    name = 'git';
    description = 'Advanced Git repository analysis and intelligent operations';
    repositoryCache = new Map();
    commandTimeout = 30000; // 30 seconds
    async execute(operation, context, options = {}) {
        try {
            const workingDir = context.workingDirectory || process.cwd();
            // Ensure we're in a Git repository
            if (!this.isGitRepository(workingDir)) {
                return {
                    success: false,
                    error: 'Not a Git repository. Initialize with "git init" first.'
                };
            }
            switch (operation.toLowerCase()) {
                case 'analyze':
                case 'status':
                    return await this.analyzeRepository(workingDir, options);
                case 'history':
                case 'log':
                    return await this.getRepositoryHistory(workingDir, options);
                case 'branches':
                    return await this.analyzeBranches(workingDir, options);
                case 'diff':
                    return await this.analyzeDiff(workingDir, options);
                case 'contributors':
                    return await this.analyzeContributors(workingDir, options);
                case 'conflicts':
                    return await this.detectConflicts(workingDir, options);
                case 'insights':
                    return await this.generateInsights(workingDir, options);
                default:
                    return {
                        success: false,
                        error: `Unknown Git operation: ${operation}. Available: analyze, history, branches, diff, contributors, conflicts, insights`
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Git operation failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Check if directory is a Git repository
     */
    isGitRepository(dir) {
        try {
            execSync('git rev-parse --git-dir', {
                cwd: dir,
                stdio: 'pipe',
                timeout: this.commandTimeout
            });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Comprehensive repository analysis
     */
    async analyzeRepository(workingDir, options) {
        const cacheKey = `${workingDir}:analyze`;
        try {
            // Get current repository state
            const currentBranch = this.executeGitCommand('rev-parse --abbrev-ref HEAD', workingDir).trim();
            const rootPath = this.executeGitCommand('rev-parse --show-toplevel', workingDir).trim();
            // Get repository status
            const status = await this.getRepositoryStatus(workingDir);
            // Get recent commits
            const recentCommits = await this.getRecentCommits(workingDir, options.maxCommits || 10);
            // Get branches
            const branches = await this.getBranches(workingDir, options.maxBranches || 20);
            // Get repository statistics
            const statistics = await this.getRepositoryStatistics(workingDir);
            const analysis = {
                isGitRepo: true,
                rootPath,
                currentBranch,
                branches,
                recentCommits,
                status,
                statistics
            };
            // Cache the result
            this.repositoryCache.set(cacheKey, analysis);
            return {
                success: true,
                data: analysis,
                metadata: {
                    operation: 'analyze',
                    timestamp: new Date(),
                    workingDirectory: workingDir
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Repository analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Get repository commit history with analysis
     */
    async getRepositoryHistory(workingDir, options) {
        try {
            const maxCommits = options.maxCommits || 50;
            const commits = await this.getRecentCommits(workingDir, maxCommits);
            // Analyze commit patterns
            const patterns = this.analyzeCommitPatterns(commits);
            return {
                success: true,
                data: {
                    commits,
                    patterns,
                    summary: {
                        totalCommits: commits.length,
                        dateRange: {
                            from: commits[commits.length - 1]?.date,
                            to: commits[0]?.date
                        },
                        totalChanges: {
                            insertions: commits.reduce((sum, c) => sum + c.insertions, 0),
                            deletions: commits.reduce((sum, c) => sum + c.deletions, 0)
                        }
                    }
                },
                metadata: {
                    operation: 'history',
                    maxCommits,
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `History analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze repository branches
     */
    async analyzeBranches(workingDir, options) {
        try {
            const branches = await this.getBranches(workingDir, options.maxBranches || 50);
            // Analyze branch relationships
            const branchAnalysis = {
                total: branches.length,
                current: branches.find(b => b.current)?.name,
                remote: branches.filter(b => b.remote).length,
                local: branches.filter(b => !b.remote).length,
                needsMerge: branches.filter(b => b.behindBy && b.behindBy > 0).length,
                canPush: branches.filter(b => b.aheadBy && b.aheadBy > 0).length
            };
            return {
                success: true,
                data: {
                    branches,
                    analysis: branchAnalysis
                },
                metadata: {
                    operation: 'branches',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Branch analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze current changes and diffs
     */
    async analyzeDiff(workingDir, options) {
        try {
            const status = await this.getRepositoryStatus(workingDir);
            if (status.staged.length === 0 && status.unstaged.length === 0) {
                return {
                    success: true,
                    data: {
                        message: 'No changes detected',
                        staged: [],
                        unstaged: []
                    }
                };
            }
            // Get staged diffs
            const stagedDiffs = await this.getDiffs(workingDir, '--cached');
            // Get unstaged diffs
            const unstagedDiffs = await this.getDiffs(workingDir, '');
            // Analyze the changes
            const analysis = this.analyzeDiffChanges([...stagedDiffs, ...unstagedDiffs]);
            return {
                success: true,
                data: {
                    staged: stagedDiffs,
                    unstaged: unstagedDiffs,
                    analysis,
                    summary: {
                        totalFiles: status.staged.length + status.unstaged.length,
                        stagedFiles: status.staged.length,
                        unstagedFiles: status.unstaged.length
                    }
                },
                metadata: {
                    operation: 'diff',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Diff analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze repository contributors
     */
    async analyzeContributors(workingDir, options) {
        try {
            const contributorStats = this.executeGitCommand('shortlog -sn --all --no-merges', workingDir);
            const contributors = contributorStats
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
                return match ? {
                    commits: parseInt(match[1]),
                    name: match[2]
                } : null;
            })
                .filter(Boolean)
                .slice(0, 20); // Top 20 contributors
            // Get detailed contributor info
            const detailedContributors = await Promise.all(contributors.slice(0, 10).map(async (contributor) => {
                const firstCommit = this.executeGitCommand(`log --author="${contributor.name}" --format="%H %ad" --date=short --reverse | head -1`, workingDir).split(' ');
                const lastCommit = this.executeGitCommand(`log --author="${contributor.name}" --format="%H %ad" --date=short | head -1`, workingDir).split(' ');
                return {
                    ...contributor,
                    firstCommitDate: firstCommit[1],
                    lastCommitDate: lastCommit[1],
                    activeDays: this.calculateActiveDays(firstCommit[1], lastCommit[1])
                };
            }));
            return {
                success: true,
                data: {
                    contributors: detailedContributors,
                    summary: {
                        total: contributors.length,
                        top10Commits: contributors.slice(0, 10).reduce((sum, c) => sum + c.commits, 0),
                        totalCommits: contributors.reduce((sum, c) => sum + c.commits, 0)
                    }
                },
                metadata: {
                    operation: 'contributors',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Contributor analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Detect and analyze merge conflicts
     */
    async detectConflicts(workingDir, options) {
        try {
            const status = await this.getRepositoryStatus(workingDir);
            if (status.conflicts.length === 0) {
                return {
                    success: true,
                    data: {
                        hasConflicts: false,
                        message: 'No merge conflicts detected'
                    }
                };
            }
            // Analyze each conflict file
            const conflictAnalysis = status.conflicts.map(file => {
                const filePath = path.join(workingDir, file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const conflicts = this.parseConflictMarkers(content);
                    return {
                        file,
                        conflicts: conflicts.length,
                        details: conflicts
                    };
                }
                return { file, conflicts: 0, details: [] };
            });
            return {
                success: true,
                data: {
                    hasConflicts: true,
                    conflictFiles: conflictAnalysis,
                    summary: {
                        totalFiles: status.conflicts.length,
                        totalConflicts: conflictAnalysis.reduce((sum, f) => sum + f.conflicts, 0)
                    },
                    suggestions: this.generateConflictResolutionSuggestions(conflictAnalysis)
                },
                metadata: {
                    operation: 'conflicts',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Conflict detection failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Generate repository insights and recommendations
     */
    async generateInsights(workingDir, options) {
        try {
            const analysis = await this.analyzeRepository(workingDir, { ...options, deepAnalysis: true });
            if (!analysis.success || !analysis.data) {
                return analysis;
            }
            const repo = analysis.data;
            const insights = [];
            // Repository health insights
            if (repo.status.untracked.length > 10) {
                insights.push({
                    type: 'warning',
                    category: 'repository_health',
                    message: `Many untracked files (${repo.status.untracked.length}). Consider adding to .gitignore.`,
                    severity: 'medium'
                });
            }
            if (repo.status.staged.length > 0 && repo.status.unstaged.length > 0) {
                insights.push({
                    type: 'info',
                    category: 'workflow',
                    message: 'You have both staged and unstaged changes. Consider committing staged changes first.',
                    severity: 'low'
                });
            }
            // Branch insights
            const staleBranches = repo.branches.filter(b => {
                const daysSinceCommit = (Date.now() - b.lastCommit.date.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceCommit > 30 && !b.current;
            });
            if (staleBranches.length > 0) {
                insights.push({
                    type: 'suggestion',
                    category: 'branch_management',
                    message: `${staleBranches.length} stale branches found. Consider cleaning up old branches.`,
                    severity: 'low'
                });
            }
            // Commit pattern insights
            const commitPatterns = this.analyzeCommitPatterns(repo.recentCommits);
            if (commitPatterns.averageCommitsPerDay < 1 && repo.statistics.contributors > 1) {
                insights.push({
                    type: 'suggestion',
                    category: 'development_pace',
                    message: 'Low commit frequency detected. Consider more frequent, smaller commits.',
                    severity: 'low'
                });
            }
            return {
                success: true,
                data: {
                    insights,
                    summary: {
                        healthScore: this.calculateRepositoryHealthScore(repo, insights),
                        recommendations: this.generateRecommendations(repo, insights)
                    },
                    repository: repo
                },
                metadata: {
                    operation: 'insights',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Insights generation failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    // Helper methods
    executeGitCommand(command, workingDir) {
        return execSync(`git ${command}`, {
            cwd: workingDir,
            encoding: 'utf-8',
            timeout: this.commandTimeout
        }).toString().trim();
    }
    async getRepositoryStatus(workingDir) {
        const statusOutput = this.executeGitCommand('status --porcelain', workingDir);
        const staged = [];
        const unstaged = [];
        const untracked = [];
        const conflicts = [];
        statusOutput.split('\n').forEach(line => {
            if (!line.trim())
                return;
            const status = line.substring(0, 2);
            const file = line.substring(3);
            if (status.includes('U') || status === 'AA' || status === 'DD') {
                conflicts.push(file);
            }
            else if (status[0] !== ' ' && status[0] !== '?') {
                staged.push(file);
            }
            else if (status[1] !== ' ') {
                unstaged.push(file);
            }
            else if (status === '??') {
                untracked.push(file);
            }
        });
        return { staged, unstaged, untracked, conflicts };
    }
    async getRecentCommits(workingDir, count) {
        const format = '%H|%h|%an|%ae|%ad|%s';
        const output = this.executeGitCommand(`log --format="${format}" --date=iso -${count} --stat=1000,1000`, workingDir);
        const commits = [];
        const lines = output.split('\n');
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (!line.includes('|')) {
                i++;
                continue;
            }
            const [hash, shortHash, author, email, date, message] = line.split('|');
            // Parse file changes from subsequent lines
            const files = [];
            let insertions = 0;
            let deletions = 0;
            i++;
            while (i < lines.length && lines[i] && !lines[i].includes('|')) {
                const statLine = lines[i];
                if (statLine.includes('file') && statLine.includes('changed')) {
                    const insertMatch = statLine.match(/(\d+) insertions?/);
                    const deleteMatch = statLine.match(/(\d+) deletions?/);
                    if (insertMatch)
                        insertions = parseInt(insertMatch[1]);
                    if (deleteMatch)
                        deletions = parseInt(deleteMatch[1]);
                }
                else if (statLine.trim() && !statLine.includes('changed')) {
                    files.push(statLine.trim().split(' ')[0]);
                }
                i++;
            }
            commits.push({
                hash,
                shortHash,
                author,
                email,
                date: new Date(date),
                message,
                files,
                insertions,
                deletions
            });
        }
        return commits;
    }
    async getBranches(workingDir, maxBranches) {
        const branchOutput = this.executeGitCommand('branch -va', workingDir);
        const branches = [];
        branchOutput.split('\n').forEach(line => {
            if (!line.trim())
                return;
            const current = line.startsWith('*');
            const branchInfo = line.replace('*', '').trim();
            const parts = branchInfo.split(/\s+/);
            if (parts.length >= 2) {
                const name = parts[0];
                const isRemote = name.startsWith('remotes/');
                // Get last commit for this branch
                try {
                    const lastCommitHash = this.executeGitCommand(`rev-parse ${name}`, workingDir);
                    const commitInfo = this.executeGitCommand(`log --format="%h|%an|%ae|%ad|%s" --date=iso -1 ${lastCommitHash}`, workingDir);
                    const [shortHash, author, email, date, message] = commitInfo.split('|');
                    branches.push({
                        name: isRemote ? name : name,
                        current,
                        remote: isRemote ? name.split('/')[1] : undefined,
                        lastCommit: {
                            hash: lastCommitHash,
                            shortHash,
                            author,
                            email,
                            date: new Date(date),
                            message,
                            files: [],
                            insertions: 0,
                            deletions: 0
                        }
                    });
                }
                catch {
                    // Skip branches we can't analyze
                }
            }
        });
        return branches.slice(0, maxBranches);
    }
    async getRepositoryStatistics(workingDir) {
        try {
            const totalCommits = parseInt(this.executeGitCommand('rev-list --count HEAD', workingDir));
            const contributorCount = this.executeGitCommand('shortlog -sn --all', workingDir)
                .split('\n').filter(line => line.trim()).length;
            const firstCommit = this.executeGitCommand('log --format="%ad" --date=iso --reverse | head -1', workingDir);
            const lastCommit = this.executeGitCommand('log --format="%ad" --date=iso | head -1', workingDir);
            // Count files tracked by git
            const trackedFiles = this.executeGitCommand('ls-files', workingDir).split('\n').filter(f => f.trim()).length;
            // Estimate lines of code (rough approximation)
            const linesOfCode = this.executeGitCommand('ls-files | xargs wc -l | tail -1', workingDir)
                .trim().split(/\s+/)[0];
            return {
                totalCommits,
                contributors: contributorCount,
                totalFiles: trackedFiles,
                linesOfCode: parseInt(linesOfCode) || 0,
                oldestCommit: new Date(firstCommit),
                newestCommit: new Date(lastCommit)
            };
        }
        catch {
            return {
                totalCommits: 0,
                contributors: 0,
                totalFiles: 0,
                linesOfCode: 0,
                oldestCommit: new Date(),
                newestCommit: new Date()
            };
        }
    }
    async getDiffs(workingDir, flags) {
        try {
            const diffOutput = this.executeGitCommand(`diff ${flags} --stat`, workingDir);
            const diffs = [];
            diffOutput.split('\n').forEach(line => {
                if (!line.includes('|'))
                    return;
                const parts = line.split('|');
                const file = parts[0].trim();
                const changes = parts[1].trim();
                const insertMatch = changes.match(/(\d+)\+/);
                const deleteMatch = changes.match(/(\d+)\-/);
                diffs.push({
                    file,
                    status: 'modified',
                    insertions: insertMatch ? parseInt(insertMatch[1]) : 0,
                    deletions: deleteMatch ? parseInt(deleteMatch[1]) : 0,
                    chunks: [] // Detailed chunk analysis would require more complex parsing
                });
            });
            return diffs;
        }
        catch {
            return [];
        }
    }
    analyzeCommitPatterns(commits) {
        if (commits.length === 0) {
            return {
                averageCommitsPerDay: 0,
                messagePatterns: [],
                peakCommitHours: [],
                authorDistribution: {}
            };
        }
        const dateRange = commits[0].date.getTime() - commits[commits.length - 1].date.getTime();
        const days = dateRange / (1000 * 60 * 60 * 24);
        return {
            averageCommitsPerDay: commits.length / Math.max(days, 1),
            messagePatterns: this.extractCommitMessagePatterns(commits),
            peakCommitHours: this.calculatePeakCommitHours(commits),
            authorDistribution: this.calculateAuthorDistribution(commits)
        };
    }
    extractCommitMessagePatterns(commits) {
        const patterns = new Map();
        commits.forEach(commit => {
            const message = commit.message.toLowerCase();
            // Common patterns
            if (message.startsWith('fix'))
                patterns.set('fix', (patterns.get('fix') || 0) + 1);
            if (message.startsWith('feat'))
                patterns.set('feat', (patterns.get('feat') || 0) + 1);
            if (message.startsWith('refactor'))
                patterns.set('refactor', (patterns.get('refactor') || 0) + 1);
            if (message.startsWith('test'))
                patterns.set('test', (patterns.get('test') || 0) + 1);
            if (message.startsWith('docs'))
                patterns.set('docs', (patterns.get('docs') || 0) + 1);
        });
        return Array.from(patterns.entries())
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count);
    }
    calculatePeakCommitHours(commits) {
        const hourCounts = new Array(24).fill(0);
        commits.forEach(commit => {
            const hour = commit.date.getHours();
            hourCounts[hour]++;
        });
        return hourCounts
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    calculateAuthorDistribution(commits) {
        const distribution = {};
        commits.forEach(commit => {
            distribution[commit.author] = (distribution[commit.author] || 0) + 1;
        });
        return distribution;
    }
    analyzeDiffChanges(diffs) {
        const totalInsertions = diffs.reduce((sum, diff) => sum + diff.insertions, 0);
        const totalDeletions = diffs.reduce((sum, diff) => sum + diff.deletions, 0);
        return {
            totalFiles: diffs.length,
            totalInsertions,
            totalDeletions,
            netChange: totalInsertions - totalDeletions,
            largestChanges: diffs
                .sort((a, b) => (b.insertions + b.deletions) - (a.insertions + a.deletions))
                .slice(0, 5)
        };
    }
    calculateActiveDays(firstDate, lastDate) {
        const first = new Date(firstDate);
        const last = new Date(lastDate);
        return Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    }
    parseConflictMarkers(content) {
        const conflicts = [];
        const lines = content.split('\n');
        let inConflict = false;
        let conflictStart = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('<<<<<<<')) {
                inConflict = true;
                conflictStart = i;
            }
            else if (line.startsWith('>>>>>>>') && inConflict) {
                conflicts.push({
                    startLine: conflictStart,
                    endLine: i,
                    lines: i - conflictStart + 1
                });
                inConflict = false;
            }
        }
        return conflicts;
    }
    generateConflictResolutionSuggestions(conflictAnalysis) {
        const suggestions = [];
        if (conflictAnalysis.length > 5) {
            suggestions.push('Consider using "git mergetool" for easier conflict resolution');
        }
        suggestions.push('Review each conflict marker carefully');
        suggestions.push('Test the code after resolving conflicts');
        suggestions.push('Consider creating a backup branch before resolving');
        return suggestions;
    }
    calculateRepositoryHealthScore(repo, insights) {
        let score = 100;
        // Deduct points for issues
        score -= repo.status.conflicts.length * 10;
        score -= Math.min(repo.status.untracked.length * 2, 20);
        score -= insights.filter(i => i.severity === 'high').length * 15;
        score -= insights.filter(i => i.severity === 'medium').length * 10;
        score -= insights.filter(i => i.severity === 'low').length * 5;
        return Math.max(0, Math.min(100, score));
    }
    generateRecommendations(repo, insights) {
        const recommendations = [];
        if (repo.status.untracked.length > 0) {
            recommendations.push('Add untracked files to .gitignore or stage them for commit');
        }
        if (repo.status.staged.length > 0) {
            recommendations.push('Commit your staged changes');
        }
        if (insights.length > 0) {
            recommendations.push('Address the identified issues for better repository health');
        }
        return recommendations;
    }
}
//# sourceMappingURL=git-tool.js.map