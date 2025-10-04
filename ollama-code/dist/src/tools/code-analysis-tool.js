/**
 * CodeAnalysisTool - Advanced Code Quality and Analysis
 *
 * Provides comprehensive code analysis including:
 * - AST-based syntax analysis for multiple languages
 * - Code quality metrics and complexity analysis
 * - Refactoring suggestions and best practices
 * - Security vulnerability detection
 * - Performance bottleneck identification
 * - Code style and formatting analysis
 * - Dependency analysis and suggestions
 */
import { BaseTool } from './base-tool.js';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Advanced code analysis and quality assessment tool
 */
export class CodeAnalysisTool extends BaseTool {
    name = 'code-analysis';
    description = 'Comprehensive code quality analysis and improvement suggestions';
    analysisCache = new Map();
    supportedLanguages = new Set([
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala',
        'html', 'css', 'json', 'yaml', 'markdown'
    ]);
    async execute(operation, context, options = {}) {
        try {
            const workingDir = context.workingDirectory || process.cwd();
            switch (operation.toLowerCase()) {
                case 'analyze':
                case 'full':
                    return await this.performFullAnalysis(workingDir, options);
                case 'metrics':
                    return await this.analyzeMetrics(workingDir, options);
                case 'quality':
                    return await this.analyzeQuality(workingDir, options);
                case 'security':
                    return await this.analyzeSecurity(workingDir, options);
                case 'performance':
                    return await this.analyzePerformance(workingDir, options);
                case 'refactor':
                    return await this.suggestRefactoring(workingDir, options);
                case 'duplicates':
                    return await this.findDuplicateCode(workingDir, options);
                case 'dependencies':
                    return await this.analyzeDependencies(workingDir, options);
                case 'file':
                    if (context.additionalData?.filePath) {
                        return await this.analyzeFile(context.additionalData.filePath, options);
                    }
                    return {
                        success: false,
                        error: 'File path required for file analysis'
                    };
                default:
                    return {
                        success: false,
                        error: `Unknown analysis operation: ${operation}. Available: analyze, metrics, quality, security, performance, refactor, duplicates, dependencies, file`
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Code analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Perform comprehensive code analysis
     */
    async performFullAnalysis(workingDir, options) {
        const startTime = Date.now();
        try {
            // Get all code files
            const files = await this.getCodeFiles(workingDir, options);
            if (files.length === 0) {
                return {
                    success: true,
                    data: {
                        message: 'No code files found for analysis',
                        summary: { totalFiles: 0, totalLines: 0, analysisTime: 0, overallScore: 0, languages: {} }
                    }
                };
            }
            // Analyze each file
            const fileMetrics = {};
            const allIssues = [];
            const allRefactoringSuggestions = [];
            const allSecurityVulnerabilities = [];
            for (const file of files) {
                // Calculate metrics
                const metrics = await this.calculateFileMetrics(file);
                fileMetrics[file.path] = metrics;
                // Find issues
                const issues = await this.findCodeIssues(file, options);
                allIssues.push(...issues);
                // Generate refactoring suggestions
                if (options.analysisDepth !== 'basic') {
                    const suggestions = await this.generateRefactoringSuggestions(file, metrics);
                    allRefactoringSuggestions.push(...suggestions);
                }
                // Security analysis
                if (options.includeSecurity !== false) {
                    const vulnerabilities = await this.findSecurityVulnerabilities(file);
                    allSecurityVulnerabilities.push(...vulnerabilities);
                }
            }
            // Analyze duplicates
            const duplicateCode = await this.findDuplicateCodeBlocks(files);
            // Analyze dependencies
            const dependencies = await this.analyzeDependencyStructure(files);
            // Calculate overall score
            const overallScore = this.calculateOverallScore(fileMetrics, allIssues, allSecurityVulnerabilities);
            // Generate summary
            const languages = this.calculateLanguageDistribution(files);
            const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
            const result = {
                summary: {
                    totalFiles: files.length,
                    totalLines,
                    analysisTime: Date.now() - startTime,
                    overallScore,
                    languages
                },
                files,
                metrics: fileMetrics,
                issues: allIssues,
                refactoringSuggestions: allRefactoringSuggestions,
                securityVulnerabilities: allSecurityVulnerabilities,
                duplicateCode,
                dependencies
            };
            return {
                success: true,
                data: result,
                metadata: {
                    operation: 'full_analysis',
                    timestamp: new Date(),
                    workingDirectory: workingDir,
                    options
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Full analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze code metrics
     */
    async analyzeMetrics(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const metrics = {};
            for (const file of files) {
                metrics[file.path] = await this.calculateFileMetrics(file);
            }
            // Aggregate metrics
            const aggregated = this.aggregateMetrics(Object.values(metrics));
            return {
                success: true,
                data: {
                    files: metrics,
                    aggregated,
                    summary: {
                        totalFiles: files.length,
                        averageComplexity: aggregated.cyclomaticComplexity / files.length,
                        totalLinesOfCode: aggregated.linesOfCode
                    }
                },
                metadata: {
                    operation: 'metrics',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Metrics analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze code quality issues
     */
    async analyzeQuality(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const allIssues = [];
            for (const file of files) {
                const issues = await this.findCodeIssues(file, options);
                allIssues.push(...issues);
            }
            // Categorize issues
            const byCategory = this.categorizeIssues(allIssues);
            const bySeverity = this.categorizeIssuesBySeverity(allIssues);
            return {
                success: true,
                data: {
                    issues: allIssues,
                    summary: {
                        total: allIssues.length,
                        byCategory,
                        bySeverity,
                        autoFixable: allIssues.filter(i => i.autoFixable).length
                    }
                },
                metadata: {
                    operation: 'quality',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Quality analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze security vulnerabilities
     */
    async analyzeSecurity(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const vulnerabilities = [];
            for (const file of files) {
                const fileVulns = await this.findSecurityVulnerabilities(file);
                vulnerabilities.push(...fileVulns);
            }
            // Categorize by severity
            const bySeverity = {
                critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                high: vulnerabilities.filter(v => v.severity === 'high').length,
                medium: vulnerabilities.filter(v => v.severity === 'medium').length,
                low: vulnerabilities.filter(v => v.severity === 'low').length
            };
            return {
                success: true,
                data: {
                    vulnerabilities,
                    summary: {
                        total: vulnerabilities.length,
                        bySeverity,
                        criticalFiles: [...new Set(vulnerabilities.filter(v => v.severity === 'critical').map(v => v.file))]
                    }
                },
                metadata: {
                    operation: 'security',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Security analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze performance issues
     */
    async analyzePerformance(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const performanceIssues = [];
            for (const file of files) {
                const issues = await this.findPerformanceIssues(file);
                performanceIssues.push(...issues);
            }
            return {
                success: true,
                data: {
                    issues: performanceIssues,
                    summary: {
                        total: performanceIssues.length,
                        highImpact: performanceIssues.filter(i => i.severity === 'high').length,
                        easyFixes: performanceIssues.filter(i => i.autoFixable).length
                    }
                },
                metadata: {
                    operation: 'performance',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Performance analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Generate refactoring suggestions
     */
    async suggestRefactoring(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const suggestions = [];
            for (const file of files) {
                const metrics = await this.calculateFileMetrics(file);
                const fileSuggestions = await this.generateRefactoringSuggestions(file, metrics);
                suggestions.push(...fileSuggestions);
            }
            // Prioritize suggestions
            const prioritized = suggestions.sort((a, b) => {
                const impactScore = { high: 3, medium: 2, low: 1 };
                const effortScore = { easy: 3, moderate: 2, complex: 1 };
                const scoreA = impactScore[a.impact] * effortScore[a.effort];
                const scoreB = impactScore[b.impact] * effortScore[b.effort];
                return scoreB - scoreA;
            });
            return {
                success: true,
                data: {
                    suggestions: prioritized,
                    summary: {
                        total: suggestions.length,
                        highImpact: suggestions.filter(s => s.impact === 'high').length,
                        easyWins: suggestions.filter(s => s.effort === 'easy').length
                    }
                },
                metadata: {
                    operation: 'refactor',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Refactoring analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Find duplicate code
     */
    async findDuplicateCode(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const duplicates = await this.findDuplicateCodeBlocks(files);
            return {
                success: true,
                data: {
                    duplicates,
                    summary: {
                        totalBlocks: duplicates.blocks.length,
                        totalLines: duplicates.blocks.reduce((sum, block) => sum + block.lines, 0),
                        filesAffected: new Set(duplicates.blocks.flatMap(b => b.files)).size
                    }
                },
                metadata: {
                    operation: 'duplicates',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Duplicate code analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze dependencies
     */
    async analyzeDependencies(workingDir, options) {
        try {
            const files = await this.getCodeFiles(workingDir, options);
            const dependencies = await this.analyzeDependencyStructure(files);
            return {
                success: true,
                data: {
                    dependencies,
                    summary: {
                        external: dependencies.external.length,
                        internal: dependencies.internal.length,
                        circular: dependencies.circular.length,
                        unused: dependencies.unused.length
                    }
                },
                metadata: {
                    operation: 'dependencies',
                    timestamp: new Date()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Dependency analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Analyze single file
     */
    async analyzeFile(filePath, options) {
        try {
            if (!fs.existsSync(filePath)) {
                return {
                    success: false,
                    error: `File not found: ${filePath}`
                };
            }
            const file = await this.createCodeFile(filePath);
            const metrics = await this.calculateFileMetrics(file);
            const issues = await this.findCodeIssues(file, options);
            const suggestions = await this.generateRefactoringSuggestions(file, metrics);
            const vulnerabilities = await this.findSecurityVulnerabilities(file);
            return {
                success: true,
                data: {
                    file,
                    metrics,
                    issues,
                    suggestions,
                    vulnerabilities,
                    score: this.calculateFileScore(metrics, issues, vulnerabilities)
                },
                metadata: {
                    operation: 'file_analysis',
                    timestamp: new Date(),
                    filePath
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `File analysis failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    // Helper methods
    async getCodeFiles(workingDir, options) {
        const files = [];
        const maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB default
        const excludePatterns = options.excludePatterns || [
            'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt'
        ];
        const walkDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(workingDir, fullPath);
                // Skip excluded patterns
                if (excludePatterns.some(pattern => relativePath.includes(pattern))) {
                    continue;
                }
                if (entry.isDirectory()) {
                    walkDir(fullPath);
                }
                else if (entry.isFile()) {
                    const language = this.detectLanguage(fullPath);
                    if (this.supportedLanguages.has(language)) {
                        const stats = fs.statSync(fullPath);
                        if (stats.size <= maxFileSize) {
                            try {
                                const content = fs.readFileSync(fullPath, 'utf-8');
                                const lines = content.split('\n').length;
                                files.push({
                                    path: relativePath,
                                    language,
                                    content,
                                    size: stats.size,
                                    lines,
                                    lastModified: stats.mtime
                                });
                            }
                            catch {
                                // Skip files that can't be read
                            }
                        }
                    }
                }
            }
        };
        walkDir(workingDir);
        return files;
    }
    async createCodeFile(filePath) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;
        const language = this.detectLanguage(filePath);
        return {
            path: filePath,
            language,
            content,
            size: stats.size,
            lines,
            lastModified: stats.mtime
        };
    }
    detectLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const extensionMap = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.cc': 'cpp',
            '.cxx': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.scala': 'scala',
            '.html': 'html',
            '.htm': 'html',
            '.css': 'css',
            '.scss': 'css',
            '.sass': 'css',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown'
        };
        return extensionMap[ext] || 'unknown';
    }
    async calculateFileMetrics(file) {
        const lines = file.content.split('\n');
        let linesOfCode = 0;
        let linesOfComments = 0;
        let linesBlank = 0;
        let todoComments = 0;
        // Basic line counting
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                linesBlank++;
            }
            else if (this.isCommentLine(trimmed, file.language)) {
                linesOfComments++;
                if (trimmed.toLowerCase().includes('todo')) {
                    todoComments++;
                }
            }
            else {
                linesOfCode++;
            }
        }
        // Language-specific analysis
        const functions = this.countFunctions(file);
        const classes = this.countClasses(file);
        const methods = this.countMethods(file);
        const variables = this.countVariables(file);
        const imports = this.countImports(file);
        const exports = this.countExports(file);
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(file);
        const duplicateLines = this.countDuplicateLines(file);
        return {
            cyclomaticComplexity,
            linesOfCode,
            linesOfComments,
            linesBlank,
            functions,
            classes,
            methods,
            variables,
            imports,
            exports,
            todoComments,
            duplicateLines
        };
    }
    isCommentLine(line, language) {
        const commentPatterns = {
            javascript: [/^\/\//, /^\/\*/, /^\*/],
            typescript: [/^\/\//, /^\/\*/, /^\*/],
            python: [/^#/],
            java: [/^\/\//, /^\/\*/, /^\*/],
            cpp: [/^\/\//, /^\/\*/, /^\*/],
            c: [/^\/\//, /^\/\*/, /^\*/],
            css: [/^\/\*/, /^\*/],
            html: [/^<!--/]
        };
        const patterns = commentPatterns[language] || [];
        return patterns.some(pattern => pattern.test(line));
    }
    countFunctions(file) {
        const patterns = {
            javascript: [/function\s+\w+/, /const\s+\w+\s*=\s*\(/, /\w+\s*:\s*function/, /\w+\s*\(/],
            typescript: [/function\s+\w+/, /const\s+\w+\s*=\s*\(/, /\w+\s*:\s*function/, /\w+\s*\(/],
            python: [/def\s+\w+/],
            java: [/\w+\s+\w+\s*\(/],
            cpp: [/\w+\s+\w+\s*\(/],
            go: [/func\s+\w+/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countClasses(file) {
        const patterns = {
            javascript: [/class\s+\w+/],
            typescript: [/class\s+\w+/, /interface\s+\w+/],
            python: [/class\s+\w+/],
            java: [/class\s+\w+/, /interface\s+\w+/],
            cpp: [/class\s+\w+/, /struct\s+\w+/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countMethods(file) {
        // Methods are functions inside classes
        const patterns = {
            javascript: [/\w+\s*\(/],
            typescript: [/\w+\s*\(/],
            python: [/def\s+\w+/],
            java: [/\w+\s+\w+\s*\(/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countVariables(file) {
        const patterns = {
            javascript: [/let\s+\w+/, /const\s+\w+/, /var\s+\w+/],
            typescript: [/let\s+\w+/, /const\s+\w+/, /var\s+\w+/],
            python: [/\w+\s*=/, /^\s*\w+\s*:/],
            java: [/\w+\s+\w+\s*[=;]/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countImports(file) {
        const patterns = {
            javascript: [/import\s+/, /require\s*\(/],
            typescript: [/import\s+/, /require\s*\(/],
            python: [/import\s+/, /from\s+\w+\s+import/],
            java: [/import\s+/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countExports(file) {
        const patterns = {
            javascript: [/export\s+/, /module\.exports/],
            typescript: [/export\s+/, /module\.exports/],
            python: [/__all__\s*=/]
        };
        return this.countMatches(file, patterns[file.language] || []);
    }
    countMatches(file, patterns) {
        let count = 0;
        const lines = file.content.split('\n');
        for (const line of lines) {
            for (const pattern of patterns) {
                if (pattern.test(line)) {
                    count++;
                    break; // Only count once per line
                }
            }
        }
        return count;
    }
    calculateCyclomaticComplexity(file) {
        // Simplified cyclomatic complexity calculation
        const complexityPatterns = [
            /if\s*\(/, /else\s+if/, /while\s*\(/, /for\s*\(/,
            /switch\s*\(/, /case\s+/, /catch\s*\(/, /\?\s*:/,
            /&&/, /\|\|/
        ];
        let complexity = 1; // Base complexity
        for (const pattern of complexityPatterns) {
            const matches = file.content.match(new RegExp(pattern.source, 'g'));
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    countDuplicateLines(file) {
        const lines = file.content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !this.isCommentLine(line, file.language));
        const lineCount = new Map();
        for (const line of lines) {
            lineCount.set(line, (lineCount.get(line) || 0) + 1);
        }
        return Array.from(lineCount.values()).filter(count => count > 1).length;
    }
    async findCodeIssues(file, options) {
        const issues = [];
        // Check for common code issues
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            // Long lines
            if (line.length > 120) {
                issues.push({
                    type: 'warning',
                    category: 'style',
                    message: 'Line exceeds recommended length (120 characters)',
                    file: file.path,
                    line: lineNumber,
                    severity: 'low',
                    suggestion: 'Break long line into multiple lines',
                    autoFixable: false
                });
            }
            // Trailing whitespace
            if (line.endsWith(' ') || line.endsWith('\t')) {
                issues.push({
                    type: 'warning',
                    category: 'style',
                    message: 'Trailing whitespace',
                    file: file.path,
                    line: lineNumber,
                    severity: 'low',
                    suggestion: 'Remove trailing whitespace',
                    autoFixable: true
                });
            }
            // TODO comments
            if (line.toLowerCase().includes('todo')) {
                issues.push({
                    type: 'info',
                    category: 'maintainability',
                    message: 'TODO comment found',
                    file: file.path,
                    line: lineNumber,
                    severity: 'low',
                    suggestion: 'Address TODO or create issue',
                    autoFixable: false
                });
            }
            // Console.log statements (JavaScript/TypeScript)
            if ((file.language === 'javascript' || file.language === 'typescript') &&
                /console\.(log|warn|error)/.test(line)) {
                issues.push({
                    type: 'warning',
                    category: 'maintainability',
                    message: 'Console statement found',
                    file: file.path,
                    line: lineNumber,
                    severity: 'medium',
                    suggestion: 'Use proper logging library or remove',
                    autoFixable: false
                });
            }
        }
        return issues;
    }
    async findSecurityVulnerabilities(file) {
        const vulnerabilities = [];
        // Basic security pattern matching
        const securityPatterns = {
            hardcodedPassword: {
                pattern: /password\s*=\s*['"][^'"]+['"]/i,
                type: 'Hardcoded Password',
                severity: 'high',
                cwe: 'CWE-798',
                mitigation: 'Use environment variables or secure credential storage'
            },
            sqlInjection: {
                pattern: /SELECT\s+.*\+.*FROM/i,
                type: 'Potential SQL Injection',
                severity: 'critical',
                cwe: 'CWE-89',
                mitigation: 'Use parameterized queries or prepared statements'
            },
            eval: {
                pattern: /eval\s*\(/,
                type: 'Use of eval()',
                severity: 'high',
                cwe: 'CWE-94',
                mitigation: 'Avoid eval() and use safer alternatives'
            },
            xss: {
                pattern: /innerHTML\s*=.*\+/,
                type: 'Potential XSS Vulnerability',
                severity: 'medium',
                cwe: 'CWE-79',
                mitigation: 'Sanitize user input or use textContent instead'
            }
        };
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            for (const [key, pattern] of Object.entries(securityPatterns)) {
                if (pattern.pattern.test(line)) {
                    vulnerabilities.push({
                        type: pattern.type,
                        severity: pattern.severity,
                        description: `${pattern.type} detected in line ${lineNumber}`,
                        file: file.path,
                        line: lineNumber,
                        cwe: pattern.cwe,
                        mitigation: pattern.mitigation
                    });
                }
            }
        }
        return vulnerabilities;
    }
    async findPerformanceIssues(file) {
        const issues = [];
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            // Nested loops
            if (/for\s*\(.*for\s*\(/.test(line)) {
                issues.push({
                    type: 'warning',
                    category: 'performance',
                    message: 'Nested loops detected - potential performance issue',
                    file: file.path,
                    line: lineNumber,
                    severity: 'medium',
                    suggestion: 'Consider algorithm optimization or data structure changes',
                    autoFixable: false
                });
            }
            // Synchronous file operations (Node.js)
            if (/fs\.(readFileSync|writeFileSync)/.test(line)) {
                issues.push({
                    type: 'warning',
                    category: 'performance',
                    message: 'Synchronous file operation',
                    file: file.path,
                    line: lineNumber,
                    severity: 'medium',
                    suggestion: 'Use async file operations for better performance',
                    autoFixable: false
                });
            }
        }
        return issues;
    }
    async generateRefactoringSuggestions(file, metrics) {
        const suggestions = [];
        // Complex function suggestions
        if (metrics.cyclomaticComplexity > 10) {
            suggestions.push({
                type: 'extract_function',
                description: 'Break down complex function into smaller functions',
                file: file.path,
                startLine: 1,
                endLine: file.lines,
                impact: 'high',
                effort: 'moderate',
                benefits: ['Improved readability', 'Better testability', 'Reduced complexity']
            });
        }
        // Long file suggestions
        if (file.lines > 500) {
            suggestions.push({
                type: 'move',
                description: 'Consider splitting large file into multiple modules',
                file: file.path,
                startLine: 1,
                endLine: file.lines,
                impact: 'medium',
                effort: 'complex',
                benefits: ['Better organization', 'Improved maintainability']
            });
        }
        // Too many variables
        if (metrics.variables > 50) {
            suggestions.push({
                type: 'extract_variable',
                description: 'Consider extracting some variables into configuration objects',
                file: file.path,
                startLine: 1,
                endLine: file.lines,
                impact: 'low',
                effort: 'easy',
                benefits: ['Better organization', 'Reduced namespace pollution']
            });
        }
        return suggestions;
    }
    async findDuplicateCodeBlocks(files) {
        const blocks = [];
        // Simple duplicate detection based on line similarity
        const lineMap = new Map();
        for (const file of files) {
            const lines = file.content.split('\n')
                .map(line => line.trim())
                .filter(line => line && !this.isCommentLine(line, file.language));
            for (const line of lines) {
                if (!lineMap.has(line)) {
                    lineMap.set(line, []);
                }
                lineMap.get(line).push(file.path);
            }
        }
        // Find lines that appear in multiple files
        for (const [line, filePaths] of lineMap) {
            if (filePaths.length > 1) {
                blocks.push({
                    files: [...new Set(filePaths)],
                    lines: 1,
                    similarity: 1.0
                });
            }
        }
        return { blocks: blocks.slice(0, 50) }; // Limit to top 50 duplicates
    }
    async analyzeDependencyStructure(files) {
        const external = [];
        const internal = [];
        const dependencies = new Map();
        for (const file of files) {
            const fileDeps = this.extractDependencies(file);
            dependencies.set(file.path, fileDeps);
            for (const dep of fileDeps) {
                if (dep.startsWith('./') || dep.startsWith('../')) {
                    internal.push(dep);
                }
                else if (!dep.startsWith('/')) {
                    external.push(dep);
                }
            }
        }
        // Detect circular dependencies (simplified)
        const circular = [];
        // This would require more sophisticated graph analysis
        return {
            external: [...new Set(external)],
            internal: [...new Set(internal)],
            circular,
            unused: [] // Would require more analysis to detect
        };
    }
    extractDependencies(file) {
        const deps = [];
        const lines = file.content.split('\n');
        for (const line of lines) {
            // JavaScript/TypeScript imports
            const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                deps.push(importMatch[1]);
            }
            // Require statements
            const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
            if (requireMatch) {
                deps.push(requireMatch[1]);
            }
            // Python imports
            const pythonImportMatch = line.match(/from\s+(\w+)\s+import/);
            if (pythonImportMatch) {
                deps.push(pythonImportMatch[1]);
            }
        }
        return deps;
    }
    calculateOverallScore(metrics, issues, vulnerabilities) {
        let score = 100;
        // Deduct for issues
        const criticalIssues = issues.filter(i => i.severity === 'critical').length;
        const highIssues = issues.filter(i => i.severity === 'high').length;
        const mediumIssues = issues.filter(i => i.severity === 'medium').length;
        const lowIssues = issues.filter(i => i.severity === 'low').length;
        score -= criticalIssues * 20;
        score -= highIssues * 10;
        score -= mediumIssues * 5;
        score -= lowIssues * 2;
        // Deduct for security vulnerabilities
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium').length;
        score -= criticalVulns * 25;
        score -= highVulns * 15;
        score -= mediumVulns * 8;
        // Deduct for complexity
        const avgComplexity = Object.values(metrics).reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / Object.keys(metrics).length;
        if (avgComplexity > 10) {
            score -= (avgComplexity - 10) * 2;
        }
        return Math.max(0, Math.min(100, score));
    }
    calculateFileScore(metrics, issues, vulnerabilities) {
        return this.calculateOverallScore({ file: metrics }, issues, vulnerabilities);
    }
    calculateLanguageDistribution(files) {
        const distribution = {};
        for (const file of files) {
            distribution[file.language] = (distribution[file.language] || 0) + 1;
        }
        return distribution;
    }
    aggregateMetrics(metrics) {
        return metrics.reduce((total, current) => ({
            cyclomaticComplexity: total.cyclomaticComplexity + current.cyclomaticComplexity,
            linesOfCode: total.linesOfCode + current.linesOfCode,
            linesOfComments: total.linesOfComments + current.linesOfComments,
            linesBlank: total.linesBlank + current.linesBlank,
            functions: total.functions + current.functions,
            classes: total.classes + current.classes,
            methods: total.methods + current.methods,
            variables: total.variables + current.variables,
            imports: total.imports + current.imports,
            exports: total.exports + current.exports,
            todoComments: total.todoComments + current.todoComments,
            duplicateLines: total.duplicateLines + current.duplicateLines
        }), {
            cyclomaticComplexity: 0,
            linesOfCode: 0,
            linesOfComments: 0,
            linesBlank: 0,
            functions: 0,
            classes: 0,
            methods: 0,
            variables: 0,
            imports: 0,
            exports: 0,
            todoComments: 0,
            duplicateLines: 0
        });
    }
    categorizeIssues(issues) {
        const categories = {};
        for (const issue of issues) {
            categories[issue.category] = (categories[issue.category] || 0) + 1;
        }
        return categories;
    }
    categorizeIssuesBySeverity(issues) {
        const severities = {};
        for (const issue of issues) {
            severities[issue.severity] = (severities[issue.severity] || 0) + 1;
        }
        return severities;
    }
}
//# sourceMappingURL=code-analysis-tool.js.map