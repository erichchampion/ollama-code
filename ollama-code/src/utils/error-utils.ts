/**
 * Error Handling Utilities
 *
 * Centralized error handling functions to replace duplicate error patterns
 */

/**
 * Extract error message safely from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, context?: string): { error: string; context?: string } {
  const message = getErrorMessage(error);
  return {
    error: context ? `${context}: ${message}` : message,
    ...(context && { context })
  };
}

/**
 * Wrap error with context information
 */
export function wrapError(error: unknown, context: string): Error {
  const message = getErrorMessage(error);
  const wrappedError = new Error(`${context}: ${message}`);

  // Preserve original stack trace if available
  if (error instanceof Error && error.stack) {
    wrappedError.stack = error.stack;
  }

  return wrappedError;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('timeout') || message.includes('timed out');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('network') ||
         message.includes('connection') ||
         message.includes('econnrefused') ||
         message.includes('enotfound');
}

/**
 * Format error for logging with stack trace
 */
export function formatErrorForLogging(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  const contextStr = context ? `[${context}] ` : '';

  if (error instanceof Error && error.stack) {
    return `${contextStr}${message}\nStack: ${error.stack}`;
  }

  return `${contextStr}${message}`;
}

/**
 * Create a safe error object for JSON serialization
 */
export function serializeError(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
  code?: string | number;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: (error as any).code
    };
  }

  return {
    message: getErrorMessage(error)
  };
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw wrapError(error, `Failed after ${maxRetries} attempts`);
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}