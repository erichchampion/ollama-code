/**
 * Enhanced AI Client
 *
 * Integrates all phases into a comprehensive AI-powered development assistant
 * with natural language understanding, autonomous code modification, and
 * intelligent task planning and execution.
 */

import { logger } from '../utils/logger.js';
import { OllamaClient } from './client.js';
import { ProjectContext } from './context.js';
import { IntentAnalyzer, UserIntent } from './intent-analyzer.js';
import { ConversationManager } from './conversation-manager.js';
import { TaskPlanner, ExecutionPlan } from '../planning/task-planner.js';
import { ExecutionEngine, ExecutionResult } from '../execution/execution-engine.js';
import { AutonomousModifier } from '../core/autonomous-modifier.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';

export interface EnhancedClientConfig {
  model: string;
  baseUrl: string;
  contextWindow: number;
  enableTaskPlanning: boolean;
  enableAutonomousModification: boolean;
  executionPreferences: {
    parallelism: number;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    autoExecute: boolean;
  };
}

export interface ProcessingResult {
  success: boolean;
  intent: UserIntent;
  response: string;
  executionPlan?: ExecutionPlan;
  executionResults?: Map<string, ExecutionResult>;
  conversationId: string;
  processingTime: number;
  error?: string;
}

export interface SessionState {
  conversationId: string;
  activeExecutionPlan?: ExecutionPlan;
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
  private executionEngine: ExecutionEngine;
  private autonomousModifier: AutonomousModifier;
  private nlRouter: NaturalLanguageRouter;
  private config: EnhancedClientConfig;
  private sessionState: SessionState;

