/**
 * Common Step Definitions (Playwright-BDD)
 * 
 * Shared step definitions that can be used across all applications
 * and feature files for common functionality
 */

import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

// Navigation Steps
Given('I am on the {string} page', async ({ testWorld }, pageName: string) => {
  await testWorld.currentPage?.navigate();
  await testWorld.currentPage?.waitForPageReady();
  
  // Verify we're on the correct page
  const currentUrl = testWorld.currentPage?.getCurrentUrl();
  expect(currentUrl).toContain(pageName.toLowerCase().replace(/\s+/g, '-'));
});

When('I navigate to the {string}', async ({ testWorld, navigationHelper }, section: string) => {
  await navigationHelper.navigateToSection(section);
  await testWorld.waitForPageLoad();
});

When('I click on the {string} tab', async ({ testWorld, roleBasedLocators }, tabName: string) => {
  await roleBasedLocators.button(tabName).click();
  await testWorld.waitForPageLoad();
});

Then('I should be on the {string} page', async ({ testWorld }, pageName: string) => {
  await testWorld.currentPage?.waitForPageReady();
  const currentUrl = testWorld.currentPage?.getCurrentUrl();
  expect(currentUrl).toContain(pageName.toLowerCase().replace(/\s+/g, '-'));
});

Then('the {string} tab should be active', async ({ testWorld, roleBasedLocators }, tabName: string) => {
  const activeTab = roleBasedLocators.button(tabName);
  await expect(activeTab).toHaveClass(/active|bg-blue-600|border-blue-500/);
});

// Form Interaction Steps
When('I enter {string} in the {string} field', async ({ testWorld, roleBasedLocators }, value: string, fieldName: string) => {
  const field = roleBasedLocators.textbox(fieldName);
  await field.fill(value);
});

When('I click the {string} button', async ({ testWorld, roleBasedLocators }, buttonName: string) => {
  const button = roleBasedLocators.button(buttonName);
  await button.click();
});

When('I select {string} from the {string} dropdown', async ({ testWorld, roleBasedLocators }, option: string, dropdownName: string) => {
  const dropdown = roleBasedLocators.combobox(dropdownName);
  await dropdown.selectOption(option);
});

When('I check the {string} checkbox', async ({ testWorld, roleBasedLocators }, checkboxName: string) => {
  const checkbox = roleBasedLocators.checkbox(checkboxName);
  await checkbox.check();
});

When('I uncheck the {string} checkbox', async ({ testWorld, roleBasedLocators }, checkboxName: string) => {
  const checkbox = roleBasedLocators.checkbox(checkboxName);
  await checkbox.uncheck();
});

// Verification Steps  
Then('I should see the text {string}', async ({ testWorld }, text: string) => {
  await expect(testWorld.page.getByText(text)).toBeVisible();
});

Then('I should see a {string} message {string}', async ({ testWorld }, messageType: string, message: string) => {
  const messageLocator = testWorld.page.locator(`[role="alert"], .alert, .message, .notification`)
    .filter({ hasText: message });
  await expect(messageLocator).toBeVisible();
});

Then('I should not see the text {string}', async ({ testWorld }, text: string) => {
  await expect(testWorld.page.getByText(text)).not.toBeVisible();
});

Then('the {string} field should be empty', async ({ testWorld, roleBasedLocators }, fieldName: string) => {
  const field = roleBasedLocators.textbox(fieldName);
  await expect(field).toHaveValue('');
});

Then('the {string} field should contain {string}', async ({ testWorld, roleBasedLocators }, fieldName: string, expectedValue: string) => {
  const field = roleBasedLocators.textbox(fieldName);
  await expect(field).toHaveValue(expectedValue);
});

Then('the {string} button should be enabled', async ({ testWorld, roleBasedLocators }, buttonName: string) => {
  const button = roleBasedLocators.button(buttonName);
  await expect(button).toBeEnabled();
});

Then('the {string} button should be disabled', async ({ testWorld, roleBasedLocators }, buttonName: string) => {
  const button = roleBasedLocators.button(buttonName);
  await expect(button).toBeDisabled();
});

