/**
 * File Operations Constants
 *
 * Centralized configuration values for file operations to eliminate hardcoded values
 */
export declare const FILE_OPERATION_CONSTANTS: {
    readonly COMMAND_CONFIDENCE_THRESHOLD: 0.8;
    readonly TASK_CONFIDENCE_THRESHOLD: 0.6;
    readonly FUZZY_THRESHOLD: 0.8;
    readonly PATTERN_MATCH_CONFIDENCE: 0.8;
    readonly RECENT_FILE_CONFIDENCE: 0.6;
    readonly LARGE_FILE_THRESHOLD: 100000;
    readonly RECENT_FILES_LIMIT: 3;
    readonly MULTIPLE_FILES_THRESHOLD: 5;
    readonly MODERATE_FILES_THRESHOLD: 2;
    readonly MAX_DIRECTORY_DEPTH: 3;
    readonly DEFAULT_TEST_FRAMEWORK: "jest";
    readonly DEFAULT_TIMEOUT: 10000;
    readonly LANGUAGE_EXTENSIONS: {
        readonly '.ts': "typescript";
        readonly '.tsx': "typescript";
        readonly '.js': "javascript";
        readonly '.jsx': "javascript";
        readonly '.py': "python";
        readonly '.java': "java";
        readonly '.cpp': "cpp";
        readonly '.c': "c";
        readonly '.cs': "csharp";
        readonly '.go': "go";
        readonly '.rs': "rust";
        readonly '.php': "php";
        readonly '.rb': "ruby";
        readonly '.swift': "swift";
        readonly '.kt': "kotlin";
        readonly '.scala': "scala";
        readonly '.sh': "bash";
        readonly '.html': "html";
        readonly '.css': "css";
        readonly '.scss': "scss";
        readonly '.less': "less";
        readonly '.json': "json";
        readonly '.yaml': "yaml";
        readonly '.yml': "yaml";
        readonly '.xml': "xml";
        readonly '.md': "markdown";
    };
    readonly PROGRAMMING_LANGUAGES: readonly ["javascript", "typescript", "python", "java", "c++", "c", "go", "rust", "php", "ruby"];
    readonly FRAMEWORKS: readonly ["react", "vue", "angular", "express", "django", "flask", "spring", "laravel"];
    readonly SYSTEM_FILES: readonly ["package.json", "package-lock.json", "yarn.lock", "tsconfig.json", "jsconfig.json", ".gitignore", ".git", "Dockerfile", "docker-compose.yml", "Makefile", "CMakeLists.txt"];
    readonly CONFIG_PATTERNS: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
    readonly SAFETY_LEVELS: readonly ["safe", "cautious", "risky", "dangerous"];
    readonly FILE_OPERATION_KEYWORDS: readonly ["create", "make", "generate", "build", "edit", "modify", "change", "update", "fix", "delete", "remove", "drop", "move", "rename", "relocate", "copy", "duplicate", "refactor", "restructure", "test", "spec"];
};
export type SafetyLevel = typeof FILE_OPERATION_CONSTANTS.SAFETY_LEVELS[number];
export type ProgrammingLanguage = typeof FILE_OPERATION_CONSTANTS.PROGRAMMING_LANGUAGES[number];
export type Framework = typeof FILE_OPERATION_CONSTANTS.FRAMEWORKS[number];
