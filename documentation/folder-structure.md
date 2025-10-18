# Folder Structure Guide

**Comprehensive Guide to Framework Organization**

## 📁 Overview

The Playwright E2E Testing Framework follows a professional, enterprise-grade folder structure designed for scalability, maintainability, and clear separation of concerns.

## 🏗️ Root Directory Structure

```
playwright-e2e-tests/
├── 📁 .github/                   # GitHub Actions CI/CD Workflows ✨ NEW
├── 📁 config/                    # Configuration Management
├── 📁 src/                       # Source Code Organization  
├── 📁 tests/                     # Test Files by Application
├── 📁 features/                  # BDD Feature Files
├── 📁 reports/                   # Test Execution Reports
├── 📁 documentation/             # Framework Documentation
├── 📁 test-data/                 # Test Data Files
├── 📄 .gitlab-ci.yml             # GitLab CI Pipeline ✨ NEW
├── 📄 Jenkinsfile                # Jenkins Pipeline ✨ NEW
├── 📄 env.example                # Environment Variables Template ✨ NEW
├── 📄 package.json               # Project Dependencies & Scripts
├── 📄 tsconfig.json              # TypeScript Configuration
└── 📄 .gitignore                 # Git Ignore Patterns (Enhanced)
```

---

## 📁 `/.github/` - GitHub Actions CI/CD ✨ NEW

**Purpose**: GitHub Actions workflow configurations for automated testing and continuous integration.

```
.github/
└── 📁 workflows/                 # GitHub Actions Workflows
    ├── 📄 pr-tests.yml           # Pull request smoke tests
    ├── 📄 main-tests.yml         # Main branch comprehensive tests
    ├── 📄 scheduled-tests.yml    # Daily regression tests
    ├── 📄 bdd-tests.yml          # BDD feature tests
    └── 📄 dependency-update.yml  # Weekly dependency updates
```

### **Workflow Overview**

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| `pr-tests.yml` | Pull Requests | Fast smoke tests | ~20 min |
| `main-tests.yml` | Push to main | Comprehensive testing with sharding | ~45 min |
| `scheduled-tests.yml` | Daily at 2 AM UTC | Regression testing | ~60 min |
| `bdd-tests.yml` | Feature file changes | BDD scenario validation | ~30 min |
| `dependency-update.yml` | Weekly Monday 9 AM | Security audits & updates | ~15 min |

**Key Features:**
- Automatic test execution on commits
- Parallel test execution with sharding
- Cross-browser testing matrix
- Automatic artifact upload
- GitHub issue creation on failures
- Scheduled regression testing
- Automated dependency updates

**📖 Full Documentation**: See [CI/CD Setup Guide](ci-cd-setup.md)

---

## 📁 `/config/` - Configuration Management

**Purpose**: Centralized configuration management with separation by application and environment.

```
config/
├── 📁 applications/              # Application-specific configurations
│   ├── 📄 webapp.config.ts       # WebApp settings and features
│   ├── 📄 adminapp.config.ts     # AdminApp configuration
│   ├── 📄 mcp-server.config.ts   # MCP Server settings
│   └── 📄 shared.config.ts       # Common framework settings
├── 📁 environments/              # Environment-specific settings
│   ├── 📄 dev.config.ts          # Development environment
│   ├── 📄 staging.config.ts      # Staging environment  
│   └── 📄 prod.config.ts         # Production environment
├── 📄 playwright.config.ts       # Main Playwright configuration
└── 📄 playwright-bdd.config.js   # BDD-specific configuration
```

### **Application Configurations**

#### `webapp.config.ts`
```typescript
export interface WebappConfig {
  baseUrl: string;
  timeout: number;
  features: {
    documentManagement: boolean;
    featureGeneration: boolean;
    globalChat: boolean;
  };
  authentication: {
    enabled: boolean;
    providers: string[];
  };
}
```

#### `adminapp.config.ts`
```typescript
export interface AdminappConfig {
  baseUrl: string;
  features: {
    userManagement: boolean;
    systemMonitoring: boolean;
    logManagement: boolean;
  };
}
```

### **Environment Configurations**

Each environment config defines:
- Application URLs
- Database settings
- Logging levels  
- Retry policies
- Performance settings

---

## 📁 `/src/` - Source Code Organization

**Purpose**: All source code organized by application with shared components and core framework utilities.

