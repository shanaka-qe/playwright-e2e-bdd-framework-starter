/**
 * Playwright Test Helpers with Logging
 * 
 * This module provides helper functions for Playwright tests with integrated logging
 */

import { Page, TestInfo } from '@playwright/test';
import { playwrightLogger } from './playwrightLogger';

export class TestHelpers {
  constructor(private page: Page, private testInfo: TestInfo) {}

  /**
   * Navigate to a page with logging
   */
  async navigateTo(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    await playwrightLogger.testStep(`Navigating to ${url}`, this.testInfo, { url });
    
    try {
      await this.page.goto(url, options);
      await playwrightLogger.pageAction(`Successfully navigated to ${url}`, this.page, { url });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { url });
      throw error;
    }
  }

  /**
   * Click an element with logging
   */
  async click(selector: string, options?: { timeout?: number }) {
    await playwrightLogger.testStep(`Clicking element: ${selector}`, this.testInfo, { selector });
    
    try {
      await this.page.click(selector, options);
      await playwrightLogger.pageAction(`Successfully clicked: ${selector}`, this.page, { selector });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { selector });
      throw error;
    }
  }

  /**
   * Fill a form field with logging
   */
  async fill(selector: string, value: string) {
    await playwrightLogger.testStep(`Filling field: ${selector}`, this.testInfo, { selector, valueLength: value.length });
    
    try {
      await this.page.fill(selector, value);
      await playwrightLogger.pageAction(`Successfully filled: ${selector}`, this.page, { selector });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { selector });
      throw error;
    }
  }

  /**
   * Wait for an element with logging
   */
  async waitForElement(selector: string, options?: { timeout?: number }) {
    await playwrightLogger.testStep(`Waiting for element: ${selector}`, this.testInfo, { selector });
    
    try {
      await this.page.waitForSelector(selector, options);
      await playwrightLogger.pageAction(`Element appeared: ${selector}`, this.page, { selector });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { selector });
      throw error;
    }
  }

  /**
   * Assert element exists with logging
   */
  async assertElementExists(selector: string) {
    await playwrightLogger.testStep(`Asserting element exists: ${selector}`, this.testInfo, { selector });
    
    try {
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      await playwrightLogger.pageAction(`Element exists: ${selector}`, this.page, { selector });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { selector });
      throw error;
    }
  }

  /**
   * Take a screenshot with logging
   */
  async takeScreenshot(name: string) {
    await playwrightLogger.testStep(`Taking screenshot: ${name}`, this.testInfo, { screenshotName: name });
    
    try {
      await this.page.screenshot({ path: `test-results/${name}.png` });
      await playwrightLogger.pageAction(`Screenshot taken: ${name}`, this.page, { screenshotName: name });
    } catch (error) {
      await playwrightLogger.testError(error as Error, this.testInfo, { screenshotName: name });
      throw error;
    }
  }

  /**
   * Setup console message logging
   */
  async setupConsoleLogging() {
    this.page.on('console', async (message) => {
      await playwrightLogger.consoleMessage(message, {
        testFile: this.testInfo.file,
        testTitle: this.testInfo.title,
      });
    });

    this.page.on('request', async (request) => {
      await playwrightLogger.networkRequest(request, {
        testFile: this.testInfo.file,
        testTitle: this.testInfo.title,
      });
    });
  }
}

/**
 * Create test helpers for a test
 */
export function createTestHelpers(page: Page, testInfo: TestInfo): TestHelpers {
  return new TestHelpers(page, testInfo);
}
