/**
 * VS Code Extension Test Constants
 * Centralized configuration values for extension testing
 */

/**
 * Extension identification constants
 */
export const EXTENSION_TEST_CONSTANTS = {
  /** Default extension ID */
  EXTENSION_ID: 'ollama-code.ollama-code-vscode',
  /** Default timeout for extension activation */
  ACTIVATION_TIMEOUT: 10000,
  /** Default timeout for command execution */
  COMMAND_TIMEOUT: 5000,
  /** Default polling interval for async checks */
  POLLING_INTERVAL: 100,
} as const;

/**
 * WebSocket test constants
 */
export const WEBSOCKET_TEST_CONSTANTS = {
  /** Default WebSocket connection timeout */
  CONNECTION_TIMEOUT: 5000,
  /** Default message wait timeout */
  MESSAGE_TIMEOUT: 5000,
  /** Default polling interval for message checks */
  MESSAGE_POLL_INTERVAL: 50,
  /** Default test port for mock WebSocket server */
  DEFAULT_TEST_PORT: 9876,
  /** Heartbeat test interval */
  HEARTBEAT_INTERVAL: 1000,
  /** Number of heartbeat iterations */
  HEARTBEAT_COUNT: 3,

  /** Port assignments for different test suites */
  PORTS: {
    /** Integration tests port */
    INTEGRATION_TESTS: 9876,
    /** Connection management tests port */
    CONNECTION_TESTS: 9877,
    /** Message processing tests port */
    MESSAGE_TESTS: 9878,
    /** MCP integration tests port */
    MCP_TESTS: 9879,
  },

  /** Authentication test tokens */
  AUTH: {
    /** Valid authentication token for tests */
    VALID_TOKEN: 'test-auth-token-12345',
    /** Invalid authentication token for tests */
    INVALID_TOKEN: 'invalid-token',
  },
} as const;

/**
 * MCP (Model Context Protocol) test constants
 */
export const MCP_TEST_CONSTANTS = {
  /** MCP protocol version */
  PROTOCOL_VERSION: '2024-11-05',
  /** Mock server name */
  SERVER_NAME: 'mock-mcp-server',
  /** Mock server version */
  SERVER_VERSION: '1.0.0',
  /** Default heartbeat interval for MCP server */
  DEFAULT_HEARTBEAT_INTERVAL: 30000,
} as const;

/**
 * JSON-RPC 2.0 error codes
 */
export const JSONRPC_ERROR_CODES = {
  /** Parse error - Invalid JSON */
  PARSE_ERROR: -32700,
  /** Invalid request - Not a valid JSON-RPC request */
  INVALID_REQUEST: -32600,
  /** Method not found */
  METHOD_NOT_FOUND: -32601,
  /** Invalid method parameters */
  INVALID_PARAMS: -32602,
  /** Internal JSON-RPC error */
  INTERNAL_ERROR: -32603,
  /** Server error (reserved range -32000 to -32099) */
  SERVER_ERROR: -32000,
} as const;

/**
 * Test delay constants (in milliseconds)
 */
export const TEST_DELAYS = {
  /** Short cleanup wait */
  CLEANUP: 100,
  /** Disconnection detection wait */
  DISCONNECTION: 200,
  /** Server restart wait */
  SERVER_RESTART: 100,
  /** Stability test interval */
  STABILITY_INTERVAL: 500,
  /** Message processing wait */
  MESSAGE_PROCESSING: 100,
} as const;

/**
 * Expected command IDs registered by the extension
 */
export const EXPECTED_COMMANDS = [
  'ollama-code.ask',
  'ollama-code.explain',
  'ollama-code.refactor',
  'ollama-code.review',
  'ollama-code.test',
  'ollama-code.document',
  'ollama-code.fix',
  'ollama-code.optimize',
  'ollama-code.security',
  'ollama-code.analyze',
  'ollama-code.chat',
  'ollama-code.codeAction',
  'ollama-code.inlineCompletion',
  'ollama-code.selectModel',
  'ollama-code.startServer',
  'ollama-code.stopServer',
  'ollama-code.restartServer',
  'ollama-code.showStatus',
  'ollama-code.clearCache',
  'ollama-code.openSettings',
  'ollama-code.showLogs',
  'ollama-code.showHelp',
] as const;

