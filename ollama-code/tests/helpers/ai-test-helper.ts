/**
 * AI Testing Helper Utilities
 * Provides utilities for testing with real AI models vs mocks
 */

/**
 * Configuration for AI testing
 */
export interface AITestConfig {
  /** Use real AI model instead of mocks */
  useRealAI: boolean;
  /** Ollama test instance host URL */
  host: string;
  /** Default model to use for tests */
  model: string;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Get AI test configuration from environment variables
 */
export function getAITestConfig(): AITestConfig {
  return {
    useRealAI: process.env.USE_REAL_AI === 'true',
    host: process.env.OLLAMA_TEST_HOST || 'http://localhost:11435',
    model: process.env.OLLAMA_TEST_MODEL || 'tinyllama',
    timeout: parseInt(process.env.OLLAMA_TEST_TIMEOUT || '30000', 10),
  };
}

/**
 * Check if Ollama test instance is available
 */
export async function isOllamaTestAvailable(
  config: AITestConfig = getAITestConfig()
): Promise<boolean> {
  try {
    const response = await fetch(`${config.host}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for Ollama test instance to be ready
 */
export async function waitForOllamaReady(
  config: AITestConfig = getAITestConfig(),
  maxWaitMs: number = 60000
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < maxWaitMs) {
    if (await isOllamaTestAvailable(config)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return false;
}

/**
 * Skip test if real AI is not available
 */
export function skipIfNoRealAI(testDescription: string = 'test'): void {
  const config = getAITestConfig();

  if (!config.useRealAI) {
    console.log(`⏭️  Skipping ${testDescription} (USE_REAL_AI=false)`);
    return;
  }
}

/**
 * Conditional test runner based on AI availability
 */
export function testWithAI(
  description: string,
  testFn: () => void | Promise<void>,
  options: { skipIfMock?: boolean; timeout?: number } = {}
): void {
  const config = getAITestConfig();

  if (options.skipIfMock && !config.useRealAI) {
    test.skip(description, testFn);
  } else {
    const timeout = options.timeout || config.timeout;
    test(description, testFn, timeout);
  }
}

/**
 * Test suite that runs only with real AI
 */
export function describeWithAI(
  description: string,
  suiteFn: () => void
): void {
  const config = getAITestConfig();

  if (config.useRealAI) {
    describe(description, suiteFn);
  } else {
    describe.skip(`${description} (requires real AI)`, suiteFn);
  }
}

/**
 * Validate AI test prerequisites
 */
export async function validateAITestPrerequisites(): Promise<{
  ready: boolean;
  issues: string[];
}> {
  const config = getAITestConfig();
  const issues: string[] = [];

  // Check if real AI testing is enabled
  if (!config.useRealAI) {
    return { ready: true, issues: [] }; // OK to use mocks
  }

  // Check if Ollama is available
  const ollamaAvailable = await isOllamaTestAvailable(config);
  if (!ollamaAvailable) {
    issues.push(
      `Ollama test instance not available at ${config.host}. ` +
      `Start with: cd tests/docker && docker-compose -f docker-compose.test.yml up -d`
    );
  }

  // Check if model is loaded
  try {
    const response = await fetch(`${config.host}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    const modelAvailable = data.models?.some(
      (m: any) => m.name.startsWith(config.model)
    );

    if (!modelAvailable) {
      issues.push(
        `Model '${config.model}' not found. ` +
        `Pull with: docker-compose -f docker-compose.test.yml exec ollama-test ollama pull ${config.model}`
      );
    }
  } catch (error) {
    issues.push(`Failed to query models: ${error}`);
  }

  return {
    ready: issues.length === 0,
    issues,
  };
}

/**
 * Setup hook for AI tests
 */
export async function setupAITests(): Promise<void> {
  const config = getAITestConfig();

  if (!config.useRealAI) {
    console.log('ℹ️  Using mock AI for tests');
    return;
  }

  console.log(`🤖 Setting up real AI tests with ${config.model} at ${config.host}`);

  const validation = await validateAITestPrerequisites();

  if (!validation.ready) {
    console.error('❌ AI test prerequisites not met:');
    validation.issues.forEach(issue => console.error(`   - ${issue}`));
    throw new Error('AI test environment not ready');
  }

  console.log('✅ AI test environment ready');
}

/**
 * Cleanup hook for AI tests
 */
export async function teardownAITests(): Promise<void> {
  const config = getAITestConfig();

  if (!config.useRealAI) {
    return;
  }

  console.log('🧹 Cleaning up AI test resources');
  // Add cleanup logic if needed (e.g., clear caches, reset state)
}
