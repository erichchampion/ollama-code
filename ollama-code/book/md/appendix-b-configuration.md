# Appendix B: Configuration Guide

> *Complete configuration reference for ollama-code*

---

## Overview

This appendix provides comprehensive configuration documentation for ollama-code. Learn how to configure AI providers, tools, plugins, security settings, and more.

**Configuration Methods:**
- Configuration files (`config.json`, `config.yaml`)
- Environment variables
- Programmatic configuration
- CLI flags

---

## Configuration Files

### config.json

Default location: `~/.ollama-code/config.json`

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "model": "codellama:7b",
      "timeout": 30000,
      "keepAlive": "5m"
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4-turbo",
      "organization": "${OPENAI_ORG}",
      "timeout": 30000
    },
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}",
      "model": "claude-3-sonnet-20240229",
      "maxTokens": 4096,
      "timeout": 30000
    }
  },
  "defaultProvider": "ollama",
  "tools": {
    "maxConcurrency": 5,
    "timeout": 60000,
    "approvalRequired": true,
    "cache": {
      "enabled": true,
      "ttl": 300000,
      "maxSize": 1000
    }
  },
  "conversation": {
    "maxTokens": 8000,
    "strategy": "recent",
    "autoSave": true,
    "persistPath": "~/.ollama-code/conversations"
  },
  "plugins": {
    "enabled": ["kubernetes", "docker", "terraform"],
    "autoUpdate": false,
    "config": {
      "kubernetes": {
        "kubectl": true,
        "helm": true
      },
      "docker": {
        "socket": "/var/run/docker.sock"
      }
    }
  },
  "security": {
    "sandboxEnabled": true,
    "allowedCommands": ["git", "npm", "yarn", "kubectl"],
    "allowedPaths": ["~/projects", "/tmp"],
    "deniedPaths": ["~/.ssh", "~/.aws"],
    "maxFileSize": 10485760,
    "rateLimit": {
      "enabled": true,
      "requestsPerMinute": 60
    }
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destination": "file",
    "filePath": "~/.ollama-code/logs/app.log",
    "rotation": {
      "maxSize": "10m",
      "maxFiles": 5
    }
  },
  "performance": {
    "cacheEnabled": true,
    "cacheTTL": 300000,
    "maxCacheSize": 1000,
    "connectionPooling": true,
    "maxConnections": 10
  },
  "ui": {
    "theme": "auto",
    "colorOutput": true,
    "progressBars": true,
    "confirmDestructive": true
  }
}
```

### config.yaml

Alternative YAML format:

```yaml
providers:
  ollama:
    baseUrl: http://localhost:11434
    model: codellama:7b
    timeout: 30000
    keepAlive: 5m

  openai:
    apiKey: ${OPENAI_API_KEY}
    model: gpt-4-turbo
    timeout: 30000

  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}
    model: claude-3-sonnet-20240229
    maxTokens: 4096

defaultProvider: ollama

tools:
  maxConcurrency: 5
  timeout: 60000
  approvalRequired: true
  cache:
    enabled: true
    ttl: 300000
    maxSize: 1000

conversation:
  maxTokens: 8000
  strategy: recent
  autoSave: true
  persistPath: ~/.ollama-code/conversations

plugins:
  enabled:
    - kubernetes
    - docker
    - terraform
  autoUpdate: false
  config:
    kubernetes:
      kubectl: true
      helm: true

security:
  sandboxEnabled: true
  allowedCommands:
    - git
    - npm
    - yarn
    - kubectl
  allowedPaths:
    - ~/projects
    - /tmp
  deniedPaths:
    - ~/.ssh
    - ~/.aws
  maxFileSize: 10485760

logging:
  level: info
  format: json
  destination: file
  filePath: ~/.ollama-code/logs/app.log

performance:
  cacheEnabled: true
  cacheTTL: 300000
  maxCacheSize: 1000
```

---

## Environment Variables

### AI Provider Configuration

```bash
# Ollama
export OLLAMA_BASE_URL="http://localhost:11434"
export OLLAMA_MODEL="codellama:7b"
export OLLAMA_TIMEOUT="30000"

