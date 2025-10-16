/**
 * Environment Configuration Manager
 * 
 * Centralized configuration management for different test environments
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface UIConfig {
  baseUrl: string;
  defaultTimeout: number;
  actionTimeout: number;
  navigationTimeout: number;
}

export interface AdminConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export interface TestConfig {
  browser: string[];
  headless: boolean;
  parallel: boolean;
  workers: number;
  retries: number;
  slowMo: number;
}

export interface EnvironmentConfiguration {
  environment: string;
  database: DatabaseConfig;
  api: ApiConfig;
  ui: UIConfig;
  admin: AdminConfig;
  test: TestConfig;
  features: {
    visualRegression: boolean;
    accessibility: boolean;
    performance: boolean;
    apiTesting: boolean;
    adminApp: boolean;
  };
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvironmentConfiguration;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadConfiguration(): EnvironmentConfiguration {
    const environment = process.env.NODE_ENV || 'development';
    
    const baseConfig: EnvironmentConfiguration = {
      environment,
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'testoria',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
      },
      api: {
        baseUrl: this.getApiBaseUrl(environment),
        timeout: 30000,
        retries: 2
      },
      ui: {
        baseUrl: this.getUIBaseUrl(environment),
        defaultTimeout: 30000,
        actionTimeout: 5000,
        navigationTimeout: 30000
      },
      admin: {
        baseUrl: this.getAdminBaseUrl(environment),
        apiKey: process.env.ADMIN_API_KEY || 'default-api-key',
        timeout: 30000
      },
      test: {
        browser: ['chromium'],
        headless: !process.env.HEADED,
        parallel: environment !== 'development',
        workers: this.getWorkerCount(environment),
        retries: this.getRetryCount(environment),
        slowMo: environment === 'development' ? 100 : 0
      },
      features: {
        visualRegression: environment !== 'development',
        accessibility: true,
        performance: environment !== 'development',
        apiTesting: true,
        adminApp: true
      }
    };

    return this.applyEnvironmentOverrides(baseConfig, environment);
  }

  private getApiBaseUrl(environment: string): string {
    switch (environment) {
      case 'test':
        return process.env.API_BASE_URL || 'http://localhost:3001';
      case 'staging':
        return process.env.API_BASE_URL || 'https://staging-api.example.com';
      case 'production':
        return process.env.API_BASE_URL || 'https://api.example.com';
      default:
        return process.env.API_BASE_URL || 'http://localhost:3001';
    }
  }

  private getUIBaseUrl(environment: string): string {
    switch (environment) {
      case 'test':
        return process.env.UI_BASE_URL || 'http://localhost:3001';
      case 'staging':
        return process.env.UI_BASE_URL || 'https://staging.example.com';
      case 'production':
        return process.env.UI_BASE_URL || 'https://example.com';
      default:
        return process.env.UI_BASE_URL || 'http://localhost:3001';
    }
  }

  private getAdminBaseUrl(environment: string): string {
    switch (environment) {
      case 'test':
        return process.env.ADMIN_BASE_URL || 'http://localhost:3021';
      case 'staging':
        return process.env.ADMIN_BASE_URL || 'https://admin-staging.example.com';
      case 'production':
        return process.env.ADMIN_BASE_URL || 'https://admin.example.com';
      default:
        return process.env.ADMIN_BASE_URL || 'http://localhost:3021';
    }
  }

  private getWorkerCount(environment: string): number {
    if (process.env.CI) {
      return 2; // Conservative for CI
    }
    
    switch (environment) {
      case 'test':
        return 4;
      case 'staging':
        return 2;
      case 'production':
        return 1;
      default:
        return 2;
    }
  }

  private getRetryCount(environment: string): number {
    if (process.env.CI) {
      return 2;
    }
    
    switch (environment) {
      case 'test':
        return 1;
      case 'staging':
        return 2;
      case 'production':
        return 3;
      default:
        return 0;
    }
  }

  private applyEnvironmentOverrides(
    config: EnvironmentConfiguration, 
    environment: string
  ): EnvironmentConfiguration {
    // Apply environment-specific overrides
    switch (environment) {
      case 'test':
        config.database.port = 5433; // Test DB port
        config.test.browser = ['chromium']; // Single browser for speed
        break;
      
      case 'staging':
        config.test.browser = ['chromium', 'firefox'];
        config.features.visualRegression = true;
        break;
      
      case 'production':
        config.test.browser = ['chromium', 'firefox', 'webkit'];
        config.features.visualRegression = true;
        config.features.performance = true;
        break;
    }

    return config;
  }

  public getConfig(): EnvironmentConfiguration {
    return { ...this.config };
  }

  public getDatabaseConfig(): DatabaseConfig {
    return { ...this.config.database };
  }

  public getApiConfig(): ApiConfig {
    return { ...this.config.api };
  }

  public getUIConfig(): UIConfig {
    return { ...this.config.ui };
  }

  public getAdminConfig(): AdminConfig {
    return { ...this.config.admin };
  }

  public getTestConfig(): TestConfig {
    return { ...this.config.test };
  }

  public isFeatureEnabled(feature: keyof EnvironmentConfiguration['features']): boolean {
    return this.config.features[feature];
  }

  public getEnvironment(): string {
    return this.config.environment;
  }

  public isCI(): boolean {
    return !!process.env.CI;
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public isTest(): boolean {
    return this.config.environment === 'test';
  }

  public isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }
}

export const environmentConfig = EnvironmentConfig.getInstance();
export default environmentConfig;