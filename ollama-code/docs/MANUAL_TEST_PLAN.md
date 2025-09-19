# Manual Test Plan - Ollama Code CLI v0.1.0
*Comprehensive Testing for Three-Phase AI-Powered Development Assistant*

## Overview
This manual test plan validates the complete three-phase architecture implementation:
- **Phase 1:** Natural Language Understanding & Intent Recognition
- **Phase 2:** Autonomous Code Modification System
- **Phase 3:** Enhanced Task Planning & Execution Engine

The system transforms user requests into intelligent task plans, executes them autonomously with safety guarantees, and provides comprehensive AI-powered development assistance.

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

# 4. Build the project and verify compilation
npm run build
npm test

# 5. Test basic CLI accessibility
./dist/src/cli-selector.js --version

# 6. Set up test project environment
mkdir test-project && cd test-project
git init
echo "console.log('Hello World');" > index.js
echo "export function add(a, b) { return a + b; }" > math.js
git add . && git commit -m "Initial commit"
```

---

## Phase 1: Natural Language Understanding & Intent Recognition Tests

### Test Group 1.1: Intent Analysis System
**Priority: Critical**

#### Test 1.1.1: Basic Intent Classification
**Test Scenarios:**
1. **Question Intent:** `./dist/src/cli-selector.js --mode advanced ask "What files are in this project?"`
2. **Task Request Intent:** `./dist/src/cli-selector.js --mode advanced ask "Create a function to calculate factorial"`
3. **Command Intent:** `./dist/src/cli-selector.js --mode advanced ask "Run the tests"`

**Expected Results:**
- System correctly identifies intent type (question/task_request/command)
- Extracts relevant entities (files, technologies, concepts)
- Assigns appropriate confidence scores
- Determines complexity and risk levels
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.1.2: Entity Extraction Accuracy
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Refactor the math.js file to use TypeScript and add unit tests"`

**Expected Entities:**
- Files: ["math.js"]
- Technologies: ["TypeScript", "unit tests"]
- Concepts: ["refactor"]
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.1.3: Multi-Step Intent Detection
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Analyze this codebase, create documentation, and set up a CI pipeline"`

**Expected:**
- Detected as multi-step request
- High complexity classification
- Multiple sub-intents identified
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 1.2: Conversation Management
**Priority: High**

#### Test 1.2.1: Context Preservation
**Test Sequence:**
1. `./dist/src/cli-selector.js --mode advanced ask "What's in index.js?"`
2. `./dist/src/cli-selector.js --mode advanced ask "Can you improve it?"`

**Expected:**
- Second request references context from first
- Conversation ID maintained across requests
- Context-aware response about index.js improvements
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.2.2: Conversation History
**Test Command:** After multiple interactions, check conversation persistence

**Expected:**
- Previous conversation turns stored
- Context available for reference
- Conversation metadata tracked
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 1.3: Natural Language Routing
**Priority: High**

#### Test 1.3.1: Command Mapping
**Test Commands:**
1. `./dist/src/cli-selector.js --mode advanced ask "Show me the git status"`
2. `./dist/src/cli-selector.js --mode advanced ask "Generate code for a web server"`

**Expected:**
- Natural language mapped to appropriate system commands
- Correct routing decisions made
- Execution requirements identified
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 1.3.2: Clarification Requests
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Make it better"`

**Expected:**
- System recognizes ambiguous request
- Generates clarification questions
- Provides context options
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 2: Autonomous Code Modification System Tests

### Test Group 2.1: Safe Code Editor
**Priority: Critical**

#### Test 2.1.1: Atomic File Operations
**Setup:** Create test file: `echo "function test() { console.log('test'); }" > test.js`
**Test:** Initiate code modification that creates backup

**Expected:**
- Original file backed up before modification
- Changes applied atomically
- Validation performed before commit
- Backup files created in `.ollama-code-backups/`
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.2: Content Validation
**Test:** Attempt to create file with invalid JavaScript syntax

**Expected:**
- Syntax validation catches errors
- Invalid changes rejected
- Clear error messages provided
- Original file remains unchanged
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.3: Rollback Capability
**Test:** Create modification, then test rollback functionality

**Expected:**
- Successful rollback to previous state
- Backup files used for restoration
- File integrity maintained
- No data loss
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.2: AST Manipulation
**Priority: High**

#### Test 2.2.1: Function Extraction
**Setup:** Create file with extractable function
**Test:** AST analysis and function identification

**Expected:**
- Functions correctly identified
- Parameters and return types extracted
- Scope information preserved
- Export status detected
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.2.2: Symbol Renaming
**Test:** Rename variable across multiple scopes

**Expected:**
- All references updated consistently
- Scope boundaries respected
- No naming conflicts created
- Proper transformation applied
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.2.3: Import Management
**Test:** Add/modify import statements