/**
 * Expected configuration keys
 */
export const EXPECTED_CONFIG_KEYS = [
  'serverPort',
  'autoStart',
  'modelName',
  'maxTokens',
  'temperature',
  'timeout',
  'logLevel',
  'enableTelemetry',
] as const;

/**
 * Provider test timeout constants (in milliseconds)
 * Centralized timeout values for VS Code provider tests
 */
export const PROVIDER_TEST_TIMEOUTS = {
  /** Setup/teardown timeout */
  SETUP: 10000,
  /** Standard test timeout */
  STANDARD_TEST: 5000,
  /** Timeout-specific test timeout */
  TIMEOUT_TEST: 8000,
  /** AI request test timeout */
  AI_REQUEST: 3000,
  /** Simulated slow AI response (triggers timeout) */
  SIMULATED_SLOW_AI: 10000,
  /** Simulated slow hover response (triggers timeout) */
  SIMULATED_SLOW_HOVER: 5000,
} as const;

/**
 * Git Hooks test constants
 * Centralized configuration values for Git hooks management testing
 */
export const GIT_HOOKS_TEST_CONSTANTS = {
  /** Default analysis timeout for hooks */
  DEFAULT_ANALYSIS_TIMEOUT: 30000,
  /** Maximum hook execution time for performance tests */
  MAX_HOOK_EXECUTION_TIME: 5000,
  /** Test Git repositories base directory */
  TEST_REPOS_DIR: '.test-git-repos',
  /** Test workspaces base directory */
  TEST_WORKSPACES_DIR: '.test-workspaces',
  /** Hook marker comment */
  HOOK_MARKER: '# ollama-code generated hook',
  /** Backup file extension */
  BACKUP_EXTENSION: '.backup',
  /** Test Git user email */
  TEST_GIT_EMAIL: 'test@example.com',
  /** Test Git user name */
  TEST_GIT_NAME: 'Test User',
} as const;

/**
 * Git Hooks file permission constants
 */
export const GIT_HOOKS_FILE_PERMISSIONS = {
  /** Executable permission (rwxr-xr-x) */
  EXECUTABLE: 0o755,
  /** Execute bit mask for checking executability */
  EXECUTE_BIT: 0o111,
} as const;

/**
 * Git hook types
 */
export const GIT_HOOK_TYPES = ['pre-commit', 'commit-msg', 'pre-push', 'post-merge'] as const;
export type GitHookType = (typeof GIT_HOOK_TYPES)[number];

/**
 * Commit message generation test constants
 * Centralized configuration values for commit message generation testing
 */
export const COMMIT_MESSAGE_TEST_CONSTANTS = {
  /** Default commit message max length (conventional standard) */
  DEFAULT_MAX_LENGTH: 72,
  /** Extended max length for longer messages */
  EXTENDED_MAX_LENGTH: 100,
  /** Short max length for testing constraints */
  SHORT_MAX_LENGTH: 50,
  /** Default confidence score for generated messages */
  DEFAULT_CONFIDENCE: 0.85,
  /** Default impact level for changes */
  DEFAULT_IMPACT_LEVEL: 'minor' as const,
  /** Default scope for testing */
  DEFAULT_SCOPE: 'core',
  /** Number of alternative messages to generate */
  ALTERNATIVE_MESSAGE_COUNT: 2,
  /** Default body text for mock messages */
  DEFAULT_BODY: 'Detailed description of changes',
  /** Default footer text for mock messages */
  DEFAULT_FOOTER: 'BREAKING CHANGE: API changes',
} as const;

/**
 * Commit type emoji mapping
 * Maps conventional commit types to their emoji equivalents
 */
export const COMMIT_EMOJI_MAP: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  style: '💄',
  refactor: '♻️',
  perf: '⚡️',
  test: '✅',
  build: '🏗️',
  ci: '👷',
  chore: '🔧',
  revert: '⏪',
  wip: '🚧',
} as const;

