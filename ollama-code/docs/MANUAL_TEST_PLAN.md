# Manual Test Plan - Ollama Code CLI v0.1.0
*Comprehensive Functional Testing for AI-Powered Development Assistant*

## Overview

This manual test plan validates the key functional capabilities of the Ollama Code CLI:

### 🧠 **Core AI Capabilities**
- Natural language understanding and intent recognition
- Intelligent query processing and routing
- Context-aware conversation management
- Multi-step query handling and session management

### 🔧 **Development Tools**
- Advanced Git repository analysis and insights
- Code quality assessment and security scanning
- Automated test generation and testing strategies
- Project structure analysis and recommendations

### 📊 **Knowledge & Analysis**
- Code knowledge graph with semantic understanding
- Architectural pattern detection and analysis
- Dependency mapping and relationship analysis
- Best practices integration and suggestions

### 🔄 **Integration Features**
- Enhanced interactive mode with rich formatting
- Command execution with safety controls
- Task planning and decomposition
- Error handling and recovery

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
echo "export function multiply(a, b) { return a * b; }" > math.js
echo "// TODO: Add validation" >> math.js
git add . && git commit -m "Initial commit"
mkdir src tests docs
echo "function validateInput(x) { return x > 0; }" > src/validation.js
echo "const assert = require('assert');" > tests/math.test.js
echo "# Project Documentation" > docs/README.md
git add . && git commit -m "Add project structure"
```

---

## 🧠 Natural Language Understanding & AI Capabilities

### Test Group: Intent Recognition and Classification
**Priority: Critical**

#### Test: Basic Intent Types
**Commands:**
```bash
./dist/src/cli-selector.js enhanced
```

**Test Queries:**
1. **Question Intent:** `"What files are in this project?"`
2. **Task Request:** `"Create a function to calculate factorial"`
3. **Command Intent:** `"Run the tests"`
4. **Analysis Request:** `"Analyze this codebase structure"`

**Expected Results:**
- System correctly identifies intent type (question/task_request/command/analysis)
- Extracts relevant entities (files, technologies, concepts)
- Routes to appropriate processing system
- Provides contextually appropriate responses
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Complex Query Understanding
**Test Queries:**
1. `"Create a user authentication system with JWT tokens and password hashing"`
2. `"Analyze the security vulnerabilities in this code and suggest improvements"`
3. `"Generate unit tests for the math functions and set up a testing framework"`

**Expected:**
- Multi-faceted requests properly parsed
- Multiple intents identified and prioritized
- Appropriate tool selection and routing
- Comprehensive responses addressing all aspects
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Conversational Context Management
**Priority: High**

#### Test: Session Continuity
**Test Sequence:**
```bash
# Start session
./dist/src/cli-selector.js enhanced
```
1. `"Analyze this repository structure"`
2. `"What about the test coverage?"`  (follow-up)
3. `"Show me the main dependencies"`  (follow-up)
4. `"Create a new component"`  (new topic)
5. `"Make it responsive"`  (follow-up to #4)

**Expected:**
- Follow-up queries maintain context from previous interactions
- New topics properly start fresh context
- Conversation history influences responses appropriately
- Session state persists throughout interaction
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Session Commands
**Commands to test:**
- `/session` - View current session details
- `/end-session` - End current session
- `/history` - View conversation history
- `/help` - Display help information
- `/clear` - Clear screen and reset

**Expected:**
- All session commands work correctly
- Session state properly managed
- Clear feedback for each command
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Multi-Step Query Processing
**Priority: High**

#### Test: Query Decomposition
**Test Query:** `"Set up a complete React application with TypeScript, testing, and deployment"`

**Expected Results:**
- Query automatically recognized as complex multi-step request
- Multiple intents identified: setup, configuration, testing, deployment
- Sub-tasks generated with proper dependencies
- Execution plan created with clear phases
- Risk assessment performed
- User approval requested for complex operations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Step-by-Step Execution
**Test with incremental queries:**
1. `"Start by creating a basic React component"`
2. `"Now add TypeScript interfaces for the props"`
3. `"Add unit tests for this component"`
4. `"Finally, add it to the main app"`

**Expected:**
- Each step builds on previous context
- Progressive complexity handled appropriately
- Context maintained across multiple interactions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## 🔧 Advanced Development Tools

### Test Group: Git Repository Analysis
**Priority: Critical**

#### Test: Repository Structure Analysis
**Command:** `"Analyze this git repository and show me its structure"`

**Expected Results:**
- Repository overview with current branch, file counts, commit statistics
- File type distribution and directory structure
- Repository health assessment with actionable insights
- Contributor analysis and activity patterns
- Visual formatting with appropriate icons and organization
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Git History and Contributors
**Test Commands:**
1. `"Show me the commit history for the last month"`
2. `"Who are the main contributors to this project?"`
3. `"Analyze the development patterns in this repository"`

**Expected:**
- Commit history with proper timeframe filtering
- Contributor statistics with commit counts and activity
- Development pattern analysis (peak hours, active days)
- Formatted output with readable timestamps and data
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Branch and Merge Analysis
**Test Commands:**
1. `"Show me all branches and their status"`
2. `"Check for any merge conflicts"`
3. `"Analyze the differences between branches"`

**Expected:**
- Branch listing with current status and last commits
- Conflict detection and resolution guidance
- Diff analysis with file-level changes
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Code Quality Assessment
**Priority: Critical**

#### Test: Comprehensive Code Analysis
**Command:** `"Analyze the code quality of this project"`

**Expected Results:**
- Overall quality score and assessment
- Complexity metrics and maintainability analysis
- Code structure evaluation with recommendations
- File-level analysis for large projects
- Actionable improvement suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Security Vulnerability Scanning
**Command:** `"Check this codebase for security vulnerabilities"`

**Expected:**
- Security risk level assessment
- Vulnerability detection with severity ratings
- Specific security issues identified (if any)
- Security best practices recommendations
- Clear remediation guidance
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Performance Analysis
**Command:** `"Analyze the performance characteristics of this code"`

**Expected:**
- Performance bottleneck identification
- Algorithm complexity analysis
- Resource usage assessment
- Optimization recommendations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Automated Testing Tools
**Priority: High**

#### Test: Test Generation
**Commands:**
1. `"Generate unit tests for the math.js file"`
2. `"Create integration tests for the main application"`
3. `"Set up a complete testing framework for this project"`

**Expected Results:**
- Source code analysis and test case generation
- Appropriate testing framework detection/recommendation
- Mock generation for dependencies
- Test coverage analysis and recommendations
- Executable test code with proper structure
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Testing Strategy Recommendations
**Command:** `"Recommend a testing strategy for this project"`

**Expected:**
- Project structure analysis for testing needs
- Framework recommendations based on project type
- Coverage targets and testing priorities
- Implementation roadmap with clear next steps
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## 📊 Knowledge Graph & Semantic Analysis

### Test Group: Code Understanding and Relationships
**Priority: High**

#### Test: Code Knowledge Graph Queries
**Commands:**
1. `"Show me what code elements are indexed in the knowledge graph"`
2. `"What architectural patterns are used in this codebase?"`
3. `"Show me the dependency relationships between modules"`

**Expected Results:**
- Knowledge graph statistics and indexed elements
- Architectural pattern detection and analysis
- Dependency mapping with relationship types
- Visual representation of code structure
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Semantic Code Analysis
**Commands:**
1. `"Find all functions that handle user input"`
2. `"Show me potential security vulnerabilities in data flow"`
3. `"Identify circular dependencies and coupling issues"`

**Expected:**
- Semantic search through codebase
- Data flow analysis and security implications
- Architectural anti-pattern detection
- Actionable refactoring suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Best Practices Integration
**Priority: Medium**

#### Test: Best Practices Analysis
**Commands:**
1. `"Check if this code follows JavaScript best practices"`
2. `"Suggest improvements based on modern React patterns"`
3. `"Identify areas that don't follow security best practices"`

**Expected:**
- Language-specific best practice evaluation
- Framework-specific pattern recommendations
- Security guideline compliance checking
- Prioritized improvement suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## 🔄 Integration & System Features

### Test Group: Enhanced Interactive Mode
**Priority: Critical**

#### Test: Rich Output Formatting
**Test various command types and verify:**
- Proper use of colors, icons, and formatting
- Structured output with clear sections
- Progress indicators and status updates
- Error messages with helpful guidance
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Tool Integration and Routing
**Test Commands:**
1. `"Help me understand this codebase"` (should route to appropriate tool)
2. `"Improve the quality of my project"` (should route to code analysis)
3. `"Check if my code is ready for production"` (should route to multiple tools)

**Expected:**
- Correct tool selection based on natural language input
- Fallback to conversation mode when routing is uncertain
- Clear indication of which tools are being used
- Seamless integration between different capabilities
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Error Handling and Recovery
**Priority: High**

#### Test: Graceful Error Handling
**Test Scenarios:**
1. Invalid file paths or missing files
2. Git repository not initialized
3. Network connectivity issues with Ollama
4. Malformed or ambiguous queries
5. System resource constraints

**Expected:**
- Clear error messages with helpful context
- Suggested solutions or workarounds
- Graceful degradation when services unavailable
- No system crashes or unhandled exceptions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test: Recovery and Continuation
**Test Scenarios:**
1. Interrupt a long-running operation
2. Resume after network disconnection
3. Continue after partial failure
4. Rollback from incomplete operations

**Expected:**
- Clean interruption handling
- State preservation during issues
- Clear recovery options presented to user
- Data integrity maintained
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group: Performance and Scalability
**Priority: Medium**

#### Test: Response Time and Resource Usage
**Performance Benchmarks:**
- Simple queries: < 2 seconds
- Complex analysis: < 10 seconds
- Large repository analysis: < 30 seconds
- Memory usage: < 500MB for typical operations

**Test with various project sizes:**
- Small project (< 100 files)
- Medium project (100-1000 files)
- Large project (> 1000 files)

**Expected:**
- Responsive performance across project sizes
- Reasonable resource consumption
- Progress indicators for long operations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## 🎯 Integration Test Scenarios

### Scenario A: Complete Development Workflow
**Goal:** Test end-to-end development assistance workflow

**Steps:**
1. **Project Analysis:** `"Analyze this project and give me an overview"`
2. **Code Quality:** `"What can I improve about the code quality?"`
3. **Testing:** `"Generate comprehensive tests for this project"`
4. **Git Analysis:** `"How is our git workflow and what should we improve?"`
5. **Security:** `"Check for any security issues"`

**Success Criteria:**
- All steps complete successfully with relevant, actionable insights
- Context maintained throughout the workflow
- Recommendations are practical and implementable
- User experience is smooth and intuitive

**Status:** [ ] Pass [ ] Fail
**Notes:** _____________

### Scenario B: Problem Diagnosis and Resolution
**Goal:** Test system's ability to help diagnose and solve development problems

**Steps:**
1. **Problem Description:** `"My tests are failing and I'm not sure why"`
2. **Analysis:** `"Can you help me understand what might be wrong?"`
3. **Investigation:** `"Show me the test structure and identify issues"`
4. **Solution:** `"What specific changes should I make?"`

**Success Criteria:**
- System provides helpful diagnostic guidance
- Multiple analysis tools used appropriately
- Specific, actionable solutions provided
- Problem-solving approach is logical and thorough

**Status:** [ ] Pass [ ] Fail
**Notes:** _____________

### Scenario C: Learning and Exploration
**Goal:** Test system's educational and exploration capabilities

**Steps:**
1. **Exploration:** `"I'm new to this codebase, help me understand it"`
2. **Learning:** `"Explain the architectural patterns used here"`
3. **Best Practices:** `"What best practices should I follow for this type of project?"`
4. **Next Steps:** `"What should I focus on learning next?"`

**Success Criteria:**
- Educational responses are clear and well-structured
- Examples and explanations are relevant to the actual codebase
- Learning path suggestions are appropriate for skill level
- Knowledge graph enhances understanding

**Status:** [ ] Pass [ ] Fail
**Notes:** _____________

---

## ✅ Test Execution Summary

### Critical Features (Must Pass)
- [ ] Natural language understanding and intent recognition
- [ ] Git repository analysis and insights
- [ ] Code quality assessment
- [ ] Test generation and strategy
- [ ] Enhanced interactive mode
- [ ] Error handling and recovery

### High Priority Features
- [ ] Session management and context continuity
- [ ] Multi-step query processing
- [ ] Knowledge graph integration
- [ ] Tool routing and integration
- [ ] Security analysis
- [ ] Performance analysis

### Medium Priority Features
- [ ] Best practices integration
- [ ] Advanced semantic analysis
- [ ] Performance optimization
- [ ] Scalability testing

### Overall System Health
- [ ] No critical bugs or crashes
- [ ] Acceptable performance across all features
- [ ] User experience meets expectations
- [ ] All core workflows function properly

---

**Test Plan Version:** 10.0 (Functional Capability Organization)
**Created:** September 21, 2025
**Last Updated:** September 21, 2025 (Reorganized by Functional Capabilities)
**Environment:** macOS Darwin 25.0.0, Node.js 24.2.0, Ollama Code CLI v0.1.0
**Coverage:** Comprehensive functional testing covering natural language AI capabilities, advanced development tools, knowledge graph integration, and system integration features
**Tested By:** _____________
**Date Executed:** _____________
**Notes:** This test plan is organized around the functional capabilities that users interact with, rather than implementation phases. It provides a user-centric view of testing that aligns with actual usage patterns and feature sets. All major capabilities are covered with both individual feature tests and integrated workflow scenarios.