# Appendix C: Troubleshooting

> *Common issues and solutions*

---

## Overview

This appendix provides solutions to common problems you might encounter when building or using AI coding assistants. Issues are organized by category for quick reference.

**Categories:**
- Connection and Network Issues
- AI Provider Issues
- Tool Execution Issues
- Performance Issues
- Configuration Issues
- Plugin Issues
- Security Issues

---

## Connection and Network Issues

### Issue: Cannot Connect to Ollama

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**

1. **Check if Ollama is running:**
   ```bash
   # macOS/Linux
   ps aux | grep ollama

   # Or check with curl
   curl http://localhost:11434/api/tags
   ```

2. **Start Ollama:**
   ```bash
   # macOS
   ollama serve

   # Linux (systemd)
   systemctl start ollama

   # Docker
   docker run -d -p 11434:11434 ollama/ollama
   ```

3. **Check Ollama is listening on correct port:**
   ```bash
   # Should show port 11434
   lsof -i :11434
   ```

4. **Verify configuration:**
   ```bash
   # Check config
   ollama-code config show | grep ollama

   # Should match Ollama URL
   export OLLAMA_BASE_URL="http://localhost:11434"
   ```

5. **Test connectivity:**
   ```bash
   curl http://localhost:11434/api/tags
   # Should return list of models
   ```

---

### Issue: Slow API Responses

**Symptoms:**
- Requests take > 30 seconds
- Frequent timeouts

**Solutions:**

1. **Check network latency:**
   ```bash
   # For cloud providers
   ping api.openai.com
   ping api.anthropic.com

   # Should be < 100ms
   ```

2. **Increase timeout:**
   ```json
   {
     "providers": {
       "openai": {
         "timeout": 60000  // 60 seconds
       }
     }
   }
   ```

3. **Use local provider for faster responses:**
   ```bash
   ollama-code --provider ollama chat
   ```

4. **Enable caching:**
   ```json
   {
     "performance": {
       "cacheEnabled": true,
       "cacheTTL": 300000
     }
   }
   ```

5. **Check system resources:**
   ```bash
   # CPU usage
   top

   # Memory usage
   free -h

   # Disk I/O
   iostat
   ```

---

### Issue: SSL/TLS Certificate Errors

**Symptoms:**
```
Error: self signed certificate in certificate chain
```

**Solutions:**

1. **For development only, disable SSL verification:**
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED=0
   ```
   ⚠️ **Warning:** Never use in production!

2. **Install CA certificate:**
   ```bash
   # Add certificate to system trust store
   # macOS
   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca-cert.pem

   # Linux
   sudo cp ca-cert.crt /usr/local/share/ca-certificates/
   sudo update-ca-certificates
   ```

3. **Use custom CA:**
   ```bash
   export NODE_EXTRA_CA_CERTS="/path/to/ca-cert.pem"
   ```

---

## AI Provider Issues

### Issue: Model Not Found

**Symptoms:**
```
Error: model 'codellama:7b' not found
```

**Solutions:**

1. **List available models:**
   ```bash
   # Ollama
   ollama list

   # ollama-code
   ollama-code models list
   ```

2. **Pull the model:**
   ```bash
   # Ollama
   ollama pull codellama:7b

   # ollama-code
   ollama-code models pull codellama:7b
   ```

3. **Verify model name:**
   ```bash
   # Correct
   codellama:7b

   # Incorrect
   codellama  # Missing tag
   code-llama:7b  # Wrong name
   ```

4. **Check disk space:**
   ```bash
   df -h
   # Models can be 4-20 GB
   ```

---

### Issue: API Key Invalid

**Symptoms:**
```
Error: invalid API key
```

**Solutions:**

1. **Verify API key is set:**
   ```bash
   echo $OPENAI_API_KEY
   echo $ANTHROPIC_API_KEY
   ```

2. **Check for whitespace:**
   ```bash
   # Remove whitespace
   export OPENAI_API_KEY=$(echo $OPENAI_API_KEY | tr -d '[:space:]')
   ```

3. **Test API key:**
   ```bash
   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"

   # Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```

4. **Check API key permissions:**
   - Go to provider dashboard
   - Verify key has required permissions
   - Check usage limits not exceeded

5. **Regenerate API key:**
   - Create new key in provider dashboard
   - Update environment variable
   - Test again

