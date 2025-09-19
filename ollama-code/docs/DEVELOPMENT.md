# Development Guide

This document provides comprehensive guidance for developers working on the Ollama Code CLI project, including setup instructions, coding standards, and contribution guidelines.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Git Workflow](#git-workflow)
- [Code Review Process](#code-review-process)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Version 2.30.0 or higher
- **Ollama**: Latest version for AI functionality
- **TypeScript**: Will be installed as a dev dependency

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/erichchampion/ollama-code.git
   cd ollama-code
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Start Ollama server** (if not already running):
   ```bash
   ollama serve
   ```

6. **Test the CLI**:
   ```bash
   npm run cli -- --help
   ```

## Development Environment

### IDE Configuration

#### VS Code (Recommended)

Install the following extensions:
- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Test runner integration
- **Markdown All in One** - Documentation support

#### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript", "javascript"],
  "files.associations": {
    "*.md": "markdown"
  }
}
```

### Environment Variables

Create a `.env` file in the project root:
```bash
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Optional: Custom workspace
OLLAMA_CODE_WORKSPACE=/path/to/your/workspace
```

### Project Structure

```
ollama-code/
├── src/                    # Source code
│   ├── ai/                # AI integration
│   ├── auth/              # Authentication
│   ├── commands/          # Command system
│   ├── config/            # Configuration
│   ├── errors/            # Error handling
│   ├── terminal/          # Terminal interface
│   ├── utils/             # Utilities
│   └── index.ts           # Main entry point
├── dist/                  # Compiled JavaScript
├── docs/                  # Generated documentation
├── tests/                 # Test files
├── scripts/               # Build and utility scripts
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── jest.config.js         # Jest configuration
```

## Coding Standards

### TypeScript Guidelines

#### Type Safety
- Use strict TypeScript configuration
- Define explicit types for all function parameters and return values
- Avoid `any` type - use `unknown` or specific types instead
- Use type guards for runtime type checking

```typescript
// Good
function processUser(user: User): ProcessedUser {
  return {
    id: user.id,
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase()
  };
}

// Avoid
function processUser(user: any): any {
  return user;
}
```

#### Interface Design
- Use interfaces for object shapes
- Prefer composition over inheritance
- Use generic types for reusable components

```typescript
interface CommandHandler<T = any> {
  execute(args: T): Promise<void>;
  validate?(args: T): boolean;
}

interface UserCommand extends CommandHandler<UserArgs> {
  name: string;
  description: string;
}
```

#### Error Handling
- Use custom error classes for different error types
- Always handle errors at the appropriate level
- Provide meaningful error messages

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage
if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format', 'email');
}
```

### Code Style

#### Naming Conventions
- **Variables and functions**: `camelCase`
- **Classes and interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ts`

```typescript
// Good
const userName = 'john_doe';
const MAX_RETRIES = 3;
class UserService { }
interface UserData { }

// Avoid
const user_name = 'john_doe';
const maxRetries = 3;
class userService { }
```

#### Function Design
- Keep functions small and focused (max 20-30 lines)
- Use descriptive function names
- Prefer pure functions when possible
- Use async/await over Promises

```typescript
// Good
async function fetchUserById(id: string): Promise<User | null> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    return null;
  }
}

// Avoid
function fetchUser(id) {
  return api.get(`/users/${id}`).then(res => res.data).catch(err => {
    console.log(err);
    return null;
  });
}
```

#### Comments and Documentation
- Use JSDoc for public APIs
- Write self-documenting code
- Comment complex business logic
- Keep comments up-to-date

```typescript
/**
 * Processes a file and returns its content with metadata
 * @param filePath - Path to the file to process
 * @param options - Processing options
 * @returns Promise resolving to file content with metadata
 * @throws {FileNotFoundError} When file doesn't exist
 * @throws {PermissionError} When file cannot be read
 */
async function processFile(
  filePath: string,
  options: ProcessOptions = {}
): Promise<ProcessedFile> {
  // Implementation
}
```

### Module Organization

#### File Structure
- One main export per file
- Use index files for clean imports
- Group related functionality together

```typescript
// src/ai/index.ts
export { OllamaClient } from './ollama-client';
export { initAI, getAIClient } from './client';
export type { OllamaMessage, OllamaOptions } from './types';

// src/ai/ollama-client.ts
export class OllamaClient {
  // Implementation
}
```

#### Import/Export Guidelines
- Use named exports for most cases
- Use default exports sparingly
- Group imports logically

```typescript
// Good
import { OllamaClient, initAI } from './ai';
import { CommandRegistry } from './commands';
import type { ConfigType } from './config';

// Avoid
import * as AI from './ai';
import { OllamaClient as Client } from './ai';
```

## Testing Guidelines

### Test Structure

#### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Test both success and error cases

```typescript
// tests/unit/ai/ollama-client.test.ts
import { OllamaClient } from '../../src/ai/ollama-client';

describe('OllamaClient', () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = new OllamaClient();
  });

  describe('generateCompletion', () => {
    it('should generate completion for valid input', async () => {
      const result = await client.generateCompletion('Hello world');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should throw error for invalid input', async () => {
      await expect(client.generateCompletion('')).rejects.toThrow();
    });
  });
});
```

#### Integration Tests
- Test module interactions
- Use real dependencies where possible
- Test complete workflows

```typescript
// tests/integration/commands.test.ts
import { CommandRegistry } from '../../src/commands';
import { initAI } from '../../src/ai';

