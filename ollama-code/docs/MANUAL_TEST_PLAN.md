# Manual Test Plan - Ollama Code CLI v0.1.0
*Comprehensive Testing for Three-Phase AI-Powered Development Assistant*

## Overview
This manual test plan validates the enhanced query processing architecture implementation:
- **Phase 1:** Enhanced Intent Analysis with Timeout Protection ✅
- **Phase 2:** Multi-Step Query Processing with Context Management ✅
- **Phase 3:** Advanced Context Management ✅
- **Phase 4:** Query Decomposition Engine ✅
- **Phase 5:** Knowledge Graph Integration (Planned)

The system provides intelligent query processing with session management, follow-up detection, context awareness, and progressive disclosure for complex interactions.

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

## Quick Reference: Phase 2 Testing Commands

### Interactive Mode Session Testing
```bash
# Start interactive mode
./dist/src/cli-selector.js interactive

# Test multi-step query processing (in interactive mode)
analyze this codebase structure
what about the test files?
explain more about the structure

# Session management commands
/session          # View current session details
/end-session      # End current session
/help             # View updated help with session commands
```

### Follow-Up Detection Test Patterns
```bash
# Follow-up patterns that should be detected:
"what about..."
"can you also..."
"explain more..."
"tell me more..."
"show me the..."

# Independent queries (should not be follow-ups):
"create a component"
"run the tests"
"list files"
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
1. `./dist/src/cli-selector.js --mode advanced ask "What's in index.ts?"`
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

## Phase 2: Multi-Step Query Processing System Tests

### Test Group 2.1: Query Session Management
**Priority: Critical**

#### Test 2.1.1: Query Session Creation
**Test Method:** Interactive Mode
1. Start interactive mode: `./dist/src/cli-selector.js interactive`
2. Enter: `analyze this codebase structure`
3. Check session creation with: `/session`

**Expected Results:**
- New query session automatically created for complex queries
- Session ID generated and displayed
- Initial query recorded correctly
- Session shows as "Active" status
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.2: Session State Tracking
**Test Sequence:**
1. In interactive mode, ask: `analyze this codebase`
2. Then ask: `what about the test files?` (follow-up)
3. Then ask: `explain more about the structure` (follow-up)
4. Check session: `/session`

**Expected:**
- All queries recorded in session
- Follow-up queries properly detected and marked
- Query timestamps preserved
- Current step counter incremented
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.1.3: Session Termination
**Test Commands:**
1. Create active session with complex query
2. Use: `/end-session`
3. Verify session ended: `/session`

**Expected:**
- Session marked as completed
- End time recorded
- Query statistics displayed
- No active session remains
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.2: Follow-Up Query Detection
**Priority: High**

#### Test 2.2.1: Follow-Up Pattern Recognition
**Test Queries in sequence:**
1. `analyze the code structure`
2. `what about the dependencies?`
3. `can you also show me the test coverage?`
4. `explain more about the architecture`
5. `tell me more about performance`

**Expected:**
- First query: not detected as follow-up
- Subsequent queries: correctly detected as follow-ups
- Follow-up indicators shown in session display
- Context from previous queries maintained
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.2.2: Non-Follow-Up Detection
**Test Queries:**
1. `analyze this codebase`
2. `create a new component` (independent request)
3. `run the tests` (independent command)

**Expected:**
- Independent requests not marked as follow-ups
- New context started for non-follow-up queries
- Session continues but context shifts appropriately
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.3: Context-Aware Processing
**Priority: High**

#### Test 2.3.1: Context Building Across Queries
**Test Sequence:**
1. `explain the main application file`
2. `how can we improve its performance?`
3. `what about error handling in that file?`

**Expected:**
- Second query references context from first
- Third query maintains accumulated context
- Responses show awareness of previous discussion
- Context includes file references and topics
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.3.2: Project Context Integration
**Setup:** In a project directory with multiple files
**Test:** Ask: `analyze the project structure and dependencies`

**Expected:**
- Response references actual project files
- Project context integrated into session
- Working directory information available
- File structure understanding demonstrated
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.4: Progressive Disclosure and Suggestions
**Priority: High**

#### Test 2.4.1: Suggestion Generation
**Test Query:** `analyze this codebase`

**Expected:**
- Relevant suggestions provided after response
- Suggestions numbered and clearly formatted
- Context-appropriate suggestions for analysis queries
- Follow-up encouragement provided if needed
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.4.2: Different Query Type Suggestions
**Test Queries:**
1. `show me the main file` (file-focused)
2. `help me with something` (generic)
3. `analyze the performance` (analysis-focused)

**Expected:**
- File queries: suggest content viewing, analysis
- Generic queries: offer elaboration options
- Analysis queries: suggest patterns, issues, coverage
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.5: Query Chaining and Refinement
**Priority: High**

#### Test 2.5.1: Query Chaining Capability
**Test:** Complex analysis with refinement
1. Start with: `analyze the code`
2. System should support chaining to: `focus on performance`
3. Check combined processing

**Expected:**
- Chained queries processed as single refined request
- Context from both parts maintained
- Result addresses combined intent
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.5.2: Query Refinement
**Test:** Refinement with additional context
1. Base query: `find issues`
2. Refinement: `specifically security vulnerabilities`

**Expected:**
- Refined query processed with additional specificity
- Original intent preserved but narrowed
- More targeted and relevant results
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.6: Session Commands and Management
**Priority: Medium**

#### Test 2.6.1: Session Display Command
**Test:** In interactive mode with active session
1. Use command: `/session`

**Expected:**
- Session details clearly displayed
- Query history with timestamps
- Results summary shown
- Session metadata visible
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.6.2: Help System Integration
**Test:** Check updated help
1. Use command: `/help`

**Expected:**
- New session commands listed
- `/session` command documented
- `/end-session` command documented
- Clear descriptions provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.6.3: Multiple Session Workflow
**Test:** Session lifecycle
1. Create session with complex query
2. Process several follow-ups
3. End session: `/end-session`
4. Start new session with different query

**Expected:**
- Clean session transitions
- No context bleeding between sessions
- Proper session isolation
- Statistics accurately reported
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 2.7: Integration with Enhanced Interactive Mode
**Priority: Critical**

#### Test 2.7.1: Automatic Multi-Step Detection
**Test Queries:**
1. `list files` (simple, no multi-step)
2. `analyze the codebase architecture` (complex, triggers multi-step)

**Expected:**
- Simple queries use standard processing
- Complex queries automatically use multi-step
- Smooth transition between modes
- No user intervention required
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.7.2: Session Persistence in Interactive Mode
**Test:** Long interactive session
1. Process multiple complex queries
2. Mix follow-ups with independent queries
3. Use session commands throughout

**Expected:**
- Session state maintained throughout
- Interactive mode remains responsive
- Session commands work consistently
- No memory leaks or performance degradation
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 2.7.3: Animated Thinking Indicators
**Test:** Visual feedback during processing
1. Start interactive mode
2. Ask complex questions that require AI processing
3. Observe animated thinking indicators during waits

**Expected:**
- Animated spinner shows during AI processing (- \ | /)
- Different spinner messages for different operations:
  - "Thinking..." for conversation processing
  - "Processing multi-step query..." for complex queries
  - "Creating a task plan..." for task planning
  - "Executing task plan..." for task execution
- Spinner stops with success/failure indicators
- Clean terminal output without artifacts
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 3: Advanced Context Management Tests

### Test Group 3.1: Semantic Code Analysis
**Priority: Critical**

#### Test 3.1.1: Symbol Extraction and Indexing
**Setup:** Create test files with various code patterns
```bash
# Create test files
mkdir -p test-context && cd test-context
cat > user.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  async createUser(userData: User): Promise<User> {
    return userData;
  }

  async getUserById(id: string): Promise<User | null> {
    return null;
  }
}
EOF