/**
 * Commit message subject templates for testing
 */
export const COMMIT_SUBJECT_TEMPLATES = {
  FEAT: 'Add new functionality',
  FIX: 'Fix critical bug',
  TEST: 'Add test coverage',
  DEFAULT: 'Update code',
} as const;

/**
 * Pull Request Review Automation Test Constants
 * Centralized configuration values for PR review automation testing
 */
export const PR_REVIEW_TEST_CONSTANTS = {
  /** Default GitHub repository URL for testing */
  DEFAULT_GITHUB_REPO: 'https://github.com/test/repo',
  /** Default GitLab repository URL for testing */
  DEFAULT_GITLAB_REPO: 'https://gitlab.com/test/repo',
  /** Default Bitbucket repository URL for testing */
  DEFAULT_BITBUCKET_REPO: 'https://bitbucket.org/test/repo',
  /** Default API token for testing */
  DEFAULT_API_TOKEN: 'test-token',
  /** Invalid API token for error testing */
  INVALID_API_TOKEN: 'invalid-token',
  /** Bot author name for automated comments */
  BOT_AUTHOR_NAME: 'ollama-code-bot',
  /** Default PR ID for testing */
  DEFAULT_PR_ID: 123,
  /** Test user name */
  TEST_USER_NAME: 'test-user',
  /** Default target branch */
  DEFAULT_TARGET_BRANCH: 'main',
  /** Mock PR title */
  MOCK_PR_TITLE: 'feat: Add new feature',
  /** Mock PR description */
  MOCK_PR_DESCRIPTION: 'This PR adds a new feature to the codebase',
  /** Mock source branch */
  MOCK_SOURCE_BRANCH: 'feat/new-feature',
  /** Mock file path */
  MOCK_FILE_PATH: 'src/feature.ts',
  /** Mock patch content */
  MOCK_PATCH: '+ new code\n- old code',
} as const;

/**
 * PR Security Scoring Constants
 * Weights and thresholds for security vulnerability scoring
 */
export const PR_SECURITY_SCORING = {
  /** Weight for critical severity vulnerabilities */
  CRITICAL_WEIGHT: 40,
  /** Weight for high severity vulnerabilities */
  HIGH_WEIGHT: 20,
  /** Weight for medium severity vulnerabilities */
  MEDIUM_WEIGHT: 10,
  /** Weight for low severity vulnerabilities */
  LOW_WEIGHT: 5,
  /** Maximum security score */
  MAX_SCORE: 100,
  /** Minimum security score */
  MIN_SCORE: 0,
} as const;

/**
 * PR Quality Metric Weights
 * Weights for calculating overall quality score
 * NOTE: All weights must sum to 1.0
 */
export const PR_QUALITY_SCORING = {
  /** Weight for maintainability metric (30%) */
  MAINTAINABILITY_WEIGHT: 0.3,
  /** Weight for test coverage metric (30%) */
  TEST_COVERAGE_WEIGHT: 0.3,
  /** Weight for documentation coverage metric (20%) */
  DOCUMENTATION_WEIGHT: 0.2,
  /** Weight for complexity metric (20%) */
  COMPLEXITY_WEIGHT: 0.2,
  /** Mock test coverage value for testing */
  MOCK_TEST_COVERAGE: 80,
  /** Mock documentation coverage value for testing */
  MOCK_DOCUMENTATION_COVERAGE: 70,
} as const;

/**
 * PR Metric Calculation Divisors
 * Constants used in metric calculations
 */
export const PR_METRIC_DIVISORS = {
  /** Divisor for calculating complexity from changes */
  COMPLEXITY_FROM_CHANGES: 5,
  /** Divisor for calculating code smells from changes */
  CODE_SMELLS_FROM_CHANGES: 20,
  /** Divisor for complexity change calculation */
  COMPLEXITY_CHANGE_DIVISOR: 10,
  /** Divisor for risk score calculation */
  RISK_SCORE_DIVISOR: 5,
  /** Multiplier for deletion ratio in risk calculation */
  DELETION_RATIO_MULTIPLIER: 100,
  /** Length for patch preview in vulnerability reports */
  PATCH_PREVIEW_LENGTH: 100,
  /** Range for random comment ID generation */
  COMMENT_ID_RANGE: 10000,
  /** Default line number for vulnerabilities */
  DEFAULT_VULNERABILITY_LINE: 10,
  /** Divisor for maintainability calculation */
  MAINTAINABILITY_DIVISOR: 2,
} as const;

