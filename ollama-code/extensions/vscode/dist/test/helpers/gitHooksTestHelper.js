"use strict";
/**
 * Git Hooks Test Helper
 * Utilities for testing Git hooks management and VCS intelligence
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
exports.createTestGitRepo = createTestGitRepo;
exports.hookExists = hookExists;
exports.readHookContent = readHookContent;
exports.isHookExecutable = isHookExecutable;
exports.createFile = createFile;
exports.stageFile = stageFile;
exports.getStagedFiles = getStagedFiles;
exports.commit = commit;
exports.getLastCommitMessage = getLastCommitMessage;
exports.getStagedDiff = getStagedDiff;
exports.isGitRepository = isGitRepository;
exports.backupHook = backupHook;
exports.restoreHook = restoreHook;
exports.hookBackupExists = hookBackupExists;
exports.writeCustomHook = writeCustomHook;
exports.removeHook = removeHook;
exports.measureHookExecutionTime = measureHookExecutionTime;
exports.createFileWithLintErrors = createFileWithLintErrors;
exports.createFileWithTypeErrors = createFileWithTypeErrors;
exports.createMultipleFiles = createMultipleFiles;
exports.simulateRapidCommits = simulateRapidCommits;
exports.isOllamaCodeHook = isOllamaCodeHook;
exports.getHookPermissions = getHookPermissions;
exports.createAndStageFile = createAndStageFile;
exports.withGitRepo = withGitRepo;
exports.createGitHooksConfig = createGitHooksConfig;
exports.createCommitMessageConfig = createCommitMessageConfig;
exports.assertValidCommitMessage = assertValidCommitMessage;
exports.assertConventionalFormat = assertConventionalFormat;
exports.assertEmojiFormat = assertEmojiFormat;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const test_constants_1 = require("./test-constants");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Create a temporary Git repository for testing
 */
async function createTestGitRepo(name = 'test-repo') {
    const repoPath = path.join(__dirname, '../../../', test_constants_1.GIT_HOOKS_TEST_CONSTANTS.TEST_REPOS_DIR, name);
    // Clean up if exists
    try {
        await fs.rm(repoPath, { recursive: true, force: true });
    }
    catch {
        // Ignore if doesn't exist
    }
    // Create directory
    await fs.mkdir(repoPath, { recursive: true });
    // Initialize git repo
    await execAsync('git init', { cwd: repoPath });
    await execAsync(`git config user.email "${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.TEST_GIT_EMAIL}"`, { cwd: repoPath });
    await execAsync(`git config user.name "${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.TEST_GIT_NAME}"`, { cwd: repoPath });
    // Create initial commit
    await fs.writeFile(path.join(repoPath, 'README.md'), '# Test Repository');
    await execAsync('git add README.md', { cwd: repoPath });
    await execAsync('git commit -m "Initial commit"', { cwd: repoPath });
    return {
        path: repoPath,
        cleanup: async () => {
            await fs.rm(repoPath, { recursive: true, force: true });
        },
    };
}
/**
 * Check if a Git hook exists
 */
