/**
 * Global Chat Page Object Model
 * 
 * Represents the floating QA Genie chat functionality for semantic search
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface QAChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  confidence?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;
  metadata?: Record<string, any>;
}

export class GlobalChatPage extends BasePage {
  // Chat trigger and container elements
  private readonly qaGenieButton: Locator;
  private readonly chatContainer: Locator;
  private readonly chatOverlay: Locator;
  private readonly closeButton: Locator;
  private readonly minimizeButton: Locator;
  private readonly expandButton: Locator;

  // Chat interface elements
  private readonly chatMessages: Locator;
  private readonly userMessages: Locator;
  private readonly assistantMessages: Locator;
  private readonly messageInput: Locator;
  private readonly sendButton: Locator;
  private readonly typingIndicator: Locator;

  // Search and knowledge base elements
  private readonly searchSuggestions: Locator;
  private readonly searchResults: Locator;
  private readonly sourceReferences: Locator;
  private readonly confidenceIndicator: Locator;
  private readonly knowledgeBase: Locator;

  // Chat controls and options
  private readonly clearChatButton: Locator;
  private readonly chatHistory: Locator;
  private readonly contextToggle: Locator;
  private readonly sourceToggle: Locator;
  private readonly settingsButton: Locator;

  // Status and feedback elements
  private readonly connectionStatus: Locator;
  private readonly errorMessages: Locator;
  private readonly successMessages: Locator;
  private readonly loadingSpinners: Locator;

  constructor(page: Page) {
    super(page);
    
    // Chat trigger and container
    this.qaGenieButton = page.locator('button[aria-label="Open QA Genie"], button:has-text("QA Genie")');
    this.chatContainer = page.locator('[class*="global-chat"], [data-testid="global-chat"]');
    this.chatOverlay = page.locator('[class*="chat-overlay"], [class*="floating-chat"]');
    this.closeButton = page.locator('[aria-label="Close chat"], button:has-text("✕")');
    this.minimizeButton = page.locator('[aria-label="Minimize chat"], button:has-text("−")');
    this.expandButton = page.locator('[aria-label="Expand chat"], button:has-text("↗")');

    // Chat interface
    this.chatMessages = page.locator('[class*="chat-message"], [data-testid="chat-message"]');
    this.userMessages = page.locator('[class*="user-message"], [data-testid="user-message"]');
    this.assistantMessages = page.locator('[class*="assistant-message"], [data-testid="assistant-message"]');
    this.messageInput = page.locator('[class*="global-chat"] textarea, [data-testid="chat-input"]');
    this.sendButton = page.locator('[class*="global-chat"] button:has-text("Send"), [data-testid="send-button"]');
    this.typingIndicator = page.locator('[class*="typing"], [data-testid="typing-indicator"]');

    // Search and knowledge base
    this.searchSuggestions = page.locator('[class*="suggestion"], [data-testid="search-suggestion"]');
    this.searchResults = page.locator('[class*="search-result"], [data-testid="search-result"]');
    this.sourceReferences = page.locator('[class*="source"], [data-testid="source-reference"]');
    this.confidenceIndicator = page.locator('[class*="confidence"], [data-testid="confidence-score"]');
    this.knowledgeBase = page.locator('[class*="knowledge"], [data-testid="knowledge-base"]');

    // Chat controls
    this.clearChatButton = page.locator('button:has-text("Clear"), button[aria-label*="clear"]');
    this.chatHistory = page.locator('[class*="history"], [data-testid="chat-history"]');
    this.contextToggle = page.locator('[class*="context-toggle"], input[type="checkbox"][name*="context"]');
    this.sourceToggle = page.locator('[class*="source-toggle"], input[type="checkbox"][name*="source"]');
    this.settingsButton = page.locator('button[aria-label*="settings"], button:has-text("⚙")');

    // Status elements
    this.connectionStatus = page.locator('[class*="connection"], [data-testid="connection-status"]');
    this.errorMessages = page.locator('[class*="error"], [role="alert"]');
    this.successMessages = page.locator('[class*="success"], [class*="notification"]');
    this.loadingSpinners = page.locator('[class*="loading"], [class*="spinner"]');
  }

  /**
   * Navigate to any page (Global Chat is available everywhere)
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.qaGenieButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Open QA Genie chat
   */
  async openChat(): Promise<void> {
    if (await this.qaGenieButton.isVisible()) {
      await this.qaGenieButton.click();
      await this.chatContainer.waitFor({ state: 'visible', timeout: 5000 });
      await this.page.waitForTimeout(1000); // Wait for animation
    }
  }

  /**
   * Close QA Genie chat
   */
  async closeChat(): Promise<void> {
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
      await this.chatContainer.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  /**
   * Minimize chat window
   */
  async minimizeChat(): Promise<void> {
    if (await this.minimizeButton.isVisible()) {
      await this.minimizeButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Expand chat window
   */
  async expandChat(): Promise<void> {
    if (await this.expandButton.isVisible()) {
      await this.expandButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Check if chat is open
   */
  async isChatOpen(): Promise<boolean> {
    return await this.chatContainer.isVisible();
  }

  /**
   * Send a message to QA Genie
   */
  async sendMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    await this.waitForResponse();
  }

  /**
   * Wait for AI response
   */
  async waitForResponse(timeout: number = 30000): Promise<void> {
    // Wait for typing indicator to appear and disappear
    try {
      await this.typingIndicator.waitFor({ state: 'visible', timeout: 5000 });
      await this.typingIndicator.waitFor({ state: 'hidden', timeout });
    } catch {
      // Typing indicator might not be visible
    }
    
    // Wait for new assistant message
    await this.assistantMessages.last().waitFor({ state: 'visible', timeout });
  }

  /**
   * Get all chat messages
   */
  async getChatMessages(): Promise<QAChatMessage[]> {
    const messages: QAChatMessage[] = [];
    const messageCount = await this.chatMessages.count();
    
    for (let i = 0; i < messageCount; i++) {
      const messageElement = this.chatMessages.nth(i);
      const isUserMessage = await messageElement.locator('[class*="user"]').count() > 0;
      
      // Get sources if available
      const sourcesElement = messageElement.locator('[class*="source"], [data-testid="sources"]');
      const sources: string[] = [];
      if (await sourcesElement.count() > 0) {
        const sourceCount = await sourcesElement.count();
        for (let j = 0; j < sourceCount; j++) {
          const sourceText = await sourcesElement.nth(j).textContent();
          if (sourceText) sources.push(sourceText.trim());
        }
      }

      // Get confidence score if available
      const confidenceElement = messageElement.locator('[class*="confidence"], [data-testid="confidence"]');
      let confidence: number | undefined;
      if (await confidenceElement.count() > 0) {
        const confidenceText = await confidenceElement.textContent();
        if (confidenceText) {
          const confidenceMatch = confidenceText.match(/(\d+(?:\.\d+)?)/);
          if (confidenceMatch) {
            confidence = parseFloat(confidenceMatch[1]);
          }
        }
      }
      
      const message: QAChatMessage = {
        id: await messageElement.getAttribute('data-id') || `msg-${i}`,
        role: isUserMessage ? 'user' : 'assistant',
        content: await messageElement.textContent() || '',
        timestamp: await messageElement.getAttribute('data-timestamp') || new Date().toISOString(),
        sources: sources.length > 0 ? sources : undefined,
        confidence
      };
      
      messages.push(message);
    }
    
    return messages;
  }

  /**
   * Get the last assistant response
   */
  async getLastResponse(): Promise<QAChatMessage | null> {
    const messages = await this.getChatMessages();
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
  }

  /**
   * Clear chat history
   */
  async clearChat(): Promise<void> {
    if (await this.clearChatButton.isVisible()) {
      await this.clearChatButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query: string): Promise<SearchResult[]> {
    await this.sendMessage(query);
    await this.page.waitForTimeout(3000);
    
    const results: SearchResult[] = [];
    const resultCount = await this.searchResults.count();
    
    for (let i = 0; i < resultCount; i++) {
      const resultElement = this.searchResults.nth(i);
      const result: SearchResult = {
        id: await resultElement.getAttribute('data-id') || `result-${i}`,
        title: await resultElement.locator('[class*="title"], [data-testid="result-title"]').textContent() || '',
        content: await resultElement.locator('[class*="content"], [data-testid="result-content"]').textContent() || '',
        source: await resultElement.locator('[class*="source"], [data-testid="result-source"]').textContent() || '',
        relevance: await this.extractRelevanceScore(resultElement),
        metadata: await this.extractMetadata(resultElement)
      };
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(): Promise<string[]> {
    const suggestions: string[] = [];
    const suggestionCount = await this.searchSuggestions.count();
    
    for (let i = 0; i < suggestionCount; i++) {
      const suggestionText = await this.searchSuggestions.nth(i).textContent();
      if (suggestionText) {
        suggestions.push(suggestionText.trim());
      }
    }
    
    return suggestions;
  }

  /**
   * Click on a search suggestion
   */
  async clickSuggestion(suggestion: string): Promise<void> {
    const suggestionElement = this.searchSuggestions.filter({ hasText: suggestion }).first();
    if (await suggestionElement.isVisible()) {
      await suggestionElement.click();
      await this.waitForResponse();
    }
  }

  /**
   * Get source references from last response
   */
  async getSourceReferences(): Promise<string[]> {
    const sources: string[] = [];
    const sourceCount = await this.sourceReferences.count();
    
    for (let i = 0; i < sourceCount; i++) {
      const sourceText = await this.sourceReferences.nth(i).textContent();
      if (sourceText) {
        sources.push(sourceText.trim());
      }
    }
    
    return sources;
  }

  /**
   * Get confidence score of last response
   */
  async getConfidenceScore(): Promise<number | null> {
    if (await this.confidenceIndicator.isVisible()) {
      const confidenceText = await this.confidenceIndicator.textContent();
      if (confidenceText) {
        const match = confidenceText.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
      }
    }
    return null;
  }

  /**
   * Toggle context usage
   */
  async toggleContext(enabled: boolean): Promise<void> {
    if (await this.contextToggle.isVisible()) {
      const isChecked = await this.contextToggle.isChecked();
      if (isChecked !== enabled) {
        await this.contextToggle.click();
      }
    }
  }

  /**
   * Toggle source references
   */
  async toggleSources(enabled: boolean): Promise<void> {
    if (await this.sourceToggle.isVisible()) {
      const isChecked = await this.sourceToggle.isChecked();
      if (isChecked !== enabled) {
        await this.sourceToggle.click();
      }
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<string> {
    if (await this.connectionStatus.isVisible()) {
      return await this.connectionStatus.textContent() || '';
    }
    return 'unknown';
  }

  /**
   * Check if chat is connected
   */
  async isConnected(): Promise<boolean> {
    const status = await this.getConnectionStatus();
    return status.toLowerCase().includes('connected') || status.toLowerCase().includes('online');
  }

  /**
   * Check for errors
   */
  async hasErrors(): Promise<boolean> {
    return await this.errorMessages.count() > 0;
  }

  /**
   * Get error messages
   */
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

  /**
   * Check if chat is loading/processing
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinners.count() > 0 || await this.typingIndicator.isVisible();
  }

  /**
   * Test semantic search capabilities
   */
  async testSemanticSearch(queries: string[]): Promise<{
    query: string;
    hasResults: boolean;
    relevantResults: number;
    sources: string[];
    confidence?: number;
  }[]> {
    const results = [];
    
    for (const query of queries) {
      await this.sendMessage(query);
      await this.page.waitForTimeout(3000);
      
      const lastResponse = await this.getLastResponse();
      const sources = await this.getSourceReferences();
      const confidence = await this.getConfidenceScore();
      
      results.push({
        query,
        hasResults: !!lastResponse && lastResponse.content.length > 0,
        relevantResults: sources.length,
        sources,
        confidence: confidence || undefined
      });
      
      await this.page.waitForTimeout(1000); // Delay between queries
    }
    
    return results;
  }

  /**
   * Test contextual conversation
   */
  async testContextualConversation(conversation: string[]): Promise<{
    maintains_context: boolean;
    responses: QAChatMessage[];
  }> {
    await this.clearChat(); // Start fresh
    const responses: QAChatMessage[] = [];
    
    for (const message of conversation) {
      await this.sendMessage(message);
      await this.page.waitForTimeout(3000);
      
      const lastResponse = await this.getLastResponse();
      if (lastResponse) {
        responses.push(lastResponse);
      }
    }
    
    // Simple heuristic to check if context is maintained
    // Look for references to previous topics in later responses
    let maintainsContext = false;
    if (responses.length > 1) {
      const firstTopics = this.extractTopics(responses[0].content);
      for (let i = 1; i < responses.length; i++) {
        const currentResponse = responses[i].content.toLowerCase();
        for (const topic of firstTopics) {
          if (currentResponse.includes(topic.toLowerCase())) {
            maintainsContext = true;
            break;
          }
        }
        if (maintainsContext) break;
      }
    }
    
    return {
      maintains_context: maintainsContext,
      responses
    };
  }

  /**
   * Responsive design checks
   */
  async checkMobileLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
    
    if (await this.isChatOpen()) {
      return await this.messageInput.isVisible() && await this.sendButton.isVisible();
    } else {
      return await this.qaGenieButton.isVisible();
    }
  }

  async checkTabletLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.waitForTimeout(500);
    
    if (await this.isChatOpen()) {
      return await this.chatContainer.isVisible() && await this.messageInput.isVisible();
    } else {
      return await this.qaGenieButton.isVisible();
    }
  }

  /**
   * Private helper methods
   */
  private async extractRelevanceScore(element: Locator): Promise<number> {
    const relevanceElement = element.locator('[class*="relevance"], [data-testid="relevance"]');
    if (await relevanceElement.count() > 0) {
      const relevanceText = await relevanceElement.textContent();
      if (relevanceText) {
        const match = relevanceText.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      }
    }
    return 0;
  }

  private async extractMetadata(element: Locator): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};
    const metadataElement = element.locator('[class*="metadata"], [data-testid="metadata"]');
    
    if (await metadataElement.count() > 0) {
      const metadataText = await metadataElement.textContent();
      if (metadataText) {
        // Simple metadata extraction - implementation may vary
        const pairs = metadataText.split(',');
        for (const pair of pairs) {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            metadata[key] = value;
          }
        }
      }
    }
    
    return metadata;
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - looks for nouns and key terms
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => 
      word.length > 3 && 
      !commonWords.includes(word) && 
      /^[a-z]+$/.test(word)
    ).slice(0, 5); // Return top 5 topics
  }
}

export default GlobalChatPage;