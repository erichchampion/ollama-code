/**
 * Autonomous Developer
 *
 * Implements autonomous feature development from specifications with intelligent
 * planning, decomposition, and safety validation.
 */
import { Result, ErrorDetails } from '../types/result.js';
import { ValidationResult, ValidationCriteria } from '../utils/validation-utils.js';
export interface FeatureSpecification {
    title: string;
    description: string;
    requirements: string[];
    acceptanceCriteria: string[];
    constraints?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    complexity?: 'simple' | 'moderate' | 'complex';
    estimatedHours?: number;
}
export interface ImplementationPlan {
    phases: ImplementationPhase[];
    dependencies: PhaseDependency[];
    riskAssessment: RiskAssessment;
    timeline: Timeline;
    resources: ResourceRequirements;
}
export interface ImplementationPhase {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    deliverables: string[];
    duration: number;
    dependencies: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
export interface Task {
    id: string;
    name: string;
    type: 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation';
    description: string;
    estimatedHours: number;
    files: string[];
    dependencies: string[];
    validation: ValidationCriteria;
}
export interface PhaseDependency {
    from: string;
    to: string;
    type: 'blocking' | 'parallel' | 'optional';
}
export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high';
    risks: Risk[];
    mitigationStrategies: MitigationStrategy[];
}
export interface Risk {
    id: string;
    description: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
    category: 'technical' | 'architectural' | 'integration' | 'performance' | 'security';
    mitigation: string;
}
export interface MitigationStrategy {
    riskId: string;
    strategy: string;
    cost: number;
    effectiveness: number;
}
export interface Timeline {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
    criticalPath: string[];
}
export interface Milestone {
    id: string;
    name: string;
    date: Date;
    deliverables: string[];
    criteria: string[];
}
export interface ResourceRequirements {
    computationalComplexity: 'low' | 'medium' | 'high';
    memoryRequirements: number;
    diskSpace: number;
    externalDependencies: string[];
    developmentTools: string[];
}
export interface ImplementationResult {
    success: boolean;
    phases: PhaseResult[];
    metrics: ImplementationMetrics;
    artifacts: GeneratedArtifact[];
    issues: Issue[];
    recommendations: string[];
}
export interface PhaseResult {
    phaseId: string;
    status: 'completed' | 'failed' | 'partial';
    completionRate: number;
    duration: number;
    tasks: TaskResult[];
    issues: Issue[];
}
export interface TaskResult {
    taskId: string;
    status: 'completed' | 'failed' | 'skipped';
    duration: number;
    artifacts: string[];
    validationResults: ValidationResult[];
}
export interface ImplementationMetrics {
    totalDuration: number;
    successRate: number;
    codeQuality: number;
    testCoverage: number;
    performanceScore: number;
    linesOfCode: number;
    filesModified: number;
    testsGenerated: number;
}
export interface GeneratedArtifact {
    type: 'code' | 'test' | 'documentation' | 'config';
    path: string;
    size: number;
    quality: number;
    coverage?: number;
}
export interface Issue {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    file?: string;
    line?: number;
    suggestion?: string;
    autoFixable: boolean;
}
export declare class AutonomousDeveloper {
    private config;
    private architecturalAnalyzer;
    private testGenerator;
    private rollbackManager;
    private isConfigValid;
    constructor();
    /**
     * Validate configuration on initialization
     */
    private validateInitialConfiguration;
    /**
     * Check if the component is properly configured
     */
    isConfigurationValid(): boolean;
    /**
     * Parse and understand a feature specification
     */
    parseSpecification(specification: string | FeatureSpecification): Promise<Result<FeatureSpecification, ErrorDetails>>;
    /**
     * Create comprehensive implementation plan
     */
    createImplementationPlan(specification: FeatureSpecification): Promise<Result<ImplementationPlan, ErrorDetails>>;
    /**
     * Execute implementation plan autonomously
     */
    implementFeature(specification: FeatureSpecification, plan: ImplementationPlan): Promise<Result<ImplementationResult, ErrorDetails>>;
    private parseTextSpecification;
    private enrichSpecification;
    private calculateSpecificationComplexity;
    private getCodebaseContext;
    private generateImplementationPhases;
    private generateImplementationTasks;
    private analyzePhaseDependencies;
    private assessImplementationRisks;
    private generateTimeline;
    private calculateResourceRequirementsFromPlan;
    private calculateExecutionOrder;
    private executePhase;
    private executeTask;
    private generateCodeForTask;
    private generateTestsForTask;
    private validateTaskCriterion;
    private calculateImplementationMetrics;
    private generateImplementationRecommendations;
}
