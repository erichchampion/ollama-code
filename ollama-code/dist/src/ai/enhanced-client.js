/**
 * Enhanced AI Client
 *
 * Integrates all phases into a comprehensive AI-powered development assistant
 * with natural language understanding, autonomous code modification, and
 * intelligent task planning and execution.
 */
import { logger } from '../utils/logger.js';
import { ProjectContext } from './context.js';
import { EnhancedIntentAnalyzer } from './enhanced-intent-analyzer.js';
import { ConversationManager } from './conversation-manager.js';
import { TaskPlanner } from './task-planner.js';
import { AutonomousModifier } from '../core/autonomous-modifier.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';
import { StreamingProcessor } from '../streaming/streaming-processor.js';
import { STREAMING_CONFIG_DEFAULTS } from '../constants/streaming.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages.js';
import { API_REQUEST_TIMEOUT } from '../constants.js';
export class EnhancedClient {
    ollamaClient;
    projectContext;
    intentAnalyzer;
    conversationManager;
    taskPlanner;
    autonomousModifier;
    nlRouter;
    streamingProcessor;
    config;
    sessionState;
    sessionMetrics = new Map();
    responseCache = new Map();
    constructor(ollamaClient, projectContext, config) {
        this.ollamaClient = ollamaClient;
        this.projectContext = projectContext || new ProjectContext(process.cwd());
        this.config = {
            model: 'qwen2.5-coder:latest',
            temperature: 0.7,
            enableTaskPlanning: true,
            enableConversationHistory: true,
            enableContextAwareness: true,
            maxConversationHistory: 50,
            autoSaveConversations: true,
            ...config
        };
        // Initialize core components
        // Use the provided ollamaClient
        this.intentAnalyzer = new EnhancedIntentAnalyzer(this.ollamaClient);
        this.conversationManager = new ConversationManager();
        this.autonomousModifier = new AutonomousModifier();
        this.taskPlanner = new TaskPlanner(this.ollamaClient, this.projectContext);
        // Configure NL Router with optimized settings for fast command detection
        const nlRouterConfig = {
            commandConfidenceThreshold: 0.7, // Slightly lower threshold for better detection
            taskConfidenceThreshold: 0.6,
            healthCheckInterval: 2000
        };
        this.nlRouter = new NaturalLanguageRouter(this.intentAnalyzer, this.taskPlanner, nlRouterConfig);
        // Initialize streaming processor with default settings
        this.streamingProcessor = new StreamingProcessor(STREAMING_CONFIG_DEFAULTS);
        // Initialize session state
        this.sessionState = {
            conversationId: this.conversationManager.getConversationContext().sessionId,
            pendingTasks: [],
            executionHistory: [],
            preferences: this.getDefaultPreferences()
        };
    }
    /**
     * Initialize all components
     */
    async initialize() {
        try {
            logger.info('Initializing Enhanced AI Client');
            // Initialize project context if available
            if (this.projectContext) {
                await this.projectContext.initialize();
            }
            // Test Ollama connection
            await this.ollamaClient.testConnection();
            logger.info('Enhanced AI Client initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Enhanced AI Client:', error);
            throw error;
        }
    }
    /**
     * Process a user message with streaming updates
     */
    async *processMessageStreaming(message) {
        const streamingUpdates = [];
        // Create streaming operation that wraps the entire processing
        const streamingIterator = this.streamingProcessor.processWithStreaming(async () => {
            const result = await this.processMessage(message);
            return result;
        }, `process_${Date.now()}`);
        // Yield updates and collect them for final result
        for await (const update of streamingIterator) {
            streamingUpdates.push(update);
            yield update;
        }
    }
    /**
     * Process a user message with full enhanced capabilities
     */
    async processMessage(message) {
        const startTime = Date.now();
        try {
            logger.info('Processing user message', { message: message.substring(0, 100) });
            // Add to conversation
            // User message is handled when adding turn
            // Analyze intent with built-in timeout protection
            const intent = await this.intentAnalyzer.analyze(message, {
                projectContext: this.projectContext,
                conversationHistory: this.conversationManager.getRecentHistory(5).map(turn => turn.userInput),
                workingDirectory: process.cwd(),
                recentFiles: this.projectContext?.allFiles.slice(0, 20).map(f => f.path) || []
            });
            logger.debug('Intent analyzed', {
                type: intent.type,
                action: intent.action,
                complexity: intent.complexity,
                riskLevel: intent.riskLevel
            });
            // Route to appropriate handler
            const routingContext = {
                projectContext: this.projectContext,
                conversationManager: this.conversationManager,
                workingDirectory: process.cwd(),
                userPreferences: {
                    autoApprove: this.config.executionPreferences?.autoExecute || false,
                    confirmHighRisk: this.config.executionPreferences?.riskTolerance !== 'aggressive',
                    preferredApproach: this.config.executionPreferences?.riskTolerance || 'balanced'
                }
            };
            const routingResult = await this.nlRouter.route(message, routingContext);
            let response;
            let executionPlan;
            if (routingResult.type === 'command') {
                // Execute the identified command directly
                response = await this.executeCommand(routingResult);
            }
            else if (routingResult.type === 'task_plan' && this.config.enableTaskPlanning) {
                // Create and potentially execute plan
                const planResult = await this.createAndExecutePlan(intent);
                response = planResult.response;
                executionPlan = planResult.executionPlan;
            }
            else {
                // Handle as conversation or simple command
                response = await this.generateResponse(intent, routingResult);
            }
            // Add response to conversation
            // Assistant message is handled when adding turn
            const processingTime = Date.now() - startTime;
            // Track metrics
            const currentProcessingTime = this.sessionMetrics.get('avgProcessingTime') || 0;
            const messageCount = this.sessionMetrics.get('messageCount') || 0;
            this.sessionMetrics.set('messageCount', messageCount + 1);
            this.sessionMetrics.set('avgProcessingTime', (currentProcessingTime * messageCount + processingTime) / (messageCount + 1));
            // Cache response if it's useful for future reference
            const cacheKey = `${intent.type}_${intent.action}`;
            this.responseCache.set(cacheKey, response);
            logger.info('Message processing completed', {
                processingTime,
                intentType: intent.type,
                hasTaskPlan: !!executionPlan
            });
            return {
                success: true,
                intent,
                response,
                executionPlan,
                conversationId: this.sessionState.conversationId,
                processingTime
            };
        }
        catch (error) {
            logger.error('Message processing failed:', error);
            const errorResponse = `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
            return {
                success: false,
                intent: {
                    type: 'conversation',
                    action: message,
                    entities: { files: [], directories: [], functions: [], classes: [], technologies: [], concepts: [], variables: [] },
                    confidence: 0,
                    complexity: 'simple',
                    multiStep: false,
                    riskLevel: 'low',
                    requiresClarification: false,
                    suggestedClarifications: [],
                    estimatedDuration: 0,
                    context: {
                        projectAware: false,
                        fileSpecific: false,
                        followUp: false,
                        references: []
                    }
                },
                response: errorResponse,
                conversationId: this.sessionState.conversationId,
                processingTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Create and potentially execute a plan for the intent
     */
    async createAndExecutePlan(intent) {
        try {
            // Create execution plan
            const executionPlan = await this.taskPlanner.createPlan(intent.action, {
                projectRoot: this.projectContext?.root || process.cwd(),
                availableTools: [],
                projectLanguages: this.projectContext?.projectLanguages || [],
                codebaseSize: 'medium',
                userExperience: 'intermediate',
                qualityRequirements: 'production'
            });
            // Store as active plan
            this.sessionState.activeTaskPlan = executionPlan;
            // Determine if we should auto-execute
            const shouldAutoExecute = this.shouldAutoExecute(executionPlan, intent);
            if (shouldAutoExecute) {
                // TODO: Implement direct task execution without execution engine
                // For now, return the plan with a note about auto-execution
                const response = `${this.generatePlanProposal(executionPlan)}\n\n⚠️ Auto-execution is temporarily disabled due to architectural changes.`;
                return {
                    response,
                    executionPlan
                };
            }
            else {
                // Return plan for user approval
                const response = this.generatePlanProposal(executionPlan);
                return {
                    response,
                    executionPlan
                };
            }
        }
        catch (error) {
            logger.error('Plan creation/execution failed:', error);
            throw error;
        }
    }
    /**
     * Execute a command with streaming updates
     */
    async *executeCommandStreaming(routingResult) {
        const { commandName, args } = routingResult.data;
        // Use streaming processor for command execution
        const streamingIterator = this.streamingProcessor.processCommand(commandName, args, async (cmd, cmdArgs) => {
            return await this.executeCommandInternal(cmd, cmdArgs);
        });
        for await (const update of streamingIterator) {
            yield update;
        }
    }
    /**
     * Execute a command directly
     */
    async executeCommand(routingResult) {
        const { commandName, args } = routingResult.data;
        return await this.executeCommandInternal(commandName, args);
    }
    /**
     * Internal command execution logic
     */
    async executeCommandInternal(commandName, args) {
        try {
            // Import the executeCommand function and console capture utility
            const { executeCommand } = await import('../commands/index.js');
            const { captureConsoleOutput } = await import('../utils/console-capture.js');
            // Execute the command with console output capture
            const { result, output, errorOutput, duration } = await captureConsoleOutput(async () => {
                await executeCommand(commandName, args);
                return `Command '${commandName}' executed successfully`;
            }, {
                includeStderr: true,
                maxOutputSize: 512 * 1024, // 512KB limit for command output
                timeout: API_REQUEST_TIMEOUT
            });
            // Combine stdout and stderr if there's error output
            let fullOutput = output;
            if (errorOutput.trim()) {
                fullOutput += '\n' + errorOutput;
            }
            // Return captured output or success message
            if (fullOutput.trim()) {
                return fullOutput;
            }
            else {
                return `${SUCCESS_MESSAGES.COMMAND_SUCCESS_PREFIX}${result}`;
            }
        }
        catch (error) {
            logger.error('Command execution failed:', error);
            // Check if this is a captured error with output
            if (error.output || error.errorOutput) {
                let errorMessage = ERROR_MESSAGES.COMMAND_EXECUTION_FAILED;
                if (error.output) {
                    errorMessage += `\n\nOutput:\n${error.output}`;
                }
                if (error.errorOutput) {
                    errorMessage += `\n\nErrors:\n${error.errorOutput}`;
                }
                if (error.error instanceof Error) {
                    errorMessage += `\n\nError: ${error.error.message}`;
                }
                return errorMessage;
            }
            return `❌ Failed to execute command: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`;
        }
    }
    /**
     * Generate a response with streaming updates
     */
    async *generateResponseStreaming(intent, routingResult) {
        // Use streaming processor for AI analysis
        const streamingIterator = this.streamingProcessor.processAIAnalysis(intent.action, async (message) => {
            return await this.generateResponseInternal(intent, routingResult);
        });
        for await (const update of streamingIterator) {
            yield update;
        }
    }
    /**
     * Generate a response based on intent and routing result
     */
    async generateResponse(intent, routingResult) {
        return await this.generateResponseInternal(intent, routingResult);
    }
    /**
     * Internal response generation logic
     */
    async generateResponseInternal(intent, routingResult) {
        const context = this.conversationManager.generateContextualPrompt(this.sessionState.conversationId, intent);
        // Use the conversation context to generate an appropriate response
        const response = await this.ollamaClient.complete(`Based on the user's intent (${intent.type}: ${intent.action}), please provide a helpful response.

      Context: ${context}

      User's message: ${intent.action}`, {
            temperature: 0.7
        });
        return response.message.content;
    }
    /**
     * Determine if plan should be auto-executed
     */
    shouldAutoExecute(plan, intent) {
        if (!this.config.executionPreferences?.autoExecute) {
            return false;
        }
        // Auto-execute only low-risk plans in aggressive mode
        // Consider plans with fewer tasks and shorter duration as low-risk
        const isLowRisk = plan.tasks.length <= 3 && plan.estimatedDuration <= 5;
        if (this.sessionState.preferences.riskTolerance === 'aggressive' && isLowRisk) {
            return true;
        }
        // Auto-execute simple analysis tasks
        if (intent.type === 'question' && intent.complexity === 'simple') {
            return true;
        }
        return false;
    }
    /**
     * Generate plan proposal for user approval
     */
    generatePlanProposal(plan) {
        const taskSummary = plan.tasks.map(t => `- ${t.title}`).join('\n');
        const estimatedDuration = plan.estimatedDuration;
        // Assess risk based on task count and duration
        const riskLevel = plan.tasks.length > 5 || plan.estimatedDuration > 15 ? 'high' :
            plan.tasks.length > 3 || plan.estimatedDuration > 5 ? 'medium' : 'low';
        return `I've created an execution plan for your request:

**${plan.title}**

**Tasks (${plan.tasks.length}):**
${taskSummary}

**Estimated Duration:** ${estimatedDuration} minutes
**Risk Level:** ${riskLevel}

Would you like me to execute this plan? You can:
- Say "yes" or "execute" to run the plan
- Say "modify" to adjust the plan
- Say "no" or "cancel" to abort

You can also ask for more details about any specific task or phase.`;
    }
    /**
     * Execute pending plan (when user approves)
     */
    async executePendingPlan() {
        if (!this.sessionState.activeTaskPlan) {
            throw new Error('No pending execution plan');
        }
        const startTime = Date.now();
        const plan = this.sessionState.activeTaskPlan;
        try {
            // TODO: Implement direct task execution without execution engine
            // For now, return a response indicating the plan is ready for execution
            const response = `Plan "${plan.title}" is ready for execution.\n\n⚠️ Auto-execution is temporarily disabled due to architectural changes.`;
            return {
                success: true,
                intent: {
                    type: 'command',
                    action: 'execute plan',
                    entities: { files: [], directories: [], functions: [], classes: [], technologies: [], concepts: [], variables: [] },
                    confidence: 1.0,
                    complexity: 'moderate',
                    multiStep: true,
                    riskLevel: plan.metadata.complexity === 'expert' ? 'high' : plan.metadata.complexity === 'complex' ? 'medium' : 'low',
                    requiresClarification: false,
                    suggestedClarifications: [],
                    estimatedDuration: plan.estimatedDuration,
                    context: {
                        projectAware: true,
                        fileSpecific: false,
                        followUp: false,
                        references: []
                    }
                },
                response,
                executionPlan: plan,
                conversationId: this.sessionState.conversationId,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            logger.error('Plan execution failed:', error);
            throw error;
        }
    }
    /**
     * Get current session state
     */
    getSessionState() {
        return { ...this.sessionState };
    }
    /**
     * Update user preferences
     */
    updatePreferences(preferences) {
        Object.assign(this.sessionState.preferences, preferences);
        // TODO: Update execution preferences when execution engine is re-implemented
    }
    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.conversationManager.getRecentHistory();
    }
    /**
     * Get execution history
     */
    getExecutionHistory() {
        return [...this.sessionState.executionHistory];
    }
    /**
     * Start new conversation
     */
    startNewConversation() {
        this.sessionState.conversationId = this.conversationManager.getConversationContext().sessionId;
        this.sessionState.activeTaskPlan = undefined;
        return this.sessionState.conversationId;
    }
    /**
     * Get project context
     */
    getProjectContext() {
        return this.projectContext;
    }
    /**
     * Get default user preferences
     */
    getDefaultPreferences() {
        return {
            verbosity: 'standard',
            autoConfirm: false,
            riskTolerance: 'balanced',
            preferredExecutionMode: 'assisted'
        };
    }
    /**
     * Complete text using the underlying AI client
     */
    async complete(prompt, options = {}) {
        return await this.ollamaClient.complete(prompt, options);
    }
    /**
     * Check if client is ready
     */
    async isReady() {
        try {
            await this.ollamaClient.complete('test');
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get streaming processor status
     */
    getStreamingStatus() {
        const stats = this.streamingProcessor.getStreamStats();
        return {
            activeStreams: stats.activeCount,
            averageProgress: stats.averageProgress,
            oldestStreamAge: stats.oldestStreamAge
        };
    }
    /**
     * Get system status
     */
    getSystemStatus() {
        const streamingStats = this.getStreamingStatus();
        return {
            ready: true, // Simplified for now
            activeExecutions: 0, // TODO: Re-implement when execution engine is added back
            conversationId: this.sessionState.conversationId,
            executionHistory: this.sessionState.executionHistory.length,
            streaming: {
                activeStreams: streamingStats.activeStreams,
                averageProgress: streamingStats.averageProgress
            }
        };
    }
}
//# sourceMappingURL=enhanced-client.js.map