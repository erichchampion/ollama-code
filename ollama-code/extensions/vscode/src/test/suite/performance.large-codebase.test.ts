/**
 * Performance - Large Codebase Tests
 * Phase 3.3.1 - Performance & Scalability Testing
 *
 * Tests system performance on large codebases with comprehensive benchmarking
 */

import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { performance } from 'perf_hooks';
import { createTestWorkspace, cleanupTestWorkspace } from '../helpers/extensionTestHelper';
import { PROVIDER_TEST_TIMEOUTS } from '../helpers/test-constants';

/**
 * Performance benchmark thresholds
 */
const PERFORMANCE_THRESHOLDS = {
  SMALL_CODEBASE: {
    FILE_COUNT: 100,
    MAX_ANALYSIS_TIME_MS: 5000, // 5 seconds
    MAX_MEMORY_MB: 200,
  },
  MEDIUM_CODEBASE: {
    FILE_COUNT: 1000,
    MAX_ANALYSIS_TIME_MS: 30000, // 30 seconds
    MAX_MEMORY_MB: 500,
  },
  LARGE_CODEBASE: {
    FILE_COUNT: 5000,
    MAX_ANALYSIS_TIME_MS: 120000, // 2 minutes
    MAX_MEMORY_MB: 2048, // 2GB
  },
} as const;

/**
 * Code generation templates for synthetic codebase
 */
const CODE_TEMPLATES = {
  SIMPLE_FUNCTION: (name: string, dependencies: string[] = []) => `
/**
 * Function: ${name}
 */
${dependencies.map(dep => `import { ${dep} } from './${dep}';`).join('\n')}

export function ${name}(input: string): string {
  console.log('Processing:', input);
  ${dependencies.map(dep => `${dep}(input);`).join('\n  ')}
  return input.toUpperCase();
}
`,

  COMPLEX_CLASS: (name: string, methodCount: number) => `
/**
 * Class: ${name}
 */
export class ${name} {
  private data: Map<string, any> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log('Initializing ${name}');
  }

${Array.from({ length: methodCount }, (_, i) => `
  public method${i}(param: string): void {
    this.data.set('key${i}', param);
    console.log('Method ${i} called with:', param);
  }
`).join('\n')}

  public getData(): Map<string, any> {
    return new Map(this.data);
  }
}
`,

  REACT_COMPONENT: (name: string) => `
import React, { useState, useEffect } from 'react';

interface ${name}Props {
  title: string;
  onAction?: () => void;
}

export const ${name}: React.FC<${name}Props> = ({ title, onAction }) => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    console.log('Component mounted:', title);
    return () => console.log('Component unmounted');
  }, [title]);

  const handleClick = () => {
    setCount(prev => prev + 1);
    onAction?.();
  };

  return (
    <div className="${name.toLowerCase()}">
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
`,
} as const;

/**
 * Memory measurement utilities
 */
class MemoryMonitor {
  private initialMemory: number = 0;
  private peakMemory: number = 0;
  private interval: NodeJS.Timeout | null = null;

  start(): void {
    this.initialMemory = process.memoryUsage().heapUsed;
    this.peakMemory = this.initialMemory;

    // Monitor memory every 100ms
    this.interval = setInterval(() => {
      const current = process.memoryUsage().heapUsed;
      if (current > this.peakMemory) {
        this.peakMemory = current;
      }
    }, 100);
  }

  stop(): { initialMB: number; peakMB: number; deltaMB: number } {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    const initialMB = this.initialMemory / 1024 / 1024;
    const peakMB = this.peakMemory / 1024 / 1024;
    const deltaMB = peakMB - initialMB;

    return { initialMB, peakMB, deltaMB };
  }
}

/**
 * Generate synthetic codebase for testing
 */
