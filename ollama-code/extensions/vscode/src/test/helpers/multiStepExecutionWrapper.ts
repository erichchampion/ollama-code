/**
 * Mock Multi-Step Execution Workflow
 * Tests autonomous multi-step execution capabilities for Phase 3.2.3
 */

/**
 * Execution step definition
 */
export interface ExecutionStep {
  /** Step ID */
  id: string;
  /** Step name */
  name: string;
  /** Step description */
  description: string;
  /** Step type */
  type: 'command' | 'file_operation' | 'git_operation' | 'validation' | 'user_confirmation';
  /** Command to execute (for command type) */
  command?: string;
  /** File path (for file_operation type) */
  filePath?: string;
  /** File content (for file_operation type) */
  content?: string;
  /** Expected outcome */
  expectedOutcome: string;
  /** Rollback command */
  rollbackCommand?: string;
  /** Dependencies on previous steps */
  dependencies: string[];
  /** Approval required */
  requiresApproval?: boolean;
  /** Estimated duration in seconds */
  estimatedDuration: number;
}

/**
 * Step execution result
 */
export interface StepExecutionResult {
  /** Step ID */
  stepId: string;
  /** Execution status */
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled';
  /** Execution output */
  output: string;
  /** Error message if failed */
  error?: string;
  /** Execution start time */
  startTime: Date;
  /** Execution end time */
  endTime?: Date;
  /** Actual duration in seconds */
  duration?: number;
}

/**
 * Workflow execution progress
 */
export interface ExecutionProgress {
  /** Total steps */
  totalSteps: number;
  /** Completed steps */
  completedSteps: number;
  /** Failed steps */
  failedSteps: number;
  /** Current step index */
  currentStepIndex: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Estimated remaining time in seconds */
  estimatedRemainingTime: number;
}

/**
 * Workflow execution configuration
 */
export interface WorkflowConfig {
  /** Require user approval for each step */
  requireApproval?: boolean;
  /** Continue on error */
  continueOnError?: boolean;
  /** Enable automatic rollback on failure */
  enableRollback?: boolean;
  /** Maximum execution time in seconds */
  maxExecutionTime?: number;
  /** Pause between steps in milliseconds */
  stepDelay?: number;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  /** Workflow ID */
  workflowId: string;
  /** Workflow name */
  workflowName: string;
  /** Overall status */
  status: 'success' | 'failed' | 'partial' | 'cancelled';
  /** Step results */
  stepResults: StepExecutionResult[];
  /** Execution progress */
  progress: ExecutionProgress;
  /** Total duration in seconds */
  totalDuration: number;
  /** Rollback steps executed */
  rollbackSteps: string[];
  /** Summary message */
  summary: string;
}

/**
 * Multi-step execution workflow manager
 */
export class MultiStepExecutionWorkflow {
  private config: Required<WorkflowConfig>;
  private executionHistory: Map<string, WorkflowExecutionResult> = new Map();
  private currentExecution: WorkflowExecutionResult | null = null;
  private cancelled = false;

  constructor(config: WorkflowConfig = {}) {
    this.config = {
      requireApproval: config.requireApproval ?? false,
      continueOnError: config.continueOnError ?? false,
      enableRollback: config.enableRollback ?? true,
      maxExecutionTime: config.maxExecutionTime ?? 3600, // 1 hour default
      stepDelay: config.stepDelay ?? 0,
    };
  }

  /**
   * Execute workflow with multiple steps
   */
  async executeWorkflow(workflowId: string, workflowName: string, steps: ExecutionStep[]): Promise<WorkflowExecutionResult> {
    this.cancelled = false;
    const startTime = Date.now();

    const result: WorkflowExecutionResult = {
      workflowId,
      workflowName,
      status: 'success',
      stepResults: [],
      progress: {
        totalSteps: steps.length,
        completedSteps: 0,
        failedSteps: 0,
        currentStepIndex: 0,
        percentage: 0,
        elapsedTime: 0,
        estimatedRemainingTime: this.estimateTotalDuration(steps),
      },
      totalDuration: 0,
      rollbackSteps: [],
      summary: '',
    };

    this.currentExecution = result;

    // Execute steps in order
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check if cancelled
      if (this.cancelled) {
        result.status = 'cancelled';
        result.summary = `Workflow cancelled at step ${i + 1}/${steps.length}`;
        break;
      }

      // Check timeout
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > this.config.maxExecutionTime) {
        result.status = 'failed';
        result.summary = `Workflow timed out after ${elapsed.toFixed(1)}s (max: ${this.config.maxExecutionTime}s)`;
        break;
      }

