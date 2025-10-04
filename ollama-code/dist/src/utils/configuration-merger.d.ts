/**
 * Configuration Merging Utility
 *
 * Provides centralized configuration merging functionality with validation
 * to eliminate duplicate config handling logic across providers.
 */
export interface ConfigValidationRule<T> {
    validate: (config: T) => boolean;
    message: string;
}
export interface MergeOptions {
    deepMerge?: boolean;
    allowUndefined?: boolean;
    validateAfterMerge?: boolean;
}
export declare class ConfigurationMerger {
    /**
     * Merge partial configuration with defaults
     */
    static mergeWithDefaults<T>(partialConfig: Partial<T>, defaults: T, options?: MergeOptions): T;
    /**
     * Merge configuration with validation
     */
    static mergeWithValidation<T>(partialConfig: Partial<T>, defaults: T, validationRules?: ConfigValidationRule<T>[], options?: MergeOptions): T;
    /**
     * Deep merge two objects
     */
    static deepMerge<T>(target: T, source: Partial<T>, allowUndefined?: boolean): T;
    /**
     * Validate configuration against rules
     */
    static validateConfig<T>(config: T, validationRules: ConfigValidationRule<T>[]): void;
    /**
     * Filter out undefined values from partial config
     */
    static filterUndefined<T>(obj: Partial<T>): Partial<T>;
    /**
     * Create environment-specific configuration overrides
     */
    static createEnvironmentOverrides<T>(baseConfig: T, environmentOverrides: Record<string, Partial<T>>, environment?: string): T;
    /**
     * Merge multiple configuration sources in order of priority
     */
    static mergeMultiple<T>(defaultConfig: T, ...configs: Array<Partial<T> | undefined>): T;
    /**
     * Extract subset of configuration based on keys
     */
    static extractSubset<T extends object, K extends keyof T>(config: T, keys: K[]): Pick<T, K>;
    /**
     * Helper to check if value is a plain object
     */
    private static isObject;
}
/**
 * Common validation rules for AI provider configurations
 */
export declare class CommonValidationRules {
    static positiveNumber<T>(getter: (config: T) => number, fieldName: string): ConfigValidationRule<T>;
    static requiredString<T>(getter: (config: T) => string, fieldName: string): ConfigValidationRule<T>;
    static portRange<T>(getter: (config: T) => number, fieldName: string): ConfigValidationRule<T>;
    static percentageRange<T>(getter: (config: T) => number, fieldName: string): ConfigValidationRule<T>;
}
