/**
 * Incremental Knowledge Graph
 *
 * Extends the Code Knowledge Graph with incremental indexing capabilities
 * for high-performance updates on large codebases. Implements change detection,
 * delta computation, and intelligent cache invalidation.
 *
 * Features:
 * - File change detection with hash comparison
 * - Incremental node and edge updates
 * - Smart cache invalidation based on dependencies
 * - Performance monitoring and metrics
 * - Conflict resolution for concurrent modifications
 * - Fallback to full rebuild when necessary
 */
import { CodeKnowledgeGraph } from './code-knowledge-graph.js';
import { GitChangeTracker } from './git-change-tracker.js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DELAY_CONSTANTS } from '../config/constants.js';
/**
 * Incremental Knowledge Graph Implementation
 *
 * Provides high-performance incremental updates to the knowledge graph
 * while maintaining data consistency and accuracy.
 */
export class IncrementalKnowledgeGraph extends CodeKnowledgeGraph {
    changeTracker;
    gitTracker = null;
    fileWatchers = new Map();
    incrementalConfig;
    metrics;
    updateQueue = [];
    processingUpdate = false;
    constructor(aiClient, projectContext, config = {}) {
        super(aiClient, projectContext, {
            ...config,
            enableCaching: true, // Force caching for incremental updates
        });
        // Initialize change tracking
        this.changeTracker = {
            fileHashes: new Map(),
            lastFullIndex: null,
            lastIncrementalUpdate: null,
            nodeTimestamps: new Map(),
            edgeTimestamps: new Map(),
            dependencies: new Map()
        };
        // Incremental-specific configuration
        this.incrementalConfig = {
            enableFileWatching: true,
            enableGitIntegration: true,
            maxChangesBeforeFullRebuild: 100,
            conflictResolutionStrategy: 'use_newer',
            enableBackgroundUpdates: true,
            updateBatchSize: 10
        };
        // Initialize metrics
        this.metrics = {
            incrementalUpdates: 0,
            fullRebuilds: 0,
            avgIncrementalTime: 0,
            avgFullRebuildTime: 0,
            cacheHitRate: 0,
            changeDetectionTime: 0,
            deltaComputationTime: 0,
            conflictResolutions: 0
        };
    }
    /**
     * Initialize the incremental knowledge graph
     */
    async initialize() {
        const startTime = Date.now();
        try {
            // First perform full initialization
            await super.initialize();
            // Establish baseline for incremental updates
            await this.establishBaseline();
            // Set up git integration if enabled
            if (this.incrementalConfig.enableGitIntegration) {
                await this.setupGitIntegration();
            }
            // Set up file system watchers if enabled
            if (this.incrementalConfig.enableFileWatching) {
                await this.setupFileWatchers();
            }
            this.changeTracker.lastFullIndex = new Date();
            this.metrics.avgFullRebuildTime = Date.now() - startTime;
            this.metrics.fullRebuilds++;
            console.log('🚀 Incremental Knowledge Graph initialized');
            console.log(`📊 Baseline established: ${this.nodeIndex.size} nodes, ${this.edgeIndex.size} edges`);
        }
        catch (error) {
            console.error('Failed to initialize incremental knowledge graph:', error);
            throw error;
        }
    }
    /**
     * Establish baseline for incremental updates
     */
    async establishBaseline() {
        const allFiles = this.projectContext.allFiles;
        const filteredFiles = this.filterRelevantFiles(allFiles);
        // Compute initial file hashes
        for (const fileInfo of filteredFiles) {
            try {
                const fullPath = path.join(this.projectContext.root, fileInfo.relativePath);
                const content = await fs.promises.readFile(fullPath, 'utf8');
                const hash = this.computeFileHash(content);
                this.changeTracker.fileHashes.set(fileInfo.relativePath, hash);
            }
            catch (error) {
                console.warn(`Could not hash file ${fileInfo.relativePath}:`, error);
            }
        }
        // Initialize node and edge timestamps
        for (const node of this.nodeIndex.values()) {
            this.changeTracker.nodeTimestamps.set(node.id, new Date());
        }
        for (const edge of this.edgeIndex.values()) {
            this.changeTracker.edgeTimestamps.set(edge.id, new Date());
        }
        // Build dependency map
        await this.buildDependencyMap();
    }
    /**
     * Set up file system watchers for real-time updates
     */
    async setupFileWatchers() {
        const projectRoot = this.projectContext.root;
        try {
            const watcher = fs.watch(projectRoot, { recursive: true }, (eventType, filename) => {
                if (filename && this.isRelevantFile(filename)) {
                    this.handleFileChange(eventType, filename);
                }
            });
            this.fileWatchers.set('root', watcher);
            console.log('📁 File system watchers initialized');
        }
        catch (error) {
            console.warn('Could not set up file watchers:', error);
        }
    }
    /**
     * Handle file system change events
     */
    async handleFileChange(eventType, filename) {
        if (this.processingUpdate) {
            // Queue the change for later processing
            this.queueFileChange(filename, eventType);
            return;
        }
        try {
            const fullPath = path.join(this.projectContext.root, filename);
            const stats = await fs.promises.stat(fullPath);
            const change = {
                path: filename,
                changeType: eventType === 'rename' ? 'deleted' : 'modified',
                lastModified: stats.mtime,
                size: stats.size
            };
            // Add content hash for modified files
            if (change.changeType === 'modified') {
                const content = await fs.promises.readFile(fullPath, 'utf8');
                change.contentHash = this.computeFileHash(content);
            }
            this.updateQueue.push(change);
            // Process updates in background if enabled
            if (this.incrementalConfig.enableBackgroundUpdates) {
                setTimeout(() => this.processUpdateQueue(), DELAY_CONSTANTS.MEDIUM_DELAY); // Debounce updates
            }
        }
        catch (error) {
            // File might have been deleted
            this.updateQueue.push({
                path: filename,
                changeType: 'deleted',
                lastModified: new Date(),
                size: 0
            });
        }
    }
    /**
     * Queue file change for batch processing
     */
    queueFileChange(filename, eventType) {
        // Simple deduplication - keep only the latest change for each file
        const existingIndex = this.updateQueue.findIndex(change => change.path === filename);
        if (existingIndex >= 0) {
            this.updateQueue.splice(existingIndex, 1);
        }
        this.updateQueue.push({
            path: filename,
            changeType: eventType === 'rename' ? 'deleted' : 'modified',
            lastModified: new Date(),
            size: 0
        });
    }
    /**
     * Process queued file changes
     */
    async processUpdateQueue() {
        if (this.updateQueue.length === 0 || this.processingUpdate) {
            return;
        }
        this.processingUpdate = true;
        try {
            const changes = this.updateQueue.splice(0, this.incrementalConfig.updateBatchSize);
            await this.indexDelta(changes);
        }
        catch (error) {
            console.error('Error processing update queue:', error);
        }
        finally {
            this.processingUpdate = false;
        }
        // Process remaining changes
        if (this.updateQueue.length > 0) {
            setTimeout(() => this.processUpdateQueue(), DELAY_CONSTANTS.SHORT_DELAY);
        }
    }
    /**
     * Detect changes since last update
     */
    async detectChanges() {
        const startTime = Date.now();
        const changes = [];
        try {
            const allFiles = this.projectContext.allFiles;
            const filteredFiles = this.filterRelevantFiles(allFiles);
            for (const fileInfo of filteredFiles) {
                const filePath = fileInfo.relativePath;
                const fullPath = path.join(this.projectContext.root, filePath);
                try {
                    const stats = await fs.promises.stat(fullPath);
                    const content = await fs.promises.readFile(fullPath, 'utf8');
                    const currentHash = this.computeFileHash(content);
                    const lastHash = this.changeTracker.fileHashes.get(filePath);
                    if (!lastHash) {
                        // New file
                        changes.push({
                            path: filePath,
                            changeType: 'added',
                            lastModified: stats.mtime,
                            size: stats.size,
                            contentHash: currentHash
                        });
                    }
                    else if (lastHash !== currentHash) {
                        // Modified file
                        changes.push({
                            path: filePath,
                            changeType: 'modified',
                            lastModified: stats.mtime,
                            size: stats.size,
                            contentHash: currentHash
                        });
                    }
                    // Update hash regardless
                    this.changeTracker.fileHashes.set(filePath, currentHash);
                }
                catch (error) {
                    // File might have been deleted
                    if (this.changeTracker.fileHashes.has(filePath)) {
                        changes.push({
                            path: filePath,
                            changeType: 'deleted',
                            lastModified: new Date(),
                            size: 0
                        });
                        this.changeTracker.fileHashes.delete(filePath);
                    }
                }
            }
            this.metrics.changeDetectionTime = Date.now() - startTime;
            return changes;
        }
        catch (error) {
            console.error('Error detecting changes:', error);
            return changes;
        }
    }
    /**
     * Perform incremental indexing based on file changes
     */
    async indexDelta(changes) {
        const startTime = Date.now();
        // Check if we should fall back to full rebuild
        if (this.shouldFallbackToFullRebuild(changes)) {
            console.log('🔄 Performing full rebuild due to extensive changes');
            await this.rebuildGraph();
            return {
                nodesAdded: this.nodeIndex.size,
                nodesUpdated: 0,
                nodesRemoved: 0,
                edgesAdded: this.edgeIndex.size,
                edgesUpdated: 0,
                edgesRemoved: 0,
                updateTime: Date.now() - startTime,
                cacheInvalidations: 0,
                conflicts: []
            };
        }
        const result = {
            nodesAdded: 0,
            nodesUpdated: 0,
            nodesRemoved: 0,
            edgesAdded: 0,
            edgesUpdated: 0,
            edgesRemoved: 0,
            updateTime: 0,
            cacheInvalidations: 0,
            conflicts: []
        };
        try {
            // Process each change
            for (const change of changes) {
                await this.processFileChange(change, result);
            }
            // Invalidate affected caches
            const invalidatedKeys = await this.invalidateCache(changes.map(c => c.path));
            result.cacheInvalidations = invalidatedKeys.length;
            // Update dependencies
            await this.updateDependencies(changes);
            result.updateTime = Date.now() - startTime;
            this.metrics.incrementalUpdates++;
            this.metrics.avgIncrementalTime =
                (this.metrics.avgIncrementalTime + result.updateTime) / 2;
            this.changeTracker.lastIncrementalUpdate = new Date();
            console.log(`⚡ Incremental update completed: +${result.nodesAdded} -${result.nodesRemoved} nodes, ${result.updateTime}ms`);
            return result;
        }
        catch (error) {
            console.error('Error during incremental indexing:', error);
            // Fallback to full rebuild on error
            await this.rebuildGraph();
            throw error;
        }
    }
    /**
     * Process a single file change
     */
    async processFileChange(change, result) {
        const affectedNodes = await this.getAffectedNodes([change.path]);
        switch (change.changeType) {
            case 'added':
                await this.addFileNodes(change.path, result);
                break;
            case 'modified':
                await this.updateFileNodes(change.path, affectedNodes, result);
                break;
            case 'deleted':
                await this.removeFileNodes(change.path, affectedNodes, result);
                break;
        }
    }
    /**
     * Add nodes for a new file
     */
    async addFileNodes(filePath, result) {
        try {
            // Index the file itself
            const fileNode = await this.indexFileInternal(filePath);
            if (fileNode) {
                await this.addNode(fileNode);
                this.changeTracker.nodeTimestamps.set(fileNode.id, new Date());
                result.nodesAdded++;
            }
            // Index elements within the file
            const fileElements = await this.indexFileElementsInternal(filePath);
            for (const element of fileElements) {
                await this.addNode(element);
                this.changeTracker.nodeTimestamps.set(element.id, new Date());
                result.nodesAdded++;
            }
            // Build relationships for the new file
            const newEdges = await this.buildSimpleFileRelationships(filePath);
            for (const edge of newEdges) {
                await this.addEdge(edge);
                this.changeTracker.edgeTimestamps.set(edge.id, new Date());
                result.edgesAdded++;
            }
        }
        catch (error) {
            console.error(`Error adding nodes for file ${filePath}:`, error);
        }
    }
    /**
     * Update nodes for a modified file
     */
    async updateFileNodes(filePath, affectedNodes, result) {
        try {
            // Remove old nodes for this file
            for (const nodeId of affectedNodes) {
                if (await this.removeNode(nodeId)) {
                    result.nodesRemoved++;
                }
            }
            // Add updated nodes
            await this.addFileNodes(filePath, result);
        }
        catch (error) {
            console.error(`Error updating nodes for file ${filePath}:`, error);
        }
    }
    /**
     * Remove nodes for a deleted file
     */
    async removeFileNodes(filePath, affectedNodes, result) {
        try {
            for (const nodeId of affectedNodes) {
                if (await this.removeNode(nodeId)) {
                    this.changeTracker.nodeTimestamps.delete(nodeId);
                    result.nodesRemoved++;
                }
            }
            // Remove from dependencies
            this.changeTracker.dependencies.delete(filePath);
        }
        catch (error) {
            console.error(`Error removing nodes for file ${filePath}:`, error);
        }
    }
    /**
     * Get nodes affected by file changes
     */
    async getAffectedNodes(changedFiles) {
        const affectedNodes = [];
        for (const filePath of changedFiles) {
            // Direct nodes in the file
            const fileNodes = Array.from(this.nodeIndex.values()).filter(node => node.properties.file === filePath || node.properties.path === filePath);
            affectedNodes.push(...fileNodes.map(n => n.id));
            // Dependent nodes from other files
            const dependents = this.changeTracker.dependencies.get(filePath) || [];
            for (const dependent of dependents) {
                const dependentNodes = Array.from(this.nodeIndex.values()).filter(node => node.properties.file === dependent);
                affectedNodes.push(...dependentNodes.map(n => n.id));
            }
        }
        return [...new Set(affectedNodes)]; // Remove duplicates
    }
    /**
     * Invalidate cache entries based on affected files
     */
    async invalidateCache(affectedFiles) {
        const invalidatedKeys = [];
        try {
            // Get affected nodes
            const affectedNodes = await this.getAffectedNodes(affectedFiles);
            // Invalidate query cache entries that involve affected nodes
            const queryCache = this.queryCache;
            const relatedCodeCache = this.relatedCodeCache;
            const patternCache = this.patternCache;
            // This is a simplified invalidation strategy
            // In practice, we'd want more sophisticated cache key tracking
            // For now, clear all caches when files change
            // TODO: Implement selective cache invalidation based on dependency analysis
            if (affectedNodes.length > 0) {
                queryCache.clear();
                relatedCodeCache.clear();
                patternCache.clear();
                invalidatedKeys.push('query_cache', 'related_code_cache', 'pattern_cache');
            }
            return invalidatedKeys;
        }
        catch (error) {
            console.error('Error invalidating cache:', error);
            return invalidatedKeys;
        }
    }
    /**
     * Update dependency mapping
     */
    async updateDependencies(changes) {
        for (const change of changes) {
            if (change.changeType === 'deleted') {
                this.changeTracker.dependencies.delete(change.path);
                continue;
            }
            try {
                const fullPath = path.join(this.projectContext.root, change.path);
                const content = await fs.promises.readFile(fullPath, 'utf8');
                const dependencies = this.extractFileDependencies(content, change.path);
                this.changeTracker.dependencies.set(change.path, dependencies);
            }
            catch (error) {
                console.warn(`Could not update dependencies for ${change.path}:`, error);
            }
        }
    }
    /**
     * Extract file dependencies from content
     */
    extractFileDependencies(content, currentFile) {
        const dependencies = [];
        const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/gi;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            const resolvedPath = this.resolveImportPath(importPath, currentFile);
            if (resolvedPath) {
                dependencies.push(resolvedPath);
            }
        }
        return dependencies;
    }
    /**
     * Build dependency map for all files
     */
    async buildDependencyMap() {
        const allFiles = this.projectContext.allFiles;
        const filteredFiles = this.filterRelevantFiles(allFiles);
        for (const fileInfo of filteredFiles) {
            try {
                const fullPath = path.join(this.projectContext.root, fileInfo.relativePath);
                const content = await fs.promises.readFile(fullPath, 'utf8');
                const dependencies = this.extractFileDependencies(content, fileInfo.relativePath);
                this.changeTracker.dependencies.set(fileInfo.relativePath, dependencies);
            }
            catch (error) {
                console.warn(`Could not build dependencies for ${fileInfo.relativePath}:`, error);
            }
        }
    }
    /**
     * Determine if we should fallback to full rebuild
     */
    shouldFallbackToFullRebuild(changes) {
        // Fallback conditions
        const conditions = [
            changes.length > this.incrementalConfig.maxChangesBeforeFullRebuild,
            !this.changeTracker.lastFullIndex, // No baseline
            this.detectStructuralChanges(changes),
            this.hasConfigurationChanges(changes)
        ];
        return conditions.some(condition => condition);
    }
    /**
     * Detect if changes are structural (affecting graph schema)
     */
    detectStructuralChanges(changes) {
        // Check for changes to core files that affect the graph structure
        const structuralFiles = ['package.json', 'tsconfig.json', 'webpack.config.js'];
        return changes.some(change => structuralFiles.some(file => change.path.endsWith(file)));
    }
    /**
     * Check for configuration file changes
     */
    hasConfigurationChanges(changes) {
        const configFiles = ['.env', '.gitignore', 'README.md'];
        return changes.some(change => configFiles.some(file => change.path.endsWith(file)));
    }
    /**
     * Rebuild the entire graph
     */
    async rebuildGraph() {
        const startTime = Date.now();
        // Clear existing graph
        this.clear();
        // Reinitialize from scratch
        await super.initialize();
        // Re-establish baseline
        await this.establishBaseline();
        this.changeTracker.lastFullIndex = new Date();
        this.metrics.fullRebuilds++;
        this.metrics.avgFullRebuildTime = Date.now() - startTime;
        console.log(`🔄 Full graph rebuild completed in ${Date.now() - startTime}ms`);
    }
    /**
     * Compute file content hash
     */
    computeFileHash(content) {
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    }
    /**
     * Check if file is relevant for indexing
     */
    isRelevantFile(filename) {
        const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.h'];
        const extension = path.extname(filename).toLowerCase();
        return codeExtensions.includes(extension) && !filename.includes('node_modules');
    }
    /**
     * Get incremental update metrics
     */
    getIncrementalMetrics() {
        this.metrics.cacheHitRate = this.calculateCacheHitRate();
        return { ...this.metrics };
    }
    /**
     * Force full rebuild
     */
    async forceFullRebuild() {
        console.log('🔄 Forcing full graph rebuild...');
        await this.rebuildGraph();
    }
    /**
     * Internal methods to access base class functionality
     */
    async indexFileInternal(filePath) {
        try {
            const stats = await fs.promises.stat(path.join(this.projectContext.root, filePath));
            const extension = path.extname(filePath);
            return {
                id: `file_${this.generateIdInternal()}`,
                type: 'file',
                name: path.basename(filePath),
                properties: {
                    path: filePath,
                    extension,
                    size: stats.size,
                    modified: stats.mtime,
                    directory: path.dirname(filePath)
                },
                metadata: {
                    created: new Date(),
                    updated: new Date(),
                    confidence: 1.0,
                    source: 'incremental_file_indexer'
                }
            };
        }
        catch (error) {
            console.error(`Error indexing file ${filePath}:`, error);
            return null;
        }
    }
    async indexFileElementsInternal(filePath) {
        const elements = [];
        try {
            const fullPath = path.join(this.projectContext.root, filePath);
            const content = await fs.promises.readFile(fullPath, 'utf8');
            // Extract classes
            const classes = this.extractClassesInternal(content, filePath);
            elements.push(...classes);
            // Extract functions
            const functions = this.extractFunctionsInternal(content, filePath);
            elements.push(...functions);
            // Extract variables
            const variables = this.extractVariablesInternal(content, filePath);
            elements.push(...variables);
            // Extract interfaces
            const interfaces = this.extractInterfacesInternal(content, filePath);
            elements.push(...interfaces);
            return elements;
        }
        catch (error) {
            console.error(`Error indexing elements in ${filePath}:`, error);
            return elements;
        }
    }
    async buildSimpleFileRelationships(filePath) {
        const edges = [];
        try {
            const fullPath = path.join(this.projectContext.root, filePath);
            const content = await fs.promises.readFile(fullPath, 'utf8');
            const fileNode = Array.from(this.nodeIndex.values()).find(n => n.type === 'file' && n.properties.path === filePath);
            if (!fileNode)
                return edges;
            // Extract import relationships
            const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/gi;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                const resolvedPath = this.resolveImportPath(importPath, filePath);
                if (resolvedPath) {
                    const targetFileNode = Array.from(this.nodeIndex.values()).find(n => n.type === 'file' && n.properties.path === resolvedPath);
                    if (targetFileNode) {
                        edges.push({
                            id: `import_${this.generateIdInternal()}`,
                            type: 'imports',
                            source: fileNode.id,
                            target: targetFileNode.id,
                            properties: {
                                importPath,
                                resolvedPath
                            },
                            metadata: {
                                created: new Date(),
                                confidence: 0.9,
                                strength: 1.0
                            }
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error processing file relationships for ${filePath}:`, error);
        }
        return edges;
    }
    extractClassesInternal(content, filePath) {
        const classes = [];
        const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*\{/gi;
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const extendedClass = match[2];
            const implementedInterfaces = match[3]?.split(',').map(i => i.trim());
            classes.push({
                id: `class_${className}_${this.generateIdInternal()}`,
                type: 'class',
                name: className,
                properties: {
                    file: filePath,
                    lineNumber: this.getLineNumberInternal(content, match.index),
                    extends: extendedClass,
                    implements: implementedInterfaces,
                    scope: 'public'
                },
                metadata: {
                    created: new Date(),
                    updated: new Date(),
                    confidence: 0.9,
                    source: 'incremental_class_extractor'
                }
            });
        }
        return classes;
    }
    extractFunctionsInternal(content, filePath) {
        const functions = [];
        const patterns = [
            /function\s+(\w+)\s*\([^)]*\)/gi,
            /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/gi,
            /(\w+)\s*:\s*\([^)]*\)\s*=>/gi,
            /async\s+function\s+(\w+)\s*\([^)]*\)/gi,
            /(\w+)\s*\([^)]*\)\s*\{/gi
        ];
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const functionName = match[1];
                if (functions.some(f => f.name === functionName))
                    continue;
                functions.push({
                    id: `function_${functionName}_${this.generateIdInternal()}`,
                    type: 'function',
                    name: functionName,
                    properties: {
                        file: filePath,
                        lineNumber: this.getLineNumberInternal(content, match.index),
                        async: match[0].includes('async'),
                        arrow: match[0].includes('=>')
                    },
                    metadata: {
                        created: new Date(),
                        updated: new Date(),
                        confidence: 0.8,
                        source: 'incremental_function_extractor'
                    }
                });
            }
        });
        return functions;
    }
    extractVariablesInternal(content, filePath) {
        const variables = [];
        const patterns = [
            /const\s+(\w+)\s*=/gi,
            /let\s+(\w+)\s*=/gi,
            /var\s+(\w+)\s*=/gi
        ];
        patterns.forEach((pattern, index) => {
            const varType = ['const', 'let', 'var'][index];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const varName = match[1];
                if (variables.some(v => v.name === varName))
                    continue;
                variables.push({
                    id: `variable_${varName}_${this.generateIdInternal()}`,
                    type: 'variable',
                    name: varName,
                    properties: {
                        file: filePath,
                        lineNumber: this.getLineNumberInternal(content, match.index),
                        varType,
                        scope: 'local'
                    },
                    metadata: {
                        created: new Date(),
                        updated: new Date(),
                        confidence: 0.7,
                        source: 'incremental_variable_extractor'
                    }
                });
            }
        });
        return variables;
    }
    extractInterfacesInternal(content, filePath) {
        const interfaces = [];
        const interfaceRegex = /interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?\s*\{/gi;
        let match;
        while ((match = interfaceRegex.exec(content)) !== null) {
            const interfaceName = match[1];
            const extendedInterfaces = match[2]?.split(',').map(i => i.trim());
            interfaces.push({
                id: `interface_${interfaceName}_${this.generateIdInternal()}`,
                type: 'interface',
                name: interfaceName,
                properties: {
                    file: filePath,
                    lineNumber: this.getLineNumberInternal(content, match.index),
                    extends: extendedInterfaces
                },
                metadata: {
                    created: new Date(),
                    updated: new Date(),
                    confidence: 0.9,
                    source: 'incremental_interface_extractor'
                }
            });
        }
        return interfaces;
    }
    generateIdInternal() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getLineNumberInternal(content, index) {
        return content.substring(0, index).split('\n').length;
    }
    /**
     * Set up git integration for change tracking
     */
    async setupGitIntegration() {
        try {
            this.gitTracker = new GitChangeTracker({
                repositoryPath: this.projectContext.root,
                trackingMode: 'working_directory',
                includeUntracked: true,
                excludePatterns: [
                    'node_modules/**',
                    'dist/**',
                    'build/**',
                    '.git/**',
                    '**/*.log',
                    '**/*.tmp',
                    '**/.DS_Store'
                ]
            });
            await this.gitTracker.initialize();
            console.log('🔧 Git integration initialized for change tracking');
        }
        catch (error) {
            console.warn('Failed to initialize git integration:', error);
            this.gitTracker = null;
            // Continue without git integration
        }
    }
    /**
     * Get changes from git if available, fallback to file system scanning
     */
    async getChangesSinceLastUpdate() {
        if (this.gitTracker) {
            try {
                const gitChanges = await this.gitTracker.getChangesSinceLastUpdate();
                if (gitChanges.length > 0) {
                    console.log(`📊 Git detected ${gitChanges.length} changed files`);
                    return gitChanges;
                }
            }
            catch (error) {
                console.warn('Git change detection failed, falling back to file system scan:', error);
            }
        }
        // Fallback to file system scanning
        return await this.detectChanges();
    }
    /**
     * Enhanced change detection with git awareness
     */
    async performIncrementalUpdate(forceFullRebuild = false) {
        const startTime = Date.now();
        try {
            // Use git-aware change detection
            const changes = await this.getChangesSinceLastUpdate();
            if (changes.length === 0 && !forceFullRebuild) {
                console.log('📊 No changes detected, skipping update');
                return {
                    nodesAdded: 0,
                    nodesUpdated: 0,
                    nodesRemoved: 0,
                    edgesAdded: 0,
                    edgesUpdated: 0,
                    edgesRemoved: 0,
                    updateTime: Date.now() - startTime,
                    cacheInvalidations: 0,
                    conflicts: []
                };
            }
            // Process all changes
            const result = {
                nodesAdded: 0,
                nodesUpdated: 0,
                nodesRemoved: 0,
                edgesAdded: 0,
                edgesUpdated: 0,
                edgesRemoved: 0,
                updateTime: 0,
                cacheInvalidations: 0,
                conflicts: []
            };
            // Process each change using existing logic
            for (const change of changes) {
                await this.processFileChange(change, result);
            }
            result.updateTime = Date.now() - startTime;
            this.changeTracker.lastIncrementalUpdate = new Date();
            this.metrics.incrementalUpdates++;
            return result;
        }
        catch (error) {
            console.error('Incremental update failed:', error);
            throw error;
        }
    }
    /**
     * Clean up resources
     */
    cleanup() {
        // Close file watchers
        for (const watcher of this.fileWatchers.values()) {
            watcher.close();
        }
        this.fileWatchers.clear();
        // Clear update queue
        this.updateQueue.length = 0;
        this.processingUpdate = false;
        // Call parent cleanup
        super.clear();
    }
}
//# sourceMappingURL=incremental-knowledge-graph.js.map