---

### Issue: Rate Limited

**Symptoms:**
```
Error: 429 Too Many Requests
Retry-After: 60
```

**Solutions:**

1. **Wait and retry:**
   ```typescript
   // Automatic retry with backoff
   {
     "tools": {
       "retry": {
         "enabled": true,
         "maxRetries": 3,
         "backoff": "exponential"
       }
     }
   }
   ```

2. **Check usage:**
   ```bash
   # Get usage stats
   ollama-code stats
   ```

3. **Implement rate limiting:**
   ```typescript
   {
     "security": {
       "rateLimit": {
         "enabled": true,
         "requestsPerMinute": 20  // Lower limit
       }
     }
   }
   ```

4. **Use caching to reduce requests:**
   ```typescript
   {
     "performance": {
       "cacheEnabled": true,
       "cacheTTL": 600000  // 10 minutes
     }
   }
   ```

5. **Upgrade plan or contact provider**

---

### Issue: Context Length Exceeded

**Symptoms:**
```
Error: This model's maximum context length is 8192 tokens
```

**Solutions:**

1. **Reduce context window:**
   ```typescript
   {
     "conversation": {
       "maxTokens": 4000  // Lower than model limit
     }
   }
   ```

2. **Use conversation strategy:**
   ```typescript
   {
     "conversation": {
       "strategy": "sliding-summary"  // Summarize old messages
     }
   }
   ```

3. **Use model with larger context:**
   ```bash
   # Instead of gpt-4 (8K)
   ollama-code --model gpt-4-turbo chat  # 128K

   # Or
   ollama-code --model claude-3-sonnet chat  # 200K
   ```

4. **Clear conversation history:**
   ```bash
   ollama-code conversation clear
   ```

---

## Tool Execution Issues

### Issue: Permission Denied

