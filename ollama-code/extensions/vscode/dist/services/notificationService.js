"use strict";
/**
 * Notification Service
 *
 * Provides notification system for AI insights and recommendations
 * with progress indicators for long-running operations.
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
exports.NotificationService = void 0;
const vscode = __importStar(require("vscode"));
const analysisConstants_1 = require("../config/analysisConstants");
const serviceConstants_1 = require("../config/serviceConstants");
const errorUtils_1 = require("../utils/errorUtils");
class NotificationService {
    constructor() {
        this.activeProgressItems = new Map();
        this.progressTokens = new Map();
    }
    /**
     * Show notification with AI insights and recommendations
     */
    async showNotification(options) {
        const { type, message, detail, actions, timeout } = options;
        try {
            switch (type) {
                case 'info':
                    return await this.showInfoNotification(message, detail, actions, timeout);
                case 'warning':
                    return await this.showWarningNotification(message, detail, actions, timeout);
                case 'error':
                    return await this.showErrorNotification(message, detail, actions);
                case 'progress':
                    return await this.showProgressNotification(message, detail, options.showProgress);
                default:
                    return await this.showInfoNotification(message, detail, actions, timeout);
            }
        }
        catch (error) {
            console.error('Failed to show notification:', (0, errorUtils_1.formatError)(error));
            return undefined;
        }
    }
    /**
     * Show progress indicator for long-running operations
     */
    async showProgress(options, task) {
        const { title, detail, cancellable = true, location = vscode.ProgressLocation.Notification } = options;
        return vscode.window.withProgress({
            location,
            title,
            cancellable
        }, async (progress, token) => {
            const progressId = `progress_${Date.now()}`;
            this.activeProgressItems.set(progressId, progress);
            this.progressTokens.set(progressId, token);
            try {
                if (detail) {
                    progress.report({ message: detail });
                }
                const result = await task(progress, token);
                return result;
            }
            finally {
                this.activeProgressItems.delete(progressId);
                this.progressTokens.delete(progressId);
            }
        });
    }
    /**
     * Update progress for an active operation
     */
    updateProgress(progressId, message, increment) {
        const progress = this.activeProgressItems.get(progressId);
        if (progress) {
            progress.report({ message, increment });
        }
    }
    /**
     * Show AI insight notification
     */
    async showAIInsight(title, insight, severity = 'info') {
        const icon = this.getInsightIcon(severity);
        const message = `${icon} ${title}`;
        const actions = [
            {
                title: 'Learn More',
                action: () => this.showInsightDetail(title, insight)
            }
        ];
        if (severity === 'critical') {
            await this.showErrorNotification(message, insight, actions);
        }
        else if (severity === 'warning') {
            await this.showWarningNotification(message, insight, actions);
        }
        else {
            await this.showInfoNotification(message, insight, actions);
        }
    }
    /**
     * Show code improvement suggestion
     */
    async showCodeSuggestion(suggestion, codeExample, applyAction) {
        const actions = [];
        if (applyAction) {
            actions.push({
                title: 'Apply Suggestion',
                action: applyAction
            });
        }
        actions.push({
            title: 'Show Example',
            action: () => this.showCodeExample(suggestion, codeExample || 'No example available')
        });
        await this.showInfoNotification(`💡 AI Suggestion: ${suggestion}`, 'Click "Show Example" to see the recommended implementation.', actions);
    }
    /**
     * Show analysis progress for multiple files
     */
    async showAnalysisProgress(files, analyzer) {
        await this.showProgress({
            title: 'Analyzing Code',
            detail: `Processing ${files.length} files...`,
            cancellable: true,
            location: vscode.ProgressLocation.Notification
        }, async (progress, token) => {
            const totalFiles = files.length;
            let processedFiles = 0;
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                progress.report({
                    message: `Analyzing ${file}...`,
                    increment: (1 / totalFiles) * 100
                });
                try {
                    await analyzer(file);
                }
                catch (error) {
                    console.error(`Failed to analyze ${file}:`, (0, errorUtils_1.formatError)(error));
                }
                processedFiles++;
                progress.report({
                    message: `Processed ${processedFiles}/${totalFiles} files`,
                    increment: 0
                });
            }
            if (token.isCancellationRequested) {
                progress.report({ message: 'Analysis cancelled' });
            }
            else {
                progress.report({ message: 'Analysis complete!' });
            }
        });
    }
    /**
     * Show workspace indexing progress
     */
    async showIndexingProgress(totalFiles, onProgress) {
        await this.showProgress({
            title: 'Indexing Workspace',
            detail: 'Building code intelligence index...',
            cancellable: false,
            location: vscode.ProgressLocation.Window
        }, async (progress, token) => {
            let processedFiles = 0;
            // Simulate indexing process
            const updateProgress = () => {
                processedFiles++;
                const percentage = (processedFiles / totalFiles) * 100;
                progress.report({
                    message: `Indexed ${processedFiles}/${totalFiles} files (${Math.round(percentage)}%)`,
                    increment: (1 / totalFiles) * 100
                });
                onProgress(processedFiles, totalFiles);
                if (processedFiles < totalFiles) {
                    setTimeout(updateProgress, serviceConstants_1.PROGRESS_INTERVALS.INDEXING_SIMULATION);
                }
            };
            updateProgress();
            // Wait for completion
            return new Promise(resolve => {
                const checkCompletion = () => {
                    if (processedFiles >= totalFiles) {
                        progress.report({ message: 'Indexing complete!' });
                        resolve(undefined);
                    }
                    else {
                        setTimeout(checkCompletion, serviceConstants_1.PROGRESS_INTERVALS.COMPLETION_CHECK);
                    }
                };
                checkCompletion();
            });
        });
    }
    /**
     * Show AI operation status
     */
    async showAIOperationStatus(operation, estimatedTime) {
        const timeout = estimatedTime || analysisConstants_1.TIMEOUT_CONSTANTS.AI_ANALYSIS_TIMEOUT;
        await this.showProgress({
            title: `AI ${operation}`,
            detail: 'Processing your request...',
            cancellable: true
        }, async (progress, token) => {
            const startTime = Date.now();
            const updateInterval = serviceConstants_1.PROGRESS_INTERVALS.UPDATE_INTERVAL;
            return new Promise((resolve) => {
                const updateProgress = () => {
                    const elapsed = Date.now() - startTime;
                    const percentage = Math.min((elapsed / timeout) * 100, 95);
                    if (token.isCancellationRequested) {
                        progress.report({ message: 'Operation cancelled' });
                        resolve(undefined);
                        return;
                    }
                    if (elapsed >= timeout) {
                        progress.report({ message: 'Operation completed' });
                        resolve(undefined);
                        return;
                    }
                    progress.report({
                        message: `Processing... (${Math.round(percentage)}%)`,
                        increment: 0
                    });
                    setTimeout(updateProgress, updateInterval);
                };
                updateProgress();
            });
        });
    }
    /**
     * Show configuration recommendation
     */
    async showConfigRecommendation(setting, currentValue, recommendedValue, reason) {
        const actions = [
            {
                title: 'Apply Recommendation',
                action: async () => {
                    try {
                        await vscode.workspace.getConfiguration().update(setting, recommendedValue, vscode.ConfigurationTarget.Workspace);
                        this.showNotification({
                            type: 'info',
                            message: '✅ Configuration updated successfully!'
                        });
                    }
                    catch (error) {
                        this.showNotification({
                            type: 'error',
                            message: `Failed to update configuration: ${(0, errorUtils_1.formatError)(error)}`
                        });
                    }
                }
            },
            {
                title: 'Learn More',
                action: () => this.showConfigurationHelp(setting, reason)
            }
        ];
        await this.showInfoNotification(`⚙️ Configuration Recommendation`, `Consider changing "${setting}" from "${currentValue}" to "${recommendedValue}". ${reason}`, actions);
    }
    /**
     * Private helper methods
     */
    async showInfoNotification(message, detail, actions, timeout) {
        const actionItems = actions?.map(a => a.title) || [];
        const result = await vscode.window.showInformationMessage(message, { detail, modal: false }, ...actionItems);
        if (result && actions) {
            const action = actions.find(a => a.title === result);
            if (action) {
                await action.action();
            }
        }
        if (timeout) {
            setTimeout(() => {
                // Auto-dismiss would be handled by VS Code
            }, timeout);
        }
        return result;
    }
    async showWarningNotification(message, detail, actions, timeout) {
        const actionItems = actions?.map(a => a.title) || [];
        const result = await vscode.window.showWarningMessage(message, { detail, modal: false }, ...actionItems);
        if (result && actions) {
            const action = actions.find(a => a.title === result);
            if (action) {
                await action.action();
            }
        }
        return result;
    }
    async showErrorNotification(message, detail, actions) {
        const actionItems = actions?.map(a => a.title) || [];
        const result = await vscode.window.showErrorMessage(message, { detail, modal: false }, ...actionItems);
        if (result && actions) {
            const action = actions.find(a => a.title === result);
            if (action) {
                await action.action();
            }
        }
        return result;
    }
    async showProgressNotification(message, detail, showProgress) {
        if (showProgress) {
            return vscode.window.showInformationMessage(`⏳ ${message}`, detail || '');
        }
        else {
            return vscode.window.showInformationMessage(message);
        }
    }
    getInsightIcon(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'suggestion': return '💡';
            default: return 'ℹ️';
        }
    }
    async showInsightDetail(title, insight) {
        const document = await vscode.workspace.openTextDocument({
            content: `# AI Insight: ${title}\n\n${insight}`,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
    }
    async showCodeExample(suggestion, example) {
        const document = await vscode.workspace.openTextDocument({
            content: `// AI Suggestion: ${suggestion}\n\n${example}`,
            language: 'javascript'
        });
        await vscode.window.showTextDocument(document);
    }
    async showConfigurationHelp(setting, reason) {
        const content = `# Configuration Help\n\n## Setting: ${setting}\n\n### Recommendation Reason:\n${reason}\n\n### How to change this setting:\n1. Open VS Code Settings (Ctrl+,)\n2. Search for "${setting}"\n3. Update the value as recommended\n\nOr you can update it programmatically in your settings.json file.`;
        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.activeProgressItems.clear();
        this.progressTokens.clear();
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map