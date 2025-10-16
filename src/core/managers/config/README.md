# Configuration Management

This directory contains the enhanced configuration management system for the E2E test framework. It provides centralized, type-safe configuration for all applications with support for environment overrides and runtime switching.

## Overview

The configuration system is built on:
- **Type-safe schemas** using Zod for validation
- **Environment-based configuration** with cascading overrides
- **Runtime configuration switching** for dynamic test scenarios
- **Unified configuration management** across all applications

## Architecture

```
BaseConfig (abstract)
├── WebappConfig     - Web application configuration
├── AdminConfig      - Admin application configuration
└── McpConfig        - MCP platform configuration

ConfigManager (singleton)
└── Manages all application configs with runtime switching
```

## Usage

### Basic Usage

```typescript
import { getConfigManager } from './support/config';

// Get config manager instance
const configManager = getConfigManager();

// Get webapp configuration
const webappConfig = configManager.getConfig('webapp');
console.log(webappConfig.getBaseUrl()); // http://localhost:3001

// Get specific value
const apiUrl = configManager.getValue('webapp', 'app.apiUrl');

// Check if feature is enabled
const chatEnabled = webappConfig.isFeatureEnabled('chat');
```

### Environment Configuration

Configuration is loaded in the following order (later sources override earlier ones):
1. Default values in code
2. Configuration files: `config.json`, `config.{environment}.json`
3. Environment variables from `.env` files
4. Runtime overrides

### Environment Variables

#### Webapp Configuration
```bash
# App settings
WEBAPP_BASE_URL=http://localhost:3001
WEBAPP_PORT=3001
WEBAPP_API_URL=http://localhost:3001/api

# Auth settings
WEBAPP_DEFAULT_EMAIL=test@example.com
WEBAPP_DEFAULT_PASSWORD=TestPass123!

# Feature flags
WEBAPP_FEATURE_UPLOAD=true
WEBAPP_FEATURE_GENERATION=true
WEBAPP_FEATURE_CHAT=true

# Testing settings
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_SLOW_MO=0
PLAYWRIGHT_VIDEO=false
```

#### Admin Configuration
```bash
# App settings
ADMIN_BASE_URL=http://localhost:3001
ADMIN_PORT=3001
ADMIN_API_URL=http://localhost:3001/api/admin

# Auth settings
ADMIN_DEFAULT_EMAIL=admin@example.com
ADMIN_DEFAULT_PASSWORD=AdminPass123!
ADMIN_2FA_REQUIRED=false

# Security settings
ADMIN_IP_WHITELIST=127.0.0.1,192.168.1.0/24
ADMIN_REQUIRE_HTTPS=false

# Feature flags
ADMIN_FEATURE_USER_MGMT=true
ADMIN_FEATURE_MONITORING=true
ADMIN_FEATURE_BACKUP=true

# Testing
ADMIN_TEST_TIMEOUT=60000
```

#### MCP Configuration
```bash
# Server settings
MCP_BASE_URL=http://localhost:3010
MCP_PORT=3010

# Model providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
OLLAMA_URL=http://localhost:11434

# Knowledge base
CHROMA_URL=http://localhost:8000

# Tools
MCP_ENABLED_TOOLS=query_domain_knowledge,generate_test_case
MCP_RATE_LIMIT=true

# Testing
MCP_MOCK_MODELS=false
MCP_DETERMINISTIC=false
```

### Runtime Configuration

```typescript
// Override single value
configManager.override('webapp', 'testing.headless', false);

// Override multiple values
configManager.overrideMultiple([
  { app: 'webapp', path: 'testing.slowMo', value: 500 },
  { app: 'webapp', path: 'testing.video.enabled', value: true }
]);

// Apply preset
configManager.overrideMultiple(ConfigPresets.DEBUG_MODE);

// Switch environment
configManager.switchEnvironment('production');

// Reset configuration
configManager.reset('webapp'); // Reset specific app
configManager.reset(); // Reset all
```

