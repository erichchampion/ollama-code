# Chapter 4: Tool Orchestration and Execution

> *"Give me a lever long enough and a fulcrum on which to place it, and I shall move the world." — Archimedes*

---

## Introduction

In the previous chapters, we built a solid foundation for AI coding assistants: multi-provider integration, dependency injection, and service management. Now we face a critical question: **How do we enable AI to actually DO things?**

An AI that can only chat is like a mechanic who can diagnose problems but can't pick up a wrench. The real power of AI coding assistants comes from their ability to execute actions:

- Read and analyze files
- Make code modifications
- Execute git commands
- Run tests and builds
- Search codebases
- Create pull requests

**Tool orchestration** is the architectural pattern that enables AI agents to interact with the world through well-defined, composable tools. This chapter explores how to design, implement, and orchestrate tools that are:

- **Safe** - Tools require approval for destructive operations
- **Efficient** - Parallel execution and result caching
- **Reliable** - Robust error handling and recovery
- **Composable** - Tools can depend on other tools
- **Observable** - Full visibility into tool execution

---

## What You'll Learn

By the end of this chapter, you'll understand:

1. **Tool System Architecture** - How tools fit into the overall system
2. **Tool Interface Design** - Creating clean, composable tool contracts
3. **Tool Implementations** - File system, git, and code analysis tools
4. **Dependency Resolution** - Building and executing dependency graphs
5. **Parallel Execution** - Optimizing performance with concurrency
6. **Result Caching** - Avoiding redundant work
7. **Interactive Approval** - Safety mechanisms for destructive operations
8. **Error Handling** - Graceful degradation and recovery strategies

---

## 4.1 Tool System Overview

### The Problem

AI models excel at understanding natural language and generating text, but they can't directly interact with file systems, execute commands, or modify code. We need a bridge between AI reasoning and real-world actions.

Consider this user request:

```
User: "Find all TODO comments in the codebase and create GitHub issues for them"
```

To fulfill this request, an AI coding assistant needs to:

1. **Search** the codebase for TODO comments (`search_code` tool)
2. **Read** files containing TODOs to get context (`read_file` tool)
3. **Extract** TODO information and categorize by priority
4. **Create** GitHub issues via API (`create_github_issue` tool)
5. **Link** code locations to the created issues

Without tools, the AI can only provide instructions. With tools, the AI can execute the entire workflow autonomously.

### The Solution: Tool Orchestration

Tool orchestration provides:

1. **Tool Abstraction** - Common interface for all tools
2. **Dependency Management** - Tools can depend on other tools
3. **Execution Planning** - Optimal execution order
4. **Parallel Execution** - Run independent tools concurrently
5. **Result Caching** - Avoid redundant operations
6. **Safety Mechanisms** - Approval workflows for destructive operations
7. **Progress Tracking** - Real-time visibility into execution
8. **Error Recovery** - Graceful handling of failures

### Architecture Overview

Here's how tool orchestration fits into the overall system:

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Coding Assistant                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Conversation Manager                       │
│  - Receives user request                                     │
│  - Analyzes intent: "Find TODOs and create issues"           │
│  - Sends to AI with available tools                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI Provider                             │
│  - Reasons about the task                                    │
│  - Decides which tools to use                                │
│  - Returns tool calls: [search_code, read_file, ...]         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tool Orchestrator                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Dependency Resolution                             │   │
│  │    - Build dependency graph                          │   │
│  │    - Detect circular dependencies                    │   │
│  │    - Determine execution order                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. Execution Planning                                │   │
│  │    - Identify parallel execution opportunities       │   │
│  │    - Check result cache                              │   │
│  │    - Request approval for destructive operations     │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3. Execution                                         │   │
│  │    - Execute tools in optimal order                  │   │
│  │    - Run independent tools in parallel               │   │
│  │    - Cache results                                   │   │
│  │    - Handle errors and retries                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 4. Result Aggregation                                │   │
│  │    - Collect all tool results                        │   │
│  │    - Track metrics (duration, cache hits, etc.)      │   │
│  │    - Return to AI for next reasoning step            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tool Registry                           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  File Tools  │  │  Git Tools   │  │ Code Tools   │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ read_file    │  │ git_status   │  │ search_code  │      │
│  │ write_file   │  │ git_diff     │  │ analyze_ast  │      │
│  │ list_files   │  │ git_commit   │  │ find_refs    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

#### 1. Tool Definition

A tool is a discrete unit of functionality with:

```typescript
interface Tool {
  // Unique identifier
  name: string;

  // Human-readable description for AI
  description: string;

  // JSON Schema for parameters
  parameters: ToolParameters;

  // Tools this tool depends on
  dependencies?: string[];

  // Whether this tool requires user approval
  requiresApproval?: boolean;

  // Whether results should be cached
  cacheable?: boolean;

  // Execute the tool
  execute(params: any): Promise<ToolResult>;
}
```

#### 2. Tool Call

When an AI decides to use a tool, it returns a tool call:

```typescript
interface ToolCall {
  // Unique ID for this specific tool call
  id: string;

  // Tool to execute
  toolName: string;

  // Parameters to pass
  parameters: any;

  // Optional: Depends on results from other tool calls
  dependsOn?: string[];
}
```

#### 3. Tool Result

After execution, a tool returns a result:

```typescript
interface ToolResult {
  // ID of the tool call
  callId: string;

  // Success or failure
  success: boolean;

  // Result data (if successful)
  data?: any;

  // Error information (if failed)
  error?: {
    message: string;
    code?: string;
    recoverable: boolean;
  };

  // Execution metadata
  metadata: {
    durationMs: number;
    cached: boolean;
    retriesAttempted?: number;
  };
}
```

### Example: End-to-End Flow

Let's trace a complete tool execution flow:

```typescript
// User request
"Find all TODOs in src/ and create GitHub issues"

// 1. AI Provider returns tool calls
const toolCalls: ToolCall[] = [
  {
    id: 'call_1',
    toolName: 'search_code',
    parameters: {
      pattern: 'TODO:',
      path: 'src/',
      includeContext: true
    }
  },
  {
    id: 'call_2',
    toolName: 'read_file',
    parameters: {
      path: '${call_1.results[0].file}' // Depends on search results
    },
    dependsOn: ['call_1']
  },
  {
    id: 'call_3',
    toolName: 'create_github_issue',
    parameters: {
      title: 'TODO: ${call_2.todoContent}',
      body: '${call_2.context}',
      labels: ['technical-debt']
    },
    dependsOn: ['call_2'],
    requiresApproval: true // User must approve issue creation
  }
];

// 2. Tool Orchestrator processes calls
const orchestrator = new ToolOrchestrator(toolRegistry);
const results = await orchestrator.execute(toolCalls, {
  parallelExecution: true,
  enableCache: true,
  approvalCallback: async (call) => {
    // Show user what will be done
    console.log(`Create GitHub issue: ${call.parameters.title}?`);
    return await promptUser('Approve? (y/n)');
  }
});

// 3. Results returned to AI
// AI can now respond to user with summary:
// "✓ Found 15 TODOs
//  ✓ Created 15 GitHub issues
//  📊 Issues: #101-#115"
```

---

## 4.2 Tool Interface Design

### Core Tool Interface

The foundation of tool orchestration is a clean, consistent interface. Here's the complete tool contract:

```typescript
/**
 * Tool parameter definition using JSON Schema
 */
export interface ToolParameters {
  type: 'object';
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
    required?: boolean;
  }>;
  required?: string[];
}

/**
 * Tool execution context
 * Provides tools with access to system services
 */
export interface ToolContext {
  // Working directory
  workingDirectory: string;

  // Logger for tool output
  logger: Logger;

  // Access to other tools (for composition)
  toolRegistry: ToolRegistry;

  // User preferences
  preferences: UserPreferences;

  // Cancellation token
  cancellationToken?: CancellationToken;
}

/**
 * Base tool interface
 * All tools must implement this
 */
export interface Tool {
  /**
   * Unique tool identifier
   * Example: 'read_file', 'git_commit', 'search_code'
   */
  readonly name: string;

  /**
   * Description for AI model
   * Should explain what the tool does and when to use it
   */
  readonly description: string;

  /**
   * Parameter schema (JSON Schema format)
   * Used for validation and AI parameter generation
   */
  readonly parameters: ToolParameters;

  /**
   * Tools this tool depends on
   * Example: 'write_file' might depend on 'read_file'
   */
  readonly dependencies?: string[];

  /**
   * Whether this tool requires user approval
   * True for destructive operations (write, delete, commit, etc.)
   */
  readonly requiresApproval?: boolean;

  /**
   * Whether results should be cached
   * True for read-only, deterministic operations
   */
  readonly cacheable?: boolean;

  /**
   * Maximum execution time in milliseconds
   * Tool will be cancelled if it exceeds this
   */
  readonly timeoutMs?: number;

  /**
   * Whether this tool can be retried on failure
   */
  readonly retryable?: boolean;

  /**
   * Execute the tool
   *
   * @param params - Validated parameters
   * @param context - Execution context
   * @returns Tool result
   */
  execute(params: any, context: ToolContext): Promise<ToolResult>;

  /**
   * Validate parameters before execution
   * Optional: If not provided, uses JSON Schema validation
   *
   * @param params - Parameters to validate
   * @returns Validation result
   */
  validate?(params: any): ValidationResult;

  /**
   * Estimate cost/complexity of execution
   * Used for routing and optimization decisions
   *
   * @param params - Tool parameters
   * @returns Estimated cost (arbitrary units)
   */
  estimateCost?(params: any): number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  // ID of the tool call that produced this result
  callId: string;

  // Tool name
  toolName: string;

  // Success/failure status
  success: boolean;

  // Result data (if successful)
  data?: any;

  // Error information (if failed)
  error?: ToolError;

  // Execution metadata
  metadata: ToolMetadata;
}

/**
 * Tool error information
 */
export interface ToolError {
  // Human-readable error message
  message: string;

  // Error code for programmatic handling
  code?: string;

  // Whether the error is recoverable via retry
  recoverable: boolean;

  // Suggested fix or workaround
  suggestion?: string;

  // Stack trace (in development mode)
  stack?: string;
}

/**
 * Tool execution metadata
 */
export interface ToolMetadata {
  // Execution duration in milliseconds
  durationMs: number;

  // Whether result was served from cache
  cached: boolean;

  // Number of retry attempts
  retriesAttempted?: number;

  // Timestamp of execution
  timestamp: Date;

  // Whether user approval was required and granted
  approvalGranted?: boolean;

  // Additional tool-specific metadata
  [key: string]: any;
}
```

