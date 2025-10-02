/**
 * Feature Implementation Workflow Mock
 * Mock implementation for testing autonomous feature development capabilities
 */

import {
  FEATURE_IMPLEMENTATION_CONSTANTS,
  FEATURE_COMPLEXITY_WEIGHTS,
  FEATURE_TIME_ESTIMATES,
} from './test-constants';

/**
 * Complexity level of a feature
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very_complex';

/**
 * Priority level for tasks
 */
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Risk level assessment
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Resource type required for implementation
 */
export type ResourceType = 'backend' | 'frontend' | 'database' | 'infrastructure' | 'design' | 'qa';

/**
 * Feature specification input
 */
export interface FeatureSpecification {
  /** Specification text (plain text or technical format) */
  text: string;
  /** Type of specification */
  type: 'text' | 'technical';
  /** Project context (optional) */
  projectContext?: string;
  /** Acceptance criteria (for technical specs) */
  acceptanceCriteria?: string[];
}

/**
 * Parsed requirement from specification
 */
export interface ParsedRequirement {
  /** Requirement ID */
  id: string;
  /** Requirement description */
  description: string;
  /** Priority level */
  priority: PriorityLevel;
  /** Category (feature, bug fix, enhancement, etc.) */
  category: string;
  /** Acceptance criteria */
  acceptanceCriteria: string[];
  /** Technical constraints */
  technicalConstraints?: string[];
}

/**
 * Complexity analysis result
 */
export interface ComplexityAnalysis {
  /** Overall complexity level */
  level: ComplexityLevel;
  /** Complexity score (0-100) */
  score: number;
  /** Number of components affected */
  componentsAffected: number;
  /** Number of dependencies */
  dependencies: number;
  /** Technical challenges identified */
  technicalChallenges: string[];
  /** Justification for complexity rating */
  justification: string;
}

/**
 * Time estimation result
 */
export interface TimeEstimation {
  /** Estimated hours */
  hours: number;
  /** Estimated days */
  days: number;
  /** Confidence level (0-100) */
  confidence: number;
  /** Breakdown by phase */
  breakdown: {
    design: number;
    implementation: number;
    testing: number;
    review: number;
  };
}

/**
 * Resource requirements
 */
export interface ResourceRequirements {
  /** Required team members by role */
  roles: Array<{
    type: ResourceType;
    count: number;
    duration: number; // hours
  }>;
  /** Total person-hours */
  totalPersonHours: number;
  /** External dependencies */
  externalDependencies: string[];
  /** Infrastructure requirements */
  infrastructure: string[];
}

/**
 * Implementation task
 */
export interface ImplementationTask {
  /** Task ID */
  id: string;
  /** Task name */
  name: string;
  /** Task description */
  description: string;
  /** Phase number */
  phase: number;
  /** Priority */
  priority: PriorityLevel;
  /** Estimated hours */
  estimatedHours: number;
  /** Dependencies (task IDs) */
  dependencies: string[];
  /** Assigned role */
  assignedRole: ResourceType;
  /** Risk level */
  risk: RiskLevel;
}

/**
 * Implementation phase
 */
export interface ImplementationPhase {
  /** Phase number */
  number: number;
  /** Phase name */
  name: string;
  /** Phase description */
  description: string;
  /** Tasks in this phase */
  tasks: ImplementationTask[];
  /** Duration in hours */
  duration: number;
  /** Milestone */
  milestone: string;
}

/**
 * Risk assessment
 */
export interface RiskAssessment {
  /** Risk ID */
  id: string;
  /** Risk description */
  description: string;
  /** Risk level */
  level: RiskLevel;
  /** Probability (0-100) */
  probability: number;
  /** Impact (0-100) */
  impact: number;
  /** Risk score (probability * impact) */
  score: number;
  /** Mitigation strategies */
  mitigationStrategies: string[];
  /** Owner */
  owner?: ResourceType;
}

/**
 * Implementation plan
 */
