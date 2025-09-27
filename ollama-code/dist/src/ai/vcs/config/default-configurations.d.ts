/**
 * Default Configuration Constants for VCS Integration
 *
 * Centralized configuration to eliminate hardcoded values and DRY violations
 * across VCS intelligence components.
 */
export interface QualityThresholds {
    maxComplexity: number;
    minTestCoverage: number;
    maxFileSize: number;
    maxLinesChanged: number;
    minOverallScore: number;
    maxCriticalIssues: number;
    maxSecurityIssues: number;
    maxTechnicalDebt: number;
    minMaintainability: number;
}
export interface RiskThresholds {
    fileSize: number;
    linesChanged: number;
    filesChanged: number;
    complexity: number;
    hotspotFrequency: number;
    authorExperience: number;
}
export interface AlertThresholds {
    qualityDegradation: number;
    securityIssueIncrease: number;
    complexityIncrease: number;
    testCoverageDecrease: number;
    technicalDebtIncrease: number;
}
export interface PathPatterns {
    criticalFiles: string[];
    criticalPaths: string[];
    testPatterns: string[];
    buildPatterns: string[];
    excludePatterns: string[];
}
export interface AnalysisDefaults {
    analysisDepth: number;
    retentionPeriod: number;
    timeoutMs: number;
    maxConcurrentAnalyses: number;
}
export interface CommitDefaults {
    style: 'conventional' | 'descriptive' | 'minimal';
    maxLength: number;
    includeScope: boolean;
    includeBody: boolean;
    includeFooter: boolean;
}
/**
 * Default quality thresholds used across all VCS components
 */
export declare const DEFAULT_QUALITY_THRESHOLDS: QualityThresholds;
/**
 * Default risk assessment thresholds
 */
export declare const DEFAULT_RISK_THRESHOLDS: RiskThresholds;
/**
 * Default alert thresholds for quality degradation
 */
export declare const DEFAULT_ALERT_THRESHOLDS: AlertThresholds;
/**
 * Default file and path patterns
 */
export declare const DEFAULT_PATH_PATTERNS: PathPatterns;
/**
 * Default analysis configuration
 */
export declare const DEFAULT_ANALYSIS: AnalysisDefaults;
/**
 * Default commit message configuration
 */
export declare const DEFAULT_COMMIT: CommitDefaults;
/**
 * Default branch names
 */
export declare const DEFAULT_BRANCHES: {
    main: string;
    develop: string;
    staging: string;
};
/**
 * Default storage paths (relative to repository root)
 */
export declare const DEFAULT_STORAGE_PATHS: {
    qualityTracking: string;
    reports: string;
    backups: string;
    hooks: string;
};
/**
 * Git hook types supported by the system
 */
export declare const SUPPORTED_HOOK_TYPES: readonly ["pre-commit", "commit-msg", "pre-push", "post-merge"];
/**
 * CI/CD platform configurations
 */
export declare const CI_PLATFORMS: {
    readonly github: {
        readonly name: "GitHub Actions";
        readonly configFile: ".github/workflows";
        readonly artifactPath: "reports/";
        readonly commentSupported: true;
    };
    readonly gitlab: {
        readonly name: "GitLab CI";
        readonly configFile: ".gitlab-ci.yml";
        readonly artifactPath: "reports/";
        readonly commentSupported: true;
    };
    readonly azure: {
        readonly name: "Azure DevOps";
        readonly configFile: "azure-pipelines.yml";
        readonly artifactPath: "reports/";
        readonly commentSupported: false;
    };
    readonly bitbucket: {
        readonly name: "Bitbucket Pipelines";
        readonly configFile: "bitbucket-pipelines.yml";
        readonly artifactPath: "reports/";
        readonly commentSupported: false;
    };
    readonly circleci: {
        readonly name: "CircleCI";
        readonly configFile: ".circleci/config.yml";
        readonly artifactPath: "reports/";
        readonly commentSupported: false;
    };
    readonly jenkins: {
        readonly name: "Jenkins";
        readonly configFile: "Jenkinsfile";
        readonly artifactPath: "reports/";
        readonly commentSupported: false;
    };
};
/**
 * Create a complete VCS configuration with sensible defaults
 */
export declare function createDefaultVCSConfig(repositoryPath: string, overrides?: Partial<{
    qualityThresholds: Partial<QualityThresholds>;
    riskThresholds: Partial<RiskThresholds>;
    alertThresholds: Partial<AlertThresholds>;
    pathPatterns: Partial<PathPatterns>;
    analysisDefaults: Partial<AnalysisDefaults>;
    commitDefaults: Partial<CommitDefaults>;
}>): {
    repositoryPath: string;
    defaultBranch: string;
    enableAutoAnalysis: boolean;
    qualityThresholds: {
        maxComplexity: number;
        minTestCoverage: number;
        maxFileSize: number;
        maxLinesChanged: number;
        minOverallScore: number;
        maxCriticalIssues: number;
        maxSecurityIssues: number;
        maxTechnicalDebt: number;
        minMaintainability: number;
    };
    riskThresholds: {
        fileSize: number;
        linesChanged: number;
        filesChanged: number;
        complexity: number;
        hotspotFrequency: number;
        authorExperience: number;
    };
    alertThresholds: {
        qualityDegradation: number;
        securityIssueIncrease: number;
        complexityIncrease: number;
        testCoverageDecrease: number;
        technicalDebtIncrease: number;
    };
    pathPatterns: {
        criticalFiles: string[];
        criticalPaths: string[];
        testPatterns: string[];
        buildPatterns: string[];
        excludePatterns: string[];
    };
    analysis: {
        analysisDepth: number;
        retentionPeriod: number;
        timeoutMs: number;
        maxConcurrentAnalyses: number;
    };
    commit: {
        style: "conventional" | "descriptive" | "minimal";
        maxLength: number;
        includeScope: boolean;
        includeBody: boolean;
        includeFooter: boolean;
    };
    storagePaths: {
        qualityTracking: string;
        reports: string;
        backups: string;
        hooks: string;
    };
};
/**
 * Validate configuration values to prevent runtime errors
 */
export declare function validateConfiguration(config: any): {
    valid: boolean;
    errors: string[];
};
/**
 * Safe integer parsing with fallback
 */
export declare function safeParseInt(value: string | undefined, fallback: number): number;
/**
 * Safe enum parsing with type checking
 */
export declare function safeParseEnum<T extends string>(value: string | undefined, allowedValues: readonly T[], fallback: T): T;
/**
 * Validate and sanitize repository path to prevent directory traversal
 */
export declare function validateRepositoryPath(repositoryPath: string): {
    valid: boolean;
    sanitized: string;
    error?: string;
};