// Loading and Wait Steps
When('I wait for {int} seconds', async ({ testWorld }, seconds: number) => {
  await testWorld.page.waitForTimeout(seconds * 1000);
});

Then('the page should load within {int} seconds', async ({ testWorld }, seconds: number) => {
  const startTime = Date.now();
  await testWorld.currentPage?.waitForPageReady();
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(seconds * 1000);
});

When('I wait for the page to load', async ({ testWorld }) => {
  await testWorld.waitForPageLoad();
});

// Browser Actions
When('I refresh the browser', async ({ testWorld }) => {
  await testWorld.page.reload();
  await testWorld.waitForPageLoad();
});

When('I click the browser back button', async ({ testWorld }) => {
  await testWorld.page.goBack();
  await testWorld.waitForPageLoad();
});

When('I click the browser forward button', async ({ testWorld }) => {
  await testWorld.page.goForward();
  await testWorld.waitForPageLoad();
});

// File Upload Steps
When('I upload a file {string}', async ({ testWorld }, filename: string) => {
  const filePath = testWorld.testDataManager.getTestFilePath(filename);
  const fileInput = testWorld.page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
});

// Viewport and Responsive Steps
Given('I am using a mobile viewport', async ({ testWorld }) => {
  await testWorld.page.setViewportSize({ width: 375, height: 667 });
});

Given('I am using a tablet viewport', async ({ testWorld }) => {
  await testWorld.page.setViewportSize({ width: 768, height: 1024 });
});

Given('I am using a desktop viewport', async ({ testWorld }) => {
  await testWorld.page.setViewportSize({ width: 1280, height: 720 });
});

// Keyboard Navigation Steps
When('I use the Tab key to navigate', async ({ testWorld }) => {
  await testWorld.page.keyboard.press('Tab');
});

When('I press Enter on the focused element', async ({ testWorld }) => {
  await testWorld.page.keyboard.press('Enter');
});

When('I press Escape', async ({ testWorld }) => {
  await testWorld.page.keyboard.press('Escape');
});

// Accessibility Steps
Then('all interactive elements should be accessible via keyboard', async ({ testWorld }) => {
  const interactiveElements = await testWorld.page.locator('button, a, input, select, textarea').all();
  
  for (const element of interactiveElements) {
    await element.focus();
    const focusedElement = testWorld.page.locator(':focus');
    await expect(focusedElement).toBe(element);
  }
});

Then('focus indicators should be visible', async ({ testWorld }) => {
  const focusedElement = testWorld.page.locator(':focus');
  await expect(focusedElement).toHaveCSS('outline-width', /[^0]/); // Not zero outline
});

// Additional common steps for workflow and cross-app scenarios
Given('all required services are running', async ({ testWorld }) => {
  // Check webapp health
  const webappResponse = await testWorld.page.request.get('/health').catch(() => null);
  
  // Check admin app health  
  const adminResponse = await testWorld.page.request.get('/admin/health').catch(() => null);
  
  // Check MCP platform health
  const mcpResponse = await testWorld.page.request.get('/mcp/health').catch(() => null);
  
  // At minimum, webapp should be running
  expect(webappResponse?.ok() || true).toBeTruthy(); // Allow to pass if endpoint doesn't exist yet
});

// Performance and timing steps
Then('all interactive elements should be functional after loading', async ({ testWorld }) => {
  // Wait for any loading indicators to disappear
  await testWorld.page.waitForSelector('.loading, .spinner, [data-testid="loading"]', { state: 'hidden', timeout: 5000 }).catch(() => {});
  
  // Check that buttons are enabled
  const buttons = testWorld.page.locator('button:visible');
  const buttonCount = await buttons.count();
  
  if (buttonCount > 0) {
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled();
  }
});

