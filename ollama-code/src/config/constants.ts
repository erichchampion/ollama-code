/**
 * Application-wide Constants
 *
 * Centralized configuration constants to avoid hardcoded magic numbers
 * and improve maintainability.
 */

/**
 * Request Processing Constants
 */
export const REQUEST_CONSTANTS = {
  /** Maximum length for request strings */
  MAX_REQUEST_LENGTH: 10000,

  /** Minimum length for valid requests */
  MIN_REQUEST_LENGTH: 1,

  /** Length to truncate requests in logs */
  LOG_TRUNCATE_LENGTH: 100,

  /** Maximum number of files to include in project context */
  PROJECT_CONTEXT_FILE_LIMIT: 20
} as const;

/**
 * Task Execution Constants
 */
export const EXECUTION_CONSTANTS = {
  /** Default maximum number of parallel tasks/tools */
  DEFAULT_MAX_PARALLEL_TASKS: 3,

  /** Default maximum concurrent tools (used by ToolOrchestrator) */
  DEFAULT_MAX_CONCURRENT_TOOLS: 5,

  /** Minimum parallel tasks (at least 1) */
  MIN_PARALLEL_TASKS: 1,

  /** Default task duration estimate in minutes */
  DEFAULT_TASK_DURATION: 30,

  /** Default timeout for task execution in milliseconds */
  DEFAULT_TASK_TIMEOUT: 30000,

  /** Polling interval for task completion checks in milliseconds */
  TASK_POLL_INTERVAL: 100,

  /** Average tool execution duration in milliseconds (for estimation) */
  AVG_TOOL_DURATION_MS: 5000,

  /** Cache time-to-live in milliseconds (5 minutes) */
  CACHE_TTL: 300000
} as const;

/**
 * Complexity Thresholds
 */
export const COMPLEXITY_THRESHOLDS = {
  /** Average complexity score for high complexity */
  HIGH_AVG_SCORE: 2.5,

  /** Task count threshold for high complexity */
  HIGH_TASK_COUNT: 10,

  /** Average complexity score for medium complexity */
  MEDIUM_AVG_SCORE: 1.5,

  /** Task count threshold for medium complexity */
  MEDIUM_TASK_COUNT: 5,

  /** Complexity weight scores */
  WEIGHTS: {
    high: 3,
    medium: 2,
    low: 1
  }
} as const;

/**
 * Duration Estimates by Complexity
 */
export const DURATION_ESTIMATES = {
  /** High complexity task duration in minutes */
  HIGH_COMPLEXITY: 60,

  /** Medium complexity task duration in minutes */
  MEDIUM_COMPLEXITY: 30,

  /** Low complexity task duration in minutes */
  LOW_COMPLEXITY: 15,

  /** Default test task duration in minutes */
  TEST_TASK: 20
} as const;

/**
 * AI Client Constants
 */
export const AI_CONSTANTS = {
  /** Temperature for task decomposition (lower = more deterministic) */
  DECOMPOSITION_TEMPERATURE: 0.2,

  /** Temperature for intent analysis */
  INTENT_ANALYSIS_TEMPERATURE: 0.2,

  /** Temperature for query decomposition */
  QUERY_DECOMPOSITION_TEMPERATURE: 0.3,

  /** Temperature for creative/multi-step processing */
  CREATIVE_TEMPERATURE: 0.7,

  /** Maximum tokens for AI responses */
  MAX_TOKENS: 2000,

  /** Temperature for code generation */
  CODE_GEN_TEMPERATURE: 0.3,

  /** Temperature for refactoring */
  REFACTOR_TEMPERATURE: 0.2,

  /** Temperature for analysis */
  ANALYSIS_TEMPERATURE: 0.1,

  /** Temperature for test generation */
  TEST_GEN_TEMPERATURE: 0.4,

  /** Default temperature for general operations */
  DEFAULT_TEMPERATURE: 0.5,

  /** Temperature for git commit messages and operations */
  GIT_MESSAGE_TEMPERATURE: 0.3
} as const;

/**
 * ID Generation Constants
 */
export const ID_CONSTANTS = {
  /** Length of random string in generated IDs */
  RANDOM_STRING_LENGTH: 9,

  /** Character index to start substring (skip '0.') */
  RANDOM_SUBSTRING_START: 2
} as const;

/**
 * Error Message Templates
 */
