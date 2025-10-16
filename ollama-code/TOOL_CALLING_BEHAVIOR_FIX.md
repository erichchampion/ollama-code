# Tool Calling Behavior Fix

**Date:** 2025-10-08
**Issue:** Model describes changes instead of using tools to execute them
**Status:** ✅ Fixed

## Problem

When users request actions like "Create a new React component for user login" or "Create a user authentication system with JWT tokens", the model was responding with explanatory text and code examples instead of actually using the available tools to create files and make changes.

### Example of Problem Behavior

**User Input:**
```
Create a new React component for user login
```

**Incorrect Behavior (Before Fix):**
```
I'd be happy to help you create a new React component for user login.
To make it more effective, I'll need some additional information:

1. Are there any specific requirements or features you'd like...
2. Do you want me to include any styling...
```

**Expected Behavior:**
```
🔧 Executing: filesystem
✓ filesystem completed
[Created LoginComponent.tsx with actual code]
```

## Root Cause

The streaming tool orchestrator was calling the Ollama API with tools available but **without a system prompt** that instructs the model to actively use those tools. Without guidance, the model defaulted to conversational mode instead of agentic mode.

### Technical Details

**File:** `src/tools/streaming-orchestrator.ts:138-149`

**Before:**
```typescript
await this.ollamaClient.completeStreamWithTools(
  userPrompt,
  tools,
  {
    model: options?.model  // No system prompt!
  },
  {
    onContent: (chunk: string) => { ... },
    onToolCall: async (toolCall) => { ... }
  }
);
```

The `OllamaClient.completeStreamWithTools` method supports an optional `system` parameter in the options, but it wasn't being used.

## Solution

### 1. Created Tool-Calling System Prompt

Added `TOOL_CALLING_SYSTEM_PROMPT` to `src/ai/prompts.ts` that explicitly instructs the model to:

- **Take action** using tools instead of describing changes
- **Use tools immediately** when asked to create, modify, or analyze code
- **Make reasonable assumptions** instead of asking for clarification
- **Create complete implementations** with actual files

**Key excerpts from the prompt:**

```
You are an AI coding assistant with direct access to tools for file manipulation and code execution.
Your role is to TAKE ACTION by using the available tools, not just describe what to do.

CRITICAL GUIDELINES:
- When a user asks you to create, modify, or analyze code, USE THE TOOLS IMMEDIATELY
- DO NOT just describe the changes or provide code examples - actually make the changes using tools
- DO NOT ask for clarification unless absolutely necessary - make reasonable assumptions
```

**Examples in the prompt:**

```
User: "Create a new React component for user login"
✓ CORRECT: Use the filesystem tool to create a new file with the component code
✗ WRONG: Describe what the component should look like or provide example code without creating the file
```

### 2. Updated Streaming Orchestrator

Modified `src/tools/streaming-orchestrator.ts` to include the system prompt:

**After:**
```typescript
try {
  // Import the tool-calling system prompt
  const { generateToolCallingSystemPrompt } = await import('../ai/prompts.js');
  const systemPrompt = generateToolCallingSystemPrompt();

  await this.ollamaClient.completeStreamWithTools(
    userPrompt,
    tools,
    {
      model: options?.model,
      system: systemPrompt  // ✅ Now includes system prompt!
    },
    {
      onContent: (chunk: string) => { ... },
      onToolCall: async (toolCall) => { ... }
    }
  );
}
```

## Files Modified

### `src/ai/prompts.ts`
- **Added:** `TOOL_CALLING_SYSTEM_PROMPT` constant (lines 336-371)
- **Added:** `generateToolCallingSystemPrompt()` function (lines 386-388)
- **Purpose:** Provides explicit instructions for agentic tool use

### `src/tools/streaming-orchestrator.ts`
- **Modified:** `executeWithStreaming()` method (lines 139-148)
- **Added:** Dynamic import of system prompt
- **Added:** System prompt to API call options
- **Purpose:** Ensures model receives proper guidance for tool calling

### `dist/src/ai/prompts.js` (generated)
- Compiled output with new system prompt

### `dist/src/tools/streaming-orchestrator.js` (generated)
- Compiled output with updated tool orchestrator

## Expected Behavior After Fix

**User Input:**
```
Create a new React component for user login
```

**Expected Response:**
```
[2025-10-09T06:XX:XX.XXXZ] INFO: Starting streaming tool execution
🔧 Executing: filesystem
✓ filesystem completed

Created LoginComponent.tsx with user login functionality
[Brief description of what was created]
```

The model should:
1. ✅ Immediately use tools to take action
2. ✅ Create actual files instead of showing code examples
3. ✅ Make reasonable assumptions about structure and conventions
4. ✅ Provide brief status updates as it works
5. ✅ Handle multi-file tasks (e.g., creating auth system with multiple files)

## Testing Recommendations

### Test Cases

1. **Simple file creation:**
   ```
   Create a new React component for user profile
   ```
   - Should create a file with component code
   - Should not ask for clarification

2. **Multi-file task:**
   ```
   Create a user authentication system with JWT tokens and password hashing
   ```
   - Should create multiple files (auth service, routes, middleware, etc.)
   - Should not just provide code examples

3. **File modification:**
   ```
   Add error handling to the login function in auth.ts
   ```
   - Should read the file, modify it, and write it back
   - Should not just show a code snippet

4. **Code analysis with action:**
   ```
   Find all TODO comments and create GitHub issues for them
   ```
   - Should use search tool to find TODOs
   - Should create actual issues (if execution tool available)

## Technical Notes

### System Prompt Delivery

- System prompt is loaded dynamically via `import()` to avoid circular dependencies
- Loaded once per `executeWithStreaming()` call
- Passed to Ollama API via `options.system` parameter

### Compatibility

- Works with existing tool infrastructure
- No changes needed to tool definitions or adapters
- Backward compatible with non-streaming mode

### Performance Impact

- Minimal: Only adds one dynamic import per streaming request
- System prompt is part of initial context, not streamed
- No additional API calls required

## Related Issues

- ✅ Duplicate tool registration warnings (fixed in `src/tools/index.ts`)
- ✅ Terminal.write errors (fixed with safe terminal methods)
- ✅ Jest ESM configuration (fixed in `jest.config.js`)

## Future Improvements

1. **Adaptive System Prompts:**
   - Could vary prompt based on task type (creation vs. modification)
   - Could include project-specific conventions

2. **Tool Usage Metrics:**
   - Track how often tools are used vs. conversational responses
   - Identify patterns where model still defaults to conversation

3. **User Feedback Loop:**
   - Allow users to configure aggressiveness of tool usage
   - Option for "confirm before executing" mode

4. **Few-Shot Examples:**
   - Include actual tool call examples in system prompt
   - Show JSON format of tool calls for better model understanding

## Verification

### Build Status
```bash
$ yarn build
✨ Done in 4.56s.
```
✅ **Build successful**

### Code Review
- ✅ System prompt is clear and directive
- ✅ Dynamic import prevents circular dependencies
- ✅ Fallback behavior unchanged (still works without system prompt)
- ✅ No breaking changes to existing API

### Ready for Testing
All code changes are complete and compiled. Manual testing recommended to verify model behavior changes.

---

## Summary

The fix addresses the core issue where the AI model was acting as a **consultant** (describing what to do) instead of an **agent** (doing the work). By adding an explicit system prompt that emphasizes action-taking and tool usage, the model should now:

1. Use tools proactively
2. Create actual files instead of showing examples
3. Complete tasks end-to-end
4. Provide a better user experience in interactive mode

**Next Step:** Manual testing to confirm the model now uses tools appropriately.
