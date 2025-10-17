# Tool Selection Fix - ENAMETOOLONG Error

## Problems

### Problem 1: Using Execution Tool for File Creation (ENAMETOOLONG)

When users provided multi-line prompts asking the AI to create files (e.g., "Build a REST API endpoint..."), the AI would incorrectly choose to use the `execution` tool with an `echo` command to write large file contents, resulting in:

```
ERROR: Execution tool error: Error: spawn ENAMETOOLONG
```

### Problem 2: Using "create" Instead of "write" Operation

After fixing Problem 1, the AI correctly selected the `filesystem` tool but used the wrong operation:

```json
{
  "name": "filesystem",
  "arguments": {
    "operation": "create",
    "path": "src/api/users.js"
  }
}
```

This created an empty **directory** named `users.js` instead of a **file with code**, because:
- `operation: "create"` = create directory
- `operation: "write"` = create/update file with content

### Problem 3: Using Analysis Tool Instead of Creating Code

After fixing Problems 1 and 2, the AI chose to analyze an empty directory instead of creating the requested code:

```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "analyze",
    "options": {...}
  }
}
```

The AI misinterpreted "Build a REST API endpoint" as "Analyze a REST API endpoint". It didn't understand that:
- "Build/Create/Implement X" = GENERATE new code
- "Analyze/Review/Explain X" = EXAMINE existing code

### Problem 4: Tool Error Feedback Not Reaching AI

After fixing Problems 1-3, the AI still didn't recover from tool errors. When a tool failed (e.g., `advanced-code-analysis` on non-existent file), the error message was generated and added to conversation history, but the AI never saw it because `executeWithStreamingAndHistory` returned immediately after the first turn.

**What happened:**
1. User asks to "Build a REST API endpoint"
2. AI incorrectly calls `advanced-code-analysis` tool
3. Tool fails with helpful error: "Target path does not exist. To create new files, use the filesystem tool with operation 'write'"
4. Error is added to conversation history ✓
5. **Method returns immediately** ✗ (should continue for another turn)
6. AI never sees the error and never gets a chance to correct itself

**Transcript showing the problem:**
```
[2025-10-17T17:06:53.020Z] INFO: Starting streaming tool execution with history
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "analyze",
    "target": "./src/api/users.ts"
  }
}
ℹ 🔧 Executing: advanced-code-analysis
✗ ✗ advanced-code-analysis failed: Target path does not exist...
[2025-10-17T17:07:09.144Z] INFO: Streaming tool execution completed
// Conversation ends here - AI never sees the error!
```

### Example Failing Scenario

**User Input:**
```
Build a REST API endpoint with these specifications:
Requirements:
- POST /api/users endpoint
- Accepts JSON payload with name, email, password
...
```

**Incorrect Tool Usage:**
```json
{
  "name": "execution",
  "arguments": {
    "command": "echo \"[50+ lines of Python code]\" > create_user.py"
  }
}
```

**Error:** The command string exceeded system limits (~131KB on most systems), causing `ENAMETOOLONG`.

---

## Root Causes

### For Problem 1 (ENAMETOOLONG):
1. **Ambiguous Tool Descriptions:** The AI couldn't clearly distinguish when to use `filesystem` vs `execution` tool
2. **No Validation:** The execution tool didn't prevent or warn about commands that would hit length limits
3. **Shell Patterns:** The AI learned patterns like `echo "content" > file.py` from examples but didn't understand the limitations

### For Problem 2 (Wrong Operation):
1. **Unclear Parameter Descriptions:** The difference between "create" (directory) and "write" (file) wasn't explicit enough
2. **Missing Examples:** No clear example showing how to create a code file
3. **No Validation:** The tool didn't detect when "create" was used with a file extension

### For Problem 3 (Wrong Tool - Analysis vs Creation):
1. **Ambiguous System Prompt:** The AI system prompt didn't clearly distinguish between "build" (create) vs "analyze" (examine)
2. **No Intent Clarification:** Missing explicit guidance that "Build X" means generate new code
3. **Equal Tool Weight:** Analysis and creation tools had equal priority, leading to confusion

### For Problem 4 (Error Feedback Not Reaching AI):
1. **Missing Multi-Turn Loop:** `executeWithStreamingAndHistory` processed only a single turn, then returned
2. **No Continuation After Tool Results:** Unlike `executeWithStreaming` which had a multi-turn loop, the history-based version didn't continue the conversation after adding tool results
3. **Architectural Inconsistency:** The two execution methods (`executeWithStreaming` and `executeWithStreamingAndHistory`) had different behavior - one supported multi-turn, the other didn't

