# API Reference

This document provides detailed API documentation for all Ollama Code CLI commands, including usage examples, parameters, and return values.

## Table of Contents

- [AI Assistance Commands](#ai-assistance-commands)
- [Model Management Commands](#model-management-commands)
- [System Integration Commands](#system-integration-commands)
- [Session Management Commands](#session-management-commands)
- [Command Line Options](#command-line-options)
- [Error Codes](#error-codes)

## AI Assistance Commands

### `ask`

Ask Ollama a question about code or programming concepts.

**Usage:**
```bash
ollama-code ask <question> [options]
```

**Parameters:**
- `question` (required): The question to ask Ollama
- `--context <file>`: Additional context file to include
- `--model <name>`: Specific model to use for the question
- `--verbose`: Enable verbose output

**Examples:**
```bash
# Basic question
ollama-code ask "How do I implement a binary search in TypeScript?"

# With context file
ollama-code ask "How can I optimize this code?" --context src/utils.ts

# Using specific model
ollama-code ask "Explain this algorithm" --model codellama
```

**Return Value:**
- Returns AI-generated response as text
- Exits with code 0 on success, non-zero on error

### `explain`

Explain code files with detailed analysis.

**Usage:**
```bash
ollama-code explain <file> [options]
```

**Parameters:**
- `file` (required): Path to the file to explain
- `--detail <level>`: Detail level (basic, intermediate, detailed)
- `--model <name>`: Specific model to use
- `--output <file>`: Output file for explanation

**Examples:**
```bash
# Basic explanation
ollama-code explain src/utils.ts

# Detailed explanation
ollama-code explain src/utils.ts --detail detailed

# Save explanation to file
ollama-code explain src/utils.ts --output explanation.md
```

**Return Value:**
- Returns detailed code explanation
- Exits with code 0 on success, non-zero on error

### `fix`

Fix bugs and issues in code files.

**Usage:**
```bash
ollama-code fix <file> [options]
```

**Parameters:**
- `file` (required): Path to the file to fix
- `--issue <description>`: Description of the issue to fix
- `--model <name>`: Specific model to use
- `--output <file>`: Output file for fixed code

**Examples:**
```bash
# Fix with issue description
ollama-code fix src/utils.ts --issue "Infinite loop in sort function"

# Fix without specific issue
ollama-code fix src/utils.ts

# Save fixed code to file
ollama-code fix src/utils.ts --output fixed-utils.ts
```

**Return Value:**
- Returns fixed code
- Exits with code 0 on success, non-zero on error

### `generate`

Generate code from natural language descriptions.

**Usage:**
```bash
ollama-code generate <description> [options]
```

**Parameters:**
- `description` (required): Natural language description of code to generate
- `--language <lang>`: Programming language (typescript, javascript, python, etc.)
- `--model <name>`: Specific model to use
- `--output <file>`: Output file for generated code

**Examples:**
```bash
# Generate TypeScript code
ollama-code generate "a REST API server with Express" --language typescript

# Generate Python code
ollama-code generate "a binary search function" --language python

# Save to file
ollama-code generate "a sorting algorithm" --output sort.ts
```

**Return Value:**
- Returns generated code
- Exits with code 0 on success, non-zero on error

### `refactor`

Refactor code for improved quality and maintainability.

**Usage:**
```bash
ollama-code refactor <file> [options]
```

**Parameters:**
- `file` (required): Path to the file to refactor
- `--focus <area>`: Focus area (readability, performance, simplicity, maintainability)
- `--model <name>`: Specific model to use
- `--output <file>`: Output file for refactored code

**Examples:**
```bash
# Refactor for performance
ollama-code refactor src/utils.ts --focus performance

# Refactor for readability
ollama-code refactor src/utils.ts --focus readability

# Save refactored code
ollama-code refactor src/utils.ts --output refactored-utils.ts
```

**Return Value:**
- Returns refactored code
- Exits with code 0 on success, non-zero on error

## Model Management Commands

### `list-models`

List available Ollama models.

**Usage:**
```bash
ollama-code list-models [options]
```

**Parameters:**
- `--verbose`: Show detailed model information
- `--json`: Output in JSON format

**Examples:**
```bash
# List all models
ollama-code list-models

# Detailed information
ollama-code list-models --verbose

# JSON output
ollama-code list-models --json
```

**Return Value:**
- Returns list of available models with details
- Exits with code 0 on success, non-zero on error

### `pull-model`

Download a new Ollama model.

**Usage:**
```bash
ollama-code pull-model <model-name> [options]
```

**Parameters:**
- `model-name` (required): Name of the model to download
- `--verbose`: Show download progress
- `--force`: Force download even if model exists

**Examples:**
```bash
# Download a model
ollama-code pull-model llama3.2

# Download with progress
ollama-code pull-model codellama --verbose

# Force download
ollama-code pull-model mistral --force
```

**Return Value:**
- Downloads and installs the model
- Exits with code 0 on success, non-zero on error

### `set-model`

Set the default model for the current session.

**Usage:**
```bash
ollama-code set-model <model-name>
```

**Parameters:**
- `model-name` (required): Name of the model to set as default

**Examples:**
```bash
# Set default model
ollama-code set-model llama3.2

# Switch to different model
ollama-code set-model codellama
```

**Return Value:**
- Sets the default model for the session
- Exits with code 0 on success, non-zero on error

## System Integration Commands

### `config`

View and modify application configuration.

**Usage:**
```bash
ollama-code config [key] [value]
```

**Parameters:**
- `key` (optional): Configuration key to view or modify
- `value` (optional): New value for the configuration key

**Examples:**
```bash
# View all configuration
ollama-code config

# View specific configuration
ollama-code config ai.defaultModel

# Set configuration value
ollama-code config ai.defaultModel llama3.2

# Set nested configuration
ollama-code config terminal.theme dark
```

**Return Value:**
- Returns configuration values or confirmation of changes
- Exits with code 0 on success, non-zero on error

### `run`

Execute system commands.

**Usage:**
```bash
ollama-code run <command> [arguments...]
```

**Parameters:**
- `command` (required): Command to execute
- `arguments` (optional): Command arguments

**Examples:**
```bash
# Run npm install
ollama-code run npm install

# Run git status
ollama-code run git status

# Run with arguments
ollama-code run npm run build
```

**Return Value:**
- Returns command output
- Exits with code 0 on success, non-zero on error

### `search`

Search through codebase files.

**Usage:**
```bash
ollama-code search <pattern> [options]
```

**Parameters:**
- `pattern` (required): Search pattern
- `--dir <directory>`: Directory to search in
- `--type <file-type>`: File type to search
- `--case-sensitive`: Case-sensitive search

**Examples:**
```bash
# Search for function
ollama-code search "function main"

# Search in specific directory
ollama-code search "import" --dir src

# Search specific file type
ollama-code search "class" --type ts
```

**Return Value:**
- Returns matching lines with file names and line numbers
- Exits with code 0 on success, non-zero on error

### `edit`

Open file in default editor.

**Usage:**
```bash
ollama-code edit <file>
```

**Parameters:**
- `file` (required): Path to the file to edit

**Examples:**
```bash
# Edit configuration file
ollama-code edit config.json

# Edit source file
ollama-code edit src/utils.ts
```

**Return Value:**
- Opens file in default editor
- Exits with code 0 on success, non-zero on error

### `git`

Execute Git operations.

**Usage:**
```bash
ollama-code git <command> [arguments...]
```

**Parameters:**
- `command` (required): Git command to execute
- `arguments` (optional): Git command arguments

**Examples:**
```bash
# Git status
ollama-code git status

# Git add
ollama-code git add .

# Git commit
ollama-code git commit -m "Update documentation"
```

**Return Value:**
- Returns Git command output
- Exits with code 0 on success, non-zero on error

### `theme`

Set terminal theme.

**Usage:**
```bash
ollama-code theme <theme-name>
```

**Parameters:**
- `theme-name` (required): Theme name (dark, light, system)

**Examples:**
```bash
# Set dark theme
ollama-code theme dark

# Set light theme
ollama-code theme light

# Use system theme
ollama-code theme system
```

**Return Value:**
- Sets the terminal theme
- Exits with code 0 on success, non-zero on error

## Session Management Commands


### `reset`

Reset conversation context.

**Usage:**
```bash
ollama-code reset
```

**Examples:**
```bash
# Reset context
ollama-code reset
```

**Return Value:**
- Resets conversation context
- Exits with code 0 on success, non-zero on error

### `clear`

Clear terminal screen.

**Usage:**
```bash
ollama-code clear
```

**Examples:**
```bash
# Clear screen
ollama-code clear
```

**Return Value:**
- Clears terminal screen
- Exits with code 0 on success, non-zero on error

### `exit` / `quit`

Exit the application.

**Usage:**
```bash
ollama-code exit
ollama-code quit
```

**Examples:**
```bash
# Exit application
ollama-code exit
ollama-code quit
```

**Return Value:**
- Exits the application
- Exits with code 0 on success, non-zero on error

## Help and Feedback Commands

### `help`

Show help information.

**Usage:**
```bash
ollama-code help [command]
```

**Parameters:**
- `command` (optional): Specific command to get help for

**Examples:**
```bash
# General help
ollama-code help

# Command-specific help
ollama-code help ask
ollama-code help config
```

**Return Value:**
- Returns help information
- Exits with code 0 on success, non-zero on error

### `commands`

List all available commands.

**Usage:**
```bash
ollama-code commands
```

**Examples:**
```bash
# List commands
ollama-code commands
```

**Return Value:**
- Returns list of all available commands
- Exits with code 0 on success, non-zero on error

## Command Line Options

### Global Options

- `--help, -h`: Show help information
- `--version, -v`: Show version information
- `--verbose`: Enable verbose output
- `--quiet`: Suppress output except errors
- `--config <file>`: Use custom configuration file

### Environment Variables

- `OLLAMA_CODE_CONFIG`: Path to configuration file
- `OLLAMA_CODE_VERBOSE`: Enable verbose output
- `OLLAMA_CODE_MODEL`: Default model to use
- `OLLAMA_CODE_SERVER_URL`: Default Ollama server URL

## Error Codes

### Success Codes
- `0`: Success

### Error Codes
- `1`: General error
- `2`: Invalid command
- `3`: Invalid arguments
- `4`: File not found
- `5`: Permission denied
- `6`: Network error
- `7`: AI service error
- `8`: Configuration error
- `9`: Model not found
- `10`: Server not running

### Error Handling

All commands provide detailed error messages and suggestions for resolution. Use the `--verbose` flag for additional debugging information.

## Examples

### Basic Workflow

```bash
# Start Ollama server
ollama serve

# Download a model
ollama-code pull-model llama3.2

# Ask a question
ollama-code ask "How do I implement a binary search?"

# Explain code
ollama-code explain src/utils.ts

# Fix bugs
ollama-code fix src/utils.ts --issue "Memory leak in loop"

# Generate code
ollama-code generate "a sorting function" --language typescript

# Refactor code
ollama-code refactor src/utils.ts --focus performance
```

### Advanced Usage

```bash
# Use specific model
ollama-code ask "Explain this algorithm" --model codellama

# Search codebase
ollama-code search "function main" --dir src --type ts

# Configure settings
ollama-code config ai.defaultModel llama3.2
ollama-code config terminal.theme dark

# Run tests
ollama-code run npm test

# Git operations
ollama-code git add .
ollama-code git commit -m "Update code"
```

This API reference provides comprehensive documentation for all Ollama Code CLI commands, enabling users to effectively utilize the tool for their development needs.
