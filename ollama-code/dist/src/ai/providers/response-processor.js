/**
 * Provider Response Processor
 *
 * Handles provider-specific response processing, formatting, and normalization
 * to ensure consistent output across different AI providers while preserving
 * provider-specific capabilities and features.
 */
import { logger } from '../../utils/logger.js';
export class ResponseProcessor {
    processors;
    constructor() {
        this.processors = new Map();
        this.initializeProcessors();
    }
    /**
     * Initialize provider-specific processors
     */
    initializeProcessors() {
        this.processors.set('ollama', new OllamaResponseProcessor());
        this.processors.set('openai', new OpenAIResponseProcessor());
        this.processors.set('anthropic', new AnthropicResponseProcessor());
        this.processors.set('google', new GoogleResponseProcessor());
    }
    /**
     * Process response from any provider
     */
    async processResponse(response, providerId, options = {}) {
        const startTime = Date.now();
        try {
            const processor = this.processors.get(providerId);
            if (!processor) {
                throw new Error(`No processor found for provider: ${providerId}`);
            }
            // Extract basic content and metadata
            const metadata = processor.extractMetadata(response);
            const content = processor.extractContent(response);
            // Format content based on options
            const formattedContent = await this.formatContent(content, metadata, options);
            // Calculate quality score
            const qualityScore = options.qualityAnalysis
                ? this.calculateQualityScore(content, metadata, formattedContent)
                : 0;
            const processingTime = Date.now() - startTime;
            return {
                content,
                metadata,
                formattedContent,
                qualityScore,
                processingTime
            };
        }
        catch (error) {
            logger.error(`Error processing response from ${providerId}:`, error);
            throw error;
        }
    }
    /**
     * Format content based on processing options
     */
    async formatContent(content, metadata, options) {
        const formatted = {
            plainText: this.stripFormatting(content),
            markdown: this.ensureMarkdownFormatting(content)
        };
        if (options.formatCode) {
            formatted.codeBlocks = this.extractCodeBlocks(content);
        }
        if (options.extractSuggestions) {
            formatted.suggestions = this.extractSuggestions(content);
        }
        if (options.structureResponse) {
            formatted.structured = this.structureResponse(content);
        }
        return formatted;
    }
    /**
     * Strip all formatting to get plain text
     */
    stripFormatting(content) {
        return content
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, '') // Remove inline code
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/#{1,6}\s*(.*)/g, '$1') // Remove headers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
            .replace(/\n\s*\n/g, '\n') // Remove extra newlines
            .trim();
    }
    /**
     * Ensure proper markdown formatting
     */
    ensureMarkdownFormatting(content) {
        // Ensure code blocks have proper language tags
        let formatted = content.replace(/```(\w*)\n/g, (match, lang) => {
            if (!lang) {
                // Try to detect language from context
                const detectedLang = this.detectLanguage(match);
                return `\`\`\`${detectedLang}\n`;
            }
            return match;
        });
        // Ensure proper heading hierarchy
        formatted = this.normalizeHeadings(formatted);
        return formatted;
    }
    /**
     * Detect programming language from code context
     */
    detectLanguage(codeBlock) {
        const indicators = {
            typescript: /interface\s+\w+|type\s+\w+\s*=|import.*from|export/,
            javascript: /function\s+\w+|const\s+\w+\s*=|require\(/,
            python: /def\s+\w+|import\s+\w+|from\s+\w+\s+import/,
            java: /public\s+class|private\s+\w+|import\s+java\./,
            cpp: /#include|std::|template\s*</,
            rust: /fn\s+\w+|let\s+\w+|use\s+\w+::/,
            go: /func\s+\w+|package\s+\w+|import\s+"/
        };
        for (const [lang, pattern] of Object.entries(indicators)) {
            if (pattern.test(codeBlock)) {
                return lang;
            }
        }
        return 'text';
    }
    /**
     * Normalize heading hierarchy
     */
    normalizeHeadings(content) {
        const lines = content.split('\n');
        const currentLevel = 1;
        return lines.map(line => {
            if (line.match(/^#{1,6}\s+/)) {
                const level = Math.min(currentLevel + 1, 6);
                const text = line.replace(/^#{1,6}\s+/, '');
                return `${'#'.repeat(level)} ${text}`;
            }
            return line;
        }).join('\n');
    }
    /**
     * Extract code blocks from content
     */
    extractCodeBlocks(content) {
        const codeBlocks = [];
        const regex = /```(\w*)\n([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [, language, code] = match;
            const description = this.extractCodeDescription(content, match.index);
            codeBlocks.push({
                language: language || this.detectLanguage(code),
                code: code.trim(),
                description
            });
        }
        return codeBlocks;
    }
    /**
     * Extract description for code block from surrounding context
     */
    extractCodeDescription(content, codeIndex) {
        const before = content.substring(0, codeIndex);
        const lines = before.split('\n').reverse();
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#') && !line.startsWith('```')) {
                return line.trim();
            }
        }
        return undefined;
    }
    /**
     * Extract suggestions from content
     */
    extractSuggestions(content) {
        const suggestions = [];
        const patterns = {
            improvement: /(?:improve|enhance|better|optimize)[\s\S]*?(?:\n|$)/gi,
            alternative: /(?:alternative|instead|consider|try)[\s\S]*?(?:\n|$)/gi,
            optimization: /(?:performance|efficient|faster|optimize)[\s\S]*?(?:\n|$)/gi,
            'best-practice': /(?:best practice|recommendation|should|avoid)[\s\S]*?(?:\n|$)/gi
        };
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    suggestions.push({
                        type: type,
                        description: match.trim(),
                        impact: this.assessSuggestionImpact(match)
                    });
                });
            }
        }
        return suggestions;
    }
    /**
     * Assess impact of suggestion
     */
    assessSuggestionImpact(suggestion) {
        const highImpactKeywords = ['critical', 'important', 'significant', 'major'];
        const mediumImpactKeywords = ['moderate', 'consider', 'should'];
        const text = suggestion.toLowerCase();
        if (highImpactKeywords.some(keyword => text.includes(keyword))) {
            return 'high';
        }
        if (mediumImpactKeywords.some(keyword => text.includes(keyword))) {
            return 'medium';
        }
        return 'low';
    }
    /**
     * Structure response into sections
     */
    structureResponse(content) {
        const sections = this.identifyResponseSections(content);
        const summary = this.generateSummary(content);
        const keyPoints = this.extractKeyPoints(content);
        const actionItems = this.extractActionItems(content);
        return {
            sections,
            summary,
            keyPoints,
            actionItems
        };
    }
    /**
     * Identify response sections
     */
    identifyResponseSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;
        let currentContent = [];
        for (const line of lines) {
            if (line.match(/^#{1,6}\s+/)) {
                // Save previous section
                if (currentSection) {
                    currentSection.content = currentContent.join('\n').trim();
                    if (currentSection.content) {
                        sections.push(currentSection);
                    }
                }
                // Start new section
                const title = line.replace(/^#{1,6}\s+/, '');
                currentSection = {
                    title,
                    content: '',
                    type: this.determineSectionType(title),
                    priority: this.determineSectionPriority(title)
                };
                currentContent = [];
            }
            else if (currentSection) {
                currentContent.push(line);
            }
            else {
                // Content before first heading
                if (!sections.length) {
                    sections.push({
                        title: 'Introduction',
                        content: line,
                        type: 'explanation',
                        priority: 'medium'
                    });
                }
            }
        }
        // Add last section
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            if (currentSection.content) {
                sections.push(currentSection);
            }
        }
        return sections;
    }
    /**
     * Determine section type based on title
     */
    determineSectionType(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('code') || titleLower.includes('implementation')) {
            return 'code';
        }
        if (titleLower.includes('analysis') || titleLower.includes('review')) {
            return 'analysis';
        }
        if (titleLower.includes('recommend') || titleLower.includes('suggest')) {
            return 'recommendation';
        }
        if (titleLower.includes('example') || titleLower.includes('sample')) {
            return 'example';
        }
        return 'explanation';
    }
    /**
     * Determine section priority based on title and content
     */
    determineSectionPriority(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('critical') || titleLower.includes('important') || titleLower.includes('fix')) {
            return 'high';
        }
        if (titleLower.includes('optional') || titleLower.includes('nice')) {
            return 'low';
        }
        return 'medium';
    }
    /**
     * Generate summary of response
     */
    generateSummary(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const firstSentence = sentences[0]?.trim();
        const lastSentence = sentences[sentences.length - 1]?.trim();
        if (firstSentence && lastSentence && firstSentence !== lastSentence) {
            return `${firstSentence}. ${lastSentence}.`;
        }
        return firstSentence ? `${firstSentence}.` : 'No summary available.';
    }
    /**
     * Extract key points from content
     */
    extractKeyPoints(content) {
        const keyPoints = [];
        // Extract bullet points
        const bulletPoints = content.match(/^[\s]*[-*•]\s+(.+)$/gm);
        if (bulletPoints) {
            keyPoints.push(...bulletPoints.map(point => point.replace(/^[\s]*[-*•]\s+/, '').trim()));
        }
        // Extract numbered points
        const numberedPoints = content.match(/^[\s]*\d+\.\s+(.+)$/gm);
        if (numberedPoints) {
            keyPoints.push(...numberedPoints.map(point => point.replace(/^[\s]*\d+\.\s+/, '').trim()));
        }
        return keyPoints.slice(0, 5); // Limit to top 5 key points
    }
    /**
     * Extract action items from content
     */
    extractActionItems(content) {
        const actionItems = [];
        const actionPatterns = [
            /(?:need to|should|must|action|todo|fix|implement|add|update|create|remove)[\s\S]*?(?:\n|$)/gi
        ];
        for (const pattern of actionPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const description = match.trim();
                    actionItems.push({
                        description,
                        priority: this.assessActionPriority(description),
                        effort: this.assessActionEffort(description),
                        category: this.categorizeAction(description)
                    });
                });
            }
        }
        return actionItems.slice(0, 10); // Limit to top 10 action items
    }
    /**
     * Assess action priority
     */
    assessActionPriority(description) {
        const text = description.toLowerCase();
        if (text.includes('critical') || text.includes('urgent') || text.includes('must')) {
            return 'high';
        }
        if (text.includes('should') || text.includes('important')) {
            return 'medium';
        }
        return 'low';
    }
    /**
     * Assess action effort
     */
    assessActionEffort(description) {
        const text = description.toLowerCase();
        if (text.includes('complex') || text.includes('rewrite') || text.includes('refactor')) {
            return 'high';
        }
        if (text.includes('update') || text.includes('modify') || text.includes('change')) {
            return 'medium';
        }
        if (text.includes('add') || text.includes('fix') || text.includes('simple')) {
            return 'low';
        }
        return 'minimal';
    }
    /**
     * Categorize action type
     */
    categorizeAction(description) {
        const text = description.toLowerCase();
        if (text.includes('fix') || text.includes('bug') || text.includes('error')) {
            return 'fix';
        }
        if (text.includes('improve') || text.includes('optimize') || text.includes('enhance')) {
            return 'improve';
        }
        if (text.includes('investigate') || text.includes('analyze') || text.includes('check')) {
            return 'investigate';
        }
        return 'implement';
    }
    /**
     * Calculate quality score for response
     */
    calculateQualityScore(content, metadata, formatted) {
        let score = 0;
        let factors = 0;
        // Content length factor (20%)
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 50) {
            score += Math.min(wordCount / 500, 1) * 20;
        }
        factors += 20;
        // Code quality factor (25%)
        if (formatted.codeBlocks && formatted.codeBlocks.length > 0) {
            const avgCodeLength = formatted.codeBlocks.reduce((sum, block) => sum + block.code.split('\n').length, 0) / formatted.codeBlocks.length;
            score += Math.min(avgCodeLength / 20, 1) * 25;
        }
        factors += 25;
        // Structure factor (20%)
        if (formatted.structured) {
            const sectionCount = formatted.structured.sections.length;
            score += Math.min(sectionCount / 3, 1) * 20;
        }
        factors += 20;
        // Suggestion quality factor (15%)
        if (formatted.suggestions && formatted.suggestions.length > 0) {
            const highImpactSuggestions = formatted.suggestions.filter(s => s.impact === 'high').length;
            score += Math.min(highImpactSuggestions / 2, 1) * 15;
        }
        factors += 15;
        // Provider confidence factor (10%)
        if (metadata.confidence) {
            score += metadata.confidence * 10;
        }
        factors += 10;
        // Response time factor (10%)
        const responseTimeScore = Math.max(0, 1 - (metadata.latency / 10000)); // Penalize >10s responses
        score += responseTimeScore * 10;
        factors += 10;
        return Math.round((score / factors) * 100);
    }
}
/**
 * Base class for provider-specific response processors
 */
