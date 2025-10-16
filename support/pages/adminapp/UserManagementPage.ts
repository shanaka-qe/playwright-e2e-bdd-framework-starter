/**
 * User Management Page Object
 * 
 * Handles all interactions with the admin app user management page
 */

import { Page, Locator, expect } from '@playwright/test';
import { RoleBasedLocators } from '../../helpers/RoleBasedLocators';
import { BasePage } from '../BasePage';

export class UserManagementPage extends BasePage {
  public userTable: Locator;
  public addUserButton: Locator;
  public searchInput: Locator;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    super(page, roleBasedLocators);
    this.initializeElements();
  }

  private initializeElements(): void {
    this.userTable = this.roleBasedLocators.table('Users');
    this.addUserButton = this.roleBasedLocators.button('Add User');
    this.searchInput = this.roleBasedLocators.searchbox('Search users');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/admin/users');
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await expect(this.userTable).toBeVisible();
  }
}