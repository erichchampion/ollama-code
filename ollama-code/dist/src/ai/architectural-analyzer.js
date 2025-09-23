/**
 * Architectural Analyzer
 *
 * Advanced architectural pattern detection and analysis system for identifying
 * design patterns, code smells, and architectural improvements in codebases.
 */
import { logger } from '../utils/logger.js';
export class ArchitecturalAnalyzer {
    patterns = [];
    constructor() {
        this.initializePatterns();
    }
    /**
     * Analyze codebase for architectural patterns and issues
     */
    async analyzeCodebase(files) {
        const startTime = Date.now();
        logger.info('Starting architectural analysis', { fileCount: files.length });
        const findings = [];
        const detectedPatterns = new Set();
        // Analyze each file
        for (const file of files) {
            const fileFindings = await this.analyzeFile(file.path, file.content);
            findings.push(...fileFindings);
            fileFindings.forEach(finding => detectedPatterns.add(finding.patternId));
        }
        // Build dependency graph
        const dependencyGraph = this.buildDependencyGraph(files);
        // Calculate metrics
        const metrics = this.calculateArchitecturalMetrics(files, dependencyGraph);
        // Generate recommendations
        const recommendations = this.generateRecommendations(findings, dependencyGraph, metrics);
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(findings, metrics);
        const report = {
            timestamp: new Date(),
            summary: {
                totalFindings: findings.length,
                criticalIssues: findings.filter(f => f.severity === 'error').length,
                warnings: findings.filter(f => f.severity === 'warning').length,
                suggestions: findings.filter(f => f.severity === 'info').length,
                qualityScore
            },
            findings,
            patterns: {
                detected: Array.from(detectedPatterns),
                missing: this.identifyMissingPatterns(files, Array.from(detectedPatterns)),
                recommended: this.recommendPatterns(files, metrics)
            },
            recommendations,
            metrics
        };
        logger.info('Architectural analysis completed', {
            duration: Date.now() - startTime,
            findings: findings.length,
            qualityScore
        });
        return report;
    }
    /**
     * Analyze a single file for architectural patterns
     */
    async analyzeFile(filePath, content) {
        const findings = [];
        const lines = content.split('\n');
        for (const pattern of this.patterns) {
            if (pattern.pattern instanceof RegExp) {
                const matches = content.matchAll(new RegExp(pattern.pattern, 'gm'));
                for (const match of matches) {
                    const location = this.getLocationFromMatch(match, lines);
                    const confidence = this.calculatePatternConfidence(pattern, content, match);
                    if (confidence > 0.3) { // Threshold for reporting
                        findings.push({
                            patternId: pattern.id,
                            patternName: pattern.name,
                            category: pattern.category,
                            severity: pattern.severity,
                            location: {
                                file: filePath,
                                line: location.line,
                                column: location.column,
                                length: match[0].length
                            },
                            message: pattern.description,
                            recommendation: pattern.recommendation,
                            context: this.getContext(lines, location.line),
                            confidence
                        });
                    }
                }
            }
            else if (typeof pattern.pattern === 'function') {
                const isMatch = pattern.pattern(content);
                if (isMatch) {
                    findings.push({
                        patternId: pattern.id,
                        patternName: pattern.name,
                        category: pattern.category,
                        severity: pattern.severity,
                        location: {
                            file: filePath,
                            line: 1,
                            column: 1,
                            length: 0
                        },
                        message: pattern.description,
                        recommendation: pattern.recommendation,
                        context: 'File-level pattern',
                        confidence: 0.8
                    });
                }
            }
        }
        return findings;
    }
    /**
     * Build dependency graph for architectural analysis
     */
    buildDependencyGraph(files) {
        const nodes = [];
        const edges = [];
        // Extract components and their dependencies
        for (const file of files) {
            const component = this.extractComponent(file.path, file.content);
            if (component) {
                nodes.push(component);
                // Create edges for dependencies
                component.dependencies.forEach(dep => {
                    edges.push({
                        from: component.name,
                        to: dep,
                        type: 'depends_on',
                        weight: 1
                    });
                });
            }
        }
        // Identify architectural layers
        const layers = this.identifyArchitecturalLayers(nodes, edges);
        // Detect architectural violations
        const violations = this.detectArchitecturalViolations(nodes, edges, layers);
        return { nodes, edges, layers, violations };
    }
    /**
     * Calculate architectural metrics
     */
    calculateArchitecturalMetrics(files, graph) {
        const codeComplexity = this.calculateCodeComplexity(files);
        const maintainabilityIndex = this.calculateMaintainabilityIndex(files, graph);
        const technicalDebt = this.calculateTechnicalDebt(files);
        return {
            codeComplexity,
            maintainabilityIndex,
            technicalDebt
        };
    }
    /**
     * Initialize architectural patterns for detection
     */
    initializePatterns() {
        this.patterns = [
            // Design Patterns
            {
                id: 'singleton_pattern',
                name: 'Singleton Pattern',
                description: 'Singleton pattern detected',
                pattern: /class\s+\w+\s*{[^}]*private\s+static\s+\w+[^}]*getInstance\s*\(/s,
                category: 'design_pattern',
                severity: 'info',
                recommendation: 'Consider dependency injection for better testability'
            },
            {
                id: 'factory_pattern',
                name: 'Factory Pattern',
                description: 'Factory pattern detected',
                pattern: /class\s+\w*Factory\w*|function\s+create\w+|\.create\w+\s*\(/,
                category: 'design_pattern',
                severity: 'info'
            },
            {
                id: 'observer_pattern',
                name: 'Observer Pattern',
                description: 'Observer pattern detected',
                pattern: /(addEventListener|on\w+|subscribe|notify|emit)/,
                category: 'design_pattern',
                severity: 'info'
            },
            {
                id: 'strategy_pattern',
                name: 'Strategy Pattern',
                description: 'Strategy pattern detected',
                pattern: /interface\s+\w*Strategy\w*|class\s+\w*Strategy\w*/,
                category: 'design_pattern',
                severity: 'info'
            },
            // Code Smells
            {
                id: 'god_class',
                name: 'God Class',
                description: 'Class with too many responsibilities detected',
                pattern: (code) => {
                    const classMatch = code.match(/class\s+\w+\s*{([\s\S]*?)}/);
                    if (classMatch) {
                        const classBody = classMatch[1];
                        const methodCount = (classBody.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
                        const lineCount = classBody.split('\n').length;
                        return methodCount > 20 || lineCount > 500;
                    }
                    return false;
                },
                category: 'code_smell',
                severity: 'warning',
                recommendation: 'Break down class into smaller, more focused classes'
            },
            {
                id: 'long_method',
                name: 'Long Method',
                description: 'Method with too many lines detected',
                pattern: (code) => {
                    const methods = code.matchAll(/(\w+\s*\([^)]*\)\s*{)([\s\S]*?)(?=\n\s*})/g);
                    for (const method of methods) {
                        const lineCount = method[2].split('\n').length;
                        if (lineCount > 50)
                            return true;
                    }
                    return false;
                },
                category: 'code_smell',
                severity: 'warning',
                recommendation: 'Extract method functionality into smaller methods'
            },
            {
                id: 'duplicate_code',
                name: 'Duplicate Code',
                description: 'Similar code blocks detected',
                pattern: (code) => {
                    const lines = code.split('\n').filter(line => line.trim().length > 10);
                    const duplicates = new Set();
                    for (let i = 0; i < lines.length - 5; i++) {
                        const block = lines.slice(i, i + 5).join('\n');
                        const remainingLines = lines.slice(i + 5);
                        if (remainingLines.some(line => line.includes(block.split('\n')[0]))) {
                            duplicates.add(block);
                        }
                    }
                    return duplicates.size > 0;
                },
                category: 'code_smell',
                severity: 'warning',
                recommendation: 'Extract common code into reusable functions or classes'
            },
            // Anti-patterns
            {
                id: 'callback_hell',
                name: 'Callback Hell',
                description: 'Deeply nested callbacks detected',
                pattern: /callback\s*\([^)]*\)\s*{\s*[^}]*callback\s*\([^)]*\)\s*{\s*[^}]*callback/s,
                category: 'anti_pattern',
                severity: 'error',
                recommendation: 'Use Promises or async/await to flatten callback chains'
            },
            {
                id: 'magic_numbers',
                name: 'Magic Numbers',
                description: 'Hardcoded numeric literals detected',
                pattern: /(?<![a-zA-Z_$])[0-9]{2,}(?![a-zA-Z_$])/g,
                category: 'code_smell',
                severity: 'info',
                recommendation: 'Replace magic numbers with named constants'
            },
            {
                id: 'global_variables',
                name: 'Global Variables',
                description: 'Global variable usage detected',
                pattern: /(var|let|const)\s+[A-Z_][A-Z0-9_]*\s*=/,
                category: 'anti_pattern',
                severity: 'warning',
                recommendation: 'Encapsulate global state in modules or classes'
            },
            // Security Issues
            {
                id: 'hardcoded_credentials',
                name: 'Hardcoded Credentials',
                description: 'Potential hardcoded credentials detected',
                pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
                category: 'code_smell',
                severity: 'error',
                recommendation: 'Use environment variables or secure credential storage'
            },
            {
                id: 'eval_usage',
                name: 'Eval Usage',
                description: 'Use of eval() function detected',
                pattern: /\beval\s*\(/,
                category: 'anti_pattern',
                severity: 'error',
                recommendation: 'Avoid eval() - use safer alternatives like JSON.parse()'
            }
        ];
    }
    /**
     * Calculate pattern confidence based on context
     */
    calculatePatternConfidence(pattern, code, match) {
        let confidence = 0.5; // Base confidence
        // Adjust confidence based on pattern type and context
        if (pattern.category === 'design_pattern') {
            // Higher confidence for well-formed patterns
            if (match[0].includes('class') && match[0].includes('interface')) {
                confidence += 0.3;
            }
        }
        else if (pattern.category === 'code_smell') {
            // Context-aware confidence for code smells
            const context = this.getExtendedContext(code, match.index || 0);
            if (context.includes('TODO') || context.includes('FIXME')) {
                confidence += 0.2;
            }
        }
        return Math.min(confidence, 1.0);
    }
    /**
     * Get location information from regex match
     */
    getLocationFromMatch(match, lines) {
        const beforeMatch = match.input?.substring(0, match.index) || '';
        const lineNumber = beforeMatch.split('\n').length;
        const column = beforeMatch.split('\n').pop()?.length || 0;
        return { line: lineNumber, column: column + 1 };
    }
    /**
     * Get context around a finding
     */
    getContext(lines, lineNumber) {
        const start = Math.max(0, lineNumber - 3);
        const end = Math.min(lines.length, lineNumber + 2);
        return lines.slice(start, end).join('\n');
    }
    /**
     * Get extended context for confidence calculation
     */
    getExtendedContext(code, index) {
        const start = Math.max(0, index - 200);
        const end = Math.min(code.length, index + 200);
        return code.substring(start, end);
    }
    /**
     * Extract component information from file
     */
    extractComponent(filePath, content) {
        // Extract class/module name
        const classMatch = content.match(/(?:class|interface|module)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
        const functionMatch = content.match(/(?:function|export\s+function)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
        const name = classMatch?.[1] || functionMatch?.[1] || filePath.split('/').pop()?.replace(/\.[^.]*$/, '') || 'unknown';
        // Extract dependencies (imports and usages)
        const dependencies = this.extractDependencies(content);
        // Calculate coupling and cohesion
        const coupling = dependencies.length;
        const cohesion = this.calculateCohesion(content);
        return {
            name,
            type: classMatch ? 'class' : functionMatch ? 'function' : 'module',
            dependencies,
            dependents: [], // Will be populated later
            coupling,
            cohesion
        };
    }
    /**
     * Extract dependencies from code
     */
    extractDependencies(content) {
        const dependencies = new Set();
        // Import statements
        const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
            dependencies.add(match[1]);
        }
        // Require statements
        const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const match of requireMatches) {
            dependencies.add(match[1]);
        }
        return Array.from(dependencies);
    }
    /**
     * Calculate cohesion metric for a component
     */
    calculateCohesion(content) {
        // Simple cohesion calculation based on shared variables/methods
        const variables = content.match(/(?:let|const|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g) || [];
        const methods = content.match(/(?:function|[A-Za-z_$][A-Za-z0-9_$]*\s*\()/g) || [];
        if (variables.length === 0 || methods.length === 0)
            return 0;
        // Count how many methods use each variable
        let sharedUsage = 0;
        variables.forEach(variable => {
            const varName = variable.split(/\s+/)[1];
            const usageCount = (content.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length - 1;
            if (usageCount > 1)
                sharedUsage++;
        });
        return sharedUsage / variables.length;
    }
    /**
     * Identify architectural layers
     */
    identifyArchitecturalLayers(nodes, edges) {
        // Simple layer identification based on naming conventions and dependencies
        const layers = [
            { name: 'Presentation', components: nodes.filter(n => n.name.toLowerCase().includes('view') ||
                    n.name.toLowerCase().includes('component') ||
                    n.name.toLowerCase().includes('ui')).map(n => n.name) },
            { name: 'Business Logic', components: nodes.filter(n => n.name.toLowerCase().includes('service') ||
                    n.name.toLowerCase().includes('logic') ||
                    n.name.toLowerCase().includes('manager')).map(n => n.name) },
            { name: 'Data Access', components: nodes.filter(n => n.name.toLowerCase().includes('repository') ||
                    n.name.toLowerCase().includes('dao') ||
                    n.name.toLowerCase().includes('data')).map(n => n.name) }
        ];
        return layers.filter(layer => layer.components.length > 0);
    }
    /**
     * Detect architectural violations
     */
    detectArchitecturalViolations(nodes, edges, layers) {
        const violations = [];
        // Check for circular dependencies
        const cycles = this.findCircularDependencies(edges);
        if (cycles.length > 0) {
            violations.push({
                type: 'circular_dependency',
                description: 'Circular dependencies detected',
                components: cycles.flat()
            });
        }
        // Check for layer violations (lower layers depending on higher layers)
        for (const edge of edges) {
            const fromLayer = layers.find(l => l.components.includes(edge.from));
            const toLayer = layers.find(l => l.components.includes(edge.to));
            if (fromLayer && toLayer) {
                const fromIndex = layers.indexOf(fromLayer);
                const toIndex = layers.indexOf(toLayer);
                if (fromIndex > toIndex) {
                    violations.push({
                        type: 'layer_violation',
                        description: `${fromLayer.name} layer depends on ${toLayer.name} layer`,
                        components: [edge.from, edge.to]
                    });
                }
            }
        }
        return violations;
    }
    /**
     * Find circular dependencies in the dependency graph
     */
    findCircularDependencies(edges) {
        const graph = new Map();
        // Build adjacency list
        edges.forEach(edge => {
            if (!graph.has(edge.from))
                graph.set(edge.from, []);
            graph.get(edge.from).push(edge.to);
        });
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        const dfs = (node, path) => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                if (recursionStack.has(neighbor)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(neighbor);
                    cycles.push(path.slice(cycleStart));
                }
                else if (!visited.has(neighbor)) {
                    dfs(neighbor, [...path]);
                }
            }
            recursionStack.delete(node);
        };
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }
        return cycles;
    }
    /**
     * Calculate overall code complexity
     */
    calculateCodeComplexity(files) {
        let totalComplexity = 0;
        let totalLines = 0;
        for (const file of files) {
            const lines = file.content.split('\n').length;
            totalLines += lines;
            // Simple complexity calculation based on control structures
            const controlStructures = (file.content.match(/\b(if|for|while|switch|catch)\b/g) || []).length;
            const nestedStructures = (file.content.match(/\s{4,}(if|for|while)\b/g) || []).length;
            totalComplexity += controlStructures + (nestedStructures * 2);
        }
        return totalLines > 0 ? totalComplexity / totalLines * 100 : 0;
    }
    /**
     * Calculate maintainability index
     */
    calculateMaintainabilityIndex(files, graph) {
        // Simplified maintainability index calculation
        const avgCoupling = graph.nodes.reduce((sum, node) => sum + node.coupling, 0) / graph.nodes.length;
        const avgCohesion = graph.nodes.reduce((sum, node) => sum + node.cohesion, 0) / graph.nodes.length;
        const violations = graph.violations.length;
        let index = 100;
        index -= avgCoupling * 5; // Penalty for high coupling
        index += avgCohesion * 10; // Bonus for high cohesion
        index -= violations * 10; // Penalty for violations
        return Math.max(0, Math.min(100, index));
    }
    /**
     * Calculate technical debt
     */
    calculateTechnicalDebt(files) {
        let debtScore = 0;
        for (const file of files) {
            // Count code smells and anti-patterns
            const todos = (file.content.match(/TODO|FIXME|HACK/gi) || []).length;
            const longLines = file.content.split('\n').filter(line => line.length > 120).length;
            const complexMethods = (file.content.match(/function[^{]*{[^}]{500,}}/gs) || []).length;
            debtScore += todos * 1 + longLines * 0.5 + complexMethods * 5;
        }
        return debtScore;
    }
    /**
     * Generate architectural recommendations
     */
    generateRecommendations(findings, graph, metrics) {
        const recommendations = [];
        // High-priority recommendations based on critical findings
        const criticalFindings = findings.filter(f => f.severity === 'error');
        if (criticalFindings.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Security',
                description: 'Address critical security and anti-pattern issues',
                impact: 'Prevents security vulnerabilities and improves code safety',
                effort: 'medium'
            });
        }
        // Architecture recommendations based on violations
        if (graph.violations.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Architecture',
                description: 'Resolve architectural violations and circular dependencies',
                impact: 'Improves maintainability and reduces coupling',
                effort: 'high'
            });
        }
        // Maintainability recommendations
        if (metrics.maintainabilityIndex < 60) {
            recommendations.push({
                priority: 'medium',
                category: 'Maintainability',
                description: 'Refactor code to improve maintainability index',
                impact: 'Easier code maintenance and development velocity',
                effort: 'medium'
            });
        }
        // Technical debt recommendations
        if (metrics.technicalDebt > 50) {
            recommendations.push({
                priority: 'medium',
                category: 'Technical Debt',
                description: 'Address accumulated technical debt',
                impact: 'Improved code quality and development speed',
                effort: 'high'
            });
        }
        return recommendations;
    }
    /**
     * Identify missing beneficial patterns
     */
    identifyMissingPatterns(files, detected) {
        const missing = [];
        // Check for error handling patterns
        if (!detected.includes('error_handling') &&
            files.some(f => f.content.includes('throw') || f.content.includes('catch'))) {
            missing.push('Comprehensive error handling strategy');
        }
        // Check for logging patterns
        if (!detected.includes('logging') &&
            !files.some(f => f.content.includes('console.log') || f.content.includes('logger'))) {
            missing.push('Structured logging system');
        }
        // Check for testing patterns
        if (!files.some(f => f.path.includes('test') || f.path.includes('spec'))) {
            missing.push('Comprehensive test coverage');
        }
        return missing;
    }
    /**
     * Recommend patterns based on codebase analysis
     */
    recommendPatterns(files, metrics) {
        const recommendations = [];
        if (metrics.codeComplexity > 15) {
            recommendations.push('Strategy Pattern for complex conditionals');
        }
        if (metrics.maintainabilityIndex < 60) {
            recommendations.push('Dependency Injection for better testability');
            recommendations.push('Repository Pattern for data access');
        }
        if (files.length > 50) {
            recommendations.push('Module Pattern for better organization');
            recommendations.push('Facade Pattern for simplified interfaces');
        }
        return recommendations;
    }
    /**
     * Calculate overall quality score
     */
    calculateQualityScore(findings, metrics) {
        let score = 100;
        // Penalty for findings
        const criticalPenalty = findings.filter(f => f.severity === 'error').length * 15;
        const warningPenalty = findings.filter(f => f.severity === 'warning').length * 5;
        const infoPenalty = findings.filter(f => f.severity === 'info').length * 1;
        score -= criticalPenalty + warningPenalty + infoPenalty;
        // Factor in maintainability index
        score = (score + metrics.maintainabilityIndex) / 2;
        // Penalty for high complexity
        if (metrics.codeComplexity > 20) {
            score -= (metrics.codeComplexity - 20) * 2;
        }
        // Penalty for technical debt
        score -= Math.min(metrics.technicalDebt / 10, 20);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
// Factory function for easy instantiation
export function createArchitecturalAnalyzer() {
    return new ArchitecturalAnalyzer();
}
//# sourceMappingURL=architectural-analyzer.js.map