# Terminal Module Documentation

This document provides comprehensive documentation for the `src/terminal/` module, which handles user interface components, interactive prompts, and output formatting for the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [UI Components](#ui-components)
- [Interactive Prompts](#interactive-prompts)
- [Output Formatting](#output-formatting)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The terminal module (`src/terminal/`) provides a comprehensive user interface system for the Ollama Code CLI, including interactive prompts, output formatting, progress indicators, and terminal capabilities detection.

### Purpose

- **User Interface**: Provide a rich terminal-based user interface
- **Interactive Prompts**: Handle user input with various prompt types
- **Output Formatting**: Format and display content with colors and styling
- **Progress Indicators**: Show progress for long-running operations
- **Terminal Detection**: Detect terminal capabilities and adapt accordingly

### Key Features

- **Rich Formatting**: Colors, syntax highlighting, and text styling
- **Interactive Prompts**: Multiple prompt types (text, password, confirm, list, etc.)
- **Progress Spinners**: Visual progress indicators for operations
- **Terminal Detection**: Automatic detection of terminal capabilities
- **Responsive Design**: Adapts to different terminal sizes
- **Accessibility**: Fallbacks for non-interactive terminals

## Architecture

### Module Structure

```
src/terminal/
├── index.ts           # Main terminal interface and initialization
├── formatting.ts      # Output formatting and text processing
├── prompt.ts          # Interactive prompt system
└── types.ts          # TypeScript type definitions
```

### Dependencies

- **Internal**: `../utils/logger`
- **External**: `chalk`, `inquirer`, `ora`, `terminal-link`, `table`
- **Runtime**: Node.js built-in modules

### Design Patterns

- **Facade Pattern**: Simplified interface for complex terminal operations
- **Strategy Pattern**: Different formatting strategies for different content types
- **Observer Pattern**: Terminal resize event handling
- **Factory Pattern**: Prompt creation and management

## UI Components

### Terminal Interface

The main terminal interface provides a comprehensive set of UI components:

#### Basic Display Methods

```typescript
// Display formatted content
terminal.display(content: string): void

// Display messages with different types
terminal.info(message: string): void
terminal.success(message: string): void
terminal.warn(message: string): void
terminal.error(message: string): void
terminal.emphasize(message: string): void
```

#### Table Display

```typescript
// Display data in table format
terminal.table(data: any[][], options?: {
  header?: string[];
  border?: boolean;
}): void
```

#### Links and Navigation

```typescript
// Create clickable links
terminal.link(text: string, url: string): string
```

#### Screen Management

```typescript
// Clear the terminal screen
terminal.clear(): void

// Display welcome message
terminal.displayWelcome(): void
```

### Progress Indicators

#### Spinner System

```typescript
// Create a progress spinner
const spinner = terminal.spinner('Processing...', 'operation-id');

// Update spinner text
spinner.update('Almost done...');

// Complete spinner
spinner.succeed('Operation completed!');

// Fail spinner
spinner.fail('Operation failed!');

// Stop spinner
spinner.stop();
```

#### Spinner States

- **Running**: Shows animated progress
- **Success**: Shows success message and stops
- **Failure**: Shows error message and stops
- **Warning**: Shows warning message and stops
- **Info**: Shows info message and stops

## Interactive Prompts

### Prompt System

The terminal module provides a comprehensive prompt system using Inquirer.js:

#### Basic Prompt Types

##### Text Input
```typescript
import { promptText } from './terminal/prompt.js';

const name = await promptText('What is your name?', {
  name: 'name',
  default: 'Anonymous',
  required: true,
  validate: (input) => input.length > 0 || 'Name is required'
});
```

##### Password Input
```typescript
import { promptPassword } from './terminal/prompt.js';

const password = await promptPassword('Enter your password:', {
  name: 'password',
  mask: '*',
  required: true
});
```

##### Confirmation
```typescript
import { promptConfirm } from './terminal/prompt.js';

const confirmed = await promptConfirm('Do you want to continue?', {
  name: 'continue',
  default: true
});
```

##### List Selection
```typescript
import { promptList } from './terminal/prompt.js';

const choice = await promptList('Choose an option:', [
  'Option 1',
  'Option 2',
  'Option 3'
], {
  name: 'choice',
  default: 'Option 1'
});
```

##### Multi-Select Checkbox
```typescript
import { promptCheckbox } from './terminal/prompt.js';

const selections = await promptCheckbox('Select multiple options:', [
  { name: 'Option 1', value: 'opt1' },
  { name: 'Option 2', value: 'opt2', checked: true },
  { name: 'Option 3', value: 'opt3' }
], {
  name: 'selections'
});
```

##### Editor Prompt
```typescript
import { promptEditor } from './terminal/prompt.js';

const content = await promptEditor('Edit the content:', {
  name: 'content',
  default: 'Initial content',
  postfix: '.txt'
});
```

### Advanced Prompt Options

#### Custom Validation
```typescript
const email = await promptText('Enter your email:', {
  validate: (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input) || 'Please enter a valid email address';
  }
});
```

#### Conditional Prompts
```typescript
const useAdvanced = await promptConfirm('Use advanced options?');

if (useAdvanced) {
  const advancedOption = await promptList('Choose advanced option:', [
    'Option A',
    'Option B'
  ]);
}
```

#### Prompt Chaining
```typescript
const name = await promptText('What is your name?');
const age = await promptText('What is your age?', {
  validate: (input) => {
    const age = parseInt(input);
    return !isNaN(age) && age > 0 || 'Please enter a valid age';
  }
});
const confirmed = await promptConfirm(`Is ${name}, age ${age} correct?`);
```

## Output Formatting

### Text Formatting

The terminal module provides rich text formatting capabilities:

#### Markdown-like Formatting

```typescript
// Bold text
terminal.display('**This is bold text**');

// Italic text
terminal.display('*This is italic text*');

// Inline code
terminal.display('Use `console.log()` to print');

// Code blocks
terminal.display(`
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`
`);
```

#### Headers and Lists

```typescript
// Headers
terminal.display('# Main Header');
terminal.display('## Sub Header');
terminal.display('### Section Header');

// Lists
terminal.display(`
- First item
- Second item
- Third item
`);
```

#### Syntax Highlighting

The module provides basic syntax highlighting for code blocks:

```typescript
// JavaScript code with syntax highlighting
terminal.display(`
\`\`\`javascript
function calculateSum(a, b) {
  return a + b; // This is a comment
}
\`\`\`
`);
```

### Color Support

#### Automatic Color Detection

```typescript
// Colors are automatically enabled/disabled based on terminal support
terminal.info('This will be blue if colors are supported');
terminal.success('This will be green if colors are supported');
terminal.warn('This will be yellow if colors are supported');
terminal.error('This will be red if colors are supported');
```

#### Manual Color Control

```typescript
// Force colors on/off
const terminal = await initTerminal({
  terminal: {
    useColors: true // or false
  }
});
```

### Word Wrapping

```typescript
// Text is automatically wrapped to terminal width
terminal.display('This is a very long line that will be automatically wrapped to fit within the terminal width and provide a better reading experience.');
```

## Core Components

### Terminal Class

The main terminal interface class.

#### Constructor

```typescript
constructor(config: TerminalConfig)
```

**Parameters:**
- `config`: Terminal configuration options

#### Key Methods

##### `detectCapabilities(): Promise<void>`
Detect terminal capabilities and adapt behavior accordingly.

##### `display(content: string): void`
Display formatted content in the terminal.

##### `clear(): void`
Clear the terminal screen.

##### `displayWelcome(): void`
Display the welcome message.

##### `spinner(text: string, id?: string): SpinnerInstance`
Create a progress spinner.

##### `prompt<T>(options: PromptOptions): Promise<T>`
Create an interactive prompt.

##### `table(data: any[][], options?: TableOptions): void`
Display data in table format.

##### `link(text: string, url: string): string`
Create a clickable link.

### SpinnerInstance Interface

Interface for managing progress spinners.

#### Methods

##### `update(text: string): SpinnerInstance`
Update the spinner text.

##### `succeed(text?: string): SpinnerInstance`
Mark spinner as successful.

##### `fail(text?: string): SpinnerInstance`
Mark spinner as failed.

##### `warn(text?: string): SpinnerInstance`
Mark spinner with warning.

##### `info(text?: string): SpinnerInstance`
Mark spinner with info.

##### `stop(): SpinnerInstance`
Stop the spinner.

### Formatting Functions

#### `formatOutput(text: string, options?: FormatOptions): string`
Format text for terminal display.

**Parameters:**
- `text`: Text to format
- `options`: Formatting options

**Returns:** Formatted text string

#### `clearScreen(): void`
Clear the terminal screen.

#### `getTerminalSize(): { rows: number; columns: number }`
Get terminal dimensions.

#### `wordWrap(text: string, width: number): string`
Wrap text to specified width.

## Usage Examples

### Basic Terminal Usage

```typescript
import { initTerminal } from './terminal/index.js';

// Initialize terminal
const terminal = await initTerminal({
  terminal: {
    theme: 'dark',
    useColors: true,
    showProgressIndicators: true,
    codeHighlighting: true
  }
});

// Display welcome message
terminal.displayWelcome();

// Display formatted content
terminal.display('**Welcome to Ollama Code CLI!**');
terminal.info('This is an informational message');
terminal.success('Operation completed successfully');
terminal.warn('This is a warning message');
terminal.error('This is an error message');
```

### Interactive Prompts

```typescript
import { promptText, promptConfirm, promptList } from './terminal/prompt.js';

// Text input
const name = await promptText('What is your name?', {
  required: true,
  validate: (input) => input.length > 0 || 'Name is required'
});

// Confirmation
const confirmed = await promptConfirm(`Hello ${name}, do you want to continue?`);

if (confirmed) {
  // List selection
  const choice = await promptList('Choose an option:', [
    'Analyze code',
    'Generate code',
    'Fix bugs',
    'Explain code'
  ]);
  
  console.log(`You chose: ${choice}`);
}
```

### Progress Indicators

```typescript
// Create spinner
const spinner = terminal.spinner('Processing your request...', 'ai-request');

try {
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  spinner.update('Almost done...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Success
  spinner.succeed('Request processed successfully!');
} catch (error) {
  // Failure
  spinner.fail('Request failed: ' + error.message);
}
```

### Table Display

```typescript
// Display data in table format
const data = [
  ['Command', 'Description', 'Status'],
  ['ask', 'Ask AI a question', 'Active'],
  ['explain', 'Explain code', 'Active'],
  ['generate', 'Generate code', 'Active'],
  ['fix', 'Fix bugs', 'Inactive']
];

terminal.table(data, {
  header: ['Command', 'Description', 'Status'],
  border: true
});
```

### Code Display

```typescript
// Display code with syntax highlighting
const code = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

terminal.display(`
Here's a Fibonacci function:

\`\`\`javascript
${code}
\`\`\`

This function calculates the nth Fibonacci number recursively.
`);
```

### Error Handling

```typescript
try {
  const result = await someOperation();
  terminal.success('Operation completed successfully');
} catch (error) {
  terminal.error(`Operation failed: ${error.message}`);
  
  // Show additional help
  terminal.info('Try running the command again or check the logs for more details');
}
```

### Terminal Configuration

```typescript
// Initialize with custom configuration
const terminal = await initTerminal({
  terminal: {
    theme: 'light',           // 'dark', 'light', or 'system'
    useColors: true,          // Enable/disable colors
    showProgressIndicators: true, // Show/hide progress spinners
    codeHighlighting: true,   // Enable/disable syntax highlighting
    maxHeight: 50,           // Maximum terminal height
    maxWidth: 120            // Maximum terminal width
  }
});
```

## Best Practices

### UI Design

1. **Consistent Styling**: Use consistent colors and formatting
2. **Clear Messages**: Provide clear, actionable messages
3. **Progress Feedback**: Show progress for long operations
4. **Error Handling**: Provide helpful error messages
5. **Accessibility**: Ensure fallbacks for non-interactive terminals

### Prompt Design

1. **Clear Questions**: Ask clear, specific questions
2. **Validation**: Validate user input appropriately
3. **Defaults**: Provide sensible defaults when possible
4. **Help Text**: Include help text for complex prompts
5. **Error Messages**: Provide clear error messages

### Performance

1. **Lazy Loading**: Load terminal components only when needed
2. **Efficient Rendering**: Use efficient rendering for large outputs
3. **Memory Management**: Clean up spinners and resources
4. **Async Operations**: Use async/await for non-blocking operations

### Error Handling

1. **Graceful Degradation**: Fall back gracefully when features aren't available
2. **User-Friendly Messages**: Provide clear error messages
3. **Recovery Options**: Suggest recovery actions
4. **Logging**: Log errors for debugging

### Code Organization

1. **Separation of Concerns**: Separate UI logic from business logic
2. **Reusable Components**: Create reusable UI components
3. **Configuration**: Use configuration for customization
4. **Type Safety**: Use TypeScript for type safety

This documentation provides comprehensive guidance for using the terminal module effectively. The module is designed to be flexible, user-friendly, and easy to use while providing rich terminal-based user interface capabilities for the Ollama Code CLI.
