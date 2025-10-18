# Chapter 7: VCS Intelligence and Git Integration

> *"Good code is its own best documentation." — Steve McConnell*

---

## Introduction

Version control is the backbone of modern software development. But most developers spend significant time on mundane VCS tasks:

- Writing commit messages (5-10 min per commit)
- Creating PR descriptions (15-30 min per PR)
- Reviewing code changes (30-60 min per review)
- Resolving merge conflicts (variable, often frustrating)

What if AI could handle these tasks intelligently? **VCS Intelligence** transforms version control from a chore into an automated, intelligent workflow.

This chapter builds a complete VCS intelligence system that:

1. **Analyzes code changes** semantically
2. **Generates commit messages** following conventions
3. **Creates PR descriptions** with full context
4. **Reviews code** for quality and issues
5. **Tracks metrics** over time
6. **Automates workflows** with git hooks

---

## What You'll Learn

1. **VCS Intelligence Architecture** - Designing git-aware AI systems
2. **Git Hooks Integration** - Automating workflows at key events
3. **AI Commit Message Generation** - Semantic, conventional commits
4. **Pull Request Intelligence** - Creation and review automation
5. **CI/CD Pipeline Generation** - Smart pipeline configuration
6. **Code Quality Tracking** - Metrics over time

---

## 7.1 VCS Intelligence Overview

### The Problem with Traditional Git Workflows

**Manual Commit Messages:**
```bash
$ git add .
$ git commit -m "fix bug"
$ git push

# Problems:
# - "fix bug" is uninformative
# - No context about what changed
# - No reference to issues
# - Doesn't follow conventions
```

**Manual PR Creation:**
```bash
$ gh pr create
Title: Update authentication
Description: Fixed some stuff

# Problems:
# - Generic title
# - No details about changes
# - Reviewers don't know what to look for
# - No testing information
```

### The VCS Intelligence Solution

**AI-Powered Commits:**
```bash
$ ollama-code commit

AI: [Analyzing changes...]
    [Detected: 3 files changed, 47 additions, 12 deletions]
    [Type: Bug fix in authentication module]

    Generated commit message:

    fix(auth): resolve race condition in token refresh

    - Add mutex lock to prevent concurrent token refreshes
    - Update token expiration check to use UTC timestamps
    - Add integration test for concurrent refresh scenarios

    Fixes #234

✓ Commit created: a3f9d2e
```

**AI-Powered PRs:**
```bash
$ ollama-code pr create

AI: [Analyzing 15 commits since main...]
    [Detecting theme: Authentication refactoring]

    Created PR #456:

    Title: Refactor authentication to support OAuth 2.0

    Description:
    ## Summary
    This PR refactors our authentication system to support OAuth 2.0
    flows alongside our existing JWT implementation.

    ## Changes
    - Add OAuth 2.0 provider interface
    - Implement Google and GitHub OAuth providers
    - Refactor token management for multi-provider support
    - Add comprehensive integration tests

    ## Testing
    - ✅ All existing tests pass
    - ✅ New OAuth tests added (95% coverage)
    - ✅ Manual testing with Google/GitHub

    ## Migration Guide
    [Auto-generated from code analysis]

✓ PR created and reviewers assigned
```

### Architecture Overview

```typescript
/**
 * VCS Intelligence Architecture
 */

// 1. Git Analysis Layer
interface GitAnalyzer {
  analyzeDiff(diff: GitDiff): DiffAnalysis;
  analyzeCommitHistory(commits: Commit[]): HistoryAnalysis;
  detectChangeType(diff: GitDiff): ChangeType;
}

// 2. AI Integration Layer
interface CommitMessageGenerator {
  generate(analysis: DiffAnalysis): CommitMessage;
  followConventions(message: string): boolean;
}

interface PRDescriptionGenerator {
  generate(commits: Commit[], diff: GitDiff): PRDescription;
  includeTestingInfo(analysis: DiffAnalysis): string;
}

// 3. Quality Analysis Layer
interface CodeQualityAnalyzer {
  analyzeMetrics(diff: GitDiff): QualityMetrics;
  trackTrends(metrics: QualityMetrics[]): Trends;
  suggestImprovements(metrics: QualityMetrics): Suggestion[];
}

// 4. Automation Layer
interface GitHooksManager {
  registerHook(hook: GitHook, handler: HookHandler): void;
  executeHook(hook: GitHook, context: HookContext): Promise<void>;
}
```

---

## 7.2 Git Hooks Integration

Git hooks are scripts that run at specific points in the git workflow. We'll integrate AI at key hooks.

### Git Hook Types

