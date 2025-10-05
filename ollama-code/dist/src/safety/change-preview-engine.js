/**
 * Change Preview Engine
 *
 * Phase 2.3: Visual diff and change preview system for file operations
 */
import { normalizeError } from '../utils/error-utils.js';
import * as path from 'path';
import { logger } from '../utils/logger.js';
import { detectFileLanguage } from '../utils/file-operation-helpers.js';
import { PREVIEW_LIMITS } from './safety-constants.js';
export class ChangePreviewEngine {
    maxPreviewLines = PREVIEW_LIMITS.MAX_PREVIEW_LINES;
    contextLines = PREVIEW_LIMITS.CONTEXT_LINES;
    /**
     * Generate comprehensive change preview
     */
    async generatePreview(operation, changes) {
        logger.debug(`Generating change preview for ${changes.length} files`);
        try {
            // Generate file diffs
            const diffs = await this.generateFileDiffs(changes);
            // Create summary
            const summary = this.createChangeSummary(diffs);
            // Generate visual diff
            const visualDiff = this.createVisualDiff(diffs);
            // Analyze affected dependencies
            const affectedDependencies = await this.analyzeAffectedDependencies(changes);
            // Identify potential issues
            const potentialIssues = await this.identifyPotentialIssues(changes, diffs);
            // Generate recommendations
            const recommendations = this.generateRecommendations(diffs, potentialIssues);
            return {
                summary,
                diffs,
                visualDiff,
                affectedDependencies,
                potentialIssues,
                recommendations
            };
        }
        catch (error) {
            logger.error('Change preview generation failed:', error);
            throw new Error(`Failed to generate change preview: ${normalizeError(error).message}`);
        }
    }
    /**
     * Generate file diffs for all changes
     */
    async generateFileDiffs(changes) {
        const diffs = [];
        for (const change of changes) {
            try {
                const diff = await this.generateSingleFileDiff(change);
                diffs.push(diff);
            }
            catch (error) {
                logger.warn(`Failed to generate diff for ${change.filePath}:`, error);
                // Create placeholder diff
                diffs.push(this.createPlaceholderDiff(change));
            }
        }
        return diffs;
    }
    /**
     * Generate diff for a single file
     */
    async generateSingleFileDiff(change) {
        const { filePath, originalContent, newContent, operation } = change;
        const language = detectFileLanguage(filePath);
        const isBinary = this.isBinaryFile(filePath);
        if (isBinary) {
            return {
                filePath,
                changeType: this.operationToChangeType(operation),
                additions: 0,
                deletions: 0,
                diff: '[Binary file]',
                language,
                isBinary: true,
                preview: `${operation} binary file: ${path.basename(filePath)}`
            };
        }
        switch (operation) {
            case 'create':
                return this.generateCreateDiff(filePath, newContent, language);
            case 'modify':
                if (!originalContent) {
                    throw new Error(`Original content required for modify operation on ${filePath}`);
                }
                return this.generateModifyDiff(filePath, originalContent, newContent, language);
            case 'delete':
                return this.generateDeleteDiff(filePath, originalContent || '', language);
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }
    /**
     * Generate diff for file creation
     */
    generateCreateDiff(filePath, content, language) {
        const lines = content.split('\n');
        const additions = lines.length;
        const diff = this.formatUnifiedDiff('', content, filePath, 'new file');
        const preview = this.createPreview(lines.slice(0, this.maxPreviewLines));
        return {
            filePath,
            changeType: 'added',
            additions,
            deletions: 0,
            diff,
            language,
            isBinary: false,
            preview
        };
    }
    /**
     * Generate diff for file modification
     */
    generateModifyDiff(filePath, originalContent, newContent, language) {
        const originalLines = originalContent.split('\n');
        const newLines = newContent.split('\n');
        const { additions, deletions, diff } = this.computeUnifiedDiff(originalLines, newLines, filePath);
        const preview = this.createModificationPreview(originalLines, newLines);
        return {
            filePath,
            changeType: 'modified',
            additions,
            deletions,
            diff,
            language,
            isBinary: false,
            preview
        };
    }
    /**
     * Generate diff for file deletion
     */
    generateDeleteDiff(filePath, content, language) {
        const lines = content.split('\n');
        const deletions = lines.length;
        const diff = this.formatUnifiedDiff(content, '', filePath, 'deleted file');
        const preview = this.createPreview(lines.slice(0, this.maxPreviewLines), true);
        return {
            filePath,
            changeType: 'deleted',
            additions: 0,
            deletions,
            diff,
            language,
            isBinary: false,
            preview
        };
    }
    /**
     * Compute unified diff between two sets of lines
     */
    computeUnifiedDiff(originalLines, newLines, filePath) {
        // Simple line-by-line diff implementation
        const maxLines = Math.max(originalLines.length, newLines.length);
        const diffLines = [];
        let additions = 0;
        let deletions = 0;
        diffLines.push(`--- a/${filePath}`);
        diffLines.push(`+++ b/${filePath}`);
        // Find changed chunks
        let i = 0;
        while (i < maxLines) {
            const chunk = this.findChangedChunk(originalLines, newLines, i);
            if (chunk) {
                diffLines.push(`@@ -${chunk.originalStart + 1},${chunk.originalLength} +${chunk.newStart + 1},${chunk.newLength} @@`);
                // Add context before changes
                const contextStart = Math.max(0, chunk.originalStart - this.contextLines);
                for (let j = contextStart; j < chunk.originalStart; j++) {
                    if (originalLines[j] !== undefined) {
                        diffLines.push(` ${originalLines[j]}`);
                    }
                }
                // Add deleted lines
                for (let j = chunk.originalStart; j < chunk.originalStart + chunk.originalLength; j++) {
                    if (originalLines[j] !== undefined) {
                        diffLines.push(`-${originalLines[j]}`);
                        deletions++;
                    }
                }
                // Add added lines
                for (let j = chunk.newStart; j < chunk.newStart + chunk.newLength; j++) {
                    if (newLines[j] !== undefined) {
                        diffLines.push(`+${newLines[j]}`);
                        additions++;
                    }
                }
                // Add context after changes
                const contextEnd = Math.min(maxLines, chunk.originalStart + chunk.originalLength + this.contextLines);
                for (let j = chunk.originalStart + chunk.originalLength; j < contextEnd; j++) {
                    if (originalLines[j] !== undefined) {
                        diffLines.push(` ${originalLines[j]}`);
                    }
                }
                i = chunk.originalStart + chunk.originalLength;
            }
            else {
                i++;
            }
        }
        return {
            additions,
            deletions,
            diff: diffLines.join('\n')
        };
    }
    /**
     * Find a chunk of changed lines
     */
    findChangedChunk(originalLines, newLines, startIndex) {
        // Simple implementation - find continuous different sections
        let originalStart = startIndex;
        let newStart = startIndex;
        let originalLength = 0;
        let newLength = 0;
        while (originalStart < originalLines.length && newStart < newLines.length) {
            if (originalLines[originalStart] !== newLines[newStart]) {
                break;
            }
            originalStart++;
            newStart++;
        }
        if (originalStart >= originalLines.length && newStart >= newLines.length) {
            return null;
        }
        // Count different lines
        let origEnd = originalStart;
        let newEnd = newStart;
        while (origEnd < originalLines.length || newEnd < newLines.length) {
            if (origEnd < originalLines.length && newEnd < newLines.length &&
                originalLines[origEnd] === newLines[newEnd]) {
                break;
            }
            if (origEnd < originalLines.length)
                origEnd++;
            if (newEnd < newLines.length)
                newEnd++;
        }
        originalLength = origEnd - originalStart;
        newLength = newEnd - newStart;
        if (originalLength === 0 && newLength === 0) {
            return null;
        }
        return { originalStart, originalLength, newStart, newLength };
    }
    /**
     * Format unified diff
     */
    formatUnifiedDiff(originalContent, newContent, filePath, operation) {
        const lines = [`--- a/${filePath}`, `+++ b/${filePath}`, `@@ ${operation} @@`];
        if (originalContent) {
            originalContent.split('\n').forEach(line => lines.push(`-${line}`));
        }
        if (newContent) {
            newContent.split('\n').forEach(line => lines.push(`+${line}`));
        }
        return lines.join('\n');
    }
    /**
     * Create preview text
     */
    createPreview(lines, isDeletion = false) {
        const prefix = isDeletion ? 'Deleted content: ' : 'Content: ';
        const truncated = lines.length > this.maxPreviewLines;
        const previewLines = lines.slice(0, this.maxPreviewLines);
        let preview = prefix + previewLines.join('\n');
        if (truncated) {
            preview += `\n... (${lines.length - this.maxPreviewLines} more lines)`;
        }
        return preview;
    }
    /**
     * Create preview for modifications
     */
    createModificationPreview(originalLines, newLines) {
        const maxPreview = Math.min(this.maxPreviewLines, Math.max(originalLines.length, newLines.length));
        const changes = [];
        for (let i = 0; i < maxPreview; i++) {
            const original = originalLines[i];
            const modified = newLines[i];
            if (original !== modified) {
                if (original !== undefined) {
                    changes.push(`- ${original}`);
                }
                if (modified !== undefined) {
                    changes.push(`+ ${modified}`);
                }
            }
        }
        return changes.slice(0, 20).join('\n') + (changes.length > 20 ? '\n... (more changes)' : '');
    }
    /**
     * Create change summary
     */
    createChangeSummary(diffs) {
        const summary = {
            totalFiles: diffs.length,
            addedLines: 0,
            removedLines: 0,
            modifiedLines: 0,
            newFiles: 0,
            deletedFiles: 0,
            binaryFiles: 0
        };
        for (const diff of diffs) {
            summary.addedLines += diff.additions;
            summary.removedLines += diff.deletions;
            summary.modifiedLines += Math.min(diff.additions, diff.deletions);
            if (diff.isBinary) {
                summary.binaryFiles++;
            }
            switch (diff.changeType) {
                case 'added':
                    summary.newFiles++;
                    break;
                case 'deleted':
                    summary.deletedFiles++;
                    break;
            }
        }
        return summary;
    }
    /**
     * Create visual diff representation
     */
    createVisualDiff(diffs) {
        const sections = [];
        for (const diff of diffs) {
            sections.push(`\n📁 ${diff.filePath} (${diff.changeType})`);
            sections.push(`   +${diff.additions} -${diff.deletions} lines`);
            if (diff.preview && !diff.isBinary) {
                const previewLines = diff.preview.split('\n').slice(0, 5);
                sections.push('   Preview:');
                previewLines.forEach(line => sections.push(`   ${line}`));
                if (diff.preview.split('\n').length > 5) {
                    sections.push('   ...');
                }
            }
        }
        return sections.join('\n');
    }
    /**
     * Analyze affected dependencies
     */
    async analyzeAffectedDependencies(changes) {
        const dependencies = new Set();
        for (const change of changes) {
            // Check for dependency file changes
            if (this.isDependencyFile(change.filePath)) {
                dependencies.add(path.basename(change.filePath));
            }
            // Analyze import/require statements in code files
            if (change.operation !== 'delete' && this.isCodeFile(change.filePath)) {
                const importedDeps = this.extractImportedDependencies(change.newContent);
                importedDeps.forEach(dep => dependencies.add(dep));
            }
        }
        return Array.from(dependencies);
    }
    /**
     * Identify potential issues with the changes
     */
    async identifyPotentialIssues(changes, diffs) {
        const issues = [];
        for (const change of changes) {
            // Check for syntax issues
            if (change.operation !== 'delete' && this.isCodeFile(change.filePath)) {
                const syntaxIssues = this.checkSyntaxIssues(change.newContent, change.filePath);
                issues.push(...syntaxIssues);
            }
            // Check for breaking changes
            if (change.operation === 'modify' && change.originalContent) {
                const breakingChanges = this.checkBreakingChanges(change.originalContent, change.newContent, change.filePath);
                issues.push(...breakingChanges);
            }
            // Check for security concerns
            const securityIssues = this.checkSecurityConcerns(change.newContent, change.filePath);
            issues.push(...securityIssues);
        }
        return issues;
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(diffs, issues) {
        const recommendations = [];
        // General recommendations
        recommendations.push('Review all changes carefully before applying');
        recommendations.push('Ensure you have a backup of modified files');
        // Based on file types
        const hasConfigFiles = diffs.some(d => this.isConfigFile(d.filePath));
        if (hasConfigFiles) {
            recommendations.push('Test configuration changes in development environment');
        }
        const hasCodeFiles = diffs.some(d => this.isCodeFile(d.filePath));
        if (hasCodeFiles) {
            recommendations.push('Run tests after applying code changes');
        }
        const hasDependencyFiles = diffs.some(d => this.isDependencyFile(d.filePath));
        if (hasDependencyFiles) {
            recommendations.push('Reinstall dependencies after applying changes');
        }
        // Based on issues
        const hasErrors = issues.some(i => i.severity === 'error');
        if (hasErrors) {
            recommendations.push('Fix identified errors before proceeding');
        }
        const hasWarnings = issues.some(i => i.severity === 'warning');
        if (hasWarnings) {
            recommendations.push('Review and address warnings');
        }
        // Large changes
        const totalChanges = diffs.reduce((sum, d) => sum + d.additions + d.deletions, 0);
        if (totalChanges > 100) {
            recommendations.push('Consider applying changes in smaller batches');
        }
        return recommendations;
    }
    /**
     * Helper methods
     */
    operationToChangeType(operation) {
        switch (operation) {
            case 'create': return 'added';
            case 'modify': return 'modified';
            case 'delete': return 'deleted';
            default: return 'modified';
        }
    }
    isBinaryFile(filePath) {
        const binaryExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx',
            '.zip', '.tar', '.gz', '.rar',
            '.exe', '.dll', '.so', '.dylib',
            '.wasm', '.bin'
        ];
        const ext = path.extname(filePath).toLowerCase();
        return binaryExtensions.includes(ext);
    }
    isCodeFile(filePath) {
        const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs'];
        const ext = path.extname(filePath).toLowerCase();
        return codeExtensions.includes(ext);
    }
    isConfigFile(filePath) {
        const configPatterns = [/config/i, /\.env/i, /settings/i];
        return configPatterns.some(pattern => pattern.test(filePath));
    }
    isDependencyFile(filePath) {
        const dependencyFiles = ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod'];
        const fileName = path.basename(filePath);
        return dependencyFiles.includes(fileName);
    }
    extractImportedDependencies(content) {
        const deps = [];
        const importRegex = /(?:import|require|from)\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const dep = match[1];
            if (!dep.startsWith('.') && !dep.startsWith('/')) {
                deps.push(dep.split('/')[0]); // Get package name
            }
        }
        return deps;
    }
    checkSyntaxIssues(content, filePath) {
        // Basic syntax checking - could be enhanced with actual parsers
        const issues = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for unmatched brackets
            const openBrackets = (line.match(/[{[(]/g) || []).length;
            const closeBrackets = (line.match(/[}\])]/g) || []).length;
            if (Math.abs(openBrackets - closeBrackets) > 2) {
                issues.push({
                    type: 'syntax_error',
                    severity: 'warning',
                    description: 'Possible unmatched brackets',
                    file: filePath,
                    line: i + 1,
                    suggestion: 'Check bracket matching'
                });
            }
        }
        return issues;
    }
    checkBreakingChanges(originalContent, newContent, filePath) {
        const issues = [];
        // Check for removed exports (simplified)
        const originalExports = this.extractExports(originalContent);
        const newExports = this.extractExports(newContent);
        for (const exportName of originalExports) {
            if (!newExports.includes(exportName)) {
                issues.push({
                    type: 'breaking_change',
                    severity: 'warning',
                    description: `Removed export: ${exportName}`,
                    file: filePath,
                    suggestion: 'Ensure removed exports are not used elsewhere'
                });
            }
        }
        return issues;
    }
    checkSecurityConcerns(content, filePath) {
        const issues = [];
        const securityPatterns = [
            { pattern: /password\s*=\s*['"][^'"]+['"]/i, message: 'Hardcoded password detected' },
            { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/i, message: 'Hardcoded API key detected' },
            { pattern: /eval\s*\(/i, message: 'Use of eval() function' },
            { pattern: /innerHTML\s*=/i, message: 'Potential XSS vulnerability with innerHTML' }
        ];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { pattern, message } of securityPatterns) {
                if (pattern.test(line)) {
                    issues.push({
                        type: 'security_risk',
                        severity: 'warning',
                        description: message,
                        file: filePath,
                        line: i + 1,
                        suggestion: 'Review for security implications'
                    });
                }
            }
        }
        return issues;
    }
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }
    createPlaceholderDiff(change) {
        return {
            filePath: change.filePath,
            changeType: this.operationToChangeType(change.operation),
            additions: 0,
            deletions: 0,
            diff: '[Diff generation failed]',
            language: detectFileLanguage(change.filePath),
            isBinary: false,
            preview: `${change.operation} ${path.basename(change.filePath)}`
        };
    }
}
//# sourceMappingURL=change-preview-engine.js.map