async function generateSyntheticCodebase(
  basePath: string,
  fileCount: number,
  complexity: 'simple' | 'medium' | 'complex'
): Promise<void> {
  const filesPerDirectory = 50;
  const directories = Math.ceil(fileCount / filesPerDirectory);

  for (let dirIdx = 0; dirIdx < directories; dirIdx++) {
    const dirPath = path.join(basePath, `module${dirIdx}`);
    await fs.promises.mkdir(dirPath, { recursive: true });

    const filesInDir = Math.min(filesPerDirectory, fileCount - dirIdx * filesPerDirectory);

    for (let fileIdx = 0; fileIdx < filesInDir; fileIdx++) {
      const fileName = `file${fileIdx}.ts`;
      const filePath = path.join(dirPath, fileName);

      let content: string;

      switch (complexity) {
        case 'simple':
          content = CODE_TEMPLATES.SIMPLE_FUNCTION(`function${dirIdx}_${fileIdx}`);
          break;

        case 'medium':
          content = CODE_TEMPLATES.SIMPLE_FUNCTION(
            `function${dirIdx}_${fileIdx}`,
            fileIdx > 0 ? [`function${dirIdx}_${fileIdx - 1}`] : []
          );
          break;

        case 'complex':
          if (fileIdx % 3 === 0) {
            content = CODE_TEMPLATES.COMPLEX_CLASS(`Class${dirIdx}_${fileIdx}`, 10);
          } else if (fileIdx % 3 === 1) {
            content = CODE_TEMPLATES.REACT_COMPONENT(`Component${dirIdx}_${fileIdx}`);
          } else {
            content = CODE_TEMPLATES.SIMPLE_FUNCTION(
              `function${dirIdx}_${fileIdx}`,
              fileIdx > 0 ? [`function${dirIdx}_${fileIdx - 1}`] : []
            );
          }
          break;
      }

      await fs.promises.writeFile(filePath, content, 'utf-8');
    }
  }
}

/**
 * Mock code analysis function (simulates real analyzer)
 */
async function analyzeCodebase(
  basePath: string,
  options: {
    enableIncrementalAnalysis?: boolean;
    reportProgress?: (progress: number) => void;
  } = {}
): Promise<{
  fileCount: number;
  functionCount: number;
  classCount: number;
  componentCount: number;
}> {
  let fileCount = 0;
  let functionCount = 0;
  let classCount = 0;
  let componentCount = 0;

  const analyzeFile = async (filePath: string): Promise<void> => {
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Simple pattern matching (mock analysis)
    functionCount += (content.match(/export function/g) || []).length;
    classCount += (content.match(/export class/g) || []).length;
    componentCount += (content.match(/export const \w+: React\.FC/g) || []).length;

    fileCount++;

    // Report progress if callback provided
    if (options.reportProgress) {
      options.reportProgress(fileCount);
    }
  };

  const analyzeDirectory = async (dirPath: string): Promise<void> => {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await analyzeDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        await analyzeFile(fullPath);
      }
    }
  };

  await analyzeDirectory(basePath);

  return { fileCount, functionCount, classCount, componentCount };
}

