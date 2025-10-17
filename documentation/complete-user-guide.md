# Complete User Guide
**Comprehensive Guide to the Playwright E2E BDD Framework**

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites & System Requirements](#prerequisites--system-requirements)
3. [Installation & Setup](#installation--setup)
4. [Project Architecture](#project-architecture)
5. [Configuration Management](#configuration-management)
6. [Writing Tests](#writing-tests)
7. [Test Execution](#test-execution)
8. [Working with BDD Features](#working-with-bdd-features)
9. [Page Object Model](#page-object-model)
10. [Test Data Management](#test-data-management)
11. [API Testing](#api-testing)
12. [Reporting & Analysis](#reporting--analysis)
13. [CI/CD Integration](#cicd-integration)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)
16. [Advanced Topics](#advanced-topics)

---

## 🎯 Introduction

### What is This Framework?

The **Playwright E2E BDD Framework** is an enterprise-grade test automation solution designed for testing multiple applications in a scalable, maintainable way. It combines:

- **Playwright**: Modern browser automation with powerful testing capabilities
- **BDD (Behavior-Driven Development)**: Write tests in human-readable Gherkin syntax
- **TypeScript**: Type-safe code with excellent IDE support
- **Multi-Application Architecture**: Test multiple apps (WebApp, AdminApp, MCP Server) from one framework

### Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| 🎯 Multi-Application Support | Test multiple applications from one codebase | Centralized test management |
| 🥒 BDD Integration | Write tests in Gherkin (Given/When/Then) | Readable by non-technical stakeholders |
| 🌍 Environment Management | Dev, Staging, Production configs | Easy environment switching |
| 🔄 Parallel Execution | Run tests concurrently | Faster test execution |
| 📊 Comprehensive Reporting | HTML, JSON, JUnit, Custom reports | Multiple report formats for different needs |
| 🧪 Test Organization | UI, API, Integration test suites | Clear test categorization |
| 🎨 Page Object Model | Maintainable test architecture | Reusable components, easier maintenance |
| 🔧 Type-Safe | Full TypeScript support | Catch errors at compile time |
| 🚀 CI/CD Ready | Pre-configured for CI platforms | Easy automation pipeline integration |
| 📱 Cross-Browser Testing | Chrome, Firefox, Safari, Mobile | Comprehensive browser coverage |

### Who Should Use This Framework?

- **QA Engineers**: Writing and maintaining automated tests
- **Developers**: Running tests during development
- **DevOps Engineers**: Integrating tests into CI/CD pipelines
- **Product Managers**: Reading BDD scenarios to understand features
- **Technical Leads**: Architecting test strategies

---

## 📋 Prerequisites & System Requirements

### Required Software

#### Node.js and npm
- **Minimum Version**: Node.js 18.x or higher
- **Recommended**: Node.js 20.x LTS
- **Why**: Playwright and TypeScript require modern Node.js features

**Installation Check:**
```bash
# Check if Node.js is installed and version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher
```

**Installation (if needed):**
- **macOS**: `brew install node@20`
- **Windows**: Download from [nodejs.org](https://nodejs.org)
- **Linux**: Use your package manager or [nvm](https://github.com/nvm-sh/nvm)

#### TypeScript
- **Version**: 5.8.3 (included in dependencies)
- **Why**: Framework is written in TypeScript for type safety

#### Playwright
- **Version**: 1.54.1 (included in dependencies)
- **Why**: Core testing framework for browser automation

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4 GB | 8 GB+ |
| **Disk Space** | 2 GB | 5 GB+ |
| **Operating System** | macOS 11+, Windows 10+, Ubuntu 20.04+ | Latest stable versions |
| **Screen Resolution** | 1280x720 | 1920x1080+ |
| **Internet Connection** | Required for downloads | Stable broadband |

### Optional Tools

- **Git**: For version control
- **VS Code**: Recommended IDE with Playwright extension
- **Docker**: For containerized test execution
- **Chrome DevTools**: For debugging

---

## 🚀 Installation & Setup

### Step 1: Clone or Download the Repository

```bash
# If using Git (recommended)
git clone https://github.com/yourusername/playwright-e2e-bdd-framework-starter.git

# Navigate into the project directory
cd playwright-e2e-bdd-framework-starter

# Verify you're in the correct directory
ls -la
# You should see: config/, src/, tests/, features/, etc.
```

**Explanation of each command:**
- `git clone`: Downloads the entire project repository to your local machine
- `cd`: Changes your current directory to the project folder
- `ls -la`: Lists all files and folders to verify successful download

### Step 2: Install Project Dependencies

```bash
# Install all npm packages defined in package.json
npm install

# This downloads and installs:
# - Playwright and its dependencies
# - TypeScript compiler and types
# - Playwright-BDD for Gherkin support
# - Faker.js for test data generation
# - dotenv for environment variable management
# - ts-node for running TypeScript directly
```

**What happens during installation:**
1. npm reads `package.json` to understand what packages are needed
2. Downloads packages from npm registry
3. Creates `node_modules/` folder with all dependencies
4. Generates `package-lock.json` for version consistency

**Expected output:**
```bash
added 245 packages, and audited 246 packages in 45s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**If you see errors:**
- Ensure you have Node.js 18+ installed
- Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again
- Check your internet connection

### Step 3: Install Playwright Browsers

```bash
# Install browser binaries (Chromium, Firefox, WebKit)
npx playwright install

# Install with system dependencies (Linux only)
npx playwright install --with-deps
```

**Explanation:**
- `npx`: Executes packages from node_modules
- `playwright install`: Downloads browser binaries (~500MB)
- `--with-deps`: Installs OS-level dependencies (needed on Linux)

**What gets installed:**
- **Chromium**: Google Chrome's open-source version
- **Firefox**: Mozilla Firefox browser
- **WebKit**: Safari's rendering engine
- Browser drivers and dependencies

**Storage location:**
- macOS/Linux: `~/.cache/ms-playwright/`
- Windows: `%USERPROFILE%\AppData\Local\ms-playwright\`

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# Open .env in your editor
# macOS/Linux:
nano .env
# or
code .env  # If using VS Code

# Windows:
notepad .env
```

**Required .env configuration:**

```bash
# ===================================
# APPLICATION URLs
# ===================================
# These are the base URLs for each application you're testing
# Replace with your actual application URLs

# WebApp - Main user-facing application
UI_BASE_URL=http://localhost:3001

# AdminApp - Administrative dashboard
ADMIN_BASE_URL=http://localhost:3021

# MCP Server - API server for AI/ML operations
MCP_PLATFORM_URL=http://localhost:3002

# ===================================
# DATABASE Configuration
# ===================================
# Database connection for test data management

DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://user:password@localhost:5432/testdb

# ===================================
# TEST CONFIGURATION
# ===================================
# Control test behavior

# Run browsers in headless mode (no visible window)
HEADLESS=true

# Browser to use (chromium, firefox, webkit)
BROWSER=chromium

# Slow down operations by X milliseconds (0 = normal speed)
SLOW_MO=0

# ===================================
# CI/CD Settings
# ===================================
# Automatically detected in CI environments

CI=false
CROSS_BROWSER=false
MOBILE_TESTS=false
VIDEO=true
SCREENSHOT=true
TRACE=true

# ===================================
# ENVIRONMENT
# ===================================
# Which environment config to use (development, staging, production)
NODE_ENV=development
```

**Environment variable explanations:**

- `UI_BASE_URL`: Where your web application is running
- `HEADLESS`: When `true`, tests run without visible browser (faster)
- `SLOW_MO`: Adds delay between actions (useful for debugging)
- `NODE_ENV`: Determines which config file to use from `config/environments/`

### Step 5: Verify Installation

```bash
# Run the validation script
npm run framework:validate

# Or run a simple smoke test
npm run test:smoke
```

**Successful verification output:**
```bash
✅ Node.js version: 20.10.0
✅ npm version: 10.2.3
✅ Playwright installed: 1.54.1
✅ Browsers installed: Chromium, Firefox, WebKit
✅ Environment variables loaded
✅ Configuration files valid
✅ Test data accessible

🎉 Framework setup complete and ready to use!
```

### Step 6: IDE Setup (Recommended)

#### Visual Studio Code Setup

```bash
# Install VS Code extensions
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

**Extensions explained:**
- **Playwright Test**: Test runner integration, debugging, code generation
- **ESLint**: Code quality and style checking
- **Prettier**: Automatic code formatting

**VS Code Settings:**

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "playwright.env": {
    "NODE_ENV": "development"
  }
}
```

### Common Installation Issues & Solutions

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, run `npm cache clean --force`, then `npm install` |
| Playwright browser download fails | Check internet connection, try `npx playwright install --force` |
| Permission errors on Linux/Mac | Use `sudo npm install` (not recommended) or fix npm permissions |
| TypeScript errors | Ensure `typescript` is installed: `npm install -D typescript` |
| Cannot find module errors | Run `npm install` again, check `tsconfig.json` paths |

---

## 🏗️ Project Architecture

### Architectural Overview

The framework follows a **multi-layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│         TEST LAYER (tests/, features/)      │
│  BDD Scenarios & Traditional Playwright Tests│
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    APPLICATION LAYER (src/applications/)    │
│  Page Objects, API Clients, Workflows       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      CORE LAYER (src/core/)                 │
│  Base Classes, Managers, Utilities          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    CONFIGURATION LAYER (config/)            │
│  Environment & Application Configs          │
└─────────────────────────────────────────────┘
```

### Directory Structure Deep Dive

#### 1. `/config/` - Configuration Management

**Purpose**: Centralized configuration for all environments and applications

```
config/
├── applications/              # Application-specific settings
│   ├── webapp.config.ts       # WebApp configuration
│   ├── adminapp.config.ts     # AdminApp configuration
│   ├── mcp-server.config.ts   # MCP Server configuration
│   └── shared.config.ts       # Common framework settings
├── environments/              # Environment-specific settings
│   ├── dev.config.ts          # Development environment
│   ├── staging.config.ts      # Staging environment
│   └── prod.config.ts         # Production environment
├── playwright.config.ts       # Main Playwright configuration
└── playwright-bdd.config.js   # BDD-specific configuration
```

**How configuration works:**
1. Main `playwright.config.ts` imports environment and application configs
2. Environment is determined by `NODE_ENV` variable
3. Each application has its own feature flags and settings
4. Shared config applies to all applications

#### 2. `/src/` - Source Code

**Purpose**: All reusable code organized by application and functionality

```
src/
├── applications/              # Application-specific implementations
│   ├── webapp/               # WebApp code
│   │   ├── pages/            # WebApp page objects
│   │   ├── api/              # WebApp API clients
│   │   ├── components/       # WebApp UI components
│   │   └── workflows/        # WebApp business workflows
│   ├── adminapp/             # AdminApp code (same structure)
│   ├── mcp-server/           # MCP Server code (same structure)
│   └── shared/               # Shared across all apps
│       ├── pages/BasePage.ts
│       ├── api/BaseAPI.ts
│       └── helpers/          # Utility functions
├── core/                     # Core framework functionality
│   ├── base/                 # Base classes
│   │   ├── TestWorld.ts      # BDD test context
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── managers/             # State and config managers
│   │   ├── ConfigManager.ts
│   │   ├── TestDataManager.ts
│   │   └── ApplicationManager.ts
│   ├── utils/                # Utility functions
│   │   ├── APIHelper.ts
│   │   ├── DatabaseHelper.ts
│   │   └── playwrightLogger.ts
│   └── reporters/            # Custom test reporters
│       └── CustomReporter.ts
└── data/                     # Test data management
    ├── test-data/            # Static test data files
    ├── TestDataSeeder.ts     # Seed data into databases
    ├── DatabaseCleaner.ts    # Clean up test data
    └── ChromaDBSeeder.ts     # Vector database seeding
```

**Design principles:**
- **Separation by application**: Each app has its own directory
- **Shared components**: Common code in `/shared/` to avoid duplication
- **Core framework**: Reusable base classes and utilities
- **Single Responsibility**: Each file has one clear purpose

#### 3. `/tests/` - Test Files

**Purpose**: Traditional Playwright test files organized by application

```
tests/
├── webapp/                   # WebApp test suites
│   ├── ui/                   # UI tests
│   │   ├── login.spec.ts
│   │   ├── document-management.spec.ts
│   │   └── feature-generation.spec.ts
│   ├── api/                  # API tests
│   │   ├── authentication.spec.ts
│   │   └── documents-api.spec.ts
│   └── integration/          # Integration tests
│       └── user-workflow.spec.ts
├── adminapp/                 # AdminApp tests (same structure)
├── mcp-server/               # MCP Server tests (same structure)
└── cross-app/                # Cross-application workflows
    └── document-processing.spec.ts
```

**Test file naming convention:**
- `*.spec.ts`: Playwright test specification files
- Descriptive names indicating what is being tested
- Organized by feature or functionality

#### 4. `/features/` - BDD Feature Files

**Purpose**: Gherkin feature files for BDD testing

```
features/
├── webapp/                   # WebApp BDD scenarios
│   ├── ui/                   # UI scenarios
│   │   ├── login.feature
│   │   ├── document-management.feature
│   │   └── navigation.feature
│   ├── api/                  # API scenarios
│   └── integration/          # Integration scenarios
├── adminapp/                 # AdminApp scenarios
├── mcp-server/               # MCP Server scenarios
├── cross-app/                # Cross-application scenarios
│   └── document-to-feature.feature
└── steps/                    # Step definitions
    ├── fixtures.ts           # Test fixtures
    ├── shared/
    │   └── common-steps.ts   # Reusable steps
    └── webapp/
        └── navigation-steps.ts
```

**Feature file example:**
```gherkin
@webapp @smoke @critical
Feature: User Login
  As a webapp user
  I want to log in to my account
  So that I can access my personalized features

  Background:
    Given the webapp is accessible
    And I am on the login page

  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123"
    And I click the "Login" button
    Then I should see the dashboard
    And I should see "Welcome back, Test User"
    And the session should be active

  Scenario Outline: Failed login with invalid credentials
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the "Login" button
    Then I should see an error message "<error>"
    And I should remain on the login page

    Examples:
      | username           | password  | error                      |
      | invalid@test.com   | wrong123  | Invalid credentials        |
      | test@example.com   |           | Password is required       |
      |                    | pass123   | Username is required       |
```

#### 5. `/reports/` - Test Reports

**Purpose**: Generated test execution reports

```
reports/
├── webapp/                   # WebApp-specific reports
│   ├── html-report/
│   ├── results.json
│   └── junit-results.xml
├── adminapp/                 # AdminApp reports
├── mcp-server/               # MCP Server reports
└── combined/                 # Combined reports
    ├── html-report/          # HTML report for all tests
    ├── results.json          # JSON results
    ├── junit-results.xml     # JUnit XML for CI
    └── artifacts/            # Screenshots, videos, traces
```

#### 6. `/documentation/` - Framework Documentation

**Purpose**: Comprehensive documentation for framework users

```
documentation/
├── complete-user-guide.md    # This comprehensive guide
├── folder-structure.md       # Project organization details
├── configuration-guide.md    # Configuration reference
├── test-execution.md         # Running and managing tests
├── bdd-testing.md           # BDD development guide
├── development-workflow.md   # Best practices
├── api-reference.md         # API documentation
└── troubleshooting.md       # Common issues & solutions
```

### Architecture Patterns

#### 1. Page Object Model (POM)

**Purpose**: Encapsulate page interactions in reusable classes

```typescript
// Example: src/applications/webapp/pages/DocumentHubPage.ts
export class DocumentHubPage extends BasePage {
  // Locators - define once, use everywhere
  private readonly uploadButton = this.page.locator('[data-testid="upload-btn"]');
  private readonly documentList = this.page.locator('.document-list');
  private readonly searchInput = this.page.locator('input[type="search"]');
  
  // Page actions - high-level operations
  async uploadDocument(filePath: string) {
    await this.uploadButton.click();
    await this.page.setInputFiles('input[type="file"]', filePath);
    await this.waitForUploadComplete();
  }
  
  async searchDocuments(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForSearchResults();
  }
  
  // Assertions - verification methods
  async verifyDocumentExists(documentName: string) {
    const document = this.documentList.locator(`text=${documentName}`);
    await expect(document).toBeVisible();
  }
}
```

**Benefits:**
- **Maintainability**: Changes to UI only require updates in one place
- **Reusability**: Page objects used across multiple tests
- **Readability**: Tests read like business requirements
- **Abstraction**: Hide complex interactions behind simple methods

#### 2. API Client Pattern

**Purpose**: Encapsulate API interactions

```typescript
// Example: src/applications/webapp/api/WebappAPI.ts
export class WebappAPI extends BaseAPI {
  // Document operations
  async createDocument(data: DocumentData): Promise<Document> {
    const response = await this.request.post('/api/documents', { data });
    return response.json();
  }
  
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    const params = this.buildQueryParams(filters);
    const response = await this.request.get(`/api/documents${params}`);
    return response.json();
  }
  
  async deleteDocument(documentId: string): Promise<void> {
    await this.request.delete(`/api/documents/${documentId}`);
  }
}
```

#### 3. Workflow Pattern

**Purpose**: Encapsulate complex multi-step business processes

```typescript
// Example: src/applications/webapp/workflows/DocumentToFeatureWorkflow.ts
export class DocumentToFeatureWorkflow extends BaseWorkflow {
  async executeFullWorkflow(documentPath: string): Promise<FeatureResult> {
    // Step 1: Upload document
    const document = await this.uploadDocument(documentPath);
    
    // Step 2: Process document
    await this.processDocument(document.id);
    
    // Step 3: Generate feature
    const feature = await this.generateFeature(document.id);
    
    // Step 4: Validate feature
    await this.validateFeature(feature.id);
    
    return feature;
  }
}
```

---

## ⚙️ Configuration Management

### Configuration Hierarchy

The framework uses a **layered configuration system**:

1. **Shared Config** (`shared.config.ts`): Common settings for all apps
2. **Application Config** (e.g., `webapp.config.ts`): App-specific settings
3. **Environment Config** (e.g., `dev.config.ts`): Environment-specific settings
4. **Main Playwright Config** (`playwright.config.ts`): Orchestrates everything
5. **Environment Variables** (`.env`): Runtime overrides

### Configuration Loading Process

```
 ┌────────────┐
 │ .env file  │ ← Load environment variables
 └──────┬─────┘
        │
 ┌──────▼────────────┐
 │ NODE_ENV variable │ ← Determine environment
 └──────┬────────────┘
        │
 ┌──────▼─────────────────┐
 │ Environment Config     │ ← Load dev/staging/prod config
 │ (dev/staging/prod.ts)  │
 └──────┬─────────────────┘
        │
 ┌──────▼──────────────────┐
 │ Application Configs     │ ← Load app-specific configs
 │ (webapp/admin/mcp.ts)   │
 └──────┬──────────────────┘
        │
 ┌──────▼───────────────────┐
 │ Shared Config            │ ← Load common settings
 │ (shared.config.ts)       │
 └──────┬───────────────────┘
        │
 ┌──────▼──────────────────┐
 │ Playwright Config        │ ← Final merged configuration
 │ (playwright.config.ts)   │
 └─────────────────────────┘
```

### Shared Configuration

**File**: `config/applications/shared.config.ts`

**Purpose**: Settings common to all applications

```typescript
export interface SharedConfig {
  // Browser settings
  browser: {
    headless: boolean;        // Run without visible browser
    slowMo: number;           // Delay between actions (ms)
    devtools: boolean;        // Open browser DevTools
  };
  
  // Screenshot settings
  screenshots: {
    mode: 'off' | 'only-on-failure' | 'on';
    quality: number;          // 0-100
  };
  
  // Video recording settings
  video: {
    mode: 'off' | 'on' | 'retain-on-failure';
    size: { width: number; height: number };
  };
  
  // Trace recording settings
  trace: {
    mode: 'off' | 'on' | 'retain-on-failure';
  };
  
  // Parallel execution settings
  parallel: {
    workers: number;          // Number of parallel workers
    fullyParallel: boolean;   // Run tests in parallel
  };
}

export const sharedConfig: SharedConfig = {
  browser: {
    headless: process.env.HEADLESS !== 'false',  // Default: true
    slowMo: Number(process.env.SLOW_MO) || 0,
    devtools: false,
  },
  
  screenshots: {
    mode: 'only-on-failure',  // Save screenshots only when tests fail
    quality: 90,
  },
  
  video: {
    mode: 'retain-on-failure',  // Keep videos only for failed tests
    size: { width: 1280, height: 720 },
  },
  
  trace: {
    mode: 'retain-on-failure',  // Keep traces for debugging failures
  },
  
  parallel: {
    workers: process.env.CI ? 2 : 4,  // Less workers in CI environment
    fullyParallel: true,
  }
};
```

### Application Configuration

**File**: `config/applications/webapp.config.ts`

**Purpose**: WebApp-specific settings and feature flags

```typescript
export interface WebappConfig {
  baseUrl: string;            // Application base URL
  timeout: number;            // Default timeout (ms)
  retries: number;            // Number of retries on failure
  
  // Feature flags - control which features to test
  features: {
    documentManagement: boolean;
    featureGeneration: boolean;
    globalChat: boolean;
  };
  
  // Authentication configuration
  authentication: {
    enabled: boolean;
    providers: string[];      // Available auth providers
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

**How to use feature flags in tests:**

```typescript
import { webappConfig } from '../config/applications/webapp.config';

// Skip test if feature is disabled
test.skip(
  !webappConfig.features.globalChat,
  'Global chat feature is disabled'
);

test('global chat functionality', async ({ page }) => {
  // This test only runs if globalChat feature flag is true
  // Test implementation...
});
```

### Environment Configuration

**File**: `config/environments/dev.config.ts`

**Purpose**: Development environment settings

```typescript
export const devConfig = {
  environment: 'development',
  debug: true,                // Enable debug logging
  
  // Application URLs for development
  webapp: {
    baseUrl: 'http://localhost:3001',
    timeout: 60000,           // Longer timeout for debugging
  },
  
  adminapp: {
    baseUrl: 'http://localhost:3021',
    timeout: 60000,
  },
  
  mcpServer: {
    baseUrl: 'http://localhost:3002',
    timeout: 30000,
  },
  
  // Database configuration
  database: {
    host: 'localhost',
    port: 5432,
    cleanupAfterTests: false, // Keep data for debugging
  },
  
  // Logging configuration
  logging: {
    level: 'debug',           // Verbose logging
    console: true,            // Log to console
    file: false,              // Don't save logs to file
  },
  
  // Test execution settings
  retries: 0,                 // No retries (fail fast)
  parallel: {
    workers: 1,               // Sequential execution for debugging
  }
};
```

**File**: `config/environments/staging.config.ts`

**Purpose**: Staging environment settings

```typescript
export const stagingConfig = {
  environment: 'staging',
  debug: false,
  
  // Staging URLs (from environment variables)
  webapp: {
    baseUrl: process.env.STAGING_UI_BASE_URL || 'https://staging.example.com',
    timeout: 30000,
  },
  
  adminapp: {
    baseUrl: process.env.STAGING_ADMIN_BASE_URL || 'https://admin-staging.example.com',
    timeout: 30000,
  },
  
  mcpServer: {
    baseUrl: process.env.STAGING_MCP_PLATFORM_URL || 'https://mcp-staging.example.com',
    timeout: 15000,
  },
  
  database: {
    host: process.env.STAGING_DB_HOST,
    port: Number(process.env.STAGING_DB_PORT) || 5432,
    cleanupAfterTests: true,  // Clean up test data
  },
  
  logging: {
    level: 'info',
    console: true,
    file: true,               // Save logs to file
  },
  
  retries: 2,                 // Retry failed tests
  parallel: {
    workers: 4,               // Parallel execution
  }
};
```

### Main Playwright Configuration

**File**: `config/playwright.config.ts`

**Purpose**: Orchestrate all configurations and define test projects

```typescript
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { webappConfig } from './applications/webapp.config';
import { adminappConfig } from './applications/adminapp.config';
import { mcpServerConfig } from './applications/mcp-server.config';
import { sharedConfig } from './applications/shared.config';

// Dynamically load environment configuration
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

const envConfig = getEnvironmentConfig();

// Configure BDD
const testDir = defineBddConfig({
  featuresRoot: path.resolve(__dirname, '..', 'features'),
  steps: path.resolve(__dirname, '..', 'features', 'steps', '**', '*.ts'),
});

export default defineConfig({
  testDir: testDir,
  timeout: 30000,             // Default test timeout
  expect: {
    timeout: 10000,           // Assertion timeout
  },
  
  // Parallel execution settings
  fullyParallel: sharedConfig.parallel.fullyParallel,
  forbidOnly: !!process.env.CI,  // Prevent .only() in CI
  retries: envConfig.retries,
  workers: envConfig.parallel?.workers || sharedConfig.parallel.workers,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never', outputFolder: '../reports/combined/html-report' }],
    ['json', { outputFile: '../reports/combined/results.json' }],
    ['junit', { outputFile: '../reports/combined/junit-results.xml' }],
    ['../src/core/reporters/CustomReporter.ts']
  ],
  
  // Default test settings
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
  
  // Test projects - different test suites
  projects: [
    // BDD Projects
    {
      name: 'bdd-webapp-smoke',
      testMatch: ['.features-gen/webapp/**/*.spec.js'],
      grep: /@smoke/,           // Only run @smoke tagged scenarios
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    {
      name: 'bdd-webapp-regression',
      testMatch: ['.features-gen/webapp/**/*.spec.js'],
      grep: /@regression/,      // Only run @regression tagged scenarios
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: envConfig.webapp.baseUrl
      },
    },
    
    // Playwright Test Projects
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
  ],
  
  // Global setup and teardown
  globalSetup: '../src/core/base/global-setup.ts',
  globalTeardown: '../src/core/base/global-teardown.ts',
});
```

### Using Configuration in Tests

#### Accessing configuration values

```typescript
// Import the configuration you need
import { webappConfig } from '../config/applications/webapp.config';
import { devConfig } from '../config/environments/dev.config';

test('configuration usage example', async ({ page }) => {
  // Use base URL from config
  await page.goto(webappConfig.baseUrl);
  
  // Use timeout from config
  await page.waitForSelector('.element', { 
    timeout: webappConfig.timeout 
  });
  
  // Conditional logic based on feature flags
  if (webappConfig.features.documentManagement) {
    // Test document management features
  }
});
```

#### Overriding configuration at runtime

```bash
# Override base URL
UI_BASE_URL=https://test.example.com npm run test

# Override environment
NODE_ENV=staging npm run test

# Override multiple values
HEADLESS=false SLOW_MO=500 npm run test:smoke
```

### Configuration Best Practices

1. **Never hardcode URLs or credentials**: Always use environment variables
2. **Use feature flags**: Enable/disable features for testing
3. **Environment-specific settings**: Optimize for each environment
4. **Type safety**: Use TypeScript interfaces for configuration
5. **Documentation**: Comment complex configuration options
6. **Validation**: Validate configuration on startup
7. **Defaults**: Provide sensible default values
8. **Security**: Never commit sensitive data in configuration files

---

## ✍️ Writing Tests

### Test Structure

Every test follows this general structure:

```typescript
import { test, expect } from '@playwright/test';

// Test suite (describe block)
test.describe('Feature Name', () => {
  
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    // Setup steps...
  });
  
  // Individual test case
  test('should do something specific', async ({ page }) => {
    // 1. Arrange - Set up test data and state
    // 2. Act - Perform the action being tested
    // 3. Assert - Verify the expected outcome
  });
  
  // Cleanup after each test
  test.afterEach(async ({ page }) => {
    // Cleanup steps...
  });
});
```

### Writing UI Tests

**Location**: `tests/webapp/ui/`

**Example**: Login test

```typescript
// tests/webapp/ui/login.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../../../src/applications/webapp/pages/HomePage';
import { LoginPage } from '../../../src/applications/webapp/pages/LoginPage';

test.describe('User Login', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  
  // Run before each test in this suite
  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    
    // Navigate to application
    await homePage.navigate();
    
    // Navigate to login page
    await loginPage.navigate();
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange: Prepare test data
    const email = 'testuser@example.com';
    const password = 'SecurePass123';
    
    // Act: Perform login
    await loginPage.login(email, password);
    
    // Assert: Verify successful login
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Additional assertion
    const welcomeMessage = page.locator('.welcome-message');
    await expect(welcomeMessage).toContainText('Welcome back');
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const email = 'invalid@example.com';
    const password = 'WrongPassword';
    
    // Act
    await loginPage.login(email, password);
    
    // Assert
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid credentials');
    
    // Verify still on login page
    await expect(page).toHaveURL(/login/);
  });
  
  test('should require all fields', async ({ page }) => {
    // Act: Try to submit without filling fields
    await loginPage.clickLoginButton();
    
    // Assert: Check validation messages
    await expect(page.locator('#email-error')).toHaveText('Email is required');
    await expect(page.locator('#password-error')).toHaveText('Password is required');
  });
  
  test('should toggle password visibility', async ({ page }) => {
    // Arrange
    const passwordInput = page.locator('#password');
    const toggleButton = page.locator('[data-testid="toggle-password"]');
    
    // Act: Enter password
    await passwordInput.fill('MyPassword123');
    
    // Assert: Password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Act: Click toggle
    await toggleButton.click();
    
    // Assert: Password is visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
  
  test.afterEach(async ({ page }) => {
    // Cleanup: Clear session if logged in
    await page.evaluate(() => localStorage.clear());
  });
});
```

### Writing API Tests

**Location**: `tests/webapp/api/`

**Example**: User API test

```typescript
// tests/webapp/api/users-api.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Users API', () => {
  const baseURL = process.env.UI_BASE_URL || 'http://localhost:3001';
  let authToken: string;
  let createdUserId: string;
  
  // Setup: Get authentication token
  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: 'admin@example.com',
        password: 'AdminPass123'
      }
    });
    
    const body = await response.json();
    authToken = body.token;
  });
  
  test('should create a new user', async ({ request }) => {
    // Arrange: Generate test data
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'TempPass123',
      role: 'user'
    };
    
    // Act: Send POST request
    const response = await request.post(`${baseURL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: userData
    });
    
    // Assert: Check response
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.email).toBe(userData.email);
    expect(body.name).toBe(userData.name);
    
    // Save for cleanup
    createdUserId = body.id;
  });
  
  test('should get user by ID', async ({ request }) => {
    // Arrange: Use previously created user
    expect(createdUserId).toBeDefined();
    
    // Act: Send GET request
    const response = await request.get(`${baseURL}/api/users/${createdUserId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Assert
    expect(response.ok()).toBeTruthy();
    
    const user = await response.json();
    expect(user.id).toBe(createdUserId);
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
  });
  
  test('should update user', async ({ request }) => {
    // Arrange
    const updateData = {
      name: 'Updated Name'
    };
    
    // Act
    const response = await request.patch(`${baseURL}/api/users/${createdUserId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: updateData
    });
    
    // Assert
    expect(response.ok()).toBeTruthy();
    
    const updatedUser = await response.json();
    expect(updatedUser.name).toBe(updateData.name);
  });
  
  test('should delete user', async ({ request }) => {
    // Act
    const response = await request.delete(`${baseURL}/api/users/${createdUserId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);
    
    // Verify user is deleted
    const getResponse = await request.get(`${baseURL}/api/users/${createdUserId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(getResponse.status()).toBe(404);
  });
  
  test('should return 401 without authentication', async ({ request }) => {
    // Act: Send request without auth token
    const response = await request.get(`${baseURL}/api/users`);
    
    // Assert
    expect(response.status()).toBe(401);
  });
});
```

### Writing Integration Tests

**Location**: `tests/webapp/integration/`

**Example**: End-to-end user workflow

```typescript
// tests/webapp/integration/user-workflow.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../../../src/applications/webapp/pages/HomePage';
import { LoginPage } from '../../../src/applications/webapp/pages/LoginPage';
import { DocumentHubPage } from '../../../src/applications/webapp/pages/DocumentHubPage';
import { FeatureGeneratorPage } from '../../../src/applications/webapp/pages/FeatureGeneratorPage';

test.describe('Complete User Workflow', () => {
  
  test('should complete document to feature workflow', async ({ page }) => {
    // Step 1: Login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('testuser@example.com', 'SecurePass123');
    
    // Verify logged in
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Step 2: Upload Document
    const documentHub = new DocumentHubPage(page);
    await documentHub.navigate();
    
    const testDocumentPath = 'test-data/files/sample-document.pdf';
    await documentHub.uploadDocument(testDocumentPath);
    
    // Verify upload success
    await expect(page.locator('.upload-success')).toBeVisible();
    
    // Step 3: Navigate to Feature Generator
    const featureGenerator = new FeatureGeneratorPage(page);
    await featureGenerator.navigate();
    
    // Step 4: Generate Feature from Document
    await featureGenerator.selectDocument('sample-document.pdf');
    await featureGenerator.generateFeature();
    
    // Wait for generation (may take time)
    await page.waitForSelector('.feature-generated', { timeout: 60000 });
    
    // Step 5: Verify Generated Feature
    const featureContent = await featureGenerator.getFeatureContent();
    expect(featureContent).toContain('Feature:');
    expect(featureContent).toContain('Scenario:');
    
    // Step 6: Save Feature
    await featureGenerator.saveFeature('generated-feature.feature');
    
    // Verify save success
    await expect(page.locator('.save-success')).toBeVisible();
    await expect(page.locator('.save-success')).toContainText('Feature saved successfully');
    
    // Step 7: Verify Feature in List
    await documentHub.navigate();
    await expect(page.locator('text=generated-feature.feature')).toBeVisible();
  });
});
```

### Test Organization Best Practices

#### 1. File Organization

```
tests/
└── webapp/
    ├── ui/
    │   ├── auth/              # Group related tests
    │   │   ├── login.spec.ts
    │   │   ├── logout.spec.ts
    │   │   └── registration.spec.ts
    │   ├── documents/
    │   │   ├── upload.spec.ts
    │   │   ├── search.spec.ts
    │   │   └── download.spec.ts
    │   └── features/
    │       ├── generation.spec.ts
    │       └── editing.spec.ts
    ├── api/
    └── integration/
```

#### 2. Naming Conventions

- **Test Files**: `feature-name.spec.ts`
- **Test Suites**: Descriptive `test.describe('Feature Name')`
- **Test Cases**: Start with `should...` verb
  - ✅ `should login successfully with valid credentials`
  - ❌ `login test`

#### 3. Test Independence

Each test should be independent and not rely on other tests:

```typescript
// ❌ BAD: Tests depend on each other
let userId: string;

test('create user', async () => {
  userId = await createUser();
});

test('update user', async () => {
  await updateUser(userId); // Fails if previous test fails
});

// ✅ GOOD: Independent tests
test('create user', async () => {
  const userId = await createUser();
  expect(userId).toBeDefined();
});

test('update user', async () => {
  const userId = await createUser(); // Create its own user
  await updateUser(userId);
});
```

#### 4. Descriptive Assertions

```typescript
// ❌ BAD: Unclear what's being tested
expect(result).toBe(true);

// ✅ GOOD: Clear assertion
expect(loginButton).toBeEnabled();
expect(errorMessage).toContainText('Invalid credentials');
```

#### 5. Use Test Tags

```typescript
test('should load homepage quickly @smoke @performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});

// Run with: npx playwright test --grep "@smoke"
```

### Common Test Patterns

#### Pattern 1: Retry Failed Actions

```typescript
async function retryAction(action: () => Promise<void>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await action();
      return; // Success
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000); // Wait before retry
    }
  }
}

test('flaky element interaction', async ({ page }) => {
  await retryAction(async () => {
    await page.click('.sometimes-not-ready-button');
  });
});
```

#### Pattern 2: Wait for Multiple Conditions

```typescript
async function waitForMultipleConditions(page: Page, conditions: Array<() => Promise<void>>) {
  await Promise.all(conditions.map(condition => condition()));
}

test('complex page load', async ({ page }) => {
  await page.goto('/dashboard');
  
  await waitForMultipleConditions(page, [
    () => page.waitForSelector('.header'),
    () => page.waitForSelector('.sidebar'),
    () => page.waitForResponse(resp => resp.url().includes('/api/user')),
  ]);
});
```

#### Pattern 3: Custom Test Fixtures

```typescript
// tests/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../src/applications/webapp/pages/LoginPage';

export const test = base.extend<{ 
  authenticatedPage: Page;
  loginPage: LoginPage;
}>({
  // Fixture that provides authenticated page
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('testuser@example.com', 'SecurePass123');
    await use(page);
  },
  
  // Fixture that provides login page
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

// Usage in tests
test('authenticated user can access dashboard', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await expect(authenticatedPage.locator('.dashboard')).toBeVisible();
});
```

---

## 🚀 Test Execution

### Running Tests - Quick Reference

```bash
# Basic commands
npm test                          # Run default smoke tests
npm run test:all                  # Run all tests
npm run test:smoke                # Run smoke tests only
npm run test:regression           # Run regression tests

# Application-specific
npm run test:webapp:ui            # WebApp UI tests
npm run test:webapp:api           # WebApp API tests
npm run test:adminapp:ui          # AdminApp UI tests
npm run test:mcp:api              # MCP Server API tests
npm run test:cross-app            # Cross-application tests

# BDD tests
npm run bdd:generate              # Generate tests from features
npm run test:bdd:all              # Run all BDD tests
npm run bdd:webapp                # WebApp BDD tests
npm run bdd:adminapp              # AdminApp BDD tests

# Development modes
npm run test:headed               # Run with visible browser
npm run test:debug                # Run in debug mode
npm run test:ui                   # Interactive mode

# Reports
npm run test:report               # View HTML report
npm run test:custom-report        # View custom report
```

### Environment-Specific Execution

**Development Environment (default):**
```bash
# Explicitly set development
NODE_ENV=development npm run test

# Development characteristics:
# - Longer timeouts for debugging
# - No test retries (fail fast)
# - Sequential execution (1 worker)
# - Verbose logging
# - Test data preserved
```

**Staging Environment:**
```bash
# Run tests against staging
NODE_ENV=staging npm run test:all

# Staging characteristics:
# - Production-like environment
# - Moderate retry policies (2 retries)
# - Parallel execution (4 workers)
# - Test data cleanup enabled
# - Comprehensive logging
```

**Production Environment:**
```bash
# Run smoke tests on production (read-only)
NODE_ENV=production npm run test:smoke

# Production characteristics:
# - Fast timeouts
# - Higher retry counts (3 retries)
# - Maximum parallelism (6 workers)
# - Read-only operations only
# - Minimal logging
```

### Test Filtering and Selection

```bash
# Run specific test file
npx playwright test tests/webapp/ui/login.spec.ts --config=config/playwright.config.ts

# Run tests matching a pattern
npx playwright test --config=config/playwright.config.ts --grep "login"

# Run tests with specific tag
npx playwright test --config=config/playwright.config.ts --grep "@smoke"

# Exclude tests with tag
npx playwright test --config=config/playwright.config.ts --grep-invert "@slow"

# Run specific project
npx playwright test --config=config/playwright.config.ts --project=webapp-ui

# Run multiple projects
npx playwright test --config=config/playwright.config.ts --project=webapp-ui --project=webapp-api
```

### Parallel Execution Control

```bash
# Control number of parallel workers
npx playwright test --config=config/playwright.config.ts --workers=4

# Maximum parallelism (use all CPU cores)
npx playwright test --config=config/playwright.config.ts --workers=100%

# Sequential execution (no parallelism) - useful for debugging
npx playwright test --config=config/playwright.config.ts --workers=1

# Test sharding (distribute tests across machines)
npx playwright test --config=config/playwright.config.ts --shard=1/3  # Machine 1
npx playwright test --config=config/playwright.config.ts --shard=2/3  # Machine 2
npx playwright test --config=config/playwright.config.ts --shard=3/3  # Machine 3
```

### Cross-Browser Testing

```bash
# Enable cross-browser testing
CROSS_BROWSER=true npm run test:smoke

# This runs tests on: Chromium, Firefox, and WebKit

# Run on specific browser
npx playwright test --config=config/playwright.config.ts --project=webapp-firefox
npx playwright test --config=config/playwright.config.ts --project=webapp-webkit

# Run on all browsers
npx playwright test --config=config/playwright.config.ts --project=webapp-chromium --project=webapp-firefox --project=webapp-webkit
```

### Mobile Testing

```bash
# Enable mobile testing
MOBILE_TESTS=true npm run test:webapp:ui

# Run on specific mobile device
npx playwright test --config=config/playwright.config.ts --project=webapp-mobile-chrome
npx playwright test --config=config/playwright.config.ts --project=webapp-mobile-safari
```

### Debugging Tests

**Interactive Debug Mode:**
```bash
# Opens Playwright Inspector for step-by-step debugging
npm run test:debug

# Debug specific test file
npx playwright test tests/webapp/ui/login.spec.ts --debug
```

**Headed Mode (visible browser):**
```bash
# Run tests with visible browser
npm run test:headed

# Or set environment variable
HEADLESS=false npm run test
```

**Slow Motion:**
```bash
# Slow down test execution by 1000ms per action
SLOW_MO=1000 npm run test

# Useful for watching test execution
HEADLESS=false SLOW_MO=500 npm run test:smoke
```

**Verbose Logging:**
```bash
# Enable Playwright API logging
DEBUG=pw:api npm run test

# Enable all Playwright logging
DEBUG=pw:* npm run test

# Enable custom framework logging
DEBUG=app:* npm run test
```

---

## 🥒 Working with BDD Features

### BDD Feature Structure

BDD features are written in **Gherkin syntax**, a human-readable language for describing software behavior.

**Basic Gherkin Syntax:**

```gherkin
@tag1 @tag2
Feature: Feature Name
  As a [role]
  I want to [action]
  So that [benefit]
  
  Background:
    Given [common setup step]
    
  @scenario-tag
  Scenario: Scenario description
    Given [context/precondition]
    When [action/event]
    Then [expected outcome]
    And [additional outcome]
    But [exceptional outcome]
    
  Scenario Outline: Parameterized scenario
    Given I have "<input>"
    When I perform "<action>"
    Then I should see "<result>"
    
    Examples:
      | input | action | result |
      | A     | X      | 1      |
      | B     | Y      | 2      |
```

### Creating BDD Feature Files

**Location**: `features/{application}/{test-type}/`

**Example**: Login feature

```gherkin
# features/webapp/ui/login.feature

@webapp @authentication @smoke
Feature: User Authentication
  As a webapp user
  I want to log in to my account
  So that I can access personalized features and content
  
  Background:
    Given the webapp is accessible at "http://localhost:3001"
    And I am on the login page
    
  @critical @happy-path
  Scenario: Successful login with valid credentials
    Given I have a valid user account
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123"
    And I click the "Login" button
    Then I should be redirected to the dashboard
    And I should see "Welcome back, Test User"
    And the user menu should display my profile picture
    And the session should be active for 30 minutes
    
  @negative-test
  Scenario: Failed login with invalid password
    When I enter username "testuser@example.com"
    And I enter password "WrongPassword"
    And I click the "Login" button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
    And the password field should be cleared
    And the login button should remain enabled
    
  @validation @negative-test
  Scenario Outline: Field validation on login form
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the "Login" button
    Then I should see validation error "<error_message>"
    And I should remain on the login page
    
    Examples:
      | username              | password      | error_message                    |
      |                       | SecurePass123 | Username is required             |
      | testuser@example.com  |               | Password is required             |
      | invalid-email         | SecurePass123 | Please enter a valid email       |
      | test                  | 123           | Password must be at least 8 chars|
      
  @security
  Scenario: Account lockout after multiple failed attempts
    Given I am on the login page
    When I enter username "testuser@example.com"
    And I attempt login with wrong password 5 times
    Then I should see error "Account locked due to multiple failed attempts"
    And the login form should be disabled
    And I should see "Please contact support or try again in 30 minutes"
    
  @accessibility
  Scenario: Login form should be keyboard accessible
    Given I am on the login page
    When I navigate using only keyboard Tab and Enter keys
    Then I should be able to focus on username field
    And I should be able to focus on password field
    And I should be able to focus on login button
    And I should be able to submit the form with Enter key
```

### Writing Step Definitions

Step definitions connect Gherkin steps to actual test code.

**Location**: `features/steps/`

**Example**: Login step definitions

```typescript
// features/steps/webapp/login-steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../../src/applications/webapp/pages/LoginPage';
import { DashboardPage } from '../../../src/applications/webapp/pages/DashboardPage';

// Given steps - Set up context/preconditions
Given('the webapp is accessible at {string}', async function(url: string) {
  // 'this' refers to test world/context
  await this.page.goto(url);
  await expect(this.page).toHaveURL(url);
});

Given('I am on the login page', async function() {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.navigate();
  await this.loginPage.waitForPageLoad();
});

Given('I have a valid user account', async function() {
  // Store test user credentials in world context
  this.testUser = {
    username: 'testuser@example.com',
    password: 'SecurePass123',
    name: 'Test User'
  };
});

// When steps - Perform actions
When('I enter username {string}', async function(username: string) {
  await this.loginPage.enterUsername(username);
});

When('I enter password {string}', async function(password: string) {
  await this.loginPage.enterPassword(password);
});

When('I click the {string} button', async function(buttonText: string) {
  await this.loginPage.clickButton(buttonText);
});

When('I attempt login with wrong password {int} times', async function(attempts: number) {
  for (let i = 0; i < attempts; i++) {
    await this.loginPage.enterUsername(this.testUser.username);
    await this.loginPage.enterPassword('WrongPassword');
    await this.loginPage.clickLoginButton();
    await this.page.waitForTimeout(500); // Wait between attempts
  }
});

When('I navigate using only keyboard Tab and Enter keys', async function() {
  // Test keyboard navigation
  await this.page.keyboard.press('Tab');  // Focus username
  await this.page.keyboard.type('test@example.com');
  await this.page.keyboard.press('Tab');  // Focus password
  await this.page.keyboard.type('password123');
  await this.page.keyboard.press('Tab');  // Focus button
  // Don't press Enter yet - just navigation
});

// Then steps - Verify outcomes
Then('I should be redirected to the dashboard', async function() {
  this.dashboardPage = new DashboardPage(this.page);
  await this.dashboardPage.waitForPageLoad();
  await expect(this.page).toHaveURL(/dashboard/);
});

Then('I should see {string}', async function(text: string) {
  const element = this.page.locator(`text=${text}`);
  await expect(element).toBeVisible();
});

Then('I should see an error message {string}', async function(errorMessage: string) {
  const errorElement = this.page.locator('[data-testid="error-message"]');
  await expect(errorElement).toBeVisible();
  await expect(errorElement).toContainText(errorMessage);
});

Then('I should remain on the login page', async function() {
  await expect(this.page).toHaveURL(/login/);
});

Then('the user menu should display my profile picture', async function() {
  const profilePic = this.page.locator('[data-testid="user-profile-picture"]');
  await expect(profilePic).toBeVisible();
});

Then('the session should be active for {int} minutes', async function(minutes: number) {
  // Check session cookie or localStorage
  const sessionData = await this.page.evaluate(() => {
    return localStorage.getItem('session');
  });
  expect(sessionData).toBeTruthy();
  
  // Verify session expiry time
  const session = JSON.parse(sessionData);
  const expectedExpiry = Date.now() + (minutes * 60 * 1000);
  expect(session.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 5000);
});

Then('the password field should be cleared', async function() {
  const passwordField = this.page.locator('#password');
  const value = await passwordField.inputValue();
  expect(value).toBe('');
});

Then('I should see validation error {string}', async function(errorMsg: string) {
  const validationError = this.page.locator('.validation-error');
  await expect(validationError).toContainText(errorMsg);
});

Then('the login form should be disabled', async function() {
  const loginButton = this.page.locator('[data-testid="login-button"]');
  await expect(loginButton).toBeDisabled();
});

Then('I should be able to focus on username field', async function() {
  const usernameField = this.page.locator('#username');
  const isFocused = await usernameField.evaluate((el: HTMLElement) => el === document.activeElement);
  expect(isFocused).toBeTruthy();
});
```

### Setting Up Test World (Context)

The test world provides shared context across steps in a scenario.

**Location**: `features/steps/fixtures.ts`

```typescript
// features/steps/fixtures.ts
import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from '@playwright/test';

// Define the test world class
export class TestWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  
  // Store page objects
  loginPage: any;
  dashboardPage: any;
  
  // Store test data
  testUser: any;
  testDocument: any;
  
  // Store API responses
  apiResponses: Map<string, any> = new Map();
  
  // Initialize world
  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: Number(process.env.SLOW_MO) || 0
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    
    this.page = await this.context.newPage();
  }
  
  // Cleanup
  async cleanup() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

// Set the world constructor
setWorldConstructor(TestWorld);

// Before each scenario
Before(async function(this: TestWorld) {
  await this.init();
});

// After each scenario
After(async function(this: TestWorld) {
  // Take screenshot if scenario failed
  if (this.result && this.result.status === 'failed') {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  
  await this.cleanup();
});
```

### Generating Tests from Features

```bash
# Generate BDD test files from Gherkin features
npm run bdd:generate

# This command:
# 1. Reads all .feature files from features/ directory
# 2. Generates corresponding .spec.js files in .features-gen/
# 3. Maps Gherkin steps to step definitions
# 4. Creates executable Playwright tests
```

**Generated file example:**

```
features/webapp/ui/login.feature
  ↓
.features-gen/webapp/ui/login.spec.js (generated)
```

### Running BDD Tests

```bash
# Generate and run all BDD tests
npm run test:bdd:all

# Run BDD tests by application
npm run bdd:webapp
npm run bdd:adminapp
npm run bdd:mcp

# Run BDD tests by tag
npm run bdd:critical     # Only @critical scenarios
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"

# Run specific feature file
npx playwright test .features-gen/webapp/ui/login.spec.js
```

### BDD Tags and Organization

**Common tags:**

```gherkin
@smoke        # Quick smoke tests (critical path)
@regression   # Full regression suite
@critical     # Must-pass scenarios
@happy-path   # Positive test cases
@negative-test # Negative test cases
@security     # Security-related scenarios
@performance  # Performance tests
@accessibility # Accessibility tests
@slow         # Tests that take long time
@wip          # Work in progress (skip in CI)
```

**Using tags in features:**

```gherkin
@webapp @smoke @critical
Feature: Critical webapp functionality

  @happy-path
  Scenario: Successful operation
    # Test steps...
    
  @negative-test @security
  Scenario: Handle malicious input
    # Test steps...
```

**Running by tags:**

```bash
# Run smoke tests only
npx playwright test --grep "@smoke"

# Run critical tests
npx playwright test --grep "@critical"

# Run multiple tags (OR)
npx playwright test --grep "@smoke|@critical"

# Exclude tags
npx playwright test --grep-invert "@slow"
npx playwright test --grep-invert "@wip"

# Combine inclusion and exclusion
npx playwright test --grep "@smoke" --grep-invert "@slow"
```

### BDD Best Practices

1. **Write from user perspective**: Focus on what users do, not implementation
2. **Keep scenarios independent**: Each scenario should run on its own
3. **Use Background for common setup**: Reduce duplication
4. **Make steps reusable**: Write generic steps that work in multiple scenarios
5. **Use Scenario Outline for similar tests**: Test multiple data combinations
6. **Tag appropriately**: Use tags for organizing and filtering
7. **Keep scenarios concise**: Break long scenarios into multiple smaller ones
8. **Use descriptive names**: Make scenarios understandable without reading steps
9. **Avoid technical jargon**: Write for business stakeholders
10. **One concept per scenario**: Test one thing at a time

---

## 🎨 Page Object Model

### What is Page Object Model?

Page Object Model (POM) is a design pattern that:
- Encapsulates page-specific locators and interactions
- Provides a clean API for tests to interact with pages
- Makes tests more maintainable and readable
- Reduces code duplication

### Base Page Class

**Location**: `src/applications/shared/pages/BasePage.ts`

```typescript
// src/applications/shared/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  // Every page has access to Playwright's Page object
  protected page: Page;
  
  // Base URL and page-specific path
  protected baseUrl: string;
  protected path: string = '/';
  
  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl || process.env.UI_BASE_URL || 'http://localhost:3001';
  }
  
  // Common navigation
  async navigate() {
    await this.page.goto(`${this.baseUrl}${this.path}`);
    await this.waitForPageLoad();
  }
  
  // Wait for page to be fully loaded
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
  
  // Common actions
  async clickElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }
  
  async fillInput(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }
  
  async selectOption(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }
  
  // Get page title
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
  
  // Take screenshot
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
  
  // Wait for element
  async waitForElement(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }
  
  // Check if element is visible
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
  
  // Scroll to element
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }
  
  // Get text from element
  async getElementText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() || '';
  }
}
```

### Creating Page Objects

**Example**: Login Page

```typescript
// src/applications/webapp/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../shared/pages/BasePage';

export class LoginPage extends BasePage {
  // Override path
  protected path = '/login';
  
  // Page elements (locators)
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly signUpLink: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.forgotPasswordLink = page.locator('text=Forgot Password?');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.rememberMeCheckbox = page.locator('#remember-me');
    this.signUpLink = page.locator('text=Sign Up');
  }
  
  // Page actions (methods)
  
  /**
   * Enter username into the username field
   * @param username - The username or email to enter
   */
  async enterUsername(username: string) {
    await this.fillInput(this.usernameInput, username);
  }
  
  /**
   * Enter password into the password field
   * @param password - The password to enter
   */
  async enterPassword(password: string) {
    await this.fillInput(this.passwordInput, password);
  }
  
  /**
   * Click the login button
   */
  async clickLoginButton() {
    await this.clickElement(this.loginButton);
  }
  
  /**
   * Perform complete login operation
   * @param username - Username or email
   * @param password - Password
   * @param rememberMe - Whether to check "Remember Me" option
   */
  async login(username: string, password: string, rememberMe = false) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    
    if (rememberMe) {
      await this.clickElement(this.rememberMeCheckbox);
    }
    
    await this.clickLoginButton();
    
    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.clickElement(this.forgotPasswordLink);
  }
  
  /**
   * Click sign up link
   */
  async clickSignUp() {
    await this.clickElement(this.signUpLink);
  }
  
  // Verification methods (assertions helper)
  
  /**
   * Get error message text
   * @returns The error message displayed
   */
  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }
  
  /**
   * Check if error message is visible
   * @returns true if error message is displayed
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
  
  /**
   * Check if login button is enabled
   * @returns true if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }
  
  /**
   * Wait for page to be ready for interaction
   */
  async waitForPageReady() {
    await this.waitForElement(this.usernameInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }
}
```

**Example**: Dashboard Page

```typescript
// src/applications/webapp/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../shared/pages/BasePage';

export class DashboardPage extends BasePage {
  protected path = '/dashboard';
  
  // Navigation elements
  private readonly header: Locator;
  private readonly userMenu: Locator;
  private readonly notificationsIcon: Locator;
  private readonly searchBar: Locator;
  
  // Dashboard widgets
  private readonly welcomeMessage: Locator;
  private readonly recentDocuments: Locator;
  private readonly quickActions: Locator;
  private readonly statsWidget: Locator;
  
  // Menu items
  private readonly documentsTab: Locator;
  private readonly featuresTab: Locator;
  private readonly settingsTab: Locator;
  
  constructor(page: Page) {
    super(page);
    
    this.header = page.locator('[data-testid="dashboard-header"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.notificationsIcon = page.locator('[data-testid="notifications-icon"]');
    this.searchBar = page.locator('[data-testid="search-bar"]');
    
    this.welcomeMessage = page.locator('.welcome-message');
    this.recentDocuments = page.locator('[data-testid="recent-documents"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    this.statsWidget = page.locator('[data-testid="stats-widget"]');
    
    this.documentsTab = page.locator('[data-testid="documents-tab"]');
    this.featuresTab = page.locator('[data-testid="features-tab"]');
    this.settingsTab = page.locator('[data-testid="settings-tab"]');
  }
  
  // Navigation actions
  async navigateToDocuments() {
    await this.clickElement(this.documentsTab);
    await this.page.waitForURL(/documents/);
  }
  
  async navigateToFeatures() {
    await this.clickElement(this.featuresTab);
    await this.page.waitForURL(/features/);
  }
  
  async navigateToSettings() {
    await this.clickElement(this.settingsTab);
    await this.page.waitForURL(/settings/);
  }
  
  // User menu actions
  async openUserMenu() {
    await this.clickElement(this.userMenu);
    await this.page.waitForSelector('[data-testid="user-menu-dropdown"]');
  }
  
  async logout() {
    await this.openUserMenu();
    await this.clickElement(this.page.locator('text=Logout'));
    await this.page.waitForURL(/login/);
  }
  
  // Search functionality
  async search(query: string) {
    await this.fillInput(this.searchBar, query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
  
  // Widget interactions
  async getRecentDocumentCount(): Promise<number> {
    const documents = this.recentDocuments.locator('.document-item');
    return await documents.count();
  }
  
  async clickQuickAction(actionName: string) {
    const action = this.quickActions.locator(`text=${actionName}`);
    await this.clickElement(action);
  }
  
  // Verification methods
  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage);
  }
  
  async isHeaderVisible(): Promise<boolean> {
    return await this.isVisible(this.header);
  }
  
  async waitForDashboardLoad() {
    await this.waitForElement(this.header);
    await this.waitForElement(this.welcomeMessage);
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Using Page Objects in Tests

```typescript
// tests/webapp/ui/login-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/applications/webapp/pages/LoginPage';
import { DashboardPage } from '../../../src/applications/webapp/pages/DashboardPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  
  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
  });
  
  test('successful login and navigation', async ({ page }) => {
    // Login
    await loginPage.login('testuser@example.com', 'SecurePass123');
    
    // Verify on dashboard
    await dashboardPage.waitForDashboardLoad();
    expect(await dashboardPage.isHeaderVisible()).toBe(true);
    
    // Check welcome message
    const welcomeMsg = await dashboardPage.getWelcomeMessage();
    expect(welcomeMsg).toContain('Welcome');
    
    // Navigate to documents
    await dashboardPage.navigateToDocuments();
    expect(page.url()).toContain('/documents');
    
    // Navigate back to dashboard
    await dashboardPage.navigate();
    
    // Logout
    await dashboardPage.logout();
    expect(page.url()).toContain('/login');
  });
  
  test('failed login shows error', async () => {
    // Attempt login with wrong password
    await loginPage.login('testuser@example.com', 'WrongPassword');
    
    // Verify error message
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid credentials');
    
    // Verify still on login page
    expect(await loginPage.isLoginButtonEnabled()).toBe(true);
  });
});
```

### Component Objects

For reusable UI components, create component objects:

```typescript
// src/applications/shared/components/HeaderComponent.ts
import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  private readonly page: Page;
  private readonly header: Locator;
  private readonly logo: Locator;
  private readonly navMenu: Locator;
  private readonly userProfile: Locator;
  private readonly notifications: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.logo = this.header.locator('.logo');
    this.navMenu = this.header.locator('.nav-menu');
    this.userProfile = this.header.locator('.user-profile');
    this.notifications = this.header.locator('.notifications');
  }
  
  async clickLogo() {
    await this.logo.click();
  }
  
  async navigateTo(menuItem: string) {
    const item = this.navMenu.locator(`text=${menuItem}`);
    await item.click();
  }
  
  async getNotificationCount(): Promise<number> {
    const badge = this.notifications.locator('.badge');
    const text = await badge.textContent();
    return parseInt(text || '0');
  }
  
  async openUserProfile() {
    await this.userProfile.click();
  }
}

// Use in page objects
export class DashboardPage extends BasePage {
  public header: HeaderComponent;
  
  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }
  
  async goHome() {
    await this.header.clickLogo();
  }
}
```

### Page Object Best Practices

1. **One page object per page**: Create separate classes for each page
2. **Use descriptive method names**: Methods should read like actions (e.g., `login()`, `search()`)
3. **Encapsulate locators**: Keep locators private, expose only methods
4. **Return page objects for chaining**: Enable fluent interface
5. **Separate actions from assertions**: Actions in page objects, assertions in tests
6. **Use waiting mechanisms**: Wait for elements before interacting
7. **Create reusable components**: Extract common UI components
8. **Keep methods focused**: Each method should do one thing
9. **Document complex methods**: Add JSDoc comments for clarity
10. **Use TypeScript types**: Leverage type safety

---

## 📊 Test Data Management

### Test Data Strategy

The framework provides multiple approaches for test data:

1. **Static test data files**: JSON files in `src/data/test-data/`
2. **Dynamic data generation**: Using Faker.js for random data
3. **Database seeding**: Populate databases before tests
4. **API-based setup**: Create data via API calls
5. **Test data isolation**: Unique data per test run

### Static Test Data Files

**Location**: `src/data/test-data/`

**Example**: User test data

```json
// src/data/test-data/users.json
{
  "users": [
    {
      "id": "user-001",
      "username": "testuser@example.com",
      "password": "SecurePass123",
      "firstName": "Test",
      "lastName": "User",
      "role": "user",
      "status": "active"
    },
    {
      "id": "admin-001",
      "username": "admin@example.com",
      "password": "AdminPass123",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

**Loading static data:**

```typescript
// src/data/TestDataManager.ts
import usersData from './test-data/users.json';

export class TestDataManager {
  // Get specific user by role
  static getUserByRole(role: string) {
    return usersData.users.find(user => user.role === role);
  }
  
  // Get all users
  static getAllUsers() {
    return usersData.users;
  }
  
  // Get user by ID
  static getUserById(id: string) {
    return usersData.users.find(user => user.id === id);
  }
}

// Usage in tests
const testUser = TestDataManager.getUserByRole('user');
await loginPage.login(testUser.username, testUser.password);
```

### Dynamic Data Generation

**Using Faker.js:**

```typescript
// src/data/TestDataFactory.ts
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  /**
   * Generate a random user
   */
  static generateUser() {
    return {
      id: faker.string.uuid(),
      username: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      dateOfBirth: faker.date.past({ years: 30 }),
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * Generate a random document
   */
  static generateDocument() {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      content: faker.lorem.paragraphs(5),
      author: faker.person.fullName(),
      tags: faker.helpers.arrayElements(['important', 'draft', 'review', 'final'], 2),
      createdAt: faker.date.recent(),
      updatedAt: new Date()
    };
  }
  
  /**
   * Generate multiple users
   */
  static generateUsers(count: number) {
    return Array.from({ length: count }, () => this.generateUser());
  }
  
  /**
   * Generate test credentials
   */
  static generateCredentials() {
    return {
      username: faker.internet.email(),
      password: this.generateSecurePassword()
    };
  }
  
  /**
   * Generate secure password meeting requirements
   */
  static generateSecurePassword() {
    const uppercase = faker.string.alpha({ length: 2, casing: 'upper' });
    const lowercase = faker.string.alpha({ length: 2, casing: 'lower' });
    const numbers = faker.string.numeric({ length: 2 });
    const special = faker.helpers.arrayElement(['!', '@', '#', '$', '%']);
    
    return faker.helpers.shuffle(
      `${uppercase}${lowercase}${numbers}${special}`.split('')
    ).join('') + faker.string.alphanumeric(5);
  }
}

// Usage in tests
test('create user with generated data', async ({ request }) => {
  const userData = TestDataFactory.generateUser();
  
  const response = await request.post('/api/users', {
    data: userData
  });
  
  expect(response.ok()).toBeTruthy();
});
```

### Database Seeding

**Seeding test data into database:**

```typescript
// src/data/TestDataSeeder.ts
import { DatabaseHelper } from '../core/utils/DatabaseHelper';
import { TestDataFactory } from './TestDataFactory';

export class TestDataSeeder {
  private db: DatabaseHelper;
  
  constructor() {
    this.db = new DatabaseHelper();
  }
  
  /**
   * Seed users into database
   */
  async seedUsers(count: number = 10) {
    const users = TestDataFactory.generateUsers(count);
    
    for (const user of users) {
      await this.db.query(`
        INSERT INTO users (id, username, password, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [user.id, user.username, user.password, user.firstName, user.lastName, 'user']);
    }
    
    console.log(`✅ Seeded ${count} users`);
    return users;
  }
  
  /**
   * Seed documents into database
   */
  async seedDocuments(userId: string, count: number = 5) {
    const documents = Array.from({ length: count }, () => 
      TestDataFactory.generateDocument()
    );
    
    for (const doc of documents) {
      await this.db.query(`
        INSERT INTO documents (id, title, content, author_id, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [doc.id, doc.title, doc.content, userId, doc.createdAt]);
    }
    
    console.log(`✅ Seeded ${count} documents`);
    return documents;
  }
  
  /**
   * Seed complete test dataset
   */
  async seedFullDataset() {
    const users = await this.seedUsers(10);
    
    for (const user of users) {
      await this.seedDocuments(user.id, 5);
    }
    
    console.log('✅ Full dataset seeded successfully');
    return { users };
  }
  
  /**
   * Clean up all test data
   */
  async cleanup() {
    await this.db.query('DELETE FROM documents WHERE author_id LIKE $1', ['%']);
    await this.db.query('DELETE FROM users WHERE role = $1', ['user']);
    console.log('✅ Test data cleaned up');
  }
}

// Usage in global setup
// config/global-setup.ts
export default async function globalSetup() {
  const seeder = new TestDataSeeder();
  await seeder.seedFullDataset();
}
```

### Test Data Isolation

**Creating unique data per test:**

```typescript
// src/data/TestDataIsolation.ts
import { Test DataFactory } from './TestDataFactory';

export class TestDataIsolation {
  private testRunId: string;
  
  constructor() {
    // Unique ID for this test run
    this.testRunId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Create isolated user data
   */
  createIsolatedUser() {
    const user = TestDataFactory.generateUser();
    
    // Add test run prefix to make data unique
    user.username = `${this.testRunId}_${user.username}`;
    user.id = `${this.testRunId}_${user.id}`;
    
    return user;
  }
  
  /**
   * Create isolated document
   */
  createIsolatedDocument() {
    const doc = TestDataFactory.generateDocument();
    
    doc.id = `${this.testRunId}_${doc.id}`;
    doc.title = `[${this.testRunId}] ${doc.title}`;
    
    return doc;
  }
  
  /**
   * Cleanup data for this test run
   */
  async cleanup() {
    const db = new DatabaseHelper();
    
    await db.query(`
      DELETE FROM users WHERE username LIKE $1
    `, [`${this.testRunId}_%`]);
    
    await db.query(`
      DELETE FROM documents WHERE id LIKE $1
    `, [`${this.testRunId}_%`]);
    
    console.log(`✅ Cleaned up data for test run: ${this.testRunId}`);
  }
}

// Usage in tests
test.describe('User Management', () => {
  let dataIsolation: TestDataIsolation;
  
  test.beforeEach(async () => {
    dataIsolation = new TestDataIsolation();
  });
  
  test('create unique user', async ({ request }) => {
    const userData = dataIsolation.createIsolatedUser();
    
    const response = await request.post('/api/users', {
      data: userData
    });
    
    expect(response.ok()).toBeTruthy();
  });
  
  test.afterEach(async () => {
    await dataIsolation.cleanup();
  });
});
```

### Best Practices for Test Data

1. **Isolation**: Each test should have its own data
2. **Cleanup**: Always clean up test data after tests
3. **Realistic data**: Use meaningful test data that represents real scenarios
4. **Avoid hardcoding**: Don't hardcode test data in tests
5. **Version control**: Keep static test data in version control
6. **Sensitive data**: Never commit real passwords or credentials
7. **Data factories**: Use factories for consistent data generation
8. **Seed scripts**: Automate database seeding
9. **Documentation**: Document test data requirements
10. **Validation**: Validate test data meets application constraints

---

## 📈 Reporting & Analysis

### Report Types

The framework generates multiple report formats:

1. **HTML Reports**: Visual, interactive reports
2. **JSON Reports**: Machine-readable results
3. **JUnit Reports**: CI/CD integration
4. **Custom Reports**: Framework-specific metrics

### HTML Reports

**Viewing HTML reports:**

```bash
# Run tests (reports are generated automatically)
npm run test

# Open HTML report
npm run test:report

# Or open directly
open reports/combined/html-report/index.html
```

**HTML Report features:**
- Test execution summary
- Pass/fail statistics
- Test duration metrics
- Screenshots of failures
- Video recordings
- Trace files for debugging
- Filterable and searchable results

### JSON Reports

**Location**: `reports/combined/results.json`

**Example JSON structure:**

```json
{
  "config": {
    "rootDir": "/path/to/project",
    "version": "1.54.1"
  },
  "suites": [
    {
      "title": "Login Tests",
      "file": "tests/webapp/ui/login.spec.ts",
      "specs": [
        {
          "title": "should login successfully",
          "ok": true,
          "tests": [
            {
              "expectedStatus": "passed",
              "status": "passed",
              "duration": 3245
            }
          ]
        }
      ]
    }
  ],
  "stats": {
    "expected": 24,
    "unexpected": 1,
    "skipped": 0,
    "flaky": 0,
    "duration": 96000
  }
}
```

**Processing JSON reports:**

```bash
# Extract specific metrics
cat reports/combined/results.json | jq '.stats'

# Get failed tests
cat reports/combined/results.json | jq '.suites[].specs[] | select(.ok == false)'

# Calculate pass rate
cat reports/combined/results.json | jq '.stats.expected / (.stats.expected + .stats.unexpected) * 100'
```

### JUnit Reports

**Location**: `reports/combined/junit-results.xml`

**Used for CI/CD integration** (Jenkins, GitLab CI, GitHub Actions)

**Example JUnit XML:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Login Tests" tests="3" failures="1" time="12.5">
    <testcase name="should login successfully" classname="tests.webapp.ui.login" time="3.2">
    </testcase>
    <testcase name="should show error on invalid credentials" classname="tests.webapp.ui.login" time="2.1">
      <failure message="Expected error message not found">
        Error: expect(received).toContain(expected)
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```

### Custom Reporter

**Location**: `src/core/reporters/CustomReporter.ts`

```typescript
// src/core/reporters/CustomReporter.ts
import {
  Reporter,
  TestCase,
  TestResult,
  FullResult
} from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  private startTime!: number;
  private results: any[] = [];
  
  onBegin() {
    this.startTime = Date.now();
    console.log('🚀 Starting test execution...');
  }
  
  onTestBegin(test: TestCase) {
    console.log(`▶️  Running: ${test.title}`);
  }
  
  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status === 'passed' ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    
    console.log(`${status} ${test.title} (${duration}s)`);
    
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      errors: result.errors
    });
  }
  
  onEnd(result: FullResult) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const passRate = ((passed / this.results.length) * 100).toFixed(2);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`   Total: ${this.results.length}`);
    console.log(`   ✅ Passed: ${passed} (${passRate}%)`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   🎯 Overall Status: ${result.status.toUpperCase()}\n`);
    
    // Save detailed report
    this.generateDetailedReport();
  }
  
  private generateDetailedReport() {
    const report = {
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        duration: Date.now() - this.startTime
      },
      tests: this.results
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'test-results/custom-reports/detailed-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('📁 Detailed report saved to: test-results/custom-reports/detailed-report.json');
  }
}

export default CustomReporter;
```

---

## 🚀 CI/CD Integration

### GitHub Actions

**Create workflow file**: `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run tests daily at 2 AM
    - cron: '0 2 * * *'

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        project: [webapp-ui, adminapp-ui, mcp-server-api]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm run test -- --project=${{ matrix.project }}
        env:
          NODE_ENV: staging
          UI_BASE_URL: ${{ secrets.STAGING_UI_URL }}
          ADMIN_BASE_URL: ${{ secrets.STAGING_ADMIN_URL }}
          MCP_PLATFORM_URL: ${{ secrets.STAGING_MCP_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.project }}
          path: reports/
          retention-days: 30
      
      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: html-report-${{ matrix.project }}
          path: reports/combined/html-report/
      
      - name: Publish test results
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Test Results - ${{ matrix.project }}
          path: reports/combined/junit-results.xml
          reporter: java-junit
```

### Jenkins Pipeline

**Create Jenkinsfile:**

```groovy
pipeline {
    agent any
    
    environment {
        NODE_ENV = 'staging'
        UI_BASE_URL = credentials('staging-ui-url')
        ADMIN_BASE_URL = credentials('staging-admin-url')
        MCP_PLATFORM_URL = credentials('staging-mcp-url')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('WebApp UI Tests') {
                    steps {
                        sh 'npm run test:webapp:ui'
                    }
                }
                
                stage('AdminApp UI Tests') {
                    steps {
                        sh 'npm run test:adminapp:ui'
                    }
                }
                
                stage('API Tests') {
                    steps {
                        sh 'npm run test:mcp:api'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                sh 'npm run test:custom-report'
            }
        }
    }
    
    post {
        always {
            // Publish HTML reports
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/combined/html-report',
                reportFiles: 'index.html',
                reportName: 'Test Report'
            ])
            
            // Publish JUnit test results
            junit 'reports/combined/junit-results.xml'
            
            // Archive artifacts
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            
            // Send notifications
            emailext(
                subject: "Test Results: ${currentBuild.result}",
                body: """Test execution completed with status: ${currentBuild.result}
                
                View detailed report: ${env.BUILD_URL}Test_Report/
                """,
                to: 'qa-team@example.com'
            )
        }
        
        failure {
            // Notify on failure
            slackSend(
                color: 'danger',
                message: "Tests failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
        
        success {
            slackSend(
                color: 'good',
                message: "Tests passed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

### Docker Support

**Dockerfile for tests:**

```dockerfile
# Dockerfile.test
FROM mcr.microsoft.com/playwright:v1.54.1-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=test
ENV HEADLESS=true

# Run tests
CMD ["npm", "run", "test:all"]
```

**Docker Compose:**

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  e2e-tests:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - UI_BASE_URL=http://webapp:3001
      - ADMIN_BASE_URL=http://adminapp:3021
      - MCP_PLATFORM_URL=http://mcp-server:3002
    volumes:
      - ./reports:/app/reports
    depends_on:
      - webapp
      - adminapp
      - mcp-server
  
  webapp:
    image: webapp:latest
    ports:
      - "3001:3001"
  
  adminapp:
    image: adminapp:latest
    ports:
      - "3021:3021"
  
  mcp-server:
    image: mcp-server:latest
    ports:
      - "3002:3002"
```

**Run tests in Docker:**

```bash
# Build and run tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

# View reports
open reports/combined/html-report/index.html
```

---

## 💡 Best Practices

### 1. Test Design

- **Write independent tests**: Each test should run in isolation
- **Use descriptive names**: Test names should explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests focused**: One test should verify one thing
- **Avoid test interdependencies**: Don't rely on test execution order

### 2. Maintainability

- **Use Page Object Model**: Encapsulate page interactions
- **Extract reusable functions**: DRY principle
- **Keep tests readable**: Code should be self-documenting
- **Regular refactoring**: Update tests as application changes
- **Document complex logic**: Add comments for clarity

### 3. Reliability

- **Use explicit waits**: Wait for specific conditions
- **Handle flaky tests**: Identify and fix unstable tests
- **Proper error handling**: Catch and handle exceptions
- **Clean up test data**: Don't leave orphan data
- **Use retries wisely**: Only for known flaky scenarios

### 4. Performance

- **Run tests in parallel**: Use multiple workers
- **Optimize test data setup**: Use API instead of UI
- **Skip unnecessary steps**: Don't test what's already tested
- **Use appropriate timeouts**: Not too short, not too long
- **Profile slow tests**: Identify and optimize bottlenecks

### 5. Organization

- **Logical folder structure**: Group related tests
- **Consistent naming**: Follow naming conventions
- **Tag tests appropriately**: Enable selective execution
- **Version control**: Track test changes
- **Documentation**: Keep documentation updated

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Tests Timeout

**Problem**: Tests fail with timeout errors

**Solutions**:
```bash
# Increase timeout globally
# In playwright.config.ts
timeout: 60000  # 60 seconds

# Increase for specific test
test('slow operation', async ({ page }) => {
  test.setTimeout(120000);  # 2 minutes
  // test code...
});

# Increase navigation timeout
await page.goto(url, { timeout: 60000 });

# Increase wait timeout
await page.waitForSelector('.element', { timeout: 30000 });
```

#### 2. Element Not Found

**Problem**: Cannot find element on page

**Solutions**:
```typescript
// Wait for element to be visible
await page.waitForSelector('.element', { state: 'visible' });

// Use better selectors
// ❌ Bad: page.locator('div > span > a')
// ✅ Good: page.locator('[data-testid="login-button"]')

// Check if element exists
const exists = await page.locator('.element').count() > 0;

// Use soft assertions for optional elements
await expect.soft(page.locator('.optional')).toBeVisible();
```

#### 3. Flaky Tests

**Problem**: Tests pass/fail randomly

**Solutions**:
```typescript
// Use auto-waiting
// Playwright automatically waits, trust it
await page.click('.button');  // Waits automatically

// Add explicit waits for AJAX
await page.waitForResponse(resp => resp.url().includes('/api/data'));

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Use retries for known flaky scenarios
test.describe.configure({ retries: 2 });
```

#### 4. Authentication Issues

**Problem**: Cannot authenticate or maintain session

**Solutions**:
```typescript
// Save authentication state
await page.context().storageState({ path: 'auth.json' });

// Reuse authentication
const context = await browser.newContext({ storageState: 'auth.json' });

// Set cookies manually
await context.addCookies([{
  name: 'session',
  value: 'abc123',
  domain: 'example.com',
  path: '/'
}]);
```

#### 5. Cross-Origin Issues

**Problem**: Cannot interact with iframes or cross-origin content

**Solutions**:
```typescript
// Work with iframes
const frame = page.frameLocator('iframe[title="Payment"]');
await frame.locator('#card-number').fill('4242424242424242');

// Handle new windows/tabs
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]')
]);
await newPage.waitForLoadState();
```

### Debug Techniques

```bash
# Run single test in debug mode
npx playwright test tests/webapp/ui/login.spec.ts --debug

# Pause test execution
await page.pause();  # In test code

# Take screenshots for debugging
await page.screenshot({ path: 'debug.png', fullPage: true });

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip

# Enable verbose logging
DEBUG=pw:api npm run test
```

---

## 🚀 Advanced Topics

### 1. Visual Regression Testing

```typescript
// Take screenshot and compare
await expect(page).toHaveScreenshot('homepage.png');

# Update snapshots
npm run test:update-snapshots
```

### 2. Accessibility Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

### 3. Performance Testing

```typescript
test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);  # 3 second threshold
});
```

### 4. Mobile Testing

```typescript
const iPhone = devices['iPhone 12'];

test.use({ ...iPhone });

test('mobile responsive', async ({ page }) => {
  await page.goto('/');
  // Test mobile-specific features
});
```

### 5. API Mocking

```typescript
// Mock API response
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ users: [] })
  });
});
```

---

## 📞 Support and Resources

### Getting Help

- **Documentation**: `/documentation/` folder
- **GitHub Issues**: Report bugs and request features
- **Team Channel**: Contact QA team on Slack
- **Stack Overflow**: Tag questions with `playwright` and `typescript`

### Useful Links

- [Playwright Documentation](https://playwright.dev)
- [Playwright-BDD Documentation](https://github.com/vitalets/playwright-bdd)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)

---

## 🎓 Learning Path

### For Beginners
1. Read this user guide completely
2. Set up the framework (Installation & Setup section)
3. Run existing tests to see how they work
4. Modify a simple test
5. Write your first test

### For Intermediate Users
1. Create page objects for new pages
2. Write BDD feature files
3. Implement step definitions
4. Add API tests
5. Integrate with CI/CD

### For Advanced Users
1. Create custom reporters
2. Implement advanced test patterns
3. Optimize test performance
4. Build reusable test libraries
5. Mentor team members

---

**🎉 Congratulations!** You now have a comprehensive understanding of the Playwright E2E BDD Framework. Start testing and happy automating!

---

*For questions, feedback, or contributions, please contact the QA Team or open an issue on GitHub.*
