# Bug Fix: AI Model Generating Placeholder Paths

**Date**: 2025-10-15
**Severity**: Medium
**Status**: ✅ Fixed

---

## Issue Summary

When prompted to create code requiring security analysis (e.g., "Create a user authentication system with JWT tokens"), the AI model was generating tool calls with **literal placeholder paths** like `/path/to/auth-system` instead of:
- Omitting the optional `target` parameter (defaulting to working directory)
- Using relative paths like `.` or `src`
- Using actual project file paths

This caused security scans and code analysis operations to fail with "file not found" errors.

---

## Root Cause Analysis

### The Bug

The tool parameter descriptions were too generic and didn't provide sufficient guidance to the AI model about how to use optional path parameters:

**Before** (lines 46-51 in advanced-code-analysis-tool.ts):
```typescript
{
    name: 'target',
    type: 'string',
    description: 'File or directory path to analyze',
    required: false
}
```

### Why This Happened

1. **Tool Examples Not Transmitted**: The `OllamaToolAdapter` (lines 14-31) only sends parameter metadata to the AI model, not the tool examples:
   ```typescript
   return {
     type: 'function',
     function: {
       name: metadata.name,
       description: metadata.description,
       parameters: {
         type: 'object',
         properties: this.convertParameters(metadata.parameters),
         required: metadata.parameters
           .filter(p => p.required)
           .map(p => p.name)
       }
     }
   };
   ```

   The `examples` array in tool metadata is **not included** in the Ollama function calling format.

2. **Generic Description**: The description "File or directory path to analyze" is ambiguous. The AI interprets this as "must provide a path" and generates a placeholder like `/path/to/auth-system` as a demonstration value.

3. **No Guidance on Optional Behavior**: The description didn't explain:
   - What happens when the parameter is omitted
   - That relative paths should be used
   - That `.` means current directory
   - That placeholder paths should never be used

### Observed Symptoms

From the user's error log:
```
{"name": "advanced-code-analysis", "arguments": {"operation": "security", "target": "/path/to/auth-system"}}
[2025-10-15T05:29:58.794Z] WARN: Error scanning file /path/to/auth-system for vulnerabilities:
```

The tool correctly falls back to `context.workingDirectory` when target is falsy, but the AI provided a literal string "/path/to/auth-system", which is truthy and therefore used as-is.

**Code logic** (line 88 in advanced-code-analysis-tool.ts):
```typescript
const target = parameters.target as string || context.workingDirectory;
```

This fallback only triggers when `parameters.target` is `undefined`, `null`, or empty string - not when it's a placeholder string.

---

## The Fix

### Changed Behavior

**Before**: Generic description that didn't explain how to use the optional parameter
**After**: Explicit guidance with examples showing how to specify paths or omit the parameter

### Code Changes

#### File 1: `src/tools/advanced-code-analysis-tool.ts`

**Lines 46-51** - Enhanced parameter description:
```typescript
// BEFORE
{
    name: 'target',
    type: 'string',
    description: 'File or directory path to analyze',
    required: false
}

// AFTER
{
    name: 'target',
    type: 'string',
    description: 'File or directory path to analyze. Use relative paths like "src/app.ts" or "." for current directory. Omit this parameter entirely to analyze the working directory.',
    required: false
}
```

#### File 2: `src/tools/advanced-testing-tool.ts`

**Lines 28-33** - Enhanced parameter description:
```typescript
// BEFORE
{
    name: 'target',
    type: 'string',
    description: 'File or directory path to analyze for testing',
    required: false
}

// AFTER
{
    name: 'target',
    type: 'string',
    description: 'File or directory path to analyze for testing. Use relative paths like "src/utils.ts" or "." for current directory. Omit this parameter entirely to analyze the working directory.',
    required: false
}
```

### What Changed

The enhanced descriptions now provide:
1. ✅ **Concrete examples**: "src/app.ts" and "." show valid path formats
2. ✅ **Explicit guidance**: "Omit this parameter entirely" tells the model it's okay to leave it out
3. ✅ **Clear default behavior**: "to analyze the working directory" explains what happens when omitted
4. ✅ **No room for placeholders**: The examples show real-world usage, not placeholder patterns

