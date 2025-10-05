/**
 * Autonomous Developer
 *
 * Implements autonomous feature development from specifications with intelligent
 * planning, decomposition, and safety validation.
 */
import { logger } from '../utils/logger.js';
import { normalizeError } from '../utils/error-utils.js';
import { getPerformanceConfig } from '../config/performance.js';
import { ArchitecturalAnalyzer } from './architectural-analyzer.js';
import { TestGenerator } from './test-generator.js';
import { ok, err, errFromError, tryAsync, isOk, isErr } from '../types/result.js';
import { detectLanguageFromPath, determineArtifactType } from '../utils/language-detector.js';
import { AUTONOMOUS_DEVELOPMENT_DEFAULTS, getTestCoverageThreshold, calculateEstimatedHours, getRiskLevel, calculateResourceRequirements } from '../constants/autonomous-development.js';
import { validateTaskCriteria, allValidationsPassed, validateConfiguration } from '../utils/validation-utils.js';
import { RollbackManager } from '../utils/rollback-manager.js';
import * as fs from 'fs/promises';
import * as path from 'path';
export class AutonomousDeveloper {
    config = getPerformanceConfig();
    architecturalAnalyzer;
    testGenerator;
    rollbackManager;
    isConfigValid = false;
    constructor() {
        this.architecturalAnalyzer = new ArchitecturalAnalyzer();
        this.testGenerator = new TestGenerator();
        this.rollbackManager = new RollbackManager();
        this.validateInitialConfiguration();
    }
    /**
     * Validate configuration on initialization
     */
    validateInitialConfiguration() {
        const requiredConfigFields = ['codeAnalysis'];
        const validationResult = validateConfiguration(this.config, requiredConfigFields);
        if (isOk(validationResult)) {
            this.isConfigValid = true;
            logger.info('Autonomous developer configuration validated successfully');
        }
        else {
            this.isConfigValid = false;
            logger.warn('Configuration validation failed:', validationResult.error.message);
        }
    }
    /**
     * Check if the component is properly configured
     */
    isConfigurationValid() {
        return this.isConfigValid;
    }
    /**
     * Parse and understand a feature specification
     */
    async parseSpecification(specification) {
        const startTime = performance.now();
        return await tryAsync(async () => {
            let parsedSpec;
            if (typeof specification === 'string') {
                const parseResult = await this.parseTextSpecification(specification);
                if (isErr(parseResult)) {
                    throw new Error(`Failed to parse text specification: ${parseResult.error.message}`);
                }
                parsedSpec = parseResult.data;
            }
            else {
                parsedSpec = specification;
            }
            // Enrich specification with analysis
            const enrichResult = await this.enrichSpecification(parsedSpec);
            if (isErr(enrichResult)) {
                throw new Error(`Failed to enrich specification: ${enrichResult.error.message}`);
            }
            const enrichedSpec = enrichResult.data;
            const duration = performance.now() - startTime;
            logger.info(`Specification parsed in ${duration.toFixed(2)}ms`, {
                title: enrichedSpec.title,
                complexity: enrichedSpec.complexity,
                requirements: enrichedSpec.requirements.length
            });
            return enrichedSpec;
        });
    }
    /**
     * Create comprehensive implementation plan
     */
    async createImplementationPlan(specification) {
        const startTime = performance.now();
        return await tryAsync(async () => {
            // Analyze codebase architecture for context
            const codebaseResult = await this.getCodebaseContext();
            if (isErr(codebaseResult)) {
                throw new Error(`Failed to get codebase context: ${codebaseResult.error.message}`);
            }
            const codebaseFiles = codebaseResult.data;
            const architecturalAnalysis = await this.architecturalAnalyzer.analyzeArchitecture(codebaseFiles);
            // Generate implementation phases
            const phasesResult = await this.generateImplementationPhases(specification, architecturalAnalysis);
            if (isErr(phasesResult)) {
                throw new Error(`Failed to generate implementation phases: ${phasesResult.error.message}`);
            }
            const phases = phasesResult.data;
            // Create dependency graph
            const dependencies = this.analyzePhaseDependencies(phases);
            // Assess risks
            const riskResult = await this.assessImplementationRisks(specification, phases, architecturalAnalysis);
            if (isErr(riskResult)) {
                throw new Error(`Failed to assess implementation risks: ${riskResult.error.message}`);
            }
            const riskAssessment = riskResult.data;
            // Create timeline
            const timeline = this.generateTimeline(phases, dependencies);
            // Calculate resource requirements
            const resources = this.calculateResourceRequirementsFromPlan(specification, phases);
            const plan = {
                phases,
                dependencies,
                riskAssessment,
                timeline,
                resources
            };
            const duration = performance.now() - startTime;
            logger.info(`Implementation plan created in ${duration.toFixed(2)}ms`, {
                phases: phases.length,
                totalTasks: phases.reduce((sum, phase) => sum + phase.tasks.length, 0),
                overallRisk: riskAssessment.overallRisk,
                estimatedDuration: timeline.endDate.getTime() - timeline.startDate.getTime()
            });
            return plan;
        });
    }
    /**
     * Execute implementation plan autonomously
     */
    async implementFeature(specification, plan) {
        const startTime = performance.now();
        const operationId = `impl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Start rollback context
        const contextResult = await this.rollbackManager.startContext(operationId, `Implement Feature: ${specification.title}`);
        if (isErr(contextResult)) {
            return err(contextResult.error);
        }
        return await tryAsync(async () => {
            logger.info('Starting autonomous feature implementation', {
                feature: specification.title,
                phases: plan.phases.length,
                operationId
            });
            const phaseResults = [];
            const allArtifacts = [];
            const allIssues = [];
            let rollbackNeeded = false;
            // Execute phases in dependency order
            const orderResult = this.calculateExecutionOrder(plan.phases, plan.dependencies);
            if (isErr(orderResult)) {
                throw new Error(`Failed to calculate execution order: ${orderResult.error.message}`);
            }
            const executionOrder = orderResult.data;
            for (const phaseId of executionOrder) {
                const phase = plan.phases.find(p => p.id === phaseId);
                if (!phase)
                    continue;
                logger.info(`Executing phase: ${phase.name}`, { phaseId });
                const phaseResult = await this.executePhase(phase, specification, operationId);
                phaseResults.push(phaseResult);
                // Collect artifacts and issues
                allArtifacts.push(...phaseResult.tasks.flatMap(t => t.artifacts.map(path => ({
                    type: determineArtifactType(path),
                    path,
                    size: 0, // Would calculate actual size
                    quality: AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.DEFAULT_CODE_QUALITY
                }))));
                allIssues.push(...phaseResult.issues);
                // Stop execution if critical phase fails
                if (phase.riskLevel === 'high' && phaseResult.status === 'failed') {
                    logger.error(`Critical phase failed: ${phase.name}. Initiating rollback.`);
                    rollbackNeeded = true;
                    break;
                }
            }
            // Calculate overall metrics
            const metrics = this.calculateImplementationMetrics(phaseResults, allArtifacts);
            // Generate recommendations
            const recommendations = this.generateImplementationRecommendations(phaseResults, allIssues, metrics);
            // Handle rollback if needed
            if (rollbackNeeded || metrics.successRate < AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.MIN_SUCCESS_RATE_RECOMMENDATION) {
                logger.warn('Implementation failed or below threshold. Executing rollback.');
                const rollbackResult = await this.rollbackManager.executeRollback(operationId);
                if (isErr(rollbackResult)) {
                    logger.error('Rollback failed:', rollbackResult.error.message);
                    allIssues.push({
                        id: 'rollback-failed',
                        type: 'error',
                        category: 'rollback',
                        description: `Rollback failed: ${rollbackResult.error.message}`,
                        severity: 'critical',
                        autoFixable: false
                    });
                }
            }
            else {
                // Commit successful implementation
                const commitResult = await this.rollbackManager.commitContext(operationId);
                if (isErr(commitResult)) {
                    logger.warn('Failed to commit rollback context:', commitResult.error.message);
                }
            }
            const result = {
                success: phaseResults.every(r => r.status === 'completed') && !rollbackNeeded,
                phases: phaseResults,
                metrics,
                artifacts: rollbackNeeded ? [] : allArtifacts, // Clear artifacts if rolled back
                issues: allIssues,
                recommendations
            };
            const duration = performance.now() - startTime;
            logger.info(`Feature implementation ${result.success ? 'completed' : 'failed'} in ${duration.toFixed(2)}ms`, {
                success: result.success,
                successRate: metrics.successRate,
                artifacts: result.artifacts.length,
                rolledBack: rollbackNeeded
            });
            return result;
        });
    }
    async parseTextSpecification(text) {
        // Extract title from first line or header
        const titleMatch = text.match(/^#\s*(.+)|^(.+?)(?:\n|$)/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : 'Untitled Feature';
        // Extract sections
        const descriptionMatch = text.match(/(?:description|desc):\s*(.+?)(?=\n\w+:|$)/si);
        const description = descriptionMatch ? descriptionMatch[1].trim() : text.substring(0, 200);
        // Extract requirements
        const requirementsMatch = text.match(/(?:requirements|reqs?):\s*((?:\n?[-*]\s*.+)+)/si);
        const requirements = requirementsMatch
            ? requirementsMatch[1].split(/\n[-*]\s*/).filter(r => r.trim()).map(r => r.trim())
            : [];
        // Extract acceptance criteria
        const criteriaMatch = text.match(/(?:acceptance|criteria|accept):\s*((?:\n?[-*]\s*.+)+)/si);
        const acceptanceCriteria = criteriaMatch
            ? criteriaMatch[1].split(/\n[-*]\s*/).filter(c => c.trim()).map(c => c.trim())
            : [];
        return ok({
            title,
            description,
            requirements,
            acceptanceCriteria,
            priority: 'medium',
            complexity: 'moderate'
        });
    }
    async enrichSpecification(spec) {
        // Analyze complexity based on requirements
        const complexityScore = this.calculateSpecificationComplexity(spec);
        const complexity = complexityScore < 0.3 ? 'simple' :
            complexityScore < 0.7 ? 'moderate' : 'complex';
        // Use configuration-based estimation
        // estimatedHours will be calculated by the constants utility
        return ok({
            ...spec,
            complexity,
            estimatedHours: calculateEstimatedHours(spec.requirements.length, complexity, true, true),
            priority: spec.priority || 'medium'
        });
    }
    calculateSpecificationComplexity(spec) {
        let score = 0;
        // Base complexity from requirements count
        score += Math.min(spec.requirements.length / 10, 0.4);
        // Complexity keywords
        const complexityKeywords = [
            'integration', 'api', 'database', 'authentication', 'security',
            'performance', 'scalability', 'concurrent', 'real-time', 'async'
        ];
        const text = (spec.description + ' ' + spec.requirements.join(' ')).toLowerCase();
        const keywordMatches = complexityKeywords.filter(keyword => text.includes(keyword)).length;
        score += Math.min(keywordMatches / complexityKeywords.length, 0.6);
        return Math.min(score, 1.0);
    }
    async getCodebaseContext() {
        return await tryAsync(async () => {
            const files = [];
            const maxFiles = this.config.codeAnalysis?.performance?.maxFileLines || AUTONOMOUS_DEVELOPMENT_DEFAULTS.MAX_CODEBASE_FILES;
            // Get key architectural files
            const keyPaths = AUTONOMOUS_DEVELOPMENT_DEFAULTS.KEY_ARCHITECTURAL_FILES;
            for (const filePath of keyPaths) {
                try {
                    const fullPath = path.resolve(filePath);
                    const content = await fs.readFile(fullPath, 'utf-8');
                    files.push({
                        path: filePath,
                        content,
                        type: detectLanguageFromPath(filePath) || 'text'
                    });
                    if (files.length >= maxFiles)
                        break;
                }
                catch {
                    // File doesn't exist, skip
                }
            }
            return files;
        });
    }
    async generateImplementationPhases(specification, architecturalAnalysis) {
        const phases = [];
        // Phase 1: Analysis and Design
        phases.push({
            id: 'analysis',
            name: 'Analysis and Design',
            description: 'Analyze requirements and design solution architecture',
            tasks: [
                {
                    id: 'req-analysis',
                    name: 'Requirements Analysis',
                    type: 'analysis',
                    description: 'Analyze and decompose requirements',
                    estimatedHours: AUTONOMOUS_DEVELOPMENT_DEFAULTS.PHASES.ANALYSIS.REQUIREMENTS_ANALYSIS_HOURS,
                    files: [],
                    dependencies: [],
                    validation: { compileCheck: false }
                },
                {
                    id: 'arch-design',
                    name: 'Architecture Design',
                    type: 'design',
                    description: 'Design solution architecture',
                    estimatedHours: AUTONOMOUS_DEVELOPMENT_DEFAULTS.PHASES.ANALYSIS.ARCHITECTURE_DESIGN_HOURS,
                    files: [],
                    dependencies: ['req-analysis'],
                    validation: { compileCheck: false }
                }
            ],
            deliverables: ['Architecture diagram', 'Technical specification'],
            duration: 5,
            dependencies: [],
            riskLevel: 'low'
        });
        // Phase 2: Core Implementation
        phases.push({
            id: 'core-impl',
            name: 'Core Implementation',
            description: 'Implement core feature functionality',
            tasks: this.generateImplementationTasks(specification),
            deliverables: ['Core feature code', 'Unit tests'],
            duration: specification.estimatedHours || 8,
            dependencies: ['analysis'],
            riskLevel: specification.complexity === 'complex' ? 'high' : 'medium'
        });
        // Phase 3: Integration and Testing
        phases.push({
            id: 'integration',
            name: 'Integration and Testing',
            description: 'Integrate with existing systems and comprehensive testing',
            tasks: [
                {
                    id: 'integration',
                    name: 'System Integration',
                    type: 'implementation',
                    description: 'Integrate with existing codebase',
                    estimatedHours: AUTONOMOUS_DEVELOPMENT_DEFAULTS.PHASES.INTEGRATION.SYSTEM_INTEGRATION_HOURS,
                    files: [],
                    dependencies: [],
                    validation: { compileCheck: true, testCoverage: 80 }
                },
                {
                    id: 'testing',
                    name: 'Comprehensive Testing',
                    type: 'testing',
                    description: 'Generate and run comprehensive tests',
                    estimatedHours: AUTONOMOUS_DEVELOPMENT_DEFAULTS.PHASES.INTEGRATION.COMPREHENSIVE_TESTING_HOURS,
                    files: [],
                    dependencies: ['integration'],
                    validation: { compileCheck: true, testCoverage: 90 }
                }
            ],
            deliverables: ['Integration tests', 'Test reports'],
            duration: 7,
            dependencies: ['core-impl'],
            riskLevel: 'medium'
        });
        return ok(phases);
    }
    generateImplementationTasks(specification) {
        const tasks = [];
        specification.requirements.forEach((requirement, index) => {
            tasks.push({
                id: `impl-${index}`,
                name: `Implement: ${requirement}`,
                type: 'implementation',
                description: `Implement requirement: ${requirement}`,
                estimatedHours: 2,
                files: [], // Would determine based on requirement analysis
                dependencies: index > 0 ? [`impl-${index - 1}`] : [],
                validation: {
                    compileCheck: true,
                    testCoverage: 70,
                    codeQualityScore: 0.8
                }
            });
        });
        return tasks;
    }
    analyzePhaseDependencies(phases) {
        const dependencies = [];
        for (let i = 1; i < phases.length; i++) {
            const currentPhase = phases[i];
            const previousPhase = phases[i - 1];
            dependencies.push({
                from: previousPhase.id,
                to: currentPhase.id,
                type: 'blocking'
            });
        }
        return dependencies;
    }
    async assessImplementationRisks(specification, phases, architecturalAnalysis) {
        const risks = [];
        // Complexity risk
        if (specification.complexity === 'complex') {
            risks.push({
                id: 'complexity-risk',
                description: 'High feature complexity may lead to implementation challenges',
                probability: AUTONOMOUS_DEVELOPMENT_DEFAULTS.RISK_ASSESSMENT.HIGH_PROBABILITY_COMPLEX,
                impact: 'high',
                category: 'technical',
                mitigation: 'Break down into smaller, manageable components'
            });
        }
        // Integration risk
        if (architecturalAnalysis?.codeSmells?.length > 5) {
            risks.push({
                id: 'integration-risk',
                description: 'Existing code smells may complicate integration',
                probability: AUTONOMOUS_DEVELOPMENT_DEFAULTS.RISK_ASSESSMENT.INTEGRATION_RISK_PROBABILITY,
                impact: 'medium',
                category: 'integration',
                mitigation: 'Refactor problematic areas before integration'
            });
        }
        // Calculate overall risk (fix division by zero bug)
        const avgProbability = risks.length > 0
            ? risks.reduce((sum, r) => sum + r.probability, 0) / risks.length
            : 0;
        const overallRisk = getRiskLevel(avgProbability);
        return ok({
            overallRisk,
            risks,
            mitigationStrategies: risks.map(risk => ({
                riskId: risk.id,
                strategy: risk.mitigation,
                cost: AUTONOMOUS_DEVELOPMENT_DEFAULTS.RISK_ASSESSMENT.DEFAULT_MITIGATION_COST,
                effectiveness: AUTONOMOUS_DEVELOPMENT_DEFAULTS.RISK_ASSESSMENT.DEFAULT_MITIGATION_EFFECTIVENESS
            }))
        });
    }
    generateTimeline(phases, dependencies) {
        const startDate = new Date();
        let currentDate = new Date(startDate);
        const milestones = [];
        for (const phase of phases) {
            const phaseEndDate = new Date(currentDate);
            phaseEndDate.setHours(currentDate.getHours() + phase.duration);
            milestones.push({
                id: phase.id,
                name: `${phase.name} Complete`,
                date: phaseEndDate,
                deliverables: phase.deliverables,
                criteria: [`All ${phase.tasks.length} tasks completed`]
            });
            currentDate = phaseEndDate;
        }
        return {
            startDate,
            endDate: currentDate,
            milestones,
            criticalPath: phases.map(p => p.id)
        };
    }
    calculateResourceRequirementsFromPlan(specification, phases) {
        const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
        const resourceCalc = calculateResourceRequirements(totalTasks);
        return {
            computationalComplexity: specification.complexity === 'simple' ? 'low' :
                specification.complexity === 'moderate' ? 'medium' : 'high',
            memoryRequirements: resourceCalc.memoryRequirements,
            diskSpace: resourceCalc.diskSpace,
            externalDependencies: [], // Would analyze from requirements
            developmentTools: [...AUTONOMOUS_DEVELOPMENT_DEFAULTS.DEFAULT_DEVELOPMENT_TOOLS]
        };
    }
    calculateExecutionOrder(phases, dependencies) {
        try {
            // Simple topological sort for phase execution order
            const order = [];
            const visited = new Set();
            const visiting = new Set();
            const visit = (phaseId) => {
                if (visiting.has(phaseId)) {
                    throw new Error(`Circular dependency detected involving phase: ${phaseId}`);
                }
                if (visited.has(phaseId))
                    return;
                visiting.add(phaseId);
                // Visit dependencies first
                const phaseDependencies = dependencies
                    .filter(dep => dep.to === phaseId)
                    .map(dep => dep.from);
                for (const depId of phaseDependencies) {
                    visit(depId);
                }
                visiting.delete(phaseId);
                visited.add(phaseId);
                order.push(phaseId);
            };
            for (const phase of phases) {
                visit(phase.id);
            }
            return ok(order);
        }
        catch (error) {
            return errFromError(error instanceof Error ? error : new Error(String(error)), 'DEPENDENCY_CYCLE');
        }
    }
    async executePhase(phase, specification, operationId) {
        const startTime = performance.now();
        const taskResults = [];
        const issues = [];
        try {
            for (const task of phase.tasks) {
                logger.info(`Executing task: ${task.name}`, { taskId: task.id });
                const taskResult = await this.executeTask(task, specification, operationId);
                taskResults.push(taskResult);
                if (taskResult.status === 'failed') {
                    issues.push({
                        id: `task-${task.id}-failed`,
                        type: 'error',
                        category: 'implementation',
                        description: `Task failed: ${task.name}`,
                        severity: 'high',
                        autoFixable: false
                    });
                }
            }
            const completedTasks = taskResults.filter(r => r.status === 'completed').length;
            const completionRate = completedTasks / phase.tasks.length;
            const status = completionRate === 1 ? 'completed' :
                completionRate > 0.5 ? 'partial' : 'failed';
            const duration = performance.now() - startTime;
            return {
                phaseId: phase.id,
                status,
                completionRate,
                duration,
                tasks: taskResults,
                issues
            };
        }
        catch (error) {
            logger.error(`Phase execution failed: ${phase.name}`, error);
            return {
                phaseId: phase.id,
                status: 'failed',
                completionRate: 0,
                duration: performance.now() - startTime,
                tasks: taskResults,
                issues: [{
                        id: `phase-${phase.id}-error`,
                        type: 'error',
                        category: 'execution',
                        description: normalizeError(error).message,
                        severity: 'critical',
                        autoFixable: false
                    }]
            };
        }
    }
    async executeTask(task, specification, operationId) {
        const startTime = performance.now();
        const artifacts = [];
        const validationResults = [];
        try {
            switch (task.type) {
                case 'analysis':
                    // Perform analysis tasks
                    break;
                case 'design':
                    // Perform design tasks
                    break;
                case 'implementation':
                    // Generate implementation code
                    const codeArtifacts = await this.generateCodeForTask(task, specification, operationId);
                    artifacts.push(...codeArtifacts);
                    break;
                case 'testing':
                    // Generate tests
                    const testArtifacts = await this.generateTestsForTask(task, specification, operationId);
                    artifacts.push(...testArtifacts);
                    break;
            }
            // Validate task completion using centralized utility
            const criteriaResults = await validateTaskCriteria(task.validation, artifacts, {
                taskId: task.id,
                metadata: { taskType: task.type, taskName: task.name }
            });
            validationResults.push(...criteriaResults);
            const allValidationsSuccess = allValidationsPassed(validationResults);
            const status = allValidationsSuccess ? 'completed' : 'failed';
            return {
                taskId: task.id,
                status,
                duration: performance.now() - startTime,
                artifacts,
                validationResults
            };
        }
        catch (error) {
            logger.error(`Task execution failed: ${task.name}`, error);
            return {
                taskId: task.id,
                status: 'failed',
                duration: performance.now() - startTime,
                artifacts,
                validationResults: [{
                        criterion: 'execution',
                        passed: false,
                        details: normalizeError(error).message
                    }]
            };
        }
    }
    async generateCodeForTask(task, specification, operationId) {
        // Placeholder for code generation logic
        // Would integrate with AI models for actual code generation
        const generatedFiles = [`src/features/${task.id}.ts`];
        // Track file creation for rollback
        if (operationId) {
            for (const filePath of generatedFiles) {
                const backupResult = await this.rollbackManager.backupFile(operationId, filePath);
                if (isErr(backupResult)) {
                    logger.warn(`Failed to backup file for rollback: ${filePath}`, backupResult.error);
                }
            }
        }
        return generatedFiles;
    }
    async generateTestsForTask(task, specification, operationId) {
        // Use existing TestGenerator
        const files = task.files.map(f => ({ path: f, content: '', type: 'typescript' }));
        const testSuite = await this.testGenerator.generateTestSuite(files, {
            framework: 'jest',
            testTypes: ['unit', 'integration'],
            coverage: 'comprehensive'
        });
        const generatedTestFiles = testSuite.tests.map(test => test.testFile);
        // Track test file creation for rollback
        if (operationId) {
            for (const filePath of generatedTestFiles) {
                const backupResult = await this.rollbackManager.backupFile(operationId, filePath);
                if (isErr(backupResult)) {
                    logger.warn(`Failed to backup test file for rollback: ${filePath}`, backupResult.error);
                }
            }
        }
        return generatedTestFiles;
    }
    async validateTaskCriterion(criterion, task, artifacts) {
        // Use centralized validation utility
        const context = {
            taskId: task.id,
            artifacts,
            metadata: { taskType: task.type, taskName: task.name }
        };
        switch (criterion) {
            case 'compileCheck':
                return await validateTaskCriteria({ compileCheck: true }, artifacts, context).then(results => results[0]);
            case 'testCoverage':
                const coverageThreshold = typeof task.validation.testCoverage === 'number'
                    ? task.validation.testCoverage
                    : getTestCoverageThreshold('recommended');
                return await validateTaskCriteria({ compileCheck: false, testCoverage: coverageThreshold }, artifacts, context).then(results => results[1] || results[0]);
            case 'codeQualityScore':
                const qualityThreshold = typeof task.validation.codeQualityScore === 'number'
                    ? task.validation.codeQualityScore
                    : AUTONOMOUS_DEVELOPMENT_DEFAULTS.CODE_QUALITY.RECOMMENDED_SCORE;
                return await validateTaskCriteria({ compileCheck: false, codeQualityScore: qualityThreshold }, artifacts, context).then(results => results[1] || results[0]);
            default:
                return {
                    criterion,
                    passed: true,
                    details: 'Validation passed',
                    context
                };
        }
    }
    calculateImplementationMetrics(phaseResults, artifacts) {
        const totalTasks = phaseResults.reduce((sum, phase) => sum + phase.tasks.length, 0);
        const completedTasks = phaseResults.reduce((sum, phase) => sum + phase.tasks.filter(t => t.status === 'completed').length, 0);
        return {
            totalDuration: phaseResults.reduce((sum, phase) => sum + phase.duration, 0),
            successRate: completedTasks / totalTasks,
            codeQuality: AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.DEFAULT_CODE_QUALITY,
            testCoverage: AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.DEFAULT_TEST_COVERAGE,
            performanceScore: AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.DEFAULT_PERFORMANCE_SCORE,
            linesOfCode: artifacts.filter(a => a.type === 'code').reduce((sum, a) => sum + a.size, 0),
            filesModified: artifacts.length,
            testsGenerated: artifacts.filter(a => a.type === 'test').length
        };
    }
    generateImplementationRecommendations(phaseResults, issues, metrics) {
        const recommendations = [];
        if (metrics.successRate < AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.MIN_SUCCESS_RATE_RECOMMENDATION) {
            recommendations.push('Consider breaking down complex tasks into smaller components');
        }
        if (metrics.testCoverage < AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.MIN_TEST_COVERAGE_RECOMMENDATION) {
            recommendations.push('Increase test coverage for better reliability');
        }
        if (issues.filter(i => i.severity === 'high').length > AUTONOMOUS_DEVELOPMENT_DEFAULTS.METRICS.HIGH_SEVERITY_ISSUE_THRESHOLD) {
            recommendations.push('Address high-severity issues before deployment');
        }
        return recommendations;
    }
}
//# sourceMappingURL=autonomous-developer.js.map