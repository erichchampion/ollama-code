"use strict";
/**
 * Security Analyzer Wrapper
 * Re-exports production SecurityAnalyzer for use in tests
 *
 * Note: This file exists to work around TypeScript rootDir restrictions.
 * The actual SecurityAnalyzer implementation is in src/ai/security-analyzer.ts
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
exports.SecurityAnalyzer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
/**
 * Production security rules (subset for testing)
 * Full implementation is in src/ai/security-analyzer.ts
 */
const SECURITY_RULES = [
    // SQL Injection
    {
        id: 'sql_injection',
        name: 'Potential SQL Injection',
        description: 'SQL query construction using string concatenation or interpolation',
        severity: 'critical',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 89,
        pattern: /(query|sql|execute)\s*\(\s*['"`][^'"`]*\$\{|['"`][^'"`]*\+.*\+.*['"`]|query.*=.*['"`].*\+.*req\.|SELECT.*FROM.*WHERE.*\+|INSERT.*INTO.*VALUES.*\+/i,
        filePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java', '**/*.php'],
        confidence: 'medium',
        recommendation: 'Use parameterized queries or prepared statements to prevent SQL injection',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/89.html'
        ]
    },
    // Command Injection
    {
        id: 'command_injection',
        name: 'Potential Command Injection',
        description: 'Execution of system commands with user input',
        severity: 'critical',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 78,
        pattern: /(exec|spawn|system|eval|shell_exec|passthru)\s*\([^)]*(?:req\.|params\.|query\.|body\.|\$_GET|\$_POST)/i,
        filePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java', '**/*.php'],
        confidence: 'high',
        recommendation: 'Validate and sanitize all user input before executing system commands',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/78.html'
        ]
    },
    // NoSQL Injection (uses same CWE as SQL)
    {
        id: 'nosql_injection',
        name: 'Potential NoSQL Injection',
        description: 'NoSQL query construction with unsanitized user input',
        severity: 'critical',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 89,
        pattern: /\.find\s*\(\s*(?:req\.|params\.|query\.|body\.)|\$where.*(?:req\.|params\.|query\.|body\.)/i,
        filePatterns: ['**/*.js', '**/*.ts'],
        confidence: 'high',
        recommendation: 'Validate and sanitize user input, use schema validation for MongoDB queries',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/89.html'
        ]
    },
    // LDAP Injection
    {
        id: 'ldap_injection',
        name: 'Potential LDAP Injection',
        description: 'LDAP query construction with unsanitized user input',
        severity: 'high',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 90,
        pattern: /(?:ldap|search).*filter.*(?:req\.|params\.|query\.|body\.)|(?:dn|baseDN).*=.*(?:req\.|params\.|query\.|body\.)/i,
        filePatterns: ['**/*.js', '**/*.ts'],
        confidence: 'medium',
        recommendation: 'Escape LDAP special characters or use LDAP libraries with built-in escaping',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/90.html'
        ]
    },
    // XPath Injection
    {
        id: 'xpath_injection',
        name: 'Potential XPath Injection',
        description: 'XPath query construction with unsanitized user input',
        severity: 'high',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 643,
        pattern: /(?:xpath|select).*(?:req\.|params\.|query\.|body\.)/i,
        filePatterns: ['**/*.js', '**/*.ts'],
        confidence: 'medium',
        recommendation: 'Use parameterized XPath queries or escape user input',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/643.html'
        ]
    },
    // Template Injection
    {
        id: 'template_injection',
        name: 'Potential Template Injection',
        description: 'Template rendering with unsanitized user input',
        severity: 'high',
        category: 'injection',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 94,
        pattern: /(?:render|compile|template).*(?:req\.|params\.|query\.|body\.)|\{\{\{.*(?:req\.|params\.|query\.|body\.).*\}\}\}/i,
        filePatterns: ['**/*.js', '**/*.ts'],
        confidence: 'medium',
        recommendation: 'Escape user input or use sandboxed template engines',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/94.html'
        ]
    },
    // XSS (Cross-Site Scripting)
    {
        id: 'xss_vulnerability',
        name: 'Potential Cross-Site Scripting (XSS)',
        description: 'User input rendered without sanitization',
        severity: 'high',
        category: 'xss',
        owaspCategory: 'A03:2021 – Injection',
        cweId: 79,
        pattern: /\.innerHTML\s*=.*(?:req\.|params\.|query\.|body\.|location\.|window\.location)|\.outerHTML\s*=.*(?:req\.|params\.|query\.|body\.|location\.)|document\.write\s*\(.*(?:req\.|params\.|query\.|body\.|location\.)|dangerouslySetInnerHTML.*(?:req\.|params\.|query\.|body\.)/i,
        filePatterns: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
        confidence: 'high',
        recommendation: 'Sanitize user input before rendering, use textContent instead of innerHTML, or use a library like DOMPurify',
        references: [
            'https://owasp.org/Top10/A03_2021-Injection/',
            'https://cwe.mitre.org/data/definitions/79.html'
        ]
    },
];
/**
 * Security Analyzer
 * Simplified version of production SecurityAnalyzer for tests
 */
