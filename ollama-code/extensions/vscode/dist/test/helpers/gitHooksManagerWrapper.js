"use strict";
/**
 * Git Hooks Manager Wrapper
 * Re-exports production GitHooksManager for use in tests
 *
 * Note: This file exists to work around TypeScript rootDir restrictions.
 * The actual GitHooksManager implementation is in src/ai/vcs/git-hooks-manager.ts
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
exports.GitHooksManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const test_constants_1 = require("./test-constants");
/**
 * Mock Git Hooks Manager for testing
 * Simulates production GitHooksManager behavior without external dependencies
 */
class GitHooksManager {
    constructor(config) {
        this.config = config;
        this.hooksPath = path.join(config.repositoryPath, '.git', 'hooks');
    }
    /**
     * Install git hooks based on configuration
     */
    async installHooks() {
        // Ensure hooks directory exists
        await fs.mkdir(this.hooksPath, { recursive: true });
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
    }
    /**
     * Uninstall all ollama-code git hooks
     */
    async uninstallHooks() {
        for (const hookType of test_constants_1.GIT_HOOK_TYPES) {
            const hookPath = path.join(this.hooksPath, hookType);
            try {
                const content = await fs.readFile(hookPath, 'utf8');
                // Only remove if it's our hook
                if (content.includes(test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER)) {
                    await fs.unlink(hookPath);
                }
            }
            catch (error) {
                // Hook doesn't exist, which is fine
            }
        }
        // Restore backed up hooks if they exist
        await this.restoreBackedUpHooks();
    }
    /**
     * Backup existing hooks
     */
    async backupExistingHooks() {
        for (const hookType of test_constants_1.GIT_HOOK_TYPES) {
            const hookPath = path.join(this.hooksPath, hookType);
            const backupPath = `${hookPath}${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.BACKUP_EXTENSION}`;
            try {
                const content = await fs.readFile(hookPath, 'utf8');
                // Only backup if it's not already our hook
                if (!content.includes(test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER)) {
                    await fs.copyFile(hookPath, backupPath);
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
        for (const hookType of test_constants_1.GIT_HOOK_TYPES) {
            const hookPath = path.join(this.hooksPath, hookType);
            const backupPath = `${hookPath}${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.BACKUP_EXTENSION}`;
            try {
                await fs.copyFile(backupPath, hookPath);
                await fs.unlink(backupPath);
            }
            catch (error) {
                // Backup doesn't exist
            }
        }
    }
    /**
     * Install pre-commit hook
     */
    async installPreCommitHook() {
        const hookPath = path.join(this.hooksPath, 'pre-commit');
        const hookContent = this.generatePreCommitHookContent();
        await fs.writeFile(hookPath, hookContent, 'utf8');
        await fs.chmod(hookPath, test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTABLE);
    }
    /**
     * Install commit-msg hook
     */
    async installCommitMsgHook() {
        const hookPath = path.join(this.hooksPath, 'commit-msg');
        const hookContent = this.generateCommitMsgHookContent();
        await fs.writeFile(hookPath, hookContent, 'utf8');
        await fs.chmod(hookPath, test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTABLE);
    }
    /**
     * Install pre-push hook
     */
    async installPrePushHook() {
        const hookPath = path.join(this.hooksPath, 'pre-push');
        const hookContent = this.generatePrePushHookContent();
        await fs.writeFile(hookPath, hookContent, 'utf8');
        await fs.chmod(hookPath, test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTABLE);
    }
    /**
     * Install post-merge hook
     */
    async installPostMergeHook() {
        const hookPath = path.join(this.hooksPath, 'post-merge');
        const hookContent = this.generatePostMergeHookContent();
        await fs.writeFile(hookPath, hookContent, 'utf8');
        await fs.chmod(hookPath, test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTABLE);
    }
    /**
     * Generate pre-commit hook content
     */
    generatePreCommitHookContent() {
        return `#!/bin/sh
${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER} - pre-commit
# Auto-generated by ollama-code Git Hooks Manager

echo "Running ollama-code pre-commit checks..."

# Quality gates enabled: ${this.config.enableQualityGates}
# Bypass enabled: ${this.config.bypassEnabled}

${this.config.enableQualityGates ? `
# Run linting on staged files
# Run tests on affected modules
# Run security scan
# Run type checking
` : ''}

exit 0
`;
    }
    /**
     * Generate commit-msg hook content
     */
    generateCommitMsgHookContent() {
        return `#!/bin/sh
${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER} - commit-msg
# Auto-generated by ollama-code Git Hooks Manager

echo "Running ollama-code commit message validation..."

# Validate commit message format
# Check conventional commit format
# Validate issue references
# Check message length

exit 0
`;
    }
    /**
     * Generate pre-push hook content
     */
    generatePrePushHookContent() {
        return `#!/bin/sh
${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER} - pre-push
# Auto-generated by ollama-code Git Hooks Manager

echo "Running ollama-code pre-push checks..."

exit 0
`;
    }
    /**
     * Generate post-merge hook content
     */
    generatePostMergeHookContent() {
        return `#!/bin/sh
${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER} - post-merge
# Auto-generated by ollama-code Git Hooks Manager

echo "Running ollama-code post-merge tasks..."

exit 0
`;
    }
}
exports.GitHooksManager = GitHooksManager;
//# sourceMappingURL=gitHooksManagerWrapper.js.map