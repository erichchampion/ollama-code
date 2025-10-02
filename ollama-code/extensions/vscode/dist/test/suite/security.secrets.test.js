"use strict";
/**
 * Security - Sensitive Data Exposure Tests
 * OWASP Top 10 - Sensitive data exposure vulnerability detection tests
 *
 * Tests production SecurityAnalyzer for sensitive data exposure vulnerabilities
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
suite('Security - Sensitive Data Exposure Tests', () => {
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('security-secrets-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Hardcoded API Keys Detection', () => {
        test('Should detect hardcoded AWS access key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.HARDCODED_API_KEY_AWS();
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-aws-key.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.HARDCODED_SECRETS);
            assert.ok(vulnerabilities[0].owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A02_CRYPTOGRAPHIC));
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
        });
        test('Should detect hardcoded Stripe API key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.HARDCODED_API_KEY_STRIPE();
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-stripe-key.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect hardcoded Stripe API key');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('environment'));
        });
        test('Should detect hardcoded GitHub token', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.HARDCODED_API_KEY_GITHUB();
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-github-token.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect hardcoded GitHub token');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
        });
        test('Should NOT detect API keys from environment variables', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SAFE_ENV_VARS_API_KEY();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'secrets-safe-env-vars.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS);
        });
    });
    suite('Exposed Encryption Keys Detection', () => {
        test('Should detect exposed AES encryption key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.EXPOSED_ENCRYPTION_KEY_AES();
            const vulnerabilities = await (0, securityTestHelper_1.testExposedEncryptionKeysDetection)(testWorkspacePath, 'secrets-aes-key.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.EXPOSED_ENCRYPTION_KEYS);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.ok(vulnerabilities[0].owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A02_CRYPTOGRAPHIC));
        });
        test('Should detect exposed JWT secret key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.EXPOSED_ENCRYPTION_KEY_JWT();
            const vulnerabilities = await (0, securityTestHelper_1.testExposedEncryptionKeysDetection)(testWorkspacePath, 'secrets-jwt-secret.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect exposed JWT secret');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('key'));
        });
    });
    suite('Sensitive Data in Logs Detection', () => {
        test('Should detect password in console.log', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SENSITIVE_DATA_IN_LOGS_PASSWORD();
            const vulnerabilities = await (0, securityTestHelper_1.testSensitiveDataInLogsDetection)(testWorkspacePath, 'secrets-log-password.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.SENSITIVE_DATA_IN_LOGS);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A09_LOGGING));
        });
        test('Should detect auth token in logger.info', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SENSITIVE_DATA_IN_LOGS_TOKEN();
            const vulnerabilities = await (0, securityTestHelper_1.testSensitiveDataInLogsDetection)(testWorkspacePath, 'secrets-log-token.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect token in logs');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('sanitize'));
        });
        test('Should detect credit card in console.log', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SENSITIVE_DATA_IN_LOGS_CREDIT_CARD();
            const vulnerabilities = await (0, securityTestHelper_1.testSensitiveDataInLogsDetection)(testWorkspacePath, 'secrets-log-credit-card.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect credit card in logs');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
        });
        test('Should NOT detect sanitized logs', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SAFE_SANITIZED_LOGS();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'secrets-safe-sanitized-logs.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS);
        });
    });
    suite('Unencrypted Sensitive Storage Detection', () => {
        test('Should detect unencrypted auth token in localStorage', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.UNENCRYPTED_STORAGE_TOKEN();
            const vulnerabilities = await (0, securityTestHelper_1.testUnencryptedStorageDetection)(testWorkspacePath, 'secrets-storage-token.js', vulnerableCode);
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.UNENCRYPTED_STORAGE);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A02_CRYPTOGRAPHIC));
        });
        test('Should detect unencrypted password in sessionStorage', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.UNENCRYPTED_STORAGE_PASSWORD();
            const vulnerabilities = await (0, securityTestHelper_1.testUnencryptedStorageDetection)(testWorkspacePath, 'secrets-storage-password.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect unencrypted password in storage');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('encrypt'));
        });
        test('Should NOT detect encrypted storage', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.SAFE_ENCRYPTED_STORAGE();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'secrets-safe-encrypted-storage.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS);
        });
    });
    suite('Security Metadata Validation', () => {
        test('All sensitive data vulnerabilities should have OWASP A02:2021 or A09:2021 mapping', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const stripeKey = "sk_live_51234567890abcdefghijklmnopqr";
console.log('Token:', authToken);
`;
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-metadata-validation.js', vulnerableCode, { minVulnerabilities: 1 });
            for (const vuln of vulnerabilities) {
                assert.ok(vuln.owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A02_CRYPTOGRAPHIC) ||
                    vuln.owaspCategory?.includes(securityTestConstants_1.OWASP_CATEGORIES.A09_LOGGING), `Secrets vulnerability should map to OWASP A02:2021 or A09:2021, got: ${vuln.owaspCategory}`);
            }
        });
        test('All critical secrets vulnerabilities should have reference links', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.HARDCODED_API_KEY_AWS();
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-critical-refs.js', vulnerableCode);
            const criticalVuln = vulnerabilities.find(v => v.severity === securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.ok(criticalVuln, 'Should find critical vulnerability');
            assert.ok(criticalVuln.references.length >= 2, 'Should have at least 2 references');
            assert.ok(criticalVuln.references.some(ref => ref.includes('owasp.org')), 'Should have OWASP reference');
            assert.ok(criticalVuln.references.some(ref => ref.includes('cwe.mitre.org')), 'Should have CWE reference');
        });
    });
    suite('Edge Cases', () => {
        test('Should detect API key at exactly 20-character boundary', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.EDGE_CASE_20_CHAR_BOUNDARY();
            const vulnerabilities = await (0, securityTestHelper_1.testHardcodedSecretsDetection)(testWorkspacePath, 'secrets-edge-20char.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect API key at 20-character boundary');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.HARDCODED_SECRETS);
        });
        test('Should NOT detect secret in template literal with variable interpolation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.EDGE_CASE_TEMPLATE_LITERAL();
            // This should NOT be detected because the pattern has (?!.*\$\{) to exclude template literals
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'secrets-edge-template-literal.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS);
        });
        test('Should detect Base64-encoded encryption key', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.SECRETS.EDGE_CASE_BASE64_SECRET();
            const vulnerabilities = await (0, securityTestHelper_1.testExposedEncryptionKeysDetection)(testWorkspacePath, 'secrets-edge-base64.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect Base64-encoded encryption key');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.EXPOSED_ENCRYPTION_KEYS);
        });
    });
});
//# sourceMappingURL=security.secrets.test.js.map