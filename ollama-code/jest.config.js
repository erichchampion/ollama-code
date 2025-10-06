/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.cjs',
    '**/tests/**/*.spec.cjs',
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js'
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '**/tests/*.test.js',
        '**/tests/unit/**/*.test.js',
        '**/tests/unit/**/*.test.ts',
        '**/tests/unit/**/*.test.cjs',
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.js'
      ],
      testEnvironment: 'node',
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'ESNext',
            moduleResolution: 'node',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true
          }
        }]
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
      ]
    },
    {
      displayName: 'integration',
      testMatch: [
        '**/tests/integration/*.test.js',
        '**/tests/integration/*.test.cjs',
        '**/tests/integration/**/*.test.js',
        '**/tests/integration/**/*.test.cjs'
      ],
      testEnvironment: 'node',
      testTimeout: 60000,
      maxWorkers: 1,
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    },
    {
      displayName: 'docs',
      testMatch: ['**/tests/docs/*.test.cjs'],
      testEnvironment: 'node'
    },
    {
      displayName: 'security',
      testMatch: ['**/tests/security/*.test.js'],
      testEnvironment: 'node',
      testTimeout: 60000,
      maxWorkers: 1,
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
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
  verbose: false,
  silent: false,
  testTimeout: 30000,
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  setupFiles: ['<rootDir>/tests/setup.js']
};
