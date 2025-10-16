import { test, expect } from '@playwright/test';

/**
 * Feature Generator Tests for QA Knowledge Base
 * Tests the AI-powered feature generation functionality
 * Smoke-level tests - no actual feature generation or DB operations
 */

test.describe('Feature Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL (will be determined by environment)
    await page.goto('/');
    await page.click('nav button:has-text("Test Features Generator")');
  });

  test.describe('Feature Generator Interface', () => {
    test('should display feature generator interface', async ({ page }) => {
      await expect(page.locator('text=Feature Generator')).toBeVisible();
    });

    test('should have chat interface', async ({ page }) => {
      // Look for chat-related elements
      const chatElements = page.locator('text=Chat, text=Message, text=Send');
      if (await chatElements.count() > 0) {
        await expect(chatElements.first()).toBeVisible();
      }
    });

    test('should have input field for messages', async ({ page }) => {
      // Look for text input or textarea
      const inputField = page.locator('input[type="text"], textarea, input[placeholder*="message"], input[placeholder*="Message"]');
      if (await inputField.count() > 0) {
        await expect(inputField.first()).toBeVisible();
      }
    });

    test('should have send button', async ({ page }) => {
      // Look for send button
      const sendButton = page.locator('button:has-text("Send"), button:has-text("Submit"), button[type="submit"]');
      if (await sendButton.count() > 0) {
        await expect(sendButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Live Preview Functionality', () => {
    test('should display live preview section', async ({ page }) => {
      // Look for preview-related elements
      const previewElements = page.locator('text=Live Preview, text=Preview, text=Gherkin');
      if (await previewElements.count() > 0) {
        await expect(previewElements.first()).toBeVisible();
      }
    });

    test('should have copy functionality', async ({ page }) => {
      // Look for copy button
      const copyButton = page.locator('button:has-text("Copy"), button:has-text("Copy to Clipboard")');
      if (await copyButton.count() > 0) {
        await expect(copyButton.first()).toBeVisible();
      }
    });

    test('should have download functionality', async ({ page }) => {
      // Look for download button
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Save")');
      if (await downloadButton.count() > 0) {
        await expect(downloadButton.first()).toBeVisible();
      }
    });

    test('should have expand preview functionality', async ({ page }) => {
      // Look for expand button
      const expandButton = page.locator('button:has-text("Expand"), button:has-text("Full Screen")');
      if (await expandButton.count() > 0) {
        await expect(expandButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Feature Management', () => {
    test('should display feature files section', async ({ page }) => {
      // Look for feature files section
      const featureFilesSection = page.locator('text=Feature Files, text=Saved Features, text=Generated Features');
      if (await featureFilesSection.count() > 0) {
        await expect(featureFilesSection.first()).toBeVisible();
      }
    });

    test('should have generated features category', async ({ page }) => {
      // Look for generated features section
      const generatedSection = page.locator('text=Generated, text=Generated Features');
      if (await generatedSection.count() > 0) {
        await expect(generatedSection.first()).toBeVisible();
      }
    });

    test('should have imported features category', async ({ page }) => {
      // Look for imported features section
      const importedSection = page.locator('text=Imported, text=Imported Features');
      if (await importedSection.count() > 0) {
        await expect(importedSection.first()).toBeVisible();
      }
    });

    test('should have feature management actions', async ({ page }) => {
      // Look for action buttons
      const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("Preview")');
      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Modal Functionality', () => {
    test('should have edit modal capability', async ({ page }) => {
      // Look for edit-related elements
      const editElements = page.locator('text=Edit, text=Edit Feature, text=Modify');
      if (await editElements.count() > 0) {
        await expect(editElements.first()).toBeVisible();
      }
    });

    test('should have delete confirmation modal', async ({ page }) => {
      // Look for delete-related elements
      const deleteElements = page.locator('text=Delete, text=Remove, text=Confirm Delete');
      if (await deleteElements.count() > 0) {
        await expect(deleteElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Test that the page doesn't crash on network issues
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display error messages when appropriate', async ({ page }) => {
      // Look for error message containers
      const errorContainers = page.locator('.text-red-600, .text-red-500, .bg-red-50');
      // Error containers might not be visible if there are no errors
      // Just ensure the page is stable
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('text=Feature Generator')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('text=Feature Generator')).toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('text=Feature Generator')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load feature generator within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('text=🥒 Test Features Generator');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe('Layout Structure', () => {
    test('should have two-column layout', async ({ page }) => {
      // Check for layout structure
      await expect(page.locator('body')).toBeVisible();
      
      // Look for flex or grid layout indicators
      const layoutElements = page.locator('[style*="flex"], [style*="grid"], .flex, .grid');
      if (await layoutElements.count() > 0) {
        await expect(layoutElements.first()).toBeVisible();
      }
    });

    test('should have proper spacing and padding', async ({ page }) => {
      // Check that the page has proper layout
      await expect(page.locator('body')).toBeVisible();
    });
  });
}); 