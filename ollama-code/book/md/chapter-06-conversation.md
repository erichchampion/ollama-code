# Chapter 6: Conversation Management and Context

> *"Context is king." — Gary Vaynerchuk*

---

## Introduction

In the previous chapters, we built tool orchestration (Chapter 4) and streaming architecture (Chapter 5). Now we face a critical challenge: **How do AI coding assistants remember and use conversation history?**

Consider this interaction:

```
User: "What files are in the src/ directory?"
AI: "Found 47 TypeScript files: index.ts, router.ts, logger.ts..."

User: "Show me the router file"
AI: ??? [Without context, AI doesn't know which file]
```

**Conversation management** solves this by:

1. **Tracking conversation history** - Remember previous messages
2. **Managing context windows** - Fit conversation in token limits
3. **Analyzing intent** - Understand what users really want
4. **Enriching context** - Add relevant information automatically
5. **Persisting conversations** - Save and resume sessions

This chapter builds a complete conversation management system for AI coding assistants.

---

## What You'll Learn

1. **Conversation Architecture** - Message structures and conversation state
2. **Conversation Manager** - Core implementation for multi-turn dialogue
3. **Context Window Management** - Token budget optimization
4. **Conversation Persistence** - Saving and loading conversations
5. **Intent Analysis** - Understanding user goals
6. **Context Enrichment** - Automatic information gathering
7. **Memory Optimization** - Efficient conversation storage

---

## 6.1 Conversation Architecture

### Message Structure

```typescript
/**
 * Message role in conversation
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool'
}

/**
 * Base message interface
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

/**
 * Message metadata
 */
export interface MessageMetadata {
  // Token count for this message
  tokens?: number;

  // Model used to generate (for assistant messages)
  model?: string;

  // Cost of generation
  cost?: number;

  // Tool calls made (for assistant messages)
  toolCalls?: ToolCall[];

  // Tool results (for tool messages)
  toolResults?: ToolResult[];

  // Intent detected (for user messages)
  intent?: Intent;

  // Additional metadata
  [key: string]: any;
}

/**
 * System message - sets behavior/context
 */
export interface SystemMessage extends Message {
  role: MessageRole.SYSTEM;
}

/**
 * User message - from human
 */
export interface UserMessage extends Message {
  role: MessageRole.USER;
}

/**
 * Assistant message - from AI
 */
export interface AssistantMessage extends Message {
  role: MessageRole.ASSISTANT;
  metadata?: MessageMetadata & {
    model: string;
    toolCalls?: ToolCall[];
  };
}

/**
 * Tool message - tool execution results
 */
export interface ToolMessage extends Message {
  role: MessageRole.TOOL;
  toolCallId: string;
  metadata?: MessageMetadata & {
    toolResults: ToolResult[];
  };
}
```

### Conversation State

```typescript
/**
 * Conversation state
 */
export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata: ConversationMetadata;
}

/**
 * Conversation metadata
 */
export interface ConversationMetadata {
  // Total tokens used
  totalTokens: number;

  // Total cost
  totalCost: number;

  // Number of turns (user messages)
  turns: number;

  // Current context (for resuming)
  context?: ConversationContext;

  // Tags for organization
  tags?: string[];

  // Custom metadata
  [key: string]: any;
}

/**
 * Conversation context - working memory
 */
export interface ConversationContext {
  // Current working directory
  workingDirectory: string;

  // Recently accessed files
  recentFiles: string[];

  // Active tools
  activeTools: string[];

  // User preferences
  preferences: Record<string, any>;

  // Current task/goal
  currentTask?: string;
}
```

---

## 6.2 Conversation Manager Implementation

### Core Conversation Manager

