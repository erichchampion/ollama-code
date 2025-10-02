"use strict";
/**
 * Architecture Issues Tests
 * Tests for automated code review system - architecture detection
 *
 * Tests production SecurityAnalyzer for architecture issue detection
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
suite('Architecture Issues Tests', () => {
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('architecture-issues-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('Large Class Detection', () => {
        test('Should detect class with more than 10 methods', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.LARGE_CLASS_15_METHODS();
            const vulnerabilities = await (0, securityTestHelper_1.testLargeClassDetection)(testWorkspacePath, 'arch-large-class.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.LARGE_CLASS);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].references.length > 0);
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('class'));
        });
    });
    suite('Tight Coupling Detection', () => {
        test('Should detect excessive imports indicating tight coupling', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.TIGHT_COUPLING_MANY_IMPORTS();
            const vulnerabilities = await (0, securityTestHelper_1.testTightCouplingDetection)(testWorkspacePath, 'arch-tight-coupling.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.TIGHT_COUPLING);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('coupling'));
        });
    });
    suite('Missing Abstraction Detection', () => {
        test('Should detect direct database access without abstraction layer', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.MISSING_ABSTRACTION_DIRECT_ACCESS();
            const vulnerabilities = await (0, securityTestHelper_1.testMissingAbstractionDetection)(testWorkspacePath, 'arch-missing-abstraction.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.MISSING_ABSTRACTION);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.MEDIUM);
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('abstraction'));
        });
    });
    suite('Circular Dependency Detection', () => {
        test('Should detect circular dependency pattern (file A imports B)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.CIRCULAR_DEPENDENCY_A_TO_B();
            const vulnerabilities = await (0, securityTestHelper_1.testCircularDependencyDetection)(testWorkspacePath, 'arch-circular-a.js', vulnerableCode);
            // Validate security metadata
            (0, securityTestHelper_1.assertSecurityMetadata)(vulnerabilities[0]);
            // Verify CWE mapping
            assert.strictEqual(vulnerabilities[0].cweId, securityTestConstants_1.CWE_IDS.CIRCULAR_DEPENDENCY);
            assert.strictEqual(vulnerabilities[0].category, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
            assert.strictEqual(vulnerabilities[0].severity, securityTestConstants_1.SEVERITY_LEVELS.HIGH);
            assert.ok(vulnerabilities[0].description.toLowerCase().includes('circular'));
        });
        test('Should detect circular dependency pattern (file B imports A)', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.CIRCULAR_DEPENDENCY_B_TO_A();
            const vulnerabilities = await (0, securityTestHelper_1.testCircularDependencyDetection)(testWorkspacePath, 'arch-circular-b.js', vulnerableCode);
            assert.ok(vulnerabilities.length > 0, 'Should detect circular dependency');
            assert.ok(vulnerabilities[0].recommendation.toLowerCase().includes('circular'));
        });
    });
    suite('Negative Tests - Good Architecture', () => {
        test('Should NOT detect small classes with few methods', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.SAFE_SMALL_CLASS();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'arch-safe-small-class.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
        });
        test('Should NOT detect loose coupling with dependency injection', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.SAFE_LOOSE_COUPLING_INTERFACES();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'arch-safe-loose-coupling.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
        });
        test('Should NOT detect proper abstraction with repository pattern', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.SAFE_PROPER_ABSTRACTION();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'arch-safe-abstraction.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
        });
        test('Should NOT detect hierarchical dependencies without cycles', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const safeCode = securityTestConstants_1.VULNERABILITY_CODE_TEMPLATES.ARCHITECTURE.SAFE_NO_CIRCULAR_DEPS();
            await (0, securityTestHelper_1.testNoVulnerabilitiesDetected)(testWorkspacePath, 'arch-safe-no-circular.js', safeCode, securityTestConstants_1.VULNERABILITY_CATEGORIES.ARCHITECTURE);
        });
    });
});
//# sourceMappingURL=architecture.issues.test.js.map