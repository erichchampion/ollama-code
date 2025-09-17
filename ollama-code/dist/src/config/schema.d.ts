/**
 * Configuration Schema
 *
 * Defines the structure and validation rules for the application configuration.
 * Uses Zod for runtime type validation.
 */
import { z } from 'zod';
declare const LogLevel: z.ZodEnum<{
    verbose: "verbose";
    error: "error";
    warn: "warn";
    info: "info";
    debug: "debug";
    trace: "trace";
}>;
declare const ApiConfigSchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const OllamaConfigSchema: z.ZodObject<{
    baseUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryOptions: z.ZodDefault<z.ZodObject<{
        maxRetries: z.ZodDefault<z.ZodNumber>;
        initialDelayMs: z.ZodDefault<z.ZodNumber>;
        maxDelayMs: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const AiConfigSchema: z.ZodObject<{
    defaultModel: z.ZodDefault<z.ZodString>;
    defaultTemperature: z.ZodDefault<z.ZodNumber>;
    defaultTopP: z.ZodDefault<z.ZodNumber>;
    defaultTopK: z.ZodDefault<z.ZodNumber>;
    defaultRepeatPenalty: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
declare const TelemetryConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    anonymizeData: z.ZodDefault<z.ZodBoolean>;
    errorReporting: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const TerminalConfigSchema: z.ZodObject<{
    theme: z.ZodDefault<z.ZodEnum<{
        system: "system";
        dark: "dark";
        light: "light";
    }>>;
    showProgressIndicators: z.ZodDefault<z.ZodBoolean>;
    useColors: z.ZodDefault<z.ZodBoolean>;
    codeHighlighting: z.ZodDefault<z.ZodBoolean>;
    maxHeight: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const CodeAnalysisConfigSchema: z.ZodObject<{
    indexDepth: z.ZodDefault<z.ZodNumber>;
    excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString>>;
    includePatterns: z.ZodDefault<z.ZodArray<z.ZodString>>;
    maxFileSize: z.ZodDefault<z.ZodNumber>;
    scanTimeout: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
declare const GitConfigSchema: z.ZodObject<{
    preferredRemote: z.ZodDefault<z.ZodString>;
    preferredBranch: z.ZodOptional<z.ZodString>;
    useSsh: z.ZodDefault<z.ZodBoolean>;
    useGpg: z.ZodDefault<z.ZodBoolean>;
    signCommits: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const EditorConfigSchema: z.ZodObject<{
    preferredLauncher: z.ZodOptional<z.ZodString>;
    tabWidth: z.ZodDefault<z.ZodNumber>;
    insertSpaces: z.ZodDefault<z.ZodBoolean>;
    formatOnSave: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
declare const PathsConfigSchema: z.ZodObject<{
    home: z.ZodOptional<z.ZodString>;
    app: z.ZodOptional<z.ZodString>;
    cache: z.ZodOptional<z.ZodString>;
    logs: z.ZodOptional<z.ZodString>;
    workspace: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const configSchema: z.ZodObject<{
    workspace: z.ZodOptional<z.ZodString>;
    logLevel: z.ZodDefault<z.ZodEnum<{
        verbose: "verbose";
        error: "error";
        warn: "warn";
        info: "info";
        debug: "debug";
        trace: "trace";
    }>>;
    api: z.ZodDefault<z.ZodObject<{
        key: z.ZodOptional<z.ZodString>;
        baseUrl: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    ollama: z.ZodDefault<z.ZodObject<{
        baseUrl: z.ZodDefault<z.ZodString>;
        timeout: z.ZodDefault<z.ZodNumber>;
        retryOptions: z.ZodDefault<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            initialDelayMs: z.ZodDefault<z.ZodNumber>;
            maxDelayMs: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    ai: z.ZodDefault<z.ZodObject<{
        defaultModel: z.ZodDefault<z.ZodString>;
        defaultTemperature: z.ZodDefault<z.ZodNumber>;
        defaultTopP: z.ZodDefault<z.ZodNumber>;
        defaultTopK: z.ZodDefault<z.ZodNumber>;
        defaultRepeatPenalty: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    telemetry: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        anonymizeData: z.ZodDefault<z.ZodBoolean>;
        errorReporting: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    terminal: z.ZodDefault<z.ZodObject<{
        theme: z.ZodDefault<z.ZodEnum<{
            system: "system";
            dark: "dark";
            light: "light";
        }>>;
        showProgressIndicators: z.ZodDefault<z.ZodBoolean>;
        useColors: z.ZodDefault<z.ZodBoolean>;
        codeHighlighting: z.ZodDefault<z.ZodBoolean>;
        maxHeight: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    codeAnalysis: z.ZodDefault<z.ZodObject<{
        indexDepth: z.ZodDefault<z.ZodNumber>;
        excludePatterns: z.ZodDefault<z.ZodArray<z.ZodString>>;
        includePatterns: z.ZodDefault<z.ZodArray<z.ZodString>>;
        maxFileSize: z.ZodDefault<z.ZodNumber>;
        scanTimeout: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    git: z.ZodDefault<z.ZodObject<{
        preferredRemote: z.ZodDefault<z.ZodString>;
        preferredBranch: z.ZodOptional<z.ZodString>;
        useSsh: z.ZodDefault<z.ZodBoolean>;
        useGpg: z.ZodDefault<z.ZodBoolean>;
        signCommits: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    editor: z.ZodDefault<z.ZodObject<{
        preferredLauncher: z.ZodOptional<z.ZodString>;
        tabWidth: z.ZodDefault<z.ZodNumber>;
        insertSpaces: z.ZodDefault<z.ZodBoolean>;
        formatOnSave: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    paths: z.ZodOptional<z.ZodObject<{
        home: z.ZodOptional<z.ZodString>;
        app: z.ZodOptional<z.ZodString>;
        cache: z.ZodOptional<z.ZodString>;
        logs: z.ZodOptional<z.ZodString>;
        workspace: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    lastUpdateCheck: z.ZodOptional<z.ZodNumber>;
    recentWorkspaces: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ConfigType = z.infer<typeof configSchema>;
export { LogLevel, ApiConfigSchema, OllamaConfigSchema, AiConfigSchema, TelemetryConfigSchema, TerminalConfigSchema, CodeAnalysisConfigSchema, GitConfigSchema, EditorConfigSchema, PathsConfigSchema };