**Symptoms:**
```
Error: EACCES: permission denied, open '/etc/hosts'
```

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -la /path/to/file
   ```

2. **Add path to allowed paths:**
   ```json
   {
     "security": {
       "allowedPaths": [
         "~/projects",
         "/path/to/file"
       ]
     }
   }
   ```

3. **Run with appropriate permissions:**
   ```bash
   # If needed (use with caution)
   sudo ollama-code tool execute read-file \
     --params '{"path":"/etc/hosts"}'
   ```

4. **Check sandbox settings:**
   ```json
   {
     "security": {
       "sandboxEnabled": true  // May need to disable
     }
   }
   ```

---

### Issue: Command Not Found

**Symptoms:**
```
Error: command not found: kubectl
```

**Solutions:**

1. **Install missing command:**
   ```bash
   # kubectl
   brew install kubectl  # macOS

   # npm
   npm install -g npm
   ```

2. **Add command to PATH:**
   ```bash
   export PATH=$PATH:/usr/local/bin
   ```

3. **Add command to allowed commands:**
   ```json
   {
     "security": {
       "allowedCommands": [
         "kubectl",
         "docker",
         "git"
       ]
     }
   }
   ```

4. **Use absolute path:**
   ```bash
   /usr/local/bin/kubectl version
   ```

---

### Issue: Tool Timeout

**Symptoms:**
```
Error: Tool execution timed out after 60000ms
```

**Solutions:**

1. **Increase timeout:**
   ```json
   {
     "tools": {
       "timeout": 120000  // 2 minutes
     }
   }
   ```

2. **Increase timeout for specific tool:**
   ```typescript
   class SlowTool implements Tool {
     readonly metadata = {
       name: 'slow-tool',
       timeout: 300000  // 5 minutes
     };
   }
   ```

3. **Optimize tool implementation:**
   ```typescript
   // Use streaming for large outputs
   async *executeStream(params) {
     for (const chunk of largeData) {
       yield chunk;
     }
   }
   ```

4. **Split into smaller operations:**
   ```typescript
   // Instead of one large operation
   await processAllFiles();

   // Break into chunks
   for (const batch of batches) {
     await processBatch(batch);
   }
   ```

---

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- Process using > 2 GB RAM
- System becomes sluggish

**Solutions:**

1. **Enable memory management:**
   ```json
   {
     "performance": {
       "memory": {
         "gcEnabled": true,
         "gcInterval": 30000,
         "maxMemory": 1073741824  // 1 GB
       }
     }
   }
   ```

2. **Reduce cache size:**
   ```json
   {
     "performance": {
       "maxCacheSize": 100  // Down from 1000
     }
   }
   ```

3. **Reduce context window:**
   ```json
   {
     "conversation": {
       "maxTokens": 4000
     }
   }
   ```

4. **Monitor memory:**
   ```bash
   # Linux
   ps aux | grep ollama-code

   # macOS
   top -pid $(pgrep ollama-code)
   ```

5. **Restart periodically:**
   ```bash
   # Restart after N requests
   if [ "$REQUEST_COUNT" -gt 1000 ]; then
     systemctl restart ollama-code
   fi
   ```

---

### Issue: Slow Startup

**Symptoms:**
- Takes > 10 seconds to start

**Solutions:**

1. **Enable lazy loading:**
   ```json
   {
     "plugins": {
       "lazyLoad": true
     }
   }
   ```

2. **Reduce plugins:**
   ```json
   {
     "plugins": {
       "enabled": ["kubernetes"]  // Only what you need
     }
   }
   ```

3. **Disable auto-update check:**
   ```json
   {
     "plugins": {
       "autoUpdate": false
     }
   }
   ```

4. **Use faster model for initialization:**
   ```json
   {
     "providers": {
       "ollama": {
         "model": "codellama:7b"  // Faster than :34b
       }
     }
   }
   ```

---

### Issue: Cache Not Working

**Symptoms:**
- Same request always takes same time
- Cache hit rate 0%

**Solutions:**

1. **Verify cache enabled:**
   ```json
   {
     "performance": {
       "cacheEnabled": true
     }
   }
   ```

2. **Check cache stats:**
   ```bash
   ollama-code cache stats
   ```

3. **Increase cache TTL:**
   ```json
   {
     "performance": {
       "cacheTTL": 600000  // 10 minutes
     }
   }
   ```

4. **Verify cache key generation:**
   ```typescript
   // Ensure consistent keys
   const cacheKey = JSON.stringify({
     model,
     messages: messages.sort()  // Sort for consistency
   });
   ```

5. **Clear and rebuild cache:**
   ```bash
   ollama-code cache clear
   ```

---

## Configuration Issues

### Issue: Configuration Not Loading

**Symptoms:**
- Changes to config file not applied

**Solutions:**

1. **Check config file location:**
   ```bash
   # Should be one of:
   ~/.ollama-code/config.json
   ./.ollama-code/config.json
   /etc/ollama-code/config.json
   ```

2. **Validate JSON syntax:**
   ```bash
   # Check for syntax errors
   cat ~/.ollama-code/config.json | jq .
   ```

3. **Check file permissions:**
   ```bash
   ls -la ~/.ollama-code/config.json
   # Should be readable
   ```

4. **Verify config priority:**
   ```bash
   ollama-code config show --sources
   # Shows which config files are loaded
   ```

5. **Use explicit config:**
   ```bash
   ollama-code --config ~/.ollama-code/config.json chat
   ```

---

### Issue: Environment Variables Not Working

**Symptoms:**
- Environment variables not overriding config

**Solutions:**

1. **Check variable names:**
   ```bash
   # Correct
   export OLLAMA_CODE_PROVIDER="openai"

   # Incorrect
   export PROVIDER="openai"  # Missing prefix
   ```

2. **Verify variables are set:**
   ```bash
   env | grep OLLAMA_CODE
   ```

3. **Check variable priority:**
   ```bash
   # CLI flags > env vars > config file
   ollama-code --provider ollama chat
   # Uses ollama even if OLLAMA_CODE_PROVIDER=openai
   ```

4. **Export variables:**
   ```bash
   # Won't work (not exported)
   OLLAMA_CODE_PROVIDER="openai"

   # Works
   export OLLAMA_CODE_PROVIDER="openai"
   ```

---

## Plugin Issues

### Issue: Plugin Won't Load

**Symptoms:**
```
Error: Failed to load plugin 'kubernetes'
```

**Solutions:**

1. **Check plugin is installed:**
   ```bash
   ollama-code plugins list
   ```

2. **Install plugin:**
   ```bash
   ollama-code plugins install kubernetes
   ```

3. **Check dependencies:**
   ```bash
   ollama-code plugins info kubernetes
   # Check dependency requirements
   ```

4. **Verify plugin compatibility:**
   ```json
   // Plugin metadata
   {
     "dependencies": {
       "platform": "^1.0.0"  // Must match
     }
   }
   ```

5. **Check error logs:**
   ```bash
   tail -f ~/.ollama-code/logs/app.log | grep kubernetes
   ```

---

### Issue: Plugin Version Conflict

**Symptoms:**
```
Error: Plugin 'docker' requires platform ^2.0.0 but ^1.0.0 is installed
```

**Solutions:**

1. **Update platform:**
   ```bash
   npm install -g ollama-code@latest
   ```

2. **Update plugin:**
   ```bash
   ollama-code plugins update docker
   ```

3. **Use compatible version:**
   ```bash
   ollama-code plugins install docker@1.5.0
   ```

4. **Check compatibility matrix:**
   ```bash
   ollama-code plugins compatibility docker
   ```

---

## Security Issues

### Issue: API Keys Exposed in Logs

**Symptoms:**
- API keys visible in log files

**Solutions:**

1. **Enable log sanitization:**
   ```json
   {
     "logging": {
       "sanitize": true,
       "redactPatterns": [
         "sk-[a-zA-Z0-9]+",
         "Bearer [a-zA-Z0-9]+"
       ]
     }
   }
   ```

2. **Set log level to warn:**
   ```json
   {
     "logging": {
       "level": "warn"  // Don't log debug info
     }
   }
   ```

3. **Rotate logs:**
   ```json
   {
     "logging": {
       "rotation": {
         "maxSize": "10m",
         "maxFiles": 3
       }
     }
   }
   ```

4. **Use secret management:**
   ```bash
   # Use secret manager instead of env vars
   export OPENAI_API_KEY=$(aws secretsmanager get-secret-value \
     --secret-id openai-key --query SecretString --output text)
   ```

---

### Issue: Sandbox Bypass

**Symptoms:**
- Tools executing outside allowed paths

**Solutions:**

1. **Enable strict sandbox:**
   ```json
   {
     "security": {
       "sandboxEnabled": true,
       "strictMode": true
     }
   }
   ```

2. **Review allowed paths:**
   ```json
   {
     "security": {
       "allowedPaths": [
         "~/projects"  // Only this directory
       ]
     }
   }
   ```

3. **Add denied paths:**
   ```json
   {
     "security": {
       "deniedPaths": [
         "~/.ssh",
         "~/.aws",
         "/etc"
       ]
     }
   }
   ```

4. **Enable audit logging:**
   ```json
   {
     "security": {
       "audit": {
         "enabled": true,
         "events": ["file:read", "file:write", "command:execute"]
       }
     }
   }
   ```

---

## Debugging Tips

### Enable Debug Logging

```bash
# Environment variable
export OLLAMA_CODE_LOG_LEVEL="debug"

