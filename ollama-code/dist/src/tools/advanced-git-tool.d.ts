import { BaseTool, ToolResult, ToolExecutionContext, ToolMetadata } from './types.js';
export interface GitToolOptions {
    branch?: string;
    depth?: number;
    includeStats?: boolean;
    includeContributors?: boolean;
    format?: 'json' | 'text' | 'detailed';
    timeframe?: 'week' | 'month' | 'year' | 'all';
    since?: string;
    until?: string;
}
export declare class AdvancedGitTool extends BaseTool {
    metadata: ToolMetadata;
    execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    private isGitRepository;
    private analyzeRepository;
    private getBasicRepoInfo;
    private analyzeRepoStructure;
    private getRepoStatistics;
    private assessRepoHealth;
    private getCommitHistory;
    private analyzeBranches;
    private analyzeDiff;
    private analyzeContributors;
    private detectConflicts;
    private generateInsights;
    private analyzeDevelopmentPatterns;
    private analyzeCodeEvolution;
    private analyzeCollaboration;
    private generateRecommendations;
    private executeGitCommand;
    private getTimeframeFlag;
    private createSuccessResult;
    private createErrorResult;
}