```
src/
├── 📁 applications/              # Application-specific implementations
│   ├── 📁 webapp/               # WebApp-specific code
│   │   ├── 📁 pages/            # Page Object Models
│   │   │   ├── 📄 DashboardPage.ts
│   │   │   ├── 📄 DocumentHubPage.ts  
│   │   │   └── 📄 FeatureGeneratorPage.ts
│   │   ├── 📁 api/              # API client classes
│   │   │   ├── 📄 WebappAPI.ts
│   │   │   └── 📄 builders/
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── 📄 HeaderComponent.ts
│   │   │   └── 📄 SidebarComponent.ts
│   │   └── 📁 workflows/        # Business workflow classes
│   │       └── 📄 DocumentToFeatureWorkflow.ts
│   ├── 📁 adminapp/             # AdminApp-specific code
│   │   ├── 📁 pages/
│   │   │   ├── 📄 AdminDashboardPage.ts
│   │   │   ├── 📄 UserManagementPage.ts
│   │   │   └── 📄 SystemMonitoringPage.ts
│   │   ├── 📁 api/
│   │   │   └── 📄 AdminAPI.ts
│   │   ├── 📁 components/
│   │   └── 📁 workflows/
│   ├── 📁 mcp-server/           # MCP Server-specific code
│   │   ├── 📁 api/
│   │   │   └── 📄 McpAPI.ts
│   │   ├── 📁 clients/
│   │   └── 📁 workflows/
│   └── 📁 shared/               # Shared across applications
│       ├── 📁 pages/
│       │   └── 📄 BasePage.ts
│       ├── 📁 api/
│       │   ├── 📄 BaseAPI.ts
│       │   └── 📄 builders/
│       ├── 📁 components/
│       └── 📁 helpers/
│           ├── 📄 NavigationHelper.ts
│           ├── 📄 AuthenticationHelper.ts
│           └── 📄 RoleBasedLocators.ts
├── 📁 core/                     # Core framework components
│   ├── 📁 base/                 # Base classes and utilities
│   │   ├── 📄 TestWorld.ts      # BDD test context
│   │   ├── 📄 global-setup.ts   # Global test setup
│   │   └── 📄 global-teardown.ts
│   ├── 📁 managers/             # Test management utilities
│   │   ├── 📄 ConfigManager.ts
│   │   ├── 📄 TestDataManager.ts
│   │   └── 📄 ApplicationManager.ts
│   ├── 📁 utils/                # Framework utilities
│   │   ├── 📄 APIHelper.ts
│   │   ├── 📄 DatabaseHelper.ts
│   │   └── 📄 playwrightLogger.ts
│   └── 📁 reporters/            # Custom reporters
│       └── 📄 CustomReporter.ts
└── 📁 data/                     # Test data management
    ├── 📄 TestDataSeeder.ts     # Data seeding utilities
    ├── 📄 DatabaseCleaner.ts    # Cleanup utilities
    ├── 📄 TestDataIsolation.ts  # Test data isolation
    ├── 📄 TestDataManager.ts    # Test data management
    └── 📄 ChromaDBSeeder.ts     # Vector DB seeding
```

### **Key Source Code Principles**

1. **Application Isolation**: Each application has its own directory with complete independence
2. **Shared Resources**: Common utilities and components in `/shared/` 
3. **Core Framework**: Base framework functionality in `/core/`
4. **Data Management**: Centralized test data handling

---

## 📁 `/tests/` - Test Files Organization

**Purpose**: Test files organized by application and test type for easy navigation and maintenance.

```
tests/
├── 📁 webapp/                   # WebApp test suites
│   ├── 📁 ui/                   # User Interface tests
│   │   ├── 📄 login.spec.ts
│   │   ├── 📄 document-management.spec.ts
│   │   ├── 📄 feature-generation.spec.ts
│   │   └── 📄 navigation.spec.ts
│   ├── 📁 api/                  # API integration tests
│   │   ├── 📄 authentication.spec.ts
│   │   ├── 📄 documents.spec.ts
│   │   └── 📄 features.spec.ts
│   └── 📁 integration/          # WebApp integration workflows
│       └── 📄 user-workflow.spec.ts
├── 📁 adminapp/                 # AdminApp test suites
│   ├── 📁 ui/                   # Admin UI tests
│   │   ├── 📄 admin-login.spec.ts
│   │   ├── 📄 user-management.spec.ts
│   │   └── 📄 system-monitoring.spec.ts
│   ├── 📁 api/                  # Admin API tests
│   │   ├── 📄 admin-auth.spec.ts
│   │   ├── 📄 system-metrics.spec.ts
│   │   └── 📄 user-management-api.spec.ts
│   └── 📁 integration/          # Admin integration workflows
│       └── 📄 admin-workflow.spec.ts
├── 📁 api/                      # API test suites
│   ├── 📄 mcp-fastapi.spec.ts   # MCP Server API tests
│   ├── 📄 qa-api.spec.ts        # QA API tests
│   └── 📄 qa-api-test-env.spec.ts
├── 📁 e2e/                      # End-to-end test suites
│   └── 📄 test-env-comprehensive.spec.ts
├── 📁 ui/                       # UI test suites
│   ├── 📄 navigation.spec.ts
│   ├── 📄 smoke-tests.spec.ts
│   └── 📄 model-*.spec.ts
├── 📁 comprehensive/            # Comprehensive workflow tests
│   └── 📄 e2e-workflows.spec.ts
└── 📁 utils/                    # Test utilities
    └── 📄 test-helpers.ts
```

