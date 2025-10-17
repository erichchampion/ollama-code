# Tool Execution Enhancements - 2025-10-17

## Overview

Six major enhancements implemented to improve AI tool execution reliability, reduce wasted turns, and prevent infinite loops.

## Problem Analysis

From the user's transcript, the AI was:
1. ✅ Recovering from initial echo errors (Problem 4 fix working)
2. ✅ Using filesystem tool correctly after errors
3. ❌ Hitting max turn limit due to repeated npm command failures
4. ❌ Making same failed tool calls multiple times
5. ❌ Getting unhelpful ENOENT error messages

## Enhancements Implemented

### Enhancement #1: Enable Shell Mode by Default ✅

**Problem:** Commands like `node`, `npm`, `echo` failed with `ENOENT` because Node.js `spawn()` doesn't use shell by default, so it can't find commands in PATH.

**Solution:** Auto-enable shell mode for common commands.

**File:** `src/tools/execution.ts`

**Changes:**
```typescript
// Auto-enable shell for common commands that need PATH resolution
const commonShellCommands = ['node', 'npm', 'yarn', 'git', 'echo', 'cat', 'ls', 'cd', 'mkdir', 'rm', 'cp', 'mv'];
const needsShell = shell ?? commonShellCommands.includes(command);
```

**Benefits:**
- Fixes `spawn ENOENT` errors for npm, node, yarn commands
- AI can now successfully run system commands
- Still allows explicit `shell: false` override for security

---

### Enhancement #2: Improve ENOENT Error Messages ✅

**Problem:** Error "spawn node server.js ENOENT" didn't tell AI what was wrong or how to fix it.

**Solution:** Context-aware error messages that guide the AI toward solutions.

**File:** `src/tools/execution.ts`

**Changes:**
```typescript
if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
  const { command, shell } = parameters;
  if (!shell && !needsShell) {
    errorMessage = `Command '${command}' not found. This command needs shell mode enabled. Add shell:true parameter or verify the command path.`;
  } else {
    errorMessage = `Command '${command}' not found in system PATH. The command may not be installed or available. Consider documenting this as a manual setup requirement instead of attempting to install it.`;
  }
}
```

**Benefits:**
- AI gets actionable error messages
- Clear distinction between shell mode issues vs missing commands
- Encourages documentation over repeated installation attempts

---

### Enhancement #3: Repeated Failure Detection ✅

**Problem:** AI kept retrying the same failed command without learning from previous failures.

**Solution:** Track failure counts per tool+parameters combination and warn after 2 failures.

**File:** `src/tools/streaming-orchestrator.ts`

**Changes:**
```typescript
// Track repeated failures
const failureKey = `${toolName}:${JSON.stringify(toolCall.function.arguments)}`;
const failCount = (this.failedToolCalls.get(failureKey) || 0) + 1;
this.failedToolCalls.set(failureKey, failCount);

// Warn about repeated failures
if (failCount >= 2) {
  recoverySuggestion += ` WARNING: This same tool call has failed ${failCount} times. Try a different approach instead of retrying the same operation.`;
}
```

**Benefits:**
- AI receives explicit warnings after 2 failures
- Encourages trying different approaches
- Prevents wasting conversation turns on repeated failures

---

### Enhancement #4: Smart Turn Limit Based on Consecutive Failures ✅

**Problem:** Conversation hit max turn limit (10) even though it was making no progress, wasting all turns on failures.

**Solution:** Track consecutive failures and end conversation after 3 in a row.

**File:** `src/tools/streaming-orchestrator.ts`

**Changes:**
```typescript
let consecutiveFailures = 0;
const maxConsecutiveFailures = 3;

// In tool result processing
if (result && !result.success) {
  consecutiveFailures++;
} else if (result && result.success) {
  consecutiveFailures = 0; // Reset on success
}

// Check threshold
if (consecutiveFailures >= maxConsecutiveFailures) {
  logger.warn(`Too many consecutive tool failures (${consecutiveFailures}), ending conversation`);
  this.safeTerminalCall('warn', `⚠️  Multiple consecutive tool failures detected. Ending conversation to prevent loops.`);
  conversationComplete = true;
}
```

**Benefits:**
- Prevents infinite loops of failed commands
- Saves conversation turns for productive work
- Clear user feedback when stopping due to failures

---

### Enhancement #5: Tool Call Deduplication ✅

**Problem:** AI made the exact same tool call multiple times within seconds, wasting turns.

**Solution:** Track recent tool calls with 60-second TTL and prevent exact duplicates.

**File:** `src/tools/streaming-orchestrator.ts`

**Changes:**
```typescript
private recentToolCalls: Map<string, number> = new Map();
private static readonly TOOL_CALL_DEDUP_TTL = 60000; // 60 seconds

// Before executing tool
const callSignature = `${toolName}:${JSON.stringify(parameters)}`;
const now = Date.now();
const lastCallTime = this.recentToolCalls.get(callSignature);

if (lastCallTime && (now - lastCallTime) < TOOL_CALL_DEDUP_TTL) {
  const timeSinceLastCall = Math.round((now - lastCallTime) / 1000);
  return {
    success: false,
    error: `This exact tool call was already attempted ${timeSinceLastCall} seconds ago. Try a different approach instead of retrying the same operation.`
  };
}

this.recentToolCalls.set(callSignature, now);
```

