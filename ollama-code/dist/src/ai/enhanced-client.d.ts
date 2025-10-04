/**
 * Enhanced AI Client
 *
 * Integrates all phases into a comprehensive AI-powered development assistant
 * with natural language understanding, autonomous code modification, and
 * intelligent task planning and execution.
 */
import { ProjectContext } from './context.js';
import { UserIntent } from './intent-analyzer.js';
import { TaskPlan } from './task-planner.js';
import { ProcessingUpdate } from '../streaming/streaming-processor.js';
export interface EnhancedClientConfig {
    model: string;
    baseUrl?: string;
    contextWindow?: number;
    temperature?: number;
    enableTaskPlanning: boolean;
    enableConversationHistory: boolean;
    enableContextAwareness: boolean;
    maxConversationHistory: number;
    autoSaveConversations: boolean;
    enableAutonomousModification?: boolean;
    executionPreferences?: {
        parallelism: number;
        riskTolerance: 'conservative' | 'balanced' | 'aggressive';
        autoExecute: boolean;
    };
}
export interface ProcessingResult {
    success: boolean;
    intent: UserIntent;
    response: string;
    executionPlan?: TaskPlan;
    conversationId: string;
    processingTime: number;
    error?: string;
    streamingUpdates?: ProcessingUpdate[];
}
export interface SessionState {
    conversationId: string;
    activeTaskPlan?: TaskPlan;
    pendingTasks: string[];
    executionHistory: ExecutionSummary[];
    preferences: UserPreferences;
}
export interface ExecutionSummary {
    planId: string;
    title: string;
    completedAt: Date;
    totalTasks: number;
    successfulTasks: number;
    duration: number;
}
export interface UserPreferences {
    verbosity: 'minimal' | 'standard' | 'detailed';
    autoConfirm: boolean;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    preferredExecutionMode: 'manual' | 'assisted' | 'autonomous';
}
export declare class EnhancedClient {
    private ollamaClient;
    private projectContext;
    private intentAnalyzer;
    private conversationManager;
    private taskPlanner;
    private autonomousModifier;
    private nlRouter;
    private streamingProcessor;
    private config;
    private sessionState;
    private sessionMetrics;
    private responseCache;
    private sessionStateMutex;
    constructor(ollamaClient: any, projectContext?: ProjectContext, config?: Partial<EnhancedClientConfig>);
    /**
     * Initialize all components
     */
    initialize(): Promise<void>;
    /**
     * Process a user message with streaming updates
     */
    processMessageStreaming(message: string): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Process a user message with full enhanced capabilities
     */
    processMessage(message: string): Promise<ProcessingResult>;
    /**
     * Internal message processing logic
     */
    private processMessageInternal;
    /**
     * Create and potentially execute a plan for the intent
     */
    private createAndExecutePlan;
    /**
     * Execute a command with streaming updates
     */
    executeCommandStreaming(routingResult: any): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Execute a command directly
     */
    private executeCommand;
    /**
     * Internal command execution logic
     */
    private executeCommandInternal;
    /**
     * Generate a response with streaming updates
     */
    generateResponseStreaming(intent: UserIntent, routingResult: any): AsyncIterableIterator<ProcessingUpdate>;
    /**
     * Generate a response based on intent and routing result
     */
    private generateResponse;
    /**
     * Internal response generation logic
     */
    private generateResponseInternal;
    /**
     * Determine if plan should be auto-executed
     */
    private shouldAutoExecute;
    /**
     * Generate plan proposal for user approval
     */
    private generatePlanProposal;
    /**
     * Execute pending plan (when user approves)
     */
    executePendingPlan(): Promise<ProcessingResult>;
    /**
     * Get current session state
     */
    getSessionState(): SessionState;
    /**
     * Update user preferences
     */
    updatePreferences(preferences: Partial<UserPreferences>): void;
    /**
     * Get conversation history
     */
    getConversationHistory(): any[];
    /**
     * Get execution history
     */
    getExecutionHistory(): ExecutionSummary[];
    /**
     * Start new conversation
     */
    startNewConversation(): string;
    /**
     * Get project context
     */
    getProjectContext(): ProjectContext;
    /**
     * Get default user preferences
     */
    private getDefaultPreferences;
    /**
     * Complete text using the underlying AI client
     */
    complete(prompt: string, options?: any): Promise<any>;
    /**
     * Check if client is ready
     */
    isReady(): Promise<boolean>;
    /**
     * Get streaming processor status
     */
    getStreamingStatus(): {
        activeStreams: number;
        averageProgress: number;
        oldestStreamAge: number;
    };
    /**
     * Get system status
     */
    getSystemStatus(): {
        ready: boolean;
        activeExecutions: number;
        conversationId: string;
        executionHistory: number;
        streaming: {
            activeStreams: number;
            averageProgress: number;
        };
    };
    /**
     * Check if user message is a confirmation for pending task plan
     */
    private checkForTaskPlanConfirmation;
    /**
     * Handle task plan confirmation response
     */
    private handleTaskPlanConfirmation;
    /**
     * Generate detailed description of task plan
     */
    private generateTaskPlanDetails;
}
