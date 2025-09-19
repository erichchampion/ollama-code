/**
 * Enhanced Interactive Mode
 *
 * Natural language interactive mode with intent analysis, conversation management,
 * and autonomous task execution capabilities.
 */

import { logger } from '../utils/logger.js';
import { initTerminal } from '../terminal/index.js';
import { formatErrorForDisplay } from '../errors/formatter.js';
import { IntentAnalyzer } from '../ai/intent-analyzer.js';
import { ConversationManager } from '../ai/conversation-manager.js';
import { NaturalLanguageRouter, RoutingContext, ClarificationRequest } from '../routing/nl-router.js';
import { ProjectContext } from '../ai/context.js';
import { TaskPlanner } from '../ai/task-planner.js';
import { executeCommand } from '../commands/index.js';
import { getAIClient, getEnhancedClient, initAI } from '../ai/index.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { initializeToolSystem } from '../tools/index.js';
import { registerCommands } from '../commands/register.js';
import { EXIT_COMMANDS } from '../constants.js';

export interface EnhancedModeOptions {
  autoApprove?: boolean;
  confirmHighRisk?: boolean;
  verbosity?: 'concise' | 'detailed' | 'explanatory';
  preferredApproach?: 'conservative' | 'balanced' | 'aggressive';
}

export class EnhancedInteractiveMode {
  private intentAnalyzer!: IntentAnalyzer;
  private conversationManager!: ConversationManager;
  private nlRouter!: NaturalLanguageRouter;
  private taskPlanner?: TaskPlanner;
  private projectContext?: ProjectContext;
  private terminal: any;
  private running = false;
  private options: Required<EnhancedModeOptions>;

