/**
 * Pattern Identification - Anti-Pattern Detection Tests
 * Tests detection of common code anti-patterns
 *
 * Tests anti-pattern detection for:
 * - God Object (excessive responsibilities)
 * - Spaghetti Code (complex control flow)
 * - Circular Dependencies
 * - Feature Envy (excessive external calls)
 * - Shotgun Surgery (scattered changes)
 * - Long Parameter List
 * - Data Clumps (repeated parameter groups)
 */

import * as assert from 'assert';
import { createTestWorkspace, cleanupTestWorkspace } from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';
import { NodeType, GraphNode, GraphRelationship, RelationType } from '../helpers/graph-types';

/**
 * Anti-pattern types
 */
enum AntiPatternType {
  GOD_OBJECT = 'god_object',
  SPAGHETTI_CODE = 'spaghetti_code',
  CIRCULAR_DEPENDENCY = 'circular_dependency',
  FEATURE_ENVY = 'feature_envy',
  SHOTGUN_SURGERY = 'shotgun_surgery',
  LONG_PARAMETER_LIST = 'long_parameter_list',
  DATA_CLUMPS = 'data_clumps',
}

/**
 * Anti-pattern detection result
 */
interface AntiPatternMatch {
  type: AntiPatternType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  nodes: GraphNode[];
  description: string;
  recommendation: string;
  location: {
    filePath: string;
    lineNumber: number;
  };
  metrics?: {
    methodCount?: number;
    lineCount?: number;
    cyclomaticComplexity?: number;
    dependencyCount?: number;
    parameterCount?: number;
    externalCalls?: number;
    affectedFiles?: number;
  };
}

/**
 * Anti-Pattern Detector
 */
class AntiPatternDetector {
  private nodes: Map<string, GraphNode> = new Map();
  private relationships: Map<string, GraphRelationship> = new Map();

  /**
   * Add node to detector
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Add relationship to detector
   */
  addRelationship(relationship: GraphRelationship): void {
    this.relationships.set(relationship.id, relationship);
  }

  /**
   * Detect all anti-patterns
   */
  detectAntiPatterns(): AntiPatternMatch[] {
    const patterns: AntiPatternMatch[] = [];

    patterns.push(...this.detectGodObjects());
    patterns.push(...this.detectSpaghettiCode());
    patterns.push(...this.detectCircularDependencies());
    patterns.push(...this.detectFeatureEnvy());
    patterns.push(...this.detectShotgunSurgery());
    patterns.push(...this.detectLongParameterLists());
    patterns.push(...this.detectDataClumps());

    return patterns;
  }