describe('Command Integration', () => {
  let registry: CommandRegistry;

  beforeAll(async () => {
    await initAI();
    registry = new CommandRegistry();
  });

  it('should execute code command successfully', async () => {
    const result = await registry.execute('code', ['--help']);
    expect(result.success).toBe(true);
  });
});
```

#### Documentation Tests
- Validate documentation accuracy
- Check for broken links
- Ensure code examples work

```typescript
// tests/docs/documentation.test.ts
import { validateDocumentation } from '../utils/doc-validator';

describe('Documentation', () => {
  it('should have valid markdown syntax', () => {
    const result = validateDocumentation('README.md');
    expect(result.valid).toBe(true);
  });

  it('should have working code examples', () => {
    const examples = extractCodeExamples('README.md');
    examples.forEach(example => {
      expect(() => eval(example)).not.toThrow();
    });
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/ai/ollama-client.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run documentation tests
npm run test:docs
```

### Test Coverage

- Aim for 80%+ code coverage
- Focus on critical business logic
- Test error conditions and edge cases
- Use coverage reports to identify gaps

## Documentation Standards

### Code Documentation

#### JSDoc Comments
- Document all public APIs
- Include parameter types and descriptions
- Document return values and exceptions
- Provide usage examples

```typescript
/**
 * Generates AI completion using Ollama
 * @param prompt - The input prompt for AI generation
 * @param options - Optional configuration for generation
 * @returns Promise resolving to generated text
 * @throws {OllamaError} When Ollama server is unavailable
 * @example
 * ```typescript
 * const result = await generateCompletion('Hello world', {
 *   model: 'llama2',
 *   temperature: 0.7
 * });
 * ```
 */
async function generateCompletion(
  prompt: string,
  options: GenerationOptions = {}
): Promise<string> {
  // Implementation
}
```

#### README Files
- Include in each module directory
- Explain module purpose and usage
- Provide code examples
- Document configuration options

### Markdown Documentation

#### Writing Style
- Use clear, concise language
- Write for your audience (developers)
- Use active voice
- Include practical examples

#### Structure
- Use consistent heading hierarchy
- Include table of contents for long documents
- Use code blocks with syntax highlighting
- Include cross-references

#### Code Examples
- Use realistic, working examples
- Include expected output
- Test all code examples
- Keep examples up-to-date

## Git Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-user-authentication`
- `bugfix/fix-memory-leak`
- `docs/update-api-documentation`
- `refactor/improve-error-handling`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

Examples:
```
feat(ai): add streaming support for completions

fix(auth): resolve token expiration issue

docs(api): update command reference

refactor(utils): improve error handling
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following coding standards
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Run tests** and ensure they pass
6. **Create pull request** with descriptive title
7. **Request review** from team members
8. **Address feedback** and make changes
9. **Merge** after approval

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Code Review Process

### Review Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

#### Code Quality
- [ ] Code is readable and maintainable
- [ ] Functions are focused and small
- [ ] Naming is clear and consistent
- [ ] No code duplication

#### Testing
- [ ] Tests cover new functionality
- [ ] Tests are meaningful and not trivial
- [ ] Test coverage is adequate
- [ ] All tests pass

#### Documentation
- [ ] Code is well-documented
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Examples are provided

### Review Guidelines

#### For Reviewers
- Be constructive and specific
- Focus on code, not the person
- Suggest improvements, don't just criticize
- Approve when ready, don't be overly cautious

#### For Authors
- Respond to all feedback
- Ask questions if unclear
- Make changes promptly
- Be open to suggestions

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# TypeScript compilation errors
npm run build

# Check TypeScript configuration
npx tsc --noEmit

# Clear build cache
rm -rf dist/
npm run build
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/ai/ollama-client.test.ts

# Debug test issues
npm test -- --detectOpenHandles
```

#### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules/ package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

#### Ollama Connection Issues
```bash
# Check Ollama status
ollama list

# Start Ollama server
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run cli -- --help
```

### Performance Issues

#### Memory Usage
```bash
# Check memory usage
node --inspect dist/src/simple-cli.js

# Profile with Chrome DevTools
node --inspect-brk dist/src/simple-cli.js
```

#### Slow Tests
```bash
# Run tests with timing
npm test -- --verbose --detectSlowTests

# Run specific test suite
npm test -- tests/unit/
```

## Contributing

### Before Contributing

1. **Read the documentation** thoroughly
2. **Check existing issues** and pull requests
3. **Discuss major changes** in issues first
4. **Fork the repository** and create a branch
5. **Follow coding standards** and guidelines

### Contribution Types

#### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide system information
- Include error messages and logs

#### Feature Requests
- Use the feature request template
- Explain the use case
- Provide examples if possible
- Consider implementation complexity

#### Code Contributions
- Follow the coding standards
- Write comprehensive tests
- Update documentation
- Ensure all checks pass

### Getting Help

#### Documentation
- Check existing documentation first
- Look for similar issues in GitHub
- Read code comments and examples

#### Community
- Create GitHub issues for questions
- Use discussions for general topics
- Tag maintainers for urgent issues

#### Code Review
- Request review from maintainers
- Be patient with review process
- Address feedback promptly
- Ask questions if unclear

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

This development guide ensures consistent, high-quality contributions to the Ollama Code CLI project. Follow these guidelines to maintain code quality and project standards.
