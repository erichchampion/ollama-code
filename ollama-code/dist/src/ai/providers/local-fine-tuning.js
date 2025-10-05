/**
 * Local Model Fine-Tuning Integration
 *
 * Provides capabilities for fine-tuning local AI models with custom datasets
 * for domain-specific code understanding and generation.
 */
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import { BaseAIProvider, AICapability } from './base-provider.js';
import { generateSecureId, generateRequestId } from '../../utils/id-generator.js';
import { FINE_TUNING_CONFIG, getMergedConfig } from './config/advanced-features-config.js';
import { DirectoryManager } from '../../utils/directory-manager.js';
import { normalizeError } from '../../utils/error-utils.js';
export class LocalFineTuningManager extends EventEmitter {
    datasets = new Map();
    jobs = new Map();
    deployments = new Map();
    workspaceDir;
    modelsDir;
    datasetsDir;
    runningJobs = new Map();
    constructor(workspaceDir = './ollama-code-workspace') {
        super();
        this.workspaceDir = workspaceDir;
        this.modelsDir = path.join(workspaceDir, 'models');
        this.datasetsDir = path.join(workspaceDir, 'datasets');
    }
    /**
     * Initialize the fine-tuning workspace
     */
    async initialize() {
        try {
            await this.ensureDirectories();
            await this.loadExistingAssets();
            this.emit('initialized');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Create a new dataset from files
     */
    async createDataset(name, description, type, sourceFiles, options = {}) {
        const id = generateSecureId('dataset');
        const format = options.format || 'jsonl';
        const filePath = path.join(this.datasetsDir, `${id}.${format}`);
        try {
            // Process source files into training format
            const samples = await this.processSourceFiles(sourceFiles, type, format);
            // Validate dataset quality if requested
            const quality = options.validateQuality
                ? await this.validateDatasetQuality(samples, type)
                : 'medium';
            // Save processed dataset
            await this.saveDataset(filePath, samples, format);
            const dataset = {
                id,
                name,
                description,
                type,
                format,
                filePath,
                size: await this.getFileSize(filePath),
                samples: samples.length,
                createdAt: new Date(),
                lastModified: new Date(),
                metadata: {
                    language: options.language,
                    framework: options.framework,
                    domain: options.domain,
                    quality,
                    validated: options.validateQuality || false
                }
            };
            this.datasets.set(id, dataset);
            this.emit('datasetCreated', dataset);
            return dataset;
        }
        catch (error) {
            this.emit('error', error);
            throw new Error(`Failed to create dataset: ${normalizeError(error).message}`);
        }
    }
    /**
     * Start a fine-tuning job
     */
    async startFineTuning(name, baseModel, datasetId, config = {}) {
        const dataset = this.datasets.get(datasetId);
        if (!dataset) {
            throw new Error(`Dataset not found: ${datasetId}`);
        }
        const id = generateSecureId('finetune_job');
        const fullConfig = this.mergeWithDefaults(config);
        const job = {
            id,
            name,
            status: 'pending',
            baseModel,
            dataset,
            config: fullConfig,
            progress: {
                currentEpoch: 0,
                totalEpochs: fullConfig.epochs,
                loss: 0
            },
            outputModel: {},
            logs: [],
            createdAt: new Date()
        };
        this.jobs.set(id, job);
        try {
            await this.executeFineTuning(job);
            this.emit('jobStarted', job);
            return job;
        }
        catch (error) {
            job.status = 'failed';
            job.error = normalizeError(error).message;
            this.emit('jobFailed', job);
            throw error;
        }
    }
    /**
     * Monitor a fine-tuning job
     */
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    /**
     * List all jobs
     */
    listJobs() {
        return Array.from(this.jobs.values());
    }
    /**
     * Cancel a running job
     */
    async cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }
        if (job.status !== 'running') {
            throw new Error(`Job ${jobId} is not running`);
        }
        const process = this.runningJobs.get(jobId);
        if (process) {
            process.kill('SIGTERM');
            this.runningJobs.delete(jobId);
        }
        job.status = 'cancelled';
        job.completedAt = new Date();
        this.emit('jobCancelled', job);
    }
    /**
     * Deploy a fine-tuned model
     */
    async deployModel(name, modelPath, options = {}) {
        const id = generateSecureId('model_deployment');
        const port = options.port || await this.findAvailablePort();
        const deployment = {
            id,
            name,
            modelPath,
            status: 'deploying',
            port,
            endpoint: `http://localhost:${port}`,
            resources: {
                memoryUsage: 0,
                cpuUsage: 0
            },
            performance: {
                requestsPerSecond: 0,
                averageLatency: 0,
                throughput: 0
            },
            createdAt: new Date()
        };
        this.deployments.set(id, deployment);
        try {
            await this.startModelServer(deployment, options);
            deployment.status = 'deployed';
            this.emit('modelDeployed', deployment);
            return deployment;
        }
        catch (error) {
            deployment.status = 'error';
            this.emit('deploymentFailed', deployment, error);
            throw error;
        }
    }
    /**
     * List all datasets
     */
    listDatasets() {
        return Array.from(this.datasets.values());
    }
    /**
     * List all deployments
     */
    listDeployments() {
        return Array.from(this.deployments.values());
    }
    /**
     * Get deployment status
     */
    getDeployment(deploymentId) {
        return this.deployments.get(deploymentId);
    }
    /**
     * Stop a model deployment
     */
    async stopDeployment(deploymentId) {
        const deployment = this.deployments.get(deploymentId);
        if (!deployment) {
            throw new Error(`Deployment not found: ${deploymentId}`);
        }
        // Stop the model server (implementation depends on the server type)
        deployment.status = 'stopped';
        this.emit('deploymentStopped', deployment);
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        // Cancel all running jobs
        for (const [jobId, process] of this.runningJobs) {
            process.kill('SIGTERM');
        }
        this.runningJobs.clear();
        // Stop all deployments
        for (const deployment of this.deployments.values()) {
            if (deployment.status === 'deployed') {
                await this.stopDeployment(deployment.id);
            }
        }
        this.removeAllListeners();
    }
    /**
     * Private methods
     */
    async ensureDirectories() {
        await DirectoryManager.ensureDirectories(this.workspaceDir, this.modelsDir, this.datasetsDir);
    }
    async loadExistingAssets() {
        // Load existing datasets and jobs from storage
        // Implementation would scan directories and rebuild state
    }
    async processSourceFiles(sourceFiles, type, format) {
        const samples = [];
        for (const filePath of sourceFiles) {
            const content = await fs.readFile(filePath, 'utf-8');
            switch (type) {
                case 'code_completion':
                    samples.push(...this.extractCodeCompletionSamples(content, filePath));
                    break;
                case 'code_analysis':
                    samples.push(...this.extractCodeAnalysisSamples(content, filePath));
                    break;
                case 'documentation':
                    samples.push(...this.extractDocumentationSamples(content, filePath));
                    break;
                case 'general':
                    samples.push(...this.extractGeneralSamples(content, filePath));
                    break;
            }
        }
        return samples;
    }
    extractCodeCompletionSamples(content, filePath) {
        // Extract code completion training samples
        const samples = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            const prompt = lines.slice(Math.max(0, i - FINE_TUNING_CONFIG.processing.contextLines), i).join('\n');
            const completion = lines[i];
            if (prompt.trim() && completion.trim()) {
                samples.push({
                    prompt: prompt.trim(),
                    completion: completion.trim(),
                    metadata: {
                        file: path.basename(filePath),
                        line: i + 1,
                        language: this.detectLanguage(filePath)
                    }
                });
            }
        }
        return samples;
    }
    extractCodeAnalysisSamples(content, filePath) {
        const samples = [];
        const ext = path.extname(filePath).toLowerCase();
        // Only process code files
        if (!['.ts', '.js', '.py', '.java', '.cpp', '.c', '.go', '.rs'].includes(ext)) {
            return samples;
        }
        try {
            // Extract function definitions and their documentation
            const functionRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{([\s\S]*?)^}/gm;
            let match;
            while ((match = functionRegex.exec(content)) !== null) {
                if (match.length < 4)
                    continue; // Skip if regex didn't capture expected groups
                const [, docComment, functionName, functionBody] = match;
                const cleanDoc = docComment?.replace(/\*\s?/g, '').trim() || '';
                if (cleanDoc && functionBody.trim()) {
                    samples.push({
                        input: `Analyze this ${ext.slice(1)} function and explain what it does:\n\n${match[0]}`,
                        output: `This function "${functionName}" ${cleanDoc.split('\n')[0]}. ${this.analyzeCodeComplexity(functionBody)}`,
                        metadata: {
                            type: 'code_analysis',
                            language: ext.slice(1),
                            filePath,
                            functionName
                        }
                    });
                }
            }
            // Extract class/interface definitions
            const classRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:class|interface)\s+(\w+)/g;
            while ((match = classRegex.exec(content)) !== null) {
                if (match.length < 3)
                    continue; // Skip if regex didn't capture expected groups
                const [, docComment, className] = match;
                const cleanDoc = docComment?.replace(/\*\s?/g, '').trim() || '';
                if (cleanDoc) {
                    samples.push({
                        input: `What is the purpose of this ${ext.slice(1)} class/interface?\n\n${match[0]}`,
                        output: `The "${className}" class/interface ${cleanDoc.split('\n')[0]}`,
                        metadata: {
                            type: 'code_analysis',
                            language: ext.slice(1),
                            filePath,
                            className
                        }
                    });
                }
            }
        }
        catch (error) {
            console.warn(`Error extracting code analysis samples from ${filePath}:`, error);
        }
        return samples;
    }
    extractDocumentationSamples(content, filePath) {
        const samples = [];
        const ext = path.extname(filePath).toLowerCase();
        // Process markdown files and code comments
        if (ext === '.md') {
            try {
                // Extract README-style Q&A patterns
                const sections = content.split(/^#+\s+/m).filter(s => s.trim());
                sections.forEach((section, index) => {
                    const lines = section.split('\n');
                    const title = lines[0]?.trim();
                    const body = lines.slice(1).join('\n').trim();
                    if (title && body && body.length > 100) {
                        samples.push({
                            input: `Explain the ${title} section from this documentation`,
                            output: body,
                            metadata: {
                                type: 'documentation',
                                filePath,
                                section: title,
                                format: 'markdown'
                            }
                        });
                        // Create reverse samples for documentation generation
                        samples.push({
                            input: `Write documentation for: ${title}`,
                            output: `# ${title}\n\n${body}`,
                            metadata: {
                                type: 'doc_generation',
                                filePath,
                                section: title,
                                format: 'markdown'
                            }
                        });
                    }
                });
            }
            catch (error) {
                console.warn(`Error extracting documentation samples from ${filePath}:`, error);
            }
        }
        // Extract JSDoc comments from code files
        if (['.ts', '.js'].includes(ext)) {
            try {
                const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
                let match;
                while ((match = jsdocRegex.exec(content)) !== null) {
                    if (match.length < 2)
                        continue; // Skip if regex didn't capture expected groups
                    const comment = match[1]?.replace(/\*\s?/g, '').trim() || '';
                    if (comment.length > FINE_TUNING_CONFIG.processing.qualityThresholds.minCommentLength) {
                        samples.push({
                            input: 'Generate JSDoc documentation for a similar function',
                            output: `/**\n${comment.split('\n').map(line => ` * ${line}`).join('\n')}\n */`,
                            metadata: {
                                type: 'jsdoc_generation',
                                filePath,
                                format: 'jsdoc'
                            }
                        });
                    }
                }
            }
            catch (error) {
                console.warn(`Error extracting JSDoc samples from ${filePath}:`, error);
            }
        }
        return samples;
    }
    extractGeneralSamples(content, filePath) {
        const samples = [];
        const ext = path.extname(filePath).toLowerCase();
        try {
            // Extract configuration patterns
            if (['.json', '.yaml', '.yml', '.toml'].includes(ext)) {
                const configType = this.detectConfigType(content, filePath);
                if (configType) {
                    samples.push({
                        input: `Explain this ${configType} configuration file`,
                        output: `This is a ${configType} configuration file that ${this.analyzeConfigPurpose(content, filePath)}`,
                        metadata: {
                            type: 'config_analysis',
                            configType,
                            filePath,
                            format: ext.slice(1)
                        }
                    });
                }
            }
            // Extract test patterns
            if (filePath.includes('test') || filePath.includes('spec')) {
                const testSamples = this.extractTestPatterns(content, filePath);
                samples.push(...testSamples);
            }
            // Extract import/export patterns for module understanding
            if (['.ts', '.js'].includes(ext)) {
                const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
                const imports = [];
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    if (match.length < 2 || !match[1])
                        continue; // Skip if regex didn't capture expected groups
                    imports.push(match[1]);
                }
                if (imports.length > 2) {
                    samples.push({
                        input: `What modules does this file depend on?`,
                        output: `This file imports from ${imports.length} modules: ${imports.slice(0, FINE_TUNING_CONFIG.processing.qualityThresholds.maxTopImports).join(', ')}${imports.length > FINE_TUNING_CONFIG.processing.qualityThresholds.maxTopImports ? ' and others' : ''}. This suggests it handles ${this.inferModulePurpose(imports)}.`,
                        metadata: {
                            type: 'dependency_analysis',
                            filePath,
                            importCount: imports.length,
                            topImports: imports.slice(0, FINE_TUNING_CONFIG.processing.qualityThresholds.maxTopImports)
                        }
                    });
                }
            }
        }
        catch (error) {
            console.warn(`Error extracting general samples from ${filePath}:`, error);
        }
        return samples;
    }
    analyzeCodeComplexity(code) {
        const lines = code.split('\n').filter(line => line.trim()).length;
        const hasLoops = /\b(for|while|forEach)\b/.test(code);
        const hasConditionals = /\b(if|switch|case)\b/.test(code);
        const hasAsync = /\b(async|await|Promise)\b/.test(code);
        let complexity = 'simple';
        if (lines > FINE_TUNING_CONFIG.processing.complexityThresholds.moderateLines || (hasLoops && hasConditionals))
            complexity = 'moderate';
        if (lines > FINE_TUNING_CONFIG.processing.complexityThresholds.complexLines || (hasAsync && hasLoops && hasConditionals))
            complexity = 'complex';
        return `It appears to be a ${complexity} function with ${lines} lines of code${hasAsync ? ' that includes asynchronous operations' : ''}.`;
    }
    detectConfigType(content, filePath) {
        const fileName = path.basename(filePath).toLowerCase();
        if (fileName.includes('package.json'))
            return 'npm package';
        if (fileName.includes('tsconfig'))
            return 'TypeScript';
        if (fileName.includes('jest') || fileName.includes('test'))
            return 'testing';
        if (fileName.includes('eslint') || fileName.includes('lint'))
            return 'linting';
        if (fileName.includes('webpack') || fileName.includes('vite'))
            return 'build tool';
        if (fileName.includes('docker'))
            return 'Docker';
        return 'application';
    }
    analyzeConfigPurpose(content, filePath) {
        const fileName = path.basename(filePath);
        try {
            const parsed = JSON.parse(content);
            if (parsed.scripts)
                return 'defines build and development scripts';
            if (parsed.dependencies)
                return 'manages project dependencies';
            if (parsed.compilerOptions)
                return 'configures TypeScript compilation settings';
            if (parsed.rules)
                return 'defines code quality and style rules';
        }
        catch {
            // Not JSON, could be YAML or other format
        }
        return `configures settings for ${fileName.split('.')[0]}`;
    }
    extractTestPatterns(content, filePath) {
        const samples = [];
        // Extract test descriptions and expectations
        const testRegex = /(?:it|test)\s*\(\s*['"]([^'"]+)['"]\s*,\s*(?:async\s*)?\([^)]*\)\s*=>\s*{([\s\S]*?)^\s*}\s*\)/gm;
        let match;
        while ((match = testRegex.exec(content)) !== null) {
            if (match.length < 3)
                continue; // Skip if regex didn't capture expected groups
            const [, testDescription, testBody] = match;
            if (testDescription && testBody.trim()) {
                samples.push({
                    input: `Write a test that ${testDescription}`,
                    output: `Here's a test implementation:\n\n${match[0]}`,
                    metadata: {
                        type: 'test_pattern',
                        filePath,
                        testDescription,
                        framework: this.detectTestFramework(content)
                    }
                });
            }
        }
        return samples;
    }
    detectTestFramework(content) {
        if (content.includes('jest'))
            return 'jest';
        if (content.includes('mocha'))
            return 'mocha';
        if (content.includes('vitest'))
            return 'vitest';
        if (content.includes('describe') && content.includes('it'))
            return 'jasmine-style';
        return 'unknown';
    }
    inferModulePurpose(imports) {
        const categories = {
            'web frameworks': ['express', 'fastify', 'koa', 'next', 'react', 'vue', 'angular'],
            'testing': ['jest', 'mocha', 'vitest', 'testing-library'],
            'utilities': ['lodash', 'ramda', 'moment', 'date-fns'],
            'data processing': ['axios', 'fetch', 'fs', 'path'],
            'build tools': ['webpack', 'vite', 'rollup', 'babel']
        };
        for (const [category, patterns] of Object.entries(categories)) {
            if (imports.some(imp => patterns.some(pattern => imp.includes(pattern)))) {
                return category;
            }
        }
        return 'general application logic';
    }
    async validateDatasetQuality(samples, type) {
        const config = getMergedConfig(FINE_TUNING_CONFIG);
        if (samples.length < config.qualityThresholds.lowSampleCount)
            return 'low';
        if (samples.length < config.qualityThresholds.mediumSampleCount)
            return 'medium';
        return 'high';
    }
    async saveDataset(filePath, samples, format) {
        if (format === 'jsonl') {
            const content = samples.map(sample => JSON.stringify(sample)).join('\n');
            await fs.writeFile(filePath, content, 'utf-8');
        }
        else {
            throw new Error(`Unsupported format: ${format}`);
        }
    }
    async getFileSize(filePath) {
        const stats = await fs.stat(filePath);
        return stats.size;
    }
    mergeWithDefaults(config) {
        const defaults = getMergedConfig(FINE_TUNING_CONFIG).defaultConfig;
        return { ...defaults, ...config };
    }
    async executeFineTuning(job) {
        job.status = 'running';
        job.startedAt = new Date();
        // This would execute the actual fine-tuning process
        // For now, simulate with a timeout
        return new Promise((resolve, reject) => {
            const config = getMergedConfig(FINE_TUNING_CONFIG).simulation;
            const duration = config.durationMs;
            const updateInterval = config.updateIntervalMs;
            let currentTime = 0;
            const interval = setInterval(() => {
                currentTime += updateInterval;
                const progress = currentTime / duration;
                job.progress.currentEpoch = Math.floor(progress * job.config.epochs);
                job.progress.loss = Math.max(0.1, 2.0 * (1 - progress) + Math.random() * 0.1);
                job.progress.estimatedTimeRemaining = duration - currentTime;
                this.emit('jobProgress', job);
                if (currentTime >= duration) {
                    clearInterval(interval);
                    job.status = 'completed';
                    job.completedAt = new Date();
                    job.results = {
                        finalLoss: job.progress.loss,
                        accuracy: FINE_TUNING_CONFIG.processing.mockMetrics.baseAccuracy + Math.random() * FINE_TUNING_CONFIG.processing.mockMetrics.accuracyVariance,
                        perplexity: FINE_TUNING_CONFIG.processing.mockMetrics.basePerplexity + Math.random() * FINE_TUNING_CONFIG.processing.mockMetrics.perplexityVariance
                    };
                    job.outputModel.path = path.join(this.modelsDir, `${job.id}_model`);
                    job.outputModel.size = 1024 * 1024 * config.outputModelSizeMB;
                    this.emit('jobCompleted', job);
                    resolve();
                }
            }, updateInterval);
        });
    }
    async startModelServer(deployment, options) {
        // Start model server (implementation would depend on the model format)
        // For now, just simulate successful deployment
        const config = getMergedConfig(FINE_TUNING_CONFIG).simulation;
        await new Promise(resolve => setTimeout(resolve, config.serverStartupDelayMs));
    }
    async findAvailablePort() {
        // Find an available port for model deployment
        return 8000 + Math.floor(Math.random() * 1000);
    }
    detectLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const languageMap = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift'
        };
        return languageMap[ext] || 'unknown';
    }
}
/**
 * Custom Local Provider for fine-tuned models
 */
