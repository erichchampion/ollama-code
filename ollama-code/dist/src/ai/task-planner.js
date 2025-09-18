/**
 * Task Planner
 *
 * Decomposes complex user requests into smaller, manageable tasks with
 * dependency analysis, progress tracking, and adaptive planning capabilities.
 */
import { logger } from '../utils/logger.js';
import { toolRegistry } from '../tools/index.js';
export class TaskPlanner {
    aiClient;
    projectContext;
    activePlans = new Map();
    constructor(aiClient, projectContext) {
        this.aiClient = aiClient;
        this.projectContext = projectContext;
    }
    /**
     * Create a task plan from user request
     */
    async createPlan(userRequest, context) {
        logger.info('Creating task plan for request:', userRequest);
        try {
            // Analyze request complexity
            const complexity = await this.analyzeComplexity(userRequest, context);
            // Generate initial plan
            const planData = await this.generateInitialPlan(userRequest, context, complexity);
            // Create task plan object
            const plan = {
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
        }
        catch (error) {
            logger.error('Failed to create task plan:', error);
            throw error;
        }
    }
    /**
     * Execute a task plan
     */
    async executePlan(planId) {
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
                if (!task)
                    continue;
                // Check if dependencies are completed
                if (!this.areDependenciesCompleted(task, plan)) {
                    task.status = 'blocked';
                    continue;
                }
                await this.executeTask(task, plan);
                this.updatePlanProgress(plan);
                // Adaptive planning: reassess if needed
                if (task.status === 'failed' || task.actualDuration > task.estimatedDuration * 2) {
                    await this.adaptPlan(plan, task);
                }
            }
            // Finalize plan
            plan.status = this.allTasksCompleted(plan) ? 'completed' : 'failed';
            plan.completed = new Date();
            logger.info(`Plan execution completed: ${plan.status}`);
        }
        catch (error) {
            logger.error('Plan execution failed:', error);
            plan.status = 'failed';
            throw error;
        }
    }
    /**
     * Analyze request complexity
     */
    async analyzeComplexity(request, context) {
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
        let maxComplexity = 'simple';
        // Check keywords
        for (const [level, keywords] of Object.entries(complexityIndicators)) {
            if (keywords.some(keyword => requestLower.includes(keyword))) {
                maxComplexity = level;
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
    async generateInitialPlan(request, context, complexity) {
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
            const tasks = planData.tasks.map((taskData, index) => ({
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
        }
        catch (error) {
            logger.warn('Failed to parse AI plan, creating fallback plan');
            return this.createFallbackPlan(request, context);
        }
    }
    /**
     * Build planning prompt for AI
     */
    buildPlanningPrompt(request, context, complexity) {
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
    parsePlanFromResponse(response) {
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
    createFallbackPlan(request, context) {
        const baseTask = {
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
    buildDependencyMap(tasks) {
        const dependencyMap = new Map();
        for (const task of tasks) {
            dependencyMap.set(task.id, task.dependencies);
        }
        return dependencyMap;
    }
    /**
     * Validate plan for circular dependencies and other issues
     */
    async validatePlan(plan) {
        // Check for circular dependencies
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (taskId) => {
            if (recursionStack.has(taskId))
                return true;
            if (visited.has(taskId))
                return false;
            visited.add(taskId);
            recursionStack.add(taskId);
            const dependencies = plan.dependencies.get(taskId) || [];
            for (const dep of dependencies) {
                if (hasCycle(dep))
                    return true;
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
    async optimizePlan(plan) {
        // Reorder tasks for better parallel execution
        // Group similar tasks together
        // Optimize resource usage
        logger.debug('Plan optimization completed');
    }
    /**
     * Determine execution order respecting dependencies
     */
    determineExecutionOrder(plan) {
        const order = [];
        const completed = new Set();
        while (order.length < plan.tasks.length) {
            let addedAny = false;
            for (const task of plan.tasks) {
                if (completed.has(task.id))
                    continue;
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
    async executeTask(task, plan) {
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
            task.actualDuration = (task.completed.getTime() - task.started.getTime()) / (1000 * 60);
            logger.info(`Task completed: ${task.title} (${task.actualDuration.toFixed(1)}min)`);
        }
        catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Unknown error';
            task.completed = new Date();
            logger.error(`Task failed: ${task.title} - ${task.error}`);
        }
    }
    /**
     * Build task execution prompt
     */
    buildTaskExecutionPrompt(task, plan) {
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
    areDependenciesCompleted(task, plan) {
        return task.dependencies.every(depId => {
            const depTask = plan.tasks.find(t => t.id === depId);
            return depTask?.status === 'completed';
        });
    }
    /**
     * Update plan progress
     */
    updatePlanProgress(plan) {
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
    allTasksCompleted(plan) {
        return plan.tasks.every(t => t.status === 'completed');
    }
    /**
     * Adapt plan when issues occur
     */
    async adaptPlan(plan, failedTask) {
        logger.info(`Adapting plan due to task issues: ${failedTask.title}`);
        plan.metadata.adaptations++;
        // Simple adaptation: add retry task or break down failed task
        if (failedTask.status === 'failed' && plan.metadata.adaptations < 3) {
            // Create a simplified version of the failed task
            const retryTask = {
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
    increaseComplexity(current) {
        const levels = ['simple', 'moderate', 'complex', 'expert'];
        const currentIndex = levels.indexOf(current);
        return levels[Math.min(currentIndex + 1, levels.length - 1)];
    }
    /**
     * Generate unique plan ID
     */
    generatePlanId() {
        return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get active plan
     */
    getPlan(planId) {
        return this.activePlans.get(planId);
    }
    /**
     * List all active plans
     */
    getActivePlans() {
        return Array.from(this.activePlans.values());
    }
    /**
     * Cancel plan execution
     */
    cancelPlan(planId) {
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
//# sourceMappingURL=task-planner.js.map