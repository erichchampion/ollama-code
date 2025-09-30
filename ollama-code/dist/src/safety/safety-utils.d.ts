/**
 * Safety System Utilities
 *
 * Common utility functions used across safety components to eliminate DRY violations
 * and provide consistent behavior.
 */
/**
 * Check if a file exists
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Get file statistics safely
 */
export declare function getFileStats(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    isDirectory?: boolean;
} | null>;
/**
 * Check if file is a system file based on path patterns
 */
export declare function isSystemFile(filePath: string): boolean;
/**
 * Check if file is a configuration file
 */
export declare function isConfigFile(filePath: string): boolean;
/**
 * Check if file is a security-related file (keys, certificates, etc.)
 */
export declare function isSecurityFile(filePath: string): boolean;
/**
 * Categorize file size
 */
export declare function categorizeFileSize(sizeBytes: number): 'small' | 'medium' | 'large' | 'huge';
/**
 * Get file category based on extension
 */
export declare function getFileCategory(filePath: string): string;
/**
 * Validate file path for safety operations
 */
export declare function validateFilePath(filePath: string): {
    valid: boolean;
    reason?: string;
    warnings?: string[];
};
/**
 * Generate a unique operation ID
 */
export declare function generateOperationId(prefix?: string): string;
/**
 * Format file size in human-readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Format duration in human-readable format
 */
export declare function formatDuration(milliseconds: number): string;
/**
 * Safe error message extraction
 */
export declare function extractErrorMessage(error: unknown): string;
/**
 * Create backup filename with timestamp
 */
export declare function createBackupFilename(originalPath: string, timestamp?: Date): string;
/**
 * Sanitize file path for logging (remove sensitive info)
 */
export declare function sanitizePathForLogging(filePath: string): string;
/**
 * Check if operation should be auto-approved based on file characteristics
 */
export declare function shouldAutoApprove(filePath: string, operationType: string): boolean;
/**
 * Parse operation type from command or description
 */
export declare function parseOperationType(input: string): 'create' | 'modify' | 'delete' | 'move' | 'copy' | 'unknown';
/**
 * Estimate operation complexity based on targets and type
 */
export declare function estimateOperationComplexity(targets: string[], operationType: string): {
    complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
    factors: string[];
    estimatedTimeMinutes: number;
};
