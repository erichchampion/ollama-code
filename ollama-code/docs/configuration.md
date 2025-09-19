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

### MCP Server Configuration
- `mcp.server.enabled`: Enable MCP server integration (default: false)
- `mcp.server.port`: Server port (default: 3001)
- `mcp.server.autoStart`: Start server automatically (default: false)
- `mcp.server.tools.enabled`: Enable tool exposure (default: true)
- `mcp.server.resources.enabled`: Enable resource exposure (default: true)
- `mcp.server.logging.enabled`: Enable MCP request logging (default: false)

### MCP Client Configuration
- `mcp.client.enabled`: Enable MCP client integration (default: false)
- `mcp.client.globalTimeout`: Global timeout for all connections (default: 60000ms)
- `mcp.client.maxConcurrentConnections`: Max concurrent connections (default: 3)
- `mcp.client.connections`: Array of MCP server connections to establish
- `mcp.client.logging.enabled`: Enable MCP client request logging (default: false)

## Environment Variables

Use `OLLAMA_CODE_` prefix:
- `OLLAMA_CODE_AI_DEFAULT_MODEL`
- `OLLAMA_CODE_TERMINAL_THEME`
- `OLLAMA_CODE_OLLAMA_BASE_URL`
- `OLLAMA_CODE_MCP_SERVER_ENABLED`
- `OLLAMA_CODE_MCP_SERVER_PORT`
- `OLLAMA_CODE_MCP_SERVER_AUTO_START`
- `OLLAMA_CODE_MCP_CLIENT_ENABLED`
- `OLLAMA_CODE_MCP_CLIENT_GLOBAL_TIMEOUT`

## Command Line Usage

```bash
# View configuration
ollama-code config

# Set values
ollama-code config ai.defaultModel llama3.2
ollama-code config terminal.theme dark

# View specific section
ollama-code config ai

# MCP server commands
ollama-code mcp-start
ollama-code mcp-start 3002
ollama-code mcp-status
ollama-code mcp-tools
ollama-code mcp-stop

# MCP client commands
ollama-code mcp-list-connections
ollama-code mcp-add-connection <name> <command> [args...]
ollama-code mcp-remove-connection <name>
ollama-code mcp-client-status
ollama-code mcp-client-tools
ollama-code mcp-call-tool <tool-name> [args-json]
ollama-code mcp-get-resource <resource-uri>
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
  },
  "mcp": {
    "server": {
      "enabled": true,
      "port": 3001,
      "autoStart": false,
      "tools": {
        "enabled": true,
        "allowedTools": ["*"],
        "maxConcurrent": 5
      },
      "resources": {
        "enabled": true,
        "allowedResources": ["*"],
        "cacheTTL": 300000
      },
      "security": {
        "requireAuth": false,
        "allowedHosts": ["*"],
        "maxRequestSize": 10485760
      },
      "logging": {
        "enabled": false,
        "level": "info",
        "logFile": "mcp-server.log"
      }
    },
    "client": {
      "enabled": true,
      "connections": [
        {
          "name": "filesystem-server",
          "enabled": true,
          "command": "npx",
          "args": ["@modelcontextprotocol/server-filesystem", "/path/to/workspace"],
          "env": {},
          "timeout": 30000,
          "retryCount": 3,
          "retryDelay": 1000
        },
        {
          "name": "git-server",
          "enabled": true,
          "command": "mcp-server-git",
          "args": ["--repository", "/path/to/repo"],
          "env": {
            "GIT_CONFIG_GLOBAL": "/dev/null"
          },
          "cwd": "/path/to/repo",
          "timeout": 30000,
          "retryCount": 3,
          "retryDelay": 1000
        }
      ],
      "globalTimeout": 60000,
      "maxConcurrentConnections": 3,
      "logging": {
        "enabled": false,
        "level": "info",
        "logFile": "mcp-client.log"
      }
    }
  }
}
```

## Validation

All configuration is validated using Zod schemas. Invalid values are replaced with defaults and warnings are shown.

## MCP Server Integration

The Model Context Protocol (MCP) server integration allows ollama-code to expose its tools and resources to other MCP clients, enabling powerful AI assistants like Claude Desktop to use ollama-code's capabilities.

### What is MCP?

MCP is a protocol that allows AI assistants to:
- Access external tools and resources
- Execute code operations
- Retrieve file contents and project information
- Perform Git operations
- Generate and analyze code

### MCP Server Features

When enabled, the ollama-code MCP server exposes:

**Tools:**
- `analyze_code` - Analyze code for quality, patterns, and potential issues
- `generate_code` - Generate code based on natural language description
- `refactor_code` - Refactor code for better quality and maintainability
- `explain_code` - Explain what code does and how it works
- `fix_code` - Fix bugs or issues in code
- `search_codebase` - Search for patterns or code in the codebase
- `git_status` - Get current git repository status
- `run_tests` - Run tests in the project

