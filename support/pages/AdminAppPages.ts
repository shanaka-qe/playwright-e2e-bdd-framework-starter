/**
 * Admin App Page Objects
 * 
 * Container for all admin app page objects following the Page Object Model pattern
 */

import { Page } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';
import { AdminDashboardPage } from './adminapp/AdminDashboardPage';
import { UserManagementPage } from './adminapp/UserManagementPage';
import { SystemLogsPage } from './adminapp/SystemLogsPage';
import { SystemMonitoringPage } from './adminapp/SystemMonitoringPage';

export class AdminAppPages {
  public dashboardPage: AdminDashboardPage;
  public userManagementPage: UserManagementPage;
  public systemLogsPage: SystemLogsPage;
  public systemMonitoringPage: SystemMonitoringPage;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    this.dashboardPage = new AdminDashboardPage(page, roleBasedLocators);
    this.userManagementPage = new UserManagementPage(page, roleBasedLocators);
    this.systemLogsPage = new SystemLogsPage(page, roleBasedLocators);
    this.systemMonitoringPage = new SystemMonitoringPage(page, roleBasedLocators);
  }
}