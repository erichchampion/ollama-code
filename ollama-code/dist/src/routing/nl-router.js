/**
 * Natural Language Router
 *
 * Routes user requests between command execution, task planning, and conversation
 * based on intent analysis and context.
 */
import { logger } from '../utils/logger.js';
import { commandRegistry } from '../commands/index.js';
export class NaturalLanguageRouter {
    intentAnalyzer;
    taskPlanner;
    commandConfidenceThreshold = 0.8;
    taskConfidenceThreshold = 0.6;
    constructor(intentAnalyzer, taskPlanner) {
        this.intentAnalyzer = intentAnalyzer;
        this.taskPlanner = taskPlanner;
    }
    /**
     * Route user input to appropriate handler
     */
    async route(input, context) {
        const startTime = performance.now();
        try {
            logger.debug('Routing user input', { input: input.substring(0, 100) });
            // Build analysis context
            const analysisContext = {
                conversationHistory: this.getConversationHistory(context.conversationManager),
                projectContext: context.projectContext,
                workingDirectory: context.workingDirectory,
                recentFiles: await this.getRecentFiles(context.workingDirectory),
                lastIntent: this.getLastIntent(context.conversationManager)
            };
            // Analyze intent
            const intent = await this.intentAnalyzer.analyze(input, analysisContext);
            // Record conversation turn
            const turn = await context.conversationManager.addTurn(input, intent, '', // Response will be filled later
            [] // Actions will be added later
            );
            // Route based on intent and confidence
            const routingResult = await this.determineRoute(intent, context, turn);
            const duration = performance.now() - startTime;
            logger.debug('Routing completed', {
                duration: `${duration.toFixed(2)}ms`,
                type: routingResult.type,
                action: routingResult.action
            });
            return routingResult;
        }
        catch (error) {
            logger.error('Routing failed:', error);
            throw error;
        }
    }
    /**
     * Handle clarification requests
     */
    async handleClarification(originalInput, clarificationResponse, context) {
        // Combine original input with clarification
        const combinedInput = `${originalInput} ${clarificationResponse}`;
        // Re-route with additional context
        return this.route(combinedInput, context);
    }
    /**
     * Generate clarification request for ambiguous input
     */
    generateClarificationRequest(intent) {
        const questions = [];
        const options = [];
        // Add suggested clarifications from intent analysis
        questions.push(...intent.suggestedClarifications);
        // Add specific clarification questions based on intent type
        if (intent.type === 'task_request' && intent.entities.files.length === 0) {
            questions.push('Which files or components should I work with?');
            // Add file options if we have project context
            // This would be populated from project context
            options.push({ label: 'Current file', value: 'current', description: 'Work with the currently open file' }, { label: 'New file', value: 'new', description: 'Create a new file' }, { label: 'Specify path', value: 'specify', description: 'Let me specify the exact file path' });
        }
        if (intent.type === 'task_request' && intent.complexity === 'complex') {
            questions.push('Would you like me to break this down into smaller steps?');
            options.push({ label: 'Yes, step by step', value: 'breakdown', description: 'Break into manageable steps' }, { label: 'No, do it all at once', value: 'all', description: 'Complete the entire task' });
        }
        if (intent.riskLevel === 'high') {
            questions.push('This operation has potential risks. How should I proceed?');
            options.push({ label: 'Proceed with caution', value: 'cautious', description: 'Create backups and validate each step' }, { label: 'Show me the plan first', value: 'plan', description: 'Let me review before execution' }, { label: 'Cancel', value: 'cancel', description: 'Don\'t perform this operation' });
        }
        return {
            questions,
            options: options.length > 0 ? options : undefined,
            context: `Intent: ${intent.type}, Action: ${intent.action}, Complexity: ${intent.complexity}`,
            required: intent.requiresClarification
        };
    }
    /**
     * Check if user input maps to an existing command
     */
    async checkCommandMapping(intent) {
        // Direct command mapping
        const directCommand = this.mapDirectCommand(intent);
        if (directCommand) {
            return { isCommand: true, ...directCommand };
        }
        // AI-assisted command mapping for natural language
        const aiCommand = await this.mapCommandWithAI(intent);
        if (aiCommand && aiCommand.confidence > this.commandConfidenceThreshold) {
            return { isCommand: true, commandName: aiCommand.command, args: aiCommand.args };
        }
        return { isCommand: false };
    }
    /**
     * Determine the appropriate route for the given intent
     */
    async determineRoute(intent, context, turn) {
        // Handle clarification needs first
        if (intent.requiresClarification) {
            return {
                type: 'clarification',
                action: 'request_clarification',
                data: this.generateClarificationRequest(intent),
                requiresConfirmation: false,
                estimatedTime: 1,
                riskLevel: 'low'
            };
        }
        // Check for direct command mapping
        const commandMapping = await this.checkCommandMapping(intent);
        if (commandMapping.isCommand && intent.confidence > this.commandConfidenceThreshold) {
            return {
                type: 'command',
                action: commandMapping.commandName,
                data: {
                    commandName: commandMapping.commandName,
                    args: commandMapping.args || [],
                    intent
                },
                requiresConfirmation: this.shouldRequireConfirmation(intent, context),
                estimatedTime: intent.estimatedDuration,
                riskLevel: intent.riskLevel
            };
        }
        // Route to task planning for complex tasks
        if (intent.type === 'task_request' && this.taskPlanner) {
            if (intent.confidence > this.taskConfidenceThreshold) {
                return {
                    type: 'task_plan',
                    action: 'create_and_execute_plan',
                    data: {
                        intent,
                        context: context.projectContext
                    },
                    requiresConfirmation: this.shouldRequireConfirmation(intent, context),
                    estimatedTime: intent.estimatedDuration,
                    riskLevel: intent.riskLevel
                };
            }
        }
        // Default to conversation for questions and unclear intents
        return {
            type: 'conversation',
            action: 'respond',
            data: {
                intent,
                contextualPrompt: context.conversationManager.generateContextualPrompt(turn.userInput, intent)
            },
            requiresConfirmation: false,
            estimatedTime: 2,
            riskLevel: 'low'
        };
    }
    /**
     * Map direct commands from natural language
     */
    mapDirectCommand(intent) {
        const action = intent.action.toLowerCase();
        // Direct action mappings
        const actionMappings = {
            'list': 'list-models',
            'show': 'list-models',
            'search': 'search',
            'find': 'search',
            'explain': 'explain',
            'help': 'help',
            'run': 'run',
            'execute': 'run',
            'test': 'run',
            'build': 'run'
        };
        const commandName = actionMappings[action];
        if (commandName && commandRegistry.exists(commandName)) {
            return {
                commandName,
                args: this.extractCommandArgs(intent, commandName)
            };
        }
        // Pattern-based mappings
        if (action.includes('model') && (action.includes('list') || action.includes('show'))) {
            return { commandName: 'list-models', args: [] };
        }
        if (action.includes('pull') && action.includes('model')) {
            return {
                commandName: 'pull-model',
                args: intent.entities.technologies.length > 0 ? [intent.entities.technologies[0]] : []
            };
        }
        if (action.includes('explain') && intent.entities.files.length > 0) {
            return {
                commandName: 'explain',
                args: [intent.entities.files[0]]
            };
        }
        return null;
    }
    /**
     * Use AI to map natural language to commands
     */
    async mapCommandWithAI(intent) {
        try {
            const availableCommands = commandRegistry.list().map(cmd => ({
                name: cmd.name,
                description: cmd.description,
                args: cmd.args?.map(arg => arg.name) || []
            }));
            const prompt = `
Map this natural language request to a specific command:

Request: "${intent.action}"
Intent type: ${intent.type}
Entities: ${JSON.stringify(intent.entities)}

Available commands:
${availableCommands.map(cmd => `- ${cmd.name}: ${cmd.description}`).join('\n')}

If this request maps to a command, respond with JSON:
{
  "command": "command-name",
  "args": ["arg1", "arg2"],
  "confidence": 0.0-1.0
}

If no command matches, respond with:
{
  "command": null,
  "confidence": 0.0
}`;
            // This would use the AI client to analyze the mapping
            // For now, return null to indicate no AI mapping
            return null;
        }
        catch (error) {
            logger.debug('AI command mapping failed:', error);
            return null;
        }
    }
    /**
     * Extract command arguments from intent
     */
    extractCommandArgs(intent, commandName) {
        const args = [];
        switch (commandName) {
            case 'explain':
                if (intent.entities.files.length > 0) {
                    args.push(intent.entities.files[0]);
                }
                break;
            case 'search':
                if (intent.entities.concepts.length > 0) {
                    args.push(intent.entities.concepts[0]);
                }
                else if (intent.entities.functions.length > 0) {
                    args.push(intent.entities.functions[0]);
                }
                break;
            case 'run':
                // Extract the command to run from the action
                const runMatch = intent.action.match(/run\s+(.+)/);
                if (runMatch) {
                    args.push(runMatch[1]);
                }
                break;
            case 'pull-model':
                if (intent.entities.technologies.length > 0) {
                    args.push(intent.entities.technologies[0]);
                }
                break;
        }
        return args;
    }
    /**
     * Determine if confirmation is required
     */
    shouldRequireConfirmation(intent, context) {
        // Always require confirmation for high-risk operations
        if (intent.riskLevel === 'high' && context.userPreferences.confirmHighRisk) {
            return true;
        }
        // Require confirmation for complex multi-step tasks
        if (intent.multiStep && intent.complexity === 'complex') {
            return true;
        }
        // Require confirmation for destructive operations
        const destructiveActions = ['delete', 'remove', 'drop', 'truncate', 'reset'];
        if (destructiveActions.some(action => intent.action.toLowerCase().includes(action))) {
            return true;
        }
        // Check user preferences
        if (!context.userPreferences.autoApprove && intent.type === 'task_request') {
            return true;
        }
        return false;
    }
    /**
     * Helper methods
     */
    getConversationHistory(conversationManager) {
        return conversationManager.getRecentHistory(5).map(turn => turn.userInput);
    }
    async getRecentFiles(workingDirectory) {
        // This would scan for recently modified files
        // For now, return empty array
        return [];
    }
    getLastIntent(conversationManager) {
        const recentHistory = conversationManager.getRecentHistory(1);
        return recentHistory.length > 0 ? recentHistory[0].intent : undefined;
    }
}
//# sourceMappingURL=nl-router.js.map