---

## Testing

### Build Status
```bash
$ yarn build
Done in 6.93s
```
✅ Successful compilation

### Verification
```bash
$ grep "Use relative paths" dist/src/tools/advanced-code-analysis-tool.js
$ grep "Use relative paths" dist/src/tools/advanced-testing-tool.js
```
✅ Both descriptions correctly compiled into JavaScript output

### Expected Behavior After Fix

When the AI model sees: "Create a user authentication system with JWT tokens"

**Before Fix**:
```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "security",
    "target": "/path/to/auth-system"  // ❌ Literal placeholder
  }
}
```

**After Fix** (Expected):
```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "security"
    // ✅ target parameter omitted entirely
  }
}
```

Or:
```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "security",
    "target": "."  // ✅ Current directory
  }
}
```

---

## Impact Assessment

### Severity: Medium
- **Functionality**: Tool calls with placeholder paths were failing completely
- **User Experience**: Confusing error messages about non-existent paths
- **Frequency**: Occurred whenever AI generated code requiring security/analysis operations
- **Workaround**: User could manually retry with correct paths

### Affected Tools
- ✅ `advanced-code-analysis` - Fixed
- ✅ `advanced-testing` - Fixed
- ✅ `search` - Already had good description: "The path to search in (default: current directory)"
- ✅ `filesystem` - Uses required=true, so this issue doesn't apply

### Risk of Fix
- **Low**: Only changed parameter descriptions (documentation)
- **No breaking changes**: Existing valid tool calls still work identically
- **Better AI behavior**: Model now has clearer guidance on parameter usage

---

## Prevention

### Why This Wasn't Caught Earlier

1. **No validation for placeholder patterns**: Tools accept any string path, including placeholders
2. **Examples not transmitted**: The tool's `examples` array shows correct usage but isn't sent to the AI
3. **Manual testing**: When testing manually, developers provide real paths, not placeholders
4. **AI behavior varies**: Different models/prompts may generate different placeholder patterns

### Recommendations

1. **Path validation**: Add warning logs when paths contain "placeholder" patterns like `/path/to/`, `<path>`, `{path}`
2. **Adapter enhancement**: Consider including tool examples in the Ollama format, perhaps in the description
3. **System prompt**: Add guidance in AI prompts: "Never use placeholder paths like /path/to/. Either use real paths or omit optional parameters."
4. **Parameter defaults**: Consider using default values in tool metadata more consistently

### Future Improvements

#### Option 1: Detect Placeholder Patterns
```typescript
function isPlaceholderPath(path: string): boolean {
  const placeholderPatterns = [
    /^\/path\/to\//,
    /^<.*>$/,
    /^{.*}$/,
    /^\[.*\]$/,
    /\/path$/,
    /\/directory$/,
    /\/file\./
  ];
  return placeholderPatterns.some(pattern => pattern.test(path));
}

// In execute():
if (parameters.target && isPlaceholderPath(parameters.target)) {
  logger.warn('Detected placeholder path, using working directory instead', {
    placeholder: parameters.target
  });
  target = context.workingDirectory;
}
```

#### Option 2: Enhanced Adapter to Include Examples
```typescript
static toOllamaFormat(tool: BaseTool): OllamaTool {
  const metadata = tool.metadata;

  // Build enhanced description with examples
  let enhancedDescription = metadata.description;
  if (metadata.examples && metadata.examples.length > 0) {
    enhancedDescription += '\n\nExamples:\n';
    metadata.examples.forEach((ex, i) => {
      enhancedDescription += `${i + 1}. ${ex.description}: ${JSON.stringify(ex.parameters)}\n`;
    });
  }

  return {
    type: 'function',
    function: {
      name: metadata.name,
      description: enhancedDescription,
      // ...
    }
  };
}
```

