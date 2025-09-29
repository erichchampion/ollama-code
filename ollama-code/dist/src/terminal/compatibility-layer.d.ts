/**
 * Terminal Compatibility Layer
 *
 * Provides graceful fallback terminal implementation for non-interactive
 * environments (CI/CD, background processes, non-TTY terminals).
 */
export interface CompatibleTerminal {
    success(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    clear(): void;
    write(message: string): void;
    prompt(options: PromptOptions): Promise<Record<string, any>>;
    isInteractive: boolean;
    capabilities: TerminalCapabilities;
}
export interface PromptOptions {
    type: 'input' | 'confirm' | 'select' | 'multiselect';
    name: string;
    message: string;
    default?: any;
    choices?: Array<string | {
        name: string;
        value: any;
    }>;
    validate?: (input: any) => boolean | string;
}
export interface TerminalCapabilities {
    supportsColors: boolean;
    supportsPrompts: boolean;
    supportsSpinners: boolean;
    supportsProgress: boolean;
    width: number;
    height: number;
}
/**
 * Terminal compatibility layer that automatically selects the best terminal
 * implementation based on the environment.
 */
export declare class TerminalCompatibilityLayer {
    /**
     * Create a compatible terminal instance
     */
    static createCompatibleTerminal(options?: {
        preferInteractive?: boolean;
        logLevel?: 'debug' | 'info' | 'warn' | 'error';
        silent?: boolean;
    }): Promise<CompatibleTerminal>;
    /**
     * Check if we're in an interactive environment
     */
    static isInteractiveEnvironment(): boolean;
    /**
     * Get environment information for debugging
     */
    static getEnvironmentInfo(): {
        isInteractive: boolean;
        hasTTY: boolean;
        isCI: boolean;
        terminalType: string;
        platform: string;
    };
    /**
     * Create terminal with automatic environment detection
     */
    static createAutoTerminal(): Promise<CompatibleTerminal>;
}
/**
 * Convenience function to create a compatible terminal
 */
export declare function createCompatibleTerminal(options?: Parameters<typeof TerminalCompatibilityLayer.createCompatibleTerminal>[0]): Promise<CompatibleTerminal>;
/**
 * Convenience function for automatic terminal creation
 */
export declare function createAutoTerminal(): Promise<CompatibleTerminal>;
