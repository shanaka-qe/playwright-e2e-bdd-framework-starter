/**
 * Settings Page Object Model
 * 
 * Represents the application settings and configuration functionality
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ModelConfiguration {
  chatModel: string;
  embeddingModel: string;
  provider: string;
  cost: string;
  description: string;
}

export interface DatabaseSettings {
  status: string;
  connectionString: string;
  migrationsStatus: string;
}

export class SettingsPage extends BasePage {
  // Main settings sections
  private readonly modelConfigSection: Locator;
  private readonly databaseSection: Locator;
  private readonly systemSection: Locator;
  private readonly advancedSection: Locator;

  // Model Configuration elements
  private readonly chatModelDropdown: Locator;
  private readonly embeddingModelDropdown: Locator;
  private readonly providerSelector: Locator;
  private readonly modelCostInfo: Locator;
  private readonly modelDescription: Locator;
  private readonly saveModelConfigButton: Locator;
  private readonly resetModelConfigButton: Locator;

  // Local/Ollama model elements
  private readonly localModelsSection: Locator;
  private readonly ollamaStatus: Locator;
  private readonly ollamaModelsDropdown: Locator;
  private readonly localEmbeddingDropdown: Locator;
  private readonly refreshOllamaButton: Locator;
  private readonly ollamaServiceStatus: Locator;

  // OpenAI/Cloud model elements
  private readonly cloudModelsSection: Locator;
  private readonly openaiApiKeyInput: Locator;
  private readonly openaiModelsDropdown: Locator;
  private readonly cloudEmbeddingDropdown: Locator;
  private readonly testApiKeyButton: Locator;
  private readonly apiKeyStatus: Locator;

  // Database settings elements
  private readonly databaseStatus: Locator;
  private readonly postgresConnection: Locator;
  private readonly chromadbConnection: Locator;
  private readonly databaseMigrations: Locator;
  private readonly testConnectionButton: Locator;
  private readonly runMigrationsButton: Locator;

  // System information elements
  private readonly systemInfo: Locator;
  private readonly versionInfo: Locator;
  private readonly environmentInfo: Locator;
  private readonly performanceMetrics: Locator;
  private readonly logLevelSelector: Locator;

  // Advanced settings elements
  private readonly advancedToggle: Locator;
  private readonly debugModeToggle: Locator;
  private readonly cacheSettings: Locator;
  private readonly timeoutSettings: Locator;
  private readonly maxTokensInput: Locator;
  private readonly temperatureSlider: Locator;

  // Status and feedback elements
  private readonly statusMessages: Locator;
  private readonly errorMessages: Locator;
  private readonly successMessages: Locator;
  private readonly warningMessages: Locator;
  private readonly loadingIndicators: Locator;

  // Action buttons
  private readonly saveAllButton: Locator;
  private readonly resetAllButton: Locator;
  private readonly exportConfigButton: Locator;
  private readonly importConfigButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Main sections
    this.modelConfigSection = page.locator('[data-testid="model-config"], [class*="model-config"]');
    this.databaseSection = page.locator('[data-testid="database-settings"], [class*="database"]');
    this.systemSection = page.locator('[data-testid="system-info"], [class*="system"]');
    this.advancedSection = page.locator('[data-testid="advanced-settings"], [class*="advanced"]');

    // Model Configuration
    this.chatModelDropdown = page.locator('select[name*="chat"], select[data-testid="chat-model"]');
    this.embeddingModelDropdown = page.locator('select[name*="embedding"], select[data-testid="embedding-model"]');
    this.providerSelector = page.locator('select[name*="provider"], [data-testid="provider-selector"]');
    this.modelCostInfo = page.locator('[data-testid="model-cost"], [class*="cost-info"]');
    this.modelDescription = page.locator('[data-testid="model-description"], [class*="description"]');
    this.saveModelConfigButton = page.locator('button:has-text("Save"), button[data-testid="save-model-config"]');
    this.resetModelConfigButton = page.locator('button:has-text("Reset"), button[data-testid="reset-model-config"]');

    // Local/Ollama models
    this.localModelsSection = page.locator('[data-testid="local-models"], [class*="ollama"]');
    this.ollamaStatus = page.locator('[data-testid="ollama-status"]');
    this.ollamaModelsDropdown = page.locator('select[data-testid="ollama-models"]');
    this.localEmbeddingDropdown = page.locator('select[data-testid="local-embedding"]');
    this.refreshOllamaButton = page.locator('button:has-text("Refresh"), button[data-testid="refresh-ollama"]');
    this.ollamaServiceStatus = page.locator('[data-testid="ollama-service-status"]');

    // Cloud models
    this.cloudModelsSection = page.locator('[data-testid="cloud-models"], [class*="openai"]');
    this.openaiApiKeyInput = page.locator('input[type="password"], input[name*="api"], input[placeholder*="API"]');
    this.openaiModelsDropdown = page.locator('select[data-testid="openai-models"]');
    this.cloudEmbeddingDropdown = page.locator('select[data-testid="cloud-embedding"]');
    this.testApiKeyButton = page.locator('button:has-text("Test"), button[data-testid="test-api-key"]');
    this.apiKeyStatus = page.locator('[data-testid="api-key-status"]');

    // Database settings
    this.databaseStatus = page.locator('[data-testid="database-status"]');
    this.postgresConnection = page.locator('[data-testid="postgres-connection"]');
    this.chromadbConnection = page.locator('[data-testid="chromadb-connection"]');
    this.databaseMigrations = page.locator('[data-testid="migrations-status"]');
    this.testConnectionButton = page.locator('button:has-text("Test Connection")');
    this.runMigrationsButton = page.locator('button:has-text("Run Migrations")');

    // System information
    this.systemInfo = page.locator('[data-testid="system-info"]');
    this.versionInfo = page.locator('[data-testid="version-info"]');
    this.environmentInfo = page.locator('[data-testid="environment-info"]');
    this.performanceMetrics = page.locator('[data-testid="performance-metrics"]');
    this.logLevelSelector = page.locator('select[name*="log"], select[data-testid="log-level"]');

    // Advanced settings
    this.advancedToggle = page.locator('input[type="checkbox"][data-testid="advanced-toggle"]');
    this.debugModeToggle = page.locator('input[type="checkbox"][data-testid="debug-mode"]');
    this.cacheSettings = page.locator('[data-testid="cache-settings"]');
    this.timeoutSettings = page.locator('[data-testid="timeout-settings"]');
    this.maxTokensInput = page.locator('input[name*="tokens"], input[data-testid="max-tokens"]');
    this.temperatureSlider = page.locator('input[type="range"], input[data-testid="temperature"]');

    // Status messages
    this.statusMessages = page.locator('[class*="status"], [data-testid="status-message"]');
    this.errorMessages = page.locator('[class*="error"], [role="alert"]');
    this.successMessages = page.locator('[class*="success"], [class*="notification"]');
    this.warningMessages = page.locator('[class*="warning"], [class*="warn"]');
    this.loadingIndicators = page.locator('[class*="loading"], [class*="spinner"]');

    // Action buttons
    this.saveAllButton = page.locator('button:has-text("Save All"), button[data-testid="save-all"]');
    this.resetAllButton = page.locator('button:has-text("Reset All"), button[data-testid="reset-all"]');
    this.exportConfigButton = page.locator('button:has-text("Export"), button[data-testid="export-config"]');
    this.importConfigButton = page.locator('button:has-text("Import"), button[data-testid="import-config"]');
  }

  /**
   * Navigate to Settings page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
    await this.navigateToSettings();
  }

  /**
   * Navigate to Settings tab from main navigation
   */
  async navigateToSettings(): Promise<void> {
    const settingsButton = this.page.locator('button:has-text("Settings")');
    await settingsButton.click();
    await this.waitForPageReady();
  }

  /**
   * Wait for Settings page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.modelConfigSection.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Model Configuration methods
   */
  async getCurrentModelConfiguration(): Promise<ModelConfiguration> {
    const chatModel = await this.chatModelDropdown.inputValue();
    const embeddingModel = await this.embeddingModelDropdown.inputValue();
    const provider = await this.providerSelector.inputValue();
    const cost = await this.modelCostInfo.textContent() || '';
    const description = await this.modelDescription.textContent() || '';

    return {
      chatModel,
      embeddingModel,
      provider,
      cost,
      description
    };
  }

  async selectChatModel(modelName: string): Promise<void> {
    await this.chatModelDropdown.selectOption({ label: modelName });
    await this.page.waitForTimeout(1000); // Wait for model info to update
  }

  async selectEmbeddingModel(modelName: string): Promise<void> {
    await this.embeddingModelDropdown.selectOption({ label: modelName });
    await this.page.waitForTimeout(1000);
  }

  async selectProvider(provider: string): Promise<void> {
    await this.providerSelector.selectOption({ label: provider });
    await this.page.waitForTimeout(1000);
  }

  async saveModelConfiguration(): Promise<void> {
    await this.saveModelConfigButton.click();
    await this.waitForSaveComplete();
  }

  async resetModelConfiguration(): Promise<void> {
    await this.resetModelConfigButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getAvailableModels(): Promise<{
    chatModels: string[];
    embeddingModels: string[];
  }> {
    const chatOptions = await this.chatModelDropdown.locator('option').allTextContents();
    const embeddingOptions = await this.embeddingModelDropdown.locator('option').allTextContents();

    return {
      chatModels: chatOptions.filter(option => option.trim().length > 0),
      embeddingModels: embeddingOptions.filter(option => option.trim().length > 0)
    };
  }

  async getModelCostInformation(): Promise<string> {
    return await this.modelCostInfo.textContent() || '';
  }

  async getModelDescription(): Promise<string> {
    return await this.modelDescription.textContent() || '';
  }

  /**
   * Ollama/Local models functionality
   */
  async getOllamaStatus(): Promise<string> {
    if (await this.ollamaStatus.isVisible()) {
      return await this.ollamaStatus.textContent() || '';
    }
    return 'Not available';
  }

  async refreshOllamaModels(): Promise<void> {
    if (await this.refreshOllamaButton.isVisible()) {
      await this.refreshOllamaButton.click();
      await this.waitForOllamaRefresh();
    }
  }

  async getOllamaModels(): Promise<string[]> {
    if (await this.ollamaModelsDropdown.isVisible()) {
      const options = await this.ollamaModelsDropdown.locator('option').allTextContents();
      return options.filter(option => option.trim().length > 0);
    }
    return [];
  }

  async selectOllamaModel(modelName: string): Promise<void> {
    if (await this.ollamaModelsDropdown.isVisible()) {
      await this.ollamaModelsDropdown.selectOption({ label: modelName });
      await this.page.waitForTimeout(1000);
    }
  }

  async isOllamaServiceAvailable(): Promise<boolean> {
    const status = await this.getOllamaStatus();
    return status.toLowerCase().includes('available') || status.toLowerCase().includes('connected');
  }

  private async waitForOllamaRefresh(): Promise<void> {
    // Wait for loading indicator
    if (await this.loadingIndicators.count() > 0) {
      await this.loadingIndicators.waitFor({ state: 'visible', timeout: 5000 });
      await this.loadingIndicators.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * OpenAI/Cloud models functionality
   */
  async setOpenAIApiKey(apiKey: string): Promise<void> {
    await this.openaiApiKeyInput.clear();
    await this.openaiApiKeyInput.fill(apiKey);
  }

  async testApiKey(): Promise<boolean> {
    if (await this.testApiKeyButton.isVisible()) {
      await this.testApiKeyButton.click();
      await this.page.waitForTimeout(3000); // Wait for API test
      
      const status = await this.getApiKeyStatus();
      return status.toLowerCase().includes('valid') || status.toLowerCase().includes('success');
    }
    return false;
  }

  async getApiKeyStatus(): Promise<string> {
    if (await this.apiKeyStatus.isVisible()) {
      return await this.apiKeyStatus.textContent() || '';
    }
    return '';
  }

  async getOpenAIModels(): Promise<string[]> {
    if (await this.openaiModelsDropdown.isVisible()) {
      const options = await this.openaiModelsDropdown.locator('option').allTextContents();
      return options.filter(option => option.trim().length > 0);
    }
    return [];
  }

  async selectOpenAIModel(modelName: string): Promise<void> {
    if (await this.openaiModelsDropdown.isVisible()) {
      await this.openaiModelsDropdown.selectOption({ label: modelName });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Database settings functionality
   */
  async getDatabaseStatus(): Promise<DatabaseSettings> {
    const postgresStatus = await this.postgresConnection.textContent() || '';
    const chromadbStatus = await this.chromadbConnection.textContent() || '';
    const migrationsStatus = await this.databaseMigrations.textContent() || '';

    return {
      status: postgresStatus.includes('Connected') && chromadbStatus.includes('Connected') ? 'Connected' : 'Disconnected',
      connectionString: `Postgres: ${postgresStatus}, ChromaDB: ${chromadbStatus}`,
      migrationsStatus
    };
  }

  async testDatabaseConnection(): Promise<boolean> {
    if (await this.testConnectionButton.isVisible()) {
      await this.testConnectionButton.click();
      await this.page.waitForTimeout(5000); // Wait for connection test
      
      const status = await this.getDatabaseStatus();
      return status.status === 'Connected';
    }
    return false;
  }

  async runDatabaseMigrations(): Promise<void> {
    if (await this.runMigrationsButton.isVisible()) {
      await this.runMigrationsButton.click();
      await this.page.waitForTimeout(10000); // Wait for migrations to complete
    }
  }

  /**
   * System information methods
   */
  async getSystemInformation(): Promise<{
    version: string;
    environment: string;
    performance: string;
  }> {
    const version = await this.versionInfo.textContent() || '';
    const environment = await this.environmentInfo.textContent() || '';
    const performance = await this.performanceMetrics.textContent() || '';

    return {
      version,
      environment,
      performance
    };
  }

  async setLogLevel(level: string): Promise<void> {
    if (await this.logLevelSelector.isVisible()) {
      await this.logLevelSelector.selectOption({ label: level });
      await this.page.waitForTimeout(500);
    }
  }

  async getLogLevel(): Promise<string> {
    if (await this.logLevelSelector.isVisible()) {
      return await this.logLevelSelector.inputValue();
    }
    return '';
  }

  /**
   * Advanced settings functionality
   */
  async toggleAdvancedSettings(enable: boolean): Promise<void> {
    const isChecked = await this.advancedToggle.isChecked();
    if (isChecked !== enable) {
      await this.advancedToggle.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async toggleDebugMode(enable: boolean): Promise<void> {
    if (await this.debugModeToggle.isVisible()) {
      const isChecked = await this.debugModeToggle.isChecked();
      if (isChecked !== enable) {
        await this.debugModeToggle.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async setMaxTokens(tokens: number): Promise<void> {
    if (await this.maxTokensInput.isVisible()) {
      await this.maxTokensInput.clear();
      await this.maxTokensInput.fill(tokens.toString());
    }
  }

  async setTemperature(temperature: number): Promise<void> {
    if (await this.temperatureSlider.isVisible()) {
      await this.temperatureSlider.fill(temperature.toString());
    }
  }

  async getAdvancedSettings(): Promise<{
    debugMode: boolean;
    maxTokens: number;
    temperature: number;
  }> {
    const debugMode = await this.debugModeToggle.isChecked();
    const maxTokens = parseInt(await this.maxTokensInput.inputValue() || '0');
    const temperature = parseFloat(await this.temperatureSlider.inputValue() || '0');

    return {
      debugMode,
      maxTokens,
      temperature
    };
  }

  /**
   * Configuration management
   */
  async saveAllSettings(): Promise<void> {
    if (await this.saveAllButton.isVisible()) {
      await this.saveAllButton.click();
      await this.waitForSaveComplete();
    }
  }

  async resetAllSettings(): Promise<void> {
    if (await this.resetAllButton.isVisible()) {
      await this.resetAllButton.click();
      await this.handleDialog(true); // Confirm reset
      await this.page.waitForTimeout(2000);
    }
  }

  async exportConfiguration(): Promise<string> {
    if (await this.exportConfigButton.isVisible()) {
      return await this.downloadFile(this.exportConfigButton.toString());
    }
    throw new Error('Export configuration button not found');
  }

  async importConfiguration(filePath: string): Promise<void> {
    if (await this.importConfigButton.isVisible()) {
      await this.importConfigButton.click();
      
      // Handle file upload dialog
      const fileInput = this.page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles(filePath);
      }
      
      await this.page.waitForTimeout(3000); // Wait for import to complete
    }
  }

  private async waitForSaveComplete(): Promise<void> {
    // Wait for loading indicator
    if (await this.loadingIndicators.count() > 0) {
      await this.loadingIndicators.waitFor({ state: 'visible', timeout: 5000 });
      await this.loadingIndicators.waitFor({ state: 'hidden', timeout: 10000 });
    }
    
    // Wait for success message
    await this.successMessages.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Status and error handling
   */
  async getStatusMessages(): Promise<string[]> {
    const messages: string[] = [];
    const statusCount = await this.statusMessages.count();
    
    for (let i = 0; i < statusCount; i++) {
      const message = await this.statusMessages.nth(i).textContent();
      if (message) {
        messages.push(message.trim());
      }
    }
    
    return messages;
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

  async hasErrors(): Promise<boolean> {
    return await this.errorMessages.count() > 0;
  }

  async hasSuccessMessages(): Promise<boolean> {
    return await this.successMessages.count() > 0;
  }

  async hasWarnings(): Promise<boolean> {
    return await this.warningMessages.count() > 0;
  }

  /**
   * Keyboard navigation and accessibility
   */
  async navigateWithKeyboard(): Promise<boolean> {
    // Test Tab navigation through settings
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(200);
    
    const focusedElement = await this.page.locator(':focus');
    return await focusedElement.count() > 0;
  }

  async checkAccessibilityLabels(): Promise<boolean> {
    const elementsWithLabels = await this.page.locator('[aria-label], [aria-labelledby], label').count();
    return elementsWithLabels > 0;
  }

  /**
   * Page refresh and persistence checks
   */
  async checkConfigurationPersistence(): Promise<boolean> {
    const configBefore = await this.getCurrentModelConfiguration();
    
    await this.page.reload();
    await this.waitForPageReady();
    
    const configAfter = await this.getCurrentModelConfiguration();
    
    return configBefore.chatModel === configAfter.chatModel &&
           configBefore.embeddingModel === configAfter.embeddingModel &&
           configBefore.provider === configAfter.provider;
  }

  /**
   * Performance testing
   */
  async measureConfigurationSaveTime(): Promise<number> {
    const startTime = Date.now();
    await this.saveModelConfiguration();
    return Date.now() - startTime;
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.navigate();
    return Date.now() - startTime;
  }
}

export default SettingsPage;