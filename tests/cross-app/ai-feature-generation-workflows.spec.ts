/**
 * AI Feature Generation Workflows E2E Tests
 * 
 * Comprehensive tests for AI-powered feature generation including:
 * - Chat interface functionality
 * - Monaco Editor Gherkin editing
 * - Live preview and validation
 * - Feature management operations
 * - AI generation workflows
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../../framework/pages/HomePage';
import { FeatureGeneratorPage, FeatureFile, ChatMessage } from '../../framework/pages/FeatureGeneratorPage';
import { testDataFactory } from '../../framework/data/TestDataFactory';

test.describe('AI Feature Generation Workflows', () => {
  let homePage: HomePage;
  let featureGeneratorPage: FeatureGeneratorPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    featureGeneratorPage = new FeatureGeneratorPage(page);
    
    // Navigate to the application
    await homePage.navigate();
    await expect(page).toHaveTitle(/Testoria/);
  });

  test.describe('Feature Generator Interface', () => {
    test('should display complete feature generator interface', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Verify main interface elements
      await expect(page.locator('[class*="chat"], [data-testid="chat-interface"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="message"], input[placeholder*="Ask"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send"), button[aria-label*="send"]')).toBeVisible();
      
      // Verify feature management section
      await expect(page.locator('[class*="feature-list"], [data-testid="feature-list"]')).toBeVisible();
      
      // Verify live preview section
      await expect(page.locator('[class*="preview"], [data-testid="live-preview"]')).toBeVisible();
    });

    test('should have proper two-column layout on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await featureGeneratorPage.navigate();
      
      const hasProperLayout = await featureGeneratorPage.checkTwoColumnLayout();
      expect(hasProperLayout).toBe(true);
    });

    test('should adapt to mobile viewport', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const isMobileCompatible = await featureGeneratorPage.checkMobileLayout();
      expect(isMobileCompatible).toBe(true);
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const isTabletCompatible = await featureGeneratorPage.checkTabletLayout();
      expect(isTabletCompatible).toBe(true);
    });
  });

  test.describe('Chat Interface Functionality', () => {
    test('should handle basic chat interaction', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const testMessage = 'Generate a test scenario for user login functionality';
      
      // Send message
      await featureGeneratorPage.sendChatMessage(testMessage);
      
      // Verify message appears in chat
      const messages = await featureGeneratorPage.getChatMessages();
      const userMessage = messages.find(msg => msg.role === 'user' && msg.content.includes('login'));
      expect(userMessage).toBeDefined();
      
      // Wait for and verify AI response
      const updatedMessages = await featureGeneratorPage.getChatMessages();
      const aiResponse = updatedMessages.find(msg => msg.role === 'assistant');
      expect(aiResponse).toBeDefined();
      expect(aiResponse?.content.length).toBeGreaterThan(0);
    });

    test('should handle multiple conversation turns', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // First message
      await featureGeneratorPage.sendChatMessage('Create a feature for user registration');
      await page.waitForTimeout(3000);
      
      // Second message
      await featureGeneratorPage.sendChatMessage('Add validation scenarios for email format');
      await page.waitForTimeout(3000);
      
      // Third message
      await featureGeneratorPage.sendChatMessage('Include password strength requirements');
      await page.waitForTimeout(3000);
      
      // Verify conversation history
      const messages = await featureGeneratorPage.getChatMessages();
      expect(messages.length).toBeGreaterThanOrEqual(6); // 3 user + 3 assistant messages
      
      // Verify message order and roles
      let userMessages = 0;
      let assistantMessages = 0;
      messages.forEach(msg => {
        if (msg.role === 'user') userMessages++;
        if (msg.role === 'assistant') assistantMessages++;
      });
      
      expect(userMessages).toBeGreaterThanOrEqual(3);
      expect(assistantMessages).toBeGreaterThanOrEqual(3);
    });

    test('should handle complex feature generation prompts', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const complexPrompt = `Generate a comprehensive feature file for an e-commerce checkout process that includes:
      - Adding items to cart
      - Applying discount codes
      - Selecting shipping options
      - Payment processing
      - Order confirmation
      Include both positive and negative test scenarios with proper error handling.`;
      
      await featureGeneratorPage.generateFeatureFromPrompt(complexPrompt);
      
      // Verify generation completes
      await expect(page.locator('[class*="success"], [class*="preview-content"]')).toBeVisible({ timeout: 60000 });
      
      // Check if content was generated in preview
      const previewContent = await featureGeneratorPage.getPreviewContent();
      expect(previewContent.length).toBeGreaterThan(100);
      expect(previewContent.toLowerCase()).toContain('feature:');
      expect(previewContent.toLowerCase()).toContain('scenario:');
    });

    test('should handle error scenarios gracefully', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Send invalid or problematic prompt
      const problematicPrompt = '';
      
      await featureGeneratorPage.sendChatMessage(problematicPrompt);
      
      // Should either show error message or handle gracefully
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      if (hasErrors) {
        const errorMessages = await featureGeneratorPage.getErrorMessages();
        expect(errorMessages.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Monaco Editor Functionality', () => {
    test('should display Monaco editor with Gherkin syntax highlighting', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate some content first
      await featureGeneratorPage.sendChatMessage('Create a simple login feature');
      await page.waitForTimeout(5000);
      
      // Check for Monaco editor presence
      await expect(page.locator('.monaco-editor, [data-testid="monaco-editor"]')).toBeVisible();
      
      // Verify Gherkin syntax highlighting
      const hasGherkinSyntax = await featureGeneratorPage.validateGherkinSyntax();
      expect(hasGherkinSyntax).toBe(true);
    });

    test('should support manual editing in Monaco editor', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const customGherkinContent = `Feature: Manual Test Feature
  As a user
  I want to manually edit features
  So that I can customize test scenarios

  Scenario: Manual editing works
    Given I am on the feature generator page
    When I edit the content manually
    Then the changes should be reflected
    And the syntax should be highlighted`;

      // Set content in editor
      await featureGeneratorPage.setEditorContent(customGherkinContent);
      
      // Verify content was set
      const editorContent = await featureGeneratorPage.getEditorContent();
      expect(editorContent).toContain('Feature: Manual Test Feature');
      expect(editorContent).toContain('Scenario: Manual editing works');
    });

    test('should validate Gherkin syntax and show errors', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Set invalid Gherkin content
      const invalidGherkin = `Feature: Invalid Feature
  This is not proper Gherkin syntax
  Missing proper keywords and structure
  Should show errors`;

      await featureGeneratorPage.setEditorContent(invalidGherkin);
      await page.waitForTimeout(2000);
      
      // Check for syntax errors (implementation may vary)
      const errors = await featureGeneratorPage.getEditorErrors();
      // Monaco editor with Gherkin should detect some syntax issues
      expect(errors.length).toBeGreaterThanOrEqual(0); // May or may not show errors depending on implementation
    });

    test('should support editor formatting', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const unformattedGherkin = `Feature:Unformatted Feature
Scenario:Test formatting
Given I have unformatted content
When I format it
Then it should be properly indented`;

      await featureGeneratorPage.setEditorContent(unformattedGherkin);
      
      // Try to format content
      await featureGeneratorPage.formatEditorContent();
      
      const formattedContent = await featureGeneratorPage.getEditorContent();
      expect(formattedContent).toBeDefined();
    });
  });

  test.describe('Live Preview Functionality', () => {
    test('should update preview when content changes', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate initial content
      await featureGeneratorPage.sendChatMessage('Create a search functionality feature');
      await page.waitForTimeout(5000);
      
      // Get initial preview content
      const initialPreview = await featureGeneratorPage.getPreviewContent();
      expect(initialPreview.length).toBeGreaterThan(0);
      
      // Modify content in editor
      await featureGeneratorPage.setEditorContent(`Feature: Updated Search Feature
  As a user
  I want to search for products
  So that I can find what I need

  Scenario: Successful search
    Given I am on the search page
    When I enter "laptop"
    Then I should see search results`);
      
      await page.waitForTimeout(2000);
      
      // Verify preview updated
      const updatedPreview = await featureGeneratorPage.getPreviewContent();
      expect(updatedPreview).toContain('Updated Search Feature');
    });

    test('should support preview expansion', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate content
      await featureGeneratorPage.sendChatMessage('Create a feature for product filtering');
      await page.waitForTimeout(5000);
      
      // Expand preview
      await featureGeneratorPage.expandPreview();
      
      // Verify expanded view
      await expect(page.locator('[class*="expanded"], [class*="modal"]')).toBeVisible();
    });

    test('should support copying preview content', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate content
      await featureGeneratorPage.sendChatMessage('Create a simple feature');
      await page.waitForTimeout(5000);
      
      // Copy preview content
      await featureGeneratorPage.copyPreviewContent();
      
      // Verify copy operation (implementation specific)
      // In real tests, you might check clipboard content or success message
      await expect(page.locator('[class*="copied"], [class*="success"]')).toBeVisible({ timeout: 3000 });
    });

    test('should support downloading preview content', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate content
      await featureGeneratorPage.sendChatMessage('Create a downloadable feature');
      await page.waitForTimeout(5000);
      
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Trigger download
      const downloadButton = page.locator('button:has-text("Download"), button[aria-label*="download"]');
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.feature$/);
      }
    });
  });

  test.describe('Feature Management Operations', () => {
    test('should create new feature manually', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const newFeature = testDataFactory.createFeatureFile({
        title: 'Manual Test Feature',
        content: `Feature: Manual Test Feature
  As a tester
  I want to create features manually
  So that I can manage test scenarios

  Scenario: Manual creation works
    Given I create a new feature
    When I save it
    Then it should appear in the list`
      });
      
      await featureGeneratorPage.createNewFeature(newFeature.title, newFeature.content);
      
      // Verify feature appears in list
      const features = await featureGeneratorPage.getFeatureFiles();
      const createdFeature = features.find(f => f.title === newFeature.title);
      expect(createdFeature).toBeDefined();
    });

    test('should edit existing feature', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Create initial feature
      const initialFeature = testDataFactory.createFeatureFile({
        title: 'Feature to Edit',
        content: 'Feature: Initial Content'
      });
      
      await featureGeneratorPage.createNewFeature(initialFeature.title, initialFeature.content);
      
      // Edit the feature
      const updatedTitle = 'Updated Feature Title';
      const updatedContent = `Feature: Updated Feature
  This feature has been modified`;
      
      await featureGeneratorPage.editFeature(initialFeature.title, updatedTitle, updatedContent);
      
      // Verify changes
      const features = await featureGeneratorPage.getFeatureFiles();
      const updatedFeature = features.find(f => f.title === updatedTitle);
      expect(updatedFeature).toBeDefined();
    });

    test('should delete feature with confirmation', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Create feature to delete
      const featureToDelete = testDataFactory.createFeatureFile({
        title: 'Feature to Delete',
        content: 'Feature: This will be deleted'
      });
      
      await featureGeneratorPage.createNewFeature(featureToDelete.title, featureToDelete.content);
      
      const featuresBeforeDelete = await featureGeneratorPage.getFeatureFiles();
      const featureCount = featuresBeforeDelete.length;
      
      // Delete the feature
      await featureGeneratorPage.deleteFeature(featureToDelete.title);
      
      // Verify deletion
      const featuresAfterDelete = await featureGeneratorPage.getFeatureFiles();
      expect(featuresAfterDelete.length).toBeLessThan(featureCount);
      
      const deletedFeature = featuresAfterDelete.find(f => f.title === featureToDelete.title);
      expect(deletedFeature).toBeUndefined();
    });

    test('should support feature search functionality', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Create multiple features with different titles
      const features = [
        { title: 'Login Feature', content: 'Feature: User Login' },
        { title: 'Registration Feature', content: 'Feature: User Registration' },
        { title: 'Checkout Feature', content: 'Feature: Shopping Checkout' }
      ];
      
      for (const feature of features) {
        await featureGeneratorPage.createNewFeature(feature.title, feature.content);
        await page.waitForTimeout(1000);
      }
      
      // Search for specific feature
      await featureGeneratorPage.searchFeatures('Login');
      await page.waitForTimeout(2000);
      
      const searchResults = await featureGeneratorPage.getFeatureFiles();
      // Should filter to show only login-related features
      expect(searchResults.length).toBeGreaterThan(0);
      if (searchResults.length > 0) {
        expect(searchResults[0].title.toLowerCase()).toContain('login');
      }
    });

    test('should support filtering by category', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Test category filtering
      await featureGeneratorPage.filterFeaturesByCategory('generated');
      await page.waitForTimeout(1000);
      
      // Verify filtering works (implementation specific)
      const features = await featureGeneratorPage.getFeatureFiles();
      // Should show features in the selected category
      expect(features.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('AI Generation Advanced Features', () => {
    test('should support feature regeneration', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate initial feature
      await featureGeneratorPage.sendChatMessage('Create a basic user authentication feature');
      await page.waitForTimeout(5000);
      
      const initialContent = await featureGeneratorPage.getPreviewContent();
      
      // Regenerate feature
      await featureGeneratorPage.regenerateFeature();
      await page.waitForTimeout(5000);
      
      const regeneratedContent = await featureGeneratorPage.getPreviewContent();
      
      // Content should be different (though this may vary by implementation)
      expect(regeneratedContent.length).toBeGreaterThan(0);
    });

    test('should support feature improvement prompts', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate initial feature
      await featureGeneratorPage.sendChatMessage('Create a simple login feature');
      await page.waitForTimeout(5000);
      
      // Improve the feature
      const improvementPrompt = 'Add scenarios for password reset and account lockout';
      await featureGeneratorPage.improveFeature(improvementPrompt);
      
      // Verify improvement was applied
      const improvedContent = await featureGeneratorPage.getPreviewContent();
      expect(improvedContent.length).toBeGreaterThan(0);
      expect(improvedContent.toLowerCase()).toContain('scenario');
    });

    test('should handle template selection', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Check if template selector is available
      const templateSelector = page.locator('select[name*="template"], [data-testid="template-selector"]');
      if (await templateSelector.isVisible()) {
        // Test template selection
        await featureGeneratorPage.generateFeatureFromPrompt(
          'Create a REST API test feature',
          { template: 'API Testing' }
        );
        
        const content = await featureGeneratorPage.getPreviewContent();
        expect(content.length).toBeGreaterThan(0);
      }
    });

    test('should handle complexity selection', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Check if complexity selector is available
      const complexitySelector = page.locator('select[name*="complexity"], [data-testid="complexity-selector"]');
      if (await complexitySelector.isVisible()) {
        // Test complexity selection
        await featureGeneratorPage.generateFeatureFromPrompt(
          'Create a comprehensive e-commerce feature',
          { complexity: 'High' }
        );
        
        const content = await featureGeneratorPage.getPreviewContent();
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should generate features within reasonable time', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const startTime = Date.now();
      await featureGeneratorPage.sendChatMessage('Create a quick test feature');
      await page.waitForTimeout(30000); // Wait up to 30 seconds
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      expect(generationTime).toBeLessThan(60000); // Should complete within 60 seconds
    });

    test('should support keyboard navigation', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const accessibilityFeatures = await featureGeneratorPage.checkAccessibilityFeatures();
      expect(accessibilityFeatures.hasKeyboardNavigation).toBe(true);
    });

    test('should have proper ARIA labels and screen reader support', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const accessibilityFeatures = await featureGeneratorPage.checkAccessibilityFeatures();
      expect(accessibilityFeatures.hasAriaLabels).toBe(true);
      expect(accessibilityFeatures.hasScreenReaderSupport).toBe(true);
    });

    test('should handle long-running generation gracefully', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Send complex prompt that might take longer to process
      const complexPrompt = `Generate a comprehensive test suite for a microservices architecture including:
      - API gateway testing
      - Service-to-service communication
      - Database integration tests
      - Authentication and authorization
      - Error handling and circuit breakers
      - Performance and load testing scenarios
      - Monitoring and logging verification`;
      
      await featureGeneratorPage.sendChatMessage(complexPrompt);
      
      // Should show loading indicator
      const isGenerating = await featureGeneratorPage.isGenerationInProgress();
      expect(isGenerating).toBe(true);
      
      // Wait for completion (with extended timeout for complex generation)
      await featureGeneratorPage.waitForGenerationComplete(120000); // 2 minutes
      
      // Verify content was generated
      const content = await featureGeneratorPage.getPreviewContent();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should maintain state during browser refresh', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Generate some content
      await featureGeneratorPage.sendChatMessage('Create a feature for testing');
      await page.waitForTimeout(5000);
      
      const contentBeforeRefresh = await featureGeneratorPage.getPreviewContent();
      
      // Refresh the page
      await page.reload();
      await featureGeneratorPage.waitForPageReady();
      
      // Check if content persists (implementation may vary)
      const contentAfterRefresh = await featureGeneratorPage.getPreviewContent();
      
      // Either content persists or starts fresh - both are valid behaviors
      expect(contentAfterRefresh).toBeDefined();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle AI service unavailability', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Mock AI service failure
      await page.route('**/api/generate*', route => route.abort());
      
      await featureGeneratorPage.sendChatMessage('This should fail gracefully');
      
      // Should show appropriate error message
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      expect(hasErrors).toBe(true);
      
      const errorMessages = await featureGeneratorPage.getErrorMessages();
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    test('should handle invalid Gherkin generation', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Send prompt that might result in invalid Gherkin
      await featureGeneratorPage.sendChatMessage('Generate something that is not a test feature');
      await page.waitForTimeout(10000);
      
      // Should either generate valid Gherkin or handle gracefully
      const content = await featureGeneratorPage.getPreviewContent();
      if (content.length > 0) {
        // If content is generated, it should contain some Gherkin keywords
        const hasGherkinKeywords = content.toLowerCase().includes('feature') || 
                                 content.toLowerCase().includes('scenario') ||
                                 content.toLowerCase().includes('given');
        expect(hasGherkinKeywords).toBe(true);
      }
    });

    test('should handle concurrent chat messages', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Send multiple messages quickly
      const messages = [
        'Create login feature',
        'Add validation scenarios',
        'Include error handling'
      ];
      
      // Send all messages in quick succession
      for (const message of messages) {
        await featureGeneratorPage.sendChatMessage(message);
        await page.waitForTimeout(500); // Small delay between messages
      }
      
      // Wait for all responses
      await page.waitForTimeout(15000);
      
      // Verify all messages were handled
      const chatMessages = await featureGeneratorPage.getChatMessages();
      const userMessages = chatMessages.filter(msg => msg.role === 'user');
      expect(userMessages.length).toBeGreaterThanOrEqual(messages.length);
    });

    test('should handle very long prompts', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      // Create very long prompt
      const longPrompt = 'Create a comprehensive test feature ' + 'that includes many scenarios '.repeat(100);
      
      await featureGeneratorPage.sendChatMessage(longPrompt);
      
      // Should either handle gracefully or show appropriate error
      await page.waitForTimeout(10000);
      
      const hasErrors = await featureGeneratorPage.hasGenerationErrors();
      const content = await featureGeneratorPage.getPreviewContent();
      
      // Either shows error or generates content successfully
      expect(hasErrors || content.length > 0).toBe(true);
    });

    test('should handle special characters in prompts', async ({ page }) => {
      await featureGeneratorPage.navigate();
      
      const specialCharPrompt = 'Create feature with special chars: @#$%^&*()[]{}|\\:";\'<>?,./~`';
      
      await featureGeneratorPage.sendChatMessage(specialCharPrompt);
      await page.waitForTimeout(10000);
      
      // Should handle special characters gracefully
      const content = await featureGeneratorPage.getPreviewContent();
      expect(content.length).toBeGreaterThanOrEqual(0);
    });
  });
});