async function hookExists(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    try {
        await fs.access(hookPath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Read Git hook content
 */
async function readHookContent(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    return await fs.readFile(hookPath, 'utf8');
}
/**
 * Check if a Git hook is executable
 */
async function isHookExecutable(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    try {
        const stats = await fs.stat(hookPath);
        // Check if file has execute permission (owner, group, or other)
        return (stats.mode & test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTE_BIT) !== 0;
    }
    catch {
        return false;
    }
}
/**
 * Create a file in the Git repository
 */
async function createFile(repoPath, filePath, content) {
    const fullPath = path.join(repoPath, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
}
/**
 * Stage a file in Git
 */
async function stageFile(repoPath, filePath) {
    await execAsync(`git add "${filePath}"`, { cwd: repoPath });
}
/**
 * Get list of staged files
 */
async function getStagedFiles(repoPath) {
    try {
        const { stdout } = await execAsync('git diff --cached --name-only', { cwd: repoPath });
        return stdout.trim().split('\n').filter(Boolean);
    }
    catch {
        return [];
    }
}
/**
 * Commit changes
 */
async function commit(repoPath, options = {}) {
    const { message = 'Test commit', allowEmpty = false, noVerify = false, } = options;
    const args = ['commit', '-m', `"${message}"`];
    if (allowEmpty)
        args.push('--allow-empty');
    if (noVerify)
        args.push('--no-verify');
    try {
        const { stdout, stderr } = await execAsync(`git ${args.join(' ')}`, { cwd: repoPath });
        return {
            success: true,
            output: stdout + stderr,
            exitCode: 0,
        };
    }
    catch (error) {
        return {
            success: false,
            output: error.stdout + error.stderr,
            exitCode: error.code || 1,
        };
    }
}
/**
 * Get last commit message
 */
async function getLastCommitMessage(repoPath) {
    const { stdout } = await execAsync('git log -1 --pretty=%B', { cwd: repoPath });
    return stdout.trim();
}
/**
 * Get Git diff for staged files
 */
async function getStagedDiff(repoPath) {
    const { stdout } = await execAsync('git diff --cached', { cwd: repoPath });
    return stdout;
}
/**
 * Check if repository is a Git repository
 */
async function isGitRepository(repoPath) {
    try {
        await execAsync('git rev-parse --git-dir', { cwd: repoPath });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Backup a hook file
 */
async function backupHook(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    const backupPath = `${hookPath}${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.BACKUP_EXTENSION}`;
    try {
        await fs.copyFile(hookPath, backupPath);
    }
    catch {
        // Hook doesn't exist, which is fine
    }
}
/**
 * Restore a backed up hook
 */
async function restoreHook(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    const backupPath = `${hookPath}${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.BACKUP_EXTENSION}`;
    try {
        await fs.copyFile(backupPath, hookPath);
        await fs.unlink(backupPath);
    }
    catch {
        // Backup doesn't exist
    }
}
/**
 * Check if hook backup exists
 */
async function hookBackupExists(repoPath, hookName) {
    const backupPath = path.join(repoPath, '.git', 'hooks', `${hookName}${test_constants_1.GIT_HOOKS_TEST_CONSTANTS.BACKUP_EXTENSION}`);
    try {
        await fs.access(backupPath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Write a custom hook script
 */
async function writeCustomHook(repoPath, hookName, content) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    await fs.writeFile(hookPath, content, 'utf8');
    await fs.chmod(hookPath, test_constants_1.GIT_HOOKS_FILE_PERMISSIONS.EXECUTABLE);
}
/**
 * Remove a hook
 */
async function removeHook(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    try {
        await fs.unlink(hookPath);
    }
    catch {
        // Hook doesn't exist
    }
}
/**
 * Get hook execution time (mock for testing)
 */
async function measureHookExecutionTime(repoPath, hookName, action) {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
}
/**
 * Create a file with linting errors
 */
async function createFileWithLintErrors(repoPath, filePath) {
    const content = `
// Missing semicolons, var usage, etc.
var x = 1
var y = 2
function test() {
  console.log(x)
  console.log(y)
}
`;
    await createFile(repoPath, filePath, content);
}
/**
 * Create a file with TypeScript errors
 */
async function createFileWithTypeErrors(repoPath, filePath) {
    const content = `
// TypeScript errors
function add(a: number, b: number): number {
  return a + b;
}

const result: number = add("1", "2"); // Type error
const missing: string = undefined; // Type error
`;
    await createFile(repoPath, filePath, content);
}
/**
 * Create multiple files with changes
 */
async function createMultipleFiles(repoPath, count = 5) {
    const files = [];
    for (let i = 0; i < count; i++) {
        const filePath = `file${i}.js`;
        await createFile(repoPath, filePath, `// File ${i}\nconsole.log('Hello ${i}');\n`);
        files.push(filePath);
    }
    return files;
}
/**
 * Simulate rapid reconnection attempts
 */
async function simulateRapidCommits(repoPath, count = 5) {
    const results = [];
    for (let i = 0; i < count; i++) {
        await createFile(repoPath, `rapid-${i}.txt`, `Content ${i}`);
        await stageFile(repoPath, `rapid-${i}.txt`);
        const result = await commit(repoPath, { message: `Rapid commit ${i}` });
        results.push(result.success);
    }
    return results;
}
/**
 * Check if hook contains ollama-code marker
 */
async function isOllamaCodeHook(repoPath, hookName) {
    try {
        const content = await readHookContent(repoPath, hookName);
        return content.includes(test_constants_1.GIT_HOOKS_TEST_CONSTANTS.HOOK_MARKER) || content.includes('ollama-code');
    }
    catch {
        return false;
    }
}
/**
 * Get hook file permissions
 */
async function getHookPermissions(repoPath, hookName) {
    const hookPath = path.join(repoPath, '.git', 'hooks', hookName);
    const stats = await fs.stat(hookPath);
    return (stats.mode & parseInt('777', 8)).toString(8);
}
/**
 * Create and stage a file in one operation
 */
async function createAndStageFile(repoPath, filePath, content) {
    await createFile(repoPath, filePath, content);
    await stageFile(repoPath, filePath);
}
/**
 * Test wrapper that creates a git repo, runs test function, and cleans up
 */
async function withGitRepo(name, testFn) {
    const repo = await createTestGitRepo(name);
    try {
        return await testFn(repo.path);
    }
    finally {
        await repo.cleanup();
    }
}
/**
 * Create a Git Hooks configuration with sensible defaults
 * Reduces code duplication by providing a base config that can be overridden
 */
function createGitHooksConfig(repoPath, overrides = {}) {
    return {
        repositoryPath: repoPath,
        enablePreCommit: false,
        enableCommitMsg: false,
        enablePrePush: false,
        enablePostMerge: false,
        enableQualityGates: false,
        bypassEnabled: false,
        analysisTimeout: test_constants_1.GIT_HOOKS_TEST_CONSTANTS.DEFAULT_ANALYSIS_TIMEOUT,
        failOnAnalysisError: false,
        backupExistingHooks: false,
        ...overrides,
    };
}
/**
 * Create a Commit Message configuration with sensible defaults
 * Reduces code duplication by providing a base config that can be overridden
 */
function createCommitMessageConfig(repositoryPath, overrides = {}) {
    return {
        repositoryPath,
        style: 'conventional',
        maxLength: test_constants_1.COMMIT_MESSAGE_TEST_CONSTANTS.DEFAULT_MAX_LENGTH,
        includeScope: false,
        includeBody: false,
        includeFooter: false,
        ...overrides,
    };
}
/**
 * Assert that a generated commit message is valid
 */
function assertValidCommitMessage(result, config) {
    const assert = require('assert');
    assert.ok(result.message, 'Should generate message');
    assert.ok(result.message.length > 0, 'Message should not be empty');
    if (config.maxLength) {
        const firstLine = result.message.split('\n')[0];
        assert.ok(firstLine.length <= config.maxLength, `First line should be <= ${config.maxLength} chars, got ${firstLine.length}`);
    }
    assert.ok(result.confidence >= 0 && result.confidence <= 1, 'Confidence should be between 0 and 1');
}
/**
 * Assert that a message matches conventional commit format
 */
function assertConventionalFormat(message) {
    const assert = require('assert');
    const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|wip)(\([a-z-]+\))?: .+/;
    assert.ok(pattern.test(message), 'Should match conventional commit format');
}
/**
 * Assert that a message starts with an emoji
 */
function assertEmojiFormat(message) {
    const assert = require('assert');
    const emojiPattern = /^[\u{1F300}-\u{1F9FF}]/u;
    assert.ok(emojiPattern.test(message), 'Should start with emoji');
    assert.ok(message.length > 2, 'Should have text after emoji');
}
//# sourceMappingURL=gitHooksTestHelper.js.map