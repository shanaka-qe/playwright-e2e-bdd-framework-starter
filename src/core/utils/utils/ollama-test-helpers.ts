import { Page, expect } from '@playwright/test';

/**
 * Ollama Model Test Helpers
 * Provides utilities for testing Ollama model integration in the settings page
 */

export interface OllamaModelInfo {
  value: string;
  label: string;
  cost: string;
  isLocal: boolean;
  provider: 'ollama' | 'openai';
  port?: number;
}

export const OLLAMA_MODELS = {
  MISTRAL: {
    value: 'mistral',
    label: 'Mistral (Local - Free)',
    cost: 'Free (Offline)',
    isLocal: true,
    provider: 'ollama' as const,
    port: 11434
  },
  NOMIC_EMBED: {
    value: 'nomic-embed-text',
    label: 'Nomic Embed Text (Local - Free)',
    cost: 'Free (Offline)',
    isLocal: true,
    provider: 'ollama' as const,
    port: 11435
  }
};

export class OllamaTestHelpers {
  /**
   * Navigate to settings and wait for model configuration to load
   */
  static async navigateToModelSettings(page: Page): Promise<void> {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("AI Test Knowledge Base")');
    
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    await page.waitForSelector('h3:has-text("AI Model Configuration")');
    
    // Wait for dropdowns to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
  }

