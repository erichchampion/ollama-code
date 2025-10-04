/**
 * Centralized CI/CD Configuration Defaults
 *
 * Single source of truth for all CI/CD platform configurations
 * to eliminate hardcoded values and DRY violations across pipeline definitions.
 */
/**
 * Default quality gate thresholds for all CI/CD platforms
 */
export declare const CI_QUALITY_GATES: {
    readonly minQualityScore: 80;
    readonly maxCriticalIssues: 0;
    readonly maxSecurityIssues: 5;
    readonly maxPerformanceIssues: 3;
    readonly minTestCoverage: 80;
    readonly maxComplexityIncrease: 20;
    readonly maxTechnicalDebtIncrease: 10;
    readonly regressionThreshold: "low" | "medium" | "high";
};
/**
 * Analysis configuration defaults
 */
export declare const CI_ANALYSIS_CONFIG: {
    readonly enableSecurity: true;
    readonly enablePerformance: true;
    readonly enableArchitecture: true;
    readonly enableRegression: true;
    readonly enableQualityGates: true;
    readonly analysisTimeoutSeconds: 300;
    readonly analysisTimeoutMs: 300000;
    readonly reportFormat: "json" | "junit" | "sarif" | "markdown" | "html";
    readonly outputPath: "./reports";
    readonly deepAnalysis: false;
};
/**
 * Build and runtime configuration
 */
export declare const CI_BUILD_CONFIG: {
    readonly nodeVersion: "20";
    readonly nodeImage: "node:20";
    readonly nodeImageAlpine: "node:20-alpine";
    readonly nodeVersionSpec: "20.x";
    readonly yarnLockfile: "yarn.lock";
    readonly buildCommand: "yarn build";
    readonly installCommand: "yarn install --frozen-lockfile";
    readonly testCommand: "yarn test";
    readonly distPath: "dist";
    readonly reportsPath: "reports";
    readonly nodeModulesPath: "node_modules";
};
/**
 * Artifact and caching configuration
 */
export declare const CI_ARTIFACT_CONFIG: {
    readonly retentionDays: 30;
    readonly retentionDaysNightly: 90;
    readonly retentionDaysRelease: 365;
    readonly artifactPaths: {
        readonly dist: "dist/**";
        readonly reports: "reports/**";
        readonly coverage: "coverage/**";
        readonly nodeModules: "node_modules/**";
    };
    readonly cachePaths: {
        readonly nodeModules: "node_modules";
        readonly yarn: "~/.cache/yarn";
        readonly ollamaCode: ".ollama-code/cache";
    };
};
/**
 * Security analysis configuration
 */
export declare const CI_SECURITY_CONFIG: {
    readonly analysisCommand: "Perform comprehensive security analysis for OWASP Top 10 vulnerabilities";
    readonly outputFile: "security-analysis.json";
    readonly criticalThreshold: 0;
    readonly highThreshold: 5;
    readonly mediumThreshold: 10;
    readonly lowThreshold: 20;
};
/**
 * Performance analysis configuration
 */
export declare const CI_PERFORMANCE_CONFIG: {
    readonly analysisTypes: readonly ["memory", "cpu", "io", "network"];
    readonly analysisCommand: (type: string) => string;
    readonly outputFilePattern: "performance-{type}.json";
    readonly parallelism: 4;
};
/**
 * Regression analysis configuration
 */
export declare const CI_REGRESSION_CONFIG: {
    readonly analysisCommand: (baseBranch: string) => string;
    readonly outputFile: "regression-risk.json";
    readonly criticalRiskThreshold: "critical";
    readonly highRiskThreshold: "high";
    readonly acceptableRiskThreshold: "medium";
};
/**
 * Branch configuration
 */
export declare const CI_BRANCH_CONFIG: {
    readonly defaultBranch: "main";
    readonly defaultBranches: readonly ["main", "master"];
    readonly developBranches: readonly ["develop", "development", "dev"];
    readonly releaseBranches: readonly ["release/*", "releases/*"];
    readonly featureBranches: readonly ["feature/*", "features/*"];
    readonly hotfixBranches: readonly ["hotfix/*", "hotfixes/*"];
    readonly ignoreBranches: readonly ["gh-pages", "docs"];
};
/**
 * Notification messages
 */