### Design Principles

#### 1. Declarative Over Imperative

Tools should declare their capabilities and requirements, not implement orchestration logic:

**✅ Good:**
```typescript
export class WriteFileTool implements Tool {
  name = 'write_file';
  description = 'Write content to a file';
  requiresApproval = true; // Declarative
  cacheable = false; // Declarative
  dependencies = ['read_file']; // Declarative

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    // Just do the work, orchestrator handles approval/caching/dependencies
    await fs.writeFile(params.path, params.content);
    return { success: true, data: { bytesWritten: params.content.length } };
  }
}
```

**❌ Bad:**
```typescript
export class WriteFileTool implements Tool {
  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    // Imperative - tool shouldn't handle this
    const approved = await this.requestApproval(params);
    if (!approved) {
      throw new Error('Approval denied');
    }

    // Imperative - orchestrator should handle caching
    const cached = await this.checkCache(params);
    if (cached) return cached;

    await fs.writeFile(params.path, params.content);
  }
}
```

#### 2. Single Responsibility

Each tool should do ONE thing well:

**✅ Good:**
```typescript
// Separate tools for separate concerns
class ReadFileTool implements Tool {
  name = 'read_file';
  async execute(params) {
    return await fs.readFile(params.path, 'utf-8');
  }
}

class WriteFileTool implements Tool {
  name = 'write_file';
  async execute(params) {
    await fs.writeFile(params.path, params.content);
  }
}

class EditFileTool implements Tool {
  name = 'edit_file';
  async execute(params) {
    // Uses read_file and write_file internally
  }
}
```

**❌ Bad:**
```typescript
// One tool doing too much
class FileOperationTool implements Tool {
  name = 'file_operation';
  async execute(params) {
    if (params.operation === 'read') {
      // Read logic
    } else if (params.operation === 'write') {
      // Write logic
    } else if (params.operation === 'delete') {
      // Delete logic
    }
    // Hard to cache, approve, compose
  }
}
```

#### 3. Composability

Tools should be composable - complex tools can use simpler tools:

```typescript
export class RefactorTool implements Tool {
  name = 'refactor_code';
  description = 'Refactor code using AST transformations';
  dependencies = ['read_file', 'analyze_ast', 'write_file'];

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    // 1. Read current file
    const content = await context.toolRegistry
      .get('read_file')
      .execute({ path: params.path }, context);

    // 2. Analyze AST
    const ast = await context.toolRegistry
      .get('analyze_ast')
      .execute({ code: content.data }, context);

    // 3. Transform AST
    const transformed = this.transformAST(ast.data, params.transformation);

    // 4. Write back
    return await context.toolRegistry
      .get('write_file')
      .execute({ path: params.path, content: transformed }, context);
  }
}
```

#### 4. Rich Error Information

Tools should provide actionable error information:

```typescript
export class GitCommitTool implements Tool {
  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    try {
      await git.commit(params.message);
      return { success: true, data: { commitHash: '...' } };
    } catch (error) {
      // Detect specific error conditions
      if (error.message.includes('nothing to commit')) {
        return {
          success: false,
          error: {
            message: 'No changes to commit',
            code: 'NOTHING_TO_COMMIT',
            recoverable: false,
            suggestion: 'Make changes to files before committing, or check git status'
          }
        };
      } else if (error.message.includes('Please tell me who you are')) {
        return {
          success: false,
          error: {
            message: 'Git user not configured',
            code: 'GIT_USER_NOT_CONFIGURED',
            recoverable: true,
            suggestion: 'Run: git config --global user.name "Your Name" && git config --global user.email "your@email.com"'
          }
        };
      }

      // Unknown error
      return {
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN_ERROR',
          recoverable: true,
          stack: error.stack
        }
      };
    }
  }
}
```

### Tool Categories

Tools typically fall into these categories:

#### 1. Read-Only Tools
- Safe, cacheable, no approval needed
- Examples: `read_file`, `list_files`, `git_status`, `search_code`

```typescript
export abstract class ReadOnlyTool implements Tool {
  readonly requiresApproval = false;
  readonly cacheable = true;
  readonly retryable = true;
}
```

#### 2. Mutation Tools
- Require approval, not cacheable
- Examples: `write_file`, `delete_file`, `git_commit`, `create_pr`

```typescript
export abstract class MutationTool implements Tool {
  readonly requiresApproval = true;
  readonly cacheable = false;
  readonly retryable = false; // Don't retry writes
}
```

#### 3. Analysis Tools
- Computationally expensive, cacheable
- Examples: `analyze_ast`, `find_references`, `calculate_metrics`

```typescript
export abstract class AnalysisTool implements Tool {
  readonly requiresApproval = false;
  readonly cacheable = true;
  readonly retryable = true;
  readonly timeoutMs = 30000; // 30 second timeout
}
```

#### 4. External Tools
- Call external APIs, may require approval
- Examples: `create_github_issue`, `deploy_to_production`, `send_notification`

```typescript
export abstract class ExternalTool implements Tool {
  readonly requiresApproval = true; // Depends on operation
  readonly cacheable = false; // External state changes
  readonly retryable = true; // Can retry failed API calls
}
```

---

## 4.3 Tool Implementations

Now let's implement concrete tools across different categories. We'll build file system tools, git tools, and code analysis tools.

### File System Tools

#### Read File Tool

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

