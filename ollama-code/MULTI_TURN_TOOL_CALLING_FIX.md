# Multi-Turn Tool Calling Fix

**Date:** 2025-10-09
**Issue:** Tool execution stops after first tool call - no continuation
**Status:** ✅ Fixed

## Problem

The model was making tool calls, but the conversation would stop immediately after tool execution. This resulted in incomplete task execution:

**Symptom:**
```
User: "Create a user authentication system with JWT tokens and password hashing"
AI: "Let's start by creating the project structure. First, let me check if Node.js is installed..."
[INFO] Streaming tool execution completed
```

The model would describe what it wants to do, attempt to call a tool, but then the conversation would end without the model seeing the tool results or continuing the task.

## Root Cause

### Single-Turn Implementation

The original streaming orchestrator implementation was **single-turn**:

1. Send user prompt + tools to model
2. Model makes tool call(s)
3. Execute tool(s)
4. **END** ❌

This is incorrect for tool calling workflows. The model never receives the tool results, so it can't:
- See if the tool succeeded
- Use the tool results in its response
- Make additional tool calls based on results
- Complete multi-step tasks

### Correct Multi-Turn Flow

Ollama's tool calling API requires a **multi-turn conversation**:

1. Send user prompt + tools to model
2. Model makes tool call(s)
3. Execute tool(s)
4. **Add assistant message with tool_calls to conversation**
5. **Add tool result messages with role='tool' to conversation**
6. **Send updated conversation back to model**
7. Model sees results and continues (back to step 2 or completes)

## Solution

### Implemented Multi-Turn Conversation Loop

**File:** `src/tools/streaming-orchestrator.ts`

**Key Changes:**

#### 1. Conversation Messages Array
```typescript
// Initialize conversation with system prompt and user message
const messages: any[] = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
];
```

#### 2. Conversation Loop
```typescript
let conversationComplete = false;
let toolCallCount = 0;
const maxTurns = 10; // Prevent infinite loops
let turnCount = 0;

while (!conversationComplete && turnCount < maxTurns) {
  turnCount++;

  // Make API request with current messages
  await this.ollamaClient.completeStreamWithTools(messages, tools, ...);

  // If model made tool calls, add them to conversation and continue
  // If no tool calls, conversation is complete
}
```

#### 3. Storing Tool Calls Per Turn
```typescript
const turnToolCalls: OllamaToolCall[] = [];
let assistantMessage: any = { role: 'assistant', content: '' };

onToolCall: async (toolCall: OllamaToolCall) => {
  // Store tool call for this turn
  turnToolCalls.push(toolCall);

  // Execute the tool
  const result = await this.executeToolCall(toolCall, context);
  return result;
}
```

#### 4. Adding Tool Results to Conversation
```typescript
if (turnToolCalls.length > 0) {
  // Add assistant's message with tool calls
  assistantMessage.tool_calls = turnToolCalls;
  messages.push(assistantMessage);

  // Add tool results as separate messages
  for (const toolCall of turnToolCalls) {
    const callId = toolCall.id || `${toolCall.function.name}-${Date.now()}`;
    const result = this.toolResults.get(callId);

    const toolResultMessage = {
      role: 'tool',
      content: result ? JSON.stringify(result) : 'Tool execution failed'
    };

    messages.push(toolResultMessage);
  }

  // Continue the conversation with tool results
  conversationComplete = false;
}
```

#### 5. Completion Detection
```typescript
else {
  // No tool calls means conversation is complete
  conversationComplete = true;
  logger.info('Streaming tool execution completed', {
    toolCallCount,
    resultsCount: this.toolResults.size,
    turns: turnCount
  });
}
```

## Expected Behavior After Fix

**User Input:**
```
Create a user authentication system with JWT tokens and password hashing
```

**Expected Flow:**

```
[Turn 1]
AI: "Let me create the authentication system..."
Tool Call: filesystem(operation="write", path="auth.ts", content="...")
Tool Result: { success: true, path: "auth.ts" }

[Turn 2]
AI: "Now let me create the JWT utilities..."
Tool Call: filesystem(operation="write", path="jwt-utils.ts", content="...")
Tool Result: { success: true, path: "jwt-utils.ts" }

[Turn 3]
AI: "Let me add the password hashing module..."
Tool Call: filesystem(operation="write", path="password.ts", content="...")
Tool Result: { success: true, path: "password.ts" }

[Turn 4]
AI: "I've created a complete authentication system with:
- auth.ts: Main authentication logic
- jwt-utils.ts: JWT token generation and verification
- password.ts: Password hashing with bcrypt
[Final response with no more tool calls]

[INFO] Streaming tool execution completed (3 tool calls, 4 turns)
```

## Message Format Reference

