import { EventEmitter } from 'events';
import { watch } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { IntelligentCache } from './memory-optimizer.js';
/**
 * Simple debounce implementation
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
export var FileChangeType;
(function (FileChangeType) {
    FileChangeType["CREATED"] = "created";
    FileChangeType["MODIFIED"] = "modified";
    FileChangeType["DELETED"] = "deleted";
    FileChangeType["RENAMED"] = "renamed";
    FileChangeType["MOVED"] = "moved";
})(FileChangeType || (FileChangeType = {}));
export var UpdatePriority;
(function (UpdatePriority) {
    UpdatePriority[UpdatePriority["LOW"] = 1] = "LOW";
    UpdatePriority[UpdatePriority["NORMAL"] = 2] = "NORMAL";
    UpdatePriority[UpdatePriority["HIGH"] = 3] = "HIGH";
    UpdatePriority[UpdatePriority["CRITICAL"] = 4] = "CRITICAL";
})(UpdatePriority || (UpdatePriority = {}));
/**
 * Main real-time update engine
 */
export class RealtimeUpdateEngine extends EventEmitter {
    watchers = new Map();
    changeQueue = [];
    processingQueue = [];
    fileChecksums = new Map();
    dependencyGraph = new Map();
    updateCache;
    config;
    strategy;
    isProcessing = false;
    stats;
    conflictResolver;
    constructor(config = {}, strategy = {}) {
        super();
        this.config = {
            rootPaths: [process.cwd()],
            includePatterns: ['**/*.{ts,js,tsx,jsx,py,java,cpp,hpp,rs}'],
            excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**'],
            debounceMs: 100,
            batchSize: 50,
            enableRecursive: true,
            ignoreHidden: true,
            watchSymlinks: false,
            performanceMode: 'balanced',
            ...config
        };
        this.strategy = {
            mode: 'batched',
            batchWindow: 1000,
            priority: UpdatePriority.NORMAL,
            backgroundProcessing: true,
            conflictHandling: {
                autoResolve: true,
                maxRetries: 3,
                rollbackOnFailure: true,
                notifyOnConflict: true
            },
            ...strategy
        };
        this.updateCache = new IntelligentCache({
            maxMemoryMB: 128,
            defaultTTL: 300000 // 5 minutes
        });
        this.conflictResolver = new ConflictResolver();
        this.stats = this.initializeStats();
        this.setupProcessing();
    }
    initializeStats() {
        return {
            totalWatchedFiles: 0,
            totalWatchedDirectories: 0,
            eventsPerSecond: 0,
            averageProcessingTime: 0,
            queueSize: 0,
            errorRate: 0,
            memoryUsage: 0,
            cacheHitRate: 0
        };
    }
    setupProcessing() {
        // Debounced change processing
        const debouncedProcess = debounce(() => this.processPendingChanges(), this.config.debounceMs);
        this.on('fileChange', debouncedProcess);
        // Background processing loop
        if (this.strategy.backgroundProcessing) {
            setInterval(() => {
                if (!this.isProcessing && this.processingQueue.length > 0) {
                    this.processChangeSet();
                }
            }, this.strategy.batchWindow);
        }
        // Stats monitoring
        setInterval(() => {
            this.updateStats();
        }, 5000);
    }
    /**
     * Start watching configured paths
     */
    async startWatching() {
        try {
            // Initialize file checksums for existing files
            await this.initializeChecksums();
            // Start watchers for each root path
            for (const rootPath of this.config.rootPaths) {
                await this.startPathWatcher(rootPath);
            }
            this.emit('watchingStarted', {
                paths: this.config.rootPaths,
                totalFiles: this.stats.totalWatchedFiles
            });
        }
        catch (error) {
            this.emit('watchingError', error);
            throw error;
        }
    }
    async initializeChecksums() {
        for (const rootPath of this.config.rootPaths) {
            await this.scanDirectoryForChecksums(rootPath);
        }
    }
    async scanDirectoryForChecksums(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                // Skip excluded patterns
                if (this.isExcluded(fullPath))
                    continue;
                if (entry.isDirectory() && this.config.enableRecursive) {
                    await this.scanDirectoryForChecksums(fullPath);
                    this.stats.totalWatchedDirectories++;
                }
                else if (entry.isFile() && this.isIncluded(fullPath)) {
                    const checksum = await this.calculateFileChecksum(fullPath);
                    this.fileChecksums.set(fullPath, checksum);
                    this.stats.totalWatchedFiles++;
                }
            }
        }
        catch (error) {
            console.warn(`Failed to scan directory ${dirPath}:`, error);
        }
    }
    async startPathWatcher(rootPath) {
        const watcher = watch(rootPath, { recursive: this.config.enableRecursive }, (eventType, filename) => {
            if (filename) {
                this.handleFileSystemEvent(eventType, path.join(rootPath, filename));
            }
        });
        watcher.on('error', (error) => {
            this.emit('watcherError', { path: rootPath, error });
        });
        this.watchers.set(rootPath, watcher);
    }
    async handleFileSystemEvent(eventType, filePath) {
        // Skip excluded files
        if (this.isExcluded(filePath))
            return;
        try {
            const changeEvent = await this.createChangeEvent(eventType, filePath);
            if (changeEvent) {
                this.changeQueue.push(changeEvent);
                this.emit('fileChange', changeEvent);
                this.stats.queueSize = this.changeQueue.length;
            }
        }
        catch (error) {
            this.emit('changeDetectionError', { filePath, error });
        }
    }
    async createChangeEvent(eventType, filePath) {
        try {
            const stats = await fs.stat(filePath);
            const oldChecksum = this.fileChecksums.get(filePath);
            const newChecksum = await this.calculateFileChecksum(filePath);
            let changeType;
            if (!oldChecksum) {
                changeType = FileChangeType.CREATED;
            }
            else if (oldChecksum !== newChecksum) {
                changeType = FileChangeType.MODIFIED;
            }
            else {
                return null; // No actual change
            }
            this.fileChecksums.set(filePath, newChecksum);
            const metadata = await this.analyzeFileMetadata(filePath);
            return {
                id: this.generateChangeId(),
                type: changeType,
                filePath,
                timestamp: Date.now(),
                size: stats.size,
                checksum: newChecksum,
                metadata
            };
        }
        catch (error) {
            // File might have been deleted
            if (this.fileChecksums.has(filePath)) {
                this.fileChecksums.delete(filePath);
                return {
                    id: this.generateChangeId(),
                    type: FileChangeType.DELETED,
                    filePath,
                    timestamp: Date.now(),
                    metadata: {}
                };
            }
            return null;
        }
    }
    async analyzeFileMetadata(filePath) {
        const metadata = {};
        // Determine language from extension
        const ext = path.extname(filePath).toLowerCase();
        const languageMap = {
            '.ts': 'typescript',
            '.js': 'javascript',
            '.tsx': 'typescript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.hpp': 'cpp',
            '.rs': 'rust'
        };
        metadata.language = languageMap[ext];
        // Analyze file content for dependencies (simplified)
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            metadata.imports = this.extractImports(content, metadata.language);
            metadata.exports = this.extractExports(content, metadata.language);
            metadata.complexity = this.estimateComplexity(content);
        }
        catch (error) {
            // File might be binary or inaccessible
        }
        return metadata;
    }
    extractImports(content, language) {
        const imports = [];
        if (language === 'typescript' || language === 'javascript') {
            const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                imports.push(match[1]);
            }
        }
        return imports;
    }
    extractExports(content, language) {
        const exports = [];
        if (language === 'typescript' || language === 'javascript') {
            const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
            let match;
            while ((match = exportRegex.exec(content)) !== null) {
                exports.push(match[1]);
            }
        }
        return exports;
    }
    estimateComplexity(content) {
        // Simple complexity estimation based on content
        const lines = content.split('\n').length;
        const functions = (content.match(/function|=>/g) || []).length;
        const conditions = (content.match(/if|switch|for|while/g) || []).length;
        return Math.log10(lines + functions * 5 + conditions * 3);
    }
    async processPendingChanges() {
        if (this.changeQueue.length === 0)
            return;
        // Create change set from queued changes
        const changes = this.changeQueue.splice(0, this.config.batchSize);
        const changeSet = await this.createChangeSet(changes);
        this.processingQueue.push(changeSet);
        this.stats.queueSize = this.changeQueue.length;
        this.emit('changeSetCreated', changeSet);
        // Process immediately if not in background mode
        if (!this.strategy.backgroundProcessing) {
            await this.processChangeSet();
        }
    }
    async createChangeSet(changes) {
        const id = this.generateChangeSetId();
        const timestamp = Date.now();
        // Analyze change impact
        const impact = await this.analyzeChangeImpact(changes);
        // Detect conflicts
        const conflicts = await this.detectConflicts(changes);
        // Create summary
        const summary = this.createChangeSummary(changes);
        return {
            id,
            timestamp,
            changes,
            summary,
            impact,
            conflicts
        };
    }
    async analyzeChangeImpact(changes) {
        const dependentComponents = new Set();
        let knowledgeGraphUpdates = 0;
        let cacheInvalidations = 0;
        let indexRebuildRequired = false;
        let regressionRisk = 0;
        for (const change of changes) {
            // Analyze dependencies
            const deps = await this.getDependentFiles(change.filePath);
            deps.forEach(dep => dependentComponents.add(dep));
            // Count required updates
            knowledgeGraphUpdates += deps.size;
            cacheInvalidations += this.getCacheInvalidationCount(change.filePath);
            // Check if index rebuild needed
            if (change.type === FileChangeType.CREATED ||
                change.type === FileChangeType.DELETED ||
                this.isStructuralChange(change)) {
                indexRebuildRequired = true;
            }
            // Assess regression risk
            regressionRisk += this.assessRegressionRisk(change);
        }
        return {
            knowledgeGraphUpdates,
            cacheInvalidations,
            indexRebuildRequired,
            dependentComponents: Array.from(dependentComponents),
            regressionRisk: Math.min(regressionRisk / changes.length, 1)
        };
    }
    async getDependentFiles(filePath) {
        return this.dependencyGraph.get(filePath) || new Set();
    }
    getCacheInvalidationCount(filePath) {
        // Estimate cache entries that need invalidation
        return 1; // Simplified
    }
    isStructuralChange(change) {
        // Check if change affects project structure
        return change.metadata.exports?.length !== undefined ||
            change.metadata.imports?.length !== undefined;
    }
    assessRegressionRisk(change) {
        let risk = 0;
        // Higher risk for deleted files
        if (change.type === FileChangeType.DELETED)
            risk += 0.8;
        // Higher risk for complex files
        if (change.metadata.complexity && change.metadata.complexity > 5)
            risk += 0.3;
        // Higher risk for files with many dependencies
        if (change.metadata.dependencies && change.metadata.dependencies.length > 10)
            risk += 0.4;
        return Math.min(risk, 1);
    }
    async detectConflicts(changes) {
        const conflicts = [];
        // Check for concurrent modifications
        const fileGroups = new Map();
        for (const change of changes) {
            const group = fileGroups.get(change.filePath) || [];
            group.push(change);
            fileGroups.set(change.filePath, group);
        }
        for (const [filePath, fileChanges] of fileGroups) {
            if (fileChanges.length > 1) {
                conflicts.push({
                    type: 'concurrent_modification',
                    severity: 'warning',
                    files: [filePath],
                    description: `Multiple concurrent changes detected for ${filePath}`,
                    resolution: {
                        strategy: 'auto_resolve',
                        action: 'Use latest timestamp',
                        confidence: 0.8
                    }
                });
            }
        }
        // Check for broken dependencies
        for (const change of changes) {
            if (change.type === FileChangeType.DELETED) {
                const dependents = await this.getDependentFiles(change.filePath);
                if (dependents.size > 0) {
                    conflicts.push({
                        type: 'dependency_broken',
                        severity: 'error',
                        files: [change.filePath, ...Array.from(dependents)],
                        description: `Deleted file ${change.filePath} has ${dependents.size} dependents`,
                        resolution: {
                            strategy: 'manual_required',
                            action: 'Update or remove dependent imports',
                            confidence: 0.9
                        }
                    });
                }
            }
        }
        return conflicts;
    }
    createChangeSummary(changes) {
        const summary = {
            totalChanges: changes.length,
            createdFiles: 0,
            modifiedFiles: 0,
            deletedFiles: 0,
            affectedModules: new Set(),
            estimatedImpact: 'low'
        };
        for (const change of changes) {
            switch (change.type) {
                case FileChangeType.CREATED:
                    summary.createdFiles++;
                    break;
                case FileChangeType.MODIFIED:
                    summary.modifiedFiles++;
                    break;
                case FileChangeType.DELETED:
                    summary.deletedFiles++;
                    break;
            }
            // Track affected modules
            if (change.metadata.module) {
                summary.affectedModules.add(change.metadata.module);
            }
        }
        // Determine impact level
        if (summary.deletedFiles > 0 || summary.createdFiles > 10) {
            summary.estimatedImpact = 'high';
        }
        else if (summary.modifiedFiles > 20 || summary.affectedModules.size > 5) {
            summary.estimatedImpact = 'medium';
        }
        return {
            ...summary,
            affectedModules: Array.from(summary.affectedModules)
        };
    }
    async processChangeSet() {
        if (this.isProcessing || this.processingQueue.length === 0)
            return;
        this.isProcessing = true;
        const startTime = Date.now();
        try {
            const changeSet = this.processingQueue.shift();
            // Handle conflicts first
            if (changeSet.conflicts.length > 0) {
                await this.handleConflicts(changeSet);
            }
            // Apply updates
            await this.applyUpdates(changeSet);
            // Update dependency graph
            await this.updateDependencyGraph(changeSet);
            // Invalidate caches
            await this.invalidateCaches(changeSet);
            const processingTime = Date.now() - startTime;
            this.stats.averageProcessingTime =
                (this.stats.averageProcessingTime + processingTime) / 2;
            this.emit('changeSetProcessed', {
                changeSetId: changeSet.id,
                processingTime,
                changesCount: changeSet.changes.length
            });
        }
        catch (error) {
            this.emit('processingError', error);
            this.stats.errorRate += 0.1;
        }
        finally {
            this.isProcessing = false;
        }
    }
    async handleConflicts(changeSet) {
        for (const conflict of changeSet.conflicts) {
            if (this.strategy.conflictHandling.autoResolve && conflict.resolution) {
                await this.conflictResolver.resolve(conflict);
            }
            else if (this.strategy.conflictHandling.notifyOnConflict) {
                this.emit('conflictDetected', conflict);
            }
        }
    }
    async applyUpdates(changeSet) {
        // Apply knowledge graph updates
        for (const change of changeSet.changes) {
            await this.updateKnowledgeGraph(change);
        }
        // Rebuild indexes if required
        if (changeSet.impact.indexRebuildRequired) {
            await this.rebuildIndexes(changeSet);
        }
    }
    async updateKnowledgeGraph(change) {
        // Update knowledge graph with file changes
        // This would integrate with the existing knowledge graph system
        this.emit('knowledgeGraphUpdate', {
            filePath: change.filePath,
            changeType: change.type,
            metadata: change.metadata
        });
    }
    async updateDependencyGraph(changeSet) {
        for (const change of changeSet.changes) {
            if (change.type === FileChangeType.DELETED) {
                this.dependencyGraph.delete(change.filePath);
            }
            else if (change.metadata.dependencies) {
                const deps = new Set(change.metadata.dependencies);
                this.dependencyGraph.set(change.filePath, deps);
            }
        }
    }
    async invalidateCaches(changeSet) {
        for (const change of changeSet.changes) {
            await this.updateCache.set(`file:${change.filePath}`, null);
        }
    }
    async rebuildIndexes(changeSet) {
        this.emit('indexRebuildStarted', { changeSetId: changeSet.id });
        // Rebuild search indexes and other data structures
        this.emit('indexRebuildCompleted', { changeSetId: changeSet.id });
    }
    isExcluded(filePath) {
        return this.config.excludePatterns.some(pattern => this.matchesPattern(filePath, pattern));
    }
    isIncluded(filePath) {
        return this.config.includePatterns.some(pattern => this.matchesPattern(filePath, pattern));
    }
    matchesPattern(filePath, pattern) {
        // Simplified pattern matching - in real implementation use micromatch
        return filePath.includes(pattern.replace('**/', '').replace('*', ''));
    }
    async calculateFileChecksum(filePath) {
        try {
            const content = await fs.readFile(filePath);
            return createHash('md5').update(content).digest('hex');
        }
        catch (error) {
            return '';
        }
    }
    generateChangeId() {
        return createHash('md5').update(`${Date.now()}_${Math.random()}`).digest('hex').substring(0, 8);
    }
    generateChangeSetId() {
        return createHash('md5').update(`${Date.now()}_changeset_${Math.random()}`).digest('hex').substring(0, 12);
    }
    updateStats() {
        const now = Date.now();
        // Update stats based on recent activity
        this.stats.queueSize = this.changeQueue.length + this.processingQueue.length;
        this.stats.memoryUsage = process.memoryUsage().heapUsed;
        this.stats.cacheHitRate = 0.8; // Would be calculated from actual cache stats
    }
    /**
     * Stop all file watching
     */
    async stopWatching() {
        for (const [path, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
        this.changeQueue.length = 0;
        this.processingQueue.length = 0;
        this.emit('watchingStopped');
    }
    /**
     * Get real-time statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get current queue status
     */
    getQueueStatus() {
        return {
            changeQueue: this.changeQueue.length,
            processingQueue: this.processingQueue.length,
            isProcessing: this.isProcessing
        };
    }
    /**
     * Force process all pending changes
     */
    async flushChanges() {
        await this.processPendingChanges();
        while (this.processingQueue.length > 0) {
            await this.processChangeSet();
        }
    }
}
/**
 * Conflict resolution system
 */
class ConflictResolver {
    async resolve(conflict) {
        if (!conflict.resolution)
            return false;
        try {
            switch (conflict.resolution.strategy) {
                case 'auto_resolve':
                    return await this.autoResolve(conflict);
                case 'rollback':
                    return await this.rollback(conflict);
                case 'ignore':
                    return true;
                default:
                    return false;
            }
        }
        catch (error) {
            console.warn('Failed to resolve conflict:', error);
            return false;
        }
    }
    async autoResolve(conflict) {
        // Implement automatic conflict resolution logic
        return true; // Simplified
    }
    async rollback(conflict) {
        // Implement rollback logic
        return true; // Simplified
    }
}
//# sourceMappingURL=realtime-update-engine.js.map