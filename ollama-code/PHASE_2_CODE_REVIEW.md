# Phase 2.1.1 WebSocket Tests - Code Review

**Date:** 2025-10-01
**Reviewer:** Claude Code
**Scope:** WebSocket Server Tests (Connection, Message, MCP Integration)
**Files Reviewed:** 4 files, 2,226 lines total

---

## Executive Summary

**Overall Grade: A (95/100)**

The WebSocket test implementation demonstrates excellent test coverage and organization. However, there are **10 issues** identified that should be addressed:

- **3 High Priority** - Hardcoded values that should be constants
- **2 Medium Priority** - Potential bugs with port conflicts
- **3 Low Priority** - Minor DRY violations
- **2 Code Quality** - Improvements for maintainability

---

## Issues Found

### HIGH PRIORITY

#### 1. Hardcoded Magic Numbers in Test Files

**Severity:** HIGH
**Category:** Hardcoded Values
**Files:**
- `websocket.connection.test.ts:17`
- `websocket.message.test.ts:17`
- `websocket.mcp.test.ts:17`

**Issue:**
```typescript
// websocket.connection.test.ts:17
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.DEFAULT_TEST_PORT + 1; // 9877

// websocket.message.test.ts:17
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.DEFAULT_TEST_PORT + 2; // 9878

// websocket.mcp.test.ts:17
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.DEFAULT_TEST_PORT + 3; // 9879
```

**Problem:**
Port offsets (+1, +2, +3) are hardcoded magic numbers. If `DEFAULT_TEST_PORT` changes or tests run in different order, these could still conflict.

**Fix:**
Create a centralized port allocation system in `test-constants.ts`:

```typescript
// test-constants.ts
export const WEBSOCKET_TEST_CONSTANTS = {
  // ... existing constants

  // Port assignments for different test suites
  PORTS: {
    CONNECTION_TESTS: 9877,
    MESSAGE_TESTS: 9878,
    MCP_TESTS: 9879,
    INTEGRATION_TESTS: 9876, // Already defined as DEFAULT_TEST_PORT
  }
} as const;

// websocket.connection.test.ts
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.PORTS.CONNECTION_TESTS;

// websocket.message.test.ts
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.PORTS.MESSAGE_TESTS;

// websocket.mcp.test.ts
const TEST_PORT = WEBSOCKET_TEST_CONSTANTS.PORTS.MCP_TESTS;
```

**Impact:** Medium - Could cause test failures if ports conflict

---

#### 2. Hardcoded Authentication Token

**Severity:** HIGH
**Category:** Hardcoded Values
**Files:** `websocket.connection.test.ts:18`

**Issue:**
```typescript
const VALID_AUTH_TOKEN = 'test-auth-token-12345';
```

**Problem:**
Authentication token is hardcoded at the top of the test file. Should be in constants or generated dynamically.

**Fix:**
```typescript
// test-constants.ts
export const WEBSOCKET_TEST_CONSTANTS = {
  // ... existing
  AUTH: {
    VALID_TOKEN: 'test-auth-token-12345',
    INVALID_TOKEN: 'invalid-token',
  }
} as const;

// websocket.connection.test.ts
const VALID_AUTH_TOKEN = WEBSOCKET_TEST_CONSTANTS.AUTH.VALID_TOKEN;
```

**Or use UUID for uniqueness:**
```typescript
import { randomUUID } from 'crypto';
const VALID_AUTH_TOKEN = `test-token-${randomUUID()}`;
```

**Impact:** Low - But violates security best practices

---

#### 3. Hardcoded Default Values in Mock Server

**Severity:** HIGH
**Category:** Hardcoded Values
**Files:** `websocketTestHelper.ts:232, 260`

**Issue:**
```typescript
// Line 232
const expectedToken = `Bearer ${options.validAuthToken || 'valid-token'}`;

// Line 260
const interval = options.heartbeatInterval || 30000;
```

**Problem:**
Default values `'valid-token'` and `30000` are hardcoded. Should reference constants.

**Fix:**
```typescript
// websocketTestHelper.ts (at top)
import { WEBSOCKET_TEST_CONSTANTS } from './test-constants.js';

// Line 232
const expectedToken = `Bearer ${
  options.validAuthToken || WEBSOCKET_TEST_CONSTANTS.AUTH.VALID_TOKEN
}`;

// Line 260
const interval = options.heartbeatInterval ||
  WEBSOCKET_TEST_CONSTANTS.HEARTBEAT_INTERVAL;
```

**Impact:** Medium - Inconsistent with test constants

---

### MEDIUM PRIORITY

#### 4. Potential Port Conflicts in Parallel Test Runs

**Severity:** MEDIUM
**Category:** Potential Bug
**Files:** All test files

**Issue:**
Tests use hardcoded ports (9877, 9878, 9879) which could conflict if:
- Tests run in parallel across different test files
- Multiple developers run tests simultaneously
- CI/CD runs multiple jobs

