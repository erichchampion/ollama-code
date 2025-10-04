/**
 * Security Analyzer
 *
 * Advanced security analysis system for detecting vulnerabilities, security issues,
 * and compliance violations in codebases with OWASP Top 10 coverage and beyond.
 */
export interface SecurityVulnerability {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    owaspCategory?: string;
    cweId?: number;
    file: string;
    line: number;
    column?: number;
    code: string;
    recommendation: string;
    references: string[];
    confidence: 'high' | 'medium' | 'low';
    impact: string;
    exploitability: string;
}
export interface SecurityRule {
    id: string;
    name: string;
    description: string;
    severity: SecurityVulnerability['severity'];
    category: string;
    owaspCategory?: string;
    cweId?: number;
    pattern: RegExp;
    filePatterns: string[];
    confidence: SecurityVulnerability['confidence'];
    recommendation: string;
    references: string[];
    validator?: (match: RegExpMatchArray, code: string, filePath: string) => boolean;
}
export interface DependencyVulnerability {
    package: string;
    version: string;
    vulnerability: {
        id: string;
        title: string;
        description: string;
        severity: SecurityVulnerability['severity'];
        cvss?: number;
        cve?: string;
        publishedDate: string;
        lastModifiedDate: string;
    };
    fixedIn?: string;
    recommendation: string;
}
export interface SecurityAnalysisOptions {
    includePatterns?: string[];
    excludePatterns?: string[];
    respectGitIgnore?: boolean;
    checkDependencies?: boolean;
    enableCustomRules?: boolean;
    severityThreshold?: SecurityVulnerability['severity'];
    maxFileSize?: number;
    projectRoot?: string;
}
export interface SecurityAnalysisResult {
    summary: {
        totalFiles: number;
        vulnerabilities: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        infoCount: number;
        dependencyIssues: number;
    };
    vulnerabilities: SecurityVulnerability[];
    dependencyVulnerabilities: DependencyVulnerability[];
    executionTime: number;
    timestamp: Date;
    projectPath: string;
}
export declare class SecurityAnalyzer {
    private rules;
    private customRules;
    constructor();
    /**
     * Analyze a project for security vulnerabilities
     */
    analyzeProject(projectPath: string, options?: SecurityAnalysisOptions): Promise<SecurityAnalysisResult>;
    /**
     * Analyze a single file for vulnerabilities
     */
    analyzeFile(filePath: string, severityThreshold?: SecurityVulnerability['severity']): Promise<SecurityVulnerability[]>;
    /**
     * Load default security rules
     */
    private loadDefaultRules;
    /**
     * Analyze dependencies for known vulnerabilities
     */
    private analyzeDependencies;
    /**
     * Get files to analyze based on patterns and filters
     */
    private getFilesToAnalyze;
    /**
     * Check if a pattern matches a file path
     */
    private matchesPattern;
    /**
     * Get applicable rules for a file type
     */
    private getApplicableRules;
    /**
     * Check if severity meets threshold
     */
    private meetsSeverityThreshold;
    /**
     * Sort vulnerabilities by severity and confidence
     */
    private sortVulnerabilities;
    /**
     * Create summary statistics
     */
    private createSummary;
    /**
     * Get impact description based on severity
     */
    private getImpactDescription;
    /**
     * Get exploitability description based on severity
     */
    private getExploitabilityDescription;
    /**
     * Check if a package has known vulnerabilities (simplified)
     */
    private isKnownVulnerablePackage;
    /**
     * Add custom security rule
     */
    addCustomRule(rule: SecurityRule): void;
    /**
     * Generate security report
     */
    generateReport(result: SecurityAnalysisResult): string;
}
export declare function createSecurityAnalyzer(): SecurityAnalyzer;