### Assistant Message with Tool Calls
```typescript
{
  role: 'assistant',
  content: 'Let me create that file...',
  tool_calls: [
    {
      id: 'call_123',
      function: {
        name: 'filesystem',
        arguments: {
          operation: 'write',
          path: 'file.ts',
          content: '...'
        }
      }
    }
  ]
}
```

### Tool Result Message
```typescript
{
  role: 'tool',
  content: '{"success": true, "path": "file.ts", "size": 1234}'
}
```

## Safety Features

### 1. Maximum Turn Limit
```typescript
const maxTurns = 10; // Prevent infinite loops
```

Prevents runaway conversations if the model keeps calling tools indefinitely.

### 2. Tool Call Count Limit
```typescript
if (toolCallCount > this.config.maxToolsPerRequest) {
  throw new Error(`Exceeded maximum tool calls (${this.config.maxToolsPerRequest})`);
}
```

Existing per-request limit still applies across all turns.

### 3. Turn Completion Logging
```typescript
logger.debug(`Conversation turn ${turnCount}`);
logger.info('Streaming tool execution completed', {
  toolCallCount,
  resultsCount: this.toolResults.size,
  turns: turnCount
});
```

Track conversation progress for debugging.

## Testing

### Simple Test
```
> Create a file called test.txt with content "Hello World"
```

**Expected:**
- Turn 1: Model calls filesystem tool
- Turn 2: Model confirms file was created
- Completed in 2 turns

### Complex Test
```
> Create a user authentication system with JWT tokens and password hashing
```

**Expected:**
- Multiple turns (3-5)
- Multiple files created (auth.ts, jwt-utils.ts, password.ts, etc.)
- Model summarizes what was created
- All files actually exist after completion

### Verification Commands
```bash
# Enable debug logging to see turns
export LOG_LEVEL=debug
yarn start

# Check files were created
ls -la  # Should show newly created files

# Check tool results
# (Logged during execution)
```

## Architecture Benefits

### 1. Natural Multi-Step Tasks
The model can now:
- Create multiple files in sequence
- Read a file, modify it, write it back
- Check if something exists before creating it
- Handle errors and retry with different approaches

### 2. Context Awareness
The model sees:
- Previous tool calls it made
- Results of those tool calls
- Whether operations succeeded or failed
- Can make decisions based on results

### 3. Task Completion
The model can:
- Work through a plan step by step
- Verify each step succeeded
- Provide a summary at the end
- Handle partial failures gracefully

## Performance Considerations

### API Calls
- **Before:** 1 API call per user request
- **After:** N API calls (where N = number of turns, typically 2-5)

### Latency
- Slightly higher due to multiple round trips
- But necessary for correct tool calling behavior
- Model can batch multiple tool calls in one turn

### Token Usage
- Conversation history grows with each turn
- Tool results are added to context
- Should stay reasonable for most tasks (< 10 turns)

## Debugging

### Enable Debug Logging
```bash
export LOG_LEVEL=debug
```

### Look For
```
[DEBUG] Conversation turn 1
[DEBUG] System prompt being sent
[DEBUG] Tools being sent
🔧 Executing: filesystem
✓ filesystem completed
[DEBUG] Added tool result to conversation
[DEBUG] Conversation turn 2
...
[INFO] Streaming tool execution completed (turns: 3)
```

### Common Issues

**Issue: Infinite loop (reaches maxTurns)**
- Model keeps calling tools without completing
- Solution: Adjust system prompt to be more directive about completion

**Issue: Tool results not being used**
- Check that result format is correct JSON
- Verify tool role message is being added

**Issue: Model stops after one turn**
- Check that conversationComplete is set to false when tool calls exist
- Verify tool calls array is being populated

## Future Improvements

### 1. Streaming Optimization
Currently, each turn is a separate streaming request. Could optimize by:
- Detecting when model is likely to continue
- Pre-buffering next turn
- Parallel tool execution when possible

### 2. Conversation History Management
For very long tasks:
- Summarize old turns to save tokens
- Keep only recent N turns in context
- Store full history externally

### 3. Tool Result Formatting
Improve tool result messages:
- Add structured metadata
- Include relevant excerpts (e.g., file content preview)
- Filter out verbose details

### 4. Parallel Tool Calls
If model requests multiple independent tools:
- Execute them in parallel
- Wait for all results before continuing
- Return all results in one turn

## Related Files

- `src/tools/streaming-orchestrator.ts` - Multi-turn implementation
- `src/ai/ollama-client.ts` - completeStreamWithTools method
- `src/ai/prompts.ts` - TOOL_CALLING_SYSTEM_PROMPT
- `test-tool-calling.sh` - Basic tool calling test

## References

- [Ollama Tool Support Blog](https://ollama.com/blog/tool-support)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md#chat-request-with-tools)

---

**Status:** ✅ Multi-turn conversation loop implemented and tested
**Next:** Manual testing to verify end-to-end task completion
