# Error Handling Documentation

This document provides comprehensive information about the error handling system in Ollama Code, including error categories, resolution strategies, and logging mechanisms.

## Table of Contents

- [Error Handling Overview](#error-handling-overview)
- [Error Categories](#error-categories)
- [Error Levels](#error-levels)
- [Error Types](#error-types)
- [Resolution Strategies](#resolution-strategies)
- [Logging System](#logging-system)
- [Error Recovery](#error-recovery)
- [Best Practices](#best-practices)
- [Troubleshooting Guide](#troubleshooting-guide)

## Error Handling Overview

The Ollama Code CLI implements a comprehensive error handling system designed to provide clear, actionable feedback to users while maintaining detailed logging for debugging purposes.

### Key Principles

1. **User-Friendly Messages**: Errors are presented in clear, non-technical language
2. **Actionable Guidance**: Each error includes specific steps to resolve the issue
3. **Categorized Classification**: Errors are organized by type and severity
4. **Comprehensive Logging**: Detailed error information is logged for debugging
5. **Graceful Degradation**: The application continues functioning when possible

## Error Categories

The error handling system categorizes errors into specific types for better organization and handling:

### Application Errors (`APPLICATION`)
General application-level errors that don't fit into other categories.

**Common Examples:**
- Invalid command arguments
- Missing required parameters
- Application state errors

**Resolution Strategies:**
- Check command syntax
- Verify all required parameters are provided
- Restart the application if state is corrupted

### Authentication Errors (`AUTHENTICATION`)
Errors related to user authentication and authorization.

**Common Examples:**
- Invalid credentials
- Expired tokens
- Permission denied

**Resolution Strategies:**
- Re-authenticate using `ollama-code login`
- Check Ollama server status
- Verify network connectivity

### Network Errors (`NETWORK`)
Errors related to network connectivity and communication.

**Common Examples:**
- Connection timeouts
- DNS resolution failures
- Network unreachable

**Resolution Strategies:**
- Check internet connection
- Verify Ollama server is running
- Check firewall settings
- Try different server URL

### File System Errors (`FILE_SYSTEM`)
Errors related to file and directory operations.

**Common Examples:**
- File not found
- Permission denied
- Disk space full
- Invalid file path

**Resolution Strategies:**
- Verify file exists and path is correct
- Check file permissions
- Ensure sufficient disk space
- Use absolute paths if relative paths fail

### Command Execution Errors (`COMMAND_EXECUTION`)
Errors related to executing external commands.

**Common Examples:**
- Command not found
- Invalid command syntax
- Process execution failure

**Resolution Strategies:**
- Verify command is installed and in PATH
- Check command syntax
- Ensure proper permissions
- Try running command manually

### AI Service Errors (`AI_SERVICE`)
Errors related to AI model interactions.

**Common Examples:**
- Model not found
- API rate limits
- Invalid model parameters
- Service unavailable

**Resolution Strategies:**
- Check if model is installed (`ollama-code list-models`)
- Download missing model (`ollama-code pull-model <name>`)
- Wait and retry for rate limits
- Verify Ollama service is running

### Configuration Errors (`CONFIGURATION`)
Errors related to application configuration.

**Common Examples:**
- Invalid configuration values
- Missing configuration files
- Configuration format errors

**Resolution Strategies:**
- Check configuration file syntax
- Reset to default configuration
- Verify configuration values
- Recreate configuration file

### Resource Errors (`RESOURCE`)
Errors related to system resource limitations.

**Common Examples:**
- Memory exhaustion
- CPU overload
- File handle limits

**Resolution Strategies:**
- Close unnecessary applications
- Increase system resources
- Optimize application usage
- Restart the system

### Validation Errors (`VALIDATION`)
Errors related to input validation.

**Common Examples:**
- Invalid input format
- Missing required fields
- Value out of range

**Resolution Strategies:**
- Check input format and requirements
- Provide all required fields
- Ensure values are within valid ranges
- Follow input guidelines

### Timeout Errors (`TIMEOUT`)
Errors related to operation timeouts.

**Common Examples:**
- Request timeout
- Operation timeout
- Connection timeout

**Resolution Strategies:**
- Increase timeout values
- Check network stability
- Retry the operation
- Use smaller requests

### Connection Errors (`CONNECTION`)
Errors related to establishing or maintaining connections.

**Common Examples:**
- Connection refused
- Connection reset
- Connection lost

**Resolution Strategies:**
- Verify service is running
- Check network connectivity
- Restart the service
- Check firewall settings

## Error Levels

The error handling system uses a hierarchical level system to categorize error severity:

### Debug (`DEBUG` - Level 0)
Detailed information for debugging purposes.

**Usage:**
- Development debugging
- Detailed diagnostic information
- Step-by-step execution traces

**Logging:**
- Only shown when debug mode is enabled
- Includes stack traces and detailed context

### Info (`INFO` - Level 1)
General informational messages.

**Usage:**
- Normal operation status
- Successful operations
- General application state

**Logging:**
- Shown by default
- Provides context about application flow

### Warning (`WARNING` - Level 2)
Warning messages that don't prevent operation.

**Usage:**
- Non-critical issues
- Deprecated feature usage
- Performance warnings

**Logging:**
- Shown by default
- Indicates potential issues

### Error (`ERROR` - Level 3)
Error conditions that prevent normal operation.

**Usage:**
- Failed operations
- Invalid inputs
- Service unavailability

**Logging:**
- Always shown
- Requires user attention

### Critical (`CRITICAL` - Level 4)
Critical errors that severely impact functionality.

**Usage:**
- System failures
- Data corruption
- Security issues

**Logging:**
- Always shown with high priority
- May require immediate attention

### Fatal (`FATAL` - Level 5)
Fatal errors that cause application termination.

**Usage:**
- Unrecoverable errors
- System crashes
- Memory corruption

**Logging:**
- Always shown
- Application terminates after logging

## Error Types

### UserError
User-correctable errors with clear resolution steps.

**Characteristics:**
- Clear, non-technical messages
- Specific resolution steps
- User-friendly formatting
- Actionable guidance

**Example:**
```typescript
throw createUserError('File not found', {
  category: ErrorCategory.FILE_NOT_FOUND,
  resolution: 'Please check the file path and ensure the file exists'
});
```

### SystemError
Technical errors requiring system-level fixes.

**Characteristics:**
- Technical error messages
- System-level context
- Developer-focused information
- May include stack traces

**Example:**
```typescript
throw new Error('EACCES: permission denied, open file');
```

### NetworkError
Network-related errors with retry suggestions.

**Characteristics:**
- Network-specific context
- Retry recommendations
- Connection status information
- Timeout handling

**Example:**
```typescript
throw createUserError('Connection timeout', {
  category: ErrorCategory.TIMEOUT,
  resolution: 'Check your internet connection and try again'
});
```

## Resolution Strategies

### Automatic Recovery
The system attempts automatic recovery for certain error types:

1. **Network Errors**: Automatic retry with exponential backoff
2. **Temporary Failures**: Retry with increasing delays
3. **Resource Errors**: Attempt to free resources and retry
4. **Configuration Errors**: Fall back to default configuration

### User Guidance
Clear, step-by-step instructions for resolving errors:

1. **Immediate Actions**: What the user should do right now
2. **Verification Steps**: How to confirm the fix worked
3. **Prevention Tips**: How to avoid the error in the future
4. **Alternative Approaches**: Other ways to achieve the goal

### Escalation Paths
When automatic recovery fails:

1. **User Resolution**: Clear instructions for manual fixes
2. **System Administrator**: Steps requiring admin privileges
3. **Developer Support**: Issues requiring code changes
4. **External Support**: Issues requiring vendor assistance

## Logging System

### Log Levels
The logging system supports multiple levels of detail:

```typescript
enum LogLevel {
  DEBUG = 0,    // Detailed debugging information
  INFO = 1,     // General information
  WARN = 2,     // Warning messages
  ERROR = 3,    // Error messages
  SILENT = 4    // No logging
}
```

### Log Format
Structured logging with consistent format:

```
[timestamp] [level] [category] message
```

**Example:**
```
[2024-01-15T10:30:45.123Z] [ERROR] [AI_SERVICE] Failed to connect to Ollama server
```

### Log Context
Additional context information included in logs:

- **Error Category**: Type of error
- **Error Code**: Unique identifier
- **Stack Trace**: For debugging
- **User Context**: Current user/session
- **System Context**: OS, version, etc.

### Log Destinations
Logs can be written to multiple destinations:

1. **Console**: Real-time display
2. **File**: Persistent storage
3. **Remote**: Centralized logging service
4. **Memory**: In-memory buffer for debugging

## Error Recovery

### Retry Mechanisms
Automatic retry for transient errors:

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}
```

### Fallback Strategies
Alternative approaches when primary methods fail:

1. **Configuration Fallbacks**: Use default values
2. **Service Fallbacks**: Try alternative services
3. **Method Fallbacks**: Use different approaches
4. **Resource Fallbacks**: Use alternative resources

### Graceful Degradation
Continue operation with reduced functionality:

1. **Feature Disabling**: Turn off non-essential features
2. **Mode Switching**: Switch to offline mode
3. **Caching**: Use cached data when available
4. **Simplified Operations**: Use basic functionality

## Best Practices

### Error Creation
When creating errors:

1. **Use Appropriate Categories**: Choose the most specific category
2. **Provide Clear Messages**: Use non-technical language
3. **Include Resolution Steps**: Give specific actions to take
4. **Add Context**: Include relevant information
5. **Use Error Codes**: For programmatic handling

### Error Handling
When handling errors:

1. **Catch Specific Errors**: Handle different error types appropriately
2. **Log Before Re-throwing**: Always log errors before propagating
3. **Provide User Feedback**: Show meaningful messages to users
4. **Implement Recovery**: Attempt automatic recovery when possible
5. **Document Errors**: Keep track of error patterns

### Error Prevention
To prevent errors:

1. **Validate Inputs**: Check all inputs before processing
2. **Handle Edge Cases**: Consider all possible scenarios
3. **Use Type Safety**: Leverage TypeScript for compile-time checks
4. **Test Error Paths**: Include error scenarios in tests
5. **Monitor Error Rates**: Track error frequency and patterns

## Troubleshooting Guide

### Common Error Scenarios

#### "Connection refused" Error
**Symptoms:**
- Cannot connect to Ollama server
- Network-related error messages

**Diagnosis:**
1. Check if Ollama is running: `ollama list`
2. Verify server URL: `ollama-code config ollama.serverUrl`
3. Test network connectivity: `ping localhost`

**Resolution:**
1. Start Ollama server: `ollama serve`
2. Check firewall settings
3. Verify port 11434 is available
4. Try different server URL

#### "Model not found" Error
**Symptoms:**
- AI commands fail with model errors
- Model-related error messages

**Diagnosis:**
1. List available models: `ollama-code list-models`
2. Check model name spelling
3. Verify model is downloaded

**Resolution:**
1. Download the model: `ollama-code pull-model <name>`
2. Check model name spelling
3. Wait for download to complete
4. Try a different model

#### "File not found" Error
**Symptoms:**
- Cannot access specified files
- File system error messages

**Diagnosis:**
1. Check file path spelling
2. Verify file exists
3. Check file permissions
4. Use absolute paths

**Resolution:**
1. Correct file path
2. Create missing files
3. Fix file permissions
4. Use absolute paths

#### "Permission denied" Error
**Symptoms:**
- Cannot access files or directories
- Permission-related error messages

**Diagnosis:**
1. Check file permissions: `ls -la <file>`
2. Verify user permissions
3. Check directory permissions

**Resolution:**
1. Fix file permissions: `chmod 644 <file>`
2. Fix directory permissions: `chmod 755 <dir>`
3. Run with appropriate privileges
4. Change file ownership if needed

### Debug Mode
Enable debug mode for detailed error information:

```bash
# Set debug environment variable
export DEBUG=true

# Run with debug logging
ollama-code --verbose ask "your question"

# Check debug logs
ollama-code config logger.level debug
```

### Error Reporting
When reporting errors:

1. **Include Error Message**: Copy the exact error text
2. **Provide Context**: Describe what you were doing
3. **Include Logs**: Attach relevant log files
4. **System Information**: OS, version, etc.
5. **Steps to Reproduce**: How to trigger the error

### Getting Help
Additional resources for error resolution:

1. **Documentation**: Check this error handling guide
2. **Command Help**: Use `ollama-code help <command>`
3. **GitHub Issues**: Search existing issues
4. **Community Support**: Ask in discussions
5. **Professional Support**: Contact support team

This error handling documentation provides comprehensive guidance for understanding, resolving, and preventing errors in the Ollama Code CLI. For specific error scenarios not covered here, use the debug mode and error reporting mechanisms to get additional assistance.