class ProviderResponseProcessor {
}
/**
 * Ollama response processor
 */
class OllamaResponseProcessor extends ProviderResponseProcessor {
    extractContent(response) {
        return response.response || response.content || '';
    }
    extractMetadata(response) {
        return {
            providerId: 'ollama',
            model: response.model || 'unknown',
            tokens: {
                input: response.prompt_eval_count || 0,
                output: response.eval_count || 0,
                total: (response.prompt_eval_count || 0) + (response.eval_count || 0)
            },
            cost: 0, // Ollama is typically free
            latency: response.total_duration ? response.total_duration / 1000000 : 0,
            capabilities: ['text-generation', 'chat']
        };
    }
}
/**
 * OpenAI response processor
 */
class OpenAIResponseProcessor extends ProviderResponseProcessor {
    extractContent(response) {
        if (response.choices && response.choices[0]) {
            return response.choices[0].message?.content || response.choices[0].text || '';
        }
        return '';
    }
    extractMetadata(response) {
        const usage = response.usage || {};
        return {
            providerId: 'openai',
            model: response.model || 'unknown',
            tokens: {
                input: usage.prompt_tokens || 0,
                output: usage.completion_tokens || 0,
                total: usage.total_tokens || 0
            },
            cost: this.calculateOpenAICost(response.model, usage),
            latency: response.response_time || 0,
            capabilities: ['text-generation', 'chat', 'function-calling']
        };
    }
    calculateOpenAICost(model, usage) {
        // Simplified cost calculation (would need actual pricing)
        const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002;
        return (usage.total_tokens || 0) * costPerToken;
    }
}
/**
 * Anthropic response processor
 */
