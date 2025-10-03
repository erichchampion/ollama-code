/**
 * Pattern Identification - Architecture Patterns Tests
 * Tests detection of common architectural patterns
 *
 * Tests architecture pattern detection for:
 * - MVC pattern
 * - Repository pattern
 * - Singleton pattern
 * - Factory pattern
 * - Observer pattern
 * - Strategy pattern
 * - Decorator pattern
 * - Adapter pattern
 */

import * as assert from 'assert';
import * as path from 'path';
import { createTestWorkspace, cleanupTestWorkspace } from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';
import { NodeType, GraphNode } from '../helpers/graph-types';

/**
 * Pattern types
 */
enum PatternType {
  MVC = 'mvc',
  REPOSITORY = 'repository',
  SINGLETON = 'singleton',
  FACTORY = 'factory',
  OBSERVER = 'observer',
  STRATEGY = 'strategy',
  DECORATOR = 'decorator',
  ADAPTER = 'adapter',
}

/**
 * Pattern detection result
 */
interface PatternMatch {
  type: PatternType;
  confidence: number; // 0-1
  nodes: GraphNode[];
  description: string;
  location: {
    filePath: string;
    lineNumber: number;
  };
}

/**
 * Pattern signature for detection
 */
interface PatternSignature {
  type: PatternType;
  requiredNodes: {
    type: NodeType;
    namePattern: RegExp;
  }[];
  requiredMethods?: string[];
  description: string;
}

/**
 * Pattern Detector
 */
class PatternDetector {
  private nodes: Map<string, GraphNode> = new Map();
  private patterns: PatternSignature[] = [];

  constructor() {
    this.initializePatternSignatures();
  }

  /**
   * Initialize pattern signatures
   */
  private initializePatternSignatures(): void {
    // MVC Pattern
    this.patterns.push({
      type: PatternType.MVC,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Controller$/i },
        { type: NodeType.CLASS, namePattern: /Model$/i },
        { type: NodeType.CLASS, namePattern: /View$/i },
      ],
      description: 'Model-View-Controller architectural pattern',
    });

    // Repository Pattern
    this.patterns.push({
      type: PatternType.REPOSITORY,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Repository$/i },
        { type: NodeType.INTERFACE, namePattern: /I.*Repository$/i },
      ],
      requiredMethods: ['findById', 'save', 'delete'],
      description: 'Repository pattern for data access abstraction',
    });

    // Singleton Pattern
    this.patterns.push({
      type: PatternType.SINGLETON,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /.+/ },
      ],
      requiredMethods: ['getInstance'],
      description: 'Singleton pattern ensuring single instance',
    });

    // Factory Pattern
    this.patterns.push({
      type: PatternType.FACTORY,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Factory$/i },
      ],
      requiredMethods: ['create', 'make'],
      description: 'Factory pattern for object creation',
    });

    // Observer Pattern
    this.patterns.push({
      type: PatternType.OBSERVER,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Subject$|Observable$/i },
        { type: NodeType.CLASS, namePattern: /Observer$/i },
      ],
      requiredMethods: ['subscribe', 'notify', 'update'],
      description: 'Observer pattern for event handling',
    });

    // Strategy Pattern
    this.patterns.push({
      type: PatternType.STRATEGY,
      requiredNodes: [
        { type: NodeType.INTERFACE, namePattern: /Strategy$/i },
        { type: NodeType.CLASS, namePattern: /.*Strategy$/i },
      ],
      requiredMethods: ['execute'],
      description: 'Strategy pattern for algorithm selection',
    });

    // Decorator Pattern
    this.patterns.push({
      type: PatternType.DECORATOR,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Decorator$/i },
      ],
      description: 'Decorator pattern for dynamic behavior extension',
    });

    // Adapter Pattern
    this.patterns.push({
      type: PatternType.ADAPTER,
      requiredNodes: [
        { type: NodeType.CLASS, namePattern: /Adapter$/i },
      ],
      requiredMethods: ['adapt', 'convert'],
      description: 'Adapter pattern for interface conversion',
    });
  }

  /**
   * Add node to detector
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Detect patterns in the codebase
   */
  detectPatterns(): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const signature of this.patterns) {
      const match = this.detectPattern(signature);
      if (match) {
        matches.push(match);
      }
    }

    return matches;
  }

  /**
   * Detect a specific pattern
   */
  private detectPattern(signature: PatternSignature): PatternMatch | null {
    const matchingNodes: GraphNode[] = [];
    let confidence = 0;

    // Check required nodes
    for (const requirement of signature.requiredNodes) {
      const found = Array.from(this.nodes.values()).find(
        node =>
          node.type === requirement.type &&
          requirement.namePattern.test(node.name)
      );

      if (!found) {
        return null; // Pattern not matched
      }

      matchingNodes.push(found);
      confidence += 0.3;
    }

    // Check required methods
    if (signature.requiredMethods) {
      const methodCount = signature.requiredMethods.length;
      let foundMethods = 0;

      for (const node of matchingNodes) {
        if (node.metadata?.parameters) {
          for (const method of signature.requiredMethods) {
            if (node.name.toLowerCase().includes(method.toLowerCase())) {
              foundMethods++;
            }
          }
        }

        // Check methods in metadata
        if (node.metadata?.methods) {
          const methods = node.metadata.methods as string[];
          foundMethods += signature.requiredMethods.filter(m =>
            methods.some(nodeMethod => nodeMethod.toLowerCase().includes(m.toLowerCase()))
          ).length;
        }
      }

      if (foundMethods > 0) {
        confidence += (foundMethods / methodCount) * 0.4;
      }
    }

    // Normalize confidence to 0-1
    confidence = Math.min(confidence, 1.0);

    // Only return if confidence is reasonable
    if (confidence < 0.3) {
      return null;
    }

    const primaryNode = matchingNodes[0];
    return {
      type: signature.type,
      confidence,
      nodes: matchingNodes,
      description: signature.description,
      location: {
        filePath: primaryNode.filePath,
        lineNumber: primaryNode.lineNumber,
      },
    };
  }

  /**
   * Clear all nodes
   */
  clear(): void {
    this.nodes.clear();
  }
}

