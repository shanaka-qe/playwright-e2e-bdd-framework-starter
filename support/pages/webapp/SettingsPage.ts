/**
 * Settings Page Object
 * 
 * Handles all interactions with the webapp settings page
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { BasePage } from '../BasePage';

export class SettingsPage extends BasePage {
  public profileSection: Locator;
  public preferencesSection: Locator;
  public saveButton: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.profileSection = this.page.locator('[data-testid="profile-section"]');
    this.preferencesSection = this.page.locator('[data-testid="preferences-section"]');
    this.saveButton = this.roleBasedLocators.button('Save Settings');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/settings');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.profileSection).toBeVisible();
  }
}