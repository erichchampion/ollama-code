/**
 * Tool Orchestrator
 *
 * Manages execution of multiple tools with dependency resolution,
 * parallel execution, and result aggregation.
 */

import { EventEmitter } from 'events';
import { BaseTool, ToolExecution, ToolExecutionContext, ToolOrchestratorConfig, ToolResult, OrchestrationPlan } from './types.js';
import { toolRegistry } from './registry.js';
import { logger } from '../utils/logger.js';

interface ExecutionEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  execution: ToolExecution;
  data?: any;
}

export class ToolOrchestrator extends EventEmitter {
  private config: ToolOrchestratorConfig;
  private activeExecutions = new Map<string, ToolExecution>();
  private executionCache = new Map<string, ToolResult>();

  constructor(config: Partial<ToolOrchestratorConfig> = {}) {
    super();
    this.config = {
      maxConcurrentTools: config.maxConcurrentTools || 5,
      defaultTimeout: config.defaultTimeout || 30000,
      enableCaching: config.enableCaching !== false,
      cacheTTL: config.cacheTTL || 300000 // 5 minutes
    };
  }

  /**
   * Execute a single tool
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const tool = toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Check cache if enabled
    const cacheKey = this.generateCacheKey(toolName, parameters);
    if (this.config.enableCaching && this.executionCache.has(cacheKey)) {
      const cachedResult = this.executionCache.get(cacheKey)!;
      logger.debug(`Using cached result for ${toolName}`);
      return cachedResult;
    }

    const execution: ToolExecution = {
      id: this.generateExecutionId(),
      toolName,
      parameters,
      status: 'pending',
      startTime: new Date(),
      dependencies: []
    };

    try {
      execution.status = 'running';
      this.activeExecutions.set(execution.id, execution);
      this.emit('execution', { type: 'start', execution });

      const result = await tool.execute(parameters, context);

      execution.status = result.success ? 'completed' : 'failed';
      execution.endTime = new Date();
      execution.result = result;

      // Cache successful results
      if (this.config.enableCaching && result.success) {
        this.executionCache.set(cacheKey, result);
        // Set TTL cleanup
        setTimeout(() => {
          this.executionCache.delete(cacheKey);
        }, this.config.cacheTTL);
      }

      this.emit('execution', { type: 'complete', execution, data: result });
      return result;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.emit('execution', { type: 'error', execution, data: error });
      throw error;

    } finally {
      this.activeExecutions.delete(execution.id);
    }
  }

  /**
   * Execute multiple tools with orchestration
   */
  async executeOrchestration(
    plan: OrchestrationPlan,
    context: ToolExecutionContext
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();
    const completed = new Set<string>();
    const inProgress = new Set<string>();

    // Create execution queue respecting dependencies
    const queue = [...plan.executions];
    const maxConcurrent = Math.min(this.config.maxConcurrentTools, queue.length);

    logger.info(`Starting orchestrated execution of ${queue.length} tools (max ${maxConcurrent} concurrent)`);

    while (queue.length > 0 || inProgress.size > 0) {
      // Find ready executions (dependencies satisfied)
      const readyExecutions = queue.filter(execution =>
        execution.dependencies.every(dep => completed.has(dep))
      );

      // Start executions up to concurrent limit
      const slotsAvailable = maxConcurrent - inProgress.size;
      const toStart = readyExecutions.slice(0, slotsAvailable);

      for (const execution of toStart) {
        // Remove from queue and add to in-progress
        const index = queue.indexOf(execution);
        queue.splice(index, 1);
        inProgress.add(execution.id);

        // Execute asynchronously
        this.executeTool(execution.toolName, execution.parameters, context)
          .then(result => {
            results.set(execution.id, result);
            completed.add(execution.id);
            inProgress.delete(execution.id);

            logger.debug(`Completed execution ${execution.id} (${execution.toolName})`);
          })
          .catch(error => {
            const errorResult: ToolResult = {
              success: false,
              error: error.message
            };
            results.set(execution.id, errorResult);
            completed.add(execution.id);
            inProgress.delete(execution.id);

            logger.error(`Failed execution ${execution.id} (${execution.toolName}): ${error.message}`);
          });
      }

      // Wait a bit before checking for more ready executions
      if (toStart.length === 0 && inProgress.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Prevent infinite loop
      if (toStart.length === 0 && inProgress.size === 0 && queue.length > 0) {
        logger.error('Deadlock detected in orchestration plan - circular dependencies?');
        break;
      }
    }

    return results;
  }

  /**
   * Create an orchestration plan from tool execution requests
   */
  createPlan(executions: Array<{
    toolName: string;
    parameters: Record<string, any>;
    dependencies?: string[];
  }>): OrchestrationPlan {
    const plan: OrchestrationPlan = {
      executions: [],
      dependencies: new Map(),
      estimatedDuration: 0
    };

    // Create execution objects
    for (const exec of executions) {
      const execution: ToolExecution = {
        id: this.generateExecutionId(),
        toolName: exec.toolName,
        parameters: exec.parameters,
        status: 'pending',
        startTime: new Date(),
        dependencies: exec.dependencies || []
      };

      plan.executions.push(execution);
      plan.dependencies.set(execution.id, execution.dependencies);
    }

    // Validate dependencies
    this.validateDependencies(plan);

    // Estimate duration (simplified)
    plan.estimatedDuration = this.estimatePlanDuration(plan);

    return plan;
  }

  /**
   * Get execution status
   */
  getExecutionStatus(): Array<{
    id: string;
    toolName: string;
    status: string;
    duration: number;
  }> {
    return Array.from(this.activeExecutions.values()).map(execution => ({
      id: execution.id,
      toolName: execution.toolName,
      status: execution.status,
      duration: Date.now() - execution.startTime.getTime()
    }));
  }

  /**
   * Cancel all active executions
   */
  cancelAll(): void {
    for (const execution of this.activeExecutions.values()) {
      execution.status = 'failed';
      this.emit('execution', {
        type: 'error',
        execution,
        data: new Error('Execution cancelled')
      });
    }
    this.activeExecutions.clear();
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(toolName: string, parameters: Record<string, any>): string {
    const paramString = JSON.stringify(parameters, Object.keys(parameters).sort());
    return `${toolName}:${Buffer.from(paramString).toString('base64')}`;
  }

  private validateDependencies(plan: OrchestrationPlan): void {
    const executionIds = new Set(plan.executions.map(e => e.id));

    for (const execution of plan.executions) {
      for (const dep of execution.dependencies) {
        if (!executionIds.has(dep)) {
          throw new Error(`Invalid dependency '${dep}' in execution '${execution.id}'`);
        }
      }
    }

    // Check for circular dependencies (simplified)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (execId: string): boolean => {
      if (recursionStack.has(execId)) return true;
      if (visited.has(execId)) return false;

      visited.add(execId);
      recursionStack.add(execId);

      const execution = plan.executions.find(e => e.id === execId);
      if (execution) {
        for (const dep of execution.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      recursionStack.delete(execId);
      return false;
    };

    for (const execution of plan.executions) {
      if (hasCycle(execution.id)) {
        throw new Error('Circular dependency detected in orchestration plan');
      }
    }
  }

  private estimatePlanDuration(plan: OrchestrationPlan): number {
    // Simplified estimation: assume each tool takes 5 seconds
    // In reality, this would be based on tool metadata and historical data
    const avgToolDuration = 5000;
    const maxParallel = this.config.maxConcurrentTools;
    const totalTools = plan.executions.length;

    return Math.ceil(totalTools / maxParallel) * avgToolDuration;
  }
}