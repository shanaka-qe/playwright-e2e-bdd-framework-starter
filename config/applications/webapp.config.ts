/**
 * WebApp Configuration
 * Application-specific settings for the main web application
 */

export interface WebappConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  features: {
    documentManagement: boolean;
    featureGeneration: boolean;
    globalChat: boolean;
  };
  authentication: {
    enabled: boolean;
    providers: string[];
  };
  ui: {
    defaultViewport: { width: number; height: number };
    theme: 'light' | 'dark' | 'auto';
  };
}

export const webappConfig: WebappConfig = {
  baseUrl: process.env.UI_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  retries: 2,
  features: {
    documentManagement: true,
    featureGeneration: true,
    globalChat: true,
  },
  authentication: {
    enabled: true,
    providers: ['local', 'oauth'],
  },
  ui: {
    defaultViewport: { width: 1280, height: 720 },
    theme: 'auto',
  },
};