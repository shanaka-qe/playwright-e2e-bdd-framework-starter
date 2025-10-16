# Configuration Guide

**Complete Reference for Framework Configuration**

## 🎯 Overview

The Playwright E2E Testing Framework uses a sophisticated configuration system that separates concerns by application and environment, providing flexibility and maintainability for enterprise-scale testing.

## 📊 Configuration Architecture

```
Configuration Hierarchy:
├── 🏗️ Main Playwright Config (playwright.config.ts)
├── 🌍 Environment Configs (dev/staging/prod)  
├── 🎯 Application Configs (webapp/adminapp/mcp-server)
└── ⚙️ Shared Framework Config (shared.config.ts)
```

---

## 🏗️ Main Playwright Configuration

**Location**: `config/playwright.config.ts`

**Purpose**: Central configuration that orchestrates all testing projects and environments.

### **Key Features**

```typescript
export default defineConfig({
  // BDD Integration
  testDir: defineBddConfig({
    featuresRoot: '../features',
    steps: '../features/steps/**/*.ts',
  }),
  
  // Environment-Aware Settings
  baseURL: envConfig.webapp.baseUrl,
  timeout: envConfig.webapp.timeout,
  retries: envConfig.retries,
  workers: envConfig.parallel.workers,
  
  // Application-Specific Projects
  projects: [
    { name: 'webapp-ui', ... },
    { name: 'adminapp-ui', ... },
    { name: 'mcp-server-api', ... },
    { name: 'cross-app-integration', ... }
  ]
});
```

### **Project Configuration**

Each application has dedicated test projects:

#### **WebApp Projects**
```typescript
{
  name: 'webapp-ui',
  testMatch: ['../tests/webapp/ui/**/*.spec.ts'],
  use: { 
    ...devices['Desktop Chrome'],
    baseURL: envConfig.webapp.baseUrl 
  }
},
{
  name: 'webapp-api', 
  testMatch: ['../tests/webapp/api/**/*.spec.ts'],
  use: { baseURL: envConfig.webapp.baseUrl }
}
```

#### **BDD Projects**
```typescript
{
  name: 'bdd-webapp-smoke',
  testMatch: ['.features-gen/webapp/**/*.spec.js'],
  grep: /@smoke/,
  use: { baseURL: envConfig.webapp.baseUrl }
},
{
  name: 'bdd-webapp-regression',
  testMatch: ['.features-gen/webapp/**/*.spec.js'], 
  grep: /@regression/
}
```

---

## 🌍 Environment Configuration

Environment-specific configurations provide settings optimized for different deployment stages.

### **Development Configuration**

**Location**: `config/environments/dev.config.ts`

```typescript
export const devConfig = {
  environment: 'development',
  debug: true,
  
  // Application URLs
  webapp: {
    baseUrl: 'http://localhost:3001',
    timeout: 60000, // Longer for debugging
  },
  adminapp: {
    baseUrl: 'http://localhost:3021', 
    timeout: 60000,
  },
  mcpServer: {
    baseUrl: 'http://localhost:3002',
    timeout: 30000,
  },
  
  // Development-specific settings
  database: {
    host: 'localhost',
    port: 5432,
    cleanupAfterTests: false, // Keep data for debugging
  },
  logging: {
    level: 'debug',
    console: true,
    file: false,
  },
  retries: 0, // No retries for faster feedback
  parallel: {
    workers: 1, // Sequential for easier debugging
  }
};
```

### **Staging Configuration** 

**Location**: `config/environments/staging.config.ts`

```typescript
export const stagingConfig = {
  environment: 'staging',
  debug: false,
  
  // Staging URLs
  webapp: {
    baseUrl: process.env.STAGING_UI_BASE_URL || 'https://staging.example.com',
    timeout: 30000,
  },
  adminapp: {
    baseUrl: process.env.STAGING_ADMIN_BASE_URL || 'https://admin-staging.example.com',
    timeout: 30000,
  },
  
  // Staging-optimized settings
  database: {
    host: process.env.STAGING_DB_HOST,
    port: Number(process.env.STAGING_DB_PORT) || 5432,
    cleanupAfterTests: true, // Clean data after tests
  },
  logging: {
    level: 'info',
    console: true,
    file: true,
  },
  retries: 2, // Reasonable retry policy
  parallel: {
    workers: 4, // Parallel execution
  }
};
```

### **Production Configuration**

**Location**: `config/environments/prod.config.ts`

```typescript
export const prodConfig = {
  environment: 'production',
  debug: false,
  
  // Production URLs
  webapp: {
    baseUrl: process.env.PROD_UI_BASE_URL || 'https://example.com',
    timeout: 15000, // Faster timeouts
  },
  
  // Production-optimized settings
  logging: {
    level: 'error', // Minimal logging
    console: false,
    file: true,
  },
  retries: 3, // More retries for stability
  parallel: {
    workers: 6, // Maximum parallelism
  }
};
```

