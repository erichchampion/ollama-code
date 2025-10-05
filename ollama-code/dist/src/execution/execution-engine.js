/**
 * Execution Engine
 *
 * Provides context-aware execution strategies for task plans with intelligent
 * scheduling, resource management, and adaptive execution capabilities.
 */
import { logger } from '../utils/logger.js';
import { normalizeError } from '../utils/error-utils.js';
import { v4 as uuidv4 } from 'uuid';
export class ExecutionEngine {
    strategies = new Map();
    executionContext;
    autonomousModifier;
    aiClient;
    activeExecutions = new Map();
    executionHistory = [];
    constructor(projectContext, autonomousModifier, aiClient) {
        this.autonomousModifier = autonomousModifier;
        this.aiClient = aiClient;
        this.executionContext = {
            projectContext,
            availableResources: this.initializeResourceState(),
            activeExecutions: new Map(),
            executionHistory: [],
            preferences: this.getDefaultPreferences(),
            constraints: []
        };
        this.initializeStrategies();
    }
    /**
     * Execute a complete execution plan
     */
    async executePlan(plan) {
        logger.info('Starting execution plan', {
            planId: plan.id,
            taskCount: plan.tasks.length,
            phaseCount: plan.phases.length
        });
        const results = new Map();
        try {
            // Execute phases in order
            for (const phase of plan.phases) {
                logger.info('Starting execution phase', {
                    phaseId: phase.id,
                    name: phase.name,
                    taskCount: phase.taskIds.length
                });
                const phaseResults = await this.executePhase(phase, plan.tasks);
                // Merge results
                for (const [taskId, result] of phaseResults) {
                    results.set(taskId, result);
                }
                // Check if we should continue based on results
                const hasFailures = Array.from(phaseResults.values()).some(r => !r.success);
                if (hasFailures && this.executionContext.preferences.failureHandling === 'stop') {
                    logger.warn('Stopping execution due to phase failures');
                    break;
                }
            }
            logger.info('Execution plan completed', {
                planId: plan.id,
                totalTasks: results.size,
                successful: Array.from(results.values()).filter(r => r.success).length
            });
            return results;
        }
        catch (error) {
            logger.error('Execution plan failed:', error);
            throw error;
        }
    }
    /**
     * Execute a single phase
     */
    async executePhase(phase, allTasks) {
        const phaseTasks = allTasks.filter(t => phase.taskIds.includes(t.id));
        const results = new Map();
        if (phase.parallelizable && phaseTasks.length > 1) {
            // Execute tasks in parallel
            const promises = phaseTasks.map(task => this.executeTask(task));
            const parallelResults = await Promise.allSettled(promises);
            for (let i = 0; i < phaseTasks.length; i++) {
                const task = phaseTasks[i];
                const result = parallelResults[i];
                if (result.status === 'fulfilled') {
                    results.set(task.id, result.value);
                }
                else {
                    results.set(task.id, {
                        success: false,
                        taskId: task.id,
                        duration: 0,
                        resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
                        outputs: [],
                        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
                        retryable: true
                    });
                }
            }
        }
        else {
            // Execute tasks sequentially
            for (const task of phaseTasks) {
                const result = await this.executeTask(task);
                results.set(task.id, result);
                // Stop on failure if configured to do so
                if (!result.success && this.executionContext.preferences.failureHandling === 'stop') {
                    break;
                }
            }
        }
        return results;
    }
    /**
     * Execute a single task using the best available strategy
     */
    async executeTask(task) {
        const startTime = new Date();
        try {
            logger.info('Executing task', {
                taskId: task.id,
                title: task.title,
                type: task.type
            });
            // Select best strategy
            const strategy = await this.selectStrategy(task);
            // Update task status
            task.status = 'running';
            task.startedAt = startTime;
            // Track active execution
            this.executionContext.activeExecutions.set(task.id, task);
            // Execute using selected strategy
            const result = await strategy.execute(task, this.executionContext);
            // Update task status
            task.status = result.success ? 'completed' : 'failed';
            task.completedAt = new Date();
            if (result.error)
                task.error = result.error;
            // Record execution history
            this.recordExecution(task.id, strategy.name, startTime, new Date(), result);
            // Clean up active execution
            this.executionContext.activeExecutions.delete(task.id);
            logger.info('Task execution completed', {
                taskId: task.id,
                success: result.success,
                duration: result.duration,
                strategy: strategy.name
            });
            return result;
        }
        catch (error) {
            logger.error('Task execution failed:', error);
            const result = {
                success: false,
                taskId: task.id,
                duration: Date.now() - startTime.getTime(),
                resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
                outputs: [],
                error: normalizeError(error).message,
                retryable: true
            };
            // Update task status
            task.status = 'failed';
            task.completedAt = new Date();
            task.error = result.error;
            // Clean up active execution
            this.executionContext.activeExecutions.delete(task.id);
            return result;
        }
    }
    /**
     * Select the best execution strategy for a task
     */
    async selectStrategy(task) {
        const strategies = Array.from(this.strategies.values());
        const suitabilityScores = strategies.map(strategy => ({
            strategy,
            score: strategy.suitability(task, this.executionContext)
        }));
        // Sort by suitability score (descending)
        suitabilityScores.sort((a, b) => b.score - a.score);
        const bestStrategy = suitabilityScores[0]?.strategy;
        if (!bestStrategy) {
            throw new Error('No suitable execution strategy found');
        }
        logger.debug('Selected execution strategy', {
            taskId: task.id,
            strategy: bestStrategy.name,
            score: suitabilityScores[0].score
        });
        return bestStrategy;
    }
    /**
     * Initialize execution strategies
     */
    initializeStrategies() {
        // Analysis Strategy
        this.strategies.set('analysis', {
            name: 'Analysis Strategy',
            description: 'Strategy for research and analysis tasks',
            suitability: (task, context) => {
                return task.type === 'analysis' ? 0.9 : 0.1;
            },
            execute: async (task, context) => {
                return await this.executeAnalysisTask(task, context);
            }
        });
        // Implementation Strategy
        this.strategies.set('implementation', {
            name: 'Implementation Strategy',
            description: 'Strategy for code implementation tasks',
            suitability: (task, context) => {
                if (task.type === 'implementation') {
                    // Higher score for lower risk tasks
                    const riskMultiplier = task.context.riskLevel === 'low' ? 1.0 :
                        task.context.riskLevel === 'medium' ? 0.8 : 0.6;
                    return 0.9 * riskMultiplier;
                }
                return 0.1;
            },
            execute: async (task, context) => {
                return await this.executeImplementationTask(task, context);
            }
        });
        // Testing Strategy
        this.strategies.set('testing', {
            name: 'Testing Strategy',
            description: 'Strategy for testing and validation tasks',
            suitability: (task, context) => {
                return task.type === 'testing' ? 0.9 : 0.1;
            },
            execute: async (task, context) => {
                return await this.executeTestingTask(task, context);
            }
        });
        // Command Strategy
        this.strategies.set('command', {
            name: 'Command Strategy',
            description: 'Strategy for direct command execution',
            suitability: (task, context) => {
                return task.description.includes('command') ? 0.8 : 0.2;
            },
            execute: async (task, context) => {
                return await this.executeCommandTask(task, context);
            }
        });
        // Adaptive Strategy
        this.strategies.set('adaptive', {
            name: 'Adaptive Strategy',
            description: 'Adaptive strategy that learns from execution history',
            suitability: (task, context) => {
                // Base suitability on historical success rate
                const similarTasks = context.executionHistory.filter(h => h.taskId !== task.id && this.isTaskSimilar(task, h));
                if (similarTasks.length === 0)
                    return 0.5;
                const successRate = similarTasks.filter(h => h.success).length / similarTasks.length;
                return successRate * 0.7; // Conservative scoring
            },
            execute: async (task, context) => {
                return await this.executeAdaptiveTask(task, context);
            }
        });
    }
    /**
     * Execute analysis task
     */
    async executeAnalysisTask(task, context) {
        const startTime = Date.now();
        try {
            // Simulate analysis work
            const outputs = [];
            // Research codebase if files are specified
            if (task.context.files.length > 0) {
                outputs.push({
                    type: 'data',
                    content: {
                        analyzedFiles: task.context.files,
                        findings: `Analysis findings for: ${task.description}`
                    },
                    metadata: {
                        timestamp: new Date().toISOString(),
                        taskType: task.type
                    }
                });
            }
            // Generate analysis report
            outputs.push({
                type: 'data',
                content: {
                    analysis: `Completed analysis: ${task.description}`,
                    recommendations: [`Recommendation based on ${task.title}`]
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    confidence: 0.8
                }
            });
            return {
                success: true,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.1, memory: 50, disk: 10, network: 5 },
                outputs
            };
        }
        catch (error) {
            return {
                success: false,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.05, memory: 25, disk: 5, network: 2 },
                outputs: [],
                error: normalizeError(error).message,
                retryable: true
            };
        }
    }
    /**
     * Execute implementation task
     */
    async executeImplementationTask(task, context) {
        const startTime = Date.now();
        try {
            // Use autonomous modifier for safe code changes
            const outputs = [];
            // Create modification plan based on task
            const modificationPlan = {
                id: uuidv4(),
                description: task.description,
                phase: 'implementation',
                operations: [{
                        type: 'create',
                        filePath: task.context.files[0] || '/tmp/implementation.ts',
                        description: task.description,
                        priority: task.priority,
                        newContent: `// Implementation for: ${task.title}\n// ${task.description}\n`
                    }],
                riskLevel: task.context.riskLevel,
                estimatedImpact: task.context.impact,
                rollbackStrategy: 'checkpoint'
            };
            // Execute modification plan
            const result = await this.autonomousModifier.executeModificationPlan(modificationPlan);
            outputs.push({
                type: 'data',
                content: {
                    modificationResult: result,
                    implementationComplete: result.success
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    riskLevel: task.context.riskLevel
                }
            });
            return {
                success: result.success,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.3, memory: 100, disk: 50, network: 10 },
                outputs,
                error: result.success ? undefined : 'Implementation failed',
                retryable: !result.success
            };
        }
        catch (error) {
            return {
                success: false,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.15, memory: 50, disk: 25, network: 5 },
                outputs: [],
                error: normalizeError(error).message,
                retryable: true
            };
        }
    }
    /**
     * Execute testing task
     */
    async executeTestingTask(task, context) {
        const startTime = Date.now();
        try {
            const outputs = [];
            // Simulate test execution
            const testResults = {
                total: 5,
                passed: 4,
                failed: 1,
                coverage: 85
            };
            outputs.push({
                type: 'data',
                content: testResults,
                metadata: {
                    timestamp: new Date().toISOString(),
                    testType: 'unit'
                }
            });
            return {
                success: testResults.failed === 0,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.2, memory: 75, disk: 20, network: 5 },
                outputs,
                retryable: testResults.failed > 0
            };
        }
        catch (error) {
            return {
                success: false,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.1, memory: 40, disk: 10, network: 2 },
                outputs: [],
                error: normalizeError(error).message,
                retryable: true
            };
        }
    }
    /**
     * Execute command task
     */
    async executeCommandTask(task, context) {
        const startTime = Date.now();
        try {
            const outputs = [];
            // Simulate command execution
            outputs.push({
                type: 'log',
                content: `Executed command for: ${task.description}`,
                metadata: {
                    timestamp: new Date().toISOString(),
                    exitCode: 0
                }
            });
            return {
                success: true,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.05, memory: 20, disk: 5, network: 1 },
                outputs
            };
        }
        catch (error) {
            return {
                success: false,
                taskId: task.id,
                duration: Date.now() - startTime,
                resourceUsage: { cpu: 0.02, memory: 10, disk: 2, network: 0 },
                outputs: [],
                error: normalizeError(error).message,
                retryable: true
            };
        }
    }
    /**
     * Execute adaptive task using learned strategies
     */
    async executeAdaptiveTask(task, context) {
        // Find the most successful strategy for similar tasks
        const similarExecutions = context.executionHistory.filter(h => this.isTaskSimilar(task, h) && h.success);
        if (similarExecutions.length > 0) {
            // Use the strategy from the most recent successful similar task
            const bestExecution = similarExecutions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
            const strategy = this.strategies.get(bestExecution.strategy);
            if (strategy && strategy.name !== 'adaptive') {
                return await strategy.execute(task, context);
            }
        }
        // Fallback to analysis strategy
        return await this.executeAnalysisTask(task, context);
    }
    /**
     * Check if tasks are similar for adaptive learning
     */
    isTaskSimilar(task, execution) {
        const historyTask = this.getTaskFromHistory(execution.taskId);
        if (!historyTask)
            return false;
        return (historyTask.type === task.type &&
            historyTask.context.riskLevel === task.context.riskLevel &&
            historyTask.estimatedComplexity === task.estimatedComplexity);
    }
    /**
     * Get task from execution history (would need proper storage)
     */
    getTaskFromHistory(taskId) {
        // In a real implementation, this would query a task store
        return undefined;
    }
    /**
     * Record execution in history
     */
    recordExecution(taskId, strategy, startTime, endTime, result) {
        const execution = {
            taskId,
            strategy,
            startTime,
            endTime,
            success: result.success,
            duration: result.duration,
            resourceUsage: result.resourceUsage,
            error: result.error
        };
        this.executionHistory.push(execution);
        this.executionContext.executionHistory.push(execution);
        // Keep only recent history (last 100 executions)
        if (this.executionHistory.length > 100) {
            this.executionHistory.shift();
        }
    }
    /**
     * Initialize resource state
     */
    initializeResourceState() {
        return {
            cpu: { available: 0.8, used: 0.2, total: 1.0, unit: 'cores' },
            memory: { available: 800, used: 200, total: 1000, unit: 'MB' },
            disk: { available: 8000, used: 2000, total: 10000, unit: 'MB' },
            network: { available: 90, used: 10, total: 100, unit: 'Mbps' },
            externalServices: new Map()
        };
    }
    /**
     * Get default execution preferences
     */
    getDefaultPreferences() {
        return {
            parallelism: 3,
            riskTolerance: 'balanced',
            resourcePriority: 'efficiency',
            failureHandling: 'continue'
        };
    }
    /**
     * Get execution context
     */
    getExecutionContext() {
        return this.executionContext;
    }
    /**
     * Update execution preferences
     */
    updatePreferences(preferences) {
        Object.assign(this.executionContext.preferences, preferences);
    }
    /**
     * Get execution history
     */
    getExecutionHistory() {
        return [...this.executionHistory];
    }
    /**
     * Get active executions
     */
    getActiveExecutions() {
        return new Map(this.executionContext.activeExecutions);
    }
}
//# sourceMappingURL=execution-engine.js.map