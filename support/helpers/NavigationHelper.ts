/**
 * Navigation Helper
 * 
 * Provides common navigation utilities across all applications
 * Handles routing, tab switching, and page transitions
 */

import { Page } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigateToWebappPage('dashboard');
  }

  /**
   * Navigate to a specific section by name
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const normalizedSection = sectionName.toLowerCase().replace(/\s+/g, '-');
    
    // Try navigation tab first
    const navTab = this.page.getByRole('tab', { name: new RegExp(sectionName, 'i') });
    if (await navTab.isVisible()) {
      await navTab.click();
      return;
    }

    // Try navigation link
    const navLink = this.page.getByRole('link', { name: new RegExp(sectionName, 'i') });
    if (await navLink.isVisible()) {
      await navLink.click();
      return;
    }

    // Try button navigation
    const navButton = this.page.getByRole('button', { name: new RegExp(sectionName, 'i') });
    if (await navButton.isVisible()) {
      await navButton.click();
      return;
    }

    // Fallback to direct URL navigation
    const currentUrl = this.page.url();
    const baseUrl = new URL(currentUrl).origin;
    await this.page.goto(`${baseUrl}/${normalizedSection}`);
  }

  /**
   * Navigate to a specific page within an application
   */
  async navigateToPage(applicationPath: string, pagePath: string = ''): Promise<void> {
    const currentUrl = this.page.url();
    const baseUrl = new URL(currentUrl).origin;
    const fullPath = pagePath ? `${applicationPath}/${pagePath}` : applicationPath;
    await this.page.goto(`${baseUrl}/${fullPath}`);
  }

  /**
   * Navigate to webapp specific pages
   */
  async navigateToWebappPage(pageName: string): Promise<void> {
    const pageRoutes: Record<string, string> = {
      'dashboard': '/dashboard',
      'document-hub': '/documents',
      'feature-generator': '/features',
      'settings': '/settings',
      'login': '/login',
      'profile': '/profile'
    };

    const route = pageRoutes[pageName.toLowerCase().replace(/\s+/g, '-')];
    if (!route) {
      throw new Error(`Unknown webapp page: ${pageName}`);
    }

    await this.navigateToPage('', route.substring(1)); // Remove leading slash
  }

  /**
   * Navigate to admin app specific pages
   */
  async navigateToAdminAppPage(pageName: string): Promise<void> {
    const pageRoutes: Record<string, string> = {
      'dashboard': '/admin/dashboard',
      'user-management': '/admin/users',
      'system-logs': '/admin/logs',
      'system-monitoring': '/admin/monitoring',
      'settings': '/admin/settings'
    };

    const route = pageRoutes[pageName.toLowerCase().replace(/\s+/g, '-')];
    if (!route) {
      throw new Error(`Unknown admin app page: ${pageName}`);
    }

    const currentUrl = this.page.url();
    const baseUrl = new URL(currentUrl).origin;
    await this.page.goto(`${baseUrl}${route}`);
  }

  /**
   * Switch between different tabs in the same application
   */
  async switchToTab(tabName: string): Promise<void> {
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') });
    await tab.click();
    
    // Wait for tab content to load
    const tabPanel = this.page.getByRole('tabpanel');
    await tabPanel.waitFor({ state: 'visible' });
  }

  /**
   * Navigate using breadcrumb links
   */
  async navigateViaBreadcrumb(breadcrumbText: string): Promise<void> {
    const breadcrumbNav = this.page.getByRole('navigation', { name: /breadcrumb/i });
    const breadcrumbLink = breadcrumbNav.getByRole('link', { name: new RegExp(breadcrumbText, 'i') });
    await breadcrumbLink.click();
  }

  /**
   * Open page in new tab
   */
  async openInNewTab(linkText: string): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.getByRole('link', { name: new RegExp(linkText, 'i') }).click({ modifiers: ['Meta'] })
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }

  /**
   * Navigate back in browser history
   */
  async navigateBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate forward in browser history
   */
  async navigateForward(): Promise<void> {
    await this.page.goForward();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Refresh current page
   */
  async refreshPage(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  }

  /**
   * Check if current page matches expected URL pattern
   */
  async verifyCurrentPage(expectedPath: string): Promise<boolean> {
    const currentUrl = this.page.url();
    const urlPattern = new RegExp(expectedPath.replace(/\s+/g, '-'), 'i');
    return urlPattern.test(currentUrl);
  }

  /**
   * Get current page title
   */
  async getCurrentPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Navigate to external URL
   */
  async navigateToExternalUrl(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForNavigation();
  }

  /**
   * Handle modal navigation (open modal)
   */
  async openModal(triggerElement: string): Promise<void> {
    const trigger = this.page.getByRole('button', { name: new RegExp(triggerElement, 'i') });
    await trigger.click();
    
    // Wait for modal to appear
    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });
  }

  /**
   * Handle modal navigation (close modal)
   */
  async closeModal(): Promise<void> {
    // Try escape key first
    await this.page.keyboard.press('Escape');
    
    // Wait a moment and check if modal is still visible
    await this.page.waitForTimeout(500);
    const modal = this.page.getByRole('dialog');
    
    if (await modal.isVisible()) {
      // Try close button
      const closeButton = modal.getByRole('button', { name: /close|cancel|×/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  }

  /**
   * Navigate through multi-step forms/wizards
   */
  async navigateToStep(stepName: string): Promise<void> {
    const stepButton = this.page.getByRole('button', { name: new RegExp(stepName, 'i') });
    await stepButton.click();
  }

  /**
   * Navigate to next step in wizard
   */
  async navigateToNextStep(): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: /next|continue/i });
    await nextButton.click();
  }

  /**
   * Navigate to previous step in wizard
   */
  async navigateToPreviousStep(): Promise<void> {
    const prevButton = this.page.getByRole('button', { name: /previous|back/i });
    await prevButton.click();
  }

  /**
   * Wait for specific element to be visible before navigation
   */
  async waitForElementThenNavigate(elementText: string, action: () => Promise<void>): Promise<void> {
    const element = this.page.getByText(new RegExp(elementText, 'i'));
    await element.waitFor({ state: 'visible' });
    await action();
  }
}