---

## Solutions

### Solution for Problem 1 (ENAMETOOLONG)

#### 1. Improved Tool Descriptions

**filesystem tool (src/tools/filesystem.ts:22):**
```typescript
description: 'Comprehensive file system operations for reading, writing, creating,
and managing files. ALWAYS use this tool (not execution/echo) to create or modify
files with content. Use "write" operation to create new files or update existing
files. Use "read" to get file contents, "create" for directories, "list" to
browse directories.'
```

**execution tool (src/tools/execution.ts:30):**
```typescript
description: 'Secure command execution with timeout and output capture. Use for
running commands like npm, git, testing tools, build commands. DO NOT use for
file creation/writing - use the filesystem tool instead. Commands have length
limits, so avoid using echo/cat with large content.'
```

#### 2. Added Validation in Execution Tool

**New validation (src/tools/execution.ts:159-178):**

```typescript
// Check for commands that are likely trying to write files
if (command === 'echo' || command === 'cat' || command === 'printf') {
  const fullCommand = `${command} ${args.join(' ')}`;

  // Length check
  if (fullCommand.length > 1000) {
    return {
      success: false,
      error: `Command too long (${fullCommand.length} chars). Use the filesystem
              tool with "write" operation to create files instead of echo/cat
              commands.`
    };
  }

  // Redirection detection
  if (fullCommand.includes('>') || fullCommand.includes('>>')) {
    logger.warn('Detected file write attempt via echo/cat');
    return {
      success: false,
      error: 'Use the filesystem tool with "write" operation to create or modify
             files, not echo/cat redirection.'
    };
  }
}
```

### Solution for Problem 2 (Wrong Operation)

#### 1. Enhanced Operation Parameter Description

**Updated description (src/tools/filesystem.ts:29):**
```typescript
description: 'The file operation to perform: "write" = create/update FILE with
content (REQUIRED content parameter), "create" = make empty DIRECTORY (no content),
"read" = get file contents, "list" = browse directory, "delete" = remove file/dir,
"search" = find files, "exists" = check if path exists. To create a code file like
users.js, use operation="write" with content parameter.'
```

**Added enum for better AI understanding:**
```typescript
enum: ['read', 'write', 'list', 'create', 'delete', 'search', 'exists']
```

#### 2. Clarified Content Parameter Description

**Updated description (src/tools/filesystem.ts:43):**
```typescript
description: 'File content to write. REQUIRED when operation="write". Contains
the actual code/text for the file. Not used for operation="create" (directories)
or "read".'
```

#### 3. Added Concrete Examples

**New examples showing the difference:**
```typescript
{
  description: 'Create a new code file (write operation with content)',
  parameters: {
    operation: 'write',
    path: 'src/api/users.js',
    content: 'const express = require("express");\nconst router = express.Router();\n...'
  }
},
{
  description: 'Create a new directory (create operation, no content)',
  parameters: {
    operation: 'create',
    path: 'src/api'
  }
}
```

#### 4. Added Validation to Catch Mistakes

**New validation (src/tools/filesystem.ts:153-171):**

```typescript
// Validate write operation has content
if (operation === 'write' && !parameters.content) {
  return {
    success: false,
    error: 'operation="write" requires content parameter. To create an empty
            directory, use operation="create" instead.'
  };
}

// Catch common mistake: using create for files
if (operation === 'create' && filePath.includes('.')) {
  const ext = path.extname(filePath);
  if (ext) {
    logger.warn(`Detected potential mistake: using operation="create" for file
                 "${filePath}"`);
    return {
      success: false,
      error: `To create a file like "${filePath}", use operation="write" with
              content parameter. operation="create" is only for directories.`
    };
  }
}
```

### Solution for Problem 3 (Wrong Tool - Analysis vs Creation)

#### Enhanced System Prompt with Intent Classification

**Updated system prompt (src/ai/prompts.ts:336-369):**

```typescript
export const TOOL_CALLING_SYSTEM_PROMPT = `You are an AI coding assistant with
access to tools. Your primary task is to help users CREATE, BUILD, and IMPLEMENT
code based on their requirements.

