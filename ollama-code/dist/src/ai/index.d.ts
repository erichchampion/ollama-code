/**
 * AI Module
 *
 * Provides AI capabilities using Ollama, local large language model inference.
 * This module handles initialization, configuration, and access to AI services.
 */
import { OllamaClient } from './ollama-client.js';
import { EnhancedClient } from './enhanced-client.js';
import { ProjectContext } from './context.js';
import { TaskPlanner } from './task-planner.js';
/**
 * Initialize the AI module with enhanced capabilities
 */
export declare function initAI(config?: any): Promise<{
    ollamaClient: OllamaClient;
    enhancedClient: EnhancedClient;
    projectContext: ProjectContext;
    taskPlanner: TaskPlanner;
}>;
/**
 * Get the basic AI client instance
 */
export declare function getAIClient(): OllamaClient;
/**
 * Get the enhanced AI client instance
 */
export declare function getEnhancedClient(): EnhancedClient;
/**
 * Get the project context instance
 */
export declare function getProjectContext(): ProjectContext;
/**
 * Get the task planner instance
 */
export declare function getTaskPlanner(): TaskPlanner;
/**
 * Check if AI module is initialized
 */
export declare function isAIInitialized(): boolean;
/**
 * Check if enhanced AI capabilities are initialized
 */
export declare function isEnhancedAIInitialized(): boolean;
/**
 * Cleanup all AI resources
 */
export declare function cleanupAI(): void;
export * from './ollama-client.js';
export * from './prompts.js';
export { ProjectContext } from './context.js';
export { EnhancedClient } from './enhanced-client.js';
export { TaskPlanner } from './task-planner.js';
export type { FileInfo, ProjectDependencies, ConversationTurn, ContextWindow, PromptContext, AIResponse, QualityMetrics, Task, TaskDependency, ExecutionPlan, PlanningContext } from './context.js';
export type { ToolUsePlan, ResponseValidation } from './enhanced-client.js';
export type { TaskType, TaskPriority, TaskStatus, PlanningResult } from './task-planner.js';