  constructor(options: EnhancedModeOptions = {}) {
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
  async start(): Promise<void> {
    try {
      await this.initialize();
      await this.runMainLoop();
    } catch (error) {
      logger.error('Enhanced interactive mode failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Initialize all components
   */
  private async initialize(): Promise<void> {
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
    this.intentAnalyzer = new IntentAnalyzer(aiClient);
    this.conversationManager = new ConversationManager();

    // Initialize project context if in a project directory
    try {
      this.projectContext = new ProjectContext(process.cwd());
      await this.projectContext.initialize();
      this.terminal.success('Project context loaded');
    } catch (error) {
      logger.debug('No project context available:', error);
    }

    // Initialize task planner if enhanced client is available
    try {
      const enhancedClient = getEnhancedClient();
      this.taskPlanner = new TaskPlanner(enhancedClient, this.projectContext!);
      this.terminal.success('Task planning capabilities enabled');
    } catch (error) {
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
  private async runMainLoop(): Promise<void> {
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

        // Process the input
        await this.processUserInput(userInput);

      } catch (error) {
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
  private async processUserInput(userInput: string): Promise<void> {
    this.terminal.info('Processing your request...');

    // Create routing context
    const routingContext: RoutingContext = {
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
        await this.handleClarificationRequest(userInput, routingResult.data as ClarificationRequest, routingContext);
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
   * Handle clarification requests
   */
  private async handleClarificationRequest(
    originalInput: string,
    clarification: ClarificationRequest,
    context: RoutingContext
  ): Promise<void> {
    this.terminal.warn('I need some clarification to help you better:');

    // Display questions
    clarification.questions.forEach((question, index) => {
      this.terminal.info(`${index + 1}. ${question}`);
    });

    // Handle options if available
    let clarificationResponse: string;

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
    } else {
      const response = await this.terminal.prompt({
        type: 'input',
        name: 'clarification',
        message: 'Please provide clarification:'
      });

      clarificationResponse = response.clarification;
    }

    // Re-route with clarification
    const newRoutingResult = await this.nlRouter.handleClarification(
      originalInput,
      clarificationResponse,
      context
    );

    // Process the clarified request
    await this.processRoutingResult(newRoutingResult);
  }

  /**
   * Handle command execution
   */
  private async handleCommandExecution(routingResult: any): Promise<void> {
    const { commandName, args, intent } = routingResult.data;

    // Show what we're about to do
    this.terminal.info(`I'll execute: ${commandName} ${args.join(' ')}`);

    if (routingResult.requiresConfirmation) {
      const confirmed = await this.confirmAction(
        `Execute command: ${commandName}`,
        routingResult.estimatedTime,
        routingResult.riskLevel
      );

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

    } catch (error) {
      this.terminal.error(`Command failed: ${formatErrorForDisplay(error)}`);
      await this.updateConversationOutcome('failure');
    }
  }

  /**
   * Handle task planning and execution
   */
  private async handleTaskPlanning(routingResult: any): Promise<void> {
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
        const confirmed = await this.confirmAction(
          'Execute this task plan',
          routingResult.estimatedTime,
          routingResult.riskLevel
        );

        if (!confirmed) {
          this.terminal.info('Task plan cancelled.');
          return;
        }
      }

      // Execute the plan
      this.terminal.info('Executing task plan...');
      await this.taskPlanner.executePlan(plan.id);

      this.terminal.success('Task plan completed successfully!');
      await this.updateConversationOutcome('success');

    } catch (error) {
      this.terminal.error(`Task planning failed: ${formatErrorForDisplay(error)}`);
      await this.updateConversationOutcome('failure');
    }
  }

  /**
   * Handle conversation responses
   */
  private async handleConversation(routingResult: any): Promise<void> {
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

    } catch (error) {
      this.terminal.error(`Failed to generate response: ${formatErrorForDisplay(error)}`);
      await this.updateConversationOutcome('failure');
    }
  }

  /**
   * Utility methods
   */
  private async getUserInput(): Promise<string> {
    const prompt = await this.terminal.prompt({
      type: 'input',
      name: 'input',
      message: '💬 How can I help you?',
    });

    return prompt.input;
  }

  private handleSpecialCommands(input: string): boolean {
    const trimmedInput = input.trim().toLowerCase();

    // Handle exit commands
    if (EXIT_COMMANDS.includes(trimmedInput as any)) {
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

  private async confirmAction(action: string, estimatedTime: number, riskLevel: string): Promise<boolean> {
    const riskEmoji = riskLevel === 'high' ? '⚠️' : riskLevel === 'medium' ? '⚡' : '✅';

    const confirmed = await this.terminal.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: `${riskEmoji} ${action}\nEstimated time: ${estimatedTime} minutes\nRisk level: ${riskLevel}\nProceed?`,
      default: riskLevel === 'low'
    });

    return confirmed.confirmed;
  }

  private displayWelcomeMessage(): void {
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

  private displayHelp(): void {
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

  private displayStatus(): void {
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

  private displayHistory(): void {
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

  private displaySummary(): void {
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

  private displayTaskPlan(plan: any): void {
    console.log(`
📋 Task Plan: ${plan.title}

Description: ${plan.description}
Estimated Duration: ${plan.estimatedDuration} minutes
Complexity: ${plan.metadata.complexity}
Confidence: ${(plan.metadata.confidence * 100).toFixed(1)}%

Tasks:
${plan.tasks.map((task: any, index: number) =>
  `${index + 1}. [${task.priority}] ${task.title}\n   ${task.description}`
).join('\n')}
`);
  }

  private displayResponse(response: string, intentType: string): void {
    const icon = intentType === 'question' ? '💡' :
                 intentType === 'task_request' ? '🚀' : '💬';

    console.log(`\n${icon} ${response}\n`);
  }

  private async updateConversationOutcome(outcome: string, response?: string): Promise<void> {
    const recentHistory = this.conversationManager.getRecentHistory(1);
    if (recentHistory.length > 0) {
      await this.conversationManager.updateTurnOutcome(
        recentHistory[0].id,
        outcome as any
      );
    }
  }

  private async processRoutingResult(routingResult: any): Promise<void> {
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

  private async cleanup(): Promise<void> {
    if (this.conversationManager) {
      await this.conversationManager.persistConversation();
    }
  }
}