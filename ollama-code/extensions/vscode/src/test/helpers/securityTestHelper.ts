/**
 * Security Test Helper
 * Utilities for testing security vulnerability detection
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as assert from 'assert';
import { SecurityAnalyzer, SecurityVulnerability } from './securityAnalyzerWrapper';
import {
  CWE_IDS,
  OWASP_CATEGORIES,
  VULNERABILITY_CATEGORIES,
  SEVERITY_LEVELS,
  CONFIDENCE_LEVELS,
} from './securityTestConstants';

/**
 * Options for vulnerability detection testing
 */
export interface VulnerabilityDetectionOptions {
  /** Expected recommendation text (partial match) */
  shouldContainRecommendation?: string;
  /** Expected OWASP category */
  owaspCategory?: string;
  /** Expected confidence level */
  confidence?: typeof CONFIDENCE_LEVELS[keyof typeof CONFIDENCE_LEVELS];
  /** Expected minimum number of vulnerabilities */
  minVulnerabilities?: number;
  /** Expected exact number of vulnerabilities */
  exactVulnerabilities?: number;
  /** Custom assertion function */
  customAssert?: (vulnerability: SecurityVulnerability) => void;
}

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
export async function testVulnerabilityDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  category: string,
  cweId: number,
  severity: typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS],
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  // Create test file
  const testFile = path.join(workspacePath, filename);
  await fs.writeFile(testFile, vulnerableCode, 'utf8');

  // Analyze file with production SecurityAnalyzer
  const analyzer = new SecurityAnalyzer();
  const allVulnerabilities = await analyzer.analyzeFile(testFile);

  // Filter vulnerabilities matching criteria
  const matchingVulnerabilities = allVulnerabilities.filter(v =>
    v.category === category &&
    v.cweId === cweId &&
    v.severity === severity
  );

  // Assertions
  if (options.exactVulnerabilities !== undefined) {
    assert.strictEqual(
      matchingVulnerabilities.length,
      options.exactVulnerabilities,
      `Expected exactly ${options.exactVulnerabilities} ${category} vulnerabilities (CWE-${cweId}), found ${matchingVulnerabilities.length}`
    );
  } else {
    const minVulns = options.minVulnerabilities ?? 1;
    assert.ok(
      matchingVulnerabilities.length >= minVulns,
      `Expected at least ${minVulns} ${category} vulnerability (CWE-${cweId}), found ${matchingVulnerabilities.length}`
    );
  }

  // Validate first matching vulnerability
  const vulnerability = matchingVulnerabilities[0];
  assert.ok(vulnerability, `Should detect ${category} vulnerability (CWE-${cweId})`);

  // Check recommendation
  if (options.shouldContainRecommendation) {
    const recommendation = vulnerability.recommendation.toLowerCase();
    const expectedText = options.shouldContainRecommendation.toLowerCase();
    assert.ok(
      recommendation.includes(expectedText),
      `Recommendation should mention "${options.shouldContainRecommendation}". Got: "${vulnerability.recommendation}"`
    );
  }

  // Check OWASP category
  if (options.owaspCategory) {
    assert.ok(
      vulnerability.owaspCategory?.includes(options.owaspCategory),
      `Should map to OWASP ${options.owaspCategory}. Got: ${vulnerability.owaspCategory}`
    );
  }

  // Check confidence level
  if (options.confidence) {
    assert.strictEqual(
      vulnerability.confidence,
      options.confidence,
      `Expected confidence: ${options.confidence}, got: ${vulnerability.confidence}`
    );
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
export async function testSQLInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.SQL_INJECTION,
    SEVERITY_LEVELS.CRITICAL,
    {
      shouldContainRecommendation: 'parameterized',
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for NoSQL injection detection
 */
export async function testNoSQLInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.NOSQL_INJECTION,
    SEVERITY_LEVELS.CRITICAL,
    {
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for command injection detection
 */
export async function testCommandInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.COMMAND_INJECTION,
    SEVERITY_LEVELS.CRITICAL,
    {
      shouldContainRecommendation: 'sanitize',
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for LDAP injection detection
 */
export async function testLDAPInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.LDAP_INJECTION,
    SEVERITY_LEVELS.HIGH,
    {
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for XPath injection detection
 */
export async function testXPathInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.XPATH_INJECTION,
    SEVERITY_LEVELS.HIGH,
    {
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for template injection detection
 */
export async function testTemplateInjectionDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.INJECTION,
    CWE_IDS.TEMPLATE_INJECTION,
    SEVERITY_LEVELS.HIGH,
    {
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for XSS detection
 */
export async function testXSSDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.XSS,
    CWE_IDS.XSS,
    SEVERITY_LEVELS.HIGH,
    {
      shouldContainRecommendation: 'sanitize',
      owaspCategory: 'A03:2021',
      ...options,
    }
  );
}

/**
 * Test helper for hardcoded secrets detection
 */
export async function testHardcodedSecretsDetection(
  workspacePath: string,
  filename: string,
  vulnerableCode: string,
  options: VulnerabilityDetectionOptions = {}
): Promise<SecurityVulnerability[]> {
  return testVulnerabilityDetection(
    workspacePath,
    filename,
    vulnerableCode,
    VULNERABILITY_CATEGORIES.SECRETS,
    CWE_IDS.HARDCODED_SECRETS,
    SEVERITY_LEVELS.CRITICAL,
    {
      shouldContainRecommendation: 'environment',
      owaspCategory: 'A04:2021',
      ...options,
    }
  );
}

/**
 * Test helper to verify NO vulnerabilities are detected (negative test)
 */
export async function testNoVulnerabilitiesDetected(
  workspacePath: string,
  filename: string,
  safeCode: string,
  category?: string
): Promise<void> {
  const testFile = path.join(workspacePath, filename);
  await fs.writeFile(testFile, safeCode, 'utf8');

  const analyzer = new SecurityAnalyzer();
  const vulnerabilities = await analyzer.analyzeFile(testFile);

  if (category) {
    const categoryVulns = vulnerabilities.filter(v => v.category === category);
    assert.strictEqual(
      categoryVulns.length,
      0,
      `Expected no ${category} vulnerabilities for safe code, found ${categoryVulns.length}`
    );
  } else {
    assert.strictEqual(
      vulnerabilities.length,
      0,
      `Expected no vulnerabilities for safe code, found ${vulnerabilities.length}`
    );
  }
}

/**
 * Assert vulnerability has required security metadata
 */
export function assertSecurityMetadata(vulnerability: SecurityVulnerability): void {
  assert.ok(vulnerability.id, 'Vulnerability should have ID');
  assert.ok(vulnerability.title, 'Vulnerability should have title');
  assert.ok(vulnerability.description, 'Vulnerability should have description');
  assert.ok(vulnerability.severity, 'Vulnerability should have severity');
  assert.ok(vulnerability.category, 'Vulnerability should have category');
  assert.ok(vulnerability.recommendation, 'Vulnerability should have recommendation');
  assert.ok(vulnerability.confidence, 'Vulnerability should have confidence level');

  // OWASP category (optional but should be present for major vulnerabilities)
  if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
    assert.ok(
      vulnerability.owaspCategory,
      `Critical/High severity vulnerabilities should have OWASP category. Got: ${vulnerability.severity}`
    );
  }

  // CWE ID (optional but recommended)
  if (vulnerability.cweId) {
    assert.ok(
      typeof vulnerability.cweId === 'number',
      'CWE ID should be a number'
    );
    assert.ok(
      vulnerability.cweId > 0,
      'CWE ID should be positive'
    );
  }

  // References
  assert.ok(
    Array.isArray(vulnerability.references),
    'References should be an array'
  );

  if (vulnerability.owaspCategory) {
    const hasOwaspRef = vulnerability.references.some(ref =>
      ref.toLowerCase().includes('owasp.org')
    );
    assert.ok(
      hasOwaspRef,
      'Vulnerability with OWASP category should have OWASP reference link'
    );
  }

  if (vulnerability.cweId) {
    const hasCweRef = vulnerability.references.some(ref =>
      ref.toLowerCase().includes('cwe.mitre.org')
    );
    assert.ok(
      hasCweRef,
      'Vulnerability with CWE ID should have CWE reference link'
    );
  }
}

/**
 * Assert vulnerability has expected line number
 */
export function assertVulnerabilityLine(
  vulnerability: SecurityVulnerability,
  expectedLine: number,
  tolerance: number = 2
): void {
  const actualLine = vulnerability.line;
  const diff = Math.abs(actualLine - expectedLine);

  assert.ok(
    diff <= tolerance,
    `Vulnerability line should be around ${expectedLine} (±${tolerance}), got ${actualLine}`
  );
}

/**
 * Create a test file with multiple vulnerabilities for comprehensive testing
 */
export async function createMultiVulnerabilityFile(
  workspacePath: string,
  filename: string,
  vulnerabilities: Array<{ type: string; code: string }>
): Promise<string> {
  const code = vulnerabilities.map((v, i) =>
    `// Vulnerability ${i + 1}: ${v.type}\n${v.code}\n`
  ).join('\n');

  const testFile = path.join(workspacePath, filename);
  await fs.writeFile(testFile, code, 'utf8');

  return testFile;
}
