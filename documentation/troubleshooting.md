# Troubleshooting and FAQ

**Complete Guide to Resolving Common Issues in the Playwright E2E Framework**

## 🎯 Overview

This guide addresses common issues, error scenarios, and troubleshooting techniques for the Playwright E2E Testing Framework. It provides practical solutions and debugging strategies to help maintain a stable and reliable testing environment.

## 🏥 Quick Diagnosis

### **Framework Health Check**

```bash
# Run comprehensive framework validation
npm run framework:validate

# Check environment configuration
npm run framework:validate-env

# Verify test data setup
npm run data:validate

# Check browser installations
npx playwright install --dry-run
```

### **Common Issue Categories**

| Issue Type | Quick Fix Command | Details |
|------------|-------------------|---------|
| **Configuration** | `npm run framework:validate-env` | [Configuration Issues](#-configuration-issues) |
| **Dependencies** | `npm install && npx playwright install` | [Installation Issues](#-installation-issues) |
| **Test Failures** | `npm run test:debug -- <test-name>` | [Test Execution Issues](#-test-execution-issues) |
| **BDD Issues** | `npm run bdd:generate` | [BDD and Step Definition Issues](#-bdd-and-step-definition-issues) |
| **Performance** | `npm run test -- --workers=1` | [Performance Issues](#-performance-issues) |

---

## 🔧 Installation Issues

### **Problem: npm install fails**

**Error Messages:**
```bash
npm ERR! peer dep missing: playwright@^1.54.0
npm ERR! Could not resolve dependency
```

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Update Node.js version:**
```bash
# Check current version
node --version

# Install Node.js 18+ if needed
nvm install 18
nvm use 18
```

3. **Fix peer dependencies:**
```bash
npm install --legacy-peer-deps
```

### **Problem: Playwright browser installation fails**

**Error Messages:**
```bash
Failed to download Chromium 123.0.6312.58
Browser download failed
```

**Solutions:**

1. **Manual browser installation:**
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

2. **Install with system dependencies:**
```bash
npx playwright install --with-deps
```

3. **Behind corporate firewall:**
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
npx playwright install
```

4. **Use different download host:**
```bash
PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com npx playwright install
```

### **Problem: TypeScript compilation errors**

**Error Messages:**
```bash
error TS2307: Cannot find module '@playwright/test'
error TS2322: Type 'string' is not assignable to type 'never'
```

**Solutions:**

1. **Reinstall TypeScript types:**
```bash
npm install --save-dev @types/node typescript
npx tsc --init
```

2. **Update tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## ⚙️ Configuration Issues

### **Problem: Environment configuration not loading**

**Error Messages:**
```bash
Configuration file not found: ./config/environments/staging.config.ts
TypeError: Cannot read property 'baseUrl' of undefined
```

**Solutions:**

1. **Verify environment files exist:**
```bash
ls -la config/environments/
# Should show: dev.config.ts, staging.config.ts, prod.config.ts
```

2. **Check NODE_ENV variable:**
```bash
echo $NODE_ENV
# Should show: development, staging, or production
```

3. **Create missing environment config:**
```bash
cp config/environments/dev.config.ts config/environments/staging.config.ts
# Edit staging.config.ts with correct values
```

4. **Validate configuration syntax:**
```bash
npx tsc --noEmit config/environments/staging.config.ts
```

### **Problem: Base URLs not resolving**

**Error Messages:**
```bash
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001
Timeout waiting for navigation to finish
```

**Solutions:**

1. **Check application is running:**
```bash
curl http://localhost:3001/health
# Should return 200 OK
```

2. **Verify environment variables:**
```bash
echo $UI_BASE_URL
echo $ADMIN_BASE_URL
echo $MCP_PLATFORM_URL
```

3. **Update .env.local file:**
```bash
UI_BASE_URL=http://localhost:3001
ADMIN_BASE_URL=http://localhost:3021
MCP_PLATFORM_URL=http://localhost:3002
```

4. **Use different ports if conflicted:**
```bash
# Check what's running on ports
lsof -i :3001
lsof -i :3021
lsof -i :3002
```

### **Problem: Application-specific configs not found**

**Error Messages:**
```bash
Cannot find module './applications/webapp.config'
Module resolution failed
```

**Solutions:**

1. **Check config files exist:**
```bash
ls -la config/applications/
# Should show all application config files
```

2. **Fix import paths in playwright.config.ts:**
```typescript
// Correct import
import { webappConfig } from './applications/webapp.config';

// Instead of relative path issues
import { webappConfig } from '../applications/webapp.config';
```

---

## 🧪 Test Execution Issues

### **Problem: Tests timing out**

**Error Messages:**
```bash
Test timeout of 30000ms exceeded
page.waitForSelector: Timeout 30000ms exceeded
```

**Solutions:**

1. **Increase timeout for specific tests:**
```typescript
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // Test implementation
});
```

2. **Adjust global timeout:**
```typescript
// In playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 10000 // 10 seconds for assertions
  }
});
```

3. **Wait for specific conditions:**
```typescript
// Wait for network idle instead of fixed time
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-testid="dashboard-loaded"]');
```

### **Problem: Element not found errors**

**Error Messages:**
```bash
page.click: Error: Element not found
locator.fill: Target element is not an <input>
```

**Solutions:**

1. **Use more robust selectors:**
```typescript
// Better: Use data-testid
await page.click('[data-testid="submit-button"]');

