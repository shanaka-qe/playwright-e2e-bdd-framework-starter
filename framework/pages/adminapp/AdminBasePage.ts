/**
 * Admin Base Page Object Model
 * 
 * Base page for all adminapp pages with common adminapp functionality
 */

import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export abstract class AdminBasePage extends BasePage {
  protected adminBaseUrl: string;

  constructor(page: Page) {
    super(page);
    // Override base URL for adminapp (port 3021)
    this.adminBaseUrl = process.env.ADMIN_BASE_URL || 'http://localhost:3021';
  }

  /**
   * Wait for adminapp page to be ready
   */
  async waitForAdminPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Wait for any loading indicators to disappear
    if (await this.isElementVisible('[data-testid="loading-indicator"]', 2000)) {
      await this.waitForElementHidden('[data-testid="loading-indicator"]', 10000);
    }
  }

  /**
   * Check if adminapp is accessible
   */
  async isAdminAppAccessible(): Promise<boolean> {
    try {
      const response = await this.page.goto(`${this.adminBaseUrl}/api/health`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      return response?.ok() || false;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to adminapp health check
   */
  async navigateToHealthCheck(): Promise<void> {
    await this.page.goto(`${this.adminBaseUrl}/api/health`);
  }

  /**
   * Get adminapp version from health endpoint
   */
  async getAdminAppVersion(): Promise<string | null> {
    try {
      const response = await this.page.goto(`${this.adminBaseUrl}/api/health`);
      if (response?.ok()) {
        const healthData = await response.json();
        return healthData.version || null;
      }
    } catch (error) {
      console.log('Failed to get adminapp version:', error);
    }
    return null;
  }

  /**
   * Check if API key authentication is working
   */
  async testApiAuthentication(apiKey: string = 'default-api-key'): Promise<boolean> {
    try {
      const response = await this.page.request.get(`${this.adminBaseUrl}/api/logs`, {
        headers: {
          'X-API-Key': apiKey
        }
      });
      return response.ok();
    } catch {
      return false;
    }
  }

  /**
   * Wait for real-time updates (SSE connections)
   */
  async waitForRealtimeConnection(): Promise<void> {
    // Wait for EventSource connection to be established
    await this.page.waitForFunction(() => {
      return window.performance.getEntriesByType('resource')
        .some((entry: any) => entry.name.includes('/stream'));
    }, { timeout: 10000 });
  }

  /**
   * Handle navigation to different adminapp sections
   */
  async navigateToSection(section: 'dashboard' | 'logs' | 'users' | 'config' | 'health'): Promise<void> {
    const sectionMap = {
      dashboard: '/admin-dashboard.html',
      logs: '/admin-dashboard.html#logs',
      users: '/admin-dashboard.html#users', 
      config: '/admin-dashboard.html#config',
      health: '/api/health'
    };

    const path = sectionMap[section];
    await this.page.goto(`${this.adminBaseUrl}${path}`);
    await this.waitForAdminPageReady();
  }

  /**
   * Check for common error states
   */
  async checkForErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Check for JavaScript errors in console
    this.page.on('pageerror', (error) => {
      errors.push(`JavaScript Error: ${error.message}`);
    });

    // Check for failed network requests
    this.page.on('response', (response) => {
      if (!response.ok() && response.url().includes(this.adminBaseUrl)) {
        errors.push(`Network Error: ${response.status()} ${response.statusText()} - ${response.url()}`);
      }
    });

    // Check for visible error messages
    if (await this.isElementVisible('[data-testid="error-message"]', 2000)) {
      const errorText = await this.getElementText('[data-testid="error-message"]');
      errors.push(`UI Error: ${errorText}`);
    }

    return errors;
  }

  /**
   * Clear any cached data or localStorage
   */
  async clearAdminAppData(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

export default AdminBasePage;