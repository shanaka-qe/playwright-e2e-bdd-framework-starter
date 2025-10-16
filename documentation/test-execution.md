# Test Execution Guide

**Complete Guide to Running Tests in the Playwright E2E Framework**

## 🎯 Overview

This guide covers all aspects of test execution, from basic test runs to advanced scenarios including environment-specific testing, parallel execution, and CI/CD integration.

## 🚀 Quick Start

### **Basic Test Execution**

```bash
# Run default smoke tests
npm run test

# Run all tests
npm run test:all

# Run with UI (interactive mode)
npm run test:ui
```

---

## 🎯 Application-Specific Testing

### **WebApp Tests**

```bash
# WebApp UI Tests
npm run test:webapp:ui

# WebApp API Tests  
npm run test:webapp:api

# All WebApp Tests
npm run test:webapp:ui && npm run test:webapp:api
```

**Example Output:**
```bash
🚀 Starting WebApp UI Tests
📊 Running 15 tests across 1 project
🌍 Environment: development
🎯 Base URL: http://localhost:3001

✅ Login functionality - PASSED (2.3s)
✅ Document upload workflow - PASSED (4.1s)  
✅ Feature generation process - PASSED (8.7s)
❌ Advanced navigation - FAILED (1.2s)

📈 Results: 14/15 passed (93%)
📁 Reports: reports/webapp/html-report/index.html
```

### **AdminApp Tests**

```bash
# AdminApp UI Tests
npm run test:adminapp:ui

# AdminApp API Tests
npm run test:adminapp:api

# AdminApp Integration Tests
npm run test:adminapp:integration
```

### **MCP Server Tests**

```bash
# MCP Server API Tests
npm run test:mcp:api

# MCP Integration Tests  
npm run test:mcp:integration
```

### **Cross-Application Tests**

```bash
# End-to-end workflows spanning multiple apps
npm run test:cross-app
```

---

## 🌍 Environment-Specific Testing

### **Development Environment**

```bash
# Development testing (default)
NODE_ENV=development npm run test:smoke

# With debug output
NODE_ENV=development DEBUG=true npm run test:smoke
```

**Development Characteristics:**
- Longer timeouts for debugging
- No test retries for faster feedback
- Sequential execution for easier debugging
- Verbose logging enabled
- Test data preserved for inspection

### **Staging Environment**

```bash
# Staging smoke tests
NODE_ENV=staging npm run test:smoke

# Staging regression tests
NODE_ENV=staging npm run test:regression

# Full staging test suite
NODE_ENV=staging npm run test:all
```

**Staging Characteristics:**
- Production-like URLs and data
- Moderate retry policies
- Parallel execution enabled
- Comprehensive test coverage
- Data cleanup after tests

### **Production Environment**

```bash
# Production smoke tests (read-only)
NODE_ENV=production npm run test:smoke

# Production health checks
NODE_ENV=production npm run test:health
```

**Production Characteristics:**
- Fast timeouts for quick feedback
- Higher retry counts for stability
- Maximum parallelism
- Read-only operations only
- Minimal logging

---

## 🧪 BDD Test Execution

### **BDD Test Generation**

Before running BDD tests, generate test files from feature files:

```bash
# Generate BDD tests from Gherkin features
npm run bdd:generate
```

**Output:**
```bash
✅ Generated 25 test files from 8 feature files
📁 Output: .features-gen/
🎯 Features processed:
   - webapp/ui/*.feature (12 scenarios)
   - adminapp/ui/*.feature (8 scenarios)  
   - mcp-server/api/*.feature (5 scenarios)
```

### **Running BDD Tests**

```bash
# Run all BDD tests
npm run test:bdd:all

# BDD tests by application
npm run bdd:webapp        # WebApp BDD scenarios
npm run bdd:adminapp      # AdminApp BDD scenarios  
npm run bdd:mcp           # MCP Server BDD scenarios

# BDD tests by tag
npm run bdd:critical      # Critical scenarios only
```

### **BDD Test Example**

```gherkin
@webapp @navigation @smoke
Scenario: Navigate through main tabs
  Given the webapp is accessible
  When I click on the "Document Hub" tab  
  Then I should be on the Document Hub page
  And the "Document Hub" tab should be active
```

