/**
 * Performance Benchmarking Infrastructure
 *
 * Provides comprehensive performance monitoring and benchmarking for the
 * ollama-code AI system, including knowledge graph operations, query processing,
 * and memory usage tracking.
 */
export interface BenchmarkResult {
    name: string;
    category: 'indexing' | 'query' | 'memory' | 'startup' | 'incremental';
    duration: number;
    memoryUsed: number;
    cpuUsage: number;
    timestamp: Date;
    metadata: Record<string, any>;
    success: boolean;
    error?: string;
}
export interface BenchmarkSuite {
    name: string;
    description: string;
    results: BenchmarkResult[];
    totalDuration: number;
    averageMemory: number;
    successRate: number;
    timestamp: Date;
}
export interface SystemMetrics {
    totalMemory: number;
    freeMemory: number;
    cpuCount: number;
    cpuUsage: number[];
    nodeVersion: string;
    platform: string;
    arch: string;
}
export interface PerformanceTarget {
    name: string;
    category: string;
    maxDuration: number;
    maxMemory: number;
    minSuccessRate: number;
}
/**
 * Performance benchmarking and monitoring system
 */
export declare class PerformanceBenchmark {
    private results;
    private suites;
    private activeTimers;
    private targets;
    constructor();
    /**
     * Initialize performance targets for different operations
     */
    private initializeTargets;
    /**
     * Start timing a benchmark operation
     */
    startTimer(operationName: string): void;
    /**
     * End timing and record benchmark result
     */
    endTimer(operationName: string, category: BenchmarkResult['category'], metadata?: Record<string, any>, success?: boolean, error?: string): BenchmarkResult;
    /**
     * Run a benchmark function and measure its performance
     */
    benchmark<T>(operationName: string, category: BenchmarkResult['category'], operation: () => Promise<T> | T, metadata?: Record<string, any>): Promise<{
        result: T;
        benchmark: BenchmarkResult;
    }>;
    /**
     * Run a suite of benchmarks
     */
    runSuite(suiteName: string, description: string, benchmarks: Array<{
        name: string;
        category: BenchmarkResult['category'];
        operation: () => Promise<any> | any;
        metadata?: Record<string, any>;
    }>): Promise<BenchmarkSuite>;
    /**
     * Check if results meet performance targets
     */
    checkPerformanceTargets(results: BenchmarkResult[]): {
        passed: boolean;
        failures: Array<{
            result: BenchmarkResult;
            target: PerformanceTarget;
            reason: string;
        }>;
    };
    /**
     * Get current system metrics
     */
    getSystemMetrics(): SystemMetrics;
    /**
     * Generate performance report
     */
    generateReport(includeSystemInfo?: boolean): {
        summary: {
            totalBenchmarks: number;
            totalSuites: number;
            averageDuration: number;
            averageMemory: number;
            overallSuccessRate: number;
        };
        targetCompliance: {
            passed: boolean;
            failures: Array<{
                result: BenchmarkResult;
                target: PerformanceTarget;
                reason: string;
            }>;
        };
        recentResults: BenchmarkResult[];
        systemMetrics?: SystemMetrics;
    };
    /**
     * Export benchmark data to file
     */
    exportResults(filePath: string): Promise<void>;
    /**
     * Clear all benchmark data
     */
    clear(): void;
    /**
     * Get CPU usage percentage (simplified)
     */
    private getCurrentCpuUsage;
    /**
     * Create benchmark for knowledge graph operations
     */
    benchmarkKnowledgeGraphIndexing(files: string[], indexingFunction: (files: string[]) => Promise<any>): Promise<BenchmarkResult>;
    /**
     * Create benchmark for query operations
     */
    benchmarkQuery(queryName: string, queryFunction: () => Promise<any>, complexity?: 'simple' | 'complex'): Promise<BenchmarkResult>;
    /**
     * Memory usage benchmark
     */
    benchmarkMemoryOperation(operationName: string, operation: () => Promise<any> | any): Promise<BenchmarkResult>;
    /**
     * Startup time benchmark
     */
    benchmarkStartup(startupFunction: () => Promise<any>, type?: 'cold' | 'warm'): Promise<BenchmarkResult>;
}
/**
 * Global benchmark instance
 */
export declare const globalBenchmark: PerformanceBenchmark;
/**
 * Decorator for automatic benchmarking of methods
 */
export declare function Benchmark(category: BenchmarkResult['category'], metadata?: Record<string, any>): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Simple benchmark utility function
 */
export declare function benchmarkFunction<T>(name: string, fn: () => Promise<T> | T, category?: BenchmarkResult['category']): Promise<T>;
