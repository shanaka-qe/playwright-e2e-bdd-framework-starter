# Playwright E2E BDD Framework

[![Playwright](https://img.shields.io/badge/Playwright-1.54.1-green.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![BDD](https://img.shields.io/badge/BDD-Playwright--BDD-yellow.svg)](https://github.com/vitalets/playwright-bdd)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise-grade test automation framework for multi-application testing with Playwright and BDD support**

A comprehensive, scalable, and maintainable end-to-end testing framework built with Playwright and Playwright-BDD. Designed for testing multiple applications (WebApp, AdminApp, API Server) with a professional architecture suitable for enterprise environments.

## ✨ Features

- 🎯 **Multi-Application Support** - Separate configurations for WebApp, AdminApp, and API testing
- 🥒 **BDD Integration** - Gherkin feature files with Playwright-BDD for behavior-driven development
- 🌍 **Environment Management** - Development, Staging, and Production configurations
- 🔄 **Parallel Execution** - Optimized test performance with configurable workers
- 📊 **Comprehensive Reporting** - HTML, JSON, JUnit, and custom reports
- 🧪 **Test Organization** - UI, API, Integration, and Cross-Application test suites
- 🎨 **Page Object Model** - Maintainable test architecture with reusable components
- 🔧 **Type-Safe** - Full TypeScript support with strong typing
- 🚀 **CI/CD Ready** - Pre-configured for GitHub Actions, Jenkins, and other CI platforms
- 📱 **Cross-Browser Testing** - Chrome, Firefox, Safari, and Mobile support

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **TypeScript** 5.8+
- **Playwright** 1.54+

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/playwright-e2e-bdd-framework.git
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
├── config/                      # Test configuration
│   ├── applications/            # App-specific configs
│   ├── environments/            # Environment configs
│   └── playwright.config.ts     # Main Playwright config
├── src/                         # Source code
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
├── tests/                       # Test files
│   ├── webapp/                  # WebApp tests
│   ├── adminapp/                # AdminApp tests
│   ├── mcp-server/              # MCP Server tests
│   └── cross-app/               # Cross-application workflows
├── features/                    # BDD feature files
│   ├── webapp/                  # WebApp scenarios
│   ├── adminapp/                # AdminApp scenarios
│   └── steps/                   # Step definitions
├── support/                     # Support files
│   ├── api/                     # API helpers
│   ├── pages/                   # Page objects
│   ├── components/              # Reusable components
│   └── helpers/                 # Helper functions
├── documentation/               # Comprehensive docs
└── reports/                     # Test reports
```

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

## 📚 Documentation

Comprehensive documentation is available in the `/documentation` folder:

- [Configuration Guide](documentation/configuration-guide.md) - Complete configuration reference
- [Test Execution](documentation/test-execution.md) - Running and managing tests
- [BDD Testing](documentation/bdd-testing.md) - Behavior-driven development guide
- [Development Workflow](documentation/development-workflow.md) - Best practices
- [API Reference](documentation/api-reference.md) - Framework API documentation
- [Troubleshooting](documentation/troubleshooting.md) - Common issues and solutions
- [Folder Structure](documentation/folder-structure.md) - Project organization details

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- BDD support via [Playwright-BDD](https://github.com/vitalets/playwright-bdd)
- Inspired by enterprise testing best practices

## 📞 Support

- 📧 **Email**: your-qa-team@example.com
- 📚 **Documentation**: `/documentation/`
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/playwright-e2e-bdd-framework/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/playwright-e2e-bdd-framework/discussions)

---

**Made with ❤️ for the QA Community**

*Enterprise-grade • Scalable • Maintainable • Open Source*

