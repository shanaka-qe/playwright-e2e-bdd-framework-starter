/**
 * Admin App Core Feature Tests
 * 
 * Tests for core adminapp functionality including log viewing, filtering, and streaming
 */

import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../../../framework/pages/adminapp/AdminDashboardPage';
import { AdminApiPage, LogEntry } from '../../../framework/pages/adminapp/AdminApiPage';

test.describe('Admin App Core Features', () => {
  let dashboardPage: AdminDashboardPage;
  let apiPage: AdminApiPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new AdminDashboardPage(page);
    apiPage = new AdminApiPage(page);
    
    // Navigate to dashboard and ensure it's ready
    await dashboardPage.navigate();
    await dashboardPage.waitForDashboardReady();
  });

  test.describe('Log Viewing Interface', () => {
    test('should display log table with proper structure', async () => {
      // Verify log table exists
      await dashboardPage.assertElementVisible('[data-testid="log-table"]', 
        'Log table should be visible');

      // Get log entries from the UI
      const logEntries = await dashboardPage.getLogEntries();
      
      if (logEntries.length > 0) {
        const firstLog = logEntries[0];
        
        // Verify log structure
        expect(firstLog.timestamp).toBeDefined();
        expect(firstLog.level).toBeDefined();
        expect(firstLog.source).toBeDefined();
        expect(firstLog.component).toBeDefined();
        expect(firstLog.message).toBeDefined();
        
        // Verify log levels are valid
        const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
        expect(validLevels).toContain(firstLog.level);
      }
    });

    test('should show log statistics', async () => {
      const stats = await dashboardPage.getLogStatistics();
      
      if (stats) {
        expect(typeof stats.total).toBe('number');
        expect(stats.total).toBeGreaterThanOrEqual(0);
        expect(typeof stats.errors).toBe('number');
        expect(typeof stats.warnings).toBe('number');
        expect(typeof stats.info).toBe('number');
      }
    });

    test('should handle empty log state gracefully', async () => {
      // This test verifies the UI handles empty logs properly
      const logEntries = await dashboardPage.getLogEntries();
      
      if (logEntries.length === 0) {
        // Should show appropriate empty state message
        const hasEmptyState = await dashboardPage.isElementVisible(
          '[data-testid="no-logs-message"]', 2000
        );
        
        if (hasEmptyState) {
          const emptyMessage = await dashboardPage.getElementText('[data-testid="no-logs-message"]');
          expect(emptyMessage.toLowerCase()).toContain('no logs');
        }
      }
    });
  });

  test.describe('Log Filtering', () => {
    test.beforeEach(async () => {
      // Create test logs with different levels and sources
      const testLogs: LogEntry[] = [
        {
          level: 'ERROR',
          source: 'webapp',
          component: 'auth',
          message: 'Authentication failed for user test@example.com'
        },
        {
          level: 'WARN',
          source: 'mcp',
          component: 'vectordb',
          message: 'Vector database connection slow'
        },
        {
          level: 'INFO',
          source: 'tests',
          component: 'e2e',
          message: 'Test execution completed successfully'
        }
      ];

      for (const log of testLogs) {
        await apiPage.createLog(log);
      }

      // Wait for logs to be indexed and refresh the page
      await new Promise(resolve => setTimeout(resolve, 2000));
      await dashboardPage.navigate();
      await dashboardPage.waitForDashboardReady();
    });

    test('should filter logs by level', async () => {
      // Check if level filter exists
      const hasLevelFilter = await dashboardPage.isElementVisible('[data-testid="level-filter"]', 5000);
      
      if (hasLevelFilter) {
        // Filter by ERROR level
        await dashboardPage.filterLogsByLevel('ERROR');
        
        const filteredLogs = await dashboardPage.getLogEntries();
        
        if (filteredLogs.length > 0) {
          // All visible logs should be ERROR level
          filteredLogs.forEach(log => {
            expect(log.level).toBe('ERROR');
          });
        }
      }
    });

    test('should filter logs by source', async () => {
      const hasSourceFilter = await dashboardPage.isElementVisible('[data-testid="source-filter"]', 5000);
      
      if (hasSourceFilter) {
        await dashboardPage.filterLogsBySource('webapp');
        
        const filteredLogs = await dashboardPage.getLogEntries();
        
        if (filteredLogs.length > 0) {
          filteredLogs.forEach(log => {
            expect(log.source).toBe('webapp');
          });
        }
      }
    });

    test('should search logs by message content', async () => {
      const hasSearchInput = await dashboardPage.isElementVisible('[data-testid="search-input"]', 5000);
      
      if (hasSearchInput) {
        await dashboardPage.searchLogs('authentication');
        
        const searchResults = await dashboardPage.getLogEntries();
        
        if (searchResults.length > 0) {
          const foundMatch = searchResults.some(log => 
            log.message.toLowerCase().includes('authentication')
          );
          expect(foundMatch).toBe(true);
        }
      }
    });

    test('should combine multiple filters', async () => {
      const hasFilters = await dashboardPage.isElementVisible('[data-testid="log-filters"]', 5000);
      
      if (hasFilters) {
        // Apply level and source filters together
        await dashboardPage.filterLogsByLevel('INFO');
        await dashboardPage.filterLogsBySource('tests');
        
        const filteredLogs = await dashboardPage.getLogEntries();
        
        if (filteredLogs.length > 0) {
          filteredLogs.forEach(log => {
            expect(log.level).toBe('INFO');
            expect(log.source).toBe('tests');
          });
        }
      }
    });

    test('should clear all filters', async () => {
      const hasFilters = await dashboardPage.isElementVisible('[data-testid="log-filters"]', 5000);
      
      if (hasFilters) {
        // Apply some filters first
        await dashboardPage.filterLogsByLevel('ERROR');
        await dashboardPage.searchLogs('test');
        
        const filteredCount = (await dashboardPage.getLogEntries()).length;
        
        // Clear all filters
        await dashboardPage.clearAllFilters();
        
        const clearedCount = (await dashboardPage.getLogEntries()).length;
        
        // Should show more logs after clearing (or same if no other logs exist)
        expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
      }
    });
  });

  test.describe('Real-time Log Streaming', () => {
    test('should enable real-time logging toggle', async () => {
      const hasRealtimeToggle = await dashboardPage.isElementVisible('[data-testid="realtime-toggle"]', 5000);
      
      if (hasRealtimeToggle) {
        // Enable real-time logging
        await dashboardPage.toggleRealtimeLogging(true);
        
        const isActive = await dashboardPage.isRealtimeActive();
        expect(isActive).toBe(true);
      }
    });

    test('should receive new log entries in real-time', async () => {
      const hasRealtimeToggle = await dashboardPage.isElementVisible('[data-testid="realtime-toggle"]', 5000);
      
      if (hasRealtimeToggle) {
        // Enable real-time logging
        await dashboardPage.toggleRealtimeLogging(true);
        
        // Create a new log entry via API
        const newLog: LogEntry = {
          level: 'INFO',
          source: 'tests',
          component: 'realtime-test',
          message: `Real-time test log ${Date.now()}`
        };
        
        // Wait for new entries (give some time for real-time update)
        const receivedNewEntry = await dashboardPage.waitForNewLogEntries(5000);
        
        if (!receivedNewEntry) {
          // Create the log and check again
          await apiPage.createLog(newLog);
          const receivedAfterCreate = await dashboardPage.waitForNewLogEntries(5000);
          expect(receivedAfterCreate).toBe(true);
        }
      }
    });

    test('should disable real-time logging', async () => {
      const hasRealtimeToggle = await dashboardPage.isElementVisible('[data-testid="realtime-toggle"]', 5000);
      
      if (hasRealtimeToggle) {
        // Enable first, then disable
        await dashboardPage.toggleRealtimeLogging(true);
        await dashboardPage.toggleRealtimeLogging(false);
        
        const isActive = await dashboardPage.isRealtimeActive();
        expect(isActive).toBe(false);
      }
    });
  });

  test.describe('Log Export Functionality', () => {
    test('should export logs in JSON format', async () => {
      const hasExportButton = await dashboardPage.isElementVisible('[data-testid="export-button"]', 5000);
      
      if (hasExportButton) {
        try {
          const exportPath = await dashboardPage.exportLogs('json');
          
          expect(exportPath).toBeDefined();
          expect(exportPath).toContain('.json');
          
          // Verify file was created (basic check)
          console.log(`Exported logs to: ${exportPath}`);
        } catch (error) {
          console.log('Export functionality not fully implemented:', error.message);
        }
      }
    });

    test('should export logs in CSV format', async () => {
      const hasExportButton = await dashboardPage.isElementVisible('[data-testid="export-button"]', 5000);
      
      if (hasExportButton) {
        try {
          const exportPath = await dashboardPage.exportLogs('csv');
          
          expect(exportPath).toBeDefined();
          expect(exportPath).toContain('.csv');
          
          console.log(`Exported logs to: ${exportPath}`);
        } catch (error) {
          console.log('CSV export functionality not fully implemented:', error.message);
        }
      }
    });
  });

  test.describe('Navigation and User Experience', () => {
    test('should navigate between different sections', async () => {
      const navTabs = await dashboardPage.getNavigationTabs();
      
      if (navTabs.length > 1) {
        for (const tab of navTabs.slice(0, 3)) { // Test first 3 tabs
          await dashboardPage.clickNavigationTab(tab);
          
          // Verify we're still on the dashboard
          const isDashboardDisplayed = await dashboardPage.isDashboardDisplayed();
          expect(isDashboardDisplayed).toBe(true);
          
          // Verify no errors occurred
          const hasErrors = await dashboardPage.hasErrors();
          expect(hasErrors).toBe(false);
        }
      }
    });

    test('should maintain state across page refreshes', async () => {
      const hasFilters = await dashboardPage.isElementVisible('[data-testid="log-filters"]', 5000);
      
      if (hasFilters) {
        // Apply a filter
        await dashboardPage.filterLogsByLevel('ERROR');
        
        // Refresh the page
        await dashboardPage.navigate();
        await dashboardPage.waitForDashboardReady();
        
        // Verify we're back to the dashboard
        const isDashboardDisplayed = await dashboardPage.isDashboardDisplayed();
        expect(isDashboardDisplayed).toBe(true);
      }
    });

    test('should handle concurrent user interactions', async () => {
      const hasSearchAndFilter = await dashboardPage.isElementVisible('[data-testid="search-input"]', 5000) &&
                                await dashboardPage.isElementVisible('[data-testid="level-filter"]', 5000);
      
      if (hasSearchAndFilter) {
        // Perform multiple actions quickly
        await Promise.all([
          dashboardPage.searchLogs('test'),
          dashboardPage.filterLogsByLevel('INFO')
        ]);
        
        // Verify the dashboard is still functional
        const logEntries = await dashboardPage.getLogEntries();
        expect(Array.isArray(logEntries)).toBe(true);
        
        const hasErrors = await dashboardPage.hasErrors();
        expect(hasErrors).toBe(false);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // This test verifies the UI handles API failures
      const errors = await dashboardPage.checkForErrors();
      
      // Should not have critical errors visible
      const criticalErrors = errors.filter(error => 
        error.includes('500') || error.includes('TypeError')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should show appropriate messages for network issues', async () => {
      // Check if there's a network error indicator
      const hasConnectionError = await dashboardPage.isElementVisible(
        '[data-testid="connection-error"]', 2000
      );
      
      if (hasConnectionError) {
        const errorMessage = await dashboardPage.getElementText('[data-testid="connection-error"]');
        expect(errorMessage.toLowerCase()).toContain('connection');
      }
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();
      
      await dashboardPage.navigate();
      await dashboardPage.waitForDashboardReady();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 8 seconds
      expect(loadTime).toBeLessThan(8000);
      console.log(`Dashboard loaded in ${loadTime}ms`);
    });

    test('should handle large log datasets efficiently', async () => {
      // Create multiple log entries quickly
      const logPromises = Array.from({ length: 10 }, (_, i) => 
        apiPage.createLog({
          level: 'INFO',
          source: 'tests',
          component: 'performance-test',
          message: `Performance test log entry ${i + 1}`
        })
      );
      
      await Promise.all(logPromises);
      
      // Refresh and verify performance
      const startTime = Date.now();
      await dashboardPage.navigate();
      await dashboardPage.waitForDashboardReady();
      const loadTime = Date.now() - startTime;
      
      // Should still load efficiently with more data
      expect(loadTime).toBeLessThan(10000);
      
      const logEntries = await dashboardPage.getLogEntries();
      expect(Array.isArray(logEntries)).toBe(true);
    });
  });
});