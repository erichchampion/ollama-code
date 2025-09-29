/**
 * Terminal Compatibility Layer
 *
 * Provides graceful fallback terminal implementation for non-interactive
 * environments (CI/CD, background processes, non-TTY terminals).
 */
import { logger } from '../utils/logger.js';
import { initTerminal } from './index.js';
/**
 * Full-featured terminal for interactive environments
 */
class InteractiveTerminal {
    terminal;
    isInteractive = true;
    constructor(terminal) {
        this.terminal = terminal;
    }
    get capabilities() {
        return {
            supportsColors: true,
            supportsPrompts: true,
            supportsSpinners: true,
            supportsProgress: true,
            width: process.stdout.columns || 80,
            height: process.stdout.rows || 24
        };
    }
    success(message) {
        this.terminal.success(message);
    }
    error(message) {
        this.terminal.error(message);
    }
    warn(message) {
        this.terminal.warn(message);
    }
    info(message) {
        this.terminal.info(message);
    }
    debug(message) {
        logger.debug(message);
    }
    clear() {
        this.terminal.clear();
    }
    write(message) {
        this.terminal.write(message);
    }
    async prompt(options) {
        return this.terminal.prompt(options);
    }
}
/**
 * Fallback terminal for non-interactive environments
 */
class FallbackTerminal {
    isInteractive = false;
    get capabilities() {
        return {
            supportsColors: false,
            supportsPrompts: false,
            supportsSpinners: false,
            supportsProgress: false,
            width: 80,
            height: 24
        };
    }
    success(message) {
        console.log(`✅ ${message}`);
    }
    error(message) {
        console.error(`❌ ${message}`);
    }
    warn(message) {
        console.warn(`⚠️  ${message}`);
    }
    info(message) {
        console.log(`ℹ️  ${message}`);
    }
    debug(message) {
        logger.debug(message);
    }
    clear() {
        // Non-interactive terminals typically shouldn't clear
        console.log('\\n'.repeat(3));
    }
    write(message) {
        process.stdout.write(message);
    }
    async prompt(options) {
        // Return default values for non-interactive environments
        const result = {};
        switch (options.type) {
            case 'confirm':
                result[options.name] = options.default !== undefined ? options.default : true;
                break;
            case 'select':
                if (options.choices && options.choices.length > 0) {
                    const firstChoice = options.choices[0];
                    result[options.name] = typeof firstChoice === 'string' ? firstChoice : firstChoice.value;
                }
                else {
                    result[options.name] = options.default;
                }
                break;
            case 'multiselect':
                result[options.name] = options.default || [];
                break;
            default: // 'input'
                result[options.name] = options.default || '';
                break;
        }
        // Log the auto-selected choice for transparency
        this.info(`Auto-selected: ${options.message} → ${JSON.stringify(result[options.name])}`);
        return result;
    }
}
/**
 * Enhanced fallback terminal with better formatting
 */
class EnhancedFallbackTerminal extends FallbackTerminal {
    logLevel;
    constructor(logLevel = 'info') {
        super();
        this.logLevel = logLevel;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    success(message) {
        if (this.shouldLog('info')) {
            console.log(`[SUCCESS] ${message}`);
        }
    }
    error(message) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${message}`);
        }
    }
    warn(message) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${message}`);
        }
    }
    info(message) {
        if (this.shouldLog('info')) {
            console.log(`[INFO] ${message}`);
        }
    }
    debug(message) {
        if (this.shouldLog('debug')) {
            console.log(`[DEBUG] ${message}`);
        }
    }
    write(message) {
        if (this.shouldLog('info')) {
            process.stdout.write(message);
        }
    }
}
/**
 * Silent terminal for environments where output should be minimal
 */