**Expected:**
- Import statements correctly parsed
- Dependencies tracked
- Module resolution respected
- Clean import organization
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.3: Backup Management
**Priority: High**

#### Test 2.3.1: Checkpoint Creation
**Test:** Create checkpoint before major modifications

**Expected:**
- Checkpoint metadata stored
- File hashes calculated
- Git integration (if available)
- Timestamp and description recorded
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.3.2: Checkpoint Restoration
**Test:** Restore from specific checkpoint

**Expected:**
- Files restored to checkpoint state
- Conflict detection works
- Metadata consistency maintained
- Git state restored (if applicable)
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.3.3: Backup Cleanup
**Test:** Verify automatic cleanup of old backups

**Expected:**
- Old backups removed based on retention policy
- Important checkpoints preserved
- Disk space managed efficiently
- No critical data lost
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.4: Autonomous Modifier Orchestration
**Priority: Critical**

#### Test 2.4.1: Modification Plan Execution
**Test:** Execute complex modification plan with multiple operations

**Expected:**
- Plan executed in correct order
- Dependencies respected
- Rollback on failure
- Progress tracking works
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.4.2: Risk Assessment
**Test:** High-risk modification with safety checks

**Expected:**
- Risk level correctly assessed
- Safety measures activated
- User confirmation required for high-risk
- Automatic rollback on critical failure
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.4.3: Error Recovery
**Test:** Trigger error during modification

**Expected:**
- Graceful error handling
- Partial changes rolled back
- Clear error reporting
- System state preserved
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 3: Enhanced Task Planning & Execution Engine Tests

### Test Group 3.1: Task Decomposition
**Priority: Critical**

#### Test 3.1.1: Complex Request Breakdown
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Create a REST API with authentication, database integration, and comprehensive tests"`

**Expected:**
- Request decomposed into logical tasks
- Dependencies identified and ordered
- Risk assessment performed
- Timeline estimation provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.2: Dependency Analysis
**Test:** Multi-step implementation plan

**Expected:**
- Implicit dependencies added
- Circular dependencies detected
- Task priority ordering
- Critical path identified
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.3: Task Types and Priorities
**Test:** Various request types (analysis, implementation, testing, documentation)

**Expected:**
- Appropriate task types assigned
- Priorities set correctly
- Setup and validation tasks added
- Resource requirements estimated
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.2: Execution Strategies
**Priority: High**

#### Test 3.2.1: Strategy Selection
**Test:** Different task types with varying complexity

**Expected:**
- Appropriate strategy selected for each task
- Suitability scoring works correctly
- Context factors considered
- Historical performance influences selection
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.2: Parallel vs Sequential Execution
**Test:** Plan with parallelizable and dependent tasks

**Expected:**
- Independent tasks run in parallel
- Dependent tasks wait for prerequisites
- Resource constraints respected
- Failure handling preserves consistency
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.3: Adaptive Learning
**Test:** Repeated similar tasks over time

**Expected:**
- Performance history tracked
- Strategy selection improves
- Similar task patterns recognized
- Learning from success/failure rates
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.3: Enhanced Client Integration
**Priority: Critical**

#### Test 3.3.1: End-to-End Request Processing
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Analyze this project and suggest improvements"`

**Expected:**
- Intent analysis performed
- Execution plan created
- Plan presented for approval (if required)
- Results summarized clearly
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.3.2: Session Management
**Test:** Multiple requests in same session

**Expected:**
- Session state maintained
- Conversation history preserved
- Execution history tracked
- Preferences applied consistently
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.3.3: User Preferences and Auto-execution
**Test:** Different risk tolerance and execution mode settings

**Expected:**
- Low-risk plans auto-executed (if enabled)
- High-risk plans require approval
- User preferences respected
- Override options available
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.4: Plan Management
**Priority: High**

#### Test 3.4.1: Plan Proposal Generation
**Test:** Complex request that requires approval

**Expected:**
- Clear plan description
- Task breakdown with estimates
- Risk level communicated
- Approval options provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.4.2: Plan Modification
**Test:** Request plan adjustments before execution

**Expected:**
- Plan can be modified
- Dependencies updated automatically
- Risk assessment recalculated
- New timeline generated
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.4.3: Execution Monitoring
**Test:** Monitor long-running plan execution

**Expected:**
- Real-time progress updates
- Task status tracking
- Resource usage monitoring
- Cancellation capability
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 4: Integration and System-Wide Tests

### Test Group 4.1: Cross-Phase Integration
**Priority: Critical**

#### Test 4.1.1: Full Pipeline Test
**Test Command:** `./dist/src/cli-selector.js --mode advanced ask "Refactor this codebase to use modern JavaScript features and add comprehensive error handling"`

