/**
 * Commit Message Generator
 *
 * AI-powered commit message generation based on git diff analysis,
 * conventional commit standards, and project context. Provides
 * intelligent, descriptive commit messages that follow best practices.
 */
export interface CommitMessageConfig {
    repositoryPath: string;
    style: 'conventional' | 'descriptive' | 'minimal' | 'custom';
    maxLength: number;
    includeScope: boolean;
    includeBody: boolean;
    includeFooter: boolean;
    customTemplate?: string;
    aiProvider?: string;
}
export interface CommitAnalysis {
    changedFiles: ChangedFile[];
    overallChangeType: CommitType;
    scope: string | null;
    impactLevel: 'patch' | 'minor' | 'major';
    summary: string;
    suggestions: string[];
}
export interface ChangedFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
    oldPath?: string;
    insertions: number;
    deletions: number;
    changeType: ChangeType;
    scope: string;
}
export interface GeneratedCommitMessage {
    message: string;
    type: CommitType;
    scope: string | null;
    subject: string;
    body: string | null;
    footer: string | null;
    confidence: number;
    alternatives: string[];
    analysis: CommitAnalysis;
}
export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'build' | 'ci' | 'chore' | 'revert' | 'wip';
export type ChangeType = 'feature' | 'bugfix' | 'documentation' | 'styling' | 'refactoring' | 'performance' | 'testing' | 'configuration' | 'maintenance';
/**
 * AI-powered commit message generator
 */
export declare class CommitMessageGenerator {
    private config;
    private aiClient;
    constructor(config: CommitMessageConfig, aiClient?: any);
    /**
     * Generate commit message from current staged changes
     */
    generateCommitMessage(): Promise<GeneratedCommitMessage>;
    /**
     * Generate commit message from specific diff or commit
     */
    generateFromDiff(diffText: string): Promise<GeneratedCommitMessage>;
    /**
     * Analyze current staged changes
     */
    private analyzeChanges;
    /**
     * Analyze git diff to understand changes
     */
    private analyzeDiff;
    /**
     * Parse changed files from git diff
     */
    private parseChangedFiles;
    /**
     * Extract scope from file path
     */
    private extractScope;
    /**
     * Determine change type for a file
     */
    private determineChangeType;
    /**
     * Determine overall commit type
     */
    private determineOverallChangeType;
    /**
     * Determine scope from changed files
     */
    private determineScope;
    /**
     * Determine impact level of changes
     */
    private determineImpactLevel;
    /**
     * Generate summary of changes
     */
    private generateSummary;
    /**
     * Generate suggestions for commit message
     */
    private generateSuggestions;
    /**
     * Generate the actual commit message
     */
    private generateMessage;
    /**
     * Generate conventional commit message
     */
    private generateConventionalMessage;
    /**
     * Generate descriptive commit message
     */
    private generateDescriptiveMessage;
    /**
     * Generate minimal commit message
     */
    private generateMinimalMessage;
    /**
     * Generate custom commit message using template
     */
    private generateCustomMessage;
    /**
     * Generate subject line
     */
    private generateSubject;
    /**
     * Generate descriptive subject line
     */
    private generateDescriptiveSubject;
    /**
     * Extract component name from file path
     */
    private extractComponentName;
    /**
     * Generate commit body
     */
    private generateBody;
    /**
     * Generate commit footer
     */
    private generateFooter;
    /**
     * Generate alternative conventional messages
     */
    private generateConventionalAlternatives;
    /**
     * Generate alternative descriptive messages
     */
    private generateDescriptiveAlternatives;
    /**
     * Generate alternative minimal messages
     */
    private generateMinimalAlternatives;
    /**
     * Generate minimal description
     */
    private generateMinimalDescription;
    /**
     * Enhance message with AI if available
     */
    private enhanceWithAI;
    /**
     * Parse commit message into components
     */
    private parseCommitMessage;
    /**
     * Calculate confidence score for generated message
     */
    private calculateConfidence;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<CommitMessageConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): CommitMessageConfig;
}
