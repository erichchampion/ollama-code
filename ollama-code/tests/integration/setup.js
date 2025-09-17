/**
 * Integration Test Setup
 *
 * Provides utilities for testing CLI commands without requiring actual Ollama server
 * or external dependencies.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const __dirname = path.dirname(__filename);

// Path to the built CLI
const CLI_PATH = path.join(__dirname, '../../dist/src/cli-selector.js');

/**
 * Mock Ollama server responses
 */
const mockOllamaServer = {
  start() {
    // Mock server endpoints that return test data
    // This would ideally use a test server or mocking library
    return {
      port: 11434,
      baseUrl: 'http://localhost:11434',
      stop: () => {}
    };
  }
};

/**
 * Execute a CLI command and capture output
 * @param {string[]} args - Command arguments
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Result with stdout, stderr, exitCode
 */
async function execCLI(args = [], options = {}) {
  const {
    timeout = 10000,
    input = null,
    env = {},
    expectError = false
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        OLLAMA_API_URL: 'http://localhost:11434',
        OLLAMA_TELEMETRY: '0', // Disable telemetry in tests
        ...env
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send input if provided
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (exitCode) => {
      clearTimeout(timeoutId);

      const result = {
        stdout,
        stderr,
        exitCode,
        success: exitCode === 0
      };

      if (!expectError && exitCode !== 0) {
        reject(new Error(`Command failed with exit code ${exitCode}. stderr: ${stderr}`));
      } else {
        resolve(result);
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Create a temporary test file
 * @param {string} content - File content
 * @param {string} extension - File extension (default: .js)
 * @returns {string} Path to temporary file
 */
function createTempFile(content, extension = '.js') {
  const fs = require('fs');
  const os = require('os');
  const tempPath = path.join(os.tmpdir(), `ollama-test-${Date.now()}${extension}`);
  fs.writeFileSync(tempPath, content);
  return tempPath;
}

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 */
function cleanupTempFile(filePath) {
  const fs = require('fs');
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Test helper to verify command output contains expected patterns
 * @param {string} output - Command output to check
 * @param {string[]} expectedPatterns - Patterns that should be present
 * @param {string[]} unexpectedPatterns - Patterns that should NOT be present
 */
function verifyOutput(output, expectedPatterns = [], unexpectedPatterns = []) {
  const errors = [];

  expectedPatterns.forEach(pattern => {
    if (!output.includes(pattern)) {
      errors.push(`Expected output to contain: "${pattern}"`);
    }
  });

  unexpectedPatterns.forEach(pattern => {
    if (output.includes(pattern)) {
      errors.push(`Expected output to NOT contain: "${pattern}"`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Output verification failed:\n${errors.join('\n')}\n\nActual output:\n${output}`);
  }
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock environment for testing commands that require external dependencies
 */
const testEnv = {
  OLLAMA_API_URL: 'http://localhost:11434',
  OLLAMA_TELEMETRY: '0',
  NODE_ENV: 'test',
  CI: 'true'
};

// Export all functions and constants
module.exports = {
  CLI_PATH,
  mockOllamaServer,
  execCLI,
  createTempFile,
  cleanupTempFile,
  verifyOutput,
  wait,
  testEnv
};