/**
 * Helper: Create MVC pattern nodes
 */
function createMVCPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'user-controller',
    type: NodeType.CLASS,
    name: 'UserController',
    filePath: path.join(testWorkspacePath, 'controllers', 'UserController.ts'),
    lineNumber: 10,
    metadata: {
      methods: ['index', 'show', 'create', 'update', 'delete'],
    },
  });

  detector.addNode({
    id: 'user-model',
    type: NodeType.CLASS,
    name: 'UserModel',
    filePath: path.join(testWorkspacePath, 'models', 'UserModel.ts'),
    lineNumber: 5,
    metadata: {
      methods: ['validate', 'save', 'toJSON'],
    },
  });

  detector.addNode({
    id: 'user-view',
    type: NodeType.CLASS,
    name: 'UserView',
    filePath: path.join(testWorkspacePath, 'views', 'UserView.ts'),
    lineNumber: 8,
    metadata: {
      methods: ['render', 'update'],
    },
  });
}

/**
 * Helper: Create Repository pattern nodes
 */
function createRepositoryPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'user-repo-interface',
    type: NodeType.INTERFACE,
    name: 'IUserRepository',
    filePath: path.join(testWorkspacePath, 'repositories', 'IUserRepository.ts'),
    lineNumber: 3,
    metadata: {
      methods: ['findById', 'findAll', 'save', 'delete', 'update'],
    },
  });

  detector.addNode({
    id: 'user-repo',
    type: NodeType.CLASS,
    name: 'UserRepository',
    filePath: path.join(testWorkspacePath, 'repositories', 'UserRepository.ts'),
    lineNumber: 10,
    metadata: {
      methods: ['findById', 'findAll', 'save', 'delete', 'update'],
    },
  });
}

/**
 * Helper: Create Singleton pattern nodes
 */
function createSingletonPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'db-connection',
    type: NodeType.CLASS,
    name: 'DatabaseConnection',
    filePath: path.join(testWorkspacePath, 'database', 'DatabaseConnection.ts'),
    lineNumber: 5,
    metadata: {
      methods: ['getInstance', 'connect', 'disconnect'],
      description: 'Private constructor with getInstance method',
    },
  });
}

