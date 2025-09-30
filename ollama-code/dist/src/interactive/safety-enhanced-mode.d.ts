/**
 * Safety-Enhanced Interactive Mode
 *
 * Phase 2.4: Interactive Mode Integration
 * Integrates the safety system with the interactive mode for secure file operations
 */
import { OptimizedEnhancedModeOptions } from './optimized-enhanced-mode.js';
export declare class SafetyEnhancedMode {
    private optimizedMode;
    constructor(options?: OptimizedEnhancedModeOptions);
    /**
     * Start safety-enhanced interactive mode
     */
    start(): Promise<void>;
}
