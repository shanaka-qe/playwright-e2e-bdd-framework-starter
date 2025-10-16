/**
 * Sidebar Component
 * 
 * Reusable component for application sidebars
 * Supports collapsible navigation with multiple sections
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';

export interface SidebarNavItem {
  label: string;
  icon?: string;
  badge?: string;
  subitems?: string[];
}

export interface SidebarConfig {
  collapsible?: boolean;
  defaultExpanded?: boolean;
  sections?: {
    main?: SidebarNavItem[];
    secondary?: SidebarNavItem[];
    bottom?: SidebarNavItem[];
  };
}

export class SidebarComponent {
  private roleBasedLocators: RoleBasedLocators;
  
  // Sidebar elements
  public container: Locator;
  public navigation: Locator;
  public toggleButton?: Locator;
  public mainSection: Locator;
  public secondarySection?: Locator;
  public bottomSection?: Locator;
  
  // Navigation items
  private navItems: Map<string, Locator>;

  constructor(
    private page: Page,
    roleBasedLocators: RoleBasedLocators,
    private config: SidebarConfig = {}
  ) {
    this.roleBasedLocators = roleBasedLocators;
    this.navItems = new Map();
    this.initializeElements();
  }

  private initializeElements(): void {
    // Container
    this.container = this.roleBasedLocators.complementary('Sidebar').or(
      this.roleBasedLocators.navigation('Sidebar')
    );
    
    // Navigation
    this.navigation = this.container.locator(
      this.roleBasedLocators.navigation()
    );
    
    // Toggle button if collapsible
    if (this.config.collapsible) {
      this.toggleButton = this.roleBasedLocators.button('Toggle sidebar');
    }
    
    // Navigation sections
    this.mainSection = this.navigation.locator(
      this.roleBasedLocators.list('Main navigation')
    ).or(this.navigation.locator('[role="list"]').first());
    
    if (this.config.sections?.secondary) {
      this.secondarySection = this.navigation.locator(
        this.roleBasedLocators.list('Secondary navigation')
      );
    }
    
    if (this.config.sections?.bottom) {
      this.bottomSection = this.navigation.locator(
        this.roleBasedLocators.list('Bottom navigation')
      );
    }
    
    // Initialize navigation items
    this.initializeNavItems();
  }

  private initializeNavItems(): void {
    // Main section items
    if (this.config.sections?.main) {
      for (const item of this.config.sections.main) {
        this.navItems.set(item.label, this.roleBasedLocators.link(item.label));
      }
    }
    
    // Secondary section items
    if (this.config.sections?.secondary) {
      for (const item of this.config.sections.secondary) {
        this.navItems.set(item.label, this.roleBasedLocators.link(item.label));
      }
    }
    
    // Bottom section items
    if (this.config.sections?.bottom) {
      for (const item of this.config.sections.bottom) {
        this.navItems.set(item.label, this.roleBasedLocators.link(item.label));
      }
    }
  }

  /**
   * Wait for sidebar to be ready
   */
  async waitForReady(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.navigation).toBeVisible();
  }

  /**
   * Toggle sidebar visibility
   */
  async toggle(): Promise<void> {
    if (!this.toggleButton) {
      throw new Error('Sidebar is not collapsible');
    }
    
    await this.toggleButton.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Toggle sidebar visibility (alias for toggle)
   */
  async toggleSidebar(): Promise<void> {
    return this.toggle();
  }

  /**
   * Expand sidebar
   */
  async expand(): Promise<void> {
    if (!await this.isExpanded()) {
      await this.toggle();
    }
  }

  /**
   * Collapse sidebar
   */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }

  /**
   * Check if sidebar is expanded
   */
  async isExpanded(): Promise<boolean> {
    const expanded = await this.container.getAttribute('aria-expanded');
    if (expanded !== null) {
      return expanded === 'true';
    }
    
    // Fallback: check width
    const box = await this.container.boundingBox();
    return (box?.width || 0) > 100; // Assuming collapsed width is less than 100px
  }

  /**
   * Check if sidebar is expanded (alias for isExpanded)
   */
  async isSidebarExpanded(): Promise<boolean> {
    return this.isExpanded();
  }

  /**
   * Check if sidebar is collapsed
   */
  async isSidebarCollapsed(): Promise<boolean> {
    return !(await this.isExpanded());
  }

  /**
   * Navigate to item
   */
  async navigateTo(itemLabel: string): Promise<void> {
    const navItem = this.navItems.get(itemLabel);
    if (!navItem) {
      throw new Error(`Navigation item "${itemLabel}" not found`);
    }
    
    // Ensure sidebar is expanded for clicking
    if (this.config.collapsible) {
      await this.expand();
    }
    
    await navItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get active navigation item
   */
  async getActiveItem(): Promise<string | null> {
    const activeLink = this.navigation.locator(
      '[aria-current="page"], .active, [data-active="true"]'
    );
    
    if (await activeLink.isVisible()) {
      return await activeLink.textContent();
    }
    
    return null;
  }

  /**
   * Check if navigation item is active
   */
  async isItemActive(itemLabel: string): Promise<boolean> {
    const navItem = this.navItems.get(itemLabel);
    if (!navItem) return false;
    
    const ariaCurrent = await navItem.getAttribute('aria-current');
    if (ariaCurrent === 'page') return true;
    
    const hasActiveClass = await navItem.evaluate(el => 
      el.classList.contains('active') || 
      el.getAttribute('data-active') === 'true'
    );
    
    return hasActiveClass;
  }

  /**
   * Expand navigation group
   */
  async expandGroup(groupLabel: string): Promise<void> {
    const group = this.navigation.locator(
      this.roleBasedLocators.button(groupLabel)
    );
    
    const expanded = await group.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await group.click();
      await this.page.waitForTimeout(200); // Wait for animation
    }
  }

  /**
   * Collapse navigation group
   */
  async collapseGroup(groupLabel: string): Promise<void> {
    const group = this.navigation.locator(
      this.roleBasedLocators.button(groupLabel)
    );
    
    const expanded = await group.getAttribute('aria-expanded');
    if (expanded === 'true') {
      await group.click();
      await this.page.waitForTimeout(200); // Wait for animation
    }
  }

  /**
   * Get all visible navigation items
   */
  async getVisibleItems(): Promise<string[]> {
    const links = await this.navigation.locator(
      this.roleBasedLocators.link('')
    ).all();
    
    const items: string[] = [];
    for (const link of links) {
      if (await link.isVisible()) {
        const text = await link.textContent();
        if (text) items.push(text.trim());
      }
    }
    
    return items;
  }

  /**
   * Get item badge content
   */
  async getItemBadge(itemLabel: string): Promise<string | null> {
    const navItem = this.navItems.get(itemLabel);
    if (!navItem) return null;
    
    const badge = navItem.locator('..').locator('.badge, [role="status"]');
    if (await badge.isVisible()) {
      return await badge.textContent();
    }
    
    return null;
  }

  /**
   * Search in sidebar (if search exists)
   */
  async search(query: string): Promise<void> {
    const searchBox = this.container.locator(
      this.roleBasedLocators.searchbox()
    );
    
    if (await searchBox.isVisible()) {
      await searchBox.fill(query);
      await searchBox.press('Enter');
      await this.page.waitForTimeout(300); // Wait for filter
    }
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    const searchBox = this.container.locator(
      this.roleBasedLocators.searchbox()
    );
    
    if (await searchBox.isVisible()) {
      await searchBox.clear();
      await this.page.waitForTimeout(300); // Wait for filter clear
    }
  }

  /**
   * Get sidebar width
   */
  async getWidth(): Promise<number> {
    const box = await this.container.boundingBox();
    return box?.width || 0;
  }

  /**
   * Pin/unpin sidebar (if supported)
   */
  async togglePin(): Promise<void> {
    const pinButton = this.container.locator(
      this.roleBasedLocators.button('Pin sidebar')
    ).or(this.roleBasedLocators.button('Unpin sidebar'));
    
    if (await pinButton.isVisible()) {
      await pinButton.click();
    }
  }

  /**
   * Check if sidebar is pinned
   */
  async isPinned(): Promise<boolean> {
    const unpinButton = this.container.locator(
      this.roleBasedLocators.button('Unpin sidebar')
    );
    return await unpinButton.isVisible();
  }

  /**
   * Scroll to navigation item
   */
  async scrollToItem(itemLabel: string): Promise<void> {
    const navItem = this.navItems.get(itemLabel);
    if (!navItem) return;
    
    await navItem.scrollIntoViewIfNeeded();
  }

  /**
   * Validate sidebar structure
   */
  async validate(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.navigation).toBeVisible();
    
    if (this.config.collapsible && this.toggleButton) {
      await expect(this.toggleButton).toBeVisible();
    }
    
    // Validate at least one navigation item is visible
    const visibleItems = await this.getVisibleItems();
    expect(visibleItems.length).toBeGreaterThan(0);
  }

  /**
   * Get section items
   */
  async getSectionItems(section: 'main' | 'secondary' | 'bottom'): Promise<string[]> {
    let sectionLocator: Locator | undefined;
    
    switch (section) {
      case 'main':
        sectionLocator = this.mainSection;
        break;
      case 'secondary':
        sectionLocator = this.secondarySection;
        break;
      case 'bottom':
        sectionLocator = this.bottomSection;
        break;
    }
    
    if (!sectionLocator) return [];
    
    const items = await sectionLocator.locator(
      this.roleBasedLocators.listitem()
    ).all();
    
    const itemTexts: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) itemTexts.push(text.trim());
    }
    
    return itemTexts;
  }
}