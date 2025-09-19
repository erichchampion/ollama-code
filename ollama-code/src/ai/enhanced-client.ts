/**
 * Enhanced AI Client
 *
 * Integrates all phases into a comprehensive AI-powered development assistant
 * with natural language understanding, autonomous code modification, and
 * intelligent task planning and execution.
 */

import { logger } from '../utils/logger.js';
import { OllamaClient } from './ollama-client.js';
import { ProjectContext } from './context.js';
import { IntentAnalyzer, UserIntent } from './intent-analyzer.js';
import { ConversationManager } from './conversation-manager.js';
import { TaskPlanner } from './task-planner.js';
import { TaskPlan } from './task-planner.js';
import { AutonomousModifier } from '../core/autonomous-modifier.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';

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

export class EnhancedClient {
  private ollamaClient: OllamaClient;
  private projectContext: ProjectContext;
  private intentAnalyzer: IntentAnalyzer;
  private conversationManager: ConversationManager;
  private taskPlanner: TaskPlanner;
  private autonomousModifier: AutonomousModifier;
  private nlRouter: NaturalLanguageRouter;
  private config: EnhancedClientConfig;
  private sessionState: SessionState;
  private sessionMetrics: Map<string, number> = new Map();
  private responseCache: Map<string, string> = new Map();

  constructor(
    ollamaClient: any,
    projectContext?: ProjectContext,
    config?: Partial<EnhancedClientConfig>
  ) {
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
    this.intentAnalyzer = new IntentAnalyzer(this.ollamaClient);
    this.conversationManager = new ConversationManager();
    this.autonomousModifier = new AutonomousModifier();
    this.taskPlanner = new TaskPlanner(this, this.projectContext);
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
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Enhanced AI Client');

      // Initialize project context if available
      if (this.projectContext) {
        await this.projectContext.initialize();
      }

      // Test Ollama connection
      await this.ollamaClient.testConnection();

      logger.info('Enhanced AI Client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Enhanced AI Client:', error);
      throw error;
    }
  }

  /**
   * Process a user message with full enhanced capabilities
   */
  async processMessage(message: string): Promise<ProcessingResult> {
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
          autoApprove: this.config.executionPreferences?.autoExecute || false,
          confirmHighRisk: this.config.executionPreferences?.riskTolerance !== 'aggressive',
          preferredApproach: this.config.executionPreferences?.riskTolerance || 'balanced'
        }
      };
      const routingResult = await this.nlRouter.route(message, routingContext);

      let response: string;
      let executionPlan: TaskPlan | undefined;

      if (routingResult.type === 'command') {
        // Execute the identified command directly
        response = await this.executeCommand(routingResult);
      } else if (routingResult.type === 'task_plan' && this.config.enableTaskPlanning) {
        // Create and potentially execute plan
        const planResult = await this.createAndExecutePlan(intent);
        response = planResult.response;
        executionPlan = planResult.executionPlan;
      } else {
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
      this.sessionMetrics.set('avgProcessingTime',
        (currentProcessingTime * messageCount + processingTime) / (messageCount + 1)
      );

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

    } catch (error) {
      logger.error('Message processing failed:', error);

      const errorResponse = `I encountered an error while processing your request: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;

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
  private async createAndExecutePlan(intent: UserIntent): Promise<{
    response: string;
    executionPlan?: TaskPlan;
    }> {
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
      } else {
        // Return plan for user approval
        const response = this.generatePlanProposal(executionPlan);

        return {
          response,
          executionPlan
        };
      }

    } catch (error) {
      logger.error('Plan creation/execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a command directly
   */
  private async executeCommand(routingResult: any): Promise<string> {
    try {
      const { commandName, args } = routingResult.data;

      // Import the executeCommand function
      const { executeCommand } = await import('../commands/index.js');

      // Execute the command and capture output
      let output = '';
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        output += args.join(' ') + '\n';
      };

      try {
        await executeCommand(commandName, args);
        return output || `✅ Command '${commandName}' executed successfully.`;
      } finally {
        console.log = originalConsoleLog;
      }

    } catch (error) {
      logger.error('Command execution failed:', error);
      return `❌ Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Generate a response based on intent and routing result
   */
  private async generateResponse(intent: UserIntent, routingResult: any): Promise<string> {
    const context = this.conversationManager.generateContextualPrompt(
      this.sessionState.conversationId,
      intent
    );

    // Use the conversation context to generate an appropriate response
    const response = await this.ollamaClient.complete(
      `Based on the user's intent (${intent.type}: ${intent.action}), please provide a helpful response.

      Context: ${context}

      User's message: ${intent.action}`,
      {
        temperature: 0.7
      }
    );

    return response.message.content;
  }

  /**
   * Determine if plan should be auto-executed
   */
  private shouldAutoExecute(plan: TaskPlan, intent: UserIntent): boolean {
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
  private generatePlanProposal(plan: TaskPlan): string {
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
  async executePendingPlan(): Promise<ProcessingResult> {
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

    } catch (error) {
      logger.error('Plan execution failed:', error);
      throw error;
    }
  }

  /**
   * Get current session state
   */
  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    Object.assign(this.sessionState.preferences, preferences);

    // TODO: Update execution preferences when execution engine is re-implemented
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): any[] {
    return this.conversationManager.getRecentHistory();
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionSummary[] {
    return [...this.sessionState.executionHistory];
  }

  /**
   * Start new conversation
   */
  startNewConversation(): string {
    this.sessionState.conversationId = this.conversationManager.getConversationContext().sessionId;
    this.sessionState.activeTaskPlan = undefined;
    return this.sessionState.conversationId;
  }

  /**
   * Get project context
   */
  getProjectContext(): ProjectContext {
    return this.projectContext;
  }

  /**
   * Get default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
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
  async complete(prompt: string, options: any = {}): Promise<any> {
    return await this.ollamaClient.complete(prompt, options);
  }

  /**
   * Check if client is ready
   */
  async isReady(): Promise<boolean> {
    try {
      await this.ollamaClient.complete('test');
      return true;
    } catch {
      return false;
    }
  }


  /**
   * Get system status
   */
  getSystemStatus(): {
    ready: boolean;
    activeExecutions: number;
    conversationId: string;
    executionHistory: number;
  } {
    return {
      ready: true, // Simplified for now
      activeExecutions: 0, // TODO: Re-implement when execution engine is added back
      conversationId: this.sessionState.conversationId,
      executionHistory: this.sessionState.executionHistory.length
    };
  }
}