/**
 * Service Registration
 *
 * Registers all services with the dependency injection container,
 * replacing singleton patterns with proper dependency injection.
 */
/**
 * Register all core services
 */
export declare function registerServices(): Promise<void>;
/**
 * Service accessor functions for backward compatibility
 */
export declare function getCommandRegistry(): Promise<any>;
export declare function getToolRegistry(): Promise<any>;
export declare function getMemoryManager(): Promise<any>;
export declare function getAICacheManager(): Promise<any>;
export declare function getProgressManager(): Promise<any>;
export declare function getErrorRecoveryManager(): Promise<any>;
export declare function getConfigValidator(): Promise<any>;
export declare function getLazyLoader(): Promise<any>;
export declare function getMCPServer(): Promise<any>;
export declare function getAIClient(): Promise<any>;
export declare function getEnhancedClient(): Promise<any>;
export declare function getProjectContext(): Promise<any>;
export declare function getTerminal(): Promise<any>;
/**
 * Initialize all services needed for a specific operation
 */
export declare function initializeServicesForOperation(operation: 'ai' | 'tools' | 'mcp' | 'all'): Promise<void>;
/**
 * Clean up all services
 */
export declare function disposeServices(): Promise<void>;