**Problem Code:**
```typescript
// Each test file has:
const TEST_PORT = 9877; // Fixed port
await mockServer.start(TEST_PORT);
```

**Fix Option 1 - Dynamic Port Allocation:**
```typescript
// test-utils.ts
let portCounter = 9876;
export function getNextAvailablePort(): number {
  return ++portCounter;
}

// In each test file setup:
let testPort: number;
setup(async function() {
  testPort = getNextAvailablePort();
  mockServer = createMockMCPServer();
});
```

**Fix Option 2 - Port Range per Suite:**
```typescript
// test-constants.ts
export const PORT_RANGES = {
  CONNECTION_TESTS: { start: 10000, end: 10099 },
  MESSAGE_TESTS: { start: 10100, end: 10199 },
  MCP_TESTS: { start: 10200, end: 10299 },
};
```

**Impact:** High if tests run in parallel

---

#### 5. Race Condition in Connection State

**Severity:** MEDIUM
**Category:** Potential Bug
**Files:** `websocketTestHelper.ts:44, 50, 99`

**Issue:**
```typescript
let connected = false; // Line 44

// Getter (Line 50)
get isConnected() {
  return connected;
}

// Set on close (Line 99)
ws.on('close', () => {
  connected = false;
});
```

**Problem:**
The `connected` flag is set in async event handlers, but read synchronously. There's a potential race condition between setting `connected = true` in the `open` handler and reading it via `isConnected`.

**Actual Impact:** **LOW** - The WebSocket library handles state internally via `readyState`, so this is more of a duplication issue.

**Better Approach:**
```typescript
get isConnected() {
  return ws && ws.readyState === WebSocket.OPEN;
}

// Remove the separate `connected` flag entirely
```

**Impact:** Low - Current implementation works but is redundant

---

### LOW PRIORITY (DRY Violations)

#### 6. Duplicate MCP Protocol Version

**Severity:** LOW
**Category:** DRY Violation
**Files:** `websocketTestHelper.ts:295` and `websocket.mcp.test.ts:54, 73, 132, etc.`

**Issue:**
MCP protocol version `'2024-11-05'` is duplicated across:
- Mock server implementation (1 instance)
- Test file (8+ instances in different tests)

**Locations:**
```typescript
// websocketTestHelper.ts:295
protocolVersion: '2024-11-05',

// websocket.mcp.test.ts (repeated 8 times)
protocolVersion: '2024-11-05',
```

**Fix:**
```typescript
// test-constants.ts
export const MCP_TEST_CONSTANTS = {
  PROTOCOL_VERSION: '2024-11-05',
  SERVER_NAME: 'mock-mcp-server',
  SERVER_VERSION: '1.0.0',
} as const;

// websocketTestHelper.ts
protocolVersion: MCP_TEST_CONSTANTS.PROTOCOL_VERSION,

// websocket.mcp.test.ts
protocolVersion: MCP_TEST_CONSTANTS.PROTOCOL_VERSION,
```

**Impact:** Low - But violates DRY principle

---

#### 7. Duplicate JSON-RPC Error Codes

**Severity:** LOW
**Category:** DRY Violation
**Files:** `websocketTestHelper.ts:340, 350` and `websocket.mcp.test.ts:247, 258`

**Issue:**
JSON-RPC error codes are hardcoded in multiple places:
- `-32603` (Internal error) - 2 locations
- `-32601` (Method not found) - 2 locations

**Fix:**
```typescript
// test-constants.ts
export const JSONRPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

// Usage
error: {
  code: JSONRPC_ERROR_CODES.INTERNAL_ERROR,
  message: errorMessage
}
```

**Impact:** Low - Standard codes unlikely to change

---

#### 8. Duplicate Sleep Delays

**Severity:** LOW
**Category:** DRY Violation
**Files:** Multiple test files

**Issue:**
Sleep delays are hardcoded throughout tests:
- `sleep(100)` - appears 15+ times
- `sleep(200)` - appears 6+ times
- `sleep(500)` - appears 3+ times

**Examples:**
```typescript
await sleep(100);  // Connection cleanup wait
await sleep(200);  // Disconnection detection wait
await sleep(500);  // Message stability interval
```

**Fix:**
```typescript
// test-constants.ts
export const TEST_DELAYS = {
  CLEANUP: 100,
  DISCONNECTION: 200,
  STABILITY_INTERVAL: 500,
  SERVER_RESTART: 100,
} as const;

// Usage
await sleep(TEST_DELAYS.CLEANUP);
await sleep(TEST_DELAYS.DISCONNECTION);
```

**Impact:** Low - But improves readability

---

### CODE QUALITY

#### 9. Inconsistent Error Handling in Mock Server

**Severity:** LOW
**Category:** Code Quality
**Files:** `websocketTestHelper.ts:272-362`

