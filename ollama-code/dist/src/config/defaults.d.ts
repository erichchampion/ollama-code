/**
 * Default Configuration
 *
 * This file is now simplified - defaults are defined in the schema.ts file
 * using Zod defaults, which provides better type safety and validation.
 *
 * @deprecated - Use configSchema defaults instead
 */
import { ConfigType } from './schema.js';
/**
 * Get default configuration values from the schema
 */
export declare function getDefaultConfig(): ConfigType;
/**
 * @deprecated - Use getDefaultConfig() instead
 */
export declare const defaultConfig: {
    logLevel: "verbose" | "error" | "warn" | "info" | "debug" | "trace";
    api: {
        key?: string | undefined;
        baseUrl?: string | undefined;
        version?: string | undefined;
        timeout?: number | undefined;
    };
    ollama: {
        baseUrl: string;
        timeout: number;
        retryOptions: {
            maxRetries: number;
            initialDelayMs: number;
            maxDelayMs: number;
        };
    };
    ai: {
        defaultModel: string;
        defaultTemperature: number;
        defaultTopP: number;
        defaultTopK: number;
        defaultRepeatPenalty: number;
    };
    telemetry: {
        enabled: boolean;
        anonymizeData: boolean;
        errorReporting: boolean;
    };
    terminal: {
        theme: "system" | "dark" | "light";
        showProgressIndicators: boolean;
        useColors: boolean;
        codeHighlighting: boolean;
        maxHeight?: number | undefined;
        maxWidth?: number | undefined;
    };
    codeAnalysis: {
        indexDepth: number;
        excludePatterns: string[];
        includePatterns: string[];
        maxFileSize: number;
        scanTimeout: number;
    };
    git: {
        preferredRemote: string;
        useSsh: boolean;
        useGpg: boolean;
        signCommits: boolean;
        preferredBranch?: string | undefined;
    };
    editor: {
        tabWidth: number;
        insertSpaces: boolean;
        formatOnSave: boolean;
        preferredLauncher?: string | undefined;
    };
    workspace?: string | undefined;
};
