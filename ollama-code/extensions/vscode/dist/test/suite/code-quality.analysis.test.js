"use strict";
/**
 * Code Quality Analysis Tests
 * Tests for automated code review system - code quality detection
 *
 * Tests production SecurityAnalyzer for code quality issue detection
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
suite('Code Quality Analysis Tests', () => {
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('code-quality-analysis-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Magic Number Detection', () => {
        test('Should detect magic number in setTimeout', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MAGIC_NUMBER_TIMEOUT();
            const vulnerabilities = await (0, securityTestHelper_1.testMagicNumberDetection)(testWorkspacePath, 'quality-magic-timeout.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.MAGIC_NUMBER);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].references.length > 0);
        });
        test('Should detect magic numbers in calculations', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MAGIC_NUMBER_CALCULATION();
            const vulnerabilities = await (0, securityTestHelper_1.testMagicNumberDetection)(testWorkspacePath, 'quality-magic-calc.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect magic numbers');
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('magic'));
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('constant'));
        });
    });
    suite('Large Function Detection', () => {
        test('Should detect function exceeding 50 lines', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.LARGE_FUNCTION_50_LINES();
            const vulnerabilities = await (0, securityTestHelper_1.testLargeFunctionDetection)(testWorkspacePath, 'quality-large-function.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.LARGE_FUNCTION);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('function'));
        });
    });
    suite('Deep Nesting Detection', () => {
        test('Should detect nesting exceeding 4 levels', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.DEEP_NESTING_5_LEVELS();
            const vulnerabilities = await (0, securityTestHelper_1.testDeepNestingDetection)(testWorkspacePath, 'quality-deep-nesting.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.DEEP_NESTING);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('nesting'));
        });
    });
    suite('Missing Error Handling Detection', () => {
        test('Should detect async/await without try-catch', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MISSING_ERROR_HANDLING_ASYNC();
            const vulnerabilities = await (0, securityTestHelper_1.testMissingErrorHandlingDetection)(testWorkspacePath, 'quality-no-error-async.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.MISSING_ERROR_HANDLING);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('error'));
        });
        test('Should detect promise without .catch()', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MISSING_ERROR_HANDLING_PROMISE();
            const vulnerabilities = await (0, securityTestHelper_1.testMissingErrorHandlingDetection)(testWorkspacePath, 'quality-no-catch.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect missing error handling');
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('error'));
        });
    });
    suite('Missing Input Validation Detection', () => {
        test('Should detect unvalidated req.body in API endpoint', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MISSING_INPUT_VALIDATION_API();
            const vulnerabilities = await (0, securityTestHelper_1.testMissingInputValidationDetection)(testWorkspacePath, 'quality-no-validation-api.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.MISSING_INPUT_VALIDATION);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('validat'));
        });
        test('Should detect missing division-by-zero check', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.MISSING_INPUT_VALIDATION_FUNCTION();
            const vulnerabilities = await (0, securityTestHelper_1.testMissingInputValidationDetection)(testWorkspacePath, 'quality-divide-by-zero.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect missing validation');
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('validation'));
        });
    });
    suite('Negative Tests - Good Code Quality', () => {
        test('Should NOT detect named constants', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.SAFE_NAMED_CONSTANT();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'quality-safe-constants.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
        });
        test('Should NOT detect small, focused functions', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.SAFE_SMALL_FUNCTION();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'quality-safe-small-function.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
        });
        test('Should NOT detect flat logic with early returns', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.SAFE_FLAT_LOGIC();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'quality-safe-flat.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
        });
        test('Should NOT detect proper error handling', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.SAFE_ERROR_HANDLING_ASYNC();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'quality-safe-errors.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
        });
        test('Should NOT detect validated inputs', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.CODE_QUALITY.SAFE_INPUT_VALIDATION();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'quality-safe-validation.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.CODE_QUALITY);
        });
    });
});
//# sourceMappingURL=code-quality.analysis.test.js.map