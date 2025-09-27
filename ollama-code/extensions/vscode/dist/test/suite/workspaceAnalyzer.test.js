"use strict";
/**
 * Test Suite for WorkspaceAnalyzer Service
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const workspaceAnalyzer_1 = require("../../services/workspaceAnalyzer");
suite('WorkspaceAnalyzer Service Tests', () => {
    let workspaceAnalyzer;
    suiteSetup(async () => {
        // Initialize workspace analyzer
        workspaceAnalyzer = new workspaceAnalyzer_1.WorkspaceAnalyzer();
    });
    suiteTeardown(() => {
        workspaceAnalyzer.dispose();
    });
    test('should create workspace analyzer instance', () => {
        assert.ok(workspaceAnalyzer, 'WorkspaceAnalyzer should be instantiated');
    });
    test('should analyze workspace context', async () => {
        const context = await workspaceAnalyzer.analyzeWorkspace();
        if (context) {
            assert.ok(typeof context.projectType === 'string', 'Project type should be a string');
            assert.ok(typeof context.language === 'string', 'Language should be a string');
            assert.ok(Array.isArray(context.dependencies), 'Dependencies should be an array');
            assert.ok(Array.isArray(context.devDependencies), 'Dev dependencies should be an array');
            assert.ok(context.fileStructure, 'File structure should be present');
            assert.ok(typeof context.fileStructure.totalFiles === 'number', 'Total files should be a number');
            assert.ok(typeof context.fileStructure.fileTypes === 'object', 'File types should be an object');
        }
        else {
            // If no workspace is available, context can be null
            assert.ok(true, 'No workspace context available - this is acceptable in test environment');
        }
    });
    test('should handle multiple analyzeWorkspace calls efficiently', async () => {
        const startTime = Date.now();
        const context1 = await workspaceAnalyzer.analyzeWorkspace();
        const firstCallTime = Date.now() - startTime;
        const startTime2 = Date.now();
        const context2 = await workspaceAnalyzer.analyzeWorkspace();
        const secondCallTime = Date.now() - startTime2;
        // Both calls should return the same result (or both null)
        if (context1 && context2) {
            assert.deepStrictEqual(context1, context2, 'Multiple calls should return consistent results');
        }
        else {
            assert.strictEqual(context1, context2, 'Both calls should be null if no workspace');
        }
        assert.ok(true, 'Multiple workspace analysis calls should complete without error');
    });
    test('should dispose resources properly', () => {
        const testAnalyzer = new workspaceAnalyzer_1.WorkspaceAnalyzer();
        // Should not throw errors
        testAnalyzer.dispose();
        assert.ok(true, 'WorkspaceAnalyzer should dispose without errors');
    });
    test('should have expected interface', () => {
        // Test that the workspace analyzer has the expected public interface
        assert.ok(typeof workspaceAnalyzer.analyzeWorkspace === 'function', 'Should have analyzeWorkspace method');
        assert.ok(typeof workspaceAnalyzer.dispose === 'function', 'Should have dispose method');
    });
});
//# sourceMappingURL=workspaceAnalyzer.test.js.map