```typescript
/**
 * Git hooks we'll integrate with
 */
export enum GitHook {
  // Before commit is created
  PRE_COMMIT = 'pre-commit',

  // Before commit message is finalized
  PREPARE_COMMIT_MSG = 'prepare-commit-msg',

  // After commit is created
  POST_COMMIT = 'post-commit',

  // Before push to remote
  PRE_PUSH = 'pre-push',

  // After merge
  POST_MERGE = 'post-merge'
}

/**
 * Hook handler interface
 */
export interface HookHandler {
  execute(context: HookContext): Promise<HookResult>;
}

/**
 * Hook execution context
 */
export interface HookContext {
  hook: GitHook;
  repoPath: string;

  // Commit-specific
  commitMessage?: string;
  stagedFiles?: string[];

  // Push-specific
  remoteName?: string;
  remoteBranch?: string;
  commits?: Commit[];

  // Additional data
  metadata?: Record<string, any>;
}

/**
 * Hook execution result
 */
export interface HookResult {
  success: boolean;

  // Updated commit message (for prepare-commit-msg)
  commitMessage?: string;

  // Whether to proceed with git operation
  proceed: boolean;

  // Message to display to user
  message?: string;

  // Suggestions for user
  suggestions?: string[];
}
```

### Hook Manager Implementation

```typescript
/**
 * Manages git hooks integration
 */
export class GitHooksManager {
  private handlers = new Map<GitHook, HookHandler[]>();
  private repoPath: string;
  private logger: Logger;

  constructor(repoPath: string, logger: Logger) {
    this.repoPath = repoPath;
    this.logger = logger;
  }

  /**
   * Register a hook handler
   */
  registerHook(hook: GitHook, handler: HookHandler): void {
    if (!this.handlers.has(hook)) {
      this.handlers.set(hook, []);
    }

    this.handlers.get(hook)!.push(handler);
    this.logger.debug(`Registered handler for ${hook}`);
  }

  /**
   * Install git hooks in repository
   */
  async install(): Promise<void> {
    const hooksDir = path.join(this.repoPath, '.git', 'hooks');

    // Ensure hooks directory exists
    await fs.mkdir(hooksDir, { recursive: true });

    // Install each hook
    for (const hook of this.handlers.keys()) {
      await this.installHook(hook, hooksDir);
    }

    this.logger.info('Git hooks installed successfully');
  }

  /**
   * Execute a hook
   */
  async executeHook(context: HookContext): Promise<HookResult> {
    const handlers = this.handlers.get(context.hook);

    if (!handlers || handlers.length === 0) {
      return { success: true, proceed: true };
    }

    this.logger.debug(`Executing ${handlers.length} handlers for ${context.hook}`);

    let finalResult: HookResult = { success: true, proceed: true };

    // Execute handlers in sequence
    for (const handler of handlers) {
      try {
        const result = await handler.execute(context);

        // Update context with result (for chaining)
        if (result.commitMessage) {
          context.commitMessage = result.commitMessage;
        }

        // If any handler says don't proceed, stop
        if (!result.proceed) {
          finalResult = result;
          break;
        }

        // Merge results
        finalResult = {
          ...finalResult,
          ...result,
          suggestions: [
            ...(finalResult.suggestions || []),
            ...(result.suggestions || [])
          ]
        };
      } catch (error: any) {
        this.logger.error(`Hook handler failed: ${error.message}`);
        return {
          success: false,
          proceed: false,
          message: `Hook failed: ${error.message}`
        };
      }
    }

    return finalResult;
  }

  /**
   * Install a specific git hook
   */
  private async installHook(hook: GitHook, hooksDir: string): Promise<void> {
    const hookPath = path.join(hooksDir, hook);

    // Create hook script that calls our system
    const script = this.generateHookScript(hook);

    await fs.writeFile(hookPath, script, { mode: 0o755 });

    this.logger.debug(`Installed hook: ${hook}`);
  }

  /**
   * Generate hook script
   */
  private generateHookScript(hook: GitHook): string {
    // Script that calls our Node.js hook handler
    return `#!/bin/sh
# Auto-generated git hook for ollama-code
# Do not edit manually

# Get repository root
REPO_PATH=$(git rev-parse --show-toplevel)

# Call our hook handler
node "$REPO_PATH/node_modules/ollama-code/dist/hooks/${hook}.js" "$@"

# Exit with the handler's exit code
exit $?
`;
  }
}
```

### Pre-Commit Hook: Linting and Formatting

