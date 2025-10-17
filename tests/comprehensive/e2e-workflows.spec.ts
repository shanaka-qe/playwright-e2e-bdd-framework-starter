/**
 * Comprehensive Testoria Workflows Test Suite
 * 
 * End-to-end validation of complete user workflows using the new framework
 */

import { test, expect } from '../../framework/fixtures/TestFixtures';

test.describe('Testoria Complete Workflows', () => {
  test.describe('Document Management Workflow', () => {
    test('should complete full document lifecycle', async ({ 
      homePage, 
      documentHubPage, 
      apiHelper, 
      testDataSetId, 
      dataManager,
      performanceTracker 
    }) => {
      performanceTracker.startTimer('document_workflow');
      
      // Generate test document
      await dataManager.generateTestFiles(testDataSetId, {
        count: 1,
        types: ['pdf'],
        sizes: ['medium']
      });
      
      const testFiles = await dataManager.getDataFromSet(testDataSetId, 'files');
      const testFile = testFiles[0];
      
      // Navigate to application
      await homePage.navigate();
      await homePage.navigateToDocumentHub();
      
      // Verify document hub is accessible
      await expect(documentHubPage.page).toHaveTitle(/Testoria/);
      
      // Upload document via UI
      performanceTracker.startTimer('document_upload');
      await documentHubPage.uploadSingleFile(testFile.path);
      performanceTracker.stopTimer('document_upload');
      
      // Verify document appears in list
      const documents = await documentHubPage.getDocumentList();
      expect(documents.length).toBeGreaterThan(0);
      
      const uploadedDoc = documents.find(doc => doc.name.includes('test'));
      expect(uploadedDoc).toBeDefined();
      expect(uploadedDoc!.status).toBe('ready');
      
      // Verify via API
      const apiDocs = await apiHelper.getDocuments();
      expect(apiDocs.status).toBe(200);
      expect(apiDocs.data.data).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('test')
        })
      );
      
      // Test document preview
      await documentHubPage.previewDocument(uploadedDoc!.name);
      
      // Test document download
      const downloadPath = await documentHubPage.downloadDocument(uploadedDoc!.name);
      expect(downloadPath).toBeTruthy();
      
      // Clean up - delete document
      await documentHubPage.deleteDocument(uploadedDoc!.name);
      
      const workflowTime = performanceTracker.stopTimer('document_workflow');
      expect(workflowTime).toBeLessThan(60000); // Should complete within 1 minute
    });

    test('should handle bulk document upload', async ({ 
      documentHubPage, 
      testDataSetId, 
      dataManager 
    }) => {
      // Generate multiple test files
      await dataManager.generateTestFiles(testDataSetId, {
        count: 3,
        types: ['pdf', 'docx', 'txt'],
        sizes: ['small']
      });
      
      const testFiles = await dataManager.getDataFromSet(testDataSetId, 'files');
      const filePaths = testFiles.map(file => file.path);
      
      await documentHubPage.navigate();
      await documentHubPage.uploadMultipleFiles(filePaths);
      
      // Verify all documents uploaded
      const documents = await documentHubPage.getDocumentList();
      expect(documents.length).toBeGreaterThanOrEqual(3);
      
      // Verify different file types
      const fileTypes = new Set(documents.map(doc => doc.type));
      expect(fileTypes.size).toBeGreaterThan(1);
    });
  });

  test.describe('AI Feature Generation Workflow', () => {
    test('should generate feature from user story', async ({ 
      homePage, 
      featureGeneratorPage, 
      apiHelper,
      performanceTracker 
    }) => {
      await homePage.navigate();
      await homePage.navigateToFeatureGenerator();
      
      // Start generation timing
      performanceTracker.startTimer('feature_generation');
      
      // Send a test prompt
      const prompt = 'Create a login feature with username, password, and remember me functionality';
      await featureGeneratorPage.sendChatMessage(prompt);
      
      // Wait for AI response
      await featureGeneratorPage.waitForChatResponse();
      
      const generationTime = performanceTracker.stopTimer('feature_generation');
      expect(generationTime).toBeLessThan(30000); // Should respond within 30 seconds
      
      // Verify chat response
      const messages = await featureGeneratorPage.getChatMessages();
      expect(messages.length).toBeGreaterThanOrEqual(2); // User message + AI response
      
      const aiResponse = messages.find(msg => msg.role === 'assistant');
      expect(aiResponse).toBeDefined();
      expect(aiResponse!.content).toContain('Feature:');
      
      // Check live preview
      const previewContent = await featureGeneratorPage.getPreviewContent();
      expect(previewContent).toContain('Feature:');
      expect(previewContent).toContain('Scenario:');
      expect(previewContent).toContain('Given');
      expect(previewContent).toContain('When');
      expect(previewContent).toContain('Then');
      
      // Save feature
      await featureGeneratorPage.createNewFeature(
        'Login Feature Test',
        previewContent
      );
      
      // Verify feature in list
      const features = await featureGeneratorPage.getFeatureFiles();
      const savedFeature = features.find(f => f.title === 'Login Feature Test');
      expect(savedFeature).toBeDefined();
      expect(savedFeature!.category).toBe('generated');
    });

    test('should iterate on feature with improvements', async ({ 
      featureGeneratorPage 
    }) => {
      await featureGeneratorPage.navigate();
      
      // Initial generation
      await featureGeneratorPage.sendChatMessage(
        'Create a simple user registration feature'
      );
      await featureGeneratorPage.waitForChatResponse();
      
      const initialContent = await featureGeneratorPage.getPreviewContent();
      
      // Request improvements
      await featureGeneratorPage.sendChatMessage(
        'Add email validation and password strength requirements'
      );
      await featureGeneratorPage.waitForChatResponse();
      
      const improvedContent = await featureGeneratorPage.getPreviewContent();
      
      // Verify improvements
      expect(improvedContent).not.toBe(initialContent);
      expect(improvedContent.toLowerCase()).toMatch(/(email|validation|password|strength)/);
    });

    test('should validate Monaco Editor functionality', async ({ 
      featureGeneratorPage 
    }) => {
      await featureGeneratorPage.navigate();
      
      // Test direct editor input
      const gherkinContent = `Feature: Test Feature
  As a user
  I want to test the editor
  So that I can validate Gherkin syntax

  Scenario: Basic test
    Given I am on the test page
    When I perform an action
    Then I should see the result`;
      
      await featureGeneratorPage.setEditorContent(gherkinContent);
      
      // Verify content was set
      const editorContent = await featureGeneratorPage.getEditorContent();
      expect(editorContent).toBe(gherkinContent);
      
      // Test syntax validation
      const isValidGherkin = await featureGeneratorPage.validateGherkinSyntax();
      expect(isValidGherkin).toBe(true);
      
      // Check for syntax errors
      const errors = await featureGeneratorPage.getEditorErrors();
      expect(errors.length).toBe(0);
      
      // Test formatting
      await featureGeneratorPage.formatEditorContent();
    });
  });

  test.describe('Settings and Configuration Workflow', () => {
    test('should configure AI models', async ({ 
      homePage, 
      settingsPage, 
      apiHelper 
    }) => {
      await homePage.navigate();
      await homePage.navigateToSettings();
      
      // Get current configuration
      const currentConfig = await settingsPage.getCurrentModelConfiguration();
      expect(currentConfig).toBeDefined();
      
      // Test model selection
      const availableModels = await settingsPage.getAvailableModels();
      expect(availableModels.chatModels.length).toBeGreaterThan(0);
      expect(availableModels.embeddingModels.length).toBeGreaterThan(0);
      
      // Select different models (if available)
      if (availableModels.chatModels.length > 1) {
        const newChatModel = availableModels.chatModels[1];
        await settingsPage.selectChatModel(newChatModel);
        
        // Save configuration
        await settingsPage.saveModelConfiguration();
        
        // Verify via API
        const apiConfig = await apiHelper.getModelSettings();
        expect(apiConfig.status).toBe(200);
      }
      
      // Test configuration persistence
      const isPersistent = await settingsPage.checkConfigurationPersistence();
      expect(isPersistent).toBe(true);
    });

    test('should test Ollama integration when available', async ({ 
      settingsPage 
    }) => {
      await settingsPage.navigate();
      
      // Check Ollama availability
      const ollamaStatus = await settingsPage.getOllamaStatus();
      
      if (ollamaStatus.includes('available') || ollamaStatus.includes('connected')) {
        // Test Ollama models
        await settingsPage.refreshOllamaModels();
        
        const ollamaModels = await settingsPage.getOllamaModels();
        expect(ollamaModels.length).toBeGreaterThan(0);
        
        // Test model selection
        if (ollamaModels.length > 0) {
          await settingsPage.selectOllamaModel(ollamaModels[0]);
          await settingsPage.saveModelConfiguration();
        }
      } else {
        console.log('ℹ️  Ollama not available - skipping Ollama-specific tests');
      }
    });

    test('should validate database connectivity', async ({ 
      settingsPage, 
      databaseHelper 
    }) => {
      await settingsPage.navigate();
      
      // Test UI database status
      const dbStatus = await settingsPage.getDatabaseStatus();
      expect(dbStatus.status).toMatch(/(Connected|Disconnected)/);
      
      // Test database connection via helper
      const isHealthy = await databaseHelper.isHealthy();
      expect(isHealthy).toBe(true);
      
      // Test API database status
      const connectionTest = await settingsPage.testDatabaseConnection();
      expect(connectionTest).toBe(true);
    });
  });

  test.describe('Search and Discovery Workflow', () => {
    test('should perform semantic search across documents', async ({ 
      homePage, 
      apiHelper, 
      testDataSetId, 
      dataManager 
    }) => {
      // Setup test data
      await dataManager.generateDocuments(testDataSetId, 3, {
        status: 'ready',
        content: 'This document contains information about user authentication and login processes.'
      });
      
      await homePage.navigate();
      
      // Test search via UI
      await homePage.performSearch('authentication');
      
      // Verify search input
      const searchValue = await homePage.getSearchValue();
      expect(searchValue).toBe('authentication');
      
      // Test search via API
      const searchResults = await apiHelper.semanticSearch('login process', {
        limit: 10,
        threshold: 0.5
      });
      
      expect(searchResults.status).toBe(200);
      expect(searchResults.data.results).toBeDefined();
    });

    test('should integrate search with feature generation', async ({ 
      homePage, 
      featureGeneratorPage, 
      apiHelper, 
      testDataSetId, 
      dataManager 
    }) => {
      // Create documents with specific content
      await dataManager.generateDocuments(testDataSetId, 2, {
        content: 'Payment processing requirements: support credit cards, PayPal, and bank transfers with proper validation.'
      });
      
      await homePage.navigate();
      await homePage.navigateToFeatureGenerator();
      
      // Generate feature based on document content
      await featureGeneratorPage.sendChatMessage(
        'Generate a payment feature based on the available documentation'
      );
      
      await featureGeneratorPage.waitForChatResponse();
      
      const generatedContent = await featureGeneratorPage.getPreviewContent();
      expect(generatedContent.toLowerCase()).toMatch(/(payment|credit|paypal|bank)/);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ 
      homePage, 
      page 
    }) => {
      await homePage.navigate();
      
      // Simulate offline condition
      await page.context().setOffline(true);
      
      // Attempt navigation
      await homePage.navigateToDocumentHub();
      
      // Check for graceful error handling
      const hasErrors = await homePage.hasErrorMessages();
      
      // Restore connection
      await page.context().setOffline(false);
      
      // Verify recovery
      await homePage.navigate();
      await expect(homePage.page).toHaveTitle(/Testoria/);
    });

    test('should handle large file uploads', async ({ 
      documentHubPage, 
      testDataSetId, 
      dataManager 
    }) => {
      // Generate large test file
      await dataManager.generateTestFiles(testDataSetId, {
        count: 1,
        types: ['pdf'],
        sizes: ['large']
      });
      
      const testFiles = await dataManager.getDataFromSet(testDataSetId, 'files');
      const largeFile = testFiles[0];
      
      await documentHubPage.navigate();
      
      // Test large file upload with extended timeout
      await documentHubPage.uploadSingleFile(largeFile.path);
      
      // Verify upload completed
      const documents = await documentHubPage.getDocumentList();
      expect(documents.length).toBeGreaterThan(0);
    });

    test('should validate input sanitization', async ({ 
      featureGeneratorPage 
    }) => {
      await featureGeneratorPage.navigate();
      
      // Test potentially problematic inputs
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'SELECT * FROM users; DROP TABLE users;',
        '../../etc/passwd',
        'javascript:void(0)'
      ];
      
      for (const input of maliciousInputs) {
        await featureGeneratorPage.sendChatMessage(input);
        await featureGeneratorPage.waitForChatResponse();
        
        // Verify input was sanitized/handled safely
        const messages = await featureGeneratorPage.getChatMessages();
        const lastMessage = messages[messages.length - 1];
        
        // Should not contain raw malicious input
        expect(lastMessage.content).not.toContain('<script>');
        expect(lastMessage.content).not.toContain('DROP TABLE');
      }
    });
  });

  test.describe('Accessibility and Usability', () => {
    test('should support keyboard navigation', async ({ 
      homePage, 
      page 
    }) => {
      await homePage.navigate();
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Test navigation with Enter key
      await page.keyboard.press('Enter');
      
      // Verify keyboard accessibility
      const accessibilityFeatures = await homePage.checkAccessibilityFeatures();
      expect(accessibilityFeatures.hasKeyboardNavigation).toBe(true);
      expect(accessibilityFeatures.hasAriaLabels).toBe(true);
    });

    test('should work across different screen sizes', async ({ 
      homePage, 
      documentHubPage, 
      featureGeneratorPage 
    }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1024, height: 768, name: 'Laptop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];
      
      for (const viewport of viewports) {
        await homePage.page.setViewportSize(viewport);
        
        // Test home page responsiveness
        const isHomeResponsive = await homePage.checkResponsiveLayout(viewport);
        expect(isHomeResponsive).toBe(true);
        
        // Test document hub responsiveness
        await documentHubPage.navigate();
        const isDocResponsive = viewport.width >= 768 ? 
          await documentHubPage.checkTabletLayout() : 
          await documentHubPage.checkMobileLayout();
        expect(isDocResponsive).toBe(true);
        
        // Test feature generator responsiveness
        await featureGeneratorPage.navigate();
        const isFeatureResponsive = viewport.width >= 768 ? 
          await featureGeneratorPage.checkTabletLayout() : 
          await featureGeneratorPage.checkMobileLayout();
        expect(isFeatureResponsive).toBe(true);
      }
    });
  });

  test.describe('Performance Validation', () => {
    test('should meet performance benchmarks', async ({ 
      homePage, 
      documentHubPage, 
      featureGeneratorPage, 
      performanceTracker 
    }) => {
      // Test page load times
      const homeLoadTime = await homePage.measurePageLoadTime();
      expect(homeLoadTime).toBeLessThan(5000); // 5 seconds
      
      const docLoadTime = await documentHubPage.measurePageLoadTime();
      expect(docLoadTime).toBeLessThan(5000);
      
      const featureLoadTime = await featureGeneratorPage.measurePageLoadTime();
      expect(featureLoadTime).toBeLessThan(5000);
      
      // Test feature generation performance
      const generationTime = await featureGeneratorPage.measureGenerationTime(
        'Create a simple test feature'
      );
      expect(generationTime).toBeLessThan(30000); // 30 seconds
      
      // Validate overall performance metrics
      const metrics = performanceTracker.getAllMetrics();
      console.log('Performance Metrics:', metrics);
      
      // Ensure no performance regression
      Object.values(metrics).forEach(time => {
        expect(time).toBeLessThan(120000); // No operation should take > 2 minutes
      });
    });
  });
});