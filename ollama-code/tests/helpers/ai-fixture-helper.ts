/**
 * AI Fixture Helper Utilities
 * Utilities for loading, saving, and validating AI response fixtures
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists } from '../shared/file-utils.js';

/**
 * AI response fixture structure
 */
export interface AIFixture {
  /** Unique identifier for this fixture */
  id: string;
  /** Category (code-generation, code-review, etc.) */
  category: string;
  /** The prompt sent to the AI */
  prompt: string;
  /** The AI's response */
  response: string;
  /** Metadata about the response */
  metadata: {
    /** Model that generated the response */
    model: string;
    /** When the response was captured */
    timestamp: string;
    /** AI provider (ollama, openai, etc.) */
    provider: string;
    /** Temperature used */
    temperature?: number;
    /** Max tokens setting */
    maxTokens?: number;
    /** Response time in milliseconds */
    responseTime?: number;
    /** Additional tags for searching */
    tags?: string[];
  };
  /** Validation rules for this fixture */
  validation?: {
    /** Patterns that should be present in response */
    expectedPatterns?: string[];
    /** Strings that should NOT be in response */
    shouldNotContain?: string[];
    /** Minimum response length */
    minLength?: number;
    /** Maximum response length */
    maxLength?: number;
  };
}

/**
 * Options for capturing AI responses
 */
export interface CaptureOptions {
  prompt: string;
  response: string;
  model: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  responseTime?: number;
  tags?: string[];
  validation?: AIFixture['validation'];
}

const FIXTURES_BASE_PATH = path.join(
  process.cwd(),
  'tests/fixtures/ai-responses'
);

/**
 * Get the full path to a fixture file
 */
export function getFixturePath(fixtureName: string): string {
  // Add .json extension if not present
  const filename = fixtureName.endsWith('.json')
    ? fixtureName
    : `${fixtureName}.json`;

  return path.join(FIXTURES_BASE_PATH, filename);
}

/**
 * Load an AI response fixture
 */
export async function loadAIFixture(fixtureName: string): Promise<AIFixture> {
  const fixturePath = getFixturePath(fixtureName);

  if (!(await fileExists(fixturePath))) {
    throw new Error(`Fixture not found: ${fixtureName} at ${fixturePath}`);
  }

  try {
    const content = await fs.readFile(fixturePath, 'utf-8');
    const fixture = JSON.parse(content) as AIFixture;

    // Validate fixture structure
    if (!fixture.id || !fixture.category || !fixture.prompt || !fixture.response) {
      throw new Error(
        `Invalid fixture structure in ${fixtureName}: missing required fields`
      );
    }

    return fixture;
  } catch (error) {
    throw new Error(`Failed to load fixture ${fixtureName}: ${error}`);
  }
}

/**
 * Save an AI response as a fixture
 */
export async function captureAIResponse(
  fixtureName: string,
  options: CaptureOptions
): Promise<void> {
  const fixturePath = getFixturePath(fixtureName);

  // Generate fixture ID from name
  const id = fixtureName
    .replace(/\.json$/, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/gi, '_');

  // Extract category from path
  const category = fixtureName.includes('/')
    ? fixtureName.split('/')[0]
    : 'general';

  const fixture: AIFixture = {
    id,
    category,
    prompt: options.prompt,
    response: options.response,
    metadata: {
      model: options.model,
      timestamp: new Date().toISOString(),
      provider: options.provider || 'ollama',
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      responseTime: options.responseTime,
      tags: options.tags || [],
    },
    validation: options.validation,
  };

  // Ensure directory exists
  const fixtureDir = path.dirname(fixturePath);
  await fs.mkdir(fixtureDir, { recursive: true });

  // Write fixture file
  await fs.writeFile(
    fixturePath,
    JSON.stringify(fixture, null, 2),
    'utf-8'
  );

  console.log(`✅ Captured AI fixture: ${fixtureName}`);
}

/**
 * Validate a fixture against its validation rules
 */
