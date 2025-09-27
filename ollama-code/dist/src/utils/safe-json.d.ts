/**
 * Safe JSON Utilities
 *
 * Provides safe JSON serialization and parsing with protection against
 * circular references and other common JSON-related issues.
 */
export interface SafeJsonOptions {
    maxDepth?: number;
    includeNonEnumerable?: boolean;
    replacer?: (key: string, value: any) => any;
    space?: string | number;
}
/**
 * Safely stringify an object, handling circular references
 */
export declare function safeStringify(obj: any, options?: SafeJsonOptions): string;
/**
 * Safely parse JSON with error handling
 */
export declare function safeParse<T = any>(jsonString: string, defaultValue?: T): T | typeof defaultValue;
/**
 * Check if a string is valid JSON
 */
export declare function isValidJson(str: string): boolean;
/**
 * Safely stringify with size limit
 */
export declare function safeStringifyWithLimit(obj: any, maxSizeBytes?: number, // 1MB default
options?: SafeJsonOptions): string;
/**
 * Safely extract error information
 */
export declare function safeErrorStringify(error: any): string;
/**
 * Deep clone an object safely
 */
export declare function safeDeepClone<T>(obj: T): T | null;
