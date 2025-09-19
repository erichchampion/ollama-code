# Manual Test Plan - Ollama Code CLI v0.1.0
*Comprehensive Feature Testing - All Phases*

## Overview
This manual test plan validates the complete Ollama Code CLI feature set, including basic functionality, enhanced AI capabilities, advanced features (git, testing, refactoring), and user experience enhancements (configuration, analytics, onboarding).

## Prerequisites
- Node.js 18+ installed
- Ollama server installed and running (`ollama serve`)
- At least one Ollama model available (e.g., `llama3.2`, `codellama`)
- Project built successfully (`npm run build`)
- CLI executable permissions set (`chmod +x dist/src/cli-selector.js`)
- Git repository for testing git-related features

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

# 6. Set up test project environment
git init test-project && cd test-project
echo "console.log('Hello World');" > index.js
git add . && git commit -m "Initial commit"
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
- **Expected:** Shows detailed help for the 'ask' command including arguments and examples
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 1.2: Core AI Commands
**Priority: High**

#### Test 1.2.1: Ask Command Basic
**Command:** `./dist/src/cli-selector.js --mode simple ask "What is TypeScript?"`
- **Expected:** Returns informative response about TypeScript
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.2.2: Generate Command
**Command:** `./dist/src/cli-selector.js --mode simple generate "a function to add two numbers"`
- **Expected:** Generates JavaScript function code
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.2.3: Explain Command
**Command:** `./dist/src/cli-selector.js --mode simple explain index.js`
- **Expected:** Explains the contents of index.js file
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 2: Enhanced AI System Tests

### Test Group 2.1: Enhanced AI Initialization
**Priority: Critical**

#### Test 2.1.1: Advanced Mode Initialization
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

#### Test 2.1.2: Project Context System
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What files are in this project?"`
- **Expected:**
  - AI initialization includes project context setup
  - Response demonstrates awareness of project structure
  - No errors during project analysis
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.3: Enhanced Response Quality
**Command:** `./dist/src/cli-selector.js --mode advanced ask "How should I structure this project?"`
- **Expected:**
  - Higher quality, more contextual response than simple mode
  - Project-specific recommendations
  - Detailed and actionable advice
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 3: Advanced Feature Tests

### Test Group 3.1: Git Integration Commands
**Priority: High**

#### Test 3.1.1: Git Status Command
**Command:** `./dist/src/cli-selector.js git-status`
- **Expected:**
  - Shows formatted git status with colors
  - Includes file change summary
  - AI insights about repository state
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.2: AI Commit Messages
**Setup:** Make changes to a file
**Command:** `./dist/src/cli-selector.js git-commit-ai`
- **Expected:**
  - Analyzes staged changes
  - Generates intelligent commit message
  - Follows conventional commit format
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.3: Git Branch Analysis
**Command:** `./dist/src/cli-selector.js git-analyze`
- **Expected:**
  - Shows branch statistics
  - Commit analysis and patterns
  - Development insights
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.2: Testing Commands
**Priority: Medium**

#### Test 3.2.1: Test Generation
**Command:** `./dist/src/cli-selector.js test-generate --file index.js`
- **Expected:**
  - Generates appropriate test cases
  - Uses detected test framework
  - Includes edge cases and assertions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.2: Test Analysis
**Setup:** Create a test file
**Command:** `./dist/src/cli-selector.js test-analyze`
- **Expected:**
  - Analyzes test coverage
  - Identifies missing test cases
  - Provides testing recommendations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.3: Refactoring Commands
**Priority: Medium**

#### Test 3.3.1: Code Refactoring Suggestions
**Command:** `./dist/src/cli-selector.js refactor-suggest --file index.js`
- **Expected:**
  - Analyzes code quality
  - Suggests specific improvements
  - Explains refactoring benefits
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.3.2: Extract Function
**Command:** `./dist/src/cli-selector.js refactor-extract --file index.js --lines "1-5"`
- **Expected:**
  - Identifies extractable code
  - Suggests function name and parameters
  - Shows refactored result
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 4: User Experience Enhancement Tests