export class CustomLocalProvider extends BaseAIProvider {
    fineTuningManager;
    currentDeployment;
    constructor(config) {
        super(config);
        this.fineTuningManager = new LocalFineTuningManager(config.workspaceDir);
    }
    getName() {
        return 'custom-local';
    }
    getDisplayName() {
        return 'Custom Local Models';
    }
    getCapabilities() {
        const config = getMergedConfig(FINE_TUNING_CONFIG).providers;
        return {
            maxContextWindow: config.contextWindow,
            supportedCapabilities: [
                AICapability.TEXT_COMPLETION,
                AICapability.CODE_GENERATION,
                AICapability.CODE_ANALYSIS
            ],
            rateLimits: config.rateLimits,
            features: {
                streaming: true,
                functionCalling: false,
                imageInput: false,
                documentInput: false,
                customInstructions: true
            }
        };
    }
    async initialize() {
        await this.fineTuningManager.initialize();
        this.isInitialized = true;
    }
    async testConnection() {
        return this.currentDeployment?.status === 'deployed' || false;
    }
    async complete(prompt, options = {}) {
        if (!this.currentDeployment) {
            throw new Error('No model deployed');
        }
        // Implement completion using deployed model
        const startTime = Date.now();
        const config = getMergedConfig(FINE_TUNING_CONFIG).providers.mockResponse;
        const response = {
            content: 'Mock response from custom local model',
            model: this.currentDeployment.name,
            finishReason: 'stop',
            usage: config,
            metadata: {
                requestId: generateRequestId(),
                processingTime: Date.now() - startTime,
                provider: this.getName()
            }
        };
        this.updateMetrics(true, response.metadata.processingTime, response.usage.totalTokens, 0);
        return response;
    }
    async completeStream(prompt, options, onEvent, abortSignal) {
        const deployments = this.fineTuningManager.listDeployments();
        const deployment = deployments.find(d => d.status === 'deployed');
        if (!deployment || deployment.status !== 'deployed') {
            throw new Error('No active deployment available for streaming');
        }
        const requestId = generateRequestId();
        const startTime = Date.now();
        try {
            // Simulate streaming response by chunking a complete response
            const fullResponse = await this.complete(prompt, options);
            const content = fullResponse.content;
            // Split content into chunks for streaming
            const chunkSize = FINE_TUNING_CONFIG.processing.chunkSize; // words per chunk
            const words = content.split(' ');
            const chunks = [];
            for (let i = 0; i < words.length; i += chunkSize) {
                chunks.push(words.slice(i, i + chunkSize).join(' '));
            }
            // Stream chunks with simulated delay
            for (let i = 0; i < chunks.length; i++) {
                if (abortSignal?.aborted) {
                    onEvent({
                        type: 'error',
                        error: new Error('Request aborted'),
                        requestId
                    });
                    return;
                }
                const chunk = chunks[i];
                const isLast = i === chunks.length - 1;
                // Add space between chunks except for the last one
                const chunkContent = isLast ? chunk : chunk + ' ';
                onEvent({
                    type: 'content',
                    content: chunkContent,
                    requestId,
                    metadata: {
                        chunkIndex: i,
                        totalChunks: chunks.length,
                        isComplete: isLast
                    }
                });
                // Simulate network delay between chunks
                if (!isLast) {
                    await new Promise(resolve => setTimeout(resolve, FINE_TUNING_CONFIG.processing.streamingDelayMs));
                }
            }
            // Send completion event
            onEvent({
                type: 'done',
                requestId,
                metadata: {
                    totalTime: Date.now() - startTime,
                    tokensGenerated: words.length,
                    model: deployment.name
                }
            });
        }
        catch (error) {
            onEvent({
                type: 'error',
                error,
                requestId
            });
            throw error;
        }
    }
    async listModels() {
        const deployments = this.fineTuningManager.listDeployments();
        return deployments.map(deployment => ({
            id: deployment.id,
            name: deployment.name,
            provider: this.getName(),
            capabilities: [AICapability.TEXT_COMPLETION, AICapability.CODE_GENERATION],
            contextWindow: FINE_TUNING_CONFIG.providers.contextWindow,
            costPerToken: {
                input: 0,
                output: 0
            },
            averageResponseTime: deployment.performance.averageLatency,
            qualityScore: FINE_TUNING_CONFIG.processing.mockMetrics.defaultQualityScore,
            lastUpdated: deployment.createdAt
        }));
    }
    async getModel(modelId) {
        const models = await this.listModels();
        return models.find(model => model.id === modelId) || null;
    }
    calculateCost(promptTokens, completionTokens, model) {
        return 0; // Local models have no cost
    }
    /**
     * Get fine-tuning manager for advanced operations
     */
    getFineTuningManager() {
        return this.fineTuningManager;
    }
    /**
     * Set active deployment
     */
    setActiveDeployment(deploymentId) {
        const deployment = this.fineTuningManager.getDeployment(deploymentId);
        if (!deployment) {
            throw new Error(`Deployment not found: ${deploymentId}`);
        }
        this.currentDeployment = deployment;
    }
}
//# sourceMappingURL=local-fine-tuning.js.map