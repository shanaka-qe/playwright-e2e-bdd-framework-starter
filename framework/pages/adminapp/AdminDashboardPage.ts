/**
 * Admin Dashboard Page Object Model
 * 
 * Page object for the main adminapp dashboard interface
 */

import { Page, Locator } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export class AdminDashboardPage extends AdminBasePage {
  // Page elements
  private readonly dashboardContainer: Locator;
  private readonly navigationTabs: Locator;
  private readonly logsSection: Locator;
  private readonly logTable: Locator;
  private readonly logFilters: Locator;
  private readonly searchInput: Locator;
  private readonly levelFilter: Locator;
  private readonly sourceFilter: Locator;
  private readonly statsSection: Locator;
  private readonly exportButton: Locator;
  private readonly realtimeToggle: Locator;

  constructor(page: Page) {
    super(page);
    // Updated selectors to match actual adminapp HTML structure
    this.dashboardContainer = page.locator('.container');
    this.navigationTabs = page.locator('.tab-buttons');
    this.logsSection = page.locator('.logs-container');
    this.logTable = page.locator('#logsTable, .logs-container table');
    this.logFilters = page.locator('.filters');
    this.searchInput = page.locator('#searchInput, input[placeholder*="search"]');
    this.levelFilter = page.locator('#levelFilter');
    this.sourceFilter = page.locator('#sourceFilter');
    this.statsSection = page.locator('.stats');
    this.exportButton = page.locator('#exportLogs, button[data-action="exportLogs"]');
    this.realtimeToggle = page.locator('#realtimeToggle, input[type="checkbox"]');
  }

  /**
   * Navigate to admin dashboard
   */
  async navigate(): Promise<void> {
    await this.page.goto(`${this.adminBaseUrl}/admin-dashboard.html`);
    await this.waitForAdminPageReady();
  }

  /**
   * Wait for dashboard to be fully loaded
   */
  async waitForDashboardReady(): Promise<void> {
    await this.waitForAdminPageReady();
    await this.waitForElement('.container', 10000);
    
    // Wait for initial data to load
    if (await this.isElementVisible('.loading', 2000)) {
      await this.waitForElementHidden('.loading', 15000);
    }
  }

  /**
   * Check if dashboard is displayed
   */
  async isDashboardDisplayed(): Promise<boolean> {
    return await this.isElementVisible('.container', 5000);
  }

  /**
   * Get navigation tabs
   */
  async getNavigationTabs(): Promise<string[]> {
    if (await this.navigationTabs.isVisible()) {
      const tabs = await this.navigationTabs.locator('button, a').allTextContents();
      return tabs.filter(tab => tab.trim().length > 0);
    }
    return [];
  }

  /**
   * Click navigation tab
   */
  async clickNavigationTab(tabName: string): Promise<void> {
    const tab = this.navigationTabs.locator(`text="${tabName}"`).first();
    await tab.click();
    await this.waitForAdminPageReady();
  }

  /**
   * Search logs
   */
  async searchLogs(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLogTableUpdate();
  }

  /**
   * Filter logs by level
   */
  async filterLogsByLevel(level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE'): Promise<void> {
    if (await this.levelFilter.isVisible()) {
      await this.levelFilter.selectOption(level);
      await this.waitForLogTableUpdate();
    }
  }

  /**
   * Filter logs by source
   */
  async filterLogsBySource(source: 'webapp' | 'mcp' | 'docker' | 'tests' | 'system'): Promise<void> {
    if (await this.sourceFilter.isVisible()) {
      await this.sourceFilter.selectOption(source);
      await this.waitForLogTableUpdate();
    }
  }

  /**
   * Clear all filters
   */
  async clearAllFilters(): Promise<void> {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.clear();
    }
    
    if (await this.levelFilter.isVisible()) {
      await this.levelFilter.selectOption('');
    }
    
    if (await this.sourceFilter.isVisible()) {
      await this.sourceFilter.selectOption('');
    }
    
    await this.waitForLogTableUpdate();
  }

  /**
   * Get log entries from table
   */
  async getLogEntries(): Promise<Array<{
    timestamp: string;
    level: string;
    source: string;
    component: string;
    message: string;
  }>> {
    await this.waitForElement('#logsTable, .logs-container table');
    
    const rows = await this.logTable.locator('tbody tr').all();
    const logs = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length >= 5) {
        logs.push({
          timestamp: cells[0],
          level: cells[1],
          source: cells[2],
          component: cells[3],
          message: cells[4]
        });
      }
    }

    return logs;
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(): Promise<{
    total: number;
    errors: number;
    warnings: number;
    info: number;
  } | null> {
    if (await this.statsSection.isVisible()) {
      const statsText = await this.statsSection.textContent();
      if (statsText) {
        // Parse statistics from the stats section
        const totalMatch = statsText.match(/Total:\s*(\d+)/);
        const errorsMatch = statsText.match(/Errors:\s*(\d+)/);
        const warningsMatch = statsText.match(/Warnings:\s*(\d+)/);
        const infoMatch = statsText.match(/Info:\s*(\d+)/);

        return {
          total: totalMatch ? parseInt(totalMatch[1]) : 0,
          errors: errorsMatch ? parseInt(errorsMatch[1]) : 0,
          warnings: warningsMatch ? parseInt(warningsMatch[1]) : 0,
          info: infoMatch ? parseInt(infoMatch[1]) : 0
        };
      }
    }
    return null;
  }

  /**
   * Export logs
   */
  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (await this.exportButton.isVisible()) {
      // Set up download handler
      const downloadPromise = this.page.waitForEvent('download');
      
      // Click export button and select format if there's a dropdown
      await this.exportButton.click();
      
      // If there's a format selector, use it
      const formatSelector = this.page.locator(`[data-testid="export-format-${format}"]`);
      if (await formatSelector.isVisible({ timeout: 2000 })) {
        await formatSelector.click();
      }
      
      const download = await downloadPromise;
      const path = `test-results/downloads/${download.suggestedFilename()}`;
      await download.saveAs(path);
      return path;
    }
    throw new Error('Export button not found');
  }

  /**
   * Toggle real-time log streaming
   */
  async toggleRealtimeLogging(enable: boolean): Promise<void> {
    if (await this.realtimeToggle.isVisible()) {
      const isCurrentlyEnabled = await this.realtimeToggle.isChecked();
      if (isCurrentlyEnabled !== enable) {
        await this.realtimeToggle.click();
        
        if (enable) {
          await this.waitForRealtimeConnection();
        }
      }
    }
  }

  /**
   * Wait for log table to update after filters
   */
  private async waitForLogTableUpdate(): Promise<void> {
    // Wait for any loading indicators
    if (await this.isElementVisible('.loading', 1000)) {
      await this.waitForElementHidden('.loading', 10000);
    }
    
    // Small delay to ensure data is updated
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if logs are being updated in real-time
   */
  async isRealtimeActive(): Promise<boolean> {
    // Check if realtime toggle is enabled
    if (await this.realtimeToggle.isVisible()) {
      return await this.realtimeToggle.isChecked();
    }
    return false;
  }

  /**
   * Get latest log entry
   */
  async getLatestLogEntry(): Promise<{
    timestamp: string;
    level: string;
    source: string;
    component: string;
    message: string;
  } | null> {
    const logs = await this.getLogEntries();
    return logs.length > 0 ? logs[0] : null;
  }

  /**
   * Wait for new log entries to appear
   */
  async waitForNewLogEntries(timeout: number = 10000): Promise<boolean> {
    const initialCount = (await this.getLogEntries()).length;
    
    try {
      await this.page.waitForFunction(
        (count) => {
          const table = document.querySelector('#logsTable tbody, .logs-container table tbody');
          return table && table.children.length > count;
        },
        initialCount,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for error states in the dashboard
   */
  async hasErrors(): Promise<boolean> {
    // Check for error indicators
    const errorElements = [
      '.connection-error',
      '.api-error', 
      '.load-error',
      '.error-message',
      '.alert-error'
    ];

    for (const selector of errorElements) {
      if (await this.isElementVisible(selector, 1000)) {
        return true;
      }
    }

    return false;
  }
}

export default AdminDashboardPage;