/**
 * Helper: Create Factory pattern nodes
 */
function createFactoryPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'user-factory',
    type: NodeType.CLASS,
    name: 'UserFactory',
    filePath: path.join(testWorkspacePath, 'factories', 'UserFactory.ts'),
    lineNumber: 5,
    metadata: {
      methods: ['create', 'createFromData', 'make'],
    },
  });
}

/**
 * Helper: Create Observer pattern nodes
 */
function createObserverPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'event-subject',
    type: NodeType.CLASS,
    name: 'EventSubject',
    filePath: path.join(testWorkspacePath, 'observers', 'EventSubject.ts'),
    lineNumber: 5,
    metadata: {
      methods: ['subscribe', 'unsubscribe', 'notify'],
    },
  });

  detector.addNode({
    id: 'event-observer',
    type: NodeType.CLASS,
    name: 'EventObserver',
    filePath: path.join(testWorkspacePath, 'observers', 'EventObserver.ts'),
    lineNumber: 15,
    metadata: {
      methods: ['update'],
    },
  });
}

/**
 * Helper: Create Strategy pattern nodes
 */
function createStrategyPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'payment-strategy-interface',
    type: NodeType.INTERFACE,
    name: 'PaymentStrategy',
    filePath: path.join(testWorkspacePath, 'strategies', 'PaymentStrategy.ts'),
    lineNumber: 3,
    metadata: {
      methods: ['execute', 'validate'],
    },
  });

  detector.addNode({
    id: 'credit-card-strategy',
    type: NodeType.CLASS,
    name: 'CreditCardStrategy',
    filePath: path.join(testWorkspacePath, 'strategies', 'CreditCardStrategy.ts'),
    lineNumber: 10,
    metadata: {
      methods: ['execute', 'validate'],
    },
  });
}

/**
 * Helper: Create Decorator pattern nodes
 */
function createDecoratorPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'logger-decorator',
    type: NodeType.CLASS,
    name: 'LoggerDecorator',
    filePath: path.join(testWorkspacePath, 'decorators', 'LoggerDecorator.ts'),
    lineNumber: 5,
    metadata: {
      methods: ['decorate', 'wrap'],
    },
  });
}

/**
 * Helper: Create Adapter pattern nodes
 */
function createAdapterPattern(testWorkspacePath: string, detector: PatternDetector): void {
  detector.addNode({
    id: 'legacy-adapter',
    type: NodeType.CLASS,
    name: 'LegacySystemAdapter',
    filePath: path.join(testWorkspacePath, 'adapters', 'LegacySystemAdapter.ts'),
    lineNumber: 8,
    metadata: {
      methods: ['adapt', 'convert', 'transform'],
    },
  });
}

