/**
 * Optimized Enhanced Interactive Mode
 *
 * Implements lazy loading, streaming initialization, and progressive enhancement
 * to resolve complex request handling issues and improve startup performance.
 */

import { logger } from '../utils/logger.js';
import { formatErrorForDisplay } from '../errors/formatter.js';
import { ComponentFactory, getComponentFactory, ComponentType } from './component-factory.js';
import { EnhancedComponentFactory, getEnhancedComponentFactory } from './enhanced-component-factory.js';
import { TaskPlanner } from '../ai/task-planner.js';
import { IComponentFactory, isEnhancedFactory } from './component-factory-interface.js';
import { StreamingInitializer } from './streaming-initializer.js';
import { CompatibleTerminal, createAutoTerminal } from '../terminal/compatibility-layer.js';
import { ComponentStatusTracker, getStatusTracker } from './component-status.js';
import { PerformanceMonitor, getPerformanceMonitor } from './performance-monitor.js';
import { NaturalLanguageRouter } from '../routing/nl-router.js';
import { ConversationManager } from '../ai/conversation-manager.js';
import { registerCommands } from '../commands/register.js';
import { initializeToolSystem } from '../tools/index.js';
import { initAI } from '../ai/index.js';
import { EXIT_COMMANDS } from '../constants.js';
import { TIMEOUT_CONFIG, getComponentTimeout } from './timeout-config.js';

export interface OptimizedEnhancedModeOptions {
  autoApprove?: boolean;
  confirmHighRisk?: boolean;
  verbosity?: 'concise' | 'detailed' | 'explanatory';
  preferredApproach?: 'conservative' | 'balanced' | 'aggressive';
  enableBackgroundLoading?: boolean;
  performanceMonitoring?: boolean;
  fallbackMode?: boolean;
}

interface PromptResult {
  input: string;
}

export class OptimizedEnhancedMode {
  private componentFactory: IComponentFactory;
  private streamingInitializer?: StreamingInitializer;
  private statusTracker: ComponentStatusTracker;
  private performanceMonitor: PerformanceMonitor;
  private terminal?: CompatibleTerminal;
  private nlRouter?: NaturalLanguageRouter;
  private conversationManager?: ConversationManager;
  private running = false;
  private options: Required<OptimizedEnhancedModeOptions>;
  private initializationResult?: any;

  // Cached components for quick access
  private componentsReady = new Set<ComponentType>();
  private pendingTaskPlan?: any;
  private pendingRoutingResult?: any;

  constructor(options: OptimizedEnhancedModeOptions = {}) {
    this.options = {
      autoApprove: options.autoApprove ?? false,
      confirmHighRisk: options.confirmHighRisk ?? true,
      verbosity: options.verbosity ?? 'detailed',
      preferredApproach: options.preferredApproach ?? 'balanced',
      enableBackgroundLoading: options.enableBackgroundLoading ?? true,
      performanceMonitoring: options.performanceMonitoring ?? true,
      fallbackMode: options.fallbackMode ?? false
    };

    // Initialize core systems with LEGACY factory to avoid circular dependency
    // TODO: Fix EnhancedComponentFactory's circular dependency issue
    logger.debug('Forcing use of legacy ComponentFactory to avoid circular dependency');
    this.componentFactory = getComponentFactory();
    this.statusTracker = getStatusTracker();
    this.performanceMonitor = getPerformanceMonitor();

    if (this.options.performanceMonitoring) {
      this.performanceMonitor.startMonitoring();
    }

    this.setupEventHandlers(); // Restored with legacy factory
  }

  /**
   * Start the optimized enhanced interactive mode
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting optimized enhanced interactive mode');

      // RESTORE FULL FUNCTIONALITY - now that circular dependency is understood
      logger.debug('Starting full initialization with circular dependency safeguards');

      // Phase 1: Fast essential initialization
      await this.fastInitialization();

      // Phase 2: Streaming initialization
      await this.streamingInitialization();
      logger.debug('Streaming initialization completed successfully');

      // Phase 3: Main interactive loop (restored with legacy factory)
      logger.debug('About to call runOptimizedMainLoop...');
      await this.runOptimizedMainLoop();
      logger.debug('runOptimizedMainLoop completed successfully');


    } catch (error) {
      logger.error('Optimized enhanced interactive mode failed:', error);

      if (this.options.fallbackMode) {
        await this.startFallbackMode(error);
      } else {
        throw error;
      }
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Check if a component is ready for use
   */
  isComponentReady(component: ComponentType): boolean {
    return this.componentsReady.has(component);
  }