  /**
   * Get all model options from a dropdown
   */
  static async getModelOptions(page: Page, dropdownId: string): Promise<OllamaModelInfo[]> {
    const select = page.locator(`#${dropdownId}`);
    const options = await select.locator('option').all();
    
    const modelOptions: OllamaModelInfo[] = [];
    
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value && text) {
        const isLocal = text.includes('(Local)') || text.includes('Local');
        const provider = isLocal ? 'ollama' : 'openai';
        
        modelOptions.push({
          value,
          label: text,
          cost: this.extractCost(text),
          isLocal,
          provider
        });
      }
    }
    
    return modelOptions;
  }

  /**
   * Extract cost information from model option text
   */
  static extractCost(text: string): string {
    const costMatch = text.match(/\$[\d.]+/);
    if (costMatch) {
      return costMatch[0];
    }
    
    if (text.includes('Free')) {
      return 'Free';
    }
    
    return 'Unknown';
  }

  /**
   * Verify a local model is available in the dropdown
   */
  static async verifyLocalModelAvailable(page: Page, dropdownId: string, modelValue: string): Promise<boolean> {
    const options = await this.getModelOptions(page, dropdownId);
    const localModel = options.find(option => option.value === modelValue && option.isLocal);
    
    if (localModel) {
      console.log(`✅ Local model ${modelValue} found in ${dropdownId}:`, localModel);
      return true;
    } else {
      console.log(`❌ Local model ${modelValue} not found in ${dropdownId}`);
      console.log('Available options:', options);
      return false;
    }
  }

  /**
   * Select a local model and verify status indicator
   */
  static async selectLocalModelAndVerifyStatus(page: Page, dropdownId: string, modelValue: string): Promise<void> {
    const select = page.locator(`#${dropdownId}`);
    await select.selectOption(modelValue);
    
    // Wait for status indicator to appear
    await page.waitForTimeout(1000);
    
    // Check for status indicator
    const statusIndicator = page.locator('span:has-text("Local"), span:has-text("Online"), span:has-text("Offline")');
    
    if (await statusIndicator.count() > 0) {
      const statusText = await statusIndicator.textContent();
      console.log(`Status indicator for ${modelValue}:`, statusText);
      
      // Verify status text format
      if (dropdownId === 'chatModel') {
        expect(statusText).toMatch(/Local Model (Online|Offline)/);
      } else if (dropdownId === 'embeddingModel') {
        expect(statusText).toMatch(/Local Embedding Model (Online|Offline)/);
      }
    } else {
      console.log(`No status indicator found for ${modelValue}`);
    }
  }

  /**
   * Mock Ollama service responses
   */
  static async mockOllamaService(page: Page, port: number, isAvailable: boolean = true): Promise<void> {
    const url = `http://localhost:${port}/api/tags`;
    
    if (isAvailable) {
      await page.route(url, async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            models: [
              {
                name: port === 11434 ? 'mistral' : 'nomic-embed-text',
                modified_at: new Date().toISOString(),
                size: 1234567890
              }
            ]
          })
        });
      });
    } else {
      await page.route(url, async route => {
        await route.abort('failed');
      });
    }
  }

  /**
   * Test model switching functionality
   */
  static async testModelSwitching(page: Page, dropdownId: string, models: string[]): Promise<void> {
    const select = page.locator(`#${dropdownId}`);
    
    for (const model of models) {
      await select.selectOption(model);
      await expect(select).toHaveValue(model);
      console.log(`✅ Successfully switched to ${model} in ${dropdownId}`);
    }
  }

  /**
   * Save model configuration and verify success
   */
  static async saveModelConfiguration(page: Page): Promise<void> {
    const saveButton = page.locator('button:has-text("Save Model Configuration")');
    await saveButton.click();
    
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
    console.log('✅ Model configuration saved successfully');
  }

  /**
   * Verify model options have correct information
   */
  static async verifyModelOptionInfo(page: Page, dropdownId: string, expectedModels: OllamaModelInfo[]): Promise<void> {
    const options = await this.getModelOptions(page, dropdownId);
    
    for (const expectedModel of expectedModels) {
      const foundModel = options.find(option => option.value === expectedModel.value);
      
      if (foundModel) {
        expect(foundModel.isLocal).toBe(expectedModel.isLocal);
        expect(foundModel.provider).toBe(expectedModel.provider);
        
        if (expectedModel.isLocal) {
          expect(foundModel.label).toContain('Local');
          expect(foundModel.label).toContain('Free');
          expect(foundModel.label).toContain('(Local)');
        }
        
        console.log(`✅ Model ${expectedModel.value} has correct information:`, foundModel);
      } else {
        throw new Error(`Expected model ${expectedModel.value} not found in ${dropdownId}`);
      }
    }
  }

  /**
   * Test mixed local and cloud model configurations
   */
  static async testMixedModelConfigurations(page: Page): Promise<void> {
    const chatSelect = page.locator('#chatModel');
    const embeddingSelect = page.locator('#embeddingModel');
    
    // Test 1: Local chat + Cloud embedding
    await chatSelect.selectOption('mistral');
    await embeddingSelect.selectOption('text-embedding-3-small');
    await this.saveModelConfiguration(page);
    
    // Test 2: Cloud chat + Local embedding
    await chatSelect.selectOption('gpt-4');
    await embeddingSelect.selectOption('nomic-embed-text');
    await this.saveModelConfiguration(page);
    
    // Test 3: Both local
    await chatSelect.selectOption('mistral');
    await embeddingSelect.selectOption('nomic-embed-text');
    await this.saveModelConfiguration(page);
    
    console.log('✅ All mixed model configurations tested successfully');
  }

  /**
   * Verify model options description includes local models
   */
  static async verifyModelOptionsDescription(page: Page): Promise<void> {
    await expect(page.locator('text=Local (Free): Mistral + Nomic Embed Text via Ollama')).toBeVisible();
    await expect(page.locator('text=Cloud (Cheaper): GPT-3.5 Turbo + Ada-002 embeddings')).toBeVisible();
    await expect(page.locator('text=Cloud (Premium): GPT-4 + Text-Embedding-3-Small')).toBeVisible();
    
    console.log('✅ Model options description includes local models');
  }

  /**
   * Test Ollama service unavailability handling
   */
  static async testOllamaServiceUnavailability(page: Page): Promise<void> {
    // Mock both Ollama services as unavailable
    await this.mockOllamaService(page, 11434, false);
    await this.mockOllamaService(page, 11435, false);
    
    // Refresh page to trigger status checks
    await page.reload();
    await page.waitForSelector('h1:has-text("AI Test Knowledge Base")');
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    
    // Select local models
    const chatSelect = page.locator('#chatModel');
    const embeddingSelect = page.locator('#embeddingModel');
    
    await chatSelect.selectOption('mistral');
    await embeddingSelect.selectOption('nomic-embed-text');
    
    // Wait for status indicators to show offline status
    await page.waitForTimeout(2000);
    
    // Check for offline status indicators
    const offlineIndicators = page.locator('span:has-text("Offline")');
    if (await offlineIndicators.count() > 0) {
      const offlineTexts = await offlineIndicators.allTextContents();
      expect(offlineTexts.some(text => text.includes('Local Model Offline'))).toBe(true);
      expect(offlineTexts.some(text => text.includes('Local Embedding Model Offline'))).toBe(true);
      console.log('✅ Ollama service unavailability handled correctly');
    }
  }

  /**
   * Test configuration persistence after page refresh
   */
  static async testConfigurationPersistence(page: Page): Promise<void> {
    const chatSelect = page.locator('#chatModel');
    const embeddingSelect = page.locator('#embeddingModel');
    
    // Select local models
    await chatSelect.selectOption('mistral');
    await embeddingSelect.selectOption('nomic-embed-text');
    
    // Save configuration
    await this.saveModelConfiguration(page);
    
    // Refresh page
    await page.reload();
    await page.waitForSelector('h1:has-text("AI Test Knowledge Base")');
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    
    // Wait for dropdowns to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
    
    // Verify local models are still selected
    await expect(chatSelect).toHaveValue('mistral');
    await expect(embeddingSelect).toHaveValue('nomic-embed-text');
    
    console.log('✅ Configuration persistence verified');
  }
} 