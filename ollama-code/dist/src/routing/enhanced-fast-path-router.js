/**
 * Enhanced Fast-Path Router
 *
 * High-performance router that bypasses AI analysis for obvious commands.
 * Implements comprehensive pattern matching, fuzzy matching, and confidence scoring.
 */
import { logger } from '../utils/logger.js';
import { commandRegistry } from '../commands/index.js';
import { FAST_PATH_CONFIG_DEFAULTS } from '../constants/streaming.js';
/**
 * Enhanced fast-path router with multiple matching strategies
 */
export class EnhancedFastPathRouter {
    config;
    patternRules;
    aliasMap;
    commandCache;
    constructor(config = {}) {
        this.config = {
            ...FAST_PATH_CONFIG_DEFAULTS,
            ...config
        };
        this.patternRules = new Map();
        this.aliasMap = new Map();
        this.commandCache = new Map();
        this.initializePatternRules();
        this.initializeAliases();
    }
    /**
     * Check if input can be handled by fast-path routing
     */
    async checkFastPath(input) {
        const startTime = performance.now();
        try {
            // Normalize input
            const normalizedInput = this.normalizeInput(input);
            // Check cache first
            const cached = this.commandCache.get(normalizedInput);
            if (cached) {
                logger.debug('Fast-path cache hit', { input: input.substring(0, 50), command: cached.commandName });
                return cached;
            }
            // Try different matching strategies in order of speed/accuracy
            const strategies = [
                () => this.exactMatch(normalizedInput),
                () => this.aliasMatch(normalizedInput),
                () => this.patternMatch(normalizedInput),
                () => this.config.enableFuzzyMatching ? this.fuzzyMatch(normalizedInput) : null
            ];
            for (const strategy of strategies) {
                const result = strategy();
                if (result && result.confidence > 0.6) {
                    // Cache successful matches
                    this.commandCache.set(normalizedInput, result);
                    const duration = performance.now() - startTime;
                    logger.debug('Fast-path match found', {
                        method: result.method,
                        confidence: result.confidence,
                        duration: `${duration.toFixed(2)}ms`
                    });
                    return result;
                }
                // Respect time budget
                if (performance.now() - startTime > this.config.maxProcessingTime) {
                    logger.debug('Fast-path processing timeout');
                    break;
                }
            }
            logger.debug('No fast-path match found', { input: input.substring(0, 50) });
            return null;
        }
        catch (error) {
            logger.error('Fast-path routing error:', error);
            return null;
        }
    }
    /**
     * Exact command name matching
     */
    exactMatch(input) {
        const trimmed = input.trim();
        const parts = trimmed.split(/\s+/);
        const commandName = parts[0];
        if (commandRegistry.exists(commandName)) {
            return {
                commandName,
                args: parts.slice(1),
                confidence: 1.0,
                method: 'exact'
            };
        }
        return null;
    }
    /**
     * Alias-based matching
     */
    aliasMatch(input) {
        if (!this.config.enableAliases)
            return null;
        const trimmed = input.trim().toLowerCase();
        const parts = trimmed.split(/\s+/);
        const potential = parts[0];
        const commandName = this.aliasMap.get(potential);
        if (commandName && commandRegistry.exists(commandName)) {
            return {
                commandName,
                args: parts.slice(1),
                confidence: 0.95,
                method: 'alias'
            };
        }
        return null;
    }
    /**
     * Pattern-based matching with confidence scoring
     */
    patternMatch(input) {
        const trimmed = input.trim().toLowerCase();
        let bestMatch = null;
        let bestScore = 0;
        for (const [category, rules] of this.patternRules) {
            for (const rule of rules) {
                for (const pattern of rule.patterns) {
                    const score = this.calculatePatternScore(trimmed, pattern);
                    if (score > bestScore && score > 0.6) {
                        bestScore = score;
                        bestMatch = {
                            commandName: rule.command,
                            args: rule.extractArgs ? rule.extractArgs(input) : [],
                            confidence: score * rule.confidence,
                            method: 'pattern'
                        };
                    }
                }
            }
        }
        return bestMatch;
    }
    /**
     * Fuzzy matching for typos and variations
     */
    fuzzyMatch(input) {
        const trimmed = input.trim().toLowerCase();
        const parts = trimmed.split(/\s+/);
        const potential = parts[0];
        const commands = commandRegistry.list();
        let bestMatch = null;
        let bestScore = 0;
        for (const command of commands) {
            const score = this.calculateFuzzyScore(potential, command.name);
            if (score > bestScore && score >= this.config.fuzzyThreshold) {
                bestScore = score;
                bestMatch = {
                    commandName: command.name,
                    args: parts.slice(1),
                    confidence: score * 0.8, // Lower confidence for fuzzy matches
                    method: 'fuzzy'
                };
            }
        }
        return bestMatch;
    }
    /**
     * Initialize comprehensive pattern rules
     */
    initializePatternRules() {
        // Git commands
        this.patternRules.set('git', [
            {
                patterns: [
                    'git status',
                    'check status',
                    'check the status',
                    'show status',
                    'show git status',
                    'show me status',
                    'show me git status',
                    'show me the status',
                    'show me the git status',
                    'display status',
                    'display git status',
                    'get status',
                    'get git status',
                    'what is the status',
                    'what is the git status',
                    'current status',
                    'repo status',
                    'repository status',
                    'status of repo',
                    'status of repository',
                    'status of this repo'
                ],
                command: 'git-status',
                confidence: 0.95
            },
            {
                patterns: [
                    'git commit',
                    'create commit',
                    'make commit',
                    'commit changes',
                    'commit the changes',
                    'save changes',
                    'save the changes'
                ],
                command: 'git-commit',
                confidence: 0.9
            },
            {
                patterns: [
                    'git branch',
                    'list branch',
                    'list branches',
                    'show branch',
                    'show branches',
                    'branch info',
                    'current branch',
                    'what branch'
                ],
                command: 'git-branch',
                confidence: 0.9
            }
        ]);
        // Model commands
        this.patternRules.set('models', [
            {
                patterns: [
                    'list models',
                    'show models',
                    'available models',
                    'what models',
                    'models list',
                    'get models'
                ],
                command: 'list-models',
                confidence: 0.95
            },
            {
                patterns: [
                    'pull model',
                    'download model',
                    'get model',
                    'install model'
                ],
                command: 'pull-model',
                confidence: 0.9,
                extractArgs: (input) => {
                    const match = input.match(/(?:pull|download|get|install)\s+model\s+(\S+)/i);
                    return match ? [match[1]] : [];
                }
            }
        ]);
        // Help commands
        this.patternRules.set('help', [
            {
                patterns: [
                    'help',
                    'show help',
                    'get help',
                    'how to',
                    'what can you do',
                    'what commands',
                    'available commands',
                    'command list'
                ],
                command: 'help',
                confidence: 0.95
            }
        ]);
        // Search commands
        this.patternRules.set('search', [
            {
                patterns: [
                    'search for',
                    'find',
                    'look for',
                    'search',
                    'grep'
                ],
                command: 'search',
                confidence: 0.85,
                extractArgs: (input) => {
                    const match = input.match(/(?:search|find|look)\s+(?:for\s+)?(.+)/i);
                    return match ? [match[1].trim()] : [];
                }
            }
        ]);
    }
    /**
     * Initialize command aliases
     */
    initializeAliases() {
        if (!this.config.enableAliases) {
            this.aliasMap.clear();
            return;
        }
        const aliases = {
            // Common shortcuts
            'status': 'git-status',
            'st': 'git-status',
            'commit': 'git-commit',
            'ci': 'git-commit',
            'branch': 'git-branch',
            'br': 'git-branch',
            // Model shortcuts
            'models': 'list-models',
            'ls': 'list-models',
            'pull': 'pull-model',
            'download': 'pull-model',
            // General shortcuts
            'h': 'help',
            '?': 'help',
            's': 'search',
            'find': 'search',
            // Ask variants
            'ask': 'ask',
            'question': 'ask',
            'q': 'ask'
        };
        for (const [alias, command] of Object.entries(aliases)) {
            this.aliasMap.set(alias, command);
        }
    }
    /**
     * Calculate pattern matching score
     */
    calculatePatternScore(input, pattern) {
        // Exact match
        if (input === pattern)
            return 1.0;
        // Contains pattern
        if (input.includes(pattern))
            return 0.9;
        // Pattern contains input (partial match)
        if (pattern.includes(input))
            return 0.8;
        // Word-based matching
        const inputWords = input.split(/\s+/);
        const patternWords = pattern.split(/\s+/);
        let matchedWords = 0;
        for (const word of inputWords) {
            if (patternWords.some(pw => pw.includes(word) || word.includes(pw))) {
                matchedWords++;
            }
        }
        const wordScore = matchedWords / Math.max(inputWords.length, patternWords.length);
        // Lower the threshold for better matching
        if (wordScore > 0.3) {
            return Math.max(wordScore * 0.8, 0.7); // Ensure minimum score of 0.7 for partial matches
        }
        return 0;
    }
    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    calculateFuzzyScore(input, target) {
        if (input === target)
            return 1.0;
        // Handle exact prefix matches with high scores
        if (target.startsWith(input) || input.startsWith(target)) {
            return 0.85;
        }
        const distance = this.levenshteinDistance(input, target);
        const maxLength = Math.max(input.length, target.length);
        if (maxLength === 0)
            return 1.0;
        const score = 1 - (distance / maxLength);
        // Boost score for close matches
        if (distance <= 2 && maxLength >= 4) {
            return Math.min(score + 0.1, 1.0);
        }
        return score;
    }
    /**
     * Levenshtein distance calculation
     */
    levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
            }
        }
        return matrix[b.length][a.length];
    }
    /**
     * Normalize input for consistent processing
     */
    normalizeInput(input) {
        return input
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ') // Replace special chars with spaces
            .replace(/\s+/g, ' '); // Normalize whitespace
    }
    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        this.commandCache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        // This would be tracked in a real implementation
        return {
            size: this.commandCache.size,
            hitRate: 0 // Would track hits vs misses
        };
    }
}
//# sourceMappingURL=enhanced-fast-path-router.js.map