/**
 * Async Mutex for Thread-Safe Operations
 *
 * Provides mutual exclusion for async operations to prevent race conditions
 * in scenarios where multiple async operations might access shared resources.
 */
export declare class AsyncMutex {
    private promise;
    /**
     * Acquire the mutex and execute the provided function
     */
    lock<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Acquire the mutex
     */
    private acquire;
}
/**
 * Simple semaphore for limiting concurrent operations
 */
export declare class Semaphore {
    private permits;
    private waiting;
    constructor(permits: number);
    /**
     * Acquire a permit
     */
    acquire(): Promise<() => void>;
    /**
     * Release a permit
     */
    private release;
    /**
     * Execute function with semaphore
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
}
