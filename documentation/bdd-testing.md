# BDD Testing Guide

**Comprehensive Behavior-Driven Development with Playwright-BDD**

## 🎯 Overview

This guide covers Behavior-Driven Development (BDD) implementation in the Playwright E2E Testing Framework using Playwright-BDD, enabling natural language test scenarios that bridge the gap between business requirements and technical implementation.

## 🧪 BDD Framework Architecture

```
BDD Testing Flow:
├── 📄 Feature Files (Gherkin) → Business-readable scenarios
├── 🔧 Step Definitions (TypeScript) → Technical implementations  
├── 🎭 Playwright Integration → Test execution engine
└── 📊 Generated Tests → Executable test files
```

---

## 📝 Writing Feature Files

### **Gherkin Syntax Basics**

**Location**: `features/{application}/{type}/`

```gherkin
@webapp @navigation @smoke
Feature: WebApp Navigation
  As a user of the webapp
  I want to navigate between different sections
  So that I can access all available functionality

  Background:
    Given the webapp is accessible
    And I am logged in as a regular user

  @critical @regression
  Scenario: Navigate through main tabs
    When I click on the "Document Hub" tab
    Then I should be on the Document Hub page
    And the "Document Hub" tab should be active
    And the page title should contain "Document Hub"

  @smoke
  Scenario Outline: Navigate to different sections
    When I click on the "<section>" tab
    Then I should be on the <section> page
    And the "<section>" tab should be active

    Examples:
      | section           |
      | Document Hub      |
      | Feature Generator |
      | Global Chat       |
```

### **Feature File Organization**

#### **WebApp Features**

**Document Management** (`features/webapp/ui/document-management.feature`)
```gherkin
@webapp @documents @smoke
Feature: Document Management
  As a webapp user
  I want to manage my documents
  So that I can organize and access my files efficiently

  Background:
    Given the webapp is accessible
    And I am logged in as a document manager

  @critical
  Scenario: Upload a new document
    Given I am on the Document Hub page
    When I click the "Upload" button
    And I select a file "test-document.pdf"
    And I click "Upload File"
    Then I should see the document "test-document.pdf" in the list
    And the upload status should be "Complete"

  @regression
  Scenario: Delete an existing document
    Given I am on the Document Hub page
    And I have a document "old-document.pdf" in my list
    When I click the delete button for "old-document.pdf"
    And I confirm the deletion
    Then the document "old-document.pdf" should not appear in the list
    And I should see a success message "Document deleted successfully"
```

**Feature Generation** (`features/webapp/ui/feature-generation.feature`)
```gherkin
@webapp @features @regression
Feature: Feature Generation
  As a webapp user
  I want to generate features from documents
  So that I can create structured requirements

  Background:
    Given the webapp is accessible
    And I am logged in as a feature creator
    And I have uploaded a document "requirements.pdf"

  @critical @slow
  Scenario: Generate features from document
    Given I am on the Feature Generator page
    When I select the document "requirements.pdf"
    And I click "Generate Features"
    And I wait for the generation to complete
    Then I should see generated features
    And each feature should have a title and description
    And I should be able to download the feature file

  @integration
  Scenario: Regenerate features with different settings
    Given I am on the Feature Generator page
    And I have previously generated features for "requirements.pdf"
    When I select "requirements.pdf"
    And I change the generation settings to "detailed"
    And I click "Regenerate Features"
    Then I should see updated features
    And the features should be more detailed than before
```

#### **AdminApp Features**

**User Management** (`features/adminapp/ui/user-management.feature`)
```gherkin
@adminapp @users @critical
Feature: User Management
  As an admin user
  I want to manage system users
  So that I can control access and permissions

  Background:
    Given the admin app is accessible
    And I am logged in as an administrator

  @smoke
  Scenario: View user list
    Given I am on the User Management page
    Then I should see a list of all users
    And each user should display name, email, and status
    And I should see pagination controls

  @regression
  Scenario: Create a new user
    Given I am on the User Management page
    When I click the "Add User" button
    And I fill in the user form:
      | Field    | Value              |
      | Name     | John Doe           |
      | Email    | john.doe@example.com  |
      | Role     | User               |
    And I click "Create User"
    Then I should see "User created successfully"
    And "john.doe@example.com" should appear in the user list
```

