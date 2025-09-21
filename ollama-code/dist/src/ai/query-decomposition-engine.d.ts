/**
 * Query Decomposition Engine
 *
 * Breaks down complex queries into manageable sub-tasks with dependency analysis,
 * resource calculation, and execution planning for autonomous task execution.
 */
import { ProjectContext } from './context.js';
export interface SubTask {
    id: string;
    type: 'analysis' | 'implementation' | 'testing' | 'deployment' | 'modification' | 'optimization' | 'planning' | 'bugfix' | 'general';
    description: string;
    priority: number;
    estimatedTime: number;
    complexity: 'low' | 'medium' | 'high';
    entities?: QueryEntity;
    requirements?: string[];
}
export interface QueryEntity {
    files: string[];
    technologies: string[];
    concepts: string[];
    patterns?: string[];
}
export interface TaskDependency {
    taskId: string;
    dependsOn: string[];
    type: 'sequential' | 'conditional' | 'resource';
    reason?: string;
}
export interface ExecutionPhase {
    id: number;
    tasks: SubTask[];
    dependencies: string[];
    estimatedTime: number;
    parallelExecutable: boolean;
    resourceRequirements: ResourceRequirements;
}
export interface ExecutionPlan {
    id: string;
    phases: ExecutionPhase[];
    totalDuration: number;
    parallelizable: boolean;
    criticalPath: string[];
    resourceProfile: ResourceRequirements;
    riskAssessment: RiskAssessment;
}
export interface ResourceRequirements {
    cpu: 'low' | 'medium' | 'high';
    memory: 'low' | 'medium' | 'high';
    network: 'low' | 'medium' | 'high';
    disk: 'low' | 'medium' | 'high';
    estimatedDuration: number;
    concurrentTasks: number;
}
export interface RiskAssessment {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigations: string[];
    approvalRequired: boolean;
}
export interface TaskConflict {
    type: 'file_modification' | 'resource_conflict' | 'timing_conflict' | 'dependency_cycle';
    tasks: string[];
    severity: 'low' | 'medium' | 'high';
    resolution: string;
    description: string;
}
export interface QueryIntent {
    id: string;
    type: 'analysis' | 'implementation' | 'testing' | 'deployment' | 'modification' | 'optimization' | 'general';
    action: string;
    confidence: number;
    entities: QueryEntity;
    complexity: 'low' | 'medium' | 'high';
    priority: number;
}
export interface QueryDecomposition {
    id: string;
    originalQuery: string;
    intents: QueryIntent[];
    subTasks: SubTask[];
    dependencies: Map<string, string[]>;
    executionPlan: ExecutionPlan;
    estimatedDuration: number;
    resourceRequirements: ResourceRequirements;
    complexity: 'low' | 'medium' | 'high';
    conflicts: TaskConflict[];
    riskAssessment: RiskAssessment;
    timestamp: Date;
    metadata: {
        decompositionTime: number;
        confidence: number;
        version: string;
    };
}
export interface DecompositionConfig {
    maxSubTasks: number;
    maxDependencyDepth: number;
    enableResourceCalculation: boolean;
    enablePriorityScheduling: boolean;
    enableConflictDetection: boolean;
    decompositionTimeout: number;
    cacheTimeout: number;
    riskThreshold: 'low' | 'medium' | 'high';
}
export interface DecompositionStatistics {
    totalDecompositions: number;
    cacheHitRate: number;
    averageSubTasks: number;
    averageDuration: number;
    averageComplexity: number;
    successRate: number;
    performanceMetrics: {
        averageDecompositionTime: number;
        cacheSize: number;
        memoryUsage: number;
    };
}
/**
 * Query Decomposition Engine Class
 *
 * Main class that handles complex query decomposition with advanced features:
 * - Multi-intent parsing and analysis
 * - Dependency resolution and topological sorting
 * - Resource calculation and optimization
 * - Execution planning with phase management
 * - Conflict detection and resolution
 * - Performance monitoring and caching
 */
export declare class QueryDecompositionEngine {
    private aiClient;
    private projectContext;
    private config;
    private initialized;
    private decompositionCache;
    private executionHistory;
    private performanceMetrics;
    private intentPatterns;
    private entityPatterns;
    private complexityIndicators;
    constructor(aiClient: any, projectContext: ProjectContext, config?: Partial<DecompositionConfig>);
    /**
     * Initialize the query decomposition engine
     */
    initialize(): Promise<void>;
    /**
     * Main method to decompose a complex query into manageable sub-tasks
     */
    decomposeQuery(query: string, context?: any): Promise<QueryDecomposition>;
    /**
     * Parse multiple intents from a single query
     */
    private parseMultipleIntents;
    /**
     * AI-powered intent analysis
     */
    private analyzeIntentsWithAI;
    /**
     * Pattern-based intent analysis (fallback)
     */
    private analyzeIntentsWithPatterns;
    /**
     * Generate sub-tasks from identified intents
     */
    private generateSubTasks;
    /**
     * Generate tasks for a specific intent
     */
    private generateTasksForIntent;
    /**
     * Helper methods for different task types
     */
    private generateImplementationTasks;
    private generateTestingTasks;
    private generateDeploymentTasks;
    private generateAnalysisTasks;
    private generateOptimizationTasks;
    private generateModificationTasks;
    private generateGenericTask;
    /**
     * Analyze dependencies between tasks
     */
    private analyzeDependencies;
    /**
     * Create execution plan with phase scheduling
     */
    private createExecutionPlan;
    /**
     * Topological sort for dependency resolution
     */
    private topologicalSort;
    /**
     * Create execution phases from sorted tasks
     */
    private createExecutionPhases;
    /**
     * Utility methods and helpers
     */
    private initializePatterns;
    private initializePatternRecognition;
    private initializePerformanceMonitoring;
    private generateUniqueId;
    private generateCacheKey;
    private getFromCache;
    private addToCache;
    private evictLeastRecentlyUsed;
    private updatePerformanceMetrics;
    private estimateImplementationTime;
    private estimateTestingTime;
    private estimateDeploymentTime;
    private estimateAnalysisTime;
    private estimateOptimizationTime;
    private estimateModificationTime;
    private extractEntitiesFromQuery;
    private estimateComplexityFromQuery;
    private parseAIResponse;
    private createDefaultIntent;
    private getImplementationRequirements;
    private calculateResourceRequirements;
    private detectConflicts;
    private assessRisks;
    private generateRiskMitigations;
    private calculateTotalDuration;
    private determineComplexity;
    private calculateConfidence;
    private findCriticalPath;
    private hasResourceConflict;
    private getDefaultResourceRequirements;
    private getTaskResourceRequirements;
    private combineResourceRequirements;
    private aggregateResourceRequirements;
    /**
     * Public API methods
     */
    /**
     * Get decomposition statistics
     */
    getStatistics(): DecompositionStatistics;
    private calculateAverageComplexity;
    private estimateMemoryUsage;
    /**
     * Clear cache and history
     */
    clear(): void;
    /**
     * Get cached decomposition by ID
     */
    getDecomposition(id: string): QueryDecomposition | null;
    /**
     * Update task status (for execution tracking)
     */
    updateTaskStatus(decompositionId: string, taskId: string, status: 'pending' | 'running' | 'completed' | 'failed'): void;
}
