/**
 * Command Helper Utilities
 *
 * Provides reusable utility functions for command validation, error handling,
 * and common patterns to eliminate code duplication across command implementations.
 */
import { Spinner } from './spinner.js';
/**
 * Validates that a value is a non-empty string
 */
export declare function validateNonEmptyString(value: any, fieldName: string): boolean;
/**
 * Validates that a file exists at the given path and prevents directory traversal attacks
 */
export declare function validateFileExists(filePath: string): Promise<boolean>;
/**
 * Security function to prevent directory traversal attacks
 * Only allows access to files within the current working directory and its subdirectories
 */
export declare function isSecureFilePath(filePath: string): boolean;
/**
 * Validates that a directory exists at the given path
 */
export declare function validateDirectoryExists(dirPath: string): Promise<boolean>;
/**
 * Executes a function with a spinner animation
 * Handles spinner cleanup and error formatting consistently
 */
export declare function executeWithSpinner<T>(spinnerText: string, fn: () => Promise<T>, successMessage?: string, errorMessage?: string): Promise<T>;
/**
 * Handles command errors consistently across all commands
 */
export declare function handleCommandError(error: unknown, spinner?: Spinner, customMessage?: string): void;
/**
 * Safely executes a command with proper error handling and cleanup
 */
export declare function executeCommand<T>(commandName: string, operation: () => Promise<T>, options?: {
    spinnerText?: string;
    successMessage?: string;
    errorMessage?: string;
    validateInputs?: () => Promise<boolean>;
}): Promise<T | undefined>;
/**
 * Creates a cancellable operation with SIGINT handling
 */
export declare function createCancellableOperation<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T>;
/**
 * Validates file extension matches expected types
 */
export declare function validateFileExtension(filePath: string, allowedExtensions: string[]): boolean;
/**
 * Safely parses JSON with error handling
 */
export declare function parseJSONSafely<T = any>(jsonString: string): T | null;
/**
 * Formats file size in human-readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Truncates text to specified length with ellipsis
 */
export declare function truncateText(text: string, maxLength: number): string;
/**
 * Validates that required command arguments are provided
 */
export declare function validateRequiredArgs(args: string[], requiredCount: number, commandName: string, usage: string): boolean;
/**
 * Validates input size to prevent DoS attacks
 * Returns false if input is too large
 */
export declare function validateInputSize(input: string, maxSizeBytes?: number): boolean;
/**
 * Validates rate limiting to prevent DoS attacks
 * Returns false if rate limit is exceeded
 */
export declare function validateRateLimit(identifier?: string): boolean;
/**
 * Validates configuration values for security
 * Prevents insecure or malicious configuration settings
 */
export declare function validateConfigurationValue(key: string, value: any): boolean;
/**
 * Sanitizes configuration output for production mode
 * Removes debug information and sensitive data
 */
export declare function sanitizeConfigurationOutput(config: any, isProduction?: boolean): any;
/**
 * A06 Security: Validate file types for processing
 * Returns true if the file is safe to process, false otherwise
 */
export declare function validateFileTypeForProcessing(filePath: string): boolean;
/**
 * A08 Security: Validate content for potential security issues
 * Returns true if content appears safe to process, false otherwise
 */
export declare function validateContentIntegrity(content: string, filePath: string): boolean;
/**
 * Security function to sanitize search terms and prevent command injection
 * Removes dangerous shell metacharacters that could be used for injection attacks
 */
export declare function sanitizeSearchTerm(input: string): string;
/**
 * Security function to sanitize output content to prevent display of dangerous patterns
 */
export declare function sanitizeOutput(output: string): string;
/**
 * Security function to validate and sanitize shell commands to prevent injection attacks
 * Returns null if the command is deemed unsafe
 */
export declare function validateAndSanitizeCommand(input: string): string | null;
/**
 * A09 Security: Log security-relevant events without exposing sensitive data
 */
export declare function logSecurityEvent(event: string, details?: Record<string, any>): void;
/**
 * A09 Security: Sanitize sensitive configuration values for output
 */
export declare function sanitizeConfigurationValue(key: string, value: any): string;
