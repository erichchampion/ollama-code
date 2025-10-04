/**
 * Conversation Manager
 *
 * Manages conversation context, history, and state across interactive sessions.
 * Provides context-aware response generation and conversation persistence.
 */
import { UserIntent } from './intent-analyzer.js';
import { ProjectContext } from './context.js';
export interface ConversationTurn {
    id: string;
    timestamp: Date;
    userInput: string;
    intent: UserIntent;
    response: string;
    actions: ActionTaken[];
    outcome: 'success' | 'failure' | 'partial' | 'pending';
    feedback?: UserFeedback;
    contextSnapshot: {
        workingDirectory: string;
        activeFiles: string[];
        lastModified: string[];
    };
}
export interface ActionTaken {
    type: 'file_read' | 'file_write' | 'file_create' | 'file_delete' | 'command_execute' | 'analysis' | 'tool_use';
    target: string;
    details: string;
    timestamp: Date;
    success: boolean;
    error?: string;
}
export interface UserFeedback {
    rating: number;
    helpful: boolean;
    accurate: boolean;
    comments?: string;
    timestamp: Date;
}
export interface ConversationContext {
    sessionId: string;
    startTime: Date;
    lastActivity: Date;
    turnCount: number;
    currentTopics: string[];
    activeTask?: {
        id: string;
        description: string;
        progress: number;
        nextSteps: string[];
    };
    userPreferences: {
        verbosity: 'concise' | 'detailed' | 'explanatory';
        codeStyle: 'functional' | 'object-oriented' | 'mixed';
        toolPreference: string[];
        frameworkPreference: string[];
    };
    projectContext?: ProjectContext;
}
export interface ConversationSummary {
    totalTurns: number;
    successRate: number;
    commonPatterns: string[];
    userSatisfaction: number;
    productiveHours: number;
    topTopics: Array<{
        topic: string;
        count: number;
    }>;
}
export declare class ConversationManager {
    private conversationHistory;
    private context;
    private persistencePath;
    private maxHistorySize;
    private contextWindow;
    constructor(sessionId?: string);
    /**
     * Add a new conversation turn
     */
    addTurn(userInput: string, intent: UserIntent, response: string, actions?: ActionTaken[]): Promise<ConversationTurn>;
    /**
     * Update the outcome of a conversation turn
     */
    updateTurnOutcome(turnId: string, outcome: ConversationTurn['outcome'], feedback?: UserFeedback): Promise<void>;
    /**
     * Get conversation context for the current session
     */
    getConversationContext(): ConversationContext;
    /**
     * Get recent conversation history for context
     */
    getRecentHistory(maxTurns?: number): ConversationTurn[];
    /**
     * Get relevant history based on current intent
     */
    getRelevantHistory(currentIntent: UserIntent, maxTurns?: number): ConversationTurn[];
    /**
     * Generate contextual prompt for AI
     */
    generateContextualPrompt(currentInput: string, currentIntent: UserIntent): string;
    /**
     * Track user feedback and learn preferences
     */
    trackFeedback(turnId: string, feedback: UserFeedback): Promise<void>;
    /**
     * Generate conversation summary
     */
    generateSummary(days?: number): ConversationSummary;
    /**
     * Load conversation from persistence
     */
    loadConversation(sessionId?: string): Promise<void>;
    /**
     * Save conversation to persistence
     */
    persistConversation(): Promise<void>;
    /**
     * Clear conversation history
     */
    clearHistory(): Promise<void>;
    /**
     * Private helper methods
     */
    private initializeContext;
    private updateContext;
    private trimHistory;
    private isIntentRelevant;
    private hasEntityOverlap;
    private isTopicContinuation;
    private updateUserPreferences;
    private extractCommonPatterns;
    private calculateProductiveHours;
    private generateSessionId;
    private generateTurnId;
    private getActiveFiles;
    private getRecentlyModifiedFiles;
    private ensurePersistenceDirectory;
}
