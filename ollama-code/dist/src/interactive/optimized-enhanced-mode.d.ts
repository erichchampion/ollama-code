/**
 * Optimized Enhanced Interactive Mode
 *
 * Implements lazy loading, streaming initialization, and progressive enhancement
 * to resolve complex request handling issues and improve startup performance.
 */
import { ComponentType } from './component-factory.js';
export interface OptimizedEnhancedModeOptions {
    autoApprove?: boolean;
    confirmHighRisk?: boolean;
    verbosity?: 'concise' | 'detailed' | 'explanatory';
    preferredApproach?: 'conservative' | 'balanced' | 'aggressive';
    enableBackgroundLoading?: boolean;
    performanceMonitoring?: boolean;
    fallbackMode?: boolean;
}
export declare class OptimizedEnhancedMode {
    private componentFactory;
    private streamingInitializer?;
    private statusTracker;
    private performanceMonitor;
    private terminal?;
    private nlRouter?;
    private conversationManager?;
    private running;
    private options;
    private initializationResult?;
    private componentsReady;
    private pendingTaskPlan?;
    private pendingRoutingResult?;
    constructor(options?: OptimizedEnhancedModeOptions);
    /**
     * Start the optimized enhanced interactive mode
     */
    start(): Promise<void>;
    /**
     * Check if a component is ready for use
     */
    isComponentReady(component: ComponentType): boolean;
    /**
     * Get system status information
     */
    getSystemStatus(): {
        ready: boolean;
        components: string[];
        performance: string;
        capabilities: string[];
    };
    /**
     * Fast initialization of absolutely essential components
     */
    private fastInitialization;
    /**
     * Streaming initialization with progressive enhancement
     */
    private streamingInitialization;
    /**
     * Main interactive loop with optimized component access
     */
    private runOptimizedMainLoop;
    /**
     * Process user input with smart component loading
     */
    private processUserInputOptimized;
    /**
     * Analyze what components are needed for a request
     */
    private analyzeRequiredComponents;
    /**
     * Get appropriate timeout for component type (uses centralized config)
     */
    private getComponentTimeout;
    /**
     * Create fallback component when main component fails
     */
    private createFallbackComponent;
    /**
     * Build routing context with available components
     */
    private buildRoutingContext;
    /**
     * Handle simple AI request without complex routing
     */
    private handleSimpleAIRequest;
    /**
     * Handle routing result with appropriate processing
     */
    private handleRoutingResult;
    /**
     * Handle pending task plan responses
     */
    private handlePendingTaskPlanResponse;
    /**
     * Execute pending plan with available components
     */
    private executePendingPlan;
    /**
     * Get user input with timeout protection
     */
    private getUserInput;
    /**
     * Handle special commands
     */
    private handleSpecialCommands;
    /**
     * Display help information
     */
    private displayHelp;
    /**
     * Display system status
     */
    private displayStatus;
    /**
     * Display performance metrics
     */
    private displayPerformance;
    /**
     * Display component status
     */
    private displayComponents;
    /**
     * Display welcome message (simplified to avoid circular dependency)
     */
    private displayWelcomeMessage;
    /**
     * Mark essential components as ready
     */
    private markEssentialComponentsReady;
    /**
     * Setup event handlers for component tracking
     */
    private setupEventHandlers;
    /**
     * Handle errors with graceful degradation
     */
    private handleError;
    /**
     * Start fallback mode when full mode fails
     */
    private startFallbackMode;
    /**
     * Cleanup resources
     */
    private cleanup;
}
/**
 * Create and start optimized enhanced interactive mode
 */
export declare function startOptimizedEnhancedMode(options?: OptimizedEnhancedModeOptions): Promise<void>;
export default OptimizedEnhancedMode;
