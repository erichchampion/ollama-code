"use strict";
/**
 * Progress Utilities
 *
 * Shared utilities for progress tracking and reporting to eliminate
 * duplicate progress handling patterns across services.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarProgressIndicator = exports.StepProgressReporter = void 0;
exports.withProgress = withProgress;
exports.executeBatchWithProgress = executeBatchWithProgress;
exports.createTimedProgress = createTimedProgress;
exports.withFileProgress = withFileProgress;
const vscode = __importStar(require("vscode"));
const serviceConstants_1 = require("../config/serviceConstants");
const errorUtils_1 = require("./errorUtils");
/**
 * Execute a task with progress tracking
 */
async function withProgress(options, task) {
    const { title, location = vscode.ProgressLocation.Notification, cancellable = true } = options;
    return vscode.window.withProgress({
        location,
        title,
        cancellable
    }, async (progress, token) => {
        try {
            return await task(progress, token);
        }
        catch (error) {
            progress.report({ message: `Error: ${(0, errorUtils_1.formatError)(error)}` });
            throw error;
        }
    });
}
/**
 * Create a progress reporter for step-by-step operations
 */
class StepProgressReporter {
    constructor(progress, totalSteps) {
        this.currentStep = 0;
        this.progress = progress;
        this.totalSteps = totalSteps;
    }
    /**
     * Report completion of a step
     */
    completeStep(message) {
        this.currentStep++;
        const percentage = (this.currentStep / this.totalSteps) * 100;
        const increment = (1 / this.totalSteps) * 100;
        this.progress.report({
            message: `${message} (${this.currentStep}/${this.totalSteps})`,
            increment
        });
    }
    /**
     * Update current step without completing it
     */
    updateStep(message) {
        this.progress.report({
            message: `${message} (${this.currentStep}/${this.totalSteps})`,
            increment: 0
        });
    }
    /**
     * Set overall progress percentage
     */
    setProgress(percentage, message) {
        this.progress.report({
            message: message || `Progress: ${Math.round(percentage)}%`,
            increment: 0
        });
    }
    /**
     * Get current progress percentage
     */
    getCurrentProgress() {
        return (this.currentStep / this.totalSteps) * 100;
    }
    /**
     * Check if all steps are completed
     */
    isComplete() {
        return this.currentStep >= this.totalSteps;
    }
}
exports.StepProgressReporter = StepProgressReporter;
/**
 * Execute batch operation with progress tracking
 */
async function executeBatchWithProgress(items, processor, options) {
    const { batchSize = 5 } = options;
    const results = [];
    return withProgress({
        ...options,
        title: options.title || 'Processing batch...'
    }, async (progress, token) => {
        const totalItems = items.length;
        let processedItems = 0;
        for (let i = 0; i < items.length; i += batchSize) {
            if (token.isCancellationRequested) {
                progress.report({ message: 'Operation cancelled' });
                break;
            }
            const batch = items.slice(i, Math.min(i + batchSize, items.length));
            const batchPromises = batch.map((item, batchIndex) => {
                const absoluteIndex = i + batchIndex;
                return processor(item, absoluteIndex, totalItems);
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            processedItems += batch.length;
            const percentage = (processedItems / totalItems) * 100;
            progress.report({
                message: `Processed ${processedItems}/${totalItems} items`,
                increment: (batch.length / totalItems) * 100
            });
        }
        return results;
    });
}
/**
 * Create a timed progress indicator
 */
async function createTimedProgress(title, estimatedDuration, options = {}) {
    const { location = vscode.ProgressLocation.Notification, showPercentage = true, updateInterval = serviceConstants_1.PROGRESS_INTERVALS.UPDATE_INTERVAL } = options;
    return withProgress({ title, location, cancellable: true }, async (progress, token) => {
        const startTime = Date.now();
        return new Promise((resolve) => {
            const updateProgress = () => {
                if (token.isCancellationRequested) {
                    progress.report({ message: 'Operation cancelled' });
                    resolve();
                    return;
                }
                const elapsed = Date.now() - startTime;
                const percentage = Math.min((elapsed / estimatedDuration) * 100, 95);
                if (elapsed >= estimatedDuration) {
                    progress.report({ message: 'Operation completed' });
                    resolve();
                    return;
                }
                const message = showPercentage
                    ? `Processing... (${Math.round(percentage)}%)`
                    : 'Processing...';
                progress.report({ message, increment: 0 });
                setTimeout(updateProgress, updateInterval);
            };
            updateProgress();
        });
    });
}
/**
 * Status bar progress indicator
 */
class StatusBarProgressIndicator {
    constructor(priority = serviceConstants_1.STATUS_BAR_CONFIG.PROGRESS_PRIORITY) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, priority);
    }
    /**
     * Show progress in status bar
     */
    show(message, tooltip) {
        this.clearHideTimeout();
        this.statusBarItem.text = `$(sync~spin) ${message}`;
        this.statusBarItem.tooltip = tooltip || message;
        this.statusBarItem.show();
    }
    /**
     * Update progress message
     */
    update(message, tooltip) {
        this.statusBarItem.text = `$(sync~spin) ${message}`;
        this.statusBarItem.tooltip = tooltip || message;
    }
    /**
     * Show success message
     */
    showSuccess(message, autoHide = true) {
        this.clearHideTimeout();
        this.statusBarItem.text = `$(check) ${message}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.show();
        if (autoHide) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, serviceConstants_1.STATUS_BAR_CONFIG.SUCCESS_MESSAGE_DELAY);
        }
    }
    /**
     * Show error message
     */
    showError(message, autoHide = true) {
        this.clearHideTimeout();
        this.statusBarItem.text = `$(error) ${message}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.show();
        if (autoHide) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, serviceConstants_1.STATUS_BAR_CONFIG.ERROR_MESSAGE_DELAY);
        }
    }
    /**
     * Hide status bar item
     */
    hide() {
        this.clearHideTimeout();
        this.statusBarItem.hide();
    }
    /**
     * Dispose of status bar item
     */
    dispose() {
        this.clearHideTimeout();
        this.statusBarItem.dispose();
    }
    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
        }
    }
}
exports.StatusBarProgressIndicator = StatusBarProgressIndicator;
/**
 * Create progress for file operations
 */
async function withFileProgress(files, processor, title = 'Processing files') {
    return withProgress({
        title,
        location: vscode.ProgressLocation.Notification,
        cancellable: true
    }, async (progress, token) => {
        const stepProgress = new StepProgressReporter(progress, files.length);
        const results = [];
        for (const file of files) {
            if (token.isCancellationRequested) {
                break;
            }
            try {
                const result = await processor(file, stepProgress);
                results.push(result);
                stepProgress.completeStep(`Processed ${file}`);
            }
            catch (error) {
                stepProgress.updateStep(`Failed to process ${file}: ${(0, errorUtils_1.formatError)(error)}`);
            }
        }
        return results;
    });
}
//# sourceMappingURL=progressUtils.js.map