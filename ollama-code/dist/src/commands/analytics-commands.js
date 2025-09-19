/**
 * Analytics Commands
 *
 * Commands for viewing analytics and usage statistics
 */
import { commandRegistry, ArgType } from './index.js';
import { logger } from '../utils/logger.js';
import { analyticsTracker } from '../analytics/tracker.js';
import { validateNonEmptyString } from '../utils/command-helpers.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
/**
 * Register analytics commands
 */
export function registerAnalyticsCommands() {
    logger.debug('Registering analytics commands');
    registerAnalyticsShowCommand();
    registerAnalyticsExportCommand();
    registerAnalyticsClearCommand();
    registerAnalyticsWorkflowCommand();
    registerAnalyticsProgressCommand();
}
/**
 * Show analytics and usage statistics
 */
function registerAnalyticsShowCommand() {
    const command = {
        name: 'analytics-show',
        description: 'Display usage analytics and statistics',
        category: 'Analytics',
        async handler(args) {
            try {
                const { days = 30, detailed = false } = args;
                if (days < 1 || days > 365) {
                    throw createUserError('Days must be between 1 and 365', {
                        category: ErrorCategory.VALIDATION,
                        resolution: 'Provide a valid number of days (1-365)'
                    });
                }
                const stats = await analyticsTracker.generateUsageStats(days);
                console.log(`📊 Usage Analytics (Last ${days} days)\\n`);
                // Overview
                console.log('📈 Overview:');
                console.log(`   Total Commands: ${stats.totalCommands}`);
                console.log(`   Total Sessions: ${stats.totalSessions}`);
                console.log(`   Success Rate: ${stats.successRate.toFixed(1)}%`);
                console.log(`   Avg Session Duration: ${formatDuration(stats.averageSessionDuration)}\n`);
                // Most used commands
                console.log('🏆 Most Used Commands:');
                stats.mostUsedCommands.slice(0, 5).forEach((cmd, index) => {
                    console.log(`   ${index + 1}. ${cmd.command} (${cmd.count} times, ${cmd.percentage.toFixed(1)}%)`);
                });
                console.log('');
                // Feature adoption
                console.log('🚀 Feature Adoption:');
                stats.featureAdoption.forEach(feature => {
                    const trendIcon = feature.trend === 'increasing' ? '📈' :
                        feature.trend === 'decreasing' ? '📉' : '📊';
                    console.log(`   ${trendIcon} ${feature.feature}: ${feature.usage} uses (${feature.trend})`);
                });
                console.log('');
                // Daily usage (last 7 days)
                if (detailed) {
                    console.log('📅 Daily Usage (Last 7 days):');
                    stats.dailyUsage.slice(-7).forEach(day => {
                        const bar = '█'.repeat(Math.ceil(day.commands / 2));
                        console.log(`   ${day.date}: ${day.commands.toString().padStart(3)} ${bar}`);
                    });
                    console.log('');
                }
                console.log('💡 Commands:');
                console.log('   analytics-show --days 7 --detailed   # Detailed 7-day report');
                console.log('   analytics-workflow                   # View workflow patterns');
                console.log('   analytics-export report.json        # Export data');
            }
            catch (error) {
                logger.error('Analytics show command failed:', error);
                throw error;
            }
        },
        args: [
            {
                name: 'days',
                description: 'Number of days to include in analysis (1-365)',
                type: ArgType.NUMBER,
                flag: '--days',
                required: false
            },
            {
                name: 'detailed',
                description: 'Show detailed breakdown including daily usage',
                type: ArgType.BOOLEAN,
                flag: '--detailed',
                required: false
            }
        ],
        examples: [
            'analytics-show',
            'analytics-show --days 7',
            'analytics-show --days 30 --detailed'
        ]
    };
    commandRegistry.register(command);
}
/**
 * Show workflow patterns and insights
 */
