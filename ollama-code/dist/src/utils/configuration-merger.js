/**
 * Configuration Merging Utility
 *
 * Provides centralized configuration merging functionality with validation
 * to eliminate duplicate config handling logic across providers.
 */
export class ConfigurationMerger {
    /**
     * Merge partial configuration with defaults
     */
    static mergeWithDefaults(partialConfig, defaults, options = {}) {
        const { deepMerge = false, allowUndefined = false } = options;
        if (deepMerge) {
            return this.deepMerge(defaults, partialConfig, allowUndefined);
        }
        const filtered = allowUndefined
            ? partialConfig
            : this.filterUndefined(partialConfig);
        return { ...defaults, ...filtered };
    }
    /**
     * Merge configuration with validation
     */
    static mergeWithValidation(partialConfig, defaults, validationRules = [], options = {}) {
        const merged = this.mergeWithDefaults(partialConfig, defaults, options);
        if (options.validateAfterMerge !== false) {
            this.validateConfig(merged, validationRules);
        }
        return merged;
    }
    /**
     * Deep merge two objects
     */
    static deepMerge(target, source, allowUndefined = false) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                if (!allowUndefined && sourceValue === undefined) {
                    continue;
                }
                if (this.isObject(sourceValue) && this.isObject(result[key])) {
                    result[key] = this.deepMerge(result[key], sourceValue, allowUndefined);
                }
                else {
                    result[key] = sourceValue;
                }
            }
        }
        return result;
    }
    /**
     * Validate configuration against rules
     */
    static validateConfig(config, validationRules) {
        const errors = [];
        for (const rule of validationRules) {
            if (!rule.validate(config)) {
                errors.push(rule.message);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }
    /**
     * Filter out undefined values from partial config
     */
    static filterUndefined(obj) {
        const filtered = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                filtered[key] = obj[key];
            }
        }
        return filtered;
    }
    /**
     * Create environment-specific configuration overrides
     */
    static createEnvironmentOverrides(baseConfig, environmentOverrides, environment = process.env.NODE_ENV || 'development') {
        const envOverrides = environmentOverrides[environment] || {};
        return this.mergeWithDefaults(envOverrides, baseConfig, { deepMerge: true });
    }
    /**
     * Merge multiple configuration sources in order of priority
     */
    static mergeMultiple(defaultConfig, ...configs) {
        return configs.reduce((acc, config) => {
            if (config) {
                return this.mergeWithDefaults(config, acc, { deepMerge: true });
            }
            return acc;
        }, defaultConfig);
    }
    /**
     * Extract subset of configuration based on keys
     */
    static extractSubset(config, keys) {
        const subset = {};
        for (const key of keys) {
            if (key in config) {
                subset[key] = config[key];
            }
        }
        return subset;
    }
    /**
     * Helper to check if value is a plain object
     */
    static isObject(value) {
        return (value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date) &&
            !(value instanceof RegExp));
    }
}
/**
 * Common validation rules for AI provider configurations
 */
export class CommonValidationRules {
    static positiveNumber(getter, fieldName) {
        return {
            validate: (config) => {
                const value = getter(config);
                return typeof value === 'number' && value > 0;
            },
            message: `${fieldName} must be a positive number`
        };
    }
    static requiredString(getter, fieldName) {
        return {
            validate: (config) => {
                const value = getter(config);
                return typeof value === 'string' && value.trim().length > 0;
            },
            message: `${fieldName} is required and must be a non-empty string`
        };
    }
    static portRange(getter, fieldName) {
        return {
            validate: (config) => {
                const value = getter(config);
                return typeof value === 'number' && value >= 1024 && value <= 65535;
            },
            message: `${fieldName} must be a valid port number (1024-65535)`
        };
    }
    static percentageRange(getter, fieldName) {
        return {
            validate: (config) => {
                const value = getter(config);
                return typeof value === 'number' && value >= 0 && value <= 1;
            },
            message: `${fieldName} must be a percentage value between 0 and 1`
        };
    }
}
//# sourceMappingURL=configuration-merger.js.map