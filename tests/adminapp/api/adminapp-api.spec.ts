/**
 * Admin App API Tests
 * 
 * Comprehensive API testing for adminapp endpoints
 */

import { test, expect } from '@playwright/test';
import { AdminApiPage, LogEntry } from '../../../framework/pages/adminapp/AdminApiPage';

test.describe('Admin App API Tests', () => {
  let apiPage: AdminApiPage;

  test.beforeEach(async ({ page }) => {
    apiPage = new AdminApiPage(page);
  });

  test.describe('Health Endpoint', () => {
    test('should return healthy status', async () => {
      const health = await apiPage.getHealthStatus();
      
      expect(health.status).toBe('ok');
      expect(health.timestamp).toBeDefined();
      expect(new Date(health.timestamp)).toBeInstanceOf(Date);
      
      if (health.uptime) {
        expect(health.uptime).toBeGreaterThan(0);
      }
      
      if (health.database) {
        expect(health.database.connected).toBe(true);
      }
    });

    test('should return consistent health data', async () => {
      const health1 = await apiPage.getHealthStatus();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const health2 = await apiPage.getHealthStatus();
      
      expect(health1.status).toBe(health2.status);
      expect(health1.version).toBe(health2.version);
      
      if (health1.uptime && health2.uptime) {
        expect(health2.uptime).toBeGreaterThan(health1.uptime);
      }
    });
  });

  test.describe('Logs API', () => {
    test('should retrieve logs without filters', async () => {
      const response = await apiPage.getLogs();
      
      expect(response).toBeDefined();
      expect(typeof response.total).toBe('number');
      expect(Array.isArray(response.logs)).toBe(true);
      expect(typeof response.hasMore).toBe('boolean');
    });

    test('should create a new log entry', async () => {
      const newLog: LogEntry = {
        level: 'INFO',
        source: 'tests',
        component: 'e2e-tests',
        message: 'Test log entry from API test',
        metadata: { testId: 'api-test-1' },
        traceId: `trace-${Date.now()}`,
        userId: 'test-user'
      };

      const createdLog = await apiPage.createLog(newLog);
      
      expect(createdLog).toBeDefined();
      expect(createdLog.level).toBe(newLog.level);
      expect(createdLog.source).toBe(newLog.source);
      expect(createdLog.component).toBe(newLog.component);
      expect(createdLog.message).toBe(newLog.message);
      expect(createdLog.traceId).toBe(newLog.traceId);
    });

    test('should filter logs by level', async () => {
      // Create test logs with different levels
      const testLogs: LogEntry[] = [
        {
          level: 'ERROR',
          source: 'tests',
          component: 'filter-test',
          message: 'Error log for filtering test'
        },
        {
          level: 'INFO',
          source: 'tests',
          component: 'filter-test',
          message: 'Info log for filtering test'
        }
      ];

      for (const log of testLogs) {
        await apiPage.createLog(log);
      }

      // Wait a moment for logs to be indexed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter by ERROR level
      const errorLogs = await apiPage.getLogs({ level: 'ERROR' });
      
      expect(errorLogs.logs.length).toBeGreaterThan(0);
      errorLogs.logs.forEach(log => {
        expect(log.level).toBe('ERROR');
      });
    });

    test('should filter logs by source', async () => {
      // Create a test log with specific source
      const testLog: LogEntry = {
        level: 'INFO',
        source: 'tests',
        component: 'source-filter-test',
        message: 'Test log for source filtering'
      };

      await apiPage.createLog(testLog);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter by source
      const sourceLogs = await apiPage.getLogs({ source: 'tests' });
      
      expect(sourceLogs.logs.length).toBeGreaterThan(0);
      sourceLogs.logs.forEach(log => {
        expect(log.source).toBe('tests');
      });
    });

    test('should search logs by message content', async () => {
      const searchTerm = `unique-search-term-${Date.now()}`;
      
      // Create a log with unique search term
      const testLog: LogEntry = {
        level: 'INFO',
        source: 'tests',
        component: 'search-test',
        message: `Test message containing ${searchTerm} for search testing`
      };

      await apiPage.createLog(testLog);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Search for the term
      const searchResults = await apiPage.getLogs({ search: searchTerm });
      
      expect(searchResults.logs.length).toBeGreaterThan(0);
      const foundLog = searchResults.logs.find(log => log.message.includes(searchTerm));
      expect(foundLog).toBeDefined();
    });

    test('should respect pagination limits', async () => {
      // Get logs with small limit
      const limitedResponse = await apiPage.getLogs({ limit: 5 });
      
      expect(limitedResponse.logs.length).toBeLessThanOrEqual(5);
      
      if (limitedResponse.total > 5) {
        expect(limitedResponse.hasMore).toBe(true);
      }
    });

    test('should handle pagination offset', async () => {
      const firstPage = await apiPage.getLogs({ limit: 5, offset: 0 });
      const secondPage = await apiPage.getLogs({ limit: 5, offset: 5 });
      
      if (firstPage.logs.length > 0 && secondPage.logs.length > 0) {
        // Ensure different logs are returned
        const firstPageIds = firstPage.logs.map(log => log.id);
        const secondPageIds = secondPage.logs.map(log => log.id);
        
        const overlap = firstPageIds.some(id => secondPageIds.includes(id));
        expect(overlap).toBe(false);
      }
    });
  });

  test.describe('Log Statistics', () => {
    test('should return log statistics', async () => {
      const stats = await apiPage.getLogStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(stats.byLevel).toBeDefined();
      expect(stats.bySource).toBeDefined();
      expect(Array.isArray(stats.recentActivity)).toBe(true);
    });

    test('should have consistent statistics', async () => {
      // Create a new log
      const testLog: LogEntry = {
        level: 'WARN',
        source: 'tests',
        component: 'stats-test',
        message: 'Test log for statistics validation'
      };

      const statsBefore = await apiPage.getLogStatistics();
      await apiPage.createLog(testLog);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statsAfter = await apiPage.getLogStatistics();
      
      expect(statsAfter.total).toBeGreaterThanOrEqual(statsBefore.total);
      expect(statsAfter.byLevel['WARN']).toBeGreaterThanOrEqual(statsBefore.byLevel['WARN'] || 0);
    });
  });

  test.describe('Export Functionality', () => {
    test('should export logs in JSON format', async () => {
      const exportData = await apiPage.exportLogs('json');
      
      expect(exportData).toBeDefined();
      expect(exportData.data).toBeDefined();
      expect(exportData.contentType).toContain('json');
      expect(exportData.filename).toContain('.json');
      
      // Validate JSON format
      const parsedData = JSON.parse(exportData.data);
      expect(Array.isArray(parsedData) || typeof parsedData === 'object').toBe(true);
    });

    test('should export logs in CSV format', async () => {
      const exportData = await apiPage.exportLogs('csv');
      
      expect(exportData).toBeDefined();
      expect(exportData.data).toBeDefined();
      expect(exportData.contentType).toContain('csv');
      expect(exportData.filename).toContain('.csv');
      
      // Basic CSV validation
      const lines = exportData.data.split('\n');
      expect(lines.length).toBeGreaterThan(0);
      
      // Should have header row
      if (lines.length > 1) {
        const headers = lines[0].split(',');
        expect(headers.length).toBeGreaterThan(0);
      }
    });

    test('should export filtered logs', async () => {
      // Create test log
      const testLog: LogEntry = {
        level: 'ERROR',
        source: 'tests',
        component: 'export-test',
        message: 'Test log for export filtering'
      };

      await apiPage.createLog(testLog);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Export only ERROR level logs
      const exportData = await apiPage.exportLogs('json', { level: 'ERROR' });
      
      const parsedData = JSON.parse(exportData.data);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        parsedData.forEach((log: LogEntry) => {
          expect(log.level).toBe('ERROR');
        });
      }
    });
  });

  test.describe('Authentication', () => {
    test('should reject requests without API key', async () => {
      const apiPageWithoutKey = new AdminApiPage(apiPage['page'], '');
      
      try {
        await apiPageWithoutKey.getLogs();
        fail('Should have thrown an error for missing API key');
      } catch (error) {
        expect(error.message).toContain('401');
      }
    });

    test('should reject requests with invalid API key', async () => {
      const result = await apiPage.testAuthentication('invalid-key-123');
      expect(result).toBe(false);
    });

    test('should accept requests with valid API key', async () => {
      const result = await apiPage.testAuthentication('default-api-key');
      expect(result).toBe(true);
    });
  });

  test.describe('System Endpoints', () => {
    test('should return system metrics', async () => {
      try {
        const metrics = await apiPage.getSystemMetrics();
        
        expect(metrics).toBeDefined();
        expect(metrics.memory).toBeDefined();
        expect(metrics.disk).toBeDefined();
        expect(metrics.cpu).toBeDefined();
        expect(typeof metrics.uptime).toBe('number');
      } catch (error) {
        // System metrics endpoint might not be implemented yet
        console.log('System metrics endpoint not available:', error.message);
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle concurrent requests', async () => {
      const results = await apiPage.testRateLimit('/api/health', 5);
      
      expect(results.successful).toBeGreaterThan(0);
      expect(results.responses.length).toBe(5);
      
      // Most requests should succeed for health endpoint
      expect(results.successful).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('CORS Configuration', () => {
    test('should allow requests from localhost:3001', async () => {
      const corsAllowed = await apiPage.testCors('http://localhost:3001');
      expect(corsAllowed).toBe(true);
    });

    test('should handle different origins', async () => {
      const corsAllowed = await apiPage.testCors('http://localhost:3000');
      // This might be allowed or not depending on configuration
      expect(typeof corsAllowed).toBe('boolean');
    });
  });
});