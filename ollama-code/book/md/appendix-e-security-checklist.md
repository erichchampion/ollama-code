# Appendix E: Security Checklist

> *Comprehensive security guide for AI coding assistants*

---

## Overview

This appendix provides a complete security checklist for building and deploying AI coding assistants. Use this as a pre-deployment audit and ongoing security review guide.

**Security Domains:**
- Credential Management
- API Key Security
- Sandboxing and Isolation
- Input Validation
- Rate Limiting
- Audit Logging
- Network Security
- Data Privacy

---

## Pre-Deployment Security Audit

### ✅ Essential (Must Have)

- [ ] **Credential Encryption**
  - [ ] All API keys encrypted at rest (AES-256-GCM)
  - [ ] Encryption keys derived with PBKDF2 (100,000+ iterations)
  - [ ] No hardcoded secrets in code
  - [ ] No secrets in version control
  - [ ] No secrets in logs

- [ ] **Input Validation**
  - [ ] All user inputs validated
  - [ ] File paths sanitized
  - [ ] Command injection prevention
  - [ ] SQL injection prevention (if using DB)
  - [ ] XSS prevention (if web interface)

- [ ] **Sandboxing**
  - [ ] Tools execute in restricted environment
  - [ ] Filesystem access limited to allowed paths
  - [ ] Command whitelist enforced
  - [ ] Network access controlled

- [ ] **Rate Limiting**
  - [ ] Per-user rate limits configured
  - [ ] Per-IP rate limits (if applicable)
  - [ ] Budget limits enforced
  - [ ] Circuit breaker for failed requests

- [ ] **Audit Logging**
  - [ ] All sensitive operations logged
  - [ ] Logs include user/timestamp/action
  - [ ] Logs stored securely
  - [ ] Log rotation configured
  - [ ] Anomaly detection enabled

### ⚠️ Recommended (Should Have)

- [ ] **Authentication & Authorization**
  - [ ] User authentication required
  - [ ] Role-based access control (RBAC)
  - [ ] Session management
  - [ ] Password policy enforced
  - [ ] MFA available

- [ ] **Network Security**
  - [ ] HTTPS/TLS enforced
  - [ ] Certificate validation
  - [ ] Secure headers set
  - [ ] CORS configured properly

- [ ] **Data Privacy**
  - [ ] PII detection and filtering
  - [ ] Data anonymization
  - [ ] Retention policies
  - [ ] GDPR compliance (if EU users)

- [ ] **Monitoring & Alerting**
  - [ ] Security events monitored
  - [ ] Alert on suspicious activity
  - [ ] Regular security scans
  - [ ] Dependency vulnerability scanning

### 💡 Optional (Nice to Have)

- [ ] **Advanced Protection**
  - [ ] Web Application Firewall (WAF)
  - [ ] DDoS protection
  - [ ] Intrusion detection system (IDS)
  - [ ] Penetration testing

- [ ] **Compliance**
  - [ ] SOC 2 compliance
  - [ ] ISO 27001 certification
  - [ ] HIPAA compliance (if health data)
  - [ ] Regular security audits

---

## Credential Management

### API Key Storage

**❌ NEVER DO THIS:**
```typescript
// Hardcoded in code
const OPENAI_API_KEY = 'sk-proj-abc123...';

// In version control
git add config.json  // Contains API keys

// In logs
console.log(`Using API key: ${apiKey}`);

// In error messages
throw new Error(`Invalid API key: ${apiKey}`);
```

**✅ DO THIS:**
```typescript
// Use environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Or encrypted credential store
const credentialStore = new CredentialStore({
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000
  }
});

const apiKey = await credentialStore.get('openai-api-key');
```

**Configuration:**
```json
{
  "security": {
    "credentialStore": {
      "type": "encrypted-file",
      "path": "~/.ollama-code/credentials.enc",
      "encryption": {
        "algorithm": "aes-256-gcm",
        "keyDerivation": "pbkdf2",
        "iterations": 100000
      }
    }
  }
}
```

---

### Environment Variables

**Checklist:**
- [ ] Use `.env` file for local development
- [ ] Add `.env` to `.gitignore`
- [ ] Use secret management in production (AWS Secrets Manager, etc.)
- [ ] Rotate keys regularly (every 90 days)
- [ ] Use separate keys for dev/staging/prod

