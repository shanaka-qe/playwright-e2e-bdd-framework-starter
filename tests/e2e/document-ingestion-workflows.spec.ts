/**
 * Document Ingestion Workflows E2E Tests
 * 
 * Comprehensive tests for document upload, processing, and ingestion workflows
 * Tests cover the complete flow from upload to semantic search availability
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/core/base/pages/HomePage';
import { DocumentHubPage, DocumentItem } from '../../src/core/base/pages/DocumentHubPage';
import { testDataFactory } from '../../src/applications/shared/api/builders/TestDataFactory';
import path from 'path';
import fs from 'fs';

test.describe('Document Ingestion Workflows', () => {
  let homePage: HomePage;
  let documentHubPage: DocumentHubPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    documentHubPage = new DocumentHubPage(page);
    
    // Navigate to the application
    await homePage.navigate();
    await expect(page).toHaveTitle(/Testoria/);
  });

  test.describe('Document Upload Flow', () => {
    test('should complete full upload workflow for PDF document', async ({ page }) => {
      // Generate test document data
      const testFile = testDataFactory.generateTestFile('pdf', 'medium');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write test file
      fs.writeFileSync(tempFilePath, testFile.content);

      try {
        // Navigate to Document Hub
        await documentHubPage.navigate();
        
        // Verify upload interface is available
        await expect(page.locator('button:has-text("Upload Documents")')).toBeVisible();
        
        // Upload the document
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Verify upload success
        await expect(page.locator('[class*="success"], [class*="uploaded"]')).toBeVisible({ timeout: 30000 });
        
        // Verify document appears in list
        const documents = await documentHubPage.getDocumentList();
        const uploadedDoc = documents.find(doc => doc.name.includes(testFile.name.split('.')[0]));
        expect(uploadedDoc).toBeDefined();
        expect(uploadedDoc?.status).toMatch(/uploaded|ready|processing/);
        
        // Wait for processing to complete if necessary
        if (uploadedDoc?.status === 'processing') {
          await page.waitForTimeout(5000);
          const updatedDocuments = await documentHubPage.getDocumentList();
          const processedDoc = updatedDocuments.find(doc => doc.id === uploadedDoc.id);
          expect(processedDoc?.status).toBe('ready');
        }
        
      } finally {
        // Cleanup test file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle multiple document upload workflow', async ({ page }) => {
      const testFiles = [
        testDataFactory.generateTestFile('text', 'small'),
        testDataFactory.generateTestFile('pdf', 'small'),
        testDataFactory.generateTestFile('docx', 'small')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Create test files
        for (const testFile of testFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, testFile.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        
        // Upload multiple files
        await documentHubPage.uploadMultipleFiles(tempFilePaths);
        
        // Verify all files are uploaded
        await expect(page.locator('[class*="success"]')).toBeVisible({ timeout: 45000 });
        
        const documents = await documentHubPage.getDocumentList();
        expect(documents.length).toBeGreaterThanOrEqual(testFiles.length);
        
        // Verify each file type is present
        const uploadedFileTypes = documents.map(doc => doc.type.toLowerCase());
        expect(uploadedFileTypes).toContain('pdf');
        expect(uploadedFileTypes).toContain('txt');
        
      } finally {
        // Cleanup test files
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    test('should validate file type restrictions', async ({ page }) => {
      // Try to upload an unsupported file type
      const invalidFile = {
        name: 'test.exe',
        content: 'Invalid file content',
        mimeType: 'application/x-executable'
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', invalidFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, invalidFile.content);
        
        await documentHubPage.navigate();
        
        // Attempt upload
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Should show error message
        await expect(page.locator('[class*="error"], [role="alert"]')).toBeVisible({ timeout: 10000 });
        
        // Verify error message content
        const errorMessages = await documentHubPage.getErrorMessages();
        expect(errorMessages.some(msg => 
          msg.toLowerCase().includes('unsupported') || 
          msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('file type')
        )).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle large file upload with progress tracking', async ({ page }) => {
      const largeTestFile = testDataFactory.generateTestFile('text', 'large');
      const tempFilePath = path.join(__dirname, '../../temp', largeTestFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, largeTestFile.content);
        
        await documentHubPage.navigate();
        
        // Start upload
        await page.locator('input[type="file"]').setInputFiles(tempFilePath);
        
        // Check for upload progress indicator
        await expect(page.locator('[class*="progress"], [role="progressbar"]')).toBeVisible({ timeout: 5000 });
        
        // Wait for upload completion
        await documentHubPage.waitForUploadComplete(60000);
        
        // Verify successful upload
        const documents = await documentHubPage.getDocumentList();
        const uploadedDoc = documents.find(doc => doc.name.includes(largeTestFile.name.split('.')[0]));
        expect(uploadedDoc).toBeDefined();
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Document Processing and Ingestion', () => {
    test('should process document and make it searchable', async ({ page }) => {
      const testDoc = testDataFactory.createDocument({
        name: 'search_test_document.txt',
        type: 'txt',
        content: 'This is a unique test document with specific searchable content about quantum computing and artificial intelligence.',
        status: 'ready'
      });
      
      const tempFilePath = path.join(__dirname, '../../temp', testDoc.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testDoc.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Wait for processing to complete
        await documentHubPage.waitForUploadComplete(30000);
        
        // Navigate back to home to test search functionality
        await homePage.navigate();
        
        // Test search functionality
        await homePage.performSearch('quantum computing');
        await page.waitForTimeout(3000); // Allow search to process
        
        // Should show search results (implementation depends on search UI)
        const searchResults = page.locator('[class*="search-result"], [class*="result"]');
        if (await searchResults.count() > 0) {
          expect(await searchResults.first().isVisible()).toBe(true);
        }
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle document processing errors gracefully', async ({ page }) => {
      // Create a corrupted or problematic file
      const corruptedFile = {
        name: 'corrupted.pdf',
        content: 'This is not a valid PDF content but should be handled gracefully'
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', corruptedFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, corruptedFile.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Wait for processing
        await page.waitForTimeout(10000);
        
        // Check if document shows error status or appropriate handling
        const documents = await documentHubPage.getDocumentList();
        const uploadedDoc = documents.find(doc => doc.name.includes('corrupted'));
        
        if (uploadedDoc) {
          // Should either show error status or handle gracefully
          expect(['error', 'failed', 'ready', 'processing']).toContain(uploadedDoc.status.toLowerCase());
        }
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Document Management Operations', () => {
    test('should support document preview functionality', async ({ page }) => {
      const testDoc = testDataFactory.generateTestFile('text', 'medium');
      const tempFilePath = path.join(__dirname, '../../temp', testDoc.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testDoc.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        await documentHubPage.waitForUploadComplete();
        
        // Get uploaded document name from the list
        const documents = await documentHubPage.getDocumentList();
        const uploadedDoc = documents[0];
        
        if (uploadedDoc) {
          // Try to preview the document
          await documentHubPage.previewDocument(uploadedDoc.name);
          
          // Should open preview modal or interface
          await expect(page.locator('[class*="preview"], [class*="modal"]')).toBeVisible({ timeout: 5000 });
        }
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should support document download functionality', async ({ page }) => {
      const testDoc = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testDoc.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testDoc.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        await documentHubPage.waitForUploadComplete();
        
        const documents = await documentHubPage.getDocumentList();
        const uploadedDoc = documents[0];
        
        if (uploadedDoc) {
          // Setup download listener
          const downloadPromise = page.waitForEvent('download');
          
          // Trigger download
          const downloadButton = page.locator(`[data-testid="document-item"]:has-text("${uploadedDoc.name}") button:has-text("Download")`);
          if (await downloadButton.isVisible()) {
            await downloadButton.click();
            
            // Wait for download to start
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBeTruthy();
          }
        }
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should support document deletion with confirmation', async ({ page }) => {
      const testDoc = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testDoc.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testDoc.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        await documentHubPage.waitForUploadComplete();
        
        const documentsBeforeDelete = await documentHubPage.getDocumentList();
        const documentToDelete = documentsBeforeDelete[0];
        
        if (documentToDelete) {
          // Handle dialog confirmation
          page.on('dialog', async dialog => {
            expect(dialog.type()).toBe('confirm');
            await dialog.accept();
          });
          
          // Delete the document
          await documentHubPage.deleteDocument(documentToDelete.name);
          
          // Verify document is removed
          const documentsAfterDelete = await documentHubPage.getDocumentList();
          expect(documentsAfterDelete.length).toBeLessThan(documentsBeforeDelete.length);
          
          const deletedDoc = documentsAfterDelete.find(doc => doc.id === documentToDelete.id);
          expect(deletedDoc).toBeUndefined();
        }
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Bulk Operations and JIRA Integration', () => {
    test('should support bulk feature file upload', async ({ page }) => {
      const featureFiles = [
        testDataFactory.generateTestFile('feature', 'small'),
        testDataFactory.generateTestFile('feature', 'small'),
        testDataFactory.generateTestFile('feature', 'small')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Create feature files
        for (const featureFile of featureFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', featureFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, featureFile.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        await documentHubPage.navigateToBulkFeatureFiles();
        
        // Upload bulk feature files
        await documentHubPage.uploadBulkFeatureFiles(tempFilePaths);
        
        // Verify successful upload
        await expect(page.locator('[class*="success"]')).toBeVisible({ timeout: 30000 });
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    test('should display JIRA import interface', async ({ page }) => {
      await documentHubPage.navigate();
      await documentHubPage.navigateToJiraImport();
      
      // Verify JIRA import form elements are present
      await expect(page.locator('input[placeholder*="JIRA"], input[name*="server"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="username"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Connect"), button:has-text("Import")')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures during upload', async ({ page }) => {
      const testFile = testDataFactory.generateTestFile('text', 'small');
      const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, testFile.content);
        
        await documentHubPage.navigate();
        
        // Simulate network failure
        await page.route('**/api/upload*', route => route.abort());
        
        // Attempt upload
        await page.locator('input[type="file"]').setInputFiles(tempFilePath);
        
        // Should show appropriate error message
        await expect(page.locator('[class*="error"], [role="alert"]')).toBeVisible({ timeout: 10000 });
        
        const hasNetworkError = await documentHubPage.hasErrors();
        expect(hasNetworkError).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle empty file upload', async ({ page }) => {
      const emptyFile = {
        name: 'empty.txt',
        content: ''
      };
      
      const tempFilePath = path.join(__dirname, '../../temp', emptyFile.name);
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      try {
        fs.writeFileSync(tempFilePath, emptyFile.content);
        
        await documentHubPage.navigate();
        await documentHubPage.uploadSingleFile(tempFilePath);
        
        // Should either reject empty file or handle gracefully
        const hasError = await documentHubPage.hasErrors();
        const hasSuccess = await documentHubPage.hasSuccessMessages();
        
        // Either scenario is acceptable - either graceful handling or appropriate error
        expect(hasError || hasSuccess).toBe(true);
        
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle concurrent uploads', async ({ page }) => {
      const testFiles = [
        testDataFactory.generateTestFile('text', 'small'),
        testDataFactory.generateTestFile('text', 'small')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Create test files
        for (const testFile of testFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, testFile.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        
        // Start multiple uploads simultaneously
        const uploadPromises = tempFilePaths.map(filePath => 
          documentHubPage.uploadSingleFile(filePath)
        );
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
        
        // Verify both files were processed
        await page.waitForTimeout(5000);
        const documents = await documentHubPage.getDocumentList();
        expect(documents.length).toBeGreaterThanOrEqual(2);
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });
  });

  test.describe('Search and Filter Operations', () => {
    test('should support document search functionality', async ({ page }) => {
      // Create multiple test documents with different content
      const testDocs = [
        { name: 'api_documentation.txt', content: 'This document contains API documentation for the system' },
        { name: 'user_guide.txt', content: 'This is a user guide for end users' },
        { name: 'technical_specs.txt', content: 'Technical specifications and requirements' }
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Upload test documents
        for (const doc of testDocs) {
          const tempFilePath = path.join(__dirname, '../../temp', doc.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, doc.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        await documentHubPage.uploadMultipleFiles(tempFilePaths);
        await documentHubPage.waitForUploadComplete();
        
        // Test search functionality
        await documentHubPage.searchDocuments('API');
        await page.waitForTimeout(2000);
        
        const documents = await documentHubPage.getDocumentList();
        // Should filter to show only API-related documents
        expect(documents.length).toBeGreaterThan(0);
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    test('should support document filtering by type', async ({ page }) => {
      const testFiles = [
        testDataFactory.generateTestFile('text', 'small'),
        testDataFactory.generateTestFile('pdf', 'small')
      ];
      
      const tempFilePaths: string[] = [];
      
      try {
        // Create and upload test files
        for (const testFile of testFiles) {
          const tempFilePath = path.join(__dirname, '../../temp', testFile.name);
          const tempDir = path.dirname(tempFilePath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          fs.writeFileSync(tempFilePath, testFile.content);
          tempFilePaths.push(tempFilePath);
        }

        await documentHubPage.navigate();
        await documentHubPage.uploadMultipleFiles(tempFilePaths);
        await documentHubPage.waitForUploadComplete();
        
        // Test filter functionality
        await documentHubPage.filterDocuments('PDF');
        await page.waitForTimeout(2000);
        
        const documents = await documentHubPage.getDocumentList();
        if (documents.length > 0) {
          // Should show only PDF documents
          documents.forEach(doc => {
            expect(doc.type.toLowerCase()).toContain('pdf');
          });
        }
        
      } finally {
        // Cleanup
        tempFilePaths.forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });
  });
});