suite('Performance - Large Codebase Tests', () => {
  let testWorkspacePath: string;

  setup(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);
    testWorkspacePath = await createTestWorkspace('performance-large-codebase');
  });

  teardown(async function () {
    this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);
    await cleanupTestWorkspace(testWorkspacePath);
  });

  suite('Performance Benchmarks', () => {
    test('Should analyze small codebase (100 files) in <5 seconds', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'small-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      // Generate synthetic codebase
      await generateSyntheticCodebase(
        codebasePath,
        PERFORMANCE_THRESHOLDS.SMALL_CODEBASE.FILE_COUNT,
        'simple'
      );

      // Measure analysis time
      const startTime = performance.now();
      const result = await analyzeCodebase(codebasePath);
      const endTime = performance.now();

      const analysisTimeMs = endTime - startTime;

      // Assertions
      assert.strictEqual(
        result.fileCount,
        PERFORMANCE_THRESHOLDS.SMALL_CODEBASE.FILE_COUNT,
        'Should analyze all files'
      );
      assert.ok(
        analysisTimeMs < PERFORMANCE_THRESHOLDS.SMALL_CODEBASE.MAX_ANALYSIS_TIME_MS,
        `Analysis should complete in <${PERFORMANCE_THRESHOLDS.SMALL_CODEBASE.MAX_ANALYSIS_TIME_MS}ms, took ${analysisTimeMs.toFixed(0)}ms`
      );

      console.log(`✓ Small codebase analyzed in ${(analysisTimeMs / 1000).toFixed(2)}s`);
    });

    test('Should analyze medium codebase (1000 files) in <30 seconds', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'medium-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      // Generate synthetic codebase
      await generateSyntheticCodebase(
        codebasePath,
        PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.FILE_COUNT,
        'medium'
      );

      // Measure analysis time
      const startTime = performance.now();
      const result = await analyzeCodebase(codebasePath);
      const endTime = performance.now();

      const analysisTimeMs = endTime - startTime;

      // Assertions
      assert.strictEqual(
        result.fileCount,
        PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.FILE_COUNT,
        'Should analyze all files'
      );
      assert.ok(
        analysisTimeMs < PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.MAX_ANALYSIS_TIME_MS,
        `Analysis should complete in <${PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.MAX_ANALYSIS_TIME_MS}ms, took ${analysisTimeMs.toFixed(0)}ms`
      );

      console.log(`✓ Medium codebase analyzed in ${(analysisTimeMs / 1000).toFixed(2)}s`);
    });

    test('Should analyze large codebase (5000 files) in <2 minutes', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'large-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      // Generate synthetic codebase
      await generateSyntheticCodebase(
        codebasePath,
        PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.FILE_COUNT,
        'complex'
      );

      // Measure analysis time
      const startTime = performance.now();
      const result = await analyzeCodebase(codebasePath);
      const endTime = performance.now();

      const analysisTimeMs = endTime - startTime;

      // Assertions
      assert.strictEqual(
        result.fileCount,
        PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.FILE_COUNT,
        'Should analyze all files'
      );
      assert.ok(
        analysisTimeMs < PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.MAX_ANALYSIS_TIME_MS,
        `Analysis should complete in <${PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.MAX_ANALYSIS_TIME_MS}ms, took ${analysisTimeMs.toFixed(0)}ms`
      );

      console.log(`✓ Large codebase analyzed in ${(analysisTimeMs / 1000).toFixed(2)}s`);
    });

    test('Should provide progress reporting during indexing', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'progress-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      await generateSyntheticCodebase(codebasePath, 500, 'medium');

      const progressUpdates: number[] = [];
      const progressCallback = (filesProcessed: number) => {
        progressUpdates.push(filesProcessed);
      };

      await analyzeCodebase(codebasePath, { reportProgress: progressCallback });

      // Assertions
      assert.ok(progressUpdates.length > 0, 'Should receive progress updates');
      assert.strictEqual(progressUpdates[progressUpdates.length - 1], 500, 'Final progress should be 500');
      assert.ok(
        progressUpdates.every((val, idx) => idx === 0 || val >= progressUpdates[idx - 1]),
        'Progress should be monotonically increasing'
      );

      console.log(`✓ Received ${progressUpdates.length} progress updates`);
    });

    test('Should use <2GB memory on large codebase', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'memory-test-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      await generateSyntheticCodebase(
        codebasePath,
        PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.FILE_COUNT,
        'complex'
      );

      // Monitor memory usage
      const memoryMonitor = new MemoryMonitor();
      memoryMonitor.start();

      await analyzeCodebase(codebasePath);

      const memoryUsage = memoryMonitor.stop();

      // Assertions
      assert.ok(
        memoryUsage.peakMB < PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.MAX_MEMORY_MB,
        `Peak memory should be <${PERFORMANCE_THRESHOLDS.LARGE_CODEBASE.MAX_MEMORY_MB}MB, was ${memoryUsage.peakMB.toFixed(2)}MB`
      );

      console.log(
        `✓ Memory usage: ${memoryUsage.initialMB.toFixed(2)}MB → ${memoryUsage.peakMB.toFixed(2)}MB (Δ${memoryUsage.deltaMB.toFixed(2)}MB)`
      );
    });

    test('Should show improved performance with incremental analysis', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'incremental-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      await generateSyntheticCodebase(codebasePath, 1000, 'medium');

      // Initial full analysis
      const fullAnalysisStart = performance.now();
      await analyzeCodebase(codebasePath, { enableIncrementalAnalysis: false });
      const fullAnalysisTime = performance.now() - fullAnalysisStart;

      // Modify a single file
      const modifiedFilePath = path.join(codebasePath, 'module0', 'file0.ts');
      const modifiedContent = CODE_TEMPLATES.SIMPLE_FUNCTION('modifiedFunction');
      await fs.promises.writeFile(modifiedFilePath, modifiedContent, 'utf-8');

      // Incremental analysis (simulated - would only analyze changed file)
      const incrementalStart = performance.now();
      await analyzeCodebase(path.join(codebasePath, 'module0'), {
        enableIncrementalAnalysis: true,
      });
      const incrementalTime = performance.now() - incrementalStart;

      // Assertions
      assert.ok(
        incrementalTime < fullAnalysisTime / 10,
        `Incremental analysis should be >10x faster than full analysis. Full: ${fullAnalysisTime.toFixed(0)}ms, Incremental: ${incrementalTime.toFixed(0)}ms`
      );

      console.log(
        `✓ Full analysis: ${fullAnalysisTime.toFixed(0)}ms, Incremental: ${incrementalTime.toFixed(0)}ms (${(fullAnalysisTime / incrementalTime).toFixed(1)}x faster)`
      );
    });

    test('Should handle mixed file types efficiently', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'mixed-types-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      // Generate mixed content
      await generateSyntheticCodebase(codebasePath, 1000, 'complex');

      const startTime = performance.now();
      const result = await analyzeCodebase(codebasePath);
      const analysisTime = performance.now() - startTime;

      // Assertions
      assert.ok(result.functionCount > 0, 'Should detect functions');
      assert.ok(result.classCount > 0, 'Should detect classes');
      assert.ok(result.componentCount > 0, 'Should detect React components');
      assert.ok(
        analysisTime < PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.MAX_ANALYSIS_TIME_MS,
        `Should handle mixed types efficiently in <${PERFORMANCE_THRESHOLDS.MEDIUM_CODEBASE.MAX_ANALYSIS_TIME_MS}ms`
      );

      console.log(
        `✓ Analyzed ${result.fileCount} files: ${result.functionCount} functions, ${result.classCount} classes, ${result.componentCount} components in ${(analysisTime / 1000).toFixed(2)}s`
      );
    });

    test('Should maintain performance consistency across multiple runs', async function () {
      this.timeout(PROVIDER_TEST_TIMEOUTS.EXTENDED_TEST);

      const codebasePath = path.join(testWorkspacePath, 'consistency-codebase');
      await fs.promises.mkdir(codebasePath, { recursive: true });

      await generateSyntheticCodebase(codebasePath, 500, 'medium');

      const runTimes: number[] = [];
      const runCount = 5;

      for (let i = 0; i < runCount; i++) {
        const startTime = performance.now();
        await analyzeCodebase(codebasePath);
        const runTime = performance.now() - startTime;
        runTimes.push(runTime);
      }

      // Calculate statistics
      const avgTime = runTimes.reduce((sum, time) => sum + time, 0) / runCount;
      const variance =
        runTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / runCount;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = (stdDev / avgTime) * 100;

      // Assertions
      assert.ok(
        coefficientOfVariation < 20,
        `Performance should be consistent (CV < 20%), got ${coefficientOfVariation.toFixed(2)}%`
      );

      console.log(
        `✓ ${runCount} runs: avg ${avgTime.toFixed(0)}ms, σ=${stdDev.toFixed(0)}ms, CV=${coefficientOfVariation.toFixed(2)}%`
      );
    });
  });
});
