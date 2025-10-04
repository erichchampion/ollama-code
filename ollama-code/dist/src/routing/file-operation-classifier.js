/**
 * File Operation Classifier
 *
 * Phase 2.2: Enhanced Natural Language Router
 * Classifies user intent for file operations and targets specific files
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger.js';
import { FILE_OPERATION_CONSTANTS } from '../constants/file-operations.js';
import { detectFileLanguage, isProgrammingLanguage, isFramework } from '../utils/file-operation-helpers.js';
export class FileOperationClassifier {
    workingDirectory;
    projectFiles = [];
    fileStats = new Map();
    constructor(workingDirectory) {
        this.workingDirectory = workingDirectory;
    }
    /**
     * Initialize classifier with project context
     */
    async initialize() {
        try {
            await this.scanProjectFiles();
            logger.debug(`FileOperationClassifier initialized with ${this.projectFiles.length} files`);
        }
        catch (error) {
            logger.warn('Failed to initialize file operation classifier:', error);
        }
    }
    /**
     * Classify user intent for file operations
     */
    async classifyFileOperation(intent, context) {
        try {
            // Check if this is a file operation intent
            if (!this.isFileOperationIntent(intent)) {
                return null;
            }
            // Extract operation type
            const operation = this.extractOperationType(intent);
            if (!operation) {
                return null;
            }
            // Classify and target files
            const classificationResult = await this.classifyFileTargets(intent, context);
            // Assess safety and impact
            const safetyLevel = this.assessSafetyLevel(operation, classificationResult.targets);
            const estimatedImpact = this.assessImpact(operation, classificationResult.targets);
            // Determine dependencies
            const dependencies = await this.findDependencies(classificationResult.targets);
            return {
                operation,
                targets: classificationResult.targets,
                content: this.extractContentSpec(intent),
                safetyLevel,
                requiresApproval: this.shouldRequireApproval(safetyLevel, estimatedImpact),
                estimatedImpact,
                dependencies,
                backupRequired: this.shouldCreateBackup(operation, safetyLevel)
            };
        }
        catch (error) {
            logger.error('Failed to classify file operation:', error);
            return null;
        }
    }
    /**
     * Check if intent represents a file operation
     */
    isFileOperationIntent(intent) {
        const action = intent.action.toLowerCase();
        return FILE_OPERATION_CONSTANTS.FILE_OPERATION_KEYWORDS.some(keyword => action.includes(keyword)) ||
            intent.entities.files.length > 0 ||
            intent.type === 'task_request';
    }
    /**
     * Extract operation type from intent
     */
    extractOperationType(intent) {
        const action = intent.action.toLowerCase();
        if (action.includes('create') || action.includes('make') || action.includes('generate') || action.includes('build')) {
            return 'create';
        }
        if (action.includes('edit') || action.includes('modify') || action.includes('change') || action.includes('update') || action.includes('fix')) {
            return 'edit';
        }
        if (action.includes('delete') || action.includes('remove') || action.includes('drop')) {
            return 'delete';
        }
        if (action.includes('move') || action.includes('rename') || action.includes('relocate')) {
            return 'move';
        }
        if (action.includes('copy') || action.includes('duplicate')) {
            return 'copy';
        }
        if (action.includes('refactor') || action.includes('restructure')) {
            return 'refactor';
        }
        if (action.includes('test') || action.includes('spec')) {
            return 'test';
        }
        // Default to edit for general task requests
        if (intent.type === 'task_request') {
            return 'edit';
        }
        return null;
    }
    /**
     * Classify and target specific files based on intent
     */
    async classifyFileTargets(intent, context) {
        const targets = [];
        const ambiguousTargets = [];
        const suggestions = [];
        // Process explicitly mentioned files
        for (const filePath of intent.entities.files) {
            const target = await this.createFileTarget(filePath, 1.0, 'Explicitly mentioned in request');
            if (target) {
                targets.push(target);
            }
        }
        // If no explicit files, use context-aware targeting
        if (targets.length === 0) {
            const contextTargets = await this.findContextualTargets(intent, context);
            targets.push(...contextTargets.targets);
            ambiguousTargets.push(...contextTargets.ambiguous);
            suggestions.push(...contextTargets.suggestions);
        }
        // Calculate overall confidence
        const confidence = targets.length > 0
            ? targets.reduce((sum, t) => sum + t.confidence, 0) / targets.length
            : 0;
        return {
            targets,
            confidence,
            ambiguousTargets,
            suggestions
        };
    }
    /**
     * Find files based on context when not explicitly mentioned
     */
    async findContextualTargets(intent, context) {
        const targets = [];
        const ambiguous = [];
        const suggestions = [];
        // Look for patterns in the intent
        const patterns = this.extractFilePatterns(intent);
        for (const pattern of patterns) {
            const matches = await this.findFilesByPattern(pattern, context);
            if (matches.length === 1) {
                targets.push(matches[0]);
            }
            else if (matches.length > 1) {
                ambiguous.push(...matches);
                suggestions.push(`Multiple files match "${pattern}": ${matches.map(m => m.path).join(', ')}`);
            }
        }
        // Use recent files if no patterns found
        if (targets.length === 0 && ambiguous.length === 0 && context.recentFiles?.length > 0) {
            for (const recentFile of context.recentFiles.slice(0, FILE_OPERATION_CONSTANTS.RECENT_FILES_LIMIT)) {
                const target = await this.createFileTarget(recentFile, FILE_OPERATION_CONSTANTS.RECENT_FILE_CONFIDENCE, 'Recently modified file');
                if (target) {
                    ambiguous.push(target);
                }
            }
            suggestions.push('Consider specifying the exact file you want to work with');
        }
        return { targets, ambiguous, suggestions };
    }
    /**
     * Extract file patterns from intent
     */
    extractFilePatterns(intent) {
        const patterns = [];
        const action = intent.action.toLowerCase();
        // Look for technology/framework mentions that suggest file types
        for (const tech of intent.entities.technologies) {
            const techLower = tech.toLowerCase();
            if (techLower.includes('react')) {
                patterns.push('*.tsx', '*.jsx', '*component*');
            }
            else if (techLower.includes('typescript')) {
                patterns.push('*.ts', '*.tsx');
            }
            else if (techLower.includes('javascript')) {
                patterns.push('*.js', '*.jsx');
            }
            else if (techLower.includes('python')) {
                patterns.push('*.py');
            }
            else if (techLower.includes('java')) {
                patterns.push('*.java');
            }
        }
        // Look for function/class names
        for (const func of intent.entities.functions) {
            patterns.push(`*${func}*`);
        }
        for (const cls of intent.entities.classes) {
            patterns.push(`*${cls}*`);
        }
        // Look for concept-based patterns
        for (const concept of intent.entities.concepts) {
            patterns.push(`*${concept.toLowerCase()}*`);
        }
        return patterns;
    }
    /**
     * Find files matching a pattern
     */
    async findFilesByPattern(pattern, context) {
        const matches = [];
        for (const filePath of context.projectFiles) {
            if (this.matchesPattern(filePath, pattern)) {
                const target = await this.createFileTarget(filePath, FILE_OPERATION_CONSTANTS.PATTERN_MATCH_CONFIDENCE, `Matches pattern: ${pattern}`);
                if (target) {
                    matches.push(target);
                }
            }
        }
        return matches;
    }
    /**
     * Check if file matches pattern
     */
    matchesPattern(filePath, pattern) {
        const fileName = path.basename(filePath).toLowerCase();
        const patternLower = pattern.toLowerCase();
        if (pattern.includes('*')) {
            const regex = new RegExp(patternLower.replace(/\*/g, '.*'));
            return regex.test(fileName);
        }
        return fileName.includes(patternLower);
    }
    /**
     * Create a file target object
     */
    async createFileTarget(filePath, confidence, reason) {
        try {
            // Resolve relative paths
            const resolvedPath = path.isAbsolute(filePath)
                ? filePath
                : path.resolve(this.workingDirectory, filePath);
            let exists = false;
            let size;
            let lastModified;
            try {
                const stats = await fs.stat(resolvedPath);
                exists = true;
                size = stats.size;
                lastModified = stats.mtime;
                this.fileStats.set(resolvedPath, stats);
            }
            catch {
                // File doesn't exist - that's okay for create operations
            }
            const language = detectFileLanguage(resolvedPath);
            const type = exists ? (this.fileStats.get(resolvedPath)?.isDirectory() ? 'directory' : 'file') : 'file';
            return {
                path: resolvedPath,
                type,
                exists,
                size,
                lastModified,
                language,
                confidence,
                reason
            };
        }
        catch (error) {
            logger.debug(`Failed to create file target for ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Assess safety level of operation
     */
    assessSafetyLevel(operation, targets) {
        // Delete operations are inherently risky
        if (operation === 'delete') {
            return 'dangerous';
        }
        // Moving files can break imports/references
        if (operation === 'move') {
            return 'risky';
        }
        // Creating new files is generally safe
        if (operation === 'create') {
            return 'safe';
        }
        // Assess based on file characteristics
        let maxRisk = 'safe';
        for (const target of targets) {
            let fileRisk = 'safe';
            // Important system files
            if (this.isSystemFile(target.path)) {
                fileRisk = 'dangerous';
            }
            // Configuration files
            else if (this.isConfigFile(target.path)) {
                fileRisk = 'risky';
            }
            // Large files
            else if (target.size && target.size > FILE_OPERATION_CONSTANTS.LARGE_FILE_THRESHOLD) {
                fileRisk = 'cautious';
            }
            if (this.compareSafetyLevels(fileRisk, maxRisk) > 0) {
                maxRisk = fileRisk;
            }
        }
        return maxRisk;
    }
    /**
     * Check if file is a system file
     */
    isSystemFile(filePath) {
        const fileName = path.basename(filePath);
        return FILE_OPERATION_CONSTANTS.SYSTEM_FILES.includes(fileName) || fileName.startsWith('.');
    }
    /**
     * Check if file is a configuration file
     */
    isConfigFile(filePath) {
        return FILE_OPERATION_CONSTANTS.CONFIG_PATTERNS.some(pattern => pattern.test(filePath));
    }
    /**
     * Compare safety levels (returns 1 if a > b, -1 if a < b, 0 if equal)
     */
    compareSafetyLevels(a, b) {
        return FILE_OPERATION_CONSTANTS.SAFETY_LEVELS.indexOf(a) - FILE_OPERATION_CONSTANTS.SAFETY_LEVELS.indexOf(b);
    }
    /**
     * Assess impact level of operation
     */
    assessImpact(operation, targets) {
        // Deleting files has major impact
        if (operation === 'delete') {
            return 'major';
        }
        // Moving files can have significant impact
        if (operation === 'move') {
            return 'significant';
        }
        // Multiple files = higher impact
        if (targets.length > FILE_OPERATION_CONSTANTS.MULTIPLE_FILES_THRESHOLD) {
            return 'significant';
        }
        else if (targets.length > FILE_OPERATION_CONSTANTS.MODERATE_FILES_THRESHOLD) {
            return 'moderate';
        }
        return 'minimal';
    }
    /**
     * Determine if operation requires approval
     */
    shouldRequireApproval(safetyLevel, impactLevel) {
        return safetyLevel === 'dangerous' ||
            safetyLevel === 'risky' ||
            impactLevel === 'major' ||
            impactLevel === 'significant';
    }
    /**
     * Determine if backup is required
     */
    shouldCreateBackup(operation, safetyLevel) {
        return operation === 'delete' ||
            operation === 'move' ||
            (operation === 'edit' && (safetyLevel === 'risky' || safetyLevel === 'dangerous'));
    }
    /**
     * Find file dependencies
     */
    async findDependencies(targets) {
        const dependencies = new Set();
        // This is a simplified implementation
        // In a real scenario, you'd analyze imports, requires, references, etc.
        for (const target of targets) {
            if (target.exists && target.language) {
                // Add some basic dependency detection logic here
                // For now, just return empty array
            }
        }
        return Array.from(dependencies);
    }
    /**
     * Extract content specification from intent
     */
    extractContentSpec(intent) {
        // Extract any mentioned description, language, framework, pattern, replacement
        return {
            description: intent.action,
            language: intent.entities.technologies.find(t => isProgrammingLanguage(t)),
            framework: intent.entities.technologies.find(t => isFramework(t)),
        };
    }
    /**
     * Scan project files for context
     */
    async scanProjectFiles() {
        try {
            this.projectFiles = await this.getAllFiles(this.workingDirectory);
        }
        catch (error) {
            logger.error('Failed to scan project files:', error);
            this.projectFiles = [];
        }
    }
    /**
     * Recursively get all files in directory
     */
    async getAllFiles(dir, maxDepth = FILE_OPERATION_CONSTANTS.MAX_DIRECTORY_DEPTH, currentDepth = 0) {
        if (currentDepth >= maxDepth) {
            return [];
        }
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                // Skip hidden directories and node_modules
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }
                if (entry.isDirectory()) {
                    const subFiles = await this.getAllFiles(fullPath, maxDepth, currentDepth + 1);
                    files.push(...subFiles);
                }
                else if (entry.isFile()) {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            logger.debug(`Failed to read directory ${dir}:`, error);
        }
        return files;
    }
}
//# sourceMappingURL=file-operation-classifier.js.map