export interface ImplementationPlan {
  /** Parsed requirements */
  requirements: ParsedRequirement[];
  /** Complexity analysis */
  complexity: ComplexityAnalysis;
  /** Time estimation */
  timeEstimation: TimeEstimation;
  /** Resource requirements */
  resources: ResourceRequirements;
  /** Implementation phases */
  phases: ImplementationPhase[];
  /** Risk assessments */
  risks: RiskAssessment[];
  /** Critical path tasks */
  criticalPath: string[]; // task IDs
  /** Timeline milestones */
  milestones: Array<{
    name: string;
    date: string;
    deliverables: string[];
  }>;
}

/**
 * Feature Implementation Workflow Configuration
 */
export interface FeatureImplementationConfig {
  /** Include time estimation */
  includeTimeEstimation?: boolean;
  /** Include risk assessment */
  includeRiskAssessment?: boolean;
  /** Maximum phases */
  maxPhases?: number;
  /** Team size */
  teamSize?: number;
}

/**
 * Mock Feature Implementation Workflow
 * Simulates AI-powered feature specification parsing and implementation planning
 */
export class FeatureImplementationWorkflow {
  constructor(private config: FeatureImplementationConfig = {}) {
    this.config = {
      includeTimeEstimation: true,
      includeRiskAssessment: true,
      maxPhases: FEATURE_IMPLEMENTATION_CONSTANTS.DEFAULT_MAX_PHASES,
      teamSize: FEATURE_IMPLEMENTATION_CONSTANTS.DEFAULT_TEAM_SIZE,
      ...config,
    };
  }

  /**
   * Parse feature specification into structured requirements
   */
  async parseSpecification(spec: FeatureSpecification): Promise<ParsedRequirement[]> {
    // Mock implementation - in real version, this would use AI to parse the spec
    const requirements: ParsedRequirement[] = [];

    // Simple heuristic: split by sentences/paragraphs
    const lines = spec.text.split('\n').filter((line) => line.trim().length > 0);

    let reqId = 1;
    for (const line of lines) {
      if (line.length < FEATURE_IMPLEMENTATION_CONSTANTS.MIN_REQUIREMENT_LENGTH) {
        continue;
      }

      // Determine priority based on keywords
      let priority: PriorityLevel = 'medium';
      if (line.toLowerCase().includes('critical') || line.toLowerCase().includes('must')) {
        priority = 'critical';
      } else if (line.toLowerCase().includes('important') || line.toLowerCase().includes('should')) {
        priority = 'high';
      } else if (line.toLowerCase().includes('nice') || line.toLowerCase().includes('could')) {
        priority = 'low';
      }

      // Determine category
      let category = 'feature';
      if (line.toLowerCase().includes('fix') || line.toLowerCase().includes('bug')) {
        category = 'bug_fix';
      } else if (line.toLowerCase().includes('improve') || line.toLowerCase().includes('enhance')) {
        category = 'enhancement';
      } else if (line.toLowerCase().includes('refactor')) {
        category = 'refactoring';
      }

      requirements.push({
        id: `REQ-${reqId.toString().padStart(3, '0')}`,
        description: line.trim(),
        priority,
        category,
        acceptanceCriteria: spec.acceptanceCriteria || this.extractAcceptanceCriteria(line),
        technicalConstraints: this.extractTechnicalConstraints(line),
      });

      reqId++;
    }

    return requirements;
  }

