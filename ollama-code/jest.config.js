/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.cjs',
    '**/tests/**/*.spec.cjs'
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/*.test.js', '**/tests/unit/**/*.test.js', '**/tests/unit/**/*.test.cjs'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/*.test.js'],
      testEnvironment: 'node',
      testTimeout: 30000,
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    },
    {
      displayName: 'docs',
      testMatch: ['**/tests/docs/*.test.cjs'],
      testEnvironment: 'node'
    }
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
