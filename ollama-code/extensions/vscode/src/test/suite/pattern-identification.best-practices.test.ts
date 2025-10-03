/**
 * Pattern Identification - Best Practices Integration Tests
 * Tests generation of refactoring, optimization, and security recommendations
 *
 * Tests recommendation generation for:
 * - Refactoring recommendations (based on anti-patterns)
 * - Optimization recommendations (performance improvements)
 * - Security recommendations (vulnerability fixes)
 * - Recommendation prioritization (severity and impact)
 * - Actionability scoring (effort and feasibility)
 */

import * as assert from 'assert';
import { createTestWorkspace, cleanupTestWorkspace } from '../helpers/extensionTestHelper';
import {
  PROVIDER_TEST_TIMEOUTS,
  ANTI_PATTERN_THRESHOLDS,
} from '../helpers/test-constants';
import { NodeType, GraphNode, GraphRelationship, RelationType } from '../helpers/graph-types';

/**
 * Recommendation types
 */
enum RecommendationType {
  REFACTORING = 'refactoring',
  OPTIMIZATION = 'optimization',
  SECURITY = 'security',
}

/**
 * Recommendation priority levels
 */
enum RecommendationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Recommendation result
 */
interface Recommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  affectedNodes: GraphNode[];
  actionableSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  actionabilityScore: number; // 0-1 (feasibility)
  location: {
    filePath: string;
    lineNumber: number;
  };
  codeExample?: {
    before: string;
    after: string;
  };
}

/**
 * Best Practices Analyzer
 * Generates recommendations based on code analysis
 */
class BestPracticesAnalyzer {
  private nodes: Map<string, GraphNode> = new Map();
  private relationships: Map<string, GraphRelationship> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  addRelationship(rel: GraphRelationship): void {
    this.relationships.set(rel.id, rel);
  }