#### **MCP Server Features**

**API Endpoints** (`features/mcp-server/api/api-endpoints.feature`)
```gherkin
@mcp-server @api @smoke
Feature: MCP Server API Endpoints
  As an API client
  I want to access MCP server functionality
  So that I can integrate AI capabilities

  Background:
    Given the MCP server is accessible
    And I have valid API credentials

  @critical
  Scenario: Generate text using API
    When I send a POST request to "/api/generate" with:
      | Field  | Value                    |
      | prompt | "Write a short story"    |
      | model  | "ollama"                |
    Then I should receive a 200 response
    And the response should contain generated text
    And the response time should be less than 10 seconds

  @regression
  Scenario: Get available models
    When I send a GET request to "/api/models"
    Then I should receive a 200 response
    And the response should contain a list of models
    And each model should have name and status
```

### **Cross-Application Features**

**Document to Feature Workflow** (`features/cross-app/document-to-feature.feature`)
```gherkin
@cross-app @workflow @integration
Feature: Document to Feature Workflow
  As a business analyst
  I want to convert documents to features seamlessly
  So that I can streamline requirement management

  Background:
    Given all applications are accessible
    And I am logged in to the webapp
    And I have admin access to the system

  @critical @slow
  Scenario: Complete document processing workflow
    Given I upload a document "business-requirements.pdf" to the webapp
    When I generate features from the document
    And I review the generated features
    And I approve the features for production
    Then the features should be available in the system
    And I should be able to track the workflow status
    And the admin should receive a completion notification
```

---

## 🔧 Step Definitions

### **Step Definition Structure**

**Location**: `features/steps/{application}/`

#### **Common Steps** (`features/steps/shared/common-steps.ts`)

```typescript
import { Given, When, Then } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

// Navigation Steps
Given('the webapp is accessible', async ({ testWorld }) => {
  await testWorld.page.goto('/');
  await testWorld.waitForPageLoad();
  expect(await testWorld.page.title()).toContain('Application');
});

Given('the admin app is accessible', async ({ testWorld }) => {
  await testWorld.page.goto(testWorld.adminappConfig.baseUrl);
  await testWorld.waitForPageLoad();
  expect(await testWorld.page.title()).toContain('Admin');
});

Given('the MCP server is accessible', async ({ testWorld }) => {
  const response = await testWorld.page.request.get('/health');
  expect(response.status()).toBe(200);
});

// Authentication Steps
Given('I am logged in as a {string}', async ({ testWorld }, role: string) => {
  await testWorld.authenticationHelper.loginWithRole(role);
  await testWorld.waitForPageLoad();
});

Given('I am logged in as an administrator', async ({ testWorld }) => {
  await testWorld.authenticationHelper.loginAsAdmin();
  await testWorld.waitForPageLoad();
});

// Wait and Verification Steps
When('I wait for the generation to complete', async ({ testWorld }) => {
  await testWorld.page.waitForSelector('[data-testid="generation-complete"]', {
    timeout: 30000
  });
});

Then('I should see a success message {string}', async ({ testWorld }, message: string) => {
  await expect(testWorld.page.locator('.success-message')).toContainText(message);
});

Then('I should see {string}', async ({ testWorld }, text: string) => {
  await expect(testWorld.page.locator('body')).toContainText(text);
});
```

#### **WebApp Steps** (`features/steps/webapp/navigation-steps.ts`)

