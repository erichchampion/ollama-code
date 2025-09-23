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
import { CodeKnowledgeGraph, GraphConfig } from './code-knowledge-graph.js';
import { ProjectContext } from './context.js';
export interface FileChange {
    path: string;
    changeType: 'added' | 'modified' | 'deleted';
    lastModified: Date;
    size: number;
    contentHash?: string;
}
export interface IncrementalUpdateResult {
    nodesAdded: number;
    nodesUpdated: number;
    nodesRemoved: number;
    edgesAdded: number;
    edgesUpdated: number;
    edgesRemoved: number;
    updateTime: number;
    cacheInvalidations: number;
    conflicts: ConflictResolution[];
}
export interface ConflictResolution {
    type: 'node_conflict' | 'edge_conflict' | 'pattern_conflict';
    nodeId?: string;
    edgeId?: string;
    reason: string;
    resolution: 'use_newer' | 'merge' | 'manual_required';
    timestamp: Date;
}
export interface ChangeTracker {
    fileHashes: Map<string, string>;
    lastFullIndex: Date | null;
    lastIncrementalUpdate: Date | null;
    nodeTimestamps: Map<string, Date>;
    edgeTimestamps: Map<string, Date>;
    dependencies: Map<string, string[]>;
}
export interface IncrementalMetrics {
    incrementalUpdates: number;
    fullRebuilds: number;
    avgIncrementalTime: number;
    avgFullRebuildTime: number;
    cacheHitRate: number;
    changeDetectionTime: number;
    deltaComputationTime: number;
    conflictResolutions: number;
}
/**
 * Incremental Knowledge Graph Implementation
 *
 * Provides high-performance incremental updates to the knowledge graph
 * while maintaining data consistency and accuracy.
 */
export declare class IncrementalKnowledgeGraph extends CodeKnowledgeGraph {
    private changeTracker;
    private gitTracker;
    private fileWatchers;
    private incrementalConfig;
    private metrics;
    private updateQueue;
    private processingUpdate;
    constructor(aiClient: any, projectContext: ProjectContext, config?: Partial<GraphConfig>);
    /**
     * Initialize the incremental knowledge graph
     */
    initialize(): Promise<void>;
    /**
     * Establish baseline for incremental updates
     */
    private establishBaseline;
    /**
     * Set up file system watchers for real-time updates
     */
    private setupFileWatchers;
    /**
     * Handle file system change events
     */
    private handleFileChange;
    /**
     * Queue file change for batch processing
     */
    private queueFileChange;
    /**
     * Process queued file changes
     */
    private processUpdateQueue;
    /**
     * Detect changes since last update
     */
    detectChanges(): Promise<FileChange[]>;
    /**
     * Perform incremental indexing based on file changes
     */
    indexDelta(changes: FileChange[]): Promise<IncrementalUpdateResult>;
    /**
     * Process a single file change
     */
    private processFileChange;
    /**
     * Add nodes for a new file
     */
    private addFileNodes;
    /**
     * Update nodes for a modified file
     */
    private updateFileNodes;
    /**
     * Remove nodes for a deleted file
     */
    private removeFileNodes;
    /**
     * Get nodes affected by file changes
     */
    getAffectedNodes(changedFiles: string[]): Promise<string[]>;
    /**
     * Invalidate cache entries based on affected files
     */
    invalidateCache(affectedFiles: string[]): Promise<string[]>;
    /**
     * Update dependency mapping
     */
    private updateDependencies;
    /**
     * Extract file dependencies from content
     */
    private extractFileDependencies;
    /**
     * Build dependency map for all files
     */
    private buildDependencyMap;
    /**
     * Determine if we should fallback to full rebuild
     */
    private shouldFallbackToFullRebuild;
    /**
     * Detect if changes are structural (affecting graph schema)
     */
    private detectStructuralChanges;
    /**
     * Check for configuration file changes
     */
    private hasConfigurationChanges;
    /**
     * Rebuild the entire graph
     */
    private rebuildGraph;
    /**
     * Compute file content hash
     */
    private computeFileHash;
    /**
     * Check if file is relevant for indexing
     */
    private isRelevantFile;
    /**
     * Get incremental update metrics
     */
    getIncrementalMetrics(): IncrementalMetrics;
    /**
     * Force full rebuild
     */
    forceFullRebuild(): Promise<void>;
    /**
     * Internal methods to access base class functionality
     */
    private indexFileInternal;
    private indexFileElementsInternal;
    private buildSimpleFileRelationships;
    private extractClassesInternal;
    private extractFunctionsInternal;
    private extractVariablesInternal;
    private extractInterfacesInternal;
    private generateIdInternal;
    private getLineNumberInternal;
    /**
     * Set up git integration for change tracking
     */
    private setupGitIntegration;
    /**
     * Get changes from git if available, fallback to file system scanning
     */
    getChangesSinceLastUpdate(): Promise<FileChange[]>;
    /**
     * Enhanced change detection with git awareness
     */
    performIncrementalUpdate(forceFullRebuild?: boolean): Promise<IncrementalUpdateResult>;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
