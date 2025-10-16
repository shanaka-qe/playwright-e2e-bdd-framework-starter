/**
 * Admin Configuration
 * 
 * Configuration management for the admin application
 */

import { z } from 'zod';
import { BaseConfig } from './BaseConfig';

// Define admin configuration schema
const AdminConfigSchema = z.object({
  app: z.object({
    name: z.string().default('Testoria Admin'),
    baseUrl: z.string().url(),
    port: z.number().int().positive(),
    apiUrl: z.string().url(),
    environment: z.enum(['development', 'test', 'staging', 'production'])
  }),
  
  auth: z.object({
    loginUrl: z.string().default('/admin/login'),
    logoutUrl: z.string().default('/admin/logout'),
    sessionTimeout: z.number().int().positive().default(1800000), // 30 minutes
    twoFactorRequired: z.boolean().default(false),
    defaultCredentials: z.object({
      email: z.string().email().optional(),
      password: z.string().optional()
    }).optional()
  }),
  
  features: z.object({
    userManagement: z.object({
      enabled: z.boolean().default(true),
      bulkOperations: z.boolean().default(true),
      maxBulkSize: z.number().int().default(100)
    }),
    
    systemMonitoring: z.object({
      enabled: z.boolean().default(true),
      refreshInterval: z.number().int().default(5000), // 5 seconds
      retentionDays: z.number().int().default(30)
    }),
    
    logs: z.object({
      enabled: z.boolean().default(true),
      realtime: z.boolean().default(true),
      maxResults: z.number().int().default(1000),
      exportFormats: z.array(z.string()).default(['json', 'csv', 'txt'])
    }),
    
    backup: z.object({
      enabled: z.boolean().default(true),
      autoBackup: z.boolean().default(false),
      scheduleHour: z.number().int().min(0).max(23).default(2), // 2 AM
      retentionCount: z.number().int().default(7)
    }),
    
    maintenance: z.object({
      enabled: z.boolean().default(true),
      allowScheduling: z.boolean().default(true),
      minimumNoticeHours: z.number().int().default(24)
    })
  }),
  
  security: z.object({
    ipWhitelist: z.array(z.string()).optional(),
    requireHttps: z.boolean().default(true),
    csrfProtection: z.boolean().default(true),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      windowMs: z.number().int().default(900000), // 15 minutes
      maxRequests: z.number().int().default(100)
    })
  }),
  
  monitoring: z.object({
    errorTracking: z.boolean().default(true),
    performanceTracking: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
    alerting: z.object({
      enabled: z.boolean().default(true),
      channels: z.array(z.enum(['email', 'slack', 'webhook'])).default(['email'])
    })
  }),
  
  testing: z.object({
    slowMo: z.number().int().min(0).default(0),
    headless: z.boolean().default(true),
    adminTimeout: z.number().int().default(60000), // 1 minute for admin ops
    screenshot: z.object({
      enabled: z.boolean().default(true),
      onFailure: z.boolean().default(true),
      maskSensitive: z.boolean().default(true)
    })
  })
});

export type AdminConfigType = z.infer<typeof AdminConfigSchema>;

export class AdminConfig extends BaseConfig<typeof AdminConfigSchema> {
  constructor(environment?: string) {
    super(AdminConfigSchema, environment);
  }

  protected getDefaults(): Partial<AdminConfigType> {
    const isProduction = this.environment === 'production';
    
    return {
      app: {
        name: 'Testoria Admin',
        baseUrl: 'http://localhost:3001',
        port: 3001,
        apiUrl: 'http://localhost:3001/api/admin',
        environment: 'development'
      },
      auth: {
        loginUrl: '/admin/login',
        logoutUrl: '/admin/logout',
        sessionTimeout: isProduction ? 900000 : 1800000, // 15m prod, 30m dev
        twoFactorRequired: isProduction
      },
      features: {
        userManagement: {
          enabled: true,
          bulkOperations: !isProduction,
          maxBulkSize: 100
        },
        systemMonitoring: {
          enabled: true,
          refreshInterval: 5000,
          retentionDays: isProduction ? 90 : 30
        },
        logs: {
          enabled: true,
          realtime: true,
          maxResults: 1000,
          exportFormats: ['json', 'csv', 'txt']
        },
        backup: {
          enabled: true,
          autoBackup: isProduction,
          scheduleHour: 2,
          retentionCount: isProduction ? 30 : 7
        },
        maintenance: {
          enabled: true,
          allowScheduling: true,
          minimumNoticeHours: isProduction ? 48 : 1
        }
      },
      security: {
        requireHttps: isProduction,
        csrfProtection: true,
        rateLimit: {
          enabled: true,
          windowMs: 900000,
          maxRequests: isProduction ? 50 : 100
        }
      },
      monitoring: {
        errorTracking: true,
        performanceTracking: true,
        auditLogging: true,
        alerting: {
          enabled: isProduction,
          channels: isProduction ? ['email', 'slack'] : ['email']
        }
      },
      testing: {
        slowMo: 0,
        headless: true,
        adminTimeout: 60000,
        screenshot: {
          enabled: true,
          onFailure: true,
          maskSensitive: true
        }
      }
    };
  }