```typescript
import { Given, When, Then } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

// Navigation Steps
When('I click on the {string} tab', async ({ testWorld, navigationHelper }, tabName: string) => {
  await navigationHelper.clickTab(tabName);
  await testWorld.waitForPageLoad();
});

Then('I should be on the {string} page', async ({ testWorld }, pageName: string) => {
  const expectedUrl = testWorld.getExpectedUrl(pageName);
  await expect(testWorld.page).toHaveURL(expectedUrl);
});

Then('the {string} tab should be active', async ({ testWorld }, tabName: string) => {
  const tabSelector = `[data-testid="${tabName.toLowerCase().replace(' ', '-')}-tab"]`;
  await expect(testWorld.page.locator(tabSelector)).toHaveClass(/active/);
});

// Document Management Steps
Given('I am on the Document Hub page', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToDocumentHub();
  await testWorld.waitForPageLoad();
});

When('I click the {string} button', async ({ testWorld }, buttonText: string) => {
  await testWorld.page.click(`button:has-text("${buttonText}")`);
});

When('I select a file {string}', async ({ testWorld }, fileName: string) => {
  const filePath = testWorld.getTestFilePath(fileName);
  await testWorld.page.setInputFiles('[data-testid="file-upload"]', filePath);
});

Then('I should see the document {string} in the list', async ({ testWorld }, documentName: string) => {
  await expect(testWorld.page.locator('.document-list')).toContainText(documentName);
});

// Feature Generation Steps
When('I select the document {string}', async ({ testWorld }, documentName: string) => {
  await testWorld.page.click(`[data-testid="document-${documentName}"]`);
});

When('I click {string}', async ({ testWorld }, buttonText: string) => {
  await testWorld.page.click(`button:has-text("${buttonText}")`);
});

Then('I should see generated features', async ({ testWorld }) => {
  await expect(testWorld.page.locator('[data-testid="generated-features"]')).toBeVisible();
  await expect(testWorld.page.locator('.feature-item')).toHaveCount({ min: 1 });
});

Then('each feature should have a title and description', async ({ testWorld }) => {
  const features = testWorld.page.locator('.feature-item');
  const count = await features.count();
  
  for (let i = 0; i < count; i++) {
    const feature = features.nth(i);
    await expect(feature.locator('.feature-title')).toBeVisible();
    await expect(feature.locator('.feature-description')).toBeVisible();
  }
});
```

#### **AdminApp Steps** (`features/steps/adminapp/user-management-steps.ts`)

```typescript
import { Given, When, Then } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

// User Management Steps
Given('I am on the User Management page', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToUserManagement();
  await testWorld.waitForPageLoad();
});

Then('I should see a list of all users', async ({ testWorld }) => {
  await expect(testWorld.page.locator('[data-testid="user-list"]')).toBeVisible();
  await expect(testWorld.page.locator('.user-row')).toHaveCount({ min: 1 });
});

Then('each user should display name, email, and status', async ({ testWorld }) => {
  const users = testWorld.page.locator('.user-row');
  const count = await users.count();
  
  for (let i = 0; i < count; i++) {
    const user = users.nth(i);
    await expect(user.locator('.user-name')).toBeVisible();
    await expect(user.locator('.user-email')).toBeVisible();
    await expect(user.locator('.user-status')).toBeVisible();
  }
});

When('I fill in the user form:', async ({ testWorld }, dataTable: any) => {
  const data = dataTable.hashes()[0];
  
  await testWorld.page.fill('[data-testid="user-name"]', data.Name);
  await testWorld.page.fill('[data-testid="user-email"]', data.Email);
  await testWorld.page.selectOption('[data-testid="user-role"]', data.Role);
});

Then('{string} should appear in the user list', async ({ testWorld }, email: string) => {
  await expect(testWorld.page.locator('.user-list')).toContainText(email);
});
```

#### **API Steps** (`features/steps/mcp-server/api-steps.ts`)

