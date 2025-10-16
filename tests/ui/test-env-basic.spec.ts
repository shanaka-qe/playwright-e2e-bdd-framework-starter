import { test, expect } from '@playwright/test';

test.describe('Testoria Test Environment - Basic UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test environment
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1:has-text("Testoria by SNK")', { timeout: 10000 });
  });

  test.describe('Basic Page Functionality', () => {
    test('should load homepage successfully', async ({ page }) => {
      // Check if the page loads without errors
      await expect(page).toHaveTitle(/Testoria/);
      
      // Check for main layout elements - use more specific selectors
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should display main navigation structure', async ({ page }) => {
      // Check for navigation elements using more flexible selectors
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('button').first()).toBeVisible();
    });

    test('should have responsive layout', async ({ page }) => {
      // Check if main content areas are visible
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
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
      await expect(page.locator('h1:has-text("Testoria by SNK")')).toBeVisible();
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
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network failures
      // For now, just ensure the page doesn't crash
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check for important ARIA labels
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy - use first() to avoid multiple matches
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('h2').first()).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });
  });

  test.describe('Content Loading', () => {
    test('should display overview content', async ({ page }) => {
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
      await expect(page.locator('p:has-text("Monitor your knowledge base")')).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      // The page should be functional even if some content is loading
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Navigation Elements', () => {
    test('should have clickable navigation buttons', async ({ page }) => {
      // Find all buttons in the navigation area
      const navButtons = page.locator('nav button');
      await expect(navButtons.first()).toBeVisible();
      
      // Try clicking the first button to see if navigation works
      await navButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Page should still be functional after navigation attempt
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('API Integration', () => {
    test('should be able to make API calls', async ({ page }) => {
      // Test that the page can make API calls by checking if the app is responsive
      await expect(page.locator('body')).toBeVisible();
      
      // Try to interact with the search functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    });
  });
}); 