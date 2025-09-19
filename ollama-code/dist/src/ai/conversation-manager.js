/**
 * Conversation Manager
 *
 * Manages conversation context, history, and state across interactive sessions.
 * Provides context-aware response generation and conversation persistence.
 */
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
export class ConversationManager {
    conversationHistory = [];
    context;
    persistencePath;
    maxHistorySize = 1000;
    contextWindow = 10; // Number of recent turns to consider for context
    constructor(sessionId) {
        this.context = this.initializeContext(sessionId);
        this.persistencePath = join(homedir(), '.ollama-code', 'conversations');
        this.ensurePersistenceDirectory();
    }
    /**
     * Add a new conversation turn
     */
    async addTurn(userInput, intent, response, actions = []) {
        const turn = {
            id: this.generateTurnId(),
            timestamp: new Date(),
            userInput,
            intent,
            response,
            actions,
            outcome: 'pending',
            contextSnapshot: {
                workingDirectory: process.cwd(),
                activeFiles: this.getActiveFiles(),
                lastModified: await this.getRecentlyModifiedFiles()
            }
        };
        this.conversationHistory.push(turn);
        this.updateContext(turn);
        this.trimHistory();
        // Persist conversation
        await this.persistConversation();
        logger.debug('Added conversation turn', {
            turnId: turn.id,
            intent: intent.type,
            actionsCount: actions.length
        });
        return turn;
    }
    /**
     * Update the outcome of a conversation turn
     */
    async updateTurnOutcome(turnId, outcome, feedback) {
        const turn = this.conversationHistory.find(t => t.id === turnId);
        if (turn) {
            turn.outcome = outcome;
            if (feedback) {
                turn.feedback = feedback;
            }
            await this.persistConversation();
            logger.debug('Updated turn outcome', { turnId, outcome });
        }
    }
    /**
     * Get conversation context for the current session
     */
    getConversationContext() {
        return { ...this.context };
    }
    /**
     * Get recent conversation history for context
     */
    getRecentHistory(maxTurns = this.contextWindow) {
        return this.conversationHistory.slice(-maxTurns);
    }
    /**
     * Get relevant history based on current intent
     */
    getRelevantHistory(currentIntent, maxTurns = 5) {
        const relevantTurns = [];
        // Get recent history
        const recentTurns = this.getRecentHistory(maxTurns * 2);
        for (const turn of recentTurns.reverse()) {
            if (relevantTurns.length >= maxTurns)
                break;
            // Check for intent similarity
            if (this.isIntentRelevant(turn.intent, currentIntent)) {
                relevantTurns.unshift(turn);
                continue;
            }
            // Check for entity overlap
            if (this.hasEntityOverlap(turn.intent, currentIntent)) {
                relevantTurns.unshift(turn);
                continue;
            }
            // Check for topic continuity
            if (this.isTopicContinuation(turn, currentIntent)) {
                relevantTurns.unshift(turn);
                continue;
            }
        }
        return relevantTurns;
    }
    /**
     * Generate contextual prompt for AI
     */
    generateContextualPrompt(currentInput, currentIntent) {
        const relevantHistory = this.getRelevantHistory(currentIntent);
        let prompt = `You are an AI coding assistant in an ongoing conversation.\n\n`;
        // Add conversation context
        if (this.context.activeTask) {
            prompt += `Current active task: ${this.context.activeTask.description}\n`;
            prompt += `Progress: ${this.context.activeTask.progress}%\n`;
            if (this.context.activeTask.nextSteps.length > 0) {
                prompt += `Next steps: ${this.context.activeTask.nextSteps.join(', ')}\n`;
            }
            prompt += '\n';
        }
        // Add relevant history
        if (relevantHistory.length > 0) {
            prompt += `Recent relevant conversation:\n`;
            relevantHistory.forEach((turn, index) => {
                prompt += `${index + 1}. User: ${turn.userInput}\n`;
                prompt += `   Assistant: ${turn.response.substring(0, 150)}${turn.response.length > 150 ? '...' : ''}\n`;
            });
            prompt += '\n';
        }
        // Add project context
        if (this.context.projectContext) {
            prompt += `Current project: ${this.context.projectContext.root}\n`;
            prompt += `Working directory: ${process.cwd()}\n\n`;
        }
        // Add current topics
        if (this.context.currentTopics.length > 0) {
            prompt += `Current conversation topics: ${this.context.currentTopics.join(', ')}\n\n`;
        }
        // Add user preferences
        prompt += `User preferences:\n`;
        prompt += `- Verbosity: ${this.context.userPreferences.verbosity}\n`;
        prompt += `- Code style: ${this.context.userPreferences.codeStyle}\n`;
        if (this.context.userPreferences.toolPreference.length > 0) {
            prompt += `- Preferred tools: ${this.context.userPreferences.toolPreference.join(', ')}\n`;
        }
        prompt += '\n';
        prompt += `Current request: ${currentInput}\n`;
        prompt += `Intent analysis: ${JSON.stringify(currentIntent, null, 2)}\n\n`;
        prompt += `Please provide a helpful response that takes into account the conversation context and user preferences.`;
        return prompt;
    }
    /**
     * Track user feedback and learn preferences
     */
    async trackFeedback(turnId, feedback) {
        await this.updateTurnOutcome(turnId, 'success', feedback);
        this.updateUserPreferences(feedback);
        await this.persistConversation();
        logger.debug('Tracked user feedback', {
            turnId,
            rating: feedback.rating,
            helpful: feedback.helpful
        });
    }
    /**
     * Generate conversation summary
     */
    generateSummary(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const recentTurns = this.conversationHistory.filter(turn => turn.timestamp >= cutoffDate);
        const successfulTurns = recentTurns.filter(turn => turn.outcome === 'success');
        const topicsMap = new Map();
        recentTurns.forEach(turn => {
            turn.intent.entities.concepts.forEach(concept => {
                topicsMap.set(concept, (topicsMap.get(concept) || 0) + 1);
            });
        });
        const topTopics = Array.from(topicsMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic, count]) => ({ topic, count }));
        const feedbackTurns = recentTurns.filter(turn => turn.feedback);
        const avgSatisfaction = feedbackTurns.length > 0
            ? feedbackTurns.reduce((sum, turn) => sum + (turn.feedback?.rating || 0), 0) / feedbackTurns.length
            : 0;
        return {
            totalTurns: recentTurns.length,
            successRate: recentTurns.length > 0 ? successfulTurns.length / recentTurns.length : 0,
            commonPatterns: this.extractCommonPatterns(recentTurns),
            userSatisfaction: avgSatisfaction,
            productiveHours: this.calculateProductiveHours(recentTurns),
            topTopics
        };
    }
    /**
     * Load conversation from persistence
     */
    async loadConversation(sessionId) {
        if (!sessionId)
            sessionId = this.context.sessionId;
        try {
            const conversationFile = join(this.persistencePath, `${sessionId}.json`);
            const data = await fs.readFile(conversationFile, 'utf-8');
            const savedData = JSON.parse(data);
            this.conversationHistory = savedData.history || [];
            this.context = { ...this.context, ...savedData.context };
            logger.debug('Loaded conversation from persistence', {
                sessionId,
                turnCount: this.conversationHistory.length
            });
        }
        catch (error) {
            logger.debug('No saved conversation found or failed to load:', error);
        }
    }
    /**
     * Save conversation to persistence
     */
    async persistConversation() {
        try {
            const conversationFile = join(this.persistencePath, `${this.context.sessionId}.json`);
            const dataToSave = {
                context: this.context,
                history: this.conversationHistory
            };
            await fs.writeFile(conversationFile, JSON.stringify(dataToSave, null, 2));
            logger.debug('Persisted conversation', {
                sessionId: this.context.sessionId,
                turnCount: this.conversationHistory.length
            });
        }
        catch (error) {
            logger.error('Failed to persist conversation:', error);
        }
    }
    /**
     * Clear conversation history
     */
    async clearHistory() {
        this.conversationHistory = [];
        this.context.turnCount = 0;
        this.context.currentTopics = [];
        this.context.activeTask = undefined;
        await this.persistConversation();
        logger.debug('Cleared conversation history');
    }
    /**
     * Private helper methods
     */
    initializeContext(sessionId) {
        return {
            sessionId: sessionId || this.generateSessionId(),
            startTime: new Date(),
            lastActivity: new Date(),
            turnCount: 0,
            currentTopics: [],
            userPreferences: {
                verbosity: 'detailed',
                codeStyle: 'mixed',
                toolPreference: [],
                frameworkPreference: []
            }
        };
    }
    updateContext(turn) {
        this.context.lastActivity = turn.timestamp;
        this.context.turnCount = this.conversationHistory.length;
        // Update current topics
        const newTopics = turn.intent.entities.concepts;
        newTopics.forEach(topic => {
            if (!this.context.currentTopics.includes(topic)) {
                this.context.currentTopics.push(topic);
            }
        });
        // Keep only recent topics
        if (this.context.currentTopics.length > 10) {
            this.context.currentTopics = this.context.currentTopics.slice(-10);
        }
        // Update active task if it's a task request
        if (turn.intent.type === 'task_request' && turn.intent.multiStep) {
            this.context.activeTask = {
                id: turn.id,
                description: turn.intent.action,
                progress: 0,
                nextSteps: turn.intent.suggestedClarifications
            };
        }
    }
    trimHistory() {
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);
        }
    }
    isIntentRelevant(pastIntent, currentIntent) {
        // Same type of intent
        if (pastIntent.type === currentIntent.type)
            return true;
        // Related actions
        const relatedActions = {
            'create': ['add', 'implement', 'build'],
            'fix': ['update', 'modify', 'improve'],
            'refactor': ['optimize', 'clean', 'restructure']
        };
        for (const [mainAction, related] of Object.entries(relatedActions)) {
            if (pastIntent.action === mainAction && related.includes(currentIntent.action)) {
                return true;
            }
        }
        return false;
    }
    hasEntityOverlap(pastIntent, currentIntent) {
        const pastEntities = new Set([
            ...pastIntent.entities.files,
            ...pastIntent.entities.functions,
            ...pastIntent.entities.classes
        ]);
        const currentEntities = new Set([
            ...currentIntent.entities.files,
            ...currentIntent.entities.functions,
            ...currentIntent.entities.classes
        ]);
        // Check for any overlap
        for (const entity of currentEntities) {
            if (pastEntities.has(entity))
                return true;
        }
        return false;
    }
    isTopicContinuation(turn, currentIntent) {
        const pastTopics = new Set(turn.intent.entities.concepts);
        const currentTopics = new Set(currentIntent.entities.concepts);
        for (const topic of currentTopics) {
            if (pastTopics.has(topic))
                return true;
        }
        return false;
    }
    updateUserPreferences(feedback) {
        // This would implement learning from user feedback
        // For now, just track satisfaction
        if (feedback.rating >= 4) {
            // User was satisfied - no preference changes needed
        }
        else if (feedback.rating <= 2) {
            // User was dissatisfied - might want to adjust verbosity or approach
            if (feedback.comments?.includes('too verbose')) {
                this.context.userPreferences.verbosity = 'concise';
            }
            else if (feedback.comments?.includes('not enough detail')) {
                this.context.userPreferences.verbosity = 'explanatory';
            }
        }
    }
    extractCommonPatterns(turns) {
        const patterns = new Map();
        turns.forEach(turn => {
            const pattern = `${turn.intent.type}:${turn.intent.action}`;
            patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
        });
        return Array.from(patterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pattern]) => pattern);
    }
    calculateProductiveHours(turns) {
        if (turns.length === 0)
            return 0;
        const firstTurn = turns[0];
        const lastTurn = turns[turns.length - 1];
        const totalTime = lastTurn.timestamp.getTime() - firstTurn.timestamp.getTime();
        return totalTime / (1000 * 60 * 60); // Convert to hours
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTurnId() {
        return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getActiveFiles() {
        // This would track files currently being worked on
        // For now, return empty array
        return [];
    }
    async getRecentlyModifiedFiles() {
        // This would scan for recently modified files in the project
        // For now, return empty array
        return [];
    }
    async ensurePersistenceDirectory() {
        try {
            await fs.mkdir(this.persistencePath, { recursive: true });
        }
        catch (error) {
            logger.error('Failed to create persistence directory:', error);
        }
    }
}
//# sourceMappingURL=conversation-manager.js.map