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
import { getPerformanceConfig } from '../config/performance.js';
export class BTreeIndex {
    root;
    order;
    compareFunction;
    constructor(order, compareFunction) {
        const config = getPerformanceConfig();
        this.order = order || config.indexing.btreeOrder;
        this.compareFunction = compareFunction || ((a, b) => a < b ? -1 : a > b ? 1 : 0);
        this.root = {
            keys: [],
            values: [],
            isLeaf: true
        };
    }
    insert(key, value) {
        if (this.root.keys.length === 2 * this.order - 1) {
            const newRoot = {
                keys: [],
                values: [],
                children: [this.root],
                isLeaf: false
            };
            this.root.parent = newRoot;
            this.splitChild(newRoot, 0);
            this.root = newRoot;
        }
        this.insertNonFull(this.root, key, value);
    }
    insertNonFull(node, key, value) {
        let i = node.keys.length - 1;
        if (node.isLeaf) {
            node.keys.push(key);
            node.values.push(value);
            while (i >= 0 && this.compareFunction(node.keys[i], key) > 0) {
                node.keys[i + 1] = node.keys[i];
                node.values[i + 1] = node.values[i];
                i--;
            }
            node.keys[i + 1] = key;
            node.values[i + 1] = value;
        }
        else {
            while (i >= 0 && this.compareFunction(node.keys[i], key) > 0) {
                i--;
            }
            i++;
            if (node.children[i].keys.length === 2 * this.order - 1) {
                this.splitChild(node, i);
                if (this.compareFunction(node.keys[i], key) < 0) {
                    i++;
                }
            }
            this.insertNonFull(node.children[i], key, value);
        }
    }
    splitChild(parent, index) {
        const fullChild = parent.children[index];
        const newChild = {
            keys: [],
            values: [],
            isLeaf: fullChild.isLeaf,
            parent: parent
        };
        const mid = this.order - 1;
        newChild.keys = fullChild.keys.splice(mid + 1);
        newChild.values = fullChild.values.splice(mid + 1);
        if (!fullChild.isLeaf) {
            newChild.children = fullChild.children.splice(mid + 1);
            newChild.children.forEach(child => child.parent = newChild);
        }
        parent.children.splice(index + 1, 0, newChild);
        parent.keys.splice(index, 0, fullChild.keys[mid]);
        parent.values.splice(index, 0, fullChild.values[mid]);
        fullChild.keys.splice(mid);
        fullChild.values.splice(mid);
    }
    search(key) {
        return this.searchNode(this.root, key);
    }
    searchNode(node, key) {
        let i = 0;
        while (i < node.keys.length && this.compareFunction(key, node.keys[i]) > 0) {
            i++;
        }
        if (i < node.keys.length && this.compareFunction(key, node.keys[i]) === 0) {
            return node.values[i];
        }
        if (node.isLeaf) {
            return undefined;
        }
        return this.searchNode(node.children[i], key);
    }
    rangeSearch(startKey, endKey) {
        const result = [];
        this.rangeSearchNode(this.root, startKey, endKey, result);
        return result;
    }
    rangeSearchNode(node, startKey, endKey, result) {
        let i = 0;
        while (i < node.keys.length) {
            if (!node.isLeaf) {
                if (this.compareFunction(node.keys[i], startKey) > 0) {
                    this.rangeSearchNode(node.children[i], startKey, endKey, result);
                }
            }
            if (this.compareFunction(node.keys[i], startKey) >= 0 && this.compareFunction(node.keys[i], endKey) <= 0) {
                result.push({ key: node.keys[i], value: node.values[i] });
            }
            i++;
        }
        if (!node.isLeaf && node.children.length > i) {
            this.rangeSearchNode(node.children[i], startKey, endKey, result);
        }
    }
}
export class FullTextSearchIndex {
    invertedIndex = new Map();
    documentFrequency = new Map();
    totalDocuments = 0;
    stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
        'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours'
    ]);
    addDocument(nodeId, content) {
        this.totalDocuments++;
        const processedTerms = new Set();
        for (const [field, text] of content.entries()) {
            const tokens = this.tokenize(text);
            for (let position = 0; position < tokens.length; position++) {
                const term = tokens[position];
                if (this.stopWords.has(term) || term.length < 2)
                    continue;
                if (!this.invertedIndex.has(term)) {
                    this.invertedIndex.set(term, []);
                }
                let entry = this.invertedIndex.get(term).find(e => e.nodeId === nodeId && e.field === field);
                if (!entry) {
                    entry = {
                        nodeId,
                        field,
                        positions: [],
                        frequency: 0
                    };
                    this.invertedIndex.get(term).push(entry);
                }
                entry.positions.push(position);
                entry.frequency++;
                // Track document frequency
                if (!processedTerms.has(term)) {
                    processedTerms.add(term);
                    this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
                }
            }
        }
    }
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }
    search(query, limit) {
        const config = getPerformanceConfig();
        const searchLimit = limit || config.indexing.fullTextSearchDefaultLimit;
        const queryTerms = this.tokenize(query).filter(term => !this.stopWords.has(term));
        if (queryTerms.length === 0)
            return [];
        const candidateDocuments = new Map();
        // Calculate TF-IDF scores
        for (const term of queryTerms) {
            const entries = this.invertedIndex.get(term) || [];
            const idf = Math.log(this.totalDocuments / (this.documentFrequency.get(term) || 1));
            for (const entry of entries) {
                const tf = entry.frequency / entry.positions.length;
                const score = tf * idf;
                if (!candidateDocuments.has(entry.nodeId)) {
                    candidateDocuments.set(entry.nodeId, { score: 0, matches: [] });
                }
                const candidate = candidateDocuments.get(entry.nodeId);
                candidate.score += score;
                // Add match information
                for (const position of entry.positions) {
                    candidate.matches.push({
                        field: entry.field,
                        position,
                        context: this.getContext(entry.nodeId, entry.field, position)
                    });
                }
            }
        }
        // Convert to results and sort by score
        const results = Array.from(candidateDocuments.entries())
            .map(([nodeId, data]) => ({
            nodeId,
            score: data.score,
            matches: data.matches
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, searchLimit);
        return results;
    }
    getContext(nodeId, field, position) {
        // In a real implementation, this would retrieve the actual text context
        // For now, return a placeholder
        return `...context around position ${position} in ${field}...`;
    }
    updateDocument(nodeId, content) {
        this.removeDocument(nodeId);
        this.addDocument(nodeId, content);
    }
    removeDocument(nodeId) {
        for (const [term, entries] of this.invertedIndex.entries()) {
            const filteredEntries = entries.filter(entry => entry.nodeId !== nodeId);
            if (filteredEntries.length === 0) {
                this.invertedIndex.delete(term);
                this.documentFrequency.delete(term);
            }
            else {
                this.invertedIndex.set(term, filteredEntries);
                // Recalculate document frequency
                const uniqueDocuments = new Set(filteredEntries.map(e => e.nodeId));
                this.documentFrequency.set(term, uniqueDocuments.size);
            }
        }
        this.totalDocuments--;
    }
}
export class SpatialIndex {
    maxEntries;
    minEntries;
    root;
    constructor(maxEntries) {
        const config = getPerformanceConfig();
        this.maxEntries = maxEntries || config.indexing.spatialIndexMaxEntries;
        this.minEntries = Math.ceil(this.maxEntries * 0.4);
        this.root = new SpatialNode(true);
    }
    insert(entry) {
        const leaf = this.chooseLeaf(entry.boundingBox);
        if (leaf.entries) {
            leaf.entries.push(entry);
        }
        this.adjustTree(leaf);
    }
    chooseLeaf(boundingBox) {
        let node = this.root;
        while (!node.isLeaf) {
            let bestChild = node.children[0];
            let minEnlargement = this.calculateEnlargement(bestChild.boundingBox, boundingBox);
            for (let i = 1; i < node.children.length; i++) {
                const child = node.children[i];
                const enlargement = this.calculateEnlargement(child.boundingBox, boundingBox);
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    bestChild = child;
                }
            }
            node = bestChild;
        }
        return node;
    }
    calculateEnlargement(existing, newBox) {
        const enlargedBox = this.expandBoundingBox(existing, newBox);
        return this.calculateArea(enlargedBox) - this.calculateArea(existing);
    }
    expandBoundingBox(box1, box2) {
        return {
            minX: Math.min(box1.minX, box2.minX),
            minY: Math.min(box1.minY, box2.minY),
            maxX: Math.max(box1.maxX, box2.maxX),
            maxY: Math.max(box1.maxY, box2.maxY)
        };
    }
    calculateArea(box) {
        return (box.maxX - box.minX) * (box.maxY - box.minY);
    }
    adjustTree(node) {
        if ((node.entries && node.entries.length > this.maxEntries) || (node.children && node.children.length > this.maxEntries)) {
            const [leftNode, rightNode] = this.splitNode(node);
            if (node === this.root) {
                this.root = new SpatialNode(false);
                this.root.children = [leftNode, rightNode];
                this.root.boundingBox = this.expandBoundingBox(leftNode.boundingBox, rightNode.boundingBox);
            }
        }
        this.updateBoundingBox(node);
    }
    splitNode(node) {
        // Simplified linear split algorithm
        const leftNode = new SpatialNode(node.isLeaf);
        const rightNode = new SpatialNode(node.isLeaf);
        if (node.isLeaf && node.entries) {
            const entries = node.entries;
            const midpoint = Math.floor(entries.length / 2);
            leftNode.entries = entries.slice(0, midpoint);
            rightNode.entries = entries.slice(midpoint);
        }
        else if (node.children) {
            const children = node.children;
            const midpoint = Math.floor(children.length / 2);
            leftNode.children = children.slice(0, midpoint);
            rightNode.children = children.slice(midpoint);
        }
        this.updateBoundingBox(leftNode);
        this.updateBoundingBox(rightNode);
        return [leftNode, rightNode];
    }
    updateBoundingBox(node) {
        if (node.isLeaf && node.entries && node.entries.length > 0) {
            let box = node.entries[0].boundingBox;
            for (let i = 1; i < node.entries.length; i++) {
                box = this.expandBoundingBox(box, node.entries[i].boundingBox);
            }
            node.boundingBox = box;
        }
        else if (node.children && node.children.length > 0) {
            let box = node.children[0].boundingBox;
            for (let i = 1; i < node.children.length; i++) {
                box = this.expandBoundingBox(box, node.children[i].boundingBox);
            }
            node.boundingBox = box;
        }
    }
    search(queryBox) {
        const results = [];
        this.searchNode(this.root, queryBox, results);
        return results;
    }
    searchNode(node, queryBox, results) {
        if (!this.intersects(node.boundingBox, queryBox)) {
            return;
        }
        if (node.isLeaf && node.entries) {
            for (const entry of node.entries) {
                if (this.intersects(entry.boundingBox, queryBox)) {
                    results.push(entry);
                }
            }
        }
        else if (node.children) {
            for (const child of node.children) {
                this.searchNode(child, queryBox, results);
            }
        }
    }
    intersects(box1, box2) {
        return box1.minX <= box2.maxX && box1.maxX >= box2.minX &&
            box1.minY <= box2.maxY && box1.maxY >= box2.minY;
    }
}
class SpatialNode {
    isLeaf;
    boundingBox;
    entries;
    children;
    constructor(isLeaf) {
        this.isLeaf = isLeaf;
        this.boundingBox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        if (isLeaf) {
            this.entries = [];
        }
        else {
            this.children = [];
        }
    }
}
export class CompositeIndex {
    options;
    index = new Map();
    constructor(options) {
        this.options = options;
    }
    addEntry(nodeId, values) {
        const key = this.createCompositeKey(values);
        if (!this.index.has(key)) {
            this.index.set(key, new Set());
        }
        if (this.options.unique && this.index.get(key).size > 0) {
            throw new Error(`Unique constraint violation for composite key: ${key}`);
        }
        this.index.get(key).add(nodeId);
    }
    createCompositeKey(values) {
        const keyParts = this.options.fields.map(field => {
            const value = values[field];
            if (value === null || value === undefined) {
                if (this.options.sparse) {
                    return null;
                }
                return 'NULL';
            }
            return String(value);
        });
        if (this.options.sparse && keyParts.some(part => part === null)) {
            return '';
        }
        return keyParts.join('|');
    }
    search(values) {
        const results = new Set();
        // Handle partial key searches
        const searchPattern = this.createPartialSearchPattern(values);
        for (const [key, nodeIds] of this.index.entries()) {
            if (this.matchesPattern(key, searchPattern)) {
                for (const nodeId of nodeIds) {
                    results.add(nodeId);
                }
            }
        }
        return Array.from(results);
    }
    createPartialSearchPattern(values) {
        const patternParts = this.options.fields.map(field => {
            const value = values[field];
            if (value === undefined) {
                return '*';
            }
            if (value === null) {
                return 'NULL';
            }
            return String(value);
        });
        return patternParts.join('|');
    }
    matchesPattern(key, pattern) {
        const keyParts = key.split('|');
        const patternParts = pattern.split('|');
        if (keyParts.length !== patternParts.length) {
            return false;
        }
        for (let i = 0; i < keyParts.length; i++) {
            if (patternParts[i] !== '*' && patternParts[i] !== keyParts[i]) {
                return false;
            }
        }
        return true;
    }
    removeEntry(nodeId, values) {
        const key = this.createCompositeKey(values);
        const nodeSet = this.index.get(key);
        if (nodeSet) {
            nodeSet.delete(nodeId);
            if (nodeSet.size === 0) {
                this.index.delete(key);
            }
        }
    }
}
export class AdvancedIndexingSystem extends ManagedEventEmitter {
    btreeIndexes = new Map();
    fullTextIndexes = new Map();
    spatialIndexes = new Map();
    compositeIndexes = new Map();
    configuration;
    constructor(configuration) {
        super();
        this.configuration = configuration;
        this.initializeIndexes();
    }
    initializeIndexes() {
        // Initialize B-tree indexes
        for (const config of this.configuration.btreeIndexes) {
            this.btreeIndexes.set(config.name, new BTreeIndex(50, config.compareFunction));
        }
        // Initialize full-text indexes
        for (const config of this.configuration.fullTextIndexes) {
            this.fullTextIndexes.set(config.name, new FullTextSearchIndex());
        }
        // Initialize spatial indexes
        for (const config of this.configuration.spatialIndexes) {
            this.spatialIndexes.set(config.name, new SpatialIndex());
        }
        // Initialize composite indexes
        for (const config of this.configuration.compositeIndexes) {
            this.compositeIndexes.set(config.name, new CompositeIndex({
                fields: config.fields,
                unique: config.unique,
                sparse: config.sparse
            }));
        }
    }
    addNode(nodeId, nodeData) {
        try {
            // Update B-tree indexes
            for (const [indexName, index] of this.btreeIndexes.entries()) {
                const config = this.configuration.btreeIndexes.find(c => c.name === indexName);
                if (config && nodeData[config.keyField] !== undefined) {
                    index.insert(nodeData[config.keyField], nodeId);
                }
            }
            // Update full-text indexes
            for (const [indexName, index] of this.fullTextIndexes.entries()) {
                const config = this.configuration.fullTextIndexes.find(c => c.name === indexName);
                if (config) {
                    const content = new Map();
                    for (const field of config.fields) {
                        if (nodeData[field]) {
                            content.set(field, String(nodeData[field]));
                        }
                    }
                    if (content.size > 0) {
                        index.addDocument(nodeId, content);
                    }
                }
            }
            // Update spatial indexes
            for (const [indexName, index] of this.spatialIndexes.entries()) {
                const config = this.configuration.spatialIndexes.find(c => c.name === indexName);
                if (config) {
                    const coords = config.coordinateFields;
                    const x = nodeData[coords.x];
                    const y = nodeData[coords.y];
                    if (x !== undefined && y !== undefined) {
                        const width = coords.width ? nodeData[coords.width] || 0 : 0;
                        const height = coords.height ? nodeData[coords.height] || 0 : 0;
                        const boundingBox = {
                            minX: x,
                            minY: y,
                            maxX: x + width,
                            maxY: y + height
                        };
                        index.insert({
                            id: nodeId,
                            boundingBox,
                            data: nodeData
                        });
                    }
                }
            }
            // Update composite indexes
            for (const [indexName, index] of this.compositeIndexes.entries()) {
                const config = this.configuration.compositeIndexes.find(c => c.name === indexName);
                if (config) {
                    const values = {};
                    for (const field of config.fields) {
                        values[field] = nodeData[field];
                    }
                    index.addEntry(nodeId, values);
                }
            }
            this.emit('nodeIndexed', { nodeId, indexCount: this.getIndexCount() });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('indexError', { nodeId, error: errorMessage });
            throw error;
        }
    }
    updateNode(nodeId, oldData, newData) {
        // Remove old entries
        this.removeNode(nodeId, oldData);
        // Add new entries
        this.addNode(nodeId, newData);
    }
    removeNode(nodeId, nodeData) {
        try {
            // Remove from full-text indexes
            for (const [indexName, index] of this.fullTextIndexes.entries()) {
                index.removeDocument(nodeId);
            }
            // Remove from composite indexes
            for (const [indexName, index] of this.compositeIndexes.entries()) {
                const config = this.configuration.compositeIndexes.find(c => c.name === indexName);
                if (config) {
                    const values = {};
                    for (const field of config.fields) {
                        values[field] = nodeData[field];
                    }
                    index.removeEntry(nodeId, values);
                }
            }
            // Note: B-tree and spatial index removal would require more complex implementation
            // For now, we focus on the most commonly updated indexes
            this.emit('nodeUnindexed', { nodeId });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('indexError', { nodeId, error: errorMessage });
            throw error;
        }
    }
    searchBTree(indexName, key) {
        const index = this.btreeIndexes.get(indexName);
        return index ? index.search(key) : undefined;
    }
    rangeBTreeSearch(indexName, startKey, endKey) {
        const index = this.btreeIndexes.get(indexName);
        return index ? index.rangeSearch(startKey, endKey) : [];
    }
    fullTextSearch(indexName, query, limit) {
        const index = this.fullTextIndexes.get(indexName);
        return index ? index.search(query, limit) : [];
    }
    spatialSearch(indexName, boundingBox) {
        const index = this.spatialIndexes.get(indexName);
        return index ? index.search(boundingBox) : [];
    }
    compositeSearch(indexName, values) {
        const index = this.compositeIndexes.get(indexName);
        return index ? index.search(values) : [];
    }
    getIndexStats() {
        return {
            btreeIndexCount: this.btreeIndexes.size,
            fullTextIndexCount: this.fullTextIndexes.size,
            spatialIndexCount: this.spatialIndexes.size,
            compositeIndexCount: this.compositeIndexes.size,
            totalIndexCount: this.getIndexCount()
        };
    }
    getIndexCount() {
        return this.btreeIndexes.size + this.fullTextIndexes.size +
            this.spatialIndexes.size + this.compositeIndexes.size;
    }
    rebuildIndexes(nodeDataProvider) {
        this.emit('rebuildStarted');
        try {
            // Clear all indexes
            this.btreeIndexes.clear();
            this.fullTextIndexes.clear();
            this.spatialIndexes.clear();
            this.compositeIndexes.clear();
            // Reinitialize
            this.initializeIndexes();
            this.emit('rebuildCompleted');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('rebuildError', { error: errorMessage });
            throw error;
        }
    }
}
//# sourceMappingURL=advanced-indexing-system.js.map