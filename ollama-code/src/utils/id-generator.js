"use strict";
/**
 * ID Generation Utilities
 *
 * Secure and reliable ID generation functions to replace
 * unsafe Math.random() based implementations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureId = generateSecureId;
exports.generateOperationId = generateOperationId;
exports.generateSessionId = generateSessionId;
exports.generateTaskId = generateTaskId;
exports.generateClientId = generateClientId;
exports.generateTelemetryClientId = generateTelemetryClientId;
exports.generateRequestId = generateRequestId;
exports.generateReviewId = generateReviewId;
exports.generateFindingId = generateFindingId;
exports.generateRegressionId = generateRegressionId;
exports.generateSnapshotId = generateSnapshotId;
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
/**
 * Generate a cryptographically secure random ID
 */
function generateSecureId(prefix = 'id', length = 16) {
    const randomPart = (0, crypto_1.randomBytes)(Math.ceil(length / 2)).toString('hex').substring(0, length);
    return `${prefix}_${Date.now()}_${randomPart}`;
}
/**
 * Generate an operation ID for streaming operations
 */
function generateOperationId() {
    return generateSecureId('op', 9);
}
/**
 * Generate a session ID
 */
function generateSessionId() {
    return generateSecureId('session', 12);
}
/**
 * Generate a unique task ID
 */
function generateTaskId() {
    return generateSecureId('task', 8);
}
/**
 * Generate a client ID for WebSocket connections (replaces duplicate implementations)
 */
function generateClientId() {
    return generateSecureId('client', 9);
}
/**
 * Generate a telemetry client ID (anonymous UUID)
 */
function generateTelemetryClientId() {
    return (0, uuid_1.v4)();
}
/**
 * Generate a request ID for tracking requests
 */
function generateRequestId() {
    return generateSecureId('req', 8);
}
/**
 * VCS-specific ID generators (replaces deprecated substr() calls)
 */
/**
 * Generate a review ID for pull request reviews
 */
function generateReviewId() {
    return generateSecureId('review', 9);
}
/**
 * Generate a finding ID for review findings
 */
function generateFindingId() {
    return generateSecureId('finding', 9);
}
/**
 * Generate a regression analysis ID
 */
function generateRegressionId() {
    return generateSecureId('regression', 9);
}
/**
 * Generate a quality snapshot ID
 */
function generateSnapshotId() {
    return generateSecureId('snapshot', 9);
}
//# sourceMappingURL=id-generator.js.map