/**
 * PR Approval Thresholds
 * Minimum scores required for auto-approval
 */
export const PR_APPROVAL_THRESHOLDS = {
  /** Minimum security score for auto-approval */
  MINIMUM_SECURITY_SCORE: 80,
  /** Default minimum quality score for auto-approval */
  DEFAULT_MINIMUM_QUALITY_SCORE: 70,
  /** Maximum high-severity issues before blocking */
  HIGH_SEVERITY_BLOCK_COUNT: 0,
} as const;

/**
 * PR Mock File Metadata
 * Default values for mock file changes
 */
export const PR_MOCK_FILE_METADATA = {
  /** Mock file additions count */
  MOCK_ADDITIONS: 50,
  /** Mock file deletions count */
  MOCK_DELETIONS: 10,
  /** Mock file changes count */
  MOCK_CHANGES: 60,
} as const;

/**
 * PR Security Templates
 * Template strings for security vulnerability reporting
 */
export const PR_SECURITY_TEMPLATES = {
  /** XSS vulnerability category */
  XSS_CATEGORY: 'XSS',
  /** XSS vulnerability description */
  XSS_DESCRIPTION: 'Potential XSS vulnerability detected',
  /** XSS sanitization recommendation */
  XSS_RECOMMENDATION: 'Sanitize user input before rendering',
  /** XSS CWE identifier */
  XSS_CWE_ID: 'CWE-79',
} as const;

/**
 * PR Review Recommendation Templates
 * Template strings for review recommendations
 */
export const PR_REVIEW_RECOMMENDATIONS = {
  /** Recommendation when critical security issues detected */
  CRITICAL_SECURITY_ISSUES: (count: number) =>
    `Critical security issues detected. Please address ${count} critical vulnerabilities before merging.`,
  /** Recommendation when all checks pass */
  ALL_CHECKS_PASSED: 'All checks passed. PR approved automatically.',
  /** Recommendation when high severity issues found */
  HIGH_SEVERITY_ISSUES: (highCount: number, qualityScore: number) =>
    `Please address ${highCount} high-severity issues and improve code quality (current score: ${qualityScore}/100).`,
  /** Recommendation for minor improvements */
  MINOR_IMPROVEMENTS: 'Review completed. Minor improvements suggested.',
} as const;

/**
 * Feature Implementation Workflow Test Constants
 * Centralized configuration values for autonomous feature development testing
 */
export const FEATURE_IMPLEMENTATION_CONSTANTS = {
  /** Default maximum number of phases in implementation plan */
  DEFAULT_MAX_PHASES: 4,
  /** Default team size */
  DEFAULT_TEAM_SIZE: 5,
  /** Minimum requirement text length to be considered valid */
  MIN_REQUIREMENT_LENGTH: 10,
  /** Backend effort ratio (percentage of total time) */
  BACKEND_EFFORT_RATIO: 0.4,
  /** Frontend effort ratio (percentage of total time) */
  FRONTEND_EFFORT_RATIO: 0.3,
  /** Database effort ratio (percentage of total time) */
  DATABASE_EFFORT_RATIO: 0.15,
  /** Infrastructure effort ratio (percentage of total time) */
  INFRA_EFFORT_RATIO: 0.1,
  /** QA effort ratio (percentage of total time) */
  QA_EFFORT_RATIO: 0.25,
  /** Simple feature text specification */
  SIMPLE_SPEC_TEXT: 'Add a login button to the homepage',
  /** Moderate feature text specification */
  MODERATE_SPEC_TEXT: 'Implement user authentication with email and password. Users should be able to register, login, logout, and reset their password.',
  /** Complex feature text specification */
  COMPLEX_SPEC_TEXT: 'Build a real-time collaborative document editing system with version control, conflict resolution, user presence indicators, and comment threads. Must scale to 10000 concurrent users.',
} as const;

