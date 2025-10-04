"use strict";
/**
 * Result Types for Error Handling
 *
 * Provides a robust Result<T, E> pattern to eliminate exception throwing
 * and enable graceful error handling throughout the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.err = err;
exports.errFromError = errFromError;
exports.errFromString = errFromString;
exports.isOk = isOk;
exports.isErr = isErr;
exports.map = map;
exports.mapErr = mapErr;
exports.andThen = andThen;
exports.unwrap = unwrap;
exports.unwrapOr = unwrapOr;
exports.unwrapOrElse = unwrapOrElse;
exports.tryAsync = tryAsync;
exports.trySync = trySync;
exports.collectResults = collectResults;
exports.partitionResults = partitionResults;
exports.combine = combine;
exports.mapResults = mapResults;
/**
 * Create a successful result
 */
function ok(data) {
    return {
        success: true,
        data
    };
}
/**
 * Create a failure result
 */
function err(error) {
    return {
        success: false,
        error
    };
}
/**
 * Create a failure result from an Error
 */
function errFromError(error, code, context) {
    return err({
        code: code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.stack,
        cause: error,
        timestamp: new Date(),
        context
    });
}
/**
 * Create a failure result from a string message
 */
function errFromString(message, code = 'ERROR', context) {
    return err({
        code,
        message,
        timestamp: new Date(),
        context
    });
}
/**
 * Check if result is successful
 */
function isOk(result) {
    return result.success;
}
/**
 * Check if result is a failure
 */
function isErr(result) {
    return !result.success;
}
/**
 * Map a successful result to a new value
 */
function map(result, fn) {
    if (isOk(result)) {
        return ok(fn(result.data));
    }
    return result;
}
/**
 * Map an error result to a new error
 */
function mapErr(result, fn) {
    if (isErr(result)) {
        return err(fn(result.error));
    }
    return result;
}
/**
 * Chain results together (flatMap)
 */
function andThen(result, fn) {
    if (isOk(result)) {
        return fn(result.data);
    }
    return result;
}
/**
 * Get the data from a result, or throw if it's an error
 */
function unwrap(result) {
    if (isOk(result)) {
        return result.data;
    }
    throw new Error(`Tried to unwrap error result: ${JSON.stringify(result.error)}`);
}
/**
 * Get the data from a result, or return a default value
 */
function unwrapOr(result, defaultValue) {
    if (isOk(result)) {
        return result.data;
    }
    return defaultValue;
}
/**
 * Get the data from a result, or compute a default value from the error
 */
function unwrapOrElse(result, fn) {
    if (isOk(result)) {
        return result.data;
    }
    return fn(result.error);
}
/**
 * Convert an async function that might throw to one that returns a Result
 */
async function tryAsync(fn) {
    try {
        const data = await fn();
        return ok(data);
    }
    catch (error) {
        if (error instanceof Error) {
            return errFromError(error);
        }
        return errFromString(String(error), 'UNKNOWN_ERROR');
    }
}
/**
 * Convert a synchronous function that might throw to one that returns a Result
 */
function trySync(fn) {
    try {
        const data = fn();
        return ok(data);
    }
    catch (error) {
        if (error instanceof Error) {
            return errFromError(error);
        }
        return errFromString(String(error), 'UNKNOWN_ERROR');
    }
}
/**
 * Collect multiple results into a single result containing an array
 * Fails if any individual result fails
 */
function collectResults(results) {
    const data = [];
    for (const result of results) {
        if (isErr(result)) {
            return result;
        }
        data.push(result.data);
    }
    return ok(data);
}
/**
 * Partition results into successes and failures
 */
function partitionResults(results) {
    const successes = [];
    const failures = [];
    for (const result of results) {
        if (isOk(result)) {
            successes.push(result.data);
        }
        else {
            failures.push(result.error);
        }
    }
    return { successes, failures };
}
/**
 * Combine two results into a single result containing a tuple
 */
function combine(result1, result2) {
    if (isErr(result1))
        return result1;
    if (isErr(result2))
        return result2;
    return ok([result1.data, result2.data]);
}
/**
 * Apply a function that returns a Result to each item in an array
 * Returns the first error encountered, or an array of all successes
 */
function mapResults(items, fn) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
        const result = fn(items[i], i);
        if (isErr(result)) {
            return result;
        }
        results.push(result.data);
    }
    return ok(results);
}
//# sourceMappingURL=result.js.map