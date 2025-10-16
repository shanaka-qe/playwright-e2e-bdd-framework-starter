/**
 * AdminApp Base Page
 * 
 * Base class for all admin app page objects
 * Provides common functionality specific to the admin application
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { UIPatternLocators } from '../../helpers/UIPatternLocators';
import { BasePage } from '../BasePage';

export abstract class AdminBasePage extends BasePage {
  protected uiPatterns: UIPatternLocators;
  
  // Common admin elements
  protected adminHeader: {
    logo: Locator;
    adminBadge: Locator;
    userMenu: Locator;
    systemStatus: Locator;
    quickActions: Locator;
  };

  protected adminSidebar: {
    container: Locator;
    dashboard: Locator;
    userManagement: Locator;
    systemLogs: Locator;
    systemMonitoring: Locator;
    settings: Locator;
    documentation: Locator;
  };

  protected adminFooter: {
    container: Locator;
    systemInfo: Locator;
    lastBackup: Locator;
    supportLink: Locator;
  };

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.uiPatterns = new UIPatternLocators(page);
    this.initializeAdminElements();
  }

  private initializeAdminElements(): void {
    // Admin header elements
    this.adminHeader = {
      logo: this.roleBasedLocators.link('Testoria Admin'),
      adminBadge: this.roleBasedLocators.text('ADMIN'),
      userMenu: this.roleBasedLocators.button('Admin menu'),
      systemStatus: this.roleBasedLocators.status('System status'),
      quickActions: this.roleBasedLocators.navigation('Quick actions')
    };

    // Admin sidebar navigation
    this.adminSidebar = {
      container: this.roleBasedLocators.navigation('Admin navigation'),
      dashboard: this.roleBasedLocators.link('Dashboard'),
      userManagement: this.roleBasedLocators.link('User Management'),
      systemLogs: this.roleBasedLocators.link('System Logs'),
      systemMonitoring: this.roleBasedLocators.link('System Monitoring'),
      settings: this.roleBasedLocators.link('Admin Settings'),
      documentation: this.roleBasedLocators.link('Documentation')
    };

    // Admin footer elements
    this.adminFooter = {
      container: this.roleBasedLocators.contentinfo(),
      systemInfo: this.roleBasedLocators.text('System info'),
      lastBackup: this.roleBasedLocators.text('Last backup'),
      supportLink: this.roleBasedLocators.link('Support')
    };
  }

  /**
   * Navigate to admin page and ensure admin context
   */
  async navigateToAdmin(path: string): Promise<void> {
    const baseUrl = process.env.ADMIN_BASE_URL || 'http://localhost:3021';
    await this.page.goto(`${baseUrl}${path}`);
    await this.waitForAdminReady();
  }

  /**
   * Wait for admin app to be ready
   */
  async waitForAdminReady(): Promise<void> {
    // Wait for main admin container
    await expect(this.roleBasedLocators.main()).toBeVisible();
    
    // Wait for admin-specific elements
    await expect(this.adminHeader.adminBadge).toBeVisible();
    await expect(this.adminSidebar.container).toBeVisible();
    
    // Wait for any initial loading to complete
    await this.waitForLoadingComplete();
  }

  /**
   * Verify admin privileges
   */
  async verifyAdminAccess(): Promise<boolean> {
    try {
      await expect(this.adminHeader.adminBadge).toBeVisible({ timeout: 5000 });
      const systemStatus = await this.adminHeader.systemStatus.isVisible();
      return systemStatus;
    } catch {
      return false;
    }
  }

  /**
   * Navigate using admin sidebar
   */
  async navigateViaAdminSidebar(
    destination: 'Dashboard' | 'User Management' | 'System Logs' | 'System Monitoring' | 'Admin Settings'
  ): Promise<void> {
    const linkMap = {
      'Dashboard': this.adminSidebar.dashboard,
      'User Management': this.adminSidebar.userManagement,
      'System Logs': this.adminSidebar.systemLogs,
      'System Monitoring': this.adminSidebar.systemMonitoring,
      'Admin Settings': this.adminSidebar.settings
    };

    const link = linkMap[destination];
    await link.click();
    await this.waitForAdminNavigation();
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<'healthy' | 'warning' | 'critical' | 'unknown'> {
    const statusText = await this.adminHeader.systemStatus.textContent() || '';
    
    if (statusText.toLowerCase().includes('healthy')) return 'healthy';
    if (statusText.toLowerCase().includes('warning')) return 'warning';
    if (statusText.toLowerCase().includes('critical')) return 'critical';
    return 'unknown';
  }

  /**
   * Open quick actions menu
   */
  async openQuickActions(): Promise<void> {
    const quickActionsButton = this.adminHeader.quickActions.locator(
      this.roleBasedLocators.button('Quick actions')
    );
    await quickActionsButton.click();
    await expect(this.roleBasedLocators.menu('Quick actions')).toBeVisible();
  }

  /**
   * Perform quick action
   */
  async performQuickAction(action: string): Promise<void> {
    await this.openQuickActions();
    const actionItem = this.roleBasedLocators.menuitem(action);
    await actionItem.click();
  }

  /**
   * Get last backup time
   */
  async getLastBackupTime(): Promise<string> {
    const backupText = await this.adminFooter.lastBackup.textContent() || '';
    const match = backupText.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    return match ? match[0] : 'Unknown';
  }

  /**
   * Check for system alerts
   */
  async hasSystemAlerts(): Promise<boolean> {
    const alerts = this.page.locator(
      this.roleBasedLocators.alert()
    ).filter({ hasText: /system|critical|warning/i });
    return await alerts.count() > 0;
  }

  /**
   * Get system alert messages
   */
  async getSystemAlerts(): Promise<string[]> {
    const alerts = await this.page.locator(
      this.roleBasedLocators.alert()
    ).filter({ hasText: /system|critical|warning/i }).all();
    
    const messages: string[] = [];
    for (const alert of alerts) {
      const text = await alert.textContent();
      if (text) messages.push(text);
    }
    return messages;
  }

  /**
   * Open admin user menu
   */
  async openAdminMenu(): Promise<void> {
    await this.adminHeader.userMenu.click();
    await expect(this.roleBasedLocators.menu('Admin menu')).toBeVisible();
  }

  /**
   * Switch to user view (non-admin)
   */
  async switchToUserView(): Promise<void> {
    await this.openAdminMenu();
    const switchViewItem = this.roleBasedLocators.menuitem('Switch to User View');
    await switchViewItem.click();
    
    // Wait for context switch
    await expect(this.page).toHaveURL(/\/app|\/dashboard/);
  }

  /**
   * Logout from admin
   */
  async adminLogout(): Promise<void> {
    await this.openAdminMenu();
    const logoutButton = this.roleBasedLocators.menuitem('Logout');
    await logoutButton.click();
    
    // Wait for redirect to admin login
    await expect(this.page).toHaveURL(/\/admin\/login/);
  }

  /**
   * Validate common admin elements
   */
  async validateAdminElements(): Promise<void> {
    // Header validation
    await expect(this.adminHeader.logo).toBeVisible();
    await expect(this.adminHeader.adminBadge).toBeVisible();
    await expect(this.adminHeader.systemStatus).toBeVisible();
    
    // Sidebar validation
    await expect(this.adminSidebar.container).toBeVisible();
    await expect(this.adminSidebar.dashboard).toBeVisible();
    await expect(this.adminSidebar.userManagement).toBeVisible();
    await expect(this.adminSidebar.systemLogs).toBeVisible();
    
    // Footer validation
    await expect(this.adminFooter.container).toBeVisible();
    await expect(this.adminFooter.systemInfo).toBeVisible();
  }

  /**
   * Wait for admin navigation to complete
   */
  async waitForAdminNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForAdminReady();
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<{
    version: string;
    environment: string;
    uptime: string;
  }> {
    const systemInfoText = await this.adminFooter.systemInfo.textContent() || '';
    
    return {
      version: systemInfoText.match(/v\d+\.\d+\.\d+/)?.[0] || 'unknown',
      environment: systemInfoText.match(/(development|staging|production)/i)?.[0] || 'unknown',
      uptime: systemInfoText.match(/\d+d \d+h/)?.[0] || 'unknown'
    };
  }

  /**
   * Check admin permissions for specific action
   */
  async hasPermission(action: string): Promise<boolean> {
    // Check if action button/link is enabled
    const actionElement = this.page.locator(
      this.roleBasedLocators.button(action)
    ).or(this.roleBasedLocators.link(action));
    
    if (await actionElement.isVisible()) {
      return await actionElement.isEnabled();
    }
    return false;
  }

  /**
   * Take screenshot with admin context
   */
  async takeAdminScreenshot(name: string): Promise<Buffer> {
    return await this.takeScreenshot(`admin-${name}`);
  }

  /**
   * Handle admin confirmation dialogs
   */
  async confirmAdminAction(action: string = 'Confirm'): Promise<void> {
    const confirmDialog = this.roleBasedLocators.dialog('Confirm Action');
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = confirmDialog.locator(
      this.roleBasedLocators.button(action)
    );
    await confirmButton.click();
    
    // Wait for dialog to close
    await expect(confirmDialog).not.toBeVisible();
  }

  /**
   * Get admin activity log entries
   */
  async getRecentActivity(limit: number = 5): Promise<string[]> {
    const activityList = this.roleBasedLocators.list('Recent Activity');
    const items = await activityList.locator(
      this.roleBasedLocators.listitem()
    ).all();
    
    const activities: string[] = [];
    for (let i = 0; i < Math.min(limit, items.length); i++) {
      const text = await items[i].textContent();
      if (text) activities.push(text);
    }
    return activities;
  }
}