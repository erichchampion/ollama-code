/**
 * Async Mutex for Thread-Safe Operations
 *
 * Provides mutual exclusion for async operations to prevent race conditions
 * in scenarios where multiple async operations might access shared resources.
 */
export class AsyncMutex {
    promise = Promise.resolve();
    /**
     * Acquire the mutex and execute the provided function
     */
    async lock(fn) {
        const release = await this.acquire();
        try {
            return await fn();
        }
        finally {
            release();
        }
    }
    /**
     * Acquire the mutex
     */
    async acquire() {
        let release;
        const acquiredPromise = new Promise(resolve => {
            release = resolve;
        });
        const currentPromise = this.promise;
        this.promise = this.promise.then(() => acquiredPromise);
        await currentPromise;
        // Ensure release function is defined before returning
        if (!release) {
            throw new Error('Mutex release function not properly initialized');
        }
        return release;
    }
}
/**
 * Simple semaphore for limiting concurrent operations
 */
export class Semaphore {
    permits;
    waiting = [];
    constructor(permits) {
        this.permits = permits;
    }
    /**
     * Acquire a permit
     */
    async acquire() {
        return new Promise(resolve => {
            if (this.permits > 0) {
                this.permits--;
                resolve(() => this.release());
            }
            else {
                this.waiting.push(() => {
                    this.permits--;
                    resolve(() => this.release());
                });
            }
        });
    }
    /**
     * Release a permit
     */
    release() {
        this.permits++;
        if (this.waiting.length > 0) {
            const next = this.waiting.shift();
            next();
        }
    }
    /**
     * Execute function with semaphore
     */
    async execute(fn) {
        const release = await this.acquire();
        try {
            return await fn();
        }
        finally {
            release();
        }
    }
}
//# sourceMappingURL=async-mutex.js.map