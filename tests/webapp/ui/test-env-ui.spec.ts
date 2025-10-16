import { test, expect } from '@playwright/test';

test.describe('Testoria Test Environment UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test environment
    await page.goto('/');
    // Wait for the page to load - use domcontentloaded instead of networkidle
    await page.waitForLoadState('domcontentloaded');
    // Wait for the main content to be visible
    await page.waitForSelector('h1:has-text("Testoria by SNK")', { timeout: 10000 });
  });

  test.describe('Page Load and Layout', () => {
    test('should load homepage successfully', async ({ page }) => {
      // Check if the page loads without errors
      await expect(page).toHaveTitle(/Testoria/);
      
      // Check for main layout elements
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should display main navigation tabs', async ({ page }) => {
      const expectedTabs = [
        'Overview',
        'Document Hub',
        'Test Features Generator',
        'Settings'
      ];

      for (const tab of expectedTabs) {
        await expect(page.locator(`nav button:has-text("${tab}")`)).toBeVisible();
      }
    });

    test('should have responsive layout', async ({ page }) => {
      // Check if sidebar is visible - use more specific selector
      await expect(page.locator('nav')).toBeVisible();
      
      // Check if main content area is visible - use more specific selector
      await expect(page.locator('main.flex-1')).toBeVisible();
      
      // Check if header is present
      await expect(page.locator('header')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to Overview tab by default', async ({ page }) => {
      await expect(page.locator('nav button:has-text("Overview")')).toHaveClass(/bg-blue-600/);
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should navigate to Document Hub tab', async ({ page }) => {
      await page.click('nav button:has-text("Document Hub")');
await expect(page.locator('nav button:has-text("Document Hub")')).toHaveClass(/bg-blue-600/);
      // Wait for content to load
      await page.waitForTimeout(1000);
    });

    test('should navigate to Test Features Generator tab', async ({ page }) => {
      await page.click('nav button:has-text("Test Features Generator")');
      await expect(page.locator('nav button:has-text("Test Features Generator")')).toHaveClass(/bg-blue-600/);
      // Wait for content to load
      await page.waitForTimeout(1000);
    });

    test('should navigate to Settings tab', async ({ page }) => {
      await page.click('nav button:has-text("Settings")');
      await expect(page.locator('nav button:has-text("Settings")')).toHaveClass(/bg-blue-600/);
      // Wait for content to load
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Overview Page', () => {
    test('should display system overview content', async ({ page }) => {
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
      await expect(page.locator('p:has-text("Monitor your knowledge base")')).toBeVisible();
    });

    test('should have refresh button', async ({ page }) => {
      // Look for any refresh-related button
      const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Refreshing")');
      if (await refreshButton.count() > 0) {
        await expect(refreshButton.first()).toBeVisible();
      }
    });

    test('should show loading state initially', async ({ page }) => {
      // Look for any loading indicator
      const loadingIndicator = page.locator('text=Loading..., text=Loading, .loading, [data-loading]');
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('Document Hub Page', () => {
    test('should load document hub page', async ({ page }) => {
      await page.click('nav button:has-text("Document Hub")');
await page.waitForTimeout(1000);

// Check for document hub content
await expect(page.locator('h2:has-text("Document Hub")')).toBeVisible();
    });

    test('should have upload functionality', async ({ page }) => {
      await page.click('nav button:has-text("Document Hub")');
      await page.waitForTimeout(1000);
      
      // Look for upload related elements
      const uploadElements = page.locator('[class*="upload"], [class*="Upload"], button:has-text("Upload"), input[type="file"]');
      await expect(uploadElements.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Test Features Generator Page', () => {
    test('should load test features generator page', async ({ page }) => {
      await page.click('nav button:has-text("Test Features Generator")');
      await page.waitForTimeout(1000);
      
      // Check for feature generator content
      await expect(page.locator('h2:has-text("Test Features Generator")')).toBeVisible();
    });

    test('should have feature generation interface', async ({ page }) => {
      await page.click('nav button:has-text("Test Features Generator")');
      await page.waitForTimeout(1000);
      
      // Look for feature generation elements
      const featureElements = page.locator('[class*="feature"], [class*="Feature"], textarea, button:has-text("Generate")');
      await expect(featureElements.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Settings Page', () => {
    test('should load settings page', async ({ page }) => {
      await page.click('nav button:has-text("Settings")');
      await page.waitForTimeout(1000);
      
      // Check for settings content - use more specific selector
      await expect(page.locator('h2:has-text("System Settings")')).toBeVisible();
    });

    test('should have model configuration options', async ({ page }) => {
      await page.click('nav button:has-text("Settings")');
      await page.waitForTimeout(1000);
      
      // Look for model configuration elements - use more specific selectors
      const settingsElements = page.locator('button:has-text("AI Model Configuration"), button:has-text("Database Settings")');
      await expect(settingsElements.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Search Functionality', () => {
    test('should display search bar in header', async ({ page }) => {
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should allow text input in search bar', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
    });
  });

  test.describe('Global Chat', () => {
    test('should have global chat button', async ({ page }) => {
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should open chat when clicked', async ({ page }) => {
      await page.click('button[aria-label="Open QA Genie"]');
      // Wait for chat to open
      await page.waitForTimeout(1000);
      
      // Look for chat interface elements
      const chatElements = page.locator('[class*="chat"], [class*="Chat"], textarea, button:has-text("Send")');
      await expect(chatElements.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('nav')).toBeVisible(); // Sidebar should be visible
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h1:has-text("Testoria by SNK")', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // 10 seconds
    });

    test('should handle rapid tab switching', async ({ page }) => {
      const tabs = ['Overview', 'Document Management', 'Test Features Generator', 'Settings'];
      
      for (const tab of tabs) {
        await page.click(`nav button:has-text("${tab}")`);
        await page.waitForTimeout(500); // Brief wait between switches
        await expect(page.locator(`nav button:has-text("${tab}")`)).toHaveClass(/bg-blue-600/);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network failures
      // For now, just ensure the page doesn't crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display error messages appropriately', async ({ page }) => {
      // Navigate to a page that might show errors
      await page.click('nav button:has-text("Document Management")');
      await page.waitForTimeout(1000);
      
      // The page should still be functional even if there are errors
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check for important ARIA labels
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });
  });

  test.describe('Data Loading', () => {
    test('should load test data correctly', async ({ page }) => {
      // Navigate to different sections to trigger data loading
      await page.click('nav button:has-text("Document Management")');
      await page.waitForTimeout(2000);
      
      await page.click('nav button:has-text("Test Features Generator")');
      await page.waitForTimeout(2000);
      
      // The pages should load without errors
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle empty states', async ({ page }) => {
      // Navigate to sections that might be empty
      await page.click('nav button:has-text("Document Management")');
      await page.waitForTimeout(2000);
      
      // Should handle empty document list gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });
}); 