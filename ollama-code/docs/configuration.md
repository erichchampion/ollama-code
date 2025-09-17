# Configuration Guide

This document provides comprehensive information about configuring the Ollama Code CLI tool.

## Configuration Overview

The Ollama Code CLI uses a hierarchical configuration system with:
- Type safety using Zod schemas
- Sensible defaults for all options
- Environment variable overrides
- Runtime configuration updates

## Configuration Sources

Configuration is loaded in this order:
1. Default values
2. Configuration file (`ollama-code.config.json`)
3. Environment variables (`OLLAMA_CODE_*`)
4. Command line arguments

## Key Configuration Sections

### AI Configuration
- `ai.defaultModel`: Default AI model (default: "qwen2.5-coder:latest")
- `ai.defaultTemperature`: Response creativity (0-2, default: 0.7)
- `ai.defaultTopP`: Top-p sampling (0-1, default: 0.9)
- `ai.defaultTopK`: Top-k sampling (default: 40)

### Ollama Configuration
- `ollama.baseUrl`: Server URL (default: "http://localhost:11434")
- `ollama.timeout`: Request timeout (default: 120000ms)
- `ollama.retryOptions.maxRetries`: Max retries (default: 3)

### Terminal Configuration
- `terminal.theme`: Theme (dark/light/system, default: system)
- `terminal.useColors`: Colored output (default: true)
- `terminal.codeHighlighting`: Syntax highlighting (default: true)

### Code Analysis Configuration
- `codeAnalysis.excludePatterns`: Files to exclude from analysis
- `codeAnalysis.maxFileSize`: Max file size to analyze (default: 1MB)
- `codeAnalysis.indexDepth`: Max directory depth (default: 3)

## Environment Variables

Use `OLLAMA_CODE_` prefix:
- `OLLAMA_CODE_AI_DEFAULT_MODEL`
- `OLLAMA_CODE_TERMINAL_THEME`
- `OLLAMA_CODE_OLLAMA_BASE_URL`

## Command Line Usage

```bash
# View configuration
ollama-code config

# Set values
ollama-code config ai.defaultModel llama3.2
ollama-code config terminal.theme dark

# View specific section
ollama-code config ai
```

## Configuration File Example

```json
{
  "logLevel": "debug",
  "ai": {
    "defaultModel": "llama3.2",
    "defaultTemperature": 0.5
  },
  "terminal": {
    "theme": "dark",
    "useColors": true
  },
  "codeAnalysis": {
    "excludePatterns": [
      "node_modules/**",
      "coverage/**",
      "**/*.test.js"
    ]
  }
}
```

## Validation

All configuration is validated using Zod schemas. Invalid values are replaced with defaults and warnings are shown.

## Best Practices

1. Use configuration files for complex setups
2. Use environment variables for sensitive data
3. Document custom configuration choices
4. Validate configuration before deployment