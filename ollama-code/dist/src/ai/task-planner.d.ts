/**
 * Task Planner
 *
 * Decomposes complex user requests into smaller, manageable tasks with
 * dependency analysis, progress tracking, and adaptive planning capabilities.
 */
import { EnhancedAIClient } from './enhanced-client.js';
import { ProjectContext } from './context.js';
export interface Task {
    id: string;
    title: string;
    description: string;
    type: 'analysis' | 'implementation' | 'testing' | 'documentation' | 'refactoring';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
    dependencies: string[];
    estimatedDuration: number;
    actualDuration?: number;
    toolsRequired: string[];
    filesInvolved: string[];
    acceptance_criteria: string[];
    created: Date;
    started?: Date;
    completed?: Date;
    error?: string;
    result?: any;
}
export interface TaskPlan {
    id: string;
    title: string;
    description: string;
    tasks: Task[];
    dependencies: Map<string, string[]>;
    estimatedDuration: number;
    status: 'planning' | 'executing' | 'completed' | 'failed';
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
    created: Date;
    started?: Date;
    completed?: Date;
    metadata: {
        complexity: 'simple' | 'moderate' | 'complex' | 'expert';
        confidence: number;
        adaptations: number;
    };
}
export interface PlanningContext {
    projectRoot: string;
    availableTools: string[];
    projectLanguages: string[];
    codebaseSize: 'small' | 'medium' | 'large';
    userExperience: 'beginner' | 'intermediate' | 'advanced';
    timeConstraints?: number;
    qualityRequirements: 'basic' | 'production' | 'enterprise';
}
export type TaskType = Task['type'];
export type TaskPriority = Task['priority'];
export type TaskStatus = Task['status'];
export type PlanningResult = TaskPlan;
export declare class TaskPlanner {
    private aiClient;
    private projectContext;
    private activePlans;
    constructor(aiClient: EnhancedAIClient, projectContext: ProjectContext);
    /**
     * Create a task plan from user request
     */
    createPlan(userRequest: string, context: PlanningContext): Promise<TaskPlan>;
    /**
     * Execute a task plan
     */
    executePlan(planId: string): Promise<void>;
    /**
     * Analyze request complexity
     */
    private analyzeComplexity;
    /**
     * Generate initial plan using AI
     */
    private generateInitialPlan;
    /**
     * Build planning prompt for AI
     */
    private buildPlanningPrompt;
    /**
     * Parse plan from AI response
     */
    private parsePlanFromResponse;
    /**
     * Create fallback plan when AI planning fails
     */
    private createFallbackPlan;
    /**
     * Build dependency map
     */
    private buildDependencyMap;
    /**
     * Validate plan for circular dependencies and other issues
     */
    private validatePlan;
    /**
     * Optimize plan for better execution
     */
    private optimizePlan;
    /**
     * Determine execution order respecting dependencies
     */
    private determineExecutionOrder;
    /**
     * Execute individual task
     */
    private executeTask;
    /**
     * Build task execution prompt
     */
    private buildTaskExecutionPrompt;
    /**
     * Check if task dependencies are completed
     */
    private areDependenciesCompleted;
    /**
     * Update plan progress
     */
    private updatePlanProgress;
    /**
     * Check if all tasks are completed
     */
    private allTasksCompleted;
    /**
     * Adapt plan when issues occur
     */
    private adaptPlan;
    /**
     * Helper method to increase complexity level
     */
    private increaseComplexity;
    /**
     * Generate unique plan ID
     */
    private generatePlanId;
    /**
     * Get active plan
     */
    getPlan(planId: string): TaskPlan | undefined;
    /**
     * List all active plans
     */
    getActivePlans(): TaskPlan[];
    /**
     * Cancel plan execution
     */
    cancelPlan(planId: string): void;
}
