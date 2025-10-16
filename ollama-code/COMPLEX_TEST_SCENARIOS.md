# Complex Test Scenarios for Synthetic Tool Calling

These are manual test scenarios to verify the synthetic tool calling workaround works correctly.

## Test 1: Multiple File Creation
**Prompt:** "Create three files: alpha.txt with content 'Alpha', beta.txt with content 'Beta', and gamma.txt with content 'Gamma'"

**Expected behavior:**
- Model should output 3 separate JSON tool calls
- Each should be detected and executed
- All 3 files should be created
- Verify with: `ls alpha.txt beta.txt gamma.txt && cat alpha.txt beta.txt gamma.txt`

**Success criteria:**
- All 3 files exist
- Each contains correct content
- No errors during execution

## Test 2: Command Execution
**Prompt:** "Run the command 'pwd' to show the current directory"

**Expected behavior:**
- Model outputs JSON with execution tool
- Command is executed
- Output is displayed

**Success criteria:**
- Command runs successfully
- Output shows current directory path

## Test 3: Multi-turn Conversation
**Conversation:**
1. User: "Create a file called notes.txt"
2. Model: (creates file)
3. User: "Now add the content 'Important notes' to that file"
4. Model: (writes content)

**Expected behavior:**
- First request creates empty or placeholder file
- Second request writes actual content
- Conversation context is maintained

**Success criteria:**
- File exists after both turns
- File contains expected content
- Model understands context from first request

## Test 4: File with Special Characters
**Prompt:** "Create a file called special.txt with content 'Hello @user! Price: $99.99 (50% off)'"

**Expected behavior:**
- Model handles special characters in JSON
- File is created with exact content including special chars

**Success criteria:**
- File contains all special characters correctly
- No JSON parsing errors

## Test 5: Mixed Operations
**Prompt:** "Create a file called readme.md with content '# Test', then list all files in the directory"

**Expected behavior:**
- Model generates 2 tool calls: filesystem write, then execution for ls
- Both execute in sequence
- Output shows the newly created file in the list

**Success criteria:**
- File is created
- List command runs
- Output includes readme.md

## Test 6: File Read Operation
**Prompt:** "Create a file called data.txt with content 'Sample data', then read the file back to me"

**Expected behavior:**
- File is created
- File is read back
- Content is displayed

**Success criteria:**
- File exists
- Content matches what was written
- Model shows the content in response

## Notes for Testing

### Debug Output to Look For:
- `[DEBUG] Detection check: hasName=true, hasArguments=true` - Detection working
- `[DEBUG] Parse successful! Tool: <toolname>` - JSON parsed correctly
- `🔧 Executing: <toolname>` - Tool execution started
- `✓ <toolname> completed` - Tool execution succeeded
- `[DEBUG] Tool result: Tool execution successful` - Result recorded

### Common Issues to Watch For:
1. **Multiple tool calls in single response**: May need deduplication or ordering
2. **JSON parsing errors**: Special characters might break JSON
3. **Context loss**: Multi-turn conversations must maintain history
4. **Race conditions**: Multiple async tool executions
5. **Incomplete JSON**: Parser should handle streaming gracefully

### Performance Considerations:
- Each chunk triggers parse attempt (expected to fail until complete)
- Parse errors are normal and should be silent to user
- Only final successful parse should trigger execution
- Deduplication prevents same tool call running multiple times