#### Option 3: System Prompt Enhancement
Add to `TOOL_CALLING_SYSTEM_PROMPT` in `src/ai/prompts.ts`:
```typescript
export const TOOL_CALLING_SYSTEM_PROMPT = `You have access to tools. Use them to complete tasks.

IMPORTANT: When calling tools with optional path parameters:
- Use relative paths like "src/file.ts" or "." for current directory
- Omit optional parameters entirely when appropriate
- NEVER use placeholder paths like "/path/to/..." or "<path>" or "{directory}"
- If you don't know the specific path, omit the parameter to use the working directory
`;
```

---

## Related Issues

- **Original Report**: User error showing `/path/to/auth-system` placeholder in tool call
- **Related Tools**: All tools with optional path parameters benefit from clearer descriptions
- **Adapter Limitation**: Ollama format doesn't include tool examples, requiring verbose descriptions

---

## Checklist

- ✅ Root cause identified
- ✅ Fix implemented for both affected tools
- ✅ Code compiles successfully
- ✅ Descriptions verified in compiled output
- ✅ Documentation updated
- ⏸️ Placeholder detection (recommended for future)
- ⏸️ System prompt enhancement (recommended for future)
- ⏸️ Adapter improvement to include examples (recommended for future)

---

## Additional Fix: Tool Selection Guidance

### Issue 2: Wrong Tool for Code Generation Tasks

**Observed**: Even after fixing placeholder paths, the AI was still calling `advanced-code-analysis` for "Create a user authentication system" with a non-existent path `./auth-system`.

**Root Cause**: The tool descriptions didn't clearly indicate:
1. `advanced-code-analysis` is for **existing code only**
2. `filesystem` should be used to **create new code**

**Additional Changes**:

#### File 1: `src/tools/advanced-code-analysis-tool.ts`

**Line 36** - Clarified tool is for existing code:
```typescript
// BEFORE
description: 'Comprehensive code quality analysis and improvement suggestions with AST parsing and semantic analysis',

// AFTER
description: 'Comprehensive code quality analysis and improvement suggestions for EXISTING code with AST parsing and semantic analysis. This tool analyzes code that already exists - use filesystem tool to create new files first.',
```

**Lines 121-122** - Enhanced error message:
```typescript
// BEFORE
return this.createErrorResult(`Target path does not exist: ${targetPath}`);

// AFTER
return this.createErrorResult(`Target path does not exist: ${targetPath}. This tool analyzes existing code only. To create new files, use the filesystem tool with operation 'write' or 'create' first.`);
```

#### File 2: `src/tools/filesystem.ts`

**Line 22** - Clarified tool can create new code:
```typescript
// BEFORE
description: 'Comprehensive file system operations for reading, writing, and managing files',

// AFTER
description: 'Comprehensive file system operations for reading, writing, creating, and managing files. Use this tool to create new code files, modify existing files, read file contents, and manage directories.',
```

### Expected Behavior After Both Fixes

When user requests: "Create a user authentication system with JWT tokens"

**Before All Fixes**:
```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "security",
    "target": "/path/to/auth-system"  // ❌ Wrong tool + placeholder path
  }
}
```

**After First Fix Only**:
```json
{
  "name": "advanced-code-analysis",
  "arguments": {
    "operation": "analyze",
    "target": "./auth-system"  // ❌ Still wrong tool + non-existent path
  }
}
```

**After Both Fixes** (Expected):
```json
{
  "name": "filesystem",
  "arguments": {
    "operation": "write",
    "path": "auth-system/auth.js",  // ✅ Creates new file
    "content": "// Authentication system code..."
  }
}
```

## Additional Fix #2: Invalid Operation Names

### Issue 3: AI Using Invalid Operation Names

