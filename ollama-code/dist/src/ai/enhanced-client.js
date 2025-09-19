/**
 * Enhanced AI Client
 *
 * Integrates all phases into a comprehensive AI-powered development assistant
 * with natural language understanding, autonomous code modification, and
 * intelligent task planning and execution.
 */
import { logger } from '../utils/logger.js';
import { OllamaClient } from './ollama-client.js';
import { IntentAnalyzer } from './intent-analyzer.js';
import { ConversationManager } from './conversation-manager.js';
import { TaskPlanner } from './task-planner.js';
import { ExecutionEngine } from '../execution/execution-engine.js';
import { AutonomousModifier } from '../core/autonomous-modifier.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';
export class EnhancedClient {
    ollamaClient;
    projectContext;
    intentAnalyzer;
    conversationManager;
    taskPlanner;
    executionEngine;
    autonomousModifier;
    nlRouter;
    config;
    sessionState;
    constructor(config, projectContext) {
        this.config = config;
        this.projectContext = projectContext;
        // Initialize core components
        this.ollamaClient = new OllamaClient({
            apiBaseUrl: config.baseUrl,
            defaultModel: config.model
        });
        this.intentAnalyzer = new IntentAnalyzer(this.ollamaClient);
        this.conversationManager = new ConversationManager();
        this.autonomousModifier = new AutonomousModifier();
        this.taskPlanner = new TaskPlanner(this, projectContext);
        this.executionEngine = new ExecutionEngine(projectContext, this.autonomousModifier, this.ollamaClient);
        this.nlRouter = new NaturalLanguageRouter(this.intentAnalyzer, this.taskPlanner);
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
     * Process a user message with full enhanced capabilities
     */
    async processMessage(message) {
        const startTime = Date.now();
        try {
            logger.info('Processing user message', { message: message.substring(0, 100) });
            // Add to conversation
            // User message is handled when adding turn
            // Analyze intent
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
                    autoApprove: this.config.executionPreferences.autoExecute,
                    confirmHighRisk: this.config.executionPreferences.riskTolerance !== 'aggressive',
                    preferredApproach: this.config.executionPreferences.riskTolerance
                }
            };
            const routingResult = await this.nlRouter.route(message, routingContext);
            let response;
            let executionPlan;
            let executionResults;
            if (routingResult.type === 'task_plan' && this.config.enableTaskPlanning) {
                // Create and potentially execute plan
                const planResult = await this.createAndExecutePlan(intent);
                response = planResult.response;
                executionPlan = planResult.executionPlan;
                executionResults = planResult.executionResults;
            }
            else {
                // Handle as conversation or simple command
                response = await this.generateResponse(intent, routingResult);
            }
            // Add response to conversation
            // Assistant message is handled when adding turn
            const processingTime = Date.now() - startTime;
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
                executionResults,
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
                // Execute the plan
                const executionResults = await this.executionEngine.executePlan(executionPlan);
                // Record execution in history
                this.recordExecution(executionPlan, executionResults);
                const response = this.generateExecutionResponse(executionPlan, executionResults);
                return {
                    response,
                    executionPlan,
                    executionResults
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
     * Generate a response based on intent and routing result
     */
    async generateResponse(intent, routingResult) {
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
        if (!this.config.executionPreferences.autoExecute) {
            return false;
        }
        // Auto-execute only low-risk plans in aggressive mode
        if (this.sessionState.preferences.riskTolerance === 'aggressive' &&
            plan.riskAssessment.overallRisk === 'low') {
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
        const estimatedDuration = Math.round(plan.timeline.estimatedEnd.getTime() - plan.timeline.estimatedStart.getTime()) / 60000; // Convert to minutes
        return `I've created an execution plan for your request:

**${plan.title}**

**Tasks (${plan.tasks.length}):**
${taskSummary}

**Estimated Duration:** ${estimatedDuration} minutes
**Risk Level:** ${plan.riskAssessment.overallRisk}
**Phases:** ${plan.phases.length}

Would you like me to execute this plan? You can:
- Say "yes" or "execute" to run the plan
- Say "modify" to adjust the plan
- Say "no" or "cancel" to abort

You can also ask for more details about any specific task or phase.`;
    }
    /**
     * Generate response after execution completion
     */
    generateExecutionResponse(plan, results) {
        const totalTasks = results.size;
        const successfulTasks = Array.from(results.values()).filter(r => r.success).length;
        const failedTasks = totalTasks - successfulTasks;
        let response = `Execution completed for: ${plan.title}\n\n`;
        response += `**Results:**\n`;
        response += `- Total tasks: ${totalTasks}\n`;
        response += `- Successful: ${successfulTasks}\n`;
        response += `- Failed: ${failedTasks}\n\n`;
        if (failedTasks > 0) {
            response += `**Failed Tasks:**\n`;
            for (const [taskId, result] of results) {
                if (!result.success) {
                    const task = plan.tasks.find(t => t.id === taskId);
                    response += `- ${task?.title || taskId}: ${result.error}\n`;
                }
            }
            response += '\n';
        }
        if (successfulTasks === totalTasks) {
            response += '✅ All tasks completed successfully!';
        }
        else if (successfulTasks > 0) {
            response += '⚠️ Partial completion - some tasks need attention.';
        }
        else {
            response += '❌ Execution failed - please review the errors above.';
        }
        return response;
    }
    /**
     * Record execution in session history
     */
    recordExecution(plan, results) {
        const successfulTasks = Array.from(results.values()).filter(r => r.success).length;
        const totalDuration = Array.from(results.values()).reduce((sum, r) => sum + r.duration, 0);
        const summary = {
            planId: plan.id,
            title: plan.title,
            completedAt: new Date(),
            totalTasks: results.size,
            successfulTasks,
            duration: totalDuration
        };
        this.sessionState.executionHistory.push(summary);
        // Clear active plan
        this.sessionState.activeTaskPlan = undefined;
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
            const executionResults = await this.executionEngine.executePlan(plan);
            this.recordExecution(plan, executionResults);
            const response = this.generateExecutionResponse(plan, executionResults);
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
                executionResults,
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
        // Update execution engine preferences based on user preferences
        this.executionEngine.updatePreferences({
            riskTolerance: preferences.riskTolerance || this.sessionState.preferences.riskTolerance
        });
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
     * Get system status
     */
    getSystemStatus() {
        return {
            ready: true, // Simplified for now
            activeExecutions: this.executionEngine.getActiveExecutions().size,
            conversationId: this.sessionState.conversationId,
            executionHistory: this.sessionState.executionHistory.length
        };
    }
}
//# sourceMappingURL=enhanced-client.js.map