**Expected:**
- Phase 1: Intent correctly analyzed
- Phase 2: Safe code modifications planned
- Phase 3: Execution plan created and executed
- All phases work together seamlessly
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.2: Error Propagation
**Test:** Trigger error in each phase

**Expected:**
- Errors handled gracefully at each level
- Clear error messages propagated
- System state preserved
- Recovery options provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.3: Resource Management
**Test:** Resource-intensive operations

**Expected:**
- Memory usage reasonable
- CPU utilization controlled
- Disk space managed
- Network resources optimized
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.2: Safety and Reliability
**Priority: Critical**

#### Test 4.2.1: Data Integrity
**Test:** Multiple concurrent operations

**Expected:**
- No data corruption
- Atomic operations maintained
- Backup integrity preserved
- Version control consistency
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.2: Failure Recovery
**Test:** System interruption during operation

**Expected:**
- Graceful shutdown handling
- State recovery on restart
- No partial modifications
- Backup availability maintained
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.3: Security Considerations
**Test:** Potential security risks

**Expected:**
- No arbitrary code execution
- File access restrictions respected
- User permissions validated
- Sensitive data protected
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 5: Performance and Quality Tests

### Test Group 5.1: Performance Benchmarks
**Priority: Medium**

#### Test 5.1.1: Initialization Time
**Test:** `time ./dist/src/cli-selector.js --mode advanced help`

**Targets:**
- Enhanced AI initialization: <30 seconds
- First request processing: <60 seconds
- **Actual Time:** _______ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.2: Request Processing Speed
**Test:** Simple vs complex requests

**Targets:**
- Simple questions: <30 seconds
- Complex task plans: <120 seconds
- **Actual Times:** Simple: ___ Complex: ___ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.3: Memory Usage
**Test:** Monitor memory during typical usage

**Targets:**
- Base memory usage: <500MB
- Peak usage during processing: <2GB
- **Actual Usage:** Base: ___ Peak: ___ MB
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.2: Response Quality
**Priority: High**

#### Test 5.2.1: Context Awareness
**Setup:** In a React TypeScript project
**Test:** `./dist/src/cli-selector.js --mode advanced ask "How should I organize my components?"`

**Quality Indicators:**
- [ ] Mentions React-specific patterns
- [ ] Considers TypeScript usage
- [ ] References project structure
- [ ] Provides actionable advice
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.2.2: Code Generation Quality
**Test:** `./dist/src/cli-selector.js --mode advanced ask "Create a user authentication system"`

**Quality Indicators:**
- [ ] Generated code is syntactically correct
- [ ] Follows security best practices
- [ ] Includes proper error handling
- [ ] Well-documented and commented
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.2.3: Plan Quality Assessment
**Test:** Complex multi-step request

**Quality Indicators:**
- [ ] Logical task breakdown
- [ ] Realistic time estimates
- [ ] Appropriate risk assessment
- [ ] Clear success criteria
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 6: Edge Cases and Error Handling

### Test Group 6.1: System Limits
**Priority: Medium**

#### Test 6.1.1: Large Project Handling
**Setup:** Large codebase (1000+ files)
**Test:** Project analysis and task planning

**Expected:**
- Selective analysis for performance
- Reasonable memory usage
- Progressive loading
- Timeout handling
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.1.2: Complex Dependency Chains
**Test:** Plan with 20+ interdependent tasks

**Expected:**
- Dependency resolution completes
- No circular dependencies
- Reasonable execution order
- Clear visualization
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.1.3: Resource Exhaustion
**Test:** Operations under resource constraints

**Expected:**
- Graceful degradation
- Priority-based resource allocation
- Clear resource limit messages
- Recovery when resources available
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 6.2: Error Scenarios
**Priority: High**

#### Test 6.2.1: Ollama Server Issues
**Setup:** Stop Ollama server during operation
**Test:** Continue using system

**Expected:**
- Clear connection error messages
- Graceful fallback behavior
- Recovery when server restored
- No data loss or corruption
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.2.2: File System Errors
**Test:** Insufficient permissions, disk full, etc.

**Expected:**
- Clear error messages
- No partial file writes
- Backup systems protected
- Recovery options provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 6.2.3: Invalid User Input
**Test:** Malformed requests, invalid commands

**Expected:**
- Input validation works
- Helpful error messages
- Suggestion for corrections
- No system crashes
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 7: Compatibility and Platform Tests

### Test Group 7.1: Operating System Compatibility
**Priority: Medium**

#### Test 7.1.1: Cross-Platform File Operations
**Platforms:** macOS, Linux, Windows (WSL)
**Test:** File creation, modification, backup operations

**Expected:**
- Consistent behavior across platforms
- Proper path handling
- File permission respect
- **Platform Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

