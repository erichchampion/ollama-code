"use strict";
/**
 * Code Quality Tracker
 *
 * Comprehensive code quality tracking system that monitors quality trends
 * over time, tracks metrics across commits, and provides insights into
 * code health evolution. Integrates with VCS to provide historical analysis.
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
exports.CodeQualityTracker = void 0;
const logger_js_1 = require("../../utils/logger.js");
const git_change_tracker_js_1 = require("../git-change-tracker.js");
const automated_code_reviewer_js_1 = require("../automated-code-reviewer.js");
const security_analyzer_js_1 = require("../security-analyzer.js");
const performance_analyzer_js_1 = require("../performance-analyzer.js");
const id_generator_js_1 = require("../../utils/id-generator.js");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Comprehensive code quality tracking and analysis system
 */
class CodeQualityTracker {
    constructor(config) {
        this.snapshots = new Map();
        this.trends = new Map();
        this.config = config;
        this.gitChangeTracker = new git_change_tracker_js_1.GitChangeTracker({
            repositoryPath: config.repositoryPath,
            trackingMode: 'working_directory',
            includeUntracked: false,
            excludePatterns: ['.git/**', 'node_modules/**', 'dist/**'],
            maxCommits: 100
        });
        this.codeReviewer = new automated_code_reviewer_js_1.AutomatedCodeReviewer();
        this.securityAnalyzer = new security_analyzer_js_1.SecurityAnalyzer();
        this.performanceAnalyzer = new performance_analyzer_js_1.PerformanceAnalyzer();
    }
    /**
     * Initialize quality tracking
     */
    async initialize() {
        try {
            logger_js_1.logger.info('Initializing code quality tracker', {
                repository: this.config.repositoryPath,
                interval: this.config.trackingInterval
            });
            await this.gitChangeTracker.initialize();
            await this.loadHistoricalData();
            logger_js_1.logger.info('Code quality tracker initialized successfully');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to initialize code quality tracker', error);
            throw error;
        }
    }
    /**
     * Take a quality snapshot of current repository state
     */
    async takeSnapshot(commitHash) {
        const startTime = Date.now();
        try {
            logger_js_1.logger.info('Taking quality snapshot', { commitHash });
            // Get commit information
            const commit = commitHash ? await this.getCommitInfo(commitHash) : await this.getCurrentCommit();
            if (!commit) {
                throw new Error('Unable to determine commit information');
            }
            // Analyze code quality
            const metrics = await this.analyzeQualityMetrics();
            // Calculate trends
            const trends = await this.calculateTrends();
            // Identify issues
            const issues = await this.identifyQualityIssues();
            // Generate recommendations
            const recommendations = await this.generateRecommendations(metrics, trends, issues);
            // Check for alerts
            const alerts = await this.checkAlerts(metrics, trends);
            const snapshot = {
                id: this.generateSnapshotId(),
                timestamp: new Date(),
                commitHash: commit.hash,
                author: commit.author,
                message: commit.message,
                metrics,
                trends,
                issues,
                recommendations,
                alerts
            };
            // Store snapshot
            await this.storeSnapshot(snapshot);
            // Update trends
            await this.updateTrends(snapshot);
            logger_js_1.logger.info('Quality snapshot completed', {
                snapshotId: snapshot.id,
                overallScore: metrics.overallScore,
                issueCount: issues.length,
                alertCount: alerts.length,
                processingTime: Date.now() - startTime
            });
            return snapshot;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to take quality snapshot', error);
            throw error;
        }
    }
    /**
     * Track quality changes over a period
     */
    async trackPeriod(startDate, endDate) {
        try {
            logger_js_1.logger.info('Tracking quality over period', { startDate, endDate });
            const commits = await this.gitChangeTracker.getRecentCommits(100);
            const filteredCommits = commits.filter(c => c.date <= endDate);
            const snapshots = [];
            for (const commit of filteredCommits) {
                try {
                    const snapshot = await this.takeSnapshot(commit.hash);
                    snapshots.push(snapshot);
                }
                catch (error) {
                    logger_js_1.logger.warn(`Failed to analyze commit ${commit.hash}`, error);
                }
            }
            return snapshots;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to track quality period', error);
            throw error;
        }
    }
    /**
     * Generate comprehensive quality report
     */
    async generateReport(period) {
        try {
            logger_js_1.logger.info('Generating quality report', period);
            const snapshots = await this.getSnapshotsInPeriod(period.start, period.end);
            if (snapshots.length === 0) {
                throw new Error('No quality data available for the specified period');
            }
            const latestSnapshot = snapshots[snapshots.length - 1];
            const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
            const summary = this.generateQualitySummary(latestSnapshot, previousSnapshot);
            const trends = await this.calculateTrends();
            const topIssues = this.getTopIssues(snapshots);
            const improvements = this.identifyImprovements(snapshots);
            const recommendations = await this.generateRecommendations(latestSnapshot.metrics, trends, topIssues);
            const metrics = snapshots.map(s => s.metrics);
            return {
                period,
                summary,
                trends,
                topIssues,
                improvements,
                recommendations,
                metrics
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to generate quality report', error);
            throw error;
        }
    }
    /**
     * Analyze current code quality metrics
     */
    async analyzeQualityMetrics() {
        try {
            // Get all source files
            const sourceFiles = await this.getSourceFiles();
            // Analyze code quality
            const codeQuality = await this.analyzeCodeQuality(sourceFiles);
            // Analyze security
            const security = await this.analyzeSecurityMetrics(sourceFiles);
            // Analyze performance
            const performance = await this.analyzePerformanceMetrics(sourceFiles);
            // Analyze testing
            const testing = await this.analyzeTestingMetrics();
            // Analyze maintainability
            const maintainability = await this.analyzeMaintainabilityMetrics(sourceFiles);
            // Analyze technical debt
            const technical_debt = await this.analyzeTechnicalDebt(codeQuality, security, performance);
            // Calculate overall score
            const overallScore = this.calculateOverallScore({
                codeQuality,
                security,
                performance,
                testing,
                maintainability,
                technical_debt
            });
            return {
                overallScore,
                codeQuality,
                security,
                performance,
                testing,
                maintainability,
                technical_debt
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze quality metrics', error);
            throw error;
        }
    }
    /**
     * Analyze code quality metrics
     */
    async analyzeCodeQuality(sourceFiles) {
        let totalLoc = 0;
        let totalComplexity = 0;
        let totalIssues = 0;
        let bugs = 0;
        let vulnerabilities = 0;
        let codeSmells = 0;
        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf-8');
                const review = await this.codeReviewer.reviewCode({
                    files: [{
                            path: file,
                            content: content
                        }]
                });
                const lines = content.split('\n').filter(line => line.trim().length > 0).length;
                totalLoc += lines;
                totalComplexity += this.calculateFileComplexity(content);
                totalIssues += review.issues?.length || 0;
                // Categorize issues
                (review.issues || []).forEach((issue) => {
                    if (issue.severity === 'critical' || issue.severity === 'major')
                        bugs++;
                    else if (issue.category === 'security')
                        vulnerabilities++;
                    else
                        codeSmells++;
                });
            }
            catch (error) {
                logger_js_1.logger.debug(`Failed to analyze file ${file}`, error);
            }
        }
        const avgComplexity = sourceFiles.length > 0 ? totalComplexity / sourceFiles.length : 0;
        const score = Math.max(0, 100 - (totalIssues * 2) - (avgComplexity > 10 ? 20 : 0));
        return {
            score: Math.round(score),
            linesOfCode: totalLoc,
            cyclomaticComplexity: Math.round(avgComplexity),
            cognitiveComplexity: Math.round(avgComplexity * 1.2),
            duplicationPercentage: 5, // simplified
            codeSmells,
            bugs,
            vulnerabilities
        };
    }
    /**
     * Analyze security metrics
     */
    async analyzeSecurityMetrics(sourceFiles) {
        try {
            const allVulnerabilities = [];
            // Analyze each file individually since analyzeFile only accepts single file
            for (const file of sourceFiles) {
                const results = await this.securityAnalyzer.analyzeFile(file);
                allVulnerabilities.push(...results);
            }
            const vulnerabilities = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            };
            allVulnerabilities.forEach(vuln => {
                switch (vuln.severity) {
                    case 'critical':
                        vulnerabilities.critical++;
                        break;
                    case 'high':
                        vulnerabilities.high++;
                        break;
                    case 'medium':
                        vulnerabilities.medium++;
                        break;
                    case 'low':
                        vulnerabilities.low++;
                        break;
                    default:
                        vulnerabilities.info++;
                }
            });
            const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
            const score = Math.max(0, 100 - (vulnerabilities.critical * 25) - (vulnerabilities.high * 15) - (vulnerabilities.medium * 5));
            let rating;
            if (score >= 90)
                rating = 'A';
            else if (score >= 80)
                rating = 'B';
            else if (score >= 70)
                rating = 'C';
            else if (score >= 60)
                rating = 'D';
            else
                rating = 'E';
            return {
                score: Math.round(score),
                vulnerabilities,
                securityHotspots: totalVulns,
                securityRating: rating,
                complianceScore: Math.round(score * 0.9) // simplified
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze security metrics', error);
            return {
                score: 50,
                vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
                securityHotspots: 0,
                securityRating: 'C',
                complianceScore: 50
            };
        }
    }
    /**
     * Analyze performance metrics
     */
    async analyzePerformanceMetrics(sourceFiles) {
        try {
            const allIssues = [];
            // Analyze each file individually since analyzeFile only accepts single file
            for (const file of sourceFiles) {
                const results = await this.performanceAnalyzer.analyzeFile(file, {
                    severityThreshold: 'info',
                    analyzeComplexity: true,
                    checkMemoryLeaks: true
                });
                allIssues.push(...results.issues);
            }
            const issuesByType = new Map();
            allIssues.forEach(issue => {
                const count = issuesByType.get(issue.type || 'unknown') || 0;
                issuesByType.set(issue.type || 'unknown', count + 1);
            });
            const score = Math.max(0, 100 - (allIssues.length * 5));
            return {
                score: Math.round(score),
                performanceIssues: allIssues.length,
                memoryLeaks: issuesByType.get('memory') || 0,
                inefficientAlgorithms: issuesByType.get('algorithm') || 0,
                databaseIssues: issuesByType.get('database') || 0,
                networkIssues: issuesByType.get('network') || 0
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze performance metrics', error);
            return {
                score: 75,
                performanceIssues: 0,
                memoryLeaks: 0,
                inefficientAlgorithms: 0,
                databaseIssues: 0,
                networkIssues: 0
            };
        }
    }
    /**
     * Analyze testing metrics
     */
    async analyzeTestingMetrics() {
        try {
            // This would integrate with actual test coverage tools
            // For now, provide estimated metrics
            const testFiles = await this.getTestFiles();
            const sourceFiles = await this.getSourceFiles();
            const testToSourceRatio = sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0;
            const coverageEstimate = Math.min(100, testToSourceRatio * 100);
            const coverage = {
                overall: Math.round(coverageEstimate),
                lines: Math.round(coverageEstimate * 0.9),
                branches: Math.round(coverageEstimate * 0.8),
                functions: Math.round(coverageEstimate * 0.95),
                statements: Math.round(coverageEstimate * 0.85)
            };
            const testQuality = {
                score: Math.round(75 + (testToSourceRatio * 25)),
                testCount: testFiles.length,
                testDensity: testFiles.length * 1000 / Math.max(1, await this.getTotalLinesOfCode()),
                testComplexity: 5, // simplified
                mockUsage: 60, // percentage
                assertionDensity: 3 // assertions per test
            };
            return {
                coverage,
                testQuality,
                testMaintainability: Math.round((coverage.overall + testQuality.score) / 2)
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze testing metrics', error);
            return {
                coverage: { overall: 0, lines: 0, branches: 0, functions: 0, statements: 0 },
                testQuality: { score: 0, testCount: 0, testDensity: 0, testComplexity: 0, mockUsage: 0, assertionDensity: 0 },
                testMaintainability: 0
            };
        }
    }
    /**
     * Analyze maintainability metrics
     */
    async analyzeMaintainabilityMetrics(sourceFiles) {
        try {
            let totalComplexity = 0;
            let totalLoc = 0;
            for (const file of sourceFiles) {
                try {
                    const content = await fs.readFile(file, 'utf-8');
                    const loc = content.split('\n').filter(line => line.trim().length > 0).length;
                    const complexity = this.calculateFileComplexity(content);
                    totalLoc += loc;
                    totalComplexity += complexity;
                }
                catch (error) {
                    logger_js_1.logger.debug(`Failed to analyze file ${file}`, error);
                }
            }
            const avgComplexity = sourceFiles.length > 0 ? totalComplexity / sourceFiles.length : 0;
            const index = Math.max(0, 100 - (avgComplexity * 2) - (totalLoc / 1000));
            return {
                index: Math.round(index),
                technicalDebtRatio: 10, // simplified percentage
                codeReadability: Math.round(100 - avgComplexity * 3),
                documentation: 60, // simplified percentage
                structuralQuality: Math.round(index * 0.9)
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to analyze maintainability metrics', error);
            return {
                index: 50,
                technicalDebtRatio: 20,
                codeReadability: 50,
                documentation: 50,
                structuralQuality: 50
            };
        }
    }
    /**
     * Analyze technical debt
     */
    async analyzeTechnicalDebt(codeQuality, security, performance) {
        const debtByCategory = {
            bugs: codeQuality.bugs * 2, // hours
            vulnerabilities: security.vulnerabilities.critical * 8 + security.vulnerabilities.high * 4 + security.vulnerabilities.medium * 2,
            codeSmells: codeQuality.codeSmells * 0.5,
            coverage: Math.max(0, (this.config.qualityThresholds.minTestCoverage - 75) * 0.1), // assuming 75% current coverage
            duplication: codeQuality.duplicationPercentage * 0.5,
            design: performance.performanceIssues * 1.5
        };
        const totalHours = Object.values(debtByCategory).reduce((sum, hours) => sum + hours, 0);
        // Get previous debt for trend calculation
        const previousSnapshot = await this.getLatestSnapshot();
        const previousDebt = previousSnapshot?.metrics.technical_debt.totalHours || totalHours;
        const debtChange = totalHours - previousDebt;
        let debtTrend;
        if (Math.abs(debtChange) < 1) {
            debtTrend = 'stable';
        }
        else if (debtChange < 0) {
            debtTrend = 'improving';
        }
        else {
            debtTrend = 'degrading';
        }
        return {
            totalHours: Math.round(totalHours),
            newDebt: Math.max(0, debtChange),
            resolvedDebt: Math.max(0, -debtChange),
            debtByCategory,
            debtTrend
        };
    }
    /**
     * Calculate overall quality score
     */
    calculateOverallScore(metrics) {
        const weights = {
            codeQuality: 0.25,
            security: 0.25,
            performance: 0.15,
            testing: 0.20,
            maintainability: 0.15
        };
        let score = 0;
        score += metrics.codeQuality.score * weights.codeQuality;
        score += metrics.security.score * weights.security;
        score += metrics.performance.score * weights.performance;
        score += metrics.testing.coverage.overall * weights.testing;
        score += metrics.maintainability.index * weights.maintainability;
        return Math.round(score);
    }
    /**
     * Calculate quality trends
     */
    async calculateTrends() {
        const period = 'month';
        const snapshots = await this.getRecentSnapshots(30); // Last 30 days
        if (snapshots.length < 2) {
            return {
                period,
                overallTrend: 'unknown',
                categoryTrends: this.getEmptyCategoryTrends(),
                predictions: []
            };
        }
        const categoryTrends = this.calculateCategoryTrends(snapshots);
        const overallTrend = this.calculateOverallTrend(snapshots);
        const predictions = await this.generateQualityPredictions(snapshots);
        return {
            period,
            overallTrend,
            categoryTrends,
            predictions
        };
    }
    /**
     * Calculate category trends
     */
    calculateCategoryTrends(snapshots) {
        const categories = ['codeQuality', 'security', 'performance', 'testing', 'maintainability', 'technicalDebt'];
        const trends = {};
        categories.forEach(category => {
            const dataPoints = snapshots.map(snapshot => ({
                timestamp: snapshot.timestamp,
                value: this.getMetricValue(snapshot.metrics, category),
                context: snapshot.commitHash
            }));
            trends[category] = this.calculateTrendData(dataPoints);
        });
        return trends;
    }
    /**
     * Get metric value for trend calculation
     */
    getMetricValue(metrics, category) {
        switch (category) {
            case 'codeQuality':
                return metrics.codeQuality.score;
            case 'security':
                return metrics.security.score;
            case 'performance':
                return metrics.performance.score;
            case 'testing':
                return metrics.testing.coverage.overall;
            case 'maintainability':
                return metrics.maintainability.index;
            case 'technicalDebt':
                return 100 - Math.min(100, metrics.technical_debt.totalHours / 10); // invert debt for trend
            default:
                return 0;
        }
    }
    /**
     * Calculate trend data from data points
     */
    calculateTrendData(dataPoints) {
        if (dataPoints.length < 2) {
            return {
                direction: 'unknown',
                change: 0,
                velocity: 0,
                confidence: 0,
                dataPoints
            };
        }
        const firstValue = dataPoints[0].value;
        const lastValue = dataPoints[dataPoints.length - 1].value;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        let direction;
        if (Math.abs(change) < 2) {
            direction = 'stable';
        }
        else if (change > 0) {
            direction = 'improving';
        }
        else {
            direction = 'degrading';
        }
        // Calculate velocity (change per day)
        const timeDiff = dataPoints[dataPoints.length - 1].timestamp.getTime() - dataPoints[0].timestamp.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        const velocity = daysDiff > 0 ? Math.abs(change) / daysDiff : 0;
        // Calculate confidence based on data points and consistency
        const confidence = Math.min(100, dataPoints.length * 10 + (100 - Math.abs(change) * 2));
        return {
            direction,
            change: Math.round(change * 100) / 100,
            velocity: Math.round(velocity * 100) / 100,
            confidence: Math.round(confidence),
            dataPoints
        };
    }
    // Helper methods and remaining implementation...
    async getSourceFiles() {
        try {
            const { stdout } = await execAsync('find . -name "*.ts" -o -name "*.js" -o -name "*.py" | grep -v node_modules | grep -v dist | grep -v ".test." | grep -v ".spec."', {
                cwd: this.config.repositoryPath
            });
            return stdout.trim().split('\n').filter(line => line.length > 0).map(file => path.join(this.config.repositoryPath, file));
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get source files', error);
            return [];
        }
    }
    async getTestFiles() {
        try {
            const { stdout } = await execAsync('find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules', {
                cwd: this.config.repositoryPath
            });
            return stdout.trim().split('\n').filter(line => line.length > 0);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get test files', error);
            return [];
        }
    }
    calculateFileComplexity(content) {
        // Simple complexity calculation
        const complexityPatterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g];
        let complexity = 1;
        complexityPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches)
                complexity += matches.length;
        });
        return complexity;
    }
    async getTotalLinesOfCode() {
        const sourceFiles = await this.getSourceFiles();
        let totalLoc = 0;
        for (const file of sourceFiles) {
            try {
                const content = await fs.readFile(file, 'utf-8');
                totalLoc += content.split('\n').filter(line => line.trim().length > 0).length;
            }
            catch (error) {
                logger_js_1.logger.debug(`Failed to count lines in ${file}`, error);
            }
        }
        return totalLoc;
    }
    // Storage and data management methods would be implemented here
    async loadHistoricalData() {
        // Implementation for loading historical quality data
    }
    async storeSnapshot(snapshot) {
        this.snapshots.set(snapshot.id, snapshot);
        // Would persist to storage backend
    }
    async getLatestSnapshot() {
        const snapshots = Array.from(this.snapshots.values());
        return snapshots.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    }
    async getRecentSnapshots(days) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return Array.from(this.snapshots.values())
            .filter(s => s.timestamp >= cutoff)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    async getSnapshotsInPeriod(start, end) {
        return Array.from(this.snapshots.values())
            .filter(s => s.timestamp >= start && s.timestamp <= end)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    // More helper methods would be implemented here...
    generateSnapshotId() {
        return (0, id_generator_js_1.generateSnapshotId)();
    }
    async getCommitInfo(commitHash) {
        try {
            const commits = await this.gitChangeTracker.getRecentCommits(1);
            return commits.find(c => c.hash === commitHash) || null;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get commit info', error);
            return null;
        }
    }
    async getCurrentCommit() {
        try {
            const { stdout } = await execAsync('git log -1 --format="%H|%an|%ae|%ad|%s"', {
                cwd: this.config.repositoryPath
            });
            const [hash, author, email, dateStr, message] = stdout.trim().split('|');
            return {
                hash,
                author,
                email,
                date: new Date(dateStr),
                message,
                files: []
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get current commit', error);
            return null;
        }
    }
    // Placeholder implementations for remaining methods
    async identifyQualityIssues() { return []; }
    async generateRecommendations(metrics, trends, issues) { return []; }
    async checkAlerts(metrics, trends) { return []; }
    async updateTrends(snapshot) { }
    calculateOverallTrend(snapshots) { return 'stable'; }
    async generateQualityPredictions(snapshots) { return []; }
    getEmptyCategoryTrends() {
        const emptyTrend = {
            direction: 'unknown',
            change: 0,
            velocity: 0,
            confidence: 0,
            dataPoints: []
        };
        return {
            codeQuality: emptyTrend,
            security: emptyTrend,
            performance: emptyTrend,
            testing: emptyTrend,
            maintainability: emptyTrend,
            technicalDebt: emptyTrend
        };
    }
    generateQualitySummary(latest, previous) {
        const score = latest.metrics.overallScore;
        let health;
        if (score >= 90)
            health = 'excellent';
        else if (score >= 80)
            health = 'good';
        else if (score >= 70)
            health = 'fair';
        else if (score >= 60)
            health = 'poor';
        else
            health = 'critical';
        const changeFromPrevious = previous ? ((score - previous.metrics.overallScore) / previous.metrics.overallScore) * 100 : 0;
        return {
            overallHealth: health,
            qualityScore: score,
            changeFromPrevious: Math.round(changeFromPrevious * 100) / 100,
            keyHighlights: ['Quality metrics tracked successfully'],
            majorConcerns: score < 70 ? ['Quality score below recommended threshold'] : []
        };
    }
    getTopIssues(snapshots) {
        return snapshots[snapshots.length - 1]?.issues.slice(0, 10) || [];
    }
    identifyImprovements(snapshots) { return []; }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        logger_js_1.logger.info('Code quality tracker configuration updated', updates);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.CodeQualityTracker = CodeQualityTracker;
//# sourceMappingURL=code-quality-tracker.js.map