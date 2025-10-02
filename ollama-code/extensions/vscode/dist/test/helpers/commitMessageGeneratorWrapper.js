"use strict";
/**
 * Commit Message Generator Wrapper
 * Mock implementation for testing commit message generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitMessageGenerator = void 0;
const test_constants_1 = require("./test-constants");
/**
 * Mock CommitMessageGenerator for testing
 */
class CommitMessageGenerator {
    constructor(config) {
        this.config = config;
    }
    async generateCommitMessage() {
        // Mock implementation - analyze staged files
        return this.generateMockMessage('feat', 'Add new feature');
    }
    async generateFromDiff(diffText) {
        // Analyze diff content to determine commit type
        const type = this.analyzeCommitType(diffText);
        const subject = this.analyzeSubject(diffText);
        return this.generateMockMessage(type, subject);
    }
    async generateWithContext(branchName, history) {
        // Generate message considering context
        const type = branchName?.startsWith('feat/') ? 'feat' :
            branchName?.startsWith('fix/') ? 'fix' : 'chore';
        return this.generateMockMessage(type, 'Update based on context');
    }
    generateMockMessage(type, subject) {
        const scope = this.config.includeScope ? test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_SCOPE : null;
        const body = this.config.includeBody ? test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_BODY : null;
        const footer = this.config.includeFooter ? test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_FOOTER : null;
        let message = '';
        if (this.config.style === 'conventional') {
            message = scope ? `${type}(${scope}): ${subject}` : `${type}: ${subject}`;
        }
        else if (this.config.style === 'emoji') {
            const emoji = this.getCommitEmoji(type);
            message = `${emoji} ${subject}`;
        }
        else {
            message = subject;
        }
        if (body && this.config.includeBody) {
            message += `\n\n${body}`;
        }
        if (footer && this.config.includeFooter) {
            message += `\n\n${footer}`;
        }
        return {
            message,
            type,
            scope,
            subject,
            body,
            footer,
            confidence: test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_CONFIDENCE,
            alternatives: [
                `${type}: Alternative message 1`,
                `${type}: Alternative message 2`
            ],
            analysis: {
                changedFiles: [],
                overallChangeType: type,
                scope,
                impactLevel: test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_IMPACT_LEVEL,
                summary: subject,
                suggestions: []
            }
        };
    }
    analyzeCommitType(diffText) {
        if (diffText.includes('function') || diffText.includes('class')) {
            return 'feat';
        }
        else if (diffText.includes('fix') || diffText.includes('bug')) {
            return 'fix';
        }
        else if (diffText.includes('.md')) {
            return 'docs';
        }
        else if (diffText.includes('test')) {
            return 'test';
        }
        return 'chore';
    }
    analyzeSubject(diffText) {
        // Extract subject from diff
        if (diffText.includes('function')) {
            return test_constants_1.COMMIT_SUBJECT_TEMPLATES.FEAT;
        }
        else if (diffText.includes('fix')) {
            return test_constants_1.COMMIT_SUBJECT_TEMPLATES.FIX;
        }
        else if (diffText.includes('test')) {
            return test_constants_1.COMMIT_SUBJECT_TEMPLATES.TEST;
        }
        return test_constants_1.COMMIT_SUBJECT_TEMPLATES.DEFAULT;
    }
    getCommitEmoji(type) {
        return test_constants_1.COMMIT_EMOJI_MAP[type] || '📦';
    }
}
exports.CommitMessageGenerator = CommitMessageGenerator;
//# sourceMappingURL=commitMessageGeneratorWrapper.js.map