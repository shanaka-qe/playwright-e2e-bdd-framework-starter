import { test as base, createBdd } from 'playwright-bdd';
import { Browser, Page, BrowserContext } from '@playwright/test';
import { TestWorld } from '../support/world/TestWorld';
import { NavigationHelper } from '../support/helpers/NavigationHelper';
import { RoleBasedLocators } from '../support/helpers/RoleBasedLocators';
import { SidebarComponent } from '../support/components/SidebarComponent';

// Define custom test fixtures
export const test = base.extend<{
  testWorld: TestWorld;
  navigationHelper: NavigationHelper;
  roleBasedLocators: RoleBasedLocators;
  sidebarComponent: SidebarComponent;
}>({
  testWorld: async ({ page, browser, context }, use) => {
    const world = new TestWorld();
    world.page = page;
    world.browser = browser;
    world.context = context;
    await use(world);
  },
  
  navigationHelper: async ({ page }, use) => {
    const helper = new NavigationHelper(page);
    await use(helper);
  },
  
  roleBasedLocators: async ({ page }, use) => {
    const locators = new RoleBasedLocators(page);
    await use(locators);
  },
  
  sidebarComponent: async ({ page }, use) => {
    const component = new SidebarComponent(page);
    await use(component);
  },
});

export const { Given, When, Then } = createBdd(test);