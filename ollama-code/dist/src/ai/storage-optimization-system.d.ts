/**
 * Storage Optimization System for Knowledge Graph Performance
 *
 * Provides enterprise-grade storage optimization capabilities:
 * - Compressed storage for inactive graph partitions
 * - Efficient serialization/deserialization for persistence
 * - Disk-based cache management for large partitions
 * - Memory-mapped file support for ultra-large graphs
 * - Intelligent partition size monitoring and automatic splitting
 * - Background compression and optimization processes
 */
import { ManagedEventEmitter } from '../utils/managed-event-emitter.js';
export interface StorageConfiguration {
    storageDir: string;
    compressionLevel: number;
    cacheMaxSize: number;
    partitionMaxSize: number;
    compressionThreshold: number;
    memoryMapThreshold: number;
    cleanupInterval: number;
    persistenceStrategy: 'immediate' | 'batched' | 'lazy';
}
export interface PartitionMetrics {
    id: string;
    size: number;
    compressedSize?: number;
    lastAccessed: number;
    lastModified: number;
    accessCount: number;
    compressionRatio?: number;
    isMemoryMapped: boolean;
    isDiskCached: boolean;
    isCompressed: boolean;
}
export interface StorageStats {
    totalPartitions: number;
    totalSize: number;
    compressedPartitions: number;
    totalCompressedSize: number;
    cacheHitRate: number;
    averageCompressionRatio: number;
    memoryMappedPartitions: number;
    diskCachedPartitions: number;
}
export interface CompressionOptions {
    algorithm: 'gzip' | 'deflate' | 'brotli';
    level: number;
    chunkSize: number;
}
export interface PartitionSplitResult {
    originalId: string;
    newPartitions: string[];
    splitStrategy: 'size' | 'content' | 'access_pattern';
    splitRatio: number;
}
/**
 * Storage optimization engine for graph partitions
 */
export declare class StorageOptimizationSystem extends ManagedEventEmitter {
    private config;
    private partitionCache;
    private partitionMetrics;
    private diskCache;
    private memoryMappedFiles;
    private compressionJobs;
    private accessStats;
    private cleanupTimer?;
    constructor(config?: Partial<StorageConfiguration>);
    /**
     * Initialize storage directories and metadata
     */
    private initializeStorageSystem;
    /**
     * Store partition data with automatic optimization
     */
    storePartition(partitionId: string, data: any): Promise<void>;
    /**
     * Retrieve partition data with caching and decompression
     */
    retrievePartition(partitionId: string): Promise<any>;
    /**
     * Compress and store partition data
     */
    private compressAndStorePartition;
    /**
     * Decompress and load partition data
     */
    private decompressAndLoad;
    /**
     * Create memory-mapped file for large partitions
     */
    private createMemoryMappedFile;
    /**
     * Store to disk cache for medium-sized partitions
     */
    private storeToDiskCache;
    /**
     * Schedule partition splitting for oversized partitions
     */
    private schedulePartitionSplit;
    /**
     * Serialize partition data for storage
     */
    private serializePartition;
    /**
     * Deserialize partition data from storage
     */
    private deserializePartition;
    /**
     * Compress data using configured algorithm
     */
    private compressData;
    /**
     * Decompress data
     */
    private decompressData;
    /**
     * Perform cache cleanup to maintain size limits
     */
    private performCacheCleanup;
    /**
     * Evict least recently used partitions from cache
     */
    private evictLeastUsedPartitions;
    /**
     * Split oversized partition into smaller chunks
     */
    private splitPartition;
    /**
     * Extract data for a specific partition split
     */
    private extractPartitionData;
    /**
     * Update partition metrics
     */
    private updatePartitionMetrics;
    /**
     * Update partition access statistics
     */
    private updatePartitionAccess;
    /**
     * Update cache access statistics
     */
    private updateAccessStats;
    /**
     * Calculate current cache size
     */
    private calculateCacheSize;
    /**
     * Determine storage strategy based on data size
     */
    private getStorageStrategy;
    /**
     * Get file paths for different storage types
     */
    private getCompressedPath;
    private getDiskCachePath;
    private getMemoryMappedPath;
    private getMetricsPath;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Load partition metrics from disk
     */
    private loadPartitionMetrics;
    /**
     * Save partition metrics to disk
     */
    private savePartitionMetrics;
    /**
     * Start background processes
     */
    private startBackgroundProcesses;
    /**
     * Stop background processes
     */
    private stopBackgroundProcesses;
    /**
     * Get storage statistics
     */
    getStorageStats(): StorageStats;
    /**
     * Remove partition from all storage layers
     */
    removePartition(partitionId: string): Promise<void>;
    /**
     * Shutdown storage system
     */
    shutdown(): Promise<void>;
}
