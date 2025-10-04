/**
 * Natural Language Router
 *
 * Routes user requests between command execution, task planning, and conversation
 * based on intent analysis and context.
 */
import { UserIntent, IntentAnalyzer } from '../ai/intent-analyzer.js';
import { EnhancedIntentAnalyzer } from '../ai/enhanced-intent-analyzer.js';
import { ConversationManager } from '../ai/conversation-manager.js';
import { TaskPlanner } from '../ai/task-planner.js';
import { ProjectContext } from '../ai/context.js';
import { FileOperationIntent } from './file-operation-types.js';
export interface RoutingResult {
    type: 'command' | 'task_plan' | 'conversation' | 'clarification' | 'tool' | 'file_operation';
    action: string;
    data: any;
    requiresConfirmation: boolean;
    estimatedTime: number;
    riskLevel: 'low' | 'medium' | 'high';
    enhancedContext?: any;
    fileOperation?: FileOperationIntent;
}
export interface RoutingContext {
    projectContext?: ProjectContext;
    conversationManager: ConversationManager;
    workingDirectory: string;
    userPreferences: {
        autoApprove: boolean;
        confirmHighRisk: boolean;
        preferredApproach: 'conservative' | 'balanced' | 'aggressive';
    };
    enhancedContext?: any;
}
export interface NLRouterConfig {
    commandConfidenceThreshold?: number;
    taskConfidenceThreshold?: number;
    healthCheckInterval?: number;
    patterns?: {
        gitStatus?: string[];
        gitCommit?: string[];
        gitBranch?: string[];
    };
}
export interface ClarificationRequest {
    questions: string[];
    options?: Array<{
        label: string;
        value: string;
        description: string;
    }>;
    context: string;
    required: boolean;
}
export declare class NaturalLanguageRouter {
    private intentAnalyzer;
    private taskPlanner?;
    private commandConfidenceThreshold;
    private taskConfidenceThreshold;
    private healthCheckInterval;
    private config;
    private enhancedFastPathRouter;
    private cacheManager;
    private fileOperationClassifier?;
    constructor(intentAnalyzer: IntentAnalyzer | EnhancedIntentAnalyzer, taskPlanner?: TaskPlanner, config?: NLRouterConfig);
    private ensureCacheManager;
    /**
     * Route user input to appropriate handler
     */
    route(input: string, context: RoutingContext): Promise<RoutingResult>;
    /**
     * Handle clarification requests
     */
    handleClarification(originalInput: string, clarificationResponse: string, context: RoutingContext): Promise<RoutingResult>;
    /**
     * Generate clarification request for ambiguous input
     */
    generateClarificationRequest(intent: UserIntent): ClarificationRequest;
    /**
     * Check if user input maps to an existing command
     */
    checkCommandMapping(intent: UserIntent): Promise<{
        isCommand: boolean;
        commandName?: string;
        args?: string[];
    }>;
    /**
     * Determine the appropriate route for the given intent
     */
    private determineRoute;
    /**
     * Map direct commands from natural language
     */
    private mapDirectCommand;
    /**
     * Check if the action is a git status request
     */
    private isGitStatusRequest;
    /**
     * Check if the action is a git commit request
     */
    private isGitCommitRequest;
    /**
     * Check if the action is a git branch request
     */
    private isGitBranchRequest;
    /**
     * Check if the action is detected by pattern-based command mapping
     */
    private isPatternBasedCommand;
    /**
     * Fast command mapping that bypasses AI analysis for obvious commands
     */
    private checkFastCommandMapping;
    /**
     * Create a simple intent object for fast-path commands
     */
    private createSimpleIntent;
    /**
     * Use AI to map natural language to commands
     */
    private mapCommandWithAI;
    /**
     * Extract command arguments from intent
     */
    private extractCommandArgs;
    /**
     * Determine if confirmation is required
     */
    private shouldRequireConfirmation;
    /**
     * Helper methods
     */
    private getConversationHistory;
    private getRecentFiles;
    private getLastIntent;
    /**
     * Phase 2.2: Classify file operation intent
     */
    private classifyFileOperation;
    /**
     * Phase 2.2: Estimate file operation time
     */
    private estimateFileOperationTime;
    /**
     * Phase 2.2: Map safety level to risk level
     */
    private mapSafetyToRisk;
}
