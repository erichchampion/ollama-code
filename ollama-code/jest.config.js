/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.cjs',
    '**/tests/**/*.spec.cjs'
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/*.test.js'],
      testEnvironment: 'node'
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/*.test.js'],
      testEnvironment: 'node',
      testTimeout: 30000
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
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
