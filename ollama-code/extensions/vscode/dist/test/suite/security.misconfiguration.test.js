"use strict";
/**
 * Security - Configuration Vulnerabilities Tests
 * OWASP Top 10 - A05:2021 Security Misconfiguration Tests
 *
 * Tests production SecurityAnalyzer for security misconfiguration detection
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
suite('Security - Configuration Vulnerabilities Tests', () => {
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('security-misconfiguration-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Debug Mode Detection', () => {
        test('Should detect debug mode enabled in production', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.DEBUG_MODE_ENABLED();
            const vulnerabilities = await (0, securityTestHelper_1.testDebugModeDetection)(testWorkspacePath, 'config-debug-enabled.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.DEBUG_MODE_PRODUCTION);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A05:2021'));
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
            assert.ok(vulnerabilities[0].references.length > 0);
        });
        test('Should detect NODE_ENV production with debug mode', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.DEBUG_MODE_NODE_ENV();
            const vulnerabilities = await (0, securityTestHelper_1.testDebugModeDetection)(testWorkspacePath, 'config-node-env-debug.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect debug mode in production');
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('debug'));
        });
    });
    suite('CORS Misconfiguration Detection', () => {
        test('Should detect CORS wildcard with credentials', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.CORS_WILDCARD();
            const vulnerabilities = await (0, securityTestHelper_1.testCorsMisconfigurationDetection)(testWorkspacePath, 'config-cors-wildcard.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.CORS_MISCONFIGURATION);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A05:2021'));
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
        });
        test('Should detect CORS null origin vulnerability', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.CORS_NULL_ORIGIN();
            const vulnerabilities = await (0, securityTestHelper_1.testCorsMisconfigurationDetection)(testWorkspacePath, 'config-cors-null.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect CORS null origin');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('cors'));
        });
    });
    suite('Default Credentials Detection', () => {
        test('Should detect default admin credentials', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.DEFAULT_ADMIN_PASSWORD();
            const vulnerabilities = await (0, securityTestHelper_1.testDefaultCredentialsDetection)(testWorkspacePath, 'config-default-admin.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.DEFAULT_CREDENTIALS);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A05:2021'));
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL);
        });
        test('Should detect default database credentials', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.DEFAULT_DATABASE_CREDS();
            const vulnerabilities = await (0, securityTestHelper_1.testDefaultCredentialsDetection)(testWorkspacePath, 'config-db-defaults.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect default database credentials');
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('credential'));
        });
    });
    suite('Insecure HTTP Detection', () => {
        test('Should detect HTTP URLs for sensitive data transmission', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.HTTP_URL();
            const vulnerabilities = await (0, securityTestHelper_1.testInsecureHttpDetection)(testWorkspacePath, 'config-http-url.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify OWASP and CWE mappings
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.INSECURE_TRANSPORT);
            assert.ok(vulnerabilities[0].owaspCategory?.includes('A05:2021'));
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
        });
        test('Should detect insecure cookie transmission over HTTP', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.HTTP_COOKIE();
            const vulnerabilities = await (0, securityTestHelper_1.testInsecureHttpDetection)(testWorkspacePath, 'config-http-cookie.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect HTTP cookie transmission');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('https'));
        });
    });
    suite('Negative Tests - Safe Configurations', () => {
        test('Should NOT detect debug disabled in production', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.SAFE_DEBUG_DISABLED();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'config-safe-debug.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
        });
        test('Should NOT detect proper CORS whitelist configuration', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.SAFE_CORS_WHITELIST();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'config-safe-cors.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
        });
        test('Should NOT detect environment-based credentials', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.SAFE_ENV_CREDENTIALS();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'config-safe-env.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
        });
        test('Should NOT detect HTTPS URLs', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.SAFE_HTTPS_URL();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'config-safe-https.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
        });
        test('Should NOT detect secure cookie configuration', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.MISCONFIGURATION.SAFE_SECURE_COOKIE();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'config-safe-cookie.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
        });
    });
    suite('Security Metadata Validation', () => {
        test('All misconfiguration vulnerabilities should have proper OWASP A05:2021 mapping', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const config = {
  debug: true,
  env: 'production'
};

app.use(cors({
  origin: '*',
  credentials: true
}));

const users = [
  { username: 'admin', password: 'admin' }
];

const API_URL = 'http://api.example.com/data';
fetch(API_URL, {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
`;
            const testFile = require('path').join(testWorkspacePath, 'config-multiple.js');
            await require('fs/promises').writeFile(testFile, vulnerableCode, 'utf8');
            const { SecurityAnalyzer } = require('../helpers/securityAnalyzerWrapper');
            const analyzer = new SecurityAnalyzer();
            const vulnerabilities = await analyzer.analyzeFile(testFile);
            const configVulnerabilities = vulnerabilities.filter((v) => v.category === securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION);
            assert.ok(configVulnerabilities.length >= 1, `Expected at least 1 configuration vulnerability, found ${configVulnerabilities.length}`);
            for (const vuln of configVulnerabilities) {
                assert.ok(vuln.owaspCategory?.includes('A05:2021'), `Configuration vulnerability should map to OWASP A05:2021, got: ${vuln.owaspCategory}`);
            }
        });
    });
});
//# sourceMappingURL=security.misconfiguration.test.js.map