/**
 * Intent Analyzer
 *
 * Analyzes user input to determine intent, extract entities, and assess complexity
 * for autonomous task planning and execution.
 */
import { logger } from '../utils/logger.js';
export class IntentAnalyzer {
    aiClient;
    entityPatterns = new Map();
    intentKeywords = new Map();
    complexityIndicators = new Map();
    constructor(aiClient) {
        this.aiClient = aiClient;
        this.initializePatterns();
    }
    /**
     * Analyze user input to determine intent and extract entities
     */
    async analyze(input, context) {
        const startTime = performance.now();
        try {
            logger.debug('Analyzing user intent', { input: input.substring(0, 100) });
            // Normalize input
            const normalizedInput = this.normalizeInput(input);
            // Extract entities first (faster, helps with context)
            const entityResult = await this.extractEntities(normalizedInput, context);
            // Classify intent type
            const intentType = await this.classifyIntent(normalizedInput, context, entityResult);
            // Determine action and complexity
            const action = await this.extractAction(normalizedInput, intentType);
            const complexity = this.assessComplexity(normalizedInput, entityResult, context);
            // Check if multi-step
            const multiStep = this.isMultiStep(normalizedInput, complexity);
            // Assess clarification needs
            const clarificationAnalysis = this.assessClarificationNeeds(normalizedInput, entityResult, context);
            // Estimate duration and risk
            const estimatedDuration = this.estimateDuration(complexity, multiStep, entityResult);
            const riskLevel = this.assessRiskLevel(intentType, complexity, entityResult);
            // Build context information
            const intentContext = this.buildIntentContext(normalizedInput, entityResult, context);
            // Calculate overall confidence
            const confidence = this.calculateConfidence(intentType, entityResult, clarificationAnalysis, context);
            const intent = {
                type: intentType,
                action,
                entities: entityResult.entities,
                confidence,
                complexity,
                multiStep,
                requiresClarification: clarificationAnalysis.required,
                suggestedClarifications: clarificationAnalysis.suggestions,
                estimatedDuration,
                riskLevel,
                context: intentContext
            };
            const duration = performance.now() - startTime;
            logger.debug('Intent analysis completed', {
                duration: `${duration.toFixed(2)}ms`,
                type: intent.type,
                confidence: intent.confidence,
                complexity: intent.complexity
            });
            return intent;
        }
        catch (error) {
            logger.error('Intent analysis failed:', error);
            // Return fallback intent
            return this.createFallbackIntent(input, context);
        }
    }
    /**
     * Extract entities from user input using pattern matching and AI
     */
    async extractEntities(input, context) {
        const entities = {
            files: [],
            directories: [],
            functions: [],
            classes: [],
            technologies: [],
            concepts: [],
            variables: []
        };
        // Pattern-based extraction (fast)
        this.extractEntitiesWithPatterns(input, entities, context);
        // AI-enhanced extraction for complex cases
        if (context.projectContext && entities.files.length === 0) {
            await this.extractEntitiesWithAI(input, entities, context);
        }
        // Resolve ambiguous file references
        const ambiguousReferences = this.findAmbiguousReferences(entities, context);
        // Calculate confidence based on extraction quality
        const confidence = this.calculateEntityConfidence(entities, ambiguousReferences);
        return {
            entities,
            confidence,
            ambiguousReferences
        };
    }
    /**
     * Extract entities using pattern matching
     */
    extractEntitiesWithPatterns(input, entities, context) {
        // File patterns
        const filePatterns = [
            /(?:file|src|\.\/|\/)?([a-zA-Z0-9_-]+\.[a-zA-Z]{1,4})/g,
            /(?:in|from|edit|modify|update)\s+([a-zA-Z0-9_/-]+\.(?:js|ts|py|java|cpp|c|go|rs|php|rb))/g
        ];
        // Directory patterns
        const dirPatterns = [
            /(?:directory|folder|dir)\s+([a-zA-Z0-9_/-]+)/g,
            /(?:in|from)\s+([a-zA-Z0-9_/-]+\/)/g
        ];
        // Function patterns
        const functionPatterns = [
            /(?:function|method|func)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
            /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
        ];
        // Class patterns
        const classPatterns = [
            /(?:class|interface|type)\s+([A-Z][a-zA-Z0-9_]*)/g,
            /new\s+([A-Z][a-zA-Z0-9_]*)/g
        ];
        // Technology patterns
        const techPatterns = [
            /(?:using|with|in)\s+(React|Vue|Angular|Express|FastAPI|Django|Spring|Laravel)/gi,
            /(JavaScript|TypeScript|Python|Java|C\+\+|Go|Rust|PHP|Ruby)/gi,
            /(Node\.js|npm|yarn|pip|maven|gradle|cargo|composer)/gi
        ];
        // Apply patterns
        this.applyPatterns(filePatterns, input, entities.files);
        this.applyPatterns(dirPatterns, input, entities.directories);
        this.applyPatterns(functionPatterns, input, entities.functions);
        this.applyPatterns(classPatterns, input, entities.classes);
        this.applyPatterns(techPatterns, input, entities.technologies);
        // Extract concepts based on keywords
        this.extractConcepts(input, entities.concepts);
        // Clean and deduplicate
        this.cleanEntities(entities);
    }
    /**
     * Enhanced entity extraction using AI for complex cases
     */
    async extractEntitiesWithAI(input, entities, context) {
        if (!context.projectContext)
            return;
        const prompt = `
Analyze this user request and extract specific entities:
"${input}"

Project context:
- Working directory: ${context.workingDirectory}
- Recent files: ${context.recentFiles.join(', ')}
- Project files: ${context.projectContext.allFiles.slice(0, 20).map(f => f.path).join(', ')}

Extract and return ONLY a JSON object with these fields:
{
  "files": ["exact file paths mentioned or implied"],
  "functions": ["function names mentioned"],
  "classes": ["class names mentioned"],
  "technologies": ["technologies or frameworks mentioned"]
}

Be precise and only include entities that are clearly referenced.`;
        try {
            const response = await this.aiClient.complete(prompt, {
                temperature: 0.1
            });
            if (response.message?.content) {
                const aiEntities = this.parseAIEntityResponse(response.message.content);
                this.mergeEntities(entities, aiEntities);
            }
        }
        catch (error) {
            logger.debug('AI entity extraction failed, using pattern-based only:', error);
        }
    }
    /**
     * Classify the type of user intent
     */
    async classifyIntent(input, context, entityResult) {
        // Quick classification using keywords
        const quickClassification = this.quickClassifyIntent(input);
        if (quickClassification && entityResult.confidence > 0.7) {
            return quickClassification;
        }
        // AI-based classification for complex cases
        return await this.aiClassifyIntent(input, context);
    }
    /**
     * Quick intent classification using keywords
     */
    quickClassifyIntent(input) {
        const normalized = input.toLowerCase();
        // Task request indicators
        const taskKeywords = [
            'create', 'add', 'implement', 'build', 'make', 'generate', 'write',
            'refactor', 'fix', 'update', 'modify', 'change', 'improve', 'optimize',
            'delete', 'remove', 'rename', 'move', 'copy', 'install', 'setup'
        ];
        // Question indicators
        const questionKeywords = [
            'what', 'how', 'why', 'when', 'where', 'which', 'who',
            'explain', 'describe', 'tell me', 'show me', 'help'
        ];
        // Command indicators
        const commandKeywords = [
            'run', 'execute', 'start', 'stop', 'test', 'build', 'deploy',
            'list', 'show', 'display', 'search', 'find'
        ];
        if (taskKeywords.some(keyword => normalized.includes(keyword))) {
            return 'task_request';
        }
        if (questionKeywords.some(keyword => normalized.includes(keyword))) {
            return 'question';
        }
        if (commandKeywords.some(keyword => normalized.includes(keyword))) {
            return 'command';
        }
        // Check for question patterns
        if (normalized.includes('?') || normalized.startsWith('how') || normalized.startsWith('what')) {
            return 'question';
        }
        return null;
    }
    /**
     * AI-based intent classification
     */
    async aiClassifyIntent(input, context) {
        const prompt = `
Classify this user input into one of these categories:
- task_request: User wants something to be done (create, modify, fix, implement)
- question: User wants information or explanation
- command: User wants to execute a specific action
- clarification: User is providing additional information
- conversation: General conversation or unclear intent

Input: "${input}"

Context: ${context.conversationHistory.length > 0 ? `Previous: ${context.conversationHistory[context.conversationHistory.length - 1]}` : 'No previous context'}

Return ONLY the category name.`;
        try {
            const response = await this.aiClient.complete(prompt, {
                temperature: 0.1
            });
            const classification = response.message?.content?.trim().toLowerCase();
            const validTypes = [
                'task_request', 'question', 'command', 'clarification', 'conversation'
            ];
            if (classification && validTypes.includes(classification)) {
                return classification;
            }
        }
        catch (error) {
            logger.debug('AI intent classification failed:', error);
        }
        // Fallback to conversation
        return 'conversation';
    }
    /**
     * Extract the main action from the input
     */
    async extractAction(input, intentType) {
        const normalized = input.toLowerCase().trim();
        // For commands, extract the command verb
        if (intentType === 'command') {
            const commandMatch = normalized.match(/^(run|execute|start|stop|test|build|deploy|list|show|search|find)\s/);
            if (commandMatch) {
                return commandMatch[1];
            }
        }
        // For task requests, extract the action verb
        if (intentType === 'task_request') {
            const actionMatch = normalized.match(/(create|add|implement|build|make|generate|write|refactor|fix|update|modify|change|improve|optimize|delete|remove|rename|move|copy|install|setup)/);
            if (actionMatch) {
                return actionMatch[1];
            }
        }
        // For questions, extract the question type
        if (intentType === 'question') {
            const questionMatch = normalized.match(/(what|how|why|when|where|which|who|explain|describe)/);
            if (questionMatch) {
                return questionMatch[1];
            }
        }
        // Return the first few words as the action
        return input.split(' ').slice(0, 3).join(' ');
    }
    /**
     * Assess the complexity of the request
     */
    assessComplexity(input, entityResult, context) {
        let complexityScore = 0;
        // Input length factor
        if (input.length > 200)
            complexityScore += 1;
        if (input.length > 500)
            complexityScore += 1;
        // Entity count factor
        const totalEntities = Object.values(entityResult.entities)
            .reduce((sum, arr) => sum + arr.length, 0);
        if (totalEntities > 5)
            complexityScore += 1;
        if (totalEntities > 10)
            complexityScore += 1;
        // Multiple file involvement
        if (entityResult.entities.files.length > 3)
            complexityScore += 1;
        if (entityResult.entities.files.length > 8)
            complexityScore += 1;
        // Technology complexity
        if (entityResult.entities.technologies.length > 2)
            complexityScore += 1;
        // Keywords indicating complexity
        const complexityKeywords = [
            'architecture', 'refactor', 'migrate', 'integrate', 'optimize',
            'design pattern', 'microservice', 'database', 'api', 'framework'
        ];
        const hasComplexKeywords = complexityKeywords.some(keyword => input.toLowerCase().includes(keyword));
        if (hasComplexKeywords)
            complexityScore += 2;
        // Multiple actions
        const actionWords = ['and', 'then', 'also', 'additionally', 'furthermore'];
        const hasMultipleActions = actionWords.some(word => input.toLowerCase().includes(word));
        if (hasMultipleActions)
            complexityScore += 1;
        // Return complexity based on score
        if (complexityScore <= 1)
            return 'simple';
        if (complexityScore <= 3)
            return 'moderate';
        if (complexityScore <= 5)
            return 'complex';
        return 'expert';
    }
    /**
     * Determine if this is a multi-step request
     */
    isMultiStep(input, complexity) {
        const normalized = input.toLowerCase();
        // Explicit multi-step indicators
        const multiStepIndicators = [
            'and then', 'after that', 'next', 'also', 'additionally',
            'furthermore', 'step by step', 'phase', 'first', 'second',
            'finally', 'lastly'
        ];
        const hasMultiStepIndicators = multiStepIndicators.some(indicator => normalized.includes(indicator));
        // Complex tasks are often multi-step
        const isComplexTask = complexity === 'complex' || complexity === 'expert';
        // Multiple verbs might indicate multiple steps
        const actionVerbs = [
            'create', 'add', 'implement', 'build', 'make', 'generate',
            'refactor', 'fix', 'update', 'modify', 'test', 'deploy'
        ];
        const verbCount = actionVerbs.filter(verb => normalized.includes(verb)).length;
        return hasMultiStepIndicators || isComplexTask || verbCount > 2;
    }
    /**
     * Assess if clarification is needed
     */
    assessClarificationNeeds(input, entityResult, context) {
        const suggestions = [];
        // Check for ambiguous file references
        if (entityResult.ambiguousReferences.length > 0) {
            suggestions.push(`Which specific file did you mean: ${entityResult.ambiguousReferences.join(', ')}?`);
        }
        // Check for vague actions
        const vageActions = ['fix', 'improve', 'optimize', 'update'];
        const hasVagueAction = vageActions.some(action => input.toLowerCase().includes(action));
        if (hasVagueAction && entityResult.entities.files.length === 0) {
            suggestions.push('Which file or component would you like me to work on?');
        }
        // Check for missing technology context
        if (input.toLowerCase().includes('create') && entityResult.entities.technologies.length === 0) {
            suggestions.push('What technology or framework should I use?');
        }
        // Check for scope clarity
        if (input.length < 20 && !context.lastIntent) {
            suggestions.push('Could you provide more details about what you want to accomplish?');
        }
        return {
            required: suggestions.length > 0,
            suggestions
        };
    }
    /**
     * Estimate duration for the task
     */
    estimateDuration(complexity, multiStep, entityResult) {
        const baseTime = {
            simple: 5,
            moderate: 15,
            complex: 45,
            expert: 120
        };
        let duration = baseTime[complexity];
        // Multi-step tasks take longer
        if (multiStep) {
            duration *= 1.5;
        }
        // Multiple files increase duration
        const fileCount = entityResult.entities.files.length;
        if (fileCount > 1) {
            duration *= (1 + (fileCount - 1) * 0.3);
        }
        return Math.round(duration);
    }
    /**
     * Assess risk level of the operation
     */
    assessRiskLevel(intentType, complexity, entityResult) {
        let riskScore = 0;
        // Task requests are riskier than questions
        if (intentType === 'task_request')
            riskScore += 1;
        // Complex operations are riskier
        if (complexity === 'complex')
            riskScore += 1;
        if (complexity === 'expert')
            riskScore += 2;
        // Multiple files increase risk
        if (entityResult.entities.files.length > 3)
            riskScore += 1;
        if (entityResult.entities.files.length > 8)
            riskScore += 1;
        // System files are high risk
        const systemFiles = entityResult.entities.files.filter(file => file.includes('config') || file.includes('package.json') ||
            file.includes('.env') || file.includes('Dockerfile'));
        if (systemFiles.length > 0)
            riskScore += 2;
        if (riskScore <= 1)
            return 'low';
        if (riskScore <= 3)
            return 'medium';
        return 'high';
    }
    /**
     * Build intent context information
     */
    buildIntentContext(input, entityResult, context) {
        return {
            projectAware: !!context.projectContext && entityResult.entities.files.length > 0,
            fileSpecific: entityResult.entities.files.length > 0,
            followUp: context.lastIntent !== undefined,
            references: [
                ...entityResult.entities.files,
                ...entityResult.entities.functions,
                ...entityResult.entities.classes
            ]
        };
    }
    /**
     * Calculate overall confidence score
     */
    calculateConfidence(intentType, entityResult, clarificationAnalysis, context) {
        let confidence = 0.5; // Base confidence
        // Intent classification confidence
        if (intentType !== 'conversation')
            confidence += 0.2;
        // Entity extraction confidence
        confidence += entityResult.confidence * 0.3;
        // Reduce confidence if clarification is needed
        if (clarificationAnalysis.required) {
            confidence -= 0.2;
        }
        // Increase confidence with context
        if (context.projectContext && entityResult.entities.files.length > 0) {
            confidence += 0.1;
        }
        // Ensure confidence is between 0 and 1
        return Math.max(0, Math.min(1, confidence));
    }
    /**
     * Initialize pattern matching rules
     */
    initializePatterns() {
        this.entityPatterns = new Map();
        this.intentKeywords = new Map();
        this.complexityIndicators = new Map();
        // Initialize entity patterns
        this.entityPatterns.set('files', [
            /([a-zA-Z0-9_-]+\.[a-zA-Z]{1,4})/g,
            /(?:file|src|\.\/|\/)?([a-zA-Z0-9_/-]+\.(?:js|ts|py|java|cpp|c|go|rs|php|rb|html|css|json|md))/g
        ]);
        // Initialize intent keywords
        this.intentKeywords.set('task_request', [
            'create', 'add', 'implement', 'build', 'make', 'generate', 'write',
            'refactor', 'fix', 'update', 'modify', 'change', 'improve', 'optimize'
        ]);
        this.intentKeywords.set('question', [
            'what', 'how', 'why', 'when', 'where', 'which', 'who',
            'explain', 'describe', 'tell me', 'show me'
        ]);
        this.intentKeywords.set('command', [
            'run', 'execute', 'start', 'stop', 'test', 'build', 'deploy',
            'list', 'show', 'display', 'search', 'find'
        ]);
    }
    /**
     * Utility methods
     */
    normalizeInput(input) {
        return input.trim().replace(/\s+/g, ' ');
    }
    applyPatterns(patterns, input, results) {
        patterns.forEach(pattern => {
            const matches = input.match(pattern);
            if (matches) {
                results.push(...matches.map(match => match.trim()));
            }
        });
    }
    extractConcepts(input, concepts) {
        const conceptKeywords = [
            'authentication', 'authorization', 'security', 'performance',
            'database', 'api', 'frontend', 'backend', 'testing', 'deployment'
        ];
        conceptKeywords.forEach(concept => {
            if (input.toLowerCase().includes(concept)) {
                concepts.push(concept);
            }
        });
    }
    cleanEntities(entities) {
        Object.keys(entities).forEach(key => {
            const entityArray = entities[key];
            const uniqueEntities = new Set(entityArray.filter(entity => entity.length > 1));
            entities[key] = Array.from(uniqueEntities);
        });
    }
    findAmbiguousReferences(entities, context) {
        const ambiguous = [];
        // Check for partial file names that could match multiple files
        if (context.projectContext) {
            entities.files.forEach(file => {
                const matches = context.projectContext.allFiles.filter(projectFile => projectFile.path.includes(file) || projectFile.relativePath.includes(file));
                if (matches.length > 1) {
                    ambiguous.push(file);
                }
            });
        }
        return ambiguous;
    }
    calculateEntityConfidence(entities, ambiguousReferences) {
        const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);
        if (totalEntities === 0)
            return 0.3;
        const ambiguousCount = ambiguousReferences.length;
        const clarityRatio = (totalEntities - ambiguousCount) / totalEntities;
        return Math.max(0.3, clarityRatio);
    }
    parseAIEntityResponse(content) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            logger.debug('Failed to parse AI entity response:', error);
        }
        return {};
    }
    mergeEntities(target, source) {
        Object.keys(source).forEach(key => {
            const entityKey = key;
            const sourceArray = source[entityKey];
            const targetArray = target[entityKey];
            if (Array.isArray(sourceArray)) {
                targetArray.push(...sourceArray.filter(item => !targetArray.includes(item)));
            }
        });
    }
    createFallbackIntent(input, context) {
        return {
            type: 'conversation',
            action: 'respond',
            entities: {
                files: [],
                directories: [],
                functions: [],
                classes: [],
                technologies: [],
                concepts: [],
                variables: []
            },
            confidence: 0.2,
            complexity: 'simple',
            multiStep: false,
            requiresClarification: true,
            suggestedClarifications: ['Could you rephrase your request?'],
            estimatedDuration: 1,
            riskLevel: 'low',
            context: {
                projectAware: false,
                fileSpecific: false,
                followUp: false,
                references: []
            }
        };
    }
}
//# sourceMappingURL=intent-analyzer.js.map