# Manual Test Plan - Ollama Code CLI v0.1.0
*Phase 2 Enhanced AI System Testing*

## Overview
This manual test plan validates the enhanced AI capabilities implemented in Phase 2, including the ProjectContext system, EnhancedAIClient, TaskPlanner, and tool system integration.

## Prerequisites
- Node.js 18+ installed
- Ollama server installed and running (`ollama serve`)
- At least one Ollama model available (e.g., `llama3.2`, `codellama`)
- Project built successfully (`npm run build`)
- CLI executable permissions set (`chmod +x dist/src/cli-selector.js`)

## Test Environment Setup
```bash
# 1. Verify Ollama server is running
curl http://localhost:11434/api/tags

# 2. Ensure at least one model is available
ollama list

# 3. If no models, pull one for testing
ollama pull llama3.2

# 4. Build the project
npm run build

# 5. Test basic CLI accessibility
./dist/src/cli-selector.js --version
```

---

## Phase 1: Basic CLI Functionality Tests

### Test Group 1.1: Version and Help Commands
**Priority: High**

#### Test 1.1.1: Version Display
**Command:** `./dist/src/cli-selector.js --version`
- **Expected:** Displays "Ollama Code CLI v0.1.0"
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.1.2: Help Display
**Command:** `./dist/src/cli-selector.js --help`
- **Expected:**
  - Shows usage information
  - Lists all available modes (simple, advanced, interactive)
  - Shows command categories (Assistance, Code Generation, Models, etc.)
  - No errors or warnings
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.1.3: Command-Specific Help
**Command:** `./dist/src/cli-selector.js help ask`
- **Expected:** Shows detailed help for the 'ask' command
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 1.2: Mode Selection
**Priority: High**

#### Test 1.2.1: Simple Mode
**Command:** `./dist/src/cli-selector.js --mode simple list-models`
- **Expected:**
  - Executes in simple mode
  - Shows available models without errors
  - No enhanced AI initialization messages
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.2.2: Advanced Mode
**Command:** `./dist/src/cli-selector.js --mode advanced list-models`
- **Expected:**
  - Shows "Ensuring Ollama server is running..."
  - Shows "Initializing enhanced AI capabilities..."
  - Tool system initialization occurs
  - Lists models successfully
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.2.3: Interactive Mode Default
**Command:** `./dist/src/cli-selector.js` (then type `exit`)
- **Expected:**
  - Starts interactive mode by default
  - Shows welcome message and prompt
  - Enhanced AI initialization occurs
  - Exits cleanly with 'exit' command
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 2: Enhanced AI System Tests

### Test Group 2.1: Enhanced AI Initialization
**Priority: Critical**

#### Test 2.1.1: Advanced Mode AI Initialization
**Command:** `./dist/src/cli-selector.js --mode advanced help`
- **Expected Output Pattern:**
  ```
  [INFO]: Ensuring Ollama server is running...
  [INFO]: Initializing enhanced AI capabilities...
  [INFO]: Enhanced AI module initialized successfully
  [INFO]: Commands registered successfully
  ```
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.2: Connection Error Handling
**Setup:** Stop Ollama server (`pkill ollama`)
**Command:** `./dist/src/cli-selector.js --mode advanced ask "test"`
- **Expected:**
  - Graceful error message about Ollama connection
  - Clear resolution instructions
  - No crash or stack trace
- **Cleanup:** Restart Ollama server
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.2: Project Context System
**Priority: High**

#### Test 2.2.1: Project Analysis in Current Directory
**Setup:** Navigate to a code project with multiple files
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What files are in this project?"`
- **Expected:**
  - AI initialization includes project context setup
  - Response should demonstrate awareness of project structure
  - No errors during project analysis
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.2.2: File Dependency Tracking
**Setup:** In a project with import/export statements
**Command:** `./dist/src/cli-selector.js --mode advanced explain src/index.ts`
- **Expected:**
  - Enhanced AI understands file relationships
  - Response includes context about dependencies
  - Project context influences the explanation
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.3: Tool System Integration
**Priority: High**

#### Test 2.3.1: Tool Registry Initialization
**Command:** `./dist/src/cli-selector.js --mode advanced search "test"`
- **Expected:**
  - Tool system initializes without errors
  - Search functionality works (even if no matches found)
  - No circular dependency errors
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.3.2: File System Tool Integration
**Command:** `./dist/src/cli-selector.js --mode advanced search --pattern "function" --type js`
- **Expected:**
  - Search executes successfully
  - Results are formatted properly
  - No permission or access errors
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 3: Command Functionality Tests

### Test Group 3.1: Core Commands with Enhanced AI
**Priority: High**

#### Test 3.1.1: Ask Command with Context
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What is the main purpose of this codebase?"`
- **Expected:**
  - Enhanced AI initialization occurs
  - Response demonstrates project understanding
  - Quality and relevance are high
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.2: Explain Command Enhancement
**Setup:** Create a simple JavaScript file
**Command:** `./dist/src/cli-selector.js --mode advanced explain ./src/index.ts`
- **Expected:**
  - File is analyzed with project context
  - Explanation includes relevant details
  - Enhanced AI provides better insights than basic mode
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.3: Generate Command with Planning
**Command:** `./dist/src/cli-selector.js --mode advanced generate "a utility function to validate email addresses"`
- **Expected:**
  - Task planning occurs (if visible in logs)
  - Generated code is contextually appropriate
  - Response quality is high
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.2: Interactive Mode Enhanced Features
**Priority: Medium**

#### Test 3.2.1: Multi-Turn Conversation
**Setup:** Start interactive mode
**Commands:**
1. `ask "What is TypeScript?"`
2. `ask "How does it relate to our project?"`
3. `exit`