      // Check dependencies
      if (!this.checkDependencies(step, result.stepResults)) {
        const stepResult: StepExecutionResult = {
          stepId: step.id,
          status: 'skipped',
          output: 'Dependencies not met',
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
        };
        result.stepResults.push(stepResult);
        continue;
      }

      // User approval checkpoint
      if (this.config.requireApproval || step.requiresApproval) {
        const approved = await this.requestApproval(step);
        if (!approved) {
          const stepResult: StepExecutionResult = {
            stepId: step.id,
            status: 'skipped',
            output: 'User did not approve step',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
          };
          result.stepResults.push(stepResult);
          result.status = 'cancelled';
          result.summary = `User cancelled workflow at step: ${step.name}`;
          break;
        }
      }

      // Execute step
      const stepResult = await this.executeStep(step);
      result.stepResults.push(stepResult);

      // Update progress
      result.progress.currentStepIndex = i + 1;
      if (stepResult.status === 'success') {
        result.progress.completedSteps++;
      } else if (stepResult.status === 'failed') {
        result.progress.failedSteps++;
      }
      result.progress.percentage = Math.round((result.progress.currentStepIndex / steps.length) * 100);
      result.progress.elapsedTime = (Date.now() - startTime) / 1000;
      result.progress.estimatedRemainingTime = this.estimateRemainingDuration(steps, i + 1);

      // Handle failure
      if (stepResult.status === 'failed') {
        if (this.config.enableRollback) {
          // Rollback completed steps
          const rollbackSteps = await this.rollbackSteps(result.stepResults);
          result.rollbackSteps = rollbackSteps;
          result.status = 'failed';
          result.summary = `Step "${step.name}" failed. Rolled back ${rollbackSteps.length} steps.`;
        } else {
          result.status = 'failed';
          result.summary = `Step "${step.name}" failed. Error: ${stepResult.error}`;
        }

        if (!this.config.continueOnError) {
          break;
        }
      }