export const ERROR_MESSAGES = {
  EMPTY_REQUEST: 'Request cannot be empty',
  REQUEST_TOO_LONG: (max: number) => `Request too long (maximum ${max} characters)`,
  NO_EXECUTOR: 'No task executor configured. Call setTaskExecutor() first.',
  CIRCULAR_DEPENDENCY: 'Circular dependency detected in task plan',
  INVALID_DEPENDENCY: (taskId: string, depId: string) =>
    `Task ${taskId} depends on non-existent task ${depId}`,
  DEADLOCK_DETECTED: 'Deadlock detected: tasks remaining but none can execute'
} as const;

/**
 * Validation Constants
 */
export const VALIDATION_CONSTANTS = {
  /** Error codes */
  ERROR_CODES: {
    CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
    INVALID_DEPENDENCY: 'INVALID_DEPENDENCY',
    REQUIRES_CLARIFICATION: 'REQUIRES_CLARIFICATION',
    HIGH_COMPLEXITY: 'HIGH_COMPLEXITY',
    EMPTY_REQUEST: 'EMPTY_REQUEST',
    REQUEST_TOO_LONG: 'REQUEST_TOO_LONG',
    NO_EXECUTOR: 'NO_EXECUTOR',
    DEADLOCK: 'DEADLOCK'
  }
} as const;

/**
 * Code Analysis Constants
 */
export const ANALYSIS_CONSTANTS = {
  /** Minimum line count to consider a function "long" */
  LONG_FUNCTION_THRESHOLD: 20,

  /** Line count for critically long functions */
  CRITICAL_FUNCTION_LENGTH: 50,

  /** Minimum block size for duplicate code detection */
  MIN_DUPLICATE_BLOCK_SIZE: 3,

  /** Maximum line length before suggesting variable extraction */
  MAX_LINE_LENGTH: 80,

  /** Conditional complexity threshold */
  COMPLEX_CONDITIONAL_THRESHOLD: 3,

  /** Critical conditional complexity */
  CRITICAL_CONDITIONAL_THRESHOLD: 5
} as const;

/**
 * Retry Constants
 */
export const RETRY_CONSTANTS = {
  /** Default maximum retry attempts */
  DEFAULT_MAX_RETRIES: 3,

  /** Extended retries for critical operations */
  EXTENDED_MAX_RETRIES: 5,

  /** Base delay for exponential backoff (ms) */
  BASE_RETRY_DELAY: 1000,

  /** Maximum backoff delay (ms) */
  MAX_BACKOFF_DELAY: 30000
} as const;

/**
 * Timeout Constants
 */
export const TIMEOUT_CONSTANTS = {
  /** Short timeout (5 seconds) */
  SHORT: 5000,

  /** Medium timeout (30 seconds) */
  MEDIUM: 30000,

  /** Long timeout (2 minutes) */
  LONG: 120000,

  /** Git operation timeout (1 minute) */
  GIT_OPERATION: 60000,

  /** Test execution timeout (2 minutes) */
  TEST_EXECUTION: 120000,

  /** Cache cleanup interval (1 minute) */
  CACHE_CLEANUP: 60000
} as const;

/**
 * Delay Constants
 *
 * Standardized delay values for setTimeout, debouncing, polling, and retry delays.
 */
export const DELAY_CONSTANTS = {
  /** Brief pause for UI updates (100ms) */
  BRIEF_PAUSE: 100,

  /** Short delay for quick operations (500ms) */
  SHORT_DELAY: 500,

  /** Medium delay for standard operations (1 second) */
  MEDIUM_DELAY: 1000,

  /** Long delay for slow operations (2 seconds) */
  LONG_DELAY: 2000,

  /** Delay before restarting services (5 seconds) */
  RESTART_DELAY: 5000,

  /** Debounce delay for input handlers (500ms) */
  DEBOUNCE_DELAY: 500,

  /** Polling interval for status checks (100ms) */
  POLL_INTERVAL: 100,

  /** Cache operation timeout delay (3 seconds) */
  CACHE_TIMEOUT_DELAY: 3000
} as const;

/**
 * Threshold and Confidence Constants
 *
 * Standardized threshold values for confidence scoring, similarity matching,
 * quality assessment, and performance metrics.
 */