**.env.example (committed):**
```bash
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

**.env (NOT committed):**
```bash
OPENAI_API_KEY=sk-proj-real-key-here
ANTHROPIC_API_KEY=sk-ant-real-key-here
```

**.gitignore:**
```
.env
.env.local
*.key
credentials.enc
```

---

## Sandboxing and Isolation

### Filesystem Restrictions

**Configuration:**
```json
{
  "security": {
    "sandbox": {
      "enabled": true,
      "filesystem": {
        "allowedPaths": [
          "~/projects",
          "/tmp"
        ],
        "deniedPaths": [
          "~/.ssh",
          "~/.aws",
          "~/.kube",
          "/etc/passwd",
          "/etc/shadow"
        ],
        "readOnly": [
          "/usr/bin",
          "/usr/lib"
        ],
        "maxFileSize": 10485760,
        "maxTotalSize": 104857600
      }
    }
  }
}
```

**Checklist:**
- [ ] Whitelist allowed directories
- [ ] Blacklist sensitive directories
- [ ] Enforce file size limits
- [ ] Validate file paths (no `..` traversal)
- [ ] Check symlink targets

**Path Validation:**
```typescript
function validatePath(userPath: string, allowedPaths: string[]): boolean {
  // Resolve to absolute path
  const absolutePath = path.resolve(userPath);

  // Check for directory traversal
  if (absolutePath.includes('..')) {
    return false;
  }

  // Check if within allowed paths
  return allowedPaths.some(allowed => {
    const allowedAbsolute = path.resolve(allowed);
    return absolutePath.startsWith(allowedAbsolute);
  });
}
```

---

### Command Restrictions

**Configuration:**
```json
{
  "security": {
    "sandbox": {
      "commands": {
        "whitelist": [
          "git",
          "npm",
          "yarn",
          "node",
          "python3"
        ],
        "blacklist": [
          "rm",
          "dd",
          "mkfs",
          "fdisk",
          "shutdown",
          "reboot"
        ],
        "allowedArgs": {
          "git": ["status", "log", "diff", "add", "commit"],
          "npm": ["install", "test", "run"]
        }
      }
    }
  }
}
```

**Checklist:**
- [ ] Whitelist safe commands only
- [ ] Blacklist destructive commands
- [ ] Validate command arguments
- [ ] Prevent command injection
- [ ] Use shell escaping

**Command Validation:**
```typescript
function validateCommand(command: string, args: string[]): boolean {
  // Check command is whitelisted
  if (!ALLOWED_COMMANDS.includes(command)) {
    return false;
  }

  // Check args are safe
  const DANGEROUS_PATTERNS = [
    /;/,           // Command chaining
    /\|/,          // Piping
    /`/,           // Command substitution
    /\$/,          // Variable expansion
    />/,           // Redirection
    /</
  ];

  return !args.some(arg =>
    DANGEROUS_PATTERNS.some(pattern => pattern.test(arg))
  );
}
```

---

## Input Validation

### User Input Sanitization

**Checklist:**
- [ ] Validate all user inputs
- [ ] Sanitize before use
- [ ] Escape special characters
- [ ] Limit input length
- [ ] Check data types

**Implementation:**
```typescript
class InputValidator {
  // File path validation
  validateFilePath(path: string): ValidationResult {
    // Length check
    if (path.length > 4096) {
      return { valid: false, error: 'Path too long' };
    }

    // Null byte check
    if (path.includes('\0')) {
      return { valid: false, error: 'Invalid characters' };
    }

    // Directory traversal check
    if (path.includes('..')) {
      return { valid: false, error: 'Directory traversal not allowed' };
    }

    // Allowed characters only
    if (!/^[a-zA-Z0-9_\-./]+$/.test(path)) {
      return { valid: false, error: 'Invalid characters in path' };
    }

    return { valid: true };
  }

  // Prompt validation
  validatePrompt(prompt: string): ValidationResult {
    // Length check
    if (prompt.length > 50000) {
      return { valid: false, error: 'Prompt too long' };
    }

    // Check for prompt injection attempts
    const INJECTION_PATTERNS = [
      /ignore.*previous.*instructions/i,
      /disregard.*system.*prompt/i,
      /you.*are.*now/i,
      /new.*role/i
    ];

    if (INJECTION_PATTERNS.some(p => p.test(prompt))) {
      return { valid: false, error: 'Potential prompt injection' };
    }

    return { valid: true };
  }

  // API key validation
  validateApiKey(key: string): ValidationResult {
    // Format checks
    if (!/^sk-[a-zA-Z0-9]{48}$/.test(key)) {
      return { valid: false, error: 'Invalid API key format' };
    }

    return { valid: true };
  }
}
```

---

### SQL Injection Prevention

If using a database:

**❌ NEVER DO THIS:**
```typescript
// String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**✅ DO THIS:**
```typescript
// Parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// Or with ORM
User.findById(userId);
```

---

## Rate Limiting

### Configuration

```json
{
  "security": {
    "rateLimit": {
      "enabled": true,
      "limits": {
        "perMinute": 60,
        "perHour": 1000,
        "perDay": 10000
      },
      "bypassTokens": [],
      "actionOnExceeded": "reject",
      "retryAfter": 60
    }
  }
}
```

**Checklist:**
- [ ] Per-user limits
- [ ] Per-IP limits (if web-facing)
- [ ] Per-API-key limits
- [ ] Burst protection
- [ ] Graceful degradation

**Implementation:**
```typescript
class RateLimiter {
  private limits = new Map<string, RateLimit>();

  async checkLimit(userId: string): Promise<RateLimitResult> {
    const limit = this.limits.get(userId) || this.createLimit(userId);

    // Check limits
    if (limit.requestsThisMinute >= 60) {
      return {
        allowed: false,
        retryAfter: 60 - (Date.now() - limit.minuteStart) / 1000,
        reason: 'Per-minute limit exceeded'
      };
    }

    if (limit.requestsThisHour >= 1000) {
      return {
        allowed: false,
        retryAfter: 3600 - (Date.now() - limit.hourStart) / 1000,
        reason: 'Per-hour limit exceeded'
      };
    }

    // Update counters
    limit.requestsThisMinute++;
    limit.requestsThisHour++;

    return { allowed: true };
  }
}
```

---

## Audit Logging

### What to Log

**✅ Log These:**
- Authentication attempts (success/failure)
- API key usage
- File access (read/write)
- Command execution
- Configuration changes
- Security events (rate limit, validation failure)
- Errors and exceptions

**❌ Never Log These:**
- API keys
- Passwords
- PII (unless encrypted)
- Full file contents
- Sensitive data

**Configuration:**
```json
{
  "security": {
    "audit": {
      "enabled": true,
      "events": [
        "auth:login",
        "auth:logout",
        "auth:failed",
        "api:key_used",
        "file:read",
        "file:write",
        "command:execute",
        "config:change",
        "security:rate_limit",
        "security:validation_failed"
      ],
      "storage": {
        "type": "file",
        "path": "~/.ollama-code/logs/audit.log",
        "rotation": {
          "maxSize": "50m",
          "maxFiles": 10,
          "compress": true
        }
      },
      "sanitization": {
        "enabled": true,
        "redactPatterns": [
          "sk-[a-zA-Z0-9]+",
          "Bearer [a-zA-Z0-9]+",
          "password.*",
          "api[_-]?key.*"
        ]
      }
    }
  }
}
```

**Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "event": "file:read",
  "user": "user@example.com",
  "ip": "192.168.1.100",
  "action": "read_file",
  "resource": "/home/user/project/src/index.ts",
  "result": "success",
  "metadata": {
    "fileSize": 1024,
    "duration": 15
  }
}
```

---

## Network Security

### HTTPS/TLS

**Checklist:**
- [ ] HTTPS enforced for all connections
- [ ] Valid SSL/TLS certificates
- [ ] TLS 1.2+ only (disable older versions)
- [ ] Strong cipher suites
- [ ] HSTS header enabled

**Configuration (if serving HTTP API):**
```typescript
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
  // TLS 1.2+ only
  minVersion: 'TLSv1.2',
  // Strong ciphers only
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':')
}, app);
```

---

### Security Headers

If serving web interface:

```typescript
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HSTS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // CSP
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );

  next();
});
```

---

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://app.yourdomain.com',
    'https://staging.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Data Privacy

### PII Detection and Filtering

**Checklist:**
- [ ] Detect PII in prompts
- [ ] Detect PII in code
- [ ] Filter before sending to AI
- [ ] Anonymize in logs
- [ ] User consent for data usage

**PII Patterns:**
```typescript
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+\d{1,3}[- ]?)?\d{10}/g,
  ssn: /\d{3}-\d{2}-\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
  ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  apiKey: /sk-[a-zA-Z0-9]{48}/g
};

class PrivacyFilter {
  filterPII(text: string): string {
    let filtered = text;

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      filtered = filtered.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
    }

    return filtered;
  }
}
```

---

### Data Retention

**Configuration:**
```json
{
  "privacy": {
    "retention": {
      "conversations": "30d",
      "logs": "90d",
      "auditLogs": "365d",
      "cache": "7d"
    },
    "deletion": {
      "autoDelete": true,
      "deleteOnRequest": true
    }
  }
}
```

**Checklist:**
- [ ] Define retention periods
- [ ] Auto-delete old data
- [ ] User can delete their data
- [ ] Backups encrypted
- [ ] Secure deletion (not just unlink)

---

## Dependency Security

### Vulnerability Scanning

```bash
# npm audit
npm audit
npm audit fix

# Snyk
snyk test
snyk monitor

# OWASP Dependency Check
dependency-check --scan ./
```

**Checklist:**
- [ ] Regular dependency updates
- [ ] Automated vulnerability scanning
- [ ] No dependencies with known CVEs
- [ ] Pin dependency versions
- [ ] Review dependency licenses

**package.json:**
```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "snyk": "snyk test"
  },
  "devDependencies": {
    "snyk": "^1.1000.0"
  }
}
```

---

## Incident Response Plan

### Security Incident Checklist

**Immediate Actions:**
1. [ ] Identify the incident type
2. [ ] Assess impact and scope
3. [ ] Contain the incident
4. [ ] Preserve evidence (logs, etc.)
5. [ ] Notify stakeholders

**Short-term Actions:**
6. [ ] Rotate compromised credentials
7. [ ] Patch vulnerabilities
8. [ ] Block malicious IPs
9. [ ] Review audit logs
10. [ ] Update security rules

**Long-term Actions:**
11. [ ] Conduct post-mortem
12. [ ] Update security policies
13. [ ] Improve monitoring
14. [ ] Train team
15. [ ] Test incident response

**Contact Information:**
```
Security Team: security@yourdomain.com
On-Call: +1-xxx-xxx-xxxx
Escalation: ceo@yourdomain.com
```

---

## Security Testing

### Penetration Testing Checklist

**Before Production:**
- [ ] Input validation testing
- [ ] Authentication testing
- [ ] Authorization testing
- [ ] Session management testing
- [ ] Injection testing (SQL, command, etc.)
- [ ] API security testing
- [ ] File upload testing
- [ ] Rate limiting testing

**Tools:**
```bash
# OWASP ZAP
zap-cli quick-scan http://localhost:3000

# Burp Suite
# Manual testing

# SQLMap (if using database)
sqlmap -u "http://localhost:3000/api/user?id=1"

# Nikto
nikto -h http://localhost:3000
```

---

## Compliance Checklists

### GDPR Compliance (EU Users)

- [ ] Privacy policy published
- [ ] Cookie consent
- [ ] Data collection minimized
- [ ] User consent obtained
- [ ] Right to access data
- [ ] Right to delete data
- [ ] Data portability
- [ ] Data breach notification process
- [ ] DPO appointed (if required)
- [ ] DPIA completed (if required)

### SOC 2 Compliance

- [ ] Access controls
- [ ] Change management
- [ ] Risk assessment
- [ ] Vendor management
- [ ] Business continuity plan
- [ ] Incident response plan
- [ ] Monitoring and logging
- [ ] Regular audits

---

## Security Review Frequency

### Daily
- [ ] Review audit logs
- [ ] Check for failed auth attempts
- [ ] Monitor error rates

### Weekly
- [ ] Review security alerts
- [ ] Check dependency vulnerabilities
- [ ] Review access logs

### Monthly
- [ ] Rotate API keys
- [ ] Review user permissions
- [ ] Update dependencies
- [ ] Test backups

### Quarterly
- [ ] Security audit
- [ ] Penetration testing
- [ ] Policy review
- [ ] Team training

### Annually
- [ ] Comprehensive security audit
- [ ] Compliance certification
- [ ] Incident response drill
- [ ] Security roadmap review

---

## Security Score Card

Rate your implementation (0-5 for each):

| Category | Score | Notes |
|----------|-------|-------|
| Credential Management | /5 | |
| Input Validation | /5 | |
| Sandboxing | /5 | |
| Rate Limiting | /5 | |
| Audit Logging | /5 | |
| Network Security | /5 | |
| Data Privacy | /5 | |
| Dependency Security | /5 | |
| Incident Response | /5 | |
| Compliance | /5 | |

**Total: __ / 50**

**Grade:**
- 45-50: Excellent
- 40-44: Good
- 35-39: Acceptable
- 30-34: Needs Improvement
- < 30: Critical Issues

---

*Appendix E | Security Checklist | 8-12 pages*