---

## 🎯 Application Configuration

Application-specific configurations define features, settings, and capabilities for each application.

### **WebApp Configuration**

**Location**: `config/applications/webapp.config.ts`

```typescript
export interface WebappConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  
  // Feature flags
  features: {
    documentManagement: boolean;
    featureGeneration: boolean; 
    globalChat: boolean;
  };
  
  // Authentication settings
  authentication: {
    enabled: boolean;
    providers: string[];
  };
  
  // UI configuration
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
  }
};
```

### **AdminApp Configuration**

**Location**: `config/applications/adminapp.config.ts`

```typescript
export interface AdminappConfig {
  baseUrl: string;
  timeout: number;
  
  // Admin-specific features
  features: {
    userManagement: boolean;
    systemMonitoring: boolean;
    logManagement: boolean;
  };
  
  // Security settings
  authentication: {
    enabled: boolean;
    requireMFA: boolean;
  };
}

export const adminappConfig: AdminappConfig = {
  baseUrl: process.env.ADMIN_BASE_URL || 'http://localhost:3021',
  timeout: 30000,
  
  features: {
    userManagement: true,
    systemMonitoring: true,
    logManagement: true,
  },
  
  authentication: {
    enabled: true,
    requireMFA: false, // Can be enabled per environment
  }
};
```

### **MCP Server Configuration**

**Location**: `config/applications/mcp-server.config.ts`

```typescript
export interface McpServerConfig {
  baseUrl: string;
  timeout: number;
  
  // AI/ML features
  features: {
    textGeneration: boolean;
    embeddings: boolean;
    modelManagement: boolean;
  };
  
  // Model configuration
  models: {
    defaultModel: string;
    availableModels: string[];
  };
}

export const mcpServerConfig: McpServerConfig = {
  baseUrl: process.env.MCP_PLATFORM_URL || 'http://localhost:3002',
  timeout: 15000,
  
  features: {
    textGeneration: true,
    embeddings: true,
    modelManagement: true,
  },
  
  models: {
    defaultModel: 'ollama',
    availableModels: ['ollama', 'openai', 'anthropic'],
  }
};
```

---

## ⚙️ Shared Framework Configuration

**Location**: `config/applications/shared.config.ts`

Common settings used across all applications:

```typescript
export interface SharedConfig {
  browser: {
    headless: boolean;
    slowMo: number;
    devtools: boolean;
  };
  screenshots: {
    mode: 'off' | 'only-on-failure' | 'on';
    quality: number;
  };
  video: {
    mode: 'off' | 'on' | 'retain-on-failure';
    size: { width: number; height: number };
  };
  trace: {
    mode: 'off' | 'on' | 'retain-on-failure';
  };
  parallel: {
    workers: number;
    fullyParallel: boolean;
  };
}

export const sharedConfig: SharedConfig = {
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: Number(process.env.SLOW_MO) || 0,
    devtools: false,
  },
  
  screenshots: {
    mode: 'only-on-failure',
    quality: 90,
  },
  
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
  },
  
  trace: {
    mode: 'retain-on-failure',
  },
  
  parallel: {
    workers: process.env.CI ? 2 : 4,
    fullyParallel: true,
  }
};
```

---

## 🌐 Environment Variables

### **Required Environment Variables**

Create `.env.local`, `.env.test`, and `.env.staging` files:

```bash
# Application URLs
UI_BASE_URL=http://localhost:3001
ADMIN_BASE_URL=http://localhost:3021  
MCP_PLATFORM_URL=http://localhost:3002

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://user:pass@localhost:5432/testdb

# Test Configuration
HEADLESS=true
BROWSER=chromium
SLOW_MO=0

# CI/CD Settings
CI=false
CROSS_BROWSER=false
MOBILE_TESTS=false
VIDEO=true
SCREENSHOT=true
TRACE=true

# Environment-Specific
NODE_ENV=development
```

### **Staging Environment Variables**

```bash
# Staging URLs
STAGING_UI_BASE_URL=https://staging.example.com
STAGING_ADMIN_BASE_URL=https://admin-staging.example.com
STAGING_MCP_PLATFORM_URL=https://mcp-staging.example.com

# Staging Database
STAGING_DB_HOST=staging-db.example.com
STAGING_DB_PORT=5432

# Staging-specific settings
NODE_ENV=staging
HEADLESS=true
VIDEO=false
SCREENSHOT=only-on-failure
```

### **Production Environment Variables**

