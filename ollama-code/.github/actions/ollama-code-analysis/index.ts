/**
 * GitHub Action for Ollama Code Analysis
 *
 * Comprehensive CI/CD integration with AI-powered code analysis,
 * quality gates, and automated reporting.
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CIPipelineIntegrator, CIPipelineConfig, DEFAULT_CI_PIPELINE_CONFIG } from '../../../src/ai/vcs/ci-pipeline-integrator.js';
import { safeParseInt, safeParseEnum, validateRepositoryPath } from '../../../src/ai/vcs/config/default-configurations.js';

async function run(): Promise<void> {
  try {
    // Validate repository path for security
    const repositoryPath = process.env.GITHUB_WORKSPACE || process.cwd();
    const pathValidation = validateRepositoryPath(repositoryPath);

    if (!pathValidation.valid) {
      core.setFailed(`Invalid repository path: ${pathValidation.error}`);
      return;
    }

    // Get inputs from action configuration
    const config: CIPipelineConfig = {
      repositoryPath: pathValidation.sanitized,
      platform: 'github',
      enableSecurityAnalysis: core.getInput('enable-security') === 'true',
      enablePerformanceAnalysis: core.getInput('enable-performance') === 'true',
      enableArchitecturalAnalysis: core.getInput('enable-architecture') === 'true',
      enableRegressionAnalysis: core.getInput('enable-regression') === 'true',
      enableQualityGates: true,
      analysisTimeout: safeParseInt(core.getInput('analysis-timeout'), 300) * 1000,
      reportFormat: safeParseEnum(core.getInput('report-format'), ['json', 'sarif', 'markdown'] as const, 'json'),
      outputPath: core.getInput('output-path') || './reports',
      qualityGates: {
        minQualityScore: safeParseInt(core.getInput('min-quality-score'), 80),
        maxCriticalIssues: safeParseInt(core.getInput('max-critical-issues'), 0),
        maxSecurityIssues: safeParseInt(core.getInput('max-security-issues'), 5),
        maxPerformanceIssues: safeParseInt(core.getInput('max-performance-issues'), 3),
        minTestCoverage: safeParseInt(core.getInput('min-test-coverage'), 80),
        maxComplexityIncrease: 20,
        maxTechnicalDebtIncrease: 10,
        regressionThreshold: safeParseEnum(core.getInput('regression-threshold'), ['low', 'medium', 'high'] as const, 'medium'),
        blockOnFailure: core.getInput('fail-on-quality-gate') === 'true'
      },
      notifications: {
        enableSlack: false,
        enableEmail: false,
        enableGitHubComments: core.getInput('enable-pr-comments') === 'true',
        enableMergeRequestComments: false,
        webhookUrls: core.getInput('webhook-url') ? [core.getInput('webhook-url')] : [],
        emailRecipients: []
      }
    };

    core.info('🚀 Starting Ollama Code Analysis');
    core.info(`Repository: ${config.repositoryPath}`);
    core.info(`Quality Score Threshold: ${config.qualityGates.minQualityScore}%`);

    // Initialize CI pipeline integrator
    const integrator = new CIPipelineIntegrator(config);

    // Execute comprehensive analysis
    const result = await integrator.executeAnalysis();

    // Set outputs for other actions to use
    core.setOutput('quality-score', result.overallScore.toString());
    core.setOutput('quality-gates-passed', result.qualityGatePassed.toString());
    core.setOutput('security-issues', result.results.security?.totalVulnerabilities?.toString() || '0');
    core.setOutput('performance-issues', result.results.performance?.totalIssues?.toString() || '0');
    core.setOutput('regression-risk', result.results.regression?.overallRisk || 'low');
    core.setOutput('report-url', result.reportUrls[0] || '');

    // Log summary
    core.info('📊 Analysis Summary:');
    core.info(`   Overall Score: ${result.overallScore}/100`);
    core.info(`   Quality Gates: ${result.qualityGatePassed ? '✅ PASSED' : '❌ FAILED'}`);
    core.info(`   Execution Time: ${Math.round(result.executionTime / 1000)}s`);

    // Log quality gate results
    if (result.qualityGateResults.length > 0) {
      core.info('🚪 Quality Gate Results:');
      for (const gate of result.qualityGateResults) {
        const status = gate.status === 'passed' ? '✅' : gate.status === 'warning' ? '⚠️' : '❌';
        core.info(`   ${status} ${gate.name}: ${gate.actualValue}/${gate.expectedValue}`);
      }
    }

    // Log recommendations
    if (result.recommendations.length > 0) {
      core.info('💡 Recommendations:');
      for (const recommendation of result.recommendations.slice(0, 5)) {
        core.info(`   • ${recommendation}`);
      }
    }

    // Create PR comment if enabled and this is a pull request
    if (config.notifications.enableGitHubComments && github.context.eventName === 'pull_request') {
      await createPullRequestComment(result, config);
    }

    // Create job summary
    await createJobSummary(result);

    // Upload reports as artifacts
    if (result.reportUrls.length > 0) {
      await uploadReportsAsArtifacts(result.reportUrls);
    }

    // Fail the action if quality gates failed and configured to do so
    if (!result.qualityGatePassed && config.qualityGates.blockOnFailure) {
      const failedGates = result.qualityGateResults.filter(gate => gate.status === 'failed');
      const errorMessage = `Quality gates failed: ${failedGates.map(g => g.name).join(', ')}`;
      core.setFailed(errorMessage);
      return;
    }

    core.info('✅ Ollama Code Analysis completed successfully');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    core.error(`❌ Analysis failed: ${errorMessage}`);
    core.setFailed(errorMessage);
  }
}

/**
 * Create pull request comment with analysis results
 */
