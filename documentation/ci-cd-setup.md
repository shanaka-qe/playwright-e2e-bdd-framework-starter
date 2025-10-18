# CI/CD Setup Guide

**Complete Guide for Continuous Integration and Deployment**

## 🎯 Overview

This framework includes pre-configured CI/CD pipelines for multiple platforms:

- **GitHub Actions** - Native GitHub integration (recommended for GitHub projects)
- **GitLab CI** - For GitLab repositories
- **Jenkins** - For self-hosted or enterprise Jenkins servers

## 📁 CI/CD Files Overview

```
.github/workflows/
├── pr-tests.yml           # Pull request smoke tests
├── main-tests.yml         # Comprehensive main branch tests
├── scheduled-tests.yml    # Daily/weekly regression tests
├── bdd-tests.yml          # BDD feature tests
└── dependency-update.yml  # Automatic dependency updates

ci/
├── .gitlab-ci.yml        # GitLab CI configuration
└── Jenkinsfile           # Jenkins pipeline configuration
```

---

## 🚀 GitHub Actions Setup

### Quick Start

1. **Enable GitHub Actions** (usually enabled by default)
2. **Commit workflow files** - They're already in `.github/workflows/`
3. **Configure secrets** (if needed)
4. **Push to GitHub** - Workflows will trigger automatically

### Workflow Overview

#### 1. **Pull Request Tests** (`pr-tests.yml`)

**Triggers:** On pull requests to main/master/develop

**What it does:**
- Runs smoke tests on Chromium
- Performs TypeScript compilation checks
- Provides fast feedback (< 20 minutes)

**Configuration:**
```yaml
on:
  pull_request:
    branches: [ main, master, develop ]
```

#### 2. **Main Branch Tests** (`main-tests.yml`)

**Triggers:** On push to main/master, manual trigger

**What it does:**
- Comprehensive test suite with sharding (4 parallel runners)
- Cross-browser testing (Chromium, Firefox, WebKit)
- Merges and archives all reports

**Configuration:**
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]  # Parallel execution
```

#### 3. **Scheduled Tests** (`scheduled-tests.yml`)

**Triggers:** Daily at 2 AM UTC, manual trigger with environment selection

**What it does:**
- Runs regression tests on all applications
- Tests against staging environment (configurable)
- Creates GitHub issue on failure

**Configuration:**
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

#### 4. **BDD Tests** (`bdd-tests.yml`)

**Triggers:** On changes to feature files, pull requests

**What it does:**
- Generates BDD tests from Gherkin features
- Runs application-specific BDD scenarios
- Runs critical scenarios separately

#### 5. **Dependency Updates** (`dependency-update.yml`)

**Triggers:** Weekly on Monday at 9 AM UTC, manual trigger

**What it does:**
- Checks for outdated packages
- Updates dependencies
- Runs smoke tests
- Creates automated pull request
- Performs security audit

### GitHub Secrets Configuration

Add these secrets in **Settings → Secrets and variables → Actions**:

```bash
# Optional: Environment URLs (if not using .env)
STAGING_UI_BASE_URL
STAGING_ADMIN_BASE_URL
STAGING_MCP_PLATFORM_URL

# Optional: Test credentials
TEST_USER_EMAIL
TEST_USER_PASSWORD

# Optional: API keys for AI providers
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Optional: Notification webhooks
SLACK_WEBHOOK_URL
```

### Customizing Workflows

#### Change Test Timeout
```yaml
jobs:
  smoke-tests:
    timeout-minutes: 20  # Change this value
```

#### Add More Browsers
```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit, mobile-chrome]
```

#### Modify Cron Schedule
```yaml
schedule:
  - cron: '0 2 * * *'      # Daily at 2 AM
  - cron: '0 2 * * 1'      # Weekly on Monday
  - cron: '0 */6 * * *'    # Every 6 hours
```

---

## 🦊 GitLab CI Setup

### Quick Start

1. **Configure custom CI file path** in GitLab:
   - Go to Settings → CI/CD → General pipelines
   - Set "CI/CD configuration file" to `ci/.gitlab-ci.yml`
   - Alternatively, create a symlink: `ln -s ci/.gitlab-ci.yml .gitlab-ci.yml`

2. **Configure CI/CD variables** in GitLab
3. **Push to GitLab** - Pipeline will start automatically

### Pipeline Stages

```
Setup → Lint → Test → Report
```

1. **Setup**: Install dependencies and Playwright browsers
2. **Lint**: TypeScript checks
3. **Test**: Smoke, regression, cross-browser, and BDD tests
4. **Report**: Generate and publish test reports

### GitLab CI Variables

Configure in **Settings → CI/CD → Variables**:

```bash
NODE_VERSION=18
STAGING_UI_BASE_URL=https://staging.example.com
STAGING_ADMIN_BASE_URL=https://admin-staging.example.com
```

### Cache Configuration

GitLab CI uses cache to speed up builds:

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
```

### Parallel Execution

Tests run in parallel for faster feedback:

```yaml
parallel:
  matrix:
    - APPLICATION: [webapp, adminapp, mcp-server]
```