/**
 * Feature Complexity Scoring Weights
 * Constants for calculating feature complexity scores
 */
export const FEATURE_COMPLEXITY_WEIGHTS = {
  /** Weight for component count in complexity score */
  COMPONENT_WEIGHT: 5,
  /** Weight for dependency count in complexity score */
  DEPENDENCY_WEIGHT: 8,
  /** Weight for technical challenges in complexity score */
  CHALLENGE_WEIGHT: 10,
  /** Component score multiplier in final calculation */
  COMPONENT_MULTIPLIER: 0.3,
  /** Dependency score multiplier in final calculation */
  DEPENDENCY_MULTIPLIER: 0.3,
  /** Challenge score multiplier in final calculation */
  CHALLENGE_MULTIPLIER: 0.4,
  /** Maximum complexity score */
  MAX_SCORE: 100,
  /** Threshold for simple complexity (<25) */
  SIMPLE_THRESHOLD: 25,
  /** Threshold for moderate complexity (<50) */
  MODERATE_THRESHOLD: 50,
  /** Threshold for complex complexity (<75) */
  COMPLEX_THRESHOLD: 75,
} as const;

/**
 * Feature Time Estimation Constants
 * Constants for estimating implementation time
 */
export const FEATURE_TIME_ESTIMATES = {
  /** Base hours by complexity level */
  BASE_HOURS: {
    simple: 8,
    moderate: 40,
    complex: 120,
    very_complex: 320,
  },
  /** Additional hours per requirement */
  HOURS_PER_REQUIREMENT: 4,
  /** Additional hours per technical challenge */
  HOURS_PER_CHALLENGE: 16,
  /** Hours per working day */
  HOURS_PER_DAY: 8,
  /** Minimum confidence percentage */
  MIN_CONFIDENCE: 20,
  /** Maximum confidence percentage */
  MAX_CONFIDENCE: 90,
  /** Phase distribution percentages (must sum to 1.0) */
  PHASE_DISTRIBUTION: {
    DESIGN: 0.20,        // 20% design
    IMPLEMENTATION: 0.50, // 50% implementation
    TESTING: 0.20,       // 20% testing
    REVIEW: 0.10,        // 10% review
  },
} as const;

/**
 * Feature Specification Text Matching Keywords
 * Keywords for analyzing requirement text and determining classifications
 */
export const FEATURE_SPEC_KEYWORDS = {
  /** Priority detection keywords */
  PRIORITY: {
    CRITICAL: ['critical', 'must'],
    HIGH: ['important', 'should'],
    LOW: ['nice', 'could'],
  },
  /** Category detection keywords */
  CATEGORY: {
    BUG_FIX: ['fix', 'bug'],
    ENHANCEMENT: ['improve', 'enhance'],
    REFACTORING: ['refactor'],
  },
  /** Backend requirement keywords */
  BACKEND: ['api', 'backend', 'server', 'database', 'endpoint'],
  /** Frontend requirement keywords */
  FRONTEND: ['ui', 'frontend', 'user interface', 'component', 'page'],
  /** Database requirement keywords */
  DATABASE: ['database', 'storage', 'persist', 'query', 'schema'],
  /** Infrastructure requirement keywords */
  INFRASTRUCTURE: ['deploy', 'infrastructure', 'container', 'kubernetes', 'scaling'],
  /** Technical challenge detection keywords */
  CHALLENGES: {
    REALTIME: ['real-time', 'realtime'],
    PERFORMANCE: ['scale', 'performance'],
    SECURITY: ['security', 'encryption'],
    INTEGRATION: ['integration', 'api'],
  },
  /** External dependency detection keywords */
  DEPENDENCIES: {
    PAYMENT: ['stripe', 'payment'],
    AUTH: ['auth', 'oauth'],
    EMAIL: ['email'],
  },
  /** Infrastructure type detection keywords */
  INFRASTRUCTURE_TYPES: {
    DATABASE: ['database'],
    CACHE: ['cache', 'redis'],
    QUEUE: ['queue', 'message'],
  },
  /** Acceptance criteria generation keywords */
  ACCEPTANCE_CRITERIA: {
    USER: ['user'],
    TEST: ['test'],
  },
  /** Technical constraint detection keywords */
  TECHNICAL_CONSTRAINTS: {
    PERFORMANCE: ['performance'],
    SCALE: ['scale'],
  },
} as const;

