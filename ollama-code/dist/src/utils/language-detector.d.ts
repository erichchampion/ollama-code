/**
 * Language Detection Utility
 *
 * Centralized language detection to eliminate code duplication across the codebase.
 * Provides consistent language identification based on file extensions and content analysis.
 */
export interface LanguageInfo {
    language: string;
    category: 'programming' | 'markup' | 'data' | 'config' | 'documentation';
    isSupported: boolean;
    extensions: string[];
}
export declare const LANGUAGE_MAP: Record<string, LanguageInfo>;
/**
 * Detect programming language from file path
 */
export declare function detectLanguageFromPath(filePath: string): string | null;
/**
 * Detect programming language from file extension
 */
export declare function detectLanguageFromExtension(extension: string): string | null;
/**
 * Get language information
 */
export declare function getLanguageInfo(language: string): LanguageInfo | null;
/**
 * Check if language is supported for analysis
 */
export declare function isLanguageSupported(language: string): boolean;
/**
 * Get all supported programming languages
 */
export declare function getSupportedLanguages(): string[];
/**
 * Get languages by category
 */
export declare function getLanguagesByCategory(category: LanguageInfo['category']): string[];
/**
 * Detect language with fallback options
 */
export declare function detectLanguageWithFallback(filePath: string, fallback?: string): string;
/**
 * Check if file is a test file based on path patterns
 */
export declare function isTestFile(filePath: string): boolean;
/**
 * Determine artifact type from file path
 */
export declare function determineArtifactType(filePath: string): 'code' | 'test' | 'documentation' | 'config';
/**
 * Get file category for organizational purposes
 */
export declare function getFileCategory(filePath: string): string;