### Test Group 4.1: Configuration Management
**Priority: High**

#### Test 4.1.1: Configuration Display
**Command:** `./dist/src/cli-selector.js config-show`
- **Expected:**
  - Shows current configuration summary
  - Displays key settings clearly
  - Provides helpful usage tips
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.2: Configuration Updates
**Command:** `./dist/src/cli-selector.js config-set ai.defaultModel llama3.2`
- **Expected:**
  - Updates configuration successfully
  - Confirms changes
  - Persists settings for future sessions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.3: Project Configuration
**Command:** `./dist/src/cli-selector.js config-init --project`
- **Expected:**
  - Creates .ollama-code.json in current directory
  - Sets up project-specific defaults
  - Shows configuration options
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.2: Shell Completion
**Priority: Medium**

#### Test 4.2.1: Completion Installation
**Command:** `./dist/src/cli-selector.js completion-install`
- **Expected:**
  - Auto-detects current shell
  - Installs completion script
  - Provides activation instructions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.2: Completion Generation
**Command:** `./dist/src/cli-selector.js completion bash`
- **Expected:**
  - Generates valid bash completion script
  - Includes all commands and options
  - Properly formatted output
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.3: Analytics and Progress Tracking
**Priority: Medium**

#### Test 4.3.1: Usage Analytics
**Setup:** Run several commands first
**Command:** `./dist/src/cli-selector.js analytics-show`
- **Expected:**
  - Shows command usage statistics
  - Displays success rates and trends
  - Provides actionable insights
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.3.2: Workflow Analysis
**Command:** `./dist/src/cli-selector.js analytics-workflow`
- **Expected:**
  - Identifies command patterns
  - Suggests workflow optimizations
  - Shows efficiency recommendations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.3.3: Analytics Export
**Command:** `./dist/src/cli-selector.js analytics-export usage-data.json`
- **Expected:**
  - Exports analytics data successfully
  - Creates valid JSON file
  - Includes comprehensive usage information
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.4: Tutorial and Onboarding System
**Priority: High**

#### Test 4.4.1: Onboarding Process
**Command:** `./dist/src/cli-selector.js onboarding`
- **Expected:**
  - Starts guided setup process
  - Creates user configuration
  - Shows available tutorials
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.4.2: Tutorial List
**Command:** `./dist/src/cli-selector.js tutorial-list`
- **Expected:**
  - Shows all available tutorials by category
  - Displays progress status
  - Includes difficulty and time estimates
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.4.3: Tutorial Execution
**Command:** `./dist/src/cli-selector.js tutorial-start getting-started`
- **Expected:**
  - Starts interactive tutorial
  - Provides step-by-step guidance
  - Tracks progress and completion
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.4.4: Tutorial Progress
**Command:** `./dist/src/cli-selector.js tutorial-progress`
- **Expected:**
  - Shows learning progress overview
  - Displays achievements earned
  - Suggests next steps
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.5: Performance Optimization
**Priority: Medium**

#### Test 4.5.1: Performance Analysis
**Command:** `./dist/src/cli-selector.js performance-analyze`
- **Expected:**
  - Analyzes system performance
  - Identifies optimization opportunities
  - Provides specific recommendations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.5.2: Memory Optimization
**Command:** `./dist/src/cli-selector.js performance-optimize`
- **Expected:**
  - Optimizes memory usage
  - Clears cache if needed
  - Reports optimization results
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 5: Interactive UI and Menu System Tests

### Test Group 5.1: Interactive Menu
**Priority: Medium**

#### Test 5.1.1: Main Menu Navigation
**Command:** `./dist/src/cli-selector.js` (interactive mode)
- **Expected:**
  - Shows categorized command menu
  - Allows keyboard navigation
  - Displays command descriptions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.2: Command Search