# CLI flag
ollama-code --log-level debug chat

# Configuration
{
  "logging": {
    "level": "debug"
  }
}
```

### Trace Requests

```bash
# Enable request tracing
export OLLAMA_CODE_TRACE="true"

# View traces
ollama-code traces list
ollama-code traces show <trace-id>
```

### Health Check

```bash
# Check system health
ollama-code health

# Check specific component
ollama-code health --component providers
ollama-code health --component tools
ollama-code health --component plugins
```

### Collect Diagnostics

```bash
# Generate diagnostic report
ollama-code diagnostics > diagnostics.txt

# Includes:
# - System info
# - Configuration
# - Logs
# - Health checks
# - Resource usage
```

---

## Getting Help

### Community Support

- **GitHub Issues:** https://github.com/ollama-code/ollama-code/issues
- **Discord:** https://discord.gg/ollama-code
- **Stack Overflow:** Tag `ollama-code`

### Commercial Support

- **Email:** support@ollama-code.dev
- **Slack:** Private Slack channel (Enterprise)
- **SLA:** 24-hour response time (Enterprise)

### Reporting Bugs

Include:
1. **Version:** `ollama-code --version`
2. **OS:** `uname -a`
3. **Configuration:** `ollama-code config show`
4. **Logs:** Last 100 lines of error logs
5. **Steps to reproduce**

---

*Appendix C | Troubleshooting | 10-15 pages*