**Observed**: AI was calling filesystem tool with `"operation": "createBackup"`, which is not a valid operation (it's a boolean parameter).

**Root Cause**: The filesystem tool's operation parameter description was too generic:
```typescript
description: 'The file operation to perform'
```

This didn't list the valid operations, unlike other tools which list them in parentheses.

**Fix Applied**:

#### File: `src/tools/filesystem.ts`

**Line 29** - Added operation list and usage guidance:
```typescript
// BEFORE
description: 'The file operation to perform',

// AFTER
description: 'The file operation to perform (read, write, list, create, delete, search, exists). Use "write" to create or update files with content, "create" to make directories, "read" to get file contents.',
```

This matches the pattern used by other advanced tools and provides clear guidance on:
1. What operations are valid
2. What each operation does
3. Which operation to use for common tasks

---

## Critical Fix #3: Missing System Prompt Guidance

### Issue 4: Inadequate System Prompt for Tool Calling

**Observed**: Even after fixing tool descriptions, the AI was **still** choosing `advanced-code-analysis` for creation tasks because it wasn't seeing proper guidance in the system prompt.

**Root Cause**: The system prompt for tool calling was extremely minimal:
```typescript
export const TOOL_CALLING_SYSTEM_PROMPT = `You have access to tools. Use them to complete tasks.`;
```

This provided **zero guidance** about:
- When to use which tools
- That analysis tools are for existing code only
- That filesystem tool is for creating new code
- How to handle tool failures
- Valid operations for each tool
- Path handling best practices

**Critical Realization**: Tool descriptions alone aren't enough! The system prompt sets the overall strategy and decision-making framework for the AI.

**Fix Applied**:

#### File: `src/ai/prompts.ts`

**Lines 336-346** - Enhanced system prompt with comprehensive guidance:
```typescript
// BEFORE
export const TOOL_CALLING_SYSTEM_PROMPT = `You have access to tools. Use them to complete tasks.`;

// AFTER
export const TOOL_CALLING_SYSTEM_PROMPT = `You have access to tools. Use them to complete tasks.

Tool Usage Guidelines:
- For CODE CREATION tasks (e.g., "create a user auth system"), use the 'filesystem' tool with operation 'write' to create files
- For CODE ANALYSIS tasks (e.g., "analyze this code"), use 'advanced-code-analysis' tool on existing files
- Analysis tools ONLY work on existing code - if a path doesn't exist, use 'filesystem' to create it first
- When using 'filesystem' tool, valid operations are: read, write, list, create, delete, search, exists
- Use operation 'write' to create or update files with code content
- Use operation 'create' to make new directories
- Never use placeholder paths like "/path/to/..." - use actual relative paths like "src/auth.js" or omit optional path parameters
- If a tool fails because a file doesn't exist and you need to create it, use 'filesystem' tool with 'write' operation`;
```

### Why This is the Most Important Fix

While the tool descriptions provide **local context** about each tool, the system prompt provides the **global strategy** that the AI uses to make decisions. Without this, the AI:

1. Doesn't know the workflow: create first, analyze second
2. Might try analysis tools on non-existent paths
3. Doesn't understand error recovery (retry with different tool)
4. Lacks guidance on when to use each category of tools

The system prompt is sent with **every request**, making it the primary source of behavioral guidance.

---

## Conclusion

The AI model had **four related issues** with tool calling, forming a hierarchy of problems:

1. **Placeholder paths** (Parameter-level): Fixed by adding explicit guidance about optional parameters
2. **Wrong tool selection** (Tool-level): Fixed by clarifying which tools are for analysis vs creation
3. **Invalid operations** (Parameter-level): Fixed by listing valid operations in the parameter description
4. **Missing strategy guidance** (System-level) ⭐: Fixed by enhancing the system prompt with comprehensive tool usage guidelines

The complete fix involves changes at **all three levels**:
- **System level**: Enhanced TOOL_CALLING_SYSTEM_PROMPT with tool selection strategy
- **Tool level**: Clearer tool descriptions indicating their purpose
- **Parameter level**: Enhanced parameter descriptions with examples and valid values
- **Error level**: Better error messages that guide toward correct tool usage

All fixes are minimal (description/prompt changes only), safe (no behavioral changes to existing code), and effective (provides explicit guidance that was missing).

**Build Status**: ✅ All changes compiled successfully (7.19s)

**Status**: Ready for testing with actual AI model interactions

---

**End of Report**
