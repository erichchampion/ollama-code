/**
 * File System Tool
 *
 * Provides comprehensive file system operations with enhanced capabilities
 * for reading, writing, searching, and managing files and directories.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { BaseTool, ToolMetadata, ToolResult, ToolExecutionContext } from './types.js';
import { logger } from '../utils/logger.js';

export class FileSystemTool extends BaseTool {
  metadata: ToolMetadata = {
    name: 'filesystem',
    description: 'Comprehensive file system operations for reading, writing, and managing files',
    category: 'core',
    version: '1.0.0',
    parameters: [
      {
        name: 'operation',
        type: 'string',
        description: 'The file operation to perform',
        required: true,
        validation: (value) => ['read', 'write', 'list', 'create', 'delete', 'search', 'exists'].includes(value)
      },
      {
        name: 'path',
        type: 'string',
        description: 'The file or directory path',
        required: true
      },
      {
        name: 'content',
        type: 'string',
        description: 'Content to write (for write operations)',
        required: false
      },
      {
        name: 'encoding',
        type: 'string',
        description: 'File encoding (default: utf8)',
        required: false,
        default: 'utf8'
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'Search pattern for file searches',
        required: false
      },
      {
        name: 'recursive',
        type: 'boolean',
        description: 'Whether to perform recursive operations',
        required: false,
        default: false
      },
      {
        name: 'createBackup',
        type: 'boolean',
        description: 'Create backup before writing (default: true)',
        required: false,
        default: true
      }
    ],
    examples: [
      {
        description: 'Read a file',
        parameters: { operation: 'read', path: 'src/index.ts' }
      },
      {
        description: 'Write content to file with backup',
        parameters: {
          operation: 'write',
          path: 'src/new-file.ts',
          content: 'console.log("Hello");',
          createBackup: true
        }
      },
      {
        description: 'List directory contents recursively',
        parameters: { operation: 'list', path: 'src', recursive: true }
      },
      {
        description: 'Search for files matching pattern',
        parameters: { operation: 'search', path: 'src', pattern: '*.ts', recursive: true }
      }
    ]
  };

  async execute(
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      if (!this.validateParameters(parameters)) {
        return {
          success: false,
          error: 'Invalid parameters provided'
        };
      }

      const { operation, path: filePath } = parameters;
      const resolvedPath = path.resolve(context.workingDirectory, filePath);

      // Security check: ensure path is within project boundaries
      if (!this.isPathSafe(resolvedPath, context.projectRoot)) {
        return {
          success: false,
          error: 'Path is outside project boundaries'
        };
      }

      let result: any;

      switch (operation) {
        case 'read':
          result = await this.readFile(resolvedPath, parameters.encoding || 'utf8');
          break;
        case 'write':
          result = await this.writeFile(resolvedPath, parameters.content || '', {
            encoding: parameters.encoding || 'utf8',
            createBackup: parameters.createBackup !== false
          });
          break;
        case 'list':
          result = await this.listDirectory(resolvedPath, parameters.recursive || false);
          break;
        case 'create':
          result = await this.createPath(resolvedPath);
          break;
        case 'delete':
          result = await this.deletePath(resolvedPath);
          break;
        case 'search':
          result = await this.searchFiles(resolvedPath, parameters.pattern, parameters.recursive || false);
          break;
        case 'exists':
          result = await this.pathExists(resolvedPath);
          break;
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`
          };
      }

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          resourcesUsed: { operation, path: resolvedPath }
        }
      };

    } catch (error) {
      logger.error(`FileSystem tool error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime
        }
      };
    }
  }

  private async readFile(filePath: string, encoding: string): Promise<any> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, encoding as BufferEncoding);

    return {
      content,
      size: stats.size,
      modified: stats.mtime,
      encoding
    };
  }

  private async writeFile(filePath: string, content: string, options: {
    encoding: string;
    createBackup: boolean;
  }): Promise<any> {
    // Create backup if file exists and backup is requested
    if (options.createBackup && await this.pathExists(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      logger.debug(`Created backup: ${backupPath}`);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, options.encoding as BufferEncoding);

    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      size: stats.size,
      written: new Date()
    };
  }

  private async listDirectory(dirPath: string, recursive: boolean): Promise<any> {
    const items: any[] = [];

    const processDirectory = async (currentPath: string): Promise<void> => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(dirPath, fullPath);

        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            isDirectory: true,
            isFile: false
          });

          if (recursive) {
            await processDirectory(fullPath);
          }
        } else {
          const stats = await fs.stat(fullPath);
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            isDirectory: false,
            isFile: true,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
    };

    await processDirectory(dirPath);
    return items;
  }

  private async createPath(targetPath: string): Promise<any> {
    await fs.mkdir(targetPath, { recursive: true });
    return { created: targetPath };
  }

  private async deletePath(targetPath: string): Promise<any> {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { deleted: targetPath };
  }

  private async searchFiles(dirPath: string, pattern?: string, recursive: boolean = false): Promise<any> {
    const matches: any[] = [];
    const regex = pattern ? new RegExp(pattern.replace(/\*/g, '.*')) : null;

    const searchDirectory = async (currentPath: string): Promise<void> => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(dirPath, fullPath);

        if (entry.isFile()) {
          if (!regex || regex.test(entry.name)) {
            const stats = await fs.stat(fullPath);
            matches.push({
              name: entry.name,
              path: relativePath,
              fullPath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        } else if (entry.isDirectory() && recursive) {
          await searchDirectory(fullPath);
        }
      }
    };

    await searchDirectory(dirPath);
    return matches;
  }

  private async pathExists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private isPathSafe(targetPath: string, projectRoot: string): boolean {
    const resolved = path.resolve(targetPath);
    const root = path.resolve(projectRoot);
    return resolved.startsWith(root);
  }
}