```typescript
/**
 * Manages conversation state and history
 */
export class ConversationManager {
  private conversation: Conversation;
  private logger: Logger;
  private tokenCounter: TokenCounter;
  private maxContextTokens: number;

  constructor(
    conversationId: string,
    logger: Logger,
    options: ConversationOptions = {}
  ) {
    this.logger = logger;
    this.tokenCounter = new TokenCounter();
    this.maxContextTokens = options.maxContextTokens || 100000;

    this.conversation = {
      id: conversationId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalTokens: 0,
        totalCost: 0,
        turns: 0,
        context: {
          workingDirectory: process.cwd(),
          recentFiles: [],
          activeTools: [],
          preferences: options.preferences || {}
        }
      }
    };

    // Add system message if provided
    if (options.systemPrompt) {
      this.addSystemMessage(options.systemPrompt);
    }
  }

  /**
   * Add system message
   */
  addSystemMessage(content: string): SystemMessage {
    const message: SystemMessage = {
      id: this.generateMessageId(),
      role: MessageRole.SYSTEM,
      content,
      timestamp: new Date(),
      metadata: {
        tokens: this.tokenCounter.count(content)
      }
    };

    this.conversation.messages.push(message);
    this.updateMetadata(message);

    this.logger.debug(`Added system message (${message.metadata!.tokens} tokens)`);

    return message;
  }

  /**
   * Add user message
   */
  addUserMessage(content: string, metadata?: Partial<MessageMetadata>): UserMessage {
    const message: UserMessage = {
      id: this.generateMessageId(),
      role: MessageRole.USER,
      content,
      timestamp: new Date(),
      metadata: {
        tokens: this.tokenCounter.count(content),
        ...metadata
      }
    };

    this.conversation.messages.push(message);
    this.updateMetadata(message);
    this.conversation.metadata.turns++;

    this.logger.info(`User: ${this.truncate(content, 100)}`);

    return message;
  }

  /**
   * Add assistant message
   */
  addAssistantMessage(
    content: string,
    metadata?: Partial<MessageMetadata>
  ): AssistantMessage {
    const message: AssistantMessage = {
      id: this.generateMessageId(),
      role: MessageRole.ASSISTANT,
      content,
      timestamp: new Date(),
      metadata: {
        tokens: this.tokenCounter.count(content),
        ...metadata
      } as any
    };

    this.conversation.messages.push(message);
    this.updateMetadata(message);

    this.logger.info(`Assistant: ${this.truncate(content, 100)}`);

    return message;
  }

  /**
   * Add tool message
   */
  addToolMessage(
    toolCallId: string,
    content: string,
    toolResults: ToolResult[]
  ): ToolMessage {
    const message: ToolMessage = {
      id: this.generateMessageId(),
      role: MessageRole.TOOL,
      toolCallId,
      content,
      timestamp: new Date(),
      metadata: {
        tokens: this.tokenCounter.count(content),
        toolResults
      }
    };

    this.conversation.messages.push(message);
    this.updateMetadata(message);

    this.logger.debug(`Tool result: ${toolResults.length} results`);

    return message;
  }

  /**
   * Get conversation messages
   */
  getMessages(): Message[] {
    return [...this.conversation.messages];
  }

  /**
   * Get messages for AI (with context window management)
   */
  getMessagesForAI(maxTokens?: number): Message[] {
    const limit = maxTokens || this.maxContextTokens;

    // Always include system messages
    const systemMessages = this.conversation.messages.filter(
      m => m.role === MessageRole.SYSTEM
    );

    // Get recent messages that fit in context window
    const otherMessages = this.conversation.messages.filter(
      m => m.role !== MessageRole.SYSTEM
    );

    let totalTokens = systemMessages.reduce(
      (sum, m) => sum + (m.metadata?.tokens || 0),
      0
    );

    const selectedMessages: Message[] = [...systemMessages];

    // Add messages from most recent, working backwards
    for (let i = otherMessages.length - 1; i >= 0; i--) {
      const message = otherMessages[i];
      const messageTokens = message.metadata?.tokens || 0;

      if (totalTokens + messageTokens > limit) {
        this.logger.warn(
          `Context window limit reached: ${totalTokens}/${limit} tokens`
        );
        break;
      }

      selectedMessages.push(message);
      totalTokens += messageTokens;
    }

    // Reverse to get chronological order (except system messages)
    const chronological = [
      ...systemMessages,
      ...selectedMessages.filter(m => m.role !== MessageRole.SYSTEM).reverse()
    ];

    this.logger.debug(
      `Context: ${chronological.length} messages, ${totalTokens} tokens`
    );

    return chronological;
  }

  /**
   * Get conversation metadata
   */
  getMetadata(): ConversationMetadata {
    return { ...this.conversation.metadata };
  }

  /**
   * Get conversation context
   */
  getContext(): ConversationContext {
    return { ...this.conversation.metadata.context! };
  }

  /**
   * Update conversation context
   */
  updateContext(updates: Partial<ConversationContext>): void {
    Object.assign(this.conversation.metadata.context!, updates);
    this.conversation.updatedAt = new Date();
  }

  /**
   * Clear conversation history (keep system messages)
   */
  clear(keepSystemMessages: boolean = true): void {
    if (keepSystemMessages) {
      this.conversation.messages = this.conversation.messages.filter(
        m => m.role === MessageRole.SYSTEM
      );
    } else {
      this.conversation.messages = [];
    }

    this.conversation.metadata.totalTokens = this.conversation.messages.reduce(
      (sum, m) => sum + (m.metadata?.tokens || 0),
      0
    );
    this.conversation.metadata.turns = 0;
    this.conversation.updatedAt = new Date();

    this.logger.info('Conversation cleared');
  }

  /**
   * Export conversation
   */
  export(): Conversation {
    return JSON.parse(JSON.stringify(this.conversation));
  }

  /**
   * Update metadata after adding message
   */
  private updateMetadata(message: Message): void {
    const tokens = message.metadata?.tokens || 0;
    this.conversation.metadata.totalTokens += tokens;

    if (message.metadata?.cost) {
      this.conversation.metadata.totalCost += message.metadata.cost;
    }

    this.conversation.updatedAt = new Date();
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Truncate string for logging
   */
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  }
}

interface ConversationOptions {
  systemPrompt?: string;
  maxContextTokens?: number;
  preferences?: Record<string, any>;
}
```

