/**
 * Startup Optimization System
 *
 * Manages selective initialization based on command requirements
 * to minimize startup time for simple operations
 */

import { logger } from '../utils/logger.js';
import { getCommandRequirements } from './lazy-loader.js';
import { ensureOllamaServerRunning } from '../utils/ollama-server.js';

/**
 * Initialize lazy loading registrations
 */
export async function initializeLazyLoading(): Promise<void> {
  const { getLazyLoader } = await import('../core/services.js');
  const lazyLoader = await getLazyLoader();
  // Register AI system
  lazyLoader.register('ai', async () => {
    logger.debug('Initializing AI system...');
    const { initAI } = await import('../ai/index.js');
    await initAI();
    return true;
  });

  // Register tool system
  lazyLoader.register('tools', async () => {
    logger.debug('Initializing tool system...');
    const { initializeToolSystem } = await import('../tools/index.js');
    initializeToolSystem();
    return true;
  });

  // Register command registry
  lazyLoader.register('commands', async () => {
    logger.debug('Registering commands...');
    const { registerCommands } = await import('../commands/register.js');
    registerCommands();
    return true;
  });

  // Register project context
  lazyLoader.register('project', async () => {
    logger.debug('Initializing project context...');
    const { ProjectContext } = await import('../ai/context.js');
    const context = new ProjectContext(process.cwd());
    await context.initialize();
    return context;
  });

  // Register terminal for interactive features
  lazyLoader.register('terminal', async () => {
    logger.debug('Initializing terminal interface...');
    // Terminal initialization would go here
    return { initialized: true };
  });

  // Register analytics
  lazyLoader.register('analytics', async () => {
    logger.debug('Initializing analytics...');
    // Analytics initialization would go here
    return { initialized: true };
  });

  // Register configuration
  lazyLoader.register('config', async () => {
    logger.debug('Loading configuration...');
    // Configuration loading would go here
    return { initialized: true };
  });
}

/**
 * Optimized command execution with selective initialization
 */
export async function executeCommandOptimized(commandName: string, args: string[]): Promise<void> {
  const startTime = performance.now();

  try {
    const { getLazyLoader } = await import('../core/services.js');
    const lazyLoader = await getLazyLoader();

    // Always load commands first (lightweight)
    await lazyLoader.get('commands');

    // Get command requirements
    const requirements = getCommandRequirements(commandName);
    logger.debug(`Command requirements for ${commandName}:`, requirements);

    // Initialize only what's needed
    const initPromises: Promise<any>[] = [];

    if (requirements.needsTools) {
      initPromises.push(lazyLoader.get('tools'));
    }

    if (requirements.needsAI || requirements.needsProject) {
      // Ensure Ollama is running before AI initialization
      initPromises.push(ensureOllamaServerRunning());
    }

    if (requirements.needsAI) {
      initPromises.push(lazyLoader.get('ai'));
    }

    if (requirements.needsProject) {
      initPromises.push(lazyLoader.get('project'));
    }

    // Wait for required components
    await Promise.all(initPromises);

    // Execute the command
    const { executeCommand } = await import('../commands/index.js');
    await executeCommand(commandName, args);

    const duration = performance.now() - startTime;
    logger.debug(`Command ${commandName} completed in ${duration.toFixed(2)}ms`);

  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Command ${commandName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Preload common components in background
 */
export async function preloadCommonComponents(): Promise<void> {
  // Run in background without blocking
  setTimeout(async () => {
    try {
      const { getLazyLoader } = await import('../core/services.js');
      const lazyLoader = await getLazyLoader();
      await lazyLoader.preload(['config', 'analytics']);
      logger.debug('Background preload completed');
    } catch (error) {
      logger.debug('Background preload failed:', error);
    }
  }, 100);
}

/**
 * Get startup performance metrics
 */
export async function getStartupMetrics(): Promise<{
  loadedComponents: string[];
  totalComponents: string[];
  loadTime: number;
}> {
  const { getLazyLoader } = await import('../core/services.js');
  const lazyLoader = await getLazyLoader();
  const status = lazyLoader.getStatus();
  return {
    loadedComponents: status.loaded,
    totalComponents: status.available,
    loadTime: performance.now()
  };
}