### **Test Organization Benefits**

1. **Clear Ownership**: Each application team owns their test directory
2. **Test Type Separation**: UI, API, E2E, and Integration tests are clearly separated
3. **Scalability**: Easy to add new applications or test types
4. **Flexibility**: Mix of traditional Playwright tests and BDD scenarios

---

## 📁 `/features/` - BDD Feature Files

**Purpose**: Behavior-Driven Development with Gherkin syntax organized by application.

```
features/
├── 📁 webapp/                   # WebApp BDD scenarios
│   ├── 📁 ui/                   # UI behavior scenarios  
│   │   ├── 📄 login.feature
│   │   ├── 📄 document-management.feature
│   │   └── 📄 feature-generation.feature
│   ├── 📁 api/                  # API behavior scenarios
│   │   ├── 📄 authentication.feature
│   │   ├── 📄 documents.feature
│   │   └── 📄 features.feature
│   └── 📁 integration/          # Integration scenarios
│       └── 📄 user-workflow.feature
├── 📁 adminapp/                 # AdminApp BDD scenarios
│   ├── 📁 ui/
│   │   ├── 📄 log-management.feature
│   │   └── 📄 system-monitoring.feature
│   ├── 📁 api/
│   └── 📁 integration/
├── 📁 shared/                   # Shared BDD components
└── 📁 steps/                    # Step definitions
    ├── 📄 fixtures.ts           # Test fixtures for BDD
    ├── 📁 shared/
    │   └── 📄 common-steps.ts
    └── 📁 webapp/
        └── 📄 navigation-steps.ts
```

### **BDD Feature Structure Example**

```gherkin
@webapp @navigation @smoke
Feature: WebApp Navigation
  As a user of the webapp
  I want to navigate between different sections
  So that I can access all available functionality

  Background:
    Given the webapp is accessible
    And I am on the main dashboard

  @critical
  Scenario: Navigate through main tabs
    When I click on the "Document Hub" tab
    Then I should be on the Document Hub page
    And the "Document Hub" tab should be active
```

---

## 📁 `/reports/` - Test Execution Reports

**Purpose**: Organized test execution reports and analytics.

```
reports/
├── 📁 webapp/                   # WebApp-specific reports
│   ├── 📄 html-report/
│   ├── 📄 results.json
│   └── 📄 junit-results.xml
├── 📁 adminapp/                 # AdminApp-specific reports
├── 📁 mcp-server/               # MCP Server-specific reports  
├── 📁 webapp/                   # WebApp-specific reports
└── 📁 combined/                 # Combined application reports
    ├── 📁 html-report/          # Unified HTML report
    ├── 📄 results.json          # Combined JSON results
    ├── 📄 junit-results.xml     # Combined JUnit format
    └── 📄 artifacts/            # Test artifacts (screenshots, videos)
```

---

## 📁 `/documentation/` - Framework Documentation

**Purpose**: Comprehensive framework documentation and guides.

```
documentation/
├── 📄 README.md                 # Documentation index
├── 📄 setup.md                  # Project setup guide
├── 📄 folder-structure.md       # This document
├── 📄 configuration-guide.md    # Configuration reference
├── 📄 test-execution.md         # Test running guide
├── 📄 bdd-testing.md           # BDD development guide
├── 📄 ci-cd-setup.md           # CI/CD integration guide ✨ NEW
├── 📄 development-workflow.md   # Best practices
├── 📄 api-reference.md         # API documentation
└── 📄 troubleshooting.md       # Common issues & solutions
```

---

## 📄 Root Level CI/CD Files ✨ NEW

### `.gitlab-ci.yml` - GitLab CI Pipeline

