/**
 * Component Status Constants
 *
 * Centralized constants for component status values to eliminate
 * hardcoded strings and ensure consistency across the codebase.
 */
export declare const COMPONENT_STATUSES: {
    readonly NOT_LOADED: "not-loaded";
    readonly LOADING: "loading";
    readonly READY: "ready";
    readonly FAILED: "failed";
    readonly DEGRADED: "degraded";
};
export type ComponentStatusValue = typeof COMPONENT_STATUSES[keyof typeof COMPONENT_STATUSES];
export declare const COMPONENT_STATUS_VALUES: ("failed" | "ready" | "degraded" | "loading" | "not-loaded")[];
/**
 * Component status configuration
 */
export declare const COMPONENT_STATUS_CONFIG: {
    readonly DEGRADATION_THRESHOLD: 3;
    readonly HEALTH_CHECK_INTERVAL: 30000;
    readonly HEALTH_CHECK_DELAY: 5000;
    readonly SYSTEM_HEALTH_THRESHOLD: 0.8;
};
/**
 * Default component memory estimates (in MB)
 * These can be overridden by configuration
 */
export declare const DEFAULT_COMPONENT_MEMORY: {
    readonly aiClient: 20;
    readonly enhancedClient: 50;
    readonly projectContext: 30;
    readonly intentAnalyzer: 15;
    readonly taskPlanner: 25;
    readonly conversationManager: 10;
    readonly advancedContextManager: 40;
    readonly queryDecompositionEngine: 35;
    readonly codeKnowledgeGraph: 60;
    readonly multiStepQueryProcessor: 20;
    readonly naturalLanguageRouter: 15;
};
export declare const DEFAULT_FALLBACK_MEMORY = 10;