  /**
   * Analyze feature complexity
   */
  async analyzeComplexity(requirements: ParsedRequirement[]): Promise<ComplexityAnalysis> {
    // Calculate complexity score based on multiple factors
    const componentCount = this.estimateComponentCount(requirements);
    const dependencyCount = this.estimateDependencyCount(requirements);
    const technicalChallenges = this.identifyTechnicalChallenges(requirements);

    // Weighted complexity score
    const componentScore = Math.min(
      FEATURE_COMPLEXITY_WEIGHTS.MAX_SCORE,
      componentCount * FEATURE_COMPLEXITY_WEIGHTS.COMPONENT_WEIGHT
    );
    const dependencyScore = Math.min(
      FEATURE_COMPLEXITY_WEIGHTS.MAX_SCORE,
      dependencyCount * FEATURE_COMPLEXITY_WEIGHTS.DEPENDENCY_WEIGHT
    );
    const challengeScore = Math.min(
      FEATURE_COMPLEXITY_WEIGHTS.MAX_SCORE,
      technicalChallenges.length * FEATURE_COMPLEXITY_WEIGHTS.CHALLENGE_WEIGHT
    );

    const totalScore = Math.min(
      FEATURE_COMPLEXITY_WEIGHTS.MAX_SCORE,
      componentScore * FEATURE_COMPLEXITY_WEIGHTS.COMPONENT_MULTIPLIER +
        dependencyScore * FEATURE_COMPLEXITY_WEIGHTS.DEPENDENCY_MULTIPLIER +
        challengeScore * FEATURE_COMPLEXITY_WEIGHTS.CHALLENGE_MULTIPLIER
    );

    // Determine complexity level
    let level: ComplexityLevel;
    if (totalScore < FEATURE_COMPLEXITY_WEIGHTS.SIMPLE_THRESHOLD) {
      level = 'simple';
    } else if (totalScore < FEATURE_COMPLEXITY_WEIGHTS.MODERATE_THRESHOLD) {
      level = 'moderate';
    } else if (totalScore < FEATURE_COMPLEXITY_WEIGHTS.COMPLEX_THRESHOLD) {
      level = 'complex';
    } else {
      level = 'very_complex';
    }

    return {
      level,
      score: Math.round(totalScore),
      componentsAffected: componentCount,
      dependencies: dependencyCount,
      technicalChallenges,
      justification: this.generateComplexityJustification(level, componentCount, dependencyCount, technicalChallenges),
    };
  }

  /**
   * Estimate implementation time
   */
  async estimateTime(requirements: ParsedRequirement[], complexity: ComplexityAnalysis): Promise<TimeEstimation> {
    if (!this.config.includeTimeEstimation) {
      return {
        hours: 0,
        days: 0,
        confidence: 0,
        breakdown: { design: 0, implementation: 0, testing: 0, review: 0 },
      };
    }

    // Base hours from complexity level
    const baseHours = FEATURE_TIME_ESTIMATES.BASE_HOURS[complexity.level];

    // Add hours per requirement
    const requirementHours = requirements.length * FEATURE_TIME_ESTIMATES.HOURS_PER_REQUIREMENT;

    // Add hours per technical challenge
    const challengeHours = complexity.technicalChallenges.length * FEATURE_TIME_ESTIMATES.HOURS_PER_CHALLENGE;

    const totalHours = baseHours + requirementHours + challengeHours;

    // Calculate breakdown (percentages from FEATURE_TIME_ESTIMATES)
    const breakdown = {
      design: Math.round(totalHours * FEATURE_TIME_ESTIMATES.PHASE_DISTRIBUTION.DESIGN),
      implementation: Math.round(totalHours * FEATURE_TIME_ESTIMATES.PHASE_DISTRIBUTION.IMPLEMENTATION),
      testing: Math.round(totalHours * FEATURE_TIME_ESTIMATES.PHASE_DISTRIBUTION.TESTING),
      review: Math.round(totalHours * FEATURE_TIME_ESTIMATES.PHASE_DISTRIBUTION.REVIEW),
    };

    // Confidence based on complexity (simpler = more confident)
    const confidence = Math.max(
      FEATURE_TIME_ESTIMATES.MIN_CONFIDENCE,
      FEATURE_TIME_ESTIMATES.MAX_CONFIDENCE - complexity.score / 2
    );

    return {
      hours: totalHours,
      days: Math.ceil(totalHours / FEATURE_TIME_ESTIMATES.HOURS_PER_DAY),
      confidence: Math.round(confidence),
      breakdown,
    };
  }

