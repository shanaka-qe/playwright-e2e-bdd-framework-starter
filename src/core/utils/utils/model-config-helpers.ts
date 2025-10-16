import { Page, expect } from '@playwright/test';

export interface ModelConfig {
  chatModel: string;
  embeddingModel: string;
}

export class ModelConfigHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the Settings page and wait for it to load
   */
  async navigateToSettings() {
    await this.page.click('button:has-text("⚙️ Settings")');
    await this.page.waitForSelector('h2:has-text("Settings")');
    
    // Wait for model configuration to load
    await this.page.waitForSelector('#chatModel');
    await this.page.waitForSelector('#embeddingModel');
    
    // Wait for dropdowns to be populated with options
    await this.page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
  }

  /**
   * Get current model configuration from the UI
   */
  async getCurrentModelConfig(): Promise<ModelConfig> {
    const chatModel = await this.page.locator('#chatModel').inputValue();
    const embeddingModel = await this.page.locator('#embeddingModel').inputValue();
    
    return {
      chatModel,
      embeddingModel
    };
  }

  /**
   * Set model configuration in the UI
   */
  async setModelConfig(config: ModelConfig) {
    await this.page.locator('#chatModel').selectOption(config.chatModel);
    await this.page.locator('#embeddingModel').selectOption(config.embeddingModel);
  }

  /**
   * Save model configuration and wait for success
   */
  async saveModelConfig() {
    await this.page.locator('button:has-text("Save Model Configuration")').click();
    await expect(this.page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
  }

  /**
   * Verify model configuration matches expected values
   */
  async verifyModelConfig(expectedConfig: ModelConfig) {
    await expect(this.page.locator('#chatModel')).toHaveValue(expectedConfig.chatModel);
    await expect(this.page.locator('#embeddingModel')).toHaveValue(expectedConfig.embeddingModel);
  }

  /**
   * Reset to default (cheaper) models
   */
  async resetToDefaultModels() {
    const defaultConfig: ModelConfig = {
      chatModel: 'gpt-3.5-turbo',
      embeddingModel: 'text-embedding-ada-002'
    };
    
    await this.setModelConfig(defaultConfig);
    await this.saveModelConfig();
  }

  /**
   * Set to premium models
   */
  async setToPremiumModels() {
    const premiumConfig: ModelConfig = {
      chatModel: 'gpt-4',
      embeddingModel: 'text-embedding-3-small'
    };
    
    await this.setModelConfig(premiumConfig);
    await this.saveModelConfig();
  }

  /**
   * Verify cost optimization information is displayed
   */
  async verifyCostOptimizationInfo() {
    await expect(this.page.locator('h4:has-text("Cost Optimization")')).toBeVisible();
    await expect(this.page.locator('text=Default (Cheaper): GPT-3.5 Turbo + Ada-002 embeddings')).toBeVisible();
    await expect(this.page.locator('text=Premium: GPT-4 + Text-Embedding-3-Small')).toBeVisible();
    await expect(this.page.locator('text=~20x cost savings')).toBeVisible();
  }

  /**
   * Verify dropdown options are available
   */
  async verifyDropdownOptions() {
    // Wait for dropdowns to be populated
    await this.page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
    
    // Check chat model options by examining the select element
    const chatModelSelect = this.page.locator('#chatModel');
    const chatOptions = await chatModelSelect.locator('option').all();
    expect(chatOptions.length).toBeGreaterThanOrEqual(2);
    
    // Check embedding model options
    const embeddingModelSelect = this.page.locator('#embeddingModel');
    const embeddingOptions = await embeddingModelSelect.locator('option').all();
    expect(embeddingOptions.length).toBeGreaterThanOrEqual(2);
  }

  /**
   * Verify dropdown styling is correct
   */
  async verifyDropdownStyling() {
    const chatModelSelect = this.page.locator('#chatModel');
    const embeddingModelSelect = this.page.locator('#embeddingModel');
    
    // Verify styling classes
    await expect(chatModelSelect).toHaveClass(/bg-white/);
    await expect(chatModelSelect).toHaveClass(/text-gray-900/);
    await expect(embeddingModelSelect).toHaveClass(/bg-white/);
    await expect(embeddingModelSelect).toHaveClass(/text-gray-900/);
    
    // Verify they are enabled and visible
    await expect(chatModelSelect).toBeEnabled();
    await expect(embeddingModelSelect).toBeEnabled();
    await expect(chatModelSelect).toBeVisible();
    await expect(embeddingModelSelect).toBeVisible();
  }

  /**
   * Test keyboard navigation for model selection
   */
  async testKeyboardNavigation() {
    // Focus on chat model dropdown
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    // Open dropdown with space
    await this.page.keyboard.press(' ');
    
    // Navigate with arrow keys
    await this.page.keyboard.press('ArrowDown');
    
    // Select with enter
    await this.page.keyboard.press('Enter');
    
    // Verify selection changed
    await expect(this.page.locator('#chatModel')).toHaveValue('gpt-4');
  }

  /**
   * Mock API failure for testing error handling
   */
  async mockApiFailure() {
    await this.page.route('/api/settings/models', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal server error' })
      });
    });
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage() {
    await expect(this.page.locator('.bg-red-50:has-text("Failed to update model configuration")')).toBeVisible();
    const errorMessage = this.page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible();
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage() {
    await expect(this.page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
    const successMessage = this.page.locator('.bg-green-50');
    await expect(successMessage).toBeVisible();
  }

  /**
   * Verify model configuration has valid values
   */
  async verifyValidModelConfig() {
    const config = await this.getCurrentModelConfig();
    
    // Verify we have valid model values (not empty)
    expect(config.chatModel).toBeTruthy();
    expect(config.embeddingModel).toBeTruthy();
    
    // Verify they are valid model names
    expect(['gpt-3.5-turbo', 'gpt-4']).toContain(config.chatModel);
    expect(['text-embedding-ada-002', 'text-embedding-3-small']).toContain(config.embeddingModel);
  }
} 