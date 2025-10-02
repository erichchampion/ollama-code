"use strict";
/**
 * Security Test Helper
 * Utilities for testing security vulnerability detection
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
exports.testVulnerabilityDetection = testVulnerabilityDetection;
exports.testSQLInjectionDetection = testSQLInjectionDetection;
exports.testNoSQLInjectionDetection = testNoSQLInjectionDetection;
exports.testCommandInjectionDetection = testCommandInjectionDetection;
exports.testLDAPInjectionDetection = testLDAPInjectionDetection;
exports.testXPathInjectionDetection = testXPathInjectionDetection;
exports.testTemplateInjectionDetection = testTemplateInjectionDetection;
exports.testXSSDetection = testXSSDetection;
exports.testHardcodedCredentialsDetection = testHardcodedCredentialsDetection;
exports.testWeakPasswordPolicyDetection = testWeakPasswordPolicyDetection;
exports.testMissingAuthCheckDetection = testMissingAuthCheckDetection;
exports.testSessionFixationDetection = testSessionFixationDetection;
exports.testNoVulnerabilitiesDetected = testNoVulnerabilitiesDetected;
exports.assertSecurityMetadata = assertSecurityMetadata;
exports.assertVulnerabilityLine = assertVulnerabilityLine;
exports.createMultiVulnerabilityFile = createMultiVulnerabilityFile;
exports.assertOWASPCategory = assertOWASPCategory;
exports.assertAllVulnerabilitiesHaveOWASP = assertAllVulnerabilitiesHaveOWASP;
exports.assertCWEId = assertCWEId;
exports.assertAllVulnerabilitiesHaveCWE = assertAllVulnerabilitiesHaveCWE;
exports.testHardcodedSecretsDetection = testHardcodedSecretsDetection;
exports.testExposedEncryptionKeysDetection = testExposedEncryptionKeysDetection;
exports.testSensitiveDataInLogsDetection = testSensitiveDataInLogsDetection;
exports.testUnencryptedStorageDetection = testUnencryptedStorageDetection;
exports.createSecurityTestFile = createSecurityTestFile;
exports.testDebugModeDetection = testDebugModeDetection;
exports.testCorsMisconfigurationDetection = testCorsMisconfigurationDetection;
exports.testDefaultCredentialsDetection = testDefaultCredentialsDetection;
exports.testInsecureHttpDetection = testInsecureHttpDetection;
exports.testMagicNumberDetection = testMagicNumberDetection;
exports.testLargeFunctionDetection = testLargeFunctionDetection;
exports.testDeepNestingDetection = testDeepNestingDetection;
exports.testMissingErrorHandlingDetection = testMissingErrorHandlingDetection;
exports.testMissingInputValidationDetection = testMissingInputValidationDetection;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const securityAnalyzerWrapper_1 = require("./securityAnalyzerWrapper");
const securityTestConstants_1 = require("./securityTestConstants");
/**
 * Test helper to detect and validate security vulnerabilities
 *
 * @param workspacePath - Test workspace directory path
 * @param filename - Name of the file to create
 * @param vulnerableCode - Code containing vulnerability
 * @param category - Expected vulnerability category
 * @param cweId - Expected CWE ID
 * @param severity - Expected severity level
 * @param options - Additional validation options
 * @returns Array of detected vulnerabilities matching criteria
 */
