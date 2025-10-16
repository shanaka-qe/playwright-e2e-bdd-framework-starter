/**
 * Webapp Configuration
 * 
 * Configuration management for the webapp application
 */

import { z } from 'zod';
import { BaseConfig } from './BaseConfig';

// Define webapp configuration schema
const WebappConfigSchema = z.object({
  app: z.object({
    name: z.string().default('WebApp'),
    baseUrl: z.string().url(),
    port: z.number().int().positive(),
    apiUrl: z.string().url(),
    environment: z.enum(['development', 'test', 'staging', 'production'])
  }),
  
  auth: z.object({
    loginUrl: z.string().default('/login'),
    logoutUrl: z.string().default('/logout'),
    sessionTimeout: z.number().int().positive().default(3600000), // 1 hour
    defaultCredentials: z.object({
      email: z.string().email().optional(),
      password: z.string().optional()
    }).optional()
  }),
  
  features: z.object({
    documentUpload: z.object({
      enabled: z.boolean().default(true),
      maxFileSize: z.number().int().positive().default(50 * 1024 * 1024), // 50MB
      allowedTypes: z.array(z.string()).default(['pdf', 'docx', 'txt', 'md']),
      processingTimeout: z.number().int().positive().default(300000) // 5 minutes
    }),
    
    featureGeneration: z.object({
      enabled: z.boolean().default(true),
      defaultModel: z.string().default('gpt-4'),
      generationTimeout: z.number().int().positive().default(120000), // 2 minutes
      maxRetries: z.number().int().default(3)
    }),
    
    chat: z.object({
      enabled: z.boolean().default(true),
      streamingEnabled: z.boolean().default(true),
      historyLimit: z.number().int().default(50)
    }),
    
    search: z.object({
      enabled: z.boolean().default(true),
      minQueryLength: z.number().int().default(2),
      maxResults: z.number().int().default(20),
      debounceMs: z.number().int().default(300)
    })
  }),
  
  ui: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    animations: z.boolean().default(true),
    loadingTimeout: z.number().int().default(30000),
    toastDuration: z.number().int().default(5000)
  }),
  
  testing: z.object({
    slowMo: z.number().int().min(0).default(0),
    headless: z.boolean().default(true),
    screenshot: z.object({
      enabled: z.boolean().default(true),
      onFailure: z.boolean().default(true),
      fullPage: z.boolean().default(false)
    }),
    video: z.object({
      enabled: z.boolean().default(false),
      size: z.object({
        width: z.number().int().default(1280),
        height: z.number().int().default(720)
      })
    }),
    trace: z.object({
      enabled: z.boolean().default(true),
      screenshots: z.boolean().default(true),
      snapshots: z.boolean().default(true),
      sources: z.boolean().default(false)
    })
  })
});

export type WebappConfigType = z.infer<typeof WebappConfigSchema>;

export class WebappConfig extends BaseConfig<typeof WebappConfigSchema> {
  constructor(environment?: string) {
    super(WebappConfigSchema, environment);
  }

  protected getDefaults(): Partial<WebappConfigType> {
    return {
      app: {
        name: 'WebApp',
        baseUrl: 'http://localhost:3001',
        port: 3001,
        apiUrl: 'http://localhost:3001/api',
        environment: 'development'
      },
      auth: {
        loginUrl: '/login',
        logoutUrl: '/logout',
        sessionTimeout: 3600000
      },
      features: {
        documentUpload: {
          enabled: true,
          maxFileSize: 50 * 1024 * 1024,
          allowedTypes: ['pdf', 'docx', 'txt', 'md'],
          processingTimeout: 300000
        },
        featureGeneration: {
          enabled: true,
          defaultModel: 'gpt-4',
          generationTimeout: 120000,
          maxRetries: 3
        },
        chat: {
          enabled: true,
          streamingEnabled: true,
          historyLimit: 50
        },
        search: {
          enabled: true,
          minQueryLength: 2,
          maxResults: 20,
          debounceMs: 300
        }
      },
      ui: {
        theme: 'system',
        animations: true,
        loadingTimeout: 30000,
        toastDuration: 5000
      },
      testing: {
        slowMo: 0,
        headless: true,
        screenshot: {
          enabled: true,
          onFailure: true,
          fullPage: false
        },
        video: {
          enabled: false,
          size: { width: 1280, height: 720 }
        },
        trace: {
          enabled: true,
          screenshots: true,
          snapshots: true,
          sources: false
        }
      }
    };
  }

