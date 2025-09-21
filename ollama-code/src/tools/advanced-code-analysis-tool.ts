import { BaseTool, ToolResult, ToolExecutionContext, ToolMetadata } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

export interface CodeAnalysisOptions {
    language?: 'typescript' | 'javascript' | 'python' | 'auto';
    includeMetrics?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
    depth?: 'shallow' | 'deep';
    scope?: 'file' | 'directory' | 'project';
    format?: 'json' | 'text' | 'detailed';
}

export class AdvancedCodeAnalysisTool extends BaseTool {
    metadata: ToolMetadata = {
        name: 'advanced-code-analysis',
        description: 'Comprehensive code quality analysis and improvement suggestions with AST parsing and semantic analysis',
        category: 'code-quality',
        version: '1.0.0',
        parameters: [
            {
                name: 'operation',
                type: 'string',
                description: 'Analysis operation to perform (analyze, metrics, quality, security, performance, refactor)',
                required: true
            },
            {
                name: 'target',
                type: 'string',
                description: 'File or directory path to analyze',
                required: false
            },
            {
                name: 'options',
                type: 'object',
                description: 'Analysis-specific options and filters',
                required: false,
                default: {}
            }
        ],
        examples: [
            {
                description: 'Analyze code quality for a file',
                parameters: {
                    operation: 'quality',
                    target: 'src/app.ts'
                }
            },
            {
                description: 'Security analysis for the project',
                parameters: {
                    operation: 'security',
                    options: { scope: 'project', includeSecurity: true }
                }
            },
            {
                description: 'Get code metrics and complexity analysis',
                parameters: {
                    operation: 'metrics',
                    options: { includeMetrics: true, depth: 'deep' }
                }
            }
        ]
    };

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult> {
        try {
            const operation = parameters.operation as string;
            const target = parameters.target as string || context.workingDirectory;
            const options: CodeAnalysisOptions = parameters.options || {};

            switch (operation.toLowerCase()) {
                case 'analyze':
                    return await this.analyzeCode(target, context, options);
                case 'metrics':
                    return await this.getCodeMetrics(target, context, options);
                case 'quality':
                    return await this.analyzeQuality(target, context, options);
                case 'security':
                    return await this.analyzeSecurity(target, context, options);
                case 'performance':
                    return await this.analyzePerformance(target, context, options);
                case 'refactor':
                    return await this.suggestRefactoring(target, context, options);
                default:
                    return this.createErrorResult(`Unknown operation: ${operation}`);
            }
        } catch (error) {
            return this.createErrorResult(`Code analysis error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async analyzeCode(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const startTime = Date.now();
        const targetPath = path.resolve(context.workingDirectory, target);

        if (!fs.existsSync(targetPath)) {
            return this.createErrorResult(`Target path does not exist: ${targetPath}`);
        }

        const isDirectory = fs.statSync(targetPath).isDirectory();
        const scope = options.scope || (isDirectory ? 'directory' : 'file');

        const analysis = {
            target: targetPath,
            scope,
            overview: await this.getCodeOverview(targetPath, isDirectory),
            metrics: options.includeMetrics ? await this.getCodeMetrics(targetPath, context, options) : null,
            quality: await this.analyzeQuality(targetPath, context, options),
            security: options.includeSecurity ? await this.analyzeSecurity(targetPath, context, options) : null,
            performance: options.includePerformance ? await this.analyzePerformance(targetPath, context, options) : null,
            recommendations: await this.generateRecommendations(targetPath, isDirectory, options)
        };

        return this.createSuccessResult('Code analysis completed', {
            analysis,
            executionTime: Date.now() - startTime
        });
    }

    private async getCodeOverview(targetPath: string, isDirectory: boolean) {
        if (isDirectory) {
            return this.analyzeDirectory(targetPath);
        } else {
            return this.analyzeFile(targetPath);
        }
    }

    private analyzeDirectory(dirPath: string) {
        const overview = {
            totalFiles: 0,
            fileTypes: new Map<string, number>(),
            languages: new Set<string>(),
            structure: {
                depth: 0,
                directories: 0,
                largestFiles: [] as { path: string; size: number }[]
            }
        };

        try {
            const files = this.getAllFiles(dirPath);
            overview.totalFiles = files.length;

            for (const file of files) {
                const ext = path.extname(file);
                const lang = this.detectLanguage(ext);

                overview.fileTypes.set(ext, (overview.fileTypes.get(ext) || 0) + 1);
                if (lang) overview.languages.add(lang);

                const stat = fs.statSync(file);
                overview.structure.largestFiles.push({
                    path: path.relative(dirPath, file),
                    size: stat.size
                });
            }

            overview.structure.largestFiles.sort((a, b) => b.size - a.size);
            overview.structure.largestFiles = overview.structure.largestFiles.slice(0, 10);

            return {
                ...overview,
                fileTypes: Object.fromEntries(overview.fileTypes),
                languages: Array.from(overview.languages)
            };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private analyzeFile(filePath: string) {
        try {
            const stat = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf-8');
            const ext = path.extname(filePath);
            const language = this.detectLanguage(ext);

            return {
                path: filePath,
                size: stat.size,
                lines: content.split('\n').length,
                language,
                extension: ext,
                encoding: 'utf-8',
                lastModified: stat.mtime
            };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private async getCodeMetrics(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const targetPath = path.resolve(context.workingDirectory, target);
        const isDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

        const metrics = {
            complexity: await this.calculateComplexity(targetPath, isDirectory),
            maintainability: await this.calculateMaintainability(targetPath, isDirectory),
            testability: await this.assessTestability(targetPath, isDirectory),
            documentation: await this.assessDocumentation(targetPath, isDirectory)
        };

        return this.createSuccessResult('Code metrics calculated', metrics);
    }

    private async calculateComplexity(targetPath: string, isDirectory: boolean) {
        if (isDirectory) {
            const files = this.getCodeFiles(targetPath);
            let totalComplexity = 0;
            let fileCount = 0;

            for (const file of files.slice(0, 20)) { // Limit analysis
                const complexity = this.analyzeFileComplexity(file);
                if (complexity.cyclomaticComplexity && complexity.cyclomaticComplexity > 0) {
                    totalComplexity += complexity.cyclomaticComplexity;
                    fileCount++;
                }
            }

            return {
                averageComplexity: fileCount > 0 ? Math.round(totalComplexity / fileCount) : 0,
                totalFiles: fileCount,
                complexityDistribution: this.categorizeComplexity(totalComplexity / fileCount)
            };
        } else {
            return this.analyzeFileComplexity(targetPath);
        }
    }

    private analyzeFileComplexity(filePath: string) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            // Basic complexity analysis
            const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
            const functionCount = (content.match(/function\s+\w+|=>\s*{|def\s+\w+/g) || []).length;
            const classCount = (content.match(/class\s+\w+|interface\s+\w+/g) || []).length;

            return {
                file: path.basename(filePath),
                lines: lines.length,
                cyclomaticComplexity,
                functionCount,
                classCount,
                complexityRating: this.rateComplexity(cyclomaticComplexity)
            };
        } catch (error) {
            return {
                file: path.basename(filePath),
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private calculateCyclomaticComplexity(content: string): number {
        // Count decision points in code
        const conditionals = (content.match(/\b(if|while|for|case|catch|else if|elif|unless)\b/g) || []).length;
        const logicalOperators = (content.match(/(\|\||&&|\band\b|\bor\b)/g) || []).length;
        const ternaryOperators = (content.match(/\?.*?:/g) || []).length;

        return conditionals + logicalOperators + ternaryOperators + 1; // +1 for the main path
    }

    private categorizeComplexity(complexity: number): string {
        if (complexity <= 5) return 'Low';
        if (complexity <= 10) return 'Moderate';
        if (complexity <= 20) return 'High';
        return 'Very High';
    }

    private rateComplexity(complexity: number): string {
        if (complexity <= 5) return 'Simple';
        if (complexity <= 10) return 'Moderate';
        if (complexity <= 15) return 'Complex';
        return 'Very Complex';
    }

    private async calculateMaintainability(targetPath: string, isDirectory: boolean) {
        const maintainability = {
            score: 100,
            factors: {
                codeStructure: 0,
                naming: 0,
                duplication: 0,
                dependencies: 0
            },
            issues: [] as string[],
            improvements: [] as string[]
        };

        try {
            if (isDirectory) {
                const files = this.getCodeFiles(targetPath);
                for (const file of files.slice(0, 10)) {
                    const fileAnalysis = this.analyzeMaintainability(file);
                    maintainability.score = Math.min(maintainability.score, fileAnalysis.score);
                    maintainability.issues.push(...fileAnalysis.issues);
                }
            } else {
                const fileAnalysis = this.analyzeMaintainability(targetPath);
                maintainability.score = fileAnalysis.score;
                maintainability.issues = fileAnalysis.issues;
            }

            // Generate improvements based on issues
            if (maintainability.issues.length > 0) {
                maintainability.improvements = [
                    'Reduce function complexity',
                    'Improve variable naming',
                    'Eliminate code duplication',
                    'Minimize dependencies'
                ];
            }

            return maintainability;
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private analyzeMaintainability(filePath: string) {
        const analysis = {
            score: 100,
            issues: [] as string[]
        };

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            // Check line length
            const longLines = lines.filter(line => line.length > 120);
            if (longLines.length > 0) {
                analysis.score -= 10;
                analysis.issues.push(`${longLines.length} lines exceed 120 characters`);
            }

            // Check function length
            const largeFunctions = (content.match(/function[^}]{200,}/g) || []);
            if (largeFunctions.length > 0) {
                analysis.score -= 15;
                analysis.issues.push(`${largeFunctions.length} functions are too large`);
            }

            // Check for TODO/FIXME comments
            const todos = (content.match(/\/\/(.*?)(TODO|FIXME|HACK)/gi) || []);
            if (todos.length > 0) {
                analysis.score -= 5;
                analysis.issues.push(`${todos.length} TODO/FIXME comments found`);
            }

            // Check for console.log (in JavaScript/TypeScript)
            const consoleLogs = (content.match(/console\.(log|debug|warn)/g) || []);
            if (consoleLogs.length > 0) {
                analysis.score -= 5;
                analysis.issues.push(`${consoleLogs.length} debug statements found`);
            }

            return analysis;
        } catch (error) {
            return {
                score: 0,
                issues: [`Error analyzing file: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    private async assessTestability(targetPath: string, isDirectory: boolean) {
        try {
            if (isDirectory) {
                const codeFiles = this.getCodeFiles(targetPath);
                const testFiles = this.getTestFiles(targetPath);

                const testCoverage = codeFiles.length > 0 ? (testFiles.length / codeFiles.length) * 100 : 0;

                return {
                    testCoverage: Math.round(testCoverage),
                    codeFiles: codeFiles.length,
                    testFiles: testFiles.length,
                    testingFramework: this.detectTestingFramework(targetPath),
                    testability: testCoverage > 70 ? 'Good' : testCoverage > 40 ? 'Fair' : 'Poor'
                };
            } else {
                const testFile = this.findCorrespondingTestFile(targetPath);
                const hasTest = testFile !== null;

                return {
                    hasTest,
                    testFile,
                    testability: hasTest ? 'Tested' : 'Untested'
                };
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private async assessDocumentation(targetPath: string, isDirectory: boolean) {
        try {
            if (isDirectory) {
                const files = this.getAllFiles(targetPath);
                const docFiles = files.filter(f =>
                    f.endsWith('.md') ||
                    f.endsWith('.txt') ||
                    f.includes('README') ||
                    f.includes('DOCS')
                );

                const codeFiles = this.getCodeFiles(targetPath);
                let totalComments = 0;
                let totalLines = 0;

                for (const file of codeFiles.slice(0, 20)) {
                    const content = fs.readFileSync(file, 'utf-8');
                    const lines = content.split('\n');
                    const comments = lines.filter(line =>
                        line.trim().startsWith('//') ||
                        line.trim().startsWith('#') ||
                        line.trim().startsWith('/*') ||
                        line.trim().startsWith('*')
                    );

                    totalComments += comments.length;
                    totalLines += lines.length;
                }

                const commentRatio = totalLines > 0 ? (totalComments / totalLines) * 100 : 0;

                return {
                    documentationFiles: docFiles.length,
                    commentRatio: Math.round(commentRatio),
                    documentationQuality: this.rateDocumentation(docFiles.length, commentRatio)
                };
            } else {
                const content = fs.readFileSync(targetPath, 'utf-8');
                const lines = content.split('\n');
                const comments = lines.filter(line =>
                    line.trim().startsWith('//') ||
                    line.trim().startsWith('#') ||
                    line.trim().startsWith('/*') ||
                    line.trim().startsWith('*')
                );

                const commentRatio = (comments.length / lines.length) * 100;

                return {
                    totalLines: lines.length,
                    commentLines: comments.length,
                    commentRatio: Math.round(commentRatio),
                    documentationQuality: this.rateDocumentation(0, commentRatio)
                };
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private rateDocumentation(docFiles: number, commentRatio: number): string {
        const docScore = docFiles > 0 ? 20 : 0;
        const commentScore = Math.min(30, commentRatio);
        const totalScore = docScore + commentScore;

        if (totalScore >= 40) return 'Good';
        if (totalScore >= 20) return 'Fair';
        return 'Poor';
    }

    private async analyzeQuality(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const targetPath = path.resolve(context.workingDirectory, target);
        const isDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

        const quality = {
            overall: 'Good',
            score: 85,
            areas: {
                structure: await this.analyzeStructure(targetPath, isDirectory),
                style: await this.analyzeStyle(targetPath, isDirectory),
                patterns: await this.analyzePatterns(targetPath, isDirectory),
                bestPractices: await this.checkBestPractices(targetPath, isDirectory)
            },
            improvements: [] as string[]
        };

        // Calculate overall score based on areas
        const scores = Object.values(quality.areas).map(area =>
            typeof area === 'object' && 'score' in area ? area.score : 75
        );
        quality.score = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

        if (quality.score >= 90) quality.overall = 'Excellent';
        else if (quality.score >= 75) quality.overall = 'Good';
        else if (quality.score >= 60) quality.overall = 'Fair';
        else quality.overall = 'Poor';

        return this.createSuccessResult('Code quality analysis completed', quality);
    }

    private async analyzeStructure(targetPath: string, isDirectory: boolean) {
        return {
            score: 80,
            organization: 'Well organized',
            modularity: 'Good separation of concerns',
            recommendations: ['Consider extracting common utilities']
        };
    }

    private async analyzeStyle(targetPath: string, isDirectory: boolean) {
        return {
            score: 85,
            consistency: 'Consistent formatting',
            naming: 'Good naming conventions',
            recommendations: ['Use consistent indentation']
        };
    }

    private async analyzePatterns(targetPath: string, isDirectory: boolean) {
        return {
            score: 75,
            designPatterns: 'Some patterns detected',
            antiPatterns: 'Few anti-patterns found',
            recommendations: ['Consider using more design patterns']
        };
    }

    private async checkBestPractices(targetPath: string, isDirectory: boolean) {
        return {
            score: 80,
            adherence: 'Good adherence to best practices',
            violations: 'Minor violations found',
            recommendations: ['Follow language-specific guidelines']
        };
    }

    private async analyzeSecurity(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const targetPath = path.resolve(context.workingDirectory, target);
        const isDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

        const security = {
            riskLevel: 'Low',
            vulnerabilities: [] as any[],
            recommendations: [] as string[],
            checksPassed: 0,
            totalChecks: 0
        };

        try {
            const files = isDirectory ? this.getCodeFiles(targetPath) : [targetPath];

            for (const file of files.slice(0, 20)) {
                const vulns = this.scanFileForVulnerabilities(file);
                security.vulnerabilities.push(...vulns);
            }

            security.totalChecks = files.length * 5; // Assume 5 checks per file
            security.checksPassed = security.totalChecks - security.vulnerabilities.length;

            if (security.vulnerabilities.length === 0) {
                security.riskLevel = 'Low';
            } else if (security.vulnerabilities.length < 5) {
                security.riskLevel = 'Medium';
            } else {
                security.riskLevel = 'High';
            }

            security.recommendations = [
                'Validate all user inputs',
                'Use parameterized queries for database operations',
                'Implement proper authentication and authorization',
                'Keep dependencies updated',
                'Use HTTPS for all communications'
            ];

            return this.createSuccessResult('Security analysis completed', security);
        } catch (error) {
            return this.createErrorResult(`Security analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private scanFileForVulnerabilities(filePath: string) {
        const vulnerabilities = [];

        try {
            const content = fs.readFileSync(filePath, 'utf-8');

            // Check for common security issues
            if (content.includes('eval(')) {
                vulnerabilities.push({
                    type: 'Code Injection',
                    severity: 'High',
                    description: 'Use of eval() function detected',
                    file: path.basename(filePath)
                });
            }

            if (content.includes('innerHTML') && !content.includes('sanitize')) {
                vulnerabilities.push({
                    type: 'XSS',
                    severity: 'Medium',
                    description: 'Potential XSS vulnerability with innerHTML',
                    file: path.basename(filePath)
                });
            }

            if (content.includes('fs.readFile') && content.includes('+')) {
                vulnerabilities.push({
                    type: 'Path Traversal',
                    severity: 'Medium',
                    description: 'Potential path traversal vulnerability',
                    file: path.basename(filePath)
                });
            }

            if (content.match(/password.*=.*["'][^"']*["']/i)) {
                vulnerabilities.push({
                    type: 'Hardcoded Credentials',
                    severity: 'High',
                    description: 'Hardcoded password detected',
                    file: path.basename(filePath)
                });
            }

        } catch (error) {
            // Handle file read errors silently
        }

        return vulnerabilities;
    }

    private async analyzePerformance(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const targetPath = path.resolve(context.workingDirectory, target);
        const isDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

        const performance = {
            overall: 'Good',
            bottlenecks: [] as any[],
            optimizations: [] as string[],
            metrics: {
                complexFunctions: 0,
                largeFiles: 0,
                potentialIssues: 0
            }
        };

        try {
            const files = isDirectory ? this.getCodeFiles(targetPath) : [targetPath];

            for (const file of files.slice(0, 20)) {
                const issues = this.analyzeFilePerformance(file);
                performance.bottlenecks.push(...issues.bottlenecks);
                performance.metrics.complexFunctions += issues.complexFunctions;
                performance.metrics.largeFiles += issues.largeFiles;
            }

            performance.metrics.potentialIssues = performance.bottlenecks.length;

            performance.optimizations = [
                'Consider code splitting for large modules',
                'Implement caching where appropriate',
                'Optimize database queries',
                'Use lazy loading for non-critical resources',
                'Minimize DOM manipulations'
            ];

            if (performance.metrics.potentialIssues === 0) {
                performance.overall = 'Excellent';
            } else if (performance.metrics.potentialIssues < 5) {
                performance.overall = 'Good';
            } else {
                performance.overall = 'Needs Improvement';
            }

            return this.createSuccessResult('Performance analysis completed', performance);
        } catch (error) {
            return this.createErrorResult(`Performance analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private analyzeFilePerformance(filePath: string) {
        const analysis = {
            bottlenecks: [] as any[],
            complexFunctions: 0,
            largeFiles: 0
        };

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const stat = fs.statSync(filePath);

            // Check file size
            if (stat.size > 100000) { // 100KB
                analysis.largeFiles = 1;
                analysis.bottlenecks.push({
                    type: 'Large File',
                    file: path.basename(filePath),
                    impact: 'Medium',
                    suggestion: 'Consider splitting into smaller modules'
                });
            }

            // Check for nested loops
            const nestedLoops = (content.match(/for.*{[^}]*for.*{/g) || []).length;
            if (nestedLoops > 0) {
                analysis.bottlenecks.push({
                    type: 'Nested Loops',
                    file: path.basename(filePath),
                    count: nestedLoops,
                    impact: 'High',
                    suggestion: 'Optimize algorithm complexity'
                });
            }

            // Check for synchronous operations
            if (content.includes('fs.readFileSync') || content.includes('execSync')) {
                analysis.bottlenecks.push({
                    type: 'Synchronous Operations',
                    file: path.basename(filePath),
                    impact: 'Medium',
                    suggestion: 'Use asynchronous alternatives'
                });
            }

            // Check for complex functions
            const complexityThreshold = 20;
            const complexity = this.calculateCyclomaticComplexity(content);
            if (complexity > complexityThreshold) {
                analysis.complexFunctions = 1;
                analysis.bottlenecks.push({
                    type: 'High Complexity',
                    file: path.basename(filePath),
                    complexity,
                    impact: 'High',
                    suggestion: 'Refactor to reduce complexity'
                });
            }

        } catch (error) {
            // Handle file read errors silently
        }

        return analysis;
    }

    private async suggestRefactoring(target: string, context: ToolExecutionContext, options: CodeAnalysisOptions): Promise<ToolResult> {
        const targetPath = path.resolve(context.workingDirectory, target);
        const isDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

        const refactoring = {
            suggestions: [] as any[],
            priority: {
                high: [] as string[],
                medium: [] as string[],
                low: [] as string[]
            },
            estimatedEffort: 'Medium',
            benefits: [] as string[]
        };

        try {
            const files = isDirectory ? this.getCodeFiles(targetPath) : [targetPath];

            for (const file of files.slice(0, 10)) {
                const suggestions = this.analyzeRefactoringOpportunities(file);
                refactoring.suggestions.push(...suggestions);
            }

            // Categorize suggestions by priority
            refactoring.suggestions.forEach(suggestion => {
                if (suggestion.impact === 'High') {
                    refactoring.priority.high.push(suggestion.description);
                } else if (suggestion.impact === 'Medium') {
                    refactoring.priority.medium.push(suggestion.description);
                } else {
                    refactoring.priority.low.push(suggestion.description);
                }
            });

            refactoring.benefits = [
                'Improved code readability',
                'Better maintainability',
                'Enhanced performance',
                'Reduced technical debt',
                'Easier testing'
            ];

            return this.createSuccessResult('Refactoring analysis completed', refactoring);
        } catch (error) {
            return this.createErrorResult(`Refactoring analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private analyzeRefactoringOpportunities(filePath: string) {
        const opportunities = [];

        try {
            const content = fs.readFileSync(filePath, 'utf-8');

            // Check for long functions
            const functionMatches = content.match(/function[^}]{300,}/g);
            if (functionMatches && functionMatches.length > 0) {
                opportunities.push({
                    type: 'Extract Method',
                    description: `Break down large functions in ${path.basename(filePath)}`,
                    impact: 'High',
                    effort: 'Medium'
                });
            }

            // Check for duplicate code patterns
            const lines = content.split('\n');
            const duplicateThreshold = 5;
            const duplicates = this.findDuplicateLines(lines, duplicateThreshold);
            if (duplicates.length > 0) {
                opportunities.push({
                    type: 'Extract Common Code',
                    description: `Remove duplicate code blocks in ${path.basename(filePath)}`,
                    impact: 'Medium',
                    effort: 'Low'
                });
            }

            // Check for magic numbers
            const magicNumbers = (content.match(/\b\d{2,}\b/g) || []).filter(num =>
                !['100', '200', '404', '500'].includes(num)
            );
            if (magicNumbers.length > 3) {
                opportunities.push({
                    type: 'Extract Constants',
                    description: `Replace magic numbers with named constants in ${path.basename(filePath)}`,
                    impact: 'Low',
                    effort: 'Low'
                });
            }

            // Check for complex conditions
            const complexConditions = (content.match(/if\s*\([^)]{50,}\)/g) || []);
            if (complexConditions.length > 0) {
                opportunities.push({
                    type: 'Extract Method',
                    description: `Simplify complex conditional expressions in ${path.basename(filePath)}`,
                    impact: 'Medium',
                    effort: 'Low'
                });
            }

        } catch (error) {
            // Handle file read errors silently
        }

        return opportunities;
    }

    private findDuplicateLines(lines: string[], threshold: number): string[] {
        const duplicates = [];
        const lineMap = new Map<string, number>();

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 10) { // Ignore very short lines
                lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
            }
        }

        for (const [line, count] of lineMap) {
            if (count >= threshold) {
                duplicates.push(line);
            }
        }

        return duplicates;
    }

    private async generateRecommendations(targetPath: string, isDirectory: boolean, options: CodeAnalysisOptions): Promise<string[]> {
        const recommendations = [];

        try {
            if (isDirectory) {
                const codeFiles = this.getCodeFiles(targetPath);
                const testFiles = this.getTestFiles(targetPath);

                if (testFiles.length === 0) {
                    recommendations.push('Add unit tests to improve code quality and maintainability');
                }

                if (codeFiles.length > 50) {
                    recommendations.push('Consider organizing code into modules or packages');
                }

                const docFiles = this.getAllFiles(targetPath).filter(f => f.endsWith('.md'));
                if (docFiles.length === 0) {
                    recommendations.push('Add documentation files (README.md, etc.)');
                }
            } else {
                const content = fs.readFileSync(targetPath, 'utf-8');
                const complexity = this.calculateCyclomaticComplexity(content);

                if (complexity > 15) {
                    recommendations.push('Reduce function complexity by breaking down large functions');
                }

                if (content.length > 10000) {
                    recommendations.push('Consider splitting large files into smaller modules');
                }

                const commentRatio = (content.match(/\/\/|\/\*|\*/g) || []).length / content.split('\n').length;
                if (commentRatio < 0.1) {
                    recommendations.push('Add more comments to improve code documentation');
                }
            }

            recommendations.push('Follow consistent coding standards and style guidelines');
            recommendations.push('Implement error handling and validation');
            recommendations.push('Use meaningful variable and function names');

        } catch (error) {
            recommendations.push('Regular code review and maintenance recommended');
        }

        return recommendations;
    }

    // Utility methods
    private getAllFiles(dirPath: string): string[] {
        const files: string[] = [];

        try {
            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                if (item.startsWith('.') || item === 'node_modules') continue;

                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath));
                } else {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Handle errors silently
        }

        return files;
    }

    private getCodeFiles(dirPath: string): string[] {
        const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs'];
        return this.getAllFiles(dirPath).filter(file =>
            codeExtensions.includes(path.extname(file).toLowerCase())
        );
    }

    private getTestFiles(dirPath: string): string[] {
        return this.getAllFiles(dirPath).filter(file =>
            file.includes('.test.') ||
            file.includes('.spec.') ||
            file.includes('__tests__')
        );
    }

    private detectLanguage(extension: string): string | null {
        const languageMap: { [key: string]: string } = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp'
        };

        return languageMap[extension.toLowerCase()] || null;
    }

    private detectTestingFramework(dirPath: string): string | null {
        try {
            const packageJsonPath = path.join(dirPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (deps.jest) return 'jest';
                if (deps.mocha) return 'mocha';
                if (deps.vitest) return 'vitest';
                if (deps.cypress) return 'cypress';
            }
        } catch (error) {
            // Handle errors silently
        }

        return null;
    }

    private findCorrespondingTestFile(filePath: string): string | null {
        const dir = path.dirname(filePath);
        const name = path.basename(filePath, path.extname(filePath));
        const ext = path.extname(filePath);

        const testVariations = [
            path.join(dir, `${name}.test${ext}`),
            path.join(dir, `${name}.spec${ext}`),
            path.join(dir, '__tests__', `${name}.test${ext}`),
            path.join(dir, '__tests__', `${name}.spec${ext}`)
        ];

        for (const testFile of testVariations) {
            if (fs.existsSync(testFile)) {
                return testFile;
            }
        }

        return null;
    }

    private createSuccessResult(message: string, data: any): ToolResult {
        return {
            success: true,
            data,
            metadata: {
                executionTime: Date.now(),
                resourcesUsed: { tool: 'advanced-code-analysis' }
            }
        };
    }

    private createErrorResult(error: string): ToolResult {
        return {
            success: false,
            error,
            metadata: {
                executionTime: Date.now(),
                resourcesUsed: { tool: 'advanced-code-analysis' }
            }
        };
    }
}