# OpenAI
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4-turbo"
export OPENAI_ORG="org-..."
export OPENAI_BASE_URL="https://api.openai.com/v1"  # For Azure OpenAI

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-sonnet-20240229"

# Google
export GOOGLE_API_KEY="..."
export GOOGLE_MODEL="gemini-1.5-pro"

# Default provider
export OLLAMA_CODE_PROVIDER="ollama"
```

### Tool Configuration

```bash
# Tool settings
export OLLAMA_CODE_MAX_CONCURRENCY="5"
export OLLAMA_CODE_TOOL_TIMEOUT="60000"
export OLLAMA_CODE_APPROVAL_REQUIRED="true"

# Cache settings
export OLLAMA_CODE_CACHE_ENABLED="true"
export OLLAMA_CODE_CACHE_TTL="300000"
export OLLAMA_CODE_CACHE_MAX_SIZE="1000"
```

### Security Configuration

```bash
# Sandbox
export OLLAMA_CODE_SANDBOX_ENABLED="true"

# Allowed commands (comma-separated)
export OLLAMA_CODE_ALLOWED_COMMANDS="git,npm,yarn,kubectl"

# Allowed paths (comma-separated)
export OLLAMA_CODE_ALLOWED_PATHS="~/projects,/tmp"

# Denied paths (comma-separated)
export OLLAMA_CODE_DENIED_PATHS="~/.ssh,~/.aws"

# Max file size (bytes)
export OLLAMA_CODE_MAX_FILE_SIZE="10485760"

# Rate limiting
export OLLAMA_CODE_RATE_LIMIT_ENABLED="true"
export OLLAMA_CODE_RATE_LIMIT_RPM="60"
```

### Logging Configuration

```bash
# Log level
export OLLAMA_CODE_LOG_LEVEL="info"  # debug, info, warn, error

# Log format
export OLLAMA_CODE_LOG_FORMAT="json"  # json, text

# Log destination
export OLLAMA_CODE_LOG_DESTINATION="file"  # console, file

# Log file path
export OLLAMA_CODE_LOG_FILE="~/.ollama-code/logs/app.log"
```

### Plugin Configuration

```bash
# Enabled plugins (comma-separated)
export OLLAMA_CODE_PLUGINS="kubernetes,docker,terraform"

# Auto-update
export OLLAMA_CODE_PLUGIN_AUTO_UPDATE="false"

# Plugin-specific config (JSON)
export OLLAMA_CODE_KUBERNETES_CONFIG='{"kubectl":true,"helm":true}'
```

---

## CLI Flags

### Global Flags

```bash
# Set provider
ollama-code --provider openai chat

# Set model
ollama-code --model gpt-4-turbo chat

# Set configuration file
ollama-code --config ~/custom-config.json chat

# Set log level
ollama-code --log-level debug chat

# Disable cache
ollama-code --no-cache chat

# Disable approval
ollama-code --no-approval chat
```

### Command-Specific Flags

```bash
# Chat command
ollama-code chat \
  --provider ollama \
  --model codellama:34b \
  --temperature 0.3 \
  --max-tokens 4096

# Generate command
ollama-code generate \
  --input prompt.txt \
  --output result.txt \
  --provider openai \
  --stream

# Tool command
ollama-code tool execute read-file \
  --params '{"path":"src/index.ts"}' \
  --no-approval