```typescript
import { Given, When, Then } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../fixtures';

let apiResponse: any;
let apiResponseTime: number;

When('I send a POST request to {string} with:', async ({ testWorld }, endpoint: string, dataTable: any) => {
  const data = dataTable.hashes()[0];
  const requestBody = {
    prompt: data.Field === 'prompt' ? data.Value : undefined,
    model: data.Field === 'model' ? data.Value : undefined
  };
  
  const startTime = Date.now();
  apiResponse = await testWorld.page.request.post(endpoint, {
    data: requestBody
  });
  apiResponseTime = Date.now() - startTime;
});

When('I send a GET request to {string}', async ({ testWorld }, endpoint: string) => {
  const startTime = Date.now();
  apiResponse = await testWorld.page.request.get(endpoint);
  apiResponseTime = Date.now() - startTime;
});

Then('I should receive a {int} response', async ({}, expectedStatus: number) => {
  expect(apiResponse.status()).toBe(expectedStatus);
});

Then('the response should contain generated text', async ({}) => {
  const body = await apiResponse.json();
  expect(body.generated_text).toBeDefined();
  expect(body.generated_text.length).toBeGreaterThan(0);
});

Then('the response time should be less than {int} seconds', async ({}, maxSeconds: number) => {
  expect(apiResponseTime).toBeLessThan(maxSeconds * 1000);
});

Then('the response should contain a list of models', async ({}) => {
  const body = await apiResponse.json();
  expect(Array.isArray(body.models)).toBeTruthy();
  expect(body.models.length).toBeGreaterThan(0);
});

Then('each model should have name and status', async ({}) => {
  const body = await apiResponse.json();
  
  body.models.forEach((model: any) => {
    expect(model.name).toBeDefined();
    expect(model.status).toBeDefined();
  });
});
```

---

## 🎭 BDD Test Fixtures

### **Main Fixtures** (`features/steps/fixtures.ts`)

```typescript
import { test as base } from 'playwright-bdd';
import { TestWorld } from '../../src/core/base/TestWorld';
import { NavigationHelper } from '../../src/shared/helpers/NavigationHelper';
import { AuthenticationHelper } from '../../src/shared/helpers/AuthenticationHelper';
import { RoleBasedLocators } from '../../src/shared/helpers/RoleBasedLocators';

// Application components
import { SidebarComponent } from '../../src/applications/webapp/components/SidebarComponent';
import { HeaderComponent } from '../../src/applications/webapp/components/HeaderComponent';

// Configuration imports
import { webappConfig } from '../../config/applications/webapp.config';
import { adminappConfig } from '../../config/applications/adminapp.config';
import { mcpServerConfig } from '../../config/applications/mcp-server.config';

type TestFixtures = {
  testWorld: TestWorld;
  navigationHelper: NavigationHelper;
  authenticationHelper: AuthenticationHelper;
  roleBasedLocators: RoleBasedLocators;
  sidebarComponent: SidebarComponent;
  headerComponent: HeaderComponent;
  webappConfig: typeof webappConfig;
  adminappConfig: typeof adminappConfig;
  mcpServerConfig: typeof mcpServerConfig;
};

export const test = base.extend<TestFixtures>({
  testWorld: async ({ page }, use) => {
    const testWorld = new TestWorld(page);
    await testWorld.initialize();
    await use(testWorld);
    await testWorld.cleanup();
  },

  navigationHelper: async ({ page, testWorld }, use) => {
    const helper = new NavigationHelper(page, testWorld);
    await use(helper);
  },

  authenticationHelper: async ({ page, testWorld }, use) => {
    const helper = new AuthenticationHelper(page, testWorld);
    await use(helper);
  },

  roleBasedLocators: async ({ page, testWorld }, use) => {
    const locators = new RoleBasedLocators(page, testWorld);
    await use(locators);
  },

  sidebarComponent: async ({ page }, use) => {
    const component = new SidebarComponent(page);
    await use(component);
  },

  headerComponent: async ({ page }, use) => {
    const component = new HeaderComponent(page);
    await use(component);
  },

  webappConfig: async ({}, use) => {
    await use(webappConfig);
  },

  adminappConfig: async ({}, use) => {
    await use(adminappConfig);
  },

  mcpServerConfig: async ({}, use) => {
    await use(mcpServerConfig);
  },
});

export { expect } from '@playwright/test';
```