CRITICAL: Understand User Intent
- When users say "Build X" or "Create X" or "Implement X" → GENERATE and WRITE code
- When users say "Analyze X" or "Review X" or "Explain X" → EXAMINE existing code
- "Build a REST API endpoint" = CREATE code files with the implementation
- "Analyze the REST API endpoint" = REVIEW existing code files

Tool Usage Guidelines:
- For CODE CREATION/BUILDING tasks:
  1. Use 'filesystem' tool with operation='write' to create code files
  2. Include the full implementation in the 'content' parameter
  3. Example: { operation: "write", path: "src/api/users.js", content: "..." }

- For CODE ANALYSIS tasks:
  1. Use 'advanced-code-analysis' tool ONLY on existing files
  2. If file doesn't exist yet, CREATE it first using 'filesystem'

DEFAULT BEHAVIOR: When a user describes a feature or endpoint to build, your
first action should be using the 'filesystem' tool to CREATE the code, not
analyze empty directories.`;
```

**Key Improvements:**
1. **Clear Intent Classification:** Explicit distinction between build/create vs analyze/review
2. **Concrete Examples:** Shows that "Build a REST API" means CREATE code
3. **Default Behavior:** States that describing a feature means creating it
4. **Priority Guidance:** Creation is the primary task, analysis is secondary

### Solution for Problem 4 (Error Feedback Not Reaching AI)

#### Added Multi-Turn Loop to executeWithStreamingAndHistory

**Modified method (src/tools/streaming-orchestrator.ts:99-437):**

The key change is wrapping the tool execution in a `while` loop similar to `executeWithStreaming`:

```typescript
async executeWithStreamingAndHistory(
  conversationHistory: any[],
  context: ToolExecutionContext,
  options?: { ... }
): Promise<void> {
  // ... setup code ...

  // FIXED: Add multi-turn loop to allow AI to recover from tool errors
  let conversationComplete = false;
  let totalToolCalls = 0;
  const maxTurns = STREAMING_CONSTANTS.MAX_CONVERSATION_TURNS;
  let turnCount = 0;

  while (!conversationComplete && turnCount < maxTurns) {
    turnCount++;
    logger.debug(`Conversation turn ${turnCount}`);

    // Process single turn with conversation history
    const turnToolCalls: OllamaToolCall[] = [];
    let assistantMessage: any = { role: 'assistant', content: '' };

    await this.ollamaClient.completeStreamWithTools(
      conversationHistory,
      tools,
      { model: options?.model, system: systemPrompt },
      {
        onContent: (chunk: string) => { ... },
        onToolCall: async (toolCall: OllamaToolCall) => { ... },
        onComplete: () => { ... },
        onError: (error: Error) => { ... }
      }
    );

    // If there were tool calls, add assistant message and tool results
    if (turnToolCalls.length > 0) {
      // Add assistant's message with tool calls
      assistantMessage.tool_calls = turnToolCalls;
      conversationHistory.push(assistantMessage);

      // Add tool results with recovery suggestions
      for (const toolCall of turnToolCalls) {
        // ... format result with recovery suggestions ...
        conversationHistory.push({
          role: 'tool',
          content: resultContent
        });
      }

      // Continue the conversation - AI will see tool results and respond
      conversationComplete = false;  // KEY: Don't exit, continue loop
    } else {
      // No tool calls means conversation is complete
      conversationComplete = true;
    }
  }
}
```

**Key Changes:**
1. **Multi-Turn Loop:** Added `while (!conversationComplete && turnCount < maxTurns)` loop
2. **Conversation Continuation:** Set `conversationComplete = false` when tool results are added
3. **Turn Tracking:** Count turns and enforce maximum to prevent infinite loops
4. **Consistent Behavior:** Now matches `executeWithStreaming` architecture

**How It Works:**
1. User provides prompt
2. AI makes tool call (even if wrong tool)
3. Tool executes and returns result (success or error)
4. Result added to conversation history
5. **Loop continues** - AI gets another turn to see the result
6. AI can now:
   - See the error message
   - Read the recovery suggestion
   - Make a correct tool call
   - Actually solve the user's request

---

## Expected Behavior After All Fixes

### Correct Tool Usage

When creating a file, the AI should now use:

```json
{
  "name": "filesystem",
  "arguments": {
    "operation": "write",
    "path": "create_user.py",
    "content": "from flask import Flask, request, jsonify\n..."
  }
}
```

### Benefits

