"use strict";
/**
 * Validation Utilities
 *
 * Shared validation functions to eliminate duplicate validation logic
 * across the extension codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePort = validatePort;
exports.validateTimeout = validateTimeout;
exports.validateContextLines = validateContextLines;
exports.validateCacheSize = validateCacheSize;
exports.validateConcurrentRequests = validateConcurrentRequests;
exports.validateNotEmpty = validateNotEmpty;
exports.validateEmail = validateEmail;
exports.validateUrl = validateUrl;
exports.validateJson = validateJson;
exports.validateArrayMinLength = validateArrayMinLength;
exports.validateRequiredProperties = validateRequiredProperties;
exports.combineValidationResults = combineValidationResults;
exports.validateOrThrow = validateOrThrow;
exports.createValidator = createValidator;
const serviceConstants_1 = require("../config/serviceConstants");
const errorUtils_1 = require("./errorUtils");
/**
 * Validate port number
 */
function validatePort(port) {
    const errors = [];
    if (!Number.isInteger(port)) {
        errors.push('Port must be an integer');
    }
    if (port < serviceConstants_1.VALIDATION_LIMITS.PORT_MIN || port > serviceConstants_1.VALIDATION_LIMITS.PORT_MAX) {
        errors.push(`Port must be between ${serviceConstants_1.VALIDATION_LIMITS.PORT_MIN} and ${serviceConstants_1.VALIDATION_LIMITS.PORT_MAX}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate timeout value
 */
function validateTimeout(timeout) {
    const errors = [];
    if (!Number.isInteger(timeout)) {
        errors.push('Timeout must be an integer');
    }
    if (timeout < serviceConstants_1.VALIDATION_LIMITS.TIMEOUT_MIN || timeout > serviceConstants_1.VALIDATION_LIMITS.TIMEOUT_MAX) {
        errors.push(`Timeout must be between ${serviceConstants_1.VALIDATION_LIMITS.TIMEOUT_MIN} and ${serviceConstants_1.VALIDATION_LIMITS.TIMEOUT_MAX}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate context lines
 */
function validateContextLines(contextLines) {
    const errors = [];
    if (!Number.isInteger(contextLines)) {
        errors.push('Context lines must be an integer');
    }
    if (contextLines < serviceConstants_1.VALIDATION_LIMITS.CONTEXT_LINES_MIN || contextLines > serviceConstants_1.VALIDATION_LIMITS.CONTEXT_LINES_MAX) {
        errors.push(`Context lines must be between ${serviceConstants_1.VALIDATION_LIMITS.CONTEXT_LINES_MIN} and ${serviceConstants_1.VALIDATION_LIMITS.CONTEXT_LINES_MAX}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate cache size
 */
function validateCacheSize(cacheSize) {
    const errors = [];
    if (!Number.isInteger(cacheSize)) {
        errors.push('Cache size must be an integer');
    }
    if (cacheSize < serviceConstants_1.VALIDATION_LIMITS.CACHE_SIZE_MIN || cacheSize > serviceConstants_1.VALIDATION_LIMITS.CACHE_SIZE_MAX) {
        errors.push(`Cache size must be between ${serviceConstants_1.VALIDATION_LIMITS.CACHE_SIZE_MIN} and ${serviceConstants_1.VALIDATION_LIMITS.CACHE_SIZE_MAX}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate concurrent requests
 */
function validateConcurrentRequests(concurrentRequests) {
    const errors = [];
    if (!Number.isInteger(concurrentRequests)) {
        errors.push('Concurrent requests must be an integer');
    }
    if (concurrentRequests < serviceConstants_1.VALIDATION_LIMITS.CONCURRENT_REQUESTS_MIN || concurrentRequests > serviceConstants_1.VALIDATION_LIMITS.CONCURRENT_REQUESTS_MAX) {
        errors.push(`Concurrent requests must be between ${serviceConstants_1.VALIDATION_LIMITS.CONCURRENT_REQUESTS_MIN} and ${serviceConstants_1.VALIDATION_LIMITS.CONCURRENT_REQUESTS_MAX}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate string is not empty
 */
function validateNotEmpty(value, fieldName) {
    const errors = [];
    if (!value || value.trim().length === 0) {
        errors.push(`${fieldName} cannot be empty`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate email format
 */
function validateEmail(email) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate URL format
 */
function validateUrl(url) {
    const errors = [];
    try {
        new URL(url);
    }
    catch {
        errors.push('Invalid URL format');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate JSON format
 */
function validateJson(jsonString) {
    const errors = [];
    try {
        JSON.parse(jsonString);
    }
    catch (error) {
        errors.push(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate array has minimum length
 */
function validateArrayMinLength(array, minLength, fieldName) {
    const errors = [];
    if (!Array.isArray(array)) {
        errors.push(`${fieldName} must be an array`);
    }
    else if (array.length < minLength) {
        errors.push(`${fieldName} must have at least ${minLength} items`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Validate object has required properties
 */
function validateRequiredProperties(obj, requiredProps) {
    const errors = [];
    if (typeof obj !== 'object' || obj === null) {
        errors.push('Value must be an object');
        return { isValid: false, errors };
    }
    for (const prop of requiredProps) {
        if (!(prop in obj) || obj[prop] === undefined || obj[prop] === null) {
            errors.push(`Required property '${prop}' is missing`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
/**
 * Combine multiple validation results
 */
function combineValidationResults(...results) {
    const allErrors = results.flatMap(result => result.errors);
    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}
/**
 * Validate and throw error if invalid
 */
function validateOrThrow(result, context) {
    if (!result.isValid) {
        const contextPrefix = context ? `${context}: ` : '';
        throw (0, errorUtils_1.createError)(`${contextPrefix}${result.errors.join(', ')}`);
    }
}
/**
 * Create validation wrapper function
 */
function createValidator(validationFn) {
    return (value, throwOnError = false) => {
        const result = validationFn(value);
        if (throwOnError && !result.isValid) {
            throw (0, errorUtils_1.createError)(result.errors.join(', '));
        }
        return result;
    };
}
//# sourceMappingURL=validationUtils.js.map