suite('Pattern Identification - Architecture Patterns Tests', () => {
  let testWorkspacePath: string;
  let detector: PatternDetector;

  setup(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);
    testWorkspacePath = await createTestWorkspace('pattern-architecture-tests');
    detector = new PatternDetector();
  });

  teardown(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    detector.clear();
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Architecture Pattern Detection', () => {
    test('Should detect MVC pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createMVCPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const mvcPattern = patterns.find(p => p.type === PatternType.MVC);

      // Assertions
      assert.ok(mvcPattern, 'Should detect MVC pattern');
      assert.strictEqual(mvcPattern!.type, PatternType.MVC);
      assert.ok(mvcPattern!.confidence >= 0.3, 'Should have reasonable confidence');
      assert.ok(mvcPattern!.nodes.length >= 3, 'Should identify Controller, Model, and View');
      assert.ok(
        mvcPattern!.nodes.some(n => n.name.includes('Controller')),
        'Should include Controller'
      );
      assert.ok(
        mvcPattern!.nodes.some(n => n.name.includes('Model')),
        'Should include Model'
      );
      assert.ok(
        mvcPattern!.nodes.some(n => n.name.includes('View')),
        'Should include View'
      );

      console.log(`✓ MVC pattern detected (confidence: ${mvcPattern!.confidence.toFixed(2)})`);
      console.log(`  Nodes: ${mvcPattern!.nodes.map(n => n.name).join(', ')}`);
    });

    test('Should detect Repository pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createRepositoryPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const repoPattern = patterns.find(p => p.type === PatternType.REPOSITORY);

      // Assertions
      assert.ok(repoPattern, 'Should detect Repository pattern');
      assert.strictEqual(repoPattern!.type, PatternType.REPOSITORY);
      assert.ok(repoPattern!.confidence >= 0.3, 'Should have reasonable confidence');
      assert.ok(
        repoPattern!.nodes.some(n => n.name.includes('Repository')),
        'Should identify Repository class'
      );

      console.log(`✓ Repository pattern detected (confidence: ${repoPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Singleton pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createSingletonPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const singletonPattern = patterns.find(p => p.type === PatternType.SINGLETON);

      // Assertions
      assert.ok(singletonPattern, 'Should detect Singleton pattern');
      assert.strictEqual(singletonPattern!.type, PatternType.SINGLETON);
      assert.ok(singletonPattern!.confidence >= 0.3, 'Should have reasonable confidence');
      assert.ok(
        singletonPattern!.nodes[0].metadata?.methods?.includes('getInstance'),
        'Should have getInstance method'
      );

      console.log(`✓ Singleton pattern detected (confidence: ${singletonPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Factory pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createFactoryPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const factoryPattern = patterns.find(p => p.type === PatternType.FACTORY);

      // Assertions
      assert.ok(factoryPattern, 'Should detect Factory pattern');
      assert.strictEqual(factoryPattern!.type, PatternType.FACTORY);
      assert.ok(
        factoryPattern!.nodes.some(n => n.name.includes('Factory')),
        'Should identify Factory class'
      );

      console.log(`✓ Factory pattern detected (confidence: ${factoryPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Observer pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createObserverPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const observerPattern = patterns.find(p => p.type === PatternType.OBSERVER);

      // Assertions
      assert.ok(observerPattern, 'Should detect Observer pattern');
      assert.strictEqual(observerPattern!.type, PatternType.OBSERVER);
      assert.ok(observerPattern!.nodes.length >= 2, 'Should identify Subject and Observer');

      console.log(`✓ Observer pattern detected (confidence: ${observerPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Strategy pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createStrategyPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const strategyPattern = patterns.find(p => p.type === PatternType.STRATEGY);

      // Assertions
      assert.ok(strategyPattern, 'Should detect Strategy pattern');
      assert.strictEqual(strategyPattern!.type, PatternType.STRATEGY);
      assert.ok(
        strategyPattern!.nodes.some(n => n.name.includes('Strategy')),
        'Should identify Strategy interface or class'
      );

      console.log(`✓ Strategy pattern detected (confidence: ${strategyPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Decorator pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createDecoratorPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const decoratorPattern = patterns.find(p => p.type === PatternType.DECORATOR);

      // Assertions
      assert.ok(decoratorPattern, 'Should detect Decorator pattern');
      assert.strictEqual(decoratorPattern!.type, PatternType.DECORATOR);
      assert.ok(
        decoratorPattern!.nodes.some(n => n.name.includes('Decorator')),
        'Should identify Decorator class'
      );

      console.log(`✓ Decorator pattern detected (confidence: ${decoratorPattern!.confidence.toFixed(2)})`);
    });

    test('Should detect Adapter pattern', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      createAdapterPattern(testWorkspacePath, detector);

      const patterns = detector.detectPatterns();
      const adapterPattern = patterns.find(p => p.type === PatternType.ADAPTER);

      // Assertions
      assert.ok(adapterPattern, 'Should detect Adapter pattern');
      assert.strictEqual(adapterPattern!.type, PatternType.ADAPTER);
      assert.ok(
        adapterPattern!.nodes.some(n => n.name.includes('Adapter')),
        'Should identify Adapter class'
      );

      console.log(`✓ Adapter pattern detected (confidence: ${adapterPattern!.confidence.toFixed(2)})`);
    });
  });
});
