# Chapter 13: Plugin Architecture and Extension Points

> *"Give someone a program, you frustrate them for a day; teach them how to program, you frustrate them for a lifetime. Give them a plugin API, and they'll extend your program forever." — Unknown*

---

## Table of Contents

- [13.1 Extension Points Design](#131-extension-points-design)
- [13.2 Plugin System Architecture](#132-plugin-system-architecture)
- [13.3 Plugin Discovery and Loading](#133-plugin-discovery-and-loading)
- [13.4 Plugin Isolation and Security](#134-plugin-isolation-and-security)
- [13.5 Versioning and Compatibility](#135-versioning-and-compatibility)
- [13.6 Building Your First Plugin](#136-building-your-first-plugin)
- [13.7 Plugin Marketplace](#137-plugin-marketplace)
- [Exercises](#exercises)
- [Summary](#summary)

---

## 13.1 Extension Points Design

Extension points are well-defined locations in your code where plugins can add functionality.

### Core Extension Points

```typescript
/**
 * Extension point types
 */
export enum ExtensionPointType {
  /** Add custom tools */
  TOOL = 'tool',

  /** Add custom commands */
  COMMAND = 'command',

  /** Add custom AI providers */
  PROVIDER = 'provider',

  /** Add custom middleware */
  MIDDLEWARE = 'middleware',

  /** Subscribe to events */
  EVENT_HANDLER = 'event_handler',

  /** Modify UI elements */
  UI_COMPONENT = 'ui_component'
}

/**
 * Extension point registry
 */
export class ExtensionPointRegistry {
  private points = new Map<string, ExtensionPoint<any>>();

  /**
   * Register an extension point
   */
  register<T>(point: ExtensionPoint<T>): void {
    this.points.set(point.name, point);
  }

  /**
   * Get extension point
   */
  get<T>(name: string): ExtensionPoint<T> | undefined {
    return this.points.get(name);
  }

  /**
   * List all extension points
   */
  list(): ExtensionPoint<any>[] {
    return Array.from(this.points.values());
  }
}

/**
 * Extension point for a specific type
 */
export class ExtensionPoint<T> {
  private extensions: T[] = [];

  constructor(
    public readonly name: string,
    public readonly type: ExtensionPointType,
    public readonly description: string
  ) {}

  /**
   * Register an extension
   */
  register(extension: T): void {
    this.extensions.push(extension);
  }

  /**
   * Unregister an extension
   */
  unregister(extension: T): void {
    const index = this.extensions.indexOf(extension);
    if (index !== -1) {
      this.extensions.splice(index, 1);
    }
  }

  /**
   * Get all extensions
   */
  getAll(): T[] {
    return [...this.extensions];
  }

  /**
   * Clear all extensions
   */
  clear(): void {
    this.extensions = [];
  }
}
```

### Defining Extension Points

```typescript
/**
 * Core system with extension points
 */
export class ExtensibleAIAssistant {
  // Extension points
  public readonly toolExtensions: ExtensionPoint<Tool>;
  public readonly commandExtensions: ExtensionPoint<RoutableCommand>;
  public readonly providerExtensions: ExtensionPoint<AIProvider>;
  public readonly middlewareExtensions: ExtensionPoint<Middleware>;

  constructor() {
    // Define extension points
    this.toolExtensions = new ExtensionPoint(
      'tools',
      ExtensionPointType.TOOL,
      'Custom tools for code operations'
    );

    this.commandExtensions = new ExtensionPoint(
      'commands',
      ExtensionPointType.COMMAND,
      'Custom commands for user interactions'
    );

    this.providerExtensions = new ExtensionPoint(
      'providers',
      ExtensionPointType.PROVIDER,
      'Custom AI providers'
    );

    this.middlewareExtensions = new ExtensionPoint(
      'middleware',
      ExtensionPointType.MIDDLEWARE,
      'Request/response middleware'
    );
  }

  /**
   * Execute request with extensions
   */
  async execute(request: string): Promise<string> {
    // Apply middleware
    let processedRequest = request;
    for (const middleware of this.middlewareExtensions.getAll()) {
      processedRequest = await middleware.beforeRequest(processedRequest);
    }

    // Get tools (including extensions)
    const allTools = [
      ...this.getCorTools(),
      ...this.toolExtensions.getAll()
    ];

    // Execute with all tools
    const result = await this.executeWithTools(processedRequest, allTools);

    // Apply middleware
    let processedResult = result;
    for (const middleware of this.middlewareExtensions.getAll()) {
      processedResult = await middleware.afterResponse(processedResult);
    }

    return processedResult;
  }

  private getCoreTools(): Tool[] {
    // Core built-in tools
    return [
      new ReadFileTool(),
      new WriteFileTool(),
      new GitTool()
    ];
  }

  private async executeWithTools(request: string, tools: Tool[]): Promise<string> {
    // Implementation
    return 'result';
  }
}

/**
 * Middleware interface
 */
export interface Middleware {
  beforeRequest(request: string): Promise<string>;
  afterResponse(response: string): Promise<string>;
}
```

---

## 13.2 Plugin System Architecture

Build a complete plugin system that manages plugin lifecycle.

### Plugin Interface

```typescript
/**
 * Plugin interface - all plugins must implement this
 */
export interface Plugin {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;

  /**
   * Called when plugin is activated
   */
  activate(context: PluginContext): Promise<void>;

  /**
   * Called when plugin is deactivated
   */
  deactivate(): Promise<void>;
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Description */
  description: string;

  /** Author information */
  author: {
    name: string;
    email?: string;
    url?: string;
  };

  /** Plugin dependencies */
  dependencies?: {
    /** Platform version requirement */
    platform?: string;

    /** Other plugin dependencies */
    plugins?: Record<string, string>;
  };

  /** Plugin capabilities */
  capabilities?: string[];

  /** Plugin keywords for discovery */
  keywords?: string[];
}

/**
 * Plugin context - provided to plugins on activation
 */
export interface PluginContext {
  /** Extension point registry */
  extensions: ExtensionPointRegistry;

  /** Logger scoped to this plugin */
  logger: Logger;

  /** Configuration for this plugin */
  config: PluginConfig;

  /** Plugin storage directory */
  storageDir: string;

  /** Global storage (shared across plugins) */
  globalStorage: Storage;

  /** Event emitter for subscribing to events */
  events: EventEmitter;
}

export interface PluginConfig {
  get<T>(key: string, defaultValue?: T): T | undefined;
  set<T>(key: string, value: T): Promise<void>;
}
```

### Plugin Manager

```typescript
/**
 * Manages plugin lifecycle
 */
export class PluginManager {
  private plugins = new Map<string, LoadedPlugin>();
  private logger: Logger;
  private extensionRegistry: ExtensionPointRegistry;

  constructor(
    logger: Logger,
    extensionRegistry: ExtensionPointRegistry
  ) {
    this.logger = logger;
    this.extensionRegistry = extensionRegistry;
  }

  /**
   * Load and activate a plugin
   */
  async load(plugin: Plugin): Promise<void> {
    const { id, version } = plugin.metadata;

    this.logger.info('Loading plugin', { id, version });

    // Validate plugin
    this.validatePlugin(plugin);

    // Check if already loaded
    if (this.plugins.has(id)) {
      throw new Error(`Plugin already loaded: ${id}`);
    }

    // Check dependencies
    await this.checkDependencies(plugin);

    // Create plugin context
    const context = await this.createContext(plugin);

    // Activate plugin
    try {
      await plugin.activate(context);

      // Store loaded plugin
      this.plugins.set(id, {
        plugin,
        context,
        state: PluginState.ACTIVE
      });

      this.logger.info('Plugin loaded successfully', { id });

    } catch (error) {
      this.logger.error('Plugin activation failed', error as Error, { id });
      throw new Error(`Failed to activate plugin ${id}: ${(error as Error).message}`);
    }
  }

  /**
   * Unload and deactivate a plugin
   */
  async unload(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);

    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    this.logger.info('Unloading plugin', { id: pluginId });

    try {
      // Deactivate plugin
      await loaded.plugin.deactivate();

      // Remove from loaded plugins
      this.plugins.delete(pluginId);

      this.logger.info('Plugin unloaded successfully', { id: pluginId });

    } catch (error) {
      this.logger.error('Plugin deactivation failed', error as Error, { id: pluginId });
      throw error;
    }
  }

  /**
   * Reload a plugin
   */
  async reload(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);

    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    const plugin = loaded.plugin;

    await this.unload(pluginId);
    await this.load(plugin);
  }

  /**
   * Get loaded plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  /**
   * List all loaded plugins
   */
  listPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values()).map(({ plugin, state }) => ({
      metadata: plugin.metadata,
      state
    }));
  }

  /**
   * Validate plugin
   */
  private validatePlugin(plugin: Plugin): void {
    const { id, version, name } = plugin.metadata;

    if (!id || !version || !name) {
      throw new Error('Plugin missing required metadata (id, version, name)');
    }

    // Validate version is semver
    if (!this.isValidSemver(version)) {
      throw new Error(`Invalid plugin version: ${version}`);
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(plugin: Plugin): Promise<void> {
    const deps = plugin.metadata.dependencies;

    if (!deps) return;

    // Check platform version
    if (deps.platform) {
      const platformVersion = this.getPlatformVersion();
      if (!this.satisfiesVersion(platformVersion, deps.platform)) {
        throw new Error(
          `Plugin requires platform ${deps.platform}, but current version is ${platformVersion}`
        );
      }
    }

    // Check plugin dependencies
    if (deps.plugins) {
      for (const [pluginId, versionRange] of Object.entries(deps.plugins)) {
        const depPlugin = this.plugins.get(pluginId);

        if (!depPlugin) {
          throw new Error(`Missing dependency: ${pluginId}`);
        }

        if (!this.satisfiesVersion(depPlugin.plugin.metadata.version, versionRange)) {
          throw new Error(
            `Plugin ${pluginId} version ${depPlugin.plugin.metadata.version} ` +
            `does not satisfy requirement ${versionRange}`
          );
        }
      }
    }
  }

  /**
   * Create plugin context
   */
  private async createContext(plugin: Plugin): Promise<PluginContext> {
    const storageDir = path.join(
      os.homedir(),
      '.ollama-code',
      'plugins',
      plugin.metadata.id
    );

    // Ensure storage directory exists
    await fs.mkdir(storageDir, { recursive: true });

    return {
      extensions: this.extensionRegistry,
      logger: this.logger.child({ plugin: plugin.metadata.id }),
      config: new PluginConfigImpl(plugin.metadata.id),
      storageDir,
      globalStorage: new GlobalStorage(),
      events: new EventEmitter()
    };
  }

  private getPlatformVersion(): string {
    return '1.0.0'; // Would get from package.json
  }

  private isValidSemver(version: string): boolean {
    return /^\d+\.\d+\.\d+/.test(version);
  }

  private satisfiesVersion(version: string, range: string): boolean {
    // Simple version check (would use semver package in production)
    return version >= range;
  }
}

enum PluginState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  ERROR = 'error'
}

interface LoadedPlugin {
  plugin: Plugin;
  context: PluginContext;
  state: PluginState;
}

interface PluginInfo {
  metadata: PluginMetadata;
  state: PluginState;
}
```

---

## 13.3 Plugin Discovery and Loading

Discover and load plugins from various sources.

### Plugin Loader

```typescript
/**
 * Loads plugins from different sources
 */
export class PluginLoader {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Load plugin from npm package
   */
  async loadFromNpm(packageName: string): Promise<Plugin> {
    this.logger.info('Loading plugin from npm', { package: packageName });

    try {
      // Import the package
      const module = await import(packageName);

      // Get plugin export
      const PluginClass = module.default || module.Plugin;

      if (!PluginClass) {
        throw new Error(`Package ${packageName} does not export a plugin`);
      }

      // Instantiate plugin
      const plugin = new PluginClass();

      return plugin;

    } catch (error) {
      throw new Error(`Failed to load plugin from npm: ${(error as Error).message}`);
    }
  }

  /**
   * Load plugin from file path
   */
  async loadFromPath(filePath: string): Promise<Plugin> {
    this.logger.info('Loading plugin from path', { path: filePath });

    try {
      // Import the file
      const module = await import(filePath);

      const PluginClass = module.default || module.Plugin;

      if (!PluginClass) {
        throw new Error(`File ${filePath} does not export a plugin`);
      }

      const plugin = new PluginClass();

      return plugin;

    } catch (error) {
      throw new Error(`Failed to load plugin from path: ${(error as Error).message}`);
    }
  }

  /**
   * Discover plugins in directory
   */
  async discoverPlugins(directory: string): Promise<Plugin[]> {
    this.logger.info('Discovering plugins', { directory });

    const plugins: Plugin[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pluginDir = path.join(directory, entry.name);
        const packageJsonPath = path.join(pluginDir, 'package.json');

        try {
          // Check if it's a valid plugin
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, 'utf-8')
          );

          if (packageJson.ollamaCodePlugin) {
            const plugin = await this.loadFromPath(pluginDir);
            plugins.push(plugin);
          }

        } catch (error) {
          // Not a valid plugin, skip
          continue;
        }
      }

      this.logger.info('Discovered plugins', { count: plugins.length });

      return plugins;

    } catch (error) {
      this.logger.error('Plugin discovery failed', error as Error);
      return [];
    }
  }

  /**
   * Install plugin from registry
   */
  async install(pluginId: string, version?: string): Promise<Plugin> {
    this.logger.info('Installing plugin', { id: pluginId, version });

    // Construct package name
    const packageName = `@ollama-code/plugin-${pluginId}`;
    const versionSpec = version ? `@${version}` : '';

    // Install using npm
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      await execAsync(`npm install ${packageName}${versionSpec}`);

      // Load the installed plugin
      return await this.loadFromNpm(packageName);

    } catch (error) {
      throw new Error(`Failed to install plugin: ${(error as Error).message}`);
    }
  }
}
```

### Plugin Registry

```typescript
/**
 * Plugin registry for discovering available plugins
 */
export class PluginRegistry {
  private apiUrl: string;

  constructor(apiUrl: string = 'https://registry.ollama-code.dev') {
    this.apiUrl = apiUrl;
  }

  /**
   * Search for plugins
   */
  async search(query: string): Promise<PluginSearchResult[]> {
    const response = await fetch(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search plugins');
    }

    return response.json();
  }

  /**
   * Get plugin details
   */
  async getPlugin(pluginId: string): Promise<PluginDetails> {
    const response = await fetch(`${this.apiUrl}/plugins/${pluginId}`);

    if (!response.ok) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    return response.json();
  }

  /**
   * List popular plugins
   */
  async getPopular(limit: number = 10): Promise<PluginSearchResult[]> {
    const response = await fetch(`${this.apiUrl}/popular?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch popular plugins');
    }

    return response.json();
  }

  /**
   * Get plugins by category
   */
  async getByCategory(category: string): Promise<PluginSearchResult[]> {
    const response = await fetch(`${this.apiUrl}/category/${category}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch plugins for category: ${category}`);
    }

    return response.json();
  }
}

interface PluginSearchResult {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  keywords: string[];
}

interface PluginDetails extends PluginSearchResult {
  readme: string;
  repository: string;
  homepage: string;
  versions: string[];
  dependencies: Record<string, string>;
}
```

---

## 13.4 Plugin Isolation and Security

Ensure plugins can't harm the system or other plugins.

### Plugin Sandbox

```typescript
/**
 * Sandboxes plugin execution
 */
export class PluginSandbox {
  private allowedAPIs: Set<string>;

  constructor(config: SandboxConfig) {
    this.allowedAPIs = new Set(config.allowedAPIs || []);
  }

  /**
   * Create sandboxed context for plugin
   */
  createContext(plugin: Plugin): PluginContext {
    const sandbox = this;

    return {
      extensions: this.createProxyExtensions(),
      logger: this.createProxyLogger(plugin.metadata.id),
      config: this.createProxyConfig(plugin.metadata.id),
      storageDir: this.getStorageDir(plugin.metadata.id),
      globalStorage: this.createProxyStorage(),
      events: this.createProxyEvents()
    };
  }

  /**
   * Create proxied extensions registry
   */
  private createProxyExtensions(): ExtensionPointRegistry {
    // Return a proxy that validates all operations
    return new Proxy(new ExtensionPointRegistry(), {
      get: (target, prop) => {
        // Intercept method calls to validate permissions
        const value = (target as any)[prop];

        if (typeof value === 'function') {
          return (...args: any[]) => {
            this.checkPermission('extensions');
            return value.apply(target, args);
          };
        }

        return value;
      }
    });
  }

  /**
   * Create proxied logger
   */
  private createProxyLogger(pluginId: string): Logger {
    // Return a logger that redacts sensitive data
    return {
      info: (message: string, context?: any) => {
        const sanitized = this.sanitize(context);
        // Log with plugin prefix
        console.log(`[${pluginId}] ${message}`, sanitized);
      },
      error: (message: string, error?: Error, context?: any) => {
        const sanitized = this.sanitize(context);
        console.error(`[${pluginId}] ${message}`, error, sanitized);
      },
      // ... other methods
    } as any;
  }

  /**
   * Check if plugin has permission
   */
  private checkPermission(api: string): void {
    if (!this.allowedAPIs.has(api)) {
      throw new Error(`Plugin does not have permission to access: ${api}`);
    }
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitize(context: any): any {
    if (!context) return context;

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveFields = ['apiKey', 'password', 'token', 'secret'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private createProxyConfig(pluginId: string): PluginConfig {
    // Implementation
    return {} as any;
  }

  private getStorageDir(pluginId: string): string {
    return path.join(os.homedir(), '.ollama-code', 'plugins', pluginId);
  }

  private createProxyStorage(): Storage {
    // Implementation
    return {} as any;
  }

  private createProxyEvents(): EventEmitter {
    // Implementation
    return {} as any;
  }
}

interface SandboxConfig {
  allowedAPIs?: string[];
  maxMemory?: number;
  maxCPU?: number;
  timeout?: number;
}

interface Storage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}
```

---

## 13.5 Versioning and Compatibility

Manage plugin versions and ensure compatibility.

### Version Manager

```typescript
/**
 * Manages plugin versions and compatibility
 */
export class PluginVersionManager {
  /**
   * Check if plugin version is compatible
   */
  isCompatible(
    pluginVersion: string,
    platformVersion: string,
    requiredVersion?: string
  ): boolean {
    if (!requiredVersion) return true;

    return this.satisfiesVersion(platformVersion, requiredVersion);
  }

  /**
   * Get migration path between versions
   */
  getMigrationPath(
    fromVersion: string,
    toVersion: string
  ): string[] {
    const migrations: string[] = [];

    // Would return list of migration versions
    // e.g., ['1.0.0', '1.1.0', '2.0.0']

    return migrations;
  }

  /**
   * Check for breaking changes
   */
  hasBreakingChanges(fromVersion: string, toVersion: string): boolean {
    const fromMajor = this.getMajorVersion(fromVersion);
    const toMajor = this.getMajorVersion(toVersion);

    return toMajor > fromMajor;
  }

  /**
   * Parse semver version
   */
  parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
  } {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);

    if (!match) {
      throw new Error(`Invalid version: ${version}`);
    }

    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }

  /**
   * Compare versions
   */
  compareVersions(v1: string, v2: string): number {
    const parsed1 = this.parseVersion(v1);
    const parsed2 = this.parseVersion(v2);

    if (parsed1.major !== parsed2.major) {
      return parsed1.major - parsed2.major;
    }

    if (parsed1.minor !== parsed2.minor) {
      return parsed1.minor - parsed2.minor;
    }

    return parsed1.patch - parsed2.patch;
  }

  private getMajorVersion(version: string): number {
    return this.parseVersion(version).major;
  }

  private satisfiesVersion(version: string, range: string): boolean {
    // Simple range check (would use semver package in production)
    if (range.startsWith('^')) {
      const requiredMajor = this.getMajorVersion(range.substring(1));
      const actualMajor = this.getMajorVersion(version);
      return actualMajor === requiredMajor;
    }

    if (range.startsWith('~')) {
      const required = this.parseVersion(range.substring(1));
      const actual = this.parseVersion(version);
      return actual.major === required.major && actual.minor === required.minor;
    }

    return this.compareVersions(version, range) >= 0;
  }
}
```

---

## 13.6 Building Your First Plugin

Step-by-step guide to creating a plugin.

### Example: Docker Plugin

```typescript
/**
 * Docker plugin - adds Docker support
 */
export class DockerPlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    id: 'docker',
    name: 'Docker Plugin',
    version: '1.0.0',
    description: 'Adds Docker container management tools',
    author: {
      name: 'Ollama Code Team',
      email: 'team@ollama-code.dev'
    },
    dependencies: {
      platform: '^1.0.0'
    },
    capabilities: ['containers', 'docker'],
    keywords: ['docker', 'containers', 'devops']
  };

  private tools: Tool[] = [];

  /**
   * Activate plugin
   */
  async activate(context: PluginContext): Promise<void> {
    context.logger.info('Activating Docker plugin');

    // Create Docker tools
    this.tools = [
      new DockerListTool(context.logger),
      new DockerRunTool(context.logger),
      new DockerStopTool(context.logger),
      new DockerBuildTool(context.logger)
    ];

    // Register tools
    const toolExtensions = context.extensions.get<Tool>('tools');

    if (toolExtensions) {
      for (const tool of this.tools) {
        toolExtensions.register(tool);
        context.logger.info('Registered tool', { tool: tool.name });
      }
    }

    // Subscribe to events
    context.events.on('before:execute', this.onBeforeExecute.bind(this));

    context.logger.info('Docker plugin activated');
  }

  /**
   * Deactivate plugin
   */
  async deactivate(): Promise<void> {
    // Cleanup resources
    this.tools = [];
  }

  /**
   * Event handler
   */
  private onBeforeExecute(event: any): void {
    // Pre-process requests
  }
}

/**
 * Docker list containers tool
 */
class DockerListTool implements Tool {
  readonly name = 'docker_list';
  readonly description = 'List Docker containers';
  readonly parameters = {
    all: {
      type: 'boolean' as const,
      description: 'Show all containers (default: running only)',
      required: false
    }
  };

  constructor(private logger: Logger) {}

  async execute(params: any, context: any): Promise<ToolResult> {
    this.logger.info('Listing Docker containers', { all: params.all });

    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const cmd = params.all ? 'docker ps -a' : 'docker ps';
      const { stdout } = await execAsync(cmd);

      return {
        success: true,
        output: stdout
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  validateParameters(params: any): { valid: boolean; errors: any[] } {
    return { valid: true, errors: [] };
  }
}

// Additional Docker tools...
class DockerRunTool implements Tool {
  readonly name = 'docker_run';
  readonly description = 'Run a Docker container';
  readonly parameters = {
    image: {
      type: 'string' as const,
      description: 'Docker image name',
      required: true
    },
    command: {
      type: 'string' as const,
      description: 'Command to run',
      required: false
    },
    ports: {
      type: 'array' as const,
      description: 'Port mappings (e.g., ["8080:80"])',
      required: false
    }
  };

  constructor(private logger: Logger) {}

  async execute(params: any, context: any): Promise<ToolResult> {
    // Implementation
    return { success: true };
  }

  validateParameters(params: any): { valid: boolean; errors: any[] } {
    const errors = [];

    if (!params.image) {
      errors.push({ parameter: 'image', message: 'Image is required' });
    }

    return { valid: errors.length === 0, errors };
  }
}

class DockerStopTool implements Tool {
  // Implementation
  readonly name = 'docker_stop';
  readonly description = 'Stop a Docker container';
  readonly parameters = {};

  constructor(private logger: Logger) {}

  async execute(params: any, context: any): Promise<ToolResult> {
    return { success: true };
  }

  validateParameters(params: any): { valid: boolean; errors: any[] } {
    return { valid: true, errors: [] };
  }
}

class DockerBuildTool implements Tool {
  // Implementation
  readonly name = 'docker_build';
  readonly description = 'Build a Docker image';
  readonly parameters = {};

  constructor(private logger: Logger) {}

  async execute(params: any, context: any): Promise<ToolResult> {
    return { success: true };
  }

  validateParameters(params: any): { valid: boolean; errors: any[] } {
    return { valid: true, errors: [] };
  }
}
```

### Plugin Package Structure

```
@ollama-code/plugin-docker/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── tools/            # Docker tools
│   │   ├── list.ts
│   │   ├── run.ts
│   │   ├── stop.ts
│   │   └── build.ts
│   └── types.ts          # Type definitions
├── tests/                # Plugin tests
│   └── plugin.test.ts
└── README.md             # Plugin documentation
```

```json
{
  "name": "@ollama-code/plugin-docker",
  "version": "1.0.0",
  "description": "Docker plugin for Ollama Code",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "ollamaCodePlugin": true,
  "keywords": ["ollama-code-plugin", "docker", "containers"],
  "peerDependencies": {
    "@ollama-code/core": "^1.0.0"
  }
}
```

---

## 13.7 Plugin Marketplace

Build a marketplace for discovering and sharing plugins.

### Publishing a Plugin

```bash
# 1. Build plugin
npm run build

# 2. Test plugin
npm test

# 3. Publish to npm
npm publish --access public

# 4. Register with marketplace
ollama-code plugin register @ollama-code/plugin-docker
```

### CLI Commands

```bash
# Search for plugins
ollama-code plugin search docker

# Install plugin
ollama-code plugin install docker

# List installed plugins
ollama-code plugin list

# Uninstall plugin
ollama-code plugin uninstall docker

# Update plugin
ollama-code plugin update docker
```

---

## Exercises

### Exercise 1: Create a Custom Plugin

Build a plugin that adds Kubernetes support.

**Requirements:**
- Tool to list pods
- Tool to describe resources
- Tool to apply manifests
- Proper error handling

### Exercise 2: Build a Plugin Marketplace API

Create a REST API for plugin discovery.

**Endpoints:**
- `GET /plugins` - List all plugins
- `GET /plugins/:id` - Get plugin details
- `POST /plugins` - Publish plugin
- `GET /search?q=...` - Search plugins

### Exercise 3: Implement Plugin Hot Reload

Add ability to reload plugins without restarting.

**Requirements:**
- Detect plugin file changes
- Safely unload old version
- Load new version
- Preserve plugin state

---

## Summary

You built a complete plugin architecture that enables extensibility.

### Key Concepts

1. **Extension Points** - Well-defined customization locations
2. **Plugin System** - Complete lifecycle management
3. **Plugin Discovery** - npm, filesystem, registry
4. **Isolation** - Sandboxing for security
5. **Versioning** - Compatibility management
6. **Marketplace** - Ecosystem for sharing

### Platform Growth

```
Week 0: No plugins
Week 4: 5 core plugins
Week 12: 20 community plugins
Week 24: 50+ plugins
Year 1: 100+ plugins, thriving ecosystem
```

**Next:** [Chapter 14: IDE Integration →](chapter-14-ide-integration.md)

---

*Chapter 13 | Plugin Architecture and Extension Points | Complete*
