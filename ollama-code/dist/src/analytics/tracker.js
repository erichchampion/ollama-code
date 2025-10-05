/**
 * Analytics and Progress Tracking System
 *
 * Provides comprehensive tracking and analytics including:
 * - Command usage patterns and frequency
 * - User workflow analytics and insights
 * - Progress tracking for long-running operations
 * - Performance metrics and trends
 * - Feature adoption and usage statistics
 */
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { createSpinner } from '../utils/spinner.js';
import { THRESHOLD_CONSTANTS } from '../config/constants.js';
export class AnalyticsTracker {
    analyticsDir;
    eventsFile;
    sessionsFile;
    currentSession = null;
    activeTasks = new Map();
    workflowPatterns = [];
    constructor() {
        this.analyticsDir = path.join(process.env.HOME || '~', '.ollama-code', 'analytics');
        this.eventsFile = path.join(this.analyticsDir, 'events.jsonl');
        this.sessionsFile = path.join(this.analyticsDir, 'sessions.jsonl');
        this.initializeTracking();
    }
    /**
     * Initialize analytics tracking
     */
    async initializeTracking() {
        try {
            await fs.mkdir(this.analyticsDir, { recursive: true });
            await this.startSession();
            this.setupCleanup();
        }
        catch (error) {
            logger.debug('Analytics initialization failed:', error);
        }
    }
    /**
     * Start a new tracking session
     */
    async startSession() {
        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            commandCount: 0,
            successfulCommands: 0,
            failedCommands: 0,
            totalDuration: 0
        };
        logger.debug(`Analytics session started: ${this.currentSession.sessionId}`);
    }
    /**
     * End current tracking session
     */
    async endSession() {
        if (!this.currentSession)
            return;
        this.currentSession.endTime = Date.now();
        try {
            const sessionLine = JSON.stringify(this.currentSession) + '\n';
            await fs.appendFile(this.sessionsFile, sessionLine);
            logger.debug(`Analytics session ended: ${this.currentSession.sessionId}`);
        }
        catch (error) {
            logger.debug('Failed to save session:', error);
        }
        this.currentSession = null;
    }
    /**
     * Track command execution
     */
    async trackCommand(command, args, duration, success, errorCategory) {
        try {
            const event = {
                command,
                args: this.sanitizeArgs(args),
                timestamp: Date.now(),
                duration,
                success,
                errorCategory,
                contextInfo: await this.gatherContextInfo()
            };
            // Save event
            const eventLine = JSON.stringify(event) + '\n';
            await fs.appendFile(this.eventsFile, eventLine);
            // Update current session
            if (this.currentSession) {
                this.currentSession.commandCount++;
                this.currentSession.totalDuration += duration;
                if (success) {
                    this.currentSession.successfulCommands++;
                }
                else {
                    this.currentSession.failedCommands++;
                }
            }
            // Update workflow patterns
            await this.updateWorkflowPatterns(command);
            logger.debug(`Command tracked: ${command} (${success ? 'success' : 'failed'})`);
        }
        catch (error) {
            logger.debug('Failed to track command:', error);
        }
    }
    /**
     * Start tracking a long-running task
     */
    startTask(id, name, description, totalSteps, estimatedDuration) {
        const task = {
            id,
            name,
            description,
            startTime: Date.now(),
            estimatedDuration,
            currentStep: 0,
            totalSteps,
            status: 'running'
        };
        this.activeTasks.set(id, task);
        logger.debug(`Task started: ${name} (${id})`);
        return task;
    }
    /**
     * Update task progress
     */
    updateTaskProgress(id, currentStep, details, status) {
        const task = this.activeTasks.get(id);
        if (!task)
            return false;
        task.currentStep = currentStep;
        if (details)
            task.details = details;
        if (status)
            task.status = status;
        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
            this.activeTasks.delete(id);
        }
        return true;
    }
    /**
     * Get current task progress
     */
    getTaskProgress(id) {
        return this.activeTasks.get(id) || null;
    }
    /**
     * Get all active tasks
     */
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }
    /**
     * Generate comprehensive usage statistics
     */
    async generateUsageStats(days = 30) {
        const spinner = createSpinner('Generating usage statistics...');
        spinner.start();
        try {
            const events = await this.loadEvents(days);
            const sessions = await this.loadSessions(days);
            const stats = {
                totalCommands: events.length,
                totalSessions: sessions.length,
                averageSessionDuration: this.calculateAverageSessionDuration(sessions),
                mostUsedCommands: this.calculateCommandFrequency(events),
                successRate: this.calculateSuccessRate(events),
                dailyUsage: this.calculateDailyUsage(events, days),
                featureAdoption: this.calculateFeatureAdoption(events)
            };
            spinner.succeed('Usage statistics generated');
            return stats;
        }
        catch (error) {
            spinner.fail('Failed to generate usage statistics');
            throw error;
        }
    }
    /**
     * Get workflow patterns and insights
     */
    async getWorkflowInsights() {
        const events = await this.loadEvents(7); // Last 7 days
        const patterns = this.analyzeWorkflowPatterns(events);
        return {
            patterns,
            recommendations: this.generateRecommendations(patterns, events),
            inefficiencies: this.identifyInefficiencies(events)
        };
    }
    /**
     * Export analytics data
     */
    async exportAnalytics(filePath, format = 'json') {
        const spinner = createSpinner('Exporting analytics data...');
        spinner.start();
        try {
            const events = await this.loadEvents();
            const sessions = await this.loadSessions();
            const stats = await this.generateUsageStats();
            const exportData = {
                metadata: {
                    exportTime: Date.now(),
                    version: '1.0',
                    format
                },
                stats,
                events: events.slice(-1000), // Last 1000 events
                sessions: sessions.slice(-100), // Last 100 sessions
                workflowPatterns: this.workflowPatterns
            };
            if (format === 'json') {
                await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
            }
            else {
                const csv = this.convertToCSV(exportData);
                await fs.writeFile(filePath, csv);
            }
            spinner.succeed(`Analytics data exported to ${filePath}`);
        }
        catch (error) {
            spinner.fail('Failed to export analytics data');
            throw error;
        }
    }
    /**
     * Clear analytics data
     */
    async clearAnalytics(olderThanDays) {
        const spinner = createSpinner('Clearing analytics data...');
        spinner.start();
        try {
            if (olderThanDays) {
                const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
                await this.pruneOldData(cutoffTime);
                spinner.succeed(`Analytics data older than ${olderThanDays} days cleared`);
            }
            else {
                await fs.unlink(this.eventsFile).catch(() => { });
                await fs.unlink(this.sessionsFile).catch(() => { });
                spinner.succeed('All analytics data cleared');
            }
        }
        catch (error) {
            spinner.fail('Failed to clear analytics data');
            throw error;
        }
    }
    /**
     * Load events from file
     */
    async loadEvents(days) {
        try {
            const content = await fs.readFile(this.eventsFile, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);
            let events = lines.map(line => JSON.parse(line));
            if (days) {
                const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
                events = events.filter(event => event.timestamp >= cutoffTime);
            }
            return events;
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Load sessions from file
     */
    async loadSessions(days) {
        try {
            const content = await fs.readFile(this.sessionsFile, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);
            let sessions = lines.map(line => JSON.parse(line));
            if (days) {
                const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
                sessions = sessions.filter(session => session.startTime >= cutoffTime);
            }
            return sessions;
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Calculate command frequency
     */
    calculateCommandFrequency(events) {
        const commandCounts = new Map();
        for (const event of events) {
            commandCounts.set(event.command, (commandCounts.get(event.command) || 0) + 1);
        }
        const total = events.length;
        return Array.from(commandCounts.entries())
            .map(([command, count]) => ({
            command,
            count,
            percentage: (count / total) * 100
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    /**
     * Calculate success rate
     */
    calculateSuccessRate(events) {
        if (events.length === 0)
            return 100;
        const successful = events.filter(event => event.success).length;
        return (successful / events.length) * 100;
    }
    /**
     * Calculate daily usage
     */
    calculateDailyUsage(events, days) {
        const dailyUsage = new Map();
        const now = new Date();
        // Initialize with zeros for all days
        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            dailyUsage.set(dateStr, 0);
        }
        // Count actual usage
        for (const event of events) {
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            if (dailyUsage.has(date)) {
                dailyUsage.set(date, dailyUsage.get(date) + 1);
            }
        }
        return Array.from(dailyUsage.entries())
            .map(([date, commands]) => ({ date, commands }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    /**
     * Calculate feature adoption
     */
    calculateFeatureAdoption(events) {
        const features = ['git-', 'test-', 'refactor-', 'config-', 'explain', 'generate', 'ask'];
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
        return features.map(feature => {
            const recentEvents = events.filter(e => e.command.includes(feature) && e.timestamp >= weekAgo);
            const previousEvents = events.filter(e => e.command.includes(feature) && e.timestamp >= twoWeeksAgo && e.timestamp < weekAgo);
            const recentUsage = recentEvents.length;
            const previousUsage = previousEvents.length;
            let trend = 'stable';
            if (recentUsage > previousUsage * 1.2) {
                trend = 'increasing';
            }
            else if (recentUsage < previousUsage * THRESHOLD_CONSTANTS.WEIGHTS.USAGE_COMPARISON) {
                trend = 'decreasing';
            }
            return {
                feature: feature.replace('-', ''),
                usage: recentUsage,
                trend
            };
        });
    }
    /**
     * Calculate average session duration
     */
    calculateAverageSessionDuration(sessions) {
        if (sessions.length === 0)
            return 0;
        const completedSessions = sessions.filter(s => s.endTime);
        if (completedSessions.length === 0)
            return 0;
        const totalDuration = completedSessions.reduce((sum, session) => sum + (session.endTime - session.startTime), 0);
        return totalDuration / completedSessions.length;
    }
    /**
     * Analyze workflow patterns
     */
    analyzeWorkflowPatterns(events) {
        const patterns = new Map();
        const windowSize = 3; // Look for sequences of 3 commands
        for (let i = 0; i <= events.length - windowSize; i++) {
            const sequence = events.slice(i, i + windowSize);
            const commands = sequence.map(e => e.command);
            const patternKey = commands.join(' -> ');
            if (!patterns.has(patternKey)) {
                patterns.set(patternKey, {
                    name: `Pattern: ${patternKey}`,
                    commands,
                    frequency: 0,
                    averageDuration: 0,
                    successRate: 0,
                    lastUsed: 0
                });
            }
            const pattern = patterns.get(patternKey);
            pattern.frequency++;
            pattern.lastUsed = Math.max(pattern.lastUsed, sequence[sequence.length - 1].timestamp);
            const totalDuration = sequence.reduce((sum, e) => sum + (e.duration || 0), 0);
            pattern.averageDuration = (pattern.averageDuration + totalDuration) / 2;
            const successCount = sequence.filter(e => e.success).length;
            pattern.successRate = (successCount / sequence.length) * 100;
        }
        return Array.from(patterns.values())
            .filter(pattern => pattern.frequency >= 2)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);
    }
    /**
     * Generate recommendations based on usage patterns
     */
    generateRecommendations(patterns, events) {
        const recommendations = [];
        // Check for common patterns that could be automated
        const highFrequencyPatterns = patterns.filter(p => p.frequency >= 5);
        if (highFrequencyPatterns.length > 0) {
            recommendations.push('Consider creating aliases or scripts for frequently used command sequences');
        }
        // Check for low success rate commands
        const commandStats = new Map();
        events.forEach(event => {
            if (!commandStats.has(event.command)) {
                commandStats.set(event.command, { total: 0, success: 0 });
            }
            const stats = commandStats.get(event.command);
            stats.total++;
            if (event.success)
                stats.success++;
        });
        const problematicCommands = Array.from(commandStats.entries())
            .filter(([, stats]) => stats.total >= 5 && (stats.success / stats.total) < 0.8)
            .map(([command]) => command);
        if (problematicCommands.length > 0) {
            recommendations.push(`Review configuration for commands with low success rates: ${problematicCommands.join(', ')}`);
        }
        // Check for underutilized features
        const allCommands = new Set(events.map(e => e.command));
        const unusedFeatures = ['config-show', 'git-status', 'test-run'].filter(cmd => !allCommands.has(cmd));
        if (unusedFeatures.length > 0) {
            recommendations.push(`Explore these available features: ${unusedFeatures.join(', ')}`);
        }
        return recommendations;
    }
    /**
     * Identify workflow inefficiencies
     */
    identifyInefficiencies(events) {
        const inefficiencies = [];
        // Check for repeated failed commands
        const failedCommands = events.filter(e => !e.success);
        const repeatedFailures = new Map();
        failedCommands.forEach(event => {
            repeatedFailures.set(event.command, (repeatedFailures.get(event.command) || 0) + 1);
        });
        repeatedFailures.forEach((count, command) => {
            if (count >= 3) {
                inefficiencies.push({
                    description: `Command '${command}' failed ${count} times recently`,
                    suggestion: 'Check command syntax or review documentation for proper usage'
                });
            }
        });
        // Check for slow commands
        const slowCommands = events
            .filter(e => e.duration && e.duration > 30000) // Over 30 seconds
            .reduce((acc, event) => {
            acc.set(event.command, (acc.get(event.command) || 0) + 1);
            return acc;
        }, new Map());
        slowCommands.forEach((count, command) => {
            if (count >= 2) {
                inefficiencies.push({
                    description: `Command '${command}' consistently takes over 30 seconds`,
                    suggestion: 'Consider optimizing the command or checking system performance'
                });
            }
        });
        return inefficiencies;
    }
    /**
     * Sanitize arguments for privacy
     */
    sanitizeArgs(args) {
        const sanitized = {};
        for (const [key, value] of Object.entries(args)) {
            if (typeof value === 'string') {
                // Remove potential sensitive information
                if (key.toLowerCase().includes('password') ||
                    key.toLowerCase().includes('token') ||
                    key.toLowerCase().includes('key')) {
                    sanitized[key] = '[REDACTED]';
                }
                else if (value.length > 100) {
                    sanitized[key] = '[LARGE_TEXT]';
                }
                else {
                    sanitized[key] = value;
                }
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    /**
     * Gather context information
     */
    async gatherContextInfo() {
        try {
            const contextInfo = {};
            // Check if we're in a git repository
            try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                await execAsync('git rev-parse --git-dir');
                contextInfo.gitRepo = true;
            }
            catch {
                contextInfo.gitRepo = false;
            }
            // Detect project type
            try {
                await fs.access('package.json');
                contextInfo.projectType = 'node';
            }
            catch {
                try {
                    await fs.access('Cargo.toml');
                    contextInfo.projectType = 'rust';
                }
                catch {
                    try {
                        await fs.access('setup.py');
                        contextInfo.projectType = 'python';
                    }
                    catch {
                        contextInfo.projectType = 'unknown';
                    }
                }
            }
            return contextInfo;
        }
        catch {
            return {};
        }
    }
    /**
     * Update workflow patterns
     */
    async updateWorkflowPatterns(command) {
        // This would update internal workflow pattern tracking
        // Implementation would maintain a sliding window of recent commands
        // and identify emerging patterns
    }
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        // Simple CSV conversion for events
        const headers = ['timestamp', 'command', 'duration', 'success'];
        const csvLines = [headers.join(',')];
        data.events.forEach((event) => {
            const row = [
                new Date(event.timestamp).toISOString(),
                event.command,
                event.duration || 0,
                event.success
            ];
            csvLines.push(row.join(','));
        });
        return csvLines.join('\n');
    }
    /**
     * Prune old data
     */
    async pruneOldData(cutoffTime) {
        // Prune events
        const events = await this.loadEvents();
        const recentEvents = events.filter(event => event.timestamp >= cutoffTime);
        const eventsContent = recentEvents.map(event => JSON.stringify(event)).join('\n') + '\n';
        await fs.writeFile(this.eventsFile, eventsContent);
        // Prune sessions
        const sessions = await this.loadSessions();
        const recentSessions = sessions.filter(session => session.startTime >= cutoffTime);
        const sessionsContent = recentSessions.map(session => JSON.stringify(session)).join('\n') + '\n';
        await fs.writeFile(this.sessionsFile, sessionsContent);
    }
    /**
     * Setup cleanup on exit
     */
    setupCleanup() {
        const cleanup = () => {
            this.endSession().catch(() => { });
        };
        process.on('beforeExit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }
}
/**
 * Default analytics tracker instance
 */
export const analyticsTracker = new AnalyticsTracker();
//# sourceMappingURL=tracker.js.map