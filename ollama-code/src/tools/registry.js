"use strict";
/**
 * Tool Registry
 *
 * Manages registration, discovery, and retrieval of tools in the system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = exports.ToolRegistry = void 0;
const logger_js_1 = require("../utils/logger.js");
class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    register(tool) {
        const name = tool.metadata.name;
        if (this.tools.has(name)) {
            logger_js_1.logger.warn(`Tool '${name}' is already registered. Overwriting.`);
        }
        // Validate tool metadata
        this.validateToolMetadata(tool.metadata);
        this.tools.set(name, tool);
        logger_js_1.logger.debug(`Registered tool: ${name} (${tool.metadata.category})`);
    }
    unregister(name) {
        if (this.tools.delete(name)) {
            logger_js_1.logger.debug(`Unregistered tool: ${name}`);
        }
        else {
            logger_js_1.logger.warn(`Attempted to unregister non-existent tool: ${name}`);
        }
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values()).map(tool => tool.metadata);
    }
    getByCategory(category) {
        return Array.from(this.tools.values()).filter(tool => tool.metadata.category === category);
    }
    search(query) {
        const searchTerms = query.toLowerCase().split(/\s+/);
        const results = [];
        for (const tool of this.tools.values()) {
            const score = this.calculateSearchScore(tool.metadata, searchTerms);
            if (score > 0) {
                results.push({ tool, score });
            }
        }
        // Sort by relevance score (descending)
        results.sort((a, b) => b.score - a.score);
        return results.map(result => result.tool);
    }
    validateToolMetadata(metadata) {
        if (!metadata.name) {
            throw new Error('Tool metadata must include a name');
        }
        if (!metadata.description) {
            throw new Error('Tool metadata must include a description');
        }
        if (!metadata.category) {
            throw new Error('Tool metadata must include a category');
        }
        if (!metadata.version) {
            throw new Error('Tool metadata must include a version');
        }
        // Validate parameters
        for (const param of metadata.parameters) {
            if (!param.name || !param.type || !param.description) {
                throw new Error(`Invalid parameter definition in tool '${metadata.name}'`);
            }
        }
    }
    calculateSearchScore(metadata, searchTerms) {
        let score = 0;
        const searchableText = [
            metadata.name,
            metadata.description,
            metadata.category,
            ...metadata.parameters.map(p => p.name),
            ...metadata.parameters.map(p => p.description)
        ].join(' ').toLowerCase();
        for (const term of searchTerms) {
            if (searchableText.includes(term)) {
                // Name matches get highest score
                if (metadata.name.toLowerCase().includes(term)) {
                    score += 10;
                }
                // Description matches get medium score
                else if (metadata.description.toLowerCase().includes(term)) {
                    score += 5;
                }
                // Other matches get low score
                else {
                    score += 1;
                }
            }
        }
        return score;
    }
}
exports.ToolRegistry = ToolRegistry;
// Global registry instance
exports.toolRegistry = new ToolRegistry();
//# sourceMappingURL=registry.js.map