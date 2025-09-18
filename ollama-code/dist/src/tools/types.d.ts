/**
 * Tool System Types
 *
 * Defines the interfaces and types for the tool system that enables
 * sophisticated multi-tool orchestration for coding tasks.
 */
export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    default?: any;
    validation?: (value: any) => boolean;
}
export interface ToolMetadata {
    name: string;
    description: string;
    category: string;
    version: string;
    parameters: ToolParameter[];
    examples: ToolExample[];
    dependencies?: string[];
}
export interface ToolExample {
    description: string;
    parameters: Record<string, any>;
    expectedOutput?: string;
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: {
        executionTime: number;
        resourcesUsed?: Record<string, any>;
        warnings?: string[];
    };
}
export interface ToolExecutionContext {
    projectRoot: string;
    workingDirectory: string;
    environment: Record<string, string>;
    timeout: number;
    abortSignal?: AbortSignal;
}
export declare abstract class BaseTool {
    abstract metadata: ToolMetadata;
    abstract execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    validateParameters(parameters: Record<string, any>): boolean;
    getParameterDefaults(): Record<string, any>;
}
export interface ToolRegistry {
    register(tool: BaseTool): void;
    unregister(name: string): void;
    get(name: string): BaseTool | undefined;
    list(): ToolMetadata[];
    getByCategory(category: string): BaseTool[];
    search(query: string): BaseTool[];
}
export interface ToolOrchestratorConfig {
    maxConcurrentTools: number;
    defaultTimeout: number;
    enableCaching: boolean;
    cacheTTL: number;
}
export interface ToolExecution {
    id: string;
    toolName: string;
    parameters: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: ToolResult;
    startTime: Date;
    endTime?: Date;
    dependencies: string[];
}
export interface OrchestrationPlan {
    executions: ToolExecution[];
    dependencies: Map<string, string[]>;
    estimatedDuration: number;
}