**Setup:** In interactive mode, use search feature
- **Expected:**
  - Filters commands by search term
  - Highlights matching results
  - Allows quick command selection
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.3: Recent Commands
**Setup:** Execute commands, then return to menu
- **Expected:**
  - Shows recently used commands
  - Allows quick re-execution
  - Maintains command history
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.4: Interactive Mode Exit
**Setup:** Start interactive mode: `./dist/src/cli-selector.js`
**Commands to test:** `exit`, `quit`, `q`, `.exit`
- **Expected:**
  - Prints "Goodbye!"
  - Cleanly exits to shell
  - No hanging processes
  - Process terminates with exit code 0
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 6: Error Handling and Edge Cases

### Test Group 6.1: Error Handling
**Priority: High**

#### Test 6.1.1: Invalid Commands
**Command:** `./dist/src/cli-selector.js invalid-command`
- **Expected:**
  - Shows helpful error message
  - Suggests similar commands
  - Provides usage guidance
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.1.2: Connection Errors
**Setup:** Stop Ollama server
**Command:** `./dist/src/cli-selector.js ask "test"`
- **Expected:**
  - Graceful error handling
  - Clear resolution instructions
  - No crashes or stack traces
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.1.3: File System Errors
**Command:** `./dist/src/cli-selector.js explain /nonexistent/file.js`
- **Expected:**
  - Clear file not found error
  - Helpful suggestions
  - Graceful handling
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 6.2: Resource Management
**Priority: Medium**

#### Test 6.2.1: Memory Usage
**Setup:** Monitor system resources during heavy usage
**Command:** Run multiple complex commands in sequence
- **Expected:**
  - Reasonable memory usage (<1GB)
  - No memory leaks
  - Efficient resource cleanup
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.2.2: Large Project Handling
**Setup:** Test in large codebase (1000+ files)
**Command:** `./dist/src/cli-selector.js --mode advanced ask "What is this project about?"`
- **Expected:**
  - Reasonable initialization time (<60 seconds)
  - No performance degradation
  - Selective analysis for efficiency
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 7: Integration and Compatibility Tests

### Test Group 7.1: Cross-Platform Compatibility
**Priority: Medium**

#### Test 7.1.1: Operating Systems
**Platforms:** macOS, Linux, Windows (WSL)
**Command:** `./dist/src/cli-selector.js --version`
- **Expected:** Consistent behavior across platforms
- **Platform Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

#### Test 7.1.2: Node.js Versions
**Versions:** Node.js 18, 20, 22
**Command:** `node --version && ./dist/src/cli-selector.js --version`
- **Expected:** Compatible with all supported versions
- **Version Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

### Test Group 7.2: Model Compatibility
**Priority: High**

#### Test 7.2.1: Different Ollama Models
**Models:** llama3.2, codellama, mistral, qwen2.5-coder
**Command:** `./dist/src/cli-selector.js config-set ai.defaultModel <model-name>`
- **Expected:** Works with different model types and sizes
- **Model Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

---

## Phase 8: Performance and Quality Assessment

### Test Group 8.1: Response Quality
**Priority: High**

#### Test 8.1.1: Context-Aware Responses
**Setup:** In a React TypeScript project
**Command:** `./dist/src/cli-selector.js --mode advanced ask "How should I structure my components?"`
- **Quality Indicators:**
  - [ ] Mentions React-specific patterns
  - [ ] Considers TypeScript usage
  - [ ] References project structure
  - [ ] Provides actionable advice
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 8.1.2: Code Generation Quality
**Command:** `./dist/src/cli-selector.js generate "a REST API endpoint with validation"`
- **Quality Indicators:**
  - [ ] Syntactically correct code
  - [ ] Follows best practices
  - [ ] Includes error handling
  - [ ] Properly documented
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 8.2: Performance Benchmarks
**Priority: Low**

#### Test 8.2.1: Initialization Time
**Command:** `time ./dist/src/cli-selector.js --mode advanced help`
- **Target:** <15 seconds for complete initialization
- **Actual Time:** _______ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 8.2.2: Response Time
**Command:** `./dist/src/cli-selector.js ask "What is 2+2?"`
- **Target:** <30 seconds for simple queries
- **Actual Time:** _______ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Test Execution Summary

