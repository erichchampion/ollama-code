/**
 * create-file Command Tests
 * Comprehensive E2E tests for AI-powered file creation command
 */

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { OllamaCodeClient } from '../../client/ollamaCodeClient';
import { Logger } from '../../utils/logger';
import {
  createTestWorkspace,
  cleanupTestWorkspace,
  createTestFile
} from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';
import { createMockOllamaClient, createMockLogger } from '../helpers/providerTestHelper';

/**
 * Mock create-file command handler
 * Simulates the CLI create-file command behavior
 */
class CreateFileCommand {
  private client: OllamaCodeClient;
  private logger: Logger;

  constructor(client: OllamaCodeClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Execute create-file command
   * @param filePath - Path to create the file
   * @param description - AI description of file content to generate
   * @param options - Command options
   */
  async execute(
    filePath: string,
    description: string,
    options: {
      overwrite?: boolean;
      template?: string;
      language?: string;
    } = {}
  ): Promise<{ success: boolean; filePath: string; content?: string; error?: string }> {
    try {
      // Validate file path
      if (!filePath || filePath.trim() === '') {
        throw new Error('File path is required');
      }

      // Check for path traversal attacks
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes('..') && !normalizedPath.startsWith(process.cwd())) {
        throw new Error('Path traversal attack detected');
      }

      // Check if file already exists
      if (fs.existsSync(filePath) && !options.overwrite) {
        throw new Error(`File already exists: ${filePath}`);
      }

      // Check client connection
      const status = this.client.getConnectionStatus();
      if (!status.connected) {
        throw new Error('AI client not connected');
      }

      // Generate content using AI
      const fileExtension = path.extname(filePath);
      const language = options.language || this.detectLanguage(fileExtension);

      const aiResponse = await (this.client as any).sendAIRequest?.({
        type: 'generate',
        prompt: `Create ${language} file: ${description}`,
        context: {
          filePath,
          language,
          template: options.template
        }
      });

      const content = aiResponse?.result || this.generateFallbackContent(filePath, description, language);

      // Ensure parent directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, content, 'utf8');

      return {
        success: true,
        filePath,
        content
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message
      };
    }
  }

  private detectLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.html': 'HTML',
      '.css': 'CSS'
    };
    return languageMap[extension] || 'text';
  }

  private generateFallbackContent(filePath: string, description: string, language: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));

    if (language === 'JavaScript') {
      return `// ${description}\n\nfunction ${fileName}() {\n  // TODO: Implement ${description}\n}\n\nmodule.exports = { ${fileName} };\n`;
    } else if (language === 'TypeScript') {
      return `// ${description}\n\nexport function ${fileName}(): void {\n  // TODO: Implement ${description}\n}\n`;
    } else if (language === 'React TSX') {
      const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      return `import React from 'react';\n\ninterface ${componentName}Props {\n  // Add props here\n}\n\nexport const ${componentName}: React.FC<${componentName}Props> = (props) => {\n  return (\n    <div>\n      {/* ${description} */}\n    </div>\n  );\n};\n`;
    } else if (language === 'Python') {
      return `"""${description}"""\n\ndef ${fileName}():\n    """TODO: Implement ${description}"""\n    pass\n`;
    } else {
      return `# ${description}\n`;
    }
  }
}

