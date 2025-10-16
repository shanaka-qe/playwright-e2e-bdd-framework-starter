import { test, expect } from '@playwright/test';

test.describe('Model Configuration - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Testoria by SNK")');
  });

  test('should display model configuration section', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('nav button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Verify AI Model Configuration section exists
    await expect(page.locator('h3:has-text("AI Model Configuration")')).toBeVisible();
    
    // Verify model selection dropdowns are present
    await expect(page.locator('label:has-text("Chat Model (Q&A & Test Generation)")')).toBeVisible();
    await expect(page.locator('label:has-text("Embedding Model (Document Search)")')).toBeVisible();
  });

  test('should load model options and allow selection', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('nav button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Wait for the model configuration to load
    await page.waitForSelector('#chatModel');
    await page.waitForSelector('#embeddingModel');
    
    // Wait for options to be populated (check if there are at least 2 options)
    await page.waitForFunction(() => {
      const chatSelect = document.getElementById('chatModel') as HTMLSelectElement;
      const embeddingSelect = document.getElementById('embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length >= 2 && 
             embeddingSelect && embeddingSelect.options.length >= 2;
    });
    
    // Verify dropdowns are enabled
    await expect(page.locator('#chatModel')).toBeEnabled();
    await expect(page.locator('#embeddingModel')).toBeEnabled();
    
    // Verify dropdowns have options
    const chatOptions = await page.locator('#chatModel option').count();
    const embeddingOptions = await page.locator('#embeddingModel option').count();
    
    expect(chatOptions).toBeGreaterThanOrEqual(2);
    expect(embeddingOptions).toBeGreaterThanOrEqual(2);
  });

  test('should allow changing model selection', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('nav button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Wait for the model configuration to load
    await page.waitForSelector('#chatModel');
    await page.waitForSelector('#embeddingModel');
    
    // Wait for options to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.getElementById('chatModel') as HTMLSelectElement;
      const embeddingSelect = document.getElementById('embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length >= 2 && 
             embeddingSelect && embeddingSelect.options.length >= 2;
    });
    
    // Change chat model to GPT-4
    await page.locator('#chatModel').selectOption('gpt-4');
    
    // Verify the selection changed
    await expect(page.locator('#chatModel')).toHaveValue('gpt-4');
    
    // Change embedding model
    await page.locator('#embeddingModel').selectOption('text-embedding-3-small');
    
    // Verify the selection changed
    await expect(page.locator('#embeddingModel')).toHaveValue('text-embedding-3-small');
  });

  test('should save model configuration', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('nav button:has-text("Settings")');
    await page.waitForSelector('h2:has-text("System Settings")');
    
    // Wait for the model configuration to load
    await page.waitForSelector('#chatModel');
    await page.waitForSelector('#embeddingModel');
    
    // Wait for options to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.getElementById('chatModel') as HTMLSelectElement;
      const embeddingSelect = document.getElementById('embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length >= 2 && 
             embeddingSelect && embeddingSelect.options.length >= 2;
    });
    
    // Change models
    await page.locator('#chatModel').selectOption('gpt-4');
    await page.locator('#embeddingModel').selectOption('text-embedding-3-small');
    
    // Click save button
    await page.locator('button:has-text("Save Model Configuration")').click();
    
    // Wait for success message
    await expect(page.locator('.bg-green-50:has-text("Model configuration updated successfully")')).toBeVisible();
  });

  test('should display cost optimization information', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    
    // Verify cost optimization section
    await expect(page.locator('h4:has-text("Cost Optimization")')).toBeVisible();
    
    // Verify cost information is displayed
    await expect(page.locator('text=Default (Cheaper): GPT-3.5 Turbo + Ada-002 embeddings')).toBeVisible();
    await expect(page.locator('text=Premium: GPT-4 + Text-Embedding-3-Small')).toBeVisible();
    await expect(page.locator('text=~20x cost savings')).toBeVisible();
  });

  test('should integrate with existing database settings', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    
    // Verify both sections exist
    await expect(page.locator('h3:has-text("AI Model Configuration")')).toBeVisible();
    await expect(page.locator('h3:has-text("Clear Vector Database")')).toBeVisible();
    
    // Verify database status cards are still present
    await expect(page.locator('text=ChromaDB (Vector Database)')).toBeVisible();
    await expect(page.locator('text=PostgreSQL (Metadata Database)')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Navigate to Settings tab
    await page.click('button:has-text("⚙️ Settings")');
    await page.waitForSelector('h2:has-text("Settings")');
    
    // Wait for the model configuration to load
    await page.waitForSelector('#chatModel');
    await page.waitForSelector('#embeddingModel');
    
    // Wait for options to be populated
    await page.waitForFunction(() => {
      const chatSelect = document.getElementById('chatModel') as HTMLSelectElement;
      const embeddingSelect = document.getElementById('embeddingModel') as HTMLSelectElement;
      return chatSelect && chatSelect.options.length >= 2 && 
             embeddingSelect && embeddingSelect.options.length >= 2;
    });
    
    // Mock API failure by intercepting the request
    await page.route('/api/settings/models', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal server error' })
      });
    });
    
    // Try to save configuration
    await page.locator('button:has-text("Save Model Configuration")').click();
    
    // Verify error message is displayed
    await expect(page.locator('.bg-red-50:has-text("Failed to update model configuration")')).toBeVisible();
  });
}); 