  /**
   * Identify resource requirements
   */
  async identifyResources(requirements: ParsedRequirement[], complexity: ComplexityAnalysis): Promise<ResourceRequirements> {
    const roles: Array<{ type: ResourceType; count: number; duration: number }> = [];

    // Analyze requirements to determine roles needed
    const needsBackend = requirements.some((r) => this.requiresBackend(r.description));
    const needsFrontend = requirements.some((r) => this.requiresFrontend(r.description));
    const needsDatabase = requirements.some((r) => this.requiresDatabase(r.description));
    const needsInfrastructure = requirements.some((r) => this.requiresInfrastructure(r.description));

    const baseHours = FEATURE_TIME_ESTIMATES.BASE_HOURS[complexity.level];

    if (needsBackend) {
      roles.push({
        type: 'backend',
        count: 1,
        duration: baseHours * FEATURE_IMPLEMENTATION_CONSTANTS.BACKEND_EFFORT_RATIO,
      });
    }

    if (needsFrontend) {
      roles.push({
        type: 'frontend',
        count: 1,
        duration: baseHours * FEATURE_IMPLEMENTATION_CONSTANTS.FRONTEND_EFFORT_RATIO,
      });
    }

    if (needsDatabase) {
      roles.push({
        type: 'database',
        count: 1,
        duration: baseHours * FEATURE_IMPLEMENTATION_CONSTANTS.DATABASE_EFFORT_RATIO,
      });
    }

    if (needsInfrastructure) {
      roles.push({
        type: 'infrastructure',
        count: 1,
        duration: baseHours * FEATURE_IMPLEMENTATION_CONSTANTS.INFRA_EFFORT_RATIO,
      });
    }

    // Always need QA
    roles.push({
      type: 'qa',
      count: 1,
      duration: baseHours * FEATURE_IMPLEMENTATION_CONSTANTS.QA_EFFORT_RATIO,
    });

    const totalPersonHours = roles.reduce((sum, role) => sum + role.duration * role.count, 0);

    return {
      roles,
      totalPersonHours,
      externalDependencies: this.identifyExternalDependencies(requirements),
      infrastructure: this.identifyInfrastructure(requirements),
    };
  }

  /**
   * Generate implementation plan
   */
  async generatePlan(spec: FeatureSpecification): Promise<ImplementationPlan> {
    // Parse specification
    const requirements = await this.parseSpecification(spec);

    // Analyze complexity
    const complexity = await this.analyzeComplexity(requirements);

    // Estimate time
    const timeEstimation = await this.estimateTime(requirements, complexity);

    // Identify resources
    const resources = await this.identifyResources(requirements, complexity);

    // Decompose into phases and tasks
    const phases = await this.decomposeTasks(requirements, complexity, timeEstimation);

    // Assess risks
    const risks = this.config.includeRiskAssessment ? await this.assessRisks(requirements, complexity) : [];

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(phases);

    // Generate milestones
    const milestones = this.generateMilestones(phases, timeEstimation);

    return {
      requirements,
      complexity,
      timeEstimation,
      resources,
      phases,
      risks,
      criticalPath,
      milestones,
    };
  }

