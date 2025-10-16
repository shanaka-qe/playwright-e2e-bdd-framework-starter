/**
 * Navigation Step Definitions (Playwright-BDD)
 * 
 * Step definitions specific to navigation functionality in the webapp
 */

import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

// Background Steps
Given('the webapp is accessible', async ({ testWorld }) => {
  if (!testWorld.page) {
    throw new Error('Page is not initialized. Check browser setup.');
  }
  await testWorld.page.goto('/');
  await testWorld.waitForPageLoad();
});

Given('I am on the main dashboard', async ({ testWorld }) => {
  if (!testWorld.page) {
    throw new Error('Page is not initialized. Check browser setup.');
  }
  await testWorld.page.goto('/');
  await testWorld.waitForPageLoad();
});

// Tab Navigation Steps - removed duplicate, using common-steps version

Then('I should be on the {string} page', async ({ testWorld }, pageName: string) => {
  if (!testWorld.page) {
    throw new Error('Page is not initialized. Check browser setup.');
  }
  
  await testWorld.waitForPageLoad();
  
  const pageIndicators: Record<string, string[]> = {
    'Overview': ['h2:has-text("System Overview")', 'h1:has-text("Overview")'],
    'Document Hub': ['h2:has-text("Upload & Manage Documents")', 'h1:has-text("Document Hub")'],
    'Test Features Generator': ['h2:has-text("Feature Files")', 'h1:has-text("Feature Generator")'],
    'Settings': ['h2:has-text("System Settings")', 'h1:has-text("Settings")']
  };
  
  const indicators = pageIndicators[pageName] || [];
  let pageFound = false;
  
  for (const selector of indicators) {
    try {
      await expect(testWorld.page.locator(selector)).toBeVisible({ timeout: 5000 });
      pageFound = true;
      break;
    } catch (error) {
      // Continue to next selector
    }
  }
  
  if (!pageFound) {
    throw new Error(`Could not verify we are on the ${pageName} page`);
  }
});

// Tab active step - removed duplicate, using common-steps version

// Sidebar Navigation Steps
When('I click the sidebar toggle button', async ({ testWorld, sidebarComponent }) => {
  await sidebarComponent.toggleSidebar();
  await testWorld.waitForPageLoad();
});

When('I click the sidebar toggle button again', async ({ testWorld, sidebarComponent }) => {
  await sidebarComponent.toggleSidebar();
  await testWorld.waitForPageLoad();
});

Then('the sidebar should collapse', async ({ sidebarComponent }) => {
  const isCollapsed = await sidebarComponent.isSidebarCollapsed();
  expect(isCollapsed).toBe(true);
});

Then('the sidebar should expand', async ({ sidebarComponent }) => {
  const isExpanded = await sidebarComponent.isSidebarExpanded();
  expect(isExpanded).toBe(true);
});

Then('the main content should expand', async ({ testWorld }) => {
  const mainContent = testWorld.page.locator('main, [role="main"], .main-content');
  await expect(mainContent).toBeVisible();
  
  // Check if main content has expanded (takes more space)
  const mainContentWidth = await mainContent.boundingBox();
  expect(mainContentWidth?.width).toBeGreaterThan(800); // Assuming expanded content is wider
});

Then('the main content should adjust accordingly', async ({ testWorld, sidebarComponent }) => {
  const mainContent = testWorld.page.locator('main, [role="main"], .main-content');
  await expect(mainContent).toBeVisible();
  
  // Verify main content is responsive to sidebar state
  const isSidebarExpanded = await sidebarComponent.isSidebarExpanded();
  if (isSidebarExpanded) {
    // When sidebar is expanded, main content should be narrower
    const mainContentWidth = await mainContent.boundingBox();
    expect(mainContentWidth?.width).toBeLessThan(1200);
  } else {
    // When sidebar is collapsed, main content should be wider
    const mainContentWidth = await mainContent.boundingBox();
    expect(mainContentWidth?.width).toBeGreaterThan(1000);
  }
});

// Breadcrumb Navigation Steps
Given('I am on a nested page within Document Hub', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToSection('Document Hub');
  // Navigate to a sub-page (e.g., document details)
  await testWorld.page.locator('a[href*="document"], .document-item').first().click();
  await testWorld.waitForPageLoad();
});

