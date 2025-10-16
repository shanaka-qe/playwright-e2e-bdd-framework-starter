/**
 * Home Page Object Model
 * 
 * Represents the main landing page of Testoria application
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Page Elements
  private readonly pageTitle: Locator;
  private readonly systemOverviewTitle: Locator;
  private readonly searchInput: Locator;
  private readonly qaGenieButton: Locator;
  private readonly sidebar: Locator;
  private readonly mainContent: Locator;
  private readonly navigationTabs: Locator;
  private readonly collapseButton: Locator;
  private readonly expandButton: Locator;

  // Navigation tab selectors
  private readonly overviewTab: Locator;
  private readonly documentHubTab: Locator;
  private readonly featureGeneratorTab: Locator;
  private readonly settingsTab: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize page elements
    this.pageTitle = page.locator('h1:has-text("Application")');
    this.systemOverviewTitle = page.locator('h2:has-text("System Overview")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.qaGenieButton = page.locator('button[aria-label="Open QA Genie"]');
    this.sidebar = page.locator('nav');
    this.mainContent = page.locator('main');
    this.navigationTabs = page.locator('nav button');
    this.collapseButton = page.locator('button:has-text("←")');
    this.expandButton = page.locator('button:has-text("→")');

    // Navigation tabs
    this.overviewTab = page.locator('button:has-text("Overview")');
    this.documentHubTab = page.locator('button:has-text("Document Hub")');
    this.featureGeneratorTab = page.locator('button:has-text("Test Features Generator")');
    this.settingsTab = page.locator('button:has-text("Settings")');
  }

  /**
   * Navigate to home page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
  }

  /**
   * Wait for home page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    await this.sidebar.waitFor({ state: 'visible' });
    await this.mainContent.waitFor({ state: 'visible' });
  }

  /**
   * Get page title text
   */
  async getPageTitleText(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Search functionality
   */
  async performSearch(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Get search value
   */
  async getSearchValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  /**
   * Open QA Genie chat
   */
  async openQAGenie(): Promise<void> {
    await this.qaGenieButton.click();
    await this.page.waitForTimeout(1000); // Wait for animation
  }

  /**
   * Check if QA Genie is available
   */
  async isQAGenieAvailable(): Promise<boolean> {
    return await this.qaGenieButton.isVisible();
  }

  /**
   * Navigation methods
   */
  async navigateToOverview(): Promise<void> {
    await this.overviewTab.click();
    await this.waitForTabActivation('Overview');
  }

  async navigateToDocumentHub(): Promise<void> {
    await this.documentHubTab.click();
    await this.waitForTabActivation('Document Hub');
  }

  async navigateToFeatureGenerator(): Promise<void> {
    await this.featureGeneratorTab.click();
    await this.waitForTabActivation('Test Features Generator');
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsTab.click();
    await this.waitForTabActivation('Settings');
  }

  /**
   * Wait for tab to be activated
   */
  private async waitForTabActivation(tabName: string): Promise<void> {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await tab.waitFor({ state: 'visible' });
    // Check if tab has active styling
    const hasActiveClass = await tab.evaluate((el) => {
      const classes = el.className;
      return classes.includes('bg-blue-600') || classes.includes('border-blue-500') || classes.includes('active');
    });
    
    if (!hasActiveClass) {
      await this.page.waitForTimeout(500); // Wait for styling to apply
    }
  }

  /**
   * Get all available navigation tabs
   */
  async getNavigationTabs(): Promise<string[]> {
    const tabs = await this.navigationTabs.allTextContents();
    return tabs.filter(tab => tab.trim().length > 0);
  }

  /**
   * Get currently active tab
   */
  async getActiveTab(): Promise<string> {
    const activeTab = this.page.locator('nav button.bg-blue-600, nav button[class*="border-blue-500"]');
    return await activeTab.textContent() || '';
  }

  /**
   * Sidebar functionality
   */
  async collapseSidebar(): Promise<void> {
    if (await this.collapseButton.isVisible()) {
      await this.collapseButton.click();
      await this.expandButton.waitFor({ state: 'visible', timeout: 2000 });
    }
  }

  async expandSidebar(): Promise<void> {
    if (await this.expandButton.isVisible()) {
      await this.expandButton.click();
      await this.collapseButton.waitFor({ state: 'visible', timeout: 2000 });
    }
  }

  async isSidebarCollapsed(): Promise<boolean> {
    return await this.expandButton.isVisible();
  }

  async isSidebarExpanded(): Promise<boolean> {
    return await this.collapseButton.isVisible();
  }

  /**
   * Overview page specific methods
   */
  async getSystemOverviewTitle(): Promise<string> {
    await this.navigateToOverview();
    return await this.systemOverviewTitle.textContent() || '';
  }

  async getOverviewContent(): Promise<string[]> {
    await this.navigateToOverview();
    const contentElements = this.page.locator('[class*="overview"], [class*="status"], [class*="statistic"]');
    return await contentElements.allTextContents();
  }

  async getChromaDBStatus(): Promise<string> {
    await this.navigateToOverview();
    const chromaElements = this.page.locator('text=ChromaDB, text=Vector Database, text=Status');
    if (await chromaElements.count() > 0) {
      return await chromaElements.first().textContent() || '';
    }
    return '';
  }

  /**
   * Responsive design checks
   */
  async checkResponsiveLayout(viewport: { width: number; height: number }): Promise<boolean> {
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(500); // Wait for layout adjustment
    
    // Check if main elements are still visible
    const isPageTitleVisible = await this.pageTitle.isVisible();
    const isSidebarVisible = await this.sidebar.isVisible();
    const isMainContentVisible = await this.mainContent.isVisible();
    
    return isPageTitleVisible && isSidebarVisible && isMainContentVisible;
  }

  /**
   * Performance checks
   */
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.navigate();
    return Date.now() - startTime;
  }

  /**
   * Error state checks
   */
  async hasErrorMessages(): Promise<boolean> {
    const errorSelectors = [
      '[class*="error"]',
      '[class*="alert-error"]',
      'text=Error',
      'text=Failed',
      '[role="alert"]'
    ];
    
    for (const selector of errorSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Accessibility checks
   */
  async checkAccessibilityFeatures(): Promise<{
    hasAriaLabels: boolean;
    hasHeadingStructure: boolean;
    hasKeyboardNavigation: boolean;
  }> {
    const hasAriaLabels = await this.qaGenieButton.isVisible();
    const hasHeadingStructure = await this.pageTitle.isVisible() && await this.systemOverviewTitle.isVisible();
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').count();
    const hasKeyboardNavigation = focusedElement > 0;
    
    return {
      hasAriaLabels,
      hasHeadingStructure,
      hasKeyboardNavigation
    };
  }

  /**
   * Browser compatibility checks
   */
  async getBrowserInfo(): Promise<{
    userAgent: string;
    viewport: { width: number; height: number };
    devicePixelRatio: number;
  }> {
    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    const viewport = this.page.viewportSize() || { width: 0, height: 0 };
    const devicePixelRatio = await this.page.evaluate(() => window.devicePixelRatio);
    
    return {
      userAgent,
      viewport,
      devicePixelRatio
    };
  }
}

export default HomePage;