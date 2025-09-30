/**
 * Safety-Enhanced Interactive Mode
 *
 * Phase 2.4: Interactive Mode Integration
 * Integrates the safety system with the interactive mode for secure file operations
 */
import { logger } from '../utils/logger.js';
import { OptimizedEnhancedMode } from './optimized-enhanced-mode.js';
import { SAFETY_MODE_DEFAULTS } from '../constants.js';
export class SafetyEnhancedMode {
    optimizedMode;
    constructor(options = {}) {
        // Add safety-specific options
        const safetyOptions = {
            ...options,
            ...SAFETY_MODE_DEFAULTS
        };
        // Composition instead of inheritance to avoid private member issues
        this.optimizedMode = new OptimizedEnhancedMode(safetyOptions);
    }
    /**
     * Start safety-enhanced interactive mode
     */
    async start() {
        try {
            logger.info('Starting safety-enhanced interactive mode');
            // Display safety notification
            console.log('\n🛡️  Safety-Enhanced Interactive Mode');
            console.log('File operations will be analyzed for safety and may require approval\n');
            // Start the optimized mode
            await this.optimizedMode.start();
        }
        catch (error) {
            logger.error('Safety-enhanced interactive mode failed:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=safety-enhanced-mode.js.map