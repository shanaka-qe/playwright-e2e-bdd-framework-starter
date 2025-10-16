/**
 * Base Page Object Model Class
 * 
 * Provides common functionality for all page objects
 */

import { Page, Locator, expect } from '@playwright/test';
import { environmentConfig } from '../config/EnvironmentConfig';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = environmentConfig.getUIConfig().baseUrl;
  }

  /**
   * Navigate to the page
   */
  abstract navigate(): Promise<void>;

  /**
   * Wait for page to be ready (override in subclasses for specific checks)
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout?: number): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ 
      state: 'visible', 
      timeout: timeout || environmentConfig.getUIConfig().defaultTimeout 
    });
    return element;
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout?: number): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ 
      state: 'hidden', 
      timeout: timeout || environmentConfig.getUIConfig().defaultTimeout 
    });
  }

  /**
   * Click element with retry logic
   */
  async clickElement(selector: string, options?: { 
    timeout?: number; 
    force?: boolean; 
    retries?: number 
  }): Promise<void> {
    const { timeout, force = false, retries = 3 } = options || {};
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const element = await this.waitForElement(selector, timeout);
        await element.click({ force, timeout });
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to click element '${selector}' after ${retries} attempts: ${error}`);
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field with validation
   */
  async fillInput(selector: string, value: string, options?: {
    timeout?: number;
    clear?: boolean;
    validate?: boolean;
  }): Promise<void> {
    const { timeout, clear = true, validate = true } = options || {};
    
    const element = await this.waitForElement(selector, timeout);
    
    if (clear) {
      await element.clear();
    }
    
    await element.fill(value);
    
    if (validate) {
      await expect(element).toHaveValue(value);
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string | { label?: string; value?: string; index?: number }): Promise<void> {
    const element = await this.waitForElement(selector);
    
    if (typeof value === 'string') {
      await element.selectOption(value);
    } else if (value.value) {
      await element.selectOption({ value: value.value });
    } else if (value.label) {
      await element.selectOption({ label: value.label });
    } else if (value.index !== undefined) {
      await element.selectOption({ index: value.index });
    }
  }

  /**
   * Get text content of element
   */
  async getElementText(selector: string, timeout?: number): Promise<string> {
    const element = await this.waitForElement(selector, timeout);
    return await element.textContent() || '';
  }

  /**
   * Get attribute value
   */
  async getElementAttribute(selector: string, attribute: string, timeout?: number): Promise<string | null> {
    const element = await this.waitForElement(selector, timeout);
    return await element.getAttribute(attribute);
  }

  /**
   * Check if element exists
   */
  async isElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isEnabled();
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(selector: string, filename: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.screenshot({ path: `test-results/screenshots/${filename}.png` });
  }

  /**
   * Take full page screenshot
   */
  async takePageScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${filename}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout?: number): Promise<any> {
    const response = await this.page.waitForResponse(
      (response) => {
        if (typeof urlPattern === 'string') {
          return response.url().includes(urlPattern);
        }
        return urlPattern.test(response.url());
      },
      { timeout: timeout || environmentConfig.getApiConfig().timeout }
    );
    
    return await response.json();
  }

  /**
   * Handle JavaScript dialogs
   */
  async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      if (promptText) {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.setInputFiles(filePath);
  }

  /**
   * Download file
   */
  async downloadFile(triggerSelector: string): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.clickElement(triggerSelector);
    const download = await downloadPromise;
    const path = `test-results/downloads/${download.suggestedFilename()}`;
    await download.saveAs(path);
    return path;
  }

  /**
   * Execute JavaScript in browser context
   */
  async executeScript(script: string, ...args: any[]): Promise<any> {
    return await this.page.evaluate(script, ...args);
  }

  /**
   * Get console logs
   */
  getConsoleLogs(): string[] {
    const logs: string[] = [];
    this.page.on('console', (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    return logs;
  }

  /**
   * Assert element is visible with custom message
   */
  async assertElementVisible(selector: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toBeVisible();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(selector: string, text: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toContainText(text);
  }

  /**
   * Assert element has attribute value
   */
  async assertElementHasAttribute(selector: string, attribute: string, value: string, message?: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element, message).toHaveAttribute(attribute, value);
  }

  /**
   * Assert page has title
   */
  async assertPageTitle(expectedTitle: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveTitle(expectedTitle);
  }

  /**
   * Assert page has URL
   */
  async assertPageUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveURL(expectedUrl);
  }
}

export default BasePage;