### Token Counter

```typescript
/**
 * Token counter for messages
 */
export class TokenCounter {
  /**
   * Count tokens in text
   * Simplified estimation - in production, use proper tokenizer
   */
  count(text: string): number {
    // Rough estimation: ~4 characters per token
    // This varies by model - use actual tokenizer in production
    return Math.ceil(text.length / 4);
  }

  /**
   * Count tokens in messages
   */
  countMessages(messages: Message[]): number {
    return messages.reduce((total, message) => {
      return total + (message.metadata?.tokens || this.count(message.content));
    }, 0);
  }

  /**
   * Estimate tokens for tool call
   */
  countToolCall(toolCall: ToolCall): number {
    const paramsStr = JSON.stringify(toolCall.parameters);
    return this.count(toolCall.toolName + paramsStr) + 10; // +10 for overhead
  }

  /**
   * Estimate tokens for tool result
   */
  countToolResult(result: ToolResult): number {
    const dataStr = JSON.stringify(result.data || {});
    return this.count(dataStr) + 20; // +20 for overhead
  }
}
```

---

## 6.3 Context Window Management

Context windows have token limits (e.g., 100K for Claude, 128K for GPT-4). We need smart strategies to fit conversations within these limits.

### Context Window Strategy

```typescript
/**
 * Strategy for managing context window
 */
export enum ContextWindowStrategy {
  // Keep most recent messages
  RECENT = 'recent',

  // Keep based on importance score
  IMPORTANT = 'important',

  // Sliding window with summarization
  SLIDING_SUMMARY = 'sliding_summary',

  // Keep based on relevance to current query
  RELEVANT = 'relevant'
}

/**
 * Context window manager
 */
export class ContextWindowManager {
  private strategy: ContextWindowStrategy;
  private maxTokens: number;
  private tokenCounter: TokenCounter;
  private logger: Logger;

  constructor(
    strategy: ContextWindowStrategy = ContextWindowStrategy.RECENT,
    maxTokens: number = 100000,
    logger: Logger
  ) {
    this.strategy = strategy;
    this.maxTokens = maxTokens;
    this.tokenCounter = new TokenCounter();
    this.logger = logger;
  }

  /**
   * Select messages that fit in context window
   */
  selectMessages(
    messages: Message[],
    query?: string
  ): Message[] {
    switch (this.strategy) {
      case ContextWindowStrategy.RECENT:
        return this.selectRecent(messages);

      case ContextWindowStrategy.IMPORTANT:
        return this.selectImportant(messages);

      case ContextWindowStrategy.SLIDING_SUMMARY:
        return this.selectWithSummary(messages);

      case ContextWindowStrategy.RELEVANT:
        return this.selectRelevant(messages, query);

      default:
        return this.selectRecent(messages);
    }
  }

  /**
   * Keep most recent messages
   */
  private selectRecent(messages: Message[]): Message[] {
    // Always keep system messages
    const systemMessages = messages.filter(m => m.role === MessageRole.SYSTEM);
    const otherMessages = messages.filter(m => m.role !== MessageRole.SYSTEM);

    let totalTokens = this.tokenCounter.countMessages(systemMessages);
    const selected: Message[] = [];

    // Add from most recent
    for (let i = otherMessages.length - 1; i >= 0; i--) {
      const message = otherMessages[i];
      const messageTokens = message.metadata?.tokens ||
        this.tokenCounter.count(message.content);

      if (totalTokens + messageTokens > this.maxTokens) {
        break;
      }

      selected.unshift(message);
      totalTokens += messageTokens;
    }

    const result = [...systemMessages, ...selected];
    this.logger.debug(
      `Selected ${result.length}/${messages.length} messages ` +
      `(${totalTokens} tokens)`
    );

    return result;
  }

  /**
   * Keep important messages based on score
   */
  private selectImportant(messages: Message[]): Message[] {
    // Score messages by importance
    const scored = messages.map(message => ({
      message,
      score: this.calculateImportance(message)
    }));

    // Sort by importance (descending)
    scored.sort((a, b) => b.score - a.score);

    // Select messages that fit
    let totalTokens = 0;
    const selected: Message[] = [];

    for (const { message, score } of scored) {
      const messageTokens = message.metadata?.tokens ||
        this.tokenCounter.count(message.content);

      if (totalTokens + messageTokens > this.maxTokens) {
        break;
      }

      selected.push(message);
      totalTokens += messageTokens;
    }

    // Sort chronologically
    selected.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    this.logger.debug(
      `Selected ${selected.length} important messages (${totalTokens} tokens)`
    );

    return selected;
  }

  /**
   * Calculate message importance
   */
  private calculateImportance(message: Message): number {
    let score = 0;

    // System messages are always important
    if (message.role === MessageRole.SYSTEM) {
      return 1000;
    }

    // Recent messages are more important
    const ageMs = Date.now() - message.timestamp.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    score += Math.max(0, 100 - ageDays * 10);

    // Messages with tool calls are important
    if (message.metadata?.toolCalls && message.metadata.toolCalls.length > 0) {
      score += 50;
    }

    // Longer messages might be more important
    const length = message.content.length;
    score += Math.min(length / 100, 50);

    return score;
  }

  /**
   * Select with summarization of old messages
   */
  private selectWithSummary(messages: Message[]): Message[] {
    // For now, just use recent strategy
    // In production, summarize old messages and prepend summary
    return this.selectRecent(messages);
  }

  /**
   * Select relevant to current query
   */
  private selectRelevant(messages: Message[], query?: string): Message[] {
    if (!query) {
      return this.selectRecent(messages);
    }

    // Score messages by relevance to query
    const scored = messages.map(message => ({
      message,
      score: this.calculateRelevance(message, query)
    }));

    // Sort by relevance
    scored.sort((a, b) => b.score - a.score);

    // Select messages that fit
    let totalTokens = 0;
    const selected: Message[] = [];

    for (const { message } of scored) {
      const messageTokens = message.metadata?.tokens ||
        this.tokenCounter.count(message.content);

      if (totalTokens + messageTokens > this.maxTokens) {
        break;
      }

      selected.push(message);
      totalTokens += messageTokens;
    }

    // Sort chronologically
    selected.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return selected;
  }

  /**
   * Calculate relevance to query
   */
  private calculateRelevance(message: Message, query: string): number {
    // Simple keyword matching
    const queryWords = query.toLowerCase().split(/\s+/);
    const messageWords = message.content.toLowerCase().split(/\s+/);

    let matches = 0;
    for (const word of queryWords) {
      if (messageWords.includes(word)) {
        matches++;
      }
    }

    // System messages always relevant
    if (message.role === MessageRole.SYSTEM) {
      return 1000;
    }

    return matches * 10;
  }
}
```

