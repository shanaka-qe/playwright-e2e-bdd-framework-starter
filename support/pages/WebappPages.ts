/**
 * Webapp Page Objects
 * 
 * Container for all webapp page objects following the Page Object Model pattern
 */

import { Page } from '@playwright/test';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';
import { LoginPage } from './webapp/LoginPage';
import { DashboardPage } from './webapp/DashboardPage';
import { DocumentHubPage } from './webapp/DocumentHubPage';
import { FeatureGeneratorPage } from './webapp/FeatureGeneratorPage';
import { SettingsPage } from './webapp/SettingsPage';

export class WebappPages {
  public loginPage: LoginPage;
  public dashboardPage: DashboardPage;
  public documentHubPage: DocumentHubPage;
  public featureGeneratorPage: FeatureGeneratorPage;
  public settingsPage: SettingsPage;

  constructor(page: Page, roleBasedLocators: RoleBasedLocators) {
    this.loginPage = new LoginPage(page, roleBasedLocators);
    this.dashboardPage = new DashboardPage(page, roleBasedLocators);
    this.documentHubPage = new DocumentHubPage(page, roleBasedLocators);
    this.featureGeneratorPage = new FeatureGeneratorPage(page, roleBasedLocators);
    this.settingsPage = new SettingsPage(page, roleBasedLocators);
  }
}