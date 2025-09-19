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
export interface CommandEvent {
    command: string;
    args: Record<string, any>;
    timestamp: number;
    duration?: number;
    success: boolean;
    errorCategory?: string;
    contextInfo?: {
        projectType?: string;
        fileTypes?: string[];
        gitRepo?: boolean;
    };
}
export interface SessionInfo {
    sessionId: string;
    startTime: number;
    endTime?: number;
    commandCount: number;
    successfulCommands: number;
    failedCommands: number;
    totalDuration: number;
}
export interface UsageStats {
    totalCommands: number;
    totalSessions: number;
    averageSessionDuration: number;
    mostUsedCommands: Array<{
        command: string;
        count: number;
        percentage: number;
    }>;
    successRate: number;
    dailyUsage: Array<{
        date: string;
        commands: number;
    }>;
    featureAdoption: Array<{
        feature: string;
        usage: number;
        trend: 'increasing' | 'stable' | 'decreasing';
    }>;
}
export interface ProgressTask {
    id: string;
    name: string;
    description: string;
    startTime: number;
    estimatedDuration?: number;
    currentStep: number;
    totalSteps: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    details?: string;
    subTasks?: ProgressTask[];
}
export interface WorkflowPattern {
    name: string;
    commands: string[];
    frequency: number;
    averageDuration: number;
    successRate: number;
    lastUsed: number;
}
export declare class AnalyticsTracker {
    private analyticsDir;
    private eventsFile;
    private sessionsFile;
    private currentSession;
    private activeTasks;
    private workflowPatterns;
    constructor();
    /**
     * Initialize analytics tracking
     */
    private initializeTracking;
    /**
     * Start a new tracking session
     */
    startSession(): Promise<void>;
    /**
     * End current tracking session
     */
    endSession(): Promise<void>;
    /**
     * Track command execution
     */
    trackCommand(command: string, args: Record<string, any>, duration: number, success: boolean, errorCategory?: string): Promise<void>;
    /**
     * Start tracking a long-running task
     */
    startTask(id: string, name: string, description: string, totalSteps: number, estimatedDuration?: number): ProgressTask;
    /**
     * Update task progress
     */
    updateTaskProgress(id: string, currentStep: number, details?: string, status?: ProgressTask['status']): boolean;
    /**
     * Get current task progress
     */
    getTaskProgress(id: string): ProgressTask | null;
    /**
     * Get all active tasks
     */
    getActiveTasks(): ProgressTask[];
    /**
     * Generate comprehensive usage statistics
     */
    generateUsageStats(days?: number): Promise<UsageStats>;
    /**
     * Get workflow patterns and insights
     */
    getWorkflowInsights(): Promise<{
        patterns: WorkflowPattern[];
        recommendations: string[];
        inefficiencies: Array<{
            description: string;
            suggestion: string;
        }>;
    }>;
    /**
     * Export analytics data
     */
    exportAnalytics(filePath: string, format?: 'json' | 'csv'): Promise<void>;
    /**
     * Clear analytics data
     */
    clearAnalytics(olderThanDays?: number): Promise<void>;
    /**
     * Load events from file
     */
    private loadEvents;
    /**
     * Load sessions from file
     */
    private loadSessions;
    /**
     * Calculate command frequency
     */
    private calculateCommandFrequency;
    /**
     * Calculate success rate
     */
    private calculateSuccessRate;
    /**
     * Calculate daily usage
     */
    private calculateDailyUsage;
    /**
     * Calculate feature adoption
     */
    private calculateFeatureAdoption;
    /**
     * Calculate average session duration
     */
    private calculateAverageSessionDuration;
    /**
     * Analyze workflow patterns
     */
    private analyzeWorkflowPatterns;
    /**
     * Generate recommendations based on usage patterns
     */
    private generateRecommendations;
    /**
     * Identify workflow inefficiencies
     */
    private identifyInefficiencies;
    /**
     * Sanitize arguments for privacy
     */
    private sanitizeArgs;
    /**
     * Gather context information
     */
    private gatherContextInfo;
    /**
     * Update workflow patterns
     */
    private updateWorkflowPatterns;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Convert data to CSV format
     */
    private convertToCSV;
    /**
     * Prune old data
     */
    private pruneOldData;
    /**
     * Setup cleanup on exit
     */
    private setupCleanup;
}
/**
 * Default analytics tracker instance
 */
export declare const analyticsTracker: AnalyticsTracker;