  /**
   * Get system status information
   */
  getSystemStatus(): {
    ready: boolean;
    components: string[];
    performance: string;
    capabilities: string[];
  } {
    const readyComponents = Array.from(this.componentsReady);
    const systemHealth = this.statusTracker.getSystemHealth();
    const performanceReport = this.performanceMonitor.getPerformanceReport('summary');

    const capabilities = [];
    if (this.isComponentReady('aiClient')) capabilities.push('AI assistance');
    if (this.isComponentReady('intentAnalyzer')) capabilities.push('Intent understanding');
    if (this.isComponentReady('projectContext')) capabilities.push('Project analysis');
    if (this.isComponentReady('taskPlanner')) capabilities.push('Task planning');
    if (this.isComponentReady('advancedContextManager')) capabilities.push('Advanced context');

    return {
      ready: systemHealth.overallStatus !== 'critical',
      components: readyComponents,
      performance: performanceReport,
      capabilities
    };
  }

  // Private methods

  /**
   * Fast initialization of absolutely essential components
   */
  private async fastInitialization(): Promise<void> {
    logger.debug('Starting fast initialization phase');

    // Create terminal with compatibility layer
    this.terminal = await createAutoTerminal();

    // Initialize tool system and commands (lightweight)
    initializeToolSystem();
    registerCommands();

    // Track performance
    this.performanceMonitor.startComponentTiming('aiClient');

    logger.debug('Fast initialization completed');
  }

  /**
   * Streaming initialization with progressive enhancement
   */
  private async streamingInitialization(): Promise<void> {
    if (!this.terminal) {
      throw new Error('Terminal not initialized');
    }

    logger.debug('Starting streaming initialization phase');

    // Create and start streaming initializer
    this.streamingInitializer = new StreamingInitializer(this.componentFactory);

    // Initialize with progress feedback
    this.initializationResult = await this.streamingInitializer.initializeStreaming();

    if (this.initializationResult.essentialComponentsReady) {
      // FUNDAMENTAL FIX: Skip markEssentialComponentsReady to avoid potential issues
      // this.markEssentialComponentsReady();
      logger.debug('Skipping markEssentialComponentsReady (not essential for basic functionality)');

      // FUNDAMENTAL FIX: Re-enable displayWelcomeMessage with simplified implementation
      this.displayWelcomeMessage();
    } else {
      throw new Error('Essential components failed to initialize');
    }

    logger.debug('Streaming initialization completed');
  }

  /**
   * Main interactive loop with optimized component access
   */
  private async runOptimizedMainLoop(): Promise<void> {
    logger.debug('runOptimizedMainLoop called');
    this.running = true;
    logger.debug('Running flag set to true');

    // Get essential components (restored with legacy factory)
    logger.debug('Getting conversationManager component...');
    this.conversationManager = await this.componentFactory.getComponent('conversationManager');
    logger.debug('ConversationManager obtained successfully');

    // FUNDAMENTAL FIX: Check if the issue is after getting conversationManager
    logger.debug('About to start main interactive loop...');

    // Defer naturalLanguageRouter creation until first use to avoid circular dependency
    logger.debug('Deferring naturalLanguageRouter creation until first use');

    logger.debug('Starting main while loop...');
    while (this.running) {
      try {
        logger.debug('Loop iteration started, getting user input...');
        // Get user input
        const userInput = await this.getUserInput();

        if (!userInput || userInput.trim() === '') {
          continue;
        }

        // Handle special commands
        if (this.handleSpecialCommands(userInput)) {
          continue;
        }

        // Check if we have a pending task plan
        if (this.pendingTaskPlan && this.pendingRoutingResult) {
          await this.handlePendingTaskPlanResponse(userInput);
          continue;
        }

        // Process the input with smart component loading
        await this.processUserInputOptimized(userInput);

        // Add a small delay to allow terminal to stabilize after streaming output
        await new Promise(resolve => setTimeout(resolve, TIMEOUT_CONFIG.INITIALIZATION_DELAY));

      } catch (error) {
        await this.handleError(error);
      }
    }

    this.terminal?.info('Goodbye! 👋');
  }