function registerAnalyticsWorkflowCommand() {
    const command = {
        name: 'analytics-workflow',
        description: 'Analyze workflow patterns and get optimization insights',
        category: 'Analytics',
        async handler(args) {
            try {
                const insights = await analyticsTracker.getWorkflowInsights();
                console.log('🔄 Workflow Analysis\\n');
                // Common patterns
                if (insights.patterns.length > 0) {
                    console.log('📋 Common Command Patterns:');
                    insights.patterns.slice(0, 5).forEach((pattern, index) => {
                        console.log(`   ${index + 1}. ${pattern.name}`);
                        console.log(`      Frequency: ${pattern.frequency} times`);
                        console.log(`      Success Rate: ${pattern.successRate.toFixed(1)}%`);
                        console.log(`      Avg Duration: ${formatDuration(pattern.averageDuration)}\n`);
                    });
                }
                else {
                    console.log('📋 No common command patterns detected yet\\n');
                }
                // Recommendations
                if (insights.recommendations.length > 0) {
                    console.log('💡 Recommendations:');
                    insights.recommendations.forEach((rec, index) => {
                        console.log(`   ${index + 1}. ${rec}`);
                    });
                    console.log('');
                }
                // Inefficiencies
                if (insights.inefficiencies.length > 0) {
                    console.log('⚠️  Potential Inefficiencies:');
                    insights.inefficiencies.forEach((issue, index) => {
                        console.log(`   ${index + 1}. ${issue.description}`);
                        console.log(`      💡 ${issue.suggestion}\\n`);
                    });
                }
                else {
                    console.log('✅ No significant inefficiencies detected\\n');
                }
                console.log('💡 Commands:');
                console.log('   analytics-show              # View usage statistics');
                console.log('   config-show                 # Review current configuration');
            }
            catch (error) {
                logger.error('Analytics workflow command failed:', error);
                throw error;
            }
        },
        args: [],
        examples: [
            'analytics-workflow'
        ]
    };
    commandRegistry.register(command);
}
/**
 * Show progress of active tasks
 */
function registerAnalyticsProgressCommand() {
    const command = {
        name: 'analytics-progress',
        description: 'Show progress of active long-running tasks',
        category: 'Analytics',
        async handler(args) {
            try {
                const activeTasks = analyticsTracker.getActiveTasks();
                if (activeTasks.length === 0) {
                    console.log('📊 No active tasks currently running\\n');
                    console.log('💡 Long-running operations will show progress here');
                    return;
                }
                console.log('🔄 Active Tasks\\n');
                activeTasks.forEach((task, index) => {
                    const progress = (task.currentStep / task.totalSteps) * 100;
                    const progressBar = createProgressBar(progress);
                    const statusIcon = getStatusIcon(task.status);
                    console.log(`${index + 1}. ${statusIcon} ${task.name}`);
                    console.log(`   ${task.description}`);
                    console.log(`   Progress: ${progressBar} ${progress.toFixed(1)}% (${task.currentStep}/${task.totalSteps})`);
                    if (task.details) {
                        console.log(`   Current: ${task.details}`);
                    }
                    if (task.estimatedDuration) {
                        const elapsed = Date.now() - task.startTime;
                        const estimated = task.estimatedDuration;
                        const remaining = Math.max(0, estimated - elapsed);
                        console.log(`   Time: ${formatDuration(elapsed)} elapsed, ~${formatDuration(remaining)} remaining`);
                    }
                    else {
                        const elapsed = Date.now() - task.startTime;
                        console.log(`   Time: ${formatDuration(elapsed)} elapsed`);
                    }
                    console.log('');
                });
                console.log('💡 Tasks update automatically in real-time');
                console.log('💡 Run this command again to see latest progress');
            }
            catch (error) {
                logger.error('Analytics progress command failed:', error);
                throw error;
            }
        },
        args: [],
        examples: [
            'analytics-progress'
        ]
    };
    commandRegistry.register(command);
}
/**
 * Export analytics data
 */