```

---

## Provider-Specific Configuration

### Ollama Configuration

```json
{
  "providers": {
    "ollama": {
      // Required
      "baseUrl": "http://localhost:11434",
      "model": "codellama:7b",

      // Optional
      "timeout": 30000,
      "keepAlive": "5m",           // Keep model loaded

      // Model-specific options
      "options": {
        "num_ctx": 8192,           // Context window
        "num_predict": 2048,       // Max output tokens
        "temperature": 0.7,
        "top_k": 40,
        "top_p": 0.9,
        "repeat_penalty": 1.1
      }
    }
  }
}
```

**Available Models:**
```
codellama:7b       - 4K context
codellama:13b      - 4K context
codellama:34b      - 8K context
llama2:7b          - 4K context
llama2:13b         - 4K context
mistral:7b         - 8K context
mixtral:8x7b       - 32K context
```

### OpenAI Configuration

```json
{
  "providers": {
    "openai": {
      // Required
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4-turbo",

      // Optional
      "organization": "${OPENAI_ORG}",
      "timeout": 30000,
      "maxRetries": 3,

      // Azure OpenAI
      "azure": {
        "enabled": true,
        "endpoint": "https://your-resource.openai.azure.com/",
        "deployment": "gpt-4-deployment-name",
        "apiVersion": "2024-02-15-preview"
      },

      // Model-specific options
      "defaultOptions": {
        "temperature": 0.7,
        "max_tokens": 2048,
        "top_p": 1.0,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
      }
    }
  }
}
```

**Available Models:**
```
gpt-3.5-turbo      - 16K context
gpt-4              - 8K context
gpt-4-32k          - 32K context
gpt-4-turbo        - 128K context
gpt-4-vision       - 128K context (supports images)
```

### Anthropic Configuration

```json
{
  "providers": {
    "anthropic": {
      // Required
      "apiKey": "${ANTHROPIC_API_KEY}",
      "model": "claude-3-sonnet-20240229",

      // Optional
      "maxTokens": 4096,
      "timeout": 30000,

      // Model-specific options
      "defaultOptions": {
        "temperature": 0.7,
        "top_p": 1.0,
        "top_k": -1
      }
    }
  }
}
```

**Available Models:**
```
claude-3-haiku-20240307    - 200K context, fast
claude-3-sonnet-20240229   - 200K context, balanced
claude-3-opus-20240229     - 200K context, most capable
```

### Google Configuration

```json
{
  "providers": {
    "google": {
      // Required
      "apiKey": "${GOOGLE_API_KEY}",
      "model": "gemini-1.5-pro",

      // Optional
      "timeout": 30000,

      // Model-specific options
      "defaultOptions": {
        "temperature": 0.7,
        "maxOutputTokens": 2048,
        "topK": 40,
        "topP": 0.95
      }
    }
  }
}
```

**Available Models:**
```
gemini-1.0-pro      - 32K context
gemini-1.5-pro      - 1M context
gemini-1.5-flash    - 1M context, faster
```

---

## Tool Configuration

### General Tool Settings

```json
{
  "tools": {
    // Concurrency
    "maxConcurrency": 5,

    // Timeout (milliseconds)
    "timeout": 60000,

    // Approval system
    "approvalRequired": true,
    "dangerousToolsRequireApproval": true,
    "autoApprovePatterns": [
      "read-file:src/**",
      "list-files:**"
    ],

    // Cache
    "cache": {
      "enabled": true,
      "ttl": 300000,            // 5 minutes
      "maxSize": 1000,
      "strategy": "lru"         // lru, lfu, fifo
    },

    // Retry
    "retry": {
      "enabled": true,
      "maxRetries": 3,
      "backoff": "exponential",
      "initialDelay": 1000
    }
  }
}
```

### Tool-Specific Configuration

```json
{
  "tools": {
    "config": {
      // File system tools
      "filesystem": {
        "maxFileSize": 10485760,     // 10 MB
        "allowedExtensions": [".ts", ".js", ".json", ".md"],
        "encoding": "utf-8"
      },

      // Git tools
      "git": {
        "autoStage": false,
        "signCommits": true,
        "gpgKey": "${GPG_KEY_ID}"
      },

      // Code analysis tools
      "codeAnalysis": {
        "linter": "eslint",
        "formatter": "prettier",
        "typeChecker": "tsc"
      },

      // Network tools
      "network": {
        "allowedDomains": ["github.com", "npmjs.com"],
        "timeout": 10000,
        "maxResponseSize": 5242880  // 5 MB
      }
    }
  }
}
```

---

## Conversation Configuration

```json
{
  "conversation": {
    // Context window
    "maxTokens": 8000,

    // Context retention strategy
    "strategy": "recent",  // recent, important, sliding-summary, relevant

    // Strategy-specific settings
    "strategyConfig": {
      "recent": {
        "maxMessages": 10
      },
      "important": {
        "minImportance": 0.7
      },
      "slidingSummary": {
        "summaryInterval": 5,
        "summaryModel": "gpt-3.5-turbo"
      },
      "relevant": {
        "similarityThreshold": 0.7,
        "embeddingModel": "text-embedding-3-small"
      }
    },

    // Persistence
    "autoSave": true,
    "persistPath": "~/.ollama-code/conversations",
    "saveInterval": 30000,        // Auto-save every 30s

    // System prompt
    "systemPrompt": "You are a helpful AI coding assistant...",

    // Token estimation
    "tokenEstimator": "tiktoken"  // tiktoken, approximate
  }
}
```

---

## Plugin Configuration

### General Plugin Settings

```json
{
  "plugins": {
    // Enabled plugins
    "enabled": ["kubernetes", "docker", "terraform"],

    // Plugin sources
    "sources": [
      "npm",
      "filesystem:~/.ollama-code/plugins",
      "registry:https://plugins.ollama-code.dev"
    ],

    // Auto-update
    "autoUpdate": false,
    "updateCheckInterval": 86400000,  // 24 hours

    // Sandboxing
    "sandbox": {
      "enabled": true,
      "isolate": true,
      "resourceLimits": {
        "maxMemory": 536870912,      // 512 MB
        "maxCpu": 80                 // 80% CPU
      }
    },

    // Per-plugin configuration
    "config": {
      "kubernetes": {
        "kubectl": true,
        "helm": true,
        "kustomize": false,
        "context": "default"
      },
      "docker": {
        "socket": "/var/run/docker.sock",
        "registry": "docker.io"
      },
      "terraform": {
        "terraform": true,
        "terragrunt": false,
        "backend": "local"
      }
    }
  }
}
```

---

## Security Configuration

### Sandbox Settings

```json
{
  "security": {
    "sandboxEnabled": true,

    // Command whitelist
    "allowedCommands": [
      "git",
      "npm",
      "yarn",
      "kubectl",
      "docker"
    ],

    // Path restrictions
    "allowedPaths": [
      "~/projects",
      "/tmp",
      "/var/tmp"
    ],
    "deniedPaths": [
      "~/.ssh",
      "~/.aws",
      "~/.kube/config",
      "/etc/passwd"
    ],

    // File size limits
    "maxFileSize": 10485760,         // 10 MB
    "maxTotalSize": 104857600,       // 100 MB

    // Rate limiting
    "rateLimit": {
      "enabled": true,
      "requestsPerMinute": 60,
      "requestsPerHour": 1000,
      "requestsPerDay": 10000,
      "bypassTokens": ["${BYPASS_TOKEN}"]
    },

    // Credential encryption
    "encryption": {
      "algorithm": "aes-256-gcm",
      "keyDerivation": "pbkdf2",
      "iterations": 100000
    }
  }
}
```

### Audit Logging

```json
{
  "security": {
    "audit": {
      "enabled": true,
      "logPath": "~/.ollama-code/logs/audit.log",
      "events": [
        "auth:login",
        "auth:logout",
        "tool:execute",
        "file:read",
        "file:write",
        "command:execute",
        "config:change"
      ],
      "rotation": {
        "maxSize": "50m",
        "maxFiles": 10,
        "compress": true
      }
    }
  }
}
```

---

## Performance Configuration

```json
{
  "performance": {
    // Caching
    "cacheEnabled": true,
    "cacheTTL": 300000,              // 5 minutes
    "maxCacheSize": 1000,
    "cacheStrategy": "lru",

    // Connection pooling
    "connectionPooling": true,
    "maxConnections": 10,
    "keepAlive": true,
    "keepAliveMsecs": 1000,

    // Request batching
    "batching": {
      "enabled": true,
      "maxBatchSize": 10,
      "batchTimeout": 100            // Wait 100ms for batch
    },

    // Streaming
    "streaming": {
      "enabled": true,
      "bufferSize": 1024,
      "backpressureThreshold": 0.8
    },

    // Memory management
    "memory": {
      "gcEnabled": true,
      "gcInterval": 60000,           // Run GC every minute
      "maxMemory": 1073741824        // 1 GB
    }
  }
}
```

---

## UI Configuration

```json
{
  "ui": {
    // Theme
    "theme": "auto",                 // auto, light, dark

    // Colors
    "colorOutput": true,
    "colorScheme": {
      "primary": "#007acc",
      "success": "#28a745",
      "warning": "#ffc107",
      "error": "#dc3545",
      "info": "#17a2b8"
    },

    // Progress
    "progressBars": true,
    "progressStyle": "bar",          // bar, spinner, dots

    // Confirmations
    "confirmDestructive": true,
    "confirmExpensive": true,

    // Output
    "verbose": false,
    "quiet": false,
    "timestamps": false,

    // Formatting
    "prettyPrint": true,
    "maxLineLength": 120,
    "indentSize": 2
  }
}
```

---

## Configuration Priority

Configuration sources are merged in this order (later overrides earlier):

1. **Default values** - Built-in defaults
2. **Global config file** - `/etc/ollama-code/config.json`
3. **User config file** - `~/.ollama-code/config.json`
4. **Project config file** - `./.ollama-code/config.json`
5. **Environment variables** - `OLLAMA_CODE_*`
6. **CLI flags** - Command-line arguments

### Example Override

```bash
# Default
{
  "providers": {
    "ollama": {
      "model": "codellama:7b"
    }
  }
}

