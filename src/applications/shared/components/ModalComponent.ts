/**
 * Modal Component
 * 
 * Reusable component for modal dialogs
 * Supports various modal patterns and interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';

export interface ModalConfig {
  title?: string;
  hasCloseButton?: boolean;
  hasOverlayClose?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  animation?: boolean;
}

export class ModalComponent {
  private roleBasedLocators: RoleBasedLocators;
  
  // Modal elements
  public container: Locator;
  public overlay: Locator;
  public header: Locator;
  public title: Locator;
  public closeButton?: Locator;
  public body: Locator;
  public footer: Locator;

  constructor(
    private page: Page,
    private config: ModalConfig = {}
  ) {
    this.roleBasedLocators = new RoleBasedLocators(page);
    this.initializeElements();
  }

  private initializeElements(): void {
    // Container - try to find by title or generic dialog
    if (this.config.title) {
      this.container = this.roleBasedLocators.dialog(this.config.title);
    } else {
      this.container = this.roleBasedLocators.dialog();
    }
    
    // Overlay/backdrop
    this.overlay = this.page.locator('.modal-overlay, .modal-backdrop, [data-testid="modal-overlay"]');
    
    // Header section
    this.header = this.container.locator('header, .modal-header, [data-testid="modal-header"]');
    
    // Title
    this.title = this.header.locator(
      this.roleBasedLocators.heading('', 2)
    ).or(this.header.locator('h2, h3, .modal-title'));
    
    // Close button
    if (this.config.hasCloseButton !== false) {
      this.closeButton = this.container.locator(
        this.roleBasedLocators.button('Close')
      ).or(this.container.locator('[aria-label*="close" i], button:has-text("×")'));
    }
    
    // Body section
    this.body = this.container.locator('main, .modal-body, [role="main"], [data-testid="modal-body"]');
    
    // Footer section
    this.footer = this.container.locator('footer, .modal-footer, [data-testid="modal-footer"]');
  }

  /**
   * Wait for modal to be fully visible
   */
  async waitForOpen(): Promise<void> {
    await expect(this.container).toBeVisible();
    
    // Wait for animation if configured
    if (this.config.animation) {
      await this.page.waitForTimeout(300);
    }
    
    // Ensure content is loaded
    await expect(this.body).toBeVisible();
  }

  /**
   * Wait for modal to be closed
   */
  async waitForClose(): Promise<void> {
    await expect(this.container).not.toBeVisible();
    
    // Wait for animation if configured
    if (this.config.animation) {
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Close modal using close button
   */
  async close(): Promise<void> {
    if (!this.closeButton) {
      throw new Error('Modal does not have a close button');
    }
    
    await this.closeButton.click();
    await this.waitForClose();
  }

  /**
   * Close modal using escape key
   */
  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForClose();
  }

  /**
   * Close modal by clicking overlay
   */
  async closeByClickingOverlay(): Promise<void> {
    if (this.config.hasOverlayClose === false) {
      throw new Error('Modal does not support overlay close');
    }
    
    // Click on overlay but outside modal content
    await this.overlay.click({ position: { x: 10, y: 10 } });
    await this.waitForClose();
  }

  /**
   * Get modal title text
   */
  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  /**
   * Get modal body content
   */
  async getBodyText(): Promise<string> {
    return await this.body.textContent() || '';
  }

  /**
   * Check if modal is open
   */
  async isOpen(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Get footer buttons
   */
  async getFooterButtons(): Promise<string[]> {
    const buttons = await this.footer.locator(
      this.roleBasedLocators.button('')
    ).all();
    
    const buttonTexts: string[] = [];
    for (const button of buttons) {
      const text = await button.textContent();
      if (text) buttonTexts.push(text.trim());
    }
    
    return buttonTexts;
  }

  /**
   * Click footer button by text
   */
  async clickFooterButton(buttonText: string): Promise<void> {
    const button = this.footer.locator(
      this.roleBasedLocators.button(buttonText)
    );
    await button.click();
  }

  /**
   * Fill form field in modal
   */
  async fillField(label: string, value: string): Promise<void> {
    const field = this.body.locator(
      this.roleBasedLocators.textboxByLabel(label)
    );
    await field.fill(value);
  }

  /**
   * Select option in modal
   */
  async selectOption(label: string, option: string): Promise<void> {
    const select = this.body.locator(
      this.roleBasedLocators.combobox(label)
    );
    await select.selectOption(option);
  }

  /**
   * Check checkbox in modal
   */
  async checkOption(label: string): Promise<void> {
    const checkbox = this.body.locator(
      this.roleBasedLocators.checkbox(label)
    );
    await checkbox.check();
  }

  /**
   * Submit form in modal
   */
  async submit(): Promise<void> {
    // Try to find submit button in footer first
    let submitButton = this.footer.locator(
      this.roleBasedLocators.button('Submit')
    ).or(this.footer.locator(this.roleBasedLocators.button('Save')));
    
    // If not in footer, check body
    if (!await submitButton.isVisible()) {
      submitButton = this.body.locator(
        this.roleBasedLocators.button('Submit')
      ).or(this.body.locator(this.roleBasedLocators.button('Save')));
    }
    
    await submitButton.click();
  }

  /**
   * Cancel modal action
   */
  async cancel(): Promise<void> {
    const cancelButton = this.footer.locator(
      this.roleBasedLocators.button('Cancel')
    );
    await cancelButton.click();
    await this.waitForClose();
  }

  /**
   * Get validation errors in modal
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.body.locator(
      '[role="alert"], .error-message, .field-error'
    ).all();
    
    const errorTexts: string[] = [];
    for (const error of errors) {
      const text = await error.textContent();
      if (text) errorTexts.push(text.trim());
    }
    
    return errorTexts;
  }

  /**
   * Check if modal has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errors = await this.getValidationErrors();
    return errors.length > 0;
  }

  /**
   * Wait for modal content to load
   */
  async waitForContentLoad(): Promise<void> {
    // Wait for any loading indicators to disappear
    const loadingIndicator = this.body.locator(
      '[aria-busy="true"], .loading, .spinner'
    );
    
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 30000 });
    }
  }

  /**
   * Get modal size
   */
  async getSize(): Promise<{ width: number; height: number }> {
    const box = await this.container.boundingBox();
    return {
      width: box?.width || 0,
      height: box?.height || 0
    };
  }

  /**
   * Check if modal is centered
   */
  async isCentered(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    
    const box = await this.container.boundingBox();
    if (!box) return false;
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    const viewportCenterX = viewport.width / 2;
    const viewportCenterY = viewport.height / 2;
    
    // Allow 10px tolerance
    return Math.abs(centerX - viewportCenterX) < 10 && 
           Math.abs(centerY - viewportCenterY) < 10;
  }

  /**
   * Validate modal structure
   */
  async validate(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.header).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.body).toBeVisible();
    
    if (this.closeButton) {
      await expect(this.closeButton).toBeVisible();
    }
    
    // Check if modal has proper ARIA attributes
    const role = await this.container.getAttribute('role');
    expect(role).toBe('dialog');
    
    const ariaModal = await this.container.getAttribute('aria-modal');
    expect(ariaModal).toBe('true');
    
    // Check if title is properly labeled
    const labelledBy = await this.container.getAttribute('aria-labelledby');
    if (labelledBy) {
      const titleId = await this.title.getAttribute('id');
      expect(labelledBy).toBe(titleId);
    }
  }

  /**
   * Drag modal (if draggable)
   */
  async drag(deltaX: number, deltaY: number): Promise<void> {
    const dragHandle = this.header.locator('.drag-handle').or(this.header);
    
    if (await dragHandle.isVisible()) {
      await dragHandle.hover();
      await this.page.mouse.down();
      await this.page.mouse.move(deltaX, deltaY);
      await this.page.mouse.up();
    }
  }

  /**
   * Resize modal (if resizable)
   */
  async resize(deltaWidth: number, deltaHeight: number): Promise<void> {
    const resizeHandle = this.container.locator('.resize-handle');
    
    if (await resizeHandle.isVisible()) {
      const box = await resizeHandle.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(
          box.x + box.width / 2 + deltaWidth,
          box.y + box.height / 2 + deltaHeight
        );
        await this.page.mouse.up();
      }
    }
  }
}