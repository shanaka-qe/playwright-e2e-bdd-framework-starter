import { test, expect } from '@playwright/test';

test.describe('Testoria Test Environment - Comprehensive E2E Tests', () => {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the test environment
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1:has-text("Testoria by SNK")', { timeout: 10000 });
  });

  test.describe('Full Application Workflow', () => {
    test('should load application and verify all core components', async ({ page }) => {
      // 1. Verify page loads correctly
      await expect(page).toHaveTitle(/Testoria/);
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();

      // 2. Verify navigation structure
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('button').first()).toBeVisible();

      // 3. Verify search functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');

      // 4. Verify global chat
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should handle API integration and UI responsiveness', async ({ page, request }) => {
      // 1. Test API endpoints
      const apiResponse = await request.get(`${baseURL}/api/ask`);
      expect(apiResponse.status()).toBe(200);
      
      const apiData = await apiResponse.json();
      expect(apiData).toHaveProperty('message');
      expect(apiData.message).toContain('Q&A API endpoint is ready');

      // 2. Test UI responsiveness
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
    });

    test('should test document hub functionality', async ({ page, request }) => {
      // 1. Test documents API
      const documentsResponse = await request.get(`${baseURL}/api/documents`);
      expect(documentsResponse.status()).toBe(200);
      
      const documentsData = await documentsResponse.json();
      expect(documentsData).toHaveProperty('success');
      expect(documentsData).toHaveProperty('data');
      expect(Array.isArray(documentsData.data)).toBe(true);

      // 2. Test UI interaction with document hub
// Look for document hub elements
      const docElements = page.locator('[class*="document"], [class*="Document"], button:has-text("Upload")');
      if (await docElements.count() > 0) {
        await expect(docElements.first()).toBeVisible();
      }
    });

    test('should test feature generation functionality', async ({ page, request }) => {
      // 1. Test features API
      const featuresResponse = await request.get(`${baseURL}/api/features`);
      expect(featuresResponse.status()).toBe(200);
      
      const featuresData = await featuresResponse.json();
      expect(Array.isArray(featuresData)).toBe(true);

      // 2. Test feature creation via API
      const timestamp = Date.now();
      const featureData = {
        title: `Test Feature ${timestamp}`,
        content: 'Feature: Test\nScenario: Test\nGiven I am on the page'
      };

      const createResponse = await request.post(`${baseURL}/api/features`, {
        data: featureData
      });
      expect(createResponse.status()).toBe(201);
      
      const createdFeature = await createResponse.json();
      expect(createdFeature).toHaveProperty('id');
      expect(createdFeature).toHaveProperty('title');
      expect(createdFeature.title).toBe(featureData.title);

      // 3. Test UI interaction with feature generation
      // Look for feature generation elements
      const featureElements = page.locator('[class*="feature"], [class*="Feature"], textarea, button:has-text("Generate")');
      if (await featureElements.count() > 0) {
        await expect(featureElements.first()).toBeVisible();
      }
    });

    test('should test settings and configuration', async ({ page, request }) => {
      // 1. Test settings API
      const settingsResponse = await request.get(`${baseURL}/api/settings/models`);
      expect(settingsResponse.status()).toBe(200);
      
      const settingsData = await settingsResponse.json();
      expect(settingsData).toHaveProperty('success');
      expect(settingsData.success).toBe(true);
      expect(settingsData).toHaveProperty('currentConfig');
      expect(settingsData).toHaveProperty('availableModels');

      // 2. Test UI interaction with settings
      // Look for settings elements
      const settingsElements = page.locator('[class*="setting"], [class*="config"], [class*="model"]');
      if (await settingsElements.count() > 0) {
        await expect(settingsElements.first()).toBeVisible();
      }
    });

    test('should test global chat functionality', async ({ page }) => {
      // 1. Verify chat button is present
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();

      // 2. Open chat
      await page.click('button[aria-label="Open QA Genie"]');
      await page.waitForTimeout(1000);

      // 3. Look for chat interface elements
      const chatElements = page.locator('[class*="chat"], [class*="Chat"], textarea, button:has-text("Send")');
      if (await chatElements.count() > 0) {
        await expect(chatElements.first()).toBeVisible();
      }
    });

    test('should test error handling and edge cases', async ({ page, request }) => {
      // 1. Test API error handling
      const invalidResponse = await request.post(`${baseURL}/api/ask`, {
        data: {}
      });
      expect(invalidResponse.status()).toBe(400);
      
      const errorData = await invalidResponse.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toContain('Question is required');

      // 2. Test UI error handling
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should test performance and load times', async ({ page }) => {
      // 1. Test page load performance
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // 10 seconds

      // 2. Test UI responsiveness
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should test accessibility features', async ({ page }) => {
      // 1. Test ARIA labels
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();

      // 2. Test heading structure
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('h2').first()).toBeVisible();

      // 3. Test focus management
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('should test data persistence and state management', async ({ page, request }) => {
      // 1. Create test data
      const timestamp = Date.now();
      const featureData = {
        title: `Persistent Test Feature ${timestamp}`,
        content: 'Feature: Persistent Test\nScenario: Test\nGiven I am on the page'
      };

      const createResponse = await request.post(`${baseURL}/api/features`, {
        data: featureData
      });
      expect(createResponse.status()).toBe(201);
      
      const createdFeature = await createResponse.json();
      const featureId = createdFeature.id;

      // 2. Verify data persistence by fetching again
      const featuresResponse = await request.get(`${baseURL}/api/features`);
      expect(featuresResponse.status()).toBe(200);
      
      const featuresData = await featuresResponse.json();
      const foundFeature = featuresData.find((f: any) => f.id === featureId);
      expect(foundFeature).toBeDefined();
      expect(foundFeature.title).toBe(featureData.title);

      // 3. Test UI state management
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work across different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1024, height: 768, name: 'Laptop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      }
    });

    test('should handle different interaction patterns', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      // Test mouse interactions
      await page.click('input[placeholder*="Search"]');
      await page.fill('input[placeholder*="Search"]', 'test input');
      await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('test input');
    });
  });

  test.describe('Integration Testing', () => {
    test('should integrate API and UI seamlessly', async ({ page, request }) => {
      // 1. Test API functionality
      const apiResponse = await request.get(`${baseURL}/api/ask`);
      expect(apiResponse.status()).toBe(200);

      // 2. Test UI functionality
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

      // 3. Test combined functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('test query');
      await expect(searchInput).toHaveValue('test query');

      // 4. Test chat integration
      await page.click('button[aria-label="Open QA Genie"]');
      await page.waitForTimeout(1000);
      
      const chatElements = page.locator('[class*="chat"], [class*="Chat"], textarea, button:has-text("Send")');
      if (await chatElements.count() > 0) {
        await expect(chatElements.first()).toBeVisible();
      }
    });

    test('should handle concurrent operations', async ({ page, request }) => {
      // 1. Concurrent API calls
      const promises = Array.from({ length: 3 }, () => 
        request.get(`${baseURL}/api/ask`)
      );
      
      const responses = await Promise.all(promises);
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }

      // 2. Concurrent UI interactions
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });
  });
}); 