---

## 🏗️ Jenkins Setup

### Quick Start

1. **Install Required Plugins**:
   - Docker Pipeline
   - HTML Publisher
   - JUnit Plugin
   - Pipeline Plugin

2. **Create Pipeline Job**:
   - New Item → Pipeline
   - Pipeline → Definition → Pipeline script from SCM
   - SCM → Git → Enter repository URL
   - Script Path: `ci/Jenkinsfile`

3. **Configure Environment**:
   - Ensure Docker is available on Jenkins agent
   - Set up credentials if needed

### Pipeline Stages

1. **Setup**: Install dependencies
2. **Lint**: Code quality checks
3. **Smoke Tests**: Fast feedback on PRs
4. **Parallel Tests**: WebApp, AdminApp, MCP Server
5. **Cross-Browser Tests**: Multi-browser matrix
6. **BDD Tests**: Feature validation

### Jenkins Configuration

#### Environment Variables

In Jenkins job configuration:
```bash
NODE_ENV=test
HEADLESS=true
CI=true
```

#### Docker Agent

The `ci/Jenkinsfile` uses Playwright's Docker image:
```groovy
agent {
    docker {
        image 'mcr.microsoft.com/playwright:v1.54.1-focal'
        args '-u root:root'
    }
}
```

#### Branch-Specific Behavior

```groovy
when {
    branch 'main'  // Only on main branch
}

when {
    changeRequest()  // Only on pull requests
}
```

---

## 🔧 Common Configurations

### Environment-Specific Testing

#### GitHub Actions
```yaml
- name: Run tests
  env:
    NODE_ENV: ${{ github.event.inputs.environment || 'staging' }}
    STAGING_UI_BASE_URL: ${{ secrets.STAGING_UI_BASE_URL }}
```

#### GitLab CI
```yaml
variables:
  NODE_ENV: "staging"
  STAGING_UI_BASE_URL: ${STAGING_UI_BASE_URL}
```

#### Jenkins
```groovy
environment {
    NODE_ENV = 'staging'
    STAGING_UI_BASE_URL = credentials('staging-url')
}
```

### Test Sharding

Run tests in parallel for faster execution:

#### GitHub Actions
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

#### GitLab CI
```yaml
parallel: 4
script:
  - npx playwright test --shard=${CI_NODE_INDEX}/${CI_NODE_TOTAL}
```

### Retry Configuration

Add retry logic for flaky tests:

```yaml
- name: Run tests with retry
  run: npm run test:smoke || npm run test:smoke || npm run test:smoke
```

Or configure in Playwright config:
```typescript
retries: process.env.CI ? 2 : 0
```

---

## 📊 Reporting

### HTML Reports

All platforms generate HTML reports:

- **GitHub Actions**: Uploaded as artifacts
- **GitLab CI**: Available in job artifacts
- **Jenkins**: Published via HTML Publisher plugin

### JUnit Reports

For test result tracking:

```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['junit', { outputFile: 'reports/junit-results.xml' }]
]
```

### Custom Reports

Framework includes custom reporters:

```typescript
reporter: [
  ['./src/core/reporters/CustomReporter.ts']
]
```

---

## 🔔 Notifications

### GitHub Actions

Use GitHub Issues for failures:
```yaml
- name: Create issue on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({...})
```

### Slack Integration

#### GitHub Actions
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Jenkins
```groovy
post {
    failure {
        slackSend(
            color: 'danger',
            message: "Pipeline failed: ${env.JOB_NAME}"
        )
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Playwright Installation Fails**

**Solution:**
```yaml
- name: Install Playwright with system dependencies
  run: npx playwright install --with-deps
```

#### 2. **Tests Timeout in CI**

**Solution:** Increase timeout
```yaml
timeout-minutes: 60
```

#### 3. **Screenshots Not Captured**

**Solution:** Ensure artifacts are uploaded:
```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    path: test-results/
```

#### 4. **Memory Issues**

**Solution:** Reduce parallel workers
```typescript
// playwright.config.ts
workers: process.env.CI ? 2 : 4
```

### Debug Mode

Enable debug logging:

#### GitHub Actions
```yaml
env:
  DEBUG: pw:*
```

#### GitLab CI
```yaml
variables:
  DEBUG: "pw:*"
```

---

## 🎯 Best Practices

### 1. **Fail Fast**
```yaml
strategy:
  fail-fast: false  # Continue other jobs even if one fails
```

### 2. **Cache Dependencies**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Cache npm dependencies
```

### 3. **Conditional Execution**
```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
  # Only run when relevant files change
```

### 4. **Matrix Strategy**
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20]
```

### 5. **Artifact Management**
```yaml
retention-days: 7  # Keep artifacts for 7 days (save storage)
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)

---

## 🚀 Next Steps

1. Choose your CI/CD platform
2. Configure environment variables/secrets
3. Customize workflows for your needs
4. Set up notifications
5. Monitor and optimize pipeline performance

For questions or issues, refer to the main [README.md](../README.md) or open an issue.