  protected envToConfig(env: NodeJS.ProcessEnv): Partial<WebappConfigType> {
    const config: any = {};

    // App configuration
    if (env.WEBAPP_BASE_URL) {
      config.app = config.app || {};
      config.app.baseUrl = env.WEBAPP_BASE_URL;
    }
    if (env.WEBAPP_PORT) {
      config.app = config.app || {};
      config.app.port = parseInt(env.WEBAPP_PORT, 10);
    }
    if (env.WEBAPP_API_URL) {
      config.app = config.app || {};
      config.app.apiUrl = env.WEBAPP_API_URL;
    }
    if (env.NODE_ENV) {
      config.app = config.app || {};
      config.app.environment = env.NODE_ENV as any;
    }

    // Auth configuration
    if (env.WEBAPP_DEFAULT_EMAIL) {
      config.auth = config.auth || {};
      config.auth.defaultCredentials = config.auth.defaultCredentials || {};
      config.auth.defaultCredentials.email = env.WEBAPP_DEFAULT_EMAIL;
    }
    if (env.WEBAPP_DEFAULT_PASSWORD) {
      config.auth = config.auth || {};
      config.auth.defaultCredentials = config.auth.defaultCredentials || {};
      config.auth.defaultCredentials.password = env.WEBAPP_DEFAULT_PASSWORD;
    }

    // Feature flags
    if (env.WEBAPP_FEATURE_UPLOAD === 'false') {
      config.features = config.features || {};
      config.features.documentUpload = { enabled: false };
    }
    if (env.WEBAPP_FEATURE_GENERATION === 'false') {
      config.features = config.features || {};
      config.features.featureGeneration = { enabled: false };
    }
    if (env.WEBAPP_FEATURE_CHAT === 'false') {
      config.features = config.features || {};
      config.features.chat = { enabled: false };
    }

    // Testing configuration
    if (env.PLAYWRIGHT_HEADLESS === 'false') {
      config.testing = config.testing || {};
      config.testing.headless = false;
    }
    if (env.PLAYWRIGHT_SLOW_MO) {
      config.testing = config.testing || {};
      config.testing.slowMo = parseInt(env.PLAYWRIGHT_SLOW_MO, 10);
    }
    if (env.PLAYWRIGHT_VIDEO === 'true') {
      config.testing = config.testing || {};
      config.testing.video = { enabled: true };
    }

    return config;
  }

  // Convenience methods

  getBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  getApiUrl(): string {
    return this.config.app.apiUrl;
  }

  getLoginUrl(): string {
    return `${this.config.app.baseUrl}${this.config.auth.loginUrl}`;
  }

  getDefaultCredentials(): { email?: string; password?: string } | undefined {
    return this.config.auth.defaultCredentials;
  }

  isFeatureEnabled(feature: 'documentUpload' | 'featureGeneration' | 'chat' | 'search'): boolean {
    return this.config.features[feature].enabled;
  }

  getTestingConfig() {
    return this.config.testing;
  }

  getPlaywrightConfig() {
    return {
      baseURL: this.config.app.baseUrl,
      headless: this.config.testing.headless,
      slowMo: this.config.testing.slowMo,
      screenshot: this.config.testing.screenshot.enabled ? 'only-on-failure' : 'off',
      video: this.config.testing.video.enabled ? 'on' : 'off',
      trace: this.config.testing.trace.enabled ? 'on' : 'off'
    };
  }
}

// Singleton instance
let instance: WebappConfig | null = null;

export function getWebappConfig(environment?: string): WebappConfig {
  if (!instance || (environment && environment !== instance.getEnvironment())) {
    instance = new WebappConfig(environment);
  }
  return instance;
}