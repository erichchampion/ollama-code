# Chat Readability Improvements

**Date:** 2025-10-17
**Status:** Implementing

## Problems Identified

1. Raw JSON tool calls clutter the output
2. Maximum turn limit (10) is too low for complex tasks
3. Execution timeout (30s) is too short for npm installs
4. Input timeout causes premature exit during long operations

## Solutions

### 1. Hide JSON Tool Calls (Unless DEBUG)

**Change:** Only show raw JSON when `LOG_LEVEL=debug` environment variable is set

**Files:**
- `src/tools/streaming-orchestrator.ts` - Filter JSON from onContent

**Implementation:**
```typescript
// In onContent callback, detect and suppress JSON tool calls
onContent: (chunk: string) => {
  // Detect JSON tool calls by looking for {"name": pattern
  const isToolCallJSON = chunk.trim().startsWith('{') &&
                          chunk.includes('"name"') &&
                          chunk.includes('"arguments"');

  if (isToolCallJSON && process.env.LOG_LEVEL !== 'debug') {
    // Suppress JSON, will be shown as formatted tool execution
    return;
  }

  this.safeTerminalWrite(chunk);
  assistantMessage.content += chunk;
}
```

### 2. Format Tool Calls Readably

**Change:** Show clean, formatted tool execution instead of JSON

**Current Output:**
```
{
    "name": "execution",
    "arguments": {
        "command": "npm install"
    }
}
ℹ 🔧 Executing: execution
```

**New Output (Normal Mode):**
```
ℹ 🔧 Running: npm install
```

**New Output (Debug Mode):**
```
ℹ 🔧 Tool Call: execution
{
    "command": "npm install",
    "shell": true
}
ℹ 🔧 Executing: execution
```

### 3. Increase Maximum Turn Limit

**Change:** Increase from 10 to 20 turns

**File:** `src/constants/tool-orchestration.ts`

**Before:**
```typescript
MAX_CONVERSATION_TURNS: 10,
```

**After:**
```typescript
MAX_CONVERSATION_TURNS: 20,
```

**Rationale:**
- Complex tasks (like setting up React app) need more turns
- Smart turn limit (3 consecutive failures) prevents infinite loops
- Deduplication prevents wasted turns
- Real risk is now much lower with our enhancements

### 4. Increase Execution Timeout

**Change:** Increase from 30s to 120s for tool execution

**File:** `src/tools/execution.ts`

**Before:**
```typescript
timeout = 30000,  // 30 seconds
```

**After:**
```typescript
timeout = 120000,  // 120 seconds (2 minutes)
```

**Rationale:**
- npm/yarn install can take 30-60 seconds
- create-react-app can take 60-120 seconds
- User can still Ctrl+C to cancel

### 5. Increase Input Timeout

**Change:** Increase from default to 5 minutes

**File:** `src/interactive/optimized-enhanced-mode.ts`

**Current:** Look for where timeout is set for input prompt

**New:** 300000ms (5 minutes)

**Rationale:**
- During AI processing, user shouldn't timeout
- 5 minutes is reasonable for complex operations
- User can still type 'exit' to quit

## Testing Plan

1. **Test JSON Hiding:**
   - Run without LOG_LEVEL - should see clean output
   - Run with LOG_LEVEL=debug - should see JSON

2. **Test Turn Limit:**
   - Complex prompt should not hit 10-turn limit
   - Should still stop at 20 if needed

3. **Test Execution Timeout:**
   - npm install should complete successfully
   - create-react-app should not timeout

4. **Test Input Timeout:**
   - Wait during AI processing - should not timeout
   - Still timeout after 5 minutes if truly idle

## Expected Before/After

### Before:
```
{
    "name": "execution",
    "arguments": {
        "command": "npm install --save-dev @testing-library/react jest"
    }
}
ℹ 🔧 Executing: execution
✗ ✗ execution failed: Tool execution timeout (30000ms)
[2025-10-17T21:59:43.656Z] WARN: Conversation reached maximum turn limit
⚠ Reached maximum conversation turns
> ⚠ Input timeout - exiting...
```

### After:
```
ℹ 🔧 Running: npm install --save-dev @testing-library/react jest
✓ ✓ npm install completed (45s)
ℹ 🔧 Running: npx create-react-app myapp --template typescript
✓ ✓ create-react-app completed (95s)
```

## Implementation Order

1. ✅ Increase turn limit (simple constant change) - COMPLETED
2. ✅ Increase execution timeout (simple constant change) - COMPLETED
3. ✅ Increase input timeout (already set to 5 minutes) - COMPLETED
4. ✅ Hide JSON tool calls (requires onContent filtering) - COMPLETED
5. ✅ Format tool calls readably (enhance logging) - COMPLETED

## Implementation Details

### Changes Made

1. **src/constants/tool-orchestration.ts**
   - Increased `MAX_CONVERSATION_TURNS` from 10 to 20
   - Increased `TOOL_TIMEOUT` from 30000ms (30s) to 120000ms (120s)
   - Added comments explaining rationale

2. **src/interactive/timeout-config.ts**
   - Verified `USER_INPUT` is already set to 300000ms (5 minutes)
   - No changes needed

3. **src/tools/streaming-orchestrator.ts**
   - Added JSON detection in `onContent` handler to suppress JSON tool calls unless `LOG_LEVEL=debug`
   - Added formatted tool execution messages for normal mode vs debug mode
   - Normal mode shows: `🔧 Running: npm install` instead of full JSON
   - Debug mode shows: full JSON parameters
   - Added execution time tracking and display for long-running commands (>5s)

### Expected Output

**Normal Mode (default):**
```
🔧 Running: npm install --save-dev @testing-library/react jest
✓ completed (13s)
🔧 Creating file: routes/users.js
✓ completed
```

**Debug Mode (LOG_LEVEL=debug):**
```
🔧 Tool Call: execution
{
  "command": "npm install --save-dev @testing-library/react jest",
  "shell": true
}
🔧 Executing: execution
✓ execution completed
```

## Build Status

✅ Build successful (6.22s)

## Testing Recommendations

1. Test without LOG_LEVEL - should see clean output
2. Test with LOG_LEVEL=debug - should see JSON and detailed logging
3. Test complex task that previously hit 10-turn limit
4. Test long-running command (npm install) - should show execution time
5. Verify no "Input timeout" during AI processing