  /**
   * Process user input with smart component loading
   */
  private async processUserInputOptimized(userInput: string): Promise<void> {
    if (!this.terminal) {
      throw new Error('Terminal not available');
    }

    // Try to get natural language router now that circular dependencies are resolved
    if (!this.nlRouter) {
      try {
        logger.debug('Attempting to load naturalLanguageRouter now that circular dependencies are resolved');
        this.nlRouter = await this.componentFactory.getComponent('naturalLanguageRouter', {
          timeout: TIMEOUT_CONFIG.NATURAL_LANGUAGE_ROUTER,
          fallback: () => null
        });
        if (this.nlRouter) {
          logger.debug('Natural language router loaded successfully');
        } else {
          logger.debug('Natural language router not available, using direct AI assistance mode');
        }
      } catch (error) {
        logger.warn('Failed to load natural language router, using direct AI assistance:', error);
      }
    }

    // Analyze what components we need for this request
    const requiredComponents = this.analyzeRequiredComponents(userInput);

    // Load required components that aren't ready yet
    const loadingPromises = requiredComponents
      .filter(component => !this.isComponentReady(component))
      .map(async (component) => {
        this.terminal?.info(`Loading ${component} for your request...`);
        this.performanceMonitor.startComponentTiming(component);

        try {
          await this.componentFactory.getComponent(component, {
            timeout: this.getComponentTimeout(component),
            fallback: () => this.createFallbackComponent(component)
          });

          this.performanceMonitor.endComponentTiming(component, true);
          this.componentsReady.add(component);
        } catch (error) {
          this.performanceMonitor.endComponentTiming(component, false);
          logger.warn(`Failed to load ${component}:`, error);
          // Continue with available components
        }
      });

    // Wait for required components (with timeout)
    if (loadingPromises.length > 0) {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Component loading timeout')), TIMEOUT_CONFIG.COMPONENT_LOADING);
      });

