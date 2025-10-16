/**
 * Feature Generator Page Object Model
 * 
 * Represents the AI-powered feature generation functionality with Monaco Editor
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface FeatureFile {
  id: string;
  title: string;
  content: string;
  category: string;
  createdDate: string;
  lastModified: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class FeatureGeneratorPage extends BasePage {
  // Main layout elements
  private readonly chatInterface: Locator;
  private readonly livePreview: Locator;
  private readonly featureManagement: Locator;

  // Chat interface elements
  private readonly chatContainer: Locator;
  private readonly messageInput: Locator;
  private readonly sendButton: Locator;
  private readonly chatMessages: Locator;
  private readonly userMessages: Locator;
  private readonly assistantMessages: Locator;
  private readonly typingIndicator: Locator;

  // Monaco Editor elements
  private readonly monacoEditor: Locator;
  private readonly editorContent: Locator;
  private readonly syntaxHighlighting: Locator;
  private readonly editorLineNumbers: Locator;
  private readonly gherkinKeywords: Locator;

  // Live preview elements
  private readonly previewContainer: Locator;
  private readonly previewContent: Locator;
  private readonly expandPreviewButton: Locator;
  private readonly copyPreviewButton: Locator;
  private readonly downloadPreviewButton: Locator;

  // Feature management elements
  private readonly featureFilesList: Locator;
  private readonly generatedFeaturesCategory: Locator;
  private readonly importedFeaturesCategory: Locator;
  private readonly featureItems: Locator;
  private readonly createNewFeatureButton: Locator;
  private readonly saveFeatureButton: Locator;
  private readonly editFeatureButton: Locator;
  private readonly deleteFeatureButton: Locator;

  // Feature file actions
  private readonly editModal: Locator;
  private readonly deleteConfirmModal: Locator;
  private readonly featureTitleInput: Locator;
  private readonly featureContentEditor: Locator;
  private readonly modalSaveButton: Locator;
  private readonly modalCancelButton: Locator;
  private readonly modalConfirmButton: Locator;

  // AI generation controls
  private readonly generateButton: Locator;
  private readonly regenerateButton: Locator;
  private readonly improveButton: Locator;
  private readonly templateSelector: Locator;
  private readonly complexitySelector: Locator;

  // Status and feedback elements
  private readonly generationStatus: Locator;
  private readonly errorMessages: Locator;
  private readonly successMessages: Locator;
  private readonly loadingSpinners: Locator;

  constructor(page: Page) {
    super(page);
    
    // Main layout
    this.chatInterface = page.locator('[class*="chat"], [data-testid="chat-interface"]');
    this.livePreview = page.locator('[class*="preview"], [data-testid="live-preview"]');
    this.featureManagement = page.locator('[class*="feature-management"], [data-testid="feature-management"]');

    // Chat interface
    this.chatContainer = page.locator('[class*="chat-container"], [data-testid="chat-container"]');
    this.messageInput = page.locator('textarea[placeholder*="message"], input[placeholder*="Ask"]');
    this.sendButton = page.locator('button:has-text("Send"), button[aria-label*="send"]');
    this.chatMessages = page.locator('[class*="message"], [data-testid="chat-message"]');
    this.userMessages = page.locator('[class*="user-message"], [data-testid="user-message"]');
    this.assistantMessages = page.locator('[class*="assistant-message"], [data-testid="assistant-message"]');
    this.typingIndicator = page.locator('[class*="typing"], [data-testid="typing-indicator"]');

    // Monaco Editor
    this.monacoEditor = page.locator('.monaco-editor, [data-testid="monaco-editor"]');
    this.editorContent = page.locator('.monaco-editor .view-lines');
    this.syntaxHighlighting = page.locator('.monaco-editor .token');
    this.editorLineNumbers = page.locator('.monaco-editor .line-numbers');
    this.gherkinKeywords = page.locator('.monaco-editor .token.keyword');

    // Live preview
    this.previewContainer = page.locator('[class*="preview-container"], [data-testid="preview-container"]');
    this.previewContent = page.locator('[class*="preview-content"], [data-testid="preview-content"]');
    this.expandPreviewButton = page.locator('button:has-text("Expand"), button[aria-label*="expand"]');
    this.copyPreviewButton = page.locator('button:has-text("Copy"), button[aria-label*="copy"]');
    this.downloadPreviewButton = page.locator('button:has-text("Download"), button[aria-label*="download"]');

    // Feature management
    this.featureFilesList = page.locator('[class*="feature-list"], [data-testid="feature-list"]');
    this.generatedFeaturesCategory = page.locator('[data-testid="generated-features"]');
    this.importedFeaturesCategory = page.locator('[data-testid="imported-features"]');
    this.featureItems = page.locator('[class*="feature-item"], [data-testid="feature-item"]');
    this.createNewFeatureButton = page.locator('button:has-text("New Feature"), button:has-text("Create")');
    this.saveFeatureButton = page.locator('button:has-text("Save"), button[type="submit"]');
    this.editFeatureButton = page.locator('button:has-text("Edit"), button[aria-label*="edit"]');
    this.deleteFeatureButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]');

    // Modals
    this.editModal = page.locator('[role="dialog"], [class*="modal"]');
    this.deleteConfirmModal = page.locator('[role="dialog"]:has-text("Delete"), [class*="confirm"]');
    this.featureTitleInput = page.locator('input[placeholder*="title"], input[name*="title"]');
    this.featureContentEditor = page.locator('textarea[placeholder*="content"], [data-testid="feature-editor"]');
    this.modalSaveButton = page.locator('[role="dialog"] button:has-text("Save")');
    this.modalCancelButton = page.locator('[role="dialog"] button:has-text("Cancel")');
    this.modalConfirmButton = page.locator('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Delete")');

    // AI generation controls
    this.generateButton = page.locator('button:has-text("Generate"), button[data-testid="generate-button"]');
    this.regenerateButton = page.locator('button:has-text("Regenerate")');
    this.improveButton = page.locator('button:has-text("Improve")');
    this.templateSelector = page.locator('select[name*="template"], [data-testid="template-selector"]');
    this.complexitySelector = page.locator('select[name*="complexity"], [data-testid="complexity-selector"]');

    // Status elements
    this.generationStatus = page.locator('[class*="status"], [data-testid="generation-status"]');
    this.errorMessages = page.locator('[class*="error"], [role="alert"]');
    this.successMessages = page.locator('[class*="success"], [class*="notification"]');
    this.loadingSpinners = page.locator('[class*="loading"], [class*="spinner"]');
  }

  /**
   * Navigate to Feature Generator page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
    await this.navigateToFeatureGenerator();
  }

  /**
   * Navigate to Feature Generator tab from main navigation
   */
  async navigateToFeatureGenerator(): Promise<void> {
    const featureGeneratorButton = this.page.locator('button:has-text("Test Features Generator")');
    await featureGeneratorButton.click();
    await this.waitForPageReady();
  }

  /**
   * Wait for Feature Generator page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    // Wait for main interface elements to load
    await Promise.race([
      this.chatInterface.waitFor({ state: 'visible', timeout: 10000 }),
      this.messageInput.waitFor({ state: 'visible', timeout: 10000 }),
      this.featureFilesList.waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }

  /**
   * Chat interface functionality
   */
  async sendChatMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    
    // Wait for response
    await this.waitForChatResponse();
  }

  async waitForChatResponse(timeout: number = 30000): Promise<void> {
    // Wait for typing indicator to appear and disappear
    try {
      await this.typingIndicator.waitFor({ state: 'visible', timeout: 5000 });
      await this.typingIndicator.waitFor({ state: 'hidden', timeout });
    } catch {
      // Typing indicator might not be visible, wait for new message instead
    }
    
    // Wait for new assistant message
    await this.assistantMessages.last().waitFor({ state: 'visible', timeout });
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    const messages: ChatMessage[] = [];
    const messageCount = await this.chatMessages.count();
    
    for (let i = 0; i < messageCount; i++) {
      const messageElement = this.chatMessages.nth(i);
      const isUserMessage = await messageElement.locator('[class*="user"]').count() > 0;
      
      const message: ChatMessage = {
        role: isUserMessage ? 'user' : 'assistant',
        content: await messageElement.textContent() || '',
        timestamp: await messageElement.getAttribute('data-timestamp') || new Date().toISOString()
      };
      
      messages.push(message);
    }
    
    return messages;
  }

  async clearChatHistory(): Promise<void> {
    const clearButton = this.page.locator('button:has-text("Clear"), button[aria-label*="clear"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Monaco Editor functionality
   */
  async getEditorContent(): Promise<string> {
    if (await this.monacoEditor.isVisible()) {
      return await this.monacoEditor.evaluate((editor) => {
        const monacoInstance = (window as any).monaco;
        if (monacoInstance) {
          const model = monacoInstance.editor.getModels()[0];
          return model ? model.getValue() : '';
        }
        return '';
      });
    }
    return '';
  }

  async setEditorContent(content: string): Promise<void> {
    if (await this.monacoEditor.isVisible()) {
      await this.monacoEditor.evaluate((editor, content) => {
        const monacoInstance = (window as any).monaco;
        if (monacoInstance) {
          const model = monacoInstance.editor.getModels()[0];
          if (model) {
            model.setValue(content);
          }
        }
      }, content);
    }
  }

  async formatEditorContent(): Promise<void> {
    await this.page.keyboard.press('Shift+Alt+F'); // Standard Monaco formatting shortcut
    await this.page.waitForTimeout(500);
  }

  async validateGherkinSyntax(): Promise<boolean> {
    // Check for syntax highlighting of Gherkin keywords
    const keywordCount = await this.gherkinKeywords.count();
    return keywordCount > 0;
  }

  async getEditorErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorMarkers = this.page.locator('.monaco-editor .error-marker, .monaco-editor .squiggly-error');
    const errorCount = await errorMarkers.count();
    
    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorMarkers.nth(i).getAttribute('title');
      if (errorText) {
        errors.push(errorText);
      }
    }
    
    return errors;
  }

  /**
   * Live preview functionality
   */
  async getPreviewContent(): Promise<string> {
    await this.previewContent.waitFor({ state: 'visible', timeout: 5000 });
    return await this.previewContent.textContent() || '';
  }

  async expandPreview(): Promise<void> {
    if (await this.expandPreviewButton.isVisible()) {
      await this.expandPreviewButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async copyPreviewContent(): Promise<void> {
    if (await this.copyPreviewButton.isVisible()) {
      await this.copyPreviewButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async downloadPreview(): Promise<string> {
    if (await this.downloadPreviewButton.isVisible()) {
      return await this.downloadFile(this.downloadPreviewButton.toString());
    }
    throw new Error('Download preview button not found');
  }

  /**
   * Feature management functionality
   */
  async getFeatureFiles(): Promise<FeatureFile[]> {
    const features: FeatureFile[] = [];
    const featureCount = await this.featureItems.count();
    
    for (let i = 0; i < featureCount; i++) {
      const item = this.featureItems.nth(i);
      const feature: FeatureFile = {
        id: await item.getAttribute('data-id') || `feature-${i}`,
        title: await item.locator('[class*="title"], [data-testid="feature-title"]').textContent() || '',
        content: await item.getAttribute('data-content') || '',
        category: await item.getAttribute('data-category') || 'generated',
        createdDate: await item.locator('[class*="date"], [data-testid="created-date"]').textContent() || '',
        lastModified: await item.locator('[class*="modified"], [data-testid="last-modified"]').textContent() || ''
      };
      features.push(feature);
    }
    
    return features;
  }

  async createNewFeature(title: string, content: string): Promise<void> {
    await this.createNewFeatureButton.click();
    await this.editModal.waitFor({ state: 'visible' });
    
    await this.featureTitleInput.fill(title);
    await this.featureContentEditor.fill(content);
    
    await this.modalSaveButton.click();
    await this.editModal.waitFor({ state: 'hidden' });
    
    // Wait for feature to appear in list
    await this.page.waitForTimeout(2000);
  }

  async editFeature(featureTitle: string, newTitle: string, newContent: string): Promise<void> {
    const featureItem = this.page.locator(`[data-testid="feature-item"]:has-text("${featureTitle}")`);
    const editButton = featureItem.locator('button:has-text("Edit")');
    
    await editButton.click();
    await this.editModal.waitFor({ state: 'visible' });
    
    await this.featureTitleInput.clear();
    await this.featureTitleInput.fill(newTitle);
    
    await this.featureContentEditor.clear();
    await this.featureContentEditor.fill(newContent);
    
    await this.modalSaveButton.click();
    await this.editModal.waitFor({ state: 'hidden' });
  }

  async deleteFeature(featureTitle: string): Promise<void> {
    const featureItem = this.page.locator(`[data-testid="feature-item"]:has-text("${featureTitle}")`);
    const deleteButton = featureItem.locator('button:has-text("Delete")');
    
    await deleteButton.click();
    await this.deleteConfirmModal.waitFor({ state: 'visible' });
    
    await this.modalConfirmButton.click();
    await this.deleteConfirmModal.waitFor({ state: 'hidden' });
    
    // Wait for feature to be removed from list
    await this.page.waitForTimeout(2000);
  }

  async searchFeatures(query: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(1000);
    }
  }

  async filterFeaturesByCategory(category: 'generated' | 'imported' | 'all'): Promise<void> {
    switch (category) {
      case 'generated':
        if (await this.generatedFeaturesCategory.isVisible()) {
          await this.generatedFeaturesCategory.click();
        }
        break;
      case 'imported':
        if (await this.importedFeaturesCategory.isVisible()) {
          await this.importedFeaturesCategory.click();
        }
        break;
      case 'all':
        // Click a button that shows all features
        const allFeaturesButton = this.page.locator('button:has-text("All Features")');
        if (await allFeaturesButton.isVisible()) {
          await allFeaturesButton.click();
        }
        break;
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * AI generation functionality
   */
  async generateFeatureFromPrompt(prompt: string, options?: {
    template?: string;
    complexity?: string;
  }): Promise<void> {
    // Set template if provided
    if (options?.template && await this.templateSelector.isVisible()) {
      await this.templateSelector.selectOption(options.template);
    }
    
    // Set complexity if provided
    if (options?.complexity && await this.complexitySelector.isVisible()) {
      await this.complexitySelector.selectOption(options.complexity);
    }
    
    // Send prompt
    await this.sendChatMessage(prompt);
    
    // Wait for generation to complete
    await this.waitForGenerationComplete();
  }

  async regenerateFeature(): Promise<void> {
    if (await this.regenerateButton.isVisible()) {
      await this.regenerateButton.click();
      await this.waitForGenerationComplete();
    }
  }

  async improveFeature(improvementPrompt: string): Promise<void> {
    if (await this.improveButton.isVisible()) {
      await this.improveButton.click();
      await this.sendChatMessage(improvementPrompt);
      await this.waitForGenerationComplete();
    }
  }

  async waitForGenerationComplete(timeout: number = 60000): Promise<void> {
    // Wait for loading spinner to appear and disappear
    try {
      await this.loadingSpinners.waitFor({ state: 'visible', timeout: 5000 });
      await this.loadingSpinners.waitFor({ state: 'hidden', timeout });
    } catch {
      // Spinner might not be visible, check for other completion indicators
    }
    
    // Wait for status message or preview content to update
    await Promise.race([
      this.successMessages.waitFor({ state: 'visible', timeout: 10000 }),
      this.previewContent.waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }

  /**
   * Layout and responsiveness checks
   */
  async checkTwoColumnLayout(): Promise<boolean> {
    const chatVisible = await this.chatInterface.isVisible();
    const previewVisible = await this.livePreview.isVisible();
    const managementVisible = await this.featureManagement.isVisible();
    
    return chatVisible && previewVisible && managementVisible;
  }

  async checkMobileLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
    
    // In mobile, elements might be stacked or hidden
    const messageInputVisible = await this.messageInput.isVisible();
    const sendButtonVisible = await this.sendButton.isVisible();
    
    return messageInputVisible && sendButtonVisible;
  }

  async checkTabletLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.waitForTimeout(500);
    
    return await this.checkTwoColumnLayout();
  }

  /**
   * Error handling and status checks
   */
  async getGenerationStatus(): Promise<string> {
    if (await this.generationStatus.isVisible()) {
      return await this.generationStatus.textContent() || '';
    }
    return '';
  }

  async hasGenerationErrors(): Promise<boolean> {
    return await this.errorMessages.count() > 0;
  }

  async getErrorMessages(): Promise<string[]> {
    const messages: string[] = [];
    const errorCount = await this.errorMessages.count();
    
    for (let i = 0; i < errorCount; i++) {
      const message = await this.errorMessages.nth(i).textContent();
      if (message) {
        messages.push(message.trim());
      }
    }
    
    return messages;
  }

  async isGenerationInProgress(): Promise<boolean> {
    return await this.loadingSpinners.count() > 0 || await this.typingIndicator.isVisible();
  }

  /**
   * Performance and accessibility checks
   */
  async measureGenerationTime(prompt: string): Promise<number> {
    const startTime = Date.now();
    await this.generateFeatureFromPrompt(prompt);
    return Date.now() - startTime;
  }

  async checkAccessibilityFeatures(): Promise<{
    hasAriaLabels: boolean;
    hasKeyboardNavigation: boolean;
    hasScreenReaderSupport: boolean;
  }> {
    const hasAriaLabels = await this.sendButton.getAttribute('aria-label') !== null;
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').count();
    const hasKeyboardNavigation = focusedElement > 0;
    
    // Check for screen reader support (ARIA attributes)
    const hasScreenReaderSupport = await this.page.locator('[role], [aria-label], [aria-describedby]').count() > 0;
    
    return {
      hasAriaLabels,
      hasKeyboardNavigation,
      hasScreenReaderSupport
    };
  }
}

export default FeatureGeneratorPage;