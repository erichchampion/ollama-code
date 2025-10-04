"use strict";
/**
 * Performance Analyzer
 *
 * Advanced performance analysis system for detecting bottlenecks, inefficiencies,
 * and optimization opportunities in codebases with algorithm complexity analysis.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
exports.createPerformanceAnalyzer = createPerformanceAnalyzer;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_js_1 = require("../utils/logger.js");
const gitignore_parser_js_1 = require("../utils/gitignore-parser.js");
const file_patterns_js_1 = require("../config/file-patterns.js");
class PerformanceAnalyzer {
    constructor() {
        this.rules = [];
        this.loadDefaultRules();
    }
    /**
     * Analyze a project for performance issues
     */
    async analyzeProject(projectPath, options = {}) {
        const startTime = Date.now();
        const { includePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.vue', '**/*.py', '**/*.java'], excludePatterns = (0, file_patterns_js_1.getDefaultExcludePatterns)(), respectGitIgnore = true, analyzeComplexity = true, analyzeBundleSize = true, checkMemoryLeaks = true, severityThreshold = 'info', maxFileSize = 2 * 1024 * 1024, // 2MB
        projectRoot = projectPath } = options;
        logger_js_1.logger.info(`Starting performance analysis of project: ${projectPath}`);
        const issues = [];
        let totalLinesAnalyzed = 0;
        const complexityData = [];
        // Get files to analyze
        const files = await this.getFilesToAnalyze(projectPath, includePatterns, excludePatterns, respectGitIgnore, projectRoot);
        logger_js_1.logger.info(`Analyzing ${files.length} files for performance issues`);
        // Analyze each file
        let analyzedFiles = 0;
        for (const filePath of files) {
            try {
                const stats = await fs_1.promises.stat(filePath);
                if (stats.size > maxFileSize) {
                    logger_js_1.logger.debug(`Skipping large file: ${filePath} (${stats.size} bytes)`);
                    continue;
                }
                const fileAnalysis = await this.analyzeFile(filePath, {
                    severityThreshold,
                    analyzeComplexity,
                    checkMemoryLeaks
                });
                issues.push(...fileAnalysis.issues);
                totalLinesAnalyzed += fileAnalysis.linesOfCode;
                if (fileAnalysis.complexity) {
                    complexityData.push({
                        file: filePath,
                        complexity: fileAnalysis.complexity,
                        lines: fileAnalysis.linesOfCode
                    });
                }
                analyzedFiles++;
                if (analyzedFiles % 50 === 0) {
                    logger_js_1.logger.debug(`Analyzed ${analyzedFiles}/${files.length} files`);
                }
            }
            catch (error) {
                logger_js_1.logger.warn(`Failed to analyze file ${filePath}:`, error);
            }
        }
        // Bundle analysis
        let bundleAnalysis;
        if (analyzeBundleSize) {
            try {
                bundleAnalysis = await this.analyzeBundleSize(projectPath);
            }
            catch (error) {
                logger_js_1.logger.warn('Failed to analyze bundle size:', error);
            }
        }
        const result = {
            summary: this.createSummary(issues, analyzedFiles, totalLinesAnalyzed, complexityData),
            issues: this.sortIssues(issues),
            bundleAnalysis,
            complexityMetrics: this.calculateComplexityMetrics(complexityData),
            executionTime: Date.now() - startTime,
            timestamp: new Date(),
            projectPath
        };
        logger_js_1.logger.info(`Performance analysis completed: ${result.summary.issues} issues found in ${result.executionTime}ms`);
        return result;
    }
    /**
     * Analyze a single file for performance issues
     */
    async analyzeFile(filePath, options) {
        const issues = [];
        try {
            const content = await fs_1.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
            const fileExtension = path_1.default.extname(filePath);
            const applicableRules = this.getApplicableRules(fileExtension);
            // Analyze complexity if requested
            let complexity;
            if (options.analyzeComplexity) {
                complexity = this.calculateCyclomaticComplexity(content);
            }
            for (const rule of applicableRules) {
                if (!this.meetsSeverityThreshold(rule.severity, options.severityThreshold)) {
                    continue;
                }
                const matches = content.matchAll(new RegExp(rule.pattern.source, 'gm'));
                for (const match of matches) {
                    if (match.index === undefined)
                        continue;
                    // Find line and column
                    const beforeMatch = content.substring(0, match.index);
                    const lineNumber = beforeMatch.split('\n').length;
                    const lineStart = beforeMatch.lastIndexOf('\n') + 1;
                    const columnNumber = match.index - lineStart + 1;
                    // Additional validation if provided
                    if (rule.validator && !rule.validator(match, content, filePath)) {
                        continue;
                    }
                    // Calculate metrics if analyzer provided
                    let metrics;
                    if (rule.complexityAnalyzer) {
                        metrics = rule.complexityAnalyzer(match, content);
                    }
                    const issue = {
                        id: `${rule.id}_${path_1.default.basename(filePath)}_${lineNumber}`,
                        title: rule.name,
                        description: rule.description,
                        severity: rule.severity,
                        category: rule.category,
                        file: filePath,
                        line: lineNumber,
                        column: columnNumber,
                        code: lines[lineNumber - 1]?.trim() || '',
                        recommendation: rule.recommendation,
                        estimatedImpact: rule.estimatedImpact,
                        confidence: rule.confidence,
                        metrics
                    };
                    issues.push(issue);
                }
            }
            return { issues, linesOfCode, complexity };
        }
        catch (error) {
            logger_js_1.logger.error(`Error analyzing file ${filePath}:`, error);
            return { issues: [], linesOfCode: 0 };
        }
    }
    /**
     * Load default performance rules
     */
    loadDefaultRules() {
        this.rules = [
            // Algorithm complexity issues
            {
                id: 'nested_loops',
                name: 'Nested Loops Detected',
                description: 'Multiple nested loops that may cause O(n²) or higher complexity',
                severity: 'medium',
                category: 'algorithm',
                pattern: /for\s*\([^}]*\{[^}]*for\s*\(/gs,
                filePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java'],
                confidence: 'high',
                recommendation: 'Consider optimizing with better algorithms, caching, or data structures',
                estimatedImpact: 'High performance impact with large datasets',
                complexityAnalyzer: (match, code) => ({
                    timeComplexity: 'O(n²) or higher',
                    estimatedExecution: 'Exponential growth with input size'
                })
            },
            {
                id: 'inefficient_search',
                name: 'Inefficient Array Search',
                description: 'Linear search in arrays that could use more efficient methods',
                severity: 'medium',
                category: 'algorithm',
                pattern: /\.find\s*\(|\.filter\s*\(.*\.length\s*>\s*0|\.indexOf\s*\([^)]+\)\s*>\s*-1/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'medium',
                recommendation: 'Use Map/Set for lookups, or binary search for sorted arrays',
                estimatedImpact: 'Performance degrades linearly with array size',
                complexityAnalyzer: () => ({
                    timeComplexity: 'O(n)',
                    recommendation: 'Consider O(1) lookups with Map/Set'
                })
            },
            // Memory-related issues
            {
                id: 'memory_leak_listener',
                name: 'Potential Memory Leak - Event Listeners',
                description: 'Event listeners added without corresponding removal',
                severity: 'high',
                category: 'memory',
                pattern: /addEventListener\s*\(.*\)/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'medium',
                recommendation: 'Ensure event listeners are removed with removeEventListener',
                estimatedImpact: 'Memory usage grows over time',
                validator: (match, code) => {
                    // Check if there's a corresponding removeEventListener
                    const removePattern = /removeEventListener/;
                    return !removePattern.test(code);
                }
            },
            {
                id: 'large_array_operations',
                name: 'Large Array Operations',
                description: 'Operations on large arrays that could be optimized',
                severity: 'medium',
                category: 'memory',
                pattern: /\.map\s*\(.*\.map\s*\(|\.sort\s*\(.*\.reverse\s*\(/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'medium',
                recommendation: 'Chain operations efficiently or use streaming for large datasets',
                estimatedImpact: 'High memory usage and processing time'
            },
            // I/O related issues
            {
                id: 'synchronous_file_ops',
                name: 'Synchronous File Operations',
                description: 'Blocking file operations that can freeze the application',
                severity: 'high',
                category: 'io',
                pattern: /fs\.(readFileSync|writeFileSync|existsSync|statSync)/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'high',
                recommendation: 'Use asynchronous file operations (fs.promises or async/await)',
                estimatedImpact: 'Blocks event loop and reduces application responsiveness'
            },
            {
                id: 'missing_file_streaming',
                name: 'Large File Processing',
                description: 'Reading large files into memory instead of streaming',
                severity: 'medium',
                category: 'io',
                pattern: /fs\.readFile\s*\([^)]*\)(?!.*stream)/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'low',
                recommendation: 'Use streams for large file processing to reduce memory usage',
                estimatedImpact: 'High memory usage when processing large files'
            },
            // Network related issues
            {
                id: 'sequential_requests',
                name: 'Sequential Network Requests',
                description: 'Sequential async operations that could be parallelized',
                severity: 'medium',
                category: 'network',
                pattern: /await\s+fetch[^;]*;\s*await\s+fetch/gs,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'high',
                recommendation: 'Use Promise.all() or Promise.allSettled() for parallel requests',
                estimatedImpact: 'Unnecessary waiting time for independent operations'
            },
            {
                id: 'missing_request_timeout',
                name: 'Missing Request Timeout',
                description: 'Network requests without timeout configuration',
                severity: 'medium',
                category: 'network',
                pattern: /fetch\s*\([^)]*\)(?!.*timeout|.*AbortController)/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'medium',
                recommendation: 'Add timeout handling to prevent hanging requests',
                estimatedImpact: 'Potential for hanging requests and resource exhaustion'
            },
            // Database related issues
            {
                id: 'n_plus_one_query',
                name: 'Potential N+1 Query Problem',
                description: 'Database queries inside loops that could cause N+1 problem',
                severity: 'high',
                category: 'database',
                pattern: /for\s*\([^}]*\{[^}]*(query|find|select|get)[^}]*\}/gs,
                filePatterns: ['**/*.js', '**/*.ts', '**/*.py'],
                confidence: 'medium',
                recommendation: 'Use batch queries, joins, or eager loading to reduce database calls',
                estimatedImpact: 'Exponential increase in database load'
            },
            {
                id: 'missing_db_indexes',
                name: 'Potential Missing Database Index',
                description: 'Database queries on unindexed fields',
                severity: 'medium',
                category: 'database',
                pattern: /WHERE\s+[^=]*=|ORDER\s+BY\s+[^,\s]+/gi,
                filePatterns: ['**/*.sql', '**/*.js', '**/*.ts'],
                confidence: 'low',
                recommendation: 'Ensure database indexes exist for frequently queried fields',
                estimatedImpact: 'Slow query performance and high database load'
            },
            // Rendering issues (frontend)
            {
                id: 'expensive_render',
                name: 'Expensive Render Operations',
                description: 'Complex calculations or operations in render methods',
                severity: 'medium',
                category: 'rendering',
                pattern: /render\s*\([^)]*\)\s*\{[^}]*(for\s*\(|while\s*\(|\.map\s*\([^}]*\.map)/gs,
                filePatterns: ['**/*.jsx', '**/*.tsx', '**/*.vue'],
                confidence: 'medium',
                recommendation: 'Move expensive operations to useMemo, useCallback, or computed properties',
                estimatedImpact: 'Poor user experience due to slow rendering'
            },
            {
                id: 'missing_key_prop',
                name: 'Missing Key Prop in Lists',
                description: 'List rendering without key prop causes inefficient re-renders',
                severity: 'medium',
                category: 'rendering',
                pattern: /\.map\s*\([^}]*<[^>]+(?!.*key=)/gs,
                filePatterns: ['**/*.jsx', '**/*.tsx'],
                confidence: 'high',
                recommendation: 'Add unique key prop to list items for efficient re-rendering',
                estimatedImpact: 'Inefficient DOM updates and poor performance'
            },
            // Concurrency issues
            {
                id: 'race_condition',
                name: 'Potential Race Condition',
                description: 'Async operations that may cause race conditions',
                severity: 'medium',
                category: 'concurrency',
                pattern: /(?:let|var)\s+(\w+)\s*=.*await.*[^;]*;[^}]*\1\s*=/gs,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'low',
                recommendation: 'Use proper synchronization mechanisms or atomic operations',
                estimatedImpact: 'Unpredictable behavior and data corruption'
            },
            // Bundle size issues
            {
                id: 'large_bundle_import',
                name: 'Large Library Import',
                description: 'Importing entire libraries instead of specific functions',
                severity: 'medium',
                category: 'bundle',
                pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"](?:lodash|moment|rxjs)['"]/g,
                filePatterns: ['**/*.js', '**/*.ts'],
                confidence: 'high',
                recommendation: 'Import only specific functions to reduce bundle size',
                estimatedImpact: 'Increased bundle size and slower application loading'
            },
            // Python-specific performance issues
            {
                id: 'inefficient_string_concat',
                name: 'Inefficient String Concatenation',
                description: 'String concatenation in loops (Python)',
                severity: 'medium',
                category: 'algorithm',
                pattern: /for\s+\w+\s+in\s+[^:]+:\s*[^}]*\+=.*str/gs,
                filePatterns: ['**/*.py'],
                confidence: 'high',
                recommendation: 'Use list comprehension and join() for efficient string building',
                estimatedImpact: 'O(n²) time complexity for string operations'
            },
            {
                id: 'global_variable_access',
                name: 'Global Variable Access in Loop',
                description: 'Accessing global variables inside loops (Python)',
                severity: 'low',
                category: 'algorithm',
                pattern: /for\s+\w+\s+in\s+[^:]+:\s*[^}]*global\s+\w+/gs,
                filePatterns: ['**/*.py'],
                confidence: 'medium',
                recommendation: 'Cache global variables in local scope for better performance',
                estimatedImpact: 'Slower variable access due to global scope lookups'
            }
        ];
        logger_js_1.logger.info(`Loaded ${this.rules.length} performance rules`);
    }
    /**
     * Calculate cyclomatic complexity of code
     */
    calculateCyclomaticComplexity(code) {
        // Count decision points (simplified McCabe complexity)
        const patterns = [
            /\bif\b/g,
            /\belse\b/g,
            /\bwhile\b/g,
            /\bfor\b/g,
            /\bswitch\b/g,
            /\bcase\b/g,
            /\bcatch\b/g,
            /\b&&\b/g,
            /\b\|\|\b/g,
            /\?/g
        ];
        let complexity = 1; // Base complexity
        for (const pattern of patterns) {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    /**
     * Analyze bundle size and dependencies
     */
    async analyzeBundleSize(projectPath) {
        const analysis = {
            totalSize: 0,
            largeFiles: [],
            duplicateDependencies: [],
            unusedDependencies: [],
            recommendations: []
        };
        try {
            // Analyze package.json
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            const packageJson = JSON.parse(await fs_1.promises.readFile(packageJsonPath, 'utf8'));
            // Check for large dependencies
            const largeDependencies = ['moment', 'lodash', 'axios', 'react', 'vue', 'angular'];
            for (const dep of largeDependencies) {
                if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
                    analysis.recommendations.push(`Consider ${dep} alternatives or tree-shaking for smaller bundle`);
                }
            }
            // Find large files
            const findLargeFiles = async (dir) => {
                const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(dir, entry.name);
                    if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
                        await findLargeFiles(fullPath);
                    }
                    else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
                        const stats = await fs_1.promises.stat(fullPath);
                        if (stats.size > 100 * 1024) { // Files larger than 100KB
                            analysis.largeFiles.push({
                                file: path_1.default.relative(projectPath, fullPath),
                                size: stats.size,
                                type: path_1.default.extname(entry.name)
                            });
                        }
                        analysis.totalSize += stats.size;
                    }
                }
            };
            await findLargeFiles(path_1.default.join(projectPath, 'src'));
            // Sort large files by size
            analysis.largeFiles.sort((a, b) => b.size - a.size);
        }
        catch (error) {
            logger_js_1.logger.debug('Bundle analysis failed:', error);
        }
        return analysis;
    }
    /**
     * Get files to analyze based on patterns and filters
     */
    async getFilesToAnalyze(projectPath, includePatterns, excludePatterns, respectGitIgnore, projectRoot) {
        const files = [];
        const gitIgnoreParser = respectGitIgnore ? (0, gitignore_parser_js_1.getGitIgnoreParser)(projectRoot) : null;
        const walkDirectory = async (dir) => {
            const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                const relativePath = path_1.default.relative(projectPath, fullPath);
                // Check gitignore
                if (gitIgnoreParser && gitIgnoreParser.isIgnored(fullPath)) {
                    continue;
                }
                // Check exclude patterns
                if (excludePatterns.some(pattern => this.matchesPattern(relativePath, pattern))) {
                    continue;
                }
                if (entry.isDirectory()) {
                    await walkDirectory(fullPath);
                }
                else if (entry.isFile()) {
                    // Check include patterns
                    if (includePatterns.some(pattern => this.matchesPattern(relativePath, pattern))) {
                        files.push(fullPath);
                    }
                }
            }
        };
        await walkDirectory(projectPath);
        return files;
    }
    /**
     * Check if a pattern matches a file path
     */
    matchesPattern(filePath, pattern) {
        const regex = new RegExp(pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.'));
        return regex.test(filePath);
    }
    /**
     * Get applicable rules for a file type
     */
    getApplicableRules(fileExtension) {
        return this.rules.filter(rule => rule.filePatterns.some(pattern => pattern.includes('*' + fileExtension) || pattern === '**/*'));
    }
    /**
     * Check if severity meets threshold
     */
    meetsSeverityThreshold(severity, threshold) {
        const levels = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        return levels[severity] >= levels[threshold];
    }
    /**
     * Sort issues by severity and impact
     */
    sortIssues(issues) {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        const confidenceOrder = { high: 2, medium: 1, low: 0 };
        return issues.sort((a, b) => {
            const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
            if (severityDiff !== 0)
                return severityDiff;
            return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        });
    }
    /**
     * Calculate complexity metrics
     */
    calculateComplexityMetrics(complexityData) {
        if (complexityData.length === 0) {
            return {
                averageTimeComplexity: 'N/A',
                averageSpaceComplexity: 'N/A',
                highComplexityFiles: []
            };
        }
        const avgComplexity = complexityData.reduce((sum, data) => sum + data.complexity, 0) / complexityData.length;
        const highComplexityFiles = complexityData
            .filter(data => data.complexity > 10)
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, 10)
            .map(data => ({
            file: data.file,
            complexity: `${data.complexity}`,
            linesOfCode: data.lines
        }));
        return {
            averageTimeComplexity: this.getComplexityCategory(avgComplexity),
            averageSpaceComplexity: 'O(1) - O(n)', // Simplified estimate
            highComplexityFiles
        };
    }
    /**
     * Get complexity category from numeric value
     */
    getComplexityCategory(complexity) {
        if (complexity <= 5)
            return 'Low (≤5)';
        if (complexity <= 10)
            return 'Medium (6-10)';
        if (complexity <= 20)
            return 'High (11-20)';
        return 'Very High (>20)';
    }
    /**
     * Create summary statistics
     */
    createSummary(issues, totalFiles, totalLinesAnalyzed, complexityData) {
        const summary = {
            totalFiles,
            issues: issues.length,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            infoCount: 0,
            averageComplexity: 'N/A',
            totalLinesAnalyzed
        };
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    summary.criticalCount++;
                    break;
                case 'high':
                    summary.highCount++;
                    break;
                case 'medium':
                    summary.mediumCount++;
                    break;
                case 'low':
                    summary.lowCount++;
                    break;
                case 'info':
                    summary.infoCount++;
                    break;
            }
        }
        if (complexityData.length > 0) {
            const avgComplexity = complexityData.reduce((sum, data) => sum + data.complexity, 0) / complexityData.length;
            summary.averageComplexity = this.getComplexityCategory(avgComplexity);
        }
        return summary;
    }
    /**
     * Generate performance report
     */
    generateReport(result) {
        const lines = [
            '# Performance Analysis Report',
            `Generated: ${result.timestamp.toISOString()}`,
            `Project: ${result.projectPath}`,
            `Analysis Time: ${result.executionTime}ms`,
            '',
            '## Summary',
            `- **Files Analyzed**: ${result.summary.totalFiles}`,
            `- **Lines of Code**: ${result.summary.totalLinesAnalyzed.toLocaleString()}`,
            `- **Total Issues**: ${result.summary.issues}`,
            `- **Critical**: ${result.summary.criticalCount}`,
            `- **High**: ${result.summary.highCount}`,
            `- **Medium**: ${result.summary.mediumCount}`,
            `- **Low**: ${result.summary.lowCount}`,
            `- **Average Complexity**: ${result.summary.averageComplexity}`,
            '',
            '## Complexity Analysis',
            `- **Average Time Complexity**: ${result.complexityMetrics.averageTimeComplexity}`,
            `- **Average Space Complexity**: ${result.complexityMetrics.averageSpaceComplexity}`,
            ''
        ];
        // High complexity files
        if (result.complexityMetrics.highComplexityFiles.length > 0) {
            lines.push('### High Complexity Files');
            lines.push('| File | Complexity | Lines of Code |');
            lines.push('|------|------------|---------------|');
            for (const file of result.complexityMetrics.highComplexityFiles) {
                lines.push(`| ${path_1.default.basename(file.file)} | ${file.complexity} | ${file.linesOfCode} |`);
            }
            lines.push('');
        }
        // Issues by category
        const byCategory = new Map();
        for (const issue of result.issues) {
            if (!byCategory.has(issue.category)) {
                byCategory.set(issue.category, []);
            }
            byCategory.get(issue.category).push(issue);
        }
        lines.push('## Performance Issues by Category', '');
        for (const [category, issues] of byCategory) {
            if (issues.length > 0) {
                lines.push(`### ${category.toUpperCase()} (${issues.length})`);
                lines.push('');
                for (const issue of issues.slice(0, 5)) { // Show top 5 per category
                    lines.push(`**${issue.title}** (${path_1.default.basename(issue.file)}:${issue.line})`);
                    lines.push(`- Severity: ${issue.severity}`);
                    lines.push(`- Impact: ${issue.estimatedImpact}`);
                    lines.push(`- Recommendation: ${issue.recommendation}`);
                    if (issue.metrics?.timeComplexity) {
                        lines.push(`- Time Complexity: ${issue.metrics.timeComplexity}`);
                    }
                    lines.push('');
                }
                if (issues.length > 5) {
                    lines.push(`... and ${issues.length - 5} more ${category} issues`);
                    lines.push('');
                }
            }
        }
        // Bundle analysis
        if (result.bundleAnalysis) {
            lines.push('## Bundle Analysis', '');
            lines.push(`- **Total Size**: ${(result.bundleAnalysis.totalSize / 1024).toFixed(1)} KB`);
            if (result.bundleAnalysis.largeFiles.length > 0) {
                lines.push('- **Large Files**:');
                for (const file of result.bundleAnalysis.largeFiles.slice(0, 5)) {
                    lines.push(`  - ${file.file}: ${(file.size / 1024).toFixed(1)} KB`);
                }
            }
            if (result.bundleAnalysis.recommendations.length > 0) {
                lines.push('- **Recommendations**:');
                for (const rec of result.bundleAnalysis.recommendations) {
                    lines.push(`  - ${rec}`);
                }
            }
        }
        return lines.join('\n');
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
// Factory function
function createPerformanceAnalyzer() {
    return new PerformanceAnalyzer();
}
//# sourceMappingURL=performance-analyzer.js.map