**Resources:**
- `project://info` - General information about the current project
- `config://current` - Current ollama-code configuration

### Starting the MCP Server

```bash
# Start server on default port (3001)
ollama-code mcp-start

# Start server on custom port
ollama-code mcp-start 3002

# Check server status
ollama-code mcp-status

# List available tools
ollama-code mcp-tools

# List available resources
ollama-code mcp-resources

# Stop the server
ollama-code mcp-stop
```

### Connecting Claude Desktop

To use ollama-code tools in Claude Desktop:

1. Start the MCP server:
   ```bash
   ollama-code mcp-start
   ```

2. Add to your Claude Desktop configuration file:
   ```json
   {
     "mcpServers": {
       "ollama-code": {
         "command": "node",
         "args": ["path/to/ollama-code/dist/src/mcp-server.js"],
         "env": {
           "OLLAMA_CODE_PROJECT_PATH": "/path/to/your/project"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop to load the new server

### MCP Server Configuration Options

```json
{
  "mcp": {
    "enabled": true,              // Enable MCP server integration
    "port": 3001,                 // Server port
    "autoStart": false,           // Start server automatically with CLI
    "tools": {
      "enabled": true,            // Enable tool exposure
      "allowedTools": ["*"],      // Which tools to expose ("*" for all)
      "maxConcurrent": 5          // Max concurrent tool executions
    },
    "resources": {
      "enabled": true,            // Enable resource exposure
      "allowedResources": ["*"],  // Which resources to expose
      "cacheTTL": 300000          // Resource cache TTL in ms
    },
    "security": {
      "requireAuth": false,       // Require authentication
      "allowedHosts": ["*"],      // Allowed client hosts
      "maxRequestSize": 10485760  // Max request size in bytes (10MB)
    },
    "logging": {
      "enabled": false,           // Enable request/response logging
      "level": "info",            // Log level (debug, info, warn, error)
      "logFile": "mcp-server.log" // Log file path
    }
  }
}
```

### Security Considerations

- The MCP server exposes powerful code manipulation tools
- Only run on trusted networks or with proper authentication
- Consider restricting `allowedHosts` in production environments
- Monitor server logs for unusual activity
- Use firewall rules to restrict port access

### Troubleshooting

**Server won't start:**
- Check if port is already in use: `lsof -i :3001`
- Verify Ollama is running: `ollama list`
- Check logs for error messages

**Claude Desktop can't connect:**
- Verify server is running: `ollama-code mcp-status`
- Check Claude Desktop configuration
- Restart Claude Desktop after configuration changes

**Tools not working:**
- Ensure project path is correctly set
- Verify file permissions
- Check Ollama model availability

## MCP Client Integration

The MCP client integration allows ollama-code to connect to external MCP servers and use their tools and resources as part of its workflow. This enables integration with filesystem servers, database servers, API servers, and other specialized MCP servers.

### What is MCP Client?

MCP client functionality allows ollama-code to:
- Connect to external MCP servers
- Use tools exposed by other servers
- Access resources from other servers
- Integrate multiple specialized servers into a single workflow
- Chain operations across different MCP servers

### Available MCP Servers

There are many community MCP servers available:

**Filesystem Servers:**
- `@modelcontextprotocol/server-filesystem` - File system operations
- `@modelcontextprotocol/server-git` - Git repository management

**Database Servers:**
- `@modelcontextprotocol/server-sqlite` - SQLite database operations
- `@modelcontextprotocol/server-postgres` - PostgreSQL operations

**API Servers:**
- `@modelcontextprotocol/server-fetch` - HTTP request operations
- Custom API servers for specific services

### Configuring MCP Client Connections

#### Adding Connections via Command Line

```bash
# Add a filesystem server connection
ollama-code mcp-add-connection filesystem-server npx @modelcontextprotocol/server-filesystem /path/to/workspace

# Add a git server connection
ollama-code mcp-add-connection git-server mcp-server-git --repository /path/to/repo

# List all connections
ollama-code mcp-list-connections

# Check connection status
ollama-code mcp-client-status
```

#### Connection Configuration Options

Each MCP client connection supports:

```json
{
  "name": "unique-connection-name",     // Unique identifier
  "enabled": true,                      // Enable/disable this connection
  "command": "command-to-run",          // Command to start the MCP server
  "args": ["arg1", "arg2"],            // Command arguments
  "env": {                             // Environment variables
    "VAR1": "value1",
    "VAR2": "value2"
  },
  "cwd": "/working/directory",         // Working directory (optional)
  "timeout": 30000,                    // Connection timeout in ms
  "retryCount": 3,                     // Number of retry attempts
  "retryDelay": 1000                   // Delay between retries in ms
}
```

### Using MCP Client Tools

#### List Available Tools

```bash
# List all tools from connected servers
ollama-code mcp-client-tools
```

#### Call External Tools

```bash
# Call a tool without arguments
ollama-code mcp-call-tool list_files

