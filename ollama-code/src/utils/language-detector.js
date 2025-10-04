"use strict";
/**
 * Language Detection Utility
 *
 * Centralized language detection to eliminate code duplication across the codebase.
 * Provides consistent language identification based on file extensions and content analysis.
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
exports.LANGUAGE_MAP = void 0;
exports.detectLanguageFromPath = detectLanguageFromPath;
exports.detectLanguageFromExtension = detectLanguageFromExtension;
exports.getLanguageInfo = getLanguageInfo;
exports.isLanguageSupported = isLanguageSupported;
exports.getSupportedLanguages = getSupportedLanguages;
exports.getLanguagesByCategory = getLanguagesByCategory;
exports.detectLanguageWithFallback = detectLanguageWithFallback;
exports.isTestFile = isTestFile;
exports.determineArtifactType = determineArtifactType;
exports.getFileCategory = getFileCategory;
const path = __importStar(require("path"));
exports.LANGUAGE_MAP = {
    typescript: {
        language: 'typescript',
        category: 'programming',
        isSupported: true,
        extensions: ['.ts', '.tsx']
    },
    javascript: {
        language: 'javascript',
        category: 'programming',
        isSupported: true,
        extensions: ['.js', '.jsx', '.mjs']
    },
    python: {
        language: 'python',
        category: 'programming',
        isSupported: true,
        extensions: ['.py', '.pyw']
    },
    java: {
        language: 'java',
        category: 'programming',
        isSupported: true,
        extensions: ['.java']
    },
    cpp: {
        language: 'cpp',
        category: 'programming',
        isSupported: true,
        extensions: ['.cpp', '.cc', '.cxx', '.c++', '.c', '.h', '.hpp']
    },
    csharp: {
        language: 'csharp',
        category: 'programming',
        isSupported: true,
        extensions: ['.cs']
    },
    go: {
        language: 'go',
        category: 'programming',
        isSupported: true,
        extensions: ['.go']
    },
    rust: {
        language: 'rust',
        category: 'programming',
        isSupported: true,
        extensions: ['.rs']
    },
    php: {
        language: 'php',
        category: 'programming',
        isSupported: true,
        extensions: ['.php']
    },
    ruby: {
        language: 'ruby',
        category: 'programming',
        isSupported: true,
        extensions: ['.rb']
    },
    swift: {
        language: 'swift',
        category: 'programming',
        isSupported: true,
        extensions: ['.swift']
    },
    kotlin: {
        language: 'kotlin',
        category: 'programming',
        isSupported: true,
        extensions: ['.kt', '.kts']
    },
    html: {
        language: 'html',
        category: 'markup',
        isSupported: true,
        extensions: ['.html', '.htm']
    },
    css: {
        language: 'css',
        category: 'markup',
        isSupported: true,
        extensions: ['.css', '.scss', '.sass', '.less']
    },
    json: {
        language: 'json',
        category: 'data',
        isSupported: true,
        extensions: ['.json']
    },
    yaml: {
        language: 'yaml',
        category: 'config',
        isSupported: true,
        extensions: ['.yml', '.yaml']
    },
    xml: {
        language: 'xml',
        category: 'markup',
        isSupported: true,
        extensions: ['.xml']
    },
    markdown: {
        language: 'markdown',
        category: 'documentation',
        isSupported: true,
        extensions: ['.md', '.markdown']
    },
    sql: {
        language: 'sql',
        category: 'data',
        isSupported: true,
        extensions: ['.sql']
    },
    shell: {
        language: 'shell',
        category: 'programming',
        isSupported: true,
        extensions: ['.sh', '.bash', '.zsh']
    }
};
// Create reverse mapping from extensions to languages
const EXTENSION_TO_LANGUAGE = {};
for (const [language, info] of Object.entries(exports.LANGUAGE_MAP)) {
    for (const ext of info.extensions) {
        EXTENSION_TO_LANGUAGE[ext] = language;
    }
}
/**
 * Detect programming language from file path
 */
function detectLanguageFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSION_TO_LANGUAGE[ext] || null;
}
/**
 * Detect programming language from file extension
 */
function detectLanguageFromExtension(extension) {
    const normalizedExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
    return EXTENSION_TO_LANGUAGE[normalizedExt] || null;
}
/**
 * Get language information
 */
function getLanguageInfo(language) {
    return exports.LANGUAGE_MAP[language] || null;
}
/**
 * Check if language is supported for analysis
 */
function isLanguageSupported(language) {
    const info = getLanguageInfo(language);
    return info?.isSupported || false;
}
/**
 * Get all supported programming languages
 */
function getSupportedLanguages() {
    return Object.keys(exports.LANGUAGE_MAP).filter(lang => exports.LANGUAGE_MAP[lang].isSupported);
}
/**
 * Get languages by category
 */
function getLanguagesByCategory(category) {
    return Object.entries(exports.LANGUAGE_MAP)
        .filter(([_, info]) => info.category === category)
        .map(([lang, _]) => lang);
}
/**
 * Detect language with fallback options
 */
function detectLanguageWithFallback(filePath, fallback = 'text') {
    return detectLanguageFromPath(filePath) || fallback;
}
/**
 * Check if file is a test file based on path patterns
 */
function isTestFile(filePath) {
    const normalizedPath = filePath.toLowerCase();
    return (normalizedPath.includes('/test/') ||
        normalizedPath.includes('/tests/') ||
        normalizedPath.includes('/__test__/') ||
        normalizedPath.includes('/__tests__/') ||
        normalizedPath.includes('.test.') ||
        normalizedPath.includes('.spec.') ||
        normalizedPath.endsWith('.test.ts') ||
        normalizedPath.endsWith('.test.js') ||
        normalizedPath.endsWith('.spec.ts') ||
        normalizedPath.endsWith('.spec.js'));
}
/**
 * Determine artifact type from file path
 */
function determineArtifactType(filePath) {
    if (isTestFile(filePath))
        return 'test';
    const normalizedPath = filePath.toLowerCase();
    if (normalizedPath.includes('doc') || normalizedPath.endsWith('.md'))
        return 'documentation';
    if (normalizedPath.includes('config') || normalizedPath.endsWith('.json') || normalizedPath.endsWith('.yml') || normalizedPath.endsWith('.yaml'))
        return 'config';
    return 'code';
}
/**
 * Get file category for organizational purposes
 */
function getFileCategory(filePath) {
    const language = detectLanguageFromPath(filePath);
    if (!language)
        return 'unknown';
    const info = getLanguageInfo(language);
    return info?.category || 'unknown';
}
//# sourceMappingURL=language-detector.js.map