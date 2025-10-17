/**
 * Configuration Helpers
 *
 * Utility functions for creating default/minimal configurations
 */

import type { AppConfig } from '../types/app-interfaces.js';

/**
 * Get a minimal default configuration
 * Useful for initialization when full config loading is not needed or might fail
 */
export function getMinimalConfig(): AppConfig {
  return {
    api: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      version: 'v1',
      timeout: 30000
    },
    ai: {
      model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:latest',
      temperature: 0.7,
      maxTokens: 4096,
      maxHistoryLength: 20
    },
    terminal: {
      theme: 'system',
      useColors: true,
      showProgressIndicators: true,
      codeHighlighting: true
    },
    telemetry: {
      enabled: true,
      submissionInterval: 1800000, // 30 minutes
      maxQueueSize: 100,
      autoSubmit: true
    },
    fileOps: {
      maxReadSizeBytes: 10485760 // 10MB
    },
    execution: {
      shell: process.env.SHELL || 'bash'
    },
    logger: {
      level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
      timestamps: true,
      colors: true
    },
    version: '0.2.29'
  };
}

/**
 * Merge a partial config with defaults
 */
export function mergeWithDefaults(partial: Partial<AppConfig>): AppConfig {
  const defaults = getMinimalConfig();
  return {
    ...defaults,
    ...partial,
    api: { ...defaults.api, ...(partial.api || {}) },
    ai: { ...defaults.ai, ...(partial.ai || {}) },
    terminal: { ...defaults.terminal, ...(partial.terminal || {}) },
    telemetry: { ...defaults.telemetry, ...(partial.telemetry || {}) },
    fileOps: { ...defaults.fileOps, ...(partial.fileOps || {}) },
    execution: { ...defaults.execution, ...(partial.execution || {}) },
    logger: { ...defaults.logger, ...(partial.logger || {}) }
  };
}