export function validateFixture(fixture: AIFixture): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!fixture.validation) {
    return { valid: true, errors: [] };
  }

  const { response } = fixture;
  const { validation } = fixture;

  // Check expected patterns
  if (validation.expectedPatterns) {
    for (const pattern of validation.expectedPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (!regex.test(response)) {
        errors.push(`Expected pattern not found: ${pattern}`);
      }
    }
  }

  // Check forbidden content
  if (validation.shouldNotContain) {
    for (const forbidden of validation.shouldNotContain) {
      if (response.toLowerCase().includes(forbidden.toLowerCase())) {
        errors.push(`Forbidden content found: ${forbidden}`);
      }
    }
  }

  // Check length constraints
  if (validation.minLength && response.length < validation.minLength) {
    errors.push(
      `Response too short: ${response.length} < ${validation.minLength}`
    );
  }

  if (validation.maxLength && response.length > validation.maxLength) {
    errors.push(
      `Response too long: ${response.length} > ${validation.maxLength}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * List all available fixtures in a category
 */
export async function listFixtures(category?: string): Promise<string[]> {
  const searchPath = category
    ? path.join(FIXTURES_BASE_PATH, category)
    : FIXTURES_BASE_PATH;

  if (!(await fileExists(searchPath))) {
    return [];
  }

  const fixtures: string[] = [];
  const entries = await fs.readdir(searchPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      const relativePath = category
        ? `${category}/${entry.name}`
        : entry.name;
      fixtures.push(relativePath);
    } else if (entry.isDirectory()) {
      const subCategory = category ? `${category}/${entry.name}` : entry.name;
      const subFixtures = await listFixtures(subCategory);
      fixtures.push(...subFixtures);
    }
  }

  return fixtures;
}

/**
 * Find fixtures by tags
 */
export async function findFixturesByTags(
  tags: string[]
): Promise<AIFixture[]> {
  const allFixtures = await listFixtures();
  const matching: AIFixture[] = [];

  for (const fixtureName of allFixtures) {
    try {
      const fixture = await loadAIFixture(fixtureName);
      const fixtureTags = fixture.metadata.tags || [];

      // Check if any of the search tags match fixture tags
      const hasMatchingTag = tags.some(tag =>
        fixtureTags.some(fixtureTag =>
          fixtureTag.toLowerCase().includes(tag.toLowerCase())
        )
      );

      if (hasMatchingTag) {
        matching.push(fixture);
      }
    } catch (error) {
      console.warn(`Failed to load fixture ${fixtureName}:`, error);
    }
  }

  return matching;
}

/**
 * Check if fixtures are outdated (older than specified days)
 */
export async function findOutdatedFixtures(
  maxAgeDays: number = 180
): Promise<Array<{ name: string; age: number }>> {
  const allFixtures = await listFixtures();
  const outdated: Array<{ name: string; age: number }> = [];
  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  for (const fixtureName of allFixtures) {
    try {
      const fixture = await loadAIFixture(fixtureName);
      const fixtureDate = new Date(fixture.metadata.timestamp).getTime();
      const age = now - fixtureDate;

      if (age > maxAgeMs) {
        outdated.push({
          name: fixtureName,
          age: Math.floor(age / (24 * 60 * 60 * 1000)), // age in days
        });
      }
    } catch (error) {
      console.warn(`Failed to check age of fixture ${fixtureName}:`, error);
    }
  }

  return outdated;
}

/**
 * Validate all fixtures in a category
 */
export async function validateAllFixtures(
  category?: string
): Promise<{
  total: number;
  valid: number;
  invalid: Array<{ name: string; errors: string[] }>;
}> {
  const fixtures = await listFixtures(category);
  const invalid: Array<{ name: string; errors: string[] }> = [];

  for (const fixtureName of fixtures) {
    try {
      const fixture = await loadAIFixture(fixtureName);
      const validation = validateFixture(fixture);

      if (!validation.valid) {
        invalid.push({
          name: fixtureName,
          errors: validation.errors,
        });
      }
    } catch (error) {
      invalid.push({
        name: fixtureName,
        errors: [`Failed to load/validate: ${error}`],
      });
    }
  }

  return {
    total: fixtures.length,
    valid: fixtures.length - invalid.length,
    invalid,
  };
}
