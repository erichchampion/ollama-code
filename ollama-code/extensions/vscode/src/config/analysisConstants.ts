/**
 * Analysis Configuration Constants
 *
 * Centralized constants for code analysis thresholds and patterns
 * to eliminate hardcoded values throughout the codebase.
 */

export const CODE_METRICS_THRESHOLDS = {
  // Complexity thresholds
  HIGH_COMPLEXITY: 10,
  MEDIUM_COMPLEXITY: 5,
  MAX_DISPLAY_COMPLEXITY: 20,

  // Function size thresholds
  LONG_FUNCTION_LINES: 30,
  TOO_MANY_PARAMS: 5,

  // File-level thresholds
  FILE_COMPLEXITY_WARNING: 8,

  // Performance limits
  MAX_FILE_SIZE_KB: 1024, // 1MB limit for analysis
  ANALYSIS_TIMEOUT_MS: 30000, // 30 second timeout
} as const;

export const SUPPORTED_LANGUAGES = [
  'typescript', 'javascript', 'python', 'java', 'csharp', 'cpp', 'c',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala'
] as const;

export const COMPLEXITY_KEYWORDS = {
  GENERAL: ['if', 'else if', 'elif', 'while', 'for', 'foreach', 'switch', 'case', 'catch', 'except'],
  OPERATORS: ['&&', '||', '?', 'and', 'or'],
  ALL: function() {
    return [...this.GENERAL, ...this.OPERATORS];
  }
} as const;

export const LANGUAGE_PATTERNS = {
  TYPESCRIPT: {
    FUNCTIONS: [
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\([^)]*\)\s*=>/g,
      /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g,
      /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g
    ],
    CLASSES: [
      /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ],
    INTERFACES: [
      /(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ],
    ENUMS: [
      /(?:export\s+)?enum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ],
    VARIABLES: [
      /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ]
  },

  PYTHON: {
    FUNCTIONS: [/^(?:async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm],
    CLASSES: [/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm]
  },

  JAVA: {
    CLASSES: [/(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g],
    METHODS: [/(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:\w+\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/g]
  },

  CSHARP: {
    CLASSES: [/(?:public\s+|private\s+|protected\s+|internal\s+)?(?:abstract\s+|sealed\s+|static\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g],
    METHODS: [/(?:public\s+|private\s+|protected\s+|internal\s+)?(?:static\s+|virtual\s+|override\s+|abstract\s+)?(?:\w+\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/g]
  },

  CPP: {
    FUNCTIONS: [/(?:\w+\s+)*([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/g]
  },

  GO: {
    FUNCTIONS: [/func\s+([a-zA-Z_][a-zA-Z0-9_]*)/g]
  },

  RUST: {
    FUNCTIONS: [/fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/g]
  },

  GENERIC: {
    FUNCTIONS: [/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g]
  }
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type LanguagePatternKey = keyof typeof LANGUAGE_PATTERNS;