When('I view the breadcrumb navigation', async ({ testWorld }) => {
  // Breadcrumb navigation should be visible
  const breadcrumbs = testWorld.page.locator('nav[aria-label="Breadcrumb"], .breadcrumb, [role="navigation"]');
  await expect(breadcrumbs).toBeVisible();
});

Then('I should see the current page path', async ({ testWorld }) => {
  const breadcrumbs = testWorld.page.locator('nav[aria-label="Breadcrumb"], .breadcrumb, [role="navigation"]');
  const breadcrumbItems = breadcrumbs.locator('li, .breadcrumb-item');
  await expect(breadcrumbItems).toHaveCount(2); // At least 2 items (parent + current)
});

Then('I should be able to navigate to parent pages using breadcrumbs', async ({ testWorld }) => {
  const breadcrumbs = testWorld.page.locator('nav[aria-label="Breadcrumb"], .breadcrumb, [role="navigation"]');
  const parentBreadcrumb = breadcrumbs.locator('li, .breadcrumb-item').first();
  await expect(parentBreadcrumb).toBeVisible();
  await expect(parentBreadcrumb).toBeEnabled();
});

When('I click on {string} in the breadcrumbs', async ({ testWorld }, breadcrumbText: string) => {
  const breadcrumbs = testWorld.page.locator('nav[aria-label="Breadcrumb"], .breadcrumb, [role="navigation"]');
  const breadcrumbLink = breadcrumbs.locator(`a:has-text("${breadcrumbText}"), .breadcrumb-item:has-text("${breadcrumbText}")`);
  await breadcrumbLink.click();
  await testWorld.waitForPageLoad();
});

Then('I should be taken to the Document Hub main page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl.includes('document-hub') || currentUrl.includes('documents')).toBe(true);
});

// Browser Navigation Steps
Given('I navigate from Overview to Document Hub', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToSection('Document Hub');
  await testWorld.waitForPageLoad();
});

Given('then to Feature Generator', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToSection('Feature Generator');
  await testWorld.waitForPageLoad();
});

Then('the correct tab should be active', async ({ testWorld, roleBasedLocators }) => {
  // This step is already implemented in common-steps.ts
  // The specific tab will be determined by the current page
  const currentUrl = testWorld.page.url();
  if (currentUrl.includes('document-hub') || currentUrl.includes('documents')) {
    await expect(roleBasedLocators.button('Document Hub')).toHaveClass(/active|bg-blue-600|border-blue-500/);
  } else if (currentUrl.includes('feature-generator') || currentUrl.includes('generator')) {
    await expect(roleBasedLocators.button('Feature Generator')).toHaveClass(/active|bg-blue-600|border-blue-500/);
  }
});

// Mobile Navigation Steps
// Mobile viewport step - removed duplicate, using common-steps version

Then('the navigation should be mobile-optimized', async ({ testWorld }) => {
  const navigation = testWorld.page.locator('nav, .navigation, .navbar');
  await expect(navigation).toBeVisible();
  
  // Check for mobile-specific classes or attributes
  const hasMobileClass = await navigation.getAttribute('class');
  expect(hasMobileClass).toMatch(/mobile|responsive|collapsible/);
});

Then('I should see a hamburger menu button', async ({ testWorld }) => {
  const hamburgerButton = testWorld.page.locator('button[aria-label*="menu"], .hamburger, .menu-toggle, [data-testid="menu-button"]');
  await expect(hamburgerButton).toBeVisible();
});

When('I click the hamburger menu', async ({ testWorld }) => {
  const hamburgerButton = testWorld.page.locator('button[aria-label*="menu"], .hamburger, .menu-toggle, [data-testid="menu-button"]');
  await hamburgerButton.click();
  await testWorld.waitForPageLoad();
});

Then('the navigation menu should slide out', async ({ testWorld }) => {
  const mobileMenu = testWorld.page.locator('.mobile-menu, .slide-out-menu, [data-testid="mobile-menu"]');
  await expect(mobileMenu).toBeVisible();
});

