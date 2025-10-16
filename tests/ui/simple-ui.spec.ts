import { test, expect } from '@playwright/test';

/**
 * Simple UI Tests for QA Knowledge Base
 * Basic smoke-level tests for core functionality
 * No DB operations or model changes
 */

test.describe('Simple UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Testoria|QA Knowledge Base/i);
  });

  test('should display main application header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Testoria by SNK');
  });

  test('should have sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display all main navigation tabs', async ({ page }) => {
    const tabs = [
      'Overview',
      'Document Hub',
      'Test Features Generator',
      'Settings'
    ];

    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
  });

  test('should load overview tab by default', async ({ page }) => {
    await expect(page.locator('text=Overview')).toHaveClass(/bg-blue-600/);
    await expect(page.locator('text=System Overview')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle basic navigation', async ({ page }) => {
    // Navigate to Document Hub
await page.click('text=Document Hub');
await expect(page.locator('text=Document Hub')).toHaveClass(/bg-blue-600/);
    
    // Navigate to Test Features Generator
    await page.click('text=Test Features Generator');
    await expect(page.locator('text=Test Features Generator')).toHaveClass(/bg-blue-600/);
    
    // Navigate to Settings
    await page.click('text=Settings');
    await expect(page.locator('text=Settings')).toHaveClass(/bg-blue-600/);
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
}); 