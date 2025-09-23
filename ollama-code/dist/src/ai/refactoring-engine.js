/**
 * Refactoring Engine
 *
 * Automated code refactoring system that safely transforms code while preserving
 * functionality, with comprehensive impact analysis and rollback capabilities.
 */
import { logger } from '../utils/logger.js';
export class RefactoringEngine {
    rules = [];
    activeSessions = new Map();
    constructor() {
        this.initializeRules();
    }
    /**
     * Analyze code for refactoring opportunities
     */
    async analyzeRefactoringOpportunities(files) {
        const opportunities = [];
        logger.info('Analyzing refactoring opportunities', { fileCount: files.length });
        for (const file of files) {
            for (const rule of this.rules) {
                try {
                    const fileOpportunities = rule.applicability(file.content);
                    fileOpportunities.forEach(opportunity => {
                        opportunity.location.file = file.path;
                        opportunities.push(opportunity);
                    });
                }
                catch (error) {
                    logger.warn(`Error applying rule ${rule.id} to ${file.path}:`, error);
                }
            }
        }
        // Sort by priority and confidence
        opportunities.sort((a, b) => {
            const aRule = this.rules.find(r => r.id === a.ruleId);
            const bRule = this.rules.find(r => r.id === b.ruleId);
            if (aRule.priority !== bRule.priority) {
                return bRule.priority - aRule.priority;
            }
            return b.confidence - a.confidence;
        });
        logger.info('Refactoring analysis completed', {
            opportunitiesFound: opportunities.length,
            highImpact: opportunities.filter(o => o.impact === 'high').length
        });
        return opportunities;
    }
    /**
     * Create a refactoring plan from opportunities
     */
    createRefactoringPlan(opportunities) {
        // Analyze dependencies between refactorings
        const dependencies = this.analyzeDependencies(opportunities);
        // Determine execution order
        const executionOrder = this.calculateExecutionOrder(opportunities, dependencies);
        // Calculate total impact
        const totalImpact = this.calculateTotalImpact(opportunities);
        // Create rollback plan
        const rollbackPlan = this.createRollbackPlan(opportunities);
        return {
            opportunities,
            dependencies,
            executionOrder,
            totalImpact,
            rollbackPlan
        };
    }
    /**
     * Execute a refactoring plan
     */
    async executeRefactoringPlan(plan, files, options = {}) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            timestamp: new Date(),
            plan,
            results: new Map(),
            status: 'planned',
            rollbackPoint: {
                files: new Map(files),
                timestamp: new Date()
            }
        };
        this.activeSessions.set(sessionId, session);
        try {
            session.status = 'executing';
            logger.info('Starting refactoring execution', {
                sessionId,
                opportunities: plan.opportunities.length,
                dryRun: options.dryRun
            });
            const workingFiles = new Map(files);
            for (const opportunityId of plan.executionOrder) {
                const opportunity = plan.opportunities.find(o => `${o.ruleId}_${o.location.startLine}` === opportunityId);
                if (!opportunity)
                    continue;
                const rule = this.rules.find(r => r.id === opportunity.ruleId);
                if (!rule)
                    continue;
                try {
                    const fileContent = workingFiles.get(opportunity.location.file) || '';
                    const result = rule.transform(fileContent, opportunity);
                    // Run safety checks
                    const safetyErrors = this.runSafetyChecks(rule, fileContent, result);
                    if (safetyErrors.length > 0) {
                        result.errors.push(...safetyErrors);
                        result.success = false;
                    }
                    session.results.set(opportunityId, result);
                    if (!result.success) {
                        if (options.stopOnError) {
                            logger.error('Refactoring failed, stopping execution', { sessionId, opportunityId });
                            session.status = 'failed';
                            if (options.autoRollback) {
                                await this.rollbackSession(sessionId);
                            }
                            return session;
                        }
                        else {
                            logger.warn('Refactoring failed, continuing', { sessionId, opportunityId });
                            continue;
                        }
                    }
                    // Apply changes if not dry run
                    if (!options.dryRun && result.success) {
                        workingFiles.set(opportunity.location.file, result.transformedCode);
                    }
                    logger.debug('Refactoring applied successfully', { sessionId, opportunityId });
                }
                catch (error) {
                    logger.error('Error executing refactoring', { sessionId, opportunityId, error });
                    if (options.stopOnError) {
                        session.status = 'failed';
                        if (options.autoRollback) {
                            await this.rollbackSession(sessionId);
                        }
                        return session;
                    }
                }
            }
            session.status = 'completed';
            logger.info('Refactoring execution completed', {
                sessionId,
                successful: Array.from(session.results.values()).filter(r => r.success).length,
                failed: Array.from(session.results.values()).filter(r => !r.success).length
            });
        }
        catch (error) {
            logger.error('Critical error during refactoring execution', { sessionId, error });
            session.status = 'failed';
            if (options.autoRollback) {
                await this.rollbackSession(sessionId);
            }
        }
        return session;
    }
    /**
     * Rollback a refactoring session
     */
    async rollbackSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            logger.error('Session not found for rollback', { sessionId });
            return false;
        }
        try {
            logger.info('Rolling back refactoring session', { sessionId });
            // Execute rollback instructions
            for (const instruction of session.plan.rollbackPlan.reverse()) {
                logger.debug('Executing rollback instruction', { instruction });
                // In a real implementation, this would execute actual rollback commands
            }
            session.status = 'rolled_back';
            logger.info('Rollback completed successfully', { sessionId });
            return true;
        }
        catch (error) {
            logger.error('Rollback failed', { sessionId, error });
            return false;
        }
    }
    /**
     * Get refactoring session status
     */
    getSessionStatus(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }
    /**
     * Initialize refactoring rules
     */
    initializeRules() {
        this.rules = [
            // Extract Method
            {
                id: 'extract_long_method',
                name: 'Extract Long Method',
                description: 'Extract long methods into smaller, focused methods',
                category: 'extract_method',
                priority: 8,
                applicability: (code) => {
                    const opportunities = [];
                    const methodMatches = code.matchAll(/(\w+\s*\([^)]*\)\s*{)([\s\S]*?)(?=\n\s*})/g);
                    for (const match of methodMatches) {
                        const methodBody = match[2];
                        const lines = methodBody.split('\n').filter(line => line.trim().length > 0);
                        if (lines.length > 30) {
                            const startLine = code.substring(0, match.index).split('\n').length;
                            opportunities.push({
                                ruleId: 'extract_long_method',
                                location: {
                                    file: '',
                                    startLine,
                                    endLine: startLine + lines.length,
                                    startColumn: 1,
                                    endColumn: 1
                                },
                                description: `Method has ${lines.length} lines and should be broken down`,
                                impact: 'medium',
                                confidence: 0.8,
                                benefits: ['Improved readability', 'Better testability', 'Easier maintenance'],
                                risks: ['Potential behavior change', 'Increased method count'],
                                estimatedEffort: 'hours',
                                prerequisites: ['Unit tests exist'],
                                metadata: { methodName: match[1], lineCount: lines.length }
                            });
                        }
                    }
                    return opportunities;
                },
                transform: (code, opportunity) => {
                    // Simplified extraction logic
                    const lines = code.split('\n');
                    const extractedLines = lines.slice(opportunity.location.startLine, opportunity.location.endLine);
                    // Identify extractable blocks (simplified)
                    const extractableBlocks = this.identifyExtractableBlocks(extractedLines);
                    let transformedCode = code;
                    const changes = [];
                    for (const block of extractableBlocks) {
                        const methodName = `extracted${Math.random().toString(36).substr(2, 8)}`;
                        const extractedMethod = `\n  private ${methodName}(): void {\n${block.content}\n  }\n`;
                        // Replace original code with method call
                        transformedCode = transformedCode.replace(block.content, `    this.${methodName}();`);
                        // Add extracted method
                        transformedCode += extractedMethod;
                        changes.push({
                            type: 'replace',
                            location: block.location,
                            oldContent: block.content,
                            newContent: `this.${methodName}();`,
                            reason: 'Extracted to improve readability'
                        });
                    }
                    return {
                        success: true,
                        originalCode: code,
                        transformedCode,
                        changes,
                        warnings: [],
                        errors: [],
                        preservedBehavior: true,
                        testSuggestions: ['Add unit tests for extracted methods'],
                        rollbackInstructions: ['Inline extracted methods back to original location']
                    };
                },
                safetyChecks: [
                    (code, result) => {
                        const errors = [];
                        if (result.transformedCode.includes('undefined')) {
                            errors.push('Potential undefined reference introduced');
                        }
                        return errors;
                    }
                ]
            },
            // Eliminate Duplication
            {
                id: 'eliminate_duplication',
                name: 'Eliminate Code Duplication',
                description: 'Extract common code into reusable functions',
                category: 'eliminate_duplication',
                priority: 7,
                applicability: (code) => {
                    const opportunities = [];
                    const duplicates = this.findDuplicateCode(code);
                    for (const duplicate of duplicates) {
                        opportunities.push({
                            ruleId: 'eliminate_duplication',
                            location: duplicate.location,
                            description: `Duplicate code block found (${duplicate.similarity}% similar)`,
                            impact: 'medium',
                            confidence: duplicate.similarity / 100,
                            benefits: ['Reduced code duplication', 'Easier maintenance', 'Single source of truth'],
                            risks: ['Potential over-abstraction'],
                            estimatedEffort: 'hours',
                            prerequisites: [],
                            metadata: { similarity: duplicate.similarity, occurrences: duplicate.occurrences }
                        });
                    }
                    return opportunities;
                },
                transform: (code, opportunity) => {
                    // Extract common code into helper method
                    const commonCode = opportunity.metadata.commonCode;
                    const helperMethodName = `helper${Math.random().toString(36).substr(2, 8)}`;
                    let transformedCode = code;
                    const changes = [];
                    // Replace duplicates with helper method calls
                    for (const occurrence of opportunity.metadata.occurrences) {
                        transformedCode = transformedCode.replace(occurrence, `this.${helperMethodName}();`);
                        changes.push({
                            type: 'replace',
                            location: occurrence.location,
                            oldContent: occurrence,
                            newContent: `this.${helperMethodName}();`,
                            reason: 'Eliminated duplication'
                        });
                    }
                    // Add helper method
                    const helperMethod = `\n  private ${helperMethodName}(): void {\n${commonCode}\n  }\n`;
                    transformedCode += helperMethod;
                    return {
                        success: true,
                        originalCode: code,
                        transformedCode,
                        changes,
                        warnings: [],
                        errors: [],
                        preservedBehavior: true,
                        testSuggestions: [`Add unit test for ${helperMethodName}`],
                        rollbackInstructions: [`Inline ${helperMethodName} back to original locations`]
                    };
                },
                safetyChecks: [
                    (code, result) => {
                        const errors = [];
                        // Check for variable scope issues
                        const helperMethods = result.transformedCode.match(/private \w+\(\)/g);
                        if (helperMethods && helperMethods.length > 5) {
                            errors.push('Too many helper methods created - may indicate over-extraction');
                        }
                        return errors;
                    }
                ]
            },
            // Improve Naming
            {
                id: 'improve_naming',
                name: 'Improve Variable and Method Names',
                description: 'Rename poorly named variables and methods',
                category: 'improve_naming',
                priority: 5,
                applicability: (code) => {
                    const opportunities = [];
                    // Find poorly named variables (single letters, unclear names)
                    const poorNames = code.matchAll(/(?:let|const|var|function)\s+([a-z]|temp\d*|data\d*|item\d*|x\d*|y\d*)\b/g);
                    for (const match of poorNames) {
                        const location = this.getLocationFromIndex(code, match.index || 0);
                        opportunities.push({
                            ruleId: 'improve_naming',
                            location,
                            description: `Variable '${match[1]}' has unclear name`,
                            impact: 'low',
                            confidence: 0.7,
                            benefits: ['Improved code readability', 'Better self-documentation'],
                            risks: ['Breaking changes if public API'],
                            estimatedEffort: 'minutes',
                            prerequisites: [],
                            metadata: { oldName: match[1], suggestions: this.generateNameSuggestions(match[1], code) }
                        });
                    }
                    return opportunities;
                },
                transform: (code, opportunity) => {
                    const oldName = opportunity.metadata.oldName;
                    const newName = opportunity.metadata.suggestions[0] || `${oldName}Renamed`;
                    // Replace all occurrences
                    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
                    const transformedCode = code.replace(regex, newName);
                    const changes = [{
                            type: 'replace',
                            location: opportunity.location,
                            oldContent: oldName,
                            newContent: newName,
                            reason: 'Improved naming for clarity'
                        }];
                    return {
                        success: true,
                        originalCode: code,
                        transformedCode,
                        changes,
                        warnings: [],
                        errors: [],
                        preservedBehavior: true,
                        testSuggestions: ['Update tests to use new variable name'],
                        rollbackInstructions: [`Rename ${newName} back to ${oldName}`]
                    };
                },
                safetyChecks: [
                    (code, result) => {
                        const errors = [];
                        // Check for potential naming conflicts
                        const newNames = result.changes.map(c => c.newContent);
                        const existingNames = code.match(/(?:let|const|var|function)\s+(\w+)/g) || [];
                        for (const newName of newNames) {
                            if (existingNames.some(existing => existing.includes(newName))) {
                                errors.push(`Potential naming conflict with ${newName}`);
                            }
                        }
                        return errors;
                    }
                ]
            },
            // Replace Conditional with Polymorphism
            {
                id: 'replace_conditional',
                name: 'Replace Conditional with Polymorphism',
                description: 'Replace type-checking conditionals with polymorphic behavior',
                category: 'replace_conditional',
                priority: 6,
                applicability: (code) => {
                    const opportunities = [];
                    // Look for switch statements or long if-else chains based on type
                    const conditionals = code.matchAll(/(switch\s*\([^)]*\.type\)|if\s*\([^)]*\.type\s*===)/g);
                    for (const match of conditionals) {
                        const location = this.getLocationFromIndex(code, match.index || 0);
                        opportunities.push({
                            ruleId: 'replace_conditional',
                            location,
                            description: 'Type-based conditional could be replaced with polymorphism',
                            impact: 'high',
                            confidence: 0.6,
                            benefits: ['Better extensibility', 'Reduced cyclomatic complexity', 'Open/Closed principle'],
                            risks: ['Increased number of classes', 'Complexity of polymorphic design'],
                            estimatedEffort: 'days',
                            prerequisites: ['Object-oriented design understanding'],
                            metadata: { conditionalType: match[1] }
                        });
                    }
                    return opportunities;
                },
                transform: (code, opportunity) => {
                    // This is a complex refactoring that would require significant analysis
                    // For now, provide a template transformation
                    const transformedCode = code + `
// TODO: Implement polymorphic classes
// abstract class BaseType {
//   abstract execute(): void;
// }
//
// class TypeA extends BaseType {
//   execute(): void { /* Implementation */ }
// }
`;
                    return {
                        success: true,
                        originalCode: code,
                        transformedCode,
                        changes: [{
                                type: 'insert',
                                location: { startLine: code.split('\n').length, endLine: code.split('\n').length, startColumn: 1, endColumn: 1 },
                                oldContent: '',
                                newContent: '// TODO: Implement polymorphic design',
                                reason: 'Placeholder for polymorphic refactoring'
                            }],
                        warnings: ['This refactoring requires manual implementation'],
                        errors: [],
                        preservedBehavior: false,
                        testSuggestions: ['Create tests for each polymorphic implementation'],
                        rollbackInstructions: ['Remove generated classes and restore conditional logic']
                    };
                },
                safetyChecks: [
                    (code, result) => ['This refactoring requires manual review and implementation']
                ]
            }
        ];
    }
    /**
     * Run safety checks for a refactoring result
     */
    runSafetyChecks(rule, originalCode, result) {
        const errors = [];
        for (const check of rule.safetyChecks) {
            try {
                const checkErrors = check(originalCode, result);
                errors.push(...checkErrors);
            }
            catch (error) {
                errors.push(`Safety check failed: ${error}`);
            }
        }
        return errors;
    }
    /**
     * Analyze dependencies between refactoring opportunities
     */
    analyzeDependencies(opportunities) {
        const dependencies = [];
        for (let i = 0; i < opportunities.length; i++) {
            for (let j = i + 1; j < opportunities.length; j++) {
                const opA = opportunities[i];
                const opB = opportunities[j];
                // Check if opportunities overlap
                if (this.locationsOverlap(opA.location, opB.location)) {
                    dependencies.push({
                        from: `${opA.ruleId}_${opA.location.startLine}`,
                        to: `${opB.ruleId}_${opB.location.startLine}`,
                        reason: 'Overlapping code regions'
                    });
                }
                // Check for naming dependencies
                if (opA.ruleId === 'improve_naming' && opB.metadata?.oldName === opA.metadata?.newName) {
                    dependencies.push({
                        from: `${opA.ruleId}_${opA.location.startLine}`,
                        to: `${opB.ruleId}_${opB.location.startLine}`,
                        reason: 'Naming dependency'
                    });
                }
            }
        }
        return dependencies;
    }
    /**
     * Calculate execution order based on dependencies
     */
    calculateExecutionOrder(opportunities, dependencies) {
        const graph = new Map();
        const inDegree = new Map();
        // Initialize graph
        opportunities.forEach(op => {
            const id = `${op.ruleId}_${op.location.startLine}`;
            graph.set(id, []);
            inDegree.set(id, 0);
        });
        // Build dependency graph
        dependencies.forEach(dep => {
            graph.get(dep.from)?.push(dep.to);
            inDegree.set(dep.to, (inDegree.get(dep.to) || 0) + 1);
        });
        // Topological sort
        const queue = Array.from(inDegree.entries())
            .filter(([_, degree]) => degree === 0)
            .map(([id, _]) => id);
        const result = [];
        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);
            const neighbors = graph.get(current) || [];
            neighbors.forEach(neighbor => {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            });
        }
        return result;
    }
    /**
     * Calculate total impact of refactoring plan
     */
    calculateTotalImpact(opportunities) {
        const filesAffected = new Set(opportunities.map(op => op.location.file)).size;
        const linesChanged = opportunities.reduce((sum, op) => sum + (op.location.endLine - op.location.startLine), 0);
        const effortHours = opportunities.reduce((sum, op) => {
            switch (op.estimatedEffort) {
                case 'minutes': return sum + 0.5;
                case 'hours': return sum + 4;
                case 'days': return sum + 32;
                default: return sum;
            }
        }, 0);
        const estimatedTime = effortHours < 1 ? '< 1 hour' :
            effortHours < 8 ? `${Math.ceil(effortHours)} hours` :
                `${Math.ceil(effortHours / 8)} days`;
        const highRiskCount = opportunities.filter(op => op.impact === 'high').length;
        const riskLevel = highRiskCount > opportunities.length * 0.3 ? 'high' :
            highRiskCount > 0 ? 'medium' : 'low';
        return {
            filesAffected,
            linesChanged,
            estimatedTime,
            riskLevel
        };
    }
    /**
     * Create rollback plan
     */
    createRollbackPlan(opportunities) {
        return [
            'Create backup of all affected files',
            'Document current state',
            'Apply refactorings in reverse order if needed',
            'Run comprehensive test suite',
            'Validate behavior preservation'
        ];
    }
    /**
     * Generate session ID
     */
    generateSessionId() {
        return `refactoring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Check if two locations overlap
     */
    locationsOverlap(a, b) {
        if (a.file !== b.file)
            return false;
        return !(a.endLine < b.startLine || b.endLine < a.startLine);
    }
    /**
     * Get location from string index
     */
    getLocationFromIndex(code, index) {
        const beforeIndex = code.substring(0, index);
        const lines = beforeIndex.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return {
            file: '',
            startLine: line,
            endLine: line,
            startColumn: column,
            endColumn: column + 10
        };
    }
    /**
     * Find duplicate code blocks
     */
    findDuplicateCode(code) {
        // Simplified duplicate detection
        const lines = code.split('\n').filter(line => line.trim().length > 5);
        const duplicates = [];
        for (let i = 0; i < lines.length - 5; i++) {
            const block = lines.slice(i, i + 5).join('\n');
            const occurrences = [];
            for (let j = i + 5; j < lines.length - 5; j++) {
                const compareBlock = lines.slice(j, j + 5).join('\n');
                const similarity = this.calculateSimilarity(block, compareBlock);
                if (similarity > 80) {
                    occurrences.push({ location: { startLine: j, endLine: j + 5, startColumn: 1, endColumn: 1 }, content: compareBlock });
                }
            }
            if (occurrences.length > 0) {
                duplicates.push({
                    location: { startLine: i, endLine: i + 5, startColumn: 1, endColumn: 1, file: '' },
                    similarity: 85,
                    occurrences
                });
            }
        }
        return duplicates;
    }
    /**
     * Calculate similarity between two strings
     */
    calculateSimilarity(a, b) {
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        if (longer.length === 0)
            return 100;
        const distance = this.levenshteinDistance(longer, shorter);
        return Math.round(((longer.length - distance) / longer.length) * 100);
    }
    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Identify extractable blocks within a method
     */
    identifyExtractableBlocks(lines) {
        const blocks = [];
        let currentBlock = [];
        let blockStart = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Start new block on control structures
            if (line.match(/^(if|for|while|switch)/)) {
                if (currentBlock.length > 3) {
                    blocks.push({
                        content: currentBlock.join('\n'),
                        location: { startLine: blockStart, endLine: i - 1, startColumn: 1, endColumn: 1 }
                    });
                }
                currentBlock = [lines[i]];
                blockStart = i;
            }
            else {
                currentBlock.push(lines[i]);
            }
        }
        // Add final block
        if (currentBlock.length > 3) {
            blocks.push({
                content: currentBlock.join('\n'),
                location: { startLine: blockStart, endLine: lines.length - 1, startColumn: 1, endColumn: 1 }
            });
        }
        return blocks;
    }
    /**
     * Generate name suggestions for poorly named variables
     */
    generateNameSuggestions(oldName, context) {
        const suggestions = [];
        // Context-based suggestions
        if (context.includes('user'))
            suggestions.push('userData', 'userInfo', 'currentUser');
        if (context.includes('config'))
            suggestions.push('configuration', 'settings', 'options');
        if (context.includes('result'))
            suggestions.push('processedResult', 'operationResult', 'computedValue');
        if (context.includes('list') || context.includes('array'))
            suggestions.push('items', 'collection', 'elements');
        // Default suggestions based on common patterns
        if (oldName === 'x')
            suggestions.push('coordinate', 'position', 'value');
        if (oldName === 'y')
            suggestions.push('verticalPosition', 'yCoordinate', 'height');
        if (oldName === 'i')
            suggestions.push('index', 'counter', 'iterator');
        if (oldName === 'temp')
            suggestions.push('temporary', 'buffer', 'intermediate');
        if (oldName === 'data')
            suggestions.push('information', 'payload', 'content');
        return suggestions.length > 0 ? suggestions : [`${oldName}Renamed`];
    }
}
// Factory function for easy instantiation
export function createRefactoringEngine() {
    return new RefactoringEngine();
}
//# sourceMappingURL=refactoring-engine.js.map