# Command Reference

This document provides a comprehensive reference for all available CLI commands in Ollama Code, including arguments, options, and usage examples.

## Table of Contents

- [AI Assistance Commands](#ai-assistance-commands)
- [Code Generation Commands](#code-generation-commands)
- [Model Management Commands](#model-management-commands)
- [System Commands](#system-commands)
- [Session Commands](#session-commands)
- [Command Syntax](#command-syntax)
- [Global Options](#global-options)


## AI Assistance Commands

### `ask`
Ask Ollama a question about code or programming.

**Syntax:**
```bash
ollama-code ask <question> [--context <file>] [--model <model>]
```

**Arguments:**
- `question` (required): Question to ask Ollama
- `--context, -c` (optional): Provide additional context files
- `--model, -m` (optional): Specific Ollama model to use

**Examples:**
```bash
ollama-code ask "How do I implement a binary search tree in TypeScript?"
ollama-code ask "What's wrong with this code?" --context ./path/to/file.js
ollama-code ask "Explain async/await" --model llama3.2
```

**Description:**
Sends a question to the Ollama AI model and returns the response. This is the primary command for getting AI assistance with programming questions.

---

### `explain`
Explain a code file or snippet.

**Syntax:**
```bash
ollama-code explain <file> [--detail <level>]
```

**Arguments:**
- `file` (required): File to explain
- `--detail, -d` (optional): Level of detail (basic, intermediate, detailed) - default: intermediate

**Examples:**
```bash
ollama-code explain path/to/file.js
ollama-code explain path/to/file.py --detail detailed
ollama-code explain src/components/Button.tsx --detail basic
```

**Description:**
Analyzes a code file and provides an explanation of what the code does, how it works, and its purpose.

---

### `fix`
Fix bugs or issues in code.

**Syntax:**
```bash
ollama-code fix <file> [--issue <description>] [--output <file>]
```

**Arguments:**
- `file` (required): File to fix
- `--issue, -i` (optional): Description of the issue to fix
- `--output, -o` (optional): Output file path (defaults to stdout)

**Examples:**
```bash
ollama-code fix path/to/file.js
ollama-code fix path/to/file.py --issue "Infinite loop in the sort function"
ollama-code fix path/to/file.ts --output path/to/fixed.ts
```

**Description:**
Analyzes code for bugs and issues, then provides corrected code with explanations of the fixes.

## Code Generation Commands

### `generate`
Generate code based on a prompt.

**Syntax:**
```bash
ollama-code generate <prompt> [--language <lang>] [--output <file>]
```

**Arguments:**
- `prompt` (required): Description of the code to generate
- `--language, -l` (optional): Programming language (default: JavaScript)
- `--output, -o` (optional): Output file path (defaults to stdout)

**Examples:**
```bash
ollama-code generate "a function that sorts an array using quick sort"
ollama-code generate "a REST API server with Express" --language TypeScript
ollama-code generate "a binary search tree implementation" --output bst.js
```

**Description:**
Generates code based on a natural language description. The AI will create functional code that matches your requirements.

---

### `refactor`
Refactor code for better readability, performance, or structure.

**Syntax:**
```bash
ollama-code refactor <file> [--focus <aspect>] [--output <file>]
```

**Arguments:**
- `file` (required): File to refactor
- `--focus, -f` (optional): Focus of refactoring (readability, performance, simplicity, maintainability) - default: readability
- `--output, -o` (optional): Output file path (defaults to stdout)

**Examples:**
```bash
ollama-code refactor path/to/file.js
ollama-code refactor path/to/file.py --focus performance
ollama-code refactor path/to/file.ts --output path/to/refactored.ts
```

**Description:**
Improves existing code by refactoring it for better readability, performance, simplicity, or maintainability.

## Model Management Commands

### `list-models`
List available Ollama models.

**Syntax:**
```bash
ollama-code list-models
```

**Examples:**
```bash
ollama-code list-models
```

**Description:**
Displays all available Ollama models with their sizes, modification dates, and other details.

---

### `pull-model`
Download a new Ollama model.

**Syntax:**
```bash
ollama-code pull-model <model>
```

**Arguments:**
- `model` (required): Model name to download (e.g., llama3.2, codellama)

**Examples:**
```bash
ollama-code pull-model llama3.2
ollama-code pull-model codellama
ollama-code pull-model mistral
```

**Description:**
Downloads a new model from the Ollama registry. This may take several minutes depending on the model size.

---

### `set-model`
Set the default model for the current session.

**Syntax:**
```bash
ollama-code set-model <model>
```

**Arguments:**
- `model` (required): Model name to set as default

**Examples:**
```bash
ollama-code set-model llama3.2
ollama-code set-model codellama
ollama-code set-model mistral
```

**Description:**
Sets the default model for the current session. This change is temporary and only affects the current session.

## System Commands

### `config`
View or edit configuration settings.

**Syntax:**
```bash
ollama-code config [<key>] [<value>]
```

**Arguments:**
- `key` (optional): Configuration key (e.g., "api.baseUrl")
- `value` (optional): New value to set

**Examples:**
```bash
ollama-code config
ollama-code config api.baseUrl
ollama-code config api.baseUrl http://localhost:11434
ollama-code config telemetry.enabled false
```

**Description:**
Manages configuration settings. Without arguments, displays all current settings. With a key, displays the value. With both key and value, updates the setting.

---

### `run`
Execute a terminal command.

**Syntax:**
```bash
ollama-code run <command>
```

**Arguments:**
- `command` (required): The command to execute

**Examples:**
```bash
ollama-code run "ls -la"
ollama-code run "npm install"
ollama-code run "git status"
```

**Description:**
Executes shell commands from within the Ollama Code CLI. Useful for running build scripts, tests, or other development tools.

---

### `search`
Search the codebase for a term.

**Syntax:**
```bash
ollama-code search <term> [--dir <directory>]
```

**Arguments:**
- `term` (required): The term to search for
- `--dir, -d` (optional): Directory to search in (defaults to current directory)

**Examples:**
```bash
ollama-code search "function main"
ollama-code search TODO
ollama-code search "import React" --dir ./src
```

**Description:**
Searches through the codebase for a specific term or pattern. Uses ripgrep if available, otherwise falls back to grep.

---

### `theme`
Change the UI theme.

**Syntax:**
```bash
ollama-code theme [<name>]
```

**Arguments:**
- `name` (optional): Theme name (dark, light, system)

**Examples:**
```bash
ollama-code theme
ollama-code theme dark
ollama-code theme light
ollama-code theme system
```

**Description:**
Changes the UI theme. Without arguments, displays the current theme and available options.

---

### `verbosity`
Set output verbosity level.

**Syntax:**
```bash
ollama-code verbosity [<level>]
```

**Arguments:**
- `level` (optional): Verbosity level (debug, info, warn, error, silent)

**Examples:**
```bash
ollama-code verbosity
ollama-code verbosity info
ollama-code verbosity debug
ollama-code verbosity error
```

**Description:**
Controls the verbosity of output messages. Without arguments, displays the current level and available options.

---

### `edit`
Edit a specified file.

**Syntax:**
```bash
ollama-code edit <file>
```

**Arguments:**
- `file` (required): File path to edit

**Examples:**
```bash
ollama-code edit path/to/file.txt
ollama-code edit newfile.md
```

**Description:**
Opens a file in the default editor. Creates the file if it doesn't exist. Uses the EDITOR environment variable if set.

---

### `git`
Perform git operations.

**Syntax:**
```bash
ollama-code git <operation>
```

**Arguments:**
- `operation` (required): Git operation to perform

**Examples:**
```bash
ollama-code git status
ollama-code git log
ollama-code git add .
ollama-code git commit -m "Commit message"
```

**Description:**
Executes git commands from within the CLI. Supports all standard git operations.

## Session Commands

### `exit` / `quit`
Exit the application.

**Syntax:**
```bash
ollama-code exit
ollama-code quit
```

**Examples:**
```bash
ollama-code exit
ollama-code quit
```

**Description:**
Exits the Ollama Code CLI application. Both commands are equivalent.

---

### `clear`
Clear the current session display.

**Syntax:**
```bash
ollama-code clear
```

**Examples:**
```bash
ollama-code clear
```

**Description:**
Clears the terminal display, providing a clean workspace.

---

### `reset`
Reset the conversation context with Ollama.

**Syntax:**
```bash
ollama-code reset
```

**Examples:**
```bash
ollama-code reset
```

**Description:**
Resets the AI conversation context, starting fresh with the AI model.

---

### `history`
View conversation history.

**Syntax:**
```bash
ollama-code history [--limit <number>]
```

**Arguments:**
- `--limit, -l` (optional): Maximum number of history items to display (default: 10)

**Examples:**
```bash
ollama-code history
ollama-code history --limit 5
```

**Description:**
Displays conversation history (currently not implemented in this version).

---

### `commands`
List all available slash commands.

**Syntax:**
```bash
ollama-code commands
```

**Examples:**
```bash
ollama-code commands
```

**Description:**
Lists all available commands organized by category.

---

### `help`
Get help for a specific command.

**Syntax:**
```bash
ollama-code help <command>
```

**Arguments:**
- `command` (required): The command to get help for

**Examples:**
```bash
ollama-code help ask
ollama-code help ask
ollama-code help generate
```

**Description:**
Provides detailed help information for a specific command, including usage, arguments, and examples.

## Command Syntax

### Basic Syntax
```bash
ollama-code <command> [arguments] [options]
```

### Argument Types
- **Positional arguments**: Required arguments in order
- **Named arguments**: Arguments with `--name` or `-n` flags
- **Optional arguments**: Arguments that can be omitted

### Option Flags
- **Short flags**: Single character flags (e.g., `-v`, `-h`)
- **Long flags**: Full word flags (e.g., `--verbose`, `--help`)
- **Boolean flags**: True/false options (e.g., `--debug`)
- **Value flags**: Options that require values (e.g., `--model llama3.2`)

## Global Options

### `--help, -h`
Display help information.

**Examples:**
```bash
ollama-code --help
ollama-code ask --help
```

### `--version, -v`
Display version information.

**Examples:**
```bash
ollama-code --version
```

### `--verbose`
Enable verbose output.

**Examples:**
```bash
ollama-code --verbose ask "How does async work?"
```

### `--quiet, -q`
Suppress non-essential output.

**Examples:**
```bash
ollama-code --quiet generate "a simple function"
```

## Command Categories


### AI Assistance
Commands for getting help from AI:
- `ask` - Ask questions
- `explain` - Explain code
- `fix` - Fix bugs

### Code Generation
Commands for creating and improving code:
- `generate` - Generate new code
- `refactor` - Improve existing code

### Model Management
Commands for managing AI models:
- `list-models` - List available models
- `pull-model` - Download models
- `set-model` - Set default model

### System
Commands for system operations:
- `config` - Manage configuration
- `run` - Execute commands
- `search` - Search codebase
- `theme` - Change UI theme
- `verbosity` - Set output level
- `edit` - Edit files
- `git` - Git operations

### Session
Commands for session management:
- `exit`/`quit` - Exit application
- `clear` - Clear display
- `reset` - Reset AI context
- `history` - View history
- `commands` - List commands
- `help` - Get help

## Tips and Best Practices

### Command Chaining
You can chain commands using shell operators:
```bash
ollama-code generate "a sorting function" --output sort.js && ollama-code explain sort.js
```

### Using Context
Provide context files for better AI responses:
```bash
ollama-code ask "How can I improve this?" --context ./src/main.js
```

### Model Selection
Use specific models for different tasks:
```bash
ollama-code ask "Explain this algorithm" --model codellama
ollama-code generate "Write a poem" --model llama3.2
```

### Configuration
Set up persistent configuration:
```bash
ollama-code config ai.defaultModel llama3.2
ollama-code config terminal.theme dark
```

### Error Handling
Use verbose mode for debugging:
```bash
ollama-code --verbose ask "What's wrong with this code?"
```

This command reference provides comprehensive information about all available commands in Ollama Code. For more specific help on any command, use the `help` command or the `--help` flag.
