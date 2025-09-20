/**
 * Enhanced Interactive Mode
 *
 * Natural language interactive mode with intent analysis, conversation management,
 * and autonomous task execution capabilities.
 */
import { logger } from '../utils/logger.js';
import { initTerminal } from '../terminal/index.js';
import { formatErrorForDisplay } from '../errors/formatter.js';
import { EnhancedIntentAnalyzer } from '../ai/enhanced-intent-analyzer.js';
import { ConversationManager } from '../ai/conversation-manager.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';
import { ProjectContext } from '../ai/context.js';
import { TaskPlanner } from '../ai/task-planner.js';
import { executeCommand } from '../commands/index.js';
import { getAIClient, getEnhancedClient, initAI } from '../ai/index.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { initializeToolSystem } from '../tools/index.js';
import { registerCommands } from '../commands/register.js';
import { EXIT_COMMANDS } from '../constants.js';
export class EnhancedInteractiveMode {
    intentAnalyzer;
    conversationManager;
    nlRouter;
    taskPlanner;
    projectContext;
    terminal;
    running = false;
    options;
    pendingTaskPlan;
    pendingRoutingResult;
    constructor(options = {}) {
        this.options = {
            autoApprove: options.autoApprove ?? false,
            confirmHighRisk: options.confirmHighRisk ?? true,
            verbosity: options.verbosity ?? 'detailed',
            preferredApproach: options.preferredApproach ?? 'balanced'
        };
    }
    /**
     * Start the enhanced interactive mode
     */
    async start() {
        try {
            await this.initialize();
            await this.runMainLoop();
        }
        catch (error) {
            logger.error('Enhanced interactive mode failed:', error);
            throw error;
        }
        finally {
            await this.cleanup();
        }
    }
    /**
     * Initialize all components
     */
    async initialize() {
        logger.info('Initializing enhanced interactive mode...');
        // Initialize terminal
        this.terminal = await initTerminal({});
        // Initialize tool system and commands
        initializeToolSystem();
        registerCommands();
        // Ensure Ollama server is running
        this.terminal.info('Ensuring Ollama server is running...');
        await ensureOllamaServerRunning();
        // Initialize AI capabilities
        this.terminal.info('Initializing AI capabilities...');
        await initAI();
        // Initialize components
        const aiClient = getAIClient();
        this.intentAnalyzer = new EnhancedIntentAnalyzer(aiClient);
        this.conversationManager = new ConversationManager();
        // Initialize project context if in a project directory
        try {
            this.projectContext = new ProjectContext(process.cwd());
            await this.projectContext.initialize();
            this.terminal.success('Project context loaded');
        }
        catch (error) {
            logger.debug('No project context available:', error);
        }
        // Initialize task planner if enhanced client is available
        try {
            const enhancedClient = getEnhancedClient();
            this.taskPlanner = new TaskPlanner(enhancedClient, this.projectContext);
            this.terminal.success('Task planning capabilities enabled');
        }
        catch (error) {
            logger.debug('Task planner not available:', error);
        }
        // Initialize natural language router
        this.nlRouter = new NaturalLanguageRouter(this.intentAnalyzer, this.taskPlanner);
        // Load existing conversation if available
        await this.conversationManager.loadConversation();
        this.terminal.success('Enhanced interactive mode ready!');
        this.displayWelcomeMessage();
    }
    /**
     * Main interactive loop
     */
    async runMainLoop() {
        this.running = true;
        while (this.running) {
            try {
                // Get user input
                const userInput = await this.getUserInput();
                if (!userInput || userInput.trim() === '') {
                    continue;
                }
                // Handle special commands
                if (this.handleSpecialCommands(userInput)) {
                    continue;
                }
                // Check if we have a pending task plan that needs user response
                if (this.pendingTaskPlan && this.pendingRoutingResult) {
                    await this.handlePendingTaskPlanResponse(userInput);
                    continue;
                }
                // Process the input
                await this.processUserInput(userInput);
            }
            catch (error) {
                const formattedError = formatErrorForDisplay(error);
                this.terminal.error(formattedError);
                // Ask if user wants to continue
                const shouldContinue = await this.terminal.prompt({
                    type: 'confirm',
                    name: 'continue',
                    message: 'An error occurred. Would you like to continue?',
                    default: true
                });
                if (!shouldContinue.continue) {
                    this.running = false;
                }
            }
        }
        this.terminal.info('Goodbye! 👋');
    }
    /**
     * Process user input through natural language routing
     */
    async processUserInput(userInput) {
        this.terminal.info('Processing your request...');
        // Create routing context
        const routingContext = {
            projectContext: this.projectContext,
            conversationManager: this.conversationManager,
            workingDirectory: process.cwd(),
            userPreferences: {
                autoApprove: this.options.autoApprove,
                confirmHighRisk: this.options.confirmHighRisk,
                preferredApproach: this.options.preferredApproach
            }
        };
        // Route the request
        const routingResult = await this.nlRouter.route(userInput, routingContext);
        // Handle the routing result
        switch (routingResult.type) {
            case 'clarification':
                await this.handleClarificationRequest(userInput, routingResult.data, routingContext);
                break;
            case 'command':
                await this.handleCommandExecution(routingResult);
                break;
            case 'task_plan':
                await this.handleTaskPlanning(routingResult);
                break;
            case 'conversation':
                await this.handleConversation(routingResult);
                break;
            default:
                this.terminal.warn('Unknown routing result type');
        }
    }
    /**
     * Handle user response to pending task plan
     */
    async handlePendingTaskPlanResponse(userInput) {
        const response = userInput.toLowerCase().trim();
        if (response === 'yes' || response === 'execute' || response === 'run') {
            // Execute the pending plan
            try {
                this.terminal.info('Executing task plan...');
                await this.taskPlanner.executePlan(this.pendingTaskPlan.id);
                // Get the completed plan and display results
                const completedPlan = this.taskPlanner.getPlan(this.pendingTaskPlan.id);
                logger.debug(`Retrieved plan for results display:`, {
                    planExists: !!completedPlan,
                    planId: this.pendingTaskPlan.id,
                    taskCount: completedPlan?.tasks?.length
                });
                if (completedPlan) {
                    this.displayPlanResults(completedPlan);
                }
                else {
                    logger.warn('No completed plan found for results display');
                    this.terminal.error('❌ Could not retrieve completed plan for results display');
                }
                this.terminal.success('Task plan completed successfully!');
                await this.updateConversationOutcome('success');
            }
            catch (error) {
                this.terminal.error(`Task execution failed: ${formatErrorForDisplay(error)}`);
                await this.updateConversationOutcome('failure');
            }
            // Clear pending state
            this.pendingTaskPlan = undefined;
            this.pendingRoutingResult = undefined;
        }
        else if (response === 'no' || response === 'cancel' || response === 'abort') {
            // Cancel the plan
            this.terminal.info('Task plan cancelled.');
            // Clear pending state
            this.pendingTaskPlan = undefined;
            this.pendingRoutingResult = undefined;
        }
        else if (response === 'modify' || response === 'change' || response === 'edit') {
            // Handle plan modification (for now, just ask them to make a new request)
            this.terminal.info('Plan modification is not yet implemented. Please make a new request with your specific requirements.');
            // Clear pending state
            this.pendingTaskPlan = undefined;
            this.pendingRoutingResult = undefined;
        }
        else {
            // Unknown response, ask again
            this.terminal.warn('I didn\'t understand that response. Please respond with:');
            this.terminal.info('- "yes" or "execute" to run the plan');
            this.terminal.info('- "modify" to adjust the plan');
            this.terminal.info('- "no" or "cancel" to abort');
        }
    }
    /**
     * Handle clarification requests
     */
    async handleClarificationRequest(originalInput, clarification, context) {
        this.terminal.warn('I need some clarification to help you better:');
        // Display questions
        clarification.questions.forEach((question, index) => {
            this.terminal.info(`${index + 1}. ${question}`);
        });
        // Handle options if available
        let clarificationResponse;
        if (clarification.options && clarification.options.length > 0) {
            const choices = clarification.options.map(option => ({
                name: `${option.label} - ${option.description}`,
                value: option.value
            }));
            const selection = await this.terminal.prompt({
                type: 'list',
                name: 'choice',
                message: 'Please select an option:',
                choices
            });
            clarificationResponse = selection.choice;
        }
        else {
            const response = await this.terminal.prompt({
                type: 'input',
                name: 'clarification',
                message: 'Please provide clarification:'
            });
            clarificationResponse = response.clarification;
        }
        // Re-route with clarification
        const newRoutingResult = await this.nlRouter.handleClarification(originalInput, clarificationResponse, context);
        // Process the clarified request
        await this.processRoutingResult(newRoutingResult);
    }
    /**
     * Handle command execution
     */
    async handleCommandExecution(routingResult) {
        const { commandName, args, intent } = routingResult.data;
        // Show what we're about to do
        this.terminal.info(`I'll execute: ${commandName} ${args.join(' ')}`);
        if (routingResult.requiresConfirmation) {
            const confirmed = await this.confirmAction(`Execute command: ${commandName}`, routingResult.estimatedTime, routingResult.riskLevel);
            if (!confirmed) {
                this.terminal.info('Command cancelled.');
                return;
            }
        }
        // Execute the command
        try {
            this.terminal.info(`Executing ${commandName}...`);
            await executeCommand(commandName, args);
            this.terminal.success('Command completed successfully!');
            // Update conversation with success
            await this.updateConversationOutcome('success');
        }
        catch (error) {
            this.terminal.error(`Command failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Handle task planning and execution
     */
    async handleTaskPlanning(routingResult) {
        if (!this.taskPlanner) {
            this.terminal.error('Task planning is not available. Falling back to conversation mode.');
            await this.handleConversation(routingResult);
            return;
        }
        const { intent, context } = routingResult.data;
        this.terminal.info('Creating a task plan for your request...');
        try {
            // Create task plan
            const plan = await this.taskPlanner.createPlan(intent.action, {
                projectRoot: process.cwd(),
                availableTools: [], // Would be populated from tool registry
                projectLanguages: context?.languages || [],
                codebaseSize: 'medium', // Would be determined from project analysis
                userExperience: 'intermediate',
                qualityRequirements: 'production'
            });
            // Display the plan
            this.displayTaskPlan(plan);
            if (routingResult.requiresConfirmation) {
                // Store the pending task plan for user response
                this.pendingTaskPlan = plan;
                this.pendingRoutingResult = routingResult;
                this.terminal.info('\nWould you like me to execute this plan? You can:');
                this.terminal.info('- Say "yes" or "execute" to run the plan');
                this.terminal.info('- Say "modify" to adjust the plan');
                this.terminal.info('- Say "no" or "cancel" to abort');
                this.terminal.info('\nYou can also ask for more details about any specific task or phase.');
                return;
            }
            // Execute the plan immediately if no confirmation needed
            this.terminal.info('Executing task plan...');
            await this.taskPlanner.executePlan(plan.id);
            this.terminal.success('Task plan completed successfully!');
            await this.updateConversationOutcome('success');
        }
        catch (error) {
            this.terminal.error(`Task planning failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Handle conversation responses
     */
    async handleConversation(routingResult) {
        const { intent, contextualPrompt } = routingResult.data;
        try {
            this.terminal.info('Thinking...');
            // Get AI response using contextual prompt
            const aiClient = getAIClient();
            const response = await aiClient.complete(contextualPrompt, {
                temperature: 0.7
            });
            const responseText = response.message?.content || 'I apologize, but I couldn\'t generate a response.';
            // Display the response with appropriate formatting
            this.displayResponse(responseText, intent.type);
            // Update conversation
            await this.updateConversationOutcome('success', responseText);
        }
        catch (error) {
            this.terminal.error(`Failed to generate response: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Utility methods
     */
    async getUserInput() {
        const prompt = await this.terminal.prompt({
            type: 'input',
            name: 'input',
            message: '💬 How can I help you?',
        });
        return prompt.input;
    }
    handleSpecialCommands(input) {
        const trimmedInput = input.trim().toLowerCase();
        // Handle exit commands
        if (EXIT_COMMANDS.includes(trimmedInput)) {
            this.running = false;
            return true;
        }
        // Handle special mode commands
        switch (trimmedInput) {
            case '/help':
                this.displayHelp();
                return true;
            case '/status':
                this.displayStatus();
                return true;
            case '/clear':
                console.clear();
                this.displayWelcomeMessage();
                return true;
            case '/history':
                this.displayHistory();
                return true;
            case '/summary':
                this.displaySummary();
                return true;
            default:
                return false;
        }
    }
    async confirmAction(action, estimatedTime, riskLevel) {
        const riskEmoji = riskLevel === 'high' ? '⚠️' : riskLevel === 'medium' ? '⚡' : '✅';
        const confirmed = await this.terminal.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: `${riskEmoji} ${action}\nEstimated time: ${estimatedTime} minutes\nRisk level: ${riskLevel}\nProceed?`,
            default: riskLevel === 'low'
        });
        return confirmed.confirmed;
    }
    displayWelcomeMessage() {
        console.log(`
🤖 Ollama Code - Enhanced Interactive Mode

I can help you with:
• 💬 Natural language requests ("Create a React component for user login")
• 🛠️ Code analysis and refactoring
• 📝 Documentation and explanations
• 🧪 Testing and validation
• 🚀 Project setup and deployment

Special commands:
• /help - Show this help
• /status - Show current status
• /clear - Clear screen
• /history - Show conversation history
• /summary - Show conversation summary
• exit, quit, bye - Exit the application

${this.projectContext ? `📁 Project: ${this.projectContext.root}` : '📁 No project detected'}
${this.taskPlanner ? '✅ Task planning enabled' : '❌ Task planning unavailable'}
`);
    }
    displayHelp() {
        console.log(`
🔧 Enhanced Interactive Mode Help

Examples of what you can ask:
• "Create a new React component for displaying user profiles"
• "Refactor the authentication module to use JWT tokens"
• "Add unit tests for the user service"
• "Explain how the database connection works"
• "Fix the performance issue in the search function"
• "Set up a CI/CD pipeline for this project"

You can also use traditional commands:
• list-models
• explain <file>
• search <term>
• run <command>

The AI will automatically determine whether to:
• Execute a direct command
• Create and execute a task plan
• Provide information or explanation
• Ask for clarification
`);
    }
    displayStatus() {
        const context = this.conversationManager.getConversationContext();
        console.log(`
📊 Current Status

Session: ${context.sessionId}
Turns: ${context.turnCount}
Topics: ${context.currentTopics.join(', ') || 'None'}
${context.activeTask ? `Active Task: ${context.activeTask.description} (${context.activeTask.progress}%)` : 'No active task'}

Preferences:
• Verbosity: ${this.options.verbosity}
• Auto-approve: ${this.options.autoApprove ? 'Yes' : 'No'}
• Confirm high-risk: ${this.options.confirmHighRisk ? 'Yes' : 'No'}
• Approach: ${this.options.preferredApproach}

Project:
${this.projectContext ? `• Root: ${this.projectContext.root}` : '• No project detected'}
${this.projectContext ? `• Files: ${this.projectContext.allFiles.length}` : ''}
${this.projectContext ? `• Languages: ${this.projectContext.projectLanguages.join(', ')}` : ''}
`);
    }
    displayHistory() {
        const history = this.conversationManager.getRecentHistory(10);
        if (history.length === 0) {
            this.terminal.info('No conversation history available.');
            return;
        }
        console.log('\n📜 Recent Conversation History:\n');
        history.forEach((turn, index) => {
            const outcome = turn.outcome === 'success' ? '✅' :
                turn.outcome === 'failure' ? '❌' :
                    turn.outcome === 'partial' ? '⚠️' : '⏳';
            console.log(`${index + 1}. ${outcome} [${turn.intent.type}] ${turn.userInput}`);
            console.log(`   Response: ${turn.response.substring(0, 100)}${turn.response.length > 100 ? '...' : ''}`);
            console.log('');
        });
    }
    displaySummary() {
        const summary = this.conversationManager.generateSummary(7);
        console.log(`
📈 Conversation Summary (Last 7 days)

• Total turns: ${summary.totalTurns}
• Success rate: ${(summary.successRate * 100).toFixed(1)}%
• User satisfaction: ${summary.userSatisfaction.toFixed(1)}/5
• Productive hours: ${summary.productiveHours.toFixed(1)}

Top topics:
${summary.topTopics.slice(0, 5).map(topic => `• ${topic.topic} (${topic.count})`).join('\n')}

Common patterns:
${summary.commonPatterns.slice(0, 3).map(pattern => `• ${pattern}`).join('\n')}
`);
    }
    displayTaskPlan(plan) {
        console.log(`
📋 Task Plan: ${plan.title}

Description: ${plan.description}
Estimated Duration: ${plan.estimatedDuration} minutes
Complexity: ${plan.metadata.complexity}
Confidence: ${(plan.metadata.confidence * 100).toFixed(1)}%

Tasks:
${plan.tasks.map((task, index) => `${index + 1}. [${task.priority}] ${task.title}\n   ${task.description}`).join('\n')}
`);
    }
    displayResponse(response, intentType) {
        const icon = intentType === 'question' ? '💡' :
            intentType === 'task_request' ? '🚀' : '💬';
        console.log(`\n${icon} ${response}\n`);
    }
    async updateConversationOutcome(outcome, response) {
        const recentHistory = this.conversationManager.getRecentHistory(1);
        if (recentHistory.length > 0) {
            await this.conversationManager.updateTurnOutcome(recentHistory[0].id, outcome);
        }
    }
    async processRoutingResult(routingResult) {
        switch (routingResult.type) {
            case 'command':
                await this.handleCommandExecution(routingResult);
                break;
            case 'task_plan':
                await this.handleTaskPlanning(routingResult);
                break;
            case 'conversation':
                await this.handleConversation(routingResult);
                break;
        }
    }
    /**
     * Display task plan results to user
     */
    displayPlanResults(plan) {
        logger.debug('displayPlanResults called with plan:', {
            hasTitle: !!plan.title,
            taskCount: plan.tasks?.length,
            completedCount: plan.tasks?.filter((t) => t.status === 'completed').length,
            sampleTaskResults: plan.tasks?.slice(0, 2).map((t) => ({
                title: t.title,
                status: t.status,
                hasResult: !!t.result,
                resultLength: t.result?.length
            }))
        });
        this.terminal.info('\n📊 Task Plan Results:\n');
        const completedTasks = plan.tasks.filter((t) => t.status === 'completed');
        const failedTasks = plan.tasks.filter((t) => t.status === 'failed');
        if (completedTasks.length > 0) {
            this.terminal.success(`✅ Completed ${completedTasks.length}/${plan.tasks.length} tasks:\n`);
            for (const task of completedTasks) {
                this.terminal.info(`📋 **${task.title}**`);
                if (task.result) {
                    // Format and display the task result
                    const result = typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2);
                    this.terminal.info(`${result}\n`);
                }
            }
        }
        if (failedTasks.length > 0) {
            this.terminal.error(`❌ Failed ${failedTasks.length} tasks:\n`);
            for (const task of failedTasks) {
                this.terminal.error(`- ${task.title}: ${task.error || 'Unknown error'}`);
            }
        }
        // Show execution summary
        const duration = plan.completed ?
            ((new Date(plan.completed).getTime() - new Date(plan.started).getTime()) / (1000 * 60)).toFixed(1) :
            'N/A';
        this.terminal.info(`\n⏱️  Execution completed in ${duration} minutes`);
    }
    async cleanup() {
        if (this.conversationManager) {
            await this.conversationManager.persistConversation();
        }
    }
}
//# sourceMappingURL=enhanced-mode.js.map