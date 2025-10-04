/**
 * Lazy Initializers for AI Services
 *
 * Provides safe initialization of AI services without circular dependencies.
 * Ensures proper initialization order and state management.
 */
import { OllamaClient } from '../ai/ollama-client.js';
import { EnhancedClient } from '../ai/enhanced-client.js';
import { ProjectContext } from '../ai/context.js';
import { TaskPlanner } from '../ai/task-planner.js';
export declare enum AIInitState {
    NOT_INITIALIZED = "not_initialized",
    INITIALIZING = "initializing",
    READY = "ready",
    FAILED = "failed"
}
export interface AIInitResult {
    ollamaClient: OllamaClient;
    enhancedClient: EnhancedClient;
    projectContext: ProjectContext;
    taskPlanner: TaskPlanner;
}
export declare class LazyInitializers {
    private static aiInitState;
    private static aiInitPromise;
    private static aiInitResult;
    private static aiInitError;
    /**
     * Get current AI initialization state
     */
    static getAIInitState(): AIInitState;
    /**
     * Ensure AI system is initialized
     */
    static ensureAIInitialized(): Promise<AIInitResult>;
    /**
     * Internal AI system initialization
     */
    private static initializeAISystem;
    /**
     * Get AI client with lazy initialization
     */
    static getAIClientLazy(): Promise<OllamaClient>;
    /**
     * Get enhanced client with lazy initialization
     */
    static getEnhancedClientLazy(): Promise<EnhancedClient>;
    /**
     * Get project context with lazy initialization
     */
    static getProjectContextLazy(): Promise<ProjectContext>;
    /**
     * Get task planner with lazy initialization
     */
    static getTaskPlannerLazy(): Promise<TaskPlanner>;
    /**
     * Check if AI system is ready without initializing
     */
    static isAIReady(): boolean;
    /**
     * Check if AI system failed
     */
    static isAIFailed(): boolean;
    /**
     * Get last initialization error
     */
    static getLastError(): Error | null;
    /**
     * Reset AI initialization state (useful for testing)
     */
    static resetAIInitialization(): void;
    /**
     * Force re-initialization of AI system
     */
    static reinitializeAI(): Promise<AIInitResult>;
    /**
     * Get initialization diagnostics
     */
    static getDiagnostics(): {
        state: AIInitState;
        hasResult: boolean;
        hasError: boolean;
        isInitializing: boolean;
        error?: string;
    };
    /**
     * Validate AI system health
     */
    static validateAIHealth(): Promise<{
        healthy: boolean;
        issues: string[];
        components: {
            aiClient: boolean;
            enhancedClient: boolean;
            projectContext: boolean;
            taskPlanner: boolean;
        };
    }>;
    /**
     * Get health report as string
     */
    static getHealthReport(): Promise<string>;
}