function registerAnalyticsExportCommand() {
    const command = {
        name: 'analytics-export',
        description: 'Export analytics data to a file',
        category: 'Analytics',
        async handler(args) {
            try {
                const { file, format = 'json' } = args;
                if (!validateNonEmptyString(file, 'export file path')) {
                    return;
                }
                if (!['json', 'csv'].includes(format)) {
                    throw createUserError(`Unsupported format: ${format}`, {
                        category: ErrorCategory.VALIDATION,
                        resolution: 'Use json or csv format'
                    });
                }
                await analyticsTracker.exportAnalytics(file, format);
                console.log(`✅ Analytics data exported to: ${file}`);
                console.log(`📊 Format: ${format.toUpperCase()}\\n`);
                console.log('📦 Export includes:');
                console.log('   • Usage statistics and trends');
                console.log('   • Command execution history');
                console.log('   • Session information');
                console.log('   • Workflow patterns');
                console.log('   • Performance metrics\\n');
                console.log('💡 Use this data for:');
                console.log('   • Performance analysis');
                console.log('   • Usage optimization');
                console.log('   • Sharing with team');
                console.log('   • External reporting');
            }
            catch (error) {
                logger.error('Analytics export command failed:', error);
                throw error;
            }
        },
        args: [
            {
                name: 'file',
                description: 'File path to export analytics data to',
                type: ArgType.STRING,
                position: 0,
                required: true
            },
            {
                name: 'format',
                description: 'Export format (json or csv)',
                type: ArgType.STRING,
                flag: '--format',
                required: false
            }
        ],
        examples: [
            'analytics-export analytics.json',
            'analytics-export report.csv --format csv',
            'analytics-export ./reports/usage-data.json'
        ]
    };
    commandRegistry.register(command);
}
/**
 * Clear analytics data
 */
function registerAnalyticsClearCommand() {
    const command = {
        name: 'analytics-clear',
        description: 'Clear analytics data and history',
        category: 'Analytics',
        async handler(args) {
            try {
                const { older_than, confirm = false } = args;
                if (!confirm) {
                    if (older_than) {
                        console.log(`⚠️  This will clear analytics data older than ${older_than} days!`);
                    }
                    else {
                        console.log('⚠️  This will clear ALL analytics data and history!');
                    }
                    console.log('\\nThis action cannot be undone. All usage statistics will be lost.');
                    console.log('\\n💡 To proceed, add --confirm flag');
                    console.log('💡 Consider exporting data first with: analytics-export backup.json');
                    return;
                }
                await analyticsTracker.clearAnalytics(older_than);
                if (older_than) {
                    console.log(`✅ Analytics data older than ${older_than} days cleared`);
                }
                else {
                    console.log('✅ All analytics data cleared');
                }
                console.log('\\n🔄 Fresh tracking starts now');
                console.log('💡 New usage statistics will begin accumulating');
            }
            catch (error) {
                logger.error('Analytics clear command failed:', error);
                throw error;
            }
        },
        args: [
            {
                name: 'older_than',
                description: 'Clear data older than specified days (optional)',
                type: ArgType.NUMBER,
                flag: '--older-than',
                required: false
            },
            {
                name: 'confirm',
                description: 'Confirm the clear operation',
                type: ArgType.BOOLEAN,
                flag: '--confirm',
                required: false
            }
        ],
        examples: [
            'analytics-clear',
            'analytics-clear --older-than 90',
            'analytics-clear --confirm',
            'analytics-clear --older-than 30 --confirm'
        ]
    };
    commandRegistry.register(command);
}
/**
 * Helper methods (these would be attached to the command object in practice)
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
function createProgressBar(percentage, width = 20) {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
}
function getStatusIcon(status) {
    switch (status) {
        case 'pending': return '⏳';
        case 'running': return '🔄';
        case 'completed': return '✅';
        case 'failed': return '❌';
        case 'cancelled': return '🚫';
        default: return '❓';
    }
}
//# sourceMappingURL=analytics-commands.js.map