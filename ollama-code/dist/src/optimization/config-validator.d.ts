/**
 * Configuration Validation System
 *
 * Provides comprehensive validation for all configuration values:
 * - Runtime type checking
 * - Value range validation
 * - Cross-field validation
 * - Migration support for configuration changes
 * - Helpful error messages with suggestions
 */
interface ValidationRule {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | string;
    description?: string;
}
interface ValidationError {
    field: string;
    value: any;
    error: string;
    suggestion?: string;
}
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}
interface ConfigMigration {
    fromVersion: string;
    toVersion: string;
    migrate: (config: any) => any;
    description: string;
}
export declare class ConfigValidator {
    private rules;
    private migrations;
    constructor();
    /**
     * Validate entire configuration object
     */
    validateConfig(config: any): ValidationResult;
    /**
     * Validate a specific field
     */
    validateField(field: string, value: any, rule: ValidationRule): ValidationError & {
        severity: 'error' | 'warning';
    } | null;
    /**
     * Migrate configuration to current version
     */
    migrateConfig(config: any): {
        config: any;
        migrated: boolean;
        changes: string[];
    };
    /**
     * Register validation rule
     */
    registerRule(rule: ValidationRule): void;
    /**
     * Register configuration migration
     */
    registerMigration(migration: ConfigMigration): void;
    /**
     * Get validation suggestions for invalid configuration
     */
    getSuggestions(config: any): string[];
    /**
     * Validate type
     */
    private validateType;
    /**
     * Perform cross-field validation
     */
    private performCrossValidation;
    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue;
    /**
     * Get model limits for validation
     */
    private getModelLimits;
    /**
     * Check if migration should be applied
     */
    private shouldApplyMigration;
    /**
     * Compare version strings
     */
    private compareVersions;
    /**
     * Get latest configuration version
     */
    private getLatestVersion;
    /**
     * Register default validation rules
     */
    private registerDefaultRules;
    /**
     * Register configuration migrations
     */
    private registerMigrations;
    /**
     * Dispose of the config validator and clean up resources
     */
    dispose(): Promise<void>;
}
export {};
