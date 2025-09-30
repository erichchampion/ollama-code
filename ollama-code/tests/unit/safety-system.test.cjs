/**
 * Safety System Tests
 *
 * Phase 2.3: Comprehensive tests for approval and safety system
 */

const { describe, test, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock file system operations
jest.mock('fs/promises');
const fs = require('fs/promises');

// Mock crypto for consistent testing
jest.mock('crypto');
const crypto = require('crypto');

// Mock logger
jest.mock('../../src/utils/logger.js');

describe('Safety System', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup crypto mocks
    crypto.createHash = jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(() => 'mock-hash-123')
    }));

    // Setup fs mocks
    fs.access = jest.fn().mockResolvedValue(undefined);
    fs.readFile = jest.fn().mockResolvedValue('mock file content');
    fs.writeFile = jest.fn().mockResolvedValue(undefined);
    fs.mkdir = jest.fn().mockResolvedValue(undefined);
    fs.stat = jest.fn().mockResolvedValue({
      size: 1000,
      mtime: new Date(),
      mode: 0o644,
      isDirectory: () => false
    });
    fs.readdir = jest.fn().mockResolvedValue([]);
  });

  describe('RiskAssessmentEngine', () => {
    let RiskAssessmentEngine;
    let engine;

    beforeEach(async () => {
      const { RiskAssessmentEngine: RiskEngine } = await import('../../src/safety/risk-assessment-engine.js');
      RiskAssessmentEngine = RiskEngine;
      engine = new RiskAssessmentEngine();
    });

    test('should assess low risk for simple file creation', async () => {
      const operation = {
        type: 'create',
        targets: ['test.txt'],
        description: 'Create a simple text file',
        estimatedChanges: 1
      };

      const targets = [{
        path: 'test.txt',
        type: 'file',
        exists: false,
        confidence: 1.0,
        reason: 'Test file'
      }];

      const assessment = await engine.assessRisk(operation, targets);

      expect(assessment).toMatchObject({
        level: expect.stringMatching(/^(minimal|low)$/),
        safetyLevel: 'safe',
        automaticApproval: true
      });
      expect(assessment.confidence).toBeGreaterThan(0.5);
    });

    test('should assess high risk for system file deletion', async () => {
      const operation = {
        type: 'delete',
        targets: ['package.json'],
        description: 'Delete package.json',
        estimatedChanges: 1
      };

      const targets = [{
        path: 'package.json',
        type: 'file',
        exists: true,
        size: 500,
        confidence: 1.0,
        reason: 'System file'
      }];

      const assessment = await engine.assessRisk(operation, targets);

      expect(assessment.level).toBe('high');
      expect(assessment.safetyLevel).toBe('dangerous');
      expect(assessment.automaticApproval).toBe(false);
      expect(assessment.riskFactors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'deletion_operation',
            severity: 'high'
          }),
          expect.objectContaining({
            type: 'system_file_modification',
            severity: 'high'
          })
        ])
      );
    });

    test('should assess medium risk for large file operations', async () => {
      const operation = {
        type: 'modify',
        targets: ['large-file.js'],
        description: 'Modify large JavaScript file',
        estimatedChanges: 1
      };

      const targets = [{
        path: 'large-file.js',
        type: 'file',
        exists: true,
        size: 150000, // > 100KB threshold
        language: 'javascript',
        confidence: 1.0,
        reason: 'Large file'
      }];

      const assessment = await engine.assessRisk(operation, targets);

      expect(assessment.level).toMatch(/^(low|medium)$/);
      expect(assessment.riskFactors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'large_file_changes',
            severity: 'medium'
          })
        ])
      );
    });

    test('should generate appropriate mitigation strategies', async () => {
      const operation = {
        type: 'delete',
        targets: ['important-config.json'],
        description: 'Delete configuration file',
        estimatedChanges: 1
      };

      const targets = [{
        path: 'important-config.json',
        type: 'file',
        exists: true,
        confidence: 1.0,
        reason: 'Config file'
      }];

      const assessment = await engine.assessRisk(operation, targets);

      expect(assessment.mitigationStrategies).toEqual(
        expect.arrayContaining([
          'Create comprehensive backup before operation',
          'Validate all changes before applying'
        ])
      );
    });

    test('should return conservative assessment on error', async () => {
      // Force an error by making fs operations fail
      fs.stat.mockRejectedValue(new Error('File system error'));

      const operation = {
        type: 'modify',
        targets: ['test.txt'],
        description: 'Test operation',
        estimatedChanges: 1
      };

      const targets = [{
        path: 'test.txt',
        type: 'file',
        exists: true,
        confidence: 1.0,
        reason: 'Test'
      }];

      const assessment = await engine.assessRisk(operation, targets);

      expect(assessment.level).toBe('high');
      expect(assessment.safetyLevel).toBe('dangerous');
      expect(assessment.automaticApproval).toBe(false);
      expect(assessment.confidence).toBe(0.1);
    });
  });

  describe('ChangePreviewEngine', () => {
    let ChangePreviewEngine;
    let engine;

    beforeEach(async () => {
      const { ChangePreviewEngine: PreviewEngine } = await import('../../src/safety/change-preview-engine.js');
      ChangePreviewEngine = PreviewEngine;
      engine = new ChangePreviewEngine();
    });

    test('should generate preview for file creation', async () => {
      const operation = {
        type: 'create',
        targets: ['new-file.js'],
        description: 'Create new JavaScript file',
        estimatedChanges: 1
      };

      const changes = [{
        filePath: 'new-file.js',
        newContent: 'console.log("Hello World");\\nfunction test() { return 42; }',
        operation: 'create'
      }];

      const preview = await engine.generatePreview(operation, changes);

      expect(preview.summary).toMatchObject({
        totalFiles: 1,
        newFiles: 1,
        addedLines: 2,
        removedLines: 0
      });

      expect(preview.diffs).toHaveLength(1);
      expect(preview.diffs[0]).toMatchObject({
        filePath: 'new-file.js',
        changeType: 'added',
        additions: 2,
        deletions: 0,
        isBinary: false
      });
    });

    test('should generate preview for file modification', async () => {
      const operation = {
        type: 'modify',
        targets: ['existing-file.js'],
        description: 'Modify JavaScript file',
        estimatedChanges: 1
      };

      const changes = [{
        filePath: 'existing-file.js',
        originalContent: 'const x = 1;\\nconsole.log(x);',
        newContent: 'const x = 2;\\nconsole.log(x);\\nconsole.log("Updated");',
        operation: 'modify'
      }];

      const preview = await engine.generatePreview(operation, changes);

      expect(preview.summary.totalFiles).toBe(1);
      expect(preview.diffs[0]).toMatchObject({
        filePath: 'existing-file.js',
        changeType: 'modified',
        isBinary: false
      });
      expect(preview.diffs[0].additions).toBeGreaterThan(0);
    });

    test('should identify potential security issues', async () => {
      const operation = {
        type: 'create',
        targets: ['insecure-file.js'],
        description: 'Create file with security issues',
        estimatedChanges: 1
      };

      const changes = [{
        filePath: 'insecure-file.js',
        newContent: 'const password = "hardcoded123";\\nconst apiKey = "secret-key-123";\\neval(userInput);',
        operation: 'create'
      }];

      const preview = await engine.generatePreview(operation, changes);

      expect(preview.potentialIssues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'security_risk',
            severity: 'warning'
          })
        ])
      );
    });

    test('should handle binary files appropriately', async () => {
      const operation = {
        type: 'create',
        targets: ['image.png'],
        description: 'Add image file',
        estimatedChanges: 1
      };

      const changes = [{
        filePath: 'image.png',
        newContent: 'binary-content',
        operation: 'create'
      }];

      const preview = await engine.generatePreview(operation, changes);

      expect(preview.diffs[0]).toMatchObject({
        filePath: 'image.png',
        isBinary: true,
        diff: '[Binary file]'
      });
    });

    test('should generate appropriate recommendations', async () => {
      const operation = {
        type: 'modify',
        targets: ['package.json', 'src/index.js'],
        description: 'Update dependencies and code',
        estimatedChanges: 2
      };

      const changes = [
        {
          filePath: 'package.json',
          originalContent: '{"dependencies": {"lodash": "^4.0.0"}}',
          newContent: '{"dependencies": {"lodash": "^4.17.21"}}',
          operation: 'modify'
        },
        {
          filePath: 'src/index.js',
          originalContent: 'const _ = require("lodash");',
          newContent: 'const _ = require("lodash");\\nconsole.log("Updated");',
          operation: 'modify'
        }
      ];

      const preview = await engine.generatePreview(operation, changes);

      expect(preview.recommendations).toEqual(
        expect.arrayContaining([
          'Review all changes carefully before applying',
          'Reinstall dependencies after applying changes',
          'Run tests after applying code changes'
        ])
      );
    });
  });

  describe('BackupRollbackSystem', () => {
    let BackupRollbackSystem;
    let system;

    beforeEach(async () => {
      const { BackupRollbackSystem: BackupSystem } = await import('../../src/safety/backup-rollback-system.js');
      BackupRollbackSystem = BackupSystem;
      system = new BackupRollbackSystem('./.test-backups');
    });

    test('should create backups for file operations', async () => {
      const operationId = 'test-op-123';
      const filePaths = ['test1.txt', 'test2.js'];
      const operation = {
        type: 'modify',
        targets: filePaths,
        description: 'Test modification',
        estimatedChanges: 2
      };

      const backups = await system.createBackup(operationId, filePaths, operation);

      expect(backups).toHaveLength(2);
      expect(backups[0]).toMatchObject({
        type: 'full_file',
        metadata: expect.objectContaining({
          operationId,
          originalPath: 'test1.txt',
          operation: 'modify'
        })
      });

      expect(fs.writeFile).toHaveBeenCalledTimes(4); // 2 backup files + 2 metadata files
    });

    test('should create rollback plan', async () => {
      const operationId = 'test-op-456';
      const operation = {
        type: 'modify',
        targets: ['file1.txt'],
        description: 'Test operation',
        estimatedChanges: 1
      };
      const backups = [{
        id: 'backup-1',
        type: 'full_file',
        path: '/backup/path',
        size: 100,
        timestamp: new Date(),
        checksum: 'abc123',
        compressed: false,
        retention: new Date(),
        metadata: { operationId, originalPath: 'file1.txt' }
      }];

      const plan = await system.createRollbackPlan(operationId, operation, backups, 'medium');

      expect(plan).toMatchObject({
        operationId,
        strategy: expect.stringMatching(/^(backup_restore|incremental_undo)$/),
        backups,
        riskLevel: 'medium'
      });
      expect(plan.steps).toBeInstanceOf(Array);
      expect(plan.steps.length).toBeGreaterThan(0);
    });

    test('should execute rollback successfully', async () => {
      const plan = {
        id: 'rollback-test',
        operationId: 'test-op',
        strategy: 'backup_restore',
        backups: [{
          id: 'backup-1',
          type: 'full_file',
          path: '/backup/test.txt',
          size: 100,
          timestamp: new Date(),
          checksum: crypto.createHash('sha256').update('test content').digest('hex'),
          compressed: false,
          retention: new Date(),
          metadata: { operationId: 'test-op', originalPath: 'test.txt' }
        }],
        steps: [{
          order: 1,
          action: 'restore_file',
          target: 'test.txt',
          description: 'Restore test.txt',
          automated: true
        }],
        estimatedTime: 5,
        riskLevel: 'medium',
        canAutoRollback: true,
        dependencies: []
      };

      // Mock file reading for checksum verification
      fs.readFile.mockResolvedValue(Buffer.from('test content'));

      const result = await system.executeRollback(plan);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalledWith('test.txt', expect.any(Buffer));
    });

    test('should handle rollback failures gracefully', async () => {
      const plan = {
        id: 'rollback-fail',
        operationId: 'test-op',
        strategy: 'backup_restore',
        backups: [],
        steps: [{
          order: 1,
          action: 'restore_file',
          target: 'missing-file.txt',
          description: 'Restore missing file',
          automated: true
        }],
        estimatedTime: 5,
        riskLevel: 'medium',
        canAutoRollback: true,
        dependencies: []
      };

      const result = await system.executeRollback(plan);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('No backup found')
        ])
      );
    });

    test('should handle intent backups for create operations', async () => {
      const operationId = 'create-op-123';
      const filePaths = ['new-file.txt'];
      const operation = {
        type: 'create',
        targets: filePaths,
        description: 'Create new file',
        estimatedChanges: 1
      };

      // Mock file not existing
      fs.access.mockRejectedValue(new Error('File not found'));

      const backups = await system.createBackup(operationId, filePaths, operation);

      expect(backups).toHaveLength(1);
      expect(backups[0].metadata.isIntent).toBe(true);
      expect(backups[0].metadata.operation).toBe('create_intent');
    });
  });

  describe('SafetyOrchestrator', () => {
    let SafetyOrchestrator;
    let orchestrator;

    beforeEach(async () => {
      const { SafetyOrchestrator: Orchestrator } = await import('../../src/safety/safety-orchestrator.js');
      SafetyOrchestrator = Orchestrator;
      orchestrator = new SafetyOrchestrator();
    });

    test('should orchestrate complete safety assessment', async () => {
      const context = {
        operationId: 'test-orchestration',
        description: {
          type: 'create',
          targets: ['test-file.txt'],
          description: 'Create test file',
          estimatedChanges: 1
        },
        targets: [{
          path: 'test-file.txt',
          type: 'file',
          exists: false,
          confidence: 1.0,
          reason: 'Test file'
        }],
        content: [{
          filePath: 'test-file.txt',
          newContent: 'Hello World'
        }]
      };

      const approval = await orchestrator.assessOperation(context);

      expect(approval).toMatchObject({
        operationId: 'test-orchestration',
        operation: context.description,
        status: expect.stringMatching(/^(approved|pending)$/),
        riskAssessment: expect.objectContaining({
          level: expect.any(String),
          safetyLevel: expect.any(String)
        })
      });

      expect(approval.changePreview).toBeDefined();
      expect(approval.rollbackPlan).toBeDefined();
    });

    test('should auto-approve low-risk operations', async () => {
      const context = {
        operationId: 'auto-approve-test',
        description: {
          type: 'create',
          targets: ['simple.txt'],
          description: 'Create simple text file',
          estimatedChanges: 1
        },
        targets: [{
          path: 'simple.txt',
          type: 'file',
          exists: false,
          confidence: 1.0,
          reason: 'Simple file'
        }],
        userPreferences: {
          autoApprove: true,
          riskTolerance: 'medium',
          requireConfirmation: false
        }
      };

      const approval = await orchestrator.assessOperation(context);

      expect(approval.status).toBe('approved');
      expect(approval.approvals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'automated',
            status: 'approved'
          })
        ])
      );
    });

    test('should require approval for high-risk operations', async () => {
      const context = {
        operationId: 'high-risk-test',
        description: {
          type: 'delete',
          targets: ['package.json'],
          description: 'Delete package.json',
          estimatedChanges: 1
        },
        targets: [{
          path: 'package.json',
          type: 'file',
          exists: true,
          size: 500,
          confidence: 1.0,
          reason: 'System file'
        }]
      };

      const approval = await orchestrator.assessOperation(context);

      expect(approval.status).toBe('pending');
      expect(approval.requiredApprovals.length).toBeGreaterThan(0);
      expect(approval.riskAssessment.level).toMatch(/^(high|critical)$/);
    });

    test('should execute operation with safety measures', async () => {
      const operationId = 'execute-test';

      // First assess the operation
      const context = {
        operationId,
        description: {
          type: 'create',
          targets: ['execute-test.txt'],
          description: 'Create file for execution test',
          estimatedChanges: 1
        },
        targets: [{
          path: 'execute-test.txt',
          type: 'file',
          exists: false,
          confidence: 1.0,
          reason: 'Test file'
        }]
      };

      await orchestrator.assessOperation(context);

      // Mock successful operation
      const executeCallback = jest.fn().mockResolvedValue(undefined);

      const result = await orchestrator.executeOperation(operationId, executeCallback);

      expect(result.success).toBe(true);
      expect(result.rollbackAvailable).toBe(true);
      expect(executeCallback).toHaveBeenCalledTimes(1);
    });

    test('should track safety events', async () => {
      const context = {
        operationId: 'event-test',
        description: {
          type: 'modify',
          targets: ['event-test.txt'],
          description: 'Test event tracking',
          estimatedChanges: 1
        },
        targets: [{
          path: 'event-test.txt',
          type: 'file',
          exists: true,
          confidence: 1.0,
          reason: 'Test file'
        }]
      };

      await orchestrator.assessOperation(context);

      const events = orchestrator.getSafetyEvents('event-test');

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toMatchObject({
        type: 'operation_started',
        operationId: 'event-test',
        severity: 'info'
      });
    });

    test('should handle operation failures and trigger rollback', async () => {
      const operationId = 'failure-test';

      // Assess operation first
      const context = {
        operationId,
        description: {
          type: 'modify',
          targets: ['failure-test.txt'],
          description: 'Operation that will fail',
          estimatedChanges: 1
        },
        targets: [{
          path: 'failure-test.txt',
          type: 'file',
          exists: true,
          confidence: 1.0,
          reason: 'Test file'
        }]
      };

      await orchestrator.assessOperation(context);

      // Mock failing operation
      const executeCallback = jest.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(orchestrator.executeOperation(operationId, executeCallback))
        .rejects.toThrow('Operation failed');

      const events = orchestrator.getSafetyEvents(operationId);
      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'operation_failed',
            severity: 'error'
          })
        ])
      );
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete file operation lifecycle', async () => {
      const { SafetyOrchestrator } = await import('../../src/safety/safety-orchestrator.js');
      const orchestrator = new SafetyOrchestrator();

      // Step 1: Assess operation
      const context = {
        operationId: 'integration-test',
        description: {
          type: 'create',
          targets: ['integration-test.js'],
          description: 'Create integration test file',
          estimatedChanges: 1
        },
        targets: [{
          path: 'integration-test.js',
          type: 'file',
          exists: false,
          language: 'javascript',
          confidence: 1.0,
          reason: 'Integration test'
        }],
        content: [{
          filePath: 'integration-test.js',
          newContent: 'console.log("Integration test");\\nmodule.exports = { test: true };'
        }]
      };

      const approval = await orchestrator.assessOperation(context);
      expect(approval.status).toBe('approved');

      // Step 2: Execute operation
      const executeCallback = jest.fn().mockResolvedValue(undefined);
      const result = await orchestrator.executeOperation('integration-test', executeCallback);
      expect(result.success).toBe(true);

      // Step 3: Verify rollback is available
      const operationStatus = orchestrator.getOperationStatus('integration-test');
      expect(operationStatus?.rollbackPlan).toBeDefined();

      // Step 4: Test rollback
      const rollbackResult = await orchestrator.rollbackOperation('integration-test');
      expect(rollbackResult.success).toBe(true);
    });

    test('should handle complex multi-file operations', async () => {
      const { SafetyOrchestrator } = await import('../../src/safety/safety-orchestrator.js');
      const orchestrator = new SafetyOrchestrator();

      const context = {
        operationId: 'multi-file-test',
        description: {
          type: 'modify',
          targets: ['package.json', 'src/index.js', 'README.md'],
          description: 'Update package dependencies and documentation',
          estimatedChanges: 3
        },
        targets: [
          {
            path: 'package.json',
            type: 'file',
            exists: true,
            size: 500,
            confidence: 1.0,
            reason: 'Package file'
          },
          {
            path: 'src/index.js',
            type: 'file',
            exists: true,
            size: 2000,
            language: 'javascript',
            confidence: 1.0,
            reason: 'Main source file'
          },
          {
            path: 'README.md',
            type: 'file',
            exists: true,
            size: 1500,
            language: 'markdown',
            confidence: 1.0,
            reason: 'Documentation'
          }
        ]
      };

      const approval = await orchestrator.assessOperation(context);

      expect(approval.riskAssessment.riskFactors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/^(multiple_file_changes|dependency_modifications)$/)
          })
        ])
      );

      expect(approval.rollbackPlan?.steps.length).toBeGreaterThan(0);
    });
  });
});