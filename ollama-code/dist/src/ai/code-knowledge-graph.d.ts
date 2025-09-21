/**
 * Code Knowledge Graph
 *
 * Advanced knowledge graph implementation for code analysis and relationship mapping.
 * Provides intelligent code understanding through graph-based analysis, pattern
 * identification, and contextual recommendations.
 *
 * Features:
 * - Semantic code indexing with entity recognition
 * - Multi-dimensional relationship mapping
 * - Architectural pattern identification
 * - Data flow analysis and visualization
 * - Best practices integration and suggestions
 * - Performance-optimized graph operations
 * - Dynamic graph updates and maintenance
 */
import { ProjectContext } from './context.js';
export interface GraphNode {
    id: string;
    type: 'file' | 'class' | 'function' | 'variable' | 'interface' | 'module' | 'concept';
    name: string;
    properties: Record<string, any>;
    metadata?: {
        created: Date;
        updated: Date;
        confidence: number;
        source: string;
    };
}
export interface GraphEdge {
    id: string;
    type: 'imports' | 'exports' | 'calls' | 'extends' | 'implements' | 'uses' | 'contains' | 'related_to';
    source: string;
    target: string;
    properties?: Record<string, any>;
    weight?: number;
    metadata?: {
        created: Date;
        confidence: number;
        strength: number;
    };
}
export interface GraphSchema {
    nodeTypes: string[];
    edgeTypes: string[];
    properties: string[];
    constraints?: {
        maxNodes: number;
        maxEdges: number;
        maxDepth: number;
    };
}
export interface CodePattern {
    id: string;
    type: 'service_layer' | 'repository' | 'factory' | 'observer' | 'singleton' | 'mvc' | 'crud_operations' | 'validation' | 'error_handling';
    name: string;
    confidence: number;
    nodes: string[];
    description?: string;
    examples?: string[];
    metadata?: {
        identified: Date;
        validator: string;
        complexity: 'low' | 'medium' | 'high';
    };
}
export interface BestPractice {
    id: string;
    category: 'architecture' | 'performance' | 'security' | 'maintainability' | 'testing';
    name: string;
    description: string;
    applicablePatterns: string[];
    recommendations: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface DataFlowPath {
    id: string;
    source: string;
    target: string;
    path: string[];
    flowType: 'data_dependency' | 'control_flow' | 'information_flow' | 'event_flow';
    confidence: number;
    complexity: 'low' | 'medium' | 'high';
    metadata?: {
        analyzed: Date;
        pathLength: number;
        cyclic: boolean;
    };
}
export interface GraphQuery {
    query: string;
    nodeTypes?: string[];
    edgeTypes?: string[];
    filters?: Record<string, any>;
    limit?: number;
    depth?: number;
    includePatterns?: boolean;
    includeBestPractices?: boolean;
}
export interface GraphQueryResult {
    nodes: GraphNode[];
    edges: GraphEdge[];
    patterns: CodePattern[];
    bestPractices: BestPractice[];
    dataFlows: DataFlowPath[];
    confidence: number;
    executionTime: number;
    metadata: {
        queryId: string;
        timestamp: Date;
        resultCount: number;
        cacheHit: boolean;
    };
}
export interface RelatedCodeResult {
    directRelations: Array<{
        id: string;
        type: string;
        name: string;
        distance: number;
        relationshipType: string;
        confidence: number;
    }>;
    indirectRelations: Array<{
        id: string;
        type: string;
        name: string;
        distance: number;
        path: string[];
        confidence: number;
    }>;
    patterns: CodePattern[];
    confidence: number;
    metadata: {
        searchDepth: number;
        totalRelations: number;
        searchTime: number;
    };
}
export interface ImprovementSuggestion {
    id: string;
    type: 'architecture' | 'performance' | 'security' | 'maintainability' | 'testing' | 'code_quality';
    category: 'refactoring' | 'optimization' | 'modernization' | 'best_practices';
    title: string;
    suggestion: string;
    rationale: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
    applicableNodes: string[];
    relatedPatterns: string[];
    bestPractices: string[];
    metadata?: {
        generated: Date;
        source: string;
        validated: boolean;
    };
}
export interface GraphConfig {
    maxNodes: number;
    maxEdges: number;
    maxPatterns: number;
    indexingTimeout: number;
    queryTimeout: number;
    enableCaching: boolean;
    cacheExpirationMs: number;
    enablePatternMatching: boolean;
    enableDataFlowAnalysis: boolean;
    enableBestPracticesLinking: boolean;
    performanceOptimization: boolean;
    maxCacheSize: number;
    maxSearchDepth: number;
    confidenceThreshold: number;
}
export interface GraphStatistics {
    graph: {
        nodeCount: number;
        edgeCount: number;
        patternCount: number;
        bestPracticeCount: number;
        density: number;
        avgDegree: number;
        maxDepth: number;
        componentCount: number;
    };
    performance: {
        avgQueryTime: number;
        avgIndexingTime: number;
        cacheHitRate: number;
        memoryUsage: number;
        lastOptimization: Date;
    };
    quality: {
        avgConfidence: number;
        patternCoverage: number;
        relationshipAccuracy: number;
        dataFlowCompleteness: number;
        bestPracticeAdherence: number;
    };
    usage: {
        totalQueries: number;
        uniqueQueries: number;
        avgResultSize: number;
        popularNodeTypes: string[];
        commonPatterns: string[];
    };
}
/**
 * Code Knowledge Graph Implementation
 *
 * Main class providing comprehensive graph-based code analysis capabilities
 */
export declare class CodeKnowledgeGraph {
    private aiClient;
    private projectContext;
    private config;
    private initialized;
    private nodeIndex;
    private edgeIndex;
    private patternIndex;
    private bestPracticeIndex;
    private dataFlowIndex;
    private queryCache;
    private relatedCodeCache;
    private patternCache;
    private schema;
    private statistics;
    private lastOptimization;
    private nodeTypePatterns;
    private edgeTypePatterns;
    private architecturalPatterns;
    constructor(aiClient: any, projectContext: ProjectContext, config?: Partial<GraphConfig>);
    /**
     * Initialize the knowledge graph
     */
    initialize(): Promise<void>;
    /**
     * Initialize pattern recognition system
     */
    private initializePatternRecognition;
    /**
     * Build graph schema
     */
    buildGraphSchema(): Promise<GraphSchema>;
    /**
     * Index code elements from project files
     */
    indexCodeElements(): Promise<GraphNode[]>;
    /**
     * Index a single file as a node
     */
    private indexFile;
    /**
     * Index elements within a file
     */
    private indexFileElements;
    /**
     * Extract class nodes from file content
     */
    private extractClasses;
    /**
     * Extract function nodes from file content
     */
    private extractFunctions;
    /**
     * Extract variable nodes from file content
     */
    private extractVariables;
    /**
     * Extract interface nodes from file content
     */
    private extractInterfaces;
    /**
     * Build relationships between nodes
     */
    buildRelationships(): Promise<GraphEdge[]>;
    /**
     * Build relationships between files (imports, etc.)
     */
    private buildFileRelationships;
    /**
     * Build relationships between code elements
     */
    private buildElementRelationships;
    /**
     * Identify architectural patterns in the codebase
     */
    identifyPatterns(): Promise<CodePattern[]>;
    /**
     * Link best practices to identified patterns
     */
    linkBestPractices(): Promise<Array<{
        pattern: string;
        practices: string[];
    }>>;
    /**
     * Analyze data flows in the codebase
     */
    analyzeDataFlows(): Promise<DataFlowPath[]>;
    /**
     * Query the knowledge graph
     */
    queryGraph(query: string, options?: Partial<GraphQuery>): Promise<GraphQueryResult>;
    /**
     * Find code related to a specific element
     */
    findRelatedCode(elementId: string, options?: {
        maxDepth?: number;
        includePatterns?: boolean;
    }): Promise<RelatedCodeResult>;
    /**
     * Get data flow between two nodes
     */
    getDataFlow(startNode: string, endNode: string): Promise<DataFlowPath | null>;
    /**
     * Generate improvement suggestions based on context
     */
    suggestImprovements(context: {
        context?: string;
        nodeIds?: string[];
    }): Promise<ImprovementSuggestion[]>;
    /**
     * Generate pattern-based improvement suggestions
     */
    private generatePatternBasedSuggestions;
    /**
     * Generate node-based improvement suggestions
     */
    private generateNodeBasedSuggestions;
    /**
     * Generate general architecture suggestions
     */
    private generateArchitectureSuggestions;
    /**
     * Get comprehensive graph statistics
     */
    getStatistics(): GraphStatistics;
    /**
     * Update internal statistics
     */
    private updateStatistics;
    /**
     * Node and edge manipulation methods
     */
    addNode(node: GraphNode): Promise<string>;
    updateNode(nodeId: string, properties: Record<string, any>): Promise<boolean>;
    removeNode(nodeId: string): Promise<boolean>;
    addEdge(edge: GraphEdge): Promise<string>;
    removeEdge(edgeId: string): Promise<boolean>;
    /**
     * Utility methods
     */
    private generateId;
    private getLineNumber;
    private resolveImportPath;
    private calculatePatternConfidence;
    private assessPatternComplexity;
    private calculateQueryConfidence;
    private calculateRelationshipConfidence;
    private calculateCacheHitRate;
    private estimateMemoryUsage;
    /**
     * Public API methods
     */
    clear(): void;
    isReady(): boolean;
}