export class ReadFileTool implements Tool {
  readonly name = 'read_file';
  readonly description = 'Read the contents of a file';
  readonly requiresApproval = false;
  readonly cacheable = true;
  readonly retryable = true;

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to read (relative to working directory)'
      },
      encoding: {
        type: 'string',
        description: 'File encoding (default: utf-8)',
        enum: ['utf-8', 'ascii', 'base64']
      }
    },
    required: ['path']
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const encoding = params.encoding || 'utf-8';
    const filePath = path.resolve(context.workingDirectory, params.path);

    try {
      // Security: Ensure file is within working directory
      if (!filePath.startsWith(context.workingDirectory)) {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: `Access denied: ${params.path} is outside working directory`,
            code: 'ACCESS_DENIED',
            recoverable: false,
            suggestion: 'Provide a path relative to the working directory'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      }

      // Read file
      const content = await fs.readFile(filePath, encoding);
      const stats = await fs.stat(filePath);

      context.logger.debug(`Read file: ${params.path} (${stats.size} bytes)`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: {
          content,
          size: stats.size,
          lastModified: stats.mtime,
          encoding
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      // Handle specific errors
      if (error.code === 'ENOENT') {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: `File not found: ${params.path}`,
            code: 'FILE_NOT_FOUND',
            recoverable: false,
            suggestion: 'Check the file path and try again'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      } else if (error.code === 'EACCES') {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: `Permission denied: ${params.path}`,
            code: 'PERMISSION_DENIED',
            recoverable: false,
            suggestion: 'Check file permissions'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      }

      // Unknown error
      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: 'UNKNOWN_ERROR',
          recoverable: true,
          stack: error.stack
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  estimateCost(params: any): number {
    // Cost proportional to file size (if known)
    // For read operations, cost is low
    return 1;
  }
}
```

#### Write File Tool

```typescript
export class WriteFileTool implements Tool {
  readonly name = 'write_file';
  readonly description = 'Write content to a file (creates or overwrites)';
  readonly requiresApproval = true; // Destructive operation
  readonly cacheable = false;
  readonly retryable = false; // Don't retry writes
  readonly dependencies = ['read_file']; // May need to read before overwriting

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to write (relative to working directory)'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      },
      encoding: {
        type: 'string',
        description: 'File encoding (default: utf-8)',
        enum: ['utf-8', 'ascii', 'base64']
      },
      createDirectories: {
        type: 'boolean',
        description: 'Create parent directories if they don\'t exist (default: true)'
      }
    },
    required: ['path', 'content']
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const encoding = params.encoding || 'utf-8';
    const createDirs = params.createDirectories !== false;
    const filePath = path.resolve(context.workingDirectory, params.path);

    try {
      // Security: Ensure file is within working directory
      if (!filePath.startsWith(context.workingDirectory)) {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: `Access denied: ${params.path} is outside working directory`,
            code: 'ACCESS_DENIED',
            recoverable: false
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      }

      // Create parent directories if needed
      if (createDirs) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      // Write file
      await fs.writeFile(filePath, params.content, encoding);
      const stats = await fs.stat(filePath);

      context.logger.info(`Wrote file: ${params.path} (${stats.size} bytes)`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: {
          path: params.path,
          size: stats.size,
          encoding
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date(),
          approvalGranted: true
        }
      };
    } catch (error: any) {
      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          recoverable: false // Don't retry writes
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  estimateCost(params: any): number {
    // Cost proportional to content size
    return Math.ceil(params.content.length / 1000);
  }
}
```

#### List Files Tool

```typescript
export class ListFilesTool implements Tool {
  readonly name = 'list_files';
  readonly description = 'List files in a directory';
  readonly requiresApproval = false;
  readonly cacheable = true;
  readonly retryable = true;

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Directory path (default: current directory)'
      },
      recursive: {
        type: 'boolean',
        description: 'List files recursively (default: false)'
      },
      pattern: {
        type: 'string',
        description: 'Glob pattern to filter files (e.g., "*.ts")'
      },
      includeHidden: {
        type: 'boolean',
        description: 'Include hidden files (default: false)'
      }
    }
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const dirPath = path.resolve(
      context.workingDirectory,
      params.path || '.'
    );

    try {
      const files = await this.listFiles(
        dirPath,
        params.recursive || false,
        params.pattern,
        params.includeHidden || false
      );

      context.logger.debug(`Listed ${files.length} files in ${params.path || '.'}`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: {
          files,
          count: files.length
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          recoverable: true
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  private async listFiles(
    dir: string,
    recursive: boolean,
    pattern?: string,
    includeHidden?: boolean
  ): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      // Skip hidden files if not included
      if (!includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          const subFiles = await this.listFiles(
            fullPath,
            recursive,
            pattern,
            includeHidden
          );
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        // Apply pattern filter if specified
        if (!pattern || this.matchesPattern(entry.name, pattern)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    // Simple glob matching (in production, use a library like minimatch)
    const regex = new RegExp(
      pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
    );
    return regex.test(filename);
  }

  estimateCost(params: any): number {
    // Recursive listing is more expensive
    return params.recursive ? 5 : 1;
  }
}
```

### Git Tools

#### Git Status Tool

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitStatusTool implements Tool {
  readonly name = 'git_status';
  readonly description = 'Get git repository status';
  readonly requiresApproval = false;
  readonly cacheable = true; // Can cache for a few seconds
  readonly retryable = true;

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)'
      },
      includeUntracked: {
        type: 'boolean',
        description: 'Include untracked files (default: true)'
      }
    }
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const repoPath = path.resolve(
      context.workingDirectory,
      params.path || '.'
    );

    try {
      // Get git status in porcelain format (machine-readable)
      const { stdout } = await execAsync('git status --porcelain', {
        cwd: repoPath
      });

      // Parse status
      const status = this.parseGitStatus(stdout, params.includeUntracked !== false);

      context.logger.debug(`Git status: ${status.modified.length} modified, ${status.staged.length} staged`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: status,
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      // Check if this is a git repository
      if (error.message.includes('not a git repository')) {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: `Not a git repository: ${params.path || '.'}`,
            code: 'NOT_A_GIT_REPO',
            recoverable: false,
            suggestion: 'Run git init to initialize a repository'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      }

      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: 'GIT_ERROR',
          recoverable: true
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  private parseGitStatus(output: string, includeUntracked: boolean) {
    const lines = output.split('\n').filter(line => line.trim());

    const status = {
      staged: [] as string[],
      modified: [] as string[],
      untracked: [] as string[],
      deleted: [] as string[],
      clean: lines.length === 0
    };

    for (const line of lines) {
      const statusCode = line.substring(0, 2);
      const file = line.substring(3);

      // First character is staged status
      if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
        status.staged.push(file);
      }

      // Second character is working tree status
      if (statusCode[1] === 'M') {
        status.modified.push(file);
      } else if (statusCode[1] === 'D') {
        status.deleted.push(file);
      } else if (statusCode === '??') {
        if (includeUntracked) {
          status.untracked.push(file);
        }
      }
    }

    return status;
  }
}
```

#### Git Commit Tool

```typescript
export class GitCommitTool implements Tool {
  readonly name = 'git_commit';
  readonly description = 'Create a git commit';
  readonly requiresApproval = true; // Commits require approval
  readonly cacheable = false;
  readonly retryable = false;
  readonly dependencies = ['git_status']; // Should check status first

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'Commit message'
      },
      files: {
        type: 'array',
        description: 'Files to stage (default: all modified files)'
      },
      path: {
        type: 'string',
        description: 'Repository path (default: current directory)'
      }
    },
    required: ['message']
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const repoPath = path.resolve(
      context.workingDirectory,
      params.path || '.'
    );

    try {
      // Stage files
      if (params.files && params.files.length > 0) {
        // Stage specific files
        const files = params.files.join(' ');
        await execAsync(`git add ${files}`, { cwd: repoPath });
      } else {
        // Stage all modified files
        await execAsync('git add -u', { cwd: repoPath });
      }

      // Create commit
      const { stdout } = await execAsync(
        `git commit -m "${params.message.replace(/"/g, '\\"')}"`,
        { cwd: repoPath }
      );

      // Extract commit hash
      const match = stdout.match(/\[.+?\s+([a-f0-9]+)\]/);
      const commitHash = match ? match[1] : 'unknown';

      context.logger.info(`Created commit: ${commitHash}`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: {
          commitHash,
          message: params.message,
          output: stdout
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date(),
          approvalGranted: true
        }
      };
    } catch (error: any) {
      // Parse common git commit errors
      if (error.message.includes('nothing to commit')) {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: 'Nothing to commit (working tree clean)',
            code: 'NOTHING_TO_COMMIT',
            recoverable: false,
            suggestion: 'Make changes to files before committing'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      } else if (error.message.includes('Please tell me who you are')) {
        return {
          callId: params.callId,
          toolName: this.name,
          success: false,
          error: {
            message: 'Git user not configured',
            code: 'GIT_USER_NOT_CONFIGURED',
            recoverable: true,
            suggestion: 'Configure git user: git config user.name "Name" && git config user.email "email@example.com"'
          },
          metadata: {
            durationMs: Date.now() - startTime,
            cached: false,
            timestamp: new Date()
          }
        };
      }

      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: 'GIT_ERROR',
          recoverable: true
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }
}
```

### Code Analysis Tools

#### Search Code Tool

```typescript
export class SearchCodeTool implements Tool {
  readonly name = 'search_code';
  readonly description = 'Search for code patterns using regex';
  readonly requiresApproval = false;
  readonly cacheable = true;
  readonly retryable = true;
  readonly timeoutMs = 30000; // 30 second timeout

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Regex pattern to search for'
      },
      path: {
        type: 'string',
        description: 'Path to search in (default: current directory)'
      },
      filePattern: {
        type: 'string',
        description: 'File pattern to search (e.g., "*.ts")'
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Case sensitive search (default: false)'
      },
      includeContext: {
        type: 'boolean',
        description: 'Include surrounding lines (default: false)'
      },
      contextLines: {
        type: 'number',
        description: 'Number of context lines before/after match (default: 2)'
      }
    },
    required: ['pattern']
  };

  async execute(params: any, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    const searchPath = path.resolve(
      context.workingDirectory,
      params.path || '.'
    );

    try {
      // Build grep command (using ripgrep if available, fallback to grep)
      const useRg = await this.hasRipgrep();
      const results = useRg
        ? await this.searchWithRipgrep(searchPath, params)
        : await this.searchWithGrep(searchPath, params);

      context.logger.debug(`Found ${results.length} matches for pattern: ${params.pattern}`);

      return {
        callId: params.callId,
        toolName: this.name,
        success: true,
        data: {
          matches: results,
          count: results.length
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      return {
        callId: params.callId,
        toolName: this.name,
        success: false,
        error: {
          message: error.message,
          code: 'SEARCH_ERROR',
          recoverable: true
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  private async hasRipgrep(): Promise<boolean> {
    try {
      await execAsync('which rg');
      return true;
    } catch {
      return false;
    }
  }

  private async searchWithRipgrep(
    searchPath: string,
    params: any
  ): Promise<Array<{ file: string; line: number; content: string; context?: string[] }>> {
    // Build ripgrep command
    let cmd = 'rg --json';

    if (!params.caseSensitive) cmd += ' -i';
    if (params.filePattern) cmd += ` -g "${params.filePattern}"`;
    if (params.includeContext) cmd += ` -C ${params.contextLines || 2}`;

    cmd += ` "${params.pattern}" "${searchPath}"`;

    const { stdout } = await execAsync(cmd);

    // Parse ripgrep JSON output
    const results = [];
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;

      try {
        const match = JSON.parse(line);
        if (match.type === 'match') {
          results.push({
            file: match.data.path.text,
            line: match.data.line_number,
            content: match.data.lines.text,
            context: match.data.context?.lines?.map((l: any) => l.text)
          });
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    return results;
  }

  private async searchWithGrep(
    searchPath: string,
    params: any
  ): Promise<Array<{ file: string; line: number; content: string }>> {
    // Fallback to standard grep
    let cmd = 'grep -rn';

    if (!params.caseSensitive) cmd += ' -i';
    if (params.filePattern) cmd += ` --include="${params.filePattern}"`;

    cmd += ` "${params.pattern}" "${searchPath}"`;

    const { stdout } = await execAsync(cmd);

    // Parse grep output: file:line:content
    const results = [];
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;

      const match = line.match(/^(.+?):(\d+):(.+)$/);
      if (match) {
        results.push({
          file: match[1],
          line: parseInt(match[2], 10),
          content: match[3]
        });
      }
    }

    return results;
  }

  estimateCost(params: any): number {
    // Recursive search is expensive
    return 10;
  }
}
```

---

## 4.4 Tool Registry

The tool registry is the central catalog of all available tools. It provides:
- Tool registration and discovery
- Validation that all dependencies exist
- Tool lookup by name
- Metadata about available tools for AI context

### Tool Registry Implementation

```typescript
/**
 * Central registry of all available tools
 */
export class ToolRegistry {
  private tools = new Map<string, Tool>();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a tool
   */
  register(tool: Tool): void {
    // Validate tool
    if (!tool.name) {
      throw new Error('Tool must have a name');
    }

    if (!tool.description) {
      throw new Error(`Tool ${tool.name} must have a description`);
    }

    if (!tool.parameters) {
      throw new Error(`Tool ${tool.name} must define parameters`);
    }

    // Check for name conflicts
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} is already registered`);
    }

    // Validate dependencies exist (will check later after all tools registered)
    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered tool: ${tool.name}`);
  }

  /**
   * Register multiple tools
   */
  registerAll(tools: Tool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }

    // Validate all dependencies exist
    this.validateDependencies();
  }

  /**
   * Get a tool by name
   */
  get(name: string): Tool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool;
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool metadata for AI context
   * Returns tool definitions in the format AI models expect
   */
  getToolsForAI(): Array<{
    name: string;
    description: string;
    parameters: ToolParameters;
  }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }

  /**
   * Validate that all tool dependencies exist
   */
  private validateDependencies(): void {
    for (const [name, tool] of this.tools) {
      if (!tool.dependencies) continue;

      for (const dep of tool.dependencies) {
        if (!this.tools.has(dep)) {
          throw new Error(
            `Tool ${name} depends on ${dep}, but ${dep} is not registered`
          );
        }
      }
    }
  }

  /**
   * Get dependency graph for a tool
   * Returns all tools this tool depends on (recursively)
   */
  getDependencies(toolName: string): string[] {
    const tool = this.get(toolName);
    if (!tool.dependencies || tool.dependencies.length === 0) {
      return [];
    }

    const allDeps = new Set<string>();
    const visited = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const t = this.get(name);
      if (!t.dependencies) return;

      for (const dep of t.dependencies) {
        allDeps.add(dep);
        visit(dep);
      }
    };

    visit(toolName);
    return Array.from(allDeps);
  }

  /**
   * Get statistics about registered tools
   */
  getStats(): {
    totalTools: number;
    byCategory: Record<string, number>;
    requireApproval: number;
    cacheable: number;
  } {
    const stats = {
      totalTools: this.tools.size,
      byCategory: {} as Record<string, number>,
      requireApproval: 0,
      cacheable: 0
    };

    for (const tool of this.tools.values()) {
      // Count approval requirements
      if (tool.requiresApproval) {
        stats.requireApproval++;
      }

      // Count cacheable tools
      if (tool.cacheable) {
        stats.cacheable++;
      }

      // Categorize by type (inferred from name)
      const category = this.inferCategory(tool.name);
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }

    return stats;
  }

  private inferCategory(toolName: string): string {
    if (toolName.startsWith('git_')) return 'Git';
    if (toolName.includes('file')) return 'File System';
    if (toolName.includes('search') || toolName.includes('analyze')) return 'Code Analysis';
    if (toolName.includes('github') || toolName.includes('api')) return 'External';
    return 'Other';
  }
}
```

### Bootstrap Tool Registry

```typescript
/**
 * Bootstrap the tool registry with all available tools
 */
export function createToolRegistry(logger: Logger): ToolRegistry {
  const registry = new ToolRegistry(logger);

  // Register file system tools
  registry.register(new ReadFileTool());
  registry.register(new WriteFileTool());
  registry.register(new ListFilesTool());

  // Register git tools
  registry.register(new GitStatusTool());
  registry.register(new GitCommitTool());

  // Register code analysis tools
  registry.register(new SearchCodeTool());

  // Log statistics
  const stats = registry.getStats();
  logger.info(`Tool registry initialized: ${stats.totalTools} tools registered`);
  logger.debug(`Categories: ${JSON.stringify(stats.byCategory)}`);
  logger.debug(`Require approval: ${stats.requireApproval}, Cacheable: ${stats.cacheable}`);

  return registry;
}
```

### Usage Example

```typescript
// Bootstrap registry
const logger = new Logger();
const registry = createToolRegistry(logger);

// Get tool metadata for AI
const tools = registry.getToolsForAI();
const aiResponse = await provider.chat({
  messages: [{ role: 'user', content: 'List all files in src/' }],
  tools // AI can now see all available tools
});

// AI returns: Use tool "list_files" with params { path: "src/" }

// Execute the tool
const tool = registry.get('list_files');
const result = await tool.execute(
  { path: 'src/' },
  { workingDirectory: '/project', logger, toolRegistry: registry }
);

console.log(result.data.files);
```

---

## 4.5 Dependency Resolution

Tools can depend on other tools. For example, `edit_file` might depend on `read_file` and `write_file`. The dependency resolver builds an execution graph and determines the optimal execution order.

### Dependency Graph

```typescript
/**
 * Represents a directed acyclic graph (DAG) of tool dependencies
 */
export class DependencyGraph {
  private nodes = new Map<string, DependencyNode>();

  /**
   * Add a node to the graph
   */
  addNode(callId: string, toolName: string, dependencies: string[] = []): void {
    const node: DependencyNode = {
      callId,
      toolName,
      dependencies,
      dependents: []
    };

    this.nodes.set(callId, node);

    // Update dependents
    for (const depId of dependencies) {
      const depNode = this.nodes.get(depId);
      if (depNode) {
        depNode.dependents.push(callId);
      }
    }
  }

  /**
   * Get a node by call ID
   */
  getNode(callId: string): DependencyNode | undefined {
    return this.nodes.get(callId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): DependencyNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Detect circular dependencies
   * Returns the cycle path if found, null otherwise
   */
  detectCycle(): string[] | null {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const hasCycle = (callId: string): boolean => {
      visited.add(callId);
      recursionStack.add(callId);
      path.push(callId);

      const node = this.nodes.get(callId);
      if (!node) return false;

      for (const dep of node.dependencies) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          // Found cycle
          path.push(dep);
          return true;
        }
      }

      recursionStack.delete(callId);
      path.pop();
      return false;
    };

    for (const callId of this.nodes.keys()) {
      if (!visited.has(callId)) {
        if (hasCycle(callId)) {
          return path;
        }
      }
    }

    return null;
  }

  /**
   * Topological sort - returns execution order
   * Throws error if cycle detected
   */
  topologicalSort(): string[] {
    // Detect cycles first
    const cycle = this.detectCycle();
    if (cycle) {
      throw new Error(
        `Circular dependency detected: ${cycle.join(' -> ')}`
      );
    }

    const sorted: string[] = [];
    const visited = new Set<string>();

    const visit = (callId: string) => {
      if (visited.has(callId)) return;
      visited.add(callId);

      const node = this.nodes.get(callId);
      if (!node) return;

      // Visit dependencies first (depth-first)
      for (const dep of node.dependencies) {
        visit(dep);
      }

      sorted.push(callId);
    };

    // Visit all nodes
    for (const callId of this.nodes.keys()) {
      visit(callId);
    }

    return sorted;
  }

  /**
   * Get execution levels for parallel execution
   * Returns groups of calls that can execute in parallel
   */
  getExecutionLevels(): string[][] {
    const sorted = this.topologicalSort();
    const levels: string[][] = [];
    const nodeLevel = new Map<string, number>();

    // Calculate level for each node
    for (const callId of sorted) {
      const node = this.nodes.get(callId)!;

      // Node's level is max(dependency levels) + 1
      let level = 0;
      for (const dep of node.dependencies) {
        const depLevel = nodeLevel.get(dep) || 0;
        level = Math.max(level, depLevel + 1);
      }

      nodeLevel.set(callId, level);

      // Add to level group
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(callId);
    }

    return levels;
  }

  /**
   * Get calls that have no dependencies (can execute immediately)
   */
  getRootNodes(): string[] {
    return this.getAllNodes()
      .filter(node => node.dependencies.length === 0)
      .map(node => node.callId);
  }

  /**
   * Get calls that depend on a specific call
   */
  getDependents(callId: string): string[] {
    const node = this.nodes.get(callId);
    return node ? node.dependents : [];
  }
}