async function testVulnerabilityDetection(workspacePath, filename, vulnerableCode, category, cweId, severity, options = {}) {
    // Create test file
    const testFile = path.join(workspacePath, filename);
    await fs.writeFile(testFile, vulnerableCode, 'utf8');
    // Analyze file with production SecurityAnalyzer
    const analyzer = new securityAnalyzerWrapper_1.SecurityAnalyzer();
    const allVulnerabilities = await analyzer.analyzeFile(testFile);
    // Filter vulnerabilities matching criteria
    const matchingVulnerabilities = allVulnerabilities.filter(v => v.category === category &&
        v.cweId === cweId &&
        v.severity === severity);
    // Assertions
    if (options.exactVulnerabilities !== undefined) {
        assert.strictEqual(matchingVulnerabilities.length, options.exactVulnerabilities, `Expected exactly ${options.exactVulnerabilities} ${category} vulnerabilities (CWE-${cweId}), found ${matchingVulnerabilities.length}`);
    }
    else {
        const minVulns = options.minVulnerabilities ?? 1;
        assert.ok(matchingVulnerabilities.length >= minVulns, `Expected at least ${minVulns} ${category} vulnerability (CWE-${cweId}), found ${matchingVulnerabilities.length}`);
    }
    // Validate first matching vulnerability
    const vulnerability = matchingVulnerabilities[0];
    assert.ok(vulnerability, `Should detect ${category} vulnerability (CWE-${cweId})`);
    // Check recommendation
    if (options.shouldContainRecommendation) {
        const recommendation = vulnerability.recommendation.toLowerCase();
        const expectedText = options.shouldContainRecommendation.toLowerCase();
        assert.ok(recommendation.includes(expectedText), `Recommendation should mention "${options.shouldContainRecommendation}". Got: "${vulnerability.recommendation}"`);
    }
    // Check OWASP category
    if (options.owaspCategory) {
        assert.ok(vulnerability.owaspCategory?.includes(options.owaspCategory), `Should map to OWASP ${options.owaspCategory}. Got: ${vulnerability.owaspCategory}`);
    }
    // Check confidence level
    if (options.confidence) {
        assert.strictEqual(vulnerability.confidence, options.confidence, `Expected confidence: ${options.confidence}, got: ${vulnerability.confidence}`);
    }
    // Custom assertions
    if (options.customAssert) {
        options.customAssert(vulnerability);
    }
    return matchingVulnerabilities;
}
/**
 * Test helper for SQL injection detection
 */
async function testSQLInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.SQL_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'parameterized',
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for NoSQL injection detection
 */
async function testNoSQLInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.NOSQL_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for command injection detection
 */
async function testCommandInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.COMMAND_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'sanitize',
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for LDAP injection detection
 */
async function testLDAPInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.LDAP_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for XPath injection detection
 */
async function testXPathInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.XPATH_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for template injection detection
 */
async function testTemplateInjectionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.INJECTION, securityTestConstants_1.CWE_IDS.TEMPLATE_INJECTION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for XSS detection
 */
async function testXSSDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.XSS, securityTestConstants_1.CWE_IDS.XSS, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'sanitize',
        owaspCategory: 'A03:2021',
        ...options,
    });
}
/**
 * Test helper for hardcoded credentials detection
 */
async function testHardcodedCredentialsDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION, securityTestConstants_1.CWE_IDS.HARDCODED_CREDENTIALS, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'environment',
        owaspCategory: 'A07:2021',
        ...options,
    });
}
/**
 * Test helper for weak password policy detection
 */
async function testWeakPasswordPolicyDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION, securityTestConstants_1.CWE_IDS.WEAK_PASSWORD, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'password',
        owaspCategory: 'A07:2021',
        ...options,
    });
}
/**
 * Test helper for missing authentication check detection
 */
async function testMissingAuthCheckDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION, securityTestConstants_1.CWE_IDS.AUTH_BYPASS, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'authentication',
        owaspCategory: 'A01:2021',
        ...options,
    });
}
/**
 * Test helper for session fixation detection
 */
async function testSessionFixationDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.AUTHENTICATION, securityTestConstants_1.CWE_IDS.SESSION_FIXATION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'regenerate',
        owaspCategory: 'A07:2021',
        ...options,
    });
}
/**
 * Test helper to verify NO vulnerabilities are detected (negative test)
 */
