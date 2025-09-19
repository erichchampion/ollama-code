/**
 * Execution Engine
 *
 * Provides context-aware execution strategies for task plans with intelligent
 * scheduling, resource management, and adaptive execution capabilities.
 */
import { Task, ExecutionPlan, ExecutionPhase } from '../planning/task-planner.js';
import { ProjectContext } from '../ai/context.js';
import { AutonomousModifier } from '../core/autonomous-modifier.js';
import { OllamaClient } from '../ai/client.js';
export interface ExecutionStrategy {
    name: string;
    description: string;
    suitability: (task: Task, context: ExecutionContext) => number;
    execute: (task: Task, context: ExecutionContext) => Promise<ExecutionResult>;
}
export interface ExecutionContext {
    projectContext: ProjectContext;
    availableResources: ResourceState;
    activeExecutions: Map<string, Task>;
    executionHistory: ExecutionHistory[];
    preferences: ExecutionPreferences;
    constraints: ContextConstraint[];
}
export interface ResourceState {
    cpu: ResourceMetric;
    memory: ResourceMetric;
    disk: ResourceMetric;
    network: ResourceMetric;
    externalServices: Map<string, ServiceStatus>;
}
export interface ResourceMetric {
    available: number;
    used: number;
    total: number;
    unit: string;
}
export interface ServiceStatus {
    name: string;
    available: boolean;
    responseTime: number;
    lastChecked: Date;
}
export interface ExecutionHistory {
    taskId: string;
    strategy: string;
    startTime: Date;
    endTime: Date;
    success: boolean;
    duration: number;
    resourceUsage: ResourceUsage;
    error?: string;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}
export interface ExecutionPreferences {
    parallelism: number;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    resourcePriority: 'speed' | 'efficiency' | 'reliability';
    failureHandling: 'stop' | 'continue' | 'retry';
}
export interface ContextConstraint {
    type: 'resource' | 'time' | 'dependency' | 'safety';
    description: string;
    validator: (context: ExecutionContext) => boolean;
    severity: 'warning' | 'error';
}
export interface ExecutionResult {
    success: boolean;
    taskId: string;
    duration: number;
    resourceUsage: ResourceUsage;
    outputs: ExecutionOutput[];
    error?: string;
    retryable?: boolean;
}
export interface ExecutionOutput {
    type: 'file' | 'data' | 'log' | 'metric';
    path?: string;
    content?: any;
    metadata: Record<string, any>;
}
export interface SchedulingDecision {
    taskId: string;
    strategy: string;
    priority: number;
    estimatedStart: Date;
    estimatedDuration: number;
    dependencies: string[];
    reasoning: string;
}
export declare class ExecutionEngine {
    private strategies;
    private executionContext;
    private autonomousModifier;
    private aiClient;
    private activeExecutions;
    private executionHistory;
    constructor(projectContext: ProjectContext, autonomousModifier: AutonomousModifier, aiClient: OllamaClient);
    /**
     * Execute a complete execution plan
     */
    executePlan(plan: ExecutionPlan): Promise<Map<string, ExecutionResult>>;
    /**
     * Execute a single phase
     */
    executePhase(phase: ExecutionPhase, allTasks: Task[]): Promise<Map<string, ExecutionResult>>;
    /**
     * Execute a single task using the best available strategy
     */
    executeTask(task: Task): Promise<ExecutionResult>;
    /**
     * Select the best execution strategy for a task
     */
    private selectStrategy;
    /**
     * Initialize execution strategies
     */
    private initializeStrategies;
    /**
     * Execute analysis task
     */
    private executeAnalysisTask;
    /**
     * Execute implementation task
     */
    private executeImplementationTask;
    /**
     * Execute testing task
     */
    private executeTestingTask;
    /**
     * Execute command task
     */
    private executeCommandTask;
    /**
     * Execute adaptive task using learned strategies
     */
    private executeAdaptiveTask;
    /**
     * Check if tasks are similar for adaptive learning
     */
    private isTaskSimilar;
    /**
     * Get task from execution history (would need proper storage)
     */
    private getTaskFromHistory;
    /**
     * Record execution in history
     */
    private recordExecution;
    /**
     * Initialize resource state
     */
    private initializeResourceState;
    /**
     * Get default execution preferences
     */
    private getDefaultPreferences;
    /**
     * Get execution context
     */
    getExecutionContext(): ExecutionContext;
    /**
     * Update execution preferences
     */
    updatePreferences(preferences: Partial<ExecutionPreferences>): void;
    /**
     * Get execution history
     */
    getExecutionHistory(): ExecutionHistory[];
    /**
     * Get active executions
     */
    getActiveExecutions(): Map<string, Task>;
}
