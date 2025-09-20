/**
 * Streaming Configuration Constants
 *
 * Centralized configuration for streaming operations to prevent
 * hardcoded values and ensure consistency across the application.
 */
export declare const STREAMING_DEFAULTS: {
    readonly PROGRESS_INTERVAL: 500;
    readonly MAX_UPDATES_PER_SECOND: 4;
    readonly ESTIMATED_DURATION: 5000;
    readonly THINKING_STEP_BASE_DELAY: 200;
    readonly THINKING_STEP_MAX_DELAY: 300;
    readonly BRIEF_PAUSE_DELAY: 50;
    readonly COMMAND_PREP_DELAY: 100;
    readonly MAX_PROCESSING_TIME: 50;
    readonly SPINNER_UPDATE_INTERVAL: 100;
    readonly PROGRESS_THRESHOLDS: {
        readonly STARTED: 0;
        readonly PREPARATION: 20;
        readonly EXECUTION: 50;
        readonly PROCESSING: 90;
        readonly FINALIZATION: 95;
        readonly COMPLETED: 100;
    };
    readonly PROGRESS_BOUNDARIES: {
        readonly GETTING_STARTED: 25;
        readonly PROCESSING: 50;
        readonly MAKING_PROGRESS: 75;
        readonly ALMOST_DONE: 95;
    };
};
export declare const STREAMING_CONFIG_DEFAULTS: {
    readonly enableStreaming: true;
    readonly progressInterval: 500;
    readonly maxUpdatesPerSecond: 4;
    readonly includeThinkingSteps: true;
};
export declare const FAST_PATH_CONFIG_DEFAULTS: {
    readonly enableFuzzyMatching: true;
    readonly fuzzyThreshold: 0.7;
    readonly enableAliases: true;
    readonly enablePatternExpansion: true;
    readonly maxProcessingTime: 50;
};