```bash
# Production URLs (Read-only testing)
PROD_UI_BASE_URL=https://example.com
PROD_ADMIN_BASE_URL=https://admin.example.com
PROD_MCP_PLATFORM_URL=https://mcp.example.com

# Production settings
NODE_ENV=production
HEADLESS=true
VIDEO=false
SCREENSHOT=only-on-failure
RETRIES=3
```

---

## 🎛️ Configuration Usage

### **Setting Environment**

```bash
# Development (default)
npm run test

# Staging
NODE_ENV=staging npm run test:smoke

# Production
NODE_ENV=production npm run test:smoke
```

### **Accessing Configuration in Tests**

```typescript
// In test files
import { webappConfig } from '../config/applications/webapp.config';
import { devConfig } from '../config/environments/dev.config';

test('should use correct base URL', async ({ page }) => {
  // Uses environment-specific URL
  await page.goto('/');
  
  // Access feature flags
  if (webappConfig.features.documentManagement) {
    await expect(page.locator('[data-testid="documents"]')).toBeVisible();
  }
});
```

### **Configuration in Page Objects**

```typescript
// In page object models
export class WebappBasePage {
  constructor(protected page: Page) {
    this.baseUrl = webappConfig.baseUrl;
    this.timeout = webappConfig.timeout;
  }
  
  async navigateToDocuments() {
    if (!webappConfig.features.documentManagement) {
      throw new Error('Document management feature not enabled');
    }
    await this.page.goto('/documents');
  }
}
```

---

## 🔧 Advanced Configuration

### **Custom Project Configuration**

Add new test projects for specific needs:

```typescript
// In playwright.config.ts
projects: [
  // ... existing projects
  
  // Performance testing project
  {
    name: 'performance-tests',
    testMatch: ['../tests/**/performance/*.spec.ts'],
    use: {
      ...devices['Desktop Chrome'],
      // Performance-specific settings
      video: 'off',
      screenshot: 'off',
    },
    timeout: 60000, // Longer timeout for performance tests
  },
  
  // Security testing project
  {
    name: 'security-tests',
    testMatch: ['../tests/**/security/*.spec.ts'],
    use: {
      // Security-specific browser settings
      ignoreHTTPSErrors: false,
      acceptDownloads: false,
    }
  }
]
```

### **Dynamic Configuration Loading**

```typescript
// Dynamic configuration based on environment
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'staging':
      return require('./environments/staging.config').stagingConfig;
    case 'production': 
      return require('./environments/prod.config').prodConfig;
    case 'development':
    default:
      return require('./environments/dev.config').devConfig;
  }
};
```

### **Feature Flag Configuration**

```typescript
// Feature-based test execution
const shouldRunFeature = (featureName: keyof WebappConfig['features']) => {
  return webappConfig.features[featureName];
};

// In tests
test.skip(!shouldRunFeature('globalChat'), 'Global chat feature disabled');
test('global chat functionality', async ({ page }) => {
  // Test global chat features
});
```

---

## 📊 Configuration Best Practices

### **1. Environment Separation**
- Never hardcode URLs or credentials
- Use environment variables for all environment-specific values
- Maintain separate configurations for each environment

### **2. Feature Flags**
- Use feature flags to enable/disable functionality
- Test both enabled and disabled states
- Document feature dependencies

### **3. Security**
- Never commit sensitive data to version control
- Use environment variables for credentials
- Implement proper authentication in configurations

### **4. Maintainability**
- Keep configurations DRY (Don't Repeat Yourself)
- Document configuration options
- Use TypeScript interfaces for type safety

### **5. Performance**
- Optimize timeout values per environment
- Configure appropriate parallelism
- Use environment-specific retry policies

---

## 🔍 Configuration Validation

### **Setup Validation Script**

**Location**: `validate-setup.js`

```javascript
const validateConfiguration = () => {
  // Check required environment variables
  const requiredEnvVars = [
    'UI_BASE_URL',
    'ADMIN_BASE_URL', 
    'MCP_PLATFORM_URL'
  ];
  
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }
  
  // Validate URLs are accessible
  // Validate database connectivity
  // Check feature flag consistency
};
```

### **Running Validation**

```bash
# Validate current configuration
npm run framework:validate

# Validate specific environment
NODE_ENV=staging npm run framework:validate
```

---

## 🚀 Configuration Migration

When updating configurations:

### **1. Version Configuration Files**
- Tag configuration versions
- Document breaking changes
- Provide migration guides

### **2. Backward Compatibility**
- Support old configuration formats during transition
- Provide deprecation warnings
- Plan removal timelines

### **3. Testing Configuration Changes**
- Test configuration changes in development first
- Validate in staging before production
- Have rollback plans ready

---

This configuration system provides the flexibility and power needed for enterprise-scale testing while maintaining clarity and ease of use. The separation of concerns ensures that changes to one application or environment don't affect others, promoting stability and maintainability.