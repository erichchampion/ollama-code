/**
 * Tool Orchestrator
 *
 * Manages execution of multiple tools with dependency resolution,
 * parallel execution, and result aggregation.
 */
import { EventEmitter } from 'events';
import { ToolExecutionContext, ToolOrchestratorConfig, ToolResult, OrchestrationPlan } from './types.js';
export type { OrchestrationPlan } from './types.js';
export declare class ToolOrchestrator extends EventEmitter {
    private config;
    private activeExecutions;
    private executionCache;
    constructor(config?: Partial<ToolOrchestratorConfig>);
    /**
     * Execute a single tool
     */
    executeTool(toolName: string, parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    /**
     * Execute multiple tools with orchestration
     */
    executeOrchestration(plan: OrchestrationPlan, context: ToolExecutionContext): Promise<Map<string, ToolResult>>;
    /**
     * Create an orchestration plan from tool execution requests
     */
    createPlan(executions: Array<{
        toolName: string;
        parameters: Record<string, any>;
        dependencies?: string[];
    }>): OrchestrationPlan;
    /**
     * Get execution status
     */
    getExecutionStatus(): Array<{
        id: string;
        toolName: string;
        status: string;
        duration: number;
    }>;
    /**
     * Cancel all active executions
     */
    cancelAll(): void;
    private generateExecutionId;
    private generateCacheKey;
    private validateDependencies;
    private estimatePlanDuration;
}