- **Expected:**
  - First response explains TypeScript
  - Second response refers to the project specifically
  - Conversation context is maintained
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.2: Context Persistence
**Setup:** Interactive mode in a TypeScript project
**Commands:**
1. `explain package.json`
2. `ask "What testing framework should I use?"`
3. `exit`

- **Expected:**
  - Second response considers the project's existing dependencies
  - Recommendations are contextually relevant
  - No context loss between commands
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 4: Error Handling and Edge Cases

### Test Group 4.1: Enhanced AI Error Handling
**Priority: High**

#### Test 4.1.1: Invalid Project Context
**Setup:** Run in a directory with permission issues
**Command:** `./dist/src/cli-selector.js --mode advanced ask "test"`
- **Expected:**
  - Graceful degradation if project analysis fails
  - Clear error messages
  - System continues to function
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.2: Large Project Handling
**Setup:** Run in a very large codebase (1000+ files)
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What is this project about?"`
- **Expected:**
  - Reasonable initialization time (<30 seconds)
  - No memory issues
  - Selective project analysis for performance
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.2: Resource Management
**Priority: Medium**

#### Test 4.2.1: Memory Usage
**Setup:** Monitor system resources
**Command:** `./dist/src/cli-selector.js --mode advanced ask "long complex question about the codebase with multiple parts and detailed requirements"`
- **Expected:**
  - Reasonable memory usage (<500MB)
  - No memory leaks after completion
  - Efficient context window management
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.2: Concurrent Operations
**Setup:** Start multiple CLI instances
**Commands:** Run same command in parallel from different terminals
- **Expected:**
  - No resource conflicts
  - Each instance maintains independent context
  - No cross-instance data contamination
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 5: Performance and Quality Tests

### Test Group 5.1: Response Quality Assessment
**Priority: Medium**

#### Test 5.1.1: Context-Aware Responses
**Setup:** In a React project with TypeScript
**Command:** `./dist/src/cli-selector.js --mode advanced ask "How should I structure my components?"`
- **Expected Quality Indicators:**
  - [ ] Mentions React-specific patterns
  - [ ] Considers TypeScript usage
  - [ ] References project structure
  - [ ] Provides actionable advice
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.2: Technical Accuracy
**Command:** `./dist/src/cli-selector.js --mode advanced ask "Explain the difference between let, const, and var in JavaScript"`
- **Expected Quality Indicators:**
  - [ ] Technically accurate information
  - [ ] Clear explanations
  - [ ] Relevant examples
  - [ ] No hallucinations or incorrect facts
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.2: Performance Benchmarks
**Priority: Low**

#### Test 5.2.1: Initialization Time
**Measurement:** Time from command start to first response
**Command:** `time ./dist/src/cli-selector.js --mode advanced ask "hello"`
- **Target:** <10 seconds for initial setup
- **Actual Time:** _______ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.2.2: Response Time
**Measurement:** Time for AI response after initialization
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What is 2+2?"`
- **Target:** <30 seconds for simple queries
- **Actual Time:** _______ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 6: Integration and Compatibility Tests

### Test Group 6.1: Cross-Platform Compatibility
**Priority: Medium**

#### Test 6.1.1: Different Operating Systems
**Platforms to test:** macOS, Linux, Windows (WSL)
**Command:** `./dist/src/cli-selector.js --mode advanced ask "test"`
- **Expected:** Consistent behavior across platforms
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Platform:** _____________
- **Notes:** _____________

#### Test 6.1.2: Different Node.js Versions
**Versions to test:** Node.js 18, 20, 22
**Command:** `node --version && ./dist/src/cli-selector.js --version`
- **Expected:** Compatible with all supported versions
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Version:** _____________
- **Notes:** _____________

### Test Group 6.2: Model Compatibility
**Priority: High**

#### Test 6.2.1: Different Ollama Models
**Models to test:** llama3.2, codellama, mistral
**Setup:** `ollama pull <model-name>`
**Command:** `./dist/src/cli-selector.js --mode advanced set-model <model-name>`
- **Expected:** Works with different model types
- **Model Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

---

## Test Execution Summary

### Overall Test Results
- **Total Tests:** 28
- **Tests Passed:** _____ / 28
- **Tests Failed:** _____ / 28
- **Tests Skipped:** _____ / 28
- **Pass Rate:** _____%

### Critical Issues Found
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Recommendations
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Phase 2 Readiness Assessment
**Enhanced AI System:** [ ] Ready for Production [ ] Needs Fixes [ ] Major Issues

### Next Steps
- [ ] Address critical issues
- [ ] Implement Phase 3 features
- [ ] Performance optimizations
- [ ] Additional automated tests

---

## Appendix: Troubleshooting Common Issues

### Issue 1: "Connection to Ollama failed"
**Solution:**
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Start Ollama: `ollama serve`
3. Check firewall settings

### Issue 2: "Permission denied" for CLI
**Solution:**
1. Set executable permissions: `chmod +x dist/src/cli-selector.js`
2. Check file ownership
3. Try `node dist/src/cli-selector.js` instead

### Issue 3: Out of memory errors
**Solution:**
1. Increase Node.js memory: `node --max-old-space-size=4096 dist/src/cli-selector.js`
2. Test in smaller project
3. Check for memory leaks in logs

### Issue 4: Slow initialization
**Solution:**
1. Check project size (large projects take longer)
2. Verify disk speed and available space
3. Monitor system resources during startup

---

**Test Plan Version:** 1.0
**Created:** September 18, 2025
**Last Updated:** September 18, 2025
**Tested By:** ________________
**Date Executed:** ________________