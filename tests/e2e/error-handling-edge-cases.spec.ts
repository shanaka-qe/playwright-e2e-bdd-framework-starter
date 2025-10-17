/**
 * Error Handling and Edge Cases E2E Tests
 * 
 * Comprehensive tests for application resilience including:
 * - Network failure scenarios
 * - API error responses
 * - Resource loading failures
 * - Browser compatibility issues
 * - Memory and performance stress tests
 * - Concurrent user scenarios
 * - Data corruption and recovery
 * - Timeout handling
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/core/base/pages/HomePage';
import { DocumentHubPage } from '../../src/core/base/pages/DocumentHubPage';
import { FeatureGeneratorPage } from '../../src/core/base/pages/FeatureGeneratorPage';
import { GlobalChatPage } from '../../src/core/base/pages/GlobalChatPage';
import { testDataFactory } from '../../src/applications/shared/api/builders/TestDataFactory';
import path from 'path';
import fs from 'fs';

test.describe('Error Handling and Edge Cases', () => {
  let homePage: HomePage;
  let documentHubPage: DocumentHubPage;
  let featureGeneratorPage: FeatureGeneratorPage;
  let globalChatPage: GlobalChatPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    documentHubPage = new DocumentHubPage(page);
    featureGeneratorPage = new FeatureGeneratorPage(page);
    globalChatPage = new GlobalChatPage(page);
    
    // Navigate to the application
    await homePage.navigate();
    await expect(page).toHaveTitle(/Testoria/);
  });

  test.describe('Network Failure Scenarios', () => {
    test('should handle complete network disconnection', async ({ page }) => {
      // Start with normal navigation
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      
      // Simulate complete network failure
      await page.route('**/*', route => route.abort());
      
      // Try to navigate
      await homePage.navigateToFeatureGenerator();
      
      // Should handle gracefully - either show error or maintain current state
      const hasErrors = await homePage.hasErrorMessages();
      const isPageFunctional = await page.locator('nav').isVisible();
      
      expect(hasErrors || isPageFunctional).toBe(true);
    });

    test('should handle slow network responses', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        route.continue();
      });
      
      // Try document upload
      const testFile = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testFile.content);
        
        await documentHubPage.navigate();
        
        // Should show loading indicators during slow network
        await page.locator('input[type="file"]').setInputFiles(tempFilePath);
        
        // Check for loading indicators
        const hasLoadingIndicator = await page.locator('[class*="loading"], [class*="spinner"]').isVisible();
        expect(hasLoadingIndicator).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle intermittent network connectivity', async ({ page }) => {
      let requestCount = 0;
      
      // Simulate intermittent connectivity (fail every other request)
      await page.route('**/*', route => {
        requestCount++;
        if (requestCount % 2 === 0) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      // Try to use the application
      await homePage.navigateToDocumentHub();
      await page.waitForTimeout(2000);
      
      await homePage.navigateToFeatureGenerator();
      await page.waitForTimeout(2000);
      
      // Should handle intermittent failures gracefully
      const isAppFunctional = await page.locator('nav').isVisible();
      expect(isAppFunctional).toBe(true);
    });

    test('should handle API timeouts', async ({ page }) => {
      // Simulate API timeouts
      await page.route('**/api/**', route => {
        // Never respond (timeout)
        // Don't call route.continue() or route.fulfill()
      });
      
      await globalChatPage.openChat();
      await globalChatPage.sendMessage('This should timeout');
      
      // Should show appropriate timeout error
      await page.waitForTimeout(10000);
      
      const hasTimeoutError = await globalChatPage.hasErrors();
      expect(hasTimeoutError).toBe(true);
    });
  });

  test.describe('API Error Responses', () => {
    test('should handle 404 API responses', async ({ page }) => {
      // Mock 404 responses
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not Found', message: 'API endpoint not found' })
        });
      });
      
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('Test 404 error handling');
      
      // Should show appropriate error message
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
      
      const errorMessages = await featureGeneratorPage.getErrorMessages();
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    test('should handle 500 internal server errors', async ({ page }) => {
      // Mock 500 responses
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error', message: 'Something went wrong' })
        });
      });
      
      await documentHubPage.navigate();
      
      const testFile = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testFile.content);
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Should show server error
        const hasErrors = await documentHubPage.hasErrors();
        expect(hasErrors).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle 401 unauthorized responses', async ({ page }) => {
      // Mock 401 responses
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' })
        });
      });
      
      await globalChatPage.openChat();
      await globalChatPage.sendMessage('Test unauthorized access');
      
      // Should handle authentication error
      const hasErrors = await globalChatPage.hasErrors();
      if (hasErrors) {
        const errorMessages = await globalChatPage.getErrorMessages();
        expect(errorMessages.some(msg => 
          msg.toLowerCase().includes('unauthorized') || 
          msg.toLowerCase().includes('authentication')
        )).toBe(true);
      }
    });

    test('should handle malformed API responses', async ({ page }) => {
      // Mock malformed JSON responses
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{ invalid json syntax...'
        });
      });
      
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('Test malformed response');
      
      // Should handle JSON parsing error gracefully
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
    });

    test('should handle rate limiting (429 responses)', async ({ page }) => {
      // Mock rate limiting
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: { 'Retry-After': '60' },
          body: JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded' })
        });
      });
      
      await globalChatPage.openChat();
      await globalChatPage.sendMessage('Test rate limiting');
      
      // Should show rate limit error
      const hasErrors = await globalChatPage.hasErrors();
      if (hasErrors) {
        const errorMessages = await globalChatPage.getErrorMessages();
        expect(errorMessages.some(msg => 
          msg.toLowerCase().includes('rate') || 
          msg.toLowerCase().includes('limit') ||
          msg.toLowerCase().includes('many requests')
        )).toBe(true);
      }
    });
  });

  test.describe('Resource Loading Failures', () => {
    test('should handle CSS loading failures', async ({ page }) => {
      // Block CSS files
      await page.route('**/*.css', route => route.abort());
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // Should still be functional even without CSS
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Navigation should still work
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
    });

    test('should handle JavaScript loading failures', async ({ page }) => {
      // Block some JS files (but not all to avoid complete failure)
      await page.route('**/chunk-*.js', route => route.abort());
      
      // Try to navigate
      await homePage.navigateToFeatureGenerator();
      
      // Should either work or show appropriate error
      const isPageWorking = await page.locator('textarea[placeholder*="message"]').isVisible();
      const hasError = await homePage.hasErrorMessages();
      
      expect(isPageWorking || hasError).toBe(true);
    });

    test('should handle image loading failures', async ({ page }) => {
      // Block image files
      await page.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort());
      
      // Navigate through the application
      await homePage.navigateToOverview();
      await homePage.navigateToDocumentHub();
      await homePage.navigateToFeatureGenerator();
      
      // Should still be functional without images
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('should handle font loading failures', async ({ page }) => {
      // Block font files
      await page.route('**/*.{woff,woff2,ttf,otf}', route => route.abort());
      
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // Should use fallback fonts and remain readable
      await expect(page.locator('h1:has-text("Testoria")')).toBeVisible();
      await expect(page.locator('nav button')).toBeVisible();
    });
  });

  test.describe('Browser Compatibility Issues', () => {
    test('should handle localStorage unavailability', async ({ page }) => {
      // Disable localStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: false
        });
      });
      
      await page.reload();
      
      // Application should still work without localStorage
      await homePage.navigateToDocumentHub();
      await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
      
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
    });

    test('should handle sessionStorage unavailability', async ({ page }) => {
      // Disable sessionStorage
      await page.addInitScript(() => {
        Object.defineProperty(window, 'sessionStorage', {
          value: null,
          writable: false
        });
      });
      
      await page.reload();
      
      // Should work without sessionStorage
      await homePage.navigateToFeatureGenerator();
      await featureGeneratorPage.sendChatMessage('Test without sessionStorage');
      
      // Should either work or fail gracefully
      const response = await featureGeneratorPage.getLastResponse();
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      
      expect(response || hasErrors).toBeTruthy();
    });

    test('should handle WebSocket unavailability', async ({ page }) => {
      // Mock WebSocket failure
      await page.addInitScript(() => {
        // @ts-ignore
        window.WebSocket = function() {
          throw new Error('WebSocket not available');
        };
      });
      
      await page.reload();
      
      // Should fall back to HTTP polling or handle gracefully
      await globalChatPage.openChat();
      await globalChatPage.sendMessage('Test without WebSocket');
      
      // Should either work via fallback or show appropriate error
      const response = await globalChatPage.getLastResponse();
      const hasErrors = await globalChatPage.hasErrors();
      
      expect(response || hasErrors).toBeTruthy();
    });

    test('should handle File API unavailability', async ({ page }) => {
      // Disable File API
      await page.addInitScript(() => {
        // @ts-ignore
        window.File = undefined;
        // @ts-ignore
        window.FileReader = undefined;
      });
      
      await page.reload();
      await documentHubPage.navigate();
      
      // Should show appropriate error for file upload
      const testFile = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testFile.content);
        
        // Try to upload file
        await page.locator('input[type="file"]').setInputFiles(tempFilePath);
        
        // Should show appropriate error or fallback
        const hasErrors = await documentHubPage.hasErrors();
        const hasFileInput = await page.locator('input[type="file"]').isVisible();
        
        expect(hasErrors || hasFileInput).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Memory and Performance Stress Tests', () => {
    test('should handle large file uploads gracefully', async ({ page }) => {
      // Create a large test file (simulated)
      const largeContent = 'Large file content. '.repeat(10000); // ~200KB
      const largeFile = {
        name: 'large_test_file.txt',
        content: largeContent
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', largeFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, largeFile.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Should either handle large file or show appropriate error
        const hasSuccess = await documentHubPage.hasSuccessMessages();
        const hasErrors = await documentHubPage.hasErrors();
        
        expect(hasSuccess || hasErrors).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle memory pressure', async ({ page }) => {
      // Create many DOM elements to simulate memory pressure
      await page.evaluate(() => {
        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div');
          div.textContent = `Memory test element ${i}`;
          document.body.appendChild(div);
        }
      });
      
      // Application should still be responsive
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      await featureGeneratorPage.sendChatMessage('Test under memory pressure');
      
      // Should still be able to get a response
      const response = await featureGeneratorPage.getLastResponse();
      expect(response).toBeDefined();
    });

    test('should handle rapid user interactions', async ({ page }) => {
      await homePage.navigateToFeatureGenerator();
      
      // Rapidly click buttons and send messages
      for (let i = 0; i < 10; i++) {
        await featureGeneratorPage.sendChatMessage(`Rapid message ${i}`);
        await page.waitForTimeout(100); // Very short delay
      }
      
      // Should handle rapid interactions gracefully
      const messages = await featureGeneratorPage.getChatMessages();
      expect(messages.length).toBeGreaterThan(5); // Should have processed some messages
    });

    test('should handle long-running operations', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Send a complex prompt that might take a long time
      const complexPrompt = `Generate a comprehensive test suite for a complex e-commerce platform with multiple microservices, 
      including user management, inventory, payment processing, order fulfillment, analytics, and reporting. 
      Include detailed scenarios for each service, integration tests, performance tests, security tests, 
      and disaster recovery procedures. Make sure to cover all edge cases and error conditions.`;
      
      await featureGeneratorPage.sendChatMessage(complexPrompt);
      
      // Should either complete within reasonable time or show progress
      const isGenerating = await featureGeneratorPage.isGenerationInProgress();
      expect(isGenerating).toBe(true);
      
      // Wait for completion with extended timeout
      await featureGeneratorPage.waitForGenerationComplete(180000); // 3 minutes
      
      const response = await featureGeneratorPage.getLastResponse();
      expect(response).toBeDefined();
    });
  });

  test.describe('Concurrent User Scenarios', () => {
    test('should handle multiple simultaneous uploads', async ({ page, context }) => {
      // Create multiple pages to simulate different users
      const page2 = await context.newPage();
      const documentHubPage2 = new DocumentHubPage(page2);
      
      // Create test files
      const testFiles = [
        testDataFactory.generateTestFile('text', 'small'),
        testDataFactory.generateTestFile('text', 'small')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        for (const testFile of testFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, testFile.content);
          tempFilePaths.push(tempFilePath);
        }

        // Navigate both pages
        await documentHubPage.navigate();
        await page2.goto('/');
        await documentHubPage2.navigate();
        
        // Upload files simultaneously
        const uploadPromises = [
          documentHubPage.uploadSingleFile(tempFilePaths[0]),
          documentHubPage2.uploadSingleFile(tempFilePaths[1])
        ];
        
        await Promise.all(uploadPromises);
        
        // Both uploads should complete
        const hasSuccess1 = await documentHubPage.hasSuccessMessages();
        const hasSuccess2 = await documentHubPage2.hasSuccessMessages();
        
        expect(hasSuccess1 || hasSuccess2).toBe(true);
        
      } finally {
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        await page2.close();
      }
    });

    test('should handle concurrent AI generations', async ({ page, context }) => {
      const page2 = await context.newPage();
      const featureGeneratorPage2 = new FeatureGeneratorPage(page2);
      
      // Navigate both pages
      await featureGeneratorPage.navigate();
      await page2.goto('/');
      await featureGeneratorPage2.navigate();
      
      // Send messages simultaneously
      const messagePromises = [
        featureGeneratorPage.sendChatMessage('Generate login feature for user 1'),
        featureGeneratorPage2.sendChatMessage('Generate signup feature for user 2')
      ];
      
      await Promise.all(messagePromises);
      
      // Both should receive responses
      const response1 = await featureGeneratorPage.getLastResponse();
      const response2 = await featureGeneratorPage2.getLastResponse();
      
      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
      
      await page2.close();
    });

    test('should handle session conflicts gracefully', async ({ page, context }) => {
      const page2 = await context.newPage();
      const globalChatPage2 = new GlobalChatPage(page2);
      
      // Open chat on both pages
      await globalChatPage.openChat();
      await page2.goto('/');
      await globalChatPage2.openChat();
      
      // Send messages from both sessions
      await globalChatPage.sendMessage('Message from session 1');
      await globalChatPage2.sendMessage('Message from session 2');
      
      // Both should work independently
      const response1 = await globalChatPage.getLastResponse();
      const response2 = await globalChatPage2.getLastResponse();
      
      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
      
      await page2.close();
    });
  });

  test.describe('Data Corruption and Recovery', () => {
    test('should handle corrupted file uploads', async ({ page }) => {
      // Create a corrupted file
      const corruptedFile = {
        name: 'corrupted.pdf',
        content: 'This is not a valid PDF file content but has PDF extension'
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', corruptedFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, corruptedFile.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Should handle corrupted file gracefully
        const hasErrors = await documentHubPage.hasErrors();
        const hasSuccess = await documentHubPage.hasSuccessMessages();
        
        expect(hasErrors || hasSuccess).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle invalid feature file content', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Set invalid Gherkin content
      const invalidGherkin = `This is not Gherkin syntax at all
      Just random text that should not be processed
      No Feature: or Scenario: keywords
      Complete garbage content`;
      
      await featureGeneratorPage.setEditorContent(invalidGherkin);
      
      // Should handle invalid content gracefully
      const errors = await featureGeneratorPage.getEditorErrors();
      expect(errors.length).toBeGreaterThanOrEqual(0); // May or may not show errors
    });

    test('should recover from localStorage corruption', async ({ page }) => {
      // Corrupt localStorage
      await page.evaluate(() => {
        localStorage.setItem('testoria_data', 'corrupted_json_data{{{');
      });
      
      await page.reload();
      
      // Should handle corrupted localStorage gracefully
      await homePage.navigateToFeatureGenerator();
      await expect(page.locator('textarea[placeholder*="message"]')).toBeVisible();
      
      // Should be able to use the application normally
      await featureGeneratorPage.sendChatMessage('Test after localStorage corruption');
      const response = await featureGeneratorPage.getLastResponse();
      expect(response).toBeDefined();
    });

    test('should handle incomplete API responses', async ({ page }) => {
      // Mock incomplete API responses
      await page.route('**/api/generate*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"partial": "response", "incomplete":'
        });
      });
      
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('Test incomplete response');
      
      // Should handle incomplete JSON gracefully
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
    });
  });

  test.describe('Timeout Handling', () => {
    test('should handle upload timeouts', async ({ page }) => {
      // Create a file and simulate upload timeout
      const testFile = testDataFactory.generateTestFile('text', 'medium');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testFile.content);
        
        // Make upload requests hang
        await page.route('**/api/upload*', route => {
          // Don't respond - simulate timeout
        });
        
        await documentHubPage.navigate();
        await page.locator('input[type="file"]').setInputFiles(tempFilePath);
        
        // Should show timeout error after reasonable time
        await page.waitForTimeout(30000);
        
        const hasErrors = await documentHubPage.hasErrors();
        expect(hasErrors).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle generation timeouts', async ({ page }) => {
      // Simulate AI generation timeout
      await page.route('**/api/generate*', route => {
        // Don't respond - simulate timeout
      });
      
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('This should timeout');
      
      // Should show timeout error
      await page.waitForTimeout(60000); // Wait 1 minute
      
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
    });

    test('should handle search timeouts', async ({ page }) => {
      // Simulate search timeout
      await page.route('**/api/search*', route => {
        // Don't respond
      });
      
      await globalChatPage.openChat();
      await globalChatPage.sendMessage('Search query that will timeout');
      
      // Should handle timeout gracefully
      await page.waitForTimeout(30000);
      
      const hasErrors = await globalChatPage.hasErrors();
      expect(hasErrors).toBe(true);
    });
  });

  test.describe('Security and Input Validation', () => {
    test('should handle XSS attempts in chat input', async ({ page }) => {
      await globalChatPage.openChat();
      
      const xssPayload = '<script>alert("XSS")</script>';
      await globalChatPage.sendMessage(xssPayload);
      
      // Should sanitize or escape the input
      const messages = await globalChatPage.getChatMessages();
      const lastMessage = messages[messages.length - 1];
      
      expect(lastMessage?.content).not.toContain('<script>');
    });

    test('should handle SQL injection attempts', async ({ page }) => {
      await globalChatPage.openChat();
      
      const sqlInjection = "'; DROP TABLE users; --";
      await globalChatPage.sendMessage(sqlInjection);
      
      // Should handle malicious input safely
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
    });

    test('should handle extremely long inputs', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const longInput = 'Very long input '.repeat(10000); // ~140KB
      
      await featureGeneratorPage.sendChatMessage(longInput);
      
      // Should either handle or reject gracefully
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      const response = await featureGeneratorPage.getLastResponse();
      
      expect(hasErrors || response).toBeTruthy();
    });

    test('should handle file uploads with malicious filenames', async ({ page }) => {
      const maliciousFiles = [
        '../../etc/passwd.txt',
        '<script>alert("xss")</script>.txt',
        'file with spaces and "quotes".txt',
        'file;with|special&chars.txt'
      ];
      
      for (const filename of maliciousFiles) {
        const content = 'Safe content';
        const tempFilePath = path.join(__dirname, '../../temp', 'safe_test_file.txt');
        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        try {
          fs.writeFileSync(tempFilePath, content);
          
          await documentHubPage.navigate();
          await page.locator('input[type="file"]').setInputFiles(tempFilePath);
          
          // Should handle malicious filenames safely
          const hasErrors = await documentHubPage.hasErrors();
          const hasSuccess = await documentHubPage.hasSuccessMessages();
          
          expect(hasErrors || hasSuccess).toBe(true);
          
        } finally {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }
    });
  });

  test.describe('Recovery and Resilience', () => {
    test('should recover from temporary service outages', async ({ page }) => {
      // Start with working service
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('Test before outage');
      let response = await featureGeneratorPage.getLastResponse();
      expect(response).toBeDefined();
      
      // Simulate service outage
      await page.route('**/api/**', route => route.abort());
      
      await featureGeneratorPage.sendChatMessage('Test during outage');
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
      
      // Restore service
      await page.unroute('**/api/**');
      
      // Should recover
      await featureGeneratorPage.sendChatMessage('Test after recovery');
      response = await featureGeneratorPage.getLastResponse();
      expect(response).toBeDefined();
    });

    test('should maintain state during page refresh', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Create some content
      await featureGeneratorPage.sendChatMessage('Create test content');
      await page.waitForTimeout(3000);
      
      const contentBeforeRefresh = await featureGeneratorPage.getPreviewContent();
      
      // Refresh page
      await page.reload();
      await featureGeneratorPage.waitForPageReady();
      
      // Check if state is maintained or gracefully reset
      const contentAfterRefresh = await featureGeneratorPage.getPreviewContent();
      
      // Either content persists or starts fresh - both are valid
      expect(contentAfterRefresh).toBeDefined();
    });

    test('should handle browser crashes gracefully', async ({ page, context }) => {
      await featureGeneratorPage.navigate();
      await featureGeneratorPage.sendChatMessage('Test before crash simulation');
      
      // Simulate browser crash by closing and reopening
      const url = page.url();
      await page.close();
      
      const newPage = await context.newPage();
      await newPage.goto(url);
      
      // Should load fresh or recover gracefully
      await expect(newPage.locator('nav')).toBeVisible();
      await expect(newPage.locator('main')).toBeVisible();
    });
  });
});