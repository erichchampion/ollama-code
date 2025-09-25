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
import { MultiStepQueryProcessor } from '../ai/multi-step-query-processor.js';
import { AdvancedContextManager } from '../ai/advanced-context-manager.js';
import { QueryDecompositionEngine } from '../ai/query-decomposition-engine.js';
import { CodeKnowledgeGraph } from '../ai/code-knowledge-graph.js';
import { executeCommand } from '../commands/index.js';
import { getAIClient, getEnhancedClient, initAI } from '../ai/index.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';
import { initializeToolSystem, toolRegistry } from '../tools/index.js';
import { registerCommands } from '../commands/register.js';
import { EXIT_COMMANDS } from '../constants.js';
import { createSpinner } from '../utils/spinner.js';
export class EnhancedInteractiveMode {
    intentAnalyzer;
    conversationManager;
    nlRouter;
    taskPlanner;
    queryProcessor;
    advancedContextManager;
    queryDecompositionEngine;
    codeKnowledgeGraph;
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
        // Register services for dependency injection
        const { registerServices } = await import('../core/services.js');
        await registerServices();
        logger.debug('Core services registered');
        // Initialize tool system and commands
        initializeToolSystem();
        registerCommands();
        // Ensure Ollama server is running
        const serverSpinner = createSpinner('Ensuring Ollama server is running...');
        serverSpinner.start();
        await ensureOllamaServerRunning();
        serverSpinner.succeed('Ollama server is ready');
        // Initialize AI capabilities
        const aiSpinner = createSpinner('Initializing AI capabilities...');
        aiSpinner.start();
        await initAI();
        aiSpinner.succeed('AI capabilities initialized');
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
        // Initialize multi-step query processor
        try {
            this.queryProcessor = new MultiStepQueryProcessor(aiClient, this.projectContext);
            this.terminal.success('Multi-step query processing enabled');
        }
        catch (error) {
            logger.debug('Query processor not available:', error);
        }
        // Initialize advanced context manager
        try {
            if (this.projectContext) {
                this.advancedContextManager = new AdvancedContextManager(aiClient, this.projectContext);
                await this.advancedContextManager.initialize();
                this.terminal.success('Advanced context management enabled');
            }
        }
        catch (error) {
            logger.debug('Advanced context manager not available:', error);
        }
        // Initialize query decomposition engine
        try {
            if (this.projectContext) {
                this.queryDecompositionEngine = new QueryDecompositionEngine(aiClient, this.projectContext);
                await this.queryDecompositionEngine.initialize();
                this.terminal.success('Query decomposition engine enabled');
            }
        }
        catch (error) {
            logger.debug('Query decomposition engine not available:', error);
        }
        // Initialize code knowledge graph
        try {
            if (this.projectContext) {
                this.codeKnowledgeGraph = new CodeKnowledgeGraph(aiClient, this.projectContext);
                await this.codeKnowledgeGraph.initialize();
                this.terminal.success('Code knowledge graph enabled');
            }
        }
        catch (error) {
            logger.debug('Code knowledge graph not available:', error);
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
                // Check if this is a save request that should use cached analysis
                if (await this.handleSaveRequest(userInput)) {
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
        const processSpinner = createSpinner('Processing your request...');
        processSpinner.start();
        // Get enhanced context if available
        let enhancedContext;
        if (this.advancedContextManager) {
            try {
                processSpinner.setText('Gathering enhanced context...');
                enhancedContext = await this.advancedContextManager.getEnhancedContext(userInput);
                logger.debug('Enhanced context retrieved:', {
                    semanticMatches: enhancedContext.semanticMatches.length,
                    relatedCode: enhancedContext.relatedCode.length,
                    domainContext: enhancedContext.domainContext.length,
                    confidence: enhancedContext.confidence
                });
            }
            catch (error) {
                logger.debug('Failed to get enhanced context:', error);
            }
        }
        // Create routing context
        const routingContext = {
            projectContext: this.projectContext,
            conversationManager: this.conversationManager,
            workingDirectory: process.cwd(),
            userPreferences: {
                autoApprove: this.options.autoApprove,
                confirmHighRisk: this.options.confirmHighRisk,
                preferredApproach: this.options.preferredApproach
            },
            enhancedContext // Add enhanced context to routing context
        };
        try {
            // Route the request
            processSpinner.setText('Analyzing request...');
            const routingResult = await this.nlRouter.route(userInput, routingContext);
            processSpinner.succeed('Request processed');
            // Add enhanced context to routing result for handlers
            if (enhancedContext) {
                routingResult.enhancedContext = enhancedContext;
            }
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
                case 'tool':
                    await this.handleToolExecution(routingResult);
                    break;
                case 'conversation':
                    await this.handleConversation(routingResult);
                    break;
                default:
                    this.terminal.warn('Unknown routing result type');
            }
        }
        catch (error) {
            processSpinner.fail('Failed to process request');
            this.terminal.error(`Error processing request: ${formatErrorForDisplay(error)}`);
        }
    }
    /**
     * Handle save requests that should use cached analysis instead of creating new analysis
     */
    async handleSaveRequest(userInput) {
        const input = userInput.toLowerCase().trim();
        // Detect save patterns
        const savePatterns = [
            /(?:create|save|write|export).*(?:\.md|markdown|file)/,
            /save.*(?:this|that|analysis|result)/,
            /(?:create|make).*(?:\.md|markdown).*(?:file|document)/,
            /export.*(?:analysis|result|output)/
        ];
        const isSaveRequest = savePatterns.some(pattern => pattern.test(input));
        if (!isSaveRequest) {
            return false;
        }
        // Look for recent analysis in conversation history
        const recentHistory = this.conversationManager.getRecentHistory(5);
        const analysisHistory = recentHistory.filter(turn => turn.intent.type === 'question' || // Questions often generate analysis responses
            turn.intent.type === 'task_request' || // Task requests like code review generate detailed results
            turn.intent.action.toLowerCase().includes('analyz') ||
            turn.intent.action.toLowerCase().includes('explain') ||
            turn.intent.action.toLowerCase().includes('review') ||
            turn.response.length > 500 // Likely analysis if response is substantial
        );
        if (analysisHistory.length === 0) {
            this.terminal.warn('No recent analysis found to save. Please run an analysis first.');
            return true;
        }
        // Use the most recent analysis
        const latestAnalysis = analysisHistory[0];
        const saveSpinner = createSpinner('Saving analysis to markdown file...');
        saveSpinner.start();
        try {
            // Generate filename based on timestamp and intent
            const timestamp = new Date().toISOString().split('T')[0];
            const sanitizedInput = latestAnalysis.userInput
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .toLowerCase()
                .substring(0, 50);
            const filename = `analysis-${timestamp}-${sanitizedInput}.md`;
            // Create markdown content
            const markdownContent = this.createAnalysisMarkdown(latestAnalysis);
            // Write the file
            await import('fs/promises').then(fs => fs.writeFile(filename, markdownContent, 'utf8'));
            saveSpinner.succeed(`Analysis saved to ${filename}`);
            this.terminal.success(`✅ Analysis saved to ${filename}`);
            // Update conversation with success
            await this.conversationManager.addTurn(userInput, { type: 'file_operation', action: 'save', confidence: 1.0, entities: { concepts: ['save', 'analysis'], files: [filename] } }, `Analysis saved to ${filename}`, [{ type: 'file_create', target: filename, details: 'Saved cached analysis', timestamp: new Date(), success: true }]);
            return true;
        }
        catch (error) {
            saveSpinner.fail('Failed to save analysis');
            this.terminal.error(`Failed to save analysis: ${error instanceof Error ? error.message : String(error)}`);
            return true;
        }
    }
    /**
     * Create markdown content from analysis
     */
    createAnalysisMarkdown(analysisResult) {
        const timestamp = new Date().toISOString();
        // Handle different types of analysis results
        let analysisContent = analysisResult.response || 'No analysis results available.';
        // If the response looks like it contains task plan results, preserve formatting
        if (analysisContent.includes('Task Plan Results:') || analysisContent.includes('✅ Completed')) {
            // It's already formatted task plan results, preserve the formatting
            analysisContent = analysisContent;
        }
        else if (analysisContent.length < 100) {
            // Short response, might be incomplete - add warning
            analysisContent = `${analysisContent}\n\n⚠️ *Note: This appears to be an incomplete analysis result. The detailed results may not have been captured properly.*`;
        }
        return `# Code Analysis Report

**Generated:** ${timestamp}
**Query:** ${analysisResult.userInput}
**Type:** ${analysisResult.intent.type}
**Intent Action:** ${analysisResult.intent.action || 'Not specified'}

---

## Analysis Results

${analysisContent}

---

## Context

- **Working Directory:** ${analysisResult.contextSnapshot.workingDirectory}
- **Active Files:** ${analysisResult.contextSnapshot.activeFiles.join(', ') || 'None'}
- **Last Modified:** ${analysisResult.contextSnapshot.lastModified.join(', ') || 'None'}

## Actions Taken

${analysisResult.actions.map((action) => `- **${action.type}**: ${action.target} - ${action.details} ${action.success ? '✅' : '❌'}`).join('\n') || 'No actions taken'}

## Analysis Metadata

- **Confidence:** ${analysisResult.intent.confidence || 'Not specified'}
- **Complexity:** ${analysisResult.intent.complexity || 'Not specified'}
- **Risk Level:** ${analysisResult.intent.riskLevel || 'Not specified'}

---

*Generated by Ollama Code Enhanced Interactive Mode*
`;
    }
    /**
     * Handle user response to pending task plan
     */
    async handlePendingTaskPlanResponse(userInput) {
        const response = userInput.toLowerCase().trim();
        if (response === 'yes' || response === 'execute' || response === 'run') {
            // Execute the pending plan
            const executeSpinner = createSpinner('Executing task plan...');
            try {
                executeSpinner.start();
                await this.taskPlanner.executePlan(this.pendingTaskPlan.id);
                executeSpinner.succeed('Task plan completed');
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
                // Capture detailed results for conversation history
                const detailedResults = this.formatPlanResultsForStorage(completedPlan);
                await this.updateConversationOutcome('success', detailedResults);
            }
            catch (error) {
                executeSpinner.fail('Task execution failed');
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
        const planSpinner = createSpinner('Creating a task plan for your request...');
        planSpinner.start();
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
                planSpinner.succeed('Task plan created');
                this.terminal.info('\nWould you like me to execute this plan? You can:');
                this.terminal.info('- Say "yes" or "execute" to run the plan');
                this.terminal.info('- Say "modify" to adjust the plan');
                this.terminal.info('- Say "no" or "cancel" to abort');
                this.terminal.info('\nYou can also ask for more details about any specific task or phase.');
                return;
            }
            // Execute the plan immediately if no confirmation needed
            planSpinner.setText('Executing task plan...');
            await this.taskPlanner.executePlan(plan.id);
            // Get completed plan and capture detailed results
            const completedPlan = this.taskPlanner.getPlan(plan.id);
            const detailedResults = this.formatPlanResultsForStorage(completedPlan);
            planSpinner.succeed('Task plan completed successfully!');
            await this.updateConversationOutcome('success', detailedResults);
        }
        catch (error) {
            planSpinner.fail('Task planning failed');
            this.terminal.error(`Task planning failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Handle tool execution
     */
    async handleToolExecution(routingResult) {
        const { toolName, operation, parameters, intent } = routingResult.data;
        // Show what we're about to do
        this.terminal.info(`I'll execute: ${toolName} ${operation}`);
        if (routingResult.requiresConfirmation) {
            const confirmed = await this.confirmAction(`Execute tool: ${toolName} - ${operation}`, routingResult.estimatedTime, routingResult.riskLevel);
            if (!confirmed) {
                this.terminal.warn('Tool execution cancelled');
                return;
            }
        }
        const toolSpinner = createSpinner(`Executing ${toolName} tool...`);
        toolSpinner.start();
        try {
            // Get the tool from the registry
            const tool = toolRegistry.get(toolName);
            if (!tool) {
                toolSpinner.fail(`Tool '${toolName}' not found`);
                this.terminal.error(`Available tools: ${toolRegistry.list().map(t => t.name).join(', ')}`);
                return;
            }
            // Create execution context
            const context = {
                projectRoot: process.cwd(),
                workingDirectory: process.cwd(),
                environment: process.env,
                timeout: 30000
            };
            // Prepare parameters for tool execution
            const toolParameters = {
                operation,
                ...parameters
            };
            // Execute the tool
            const result = await tool.execute(toolParameters, context);
            if (result.success) {
                toolSpinner.succeed(`${toolName} execution completed`);
                // Display results based on tool type and operation
                this.displayToolResults(toolName, operation, result.data);
                // Update conversation context
                await this.conversationManager.addTurn(intent.description || `Execute ${toolName} - ${operation}`, intent, `Tool execution successful: ${JSON.stringify(result.data)}`, []);
            }
            else {
                toolSpinner.fail(`${toolName} execution failed`);
                this.terminal.error(result.error || 'Unknown tool execution error');
                // Update conversation context with error
                await this.conversationManager.addTurn(intent.description || `Execute ${toolName} - ${operation}`, intent, `Tool execution failed: ${result.error}`, []);
            }
        }
        catch (error) {
            toolSpinner.fail('Tool execution error');
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.terminal.error(`Tool execution failed: ${errorMessage}`);
            // Update conversation context with error
            await this.conversationManager.addTurn(intent.description || `Execute ${toolName} - ${operation}`, intent, `Tool execution error: ${errorMessage}`, []);
        }
    }
    /**
     * Display tool execution results
     */
    displayToolResults(toolName, operation, data) {
        this.terminal.success(`\n🔧 ${toolName} - ${operation} Results:`);
        if (toolName === 'advanced-git') {
            this.displayGitToolResults(operation, data);
        }
        else if (toolName === 'advanced-code-analysis') {
            this.displayCodeAnalysisResults(operation, data);
        }
        else if (toolName === 'advanced-testing') {
            this.displayTestingResults(operation, data);
        }
        else {
            // Generic result display
            this.terminal.info(JSON.stringify(data, null, 2));
        }
    }
    /**
     * Display Git tool results
     */
    displayGitToolResults(operation, data) {
        switch (operation) {
            case 'analyze':
                if (data.repository) {
                    const repo = data.repository;
                    this.terminal.info(`\n📊 Repository Analysis:`);
                    this.terminal.text(`  • Current Branch: ${repo.basic?.currentBranch}`);
                    this.terminal.text(`  • Total Files: ${repo.structure?.totalFiles}`);
                    this.terminal.text(`  • Total Commits: ${repo.statistics?.totalCommits}`);
                    this.terminal.text(`  • Contributors: ${repo.statistics?.totalContributors}`);
                    this.terminal.text(`  • Health Score: ${repo.health?.score}/100`);
                    if (repo.health?.issues?.length > 0) {
                        this.terminal.warn(`\n⚠️  Issues Found:`);
                        repo.health.issues.forEach((issue) => this.terminal.text(`  • ${issue}`));
                    }
                }
                break;
            case 'history':
                if (data.commits) {
                    this.terminal.info(`\n📈 Recent Commits (${data.statistics?.totalCommits} total):`);
                    data.commits.slice(0, 5).forEach((commit) => {
                        this.terminal.text(`  ${commit.hash} - ${commit.message} (${commit.author})`);
                    });
                }
                break;
            case 'contributors':
                if (data.contributors) {
                    this.terminal.info(`\n👥 Top Contributors:`);
                    data.contributors.forEach((contributor) => {
                        this.terminal.text(`  • ${contributor.name}: ${contributor.commits} commits`);
                    });
                }
                break;
            default:
                this.terminal.info(JSON.stringify(data, null, 2));
        }
    }
    /**
     * Display Code Analysis results
     */
    displayCodeAnalysisResults(operation, data) {
        switch (operation) {
            case 'analyze':
                if (data.analysis) {
                    const analysis = data.analysis;
                    this.terminal.info(`\n🔍 Code Analysis Results:`);
                    this.terminal.text(`  • Target: ${analysis.target}`);
                    this.terminal.text(`  • Scope: ${analysis.scope}`);
                    if (analysis.metrics) {
                        this.terminal.text(`  • Complexity: ${analysis.metrics.complexity || 'N/A'}`);
                        this.terminal.text(`  • Maintainability: ${analysis.metrics.maintainability?.score || 'N/A'}/100`);
                    }
                    if (analysis.recommendations?.length > 0) {
                        this.terminal.info(`\n💡 Recommendations:`);
                        analysis.recommendations.slice(0, 3).forEach((rec) => {
                            this.terminal.text(`  • ${rec}`);
                        });
                    }
                }
                break;
            case 'quality':
                if (data.overall) {
                    this.terminal.info(`\n⭐ Quality Assessment: ${data.overall} (Score: ${data.score}/100)`);
                    if (data.areas) {
                        Object.entries(data.areas).forEach(([area, info]) => {
                            this.terminal.text(`  • ${area}: ${info.score || 'N/A'}`);
                        });
                    }
                }
                break;
            case 'security':
                this.terminal.info(`\n🔒 Security Analysis: Risk Level ${data.riskLevel}`);
                this.terminal.text(`  • Checks: ${data.checksPassed}/${data.totalChecks} passed`);
                if (data.vulnerabilities?.length > 0) {
                    this.terminal.warn(`  • Vulnerabilities found: ${data.vulnerabilities.length}`);
                }
                break;
            default:
                this.terminal.info(JSON.stringify(data, null, 2));
        }
    }
    /**
     * Display Testing tool results
     */
    displayTestingResults(operation, data) {
        switch (operation) {
            case 'generate':
                this.terminal.info(`\n🧪 Test Generation Results:`);
                this.terminal.text(`  • Test Cases: ${data.testCases}`);
                this.terminal.text(`  • Framework: ${data.framework}`);
                this.terminal.text(`  • Language: ${data.language}`);
                this.terminal.text(`  • Expected Coverage: ${data.coverage?.expectedCoverage || 'N/A'}%`);
                if (data.recommendations?.length > 0) {
                    this.terminal.info(`\n💡 Testing Recommendations:`);
                    data.recommendations.slice(0, 3).forEach((rec) => {
                        this.terminal.text(`  • ${rec}`);
                    });
                }
                break;
            case 'strategy':
                this.terminal.info(`\n📋 Testing Strategy:`);
                this.terminal.text(`  • Recommended Framework: ${data.strategy?.recommended_framework}`);
                this.terminal.text(`  • Current Tests: ${data.current_state?.existing_tests}`);
                this.terminal.text(`  • Estimated Coverage: ${data.current_state?.coverage}%`);
                break;
            case 'analyze':
                this.terminal.info(`\n📊 Testability Analysis: Score ${data.score}/100`);
                if (data.improvements?.length > 0) {
                    this.terminal.info(`\n🔧 Suggested Improvements:`);
                    data.improvements.slice(0, 3).forEach((improvement) => {
                        this.terminal.text(`  • ${improvement}`);
                    });
                }
                break;
            default:
                this.terminal.info(JSON.stringify(data, null, 2));
        }
    }
    /**
     * Handle conversation responses
     */
    async handleConversation(routingResult) {
        const { intent, contextualPrompt } = routingResult.data;
        const spinner = createSpinner('Thinking...');
        try {
            spinner.start();
            // Check if query decomposition is available and needed for complex multi-action queries
            if (this.queryDecompositionEngine && this.shouldUseQueryDecomposition(intent)) {
                spinner.setText('Decomposing complex query...');
                await this.handleQueryDecomposition(intent, contextualPrompt);
                spinner.succeed();
                return;
            }
            // Check if multi-step query processing is available and needed
            if (this.queryProcessor && this.shouldUseMultiStepProcessing(intent)) {
                spinner.setText('Processing multi-step query...');
                await this.handleMultiStepQuery(intent, contextualPrompt);
                spinner.succeed();
                return;
            }
            // Check if knowledge graph query processing is available and needed
            if (this.codeKnowledgeGraph && this.shouldUseKnowledgeGraph(intent)) {
                spinner.setText('Searching knowledge graph...');
                await this.handleKnowledgeGraphQuery(intent, contextualPrompt);
                spinner.succeed();
                return;
            }
            // Get AI response using contextual prompt
            const aiClient = getAIClient();
            const response = await aiClient.complete(contextualPrompt, {
                temperature: 0.7
            });
            const responseText = response.message?.content || 'I apologize, but I couldn\'t generate a response.';
            spinner.succeed();
            // Display the response with appropriate formatting
            this.displayResponse(responseText, intent.type);
            // Display enhanced context suggestions if available
            if (routingResult.enhancedContext && routingResult.enhancedContext.suggestions.length > 0) {
                this.displayEnhancedContextSuggestions(routingResult.enhancedContext);
            }
            // Update conversation
            await this.updateConversationOutcome('success', responseText);
        }
        catch (error) {
            spinner.fail();
            this.terminal.error(`Failed to generate response: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Multi-step query processing methods
     */
    shouldUseMultiStepProcessing(intent) {
        // Use multi-step processing for complex queries, follow-ups, or analysis requests
        const complexQueries = ['analyze', 'review', 'explain', 'understand', 'explore', 'investigate'];
        const queryText = intent.originalQuery?.toLowerCase() || '';
        // Check if this is a follow-up query
        if (this.queryProcessor?.getQuerySession() && this.queryProcessor.isFollowUpQuery(queryText)) {
            return true;
        }
        // Check if this is a complex analysis query
        return complexQueries.some(keyword => queryText.includes(keyword));
    }
    async handleMultiStepQuery(intent, contextualPrompt) {
        const queryText = intent.originalQuery || intent.query || '';
        try {
            // Check if we have an active session, or start a new one
            let session = this.queryProcessor.getQuerySession();
            if (!session) {
                session = await this.queryProcessor.startQuerySession(queryText, {
                    userPreferences: {
                        verbosity: this.options.verbosity === 'detailed' ? 'detailed' : this.options.verbosity === 'concise' ? 'minimal' : 'standard',
                        autoSuggest: true,
                        maxSuggestions: 3
                    },
                    projectContext: this.projectContext,
                    workingDirectory: process.cwd()
                });
                this.terminal.success('Started multi-step query session');
            }
            // Process the query within the session
            const result = await this.queryProcessor.processQuery(queryText);
            // Display the response
            this.displayResponse(result.content, intent.type);
            // Show suggestions if available
            if (result.suggestions && result.suggestions.length > 0) {
                this.terminal.info('\n💡 Suggestions:');
                result.suggestions.forEach((suggestion, index) => {
                    this.terminal.text(`   ${index + 1}. ${suggestion}`);
                });
            }
            // If this query needs follow-up, hint to the user
            if (result.needsFollowUp) {
                this.terminal.text('\n💬 Feel free to ask follow-up questions to dive deeper!');
            }
            // Update conversation
            await this.updateConversationOutcome('success', result.content);
        }
        catch (error) {
            this.terminal.error(`Multi-step query processing failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Query decomposition methods
     */
    shouldUseQueryDecomposition(intent) {
        // Use query decomposition for complex multi-action queries
        const queryText = intent.originalQuery?.toLowerCase() || '';
        // Look for multiple action words indicating complex decomposable queries
        const actionWords = ['create', 'build', 'implement', 'test', 'deploy', 'refactor', 'optimize', 'fix', 'update'];
        const foundActions = actionWords.filter(action => queryText.includes(action));
        // Use decomposition if multiple actions are detected or complex keywords are present
        if (foundActions.length >= 2) {
            return true;
        }
        // Check for complex workflow indicators
        const complexWorkflowIndicators = [
            'and then', 'followed by', 'after that', 'next', 'also', 'additionally',
            'comprehensive', 'end-to-end', 'full workflow', 'complete system',
            'architecture', 'microservices', 'pipeline', 'integration'
        ];
        return complexWorkflowIndicators.some(indicator => queryText.includes(indicator));
    }
    /**
     * Determine if knowledge graph processing should be used
     */
    shouldUseKnowledgeGraph(intent) {
        // Use knowledge graph for code exploration, relationship queries, and architectural analysis
        const queryText = intent.originalQuery?.toLowerCase() || '';
        // Keywords that indicate knowledge graph queries
        const knowledgeGraphKeywords = [
            'relationship', 'related', 'depends', 'dependency', 'dependencies',
            'connects', 'connected', 'links', 'pattern', 'patterns',
            'architecture', 'structure', 'flow', 'design',
            'similar', 'like', 'compare', 'comparison',
            'where', 'how', 'what', 'which', 'who',
            'find', 'search', 'discover', 'explore',
            'uses', 'using', 'used by', 'calls', 'calling',
            'extends', 'implements', 'inherits', 'inheritance',
            'graph', 'network', 'map', 'diagram',
            'indexed', 'elements', 'nodes', 'edges', 'knowledge graph',
            'code elements', 'codebase analysis'
        ];
        // Check for knowledge graph keywords
        if (knowledgeGraphKeywords.some(keyword => queryText.includes(keyword))) {
            return true;
        }
        // Check for specific code relationship queries
        const relationshipPatterns = [
            /what.*(?:uses|calls|depends)/,
            /(?:find|show|list).*(?:related|similar)/,
            /how.*(?:connected|linked|related)/,
            /where.*(?:used|called|implemented)/,
            /(?:class|function|file).*(?:relationship|connection)/,
            /(?:pattern|architecture).*(?:analysis|overview)/,
            /(?:show|list|display).*(?:code elements|elements|indexed)/,
            /what.*(?:indexed|elements|graph)/,
            /knowledge.*graph/,
            /graph.*(?:contains|has|statistics|overview|elements)/
        ];
        return relationshipPatterns.some(pattern => pattern.test(queryText));
    }
    async handleQueryDecomposition(intent, contextualPrompt) {
        const queryText = intent.originalQuery || intent.query || '';
        try {
            // Decompose the query
            const decomposition = await this.queryDecompositionEngine.decomposeQuery(queryText, {
                projectContext: this.projectContext,
                userPreferences: this.options
            });
            // Display decomposition summary
            this.displayQueryDecomposition(decomposition);
            // Check if approval is required for high-risk tasks
            if (decomposition.riskAssessment.approvalRequired && !this.options.autoApprove) {
                const approval = await this.confirmDecompositionExecution(decomposition);
                if (!approval) {
                    this.terminal.info('Query decomposition cancelled by user.');
                    return;
                }
            }
            // Execute the decomposition plan
            await this.executeDecompositionPlan(decomposition);
            // Update conversation
            await this.updateConversationOutcome('success', `Successfully executed decomposed query with ${decomposition.subTasks.length} sub-tasks`);
        }
        catch (error) {
            this.terminal.error(`Query decomposition failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    displayQueryDecomposition(decomposition) {
        this.terminal.info(`\n🧩 Query Decomposition Results:`);
        this.terminal.text(`   Original Query: ${decomposition.originalQuery}`);
        this.terminal.text(`   Complexity: ${decomposition.complexity}`);
        this.terminal.text(`   Sub-tasks: ${decomposition.subTasks.length}`);
        this.terminal.text(`   Estimated Duration: ${Math.round(decomposition.estimatedDuration / 60)} minutes`);
        this.terminal.text(`   Risk Level: ${decomposition.riskAssessment.level}`);
        if (decomposition.subTasks.length > 0) {
            this.terminal.info('\n📋 Planned Tasks:');
            decomposition.subTasks.forEach((task, index) => {
                const duration = Math.round(task.estimatedTime / 60);
                this.terminal.text(`   ${index + 1}. ${task.description} (${duration}m, ${task.complexity})`);
            });
        }
        if (decomposition.executionPlan.phases.length > 1) {
            this.terminal.info('\n⚡ Execution Phases:');
            decomposition.executionPlan.phases.forEach((phase, index) => {
                const phaseTime = Math.round(phase.estimatedTime / 60);
                const parallelInfo = phase.parallelExecutable ? ' (parallel)' : ' (sequential)';
                this.terminal.text(`   Phase ${phase.id}: ${phase.tasks.length} tasks${parallelInfo} - ${phaseTime}m`);
            });
        }
        if (decomposition.conflicts.length > 0) {
            this.terminal.warn('\n⚠️  Potential Conflicts:');
            decomposition.conflicts.forEach((conflict) => {
                this.terminal.text(`   • ${conflict.description} (${conflict.severity})`);
            });
        }
        console.log(); // Add spacing
    }
    async confirmDecompositionExecution(decomposition) {
        this.terminal.warn(`\n⚠️  This decomposition requires approval:`);
        this.terminal.text(`   Risk Level: ${decomposition.riskAssessment.level}`);
        if (decomposition.riskAssessment.factors.length > 0) {
            this.terminal.text(`   Risk Factors:`);
            decomposition.riskAssessment.factors.forEach((factor) => {
                this.terminal.text(`     • ${factor}`);
            });
        }
        const confirmation = await this.terminal.prompt({
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed with executing this decomposition plan?',
            default: false
        });
        return confirmation.proceed;
    }
    async executeDecompositionPlan(decomposition) {
        this.terminal.info('\n🚀 Executing decomposition plan...');
        // For now, simulate execution by displaying what would be done
        // In a full implementation, this would actually execute the tasks
        for (const phase of decomposition.executionPlan.phases) {
            this.terminal.text(`\n   📍 Phase ${phase.id}:`);
            for (const task of phase.tasks) {
                this.terminal.text(`      ▶ ${task.description}`);
                // Simulate task execution with a brief delay
                await new Promise(resolve => setTimeout(resolve, 500));
                this.terminal.success(`      ✓ ${task.description} completed`);
            }
        }
        this.terminal.success('\n🎉 All decomposed tasks completed successfully!');
        // Display final suggestions
        if (decomposition.executionPlan.criticalPath.length > 0) {
            this.terminal.info('\n💡 Next steps suggestions:');
            this.terminal.text('   • Review the executed changes');
            this.terminal.text('   • Run tests to verify functionality');
            this.terminal.text('   • Consider additional optimizations');
        }
    }
    /**
     * Handle knowledge graph queries
     */
    async handleKnowledgeGraphQuery(intent, contextualPrompt) {
        const queryText = intent.originalQuery || intent.query || '';
        try {
            // Check if this is a query asking for all indexed elements
            const isIndexedElementsQuery = /(?:show|list|display|what).*(?:indexed|elements|code elements)/.test(queryText.toLowerCase());
            let graphResult;
            if (isIndexedElementsQuery) {
                // For indexed elements queries, get a broader view with higher limit and statistics
                this.terminal.info('🔍 Analyzing indexed code elements in the knowledge graph...');
                // First show statistics
                const stats = this.codeKnowledgeGraph.getStatistics();
                this.displayKnowledgeGraphStatistics(stats);
                // Then query for all types of elements
                graphResult = await this.codeKnowledgeGraph.queryGraph('*', {
                    limit: 50,
                    includePatterns: true,
                    includeBestPractices: false,
                    nodeTypes: ['file', 'class', 'function', 'variable', 'interface', 'module']
                });
            }
            else {
                // Regular query
                graphResult = await this.codeKnowledgeGraph.queryGraph(queryText, {
                    limit: 20,
                    includePatterns: true,
                    includeBestPractices: true
                });
            }
            // Display graph query results
            this.displayKnowledgeGraphResults(graphResult, queryText);
            // Generate improvement suggestions if applicable
            if (graphResult.nodes.length > 0) {
                const suggestions = await this.codeKnowledgeGraph.suggestImprovements({
                    nodeIds: graphResult.nodes.map(n => n.id)
                });
                if (suggestions.length > 0) {
                    this.displayImprovementSuggestions(suggestions);
                }
            }
            // Update conversation
            await this.updateConversationOutcome('success', `Found ${graphResult.nodes.length} nodes and ${graphResult.patterns.length} patterns in knowledge graph`);
        }
        catch (error) {
            this.terminal.error(`Knowledge graph query failed: ${formatErrorForDisplay(error)}`);
            await this.updateConversationOutcome('failure');
        }
    }
    /**
     * Display knowledge graph statistics and overview
     */
    displayKnowledgeGraphStatistics(stats) {
        this.terminal.info('\n📊 Knowledge Graph Statistics:');
        this.terminal.text(`   Total Nodes: ${stats.graph.nodeCount}`);
        this.terminal.text(`   Total Edges: ${stats.graph.edgeCount}`);
        this.terminal.text(`   Node Types: ${stats.graph.nodeTypes}`);
        this.terminal.text(`   Edge Types: ${stats.graph.edgeTypes}`);
        if (stats.indexing) {
            this.terminal.text(`   Files Indexed: ${stats.indexing.filesProcessed}`);
            this.terminal.text(`   Last Updated: ${new Date(stats.indexing.lastUpdate).toLocaleString()}`);
        }
        if (stats.performance) {
            this.terminal.text(`   Query Performance: ${stats.performance.averageQueryTime}ms avg`);
        }
    }
    /**
     * Display knowledge graph query results
     */
    displayKnowledgeGraphResults(result, query) {
        this.terminal.info(`\n🕸️  Knowledge Graph Results for: "${query}"`);
        this.terminal.text(`   Confidence: ${Math.round(result.confidence * 100)}%`);
        this.terminal.text(`   Processing Time: ${result.executionTime}ms`);
        if (result.nodes.length > 0) {
            this.terminal.info('\n📊 Code Elements Found:');
            result.nodes.slice(0, 10).forEach((node, index) => {
                const metadata = node.metadata ? ` (confidence: ${Math.round(node.metadata.confidence * 100)}%)` : '';
                this.terminal.text(`   ${index + 1}. ${node.type}: ${node.name}${metadata}`);
                if (node.properties.file) {
                    this.terminal.text(`      └─ File: ${node.properties.file}`);
                }
                if (node.properties.lineNumber) {
                    this.terminal.text(`      └─ Line: ${node.properties.lineNumber}`);
                }
            });
            if (result.nodes.length > 10) {
                this.terminal.text(`   ... and ${result.nodes.length - 10} more nodes`);
            }
        }
        if (result.edges.length > 0) {
            this.terminal.info('\n🔗 Relationships Found:');
            result.edges.slice(0, 5).forEach((edge, index) => {
                const sourceNode = result.nodes.find((n) => n.id === edge.source);
                const targetNode = result.nodes.find((n) => n.id === edge.target);
                const sourceName = sourceNode?.name || edge.source;
                const targetName = targetNode?.name || edge.target;
                this.terminal.text(`   ${index + 1}. ${sourceName} --[${edge.type}]--> ${targetName}`);
            });
            if (result.edges.length > 5) {
                this.terminal.text(`   ... and ${result.edges.length - 5} more relationships`);
            }
        }
        if (result.patterns.length > 0) {
            this.terminal.info('\n🎯 Architectural Patterns Detected:');
            result.patterns.forEach((pattern, index) => {
                const confidence = Math.round(pattern.confidence * 100);
                this.terminal.text(`   ${index + 1}. ${pattern.name} (${confidence}% confidence)`);
                if (pattern.description) {
                    this.terminal.text(`      └─ ${pattern.description}`);
                }
            });
        }
        if (result.bestPractices.length > 0) {
            this.terminal.info('\n💡 Related Best Practices:');
            result.bestPractices.slice(0, 3).forEach((practice, index) => {
                this.terminal.text(`   ${index + 1}. ${practice.name} (${practice.category})`);
                this.terminal.text(`      └─ ${practice.description}`);
            });
        }
        console.log(); // Add spacing
    }
    /**
     * Display improvement suggestions from knowledge graph
     */
    displayImprovementSuggestions(suggestions) {
        if (suggestions.length === 0)
            return;
        this.terminal.info('\n🚀 Improvement Suggestions:');
        suggestions.slice(0, 5).forEach((suggestion, index) => {
            const priority = suggestion.priority || 0;
            const impact = suggestion.impact || 'unknown';
            const effort = suggestion.effort || 'unknown';
            this.terminal.text(`   ${index + 1}. ${suggestion.title}`);
            this.terminal.text(`      └─ ${suggestion.suggestion}`);
            this.terminal.text(`      └─ Impact: ${impact}, Effort: ${effort}, Priority: ${priority}`);
            if (suggestion.rationale) {
                this.terminal.text(`      └─ Why: ${suggestion.rationale}`);
            }
        });
        if (suggestions.length > 5) {
            this.terminal.text(`   ... and ${suggestions.length - 5} more suggestions`);
        }
        console.log(); // Add spacing
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
            case '/session':
                this.displayQuerySession();
                return true;
            case '/end-session':
                this.endQuerySession();
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

Special Commands:
• /help - Show this help
• /status - Show current status
• /history - Show conversation history
• /summary - Show conversation summary
• /session - Show current query session
• /end-session - End current query session
• /clear - Clear screen
• exit, quit, bye - Exit interactive mode
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
    displayQuerySession() {
        if (!this.queryProcessor) {
            this.terminal.info('Multi-step query processing is not available');
            return;
        }
        const session = this.queryProcessor.getQuerySession();
        if (!session) {
            this.terminal.info('No active query session');
            return;
        }
        console.log(`
🔍 Active Query Session

Session ID: ${session.id}
Initial Query: "${session.initialQuery}"
Current Step: ${session.currentStep}
Start Time: ${session.startTime.toLocaleString()}
Status: ${session.isComplete ? 'Completed' : 'Active'}

Queries Processed (${session.queries.length}):
${session.queries.map((query, index) => `  ${index + 1}. ${query.isFollowUp ? '↳' : '●'} "${query.text}" (${query.timestamp.toLocaleTimeString()})`).join('\n')}

Results:
${session.results.map((result, index) => `  ${index + 1}. ${result.content.substring(0, 80)}${result.content.length > 80 ? '...' : ''}`).join('\n')}
`);
    }
    endQuerySession() {
        if (!this.queryProcessor) {
            this.terminal.info('Multi-step query processing is not available');
            return;
        }
        const session = this.queryProcessor.getQuerySession();
        if (!session) {
            this.terminal.info('No active query session to end');
            return;
        }
        const endedSession = this.queryProcessor.endQuerySession();
        if (endedSession) {
            this.terminal.success(`Query session ended. Processed ${endedSession.queries.length} queries in ${endedSession.currentStep} steps.`);
        }
        else {
            this.terminal.info('Query session ended.');
        }
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
    displayEnhancedContextSuggestions(enhancedContext) {
        if (enhancedContext.suggestions && enhancedContext.suggestions.length > 0) {
            this.terminal.info('\n🔍 Related suggestions:');
            enhancedContext.suggestions.forEach((suggestion, index) => {
                this.terminal.text(`  ${index + 1}. ${suggestion}`);
            });
            if (enhancedContext.confidence && enhancedContext.confidence > 0.7) {
                this.terminal.text(`  (Confidence: ${Math.round(enhancedContext.confidence * 100)}%)`);
            }
            console.log();
        }
    }
    async updateConversationOutcome(outcome, response) {
        const recentHistory = this.conversationManager.getRecentHistory(1);
        if (recentHistory.length > 0) {
            const mostRecentTurn = recentHistory[0];
            // Update the turn outcome
            await this.conversationManager.updateTurnOutcome(mostRecentTurn.id, outcome);
            // If we have response content and the current response is empty or very short, update it
            if (response && response.length > 100 && mostRecentTurn.response.length < 100) {
                // Update the response content directly in the conversation history
                const turn = this.conversationManager.getRecentHistory(1)[0];
                if (turn) {
                    turn.response = response;
                    // Persist the updated conversation
                    await this.conversationManager.persistConversation();
                }
            }
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
            case 'tool':
                await this.handleToolExecution(routingResult);
                break;
            case 'conversation':
                await this.handleConversation(routingResult);
                break;
        }
    }
    /**
     * Format task plan results for storage in conversation history
     */
    formatPlanResultsForStorage(plan) {
        if (!plan) {
            return 'Task plan completed but results not available.';
        }
        let resultsText = `Task Plan Results: ${plan.title || 'Untitled Plan'}\n\n`;
        const completedTasks = plan.tasks.filter((t) => t.status === 'completed');
        const failedTasks = plan.tasks.filter((t) => t.status === 'failed');
        if (completedTasks.length > 0) {
            resultsText += `✅ Completed ${completedTasks.length}/${plan.tasks.length} tasks:\n\n`;
            for (const task of completedTasks) {
                resultsText += `## ${task.title}\n`;
                if (task.result) {
                    const result = typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2);
                    resultsText += `${result}\n\n`;
                }
                else {
                    resultsText += `Task completed successfully.\n\n`;
                }
            }
        }
        if (failedTasks.length > 0) {
            resultsText += `❌ Failed ${failedTasks.length} tasks:\n`;
            for (const task of failedTasks) {
                resultsText += `- ${task.title}: ${task.error || 'Unknown error'}\n`;
            }
            resultsText += '\n';
        }
        // Add execution summary
        const duration = plan.completed ?
            ((new Date(plan.completed).getTime() - new Date(plan.started).getTime()) / (1000 * 60)).toFixed(1) :
            'N/A';
        resultsText += `Execution completed in ${duration} minutes`;
        return resultsText;
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