# Call a tool with arguments (JSON format)
ollama-code mcp-call-tool read_file '{"path": "/path/to/file.txt"}'

# Call a database query tool
ollama-code mcp-call-tool execute_query '{"query": "SELECT * FROM users"}'
```

### Using MCP Client Resources

#### List Available Resources

```bash
# List all resources from connected servers
ollama-code mcp-client-resources
```

#### Get Resources

```bash
# Get a file resource
ollama-code mcp-get-resource file:///path/to/file.txt

# Get a database schema resource
ollama-code mcp-get-resource postgres://localhost/mydb/schema
```

### Connection Management

#### Connection Lifecycle

```bash
# Remove a connection
ollama-code mcp-remove-connection filesystem-server

# Reconnect to a specific server
ollama-code mcp-reconnect git-server

# Check status of all connections
ollama-code mcp-client-status
```

#### Enable/Disable Client

```bash
# Enable MCP client functionality
ollama-code config mcp.client.enabled true

# Set global timeout
ollama-code config mcp.client.globalTimeout 120000

# Set max concurrent connections
ollama-code config mcp.client.maxConcurrentConnections 5
```

### Integration Examples

#### Filesystem Integration

```json
{
  "mcp": {
    "client": {
      "enabled": true,
      "connections": [
        {
          "name": "workspace-fs",
          "enabled": true,
          "command": "npx",
          "args": ["@modelcontextprotocol/server-filesystem", "/workspace"],
          "timeout": 30000
        }
      ]
    }
  }
}
```

Available filesystem tools:
- `list_files` - List files in a directory
- `read_file` - Read file contents
- `write_file` - Write file contents
- `create_directory` - Create directories
- `move_file` - Move/rename files

#### Git Integration

```json
{
  "mcp": {
    "client": {
      "enabled": true,
      "connections": [
        {
          "name": "project-git",
          "enabled": true,
          "command": "mcp-server-git",
          "args": ["--repository", "/project"],
          "cwd": "/project",
          "env": {
            "GIT_CONFIG_GLOBAL": "/dev/null"
          }
        }
      ]
    }
  }
}
```

Available git tools:
- `git_status` - Get repository status
- `git_log` - Get commit history
- `git_diff` - Get diff information
- `git_add` - Stage files
- `git_commit` - Create commits

#### Database Integration

```json
{
  "mcp": {
    "client": {
      "enabled": true,
      "connections": [
        {
          "name": "app-database",
          "enabled": true,
          "command": "mcp-server-sqlite",
          "args": ["--database", "/app/database.db"],
          "timeout": 60000
        }
      ]
    }
  }
}
```

Available database tools:
- `execute_query` - Execute SQL queries
- `list_tables` - List database tables
- `describe_table` - Get table schema
- `create_table` - Create new tables

### Security Considerations

- **Command Execution**: MCP client spawns external processes - only use trusted MCP servers
- **File Access**: Filesystem servers can access local files - limit scope with proper paths
- **Network Access**: Some servers may make network requests - monitor outbound connections
- **Resource Limits**: Set appropriate timeouts and connection limits
- **Environment Variables**: Be careful with environment variables containing secrets

### Troubleshooting MCP Client

**Connection Issues:**
```bash
# Check if MCP client is enabled
ollama-code config mcp.client.enabled

# Check connection status
ollama-code mcp-client-status

# Check configuration
ollama-code config mcp.client
```

**Server Not Starting:**
- Verify the command and arguments are correct
- Check that the MCP server package is installed
- Verify file permissions and paths
- Check environment variables

**Tool Call Failures:**
- Ensure the tool name is correct (`mcp-client-tools`)
- Verify argument format (must be valid JSON)
- Check server logs if logging is enabled
- Verify connection is active (`mcp-client-status`)

**Performance Issues:**
- Adjust timeout values for slow servers
- Limit concurrent connections
- Enable logging to identify bottlenecks
- Monitor resource usage

## Best Practices

1. Use configuration files for complex setups
2. Use environment variables for sensitive data
3. Document custom configuration choices
4. Validate configuration before deployment
5. Enable MCP logging during development for debugging
6. Use specific tool/resource allowlists in production
7. Regularly update ollama-code for latest MCP features
8. Test MCP client connections before deploying
9. Use descriptive connection names for clarity
10. Set appropriate timeouts based on server capabilities
11. Monitor MCP client performance and adjust limits as needed