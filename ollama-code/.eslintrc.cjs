module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'no-control-regex': 'warn',
    'no-useless-escape': 'warn',
    'no-constant-condition': 'warn',
    'no-case-declarations': 'warn',
    'no-inner-declarations': 'warn'
  },
  ignorePatterns: [
    'dist/**/*',
    'node_modules/**/*',
    '*.js'
  ]
};