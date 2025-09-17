# OLLAMA.md

This file provides guidance to Ollama Code when working with code in this repository.

## Project Overview

Ollama Code CLI is a command-line interface that provides AI-powered code assistance using local Ollama models. It enables developers to interact with large language models locally for code generation, explanation, refactoring, and debugging without requiring cloud-based AI services.

## Key Commands

### Development Commands
- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `npm run dev` - Run in development mode using ts-node
- `npm start` - Run the compiled CLI
- `npm run lint` - Run ESLint on source code
- `npm test` - Run Jest tests
- `npm run clean` - Remove build artifacts

### CLI Usage
- `node dist/src/simple-cli.js` - Run the simple CLI version
- Entry points: `simple-cli.ts` (basic) and `cli.ts` (full featured)

## Architecture

### Core Modules
- **`src/ai/`** - Ollama client integration and AI functionality
- **`src/commands/`** - Command system with registration and execution
- **`src/config/`** - Configuration management with schema validation
- **`src/terminal/`** - Terminal interface and formatting
- **`src/errors/`** - Error handling and user-friendly messaging
- **`src/utils/`** - Shared utilities including Ollama server management

### Key Components
- **OllamaClient** (`src/ai/ollama-client.ts`) - Core AI interface
- **Command Registry** (`src/commands/index.ts`) - Modular command system
- **Config System** (`src/config/`) - Type-safe configuration with Zod schemas
- **Terminal Interface** (`src/terminal/`) - Enhanced CLI experience with colors

### Entry Points
- **simple-cli.ts** - Minimal CLI for basic operations (ask, list-models, pull-model)
- **cli.ts** - Full-featured CLI with complete command set

### Command Categories
1. **AI Assistance**: ask, explain, fix, generate, refactor
2. **Model Management**: list-models, pull-model, set-model
3. **System Integration**: config, run, search, edit, git
4. **Session Management**: reset, clear
5. **Help & Feedback**: help, commands, bug, feedback

## Development Notes

### TypeScript Configuration
- Target: ES2022 with NodeNext modules
- Strict mode enabled
- Output directory: `./dist`
- Source maps and declarations generated
- ES modules throughout the codebase

### Dependencies
- **Core**: inquirer (prompts), node-fetch (HTTP), ora (spinners), zod (validation)
- **Terminal**: table formatting, terminal-link, color support
- **Dev**: TypeScript, ESLint, ts-node, Jest, Babel
- **Documentation**: markdownlint, markdown-link-check

### Local AI Focus
- All AI processing happens locally via Ollama
- No external API dependencies for AI features
- Server management utilities in `src/utils/ollama-server.ts`
- Privacy-focused design
- Model management and validation

### Documentation System
- Automated documentation generation from source code
- Comprehensive validation and testing framework
- Maintenance scripts for keeping docs up-to-date
- Cross-reference management and link validation

## Testing Strategy

### Test Categories
- **Unit Tests**: Individual function and module testing
- **Integration Tests**: Cross-module functionality testing
- **Documentation Tests**: Documentation validation and consistency
- **End-to-End Tests**: Complete workflow testing

### Test Commands
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

### Test Focus Areas
- Command argument parsing and validation
- Ollama client connection handling
- Configuration schema validation
- Error handling and user messaging
- Terminal formatting functions
- Documentation consistency and accuracy
- Link validation and code examples

## Code Organization

### Module Structure
Each module follows a consistent pattern:
- `index.ts` - Main module entry point and exports
- `types.ts` - TypeScript type definitions
- `utils/` - Module-specific utility functions
- `errors/` - Module-specific error handling

### Key Patterns
- **Dependency Injection**: Services injected rather than tightly coupled
- **Interface-Based Design**: Clear contracts between modules
- **Error Handling**: Comprehensive error classification and handling
- **Async/Await**: Modern asynchronous patterns throughout
- **Type Safety**: Strict TypeScript with comprehensive type definitions

## Development Workflow

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run in development mode: `npm run dev`

### Making Changes
1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:all`
4. Validate documentation: `npm run docs:check-all`
5. Update documentation if needed: `npm run docs:update`
6. Commit and push changes

### Code Quality
- Follow existing code patterns and conventions
- Add tests for new functionality
- Update documentation for API changes
- Use TypeScript strict mode
- Follow ESLint rules and fix warnings

## Documentation Guidelines

### Writing Documentation
- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Follow markdown best practices
- Validate all links and code examples

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

### Documentation Structure
- **README.md**: Project overview and quick start
- **TECHNICAL_SPECIFICATION.md**: Complete technical details
- **Module docs**: Individual documentation for each module
- **Command reference**: Detailed command documentation
- **Configuration guide**: All configuration options

## Common Tasks

### Adding New Commands
1. Add command definition in `src/commands/register.ts`
2. Implement command handler function
3. Add command documentation
4. Update command reference
5. Add tests for the new command

### Modifying Configuration
1. Update schema in `src/config/schema.ts`
2. Update default values in `src/config/defaults.ts`
3. Update configuration documentation
4. Add validation tests
5. Update configuration examples

### Adding New Modules
1. Create module directory in `src/`
2. Add `index.ts` with exports
3. Add `types.ts` for type definitions
4. Implement module functionality
5. Add module documentation
6. Update main application initialization

### Debugging Issues
1. Enable verbose logging: `--verbose` flag
2. Check error messages and stack traces
3. Use debug mode for detailed output
4. Check Ollama server status
5. Validate configuration and dependencies

## Best Practices

### Code Quality
- Write self-documenting code with clear variable names
- Use TypeScript types extensively
- Handle errors gracefully with appropriate messages
- Write tests for all new functionality
- Keep functions small and focused

### Performance
- Use async/await for I/O operations
- Implement proper error handling and retry logic
- Cache expensive operations when appropriate
- Optimize for common use cases
- Monitor memory usage and cleanup resources

### Security
- Validate all user inputs
- Sanitize file paths and commands
- Use secure defaults
- Handle sensitive data appropriately
- Follow security best practices

### Documentation
- Keep documentation current with code changes
- Use consistent formatting and style
- Include practical examples
- Validate all links and references
- Test code examples before publishing

## Troubleshooting

### Common Issues
- **Build Errors**: Check TypeScript configuration and dependencies
- **Test Failures**: Verify test environment and dependencies
- **Documentation Issues**: Run validation and fix reported problems
- **Ollama Connection**: Ensure Ollama server is running
- **Permission Errors**: Check file permissions and user access

### Getting Help
- Check existing documentation first
- Use `ollama-code help <command>` for command-specific help
- Run `npm run docs:check-all` to validate documentation
- Use `ollama-code bug` to report issues
- Check GitHub issues for known problems

## Contributing

### Before Contributing
1. Read the project documentation
2. Understand the codebase structure
3. Follow the development workflow
4. Write tests for your changes
5. Update documentation as needed

### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Run all tests and validation
4. Update documentation
5. Submit pull request with clear description
6. Address review feedback

### Code Review Checklist
- [ ] Code follows project patterns and conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes without migration guide
- [ ] Error handling is appropriate
- [ ] Performance impact is considered