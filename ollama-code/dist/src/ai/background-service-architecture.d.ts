/**
 * Background Service Architecture for Enterprise Performance
 *
 * Provides persistent daemon service capabilities:
 * - Long-running background service for immediate response times
 * - Inter-Process Communication (IPC) for seamless CLI integration
 * - Service lifecycle management with health monitoring
 * - Graceful shutdown and restart capabilities
 * - Resource monitoring and automatic optimization
 * - Background processing for expensive operations
 */
import { EventEmitter } from 'events';
export interface ServiceConfiguration {
    serviceName: string;
    pidFile: string;
    logFile: string;
    socketPath: string;
    maxMemoryMB: number;
    maxCpuPercent: number;
    healthCheckInterval: number;
    autoRestart: boolean;
    gracefulShutdownTimeout: number;
    backgroundWorkers: number;
}
export interface ServiceStatus {
    isRunning: boolean;
    pid?: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    lastHealthCheck: number;
    version: string;
    startTime: number;
}
export interface IPCMessage {
    id: string;
    type: IPCMessageType;
    payload: any;
    timestamp: number;
    sender: string;
    recipient: string;
}
export declare enum IPCMessageType {
    QUERY = "query",
    RESPONSE = "response",
    STATUS = "status",
    SHUTDOWN = "shutdown",
    RESTART = "restart",
    HEALTH_CHECK = "health_check",
    ERROR = "error",
    NOTIFICATION = "notification"
}
export interface ServiceHealth {
    status: 'healthy' | 'warning' | 'critical' | 'down';
    checks: HealthCheck[];
    score: number;
    lastCheck: number;
}
export interface HealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
    critical: boolean;
}
export interface BackgroundTask {
    id: string;
    type: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    payload: any;
    created: number;
    started?: number;
    completed?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    result?: any;
    error?: string;
}
/**
 * Main background service daemon
 */
export declare class BackgroundServiceDaemon extends EventEmitter {
    private config;
    private isRunning;
    private startTime;
    private healthTimer?;
    private resourceMonitorTimer?;
    private ipcServer?;
    private backgroundTasks;
    private taskQueue;
    private workers;
    private healthChecks;
    constructor(config?: Partial<ServiceConfiguration>);
    /**
     * Start the background service daemon
     */
    startDaemon(): Promise<void>;
    /**
     * Stop the background service daemon
     */
    stopDaemon(): Promise<void>;
    /**
     * Restart the background service
     */
    restartDaemon(): Promise<void>;
    /**
     * Get current service status
     */
    getServiceStatus(): ServiceStatus;
    /**
     * Submit background task for processing
     */
    submitBackgroundTask(task: Omit<BackgroundTask, 'id' | 'created' | 'status' | 'progress'>): Promise<string>;
    /**
     * Get background task status
     */
    getTaskStatus(taskId: string): BackgroundTask | null;
    /**
     * Initialize service components
     */
    private initializeService;
    /**
     * Check if another service instance is already running
     */
    private checkExistingInstance;
    /**
     * Start IPC server for communication with CLI
     */
    private startIPCServer;
    /**
     * Stop IPC server
     */
    private stopIPCServer;
    /**
     * Start background workers for task processing
     */
    private startBackgroundWorkers;
    /**
     * Stop background workers
     */
    private stopBackgroundWorkers;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Stop health monitoring
     */
    private stopHealthMonitoring;
    /**
     * Start resource monitoring
     */
    private startResourceMonitoring;
    /**
     * Stop resource monitoring
     */
    private stopResourceMonitoring;
    /**
     * Perform comprehensive health check
     */
    private performHealthCheck;
    /**
     * Calculate health score from checks
     */
    private calculateHealthScore;
    /**
     * Monitor resource usage
     */
    private monitorResources;
    /**
     * Process background task queue
     */
    private processTaskQueue;
    /**
     * Complete pending tasks with timeout
     */
    private completePendingTasks;
    /**
     * Setup signal handlers for graceful shutdown
     */
    private setupSignalHandlers;
    /**
     * Write PID file
     */
    private writePidFile;
    /**
     * Cleanup resources
     */
    private cleanup;
    /**
     * Check if process is running
     */
    private isProcessRunning;
    /**
     * Get current CPU usage (simplified)
     */
    private getCurrentCpuUsage;
    /**
     * Get service version
     */
    private getServiceVersion;
    /**
     * Generate unique task ID
     */
    private generateTaskId;
    /**
     * Log message to file and emit event
     */
    private log;
}
/**
 * CLI client for communicating with background service
 */
export declare class BackgroundServiceClient extends EventEmitter {
    private config;
    constructor(config?: Partial<ServiceConfiguration>);
    /**
     * Check if background service is running
     */
    isServiceRunning(): Promise<boolean>;
    /**
     * Get service status
     */
    getServiceStatus(): Promise<ServiceStatus | null>;
    /**
     * Send message to background service
     */
    sendMessage(message: Omit<IPCMessage, 'id' | 'timestamp' | 'sender'>): Promise<any>;
    /**
     * Submit task to background service
     */
    submitTask(task: Omit<BackgroundTask, 'id' | 'created' | 'status' | 'progress'>): Promise<string>;
    /**
     * Get task status from background service
     */
    getTaskStatus(taskId: string): Promise<BackgroundTask | null>;
    private generateMessageId;
}
/**
 * Service manager for controlling daemon lifecycle
 */
export declare class ServiceManager {
    private daemon?;
    private client;
    constructor(config?: Partial<ServiceConfiguration>);
    /**
     * Start background service if not already running
     */
    startService(config?: Partial<ServiceConfiguration>): Promise<void>;
    /**
     * Stop background service
     */
    stopService(): Promise<void>;
    /**
     * Restart background service
     */
    restartService(): Promise<void>;
    /**
     * Get service status
     */
    getStatus(): Promise<ServiceStatus | null>;
    /**
     * Get client for communicating with service
     */
    getClient(): BackgroundServiceClient;
}
