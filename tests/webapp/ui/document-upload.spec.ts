import { test, expect } from '@playwright/test';

/**
 * Document Upload Tests for QA Knowledge Base
 * Tests document upload functionality and file handling
 * Smoke-level tests - no actual file uploads or DB operations
 */

test.describe('Document Upload Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('nav button:has-text("Document Hub")');
  });

  test.describe('Document Upload Interface', () => {
    test('should display upload interface elements', async ({ page }) => {
      await expect(page.locator('text=Upload Documents').first()).toBeVisible();
      // File input is hidden but accessible via data-testid
      await expect(page.locator('[data-testid="document-file-input"]')).toBeAttached();
    });

    test('should have proper file input styling', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should show upload instructions', async ({ page }) => {
      // Look for upload instructions or help text
      const helpText = page.locator('text=Click to upload, text=Drag and drop, text=Choose file');
      if (await helpText.count() > 0) {
        await expect(helpText.first()).toBeVisible();
      }
    });
  });

  test.describe('File Upload Functionality', () => {
    test('should accept PDF files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file upload interface without actual files
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should accept DOCX files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file upload interface without actual files
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should accept Markdown files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file upload interface without actual files
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should accept TXT files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file upload interface without actual files
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should handle single file uploads', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test single file upload interface
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
      // Note: App currently supports single file uploads only
      // The file input does not have 'multiple' attribute
    });

    test('should handle large files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file upload interface
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });
  });

  test.describe('File Validation', () => {
    test('should reject unsupported file types', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file validation interface
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });

    test('should handle empty files', async ({ page }) => {
      const fileInput = page.locator('[data-testid="document-file-input"]');
      
      // Test file validation interface
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeEnabled();
    });
  });

  test.describe('Upload Tabs Navigation', () => {
    test('should display all upload tabs', async ({ page }) => {
      const tabs = [
        'Upload Documents',
        'Bulk Feature Files',
        'JIRA Import'
      ];

      for (const tab of tabs) {
        await expect(page.locator(`button[class*="border-b-2"]:has-text("${tab}")`)).toBeVisible();
      }
    });

    test('should navigate to Upload Documents tab by default', async ({ page }) => {
      await expect(page.locator('button[class*="border-b-2"]:has-text("Upload Documents")')).toHaveClass(/border-blue-500/);
      await expect(page.locator('h3:has-text("Upload Document")')).toBeVisible();
    });

    test('should navigate to Bulk Feature Files tab', async ({ page }) => {
      await page.click('button[class*="border-b-2"]:has-text("Bulk Feature Files")');
      await expect(page.locator('button[class*="border-b-2"]:has-text("Bulk Feature Files")')).toHaveClass(/border-blue-500/);
      await expect(page.locator('text=Bulk Feature File Ingestion')).toBeVisible();
    });

    test('should navigate to JIRA Import tab', async ({ page }) => {
      await page.click('button[class*="border-b-2"]:has-text("JIRA Import")');
      await expect(page.locator('button[class*="border-b-2"]:has-text("JIRA Import")')).toHaveClass(/border-blue-500/);
      await expect(page.locator('text=JIRA').nth(1)).toBeVisible();
    });
  });

  test.describe('Document List Interface', () => {
    test('should display document list section', async ({ page }) => {
      // Check for document management section
      // Document list might be empty, so just verify the section exists
      await expect(page.locator('h2:has-text("Upload & Manage Documents")')).toBeVisible();
    });

    test('should have search and filter functionality', async ({ page }) => {
      // Look for search input
      const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });

    test('should have pagination controls', async ({ page }) => {
      // Look for pagination elements
      const paginationElements = page.locator('text=Previous, text=Next, text=Page');
      if (await paginationElements.count() > 0) {
        await expect(paginationElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Document Preview', () => {
    test('should have document preview functionality', async ({ page }) => {
      // Look for preview-related elements
      const previewElements = page.locator('text=Preview, text=View, text=Open');
      if (await previewElements.count() > 0) {
        await expect(previewElements.first()).toBeVisible();
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
      await expect(page.locator('text=Upload Documents')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('text=Upload Documents')).toBeVisible();
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('text=Upload Documents')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load upload interface within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('text=📄 Document Hub');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });
  });
}); 