  protected envToConfig(env: NodeJS.ProcessEnv): Partial<AdminConfigType> {
    const config: any = {};

    // App configuration
    if (env.ADMIN_BASE_URL) {
      config.app = config.app || {};
      config.app.baseUrl = env.ADMIN_BASE_URL;
    }
    if (env.ADMIN_PORT) {
      config.app = config.app || {};
      config.app.port = parseInt(env.ADMIN_PORT, 10);
    }
    if (env.ADMIN_API_URL) {
      config.app = config.app || {};
      config.app.apiUrl = env.ADMIN_API_URL;
    }

    // Auth configuration
    if (env.ADMIN_DEFAULT_EMAIL) {
      config.auth = config.auth || {};
      config.auth.defaultCredentials = config.auth.defaultCredentials || {};
      config.auth.defaultCredentials.email = env.ADMIN_DEFAULT_EMAIL;
    }
    if (env.ADMIN_DEFAULT_PASSWORD) {
      config.auth = config.auth || {};
      config.auth.defaultCredentials = config.auth.defaultCredentials || {};
      config.auth.defaultCredentials.password = env.ADMIN_DEFAULT_PASSWORD;
    }
    if (env.ADMIN_2FA_REQUIRED === 'true') {
      config.auth = config.auth || {};
      config.auth.twoFactorRequired = true;
    }

    // Security configuration
    if (env.ADMIN_IP_WHITELIST) {
      config.security = config.security || {};
      config.security.ipWhitelist = env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim());
    }
    if (env.ADMIN_REQUIRE_HTTPS === 'false') {
      config.security = config.security || {};
      config.security.requireHttps = false;
    }

    // Feature flags
    if (env.ADMIN_FEATURE_USER_MGMT === 'false') {
      config.features = config.features || {};
      config.features.userManagement = { enabled: false };
    }
    if (env.ADMIN_FEATURE_MONITORING === 'false') {
      config.features = config.features || {};
      config.features.systemMonitoring = { enabled: false };
    }
    if (env.ADMIN_FEATURE_BACKUP === 'false') {
      config.features = config.features || {};
      config.features.backup = { enabled: false };
    }

    // Testing configuration
    if (env.ADMIN_TEST_TIMEOUT) {
      config.testing = config.testing || {};
      config.testing.adminTimeout = parseInt(env.ADMIN_TEST_TIMEOUT, 10);
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

  isFeatureEnabled(feature: keyof AdminConfigType['features']): boolean {
    return this.config.features[feature].enabled;
  }

  getSecurityConfig() {
    return this.config.security;
  }

  isIpAllowed(ip: string): boolean {
    if (!this.config.security.ipWhitelist || this.config.security.ipWhitelist.length === 0) {
      return true; // No whitelist means all IPs allowed
    }
    return this.config.security.ipWhitelist.includes(ip);
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getBackupSchedule() {
    return {
      enabled: this.config.features.backup.autoBackup,
      hour: this.config.features.backup.scheduleHour,
      retention: this.config.features.backup.retentionCount
    };
  }

  getAdminTimeout(): number {
    return this.config.testing.adminTimeout;
  }
}

// Singleton instance
let instance: AdminConfig | null = null;

export function getAdminConfig(environment?: string): AdminConfig {
  if (!instance || (environment && environment !== instance.getEnvironment())) {
    instance = new AdminConfig(environment);
  }
  return instance;
}