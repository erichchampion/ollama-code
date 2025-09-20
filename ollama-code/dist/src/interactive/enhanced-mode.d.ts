/**
 * Enhanced Interactive Mode
 *
 * Natural language interactive mode with intent analysis, conversation management,
 * and autonomous task execution capabilities.
 */
export interface EnhancedModeOptions {
    autoApprove?: boolean;
    confirmHighRisk?: boolean;
    verbosity?: 'concise' | 'detailed' | 'explanatory';
    preferredApproach?: 'conservative' | 'balanced' | 'aggressive';
}
export declare class EnhancedInteractiveMode {
    private intentAnalyzer;
    private conversationManager;
    private nlRouter;
    private taskPlanner?;
    private queryProcessor?;
    private projectContext?;
    private terminal;
    private running;
    private options;
    private pendingTaskPlan?;
    private pendingRoutingResult?;
    constructor(options?: EnhancedModeOptions);
    /**
     * Start the enhanced interactive mode
     */
    start(): Promise<void>;
    /**
     * Initialize all components
     */
    private initialize;
    /**
     * Main interactive loop
     */
    private runMainLoop;
    /**
     * Process user input through natural language routing
     */
    private processUserInput;
    /**
     * Handle user response to pending task plan
     */
    private handlePendingTaskPlanResponse;
    /**
     * Handle clarification requests
     */
    private handleClarificationRequest;
    /**
     * Handle command execution
     */
    private handleCommandExecution;
    /**
     * Handle task planning and execution
     */
    private handleTaskPlanning;
    /**
     * Handle conversation responses
     */
    private handleConversation;
    /**
     * Multi-step query processing methods
     */
    private shouldUseMultiStepProcessing;
    private handleMultiStepQuery;
    /**
     * Utility methods
     */
    private getUserInput;
    private handleSpecialCommands;
    private confirmAction;
    private displayWelcomeMessage;
    private displayHelp;
    private displayStatus;
    private displayHistory;
    private displaySummary;
    private displayQuerySession;
    private endQuerySession;
    private displayTaskPlan;
    private displayResponse;
    private updateConversationOutcome;
    private processRoutingResult;
    /**
     * Display task plan results to user
     */
    private displayPlanResults;
    private cleanup;
}
