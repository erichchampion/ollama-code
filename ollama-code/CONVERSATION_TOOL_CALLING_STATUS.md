# Conversation-Based Tool Calling Status

**Date:** 2025-10-10
**Model:** devstral:latest
**Status:** ⚠️ Partial - Simple requests work, multi-turn conversations struggle

## Summary

Tool calling works for **simple, direct requests** but fails for **multi-turn conversations** where the user responds to model questions.

### What Works ✅

**Simple Direct Request:**
```
User: "Create a file called test.txt with content 'Hello World'"
Model: [calls filesystem tool]
Result: ✅ File created successfully
```

### What Doesn't Work ❌

**Multi-Turn Conversation:**
```
User: "Create a user authentication system with JWT tokens"
Model: "Which programming language would you prefer?"
User: "Use Node.js with Express"
Model: "Let me guide you through the process..." [no tool calls]
Result: ❌ Model describes instead of creating files
```

## Root Cause Analysis

### Issue 1: Model Behavior with Conversation Context

When the conversation history grows (user question → model question → user answer), `devstral:latest` appears to:
1. **Lose focus** on using tools
2. **Default to advisory mode** - explaining instead of acting
3. **Ignore system prompts** about using tools

### Issue 2: Context Window & Tool Awareness

The model may be:
- Overwhelmed by conversation history
- Not properly associating tools with the current turn
- Treating follow-up responses as general conversation vs. actionable requests

## Implementation Details

### Current Architecture

**Conversation History Maintained:**
```typescript
// In interactive mode
private conversationHistory: any[] = [];
private streamingOrchestrator?: any;

// On each user input
this.conversationHistory.push({ role: 'user', content: userInput });

await orchestrator.executeWithStreamingAndHistory(
  this.conversationHistory,
  context
);
```

**System Prompt:**
```
You are an AI assistant with the ability to directly create and modify files using tools.

CRITICAL: When a user asks you to create code or files, you MUST use the filesystem tool.

To create a file:
filesystem(operation="write", path="filename.js", content="...")

START CREATING FILES IMMEDIATELY when asked.
```

### What We've Tried

1. **✅ Simple system prompts** - Works for single requests
2. **✅ Aggressive system prompts** - Still fails in multi-turn
3. **✅ Few-shot examples** - Worked for single requests, confuses multi-turn
4. **✅ Conversation history** - Maintains context but doesn't trigger tools
5. **❌ Direct imperatives** - Model still explains instead of acts

## Potential Solutions

### Option 1: Change Model to Mistral

According to Ollama's tool support blog, `mistral:latest` has better tool calling support.

**Test:**
```bash
# Change default model
export DEFAULT_MODEL=mistral:latest

# Or modify src/constants.ts
export const DEFAULT_MODEL = 'mistral:latest';
```

**Pros:**
- Known good tool calling support
- May handle multi-turn conversations better
- Same model family (llama)

**Cons:**
- Need to test if it's better
- Different model characteristics

### Option 2: Simplify Multi-Turn to Single Request

Instead of maintaining conversation history, convert multi-turn into a single enriched request:

```typescript
// When user responds to clarification
const enrichedPrompt = `Create a user authentication system with JWT tokens and password hashing using Node.js with Express`;

// Call with simple executeWithStreaming (includes few-shot)
await orchestrator.executeWithStreaming(enrichedPrompt, context);
```

**Pros:**
- We know simple requests work
- Avoids conversation history complexity
- Model sees few-shot example

**Cons:**
- Loses true conversational ability
- Can't handle complex clarifications

### Option 3: Inject Tool Reminder in Follow-Up

Add a hidden system message when user responds to model question:

```typescript
if (conversationHistory.length > 2) {
  // Add reminder before user's follow-up
  conversationHistory.push({
    role: 'system',
    content: 'Remember: Use the filesystem tool to create files. Do not just describe code.'
  });
}

conversationHistory.push({ role: 'user', content: userInput });
```

**Pros:**
- Reinforces tool usage
- Minimal code change

**Cons:**
- May not work if model isn't attending to tools
- Could confuse model further

### Option 4: Detect Intent & Reset Context

When user provides clarification (like "Use Node.js"), detect that it's answering a question and restart with a complete prompt:

```typescript
// Detect if this is an answer to model's question
if (isAnsweringClarification(userInput, lastModelMessage)) {
  // Rebuild complete request
  const completeRequest = combineOriginalRequestWithClarification(
    originalRequest,
    userInput
  );

  // Clear history and start fresh
  this.conversationHistory = [];
  await orchestrator.executeWithStreaming(completeRequest, context);
}
```

**Pros:**
- Uses known-working simple request pattern
- Can incorporate user's clarification

**Cons:**
- Complex logic to detect clarifications
- May lose some conversation nuance

## Recommendation

**Short term:** Change to `mistral:latest` model and test

```bash
# In src/constants.ts
export const DEFAULT_MODEL = 'mistral:latest';
```

**Reasons:**
1. Ollama explicitly lists mistral as supporting tool calling
2. Quick to test
3. If it works, problem solved
4. If it doesn't, we know it's not model-specific

**Medium term:** If mistral doesn't work, implement **Option 2** (Simplify to single request)

**Long term:** Investigate other tool-calling models:
- qwen2.5-coder (already have it)
- llama3.1 (if available)
- Command-R (if available)

## Testing Protocol

### Test 1: Simple Request (Baseline)
```
> Create a file called test.txt with content "Hello World"
Expected: ✅ File created
```

### Test 2: Multi-File Request
```
> Create package.json and index.js for a Node.js Express app
Expected: ✅ Both files created
```

### Test 3: Multi-Turn Conversation
```
> Create a user authentication system with JWT
Model: Which language?
> Use Node.js
Expected: ✅ Model creates files (auth.js, etc.)
```

### Test 4: Complex Task
```
> Create a complete REST API with authentication
Model: May ask clarifying questions
> [User answers]
Expected: ✅ Multiple files created based on clarifications
```

## Code Locations

**Files Modified for Conversation Support:**
- `src/interactive/optimized-enhanced-mode.ts` - Conversation history tracking
- `src/tools/streaming-orchestrator.ts` - `executeWithStreamingAndHistory()` method
- `src/ai/prompts.ts` - System prompt for tool calling

**Key Methods:**
- `OptimizedEnhancedMode.processWithStreamingTools()` - Adds to conversation history
- `StreamingToolOrchestrator.executeWithStreamingAndHistory()` - Processes with history
- `StreamingToolOrchestrator.executeWithStreaming()` - Original single-request (works)

## Debug Commands

```bash
# Enable debug logging
export LOG_LEVEL=debug
yarn start

# Check model
curl http://localhost:11434/api/tags | python3 -m json.tool | grep -B1 devstral

# Test tool calling directly
./test-tool-calling.sh

# Check conversation history length
# (Look for log: "Starting streaming tool execution with history")
```

## Current Status

- ✅ Tool infrastructure working
- ✅ Simple file creation working
- ✅ Multi-turn conversation context maintained
- ❌ Model doesn't use tools in multi-turn conversations
- ⚠️ May be model-specific issue with devstral

## Next Steps

1. **Try mistral model** - Change DEFAULT_MODEL and test
2. **If that fails:** Implement Option 2 (simplify to single request)
3. **If that works:** Document limitation and provide user guidance
4. **Long term:** Research and test other models with better tool calling

---

**Conclusion:** The tool calling infrastructure is solid. The issue appears to be model-specific behavior where `devstral:latest` doesn't consistently use tools in multi-turn conversational contexts, despite working well for simple direct requests.
