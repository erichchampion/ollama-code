/**
 * AI Module
 * 
 * Provides AI capabilities using Ollama, local large language model inference.
 * This module handles initialization, configuration, and access to AI services.
 */

import { OllamaClient } from './ollama-client.js';
import { EnhancedClient } from './enhanced-client.js';
import { ProjectContext } from './context.js';
import { TaskPlanner } from './task-planner.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';

// Singleton instances
let aiClient: OllamaClient | null = null;
let enhancedClient: EnhancedClient | null = null;
let projectContext: ProjectContext | null = null;
let taskPlanner: TaskPlanner | null = null;

/**
 * Initialize the AI module with enhanced capabilities
 */
export async function initAI(config: any = {}): Promise<{
  ollamaClient: OllamaClient;
  enhancedClient: EnhancedClient;
  projectContext: ProjectContext;
  taskPlanner: TaskPlanner;
}> {
  logger.info('Initializing enhanced AI module');

  try {
    // Create Ollama client
    aiClient = new OllamaClient(config);

    // Test connection to Ollama server
    logger.debug('Testing connection to Ollama server');
    const connectionSuccess = await aiClient.testConnection();

    if (!connectionSuccess) {
      throw createUserError('Failed to connect to Ollama server', {
        category: ErrorCategory.CONNECTION,
        resolution: 'Make sure Ollama is running. Try running "ollama serve" to start the server.'
      });
    }

    // Initialize project context
    const projectRoot = process.cwd();
    projectContext = new ProjectContext(projectRoot);
    await projectContext.initialize();

    // Initialize enhanced AI client
    const enhancedConfig = {
      model: 'llama3.2:latest',
      baseUrl: 'http://127.0.0.1:11434',
      contextWindow: 4096,
      enableTaskPlanning: true,
      enableAutonomousModification: true,
      executionPreferences: {
        parallelism: 2,
        riskTolerance: 'balanced' as const,
        autoExecute: false
      }
    };
    enhancedClient = new EnhancedClient(enhancedConfig, projectContext);

    // Initialize task planner
    taskPlanner = new TaskPlanner(enhancedClient, projectContext);

    logger.info('Enhanced AI module initialized successfully');
    return {
      ollamaClient: aiClient,
      enhancedClient,
      projectContext,
      taskPlanner
    };
  } catch (error) {
    logger.error('Failed to initialize AI module', error);

    throw createUserError('Failed to initialize AI capabilities', {
      cause: error,
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure Ollama is running and try again.'
    });
  }
}

/**
 * Get the basic AI client instance
 */
export function getAIClient(): OllamaClient {
  if (!aiClient) {
    throw createUserError('AI module not initialized', {
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure to call initAI() before using AI capabilities.'
    });
  }

  return aiClient;
}

/**
 * Get the enhanced AI client instance
 */
export function getEnhancedClient(): EnhancedClient {
  if (!enhancedClient) {
    throw createUserError('Enhanced AI client not initialized', {
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure to call initAI() before using enhanced AI capabilities.'
    });
  }

  return enhancedClient;
}

/**
 * Get the project context instance
 */
export function getProjectContext(): ProjectContext {
  if (!projectContext) {
    throw createUserError('Project context not initialized', {
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure to call initAI() before using project context capabilities.'
    });
  }

  return projectContext;
}

/**
 * Get the task planner instance
 */
export function getTaskPlanner(): TaskPlanner {
  if (!taskPlanner) {
    throw createUserError('Task planner not initialized', {
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure to call initAI() before using task planning capabilities.'
    });
  }

  return taskPlanner;
}

/**
 * Check if AI module is initialized
 */
export function isAIInitialized(): boolean {
  return !!aiClient;
}

/**
 * Check if enhanced AI capabilities are initialized
 */
export function isEnhancedAIInitialized(): boolean {
  return !!(aiClient && enhancedClient && projectContext && taskPlanner);
}

/**
 * Cleanup all AI resources
 */
export function cleanupAI(): void {
  logger.debug('Cleaning up AI resources');

  try {
    // Cleanup project context (closes file watchers)
    if (projectContext) {
      projectContext.cleanup();
    }

    // Clear singleton instances
    aiClient = null;
    enhancedClient = null;
    projectContext = null;
    taskPlanner = null;

    logger.debug('AI resources cleanup completed');
  } catch (error) {
    logger.error('Error during AI cleanup:', error);
  }
}

// Re-export core types and components
export * from './ollama-client.js';
export * from './prompts.js';

// Re-export enhanced AI components
export { ProjectContext } from './context.js';
export { EnhancedClient } from './enhanced-client.js';
export { TaskPlanner } from './task-planner.js';

// Re-export enhanced AI types
export type {
  FileInfo,
  ProjectDependencies,
  ConversationTurn,
  ContextWindow,
  PromptContext,
  AIResponse,
  QualityMetrics,
  Task,
  TaskDependency,
  ExecutionPlan,
  PlanningContext
} from './context.js';

export type {
  ToolUsePlan,
  ResponseValidation
} from './enhanced-client.js';

export type {
  TaskType,
  TaskPriority,
  TaskStatus,
  PlanningResult
} from './task-planner.js'; 