export declare const CI_MESSAGES: {
    readonly startAnalysis: "🚀 Starting Ollama Code Analysis";
    readonly installDependencies: "📦 Installing dependencies...";
    readonly buildProject: "🔨 Building project...";
    readonly runAnalysis: "🔍 Running Ollama Code Analysis...";
    readonly securityAnalysis: "🛡️ Running security vulnerability analysis...";
    readonly performanceAnalysis: "⚡ Running performance analysis...";
    readonly regressionAnalysis: "⚠️ Analyzing regression risk...";
    readonly generateReports: "📊 Generating consolidated reports...";
    readonly deploymentCheck: "🚀 Checking deployment readiness...";
    readonly qualityPassed: "✅ All quality gates passed";
    readonly qualityFailed: "❌ Quality gates failed - review required";
    readonly securityPassed: "✅ Security analysis passed";
    readonly securityFailed: "❌ Security vulnerabilities detected";
    readonly deploymentReady: "✅ Ready for deployment";
    readonly deploymentBlocked: "❌ Not ready for deployment - quality gates failed";
};
/**
 * Platform-specific overrides
 */
export declare const CI_PLATFORM_OVERRIDES: {
    readonly gitlab: {
        readonly nodeImage: "node:20-alpine";
        readonly cacheKey: "${CI_COMMIT_REF_SLUG}";
        readonly artifactFormat: "codequality";
    };
    readonly azure: {
        readonly nodeVersionSpec: "20.x";
        readonly vmImage: "ubuntu-latest";
        readonly buildConfiguration: "Release";
    };
    readonly circleci: {
        readonly nodeImage: "cimg/node:20.0";
        readonly workingDirectory: "~/ollama-code";
        readonly parallelism: 4;
    };
    readonly bitbucket: {
        readonly nodeImage: "node:20";
        readonly maxArtifactSize: "1GB";
        readonly pipelineMemory: 2048;
    };
    readonly github: {
        readonly runsOn: "ubuntu-latest";
        readonly checkoutVersion: "v4";
        readonly nodeActionVersion: "v4";
    };
};
/**
 * Get CLI command for running analysis
 */
export declare function getAnalysisCommand(platform: string, config?: Partial<typeof CI_ANALYSIS_CONFIG>): string;
/**
 * Sanitize shell variables to prevent injection
 */
export declare function sanitizeShellVariable(value: string | undefined, fallback: string): string;
/**
 * Validate quality gate result
 */
export declare function validateQualityGate(result: any): {
    passed: boolean;
    score: number;
    message: string;
};
/**
 * Generate quality report summary
 */
export declare function generateQualitySummary(result: any): string;
/**
 * Export all configurations as a single object for convenience
 */