interface DependencyNode {
  callId: string;
  toolName: string;
  dependencies: string[];
  dependents: string[];
}
```

### Dependency Resolver

```typescript
/**
 * Resolves tool call dependencies and plans execution
 */
export class DependencyResolver {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Build dependency graph from tool calls
   */
  buildGraph(toolCalls: ToolCall[], registry: ToolRegistry): DependencyGraph {
    const graph = new DependencyGraph();

    for (const call of toolCalls) {
      // Get tool definition
      const tool = registry.get(call.toolName);

      // Collect dependencies
      const dependencies = call.dependsOn || [];

      // Add tool's declared dependencies (if any)
      if (tool.dependencies) {
        // Find calls that provide these dependencies
        for (const depToolName of tool.dependencies) {
          const depCall = toolCalls.find(c => c.toolName === depToolName);
          if (depCall && !dependencies.includes(depCall.id)) {
            dependencies.push(depCall.id);
          }
        }
      }

      graph.addNode(call.id, call.toolName, dependencies);
    }

    // Validate no cycles
    const cycle = graph.detectCycle();
    if (cycle) {
      this.logger.error(`Circular dependency: ${cycle.join(' -> ')}`);
      throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`);
    }

    return graph;
  }

  /**
   * Plan execution order
   */
  planExecution(graph: DependencyGraph): ExecutionPlan {
    const sequential = graph.topologicalSort();
    const parallel = graph.getExecutionLevels();

    this.logger.debug(`Execution plan:`);
    this.logger.debug(`  Sequential: ${sequential.length} calls`);
    this.logger.debug(`  Parallel: ${parallel.length} levels`);

    return {
      sequential,
      parallel,
      totalCalls: sequential.length,
      maxParallelism: Math.max(...parallel.map(level => level.length))
    };
  }
}

interface ExecutionPlan {
  // Sequential execution order (dependencies first)
  sequential: string[];

  // Parallel execution levels (can run concurrently within each level)
  parallel: string[][];

  // Total number of calls
  totalCalls: number;

  // Maximum parallelism (largest level size)
  maxParallelism: number;
}
```

### Example: Dependency Resolution

```typescript
const toolCalls: ToolCall[] = [
  {
    id: 'call_1',
    toolName: 'list_files',
    parameters: { path: 'src/' }
  },
  {
    id: 'call_2',
    toolName: 'read_file',
    parameters: { path: 'src/index.ts' },
    dependsOn: ['call_1'] // Depends on listing files first
  },
  {
    id: 'call_3',
    toolName: 'read_file',
    parameters: { path: 'src/utils.ts' },
    dependsOn: ['call_1']
  },
  {
    id: 'call_4',
    toolName: 'search_code',
    parameters: { pattern: 'TODO', path: 'src/' }
    // No dependencies - can run in parallel with call_1
  },
  {
    id: 'call_5',
    toolName: 'write_file',
    parameters: { path: 'summary.md', content: '...' },
    dependsOn: ['call_2', 'call_3', 'call_4'] // Depends on all analysis
  }
];

const resolver = new DependencyResolver(logger);
const graph = resolver.buildGraph(toolCalls, registry);
const plan = resolver.planExecution(graph);

console.log('Sequential:', plan.sequential);
// ['call_1', 'call_4', 'call_2', 'call_3', 'call_5']

console.log('Parallel levels:', plan.parallel);
// [
//   ['call_1', 'call_4'],     // Level 0: Can run in parallel
//   ['call_2', 'call_3'],     // Level 1: Wait for call_1
//   ['call_5']                // Level 2: Wait for call_2, call_3, call_4
// ]

console.log('Max parallelism:', plan.maxParallelism);
// 2 (level 0 and level 1 both have 2 calls)
```

---

## 4.6 Parallel Execution

Now that we can resolve dependencies, let's implement parallel execution to maximize performance.

### Parallel Executor

```typescript
/**
 * Executes tool calls in parallel when possible
 */
export class ParallelExecutor {
  private logger: Logger;
  private maxConcurrency: number;

  constructor(logger: Logger, maxConcurrency: number = 5) {
    this.logger = logger;
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Execute tool calls according to execution plan
   */
  async execute(
    toolCalls: ToolCall[],
    plan: ExecutionPlan,
    executor: (call: ToolCall) => Promise<ToolResult>,
    options: ExecutionOptions = {}
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();
    const startTime = Date.now();

    if (options.parallelExecution && plan.parallel.length > 0) {
      // Execute level by level
      for (let i = 0; i < plan.parallel.length; i++) {
        const level = plan.parallel[i];
        this.logger.debug(`Executing level ${i}: ${level.length} calls`);

        // Execute all calls in this level in parallel
        const levelResults = await this.executeLevel(
          level,
          toolCalls,
          executor,
          results,
          options
        );

        // Merge results
        for (const [callId, result] of levelResults) {
          results.set(callId, result);
        }

        // Check for errors
        const errors = Array.from(levelResults.values()).filter(r => !r.success);
        if (errors.length > 0 && options.failFast) {
          this.logger.error(`Level ${i} failed with ${errors.length} errors, stopping`);
          throw new Error(`Execution failed at level ${i}`);
        }
      }
    } else {
      // Sequential execution
      this.logger.debug(`Executing sequentially: ${plan.sequential.length} calls`);

      for (const callId of plan.sequential) {
        const call = toolCalls.find(c => c.id === callId);
        if (!call) continue;

        try {
          const result = await executor(call);
          results.set(callId, result);

          if (!result.success && options.failFast) {
            throw new Error(`Call ${callId} failed: ${result.error?.message}`);
          }
        } catch (error: any) {
          this.logger.error(`Call ${callId} threw error: ${error.message}`);
          if (options.failFast) throw error;
        }
      }
    }

    const totalTime = Date.now() - startTime;
    this.logger.info(`Executed ${results.size} calls in ${totalTime}ms`);

    return results;
  }

  /**
   * Execute a single level (all calls in parallel)
   */
  private async executeLevel(
    level: string[],
    allCalls: ToolCall[],
    executor: (call: ToolCall) => Promise<ToolResult>,
    previousResults: Map<string, ToolResult>,
    options: ExecutionOptions
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();

    // Limit concurrency
    const batches = this.createBatches(level, this.maxConcurrency);

    for (const batch of batches) {
      // Execute batch in parallel
      const promises = batch.map(async (callId) => {
        const call = allCalls.find(c => c.id === callId);
        if (!call) return;

        try {
          // Resolve parameter references from previous results
          const resolvedCall = this.resolveParameters(call, previousResults);

          const result = await executor(resolvedCall);
          results.set(callId, result);
        } catch (error: any) {
          this.logger.error(`Call ${callId} failed: ${error.message}`);
          results.set(callId, {
            callId,
            toolName: call.toolName,
            success: false,
            error: {
              message: error.message,
              code: 'EXECUTION_ERROR',
              recoverable: false
            },
            metadata: {
              durationMs: 0,
              cached: false,
              timestamp: new Date()
            }
          });
        }
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Create batches for concurrency limiting
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Resolve parameter references from previous results
   * Example: ${call_1.data.files[0]} → "src/index.ts"
   */
  private resolveParameters(
    call: ToolCall,
    results: Map<string, ToolResult>
  ): ToolCall {
    const params = { ...call.parameters };

    // Simple template resolution (in production, use a proper template engine)
    const resolveValue = (value: any): any => {
      if (typeof value === 'string' && value.includes('${')) {
        // Extract reference: ${call_1.data.files}
        const match = value.match(/\$\{(.+?)\}/);
        if (match) {
          const ref = match[1];
          const [callId, ...path] = ref.split('.');

          const result = results.get(callId);
          if (!result || !result.success) {
            throw new Error(`Cannot resolve ${ref}: call ${callId} failed or not found`);
          }

          // Navigate path: data.files[0]
          let resolved: any = result;
          for (const segment of path) {
            if (segment.includes('[')) {
              // Array index
              const [prop, index] = segment.split('[');
              resolved = resolved[prop][parseInt(index.replace(']', ''), 10)];
            } else {
              resolved = resolved[segment];
            }
          }

          return resolved;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively resolve objects and arrays
        if (Array.isArray(value)) {
          return value.map(resolveValue);
        } else {
          const resolved: any = {};
          for (const [k, v] of Object.entries(value)) {
            resolved[k] = resolveValue(v);
          }
          return resolved;
        }
      }

      return value;
    };

    for (const [key, value] of Object.entries(params)) {
      params[key] = resolveValue(value);
    }

    return { ...call, parameters: params };
  }
}

interface ExecutionOptions {
  // Execute in parallel when possible
  parallelExecution?: boolean;

  // Stop on first error
  failFast?: boolean;

  // Timeout for entire execution
  timeoutMs?: number;
}
```

### Performance Comparison

```typescript
// Example: Sequential vs Parallel

const toolCalls: ToolCall[] = [
  { id: '1', toolName: 'read_file', parameters: { path: 'a.ts' } },
  { id: '2', toolName: 'read_file', parameters: { path: 'b.ts' } },
  { id: '3', toolName: 'read_file', parameters: { path: 'c.ts' } },
  { id: '4', toolName: 'read_file', parameters: { path: 'd.ts' } }
];

// Sequential: 4 * 100ms = 400ms
const sequential = await executeSequentially(toolCalls);

// Parallel: max(100ms, 100ms, 100ms, 100ms) = 100ms
const parallel = await executeInParallel(toolCalls);

// Speedup: 4x faster!
```

---

## 4.7 Result Caching

Many tools are deterministic - given the same inputs, they produce the same outputs. Result caching avoids redundant work by storing and reusing tool results.

### Cache Key Generation

```typescript
/**
 * Generate a cache key for a tool call
 */
export class CacheKeyGenerator {
  /**
   * Generate cache key from tool call
   */
  static generateKey(call: ToolCall): string {
    // Key format: toolName:hash(parameters)
    const paramHash = this.hashParameters(call.parameters);
    return `${call.toolName}:${paramHash}`;
  }

  /**
   * Hash parameters for cache key
   */
  private static hashParameters(params: any): string {
    // Stable JSON serialization (sorted keys)
    const normalized = this.normalizeObject(params);
    const json = JSON.stringify(normalized);

    // Simple hash (in production, use a proper hash function like SHA-256)
    return this.simpleHash(json);
  }

  /**
   * Normalize object for stable hashing
   * Sorts keys recursively
   */
  private static normalizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.normalizeObject(item));
    }

    if (typeof obj === 'object') {
      const sorted: any = {};
      const keys = Object.keys(obj).sort();
      for (const key of keys) {
        sorted[key] = this.normalizeObject(obj[key]);
      }
      return sorted;
    }

    return obj;
  }

  /**
   * Simple hash function (for demonstration)
   * In production, use crypto.createHash('sha256')
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
```

### Result Cache

```typescript
/**
 * Cache for tool results
 */
export class ResultCache {
  private cache = new Map<string, CacheEntry>();
  private logger: Logger;
  private maxSize: number;
  private ttlMs: number;

  constructor(logger: Logger, options: CacheOptions = {}) {
    this.logger = logger;
    this.maxSize = options.maxSize || 1000;
    this.ttlMs = options.ttlMs || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get cached result
   */
  get(key: string): ToolResult | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);

    // Mark result as cached
    return {
      ...entry.result,
      metadata: {
        ...entry.result.metadata,
        cached: true
      }
    };
  }

  /**
   * Store result in cache
   */
  set(key: string, result: ToolResult): void {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });

    this.logger.debug(`Cached result: ${key}`);
  }

  /**
   * Check if result is cached
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.ttlMs) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.logger.debug(`Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      if (age > this.ttlMs) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      hitRate: 0 // Would need to track hits/misses
    };
  }
}