/**
 * Feature Implementation Magic Numbers
 * Numeric constants for feature implementation workflow
 */
export const FEATURE_IMPLEMENTATION_NUMBERS = {
  /** Starting requirement ID */
  INITIAL_REQ_ID: 1,
  /** Requirement ID padding width */
  REQ_ID_PADDING: 3,
  /** Task ID padding width */
  TASK_ID_PADDING: 3,
  /** Description truncation length for task names */
  TASK_NAME_MAX_LENGTH: 30,
  /** Number of design tasks */
  DESIGN_TASK_COUNT: 3,
  /** Number of testing tasks */
  TESTING_TASK_COUNT: 2,
  /** Number of review tasks */
  REVIEW_TASK_COUNT: 2,
  /** Component count multiplier per requirement */
  COMPONENT_MULTIPLIER: 1.5,
  /** Dependency count multiplier per requirement */
  DEPENDENCY_MULTIPLIER: 0.5,
  /** Complexity score confidence divisor */
  CONFIDENCE_DIVISOR: 2,
  /** Concurrent users threshold for scale constraint */
  CONCURRENT_USERS_THRESHOLD: 10000,
  /** Phase 1 number */
  PHASE_DESIGN: 1,
  /** Phase 2 number */
  PHASE_IMPLEMENTATION: 2,
  /** Phase 3 number */
  PHASE_TESTING: 3,
  /** Phase 4 number */
  PHASE_REVIEW: 4,
} as const;

/**
 * Risk Assessment Thresholds and Values
 * Constants for risk identification and scoring
 */
export const RISK_ASSESSMENT_CONSTANTS = {
  /** Threshold for technical challenge count to trigger risk */
  CHALLENGE_COUNT_THRESHOLD: 2,
  /** Threshold for dependency count to trigger risk */
  DEPENDENCY_COUNT_THRESHOLD: 3,
  /** High complexity risk configuration */
  HIGH_COMPLEXITY_RISK: {
    ID: 'RISK-001',
    DESCRIPTION: 'High complexity may lead to timeline delays',
    LEVEL: 'high' as const,
    PROBABILITY: 70,
    IMPACT: 80,
    OWNER: 'backend' as const,
  },
  /** Multiple challenges risk configuration */
  TECHNICAL_CHALLENGES_RISK: {
    ID: 'RISK-002',
    DESCRIPTION: 'Multiple technical challenges may require research and prototyping',
    LEVEL: 'medium' as const,
    PROBABILITY: 60,
    IMPACT: 70,
    OWNER: 'backend' as const,
  },
  /** Multiple dependencies risk configuration */
  DEPENDENCY_RISK: {
    ID: 'RISK-003',
    DESCRIPTION: 'Multiple dependencies may cause integration issues',
    LEVEL: 'medium' as const,
    PROBABILITY: 50,
    IMPACT: 60,
    OWNER: 'backend' as const,
  },
} as const;

/**
 * Implementation Phase Templates
 * Template data for standard implementation phases
 */
export const PHASE_TEMPLATES = {
  DESIGN: {
    NAME: 'Design & Architecture',
    DESCRIPTION: 'Design system architecture and create technical specifications',
    MILESTONE: 'Architecture Review Complete',
  },
  IMPLEMENTATION: {
    NAME: 'Implementation',
    DESCRIPTION: 'Implement features according to specifications',
    MILESTONE: 'Feature Implementation Complete',
  },
  TESTING: {
    NAME: 'Testing & QA',
    DESCRIPTION: 'Comprehensive testing and quality assurance',
    MILESTONE: 'All Tests Passing',
  },
  REVIEW: {
    NAME: 'Review & Deployment',
    DESCRIPTION: 'Code review and production deployment',
    MILESTONE: 'Production Deployment Complete',
  },
} as const;

