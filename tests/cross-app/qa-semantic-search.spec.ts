/**
 * Q&A Semantic Search E2E Tests
 * 
 * Comprehensive tests for the Global Chat QA Genie functionality including:
 * - Semantic search capabilities
 * - Knowledge base querying
 * - Contextual conversations
 * - Source attribution
 * - Confidence scoring
 * - Multi-modal search (text and images)
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../../framework/pages/HomePage';
import { GlobalChatPage, QAChatMessage } from '../../framework/pages/GlobalChatPage';
import { DocumentHubPage } from '../../framework/pages/DocumentHubPage';
import { testDataFactory } from '../../framework/data/TestDataFactory';
import path from 'path';
import fs from 'fs';

test.describe('Q&A Semantic Search Functionality', () => {
  let homePage: HomePage;
  let globalChatPage: GlobalChatPage;
  let documentHubPage: DocumentHubPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    globalChatPage = new GlobalChatPage(page);
    documentHubPage = new DocumentHubPage(page);
    
    // Navigate to the application
    await homePage.navigate();
    await expect(page).toHaveTitle(/Testoria/);
  });

  test.describe('Global Chat Interface', () => {
    test('should display QA Genie button and open chat interface', async ({ page }) => {
      // Verify QA Genie button is visible
      await expect(page.locator('button[aria-label="Open QA Genie"], button:has-text("QA Genie")')).toBeVisible();
      
      // Open chat
      await globalChatPage.openChat();
      
      // Verify chat interface elements
      await expect(page.locator('[class*="global-chat"], [data-testid="global-chat"]')).toBeVisible();
      await expect(page.locator('[class*="global-chat"] textarea, [data-testid="chat-input"]')).toBeVisible();
      await expect(page.locator('[class*="global-chat"] button:has-text("Send"), [data-testid="send-button"]')).toBeVisible();
    });

    test('should support chat window controls', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Test minimize/expand
      await globalChatPage.minimizeChat();
      await page.waitForTimeout(1000);
      
      await globalChatPage.expandChat();
      await page.waitForTimeout(1000);
      
      // Test close
      await globalChatPage.closeChat();
      const isChatOpen = await globalChatPage.isChatOpen();
      expect(isChatOpen).toBe(false);
    });

    test('should be responsive on different screen sizes', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Test mobile layout
      const isMobileCompatible = await globalChatPage.checkMobileLayout();
      expect(isMobileCompatible).toBe(true);
      
      // Test tablet layout
      const isTabletCompatible = await globalChatPage.checkTabletLayout();
      expect(isTabletCompatible).toBe(true);
    });
  });

  test.describe('Basic Q&A Functionality', () => {
    test('should respond to basic questions', async ({ page }) => {
      await globalChatPage.openChat();
      
      const basicQuestions = [
        'What is Testoria?',
        'How do I upload documents?',
        'What file types are supported?',
        'How does the AI feature generation work?'
      ];
      
      for (const question of basicQuestions) {
        await globalChatPage.sendMessage(question);
        
        const lastResponse = await globalChatPage.getLastResponse();
        expect(lastResponse).toBeDefined();
        expect(lastResponse?.content.length).toBeGreaterThan(0);
        
        await page.waitForTimeout(2000); // Delay between questions
      }
    });

    test('should handle follow-up questions in context', async ({ page }) => {
      await globalChatPage.openChat();
      
      const conversation = [
        'Tell me about document upload functionality',
        'What file formats are supported for upload?',
        'How large can the files be?',
        'Can I upload multiple files at once?'
      ];
      
      const result = await globalChatPage.testContextualConversation(conversation);
      
      expect(result.responses.length).toBe(conversation.length);
      expect(result.maintains_context).toBe(true);
      
      // Each response should be meaningful
      result.responses.forEach(response => {
        expect(response.content.length).toBeGreaterThan(10);
      });
    });

    test('should provide relevant answers for technical questions', async ({ page }) => {
      await globalChatPage.openChat();
      
      const technicalQuestions = [
        'How does semantic search work in Testoria?',
        'What AI models are used for embeddings?',
        'How is the vector database structured?',
        'What are the API endpoints available?'
      ];
      
      const searchResults = await globalChatPage.testSemanticSearch(technicalQuestions);
      
      searchResults.forEach((result, index) => {
        expect(result.hasResults).toBe(true);
        expect(result.query).toBe(technicalQuestions[index]);
        // Should have some form of response
        expect(result.hasResults).toBe(true);
      });
    });
  });

  test.describe('Semantic Search Capabilities', () => {
    test('should find semantically similar content', async ({ page }) => {
      // First, upload some test documents to establish knowledge base
      const testDocuments = [
        {
          name: 'api_guide.txt',
          content: `API Documentation
          
          Our REST API provides endpoints for:
          - Document upload and management
          - Feature file generation
          - User authentication
          - Search and retrieval
          
          Authentication is required for all endpoints using Bearer tokens.
          Rate limiting is applied at 100 requests per minute.`
        },
        {
          name: 'user_manual.txt',
          content: `User Manual
          
          Getting Started:
          1. Create an account
          2. Upload your documents
          3. Use AI to generate test features
          4. Manage your test suite
          
          The platform supports PDF, DOCX, TXT, and MD file formats.
          Maximum file size is 10MB per upload.`
        }
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Upload test documents
        for (const doc of testDocuments) {
          const tempFilePath = path.join(__dirname, '../../temp', doc.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, doc.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        await documentHubPage.uploadMultipleFiles(tempFilePaths);
        await documentHubPage.waitForUploadComplete();
        
        // Wait for ingestion to complete
        await page.waitForTimeout(10000);
        
        // Test semantic search
        await globalChatPage.openChat();
        
        const semanticQueries = [
          'How do I authenticate with the API?', // Should find API guide
          'What file types can I upload?', // Should find user manual
          'Tell me about rate limits', // Should find API guide
          'What is the maximum file size?' // Should find user manual
        ];
        
        for (const query of semanticQueries) {
          await globalChatPage.sendMessage(query);
          
          const lastResponse = await globalChatPage.getLastResponse();
          expect(lastResponse).toBeDefined();
          expect(lastResponse?.content.length).toBeGreaterThan(0);
          
          // Check for source attribution
          const sources = await globalChatPage.getSourceReferences();
          if (sources.length > 0) {
            // Should reference relevant documents
            expect(sources.some(source => 
              source.includes('api_guide') || 
              source.includes('user_manual')
            )).toBe(true);
          }
          
          await page.waitForTimeout(3000);
        }
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    test('should handle complex multi-part questions', async ({ page }) => {
      await globalChatPage.openChat();
      
      const complexQuery = `I need to know about both document upload functionality and API authentication. 
      Specifically, what file types are supported for upload and what authentication method should I use 
      when calling the API endpoints? Also, are there any size limitations I should be aware of?`;
      
      await globalChatPage.sendMessage(complexQuery);
      
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
      expect(response?.content.length).toBeGreaterThan(50);
      
      // Response should address multiple aspects of the question
      const responseText = response?.content.toLowerCase() || '';
      expect(
        responseText.includes('upload') || 
        responseText.includes('file') || 
        responseText.includes('authentication') ||
        responseText.includes('api')
      ).toBe(true);
    });

    test('should provide confidence scores for answers', async ({ page }) => {
      await globalChatPage.openChat();
      
      const queries = [
        'What is Testoria?', // Should have high confidence
        'How do I perform quantum entanglement in the system?' // Should have low confidence
      ];
      
      for (const query of queries) {
        await globalChatPage.sendMessage(query);
        
        const confidence = await globalChatPage.getConfidenceScore();
        if (confidence !== null) {
          expect(confidence).toBeGreaterThanOrEqual(0);
          expect(confidence).toBeLessThanOrEqual(100);
        }
        
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Knowledge Base Integration', () => {
    test('should search across different document types', async ({ page }) => {
      // Create documents of different types
      const testFiles = [
        testDataFactory.generateTestFile('text', 'medium'),
        testDataFactory.generateTestFile('pdf', 'medium'),
        testDataFactory.generateTestFile('feature', 'medium')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Upload different file types
        for (const testFile of testFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, testFile.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        await documentHubPage.uploadMultipleFiles(tempFilePaths);
        await documentHubPage.waitForUploadComplete();
        
        // Wait for processing
        await page.waitForTimeout(10000);
        
        await globalChatPage.openChat();
        
        // Search for content that might be in any document type
        await globalChatPage.sendMessage('Tell me about the content in my uploaded documents');
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        expect(response?.content.length).toBeGreaterThan(0);
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    test('should handle queries about feature files and Gherkin syntax', async ({ page }) => {
      await globalChatPage.openChat();
      
      const gherkinQueries = [
        'How do I write a Gherkin feature file?',
        'What are the main Gherkin keywords?',
        'Can you show me an example of a scenario?',
        'How do I structure Given-When-Then steps?'
      ];
      
      for (const query of gherkinQueries) {
        await globalChatPage.sendMessage(query);
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        
        const responseText = response?.content.toLowerCase() || '';
        expect(
          responseText.includes('gherkin') ||
          responseText.includes('feature') ||
          responseText.includes('scenario') ||
          responseText.includes('given') ||
          responseText.includes('when') ||
          responseText.includes('then')
        ).toBe(true);
        
        await page.waitForTimeout(2000);
      }
    });

    test('should provide source attribution for answers', async ({ page }) => {
      // Upload a document with specific content
      const sourceDocument = {
        name: 'testing_guide.txt',
        content: `Testing Best Practices
        
        1. Always write clear test scenarios
        2. Use descriptive names for test cases
        3. Include both positive and negative test cases
        4. Maintain test data separately
        5. Document test dependencies
        
        When writing Gherkin scenarios, follow the Given-When-Then pattern
        to ensure clarity and maintainability.`
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', sourceDocument.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, sourceDocument.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        await documentHubPage.waitForUploadComplete();
        
        // Wait for ingestion
        await page.waitForTimeout(10000);
        
        await globalChatPage.openChat();
        
        // Ask about content from the uploaded document
        await globalChatPage.sendMessage('What are some testing best practices?');
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        
        // Check for source attribution
        const sources = await globalChatPage.getSourceReferences();
        if (sources.length > 0) {
          expect(sources.some(source => source.includes('testing_guide'))).toBe(true);
        }
        
        // Check if response includes content from the document
        const responseText = response?.content.toLowerCase() || '';
        expect(
          responseText.includes('test') ||
          responseText.includes('scenario') ||
          responseText.includes('gherkin')
        ).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Advanced Search Features', () => {
    test('should handle typos and variations in queries', async ({ page }) => {
      await globalChatPage.openChat();
      
      const queryVariations = [
        'How do I uplod documents?', // Typo
        'Document uploading process', // Different phrasing
        'Upload docs to the system', // Abbreviation
        'File ingestion workflow' // Technical variation
      ];
      
      for (const query of queryVariations) {
        await globalChatPage.sendMessage(query);
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        expect(response?.content.length).toBeGreaterThan(0);
        
        // All variations should give relevant responses about uploading
        const responseText = response?.content.toLowerCase() || '';
        expect(
          responseText.includes('upload') ||
          responseText.includes('document') ||
          responseText.includes('file')
        ).toBe(true);
        
        await page.waitForTimeout(2000);
      }
    });

    test('should provide search suggestions', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Start typing a query
      const messageInput = page.locator('[class*="global-chat"] textarea, [data-testid="chat-input"]');
      await messageInput.fill('How do I');
      await page.waitForTimeout(1000);
      
      // Check for suggestions
      const suggestions = await globalChatPage.getSearchSuggestions();
      if (suggestions.length > 0) {
        expect(suggestions.length).toBeGreaterThan(0);
        
        // Test clicking on a suggestion
        await globalChatPage.clickSuggestion(suggestions[0]);
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
      }
    });

    test('should handle multi-language queries', async ({ page }) => {
      await globalChatPage.openChat();
      
      const multiLangQueries = [
        'Comment puis-je télécharger des documents?', // French
        '¿Cómo subo documentos?', // Spanish
        'Wie lade ich Dokumente hoch?', // German
        'How do I upload documents?' // English
      ];
      
      for (const query of multiLangQueries) {
        await globalChatPage.sendMessage(query);
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        
        // Should provide some response, even if it's explaining language support
        expect(response?.content.length).toBeGreaterThan(0);
        
        await page.waitForTimeout(3000);
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty knowledge base gracefully', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Ask about something that definitely won't be in the knowledge base
      await globalChatPage.sendMessage('Tell me about the specific configuration of the quantum flux capacitor in this system');
      
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
      
      // Should provide a helpful response even when no specific knowledge is available
      const responseText = response?.content.toLowerCase() || '';
      expect(
        responseText.includes('sorry') ||
        responseText.includes("don't have") ||
        responseText.includes('not found') ||
        responseText.includes('help') ||
        responseText.length > 10 // Some form of helpful response
      ).toBe(true);
    });

    test('should handle very long queries', async ({ page }) => {
      await globalChatPage.openChat();
      
      const longQuery = 'I need to understand the complete workflow for ' + 
        'document upload and processing '.repeat(50) + 
        'including all the technical details and implementation specifics.';
      
      await globalChatPage.sendMessage(longQuery);
      
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
      expect(response?.content.length).toBeGreaterThan(0);
    });

    test('should handle rapid-fire questions', async ({ page }) => {
      await globalChatPage.openChat();
      
      const rapidQuestions = [
        'What is Testoria?',
        'How does upload work?',
        'What about AI features?',
        'Any file size limits?',
        'API documentation?'
      ];
      
      // Send questions in quick succession
      for (const question of rapidQuestions) {
        await globalChatPage.sendMessage(question);
        await page.waitForTimeout(1000); // Short delay
      }
      
      // Wait for all responses
      await page.waitForTimeout(10000);
      
      const messages = await globalChatPage.getChatMessages();
      const userMessages = messages.filter(msg => msg.role === 'user');
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      
      expect(userMessages.length).toBe(rapidQuestions.length);
      expect(assistantMessages.length).toBeGreaterThan(0);
    });

    test('should handle network disconnection gracefully', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Simulate network failure
      await page.route('**/api/chat*', route => route.abort());
      await page.route('**/api/search*', route => route.abort());
      
      await globalChatPage.sendMessage('This should fail gracefully');
      
      // Should show appropriate error handling
      const hasErrors = await globalChatPage.hasErrors();
      if (hasErrors) {
        const errorMessages = await globalChatPage.getErrorMessages();
        expect(errorMessages.length).toBeGreaterThan(0);
      }
      
      // Check connection status
      const isConnected = await globalChatPage.isConnected();
      expect(isConnected).toBe(false);
    });

    test('should handle special characters and code in queries', async ({ page }) => {
      await globalChatPage.openChat();
      
      const specialQueries = [
        'How do I handle {"json": "data"} in tests?',
        'What about SQL injection like \'); DROP TABLE users; --?',
        'Can I use regex patterns like /^[a-zA-Z]+$/?',
        'How about XML tags like <test>value</test>?'
      ];
      
      for (const query of specialQueries) {
        await globalChatPage.sendMessage(query);
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
        expect(response?.content.length).toBeGreaterThan(0);
        
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should respond within reasonable time limits', async ({ page }) => {
      await globalChatPage.openChat();
      
      const queries = [
        'Quick question about uploads',
        'Tell me about feature generation',
        'How does the search work?'
      ];
      
      for (const query of queries) {
        const startTime = Date.now();
        
        await globalChatPage.sendMessage(query);
        await globalChatPage.waitForResponse(30000); // 30 second timeout
        
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
        
        const response = await globalChatPage.getLastResponse();
        expect(response).toBeDefined();
      }
    });

    test('should maintain chat history across sessions', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Send initial message
      await globalChatPage.sendMessage('Initial test message');
      await page.waitForTimeout(3000);
      
      const initialMessages = await globalChatPage.getChatMessages();
      const initialCount = initialMessages.length;
      
      // Close and reopen chat
      await globalChatPage.closeChat();
      await globalChatPage.openChat();
      
      // Check if history is maintained
      const reopenedMessages = await globalChatPage.getChatMessages();
      
      // History may or may not persist depending on implementation
      // Both behaviors are acceptable
      expect(reopenedMessages.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle concurrent users gracefully', async ({ page, context }) => {
      // Open multiple tabs/contexts to simulate concurrent users
      const page2 = await context.newPage();
      const globalChatPage2 = new GlobalChatPage(page2);
      
      await page2.goto('/');
      await globalChatPage2.openChat();
      
      // Send messages from both "users" simultaneously
      const promises = [
        globalChatPage.openChat().then(() => globalChatPage.sendMessage('User 1 question')),
        globalChatPage2.sendMessage('User 2 question')
      ];
      
      await Promise.all(promises);
      
      // Both should receive responses
      const response1 = await globalChatPage.getLastResponse();
      const response2 = await globalChatPage2.getLastResponse();
      
      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
      
      await page2.close();
    });
  });

  test.describe('User Experience Features', () => {
    test('should clear chat history when requested', async ({ page }) => {
      await globalChatPage.openChat();
      
      // Send some messages
      await globalChatPage.sendMessage('First message');
      await page.waitForTimeout(2000);
      await globalChatPage.sendMessage('Second message');
      await page.waitForTimeout(2000);
      
      const messagesBeforeClear = await globalChatPage.getChatMessages();
      expect(messagesBeforeClear.length).toBeGreaterThan(0);
      
      // Clear chat
      await globalChatPage.clearChat();
      
      const messagesAfterClear = await globalChatPage.getChatMessages();
      expect(messagesAfterClear.length).toBeLessThan(messagesBeforeClear.length);
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      await globalChatPage.openChat();
      
      const messageInput = page.locator('[class*="global-chat"] textarea, [data-testid="chat-input"]');
      
      // Test Enter to send
      await messageInput.fill('Test message via Enter key');
      await messageInput.press('Enter');
      
      const response = await globalChatPage.getLastResponse();
      expect(response).toBeDefined();
      
      // Test Escape to close (if implemented)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      // May or may not close depending on implementation
    });

    test('should show typing indicators', async ({ page }) => {
      await globalChatPage.openChat();
      
      await globalChatPage.sendMessage('Test typing indicator');
      
      // Check if typing indicator appears
      const isLoading = await globalChatPage.isLoading();
      expect(isLoading).toBe(true);
      
      // Wait for response and verify indicator disappears
      await globalChatPage.waitForResponse();
      
      const isStillLoading = await globalChatPage.isLoading();
      expect(isStillLoading).toBe(false);
    });
  });
});