interface CacheEntry {
  result: ToolResult;
  timestamp: number;
}

interface CacheOptions {
  maxSize?: number;
  ttlMs?: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  expired: number;
  hitRate: number;
}
```

### Cache Integration Example

```typescript
// Using cache with tool execution

const cache = new ResultCache(logger);
const keyGen = new CacheKeyGenerator();

async function executeToolWithCache(
  call: ToolCall,
  tool: Tool
): Promise<ToolResult> {
  // Check if tool is cacheable
  if (!tool.cacheable) {
    return await tool.execute(call.parameters, context);
  }

  // Generate cache key
  const cacheKey = keyGen.generateKey(call);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Using cached result for ${call.toolName}`);
    return cached;
  }

  // Execute tool
  const result = await tool.execute(call.parameters, context);

  // Cache successful results only
  if (result.success) {
    cache.set(cacheKey, result);
  }

  return result;
}
```

### Cache Performance Impact

```typescript
// Example: Impact of caching on repeated calls

const call = {
  id: 'call_1',
  toolName: 'search_code',
  parameters: { pattern: 'TODO', path: 'src/' }
};

// First call: Cache miss, actual execution (500ms)
const result1 = await executeToolWithCache(call, searchTool);
console.log(`Duration: ${result1.metadata.durationMs}ms, Cached: ${result1.metadata.cached}`);
// Duration: 500ms, Cached: false

// Second call: Cache hit, instant (0ms)
const result2 = await executeToolWithCache(call, searchTool);
console.log(`Duration: ${result2.metadata.durationMs}ms, Cached: ${result2.metadata.cached}`);
// Duration: 0ms, Cached: true

// Performance improvement: 500ms → 0ms (100% faster)
```

---

## 4.8 Tool Orchestrator

Now we bring it all together. The Tool Orchestrator is the main component that coordinates tool execution.

### Tool Orchestrator Implementation

```typescript
/**
 * Orchestrates tool execution with dependency resolution,
 * parallel execution, caching, and approval workflows
 */
export class ToolOrchestrator {
  private registry: ToolRegistry;
  private cache: ResultCache;
  private resolver: DependencyResolver;
  private executor: ParallelExecutor;
  private logger: Logger;
  private context: ToolContext;

  constructor(
    registry: ToolRegistry,
    logger: Logger,
    workingDirectory: string,
    options: OrchestratorOptions = {}
  ) {
    this.registry = registry;
    this.logger = logger;
    this.cache = new ResultCache(logger, options.cache);
    this.resolver = new DependencyResolver(logger);
    this.executor = new ParallelExecutor(logger, options.maxConcurrency || 5);

    this.context = {
      workingDirectory,
      logger,
      toolRegistry: registry,
      preferences: options.preferences || {},
      cancellationToken: options.cancellationToken
    };
  }

  /**
   * Execute tool calls
   */
  async execute(
    toolCalls: ToolCall[],
    options: ExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    try {
      this.logger.info(`Executing ${toolCalls.length} tool calls`);

      // 1. Build dependency graph
      const graph = this.resolver.buildGraph(toolCalls, this.registry);

      // 2. Plan execution
      const plan = this.resolver.planExecution(graph);
      this.logger.debug(`Execution plan: ${plan.totalCalls} calls, ${plan.parallel.length} levels`);

      // 3. Execute with caching and approval
      const results = await this.executor.execute(
        toolCalls,
        plan,
        async (call) => this.executeToolCall(call, options),
        options
      );

      // 4. Aggregate results
      const successCount = Array.from(results.values()).filter(r => r.success).length;
      const failureCount = results.size - successCount;

      this.logger.info(`Execution complete: ${successCount} successful, ${failureCount} failed`);

      return {
        success: failureCount === 0,
        results: Array.from(results.values()),
        metadata: {
          totalCalls: toolCalls.length,
          successCount,
          failureCount,
          durationMs: Date.now() - startTime,
          cacheHits: this.countCacheHits(results),
          parallelLevels: plan.parallel.length
        }
      };
    } catch (error: any) {
      this.logger.error(`Execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a single tool call with caching and approval
   */
  private async executeToolCall(
    call: ToolCall,
    options: ExecutionOptions
  ): Promise<ToolResult> {
    const tool = this.registry.get(call.toolName);

    // 1. Check cache (if tool is cacheable)
    if (tool.cacheable && options.enableCache !== false) {
      const cacheKey = CacheKeyGenerator.generateKey(call);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }
    }

    // 2. Request approval (if required)
    if (tool.requiresApproval && options.approvalCallback) {
      const approved = await options.approvalCallback(call, tool);

      if (!approved) {
        return {
          callId: call.id,
          toolName: call.toolName,
          success: false,
          error: {
            message: 'User denied approval',
            code: 'APPROVAL_DENIED',
            recoverable: false
          },
          metadata: {
            durationMs: 0,
            cached: false,
            timestamp: new Date(),
            approvalGranted: false
          }
        };
      }
    }

    // 3. Execute tool
    const startTime = Date.now();

    try {
      // Set timeout if specified
      const timeout = tool.timeoutMs || options.timeoutMs;
      const result = timeout
        ? await this.executeWithTimeout(tool, call, timeout)
        : await tool.execute(call.parameters, this.context);

      // Add call ID and duration
      result.callId = call.id;
      result.toolName = call.toolName;
      result.metadata.durationMs = Date.now() - startTime;

      // 4. Cache successful results
      if (result.success && tool.cacheable && options.enableCache !== false) {
        const cacheKey = CacheKeyGenerator.generateKey(call);
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Tool ${call.toolName} threw error: ${error.message}`);

      return {
        callId: call.id,
        toolName: call.toolName,
        success: false,
        error: {
          message: error.message,
          code: 'EXECUTION_ERROR',
          recoverable: tool.retryable || false,
          stack: error.stack
        },
        metadata: {
          durationMs: Date.now() - startTime,
          cached: false,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Execute tool with timeout
   */
  private async executeWithTimeout(
    tool: Tool,
    call: ToolCall,
    timeoutMs: number
  ): Promise<ToolResult> {
    return Promise.race([
      tool.execute(call.parameters, this.context),
      new Promise<ToolResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Tool ${call.toolName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  /**
   * Count cache hits in results
   */
  private countCacheHits(results: Map<string, ToolResult>): number {
    return Array.from(results.values()).filter(r => r.metadata.cached).length;
  }

  /**
   * Clear result cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }
}

interface OrchestratorOptions {
  cache?: CacheOptions;
  maxConcurrency?: number;
  preferences?: UserPreferences;
  cancellationToken?: CancellationToken;
}

interface UserPreferences {
  autoApprove?: boolean;
  verbose?: boolean;
  [key: string]: any;
}

interface CancellationToken {
  isCancelled: boolean;
  cancel(): void;
}

interface ToolExecutionResult {
  success: boolean;
  results: ToolResult[];
  metadata: {
    totalCalls: number;
    successCount: number;
    failureCount: number;
    durationMs: number;
    cacheHits: number;
    parallelLevels: number;
  };
}
```

### Complete Usage Example

```typescript
// Bootstrap the orchestrator
const logger = new Logger();
const registry = createToolRegistry(logger);
const orchestrator = new ToolOrchestrator(registry, logger, '/project', {
  maxConcurrency: 5,
  cache: {
    maxSize: 1000,
    ttlMs: 5 * 60 * 1000 // 5 minutes
  }
});

// Define tool calls
const toolCalls: ToolCall[] = [
  {
    id: 'call_1',
    toolName: 'list_files',
    parameters: { path: 'src/', recursive: true, pattern: '*.ts' }
  },
  {
    id: 'call_2',
    toolName: 'search_code',
    parameters: { pattern: 'TODO:', path: 'src/' }
  },
  {
    id: 'call_3',
    toolName: 'read_file',
    parameters: { path: '${call_1.data.files[0]}' },
    dependsOn: ['call_1']
  },
  {
    id: 'call_4',
    toolName: 'write_file',
    parameters: {
      path: 'analysis.md',
      content: 'Analysis results:\n${call_2.data.matches}'
    },
    dependsOn: ['call_2']
  }
];

// Execute with options
const result = await orchestrator.execute(toolCalls, {
  parallelExecution: true,
  enableCache: true,
  failFast: false,
  approvalCallback: async (call, tool) => {
    // Show user what will be done
    console.log(`\nTool: ${tool.name}`);
    console.log(`Description: ${tool.description}`);
    console.log(`Parameters: ${JSON.stringify(call.parameters, null, 2)}`);

    // Prompt for approval
    const answer = await promptUser('Approve? (y/n): ');
    return answer.toLowerCase() === 'y';
  }
});

// Display results
console.log(`\n✓ Execution complete`);
console.log(`  Success: ${result.metadata.successCount}/${result.metadata.totalCalls}`);
console.log(`  Duration: ${result.metadata.durationMs}ms`);
console.log(`  Cache hits: ${result.metadata.cacheHits}`);
console.log(`  Parallel levels: ${result.metadata.parallelLevels}`);

// Show individual results
for (const toolResult of result.results) {
  if (toolResult.success) {
    console.log(`✓ ${toolResult.toolName}`);
  } else {
    console.log(`✗ ${toolResult.toolName}: ${toolResult.error?.message}`);
  }
}
```

---

## 4.9 Interactive Approval System

For destructive operations, we need user approval. Let's implement a robust approval system.

### Approval Manager

```typescript
/**
 * Manages approval workflows for destructive operations
 */
export class ApprovalManager {
  private logger: Logger;
  private autoApprove: Set<string>;
  private alwaysDeny: Set<string>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.autoApprove = new Set();
    this.alwaysDeny = new Set();
  }

  /**
   * Request approval for a tool call
   */
  async requestApproval(
    call: ToolCall,
    tool: Tool,
    promptCallback: ApprovalPromptCallback
  ): Promise<ApprovalResult> {
    // Check auto-approve list
    if (this.autoApprove.has(tool.name)) {
      this.logger.debug(`Auto-approved: ${tool.name}`);
      return {
        approved: true,
        remember: true
      };
    }

    // Check always-deny list
    if (this.alwaysDeny.has(tool.name)) {
      this.logger.debug(`Auto-denied: ${tool.name}`);
      return {
        approved: false,
        remember: true
      };
    }

    // Prompt user
    const result = await promptCallback({
      toolName: tool.name,
      description: tool.description,
      parameters: call.parameters,
      impact: this.assessImpact(tool, call)
    });

    // Remember choice if requested
    if (result.remember) {
      if (result.approved) {
        this.autoApprove.add(tool.name);
      } else {
        this.alwaysDeny.add(tool.name);
      }
    }

    return result;
  }

  /**
   * Assess impact of tool execution
   */
  private assessImpact(tool: Tool, call: ToolCall): ImpactAssessment {
    const impact: ImpactAssessment = {
      level: 'low',
      description: '',
      warnings: []
    };

    // Assess based on tool type
    if (tool.name.includes('delete')) {
      impact.level = 'high';
      impact.description = 'This operation will delete data permanently';
      impact.warnings.push('⚠️  Cannot be undone');
    } else if (tool.name.includes('write') || tool.name.includes('commit')) {
      impact.level = 'medium';
      impact.description = 'This operation will modify files';
      if (call.parameters.path) {
        impact.warnings.push(`📝 Will modify: ${call.parameters.path}`);
      }
    } else if (tool.name.includes('push') || tool.name.includes('deploy')) {
      impact.level = 'high';
      impact.description = 'This operation will affect remote systems';
      impact.warnings.push('🌐 Remote operation - affects others');
    }

    return impact;
  }

  /**
   * Clear approval memory
   */
  clearMemory(): void {
    this.autoApprove.clear();
    this.alwaysDeny.clear();
    this.logger.debug('Cleared approval memory');
  }

  /**
   * Get approval statistics
   */
  getStats(): ApprovalStats {
    return {
      autoApproveCount: this.autoApprove.size,
      alwaysDenyCount: this.alwaysDeny.size,
      autoApproveTools: Array.from(this.autoApprove),
      alwaysDenyTools: Array.from(this.alwaysDeny)
    };
  }
}

interface ApprovalPromptCallback {
  (prompt: ApprovalPrompt): Promise<ApprovalResult>;
}

interface ApprovalPrompt {
  toolName: string;
  description: string;
  parameters: any;
  impact: ImpactAssessment;
}

interface ApprovalResult {
  approved: boolean;
  remember?: boolean; // Remember this choice
}

interface ImpactAssessment {
  level: 'low' | 'medium' | 'high';
  description: string;
  warnings: string[];
}

interface ApprovalStats {
  autoApproveCount: number;
  alwaysDenyCount: number;
  autoApproveTools: string[];
  alwaysDenyTools: string[];
}
```

### Terminal Approval UI

```typescript
/**
 * Terminal-based approval UI
 */
export class TerminalApprovalUI {
  private readline: readline.Interface;

  constructor() {
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Prompt user for approval
   */
  async prompt(promptData: ApprovalPrompt): Promise<ApprovalResult> {
    // Display tool information
    console.log('\n' + '='.repeat(60));
    console.log(`🔧 Tool: ${promptData.toolName}`);
    console.log(`📄 ${promptData.description}`);
    console.log('='.repeat(60));

    // Display parameters
    console.log('\n📋 Parameters:');
    console.log(JSON.stringify(promptData.parameters, null, 2));

    // Display impact assessment
    const impactIcon = {
      low: '✅',
      medium: '⚠️',
      high: '🔴'
    }[promptData.impact.level];

    console.log(`\n${impactIcon} Impact: ${promptData.impact.level.toUpperCase()}`);
    console.log(`   ${promptData.impact.description}`);

    if (promptData.impact.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      for (const warning of promptData.impact.warnings) {
        console.log(`   ${warning}`);
      }
    }

    // Prompt for approval
    console.log('\nOptions:');
    console.log('  y  - Approve');
    console.log('  n  - Deny');
    console.log('  ya - Approve and remember (auto-approve this tool)');
    console.log('  na - Deny and remember (always deny this tool)');

    const answer = await this.question('\nYour choice: ');

    const approved = answer.toLowerCase().startsWith('y');
    const remember = answer.toLowerCase().endsWith('a');

    return { approved, remember };
  }

  /**
   * Prompt user with a question
   */
  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.readline.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Close the UI
   */
  close(): void {
    this.readline.close();
  }
}
```

### Integration with Orchestrator

```typescript
// Using approval system with orchestrator

const approvalManager = new ApprovalManager(logger);
const approvalUI = new TerminalApprovalUI();

const result = await orchestrator.execute(toolCalls, {
  parallelExecution: true,
  enableCache: true,
  approvalCallback: async (call, tool) => {
    // Use approval manager
    const result = await approvalManager.requestApproval(
      call,
      tool,
      async (prompt) => await approvalUI.prompt(prompt)
    );

    return result.approved;
  }
});

// Cleanup
approvalUI.close();

// Show approval stats
const stats = approvalManager.getStats();
console.log(`\nApproval Statistics:`);
console.log(`  Auto-approve: ${stats.autoApproveTools.join(', ')}`);
console.log(`  Always deny: ${stats.alwaysDenyTools.join(', ')}`);
```

---

## 4.10 Error Handling and Recovery

Robust error handling is crucial for production systems. Let's implement comprehensive error recovery.

### Error Categories

```typescript
/**
 * Error categories for tool execution
 */
export enum ToolErrorCategory {
  // Validation errors (bad input)
  VALIDATION = 'VALIDATION',

  // Permission errors (access denied)
  PERMISSION = 'PERMISSION',

  // Not found errors (file/resource missing)
  NOT_FOUND = 'NOT_FOUND',

  // Timeout errors
  TIMEOUT = 'TIMEOUT',

  // Network errors (external APIs)
  NETWORK = 'NETWORK',

  // System errors (out of memory, etc.)
  SYSTEM = 'SYSTEM',

  // Unknown errors
  UNKNOWN = 'UNKNOWN'
}

/**
 * Categorize error by analyzing error object
 */
export function categorizeError(error: any): ToolErrorCategory {
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toUpperCase() || '';

  // Check error codes first
  if (code === 'ENOENT') return ToolErrorCategory.NOT_FOUND;
  if (code === 'EACCES' || code === 'EPERM') return ToolErrorCategory.PERMISSION;
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') return ToolErrorCategory.TIMEOUT;
  if (code === 'ENOTFOUND' || code === 'ECONNREFUSED') return ToolErrorCategory.NETWORK;

  // Check error messages
  if (message.includes('not found')) return ToolErrorCategory.NOT_FOUND;
  if (message.includes('permission') || message.includes('access denied')) {
    return ToolErrorCategory.PERMISSION;
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return ToolErrorCategory.TIMEOUT;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ToolErrorCategory.VALIDATION;
  }
  if (message.includes('network') || message.includes('connection')) {
    return ToolErrorCategory.NETWORK;
  }

  return ToolErrorCategory.UNKNOWN;
}
```

### Retry Strategy

```typescript
/**
 * Retry strategy for tool execution
 */
export class RetryStrategy {
  private logger: Logger;
  private maxRetries: number;
  private retryDelay: number;
  private backoffMultiplier: number;

  constructor(
    logger: Logger,
    options: RetryOptions = {}
  ) {
    this.logger = logger;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelayMs || 1000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  /**
   * Execute with retry
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext
  ): Promise<T> {
    let lastError: any;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        this.logger.debug(`${context.name}: Attempt ${attempt + 1}/${this.maxRetries + 1}`);
        return await operation();
      } catch (error: any) {
        lastError = error;
        attempt++;

        // Categorize error
        const category = categorizeError(error);

        // Check if error is retryable
        if (!this.isRetryable(category)) {
          this.logger.error(`${context.name}: Non-retryable error (${category})`);
          throw error;
        }

        // Check if we have retries left
        if (attempt > this.maxRetries) {
          this.logger.error(`${context.name}: Max retries (${this.maxRetries}) exceeded`);
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = this.retryDelay * Math.pow(this.backoffMultiplier, attempt - 1);

        this.logger.warn(
          `${context.name}: Attempt ${attempt} failed (${category}), ` +
          `retrying in ${delay}ms...`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if error category is retryable
   */
  private isRetryable(category: ToolErrorCategory): boolean {
    switch (category) {
      case ToolErrorCategory.TIMEOUT:
      case ToolErrorCategory.NETWORK:
      case ToolErrorCategory.SYSTEM:
        return true;

      case ToolErrorCategory.VALIDATION:
      case ToolErrorCategory.PERMISSION:
      case ToolErrorCategory.NOT_FOUND:
        return false;

      case ToolErrorCategory.UNKNOWN:
        return true; // Retry unknown errors (conservative approach)

      default:
        return false;
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  backoffMultiplier?: number;
}

interface RetryContext {
  name: string;
  toolName: string;
  callId: string;
}
```

### Enhanced Tool Execution with Retry

```typescript
/**
 * Enhanced tool orchestrator with retry support
 */
export class RobustToolOrchestrator extends ToolOrchestrator {
  private retryStrategy: RetryStrategy;

  constructor(
    registry: ToolRegistry,
    logger: Logger,
    workingDirectory: string,
    options: OrchestratorOptions = {}
  ) {
    super(registry, logger, workingDirectory, options);
    this.retryStrategy = new RetryStrategy(logger, options.retry);
  }

  /**
   * Execute tool call with retry
   */
  protected async executeToolCall(
    call: ToolCall,
    options: ExecutionOptions
  ): Promise<ToolResult> {
    const tool = this.registry.get(call.toolName);

    // Only retry if tool is marked as retryable
    if (!tool.retryable) {
      return await super.executeToolCall(call, options);
    }

    // Execute with retry
    try {
      return await this.retryStrategy.executeWithRetry(
        async () => await super.executeToolCall(call, options),
        {
          name: `Tool ${call.toolName}`,
          toolName: call.toolName,
          callId: call.id
        }
      );
    } catch (error: any) {
      // If all retries failed, return error result
      return {
        callId: call.id,
        toolName: call.toolName,
        success: false,
        error: {
          message: error.message,
          code: categorizeError(error),
          recoverable: false,
          suggestion: this.getSuggestion(error)
        },
        metadata: {
          durationMs: 0,
          cached: false,
          timestamp: new Date(),
          retriesAttempted: this.retryStrategy['maxRetries']
        }
      };
    }
  }

  /**
   * Get suggestion based on error
   */
  private getSuggestion(error: any): string {
    const category = categorizeError(error);

    switch (category) {
      case ToolErrorCategory.NOT_FOUND:
        return 'Check that the file or resource exists';

      case ToolErrorCategory.PERMISSION:
        return 'Check file permissions or access rights';

      case ToolErrorCategory.TIMEOUT:
        return 'Try increasing the timeout or check system resources';

      case ToolErrorCategory.NETWORK:
        return 'Check network connectivity and try again';

      case ToolErrorCategory.VALIDATION:
        return 'Check parameter values and format';

      default:
        return 'Check logs for more details';
    }
  }
}
```

---

## Summary

In this chapter, we've built a complete tool orchestration system with:

1. **Tool Interface** - Clean, declarative contracts for all tools
2. **Tool Implementations** - File system, git, and code analysis tools
3. **Tool Registry** - Central catalog with dependency validation
4. **Dependency Resolution** - DAG construction and topological sorting
5. **Parallel Execution** - Concurrent execution with dependency tracking
6. **Result Caching** - Avoid redundant work for deterministic operations
7. **Tool Orchestrator** - Main coordinator integrating all components
8. **Interactive Approval** - Safety mechanisms for destructive operations
9. **Error Handling** - Categorization, retry logic, and graceful degradation

### Key Takeaways

✅ **Tools are the bridge** between AI reasoning and real-world actions

✅ **Declarative design** separates tool capabilities from orchestration logic

✅ **Dependency graphs** enable optimal execution planning

✅ **Parallel execution** dramatically improves performance

✅ **Caching** avoids redundant work for deterministic operations

✅ **Approval workflows** prevent accidental destructive operations

✅ **Retry logic** handles transient failures gracefully

✅ **Rich error information** enables better error recovery and user guidance

---

## Exercises

### Exercise 1: Implement Custom Tools

Create three custom tools for your domain:

**Starter Code:**
```typescript
// 1. Database Query Tool
export class DatabaseQueryTool implements Tool {
  readonly name = 'query_database';
  readonly description = 'Execute SQL query against database';
  // TODO: Implement
}

// 2. API Call Tool
export class APICallTool implements Tool {
  readonly name = 'api_call';
  readonly description = 'Make HTTP request to external API';
  // TODO: Implement
}

// 3. Code Generation Tool
export class CodeGenerationTool implements Tool {
  readonly name = 'generate_code';
  readonly description = 'Generate code from template';
  // TODO: Implement
}
```

**Requirements:**
- Follow tool interface design principles
- Include proper error handling
- Implement validation
- Add cost estimation
- Write unit tests

### Exercise 2: Dependency Optimization

Optimize the dependency resolver to minimize execution time:

**Task:**
```typescript
// Given these tool calls, find the optimal execution plan
const toolCalls = [
  { id: '1', toolName: 'fetch_data', params: { source: 'api1' } },
  { id: '2', toolName: 'fetch_data', params: { source: 'api2' } },
  { id: '3', toolName: 'process_data', params: {}, dependsOn: ['1'] },
  { id: '4', toolName: 'process_data', params: {}, dependsOn: ['2'] },
  { id: '5', toolName: 'merge_results', params: {}, dependsOn: ['3', '4'] },
  { id: '6', toolName: 'generate_report', params: {}, dependsOn: ['5'] }
];

// TODO: Calculate optimal parallel levels
// TODO: Estimate total execution time
// TODO: Identify bottlenecks
```

### Exercise 3: Cache Eviction Strategies

Implement advanced cache eviction strategies:

**Starter Code:**
```typescript
export enum EvictionStrategy {
  LRU,  // Least Recently Used
  LFU,  // Least Frequently Used
  TTL,  // Time To Live
  SIZE  // Size-based
}

export class AdvancedCache extends ResultCache {
  constructor(
    logger: Logger,
    strategy: EvictionStrategy,
    options: CacheOptions
  ) {
    super(logger, options);
    // TODO: Implement eviction strategy
  }

  // TODO: Track access frequency
  // TODO: Track access recency
  // TODO: Track entry sizes
  // TODO: Implement smart eviction
}
```

### Exercise 4: Approval Policies

Create a policy-based approval system:

**Task:**
```typescript
interface ApprovalPolicy {
  // Define when approval is needed
  requiresApproval(tool: Tool, params: any): boolean;

  // Define approval level (user, admin, auto)
  getApprovalLevel(tool: Tool, params: any): ApprovalLevel;

  // Auto-approve based on rules
  autoApprove(tool: Tool, params: any): boolean;
}

// TODO: Implement policy for file operations
// TODO: Implement policy for git operations
// TODO: Implement policy for external API calls
// TODO: Add policy composition (AND, OR, NOT)
```

### Exercise 5: Performance Benchmarking

Benchmark tool orchestration performance:

**Requirements:**
```typescript
// Compare performance scenarios:

// 1. Sequential vs Parallel execution
// 2. Cache enabled vs disabled
// 3. Different concurrency limits (1, 5, 10, unlimited)
// 4. Impact of retry logic
// 5. Overhead of approval workflows

// TODO: Create benchmark suite
// TODO: Collect metrics (duration, throughput, cache hit rate)
// TODO: Generate performance report
// TODO: Identify optimization opportunities
```

---

**Next Chapter:** [Streaming Architecture and Real-Time Responses →](chapter-05-streaming.md)

In Chapter 5, we'll explore how to stream AI responses and tool execution progress in real-time, providing immediate feedback to users and enabling responsive UX.

---

*Chapter 4 | Tool Orchestration and Execution | Complete*
