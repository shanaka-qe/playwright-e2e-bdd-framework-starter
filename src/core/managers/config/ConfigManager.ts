/**
 * Configuration Manager
 * 
 * Central manager for all application configurations
 * Provides runtime switching and unified access
 */

import { WebappConfig, WebappConfigType } from './WebappConfig';
import { AdminConfig, AdminConfigType } from './AdminConfig';
import { McpConfig, McpConfigType } from './McpConfig';
import { BaseConfig } from './BaseConfig';

export type ApplicationType = 'webapp' | 'admin' | 'mcp';
export type ConfigType = WebappConfigType | AdminConfigType | McpConfigType;

export interface ConfigOverride {
  app?: ApplicationType;
  path: string;
  value: any;
}

export interface ConfigSnapshot {
  timestamp: Date;
  environment: string;
  configs: {
    webapp?: WebappConfigType;
    admin?: AdminConfigType;
    mcp?: McpConfigType;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Map<ApplicationType, BaseConfig<any>>;
  private environment: string;
  private overrides: ConfigOverride[] = [];
  private snapshots: Map<string, ConfigSnapshot> = new Map();

  private constructor(environment?: string) {
    this.environment = environment || process.env.NODE_ENV || 'development';
    this.configs = new Map();
    this.initializeConfigs();
  }

  static getInstance(environment?: string): ConfigManager {
    if (!ConfigManager.instance || (environment && environment !== ConfigManager.instance.environment)) {
      ConfigManager.instance = new ConfigManager(environment);
    }
    return ConfigManager.instance;
  }

  private initializeConfigs(): void {
    this.configs.set('webapp', new WebappConfig(this.environment));
    this.configs.set('admin', new AdminConfig(this.environment));
    this.configs.set('mcp', new McpConfig(this.environment));
  }

  /**
   * Get configuration for specific application
   */
  getConfig<T extends ApplicationType>(
    app: T
  ): T extends 'webapp' ? WebappConfig : T extends 'admin' ? AdminConfig : McpConfig {
    const config = this.configs.get(app);
    if (!config) {
      throw new Error(`Configuration not found for application: ${app}`);
    }
    return config as any;
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): Record<ApplicationType, BaseConfig<any>> {
    return {
      webapp: this.configs.get('webapp')!,
      admin: this.configs.get('admin')!,
      mcp: this.configs.get('mcp')!
    };
  }

  /**
   * Get specific value from any config
   */
  getValue(app: ApplicationType, path: string): any {
    const config = this.getConfig(app);
    return config.getValue(path);
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(app: ApplicationType, updates: any): void {
    const config = this.getConfig(app);
    config.update(updates);
    
    // Track override
    this.overrides.push({
      app,
      path: 'root',
      value: updates
    });
  }

  /**
   * Override specific value
   */
  override(app: ApplicationType, path: string, value: any): void {
    const config = this.getConfig(app);
    
    // Build nested update object
    const updates = this.buildNestedObject(path, value);
    config.update(updates);
    
    // Track override
    this.overrides.push({ app, path, value });
  }

  /**
   * Override multiple values
   */
  overrideMultiple(overrides: ConfigOverride[]): void {
    for (const override of overrides) {
      if (override.app) {
        this.override(override.app, override.path, override.value);
      } else {
        // Apply to all apps
        for (const app of ['webapp', 'admin', 'mcp'] as ApplicationType[]) {
          try {
            this.override(app, override.path, override.value);
          } catch {
            // Ignore if path doesn't exist for this app
          }
        }
      }
    }
  }

  /**
   * Switch environment
   */
  switchEnvironment(environment: string): void {
    this.environment = environment;
    this.configs.clear();
    this.overrides = [];
    this.initializeConfigs();
  }

  /**
   * Reset configurations
   */
  reset(app?: ApplicationType): void {
    if (app) {
      const config = this.getConfig(app);
      config.reset();
      this.overrides = this.overrides.filter(o => o.app !== app);
    } else {
      // Reset all
      for (const config of this.configs.values()) {
        config.reset();
      }
      this.overrides = [];
    }
  }

  /**
   * Create configuration snapshot
   */
  createSnapshot(name: string): ConfigSnapshot {
    const snapshot: ConfigSnapshot = {
      timestamp: new Date(),
      environment: this.environment,
      configs: {
        webapp: this.getConfig('webapp').get(),
        admin: this.getConfig('admin').get(),
        mcp: this.getConfig('mcp').get()
      }
    };
    
    this.snapshots.set(name, snapshot);
    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  restoreSnapshot(name: string): void {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${name}`);
    }

    // Switch environment if different
    if (snapshot.environment !== this.environment) {
      this.switchEnvironment(snapshot.environment);
    }

    // Restore configs
    if (snapshot.configs.webapp) {
      this.updateConfig('webapp', snapshot.configs.webapp);
    }
    if (snapshot.configs.admin) {
      this.updateConfig('admin', snapshot.configs.admin);
    }
    if (snapshot.configs.mcp) {
      this.updateConfig('mcp', snapshot.configs.mcp);
    }
  }

  /**
   * Get overrides
   */
  getOverrides(): ConfigOverride[] {
    return [...this.overrides];
  }

  /**
   * Get environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Validate all configurations
   */
  validateAll(): Record<ApplicationType, { valid: boolean; errors?: any[] }> {
    const results: any = {};
    
    for (const [app, config] of this.configs) {
      results[app] = config.validate();
    }
    
    return results;
  }

  /**
   * Export all configurations
   */
  exportAll(includeMetadata = false): string {
    const exports: any = {
      environment: this.environment,
      timestamp: new Date().toISOString()
    };

    for (const [app, config] of this.configs) {
      if (includeMetadata) {
        exports[app] = JSON.parse(config.exportWithMetadata());
      } else {
        exports[app] = config.get();
      }
    }

    if (includeMetadata) {
      exports.overrides = this.overrides;
    }

    return JSON.stringify(exports, null, 2);
  }

  /**
   * Build nested object from path
   */
  private buildNestedObject(path: string, value: any): any {
    const keys = path.split('.');
    const result: any = {};
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  /**
   * Get unified config for Playwright
   */
  getPlaywrightConfig(app: ApplicationType = 'webapp') {
    const baseConfig = app === 'admin' 
      ? this.getConfig('admin')
      : this.getConfig('webapp');

    const testingConfig = baseConfig.getValue('testing');
    const appConfig = baseConfig.getValue('app');

    return {
      use: {
        baseURL: appConfig.baseUrl,
        headless: testingConfig.headless,
        screenshot: testingConfig.screenshot.enabled ? 'only-on-failure' : 'off',
        video: testingConfig.video?.enabled ? 'on' : 'off',
        trace: testingConfig.trace?.enabled ? 'on' : 'off',
        slowMo: testingConfig.slowMo,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        locale: 'en-US',
        timezoneId: 'UTC'
      },
      timeout: app === 'admin' ? testingConfig.adminTimeout : 30000,
      expect: {
        timeout: 5000
      },
      retries: this.environment === 'production' ? 2 : 0,
      workers: this.environment === 'production' ? 4 : 1
    };
  }
}

/**
 * Configuration presets for different scenarios
 */
export class ConfigPresets {
  static readonly LOCAL_DEVELOPMENT: ConfigOverride[] = [
    { path: 'app.environment', value: 'development' },
    { path: 'testing.headless', value: false },
    { path: 'testing.slowMo', value: 100 }
  ];

  static readonly CI_TESTING: ConfigOverride[] = [
    { path: 'app.environment', value: 'test' },
    { path: 'testing.headless', value: true },
    { path: 'testing.video.enabled', value: true },
    { path: 'testing.trace.enabled', value: true }
  ];

  static readonly PRODUCTION_TESTING: ConfigOverride[] = [
    { path: 'app.environment', value: 'production' },
    { path: 'testing.headless', value: true },
    { path: 'auth.defaultCredentials', value: undefined },
    { path: 'security.requireHttps', value: true }
  ];

  static readonly PERFORMANCE_TESTING: ConfigOverride[] = [
    { path: 'testing.trace.enabled', value: false },
    { path: 'testing.video.enabled', value: false },
    { path: 'testing.screenshot.enabled', value: false }
  ];

  static readonly DEBUG_MODE: ConfigOverride[] = [
    { path: 'testing.slowMo', value: 500 },
    { path: 'testing.headless', value: false },
    { path: 'testing.trace.enabled', value: true },
    { path: 'testing.trace.screenshots', value: true },
    { path: 'testing.trace.snapshots', value: true },
    { path: 'testing.trace.sources', value: true }
  ];
}

// Export singleton getter
export function getConfigManager(environment?: string): ConfigManager {
  return ConfigManager.getInstance(environment);
}