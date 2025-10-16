/**
 * Role-Based Locators Helper
 * 
 * Provides semantic, accessibility-focused element location methods
 * Uses ARIA roles and semantic HTML for more reliable test automation
 */

import { Page, Locator } from '@playwright/test';

export class RoleBasedLocators {
  constructor(private page: Page) {}

  /**
   * Locate button elements by accessible name
   */
  button(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate exact button match
   */
  buttonExact(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  /**
   * Locate link elements by accessible name
   */
  link(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate exact link match
   */
  linkExact(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  /**
   * Locate text input fields by label or placeholder
   */
  textbox(name: string): Locator {
    return this.page.getByRole('textbox', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate text input by label text
   */
  textboxByLabel(labelText: string): Locator {
    return this.page.getByLabel(new RegExp(labelText, 'i'));
  }

  /**
   * Locate text input by placeholder
   */
  textboxByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(new RegExp(placeholder, 'i'));
  }

  /**
   * Locate checkbox elements
   */
  checkbox(name: string): Locator {
    return this.page.getByRole('checkbox', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate radio button elements
   */
  radio(name: string): Locator {
    return this.page.getByRole('radio', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate combobox/select elements
   */
  combobox(name: string): Locator {
    return this.page.getByRole('combobox', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate listbox elements
   */
  listbox(name: string): Locator {
    return this.page.getByRole('listbox', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate tab elements
   */
  tab(name: string): Locator {
    return this.page.getByRole('tab', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate tabpanel elements
   */
  tabpanel(name: string): Locator {
    return this.page.getByRole('tabpanel', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate dialog/modal elements
   */
  dialog(name?: string): Locator {
    if (name) {
      return this.page.getByRole('dialog', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('dialog');
  }

  /**
   * Locate alert elements
   */
  alert(name?: string): Locator {
    if (name) {
      return this.page.getByRole('alert', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('alert');
  }

  /**
   * Locate heading elements by level and text
   */
  heading(text: string, level?: number): Locator {
    const options: any = { name: new RegExp(text, 'i') };
    if (level) {
      options.level = level;
    }
    return this.page.getByRole('heading', options);
  }

  /**
   * Locate table elements
   */
  table(name?: string): Locator {
    if (name) {
      return this.page.getByRole('table', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('table');
  }

  /**
   * Locate table row elements
   */
  row(name?: string): Locator {
    if (name) {
      return this.page.getByRole('row', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('row');
  }

  /**
   * Locate table cell elements
   */
  cell(name: string): Locator {
    return this.page.getByRole('cell', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate columnheader elements
   */
  columnheader(name: string): Locator {
    return this.page.getByRole('columnheader', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate navigation elements
   */
  navigation(name?: string): Locator {
    if (name) {
      return this.page.getByRole('navigation', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('navigation');
  }

  /**
   * Locate main content area
   */
  main(): Locator {
    return this.page.getByRole('main');
  }

  /**
   * Locate banner/header elements
   */
  banner(): Locator {
    return this.page.getByRole('banner');
  }

  /**
   * Locate contentinfo/footer elements
   */
  contentinfo(): Locator {
    return this.page.getByRole('contentinfo');
  }

  /**
   * Locate complementary/sidebar elements
   */
  complementary(name?: string): Locator {
    if (name) {
      return this.page.getByRole('complementary', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('complementary');
  }

  /**
   * Locate list elements
   */
  list(name?: string): Locator {
    if (name) {
      return this.page.getByRole('list', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('list');
  }

  /**
   * Locate listitem elements
   */
  listitem(name?: string): Locator {
    if (name) {
      return this.page.getByRole('listitem', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('listitem');
  }

  /**
   * Locate article elements
   */
  article(name?: string): Locator {
    if (name) {
      return this.page.getByRole('article', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('article');
  }

  /**
   * Locate section elements
   */
  section(name?: string): Locator {
    if (name) {
      return this.page.getByRole('region', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('region');
  }

  /**
   * Locate form elements
   */
  form(name?: string): Locator {
    if (name) {
      return this.page.getByRole('form', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('form');
  }

  /**
   * Locate search input elements
   */
  searchbox(name?: string): Locator {
    if (name) {
      return this.page.getByRole('searchbox', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('searchbox');
  }

  /**
   * Locate progress bar elements
   */
  progressbar(name?: string): Locator {
    if (name) {
      return this.page.getByRole('progressbar', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('progressbar');
  }

  /**
   * Locate status elements
   */
  status(name?: string): Locator {
    if (name) {
      return this.page.getByRole('status', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('status');
  }

  /**
   * Generic role locator for custom roles
   */
  role(roleName: string, name?: string): Locator {
    const options: any = {};
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(roleName as any, options);
  }

  /**
   * Fallback to data-testid when role-based approach is not possible
   */
  testId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Locate element by text content (as last resort)
   */
  text(text: string, exact: boolean = false): Locator {
    if (exact) {
      return this.page.getByText(text, { exact: true });
    }
    return this.page.getByText(new RegExp(text, 'i'));
  }

  /**
   * Locate element by aria-label
   */
  ariaLabel(label: string): Locator {
    return this.page.locator(`[aria-label*="${label}" i]`);
  }

  /**
   * Locate element by aria-labelledby
   */
  ariaLabelledBy(id: string): Locator {
    return this.page.locator(`[aria-labelledby="${id}"]`);
  }

  /**
   * Locate element by aria-describedby
   */
  ariaDescribedBy(id: string): Locator {
    return this.page.locator(`[aria-describedby="${id}"]`);
  }

  // ============= Enhanced Semantic Locators =============

  /**
   * Locate menu elements
   */
  menu(name?: string): Locator {
    if (name) {
      return this.page.getByRole('menu', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('menu');
  }

  /**
   * Locate menuitem elements
   */
  menuitem(name: string): Locator {
    return this.page.getByRole('menuitem', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate menubar elements
   */
  menubar(name?: string): Locator {
    if (name) {
      return this.page.getByRole('menubar', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('menubar');
  }

  /**
   * Locate toolbar elements
   */
  toolbar(name?: string): Locator {
    if (name) {
      return this.page.getByRole('toolbar', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('toolbar');
  }

  /**
   * Locate tooltip elements
   */
  tooltip(name?: string): Locator {
    if (name) {
      return this.page.getByRole('tooltip', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('tooltip');
  }

  /**
   * Locate tree elements
   */
  tree(name?: string): Locator {
    if (name) {
      return this.page.getByRole('tree', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('tree');
  }

  /**
   * Locate treeitem elements
   */
  treeitem(name: string): Locator {
    return this.page.getByRole('treeitem', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate grid elements
   */
  grid(name?: string): Locator {
    if (name) {
      return this.page.getByRole('grid', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('grid');
  }

  /**
   * Locate gridcell elements
   */
  gridcell(name: string): Locator {
    return this.page.getByRole('gridcell', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate separator elements
   */
  separator(): Locator {
    return this.page.getByRole('separator');
  }

  /**
   * Locate slider elements
   */
  slider(name: string): Locator {
    return this.page.getByRole('slider', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate spinbutton elements
   */
  spinbutton(name: string): Locator {
    return this.page.getByRole('spinbutton', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate switch elements
   */
  switch(name: string): Locator {
    return this.page.getByRole('switch', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate image elements
   */
  image(name: string): Locator {
    return this.page.getByRole('img', { name: new RegExp(name, 'i') });
  }

  /**
   * Locate application elements
   */
  application(name?: string): Locator {
    if (name) {
      return this.page.getByRole('application', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('application');
  }

  /**
   * Locate group elements
   */
  group(name?: string): Locator {
    if (name) {
      return this.page.getByRole('group', { name: new RegExp(name, 'i') });
    }
    return this.page.getByRole('group');
  }

  /**
   * Locate radiogroup elements
   */
  radiogroup(name: string): Locator {
    return this.page.getByRole('radiogroup', { name: new RegExp(name, 'i') });
  }

  // ============= Complex UI Pattern Locators =============

  /**
   * Locate card components (common UI pattern)
   */
  card(heading?: string): Locator {
    if (heading) {
      return this.page.locator(`[role="article"]:has(h2:text-is("${heading}")), [role="region"]:has(h2:text-is("${heading}")), .card:has-text("${heading}")`);
    }
    return this.page.locator('[role="article"], [role="region"], .card');
  }

  /**
   * Locate dropdown menu by trigger button
   */
  dropdown(triggerName: string): Locator {
    return this.page.locator(`[role="button"]:text-is("${triggerName}")`)
      .locator('..')
      .locator('[role="menu"], [role="listbox"]');
  }

  /**
   * Locate expandable/collapsible sections
   */
  expandable(name: string): Locator {
    return this.page.locator(`[aria-expanded]:has-text("${name}")`);
  }

  /**
   * Locate badge/chip elements
   */
  badge(text: string): Locator {
    return this.page.locator(`[role="status"]:text-is("${text}"), .badge:text-is("${text}"), .chip:text-is("${text}")`);
  }

  /**
   * Locate notification/toast elements
   */
  notification(text?: string): Locator {
    if (text) {
      return this.page.locator(`[role="alert"]:has-text("${text}"), [role="status"]:has-text("${text}"), .notification:has-text("${text}")`);
    }
    return this.page.locator('[role="alert"], [role="status"], .notification');
  }

  // ============= Accessibility State Locators =============

  /**
   * Locate disabled elements
   */
  disabled(role: string, name?: string): Locator {
    const options: any = { disabled: true };
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(role as any, options);
  }

  /**
   * Locate selected elements
   */
  selected(role: string, name?: string): Locator {
    const options: any = { selected: true };
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(role as any, options);
  }

  /**
   * Locate checked elements
   */
  checked(role: string, name?: string): Locator {
    const options: any = { checked: true };
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(role as any, options);
  }

  /**
   * Locate pressed/toggled elements
   */
  pressed(role: string, name?: string): Locator {
    const options: any = { pressed: true };
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(role as any, options);
  }

  /**
   * Locate expanded elements
   */
  expanded(role: string, name?: string): Locator {
    const options: any = { expanded: true };
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return this.page.getByRole(role as any, options);
  }

  // ============= Validation and Debugging =============

  /**
   * Get all elements matching a role for debugging
   */
  async getAllByRole(role: string): Promise<string[]> {
    const elements = await this.page.getByRole(role as any).all();
    const names: string[] = [];
    
    for (const element of elements) {
      const name = await element.getAttribute('aria-label') || 
                   await element.textContent() || 
                   'unnamed';
      names.push(name.trim());
    }
    
    return names;
  }

  /**
   * Check if element has proper accessibility attributes
   */
  async hasAccessibilityAttributes(locator: Locator): Promise<boolean> {
    const ariaLabel = await locator.getAttribute('aria-label');
    const ariaLabelledBy = await locator.getAttribute('aria-labelledby');
    const role = await locator.getAttribute('role');
    const title = await locator.getAttribute('title');
    
    return !!(ariaLabel || ariaLabelledBy || role || title);
  }

  /**
   * Get accessibility tree for element
   */
  async getAccessibilityTree(locator: Locator): Promise<any> {
    return await locator.evaluate(element => {
      const tree: any = {
        role: element.getAttribute('role') || element.tagName.toLowerCase(),
        name: element.getAttribute('aria-label') || element.textContent?.trim(),
        level: element.getAttribute('aria-level'),
        expanded: element.getAttribute('aria-expanded'),
        selected: element.getAttribute('aria-selected'),
        checked: element.getAttribute('aria-checked'),
        disabled: element.getAttribute('aria-disabled') || element.hasAttribute('disabled'),
        required: element.getAttribute('aria-required') || element.hasAttribute('required'),
        invalid: element.getAttribute('aria-invalid')
      };
      
      // Remove null/undefined values
      Object.keys(tree).forEach(key => {
        if (tree[key] === null || tree[key] === undefined) {
          delete tree[key];
        }
      });
      
      return tree;
    });
  }

  // ============= Composite Locators =============

  /**
   * Locate element within a specific container
   */
  within(containerLocator: Locator, role: string, name?: string): Locator {
    const options: any = {};
    if (name) {
      options.name = new RegExp(name, 'i');
    }
    return containerLocator.getByRole(role as any, options);
  }

  /**
   * Locate element by multiple attributes
   */
  byAttributes(attributes: Record<string, string>): Locator {
    const selectors = Object.entries(attributes)
      .map(([key, value]) => `[${key}="${value}"]`)
      .join('');
    return this.page.locator(selectors);
  }

  /**
   * Create chained locator for complex selections
   */
  chain(...locators: Array<(loc: Locator) => Locator>): Locator {
    return locators.reduce((current, next) => next(current), this.page.locator('body'));
  }
}