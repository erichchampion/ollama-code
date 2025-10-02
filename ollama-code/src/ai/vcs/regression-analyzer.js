"use strict";
/**
 * Regression Analyzer
 *
 * AI-powered regression analysis system that identifies high-risk changes
 * that could potentially introduce bugs, performance issues, or breaking
 * changes. Uses machine learning and historical data to predict risk.
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
exports.RegressionAnalyzer = void 0;
const logger_js_1 = require("../../utils/logger.js");
const git_change_tracker_js_1 = require("../git-change-tracker.js");
const git_command_executor_js_1 = require("../../utils/git-command-executor.js");
const id_generator_js_1 = require("../../utils/id-generator.js");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * AI-powered regression analyzer for identifying high-risk changes
 */
class RegressionAnalyzer {
    constructor(config, aiClient) {
        this.historicalData = new Map();
        this.config = config;
        this.aiClient = aiClient;
        this.gitChangeTracker = new git_change_tracker_js_1.GitChangeTracker({
            repositoryPath: config.repositoryPath,
            trackingMode: 'working_directory',
            includeUntracked: false,
            excludePatterns: ['.git/**', 'node_modules/**'],
            maxCommits: config.analysisDepth
        });
    }
    /**
     * Analyze potential regressions in current changes
     */
    async analyzeRegressions(commits) {
        const startTime = Date.now();
        try {
            logger_js_1.logger.info('Starting regression analysis', {
                analysisDepth: this.config.analysisDepth,
                commitCount: commits?.length || 'auto-detect'
            });
            // Get commits to analyze
            const commitsToAnalyze = commits || await this.getRecentCommits();
            if (commitsToAnalyze.length === 0) {
                throw new Error('No commits found to analyze');
            }
            // Initialize change tracking
            await this.gitChangeTracker.initialize();
            // Analyze change set
            const changeSet = await this.analyzeChangeSet(commitsToAnalyze);
            // Perform risk assessment
            const riskAssessment = await this.performRiskAssessment(changeSet);
            // Generate predictions
            const predictions = await this.generatePredictions(changeSet, riskAssessment);
            // Generate recommendations
            const recommendations = await this.generateRecommendations(changeSet, riskAssessment, predictions);
            // Build historical context
            const historicalContext = await this.buildHistoricalContext(changeSet);
            // Calculate metrics
            const metrics = this.calculateMetrics(changeSet, historicalContext);
            const analysis = {
                analysisId: this.generateAnalysisId(),
                timestamp: new Date(),
                changeSet,
                riskAssessment,
                predictions,
                recommendations,
                historicalContext,
                metrics
            };
            logger_js_1.logger.info('Regression analysis completed', {
                analysisId: analysis.analysisId,
                overallRisk: riskAssessment.overallRisk,
                riskScore: riskAssessment.riskScore,
                predictionCount: predictions.length,
                analysisTime: Date.now() - startTime
            });
            return analysis;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze regressions', error);
            throw error;
        }
    }
    /**
     * Analyze a specific change set for regression risk
     */
    async analyzeSpecificChanges(filePaths, changeType) {
        try {
            logger_js_1.logger.info('Analyzing specific changes for regression risk', {
                fileCount: filePaths.length,
                changeType
            });
            // Get relevant commits based on change type
            let commits;
            switch (changeType) {
                case 'staged':
                    commits = await this.getCommitsForStagedChanges();
                    break;
                case 'committed':
                    commits = await this.getRecentCommits(1);
                    break;
                case 'branch':
                    commits = await this.getCommitsForBranch();
                    break;
                default:
                    commits = await this.getRecentCommits();
            }
            // Filter commits to only include specified files
            const filteredCommits = commits.map(commit => ({
                ...commit,
                files: commit.files.filter(file => filePaths.includes(file.path))
            })).filter(commit => commit.files.length > 0);
            return await this.analyzeRegressions(filteredCommits);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze specific changes', error);
            throw error;
        }
    }
    /**
     * Get recent commits for analysis
     */
    async getRecentCommits(limit) {
        try {
            const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
            // Get recent commits using git log
            const { stdout } = await execAsync(`git log --oneline -n ${limit || this.config.analysisDepth} --since=\"${sinceDate.toISOString()}\"`, { cwd: this.config.repositoryPath });
            const commits = stdout.trim().split('\n')
                .filter(line => line.trim())
                .map(line => {
                const [hash, ...messageParts] = line.split(' ');
                return {
                    hash,
                    message: messageParts.join(' '),
                    author: 'unknown',
                    email: 'unknown@unknown.com',
                    date: new Date(),
                    files: []
                };
            });
            return commits;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get recent commits', error);
            return [];
        }
    }
    /**
     * Get commits for staged changes
     */
    async getCommitsForStagedChanges() {
        try {
            // Create a virtual commit representing staged changes
            const { stdout: diffOutput } = await execAsync('git diff --cached --name-status', {
                cwd: this.config.repositoryPath
            });
            if (!diffOutput.trim()) {
                return [];
            }
            const files = [];
            const lines = diffOutput.trim().split('\n');
            for (const line of lines) {
                const [status, ...pathParts] = line.split('\t');
                const filePath = pathParts.join('\t');
                files.push({
                    path: filePath,
                    status: this.mapGitStatus(status),
                    insertions: 0, // Would need to calculate from actual diff
                    deletions: 0,
                    oldPath: status.startsWith('R') ? pathParts[0] : undefined
                });
            }
            return [{
                    hash: 'staged',
                    author: 'current-user',
                    email: 'current-user@local',
                    date: new Date(),
                    message: 'Staged changes',
                    files
                }];
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get staged changes', error);
            return [];
        }
    }
    /**
     * Get commits for current branch
     */
    async getCommitsForBranch() {
        try {
            // Get commits not in main branch
            const { stdout } = await execAsync('git log main..HEAD --format="%H|%an|%ae|%ad|%s" --date=iso', {
                cwd: this.config.repositoryPath
            });
            if (!stdout.trim()) {
                return [];
            }
            const commits = [];
            const lines = stdout.trim().split('\n');
            for (const line of lines) {
                const [hash, author, email, dateStr, message] = line.split('|');
                const date = new Date(dateStr);
                // Get files for this commit
                const files = await this.getFilesForCommit(hash);
                commits.push({
                    hash,
                    author,
                    email,
                    date,
                    message,
                    files
                });
            }
            return commits;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get branch commits', error);
            return [];
        }
    }
    /**
     * Get files changed in a specific commit
     */
    async getFilesForCommit(commitHash) {
        try {
            const result = await git_command_executor_js_1.GitCommandExecutor.showCommit(commitHash, {
                cwd: this.config.repositoryPath
            });
            if (result.exitCode !== 0) {
                throw new Error(`Git command failed: ${result.stderr}`);
            }
            const files = [];
            const lines = result.stdout.trim().split('\n').filter(line => line.length > 0);
            for (const line of lines) {
                const [status, ...pathParts] = line.split('\t');
                const filePath = pathParts.join('\t');
                files.push({
                    path: filePath,
                    status: this.mapGitStatus(status),
                    insertions: 0, // Would need --stat for actual numbers
                    deletions: 0,
                    oldPath: status.startsWith('R') ? pathParts[0] : undefined
                });
            }
            return files;
        }
        catch (error) {
            logger_js_1.logger.debug(`Failed to get files for commit ${commitHash}`, error);
            return [];
        }
    }
    /**
     * Analyze change set for risk factors
     */
    async analyzeChangeSet(commits) {
        try {
            // Analyze individual files
            const allFiles = commits.flatMap(c => c.files);
            const uniqueFiles = new Map();
            // Combine changes for the same file
            allFiles.forEach(file => {
                const existing = uniqueFiles.get(file.path);
                if (existing) {
                    existing.insertions += file.insertions;
                    existing.deletions += file.deletions;
                }
                else {
                    uniqueFiles.set(file.path, { ...file });
                }
            });
            const files = await Promise.all(Array.from(uniqueFiles.values()).map(file => this.analyzeFileChange(file)));
            // Analyze scope and impact
            const scope = this.analyzeChangeScope(files);
            const impact = await this.analyzeChangeImpact(files, scope);
            const timeline = this.estimateChangeTimeline(files, scope, impact);
            return {
                commits,
                files,
                scope,
                impact,
                timeline
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze change set', error);
            throw error;
        }
    }
    /**
     * Analyze individual file change
     */
    async analyzeFileChange(file) {
        try {
            const filePath = path.join(this.config.repositoryPath, file.path);
            // Analyze risk factors
            const riskFactors = await this.identifyFileRiskFactors(file);
            // Get historical pattern
            const historicalPattern = await this.getFileHistoricalPattern(file.path);
            // Analyze complexity
            const complexity = await this.analyzeFileComplexity(filePath);
            // Determine criticality
            const criticality = this.determineFileCriticality(file.path);
            return {
                path: file.path,
                changes: file,
                riskFactors,
                historicalPattern,
                complexity,
                criticality
            };
        }
        catch (error) {
            logger_js_1.logger.error(`Failed to analyze file change for ${file.path}`, error);
            // Return minimal analysis on error
            return {
                path: file.path,
                changes: file,
                riskFactors: [],
                historicalPattern: {
                    changeFrequency: 0,
                    averageChangeSize: 0,
                    bugProneness: 0,
                    stabilityScore: 50
                },
                complexity: {
                    cyclomaticComplexity: 0,
                    cognitiveComplexity: 0,
                    linesOfCode: 0,
                    dependencies: 0,
                    maintainabilityIndex: 50
                },
                criticality: {
                    level: 'medium',
                    reasons: ['Unknown'],
                    dependents: 0,
                    businessImpact: 'medium'
                }
            };
        }
    }
    /**
     * Identify risk factors for a file change
     */
    async identifyFileRiskFactors(file) {
        const factors = [];
        // Size-based risk
        const totalChanges = file.insertions + file.deletions;
        if (totalChanges > this.config.riskThresholds.linesChanged) {
            factors.push({
                type: 'size',
                severity: totalChanges > this.config.riskThresholds.linesChanged * 2 ? 'high' : 'medium',
                description: `Large change: ${totalChanges} lines modified`,
                impact: 'Higher chance of introducing bugs or breaking changes',
                likelihood: Math.min(90, totalChanges / 10),
                weight: 0.3,
                evidence: [`${file.insertions} insertions, ${file.deletions} deletions`]
            });
        }
        // Critical path risk
        const isCriticalPath = this.config.criticalPaths.some(pattern => file.path.match(new RegExp(pattern)));
        if (isCriticalPath) {
            factors.push({
                type: 'critical_path',
                severity: 'high',
                description: 'Changes to critical system path',
                impact: 'Could affect core system functionality',
                likelihood: 75,
                weight: 0.4,
                evidence: [`File matches critical path pattern`]
            });
        }
        // Test file risk
        const isTestFile = this.config.testPatterns.some(pattern => file.path.match(new RegExp(pattern)));
        if (!isTestFile && file.status === 'A') {
            factors.push({
                type: 'testing',
                severity: 'medium',
                description: 'New code without corresponding tests',
                impact: 'Untested code is more likely to contain bugs',
                likelihood: 60,
                weight: 0.2,
                evidence: ['New file added without test coverage']
            });
        }
        return factors;
    }
    /**
     * Get historical pattern for a file
     */
    async getFileHistoricalPattern(filePath) {
        try {
            // Get file history from git using secure executor
            const result = await git_command_executor_js_1.GitCommandExecutor.getFileHistory(filePath, {
                cwd: this.config.repositoryPath
            });
            if (result.exitCode !== 0) {
                throw new Error(`Git command failed: ${result.stderr}`);
            }
            const commits = result.stdout.trim().split('\n').filter(line => line.length > 0);
            const changeFrequency = commits.length;
            // Simple pattern analysis (in practice, this would be more sophisticated)
            return {
                changeFrequency: changeFrequency / 12, // per month estimate
                averageChangeSize: 50, // estimated
                bugProneness: Math.min(100, changeFrequency * 2), // rough estimate
                stabilityScore: Math.max(0, 100 - changeFrequency * 3)
            };
        }
        catch (error) {
            logger_js_1.logger.debug(`Failed to get historical pattern for ${filePath}`, error);
            return {
                changeFrequency: 0,
                averageChangeSize: 0,
                bugProneness: 0,
                stabilityScore: 50
            };
        }
    }
    /**
     * Analyze file complexity
     */
    async analyzeFileComplexity(filePath) {
        try {
            // Basic complexity analysis
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            // Simple metrics (in practice, would use AST analysis)
            const linesOfCode = lines.filter(line => line.trim().length > 0).length;
            const cyclomaticComplexity = this.estimateCyclomaticComplexity(content);
            const dependencies = this.countDependencies(content);
            return {
                cyclomaticComplexity,
                cognitiveComplexity: cyclomaticComplexity * 1.2, // rough estimate
                linesOfCode,
                dependencies,
                maintainabilityIndex: Math.max(0, 100 - cyclomaticComplexity - linesOfCode / 100)
            };
        }
        catch (error) {
            logger_js_1.logger.debug(`Failed to analyze complexity for ${filePath}`, error);
            return {
                cyclomaticComplexity: 0,
                cognitiveComplexity: 0,
                linesOfCode: 0,
                dependencies: 0,
                maintainabilityIndex: 50
            };
        }
    }
    /**
     * Estimate cyclomatic complexity
     */
    estimateCyclomaticComplexity(content) {
        // Simple pattern-based complexity estimation
        const complexityPatterns = [
            /\bif\b/g,
            /\belse\b/g,
            /\bwhile\b/g,
            /\bfor\b/g,
            /\bswitch\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\b\?\s*:/g, // ternary
            /\&\&/g,
            /\|\|/g
        ];
        let complexity = 1; // base complexity
        complexityPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });
        return complexity;
    }
    /**
     * Count dependencies in file
     */
    countDependencies(content) {
        const importPatterns = [
            /^import\s+/gm,
            /^from\s+.*\s+import/gm,
            /require\s*\(/g,
            /^#include\s+/gm
        ];
        let dependencies = 0;
        importPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                dependencies += matches.length;
            }
        });
        return dependencies;
    }
    /**
     * Determine file criticality
     */
    determineFileCriticality(filePath) {
        const reasons = [];
        let level = 'medium';
        let businessImpact = 'medium';
        // Check against critical paths
        if (this.config.criticalPaths.some(pattern => filePath.match(new RegExp(pattern)))) {
            level = 'critical';
            businessImpact = 'critical';
            reasons.push('Critical system path');
        }
        // Check file patterns
        if (filePath.includes('config') || filePath.includes('settings')) {
            level = 'high';
            reasons.push('Configuration file');
        }
        if (filePath.includes('auth') || filePath.includes('security')) {
            level = 'high';
            businessImpact = 'high';
            reasons.push('Security-related file');
        }
        if (filePath.includes('test')) {
            level = 'low';
            businessImpact = 'low';
            reasons.push('Test file');
        }
        return {
            level,
            reasons,
            dependents: 0, // Would need dependency analysis
            businessImpact
        };
    }
    /**
     * Analyze change scope
     */
    analyzeChangeScope(files) {
        const affectedModules = new Set();
        const dependencyImpacts = [];
        const apiChanges = [];
        // Identify affected modules
        files.forEach(file => {
            const pathParts = file.path.split('/');
            if (pathParts.length > 1) {
                affectedModules.add(pathParts[0]);
            }
        });
        // Determine scope type
        let type;
        if (affectedModules.size === 1 && files.length === 1) {
            type = 'isolated';
        }
        else if (affectedModules.size === 1) {
            type = 'module';
        }
        else if (affectedModules.size <= 3) {
            type = 'cross-cutting';
        }
        else {
            type = 'architectural';
        }
        return {
            type,
            affectedModules: Array.from(affectedModules),
            dependencyImpact: dependencyImpacts,
            apiChanges
        };
    }
    /**
     * Analyze change impact
     */
    async analyzeChangeImpact(files, scope) {
        const areas = [];
        const breakingChanges = [];
        // Determine impact level
        let level;
        const criticalFiles = files.filter(f => f.criticality.level === 'critical').length;
        const highRiskFiles = files.filter(f => f.riskFactors.some(rf => rf.severity === 'high')).length;
        if (criticalFiles > 0 || scope.type === 'architectural') {
            level = 'critical';
        }
        else if (highRiskFiles > 0 || scope.type === 'cross-cutting') {
            level = 'high';
        }
        else if (scope.type === 'module') {
            level = 'medium';
        }
        else {
            level = 'low';
        }
        return {
            level,
            areas,
            breakingChanges,
            performance: {
                risk: 'low',
                areas: [],
                estimatedDegradation: 0,
                affectedOperations: []
            },
            security: {
                risk: 'low',
                vulnerabilities: [],
                attackSurface: 'unchanged',
                complianceImpact: []
            }
        };
    }
    /**
     * Estimate change timeline
     */
    estimateChangeTimeline(files, scope, impact) {
        // Simple estimation based on scope and complexity
        const fileCount = files.length;
        const complexitySum = files.reduce((sum, f) => sum + f.complexity.cyclomaticComplexity, 0);
        const developmentTime = Math.max(1, fileCount * 2 + complexitySum * 0.5);
        const reviewTime = Math.max(0.5, developmentTime * 0.3);
        const testingTime = Math.max(0.5, developmentTime * 0.2);
        let deploymentRisk;
        if (impact.level === 'critical') {
            deploymentRisk = 'high';
        }
        else if (impact.level === 'high' || scope.type === 'cross-cutting') {
            deploymentRisk = 'medium';
        }
        else {
            deploymentRisk = 'low';
        }
        return {
            developmentTime,
            reviewTime,
            testingTime,
            deploymentRisk
        };
    }
    /**
     * Perform comprehensive risk assessment
     */
    async performRiskAssessment(changeSet) {
        const allRiskFactors = changeSet.files.flatMap(f => f.riskFactors);
        // Calculate weighted risk score
        let riskScore = 0;
        let totalWeight = 0;
        allRiskFactors.forEach(factor => {
            const severityScore = this.getSeverityScore(factor.severity);
            riskScore += factor.likelihood * severityScore * factor.weight;
            totalWeight += factor.weight;
        });
        if (totalWeight > 0) {
            riskScore = riskScore / totalWeight;
        }
        // Determine overall risk level
        let overallRisk;
        if (riskScore >= 80) {
            overallRisk = 'critical';
        }
        else if (riskScore >= 60) {
            overallRisk = 'high';
        }
        else if (riskScore >= 40) {
            overallRisk = 'medium';
        }
        else {
            overallRisk = 'low';
        }
        // Generate mitigation strategies
        const mitigationStrategies = this.generateMitigationStrategies(allRiskFactors, changeSet);
        return {
            overallRisk,
            riskScore: Math.round(riskScore),
            confidenceLevel: this.calculateConfidenceLevel(changeSet),
            riskFactors: allRiskFactors,
            mitigationStrategies
        };
    }
    /**
     * Generate regression predictions
     */
    async generatePredictions(changeSet, riskAssessment) {
        const predictions = [];
        // Bug prediction
        const bugProbability = this.calculateBugProbability(changeSet, riskAssessment);
        if (bugProbability > 20) {
            predictions.push({
                type: 'bug',
                probability: bugProbability,
                severity: bugProbability > 70 ? 'high' : bugProbability > 40 ? 'medium' : 'low',
                description: 'Potential for introducing bugs based on change patterns',
                affectedAreas: changeSet.scope.affectedModules,
                confidence: 75,
                basedOn: ['Historical bug patterns', 'Code complexity', 'Change size']
            });
        }
        // Performance prediction
        const performanceProbability = this.calculatePerformanceProbability(changeSet);
        if (performanceProbability > 15) {
            predictions.push({
                type: 'performance',
                probability: performanceProbability,
                severity: 'medium',
                description: 'Potential performance impact',
                affectedAreas: changeSet.scope.affectedModules,
                confidence: 60,
                basedOn: ['File complexity changes', 'Critical path modifications']
            });
        }
        return predictions;
    }
    /**
     * Generate recommendations
     */
    async generateRecommendations(changeSet, riskAssessment, predictions) {
        const recommendations = [];
        // High-risk change recommendations
        if (riskAssessment.overallRisk === 'critical' || riskAssessment.overallRisk === 'high') {
            recommendations.push({
                type: 'testing',
                priority: 'critical',
                title: 'Comprehensive Testing Required',
                description: 'High-risk changes detected. Comprehensive testing is strongly recommended.',
                action: 'Run full test suite including integration and end-to-end tests',
                effort: 'high',
                impact: 'high'
            });
            recommendations.push({
                type: 'review',
                priority: 'high',
                title: 'Senior Developer Review',
                description: 'Changes should be reviewed by senior team members',
                action: 'Assign experienced reviewers familiar with affected modules',
                effort: 'medium',
                impact: 'high'
            });
        }
        // Bug prediction recommendations
        const bugPredictions = predictions.filter(p => p.type === 'bug' && p.probability > 40);
        if (bugPredictions.length > 0) {
            recommendations.push({
                type: 'testing',
                priority: 'high',
                title: 'Enhanced Bug Testing',
                description: 'High bug probability detected. Focus on edge cases and error conditions.',
                action: 'Create additional test cases for edge scenarios',
                effort: 'medium',
                impact: 'high'
            });
        }
        // Performance recommendations
        const perfPredictions = predictions.filter(p => p.type === 'performance');
        if (perfPredictions.length > 0) {
            recommendations.push({
                type: 'monitoring',
                priority: 'medium',
                title: 'Performance Monitoring',
                description: 'Monitor performance metrics after deployment',
                action: 'Set up performance monitoring and alerts for affected areas',
                effort: 'low',
                impact: 'medium'
            });
        }
        // Deployment recommendations
        if (changeSet.impact.level === 'critical') {
            recommendations.push({
                type: 'deployment',
                priority: 'high',
                title: 'Staged Rollout',
                description: 'Critical changes should be deployed gradually',
                action: 'Use feature flags or staged deployment strategy',
                effort: 'medium',
                impact: 'high'
            });
        }
        return recommendations;
    }
    /**
     * Build historical context
     */
    async buildHistoricalContext(changeSet) {
        const similarChanges = [];
        const fileHistory = [];
        const patterns = [];
        // Author history (simplified)
        const authors = [...new Set(changeSet.commits.map(c => c.author))];
        const authorHistory = {
            author: authors[0] || 'unknown',
            experience: 12, // months - would be calculated from actual data
            successRate: 85, // would be calculated from historical data
            specialties: ['general'],
            riskProfile: 'moderate',
            recentPerformance: []
        };
        return {
            similarChanges,
            authorHistory,
            fileHistory,
            patterns
        };
    }
    /**
     * Calculate regression metrics
     */
    calculateMetrics(changeSet, historicalContext) {
        return {
            filesAnalyzed: changeSet.files.length,
            commitsAnalyzed: changeSet.commits.length,
            linesChanged: changeSet.files.reduce((sum, f) => sum + f.changes.insertions + f.changes.deletions, 0),
            complexityScore: Math.round(changeSet.files.reduce((sum, f) => sum + f.complexity.cyclomaticComplexity, 0) / changeSet.files.length),
            testCoverage: 75, // would be calculated from actual test analysis
            reviewCoverage: 100, // assuming all changes will be reviewed
            historicalAccuracy: 80 // accuracy of historical predictions
        };
    }
    // Helper methods
    getSeverityScore(severity) {
        switch (severity) {
            case 'critical': return 4;
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 1;
        }
    }
    calculateConfidenceLevel(changeSet) {
        // Simple confidence calculation based on data availability
        let confidence = 50; // base confidence
        // More files = more data = higher confidence
        confidence += Math.min(20, changeSet.files.length * 2);
        // Historical data availability
        confidence += 10; // assume some historical data
        return Math.min(100, confidence);
    }
    calculateBugProbability(changeSet, riskAssessment) {
        let probability = 0;
        // Base probability from risk score
        probability += riskAssessment.riskScore * 0.6;
        // Adjust based on file complexity
        const avgComplexity = changeSet.files.reduce((sum, f) => sum + f.complexity.cyclomaticComplexity, 0) / changeSet.files.length;
        probability += Math.min(20, avgComplexity * 2);
        // Adjust based on change size
        const totalChanges = changeSet.files.reduce((sum, f) => sum + f.changes.insertions + f.changes.deletions, 0);
        probability += Math.min(15, totalChanges / 100);
        return Math.min(100, Math.round(probability));
    }
    calculatePerformanceProbability(changeSet) {
        // Performance impact is more specific
        const criticalFiles = changeSet.files.filter(f => f.criticality.level === 'critical').length;
        const complexChanges = changeSet.files.filter(f => f.changes.insertions + f.changes.deletions > 100).length;
        let probability = 0;
        probability += criticalFiles * 15;
        probability += complexChanges * 10;
        return Math.min(100, probability);
    }
    generateMitigationStrategies(riskFactors, changeSet) {
        const strategies = [];
        // Testing strategy for high-risk changes
        if (riskFactors.some(rf => rf.severity === 'critical' || rf.severity === 'high')) {
            strategies.push({
                type: 'prevention',
                strategy: 'Implement comprehensive test coverage before deployment',
                effort: 'high',
                effectiveness: 85,
                timeframe: 'before deployment'
            });
        }
        // Monitoring strategy
        strategies.push({
            type: 'detection',
            strategy: 'Set up enhanced monitoring and alerting',
            effort: 'medium',
            effectiveness: 75,
            timeframe: 'during deployment'
        });
        // Rollback strategy
        strategies.push({
            type: 'recovery',
            strategy: 'Prepare rollback procedures and test them',
            effort: 'low',
            effectiveness: 90,
            timeframe: 'before deployment'
        });
        return strategies;
    }
    mapGitStatus(status) {
        switch (status[0]) {
            case 'A': return 'A';
            case 'M': return 'M';
            case 'D': return 'D';
            case 'R': return 'R';
            case 'C': return 'C';
            default: return 'M';
        }
    }
    generateAnalysisId() {
        return (0, id_generator_js_1.generateRegressionId)();
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        logger_js_1.logger.info('Regression analyzer configuration updated', updates);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.RegressionAnalyzer = RegressionAnalyzer;
//# sourceMappingURL=regression-analyzer.js.map