### Overall Test Results
- **Total Tests:** 53
- **Tests Passed:** _____ / 53
- **Tests Failed:** _____ / 53
- **Tests Skipped:** _____ / 53
- **Pass Rate:** _____%

### Test Results by Phase
- **Phase 1 - Basic CLI:** _____ / 6 tests passed
- **Phase 2 - Enhanced AI:** _____ / 3 tests passed
- **Phase 3 - Advanced Features:** _____ / 6 tests passed
- **Phase 4 - User Experience:** _____ / 14 tests passed
- **Phase 5 - Interactive UI:** _____ / 4 tests passed
- **Phase 6 - Error Handling:** _____ / 5 tests passed
- **Phase 7 - Compatibility:** _____ / 4 tests passed
- **Phase 8 - Quality/Performance:** _____ / 4 tests passed

### Critical Issues Found
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Non-Critical Issues
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Feature Completeness Assessment
- **Basic CLI Functionality:** [ ] Complete [ ] Partial [ ] Major Issues
- **Enhanced AI System:** [ ] Complete [ ] Partial [ ] Major Issues
- **Git Integration:** [ ] Complete [ ] Partial [ ] Major Issues
- **Testing Tools:** [ ] Complete [ ] Partial [ ] Major Issues
- **Refactoring Tools:** [ ] Complete [ ] Partial [ ] Major Issues
- **Configuration Management:** [ ] Complete [ ] Partial [ ] Major Issues
- **Shell Integration:** [ ] Complete [ ] Partial [ ] Major Issues
- **Analytics & Progress:** [ ] Complete [ ] Partial [ ] Major Issues
- **Tutorial System:** [ ] Complete [ ] Partial [ ] Major Issues
- **Performance Tools:** [ ] Complete [ ] Partial [ ] Major Issues

### Production Readiness Assessment
**Overall System:** [ ] Ready for Production [ ] Needs Minor Fixes [ ] Needs Major Fixes [ ] Not Ready

### Recommendations
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Next Steps
- [ ] Address critical issues identified
- [ ] Implement missing features
- [ ] Performance optimizations
- [ ] Additional automated test coverage
- [ ] Documentation updates
- [ ] User acceptance testing

---

## Appendix: Troubleshooting Common Issues

### Issue 1: "Connection to Ollama failed"
**Solution:**
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Start Ollama: `ollama serve`
3. Check firewall settings
4. Verify model availability: `ollama list`

### Issue 2: "Permission denied" for CLI
**Solution:**
1. Set executable permissions: `chmod +x dist/src/cli-selector.js`
2. Check file ownership
3. Try `node dist/src/cli-selector.js` instead

### Issue 3: Configuration issues
**Solution:**
1. Reset configuration: `./dist/src/cli-selector.js config-reset --confirm`
2. Reinitialize: `./dist/src/cli-selector.js config-init`
3. Check file permissions in ~/.ollama-code/

### Issue 4: Tutorial or analytics errors
**Solution:**
1. Clear analytics data: `./dist/src/cli-selector.js analytics-clear --confirm`
2. Reset tutorial progress: `./dist/src/cli-selector.js tutorial-reset --confirm`
3. Check disk space for data storage

### Issue 5: Performance issues
**Solution:**
1. Run performance analysis: `./dist/src/cli-selector.js performance-analyze`
2. Optimize memory: `./dist/src/cli-selector.js performance-optimize`
3. Check system resources and close other applications
4. Use simpler model if available

### Issue 6: Git command failures
**Solution:**
1. Ensure you're in a git repository: `git status`
2. Check git configuration: `git config --list`
3. Verify git permissions and access

---

**Test Plan Version:** 2.0 (Comprehensive)
**Created:** September 18, 2025
**Last Updated:** September 18, 2025
**Covers:** All phases (Basic CLI, Enhanced AI, Advanced Features, User Experience)
**Tested By:** ________________
**Date Executed:** ________________
**Environment:** ________________