export declare const CI_CONFIG: {
    readonly qualityGates: {
        readonly minQualityScore: 80;
        readonly maxCriticalIssues: 0;
        readonly maxSecurityIssues: 5;
        readonly maxPerformanceIssues: 3;
        readonly minTestCoverage: 80;
        readonly maxComplexityIncrease: 20;
        readonly maxTechnicalDebtIncrease: 10;
        readonly regressionThreshold: "low" | "medium" | "high";
    };
    readonly analysis: {
        readonly enableSecurity: true;
        readonly enablePerformance: true;
        readonly enableArchitecture: true;
        readonly enableRegression: true;
        readonly enableQualityGates: true;
        readonly analysisTimeoutSeconds: 300;
        readonly analysisTimeoutMs: 300000;
        readonly reportFormat: "json" | "junit" | "sarif" | "markdown" | "html";
        readonly outputPath: "./reports";
        readonly deepAnalysis: false;
    };
    readonly build: {
        readonly nodeVersion: "20";
        readonly nodeImage: "node:20";
        readonly nodeImageAlpine: "node:20-alpine";
        readonly nodeVersionSpec: "20.x";
        readonly yarnLockfile: "yarn.lock";
        readonly buildCommand: "yarn build";
        readonly installCommand: "yarn install --frozen-lockfile";
        readonly testCommand: "yarn test";
        readonly distPath: "dist";
        readonly reportsPath: "reports";
        readonly nodeModulesPath: "node_modules";
    };
    readonly artifacts: {
        readonly retentionDays: 30;
        readonly retentionDaysNightly: 90;
        readonly retentionDaysRelease: 365;
        readonly artifactPaths: {
            readonly dist: "dist/**";
            readonly reports: "reports/**";
            readonly coverage: "coverage/**";
            readonly nodeModules: "node_modules/**";
        };
        readonly cachePaths: {
            readonly nodeModules: "node_modules";
            readonly yarn: "~/.cache/yarn";
            readonly ollamaCode: ".ollama-code/cache";
        };
    };
    readonly security: {
        readonly analysisCommand: "Perform comprehensive security analysis for OWASP Top 10 vulnerabilities";
        readonly outputFile: "security-analysis.json";
        readonly criticalThreshold: 0;
        readonly highThreshold: 5;
        readonly mediumThreshold: 10;
        readonly lowThreshold: 20;
    };
    readonly performance: {
        readonly analysisTypes: readonly ["memory", "cpu", "io", "network"];
        readonly analysisCommand: (type: string) => string;
        readonly outputFilePattern: "performance-{type}.json";
        readonly parallelism: 4;
    };
    readonly regression: {
        readonly analysisCommand: (baseBranch: string) => string;
        readonly outputFile: "regression-risk.json";
        readonly criticalRiskThreshold: "critical";
        readonly highRiskThreshold: "high";
        readonly acceptableRiskThreshold: "medium";
    };
    readonly branches: {
        readonly defaultBranch: "main";
        readonly defaultBranches: readonly ["main", "master"];
        readonly developBranches: readonly ["develop", "development", "dev"];
        readonly releaseBranches: readonly ["release/*", "releases/*"];
        readonly featureBranches: readonly ["feature/*", "features/*"];
        readonly hotfixBranches: readonly ["hotfix/*", "hotfixes/*"];
        readonly ignoreBranches: readonly ["gh-pages", "docs"];
    };
    readonly messages: {
        readonly startAnalysis: "🚀 Starting Ollama Code Analysis";
        readonly installDependencies: "📦 Installing dependencies...";
        readonly buildProject: "🔨 Building project...";
        readonly runAnalysis: "🔍 Running Ollama Code Analysis...";
        readonly securityAnalysis: "🛡️ Running security vulnerability analysis...";
        readonly performanceAnalysis: "⚡ Running performance analysis...";
        readonly regressionAnalysis: "⚠️ Analyzing regression risk...";
        readonly generateReports: "📊 Generating consolidated reports...";
        readonly deploymentCheck: "🚀 Checking deployment readiness...";
        readonly qualityPassed: "✅ All quality gates passed";
        readonly qualityFailed: "❌ Quality gates failed - review required";
        readonly securityPassed: "✅ Security analysis passed";
        readonly securityFailed: "❌ Security vulnerabilities detected";
        readonly deploymentReady: "✅ Ready for deployment";
        readonly deploymentBlocked: "❌ Not ready for deployment - quality gates failed";
    };
    readonly platformOverrides: {
        readonly gitlab: {
            readonly nodeImage: "node:20-alpine";
            readonly cacheKey: "${CI_COMMIT_REF_SLUG}";
            readonly artifactFormat: "codequality";
        };
        readonly azure: {
            readonly nodeVersionSpec: "20.x";
            readonly vmImage: "ubuntu-latest";
            readonly buildConfiguration: "Release";
        };
        readonly circleci: {
            readonly nodeImage: "cimg/node:20.0";
            readonly workingDirectory: "~/ollama-code";
            readonly parallelism: 4;
        };
        readonly bitbucket: {
            readonly nodeImage: "node:20";
            readonly maxArtifactSize: "1GB";
            readonly pipelineMemory: 2048;
        };
        readonly github: {
            readonly runsOn: "ubuntu-latest";
            readonly checkoutVersion: "v4";
            readonly nodeActionVersion: "v4";
        };
    };
    readonly getAnalysisCommand: typeof getAnalysisCommand;
    readonly sanitizeShellVariable: typeof sanitizeShellVariable;
    readonly validateQualityGate: typeof validateQualityGate;
    readonly generateQualitySummary: typeof generateQualitySummary;
};
export default CI_CONFIG;
