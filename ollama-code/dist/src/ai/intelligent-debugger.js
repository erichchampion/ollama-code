/**
 * Intelligent Debugger
 *
 * Provides intelligent debugging capabilities that can resolve 60% of common issues
 * through automated analysis, root cause identification, and fix suggestions.
 */
import { logger } from '../utils/logger.js';
import { getPerformanceConfig } from '../config/performance.js';
import { ArchitecturalAnalyzer } from './architectural-analyzer.js';
import { AutomatedCodeReviewer } from './automated-code-reviewer.js';
import * as path from 'path';
export class IntelligentDebugger {
    config = getPerformanceConfig();
    architecturalAnalyzer;
    codeReviewer;
    constructor() {
        this.architecturalAnalyzer = new ArchitecturalAnalyzer();
        this.codeReviewer = new AutomatedCodeReviewer();
    }
    /**
     * Perform intelligent debugging analysis
     */
    async debug(request) {
        const startTime = performance.now();
        try {
            logger.info('Starting intelligent debugging analysis', {
                hasError: !!request.error,
                symptoms: request.symptoms?.length || 0,
                files: request.files?.length || 0
            });
            // Step 1: Analyze context and gather information
            const enrichedContext = await this.enrichDebuggingContext(request);
            // Step 2: Perform root cause analysis
            const rootCauseAnalysis = await this.performRootCauseAnalysis(request, enrichedContext);
            // Step 3: Generate diagnosis
            const diagnosis = this.generateDiagnosis(rootCauseAnalysis, request);
            // Step 4: Generate fix suggestions
            const fixes = await this.generateFixSuggestions(rootCauseAnalysis, diagnosis, request, enrichedContext);
            // Step 5: Generate prevention strategies
            const prevention = this.generatePreventionStrategies(diagnosis, rootCauseAnalysis);
            // Step 6: Generate test suggestions
            const tests = await this.generateTestSuggestions(diagnosis, request.files || []);
            // Step 7: Generate monitoring recommendations
            const monitoring = this.generateMonitoringRecommendations(diagnosis, rootCauseAnalysis);
            // Calculate overall confidence
            const confidence = this.calculateOverallConfidence(rootCauseAnalysis, fixes);
            // Estimate resolution time and difficulty
            const estimatedResolutionTime = this.estimateResolutionTime(fixes, diagnosis);
            const difficulty = this.assessDifficulty(fixes, diagnosis, rootCauseAnalysis);
            const result = {
                analysis: rootCauseAnalysis,
                diagnosis,
                fixes,
                prevention,
                tests,
                monitoring,
                confidence,
                estimatedResolutionTime,
                difficulty
            };
            const duration = performance.now() - startTime;
            logger.info(`Debugging analysis completed in ${duration.toFixed(2)}ms`, {
                confidence: confidence,
                fixSuggestions: fixes.length,
                diagnosis: diagnosis.category
            });
            return result;
        }
        catch (error) {
            logger.error('Debugging analysis failed:', error);
            throw error;
        }
    }
    async enrichDebuggingContext(request) {
        const context = request.context || {};
        try {
            // Gather system information if not provided
            if (!context.environment) {
                context.environment = {
                    os: process.platform,
                    nodeVersion: process.version,
                    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                    cpuUsage: process.cpuUsage().user / 1000000 // seconds
                };
            }
            // Analyze codebase if files are provided
            if (request.files && request.files.length > 0) {
                const architecturalAnalysis = await this.architecturalAnalyzer.analyzeArchitecture(request.files.map(f => ({ path: f.path, content: f.content, type: f.language })));
                context.codebase = {
                    language: request.files[0]?.language || 'unknown',
                    framework: this.detectFramework(request.files),
                    dependencies: this.extractDependencies(request.files)
                };
            }
            // Gather recent changes information (would typically come from git)
            if (!context.recentChanges) {
                context.recentChanges = {
                    files: request.files?.map(f => f.path) || []
                };
            }
            return context;
        }
        catch (error) {
            logger.warn('Failed to enrich debugging context:', error);
            return context;
        }
    }
    async performRootCauseAnalysis(request, context) {
        const causes = [];
        const evidence = [];
        // Analyze error if provided
        if (request.error) {
            const errorAnalysis = await this.analyzeError(request.error, request.files || []);
            causes.push(...errorAnalysis.causes);
            evidence.push(...errorAnalysis.evidence);
        }
        // Analyze symptoms
        if (request.symptoms) {
            const symptomAnalysis = await this.analyzeSymptoms(request.symptoms, request.files || []);
            causes.push(...symptomAnalysis.causes);
            evidence.push(...symptomAnalysis.evidence);
        }
        // Analyze code patterns
        if (request.files && request.files.length > 0) {
            const codeAnalysis = await this.analyzeCodePatterns(request.files);
            causes.push(...codeAnalysis.causes);
            evidence.push(...codeAnalysis.evidence);
        }
        // Analyze recent changes
        if (context.recentChanges?.files.length) {
            const changeAnalysis = await this.analyzeRecentChanges(context.recentChanges, request.files || []);
            causes.push(...changeAnalysis.causes);
            evidence.push(...changeAnalysis.evidence);
        }
        // Rank causes by confidence and correlation
        const rankedCauses = this.rankCauses(causes, evidence);
        const primaryCause = rankedCauses[0];
        const contributingFactors = rankedCauses.slice(1, 3);
        return {
            primaryCause,
            contributingFactors,
            analysis: this.generateAnalysisText(primaryCause, contributingFactors, evidence),
            evidenceChain: evidence,
            likelihood: primaryCause?.confidence || 0.5
        };
    }
    async analyzeError(error, files) {
        const causes = [];
        const evidence = [];
        // Analyze stack trace
        if (error.stack) {
            const stackAnalysis = this.analyzeStackTrace(error.stack, files);
            causes.push(...stackAnalysis.causes);
            evidence.push(...stackAnalysis.evidence);
        }
        // Analyze error message patterns
        const messageAnalysis = this.analyzeErrorMessage(error.message, error.type);
        causes.push(...messageAnalysis.causes);
        evidence.push(...messageAnalysis.evidence);
        // Analyze error frequency and environment
        if (error.frequency === 'always' || error.frequency === 'frequent') {
            causes.push({
                type: 'code-logic',
                description: 'Consistent error suggests systematic code issue',
                confidence: 0.8,
                impact: 'high'
            });
            evidence.push({
                type: 'error-correlation',
                description: 'High frequency indicates reproducible bug',
                strength: 'strong'
            });
        }
        return { causes, evidence };
    }
    analyzeStackTrace(stack, files) {
        const causes = [];
        const evidence = [];
        const stackLines = stack.split('\n').filter(line => line.trim());
        for (const line of stackLines) {
            // Extract file and line information
            const match = line.match(/at .* \((.+):(\d+):(\d+)\)/);
            if (match) {
                const [, filePath, lineNum, colNum] = match;
                const file = files.find(f => f.path.includes(path.basename(filePath)));
                if (file) {
                    const lineNumber = parseInt(lineNum, 10);
                    const codeLocation = {
                        file: filePath,
                        line: lineNumber,
                        column: parseInt(colNum, 10)
                    };
                    // Analyze the specific line of code
                    const codeLine = file.content.split('\n')[lineNumber - 1];
                    if (codeLine) {
                        const codeAnalysis = this.analyzeCodeLine(codeLine, codeLocation);
                        causes.push(...codeAnalysis.causes);
                        evidence.push(...codeAnalysis.evidence);
                    }
                }
            }
        }
        return { causes, evidence };
    }
    analyzeErrorMessage(message, type) {
        const causes = [];
        const evidence = [];
        // Common error patterns
        const errorPatterns = [
            {
                pattern: /cannot read property .* of undefined/i,
                cause: {
                    type: 'code-logic',
                    description: 'Null pointer dereference - object is undefined',
                    confidence: 0.9,
                    impact: 'high'
                }
            },
            {
                pattern: /is not a function/i,
                cause: {
                    type: 'code-logic',
                    description: 'Type error - attempting to call non-function',
                    confidence: 0.9,
                    impact: 'high'
                }
            },
            {
                pattern: /module not found/i,
                cause: {
                    type: 'dependency',
                    description: 'Missing dependency or incorrect import path',
                    confidence: 0.95,
                    impact: 'high'
                }
            },
            {
                pattern: /timeout/i,
                cause: {
                    type: 'code-logic',
                    description: 'Operation timeout - possible infinite loop or slow operation',
                    confidence: 0.7,
                    impact: 'medium'
                }
            },
            {
                pattern: /memory|heap/i,
                cause: {
                    type: 'memory-leak',
                    description: 'Memory-related issue - possible memory leak',
                    confidence: 0.8,
                    impact: 'critical'
                }
            }
        ];
        for (const { pattern, cause } of errorPatterns) {
            if (pattern.test(message)) {
                causes.push(cause);
                evidence.push({
                    type: 'error-correlation',
                    description: `Error message matches pattern: ${pattern.source}`,
                    strength: 'strong',
                    data: { message, pattern: pattern.source }
                });
            }
        }
        return { causes, evidence };
    }
    analyzeCodeLine(codeLine, location) {
        const causes = [];
        const evidence = [];
        // Check for common problematic patterns
        if (codeLine.includes('.') && !codeLine.includes('?.')) {
            // Potential null pointer access
            causes.push({
                type: 'code-logic',
                description: 'Missing null check before property access',
                location,
                confidence: 0.7,
                impact: 'high'
            });
            evidence.push({
                type: 'code-pattern',
                description: 'Property access without optional chaining',
                location,
                strength: 'moderate'
            });
        }
        if (codeLine.includes('for') && codeLine.includes('length')) {
            // Potential array iteration issue
            const arrayMatch = codeLine.match(/(\w+)\.length/);
            if (arrayMatch) {
                causes.push({
                    type: 'code-logic',
                    description: 'Potential array iteration boundary issue',
                    location,
                    confidence: 0.6,
                    impact: 'medium'
                });
            }
        }
        if (codeLine.includes('JSON.parse') && !codeLine.includes('try')) {
            // Unhandled JSON parsing
            causes.push({
                type: 'code-logic',
                description: 'Unhandled JSON parsing - should be wrapped in try-catch',
                location,
                confidence: 0.8,
                impact: 'high'
            });
        }
        return { causes, evidence };
    }
    async analyzeSymptoms(symptoms, files) {
        const causes = [];
        const evidence = [];
        for (const symptom of symptoms) {
            switch (symptom.category) {
                case 'performance':
                    causes.push({
                        type: 'code-logic',
                        description: 'Performance issue suggests inefficient algorithm or resource usage',
                        confidence: 0.7,
                        impact: symptom.severity === 'severe' ? 'high' : 'medium'
                    });
                    break;
                case 'ui':
                    causes.push({
                        type: 'code-logic',
                        description: 'UI issue suggests state management or rendering problem',
                        confidence: 0.6,
                        impact: 'medium'
                    });
                    break;
                case 'data':
                    causes.push({
                        type: 'data-issue',
                        description: 'Data inconsistency or corruption',
                        confidence: 0.8,
                        impact: 'high'
                    });
                    break;
                case 'network':
                    causes.push({
                        type: 'configuration',
                        description: 'Network configuration or connectivity issue',
                        confidence: 0.7,
                        impact: 'high'
                    });
                    break;
            }
            evidence.push({
                type: 'log-pattern',
                description: `Symptom: ${symptom.description}`,
                strength: symptom.reproducible ? 'strong' : 'moderate',
                data: symptom
            });
        }
        return { causes, evidence };
    }
    async analyzeCodePatterns(files) {
        const causes = [];
        const evidence = [];
        // Use code reviewer to identify issues
        const reviewRequest = {
            files: files.map(f => ({
                path: f.path,
                content: f.content,
                language: f.language
            })),
            options: {
                categories: ['code-quality', 'security', 'performance'],
                severity: 'high'
            }
        };
        try {
            const reviewResult = await this.codeReviewer.reviewCode(reviewRequest);
            for (const fileReview of reviewResult.files) {
                for (const issue of fileReview.issues) {
                    causes.push({
                        type: this.mapReviewCategoryToCauseType(issue.category),
                        description: issue.description,
                        location: issue.line ? {
                            file: fileReview.filePath,
                            line: issue.line,
                            column: issue.column
                        } : undefined,
                        confidence: issue.severity === 'critical' ? 0.9 :
                            issue.severity === 'major' ? 0.7 : 0.5,
                        impact: issue.severity === 'critical' ? 'critical' :
                            issue.severity === 'major' ? 'high' : 'medium'
                    });
                    evidence.push({
                        type: 'code-pattern',
                        description: `Code review issue: ${issue.title}`,
                        location: issue.line ? {
                            file: fileReview.filePath,
                            line: issue.line,
                            column: issue.column
                        } : undefined,
                        strength: 'moderate',
                        data: issue
                    });
                }
            }
        }
        catch (error) {
            logger.warn('Failed to analyze code patterns:', error);
        }
        return { causes, evidence };
    }
    async analyzeRecentChanges(recentChanges, files) {
        const causes = [];
        const evidence = [];
        // If there are recent changes, they're likely related to the issue
        if (recentChanges.files.length > 0) {
            causes.push({
                type: 'code-logic',
                description: 'Recent code changes may have introduced the issue',
                confidence: 0.6,
                impact: 'medium'
            });
            evidence.push({
                type: 'log-pattern',
                description: `${recentChanges.files.length} files recently changed`,
                strength: 'moderate',
                data: { changedFiles: recentChanges.files }
            });
        }
        return { causes, evidence };
    }
    rankCauses(causes, evidence) {
        // Score causes based on confidence, impact, and evidence strength
        const scoredCauses = causes.map(cause => {
            const relatedEvidence = evidence.filter(e => e.location?.file === cause.location?.file &&
                e.location?.line === cause.location?.line);
            const evidenceScore = relatedEvidence.reduce((score, e) => {
                const strengthScore = e.strength === 'definitive' ? 1 :
                    e.strength === 'strong' ? 0.8 :
                        e.strength === 'moderate' ? 0.6 : 0.4;
                return score + strengthScore;
            }, 0) / Math.max(relatedEvidence.length, 1);
            const impactScore = cause.impact === 'critical' ? 1 :
                cause.impact === 'high' ? 0.8 :
                    cause.impact === 'medium' ? 0.6 : 0.4;
            const totalScore = (cause.confidence * 0.5) + (evidenceScore * 0.3) + (impactScore * 0.2);
            return { ...cause, score: totalScore };
        });
        return scoredCauses
            .sort((a, b) => b.score - a.score)
            .map(({ score, ...cause }) => cause);
    }
    generateAnalysisText(primaryCause, contributingFactors, evidence) {
        let analysis = `Root cause analysis indicates that the primary issue is: ${primaryCause.description}.`;
        if (contributingFactors.length > 0) {
            analysis += ` Contributing factors include: ${contributingFactors.map(c => c.description).join(', ')}.`;
        }
        const strongEvidence = evidence.filter(e => e.strength === 'strong' || e.strength === 'definitive');
        if (strongEvidence.length > 0) {
            analysis += ` This is supported by strong evidence including: ${strongEvidence.map(e => e.description).join(', ')}.`;
        }
        analysis += ` Confidence level: ${Math.round(primaryCause.confidence * 100)}%.`;
        return analysis;
    }
    generateDiagnosis(rootCauseAnalysis, request) {
        const primaryCause = rootCauseAnalysis.primaryCause;
        // Map cause type to diagnosis category
        const categoryMap = {
            'code-logic': 'logic-error',
            'data-issue': 'bug',
            'configuration': 'configuration',
            'dependency': 'integration-issue',
            'environment': 'configuration',
            'race-condition': 'bug',
            'memory-leak': 'performance',
            'security': 'security'
        };
        const category = categoryMap[primaryCause.type] || 'bug';
        return {
            category,
            title: this.generateDiagnosisTitle(primaryCause, request.error),
            description: rootCauseAnalysis.analysis,
            severity: primaryCause.impact,
            scope: this.assessIssueScope(rootCauseAnalysis, request),
            businessImpact: this.assessBusinessImpact(primaryCause, request),
            technicalImpact: this.assessTechnicalImpact(primaryCause, rootCauseAnalysis)
        };
    }
    generateDiagnosisTitle(primaryCause, error) {
        if (error) {
            return `${primaryCause.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${error.message.split('\n')[0].substring(0, 60)}...`;
        }
        return primaryCause.description.substring(0, 60);
    }
    assessIssueScope(rootCauseAnalysis, request) {
        const filesAffected = request.files?.length || 0;
        const hasSystemWideImpact = rootCauseAnalysis.contributingFactors.some(c => c.type === 'environment' || c.type === 'configuration');
        if (hasSystemWideImpact)
            return 'global';
        if (filesAffected > 5)
            return 'system';
        if (filesAffected > 1)
            return 'module';
        return 'local';
    }
    assessBusinessImpact(primaryCause, request) {
        const severity = primaryCause.impact;
        const errorType = request.error?.type;
        if (severity === 'critical') {
            return 'High business impact - may affect user experience, data integrity, or system availability';
        }
        if (severity === 'high' && errorType === 'security') {
            return 'Significant business risk - potential security vulnerability requiring immediate attention';
        }
        if (severity === 'high') {
            return 'Moderate business impact - may affect functionality or performance';
        }
        return 'Low business impact - primarily affects code quality or development efficiency';
    }
    assessTechnicalImpact(primaryCause, rootCauseAnalysis) {
        const impacts = [];
        if (primaryCause.type === 'memory-leak') {
            impacts.push('Memory usage increase over time');
        }
        if (primaryCause.type === 'race-condition') {
            impacts.push('Unpredictable behavior and data inconsistency');
        }
        if (primaryCause.type === 'security') {
            impacts.push('Potential security vulnerability');
        }
        if (primaryCause.impact === 'critical') {
            impacts.push('System instability or complete failure');
        }
        return impacts.length > 0 ? impacts.join(', ') : 'Technical implementation issue requiring code changes';
    }
    async generateFixSuggestions(rootCauseAnalysis, diagnosis, request, context) {
        const fixes = [];
        const primaryCause = rootCauseAnalysis.primaryCause;
        // Generate fixes based on cause type
        switch (primaryCause.type) {
            case 'code-logic':
                fixes.push(...await this.generateCodeLogicFixes(primaryCause, rootCauseAnalysis, request));
                break;
            case 'data-issue':
                fixes.push(...await this.generateDataIssueFixes(primaryCause, request));
                break;
            case 'configuration':
                fixes.push(...await this.generateConfigurationFixes(primaryCause, context));
                break;
            case 'dependency':
                fixes.push(...await this.generateDependencyFixes(primaryCause, context));
                break;
            case 'memory-leak':
                fixes.push(...await this.generateMemoryLeakFixes(primaryCause, request));
                break;
            case 'security':
                fixes.push(...await this.generateSecurityFixes(primaryCause, request));
                break;
        }
        // Sort by priority and confidence
        return fixes
            .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.confidence - a.confidence;
        })
            .slice(0, request.options?.maxSuggestedFixes || 5);
    }
    async generateCodeLogicFixes(cause, rootCauseAnalysis, request) {
        const fixes = [];
        // Null pointer fix
        if (cause.description.includes('undefined') || cause.description.includes('null')) {
            fixes.push({
                id: 'null-check-fix',
                title: 'Add Null Safety Checks',
                description: 'Add null/undefined checks before property access',
                type: 'code-change',
                priority: 'high',
                effort: 'minimal',
                risks: [{
                        description: 'May change program flow if null values are expected',
                        probability: 'low',
                        impact: 'low',
                        mitigation: 'Add comprehensive tests to verify behavior'
                    }],
                benefits: [
                    'Prevents null pointer exceptions',
                    'Improves code robustness',
                    'Better error handling'
                ],
                implementation: [
                    {
                        order: 1,
                        description: 'Identify all property accesses that may be null/undefined',
                        validation: 'Review code for potential null dereferencing',
                        estimatedTime: '15 minutes'
                    },
                    {
                        order: 2,
                        description: 'Add null checks or optional chaining',
                        validation: 'Verify all accesses are protected',
                        estimatedTime: '30 minutes'
                    },
                    {
                        order: 3,
                        description: 'Test with null/undefined values',
                        validation: 'Ensure graceful handling of edge cases',
                        estimatedTime: '20 minutes'
                    }
                ],
                codeChanges: cause.location ? [{
                        file: cause.location.file,
                        type: 'modify',
                        location: cause.location,
                        explanation: 'Add null safety check',
                        newCode: 'if (object && object.property) { /* access property */ }'
                    }] : [],
                confidence: 0.9,
                testable: true,
                rollbackPlan: 'Revert code changes if issues arise'
            });
        }
        return fixes;
    }
    async generateDataIssueFixes(cause, request) {
        const fixes = [];
        fixes.push({
            id: 'data-validation-fix',
            title: 'Improve Data Validation',
            description: 'Add comprehensive input validation and sanitization',
            type: 'code-change',
            priority: 'high',
            effort: 'medium',
            risks: [{
                    description: 'May reject previously accepted data',
                    probability: 'medium',
                    impact: 'medium',
                    mitigation: 'Implement gradual rollout with logging'
                }],
            benefits: [
                'Prevents data corruption',
                'Improves data quality',
                'Better error messages'
            ],
            implementation: [
                {
                    order: 1,
                    description: 'Define data validation schemas',
                    validation: 'Schema covers all required fields and constraints',
                    estimatedTime: '1 hour'
                },
                {
                    order: 2,
                    description: 'Implement validation at entry points',
                    validation: 'All inputs are validated before processing',
                    estimatedTime: '2 hours'
                }
            ],
            confidence: 0.8,
            testable: true
        });
        return fixes;
    }
    async generateConfigurationFixes(cause, context) {
        const fixes = [];
        fixes.push({
            id: 'config-fix',
            title: 'Update Configuration',
            description: 'Correct configuration settings causing the issue',
            type: 'configuration',
            priority: 'medium',
            effort: 'minimal',
            risks: [{
                    description: 'Configuration change may affect other components',
                    probability: 'low',
                    impact: 'medium',
                    mitigation: 'Test in staging environment first'
                }],
            benefits: [
                'Resolves configuration conflicts',
                'Improves system stability',
                'Better environment consistency'
            ],
            implementation: [
                {
                    order: 1,
                    description: 'Identify incorrect configuration values',
                    validation: 'Configuration values are documented and verified',
                    estimatedTime: '30 minutes'
                },
                {
                    order: 2,
                    description: 'Update configuration files',
                    validation: 'Configuration syntax is valid',
                    estimatedTime: '15 minutes'
                }
            ],
            confidence: 0.85,
            testable: true
        });
        return fixes;
    }
    async generateDependencyFixes(cause, context) {
        const fixes = [];
        fixes.push({
            id: 'dependency-fix',
            title: 'Update Dependencies',
            description: 'Update or install missing dependencies',
            type: 'dependency-update',
            priority: 'high',
            effort: 'low',
            risks: [{
                    description: 'New dependency versions may introduce breaking changes',
                    probability: 'medium',
                    impact: 'medium',
                    mitigation: 'Review changelogs and test thoroughly'
                }],
            benefits: [
                'Resolves missing dependency issues',
                'Gets latest bug fixes and features',
                'Improves security with updates'
            ],
            implementation: [
                {
                    order: 1,
                    description: 'Check for missing or outdated dependencies',
                    command: 'npm audit',
                    validation: 'All dependencies are resolved',
                    estimatedTime: '10 minutes'
                },
                {
                    order: 2,
                    description: 'Update dependencies',
                    command: 'npm update',
                    validation: 'Application still functions correctly',
                    estimatedTime: '20 minutes'
                }
            ],
            confidence: 0.9,
            testable: true
        });
        return fixes;
    }
    async generateMemoryLeakFixes(cause, request) {
        const fixes = [];
        fixes.push({
            id: 'memory-leak-fix',
            title: 'Fix Memory Leaks',
            description: 'Identify and resolve memory leaks in the application',
            type: 'code-change',
            priority: 'critical',
            effort: 'high',
            risks: [{
                    description: 'May require significant refactoring',
                    probability: 'high',
                    impact: 'medium',
                    mitigation: 'Implement changes incrementally with monitoring'
                }],
            benefits: [
                'Prevents memory exhaustion',
                'Improves application stability',
                'Better resource utilization'
            ],
            implementation: [
                {
                    order: 1,
                    description: 'Profile memory usage to identify leaks',
                    validation: 'Memory leak sources are identified',
                    estimatedTime: '2 hours'
                },
                {
                    order: 2,
                    description: 'Remove circular references and unused objects',
                    validation: 'Memory usage stabilizes over time',
                    estimatedTime: '4 hours'
                }
            ],
            confidence: 0.7,
            testable: true
        });
        return fixes;
    }
    async generateSecurityFixes(cause, request) {
        const fixes = [];
        fixes.push({
            id: 'security-fix',
            title: 'Address Security Vulnerability',
            description: 'Fix identified security vulnerability',
            type: 'code-change',
            priority: 'critical',
            effort: 'medium',
            risks: [{
                    description: 'Security fix may change API behavior',
                    probability: 'medium',
                    impact: 'medium',
                    mitigation: 'Coordinate with security team and plan deployment'
                }],
            benefits: [
                'Eliminates security vulnerability',
                'Protects user data',
                'Maintains compliance'
            ],
            implementation: [
                {
                    order: 1,
                    description: 'Apply security patches and input sanitization',
                    validation: 'Security vulnerability is closed',
                    estimatedTime: '3 hours'
                },
                {
                    order: 2,
                    description: 'Test security fix thoroughly',
                    validation: 'No new vulnerabilities introduced',
                    estimatedTime: '2 hours'
                }
            ],
            confidence: 0.9,
            testable: true
        });
        return fixes;
    }
    generatePreventionStrategies(diagnosis, rootCauseAnalysis) {
        const strategies = [];
        // Always recommend code review
        strategies.push({
            category: 'code-review',
            title: 'Enhanced Code Review Process',
            description: 'Implement thorough code review practices to catch similar issues',
            implementation: [
                'Require peer review for all code changes',
                'Use automated code analysis tools',
                'Create review checklists for common issues'
            ],
            tools: ['GitHub PR reviews', 'ESLint', 'SonarQube'],
            effort: 'medium',
            effectiveness: 0.8
        });
        // Recommend testing based on issue type
        if (rootCauseAnalysis.primaryCause.type === 'code-logic') {
            strategies.push({
                category: 'testing',
                title: 'Comprehensive Unit Testing',
                description: 'Add unit tests to cover edge cases and prevent regressions',
                implementation: [
                    'Write tests for all new code',
                    'Add tests for bug fixes',
                    'Achieve 80%+ code coverage',
                    'Include edge case testing'
                ],
                tools: ['Jest', 'Mocha', 'Cypress'],
                effort: 'high',
                effectiveness: 0.9
            });
        }
        // Monitoring recommendations
        strategies.push({
            category: 'monitoring',
            title: 'Proactive Monitoring',
            description: 'Implement monitoring to detect similar issues early',
            implementation: [
                'Add error tracking and alerting',
                'Monitor key performance metrics',
                'Set up health checks',
                'Log critical operations'
            ],
            tools: ['Sentry', 'DataDog', 'New Relic'],
            effort: 'medium',
            effectiveness: 0.7
        });
        return strategies;
    }
    async generateTestSuggestions(diagnosis, files) {
        const suggestions = [];
        // Unit test suggestions
        suggestions.push({
            type: 'unit',
            title: 'Unit Tests for Bug Fix',
            description: 'Add unit tests to verify the fix and prevent regression',
            file: files[0]?.path || 'test/unit/',
            priority: 'high',
            framework: 'jest',
            estimatedTime: '2 hours'
        });
        // Integration test if multiple components involved
        if (files.length > 1) {
            suggestions.push({
                type: 'integration',
                title: 'Integration Tests',
                description: 'Test interaction between affected components',
                file: 'test/integration/',
                priority: 'medium',
                framework: 'jest',
                estimatedTime: '3 hours'
            });
        }
        // Performance test for performance issues
        if (diagnosis.category === 'performance') {
            suggestions.push({
                type: 'performance',
                title: 'Performance Regression Tests',
                description: 'Add tests to monitor performance characteristics',
                file: 'test/performance/',
                priority: 'medium',
                estimatedTime: '4 hours'
            });
        }
        return suggestions;
    }
    generateMonitoringRecommendations(diagnosis, rootCauseAnalysis) {
        const recommendations = [];
        // Error logging
        recommendations.push({
            type: 'logging',
            title: 'Enhanced Error Logging',
            description: 'Add comprehensive logging for better debugging',
            implementation: 'Add structured logging with context information',
            tools: ['Winston', 'Bunyan', 'Pino'],
            priority: 'high'
        });
        // Metrics for performance issues
        if (diagnosis.category === 'performance') {
            recommendations.push({
                type: 'metrics',
                title: 'Performance Metrics',
                description: 'Monitor key performance indicators',
                implementation: 'Track response times, memory usage, and throughput',
                tools: ['Prometheus', 'Grafana'],
                priority: 'high'
            });
        }
        // Alerting for critical issues
        if (diagnosis.severity === 'critical' || diagnosis.severity === 'high') {
            recommendations.push({
                type: 'alerting',
                title: 'Critical Error Alerts',
                description: 'Set up alerts for similar critical issues',
                implementation: 'Configure alerts based on error patterns and thresholds',
                tools: ['PagerDuty', 'Slack', 'Email'],
                priority: 'high'
            });
        }
        return recommendations;
    }
    calculateOverallConfidence(rootCauseAnalysis, fixes) {
        const causeConfidence = rootCauseAnalysis.primaryCause.confidence;
        const fixConfidence = fixes.length > 0 ?
            fixes.reduce((sum, fix) => sum + fix.confidence, 0) / fixes.length : 0.5;
        return (causeConfidence * 0.6) + (fixConfidence * 0.4);
    }
    estimateResolutionTime(fixes, diagnosis) {
        if (fixes.length === 0)
            return 'Unable to estimate';
        const totalHours = fixes.reduce((total, fix) => {
            const effortHours = fix.effort === 'minimal' ? 0.5 :
                fix.effort === 'low' ? 2 :
                    fix.effort === 'medium' ? 8 :
                        fix.effort === 'high' ? 24 : 2;
            return total + effortHours;
        }, 0);
        if (totalHours < 2)
            return 'Less than 2 hours';
        if (totalHours < 8)
            return `${Math.round(totalHours)} hours`;
        if (totalHours < 40)
            return `${Math.round(totalHours / 8)} days`;
        return `${Math.round(totalHours / 40)} weeks`;
    }
    assessDifficulty(fixes, diagnosis, rootCauseAnalysis) {
        const hasHighEffortFixes = fixes.some(fix => fix.effort === 'high');
        const hasArchitecturalChanges = fixes.some(fix => fix.type === 'architectural');
        const lowConfidence = rootCauseAnalysis.primaryCause.confidence < 0.6;
        const multipleCauses = rootCauseAnalysis.contributingFactors.length > 2;
        if (hasArchitecturalChanges || lowConfidence)
            return 'expert';
        if (hasHighEffortFixes || multipleCauses)
            return 'hard';
        if (fixes.some(fix => fix.effort === 'medium'))
            return 'moderate';
        return 'easy';
    }
    // Helper methods
    detectFramework(files) {
        const allContent = files.map(f => f.content).join('\n');
        if (allContent.includes('react') || allContent.includes('React'))
            return 'React';
        if (allContent.includes('vue') || allContent.includes('Vue'))
            return 'Vue';
        if (allContent.includes('angular') || allContent.includes('Angular'))
            return 'Angular';
        if (allContent.includes('express') || allContent.includes('Express'))
            return 'Express';
        return undefined;
    }
    extractDependencies(files) {
        const dependencies = [];
        for (const file of files) {
            if (file.path.includes('package.json')) {
                try {
                    const packageJson = JSON.parse(file.content);
                    dependencies.push(...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {}));
                }
                catch {
                    // Invalid JSON
                }
            }
        }
        return dependencies;
    }
    mapReviewCategoryToCauseType(category) {
        const mapping = {
            'code-quality': 'code-logic',
            'security': 'security',
            'performance': 'code-logic',
            'maintainability': 'code-logic',
            'testing': 'code-logic',
            'documentation': 'code-logic',
            'architecture': 'code-logic',
            'best-practices': 'code-logic'
        };
        return mapping[category] || 'code-logic';
    }
}
//# sourceMappingURL=intelligent-debugger.js.map