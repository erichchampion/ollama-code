/**
 * generate-code Command Tests
 * Comprehensive E2E tests for AI-powered code generation command
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
  TEST_DATA_CONSTANTS
} from '../helpers/providerTestHelper';

/**
 * Mock generate-code command handler
 * Simulates the CLI generate-code command behavior
 */
class GenerateCodeCommand {
  private client: OllamaCodeClient;
  private logger: Logger;

  constructor(client: OllamaCodeClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Execute generate-code command
   * @param description - Natural language description of code to generate
   * @param options - Command options
   */
  async execute(
    description: string,
    options: {
      outputFile?: string;
      framework?: string;
      language?: string;
      validate?: boolean;
    } = {}
  ): Promise<{ success: boolean; code?: string; filePath?: string; error?: string }> {
    try {
      // Validate description
      if (!description || description.trim() === '') {
        throw new Error('Code description is required');
      }

      // Check client connection
      const status = this.client.getConnectionStatus();
      if (!status.connected) {
        throw new Error('AI client not connected');
      }

      // Generate code using AI
      const aiResponse = await (this.client as any).sendAIRequest?.({
        type: 'generate-code',
        prompt: description,
        context: {
          framework: options.framework,
          language: options.language
        }
      });

      const generatedCode = aiResponse?.result || this.generateFallbackCode(description, options);

      // Validate syntax if requested
      if (options.validate) {
        this.validateSyntax(generatedCode, options.language || 'javascript');
      }

      // Save to file if output path specified
      if (options.outputFile) {
        const dir = path.dirname(options.outputFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(options.outputFile, generatedCode, 'utf8');

        return {
          success: true,
          code: generatedCode,
          filePath: options.outputFile
        };
      }

      // Return to stdout
      return {
        success: true,
        code: generatedCode
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate fallback code when AI is unavailable
   */
  private generateFallbackCode(description: string, options: any): string {
    const framework = options.framework?.toLowerCase() || '';
    const language = options.language?.toLowerCase() || 'javascript';

    if (description.toLowerCase().includes('rest api') || description.toLowerCase().includes('express')) {
      return this.generateExpressAPI();
    } else if (framework.includes('react') || description.toLowerCase().includes('react component')) {
      return this.generateReactComponent(description);
    } else if (language.includes('python')) {
      return this.generatePythonClass(description);
    } else {
      return `// Generated code for: ${description}\n// TODO: Implement functionality\n`;
    }
  }

  private generateExpressAPI(): string {
    return `const express = require('express');
const router = express.Router();

/**
 * GET endpoint - Retrieve data
 */
router.get('/data', async (req, res) => {
  try {
    // TODO: Implement data retrieval
    const data = { message: 'Success' };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST endpoint - Create data
 */
router.post('/data', async (req, res) => {
  try {
    // TODO: Implement data creation
    const result = req.body;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;
  }

  private generateReactComponent(description: string): string {
    const componentName = this.extractComponentName(description);
    return `import React from 'react';

interface ${componentName}Props {
  title: string;
  onAction?: () => void;
}

/**
 * ${componentName} component
 * ${description}
 */
export const ${componentName}: React.FC<${componentName}Props> = ({ title, onAction }) => {
  const handleClick = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <div className="${componentName.toLowerCase()}">
      <h2>{title}</h2>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};
`;
  }

  private generatePythonClass(description: string): string {
    return `"""
${description}
"""

from typing import Optional, List

class DataProcessor:
    """Process and manage data operations"""

    def __init__(self, name: str):
        """
        Initialize DataProcessor

        Args:
            name: Processor name
        """
        self.name = name
        self.data: List[dict] = []

    def process(self, item: dict) -> dict:
        """
        Process a single item

        Args:
            item: Data item to process

        Returns:
            Processed item
        """
        # TODO: Implement processing logic
        return item

    def get_data(self) -> List[dict]:
        """
        Retrieve all data

        Returns:
            List of data items
        """
        return self.data
`;
  }

  private extractComponentName(description: string): string {
    // Try to extract component name from description
    const match = description.match(/(\w+)\s+component/i);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    return 'GeneratedComponent';
  }

  /**
   * Validate generated code syntax
   */
  private validateSyntax(code: string, language: string): void {
    // Basic syntax validation (in real implementation, use parsers)
    if (language === 'javascript' || language === 'typescript') {
      // Check for basic syntax issues
      if (code.includes('function') && !code.includes('(')) {
        throw new Error('Syntax error: Invalid function declaration');
      }
    } else if (language === 'python') {
      // Check for indentation issues
      if (code.includes('def ') && !code.includes(':')) {
        throw new Error('Syntax error: Missing colon in function definition');
      }
    }
  }
}

suite('generate-code Command Tests', () => {
  let generateCodeCmd: GenerateCodeCommand;
  let mockClient: OllamaCodeClient;
  let mockLogger: Logger;
  let testWorkspacePath: string;

  setup(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);

    // Create AI handler for code generation
    const codeGenHandler = async (request: any) => {
      if (request.type === 'generate-code') {
        const { prompt, context } = request;
        const lowerPrompt = prompt.toLowerCase();

        // Express API
        if (lowerPrompt.includes('rest api') || lowerPrompt.includes('express')) {
          return {
            result: `const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);`
          };
        }

        // React component
        if (context.framework?.toLowerCase() === 'react' || lowerPrompt.includes('react')) {
          return {
            result: `import React from 'react';

export const Component: React.FC = () => {
  return <div>Hello World</div>;
};`
          };
        }

        // Python
        if (context.language?.toLowerCase() === 'python' || lowerPrompt.includes('python')) {
          return {
            result: `class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b`
          };
        }

        // Vue component
        if (context.framework?.toLowerCase() === 'vue') {
          return {
            result: `<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue'
    };
  }
};
</script>`
          };
        }

        // Default
        return {
          result: `// Generated code\nfunction example() {\n  console.log('Hello');\n}\n`
        };
      }
      return { result: '' };
    };

    mockClient = createMockOllamaClient(true, codeGenHandler);
    mockLogger = createMockLogger();
    generateCodeCmd = new GenerateCodeCommand(mockClient, mockLogger);

    testWorkspacePath = await createTestWorkspace('generate-code-tests');
  });

  teardown(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Code Generation', () => {
    test('Should generate REST API endpoint with Express', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('REST API endpoint with Express');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code, 'Should return generated code');
      assertFileContains = (code: string, patterns: string | string[]) => {
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        patternArray.forEach(pattern => {
          assert.ok(code.includes(pattern), `Code should contain: ${pattern}`);
        });
      };
      assertFileContains(result.code!, ['express', 'app.get', 'app.listen']);
    });

    test('Should generate React component with TypeScript', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('Button component', { framework: 'react' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code, 'Should return generated code');
      assert.ok(result.code!.includes('React'), 'Should include React import');
      assert.ok(result.code!.includes('export'), 'Should export component');
    });

    test('Should generate Python class with type hints', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('Calculator class', { language: 'python' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code, 'Should return generated code');
      assert.ok(result.code!.includes('class'), 'Should define class');
      assert.ok(result.code!.includes('int'), 'Should include type hints');
    });

    test('Should generate with specific framework (Vue)', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('Simple component', { framework: 'vue' });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code, 'Should return generated code');
      assert.ok(result.code!.includes('<template>'), 'Should include Vue template');
      assert.ok(result.code!.includes('export default'), 'Should export Vue component');
    });

    test('Should generate and save to output file', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const outputFile = path.join(testWorkspacePath, 'generated', 'api.js');
      const result = await generateCodeCmd.execute('REST API', { outputFile });

      assertCommandSuccess(result, outputFile);
      assertFileExists(outputFile);
      assertFileContains(outputFile, 'express');
    });

    test('Should generate with stdout display (no file)', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('Simple function');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code, 'Should return code to stdout');
      assert.ok(!result.filePath, 'Should not save to file');
    });

    test('Should generate with syntax validation', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('Simple function', { validate: true });

      assert.strictEqual(result.success, true, 'Command should succeed with valid syntax');
      assert.ok(result.code, 'Should return generated code');
    });

    test('Should generate with best practices (error handling, docs)', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('REST API endpoint with Express');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.code!.includes('try'), 'Should include error handling');
      assert.ok(result.code!.includes('/**'), 'Should include JSDoc comments');
      assert.ok(result.code!.includes('catch'), 'Should have catch blocks');
    });

    test('Should handle empty description error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const result = await generateCodeCmd.execute('');

      assert.strictEqual(result.success, false, 'Command should fail');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('required'), 'Error should mention required description');
    });

    test('Should handle client disconnection error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const disconnectedClient = createMockOllamaClient(false);
      const disconnectedCmd = new GenerateCodeCommand(disconnectedClient, mockLogger);

      const result = await disconnectedCmd.execute('Simple function');

      assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('not connected'), 'Error should mention connection issue');
    });
  });
});