// Instead of: CSS selectors that might change
await page.click('.btn.btn-primary:nth-child(2)');
```

2. **Wait for elements before interaction:**
```typescript
// Wait for element to be visible
await page.locator('[data-testid="submit-button"]').waitFor({ state: 'visible' });
await page.click('[data-testid="submit-button"]');

// Wait for element to be enabled
await page.locator('[data-testid="submit-button"]').waitFor({ state: 'attached' });
```

3. **Debug element selection:**
```typescript
// Add debugging to find correct selector
await page.screenshot({ path: 'debug-before-click.png' });
console.log(await page.content()); // Log page content
await page.locator('button').first().click(); // Use first() if multiple elements
```

### **Problem: Tests failing randomly (flaky tests)**

**Error Messages:**
```bash
Test passes locally but fails in CI
Intermittent "Element not found" errors
Race condition detected
```

**Solutions:**

1. **Add proper waits:**
```typescript
// Wait for API calls to complete
await page.waitForResponse(response => response.url().includes('/api/data'));

// Wait for animations to complete
await page.waitForTimeout(500);

// Wait for element state changes
await expect(page.locator('.loading')).toHaveCount(0);
```

2. **Use retry mechanisms:**
```typescript
// Retry flaky operations
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await page.click('[data-testid="submit"]');
    break; // Success, exit retry loop
  } catch (error) {
    if (i === maxRetries - 1) throw error; // Last attempt failed
    await page.waitForTimeout(1000); // Wait before retry
  }
}
```

3. **Configure retries in playwright.config.ts:**
```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // Retry twice in CI
  use: {
    // Add small delay between actions
    actionTimeout: 10000,
    navigationTimeout: 30000
  }
});
```

### **Problem: Authentication failures**

**Error Messages:**
```bash
Login failed: Invalid credentials
Session expired during test execution
Unauthorized access to protected routes
```

**Solutions:**

1. **Verify test credentials:**
```typescript
// Check test user credentials in TestDataManager
const testUser = testWorld.getTestUser('admin');
console.log('Using credentials:', testUser.email);
```

2. **Handle session management:**
```typescript
// Store session state for reuse
await page.context().storageState({ path: 'auth-state.json' });

// Reuse stored authentication
const context = await browser.newContext({ storageState: 'auth-state.json' });
```

3. **Debug authentication flow:**
```typescript
// Add debugging to login process
await page.goto('/login');
await page.screenshot({ path: 'debug-login-form.png' });

await page.fill('[data-testid="email"]', email);
await page.fill('[data-testid="password"]', password);
await page.click('[data-testid="login-button"]');

// Wait and verify successful login
await page.waitForURL('**/dashboard');
await page.screenshot({ path: 'debug-after-login.png' });
```

---

## 🎭 BDD and Step Definition Issues

### **Problem: BDD test generation fails**

**Error Messages:**
```bash
playwright-bdd: Feature files not found
No step definitions found for: "Given I am on the login page"
Cucumber expression compilation failed
```

**Solutions:**

1. **Verify BDD configuration:**
```javascript
// Check playwright-bdd.config.js
const { defineBddConfig } = require('playwright-bdd');

const testDir = defineBddConfig({
  featuresRoot: './features',
  steps: './features/steps/**/*.ts'
});
```

2. **Check feature file locations:**
```bash
find features -name "*.feature" -type f
# Should list all feature files
```

3. **Regenerate BDD tests:**
```bash
rm -rf .features-gen/
npm run bdd:generate
```

4. **Validate Gherkin syntax:**
```bash
npx gherkin-lint features/**/*.feature
```

### **Problem: Step definitions not found**

**Error Messages:**
```bash
Step definition not found: "When I click the submit button"
Multiple step definitions match the same pattern
```

**Solutions:**

1. **Check step definition files:**
```bash
find features/steps -name "*.ts" -type f
# Should list all step definition files
```

2. **Verify step imports:**
```typescript
// Make sure all step files are imported in fixtures.ts
import './shared/common-steps';
import './webapp/navigation-steps';
import './adminapp/user-management-steps';
```

3. **Check step pattern matching:**
```typescript
// Make sure step patterns match exactly
Given('I am on the {string} page', async ({ page }, pageName) => {
  // Implementation
});