  /**
   * Decompose into phases and tasks
   */
  async decomposeTasks(
    requirements: ParsedRequirement[],
    complexity: ComplexityAnalysis,
    timeEstimation: TimeEstimation
  ): Promise<ImplementationPhase[]> {
    const phases: ImplementationPhase[] = [];

    // Phase 1: Design & Architecture
    phases.push({
      number: 1,
      name: 'Design & Architecture',
      description: 'Design system architecture and create technical specifications',
      tasks: this.createDesignTasks(requirements, timeEstimation.breakdown.design),
      duration: timeEstimation.breakdown.design,
      milestone: 'Architecture Review Complete',
    });

    // Phase 2: Implementation
    phases.push({
      number: 2,
      name: 'Implementation',
      description: 'Implement features according to specifications',
      tasks: this.createImplementationTasks(requirements, timeEstimation.breakdown.implementation),
      duration: timeEstimation.breakdown.implementation,
      milestone: 'Feature Implementation Complete',
    });

    // Phase 3: Testing
    phases.push({
      number: 3,
      name: 'Testing & QA',
      description: 'Comprehensive testing and quality assurance',
      tasks: this.createTestingTasks(requirements, timeEstimation.breakdown.testing),
      duration: timeEstimation.breakdown.testing,
      milestone: 'All Tests Passing',
    });

    // Phase 4: Review & Deployment
    phases.push({
      number: 4,
      name: 'Review & Deployment',
      description: 'Code review and production deployment',
      tasks: this.createReviewTasks(requirements, timeEstimation.breakdown.review),
      duration: timeEstimation.breakdown.review,
      milestone: 'Production Deployment Complete',
    });

    return phases;
  }

  /**
   * Assess implementation risks
   */
  async assessRisks(requirements: ParsedRequirement[], complexity: ComplexityAnalysis): Promise<RiskAssessment[]> {
    const risks: RiskAssessment[] = [];

    // Complexity-based risks
    if (complexity.level === 'complex' || complexity.level === 'very_complex') {
      risks.push({
        id: 'RISK-001',
        description: 'High complexity may lead to timeline delays',
        level: 'high',
        probability: 70,
        impact: 80,
        score: 56,
        mitigationStrategies: [
          'Break down into smaller deliverables',
          'Add buffer time to estimates',
          'Increase team size if needed',
        ],
        owner: 'backend',
      });
    }

    // Technical challenge risks
    if (complexity.technicalChallenges.length > 2) {
      risks.push({
        id: 'RISK-002',
        description: 'Multiple technical challenges may require research and prototyping',
        level: 'medium',
        probability: 60,
        impact: 70,
        score: 42,
        mitigationStrategies: [
          'Allocate time for spike research',
          'Create proof-of-concept prototypes',
          'Consult with technical experts',
        ],
        owner: 'backend',
      });
    }

    // Dependency risks
    if (complexity.dependencies > 3) {
      risks.push({
        id: 'RISK-003',
        description: 'Multiple dependencies may cause integration issues',
        level: 'medium',
        probability: 50,
        impact: 60,
        score: 30,
        mitigationStrategies: [
          'Create integration test plan early',
          'Use feature flags for gradual rollout',
          'Maintain backward compatibility',
        ],
        owner: 'backend',
      });
    }

    return risks;
  }

  /**
   * Identify critical path through tasks
   */
  identifyCriticalPath(phases: ImplementationPhase[]): string[] {
    const criticalTasks: string[] = [];

    for (const phase of phases) {
      // Find longest task chain in each phase
      const phaseCriticalTask = phase.tasks.reduce((longest, task) => {
        return task.estimatedHours > longest.estimatedHours ? task : longest;
      }, phase.tasks[0]);

      if (phaseCriticalTask) {
        criticalTasks.push(phaseCriticalTask.id);
      }
    }

    return criticalTasks;
  }

  /**
   * Generate timeline milestones
   */
  generateMilestones(
    phases: ImplementationPhase[],
    timeEstimation: TimeEstimation
  ): Array<{ name: string; date: string; deliverables: string[] }> {
    const milestones: Array<{ name: string; date: string; deliverables: string[] }> = [];
    let cumulativeDays = 0;

    for (const phase of phases) {
      const phaseDays = Math.ceil(phase.duration / FEATURE_TIME_ESTIMATES.HOURS_PER_DAY);
      cumulativeDays += phaseDays;

      const date = new Date();
      date.setDate(date.getDate() + cumulativeDays);

      milestones.push({
        name: phase.milestone,
        date: date.toISOString().split('T')[0],
        deliverables: phase.tasks.map((t) => t.name),
      });
    }

    return milestones;
  }

