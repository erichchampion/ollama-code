/**
 * User Intent Factory
 *
 * Provides standardized creation of UserIntent objects to eliminate
 * code duplication and ensure consistency across the system.
 */
import { UserIntent } from '../ai/intent-analyzer.js';
export declare class UserIntentFactory {
    /**
     * Create a basic UserIntent with default values
     */
    static create(type: UserIntent['type'], action: string, overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a task execution intent for confirmed plans
     */
    static createTaskExecution(action: 'execute_plan' | 'cancel_plan' | 'modify_plan' | 'show_details', overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a conversation intent for error responses
     */
    static createErrorResponse(errorMessage?: string): UserIntent;
    /**
     * Create a high-confidence intent for direct command execution
     */
    static createCommandIntent(action: string, confidence?: number, overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a task request intent for complex operations
     */
    static createTaskRequest(action: string, complexity?: UserIntent['complexity'], overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a question intent for informational queries
     */
    static createQuestion(action: string, confidence?: number, overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a clarification intent when user input is unclear
     */
    static createClarification(suggestions: string[], overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Create a conversation intent for general chat
     */
    static createConversation(action?: string, overrides?: Partial<UserIntent>): UserIntent;
    /**
     * Merge multiple intents (for complex multi-step operations)
     */
    static mergeIntents(primary: UserIntent, secondary: UserIntent[]): UserIntent;
    /**
     * Validate a UserIntent object
     */
    static validate(intent: UserIntent): {
        valid: boolean;
        errors: string[];
    };
}