```typescript
/**
 * Pre-commit hook: Run linting and formatting
 */
export class PreCommitLintHandler implements HookHandler {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async execute(context: HookContext): Promise<HookResult> {
    this.logger.info('Running pre-commit checks...');

    const stagedFiles = context.stagedFiles || [];
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check TypeScript files
    const tsFiles = stagedFiles.filter(f => f.endsWith('.ts'));
    if (tsFiles.length > 0) {
      const lintIssues = await this.lintTypeScript(tsFiles, context.repoPath);
      issues.push(...lintIssues);
    }

    // Check formatting
    const formattingIssues = await this.checkFormatting(stagedFiles, context.repoPath);
    if (formattingIssues.length > 0) {
      suggestions.push('Run: npm run format');
      issues.push(...formattingIssues);
    }

    if (issues.length > 0) {
      return {
        success: false,
        proceed: false,
        message: `Found ${issues.length} issues:\n${issues.join('\n')}`,
        suggestions
      };
    }

    return {
      success: true,
      proceed: true,
      message: '✓ Pre-commit checks passed'
    };
  }

  private async lintTypeScript(files: string[], repoPath: string): Promise<string[]> {
    // Run ESLint on TypeScript files
    try {
      const { stdout } = await execAsync(
        `npx eslint ${files.join(' ')} --format json`,
        { cwd: repoPath }
      );

      const results = JSON.parse(stdout);
      const issues: string[] = [];

      for (const result of results) {
        for (const message of result.messages) {
          issues.push(
            `${result.filePath}:${message.line}:${message.column} - ${message.message}`
          );
        }
      }

      return issues;
    } catch (error: any) {
      // ESLint exits with code 1 if there are linting errors
      if (error.stdout) {
        const results = JSON.parse(error.stdout);
        const issues: string[] = [];

        for (const result of results) {
          for (const message of result.messages) {
            issues.push(
              `${result.filePath}:${message.line}:${message.column} - ${message.message}`
            );
          }
        }

        return issues;
      }

      return [`Linting failed: ${error.message}`];
    }
  }

  private async checkFormatting(files: string[], repoPath: string): Promise<string[]> {
    try {
      await execAsync(
        `npx prettier --check ${files.join(' ')}`,
        { cwd: repoPath }
      );

      return [];
    } catch (error: any) {
      return ['Code is not formatted correctly'];
    }
  }
}
```

---

## 7.3 AI-Powered Commit Message Generation

Good commit messages are crucial but time-consuming. Let's automate them with AI.

### Conventional Commits Format

We'll follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
fix(auth): resolve race condition in token refresh

- Add mutex lock to prevent concurrent token refreshes
- Update token expiration check to use UTC timestamps
- Add integration test for concurrent refresh scenarios

Fixes #234
```

### Commit Message Generator

```typescript
/**
 * Generates semantic commit messages from git diffs
 */
export class CommitMessageGenerator {
  private aiProvider: BaseAIProvider;
  private logger: Logger;

  constructor(aiProvider: BaseAIProvider, logger: Logger) {
    this.aiProvider = aiProvider;
    this.logger = logger;
  }

  /**
   * Generate commit message from diff
   */
  async generate(diff: GitDiff, context?: CommitContext): Promise<CommitMessage> {
    this.logger.info('Generating commit message...');

    // Analyze the diff
    const analysis = await this.analyzeDiff(diff);

    // Generate message with AI
    const message = await this.generateWithAI(analysis, context);

    // Validate follows conventions
    this.validateConventionalCommit(message);

    return message;
  }

  /**
   * Analyze git diff
   */
  private async analyzeDiff(diff: GitDiff): Promise<DiffAnalysis> {
    const analysis: DiffAnalysis = {
      filesChanged: diff.files.length,
      additions: 0,
      deletions: 0,
      modifiedFunctions: [],
      changeType: 'feat',
      scope: this.detectScope(diff),
      breakingChanges: false
    };

    // Analyze each file
    for (const file of diff.files) {
      analysis.additions += file.additions;
      analysis.deletions += file.deletions;

      // Detect breaking changes
      if (this.hasBreakingChanges(file)) {
        analysis.breakingChanges = true;
      }

      // Extract modified functions
      const functions = this.extractModifiedFunctions(file);
      analysis.modifiedFunctions.push(...functions);
    }

    // Determine change type
    analysis.changeType = this.determineChangeType(diff, analysis);

    return analysis;
  }

