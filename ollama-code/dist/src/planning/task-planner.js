/**
 * Enhanced Task Planner
 *
 * Provides intelligent task decomposition, dependency management, and execution planning
 * for complex software engineering tasks.
 */
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
export class TaskPlanner {
    tasks = new Map();
    executionPlans = new Map();
    projectContext;
    constructor(projectContext) {
        this.projectContext = projectContext;
    }
    /**
     * Create an execution plan from a user intent
     */
    async createExecutionPlan(intent) {
        try {
            logger.info('Creating execution plan from intent', {
                intentType: intent.type,
                action: intent.action,
                complexity: intent.complexity
            });
            // Decompose the intent into tasks
            const tasks = await this.decomposeIntent(intent);
            // Analyze dependencies
            await this.analyzeDependencies(tasks);
            // Create phases
            const phases = await this.createExecutionPhases(tasks);
            // Generate timeline
            const timeline = await this.generateTimeline(tasks, phases);
            // Assess risks
            const riskAssessment = await this.assessRisks(tasks);
            // Estimate resources
            const resources = await this.estimateResources(tasks);
            const plan = {
                id: uuidv4(),
                title: `Execution plan for: ${intent.action}`,
                description: `Automated execution plan for ${intent.type} intent with ${tasks.length} tasks`,
                tasks,
                phases,
                timeline,
                resources,
                riskAssessment,
                createdAt: new Date()
            };
            this.executionPlans.set(plan.id, plan);
            logger.info('Created execution plan', {
                planId: plan.id,
                taskCount: tasks.length,
                phaseCount: phases.length,
                overallRisk: riskAssessment.overallRisk
            });
            return plan;
        }
        catch (error) {
            logger.error('Failed to create execution plan:', error);
            throw error;
        }
    }
    /**
     * Decompose a user intent into executable tasks
     */
    async decomposeIntent(intent) {
        const tasks = [];
        switch (intent.type) {
            case 'task_request':
                tasks.push(...await this.decomposeTaskRequest(intent));
                break;
            case 'question':
                tasks.push(...await this.decomposeQuestion(intent));
                break;
            case 'command':
                tasks.push(...await this.decomposeCommand(intent));
                break;
            default:
                tasks.push(await this.createGenericTask(intent));
        }
        // Add common validation and setup tasks
        tasks.unshift(...await this.createSetupTasks(intent));
        tasks.push(...await this.createValidationTasks(intent));
        return tasks;
    }
    /**
     * Decompose a task request into specific implementation tasks
     */
    async decomposeTaskRequest(intent) {
        const tasks = [];
        // Analysis phase
        tasks.push(await this.createTask({
            title: 'Analyze requirements',
            description: `Analyze requirements for: ${intent.action}`,
            type: 'analysis',
            priority: 1,
            context: {
                codebaseArea: intent.entities.concepts || [],
                technologies: intent.entities.technologies || [],
                files: intent.entities.files || [],
                concepts: intent.entities.concepts || [],
                riskLevel: intent.riskLevel,
                scope: this.determineScope(intent),
                impact: this.determineImpact(intent)
            }
        }));
        // Implementation phase
        if (intent.action.includes('implement') || intent.action.includes('create') || intent.action.includes('add')) {
            tasks.push(await this.createTask({
                title: 'Design implementation',
                description: `Design implementation approach for: ${intent.action}`,
                type: 'analysis',
                priority: 2,
                dependencies: [tasks[0].id]
            }));
            tasks.push(await this.createTask({
                title: 'Implement core functionality',
                description: `Implement core functionality for: ${intent.action}`,
                type: 'implementation',
                priority: 3,
                dependencies: [tasks[1].id]
            }));
            tasks.push(await this.createTask({
                title: 'Add error handling',
                description: 'Add comprehensive error handling and validation',
                type: 'implementation',
                priority: 4,
                dependencies: [tasks[2].id]
            }));
        }
        // Testing phase
        tasks.push(await this.createTask({
            title: 'Create tests',
            description: `Create comprehensive tests for: ${intent.action}`,
            type: 'testing',
            priority: 5,
            dependencies: tasks.length > 3 ? [tasks[tasks.length - 1].id] : [tasks[0].id]
        }));
        // Documentation phase
        if (intent.complexity === 'complex' || intent.complexity === 'expert' || intent.multiStep) {
            tasks.push(await this.createTask({
                title: 'Update documentation',
                description: `Update documentation for: ${intent.action}`,
                type: 'documentation',
                priority: 6,
                dependencies: [tasks[tasks.length - 1].id]
            }));
        }
        return tasks;
    }
    /**
     * Decompose a question into research and analysis tasks
     */
    async decomposeQuestion(intent) {
        const tasks = [];
        tasks.push(await this.createTask({
            title: 'Research codebase',
            description: `Research codebase to answer: ${intent.action}`,
            type: 'analysis',
            priority: 1,
            context: {
                codebaseArea: intent.entities.concepts || [],
                technologies: intent.entities.technologies || [],
                files: intent.entities.files || [],
                concepts: intent.entities.concepts || [],
                riskLevel: 'low',
                scope: 'local',
                impact: 'minimal'
            }
        }));
        tasks.push(await this.createTask({
            title: 'Analyze findings',
            description: 'Analyze research findings and formulate response',
            type: 'analysis',
            priority: 2,
            dependencies: [tasks[0].id]
        }));
        return tasks;
    }
    /**
     * Decompose a command into execution tasks
     */
    async decomposeCommand(intent) {
        const tasks = [];
        tasks.push(await this.createTask({
            title: 'Validate command',
            description: `Validate command: ${intent.action}`,
            type: 'analysis',
            priority: 1,
            context: {
                codebaseArea: [],
                technologies: [],
                files: intent.entities.files || [],
                concepts: [],
                riskLevel: intent.riskLevel,
                scope: 'local',
                impact: 'minimal'
            }
        }));
        tasks.push(await this.createTask({
            title: 'Execute command',
            description: `Execute command: ${intent.action}`,
            type: 'implementation',
            priority: 2,
            dependencies: [tasks[0].id]
        }));
        return tasks;
    }
    /**
     * Create a generic task for unknown intent types
     */
    async createGenericTask(intent) {
        return await this.createTask({
            title: 'Process request',
            description: `Process request: ${intent.action}`,
            type: 'analysis',
            priority: 1,
            context: {
                codebaseArea: intent.entities.concepts || [],
                technologies: intent.entities.technologies || [],
                files: intent.entities.files || [],
                concepts: intent.entities.concepts || [],
                riskLevel: intent.riskLevel,
                scope: this.determineScope(intent),
                impact: this.determineImpact(intent)
            }
        });
    }
    /**
     * Create setup tasks that are common to all plans
     */
    async createSetupTasks(intent) {
        const tasks = [];
        tasks.push(await this.createTask({
            title: 'Initialize context',
            description: 'Initialize project context and workspace',
            type: 'analysis',
            priority: 0,
            context: {
                codebaseArea: [],
                technologies: [],
                files: [],
                concepts: [],
                riskLevel: 'low',
                scope: 'local',
                impact: 'minimal'
            }
        }));
        return tasks;
    }
    /**
     * Create validation tasks that verify plan completion
     */
    async createValidationTasks(intent) {
        const tasks = [];
        tasks.push(await this.createTask({
            title: 'Validate completion',
            description: 'Validate that all requirements have been met',
            type: 'testing',
            priority: 100,
            context: {
                codebaseArea: intent.entities.concepts || [],
                technologies: intent.entities.technologies || [],
                files: intent.entities.files || [],
                concepts: intent.entities.concepts || [],
                riskLevel: 'low',
                scope: 'global',
                impact: 'minimal'
            }
        }));
        return tasks;
    }
    /**
     * Create a task with default values
     */
    async createTask(partial) {
        const now = new Date();
        const task = {
            id: uuidv4(),
            title: partial.title,
            description: partial.description,
            type: partial.type,
            status: 'pending',
            priority: partial.priority,
            estimatedComplexity: partial.estimatedComplexity || this.estimateComplexity(partial.type),
            dependencies: partial.dependencies || [],
            prerequisites: partial.prerequisites || [],
            outputs: partial.outputs || [],
            context: partial.context || {
                codebaseArea: [],
                technologies: [],
                files: [],
                concepts: [],
                riskLevel: 'low',
                scope: 'local',
                impact: 'minimal'
            },
            constraints: partial.constraints || [],
            validation: partial.validation || {
                prerequisites: [],
                outputs: [],
                tests: [],
                qualityGates: []
            },
            retryCount: 0,
            maxRetries: partial.maxRetries || 3,
            createdAt: now,
            updatedAt: now
        };
        this.tasks.set(task.id, task);
        return task;
    }
    /**
     * Analyze dependencies between tasks
     */
    async analyzeDependencies(tasks) {
        // Create dependency graph
        const taskMap = new Map(tasks.map(t => [t.id, t]));
        for (const task of tasks) {
            // Add implicit dependencies based on task types and priorities
            await this.addImplicitDependencies(task, tasks);
            // Validate dependency cycles
            await this.validateDependencies(task, taskMap);
        }
    }
    /**
     * Add implicit dependencies based on task relationships
     */
    async addImplicitDependencies(task, allTasks) {
        for (const otherTask of allTasks) {
            if (otherTask.id === task.id)
                continue;
            // Implementation depends on analysis
            if (task.type === 'implementation' && otherTask.type === 'analysis' &&
                otherTask.priority < task.priority) {
                if (!task.dependencies.includes(otherTask.id)) {
                    task.dependencies.push(otherTask.id);
                }
            }
            // Testing depends on implementation
            if (task.type === 'testing' && otherTask.type === 'implementation' &&
                otherTask.priority < task.priority) {
                if (!task.dependencies.includes(otherTask.id)) {
                    task.dependencies.push(otherTask.id);
                }
            }
            // Documentation depends on implementation
            if (task.type === 'documentation' &&
                (otherTask.type === 'implementation' || otherTask.type === 'testing') &&
                otherTask.priority < task.priority) {
                if (!task.dependencies.includes(otherTask.id)) {
                    task.dependencies.push(otherTask.id);
                }
            }
        }
    }
    /**
     * Validate dependencies for cycles
     */
    async validateDependencies(task, taskMap) {
        const visited = new Set();
        const stack = new Set();
        const hasCycle = (taskId) => {
            if (stack.has(taskId))
                return true;
            if (visited.has(taskId))
                return false;
            visited.add(taskId);
            stack.add(taskId);
            const currentTask = taskMap.get(taskId);
            if (currentTask) {
                for (const depId of currentTask.dependencies) {
                    if (hasCycle(depId))
                        return true;
                }
            }
            stack.delete(taskId);
            return false;
        };
        if (hasCycle(task.id)) {
            throw new Error(`Circular dependency detected involving task: ${task.title}`);
        }
    }
    /**
     * Create execution phases from tasks
     */
    async createExecutionPhases(tasks) {
        const phases = [];
        const taskMap = new Map(tasks.map(t => [t.id, t]));
        // Group tasks by type and dependencies
        const phaseTasks = this.groupTasksIntoPhases(tasks);
        for (let i = 0; i < phaseTasks.length; i++) {
            const phase = {
                id: uuidv4(),
                name: `Phase ${i + 1}`,
                description: this.generatePhaseDescription(phaseTasks[i]),
                taskIds: phaseTasks[i].map(t => t.id),
                dependencies: i > 0 ? [phases[i - 1].id] : [],
                parallelizable: this.canRunInParallel(phaseTasks[i]),
                estimatedDuration: this.estimatePhaseuration(phaseTasks[i]),
                criticalPath: this.isOnCriticalPath(phaseTasks[i])
            };
            phases.push(phase);
        }
        return phases;
    }
    /**
     * Group tasks into logical phases
     */
    groupTasksIntoPhases(tasks) {
        const phases = [];
        const processed = new Set();
        // Sort tasks by priority
        const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);
        for (const task of sortedTasks) {
            if (processed.has(task.id))
                continue;
            // Find all tasks that can run in the same phase
            const phasesTasks = [task];
            processed.add(task.id);
            // Look for tasks with similar priorities and no conflicts
            for (const otherTask of sortedTasks) {
                if (processed.has(otherTask.id))
                    continue;
                if (Math.abs(otherTask.priority - task.priority) <= 1 &&
                    !this.hasConflict(task, otherTask, sortedTasks)) {
                    phasesTasks.push(otherTask);
                    processed.add(otherTask.id);
                }
            }
            phases.push(phasesTasks);
        }
        return phases;
    }
    /**
     * Check if two tasks have conflicts
     */
    hasConflict(task1, task2, allTasks) {
        // Check direct dependencies
        if (task1.dependencies.includes(task2.id) || task2.dependencies.includes(task1.id)) {
            return true;
        }
        // Check resource conflicts
        if (task1.context.files.some(f => task2.context.files.includes(f))) {
            return true;
        }
        return false;
    }
    /**
     * Generate timeline for execution plan
     */
    async generateTimeline(tasks, phases) {
        const now = new Date();
        const totalDuration = phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0);
        return {
            estimatedStart: now,
            estimatedEnd: new Date(now.getTime() + totalDuration * 60000), // Convert minutes to ms
            criticalPath: await this.findCriticalPath(tasks),
            milestones: await this.generateMilestones(phases)
        };
    }
    /**
     * Helper methods for task planning
     */
    determineScope(intent) {
        if (intent.multiStep || intent.complexity === 'complex' || intent.complexity === 'expert')
            return 'global';
        if (intent.entities.files && intent.entities.files.length > 3)
            return 'module';
        return 'local';
    }
    determineImpact(intent) {
        if (intent.riskLevel === 'high')
            return 'significant';
        if (intent.complexity === 'complex' || intent.complexity === 'expert' || intent.multiStep)
            return 'moderate';
        return 'minimal';
    }
    estimateComplexity(type) {
        const complexityMap = {
            analysis: 2,
            implementation: 5,
            testing: 3,
            documentation: 2,
            refactoring: 4,
            debugging: 6,
            optimization: 7,
            integration: 8
        };
        return complexityMap[type] || 3;
    }
    generatePhaseDescription(tasks) {
        const types = [...new Set(tasks.map(t => t.type))];
        return `${types.join(', ')} phase with ${tasks.length} task(s)`;
    }
    canRunInParallel(tasks) {
        return tasks.length > 1 && !tasks.some(t => t.context.riskLevel === 'high' || t.type === 'implementation');
    }
    estimatePhaseuration(tasks) {
        return tasks.reduce((sum, task) => sum + task.estimatedComplexity * 5, 0);
    }
    isOnCriticalPath(tasks) {
        return tasks.some(t => t.type === 'implementation' || t.context.riskLevel === 'high');
    }
    async findCriticalPath(tasks) {
        // Simple critical path - tasks with highest complexity and dependencies
        return tasks
            .filter(t => t.estimatedComplexity >= 5 || t.dependencies.length > 0)
            .map(t => t.id);
    }
    async generateMilestones(phases) {
        return phases.map((phase, index) => ({
            id: uuidv4(),
            name: `Complete ${phase.name}`,
            description: phase.description,
            dueDate: new Date(Date.now() + (index + 1) * phase.estimatedDuration * 60000),
            dependencies: phase.dependencies,
            deliverables: [`Phase ${index + 1} completion`]
        }));
    }
    async assessRisks(tasks) {
        const risks = [];
        // Analyze each task for risks
        for (const task of tasks) {
            if (task.context.riskLevel === 'high') {
                risks.push({
                    id: uuidv4(),
                    description: `High-risk task: ${task.title}`,
                    probability: 0.3,
                    impact: 0.8,
                    severity: 'high',
                    category: 'technical'
                });
            }
            if (task.dependencies.length > 3) {
                risks.push({
                    id: uuidv4(),
                    description: `Complex dependencies for: ${task.title}`,
                    probability: 0.2,
                    impact: 0.6,
                    severity: 'medium',
                    category: 'dependency'
                });
            }
        }
        const overallRisk = risks.length === 0 ? 'low' :
            risks.some(r => r.severity === 'high') ? 'high' :
                risks.some(r => r.severity === 'medium') ? 'medium' : 'low';
        return {
            overallRisk,
            risks,
            mitigations: risks.map(risk => ({
                riskId: risk.id,
                strategy: 'monitor',
                description: `Monitor and validate ${risk.description}`,
                cost: 0.1,
                effectiveness: 0.7
            }))
        };
    }
    async estimateResources(tasks) {
        const totalComplexity = tasks.reduce((sum, task) => sum + task.estimatedComplexity, 0);
        return [
            {
                type: 'cpu',
                amount: Math.min(totalComplexity * 0.1, 1.0),
                unit: 'cores',
                duration: totalComplexity * 5
            },
            {
                type: 'memory',
                amount: Math.min(totalComplexity * 50, 500),
                unit: 'MB',
                duration: totalComplexity * 5
            }
        ];
    }
    /**
     * Get execution plan by ID
     */
    getExecutionPlan(planId) {
        return this.executionPlans.get(planId);
    }
    /**
     * Get all execution plans
     */
    getAllExecutionPlans() {
        return Array.from(this.executionPlans.values());
    }
    /**
     * Get task by ID
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
     * Update task status
     */
    updateTaskStatus(taskId, status, error) {
        const task = this.tasks.get(taskId);
        if (!task)
            return false;
        task.status = status;
        task.updatedAt = new Date();
        if (error)
            task.error = error;
        if (status === 'running' && !task.startedAt) {
            task.startedAt = new Date();
        }
        if (status === 'completed' || status === 'failed') {
            task.completedAt = new Date();
        }
        return true;
    }
}
//# sourceMappingURL=task-planner.js.map