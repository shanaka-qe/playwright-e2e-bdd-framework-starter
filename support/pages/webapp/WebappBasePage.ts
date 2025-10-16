/**
 * Webapp Base Page
 * 
 * Base class for all webapp page objects
 * Provides common functionality specific to the webapp application
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { UIPatternLocators } from '../../helpers/UIPatternLocators';
import { BasePage } from '../BasePage';

export abstract class WebappBasePage extends BasePage {
  protected uiPatterns: UIPatternLocators;
  
  // Common webapp elements
  protected header: {
    logo: Locator;
    userMenu: Locator;
    notifications: Locator;
    globalSearch: Locator;
  };

  protected sidebar: {
    container: Locator;
    navigation: Locator;
    documentHub: Locator;
    featureGenerator: Locator;
    settings: Locator;
    toggleButton: Locator;
  };

  protected footer: {
    container: Locator;
    version: Locator;
    links: Locator;
  };

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.uiPatterns = new UIPatternLocators(page);
    this.initializeCommonElements();
  }

  private initializeCommonElements(): void {
    // Header elements
    this.header = {
      logo: this.roleBasedLocators.link('Testoria'),
      userMenu: this.roleBasedLocators.button('User menu'),
      notifications: this.roleBasedLocators.button('Notifications'),
      globalSearch: this.roleBasedLocators.searchbox('Global search')
    };

    // Sidebar navigation
    this.sidebar = {
      container: this.roleBasedLocators.navigation('Main'),
      navigation: this.roleBasedLocators.navigation('Main navigation'),
      documentHub: this.roleBasedLocators.link('Document Hub'),
      featureGenerator: this.roleBasedLocators.link('Feature Generator'),
      settings: this.roleBasedLocators.link('Settings'),
      toggleButton: this.roleBasedLocators.button('Toggle sidebar')
    };

    // Footer elements
    this.footer = {
      container: this.roleBasedLocators.contentinfo(),
      version: this.roleBasedLocators.text('Version'),
      links: this.roleBasedLocators.navigation('Footer links')
    };
  }

  /**
   * Navigate to page and ensure webapp context
   */
  async navigateToWebapp(path: string): Promise<void> {
    const baseUrl = process.env.UI_BASE_URL || 'http://localhost:3001';
    await this.page.goto(`${baseUrl}${path}`);
    await this.waitForWebappReady();
  }

  /**
   * Wait for webapp to be ready
   */
  async waitForWebappReady(): Promise<void> {
    // Wait for main webapp container
    await expect(this.roleBasedLocators.main()).toBeVisible();
    
    // Wait for header and sidebar
    await expect(this.header.logo).toBeVisible();
    await expect(this.sidebar.container).toBeVisible();
    
    // Wait for any initial loading to complete
    await this.waitForLoadingComplete();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await expect(this.header.userMenu).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate using sidebar
   */
  async navigateViaSidebar(destination: 'Document Hub' | 'Feature Generator' | 'Settings'): Promise<void> {
    const linkMap = {
      'Document Hub': this.sidebar.documentHub,
      'Feature Generator': this.sidebar.featureGenerator,
      'Settings': this.sidebar.settings
    };

    const link = linkMap[destination];
    await link.click();
    await this.waitForNavigation();
  }

  /**
   * Toggle sidebar visibility
   */
  async toggleSidebar(): Promise<void> {
    await this.sidebar.toggleButton.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Check if sidebar is expanded
   */
  async isSidebarExpanded(): Promise<boolean> {
    const expanded = await this.sidebar.container.getAttribute('aria-expanded');
    return expanded === 'true';
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.header.userMenu.click();
    await expect(this.roleBasedLocators.menu('User menu')).toBeVisible();
  }

  /**
   * Logout from webapp
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    const logoutButton = this.roleBasedLocators.menuitem('Logout');
    await logoutButton.click();
    
    // Wait for redirect to login
    await expect(this.page).toHaveURL(/\/login/);
  }

  /**
   * Open notifications panel
   */
  async openNotifications(): Promise<void> {
    await this.header.notifications.click();
    await expect(this.roleBasedLocators.region('Notifications')).toBeVisible();
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    const badge = this.header.notifications.locator(this.roleBasedLocators.status());
    if (await badge.isVisible()) {
      const text = await badge.textContent() || '0';
      return parseInt(text);
    }
    return 0;
  }

  /**
   * Perform global search
   */
  async globalSearch(query: string): Promise<void> {
    await this.header.globalSearch.fill(query);
    await this.header.globalSearch.press('Enter');
    
    // Wait for search results
    await expect(this.roleBasedLocators.region('Search results')).toBeVisible();
  }

  /**
   * Get current page title from breadcrumb
   */
  async getCurrentPageTitle(): Promise<string> {
    const breadcrumb = this.uiPatterns.breadcrumb();
    const currentPage = await breadcrumb.current.textContent();
    return currentPage || '';
  }

  /**
   * Validate common webapp elements are present
   */
  async validateCommonElements(): Promise<void> {
    // Header validation
    await expect(this.header.logo).toBeVisible();
    await expect(this.header.userMenu).toBeVisible();
    
    // Sidebar validation
    await expect(this.sidebar.container).toBeVisible();
    await expect(this.sidebar.documentHub).toBeVisible();
    await expect(this.sidebar.featureGenerator).toBeVisible();
    
    // Footer validation
    await expect(this.footer.container).toBeVisible();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForWebappReady();
  }

  /**
   * Get webapp version
   */
  async getAppVersion(): Promise<string> {
    const versionText = await this.footer.version.textContent();
    const match = versionText?.match(/\d+\.\d+\.\d+/);
    return match ? match[0] : 'unknown';
  }

  /**
   * Check for error states
   */
  async hasErrorState(): Promise<boolean> {
    const errorAlert = this.roleBasedLocators.alert();
    const errorRegion = this.roleBasedLocators.region('Error');
    
    return (await errorAlert.isVisible()) || (await errorRegion.isVisible());
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasErrorState()) {
      const errorAlert = this.roleBasedLocators.alert();
      return await errorAlert.textContent();
    }
    return null;
  }

  /**
   * Dismiss any visible alerts
   */
  async dismissAlerts(): Promise<void> {
    const alerts = await this.roleBasedLocators.alert().all();
    for (const alert of alerts) {
      const dismissButton = alert.locator(this.roleBasedLocators.button('Dismiss'));
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
      }
    }
  }

  /**
   * Take screenshot with webapp context
   */
  async takeWebappScreenshot(name: string): Promise<Buffer> {
    return await this.takeScreenshot(`webapp-${name}`);
  }
}