**Purpose**: Complete GitLab CI/CD pipeline configuration with caching and parallel execution.

**Key Features:**
- 4-stage pipeline (Setup → Lint → Test → Report)
- Parallel execution matrix for applications
- Docker-based test execution
- Cached dependencies for faster builds
- Artifact management and reporting

**Stages:**
1. **Setup**: Install dependencies and Playwright browsers
2. **Lint**: TypeScript validation
3. **Test**: Smoke, regression, cross-browser, and BDD tests
4. **Report**: Generate and publish test reports

---

### `Jenkinsfile` - Jenkins Pipeline

**Purpose**: Jenkins declarative pipeline with matrix builds and parallel execution.

**Key Features:**
- Docker agent configuration
- Parallel application testing
- Matrix cross-browser testing
- HTML report publishing
- JUnit integration
- Artifact archiving

**Stages:**
1. **Setup**: Dependencies and browser installation
2. **Lint**: Code quality checks
3. **Smoke Tests**: Fast feedback on PRs
4. **Parallel Tests**: WebApp, AdminApp, MCP Server
5. **Cross-Browser Tests**: Multi-browser matrix
6. **BDD Tests**: Feature validation

---

### `env.example` - Environment Template ✨ NEW

**Purpose**: Complete environment variable template with safe defaults for quick setup.

**Sections:**
- **WebApp Configuration**: Base URL, auth, features
- **AdminApp Configuration**: Admin settings, security
- **MCP Server Configuration**: AI providers, services
- **Database Configuration**: Connection details
- **Test Configuration**: Browser, execution settings
- **CI/CD Configuration**: Pipeline settings
- **Environment URLs**: Dev, Staging, Production

**Usage:**
```bash
cp env.example .env
# Edit .env with your settings
```

---

## 🔍 Navigation Guidelines

### **Finding Files**

| What you need | Where to look |
|---------------|---------------|
| CI/CD workflows | `.github/workflows/` ✨ |
| GitLab CI config | `.gitlab-ci.yml` ✨ |
| Jenkins pipeline | `Jenkinsfile` ✨ |
| Environment template | `env.example` ✨ |
| Application config | `config/applications/` |
| Environment settings | `config/environments/` |
| Page objects | `src/applications/{app}/pages/` |
| API clients | `src/applications/{app}/api/` |
| UI tests | `tests/{app}/ui/` |
| API tests | `tests/{app}/api/` |
| BDD scenarios | `features/{app}/` |
| Test reports | `reports/{app}/` or `reports/combined/` |

### **Adding New Components**

| Component Type | Location | Example |
|----------------|----------|---------|
| New application | Create new folders in `config/applications/`, `src/applications/`, `tests/`, `features/` | `src/applications/mobile/` |
| New page object | `src/applications/{app}/pages/` | `UserProfilePage.ts` |
| New test type | `tests/{app}/{type}/` | `tests/webapp/performance/` |
| New BDD feature | `features/{app}/{type}/` | `features/webapp/security/` |
| Shared utility | `src/shared/helpers/` | `DateHelper.ts` |

---

## 🛠️ Maintenance Guidelines

### **Regular Maintenance Tasks**

1. **Clean up old reports**: Regularly clear `reports/` directories
2. **Update documentation**: Keep documentation current with code changes
3. **Review configurations**: Ensure environment configs match infrastructure
4. **Organize test data**: Clean up `test-data/` periodically

### **Best Practices**

1. **Consistent Naming**: Use clear, descriptive file and folder names
2. **Logical Grouping**: Keep related files together
3. **Documentation**: Document new folders and their purpose
4. **Regular Reviews**: Periodically review and optimize structure

---

## 📈 Scalability Considerations

### **Adding New Applications**

When adding a new application (e.g., `mobile-app`):

1. Create configuration: `config/applications/mobile-app.config.ts`
2. Create source structure: `src/applications/mobile-app/`
3. Create test directories: `tests/mobile-app/`
4. Create BDD features: `features/mobile-app/`
5. Update main config: Add to `config/playwright.config.ts`
6. Add npm scripts: Update `package.json`

### **Extending Test Types**

To add new test types (e.g., `security`, `performance`):

1. Create test directories: `tests/{app}/{new-type}/`
2. Create BDD features: `features/{app}/{new-type}/`
3. Update Playwright projects in configuration
4. Add corresponding npm scripts

This folder structure provides the foundation for a scalable, maintainable, and professional QA automation framework that can grow with your organization's needs.