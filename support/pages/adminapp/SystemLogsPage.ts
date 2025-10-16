/**
 * System Logs Page Object
 * 
 * Handles all interactions with the admin app system logs page
 * Implements filtering, searching, and log analysis functionality
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { UIPatternLocators } from '../../helpers/UIPatternLocators';
import { AdminBasePage } from './AdminBasePage';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'CRITICAL';
  source: string;
  message: string;
  details?: string;
}

export class SystemLogsPage extends AdminBasePage {
  // Page sections
  public filters: {
    levelDropdown: Locator;
    sourceDropdown: Locator;
    timeRangeSelector: Locator;
    searchInput: Locator;
    applyButton: Locator;
    clearButton: Locator;
  };

  public logTable: {
    container: Locator;
    headers: Locator;
    rows: Locator;
    emptyState: Locator;
  };

  public actions: {
    refreshButton: Locator;
    exportButton: Locator;
    realTimeToggle: Locator;
    settingsButton: Locator;
  };

  public pagination: {
    container: Locator;
    previous: Locator;
    next: Locator;
    pageInfo: Locator;
  };

  private loadingIndicator: Locator;
  private errorAlert: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    // Filter controls
    this.filters = {
      levelDropdown: this.roleBasedLocators.combobox('Log Level'),
      sourceDropdown: this.roleBasedLocators.combobox('Source'),
      timeRangeSelector: this.roleBasedLocators.combobox('Time Range'),
      searchInput: this.roleBasedLocators.searchbox('Search logs'),
      applyButton: this.roleBasedLocators.button('Apply Filters'),
      clearButton: this.roleBasedLocators.button('Clear Filters')
    };

    // Log table
    this.logTable = {
      container: this.roleBasedLocators.table('System Logs'),
      headers: this.roleBasedLocators.columnheader(''),
      rows: this.roleBasedLocators.row(),
      emptyState: this.roleBasedLocators.status('No logs found')
    };

    // Action buttons
    this.actions = {
      refreshButton: this.roleBasedLocators.button('Refresh'),
      exportButton: this.roleBasedLocators.button('Export'),
      realTimeToggle: this.roleBasedLocators.switch('Real-time updates'),
      settingsButton: this.roleBasedLocators.button('Log Settings')
    };

    // Pagination
    const paginationPattern = this.uiPatterns.pagination();
    this.pagination = {
      container: paginationPattern.container,
      previous: paginationPattern.previous,
      next: paginationPattern.next,
      pageInfo: this.roleBasedLocators.status('Page')
    };

    // Other elements
    this.loadingIndicator = this.roleBasedLocators.progressbar('Loading logs');
    this.errorAlert = this.roleBasedLocators.alert();
  }

  async navigate(): Promise<void> {
    await this.navigateToAdmin('/admin/logs');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await super.waitForAdminReady();
    await expect(this.logTable.container).toBeVisible();
    await expect(this.filters.levelDropdown).toBeVisible();
    await this.waitForLogsToLoad();
  }

  // ============= Filtering Methods =============

  async filterByLevel(level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'CRITICAL'): Promise<void> {
    await this.filters.levelDropdown.selectOption(level);
    await this.applyFilters();
  }

  async filterBySource(source: string): Promise<void> {
    await this.filters.sourceDropdown.selectOption(source);
    await this.applyFilters();
  }

  async setTimeRange(range: 'Last 15 minutes' | 'Last hour' | 'Last 24 hours' | 'Last 7 days' | 'Custom'): Promise<void> {
    await this.filters.timeRangeSelector.selectOption(range);
    
    if (range === 'Custom') {
      await this.setCustomTimeRange();
    } else {
      await this.applyFilters();
    }
  }

  async searchLogs(query: string): Promise<void> {
    await this.filters.searchInput.fill(query);
    await this.filters.searchInput.press('Enter');
    await this.waitForLogsToLoad();
  }

  async applyFilters(): Promise<void> {
    await this.filters.applyButton.click();
    await this.waitForLogsToLoad();
  }

  async clearFilters(): Promise<void> {
    await this.filters.clearButton.click();
    await this.waitForLogsToLoad();
  }

  private async setCustomTimeRange(): Promise<void> {
    const modal = this.roleBasedLocators.dialog('Custom Time Range');
    await expect(modal).toBeVisible();
    
    // Set start and end dates (simplified)
    const startDate = modal.locator(this.roleBasedLocators.textboxByLabel('Start Date'));
    const endDate = modal.locator(this.roleBasedLocators.textboxByLabel('End Date'));
    
    await startDate.fill(new Date(Date.now() - 86400000).toISOString().split('T')[0]); // Yesterday
    await endDate.fill(new Date().toISOString().split('T')[0]); // Today
    
    const applyButton = modal.locator(this.roleBasedLocators.button('Apply'));
    await applyButton.click();
    
    await this.waitForLogsToLoad();
  }

  // ============= Log Table Methods =============

  async getLogEntries(limit?: number): Promise<LogEntry[]> {
    await this.waitForLogsToLoad();
    
    const rows = await this.logTable.rows.all();
    const entries: LogEntry[] = [];
    
    const maxRows = limit ? Math.min(limit, rows.length) : rows.length;
    
    for (let i = 0; i < maxRows; i++) {
      const row = rows[i];
      const cells = await row.locator(this.roleBasedLocators.cell('')).all();
      
      if (cells.length >= 4) {
        entries.push({
          timestamp: await cells[0].textContent() || '',
          level: (await cells[1].textContent() || 'INFO') as LogEntry['level'],
          source: await cells[2].textContent() || '',
          message: await cells[3].textContent() || '',
          details: cells[4] ? await cells[4].textContent() || undefined : undefined
        });
      }
    }
    
    return entries;
  }

  async getLogCount(): Promise<number> {
    const rows = await this.logTable.rows.all();
    return rows.length;
  }

  async hasLogs(): Promise<boolean> {
    return (await this.getLogCount()) > 0;
  }

  async viewLogDetails(rowIndex: number): Promise<void> {
    const rows = await this.logTable.rows.all();
    if (rowIndex < rows.length) {
      await rows[rowIndex].click();
      
      // Wait for details modal
      const detailsModal = this.roleBasedLocators.dialog('Log Details');
      await expect(detailsModal).toBeVisible();
    }
  }

  async getLogDetails(): Promise<{
    fullMessage: string;
    stackTrace?: string;
    context?: Record<string, any>;
  }> {
    const modal = this.roleBasedLocators.dialog('Log Details');
    
    const fullMessage = await modal.locator(this.roleBasedLocators.text('Full Message')).textContent() || '';
    const stackTrace = await modal.locator(this.roleBasedLocators.text('Stack Trace')).textContent();
    
    // Parse context if available
    const contextElement = modal.locator(this.roleBasedLocators.text('Context'));
    let context: Record<string, any> | undefined;
    
    if (await contextElement.isVisible()) {
      const contextText = await contextElement.textContent() || '{}';
      try {
        context = JSON.parse(contextText);
      } catch {
        context = { raw: contextText };
      }
    }
    
    return {
      fullMessage,
      stackTrace: stackTrace || undefined,
      context
    };
  }

  async closeLogDetails(): Promise<void> {
    const modal = this.roleBasedLocators.dialog('Log Details');
    const closeButton = modal.locator(this.roleBasedLocators.button('Close'));
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  }

  // ============= Real-time Updates =============

  async enableRealTimeUpdates(): Promise<void> {
    const isOn = await this.actions.realTimeToggle.getAttribute('aria-checked') === 'true';
    if (!isOn) {
      await this.actions.realTimeToggle.click();
    }
  }

  async disableRealTimeUpdates(): Promise<void> {
    const isOn = await this.actions.realTimeToggle.getAttribute('aria-checked') === 'true';
    if (isOn) {
      await this.actions.realTimeToggle.click();
    }
  }

  async isRealTimeEnabled(): Promise<boolean> {
    return await this.actions.realTimeToggle.getAttribute('aria-checked') === 'true';
  }

  async waitForNewLogs(timeout: number = 10000): Promise<boolean> {
    const initialCount = await this.getLogCount();
    
    try {
      await this.page.waitForFunction(
        async (startCount) => {
          const currentCount = await this.getLogCount();
          return currentCount > startCount;
        },
        initialCount,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  // ============= Export Methods =============

  async exportLogs(format: 'CSV' | 'JSON' | 'TXT'): Promise<string> {
    await this.actions.exportButton.click();
    
    // Select format from dropdown
    const formatMenu = this.roleBasedLocators.menu('Export Format');
    await expect(formatMenu).toBeVisible();
    
    const formatOption = formatMenu.locator(this.roleBasedLocators.menuitem(format));
    
    const downloadPromise = this.page.waitForEvent('download');
    await formatOption.click();
    
    const download = await downloadPromise;
    const path = await download.path();
    return path || '';
  }

  // ============= Refresh and Loading =============

  async refreshLogs(): Promise<void> {
    await this.actions.refreshButton.click();
    await this.waitForLogsToLoad();
  }

  async waitForLogsToLoad(): Promise<void> {
    // Wait for loading indicator to appear and disappear
    if (await this.loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(this.loadingIndicator).not.toBeVisible({ timeout: 30000 });
    }
    
    // Ensure either logs or empty state is visible
    const hasLogs = await this.logTable.rows.count() > 0;
    if (!hasLogs) {
      await expect(this.logTable.emptyState).toBeVisible();
    }
  }

  // ============= Pagination Methods =============

  async goToNextPage(): Promise<void> {
    if (await this.pagination.next.isEnabled()) {
      await this.pagination.next.click();
      await this.waitForLogsToLoad();
    }
  }

  async goToPreviousPage(): Promise<void> {
    if (await this.pagination.previous.isEnabled()) {
      await this.pagination.previous.click();
      await this.waitForLogsToLoad();
    }
  }

  async getCurrentPageInfo(): Promise<{
    currentPage: number;
    totalPages: number;
    totalEntries: number;
  }> {
    const pageText = await this.pagination.pageInfo.textContent() || '';
    
    // Parse "Page 1 of 10 (250 entries)"
    const pageMatch = pageText.match(/Page (\d+) of (\d+)/);
    const entriesMatch = pageText.match(/(\d+) entries/);
    
    return {
      currentPage: pageMatch ? parseInt(pageMatch[1]) : 1,
      totalPages: pageMatch ? parseInt(pageMatch[2]) : 1,
      totalEntries: entriesMatch ? parseInt(entriesMatch[1]) : 0
    };
  }

  // ============= Settings Methods =============

  async openLogSettings(): Promise<void> {
    await this.actions.settingsButton.click();
    const settingsModal = this.roleBasedLocators.dialog('Log Settings');
    await expect(settingsModal).toBeVisible();
  }

  async setLogRetentionDays(days: number): Promise<void> {
    await this.openLogSettings();
    
    const modal = this.roleBasedLocators.dialog('Log Settings');
    const retentionInput = modal.locator(this.roleBasedLocators.spinbutton('Retention Days'));
    
    await retentionInput.fill(days.toString());
    
    const saveButton = modal.locator(this.roleBasedLocators.button('Save Settings'));
    await saveButton.click();
    
    await expect(modal).not.toBeVisible();
  }

  // ============= Analysis Methods =============

  async getLogLevelDistribution(): Promise<Record<string, number>> {
    const entries = await this.getLogEntries();
    const distribution: Record<string, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      DEBUG: 0,
      CRITICAL: 0
    };
    
    for (const entry of entries) {
      distribution[entry.level]++;
    }
    
    return distribution;
  }

  async getErrorLogs(): Promise<LogEntry[]> {
    await this.filterByLevel('ERROR');
    return await this.getLogEntries();
  }

  async getCriticalLogs(): Promise<LogEntry[]> {
    await this.filterByLevel('CRITICAL');
    return await this.getLogEntries();
  }

  async getMostFrequentSources(limit: number = 5): Promise<Array<{ source: string; count: number }>> {
    const entries = await this.getLogEntries();
    const sourceCounts: Record<string, number> = {};
    
    for (const entry of entries) {
      sourceCounts[entry.source] = (sourceCounts[entry.source] || 0) + 1;
    }
    
    return Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ============= Validation Methods =============

  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.logTable.container).toBeVisible();
      await expect(this.filters.levelDropdown).toBeVisible();
      await expect(this.actions.refreshButton).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async hasRequiredElements(): Promise<boolean> {
    const elements = [
      this.logTable.container,
      this.filters.levelDropdown,
      this.filters.searchInput,
      this.actions.refreshButton,
      this.actions.exportButton
    ];
    
    for (const element of elements) {
      if (!await element.isVisible()) {
        return false;
      }
    }
    
    return true;
  }
}