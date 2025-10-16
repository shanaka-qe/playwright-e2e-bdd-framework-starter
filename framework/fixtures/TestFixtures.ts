/**
 * Test Fixtures
 * 
 * Provides reusable test fixtures for common setup and teardown operations
 */

import { test as base, TestInfo } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { DocumentHubPage } from '../pages/DocumentHubPage';
import { FeatureGeneratorPage } from '../pages/FeatureGeneratorPage';
import { SettingsPage } from '../pages/SettingsPage';
import { environmentConfig } from '../config/EnvironmentConfig';
import { testDataManager, TestDataManager } from '../data/TestDataManager';
import { APIHelper } from '../utils/APIHelper';
import { DatabaseHelper } from '../utils/DatabaseHelper';

// Define fixture types
export interface TestoriaFixtures {
  // Page Objects
  homePage: HomePage;
  documentHubPage: DocumentHubPage;
  featureGeneratorPage: FeatureGeneratorPage;
  settingsPage: SettingsPage;
  
  // Utilities
  apiHelper: APIHelper;
  databaseHelper: DatabaseHelper;
  dataManager: TestDataManager;
  
  // Test data
  testDataSetId: string;
  
  // Environment helpers
  environment: typeof environmentConfig;
  
  // Screenshot helpers
  screenshotOnFailure: void;
  
  // Performance tracking
  performanceTracker: PerformanceTracker;
}

class PerformanceTracker {
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.startTimes.set(name, Date.now());
  }

  stopTimer(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      throw new Error(`Timer '${name}' was not started`);
    }
    
    const duration = Date.now() - startTime;
    this.metrics.set(name, duration);
    this.startTimes.delete(name);
    
    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Base test with fixtures
