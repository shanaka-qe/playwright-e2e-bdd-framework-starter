/**
 * AdminApp Configuration
 * Application-specific settings for the admin application
 */

export interface AdminappConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  features: {
    userManagement: boolean;
    systemMonitoring: boolean;
    logManagement: boolean;
  };
  authentication: {
    enabled: boolean;
    requireMFA: boolean;
  };
  ui: {
    defaultViewport: { width: number; height: number };
    theme: 'light' | 'dark' | 'auto';
  };
}

export const adminappConfig: AdminappConfig = {
  baseUrl: process.env.ADMIN_BASE_URL || 'http://localhost:3021',
  timeout: 30000,
  retries: 1,
  features: {
    userManagement: true,
    systemMonitoring: true,
    logManagement: true,
  },
  authentication: {
    enabled: true,
    requireMFA: false,
  },
  ui: {
    defaultViewport: { width: 1280, height: 720 },
    theme: 'auto',
  },
};