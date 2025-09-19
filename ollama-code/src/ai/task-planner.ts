/**
 * Task Planner
 *
 * Decomposes complex user requests into smaller, manageable tasks with
 * dependency analysis, progress tracking, and adaptive planning capabilities.
 */

import { logger } from '../utils/logger.js';
import { toolRegistry } from '../tools/index.js';
import { EnhancedClient } from './enhanced-client.js';
import { ProjectContext } from './context.js';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'analysis' | 'implementation' | 'testing' | 'documentation' | 'refactoring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  dependencies: string[];
  estimatedDuration: number; // in minutes
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
  timeConstraints?: number; // in minutes
  qualityRequirements: 'basic' | 'production' | 'enterprise';
}

// Type aliases for index.ts exports
export type TaskType = Task['type'];
export type TaskPriority = Task['priority'];
export type TaskStatus = Task['status'];
export type PlanningResult = TaskPlan;

export class TaskPlanner {
  private aiClient: EnhancedClient;
  private projectContext: ProjectContext;
  private activePlans = new Map<string, TaskPlan>();

  constructor(aiClient: EnhancedClient, projectContext: ProjectContext) {
    this.aiClient = aiClient;
    this.projectContext = projectContext;
  }

  /**
   * Create a task plan from user request
   */
  async createPlan(
    userRequest: string,
    context: PlanningContext
  ): Promise<TaskPlan> {
    logger.info('Creating task plan for request:', userRequest);

    try {
      // Analyze request complexity
      const complexity = await this.analyzeComplexity(userRequest, context);

      // Generate initial plan
      const planData = await this.generateInitialPlan(userRequest, context, complexity);

      // Create task plan object
      const plan: TaskPlan = {
        id: this.generatePlanId(),
        title: planData.title,
        description: planData.description,
        tasks: planData.tasks,
        dependencies: this.buildDependencyMap(planData.tasks),
        estimatedDuration: planData.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
        status: 'planning',
        progress: {
          completed: 0,
          total: planData.tasks.length,
          percentage: 0
        },
        created: new Date(),
        metadata: {
          complexity,
          confidence: planData.confidence,
          adaptations: 0
        }
      };

      // Validate and optimize plan
      await this.validatePlan(plan);
      await this.optimizePlan(plan);

      this.activePlans.set(plan.id, plan);

      logger.info(`Created task plan with ${plan.tasks.length} tasks (${complexity} complexity)`);
      return plan;

    } catch (error) {
      logger.error('Failed to create task plan:', error);
      throw error;
    }
  }

  /**
   * Execute a task plan
   */
  async executePlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    logger.info(`Starting execution of plan: ${plan.title}`);
    plan.status = 'executing';
    plan.started = new Date();

