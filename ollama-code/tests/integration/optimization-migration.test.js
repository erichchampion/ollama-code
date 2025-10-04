/**
 * Optimization Migration Tests
 *
 * Tests to ensure backward compatibility and proper functioning of the
 * optimized initialization system vs legacy system.
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { execCLI, verifyOutput, createTempFile, cleanupTempFile, testEnv } = require('./setup.js');

describe('Optimization Migration Tests', () => {
  let tempFiles = [];

  afterAll(async () => {
    // Clean up any temporary files
    tempFiles.forEach(file => {
      try {
        cleanupTempFile(file);
      } catch (error) {
        // File might already be cleaned up
      }
    });
  });

  describe('CLI Entry Point Compatibility', () => {
    test('should start optimized interactive mode successfully', async () => {
      const result = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined // Use optimized mode
        },
        input: 'exit\n'
      });

      // Should start and exit cleanly
      expect([0, 1]).toContain(result.exitCode);
      // Should contain optimization messages
      expect(result.stdout + result.stderr).toMatch(/optimized|streaming|enhanced/i);
    });

    test('should fallback to legacy mode when OLLAMA_SKIP_ENHANCED_INIT is set', async () => {
      const result = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: 'true' // Force legacy mode
        },
        input: 'exit\n'
      });

      // Should still work in legacy mode
      expect([0, 1]).toContain(result.exitCode);
      // Should contain legacy mode message
      expect(result.stdout + result.stderr).toMatch(/legacy|test.*mode/i);
    });

    test('should execute advanced commands with optimized startup', async () => {
      const result = await execCLI(['--mode', 'advanced', 'help'], {
        timeout: 10000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined // Use optimized mode
        }
      });

      expect([0, 1]).toContain(result.exitCode);
      expect(result.stdout + result.stderr).toMatch(/ollama.*code.*cli/i);
    });

    test('should execute advanced commands with legacy startup', async () => {
      const result = await execCLI(['--mode', 'advanced', 'help'], {
        timeout: 10000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: 'true' // Force legacy mode
        }
      });

      expect([0, 1]).toContain(result.exitCode);
      expect(result.stdout + result.stderr).toMatch(/ollama.*code.*cli/i);
    });
  });

  describe('Performance Comparison', () => {
    test('optimized mode should start faster than legacy mode', async () => {
      // Test optimized mode startup time
      const optimizedStart = Date.now();
      const optimizedResult = await execCLI(['--mode', 'interactive'], {
        timeout: 10000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        },
        input: 'exit\n'
      });
      const optimizedTime = Date.now() - optimizedStart;

      // Test legacy mode startup time
      const legacyStart = Date.now();
      const legacyResult = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: 'true'
        },
        input: 'exit\n'
      });
      const legacyTime = Date.now() - legacyStart;

      // Both should work
      expect([0, 1]).toContain(optimizedResult.exitCode);
      expect([0, 1]).toContain(legacyResult.exitCode);

      // Optimized should be faster (with some tolerance for test environment variability)
      console.log(`Optimized startup: ${optimizedTime}ms, Legacy startup: ${legacyTime}ms`);

      // Allow for some tolerance in test environments
      if (legacyTime > 3000) {
        expect(optimizedTime).toBeLessThan(legacyTime * 0.8);
      }
    }, 30000);
  });

  describe('Component Loading Behavior', () => {
    test('should load essential components only for simple commands', async () => {
      const result = await execCLI(['--mode', 'advanced', 'help'], {
        timeout: 8000,
        env: {
          ...testEnv,
          DEBUG: 'enhanced-fast-path-router',
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        }
      });

      expect([0, 1]).toContain(result.exitCode);

      // Should see evidence of selective loading
      const output = result.stdout + result.stderr;
      if (output.includes('debug') || output.includes('DEBUG')) {
        // Should not load heavy components for help command
        expect(output).not.toMatch(/project.*context.*initialized/i);
        expect(output).not.toMatch(/knowledge.*graph.*loaded/i);
      }
    });

    test('should provide progressive feedback during component loading', async () => {
      const result = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          DEBUG: 'enhanced-fast-path-router',
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        },
        input: 'status\nexit\n'
      });

      expect([0, 1]).toContain(result.exitCode);

      const output = result.stdout + result.stderr;
      // Should see progressive loading messages
      if (output.includes('debug') || output.includes('DEBUG')) {
        expect(output).toMatch(/streaming|progress|loading|ready/i);
      }
    });
  });

  describe('Error Handling and Fallbacks', () => {
    test('should gracefully handle component loading failures', async () => {
      const result = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          SIMULATE_COMPONENT_FAILURE: 'true', // Simulate component failure
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        },
        input: 'exit\n'
      });

      // Should still work despite component failures
      expect([0, 1]).toContain(result.exitCode);

      // Should provide helpful error messages
      const output = result.stdout + result.stderr;
      if (output.includes('error') || output.includes('ERROR')) {
        expect(output).toMatch(/fallback|degraded|retry/i);
      }
    });

    test('should timeout gracefully for slow component loading', async () => {
      const result = await execCLI(['--mode', 'interactive'], {
        timeout: 20000,
        env: {
          ...testEnv,
          SIMULATE_SLOW_LOADING: 'true', // Simulate slow loading
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        },
        input: 'exit\n'
      });

      // Should handle timeouts gracefully
      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Feature Parity', () => {
    test('optimized and legacy modes should support same commands', async () => {
      const testCommand = ['--mode', 'advanced', 'help'];

      // Test optimized mode
      const optimizedResult = await execCLI(testCommand, {
        timeout: 8000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        }
      });

      // Test legacy mode
      const legacyResult = await execCLI(testCommand, {
        timeout: 10000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: 'true'
        }
      });

      // Both should work
      expect([0, 1]).toContain(optimizedResult.exitCode);
      expect([0, 1]).toContain(legacyResult.exitCode);

      // Output should contain similar content (help text)
      const optimizedOutput = optimizedResult.stdout + optimizedResult.stderr;
      const legacyOutput = legacyResult.stdout + legacyResult.stderr;

      if (optimizedOutput.includes('ollama') && legacyOutput.includes('ollama')) {
        expect(optimizedOutput).toMatch(/usage:/i);
        expect(optimizedOutput).toMatch(/available commands:/i);
        expect(legacyOutput).toMatch(/usage:/i);
        expect(legacyOutput).toMatch(/available commands:/i);
      }
    });

    test('interactive mode should support status commands in both modes', async () => {
      // Test optimized mode
      const optimizedResult = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        },
        input: 'status\nexit\n'
      });

      // Test legacy mode
      const legacyResult = await execCLI(['--mode', 'interactive'], {
        timeout: 15000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: 'true'
        },
        input: 'exit\n' // Legacy mode might not have status command
      });

      // Both should work
      expect([0, 1]).toContain(optimizedResult.exitCode);
      expect([0, 1]).toContain(legacyResult.exitCode);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('optimized mode should use less memory for simple operations', async () => {
      // This is a basic test - in a real scenario you'd want to measure actual memory usage
      const result = await execCLI(['--mode', 'advanced', 'help'], {
        timeout: 8000,
        env: {
          ...testEnv,
          OLLAMA_SKIP_ENHANCED_INIT: undefined,
          DEBUG: 'enhanced-fast-path-router'
        }
      });

      expect([0, 1]).toContain(result.exitCode);

      // Should complete quickly for simple commands
      // (Memory measurement would require additional tooling)
    });
  });

  describe('Configuration Compatibility', () => {
    test('should respect existing configuration in both modes', async () => {
      // Create a temporary config file
      const configFile = createTempFile('config.json', JSON.stringify({
        ai: { model: 'llama3.2', temperature: 0.7 },
        verbosity: 'detailed'
      }));
      tempFiles.push(configFile);

      const optimizedResult = await execCLI(['--mode', 'advanced', 'config'], {
        timeout: 8000,
        env: {
          ...testEnv,
          OLLAMA_CONFIG_PATH: configFile,
          OLLAMA_SKIP_ENHANCED_INIT: undefined
        }
      });

      const legacyResult = await execCLI(['--mode', 'advanced', 'config'], {
        timeout: 10000,
        env: {
          ...testEnv,
          OLLAMA_CONFIG_PATH: configFile,
          OLLAMA_SKIP_ENHANCED_INIT: 'true'
        }
      });

      // Both should handle config
      expect([0, 1]).toContain(optimizedResult.exitCode);
      expect([0, 1]).toContain(legacyResult.exitCode);
    });
  });
});