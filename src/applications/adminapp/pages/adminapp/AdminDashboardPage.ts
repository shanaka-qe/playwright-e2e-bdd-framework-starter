/**
 * Admin Dashboard Page Object
 * 
 * Handles all interactions with the admin app dashboard page
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { BasePage } from '../BasePage';

export class AdminDashboardPage extends BasePage {
  public systemOverview: Locator;
  public userStats: Locator;
  public activityLog: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.systemOverview = this.page.locator('[data-testid="system-overview"]');
    this.userStats = this.page.locator('[data-testid="user-stats"]');
    this.activityLog = this.page.locator('[data-testid="activity-log"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/admin/dashboard');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.systemOverview).toBeVisible();
  }
}