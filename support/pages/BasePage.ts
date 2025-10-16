/**
 * Base Page Object
 * 
 * Provides common functionality for all page objects
 * Implements shared patterns and utilities
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';

export abstract class BasePage {
  protected page: Page;
  protected roleBasedLocators: RoleBasedLocators;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    this.page = page;
    this.roleBasedLocators = roleBasedLocators;
  }

  /**
   * Navigate to the page - must be implemented by subclasses
   */
  abstract navigate(): Promise<void>;

  /**
   * Wait for page to be ready - must be implemented by subclasses
   */
  abstract waitForPageReady(): Promise<void>;

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for DOM content to be loaded
   */
  async waitForDOMContentLoaded(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Take screenshot of current page
   */
  async takeScreenshot(name?: string): Promise<Buffer> {
    const screenshotName = name || `page-${Date.now()}`;
    return await this.page.screenshot({ 
      path: `test-results/screenshots/${screenshotName}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).not.toBeVisible({ timeout });
  }

  /**
   * Wait for text to appear on page
   */
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible({ timeout });
  }

  /**
   * Wait for text to disappear from page
   */
  async waitForTextHidden(text: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.getByText(text)).not.toBeVisible({ timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Click element and wait for navigation
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation(),
      locator.click()
    ]);
  }

  /**
   * Fill form field and wait for change
   */
  async fillAndWaitForChange(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
    await expect(locator).toHaveValue(value);
  }

  /**
   * Select option and wait for change
   */
  async selectAndWaitForChange(locator: Locator, option: string): Promise<void> {
    await locator.selectOption(option);
    await expect(locator).toHaveValue(option);
  }

  /**
   * Check if element exists without waiting
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is visible without waiting
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get element text content safely
   */
  async getTextContent(locator: Locator): Promise<string> {
    try {
      return await locator.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get input value safely
   */
  async getInputValue(locator: Locator): Promise<string> {
    try {
      return await locator.inputValue();
    } catch {
      return '';
    }
  }

  /**
   * Click element with retry
   */
  async clickWithRetry(locator: Locator, maxRetries: number = 3): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await locator.click();
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for loading indicators to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    const commonLoadingSelectors = [
      '[data-testid="loading-spinner"]',
      '.loading',
      '.spinner',
      '[aria-label="Loading"]'
    ];

    for (const selector of commonLoadingSelectors) {
      const loadingElement = this.page.locator(selector);
      if (await this.isElementVisible(loadingElement)) {
        await expect(loadingElement).not.toBeVisible({ timeout: 30000 });
      }
    }
  }

  /**
   * Handle modal dialogs
   */
  async waitForModal(): Promise<Locator> {
    const modal = this.roleBasedLocators.dialog();
    await expect(modal).toBeVisible();
    return modal;
  }

  /**
   * Close modal dialog
   */
  async closeModal(): Promise<void> {
    // Try Escape key first
    await this.page.keyboard.press('Escape');
    
    // Wait and check if modal is still visible
    await this.page.waitForTimeout(500);
    const modal = this.roleBasedLocators.dialog();
    
    if (await this.isElementVisible(modal)) {
      // Try close button
      const closeButton = modal.getByRole('button', { name: /close|cancel|×/i });
      if (await this.isElementVisible(closeButton)) {
        await closeButton.click();
      }
    }
  }

  /**
   * Wait for AJAX requests to complete
   */
  async waitForAjaxComplete(): Promise<void> {
    await this.page.waitForFunction(() => {
      // Check if jQuery is available
      if (typeof window.jQuery !== 'undefined') {
        return window.jQuery.active === 0;
      }
      
      // Check for fetch or XMLHttpRequest activity
      return true; // Fallback - assume complete
    });
  }

  /**
   * Hover over element
   */
  async hoverElement(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click element
   */
  async doubleClickElement(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClickElement(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(sourceLocator: Locator, targetLocator: Locator): Promise<void> {
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Press keyboard shortcut
   */
  async pressKeyboardShortcut(shortcut: string): Promise<void> {
    await this.page.keyboard.press(shortcut);
  }

  /**
   * Upload file to input
   */
  async uploadFile(fileInputLocator: Locator, filePath: string): Promise<void> {
    await fileInputLocator.setInputFiles(filePath);
  }

  /**
   * Download file and return path
   */
  async downloadFile(downloadTriggerLocator: Locator): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      downloadTriggerLocator.click()
    ]);
    
    const path = await download.path();
    return path || '';
  }

  /**
   * Verify accessibility
   */
  async verifyAccessibility(): Promise<void> {
    // Basic accessibility checks
    const pageTitle = await this.getPageTitle();
    expect(pageTitle).toBeTruthy();
    
    // Check for proper heading structure
    const headings = this.page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  }

  /**
   * Get current viewport size
   */
  async getViewportSize(): Promise<{ width: number; height: number }> {
    return this.page.viewportSize() || { width: 0, height: 0 };
  }

  /**
   * Set viewport size
   */
  async setViewportSize(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }
}