1. **No Length Limits:** The filesystem tool can handle files of any size
2. **Better Error Messages:** If AI still tries echo, it gets a helpful error explaining what to do
3. **Clearer Intent:** Tool descriptions explicitly guide the AI to the right choice
4. **Safety:** Detects and prevents file write attempts via shell redirection
5. **Error Recovery:** AI can now see tool errors and correct its mistakes in subsequent turns
6. **Multi-Turn Conversations:** Both streaming methods now support multi-turn tool calling consistently

---

## Testing

To test the fix:

1. **Start ollama-code:**
   ```bash
   yarn build
   ./dist/src/index.js
   ```

2. **Provide a multi-line prompt asking for file creation:**
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

3. **Expected Result:**
   - AI should use `filesystem` tool with `write` operation
   - File should be created successfully
   - No ENAMETOOLONG errors
   - **NEW:** If AI makes a wrong tool call, it should recover in the next turn

4. **Error Recovery Testing:**
   If AI incorrectly calls `advanced-code-analysis` on non-existent file, you should now see:
   ```
   ℹ 🔧 Executing: advanced-code-analysis
   ✗ advanced-code-analysis failed: Target path does not exist...
   [Turn 2 starts]
   ℹ 🔧 Executing: filesystem
   ✓ filesystem completed
   ```

5. **Edge Case Testing:**
   If AI still tries to use echo (shouldn't happen), you'll see:
   ```
   Error: Command too long (150234 chars). Use the filesystem tool with "write"
   operation to create files instead of echo/cat commands.
   ```

---

## Technical Details

### System Command Length Limits

Different systems have different limits:
- **Linux:** ~131KB (getconf ARG_MAX)
- **macOS:** ~262KB
- **Windows:** ~8KB (much more restrictive)

Our validation catches commands >1000 chars, well before any system limit.

### Tool Selection Flow

```
User Request
    ↓
AI Analyzes Request
    ↓
Reads Tool Descriptions
    ↓
filesystem: "ALWAYS use this tool (not execution/echo) to create files"
execution: "DO NOT use for file creation/writing"
    ↓
AI Selects: filesystem tool
    ↓
Calls: {"operation": "write", "path": "...", "content": "..."}
    ↓
Success!
```

---

## Files Modified

### Problem 1 Fixes:
1. **src/tools/filesystem.ts** (line 22)
   - Enhanced tool description with explicit guidance

2. **src/tools/execution.ts** (lines 30, 159-178)
   - Enhanced tool description with explicit warnings
   - Added validation for long commands
   - Added detection for file write attempts

### Problem 2 Fixes:
3. **src/tools/filesystem.ts** (lines 29-31, 43-44, 88-125, 153-171)
   - Enhanced operation parameter description with explicit write vs create distinction
   - Added enum for operation parameter
   - Clarified content parameter description
   - Added concrete examples showing write operation for files
   - Added validation to catch create-with-extension mistakes
   - Added validation to require content for write operations

### Problem 3 Fixes:
4. **src/ai/prompts.ts** (lines 336-369)
   - Enhanced TOOL_CALLING_SYSTEM_PROMPT with intent classification
   - Added explicit "Build X" vs "Analyze X" distinction
   - Added concrete examples of creation vs analysis tasks
   - Added default behavior guidance prioritizing creation

### Problem 4 Fixes:
5. **src/tools/streaming-orchestrator.ts** (lines 99-437)
   - Added multi-turn conversation loop to `executeWithStreamingAndHistory`
   - Loop continues when tool results are added to conversation
   - Matches behavior of `executeWithStreaming` method
   - AI can now see tool errors and recover in subsequent turns

---

## Related Issues

- **Multi-line Input Support:** [MULTI_LINE_INPUT_FEATURE.md](MULTI_LINE_INPUT_FEATURE.md)
- **Build Errors Fixed:** [BUILD_ERRORS_FIXED.md](BUILD_ERRORS_FIXED.md)

---

## Future Improvements

Potential enhancements:

1. **System Limit Detection:** Dynamically detect ARG_MAX on the current system
2. **Smarter Tool Recommendations:** Add AI prompt engineering to suggest tools
3. **Tool Usage Analytics:** Track which tools are being misused and improve descriptions
4. **Examples in Descriptions:** Add more examples showing correct vs incorrect usage

---

**Status:** ✅ All 4 Problems Fixed
**Date:** 2025-10-17
**Build:** Verified successful (8.06s)
**Testing:** Ready for integration testing with multi-turn error recovery