  /**
   * Detect God Object anti-pattern
   * Class with too many responsibilities (methods, dependencies)
   */
  private detectGodObjects(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];
    const GOD_OBJECT_METHOD_THRESHOLD = 20;
    const GOD_OBJECT_DEPENDENCY_THRESHOLD = 10;

    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.CLASS) {
        continue;
      }

      const methodCount = node.metadata?.methods?.length || 0;
      const dependencies = Array.from(this.relationships.values()).filter(
        rel => rel.sourceId === node.id && rel.type === RelationType.DEPENDS_ON
      ).length;

      if (methodCount >= GOD_OBJECT_METHOD_THRESHOLD || dependencies >= GOD_OBJECT_DEPENDENCY_THRESHOLD) {
        const severity = methodCount >= 40 || dependencies >= 20 ? 'critical' :
                        methodCount >= 30 || dependencies >= 15 ? 'high' : 'medium';

        matches.push({
          type: AntiPatternType.GOD_OBJECT,
          severity,
          confidence: Math.min((methodCount / GOD_OBJECT_METHOD_THRESHOLD + dependencies / GOD_OBJECT_DEPENDENCY_THRESHOLD) / 2, 1),
          nodes: [node],
          description: `Class '${node.name}' has too many responsibilities (${methodCount} methods, ${dependencies} dependencies)`,
          recommendation: 'Split class into smaller, focused classes following Single Responsibility Principle',
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          metrics: {
            methodCount,
            dependencyCount: dependencies,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Detect Spaghetti Code anti-pattern
   * Complex, tangled control flow
   */
  private detectSpaghettiCode(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];
    const COMPLEXITY_THRESHOLD = 15;

    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) {
        continue;
      }

      const complexity = node.metadata?.cyclomaticComplexity || 0;
      const lineCount = node.metadata?.lineCount || 0;

      if (complexity >= COMPLEXITY_THRESHOLD) {
        const severity = complexity >= 30 ? 'critical' :
                        complexity >= 20 ? 'high' : 'medium';

        matches.push({
          type: AntiPatternType.SPAGHETTI_CODE,
          severity,
          confidence: Math.min(complexity / COMPLEXITY_THRESHOLD, 1),
          nodes: [node],
          description: `Function '${node.name}' has excessive cyclomatic complexity (${complexity})`,
          recommendation: 'Refactor into smaller functions, extract conditional logic, reduce nesting',
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          metrics: {
            cyclomaticComplexity: complexity,
            lineCount,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Detect Circular Dependency anti-pattern
   * Modules that depend on each other creating cycles
   */
  private detectCircularDependencies(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: GraphNode[]): boolean => {
      if (recursionStack.has(nodeId)) {
        // Found cycle
        const cycleStartIndex = path.findIndex(n => n.id === nodeId);
        const cyclePath = path.slice(cycleStartIndex);

        matches.push({
          type: AntiPatternType.CIRCULAR_DEPENDENCY,
          severity: cyclePath.length > 4 ? 'high' : 'medium',
          confidence: 1.0,
          nodes: cyclePath,
          description: `Circular dependency detected: ${cyclePath.map(n => n.name).join(' → ')} → ${path[cycleStartIndex].name}`,
          recommendation: 'Break circular dependencies using dependency inversion or extracting shared interfaces',
          location: {
            filePath: cyclePath[0].filePath,
            lineNumber: cyclePath[0].lineNumber,
          },
          metrics: {
            dependencyCount: cyclePath.length,
          },
        });

        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        path.push(node);

        // Follow IMPORTS and DEPENDS_ON relationships
        const outgoing = Array.from(this.relationships.values()).filter(
          rel => rel.sourceId === nodeId &&
                 (rel.type === RelationType.IMPORTS || rel.type === RelationType.DEPENDS_ON)
        );

        for (const rel of outgoing) {
          if (detectCycle(rel.targetId, [...path])) {
            recursionStack.delete(nodeId);
            return true;
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // Check all MODULE and CLASS nodes for cycles
    for (const node of this.nodes.values()) {
      if (node.type === NodeType.MODULE || node.type === NodeType.CLASS) {
        detectCycle(node.id, []);
      }
    }

    return matches;
  }

  /**
   * Detect Feature Envy anti-pattern
   * Method that uses more external class features than its own
   */
  private detectFeatureEnvy(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];

    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) {
        continue;
      }

      // Count calls to external classes
      const externalCalls = Array.from(this.relationships.values()).filter(
        rel => rel.sourceId === node.id && rel.type === RelationType.CALLS
      );

      // Group by target class
      const callsByClass = new Map<string, number>();
      for (const call of externalCalls) {
        const targetNode = this.nodes.get(call.targetId);
        if (targetNode) {
          const className = targetNode.metadata?.className || 'unknown';
          callsByClass.set(className, (callsByClass.get(className) || 0) + 1);
        }
      }

      // Check if any external class is used more than threshold
      for (const [className, count] of callsByClass.entries()) {
        if (count >= 5) {
          matches.push({
            type: AntiPatternType.FEATURE_ENVY,
            severity: count >= 10 ? 'high' : 'medium',
            confidence: Math.min(count / 5, 1),
            nodes: [node],
            description: `Function '${node.name}' makes ${count} calls to '${className}' - consider moving to that class`,
            recommendation: 'Move method to the class it envies, or extract a new class if appropriate',
            location: {
              filePath: node.filePath,
              lineNumber: node.lineNumber,
            },
            metrics: {
              externalCalls: count,
            },
          });
        }
      }
    }

    return matches;
  }

  /**
   * Detect Shotgun Surgery anti-pattern
   * Single change requires modifications across many files
   */
  private detectShotgunSurgery(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];

    // Group nodes by feature/responsibility
    const featureGroups = new Map<string, GraphNode[]>();
    for (const node of this.nodes.values()) {
      const feature = node.metadata?.feature || 'unknown';
      if (!featureGroups.has(feature)) {
        featureGroups.set(feature, []);
      }
      featureGroups.get(feature)!.push(node);
    }

    // Check if feature implementation is scattered
    for (const [feature, nodes] of featureGroups.entries()) {
      const uniqueFiles = new Set(nodes.map(n => n.filePath));

      if (uniqueFiles.size >= 5) {
        matches.push({
          type: AntiPatternType.SHOTGUN_SURGERY,
          severity: uniqueFiles.size >= 10 ? 'high' : 'medium',
          confidence: Math.min(uniqueFiles.size / 5, 1),
          nodes,
          description: `Feature '${feature}' scattered across ${uniqueFiles.size} files`,
          recommendation: 'Consolidate related functionality into cohesive modules',
          location: {
            filePath: nodes[0].filePath,
            lineNumber: nodes[0].lineNumber,
          },
          metrics: {
            affectedFiles: uniqueFiles.size,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Detect Long Parameter List anti-pattern
   * Functions with too many parameters
   */
  private detectLongParameterLists(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];
    const LONG_PARAM_THRESHOLD = 5;

    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) {
        continue;
      }

      const paramCount = node.metadata?.parameters?.length || 0;

      if (paramCount >= LONG_PARAM_THRESHOLD) {
        matches.push({
          type: AntiPatternType.LONG_PARAMETER_LIST,
          severity: paramCount >= 8 ? 'high' : 'medium',
          confidence: Math.min(paramCount / LONG_PARAM_THRESHOLD, 1),
          nodes: [node],
          description: `Function '${node.name}' has ${paramCount} parameters`,
          recommendation: 'Introduce parameter object or builder pattern to reduce parameter count',
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          metrics: {
            parameterCount: paramCount,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Detect Data Clumps anti-pattern
   * Same group of parameters appearing together repeatedly
   */
  private detectDataClumps(): AntiPatternMatch[] {
    const matches: AntiPatternMatch[] = [];

    // Collect parameter groups from functions
    const parameterGroups = new Map<string, GraphNode[]>();
    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION && node.metadata?.parameters) {
        const params = node.metadata.parameters.slice(0, 3).sort().join(',');
        if (params.split(',').length >= 3) {
          if (!parameterGroups.has(params)) {
            parameterGroups.set(params, []);
          }
          parameterGroups.get(params)!.push(node);
        }
      }
    }

    // Check for repeated parameter groups
    for (const [params, nodes] of parameterGroups.entries()) {
      if (nodes.length >= 3) {
        matches.push({
          type: AntiPatternType.DATA_CLUMPS,
          severity: nodes.length >= 5 ? 'high' : 'medium',
          confidence: Math.min(nodes.length / 3, 1),
          nodes,
          description: `Parameter group (${params}) appears in ${nodes.length} functions`,
          recommendation: 'Extract data clump into a class or data structure',
          location: {
            filePath: nodes[0].filePath,
            lineNumber: nodes[0].lineNumber,
          },
          metrics: {
            affectedFiles: new Set(nodes.map(n => n.filePath)).size,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.nodes.clear();
    this.relationships.clear();
  }
}

suite('Pattern Identification - Anti-Pattern Detection Tests', () => {
  let testWorkspacePath: string;
  let detector: AntiPatternDetector;

  setup(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);
    testWorkspacePath = await createTestWorkspace('anti-pattern-tests');
    detector = new AntiPatternDetector();
  });

  teardown(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    detector.clear();
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Anti-Pattern Detection', () => {
    test('Should detect God Object anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create a class with too many methods and dependencies
      const godClass: GraphNode = {
        id: 'god-class',
        type: NodeType.CLASS,
        name: 'UserManager',
        filePath: `${testWorkspacePath}/UserManager.ts`,
        lineNumber: 1,
        metadata: {
          methods: Array.from({ length: 25 }, (_, i) => `method${i + 1}`),
        },
      };

      detector.addNode(godClass);

      // Add 12 dependencies
      for (let i = 0; i < 12; i++) {
        detector.addRelationship({
          id: `dep-${i}`,
          type: RelationType.DEPENDS_ON,
          sourceId: 'god-class',
          targetId: `external-${i}`,
        });
      }

      const antiPatterns = detector.detectAntiPatterns();
      const godObject = antiPatterns.find(p => p.type === AntiPatternType.GOD_OBJECT);

      assert.ok(godObject, 'Should detect God Object');
      assert.strictEqual(godObject!.nodes[0].name, 'UserManager');
      assert.ok(['medium', 'high', 'critical'].includes(godObject!.severity));
      assert.ok(godObject!.confidence > 0.5);
      assert.strictEqual(godObject!.metrics?.methodCount, 25);
      assert.strictEqual(godObject!.metrics?.dependencyCount, 12);
      assert.ok(godObject!.recommendation.toLowerCase().includes('split'));

      console.log(`✓ God Object detected: ${godObject!.description}`);
    });

    test('Should detect Spaghetti Code anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create a function with high cyclomatic complexity
      const complexFunction: GraphNode = {
        id: 'complex-func',
        type: NodeType.FUNCTION,
        name: 'processData',
        filePath: `${testWorkspacePath}/processor.ts`,
        lineNumber: 10,
        metadata: {
          cyclomaticComplexity: 18,
          lineCount: 150,
        },
      };

      detector.addNode(complexFunction);

      const antiPatterns = detector.detectAntiPatterns();
      const spaghettiCode = antiPatterns.find(p => p.type === AntiPatternType.SPAGHETTI_CODE);

      assert.ok(spaghettiCode, 'Should detect Spaghetti Code');
      assert.strictEqual(spaghettiCode!.nodes[0].name, 'processData');
      assert.ok(['medium', 'high', 'critical'].includes(spaghettiCode!.severity));
      assert.strictEqual(spaghettiCode!.metrics?.cyclomaticComplexity, 18);
      assert.ok(spaghettiCode!.recommendation.toLowerCase().includes('refactor'));

      console.log(`✓ Spaghetti Code detected: ${spaghettiCode!.description}`);
    });

    test('Should detect Circular Dependency anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create circular dependency: A → B → C → A
      const moduleA: GraphNode = {
        id: 'module-a',
        type: NodeType.MODULE,
        name: 'ModuleA',
        filePath: `${testWorkspacePath}/moduleA.ts`,
        lineNumber: 1,
      };

      const moduleB: GraphNode = {
        id: 'module-b',
        type: NodeType.MODULE,
        name: 'ModuleB',
        filePath: `${testWorkspacePath}/moduleB.ts`,
        lineNumber: 1,
      };

      const moduleC: GraphNode = {
        id: 'module-c',
        type: NodeType.MODULE,
        name: 'ModuleC',
        filePath: `${testWorkspacePath}/moduleC.ts`,
        lineNumber: 1,
      };

      detector.addNode(moduleA);
      detector.addNode(moduleB);
      detector.addNode(moduleC);

      detector.addRelationship({
        id: 'a-to-b',
        type: RelationType.IMPORTS,
        sourceId: 'module-a',
        targetId: 'module-b',
      });

      detector.addRelationship({
        id: 'b-to-c',
        type: RelationType.IMPORTS,
        sourceId: 'module-b',
        targetId: 'module-c',
      });

      detector.addRelationship({
        id: 'c-to-a',
        type: RelationType.IMPORTS,
        sourceId: 'module-c',
        targetId: 'module-a',
      });

      const antiPatterns = detector.detectAntiPatterns();
      const circularDep = antiPatterns.find(p => p.type === AntiPatternType.CIRCULAR_DEPENDENCY);

      assert.ok(circularDep, 'Should detect Circular Dependency');
      assert.strictEqual(circularDep!.confidence, 1.0);
      assert.ok(circularDep!.nodes.length >= 3);
      assert.ok(circularDep!.description.includes('Circular dependency'));
      assert.ok(circularDep!.recommendation.toLowerCase().includes('break'));

      console.log(`✓ Circular Dependency detected: ${circularDep!.description}`);
    });

    test('Should detect Feature Envy anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create a function that makes many calls to external class
      const envyFunction: GraphNode = {
        id: 'envy-func',
        type: NodeType.FUNCTION,
        name: 'calculateTotal',
        filePath: `${testWorkspacePath}/calculator.ts`,
        lineNumber: 5,
      };

      detector.addNode(envyFunction);

      // Create target methods in external class
      for (let i = 0; i < 6; i++) {
        const targetMethod: GraphNode = {
          id: `target-${i}`,
          type: NodeType.FUNCTION,
          name: `getPrice${i}`,
          filePath: `${testWorkspacePath}/Product.ts`,
          lineNumber: 10 + i,
          metadata: {
            className: 'Product',
          },
        };

        detector.addNode(targetMethod);

        detector.addRelationship({
          id: `call-${i}`,
          type: RelationType.CALLS,
          sourceId: 'envy-func',
          targetId: `target-${i}`,
        });
      }

      const antiPatterns = detector.detectAntiPatterns();
      const featureEnvy = antiPatterns.find(p => p.type === AntiPatternType.FEATURE_ENVY);

      assert.ok(featureEnvy, 'Should detect Feature Envy');
      assert.strictEqual(featureEnvy!.nodes[0].name, 'calculateTotal');
      assert.ok(featureEnvy!.metrics?.externalCalls! >= 5);
      assert.ok(featureEnvy!.description.includes('Product'));
      assert.ok(featureEnvy!.recommendation.toLowerCase().includes('move'));

      console.log(`✓ Feature Envy detected: ${featureEnvy!.description}`);
    });

    test('Should detect Shotgun Surgery anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create feature scattered across multiple files
      const feature = 'authentication';
      for (let i = 0; i < 6; i++) {
        const node: GraphNode = {
          id: `auth-node-${i}`,
          type: NodeType.FUNCTION,
          name: `authFunction${i}`,
          filePath: `${testWorkspacePath}/file${i}.ts`,
          lineNumber: 1,
          metadata: {
            feature,
          },
        };

        detector.addNode(node);
      }

      const antiPatterns = detector.detectAntiPatterns();
      const shotgunSurgery = antiPatterns.find(p => p.type === AntiPatternType.SHOTGUN_SURGERY);

      assert.ok(shotgunSurgery, 'Should detect Shotgun Surgery');
      assert.ok(shotgunSurgery!.metrics?.affectedFiles! >= 5);
      assert.ok(shotgunSurgery!.description.includes('authentication'));
      assert.ok(shotgunSurgery!.recommendation.toLowerCase().includes('consolidate'));

      console.log(`✓ Shotgun Surgery detected: ${shotgunSurgery!.description}`);
    });

    test('Should detect Long Parameter List anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create function with too many parameters
      const longParamFunction: GraphNode = {
        id: 'long-param-func',
        type: NodeType.FUNCTION,
        name: 'createUser',
        filePath: `${testWorkspacePath}/user.ts`,
        lineNumber: 15,
        metadata: {
          parameters: ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'],
        },
      };

      detector.addNode(longParamFunction);

      const antiPatterns = detector.detectAntiPatterns();
      const longParamList = antiPatterns.find(p => p.type === AntiPatternType.LONG_PARAMETER_LIST);

      assert.ok(longParamList, 'Should detect Long Parameter List');
      assert.strictEqual(longParamList!.nodes[0].name, 'createUser');
      assert.strictEqual(longParamList!.metrics?.parameterCount, 8);
      assert.ok(longParamList!.recommendation.toLowerCase().includes('parameter object'));

      console.log(`✓ Long Parameter List detected: ${longParamList!.description}`);
    });

    test('Should detect Data Clumps anti-pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create multiple functions with same parameter group
      const commonParams = ['x', 'y', 'z'];
      for (let i = 0; i < 4; i++) {
        const func: GraphNode = {
          id: `func-${i}`,
          type: NodeType.FUNCTION,
          name: `process${i}`,
          filePath: `${testWorkspacePath}/processor${i}.ts`,
          lineNumber: 10,
          metadata: {
            parameters: [...commonParams, `extra${i}`],
          },
        };

        detector.addNode(func);
      }

      const antiPatterns = detector.detectAntiPatterns();
      const dataClumps = antiPatterns.find(p => p.type === AntiPatternType.DATA_CLUMPS);

      assert.ok(dataClumps, 'Should detect Data Clumps');
      assert.ok(dataClumps!.nodes.length >= 3);
      assert.ok(dataClumps!.description.includes('x,y,z'));
      assert.ok(dataClumps!.recommendation.toLowerCase().includes('extract'));

      console.log(`✓ Data Clumps detected: ${dataClumps!.description}`);
    });
  });
});
