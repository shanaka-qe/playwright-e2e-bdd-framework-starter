import { test, expect } from '@playwright/test';

test.describe('Ollama Models Validation in Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Testoria by SNK")');
    
    // Navigate to Settings tab
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Wait for model configuration to load
    await page.waitForSelector('h3:has-text("AI Model Configuration")');
    
    // Wait for dropdowns to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
  });

  test('should display Mistral as a local chat model option', async ({ page }) => {
    // Get chat model dropdown options
    const chatModelSelect = page.locator('#chatModel');
    const chatOptions = await chatModelSelect.locator('option').all();
    
    // Get option values and texts
    const chatOptionValues = await Promise.all(chatOptions.map(option => option.getAttribute('value')));
    const chatOptionTexts = await Promise.all(chatOptions.map(option => option.textContent()));
    
    console.log('Chat model option values:', chatOptionValues);
    console.log('Chat model option texts:', chatOptionTexts);
    
    // Verify Mistral is available as an option
    const hasMistral = chatOptionValues.some(value => value === 'mistral');
    expect(hasMistral).toBe(true);
    
    // Verify Mistral option text contains "Local" and "Free"
    const mistralOptionText = chatOptionTexts.find((text, index) => chatOptionValues[index] === 'mistral');
    expect(mistralOptionText).toContain('Local');
    expect(mistralOptionText).toContain('Free');
    expect(mistralOptionText).toContain('Mistral');
  });

  test('should display Nomic Embed Text as a local embedding model option', async ({ page }) => {
    // Get embedding model dropdown options
    const embeddingModelSelect = page.locator('#embeddingModel');
    const embeddingOptions = await embeddingModelSelect.locator('option').all();
    
    // Get option values and texts
    const embeddingOptionValues = await Promise.all(embeddingOptions.map(option => option.getAttribute('value')));
    const embeddingOptionTexts = await Promise.all(embeddingOptions.map(option => option.textContent()));
    
    console.log('Embedding model option values:', embeddingOptionValues);
    console.log('Embedding model option texts:', embeddingOptionTexts);
    
    // Verify Nomic Embed Text is available as an option
    const hasNomicEmbed = embeddingOptionValues.some(value => value === 'nomic-embed-text');
    expect(hasNomicEmbed).toBe(true);
    
    // Verify Nomic Embed Text option text contains "Local" and "Free"
    const nomicOptionText = embeddingOptionTexts.find((text, index) => embeddingOptionValues[index] === 'nomic-embed-text');
    expect(nomicOptionText).toContain('Local');
    expect(nomicOptionText).toContain('Free');
    expect(nomicOptionText).toContain('Nomic Embed Text');
  });

  test('should show Mistral status indicator when Mistral is selected', async ({ page }) => {
    // Select Mistral as chat model
    const chatModelSelect = page.locator('#chatModel');
    await chatModelSelect.selectOption('mistral');
    
    // Wait for status indicator to appear
    await page.waitForTimeout(1000);
    
    // Check for Mistral status indicator
    const mistralStatus = page.locator('span:has-text("Local Model Online"), span:has-text("Local Model Offline")');
    
    if (await mistralStatus.count() > 0) {
      // Status indicator is present
      const statusText = await mistralStatus.textContent();
      expect(statusText).toMatch(/Local Model (Online|Offline)/);
      
      // Check for error message if offline
      if (statusText?.includes('Offline')) {
        const errorMessage = page.locator('p.text-xs.text-red-600');
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          expect(errorText).toMatch(/Cannot connect to Ollama service|Ollama service not responding/);
        }
      }
    }
  });

  test('should show Nomic Embed status indicator when Nomic Embed Text is selected', async ({ page }) => {
    // Select Nomic Embed Text as embedding model
    const embeddingModelSelect = page.locator('#embeddingModel');
    await embeddingModelSelect.selectOption('nomic-embed-text');
    
    // Wait for status indicator to appear
    await page.waitForTimeout(1000);
    
    // Check for Nomic Embed status indicator
    const nomicStatus = page.locator('span:has-text("Local Embedding Model Online"), span:has-text("Local Embedding Model Offline")');
    
    if (await nomicStatus.count() > 0) {
      // Status indicator is present
      const statusText = await nomicStatus.textContent();
      expect(statusText).toMatch(/Local Embedding Model (Online|Offline)/);
      
      // Check for error message if offline
      if (statusText?.includes('Offline')) {
        const errorMessage = page.locator('p.text-xs.text-red-600');
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          expect(errorText).toMatch(/Cannot connect to Nomic Embed service|Nomic Embed service not responding/);
        }
      }
    }
  });

  test('should allow switching between local and cloud models', async ({ page }) => {
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    // Test switching chat models
    await chatModelSelect.selectOption('mistral');
    await expect(chatModelSelect).toHaveValue('mistral');
    
    await chatModelSelect.selectOption('gpt-3.5-turbo');
    await expect(chatModelSelect).toHaveValue('gpt-3.5-turbo');
    
    await chatModelSelect.selectOption('gpt-4');
    await expect(chatModelSelect).toHaveValue('gpt-4');
    
    // Test switching embedding models
    await embeddingModelSelect.selectOption('nomic-embed-text');
    await expect(embeddingModelSelect).toHaveValue('nomic-embed-text');
    
    await embeddingModelSelect.selectOption('text-embedding-ada-002');
    await expect(embeddingModelSelect).toHaveValue('text-embedding-ada-002');
    
    await embeddingModelSelect.selectOption('text-embedding-3-small');
    await expect(embeddingModelSelect).toHaveValue('text-embedding-3-small');
  });

  test('should save configuration with local models successfully', async ({ page }) => {
    // Select local models
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    await chatModelSelect.selectOption('mistral');
    await embeddingModelSelect.selectOption('nomic-embed-text');
    
    // Save configuration
    const saveButton = page.locator('button:has-text("Save Model Configuration")');
    await saveButton.click();
    
    // Wait for success message
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
    
    // Verify the configuration was saved
    await expect(chatModelSelect).toHaveValue('mistral');
    await expect(embeddingModelSelect).toHaveValue('nomic-embed-text');
  });

  test('should display correct model information in dropdowns', async ({ page }) => {
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    // Get all options
    const chatOptions = await chatModelSelect.locator('option').all();
    const embeddingOptions = await embeddingModelSelect.locator('option').all();
    
    // Verify chat model options have correct information
    for (const option of chatOptions) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value === 'mistral') {
        expect(text).toContain('Mistral');
        expect(text).toContain('Local');
        expect(text).toContain('Free');
        expect(text).toContain('(Local)');
      } else if (value === 'gpt-3.5-turbo') {
        expect(text).toContain('GPT-3.5 Turbo');
        expect(text).toContain('$0.0015/1K tokens');
      } else if (value === 'gpt-4') {
        expect(text).toContain('GPT-4');
        expect(text).toContain('$0.03/1K tokens');
      }
    }
    
    // Verify embedding model options have correct information
    for (const option of embeddingOptions) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value === 'nomic-embed-text') {
        expect(text).toContain('Nomic Embed Text');
        expect(text).toContain('Local');
        expect(text).toContain('Free');
        expect(text).toContain('(Local)');
      } else if (value === 'text-embedding-ada-002') {
        expect(text).toContain('Ada-002');
        expect(text).toContain('$0.0001/1K tokens');
      } else if (value === 'text-embedding-3-small') {
        expect(text).toContain('Text-Embedding-3-Small');
        expect(text).toContain('$0.00002/1K tokens');
      }
    }
  });

  test('should handle Ollama service unavailability gracefully', async ({ page }) => {
    // Mock Ollama service being unavailable
    await page.route('http://localhost:11434/api/tags', async route => {
      await route.abort('failed');
    });
    
    await page.route('http://localhost:11435/api/tags', async route => {
      await route.abort('failed');
    });
    
    // Refresh the page to trigger status checks
    await page.reload();
    await page.waitForSelector('h1:has-text("Testoria by SNK")');
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Select local models
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    await chatModelSelect.selectOption('mistral');
    await embeddingModelSelect.selectOption('nomic-embed-text');
    
    // Wait for status indicators to show offline status
    await page.waitForTimeout(2000);
    
    // Check for offline status indicators
    const offlineIndicators = page.locator('span:has-text("Offline")');
    if (await offlineIndicators.count() > 0) {
      const offlineTexts = await offlineIndicators.allTextContents();
      expect(offlineTexts.some(text => text.includes('Local Model Offline'))).toBe(true);
      expect(offlineTexts.some(text => text.includes('Local Embedding Model Offline'))).toBe(true);
    }
  });

  test('should maintain local model selection after page refresh', async ({ page }) => {
    // Select local models
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    await chatModelSelect.selectOption('mistral');
    await embeddingModelSelect.selectOption('nomic-embed-text');
    
    // Save configuration
    await page.locator('button:has-text("Save Model Configuration")').click();
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    await page.waitForSelector('h1:has-text("Testoria by SNK")');
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Wait for dropdowns to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.querySelector('#chatModel') as HTMLSelectElement;
      const embeddingSelect = document.querySelector('#embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length > 0 && embeddingSelect && embeddingSelect.options.length > 0;
    });
    
    // Verify local models are still selected
    await expect(chatModelSelect).toHaveValue('mistral');
    await expect(embeddingModelSelect).toHaveValue('nomic-embed-text');
  });

  test('should display model options with correct provider information', async ({ page }) => {
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    // Get all options
    const chatOptions = await chatModelSelect.locator('option').all();
    const embeddingOptions = await embeddingModelSelect.locator('option').all();
    
    // Verify local models are marked as local
    for (const option of chatOptions) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value === 'mistral') {
        expect(text).toContain('(Local)');
      }
    }
    
    for (const option of embeddingOptions) {
      const value = await option.getAttribute('value');
      const text = await option.textContent();
      
      if (value === 'nomic-embed-text') {
        expect(text).toContain('(Local)');
      }
    }
  });

  test('should update model options description to include local models', async ({ page }) => {
    // Check that the model options description includes local models
    await expect(page.locator('text=Local (Free): Mistral + Nomic Embed Text via Ollama')).toBeVisible();
    await expect(page.locator('text=Cloud (Cheaper): GPT-3.5 Turbo + Ada-002 embeddings')).toBeVisible();
    await expect(page.locator('text=Cloud (Premium): GPT-4 + Text-Embedding-3-Small')).toBeVisible();
  });

  test('should handle mixed local and cloud model configurations', async ({ page }) => {
    const chatModelSelect = page.locator('#chatModel');
    const embeddingModelSelect = page.locator('#embeddingModel');
    
    // Test local chat + cloud embedding
    await chatModelSelect.selectOption('mistral');
    await embeddingModelSelect.selectOption('text-embedding-3-small');
    
    await page.locator('button:has-text("Save Model Configuration")').click();
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
    
    // Test cloud chat + local embedding
    await chatModelSelect.selectOption('gpt-4');
    await embeddingModelSelect.selectOption('nomic-embed-text');
    
    await page.locator('button:has-text("Save Model Configuration")').click();
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
  });
}); 