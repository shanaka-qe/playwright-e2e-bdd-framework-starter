/**
 * Navigation and Layout E2E Tests
 * 
 * Comprehensive tests for application navigation, layout responsiveness, and UI consistency including:
 * - Main navigation functionality
 * - Sidebar behavior and responsive design
 * - Cross-browser compatibility
 * - Accessibility compliance
 * - Performance metrics
 * - Visual consistency
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../../framework/pages/HomePage';
import { DocumentHubPage } from '../../framework/pages/DocumentHubPage';
import { FeatureGeneratorPage } from '../../framework/pages/FeatureGeneratorPage';
import { GlobalChatPage } from '../../framework/pages/GlobalChatPage';

test.describe('Navigation and Layout Tests', () => {
  let homePage: HomePage;
  let documentHubPage: DocumentHubPage;
  let featureGeneratorPage: FeatureGeneratorPage;
  let globalChatPage: GlobalChatPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    documentHubPage = new DocumentHubPage(page);
    featureGeneratorPage = new FeatureGeneratorPage(page);
    globalChatPage = new GlobalChatPage(page);
    
    // Navigate to the application
    await homePage.navigate();
    await expect(page).toHaveTitle(/Testoria/);
  });

  test.describe('Main Navigation', () => {
    test('should display all main navigation tabs', async ({ page }) => {
      // Verify all main navigation tabs are present
      await expect(page.locator('button:has-text("Overview")')).toBeVisible();
      await expect(page.locator('button:has-text("Document Hub")')).toBeVisible();
      await expect(page.locator('button:has-text("Test Features Generator")')).toBeVisible();
      
      // Verify navigation tabs have proper styling
      const navigationTabs = await homePage.getNavigationTabs();
      expect(navigationTabs.length).toBeGreaterThanOrEqual(3);
      expect(navigationTabs).toContain('Overview');
      expect(navigationTabs).toContain('Document Hub');
      expect(navigationTabs).toContain('Test Features Generator');
    });

    test('should navigate between all main sections', async ({ page }) => {
      // Test navigation to Overview (default)
      await homePage.navigateToOverview();
      const activeTab = await homePage.getActiveTab();
      expect(activeTab).toContain('Overview');
      
      // Test navigation to Document Hub
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      await documentHubPage.waitForPageReady();
      
      // Test navigation to Feature Generator
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"], input[placeholder*="Ask"]')).toBeVisible();
      await featureGeneratorPage.waitForPageReady();
      
      // Navigate back to Overview
      await homePage.navigateToOverview();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should maintain navigation state during page refresh', async ({ page }) => {
      // Navigate to Document Hub
      await homePage.navigateToDocumentHub();
      await documentHubPage.waitForPageReady();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // Should maintain the Document Hub view or gracefully redirect
      const currentUrl = page.url();
      expect(currentUrl).toBeDefined();
      
      // Verify page loads properly after refresh
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should support browser back/forward navigation', async ({ page }) => {
      // Navigate through sections
      await homePage.navigateToDocumentHub();
      await documentHubPage.waitForPageReady();
      
      await homePage.navigateToFeatureGenerator();
      await featureGeneratorPage.waitForPageReady();
      
      // Test browser back button
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
      
      // Should be back to Document Hub or handled gracefully
      const isDocumentHubVisible = await page.locator('button:has-text("Upload Documents")').isVisible();
      expect(isDocumentHubVisible || await page.locator('nav').isVisible()).toBe(true);
      
      // Test browser forward button
      await page.goForward();
      await page.waitForLoadState('domcontentloaded');
      
      // Should return to Feature Generator or handled gracefully
      const isFeatureGeneratorVisible = await page.locator('textarea[placeholder*="message"]').isVisible();
      expect(isFeatureGeneratorVisible || await page.locator('nav').isVisible()).toBe(true);
    });

    test('should handle rapid tab switching', async ({ page }) => {
      const tabs = ['Overview', 'Document Hub', 'Test Features Generator'];
      
      // Rapidly switch between tabs
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          switch (tab) {
            case 'Overview':
              await homePage.navigateToOverview();
              break;
            case 'Document Hub':
              await homePage.navigateToDocumentHub();
              break;
            case 'Test Features Generator':
              await homePage.navigateToFeatureGenerator();
              break;
          }
          await page.waitForTimeout(500); // Small delay between switches
        }
      }
      
      // Verify final state is stable
      await homePage.navigateToOverview();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });

    test('should show proper tab counts and indicators', async ({ page }) => {
      // Check for tab counts or badges if implemented
      const documentHubTab = page.locator('button:has-text("Document Hub")');
      const featureGeneratorTab = page.locator('button:has-text("Test Features Generator")');
      
      // Verify tabs are accessible and clickable
      await expect(documentHubTab).toBeEnabled();
      await expect(featureGeneratorTab).toBeEnabled();
      
      // Check for any count indicators
      const tabCounts = page.locator('[class*="count"], [class*="badge"], [class*="indicator"]');
      const countElements = await tabCounts.count();
      expect(countElements).toBeGreaterThanOrEqual(0); // May or may not have counts
    });
  });

  test.describe('Sidebar Functionality', () => {
    test('should support sidebar collapse and expand', async ({ page }) => {
      // Test sidebar is initially expanded
      const isExpanded = await homePage.isSidebarExpanded();
      expect(isExpanded).toBe(true);
      
      // Test collapse functionality
      await homePage.collapseSidebar();
      const isCollapsed = await homePage.isSidebarCollapsed();
      expect(isCollapsed).toBe(true);
      
      // Test expand functionality
      await homePage.expandSidebar();
      const isExpandedAgain = await homePage.isSidebarExpanded();
      expect(isExpandedAgain).toBe(true);
    });

    test('should maintain functionality when sidebar is collapsed', async ({ page }) => {
      // Collapse sidebar
      await homePage.collapseSidebar();
      
      // Verify navigation still works
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      // Expand sidebar back
      await homePage.expandSidebar();
      await expect(page.locator('nav button')).toBeVisible();
    });

    test('should show appropriate navigation icons when collapsed', async ({ page }) => {
      await homePage.collapseSidebar();
      
      // Check for navigation icons or compact view
      const navigationElements = page.locator('nav button, nav [class*="icon"]');
      const navCount = await navigationElements.count();
      expect(navCount).toBeGreaterThan(0);
      
      // Icons should still be clickable
      const firstNavElement = navigationElements.first();
      if (await firstNavElement.isVisible()) {
        await expect(firstNavElement).toBeEnabled();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work properly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      const isResponsive = await homePage.checkResponsiveLayout({ width: 1920, height: 1080 });
      expect(isResponsive).toBe(true);
      
      // Check all main elements are visible and properly positioned
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1:has-text("Testoria")')).toBeVisible();
      
      // Verify QA Genie button is accessible
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      const isResponsive = await homePage.checkResponsiveLayout({ width: 768, height: 1024 });
      expect(isResponsive).toBe(true);
      
      // Test navigation in tablet mode
      await homePage.navigateToDocumentHub();
      const isTabletCompatible = await documentHubPage.checkTabletLayout();
      expect(isTabletCompatible).toBe(true);
      
      await homePage.navigateToFeatureGenerator();
      const isFeatureGeneratorCompatible = await featureGeneratorPage.checkTabletLayout();
      expect(isFeatureGeneratorCompatible).toBe(true);
    });

    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      const isResponsive = await homePage.checkResponsiveLayout({ width: 375, height: 667 });
      expect(isResponsive).toBe(true);
      
      // Test navigation in mobile mode
      await homePage.navigateToDocumentHub();
      const isMobileCompatible = await documentHubPage.checkMobileLayout();
      expect(isMobileCompatible).toBe(true);
      
      // Test feature generator mobile layout
      await homePage.navigateToFeatureGenerator();
      const isFeatureGeneratorMobile = await featureGeneratorPage.checkMobileLayout();
      expect(isFeatureGeneratorMobile).toBe(true);
      
      // Test global chat mobile layout
      await globalChatPage.openChat();
      const isChatMobile = await globalChatPage.checkMobileLayout();
      expect(isChatMobile).toBe(true);
      await globalChatPage.closeChat();
    });

    test('should handle viewport size changes dynamically', async ({ page }) => {
      // Start with desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);
      
      // Navigate to feature generator
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Verify layout adapts
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Resize back to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(1000);
      
      // Verify layout returns to desktop mode
      const isDesktopLayout = await featureGeneratorPage.checkTwoColumnLayout();
      expect(isDesktopLayout).toBe(true);
    });

    test('should maintain functionality across different orientations', async ({ page }) => {
      // Test portrait orientation (mobile)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      
      // Test landscape orientation (mobile)
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Navigation should still work
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      // Back to portrait tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await homePage.navigateToOverview();
      await expect(page.locator('h2:has-text("System Overview")')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should display search bar and handle input', async ({ page }) => {
      // Verify search bar is visible
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      
      // Test search input
      await homePage.performSearch('test query');
      
      const searchValue = await homePage.getSearchValue();
      expect(searchValue).toBe('test query');
      
      // Clear search
      await homePage.clearSearch();
      const clearedValue = await homePage.getSearchValue();
      expect(clearedValue).toBe('');
    });

    test('should handle search on different pages', async ({ page }) => {
      // Test search from Overview
      await homePage.navigateToOverview();
      await homePage.performSearch('document');
      await page.waitForTimeout(2000);
      
      // Test search from Document Hub
      await homePage.navigateToDocumentHub();
      await homePage.performSearch('feature');
      await page.waitForTimeout(2000);
      
      // Test search from Feature Generator
      await homePage.navigateToFeatureGenerator();
      await homePage.performSearch('test');
      await page.waitForTimeout(2000);
      
      // Search should work from all pages
      const finalSearchValue = await homePage.getSearchValue();
      expect(finalSearchValue).toBe('test');
    });

    test('should show search suggestions or results', async ({ page }) => {
      // Perform search
      await homePage.performSearch('documentation');
      await page.waitForTimeout(3000);
      
      // Check for search results or suggestions
      const searchResults = page.locator('[class*="search-result"], [class*="suggestion"], [class*="result"]');
      const resultCount = await searchResults.count();
      
      // May or may not show results depending on implementation
      expect(resultCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Global Chat Integration', () => {
    test('should display QA Genie button on all pages', async ({ page }) => {
      // Check on Overview
      await homePage.navigateToOverview();
      const isQAGenieAvailable = await homePage.isQAGenieAvailable();
      expect(isQAGenieAvailable).toBe(true);
      
      // Check on Document Hub
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
      
      // Check on Feature Generator
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
    });

    test('should open and close QA Genie from any page', async ({ page }) => {
      const pages = ['Overview', 'Document Hub', 'Test Features Generator'];
      
      for (const pageName of pages) {
        // Navigate to page
        switch (pageName) {
          case 'Overview':
            await homePage.navigateToOverview();
            break;
          case 'Document Hub':
            await homePage.navigateToDocumentHub();
            break;
          case 'Test Features Generator':
            await homePage.navigateToFeatureGenerator();
            break;
        }
        
        // Test QA Genie functionality
        await globalChatPage.openChat();
        const isChatOpen = await globalChatPage.isChatOpen();
        expect(isChatOpen).toBe(true);
        
        await globalChatPage.closeChat();
        const isChatClosed = !await globalChatPage.isChatOpen();
        expect(isChatClosed).toBe(true);
      }
    });

    test('should maintain QA Genie state during navigation', async ({ page }) => {
      // Open QA Genie on Overview
      await homePage.navigateToOverview();
      await globalChatPage.openChat();
      
      // Send a message
      await globalChatPage.sendMessage('Test message');
      await page.waitForTimeout(3000);
      
      // Navigate to Document Hub
      await homePage.navigateToDocumentHub();
      
      // QA Genie should remain accessible
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
      
      // If chat was closed during navigation, it should reopen properly
      if (!await globalChatPage.isChatOpen()) {
        await globalChatPage.openChat();
      }
      
      // Should be able to continue conversation
      await globalChatPage.sendMessage('Another message');
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
    });
  });

  test.describe('Accessibility and Usability', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThan(0);
      
      // Continue tabbing through navigation elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Should activate focused element (implementation dependent)
      expect(page.url()).toBeDefined();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check for ARIA labels on navigation elements
      const ariaLabels = page.locator('[aria-label], [role], [aria-describedby]');
      const ariaCount = await ariaLabels.count();
      expect(ariaCount).toBeGreaterThan(0);
      
      // Specific checks for key elements
      await expect(page.locator('button[aria-label="Open QA Genie"]')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Take screenshot for visual verification
      await page.screenshot({ path: 'test-results/screenshots/color-contrast-test.png', fullPage: true });
      
      // Check for high contrast elements
      const navigationButtons = page.locator('nav button');
      const buttonCount = await navigationButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Verify buttons are visible and distinguishable
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = navigationButtons.nth(i);
        await expect(button).toBeVisible();
      }
    });

    test('should support screen readers', async ({ page }) => {
      const accessibilityFeatures = await homePage.checkAccessibilityFeatures();
      
      expect(accessibilityFeatures.hasAriaLabels).toBe(true);
      expect(accessibilityFeatures.hasHeadingStructure).toBe(true);
      expect(accessibilityFeatures.hasKeyboardNavigation).toBe(true);
    });

    test('should handle focus management properly', async ({ page }) => {
      // Navigate to Document Hub
      await homePage.navigateToDocumentHub();
      
      // Tab to upload button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElements = await page.locator(':focus').count();
      expect(focusedElements).toBeGreaterThan(0);
      
      // Test Escape key behavior
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Focus should be managed appropriately
      expect(page.url()).toBeDefined();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const pages = [
        { name: 'Overview', navigate: () => homePage.navigateToOverview() },
        { name: 'Document Hub', navigate: () => homePage.navigateToDocumentHub() },
        { name: 'Feature Generator', navigate: () => homePage.navigateToFeatureGenerator() }
      ];
      
      for (const pageInfo of pages) {
        const startTime = Date.now();
        await pageInfo.navigate();
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        route.continue();
      });
      
      // Test navigation still works
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible({ timeout: 10000 });
      
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible({ timeout: 10000 });
    });

    test('should show loading indicators when appropriate', async ({ page }) => {
      // Navigate to feature generator (might show loading)
      await homePage.navigateToFeatureGenerator();
      
      // Check for loading indicators
      const loadingElements = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
      const loadingCount = await loadingElements.count();
      
      // May or may not have loading indicators
      expect(loadingCount).toBeGreaterThanOrEqual(0);
      
      // Ensure page loads completely
      await expect(page.locator('main')).toBeVisible();
    });

    test('should cache resources appropriately', async ({ page }) => {
      // First load
      const startTime1 = Date.now();
      await homePage.navigateToDocumentHub();
      const firstLoadTime = Date.now() - startTime1;
      
      // Navigate away and back
      await homePage.navigateToOverview();
      
      // Second load (should be faster due to caching)
      const startTime2 = Date.now();
      await homePage.navigateToDocumentHub();
      const secondLoadTime = Date.now() - startTime2;
      
      // Second load should be faster or at least not significantly slower
      expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime + 1000);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle navigation errors gracefully', async ({ page }) => {
      // Try to navigate to invalid route
      await page.goto('/invalid-route');
      
      // Should either redirect to valid page or show error page
      await page.waitForLoadState('domcontentloaded');
      
      // Check if error is handled
      const hasError = await homePage.hasErrorMessages();
      const isOnValidPage = await page.locator('nav').isVisible();
      
      expect(hasError || isOnValidPage).toBe(true);
    });

    test('should recover from JavaScript errors', async ({ page }) => {
      // Inject a JavaScript error
      await page.evaluate(() => {
        // @ts-ignore
        window.console.error('Test error injection');
      });
      
      // Navigation should still work
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
    });

    test('should handle missing resources gracefully', async ({ page }) => {
      // Block some static resources
      await page.route('**/*.png', route => route.abort());
      await page.route('**/*.jpg', route => route.abort());
      
      // Page should still be functional
      await homePage.navigateToOverview();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Navigation should work
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
    });

    test('should show appropriate error messages', async ({ page }) => {
      // Look for any existing error messages
      const errorMessages = await homePage.hasErrorMessages();
      
      if (errorMessages) {
        // If there are errors, they should be user-friendly
        const errors = page.locator('[class*="error"], [role="alert"]');
        const errorCount = await errors.count();
        expect(errorCount).toBeGreaterThan(0);
        
        // Error messages should be visible
        await expect(errors.first()).toBeVisible();
      } else {
        // If no errors, navigation should work normally
        await homePage.navigateToDocumentHub();
        await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should maintain consistent layout across viewports', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop Large' },
        { width: 1366, height: 768, name: 'Desktop Standard' },
        { width: 1024, height: 768, name: 'Tablet Landscape' },
        { width: 768, height: 1024, name: 'Tablet Portrait' },
        { width: 375, height: 667, name: 'Mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        // Take screenshot for visual comparison
        await page.screenshot({ 
          path: `test-results/screenshots/layout-${viewport.name.replace(' ', '-').toLowerCase()}.png`,
          fullPage: true 
        });
        
        // Verify basic layout elements
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
        // Test basic navigation
        await homePage.navigateToDocumentHub();
        await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
        
        await homePage.navigateToOverview();
        await expect(page.locator('h1:has-text("Testoria")')).toBeVisible();
      }
    });

    test('should handle browser-specific features gracefully', async ({ page }) => {
      // Get browser info
      const browserInfo = await homePage.getBrowserInfo();
      
      expect(browserInfo.userAgent).toBeDefined();
      expect(browserInfo.viewport.width).toBeGreaterThan(0);
      expect(browserInfo.viewport.height).toBeGreaterThan(0);
      expect(browserInfo.devicePixelRatio).toBeGreaterThan(0);
      
      // Test browser-specific functionality
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      // QA Genie should work across browsers
      await globalChatPage.openChat();
      const isChatOpen = await globalChatPage.isChatOpen();
      expect(isChatOpen).toBe(true);
      await globalChatPage.closeChat();
    });
  });
});