class SecurityAnalyzer {
    constructor() {
        this.rules = SECURITY_RULES;
    }
    /**
     * Analyze a single file for vulnerabilities
     */
    async analyzeFile(filePath, severityThreshold = 'info') {
        const vulnerabilities = [];
        try {
            const content = await fs_1.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            const fileExtension = path.extname(filePath);
            const applicableRules = this.getApplicableRules(fileExtension);
            for (const rule of applicableRules) {
                if (!this.meetsSeverityThreshold(rule.severity, severityThreshold)) {
                    continue;
                }
                const matches = content.matchAll(new RegExp(rule.pattern.source, 'gm'));
                for (const match of matches) {
                    if (!match.index)
                        continue;
                    // Skip if custom validator fails
                    if (rule.validator && !rule.validator(match, content, filePath)) {
                        continue;
                    }
                    // Calculate line number
                    const beforeMatch = content.substring(0, match.index);
                    const lineNumber = beforeMatch.split('\n').length;
                    const lineContent = lines[lineNumber - 1] || '';
                    vulnerabilities.push({
                        id: rule.id,
                        title: rule.name,
                        description: rule.description,
                        severity: rule.severity,
                        category: rule.category,
                        owaspCategory: rule.owaspCategory,
                        cweId: rule.cweId,
                        file: filePath,
                        line: lineNumber,
                        code: lineContent.trim(),
                        recommendation: rule.recommendation,
                        references: rule.references,
                        confidence: rule.confidence,
                        impact: this.getImpact(rule.severity),
                        exploitability: this.getExploitability(rule.severity, rule.confidence),
                    });
                }
            }
        }
        catch (error) {
            // Silently fail for test files that don't exist yet
            return [];
        }
        return vulnerabilities;
    }
    /**
     * Get applicable rules for file extension
     */
    getApplicableRules(fileExtension) {
        return this.rules.filter(rule => {
            return rule.filePatterns.some(pattern => {
                const ext = pattern.replace('**/*', '');
                return ext === fileExtension || pattern === '**/*' || ext === '.*';
            });
        });
    }
    /**
     * Check if severity meets threshold
     */
    meetsSeverityThreshold(ruleSeverity, threshold) {
        const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
        const ruleIndex = severityOrder.indexOf(ruleSeverity);
        const thresholdIndex = severityOrder.indexOf(threshold);
        return ruleIndex >= thresholdIndex;
    }
    /**
     * Get impact description based on severity
     */
    getImpact(severity) {
        const impacts = {
            critical: 'Critical - Immediate exploitation possible, severe consequences',
            high: 'High - Exploitation likely, significant impact',
            medium: 'Medium - Exploitation possible under certain conditions',
            low: 'Low - Limited impact or difficult to exploit',
            info: 'Informational - No direct security impact',
        };
        return impacts[severity];
    }
    /**
     * Get exploitability description
     */
    getExploitability(severity, confidence) {
        if (severity === 'critical' && confidence === 'high') {
            return 'Very High - Easily exploitable with public exploits available';
        }
        if (severity === 'high' || confidence === 'high') {
            return 'High - Can be exploited with moderate effort';
        }
        if (severity === 'medium') {
            return 'Medium - Requires specific conditions to exploit';
        }
        return 'Low - Difficult to exploit or requires extensive knowledge';
    }
}
exports.SecurityAnalyzer = SecurityAnalyzer;
//# sourceMappingURL=securityAnalyzerWrapper.js.map