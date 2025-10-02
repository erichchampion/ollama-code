"use strict";
/**
 * Security Test Constants
 * Shared constants for security vulnerability testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_VULNERABILITY_COUNTS = exports.SECURITY_RULE_IDS = exports.CONFIDENCE_LEVELS = exports.SEVERITY_LEVELS = exports.USER_INPUT_SOURCES = exports.ESCAPE_KEYWORDS = exports.PARAMETERIZATION_MARKERS = exports.VULNERABILITY_CATEGORIES = exports.OWASP_CATEGORIES = exports.CWE_IDS = void 0;
/**
 * CWE (Common Weakness Enumeration) IDs for security vulnerabilities
 * @see https://cwe.mitre.org/
 */
exports.CWE_IDS = {
    SQL_INJECTION: 89,
    COMMAND_INJECTION: 78,
    XSS: 79,
    LDAP_INJECTION: 90,
    XPATH_INJECTION: 643,
    TEMPLATE_INJECTION: 94,
    NOSQL_INJECTION: 89, // MongoDB injection is still CWE-89
    PATH_TRAVERSAL: 22,
    SSRF: 918,
    XXE: 611,
    HARDCODED_SECRETS: 798,
    WEAK_CRYPTO: 327,
    AUTH_BYPASS: 287,
    WEAK_PASSWORD: 521,
    DEBUG_ENABLED: 489,
};
/**
 * OWASP Top 10 2021 categories
 * @see https://owasp.org/Top10/
 */
exports.OWASP_CATEGORIES = {
    A01_BROKEN_ACCESS_CONTROL: 'A01:2021 – Broken Access Control',
    A02_CRYPTOGRAPHIC_FAILURES: 'A02:2021 – Cryptographic Failures',
    A03_INJECTION: 'A03:2021 – Injection',
    A04_INSECURE_DESIGN: 'A04:2021 – Insecure Design',
    A05_SECURITY_MISCONFIGURATION: 'A05:2021 – Security Misconfiguration',
    A06_VULNERABLE_COMPONENTS: 'A06:2021 – Vulnerable and Outdated Components',
    A07_AUTH_FAILURES: 'A07:2021 – Identification and Authentication Failures',
    A08_SOFTWARE_DATA_INTEGRITY: 'A08:2021 – Software and Data Integrity Failures',
    A09_SECURITY_LOGGING: 'A09:2021 – Security Logging and Monitoring Failures',
    A10_SSRF: 'A10:2021 – Server-Side Request Forgery',
};
/**
 * Security vulnerability categories
 */
exports.VULNERABILITY_CATEGORIES = {
    INJECTION: 'injection',
    XSS: 'xss',
    AUTHENTICATION: 'authentication',
    CRYPTOGRAPHY: 'cryptography',
    SECRETS: 'secrets',
    CONFIGURATION: 'configuration',
    DEPENDENCIES: 'dependencies',
    ACCESS_CONTROL: 'access_control',
    DATA_INTEGRITY: 'data_integrity',
    LOGGING: 'logging',
    SSRF: 'ssrf',
};
/**
 * Parameterization markers used in safe SQL queries
 */
exports.PARAMETERIZATION_MARKERS = [
    '?', // MySQL, SQLite positional
    '$1', // PostgreSQL numbered
    '$2',
    '$3',
    ':param', // Named parameters
    ':id',
    ':name',
    '@param', // SQL Server
    '@id',
    '@name',
];
/**
 * Keywords indicating input sanitization/escaping
 */
exports.ESCAPE_KEYWORDS = [
    'escape',
    'sanitize',
    'validate',
    'clean',
    'filter',
    'strip',
    'encode',
    'htmlspecialchars',
    'htmlentities',
    'escapeHtml',
    'escapeSql',
];
/**
 * User input sources to watch for in security analysis
 */
exports.USER_INPUT_SOURCES = [
    'req.query',
    'req.params',
    'req.body',
    'req.headers',
    'process.env',
    '$_GET',
    '$_POST',
    '$_REQUEST',
    'params.',
    'query.',
    'body.',
];
/**
 * Severity levels for security vulnerabilities
 */
exports.SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
};
/**
 * Confidence levels for vulnerability detection
 */
exports.CONFIDENCE_LEVELS = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};
/**
 * Security rule IDs from production SecurityAnalyzer
 */
exports.SECURITY_RULE_IDS = {
    AUTH_BYPASS: 'auth_bypass',
    WEAK_CRYPTO: 'weak_crypto',
    SQL_INJECTION: 'sql_injection',
    COMMAND_INJECTION: 'command_injection',
    HARDCODED_SECRETS: 'hardcoded_secrets',
    DEBUG_ENABLED: 'debug_enabled',
    OUTDATED_DEPENDENCY: 'outdated_dependency',
    WEAK_PASSWORD_POLICY: 'weak_password_policy',
    XSS: 'xss_vulnerability',
    PATH_TRAVERSAL: 'path_traversal',
    CORS_MISCONFIGURATION: 'cors_misconfiguration',
    INSECURE_DESERIALIZATION: 'insecure_deserialization',
    SSRF: 'ssrf_vulnerability',
    XXE: 'xxe_vulnerability',
    CSRF: 'csrf_vulnerability',
};
/**
 * Expected vulnerability counts for test suites
 */
exports.EXPECTED_VULNERABILITY_COUNTS = {
    SQL_INJECTION: 2, // String concat + template literal
    NOSQL_INJECTION: 2, // Direct input + $where
    COMMAND_INJECTION: 3, // exec + spawn + eval
    LDAP_INJECTION: 1, // Filter construction
    XPATH_INJECTION: 1, // XPath expression
    TEMPLATE_INJECTION: 2, // Template compile + unescaped
};
//# sourceMappingURL=securityTestConstants.js.map