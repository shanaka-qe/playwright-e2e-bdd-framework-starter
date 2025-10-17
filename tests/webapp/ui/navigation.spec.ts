import { test, expect } from '@playwright/test';

/**
 * Navigation and Basic UI Tests for QA Knowledge Base
 * Tests navigation, layout, and basic app functionality
 * Smoke-level tests - no DB operations or model changes
 */

test.describe('QA Knowledge Base Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test.describe('Page Load and Layout', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Application|QA Knowledge Base/i);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should display main navigation tabs', async ({ page }) => {
      const tabs = [
        'Overview',
        'Document Hub', 
        'Test Features Generator',
        'Settings'
      ];

      for (const tab of tabs) {
        await expect(page.locator(`nav button:has-text("${tab}")`)).toBeVisible();
      }
    });

    test('should have responsive layout', async ({ page }) => {
      // Test desktop layout
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('nav')).toBeVisible();
      
      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate to Overview tab by default', async ({ page }) => {
      await expect(page.locator('nav button:has-text("Overview")')).toHaveClass(/bg-blue-600/);
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should navigate to Document Hub tab', async ({ page }) => {
      await page.click('nav button:has-text("Document Hub")');
await expect(page.locator('nav button:has-text("Document Hub")')).toHaveClass(/bg-blue-600/);
await expect(page.locator('h2:has-text("Upload & Manage Documents")')).toBeVisible();
    });

    test('should navigate to Test Features Generator tab', async ({ page }) => {
      await page.click('nav button:has-text("Test Features Generator")');
      await expect(page.locator('nav button:has-text("Test Features Generator")')).toHaveClass(/bg-blue-600/);
      await expect(page.locator('h2:has-text("Feature Files")')).toBeVisible();
    });

    test('should navigate to Settings tab', async ({ page }) => {
      await page.click('nav button:has-text("Settings")');
      await expect(page.locator('nav button:has-text("Settings")')).toHaveClass(/bg-blue-600/);
      await expect(page.locator('h2:has-text("System Settings")')).toBeVisible();
    });

    test('should show tab counts when available', async ({ page }) => {
      // Navigate to Document Hub to potentially trigger count updates
await page.click('nav button:has-text("Document Hub")');
      
      // Check if any tabs have count badges (they might be 0 or hidden)
      const countBadges = page.locator('.bg-gray-600');
      if (await countBadges.count() > 0) {
        await expect(countBadges.first()).toBeVisible();
      }
    });
  });

  test.describe('Header and Branding', () => {
    test('should display app title and description', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
      // Check for any description text that might be present
      const descriptionElements = page.locator('p:has-text("Monitor your knowledge base"), p:has-text("AI-powered"), p:has-text("QA system")');
      if (await descriptionElements.count() > 0) {
        await expect(descriptionElements.first()).toBeVisible();
      }
    });

    test('should have proper styling and layout', async ({ page }) => {
      await expect(page.locator('h1')).toHaveClass(/text-xl/);
      await expect(page.locator('h1')).toHaveClass(/font-bold/);
      await expect(page.locator('h1')).toHaveClass(/text-white/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Sidebar Functionality', () => {
    test('should handle sidebar collapse/expand', async ({ page }) => {
      const collapseButton = page.locator('button:has-text("←")');
      await collapseButton.click();
      
      // Should show collapsed state
      await expect(page.locator('button:has-text("→")')).toBeVisible();
      
      // Expand again
      await page.locator('button:has-text("→")').click();
      await expect(page.locator('button:has-text("←")')).toBeVisible();
    });

    test('should maintain navigation state when sidebar is collapsed', async ({ page }) => {
      // Navigate to a tab
      await page.click('nav button:has-text("Document Hub")');
      await expect(page.locator('nav button:has-text("Document Hub")')).toHaveClass(/bg-blue-600/);
      
      // Collapse sidebar
      await page.click('button:has-text("←")');
      
      // Should still be on the same tab
      await expect(page.locator('h2:has-text("Upload & Manage Documents")')).toBeVisible();
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

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('h1', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle rapid tab switching', async ({ page }) => {
      const tabs = [
        'Overview',
        'Document Hub',
        'Test Features Generator',
        'Settings'
      ];

      for (const tab of tabs) {
        await page.click(`nav button:has-text("${tab}")`);
        await expect(page.locator(`nav button:has-text("${tab}")`)).toHaveClass(/bg-blue-600/);
        await page.waitForTimeout(100);
      }
    });
  });
}); 