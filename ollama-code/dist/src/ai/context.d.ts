/**
 * Project Context Management
 *
 * Manages project-wide context including file dependencies, structure analysis,
 * conversation history, and context window optimization for AI interactions.
 */
export interface FileInfo {
    path: string;
    relativePath: string;
    size: number;
    modified: Date;
    type: 'file' | 'directory';
    language?: string;
    imports?: string[];
    exports?: string[];
    dependencies?: string[];
}
export interface ProjectStructure {
    root: string;
    files: Map<string, FileInfo>;
    directories: string[];
    dependencies: Map<string, string[]>;
    entryPoints: string[];
    configFiles: string[];
    testFiles: string[];
    documentationFiles: string[];
}
export interface ProjectState {
    currentFiles: string[];
    activeFeatures: string[];
    buildStatus: 'success' | 'failure' | 'unknown';
    testStatus: 'passing' | 'failing' | 'unknown';
    lastModified: Date;
    dependencies: Record<string, string>;
}
export interface ConversationTurn {
    id: string;
    timestamp: Date;
    userMessage: string;
    assistantResponse: string;
    context: {
        filesReferenced: string[];
        toolsUsed: string[];
        projectState: ProjectState;
    };
    metadata: {
        tokensUsed: number;
        executionTime: number;
        confidence: number;
    };
}
export interface ContextWindow {
    maxTokens: number;
    currentTokens: number;
    files: FileInfo[];
    conversation: ConversationTurn[];
    priorityContent: string[];
    lastOptimized: Date;
}
export interface ProjectDependencies {
    [key: string]: string[];
}
export interface PromptContext {
    files: FileInfo[];
    projectStructure: ProjectStructure;
    conversationHistory: ConversationTurn[];
    currentTask?: string;
}
export interface AIResponse {
    content: string;
    metadata: QualityMetrics;
}
export interface QualityMetrics {
    confidence: number;
    relevance: number;
    completeness: number;
    accuracy: number;
}
export interface Task {
    id: string;
    type: string;
    description: string;
    dependencies: TaskDependency[];
    status: string;
    priority: number;
    estimatedTime: number;
}
export interface TaskDependency {
    taskId: string;
    type: 'requires' | 'enhances' | 'blocks';
    strength: number;
}
export interface ExecutionPlan {
    tasks: Task[];
    order: string[];
    parallelGroups: string[][];
    estimatedDuration: number;
}
export interface PlanningConstraints {
    maxExecutionTime: number;
    allowedOperations: string[];
    resourceLimits: {
        maxMemory: number;
        maxCpuTime: number;
        maxFileOperations: number;
    };
    securityRestrictions: string[];
}
export interface PlanningContext {
    userRequest: string;
    projectContext: ProjectStructure;
    availableTools: string[];
    constraints: PlanningConstraints;
}
export declare class ProjectContext {
    private projectRoot;
    private structure;
    private conversationHistory;
    private contextWindow;
    private fileWatchers;
    constructor(projectRoot: string, maxTokens?: number);
    /**
     * Initialize project context by analyzing project structure
     */
    initialize(): Promise<void>;
    /**
     * Analyze project structure and categorize files
     */
    private analyzeProjectStructure;
    /**
     * Detect programming language from file extension
     */
    private detectLanguage;
    /**
     * Categorize files into special groups
     */
    private categorizeFile;
    /**
     * Detect file dependencies by analyzing imports/requires
     */
    private detectDependencies;
    /**
     * Extract imports, exports, and dependencies from file content
     */
    private extractDependencies;
    /**
     * Setup file watchers for real-time updates
     */
    private setupFileWatchers;
    /**
     * Handle file change events
     */
    private handleFileChange;
    /**
     * Add conversation turn to history
     */
    addConversationTurn(turn: ConversationTurn): void;
    /**
     * Get relevant context for a given query
     */
    getRelevantContext(query: string, maxTokens?: number): Promise<{
        files: FileInfo[];
        conversation: ConversationTurn[];
        structure: ProjectStructure;
        totalTokens: number;
    }>;
    /**
     * Find files relevant to the query
     */
    private findRelevantFiles;
    /**
     * Estimate token count (simplified)
     */
    private estimateTokens;
    /**
     * Optimize context window to fit within token limits
     */
    private optimizeContextWindow;
    /**
     * Invalidate context for a specific file
     */
    private invalidateFileContext;
    /**
     * Get project summary
     */
    getProjectSummary(): {
        fileCount: number;
        languages: string[];
        structure: string;
        entryPoints: string[];
        recentActivity: string[];
    };
    /**
     * Generate a text overview of project structure
     */
    private generateStructureOverview;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