async function createPullRequestComment(result: any, config: CIPipelineConfig): Promise<void> {
  try {
    const token = core.getInput('github-token') || process.env.GITHUB_TOKEN;
    if (!token) {
      core.warning('GitHub token not provided, skipping PR comment');
      return;
    }

    const octokit = github.getOctokit(token);
    const context = github.context;

    if (!context.payload.pull_request) {
      return;
    }

    const comment = generatePullRequestComment(result);

    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      body: comment
    });

    core.info('📝 Created pull request comment');

  } catch (error) {
    core.warning(`Failed to create PR comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate pull request comment content
 */
function generatePullRequestComment(result: any): string {
  const status = result.qualityGatePassed ? '✅ **PASSED**' : '❌ **FAILED**';
  const score = result.overallScore;

  let comment = `## 🤖 Ollama Code Analysis Results\n\n`;
  comment += `**Status:** ${status}\n`;
  comment += `**Overall Score:** ${score}/100\n`;
  comment += `**Execution Time:** ${Math.round(result.executionTime / 1000)}s\n\n`;

  // Quality Gates
  comment += `### 🚪 Quality Gates\n\n`;
  for (const gate of result.qualityGateResults) {
    const statusIcon = gate.status === 'passed' ? '✅' : gate.status === 'warning' ? '⚠️' : '❌';
    comment += `- ${statusIcon} **${gate.name}**: ${gate.actualValue}/${gate.expectedValue}\n`;
  }

  // Analysis Results
  if (result.results.security) {
    comment += `\n### 🔒 Security Analysis\n`;
    comment += `- **Total Vulnerabilities:** ${result.results.security.totalVulnerabilities}\n`;
    comment += `- **Critical:** ${result.results.security.criticalVulnerabilities}\n`;
    comment += `- **High:** ${result.results.security.highVulnerabilities}\n`;
  }

  if (result.results.performance) {
    comment += `\n### ⚡ Performance Analysis\n`;
    comment += `- **Total Issues:** ${result.results.performance.totalIssues}\n`;
    comment += `- **Critical Issues:** ${result.results.performance.criticalIssues}\n`;
  }

  if (result.results.quality) {
    comment += `\n### 📊 Quality Metrics\n`;
    comment += `- **Test Coverage:** ${result.results.quality.testCoverage}%\n`;
    comment += `- **Maintainability:** ${result.results.quality.maintainability}%\n`;
  }

  // Recommendations
  if (result.recommendations.length > 0) {
    comment += `\n### 💡 Recommendations\n`;
    for (const rec of result.recommendations.slice(0, 5)) {
      comment += `- ${rec}\n`;
    }
  }

  comment += `\n---\n*Generated by [Ollama Code](https://github.com/ollama/ollama-code) at ${new Date().toISOString()}*`;

  return comment;
}

/**
 * Create GitHub job summary
 */
async function createJobSummary(result: any): Promise<void> {
  try {
    const summary = core.summary;

    summary.addHeading('🤖 Ollama Code Analysis Results', 2);

    // Overview table
    summary.addTable([
      [
        { data: 'Metric', header: true },
        { data: 'Value', header: true },
        { data: 'Status', header: true }
      ],
      [
        'Overall Score',
        `${result.overallScore}/100`,
        result.overallScore >= 80 ? '✅' : '❌'
      ],
      [
        'Quality Gates',
        `${result.qualityGateResults.filter((g: any) => g.status === 'passed').length}/${result.qualityGateResults.length}`,
        result.qualityGatePassed ? '✅' : '❌'
      ],
      [
        'Execution Time',
        `${Math.round(result.executionTime / 1000)}s`,
        '⏱️'
      ]
    ]);

    // Analysis results
    if (result.results.security) {
      summary.addHeading('🔒 Security Analysis', 3);
      summary.addList([
        `Total Vulnerabilities: ${result.results.security.totalVulnerabilities}`,
        `Critical: ${result.results.security.criticalVulnerabilities}`,
        `High: ${result.results.security.highVulnerabilities}`,
        `Medium: ${result.results.security.mediumVulnerabilities}`,
        `Low: ${result.results.security.lowVulnerabilities}`
      ]);
    }

    // Quality Gates
    if (result.qualityGateResults.length > 0) {
      summary.addHeading('🚪 Quality Gates', 3);
      const gateRows = [
        [
          { data: 'Gate', header: true },
          { data: 'Status', header: true },
          { data: 'Actual', header: true },
          { data: 'Expected', header: true }
        ]
      ];

      for (const gate of result.qualityGateResults) {
        gateRows.push([
          gate.name,
          gate.status === 'passed' ? '✅ Passed' : gate.status === 'warning' ? '⚠️ Warning' : '❌ Failed',
          gate.actualValue.toString(),
          gate.expectedValue.toString()
        ]);
      }

      summary.addTable(gateRows);
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      summary.addHeading('💡 Recommendations', 3);
      summary.addList(result.recommendations.slice(0, 10));
    }

    await summary.write();

  } catch (error) {
    core.warning(`Failed to create job summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload reports as GitHub artifacts
 */
async function uploadReportsAsArtifacts(reportUrls: string[]): Promise<void> {
  try {
    // Implementation would use @actions/artifact to upload reports
    core.info(`📁 Reports generated: ${reportUrls.join(', ')}`);

    // For now, just log the report paths
    for (const reportUrl of reportUrls) {
      core.info(`📄 Report: ${reportUrl}`);
    }

  } catch (error) {
    core.warning(`Failed to upload artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Run the action
if (require.main === module) {
  run();
}

export { run };