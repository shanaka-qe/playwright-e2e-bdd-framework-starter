/**
 * System Monitoring Page Object
 * 
 * Handles all interactions with the admin app system monitoring page
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { BasePage } from '../BasePage';

export class SystemMonitoringPage extends BasePage {
  public metricsPanel: Locator;
  public serviceStatus: Locator;
  public alertsSection: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.metricsPanel = this.page.locator('[data-testid="metrics-panel"]');
    this.serviceStatus = this.page.locator('[data-testid="service-status"]');
    this.alertsSection = this.page.locator('[data-testid="alerts-section"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/admin/monitoring');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.metricsPanel).toBeVisible();
    await expect(this.serviceStatus).toBeVisible();
  }
}