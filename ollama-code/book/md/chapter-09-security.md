# Chapter 9: Security, Privacy, and Sandboxing

> *"Security is not a product, but a process." — Bruce Schneier*

---

## Table of Contents

- [9.1 Security Overview](#91-security-overview)
- [9.2 Sandboxed Execution](#92-sandboxed-execution)
- [9.3 Credential Management](#93-credential-management)
- [9.4 Input Validation and Sanitization](#94-input-validation-and-sanitization)
- [9.5 Rate Limiting and Quotas](#95-rate-limiting-and-quotas)
- [9.6 Privacy-Preserving AI Interactions](#96-privacy-preserving-ai-interactions)
- [9.7 Audit Logging and Compliance](#97-audit-logging-and-compliance)
- [9.8 Security Best Practices](#98-security-best-practices)
- [Exercises](#exercises)
- [Summary](#summary)

---

## 9.1 Security Overview

AI coding assistants have significant power over your codebase and infrastructure. Without proper security controls, they can:

- Execute arbitrary commands
- Access sensitive files and credentials
- Modify or delete critical code
- Expose private data to AI providers
- Exceed budget limits
- Violate compliance requirements

This chapter builds comprehensive security controls to make your AI assistant safe for production use.

### Threat Model

```typescript
/**
 * Security threats for AI coding assistants
 */
export enum ThreatCategory {
  /** Unauthorized access to files, credentials, or systems */
  UNAUTHORIZED_ACCESS = 'unauthorized_access',

  /** Execution of destructive operations */
  DESTRUCTIVE_OPERATIONS = 'destructive_operations',

  /** Data leakage to AI providers or logs */
  DATA_LEAKAGE = 'data_leakage',

  /** Resource exhaustion (API calls, disk, memory) */
  RESOURCE_EXHAUSTION = 'resource_exhaustion',

  /** Injection attacks through prompts or parameters */
  INJECTION_ATTACKS = 'injection_attacks',

  /** Privilege escalation */
  PRIVILEGE_ESCALATION = 'privilege_escalation'
}

export interface Threat {
  category: ThreatCategory;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string[];
  examples: string[];
}
```

### Common Threats

```typescript
const threats: Threat[] = [
  {
    category: ThreatCategory.DESTRUCTIVE_OPERATIONS,
    description: 'AI executes commands that delete or corrupt data',
    severity: 'critical',
    mitigation: [
      'Require approval for destructive operations',
      'Implement sandboxing',
      'Use read-only mode by default',
      'Maintain audit trail'
    ],
    examples: [
      'DROP DATABASE production',
      'rm -rf /',
      'git push --force origin main',
      'DELETE FROM users'
    ]
  },
  {
    category: ThreatCategory.DATA_LEAKAGE,
    description: 'Sensitive data sent to AI providers or logged',
    severity: 'critical',
    mitigation: [
      'Filter sensitive patterns before AI calls',
      'Encrypt credentials at rest',
      'Redact logs',
      'Use private AI deployments for sensitive data'
    ],
    examples: [
      'API keys in code review',
      'Database passwords in logs',
      'Customer PII in prompts',
      'Private tokens in conversation history'
    ]
  },
  {
    category: ThreatCategory.UNAUTHORIZED_ACCESS,
    description: 'Access to files or systems outside allowed scope',
    severity: 'high',
    mitigation: [
      'Implement path allowlist/blocklist',
      'Use principle of least privilege',
      'Sandbox file system access',
      'Validate all paths'
    ],
    examples: [
      'Reading /etc/shadow',
      'Accessing ~/.ssh/id_rsa',
      'Reading .env files',
      'Accessing parent directories'
    ]
  },
  {
    category: ThreatCategory.RESOURCE_EXHAUSTION,
    description: 'Excessive API calls or resource usage',
    severity: 'medium',
    mitigation: [
      'Implement rate limiting',
      'Set budget caps',
      'Monitor usage',
      'Use request queuing'
    ],
    examples: [
      'Infinite loop calling AI',
      'Processing entire codebase repeatedly',
      'Exhausting API quotas',
      'Memory leaks from large conversations'
    ]
  }
];
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Input                              │
│           "Delete old database backups"                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Input Validation                           │
│  • Sanitize input                                            │
│  • Detect injection attempts                                 │
│  • Check against allowed patterns                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Privacy Filter                              │
│  • Redact secrets (API keys, passwords)                      │
│  • Remove PII                                                │
│  • Filter sensitive paths                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   AI Processing                              │
│  [Safe to send to AI provider]                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Operation Classification                        │
│  Classify: READ | WRITE | DELETE | EXECUTE                  │
│  Risk level: SAFE | LOW | MEDIUM | HIGH | CRITICAL          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Approval Gate                                │
│  • Auto-approve: SAFE, LOW risk operations                  │
│  • Require approval: MEDIUM+ risk                            │
│  • Require 2FA: CRITICAL risk                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Sandboxed Execution                           │
│  • Path restrictions (allowlist/blocklist)                   │
│  • Resource limits (CPU, memory, time)                       │
│  • Network isolation (optional)                              │
│  • Capability restrictions                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Audit Logging                              │
│  • Log all operations                                        │
│  • Redact sensitive data                                     │
│  • Include context and outcome                               │
│  • Enable forensics                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 9.2 Sandboxed Execution

Sandboxing restricts what operations the AI can perform, preventing unauthorized access and destructive actions.

### Sandbox Configuration

```typescript
/**
 * Sandbox configuration for execution environment
 */
export interface SandboxConfig {
  /** Allowed file paths (glob patterns) */
  allowedPaths?: string[];

  /** Blocked file paths (glob patterns) - takes precedence */
  blockedPaths?: string[];

  /** Allowed commands to execute */
  allowedCommands?: string[];

  /** Maximum execution time per operation (ms) */
  maxExecutionTime?: number;

  /** Maximum memory usage (bytes) */
  maxMemory?: number;

  /** Maximum disk space usage (bytes) */
  maxDiskUsage?: number;

  /** Network access allowed */
  allowNetwork?: boolean;

  /** Environment variables to expose */
  allowedEnvVars?: string[];

  /** Working directory restriction */
  workingDirectory?: string;

  /** Read-only mode (no writes allowed) */
  readOnly?: boolean;
}

/**
 * Default secure sandbox configuration
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  allowedPaths: [
    'src/**/*',
    'test/**/*',
    'lib/**/*',
    'docs/**/*',
    'package.json',
    'tsconfig.json',
    'README.md'
  ],
  blockedPaths: [
    '.env',
    '.env.*',
    '**/.env',
    '**/*.key',
    '**/*.pem',
    '**/*.p12',
    '**/id_rsa',
    '**/id_dsa',
    '**/*_key',
    '**/credentials.*',
    '**/secrets.*',
    '.git/config',
    '.ssh/**/*',
    '/etc/**/*',
    '/var/**/*',
    '/usr/**/*',
    '/home/*/.ssh/**/*',
    'node_modules/**/*'
  ],
  allowedCommands: [
    'git status',
    'git diff',
    'git log',
    'npm test',
    'npm run test',
    'yarn test',
    'ls',
    'cat',
    'grep'
  ],
  maxExecutionTime: 30000, // 30 seconds
  maxMemory: 512 * 1024 * 1024, // 512 MB
  maxDiskUsage: 100 * 1024 * 1024, // 100 MB
  allowNetwork: false,
  allowedEnvVars: ['NODE_ENV', 'PATH'],
  readOnly: false
};
```

### Sandbox Validator

```typescript
import { minimatch } from 'minimatch';
import path from 'path';

/**
 * Validates operations against sandbox rules
 */
export class SandboxValidator {
  constructor(private config: SandboxConfig) {}

  /**
   * Check if file path is allowed
   */
  isPathAllowed(filePath: string): ValidationResult {
    const normalizedPath = path.normalize(filePath);

    // Check if path escapes working directory
    if (this.config.workingDirectory) {
      const resolved = path.resolve(this.config.workingDirectory, normalizedPath);
      if (!resolved.startsWith(this.config.workingDirectory)) {
        return {
          allowed: false,
          reason: 'Path escapes working directory',
          severity: 'critical'
        };
      }
    }

    // Check blocked paths first (takes precedence)
    if (this.config.blockedPaths) {
      for (const pattern of this.config.blockedPaths) {
        if (minimatch(normalizedPath, pattern)) {
          return {
            allowed: false,
            reason: `Path matches blocked pattern: ${pattern}`,
            severity: 'high'
          };
        }
      }
    }

    // Check allowed paths
    if (this.config.allowedPaths) {
      let matched = false;

      for (const pattern of this.config.allowedPaths) {
        if (minimatch(normalizedPath, pattern)) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        return {
          allowed: false,
          reason: 'Path not in allowed list',
          severity: 'medium'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if command is allowed
   */
  isCommandAllowed(command: string): ValidationResult {
    if (!this.config.allowedCommands) {
      // If no allowlist, reject all commands
      return {
        allowed: false,
        reason: 'Command execution not allowed',
        severity: 'high'
      };
    }

    // Extract base command (first word)
    const baseCommand = command.trim().split(/\s+/)[0];

    // Check if command is in allowlist
    const allowed = this.config.allowedCommands.some(allowedCmd => {
      // Exact match
      if (command === allowedCmd) return true;

      // Prefix match (e.g., "git" allows "git status")
      if (command.startsWith(allowedCmd + ' ')) return true;

      // Base command match
      if (baseCommand === allowedCmd) return true;

      return false;
    });

    if (!allowed) {
      return {
        allowed: false,
        reason: `Command not in allowed list: ${baseCommand}`,
        severity: 'high'
      };
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /rm\s+-rf/,
      /dd\s+if=/,
      /mkfs/,
      /:\(\)\{.*\}:/,  // Fork bomb
      />\s*\/dev\/sd/,
      /curl.*\|\s*sh/,
      /wget.*\|\s*sh/,
      /sudo/,
      /chmod\s+777/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          reason: 'Command contains dangerous pattern',
          severity: 'critical'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if operation is allowed in read-only mode
   */
  isWriteAllowed(operation: 'create' | 'update' | 'delete'): ValidationResult {
    if (this.config.readOnly) {
      return {
        allowed: false,
        reason: 'Sandbox is in read-only mode',
        severity: 'medium'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if network access is allowed
   */
  isNetworkAllowed(url: string): ValidationResult {
    if (!this.config.allowNetwork) {
      return {
        allowed: false,
        reason: 'Network access not allowed',
        severity: 'medium'
      };
    }

    return { allowed: true };
  }
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

### Sandboxed File System

```typescript
import fs from 'fs/promises';

/**
 * Sandboxed file system operations
 */
export class SandboxedFileSystem {
  private validator: SandboxValidator;
  private logger: Logger;

  constructor(
    config: SandboxConfig,
    logger: Logger
  ) {
    this.validator = new SandboxValidator(config);
    this.logger = logger;
  }

  /**
   * Read file with sandbox validation
   */
  async readFile(filePath: string): Promise<string> {
    // Validate path
    const validation = this.validator.isPathAllowed(filePath);

    if (!validation.allowed) {
      this.logger.warn('Blocked file read:', {
        path: filePath,
        reason: validation.reason
      });

      throw new SecurityError(
        `Access denied: ${validation.reason}`,
        validation.severity || 'medium'
      );
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      this.logger.debug('File read:', { path: filePath, size: content.length });

      return content;

    } catch (error) {
      this.logger.error('File read error:', { path: filePath, error });
      throw error;
    }
  }

  /**
   * Write file with sandbox validation
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    // Validate write allowed
    const writeValidation = this.validator.isWriteAllowed('create');

    if (!writeValidation.allowed) {
      throw new SecurityError(
        `Write denied: ${writeValidation.reason}`,
        writeValidation.severity || 'medium'
      );
    }

    // Validate path
    const pathValidation = this.validator.isPathAllowed(filePath);

    if (!pathValidation.allowed) {
      this.logger.warn('Blocked file write:', {
        path: filePath,
        reason: pathValidation.reason
      });

      throw new SecurityError(
        `Access denied: ${pathValidation.reason}`,
        pathValidation.severity || 'medium'
      );
    }

    try {
      await fs.writeFile(filePath, content, 'utf-8');

      this.logger.info('File written:', {
        path: filePath,
        size: content.length
      });

    } catch (error) {
      this.logger.error('File write error:', { path: filePath, error });
      throw error;
    }
  }

  /**
   * Delete file with sandbox validation
   */
  async deleteFile(filePath: string): Promise<void> {
    // Validate write allowed
    const writeValidation = this.validator.isWriteAllowed('delete');

    if (!writeValidation.allowed) {
      throw new SecurityError(
        `Delete denied: ${writeValidation.reason}`,
        writeValidation.severity || 'medium'
      );
    }

    // Validate path
    const pathValidation = this.validator.isPathAllowed(filePath);

    if (!pathValidation.allowed) {
      this.logger.warn('Blocked file delete:', {
        path: filePath,
        reason: pathValidation.reason
      });

      throw new SecurityError(
        `Access denied: ${pathValidation.reason}`,
        pathValidation.severity || 'medium'
      );
    }

    try {
      await fs.unlink(filePath);

      this.logger.warn('File deleted:', { path: filePath });

    } catch (error) {
      this.logger.error('File delete error:', { path: filePath, error });
      throw error;
    }
  }

  /**
   * List directory with sandbox validation
   */
  async listDirectory(dirPath: string): Promise<string[]> {
    const validation = this.validator.isPathAllowed(dirPath);

    if (!validation.allowed) {
      throw new SecurityError(
        `Access denied: ${validation.reason}`,
        validation.severity || 'medium'
      );
    }

    const entries = await fs.readdir(dirPath);

    // Filter entries by sandbox rules
    const allowed: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryValidation = this.validator.isPathAllowed(fullPath);

      if (entryValidation.allowed) {
        allowed.push(entry);
      }
    }

    return allowed;
  }
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}
```

### Sandboxed Command Execution

```typescript
import { spawn } from 'child_process';

/**
 * Sandboxed command execution with resource limits
 */
export class SandboxedExecutor {
  private validator: SandboxValidator;
  private logger: Logger;

  constructor(
    private config: SandboxConfig,
    logger: Logger
  ) {
    this.validator = new SandboxValidator(config);
    this.logger = logger;
  }

  /**
   * Execute command with sandbox restrictions
   */
  async execute(command: string, cwd?: string): Promise<ExecutionResult> {
    // Validate command
    const validation = this.validator.isCommandAllowed(command);

    if (!validation.allowed) {
      this.logger.warn('Blocked command execution:', {
        command,
        reason: validation.reason
      });

      throw new SecurityError(
        `Command denied: ${validation.reason}`,
        validation.severity || 'high'
      );
    }

    // Validate working directory
    if (cwd) {
      const cwdValidation = this.validator.isPathAllowed(cwd);

      if (!cwdValidation.allowed) {
        throw new SecurityError(
          `Working directory denied: ${cwdValidation.reason}`,
          cwdValidation.severity || 'medium'
        );
      }
    }

    this.logger.info('Executing command:', { command, cwd });

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Parse command
      const args = command.split(/\s+/);
      const cmd = args[0];
      const cmdArgs = args.slice(1);

      // Spawn process
      const proc = spawn(cmd, cmdArgs, {
        cwd: cwd || this.config.workingDirectory,
        env: this.getFilteredEnv(),
        timeout: this.config.maxExecutionTime,
        maxBuffer: this.config.maxMemory
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', data => {
        stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        stderr += data.toString();
      });

      proc.on('error', error => {
        this.logger.error('Command execution error:', {
          command,
          error
        });

        reject(new SecurityError(
          `Execution failed: ${error.message}`,
          'medium'
        ));
      });

      proc.on('exit', (code, signal) => {
        const duration = Date.now() - startTime;

        this.logger.info('Command completed:', {
          command,
          code,
          signal,
          duration
        });

        resolve({
          success: code === 0,
          exitCode: code || 0,
          stdout,
          stderr,
          duration
        });
      });

      // Timeout handler
      if (this.config.maxExecutionTime) {
        setTimeout(() => {
          proc.kill('SIGTERM');

          setTimeout(() => {
            proc.kill('SIGKILL');
          }, 5000); // Force kill after 5s

        }, this.config.maxExecutionTime);
      }
    });
  }

  /**
   * Get filtered environment variables
   */
  private getFilteredEnv(): NodeJS.ProcessEnv {
    if (!this.config.allowedEnvVars) {
      return {};
    }

    const filtered: NodeJS.ProcessEnv = {};

    for (const key of this.config.allowedEnvVars) {
      if (process.env[key] !== undefined) {
        filtered[key] = process.env[key];
      }
    }

    return filtered;
  }
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}
```

---

## 9.3 Credential Management

Secure storage and handling of API keys, passwords, and other credentials is critical.

### Credential Encryption

```typescript
import crypto from 'crypto';

/**
 * Encrypts and decrypts credentials using AES-256-GCM
 */
export class CredentialEncryption {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits

  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        100000, // iterations
        this.keyLength,
        'sha256',
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    });
  }

  /**
   * Encrypt credential
   */
  async encrypt(
    credential: string,
    password: string
  ): Promise<EncryptedCredential> {
    // Generate random salt and IV
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);

    // Derive key from password
    const key = await this.deriveKey(password, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt
    let encrypted = cipher.update(credential, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }

  /**
   * Decrypt credential
   */
  async decrypt(
    encryptedCredential: EncryptedCredential,
    password: string
  ): Promise<string> {
    // Convert from hex
    const salt = Buffer.from(encryptedCredential.salt, 'hex');
    const iv = Buffer.from(encryptedCredential.iv, 'hex');
    const authTag = Buffer.from(encryptedCredential.authTag, 'hex');

    // Derive key
    const key = await this.deriveKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encryptedCredential.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export interface EncryptedCredential {
  encrypted: string;
  salt: string;
  iv: string;
  authTag: string;
  algorithm: string;
}
```

### Credential Store

```typescript
import fs from 'fs/promises';
import os from 'os';

/**
 * Secure credential storage
 */
export class CredentialStore {
  private encryption: CredentialEncryption;
  private storePath: string;
  private masterPassword: string;
  private cache: Map<string, string> = new Map();

  constructor(
    storePath?: string,
    masterPassword?: string
  ) {
    this.encryption = new CredentialEncryption();
    this.storePath = storePath || path.join(os.homedir(), '.ollama-code', 'credentials.enc');
    this.masterPassword = masterPassword || this.getMasterPassword();
  }

  /**
   * Get master password from environment or keychain
   */
  private getMasterPassword(): string {
    // Try environment variable first
    const envPassword = process.env.OLLAMA_CODE_MASTER_PASSWORD;
    if (envPassword) {
      return envPassword;
    }

    // TODO: Integrate with OS keychain
    // - macOS: Keychain Access
    // - Windows: Credential Manager
    // - Linux: Secret Service API

    throw new Error(
      'Master password not set. Set OLLAMA_CODE_MASTER_PASSWORD environment variable.'
    );
  }

  /**
   * Store credential
   */
  async set(key: string, value: string): Promise<void> {
    // Encrypt credential
    const encrypted = await this.encryption.encrypt(value, this.masterPassword);

    // Load existing store
    const store = await this.load();

    // Add encrypted credential
    store[key] = encrypted;

    // Save store
    await this.save(store);

    // Update cache
    this.cache.set(key, value);
  }

  /**
   * Get credential
   */
  async get(key: string): Promise<string | null> {
    // Check cache
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Load store
    const store = await this.load();

    // Get encrypted credential
    const encrypted = store[key];

    if (!encrypted) {
      return null;
    }

    // Decrypt
    const decrypted = await this.encryption.decrypt(encrypted, this.masterPassword);

    // Cache
    this.cache.set(key, decrypted);

    return decrypted;
  }

  /**
   * Delete credential
   */
  async delete(key: string): Promise<void> {
    // Load store
    const store = await this.load();

    // Remove credential
    delete store[key];

    // Save
    await this.save(store);

    // Clear cache
    this.cache.delete(key);
  }

  /**
   * List credential keys (not values)
   */
  async list(): Promise<string[]> {
    const store = await this.load();
    return Object.keys(store);
  }

  /**
   * Load credential store from disk
   */
  private async load(): Promise<Record<string, EncryptedCredential>> {
    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Store doesn't exist yet
      return {};
    }
  }

  /**
   * Save credential store to disk
   */
  private async save(store: Record<string, EncryptedCredential>): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.storePath);
    await fs.mkdir(dir, { recursive: true });

    // Write with restrictive permissions
    await fs.writeFile(
      this.storePath,
      JSON.stringify(store, null, 2),
      { mode: 0o600 } // Owner read/write only
    );
  }

  /**
   * Clear cache (for security)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
```

### Credential Usage

```typescript
/**
 * Example: Storing and using API keys
 */

// Initialize credential store
const credentialStore = new CredentialStore();

// Store API keys (one-time setup)
await credentialStore.set('anthropic_api_key', 'sk-ant-...');
await credentialStore.set('openai_api_key', 'sk-...');
await credentialStore.set('github_token', 'ghp_...');

// Retrieve API key when needed
const anthropicKey = await credentialStore.get('anthropic_api_key');

// Use with AI provider
const provider = new AnthropicProvider({
  apiKey: anthropicKey!,
  model: 'claude-3-5-sonnet-20241022'
});

// Delete credential
await credentialStore.delete('old_api_key');

// List all stored credentials
const keys = await credentialStore.list();
console.log('Stored credentials:', keys);
// Output: ['anthropic_api_key', 'openai_api_key', 'github_token']
```

---

## 9.4 Input Validation and Sanitization

Validate and sanitize all user input to prevent injection attacks and data leakage.

### Input Validator

```typescript
/**
 * Validates and sanitizes user input
 */
export class InputValidator {
  private logger: Logger;

  // Patterns for sensitive data
  private sensitivePatterns = [
    // API keys
    /sk-[a-zA-Z0-9]{20,}/g,
    /sk-ant-[a-zA-Z0-9-_]{20,}/g,
    /ghp_[a-zA-Z0-9]{36}/g,
    /gho_[a-zA-Z0-9]{36}/g,

    // AWS credentials
    /AKIA[0-9A-Z]{16}/g,
    /aws_secret_access_key["\s:=]+[a-zA-Z0-9/+=]{40}/gi,

    // Private keys
    /-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----/g,

    // Passwords
    /password["\s:=]+[^\s"]{8,}/gi,
    /passwd["\s:=]+[^\s"]{8,}/gi,

    // Tokens
    /token["\s:=]+[a-zA-Z0-9_-]{20,}/gi,
    /bearer\s+[a-zA-Z0-9_-]{20,}/gi,

    // Database connection strings
    /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi,
    /postgres:\/\/[^:]+:[^@]+@/gi,
    /mysql:\/\/[^:]+:[^@]+@/gi,

    // Email addresses (PII)
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    // Credit card numbers
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

    // SSN
    /\b\d{3}-\d{2}-\d{4}\b/g
  ];

  // Patterns for injection attempts
  private injectionPatterns = [
    // Command injection
    /;\s*(rm|dd|mkfs|kill|shutdown)/i,
    /\|\s*(curl|wget).*\|\s*sh/i,
    /`[^`]*`/g, // Backticks
    /\$\([^)]*\)/g, // Command substitution

    // SQL injection
    /(union|select|insert|update|delete|drop|create|alter).*from/gi,
    /('|")\s*(or|and)\s*('|")/gi,

    // Path traversal
    /\.\.[\/\\]/g,
    /(\.\.\/){2,}/g,

    // XSS
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi // Event handlers
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Validate input and detect issues
   */
  validate(input: string): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Check for sensitive data
    for (const pattern of this.sensitivePatterns) {
      if (pattern.test(input)) {
        issues.push({
          type: 'sensitive_data',
          severity: 'critical',
          message: 'Input contains sensitive data (API key, password, etc.)',
          pattern: pattern.toString()
        });
      }
    }

    // Check for injection attempts
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(input)) {
        issues.push({
          type: 'injection_attempt',
          severity: 'high',
          message: 'Input contains potential injection pattern',
          pattern: pattern.toString()
        });
      }
    }

    // Check length
    if (input.length > 50000) {
      issues.push({
        type: 'excessive_length',
        severity: 'medium',
        message: 'Input exceeds maximum length',
        pattern: 'length > 50000'
      });
    }

    const valid = issues.length === 0;

    if (!valid) {
      this.logger.warn('Input validation failed:', {
        issues,
        inputLength: input.length
      });
    }

    return {
      valid,
      issues
    };
  }

  /**
   * Sanitize input by redacting sensitive data
   */
  sanitize(input: string): string {
    let sanitized = input;

    // Redact sensitive patterns
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    return sanitized;
  }

  /**
   * Check if input is safe to send to AI
   */
  isSafeForAI(input: string): boolean {
    const validation = this.validate(input);

    // Block if contains sensitive data
    const hasSensitiveData = validation.issues.some(
      issue => issue.type === 'sensitive_data'
    );

    return !hasSensitiveData;
  }

  /**
   * Check if input is safe to execute
   */
  isSafeForExecution(input: string): boolean {
    const validation = this.validate(input);

    // Block if contains injection attempts
    const hasInjection = validation.issues.some(
      issue => issue.type === 'injection_attempt'
    );

    return !hasInjection;
  }
}

export interface ValidationIssue {
  type: 'sensitive_data' | 'injection_attempt' | 'excessive_length';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  pattern: string;
}
```

### Privacy Filter

```typescript
/**
 * Filters sensitive data before sending to AI
 */
export class PrivacyFilter {
  private validator: InputValidator;
  private logger: Logger;

  constructor(logger: Logger) {
    this.validator = new InputValidator(logger);
    this.logger = logger;
  }

  /**
   * Filter input before sending to AI
   */
  async filterForAI(input: string): Promise<FilterResult> {
    // Sanitize sensitive data
    const sanitized = this.validator.sanitize(input);

    // Check if safe
    const safe = this.validator.isSafeForAI(input);

    if (!safe) {
      this.logger.warn('Input filtered for AI:', {
        originalLength: input.length,
        sanitizedLength: sanitized.length
      });
    }

    return {
      filtered: sanitized,
      hadSensitiveData: !safe,
      redactions: this.countRedactions(input, sanitized)
    };
  }

  /**
   * Filter file content before sending to AI
   */
  async filterFileContent(
    filePath: string,
    content: string
  ): Promise<FilterResult> {
    // Check if file should be entirely blocked
    if (this.isBlockedFile(filePath)) {
      this.logger.warn('Blocked file from AI:', { path: filePath });

      return {
        filtered: `[File ${filePath} contains sensitive data and was not sent to AI]`,
        hadSensitiveData: true,
        redactions: 1
      };
    }

    // Filter content
    return this.filterForAI(content);
  }

  /**
   * Check if file is sensitive and should be blocked
   */
  private isBlockedFile(filePath: string): boolean {
    const blockedPatterns = [
      /\.env$/,
      /\.env\./,
      /credentials/i,
      /secrets/i,
      /\.key$/,
      /\.pem$/,
      /id_rsa$/,
      /id_dsa$/
    ];

    return blockedPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Count number of redactions made
   */
  private countRedactions(original: string, filtered: string): number {
    const redactionPattern = /\[REDACTED\]/g;
    const matches = filtered.match(redactionPattern);
    return matches ? matches.length : 0;
  }
}

export interface FilterResult {
  filtered: string;
  hadSensitiveData: boolean;
  redactions: number;
}
```

---

## 9.5 Rate Limiting and Quotas

Prevent resource exhaustion by limiting API calls and resource usage.

### Rate Limiter

```typescript
/**
 * Token bucket rate limiter
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
    private logger: Logger
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens
   * @returns true if tokens available, false if rate limited
   */
  async tryConsume(tokensNeeded: number = 1): Promise<boolean> {
    // Refill tokens based on time elapsed
    this.refill();

    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return true;
    }

    this.logger.warn('Rate limit exceeded:', {
      available: this.tokens,
      needed: tokensNeeded
    });

    return false;
  }

  /**
   * Wait until tokens are available
   */
  async consume(tokensNeeded: number = 1): Promise<void> {
    while (true) {
      if (await this.tryConsume(tokensNeeded)) {
        return;
      }

      // Calculate wait time
      const tokensToWait = tokensNeeded - this.tokens;
      const waitMs = (tokensToWait / this.refillRate) * 1000;

      // Wait
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const elapsedSeconds = elapsedMs / 1000;

    const tokensToAdd = elapsedSeconds * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}
```

### Budget Manager

```typescript
/**
 * Manages budget limits for AI API calls
 */
export class BudgetManager {
  private usage: UsageTracker;
  private logger: Logger;

  constructor(
    private limits: BudgetLimits,
    logger: Logger
  ) {
    this.usage = new UsageTracker();
    this.logger = logger;
  }

  /**
   * Check if request is within budget
   */
  async checkBudget(estimatedCost: number): Promise<BudgetCheckResult> {
    const current = this.usage.getCurrentUsage();

    // Check hourly limit
    if (this.limits.hourlyLimit) {
      const hourlyUsage = this.usage.getUsageInWindow(3600000); // 1 hour

      if (hourlyUsage.cost + estimatedCost > this.limits.hourlyLimit) {
        return {
          allowed: false,
          reason: 'Hourly budget limit exceeded',
          current: hourlyUsage.cost,
          limit: this.limits.hourlyLimit
        };
      }
    }

    // Check daily limit
    if (this.limits.dailyLimit) {
      const dailyUsage = this.usage.getUsageInWindow(86400000); // 24 hours

      if (dailyUsage.cost + estimatedCost > this.limits.dailyLimit) {
        return {
          allowed: false,
          reason: 'Daily budget limit exceeded',
          current: dailyUsage.cost,
          limit: this.limits.dailyLimit
        };
      }
    }

    // Check monthly limit
    if (this.limits.monthlyLimit) {
      const monthlyUsage = this.usage.getUsageInWindow(2592000000); // 30 days

      if (monthlyUsage.cost + estimatedCost > this.limits.monthlyLimit) {
        return {
          allowed: false,
          reason: 'Monthly budget limit exceeded',
          current: monthlyUsage.cost,
          limit: this.limits.monthlyLimit
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record usage
   */
  async recordUsage(cost: number, tokens: number, provider: string): Promise<void> {
    this.usage.record({
      timestamp: Date.now(),
      cost,
      tokens,
      provider
    });

    this.logger.info('API usage recorded:', { cost, tokens, provider });
  }

  /**
   * Get current usage stats
   */
  getUsageStats(): UsageStats {
    return {
      hourly: this.usage.getUsageInWindow(3600000),
      daily: this.usage.getUsageInWindow(86400000),
      monthly: this.usage.getUsageInWindow(2592000000),
      total: this.usage.getCurrentUsage()
    };
  }
}

export interface BudgetLimits {
  hourlyLimit?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

export interface UsageStats {
  hourly: { cost: number; tokens: number };
  daily: { cost: number; tokens: number };
  monthly: { cost: number; tokens: number };
  total: { cost: number; tokens: number };
}

/**
 * Tracks API usage over time
 */
class UsageTracker {
  private records: UsageRecord[] = [];

  record(record: UsageRecord): void {
    this.records.push(record);

    // Clean old records (older than 30 days)
    const cutoff = Date.now() - 2592000000;
    this.records = this.records.filter(r => r.timestamp > cutoff);
  }

  getUsageInWindow(windowMs: number): { cost: number; tokens: number } {
    const cutoff = Date.now() - windowMs;

    const filtered = this.records.filter(r => r.timestamp > cutoff);

    return {
      cost: filtered.reduce((sum, r) => sum + r.cost, 0),
      tokens: filtered.reduce((sum, r) => sum + r.tokens, 0)
    };
  }

  getCurrentUsage(): { cost: number; tokens: number } {
    return {
      cost: this.records.reduce((sum, r) => sum + r.cost, 0),
      tokens: this.records.reduce((sum, r) => sum + r.tokens, 0)
    };
  }
}

interface UsageRecord {
  timestamp: number;
  cost: number;
  tokens: number;
  provider: string;
}
```

---

## 9.6 Privacy-Preserving AI Interactions

Minimize data exposure to AI providers while maintaining functionality.

### Local-First Strategy

```typescript
/**
 * Privacy-preserving AI interaction strategy
 */
export class PrivacyPreservingAI {
  private privacyFilter: PrivacyFilter;
  private localProvider: AIProvider; // Ollama
  private cloudProvider: AIProvider; // Anthropic/OpenAI
  private logger: Logger;

  constructor(
    localProvider: AIProvider,
    cloudProvider: AIProvider,
    logger: Logger
  ) {
    this.privacyFilter = new PrivacyFilter(logger);
    this.localProvider = localProvider;
    this.cloudProvider = cloudProvider;
    this.logger = logger;
  }

  /**
   * Route request based on sensitivity
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Analyze sensitivity
    const sensitivity = this.analyzeSensitivity(request);

    this.logger.info('Privacy routing:', {
      sensitivity: sensitivity.level,
      reasons: sensitivity.reasons
    });

    // Route based on sensitivity
    if (sensitivity.level === 'high' || sensitivity.level === 'critical') {
      // Use local provider for sensitive data
      return this.localProvider.complete(request);

    } else {
      // Filter and use cloud provider for non-sensitive data
      const filtered = await this.filterRequest(request);
      return this.cloudProvider.complete(filtered);
    }
  }

  /**
   * Analyze sensitivity of request
   */
  private analyzeSensitivity(request: CompletionRequest): SensitivityAnalysis {
    const reasons: string[] = [];
    let level: SensitivityLevel = 'low';

    // Check each message
    for (const message of request.messages) {
      const validation = new InputValidator(this.logger).validate(message.content);

      for (const issue of validation.issues) {
        if (issue.type === 'sensitive_data') {
          level = 'critical';
          reasons.push(`Message contains ${issue.message}`);
        }
      }
    }

    // Check for code files
    const hasCodeFiles = request.messages.some(m =>
      m.content.includes('```') || m.content.length > 5000
    );

    if (hasCodeFiles) {
      if (level === 'low') level = 'medium';
      reasons.push('Request contains code files');
    }

    return { level, reasons };
  }

  /**
   * Filter request before sending to cloud
   */
  private async filterRequest(
    request: CompletionRequest
  ): Promise<CompletionRequest> {
    const filteredMessages = await Promise.all(
      request.messages.map(async msg => {
        const result = await this.privacyFilter.filterForAI(msg.content);

        return {
          ...msg,
          content: result.filtered
        };
      })
    );

    return {
      ...request,
      messages: filteredMessages
    };
  }
}

type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';

interface SensitivityAnalysis {
  level: SensitivityLevel;
  reasons: string[];
}
```

### Anonymization

```typescript
/**
 * Anonymizes code and data before sending to AI
 */
export class CodeAnonymizer {
  private identifierMap: Map<string, string> = new Map();
  private counter = 0;

  /**
   * Anonymize code by replacing identifiers
   */
  anonymize(code: string, language: string): AnonymizedCode {
    // Simple anonymization (production would use AST parsing)
    let anonymized = code;

    // Replace function names
    anonymized = anonymized.replace(
      /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      (match, name) => {
        const anon = this.getAnonymousName(name);
        return `function ${anon}`;
      }
    );

    // Replace variable names
    anonymized = anonymized.replace(
      /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      (match, name) => {
        const anon = this.getAnonymousName(name);
        return match.replace(name, anon);
      }
    );

    // Replace class names
    anonymized = anonymized.replace(
      /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      (match, name) => {
        const anon = this.getAnonymousName(name);
        return `class ${anon}`;
      }
    );

    return {
      anonymized,
      identifierMap: new Map(this.identifierMap)
    };
  }

  /**
   * Deanonymize response from AI
   */
  deanonymize(code: string): string {
    let deanonymized = code;

    // Reverse identifier mapping
    for (const [original, anon] of this.identifierMap) {
      deanonymized = deanonymized.replace(
        new RegExp(`\\b${anon}\\b`, 'g'),
        original
      );
    }

    return deanonymized;
  }

  /**
   * Get or create anonymous name
   */
  private getAnonymousName(original: string): string {
    if (this.identifierMap.has(original)) {
      return this.identifierMap.get(original)!;
    }

    const anon = `var_${this.counter++}`;
    this.identifierMap.set(original, anon);

    return anon;
  }

  /**
   * Clear mapping
   */
  reset(): void {
    this.identifierMap.clear();
    this.counter = 0;
  }
}

interface AnonymizedCode {
  anonymized: string;
  identifierMap: Map<string, string>;
}
```

---

## 9.7 Audit Logging and Compliance

Comprehensive audit logging enables forensics and compliance.

### Audit Logger

```typescript
/**
 * Audit logger for security-relevant events
 */
export class AuditLogger {
  private logger: Logger;
  private storage: AuditStorage;

  constructor(logger: Logger, storage: AuditStorage) {
    this.logger = logger;
    this.storage = storage;
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Add metadata
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date(),
      id: this.generateEventId()
    };

    // Redact sensitive data
    const redacted = this.redactEvent(auditEvent);

    // Write to logger
    this.logger.info('Security event:', redacted);

    // Store for audit
    await this.storage.store(redacted);
  }

  /**
   * Log file access
   */
  async logFileAccess(
    operation: 'read' | 'write' | 'delete',
    filePath: string,
    success: boolean,
    user?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'file_access',
      operation,
      resource: filePath,
      success,
      user,
      metadata: {}
    });
  }

  /**
   * Log command execution
   */
  async logCommandExecution(
    command: string,
    success: boolean,
    exitCode?: number,
    user?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'command_execution',
      operation: 'execute',
      resource: command,
      success,
      user,
      metadata: { exitCode }
    });
  }

  /**
   * Log credential access
   */
  async logCredentialAccess(
    operation: 'get' | 'set' | 'delete',
    key: string,
    success: boolean,
    user?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'credential_access',
      operation,
      resource: key,
      success,
      user,
      metadata: {}
    });
  }

  /**
   * Log security violation
   */
  async logViolation(
    violationType: string,
    resource: string,
    reason: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    user?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'security_violation',
      operation: violationType,
      resource,
      success: false,
      user,
      metadata: { reason, severity }
    });
  }

  /**
   * Redact sensitive data from event
   */
  private redactEvent(event: AuditEvent): AuditEvent {
    const redacted = { ...event };

    // Redact resource if it contains sensitive data
    if (redacted.resource) {
      const validator = new InputValidator(this.logger);
      redacted.resource = validator.sanitize(redacted.resource);
    }

    return redacted;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

export interface SecurityEvent {
  type: string;
  operation: string;
  resource: string;
  success: boolean;
  user?: string;
  metadata: Record<string, any>;
}

export interface AuditEvent extends SecurityEvent {
  id: string;
  timestamp: Date;
}
```

### Audit Storage

```typescript
import fs from 'fs/promises';

/**
 * Stores audit events for compliance
 */
export class AuditStorage {
  private logPath: string;
  private rotateSize: number; // bytes
  private maxFiles: number;

  constructor(
    logPath: string,
    rotateSize: number = 10 * 1024 * 1024, // 10 MB
    maxFiles: number = 10
  ) {
    this.logPath = logPath;
    this.rotateSize = rotateSize;
    this.maxFiles = maxFiles;
  }

  /**
   * Store audit event
   */
  async store(event: AuditEvent): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.logPath);
    await fs.mkdir(dir, { recursive: true });

    // Append to log file
    const line = JSON.stringify(event) + '\n';
    await fs.appendFile(this.logPath, line);

    // Check if rotation needed
    await this.rotateIfNeeded();
  }

  /**
   * Query audit events
   */
  async query(filter: AuditFilter): Promise<AuditEvent[]> {
    const events: AuditEvent[] = [];

    // Read all log files
    const files = await this.getLogFiles();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line);

          if (this.matchesFilter(event, filter)) {
            events.push(event);
          }
        } catch (error) {
          // Skip invalid lines
        }
      }
    }

    return events;
  }

  /**
   * Rotate log file if needed
   */
  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.logPath);

      if (stats.size >= this.rotateSize) {
        await this.rotate();
      }
    } catch (error) {
      // File doesn't exist yet
    }
  }

  /**
   * Rotate log files
   */
  private async rotate(): Promise<void> {
    // Move existing files
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldPath = `${this.logPath}.${i}`;
      const newPath = `${this.logPath}.${i + 1}`;

      try {
        await fs.rename(oldPath, newPath);
      } catch (error) {
        // File doesn't exist
      }
    }

    // Move current file to .1
    await fs.rename(this.logPath, `${this.logPath}.1`);

    // Delete oldest file if needed
    const oldestPath = `${this.logPath}.${this.maxFiles + 1}`;
    try {
      await fs.unlink(oldestPath);
    } catch (error) {
      // File doesn't exist
    }
  }

  /**
   * Get all log files
   */
  private async getLogFiles(): Promise<string[]> {
    const files = [this.logPath];

    for (let i = 1; i <= this.maxFiles; i++) {
      const path = `${this.logPath}.${i}`;

      try {
        await fs.access(path);
        files.push(path);
      } catch (error) {
        // File doesn't exist
        break;
      }
    }

    return files;
  }

  /**
   * Check if event matches filter
   */
  private matchesFilter(event: AuditEvent, filter: AuditFilter): boolean {
    if (filter.type && event.type !== filter.type) {
      return false;
    }

    if (filter.operation && event.operation !== filter.operation) {
      return false;
    }

    if (filter.user && event.user !== filter.user) {
      return false;
    }

    if (filter.startTime && event.timestamp < filter.startTime) {
      return false;
    }

    if (filter.endTime && event.timestamp > filter.endTime) {
      return false;
    }

    return true;
  }
}

export interface AuditFilter {
  type?: string;
  operation?: string;
  user?: string;
  startTime?: Date;
  endTime?: Date;
}
```

---

## 9.8 Security Best Practices

### Security Checklist

```typescript
/**
 * Security best practices checklist
 */
export const SECURITY_CHECKLIST = {
  authentication: [
    'Use encrypted credential storage (AES-256-GCM)',
    'Never store credentials in plaintext',
    'Use OS keychain when available',
    'Rotate credentials regularly',
    'Use principle of least privilege'
  ],

  authorization: [
    'Implement sandbox for file access',
    'Require approval for destructive operations',
    'Use allowlists for paths and commands',
    'Validate all user input',
    'Implement read-only mode'
  ],

  dataProtection: [
    'Filter sensitive data before sending to AI',
    'Use local AI for sensitive code',
    'Redact secrets in logs',
    'Anonymize code when possible',
    'Encrypt data at rest and in transit'
  ],

  rateLimiting: [
    'Implement rate limiting for API calls',
    'Set budget caps (hourly, daily, monthly)',
    'Monitor usage patterns',
    'Alert on unusual activity',
    'Implement request queuing'
  ],

  auditLogging: [
    'Log all security-relevant events',
    'Include context (user, timestamp, resource)',
    'Redact sensitive data in logs',
    'Rotate logs regularly',
    'Enable forensic analysis'
  ],

  inputValidation: [
    'Validate all user input',
    'Sanitize before processing',
    'Detect injection attempts',
    'Limit input length',
    'Use type checking'
  ],

  errorHandling: [
    'Never expose sensitive data in errors',
    'Log errors securely',
    'Fail securely (deny by default)',
    'Handle edge cases',
    'Provide user-friendly messages'
  ],

  deployment: [
    'Run with least privilege',
    'Use environment variables for config',
    'Enable security headers',
    'Keep dependencies updated',
    'Regular security audits'
  ]
};
```

### Secure Configuration

```typescript
/**
 * Secure default configuration
 */
export class SecureConfiguration {
  /**
   * Get production-ready security configuration
   */
  static getProductionConfig(): SecurityConfig {
    return {
      // Sandbox configuration
      sandbox: {
        ...DEFAULT_SANDBOX_CONFIG,
        readOnly: false,
        allowNetwork: false,
        maxExecutionTime: 30000
      },

      // Credential configuration
      credentials: {
        storePath: path.join(os.homedir(), '.ollama-code', 'credentials.enc'),
        encryptionAlgorithm: 'aes-256-gcm',
        keyDerivationIterations: 100000
      },

      // Rate limiting
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },

      // Budget limits
      budget: {
        hourlyLimit: 1.00, // $1/hour
        dailyLimit: 10.00, // $10/day
        monthlyLimit: 100.00 // $100/month
      },

      // Privacy
      privacy: {
        filterSensitiveData: true,
        useLocalForSensitive: true,
        anonymizeCode: false, // Optional
        redactLogs: true
      },

      // Audit logging
      audit: {
        enabled: true,
        logPath: path.join(os.homedir(), '.ollama-code', 'audit.log'),
        rotateSize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 10
      },

      // Approval requirements
      approval: {
        requireForWrite: true,
        requireForDelete: true,
        requireForExecute: true,
        requireFor2FA: ['delete', 'execute_dangerous']
      }
    };
  }

  /**
   * Get development configuration (more permissive)
   */
  static getDevelopmentConfig(): SecurityConfig {
    const prod = this.getProductionConfig();

    return {
      ...prod,
      sandbox: {
        ...prod.sandbox,
        allowNetwork: true,
        maxExecutionTime: 60000
      },
      approval: {
        ...prod.approval,
        requireForWrite: false,
        requireForExecute: false
      }
    };
  }
}

export interface SecurityConfig {
  sandbox: SandboxConfig;
  credentials: CredentialConfig;
  rateLimits: RateLimitConfig;
  budget: BudgetLimits;
  privacy: PrivacyConfig;
  audit: AuditConfig;
  approval: ApprovalConfig;
}

interface CredentialConfig {
  storePath: string;
  encryptionAlgorithm: string;
  keyDerivationIterations: number;
}

interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

interface PrivacyConfig {
  filterSensitiveData: boolean;
  useLocalForSensitive: boolean;
  anonymizeCode: boolean;
  redactLogs: boolean;
}

interface AuditConfig {
  enabled: boolean;
  logPath: string;
  rotateSize: number;
  maxFiles: number;
}

interface ApprovalConfig {
  requireForWrite: boolean;
  requireForDelete: boolean;
  requireForExecute: boolean;
  requireFor2FA: string[];
}
```

---

## Exercises

### Exercise 1: Implement Container-Based Sandboxing

**Goal:** Enhance sandboxing by using Docker containers for complete isolation.

**Requirements:**
1. Create `DockerSandbox` class that executes commands in containers
2. Mount only allowed directories
3. Limit CPU, memory, and network
4. Collect output and cleanup containers
5. Handle errors and timeouts

**Starter Code:**

```typescript
export class DockerSandbox {
  async execute(command: string, config: SandboxConfig): Promise<ExecutionResult> {
    // TODO: Create Docker container with restrictions
    // TODO: Mount allowed directories as volumes
    // TODO: Execute command
    // TODO: Collect output
    // TODO: Cleanup container
  }
}
```

### Exercise 2: Implement Security Incident Response

**Goal:** Build incident detection and response system.

**Requirements:**
1. Detect security incidents (multiple failed attempts, unusual patterns)
2. Classify severity
3. Trigger alerts
4. Implement automatic response (block user, require re-auth)
5. Generate incident reports

**Hints:**
- Track failed operations per user/IP
- Use sliding window for rate detection
- Integration with notification systems (email, Slack)

### Exercise 3: GDPR Compliance Features

**Goal:** Add GDPR compliance features for handling user data.

**Requirements:**
1. Implement data export (all user data in JSON)
2. Implement data deletion (right to be forgotten)
3. Add consent management (track consents)
4. Implement data retention policies (auto-delete old data)
5. Generate compliance reports

**Example:**

```typescript
export class GDPRCompliance {
  async exportUserData(userId: string): Promise<UserDataExport> {
    // Export all data for user
  }

  async deleteUserData(userId: string): Promise<void> {
    // Delete all user data
  }

  async trackConsent(userId: string, consentType: string): Promise<void> {
    // Record consent
  }
}
```

---

## Summary

In this chapter, you built comprehensive security controls for your AI coding assistant.

### Key Concepts

1. **Sandboxed Execution** - Restrict file access, commands, and resource usage
2. **Credential Management** - Encrypted storage with AES-256-GCM
3. **Input Validation** - Detect and prevent injection attacks
4. **Rate Limiting** - Prevent resource exhaustion with token bucket
5. **Privacy Filtering** - Remove sensitive data before AI processing
6. **Audit Logging** - Complete forensic trail of all operations
7. **Security Best Practices** - Production-ready security checklist

### Security Layers

```
User Input
    ↓
Input Validation (detect injection, sensitive data)
    ↓
Privacy Filter (redact secrets)
    ↓
Authorization (check permissions)
    ↓
Rate Limiting (check quotas)
    ↓
Sandboxed Execution (restricted environment)
    ↓
Audit Logging (record everything)
```

### Real-World Impact

**Before Security:**
```
User: "Delete old database backups"
AI: [Executes: rm -rf /backups/*]
Result: ❌ All backups deleted including production
        ❌ No audit trail
        ❌ No approval required
```

**After Security:**
```
User: "Delete old database backups"
AI: [Security checks]
    [Detects destructive operation]
    ⚠️  This will delete files in /backups/
    📋 Affected: 147 files (23 GB)
    🔒 Requires approval

User: [Types 'yes']
AI: [Sandboxed execution]
    [Only deletes files older than 90 days]
    [Logs to audit trail]
    ✓ Deleted 12 old backups (3.2 GB)
    ✓ Kept 135 recent backups (19.8 GB)
```

**Security Metrics:**
- 100% of destructive operations require approval
- 0% sensitive data leakage to AI
- Complete audit trail for compliance
- Budget controls prevent cost overruns
- Sandboxing prevents unauthorized access

### Part III Complete!

You've now completed all three chapters of Part III: Advanced Features:

1. ✅ **Chapter 7**: VCS Intelligence - AI-powered git workflows
2. ✅ **Chapter 8**: Interactive Modes - Natural language routing
3. ✅ **Chapter 9**: Security - Complete security framework

### Next Steps

In **Part IV: Production Readiness**, you'll learn how to test, optimize, and monitor your AI coding assistant for production deployment.

---

*Chapter 9 | Security, Privacy, and Sandboxing | Complete*
