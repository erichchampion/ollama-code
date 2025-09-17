# File System Module Documentation

This document provides comprehensive documentation for the `src/fs/` module, which contains file operations, path handling, and file system utilities used throughout the Ollama Code CLI application.

## Table of Contents

- [Module Overview](#module-overview)
- [Architecture](#architecture)
- [File Operations](#file-operations)
- [Directory Operations](#directory-operations)
- [File Information](#file-information)
- [File Search and Discovery](#file-search-and-discovery)
- [File Streaming](#file-streaming)
- [Temporary Files](#temporary-files)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Module Overview

The fs module (`src/fs/`) provides a comprehensive collection of file system operations that are safe, consistent, and user-friendly. It includes utilities for reading, writing, searching, and analyzing files and directories.

### Purpose

- **File Operations**: Read, write, copy, move, and delete files
- **Directory Operations**: Create, list, and manage directories
- **File Discovery**: Find files matching patterns and criteria
- **File Information**: Get file stats and metadata
- **File Streaming**: Efficiently handle large files
- **Temporary Files**: Create and manage temporary files

### Key Features

- **Safe Operations**: All operations include proper error handling and validation
- **Path Validation**: Comprehensive path validation and sanitization
- **User-Friendly Errors**: Clear error messages with resolution suggestions
- **Streaming Support**: Efficient handling of large files
- **Pattern Matching**: Find files using regular expressions
- **Recursive Operations**: Support for recursive directory traversal

## Architecture

### Module Structure

```
src/fs/
└── operations.ts    # All file system operations
```

### Dependencies

- **Internal**: 
  - `../errors/formatter` (for user errors)
  - `../errors/types` (for error categories)
  - `../utils/logger` (for logging)
  - `../utils/validation` (for path validation)
- **External**: 
  - `fs/promises` (Node.js file system promises)
  - `fs` (Node.js file system)
  - `path` (Node.js path utilities)
  - `stream/promises` (Node.js stream utilities)

### Design Patterns

- **Utility Pattern**: Collection of stateless utility functions
- **Error Handling Pattern**: Consistent error handling with user-friendly messages
- **Validation Pattern**: Input validation before operations
- **Streaming Pattern**: Efficient handling of large files

## File Operations

### File Existence

#### `fileExists(filePath: string): Promise<boolean>`
Check if a file exists.

```typescript
import { fileExists } from './fs/operations.js';

const exists = await fileExists('/path/to/file.txt');
if (exists) {
  console.log('File exists');
} else {
  console.log('File does not exist');
}
```

#### `directoryExists(dirPath: string): Promise<boolean>`
Check if a directory exists.

```typescript
import { directoryExists } from './fs/operations.js';

const exists = await directoryExists('/path/to/directory');
if (exists) {
  console.log('Directory exists');
} else {
  console.log('Directory does not exist');
}
```

### File Reading

#### `readTextFile(filePath: string, encoding?: BufferEncoding): Promise<string>`
Read a file as text.

```typescript
import { readTextFile } from './fs/operations.js';

try {
  const content = await readTextFile('/path/to/file.txt');
  console.log(content);
} catch (error) {
  console.error('Failed to read file:', error.message);
}
```

#### `readFileLines(filePath: string, start: number, end: number, encoding?: BufferEncoding): Promise<string[]>`
Read specific lines from a file.

```typescript
import { readFileLines } from './fs/operations.js';

try {
  // Read lines 10-20 (1-indexed)
  const lines = await readFileLines('/path/to/file.txt', 10, 20);
  console.log(lines);
} catch (error) {
  console.error('Failed to read lines:', error.message);
}
```

### File Writing

#### `writeTextFile(filePath: string, content: string, options?: WriteOptions): Promise<void>`
Write text to a file.

```typescript
import { writeTextFile } from './fs/operations.js';

const options = {
  encoding: 'utf-8' as BufferEncoding,
  createDir: true,
  overwrite: true
};

try {
  await writeTextFile('/path/to/file.txt', 'Hello, World!', options);
  console.log('File written successfully');
} catch (error) {
  console.error('Failed to write file:', error.message);
}
```

#### `appendTextFile(filePath: string, content: string, options?: AppendOptions): Promise<void>`
Append text to a file.

```typescript
import { appendTextFile } from './fs/operations.js';

const options = {
  encoding: 'utf-8' as BufferEncoding,
  createDir: true
};

try {
  await appendTextFile('/path/to/file.txt', '\nNew line', options);
  console.log('Text appended successfully');
} catch (error) {
  console.error('Failed to append to file:', error.message);
}
```

### File Management

#### `deleteFile(filePath: string): Promise<void>`
Delete a file.

```typescript
import { deleteFile } from './fs/operations.js';

try {
  await deleteFile('/path/to/file.txt');
  console.log('File deleted successfully');
} catch (error) {
  console.error('Failed to delete file:', error.message);
}
```

#### `rename(oldPath: string, newPath: string): Promise<void>`
Rename a file or directory.

```typescript
import { rename } from './fs/operations.js';

try {
  await rename('/path/to/oldfile.txt', '/path/to/newfile.txt');
  console.log('File renamed successfully');
} catch (error) {
  console.error('Failed to rename file:', error.message);
}
```

#### `copyFile(sourcePath: string, destPath: string, options?: CopyOptions): Promise<void>`
Copy a file.

```typescript
import { copyFile } from './fs/operations.js';

const options = {
  overwrite: false,
  createDir: true
};

try {
  await copyFile('/path/to/source.txt', '/path/to/dest.txt', options);
  console.log('File copied successfully');
} catch (error) {
  console.error('Failed to copy file:', error.message);
}
```

## Directory Operations

### Directory Creation

#### `ensureDirectory(dirPath: string): Promise<void>`
Create a directory if it doesn't exist.

```typescript
import { ensureDirectory } from './fs/operations.js';

try {
  await ensureDirectory('/path/to/new/directory');
  console.log('Directory created or already exists');
} catch (error) {
  console.error('Failed to create directory:', error.message);
}
```

### Directory Listing

#### `listDirectory(dirPath: string): Promise<string[]>`
List files and directories in a directory.

```typescript
import { listDirectory } from './fs/operations.js';

try {
  const entries = await listDirectory('/path/to/directory');
  console.log('Directory contents:', entries);
} catch (error) {
  console.error('Failed to list directory:', error.message);
}
```

## File Information

### File Statistics

#### `getFileInfo(filePath: string): Promise<Stats>`
Get file or directory information.

```typescript
import { getFileInfo } from './fs/operations.js';

try {
  const stats = await getFileInfo('/path/to/file.txt');
  console.log('File size:', stats.size);
  console.log('Is file:', stats.isFile());
  console.log('Is directory:', stats.isDirectory());
  console.log('Created:', stats.birthtime);
  console.log('Modified:', stats.mtime);
} catch (error) {
  console.error('Failed to get file info:', error.message);
}
```

## File Search and Discovery

### Pattern Matching

#### `findFiles(directory: string, options?: FindOptions): Promise<string[]>`
Find files matching a pattern.

```typescript
import { findFiles } from './fs/operations.js';

const options = {
  pattern: /\.txt$/,
  recursive: true,
  includeDirectories: false
};

try {
  const files = await findFiles('/path/to/search', options);
  console.log('Found files:', files);
} catch (error) {
  console.error('Failed to find files:', error.message);
}
```

### Search Examples

```typescript
// Find all TypeScript files
const tsFiles = await findFiles('/src', {
  pattern: /\.ts$/,
  recursive: true
});

// Find all directories
const directories = await findFiles('/path', {
  includeDirectories: true,
  recursive: true
});

// Find files with specific pattern
const configFiles = await findFiles('/config', {
  pattern: /config\.(json|yaml|yml)$/,
  recursive: true
});
```

## File Streaming

### Large File Handling

#### `streamFile(sourcePath: string, destPath: string, options?: StreamOptions): Promise<void>`
Stream a file to another location.

```typescript
import { streamFile } from './fs/operations.js';

const options = {
  overwrite: false,
  createDir: true
};

try {
  await streamFile('/path/to/large/source.txt', '/path/to/dest.txt', options);
  console.log('File streamed successfully');
} catch (error) {
  console.error('Failed to stream file:', error.message);
}
```

## Temporary Files

### Temporary File Creation

#### `createTempFile(options?: TempFileOptions): Promise<string>`
Create a temporary file.

```typescript
import { createTempFile } from './fs/operations.js';

const options = {
  prefix: 'myapp-',
  suffix: '.tmp',
  content: 'Temporary content'
};

try {
  const tempPath = await createTempFile(options);
  console.log('Temporary file created:', tempPath);
  
  // Use the temporary file
  const content = await readTextFile(tempPath);
  console.log('Content:', content);
  
  // Clean up
  await deleteFile(tempPath);
} catch (error) {
  console.error('Failed to create temporary file:', error.message);
}
```

## Error Handling

### Error Categories

The fs module uses the following error categories:

- **VALIDATION**: Invalid input parameters
- **FILE_NOT_FOUND**: File or directory not found
- **FILE_READ**: Error reading file
- **FILE_WRITE**: Error writing file
- **FILE_SYSTEM**: General file system error

### Error Examples

```typescript
import { readTextFile } from './fs/operations.js';

try {
  await readTextFile('/invalid/path');
} catch (error) {
  if (error.category === 'FILE_NOT_FOUND') {
    console.log('File not found, please check the path');
  } else if (error.category === 'VALIDATION') {
    console.log('Invalid file path provided');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Usage Examples

### Complete File Processing

```typescript
import { 
  fileExists, 
  readTextFile, 
  writeTextFile, 
  findFiles,
  ensureDirectory 
} from './fs/operations.js';

async function processFiles() {
  try {
    // Check if source directory exists
    if (!await directoryExists('/source')) {
      throw new Error('Source directory not found');
    }
    
    // Find all text files
    const textFiles = await findFiles('/source', {
      pattern: /\.txt$/,
      recursive: true
    });
    
    // Process each file
    for (const filePath of textFiles) {
      console.log(`Processing: ${filePath}`);
      
      // Read file content
      const content = await readTextFile(filePath);
      
      // Process content (example: convert to uppercase)
      const processedContent = content.toUpperCase();
      
      // Write to output directory
      const outputPath = filePath.replace('/source', '/output');
      await ensureDirectory(path.dirname(outputPath));
      await writeTextFile(outputPath, processedContent);
      
      console.log(`Processed: ${outputPath}`);
    }
    
    console.log('All files processed successfully');
  } catch (error) {
    console.error('Processing failed:', error.message);
  }
}
```

### File Backup

```typescript
import { 
  fileExists, 
  copyFile, 
  ensureDirectory,
  getFileInfo 
} from './fs/operations.js';

async function backupFile(filePath: string) {
  try {
    // Check if file exists
    if (!await fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Get file info
    const stats = await getFileInfo(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create backup path
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    // Ensure backup directory exists
    await ensureDirectory(path.dirname(backupPath));
    
    // Copy file
    await copyFile(filePath, backupPath, { overwrite: true });
    
    console.log(`File backed up: ${backupPath}`);
    console.log(`Size: ${stats.size} bytes`);
    console.log(`Modified: ${stats.mtime}`);
    
  } catch (error) {
    console.error('Backup failed:', error.message);
  }
}
```

### Directory Synchronization

```typescript
import { 
  listDirectory, 
  fileExists, 
  copyFile, 
  ensureDirectory,
  getFileInfo 
} from './fs/operations.js';

async function syncDirectories(sourceDir: string, destDir: string) {
  try {
    // Ensure destination directory exists
    await ensureDirectory(destDir);
    
    // Get source files
    const sourceFiles = await listDirectory(sourceDir);
    
    for (const fileName of sourceFiles) {
      const sourcePath = path.join(sourceDir, fileName);
      const destPath = path.join(destDir, fileName);
      
      // Check if destination file exists
      if (await fileExists(destPath)) {
        // Compare modification times
        const sourceStats = await getFileInfo(sourcePath);
        const destStats = await getFileInfo(destPath);
        
        if (sourceStats.mtime > destStats.mtime) {
          console.log(`Updating: ${fileName}`);
          await copyFile(sourcePath, destPath, { overwrite: true });
        } else {
          console.log(`Skipping: ${fileName} (up to date)`);
        }
      } else {
        console.log(`Copying: ${fileName}`);
        await copyFile(sourcePath, destPath);
      }
    }
    
    console.log('Directory synchronization completed');
  } catch (error) {
    console.error('Synchronization failed:', error.message);
  }
}
```

## Best Practices

### File Operations

1. **Always Check Existence**: Check if files exist before operations
2. **Handle Errors**: Always wrap operations in try-catch blocks
3. **Validate Paths**: Use path validation before operations
4. **Use Streaming**: Use streaming for large files
5. **Clean Up**: Clean up temporary files after use

### Directory Operations

1. **Create Directories**: Use `ensureDirectory` before file operations
2. **Recursive Operations**: Use recursive options for deep directory traversal
3. **Pattern Matching**: Use appropriate patterns for file discovery
4. **Error Handling**: Handle directory not found errors gracefully

### Performance

1. **Streaming**: Use streaming for large files
2. **Batch Operations**: Process files in batches when possible
3. **Memory Management**: Avoid loading large files into memory
4. **Concurrency**: Use appropriate concurrency limits

### Security

1. **Path Validation**: Always validate file paths
2. **Permission Checks**: Check file permissions before operations
3. **Input Sanitization**: Sanitize user input for file paths
4. **Error Messages**: Don't expose sensitive information in error messages

This documentation provides comprehensive guidance for using the fs module effectively. The module is designed to be safe, efficient, and user-friendly for all file system operations in the Ollama Code CLI.