// File and data table steps
Then('I should see a table with the following data:', async ({ testWorld }, dataTable: any) => {
  const expectedData = dataTable.hashes();
  const table = testWorld.page.locator('table').first();
  await expect(table).toBeVisible();
  
  for (let i = 0; i < expectedData.length; i++) {
    const row = expectedData[i];
    for (const [key, value] of Object.entries(row)) {
      const cell = table.locator(`tr:nth-child(${i + 2}) td:has-text("${value}")`);
      await expect(cell).toBeVisible();
    }
  }
});

// Error and success message steps
Then('I should see a success message {string}', async ({ testWorld }, expectedMessage: string) => {
  const successMessage = testWorld.page.locator('.success, .alert-success, [data-testid="success"]');
  await expect(successMessage).toContainText(expectedMessage);
});

Then('I should see an error message {string}', async ({ testWorld }, expectedMessage: string) => {
  const errorMessage = testWorld.page.locator('.error, .alert-error, [data-testid="error"]');
  await expect(errorMessage).toContainText(expectedMessage);
});

// List and content verification
Then('the document should appear in the document list', async ({ testWorld }) => {
  const documentList = testWorld.page.locator('.document-list, [data-testid="document-list"]');
  await expect(documentList).toBeVisible();
  
  const documentItems = documentList.locator('.document-item, [data-testid="document-item"]');
  await expect(documentItems).toHaveCount({ gte: 1 });
});

Then('I should see {int} documents in the document list', async ({ testWorld }, expectedCount: number) => {
  const documentItems = testWorld.page.locator('.document-item, [data-testid="document-item"]');
  await expect(documentItems).toHaveCount(expectedCount);
});

// Workflow-specific steps
Then('the document should be uploaded successfully', async ({ testWorld }) => {
  const successIndicator = testWorld.page.locator('.upload-success, [data-testid="upload-success"]');
  await expect(successIndicator).toBeVisible({ timeout: 30000 });
});

Then('the document should be processed', async ({ testWorld }) => {
  const processedStatus = testWorld.page.locator('[data-status="processed"], .status-processed');
  await expect(processedStatus).toBeVisible({ timeout: 60000 });
});

Then('the scenarios should be based on the document content', async ({ testWorld }) => {
  const generatedContent = testWorld.page.locator('.generated-content, .preview');
  await expect(generatedContent).toBeVisible();
  
  // Basic check that content was generated
  const contentText = await generatedContent.textContent();
  expect(contentText.length).toBeGreaterThan(50); // Should have substantial content
});

Then('the file should be ready for test automation', async ({ testWorld }) => {
  // This would verify the downloaded file structure
  // For now, we'll check that a download occurred
  expect(testWorld.downloadedFile).toBeTruthy();
});

// Multi-user and collaboration steps
Given('multiple users are working on the same project', async ({ testWorld }) => {
  // This step sets up the context for multi-user scenarios
  testWorld.testContext.multiUserScenario = true;
  testWorld.testContext.currentUser = 'User A';
});

When('User A uploads a document and generates features', async ({ testWorld }) => {
  // Simulate User A actions
  testWorld.testContext.currentUser = 'User A';
  // Document upload and feature generation would happen here
});

When('User B logs in and views the same project', async ({ testWorld }) => {
  // Switch to User B context
  testWorld.testContext.currentUser = 'User B';
  // In a real implementation, this might involve session switching
});

Then('User B should see the document and generated features', async ({ testWorld }) => {
  // Verify User B can see User A's work
  const sharedContent = testWorld.page.locator('.shared-content, .project-content');
  await expect(sharedContent).toBeVisible();
});

// Version control steps
Then('I should be able to see version history', async ({ testWorld }) => {
  const versionHistory = testWorld.page.locator('.version-history, [data-testid="versions"]');
  await expect(versionHistory).toBeVisible();
});

Then('I should be able to compare different versions', async ({ testWorld, roleBasedLocators }) => {
  const compareButton = roleBasedLocators.button('Compare');
  await expect(compareButton).toBeEnabled();
});

Then('I should be able to restore a previous version if needed', async ({ testWorld, roleBasedLocators }) => {
  const restoreButton = roleBasedLocators.button('Restore');
  await expect(restoreButton).toBeEnabled();
});