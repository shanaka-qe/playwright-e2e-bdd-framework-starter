/**
 * Dashboard Page Object
 * 
 * Handles all interactions with the webapp dashboard page
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  public welcomeMessage: Locator;
  public navigationTabs: Locator;
  public recentDocuments: Locator;
  public quickActions: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.welcomeMessage = this.page.locator('[data-testid="welcome-message"]');
    this.navigationTabs = this.roleBasedLocators.navigation('Main Navigation');
    this.recentDocuments = this.page.locator('[data-testid="recent-documents"]');
    this.quickActions = this.page.locator('[data-testid="quick-actions"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.navigationTabs).toBeVisible();
  }
}