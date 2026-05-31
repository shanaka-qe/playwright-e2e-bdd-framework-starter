# Playwright E2E BDD Framework

[![Playwright](https://img.shields.io/badge/Playwright-1.54.1-green.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![BDD](https://img.shields.io/badge/BDD-Playwright--BDD-yellow.svg)](https://github.com/vitalets/playwright-bdd)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise-grade test automation framework for multi-application testing with Playwright and BDD support**

**Author:** Shanaka Fernando  
**LinkedIn:** https://www.linkedin.com/in/shanaka-qe/

## 📢 About This Project

**This is a sample starter project** derived from a real-world, large-scale E2E workflow automation framework that I developed for one of my enterprise clients. It has been generalized and sanitized to serve as a professional template for the QA community. The original project handled complex multi-application workflows, AI-powered test generation, and comprehensive cross-platform testing in a production environment.

This starter template preserves the enterprise-grade architecture, best practices, and patterns that proved successful in real-world scenarios, making it an ideal foundation for building robust test automation frameworks.

---

A comprehensive, scalable, and maintainable end-to-end testing framework built with Playwright and Playwright-BDD. Designed for testing multiple applications (WebApp, AdminApp, API Server) with a professional architecture suitable for enterprise environments.

## 🏗️ Framework Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLAYWRIGHT E2E BDD FRAMEWORK                         │
│                         Multi-App Testing Architecture                       │
└─────────────────────────────────────────────────────────────────────────────┘

                                 ┌──────────────┐
                                 │   CI/CD      │
                                 │ ─────────    │
                                 │  GitHub      │
                                 │  GitLab      │
                                 │  Jenkins     │
                                 └──────┬───────┘
                                        │
                          ┌─────────────▼─────────────┐
                          │   Test Execution Layer    │
                          │                           │
                          │  ┌─────────────────────┐  │
                          │  │  Playwright Runner  │  │
                          │  └─────────────────────┘  │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
        ┌────────▼────────┐    ┌───────▼────────┐    ┌───────▼────────┐
        │  Traditional    │    │  BDD (Gherkin) │    │  API Tests     │
        │  Playwright     │    │  Feature Files │    │  Direct        │
        │  Tests (.spec)  │    │  (.feature)    │    │  Integration   │
        └────────┬────────┘    └─────────┬──────┘    └──────────┬─────┘
                 │                       │                      │
                 │              ┌────────▼────────┐             │
                 │              │  Step Defs      │             │
                 │              │  (BDD->Code)    │             │
                 │              └────────┬────────┘             │
                 │                       │                      │
                 └───────────────────────┼──────────────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │    Page Object Layer        │
                          │                             │
                          │  ┌────────┐  ┌──────────┐   │
                          │  │WebApp  │  │AdminApp  │   │
                          │  │Pages   │  │Pages     │   │
                          │  └────────┘  └──────────┘   │
                          │                             │
                          │  ┌─────────────────────┐    │
                          │  │  Shared Components  │    │
                          │  │  (Header, Sidebar)  │    │
                          │  └─────────────────────┘    │
                          └──────────────┬──────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │   Application APIs          │
                          │                             │
                          │  ┌────────┐  ┌──────────┐   │
                          │  │WebApp  │  │AdminApp  │   │
                          │  │API     │  │API       │   │
                          │  └────────┘  └──────────┘   │
                          └──────────────┬──────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │   Core Framework Layer      │
                          │                             │
                          │  • Config Management        │
                          │  • Test Data Factories      │
                          │  • Authentication Helpers   │
                          │  • Navigation Helpers       │
                          │  • Custom Reporters         │
                          │  • Database Utilities       │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
        ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
        │  Configuration  │    │  Test Data      │    │  Reporting      │
        │                 │    │                 │    │                 │
        │  • Environment  │    │  • Builders     │    │  • HTML         │
        │  • Application  │    │  • Factories    │    │  • JSON         │
        │  • Playwright   │    │  • Seeders      │    │  • JUnit        │
        └─────────────────┘    └─────────────────┘    │  • Custom       │
                                                      └─────────────────┘

                          ┌──────────────────────────┐
                          │   Applications Under     │
                          │        Test              │
                          │                          │
                          │  🌐 WebApp               │
                          │  ⚙️  AdminApp            │
                          │  🔌 API/MCP Server       │
                          └──────────────────────────┘

Legend:
  → Data/Control Flow
  ┌─┐ Layer/Component
  • Feature/Capability
```

### Architecture Highlights

- **Multi-Layer Design**: Separation of concerns with dedicated layers for tests, pages, APIs, and core utilities
- **Dual Testing Approach**: Support for both traditional Playwright tests and BDD Gherkin scenarios
- **Reusable Components**: Shared page objects, helpers, and utilities across all applications
- **Flexible Configuration**: Environment-based and application-specific configurations
- **CI/CD Integration**: Built-in pipelines for GitHub Actions, GitLab CI, and Jenkins
- **Comprehensive Reporting**: Multiple report formats for different stakeholders

## ✨ Features

### Core Testing Capabilities
- 🎯 **Multi-Application Support** - Separate configurations for WebApp, AdminApp, and API testing
- 🥒 **BDD Integration** - Gherkin feature files with Playwright-BDD for behavior-driven development
- 🧪 **Test Organization** - UI, API, Integration, and Cross-Application test suites
- 🎨 **Page Object Model** - Maintainable test architecture with reusable components
- 📱 **Cross-Browser Testing** - Chrome, Firefox, Safari, and Mobile (iOS/Android) support
- 🔍 **Visual Regression Testing** - Screenshot comparison for UI consistency
- ⚡ **Performance Testing** - Built-in performance monitoring and metrics

### Advanced Features
- 🌍 **Environment Management** - Development, Staging, and Production configurations with easy switching
- 🔄 **Parallel Execution & Sharding** - Optimized test performance with configurable workers and test sharding
- 🔐 **Authentication & Authorization** - Role-based testing with authentication helpers
- 📊 **Comprehensive Reporting** - HTML, JSON, JUnit, Playwright-BDD, and custom reports
- 🏗️ **Test Data Management** - Factories, builders, seeders, and data isolation
- 🔧 **Type-Safe** - Full TypeScript support with strong typing and IntelliSense
- ♿ **Accessibility Testing** - Built-in accessibility validation helpers
- 🧩 **Component Reusability** - Shared components (Header, Modal, Sidebar) across applications

### CI/CD & DevOps
- 🚀 **CI/CD Ready** - Pre-configured pipelines for:
  - **GitHub Actions** (5 workflows: PR tests, main tests, scheduled tests, BDD tests, dependency updates)
  - **GitLab CI** (Complete pipeline with parallel execution)
  - **Jenkins** (Jenkinsfile with matrix builds)
- ⏰ **Scheduled Testing** - Daily regression tests with automatic issue creation on failure
- 🔄 **Automated Dependency Updates** - Weekly security audits and dependency updates with auto-PR creation
- 🐳 **Docker Support** - Containerized test execution for consistent environments
- 📦 **Artifact Management** - Automatic upload of test results, screenshots, and videos

### Developer Experience
- 📚 **Comprehensive Documentation** - Detailed guides for configuration, testing, BDD, troubleshooting, and CI/CD
- 🎛️ **Environment Template** - `.env.example` with all configuration options documented
- 🔍 **Debug Mode** - Headed mode, slow-mo, and Playwright Inspector support
- 🛡️ **Enhanced Security** - No hardcoded credentials, comprehensive .gitignore, secret management
- 🧪 **Test Isolation** - Automatic test data cleanup and isolation between test runs
- 📝 **Code Generation** - Playwright Codegen support for rapid test creation

## ⚠️ Important Note

**This is a reference architecture and starter template**, not a complete application. The example test files demonstrate patterns and structure but require your application implementation to run. See [Setup Guide](documentation/setup.md) for details on adapting this template for your project.

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **TypeScript** 5.8+
- **Playwright** 1.54+

## 🚀 Quick Start

> 💡 **New to this framework?** Check out our [Getting Started Guide](documentation/getting-started.md) for a detailed walkthrough!
> 
> 📘 **Setting up for your project?** See [Setup Guide](documentation/setup.md) for important information about using this template.

### 1. Clone the Repository

```bash
git clone https://github.com/shanaka-qe/playwright-e2e-bdd-framework-starter.git
cd playwright-e2e-bdd-framework
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Configure Environment

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your application URLs and settings
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run smoke tests
npm run test:smoke

# Run specific application tests
npm run test:webapp:ui
npm run test:adminapp:api
npm run test:mcp:api
```

## 📁 Project Structure

```
playwright-e2e-bdd-framework/
├── 📁 .github/workflows/        # CI/CD Pipelines
│   ├── pr-tests.yml             # Pull request tests
│   ├── main-tests.yml           # Main branch tests
│   ├── scheduled-tests.yml      # Scheduled regression
│   ├── bdd-tests.yml            # BDD feature tests
│   └── dependency-update.yml    # Weekly updates
│
├── 📁 config/                   # Test Configuration
│   ├── applications/            # App-specific configs
│   │   ├── webapp.config.ts
│   │   ├── adminapp.config.ts
│   │   └── mcp-server.config.ts
│   ├── environments/            # Environment configs
│   │   ├── dev.config.ts
│   │   ├── staging.config.ts
│   │   └── prod.config.ts
│   ├── playwright.config.ts     # Main Playwright config
│   ├── playwright-bdd.config.js # BDD configuration
│   └── tsconfig.base.json       # Base TypeScript config
│
├── 📁 src/                      # Source Code
│   ├── applications/            # Application-specific code
│   │   ├── webapp/              # WebApp pages & APIs
│   │   ├── adminapp/            # AdminApp pages & APIs
│   │   ├── mcp-server/          # MCP Server APIs
│   │   └── shared/              # Shared utilities
│   ├── core/                    # Core framework
│   │   ├── base/                # Base classes
│   │   ├── managers/            # Config & state managers
│   │   ├── utils/               # Utility functions
│   │   └── reporters/           # Custom reporters
│   └── data/                    # Test data management
│
├── 📁 tests/                    # Test Files (Traditional)
│   ├── webapp/                  # WebApp tests
│   │   ├── ui/
│   │   ├── api/
│   │   └── integration/
│   ├── adminapp/                # AdminApp tests
│   │   ├── ui/
│   │   ├── api/
│   │   └── integration/
│   ├── api/                     # API tests (includes MCP)
│   ├── e2e/                     # End-to-end tests
│   ├── ui/                      # UI tests
│   ├── comprehensive/           # Comprehensive workflows
│   └── utils/                   # Test utilities
│
├── 📁 features/                 # BDD Feature Files (Gherkin)
│   ├── webapp/                  # WebApp scenarios
│   │   ├── ui/
│   │   ├── api/
│   │   └── *.feature
│   ├── adminapp/                # AdminApp scenarios
│   │   ├── ui/
│   │   ├── api/
│   │   └── *.feature
│   ├── shared/                  # Shared components
│   └── steps/                   # Step definitions
│       ├── fixtures.ts
│       ├── shared/
│       └── webapp/
│
├── 📁 support/                  # Support Files
│   ├── api/                     # API helpers
│   ├── pages/                   # Page objects
│   ├── components/              # Reusable components
│   ├── helpers/                 # Helper functions
│   └── workflows/               # Workflow classes
│
├── 📁 test-data/                # Test Data Files
│   └── files/                   # Static test data files
│
├── 📁 documentation/            # Comprehensive Documentation
│   ├── setup.md                 # Project setup guide
│   ├── getting-started.md       # Getting started guide
│   ├── contributing.md          # Contribution guidelines
│   ├── configuration-guide.md   # Setup & config
│   ├── test-execution.md        # Running tests
│   ├── bdd-testing.md           # BDD guide
│   ├── ci-cd-setup.md           # CI/CD setup
│   ├── development-workflow.md  # Best practices
│   ├── api-reference.md         # API docs
│   ├── folder-structure.md      # Project org
│   └── troubleshooting.md       # Debugging
│
├── 📁 reports/                  # Test Reports
│   ├── webapp/
│   ├── adminapp/
│   ├── mcp-server/
│   └── combined/
│
├── 📁 ci/                       # CI/CD Configurations
│   ├── .gitlab-ci.yml           # GitLab CI pipeline
│   ├── Jenkinsfile              # Jenkins pipeline
│   └── README.md                # CI/CD setup guide
│
├── 📄 .gitignore                # Git ignore patterns
├── 📄 env.example               # Environment template
├── 📄 LICENSE                   # MIT License
├── 📄 README.md                 # This file
├── 📄 package.json              # Dependencies & scripts
└── 📄 tsconfig.json             # TypeScript config
```

### Key Folders

| Folder | Purpose |
|--------|---------|
| `.github/workflows/` | GitHub Actions CI/CD workflows |
| `ci/` | GitLab CI and Jenkins pipeline configurations |
| `config/` | All configuration files (apps, environments, TypeScript) |
| `documentation/` | Comprehensive guides and references (setup, contributing, etc.) |
| `src/` | Core framework code and application-specific implementations |
| `tests/` | Traditional Playwright tests (flexible, technical) |
| `features/` | BDD Gherkin scenarios (business-readable) |
| `support/` | Reusable test utilities and helpers |
| `test-data/` | Static test data files |

## 🧪 Testing Approaches

### Traditional Playwright Tests

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../src/applications/webapp/pages/HomePage';

test('should navigate to home page', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await expect(homePage.pageTitle).toBeVisible();
});
```

### BDD Tests

```gherkin
Feature: User Authentication

  Scenario: Successful login
    Given the webapp is accessible
    When I login with valid credentials
    Then I should see the dashboard
```

### API Tests

```typescript
test('should create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' }
  });
  expect(response.ok()).toBeTruthy();
});
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run default test suite |
| `npm run test:all` | Run all tests |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:regression` | Run regression tests |
| `npm run test:webapp:ui` | Run WebApp UI tests |
| `npm run test:webapp:api` | Run WebApp API tests |
| `npm run test:adminapp:ui` | Run AdminApp UI tests |
| `npm run test:mcp:api` | Run MCP Server API tests |
| `npm run test:cross-app` | Run cross-application tests |
| `npm run bdd:generate` | Generate BDD tests from features |
| `npm run test:headed` | Run tests in headed mode |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Open HTML test report |

## 🔧 Configuration

### Environment Variables

The framework uses environment variables for configuration. See `env.example` for all available options:

- **Application URLs**: Configure base URLs for each application
- **Authentication**: Set default credentials for testing
- **Test Execution**: Control parallelization, retries, timeouts
- **Browser Settings**: Headless mode, browser selection
- **Reporting**: Configure report output and formats

### Application-Specific Configs

Each application has its own configuration file in `config/applications/`:
- `webapp.config.ts` - WebApp settings
- `adminapp.config.ts` - AdminApp settings  
- `mcp-server.config.ts` - MCP Server settings

### Environment-Specific Configs

Environment configurations in `config/environments/`:
- `dev.config.ts` - Development environment
- `staging.config.ts` - Staging environment
- `prod.config.ts` - Production environment

## 🚀 CI/CD Integration

The framework includes pre-configured CI/CD pipelines for multiple platforms:

### GitHub Actions (Recommended)

Five workflows are included in `.github/workflows/`:

1. **PR Tests** - Fast smoke tests on pull requests
2. **Main Tests** - Comprehensive tests with sharding and cross-browser testing
3. **Scheduled Tests** - Daily regression tests with automatic issue creation
4. **BDD Tests** - Feature file validation and testing
5. **Dependency Updates** - Weekly security audits and automated updates

**Quick Setup:**
```bash
# Workflows are ready to use - just push to GitHub
git push origin main

# Configure secrets for environment testing (optional)
# Settings → Secrets → Actions → New repository secret
```

### GitLab CI

Complete pipeline configuration in `ci/.gitlab-ci.yml`:

```yaml
# Automatic parallel execution
# Stages: Setup → Lint → Test → Report
# Push to GitLab to start pipeline
```

### Jenkins

Jenkinsfile with matrix builds:

```groovy
// Configure in Jenkins:
// New Item → Pipeline → Pipeline from SCM
// Script Path: ci/Jenkinsfile
```

**📖 Full Guide:** [CI/CD Setup Documentation](documentation/ci-cd-setup.md)

## 📚 Documentation

Comprehensive documentation is available in the `/documentation` folder:

### 🎯 Essential Guides
- **[Setup Guide](documentation/setup.md)** - Adapting this template for your project
- **[Configuration Guide](documentation/configuration-guide.md)** - Environment setup, application configs, environment variables
- **[Test Execution](documentation/test-execution.md)** - Running tests, debugging, understanding results
- **[BDD Testing](documentation/bdd-testing.md)** - Gherkin features, step definitions, best practices

### 🚀 Advanced Guides
- **[CI/CD Setup](documentation/ci-cd-setup.md)** - GitHub Actions, GitLab CI, Jenkins pipelines
- **[Development Workflow](documentation/development-workflow.md)** - Best practices, code standards, Git workflow
- **[API Reference](documentation/api-reference.md)** - Framework APIs, utilities, custom components
- **[Folder Structure](documentation/folder-structure.md)** - Project organization, file locations
- **[Troubleshooting](documentation/troubleshooting.md)** - Common issues, solutions, debugging

### 📖 Quick Reference

| I want to... | Read this |
|-------------|-----------|
| Adapt this template | [Setup Guide](documentation/setup.md) |
| Set up the framework | [Configuration Guide](documentation/configuration-guide.md) |
| Run tests | [Test Execution Guide](documentation/test-execution.md) |
| Write BDD features | [BDD Testing Guide](documentation/bdd-testing.md) |
| Set up CI/CD | [CI/CD Setup Guide](documentation/ci-cd-setup.md) |
| Debug failures | [Troubleshooting Guide](documentation/troubleshooting.md) |
| Understand the code | [API Reference](documentation/api-reference.md) |

### 🎓 Learning Paths

**For Beginners:**
```
Main README → Configuration Guide → Test Execution Guide → BDD Testing
```

**For Test Developers:**
```
Development Workflow → API Reference → BDD Testing → Troubleshooting
```

**For DevOps Engineers:**
```
Configuration Guide → CI/CD Setup → Test Execution → Troubleshooting
```

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features  
- 📝 Documentation improvements
- 🧪 Test coverage enhancements

Please read our [Contributing Guide](documentation/contributing.md) to get started.

### Quick Contribution Steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- BDD support via [Playwright-BDD](https://github.com/vitalets/playwright-bdd)
- Inspired by enterprise testing best practices

## 📚 Additional Resources

- 📖 [Getting Started Guide](documentation/getting-started.md) - Quick setup in 10 minutes
- 🤝 [Contributing Guide](documentation/contributing.md) - How to contribute
- 📂 [Full Documentation](documentation/) - Comprehensive guides
- 🐛 [Troubleshooting](documentation/troubleshooting.md) - Common issues and solutions

## 📞 Support

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/shanaka-qe/playwright-e2e-bdd-framework-starter/issues)
- 📚 **Documentation**: `/documentation/`
- 🐛 **Issues**: [GitHub Issues](https://github.com/shanaka-qe/playwright-e2e-bdd-framework-starter/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/shanaka-qe/playwright-e2e-bdd-framework-starter/discussions)

---

**Made with ❤️ for the QA Community**

*This framework is derived from a real-world enterprise E2E testing solution. Star ⭐ this repo if you find it helpful!*

*Enterprise-grade • Scalable • Maintainable • Open Source*

