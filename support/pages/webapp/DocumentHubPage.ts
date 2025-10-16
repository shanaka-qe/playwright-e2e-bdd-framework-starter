/**
 * Document Hub Page Object
 * 
 * Handles all interactions with the webapp document management page
 * Uses enhanced role-based locators for better accessibility and maintainability
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { UIPatternLocators } from '../../helpers/UIPatternLocators';
import { BasePage } from '../BasePage';

export class DocumentHubPage extends BasePage {
  private uiPatterns: UIPatternLocators;
  
  // Page sections
  public uploadSection: {
    container: Locator;
    dropZone: Locator;
    fileInput: Locator;
    uploadButton: Locator;
    progressBar: Locator;
  };

  public documentTable: {
    container: Locator;
    headers: Locator;
    rows: Locator;
    emptyState: Locator;
  };

  public searchAndFilter: {
    searchInput: Locator;
    filterDropdown: Locator;
    clearFiltersButton: Locator;
    resultCount: Locator;
  };

  public bulkActions: {
    selectAllCheckbox: Locator;
    selectedCount: Locator;
    deleteButton: Locator;
    downloadButton: Locator;
  };

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.uiPatterns = new UIPatternLocators(page);
    this.initializeElements();
  }

  private initializeElements(): void {
    // Upload Section - using semantic locators
    this.uploadSection = {
      container: this.roleBasedLocators.section('Upload Documents'),
      dropZone: this.roleBasedLocators.region('Drop files here'),
      fileInput: this.roleBasedLocators.testId('document-file-input'), // Fallback for hidden input
      uploadButton: this.roleBasedLocators.button('Upload Documents'),
      progressBar: this.roleBasedLocators.progressbar('Upload progress')
    };

    // Document Table - using table-specific patterns
    this.documentTable = {
      container: this.roleBasedLocators.table('Documents'),
      headers: this.roleBasedLocators.columnheader(''),
      rows: this.roleBasedLocators.row(),
      emptyState: this.roleBasedLocators.status('No documents')
    };

    // Search and Filter - using form patterns
    this.searchAndFilter = {
      searchInput: this.roleBasedLocators.searchbox('Search documents'),
      filterDropdown: this.roleBasedLocators.combobox('Filter by type'),
      clearFiltersButton: this.roleBasedLocators.button('Clear filters'),
      resultCount: this.roleBasedLocators.status()
    };

    // Bulk Actions - using interactive patterns
    this.bulkActions = {
      selectAllCheckbox: this.roleBasedLocators.checkbox('Select all'),
      selectedCount: this.roleBasedLocators.status('selected'),
      deleteButton: this.roleBasedLocators.button('Delete selected'),
      downloadButton: this.roleBasedLocators.button('Download selected')
    };
  }

  async navigate(): Promise<void> {
    await this.page.goto('/documents');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    // Wait for main content area
    await expect(this.roleBasedLocators.main()).toBeVisible();
    
    // Wait for document section
    await expect(this.uploadSection.container).toBeVisible();
    
    // Wait for either document table or empty state
    const hasDocuments = await this.documentTable.rows.count() > 0;
    if (hasDocuments) {
      await expect(this.documentTable.container).toBeVisible();
    } else {
      await expect(this.documentTable.emptyState).toBeVisible();
    }
  }

  // ============= Upload Actions =============

  async uploadDocument(filePath: string): Promise<void> {
    await this.uploadSection.fileInput.setInputFiles(filePath);
    await this.waitForUploadToStart();
  }

  async uploadMultipleDocuments(filePaths: string[]): Promise<void> {
    await this.uploadSection.fileInput.setInputFiles(filePaths);
    await this.waitForUploadToStart();
  }

  async dragAndDropFile(filePath: string): Promise<void> {
    const dropZone = this.uploadSection.dropZone;
    
    // Create a data transfer object
    const dataTransfer = await this.page.evaluateHandle(() => new DataTransfer());
    
    // Dispatch drag events
    await dropZone.dispatchEvent('dragenter', { dataTransfer });
    await dropZone.dispatchEvent('dragover', { dataTransfer });
    
    // For real drag-drop, we use the file input as fallback
    await this.uploadDocument(filePath);
  }

  async waitForUploadToStart(): Promise<void> {
    await expect(this.uploadSection.progressBar).toBeVisible({ timeout: 5000 });
  }

  async waitForUploadComplete(): Promise<void> {
    // Wait for progress bar to disappear
    await expect(this.uploadSection.progressBar).not.toBeVisible({ timeout: 30000 });
    
    // Wait for success notification
    const successAlert = this.roleBasedLocators.alert();
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/upload.*success/i);
  }

  // ============= Document Status =============

  async waitForDocumentStatus(documentName: string, status: string): Promise<void> {
    const documentRow = this.uiPatterns.tableRow(documentName);
    const statusCell = documentRow.locator(this.roleBasedLocators.cell(status));
    await expect(statusCell).toBeVisible({ timeout: 60000 });
  }

  async waitForAllDocumentsProcessed(count: number): Promise<void> {
    const processedCells = this.roleBasedLocators.cell('Processed');
    await expect(processedCells).toHaveCount(count, { timeout: 60000 });
  }

  async getDocumentStatus(documentName: string): Promise<string> {
    const documentRow = this.uiPatterns.tableRow(documentName);
    const statusCell = documentRow.locator('[role="cell"]').filter({ hasText: /Processing|Processed|Failed/ });
    return await statusCell.textContent() || '';
  }

  // ============= Search and Filter =============

  async searchDocuments(searchTerm: string): Promise<void> {
    await this.searchAndFilter.searchInput.fill(searchTerm);
    await this.searchAndFilter.searchInput.press('Enter');
    await this.waitForSearchResults();
  }

  async filterByType(fileType: string): Promise<void> {
    await this.searchAndFilter.filterDropdown.selectOption(fileType);
    await this.waitForFilterResults();
  }

  async clearAllFilters(): Promise<void> {
    if (await this.searchAndFilter.clearFiltersButton.isVisible()) {
      await this.searchAndFilter.clearFiltersButton.click();
      await this.waitForFilterResults();
    }
  }

  async waitForSearchResults(): Promise<void> {
    // Wait for loading indicator to disappear
    const loadingIndicator = this.uiPatterns.loadingIndicator();
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible();
    }
    
    // Result count should update
    await expect(this.searchAndFilter.resultCount).toBeVisible();
  }

  async waitForFilterResults(): Promise<void> {
    await this.waitForSearchResults();
  }

  async getResultCount(): Promise<number> {
    const resultText = await this.searchAndFilter.resultCount.textContent() || '0';
    const match = resultText.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  // ============= Document Actions =============

  async selectDocument(documentName: string): Promise<void> {
    const documentRow = this.uiPatterns.tableRow(documentName);
    const checkbox = documentRow.locator(this.roleBasedLocators.checkbox(''));
    await checkbox.check();
  }

  async selectAllDocuments(): Promise<void> {
    await this.bulkActions.selectAllCheckbox.check();
  }

  async deleteDocument(documentName: string): Promise<void> {
    const deleteButton = this.uiPatterns.tableRowAction(documentName, 'Delete');
    await deleteButton.click();
    await this.confirmDeletion();
  }

  async deleteSelectedDocuments(): Promise<void> {
    await this.bulkActions.deleteButton.click();
    await this.confirmDeletion();
  }

  async downloadDocument(documentName: string): Promise<void> {
    const downloadButton = this.uiPatterns.tableRowAction(documentName, 'Download');
    const downloadPromise = this.page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;
    await download.saveAs(`downloads/${documentName}`);
  }

  async viewDocumentDetails(documentName: string): Promise<void> {
    const documentRow = this.uiPatterns.tableRow(documentName);
    const viewButton = documentRow.locator(this.roleBasedLocators.button('View'));
    await viewButton.click();
    
    // Wait for modal to open
    const detailsModal = this.roleBasedLocators.dialog('Document Details');
    await expect(detailsModal).toBeVisible();
  }

  private async confirmDeletion(): Promise<void> {
    const confirmDialog = this.roleBasedLocators.dialog();
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = confirmDialog.locator(this.roleBasedLocators.button('Confirm'));
    await confirmButton.click();
    
    // Wait for deletion success
    const successAlert = this.roleBasedLocators.alert();
    await expect(successAlert).toBeVisible();
    await expect(successAlert).toContainText(/delet.*success/i);
  }

  // ============= Table Sorting =============

  async sortByColumn(columnName: string): Promise<void> {
    const sortableHeader = this.uiPatterns.sortableTableHeader(columnName);
    await sortableHeader.click();
    await this.waitForSortComplete();
  }

  async getSortDirection(columnName: string): Promise<'ascending' | 'descending' | 'none'> {
    const header = this.uiPatterns.sortableTableHeader(columnName);
    const ariaSort = await header.getAttribute('aria-sort');
    return (ariaSort as 'ascending' | 'descending') || 'none';
  }

  private async waitForSortComplete(): Promise<void> {
    // Wait for any loading state
    const loadingIndicator = this.uiPatterns.loadingIndicator();
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible();
    }
  }

  // ============= Pagination =============

  async goToNextPage(): Promise<void> {
    const pagination = this.uiPatterns.pagination();
    await pagination.next.click();
    await this.waitForPageLoad();
  }

  async goToPreviousPage(): Promise<void> {
    const pagination = this.uiPatterns.pagination();
    await pagination.previous.click();
    await this.waitForPageLoad();
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pagination = this.uiPatterns.pagination();
    const pageButton = pagination.pageNumbers.filter({ hasText: pageNumber.toString() });
    await pageButton.click();
    await this.waitForPageLoad();
  }

  async getCurrentPage(): Promise<number> {
    const pagination = this.uiPatterns.pagination();
    const currentPageText = await pagination.currentPage.textContent() || '1';
    return parseInt(currentPageText);
  }

  // ============= Validation Methods =============

  async isDocumentUploaded(documentName: string): Promise<boolean> {
    const documentRow = this.uiPatterns.tableRow(documentName);
    return await documentRow.isVisible();
  }

  async getDocumentCount(): Promise<number> {
    return await this.documentTable.rows.count();
  }

  async hasEmptyState(): Promise<boolean> {
    return await this.documentTable.emptyState.isVisible();
  }

  async getSelectedDocumentCount(): Promise<number> {
    const selectedText = await this.bulkActions.selectedCount.textContent() || '0';
    const match = selectedText.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  // ============= Error Handling =============

  async getUploadError(): Promise<string> {
    const errorAlert = this.page.locator(this.roleBasedLocators.alert()).filter({ hasText: /error/i });
    return await errorAlert.textContent() || '';
  }

  async hasUploadError(): Promise<boolean> {
    const errorAlert = this.page.locator(this.roleBasedLocators.alert()).filter({ hasText: /error/i });
    return await errorAlert.isVisible();
  }

  async dismissError(): Promise<void> {
    const errorAlert = this.page.locator(this.roleBasedLocators.alert()).filter({ hasText: /error/i });
    const dismissButton = errorAlert.locator(this.roleBasedLocators.button('Dismiss'));
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
    }
  }

  // ============= Advanced Interactions =============

  async performBulkAction(action: string, documentNames: string[]): Promise<void> {
    // Select specified documents
    for (const name of documentNames) {
      await this.selectDocument(name);
    }
    
    // Perform action based on type
    switch (action.toLowerCase()) {
      case 'delete':
        await this.deleteSelectedDocuments();
        break;
      case 'download':
        await this.bulkActions.downloadButton.click();
        break;
      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }
  }

  async waitForProcessingComplete(): Promise<void> {
    // Wait for all processing indicators to disappear
    const processingStatus = this.roleBasedLocators.cell('Processing');
    await expect(processingStatus).toHaveCount(0, { timeout: 60000 });
  }
}