# Environment variable
export OLLAMA_MODEL="codellama:34b"

# CLI flag
ollama-code --model codellama:13b chat

# Final result: codellama:13b (CLI flag wins)
```

---

## Configuration Validation

Validate your configuration:

```bash
# Validate config file
ollama-code config validate

# Validate config file (custom path)
ollama-code config validate --file ~/my-config.json

# Show effective configuration
ollama-code config show

# Show configuration with sources
ollama-code config show --sources
```

Output:
```
✓ Configuration is valid

Effective Configuration:
  Provider: ollama (from: CLI flag)
  Model: codellama:34b (from: environment variable)
  Max Tokens: 8000 (from: config file)
  ...
```

---

## Best Practices

### 1. Use Environment Variables for Secrets

```bash
# DON'T: Store secrets in config file
{
  "providers": {
    "openai": {
      "apiKey": "sk-proj-abc123..."
    }
  }
}

# DO: Use environment variables
{
  "providers": {
    "openai": {
      "apiKey": "${OPENAI_API_KEY}"
    }
  }
}
```

### 2. Use Project-Specific Config

```
my-project/
├── .ollama-code/
│   └── config.json        # Project-specific settings
├── src/
└── package.json
```

### 3. Version Control Configuration

```bash
# .gitignore
.ollama-code/config.local.json    # Local overrides (not committed)

# config.json (committed)
{
  "providers": {
    "ollama": {
      "model": "codellama:7b"
    }
  }
}

# config.local.json (not committed, overrides config.json)
{
  "providers": {
    "ollama": {
      "model": "codellama:34b"
    }
  }
}
```

### 4. Use Profiles

```bash
# Development
ollama-code --profile dev chat

# Production
ollama-code --profile prod chat

# ~/.ollama-code/profiles/dev.json
{
  "providers": {
    "ollama": {
      "model": "codellama:7b"
    }
  },
  "logging": {
    "level": "debug"
  }
}

# ~/.ollama-code/profiles/prod.json
{
  "providers": {
    "openai": {
      "model": "gpt-4-turbo"
    }
  },
  "logging": {
    "level": "warn"
  }
}
```

---

*Appendix B | Configuration Guide | 10-15 pages*
