/**
 * Base Configuration
 * 
 * Base class for all configuration management
 * Provides common functionality for loading and validating configs
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface ConfigSource {
  type: 'file' | 'env' | 'default';
  path?: string;
  priority: number;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  warnings?: Array<{
    path: string;
    message: string;
  }>;
}

export abstract class BaseConfig<T extends z.ZodType> {
  protected config: z.infer<T>;
  protected schema: T;
  protected sources: ConfigSource[] = [];
  protected environment: string;

  constructor(schema: T, environment?: string) {
    this.schema = schema;
    this.environment = environment || process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  /**
   * Load configuration from all sources
   */
  protected loadConfig(): void {
    let rawConfig = {};

    // 1. Load defaults
    rawConfig = this.mergeConfig(rawConfig, this.getDefaults());
    this.sources.push({ type: 'default', priority: 1 });

    // 2. Load from config files
    const fileConfig = this.loadFromFiles();
    if (fileConfig) {
      rawConfig = this.mergeConfig(rawConfig, fileConfig);
    }

    // 3. Load from environment variables
    const envConfig = this.loadFromEnv();
    rawConfig = this.mergeConfig(rawConfig, envConfig);

    // 4. Validate and set config
    const validation = this.validate(rawConfig);
    if (!validation.valid) {
      throw new Error(
        `Configuration validation failed:\n${validation.errors?.map(e => `  - ${e.path}: ${e.message}`).join('\n')}`
      );
    }

    this.config = rawConfig as z.infer<T>;
  }

  /**
   * Get default configuration
   */
  protected abstract getDefaults(): Partial<z.infer<T>>;

  /**
   * Load configuration from files
   */
  protected loadFromFiles(): Partial<z.infer<T>> | null {
    const configPaths = [
      path.join(process.cwd(), `config.${this.environment}.json`),
      path.join(process.cwd(), 'config.json'),
      path.join(__dirname, `config.${this.environment}.json`),
      path.join(__dirname, 'config.json')
    ];

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, 'utf-8');
          const config = JSON.parse(content);
          this.sources.push({ 
            type: 'file', 
            path: configPath, 
            priority: 2 
          });
          return config;
        } catch (error) {
          console.warn(`Failed to load config from ${configPath}:`, error);
        }
      }
    }

    return null;
  }

  /**
   * Load configuration from environment variables
   */
  protected loadFromEnv(): Partial<z.infer<T>> {
    // Load .env files
    const envPaths = [
      `.env.${this.environment}.local`,
      `.env.${this.environment}`,
      '.env.local',
      '.env'
    ];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        this.sources.push({ 
          type: 'env', 
          path: envPath, 
          priority: 3 
        });
      }
    }

    // Convert env vars to config object
    return this.envToConfig(process.env);
  }

  /**
   * Convert environment variables to config object
   */
  protected abstract envToConfig(env: NodeJS.ProcessEnv): Partial<z.infer<T>>;

  /**
   * Merge configurations with proper precedence
   */
  protected mergeConfig(
    target: any,
    source: any
  ): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.mergeConfig(
            result[key] || {},
            source[key]
          );
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Validate configuration
   */
  validate(config?: any): ValidationResult {
    try {
      this.schema.parse(config || this.config);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        };
      }
      return {
        valid: false,
        errors: [{ path: 'root', message: error.message }]
      };
    }
  }

  /**
   * Get current configuration
   */
  get(): z.infer<T> {
    return this.config;
  }

  /**
   * Get specific config value by path
   */
  getValue(path: string): any {
    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    return value;
  }

  /**
   * Update configuration at runtime
   */
  update(updates: Partial<z.infer<T>>): void {
    const newConfig = this.mergeConfig(this.config, updates);
    const validation = this.validate(newConfig);

    if (!validation.valid) {
      throw new Error(
        `Configuration update validation failed:\n${validation.errors?.map(e => `  - ${e.path}: ${e.message}`).join('\n')}`
      );
    }

    this.config = newConfig;
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.loadConfig();
  }

  /**
   * Get configuration sources
   */
  getSources(): ConfigSource[] {
    return [...this.sources];
  }

  /**
   * Get environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Export configuration
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Export configuration with metadata
   */
  exportWithMetadata(): string {
    return JSON.stringify({
      environment: this.environment,
      sources: this.sources,
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}