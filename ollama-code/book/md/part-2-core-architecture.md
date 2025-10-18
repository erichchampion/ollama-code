# Part II: Core Architecture

> *"First, solve the problem. Then, write the code." — John Johnson*

---

## Overview

Welcome to Part II of **Building AI Coding Assistants**. In Part I, you learned the foundational patterns: multi-provider AI integration, dependency injection, and service management. Now we'll explore the **core architectural patterns** that make AI coding assistants truly powerful.

Building an AI coding assistant isn't just about calling AI APIs. The real power comes from:

1. **Tool Orchestration** - Enabling AI to execute actions in your codebase
2. **Streaming Architecture** - Providing real-time, responsive user experiences
3. **Conversation Management** - Maintaining context across multi-turn interactions

These three pillars work together to create a sophisticated AI agent that can understand complex requests, execute multi-step workflows, and provide immediate feedback.

---

## What You'll Learn

### Chapter 4: Tool Orchestration and Execution

AI coding assistants need to **do things**, not just talk. Tool orchestration enables AI to:
- Read and write files
- Execute git commands
- Analyze code structure
- Run tests and builds
- Search codebases

You'll learn how to design a flexible tool system with:
- Clean tool interfaces
- Dependency resolution between tools
- Parallel execution for performance
- Result caching to avoid redundant work
- Interactive approval for safety

**Key Takeaways:**
- Tool interface design patterns
- Dependency graph construction and resolution
- Parallel execution strategies
- Caching architectures
- User approval workflows

### Chapter 5: Streaming Architecture and Real-Time Responses

Users expect **immediate feedback**, not waiting for complete responses. Streaming architecture provides:
- Token-by-token output as the AI generates responses
- Progress indicators for long-running operations
- Cancellation support for user control
- Backpressure handling to prevent memory issues

You'll learn how to build:
- Streaming protocols for AI responses
- Buffer management strategies
- Progress reporting systems
- Error recovery in streams
- Multi-turn streaming conversations

**Key Takeaways:**
- Streaming protocol design
- Buffer and memory management
- Progress tracking
- Cancellation and cleanup
- Error handling in streams

### Chapter 6: Conversation Management and Context

AI coding assistants have **memory** - they remember previous interactions and use that context to provide better assistance. Conversation management handles:
- Multi-turn dialogue tracking
- Context window management (token limits)
- Intent analysis to understand user goals
- Context enrichment with relevant information

You'll learn how to implement:
- Conversation state management
- Context window optimization
- Intent classification
- Context enrichment strategies
- Conversation persistence

**Key Takeaways:**
- Conversation data structures
- Token budget management
- Intent detection systems
- Context enrichment patterns
- Persistence strategies

---

## Why Core Architecture Matters

The patterns in Part II are what separate simple chatbots from powerful AI coding assistants:

### Without Proper Tool Orchestration
```
User: "Find all TODO comments and create GitHub issues"
AI: "I can't execute commands. Here's what you should do manually..."
```

### With Tool Orchestration
```
User: "Find all TODO comments and create GitHub issues"
AI: [Executing: grep for TODO comments]
    [Found 15 TODOs across 8 files]
    [Creating GitHub issues...]
    ✓ Created 15 issues with appropriate labels
```

### Without Streaming
```
User: "Explain this 5000-line codebase"
[User waits 30 seconds staring at blank screen]
[Entire response appears at once]
```

### With Streaming
```
User: "Explain this 5000-line codebase"
[Immediately]: "This codebase implements a..."
[Streaming]: "The main components are..."
[Real-time]: "Let me explain each module..."
[User can read while AI generates]
```

### Without Conversation Management
```
User: "What files are in src/?"
AI: "Here are the files..."
User: "Explain the first one"
AI: "Which file do you mean?" [Lost context]
```

### With Conversation Management
```
User: "What files are in src/?"
AI: "Here are the files: main.ts, router.ts, logger.ts..."
User: "Explain the first one"
AI: "main.ts is the entry point..." [Remembers context]
```

---

## Architecture Preview

Here's how the core components fit together:

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Coding Assistant                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Conversation Manager                     │   │
│  │  - Message history                                    │   │
│  │  - Context window management                          │   │
│  │  - Intent analysis                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Streaming Orchestrator                      │   │
│  │  - Token-by-token streaming                           │   │
│  │  - Progress reporting                                 │   │
│  │  - Backpressure handling                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Tool Orchestrator                        │   │
│  │  - Dependency resolution                              │   │
│  │  - Parallel execution                                 │   │
│  │  - Result caching                                     │   │
│  │  - Interactive approval                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Tool Registry                        │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   File   │  │   Git    │  │  Code    │          │   │
│  │  │  System  │  │  Tools   │  │ Analysis │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Real-World Example

