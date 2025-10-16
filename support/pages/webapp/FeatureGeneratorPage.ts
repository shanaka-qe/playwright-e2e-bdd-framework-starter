/**
 * Feature Generator Page Object
 * 
 * Handles all interactions with the webapp feature generation page
 * Implements fluent interface pattern for test scenario creation
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { UIPatternLocators } from '../../helpers/UIPatternLocators';
import { WebappBasePage } from './WebappBasePage';

export class FeatureGeneratorPage extends WebappBasePage {
  // Page sections
  public documentSelector: {
    dropdown: Locator;
    selectedDocuments: Locator;
    clearButton: Locator;
  };

  public generationControls: {
    generateButton: Locator;
    regenerateButton: Locator;
    settingsButton: Locator;
    aiModelSelector: Locator;
  };

  public editor: {
    container: Locator;
    monacoEditor: Locator;
    toolbar: Locator;
    formatButton: Locator;
    validateButton: Locator;
    lintingStatus: Locator;
  };

  public outputActions: {
    saveButton: Locator;
    downloadButton: Locator;
    copyButton: Locator;
    shareButton: Locator;
  };

  public sidebar: {
    container: Locator;
    documentPreview: Locator;
    aiSuggestions: Locator;
    testCoverage: Locator;
  };

  private featureNameInput: Locator;
  private progressIndicator: Locator;
  private generationStatus: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    // Document selector section
    this.documentSelector = {
      dropdown: this.roleBasedLocators.combobox('Select documents'),
      selectedDocuments: this.roleBasedLocators.list('Selected documents'),
      clearButton: this.roleBasedLocators.button('Clear selection')
    };

    // Generation controls
    this.generationControls = {
      generateButton: this.roleBasedLocators.button('Generate Features'),
      regenerateButton: this.roleBasedLocators.button('Regenerate'),
      settingsButton: this.roleBasedLocators.button('Generation settings'),
      aiModelSelector: this.roleBasedLocators.combobox('AI Model')
    };

    // Editor section
    this.editor = {
      container: this.roleBasedLocators.region('Gherkin Editor'),
      monacoEditor: this.page.locator('.monaco-editor, [data-testid="gherkin-editor"]'),
      toolbar: this.roleBasedLocators.toolbar('Editor toolbar'),
      formatButton: this.roleBasedLocators.button('Format'),
      validateButton: this.roleBasedLocators.button('Validate'),
      lintingStatus: this.roleBasedLocators.status('Linting')
    };

    // Output actions
    this.outputActions = {
      saveButton: this.roleBasedLocators.button('Save Feature'),
      downloadButton: this.roleBasedLocators.button('Download'),
      copyButton: this.roleBasedLocators.button('Copy to clipboard'),
      shareButton: this.roleBasedLocators.button('Share')
    };

    // Sidebar
    this.sidebar = {
      container: this.roleBasedLocators.complementary('Feature assistant'),
      documentPreview: this.roleBasedLocators.region('Document preview'),
      aiSuggestions: this.roleBasedLocators.region('AI suggestions'),
      testCoverage: this.roleBasedLocators.region('Test coverage')
    };

    // Other elements
    this.featureNameInput = this.roleBasedLocators.textboxByLabel('Feature name');
    this.progressIndicator = this.roleBasedLocators.progressbar('Generation progress');
    this.generationStatus = this.roleBasedLocators.status('Generation status');
  }

  async navigate(): Promise<void> {
    await this.navigateToWebapp('/features');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await super.waitForWebappReady();
    await expect(this.documentSelector.dropdown).toBeVisible();
    await expect(this.generationControls.generateButton).toBeVisible();
    await expect(this.editor.container).toBeVisible();
  }

  // ============= Fluent Interface Methods =============

  /**
   * Select document for feature generation (fluent)
   */
  async withDocument(documentName: string): Promise<FeatureGeneratorPage> {
    await this.selectDocument(documentName);
    return this;
  }

  /**
   * Select multiple documents (fluent)
   */
  async withDocuments(...documentNames: string[]): Promise<FeatureGeneratorPage> {
    for (const name of documentNames) {
      await this.selectDocument(name);
    }
    return this;
  }

  /**
   * Set AI model (fluent)
   */
  async usingModel(modelName: string): Promise<FeatureGeneratorPage> {
    await this.generationControls.aiModelSelector.selectOption(modelName);
    return this;
  }

  /**
   * Configure generation settings (fluent)
   */
  async withSettings(settings: {
    includeEdgeCases?: boolean;
    includeNegativeScenarios?: boolean;
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
  }): Promise<FeatureGeneratorPage> {
    await this.openGenerationSettings();
    
    if (settings.includeEdgeCases !== undefined) {
      const checkbox = this.roleBasedLocators.checkbox('Include edge cases');
      settings.includeEdgeCases ? await checkbox.check() : await checkbox.uncheck();
    }
    
    if (settings.includeNegativeScenarios !== undefined) {
      const checkbox = this.roleBasedLocators.checkbox('Include negative scenarios');
      settings.includeNegativeScenarios ? await checkbox.check() : await checkbox.uncheck();
    }
    
    if (settings.detailLevel) {
      const radio = this.roleBasedLocators.radio(settings.detailLevel);
      await radio.check();
    }
    
    await this.closeGenerationSettings();
    return this;
  }

  /**
   * Generate features (fluent)
   */
  async generate(): Promise<FeatureGeneratorPage> {
    await this.generationControls.generateButton.click();
    await this.waitForGenerationComplete();
    return this;
  }

  // ============= Document Selection Methods =============

  async selectDocument(documentName: string): Promise<void> {
    await this.documentSelector.dropdown.click();
    const option = this.uiPatterns.multiSelect('Select documents').options.filter({ hasText: documentName });
    await option.click();
    
    // Click outside to close dropdown
    await this.page.locator('body').click({ position: { x: 0, y: 0 } });
  }

  async clearDocumentSelection(): Promise<void> {
    if (await this.documentSelector.clearButton.isVisible()) {
      await this.documentSelector.clearButton.click();
    }
  }

  async getSelectedDocuments(): Promise<string[]> {
    const items = await this.documentSelector.selectedDocuments.locator(
      this.roleBasedLocators.listitem()
    ).all();
    
    const documents: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) documents.push(text.trim());
    }
    
    return documents;
  }

  // ============= Generation Methods =============

  async generateFeatures(): Promise<void> {
    await this.generationControls.generateButton.click();
    await this.waitForGenerationComplete();
  }

  async regenerateFeatures(): Promise<void> {
    if (await this.generationControls.regenerateButton.isVisible()) {
      await this.generationControls.regenerateButton.click();
      await this.waitForGenerationComplete();
    }
  }

  async waitForGenerationComplete(): Promise<void> {
    // Wait for progress indicator to appear
    await expect(this.progressIndicator).toBeVisible({ timeout: 5000 });
    
    // Wait for it to disappear (generation complete)
    await expect(this.progressIndicator).not.toBeVisible({ timeout: 60000 });
    
    // Verify editor has content
    await expect(this.editor.monacoEditor).toBeVisible();
    await expect(this.generationStatus).toContainText(/complete|success/i);
  }

  async openGenerationSettings(): Promise<void> {
    await this.generationControls.settingsButton.click();
    const settingsModal = this.roleBasedLocators.dialog('Generation Settings');
    await expect(settingsModal).toBeVisible();
  }

  async closeGenerationSettings(): Promise<void> {
    const saveButton = this.roleBasedLocators.button('Save settings');
    await saveButton.click();
  }

  // ============= Editor Methods =============

  async getGeneratedContent(): Promise<string> {
    return await this.editor.monacoEditor.textContent() || '';
  }

  async editGeneratedContent(newContent: string): Promise<void> {
    // Focus editor
    await this.editor.monacoEditor.click();
    
    // Select all and replace
    await this.page.keyboard.press('Meta+A');
    await this.page.keyboard.type(newContent);
  }

  async appendToGeneratedContent(additionalContent: string): Promise<void> {
    await this.editor.monacoEditor.click();
    await this.page.keyboard.press('End');
    await this.page.keyboard.type('\n' + additionalContent);
  }

  async formatContent(): Promise<void> {
    await this.editor.formatButton.click();
    await this.page.waitForTimeout(500); // Wait for formatting
  }

  async validateContent(): Promise<void> {
    await this.editor.validateButton.click();
    await expect(this.editor.lintingStatus).toBeVisible();
  }

  async hasValidationErrors(): Promise<boolean> {
    await this.validateContent();
    const status = await this.editor.lintingStatus.textContent() || '';
    return status.toLowerCase().includes('error');
  }

  async getValidationErrors(): Promise<string[]> {
    if (!await this.hasValidationErrors()) return [];
    
    const errorPanel = this.roleBasedLocators.region('Validation errors');
    const errors = await errorPanel.locator('.error-item').all();
    
    const errorMessages: string[] = [];
    for (const error of errors) {
      const message = await error.textContent();
      if (message) errorMessages.push(message);
    }
    
    return errorMessages;
  }

  // ============= Save and Export Methods =============

  async saveFeature(featureName: string): Promise<void> {
    await this.outputActions.saveButton.click();
    
    // Wait for save dialog
    const saveDialog = this.roleBasedLocators.dialog('Save Feature');
    await expect(saveDialog).toBeVisible();
    
    // Enter feature name
    await this.featureNameInput.fill(featureName);
    
    // Confirm save
    const confirmButton = saveDialog.locator(this.roleBasedLocators.button('Save'));
    await confirmButton.click();
    
    // Wait for success
    const successAlert = this.roleBasedLocators.alert();
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/saved.*success/i);
  }

  async downloadFeature(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.outputActions.downloadButton.click();
    
    const download = await downloadPromise;
    const path = await download.path();
    return path || '';
  }

  async copyToClipboard(): Promise<void> {
    await this.outputActions.copyButton.click();
    
    // Verify copy success
    const tooltip = this.roleBasedLocators.tooltip();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/copied/i);
  }

  async shareFeature(): Promise<string> {
    await this.outputActions.shareButton.click();
    
    // Wait for share dialog
    const shareDialog = this.roleBasedLocators.dialog('Share Feature');
    await expect(shareDialog).toBeVisible();
    
    // Get share link
    const linkInput = shareDialog.locator(this.roleBasedLocators.textbox('Share link'));
    const shareLink = await linkInput.inputValue();
    
    // Close dialog
    const closeButton = shareDialog.locator(this.roleBasedLocators.button('Close'));
    await closeButton.click();
    
    return shareLink;
  }

  // ============= Sidebar Methods =============

  async toggleSidebar(): Promise<void> {
    const toggleButton = this.roleBasedLocators.button('Toggle assistant');
    await toggleButton.click();
    await this.page.waitForTimeout(300); // Animation
  }

  async isSidebarVisible(): Promise<boolean> {
    return await this.sidebar.container.isVisible();
  }

  async getDocumentPreview(): Promise<string> {
    if (!await this.sidebar.documentPreview.isVisible()) {
      await this.toggleSidebar();
    }
    
    return await this.sidebar.documentPreview.textContent() || '';
  }

  async getAISuggestions(): Promise<string[]> {
    if (!await this.sidebar.aiSuggestions.isVisible()) {
      await this.toggleSidebar();
    }
    
    const suggestions = await this.sidebar.aiSuggestions.locator('.suggestion-item').all();
    const suggestionTexts: string[] = [];
    
    for (const suggestion of suggestions) {
      const text = await suggestion.textContent();
      if (text) suggestionTexts.push(text);
    }
    
    return suggestionTexts;
  }

  async applyAISuggestion(suggestionIndex: number): Promise<void> {
    const suggestions = await this.sidebar.aiSuggestions.locator('.suggestion-item').all();
    if (suggestionIndex < suggestions.length) {
      await suggestions[suggestionIndex].click();
    }
  }

  async getTestCoverageMetrics(): Promise<{
    scenarios: number;
    steps: number;
    coverage: string;
  }> {
    if (!await this.sidebar.testCoverage.isVisible()) {
      await this.toggleSidebar();
    }
    
    const metrics = await this.sidebar.testCoverage.textContent() || '';
    
    return {
      scenarios: parseInt(metrics.match(/(\d+)\s*scenarios?/i)?.[1] || '0'),
      steps: parseInt(metrics.match(/(\d+)\s*steps?/i)?.[1] || '0'),
      coverage: metrics.match(/(\d+%)\s*coverage/i)?.[1] || '0%'
    };
  }

  // ============= Validation Methods =============

  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.documentSelector.dropdown).toBeVisible();
      await expect(this.generationControls.generateButton).toBeVisible();
      await expect(this.editor.container).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  async hasRequiredElements(): Promise<boolean> {
    const elements = [
      this.documentSelector.dropdown,
      this.generationControls.generateButton,
      this.editor.container,
      this.outputActions.saveButton
    ];
    
    for (const element of elements) {
      if (!await element.isVisible()) {
        return false;
      }
    }
    
    return true;
  }

  async canGenerateFeatures(): Promise<boolean> {
    const hasDocuments = (await this.getSelectedDocuments()).length > 0;
    const buttonEnabled = await this.generationControls.generateButton.isEnabled();
    return hasDocuments && buttonEnabled;
  }
}