---

## 🏃‍♂️ BDD Test Execution

### **Generating BDD Tests**

```bash
# Generate test files from all feature files
npm run bdd:generate

# Generate tests for specific application
npx playwright-bdd generate --featuresRoot features/webapp

# Generate with verbose output
DEBUG=playwright-bdd npm run bdd:generate
```

**Output Example:**
```bash
✅ Generated 25 test files from 8 feature files
📁 Output directory: .features-gen/
🎯 Features processed:
   - webapp/ui/document-management.feature (5 scenarios)
   - webapp/ui/feature-generation.feature (3 scenarios)
   - adminapp/ui/user-management.feature (4 scenarios)
   - mcp-server/api/api-endpoints.feature (2 scenarios)
   - cross-app/document-to-feature.feature (1 scenario)
```

### **Running BDD Tests**

#### **By Application**

```bash
# Run all WebApp BDD scenarios
npm run bdd:webapp

# Run all AdminApp BDD scenarios  
npm run bdd:adminapp

# Run all MCP Server BDD scenarios
npm run bdd:mcp

# Run cross-application BDD scenarios
npm run bdd:cross-app
```

#### **By Tags**

```bash
# Run only smoke tests
npx playwright test --config=config/playwright.config.ts --project=bdd-webapp-smoke

# Run only regression tests
npx playwright test --config=config/playwright.config.ts --project=bdd-webapp-regression

# Run critical scenarios across all applications
npx playwright test --config=config/playwright.config.ts --grep="@critical"

# Run specific feature types
npx playwright test --config=config/playwright.config.ts --grep="@navigation"
npx playwright test --config=config/playwright.config.ts --grep="@documents"
npx playwright test --config=config/playwright.config.ts --grep="@api"
```

#### **Excluding Tests**

```bash
# Exclude slow tests
npx playwright test --config=config/playwright.config.ts --grep-invert="@slow"

# Exclude integration tests
npx playwright test --config=config/playwright.config.ts --grep-invert="@integration"
```

### **Environment-Specific BDD Testing**

```bash
# Development environment BDD tests
NODE_ENV=development npm run bdd:webapp

# Staging environment BDD tests
NODE_ENV=staging npm run bdd:webapp

# Production environment BDD tests (read-only)
NODE_ENV=production npm run bdd:webapp
```

---

## 📊 BDD Reporting and Analysis

### **BDD-Specific Reports**

The framework generates BDD-aware reports showing scenario results:

#### **Console Output**
```bash
✅ WebApp Navigation » Navigate through main tabs - PASSED (3.2s)
   ✅ Given the webapp is accessible
   ✅ And I am logged in as a regular user
   ✅ When I click on the "Document Hub" tab
   ✅ Then I should be on the Document Hub page
   ✅ And the "Document Hub" tab should be active

❌ Document Management » Upload a new document - FAILED (5.8s)
   ✅ Given the webapp is accessible
   ✅ And I am logged in as a document manager
   ✅ Given I am on the Document Hub page
   ✅ When I click the "Upload" button
   ❌ And I select a file "test-document.pdf"
      Error: File not found: test-document.pdf
```

#### **HTML Reports with BDD Context**

BDD reports include:
- Feature descriptions and business context
- Scenario step-by-step execution
- Gherkin syntax preservation
- Business stakeholder-friendly language

---

## 🔧 Advanced BDD Features

### **Data Tables**

```gherkin
Scenario: Create multiple users
  When I create users with the following details:
    | Name         | Email              | Role  |
    | John Doe     | john@example.com   | User  |
    | Jane Smith   | jane@example.com   | Admin |
    | Bob Johnson  | bob@example.com    | User  |
  Then all users should be created successfully
```