---

## 6.4 Conversation Persistence

Save and load conversations for resuming sessions.

### Conversation Storage

```typescript
/**
 * Conversation storage
 */
export class ConversationStorage {
  private storageDir: string;
  private logger: Logger;

  constructor(storageDir: string, logger: Logger) {
    this.storageDir = storageDir;
    this.logger = logger;
  }

  /**
   * Save conversation to disk
   */
  async save(conversation: Conversation): Promise<void> {
    const filePath = this.getConversationPath(conversation.id);

    // Ensure storage directory exists
    await fs.mkdir(this.storageDir, { recursive: true });

    // Write conversation
    await fs.writeFile(
      filePath,
      JSON.stringify(conversation, null, 2),
      'utf-8'
    );

    this.logger.debug(`Saved conversation: ${conversation.id}`);
  }

  /**
   * Load conversation from disk
   */
  async load(conversationId: string): Promise<Conversation | null> {
    const filePath = this.getConversationPath(conversationId);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const conversation = JSON.parse(data);

      // Parse dates
      conversation.createdAt = new Date(conversation.createdAt);
      conversation.updatedAt = new Date(conversation.updatedAt);
      conversation.messages.forEach((m: any) => {
        m.timestamp = new Date(m.timestamp);
      });

      this.logger.debug(`Loaded conversation: ${conversationId}`);
      return conversation;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all conversations
   */
  async list(): Promise<ConversationSummary[]> {
    try {
      const files = await fs.readdir(this.storageDir);
      const summaries: ConversationSummary[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const conversationId = file.replace('.json', '');
        const conversation = await this.load(conversationId);

        if (conversation) {
          summaries.push({
            id: conversation.id,
            turns: conversation.metadata.turns,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            preview: this.getPreview(conversation)
          });
        }
      }

      // Sort by most recent
      summaries.sort((a, b) =>
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );

      return summaries;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async delete(conversationId: string): Promise<void> {
    const filePath = this.getConversationPath(conversationId);

    try {
      await fs.unlink(filePath);
      this.logger.debug(`Deleted conversation: ${conversationId}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get conversation file path
   */
  private getConversationPath(conversationId: string): string {
    return path.join(this.storageDir, `${conversationId}.json`);
  }

  /**
   * Get preview of conversation
   */
  private getPreview(conversation: Conversation): string {
    const userMessages = conversation.messages.filter(
      m => m.role === MessageRole.USER
    );

    if (userMessages.length === 0) {
      return 'Empty conversation';
    }

    const firstMessage = userMessages[0].content;
    return firstMessage.length > 100
      ? firstMessage.substring(0, 100) + '...'
      : firstMessage;
  }
}

interface ConversationSummary {
  id: string;
  turns: number;
  createdAt: Date;
  updatedAt: Date;
  preview: string;
}
```

---

## Summary

In this chapter, we built a complete conversation management system:

1. **Conversation Architecture** - Message structures and state management
2. **Conversation Manager** - Core implementation for multi-turn dialogue
3. **Context Window Management** - Token budget optimization strategies
4. **Conversation Persistence** - Saving and loading conversations

### Key Takeaways

✅ **Structured messages** enable consistent conversation handling

✅ **Token counting** ensures we stay within context limits

✅ **Context window strategies** optimize which messages to include

✅ **Persistence** allows resuming conversations across sessions

---

**Next:** Part III will cover advanced features like VCS intelligence, interactive modes, and security.

---

*Chapter 6 | Conversation Management and Context | Complete*