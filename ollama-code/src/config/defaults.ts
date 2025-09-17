/**
 * Default Configuration
 *
 * This file is now simplified - defaults are defined in the schema.ts file
 * using Zod defaults, which provides better type safety and validation.
 *
 * @deprecated - Use configSchema defaults instead
 */

import { ConfigType, configSchema } from './schema.js';

/**
 * Get default configuration values from the schema
 */
export function getDefaultConfig(): ConfigType {
  // Parse empty object to get all defaults from schema
  return configSchema.parse({});
}

/**
 * @deprecated - Use getDefaultConfig() instead
 */
export const defaultConfig = getDefaultConfig(); 