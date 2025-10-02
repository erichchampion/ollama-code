"use strict";
/**
 * VCS Intelligence
 *
 * Comprehensive version control system integration with AI-powered insights
 * and automation for git repositories. Provides intelligent commit analysis,
 * change tracking, and integration with ollama-code's AI capabilities.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VCSIntelligence = void 0;
const logger_js_1 = require("../../utils/logger.js");
const git_change_tracker_js_1 = require("../git-change-tracker.js");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * VCS Intelligence class for comprehensive git repository analysis and automation
 */
class VCSIntelligence {
    constructor(config) {
        this.repositoryCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.config = config;
        this.gitChangeTracker = new git_change_tracker_js_1.GitChangeTracker({
            repositoryPath: config.repositoryPath,
            trackingMode: 'working_directory',
            includeUntracked: true,
            excludePatterns: ['.git/**', 'node_modules/**', 'dist/**', 'build/**'],
            maxCommits: config.analysisDepth
        });
    }
    /**
     * Initialize VCS intelligence for the repository
     */
    async initialize() {
        try {
            logger_js_1.logger.info('Initializing VCS Intelligence', {
                repository: this.config.repositoryPath,
                analysisDepth: this.config.analysisDepth
            });
            // Verify git repository
            await this.verifyGitRepository();
            // Initialize git change tracker
            await this.gitChangeTracker.initialize();
            // Install git hooks if enabled
            if (this.config.enableGitHooks) {
                await this.installGitHooks();
            }
            logger_js_1.logger.info('VCS Intelligence initialized successfully');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to initialize VCS Intelligence', error);
            throw error;
        }
    }
    /**
     * Perform comprehensive repository analysis
     */
    async analyzeRepository() {
        const cacheKey = this.config.repositoryPath;
        const cached = this.repositoryCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
            logger_js_1.logger.debug('Returning cached repository analysis');
            return cached;
        }
        try {
            logger_js_1.logger.info('Performing comprehensive repository analysis');
            const [repositoryInfo, activitySummary, qualityMetrics, riskAnalysis] = await Promise.all([
                this.getRepositoryInfo(),
                this.getActivitySummary(),
                this.analyzeCodeQuality(),
                this.performRiskAnalysis()
            ]);
            const recommendations = this.generateRecommendations(repositoryInfo, activitySummary, qualityMetrics, riskAnalysis);
            const analysis = {
                repository: repositoryInfo,
                recentActivity: activitySummary,
                codeQuality: qualityMetrics,
                riskAssessment: riskAnalysis,
                recommendations
            };
            // Cache the analysis
            this.repositoryCache.set(cacheKey, analysis);
            logger_js_1.logger.info('Repository analysis completed', {
                overallQuality: qualityMetrics.overallScore,
                riskLevel: riskAnalysis.overallRisk,
                recommendationCount: recommendations.length
            });
            return analysis;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze repository', error);
            throw error;
        }
    }
    /**
     * Get basic repository information
     */
    async getRepositoryInfo() {
        try {
            const [repoName, defaultBranch, currentBranch, statusInfo, lastCommit, remotes] = await Promise.all([
                this.getRepositoryName(),
                this.getDefaultBranch(),
                this.getCurrentBranch(),
                this.getRepositoryStatus(),
                this.getLastCommit(),
                this.getRemotes()
            ]);
            return {
                path: this.config.repositoryPath,
                name: repoName,
                defaultBranch,
                currentBranch,
                isClean: statusInfo.isClean,
                unstagedChanges: statusInfo.unstagedChanges,
                stagedChanges: statusInfo.stagedChanges,
                unpushedCommits: statusInfo.unpushedCommits,
                lastCommit,
                remotes
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get repository info', error);
            throw error;
        }
    }
    /**
     * Analyze recent repository activity
     */
    async getActivitySummary() {
        try {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const commits = await this.gitChangeTracker.getRecentCommits(30);
            const weeklyCommits = commits.filter(c => c.date >= weekAgo);
            const uniqueAuthors = new Set(commits.map(c => c.email)).size;
            const allFiles = commits.flatMap(c => c.files);
            const filesModified = new Set(allFiles.map(f => f.path)).size;
            const linesAdded = allFiles.reduce((sum, f) => sum + f.insertions, 0);
            const linesDeleted = allFiles.reduce((sum, f) => sum + f.deletions, 0);
            const hotspots = await this.identifyFileHotspots(commits);
            return {
                commitsLastWeek: weeklyCommits.length,
                commitsLastMonth: commits.length,
                uniqueAuthors,
                filesModified,
                linesAdded,
                linesDeleted,
                hotspots
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get activity summary', error);
            throw error;
        }
    }
    /**
     * Analyze code quality metrics
     */
    async analyzeCodeQuality() {
        try {
            // This would integrate with existing security and performance analyzers
            // For now, provide basic analysis
            const commits = await this.gitChangeTracker.getRecentCommits(30);
            // Basic quality scoring based on commit patterns and file changes
            const avgFilesPerCommit = commits.length > 0
                ? commits.reduce((sum, c) => sum + c.files.length, 0) / commits.length
                : 0;
            const avgLinesPerCommit = commits.length > 0
                ? commits.reduce((sum, c) => sum + c.files.reduce((s, f) => s + f.insertions + f.deletions, 0), 0) / commits.length
                : 0;
            // Simple scoring algorithm (in real implementation, this would be more sophisticated)
            const complexityScore = Math.max(0, 100 - (avgLinesPerCommit / 10));
            const stabilityScore = Math.max(0, 100 - (avgFilesPerCommit * 5));
            const overallScore = (complexityScore + stabilityScore) / 2;
            return {
                overallScore: Math.round(overallScore),
                testCoverage: 75, // Would be calculated from actual test results
                codeComplexity: Math.round(100 - complexityScore),
                duplication: 15, // Would be calculated from code analysis
                maintainabilityIndex: Math.round(overallScore),
                technicalDebt: [] // Would be populated from actual analysis
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze code quality', error);
            throw error;
        }
    }
    /**
     * Perform risk analysis on the repository
     */
    async performRiskAnalysis() {
        try {
            const factors = [];
            // Analyze recent commits for risk factors
            const recentCommits = await this.gitChangeTracker.getRecentCommits(20);
            // Check for large commits
            const largeCommits = recentCommits.filter(c => c.files.reduce((sum, f) => sum + f.insertions + f.deletions, 0) > this.config.qualityThresholds.maxLinesChanged);
            if (largeCommits.length > 0) {
                factors.push({
                    type: 'size',
                    level: largeCommits.length > 3 ? 'high' : 'medium',
                    description: `${largeCommits.length} large commits detected in the last 2 weeks`,
                    impact: 'Large commits are harder to review and more likely to introduce bugs'
                });
            }
            // Check for frequent changes to critical files
            const criticalFileChanges = recentCommits.flatMap(c => c.files)
                .filter(f => this.config.qualityThresholds.criticalFilePatterns.some(pattern => f.path.match(new RegExp(pattern))));
            if (criticalFileChanges.length > 5) {
                factors.push({
                    type: 'frequency',
                    level: 'medium',
                    description: `${criticalFileChanges.length} changes to critical files`,
                    impact: 'High frequency changes to critical files increase deployment risk'
                });
            }
            // Calculate overall risk
            const highRiskFactors = factors.filter(f => f.level === 'high' || f.level === 'critical').length;
            const mediumRiskFactors = factors.filter(f => f.level === 'medium').length;
            let overallRisk;
            if (highRiskFactors > 0) {
                overallRisk = 'high';
            }
            else if (mediumRiskFactors > 2) {
                overallRisk = 'medium';
            }
            else {
                overallRisk = 'low';
            }
            const suggestions = this.generateRiskSuggestions(factors);
            return {
                overallRisk,
                factors,
                suggestions
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to perform risk analysis', error);
            throw error;
        }
    }
    /**
     * Identify file hotspots based on change frequency
     */
    async identifyFileHotspots(commits) {
        const fileStats = new Map();
        // Analyze all file changes
        commits.forEach(commit => {
            commit.files.forEach(file => {
                const existing = fileStats.get(file.path) || {
                    changes: 0,
                    authors: new Set(),
                    lastModified: new Date(0)
                };
                existing.changes++;
                existing.authors.add(commit.email);
                if (commit.date > existing.lastModified) {
                    existing.lastModified = commit.date;
                }
                fileStats.set(file.path, existing);
            });
        });
        // Convert to hotspots and calculate risk scores
        const hotspots = Array.from(fileStats.entries())
            .map(([path, stats]) => ({
            path,
            changeFrequency: stats.changes,
            authors: Array.from(stats.authors),
            riskScore: this.calculateFileRiskScore(stats.changes, stats.authors.size),
            lastModified: stats.lastModified
        }))
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 10); // Top 10 hotspots
        return hotspots;
    }
    /**
     * Calculate risk score for a file based on change frequency and author count
     */
    calculateFileRiskScore(changes, authorCount) {
        // High change frequency + low author count = high risk (single point of failure)
        // High change frequency + high author count = medium risk (coordination complexity)
        const frequencyScore = Math.min(changes * 10, 100);
        const authorFactor = authorCount === 1 ? 1.5 : authorCount > 5 ? 1.2 : 1.0;
        return Math.round(frequencyScore * authorFactor);
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(repo, activity, quality, risk) {
        const recommendations = [];
        // Repository cleanliness
        if (!repo.isClean) {
            recommendations.push('Consider committing or stashing uncommitted changes for a cleaner repository state');
        }
        // Quality recommendations
        if (quality.overallScore < 70) {
            recommendations.push('Code quality score is below recommended threshold. Consider code review and refactoring');
        }
        if (quality.testCoverage < this.config.qualityThresholds.minTestCoverage) {
            recommendations.push(`Test coverage (${quality.testCoverage}%) is below target (${this.config.qualityThresholds.minTestCoverage}%). Consider adding more tests`);
        }
        // Activity recommendations
        if (activity.commitsLastWeek === 0) {
            recommendations.push('No commits in the last week. Consider regular development activity or archival if inactive');
        }
        if (activity.uniqueAuthors === 1 && activity.commitsLastMonth > 20) {
            recommendations.push('Single author with high activity. Consider code reviews or pair programming for knowledge sharing');
        }
        // Hotspot recommendations
        if (activity.hotspots.some(h => h.riskScore > 80)) {
            recommendations.push('High-risk file hotspots detected. Consider refactoring frequently changed files');
        }
        // Risk recommendations
        risk.suggestions.forEach(suggestion => recommendations.push(suggestion));
        return recommendations;
    }
    /**
     * Generate risk-specific suggestions
     */
    generateRiskSuggestions(factors) {
        const suggestions = [];
        factors.forEach(factor => {
            switch (factor.type) {
                case 'size':
                    suggestions.push('Break down large commits into smaller, more reviewable chunks');
                    break;
                case 'frequency':
                    suggestions.push('Implement more thorough testing for frequently changed critical files');
                    break;
                case 'complexity':
                    suggestions.push('Consider refactoring complex code sections to improve maintainability');
                    break;
                case 'testing':
                    suggestions.push('Increase test coverage for areas with high change frequency');
                    break;
                case 'security':
                    suggestions.push('Implement security scanning in CI/CD pipeline');
                    break;
            }
        });
        return [...new Set(suggestions)]; // Remove duplicates
    }
    // Helper methods for git operations
    async verifyGitRepository() {
        try {
            await execAsync('git rev-parse --git-dir', { cwd: this.config.repositoryPath });
        }
        catch (error) {
            throw new Error(`Not a git repository: ${this.config.repositoryPath}`);
        }
    }
    async getRepositoryName() {
        try {
            const { stdout } = await execAsync('git config --get remote.origin.url', {
                cwd: this.config.repositoryPath
            });
            const url = stdout.trim();
            const match = url.match(/\/([^\/]+?)(?:\.git)?$/);
            return match ? match[1] : path.basename(this.config.repositoryPath);
        }
        catch {
            return path.basename(this.config.repositoryPath);
        }
    }
    async getDefaultBranch() {
        try {
            const { stdout } = await execAsync('git symbolic-ref refs/remotes/origin/HEAD', {
                cwd: this.config.repositoryPath
            });
            return stdout.trim().replace('refs/remotes/origin/', '') || 'main';
        }
        catch {
            return this.config.defaultBranch || 'main';
        }
    }
    async getCurrentBranch() {
        try {
            const { stdout } = await execAsync('git branch --show-current', {
                cwd: this.config.repositoryPath
            });
            return stdout.trim();
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get current branch', error);
            return 'unknown';
        }
    }
    async getRepositoryStatus() {
        try {
            const { stdout } = await execAsync('git status --porcelain', {
                cwd: this.config.repositoryPath
            });
            const lines = stdout.trim().split('\n').filter(line => line.length > 0);
            const unstagedChanges = lines.filter(line => line[1] === 'M' || line[1] === 'D').length;
            const stagedChanges = lines.filter(line => line[0] === 'M' || line[0] === 'A' || line[0] === 'D').length;
            // Get unpushed commits
            let unpushedCommits = 0;
            try {
                const { stdout: unpushedStdout } = await execAsync('git log @{u}.. --oneline', {
                    cwd: this.config.repositoryPath
                });
                unpushedCommits = unpushedStdout.trim() ? unpushedStdout.trim().split('\n').length : 0;
            }
            catch {
                // No upstream branch or other issue
            }
            return {
                isClean: lines.length === 0,
                unstagedChanges,
                stagedChanges,
                unpushedCommits
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get repository status', error);
            return { isClean: false, unstagedChanges: 0, stagedChanges: 0, unpushedCommits: 0 };
        }
    }
    async getLastCommit() {
        try {
            const commits = await this.gitChangeTracker.getRecentCommits(1);
            return commits.length > 0 ? commits[0] : null;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get last commit', error);
            return null;
        }
    }
    async getRemotes() {
        try {
            const { stdout } = await execAsync('git remote -v', {
                cwd: this.config.repositoryPath
            });
            const remotes = new Map();
            stdout.trim().split('\n').forEach(line => {
                const [name, url] = line.split('\t');
                if (name && url && url.includes('(fetch)')) {
                    remotes.set(name, url.replace(' (fetch)', ''));
                }
            });
            return Array.from(remotes.entries()).map(([name, url]) => ({
                name,
                url,
                type: this.detectRemoteType(url)
            }));
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get remotes', error);
            return [];
        }
    }
    detectRemoteType(url) {
        if (url.includes('github.com'))
            return 'github';
        if (url.includes('gitlab.com'))
            return 'gitlab';
        if (url.includes('bitbucket.org'))
            return 'bitbucket';
        if (url.includes('dev.azure.com') || url.includes('visualstudio.com'))
            return 'azure';
        return 'other';
    }
    async installGitHooks() {
        // Implementation for installing git hooks would go here
        // This is a placeholder for the git hooks functionality
        logger_js_1.logger.info('Git hooks installation requested', {
            hookTypes: this.config.hookTypes
        });
    }
    isCacheValid(analysis) {
        // Simple cache validation - in practice, this would be more sophisticated
        const lastCommitTime = analysis.repository.lastCommit?.date?.getTime();
        if (!lastCommitTime) {
            return false; // Invalid cache if no last commit time
        }
        return Date.now() - lastCommitTime < this.cacheExpiry;
    }
    /**
     * Clear the analysis cache
     */
    clearCache() {
        this.repositoryCache.clear();
        logger_js_1.logger.debug('VCS Intelligence cache cleared');
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        logger_js_1.logger.info('VCS Intelligence configuration updated', updates);
    }
}
exports.VCSIntelligence = VCSIntelligence;
//# sourceMappingURL=vcs-intelligence.js.map