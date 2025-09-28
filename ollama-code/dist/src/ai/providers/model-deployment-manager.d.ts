/**
 * Custom Model Deployment and Management System
 *
 * Provides comprehensive management for deploying, scaling, and monitoring
 * custom AI models in production environments with health checks and resource management.
 */
import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';
import { ModelDeployment } from './local-fine-tuning.js';
export interface DeploymentConfig {
    name: string;
    modelPath: string;
    modelType: 'ollama' | 'huggingface' | 'onnx' | 'tensorrt' | 'custom';
    runtime: 'cpu' | 'gpu' | 'auto';
    resources: {
        maxMemoryMB: number;
        maxCpuCores: number;
        gpuDevices?: number[];
        diskSpaceGB: number;
    };
    scaling: {
        minInstances: number;
        maxInstances: number;
        targetConcurrency: number;
        scaleUpThreshold: number;
        scaleDownThreshold: number;
    };
    networking: {
        port?: number;
        host?: string;
        ssl?: {
            enabled: boolean;
            certPath?: string;
            keyPath?: string;
        };
        cors?: {
            enabled: boolean;
            origins?: string[];
        };
    };
    health: {
        checkInterval: number;
        timeout: number;
        retries: number;
        warmupTime: number;
    };
    monitoring: {
        metricsEnabled: boolean;
        loggingLevel: 'debug' | 'info' | 'warn' | 'error';
        retentionDays: number;
    };
}
export interface DeploymentInstance {
    id: string;
    deploymentId: string;
    pid?: number;
    port: number;
    status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
    startedAt?: Date;
    lastHealthCheck?: Date;
    healthStatus: 'healthy' | 'unhealthy' | 'unknown';
    resources: {
        memoryUsageMB: number;
        cpuUsagePercent: number;
        gpuUsagePercent?: number;
    };
    performance: {
        requestCount: number;
        averageLatency: number;
        errorRate: number;
        throughput: number;
    };
    logs: string[];
    process?: ChildProcess;
}
export interface LoadBalancer {
    id: string;
    deploymentId: string;
    strategy: 'round_robin' | 'least_connections' | 'weighted' | 'random';
    instances: string[];
    currentIndex: number;
    weights?: Map<string, number>;
    healthyInstances: Set<string>;
}
export interface ModelRegistry {
    models: Map<string, ModelRegistryEntry>;
    deployments: Map<string, ModelDeployment>;
    instances: Map<string, DeploymentInstance>;
    loadBalancers: Map<string, LoadBalancer>;
}
export interface ModelRegistryEntry {
    id: string;
    name: string;
    version: string;
    type: DeploymentConfig['modelType'];
    path: string;
    size: number;
    checksum: string;
    metadata: {
        description?: string;
        author?: string;
        license?: string;
        tags?: string[];
        capabilities?: string[];
    };
    createdAt: Date;
    lastAccessed?: Date;
    downloadCount: number;
    deploymentCount: number;
}
export declare class ModelDeploymentManager extends EventEmitter {
    private registry;
    private workspaceDir;
    private modelsDir;
    private logsDir;
    private healthCheckIntervals;
    private portAllocator;
    constructor(workspaceDir?: string);
    /**
     * Initialize the deployment manager
     */
    initialize(): Promise<void>;
    /**
     * Register a new model in the registry
     */
    registerModel(name: string, version: string, type: DeploymentConfig['modelType'], modelPath: string, metadata?: ModelRegistryEntry['metadata']): Promise<ModelRegistryEntry>;
    /**
     * Deploy a registered model
     */
    deployModel(modelId: string, config: Partial<DeploymentConfig>): Promise<ModelDeployment>;
    /**
     * Scale a deployment up or down
     */
    scaleDeployment(deploymentId: string, targetInstances: number): Promise<void>;
    /**
     * Start a new instance of a deployment
     */
    startInstance(deploymentId: string): Promise<DeploymentInstance>;
    /**
     * Stop an instance
     */
    stopInstance(instanceId: string): Promise<void>;
    /**
     * Get deployment status
     */
    getDeployment(deploymentId: string): ModelDeployment | undefined;
    /**
     * List all deployments
     */
    listDeployments(): ModelDeployment[];
    /**
     * Get instances for a deployment
     */
    getInstances(deploymentId: string): DeploymentInstance[];
    /**
     * Get load balancer for a deployment
     */
    getLoadBalancer(deploymentId: string): LoadBalancer | undefined;
    /**
     * Route request to healthy instance
     */
    routeRequest(deploymentId: string): DeploymentInstance | null;
    /**
     * Update instance metrics
     */
    updateInstanceMetrics(instanceId: string, metrics: Partial<DeploymentInstance['performance']>): void;
    /**
     * Cleanup all resources
     */
    cleanup(): Promise<void>;
    /**
     * Private methods
     */
    private ensureDirectories;
    private loadRegistry;
    private saveRegistry;
    private recoverDeployments;
    private calculateChecksum;
    private mergeWithDefaults;
    private createLoadBalancer;
    private startModelProcess;
    private startHealthMonitoring;
    private checkInstanceHealth;
    private selectLeastConnectedInstance;
    private selectWeightedInstance;
}
