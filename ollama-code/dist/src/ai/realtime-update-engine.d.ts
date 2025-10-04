import { EventEmitter } from 'events';
/**
 * Real-Time Incremental Update Engine
 *
 * Provides real-time updates for large codebases through:
 * - High-performance file system watching
 * - Intelligent change detection and batching
 * - Delta-based knowledge graph updates
 * - Background processing with minimal UI blocking
 * - Conflict resolution and consistency management
 * - Performance optimization for large-scale monitoring
 */
export interface FileChangeEvent {
    id: string;
    type: FileChangeType;
    filePath: string;
    timestamp: number;
    size?: number;
    checksum?: string;
    metadata: FileMetadata;
}
export declare enum FileChangeType {
    CREATED = "created",
    MODIFIED = "modified",
    DELETED = "deleted",
    RENAMED = "renamed",
    MOVED = "moved"
}
export interface FileMetadata {
    language?: string;
    framework?: string;
    module?: string;
    complexity?: number;
    dependencies?: string[];
    imports?: string[];
    exports?: string[];
}
export interface ChangeSet {
    id: string;
    timestamp: number;
    changes: FileChangeEvent[];
    summary: ChangeSummary;
    impact: ChangeImpact;
    conflicts: ChangeConflict[];
}
export interface ChangeSummary {
    totalChanges: number;
    createdFiles: number;
    modifiedFiles: number;
    deletedFiles: number;
    affectedModules: string[];
    estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
}
export interface ChangeImpact {
    knowledgeGraphUpdates: number;
    cacheInvalidations: number;
    indexRebuildRequired: boolean;
    dependentComponents: string[];
    regressionRisk: number;
}
export interface ChangeConflict {
    type: 'concurrent_modification' | 'dependency_broken' | 'syntax_error' | 'import_missing';
    severity: 'warning' | 'error' | 'critical';
    files: string[];
    description: string;
    resolution?: ConflictResolution;
}
export interface ConflictResolution {
    strategy: 'auto_resolve' | 'manual_required' | 'rollback' | 'ignore';
    action: string;
    confidence: number;
}
export interface WatchConfiguration {
    rootPaths: string[];
    includePatterns: string[];
    excludePatterns: string[];
    debounceMs: number;
    batchSize: number;
    enableRecursive: boolean;
    ignoreHidden: boolean;
    watchSymlinks: boolean;
    performanceMode: 'realtime' | 'balanced' | 'resource_efficient';
}
export interface UpdateStrategy {
    mode: 'immediate' | 'batched' | 'scheduled';
    batchWindow: number;
    priority: UpdatePriority;
    backgroundProcessing: boolean;
    conflictHandling: ConflictHandlingStrategy;
}
export declare enum UpdatePriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}
export interface ConflictHandlingStrategy {
    autoResolve: boolean;
    maxRetries: number;
    rollbackOnFailure: boolean;
    notifyOnConflict: boolean;
}
export interface RealtimeStats {
    totalWatchedFiles: number;
    totalWatchedDirectories: number;
    eventsPerSecond: number;
    averageProcessingTime: number;
    queueSize: number;
    errorRate: number;
    memoryUsage: number;
    cacheHitRate: number;
}
/**
 * Main real-time update engine
 */
export declare class RealtimeUpdateEngine extends EventEmitter {
    private watchers;
    private changeQueue;
    private processingQueue;
    private fileChecksums;
    private dependencyGraph;
    private updateCache;
    private config;
    private strategy;
    private isProcessing;
    private stats;
    private conflictResolver;
    constructor(config?: Partial<WatchConfiguration>, strategy?: Partial<UpdateStrategy>);
    private initializeStats;
    private setupProcessing;
    /**
     * Start watching configured paths
     */
    startWatching(): Promise<void>;
    private initializeChecksums;
    private scanDirectoryForChecksums;
    private startPathWatcher;
    private handleFileSystemEvent;
    private createChangeEvent;
    private analyzeFileMetadata;
    private extractImports;
    private extractExports;
    private estimateComplexity;
    private processPendingChanges;
    private createChangeSet;
    private analyzeChangeImpact;
    private getDependentFiles;
    private getCacheInvalidationCount;
    private isStructuralChange;
    private assessRegressionRisk;
    private detectConflicts;
    private createChangeSummary;
    private processChangeSet;
    private handleConflicts;
    private applyUpdates;
    private updateKnowledgeGraph;
    private updateDependencyGraph;
    private invalidateCaches;
    private rebuildIndexes;
    private isExcluded;
    private isIncluded;
    private matchesPattern;
    private calculateFileChecksum;
    private generateChangeId;
    private generateChangeSetId;
    private updateStats;
    /**
     * Stop all file watching
     */
    stopWatching(): Promise<void>;
    /**
     * Get real-time statistics
     */
    getStats(): RealtimeStats;
    /**
     * Get current queue status
     */
    getQueueStatus(): {
        changeQueue: number;
        processingQueue: number;
        isProcessing: boolean;
    };
    /**
     * Force process all pending changes
     */
    flushChanges(): Promise<void>;
}
