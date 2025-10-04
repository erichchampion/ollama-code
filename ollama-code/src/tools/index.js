"use strict";
/**
 * Tools Module
 *
 * Main entry point for the tool system that provides sophisticated
 * multi-tool orchestration capabilities for coding tasks.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = exports.ToolRegistry = void 0;
exports.initializeToolSystem = initializeToolSystem;
exports.getAvailableTools = getAvailableTools;
exports.createDefaultContext = createDefaultContext;
__exportStar(require("./types.js"), exports);
var registry_js_1 = require("./registry.js");
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return registry_js_1.ToolRegistry; } });
Object.defineProperty(exports, "toolRegistry", { enumerable: true, get: function () { return registry_js_1.toolRegistry; } });
__exportStar(require("./orchestrator.js"), exports);
// Tool implementations
__exportStar(require("./filesystem.js"), exports);
__exportStar(require("./search.js"), exports);
__exportStar(require("./execution.js"), exports);
__exportStar(require("./advanced-git-tool.js"), exports);
__exportStar(require("./advanced-code-analysis-tool.js"), exports);
__exportStar(require("./advanced-testing-tool.js"), exports);
const registry_js_2 = require("./registry.js");
const filesystem_js_1 = require("./filesystem.js");
const search_js_1 = require("./search.js");
const execution_js_1 = require("./execution.js");
const advanced_git_tool_js_1 = require("./advanced-git-tool.js");
const advanced_code_analysis_tool_js_1 = require("./advanced-code-analysis-tool.js");
const advanced_testing_tool_js_1 = require("./advanced-testing-tool.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Initialize the tool system by registering all available tools
 */
function initializeToolSystem() {
    try {
        // Register core tools
        registry_js_2.toolRegistry.register(new filesystem_js_1.FileSystemTool());
        registry_js_2.toolRegistry.register(new search_js_1.SearchTool());
        registry_js_2.toolRegistry.register(new execution_js_1.ExecutionTool());
        // Register advanced tools for Phase 7
        registry_js_2.toolRegistry.register(new advanced_git_tool_js_1.AdvancedGitTool());
        registry_js_2.toolRegistry.register(new advanced_code_analysis_tool_js_1.AdvancedCodeAnalysisTool());
        registry_js_2.toolRegistry.register(new advanced_testing_tool_js_1.AdvancedTestingTool());
        logger_js_1.logger.info('Tool system initialized successfully');
        logger_js_1.logger.debug(`Registered ${registry_js_2.toolRegistry.list().length} tools`);
    }
    catch (error) {
        logger_js_1.logger.error(`Failed to initialize tool system: ${error}`);
        throw error;
    }
}
/**
 * Get information about all available tools
 */
function getAvailableTools() {
    return registry_js_2.toolRegistry.list().map(metadata => ({
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        version: metadata.version,
        parametersCount: metadata.parameters.length,
        hasExamples: metadata.examples.length > 0
    }));
}
/**
 * Create a default tool execution context
 */
function createDefaultContext(options = {}) {
    return {
        projectRoot: options.projectRoot || process.cwd(),
        workingDirectory: options.workingDirectory || process.cwd(),
        environment: process.env,
        timeout: options.timeout || 30000
    };
}
//# sourceMappingURL=index.js.map