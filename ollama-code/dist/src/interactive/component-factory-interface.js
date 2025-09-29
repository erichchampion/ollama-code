/**
 * Component Factory Interface
 *
 * Defines the common interface that all component factories must implement.
 * This eliminates the need for type casting between different factory implementations.
 */
/**
 * Abstract base class for component factories
 */
export class BaseComponentFactory {
    onProgressCallback;
    onProgress(callback) {
        this.onProgressCallback = callback;
    }
    notifyProgress(progress) {
        if (this.onProgressCallback) {
            // Use setTimeout to break potential circular dependency chains
            // This ensures progress notifications are processed asynchronously
            setTimeout(() => {
                try {
                    this.onProgressCallback(progress);
                }
                catch (error) {
                    // Log but don't throw - progress notification failures shouldn't break component loading
                    console.warn('Progress notification failed:', error);
                }
            }, 0);
        }
    }
}
/**
 * Type guard to check if factory is enhanced
 */
export function isEnhancedFactory(factory) {
    return 'getComponentState' in factory &&
        'getAllComponentStates' in factory &&
        'clearComponent' in factory;
}
/**
 * Type guard to check if factory supports preloading
 */
export function supportsPreloading(factory) {
    return 'preloadComponents' in factory && typeof factory.preloadComponents === 'function';
}
/**
 * Create a component factory based on options
 */
export async function createComponentFactory(options = {}) {
    if (options.enhanced) {
        const { getEnhancedComponentFactory } = await import('./enhanced-component-factory.js');
        const factory = getEnhancedComponentFactory();
        return {
            factory,
            type: 'enhanced',
            capabilities: factory.getCapabilities()
        };
    }
    else {
        const { getComponentFactory } = await import('./component-factory.js');
        const factory = getComponentFactory();
        return {
            factory,
            type: 'basic',
            capabilities: factory.getCapabilities()
        };
    }
}
//# sourceMappingURL=component-factory-interface.js.map