suite('create-file Command Tests', () => {
  let createFileCmd: CreateFileCommand;
  let mockClient: OllamaCodeClient;
  let mockLogger: Logger;
  let testWorkspacePath: string;

  setup(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);

    // Create AI handler for file generation
    const fileGenerationHandler = async (request: any) => {
      if (request.type === 'generate') {
        const { prompt, context } = request;

        if (context.language === 'JavaScript') {
          return { result: `// Generated JavaScript file\nfunction example() {\n  console.log('Hello World');\n}\n\nmodule.exports = { example };\n` };
        } else if (context.language === 'TypeScript') {
          return { result: `// Generated TypeScript file\nexport function example(): void {\n  console.log('Hello World');\n}\n` };
        } else if (context.language === 'React TSX') {
          return { result: `import React from 'react';\n\ninterface ExampleProps {\n  title: string;\n}\n\nexport const Example: React.FC<ExampleProps> = ({ title }) => {\n  return <div>{title}</div>;\n};\n` };
        } else if (context.template === 'test') {
          return { result: `import { describe, it, expect } from '@jest/globals';\n\ndescribe('Example Test', () => {\n  it('should pass', () => {\n    expect(true).toBe(true);\n  });\n});\n` };
        } else {
          return { result: `// ${prompt}\n` };
        }
      }
      return { result: '' };
    };

    mockClient = createMockOllamaClient(true, fileGenerationHandler);
    mockLogger = createMockLogger();
    createFileCmd = new CreateFileCommand(mockClient, mockLogger);

    testWorkspacePath = await createTestWorkspace('create-file-tests');
  });

  teardown(async function() {
    this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Basic Creation', () => {
    test('Should create simple JavaScript file with AI content generation', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'example.js');
      const result = await createFileCmd.execute(filePath, 'A simple utility function');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('function'), 'Should contain function definition');
      assert.ok(content.includes('module.exports'), 'Should have module.exports');
    });

    test('Should create TypeScript file with type definitions', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'example.ts');
      const result = await createFileCmd.execute(filePath, 'A typed utility function');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('export'), 'Should have export statement');
      assert.ok(content.includes('function'), 'Should contain function definition');
      assert.ok(content.includes('void') || content.includes(':'), 'Should have type annotations');
    });

    test('Should create React component with props', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'Button.tsx');
      const result = await createFileCmd.execute(filePath, 'A reusable button component');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('React'), 'Should import React');
      assert.ok(content.includes('interface') || content.includes('type'), 'Should have prop types');
      assert.ok(content.includes('Props'), 'Should define Props interface');
      assert.ok(content.includes('FC') || content.includes('FunctionComponent'), 'Should use FC type');
    });

    test('Should create test file with boilerplate', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'example.test.ts');
      const result = await createFileCmd.execute(filePath, 'Unit tests for example module', {
        template: 'test'
      });

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('describe') || content.includes('test') || content.includes('it'), 'Should have test structure');
      assert.ok(content.includes('expect') || content.includes('assert'), 'Should have assertions');
    });

    test('Should create with explicit file path and description', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'utils', 'helper.js');
      const description = 'Helper functions for data processing';

      const result = await createFileCmd.execute(filePath, description);

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.strictEqual(result.filePath, filePath, 'Should use explicit path');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.length > 0, 'File should have content');
    });
  });

  suite('Directory Handling', () => {
    test('Should automatically create parent directory', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'src', 'utils.js');
      const result = await createFileCmd.execute(filePath, 'Utility functions');

      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(fs.existsSync(path.dirname(filePath)), 'Parent directory should be created');
      assert.ok(fs.existsSync(filePath), 'File should be created');
    });

    test('Should handle nested directory creation', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'src', 'components', 'ui', 'Button.tsx');
      const result = await createFileCmd.execute(filePath, 'UI Button component');

      assert.strictEqual(result.success, true, 'Command should succeed');

      const expectedDir = path.join(testWorkspacePath, 'src', 'components', 'ui');
      assert.ok(fs.existsSync(expectedDir), 'Nested directories should be created');
      assert.ok(fs.existsSync(filePath), 'File should be created in nested path');
    });

    test('Should handle creation in non-existent paths with error handling', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'deep', 'nested', 'path', 'file.js');
      const result = await createFileCmd.execute(filePath, 'File in deep path');

      assert.strictEqual(result.success, true, 'Command should succeed even with deep nesting');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const dirDepth = filePath.split(path.sep).length - testWorkspacePath.split(path.sep).length;
      assert.ok(dirDepth >= 4, 'Should create multiple nested directories');
    });

    test('Should prevent path traversal attacks', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const maliciousPath = path.join(testWorkspacePath, '..', '..', 'etc', 'passwd');
      const result = await createFileCmd.execute(maliciousPath, 'Malicious file');

      assert.strictEqual(result.success, false, 'Command should fail');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('traversal') || result.error!.includes('invalid'), 'Error should mention security issue');
      assert.ok(!fs.existsSync(maliciousPath), 'Malicious file should not be created');
    });

    test('Should normalize paths correctly', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'src', '.', 'utils', '..', 'helpers.js');
      const result = await createFileCmd.execute(filePath, 'Helper utilities');

      assert.strictEqual(result.success, true, 'Command should succeed with normalized path');

      // Path should be normalized to testWorkspacePath/src/helpers.js
      const expectedPath = path.join(testWorkspacePath, 'src', 'helpers.js');
      assert.ok(fs.existsSync(expectedPath), 'File should be created at normalized path');
    });
  });

  suite('Error Handling', () => {
    test('Should handle file already exists error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'existing.js');

      // Create file first
      await createFileCmd.execute(filePath, 'First file');
      assert.ok(fs.existsSync(filePath), 'File should be created initially');

      // Try to create again without overwrite
      const result = await createFileCmd.execute(filePath, 'Second file');

      assert.strictEqual(result.success, false, 'Command should fail');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('already exists'), 'Error should mention file exists');
    });

    test('Should allow overwrite with explicit flag', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const filePath = path.join(testWorkspacePath, 'overwrite.js');

      // Create file first
      await createFileCmd.execute(filePath, 'Original content');
      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Overwrite with flag
      const result = await createFileCmd.execute(filePath, 'New content', { overwrite: true });

      assert.strictEqual(result.success, true, 'Command should succeed with overwrite flag');
      const newContent = fs.readFileSync(filePath, 'utf8');
      assert.notStrictEqual(newContent, originalContent, 'Content should be different');
    });

    test('Should handle invalid file name error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Test various invalid file names
      const invalidNames = [
        '',
        '   ',
        path.join(testWorkspacePath, 'file<>.js'),  // Invalid characters on Windows
      ];

      for (const invalidPath of invalidNames) {
        const result = await createFileCmd.execute(invalidPath, 'Test file');
        assert.strictEqual(result.success, false, `Should fail for invalid path: ${invalidPath}`);
        assert.ok(result.error, 'Should return error message');
      }
    });

    test('Should handle AI generation failure with fallback', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      // Create client that fails AI requests
      const failingClient = createMockOllamaClient(true, async () => {
        throw new Error('AI service unavailable');
      });

      const failingCmd = new CreateFileCommand(failingClient, mockLogger);
      const filePath = path.join(testWorkspacePath, 'fallback.js');

      const result = await failingCmd.execute(filePath, 'Test file');

      // Should succeed using fallback content
      assert.strictEqual(result.success, true, 'Command should succeed with fallback');
      assert.ok(fs.existsSync(filePath), 'File should be created');

      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.length > 0, 'File should have fallback content');
      assert.ok(content.includes('TODO'), 'Fallback content should include TODO');
    });

    test('Should handle client disconnection error', async function() {
      this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

      const disconnectedClient = createMockOllamaClient(false);
      const disconnectedCmd = new CreateFileCommand(disconnectedClient, mockLogger);

      const filePath = path.join(testWorkspacePath, 'test.js');
      const result = await disconnectedCmd.execute(filePath, 'Test file');

      assert.strictEqual(result.success, false, 'Command should fail when client disconnected');
      assert.ok(result.error, 'Should return error message');
      assert.ok(result.error!.includes('not connected'), 'Error should mention connection issue');
      assert.ok(!fs.existsSync(filePath), 'File should not be created');
    });
  });
});