**Generated Test Output:**
```bash
✅ webapp navigation » Navigate through main tabs - PASSED (3.2s)
   ✅ Given the webapp is accessible
   ✅ When I click on the "Document Hub" tab
   ✅ Then I should be on the Document Hub page  
   ✅ And the "Document Hub" tab should be active
```

---

## 🎛️ Advanced Test Execution Options

### **Cross-Browser Testing**

```bash
# Enable cross-browser testing
CROSS_BROWSER=true npm run test:smoke

# Specific browsers
npx playwright test --config=config/playwright.config.ts --project=webapp-firefox
npx playwright test --config=config/playwright.config.ts --project=webapp-webkit
```

### **Mobile Testing**

```bash
# Enable mobile testing
MOBILE_TESTS=true npm run test:webapp:ui

# Specific mobile devices
npx playwright test --config=config/playwright.config.ts --project=webapp-mobile-chrome
npx playwright test --config=config/playwright.config.ts --project=webapp-mobile-safari
```

### **Headed vs Headless Testing**

```bash
# Run tests with browser visible (headed)
npm run test:headed

# Force headless mode
HEADLESS=true npm run test

# Interactive debugging
npm run test:debug
```

### **Test Filtering and Selection**

```bash
# Run specific test file
npx playwright test tests/webapp/ui/login.spec.ts --config=config/playwright.config.ts

# Run tests matching pattern
npx playwright test --config=config/playwright.config.ts --grep "login"

# Run tests with specific tags
npx playwright test --config=config/playwright.config.ts --grep "@smoke"

# Exclude specific tests
npx playwright test --config=config/playwright.config.ts --grep-invert "@slow"
```

---

## ⚡ Performance and Optimization

### **Parallel Execution**

```bash
# Control number of workers
npx playwright test --config=config/playwright.config.ts --workers=4

# Maximum parallelism
npx playwright test --config=config/playwright.config.ts --workers=100%

# Sequential execution (debugging)
npx playwright test --config=config/playwright.config.ts --workers=1
```

### **Test Sharding**

For very large test suites, distribute across multiple machines:

```bash
# Shard 1 of 4
npx playwright test --config=config/playwright.config.ts --shard=1/4

# Shard 2 of 4  
npx playwright test --config=config/playwright.config.ts --shard=2/4
```

### **Optimization Tips**

1. **Use Test Projects**: Group related tests for better organization
2. **Enable Parallelism**: Use multiple workers for faster execution
3. **Smart Test Selection**: Run only relevant tests in development
4. **Resource Management**: Optimize browser reuse and memory usage

---

## 📊 Test Results and Reporting

### **Report Types**

The framework generates multiple report formats:

#### **HTML Reports**
```bash
# View HTML report
npm run test:report

# Application-specific reports
open reports/webapp/html-report/index.html
open reports/adminapp/html-report/index.html
open reports/combined/html-report/index.html
```

#### **JSON Reports**
```bash
# View JSON results (machine-readable)
cat reports/webapp/results.json
cat reports/combined/results.json
```

#### **JUnit Reports**
```bash
# For CI/CD integration
cat reports/webapp/junit-results.xml
cat reports/combined/junit-results.xml
```

#### **Custom Reports**
```bash
# Framework-specific custom reports  
npm run test:custom-report
open test-results/custom-reports/metrics-report.html
```

### **Understanding Test Results**

#### **Console Output**
```bash
🚀 Starting E2E Test Suite
📊 Running 25 tests across 3 projects  
🌍 Environment: development
🎯 Base URL: http://localhost:3001

Projects:
  ✅ webapp-ui: 12/12 passed (45.2s)
  ✅ adminapp-ui: 8/8 passed (32.1s)
  ❌ mcp-server-api: 4/5 passed (18.7s)

📈 Test Results Summary:
   Total: 25
   ✅ Passed: 24 (96%)
   ❌ Failed: 1 (4%)
   ⏭️  Skipped: 0
   🔄 Flaky: 0
   ⏱️  Duration: 96.0s
   📈 Avg Test Duration: 3.84s

🎯 Overall Status: FAILED
📁 Detailed reports saved to: reports/combined/
```