// Feature file should use exactly the same pattern
Given I am on the "login" page
```

### **Problem: BDD fixtures not working**

**Error Messages:**
```bash
testWorld is undefined
navigationHelper is not available in test context
```

**Solutions:**

1. **Check fixture definitions:**
```typescript
// In features/steps/fixtures.ts
export const test = base.extend<TestFixtures>({
  testWorld: async ({ page }, use) => {
    const testWorld = new TestWorld(page);
    await testWorld.initialize();
    await use(testWorld);
    await testWorld.cleanup();
  }
});
```

2. **Verify fixture usage in steps:**
```typescript
// Use fixtures correctly in step definitions
Given('I am on the dashboard', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToDashboard();
  await testWorld.waitForPageLoad();
});
```

---

## ⚡ Performance Issues

### **Problem: Slow test execution**

**Error Messages:**
```bash
Tests taking longer than expected
High memory usage during test runs
Browser processes not terminating
```

**Solutions:**

1. **Optimize parallel execution:**
```bash
# Run tests with optimal worker count
npx playwright test --workers=50%

# For CI environments
npx playwright test --workers=2
```

2. **Use test sharding:**
```bash
# Split tests across multiple machines
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

3. **Optimize browser usage:**
```typescript
// In playwright.config.ts
export default defineConfig({
  use: {
    // Reuse browser contexts
    reuseExistingServer: !process.env.CI,
    
    // Disable video/screenshots for faster execution
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: process.env.CI ? 'only-on-failure' : 'off'
  }
});
```

### **Problem: Memory leaks**

**Error Messages:**
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit
Out of memory errors during test execution
```

**Solutions:**

1. **Limit concurrent browsers:**
```typescript
// In playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 1 : 2, // Limit workers
  use: {
    // Close pages after each test
    video: 'off',
    screenshot: 'off'
  }
});
```

2. **Proper cleanup in tests:**
```typescript
test.afterEach(async ({ page, context }) => {
  // Close all pages in context
  await Promise.all(
    context.pages().map(page => page.close())
  );
});
```

3. **Monitor resource usage:**
```bash
# Monitor memory usage during tests
npm run test -- --reporter=line | tee test-output.log
# Check for memory patterns in logs
```

---

## 📊 Reporting Issues

### **Problem: Reports not generating**

**Error Messages:**
```bash
HTML report not found
JSON results file empty
Report directory not created
```

**Solutions:**

1. **Check report configuration:**
```typescript
// In playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: '../reports/combined/html-report'
    }],
    ['json', { 
      outputFile: '../reports/combined/results.json' 
    }]
  ]
});
```

2. **Verify report directories exist:**
```bash
mkdir -p reports/combined/html-report
mkdir -p reports/webapp
mkdir -p reports/adminapp
```

3. **Check file permissions:**
```bash
chmod -R 755 reports/
```

### **Problem: Custom reporter errors**

**Error Messages:**
```bash
Custom reporter failed to load
Reporter method not implemented
```

**Solutions:**

1. **Verify reporter implementation:**
```typescript
// CustomReporter.ts must implement Reporter interface
export class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    // Implementation required
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    // Implementation required
  }
  
  onEnd(): void {
    // Implementation required
  }
}
```

2. **Check reporter path in config:**
```typescript
// Correct path to custom reporter
reporter: [
  ['./src/core/reporters/CustomReporter.ts']
]
```

---

## 🌐 CI/CD Issues

### **Problem: Tests pass locally but fail in CI**

**Common Causes and Solutions:**

1. **Different environment variables:**
```bash
# In CI pipeline, ensure all required env vars are set
env:
  NODE_ENV: staging
  UI_BASE_URL: https://staging.example.com
  HEADLESS: true