async function testNoVulnerabilitiesDetected(workspacePath, filename, safeCode, category) {
    const testFile = path.join(workspacePath, filename);
    await fs.writeFile(testFile, safeCode, 'utf8');
    const analyzer = new securityAnalyzerWrapper_1.SecurityAnalyzer();
    const vulnerabilities = await analyzer.analyzeFile(testFile);
    // CRITICAL: Verify analyzer returned valid array (Bug #2 fix)
    assert.ok(Array.isArray(vulnerabilities), 'SecurityAnalyzer must return array (returned undefined or null)');
    if (category) {
        const categoryVulns = vulnerabilities.filter(v => v.category === category);
        assert.strictEqual(categoryVulns.length, 0, `Expected no ${category} vulnerabilities for safe code, found ${categoryVulns.length}`);
    }
    else {
        assert.strictEqual(vulnerabilities.length, 0, `Expected no vulnerabilities for safe code, found ${vulnerabilities.length}`);
    }
}
/**
 * Assert vulnerability has required security metadata
 */
function assertSecurityMetadata(vulnerability) {
    assert.ok(vulnerability.id, 'Vulnerability should have ID');
    assert.ok(vulnerability.title, 'Vulnerability should have title');
    assert.ok(vulnerability.description, 'Vulnerability should have description');
    assert.ok(vulnerability.severity, 'Vulnerability should have severity');
    assert.ok(vulnerability.category, 'Vulnerability should have category');
    assert.ok(vulnerability.recommendation, 'Vulnerability should have recommendation');
    assert.ok(vulnerability.confidence, 'Vulnerability should have confidence level');
    // OWASP category (optional but should be present for major vulnerabilities)
    if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
        assert.ok(vulnerability.owaspCategory, `Critical/High severity vulnerabilities should have OWASP category. Got: ${vulnerability.severity}`);
    }
    // CWE ID (optional but recommended)
    if (vulnerability.cweId) {
        assert.ok(typeof vulnerability.cweId === 'number', 'CWE ID should be a number');
        assert.ok(vulnerability.cweId > 0, 'CWE ID should be positive');
    }
    // References
    assert.ok(Array.isArray(vulnerability.references), 'References should be an array');
    if (vulnerability.owaspCategory) {
        const hasOwaspRef = vulnerability.references.some(ref => ref.toLowerCase().includes('owasp.org'));
        assert.ok(hasOwaspRef, 'Vulnerability with OWASP category should have OWASP reference link');
    }
    if (vulnerability.cweId) {
        const hasCweRef = vulnerability.references.some(ref => ref.toLowerCase().includes('cwe.mitre.org'));
        assert.ok(hasCweRef, 'Vulnerability with CWE ID should have CWE reference link');
    }
}
/**
 * Assert vulnerability has expected line number
 */
function assertVulnerabilityLine(vulnerability, expectedLine, tolerance = 2) {
    const actualLine = vulnerability.line;
    const diff = Math.abs(actualLine - expectedLine);
    assert.ok(diff <= tolerance, `Vulnerability line should be around ${expectedLine} (±${tolerance}), got ${actualLine}`);
}
/**
 * Create a test file with multiple vulnerabilities for comprehensive testing
 */
async function createMultiVulnerabilityFile(workspacePath, filename, vulnerabilities) {
    const code = vulnerabilities.map((v, i) => `// Vulnerability ${i + 1}: ${v.type}\n${v.code}\n`).join('\n');
    const testFile = path.join(workspacePath, filename);
    await fs.writeFile(testFile, code, 'utf8');
    return testFile;
}
/**
 * Assert vulnerability has expected OWASP category
 */
function assertOWASPCategory(vulnerability, expectedCategory) {
    assert.ok(vulnerability.owaspCategory?.includes(expectedCategory), `Expected OWASP ${expectedCategory}, got: ${vulnerability.owaspCategory}`);
}
/**
 * Assert all vulnerabilities have expected OWASP category
 */
function assertAllVulnerabilitiesHaveOWASP(vulnerabilities, expectedCategory) {
    for (const vuln of vulnerabilities) {
        assertOWASPCategory(vuln, expectedCategory);
    }
}
/**
 * Assert vulnerability has CWE ID
 */
function assertCWEId(vulnerability, expectedCweId) {
    assert.strictEqual(vulnerability.cweId, expectedCweId, `Expected CWE-${expectedCweId}, got: CWE-${vulnerability.cweId}`);
}
/**
 * Assert all vulnerabilities have expected CWE ID
 */
