/**
 * Distributed Analyzer
 *
 * Implements distributed processing for large codebases to achieve 10x performance improvements
 * through parallel analysis, intelligent chunking, and optimized result merging.
 *
 * Features:
 * - Parallel file chunk analysis with worker threads
 * - Intelligent chunking based on dependencies and file size
 * - Memory-efficient result streaming and merging
 * - Performance monitoring and adaptive load balancing
 * - Error handling and retry mechanisms for failed chunks
 */
import { EventEmitter } from 'events';
import { GraphNode, GraphEdge } from './code-knowledge-graph.js';
import { ProjectContext } from './context.js';
import { DistributedAnalysisConfig } from '../config/performance.js';
export interface FileChunk {
    id: string;
    files: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedComplexity: number;
    dependencies: string[];
    totalSize: number;
}
export interface AnalysisResult {
    chunkId: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    patterns: AnalysisPattern[];
    metrics: ChunkMetrics;
    errors: AnalysisError[];
    processingTime: number;
}
export interface CombinedResult {
    totalNodes: number;
    totalEdges: number;
    totalPatterns: number;
    processingTime: number;
    memoryUsage: number;
    parallelEfficiency: number;
    errors: AnalysisError[];
    mergeConflicts: MergeConflict[];
}
export interface AnalysisPattern {
    type: 'function' | 'class' | 'module' | 'dependency' | 'architecture';
    name: string;
    confidence: number;
    properties: Record<string, any>;
    location: FileLocation;
}
export interface ChunkMetrics {
    filesProcessed: number;
    linesAnalyzed: number;
    complexityScore: number;
    memoryUsed: number;
    cpuTime: number;
    ioTime: number;
}
export interface AnalysisError {
    type: 'parse_error' | 'memory_error' | 'timeout_error' | 'dependency_error';
    file: string;
    line?: number;
    column?: number;
    message: string;
    recoverable: boolean;
}
export interface MergeConflict {
    type: 'node_conflict' | 'edge_conflict' | 'pattern_conflict';
    entityId: string;
    conflictingChunks: string[];
    resolution: 'merged' | 'skipped' | 'manual_required';
    reason: string;
}
export interface FileLocation {
    file: string;
    startLine: number;
    endLine: number;
    startColumn?: number;
    endColumn?: number;
}
export type DistributedConfig = DistributedAnalysisConfig;
/**
 * Distributed Analyzer for parallel codebase processing
 */
export declare class DistributedAnalyzer extends EventEmitter {
    private config;
    private workers;
    private activeJobs;
    private completedChunks;
    private failedChunks;
    private performanceMetrics;
    constructor(config?: Partial<DistributedConfig>);
    /**
     * Analyze files in parallel chunks
     */
    analyzeInParallel(chunks: FileChunk[]): Promise<AnalysisResult[]>;
    /**
     * Merge analysis results into a combined result
     */
    mergeResults(results: AnalysisResult[]): Promise<CombinedResult>;
    /**
     * Create intelligent file chunks based on dependencies and complexity
     */
    createIntelligentChunks(files: string[], projectContext: ProjectContext): Promise<FileChunk[]>;
    private initializeWorkers;
    private createWorker;
    private prioritizeChunks;
    private processChunksInParallel;
    private assignChunkToWorker;
    private handleWorkerMessage;
    private handleChunkComplete;
    private handleChunkError;
    private handleProgressUpdate;
    private findWorkerForChunk;
    private findAvailableWorker;
    private setupMessageHandlers;
    private resolveNodeConflict;
    private resolveEdgeConflict;
    private createNextChunk;
    private analyzeDependencies;
    private estimateFileComplexity;
    private determinePriority;
    private optimizeChunkDistribution;
    private updatePerformanceMetrics;
    private cleanup;
}
