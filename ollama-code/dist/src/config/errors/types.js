/**
 * Error Handling Types
 *
 * Type definitions for the error handling system.
 */
/**
 * Error severity levels
 */
export var ErrorLevel;
(function (ErrorLevel) {
    /**
     * Debug level for detailed information
     */
    ErrorLevel[ErrorLevel["DEBUG"] = 0] = "DEBUG";
    /**
     * Informational messages
     */
    ErrorLevel[ErrorLevel["INFO"] = 1] = "INFO";
    /**
     * Warning messages
     */
    ErrorLevel[ErrorLevel["WARNING"] = 2] = "WARNING";
    /**
     * Error messages
     */
    ErrorLevel[ErrorLevel["ERROR"] = 3] = "ERROR";
    /**
     * Critical errors that prevent the application from functioning
     */
    ErrorLevel[ErrorLevel["CRITICAL"] = 4] = "CRITICAL";
    /**
     * Fatal errors that cause application termination
     */
    ErrorLevel[ErrorLevel["FATAL"] = 5] = "FATAL";
})(ErrorLevel || (ErrorLevel = {}));
/**
 * Error categories for classification
 */
export var ErrorCategory;
(function (ErrorCategory) {
    /**
     * Application-level errors
     */
    ErrorCategory[ErrorCategory["APPLICATION"] = 0] = "APPLICATION";
    /**
     * System-related errors
     */
    ErrorCategory[ErrorCategory["SYSTEM"] = 1] = "SYSTEM";
    /**
     * Network-related errors
     */
    ErrorCategory[ErrorCategory["NETWORK"] = 2] = "NETWORK";
    /**
     * File system-related errors
     */
    ErrorCategory[ErrorCategory["FILE_SYSTEM"] = 3] = "FILE_SYSTEM";
    /**
     * Command execution-related errors
     */
    ErrorCategory[ErrorCategory["COMMAND_EXECUTION"] = 4] = "COMMAND_EXECUTION";
    /**
     * AI service-related errors
     */
    ErrorCategory[ErrorCategory["AI_SERVICE"] = 5] = "AI_SERVICE";
    /**
     * Configuration-related errors
     */
    ErrorCategory[ErrorCategory["CONFIGURATION"] = 6] = "CONFIGURATION";
    /**
     * Resource-related errors
     */
    ErrorCategory[ErrorCategory["RESOURCE"] = 7] = "RESOURCE";
    /**
     * Unknown errors
     */
    ErrorCategory[ErrorCategory["UNKNOWN"] = 8] = "UNKNOWN";
    /**
     * Internal errors
     */
    ErrorCategory[ErrorCategory["INTERNAL"] = 9] = "INTERNAL";
    /**
     * Validation errors
     */
    ErrorCategory[ErrorCategory["VALIDATION"] = 10] = "VALIDATION";
    /**
     * Initialization errors
     */
    ErrorCategory[ErrorCategory["INITIALIZATION"] = 11] = "INITIALIZATION";
    /**
     * Server errors
     */
    ErrorCategory[ErrorCategory["SERVER"] = 12] = "SERVER";
    /**
     * API errors
     */
    ErrorCategory[ErrorCategory["API"] = 13] = "API";
    /**
     * Timeout errors
     */
    ErrorCategory[ErrorCategory["TIMEOUT"] = 14] = "TIMEOUT";
    /**
     * Rate limit errors
     */
    ErrorCategory[ErrorCategory["RATE_LIMIT"] = 15] = "RATE_LIMIT";
    /**
     * Connection errors
     */
    ErrorCategory[ErrorCategory["CONNECTION"] = 16] = "CONNECTION";
    /**
     * File not found errors
     */
    ErrorCategory[ErrorCategory["FILE_NOT_FOUND"] = 18] = "FILE_NOT_FOUND";
    /**
     * File access errors
     */
    ErrorCategory[ErrorCategory["FILE_ACCESS"] = 19] = "FILE_ACCESS";
    /**
     * File read errors
     */
    ErrorCategory[ErrorCategory["FILE_READ"] = 20] = "FILE_READ";
    /**
     * File write errors
     */
    ErrorCategory[ErrorCategory["FILE_WRITE"] = 21] = "FILE_WRITE";
    /**
     * Command errors
     */
    ErrorCategory[ErrorCategory["COMMAND"] = 22] = "COMMAND";
    /**
     * Command not found errors
     */
    ErrorCategory[ErrorCategory["COMMAND_NOT_FOUND"] = 23] = "COMMAND_NOT_FOUND";
})(ErrorCategory || (ErrorCategory = {}));
/**
 * User error
 */
export class UserError extends Error {
    /**
     * Original error that caused this error
     */
    cause;
    /**
     * Error category
     */
    category;
    /**
     * Error level
     */
    level;
    /**
     * Hint on how to resolve the error
     */
    resolution;
    /**
     * Additional details about the error
     */
    details;
    /**
     * Error context
     */
    context;
    /**
     * Error code
     */
    code;
    /**
     * Create a new user error
     */
    constructor(message, options = {}) {
        super(message);
        this.name = 'UserError';
        this.cause = options.cause;
        this.category = options.category || ErrorCategory.UNKNOWN;
        this.level = options.level || ErrorLevel.ERROR;
        this.resolution = options.resolution;
        this.details = options.details || {};
        this.context = options.context;
        this.code = options.code;
        // Capture stack trace
        Error.captureStackTrace?.(this, UserError);
    }
}
