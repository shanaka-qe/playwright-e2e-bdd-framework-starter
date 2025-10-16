import { test, expect } from '@playwright/test';
import { OllamaTestHelpers, OLLAMA_MODELS } from '../utils/ollama-test-helpers';

test.describe('Ollama Models - Simple Validation', () => {
  test.beforeEach(async ({ page }) => {
    await OllamaTestHelpers.navigateToModelSettings(page);
  });

  test('should display both local models in dropdowns', async ({ page }) => {
    // Verify Mistral is available in chat model dropdown
    const mistralAvailable = await OllamaTestHelpers.verifyLocalModelAvailable(page, 'chatModel', 'mistral');
    expect(mistralAvailable).toBe(true);
    
    // Verify Nomic Embed Text is available in embedding model dropdown
    const nomicAvailable = await OllamaTestHelpers.verifyLocalModelAvailable(page, 'embeddingModel', 'nomic-embed-text');
    expect(nomicAvailable).toBe(true);
  });

  test('should show status indicators for local models', async ({ page }) => {
    // Test Mistral status indicator
    await OllamaTestHelpers.selectLocalModelAndVerifyStatus(page, 'chatModel', 'mistral');
    
    // Test Nomic Embed Text status indicator
    await OllamaTestHelpers.selectLocalModelAndVerifyStatus(page, 'embeddingModel', 'nomic-embed-text');
  });

  test('should allow switching between all model types', async ({ page }) => {
    // Test chat model switching
    await OllamaTestHelpers.testModelSwitching(page, 'chatModel', [
      'mistral',
      'gpt-3.5-turbo',
      'gpt-4'
    ]);
    
    // Test embedding model switching
    await OllamaTestHelpers.testModelSwitching(page, 'embeddingModel', [
      'nomic-embed-text',
      'text-embedding-ada-002',
      'text-embedding-3-small'
    ]);
  });

  test('should save local model configuration successfully', async ({ page }) => {
    const chatSelect = page.locator('#chatModel');
    const embeddingSelect = page.locator('#embeddingModel');
    
    // Select local models
    await chatSelect.selectOption('mistral');
    await embeddingSelect.selectOption('nomic-embed-text');
    
    // Save and verify
    await OllamaTestHelpers.saveModelConfiguration(page);
    
    // Verify selections persisted
    await expect(chatSelect).toHaveValue('mistral');
    await expect(embeddingSelect).toHaveValue('nomic-embed-text');
  });

  test('should display correct model information', async ({ page }) => {
    // Verify chat model options
    await OllamaTestHelpers.verifyModelOptionInfo(page, 'chatModel', [
      OLLAMA_MODELS.MISTRAL
    ]);
    
    // Verify embedding model options
    await OllamaTestHelpers.verifyModelOptionInfo(page, 'embeddingModel', [
      OLLAMA_MODELS.NOMIC_EMBED
    ]);
  });

  test('should handle Ollama service unavailability', async ({ page }) => {
    await OllamaTestHelpers.testOllamaServiceUnavailability(page);
  });

  test('should maintain configuration after page refresh', async ({ page }) => {
    await OllamaTestHelpers.testConfigurationPersistence(page);
  });

  test('should display updated model options description', async ({ page }) => {
    await OllamaTestHelpers.verifyModelOptionsDescription(page);
  });

  test('should handle mixed local and cloud configurations', async ({ page }) => {
    await OllamaTestHelpers.testMixedModelConfigurations(page);
  });
}); 