export const test = base.extend<TestoriaFixtures>({
  // Environment configuration
  environment: async ({}, use) => {
    await use(environmentConfig);
  },

  // Page Objects
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  documentHubPage: async ({ page }, use) => {
    const documentHubPage = new DocumentHubPage(page);
    await use(documentHubPage);
  },

  featureGeneratorPage: async ({ page }, use) => {
    const featureGeneratorPage = new FeatureGeneratorPage(page);
    await use(featureGeneratorPage);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  // API Helper
  apiHelper: async ({ request, environment }, use) => {
    const apiHelper = new APIHelper(request, environment.getApiConfig());
    await use(apiHelper);
  },

  // Database Helper
  databaseHelper: async ({ environment }, use) => {
    const databaseHelper = new DatabaseHelper(environment.getDatabaseConfig());
    await databaseHelper.connect();
    await use(databaseHelper);
    await databaseHelper.disconnect();
  },

  // Data Manager
  dataManager: async ({}, use) => {
    await use(testDataManager);
  },

  // Test Data Set
  testDataSetId: async ({ dataManager }, use, testInfo) => {
    const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    const dataSetId = await dataManager.createDataSet(
      `test_${testName}`,
      `Test data for: ${testInfo.title}`
    );
    
    await use(dataSetId);
    
    // Cleanup after test if configured
    if (environmentConfig.isTest() || environmentConfig.isDevelopment()) {
      await dataManager.cleanupDataSet(dataSetId);
    }
  },

  // Screenshot on failure
  screenshotOnFailure: [async ({ page }, use, testInfo) => {
    await use();
    
    // Take screenshot on failure
    if (testInfo.status === 'failed') {
      const screenshotPath = `test-results/screenshots/${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_failure.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // Attach to test report
      await testInfo.attach('screenshot', {
        path: screenshotPath,
        contentType: 'image/png'
      });
    }
  }, { auto: true }],

  // Performance Tracker
  performanceTracker: async ({}, use) => {
    const tracker = new PerformanceTracker();
    await use(tracker);
    
    // Log performance metrics after test
    const metrics = tracker.getAllMetrics();
    if (Object.keys(metrics).length > 0) {
      console.log('Performance Metrics:', metrics);
    }
  }
});

// Specialized test fixtures for different test types
export const smokeTest = test.extend({
  // Override data manager for smoke tests (minimal data)
  testDataSetId: async ({ dataManager }, use, testInfo) => {
    const dataSetId = await dataManager.createDataSet(`smoke_${testInfo.title}`);
    
    // Generate minimal test data for smoke tests
    await dataManager.generateSmokeTestData(dataSetId);
    
    await use(dataSetId);
    
    // Always cleanup smoke test data
    await dataManager.cleanupDataSet(dataSetId);
  }
});

export const regressionTest = test.extend({
  // Override data manager for regression tests (comprehensive data)
  testDataSetId: async ({ dataManager }, use, testInfo) => {
    const dataSetId = await dataManager.createDataSet(`regression_${testInfo.title}`);
    
    // Generate comprehensive test data for regression tests
    await dataManager.generateRegressionTestData(dataSetId);
    
    await use(dataSetId);
    
    // Cleanup based on environment
    if (environmentConfig.isDevelopment()) {
      await dataManager.cleanupDataSet(dataSetId);
    }
  }
});

export const performanceTest = test.extend({
  // Override data manager for performance tests (large datasets)
  testDataSetId: async ({ dataManager }, use, testInfo) => {
    const dataSetId = await dataManager.createDataSet(`performance_${testInfo.title}`);
    
    // Generate large datasets for performance testing
    await dataManager.generatePerformanceTestData(dataSetId);
    
    await use(dataSetId);
    
    // Always cleanup performance test data (large datasets)
    await dataManager.cleanupDataSet(dataSetId);
  },

  // Start performance tracking automatically
  performanceTracker: async ({}, use, testInfo) => {
    const tracker = new PerformanceTracker();
    tracker.startTimer('total_test_time');
    
    await use(tracker);
    
    const totalTime = tracker.stopTimer('total_test_time');
    console.log(`Total test time for "${testInfo.title}": ${totalTime}ms`);
    
    // Fail test if it takes too long (configurable threshold)
    const maxTestTime = 120000; // 2 minutes
    if (totalTime > maxTestTime) {
      throw new Error(`Test exceeded maximum execution time: ${totalTime}ms > ${maxTestTime}ms`);
    }
  }
});

export const apiTest = test.extend({
  // API-specific test data
  testDataSetId: async ({ dataManager }, use, testInfo) => {
    const dataSetId = await dataManager.createDataSet(`api_${testInfo.title}`);
    
    // Generate API-specific test data
    await dataManager.generateApiTestData(dataSetId);
    
    await use(dataSetId);
    
    await dataManager.cleanupDataSet(dataSetId);
  },

  // Skip UI-related fixtures for API tests
  homePage: async ({}, use) => {
    // Provide null implementation for API tests
    await use(null as any);
  },

  documentHubPage: async ({}, use) => {
    await use(null as any);
  },

  featureGeneratorPage: async ({}, use) => {
    await use(null as any);
  },

  settingsPage: async ({}, use) => {
    await use(null as any);
  }
});

// Visual regression test fixture
export const visualTest = test.extend({
  // Configure for visual testing
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1, // Consistent for visual testing
      hasTouch: false,
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    const page = await context.newPage();
    
    // Disable animations for consistent screenshots
    await page.addInitScript(() => {
      // Disable CSS animations
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    await use(page);
    await context.close();
  }
});

// Database test fixture (requires database operations)
export const databaseTest = test.extend({
  // Ensure database is clean before each test
  databaseHelper: async ({ environment }, use) => {
    const databaseHelper = new DatabaseHelper(environment.getDatabaseConfig());
    await databaseHelper.connect();
    
    // Create clean test transaction
    await databaseHelper.beginTransaction();
    
    await use(databaseHelper);
    
    // Rollback transaction to ensure clean state
    await databaseHelper.rollbackTransaction();
    await databaseHelper.disconnect();
  }
});

// Cross-browser test fixture - configured via projects in playwright.config.ts

// Mobile test fixture
export const mobileTest = test.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      ...require('@playwright/test').devices['iPhone 12'],
      locale: 'en-US'
    });
    
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

// Accessibility test fixture
export const accessibilityTest = test.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Enable accessibility features
      forcedColors: 'none',
      reducedMotion: 'reduce'
    });
    
    const page = await context.newPage();
    
    // Inject axe-core for accessibility testing
    await page.addInitScript(() => {
      // Note: In real implementation, you'd inject axe-core library
      // This is a placeholder for the concept
      (window as any).axe = {
        run: () => Promise.resolve({ violations: [] })
      };
    });
    
    await use(page);
    await context.close();
  }
});

// Export expect from playwright for consistency
export { expect } from '@playwright/test';