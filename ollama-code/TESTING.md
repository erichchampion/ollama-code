# Testing Documentation

This document provides comprehensive information about the testing strategy, types of tests, and test execution for the Ollama Code CLI application.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Testing Strategy](#testing-strategy)
- [Types of Tests](#types-of-tests)
- [Test Framework](#test-framework)
- [Test Execution](#test-execution)
- [Test Coverage](#test-coverage)
- [Mocking and Stubbing](#mocking-and-stubbing)
- [Performance Testing](#performance-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Automation](#test-automation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Overview

The Ollama Code CLI implements a comprehensive testing strategy to ensure reliability, performance, and maintainability. The testing approach follows industry best practices and includes multiple levels of testing to catch issues early and often.

### Testing Philosophy

1. **Test-Driven Development**: Write tests before implementing features
2. **Comprehensive Coverage**: Test all critical paths and edge cases
3. **Automated Testing**: All tests should be automated and runnable
4. **Fast Feedback**: Tests should provide quick feedback on code quality
5. **Maintainable Tests**: Tests should be easy to understand and maintain

### Testing Goals

- **Reliability**: Ensure the application works consistently
- **Performance**: Verify performance requirements are met
- **Security**: Validate security measures and data handling
- **Usability**: Test user experience and interface functionality
- **Compatibility**: Ensure cross-platform compatibility

## Testing Strategy

### Test Pyramid

The testing strategy follows the test pyramid model:

```
    /\
   /  \
  / E2E \     (Few, Slow, Expensive)
 /______\
/        \
/Integration\  (Some, Medium, Moderate)
/____________\
/              \
/    Unit Tests   \  (Many, Fast, Cheap)
/__________________\
```

#### Unit Tests (70%)
- **Purpose**: Test individual functions and modules
- **Speed**: Fast (< 100ms per test)
- **Scope**: Single function or class
- **Dependencies**: Mocked or stubbed

#### Integration Tests (20%)
- **Purpose**: Test module interactions
- **Speed**: Medium (100ms - 1s per test)
- **Scope**: Multiple modules working together
- **Dependencies**: Real or partially mocked

#### End-to-End Tests (10%)
- **Purpose**: Test complete user workflows
- **Speed**: Slow (> 1s per test)
- **Scope**: Entire application
- **Dependencies**: Real services and data

### Test Categories

#### Functional Tests
- **Unit Tests**: Individual function testing
- **Integration Tests**: Module interaction testing
- **System Tests**: Complete system testing
- **Acceptance Tests**: User requirement validation

#### Non-Functional Tests
- **Performance Tests**: Speed and resource usage
- **Load Tests**: Behavior under load
- **Stress Tests**: Behavior under extreme conditions
- **Security Tests**: Security vulnerability testing
- **Usability Tests**: User experience testing

## Types of Tests

### Unit Tests

Unit tests verify individual functions and modules in isolation.

#### Example Unit Test
```typescript
// tests/unit/ai/ollama-client.test.ts
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { OllamaClient } from '../../src/ai/ollama-client.js';

describe('OllamaClient', () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = new OllamaClient();
  });

  describe('generateCompletion', () => {
    test('should generate completion for valid input', async () => {
      const result = await client.generateCompletion('Hello world');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should throw error for empty input', async () => {
      await expect(client.generateCompletion('')).rejects.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error
      jest.spyOn(client, 'makeRequest').mockRejectedValue(new Error('Network error'));
      
      await expect(client.generateCompletion('test')).rejects.toThrow('Network error');
    });
  });
});
```

#### Unit Test Best Practices
- **Isolation**: Each test should be independent
- **Single Responsibility**: Test one thing at a time
- **Clear Naming**: Use descriptive test names
- **Arrange-Act-Assert**: Structure tests clearly
- **Mock Dependencies**: Mock external dependencies

### Integration Tests

Integration tests verify that multiple modules work together correctly.

#### Example Integration Test
```typescript
// tests/integration/commands.test.ts
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { CommandRegistry } from '../../src/commands/index.js';
import { initAI } from '../../src/ai/index.js';
import { initAuth } from '../../src/auth/index.js';

describe('Command Integration', () => {
  let registry: CommandRegistry;

  beforeAll(async () => {
    await initAI();
    await initAuth();
    registry = new CommandRegistry();
  });

  afterAll(async () => {
    // Cleanup
  });

  test('should execute ask command successfully', async () => {
    const result = await registry.execute('ask', ['What is TypeScript?']);
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
  });

  test('should handle command errors gracefully', async () => {
    const result = await registry.execute('invalid-command', []);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

#### Integration Test Best Practices
- **Real Dependencies**: Use real dependencies when possible
- **Test Data**: Use consistent test data
- **Cleanup**: Clean up after tests
- **Error Scenarios**: Test error conditions
- **Performance**: Monitor test performance

### End-to-End Tests

End-to-end tests verify complete user workflows.

#### Example E2E Test
```typescript
// tests/e2e/user-workflow.test.ts
import { describe, test, expect } from '@jest/globals';
import { spawn } from 'child_process';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

describe('User Workflow E2E', () => {
  test('should complete full ask workflow', async () => {
    const { stdout, stderr } = await exec('ollama-code ask "What is JavaScript?"');
    
    expect(stderr).toBe('');
    expect(stdout).toContain('JavaScript');
    expect(stdout.length).toBeGreaterThan(0);
  });

  test('should handle file operations', async () => {
    const { stdout } = await exec('ollama-code explain package.json');
    
    expect(stdout).toContain('package.json');
    expect(stdout.length).toBeGreaterThan(0);
  });
});
```

#### E2E Test Best Practices
- **Real Environment**: Use production-like environment
- **User Scenarios**: Test actual user workflows
- **Data Setup**: Prepare realistic test data
- **Cleanup**: Clean up test data
- **Monitoring**: Monitor test execution

### Performance Tests

Performance tests verify that the application meets performance requirements.

#### Example Performance Test
```typescript
// tests/performance/response-time.test.ts
import { describe, test, expect } from '@jest/globals';
import { performance } from 'perf_hooks';
import { OllamaClient } from '../../src/ai/ollama-client.js';

describe('Performance Tests', () => {
  test('should respond within time limit', async () => {
    const client = new OllamaClient();
    const start = performance.now();
    
    await client.generateCompletion('Test query');
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(2000); // < 2 seconds
  });

  test('should handle concurrent requests', async () => {
    const client = new OllamaClient();
    const requests = Array(10).fill(null).map(() => 
      client.generateCompletion('Test query')
    );
    
    const start = performance.now();
    await Promise.all(requests);
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(5000); // < 5 seconds
  });
});
```

### Security Tests

Security tests verify that the application handles security concerns properly.

#### Example Security Test
```typescript
// tests/security/input-validation.test.ts
import { describe, test, expect } from '@jest/globals';
import { validateInput } from '../../src/utils/validation.js';

describe('Security Tests', () => {
  test('should sanitize malicious input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = validateInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should prevent path traversal', () => {
    const maliciousPath = '../../../etc/passwd';
    const result = validateInput(maliciousPath);
    
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });
});
```

## Test Framework

### Jest Configuration

The project uses Jest as the primary testing framework.

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
```

#### Test Setup
```typescript
// tests/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

beforeAll(async () => {
  // Global setup
  console.log('Setting up test environment');
});

afterAll(async () => {
  // Global cleanup
  console.log('Cleaning up test environment');
});

beforeEach(() => {
  // Test setup
});

afterEach(() => {
  // Test cleanup
});
```

### Test Utilities

#### Test Helpers
```typescript
// tests/utils/test-helpers.ts
export function createMockOllamaClient() {
  return {
    generateCompletion: jest.fn(),
    listModels: jest.fn(),
    pullModel: jest.fn()
  };
}

export function createMockFileSystem() {
  return {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    exists: jest.fn()
  };
}

export function createTestConfig() {
  return {
    ollama: {
      serverUrl: 'http://localhost:11434',
      model: 'llama2'
    },
    logging: {
      level: 'error'
    }
  };
}
```

#### Test Data
```typescript
// tests/data/test-data.ts
export const testFiles = {
  'package.json': JSON.stringify({
    name: 'test-project',
    version: '1.0.0',
    dependencies: {
      'express': '^4.18.0'
    }
  }),
  'index.js': 'console.log("Hello, World!");',
  'README.md': '# Test Project\n\nThis is a test project.'
};

export const testQueries = [
  'What is JavaScript?',
  'How do I implement authentication?',
  'Explain this code: console.log("test");'
];
```

## Test Execution

### Running Tests

#### All Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### Specific Test Types
```bash
# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e

# Run performance tests only
npm run test:performance
```

#### Specific Test Files
```bash
# Run specific test file
npm test -- tests/unit/ai/ollama-client.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="generateCompletion"

# Run tests in specific directory
npm test -- tests/unit/
```

### Test Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:performance": "jest tests/performance",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### Continuous Integration

#### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Coverage

### Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: > 95%
- **New Code**: > 90%
- **Bug-prone Areas**: > 95%

### Coverage Reports

#### HTML Report
```bash
# Generate HTML coverage report
npm run test:coverage
open coverage/index.html
```

#### LCOV Report
```bash
# Generate LCOV report for CI
npm run test:coverage -- --coverageReporters=lcov
```

### Coverage Configuration

#### Jest Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Mocking and Stubbing

### Jest Mocking

#### Function Mocking
```typescript
// Mock a function
jest.mock('../../src/ai/ollama-client.js', () => ({
  OllamaClient: jest.fn().mockImplementation(() => ({
    generateCompletion: jest.fn().mockResolvedValue('Mocked response')
  }))
}));
```

#### Module Mocking
```typescript
// Mock an entire module
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('Mocked file content'),
  writeFile: jest.fn().mockResolvedValue(undefined)
}));
```

#### Partial Mocking
```typescript
// Mock specific functions
jest.mock('../../src/utils/logger.js', () => ({
  ...jest.requireActual('../../src/utils/logger.js'),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));
```

### Mock Data

#### Test Fixtures
```typescript
// tests/fixtures/ollama-responses.ts
export const mockOllamaResponses = {
  'What is JavaScript?': 'JavaScript is a programming language...',
  'How do I implement authentication?': 'Authentication can be implemented...',
  'Explain this code: console.log("test");': 'This code logs the string "test" to the console...'
};
```

#### Mock Services
```typescript
// tests/mocks/ollama-service.ts
export class MockOllamaService {
  async generateCompletion(prompt: string): Promise<string> {
    return mockOllamaResponses[prompt] || 'Default response';
  }

  async listModels(): Promise<any[]> {
    return [
      { name: 'llama2', size: 1000000000 },
      { name: 'codellama', size: 2000000000 }
    ];
  }
}
```

## Performance Testing

### Load Testing

#### Load Test Example
```typescript
// tests/performance/load.test.ts
import { describe, test, expect } from '@jest/globals';
import { OllamaClient } from '../../src/ai/ollama-client.js';

describe('Load Tests', () => {
  test('should handle 100 concurrent requests', async () => {
    const client = new OllamaClient();
    const requests = Array(100).fill(null).map(() => 
      client.generateCompletion('Test query')
    );
    
    const start = Date.now();
    const results = await Promise.all(requests);
    const duration = Date.now() - start;
    
    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(30000); // < 30 seconds
  });
});
```

### Stress Testing

#### Stress Test Example
```typescript
// tests/performance/stress.test.ts
describe('Stress Tests', () => {
  test('should handle memory pressure', async () => {
    const client = new OllamaClient();
    const largePrompts = Array(1000).fill('Large prompt text...');
    
    const results = await Promise.all(
      largePrompts.map(prompt => client.generateCompletion(prompt))
    );
    
    expect(results).toHaveLength(1000);
    // Check memory usage
    const memUsage = process.memoryUsage();
    expect(memUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // < 500MB
  });
});
```

## Integration Testing

### API Integration

#### API Test Example
```typescript
// tests/integration/api.test.ts
import { describe, test, expect } from '@jest/globals';
import { createServer } from 'http';
import { OllamaCodeAPI } from '../../src/api/server.js';

describe('API Integration', () => {
  let server: any;
  let api: OllamaCodeAPI;

  beforeAll(async () => {
    api = new OllamaCodeAPI();
    server = createServer(api.app);
    await new Promise(resolve => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  test('should handle POST /api/ask', async () => {
    const response = await fetch(`http://localhost:${server.address().port}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is TypeScript?' })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
  });
});
```

### Database Integration

#### Database Test Example
```typescript
// tests/integration/database.test.ts
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Database } from '../../src/database/index.js';

describe('Database Integration', () => {
  let db: Database;

  beforeAll(async () => {
    db = new Database(':memory:'); // In-memory database for testing
    await db.initialize();
  });

  afterAll(async () => {
    await db.close();
  });

  test('should store and retrieve data', async () => {
    const data = { id: 1, name: 'Test' };
    await db.insert('test_table', data);
    
    const result = await db.select('test_table', { id: 1 });
    expect(result).toEqual(data);
  });
});
```

## End-to-End Testing

### User Workflow Tests

#### E2E Test Example
```typescript
// tests/e2e/user-workflow.test.ts
import { describe, test, expect } from '@jest/globals';
import { spawn } from 'child_process';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

describe('User Workflow E2E', () => {
  test('should complete ask workflow', async () => {
    const { stdout, stderr } = await exec('ollama-code ask "What is Node.js?"');
    
    expect(stderr).toBe('');
    expect(stdout).toContain('Node.js');
    expect(stdout.length).toBeGreaterThan(0);
  });

  test('should complete explain workflow', async () => {
    const { stdout } = await exec('ollama-code explain package.json');
    
    expect(stdout).toContain('package.json');
    expect(stdout.length).toBeGreaterThan(0);
  });

  test('should complete generate workflow', async () => {
    const { stdout } = await exec('ollama-code generate "a simple HTTP server"');
    
    expect(stdout).toContain('http');
    expect(stdout.length).toBeGreaterThan(0);
  });
});
```

### Cross-Platform Testing

#### Platform Test Example
```typescript
// tests/e2e/cross-platform.test.ts
import { describe, test, expect } from '@jest/globals';
import { platform } from 'os';

describe('Cross-Platform E2E', () => {
  test('should work on different platforms', async () => {
    const currentPlatform = platform();
    console.log(`Testing on platform: ${currentPlatform}`);
    
    const { stdout } = await exec('ollama-code --version');
    expect(stdout).toContain('ollama-code');
  });
});
```

## Test Automation

### Pre-commit Hooks

#### Husky Configuration
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test:ci"
    }
  }
}
```

#### Pre-commit Script
```bash
#!/bin/bash
# .husky/pre-commit
npm run test:unit
npm run lint
npm run type-check
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Test Reporting

#### Test Results
```bash
# Generate test report
npm run test:ci -- --reporters=json --outputFile=test-results.json
```

#### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage -- --coverageReporters=html,lcov
```

## Best Practices

### Test Organization

#### File Structure
```
tests/
├── unit/           # Unit tests
│   ├── ai/         # AI module tests
│   ├── auth/       # Auth module tests
│   └── utils/      # Utils module tests
├── integration/    # Integration tests
│   ├── api/        # API integration tests
│   └── database/   # Database integration tests
├── e2e/           # End-to-end tests
│   ├── workflows/  # User workflow tests
│   └── cross-platform/ # Cross-platform tests
├── performance/    # Performance tests
│   ├── load/       # Load tests
│   └── stress/     # Stress tests
├── security/       # Security tests
├── fixtures/       # Test data
├── mocks/          # Mock implementations
└── utils/          # Test utilities
```

#### Naming Conventions
- **Test Files**: `*.test.ts` or `*.spec.ts`
- **Test Descriptions**: Clear, descriptive names
- **Test Groups**: Use `describe` blocks for organization
- **Test Cases**: Use `test` or `it` for individual tests

### Test Data Management

#### Test Fixtures
```typescript
// tests/fixtures/test-data.ts
export const testData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  files: {
    'package.json': JSON.stringify({ name: 'test-project' }),
    'index.js': 'console.log("Hello, World!");'
  }
};
```

#### Test Database
```typescript
// tests/database/test-db.ts
export class TestDatabase {
  private data: Map<string, any[]> = new Map();

  async insert(table: string, record: any): Promise<void> {
    if (!this.data.has(table)) {
      this.data.set(table, []);
    }
    this.data.get(table)!.push(record);
  }

  async select(table: string, where: any): Promise<any[]> {
    const records = this.data.get(table) || [];
    return records.filter(record => 
      Object.keys(where).every(key => record[key] === where[key])
    );
  }
}
```

### Error Handling in Tests

#### Error Testing
```typescript
// Test error conditions
test('should handle network errors', async () => {
  jest.spyOn(client, 'makeRequest').mockRejectedValue(new Error('Network error'));
  
  await expect(client.generateCompletion('test')).rejects.toThrow('Network error');
});

// Test error recovery
test('should retry on failure', async () => {
  const mockRequest = jest.spyOn(client, 'makeRequest');
  mockRequest
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce('Success');
  
  const result = await client.generateCompletionWithRetry('test');
  expect(result).toBe('Success');
  expect(mockRequest).toHaveBeenCalledTimes(2);
});
```

### Performance Testing

#### Performance Benchmarks
```typescript
// tests/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  test('should meet response time requirements', async () => {
    const start = performance.now();
    await client.generateCompletion('Test query');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(2000); // < 2 seconds
  });
});
```

## Troubleshooting

### Common Test Issues

#### Test Failures
**Problem**: Tests failing unexpectedly
**Solution**: Check test data, mocks, and environment setup

#### Slow Tests
**Problem**: Tests running too slowly
**Solution**: Optimize test setup, use mocks, parallelize tests

#### Flaky Tests
**Problem**: Tests passing/failing inconsistently
**Solution**: Fix timing issues, improve test isolation

#### Memory Leaks
**Problem**: Tests causing memory leaks
**Solution**: Proper cleanup, avoid global state

### Debug Mode

#### Enable Debug Logging
```bash
# Enable debug mode for tests
DEBUG=ollama-code:* npm test

# Enable specific debug categories
DEBUG=ollama-code:ai,ollama-code:auth npm test
```

#### Test Debugging
```typescript
// Add debug logging to tests
test('should debug test execution', async () => {
  console.log('Starting test...');
  const result = await client.generateCompletion('test');
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

### Test Maintenance

#### Regular Updates
- **Update Dependencies**: Keep test dependencies current
- **Review Tests**: Regularly review and update tests
- **Remove Dead Tests**: Remove obsolete tests
- **Optimize Performance**: Improve test execution speed

#### Test Documentation
- **Test Descriptions**: Clear, descriptive test names
- **Comments**: Explain complex test logic
- **README**: Document test setup and execution
- **Examples**: Provide test examples for new contributors

This testing documentation provides comprehensive guidance for implementing and maintaining a robust testing strategy for the Ollama Code CLI. Regular testing and continuous improvement are essential for maintaining code quality and reliability.
