/**
 * File Operation Commands
 *
 * Phase 2.1: Natural language file commands for interactive file operations
 * Refactored to eliminate DRY violations and hardcoded values
 */
import { CommandDef } from './index.js';
/**
 * Create file command
 */
export declare const createFileCommand: CommandDef;
/**
 * Edit file command
 */
export declare const editFileCommand: CommandDef;
/**
 * Generate code command
 */
export declare const generateCodeCommand: CommandDef;
/**
 * Create tests command
 */
export declare const createTestsCommand: CommandDef;
/**
 * Register all file operation commands
 */
export declare function registerFileOperationCommands(): void;
/**
 * Get all file operation commands
 */
export declare function getFileOperationCommands(): CommandDef[];