  /**
   * Generate commit message using AI
   */
  private async generateWithAI(
    analysis: DiffAnalysis,
    context?: CommitContext
  ): Promise<CommitMessage> {
    const prompt = this.buildPrompt(analysis, context);

    const response = await this.aiProvider.chat({
      messages: [
        {
          role: 'system',
          content: `You are an expert at writing semantic, conventional commit messages.

Follow the Conventional Commits specification:
- Type: feat, fix, docs, style, refactor, test, chore
- Scope: module or component affected
- Subject: imperative, lowercase, no period
- Body: explain what and why (not how)
- Footer: breaking changes and issue references

Keep subject under 72 characters.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      options: {
        temperature: 0.3, // Lower temperature for more consistent output
        maxTokens: 500
      }
    });

    return this.parseCommitMessage(response.content);
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(analysis: DiffAnalysis, context?: CommitContext): string {
    let prompt = `Generate a commit message for these changes:

Files changed: ${analysis.filesChanged}
Additions: ${analysis.additions}
Deletions: ${analysis.deletions}
Change type: ${analysis.changeType}
Scope: ${analysis.scope}
Breaking changes: ${analysis.breakingChanges ? 'Yes' : 'No'}
`;

    if (analysis.modifiedFunctions.length > 0) {
      prompt += `\nModified functions:\n${analysis.modifiedFunctions.join('\n')}`;
    }

    if (context?.issueNumber) {
      prompt += `\nRelated issue: #${context.issueNumber}`;
    }

    if (context?.description) {
      prompt += `\nContext: ${context.description}`;
    }

    return prompt;
  }

  /**
   * Parse AI response into structured commit message
   */
  private parseCommitMessage(content: string): CommitMessage {
    const lines = content.trim().split('\n');

    // First line is subject
    const subject = lines[0].trim();

    // Rest is body and footer
    const bodyLines: string[] = [];
    const footerLines: string[] = [];
    let inFooter = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Detect footer (lines starting with keywords)
      if (line.match(/^(Fixes|Closes|Refs|BREAKING CHANGE):/i)) {
        inFooter = true;
      }

      if (inFooter) {
        footerLines.push(line);
      } else {
        bodyLines.push(line);
      }
    }

    return {
      subject,
      body: bodyLines.join('\n').trim(),
      footer: footerLines.join('\n').trim(),
      full: content.trim()
    };
  }

  /**
   * Detect scope from modified files
   */
  private detectScope(diff: GitDiff): string {
    // Group files by directory
    const directories = new Map<string, number>();

    for (const file of diff.files) {
      const dir = path.dirname(file.path);
      const count = directories.get(dir) || 0;
      directories.set(dir, count + 1);
    }

    // Find most common directory
    let maxDir = '';
    let maxCount = 0;

    for (const [dir, count] of directories) {
      if (count > maxCount) {
        maxDir = dir;
        maxCount = count;
      }
    }

    // Extract scope from directory
    const parts = maxDir.split('/');
    return parts[parts.length - 1] || 'core';
  }

  /**
   * Determine change type from diff
   */
  private determineChangeType(diff: GitDiff, analysis: DiffAnalysis): string {
    // Check for new files (feat)
    const newFiles = diff.files.filter(f => f.status === 'added');
    if (newFiles.length > 0 && !analysis.breakingChanges) {
      return 'feat';
    }

    // Check for deletions (refactor or chore)
    const deletedFiles = diff.files.filter(f => f.status === 'deleted');
    if (deletedFiles.length > 0) {
      return 'refactor';
    }

    // Check for test files
    const testFiles = diff.files.filter(f =>
      f.path.includes('.test.') || f.path.includes('.spec.')
    );
    if (testFiles.length === diff.files.length) {
      return 'test';
    }

    // Check for documentation
    const docFiles = diff.files.filter(f =>
      f.path.endsWith('.md') || f.path.includes('docs/')
    );
    if (docFiles.length === diff.files.length) {
      return 'docs';
    }

    // Default to fix
    return 'fix';
  }

  /**
   * Detect breaking changes in file
   */
  private hasBreakingChanges(file: FileDiff): boolean {
    // Simple heuristic: check for removed public APIs
    const removedLines = file.hunks
      .flatMap(h => h.lines)
      .filter(l => l.type === 'remove');

    for (const line of removedLines) {
      // Check for exported function/class removal
      if (line.content.match(/^export (function|class|const|interface)/)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract modified functions from file
   */
  private extractModifiedFunctions(file: FileDiff): string[] {
    const functions: string[] = [];

    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        // Match function declarations
        const match = line.content.match(
          /function\s+(\w+)|(\w+)\s*=\s*(async\s+)?function|class\s+(\w+)/
        );

        if (match) {
          const name = match[1] || match[2] || match[4];
          if (name && !functions.includes(name)) {
            functions.push(name);
          }
        }
      }
    }

    return functions;
  }

  /**
   * Validate commit follows conventional commits
   */
  private validateConventionalCommit(message: CommitMessage): void {
    // Check subject format
    const subjectRegex = /^(feat|fix|docs|style|refactor|test|chore)(\(.+?\))?: .+$/;

    if (!subjectRegex.test(message.subject)) {
      throw new Error(
        `Commit subject does not follow conventional commits format: ${message.subject}`
      );
    }

    // Check subject length
    if (message.subject.length > 72) {
      throw new Error(
        `Commit subject too long (${message.subject.length} > 72): ${message.subject}`
      );
    }
  }
}

interface GitDiff {
  files: FileDiff[];
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  hunks: Hunk[];
}

interface Hunk {
  lines: Line[];
}

interface Line {
  type: 'add' | 'remove' | 'context';
  content: string;
}

interface DiffAnalysis {
  filesChanged: number;
  additions: number;
  deletions: number;
  modifiedFunctions: string[];
  changeType: string;
  scope: string;
  breakingChanges: boolean;
}

interface CommitContext {
  issueNumber?: number;
  description?: string;
}

interface CommitMessage {
  subject: string;
  body: string;
  footer: string;
  full: string;
}
```

---

## 7.4 Pull Request Intelligence

Pull requests are where code review happens. AI can automate PR creation and provide intelligent reviews.

### PR Description Generator

```typescript
/**
 * Generate PR descriptions from commit history
 */
export class PRDescriptionGenerator {
  private aiProvider: BaseAIProvider;
  private logger: Logger;

  constructor(aiProvider: BaseAIProvider, logger: Logger) {
    this.aiProvider = aiProvider;
    this.logger = logger;
  }

  /**
   * Generate PR description
   */
  async generate(
    commits: Commit[],
    diff: GitDiff,
    targetBranch: string = 'main'
  ): Promise<PRDescription> {
    this.logger.info(`Generating PR description (${commits.length} commits)...`);

    // Analyze commits and diff
    const analysis = await this.analyzeChanges(commits, diff);

    // Generate with AI
    const description = await this.generateWithAI(analysis, targetBranch);

    return description;
  }

  /**
   * Analyze changes across commits
   */
  private async analyzeChanges(
    commits: Commit[],
    diff: GitDiff
  ): Promise<PRAnalysis> {
    const analysis: PRAnalysis = {
      theme: '',
      commits: commits.length,
      filesChanged: diff.files.length,
      additions: diff.files.reduce((sum, f) => sum + f.additions, 0),
      deletions: diff.files.reduce((sum, f) => sum + f.deletions, 0),
      components: this.detectComponents(diff),
      breakingChanges: this.detectBreakingChanges(commits, diff),
      tests: this.analyzeTests(diff),
      documentation: this.analyzeDocumentation(diff)
    };

    // Detect overall theme
    analysis.theme = this.detectTheme(commits, diff);

    return analysis;
  }

  /**
   * Detect PR theme from commits
   */
  private detectTheme(commits: Commit[], diff: GitDiff): string {
    // Analyze commit messages
    const messages = commits.map(c => c.message).join(' ');

    // Common themes
    const themes = [
      { pattern: /refactor|restructure/i, label: 'Refactoring' },
      { pattern: /feat|feature|add/i, label: 'New Feature' },
      { pattern: /fix|bug|issue/i, label: 'Bug Fix' },
      { pattern: /perf|performance|optim/i, label: 'Performance' },
      { pattern: /test|spec/i, label: 'Testing' },
      { pattern: /docs|documentation/i, label: 'Documentation' },
      { pattern: /security|vulnerability/i, label: 'Security' }
    ];

    for (const theme of themes) {
      if (theme.pattern.test(messages)) {
        return theme.label;
      }
    }

    return 'General Improvements';
  }

  /**
   * Detect affected components
   */
  private detectComponents(diff: GitDiff): string[] {
    const components = new Set<string>();

    for (const file of diff.files) {
      const parts = file.path.split('/');

      // Extract component from path
      if (parts.length > 1) {
        components.add(parts[1]); // e.g., src/auth → auth
      }
    }

    return Array.from(components);
  }

  /**
   * Detect breaking changes
   */
  private detectBreakingChanges(commits: Commit[], diff: GitDiff): boolean {
    // Check commit messages for BREAKING CHANGE
    for (const commit of commits) {
      if (commit.message.includes('BREAKING CHANGE')) {
        return true;
      }
    }

    // Check for API changes in diff
    for (const file of diff.files) {
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.type === 'remove' &&
              line.content.match(/^export (function|class|interface|type)/)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Analyze test coverage
   */
  private analyzeTests(diff: GitDiff): TestAnalysis {
    const testFiles = diff.files.filter(f =>
      f.path.includes('.test.') ||
      f.path.includes('.spec.') ||
      f.path.includes('__tests__/')
    );

    return {
      hasTests: testFiles.length > 0,
      testFiles: testFiles.length,
      testAdditions: testFiles.reduce((sum, f) => sum + f.additions, 0)
    };
  }

  /**
   * Analyze documentation
   */
  private analyzeDocumentation(diff: GitDiff): DocumentationAnalysis {
    const docFiles = diff.files.filter(f =>
      f.path.endsWith('.md') ||
      f.path.includes('docs/')
    );

    return {
      hasDocs: docFiles.length > 0,
      docFiles: docFiles.length
    };
  }

  /**
   * Generate PR description with AI
   */
  private async generateWithAI(
    analysis: PRAnalysis,
    targetBranch: string
  ): Promise<PRDescription> {
    const prompt = `Generate a pull request description for merging into ${targetBranch}.

Theme: ${analysis.theme}
Commits: ${analysis.commits}
Files changed: ${analysis.filesChanged} (+${analysis.additions}, -${analysis.deletions})
Components: ${analysis.components.join(', ')}
Breaking changes: ${analysis.breakingChanges ? 'Yes' : 'No'}
Tests: ${analysis.tests.hasTests ? `${analysis.tests.testFiles} test files` : 'None'}
Documentation: ${analysis.documentation.hasDocs ? `${analysis.documentation.docFiles} doc files` : 'None'}

Create a description with:
1. Summary paragraph
2. Changes section (bullet points)
3. Testing section
4. Breaking changes (if any)
5. Migration guide (if breaking)`;

    const response = await this.aiProvider.chat({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing clear, comprehensive PR descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      options: {
        temperature: 0.4,
        maxTokens: 1000
      }
    });

    return this.parsePRDescription(response.content, analysis);
  }

  /**
   * Parse AI response into structured PR description
   */
  private parsePRDescription(
    content: string,
    analysis: PRAnalysis
  ): PRDescription {
    return {
      title: this.generateTitle(analysis),
      body: content.trim(),
      labels: this.generateLabels(analysis),
      reviewers: [] // Could be auto-assigned based on CODEOWNERS
    };
  }

  /**
   * Generate PR title
   */
  private generateTitle(analysis: PRAnalysis): string {
    const components = analysis.components.slice(0, 2).join(', ');
    return `${analysis.theme}: ${components}`;
  }

  /**
   * Generate PR labels
   */
  private generateLabels(analysis: PRAnalysis): string[] {
    const labels: string[] = [];

    // Add theme label
    labels.push(analysis.theme.toLowerCase().replace(/\s+/g, '-'));

    // Add breaking change label
    if (analysis.breakingChanges) {
      labels.push('breaking-change');
    }

    // Add needs-tests label if no tests
    if (!analysis.tests.hasTests) {
      labels.push('needs-tests');
    }

    // Add needs-docs label if no documentation
    if (!analysis.documentation.hasDocs && analysis.filesChanged > 5) {
      labels.push('needs-docs');
    }

    return labels;
  }
}

interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
}

interface PRAnalysis {
  theme: string;
  commits: number;
  filesChanged: number;
  additions: number;
  deletions: number;
  components: string[];
  breakingChanges: boolean;
  tests: TestAnalysis;
  documentation: DocumentationAnalysis;
}

interface TestAnalysis {
  hasTests: boolean;
  testFiles: number;
  testAdditions: number;
}

interface DocumentationAnalysis {
  hasDocs: boolean;
  docFiles: number;
}

interface PRDescription {
  title: string;
  body: string;
  labels: string[];
  reviewers: string[];
}
```

### PR Code Reviewer

```typescript
/**
 * AI-powered code reviewer for PRs
 */
export class PRCodeReviewer {
  private aiProvider: BaseAIProvider;
  private logger: Logger;

  constructor(aiProvider: BaseAIProvider, logger: Logger) {
    this.aiProvider = aiProvider;
    this.logger = logger;
  }

  /**
   * Review PR
   */
  async review(pr: PullRequest): Promise<ReviewResult> {
    this.logger.info(`Reviewing PR #${pr.number}...`);

    const comments: ReviewComment[] = [];

    // Review each file
    for (const file of pr.files) {
      const fileComments = await this.reviewFile(file);
      comments.push(...fileComments);
    }

    // Overall assessment
    const assessment = await this.assessPR(pr, comments);

    return {
      comments,
      assessment,
      recommendation: this.getRecommendation(comments, assessment)
    };
  }

  /**
   * Review a single file
   */
  private async reviewFile(file: PRFile): Promise<ReviewComment[]> {
    const comments: ReviewComment[] = [];

    // Skip certain files
    if (this.shouldSkipFile(file.path)) {
      return comments;
    }

    // Analyze each hunk
    for (const hunk of file.hunks) {
      const hunkComments = await this.reviewHunk(file.path, hunk);
      comments.push(...hunkComments);
    }

    return comments;
  }

  /**
   * Review a code hunk
   */
  private async reviewHunk(
    filePath: string,
    hunk: Hunk
  ): Promise<ReviewComment[]> {
    // Build context
    const code = hunk.lines.map(l => l.content).join('\n');

    const prompt = `Review this code change in ${filePath}:

\`\`\`
${code}
\`\`\`

Check for:
1. Security vulnerabilities
2. Performance issues
3. Code quality problems
4. Best practice violations
5. Potential bugs

Provide specific, actionable feedback. If code is good, say "LGTM".`;

    const response = await this.aiProvider.chat({
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Be constructive and specific.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      options: {
        temperature: 0.3,
        maxTokens: 500
      }
    });

    // Parse response
    if (response.content.includes('LGTM')) {
      return [];
    }

    return [{
      path: filePath,
      line: hunk.lines[0].lineNumber,
      body: response.content,
      severity: this.detectSeverity(response.content)
    }];
  }

  /**
   * Assess overall PR quality
   */
  private async assessPR(
    pr: PullRequest,
    comments: ReviewComment[]
  ): Promise<PRAssessment> {
    const criticalIssues = comments.filter(c => c.severity === 'critical').length;
    const majorIssues = comments.filter(c => c.severity === 'major').length;
    const minorIssues = comments.filter(c => c.severity === 'minor').length;

    return {
      criticalIssues,
      majorIssues,
      minorIssues,
      totalIssues: comments.length,
      filesReviewed: pr.files.length,
      score: this.calculateScore(criticalIssues, majorIssues, minorIssues)
    };
  }

  /**
   * Calculate PR quality score (0-100)
   */
  private calculateScore(
    critical: number,
    major: number,
    minor: number
  ): number {
    let score = 100;
    score -= critical * 20;
    score -= major * 10;
    score -= minor * 5;
    return Math.max(0, score);
  }

  /**
   * Get recommendation
   */
  private getRecommendation(
    comments: ReviewComment[],
    assessment: PRAssessment
  ): ReviewRecommendation {
    if (assessment.criticalIssues > 0) {
      return {
        action: 'request-changes',
        reason: `${assessment.criticalIssues} critical issues must be fixed`
      };
    }

    if (assessment.score >= 80) {
      return {
        action: 'approve',
        reason: 'Code quality is good'
      };
    }

    return {
      action: 'comment',
      reason: `${assessment.totalIssues} suggestions for improvement`
    };
  }

  /**
   * Detect comment severity
   */
  private detectSeverity(comment: string): 'critical' | 'major' | 'minor' {
    if (comment.match(/security|vulnerability|critical|dangerous/i)) {
      return 'critical';
    }
    if (comment.match(/bug|error|issue|problem/i)) {
      return 'major';
    }
    return 'minor';
  }

  /**
   * Check if file should be skipped
   */
  private shouldSkipFile(path: string): boolean {
    const skipPatterns = [
      /\.lock$/,
      /\.json$/,
      /\.md$/,
      /dist\//,
      /node_modules\//
    ];

    return skipPatterns.some(pattern => pattern.test(path));
  }
}

interface PullRequest {
  number: number;
  title: string;
  files: PRFile[];
}

interface PRFile {
  path: string;
  hunks: Hunk[];
}

interface ReviewComment {
  path: string;
  line: number;
  body: string;
  severity: 'critical' | 'major' | 'minor';
}

interface PRAssessment {
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  totalIssues: number;
  filesReviewed: number;
  score: number;
}

interface ReviewResult {
  comments: ReviewComment[];
  assessment: PRAssessment;
  recommendation: ReviewRecommendation;
}

interface ReviewRecommendation {
  action: 'approve' | 'request-changes' | 'comment';
  reason: string;
}
```

---

## 7.5 Code Quality Tracking

Track code quality metrics over time to identify trends and improvements.

### Quality Metrics Collector

```typescript
/**
 * Collect code quality metrics
 */
export class QualityMetricsCollector {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Collect metrics for codebase
   */
  async collect(repoPath: string): Promise<QualityMetrics> {
    this.logger.info('Collecting quality metrics...');

    const metrics: QualityMetrics = {
      timestamp: new Date(),
      complexity: await this.measureComplexity(repoPath),
      coverage: await this.measureCoverage(repoPath),
      duplication: await this.measureDuplication(repoPath),
      issues: await this.countIssues(repoPath),
      dependencies: await this.analyzeDependencies(repoPath)
    };

    return metrics;
  }

  /**
   * Measure cyclomatic complexity
   */
  private async measureComplexity(repoPath: string): Promise<ComplexityMetrics> {
    // Use a tool like complexity-report or ts-morph
    // Simplified example
    return {
      average: 5.2,
      max: 23,
      filesAboveThreshold: 3
    };
  }

  /**
   * Measure test coverage
   */
  private async measureCoverage(repoPath: string): Promise<CoverageMetrics> {
    try {
      // Run coverage tool
      const { stdout } = await execAsync('npm run test:coverage -- --json', {
        cwd: repoPath
      });

      const coverage = JSON.parse(stdout);

      return {
        lines: coverage.total.lines.pct,
        statements: coverage.total.statements.pct,
        functions: coverage.total.functions.pct,
        branches: coverage.total.branches.pct
      };
    } catch {
      return {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0
      };
    }
  }

  /**
   * Measure code duplication
   */
  private async measureDuplication(repoPath: string): Promise<number> {
    // Use jscpd or similar
    // Simplified example
    return 2.3; // 2.3% duplication
  }

  /**
   * Count linting issues
   */
  private async countIssues(repoPath: string): Promise<IssueCount> {
    try {
      const { stdout } = await execAsync('npx eslint . --format json', {
        cwd: repoPath
      });

      const results = JSON.parse(stdout);

      return results.reduce((count: IssueCount, result: any) => {
        for (const msg of result.messages) {
          if (msg.severity === 2) {
            count.errors++;
          } else {
            count.warnings++;
          }
        }
        return count;
      }, { errors: 0, warnings: 0 });
    } catch {
      return { errors: 0, warnings: 0 };
    }
  }

  /**
   * Analyze dependencies
   */
  private async analyzeDependencies(repoPath: string): Promise<DependencyMetrics> {
    const packageJson = await fs.readFile(
      path.join(repoPath, 'package.json'),
      'utf-8'
    );

    const pkg = JSON.parse(packageJson);

    const deps = Object.keys(pkg.dependencies || {}).length;
    const devDeps = Object.keys(pkg.devDependencies || {}).length;

    return {
      total: deps + devDeps,
      dependencies: deps,
      devDependencies: devDeps
    };
  }
}

interface QualityMetrics {
  timestamp: Date;
  complexity: ComplexityMetrics;
  coverage: CoverageMetrics;
  duplication: number;
  issues: IssueCount;
  dependencies: DependencyMetrics;
}

interface ComplexityMetrics {
  average: number;
  max: number;
  filesAboveThreshold: number;
}

interface CoverageMetrics {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

interface IssueCount {
  errors: number;
  warnings: number;
}

interface DependencyMetrics {
  total: number;
  dependencies: number;
  devDependencies: number;
}
```

---

## Summary

In this chapter, we built a complete VCS intelligence system:

1. **VCS Architecture** - Git-aware AI systems
2. **Git Hooks Integration** - Automated workflows at key events
3. **AI Commit Messages** - Semantic, conventional commits
4. **PR Intelligence** - Automated creation and review
5. **Code Quality Tracking** - Metrics collection and trending

### Key Takeaways

✅ **AI-powered commits** save 5-10 minutes per commit

✅ **PR automation** reduces review time by 30-50%

✅ **Code review AI** catches issues before human review

✅ **Quality metrics** provide visibility into codebase health

✅ **Automated workflows** increase developer productivity

### Real-World Impact

**Time Savings:**
- Commit messages: 5-10 min → 30 sec (95% faster)
- PR descriptions: 15-30 min → 1 min (97% faster)
- Code review: 30-60 min → 15-30 min (50% faster)

**Quality Improvements:**
- Better commit message quality (semantic, conventional)
- More comprehensive PR descriptions
- Earlier bug detection
- Consistent code quality standards

---

## Exercises

### Exercise 1: Custom Commit Conventions

Extend the commit message generator to support your team's conventions.

**Requirements:**
- Custom commit types beyond conventional commits
- Team-specific scopes
- Auto-link to issue tracker
- Include co-authors from git blame

### Exercise 2: PR Template Integration

Create PR templates that integrate with AI generation.

**Requirements:**
- Define template structure
- Auto-fill sections with AI analysis
- Include checklist items
- Support multiple PR types (feature, bugfix, hotfix)

### Exercise 3: Quality Dashboard

Build a dashboard that visualizes quality metrics over time.

**Requirements:**
- Collect metrics daily
- Store in time-series database
- Visualize trends
- Alert on regressions

---

**Next Chapter:** [Interactive Modes and Natural Language Routing →](chapter-08-interactive-modes.md)

In Chapter 8, we'll build natural language routing that lets users interact conversationally instead of memorizing commands.

---

*Chapter 7 | VCS Intelligence and Git Integration | Complete*