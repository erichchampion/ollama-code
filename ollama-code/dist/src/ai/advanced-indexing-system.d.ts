/**
 * Advanced Indexing System for Knowledge Graph
 *
 * Provides high-performance indexing capabilities including:
 * - B-tree indexes for range queries and sorting
 * - Full-text search indexes for code content
 * - Spatial indexes for location-based queries
 * - Composite indexes for complex query patterns
 * - Index maintenance during incremental updates
 */
import { ManagedEventEmitter } from '../utils/managed-event-emitter.js';
export interface BTreeNode<K, V> {
    keys: K[];
    values: V[];
    children?: BTreeNode<K, V>[];
    isLeaf: boolean;
    parent?: BTreeNode<K, V>;
}
export declare class BTreeIndex<K, V> {
    private root;
    private readonly order;
    private readonly compareFunction;
    constructor(order?: number, compareFunction?: (a: K, b: K) => number);
    insert(key: K, value: V): void;
    private insertNonFull;
    private splitChild;
    search(key: K): V | undefined;
    private searchNode;
    rangeSearch(startKey: K, endKey: K): Array<{
        key: K;
        value: V;
    }>;
    private rangeSearchNode;
}
export interface FullTextSearchResult {
    nodeId: string;
    score: number;
    matches: Array<{
        field: string;
        position: number;
        context: string;
    }>;
}
export interface InvertedIndexEntry {
    nodeId: string;
    field: string;
    positions: number[];
    frequency: number;
}
export declare class FullTextSearchIndex {
    private invertedIndex;
    private documentFrequency;
    private totalDocuments;
    private stopWords;
    addDocument(nodeId: string, content: Map<string, string>): void;
    private tokenize;
    search(query: string, limit?: number): FullTextSearchResult[];
    private getContext;
    updateDocument(nodeId: string, content: Map<string, string>): void;
    removeDocument(nodeId: string): void;
}
export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export interface SpatialEntry {
    id: string;
    boundingBox: BoundingBox;
    data: any;
}
export declare class SpatialIndex {
    private maxEntries;
    private minEntries;
    private root;
    constructor(maxEntries?: number);
    insert(entry: SpatialEntry): void;
    private chooseLeaf;
    private calculateEnlargement;
    private expandBoundingBox;
    private calculateArea;
    private adjustTree;
    private splitNode;
    private updateBoundingBox;
    search(queryBox: BoundingBox): SpatialEntry[];
    private searchNode;
    private intersects;
}
export interface CompositeIndexKey {
    [field: string]: any;
}
export interface CompositeIndexOptions {
    fields: string[];
    unique?: boolean;
    sparse?: boolean;
}
export declare class CompositeIndex {
    private options;
    private index;
    constructor(options: CompositeIndexOptions);
    addEntry(nodeId: string, values: CompositeIndexKey): void;
    private createCompositeKey;
    search(values: Partial<CompositeIndexKey>): string[];
    private createPartialSearchPattern;
    private matchesPattern;
    removeEntry(nodeId: string, values: CompositeIndexKey): void;
}
export interface IndexConfiguration {
    btreeIndexes: Array<{
        name: string;
        keyField: string;
        compareFunction?: (a: any, b: any) => number;
    }>;
    fullTextIndexes: Array<{
        name: string;
        fields: string[];
    }>;
    spatialIndexes: Array<{
        name: string;
        coordinateFields: {
            x: string;
            y: string;
            width?: string;
            height?: string;
        };
    }>;
    compositeIndexes: Array<{
        name: string;
        fields: string[];
        unique?: boolean;
        sparse?: boolean;
    }>;
}
export declare class AdvancedIndexingSystem extends ManagedEventEmitter {
    private btreeIndexes;
    private fullTextIndexes;
    private spatialIndexes;
    private compositeIndexes;
    private configuration;
    constructor(configuration: IndexConfiguration);
    private initializeIndexes;
    addNode(nodeId: string, nodeData: any): void;
    updateNode(nodeId: string, oldData: any, newData: any): void;
    removeNode(nodeId: string, nodeData: any): void;
    searchBTree(indexName: string, key: any): string | undefined;
    rangeBTreeSearch(indexName: string, startKey: any, endKey: any): Array<{
        key: any;
        value: string;
    }>;
    fullTextSearch(indexName: string, query: string, limit?: number): FullTextSearchResult[];
    spatialSearch(indexName: string, boundingBox: BoundingBox): SpatialEntry[];
    compositeSearch(indexName: string, values: Partial<CompositeIndexKey>): string[];
    getIndexStats(): {
        btreeIndexCount: number;
        fullTextIndexCount: number;
        spatialIndexCount: number;
        compositeIndexCount: number;
        totalIndexCount: number;
    };
    private getIndexCount;
    rebuildIndexes(nodeDataProvider: (nodeId: string) => any): void;
}