**Benefits:**
- Prevents immediate retry of failed commands
- Forces AI to try different approaches
- Automatic cleanup of old entries via TTL

---

### Enhancement #6: Enhanced System Prompt with Error Recovery Guidance ✅

**Problem:** AI didn't have clear guidance on how to handle errors and when to give up.

**Solution:** Added comprehensive error recovery section to system prompt.

**File:** `src/ai/prompts.ts`

**Changes:**
```typescript
Error Recovery Guidelines:
- If a tool fails with ENOENT or "not found" error, the command/file doesn't exist on the system
- If a command fails twice with the same parameters, try a completely different approach
- Don't retry failed npm/node/yarn commands repeatedly - instead document the manual setup requirement
- For missing system commands (node, npm, etc.), create a README explaining manual installation steps rather than attempting automatic installation
- If you receive a "duplicate tool call" warning, it means you already tried this exact operation - choose a different approach
- After 3 consecutive tool failures, the conversation will be terminated to prevent infinite loops
- When creating files, ALWAYS use the filesystem tool with operation="write", never use echo/cat commands
```

**Benefits:**
- AI understands when to stop retrying
- Encourages creating documentation over failed automation
- Clear expectations about system behavior

---

## Expected Behavior Improvements

### Before Enhancements:
```
Turn 1: echo fails (ENOENT)
Turn 2: echo fails (ENOENT)
Turn 3: filesystem succeeds ✓
Turn 4: node server.js fails (ENOENT)
Turn 5: node server.js fails (ENOENT)
Turn 6: npm install fails (ENOENT)
Turn 7: npm install fails (ENOENT)
Turn 8: npm install fails (ENOENT)
Turn 9: npm install fails (ENOENT)
Turn 10: Max turns reached ⚠️
Result: Files created but no useful progress after turn 3
```

### After Enhancements:
```
Turn 1: filesystem succeeds ✓ (shell mode auto-enabled)
Turn 2: node server.js works ✓ (shell mode)
Turn 3: npm install fails (ENOENT - better error message)
Turn 4: npm install skipped (duplicate detected)
Turn 5: AI creates README with setup instructions ✓
Result: Files created + documentation in 5 turns
```

OR if npm keeps failing:
```
Turn 1: filesystem succeeds ✓
Turn 2: npm install fails
Turn 3: npm install fails (warning: 2nd failure)
Turn 4: npm install fails (3rd consecutive failure - conversation ends)
Result: Clean exit after 4 turns instead of wasting all 10
```

---

## Files Modified

1. **src/tools/execution.ts**
   - Added auto shell mode detection
   - Enhanced ENOENT error messages
   - Lines: 124-151, 227-236

2. **src/tools/streaming-orchestrator.ts**
   - Added failure tracking maps
   - Added repeated failure detection
   - Added consecutive failure limit
   - Added tool call deduplication
   - Lines: 42-46, 165-166, 377-434, 570-571, 629-704, 757-814

3. **src/ai/prompts.ts**
   - Enhanced system prompt with error recovery guidance
   - Lines: 371-378

---

## Testing Recommendations

### Test Case 1: Shell Command Execution
```
Prompt: "Create a server.js file and run it with node"
Expected:
- File created with filesystem tool ✓
- node command works with auto shell mode ✓
```

### Test Case 2: Missing Command Handling
```
Prompt: "Install dependencies with npm"
Expected:
- First attempt fails with clear ENOENT message ✓
- Second attempt shows "WARNING: 2nd failure" ✓
- Third attempt either:
  a) Gets deduplicated if same parameters, OR
  b) Triggers consecutive failure limit and ends conversation ✓
```

### Test Case 3: Repeated Failure Prevention
```
Prompt: "Run npm install express"
Expected:
- After 3 consecutive npm failures, conversation ends ✓
- User sees: "⚠️ Multiple consecutive tool failures detected" ✓
```

### Test Case 4: Deduplication
```
Scenario: AI tries same npm command 3 times in a row
Expected:
- Turn 1: npm install fails
- Turn 2: Duplicate detected, skipped with helpful message ✓
- Turn 3: AI tries different approach (creates README) ✓
```

---

## Metrics

**Before:**
- Average turns per failed task: ~10 (max limit)
- Wasted turns on duplicates: 40-60%
- User frustration: High

**After (Expected):**
- Average turns per failed task: ~3-5 (smart termination)
- Wasted turns on duplicates: <5%
- User frustration: Low (clear feedback, faster termination)

---

## Related Documentation

- **TOOL_SELECTION_FIX.md** - Problems 1-4 fixes
- **MULTI_LINE_INPUT_FEATURE.md** - Multi-line input support
- **BUILD_ERRORS_FIXED.md** - TypeScript compilation fixes

---

**Status:** ✅ All 6 Enhancements Completed
**Build:** ✅ Successful (7.26s)
**Date:** 2025-10-17
**Ready for:** Integration testing with real user prompts