  // Helper methods

  private extractAcceptanceCriteria(text: string): string[] {
    // Simple extraction - in real version, would use AI
    const criteria: string[] = [];
    if (text.toLowerCase().includes('user')) {
      criteria.push('User can successfully use the feature');
    }
    if (text.toLowerCase().includes('test')) {
      criteria.push('Feature has comprehensive test coverage');
    }
    criteria.push('Feature meets performance requirements');
    return criteria;
  }

  private extractTechnicalConstraints(text: string): string[] {
    const constraints: string[] = [];
    if (text.toLowerCase().includes('performance')) {
      constraints.push('Must maintain sub-second response time');
    }
    if (text.toLowerCase().includes('scale')) {
      constraints.push('Must handle 10000+ concurrent users');
    }
    return constraints;
  }

  private estimateComponentCount(requirements: ParsedRequirement[]): number {
    // Heuristic: ~1-2 components per requirement
    return requirements.length * 1.5;
  }

  private estimateDependencyCount(requirements: ParsedRequirement[]): number {
    // Heuristic: ~0.5 dependencies per requirement
    return Math.floor(requirements.length * 0.5);
  }

  private identifyTechnicalChallenges(requirements: ParsedRequirement[]): string[] {
    const challenges: string[] = [];
    const allText = requirements.map((r) => r.description.toLowerCase()).join(' ');

    if (allText.includes('real-time') || allText.includes('realtime')) {
      challenges.push('Real-time data synchronization');
    }
    if (allText.includes('scale') || allText.includes('performance')) {
      challenges.push('High-performance architecture');
    }
    if (allText.includes('security') || allText.includes('encryption')) {
      challenges.push('Security and encryption implementation');
    }
    if (allText.includes('integration') || allText.includes('api')) {
      challenges.push('Third-party API integration');
    }

    return challenges;
  }

  private generateComplexityJustification(
    level: ComplexityLevel,
    components: number,
    dependencies: number,
    challenges: string[]
  ): string {
    return `Complexity rated as ${level} based on ${components} affected components, ${dependencies} dependencies, and ${challenges.length} technical challenges`;
  }

  private requiresBackend(description: string): boolean {
    const text = description.toLowerCase();
    return (
      text.includes('api') ||
      text.includes('backend') ||
      text.includes('server') ||
      text.includes('database') ||
      text.includes('endpoint')
    );
  }

  private requiresFrontend(description: string): boolean {
    const text = description.toLowerCase();
    return (
      text.includes('ui') ||
      text.includes('frontend') ||
      text.includes('user interface') ||
      text.includes('component') ||
      text.includes('page')
    );
  }

  private requiresDatabase(description: string): boolean {
    const text = description.toLowerCase();
    return (
      text.includes('database') ||
      text.includes('storage') ||
      text.includes('persist') ||
      text.includes('query') ||
      text.includes('schema')
    );
  }

  private requiresInfrastructure(description: string): boolean {
    const text = description.toLowerCase();
    return (
      text.includes('deploy') ||
      text.includes('infrastructure') ||
      text.includes('container') ||
      text.includes('kubernetes') ||
      text.includes('scaling')
    );
  }

  private identifyExternalDependencies(requirements: ParsedRequirement[]): string[] {
    const deps: string[] = [];
    const allText = requirements.map((r) => r.description.toLowerCase()).join(' ');

    if (allText.includes('stripe') || allText.includes('payment')) {
      deps.push('Stripe Payment API');
    }
    if (allText.includes('auth') || allText.includes('oauth')) {
      deps.push('OAuth Provider');
    }
    if (allText.includes('email')) {
      deps.push('Email Service Provider');
    }

    return deps;
  }

