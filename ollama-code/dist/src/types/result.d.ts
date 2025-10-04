/**
 * Result Types for Error Handling
 *
 * Provides a robust Result<T, E> pattern to eliminate exception throwing
 * and enable graceful error handling throughout the application.
 */
export interface Success<T> {
    success: true;
    data: T;
    error?: never;
}
export interface Failure<E> {
    success: false;
    data?: never;
    error: E;
}
export type Result<T, E = Error> = Success<T> | Failure<E>;
export interface ErrorDetails {
    code: string;
    message: string;
    details?: string;
    cause?: Error;
    timestamp: Date;
    context?: Record<string, any>;
}
/**
 * Create a successful result
 */
export declare function ok<T>(data: T): Success<T>;
/**
 * Create a failure result
 */
export declare function err<E>(error: E): Failure<E>;
/**
 * Create a failure result from an Error
 */
export declare function errFromError(error: Error, code?: string, context?: Record<string, any>): Failure<ErrorDetails>;
/**
 * Create a failure result from a string message
 */
export declare function errFromString(message: string, code?: string, context?: Record<string, any>): Failure<ErrorDetails>;
/**
 * Check if result is successful
 */
export declare function isOk<T, E>(result: Result<T, E>): result is Success<T>;
/**
 * Check if result is a failure
 */
export declare function isErr<T, E>(result: Result<T, E>): result is Failure<E>;
/**
 * Map a successful result to a new value
 */
export declare function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E>;
/**
 * Map an error result to a new error
 */
export declare function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>;
/**
 * Chain results together (flatMap)
 */
export declare function andThen<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E>;
/**
 * Get the data from a result, or throw if it's an error
 */
export declare function unwrap<T, E>(result: Result<T, E>): T;
/**
 * Get the data from a result, or return a default value
 */
export declare function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T;
/**
 * Get the data from a result, or compute a default value from the error
 */
export declare function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T;
/**
 * Convert an async function that might throw to one that returns a Result
 */
export declare function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, ErrorDetails>>;
/**
 * Convert a synchronous function that might throw to one that returns a Result
 */
export declare function trySync<T>(fn: () => T): Result<T, ErrorDetails>;
/**
 * Collect multiple results into a single result containing an array
 * Fails if any individual result fails
 */
export declare function collectResults<T, E>(results: Result<T, E>[]): Result<T[], E>;
/**
 * Partition results into successes and failures
 */
export declare function partitionResults<T, E>(results: Result<T, E>[]): {
    successes: T[];
    failures: E[];
};
/**
 * Combine two results into a single result containing a tuple
 */
export declare function combine<T1, T2, E>(result1: Result<T1, E>, result2: Result<T2, E>): Result<[T1, T2], E>;
/**
 * Apply a function that returns a Result to each item in an array
 * Returns the first error encountered, or an array of all successes
 */
export declare function mapResults<T, U, E>(items: T[], fn: (item: T, index: number) => Result<U, E>): Result<U[], E>;
