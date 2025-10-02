"use strict";
/**
 * Security - Injection Vulnerabilities Tests
 * OWASP Top 10 - Injection vulnerability detection tests
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const extensionTestHelper_1 = require("../helpers/extensionTestHelper");
const test_constants_1 = require("../helpers/test-constants");
const providerTestHelper_1 = require("../helpers/providerTestHelper");
/**
 * Security vulnerability severity levels
 */
var VulnerabilitySeverity;
(function (VulnerabilitySeverity) {
    VulnerabilitySeverity["CRITICAL"] = "critical";
    VulnerabilitySeverity["HIGH"] = "high";
    VulnerabilitySeverity["MEDIUM"] = "medium";
    VulnerabilitySeverity["LOW"] = "low";
    VulnerabilitySeverity["INFO"] = "info";
})(VulnerabilitySeverity || (VulnerabilitySeverity = {}));
/**
 * Mock security scanner for injection vulnerabilities
 */
class InjectionSecurityScanner {
    constructor(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    /**
     * Scan code for injection vulnerabilities
     */
    async scanForInjections(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        const code = fs.readFileSync(filePath, 'utf8');
        const vulnerabilities = [];
        // SQL Injection detection
        vulnerabilities.push(...this.detectSQLInjection(code));
        // NoSQL Injection detection
        vulnerabilities.push(...this.detectNoSQLInjection(code));
        // Command Injection detection
        vulnerabilities.push(...this.detectCommandInjection(code));
        // LDAP Injection detection
        vulnerabilities.push(...this.detectLDAPInjection(code));
        // XPath Injection detection
        vulnerabilities.push(...this.detectXPathInjection(code));
        // Template Injection detection
        vulnerabilities.push(...this.detectTemplateInjection(code));
        return vulnerabilities;
    }
    /**
     * Detect SQL injection vulnerabilities
     */
    detectSQLInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // Direct string concatenation in SQL queries
            if (/(?:query|execute|sql)\s*=?\s*[`'"]\s*SELECT.*\+|(?:query|execute|sql)\s*=?\s*[`'"].*\$\{|(?:query|execute|sql)\s*\+=/.test(line)) {
                vulnerabilities.push({
                    type: 'SQL_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential SQL injection: Direct string concatenation in query',
                    recommendation: 'Use parameterized queries or prepared statements'
                });
            }
            // req.query/req.params/req.body used directly in SQL
            if (/(?:query|execute|sql).*(?:req\.query|req\.params|req\.body)/.test(line) &&
                !line.includes('?') && !line.includes('$1')) {
                vulnerabilities.push({
                    type: 'SQL_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential SQL injection: User input used directly in query',
                    recommendation: 'Use parameterized queries with placeholders ($1, $2, etc.)'
                });
            }
        });
        return vulnerabilities;
    }
    /**
     * Detect NoSQL injection vulnerabilities (MongoDB)
     */
    detectNoSQLInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // Direct user input in MongoDB queries
            if (/\.find\s*\(\s*(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'NOSQL_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential NoSQL injection: User input used directly in query object',
                    recommendation: 'Validate and sanitize user input, use schema validation'
                });
            }
            // $where operator with user input
            if (/\$where.*(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'NOSQL_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential NoSQL injection: User input in $where operator',
                    recommendation: 'Avoid $where operator or strictly validate input'
                });
            }
        });
        return vulnerabilities;
    }
    /**
     * Detect command injection vulnerabilities
     */
    detectCommandInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // exec/execSync with user input
            if (/exec(?:Sync)?\s*\([^)]*(?:req\.query|req\.params|req\.body|process\.env)/.test(line)) {
                vulnerabilities.push({
                    type: 'COMMAND_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential command injection: User input in exec() call',
                    recommendation: 'Use execFile() with argument array or validate input strictly'
                });
            }
            // spawn with shell: true and user input
            if (/spawn\s*\([^)]*,\s*\{[^}]*shell:\s*true/.test(line) &&
                /(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'COMMAND_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential command injection: User input in spawn() with shell:true',
                    recommendation: 'Use spawn() without shell option or validate input strictly'
                });
            }
            // eval() with user input
            if (/eval\s*\([^)]*(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'COMMAND_INJECTION',
                    severity: VulnerabilitySeverity.CRITICAL,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential code injection: eval() with user input',
                    recommendation: 'Never use eval() with user input, use safer alternatives'
                });
            }
        });
        return vulnerabilities;
    }
    /**
     * Detect LDAP injection vulnerabilities
     */
    detectLDAPInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // LDAP filter with user input
            if (/(?:ldap|search).*filter.*(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'LDAP_INJECTION',
                    severity: VulnerabilitySeverity.HIGH,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential LDAP injection: User input in LDAP filter',
                    recommendation: 'Escape LDAP special characters or use LDAP libraries with built-in escaping'
                });
            }
            // LDAP DN construction with user input
            if (/(?:dn|baseDN).*=.*(?:req\.query|req\.params|req\.body)/.test(line)) {
                vulnerabilities.push({
                    type: 'LDAP_INJECTION',
                    severity: VulnerabilitySeverity.HIGH,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential LDAP injection: User input in DN construction',
                    recommendation: 'Validate and escape user input for LDAP DNs'
                });
            }
        });
        return vulnerabilities;
    }
    /**
     * Detect XPath injection vulnerabilities
     */
    detectXPathInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // XPath expression with user input
            if (/(?:xpath|select).*(?:req\.query|req\.params|req\.body)/.test(line) &&
                !line.includes('escape')) {
                vulnerabilities.push({
                    type: 'XPATH_INJECTION',
                    severity: VulnerabilitySeverity.HIGH,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential XPath injection: User input in XPath expression',
                    recommendation: 'Use parameterized XPath queries or escape user input'
                });
            }
        });
        return vulnerabilities;
    }
    /**
     * Detect template injection vulnerabilities
     */
    detectTemplateInjection(code) {
        const vulnerabilities = [];
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // Template rendering with user input
            if (/(?:render|compile|template).*(?:req\.query|req\.params|req\.body)/.test(line) &&
                !line.includes('escape') && !line.includes('sanitize')) {
                vulnerabilities.push({
                    type: 'TEMPLATE_INJECTION',
                    severity: VulnerabilitySeverity.HIGH,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential template injection: User input in template rendering',
                    recommendation: 'Escape user input or use sandboxed template engines'
                });
            }
            // Handlebars/Mustache with triple braces and user input
            if (/\{\{\{.*(?:req\.query|req\.params|req\.body).*\}\}\}/.test(line)) {
                vulnerabilities.push({
                    type: 'TEMPLATE_INJECTION',
                    severity: VulnerabilitySeverity.HIGH,
                    line: index + 1,
                    code: line.trim(),
                    message: 'Potential template injection: Unescaped user input in template',
                    recommendation: 'Use double braces {{}} for auto-escaping'
                });
            }
        });
        return vulnerabilities;
    }
}
suite('Security - Injection Vulnerabilities Tests', () => {
    let scanner;
    let mockClient;
    let mockLogger;
    let testWorkspacePath;
    setup(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.SETUP);
        mockClient = (0, providerTestHelper_1.createMockOllamaClient)(true);
        mockLogger = (0, providerTestHelper_1.createMockLogger)();
        scanner = new InjectionSecurityScanner(mockClient, mockLogger);
        testWorkspacePath = await (0, extensionTestHelper_1.createTestWorkspace)('security-injection-tests');
    });
    teardown(async function () {
        this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
        await (0, extensionTestHelper_1.cleanupTestWorkspace)(testWorkspacePath);
    });
    suite('SQL Injection Detection', () => {
        test('Should detect SQL injection with string concatenation', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const query = "SELECT * FROM users WHERE id = " + req.params.id;
db.execute(query);
`;
            const testFile = path.join(testWorkspacePath, 'sql-concat.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect SQL injection');
            const sqlInjection = vulnerabilities.find(v => v.type === 'SQL_INJECTION');
            assert.ok(sqlInjection, 'Should identify as SQL injection');
            assert.strictEqual(sqlInjection?.severity, VulnerabilitySeverity.CRITICAL);
        });
        test('Should detect SQL injection with template literals', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const query = \`SELECT * FROM users WHERE username = '\${req.body.username}'\`;
db.query(query);
`;
            const testFile = path.join(testWorkspacePath, 'sql-template.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect SQL injection');
            assert.ok(vulnerabilities[0].message.includes('SQL injection'));
        });
    });
    suite('NoSQL Injection Detection', () => {
        test('Should detect NoSQL injection with direct user input', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const user = await User.find(req.query);
`;
            const testFile = path.join(testWorkspacePath, 'nosql-direct.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect NoSQL injection');
            const nosqlInjection = vulnerabilities.find(v => v.type === 'NOSQL_INJECTION');
            assert.ok(nosqlInjection, 'Should identify as NoSQL injection');
            assert.strictEqual(nosqlInjection?.severity, VulnerabilitySeverity.CRITICAL);
        });
        test('Should detect NoSQL injection with $where operator', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const users = await User.find({ $where: req.body.filter });
`;
            const testFile = path.join(testWorkspacePath, 'nosql-where.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect NoSQL injection');
            assert.ok(vulnerabilities[0].message.includes('$where'));
        });
    });
    suite('Command Injection Detection', () => {
        test('Should detect command injection in exec()', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const { exec } = require('child_process');
exec('ls ' + req.query.dir);
`;
            const testFile = path.join(testWorkspacePath, 'cmd-exec.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect command injection');
            const cmdInjection = vulnerabilities.find(v => v.type === 'COMMAND_INJECTION');
            assert.ok(cmdInjection, 'Should identify as command injection');
            assert.strictEqual(cmdInjection?.severity, VulnerabilitySeverity.CRITICAL);
        });
        test('Should detect command injection in spawn() with shell:true', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
spawn(req.params.cmd, [], { shell: true });
`;
            const testFile = path.join(testWorkspacePath, 'cmd-spawn.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect command injection');
            assert.ok(vulnerabilities[0].message.includes('spawn'));
        });
        test('Should detect code injection in eval()', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
eval(req.body.code);
`;
            const testFile = path.join(testWorkspacePath, 'code-eval.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect code injection');
            assert.ok(vulnerabilities[0].message.includes('eval'));
        });
    });
    suite('LDAP Injection Detection', () => {
        test('Should detect LDAP injection in filter', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const filter = 'uid=' + req.params.username;
ldapClient.search(baseDN, { filter }, callback);
`;
            const testFile = path.join(testWorkspacePath, 'ldap-filter.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect LDAP injection');
            const ldapInjection = vulnerabilities.find(v => v.type === 'LDAP_INJECTION');
            assert.ok(ldapInjection, 'Should identify as LDAP injection');
            assert.strictEqual(ldapInjection?.severity, VulnerabilitySeverity.HIGH);
        });
    });
    suite('XPath Injection Detection', () => {
        test('Should detect XPath injection', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const xpath = '/users/user[username="' + req.query.user + '"]';
const result = doc.select(xpath);
`;
            const testFile = path.join(testWorkspacePath, 'xpath-injection.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect XPath injection');
            const xpathInjection = vulnerabilities.find(v => v.type === 'XPATH_INJECTION');
            assert.ok(xpathInjection, 'Should identify as XPath injection');
            assert.strictEqual(xpathInjection?.severity, VulnerabilitySeverity.HIGH);
        });
    });
    suite('Template Injection Detection', () => {
        test('Should detect template injection', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const template = req.body.template;
const compiled = Handlebars.compile(template);
`;
            const testFile = path.join(testWorkspacePath, 'template-injection.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect template injection');
            const templateInjection = vulnerabilities.find(v => v.type === 'TEMPLATE_INJECTION');
            assert.ok(templateInjection, 'Should identify as template injection');
            assert.strictEqual(templateInjection?.severity, VulnerabilitySeverity.HIGH);
        });
        test('Should detect unescaped template variables', async function () {
            this.timeout(test_constants_1.PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
            const vulnerableCode = `
const html = '{{{ req.body.userInput }}}';
`;
            const testFile = path.join(testWorkspacePath, 'template-unescaped.js');
            fs.writeFileSync(testFile, vulnerableCode, 'utf8');
            const vulnerabilities = await scanner.scanForInjections(testFile);
            assert.ok(vulnerabilities.length > 0, 'Should detect unescaped template injection');
            assert.ok(vulnerabilities[0].message.includes('Unescaped'));
        });
    });
});
//# sourceMappingURL=security.injection.test.js.map