#### Test 7.1.2: Node.js Version Compatibility
**Versions:** Node.js 18, 20, 22
**Test:** All core functionality

**Expected:**
- No version-specific issues
- Consistent API behavior
- Proper dependency resolution
- **Version Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

### Test Group 7.2: Model Compatibility
**Priority: High**

#### Test 7.2.1: Different Ollama Models
**Models:** llama3.2, codellama, mistral, qwen2.5-coder
**Test:** Intent analysis and code generation

**Expected:**
- Works with different model capabilities
- Adapts to model strengths
- Consistent interface
- **Model Tested:** _____________
- **Status:** [ ] Pass [ ] Fail [ ] N/A
- **Notes:** _____________

---

## Test Execution Summary

### Overall Test Results
- **Total Tests:** 65
- **Tests Passed:** _____ / 65
- **Tests Failed:** _____ / 65
- **Tests Skipped:** _____ / 65
- **Pass Rate:** _____%

### Test Results by Phase
- **Phase 1 - Natural Language Understanding:** _____ / 9 tests passed
- **Phase 2 - Autonomous Code Modification:** _____ / 12 tests passed
- **Phase 3 - Task Planning & Execution:** _____ / 12 tests passed
- **Phase 4 - Integration & System-Wide:** _____ / 9 tests passed
- **Phase 5 - Performance & Quality:** _____ / 9 tests passed
- **Phase 6 - Edge Cases & Error Handling:** _____ / 9 tests passed
- **Phase 7 - Compatibility & Platform:** _____ / 5 tests passed

### Critical Issues Found
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Non-Critical Issues
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Feature Completeness Assessment
- **Natural Language Understanding:** [ ] Complete [ ] Partial [ ] Major Issues
- **Intent Analysis & Routing:** [ ] Complete [ ] Partial [ ] Major Issues
- **Conversation Management:** [ ] Complete [ ] Partial [ ] Major Issues
- **Safe Code Editing:** [ ] Complete [ ] Partial [ ] Major Issues
- **AST Manipulation:** [ ] Complete [ ] Partial [ ] Major Issues
- **Backup & Recovery:** [ ] Complete [ ] Partial [ ] Major Issues
- **Task Planning:** [ ] Complete [ ] Partial [ ] Major Issues
- **Execution Strategies:** [ ] Complete [ ] Partial [ ] Major Issues
- **Risk Management:** [ ] Complete [ ] Partial [ ] Major Issues
- **Session Management:** [ ] Complete [ ] Partial [ ] Major Issues

### Production Readiness Assessment
**Overall System:** [ ] Ready for Production [ ] Needs Minor Fixes [ ] Needs Major Fixes [ ] Not Ready

### Specific Recommendations
1. **Performance Optimizations:** _____________________________________
2. **Safety Enhancements:** _____________________________________
3. **User Experience Improvements:** _____________________________________
4. **Error Handling Refinements:** _____________________________________

### Next Steps
- [ ] Address critical issues identified
- [ ] Implement performance optimizations
- [ ] Enhance error messaging and recovery
- [ ] Add missing safety checks
- [ ] Improve user documentation
- [ ] Conduct user acceptance testing
- [ ] Prepare production deployment

---

## Appendix: Advanced Testing Scenarios

### Scenario A: Full Development Workflow
**Goal:** Test complete development assistance workflow
**Steps:**
1. Project analysis request
2. Architecture recommendations
3. Code implementation
4. Testing strategy
5. Documentation generation
6. Deployment planning

**Success Criteria:**
- All phases complete successfully
- Consistent quality throughout
- Proper safety measures maintained
- User satisfaction with results

### Scenario B: Emergency Recovery
**Goal:** Test system recovery under adverse conditions
**Steps:**
1. Begin complex modification plan
2. Simulate system interruption
3. Restart system
4. Verify data integrity
5. Resume or rollback as appropriate

**Success Criteria:**
- No data loss or corruption
- Clear recovery options
- System stability maintained
- User confidence preserved

### Scenario C: Collaborative Development
**Goal:** Test system in team environment
**Steps:**
1. Multiple users working on same project
2. Concurrent modification requests
3. Shared backup and history
4. Conflict resolution

**Success Criteria:**
- Proper concurrency handling
- No conflicts or data races
- Clear ownership and permissions
- Seamless collaboration experience

---

**Test Plan Version:** 3.0 (Three-Phase Architecture)
**Created:** September 19, 2025
**Last Updated:** September 19, 2025
**Covers:** Complete AI-powered development assistant with autonomous capabilities
**Tested By:** ________________
**Date Executed:** ________________
**Environment:** ________________
**Notes:** This test plan covers the comprehensive three-phase implementation including natural language understanding, autonomous code modification, and intelligent task planning and execution.