cat > auth.ts << 'EOF'
import { User } from './user.js';

export function validateUser(user: User): boolean {
  return user.email.includes('@');
}

export async function authenticateUser(email: string): Promise<User | null> {
  return null;
}
EOF
```

**Test Command:** `./dist/src/cli-selector.js interactive`
Then ask: `"analyze the code structure and explain the user management system"`

**Expected Results:**
- System extracts symbols: interfaces (User), classes (UserService), functions (validateUser, authenticateUser)
- Identifies code concepts: user management, authentication patterns
- Detects relationships between files through imports
- Calculates code complexity metrics
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.2: Code Pattern Recognition
**Test Queries:**
1. `"show me the authentication patterns in this code"`
2. `"what data management approaches are used?"`
3. `"identify the architectural patterns"`

**Expected:**
- Domain patterns detected (authentication, data-management, user-management)
- Architectural patterns identified (service layer, interface segregation)
- Pattern confidence scores provided
- Relevant code examples highlighted
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.1.3: Complexity Analysis
**Test Query:** `"analyze the code complexity and potential issues"`

**Expected:**
- Cyclomatic complexity calculated for functions/methods
- Code quality metrics provided
- Potential issues identified (missing error handling, etc.)
- Complexity scoring (low/medium/high) assigned
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.2: Code Relationship Mapping
**Priority: High**

#### Test 3.2.1: Dependency Resolution
**Test Setup:** Files with import/export relationships
**Test Query:** `"show me how these files depend on each other"`

**Expected:**
- Import dependencies correctly mapped
- Export usage tracked
- Dependency graph visualization or description
- Circular dependency detection (if any)
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.2: Related Code Discovery
**Test Query:** `"find code related to user authentication"`

**Expected:**
- Related files identified based on imports/exports
- Semantic relationships discovered
- Code similarity scoring applied
- Related symbols and concepts highlighted
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.2.3: Cross-File Context
**Test Sequence:**
1. `"explain the User interface"`
2. `"where is this interface used?"`

**Expected:**
- First query provides interface details
- Second query shows usage across multiple files
- Relationship context maintained between queries
- Usage examples from related files provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.3: Domain Knowledge Integration
**Priority: High**

#### Test 3.3.1: Domain Context Matching
**Test Queries:**
1. `"help me with web API security"`
2. `"optimize database performance"`
3. `"improve test coverage"`
4. `"enhance error handling"`

**Expected:**
- Queries matched to appropriate domain knowledge (security, performance, testing)
- Domain-specific patterns and practices suggested
- Confidence scores for domain matches provided
- Relevant domain context included in responses
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.3.2: Cross-Domain Integration
**Test Query:** `"create a secure user registration system with proper testing"`

**Expected:**
- Multiple domains integrated (security, web-development, testing)
- Domain knowledge combined effectively
- Security best practices mentioned
- Testing strategies included
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.3.3: Domain Knowledge Accuracy
**Test:** Verify domain knowledge patterns against established best practices

**Expected:**
- Security patterns include authentication, authorization, input validation
- Performance patterns include caching, optimization, monitoring
- Testing patterns include unit tests, integration tests, mocking
- Web development patterns include REST APIs, MVC, middleware
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.4: Enhanced Context Suggestions
**Priority: High**

#### Test 3.4.1: Contextual Suggestion Generation
**Test Query:** `"analyze this authentication system"`

**Expected:**
- Relevant suggestions provided after response
- Suggestions numbered and clearly formatted (1. 2. 3.)
- Context-appropriate suggestions (e.g., "Explore auth.ts for validateUser implementation")
- Related file exploration suggested
- Confidence indicator shown (if >70%)
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.4.2: Dependency-Based Suggestions
**Test Query:** `"explain the UserService class"`

**Expected:**
- Suggestions include checking dependencies and dependents
- Import analysis suggestions provided
- Related code exploration recommendations
- Usage pattern analysis suggested
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.4.3: Domain-Specific Suggestions
**Test Queries with different domains:**
1. `"review security in authentication"`
2. `"analyze performance bottlenecks"`
3. `"improve testing strategy"`

**Expected:**
- Domain-specific suggestions for each query type
- Security queries suggest vulnerability analysis, best practices
- Performance queries suggest optimization areas, monitoring
- Testing queries suggest test coverage, strategy improvements
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.5: Historical Context Tracking
**Priority: Medium**

#### Test 3.5.1: Context History Management
**Test Sequence:**
1. `"analyze user management code"`
2. `"what about security aspects?"`
3. `"suggest improvements"`

**Expected:**
- Historical context accumulated across queries
- Previous analysis results referenced in follow-up queries
- Context relevance scoring applied
- History size limits respected (max 100 entries)
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.5.2: Context Relevance Filtering
**Test:** Mix relevant and irrelevant queries in session

**Expected:**
- Only relevant historical context included in responses
- Irrelevant context filtered out based on topic similarity
- Context aging applied (older context weighted less)
- Performance maintained with large context history
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.5.3: Context Memory Management
**Test:** Long session with many queries (20+ interactions)

**Expected:**
- Memory usage remains reasonable
- LRU eviction working for cache
- Context expiration (5-minute TTL) functioning
- No memory leaks in historical context tracking
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.6: Integration with Enhanced Interactive Mode
**Priority: Critical**

#### Test 3.6.1: Seamless Context Integration
**Test:** Start interactive mode and ask context-heavy questions

**Expected:**
- Context gathering happens automatically
- "Gathering enhanced context..." spinner appears
- Context processing time reasonable (<5 seconds)
- Enhanced context seamlessly integrated into responses
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.6.2: Context-Enhanced Routing
**Test Queries:**
1. `"help with authentication"` (should trigger domain context)
2. `"explain the UserService"` (should trigger semantic analysis)
3. `"what files import user.ts?"` (should trigger relationship analysis)

**Expected:**
- Different query types trigger appropriate context analysis
- Context type selection working correctly
- Routing enhanced with contextual information
- No performance degradation from context integration
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.6.3: Context Display and Suggestions
**Test:** Interactive session with various query types

**Expected:**
- Enhanced context suggestions displayed with 🔍 icon
- Suggestions formatted with numbering (1. 2. 3.)
- Confidence percentages shown when >70%
- Suggestions relevant to current context
- Clean terminal output without artifacts
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.7: Performance and Scalability
**Priority: High**

#### Test 3.7.1: Context Processing Performance
**Test:** Large codebase analysis (10+ files, 1000+ lines)

**Targets:**
- Context initialization: <10 seconds
- Semantic analysis per file: <2 seconds
- Context retrieval: <3 seconds
- Memory usage: <200MB for context data
- **Actual Performance:** Init: ___ Analysis: ___ Retrieval: ___ Memory: ___
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.7.2: Cache Effectiveness
**Test:** Repeated queries with similar context needs

**Expected:**
- Context cache hits for repeated analysis
- Cache expiration working (5-minute TTL)
- Cache size limits respected
- Significant performance improvement on cache hits
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.7.3: Concurrent Context Operations
**Test:** Multiple context requests in parallel (if possible)

**Expected:**
- Thread-safe context operations
- No race conditions in cache access
- Consistent results across concurrent requests
- Resource sharing working efficiently
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.8: Error Handling and Edge Cases
**Priority: Medium**

#### Test 3.8.1: Malformed Code Handling
**Setup:** Create files with syntax errors or incomplete code
**Test Query:** `"analyze this codebase"`

**Expected:**
- Graceful handling of syntax errors
- Partial analysis where possible
- Clear error reporting for problematic files
- System continues functioning despite errors
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.8.2: Missing Dependencies
**Setup:** Code files with missing import targets
**Test Query:** `"show me the dependency relationships"`

**Expected:**
- Missing dependencies identified and reported
- Partial relationship graph constructed
- Clear warnings about unresolved dependencies
- No system crashes or failures
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.8.3: Context Manager Initialization Failure
**Test:** Simulate context manager initialization issues

**Expected:**
- Graceful fallback to basic context mode
- Clear logging of initialization failure
- System continues functioning without enhanced context
- Error messages helpful for debugging
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 3.9: Context Accuracy and Quality
**Priority: High**

#### Test 3.9.1: Symbol Extraction Accuracy
**Test:** Verify extracted symbols match actual code structure

**Expected:**
- All classes, interfaces, functions correctly identified
- Proper scope and signature extraction
- Method parameter and return types captured
- Export/import statements correctly parsed
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.9.2: Relationship Accuracy
**Test:** Verify relationship mappings are correct

**Expected:**
- Import/export relationships accurately mapped
- Dependency directions correct
- No false positive relationships
- Circular dependencies detected accurately
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 3.9.3: Domain Knowledge Relevance
**Test:** Query domain-specific patterns and verify accuracy

**Expected:**
- Security patterns relevant and up-to-date
- Performance recommendations practical and effective
- Testing strategies align with modern practices
- Web development patterns follow current standards
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 4: Query Decomposition Engine Tests

### Test Group 4.1: Query Decomposition and Multi-Intent Analysis
**Priority: Critical**

#### Test 4.1.1: Complex Multi-Action Query Decomposition
**Test Command:** `./dist/src/cli-selector.js interactive`
Then ask: `"Create a user management system with authentication, add comprehensive tests, and deploy to production"`

**Expected Results:**
- Query automatically recognized as complex multi-action request
- System triggers query decomposition process
- Multiple intents identified: implementation, testing, deployment
- Sub-tasks generated with proper dependencies
- Execution plan created with phases
- Risk assessment performed (should be high due to deployment)
- User approval required for high-risk operations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.2: Intent Recognition and Classification
**Test Queries in sequence:**
1. `"analyze the codebase and refactor for performance"`
2. `"implement unit tests and integration tests"`
3. `"optimize database queries and add caching"`

**Expected:**
- Each query correctly classified by intent type (analysis/implementation, testing, optimization)
- Appropriate confidence scores assigned (>0.7 for clear intents)
- Entity extraction works (files, technologies, concepts)
- Priority scheduling applied correctly
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.1.3: Dependency Analysis and Resolution
**Test Query:** `"create API endpoints, add database models, implement authentication, and write tests"`

**Expected:**
- Dependencies correctly identified (models → endpoints → auth → tests)
- Topological sorting produces correct execution order
- Circular dependencies detected if present
- Critical path identified and highlighted
- Execution phases created with parallelizable tasks
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.2: Execution Planning and Resource Calculation
**Priority: High**

#### Test 4.2.1: Resource Requirements Calculation
**Test Query:** `"refactor the entire application to use TypeScript and add full test coverage"`

**Expected:**
- CPU, memory, network, disk requirements calculated
- Estimated duration provided (should be high for large refactor)
- Concurrent task limits respected
- Resource conflicts detected and resolved
- Execution phases optimized for resource usage
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.2: Execution Phase Management
**Test:** Complex query with mixed task types

**Expected:**
- Sequential phases created for dependent tasks
- Parallel execution enabled for independent tasks
- Phase transitions handled smoothly
- Resource requirements aggregated per phase
- Phase duration estimates provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.2.3: Priority Scheduling and Optimization
**Test Query:** Mix of high and low priority requests

**Expected:**
- Tasks ordered by priority and dependencies
- Critical path optimization applied
- Resource allocation favors high-priority tasks
- Schedule optimization balances time vs resources
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.3: Conflict Detection and Risk Assessment
**Priority: High**

#### Test 4.3.1: Task Conflict Detection
**Test Query:** `"modify config.js and update config.js with new settings"`

**Expected:**
- File modification conflicts detected
- Resource conflicts identified
- Timing conflicts recognized
- Conflict resolution strategies suggested
- User warned about potential conflicts
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.3.2: Risk Assessment and Mitigation
**Test Queries:**
1. `"delete old files and restructure project"` (high risk)
2. `"add comments to functions"` (low risk)
3. `"deploy to production with database migration"` (critical risk)

**Expected:**
- Risk levels correctly assessed (low/medium/high/critical)
- Risk factors identified (data loss, system impact, etc.)
- Mitigation strategies suggested
- Approval requirements based on risk level
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.3.3: Approval Workflow
**Test:** High-risk query requiring approval

**Expected:**
- Approval prompt displayed with risk details
- User can approve, reject, or modify plan
- Risk mitigations clearly communicated
- Plan execution waits for approval
- Rejection stops execution cleanly
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.4: Query Decomposition Display and Interaction
**Priority: High**

#### Test 4.4.1: Decomposition Results Display
**Test:** Complex query with decomposition

**Expected:**
- Clear decomposition summary displayed
- Sub-tasks listed with descriptions and estimates
- Dependencies visualized or described
- Execution plan phases shown
- Risk assessment clearly communicated
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.4.2: Interactive Plan Modification
**Test:** Request to modify decomposition plan

**Expected:**
- User can request plan modifications
- Plan updates correctly with new requirements
- Dependencies recalculated automatically
- Risk assessment updated
- New execution order generated
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.4.3: Progress Tracking During Execution
**Test:** Monitor decomposition plan execution

**Expected:**
- Real-time progress updates shown
- Current task and phase clearly indicated
- Completion status tracked per task
- Time estimates updated based on actual progress
- Cancellation option available
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.5: Performance and Caching
**Priority: Medium**

#### Test 4.5.1: Decomposition Performance
**Test:** Large complex query with many sub-tasks

**Targets:**
- Decomposition analysis: <10 seconds
- Cache hit for similar queries: <2 seconds
- Memory usage during decomposition: <100MB
- **Actual Performance:** Analysis: ___ Cache: ___ Memory: ___
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.5.2: Cache Effectiveness
**Test:** Repeated similar queries

**Expected:**
- Similar queries use cached decomposition results
- Cache key generation works correctly
- LRU eviction prevents memory bloat
- Cache expiration (5 minutes) working
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.5.3: Statistics and Monitoring
**Test:** Check decomposition statistics

**Expected:**
- Decomposition statistics available and accurate
- Cache hit rate tracking working
- Performance metrics collected
- Success rate monitoring functional
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.6: Integration with Enhanced Interactive Mode
**Priority: Critical**

#### Test 4.6.1: Automatic Query Routing
**Test Queries:**
1. `"list files"` (simple, no decomposition)
2. `"create a web app with authentication and tests"` (complex, triggers decomposition)

**Expected:**
- Simple queries bypass decomposition
- Complex queries automatically trigger decomposition
- Smooth transition between modes
- No user intervention required for routing
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.6.2: Decomposition Integration
**Test:** Interactive mode with complex queries

**Expected:**
- Decomposition engine initialized properly
- Context passed correctly to decomposition
- Results integrated seamlessly with interactive mode
- Visual indicators for decomposition processing
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.6.3: Session Management Integration
**Test:** Decomposition within query sessions

**Expected:**
- Decomposition results tracked in session
- Session context available to decomposition engine
- Multiple decompositions per session supported
- Session statistics include decomposition metrics
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 4.7: Error Handling and Edge Cases
**Priority: Medium**

#### Test 4.7.1: Malformed Query Handling
**Test Queries:**
1. `"do something"`
2. `"fix it"`
3. Empty or very short queries

**Expected:**
- Graceful handling of ambiguous queries
- Clarification requests generated
- No system crashes or errors
- Helpful error messages provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.7.2: AI Service Failures
**Test:** Simulate AI service unavailability

**Expected:**
- Graceful fallback to pattern-based analysis
- Clear error messages about AI unavailability
- Basic decomposition still functional
- System continues operating
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 4.7.3: Resource Constraint Handling
**Test:** Queries requiring excessive resources

**Expected:**
- Resource limit detection working
- Alternative execution strategies suggested
- User warned about resource requirements
- Graceful degradation when resources limited
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 5: Code Knowledge Graph Integration Tests

### Test Group 5.1: Knowledge Graph Initialization and Schema
**Priority: Critical**

#### Test 5.1.1: Graph Initialization and Project Analysis
**Test Command:** `./dist/src/cli-selector.js interactive`
Then ask: `"analyze the codebase structure using knowledge graph"`

**Expected Results:**
- System initializes knowledge graph successfully
- Project files indexed with semantic analysis
- Graph schema built with node and edge types
- "Code knowledge graph enabled" message displayed
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.2: Code Element Indexing
**Setup:** Create test project with various code elements
```bash
mkdir -p test-knowledge-graph && cd test-knowledge-graph
cat > UserService.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  async createUser(userData: User): Promise<User> {
    return userData;
  }

  async getUserById(id: string): Promise<User | null> {
    return null;
  }
}
EOF

