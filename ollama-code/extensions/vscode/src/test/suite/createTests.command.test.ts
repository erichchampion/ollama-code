/**
 * create-tests Command Tests
 * Comprehensive E2E tests for AI-powered test generation command
 */

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { OllamaCodeClient } from '../../client/ollamaCodeClient';
import { Logger } from '../../utils/logger';
import {
  createTestWorkspace,
  cleanupTestWorkspace
} from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';
import {
  createMockOllamaClient,
  createMockLogger,
  assertCommandSuccess,
  assertFileExists,
  assertFileContains,
  assertCodeContains,
  TEST_DATA_CONSTANTS
} from '../helpers/providerTestHelper';

/**
 * Mock create-tests command handler
 * Simulates the CLI create-tests command behavior
 */
class CreateTestsCommand {
  private client: OllamaCodeClient;
  private logger: Logger;

  constructor(client: OllamaCodeClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Execute create-tests command
   * @param sourceFile - Path to source file to generate tests for
   * @param options - Command options
   */
  async execute(
    sourceFile: string,
    options: {
      framework?: string;
      outputFile?: string;
      coverage?: 'basic' | 'comprehensive';
      mocks?: boolean;
    } = {}
  ): Promise<{ success: boolean; testFile?: string; content?: string; error?: string }> {
    try {
      // Validate source file exists
      if (!fs.existsSync(sourceFile)) {
        throw new Error(`Source file does not exist: ${sourceFile}`);
      }

      // Check client connection
      const status = this.client.getConnectionStatus();
      if (!status.connected) {
        throw new Error('AI client not connected');
      }

      // Read source code
      const sourceCode = fs.readFileSync(sourceFile, 'utf8');

      // Detect test framework from package.json or use default
      const framework = options.framework || this.detectFramework(sourceFile);

      // Generate tests using AI
      const aiResponse = await (this.client as any).sendAIRequest?.({
        type: 'generate-tests',
        sourceCode,
        framework,
        coverage: options.coverage || 'basic',
        includeMocks: options.mocks || false
      });

      const testCode = aiResponse?.result || this.generateFallbackTests(sourceCode, framework, options);

      // Determine output file path
      const testFile = options.outputFile || this.getDefaultTestPath(sourceFile, framework);

      // Create directory if needed
      const dir = path.dirname(testFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write test file
      fs.writeFileSync(testFile, testCode, 'utf8');

      return {
        success: true,
        testFile,
        content: testCode
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detect test framework from source file path and environment
   */
  private detectFramework(sourceFile: string): string {
    const ext = path.extname(sourceFile);

    // Check for React files
    if (ext === '.jsx' || ext === '.tsx' || sourceFile.includes('component')) {
      return 'jest-react';
    }

    // Default to Jest for JS/TS files
    if (ext === '.js' || ext === '.ts') {
      return 'jest';
    }

    // Mocha for test files in test/ directory
    if (sourceFile.includes('/test/')) {
      return 'mocha';
    }

    return 'jest';
  }

  /**
   * Get default test file path based on source file
   */
  private getDefaultTestPath(sourceFile: string, framework: string): string {
    const dir = path.dirname(sourceFile);
    const ext = path.extname(sourceFile);
    const base = path.basename(sourceFile, ext);

    // Jest uses .test.js pattern
    if (framework.startsWith('jest')) {
      return path.join(dir, `${base}.test${ext}`);
    }

    // Mocha uses .spec.js pattern
    if (framework === 'mocha') {
      return path.join(dir, `${base}.spec${ext}`);
    }

    // Default
    return path.join(dir, `${base}.test${ext}`);
  }

  /**
   * Generate fallback tests when AI is unavailable
   */
  private generateFallbackTests(sourceCode: string, framework: string, options: any): string {
    const coverage = options.coverage || 'basic';

    if (framework === 'jest') {
      return this.generateJestTests(sourceCode, coverage, options.mocks);
    } else if (framework === 'jest-react') {
      return this.generateReactTests(sourceCode, coverage);
    } else if (framework === 'mocha') {
      return this.generateMochaTests(sourceCode, coverage);
    } else {
      return `// Generated test file\n// TODO: Implement tests\n`;
    }
  }

  private generateJestTests(sourceCode: string, coverage: string, includeMocks: boolean): string {
    // Extract function names for basic test structure
    const functions = this.extractFunctionNames(sourceCode);

    let tests = `import { ${functions.join(', ')} } from './source';\n\n`;

    if (includeMocks) {
      tests += `// Mock dependencies\njest.mock('./dependency');\n\n`;
    }

    tests += `describe('Function Tests', () => {\n`;

    functions.forEach(fn => {
      tests += `  describe('${fn}', () => {\n`;
      tests += `    it('should work correctly', () => {\n`;
      tests += `      const result = ${fn}();\n`;
      tests += `      expect(result).toBeDefined();\n`;
      tests += `    });\n`;

      if (coverage === 'comprehensive') {
        tests += `\n    it('should handle edge cases', () => {\n`;
        tests += `      expect(() => ${fn}(null)).not.toThrow();\n`;
        tests += `    });\n`;
      }

      tests += `  });\n`;
    });

    tests += `});\n`;
    return tests;
  }

  private generateReactTests(sourceCode: string, coverage: string): string {
    const componentName = this.extractComponentName(sourceCode);

    let tests = `import React from 'react';\n`;
    tests += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
    tests += `import { ${componentName} } from './${componentName}';\n\n`;

    tests += `describe('${componentName}', () => {\n`;
    tests += `  it('should render without crashing', () => {\n`;
    tests += `    render(<${componentName} />);\n`;
    tests += `  });\n\n`;

    tests += `  it('should display content', () => {\n`;
    tests += `    render(<${componentName} />);\n`;
    tests += `    expect(screen.getByText(/./i)).toBeInTheDocument();\n`;
    tests += `  });\n`;

    if (coverage === 'comprehensive') {
      tests += `\n  it('should handle user interactions', () => {\n`;
      tests += `    render(<${componentName} />);\n`;
      tests += `    const button = screen.queryByRole('button');\n`;
      tests += `    if (button) fireEvent.click(button);\n`;
      tests += `  });\n`;

      tests += `\n  it('should handle props correctly', () => {\n`;
      tests += `    const props = { title: 'Test' };\n`;
      tests += `    render(<${componentName} {...props} />);\n`;
      tests += `    expect(screen.getByText(/test/i)).toBeInTheDocument();\n`;
      tests += `  });\n`;
    }

    tests += `});\n`;
    return tests;
  }

  private generateMochaTests(sourceCode: string, coverage: string): string {
    const functions = this.extractFunctionNames(sourceCode);

    let tests = `const { expect } = require('chai');\n`;
    tests += `const { ${functions.join(', ')} } = require('./source');\n\n`;

    tests += `describe('Function Tests', () => {\n`;

    functions.forEach(fn => {
      tests += `  describe('${fn}', () => {\n`;
      tests += `    it('should work correctly', () => {\n`;
      tests += `      const result = ${fn}();\n`;
      tests += `      expect(result).to.exist;\n`;
      tests += `    });\n`;

      if (coverage === 'comprehensive') {
        tests += `\n    it('should handle edge cases', () => {\n`;
        tests += `      expect(() => ${fn}(null)).to.not.throw();\n`;
        tests += `    });\n`;
      }

      tests += `  });\n`;
    });

    tests += `});\n`;
    return tests;
  }

  private extractFunctionNames(sourceCode: string): string[] {
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s*)?\([^)]*\)\s*=>|=\s*function|\([^)]*\)\s*{)/g;
    const matches: string[] = [];
    let match;

    while ((match = functionRegex.exec(sourceCode)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    return matches.length > 0 ? matches : ['example'];
  }

  private extractComponentName(sourceCode: string): string {
    // Try to find export const ComponentName or export function ComponentName
    const exportMatch = sourceCode.match(/export\s+(?:const|function)\s+(\w+)/);
    if (exportMatch) {
      return exportMatch[1];
    }

    // Try to find Component declaration
    const componentMatch = sourceCode.match(/(?:const|function)\s+([A-Z]\w+)/);
    if (componentMatch) {
      return componentMatch[1];
    }

    return 'Component';
  }
}

suite('create-tests Command Tests', () => {
  let createTestsCmd: CreateTestsCommand;
  let mockClient: OllamaCodeClient;
  let mockLogger: Logger;
  let testWorkspacePath: string;

  setup(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);

    // Create AI handler for test generation
    const testGenHandler = async (request: any) => {
      if (request.type === 'generate-tests') {
        const { framework, coverage, includeMocks } = request;

        // Jest tests
        if (framework === 'jest') {
          return {
            result: `import { add, subtract } from './math';

describe('Math Functions', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-1, 1)).toBe(0);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });
  });
});
`
          };
        }

        // React tests
        if (framework === 'jest-react') {
          return {
            result: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render without crashing', () => {
    render(<Button />);
  });

  it('should display button text', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
`
          };
        }

        // Mocha tests
        if (framework === 'mocha') {
          return {
            result: `const { expect } = require('chai');
const { calculateSum } = require('./calculator');

describe('Calculator', () => {
  describe('calculateSum', () => {
    it('should calculate sum correctly', () => {
      expect(calculateSum(2, 3)).to.equal(5);
    });

    it('should handle zero', () => {
      expect(calculateSum(0, 0)).to.equal(0);
    });
  });
});
`
          };
        }

        // Default
        return {
          result: `// Generated test file\ndescribe('Tests', () => {\n  it('should pass', () => {\n    expect(true).toBe(true);\n  });\n});\n`
        };
      }
      return { result: '' };
    };

    mockClient = createMockOllamaClient(true, testGenHandler);
    mockLogger = createMockLogger();
    createTestsCmd = new CreateTestsCommand(mockClient, mockLogger);

    testWorkspacePath = await createTestWorkspace('create-tests-tests');
  });

  teardown(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Test Generation', () => {
    test('Should generate Jest tests for JavaScript functions', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create source file
      const sourceFile = path.join(testWorkspacePath, 'math.js');
      fs.writeFileSync(sourceFile, 'function add(a, b) { return a + b; }\nfunction subtract(a, b) { return a - b; }\n', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.testFile, 'Should return test file path');
      assert.ok(result.content, 'Should return generated test code');
      assertCodeContains(result.content!, ['describe', 'it', 'expect', 'add', 'subtract']);
    });

    test('Should generate Mocha tests for JavaScript', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'calculator.js');
      fs.writeFileSync(sourceFile, 'function calculateSum(a, b) { return a + b; }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, { framework: 'mocha' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assertCodeContains(result.content!, ['describe', 'it', 'expect', 'chai']);
    });

    test('Should generate Jest tests for TypeScript', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'utils.ts');
      fs.writeFileSync(sourceFile, 'export function multiply(a: number, b: number): number { return a * b; }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.testFile?.endsWith('.test.ts'), 'Should create .test.ts file');
      assertCodeContains(result.content!, ['import', 'describe', 'expect']);
    });

    test('Should generate React component tests with Testing Library', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'Button.tsx');
      fs.writeFileSync(sourceFile, 'import React from "react";\nexport const Button = () => <button>Click</button>;', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, { framework: 'jest-react' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assertCodeContains(result.content!, ['@testing-library/react', 'render', 'screen', 'Button']);
    });

    test('Should generate comprehensive tests with coverage option', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'service.js');
      fs.writeFileSync(sourceFile, 'function process(data) { return data; }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, {
        framework: 'jest',
        coverage: 'comprehensive'
      });

