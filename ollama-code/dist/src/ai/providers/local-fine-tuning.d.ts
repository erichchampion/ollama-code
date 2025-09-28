/**
 * Local Model Fine-Tuning Integration
 *
 * Provides capabilities for fine-tuning local AI models with custom datasets
 * for domain-specific code understanding and generation.
 */
import { EventEmitter } from 'events';
import { BaseAIProvider, AIModel, ProviderConfig, AICapability } from './base-provider.js';
export interface FineTuningDataset {
    id: string;
    name: string;
    description: string;
    type: 'code_completion' | 'code_analysis' | 'documentation' | 'general';
    format: 'jsonl' | 'csv' | 'parquet';
    filePath: string;
    size: number;
    samples: number;
    createdAt: Date;
    lastModified: Date;
    metadata: {
        language?: string;
        framework?: string;
        domain?: string;
        quality?: 'high' | 'medium' | 'low';
        validated: boolean;
    };
}
export interface FineTuningJob {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    baseModel: string;
    dataset: FineTuningDataset;
    config: FineTuningConfig;
    progress: {
        currentEpoch: number;
        totalEpochs: number;
        loss: number;
        accuracy?: number;
        validationLoss?: number;
        estimatedTimeRemaining?: number;
    };
    results?: {
        finalLoss: number;
        accuracy: number;
        perplexity?: number;
        bleuScore?: number;
        customMetrics?: Record<string, number>;
    };
    outputModel: {
        path?: string;
        size?: number;
        quantization?: string;
    };
    logs: string[];
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}
export interface FineTuningConfig {
    epochs: number;
    learningRate: number;
    batchSize: number;
    validationSplit: number;
    maxSequenceLength: number;
    temperature: number;
    dropout?: number;
    gradientClipping?: number;
    weightDecay?: number;
    warmupSteps?: number;
    saveSteps?: number;
    evaluationSteps?: number;
    earlyStopping?: {
        enabled: boolean;
        patience: number;
        minDelta: number;
    };
    quantization?: {
        enabled: boolean;
        type: 'int8' | 'int4' | 'float16';
    };
    lora?: {
        enabled: boolean;
        rank: number;
        alpha: number;
        dropout: number;
    };
}
export interface ModelDeployment {
    id: string;
    name: string;
    modelPath: string;
    status: 'deployed' | 'deploying' | 'stopped' | 'error';
    endpoint?: string;
    port?: number;
    resources: {
        memoryUsage: number;
        cpuUsage: number;
        gpuUsage?: number;
    };
    performance: {
        requestsPerSecond: number;
        averageLatency: number;
        throughput: number;
    };
    createdAt: Date;
    lastAccessed?: Date;
}
export declare class LocalFineTuningManager extends EventEmitter {
    private datasets;
    private jobs;
    private deployments;
    private workspaceDir;
    private modelsDir;
    private datasetsDir;
    private runningJobs;
    constructor(workspaceDir?: string);
    /**
     * Initialize the fine-tuning workspace
     */
    initialize(): Promise<void>;
    /**
     * Create a new dataset from files
     */
    createDataset(name: string, description: string, type: FineTuningDataset['type'], sourceFiles: string[], options?: {
        language?: string;
        framework?: string;
        domain?: string;
        format?: 'jsonl' | 'csv' | 'parquet';
        validateQuality?: boolean;
    }): Promise<FineTuningDataset>;
    /**
     * Start a fine-tuning job
     */
    startFineTuning(name: string, baseModel: string, datasetId: string, config?: Partial<FineTuningConfig>): Promise<FineTuningJob>;
    /**
     * Monitor a fine-tuning job
     */
    getJob(jobId: string): FineTuningJob | undefined;
    /**
     * List all jobs
     */
    listJobs(): FineTuningJob[];
    /**
     * Cancel a running job
     */
    cancelJob(jobId: string): Promise<void>;
    /**
     * Deploy a fine-tuned model
     */
    deployModel(name: string, modelPath: string, options?: {
        port?: number;
        resources?: {
            maxMemory?: number;
            maxCpu?: number;
            useGpu?: boolean;
        };
    }): Promise<ModelDeployment>;
    /**
     * List all datasets
     */
    listDatasets(): FineTuningDataset[];
    /**
     * List all deployments
     */
    listDeployments(): ModelDeployment[];
    /**
     * Get deployment status
     */
    getDeployment(deploymentId: string): ModelDeployment | undefined;
    /**
     * Stop a model deployment
     */
    stopDeployment(deploymentId: string): Promise<void>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Private methods
     */
    private ensureDirectories;
    private loadExistingAssets;
    private processSourceFiles;
    private extractCodeCompletionSamples;
    private extractCodeAnalysisSamples;
    private extractDocumentationSamples;
    private extractGeneralSamples;
    private analyzeCodeComplexity;
    private detectConfigType;
    private analyzeConfigPurpose;
    private extractTestPatterns;
    private detectTestFramework;
    private inferModulePurpose;
    private validateDatasetQuality;
    private saveDataset;
    private getFileSize;
    private mergeWithDefaults;
    private executeFineTuning;
    private startModelServer;
    private findAvailablePort;
    private detectLanguage;
}
/**
 * Custom Local Provider for fine-tuned models
 */
export declare class CustomLocalProvider extends BaseAIProvider {
    private fineTuningManager;
    private currentDeployment?;
    constructor(config: ProviderConfig & {
        workspaceDir?: string;
    });
    getName(): string;
    getDisplayName(): string;
    getCapabilities(): {
        maxContextWindow: number;
        supportedCapabilities: AICapability[];
        rateLimits: {
            requestsPerMinute: number;
            tokensPerMinute: number;
        };
        features: {
            streaming: boolean;
            functionCalling: boolean;
            imageInput: boolean;
            documentInput: boolean;
            customInstructions: boolean;
        };
    };
    initialize(): Promise<void>;
    testConnection(): Promise<boolean>;
    complete(prompt: string | any[], options?: any): Promise<any>;
    completeStream(prompt: string | any[], options: any, onEvent: any, abortSignal?: AbortSignal): Promise<void>;
    listModels(): Promise<AIModel[]>;
    getModel(modelId: string): Promise<AIModel | null>;
    calculateCost(promptTokens: number, completionTokens: number, model?: string): number;
    /**
     * Get fine-tuning manager for advanced operations
     */
    getFineTuningManager(): LocalFineTuningManager;
    /**
     * Set active deployment
     */
    setActiveDeployment(deploymentId: string): void;
}