Let's see how all three components work together for a real user request:

**User Request**: "Refactor the authentication code to use dependency injection"

### 1. Conversation Manager (Chapter 6)
```typescript
// Analyzes intent and enriches context
const intent = await conversationManager.analyzeIntent(userMessage);
// Intent: REFACTORING
// Complexity: HIGH
// Requires: CODE_ANALYSIS, FILE_MODIFICATION

const context = await conversationManager.enrichContext(intent);
// Context includes:
// - Previous conversation about authentication
// - Current project structure
// - Recent file changes
```

### 2. Streaming Orchestrator (Chapter 5)
```typescript
// Streams response as it's generated
await streamingOrchestrator.stream(context, async (event) => {
  if (event.type === 'content') {
    terminal.write(event.content); // Show tokens as they arrive
  } else if (event.type === 'tool_use') {
    terminal.showProgress(event.tool, event.status); // Show tool execution
  }
});
```

### 3. Tool Orchestrator (Chapter 4)
```typescript
// Executes tools to analyze and refactor code
const tools = [
  'read_file', // Read current auth code
  'analyze_dependencies', // Find what depends on auth
  'suggest_refactoring', // AI suggests changes
  'write_file', // Apply refactoring
  'run_tests' // Verify nothing broke
];

// Resolves dependencies and executes in optimal order
const results = await toolOrchestrator.execute(tools, {
  parallelWhenPossible: true,
  requireApproval: true // User approves before writing files
});
```

**Result**: User sees real-time progress, can approve changes before they're made, and gets a refactored codebase with passing tests.

---

## Prerequisites

Before starting Part II, you should have completed Part I and understand:

### From Part I
- ✅ Multi-provider AI integration patterns
- ✅ Dependency injection architecture
- ✅ Service lifecycle management
- ✅ Testing strategies

### Development Skills
- ✅ Async/await and Promises
- ✅ Event-driven programming
- ✅ Stream processing concepts
- ✅ Graph algorithms (for dependency resolution)

### Optional But Helpful
- 🔹 Experience with CLI tools
- 🔹 Understanding of AST parsing
- 🔹 Familiarity with Git internals
- 🔹 Background in compiler design

---

## Learning Approach

Each chapter in Part II follows this structure:

1. **Problem Statement** - Why does this pattern exist?
2. **Design Exploration** - What are the alternatives and tradeoffs?
3. **Core Implementation** - How to build it step by step
4. **Advanced Features** - Production-ready enhancements
5. **Real-World Examples** - How it's used in ollama-code
6. **Testing Strategy** - How to test these patterns
7. **Exercises** - Hands-on practice

### Code Examples

All code examples are:
- Production-ready (from ollama-code)
- Fully commented
- Progressively complex
- Runnable and testable

### Exercises

Each chapter includes:
- **Guided Exercises** - Step-by-step implementations
- **Challenge Exercises** - Open-ended problems
- **Integration Projects** - Combining multiple patterns

---

## How to Read Part II

### If You Want to Build a Basic Assistant

Focus on the core implementations:
- Chapter 4: Basic tool system (sections 4.1-4.4)
- Chapter 5: Simple streaming (sections 5.1-5.3)
- Chapter 6: Basic conversation tracking (sections 6.1-6.3)

**Estimated time**: 2-3 weeks

### If You Want Production-Ready Features

Read all sections and implement advanced features:
- Tool dependency resolution and parallel execution
- Backpressure handling and cancellation
- Context window optimization and persistence

**Estimated time**: 4-6 weeks

### If You're Building an Enterprise Tool

Study all chapters deeply, including:
- Security considerations for tool execution
- Performance optimization strategies
- Error recovery patterns
- Monitoring and observability

**Estimated time**: 8-12 weeks

---

## What's Next

Once you complete Part II, you'll have:

✅ A powerful tool orchestration system
✅ Real-time streaming architecture
✅ Sophisticated conversation management
✅ Foundation for advanced features (Part III)

You'll be ready to build features like:
- VCS intelligence (automated git workflows)
- Interactive modes (natural language command routing)
- Advanced security (sandboxing, approval workflows)

---

## Ready to Begin?

Let's start with **[Chapter 4: Tool Orchestration and Execution →](chapter-04-tool-orchestration.md)**, where we'll build a flexible system for AI to interact with codebases through tools.

---

**Part II Chapters:**

4. [Tool Orchestration and Execution →](chapter-04-tool-orchestration.md)
5. [Streaming Architecture and Real-Time Responses →](chapter-05-streaming.md)
6. [Conversation Management and Context →](chapter-06-conversation.md)

---

*Part II | Core Architecture | 3 Chapters*