**Step Implementation:**
```typescript
When('I create users with the following details:', async ({ testWorld }, dataTable) => {
  const users = dataTable.hashes();
  
  for (const user of users) {
    await testWorld.page.click('[data-testid="add-user"]');
    await testWorld.page.fill('[data-testid="name"]', user.Name);
    await testWorld.page.fill('[data-testid="email"]', user.Email);
    await testWorld.page.selectOption('[data-testid="role"]', user.Role);
    await testWorld.page.click('[data-testid="create-user"]');
  }
});
```

### **Scenario Outlines**

```gherkin
@webapp @validation @regression
Scenario Outline: Form validation
  Given I am on the registration form
  When I enter "<field>" as "<value>"
  And I submit the form
  Then I should see the error "<error_message>"

  Examples:
    | field    | value           | error_message        |
    | email    | invalid-email   | Invalid email format |
    | password | 123             | Password too short   |
    | name     | ""              | Name is required     |
```

### **Background Steps**

```gherkin
Feature: Document Management
  
  Background:
    Given the webapp is accessible
    And I am logged in as a document manager
    And I have the following test documents:
      | Name              | Type | Size  |
      | sample1.pdf       | PDF  | 2MB   |
      | sample2.docx      | DOCX | 1MB   |
```

---

## 🎯 BDD Best Practices

### **1. Writing Clear Scenarios**

**Good Example:**
```gherkin
Scenario: User uploads a document successfully
  Given I am on the Document Hub page
  When I click the "Upload" button
  And I select a valid PDF file
  And I click "Upload File"
  Then I should see the upload success message
  And the document should appear in my document list
```

**Poor Example:**
```gherkin
Scenario: Upload works
  Given I'm logged in
  When I upload stuff
  Then it works
```

### **2. Using Appropriate Tags**

```gherkin
@webapp @documents @smoke @critical
@regression @integration @api @ui
@slow @fast @manual @automated
```

### **3. Business Language Focus**

- Write from user perspective
- Use domain terminology
- Avoid technical implementation details
- Focus on behavior, not UI mechanics

### **4. Maintainable Step Definitions**

```typescript
// Good: Reusable and clear
When('I navigate to the {string} page', async ({ navigationHelper }, pageName) => {
  await navigationHelper.navigateTo(pageName);
});

// Poor: Too specific and not reusable
When('I click the second tab in the navigation bar', async ({ page }) => {
  await page.click('nav > ul > li:nth-child(2) > a');
});
```

---

## 🔍 Debugging BDD Tests

### **Step-by-Step Debugging**

```bash
# Debug specific scenario
npx playwright test --config=config/playwright.config.ts --grep="Upload a new document" --debug

# Run with headed browser
npx playwright test --config=config/playwright.config.ts --project=bdd-webapp-smoke --headed

# Debug with slow motion
SLOW_MO=1000 npx playwright test --config=config/playwright.config.ts --project=bdd-webapp-smoke
```

### **BDD-Specific Debugging**

```typescript
// Add debugging in step definitions
When('I click the {string} button', async ({ testWorld }, buttonText: string) => {
  console.log(`Clicking button: ${buttonText}`);
  await testWorld.page.screenshot({ path: `debug-before-click-${buttonText}.png` });
  
  await testWorld.page.click(`button:has-text("${buttonText}")`);
  
  await testWorld.page.screenshot({ path: `debug-after-click-${buttonText}.png` });
});
```

---

## 📈 BDD Integration with CI/CD

### **GitHub Actions BDD Pipeline**

```yaml
name: BDD Tests

on: [push, pull_request]

jobs:
  bdd-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        application: [webapp, adminapp, mcp-server]
        test-type: [smoke, regression]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate BDD tests
        run: npm run bdd:generate

      - name: Run BDD tests
        run: npm run bdd:${{ matrix.application }}:${{ matrix.test-type }}
        env:
          NODE_ENV: staging

      - name: Upload BDD reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: bdd-reports-${{ matrix.application }}-${{ matrix.test-type }}
          path: reports/
```

This comprehensive BDD testing guide provides everything needed to implement behavior-driven development effectively in the Playwright E2E Testing Framework, enabling clear communication between business stakeholders and technical teams while maintaining robust test automation.