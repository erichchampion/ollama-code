/**
 * Safety System Constants
 *
 * Centralized configuration values for the safety system to eliminate hardcoded values
 * and provide consistent behavior across all safety components.
 */
export declare const SAFETY_TIMEOUTS: {
    readonly RISK_ASSESSMENT: 30000;
    readonly CHANGE_PREVIEW: 50000;
    readonly BACKUP_OPERATION: 300000;
    readonly ROLLBACK_OPERATION: 60000;
    readonly OPERATION_TIMEOUT: 1000;
    readonly COMPONENT_LOADING: 20000;
};
export declare const PREVIEW_LIMITS: {
    readonly MAX_PREVIEW_LINES: 50;
    readonly MAX_DIFF_LINES: 20;
    readonly CONTEXT_LINES: 3;
    readonly MAX_FILE_SIZE_MB: 10;
};
export declare const FILE_SIZE_THRESHOLDS: {
    readonly SMALL_FILE: number;
    readonly MEDIUM_FILE: number;
    readonly LARGE_FILE: number;
    readonly HUGE_FILE: number;
};
export declare const RISK_CONFIG: {
    readonly FACTOR_WEIGHTS: {
        readonly SYSTEM_FILE: 0.9;
        readonly DELETION: 0.8;
        readonly LARGE_FILE: 0.6;
        readonly CONFIG_FILE: 0.7;
        readonly SECURITY_FILE: 0.9;
        readonly DATABASE_SCHEMA: 0.8;
        readonly BULK_OPERATION: 0.5;
        readonly CROSS_MODULE: 0.4;
        readonly EXTERNAL_DEPENDENCY: 0.6;
    };
    readonly SAFETY_THRESHOLDS: {
        readonly LOW: 0.3;
        readonly MEDIUM: 0.6;
        readonly HIGH: 0.8;
        readonly CRITICAL: 0.9;
    };
    readonly MAX_OPERATIONS_COUNT: 50;
    readonly BULK_OPERATION_THRESHOLD: 10;
};
export declare const BACKUP_CONFIG: {
    readonly MAX_BACKUPS: 10;
    readonly RETENTION_DAYS: 7;
    readonly BACKUP_DIR_NAME: ".ollama-code-backups";
    readonly COMPRESSION_ENABLED: true;
    readonly CHECKSUM_ALGORITHM: "sha256";
};
export declare const SECURITY_PATTERNS: {
    readonly SYSTEM_FILES: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
    readonly CONFIG_FILES: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
    readonly SECURITY_FILES: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
};
export declare const STATUS_MESSAGES: {
    readonly OPERATION_APPROVED: "✅ Operation approved";
    readonly OPERATION_REJECTED: "❌ Operation rejected";
    readonly APPROVAL_REQUIRED: "⏳ Operation requires approval";
    readonly PREVIEW_READY: "📋 Preview ready";
    readonly BACKUP_CREATED: "💾 Backup created";
    readonly ROLLBACK_COMPLETED: "⮎ Rollback completed";
    readonly RISK_ASSESSED: "🔍 Risk assessment completed";
};
export declare const ERROR_MESSAGES: {
    readonly COMPONENT_LOAD_TIMEOUT: "Component loading timeout";
    readonly OPERATION_TIMEOUT: "Operation timeout";
    readonly BACKUP_FAILED: "Backup operation failed";
    readonly ROLLBACK_FAILED: "Rollback operation failed";
    readonly RISK_ASSESSMENT_FAILED: "Risk assessment failed";
    readonly APPROVAL_DENIED: "Operation approval denied";
    readonly INVALID_OPERATION: "Invalid operation type";
    readonly FILE_NOT_FOUND: "File not found";
    readonly PERMISSION_DENIED: "Permission denied";
};
export declare const FILE_CATEGORIES: {
    readonly SOURCE_CODE: readonly [".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".cpp", ".c", ".cs", ".go", ".rs", ".php"];
    readonly CONFIG: readonly [".json", ".yaml", ".yml", ".toml", ".ini", ".conf", ".config"];
    readonly DOCS: readonly [".md", ".txt", ".rst", ".adoc"];
    readonly ASSETS: readonly [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".css", ".scss", ".less"];
    readonly DATA: readonly [".sql", ".db", ".sqlite", ".csv", ".xml", ".parquet"];
};
export declare const PROGRESS_CONFIG: {
    readonly UPDATE_INTERVAL_MS: 1000;
    readonly MAX_PROGRESS_ENTRIES: 100;
    readonly CLEANUP_INTERVAL_MS: 60000;
};