function assertAllVulnerabilitiesHaveCWE(vulnerabilities, expectedCweId) {
    for (const vuln of vulnerabilities) {
        assertCWEId(vuln, expectedCweId);
    }
}
/**
 * Test helper for hardcoded secrets detection (API keys, tokens)
 */
async function testHardcodedSecretsDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS, securityTestConstants_1.CWE_IDS.HARDCODED_SECRETS, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'environment',
        owaspCategory: 'A02:2021',
        ...options,
    });
}
/**
 * Test helper for exposed encryption keys detection
 */
async function testExposedEncryptionKeysDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS, securityTestConstants_1.CWE_IDS.EXPOSED_ENCRYPTION_KEYS, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        owaspCategory: 'A02:2021',
        ...options,
    });
}
/**
 * Test helper for sensitive data in logs detection
 */
async function testSensitiveDataInLogsDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS, securityTestConstants_1.CWE_IDS.SENSITIVE_DATA_IN_LOGS, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        owaspCategory: 'A09:2021',
        ...options,
    });
}
/**
 * Test helper for unencrypted sensitive storage detection
 */
async function testUnencryptedStorageDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.SECRETS, securityTestConstants_1.CWE_IDS.UNENCRYPTED_STORAGE, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        owaspCategory: 'A02:2021',
        ...options,
    });
}
/**
 * Create security test filename with proper extension
 */
function createSecurityTestFile(category, testName, language = 'js') {
    return `${category}-${testName}.${language}`;
}
/**
 * Test helper for debug mode in production detection
 */
async function testDebugModeDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION, securityTestConstants_1.CWE_IDS.DEBUG_MODE_PRODUCTION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'debug',
        owaspCategory: 'A05:2021',
        ...options,
    });
}
/**
 * Test helper for CORS misconfiguration detection
 */
async function testCorsMisconfigurationDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION, securityTestConstants_1.CWE_IDS.CORS_MISCONFIGURATION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'CORS',
        owaspCategory: 'A05:2021',
        ...options,
    });
}
/**
 * Test helper for default credentials detection
 */
async function testDefaultCredentialsDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION, securityTestConstants_1.CWE_IDS.DEFAULT_CREDENTIALS, securityTestConstants_1.SEVERITY_LEVELS.CRITICAL, {
        shouldContainRecommendation: 'credentials',
        owaspCategory: 'A05:2021',
        ...options,
    });
}
/**
 * Test helper for insecure HTTP usage detection
 */
async function testInsecureHttpDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CONFIGURATION, securityTestConstants_1.CWE_IDS.INSECURE_TRANSPORT, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'HTTPS',
        owaspCategory: 'A05:2021',
        ...options,
    });
}
/**
 * Test helper for magic number detection
 */
async function testMagicNumberDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY, securityTestConstants_1.CWE_IDS.MAGIC_NUMBER, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM, {
        shouldContainRecommendation: 'constant',
        ...options,
    });
}
/**
 * Test helper for large function detection
 */
async function testLargeFunctionDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY, securityTestConstants_1.CWE_IDS.LARGE_FUNCTION, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM, {
        shouldContainRecommendation: 'function',
        ...options,
    });
}
/**
 * Test helper for deep nesting detection
 */
async function testDeepNestingDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY, securityTestConstants_1.CWE_IDS.DEEP_NESTING, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM, {
        shouldContainRecommendation: 'nesting',
        ...options,
    });
}
/**
 * Test helper for missing error handling detection
 */
async function testMissingErrorHandlingDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY, securityTestConstants_1.CWE_IDS.MISSING_ERROR_HANDLING, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'error',
        ...options,
    });
}
/**
 * Test helper for missing input validation detection
 */
async function testMissingInputValidationDetection(workspacePath, filename, vulnerableCode, options = {}) {
    return testVulnerabilityDetection(workspacePath, filename, vulnerableCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY, securityTestConstants_1.CWE_IDS.MISSING_INPUT_VALIDATION, securityTestConstants_1.SEVERITY_LEVELS.HIGH, {
        shouldContainRecommendation: 'validat',
        ...options,
    });
}
//# sourceMappingURL=securityTestHelper.js.map