export const THRESHOLD_CONSTANTS = {
  /**
   * Confidence Thresholds (0.0 - 1.0)
   */
  CONFIDENCE: {
    /** Very high confidence threshold */
    VERY_HIGH: 0.9,

    /** High confidence threshold */
    HIGH: 0.8,

    /** Medium confidence threshold */
    MEDIUM: 0.7,

    /** Low confidence threshold */
    LOW: 0.6,

    /** Minimum acceptable confidence */
    MINIMUM: 0.5,

    /** Base/default confidence value */
    BASE: 0.5
  },

  /**
   * Similarity Thresholds (0.0 - 1.0)
   */
  SIMILARITY: {
    /** Very high similarity (near exact match) */
    VERY_HIGH: 0.9,

    /** High similarity (strong match) */
    HIGH: 0.85,

    /** Medium similarity (moderate match) */
    MEDIUM: 0.8,

    /** Low similarity (weak match) */
    LOW: 0.7,

    /** Minimum acceptable similarity */
    MINIMUM: 0.6
  },

  /**
   * Quality Score Thresholds (0.0 - 1.0)
   */
  QUALITY: {
    /** Excellent quality */
    EXCELLENT: 0.9,

    /** Good quality */
    GOOD: 0.8,

    /** Acceptable quality */
    ACCEPTABLE: 0.7,

    /** Below acceptable quality */
    BELOW_ACCEPTABLE: 0.6,

    /** Poor quality */
    POOR: 0.5
  },

  /**
   * Cache Performance Thresholds (0.0 - 1.0)
   */
  CACHE: {
    /** Target cache hit rate */
    TARGET_HIT_RATE: 0.7,

    /** Excellent cache hit rate */
    EXCELLENT_HIT_RATE: 0.85,

    /** Minimum acceptable hit rate */
    MIN_HIT_RATE: 0.6,

    /** Context similarity for cache matching */
    CONTEXT_SIMILARITY: 0.8,

    /** Overall cache score threshold */
    SCORE_THRESHOLD: 0.85
  },

  /**
   * Memory Pressure Thresholds (0.0 - 1.0)
   */
  MEMORY: {
    /** Critical memory usage (immediate action needed) */
    CRITICAL_USAGE: 0.9,

    /** High memory usage (warning threshold) */
    HIGH_USAGE: 0.8,

    /** Warning memory usage */
    WARNING_USAGE: 0.7,

    /** Memory pressure threshold for cache eviction */
    PRESSURE_THRESHOLD: 0.95,

    /** Minimum eviction ratio */
    MIN_EVICTION_RATIO: 0.1,

    /** Maximum eviction ratio */
    MAX_EVICTION_RATIO: 0.9
  },

  /**
   * Confidence Adjustment Weights (0.0 - 1.0)
   */
  WEIGHTS: {
    /** Major weight for primary factors */
    MAJOR: 0.4,

    /** Moderate weight for secondary factors */
    MODERATE: 0.3,

    /** Minor weight for tertiary factors */
    MINOR: 0.2,

    /** Small adjustment weight */
    SMALL: 0.1,

    /** Confidence reduction for high complexity */
    COMPLEXITY_REDUCTION: 0.9,

    /** Confidence reduction for conflicts */
    CONFLICT_REDUCTION: 0.85,

    /** Usage comparison threshold (80% of previous) */
    USAGE_COMPARISON: 0.8
  },

  /**
   * Pattern Matching Confidence Scores (0.0 - 1.0)
   */
  PATTERN_MATCH: {
    /** Exact pattern match */
    EXACT: 0.9,

    /** Partial pattern match */
    PARTIAL: 0.8,

    /** Minimum pattern match score */
    MINIMUM: 0.6
  },

  /**
   * Risk Assessment Thresholds (0.0 - 1.0)
   */
  RISK: {
    /** High risk operation confidence threshold */
    HIGH_RISK_MIN_CONFIDENCE: 0.7,

    /** Base risk confidence */
    BASE_CONFIDENCE: 0.8,

    /** Confidence reduction per unknown file */
    UNKNOWN_FILE_PENALTY: 0.2,

    /** Confidence reduction for unclear scope */
    UNCLEAR_SCOPE_PENALTY: 0.1,

    /** Confidence bonus for known risks */
    KNOWN_RISK_BONUS: 0.1
  },

  /**
   * Documentation Coverage Thresholds (0.0 - 1.0)
   */
  DOCUMENTATION: {
    /** Good documentation coverage */
    GOOD_COVERAGE: 0.7,

    /** Minimum acceptable coverage */
    MIN_COVERAGE: 0.5
  },

  /**
   * Complexity Thresholds (0.0 - 1.0)
   */
  COMPLEXITY: {
    /** Maximum acceptable complexity difference */
    MAX_DIFFERENCE: 0.5
  }
} as const;
