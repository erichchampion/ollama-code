/**
 * Enhanced Error Handling and Recovery System
 *
 * Provides graceful degradation and intelligent error recovery:
 * - Automatic retry mechanisms with exponential backoff
 * - Fallback strategies for different error types
 * - User-friendly error messages with suggestions
 * - Context-aware error handling
 */
import { UserError } from '../errors/types.js';
interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
}
interface ErrorContext {
    command: string;
    args: any[];
    timestamp: number;
    attempt: number;
    userAgent?: string;
    sessionId?: string;
}
export declare class ErrorRecoveryManager {
    private fallbackStrategies;
    private retryConfig;
    constructor();
    /**
     * Execute operation with automatic retry and recovery
     */
    executeWithRecovery<T>(operation: () => Promise<T>, context: ErrorContext, customRetryConfig?: Partial<RetryConfig>): Promise<T>;
    /**
     * Register a fallback strategy for specific error types
     */
    registerFallback(errorType: string, fallback: () => Promise<any>, description: string): void;
    /**
     * Handle AI-specific errors with intelligent fallbacks
     */
    handleAIError(error: Error, context: ErrorContext): Promise<any>;
    /**
     * Create user-friendly error messages
     */
    createUserFriendlyError(error: Error, context: ErrorContext): UserError;
    /**
     * Attempt to recover from specific error
     */
    private attemptRecovery;
    /**
     * Try final fallback when all retries fail
     */
    private tryFinalFallback;
    /**
     * Handle connection errors
     */
    private handleConnectionError;
    /**
     * Handle model not found errors
     */
    private handleModelError;
    /**
     * Handle context window errors
     */
    private handleContextError;
    /**
     * Handle timeout errors
     */
    private handleTimeoutError;
    /**
     * Categorize error for fallback selection
     */
    private categorizeError;
    /**
     * Check if command is AI-related
     */
    private isAICommand;
    /**
     * Register default fallback strategies
     */
    private registerDefaultFallbacks;
    /**
     * Simple delay utility
     */
    private delay;
    /**
     * Dispose of the error recovery manager and clean up resources
     */
    dispose(): Promise<void>;
}
export {};
