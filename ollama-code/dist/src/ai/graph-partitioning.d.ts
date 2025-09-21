/**
 * Graph Partitioning System
 *
 * Implements intelligent graph partitioning for memory optimization and scalability.
 * Provides strategies for dividing large knowledge graphs into smaller, manageable
 * partitions that can be loaded and unloaded on demand.
 *
 * Features:
 * - Module-based partitioning strategy
 * - Lazy loading and eviction policies
 * - Cross-partition relationship handling
 * - Memory pressure detection and response
 * - Partition size monitoring and auto-splitting
 */
import { GraphNode, GraphEdge, CodePattern } from './code-knowledge-graph.js';
import { ProjectContext } from './context.js';
export interface GraphPartition {
    id: string;
    name: string;
    type: PartitionType;
    nodes: Map<string, GraphNode>;
    edges: Map<string, GraphEdge>;
    patterns: Map<string, CodePattern>;
    metadata: PartitionMetadata;
    crossRefs: CrossPartitionReference[];
    loadState: 'unloaded' | 'loading' | 'loaded' | 'evicting';
}
export interface PartitionMetadata {
    created: Date;
    lastAccessed: Date;
    lastModified: Date;
    accessCount: number;
    memorySize: number;
    nodeCount: number;
    edgeCount: number;
    priority: number;
    dependencies: string[];
}
export interface CrossPartitionReference {
    sourcePartition: string;
    targetPartition: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: string;
    weight: number;
}
export interface PartitionStrategy {
    type: PartitionType;
    maxNodesPerPartition: number;
    maxEdgesPerPartition: number;
    maxMemoryPerPartition: number;
    partitioningCriteria: PartitioningCriteria;
}
export interface PartitioningCriteria {
    groupByModule: boolean;
    groupByFileType: boolean;
    groupByDirectory: boolean;
    respectDependencies: boolean;
    minimizeCrossRefs: boolean;
}
export type PartitionType = 'module_based' | 'directory_based' | 'filetype_based' | 'size_based' | 'dependency_based' | 'temporal_based';
export interface PartitioningResult {
    partitions: GraphPartition[];
    crossRefs: CrossPartitionReference[];
    statistics: {
        totalPartitions: number;
        avgNodesPerPartition: number;
        avgEdgesPerPartition: number;
        crossPartitionEdges: number;
        partitioningTime: number;
        memoryReduction: number;
    };
}
export interface MemoryManager {
    maxMemoryUsage: number;
    currentMemoryUsage: number;
    loadedPartitions: Set<string>;
    evictionPolicy: EvictionPolicy;
    memoryPressureThreshold: number;
}
export type EvictionPolicy = 'lru' | 'lfu' | 'priority' | 'size_based' | 'hybrid';
/**
 * Graph Partitioning Manager
 *
 * Manages the partitioning, loading, and eviction of graph partitions
 * for optimal memory usage and performance.
 */
export declare class GraphPartitionManager {
    private partitions;
    private partitionIndex;
    private crossRefs;
    private memoryManager;
    private strategy;
    private projectContext;
    private accessOrder;
    private accessCounter;
    constructor(projectContext: ProjectContext, strategy?: Partial<PartitionStrategy>, memoryConfig?: Partial<MemoryManager>);
    /**
     * Partition a set of nodes and edges based on the configured strategy
     */
    partitionGraph(nodes: Map<string, GraphNode>, edges: Map<string, GraphEdge>, patterns: Map<string, CodePattern>): Promise<PartitioningResult>;
    /**
     * Partition nodes by module/package structure
     */
    private partitionByModule;
    /**
     * Partition nodes by directory structure
     */
    private partitionByDirectory;
    /**
     * Partition nodes by file type
     */
    private partitionByFileType;
    /**
     * Partition nodes by size constraints
     */
    private partitionBySize;
    /**
     * Partition nodes by dependency clusters
     */
    private partitionByDependencies;
    /**
     * Create a single partition from a group of nodes
     */
    private createPartition;
    /**
     * Finalize partitioning by calculating cross-references and statistics
     */
    private finalizePartitioning;
    /**
     * Load a partition into memory
     */
    loadPartition(partitionId: string): Promise<boolean>;
    /**
     * Evict partitions to free memory
     */
    evictPartitions(): Promise<number>;
    /**
     * Get a node from any partition, loading the partition if necessary
     */
    getNode(nodeId: string): Promise<GraphNode | null>;
    /**
     * Get all nodes from a partition
     */
    getPartitionNodes(partitionId: string): Promise<GraphNode[]>;
    /**
     * Get cross-partition references for a partition
     */
    getCrossReferences(partitionId: string): CrossPartitionReference[];
    /**
     * Get memory usage statistics
     */
    getMemoryStats(): {
        current: number;
        max: number;
        usage: number;
        loadedPartitions: number;
        totalPartitions: number;
    };
    /**
     * Helper methods
     */
    private extractModuleName;
    private extractDirectory;
    private extractFileType;
    private findDependencyClusters;
    private dfsCluster;
    private getNodePartition;
    private estimatePartitionMemorySize;
    private calculateMemoryReduction;
    private updateAccessTracking;
    private isMemoryPressureHigh;
    private selectPartitionsForEviction;
    private calculateEvictionPriority;
    private storeCrossReferences;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