/**
 * Task Templates for Each Phase
 * Predefined task configurations for standard phases
 */
export const TASK_TEMPLATES = {
  DESIGN: [
    {
      NAME: 'Create System Architecture',
      DESCRIPTION: 'Design overall system architecture and component interactions',
      PRIORITY: 'critical' as const,
      ROLE: 'backend' as const,
      RISK: 'medium' as const,
    },
    {
      NAME: 'Design Database Schema',
      DESCRIPTION: 'Design database schema and data models',
      PRIORITY: 'high' as const,
      ROLE: 'database' as const,
      RISK: 'low' as const,
    },
    {
      NAME: 'Create API Specifications',
      DESCRIPTION: 'Define API endpoints and contracts',
      PRIORITY: 'high' as const,
      ROLE: 'backend' as const,
      RISK: 'low' as const,
    },
  ],
  TESTING: [
    {
      NAME: 'Write Unit Tests',
      DESCRIPTION: 'Write comprehensive unit tests for all components',
      PRIORITY: 'critical' as const,
      ROLE: 'qa' as const,
      RISK: 'low' as const,
    },
    {
      NAME: 'Write Integration Tests',
      DESCRIPTION: 'Write integration tests for component interactions',
      PRIORITY: 'high' as const,
      ROLE: 'qa' as const,
      RISK: 'low' as const,
    },
  ],
  REVIEW: [
    {
      NAME: 'Code Review',
      DESCRIPTION: 'Comprehensive code review of all changes',
      PRIORITY: 'critical' as const,
      ROLE: 'backend' as const,
      RISK: 'low' as const,
    },
    {
      NAME: 'Deploy to Production',
      DESCRIPTION: 'Deploy feature to production environment',
      PRIORITY: 'critical' as const,
      ROLE: 'infrastructure' as const,
      RISK: 'medium' as const,
    },
  ],
} as const;

/**
 * Acceptance Criteria and Constraint Templates
 * Template strings for generating acceptance criteria and constraints
 */
export const SPEC_TEMPLATES = {
  /** Standard acceptance criteria templates */
  ACCEPTANCE_CRITERIA: {
    USER_SUCCESS: 'User can successfully use the feature',
    TEST_COVERAGE: 'Feature has comprehensive test coverage',
    PERFORMANCE: 'Feature meets performance requirements',
  },
  /** Technical constraint templates */
  TECHNICAL_CONSTRAINTS: {
    RESPONSE_TIME: 'Must maintain sub-second response time',
    CONCURRENT_USERS: (count: number) => `Must handle ${count}+ concurrent users`,
  },
  /** Technical challenge description templates */
  TECHNICAL_CHALLENGES: {
    REALTIME: 'Real-time data synchronization',
    PERFORMANCE: 'High-performance architecture',
    SECURITY: 'Security and encryption implementation',
    INTEGRATION: 'Third-party API integration',
  },
  /** External dependency description templates */
  EXTERNAL_DEPENDENCIES: {
    PAYMENT: 'Stripe Payment API',
    AUTH: 'OAuth Provider',
    EMAIL: 'Email Service Provider',
  },
  /** Infrastructure description templates */
  INFRASTRUCTURE: {
    DATABASE: 'PostgreSQL Database',
    CACHE: 'Redis Cache',
    QUEUE: 'Message Queue',
  },
} as const;

/**
 * Risk Mitigation Strategy Templates
 * Predefined mitigation strategies for common risks
 */
export const RISK_MITIGATION_STRATEGIES = {
  HIGH_COMPLEXITY: [
    'Break down into smaller deliverables',
    'Add buffer time to estimates',
    'Increase team size if needed',
  ],
  TECHNICAL_CHALLENGES: [
    'Allocate time for spike research',
    'Create proof-of-concept prototypes',
    'Consult with technical experts',
  ],
  MULTIPLE_DEPENDENCIES: [
    'Create integration test plan early',
    'Use feature flags for gradual rollout',
    'Maintain backward compatibility',
  ],
} as const;
