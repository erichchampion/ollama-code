"use strict";
/**
 * Test Utility Functions
 * Common utilities for testing (replaces missing ../../../../tests/shared/test-utils.js)
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
exports.sleep = sleep;
exports.waitFor = waitFor;
exports.ensureDir = ensureDir;
exports.remove = remove;
exports.writeFile = writeFile;
const fsPromises = __importStar(require("fs/promises"));
/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Wait for a condition to become true
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Polling interval in milliseconds
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const result = await Promise.resolve(condition());
        if (result) {
            return;
        }
        await sleep(interval);
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
/**
 * Ensure directory exists, creating it if necessary
 * @param dirPath - Path to directory
 */
async function ensureDir(dirPath) {
    try {
        await fsPromises.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}
/**
 * Remove file or directory
 * @param targetPath - Path to remove
 * @param recursive - Whether to remove recursively (for directories)
 */
async function remove(targetPath, recursive = false) {
    try {
        const stats = await fsPromises.stat(targetPath);
        if (stats.isDirectory()) {
            if (recursive) {
                await fsPromises.rm(targetPath, { recursive: true, force: true });
            }
            else {
                await fsPromises.rmdir(targetPath);
            }
        }
        else {
            await fsPromises.unlink(targetPath);
        }
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}
/**
 * Write file asynchronously
 * @param filePath - Path to file
 * @param content - File content
 */
async function writeFile(filePath, content) {
    await fsPromises.writeFile(filePath, content, 'utf8');
}
//# sourceMappingURL=test-utils.js.map