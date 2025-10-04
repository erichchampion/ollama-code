/**
 * Centralized Timeout Configuration
 *
 * Eliminates hardcoded timeout values throughout the codebase
 * and provides a single source of truth for all timeout settings.
 */
import { ComponentType } from './component-factory.js';
export declare const TIMEOUT_CONFIG: {
    readonly DEFAULT_SERVICE: 10000;
    readonly SERVICE_RETRY_DELAY_BASE: 1000;
    readonly SERVICE_RETRY_DELAY_MAX: 5000;
    readonly AI_CLIENT: 5000;
    readonly ENHANCED_CLIENT: 10000;
    readonly PROJECT_CONTEXT: 1000;
    readonly INTENT_ANALYZER: 3000;
    readonly CONVERSATION_MANAGER: 1000;
    readonly TASK_PLANNER: 5000;
    readonly ADVANCED_CONTEXT_MANAGER: 15000;
    readonly QUERY_DECOMPOSITION_ENGINE: 10000;
    readonly CODE_KNOWLEDGE_GRAPH: 25000;
    readonly MULTI_STEP_QUERY_PROCESSOR: 5000;
    readonly NATURAL_LANGUAGE_ROUTER: 3000;
    readonly COMPONENT_LOADING: 30000;
    readonly ROUTING_TIMEOUT: 15000;
    readonly PLAN_EXECUTION: 60000;
    readonly USER_INPUT: 300000;
    readonly BACKGROUND_CLEANUP: 5000;
    readonly AI_STREAMING: 120000;
    readonly DEPENDENCY_CHECK_INTERVAL: 100;
    readonly DEPENDENCY_WAIT_DEFAULT: 10000;
    readonly INITIALIZATION_DELAY: 100;
    readonly HEALTH_CHECK_INTERVAL: 30000;
    readonly HEALTH_CHECK_TIMEOUT: 5000;
    readonly MONITORING_INTERVAL: 5000;
    readonly SLOW_COMPONENT_THRESHOLD: 5000;
    readonly DEFAULT_RETRIES: 2;
    readonly MAX_RETRIES: 5;
};
/**
 * Get timeout for a specific component type
 */
export declare function getComponentTimeout(component: ComponentType): number;
/**
 * Calculate exponential backoff delay for retries
 */
export declare function getRetryDelay(attempt: number): number;
/**
 * Create a timeout promise that can be cancelled
 */
export declare function createCancellableTimeout(timeoutMs: number, errorMessage: string): {
    promise: Promise<never>;
    cancel: () => void;
};