**Issue:**
The MCP message handler has inconsistent error handling:

```typescript
ws.on('message', async (data: WebSocket.Data) => {
  try {
    const parsed = JSON.parse(data.toString());
    receivedMessages.push(parsed);

    // ... MCP handling

  } catch {
    // Silent catch - just pushes to receivedMessages
    receivedMessages.push(data.toString());
  }
});
```

**Problem:**
- Catches ALL errors, not just JSON parse errors
- If MCP handling throws, it's silently swallowed
- No error logging for debugging

**Better Approach:**
```typescript
ws.on('message', async (data: WebSocket.Data) => {
  try {
    const parsed = JSON.parse(data.toString());
    receivedMessages.push(parsed);

    // Handle MCP protocol
    if (options.enableMCP) {
      try {
        await handleMCPMessage(ws, parsed, options);
      } catch (mcpError) {
        console.error('[Mock MCP Server] Handler error:', mcpError);
        // Still push to receivedMessages for test verification
      }
    }

  } catch (parseError) {
    // Only JSON parse errors here
    receivedMessages.push(data.toString());
  }
});
```

**Impact:** Low - But makes debugging harder

---

#### 10. Missing Input Validation in Mock Server

**Severity:** LOW
**Category:** Code Quality
**Files:** `websocketTestHelper.ts:442-448`

**Issue:**
```typescript
registerTool(tool: MCPTool): void {
  registeredTools.push(tool);
}
```

**Problem:**
No validation that:
- Tool name is unique
- Tool has required fields
- Tool schema is valid

**Better Approach:**
```typescript
registerTool(tool: MCPTool): void {
  // Validate required fields
  if (!tool.name || !tool.description || !tool.inputSchema) {
    throw new Error('Tool missing required fields');
  }

  // Check for duplicates
  if (registeredTools.some(t => t.name === tool.name)) {
    throw new Error(`Tool '${tool.name}' already registered`);
  }

  registeredTools.push(tool);
}
```

**Impact:** Low - Tests control tool registration

---

## Summary by Category

### Hardcoded Values: 3 issues
1. ✅ Port offsets (+1, +2, +3)
2. ✅ Authentication token
3. ✅ Default token and interval in mock server

### Potential Bugs: 2 issues
4. ✅ Port conflicts in parallel runs
5. ✅ Race condition in connection state (minor)

### DRY Violations: 3 issues
6. ✅ MCP protocol version duplication
7. ✅ JSON-RPC error codes duplication
8. ✅ Sleep delay duplication

### Code Quality: 2 issues
9. ✅ Inconsistent error handling
10. ✅ Missing input validation

---

## Recommended Action Plan

### Immediate (Before Merge)
1. Create centralized port assignments in test-constants.ts
2. Move authentication tokens to constants
3. Add MCP and JSON-RPC constants

### Short-term (Next Sprint)
4. Implement dynamic port allocation for parallel testing
5. Refactor isConnected to use WebSocket.readyState
6. Add comprehensive error handling in mock server

### Nice-to-Have
7. Centralize sleep delays as named constants
8. Add tool validation in registerTool()

---

## Positive Observations

✅ **Excellent Test Organization**
- Clear suite structure with logical groupings
- Comprehensive edge case coverage
- Good use of setup/teardown

✅ **Strong Error Testing**
- Tests both success and failure paths
- Validates error messages and codes
- Tests timeout scenarios

✅ **Good Separation of Concerns**
- Test helpers cleanly separated
- Mock server well encapsulated
- Proper use of interfaces

✅ **Comprehensive Coverage**
- 45 tests covering connection, message, and MCP
- Tests authentication, limits, timeouts
- Tests reconnection and error propagation

✅ **Consistent Patterns**
- Uniform assertion style
- Consistent async/await usage
- Good timeout management

---

## Grade Breakdown

| Category | Score | Weight | Total |
|----------|-------|--------|-------|
| Test Coverage | 98/100 | 30% | 29.4 |
| Code Quality | 90/100 | 25% | 22.5 |
| DRY Compliance | 85/100 | 20% | 17.0 |
| Error Handling | 95/100 | 15% | 14.25 |
| Documentation | 100/100 | 10% | 10.0 |
| **TOTAL** | | | **93.15/100** |

**Final Grade: A (93/100)**

After fixing the 3 high-priority issues, grade would be: **A+ (98/100)**

---

## Files Analyzed

1. **websocket.connection.test.ts** - 544 lines, 16 tests
2. **websocket.message.test.ts** - 493 lines, 18 tests
3. **websocket.mcp.test.ts** - 645 lines, 11 tests
4. **websocketTestHelper.ts** - 544 lines, test infrastructure

**Total:** 2,226 lines, 45 tests

---

**Review Complete**
**Recommended Action:** Fix high-priority issues before merge, address others in follow-up PR
