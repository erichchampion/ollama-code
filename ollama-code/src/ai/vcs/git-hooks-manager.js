"use strict";
/**
 * Git Hooks Manager
 *
 * Automated installation and management of git hooks for AI-powered
 * code analysis, commit enhancement, and quality tracking.
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
exports.DEFAULT_GIT_HOOKS_CONFIG = exports.GitHooksManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_js_1 = require("../../utils/logger.js");
const vcs_intelligence_js_1 = require("./vcs-intelligence.js");
const commit_message_generator_js_1 = require("./commit-message-generator.js");
const regression_analyzer_js_1 = require("./regression-analyzer.js");
const code_quality_tracker_js_1 = require("./code-quality-tracker.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GitHooksManager {
    constructor(config) {
        this.config = config;
        this.hooksPath = path.join(config.repositoryPath, '.git', 'hooks');
        // Initialize VCS components
        this.vcsIntelligence = new vcs_intelligence_js_1.VCSIntelligence({
            repositoryPath: config.repositoryPath,
            defaultBranch: 'main',
            enableAutoAnalysis: true,
            analysisDepth: 30,
            enableGitHooks: true,
            hookTypes: ['pre-commit', 'commit-msg', 'pre-push', 'post-merge'],
            qualityThresholds: {
                maxComplexity: 10,
                minTestCoverage: 80,
                maxFileSize: 500,
                maxLinesChanged: 500,
                criticalFilePatterns: ['src/core/**', 'src/security/**']
            }
        });
        this.commitGenerator = new commit_message_generator_js_1.CommitMessageGenerator({
            repositoryPath: config.repositoryPath,
            style: 'conventional',
            maxLength: 72,
            includeScope: true,
            includeBody: true,
            includeFooter: false,
            aiProvider: 'ollama'
        });
        this.regressionAnalyzer = new regression_analyzer_js_1.RegressionAnalyzer({
            repositoryPath: config.repositoryPath,
            analysisDepth: 50,
            riskThresholds: {
                fileSize: 500,
                linesChanged: 300,
                filesChanged: 10,
                complexity: 15,
                hotspotFrequency: 5,
                authorExperience: 6
            },
            enablePredictiveAnalysis: true,
            enableHistoricalLearning: true,
            criticalPaths: ['src/core/**', 'src/security/**'],
            testPatterns: ['**/*.test.*', '**/*.spec.*', '**/tests/**'],
            buildPatterns: ['**/package.json', '**/Dockerfile', '**/*.yml']
        });
        this.qualityTracker = new code_quality_tracker_js_1.CodeQualityTracker({
            repositoryPath: config.repositoryPath,
            trackingInterval: 'commit',
            retentionPeriod: 90,
            qualityThresholds: {
                minOverallScore: 80,
                maxCriticalIssues: 0,
                maxSecurityIssues: 5,
                minTestCoverage: 80,
                maxTechnicalDebt: 40,
                maxComplexity: 10,
                minMaintainability: 70
            },
            enableTrendAnalysis: true,
            enablePredictiveAnalysis: true,
            enableAlerts: true,
            alertThresholds: {
                qualityDegradation: 10,
                securityIssueIncrease: 3,
                complexityIncrease: 20,
                testCoverageDecrease: 10,
                technicalDebtIncrease: 8
            },
            storageBackend: 'file',
            storagePath: path.join(config.repositoryPath, '.ollama-code', 'quality-tracking')
        });
    }
    /**
     * Install all configured git hooks
     */
    async installHooks() {
        logger_js_1.logger.info('Installing git hooks for AI-powered development assistance');
        try {
            // Ensure hooks directory exists
            await this.ensureHooksDirectory();
            // Backup existing hooks if enabled
            if (this.config.backupExistingHooks) {
                await this.backupExistingHooks();
            }
            // Install individual hooks based on configuration
            const installPromises = [];
            if (this.config.enablePreCommit) {
                installPromises.push(this.installPreCommitHook());
            }
            if (this.config.enableCommitMsg) {
                installPromises.push(this.installCommitMsgHook());
            }
            if (this.config.enablePrePush) {
                installPromises.push(this.installPrePushHook());
            }
            if (this.config.enablePostMerge) {
                installPromises.push(this.installPostMergeHook());
            }
            await Promise.all(installPromises);
            logger_js_1.logger.info('Git hooks installation completed successfully');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to install git hooks', error);
            throw error;
        }
    }
    /**
     * Uninstall all ollama-code git hooks
     */
    async uninstallHooks() {
        logger_js_1.logger.info('Uninstalling ollama-code git hooks');
        try {
            const hookTypes = ['pre-commit', 'commit-msg', 'pre-push', 'post-merge'];
            for (const hookType of hookTypes) {
                const hookPath = path.join(this.hooksPath, hookType);
                try {
                    const content = await fs.readFile(hookPath, 'utf8');
                    // Only remove if it's our hook
                    if (content.includes('# ollama-code generated hook')) {
                        await fs.unlink(hookPath);
                        logger_js_1.logger.info(`Removed ${hookType} hook`);
                    }
                }
                catch (error) {
                    // Hook doesn't exist, which is fine
                }
            }
            // Restore backed up hooks if they exist
            await this.restoreBackedUpHooks();
            logger_js_1.logger.info('Git hooks uninstallation completed');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to uninstall git hooks', error);
            throw error;
        }
    }
    /**
     * Execute pre-commit hook analysis
     */
    async executePreCommitHook(context) {
        const startTime = Date.now();
        logger_js_1.logger.info('Executing pre-commit hook analysis');
        try {
            // Check for bypass
            if (context.bypassRequested || context.environment.OLLAMA_CODE_BYPASS === 'true') {
                logger_js_1.logger.warn('Pre-commit analysis bypassed by user request');
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Analysis bypassed by user request',
                    executionTime: Date.now() - startTime
                };
            }
            // Get staged files for analysis
            const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only', {
                cwd: context.repositoryPath
            });
            if (!stagedFiles.trim()) {
                return {
                    success: true,
                    exitCode: 0,
                    output: 'No staged files to analyze',
                    executionTime: Date.now() - startTime
                };
            }
            const files = stagedFiles.trim().split('\n');
            logger_js_1.logger.info(`Analyzing ${files.length} staged files`);
            // Perform comprehensive analysis
            const analysisResults = await this.vcsIntelligence.analyzeRepository();
            // Check for critical issues
            const criticalIssues = this.findCriticalIssues(analysisResults);
            if (criticalIssues.length > 0 && this.config.enableQualityGates) {
                const errorMessage = `Pre-commit analysis failed with ${criticalIssues.length} critical issues:\n${criticalIssues.map(issue => `  - ${issue}`).join('\n')}\n\nUse OLLAMA_CODE_BYPASS=true to bypass this check if necessary.`;
                return {
                    success: false,
                    exitCode: 1,
                    output: errorMessage,
                    error: 'Critical issues found in staged files',
                    executionTime: Date.now() - startTime,
                    analysisResults
                };
            }
            return {
                success: true,
                exitCode: 0,
                output: `Pre-commit analysis passed. Analyzed ${files.length} files with no critical issues.`,
                executionTime: Date.now() - startTime,
                analysisResults
            };
        }
        catch (error) {
            const errorMessage = `Pre-commit analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            if (this.config.failOnAnalysisError) {
                return {
                    success: false,
                    exitCode: 1,
                    output: errorMessage,
                    error: errorMessage,
                    executionTime: Date.now() - startTime
                };
            }
            else {
                logger_js_1.logger.warn('Pre-commit analysis failed but continuing due to configuration', error);
                return {
                    success: true,
                    exitCode: 0,
                    output: `Analysis failed but continuing: ${errorMessage}`,
                    executionTime: Date.now() - startTime
                };
            }
        }
    }
    /**
     * Execute commit message enhancement
     */
    async executeCommitMsgHook(context) {
        const startTime = Date.now();
        const commitMsgFile = context.arguments[0];
        if (!commitMsgFile) {
            return {
                success: false,
                exitCode: 1,
                output: 'Commit message file not provided',
                error: 'Missing commit message file argument',
                executionTime: Date.now() - startTime
            };
        }
        try {
            // Check for bypass
            if (context.bypassRequested || context.environment.OLLAMA_CODE_BYPASS === 'true') {
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Commit message enhancement bypassed',
                    executionTime: Date.now() - startTime
                };
            }
            // Read current commit message
            const currentMessage = await fs.readFile(commitMsgFile, 'utf8');
            // Skip if message already looks good or is a merge/revert
            if (this.shouldSkipCommitEnhancement(currentMessage)) {
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Commit message enhancement skipped (already good or special commit)',
                    executionTime: Date.now() - startTime
                };
            }
            // Generate enhanced commit message
            const enhanced = await this.commitGenerator.generateCommitMessage();
            if (enhanced && enhanced.message.trim() !== currentMessage.trim()) {
                // Create enhanced message with original as fallback
                const enhancedMessage = `${enhanced.message}\n\n# Original message:\n# ${currentMessage.split('\n').join('\n# ')}`;
                await fs.writeFile(commitMsgFile, enhancedMessage);
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Commit message enhanced with AI suggestions',
                    executionTime: Date.now() - startTime,
                    analysisResults: enhanced
                };
            }
            return {
                success: true,
                exitCode: 0,
                output: 'No commit message enhancement needed',
                executionTime: Date.now() - startTime
            };
        }
        catch (error) {
            logger_js_1.logger.error('Commit message enhancement failed', error);
            if (this.config.failOnAnalysisError) {
                return {
                    success: false,
                    exitCode: 1,
                    output: `Commit message enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    executionTime: Date.now() - startTime
                };
            }
            else {
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Commit message enhancement failed but continuing',
                    executionTime: Date.now() - startTime
                };
            }
        }
    }
    /**
     * Execute pre-push regression analysis
     */
    async executePrePushHook(context) {
        const startTime = Date.now();
        logger_js_1.logger.info('Executing pre-push regression analysis');
        try {
            // Check for bypass
            if (context.bypassRequested || context.environment.OLLAMA_CODE_BYPASS === 'true') {
                return {
                    success: true,
                    exitCode: 0,
                    output: 'Pre-push analysis bypassed',
                    executionTime: Date.now() - startTime
                };
            }
            // Perform regression analysis
            const regressionAnalysis = await this.regressionAnalyzer.analyzeRegressions();
            // Check risk levels
            const highRiskPredictions = regressionAnalysis.predictions.filter((p) => p.risk === 'high' || p.confidence > 0.8);
            if (highRiskPredictions.length > 0 && this.config.enableQualityGates) {
                const riskSummary = highRiskPredictions.map((p) => `  - ${p.type} risk: ${p.description} (confidence: ${Math.round(p.confidence * 100)}%)`).join('\n');
                const errorMessage = `Pre-push analysis detected high regression risk:\n${riskSummary}\n\nUse OLLAMA_CODE_BYPASS=true to bypass if necessary.`;
                return {
                    success: false,
                    exitCode: 1,
                    output: errorMessage,
                    error: 'High regression risk detected',
                    executionTime: Date.now() - startTime,
                    analysisResults: regressionAnalysis
                };
            }
            return {
                success: true,
                exitCode: 0,
                output: `Pre-push regression analysis passed. Risk level: ${regressionAnalysis.riskAssessment.overallRisk}`,
                executionTime: Date.now() - startTime,
                analysisResults: regressionAnalysis
            };
        }
        catch (error) {
            const errorMessage = `Pre-push analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            if (this.config.failOnAnalysisError) {
                return {
                    success: false,
                    exitCode: 1,
                    output: errorMessage,
                    error: errorMessage,
                    executionTime: Date.now() - startTime
                };
            }
            else {
                return {
                    success: true,
                    exitCode: 0,
                    output: `Analysis failed but continuing: ${errorMessage}`,
                    executionTime: Date.now() - startTime
                };
            }
        }
    }
    /**
     * Execute post-merge quality tracking
     */
    async executePostMergeHook(context) {
        const startTime = Date.now();
        logger_js_1.logger.info('Executing post-merge quality tracking');
        try {
            // This hook doesn't block, so no bypass needed
            // Track quality metrics after merge
            const qualitySnapshot = await this.qualityTracker.takeSnapshot();
            // Generate basic report
            const report = await this.qualityTracker.generateReport({
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                end: new Date()
            });
            let output = 'Post-merge quality tracking completed';
            if (report.topIssues && report.topIssues.length > 0) {
                output += `\nTop quality issues:\n${report.topIssues.map((issue) => `  - ${issue.category}: ${issue.description}`).join('\n')}`;
            }
            return {
                success: true,
                exitCode: 0,
                output,
                executionTime: Date.now() - startTime,
                analysisResults: { qualitySnapshot, report }
            };
        }
        catch (error) {
            logger_js_1.logger.error('Post-merge quality tracking failed', error);
            // Post-merge hooks should not fail the operation
            return {
                success: true,
                exitCode: 0,
                output: `Quality tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                executionTime: Date.now() - startTime
            };
        }
    }
    /**
     * Install pre-commit hook
     */
    async installPreCommitHook() {
        const hookPath = path.join(this.hooksPath, 'pre-commit');
        const hookScript = this.generatePreCommitScript();
        await fs.writeFile(hookPath, hookScript);
        await fs.chmod(hookPath, 0o755);
        logger_js_1.logger.info('Pre-commit hook installed');
    }
    /**
     * Install commit-msg hook
     */
    async installCommitMsgHook() {
        const hookPath = path.join(this.hooksPath, 'commit-msg');
        const hookScript = this.generateCommitMsgScript();
        await fs.writeFile(hookPath, hookScript);
        await fs.chmod(hookPath, 0o755);
        logger_js_1.logger.info('Commit-msg hook installed');
    }
    /**
     * Install pre-push hook
     */
    async installPrePushHook() {
        const hookPath = path.join(this.hooksPath, 'pre-push');
        const hookScript = this.generatePrePushScript();
        await fs.writeFile(hookPath, hookScript);
        await fs.chmod(hookPath, 0o755);
        logger_js_1.logger.info('Pre-push hook installed');
    }
    /**
     * Install post-merge hook
     */
    async installPostMergeHook() {
        const hookPath = path.join(this.hooksPath, 'post-merge');
        const hookScript = this.generatePostMergeScript();
        await fs.writeFile(hookPath, hookScript);
        await fs.chmod(hookPath, 0o755);
        logger_js_1.logger.info('Post-merge hook installed');
    }
    /**
     * Generate pre-commit hook script
     */
    generatePreCommitScript() {
        return `#!/bin/sh
# ollama-code generated hook - pre-commit analysis

# Enable bypass with OLLAMA_CODE_BYPASS=true
if [ "$OLLAMA_CODE_BYPASS" = "true" ]; then
    echo "ollama-code: Pre-commit analysis bypassed"
    exit 0
fi

# Check if ollama-code is available
if ! command -v ollama-code >/dev/null 2>&1; then
    echo "ollama-code: Command not found, skipping analysis"
    exit 0
fi

echo "ollama-code: Running pre-commit analysis..."

# Execute pre-commit analysis
ollama-code hook pre-commit --cwd="${this.config.repositoryPath}" --timeout=${this.config.analysisTimeout}
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo "ollama-code: Pre-commit analysis failed (exit code: $exit_code)"
    echo "To bypass this check, use: OLLAMA_CODE_BYPASS=true git commit"
    exit $exit_code
fi

echo "ollama-code: Pre-commit analysis passed"
exit 0
`;
    }
    /**
     * Generate commit-msg hook script
     */
    generateCommitMsgScript() {
        return `#!/bin/sh
# ollama-code generated hook - commit message enhancement

# Enable bypass with OLLAMA_CODE_BYPASS=true
if [ "$OLLAMA_CODE_BYPASS" = "true" ]; then
    echo "ollama-code: Commit message enhancement bypassed"
    exit 0
fi

# Check if ollama-code is available
if ! command -v ollama-code >/dev/null 2>&1; then
    exit 0
fi

# Execute commit message enhancement
ollama-code hook commit-msg --cwd="${this.config.repositoryPath}" --commit-msg-file="$1" --timeout=${this.config.analysisTimeout}
exit_code=$?

# Commit message hooks should generally not fail the commit
if [ $exit_code -ne 0 ]; then
    echo "ollama-code: Commit message enhancement failed but continuing"
fi

exit 0
`;
    }
    /**
     * Generate pre-push hook script
     */
    generatePrePushScript() {
        return `#!/bin/sh
# ollama-code generated hook - regression analysis

# Enable bypass with OLLAMA_CODE_BYPASS=true
if [ "$OLLAMA_CODE_BYPASS" = "true" ]; then
    echo "ollama-code: Pre-push analysis bypassed"
    exit 0
fi

# Check if ollama-code is available
if ! command -v ollama-code >/dev/null 2>&1; then
    echo "ollama-code: Command not found, skipping analysis"
    exit 0
fi

echo "ollama-code: Running regression analysis..."

# Execute pre-push analysis
ollama-code hook pre-push --cwd="${this.config.repositoryPath}" --timeout=${this.config.analysisTimeout}
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo "ollama-code: Regression analysis failed (exit code: $exit_code)"
    echo "To bypass this check, use: OLLAMA_CODE_BYPASS=true git push"
    exit $exit_code
fi

echo "ollama-code: Regression analysis passed"
exit 0
`;
    }
    /**
     * Generate post-merge hook script
     */
    generatePostMergeScript() {
        return `#!/bin/sh
# ollama-code generated hook - quality tracking

# Check if ollama-code is available
if ! command -v ollama-code >/dev/null 2>&1; then
    exit 0
fi

# Execute post-merge quality tracking (async, non-blocking)
ollama-code hook post-merge --cwd="${this.config.repositoryPath}" --timeout=${this.config.analysisTimeout} &

exit 0
`;
    }
    /**
     * Ensure hooks directory exists
     */
    async ensureHooksDirectory() {
        try {
            await fs.mkdir(this.hooksPath, { recursive: true });
        }
        catch (error) {
            // Directory might already exist
        }
    }
    /**
     * Backup existing hooks
     */
    async backupExistingHooks() {
        const backupDir = path.join(this.hooksPath, 'ollama-code-backup');
        await fs.mkdir(backupDir, { recursive: true });
        const hookTypes = ['pre-commit', 'commit-msg', 'pre-push', 'post-merge'];
        for (const hookType of hookTypes) {
            const hookPath = path.join(this.hooksPath, hookType);
            const backupPath = path.join(backupDir, `${hookType}.backup`);
            try {
                const content = await fs.readFile(hookPath, 'utf8');
                // Only backup if it's not our hook
                if (!content.includes('# ollama-code generated hook')) {
                    await fs.writeFile(backupPath, content);
                    await fs.chmod(backupPath, 0o755);
                    logger_js_1.logger.info(`Backed up existing ${hookType} hook`);
                }
            }
            catch (error) {
                // Hook doesn't exist, which is fine
            }
        }
    }
    /**
     * Restore backed up hooks
     */
    async restoreBackedUpHooks() {
        const backupDir = path.join(this.hooksPath, 'ollama-code-backup');
        try {
            const backupFiles = await fs.readdir(backupDir);
            for (const backupFile of backupFiles) {
                if (backupFile.endsWith('.backup')) {
                    const hookType = backupFile.replace('.backup', '');
                    const backupPath = path.join(backupDir, backupFile);
                    const hookPath = path.join(this.hooksPath, hookType);
                    const content = await fs.readFile(backupPath, 'utf8');
                    await fs.writeFile(hookPath, content);
                    await fs.chmod(hookPath, 0o755);
                    logger_js_1.logger.info(`Restored ${hookType} hook from backup`);
                }
            }
            // Remove backup directory
            await fs.rm(backupDir, { recursive: true });
        }
        catch (error) {
            // Backup directory doesn't exist or other error
            logger_js_1.logger.debug('No backup hooks to restore', error);
        }
    }
    /**
     * Find critical issues in analysis results
     */
    findCriticalIssues(analysisResults) {
        const issues = [];
        if (analysisResults.qualityMetrics) {
            const { qualityMetrics } = analysisResults;
            if (qualityMetrics.bugs > 0) {
                issues.push(`${qualityMetrics.bugs} critical bugs detected`);
            }
            if (qualityMetrics.vulnerabilities > 0) {
                issues.push(`${qualityMetrics.vulnerabilities} security vulnerabilities detected`);
            }
            if (qualityMetrics.complexityScore > this.config.analysisTimeout) {
                issues.push(`Code complexity too high: ${qualityMetrics.complexityScore}`);
            }
        }
        return issues;
    }
    /**
     * Check if commit message enhancement should be skipped
     */
    shouldSkipCommitEnhancement(message) {
        const trimmed = message.trim();
        // Skip if empty or just comments
        if (!trimmed || trimmed.startsWith('#')) {
            return true;
        }
        // Skip merge commits
        if (trimmed.startsWith('Merge ') || trimmed.includes('Merge branch')) {
            return true;
        }
        // Skip revert commits
        if (trimmed.startsWith('Revert ')) {
            return true;
        }
        // Skip if already follows conventional format
        const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/;
        if (conventionalPattern.test(trimmed)) {
            return true;
        }
        // Skip if message is already descriptive enough
        if (trimmed.length > 50 && trimmed.includes(' ')) {
            return true;
        }
        return false;
    }
}
exports.GitHooksManager = GitHooksManager;
/**
 * Default git hooks configuration
 */
exports.DEFAULT_GIT_HOOKS_CONFIG = {
    enablePreCommit: true,
    enableCommitMsg: true,
    enablePrePush: true,
    enablePostMerge: true,
    enableQualityGates: true,
    bypassEnabled: true,
    analysisTimeout: 30000, // 30 seconds
    failOnAnalysisError: false,
    backupExistingHooks: true
};
//# sourceMappingURL=git-hooks-manager.js.map