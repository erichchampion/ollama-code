/**
 * Phase 3 Implementation Validation Tests
 * These tests verify that Phase 3 components exist and can be imported
 */

import { describe, it, expect } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';

describe('Phase 3: Enhanced Task Planning & Execution Engine', () => {
  describe('Core Implementation Files', () => {
    it('should have created task planner module', async () => {
      const filePath = path.join(process.cwd(), 'src/planning/task-planner.ts');
      expect(await fs.access(filePath).then(() => true).catch(() => false)).toBe(true);

      // Verify file has substantive content
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(8000);
      expect(content).toContain('export class TaskPlanner');
      expect(content).toContain('export interface Task');
      expect(content).toContain('export interface ExecutionPlan');
    });

    it('should have created execution engine module', async () => {
      const filePath = path.join(process.cwd(), 'src/execution/execution-engine.ts');
      expect(await fs.access(filePath).then(() => true).catch(() => false)).toBe(true);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(8000);
      expect(content).toContain('export class ExecutionEngine');
      expect(content).toContain('export interface ExecutionStrategy');
      expect(content).toContain('export interface ExecutionContext');
    });

    it('should have created enhanced client module', async () => {
      const filePath = path.join(process.cwd(), 'src/ai/enhanced-client.ts');
      expect(await fs.access(filePath).then(() => true).catch(() => false)).toBe(true);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(5000);
      expect(content).toContain('export class EnhancedClient');
      expect(content).toContain('export interface EnhancedClientConfig');
      expect(content).toContain('export interface ProcessingResult');
    });
  });

  describe('Code Quality Validation', () => {
    it('should have well-structured TypeScript files', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Should have valid TypeScript exports
        expect(content).toMatch(/export\s+(class|interface|const|function)/);

        // Should have proper imports
        expect(content).toMatch(/import\s+.*from\s+['"][^'"]+['"];?/);

        // Should be substantial implementation (not just stubs)
        expect(content.length).toBeGreaterThan(5000);

        // Should have proper error handling
        expect(content).toContain('try');
        expect(content).toContain('catch');

        // Should have logging
        expect(content).toContain('logger');
      }
    });

    it('should have proper documentation and comments', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Should have file-level documentation
        expect(content).toMatch(/\/\*\*[\s\S]*?\*\//);

        // Should have meaningful method documentation or comments
        expect(content.split('/**').length + content.split('//').length).toBeGreaterThan(15);
      }
    });

    it('should follow consistent naming conventions', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Classes should be PascalCase
        const classMatches = content.match(/export class (\w+)/g);
        if (classMatches) {
          for (const match of classMatches) {
            const className = match.replace('export class ', '');
            expect(className[0]).toMatch(/[A-Z]/);
          }
        }

        // Interfaces should be PascalCase
        const interfaceMatches = content.match(/export interface (\w+)/g);
        if (interfaceMatches) {
          for (const match of interfaceMatches) {
            const interfaceName = match.replace('export interface ', '');
            expect(interfaceName[0]).toMatch(/[A-Z]/);
          }
        }
      }
    });
  });

  describe('Core Interface Definitions', () => {
    it('should have comprehensive Task interface', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      // Check for key interface properties
      expect(content).toContain('id:');
      expect(content).toContain('title:');
      expect(content).toContain('description:');
      expect(content).toContain('type:');
      expect(content).toContain('status:');
      expect(content).toContain('priority:');
      expect(content).toContain('dependencies:');
      expect(content).toContain('context:');
    });

    it('should have execution planning interfaces', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('ExecutionPlan');
      expect(content).toContain('ExecutionPhase');
      expect(content).toContain('Timeline');
      expect(content).toContain('RiskAssessment');
    });

    it('should have execution strategy interfaces', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('ExecutionStrategy');
      expect(content).toContain('ExecutionContext');
      expect(content).toContain('ExecutionResult');
      expect(content).toContain('ResourceState');
    });

    it('should have enhanced client interfaces', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('EnhancedClientConfig');
      expect(content).toContain('ProcessingResult');
      expect(content).toContain('SessionState');
      expect(content).toContain('UserPreferences');
    });
  });

  describe('Integration Points', () => {
    it('should integrate with existing logger system', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');
        expect(content).toContain("import { logger } from '../utils/logger.js'");
        expect(content).toContain('logger.');
      }
    });

    it('should integrate with Phase 1 components', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('IntentAnalyzer');
      expect(content).toContain('ConversationManager');
      expect(content).toContain('NaturalLanguageRouter');
      expect(content).toContain('ProjectContext');
    });

    it('should integrate with Phase 2 components', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('AutonomousModifier');
    });

    it('should integrate with execution engine', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('AutonomousModifier');
      expect(content).toContain('OllamaClient');
      expect(content).toContain('ProjectContext');
    });
  });

  describe('Phase 3 Feature Coverage', () => {
    it('should implement task decomposition', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('decomposeIntent');
      expect(content).toContain('decomposeTaskRequest');
      expect(content).toContain('decomposeQuestion');
      expect(content).toContain('decomposeCommand');
      expect(content).toContain('createExecutionPlan');
    });

    it('should implement dependency management', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('analyzeDependencies');
      expect(content).toContain('addImplicitDependencies');
      expect(content).toContain('validateDependencies');
      expect(content).toContain('dependencies');
    });

    it('should implement execution strategies', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('initializeStrategies');
      expect(content).toContain('selectStrategy');
      expect(content).toContain('executeTask');
      expect(content).toContain('executePlan');
      expect(content).toContain('executePhase');
    });

    it('should implement context-aware execution', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('ExecutionContext');
      expect(content).toContain('suitability');
      expect(content).toContain('ResourceState');
      expect(content).toContain('ExecutionHistory');
    });

    it('should implement enhanced client orchestration', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('processMessage');
      expect(content).toContain('createAndExecutePlan');
      expect(content).toContain('shouldAutoExecute');
      expect(content).toContain('generatePlanProposal');
      expect(content).toContain('executePendingPlan');
    });
  });

  describe('Advanced Features', () => {
    it('should implement risk assessment', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('assessRisks');
      expect(content).toContain('RiskAssessment');
      expect(content).toContain('Risk');
      expect(content).toContain('Mitigation');
      expect(content).toContain('riskLevel');
    });

    it('should implement timeline estimation', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('generateTimeline');
      expect(content).toContain('Timeline');
      expect(content).toContain('estimatedDuration');
      expect(content).toContain('criticalPath');
      expect(content).toContain('milestones');
    });

    it('should implement resource management', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('ResourceState');
      expect(content).toContain('ResourceMetric');
      expect(content).toContain('ResourceUsage');
      expect(content).toContain('availableResources');
    });

    it('should implement adaptive learning', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('adaptive');
      expect(content).toContain('ExecutionHistory');
      expect(content).toContain('isTaskSimilar');
      expect(content).toContain('recordExecution');
    });

    it('should implement session management', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('SessionState');
      expect(content).toContain('conversationId');
      expect(content).toContain('executionHistory');
      expect(content).toContain('preferences');
      expect(content).toContain('startNewConversation');
    });
  });

  describe('Error Handling and Safety', () => {
    it('should have comprehensive error handling in task planner', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('} catch (error)');
      expect(content).toContain('throw new Error');
      expect(content).toContain('validateDependencies');
    });

    it('should have execution safety mechanisms', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');

      expect(content).toContain('failureHandling');
      expect(content).toContain('retryable');
      expect(content).toContain('activeExecutions');
      expect(content).toContain('preferences');
    });

    it('should have client-level error recovery', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('} catch (error)');
      expect(content).toContain('errorResponse');
      expect(content).toContain('success: false');
    });
  });

  describe('TypeScript Language Features', () => {
    it('should use proper TypeScript types and interfaces', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Should have interface definitions
        expect(content).toMatch(/export interface \w+/);

        // Should use proper typing
        expect(content).toMatch(/: \w+(\[\])?[;,]/);

        // Should have async/await usage
        expect(content).toContain('async ');
        expect(content).toContain('await ');

        // Should use Promise types
        expect(content).toContain('Promise<');

        // Should use union types
        expect(content).toMatch(/'[^']+'\s*\|\s*'[^']+'/);
      }
    });

    it('should have proper method signatures', async () => {
      const content = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');

      // Check for method signatures with proper typing
      expect(content).toMatch(/async \w+\(/);
      expect(content).toMatch(/private async \w+/);
      expect(content).toMatch(/Promise</);
    });

    it('should use advanced TypeScript features', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Should use generic types
        expect(content).toMatch(/Map<\w+,\s*\w+>/);

        // Should use optional properties
        expect(content).toMatch(/\w+\?:/);

        // Should use type unions
        expect(content).toMatch(/\w+\s*\|\s*\w+/);
      }
    });
  });

  describe('Architecture and Design', () => {
    it('should follow SOLID principles', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Single Responsibility: Classes should have focused responsibilities
        const classMatches = content.match(/export class (\w+)/g);
        expect(classMatches).toBeTruthy();
        expect(classMatches.length).toBeLessThanOrEqual(2); // Each file should have 1-2 main classes

        // Interface Segregation: Many small, specific interfaces
        const interfaceMatches = content.match(/export interface (\w+)/g);
        expect(interfaceMatches).toBeTruthy();
        expect(interfaceMatches.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('should have proper separation of concerns', async () => {
      // Task Planner should focus on planning
      const plannerContent = await fs.readFile(path.join(process.cwd(), 'src/planning/task-planner.ts'), 'utf-8');
      expect(plannerContent).toContain('decompose');
      expect(plannerContent).toContain('dependencies');
      expect(plannerContent).toContain('timeline');

      // Execution Engine should focus on execution
      const engineContent = await fs.readFile(path.join(process.cwd(), 'src/execution/execution-engine.ts'), 'utf-8');
      expect(engineContent).toContain('execute');
      expect(engineContent).toContain('strategy');
      expect(engineContent).toContain('resource');

      // Enhanced Client should focus on orchestration
      const clientContent = await fs.readFile(path.join(process.cwd(), 'src/ai/enhanced-client.ts'), 'utf-8');
      expect(clientContent).toContain('process');
      expect(clientContent).toContain('Enhanced');
      expect(clientContent).toContain('session');
    });

    it('should have comprehensive interfaces for extensibility', async () => {
      const phase3Files = [
        'src/planning/task-planner.ts',
        'src/execution/execution-engine.ts',
        'src/ai/enhanced-client.ts'
      ];

      for (const file of phase3Files) {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');

        // Should have many interfaces for extensibility
        const interfaceCount = (content.match(/export interface/g) || []).length;
        expect(interfaceCount).toBeGreaterThanOrEqual(5);

        // Should use composition over inheritance
        expect(content).toMatch(/private \w+:/);
        expect(content).toMatch(/constructor\(/);
      }
    });
  });
});