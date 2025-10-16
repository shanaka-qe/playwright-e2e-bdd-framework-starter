import { Page, expect } from '@playwright/test';

/**
 * Test Helpers for QA Knowledge Base E2E Tests
 * Smoke-level helpers - no DB operations or model changes
 */

export const DEFAULT_CONFIG = {
  baseURL: '/',
  timeout: 30000,
  retries: 0
};

/**
 * Navigation Helpers
 */
export class NavigationHelpers {
  /**
   * Navigate to a specific tab in the application
   */
  static async navigateToTab(page: Page, tabName: string): Promise<void> {
    // Use a more specific selector to target only the navigation button in the sidebar
    await page.click(`nav button:has-text("${tabName}")`);
    await expect(page.locator(`nav button:has-text("${tabName}")`)).toHaveClass(/bg-blue-600/);
  }

  /**
   * Navigate to the home page
   */
  static async goToHome(page: Page): Promise<void> {
    await page.goto(DEFAULT_CONFIG.baseURL);
    await expect(page.locator('text=Application')).toBeVisible();
  }

  /**
   * Navigate through all tabs to verify they work
   */
  static async navigateThroughAllTabs(page: Page): Promise<void> {
    const tabs = [
      'Overview',
      'Document Hub',
      'Test Features Generator',
      'Settings'
    ];

    for (const tab of tabs) {
      await this.navigateToTab(page, tab);
      await page.waitForTimeout(100);
    }
  }
}

/**
 * Document Hub Helpers
 */
export class DocumentHelpers {
  /**
   * Navigate to document hub
   */
  static async navigateToDocuments(page: Page): Promise<void> {
    await NavigationHelpers.navigateToTab(page, 'Document Hub');
    // Wait for the upload tabs section to be visible instead of a specific button
    await expect(page.locator('h2:has-text("Upload & Manage Documents")')).toBeVisible();
  }

  /**
   * Check if document upload interface is available
   */
  static async checkUploadInterface(page: Page): Promise<boolean> {
    const fileInput = page.locator('input[type="file"]');
    // Check for tab buttons that contain upload-related text
    const uploadTabs = page.locator('button[class*="border-b-2"]:has-text("Upload")');
    return await fileInput.count() > 0 || await uploadTabs.count() > 0;
  }

  /**
   * Check if document list is available
   */
  static async checkDocumentList(page: Page): Promise<boolean> {
    const documentList = page.locator('text=Document List, text=Documents');
    return await documentList.count() > 0;
  }
}

/**
 * Feature Generator Helpers
 */
export class FeatureGeneratorHelpers {
  /**
   * Navigate to feature generator
   */
  static async navigateToFeatureGenerator(page: Page): Promise<void> {
    await NavigationHelpers.navigateToTab(page, 'Test Features Generator');
    // Wait for the main heading or a unique element on the feature generator page
    await expect(page.locator('h2:has-text("Feature Generator")').first()).toBeVisible();
  }

  /**
   * Check if chat interface is available
   */
  static async checkChatInterface(page: Page): Promise<boolean> {
    const chatElements = page.locator('text=Chat, text=Message, text=Send');
    return await chatElements.count() > 0;
  }

  /**
   * Check if live preview is available
   */
  static async checkLivePreview(page: Page): Promise<boolean> {
    const previewElements = page.locator('text=Live Preview, text=Preview, text=Gherkin');
    return await previewElements.count() > 0;
  }

  /**
   * Check if feature management is available
   */
  static async checkFeatureManagement(page: Page): Promise<boolean> {
    const featureElements = page.locator('text=Feature Files, text=Saved Features');
    return await featureElements.count() > 0;
  }
}

/**
 * Settings Helpers
 */
export class SettingsHelpers {
  /**
   * Navigate to settings
   */
  static async navigateToSettings(page: Page): Promise<void> {
    await NavigationHelpers.navigateToTab(page, 'Settings');
    await expect(page.locator('button:has-text("AI Model Configuration")')).toBeVisible();
  }