cat > AuthController.ts << 'EOF'
import { User, UserService } from './UserService.js';

export class AuthController {
  constructor(private userService: UserService) {}

  async login(email: string): Promise<User | null> {
    return this.userService.getUserById(email);
  }
}
EOF
```

**Test Query:** `"show me what code elements are indexed in the knowledge graph"`

**Expected:**
- Files indexed as nodes (UserService.ts, AuthController.ts)
- Classes indexed (User, UserService, AuthController)
- Functions indexed (createUser, getUserById, login)
- Interfaces indexed (User)
- Node metadata includes file paths and line numbers
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.3: Relationship Mapping
**Test Query:** `"what relationships exist between code elements?"`

**Expected:**
- Import relationships detected (AuthController imports from UserService)
- Containment relationships (files contain classes, classes contain methods)
- Interface implementation relationships identified
- Dependency relationships mapped correctly
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.2: Architectural Pattern Detection
**Priority: High**

#### Test 5.2.1: Service Layer Pattern Detection
**Setup:** Project with service classes
**Test Query:** `"what architectural patterns are detected in this code?"`

**Expected:**
- Service layer pattern identified with confidence score
- Pattern nodes include service classes
- Pattern description provided
- Confidence score >70% for clear service patterns
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.2.2: CRUD Operations Pattern Detection
**Setup:** Code with create, read, update, delete operations
**Test Query:** `"find CRUD patterns in the codebase"`

**Expected:**
- CRUD operations pattern detected
- Functions with create/read/update/delete operations identified
- Pattern confidence scoring applied
- Related functions grouped in pattern
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.2.3: Repository Pattern Detection
**Setup:** Code with repository-like classes
**Test Query:** `"identify repository patterns"`

**Expected:**
- Repository pattern detected when applicable
- Data access abstraction patterns identified
- Pattern validation working correctly
- Appropriate confidence scores assigned
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.3: Knowledge Graph Querying
**Priority: Critical**

#### Test 5.3.1: Basic Graph Queries
**Test Queries:**
1. `"find all classes in the project"`
2. `"show me functions that handle users"`
3. `"what interfaces are defined?"`

**Expected:**
- Relevant nodes returned for each query type
- Query confidence scores >50%
- Processing time <5 seconds
- Results include node metadata (file, line number)
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.3.2: Relationship Queries
**Test Queries:**
1. `"what depends on UserService?"`
2. `"show me what UserService uses"`
3. `"find related code to AuthController"`

**Expected:**
- Direct relationships identified correctly
- Indirect relationships discovered (with distance)
- Relationship types clearly displayed (imports, extends, calls)
- Confidence scores provided for relationships
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.3.3: Complex Graph Queries
**Test Queries:**
1. `"find all authentication-related code"`
2. `"show me the data flow from user input to database"`
3. `"what code patterns are used for error handling?"`

**Expected:**
- Complex queries processed successfully
- Multiple node types returned
- Pattern matching applied to queries
- Comprehensive results with explanations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.4: Related Code Discovery
**Priority: High**

#### Test 5.4.1: Direct Code Relationships
**Test Query:** `"what code is directly related to UserService?"`

**Expected:**
- Direct imports/exports listed
- Classes that extend or implement shown
- Functions that call UserService methods
- Distance = 1 for all direct relationships
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.4.2: Indirect Code Relationships
**Test Query:** `"find all code indirectly connected to User interface"`

**Expected:**
- Multi-hop relationships discovered
- Path distances calculated correctly (2, 3, etc.)
- Relationship paths shown
- Indirect dependencies identified
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.4.3: Code Similarity and Patterns
**Test Query:** `"find code similar to UserService class"`

**Expected:**
- Similar classes identified by pattern
- Service-like classes grouped together
- Similarity confidence scores provided
- Common patterns highlighted
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.5: Best Practices Integration
**Priority: High**

#### Test 5.5.1: Pattern-Based Best Practices
**Test Query:** `"what best practices apply to this service layer?"`

**Expected:**
- Best practices linked to detected patterns
- Dependency injection recommendations
- Single responsibility principle suggestions
- Error handling best practices
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.5.2: Security Best Practices
**Test Query:** `"what security best practices should I consider?"`

**Expected:**
- Input validation recommendations
- Authentication security practices
- Data protection guidelines
- Security pattern suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.5.3: Code Quality Recommendations
**Test Query:** `"suggest improvements for code quality"`

**Expected:**
- Interface extraction suggestions
- Code organization recommendations
- Maintainability improvements
- Testing strategy suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.6: Improvement Suggestions
**Priority: High**

#### Test 5.6.1: Architecture Improvement Suggestions
**Test Query:** `"suggest architectural improvements"`

**Expected:**
- Repository pattern implementation suggested
- Service layer organization recommendations
- Dependency injection improvements
- Architecture modernization suggestions
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.6.2: Performance Improvement Suggestions
**Test Query:** `"what performance improvements can be made?"`

**Expected:**
- Caching layer suggestions
- Query optimization recommendations
- Performance monitoring suggestions
- Resource utilization improvements
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.6.3: Maintainability Suggestions
**Test Query:** `"how can I improve code maintainability?"`

**Expected:**
- Error handling improvements
- Documentation suggestions
- Code organization recommendations
- Testing coverage improvements
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.7: Data Flow Analysis
**Priority: Medium**

#### Test 5.7.1: Simple Data Flow Tracking
**Test Query:** `"trace data flow from login function to user retrieval"`

**Expected:**
- Data flow path identified
- Flow type classified (data_dependency, control_flow)
- Path complexity assessed (low/medium/high)
- Flow confidence score provided
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.7.2: Complex Data Flow Analysis
**Test Query:** `"analyze data flow through the entire user management system"`

**Expected:**
- Multi-step data flows mapped
- Complex flow patterns identified
- Flow bottlenecks highlighted
- End-to-end flow visualization
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.7.3: Dependency Flow Validation
**Test Query:** `"validate data dependencies in authentication flow"`

**Expected:**
- Dependency chain validated
- Missing dependencies identified
- Circular dependencies detected
- Flow consistency verified
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.8: Performance and Caching
**Priority: Medium**

#### Test 5.8.1: Query Performance
**Test:** Execute multiple graph queries and measure performance

**Performance Targets:**
- Graph initialization: <10 seconds
- Simple queries: <2 seconds
- Complex queries: <5 seconds
- Related code discovery: <3 seconds
- **Actual Performance:** Init: ___ Simple: ___ Complex: ___ Related: ___
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.8.2: Cache Effectiveness
**Test:** Repeat identical queries multiple times

**Expected:**
- Second query faster than first (cache hit)
- Cache hit rate >50% for repeated queries
- Cache expiration working (5-minute TTL)
- Memory usage stable with caching
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.8.3: Memory Usage and Limits
**Test:** Large codebase with many files

**Expected:**
- Memory usage <200MB for typical projects
- Node/edge limits respected
- Graceful handling of memory constraints
- Performance degradation minimal with size
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.9: Visual Display and User Experience
**Priority: High**

#### Test 5.9.1: Graph Results Display
**Test Query:** `"show me the project structure in the knowledge graph"`

**Expected:**
- Clear visual hierarchy of results
- Node types clearly identified (🕸️ knowledge graph icon)
- Confidence percentages displayed
- Processing time shown
- File paths and line numbers included
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.9.2: Relationship Display
**Test Query:** `"what are the relationships between classes?"`

**Expected:**
- Relationship arrows clearly shown (--[type]-->)
- Source and target nodes identified
- Relationship types labeled (imports, extends, contains)
- Multiple relationships grouped logically
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.9.3: Improvement Suggestions Display
**Test Query:** `"suggest code improvements"`

**Expected:**
- Suggestions numbered and organized (🚀 icon)
- Impact and effort levels shown
- Priority scores displayed
- Rationale provided for each suggestion
- Actionable recommendations given
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.10: Integration with Enhanced Interactive Mode
**Priority: Critical**

#### Test 5.10.1: Automatic Knowledge Graph Routing
**Test Queries:**
1. `"list files"` (should not use knowledge graph)
2. `"find relationships between classes"` (should use knowledge graph)
3. `"what patterns exist in the code?"` (should use knowledge graph)

**Expected:**
- Simple queries bypass knowledge graph
- Relationship queries automatically route to knowledge graph
- Pattern queries trigger graph analysis
- Smooth transition between modes
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.10.2: Knowledge Graph Query Detection
**Test Queries:**
1. `"show me code dependencies"`
2. `"find similar functions"`
3. `"what architecture patterns are used?"`
4. `"explore code relationships"`

**Expected:**
- All queries correctly identified as knowledge graph queries
- "Searching knowledge graph..." spinner shown
- Appropriate routing decisions made
- No manual mode switching required
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.10.3: Session Integration
**Test:** Knowledge graph queries within active sessions

**Expected:**
- Graph results integrated with session context
- Session history includes graph queries
- Multi-step graph exploration supported
- Session statistics include graph operations
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.11: Error Handling and Edge Cases
**Priority: Medium**

#### Test 5.11.1: Malformed Graph Queries
**Test Queries:**
1. `"find nothing specific"`
2. `"show me the things"`
3. Empty or very short queries

**Expected:**
- Graceful handling of ambiguous queries
- Helpful error messages or suggestions
- No system crashes or failures
- Fallback to general analysis when appropriate
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.11.2: Large Codebase Handling
**Setup:** Project with 50+ files and 500+ code elements
**Test:** Various knowledge graph operations

**Expected:**
- Initialization completes successfully
- Query performance remains acceptable
- Memory usage within reasonable limits
- Results appropriately filtered and limited
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.11.3: Graph Consistency and Validation
**Test:** Add/remove code elements and re-analyze

**Expected:**
- Graph updates reflect code changes
- Relationships remain consistent
- No orphaned nodes or edges
- Pattern detection adapts to changes
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

### Test Group 5.12: Graph Statistics and Monitoring
**Priority: Low**

#### Test 5.12.1: Comprehensive Graph Statistics
**Test Query:** `"show me knowledge graph statistics"`

**Expected:**
- Node and edge counts displayed
- Pattern coverage percentages
- Relationship accuracy metrics
- Performance statistics available
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.12.2: Quality Metrics Tracking
**Test:** Multiple graph operations over time

**Expected:**
- Average confidence scores tracked
- Pattern coverage calculated
- Relationship accuracy monitored
- Quality trends visible
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.12.3: Cache and Performance Monitoring
**Test:** Monitor cache performance during session

**Expected:**
- Cache hit rates calculated
- Memory usage tracked
- Query performance trends visible
- Cache effectiveness measured
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

---

## Phase 6: Autonomous Code Modification System Tests (Legacy)

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

## Phase 7: Enhanced Task Planning & Execution Engine Tests

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

## Phase 8: Integration and System-Wide Tests

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

## Phase 9: Performance and Quality Tests

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
**Test:** Simple vs complex requests and multi-step sessions

**Targets:**
- Simple questions: <30 seconds
- Complex analysis queries: <60 seconds
- Multi-step follow-up queries: <15 seconds (cached context)
- Session creation overhead: <5 seconds
- **Actual Times:** Simple: ___ Complex: ___ Follow-up: ___ Session: ___ seconds
- **Status:** [ ] Pass [ ] Fail
- **Notes:** _____________

#### Test 5.1.3: Memory Usage
**Test:** Monitor memory during typical usage and multi-step sessions

**Targets:**
- Base memory usage: <500MB
- Peak usage during processing: <2GB
- Session memory overhead: <50MB per active session
- Memory cleanup after session end: >90% released
- **Actual Usage:** Base: ___ Peak: ___ Session: ___ Cleanup: ___% MB
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

## Phase 10: Edge Cases and Error Handling

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

## Phase 11: Compatibility and Platform Tests

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
- **Total Tests:** 142 (Updated for Phase 5 Code Knowledge Graph Integration)
- **Tests Passed:** _____ / 142
- **Tests Failed:** _____ / 142
- **Tests Skipped:** _____ / 142
- **Pass Rate:** _____%

### Test Results by Phase
- **Phase 1 - Enhanced Intent Analysis:** _____ / 9 tests passed
- **Phase 2 - Multi-Step Query Processing:** _____ / 17 tests passed
- **Phase 3 - Advanced Context Management:** _____ / 27 tests passed
- **Phase 4 - Query Decomposition Engine:** _____ / 21 tests passed
- **Phase 5 - Code Knowledge Graph Integration:** _____ / 36 tests passed
- **Phase 6 - Legacy Code Modification:** _____ / 12 tests passed (Legacy)
- **Phase 7 - Performance & Quality:** _____ / 9 tests passed
- **Phase 8 - Edge Cases & Error Handling:** _____ / 9 tests passed
- **Phase 9 - Compatibility & Platform:** _____ / 5 tests passed

### Critical Issues Found
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Non-Critical Issues
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Feature Completeness Assessment
- **Enhanced Intent Analysis (Phase 1):** [ ] Complete [ ] Partial [ ] Major Issues
- **Timeout Protection & Fallback:** [ ] Complete [ ] Partial [ ] Major Issues
- **Multi-Step Query Processing (Phase 2):** [ ] Complete [ ] Partial [ ] Major Issues
- **Query Session Management:** [ ] Complete [ ] Partial [ ] Major Issues
- **Follow-Up Detection:** [ ] Complete [ ] Partial [ ] Major Issues
- **Context-Aware Processing:** [ ] Complete [ ] Partial [ ] Major Issues
- **Progressive Disclosure:** [ ] Complete [ ] Partial [ ] Major Issues
- **Query Chaining & Refinement:** [ ] Complete [ ] Partial [ ] Major Issues
- **Interactive Mode Integration:** [ ] Complete [ ] Partial [ ] Major Issues
- **Session Commands:** [ ] Complete [ ] Partial [ ] Major Issues
- **Advanced Context Management (Phase 3):** [ ] Complete [ ] Partial [ ] Major Issues
- **Semantic Code Analysis:** [ ] Complete [ ] Partial [ ] Major Issues
- **Code Relationship Mapping:** [ ] Complete [ ] Partial [ ] Major Issues
- **Domain Knowledge Integration:** [ ] Complete [ ] Partial [ ] Major Issues
- **Enhanced Context Suggestions:** [ ] Complete [ ] Partial [ ] Major Issues
- **Historical Context Tracking:** [ ] Complete [ ] Partial [ ] Major Issues
- **Query Decomposition Engine (Phase 4):** [ ] Complete [ ] Partial [ ] Major Issues
- **Multi-Intent Parsing:** [ ] Complete [ ] Partial [ ] Major Issues
- **Dependency Analysis:** [ ] Complete [ ] Partial [ ] Major Issues
- **Resource Calculation:** [ ] Complete [ ] Partial [ ] Major Issues
- **Execution Planning:** [ ] Complete [ ] Partial [ ] Major Issues
- **Conflict Detection:** [ ] Complete [ ] Partial [ ] Major Issues
- **Risk Assessment:** [ ] Complete [ ] Partial [ ] Major Issues
- **Code Knowledge Graph Integration (Phase 5):** [ ] Complete [ ] Partial [ ] Major Issues
- **Semantic Code Indexing:** [ ] Complete [ ] Partial [ ] Major Issues
- **Architectural Pattern Detection:** [ ] Complete [ ] Partial [ ] Major Issues
- **Relationship Mapping:** [ ] Complete [ ] Partial [ ] Major Issues
- **Best Practices Integration:** [ ] Complete [ ] Partial [ ] Major Issues
- **Data Flow Analysis:** [ ] Complete [ ] Partial [ ] Major Issues
- **Improvement Suggestions:** [ ] Complete [ ] Partial [ ] Major Issues
- **Graph Query Performance:** [ ] Complete [ ] Partial [ ] Major Issues

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

**Test Plan Version:** 7.0 (Enhanced Query Processing + Code Knowledge Graph Integration)
**Created:** September 19, 2025
**Last Updated:** September 20, 2025 (Phase 5 Complete)
**Covers:** Enhanced query processing with advanced context management, semantic analysis, intelligent suggestions, query decomposition engine, and comprehensive code knowledge graph integration with relationship mapping, architectural pattern detection, best practices integration, data flow analysis, and contextual improvement recommendations
**Tested By:** ________________
**Date Executed:** ________________
**Environment:** ________________
**Notes:** This test plan covers Phases 1-5 implementation including enhanced intent analysis with timeout protection, multi-step query processing with session management, advanced context management with semantic code analysis, query decomposition engine with multi-intent parsing, and comprehensive code knowledge graph integration with semantic code indexing, architectural pattern detection, relationship mapping, best practices integration, data flow analysis, and contextual improvement recommendations. Legacy autonomous code modification tests preserved for reference.