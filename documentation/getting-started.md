# Getting Started with Playwright E2E BDD Framework

A quick-start guide to get you up and running with this framework in under 10 minutes!

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** installed
- ✅ **VS Code** (recommended IDE)

### Verify Installation

```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
git --version   # Any recent version
```

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/playwright-e2e-bdd-framework.git
cd playwright-e2e-bdd-framework
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install
```

This will install:
- Playwright and test runner
- Playwright-BDD for behavior-driven testing
- TypeScript and type definitions
- All necessary dependencies

### Step 3: Configure Environment

```bash
# Copy the environment template
cp env.example .env

# Edit with your settings (optional for local testing)
nano .env  # or use any text editor
```

**Default .env values work out of the box for local testing!**

### Step 4: Run Your First Test

```bash
# Run smoke tests
npm run test:smoke
```

You should see test execution in your terminal! 🎉

## 📁 Project Structure Overview

Here's what you need to know:

```
playwright-e2e-bdd-framework/
├── 📁 config/              # All configuration files
│   ├── applications/       # WebApp, AdminApp, MCP configs
│   ├── environments/       # Dev, Staging, Prod settings
│   └── playwright.config.ts
│
├── 📁 tests/              # Traditional Playwright tests
│   ├── webapp/            # WebApp tests
│   ├── adminapp/          # AdminApp tests
│   └── e2e/               # End-to-end workflows
│
├── 📁 features/           # BDD Gherkin scenarios
│   ├── webapp/            # WebApp features
│   ├── adminapp/          # AdminApp features
│   └── steps/             # Step definitions
│
├── 📁 src/                # Framework source code
│   ├── applications/      # App-specific implementations
│   └── core/              # Core framework utilities
│
└── 📁 documentation/      # Comprehensive guides
```

## 🧪 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run smoke tests (quick validation)
npm run test:smoke

# Run regression tests (comprehensive)
npm run test:regression

# Run specific application tests
npm run test:webapp:ui
npm run test:adminapp:api
npm run test:mcp:api
```

### BDD Tests

```bash
# Generate BDD tests from feature files
npm run bdd:generate

# Run BDD tests
npm run test:bdd

# Run BDD tests for specific app
npm run bdd:webapp
npm run bdd:adminapp
```

### Advanced Options

```bash
# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests in UI mode (interactive)
npm run test:ui

# View test report
npm run test:report
```

## 🎯 Your First Test

### Option 1: Traditional Playwright Test

Create `tests/webapp/ui/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Application/i);
});
```

Run it:
```bash
npm run test:webapp:ui -- my-first-test
```

### Option 2: BDD Test

Create `features/webapp/ui/my-first-feature.feature`:

```gherkin
Feature: Homepage

  Scenario: User visits homepage
    Given I am on the homepage
    Then I should see the application title
```

Create step definition in `features/steps/webapp/my-steps.ts`:

```typescript
import { Given, Then } from '@playwright/test';
import { expect } from '@playwright/test';

Given('I am on the homepage', async ({ page }) => {
  await page.goto('/');
});

Then('I should see the application title', async ({ page }) => {
  await expect(page.locator('h1')).toBeVisible();
});
```

Generate and run:
```bash
npm run bdd:generate
npm run test:bdd
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```bash
# Application URLs
WEBAPP_URL=http://localhost:3000
ADMINAPP_URL=http://localhost:3001
MCP_SERVER_URL=http://localhost:3002

# Test Settings
NODE_ENV=development
HEADLESS=true
WORKERS=4

# Database (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testdb
```

### Test Configuration

Modify `config/playwright.config.ts` for:
- Browser settings
- Timeout values
- Reporter options
- Retry policies
- Parallel execution

## 🐛 Debugging

### VS Code Debugging

1. Install **Playwright Test for VS Code** extension
2. Open test file
3. Click "Debug" button in the editor
4. Or use `F5` to start debugging

### Browser Debugging

```bash
# Open Playwright Inspector
npm run test:debug

# Run with headed browser
npm run test:headed

# Generate test code
npm run test:codegen
```

### Common Issues

**Issue: Tests timing out**
```bash
# Increase timeout in config/playwright.config.ts
timeout: 60000  # 60 seconds
```

**Issue: Browser not found**
```bash
# Reinstall browsers
npx playwright install --force
```

**Issue: Import errors**
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

### Learn More

1. **Read Documentation**
   - [Configuration Guide](documentation/configuration-guide.md)
   - [BDD Testing Guide](documentation/bdd-testing.md)
   - [Test Execution Guide](documentation/test-execution.md)
   - [API Reference](documentation/api-reference.md)

2. **Explore Examples**
   - Check `tests/` for traditional test examples
   - Check `features/` for BDD examples
   - Review page objects in `src/applications/`

3. **Set Up CI/CD**
   - GitHub Actions: `.github/workflows/`
   - GitLab CI: `ci/.gitlab-ci.yml`
   - Jenkins: `ci/Jenkinsfile`

### Development Workflow

```bash
# 1. Create a new feature branch
git checkout -b feature/my-feature

# 2. Write your tests
# - Add test files to tests/ or features/
# - Create page objects in src/applications/

# 3. Run tests locally
npm run test:smoke

# 4. Commit and push
git add .
git commit -m "feat: add my feature tests"
git push origin feature/my-feature
```

## 🆘 Getting Help

### Resources

- 📖 [Full Documentation](documentation/)
- 🐛 [Troubleshooting Guide](documentation/troubleshooting.md)
- 💬 [GitHub Discussions](https://github.com/yourusername/playwright-e2e-bdd-framework/discussions)
- 🐞 [Report Issues](https://github.com/yourusername/playwright-e2e-bdd-framework/issues)

### Community

- **Questions?** Open a discussion
- **Bugs?** Create an issue
- **Contributions?** See [Contributing Guide](contributing.md)

## ✅ Checklist

Before you start testing, make sure:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Environment configured (`.env` file)
- [ ] Smoke tests passing (`npm run test:smoke`)
- [ ] IDE set up (VS Code with Playwright extension)

## 🎉 You're Ready!

Congratulations! You're all set to start writing and running tests.

**Quick Command Reference:**
```bash
npm test              # Run all tests
npm run test:smoke    # Quick smoke tests
npm run test:headed   # See browser
npm run test:debug    # Debug mode
npm run test:ui       # Interactive UI mode
npm run test:report   # View HTML report
```

Happy Testing! 🚀

