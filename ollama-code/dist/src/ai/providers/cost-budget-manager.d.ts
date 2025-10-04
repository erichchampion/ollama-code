/**
 * Cost Budget Manager
 *
 * Provides comprehensive cost budgeting, usage limits, and spending controls
 * across different AI providers with real-time monitoring, alerts, and
 * automatic cost optimization features.
 */
import { EventEmitter } from 'events';
export interface BudgetConfig {
    id: string;
    name: string;
    description?: string;
    period: BudgetPeriod;
    limits: BudgetLimits;
    providers: ProviderBudgetConfig[];
    alertThresholds: AlertThreshold[];
    autoActions: AutoAction[];
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface BudgetLimits {
    maxCost: number;
    maxRequests: number;
    maxTokens: number;
    dailyLimits?: DailyLimits;
    monthlyLimits?: MonthlyLimits;
}
export interface DailyLimits {
    maxCost: number;
    maxRequests: number;
    maxTokens: number;
}
export interface MonthlyLimits {
    maxCost: number;
    maxRequests: number;
    maxTokens: number;
}
export interface ProviderBudgetConfig {
    providerId: string;
    allocation: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    costPerToken?: number;
    limits?: BudgetLimits;
    enabled: boolean;
}
export interface AlertThreshold {
    type: 'cost' | 'requests' | 'tokens';
    threshold: number;
    action: 'notify' | 'warn' | 'throttle' | 'block';
    channels: string[];
}
export interface AutoAction {
    trigger: 'budget_exceeded' | 'threshold_reached' | 'cost_spike' | 'provider_error';
    condition: AutoActionCondition;
    action: 'switch_provider' | 'reduce_quality' | 'enable_caching' | 'throttle' | 'block';
    parameters: Record<string, any>;
    cooldown: number;
    enabled: boolean;
}
export interface AutoActionCondition {
    metric: 'cost' | 'requests' | 'tokens' | 'error_rate';
    operator: '>' | '<' | '>=' | '<=' | '=';
    value: number;
    window: number;
}
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export interface UsageData {
    providerId: string;
    cost: number;
    requests: number;
    tokens: number;
    timestamp: Date;
    metadata: UsageMetadata;
}
export interface UsageMetadata {
    model: string;
    requestType: string;
    responseTime: number;
    success: boolean;
    cacheHit: boolean;
    quality?: number;
}
export interface BudgetStatus {
    budgetId: string;
    period: BudgetPeriod;
    current: UsageSummary;
    limits: BudgetLimits;
    utilization: UtilizationMetrics;
    projections: ProjectionMetrics;
    alerts: ActiveAlert[];
    recommendations: CostRecommendation[];
}
export interface UsageSummary {
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    providerBreakdown: ProviderUsage[];
    timeBreakdown: TimeSeriesUsage[];
}
export interface ProviderUsage {
    providerId: string;
    cost: number;
    requests: number;
    tokens: number;
    percentage: number;
    averageCostPerRequest: number;
    averageCostPerToken: number;
}
export interface TimeSeriesUsage {
    timestamp: Date;
    cost: number;
    requests: number;
    tokens: number;
}
export interface UtilizationMetrics {
    costUtilization: number;
    requestUtilization: number;
    tokenUtilization: number;
    dailyAverage: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    burnRate: number;
}
export interface ProjectionMetrics {
    projectedMonthlyCost: number;
    daysUntilBudgetExhausted: number;
    recommendedBudgetIncrease?: number;
    costOptimizationPotential: number;
}
export interface ActiveAlert {
    id: string;
    type: AlertThreshold['type'];
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    threshold: number;
    currentValue: number;
    timestamp: Date;
    acknowledged: boolean;
}
export interface CostRecommendation {
    id: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    estimatedSavings: number;
    implementation: string[];
    priority: number;
}
export declare class CostBudgetManager extends EventEmitter {
    private budgets;
    private usageData;
    private activeAlerts;
    private actionCooldowns;
    private costPredictionModel;
    constructor();
    /**
     * Create a new budget configuration
     */
    createBudget(config: Omit<BudgetConfig, 'id' | 'createdAt' | 'updatedAt'>): string;
    /**
     * Update existing budget configuration
     */
    updateBudget(budgetId: string, updates: Partial<BudgetConfig>): boolean;
    /**
     * Track usage data from providers
     */
    trackUsage(data: UsageData): void;
    /**
     * Check if request is within budget constraints
     */
    checkRequestAllowed(providerId: string, estimatedCost: number, _requestType?: string): {
        allowed: boolean;
        reason?: string;
        suggestion?: string;
    };
    /**
     * Get budget status
     */
    getBudgetStatus(budgetId: string): BudgetStatus | null;
    /**
     * Generate budget ID
     */
    private generateBudgetId;
    /**
     * Validate budget configuration
     */
    private validateBudgetConfig;
    /**
     * Check budget constraints for new usage
     */
    private checkBudgetConstraints;
    /**
     * Check alert thresholds
     */
    private checkAlertThresholds;
    /**
     * Get current value for threshold type
     */
    private getCurrentValueForThreshold;
    /**
     * Get limit value for threshold type
     */
    private getLimitValueForThreshold;
    /**
     * Trigger alert
     */
    private triggerAlert;
    /**
     * Determine alert severity based on utilization
     */
    private determineSeverity;
    /**
     * Execute automatic actions
     */
    private executeAutoActions;
    /**
     * Check if auto action condition is met
     */
    private isAutoActionConditionMet;
    /**
     * Execute auto action
     */
    private executeAction;
    /**
     * Switch to alternative provider
     */
    private switchProvider;
    /**
     * Reduce response quality to save costs
     */
    private reduceQuality;
    /**
     * Enable aggressive caching
     */
    private enableCaching;
    /**
     * Enable request throttling
     */
    private enableThrottling;
    /**
     * Block requests temporarily
     */
    private blockRequests;
    /**
     * Calculate current usage for budget period
     */
    private calculateCurrentUsage;
    /**
     * Calculate utilization metrics
     */
    private calculateUtilization;
    /**
     * Calculate cost projections
     */
    private calculateProjections;
    /**
     * Start usage tracking
     */
    private startUsageTracking;
    /**
     * Calculate error rate for provider within time window
     */
    private calculateErrorRate;
    /**
     * Get daily usage for budget
     */
    private getDailyUsage;
    /**
     * Get period start date
     */
    private getPeriodStart;
    /**
     * Calculate time series usage
     */
    private calculateTimeSeriesUsage;
    /**
     * Get time series key for grouping
     */
    private getTimeSeriesKey;
    /**
     * Get time series timestamp
     */
    private getTimeSeriesTimestamp;
    /**
     * Calculate trend direction
     */
    private calculateTrendDirection;
    /**
     * Calculate optimization potential
     */
    private calculateOptimizationPotential;
    /**
     * Generate cost optimization recommendations
     */
    private generateRecommendations;
    /**
     * Generate cost alternative suggestion
     */
    private generateCostAlternativeSuggestion;
    /**
     * Suggest alternative provider
     */
    private suggestAlternativeProvider;
    /**
     * Get active alerts for budget
     */
    private getActiveBudgetAlerts;
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Get all budgets
     */
    getAllBudgets(): BudgetConfig[];
    /**
     * Delete budget
     */
    deleteBudget(budgetId: string): boolean;
}
