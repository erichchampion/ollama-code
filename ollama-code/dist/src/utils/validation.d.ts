/**
 * Validation Utilities
 *
 * Centralized validation logic to reduce duplication and ensure consistent
 * validation patterns across the application.
 */
export interface ValidationResult<T = any> {
    isValid: boolean;
    value?: T;
    error?: Error;
    errors?: string[];
}
export interface FileValidationOptions {
    mustExist?: boolean;
    allowedExtensions?: string[];
    maxSize?: number;
    checkReadable?: boolean;
    checkWritable?: boolean;
}
/**
 * File system validation utilities
 */
export declare class FileSystemValidator {
    /**
     * Validate file path and properties
     */
    static validateFile(filePath: string, options?: FileValidationOptions): Promise<ValidationResult<string>>;
    /**
     * Check if path exists
     */
    static exists(path: string): Promise<boolean>;
}
/**
 * String validation utilities
 */
export declare class StringValidator {
    /**
     * Validate string with length constraints
     */
    static validate(value: unknown, fieldName: string, minLength?: number, maxLength?: number): ValidationResult<string>;
}
/**
 * Legacy validation functions for backward compatibility
 */
export declare function isNonEmptyString(value: unknown): value is string;
export declare function isValidPath(value: unknown): value is string;
export declare function isValidFilePath(value: unknown): value is string;
export declare function isValidDirectoryPath(value: unknown): value is string;
/**
 * Convenience validation functions
 */
export declare const validators: {
    file: typeof FileSystemValidator.validateFile;
    exists: typeof FileSystemValidator.exists;
    string: typeof StringValidator.validate;
};
