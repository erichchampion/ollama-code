# ollama-code

Ollama Code CLI - Your local AI coding assistant in the terminal

[![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Commands](#commands)
- [Configuration](#configuration)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js >=18.0.0
- npm or yarn package manager
- [Ollama](https://ollama.ai/) installed and running locally

### Install from Source

```bash
# Clone the repository
git clone https://github.com/erichchampion/ollama-code.git
cd ollama-code/ollama-code

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start
```

## Quick Start

```bash
# Ask a question (simple mode - default)
ollama-code ask "How do I implement a binary search in TypeScript?"

# List available models
ollama-code list-models

# Download a model
ollama-code pull-model llama3.2

# Use advanced mode for more features
ollama-code --mode advanced explain src/file.js

# Use interactive mode for extended sessions
ollama-code --mode interactive
```

## CLI Modes

The Ollama Code CLI supports three modes to suit different use cases:

- **Simple Mode** (default): Basic commands - `ask`, `list-models`, `pull-model`
- **Advanced Mode**: Full feature set - code explanation, refactoring, system integration
- **Interactive Mode**: Command loop interface for extended coding sessions

See [CLI_MODES.md](CLI_MODES.md) for detailed usage instructions.

## Features

### 🤖 AI-Powered Code Assistance
- Interactive Q&A with local AI models
- Code explanation and analysis
- Automated bug fixing and refactoring
- AI-powered code generation

### 🔧 Model Management
- List and download Ollama models
- Switch between different models
- Model validation and testing

### 🛠️ Development Tools
- Configuration management
- File operations and editing
- Git integration
- Codebase searching

### 🔒 Privacy-Focused
- All processing happens locally
- No data sent to external services
- Complete control over your data

## Commands

### AI Assistance


### Model Management


### System Integration


### Session Management


### Help & Feedback


For detailed command usage, run:
```bash
ollama-code help <command-name>
```

## Configuration

The CLI uses a configuration system with the following key areas:

- **API Configuration** - Ollama server settings
- **AI Configuration** - Model preferences and behavior
- **Terminal Configuration** - UI and display settings
- **Code Analysis** - Code analysis and processing options
- **Git Configuration** - Version control integration

View and modify configuration:
```bash
# View current configuration
ollama-code config

# Set a configuration value
ollama-code config api.baseUrl http://localhost:11434
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

``
src/
├── ai/           # AI integration and Ollama client
├── commands/      # Command system and registration
├── config/        # Configuration management
├── errors/        # Error handling and messaging
├── terminal/      # Terminal interface and formatting
├── utils/         # Shared utilities
├── cli.ts         # Full-featured CLI entry point
└── simple-cli.ts  # Simplified CLI entry point
```

## Documentation

- [Technical Specification](TECHNICAL_SPECIFICATION.md) - Complete technical stack documentation
- [Command Reference](specify.md) - Detailed command documentation
- [Codebase Analysis](CODEBASE_ANALYSIS.md) - Current codebase structure and analysis
- [Claude Code Guide](CLAUDE.md) - Development guidance for Claude Code

### Generated Documentation

Run the documentation generation script to create up-to-date API references:
```bash
npm run docs:generate
```

### Documentation Commands

```bash
# Generate all documentation
npm run docs:generate-all

# Validate documentation
npm run docs:check-all

# Update documentation
npm run docs:update

# Full maintenance
npm run docs:full-maintenance
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run only unit tests
npm test

# Run documentation tests
npm run test:docs

# Run specific test files
npm test -- --testPathPattern=ai
```

### Test Coverage

The project includes comprehensive testing:
- **Unit Tests**: Individual function and module testing
- **Integration Tests**: Cross-module functionality testing
- **Documentation Tests**: Documentation validation and consistency
- **End-to-End Tests**: Complete workflow testing

## Performance

### Response Times
- **Command Execution**: < 100ms for simple commands
- **AI Processing**: Variable based on model and prompt complexity
- **File Operations**: < 50ms for typical file operations
- **Documentation Generation**: < 5s for full documentation suite

### Memory Usage
- **Base Memory**: ~50MB for core application
- **AI Processing**: Variable based on model size and context
- **File Caching**: Intelligent caching with memory limits

## Security

### Privacy-First Design
- **Local Processing**: All AI processing happens locally via Ollama
- **No Data Transmission**: No code or data sent to external services
- **Local Storage**: All data stored locally on user's machine
- **Optional Telemetry**: Anonymous usage tracking (opt-in)

### Security Features
- **Input Validation**: Comprehensive validation of all user inputs
- **Path Traversal Protection**: Prevention of unauthorized file access
- **Command Sanitization**: Validation of commands before execution
- **Type Safety**: TypeScript strict mode for compile-time safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

### Reporting Issues

Please report issues through the project's GitHub repository by creating a new issue with a detailed description of the problem.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

**Ollama Code CLI** - Your local AI coding assistant in the terminal.
Built with ❤️ using TypeScript and Node.js.