  /**
   * Generate refactoring recommendations
   */
  generateRefactoringRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Detect God Objects and recommend splitting
    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.CLASS) continue;

      const methodCount = node.metadata?.methods?.length || 0;
      const dependencies = Array.from(this.relationships.values()).filter(
        rel => rel.sourceId === node.id && rel.type === RelationType.DEPENDS_ON
      ).length;

      if (methodCount >= ANTI_PATTERN_THRESHOLDS.GOD_OBJECT.METHOD_COUNT) {
        const priority = methodCount >= ANTI_PATTERN_THRESHOLDS.GOD_OBJECT.CRITICAL_METHODS
          ? RecommendationPriority.CRITICAL
          : RecommendationPriority.HIGH;

        const effortScore = methodCount / ANTI_PATTERN_THRESHOLDS.GOD_OBJECT.METHOD_COUNT;
        const estimatedEffort = effortScore >= 2 ? 'high' : effortScore >= 1.5 ? 'medium' : 'low';

        recommendations.push({
          type: RecommendationType.REFACTORING,
          priority,
          title: `Split God Object: ${node.name}`,
          description: `Class '${node.name}' has ${methodCount} methods and ${dependencies} dependencies, violating Single Responsibility Principle. Consider splitting into multiple focused classes.`,
          affectedNodes: [node],
          actionableSteps: [
            'Identify cohesive method groups within the class',
            'Extract each group into a separate class with a single responsibility',
            'Use dependency injection to manage relationships',
            'Update all references to use the new classes',
            'Add unit tests for each new class',
          ],
          estimatedEffort,
          expectedImpact: 'high',
          actionabilityScore: 0.7, // Moderate feasibility
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          codeExample: {
            before: `class ${node.name} {\n  // ${methodCount} methods\n  // Too many responsibilities\n}`,
            after: `class UserAuthentication { ... }\nclass UserProfile { ... }\nclass UserPermissions { ... }`,
          },
        });
      }
    }

    // Detect Spaghetti Code and recommend refactoring
    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) continue;

      const complexity = node.metadata?.cyclomaticComplexity || 0;
      if (complexity >= ANTI_PATTERN_THRESHOLDS.SPAGHETTI_CODE.COMPLEXITY) {
        const priority = complexity >= ANTI_PATTERN_THRESHOLDS.SPAGHETTI_CODE.CRITICAL_COMPLEXITY
          ? RecommendationPriority.CRITICAL
          : RecommendationPriority.HIGH;

        recommendations.push({
          type: RecommendationType.REFACTORING,
          priority,
          title: `Reduce Complexity: ${node.name}`,
          description: `Function '${node.name}' has cyclomatic complexity of ${complexity}, making it hard to maintain and test. Consider breaking it down into smaller functions.`,
          affectedNodes: [node],
          actionableSteps: [
            'Extract conditional logic into separate functions',
            'Use early returns to reduce nesting',
            'Apply the Strategy pattern for complex conditionals',
            'Create helper functions for repeated logic',
            'Add unit tests for each extracted function',
          ],
          estimatedEffort: 'medium',
          expectedImpact: 'high',
          actionabilityScore: 0.8,
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
        });
      }
    }

    // Detect Long Parameter Lists and recommend parameter objects
    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) continue;

      const paramCount = node.metadata?.parameters?.length || 0;
      if (paramCount >= ANTI_PATTERN_THRESHOLDS.LONG_PARAMETER_LIST.PARAM_THRESHOLD) {
        const priority = paramCount >= ANTI_PATTERN_THRESHOLDS.LONG_PARAMETER_LIST.HIGH_PARAM_COUNT
          ? RecommendationPriority.HIGH
          : RecommendationPriority.MEDIUM;

        recommendations.push({
          type: RecommendationType.REFACTORING,
          priority,
          title: `Introduce Parameter Object: ${node.name}`,
          description: `Function '${node.name}' has ${paramCount} parameters. Consider grouping related parameters into a configuration object.`,
          affectedNodes: [node],
          actionableSteps: [
            'Group related parameters into a configuration object',
            'Create an interface for the parameter object',
            'Update function signature to accept the object',
            'Update all call sites to use the new signature',
            'Add JSDoc documentation for the parameter object',
          ],
          estimatedEffort: 'low',
          expectedImpact: 'medium',
          actionabilityScore: 0.9,
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          codeExample: {
            before: `function ${node.name}(${(node.metadata?.parameters || []).join(', ')}) { ... }`,
            after: `interface ${node.name}Config {\n  ${(node.metadata?.parameters || []).map(p => `${p}: any`).join(';\n  ')}\n}\nfunction ${node.name}(config: ${node.name}Config) { ... }`,
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Detect functions with high line count
    for (const node of this.nodes.values()) {
      if (node.type !== NodeType.FUNCTION) continue;

      const lineCount = node.metadata?.lineCount || 0;
      if (lineCount > 100) {
        recommendations.push({
          type: RecommendationType.OPTIMIZATION,
          priority: lineCount > 200 ? RecommendationPriority.HIGH : RecommendationPriority.MEDIUM,
          title: `Optimize Large Function: ${node.name}`,
          description: `Function '${node.name}' is ${lineCount} lines long. Large functions are harder to optimize and maintain.`,
          affectedNodes: [node],
          actionableSteps: [
            'Profile the function to identify performance bottlenecks',
            'Extract hot paths into separate optimized functions',
            'Consider memoization for expensive calculations',
            'Use lazy evaluation where applicable',
            'Add performance tests to track improvements',
          ],
          estimatedEffort: 'medium',
          expectedImpact: 'medium',
          actionabilityScore: 0.7,
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
        });
      }
    }

    // Detect circular dependencies (performance impact)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        const cycleNodes = path.slice(path.indexOf(nodeId)).map(id => this.nodes.get(id)!);

        recommendations.push({
          type: RecommendationType.OPTIMIZATION,
          priority: RecommendationPriority.HIGH,
          title: `Break Circular Dependency`,
          description: `Circular dependency detected: ${path.slice(path.indexOf(nodeId)).join(' → ')}. This can cause module loading issues and performance degradation.`,
          affectedNodes: cycleNodes,
          actionableSteps: [
            'Identify the shared functionality causing the cycle',
            'Extract shared code into a separate module',
            'Use dependency inversion to break the cycle',
            'Consider using interfaces to decouple dependencies',
            'Update module imports to use the new structure',
          ],
          estimatedEffort: 'high',
          expectedImpact: 'high',
          actionabilityScore: 0.6,
          location: {
            filePath: cycleNodes[0].filePath,
            lineNumber: cycleNodes[0].lineNumber,
          },
        });

        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingRels = Array.from(this.relationships.values()).filter(
        rel => rel.sourceId === nodeId && (rel.type === RelationType.IMPORTS || rel.type === RelationType.DEPENDS_ON)
      );

      for (const rel of outgoingRels) {
        if (detectCycle(rel.targetId, [...path, nodeId])) {
          break; // Only report first cycle
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this.nodes.values()) {
      if (!visited.has(node.id)) {
        detectCycle(node.id, []);
      }
    }

    return recommendations;
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Detect authentication-related nodes without proper validation
    for (const node of this.nodes.values()) {
      if (node.name.toLowerCase().includes('auth') || node.name.toLowerCase().includes('login')) {
        const hasValidation = Array.from(this.relationships.values()).some(
          rel => rel.sourceId === node.id && this.nodes.get(rel.targetId)?.name.includes('validate')
        );

        if (!hasValidation) {
          recommendations.push({
            type: RecommendationType.SECURITY,
            priority: RecommendationPriority.CRITICAL,
            title: `Add Input Validation: ${node.name}`,
            description: `Authentication function '${node.name}' may be missing input validation. Always validate and sanitize user inputs.`,
            affectedNodes: [node],
            actionableSteps: [
              'Add input validation for all user-provided data',
              'Implement rate limiting to prevent brute force attacks',
              'Use parameterized queries to prevent SQL injection',
              'Sanitize inputs to prevent XSS attacks',
              'Add security-focused unit tests',
            ],
            estimatedEffort: 'medium',
            expectedImpact: 'high',
            actionabilityScore: 0.9,
            location: {
              filePath: node.filePath,
              lineNumber: node.lineNumber,
            },
          });
        }
      }
    }

    // Detect database queries without prepared statements
    for (const node of this.nodes.values()) {
      if (node.name.toLowerCase().includes('query') || node.name.toLowerCase().includes('sql')) {
        recommendations.push({
          type: RecommendationType.SECURITY,
          priority: RecommendationPriority.HIGH,
          title: `Use Prepared Statements: ${node.name}`,
          description: `Database function '${node.name}' should use prepared statements to prevent SQL injection vulnerabilities.`,
          affectedNodes: [node],
          actionableSteps: [
            'Replace string concatenation with parameterized queries',
            'Use an ORM or query builder with built-in SQL injection protection',
            'Validate and sanitize all user inputs',
            'Implement input whitelisting where applicable',
            'Add penetration tests for SQL injection',
          ],
          estimatedEffort: 'low',
          expectedImpact: 'high',
          actionabilityScore: 0.95,
          location: {
            filePath: node.filePath,
            lineNumber: node.lineNumber,
          },
          codeExample: {
            before: `db.query(\`SELECT * FROM users WHERE id = \${userId}\`)`,
            after: `db.query('SELECT * FROM users WHERE id = ?', [userId])`,
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate all recommendations and prioritize them
   */
  generateAllRecommendations(): Recommendation[] {
    const allRecommendations = [
      ...this.generateRefactoringRecommendations(),
      ...this.generateOptimizationRecommendations(),
      ...this.generateSecurityRecommendations(),
    ];

    // Sort by priority and actionability score
    return this.prioritizeRecommendations(allRecommendations);
  }

  /**
   * Prioritize recommendations by priority level and actionability score
   */
  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = {
      [RecommendationPriority.CRITICAL]: 4,
      [RecommendationPriority.HIGH]: 3,
      [RecommendationPriority.MEDIUM]: 2,
      [RecommendationPriority.LOW]: 1,
    };

    return recommendations.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by actionability score (higher is better)
      return b.actionabilityScore - a.actionabilityScore;
    });
  }
}

/**
 * Test helper: Create test node
 */
function createTestNode(
  id: string,
  type: NodeType,
  name: string,
  testWorkspacePath: string,
  fileName: string,
  lineNumber: number = 1,
  metadata?: any
): GraphNode {
  return {
    id,
    type,
    name,
    filePath: `${testWorkspacePath}/${fileName}`,
    lineNumber,
    metadata,
  };
}

suite('Pattern Identification - Best Practices Integration Tests', () => {
  let testWorkspacePath: string;
  let analyzer: BestPracticesAnalyzer;

  setup(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);
    testWorkspacePath = await createTestWorkspace('best-practices-tests');
    analyzer = new BestPracticesAnalyzer();
  });

  teardown(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Refactoring Recommendations', () => {
    test('Should generate refactoring recommendation for God Object', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const godClass = createTestNode(
        'god-class',
        NodeType.CLASS,
        'UserManager',
        testWorkspacePath,
        'UserManager.ts',
        1,
        {
          methods: Array.from({ length: 30 }, (_, i) => `method${i + 1}`),
        }
      );

      analyzer.addNode(godClass);

      const recommendations = analyzer.generateRefactoringRecommendations();
      const godObjectRec = recommendations.find(r => r.title.includes('God Object'));

      assert.ok(godObjectRec, 'Should generate God Object recommendation');
      assert.strictEqual(godObjectRec!.type, RecommendationType.REFACTORING);
      assert.ok(['high', 'critical'].includes(godObjectRec!.priority));
      assert.ok(godObjectRec!.actionableSteps.length >= 3);
      assert.ok(godObjectRec!.description.includes('Single Responsibility'));
      assert.ok(godObjectRec!.codeExample?.before);
      assert.ok(godObjectRec!.codeExample?.after);

      console.log(`✓ Generated refactoring recommendation: ${godObjectRec!.title}`);
    });

    test('Should generate refactoring recommendation for Spaghetti Code', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const complexFunction = createTestNode(
        'complex-func',
        NodeType.FUNCTION,
        'processData',
        testWorkspacePath,
        'processor.ts',
        10,
        {
          cyclomaticComplexity: 25,
          lineCount: 150,
        }
      );

      analyzer.addNode(complexFunction);

      const recommendations = analyzer.generateRefactoringRecommendations();
      const complexityRec = recommendations.find(r => r.title.includes('Reduce Complexity'));

      assert.ok(complexityRec, 'Should generate complexity recommendation');
      assert.strictEqual(complexityRec!.type, RecommendationType.REFACTORING);
      assert.ok(['high', 'critical'].includes(complexityRec!.priority));
      assert.ok(complexityRec!.description.includes('cyclomatic complexity'));
      assert.ok(complexityRec!.actionableSteps.some(step => step.includes('Extract')));

      console.log(`✓ Generated complexity recommendation: ${complexityRec!.title}`);
    });

    test('Should generate refactoring recommendation for Long Parameter List', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const longParamFunction = createTestNode(
        'long-param-func',
        NodeType.FUNCTION,
        'createUser',
        testWorkspacePath,
        'user.ts',
        15,
        {
          parameters: ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'],
        }
      );

      analyzer.addNode(longParamFunction);

      const recommendations = analyzer.generateRefactoringRecommendations();
      const paramRec = recommendations.find(r => r.title.includes('Parameter Object'));

      assert.ok(paramRec, 'Should generate parameter object recommendation');
      assert.strictEqual(paramRec!.type, RecommendationType.REFACTORING);
      assert.ok(paramRec!.description.includes('8 parameters'));
      assert.ok(paramRec!.codeExample?.before.includes('name, email'));
      assert.ok(paramRec!.codeExample?.after.includes('interface'));
      assert.strictEqual(paramRec!.estimatedEffort, 'low');
      assert.ok(paramRec!.actionabilityScore >= 0.8);

      console.log(`✓ Generated parameter object recommendation: ${paramRec!.title}`);
    });
  });

  suite('Optimization Recommendations', () => {
    test('Should generate optimization recommendation for large function', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const largeFunction = createTestNode(
        'large-func',
        NodeType.FUNCTION,
        'processLargeDataset',
        testWorkspacePath,
        'processor.ts',
        100,
        {
          lineCount: 250,
          cyclomaticComplexity: 10,
        }
      );

      analyzer.addNode(largeFunction);

      const recommendations = analyzer.generateOptimizationRecommendations();
      const optimizationRec = recommendations.find(r => r.title.includes('Optimize Large Function'));

      assert.ok(optimizationRec, 'Should generate optimization recommendation');
      assert.strictEqual(optimizationRec!.type, RecommendationType.OPTIMIZATION);
      assert.strictEqual(optimizationRec!.priority, RecommendationPriority.HIGH);
      assert.ok(optimizationRec!.actionableSteps.some(step => step.includes('Profile')));
      assert.ok(optimizationRec!.description.includes('250 lines'));

      console.log(`✓ Generated optimization recommendation: ${optimizationRec!.title}`);
    });

    test('Should generate optimization recommendation for circular dependency', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const moduleA = createTestNode('module-a', NodeType.MODULE, 'ModuleA', testWorkspacePath, 'moduleA.ts');
      const moduleB = createTestNode('module-b', NodeType.MODULE, 'ModuleB', testWorkspacePath, 'moduleB.ts');
      const moduleC = createTestNode('module-c', NodeType.MODULE, 'ModuleC', testWorkspacePath, 'moduleC.ts');

      analyzer.addNode(moduleA);
      analyzer.addNode(moduleB);
      analyzer.addNode(moduleC);

      analyzer.addRelationship({ id: 'a-to-b', type: RelationType.IMPORTS, sourceId: 'module-a', targetId: 'module-b' });
      analyzer.addRelationship({ id: 'b-to-c', type: RelationType.IMPORTS, sourceId: 'module-b', targetId: 'module-c' });
      analyzer.addRelationship({ id: 'c-to-a', type: RelationType.IMPORTS, sourceId: 'module-c', targetId: 'module-a' });

      const recommendations = analyzer.generateOptimizationRecommendations();
      const circularRec = recommendations.find(r => r.title.includes('Circular Dependency'));

      assert.ok(circularRec, 'Should generate circular dependency recommendation');
      assert.strictEqual(circularRec!.type, RecommendationType.OPTIMIZATION);
      assert.strictEqual(circularRec!.priority, RecommendationPriority.HIGH);
      assert.ok(circularRec!.description.includes('Circular dependency'));
      assert.ok(circularRec!.actionableSteps.some(step => step.includes('Extract')));
      assert.strictEqual(circularRec!.estimatedEffort, 'high');

      console.log(`✓ Generated circular dependency recommendation: ${circularRec!.title}`);
    });
  });

  suite('Security Recommendations', () => {
    test('Should generate security recommendation for authentication without validation', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const authFunction = createTestNode(
        'auth-func',
        NodeType.FUNCTION,
        'authenticateUser',
        testWorkspacePath,
        'auth.ts',
        20
      );

      analyzer.addNode(authFunction);

      const recommendations = analyzer.generateSecurityRecommendations();
      const securityRec = recommendations.find(r => r.title.includes('Input Validation'));

      assert.ok(securityRec, 'Should generate security recommendation');
      assert.strictEqual(securityRec!.type, RecommendationType.SECURITY);
      assert.strictEqual(securityRec!.priority, RecommendationPriority.CRITICAL);
      assert.ok(securityRec!.description.includes('input validation'));
      assert.ok(securityRec!.actionableSteps.some(step => step.includes('sanitize')));
      assert.strictEqual(securityRec!.expectedImpact, 'high');

      console.log(`✓ Generated security recommendation: ${securityRec!.title}`);
    });

    test('Should generate security recommendation for SQL queries', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const queryFunction = createTestNode(
        'query-func',
        NodeType.FUNCTION,
        'getUserQuery',
        testWorkspacePath,
        'database.ts',
        50
      );

      analyzer.addNode(queryFunction);

      const recommendations = analyzer.generateSecurityRecommendations();
      const sqlRec = recommendations.find(r => r.title.includes('Prepared Statements'));

      assert.ok(sqlRec, 'Should generate SQL security recommendation');
      assert.strictEqual(sqlRec!.type, RecommendationType.SECURITY);
      assert.strictEqual(sqlRec!.priority, RecommendationPriority.HIGH);
      assert.ok(sqlRec!.description.includes('prepared statements'));
      assert.ok(sqlRec!.codeExample?.before.includes('$'));
      assert.ok(sqlRec!.codeExample?.after.includes('?'));
      assert.ok(sqlRec!.actionabilityScore >= 0.9);

      console.log(`✓ Generated SQL security recommendation: ${sqlRec!.title}`);
    });
  });

  suite('Recommendation Prioritization', () => {
    test('Should prioritize recommendations by severity and actionability', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Add various nodes that will generate recommendations
      analyzer.addNode(createTestNode('auth', NodeType.FUNCTION, 'authenticateUser', testWorkspacePath, 'auth.ts', 1));
      analyzer.addNode(createTestNode('god', NodeType.CLASS, 'UserManager', testWorkspacePath, 'manager.ts', 1, { methods: Array.from({ length: 30 }, (_, i) => `m${i}`) }));
      analyzer.addNode(createTestNode('query', NodeType.FUNCTION, 'sqlQuery', testWorkspacePath, 'db.ts', 1));

      const recommendations = analyzer.generateAllRecommendations();

      assert.ok(recommendations.length >= 3, 'Should generate multiple recommendations');

      // Security recommendations should come first (if critical)
      const criticalRecs = recommendations.filter(r => r.priority === RecommendationPriority.CRITICAL);
      assert.ok(criticalRecs.length > 0, 'Should have critical recommendations');
      assert.strictEqual(recommendations[0].priority, RecommendationPriority.CRITICAL, 'First recommendation should be critical');

      // Verify sorting by actionability within same priority
      let lastPriorityOrder = 4;
      for (const rec of recommendations) {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }[rec.priority];
        assert.ok(priorityOrder <= lastPriorityOrder, 'Recommendations should be sorted by priority');
        lastPriorityOrder = priorityOrder;
      }

      console.log(`✓ Prioritized ${recommendations.length} recommendations correctly`);
    });

    test('Should calculate actionability scores correctly', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Low effort, high impact = high actionability
      const longParamFunc = createTestNode('func1', NodeType.FUNCTION, 'createUser', testWorkspacePath, 'user.ts', 1, {
        parameters: ['a', 'b', 'c', 'd', 'e', 'f'],
      });

      // High effort, high impact = moderate actionability
      const godClass = createTestNode('class1', NodeType.CLASS, 'Manager', testWorkspacePath, 'manager.ts', 1, {
        methods: Array.from({ length: 40 }, (_, i) => `m${i}`),
      });

      analyzer.addNode(longParamFunc);
      analyzer.addNode(godClass);

      const recommendations = analyzer.generateRefactoringRecommendations();

      const paramRec = recommendations.find(r => r.title.includes('Parameter Object'));
      const godRec = recommendations.find(r => r.title.includes('God Object'));

      assert.ok(paramRec, 'Should have parameter object recommendation');
      assert.ok(godRec, 'Should have God Object recommendation');

      // Parameter object should have higher actionability (easier to implement)
      assert.ok(paramRec!.actionabilityScore > godRec!.actionabilityScore, 'Low-effort refactoring should have higher actionability');
      assert.strictEqual(paramRec!.estimatedEffort, 'low');
      assert.ok(['medium', 'high'].includes(godRec!.estimatedEffort));

      console.log(`✓ Actionability scores: Parameter Object=${paramRec!.actionabilityScore}, God Object=${godRec!.actionabilityScore}`);
    });
  });

  suite('Actionability Scoring', () => {
    test('Should provide actionable steps for each recommendation', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      analyzer.addNode(createTestNode('func', NodeType.FUNCTION, 'complexFunction', testWorkspacePath, 'app.ts', 1, {
        cyclomaticComplexity: 20,
      }));

      const recommendations = analyzer.generateRefactoringRecommendations();
      const rec = recommendations[0];

      assert.ok(rec, 'Should have recommendation');
      assert.ok(rec.actionableSteps.length >= 3, 'Should have at least 3 actionable steps');

      // All steps should be concrete and actionable
      for (const step of rec.actionableSteps) {
        assert.ok(step.length > 10, 'Steps should be descriptive');
        assert.ok(/^[A-Z]/.test(step), 'Steps should start with capital letter');
      }

      console.log(`✓ Provided ${rec.actionableSteps.length} actionable steps`);
    });

    test('Should include code examples for applicable recommendations', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      analyzer.addNode(createTestNode('func', NodeType.FUNCTION, 'createUser', testWorkspacePath, 'user.ts', 1, {
        parameters: ['name', 'email', 'phone', 'address', 'city', 'state'],
      }));

      const recommendations = analyzer.generateRefactoringRecommendations();
      const paramRec = recommendations.find(r => r.title.includes('Parameter Object'));

      assert.ok(paramRec, 'Should have parameter object recommendation');
      assert.ok(paramRec!.codeExample, 'Should include code example');
      assert.ok(paramRec!.codeExample!.before, 'Should have before code');
      assert.ok(paramRec!.codeExample!.after, 'Should have after code');
      assert.ok(paramRec!.codeExample!.before.includes('name'), 'Before should show parameters');
      assert.ok(paramRec!.codeExample!.after.includes('interface'), 'After should show interface');

      console.log(`✓ Code example provided:\nBefore: ${paramRec!.codeExample!.before}\nAfter: ${paramRec!.codeExample!.after}`);
    });

    test('Should estimate effort and impact for all recommendations', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      analyzer.addNode(createTestNode('god', NodeType.CLASS, 'Manager', testWorkspacePath, 'manager.ts', 1, { methods: Array.from({ length: 50 }, (_, i) => `m${i}`) }));
      analyzer.addNode(createTestNode('func', NodeType.FUNCTION, 'complexFunc', testWorkspacePath, 'app.ts', 1, { cyclomaticComplexity: 30, lineCount: 200 }));

      const recommendations = analyzer.generateAllRecommendations();

      for (const rec of recommendations) {
        assert.ok(['low', 'medium', 'high'].includes(rec.estimatedEffort), 'Should have valid effort estimate');
        assert.ok(['low', 'medium', 'high'].includes(rec.expectedImpact), 'Should have valid impact estimate');
        assert.ok(rec.actionabilityScore >= 0 && rec.actionabilityScore <= 1, 'Actionability score should be 0-1');
      }

      // High complexity should have high impact
      const complexRec = recommendations.find(r => r.affectedNodes.some(n => n.name === 'complexFunc'));
      assert.strictEqual(complexRec!.expectedImpact, 'high', 'Complex function refactoring should have high impact');

      console.log(`✓ All ${recommendations.length} recommendations have effort/impact estimates`);
    });
  });
});
