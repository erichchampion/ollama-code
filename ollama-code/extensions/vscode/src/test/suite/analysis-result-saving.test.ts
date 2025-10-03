/**
 * Analysis Result Saving Tests
 * Tests saving analysis results, code reviews, security scans, and performance reports
 * in multiple formats (JSON, Markdown, HTML)
 */

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { createTestWorkspace, cleanupTestWorkspace } from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';

suite('Analysis Result Saving Tests', () => {
	let testWorkspacePath: string;

	setup(async function () {
		this.timeout(PROVIDER_TEST_TIMEOUTS.SETUP);
		testWorkspacePath = await createTestWorkspace('analysis-result-saving-tests');
	});

	teardown(async function () {
		this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);
		await cleanupTestWorkspace(testWorkspacePath);
	});

	// ====================================================================
	// Analysis Result System
	// ====================================================================

	interface AnalysisResult {
		type: 'general' | 'code_review' | 'security_scan' | 'performance_analysis';
		timestamp: number;
		summary: string;
		findings: Finding[];
		metadata: {
			analyzedFiles: string[];
			duration: number;
			toolVersion: string;
		};
	}

	interface Finding {
		severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
		title: string;
		description: string;
		file?: string;
		line?: number;
		recommendation?: string;
		codeSnippet?: string;
	}

	interface CodeReviewReport extends AnalysisResult {
		type: 'code_review';
		qualityScore: number; // 0-100
		categories: {
			maintainability: number;
			reliability: number;
			security: number;
			performance: number;
		};
	}

	interface SecurityScanReport extends AnalysisResult {
		type: 'security_scan';
		vulnerabilities: {
			critical: number;
			high: number;
			medium: number;
			low: number;
		};
		complianceStatus: {
			owasp: boolean;
			cwe: boolean;
		};
	}

	interface PerformanceAnalysisReport extends AnalysisResult {
		type: 'performance_analysis';
		metrics: {
			avgResponseTime: number;
			memoryUsage: number;
			cpuUsage: number;
		};
		bottlenecks: Finding[];
	}

	type ReportFormat = 'json' | 'markdown' | 'html';

	class ReportGenerator {
		/**
		 * Save analysis results to file
		 */
		async saveAnalysisResults(
			result: AnalysisResult,
			outputPath: string,
			format: ReportFormat = 'json'
		): Promise<void> {
			let content: string;

			switch (format) {
				case 'json':
					content = this.generateJSON(result);
					break;
				case 'markdown':
					content = this.generateMarkdown(result);
					break;
				case 'html':
					content = this.generateHTML(result);
					break;
				default:
					throw new Error(`Unsupported format: ${format}`);
			}

			// Ensure directory exists
			const dir = path.dirname(outputPath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}

			// Write file
			fs.writeFileSync(outputPath, content, 'utf-8');
		}

		/**
		 * Generate JSON format
		 */
		private generateJSON(result: AnalysisResult): string {
			return JSON.stringify(result, null, 2);
		}

		/**
		 * Generate Markdown format
		 */
		private generateMarkdown(result: AnalysisResult): string {
			const lines: string[] = [];

			// Header
			lines.push(`# ${this.getReportTitle(result.type)}`);
			lines.push('');
			lines.push(`**Date:** ${new Date(result.timestamp).toISOString()}`);
			lines.push(`**Duration:** ${result.metadata.duration}ms`);
			lines.push(`**Tool Version:** ${result.metadata.toolVersion}`);
			lines.push('');

			// Summary
			lines.push('## Summary');
			lines.push('');
			lines.push(result.summary);
			lines.push('');

			// Type-specific sections
			if (result.type === 'code_review') {
				const review = result as CodeReviewReport;
				lines.push('## Quality Score');
				lines.push('');
				lines.push(`**Overall Score:** ${review.qualityScore}/100`);
				lines.push('');
				lines.push('### Categories');
				lines.push(`- **Maintainability:** ${review.categories.maintainability}/100`);
				lines.push(`- **Reliability:** ${review.categories.reliability}/100`);
				lines.push(`- **Security:** ${review.categories.security}/100`);
				lines.push(`- **Performance:** ${review.categories.performance}/100`);
				lines.push('');
			} else if (result.type === 'security_scan') {
				const security = result as SecurityScanReport;
				lines.push('## Vulnerabilities');
				lines.push('');
				lines.push(`- **Critical:** ${security.vulnerabilities.critical}`);
				lines.push(`- **High:** ${security.vulnerabilities.high}`);
				lines.push(`- **Medium:** ${security.vulnerabilities.medium}`);
				lines.push(`- **Low:** ${security.vulnerabilities.low}`);
				lines.push('');
				lines.push('## Compliance Status');
				lines.push(`- **OWASP:** ${security.complianceStatus.owasp ? '✅' : '❌'}`);
				lines.push(`- **CWE:** ${security.complianceStatus.cwe ? '✅' : '❌'}`);
				lines.push('');
			} else if (result.type === 'performance_analysis') {
				const perf = result as PerformanceAnalysisReport;
				lines.push('## Performance Metrics');
				lines.push('');
				lines.push(`- **Average Response Time:** ${perf.metrics.avgResponseTime}ms`);
				lines.push(`- **Memory Usage:** ${perf.metrics.memoryUsage}MB`);
				lines.push(`- **CPU Usage:** ${perf.metrics.cpuUsage}%`);
				lines.push('');
			}

			// Findings
			if (result.findings.length > 0) {
				lines.push('## Findings');
				lines.push('');

				// Group by severity
				const bySeverity = this.groupBySeverity(result.findings);
				const severities: Array<'critical' | 'high' | 'medium' | 'low' | 'info'> = ['critical', 'high', 'medium', 'low', 'info'];

				for (const severity of severities) {
					const findings = bySeverity.get(severity) || [];
					if (findings.length === 0) continue;

					lines.push(`### ${this.capitalizeFirst(severity)} (${findings.length})`);
					lines.push('');

					for (const finding of findings) {
						lines.push(`#### ${finding.title}`);
						lines.push('');
						lines.push(finding.description);
						lines.push('');

						if (finding.file) {
							lines.push(`**File:** \`${finding.file}\``);
							if (finding.line) {
								lines.push(`**Line:** ${finding.line}`);
							}
							lines.push('');
						}

						if (finding.codeSnippet) {
							lines.push('```');
							lines.push(finding.codeSnippet);
							lines.push('```');
							lines.push('');
						}

						if (finding.recommendation) {
							lines.push('**Recommendation:**');
							lines.push(finding.recommendation);
							lines.push('');
						}

						lines.push('---');
						lines.push('');
					}
				}
			}

			// Analyzed files
			lines.push('## Analyzed Files');
			lines.push('');
			for (const file of result.metadata.analyzedFiles) {
				lines.push(`- ${file}`);
			}
			lines.push('');

			return lines.join('\n');
		}

		/**
		 * Generate HTML format
		 */
		private generateHTML(result: AnalysisResult): string {
			const lines: string[] = [];

			// HTML header
			lines.push('<!DOCTYPE html>');
			lines.push('<html lang="en">');
			lines.push('<head>');
			lines.push('  <meta charset="UTF-8">');
			lines.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
			lines.push(`  <title>${this.getReportTitle(result.type)}</title>`);
			lines.push('  <style>');
			lines.push('    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }');
			lines.push('    h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }');
			lines.push('    h2 { color: #555; margin-top: 30px; }');
			lines.push('    .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; }');
			lines.push('    .finding { border-left: 4px solid #ccc; padding: 10px; margin: 15px 0; }');
			lines.push('    .finding.critical { border-color: #d32f2f; }');
			lines.push('    .finding.high { border-color: #f57c00; }');
			lines.push('    .finding.medium { border-color: #fbc02d; }');
			lines.push('    .finding.low { border-color: #388e3c; }');
			lines.push('    .finding.info { border-color: #1976d2; }');
			lines.push('    .code-snippet { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }');
			lines.push('    .recommendation { background: #e3f2fd; padding: 10px; border-radius: 3px; }');
			lines.push('  </style>');
			lines.push('</head>');
			lines.push('<body>');

			// Title
			lines.push(`  <h1>${this.getReportTitle(result.type)}</h1>`);

			// Metadata
			lines.push('  <div class="metadata">');
			lines.push(`    <p><strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>`);
			lines.push(`    <p><strong>Duration:</strong> ${result.metadata.duration}ms</p>`);
			lines.push(`    <p><strong>Tool Version:</strong> ${result.metadata.toolVersion}</p>`);
			lines.push('  </div>');

			// Summary
			lines.push('  <h2>Summary</h2>');
			lines.push(`  <p>${this.escapeHtml(result.summary)}</p>`);

			// Type-specific sections
			if (result.type === 'code_review') {
				const review = result as CodeReviewReport;
				lines.push('  <h2>Quality Score</h2>');
				lines.push(`  <p><strong>Overall Score:</strong> ${review.qualityScore}/100</p>`);
				lines.push('  <h3>Categories</h3>');
				lines.push('  <ul>');
				lines.push(`    <li><strong>Maintainability:</strong> ${review.categories.maintainability}/100</li>`);
				lines.push(`    <li><strong>Reliability:</strong> ${review.categories.reliability}/100</li>`);
				lines.push(`    <li><strong>Security:</strong> ${review.categories.security}/100</li>`);
				lines.push(`    <li><strong>Performance:</strong> ${review.categories.performance}/100</li>`);
				lines.push('  </ul>');
			} else if (result.type === 'security_scan') {
				const security = result as SecurityScanReport;
				lines.push('  <h2>Vulnerabilities</h2>');
				lines.push('  <ul>');
				lines.push(`    <li><strong>Critical:</strong> ${security.vulnerabilities.critical}</li>`);
				lines.push(`    <li><strong>High:</strong> ${security.vulnerabilities.high}</li>`);
				lines.push(`    <li><strong>Medium:</strong> ${security.vulnerabilities.medium}</li>`);
				lines.push(`    <li><strong>Low:</strong> ${security.vulnerabilities.low}</li>`);
				lines.push('  </ul>');
			} else if (result.type === 'performance_analysis') {
				const perf = result as PerformanceAnalysisReport;
				lines.push('  <h2>Performance Metrics</h2>');
				lines.push('  <ul>');
				lines.push(`    <li><strong>Average Response Time:</strong> ${perf.metrics.avgResponseTime}ms</li>`);
				lines.push(`    <li><strong>Memory Usage:</strong> ${perf.metrics.memoryUsage}MB</li>`);
				lines.push(`    <li><strong>CPU Usage:</strong> ${perf.metrics.cpuUsage}%</li>`);
				lines.push('  </ul>');
			}

			// Findings
			if (result.findings.length > 0) {
				lines.push('  <h2>Findings</h2>');

				for (const finding of result.findings) {
					lines.push(`  <div class="finding ${finding.severity}">`);
					lines.push(`    <h3>${this.escapeHtml(finding.title)}</h3>`);
					lines.push(`    <p>${this.escapeHtml(finding.description)}</p>`);

					if (finding.file) {
						lines.push(`    <p><strong>File:</strong> <code>${this.escapeHtml(finding.file)}</code></p>`);
						if (finding.line) {
							lines.push(`    <p><strong>Line:</strong> ${finding.line}</p>`);
						}
					}

					if (finding.codeSnippet) {
						lines.push(`    <div class="code-snippet"><pre>${this.escapeHtml(finding.codeSnippet)}</pre></div>`);
					}

					if (finding.recommendation) {
						lines.push(`    <div class="recommendation"><strong>Recommendation:</strong> ${this.escapeHtml(finding.recommendation)}</div>`);
					}

					lines.push('  </div>');
				}
			}

			// Analyzed files
			lines.push('  <h2>Analyzed Files</h2>');
			lines.push('  <ul>');
			for (const file of result.metadata.analyzedFiles) {
				lines.push(`    <li>${this.escapeHtml(file)}</li>`);
			}
			lines.push('  </ul>');

			lines.push('</body>');
			lines.push('</html>');

			return lines.join('\n');
		}

		/**
		 * Get report title based on type
		 */
		private getReportTitle(type: string): string {
			const titles: Record<string, string> = {
				general: 'General Analysis Report',
				code_review: 'Code Review Report',
				security_scan: 'Security Scan Report',
				performance_analysis: 'Performance Analysis Report',
			};
			return titles[type] || 'Analysis Report';
		}

		/**
		 * Group findings by severity
		 */
		private groupBySeverity(findings: Finding[]): Map<string, Finding[]> {
			const groups = new Map<string, Finding[]>();

			for (const finding of findings) {
				const severity = finding.severity;
				if (!groups.has(severity)) {
					groups.set(severity, []);
				}
				groups.get(severity)!.push(finding);
			}

			return groups;
		}

		/**
		 * Capitalize first letter
		 */
		private capitalizeFirst(str: string): string {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		/**
		 * Escape HTML special characters
		 */
		private escapeHtml(text: string): string {
			const map: Record<string, string> = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;',
			};
			return text.replace(/[&<>"']/g, m => map[m]);
		}

		/**
		 * Load saved analysis results
		 */
		async loadAnalysisResults(filePath: string): Promise<AnalysisResult> {
			if (!fs.existsSync(filePath)) {
				throw new Error(`File not found: ${filePath}`);
			}

			const content = fs.readFileSync(filePath, 'utf-8');

			// Only JSON can be loaded back
			if (!filePath.endsWith('.json')) {
				throw new Error('Only JSON format can be loaded');
			}

			return JSON.parse(content);
		}
	}

	// ====================================================================
	// Test Suite 1: General Analysis Results
	// ====================================================================

	suite('General Analysis Results', () => {
		test('Should save analysis results to JSON file', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const result: AnalysisResult = {
				type: 'general',
				timestamp: Date.now(),
				summary: 'Analysis completed successfully',
				findings: [
					{
						severity: 'high',
						title: 'Performance issue detected',
						description: 'Function has O(n²) complexity',
						file: 'src/utils.ts',
						line: 42,
					},
				],
				metadata: {
					analyzedFiles: ['src/utils.ts', 'src/helpers.ts'],
					duration: 1500,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'analysis.json');
			await generator.saveAnalysisResults(result, outputPath, 'json');

			assert.ok(fs.existsSync(outputPath), 'JSON file should be created');

			// Verify content
			const content = fs.readFileSync(outputPath, 'utf-8');
			const parsed = JSON.parse(content);
			assert.strictEqual(parsed.type, 'general');
			assert.strictEqual(parsed.findings.length, 1);
		});

		test('Should save analysis results to Markdown file', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const result: AnalysisResult = {
				type: 'general',
				timestamp: Date.now(),
				summary: 'Analysis completed with warnings',
				findings: [
					{
						severity: 'medium',
						title: 'Code smell detected',
						description: 'Large function should be split',
						recommendation: 'Extract helper functions',
					},
				],
				metadata: {
					analyzedFiles: ['src/main.ts'],
					duration: 800,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'analysis.md');
			await generator.saveAnalysisResults(result, outputPath, 'markdown');

			assert.ok(fs.existsSync(outputPath), 'Markdown file should be created');

			// Verify content
			const content = fs.readFileSync(outputPath, 'utf-8');
			assert.ok(content.includes('# General Analysis Report'));
			assert.ok(content.includes('## Summary'));
			assert.ok(content.includes('## Findings'));
			assert.ok(content.includes('Code smell detected'));
		});

		test('Should save analysis results to HTML file', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const result: AnalysisResult = {
				type: 'general',
				timestamp: Date.now(),
				summary: 'Analysis completed',
				findings: [],
				metadata: {
					analyzedFiles: ['src/app.ts'],
					duration: 500,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'analysis.html');
			await generator.saveAnalysisResults(result, outputPath, 'html');

			assert.ok(fs.existsSync(outputPath), 'HTML file should be created');

			// Verify content
			const content = fs.readFileSync(outputPath, 'utf-8');
			assert.ok(content.includes('<!DOCTYPE html>'));
			assert.ok(content.includes('<title>General Analysis Report</title>'));
			assert.ok(content.includes('Analysis completed'));
		});
	});

	// ====================================================================
	// Test Suite 2: Code Review Reports
	// ====================================================================

	suite('Code Review Reports', () => {
		test('Should save code review report with quality scores', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: CodeReviewReport = {
				type: 'code_review',
				timestamp: Date.now(),
				summary: 'Code review found 3 issues',
				qualityScore: 78,
				categories: {
					maintainability: 85,
					reliability: 70,
					security: 90,
					performance: 65,
				},
				findings: [
					{
						severity: 'medium',
						title: 'Complex function',
						description: 'Cyclomatic complexity is 15 (threshold: 10)',
						file: 'src/complex.ts',
						line: 10,
						recommendation: 'Refactor into smaller functions',
					},
				],
				metadata: {
					analyzedFiles: ['src/complex.ts'],
					duration: 2000,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'code-review.json');
			await generator.saveAnalysisResults(report, outputPath, 'json');

			assert.ok(fs.existsSync(outputPath));

			const loaded = await generator.loadAnalysisResults(outputPath);
			const review = loaded as CodeReviewReport;
			assert.strictEqual(review.qualityScore, 78);
			assert.strictEqual(review.categories.maintainability, 85);
		});

		test('Should generate Markdown code review with categories', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: CodeReviewReport = {
				type: 'code_review',
				timestamp: Date.now(),
				summary: 'Overall code quality is good',
				qualityScore: 88,
				categories: {
					maintainability: 90,
					reliability: 85,
					security: 92,
					performance: 85,
				},
				findings: [],
				metadata: {
					analyzedFiles: ['src/app.ts'],
					duration: 1000,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'review.md');
			await generator.saveAnalysisResults(report, outputPath, 'markdown');

			const content = fs.readFileSync(outputPath, 'utf-8');
			assert.ok(content.includes('## Quality Score'));
			assert.ok(content.includes('**Overall Score:** 88/100'));
			assert.ok(content.includes('**Maintainability:** 90/100'));
		});
	});

	// ====================================================================
	// Test Suite 3: Security Scan Reports
	// ====================================================================

	suite('Security Scan Reports', () => {
		test('Should save security scan with vulnerability counts', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: SecurityScanReport = {
				type: 'security_scan',
				timestamp: Date.now(),
				summary: 'Found 5 security vulnerabilities',
				vulnerabilities: {
					critical: 1,
					high: 2,
					medium: 2,
					low: 0,
				},
				complianceStatus: {
					owasp: false,
					cwe: true,
				},
				findings: [
					{
						severity: 'critical',
						title: 'SQL Injection',
						description: 'Unsanitized user input in SQL query',
						file: 'src/db.ts',
						line: 55,
						recommendation: 'Use parameterized queries',
						codeSnippet: 'db.query(`SELECT * FROM users WHERE id = ${userId}`)',
					},
				],
				metadata: {
					analyzedFiles: ['src/db.ts', 'src/auth.ts'],
					duration: 3000,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'security.json');
			await generator.saveAnalysisResults(report, outputPath, 'json');

			const loaded = await generator.loadAnalysisResults(outputPath);
			const security = loaded as SecurityScanReport;
			assert.strictEqual(security.vulnerabilities.critical, 1);
			assert.strictEqual(security.vulnerabilities.high, 2);
		});

		test('Should generate HTML security report with compliance status', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: SecurityScanReport = {
				type: 'security_scan',
				timestamp: Date.now(),
				summary: 'Security scan completed',
				vulnerabilities: {
					critical: 0,
					high: 0,
					medium: 1,
					low: 2,
				},
				complianceStatus: {
					owasp: true,
					cwe: true,
				},
				findings: [],
				metadata: {
					analyzedFiles: ['src/app.ts'],
					duration: 2500,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'security.html');
			await generator.saveAnalysisResults(report, outputPath, 'html');

			const content = fs.readFileSync(outputPath, 'utf-8');
			assert.ok(content.includes('<h2>Vulnerabilities</h2>'));
			assert.ok(content.includes('<strong>Critical:</strong> 0'));
		});
	});

	// ====================================================================
	// Test Suite 4: Performance Analysis Reports
	// ====================================================================

	suite('Performance Analysis Reports', () => {
		test('Should save performance report with metrics', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: PerformanceAnalysisReport = {
				type: 'performance_analysis',
				timestamp: Date.now(),
				summary: 'Performance analysis identified 2 bottlenecks',
				metrics: {
					avgResponseTime: 250,
					memoryUsage: 128,
					cpuUsage: 45,
				},
				bottlenecks: [
					{
						severity: 'high',
						title: 'Slow database query',
						description: 'Query takes 500ms on average',
						file: 'src/queries.ts',
						line: 20,
						recommendation: 'Add index on user_id column',
					},
				],
				findings: [],
				metadata: {
					analyzedFiles: ['src/queries.ts'],
					duration: 5000,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'performance.json');
			await generator.saveAnalysisResults(report, outputPath, 'json');

			const loaded = await generator.loadAnalysisResults(outputPath);
			const perf = loaded as PerformanceAnalysisReport;
			assert.strictEqual(perf.metrics.avgResponseTime, 250);
			assert.strictEqual(perf.metrics.memoryUsage, 128);
		});

		test('Should generate Markdown performance report', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const report: PerformanceAnalysisReport = {
				type: 'performance_analysis',
				timestamp: Date.now(),
				summary: 'System performance is acceptable',
				metrics: {
					avgResponseTime: 150,
					memoryUsage: 64,
					cpuUsage: 30,
				},
				bottlenecks: [],
				findings: [],
				metadata: {
					analyzedFiles: ['src/api.ts'],
					duration: 4000,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'perf.md');
			await generator.saveAnalysisResults(report, outputPath, 'markdown');

			const content = fs.readFileSync(outputPath, 'utf-8');
			assert.ok(content.includes('## Performance Metrics'));
			assert.ok(content.includes('**Average Response Time:** 150ms'));
			assert.ok(content.includes('**Memory Usage:** 64MB'));
		});
	});

	// ====================================================================
	// Test Suite 5: Report Loading
	// ====================================================================

	suite('Report Loading', () => {
		test('Should load saved JSON report', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const original: AnalysisResult = {
				type: 'general',
				timestamp: 1234567890,
				summary: 'Test report',
				findings: [],
				metadata: {
					analyzedFiles: ['test.ts'],
					duration: 100,
					toolVersion: '1.0.0',
				},
			};

			const outputPath = path.join(testWorkspacePath, 'reports', 'load-test.json');
			await generator.saveAnalysisResults(original, outputPath);

			const loaded = await generator.loadAnalysisResults(outputPath);

			assert.strictEqual(loaded.type, original.type);
			assert.strictEqual(loaded.timestamp, original.timestamp);
			assert.strictEqual(loaded.summary, original.summary);
		});

		test('Should throw error for non-existent file', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const nonExistentPath = path.join(testWorkspacePath, 'nonexistent.json');

			await assert.rejects(
				async () => await generator.loadAnalysisResults(nonExistentPath),
				/File not found/
			);
		});

		test('Should throw error for non-JSON file', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const markdownPath = path.join(testWorkspacePath, 'test.md');
			fs.writeFileSync(markdownPath, '# Test');

			await assert.rejects(
				async () => await generator.loadAnalysisResults(markdownPath),
				/Only JSON format can be loaded/
			);
		});
	});

	// ====================================================================
	// Test Suite 6: Format Options
	// ====================================================================

	suite('Format Options', () => {
		test('Should support all three format options', async function () {
			this.timeout(PROVIDER_TEST_TIMEOUTS.STANDARD_TEST);

			const generator = new ReportGenerator();
			const result: AnalysisResult = {
				type: 'general',
				timestamp: Date.now(),
				summary: 'Multi-format test',
				findings: [],
				metadata: {
					analyzedFiles: ['test.ts'],
					duration: 100,
					toolVersion: '1.0.0',
				},
			};

			const basePath = path.join(testWorkspacePath, 'reports', 'multi');

			// Save in all formats
			await generator.saveAnalysisResults(result, `${basePath}.json`, 'json');
			await generator.saveAnalysisResults(result, `${basePath}.md`, 'markdown');
			await generator.saveAnalysisResults(result, `${basePath}.html`, 'html');

			// Verify all files exist
			assert.ok(fs.existsSync(`${basePath}.json`));
			assert.ok(fs.existsSync(`${basePath}.md`));
			assert.ok(fs.existsSync(`${basePath}.html`));
		});
	});
});