#### **Failed Test Details**
```bash
❌ MCP Server API Tests › Text Generation › should generate coherent text

Error: expect(received).toContain(expected)

Expected substring: "artificial intelligence"
Received: ""

    at tests/mcp-server/api/text-generation.spec.ts:25:5

📸 Screenshot: reports/mcp-server/artifacts/test-failed-1.png
🎬 Video: reports/mcp-server/artifacts/test-failed-1.webm  
🔍 Trace: reports/mcp-server/artifacts/trace.zip
```

---

## 🔧 Debugging and Troubleshooting

### **Debug Mode**

```bash
# Run single test in debug mode
npm run test:debug -- tests/webapp/ui/login.spec.ts

# Debug with browser visible
HEADLESS=false npm run test:debug
```

### **Visual Debugging**

```bash
# Generate and view screenshots
npm run test -- --screenshot=on

# Record videos of test execution
npm run test -- --video=on

# Generate traces for failed tests
npm run test -- --trace=retain-on-failure
```

### **Step-by-Step Debugging**

```bash
# Slow down test execution
SLOW_MO=1000 npm run test

# Interactive debugging with browser DevTools
npx playwright test --config=config/playwright.config.ts --debug
```

### **Logging and Diagnostics**

```bash
# Enable debug logging
DEBUG=pw:api npm run test

# Verbose Playwright logging  
DEBUG=pw:* npm run test

# Custom framework logging
DEBUG=app:* npm run test
```

---

## 🚀 CI/CD Integration

### **GitHub Actions**

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [webapp-ui, adminapp-ui, mcp-server-api]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run tests
        run: npm run test -- --project=${{ matrix.project }}
        env:
          NODE_ENV: staging
          
      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results-${{ matrix.project }}
          path: reports/
```

### **Jenkins Pipeline**

```groovy
pipeline {
    agent any
    
    environment {
        NODE_ENV = 'staging'
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('WebApp Tests') {
                    steps {
                        sh 'npm run test:webapp:ui'
                    }
                }
                stage('AdminApp Tests') {
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
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports/combined/html-report',
                reportFiles: 'index.html',
                reportName: 'Test Report'
            ])
            
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
        }
    }
}
```

### **Docker Support**

```dockerfile
# Dockerfile.test
FROM mcr.microsoft.com/playwright:v1.54.1-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Run tests
CMD ["npm", "run", "test:all"]
```

```bash
# Build and run tests in Docker
docker build -f Dockerfile.test -t e2e-tests .
docker run --env-file .env.staging e2e-tests
```

---

## 📈 Performance Monitoring

### **Test Execution Metrics**

```bash
# Performance test execution
npm run test:performance

# Monitor test duration trends
npm run test -- --reporter=json | jq '.stats.duration'

# Memory and resource monitoring
npm run test -- --reporter=custom
```

### **Performance Benchmarking**

```typescript
// Example performance test
test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second threshold
});
```

---

## 🔍 Test Data Management

### **Test Data Setup**

```bash
# Seed test data before running tests
npm run data:seed

# Clean test data after tests
npm run data:cleanup

# Reset to clean state
npm run data:cleanup && npm run data:seed
```

### **Environment-Specific Data**

```bash
# Development data (persistent)
NODE_ENV=development npm run data:seed

# Staging data (temporary)  
NODE_ENV=staging npm run data:seed

# Production data (read-only)
NODE_ENV=production npm run data:validate
```

---

## 🎯 Best Practices

### **1. Test Organization**
- Group related tests into projects
- Use descriptive test names and organize by feature
- Implement proper test isolation

### **2. Environment Management**
- Always specify environment explicitly in CI/CD
- Use environment-specific configurations
- Validate environment setup before tests

### **3. Parallel Execution**
- Use parallelism for faster feedback
- Consider test dependencies when enabling parallelism
- Monitor resource usage with parallel execution

### **4. Debugging Strategy**
- Start with specific test isolation
- Use headed mode for visual debugging
- Leverage screenshots, videos, and traces

### **5. CI/CD Integration**
- Use matrix builds for different test types
- Implement proper artifact collection
- Set up notifications for test failures

### **6. Performance Optimization**
- Monitor test execution times
- Identify and optimize slow tests
- Use test sharding for very large suites

This comprehensive guide provides everything needed to effectively execute tests in the Playwright E2E Testing Framework, from basic smoke tests to complex CI/CD integration scenarios.