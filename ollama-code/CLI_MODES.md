# Ollama Code CLI - Modes and Usage Guide

The Ollama Code CLI now supports multiple modes to suit different user preferences and use cases. This guide explains how to use each mode and their features.

## 🚀 Quick Start

```bash
# Install and build
npm install
npm run build

# Use the CLI (defaults to simple mode)
npx ollama-code ask "How do I implement a binary search?"

# Use advanced mode
npx ollama-code --mode advanced explain src/file.js

# Use interactive mode
npx ollama-code --mode interactive
```

## 📋 Available Modes

### 1. Simple Mode (Default)
**Best for**: Quick one-off commands, beginners, simple AI interactions

The simple mode provides basic functionality with minimal complexity:

```bash
# Basic usage (simple mode is default)
ollama-code ask "How do I implement a binary search?"
ollama-code list-models
ollama-code pull-model llama3.2

# Explicit simple mode
ollama-code --mode simple ask "What is TypeScript?"
```

**Available Commands:**
- `ask <question>` - Ask Ollama a question
- `list-models` - List available models
- `pull-model <name>` - Download a model

### 2. Advanced Mode
**Best for**: Power users, complex workflows, full feature set

The advanced mode provides access to the complete command registry with all features:

```bash
# Use advanced mode
ollama-code --mode advanced <command>

# Examples
ollama-code --mode advanced explain src/file.js
ollama-code --mode advanced refactor src/file.js --focus performance
ollama-code --mode advanced generate "a REST API server" --language TypeScript
```

**Available Commands:**
- **AI Assistance**: `ask`, `explain`, `fix`, `refactor`, `generate`
- **Model Management**: `list-models`, `pull-model`, `set-model`
- **System**: `config`, `search`, `run`, `edit`, `git`
- **Session**: `clear`, `reset`, `history`, `commands`, `help`
- **UI**: `theme`, `verbosity`
- **Feedback**: `bug`, `feedback`

### 3. Interactive Mode
**Best for**: Extended coding sessions, exploratory work, conversational AI

The interactive mode provides a command loop interface where you can run multiple commands in sequence:

```bash
# Start interactive mode
ollama-code --mode interactive

# Or use the dedicated command
ollama-code-interactive
```

**Interactive Features:**
- Command loop with `ollama-code>` prompt
- All advanced mode commands available
- Session persistence
- Easy command chaining
- Built-in help system

## 🛠️ Command Examples

### AI Assistance Commands

```bash
# Ask questions
ollama-code ask "How do I implement a binary search tree in TypeScript?"

# Explain code files
ollama-code --mode advanced explain src/utils/helpers.ts

# Fix code issues
ollama-code --mode advanced fix src/buggy-file.js --issue "Infinite loop in sort function"

# Refactor code
ollama-code --mode advanced refactor src/old-code.js --focus readability

# Generate new code
ollama-code --mode advanced generate "a function that sorts an array using quick sort" --language JavaScript
```

### Model Management

```bash
# List available models
ollama-code list-models

# Download a new model
ollama-code pull-model llama3.2

# Set default model for session
ollama-code --mode advanced set-model codellama
```

### System Commands

```bash
# Search codebase
ollama-code --mode advanced search "function main"

# Run terminal commands
ollama-code --mode advanced run "npm test"

# Edit files
ollama-code --mode advanced edit src/new-file.ts

# Git operations
ollama-code --mode advanced git "status"
ollama-code --mode advanced git "add ."
ollama-code --mode advanced git "commit -m 'Add new feature'"
```

### Configuration

```bash
# View configuration
ollama-code --mode advanced config

# Set configuration values
ollama-code --mode advanced config api.baseUrl http://localhost:11434
ollama-code --mode advanced config telemetry.enabled false

# Change theme
ollama-code --mode advanced theme dark

# Set verbosity level
ollama-code --mode advanced verbosity debug
```

## 🔧 Development Scripts

The package.json includes scripts for different modes:

```bash
# Development
npm run dev                    # Default mode
npm run dev:simple            # Simple mode
npm run dev:advanced          # Advanced mode
npm run dev:interactive       # Interactive mode

# Production
npm start                     # Default mode
npm run start:simple          # Simple mode
npm run start:advanced        # Advanced mode
npm run start:interactive     # Interactive mode
```

## 🎯 Choosing the Right Mode

### Use Simple Mode when:
- You want quick, one-off AI interactions
- You're new to the CLI
- You only need basic ask/list/pull functionality
- You prefer minimal command complexity

### Use Advanced Mode when:
- You need access to all features
- You want to explain, fix, or refactor code
- You need system integration (git, search, etc.)
- You want full configuration control

### Use Interactive Mode when:
- You're doing extended coding sessions
- You want to chain multiple commands
- You prefer a conversational interface
- You're exploring and experimenting

## 🚀 Advanced Features

### Command Aliases
Many commands have aliases for convenience:
- `quit` / `exit` - Exit the application
- `q` - Quick exit
- `h` / `help` - Get help

### Command Categories
Commands are organized into categories:
- **Assistance** - AI help and explanations
- **Code Generation** - Code creation and refactoring
- **Models** - Model management
- **System** - System integration and utilities
- **Session** - Session management and UI

### Interactive Features
In interactive mode, you get:
- Command history (use arrow keys)
- Tab completion
- Real-time error handling
- Session persistence
- Easy command discovery

## 🔍 Getting Help

```bash
# General help
ollama-code --help

# Help for specific command
ollama-code --mode advanced help <command>

# List all commands (in interactive mode)
ollama-code --mode interactive
# Then type: commands

# Command-specific help (in interactive mode)
ollama-code --mode interactive
# Then type: help <command>
```

## 🐛 Troubleshooting

### Common Issues

1. **"Unknown command" error**
   - Make sure you're using the right mode
   - Check command spelling
   - Use `--mode advanced` for full command set

2. **Ollama server not running**
   - Ensure Ollama server is running
   - Start with: `ollama serve`

3. **Command not found in simple mode**
   - Use `--mode advanced` for more commands
   - Simple mode only supports: ask, list-models, pull-model

4. **Interactive mode not working**
   - Ensure your terminal supports interactive input
   - Try running `ollama-code --mode interactive` directly

### Getting Support

For support and feedback, please refer to the project's GitHub repository or documentation.

## 📚 Next Steps

1. **Start with Simple Mode**: Get familiar with basic AI interactions
2. **Explore Advanced Mode**: Try code explanation and generation features
3. **Use Interactive Mode**: For extended coding sessions
4. **Customize Configuration**: Set up your preferred settings
5. **Integrate with Workflow**: Use system commands for git, search, etc.

The Ollama Code CLI is designed to grow with your needs - start simple and add complexity as you require more features!
