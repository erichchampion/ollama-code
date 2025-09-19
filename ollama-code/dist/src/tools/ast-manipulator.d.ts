/**
 * AST Manipulator
 *
 * Provides syntax-aware code transformations using Abstract Syntax Trees
 * for safe and precise code modifications.
 */
export interface ASTNode {
    type: string;
    start: number;
    end: number;
    range: [number, number];
    children?: ASTNode[];
    name?: string;
    value?: any;
    parent?: ASTNode;
}
export interface CodeLocation {
    line: number;
    column: number;
    index: number;
}
export interface CodeRange {
    start: CodeLocation;
    end: CodeLocation;
}
export interface FunctionInfo {
    name: string;
    range: CodeRange;
    parameters: string[];
    returnType?: string;
    isAsync: boolean;
    isExported: boolean;
    docstring?: string;
}
export interface ClassInfo {
    name: string;
    range: CodeRange;
    methods: FunctionInfo[];
    properties: PropertyInfo[];
    superClass?: string;
    isExported: boolean;
    docstring?: string;
}
export interface PropertyInfo {
    name: string;
    range: CodeRange;
    type?: string;
    isPrivate: boolean;
    isStatic: boolean;
}
export interface ImportInfo {
    module: string;
    imports: string[];
    isDefault: boolean;
    range: CodeRange;
}
export interface ManipulationResult {
    success: boolean;
    originalCode: string;
    modifiedCode: string;
    changes: CodeChange[];
    error?: string;
}
export interface CodeChange {
    type: 'insert' | 'delete' | 'replace';
    range: CodeRange;
    oldText: string;
    newText: string;
    description: string;
}
export interface CodeTransformation {
    type: 'rename-symbol' | 'extract-function' | 'add-import' | 'modify-function' | 'custom';
    target?: string;
    replacement?: string;
    scope?: 'global' | 'local';
    parameters?: Record<string, any>;
}
export declare class ASTManipulator {
    private languageSupport;
    constructor();
    /**
     * Initialize language-specific handlers
     */
    private initializeLanguageSupport;
    /**
     * Parse file and extract AST information
     */
    parseFile(filePath: string): Promise<ASTNode>;
    /**
     * Extract function information from code
     */
    extractFunctions(filePath: string): Promise<FunctionInfo[]>;
    /**
     * Extract class information from code
     */
    extractClasses(filePath: string): Promise<ClassInfo[]>;
    /**
     * Extract import/export information
     */
    extractImports(filePath: string): Promise<ImportInfo[]>;
    /**
     * Rename a symbol throughout the file with scope awareness
     */
    renameSymbol(filePath: string, oldName: string, newName: string, scope?: 'global' | 'local'): Promise<ManipulationResult>;
    /**
     * Extract a function to a separate location
     */
    extractFunction(filePath: string, functionName: string, targetLocation: 'separate-file' | 'top-of-file' | 'bottom-of-file'): Promise<ManipulationResult>;
    /**
     * Add import statement
     */
    addImport(filePath: string, importStatement: string, position?: 'top' | 'after-existing'): Promise<ManipulationResult>;
    /**
     * Modify function parameters
     */
    modifyFunction(filePath: string, functionName: string, modifications: {
        addParameters?: string[];
        removeParameters?: string[];
        changeReturnType?: string;
        addDocstring?: string;
    }): Promise<ManipulationResult>;
    /**
     * Apply a code transformation based on the transformation specification
     */
    applyTransformation(filePath: string, transformation: CodeTransformation): Promise<ManipulationResult>;
}
