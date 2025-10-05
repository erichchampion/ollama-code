/**
 * Query Decomposition Engine
 *
 * Breaks down complex queries into manageable sub-tasks with dependency analysis,
 * resource calculation, and execution planning for autonomous task execution.
 */
import { logger } from '../utils/logger.js';
import { AI_CONSTANTS, THRESHOLD_CONSTANTS } from '../config/constants.js';
/**
 * Query Decomposition Engine Class
 *
 * Main class that handles complex query decomposition with advanced features:
 * - Multi-intent parsing and analysis
 * - Dependency resolution and topological sorting
 * - Resource calculation and optimization
 * - Execution planning with phase management
 * - Conflict detection and resolution
 * - Performance monitoring and caching
 */
export class QueryDecompositionEngine {
    aiClient;
    projectContext;
    config;
    initialized = false;
    // Caching and performance
    decompositionCache;
    executionHistory;
    performanceMetrics;
    // Pattern recognition
    intentPatterns = new Map();
    entityPatterns = new Map();
    complexityIndicators = new Map();
    constructor(aiClient, projectContext, config = {}) {
        this.aiClient = aiClient;
        this.projectContext = projectContext;
        // Configuration with sensible defaults
        this.config = {
            maxSubTasks: 10,
            maxDependencyDepth: 5,
            enableResourceCalculation: true,
            enablePriorityScheduling: true,
            enableConflictDetection: true,
            decompositionTimeout: 15000, // 15 seconds
            cacheTimeout: 300000, // 5 minutes
            riskThreshold: 'medium',
            ...config
        };
        // Initialize caches and collections
        this.decompositionCache = new Map();
        this.executionHistory = [];
        this.performanceMetrics = new Map();
        // Initialize pattern recognition
        this.initializePatterns();
    }
    /**
     * Initialize the query decomposition engine
     */
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing Query Decomposition Engine');
        try {
            // Initialize pattern matching and AI integration
            await this.initializePatternRecognition();
            // Set up performance monitoring
            this.initializePerformanceMonitoring();
            this.initialized = true;
            logger.info('Query Decomposition Engine initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Query Decomposition Engine:', error);
            throw error;
        }
    }
    /**
     * Main method to decompose a complex query into manageable sub-tasks
     */
    async decomposeQuery(query, context = {}) {
        if (!this.initialized) {
            throw new Error('QueryDecompositionEngine not initialized');
        }
        const startTime = performance.now();
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(query, context);
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                logger.debug(`Using cached decomposition for query: ${query.substring(0, 50)}...`);
                return cached;
            }
            logger.debug(`Decomposing query: ${query.substring(0, 100)}...`);
            // Create base decomposition structure
            const decomposition = {
                id: this.generateUniqueId('decomp'),
                originalQuery: query,
                intents: [],
                subTasks: [],
                dependencies: new Map(),
                executionPlan: {},
                estimatedDuration: 0,
                resourceRequirements: {},
                complexity: 'medium',
                conflicts: [],
                riskAssessment: {},
                timestamp: new Date(),
                metadata: {
                    decompositionTime: 0,
                    confidence: 0,
                    version: '1.0.0'
                }
            };
            // Step 1: Parse multiple intents from the query
            decomposition.intents = await this.parseMultipleIntents(query, context);
            // Step 2: Generate sub-tasks from intents
            decomposition.subTasks = await this.generateSubTasks(decomposition.intents, context);
            // Step 3: Analyze dependencies between tasks
            decomposition.dependencies = this.analyzeDependencies(decomposition.subTasks);
            // Step 4: Create execution plan with scheduling
            decomposition.executionPlan = this.createExecutionPlan(decomposition);
            // Step 5: Calculate resource requirements
            if (this.config.enableResourceCalculation) {
                decomposition.resourceRequirements = this.calculateResourceRequirements(decomposition);
            }
            // Step 6: Detect and resolve conflicts
            if (this.config.enableConflictDetection) {
                decomposition.conflicts = this.detectConflicts(decomposition);
            }
            // Step 7: Assess risks and determine approval requirements
            decomposition.riskAssessment = this.assessRisks(decomposition);
            // Step 8: Calculate overall metrics
            decomposition.estimatedDuration = this.calculateTotalDuration(decomposition);
            decomposition.complexity = this.determineComplexity(decomposition);
            // Finalize metadata
            const endTime = performance.now();
            decomposition.metadata.decompositionTime = endTime - startTime;
            decomposition.metadata.confidence = this.calculateConfidence(decomposition);
            // Cache the result
            this.addToCache(cacheKey, decomposition);
            // Add to execution history for learning
            this.executionHistory.push(decomposition);
            // Update performance metrics
            this.updatePerformanceMetrics('decomposition_time', decomposition.metadata.decompositionTime);
            logger.debug(`Query decomposed into ${decomposition.subTasks.length} sub-tasks in ${decomposition.metadata.decompositionTime.toFixed(2)}ms`);
            return decomposition;
        }
        catch (error) {
            logger.error('Failed to decompose query:', error);
            throw error;
        }
    }
    /**
     * Parse multiple intents from a single query
     */
    async parseMultipleIntents(query, context = {}) {
        const intents = [];
        // Use AI-powered intent analysis with fallback to pattern matching
        try {
            const aiIntents = await this.analyzeIntentsWithAI(query, context);
            intents.push(...aiIntents);
        }
        catch (error) {
            logger.debug('AI intent analysis failed, falling back to pattern matching:', error);
            const patternIntents = this.analyzeIntentsWithPatterns(query);
            intents.push(...patternIntents);
        }
        // Ensure we have at least one intent
        if (intents.length === 0) {
            intents.push(this.createDefaultIntent(query));
        }
        return intents;
    }
    /**
     * AI-powered intent analysis
     */
    async analyzeIntentsWithAI(query, context) {
        const prompt = `
Analyze the following query and identify all distinct intents/actions:
Query: "${query}"
Context: ${JSON.stringify(context, null, 2)}

Return a JSON array of intents with this structure:
[
  {
    "action": "create|build|test|deploy|analyze|fix|optimize|refactor",
    "type": "analysis|implementation|testing|deployment|modification|optimization|general",
    "confidence": 0.0-1.0,
    "entities": {
      "files": ["file1.js", "file2.ts"],
      "technologies": ["react", "typescript"],
      "concepts": ["authentication", "database"]
    },
    "priority": 1-10,
    "complexity": "low|medium|high"
  }
]

Focus on identifying:
1. Multiple actions in the query (create AND test AND deploy)
2. Technologies and frameworks mentioned
3. Files or components referenced
4. Concepts and patterns involved
`;
        const response = await this.aiClient.complete(prompt, {
            temperature: AI_CONSTANTS.QUERY_DECOMPOSITION_TEMPERATURE,
            max_tokens: 1000
        });
        const aiResult = this.parseAIResponse(response.message?.content || '[]');
        return aiResult.map((intent, index) => ({
            id: this.generateUniqueId('intent'),
            type: intent.type || 'general',
            action: intent.action || 'general',
            confidence: Math.min(Math.max(intent.confidence || 0.7, 0), 1),
            entities: {
                files: intent.entities?.files || [],
                technologies: intent.entities?.technologies || [],
                concepts: intent.entities?.concepts || []
            },
            complexity: intent.complexity || 'medium',
            priority: intent.priority || (index + 1)
        }));
    }
    /**
     * Pattern-based intent analysis (fallback)
     */
    analyzeIntentsWithPatterns(query) {
        const intents = [];
        const lowerQuery = query.toLowerCase();
        // Action detection patterns
        const actionPatterns = [
            { pattern: /\b(create|build|implement|develop|make|generate)\b/g, action: 'create', type: 'implementation' },
            { pattern: /\b(test|verify|validate|check|ensure)\b/g, action: 'test', type: 'testing' },
            { pattern: /\b(deploy|publish|release|launch)\b/g, action: 'deploy', type: 'deployment' },
            { pattern: /\b(analyze|examine|review|inspect|assess)\b/g, action: 'analyze', type: 'analysis' },
            { pattern: /\b(fix|repair|correct|resolve|debug)\b/g, action: 'fix', type: 'bugfix' },
            { pattern: /\b(optimize|improve|enhance|refactor|cleanup)\b/g, action: 'optimize', type: 'optimization' },
            { pattern: /\b(update|modify|change|edit|alter)\b/g, action: 'update', type: 'modification' }
        ];
        // Find all matching actions
        const foundActions = new Set();
        actionPatterns.forEach(({ pattern, action, type }) => {
            if (pattern.test(lowerQuery) && !foundActions.has(action)) {
                foundActions.add(action);
                intents.push({
                    id: this.generateUniqueId('intent'),
                    type: type,
                    action,
                    confidence: 0.8,
                    entities: this.extractEntitiesFromQuery(query),
                    complexity: this.estimateComplexityFromQuery(query),
                    priority: intents.length + 1
                });
            }
        });
        return intents;
    }
    /**
     * Generate sub-tasks from identified intents
     */
    async generateSubTasks(intents, context) {
        const subTasks = [];
        for (const intent of intents) {
            const tasks = await this.generateTasksForIntent(intent, context);
            subTasks.push(...tasks);
        }
        // Limit the number of sub-tasks
        if (subTasks.length > this.config.maxSubTasks) {
            logger.warn(`Too many sub-tasks generated (${subTasks.length}), limiting to ${this.config.maxSubTasks}`);
            return subTasks.slice(0, this.config.maxSubTasks);
        }
        return subTasks;
    }
    /**
     * Generate tasks for a specific intent
     */
    async generateTasksForIntent(intent, context) {
        const tasks = [];
        switch (intent.type) {
            case 'implementation':
                tasks.push(...this.generateImplementationTasks(intent, context));
                break;
            case 'testing':
                tasks.push(...this.generateTestingTasks(intent, context));
                break;
            case 'deployment':
                tasks.push(...this.generateDeploymentTasks(intent, context));
                break;
            case 'analysis':
                tasks.push(...this.generateAnalysisTasks(intent, context));
                break;
            case 'optimization':
                tasks.push(...this.generateOptimizationTasks(intent, context));
                break;
            case 'modification':
                tasks.push(...this.generateModificationTasks(intent, context));
                break;
            default:
                tasks.push(this.generateGenericTask(intent, context));
        }
        return tasks;
    }
    /**
     * Helper methods for different task types
     */
    generateImplementationTasks(intent, context) {
        const tasks = [];
        // Base implementation task
        tasks.push({
            id: this.generateUniqueId('task'),
            type: 'implementation',
            description: `Implement ${intent.action} functionality`,
            priority: intent.priority,
            estimatedTime: this.estimateImplementationTime(intent),
            complexity: intent.complexity,
            entities: intent.entities,
            requirements: this.getImplementationRequirements(intent)
        });
        // Add planning task for complex implementations
        if (intent.complexity === 'high') {
            tasks.unshift({
                id: this.generateUniqueId('task'),
                type: 'planning',
                description: `Plan implementation approach for ${intent.action}`,
                priority: intent.priority - 0.5,
                estimatedTime: 120, // 2 minutes
                complexity: 'medium',
                entities: intent.entities
            });
        }
        return tasks;
    }
    generateTestingTasks(intent, context) {
        return [{
                id: this.generateUniqueId('task'),
                type: 'testing',
                description: `Create and run tests for ${intent.entities.concepts.join(', ') || 'functionality'}`,
                priority: intent.priority,
                estimatedTime: this.estimateTestingTime(intent),
                complexity: intent.complexity,
                entities: intent.entities,
                requirements: ['implementation_complete']
            }];
    }
    generateDeploymentTasks(intent, context) {
        const tasks = [];
        // Pre-deployment checks
        tasks.push({
            id: this.generateUniqueId('task'),
            type: 'analysis',
            description: 'Pre-deployment validation and checks',
            priority: intent.priority - 0.5,
            estimatedTime: 60,
            complexity: 'medium',
            entities: intent.entities,
            requirements: ['testing_complete']
        });
        // Main deployment
        tasks.push({
            id: this.generateUniqueId('task'),
            type: 'deployment',
            description: `Deploy to ${intent.entities.concepts.includes('staging') ? 'staging' : 'production'}`,
            priority: intent.priority,
            estimatedTime: this.estimateDeploymentTime(intent),
            complexity: intent.complexity,
            entities: intent.entities,
            requirements: ['validation_complete']
        });
        return tasks;
    }
    generateAnalysisTasks(intent, context) {
        return [{
                id: this.generateUniqueId('task'),
                type: 'analysis',
                description: `Analyze ${intent.entities.concepts.join(', ') || intent.entities.files.join(', ') || 'codebase'}`,
                priority: intent.priority,
                estimatedTime: this.estimateAnalysisTime(intent),
                complexity: intent.complexity,
                entities: intent.entities
            }];
    }
    generateOptimizationTasks(intent, context) {
        const tasks = [];
        // Analysis phase
        tasks.push({
            id: this.generateUniqueId('task'),
            type: 'analysis',
            description: 'Analyze performance bottlenecks and optimization opportunities',
            priority: intent.priority - 0.5,
            estimatedTime: 180,
            complexity: 'medium',
            entities: intent.entities
        });
        // Implementation phase
        tasks.push({
            id: this.generateUniqueId('task'),
            type: 'optimization',
            description: `Optimize ${intent.entities.concepts.join(', ') || 'performance'}`,
            priority: intent.priority,
            estimatedTime: this.estimateOptimizationTime(intent),
            complexity: intent.complexity,
            entities: intent.entities,
            requirements: ['analysis_complete']
        });
        return tasks;
    }
    generateModificationTasks(intent, context) {
        return [{
                id: this.generateUniqueId('task'),
                type: 'modification',
                description: `Modify ${intent.entities.files.join(', ') || intent.entities.concepts.join(', ') || 'code'}`,
                priority: intent.priority,
                estimatedTime: this.estimateModificationTime(intent),
                complexity: intent.complexity,
                entities: intent.entities
            }];
    }
    generateGenericTask(intent, context) {
        return {
            id: this.generateUniqueId('task'),
            type: 'general',
            description: `Execute ${intent.action} request`,
            priority: intent.priority,
            estimatedTime: 60, // 1 minute default
            complexity: intent.complexity,
            entities: intent.entities
        };
    }
    /**
     * Analyze dependencies between tasks
     */
    analyzeDependencies(subTasks) {
        const dependencies = new Map();
        // Analyze each task for dependencies
        for (const task of subTasks) {
            const deps = [];
            // Task type dependencies
            if (task.type === 'testing') {
                // Testing depends on implementation
                const implTasks = subTasks.filter(t => t.type === 'implementation' && t.priority < task.priority);
                deps.push(...implTasks.map(t => t.id));
            }
            if (task.type === 'deployment') {
                // Deployment depends on testing
                const testTasks = subTasks.filter(t => t.type === 'testing' && t.priority < task.priority);
                const implTasks = subTasks.filter(t => t.type === 'implementation' && t.priority < task.priority);
                deps.push(...testTasks.map(t => t.id));
                deps.push(...implTasks.map(t => t.id));
            }
            if (task.type === 'optimization') {
                // Optimization depends on analysis
                const analysisTasks = subTasks.filter(t => t.type === 'analysis' && t.priority < task.priority);
                deps.push(...analysisTasks.map(t => t.id));
            }
            // Explicit requirement dependencies
            if (task.requirements) {
                for (const req of task.requirements) {
                    const reqTasks = subTasks.filter(t => (req === 'implementation_complete' && t.type === 'implementation') ||
                        (req === 'testing_complete' && t.type === 'testing') ||
                        (req === 'analysis_complete' && t.type === 'analysis') ||
                        (req === 'validation_complete' && (t.type === 'analysis' || t.type === 'testing')));
                    deps.push(...reqTasks.map(t => t.id));
                }
            }
            // File-based dependencies
            if (task.entities?.files) {
                const samFileTasks = subTasks.filter(t => t.id !== task.id &&
                    t.entities?.files?.some(f => task.entities.files.includes(f)) &&
                    t.priority < task.priority);
                deps.push(...samFileTasks.map(t => t.id));
            }
            if (deps.length > 0) {
                dependencies.set(task.id, [...new Set(deps)]); // Remove duplicates
            }
        }
        return dependencies;
    }
    /**
     * Create execution plan with phase scheduling
     */
    createExecutionPlan(decomposition) {
        const plan = {
            id: this.generateUniqueId('plan'),
            phases: [],
            totalDuration: 0,
            parallelizable: false,
            criticalPath: [],
            resourceProfile: {},
            riskAssessment: {}
        };
        // Perform topological sort for proper execution order
        const sortedTasks = this.topologicalSort(decomposition.subTasks, decomposition.dependencies);
        // Create execution phases
        plan.phases = this.createExecutionPhases(sortedTasks, decomposition.dependencies);
        // Calculate metrics
        plan.totalDuration = Math.max(...plan.phases.map(p => p.estimatedTime));
        plan.parallelizable = plan.phases.some(phase => phase.tasks.length > 1);
        plan.criticalPath = this.findCriticalPath(decomposition);
        plan.resourceProfile = this.aggregateResourceRequirements(plan.phases);
        return plan;
    }
    /**
     * Topological sort for dependency resolution
     */
    topologicalSort(tasks, dependencies) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (task) => {
            if (visiting.has(task.id)) {
                throw new Error(`Circular dependency detected involving task ${task.id}`);
            }
            if (visited.has(task.id))
                return;
            visiting.add(task.id);
            const deps = dependencies.get(task.id) || [];
            for (const depId of deps) {
                const depTask = tasks.find(t => t.id === depId);
                if (depTask) {
                    visit(depTask);
                }
            }
            visiting.delete(task.id);
            visited.add(task.id);
            sorted.push(task);
        };
        // Visit all tasks
        for (const task of tasks) {
            visit(task);
        }
        return sorted;
    }
    /**
     * Create execution phases from sorted tasks
     */
    createExecutionPhases(sortedTasks, dependencies) {
        const phases = [];
        const processed = new Set();
        for (const task of sortedTasks) {
            const taskDeps = dependencies.get(task.id) || [];
            const canStart = taskDeps.every(dep => processed.has(dep));
            if (canStart) {
                // Find or create appropriate phase
                let phase = phases.find(p => p.dependencies.every(dep => processed.has(dep)) &&
                    !this.hasResourceConflict(p, task));
                if (!phase) {
                    phase = {
                        id: phases.length + 1,
                        tasks: [],
                        dependencies: taskDeps,
                        estimatedTime: 0,
                        parallelExecutable: false,
                        resourceRequirements: this.getDefaultResourceRequirements()
                    };
                    phases.push(phase);
                }
                phase.tasks.push(task);
                phase.estimatedTime = Math.max(phase.estimatedTime, task.estimatedTime);
                phase.parallelExecutable = phase.tasks.length > 1;
                // Update resource requirements
                phase.resourceRequirements = this.combineResourceRequirements(phase.resourceRequirements, this.getTaskResourceRequirements(task));
                processed.add(task.id);
            }
        }
        return phases;
    }
    /**
     * Utility methods and helpers
     */
    initializePatterns() {
        // Intent recognition patterns
        this.intentPatterns = new Map([
            ['create', /\b(create|build|implement|develop|make|generate|add|new)\b/gi],
            ['test', /\b(test|verify|validate|check|ensure|spec)\b/gi],
            ['deploy', /\b(deploy|publish|release|launch|ship)\b/gi],
            ['analyze', /\b(analyze|examine|review|inspect|assess|audit)\b/gi],
            ['fix', /\b(fix|repair|correct|resolve|debug|solve)\b/gi],
            ['optimize', /\b(optimize|improve|enhance|refactor|cleanup|performance)\b/gi],
            ['update', /\b(update|modify|change|edit|alter|adjust)\b/gi]
        ]);
        // Entity extraction patterns
        this.entityPatterns = new Map([
            ['files', /\b\w+\.(js|ts|jsx|tsx|py|java|cpp|html|css|json|md|yml|yaml)\b/gi],
            ['technologies', /\b(react|vue|angular|typescript|javascript|python|java|node|express|mongodb|postgresql|docker|kubernetes|aws|azure|gcp)\b/gi],
            ['concepts', /\b(authentication|authorization|database|api|frontend|backend|testing|deployment|security|performance|optimization|refactoring)\b/gi]
        ]);
        // Complexity indicators
        this.complexityIndicators = new Map([
            ['simple_words', 0.1],
            ['complex_words', 0.3],
            ['multiple_actions', 0.5],
            ['multiple_technologies', 0.4],
            ['deployment_mentions', 0.6],
            ['architecture_mentions', 0.7],
            ['integration_mentions', 0.8]
        ]);
    }
    async initializePatternRecognition() {
        // Load any additional patterns from AI or configuration
        logger.debug('Pattern recognition initialized');
    }
    initializePerformanceMonitoring() {
        this.performanceMetrics.set('decomposition_time', 0);
        this.performanceMetrics.set('cache_hits', 0);
        this.performanceMetrics.set('cache_misses', 0);
    }
    generateUniqueId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCacheKey(query, context) {
        const contextStr = JSON.stringify(context);
        return `${query.toLowerCase().trim()}_${contextStr}`.replace(/\s+/g, '_');
    }
    getFromCache(key) {
        const entry = this.decompositionCache.get(key);
        if (!entry) {
            this.updatePerformanceMetrics('cache_misses', 1);
            return null;
        }
        // Check if cache entry is still valid
        const now = Date.now();
        const age = now - entry.timestamp.getTime();
        if (age > this.config.cacheTimeout) {
            this.decompositionCache.delete(key);
            this.updatePerformanceMetrics('cache_misses', 1);
            return null;
        }
        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = new Date();
        this.updatePerformanceMetrics('cache_hits', 1);
        return entry.decomposition;
    }
    addToCache(key, decomposition) {
        const entry = {
            decomposition,
            timestamp: new Date(),
            accessCount: 1,
            lastAccessed: new Date()
        };
        this.decompositionCache.set(key, entry);
        // Implement LRU eviction if cache gets too large
        if (this.decompositionCache.size > 100) {
            this.evictLeastRecentlyUsed();
        }
    }
    evictLeastRecentlyUsed() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, entry] of this.decompositionCache.entries()) {
            if (entry.lastAccessed.getTime() < oldestTime) {
                oldestTime = entry.lastAccessed.getTime();
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.decompositionCache.delete(oldestKey);
        }
    }
    updatePerformanceMetrics(metric, value) {
        const current = this.performanceMetrics.get(metric) || 0;
        this.performanceMetrics.set(metric, current + value);
    }
    // Additional helper methods for time estimation, risk assessment, etc.
    estimateImplementationTime(intent) {
        const baseTime = 300; // 5 minutes
        const complexityMultiplier = { low: 1, medium: 2, high: 4 };
        const techMultiplier = Math.max(1, intent.entities.technologies.length * 0.5);
        return Math.round(baseTime * complexityMultiplier[intent.complexity] * techMultiplier);
    }
    estimateTestingTime(intent) {
        const baseTime = 180; // 3 minutes
        const complexityMultiplier = { low: 1, medium: 1.5, high: 3 };
        return Math.round(baseTime * complexityMultiplier[intent.complexity]);
    }
    estimateDeploymentTime(intent) {
        const baseTime = 240; // 4 minutes
        const complexityMultiplier = { low: 1, medium: 2, high: 3 };
        return Math.round(baseTime * complexityMultiplier[intent.complexity]);
    }
    estimateAnalysisTime(intent) {
        const baseTime = 60; // 1 minute
        const fileMultiplier = Math.max(1, intent.entities.files.length * 0.3);
        return Math.round(baseTime * fileMultiplier);
    }
    estimateOptimizationTime(intent) {
        const baseTime = 360; // 6 minutes
        const complexityMultiplier = { low: 1, medium: 2, high: 4 };
        return Math.round(baseTime * complexityMultiplier[intent.complexity]);
    }
    estimateModificationTime(intent) {
        const baseTime = 120; // 2 minutes
        const fileMultiplier = Math.max(1, intent.entities.files.length * 0.5);
        return Math.round(baseTime * fileMultiplier);
    }
    extractEntitiesFromQuery(query) {
        const entities = {
            files: [],
            technologies: [],
            concepts: []
        };
        // Extract using patterns
        for (const [type, pattern] of this.entityPatterns.entries()) {
            const matches = query.match(pattern) || [];
            if (type === 'files')
                entities.files = [...new Set(matches)];
            if (type === 'technologies')
                entities.technologies = [...new Set(matches.map(m => m.toLowerCase()))];
            if (type === 'concepts')
                entities.concepts = [...new Set(matches.map(m => m.toLowerCase()))];
        }
        return entities;
    }
    estimateComplexityFromQuery(query) {
        let score = 0;
        const lowerQuery = query.toLowerCase();
        // Count complexity indicators
        if (this.intentPatterns.get('create')?.test(lowerQuery))
            score += 0.3;
        if (this.intentPatterns.get('test')?.test(lowerQuery))
            score += 0.2;
        if (this.intentPatterns.get('deploy')?.test(lowerQuery))
            score += 0.4;
        // Multiple actions increase complexity
        const actionCount = Array.from(this.intentPatterns.values())
            .filter(pattern => pattern.test(lowerQuery)).length;
        score += Math.min(actionCount * 0.2, 0.6);
        // Length and technical terms
        if (query.length > 100)
            score += 0.2;
        if (/\b(architecture|microservice|distributed|scalable|enterprise)\b/i.test(query))
            score += 0.4;
        if (score >= THRESHOLD_CONSTANTS.CONFIDENCE.MEDIUM)
            return 'high';
        if (score >= 0.4)
            return 'medium';
        return 'low';
    }
    parseAIResponse(content) {
        try {
            // Clean up the response and parse JSON
            const cleaned = content.replace(/```json\s*|\s*```/g, '').trim();
            return JSON.parse(cleaned);
        }
        catch (error) {
            logger.debug('Failed to parse AI response as JSON:', error);
            return [];
        }
    }
    createDefaultIntent(query) {
        return {
            id: this.generateUniqueId('intent'),
            type: 'general',
            action: 'general',
            confidence: 0.5,
            entities: this.extractEntitiesFromQuery(query),
            complexity: this.estimateComplexityFromQuery(query),
            priority: 1
        };
    }
    getImplementationRequirements(intent) {
        const requirements = [];
        if (intent.entities.technologies.includes('typescript')) {
            requirements.push('typescript_setup');
        }
        if (intent.entities.technologies.includes('react')) {
            requirements.push('react_environment');
        }
        if (intent.entities.concepts.includes('database')) {
            requirements.push('database_access');
        }
        return requirements;
    }
    calculateResourceRequirements(decomposition) {
        const requirements = {
            cpu: 'medium',
            memory: 'medium',
            network: 'low',
            disk: 'low',
            estimatedDuration: decomposition.estimatedDuration,
            concurrentTasks: 1
        };
        // Adjust based on task types and complexity
        const taskTypes = decomposition.subTasks.map(t => t.type);
        const complexTasks = decomposition.subTasks.filter(t => t.complexity === 'high').length;
        if (taskTypes.includes('deployment') || taskTypes.includes('testing')) {
            requirements.cpu = 'high';
            requirements.network = 'medium';
        }
        if (decomposition.complexity === 'high' || complexTasks > 2) {
            requirements.memory = 'high';
            requirements.disk = 'medium';
        }
        if (decomposition.subTasks.length > 5) {
            requirements.cpu = 'high';
            requirements.concurrentTasks = Math.min(3, Math.floor(decomposition.subTasks.length / 2));
        }
        return requirements;
    }
    detectConflicts(decomposition) {
        const conflicts = [];
        // Check for file modification conflicts
        const fileMap = new Map();
        for (const task of decomposition.subTasks) {
            if (task.entities?.files) {
                for (const file of task.entities.files) {
                    if (!fileMap.has(file))
                        fileMap.set(file, []);
                    fileMap.get(file).push(task.id);
                }
            }
        }
        for (const [file, taskIds] of fileMap.entries()) {
            if (taskIds.length > 1) {
                const modificationTasks = taskIds.filter(id => {
                    const task = decomposition.subTasks.find(t => t.id === id);
                    return task && (task.type === 'modification' || task.type === 'implementation');
                });
                if (modificationTasks.length > 1) {
                    conflicts.push({
                        type: 'file_modification',
                        tasks: modificationTasks,
                        severity: 'medium',
                        resolution: 'sequence_execution',
                        description: `Multiple tasks modifying ${file} simultaneously`
                    });
                }
            }
        }
        // Check for resource conflicts
        const resourceIntensive = decomposition.subTasks.filter(task => task.type === 'testing' || task.type === 'deployment' || task.complexity === 'high');
        if (resourceIntensive.length > 3) {
            conflicts.push({
                type: 'resource_conflict',
                tasks: resourceIntensive.map(t => t.id),
                severity: 'low',
                resolution: 'parallel_limit',
                description: 'Too many resource-intensive tasks for parallel execution'
            });
        }
        // Check for dependency cycles (should be caught by topological sort)
        try {
            this.topologicalSort(decomposition.subTasks, decomposition.dependencies);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Circular dependency')) {
                conflicts.push({
                    type: 'dependency_cycle',
                    tasks: [], // Would need more sophisticated cycle detection
                    severity: 'high',
                    resolution: 'break_cycle',
                    description: 'Circular dependency detected in task graph'
                });
            }
        }
        return conflicts;
    }
    assessRisks(decomposition) {
        const factors = [];
        let riskLevel = 'low';
        // Analyze risk factors
        if (decomposition.subTasks.some(t => t.type === 'deployment')) {
            factors.push('Production deployment involved');
            riskLevel = 'medium';
        }
        if (decomposition.subTasks.some(t => t.type === 'modification')) {
            factors.push('Code modification required');
            if (riskLevel === 'low')
                riskLevel = 'medium';
        }
        if (decomposition.complexity === 'high') {
            factors.push('High complexity operations');
            riskLevel = riskLevel === 'low' ? 'medium' : 'high';
        }
        if (decomposition.conflicts.some(c => c.severity === 'high')) {
            factors.push('High-severity conflicts detected');
            riskLevel = 'high';
        }
        if (decomposition.subTasks.length > 7) {
            factors.push('Large number of sub-tasks');
            if (riskLevel === 'low')
                riskLevel = 'medium';
        }
        // Critical risk conditions
        if (decomposition.subTasks.some(t => t.type === 'deployment') &&
            decomposition.conflicts.some(c => c.severity === 'high') &&
            decomposition.complexity === 'high') {
            factors.push('Multiple high-risk factors combined');
            riskLevel = 'critical';
        }
        // Determine if approval is required
        const approvalRequired = riskLevel === 'high' ||
            riskLevel === 'critical' ||
            decomposition.subTasks.some(t => t.type === 'deployment');
        return {
            level: riskLevel,
            factors,
            mitigations: this.generateRiskMitigations(factors),
            approvalRequired
        };
    }
    generateRiskMitigations(factors) {
        const mitigations = [];
        if (factors.includes('Production deployment involved')) {
            mitigations.push('Use staging environment for testing');
            mitigations.push('Implement rollback plan');
        }
        if (factors.includes('Code modification required')) {
            mitigations.push('Create backup before modifications');
            mitigations.push('Use version control for tracking changes');
        }
        if (factors.includes('High complexity operations')) {
            mitigations.push('Break down into smaller steps');
            mitigations.push('Implement comprehensive testing');
        }
        if (factors.includes('High-severity conflicts detected')) {
            mitigations.push('Resolve conflicts before execution');
            mitigations.push('Consider sequential execution');
        }
        return mitigations;
    }
    calculateTotalDuration(decomposition) {
        return decomposition.subTasks.reduce((total, task) => total + task.estimatedTime, 0);
    }
    determineComplexity(decomposition) {
        const complexTaskCount = decomposition.subTasks.filter(t => t.complexity === 'high').length;
        const totalTasks = decomposition.subTasks.length;
        const hasDependencies = decomposition.dependencies.size > 0;
        const hasConflicts = decomposition.conflicts.length > 0;
        if (complexTaskCount > totalTasks / 2 || hasConflicts || totalTasks > 7) {
            return 'high';
        }
        if (complexTaskCount > 0 || hasDependencies || totalTasks > 3) {
            return 'medium';
        }
        return 'low';
    }
    calculateConfidence(decomposition) {
        let confidence = THRESHOLD_CONSTANTS.CONFIDENCE.HIGH; // Base confidence
        // Adjust based on intent confidence
        const avgIntentConfidence = decomposition.intents.reduce((sum, intent) => sum + intent.confidence, 0) / decomposition.intents.length;
        confidence = (confidence + avgIntentConfidence) / 2;
        // Reduce confidence for high complexity
        if (decomposition.complexity === 'high')
            confidence *= THRESHOLD_CONSTANTS.WEIGHTS.COMPLEXITY_REDUCTION;
        if (decomposition.conflicts.length > 0)
            confidence *= THRESHOLD_CONSTANTS.WEIGHTS.CONFLICT_REDUCTION;
        // Increase confidence for simpler tasks
        if (decomposition.subTasks.length === 1 && decomposition.complexity === 'low') {
            confidence *= 1.1;
        }
        return Math.min(Math.max(confidence, 0), 1);
    }
    findCriticalPath(decomposition) {
        const tasks = decomposition.subTasks;
        const dependencies = decomposition.dependencies;
        let longestPath = [];
        let maxDuration = 0;
        const findPath = (taskId, currentPath = [], currentDuration = 0) => {
            const task = tasks.find(t => t.id === taskId);
            if (!task)
                return;
            const newPath = [...currentPath, task.id];
            const newDuration = currentDuration + task.estimatedTime;
            if (newDuration > maxDuration) {
                maxDuration = newDuration;
                longestPath = newPath;
            }
            // Find dependent tasks
            for (const [depTask, deps] of dependencies.entries()) {
                if (deps.includes(taskId)) {
                    findPath(depTask, newPath, newDuration);
                }
            }
        };
        // Start from tasks with no dependencies
        for (const task of tasks) {
            const hasDependencies = Array.from(dependencies.values()).some(deps => deps.includes(task.id));
            if (!hasDependencies) {
                findPath(task.id);
            }
        }
        return longestPath;
    }
    hasResourceConflict(phase, task) {
        // Simple resource conflict detection
        const resourceIntensiveTypes = ['testing', 'deployment', 'optimization'];
        if (resourceIntensiveTypes.includes(task.type)) {
            return phase.tasks.some(t => resourceIntensiveTypes.includes(t.type));
        }
        return false;
    }
    getDefaultResourceRequirements() {
        return {
            cpu: 'low',
            memory: 'low',
            network: 'low',
            disk: 'low',
            estimatedDuration: 0,
            concurrentTasks: 1
        };
    }
    getTaskResourceRequirements(task) {
        const baseReqs = this.getDefaultResourceRequirements();
        // Adjust based on task type and complexity
        if (task.type === 'testing' || task.type === 'deployment') {
            baseReqs.cpu = 'medium';
            baseReqs.network = 'medium';
        }
        if (task.complexity === 'high') {
            baseReqs.memory = 'high';
            baseReqs.cpu = 'high';
        }
        baseReqs.estimatedDuration = task.estimatedTime;
        return baseReqs;
    }
    combineResourceRequirements(req1, req2) {
        const combine = (a, b) => {
            const levels = { low: 1, medium: 2, high: 3 };
            const maxLevel = Math.max(levels[a], levels[b]);
            return Object.keys(levels).find(key => levels[key] === maxLevel) || 'medium';
        };
        return {
            cpu: combine(req1.cpu, req2.cpu),
            memory: combine(req1.memory, req2.memory),
            network: combine(req1.network, req2.network),
            disk: combine(req1.disk, req2.disk),
            estimatedDuration: Math.max(req1.estimatedDuration, req2.estimatedDuration),
            concurrentTasks: req1.concurrentTasks + req2.concurrentTasks
        };
    }
    aggregateResourceRequirements(phases) {
        if (phases.length === 0)
            return this.getDefaultResourceRequirements();
        let aggregated = phases[0].resourceRequirements;
        for (let i = 1; i < phases.length; i++) {
            aggregated = this.combineResourceRequirements(aggregated, phases[i].resourceRequirements);
        }
        return aggregated;
    }
    /**
     * Public API methods
     */
    /**
     * Get decomposition statistics
     */
    getStatistics() {
        const totalDecompositions = this.decompositionCache.size;
        const cacheHits = this.performanceMetrics.get('cache_hits') || 0;
        const cacheMisses = this.performanceMetrics.get('cache_misses') || 0;
        const totalRequests = cacheHits + cacheMisses;
        const decompositions = Array.from(this.decompositionCache.values()).map(entry => entry.decomposition);
        return {
            totalDecompositions,
            cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
            averageSubTasks: decompositions.reduce((sum, d) => sum + d.subTasks.length, 0) / Math.max(totalDecompositions, 1),
            averageDuration: decompositions.reduce((sum, d) => sum + d.estimatedDuration, 0) / Math.max(totalDecompositions, 1),
            averageComplexity: this.calculateAverageComplexity(decompositions),
            successRate: 0.95, // Placeholder - would track actual execution success
            performanceMetrics: {
                averageDecompositionTime: this.performanceMetrics.get('decomposition_time') || 0,
                cacheSize: this.decompositionCache.size,
                memoryUsage: this.estimateMemoryUsage()
            }
        };
    }
    calculateAverageComplexity(decompositions) {
        const complexityValues = { low: 1, medium: 2, high: 3 };
        const sum = decompositions.reduce((total, d) => total + complexityValues[d.complexity], 0);
        return sum / Math.max(decompositions.length, 1);
    }
    estimateMemoryUsage() {
        // Rough estimate of memory usage in MB
        const cacheSize = this.decompositionCache.size;
        const historySize = this.executionHistory.length;
        return (cacheSize * 10) + (historySize * 5); // Rough estimates
    }
    /**
     * Clear cache and history
     */
    clear() {
        this.decompositionCache.clear();
        this.executionHistory = [];
        this.performanceMetrics.clear();
        this.initializePerformanceMonitoring();
    }
    /**
     * Get cached decomposition by ID
     */
    getDecomposition(id) {
        for (const entry of this.decompositionCache.values()) {
            if (entry.decomposition.id === id) {
                return entry.decomposition;
            }
        }
        return null;
    }
    /**
     * Update task status (for execution tracking)
     */
    updateTaskStatus(decompositionId, taskId, status) {
        const decomposition = this.getDecomposition(decompositionId);
        if (decomposition) {
            const task = decomposition.subTasks.find(t => t.id === taskId);
            if (task) {
                // Add status tracking if needed
                logger.debug(`Task ${taskId} status updated to ${status}`);
            }
        }
    }
}
//# sourceMappingURL=query-decomposition-engine.js.map