class AnthropicResponseProcessor extends ProviderResponseProcessor {
    extractContent(response) {
        if (response.content && Array.isArray(response.content)) {
            return response.content.map((c) => c.text || '').join('');
        }
        return response.content || '';
    }
    extractMetadata(response) {
        const usage = response.usage || {};
        return {
            providerId: 'anthropic',
            model: response.model || 'claude-3',
            tokens: {
                input: usage.input_tokens || 0,
                output: usage.output_tokens || 0,
                total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
            },
            cost: this.calculateAnthropicCost(response.model, usage),
            latency: response.response_time || 0,
            capabilities: ['text-generation', 'chat', 'analysis', 'reasoning']
        };
    }
    calculateAnthropicCost(model, usage) {
        // Simplified cost calculation
        const costPerToken = 0.000015;
        return ((usage.input_tokens || 0) + (usage.output_tokens || 0)) * costPerToken;
    }
}
/**
 * Google response processor
 */
class GoogleResponseProcessor extends ProviderResponseProcessor {
    extractContent(response) {
        if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                return candidate.content.parts.map((p) => p.text || '').join('');
            }
        }
        return '';
    }
    extractMetadata(response) {
        const usage = response.usageMetadata || {};
        return {
            providerId: 'google',
            model: 'gemini-pro',
            tokens: {
                input: usage.promptTokenCount || 0,
                output: usage.candidatesTokenCount || 0,
                total: usage.totalTokenCount || 0
            },
            cost: this.calculateGoogleCost(usage),
            latency: response.response_time || 0,
            capabilities: ['text-generation', 'chat', 'multimodal', 'function-calling']
        };
    }
    calculateGoogleCost(usage) {
        // Simplified cost calculation
        const costPerToken = 0.000001;
        return (usage.totalTokenCount || 0) * costPerToken;
    }
}
//# sourceMappingURL=response-processor.js.map