### Configuration Snapshots

```typescript
// Create snapshot
configManager.createSnapshot('before-test');

// Make changes
configManager.override('webapp', 'features.chat.enabled', false);

// Restore snapshot
configManager.restoreSnapshot('before-test');
```

### Validation

```typescript
// Validate single config
const webappConfig = configManager.getConfig('webapp');
const validation = webappConfig.validate();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Validate all configs
const results = configManager.validateAll();
for (const [app, result] of Object.entries(results)) {
  if (!result.valid) {
    console.error(`${app} validation errors:`, result.errors);
  }
}
```

## Configuration Presets

The system includes predefined configuration presets for common scenarios:

- **LOCAL_DEVELOPMENT** - Optimized for local development with visible browser
- **CI_TESTING** - Optimized for CI environments with video/trace recording
- **PRODUCTION_TESTING** - Secure configuration for production testing
- **PERFORMANCE_TESTING** - Minimal overhead for performance tests
- **DEBUG_MODE** - Maximum visibility for debugging issues

```typescript
// Apply preset
configManager.overrideMultiple(ConfigPresets.CI_TESTING);
```

## Playwright Integration

```typescript
// Get Playwright config for webapp
const playwrightConfig = configManager.getPlaywrightConfig('webapp');

// Use in test configuration
export default defineConfig({
  ...playwrightConfig,
  projects: [
    {
      name: 'webapp',
      use: {
        ...playwrightConfig.use,
        baseURL: configManager.getValue('webapp', 'app.baseUrl')
      }
    }
  ]
});
```

## Test Usage

```typescript
import { test } from '@playwright/test';
import { getConfigManager } from './support/config';

test.beforeEach(async ({ page }) => {
  const config = getConfigManager();
  const webappConfig = config.getConfig('webapp');
  
  // Navigate to base URL
  await page.goto(webappConfig.getBaseUrl());
  
  // Use default credentials if available
  const creds = webappConfig.getDefaultCredentials();
  if (creds?.email && creds?.password) {
    // Auto-login logic
  }
});

test('feature flag test', async ({ page }) => {
  const config = getConfigManager();
  const webappConfig = config.getConfig('webapp');
  
  // Skip test if feature is disabled
  if (!webappConfig.isFeatureEnabled('chat')) {
    test.skip('Chat feature is disabled');
  }
  
  // Test chat feature
});
```

## Best Practices

1. **Use type-safe access methods** - Prefer `getConfig()` over `getValue()`
2. **Validate after updates** - Always validate configuration after runtime changes
3. **Use snapshots for complex scenarios** - Create snapshots before making multiple changes
4. **Apply presets for consistency** - Use configuration presets for common scenarios
5. **Document environment variables** - Keep `.env.example` files updated
6. **Avoid hardcoded values** - Always use configuration for URLs, timeouts, etc.

## Configuration Schema Reference

### WebappConfig Schema
- `app` - Application settings (name, URLs, environment)
- `auth` - Authentication settings (URLs, timeout, credentials)
- `features` - Feature flags for different functionalities
- `ui` - UI preferences (theme, animations, timeouts)
- `testing` - Test execution settings (headless, screenshots, etc.)

### AdminConfig Schema
- `app` - Application settings
- `auth` - Authentication with 2FA support
- `features` - Admin-specific features (user mgmt, monitoring, etc.)
- `security` - Security settings (IP whitelist, HTTPS, rate limiting)
- `monitoring` - Monitoring and alerting configuration
- `testing` - Admin-specific test settings

### McpConfig Schema
- `app` - Application settings
- `server` - MCP server configuration
- `models` - AI model provider configuration
- `tools` - MCP tools configuration
- `knowledge` - Knowledge base settings
- `sessions` - Session management
- `webhooks` - Webhook configuration
- `testing` - MCP-specific test settings