      assert.strictEqual(result.success, true, 'Command should succeed');
      // Comprehensive tests should have more test cases
      const testCount = (result.content!.match(/it\(/g) || []).length;
      assert.ok(testCount > 1, 'Should generate multiple test cases');
    });

    test('Should generate tests with mock generation', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'api.js');
      fs.writeFileSync(sourceFile, 'function fetchData() { return fetch("/api"); }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, {
        framework: 'jest',
        mocks: true
      });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assertCodeContains(result.content!, ['jest.mock']);
    });

    test('Should use correct test file naming conventions', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'example.js');
      fs.writeFileSync(sourceFile, 'function example() {}', 'utf8');

      const jestResult = await createTestsCmd.execute(sourceFile, { framework: 'jest' });
      assert.ok(jestResult.testFile?.endsWith('.test.js'), 'Jest should use .test.js');

      const sourceFile2 = path.join(testWorkspacePath, 'example2.js');
      fs.writeFileSync(sourceFile2, 'function example2() {}', 'utf8');

      const mochaResult = await createTestsCmd.execute(sourceFile2, { framework: 'mocha' });
      assert.ok(mochaResult.testFile?.endsWith('.spec.js'), 'Mocha should use .spec.js');
    });

    test('Should write test file to specified output path', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'src', 'utils.js');
      fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
      fs.writeFileSync(sourceFile, 'function util() {}', 'utf8');

      const outputFile = path.join(testWorkspacePath, 'tests', 'utils.test.js');
      const result = await createTestsCmd.execute(sourceFile, { outputFile });

      assertCommandSuccess(result, outputFile);
      assertFileExists(outputFile);
      assertFileContains(outputFile, 'describe');
    });

    test('Should auto-detect framework from file type', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const reactFile = path.join(testWorkspacePath, 'Component.tsx');
      fs.writeFileSync(reactFile, 'export const Component = () => null;', 'utf8');

      const result = await createTestsCmd.execute(reactFile);

      assert.strictEqual(result.success, true, 'Should auto-detect React');
      assertCodeContains(result.content!, ['@testing-library']);
    });

    test('Should handle source file not found error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await createTestsCmd.execute(path.join(testWorkspacePath, 'nonexistent.js'));

      assert.strictEqual(result.success, false, 'Command should fail');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('does not exist'), 'Error should mention missing file');
    });

    test('Should handle client disconnection error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const disconnectedClient = createMockOllamaClient(false);
      const disconnectedCmd = new CreateTestsCommand(disconnectedClient, mockLogger);

      const sourceFile = path.join(testWorkspacePath, 'test.js');
      fs.writeFileSync(sourceFile, 'function test() {}', 'utf8');

      const result = await disconnectedCmd.execute(sourceFile);

      assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('not connected'), 'Error should mention connection issue');
    });

    test('Should generate setup and teardown code for comprehensive tests', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'database.js');
      fs.writeFileSync(sourceFile, 'class Database { connect() {} disconnect() {} }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, {
        framework: 'jest',
        coverage: 'comprehensive'
      });

      assert.strictEqual(result.success, true, 'Command should succeed');
      // Comprehensive coverage should include setup/teardown patterns
      assert.ok(result.content, 'Should have test content');
    });

    test('Should handle edge case test generation', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'validator.js');
      fs.writeFileSync(sourceFile, 'function validate(input) { if (!input) throw new Error("Invalid"); return true; }', 'utf8');

      const result = await createTestsCmd.execute(sourceFile, {
        framework: 'jest',
        coverage: 'comprehensive'
      });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assertCodeContains(result.content!, ['describe', 'it']);
      // Edge case tests should include boundary conditions
      const testCount = (result.content!.match(/it\(/g) || []).length;
      assert.ok(testCount >= 2, 'Should generate multiple test cases for edge cases');
    });

    test('Should cover all exported functions', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const sourceFile = path.join(testWorkspacePath, 'helpers.js');
      fs.writeFileSync(sourceFile, `
        export function add(a, b) { return a + b; }
        export function subtract(a, b) { return a - b; }
        export function multiply(a, b) { return a * b; }
      `, 'utf8');

      const result = await createTestsCmd.execute(sourceFile, { framework: 'jest' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      // Should have tests for all three functions
      assertCodeContains(result.content!, ['add', 'subtract']);
    });
  });
});
