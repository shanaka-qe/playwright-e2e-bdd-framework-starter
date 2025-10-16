/**
 * Header Component
 * 
 * Reusable component for application headers
 * Can be used across different applications with configuration
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';

export interface HeaderConfig {
  logoText?: string;
  hasUserMenu?: boolean;
  hasNotifications?: boolean;
  hasSearch?: boolean;
  customActions?: string[];
}

export class HeaderComponent {
  private roleBasedLocators: RoleBasedLocators;
  
  // Header elements
  public container: Locator;
  public logo: Locator;
  public navigation: Locator;
  public userMenu?: Locator;
  public notifications?: Locator;
  public searchBox?: Locator;
  public actions: Map<string, Locator>;

  constructor(
    private page: Page,
    private config: HeaderConfig = {}
  ) {
    this.roleBasedLocators = new RoleBasedLocators(page);
    this.actions = new Map();
    this.initializeElements();
  }

  private initializeElements(): void {
    // Container
    this.container = this.roleBasedLocators.banner();
    
    // Logo
    const logoText = this.config.logoText || 'Testoria';
    this.logo = this.roleBasedLocators.link(logoText);
    
    // Navigation
    this.navigation = this.roleBasedLocators.navigation('Primary');
    
    // Optional elements based on config
    if (this.config.hasUserMenu !== false) {
      this.userMenu = this.roleBasedLocators.button('User menu');
    }
    
    if (this.config.hasNotifications) {
      this.notifications = this.roleBasedLocators.button('Notifications');
    }
    
    if (this.config.hasSearch) {
      this.searchBox = this.roleBasedLocators.searchbox();
    }
    
    // Custom actions
    if (this.config.customActions) {
      for (const action of this.config.customActions) {
        this.actions.set(action, this.roleBasedLocators.button(action));
      }
    }
  }

  /**
   * Wait for header to be ready
   */
  async waitForReady(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.logo).toBeVisible();
  }

  /**
   * Navigate to home by clicking logo
   */
  async clickLogo(): Promise<void> {
    await this.logo.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<Locator | null> {
    if (!this.userMenu) return null;
    
    await this.userMenu.click();
    const menu = this.roleBasedLocators.menu('User menu');
    await expect(menu).toBeVisible();
    return menu;
  }

  /**
   * Get user menu items
   */
  async getUserMenuItems(): Promise<string[]> {
    const menu = await this.openUserMenu();
    if (!menu) return [];
    
    const items = await menu.locator(this.roleBasedLocators.menuitem('')).all();
    const itemTexts: string[] = [];
    
    for (const item of items) {
      const text = await item.textContent();
      if (text) itemTexts.push(text.trim());
    }
    
    return itemTexts;
  }

  /**
   * Select user menu item
   */
  async selectUserMenuItem(itemName: string): Promise<void> {
    const menu = await this.openUserMenu();
    if (!menu) throw new Error('User menu not available');
    
    const menuItem = menu.locator(this.roleBasedLocators.menuitem(itemName));
    await menuItem.click();
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    if (!this.notifications) return 0;
    
    const badge = this.notifications.locator('[role="status"], .badge, .count');
    if (await badge.isVisible()) {
      const text = await badge.textContent() || '0';
      return parseInt(text.replace(/\D/g, '')) || 0;
    }
    return 0;
  }

  /**
   * Open notifications panel
   */
  async openNotifications(): Promise<Locator | null> {
    if (!this.notifications) return null;
    
    await this.notifications.click();
    const panel = this.roleBasedLocators.region('Notifications');
    await expect(panel).toBeVisible();
    return panel;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    const panel = await this.openNotifications();
    if (!panel) return;
    
    const clearButton = panel.locator(this.roleBasedLocators.button('Clear all'));
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  /**
   * Perform search
   */
  async search(query: string): Promise<void> {
    if (!this.searchBox) throw new Error('Search not available in header');
    
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
    
    // Wait for search results
    await expect(this.roleBasedLocators.region('Search results')).toBeVisible();
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    if (!this.searchBox) return;
    
    await this.searchBox.clear();
    const clearButton = this.searchBox.locator('..').locator('[aria-label*="clear" i]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  /**
   * Click custom action
   */
  async clickAction(actionName: string): Promise<void> {
    const action = this.actions.get(actionName);
    if (!action) throw new Error(`Action "${actionName}" not found in header`);
    
    await action.click();
  }

  /**
   * Get navigation items
   */
  async getNavigationItems(): Promise<string[]> {
    const navItems = await this.navigation.locator(
      this.roleBasedLocators.link('')
    ).all();
    
    const items: string[] = [];
    for (const item of navItems) {
      const text = await item.textContent();
      if (text) items.push(text.trim());
    }
    
    return items;
  }

  /**
   * Navigate to section via navigation
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const navLink = this.navigation.locator(
      this.roleBasedLocators.link(sectionName)
    );
    await navLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in (by presence of user menu)
   */
  async isUserLoggedIn(): Promise<boolean> {
    if (!this.userMenu) return false;
    return await this.userMenu.isVisible();
  }

  /**
   * Get current user display name
   */
  async getCurrentUser(): Promise<string | null> {
    if (!this.userMenu) return null;
    
    const userText = await this.userMenu.textContent();
    return userText?.trim() || null;
  }

  /**
   * Logout via user menu
   */
  async logout(): Promise<void> {
    await this.selectUserMenuItem('Logout');
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Check if header is sticky
   */
  async isSticky(): Promise<boolean> {
    const position = await this.container.evaluate(el => 
      window.getComputedStyle(el).position
    );
    return position === 'fixed' || position === 'sticky';
  }

  /**
   * Get header height
   */
  async getHeight(): Promise<number> {
    const box = await this.container.boundingBox();
    return box?.height || 0;
  }

  /**
   * Validate header structure
   */
  async validate(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.navigation).toBeVisible();
    
    if (this.userMenu) {
      await expect(this.userMenu).toBeVisible();
    }
    
    if (this.notifications) {
      await expect(this.notifications).toBeVisible();
    }
    
    if (this.searchBox) {
      await expect(this.searchBox).toBeVisible();
    }
    
    for (const [name, action] of this.actions) {
      await expect(action).toBeVisible();
    }
  }
}