# Multi-Line Input Support

## Overview

The ollama-code application now supports multi-line input through automatic paste detection. This allows users to paste multi-line text (such as specifications, code snippets, or long prompts) without the application executing after the first line.

## How It Works

### Automatic Paste Detection

The system uses a 50ms timing window to detect when multiple lines are being pasted:

1. **Single-line mode (default)**: When you type or paste a single line, it executes immediately
2. **Multi-line mode (automatic)**: When multiple lines are detected within 50ms, the system automatically switches to multi-line mode

### Multi-Line Mode Indicators

When multi-line input is detected, you'll see:
```
ℹ Multi-line input detected. Enter an empty line to submit, or type "cancel" to cancel.
...
```

The prompt changes from `💬 How can I help you?` to `...` to indicate you're in multi-line mode.

## Usage

### Pasting Multi-Line Content

Simply paste your multi-line content as you normally would:

```
Build a REST API endpoint with these specifications:
Requirements:
- POST /api/users endpoint
- Accepts JSON payload with name, email, password
- Validates email format and password strength
- Returns 201 on success with user object
- Returns 400 on validation errors
Acceptance Criteria:
- Email must be unique in database
- Password must be at least 8 characters
- Response includes created timestamp
- Endpoint is properly documented
```

After pasting, the system will automatically detect the multi-line input and switch to multi-line mode.

### Submitting Multi-Line Input

Two ways to submit:

1. **Press Enter on an empty line** - Submit the accumulated input
2. **Type "cancel"** - Cancel the input and return to the prompt

### Continuing Multi-Line Input

After the paste is complete, you can continue typing additional lines. Each line you type will be added to the input. The prompt will show `...` to indicate continuation.

## Implementation Details

### Files Modified

1. **src/interactive/enhanced-mode.ts** (line 1432)
   - Modified `getUserInput()` method to support multi-line input
   - Uses Node.js `readline` module for raw input handling
   - Implements paste detection with 50ms timing window

2. **src/interactive/optimized-enhanced-mode.ts** (line 1096)
   - Same modifications as enhanced-mode.ts
   - Maintains timeout protection for user input

### Key Features

- **Non-intrusive**: Single-line input works exactly as before
- **Automatic detection**: No special key combinations needed
- **Visual feedback**: Clear indicators when in multi-line mode
- **Cancellable**: Type "cancel" to abort multi-line input
- **Timeout protected**: Respects existing input timeout configuration

### Technical Approach

The implementation uses a paste buffer and timer-based detection:

```typescript
let pasteBuffer: string[] = [];
let pasteTimer: NodeJS.Timeout | null = null;

rl.on('line', (line: string) => {
  if (pasteTimer) clearTimeout(pasteTimer);

  pasteBuffer.push(line);

  pasteTimer = setTimeout(() => {
    if (pasteBuffer.length > 1) {
      // Multi-line paste detected
      isMultiLineMode = true;
      // Show indicator and switch prompt
    } else if (pasteBuffer.length === 1) {
      // Single line - return immediately
      resolve(pasteBuffer[0]);
    }
  }, 50); // 50ms detection window
});
```

## Edge Cases Handled

1. **Single line input**: Works immediately as before
2. **Pasted single line**: Treated as single line (no mode switch)
3. **Ctrl+C**: Cancels input and returns empty string
4. **Timeout**: Respects existing timeout configuration in optimized mode
5. **Empty lines in paste**: Preserved in the output
6. **Non-interactive terminals**: Gracefully falls back to previous behavior

## Testing

To test the feature:

1. Start ollama-code in interactive mode:
   ```bash
   yarn build
   ./dist/src/index.js
   ```

2. Paste multi-line content (like the example above)

3. Verify that:
   - Multi-line mode indicator appears
   - Prompt changes to `...`
   - Empty line submits the input
   - "cancel" cancels the input

## Future Enhancements

Possible improvements:

1. **Configurable timeout**: Allow users to adjust the 50ms paste detection window
2. **Special key binding**: Add Ctrl+Enter or similar to explicitly enter multi-line mode
3. **Line numbers**: Show line numbers in multi-line mode
4. **Syntax highlighting**: Highlight code in multi-line input
5. **Edit mode**: Allow editing previous lines before submission

## Compatibility

- ✅ Works with all terminal emulators
- ✅ Compatible with both enhanced-mode and optimized-enhanced-mode
- ✅ Respects existing timeout configurations
- ✅ Maintains backward compatibility with single-line input
- ✅ No external dependencies required (uses built-in Node.js readline)

## Related Issues

This feature resolves the issue where pasting multi-line content would cause the application to execute after only the first line, losing the rest of the input.
