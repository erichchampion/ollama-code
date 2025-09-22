import { EventEmitter } from 'events';
/**
 * Partition-Based Query Engine for Enterprise Codebases
 *
 * Handles massive codebases (>10M lines) through intelligent partitioning:
 * - Semantic code partitioning by domain/module
 * - Distributed query execution across partitions
 * - Parallel processing with intelligent load balancing
 * - Cross-partition relationship mapping
 * - Enterprise-scale optimization strategies
 */
export interface CodePartition {
    id: string;
    name: string;
    type: PartitionType;
    rootPaths: string[];
    fileCount: number;
    lineCount: number;
    languages: string[];
    dependencies: string[];
    lastModified: number;
    metadata: PartitionMetadata;
}
export declare enum PartitionType {
    DOMAIN = "domain",// Business domain (user, payment, etc.)
    LAYER = "layer",// Architecture layer (ui, service, data)
    LANGUAGE = "language",// Programming language
    FRAMEWORK = "framework",// Technology stack
    MODULE = "module",// Logical module/package
    MICROSERVICE = "microservice",// Service boundary
    CUSTOM = "custom"
}
export interface PartitionMetadata {
    complexity: number;
    maintainability: number;
    testCoverage: number;
    securityRisk: number;
    performanceProfile: PerformanceProfile;
    architecturalPatterns: string[];
    keyComponents: ComponentInfo[];
}
export interface PerformanceProfile {
    queryComplexity: 'low' | 'medium' | 'high' | 'extreme';
    indexSize: number;
    averageQueryTime: number;
    memoryFootprint: number;
}
export interface ComponentInfo {
    name: string;
    type: 'class' | 'function' | 'interface' | 'module';
    importance: number;
    relationships: number;
}
export interface QueryRequest {
    queryId: string;
    query: string;
    scope: QueryScope;
    filters: QueryFilter[];
    optimization: QueryOptimization;
    timeout: number;
}
export interface QueryScope {
    partitions?: string[];
    filePatterns?: string[];
    languages?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    priority: 'low' | 'normal' | 'high' | 'critical';
}
export interface QueryFilter {
    type: 'include' | 'exclude';
    field: string;
    operator: 'equals' | 'contains' | 'regex' | 'gt' | 'lt';
    value: any;
}
export interface QueryOptimization {
    useCache: boolean;
    parallelism: number;
    strategy: 'breadth_first' | 'depth_first' | 'priority_based' | 'adaptive';
    resourceLimits: ResourceLimits;
}
export interface ResourceLimits {
    maxMemoryMB: number;
    maxConcurrentQueries: number;
    maxExecutionTime: number;
    cpuThrottling: boolean;
}
export interface PartitionQueryResult {
    partitionId: string;
    results: any[];
    executionTime: number;
    resourceUsage: ResourceUsage;
    cacheHit: boolean;
    errorCount: number;
}
export interface ResourceUsage {
    memoryUsed: number;
    cpuTime: number;
    diskReads: number;
    networkRequests: number;
}
export interface QueryExecutionPlan {
    queryId: string;
    phases: ExecutionPhase[];
    estimatedTime: number;
    resourceRequirements: ResourceLimits;
    optimization: OptimizationStrategy;
}
export interface ExecutionPhase {
    phase: number;
    partitions: string[];
    parallelism: number;
    dependencies: number[];
    estimatedDuration: number;
}
export interface OptimizationStrategy {
    partitioningStrategy: string;
    cacheStrategy: string;
    parallelismLevel: number;
    resourceAllocation: ResourceAllocation;
}
export interface ResourceAllocation {
    memoryPerPartition: number;
    cpuCoresPerPartition: number;
    diskIOPriority: 'low' | 'normal' | 'high';
}
/**
 * Main partition-based query engine
 */
export declare class PartitionQueryEngine extends EventEmitter {
    private partitions;
    private partitionIndex;
    private queryCache;
    private performanceMonitor;
    private activeQueries;
    private resourceMonitor;
    constructor();
    /**
     * Initialize default partitioning strategies
     */
    private initializeDefaultPartitions;
    private createDefaultPartitions;
    /**
     * Analyze codebase and create intelligent partitions
     */
    analyzeAndPartition(rootPath: string, strategy?: PartitioningStrategy): Promise<PartitionAnalysisResult>;
    private discoverCodeStructure;
    private createIntelligentPartitions;
    private createSemanticPartitions;
    private createSizeBasedPartitions;
    private createDependencyPartitions;
    private buildPartitionIndex;
    private optimizePartitionBoundaries;
    private optimizePartition;
    private analyzePartitionPerformance;
    /**
     * Execute query across relevant partitions
     */
    executeQuery(request: QueryRequest): Promise<QueryResult>;
    private createExecutionPlan;
    private selectRelevantPartitions;
    private isPartitionRelevant;
    private applyPartitionFilter;
    private createExecutionPhases;
    private groupPartitionsByComplexity;
    private estimateResourceRequirements;
    private selectOptimizationStrategy;
    private mergePartitionResults;
    private calculateTotalResourceUsage;
    private generateQueryId;
    /**
     * Get partition statistics
     */
    getPartitionStats(): PartitionStats;
    private getPartitionTypeDistribution;
    private getAggregatePerformanceMetrics;
    private getComplexityDistribution;
}
interface PartitioningStrategy {
    maxPartitionSize?: number;
    minPartitionSize?: number;
    strategy?: 'semantic' | 'size' | 'dependency' | 'hybrid';
    customRules?: PartitionRule[];
}
interface PartitionRule {
    pattern: string;
    partitionType: PartitionType;
    priority: number;
}
interface PartitionAnalysisResult {
    totalFiles: number;
    totalLines: number;
    partitionCount: number;
    analysisTime: number;
    partitions: string[];
    optimization: {
        memoryReduction: number;
        querySpeedup: number;
        cacheEfficiency: number;
    };
}
interface QueryResult {
    queryId: string;
    results: any[];
    executionTime: number;
    partitionsQueried: string[];
    cacheHitRatio: number;
    resourceUsage: ResourceUsage;
    optimization: OptimizationStrategy;
}
interface PartitionStats {
    totalPartitions: number;
    totalFiles: number;
    totalLines: number;
    averagePartitionSize: number;
    partitionTypes: Record<string, number>;
    performanceMetrics: AggregateMetrics;
}
interface AggregateMetrics {
    averageQueryTime: number;
    totalMemoryFootprint: number;
    complexityDistribution: Record<string, number>;
}
export {};
