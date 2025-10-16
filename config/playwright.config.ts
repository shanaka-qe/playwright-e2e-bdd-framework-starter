import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import path from 'path';
import dotenv from 'dotenv';

// Import application configs
import { webappConfig } from './applications/webapp.config';
import { adminappConfig } from './applications/adminapp.config';
import { mcpServerConfig } from './applications/mcp-server.config';
import { sharedConfig } from './applications/shared.config';

// Import environment config based on NODE_ENV
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'staging':
      return require('./environments/staging.config').stagingConfig;
    case 'production':
      return require('./environments/prod.config').prodConfig;
    default:
      return require('./environments/dev.config').devConfig;
  }
};

// Load environment variables
const envFile = process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env.local';
dotenv.config({ path: path.join(__dirname, envFile) });

const envConfig = getEnvironmentConfig();

// Configure BDD with absolute paths
const testDir = defineBddConfig({
  featuresRoot: path.resolve(__dirname, '..', 'features'),
  steps: path.resolve(__dirname, '..', 'features', 'steps', '**', '*.ts'),
});

export default defineConfig({
  testDir: testDir,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: sharedConfig.parallel.fullyParallel,
  forbidOnly: !!process.env.CI,
  retries: envConfig.retries,
  workers: envConfig.parallel?.workers || sharedConfig.parallel.workers,
  
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: '../reports/combined/html-report'
    }],
    ['json', { 
      outputFile: '../reports/combined/results.json' 
    }],
    ['junit', { 
      outputFile: '../reports/combined/junit-results.xml' 
    }],
    ['../src/core/reporters/CustomReporter.ts']
  ],
  
  use: {
    baseURL: envConfig.webapp.baseUrl,
    trace: sharedConfig.trace.mode,
    screenshot: sharedConfig.screenshots.mode,
    video: sharedConfig.video.mode,
    actionTimeout: envConfig.webapp.timeout,
    navigationTimeout: envConfig.webapp.timeout,
    
    // Browser context options
    viewport: webappConfig.ui.defaultViewport,
    ignoreHTTPSErrors: true,
    testIdAttribute: 'data-testid',
    
    // Launch options
    launchOptions: {
      slowMo: sharedConfig.browser.slowMo,
      args: [
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    }
  },
  
  projects: [
    // BDD Tests
    {
      name: 'bdd-webapp-smoke',
      testMatch: ['.features-gen/webapp/**/*.spec.js'],
      grep: /@smoke/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    {
      name: 'bdd-webapp-regression', 
      testMatch: ['.features-gen/webapp/**/*.spec.js'],
      grep: /@regression/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    {
      name: 'bdd-adminapp-smoke',
      testMatch: ['.features-gen/adminapp/**/*.spec.js'],
      grep: /@smoke/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.adminapp.baseUrl
      },
    },
    
    {
      name: 'bdd-adminapp-regression',
      testMatch: ['.features-gen/adminapp/**/*.spec.js'],
      grep: /@regression/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.adminapp.baseUrl
      },
    },
    
    // Playwright Tests by Application
    {
      name: 'webapp-ui',
      testMatch: ['../tests/webapp/ui/**/*.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    {
      name: 'webapp-api',
      testMatch: ['../tests/webapp/api/**/*.spec.ts'],
      use: {
        baseURL: envConfig.webapp.baseUrl
      }
    },
    
    {
      name: 'adminapp-ui',
      testMatch: ['../tests/adminapp/ui/**/*.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.adminapp.baseUrl
      },
    },
    
    {
      name: 'adminapp-api',
      testMatch: ['../tests/adminapp/api/**/*.spec.ts'],
      use: {
        baseURL: envConfig.adminapp.baseUrl
      }
    },
    
    {
      name: 'mcp-server-api',
      testMatch: ['../tests/mcp-server/api/**/*.spec.ts'],
      use: {
        baseURL: envConfig.mcpServer.baseUrl
      }
    },
    
    {
      name: 'cross-app-integration',
      testMatch: ['../tests/cross-app/**/*.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    // Cross-browser tests
    ...(process.env.CROSS_BROWSER === 'true' ? [
      {
        name: 'webapp-firefox',
        testMatch: ['../tests/webapp/ui/**/smoke*.spec.ts'],
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webapp-webkit',
        testMatch: ['../tests/webapp/ui/**/smoke*.spec.ts'],
        use: { ...devices['Desktop Safari'] },
      }
    ] : []),
    
    // Mobile tests
    ...(process.env.MOBILE_TESTS === 'true' ? [
      {
        name: 'webapp-mobile-chrome',
        testMatch: ['../tests/webapp/ui/**/*.spec.ts'],
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'webapp-mobile-safari',
        testMatch: ['../tests/webapp/ui/**/*.spec.ts'],
        use: { ...devices['iPhone 12'] },
      }
    ] : [])
  ],
  
  // Global setup and teardown
  globalSetup: '../src/core/base/global-setup.ts',
  globalTeardown: '../src/core/base/global-teardown.ts',
  
  // Output directories
  outputDir: '../reports/combined/artifacts',
  
  // Test metadata
  metadata: {
    environment: envConfig.environment,
    webappUrl: envConfig.webapp.baseUrl,
    adminappUrl: envConfig.adminapp.baseUrl,
    mcpServerUrl: envConfig.mcpServer.baseUrl,
    testFramework: 'Playwright + Playwright-BDD',
    frameworkVersion: '1.54.1'
  },

  // Web server configuration for local development
  ...(envConfig.environment === 'development' ? {
    webServer: {
      command: 'echo "Development mode: Please ensure applications are running"',
      url: envConfig.webapp.baseUrl,
      reuseExistingServer: true,
      timeout: 10000,
    }
  } : {})
});