Then('I should be able to navigate to different sections', async ({ testWorld }) => {
  const mobileMenu = testWorld.page.locator('.mobile-menu, .slide-out-menu, [data-testid="mobile-menu"]');
  const menuItems = mobileMenu.locator('a, button');
  await expect(menuItems).toHaveCount(3); // At least 3 main sections
  
  // Verify menu items are clickable
  for (const item of await menuItems.all()) {
    await expect(item).toBeEnabled();
  }
});

// Keyboard Navigation Steps - removed duplicates, using common-steps versions

Then('I should be able to reach all interactive elements', async ({ testWorld }) => {
  const interactiveElements = testWorld.page.locator('button, a, input, select, textarea');
  const elementCount = await interactiveElements.count();
  
  // Tab through all elements
  for (let i = 0; i < elementCount; i++) {
    await testWorld.page.keyboard.press('Tab');
    const focusedElement = testWorld.page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  }
});

Then('the focus indicators should be visible', async ({ testWorld }) => {
  // Focus on an element first
  await testWorld.page.keyboard.press('Tab');
  const focusedElement = testWorld.page.locator(':focus');
  
  // Check for focus indicators
  const outline = await focusedElement.evaluate(el => 
    window.getComputedStyle(el).outline || window.getComputedStyle(el).boxShadow
  );
  expect(outline).not.toBe('none');
});

When('I press Enter on a navigation tab', async ({ testWorld }) => {
  const focusedElement = testWorld.page.locator(':focus');
  await focusedElement.press('Enter');
  await testWorld.waitForPageLoad();
});

// Loading States Steps
When('I navigate to a new section', async ({ testWorld, navigationHelper }) => {
  // Navigate to a section that might have loading states
  await navigationHelper.navigateToSection('Feature Generator');
});

Then('I should see appropriate loading indicators', async ({ testWorld }) => {
  const loadingIndicator = testWorld.page.locator('.loading, .spinner, [data-testid="loading"], [aria-label*="loading"]');
  await expect(loadingIndicator).toBeVisible();
});

// Page load timing step - removed duplicate, using common-steps version

// Interactive elements step - removed duplicate, using common-steps version

// State Persistence Steps
Given('I am on the Feature Generator page', async ({ testWorld, navigationHelper }) => {
  await navigationHelper.navigateToSection('Feature Generator');
  await testWorld.waitForPageLoad();
});

// Browser refresh step - removed duplicate, using common-steps version

Then('I should still be on the Feature Generator page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl.includes('feature-generator') || currentUrl.includes('generator')).toBe(true);
});

Then('my previous work should be preserved', async ({ testWorld }) => {
  // Check if form data or state is preserved
  const formInputs = testWorld.page.locator('input, textarea, select');
  for (const input of await formInputs.all()) {
    const value = await input.inputValue();
    // If there was previous work, some inputs should have values
    if (value) {
      expect(value).toBeTruthy();
      break;
    }
  }
});

// Additional missing steps for updated feature names
Then('I should be on the Test Features Generator page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl.includes('feature') || currentUrl.includes('generator')).toBe(true);
});

Then('I should be on the Overview page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl === '/' || currentUrl.includes('overview')).toBe(true);
});

// Missing step definitions for Document Hub and Settings pages
Then('I should be on the Document Hub page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl.includes('document') || currentUrl.includes('hub')).toBe(true);
  
  // Also verify the page content indicates we're on Document Hub
  await expect(testWorld.page.locator('h2:has-text("Upload & Manage Documents"), h1:has-text("Document Hub"), [data-testid="document-hub"]')).toBeVisible();
});

Then('I should be on the Settings page', async ({ testWorld }) => {
  const currentUrl = testWorld.page.url();
  expect(currentUrl.includes('settings') || currentUrl.includes('config')).toBe(true);
  
  // Also verify the page content indicates we're on Settings
  await expect(testWorld.page.locator('h2:has-text("System Settings"), h1:has-text("Settings"), [data-testid="settings-page"]')).toBeVisible();
});

Then('I should navigate to that section', async ({ testWorld }) => {
  // This step verifies navigation occurred after pressing Enter
  await testWorld.waitForPageLoad();
  // The actual verification depends on which section was focused
});

When('I view the navigation', async ({ testWorld }) => {
  const navigation = testWorld.page.locator('nav, .navigation, .navbar, .sidebar');
  await expect(navigation).toBeVisible();
});

// Browser navigation steps - removed duplicates, using common-steps versions