  private identifyInfrastructure(requirements: ParsedRequirement[]): string[] {
    const infra: string[] = [];
    const allText = requirements.map((r) => r.description.toLowerCase()).join(' ');

    if (allText.includes('database')) {
      infra.push('PostgreSQL Database');
    }
    if (allText.includes('cache') || allText.includes('redis')) {
      infra.push('Redis Cache');
    }
    if (allText.includes('queue') || allText.includes('message')) {
      infra.push('Message Queue');
    }

    return infra;
  }

  private createDesignTasks(requirements: ParsedRequirement[], totalHours: number): ImplementationTask[] {
    const tasks: ImplementationTask[] = [];
    const hoursPerTask = totalHours / 3;

    tasks.push({
      id: 'TASK-D001',
      name: 'Create System Architecture',
      description: 'Design overall system architecture and component interactions',
      phase: 1,
      priority: 'critical',
      estimatedHours: hoursPerTask,
      dependencies: [],
      assignedRole: 'backend',
      risk: 'medium',
    });

    tasks.push({
      id: 'TASK-D002',
      name: 'Design Database Schema',
      description: 'Design database schema and data models',
      phase: 1,
      priority: 'high',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-D001'],
      assignedRole: 'database',
      risk: 'low',
    });

    tasks.push({
      id: 'TASK-D003',
      name: 'Create API Specifications',
      description: 'Define API endpoints and contracts',
      phase: 1,
      priority: 'high',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-D001'],
      assignedRole: 'backend',
      risk: 'low',
    });

    return tasks;
  }

  private createImplementationTasks(requirements: ParsedRequirement[], totalHours: number): ImplementationTask[] {
    const tasks: ImplementationTask[] = [];
    const hoursPerReq = totalHours / requirements.length;

    requirements.forEach((req, index) => {
      const taskId = `TASK-I${(index + 1).toString().padStart(3, '0')}`;
      const prevTaskId = index > 0 ? `TASK-I${index.toString().padStart(3, '0')}` : 'TASK-D003';

      tasks.push({
        id: taskId,
        name: `Implement ${req.description.substring(0, 30)}...`,
        description: req.description,
        phase: 2,
        priority: req.priority,
        estimatedHours: hoursPerReq,
        dependencies: [prevTaskId],
        assignedRole: this.requiresBackend(req.description) ? 'backend' : 'frontend',
        risk: req.priority === 'critical' ? 'high' : 'medium',
      });
    });

    return tasks;
  }

  private createTestingTasks(requirements: ParsedRequirement[], totalHours: number): ImplementationTask[] {
    const tasks: ImplementationTask[] = [];
    const hoursPerTask = totalHours / 2;

    tasks.push({
      id: 'TASK-T001',
      name: 'Write Unit Tests',
      description: 'Write comprehensive unit tests for all components',
      phase: 3,
      priority: 'critical',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-I001'],
      assignedRole: 'qa',
      risk: 'low',
    });

    tasks.push({
      id: 'TASK-T002',
      name: 'Write Integration Tests',
      description: 'Write integration tests for component interactions',
      phase: 3,
      priority: 'high',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-T001'],
      assignedRole: 'qa',
      risk: 'low',
    });

    return tasks;
  }

  private createReviewTasks(requirements: ParsedRequirement[], totalHours: number): ImplementationTask[] {
    const tasks: ImplementationTask[] = [];
    const hoursPerTask = totalHours / 2;

    tasks.push({
      id: 'TASK-R001',
      name: 'Code Review',
      description: 'Comprehensive code review of all changes',
      phase: 4,
      priority: 'critical',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-T002'],
      assignedRole: 'backend',
      risk: 'low',
    });

    tasks.push({
      id: 'TASK-R002',
      name: 'Deploy to Production',
      description: 'Deploy feature to production environment',
      phase: 4,
      priority: 'critical',
      estimatedHours: hoursPerTask,
      dependencies: ['TASK-R001'],
      assignedRole: 'infrastructure',
      risk: 'medium',
    });

    return tasks;
  }
}
