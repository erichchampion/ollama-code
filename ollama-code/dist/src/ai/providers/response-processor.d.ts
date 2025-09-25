/**
 * Provider Response Processor
 *
 * Handles provider-specific response processing, formatting, and normalization
 * to ensure consistent output across different AI providers while preserving
 * provider-specific capabilities and features.
 */
export interface ProcessedResponse {
    content: string;
    metadata: ResponseMetadata;
    formattedContent: FormattedContent;
    qualityScore: number;
    processingTime: number;
}
export interface ResponseMetadata {
    providerId: string;
    model: string;
    tokens: {
        input: number;
        output: number;
        total: number;
    };
    cost: number;
    latency: number;
    confidence?: number;
    reasoning?: string[];
    citations?: Citation[];
    capabilities: string[];
}
export interface FormattedContent {
    plainText: string;
    markdown: string;
    structured?: StructuredResponse;
    codeBlocks?: CodeBlock[];
    suggestions?: Suggestion[];
}
export interface StructuredResponse {
    sections: ResponseSection[];
    summary: string;
    keyPoints: string[];
    actionItems?: ActionItem[];
}
export interface ResponseSection {
    title: string;
    content: string;
    type: 'explanation' | 'code' | 'analysis' | 'recommendation' | 'example';
    priority: 'high' | 'medium' | 'low';
}
export interface CodeBlock {
    language: string;
    code: string;
    description?: string;
    filename?: string;
    startLine?: number;
    endLine?: number;
}
export interface Suggestion {
    type: 'improvement' | 'alternative' | 'optimization' | 'best-practice';
    description: string;
    implementation?: string;
    impact: 'low' | 'medium' | 'high';
}
export interface Citation {
    source: string;
    url?: string;
    relevance: number;
    context: string;
}
export interface ActionItem {
    description: string;
    priority: 'low' | 'medium' | 'high';
    effort: 'minimal' | 'low' | 'medium' | 'high';
    category: 'fix' | 'improve' | 'investigate' | 'implement';
}
export interface ProcessingOptions {
    includeMetadata?: boolean;
    formatCode?: boolean;
    extractSuggestions?: boolean;
    structureResponse?: boolean;
    qualityAnalysis?: boolean;
    preserveProviderFeatures?: boolean;
}
export declare class ResponseProcessor {
    private processors;
    constructor();
    /**
     * Initialize provider-specific processors
     */
    private initializeProcessors;
    /**
     * Process response from any provider
     */
    processResponse(response: any, providerId: string, options?: ProcessingOptions): Promise<ProcessedResponse>;
    /**
     * Format content based on processing options
     */
    private formatContent;
    /**
     * Strip all formatting to get plain text
     */
    private stripFormatting;
    /**
     * Ensure proper markdown formatting
     */
    private ensureMarkdownFormatting;
    /**
     * Detect programming language from code context
     */
    private detectLanguage;
    /**
     * Normalize heading hierarchy
     */
    private normalizeHeadings;
    /**
     * Extract code blocks from content
     */
    private extractCodeBlocks;
    /**
     * Extract description for code block from surrounding context
     */
    private extractCodeDescription;
    /**
     * Extract suggestions from content
     */
    private extractSuggestions;
    /**
     * Assess impact of suggestion
     */
    private assessSuggestionImpact;
    /**
     * Structure response into sections
     */
    private structureResponse;
    /**
     * Identify response sections
     */
    private identifyResponseSections;
    /**
     * Determine section type based on title
     */
    private determineSectionType;
    /**
     * Determine section priority based on title and content
     */
    private determineSectionPriority;
    /**
     * Generate summary of response
     */
    private generateSummary;
    /**
     * Extract key points from content
     */
    private extractKeyPoints;
    /**
     * Extract action items from content
     */
    private extractActionItems;
    /**
     * Assess action priority
     */
    private assessActionPriority;
    /**
     * Assess action effort
     */
    private assessActionEffort;
    /**
     * Categorize action type
     */
    private categorizeAction;
    /**
     * Calculate quality score for response
     */
    private calculateQualityScore;
}