      // Add delay between steps if configured
      if (this.config.stepDelay > 0 && i < steps.length - 1) {
        await this.delay(this.config.stepDelay);
      }
    }

    // Calculate final statistics
    result.totalDuration = (Date.now() - startTime) / 1000;
    result.progress.elapsedTime = result.totalDuration;

    // Determine final status if not already set
    if (result.status === 'success') {
      if (result.progress.failedSteps > 0) {
        result.status = 'partial';
        result.summary = `Workflow completed with ${result.progress.failedSteps} failed steps`;
      } else if (result.progress.completedSteps === steps.length) {
        result.summary = `Workflow completed successfully in ${result.totalDuration.toFixed(1)}s`;
      } else {
        result.status = 'partial';
        result.summary = `Workflow partially completed: ${result.progress.completedSteps}/${steps.length} steps`;
      }
    }

    // Store in history
    this.executionHistory.set(workflowId, result);
    this.currentExecution = null;

    return result;
  }

  /**
   * Cancel current workflow execution
   */
  cancelExecution(): boolean {
    if (this.currentExecution) {
      this.cancelled = true;
      return true;
    }
    return false;
  }

  /**
   * Get execution progress
   */
  getProgress(): ExecutionProgress | null {
    return this.currentExecution ? { ...this.currentExecution.progress } : null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(workflowId?: string): WorkflowExecutionResult | WorkflowExecutionResult[] | null {
    if (workflowId) {
      return this.executionHistory.get(workflowId) || null;
    }
    return Array.from(this.executionHistory.values());
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Execute a single step
   */
  private async executeStep(step: ExecutionStep): Promise<StepExecutionResult> {
    const startTime = new Date();
    const result: StepExecutionResult = {
      stepId: step.id,
      status: 'running',
      output: '',
      startTime,
    };

    try {
      // Simulate execution based on step type
      switch (step.type) {
        case 'command':
          result.output = await this.executeCommand(step);
          break;
        case 'file_operation':
          result.output = await this.executeFileOperation(step);
          break;
        case 'git_operation':
          result.output = await this.executeGitOperation(step);
          break;
        case 'validation':
          result.output = await this.executeValidation(step);
          break;
        case 'user_confirmation':
          result.output = await this.executeUserConfirmation(step);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      result.status = 'success';
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
      result.output = `Failed: ${result.error}`;
    }

    result.endTime = new Date();
    result.duration = (result.endTime.getTime() - startTime.getTime()) / 1000;

    return result;
  }

  /**
   * Execute command step (mock)
   */
  private async executeCommand(step: ExecutionStep): Promise<string> {
    // Mock implementation
    await this.delay(step.estimatedDuration * 100); // Simulate execution time

    if (!step.command) {
      throw new Error('Command not specified');
    }

    // Simulate command success/failure
    if (step.command.includes('fail')) {
      throw new Error(`Command failed: ${step.command}`);
    }

    return `Executed command: ${step.command}\n${step.expectedOutcome}`;
  }

  /**
   * Execute file operation step (mock)
   */
  private async executeFileOperation(step: ExecutionStep): Promise<string> {
    // Mock implementation
    await this.delay(step.estimatedDuration * 100);

    if (!step.filePath) {
      throw new Error('File path not specified');
    }

    return `File operation on ${step.filePath}: ${step.expectedOutcome}`;
  }

  /**
   * Execute git operation step (mock)
   */
  private async executeGitOperation(step: ExecutionStep): Promise<string> {
    // Mock implementation
    await this.delay(step.estimatedDuration * 100);
    return `Git operation completed: ${step.expectedOutcome}`;
  }

  /**
   * Execute validation step (mock)
   */
  private async executeValidation(step: ExecutionStep): Promise<string> {
    // Mock implementation
    await this.delay(step.estimatedDuration * 100);

    // Simulate validation failure if description contains "invalid"
    if (step.description.toLowerCase().includes('invalid')) {
      throw new Error('Validation failed');
    }

    return `Validation passed: ${step.expectedOutcome}`;
  }

  /**
   * Execute user confirmation step (mock)
   */
  private async executeUserConfirmation(step: ExecutionStep): Promise<string> {
    // Mock implementation - always confirms
    await this.delay(step.estimatedDuration * 100);
    return `User confirmed: ${step.expectedOutcome}`;
  }

  /**
   * Check if step dependencies are satisfied
   */
  private checkDependencies(step: ExecutionStep, completedSteps: StepExecutionResult[]): boolean {
    if (step.dependencies.length === 0) {
      return true;
    }

    const completedStepIds = new Set(
      completedSteps.filter(s => s.status === 'success').map(s => s.stepId)
    );

    return step.dependencies.every(depId => completedStepIds.has(depId));
  }

  /**
   * Request user approval (mock)
   */
  private async requestApproval(step: ExecutionStep): Promise<boolean> {
    // Mock implementation - always approves unless step name includes "reject"
    await this.delay(10);
    return !step.name.toLowerCase().includes('reject');
  }

  /**
   * Rollback completed steps
   */
  private async rollbackSteps(stepResults: StepExecutionResult[]): Promise<string[]> {
    const rolledBack: string[] = [];

    // Rollback in reverse order
    for (let i = stepResults.length - 1; i >= 0; i--) {
      const result = stepResults[i];
      if (result.status === 'success') {
        // Mock rollback
        await this.delay(10);
        rolledBack.push(result.stepId);
      }
    }

    return rolledBack;
  }

  /**
   * Estimate total workflow duration
   */
  private estimateTotalDuration(steps: ExecutionStep[]): number {
    return steps.reduce((total, step) => total + step.estimatedDuration, 0);
  }

  /**
   * Estimate remaining workflow duration
   */
  private estimateRemainingDuration(steps: ExecutionStep[], currentIndex: number): number {
    let remaining = 0;
    for (let i = currentIndex; i < steps.length; i++) {
      remaining += steps[i].estimatedDuration;
    }
    return remaining;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
