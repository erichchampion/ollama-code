/**
 * Provider Test Helper Utilities
 * Shared mocks, fixtures, and utilities for VS Code provider testing
 */

import { OllamaCodeClient } from '../../client/ollamaCodeClient';
import { Logger } from '../../utils/logger';

/**
 * AI Response Fixtures for Testing
 * Centralized test data to eliminate duplication across provider tests
 */
export const AI_RESPONSE_FIXTURES = {
  completion: {
    assignment: 'calculateSum(a, b);',
    functionBody: 'return a + b;',
    methodAccess: 'getName()',
    import: "{ useState, useEffect } from 'react';",
    ifStatement: 'x > 0) {\n  console.log(x);\n}',
    forLoop: 'let i = 0; i < arr.length; i++) {\n  process(arr[i]);\n}',
    default: '// AI completion'
  },
  explanation: {
    calculateSum: 'Adds two numbers together and returns the result. Takes parameters `a` and `b` (numbers) and returns their sum.',
    userService: 'A service class that manages user-related operations. Provides methods for user CRUD operations and authentication.',
    apiUrl: 'Configuration constant that stores the base URL for the API endpoint.',
    getName: "Returns the user's full name as a formatted string.",
    asyncFunction: 'Asynchronous function that fetches data from a remote source. Returns a Promise that resolves with the data.',
    default: 'Documentation for element: This is a code element.'
  },
  diagnostic: {
    analysis: 'LINE 3: [WARNING] Potential null pointer exception\nLINE 5: [INFO] Consider using const instead of let'
  }
} as const;

/**
 * Create a mock Ollama client for testing
 * @param connected - Whether the client should report as connected
 * @param aiRequestHandler - Optional custom AI request handler
 * @returns Mock OllamaCodeClient instance
 */
export function createMockOllamaClient(
  connected: boolean = true,
  aiRequestHandler?: (request: any) => Promise<any>
): OllamaCodeClient {
  const client: any = {
    getConnectionStatus: () => ({
      connected,
      model: connected ? 'test-model' : null
    })
  };

  if (aiRequestHandler) {
    client.sendAIRequest = aiRequestHandler;
  }

  return client as OllamaCodeClient;
}

/**
 * Create a standard AI request handler for inline completion testing
 * @returns AI request handler function
 */
export function createCompletionAIHandler() {
  return async (request: any) => {
    if (request.type === 'completion') {
      const prompt = request.prompt.toLowerCase();

      if (prompt.includes('const result =')) {
        return { result: AI_RESPONSE_FIXTURES.completion.assignment };
      } else if (prompt.includes('function add')) {
        return { result: AI_RESPONSE_FIXTURES.completion.functionBody };
      } else if (prompt.includes('user.')) {
        return { result: AI_RESPONSE_FIXTURES.completion.methodAccess };
      } else if (prompt.includes('import')) {
        return { result: AI_RESPONSE_FIXTURES.completion.import };
      } else if (prompt.includes('if (')) {
        return { result: AI_RESPONSE_FIXTURES.completion.ifStatement };
      } else if (prompt.includes('for (')) {
        return { result: AI_RESPONSE_FIXTURES.completion.forLoop };
      } else {
        return { result: AI_RESPONSE_FIXTURES.completion.default };
      }
    }
    return { result: '' };
  };
}

/**
 * Create a standard AI request handler for hover provider testing
 * @returns AI request handler function
 */
export function createHoverAIHandler() {
  return async (request: any) => {
    if (request.type === 'explanation') {
      const prompt = request.prompt.toLowerCase();

      if (prompt.includes('calculatesum')) {
        return { result: AI_RESPONSE_FIXTURES.explanation.calculateSum };
      } else if (prompt.includes('userservice')) {
        return { result: AI_RESPONSE_FIXTURES.explanation.userService };
      } else if (prompt.includes('api_url')) {
        return { result: AI_RESPONSE_FIXTURES.explanation.apiUrl };
      } else if (prompt.includes('getname')) {
        return { result: AI_RESPONSE_FIXTURES.explanation.getName };
      } else if (prompt.includes('async')) {
        return { result: AI_RESPONSE_FIXTURES.explanation.asyncFunction };
      } else {
        const elementName = request.prompt.split('"')[1] || 'element';
        return { result: `${AI_RESPONSE_FIXTURES.explanation.default.replace('element', elementName)}` };
      }
    }
    return { result: '' };
  };
}

/**
 * Create a standard AI request handler for diagnostic provider testing
 * @returns AI request handler function
 */
export function createDiagnosticAIHandler() {
  return async (request: any) => {
    if (request.type === 'completion' && request.prompt.includes('Analyze')) {
      return { result: AI_RESPONSE_FIXTURES.diagnostic.analysis };
    }
    return { result: '' };
  };
}

/**
 * Create a mock logger for testing
 * @returns Mock Logger instance
 */
export function createMockLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    log: () => {},
    show: () => {},
    setLevel: () => {},
    outputChannel: null,
    logLevel: 'info'
  } as any as Logger;
}

/**
 * Test Data Constants
 * Magic numbers used in tests, centralized for maintainability
 */
export const TEST_DATA_CONSTANTS = {
  /** Number of functions to create for stress testing */
  STRESS_TEST_FUNCTION_COUNT: 20,

  /** Number of lines to create for long function tests (> LONG_FUNCTION_LINES threshold) */
  LONG_FUNCTION_LINE_COUNT: 35,

  /** Number of rapid messages to send for concurrency testing */
  RAPID_MESSAGE_COUNT: 50,

  /** Message count for concurrent processing tests */
  CONCURRENT_MESSAGE_COUNT: 10
} as const;
