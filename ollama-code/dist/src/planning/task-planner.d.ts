/**
 * Enhanced Task Planner
 *
 * Provides intelligent task decomposition, dependency management, and execution planning
 * for complex software engineering tasks.
 */
import { ProjectContext } from '../ai/context.js';
import { UserIntent } from '../ai/intent-analyzer.js';
export interface Task {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: number;
    estimatedComplexity: number;
    dependencies: string[];
    prerequisites: string[];
    outputs: string[];
    context: TaskContext;
    constraints: TaskConstraint[];
    validation: ValidationCriteria;
    retryCount: number;
    maxRetries: number;
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}
export interface TaskContext {
    codebaseArea: string[];
    technologies: string[];
    files: string[];
    concepts: string[];
    riskLevel: 'low' | 'medium' | 'high';
    scope: 'local' | 'module' | 'global';
    impact: 'minimal' | 'moderate' | 'significant';
}
export interface TaskConstraint {
    type: 'time' | 'resource' | 'dependency' | 'safety' | 'compatibility';
    description: string;
    severity: 'soft' | 'hard';
    validation?: () => Promise<boolean>;
}
export interface ValidationCriteria {
    prerequisites: string[];
    outputs: string[];
    tests: string[];
    qualityGates: QualityGate[];
}
export interface QualityGate {
    name: string;
    description: string;
    validator: (task: Task) => Promise<boolean>;
    required: boolean;
}
export type TaskType = 'analysis' | 'implementation' | 'testing' | 'documentation' | 'refactoring' | 'debugging' | 'optimization' | 'integration';
export type TaskStatus = 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'cancelled';
export interface ExecutionPlan {
    id: string;
    title: string;
    description: string;
    tasks: Task[];
    phases: ExecutionPhase[];
    timeline: Timeline;
    resources: ResourceRequirement[];
    riskAssessment: RiskAssessment;
    createdAt: Date;
}
export interface ExecutionPhase {
    id: string;
    name: string;
    description: string;
    taskIds: string[];
    dependencies: string[];
    parallelizable: boolean;
    estimatedDuration: number;
    criticalPath: boolean;
}
export interface Timeline {
    estimatedStart: Date;
    estimatedEnd: Date;
    criticalPath: string[];
    milestones: Milestone[];
}
export interface Milestone {
    id: string;
    name: string;
    description: string;
    dueDate: Date;
    dependencies: string[];
    deliverables: string[];
}
export interface ResourceRequirement {
    type: 'cpu' | 'memory' | 'disk' | 'network' | 'external-service';
    amount: number;
    unit: string;
    duration: number;
}
export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    risks: Risk[];
    mitigations: Mitigation[];
}
export interface Risk {
    id: string;
    description: string;
    probability: number;
    impact: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'technical' | 'dependency' | 'resource' | 'external';
}
export interface Mitigation {
    riskId: string;
    strategy: string;
    description: string;
    cost: number;
    effectiveness: number;
}
export declare class TaskPlanner {
    private tasks;
    private executionPlans;
    private projectContext;
    constructor(projectContext: ProjectContext);
    /**
     * Create an execution plan from a user intent
     */
    createExecutionPlan(intent: UserIntent): Promise<ExecutionPlan>;
    /**
     * Decompose a user intent into executable tasks
     */
    private decomposeIntent;
    /**
     * Decompose a task request into specific implementation tasks
     */
    private decomposeTaskRequest;
    /**
     * Decompose a question into research and analysis tasks
     */
    private decomposeQuestion;
    /**
     * Decompose a command into execution tasks
     */
    private decomposeCommand;
    /**
     * Create a generic task for unknown intent types
     */
    private createGenericTask;
    /**
     * Create setup tasks that are common to all plans
     */
    private createSetupTasks;
    /**
     * Create validation tasks that verify plan completion
     */
    private createValidationTasks;
    /**
     * Create a task with default values
     */
    private createTask;
    /**
     * Analyze dependencies between tasks
     */
    private analyzeDependencies;
    /**
     * Add implicit dependencies based on task relationships
     */
    private addImplicitDependencies;
    /**
     * Validate dependencies for cycles
     */
    private validateDependencies;
    /**
     * Create execution phases from tasks
     */
    private createExecutionPhases;
    /**
     * Group tasks into logical phases
     */
    private groupTasksIntoPhases;
    /**
     * Check if two tasks have conflicts
     */
    private hasConflict;
    /**
     * Generate timeline for execution plan
     */
    private generateTimeline;
    /**
     * Helper methods for task planning
     */
    private determineScope;
    private determineImpact;
    private estimateComplexity;
    private generatePhaseDescription;
    private canRunInParallel;
    private estimatePhaseuration;
    private isOnCriticalPath;
    private findCriticalPath;
    private generateMilestones;
    private assessRisks;
    private estimateResources;
    /**
     * Get execution plan by ID
     */
    getExecutionPlan(planId: string): ExecutionPlan | undefined;
    /**
     * Get all execution plans
     */
    getAllExecutionPlans(): ExecutionPlan[];
    /**
     * Get task by ID
     */
    getTask(taskId: string): Task | undefined;
    /**
     * Update task status
     */
    updateTaskStatus(taskId: string, status: TaskStatus, error?: string): boolean;
}