  constructor(
    config: EnhancedClientConfig,
    projectContext: ProjectContext
  ) {
    this.config = config;
    this.projectContext = projectContext;

    // Initialize core components
    this.ollamaClient = new OllamaClient(config.baseUrl, config.model);
    this.intentAnalyzer = new IntentAnalyzer(this.ollamaClient, projectContext);
    this.conversationManager = new ConversationManager();
    this.autonomousModifier = new AutonomousModifier();
    this.taskPlanner = new TaskPlanner(projectContext);
    this.executionEngine = new ExecutionEngine(
      projectContext,
      this.autonomousModifier,
      this.ollamaClient
    );
    this.nlRouter = new NaturalLanguageRouter();

    // Initialize session state
    this.sessionState = {
      conversationId: this.conversationManager.startNewConversation(),
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

      await Promise.all([
        this.ollamaClient.initialize(),
        this.autonomousModifier.initialize(),
        this.projectContext.initialize()
      ]);

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
      this.conversationManager.addUserMessage(this.sessionState.conversationId, message);

      // Analyze intent
      const intent = await this.intentAnalyzer.analyzeIntent(message);

      logger.debug('Intent analyzed', {
        type: intent.type,
        action: intent.action,
        complexity: intent.complexity,
        riskLevel: intent.riskLevel
      });

      // Route to appropriate handler
      const routingResult = await this.nlRouter.route(intent, this.projectContext);

      let response: string;
      let executionPlan: ExecutionPlan | undefined;
      let executionResults: Map<string, ExecutionResult> | undefined;

      if (routingResult.requiresExecution && this.config.enableTaskPlanning) {
        // Create and potentially execute plan
        const planResult = await this.createAndExecutePlan(intent);
        response = planResult.response;
        executionPlan = planResult.executionPlan;
        executionResults = planResult.executionResults;
      } else {
        // Handle as conversation or simple command
        response = await this.generateResponse(intent, routingResult);
      }

      // Add response to conversation
      this.conversationManager.addAssistantMessage(
        this.sessionState.conversationId,
        response
      );

      const processingTime = Date.now() - startTime;

      logger.info('Message processing completed', {
        processingTime,
        intentType: intent.type,
        hasExecutionPlan: !!executionPlan
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

    } catch (error) {
      logger.error('Message processing failed:', error);

      const errorResponse = `I encountered an error while processing your request: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;

      return {
        success: false,
        intent: {
          type: 'unknown',
          action: message,
          entities: { files: [], technologies: [], concepts: [] },
          confidence: 0,
          complexity: 'low',
          multiStep: false,
          riskLevel: 'low'
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
    executionPlan?: ExecutionPlan;
    executionResults?: Map<string, ExecutionResult>;
  }> {
    try {
      // Create execution plan
      const executionPlan = await this.taskPlanner.createExecutionPlan(intent);

      // Store as active plan
      this.sessionState.activeExecutionPlan = executionPlan;

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
   * Generate a response based on intent and routing result
   */
  private async generateResponse(intent: UserIntent, routingResult: any): Promise<string> {
    const context = this.conversationManager.generateContextualPrompt(
      this.sessionState.conversationId,
      intent
    );

    // Use the conversation context to generate an appropriate response
    const response = await this.ollamaClient.generateResponse(
      `Based on the user's intent (${intent.type}: ${intent.action}), please provide a helpful response.

      Context: ${context}

      User's message: ${intent.action}`,
      {
        contextWindow: this.config.contextWindow
      }
    );

    return response;
  }

  /**
   * Determine if plan should be auto-executed
   */
  private shouldAutoExecute(plan: ExecutionPlan, intent: UserIntent): boolean {
    if (!this.config.executionPreferences.autoExecute) {
      return false;
    }

    // Auto-execute only low-risk plans in aggressive mode
    if (this.sessionState.preferences.riskTolerance === 'aggressive' &&
        plan.riskAssessment.overallRisk === 'low') {
      return true;
    }

    // Auto-execute simple analysis tasks
    if (intent.type === 'question' && intent.complexity === 'low') {
      return true;
    }

    return false;
  }

  /**
   * Generate plan proposal for user approval
   */
  private generatePlanProposal(plan: ExecutionPlan): string {
    const taskSummary = plan.tasks.map(t => `- ${t.title}`).join('\n');
    const estimatedDuration = Math.round(
      plan.timeline.estimatedEnd.getTime() - plan.timeline.estimatedStart.getTime()
    ) / 60000; // Convert to minutes

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
  private generateExecutionResponse(
    plan: ExecutionPlan,
    results: Map<string, ExecutionResult>
  ): string {
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
    } else if (successfulTasks > 0) {
      response += '⚠️ Partial completion - some tasks need attention.';
    } else {
      response += '❌ Execution failed - please review the errors above.';
    }

    return response;
  }

  /**
   * Record execution in session history
   */
  private recordExecution(
    plan: ExecutionPlan,
    results: Map<string, ExecutionResult>
  ): void {
    const successfulTasks = Array.from(results.values()).filter(r => r.success).length;
    const totalDuration = Array.from(results.values()).reduce(
      (sum, r) => sum + r.duration, 0
    );

    const summary: ExecutionSummary = {
      planId: plan.id,
      title: plan.title,
      completedAt: new Date(),
      totalTasks: results.size,
      successfulTasks,
      duration: totalDuration
    };

    this.sessionState.executionHistory.push(summary);

    // Clear active plan
    this.sessionState.activeExecutionPlan = undefined;
  }

  /**
   * Execute pending plan (when user approves)
   */
  async executePendingPlan(): Promise<ProcessingResult> {
    if (!this.sessionState.activeExecutionPlan) {
      throw new Error('No pending execution plan');
    }

    const startTime = Date.now();
    const plan = this.sessionState.activeExecutionPlan;

    try {
      const executionResults = await this.executionEngine.executePlan(plan);
      this.recordExecution(plan, executionResults);

      const response = this.generateExecutionResponse(plan, executionResults);

      return {
        success: true,
        intent: {
          type: 'command',
          action: 'execute plan',
          entities: { files: [], technologies: [], concepts: [] },
          confidence: 1.0,
          complexity: 'medium',
          multiStep: true,
          riskLevel: plan.riskAssessment.overallRisk
        },
        response,
        executionPlan: plan,
        executionResults,
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

    // Update execution engine preferences based on user preferences
    this.executionEngine.updatePreferences({
      riskTolerance: preferences.riskTolerance || this.sessionState.preferences.riskTolerance
    });
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): any[] {
    return this.conversationManager.getConversationHistory(this.sessionState.conversationId);
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
    this.sessionState.conversationId = this.conversationManager.startNewConversation();
    this.sessionState.activeExecutionPlan = undefined;
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
   * Check if client is ready
   */
  async isReady(): Promise<boolean> {
    try {
      await this.ollamaClient.generateResponse('test', { maxTokens: 1 });
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
      activeExecutions: this.executionEngine.getActiveExecutions().size,
      conversationId: this.sessionState.conversationId,
      executionHistory: this.sessionState.executionHistory.length
    };
  }
}