  /**
   * Check if model configuration is available
   */
  static async checkModelConfiguration(page: Page): Promise<boolean> {
    const modelElements = page.locator('text=Model, text=Configuration, text=Settings');
    return await modelElements.count() > 0;
  }
}

/**
 * API Helpers
 */
export class APIHelpers {
  /**
   * Check if API endpoint is accessible
   */
  static async checkAPIEndpoint(page: Page, endpoint: string): Promise<boolean> {
    try {
      const response = await page.request.get(`${DEFAULT_CONFIG.baseURL}${endpoint}`);
      return response.status() < 500; // Not a server error
    } catch {
      return false;
    }
  }

  /**
   * Get API response data
   */
  static async getAPIResponse(page: Page, endpoint: string): Promise<any> {
    const response = await page.request.get(`${DEFAULT_CONFIG.baseURL}${endpoint}`);
    return await response.json();
  }
}

/**
 * UI State Helpers
 */
export class UIStateHelpers {
  /**
   * Wait for page to be ready
   */
  static async waitForPageReady(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Additional wait for any animations
  }

  /**
   * Check if element is visible and stable
   */
  static async isElementStable(page: Page, selector: string): Promise<boolean> {
    try {
      const element = page.locator(selector);
      await expect(element).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if page has proper layout
   */
  static async checkPageLayout(page: Page): Promise<boolean> {
    // Check for basic layout elements
    const hasSidebar = await this.isElementStable(page, 'nav');
    const hasMainContent = await this.isElementStable(page, 'main');
    const hasHeader = await this.isElementStable(page, 'header');
    
    return hasSidebar && hasMainContent && hasHeader;
  }
}

/**
 * Performance Helpers
 */
export class PerformanceHelpers {
  /**
   * Measure page load time
   */
  static async measurePageLoadTime(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  /**
   * Check if page loads within acceptable time
   */
  static async isPageLoadAcceptable(page: Page, url: string, maxTime: number = 5000): Promise<boolean> {
    const loadTime = await this.measurePageLoadTime(page, url);
    return loadTime < maxTime;
  }
}

/**
 * Error Handling Helpers
 */
export class ErrorHandlingHelpers {
  /**
   * Check if error message is displayed
   */
  static async hasErrorMessage(page: Page): Promise<boolean> {
    const errorElements = page.locator('.text-red-600, .text-red-500, .bg-red-50');
    const errorTextElements = page.locator('text=Error, text=Failed');
    return await errorElements.count() > 0 || await errorTextElements.count() > 0;
  }

  /**
   * Check if page handles errors gracefully
   */
  static async handlesErrorsGracefully(page: Page): Promise<boolean> {
    // Check that page doesn't crash on errors
    await expect(page.locator('body')).toBeVisible();
    return true;
  }
}

/**
 * Responsive Design Helpers
 */
export class ResponsiveHelpers {
  /**
   * Test responsive design on different viewports
   */
  static async testResponsiveDesign(page: Page): Promise<boolean> {
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(100);
    }

    return true;
  }
}

/**
 * Common Test Utilities
 */
export class TestUtils {
  /**
   * Generate test data for smoke tests
   */
  static generateTestData(): any {
    return {
      documents: [
        {
          id: 'test-1',
          title: 'Test Document',
          content: 'Feature: Test\nScenario: Test\nGiven I am on the page',
          type: 'feature',
          uploadedAt: new Date(),
          size: 100
        }
      ],
      features: [
        {
          id: 'feature-1',
          title: 'Test Feature',
          content: 'Feature: Test\nScenario: Test\nGiven I am on the page',
          source: 'generated',
          createdAt: new Date()
        }
      ]
    };
  }

  /**
   * Wait for a condition to be true
   */
  static async waitForCondition(
    page: Page, 
    condition: () => Promise<boolean>, 
    timeout: number = 5000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await page.waitForTimeout(100);
    }
    
    return false;
  }
} 