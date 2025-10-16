/**
 * Document Hub Page Object Model
 * 
 * Represents the document management and upload functionality
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: string;
}

export class DocumentHubPage extends BasePage {
  // Tab elements
  private readonly uploadDocumentsTab: Locator;
  private readonly bulkFeatureFilesTab: Locator;
  private readonly jiraImportTab: Locator;

  // Upload Documents tab elements
  private readonly fileInput: Locator;
  private readonly dragDropArea: Locator;
  private readonly uploadButton: Locator;
  private readonly uploadProgress: Locator;
  private readonly uploadInstructions: Locator;

  // Document list elements
  private readonly documentList: Locator;
  private readonly documentItems: Locator;
  private readonly searchInput: Locator;
  private readonly filterDropdown: Locator;
  private readonly paginationControls: Locator;
  private readonly documentsPerPageSelect: Locator;

  // Document actions
  private readonly previewButtons: Locator;
  private readonly downloadButtons: Locator;
  private readonly deleteButtons: Locator;

  // Bulk Feature Files tab elements
  private readonly bulkUploadArea: Locator;
  private readonly featureFileInput: Locator;
  private readonly bulkUploadButton: Locator;

  // JIRA Import tab elements
  private readonly jiraServerInput: Locator;
  private readonly jiraUsernameInput: Locator;
  private readonly jiraPasswordInput: Locator;
  private readonly jiraProjectInput: Locator;
  private readonly jiraConnectButton: Locator;
  private readonly jiraIssuesList: Locator;

  // Status and error elements
  private readonly statusMessages: Locator;
  private readonly errorMessages: Locator;
  private readonly successMessages: Locator;

  constructor(page: Page) {
    super(page);
    
    // Tab elements
    this.uploadDocumentsTab = page.locator('button:has-text("Upload Documents")');
    this.bulkFeatureFilesTab = page.locator('button:has-text("Bulk Feature Files")');
    this.jiraImportTab = page.locator('button:has-text("JIRA Import")');

    // Upload Documents tab
    this.fileInput = page.locator('input[type="file"]');
    this.dragDropArea = page.locator('[class*="drag"], [class*="drop"], [data-testid="drag-drop-area"]');
    this.uploadButton = page.locator('button:has-text("Upload"), button[type="submit"]');
    this.uploadProgress = page.locator('[class*="progress"], [role="progressbar"]');
    this.uploadInstructions = page.locator('text*="drag", text*="upload", text*="select files"');

    // Document list
    this.documentList = page.locator('[class*="document-list"], [data-testid="document-list"]');
    this.documentItems = page.locator('[class*="document-item"], [data-testid="document-item"]');
    this.searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]');
    this.filterDropdown = page.locator('select[class*="filter"], [data-testid="filter-dropdown"]');
    this.paginationControls = page.locator('[class*="pagination"], [data-testid="pagination"]');
    this.documentsPerPageSelect = page.locator('select[class*="per-page"]');

    // Document actions
    this.previewButtons = page.locator('button:has-text("Preview"), button[aria-label*="preview"]');
    this.downloadButtons = page.locator('button:has-text("Download"), button[aria-label*="download"]');
    this.deleteButtons = page.locator('button:has-text("Delete"), button[aria-label*="delete"]');

    // Bulk Feature Files
    this.bulkUploadArea = page.locator('[data-testid="bulk-upload-area"]');
    this.featureFileInput = page.locator('input[accept*=".feature"]');
    this.bulkUploadButton = page.locator('button:has-text("Bulk Upload")');

    // JIRA Import
    this.jiraServerInput = page.locator('input[placeholder*="JIRA"], input[name*="server"]');
    this.jiraUsernameInput = page.locator('input[placeholder*="username"], input[name*="username"]');
    this.jiraPasswordInput = page.locator('input[type="password"], input[name*="password"]');
    this.jiraProjectInput = page.locator('input[placeholder*="project"], input[name*="project"]');
    this.jiraConnectButton = page.locator('button:has-text("Connect"), button:has-text("Import")');
    this.jiraIssuesList = page.locator('[class*="jira-issues"], [data-testid="jira-issues"]');

    // Status messages
    this.statusMessages = page.locator('[class*="status"], [role="status"]');
    this.errorMessages = page.locator('[class*="error"], [role="alert"]');
    this.successMessages = page.locator('[class*="success"], [class*="notification"]');
  }

  /**
   * Navigate to Document Hub page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
    await this.navigateToDocumentHub();
  }

  /**
   * Navigate to Document Hub tab from main navigation
   */
  async navigateToDocumentHub(): Promise<void> {
    const documentHubButton = this.page.locator('button:has-text("Document Hub")');
    await documentHubButton.click();
    await this.waitForPageReady();
  }

  /**
   * Wait for Document Hub page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.uploadDocumentsTab.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Tab navigation methods
   */
  async navigateToUploadDocuments(): Promise<void> {
    await this.uploadDocumentsTab.click();
    await this.waitForTabContent('upload');
  }

  async navigateToBulkFeatureFiles(): Promise<void> {
    await this.bulkFeatureFilesTab.click();
    await this.waitForTabContent('bulk');
  }

  async navigateToJiraImport(): Promise<void> {
    await this.jiraImportTab.click();
    await this.waitForTabContent('jira');
  }

  private async waitForTabContent(tabType: 'upload' | 'bulk' | 'jira'): Promise<void> {
    switch (tabType) {
      case 'upload':
        await this.fileInput.waitFor({ state: 'visible', timeout: 5000 });
        break;
      case 'bulk':
        if (await this.bulkUploadArea.count() > 0) {
          await this.bulkUploadArea.waitFor({ state: 'visible', timeout: 5000 });
        }
        break;
      case 'jira':
        if (await this.jiraServerInput.count() > 0) {
          await this.jiraServerInput.waitFor({ state: 'visible', timeout: 5000 });
        }
        break;
    }
    await this.page.waitForTimeout(500); // Allow content to load
  }

  /**
   * Upload Documents functionality
   */
  async uploadSingleFile(filePath: string): Promise<void> {
    await this.navigateToUploadDocuments();
    await this.fileInput.setInputFiles(filePath);
    
    if (await this.uploadButton.isVisible()) {
      await this.uploadButton.click();
    }
    
    await this.waitForUploadComplete();
  }

  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    await this.navigateToUploadDocuments();
    await this.fileInput.setInputFiles(filePaths);
    
    if (await this.uploadButton.isVisible()) {
      await this.uploadButton.click();
    }
    
    await this.waitForUploadComplete();
  }

  async dragAndDropUpload(filePath: string): Promise<void> {
    await this.navigateToUploadDocuments();
    
    if (await this.dragDropArea.isVisible()) {
      // Simulate drag and drop
      await this.page.setInputFiles('input[type="file"]', filePath);
    } else {
      // Fallback to regular file input
      await this.uploadSingleFile(filePath);
    }
  }

  async waitForUploadComplete(timeout: number = 30000): Promise<void> {
    // Wait for upload progress to appear and then disappear
    if (await this.uploadProgress.count() > 0) {
      await this.uploadProgress.waitFor({ state: 'visible', timeout: 5000 });
      await this.uploadProgress.waitFor({ state: 'hidden', timeout });
    }
    
    // Wait for success message or document to appear in list
    await Promise.race([
      this.successMessages.waitFor({ state: 'visible', timeout: 10000 }),
      this.documentItems.first().waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }

  async getUploadInstructions(): Promise<string> {
    await this.navigateToUploadDocuments();
    return await this.uploadInstructions.textContent() || '';
  }

  /**
   * Document list management
   */
  async getDocumentList(): Promise<DocumentItem[]> {
    const documents: DocumentItem[] = [];
    const documentCount = await this.documentItems.count();
    
    for (let i = 0; i < documentCount; i++) {
      const item = this.documentItems.nth(i);
      const document: DocumentItem = {
        id: await item.getAttribute('data-id') || `doc-${i}`,
        name: await item.locator('[class*="name"], [data-testid="document-name"]').textContent() || '',
        type: await item.locator('[class*="type"], [data-testid="document-type"]').textContent() || '',
        size: await item.locator('[class*="size"], [data-testid="document-size"]').textContent() || '',
        uploadDate: await item.locator('[class*="date"], [data-testid="upload-date"]').textContent() || '',
        status: await item.locator('[class*="status"], [data-testid="document-status"]').textContent() || ''
      };
      documents.push(document);
    }
    
    return documents;
  }

  async searchDocuments(query: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="search"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await this.page.waitForTimeout(1000); // Wait for search results
    }
  }

  async filterDocuments(filterType: string): Promise<void> {
    if (await this.filterDropdown.isVisible()) {
      await this.filterDropdown.selectOption({ label: filterType });
      await this.page.waitForTimeout(1000); // Wait for filter results
    }
  }

  async previewDocument(documentName: string): Promise<void> {
    const documentItem = this.page.locator(`[data-testid="document-item"]:has-text("${documentName}")`);
    const previewButton = documentItem.locator('button:has-text("Preview")');
    
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await this.page.waitForTimeout(2000); // Wait for preview to load
    }
  }

  async downloadDocument(documentName: string): Promise<string> {
    const documentItem = this.page.locator(`[data-testid="document-item"]:has-text("${documentName}")`);
    const downloadButton = documentItem.locator('button:has-text("Download")');
    
    if (await downloadButton.isVisible()) {
      return await this.downloadFile(downloadButton.toString());
    }
    
    throw new Error(`Download button not found for document: ${documentName}`);
  }

  async deleteDocument(documentName: string): Promise<void> {
    const documentItem = this.page.locator(`[data-testid="document-item"]:has-text("${documentName}")`);
    const deleteButton = documentItem.locator('button:has-text("Delete")');
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Handle confirmation dialog
      await this.handleDialog(true);
      
      // Wait for document to be removed from list
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Pagination functionality
   */
  async navigateToNextPage(): Promise<void> {
    const nextButton = this.paginationControls.locator('button:has-text("Next"), button[aria-label*="next"]');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async navigateToPreviousPage(): Promise<void> {
    const prevButton = this.paginationControls.locator('button:has-text("Previous"), button[aria-label*="previous"]');
    if (await prevButton.isVisible() && await prevButton.isEnabled()) {
      await prevButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async setDocumentsPerPage(count: number): Promise<void> {
    if (await this.documentsPerPageSelect.isVisible()) {
      await this.documentsPerPageSelect.selectOption(count.toString());
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Bulk Feature Files functionality
   */
  async uploadBulkFeatureFiles(filePaths: string[]): Promise<void> {
    await this.navigateToBulkFeatureFiles();
    
    if (await this.featureFileInput.isVisible()) {
      await this.featureFileInput.setInputFiles(filePaths);
    }
    
    if (await this.bulkUploadButton.isVisible()) {
      await this.bulkUploadButton.click();
      await this.waitForUploadComplete();
    }
  }

  /**
   * JIRA Import functionality
   */
  async configureJiraConnection(config: {
    server: string;
    username: string;
    password: string;
    project: string;
  }): Promise<void> {
    await this.navigateToJiraImport();
    
    await this.jiraServerInput.fill(config.server);
    await this.jiraUsernameInput.fill(config.username);
    await this.jiraPasswordInput.fill(config.password);
    await this.jiraProjectInput.fill(config.project);
  }

  async connectToJira(): Promise<void> {
    await this.jiraConnectButton.click();
    await this.page.waitForTimeout(5000); // Wait for connection
    
    // Wait for issues list to load
    if (await this.jiraIssuesList.count() > 0) {
      await this.jiraIssuesList.waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  async getJiraIssues(): Promise<string[]> {
    const issues: string[] = [];
    if (await this.jiraIssuesList.isVisible()) {
      const issueElements = this.jiraIssuesList.locator('[class*="issue"], [data-testid="jira-issue"]');
      const count = await issueElements.count();
      
      for (let i = 0; i < count; i++) {
        const issueText = await issueElements.nth(i).textContent();
        if (issueText) {
          issues.push(issueText.trim());
        }
      }
    }
    return issues;
  }

  /**
   * Error handling and status checks
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

  /**
   * File type validation
   */
  async getSupportedFileTypes(): Promise<string[]> {
    const fileInput = this.fileInput;
    const acceptAttr = await fileInput.getAttribute('accept');
    
    if (acceptAttr) {
      return acceptAttr.split(',').map(type => type.trim());
    }
    
    return ['.pdf', '.docx', '.txt', '.md']; // Default supported types
  }

  async validateFileType(fileName: string): Promise<boolean> {
    const supportedTypes = await this.getSupportedFileTypes();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    return supportedTypes.some(type => 
      type === fileExtension || type === `*${fileExtension}`
    );
  }

  /**
   * Responsive design checks
   */
  async checkMobileLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
    
    return await this.uploadDocumentsTab.isVisible() && 
           await this.fileInput.isVisible();
  }

  async checkTabletLayout(): Promise<boolean> {
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.waitForTimeout(500);
    
    return await this.uploadDocumentsTab.isVisible() && 
           await this.bulkFeatureFilesTab.isVisible() && 
           await this.jiraImportTab.isVisible();
  }
}

export default DocumentHubPage;