class SilentTerminal {
    isInteractive = false;
    get capabilities() {
        return {
            supportsColors: false,
            supportsPrompts: false,
            supportsSpinners: false,
            supportsProgress: false,
            width: 80,
            height: 24
        };
    }
    success(message) {
        // Silent - only log to logger
        logger.info(`SUCCESS: ${message}`);
    }
    error(message) {
        // Errors always shown
        console.error(`ERROR: ${message}`);
    }
    warn(message) {
        // Silent - only log to logger
        logger.warn(`WARN: ${message}`);
    }
    info(message) {
        // Silent - only log to logger
        logger.info(`INFO: ${message}`);
    }
    debug(message) {
        logger.debug(message);
    }
    clear() {
        // No-op for silent terminal
    }
    write(message) {
        // Silent - only log to logger
        logger.info(`OUTPUT: ${message}`);
    }
    async prompt(options) {
        const result = {};
        result[options.name] = options.default || '';
        logger.info(`Auto-prompt: ${options.message} → ${JSON.stringify(result[options.name])}`);
        return result;
    }
}
/**
 * Terminal compatibility layer that automatically selects the best terminal
 * implementation based on the environment.
 */
export class TerminalCompatibilityLayer {
    /**
     * Create a compatible terminal instance
     */
    static async createCompatibleTerminal(options = {}) {
        const { preferInteractive = true, logLevel = 'info', silent = false } = options;
        // If silent mode requested
        if (silent) {
            logger.debug('Using silent terminal for minimal output');
            return new SilentTerminal();
        }
        // Try to create interactive terminal first if preferred
        if (preferInteractive && TerminalCompatibilityLayer.isInteractiveEnvironment()) {
            try {
                const terminal = await initTerminal({});
                logger.debug('Created interactive terminal');
                return new InteractiveTerminal(terminal);
            }
            catch (error) {
                logger.debug('Interactive terminal creation failed:', error);
                // Fall through to fallback
            }
        }
        // Use enhanced fallback terminal
        logger.debug('Using enhanced fallback terminal');
        return new EnhancedFallbackTerminal(logLevel);
    }
    /**
     * Check if we're in an interactive environment
     */
    static isInteractiveEnvironment() {
        // Check for TTY
        if (!process.stdout.isTTY || !process.stdin.isTTY) {
            return false;
        }
        // Check for CI environments
        const ciEnvVars = [
            'CI',
            'CONTINUOUS_INTEGRATION',
            'GITHUB_ACTIONS',
            'GITLAB_CI',
            'CIRCLECI',
            'JENKINS_URL',
            'TRAVIS',
            'APPVEYOR'
        ];
        for (const envVar of ciEnvVars) {
            if (process.env[envVar]) {
                return false;
            }
        }
        // Check terminal environment
        const term = process.env.TERM;
        if (!term || term === 'dumb') {
            return false;
        }
        return true;
    }
    /**
     * Get environment information for debugging
     */
    static getEnvironmentInfo() {
        return {
            isInteractive: TerminalCompatibilityLayer.isInteractiveEnvironment(),
            hasTTY: process.stdout.isTTY && process.stdin.isTTY,
            isCI: !!(process.env.CI || process.env.CONTINUOUS_INTEGRATION),
            terminalType: process.env.TERM || 'unknown',
            platform: process.platform
        };
    }
    /**
     * Create terminal with automatic environment detection
     */
    static async createAutoTerminal() {
        const envInfo = TerminalCompatibilityLayer.getEnvironmentInfo();
        if (envInfo.isCI) {
            // CI environment - use enhanced fallback with minimal output
            return new EnhancedFallbackTerminal('warn');
        }
        if (!envInfo.hasTTY) {
            // Non-TTY environment - use regular fallback
            return new EnhancedFallbackTerminal('info');
        }
        if (envInfo.isInteractive) {
            // Try interactive terminal
            try {
                const terminal = await initTerminal({});
                return new InteractiveTerminal(terminal);
            }
            catch (error) {
                logger.warn('Failed to create interactive terminal, using fallback:', error);
                return new EnhancedFallbackTerminal('info');
            }
        }
        // Default to enhanced fallback
        return new EnhancedFallbackTerminal('info');
    }
}
/**
 * Convenience function to create a compatible terminal
 */
export async function createCompatibleTerminal(options) {
    return TerminalCompatibilityLayer.createCompatibleTerminal(options);
}
/**
 * Convenience function for automatic terminal creation
 */
export async function createAutoTerminal() {
    return TerminalCompatibilityLayer.createAutoTerminal();
}
//# sourceMappingURL=compatibility-layer.js.map