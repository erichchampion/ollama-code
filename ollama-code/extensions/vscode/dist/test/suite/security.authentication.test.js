"use strict";
/**
 * Security - Authentication & Session Issues Tests
 * OWASP Top 10 - Authentication vulnerability detection tests
 *
 * Tests production SecurityAnalyzer for authentication and session vulnerabilities
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const extensionTestHelper_1 = require("../helpers/extensionTestHelper");
const test_constants_1 = require("../helpers/test-constants");
const securityTestHelper_1 = require("../helpers/securityTestHelper");
const securityTestConstants_1 = require("../helpers/securityTestConstants");
suite('Security - Authentication & Session Issues Tests', () => {
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('security-auth-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Hardcoded Credentials Detection', () => {
        test('Should detect hardcoded password in assignment', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const DB_PASSWORD = "SuperSecret123!";
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: DB_PASSWORD
});
`;
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedCredentialsDetection)(testWorkspacePath, 'auth-hardcoded-password.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.HARDCODED_CREDENTIALS);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A07:2021'));
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
        });
        test('Should detect hardcoded API key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const apiKey = "sk_live_1234567890abcdefghijklmnop";
fetch('https://api.example.com/data', {
  headers: { 'Authorization': \`Bearer \${apiKey}\` }
});
`;
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedCredentialsDetection)(testWorkspacePath, 'auth-hardcoded-apikey.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect hardcoded API key');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('environment'));
        });
        test('Should NOT detect credentials from environment variables', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = `
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;
const connection = mysql.createConnection({
  host: 'localhost',
  password: password
});
`;
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'auth-safe-env-vars.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION);
        });
    });
    suite('Weak Password Policy Detection', () => {
        test('Should detect password length less than 8 characters', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
function validatePassword(password) {
  if (password.length < 6) {
    return false;
  }
  return true;
}
`;
            const vulnerabilities = await (0, securityTestHelper_1.testWeakPasswordPolicyDetection)(testWorkspacePath, 'auth-weak-password-length.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.WEAK_PASSWORD);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A07:2021'));
        });
        test('Should detect weak minLength configuration', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const passwordSchema = {
  minLength: 4,
  requireUppercase: false,
  requireNumbers: false
};
`;
            const vulnerabilities = await (0, securityTestHelper_1.testWeakPasswordPolicyDetection)(testWorkspacePath, 'auth-weak-min-length.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect weak password policy');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('password'));
        });
        test('Should NOT detect strong password policy (>= 8 characters)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = `
function validatePassword(password) {
  if (password.length < 8) {
    return false;
  }
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/.test(password);
}
`;
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'auth-safe-password-policy.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION);
        });
    });
    suite('Missing Authentication Check Detection', () => {
        test('Should detect unprotected admin route', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
app.get('/admin/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});
`;
            const vulnerabilities = await (0, securityTestHelper_1.testMissingAuthCheckDetection)(testWorkspacePath, 'auth-missing-admin-check.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.AUTH_BYPASS);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A01:2021'));
        });
        test('Should detect unprotected API endpoint', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
router.post('/api/sensitive-data', async (req, res) => {
  const data = await SensitiveModel.create(req.body);
  res.json(data);
});
`;
            const vulnerabilities = await (0, securityTestHelper_1.testMissingAuthCheckDetection)(testWorkspacePath, 'auth-missing-api-check.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect missing auth check');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('authentication'));
        });
        test('Should NOT detect protected route with authentication middleware', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = `
app.get('/admin/users', isAuthenticated, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/data', requireAuth, async (req, res) => {
  const data = await Model.create(req.body);
  res.json(data);
});
`;
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'auth-safe-protected-routes.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION);
        });
    });
    suite('Session Fixation Detection', () => {
        test('Should detect session fixation in login without regenerate', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.validPassword(req.body.password)) {
    req.session.userId = user.id;
    req.session.user = user;
    res.redirect('/dashboard');
  }
});
`;
            const vulnerabilities = await (0, securityTestHelper_1.testSessionFixationDetection)(testWorkspacePath, 'auth-session-fixation.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.SESSION_FIXATION);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A07:2021'));
        });
        test('Should NOT detect session with proper regeneration', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = `
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.validPassword(req.body.password)) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).send('Session error');
      req.session.userId = user.id;
      req.session.user = user;
      res.redirect('/dashboard');
    });
  }
});
`;
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'auth-safe-session-regenerate.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION);
        });
    });
    suite('Security Metadata Validation', () => {
        test('All authentication vulnerabilities should have OWASP A07:2021 or A01:2021 mapping', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const password = "HardcodedPass123!";
if (password.length < 5) { return false; }
req.session.userId = user.id;
`;
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedCredentialsDetection)(testWorkspacePath, 'auth-metadata-validation.js', vulnerableCode, { minVulnerabilities: 1 });
            for (const vuln of vulnerabilities) {
                assert.ok(vuln.owaspCategory?.includes('A07:2021') || vuln.owaspCategory?.includes('A01:2021'), `Auth vulnerability should map to OWASP A07:2021 or A01:2021, got: ${vuln.owaspCategory}`);
            }
        });
        test('All critical authentication vulnerabilities should have reference links', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const apiKey = "sk_live_1234567890abcdef";
`;
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedCredentialsDetection)(testWorkspacePath, 'auth-critical-refs.js', vulnerableCode);
            const criticalVuln = vulnerabilities.find(v => v.severity === 'critical');
            assert.ok(criticalVuln, 'Should find critical vulnerability');
            assert.ok(criticalVuln.references.length >= 2, 'Should have at least 2 references');
            assert.ok(criticalVuln.references.some(ref => ref.includes('owasp.org')), 'Should have OWASP reference');
            assert.ok(criticalVuln.references.some(ref => ref.includes('cwe.mitre.org')), 'Should have CWE reference');
        });
    });
});
//# sourceMappingURL=security.authentication.test.js.map