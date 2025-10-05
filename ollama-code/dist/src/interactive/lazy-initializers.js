/**
 * Lazy Initializers for AI Services
 *
 * Provides safe initialization of AI services without circular dependencies.
 * Ensures proper initialization order and state management.
 */
import { logger } from '../utils/logger.js';
import { normalizeError } from '../utils/error-utils.js';
import { initAI, getAIClient, getEnhancedClient } from '../ai/index.js';
export var AIInitState;
(function (AIInitState) {
    AIInitState["NOT_INITIALIZED"] = "not_initialized";
    AIInitState["INITIALIZING"] = "initializing";
    AIInitState["READY"] = "ready";
    AIInitState["FAILED"] = "failed";
})(AIInitState || (AIInitState = {}));
export class LazyInitializers {
    static aiInitState = AIInitState.NOT_INITIALIZED;
    static aiInitPromise = null;
    static aiInitResult = null;
    static aiInitError = null;
    /**
     * Get current AI initialization state
     */
    static getAIInitState() {
        return this.aiInitState;
    }
    /**
     * Ensure AI system is initialized
     */
    static async ensureAIInitialized() {
        // Return cached result if available
        if (this.aiInitState === AIInitState.READY && this.aiInitResult) {
            return this.aiInitResult;
        }
        // Throw cached error if failed
        if (this.aiInitState === AIInitState.FAILED && this.aiInitError) {
            throw this.aiInitError;
        }
        // Return existing promise if initializing
        if (this.aiInitState === AIInitState.INITIALIZING && this.aiInitPromise) {
            return this.aiInitPromise;
        }
        // Start initialization
        logger.debug('Starting AI system initialization');
        this.aiInitState = AIInitState.INITIALIZING;
        this.aiInitPromise = this.initializeAISystem();
        try {
            this.aiInitResult = await this.aiInitPromise;
            this.aiInitState = AIInitState.READY;
            logger.debug('AI system initialized successfully');
            return this.aiInitResult;
        }
        catch (error) {
            this.aiInitError = error instanceof Error ? error : new Error(String(error));
            this.aiInitState = AIInitState.FAILED;
            this.aiInitPromise = null;
            logger.error('AI system initialization failed:', this.aiInitError);
            throw this.aiInitError;
        }
    }
    /**
     * Internal AI system initialization
     */
    static async initializeAISystem() {
        const startTime = Date.now();
        try {
            // Use the existing initAI function which handles the full initialization
            const result = await initAI();
            const initTime = Date.now() - startTime;
            logger.debug(`AI system initialized in ${initTime}ms`);
            return result;
        }
        catch (error) {
            const initTime = Date.now() - startTime;
            logger.error(`AI system initialization failed after ${initTime}ms:`, error);
            throw error;
        }
    }
    /**
     * Get AI client with lazy initialization
     */
    static async getAIClientLazy() {
        await this.ensureAIInitialized();
        return getAIClient();
    }
    /**
     * Get enhanced client with lazy initialization
     */
    static async getEnhancedClientLazy() {
        await this.ensureAIInitialized();
        return getEnhancedClient();
    }
    /**
     * Get project context with lazy initialization
     */
    static async getProjectContextLazy() {
        const result = await this.ensureAIInitialized();
        return result.projectContext;
    }
    /**
     * Get task planner with lazy initialization
     */
    static async getTaskPlannerLazy() {
        const result = await this.ensureAIInitialized();
        return result.taskPlanner;
    }
    /**
     * Check if AI system is ready without initializing
     */
    static isAIReady() {
        return this.aiInitState === AIInitState.READY;
    }
    /**
     * Check if AI system failed
     */
    static isAIFailed() {
        return this.aiInitState === AIInitState.FAILED;
    }
    /**
     * Get last initialization error
     */
    static getLastError() {
        return this.aiInitError;
    }
    /**
     * Reset AI initialization state (useful for testing)
     */
    static resetAIInitialization() {
        this.aiInitState = AIInitState.NOT_INITIALIZED;
        this.aiInitPromise = null;
        this.aiInitResult = null;
        this.aiInitError = null;
        logger.debug('AI initialization state reset');
    }
    /**
     * Force re-initialization of AI system
     */
    static async reinitializeAI() {
        logger.debug('Forcing AI system re-initialization');
        this.resetAIInitialization();
        return this.ensureAIInitialized();
    }
    /**
     * Get initialization diagnostics
     */
    static getDiagnostics() {
        return {
            state: this.aiInitState,
            hasResult: this.aiInitResult !== null,
            hasError: this.aiInitError !== null,
            isInitializing: this.aiInitState === AIInitState.INITIALIZING,
            error: this.aiInitError?.message
        };
    }
    /**
     * Validate AI system health
     */
    static async validateAIHealth() {
        const issues = [];
        const components = {
            aiClient: false,
            enhancedClient: false,
            projectContext: false,
            taskPlanner: false
        };
        try {
            if (this.aiInitState !== AIInitState.READY) {
                issues.push('AI system not initialized');
                return { healthy: false, issues, components };
            }
            if (!this.aiInitResult) {
                issues.push('AI initialization result not available');
                return { healthy: false, issues, components };
            }
            // Check each component
            try {
                const aiClient = getAIClient();
                components.aiClient = !!aiClient;
                if (!aiClient)
                    issues.push('AI client not available');
            }
            catch (error) {
                issues.push(`AI client error: ${normalizeError(error).message}`);
            }
            try {
                const enhancedClient = getEnhancedClient();
                components.enhancedClient = !!enhancedClient;
                if (!enhancedClient)
                    issues.push('Enhanced client not available');
            }
            catch (error) {
                issues.push(`Enhanced client error: ${normalizeError(error).message}`);
            }
            components.projectContext = !!this.aiInitResult.projectContext;
            if (!this.aiInitResult.projectContext) {
                issues.push('Project context not available');
            }
            components.taskPlanner = !!this.aiInitResult.taskPlanner;
            if (!this.aiInitResult.taskPlanner) {
                issues.push('Task planner not available');
            }
            return {
                healthy: issues.length === 0,
                issues,
                components
            };
        }
        catch (error) {
            issues.push(`Health check failed: ${normalizeError(error).message}`);
            return { healthy: false, issues, components };
        }
    }
    /**
     * Get health report as string
     */
    static async getHealthReport() {
        const health = await this.validateAIHealth();
        const diagnostics = this.getDiagnostics();
        let report = '🤖 AI System Health Report\n\n';
        // Overall status
        const statusIcon = health.healthy ? '✅' : '❌';
        report += `${statusIcon} Overall Status: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'}\n`;
        report += `🔧 Initialization State: ${diagnostics.state}\n\n`;
        // Components
        report += '📋 Components:\n';
        Object.entries(health.components).forEach(([name, status]) => {
            const icon = status ? '✅' : '❌';
            report += `  ${icon} ${name}: ${status ? 'Ready' : 'Not Available'}\n`;
        });
        // Issues
        if (health.issues.length > 0) {
            report += '\n⚠️  Issues:\n';
            health.issues.forEach(issue => {
                report += `  • ${issue}\n`;
            });
        }
        // Diagnostics
        if (diagnostics.error) {
            report += `\n❌ Last Error: ${diagnostics.error}\n`;
        }
        return report;
    }
}
//# sourceMappingURL=lazy-initializers.js.map