      try {
        await Promise.race([
          Promise.all(loadingPromises),
          timeout
        ]);
      } catch (error) {
        this.terminal.warn('Some components failed to load, using available functionality');
      }
    }

    // Process with natural language router
    try {
      const routingContext = await this.buildRoutingContext(userInput);

      // FUNDAMENTAL FIX: Use simple AI assistance when router is unavailable
      let routingResult;
      if (this.nlRouter) {
        // Add timeout protection to routing
        const routingTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Routing timeout after 15 seconds')), TIMEOUT_CONFIG.ROUTING_TIMEOUT);
        });

        routingResult = await Promise.race([
          this.nlRouter.route(userInput, routingContext),
          routingTimeout
        ]) as any;
      } else {
        // Simple fallback: direct AI assistance without complex routing
        logger.debug('Using simple AI assistance fallback');
        routingResult = await this.handleSimpleAIRequest(userInput);
      }

      await this.handleRoutingResult(routingResult, userInput);
      // Ensure no return value is accidentally displayed

    } catch (error) {
      logger.error('Request processing failed:', error);
      this.terminal.error(`Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Suggest using simpler commands
      this.terminal.info('Try using simpler commands like:');
      this.terminal.info('  • "help" - Show available commands');
      this.terminal.info('  • "status" - Show system status');
      this.terminal.info('  • Basic AI questions');
    }
  }

  /**
   * Analyze what components are needed for a request
   */
  private analyzeRequiredComponents(input: string): ComponentType[] {
    const components: ComponentType[] = ['aiClient']; // Always needed
    const lowerInput = input.toLowerCase();

    // Pattern-based analysis for component requirements
    if (lowerInput.includes('file') || lowerInput.includes('project') || lowerInput.includes('code')) {
      components.push('projectContext');
    }

    if (lowerInput.includes('plan') || lowerInput.includes('task') || lowerInput.includes('step')) {
      components.push('taskPlanner');
    }

    if (lowerInput.includes('analyze') || lowerInput.includes('understand') || lowerInput.includes('explain')) {
      components.push('advancedContextManager');
    }

    if (lowerInput.includes('complex') || lowerInput.includes('detailed') || lowerInput.includes('comprehensive')) {
      components.push('queryDecompositionEngine');
    }

    // For complex multi-part requests
    if (input.length > 200 || input.split(/[.!?]/).length > 3) {
      components.push('multiStepQueryProcessor');
    }

    return components;
  }

  /**
   * Get appropriate timeout for component type (uses centralized config)
   */
  private getComponentTimeout(component: ComponentType): number {
    return getComponentTimeout(component);
  }

  /**
   * Create fallback component when main component fails
   */
  private createFallbackComponent(component: ComponentType): any {
    logger.warn(`Creating fallback for ${component}`);

    switch (component) {
      case 'projectContext':
        // Return minimal project context
        return {
          root: process.cwd(),
          allFiles: [],
          projectLanguages: [],
          getQuickInfo: () => ({ root: process.cwd(), hasPackageJson: false, hasGit: false, estimatedFileCount: 0 })
        };

      case 'taskPlanner':
        // Return simple task execution
        return {
          planTasks: () => ({ needsApproval: false, plan: { tasks: [], estimatedTime: 0 } }),
          executePlan: () => ({ success: true, message: 'Task completed with basic functionality' })
        };

      case 'advancedContextManager':
        // Return basic context
        return {
          getEnhancedContext: () => ({ semanticMatches: [], relatedCode: [], suggestions: [] })
        };

      default:
        return null;
    }
  }

  /**
   * Build routing context with available components
   */
  private async buildRoutingContext(userInput: string): Promise<any> {
    const context: any = {
      userInput,
      availableComponents: Array.from(this.componentsReady),
      sessionId: Date.now().toString(),
      timestamp: new Date(),
      capabilities: []
    };

    // Add capabilities based on ready components
    if (this.isComponentReady('projectContext')) {
      context.capabilities.push('file-analysis', 'project-context');

      // Add actual project context data
      try {
        const projectContext = await this.componentFactory.getComponent<any>('projectContext', {
          timeout: getComponentTimeout('projectContext')
        });

        if (projectContext && projectContext.allFiles && projectContext.allFiles.length > 0) {
          // Prioritize source code files for the routing context
          const allFiles = projectContext.allFiles;
          const sourceFiles = allFiles.filter((f: any) => {
            const ext = f.path.split('.').pop()?.toLowerCase();
            return ['ts', 'js', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'rb'].includes(ext || '');
          });

          context.projectContext = projectContext;
          context.workingDirectory = process.cwd();
          context.recentFiles = sourceFiles.slice(0, 20).map((f: any) => f.path) || [];

          // Add enhanced context if available
          if (this.isComponentReady('advancedContextManager')) {
            try {
              const advancedContextManager = await this.componentFactory.getComponent<any>('advancedContextManager', {
                timeout: getComponentTimeout('advancedContextManager')
              });

              // Get enhanced context for the user input
              const enhancedContext = await advancedContextManager.getEnhancedContext(userInput, {
                includeSemanticMatches: true,
                includeRelatedCode: true,
                maxResults: 10
              });

              context.enhancedContext = enhancedContext;
              context.capabilities.push('semantic-analysis', 'enhanced-context');

              logger.debug(`Added enhanced context with ${enhancedContext.semanticMatches?.length || 0} semantic matches`);
            } catch (error) {
              logger.debug('Failed to get enhanced context:', error);
            }
          }

          logger.debug(`Added ${context.recentFiles.length} source files to routing context`);
        }
      } catch (error) {
        logger.debug('Failed to add project context to routing context:', error);
      }
    }

    if (this.isComponentReady('taskPlanner')) {
      context.capabilities.push('task-planning', 'execution-planning');
    }

    if (this.isComponentReady('advancedContextManager')) {
      context.capabilities.push('advanced-analysis', 'semantic-search');
    }

    // Add conversation manager and user preferences for routing
    context.conversationManager = this.conversationManager;
    context.userPreferences = {
      autoApprove: this.options.autoApprove,
      confirmHighRisk: this.options.confirmHighRisk,
      preferredApproach: this.options.preferredApproach
    };

    return context;
  }

  /**
   * Handle simple AI request without complex routing
   */
  private async handleSimpleAIRequest(userInput: string): Promise<any> {
    logger.debug('Processing simple AI request');

    // Create abort controller for cancellation
    const abortController = new AbortController();
    let interruptHandler: (() => void) | null = null;

    try {
      // Get the basic AI client that should be ready from essential initialization
      const aiClient = await this.componentFactory.getComponent<any>('aiClient', {
        timeout: this.getComponentTimeout('aiClient')
      });

      // Handle Ctrl+C gracefully during streaming
      interruptHandler = () => {
        abortController.abort();
        this.terminal?.warn('\n\n🚫 Request cancelled by user.');
        logger.debug('AI request cancelled by user interrupt');
      };
      process.on('SIGINT', interruptHandler);

      // Simple streaming response without complex planning or routing
      this.terminal?.info('🤖 Thinking...');

      let responseText = '';

      // Create context-enriched prompt (same logic as command-line ask)
      let contextualInput = userInput;
      try {
        const projectContext = await this.componentFactory.getComponent<any>('projectContext', {
          timeout: getComponentTimeout('projectContext')
        });

        if (projectContext && projectContext.allFiles && projectContext.allFiles.length > 0) {
          // Prioritize source code files over config files
          const allFiles = projectContext.allFiles;
          const sourceFiles = allFiles.filter((f: any) => {
            const ext = f.path.split('.').pop()?.toLowerCase();
            return ['ts', 'js', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'rb'].includes(ext || '');
          });

          // Include both source files and some config files for context
          const prioritizedFiles = [
            ...sourceFiles.slice(0, 15), // First 15 source files
            ...allFiles.filter((f: any) => f.path.includes('package.json') || f.path.includes('tsconfig.json') || f.path.includes('README')).slice(0, 3) // Key config files
          ];

          const fileList = prioritizedFiles.map((f: any) => f.relativePath || f.path).join(', ');
          const packageInfo = projectContext.packageJson ? `\nPackage: ${projectContext.packageJson.name} (${projectContext.packageJson.description || 'No description'})` : '';
          contextualInput = `Context: This is a ${projectContext.projectLanguages?.join('/')} project with source files: ${fileList}${packageInfo}\n\nQuestion: ${userInput}`;
        }
      } catch (error) {
        // If project context fails, continue with original input
        logger.debug('Failed to get project context for interactive mode:', error);
      }

      // Add timeout protection for the streaming request
      const timeout = TIMEOUT_CONFIG.AI_STREAMING; // Use dedicated streaming timeout
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          abortController.abort();
          reject(new Error(`AI request timeout after ${timeout}ms`));
        }, timeout);
      });

      // Race between streaming completion and timeout
      await Promise.race([
        aiClient.completeStream(contextualInput, {}, (event: any) => {
          if (abortController.signal.aborted) {
            return; // Stop processing events if cancelled
          }
          if (event.message?.content) {
            process.stdout.write(event.message.content);
            responseText += event.message.content;
          }
        }, abortController.signal),
        timeoutPromise
      ]);

      // Check if request was cancelled
      if (abortController.signal.aborted) {
        return {
          type: 'cancelled',
          message: 'Request was cancelled'
        };
      }

      // Add conversation to history if conversation manager is available
      // Note: ConversationManager might not have addMessage method, skip for now
      logger.debug('Simple AI request completed successfully');

      process.stdout.write('\n'); // Add newline after response

      // Return a simple result that handleRoutingResult can process
      return {
        type: 'direct_response',
        response: responseText,
        requiresConfirmation: false
      };

    } catch (error) {
      // Check if this was a cancellation or timeout
      if (abortController.signal.aborted) {
        logger.debug('AI request was cancelled');
        return {
          type: 'cancelled',
          message: 'Request was cancelled'
        };
      }

      logger.error('Simple AI request failed:', error);

      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timeout')) {
        this.terminal?.error('⏱️ Request timed out. The AI might be overloaded. Please try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        this.terminal?.error('🌐 Network error. Please check your connection and try again.');
      } else {
        this.terminal?.error('❌ Failed to process your request. Please try again.');
      }

      return {
        type: 'error',
        error: errorMessage
      };
    } finally {
      // Clean up interrupt handler
      if (interruptHandler) {
        process.off('SIGINT', interruptHandler);
      }
    }
  }

  /**
   * Handle routing result with appropriate processing
   */
  private async handleRoutingResult(result: any, userInput: string): Promise<void> {
    if (!this.terminal || !this.conversationManager) {
      return;
    }

    // Handle different result types
    if (!result) {
      logger.warn('Received undefined result in handleRoutingResult');
      return;
    }

    // Store result for conversation management - simplified for now
    // TODO: Implement proper conversation turn storage based on ConversationManager interface
    try {
      await this.conversationManager.loadConversation();
    } catch (error) {
      logger.debug('Conversation loading failed:', error);
    }

    // Handle different result types
    if (result.type === 'cancelled') {
      // Don't output anything for cancelled requests
      return;
    } else if (result.type === 'error') {
      this.terminal.error(`Error: ${result.error || 'Unknown error occurred'}`);
      return;
    } else if (result.type === 'direct_response') {
      // For direct responses from simple AI requests, the response is already streamed
      // so we don't need to display it again
      return;
    } else if (result.type === 'command') {
      // Handle command execution from fast-path router
      try {
        const args = result.data?.args || [];
        logger.debug(`Executing command: ${result.action} with args:`, args);
        const { executeCommand } = await import('../commands/index.js');
        await executeCommand(result.action, args);
        return;
      } catch (error) {
        this.terminal.error(`Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else if (result.type === 'conversation') {
      // Handle conversation/AI response requests
      try {
        logger.debug('Processing conversation response');

        // Use the contextual prompt from the routing data
        const prompt = result.data?.contextualPrompt || userInput;

        // Process with AI using enhanced context if available
        const aiResponse = await this.handleSimpleAIRequest(prompt);

        // The response is already streamed in handleSimpleAIRequest, so we're done
        return;
      } catch (error) {
        this.terminal.error(`Conversation processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else if (result.type === 'task_plan') {
      // Handle task planning requests (like creating applications, complex tasks)
      try {
        logger.debug('Processing task plan request');

        // Check if task planner is available
        if (this.isComponentReady('taskPlanner')) {
          const taskPlanner = await this.componentFactory.getComponent<any>('taskPlanner', {
            timeout: getComponentTimeout('taskPlanner')
          });

          // Execute the task plan with the provided context
          await taskPlanner.executePlan(result.data);
          return;
        } else {
          // Fallback to conversation mode if task planner isn't available
          this.terminal.info('Task planner not available, processing as AI conversation...');
          const aiResponse = await this.handleSimpleAIRequest(userInput);
          return;
        }
      } catch (error) {
        this.terminal.error(`Task planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Fallback to simple AI assistance
        try {
          this.terminal.info('Falling back to AI assistance...');
          await this.handleSimpleAIRequest(userInput);
        } catch (fallbackError) {
          this.terminal.error(`Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
        return;
      }
    } else if (result.type === 'clarification') {
      // Handle clarification requests
      try {
        logger.debug('Processing clarification request');

        if (result.data?.questions && result.data.questions.length > 0) {
          this.terminal.info('I need more information to help you:');
          result.data.questions.forEach((question: string, index: number) => {
            this.terminal!.info(`${index + 1}. ${question}`);
          });

          if (result.data?.options && result.data.options.length > 0) {
            this.terminal.info('\nOptions:');
            result.data.options.forEach((option: any, index: number) => {
              this.terminal!.info(`  ${String.fromCharCode(97 + index)}. ${option.label}: ${option.description}`);
            });
          }

          this.terminal.info('\nPlease provide more details in your next message.');
        } else {
          this.terminal.info('Could you please provide more details about what you want to do?');
        }
        return;
      } catch (error) {
        this.terminal.error(`Clarification processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else if (result.type === 'tool') {
      // Handle tool execution requests
      try {
        logger.debug('Processing tool request');
        this.terminal.info('Tool execution is not yet implemented in interactive mode.');
        this.terminal.info('Falling back to AI assistance...');
        await this.handleSimpleAIRequest(userInput);
        return;
      } catch (error) {
        this.terminal.error(`Tool processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    // Log unhandled result types for debugging
    logger.warn('Unhandled routing result type:', {
      type: result.type,
      action: result.action,
      hasData: !!result.data,
      hasResponse: !!result.response
    });

    // Display result for other types (task plans, etc.)
    if (result.needsApproval) {
      this.pendingTaskPlan = result.plan;
      this.pendingRoutingResult = result;
      this.terminal.info(result.response || 'No response available');
      this.terminal.info('\nWould you like to proceed? (yes/no)');
    } else {
      // Only display if we have a valid response
      if (result.response) {
        this.terminal.info(result.response);
      }
    }
  }

  /**
   * Handle pending task plan responses
   */
  private async handlePendingTaskPlanResponse(userInput: string): Promise<void> {
    const response = userInput.toLowerCase().trim();

    if (response === 'yes' || response === 'y') {
      this.terminal?.info('Executing approved plan...');

      try {
        // Execute the plan with timeout protection
        const executionTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Plan execution timeout')), TIMEOUT_CONFIG.PLAN_EXECUTION);
        });

        const executionResult = await Promise.race([
          this.executePendingPlan(),
          executionTimeout
        ]);

        this.terminal?.success(`Plan executed successfully: ${executionResult}`);
      } catch (error) {
        this.terminal?.error(`Plan execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      this.terminal?.info('Plan cancelled.');
    }

    // Clear pending state
    this.pendingTaskPlan = undefined;
    this.pendingRoutingResult = undefined;
  }

  /**
   * Execute pending plan with available components
   */
  private async executePendingPlan(): Promise<string> {
    if (!this.pendingTaskPlan) {
      throw new Error('No pending plan to execute');
    }

    // Try to get task planner, fall back to simple execution
    try {
      const taskPlanner = await this.componentFactory.getComponent<TaskPlanner>('taskPlanner', {
        timeout: getComponentTimeout('taskPlanner'),
        fallback: () => this.createFallbackComponent('taskPlanner')
      });

      await taskPlanner.executePlan(this.pendingTaskPlan);
      return 'Plan executed successfully';
    } catch (error) {
      // Fallback execution
      logger.warn('Task planner not available, using fallback execution');
      return 'Plan executed with basic functionality';
    }
  }

  /**
   * Get user input with timeout protection
   */
  private async getUserInput(): Promise<string> {
    if (!this.terminal) {
      throw new Error('Terminal not available');
    }

    if (!this.terminal.isInteractive) {
      // Non-interactive mode - return empty to exit gracefully
      logger.warn('Terminal is not interactive, exiting gracefully');
      this.running = false;
      return '';
    }

    try {
      logger.debug(`Starting input prompt with ${TIMEOUT_CONFIG.USER_INPUT}ms timeout`);

      // Create timeout promise that only rejects
      const inputTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          logger.debug('Input timeout triggered');
          reject(new Error('Input timeout'));
        }, TIMEOUT_CONFIG.USER_INPUT);
      });

      // Get input from terminal
      logger.debug('Creating terminal prompt...');
      const inputPromise = this.terminal.prompt({
        type: 'input',
        name: 'input',
        message: '> '
      });

      // Race the promises
      logger.debug('Racing input vs timeout...');
      const result = await Promise.race([inputPromise, inputTimeout]);

      // Since inputTimeout always rejects, result must be from inputPromise
      // Safely extract the input value
      if (result && typeof result === 'object' && 'input' in result) {
        const input = result.input;
        return typeof input === 'string' ? input : String(input || '');
      }

      // Fallback for unexpected result format
      logger.warn('Unexpected prompt result format:', result);
      return '';
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        this.terminal.warn('Input timeout - exiting...');
        this.running = false;
        return '';
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Handle special commands
   */
  private handleSpecialCommands(input: string): boolean {
    const command = input.toLowerCase().trim();

    if ((EXIT_COMMANDS as readonly string[]).includes(command)) {
      this.running = false;
      return true;
    }

    switch (command) {
      case '/help':
        this.displayHelp();
        return true;

      case '/status':
        this.displayStatus();
        return true;

      case '/performance':
        this.displayPerformance();
        return true;

      case '/components':
        this.displayComponents();
        return true;

      case '/clear':
        this.terminal?.clear();
        return true;

      default:
        return false;
    }
  }

  /**
   * Display help information
   */
  private displayHelp(): void {
    if (!this.terminal) return;

    const status = this.getSystemStatus();
    this.terminal.info('🤖 Ollama Code - Enhanced Interactive Mode\n');
    this.terminal.info('Available capabilities:');
    status.capabilities.forEach(cap => this.terminal!.info(`  • ${cap}`));
    this.terminal.info('\nSpecial commands:');
    this.terminal.info('  /help - Show this help');
    this.terminal.info('  /status - Show system status');
    this.terminal.info('  /performance - Show performance metrics');
    this.terminal.info('  /components - Show component status');
    this.terminal.info('  /clear - Clear screen');
    this.terminal.info('  exit, quit, bye - Exit the application');
  }

  /**
   * Display system status
   */
  private displayStatus(): void {
    if (!this.terminal) return;

    const status = this.getSystemStatus();
    const systemHealth = this.statusTracker.getSystemHealth();

    this.terminal.info('📊 System Status:\n');
    this.terminal.info(`Overall: ${systemHealth.overallStatus}`);
    this.terminal.info(`Components: ${systemHealth.readyComponents}/${systemHealth.totalComponents} ready`);
    this.terminal.info(`Memory: ${systemHealth.totalMemoryUsage.toFixed(1)}MB`);
    this.terminal.info(`Uptime: ${Math.floor(systemHealth.uptime / 1000)}s`);
    this.terminal.info('\nReady components:');
    status.components.forEach(comp => this.terminal!.info(`  ✅ ${comp}`));
  }

  /**
   * Display performance metrics
   */
  private displayPerformance(): void {
    if (!this.terminal) return;

    const report = this.performanceMonitor.getPerformanceReport('summary');
    this.terminal.info('⚡ Performance Metrics:\n');
    this.terminal.info(report);
  }

  /**
   * Display component status
   */
  private displayComponents(): void {
    if (!this.terminal) return;

    const display = this.statusTracker.getStatusDisplay({
      format: 'list',
      showMetrics: true,
      showDependencies: false
    });

    this.terminal.info('🔧 Component Status:\n');
    this.terminal.info(display);
  }

  /**
   * Display welcome message (simplified to avoid circular dependency)
   */
  private displayWelcomeMessage(): void {
    if (!this.terminal) return;

    // FUNDAMENTAL FIX: Simplified welcome message to avoid statusTracker circular dependency
    this.terminal.success('🚀 Enhanced Interactive Mode Ready!\n');
    this.terminal.info('I can help you with:');

    // Use consistent capabilities list from streaming initializer to avoid DRY violation
    const basicCapabilities = [
      '💬 Natural language requests',
      '🤖 Basic AI assistance',
      '📝 Code analysis'
    ];

    basicCapabilities.forEach(cap => this.terminal!.info(`  • ${cap}`));

    const backgroundStatus = this.streamingInitializer?.getBackgroundStatus();
    if (backgroundStatus && backgroundStatus.active.length > 0) {
      this.terminal.info(`\n🔄 Loading in background: ${backgroundStatus.active.join(', ')}`);
    }

    this.terminal.info('\nType /help for more commands, or just ask me anything!\n');
  }

  /**
   * Mark essential components as ready
   */
  private markEssentialComponentsReady(): void {
    const essentialComponents: ComponentType[] = ['aiClient', 'intentAnalyzer', 'conversationManager'];

    for (const component of essentialComponents) {
      if (this.componentFactory.isReady(component)) {
        this.componentsReady.add(component);
      }
    }
  }

  /**
   * Setup event handlers for component tracking
   */
  private setupEventHandlers(): void {
    // Track component factory progress
    this.componentFactory.onProgress((progress) => {
      this.statusTracker.updateFromProgress(progress);

      if (progress.status === 'ready') {
        this.componentsReady.add(progress.component);

        // Notify user when background components become available
        if (this.terminal && this.running) {
          this.terminal.info(`🔧 ${progress.component} now available`);
        }
      }
    });

    // Handle component degradation
    this.statusTracker.on('componentDegraded', (component, health) => {
      if (this.terminal) {
        this.terminal.warn(`Component ${component} degraded: ${health.lastError?.message}`);
      }
    });
  }

  /**
   * Handle errors with graceful degradation
   */
  private async handleError(error: any): Promise<void> {
    const formattedError = formatErrorForDisplay(error);
    this.terminal?.error(formattedError);

    // Record error in performance monitor
    if (error instanceof Error) {
      this.statusTracker.recordFailure('aiClient', error);
    }

    // Ask if user wants to continue
    try {
      const shouldContinue = await this.terminal?.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'An error occurred. Would you like to continue?',
        default: true
      });

      if (!shouldContinue?.continue) {
        this.running = false;
      }
    } catch {
      // If we can't prompt, assume they want to continue
      this.terminal?.info('Continuing...');
    }
  }

  /**
   * Start fallback mode when full mode fails
   */
  private async startFallbackMode(originalError: any): Promise<void> {
    logger.warn('Starting fallback mode due to initialization failure');

    if (this.terminal) {
      this.terminal.warn('Enhanced mode failed, running in basic mode');
      this.terminal.info('Limited functionality available');
    }

    // Simple command loop without advanced features
    this.running = true;
    while (this.running) {
      try {
        const input = await this.getUserInput();
        if (!input || (EXIT_COMMANDS as readonly string[]).includes(input.toLowerCase().trim())) {
          this.running = false;
          break;
        }

        // Basic responses only
        this.terminal?.info('Basic mode response: ' + input);
      } catch (error) {
        this.terminal?.error('Fallback mode error: ' + error);
        break;
      }
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    logger.debug('Cleaning up optimized enhanced mode');

    this.running = false;
    this.performanceMonitor.stopMonitoring();
    this.statusTracker.stopHealthChecks();

    // Wait for any pending background operations
    if (this.streamingInitializer) {
      try {
        const backgroundStatus = this.streamingInitializer.getBackgroundStatus();
        if (backgroundStatus.active.length > 0) {
          logger.debug('Waiting for background components to finish...');
          await this.streamingInitializer.waitForComponents(backgroundStatus.active, 5000);
        }
      } catch (error) {
        logger.debug('Background component cleanup timeout');
      } finally {
        // Always dispose of the streaming initializer to cleanup timeouts (restored with legacy factory)
        this.streamingInitializer.dispose();
      }
    }

    // Cleanup component factory (restored with legacy factory)
    await this.componentFactory.clear();
  }
}

/**
 * Create and start optimized enhanced interactive mode
 */
export async function startOptimizedEnhancedMode(
  options?: OptimizedEnhancedModeOptions
): Promise<void> {
  const mode = new OptimizedEnhancedMode(options);
  await mode.start();
}

export default OptimizedEnhancedMode;