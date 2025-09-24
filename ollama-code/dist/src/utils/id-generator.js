/**
 * ID Generation Utilities
 *
 * Secure and reliable ID generation functions to replace
 * unsafe Math.random() based implementations.
 */
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
/**
 * Generate a cryptographically secure random ID
 */
export function generateSecureId(prefix = 'id', length = 16) {
    const randomPart = randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
    return `${prefix}_${Date.now()}_${randomPart}`;
}
/**
 * Generate an operation ID for streaming operations
 */
export function generateOperationId() {
    return generateSecureId('op', 9);
}
/**
 * Generate a session ID
 */
export function generateSessionId() {
    return generateSecureId('session', 12);
}
/**
 * Generate a unique task ID
 */
export function generateTaskId() {
    return generateSecureId('task', 8);
}
/**
 * Generate a client ID for WebSocket connections (replaces duplicate implementations)
 */
export function generateClientId() {
    return generateSecureId('client', 9);
}
/**
 * Generate a telemetry client ID (anonymous UUID)
 */
export function generateTelemetryClientId() {
    return uuidv4();
}
/**
 * Generate a request ID for tracking requests
 */
export function generateRequestId() {
    return generateSecureId('req', 8);
}
//# sourceMappingURL=id-generator.js.map