    try {
      // Execute tasks in dependency order
      const executionOrder = this.determineExecutionOrder(plan);

      for (const taskId of executionOrder) {
        const task = plan.tasks.find(t => t.id === taskId);
        if (!task) continue;

        // Check if dependencies are completed
        if (!this.areDependenciesCompleted(task, plan)) {
          task.status = 'blocked';
          continue;
        }

        await this.executeTask(task, plan);
        this.updatePlanProgress(plan);

        // Adaptive planning: reassess if needed
        if (task.status === 'failed' || task.actualDuration! > task.estimatedDuration * 2) {
          await this.adaptPlan(plan, task);
        }
      }

      // Finalize plan
      plan.status = this.allTasksCompleted(plan) ? 'completed' : 'failed';
      plan.completed = new Date();

      logger.info(`Plan execution completed: ${plan.status}`);

    } catch (error) {
      logger.error('Plan execution failed:', error);
      plan.status = 'failed';
      throw error;
    }
  }

  /**
   * Analyze request complexity
   */
  private async analyzeComplexity(
    request: string,
    context: PlanningContext
  ): Promise<'simple' | 'moderate' | 'complex' | 'expert'> {
    const complexityIndicators = {
      simple: [
        'explain', 'show', 'what is', 'how to', 'example'
      ],
      moderate: [
        'create', 'implement', 'add', 'build', 'write'
      ],
      complex: [
        'refactor', 'optimize', 'integrate', 'migrate', 'redesign'
      ],
      expert: [
        'architecture', 'performance', 'scalability', 'security', 'distributed'
      ]
    };

    const requestLower = request.toLowerCase();
    let maxComplexity: 'simple' | 'moderate' | 'complex' | 'expert' = 'simple';

    // Check keywords
    for (const [level, keywords] of Object.entries(complexityIndicators)) {
      if (keywords.some(keyword => requestLower.includes(keyword))) {
        maxComplexity = level as typeof maxComplexity;
      }
    }

    // Consider context factors
    if (context.codebaseSize === 'large') {
      maxComplexity = this.increaseComplexity(maxComplexity);
    }

    if (context.qualityRequirements === 'enterprise') {
      maxComplexity = this.increaseComplexity(maxComplexity);
    }

    return maxComplexity;
  }

  /**
   * Generate initial plan using AI
   */
  private async generateInitialPlan(
    request: string,
    context: PlanningContext,
    complexity: string
  ): Promise<{
    title: string;
    description: string;
    tasks: Task[];
    confidence: number;
  }> {
    const planningPrompt = this.buildPlanningPrompt(request, context, complexity);

    const response = await this.aiClient.complete(planningPrompt, {
      temperature: 0.2, // Lower temperature for planning
      responseQuality: 'high',
      enableToolUse: false // Don't use tools for planning
    });

    try {
      // Extract structured plan from AI response
      const planData = this.parsePlanFromResponse(response.content);

      // Generate tasks with IDs and details
      const tasks: Task[] = planData.tasks.map((taskData: any, index: number) => ({
        id: `task_${Date.now()}_${index}`,
        title: taskData.title,
        description: taskData.description,
        type: taskData.type || 'implementation',
        priority: taskData.priority || 'medium',
        status: 'pending',
        dependencies: taskData.dependencies || [],
        estimatedDuration: taskData.estimatedDuration || 30,
        toolsRequired: taskData.toolsRequired || [],
        filesInvolved: taskData.filesInvolved || [],
        acceptance_criteria: taskData.acceptance_criteria || [],
        created: new Date()
      }));

      return {
        title: planData.title || 'Generated Task Plan',
        description: planData.description || request,
        tasks,
        confidence: response.confidence
      };

    } catch (error) {
      logger.warn('Failed to parse AI plan, creating fallback plan');
      return this.createFallbackPlan(request, context);
    }
  }

  /**
   * Build planning prompt for AI
   */
  private buildPlanningPrompt(
    request: string,
    context: PlanningContext,
    complexity: string
  ): string {
    const availableTools = toolRegistry.list().map(tool => tool.name).join(', ');

    return `
You are an expert software development project planner. Create a detailed task plan for the following request.

## Request:
${request}

## Context:
- Project Languages: ${context.projectLanguages.join(', ')}
- Codebase Size: ${context.codebaseSize}
- Quality Requirements: ${context.qualityRequirements}
- Available Tools: ${availableTools}
- Complexity Level: ${complexity}

## Planning Guidelines:
- Break complex tasks into smaller, manageable subtasks
- Each task should be completable in 15-60 minutes
- Include proper dependencies between tasks
- Specify required tools and files for each task
- Include acceptance criteria for quality validation

## Response Format:
Provide your response as a structured plan with the following JSON format:

\`\`\`json
{
  "title": "Plan Title",
  "description": "Overall plan description",
  "tasks": [
    {
      "title": "Task Title",
      "description": "Detailed task description",
      "type": "analysis|implementation|testing|documentation|refactoring",
      "priority": "low|medium|high|critical",
      "dependencies": ["task_ids"],
      "estimatedDuration": 30,
      "toolsRequired": ["tool_names"],
      "filesInvolved": ["file_paths"],
      "acceptance_criteria": ["criteria_list"]
    }
  ]
}
\`\`\`

Create a comprehensive plan that addresses all aspects of the request.
`;
  }

  /**
   * Parse plan from AI response
   */
  private parsePlanFromResponse(response: string): any {
    // Extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find JSON object directly
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(response.substring(jsonStart, jsonEnd + 1));
    }

    throw new Error('No valid JSON plan found in response');
  }

  /**
   * Create fallback plan when AI planning fails
   */
  private createFallbackPlan(request: string, context: PlanningContext): {
    title: string;
    description: string;
    tasks: Task[];
    confidence: number;
  } {
    const baseTask: Task = {
      id: `task_${Date.now()}_fallback`,
      title: 'Complete Request',
      description: request,
      type: 'implementation',
      priority: 'medium',
      status: 'pending',
      dependencies: [],
      estimatedDuration: 60,
      toolsRequired: ['filesystem'],
      filesInvolved: [],
      acceptance_criteria: ['Request completed successfully'],
      created: new Date()
    };

    return {
      title: 'Fallback Plan',
      description: request,
      tasks: [baseTask],
      confidence: 0.3
    };
  }

  /**
   * Build dependency map
   */
  private buildDependencyMap(tasks: Task[]): Map<string, string[]> {
    const dependencyMap = new Map<string, string[]>();

    for (const task of tasks) {
      dependencyMap.set(task.id, task.dependencies);
    }

    return dependencyMap;
  }

  /**
   * Validate plan for circular dependencies and other issues
   */
  private async validatePlan(plan: TaskPlan): Promise<void> {
    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) return true;
      if (visited.has(taskId)) return false;

      visited.add(taskId);
      recursionStack.add(taskId);

      const dependencies = plan.dependencies.get(taskId) || [];
      for (const dep of dependencies) {
        if (hasCycle(dep)) return true;
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of plan.tasks) {
      if (hasCycle(task.id)) {
        throw new Error('Circular dependency detected in task plan');
      }
    }

    // Validate dependency references
    const taskIds = new Set(plan.tasks.map(t => t.id));
    for (const task of plan.tasks) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          logger.warn(`Invalid dependency reference: ${dep} in task ${task.id}`);
          task.dependencies = task.dependencies.filter(d => d !== dep);
        }
      }
    }
  }

  /**
   * Optimize plan for better execution
   */
  private async optimizePlan(plan: TaskPlan): Promise<void> {
    // Reorder tasks for better parallel execution
    // Group similar tasks together
    // Optimize resource usage

    logger.debug('Plan optimization completed');
  }

  /**
   * Determine execution order respecting dependencies
   */
  private determineExecutionOrder(plan: TaskPlan): string[] {
    const order: string[] = [];
    const completed = new Set<string>();

    while (order.length < plan.tasks.length) {
      let addedAny = false;

      for (const task of plan.tasks) {
        if (completed.has(task.id)) continue;

        // Check if all dependencies are completed
        const canExecute = task.dependencies.every(dep => completed.has(dep));

        if (canExecute) {
          order.push(task.id);
          completed.add(task.id);
          addedAny = true;
        }
      }

      if (!addedAny) {
        // Deadlock - this shouldn't happen if validation passed
        logger.error('Execution deadlock detected');
        break;
      }
    }

    return order;
  }

  /**
   * Execute individual task
   */
  private async executeTask(task: Task, plan: TaskPlan): Promise<void> {
    logger.info(`Executing task: ${task.title}`);

    task.status = 'in_progress';
    task.started = new Date();

    try {
      // Use AI to execute the task
      const taskPrompt = this.buildTaskExecutionPrompt(task, plan);

      const response = await this.aiClient.complete(taskPrompt, {
        enableToolUse: task.toolsRequired.length > 0,
        responseQuality: 'high'
      });

      task.result = response.content;
      task.status = 'completed';
      task.completed = new Date();
      task.actualDuration = (task.completed.getTime() - task.started!.getTime()) / (1000 * 60);

      logger.info(`Task completed: ${task.title} (${task.actualDuration.toFixed(1)}min)`);

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completed = new Date();

      logger.error(`Task failed: ${task.title} - ${task.error}`);
    }
  }

  /**
   * Build task execution prompt
   */
  private buildTaskExecutionPrompt(task: Task, plan: TaskPlan): string {
    let prompt = `## Task: ${task.title}\n\n${task.description}\n\n`;

    // Add context from completed tasks
    const completedTasks = plan.tasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      prompt += '## Previous Task Results:\n';
      for (const prevTask of completedTasks) {
        if (task.dependencies.includes(prevTask.id)) {
          prompt += `- ${prevTask.title}: ${prevTask.result}\n`;
        }
      }
      prompt += '\n';
    }

    // Add acceptance criteria
    if (task.acceptance_criteria.length > 0) {
      prompt += '## Acceptance Criteria:\n';
      for (const criteria of task.acceptance_criteria) {
        prompt += `- ${criteria}\n`;
      }
      prompt += '\n';
    }

    prompt += 'Please complete this task according to the requirements and acceptance criteria.';

    return prompt;
  }

  /**
   * Check if task dependencies are completed
   */
  private areDependenciesCompleted(task: Task, plan: TaskPlan): boolean {
    return task.dependencies.every(depId => {
      const depTask = plan.tasks.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  }

  /**
   * Update plan progress
   */
  private updatePlanProgress(plan: TaskPlan): void {
    const completed = plan.tasks.filter(t => t.status === 'completed').length;
    plan.progress = {
      completed,
      total: plan.tasks.length,
      percentage: Math.round((completed / plan.tasks.length) * 100)
    };
  }

  /**
   * Check if all tasks are completed
   */
  private allTasksCompleted(plan: TaskPlan): boolean {
    return plan.tasks.every(t => t.status === 'completed');
  }

  /**
   * Adapt plan when issues occur
   */
  private async adaptPlan(plan: TaskPlan, failedTask: Task): Promise<void> {
    logger.info(`Adapting plan due to task issues: ${failedTask.title}`);

    plan.metadata.adaptations++;

    // Simple adaptation: add retry task or break down failed task
    if (failedTask.status === 'failed' && plan.metadata.adaptations < 3) {
      // Create a simplified version of the failed task
      const retryTask: Task = {
        ...failedTask,
        id: `${failedTask.id}_retry`,
        title: `Retry: ${failedTask.title}`,
        estimatedDuration: Math.ceil(failedTask.estimatedDuration * 0.5),
        status: 'pending',
        started: undefined,
        completed: undefined,
        error: undefined,
        result: undefined
      };

      plan.tasks.push(retryTask);
      plan.progress.total++;
    }
  }

  /**
   * Helper method to increase complexity level
   */
  private increaseComplexity(current: 'simple' | 'moderate' | 'complex' | 'expert'): typeof current {
    const levels = ['simple', 'moderate', 'complex', 'expert'] as const;
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  /**
   * Generate unique plan ID
   */
  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active plan
   */
  getPlan(planId: string): TaskPlan | undefined {
    return this.activePlans.get(planId);
  }

  /**
   * List all active plans
   */
  getActivePlans(): TaskPlan[] {
    return Array.from(this.activePlans.values());
  }

  /**
   * Cancel plan execution
   */
  cancelPlan(planId: string): void {
    const plan = this.activePlans.get(planId);
    if (plan) {
      plan.status = 'failed';
      // Mark pending and in-progress tasks as blocked
      for (const task of plan.tasks) {
        if (task.status === 'pending' || task.status === 'in_progress') {
          task.status = 'blocked';
        }
      }
      logger.info(`Plan cancelled: ${plan.title}`);
    }
  }
}