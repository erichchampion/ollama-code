/**
 * ID Generation Utilities
 *
 * Secure and reliable ID generation functions to replace
 * unsafe Math.random() based implementations.
 */

import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random ID
 */
export function generateSecureId(prefix: string = 'id', length: number = 16): string {
  const randomPart = randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
  return `${prefix}_${Date.now()}_${randomPart}`;
}

/**
 * Generate an operation ID for streaming operations
 */
export function generateOperationId(): string {
  return generateSecureId('op', 9);
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return generateSecureId('session', 12);
}

/**
 * Generate a unique task ID
 */
export function generateTaskId(): string {
  return generateSecureId('task', 8);
}