```

2. **Different screen resolution:**
```typescript
// Set consistent viewport in tests
use: {
  viewport: { width: 1280, height: 720 }
}
```

3. **Timing differences:**
```typescript
// Increase timeouts for CI
timeout: process.env.CI ? 60000 : 30000,
```

### **Problem: Docker container issues**

**Error Messages:**
```bash
Browser launch failed in Docker
Permission denied for browser executable
```

**Solutions:**

1. **Use official Playwright Docker image:**
```dockerfile
FROM mcr.microsoft.com/playwright:v1.54.1-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "run", "test"]
```

2. **Install dependencies in container:**
```bash
# In Dockerfile
RUN npx playwright install --with-deps
```

---

## 🔍 Debugging Techniques

### **Interactive Debugging**

1. **Run single test in debug mode:**
```bash
npx playwright test --debug tests/webapp/ui/login.spec.ts
```

2. **Use headed mode for visual debugging:**
```bash
npm run test:headed
```

3. **Add breakpoints in VS Code:**
```typescript
test('debug example', async ({ page }) => {
  debugger; // Will pause here when debugging
  await page.goto('/login');
});
```

### **Screenshot and Video Debugging**

1. **Generate screenshots for failing tests:**
```typescript
test('failing test', async ({ page }) => {
  await page.goto('/dashboard');
  await page.screenshot({ path: 'debug-screenshot.png' });
  // Test continues...
});
```

2. **Enable video recording:**
```typescript
// In playwright.config.ts
use: {
  video: 'retain-on-failure',
  screenshot: 'only-on-failure'
}
```

### **Network Debugging**

1. **Log network requests:**
```typescript
test('network debug', async ({ page }) => {
  page.on('request', request => {
    console.log('Request:', request.method(), request.url());
  });
  
  page.on('response', response => {
    console.log('Response:', response.status(), response.url());
  });
  
  await page.goto('/dashboard');
});
```

2. **Mock network responses for testing:**
```typescript
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Test User' }])
  });
});
```

---

## ❓ Frequently Asked Questions

### **Framework Setup**

**Q: How do I add a new application to test?**

A: Follow these steps:
1. Create application config: `config/applications/new-app.config.ts`
2. Add application structure: `src/applications/new-app/`
3. Create test directories: `tests/new-app/`
4. Update Playwright config to include new projects
5. Add npm scripts for the new application

**Q: Can I run tests against different environments simultaneously?**

A: No, each test run targets one environment. Run separate commands:
```bash
NODE_ENV=staging npm run test:smoke &
NODE_ENV=production npm run test:smoke &
```

**Q: How do I skip tests in certain environments?**

A: Use conditional test skipping:
```typescript
test.skip(process.env.NODE_ENV === 'production', 'Skip in production');
```

### **Test Development**

**Q: Should I use Playwright tests or BDD scenarios?**

A: Use both strategically:
- **BDD**: For business-critical workflows and stakeholder communication
- **Playwright**: For technical testing and rapid development

**Q: How do I handle dynamic data in tests?**

A: Use data factories and generators:
```typescript
const user = new UserBuilder()
  .withRandomEmail()
  .withRole('admin')
  .build();
```

**Q: What's the best way to handle test dependencies?**

A: Avoid test dependencies. Make each test independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Set up test data for this specific test
  await setupTestData();
});
```

### **Performance and Maintenance**

**Q: How often should I update Playwright?**

A: Update monthly for patches, quarterly for minor versions:
```bash
npm update @playwright/test
npx playwright install
```

**Q: How do I handle test data cleanup?**

A: Implement cleanup in test hooks:
```typescript
test.afterEach(async () => {
  await testDataManager.cleanup();
});
```

**Q: What's causing my tests to be slow?**

A: Common causes:
1. Unnecessary waits (`page.waitForTimeout()`)
2. Too many screenshots/videos
3. Not using parallel execution
4. Heavy test data setup

---

## 📞 Getting Help

### **Internal Resources**
- **Team Wiki**: Framework-specific documentation
- **Slack Channel**: #qa-automation-support  
- **Code Reviews**: Get help from team members
- **Office Hours**: Weekly QA framework support sessions

### **External Resources**
- **Playwright Documentation**: https://playwright.dev/
- **Playwright-BDD**: https://github.com/vitalets/playwright-bdd
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

### **Escalation Process**
1. **Level 1**: Check this troubleshooting guide
2. **Level 2**: Search team wiki and previous issues
3. **Level 3**: Ask in team Slack channel
4. **Level 4**: Create detailed issue with reproduction steps
5. **Level 5**: Escalate to framework maintainers

### **Creating Effective Bug Reports**

When reporting issues, include:

```
**Environment:**
- Node.js version: 
- Playwright version:
- Operating System:
- Browser versions:

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Code Sample:**
[Minimal code that reproduces the issue]

**Error Messages:**
[Full error messages and stack traces]

**Additional Context:**
[Screenshots, videos, logs]
```

This troubleshooting guide covers the most common issues and provides practical solutions to maintain a reliable and efficient testing framework. Keep it bookmarked for quick reference during development and debugging sessions.